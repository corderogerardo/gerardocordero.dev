//! Argon2id password hashing. Hashing is CPU-bound, so every call is moved to
//! the blocking pool — a login burst must never stall the async runtime.

use argon2::{
    Argon2,
    password_hash::{PasswordHasher, PasswordVerifier, phc::PasswordHash},
};

use super::AuthError;
use crate::domain::validation::ValidationError;

pub const MIN_PASSWORD_LEN: usize = 12;
const MAX_PASSWORD_LEN: usize = 128;
const COMMON_PASSWORDS: [&str; 5] = [
    "password1234",
    "123456789012",
    "qwertyuiop12",
    "letmein12345",
    "passwordpassword",
];

pub async fn hash_password(password: String) -> Result<String, AuthError> {
    tokio::task::spawn_blocking(move || hash_password_blocking(&password))
        .await
        .map_err(|_| AuthError::HashingUnavailable)?
}

pub async fn verify_password(password: String, hash: String) -> bool {
    tokio::task::spawn_blocking(move || verify_password_blocking(&password, &hash))
        .await
        .unwrap_or(false)
}

fn hash_password_blocking(password: &str) -> Result<String, AuthError> {
    Argon2::default()
        .hash_password(password.as_bytes())
        .map(|hash| hash.to_string())
        .map_err(|_| AuthError::HashingUnavailable)
}

fn verify_password_blocking(password: &str, hash: &str) -> bool {
    let Ok(parsed) = PasswordHash::new(hash) else {
        return false;
    };

    Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok()
}

/// Length-first policy (NIST SP 800-63B): no composition rules, but a real
/// minimum, a ceiling, and a small deny-list of passwords that are on every
/// credential-stuffing list.
pub fn validate_password(password: &str, email: &str) -> Result<(), ValidationError> {
    let length = password.chars().count();

    if length < MIN_PASSWORD_LEN {
        return Err(ValidationError::new(
            "password",
            format!("must be at least {MIN_PASSWORD_LEN} characters"),
        ));
    }
    if length > MAX_PASSWORD_LEN {
        return Err(ValidationError::new(
            "password",
            format!("must be at most {MAX_PASSWORD_LEN} characters"),
        ));
    }
    if password.trim() != password || password.is_empty() {
        return Err(ValidationError::new(
            "password",
            "must not start or end with whitespace",
        ));
    }
    if password.eq_ignore_ascii_case(email) {
        return Err(ValidationError::new(
            "password",
            "must not be the same as your email",
        ));
    }
    if COMMON_PASSWORDS
        .iter()
        .any(|common| password.eq_ignore_ascii_case(common))
    {
        return Err(ValidationError::new(
            "password",
            "is too common; choose something unique",
        ));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_a_long_passphrase() {
        assert!(validate_password("correct horse battery staple", "a@b.com").is_ok());
    }

    #[test]
    fn rejects_short_passwords() {
        let error = validate_password("short", "a@b.com").expect_err("too short");
        assert_eq!(error.field, "password");
    }

    #[test]
    fn rejects_the_email_as_password() {
        assert!(validate_password("trader@example.com", "trader@example.com").is_err());
    }

    #[test]
    fn rejects_common_passwords() {
        assert!(validate_password("password1234", "a@b.com").is_err());
    }

    #[test]
    fn rejects_surrounding_whitespace() {
        assert!(validate_password(" padded password ", "a@b.com").is_err());
    }

    #[tokio::test]
    async fn hashes_and_verifies_a_password() {
        let hash = hash_password("correct horse battery staple".to_string())
            .await
            .expect("hash");

        assert!(hash.starts_with("$argon2id$"));
        assert!(verify_password("correct horse battery staple".to_string(), hash.clone()).await);
        assert!(!verify_password("wrong password".to_string(), hash).await);
    }

    #[tokio::test]
    async fn malformed_hashes_never_verify() {
        assert!(!verify_password("whatever".to_string(), "not-a-phc-hash".to_string()).await);
    }

    #[tokio::test]
    async fn hashes_are_salted_per_password() {
        let first = hash_password("correct horse battery staple".to_string())
            .await
            .expect("hash");
        let second = hash_password("correct horse battery staple".to_string())
            .await
            .expect("hash");

        assert_ne!(first, second);
    }
}
