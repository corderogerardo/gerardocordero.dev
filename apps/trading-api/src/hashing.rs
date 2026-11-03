//! Small, auditable helpers for token material and idempotency fingerprints.

use std::fmt::Write;

use sha2::{Digest, Sha256};
use uuid::Uuid;

/// Lowercase hex SHA-256. Used to store refresh tokens and idempotency
/// fingerprints so a database leak cannot be replayed directly.
pub fn sha256_hex(input: &str) -> String {
    let digest = Sha256::digest(input.as_bytes());
    let bytes: &[u8] = digest.as_ref();
    let mut output = String::with_capacity(64);

    for byte in bytes {
        // Writing to a String is infallible.
        let _ = write!(output, "{byte:02x}");
    }

    output
}

/// 256 bits of entropy, URL-safe, with a prefix that makes it recognizable in
/// logs and support conversations (the raw value is never logged).
pub fn generate_refresh_token() -> String {
    format!("rt_{}{}", Uuid::new_v4().simple(), Uuid::new_v4().simple())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sha256_matches_the_known_vector() {
        assert_eq!(
            sha256_hex("abc"),
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
    }

    #[test]
    fn sha256_is_stable_and_distinct() {
        assert_eq!(sha256_hex("order:1"), sha256_hex("order:1"));
        assert_ne!(sha256_hex("order:1"), sha256_hex("order:2"));
    }

    #[test]
    fn refresh_tokens_have_full_entropy_and_a_prefix() {
        let token = generate_refresh_token();

        assert!(token.starts_with("rt_"));
        assert_eq!(token.len(), 3 + 64);
        assert_ne!(token, generate_refresh_token());
    }
}
