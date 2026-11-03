pub mod jwt;
pub mod password;

use thiserror::Error;

use crate::error::AppError;

#[derive(Debug, Error, PartialEq, Eq)]
pub enum AuthError {
    #[error("invalid credentials")]
    InvalidCredentials,
    #[error("invalid or expired token")]
    InvalidToken,
    #[error("token signing failed")]
    Signing,
    #[error("password hashing is unavailable")]
    HashingUnavailable,
}

impl From<AuthError> for AppError {
    fn from(error: AuthError) -> Self {
        match error {
            AuthError::InvalidCredentials => Self::unauthorized("email or password is incorrect"),
            AuthError::InvalidToken => Self::unauthorized("invalid or expired token"),
            AuthError::Signing | AuthError::HashingUnavailable => {
                Self::internal("authentication service unavailable")
            }
        }
    }
}
