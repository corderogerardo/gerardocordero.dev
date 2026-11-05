//! Boundary validation errors. Kept free of HTTP types so domain code stays
//! testable without a server; `error.rs` maps them to the public error contract.

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ValidationError {
    pub field: &'static str,
    pub message: String,
}

impl ValidationError {
    pub fn new(field: &'static str, message: impl Into<String>) -> Self {
        Self {
            field,
            message: message.into(),
        }
    }
}

/// Email shape validation for the registration/login boundary.
pub fn validate_email(email: &str) -> Result<String, ValidationError> {
    let normalized = email.trim().to_ascii_lowercase();

    if normalized.is_empty() || normalized.len() > 254 {
        return Err(ValidationError::new("email", "must be 1-254 characters"));
    }
    if normalized.chars().any(char::is_whitespace) {
        return Err(ValidationError::new("email", "must not contain spaces"));
    }
    let mut parts = normalized.split('@');
    let (Some(local), Some(domain), None) = (parts.next(), parts.next(), parts.next()) else {
        return Err(ValidationError::new("email", "must contain exactly one @"));
    };
    if local.is_empty() || domain.is_empty() || !domain.contains('.') {
        return Err(ValidationError::new("email", "must be a valid address"));
    }
    if domain.starts_with('.') || domain.ends_with('.') {
        return Err(ValidationError::new("email", "must be a valid address"));
    }

    Ok(normalized)
}

pub fn validate_display_name(name: &str) -> Result<String, ValidationError> {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        return Err(ValidationError::new("displayName", "is required"));
    }
    if trimmed.chars().count() > 80 {
        return Err(ValidationError::new(
            "displayName",
            "must be at most 80 characters",
        ));
    }
    if trimmed.chars().any(char::is_control) {
        return Err(ValidationError::new(
            "displayName",
            "must not contain control characters",
        ));
    }

    Ok(trimmed.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalizes_a_valid_email() {
        assert_eq!(
            validate_email("  Trader@Example.COM ").expect("valid"),
            "trader@example.com"
        );
    }

    #[test]
    fn rejects_malformed_emails() {
        for email in [
            "",
            "no-at-sign",
            "two@at@example.com",
            "user@localhost",
            "user @example.com",
            "@example.com",
            "user@.com",
            "user@example.",
        ] {
            assert!(validate_email(email).is_err(), "{email} should be rejected");
        }
    }

    #[test]
    fn trims_and_validates_display_names() {
        assert_eq!(validate_display_name("  Ada  ").expect("valid"), "Ada");
        assert!(validate_display_name("   ").is_err());
        assert!(validate_display_name(&"a".repeat(81)).is_err());
    }
}
