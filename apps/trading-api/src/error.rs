//! One error contract for every endpoint: a stable machine-readable `code`, a
//! human-readable `message`, and an optional `details.field` for form mapping.
//! Internal failures are logged and never leak database or crypto messages.

use axum::{
    Json,
    http::{HeaderValue, StatusCode, header},
    response::{IntoResponse, Response},
};
use serde_json::json;
use thiserror::Error;

use crate::domain::validation::ValidationError;

pub type AppResult<T> = Result<T, AppError>;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("{message}")]
    Api {
        status: StatusCode,
        code: &'static str,
        message: String,
        field: Option<&'static str>,
        retry_after_seconds: Option<u64>,
    },
    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("internal error: {0}")]
    Internal(String),
}

impl AppError {
    pub fn validation(field: &'static str, message: impl Into<String>) -> Self {
        Self::Api {
            status: StatusCode::UNPROCESSABLE_ENTITY,
            code: "VALIDATION_ERROR",
            message: message.into(),
            field: Some(field),
            retry_after_seconds: None,
        }
    }

    pub fn bad_request(message: impl Into<String>) -> Self {
        Self::Api {
            status: StatusCode::BAD_REQUEST,
            code: "BAD_REQUEST",
            message: message.into(),
            field: None,
            retry_after_seconds: None,
        }
    }

    pub fn unauthorized(message: impl Into<String>) -> Self {
        Self::Api {
            status: StatusCode::UNAUTHORIZED,
            code: "UNAUTHORIZED",
            message: message.into(),
            field: None,
            retry_after_seconds: None,
        }
    }

    pub fn forbidden(message: impl Into<String>) -> Self {
        Self::Api {
            status: StatusCode::FORBIDDEN,
            code: "FORBIDDEN",
            message: message.into(),
            field: None,
            retry_after_seconds: None,
        }
    }

    pub fn not_found(message: impl Into<String>) -> Self {
        Self::Api {
            status: StatusCode::NOT_FOUND,
            code: "NOT_FOUND",
            message: message.into(),
            field: None,
            retry_after_seconds: None,
        }
    }

    pub fn conflict(code: &'static str, message: impl Into<String>) -> Self {
        Self::Api {
            status: StatusCode::CONFLICT,
            code,
            message: message.into(),
            field: None,
            retry_after_seconds: None,
        }
    }

    pub fn unprocessable(
        code: &'static str,
        message: impl Into<String>,
        field: Option<&'static str>,
    ) -> Self {
        Self::Api {
            status: StatusCode::UNPROCESSABLE_ENTITY,
            code,
            message: message.into(),
            field,
            retry_after_seconds: None,
        }
    }

    pub fn idempotency_key_reused(message: impl Into<String>) -> Self {
        Self::Api {
            status: StatusCode::UNPROCESSABLE_ENTITY,
            code: "IDEMPOTENCY_KEY_REUSED",
            message: message.into(),
            field: None,
            retry_after_seconds: None,
        }
    }

    pub fn rate_limited(retry_after_seconds: u64) -> Self {
        Self::Api {
            status: StatusCode::TOO_MANY_REQUESTS,
            code: "RATE_LIMITED",
            message: "too many requests; retry later".to_string(),
            field: None,
            retry_after_seconds: Some(retry_after_seconds),
        }
    }

    pub fn internal(message: impl Into<String>) -> Self {
        Self::Internal(message.into())
    }
}

impl From<ValidationError> for AppError {
    fn from(error: ValidationError) -> Self {
        Self::validation(error.field, error.message)
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, message, field, retry_after) = match self {
            Self::Api {
                status,
                code,
                message,
                field,
                retry_after_seconds,
            } => (status, code, message, field, retry_after_seconds),
            Self::Database(error) => {
                tracing::error!(error = %error, "database operation failed");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "INTERNAL_ERROR",
                    "internal server error".to_string(),
                    None,
                    None,
                )
            }
            Self::Internal(message) => {
                tracing::error!(error = %message, "internal operation failed");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "INTERNAL_ERROR",
                    "internal server error".to_string(),
                    None,
                    None,
                )
            }
        };

        let details = field.map(|field| json!({ "field": field }));
        let body = json!({
            "error": {
                "code": code,
                "message": message,
                "details": details,
            }
        });

        let mut response = (status, Json(body)).into_response();
        if let Some(seconds) = retry_after
            && let Ok(value) = HeaderValue::from_str(&seconds.to_string())
        {
            response.headers_mut().insert(header::RETRY_AFTER, value);
        }
        response
    }
}

#[cfg(test)]
mod tests {
    use axum::body::to_bytes;

    use super::*;

    async fn body_json(response: Response) -> serde_json::Value {
        let bytes = to_bytes(response.into_body(), 16 * 1024)
            .await
            .expect("body bytes");
        serde_json::from_slice(&bytes).expect("json body")
    }

    #[tokio::test]
    async fn validation_error_carries_field_details() {
        let response =
            AppError::validation("quantity", "must be greater than zero").into_response();
        assert_eq!(response.status(), StatusCode::UNPROCESSABLE_ENTITY);

        let body = body_json(response).await;
        assert_eq!(body["error"]["code"], "VALIDATION_ERROR");
        assert_eq!(body["error"]["details"]["field"], "quantity");
    }

    #[tokio::test]
    async fn database_errors_do_not_leak_internals() {
        let response = AppError::internal("relation users does not exist").into_response();
        assert_eq!(response.status(), StatusCode::INTERNAL_SERVER_ERROR);

        let body = body_json(response).await;
        assert_eq!(body["error"]["code"], "INTERNAL_ERROR");
        assert_eq!(body["error"]["message"], "internal server error");
        assert!(!body.to_string().contains("relation users"));
    }

    #[tokio::test]
    async fn rate_limited_sets_retry_after() {
        let response = AppError::rate_limited(30).into_response();
        assert_eq!(response.status(), StatusCode::TOO_MANY_REQUESTS);
        assert_eq!(response.headers()[header::RETRY_AFTER], "30");
    }

    #[tokio::test]
    async fn conflict_keeps_its_stable_code() {
        let response =
            AppError::conflict("EMAIL_TAKEN", "that email is already registered").into_response();
        assert_eq!(response.status(), StatusCode::CONFLICT);

        let body = body_json(response).await;
        assert_eq!(body["error"]["code"], "EMAIL_TAKEN");
    }
}
