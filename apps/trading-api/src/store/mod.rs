//! SQL lives here and nowhere else. Handlers compose these functions inside
//! transactions; nothing above this layer writes a query.

pub mod accounts;
pub mod audit;
pub mod idempotency;
pub mod instruments;
pub mod orders;
pub mod positions;
pub mod refresh_tokens;
pub mod trades;
pub mod users;

use sqlx::{Error, postgres::PgDatabaseError};

/// Postgres unique violation, dialect-agnostic through sqlx's error kind. Used
/// to turn a race into a clear 409 instead of a 500.
pub fn is_unique_violation(error: &Error) -> bool {
    error
        .as_database_error()
        .is_some_and(|database_error| database_error.is_unique_violation())
}

pub fn constraint_name(error: &Error) -> Option<&str> {
    error
        .as_database_error()?
        .try_downcast_ref::<PgDatabaseError>()?
        .constraint()
}
