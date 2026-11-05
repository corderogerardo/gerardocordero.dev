//! Request extractors and middleware shared by every handler.

use std::sync::Arc;

use axum::{
    Json,
    extract::{ConnectInfo, FromRequest, FromRequestParts, Request, State},
    http::{HeaderValue, StatusCode, header, request::Parts},
    middleware::Next,
    response::{IntoResponse, Response},
};
use serde::de::DeserializeOwned;
use uuid::Uuid;

use crate::{
    config::Limit,
    error::{AppError, AppResult},
    rate_limit::RateLimiter,
    state::AppState,
};

/// `ValidJson` turns every body rejection into the public error contract instead
/// of axum's plain-text rejection.
pub struct ValidJson<T>(pub T);

impl<T, S> FromRequest<S> for ValidJson<T>
where
    T: DeserializeOwned,
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request(request: Request, state: &S) -> Result<Self, Self::Rejection> {
        let Json(value) = Json::<T>::from_request(request, state)
            .await
            .map_err(|rejection| {
                if rejection.status() == StatusCode::UNPROCESSABLE_ENTITY {
                    AppError::validation("body", rejection.body_text())
                } else {
                    AppError::bad_request(rejection.body_text())
                }
            })?;

        Ok(Self(value))
    }
}

/// An authenticated caller. The token is verified on every request; there is no
/// server-side session to go stale.
pub struct AuthUser {
    pub user_id: Uuid,
}

impl FromRequestParts<AppState> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let header = parts
            .headers
            .get(header::AUTHORIZATION)
            .and_then(|value| value.to_str().ok())
            .ok_or_else(|| AppError::unauthorized("missing bearer token"))?;

        let token = header
            .strip_prefix("Bearer ")
            .ok_or_else(|| AppError::unauthorized("authorization must be `Bearer <token>`"))?;

        let user_id = state.tokens.verify(token.trim())?;

        Ok(Self { user_id })
    }
}

/// Echoes a client request id or mints one, and always returns it in the
/// response so a user can quote it to support.
pub async fn request_id(mut request: Request, next: Next) -> Response {
    let incoming = request
        .headers()
        .get("x-request-id")
        .and_then(|value| value.to_str().ok())
        .filter(|value| !value.is_empty() && value.len() <= 64)
        .map(str::to_string);
    let id = incoming.unwrap_or_else(|| Uuid::new_v4().to_string());

    request.extensions_mut().insert(RequestId(id.clone()));
    let mut response = next.run(request).await;

    if let Ok(value) = HeaderValue::from_str(&id) {
        response.headers_mut().insert("x-request-id", value);
    }

    response
}

#[derive(Debug, Clone)]
pub struct RequestId(pub String);

#[derive(Debug, Clone)]
pub struct RateLimitPolicy {
    pub scope: &'static str,
    pub limit: Limit,
}

/// Fixed-window limiter keyed by the TCP peer address. Behind a proxy the peer
/// is the proxy, so production must terminate rate limiting at the edge or add
/// trusted-forwarded-header handling (documented as a follow-up).
pub async fn rate_limit(
    State((limiter, policy)): State<(Arc<RateLimiter>, RateLimitPolicy)>,
    request: Request,
    next: Next,
) -> Response {
    let key = client_key(&request, policy.scope);

    if !limiter.check(&key, policy.limit) {
        return AppError::rate_limited(policy.limit.window.as_secs()).into_response();
    }

    next.run(request).await
}

fn client_key(request: &Request, scope: &str) -> String {
    let address = request
        .extensions()
        .get::<ConnectInfo<std::net::SocketAddr>>()
        .map(|info| info.0.ip().to_string())
        .unwrap_or_else(|| "unknown".to_string());

    format!("{scope}:{address}")
}

/// Parses the `Idempotency-Key` header at the boundary, before any work happens.
pub fn idempotency_key(headers: &axum::http::HeaderMap) -> AppResult<String> {
    let raw = headers
        .get("idempotency-key")
        .ok_or_else(|| {
            AppError::bad_request("Idempotency-Key header is required for order creation")
        })?
        .to_str()
        .map_err(|_| AppError::bad_request("Idempotency-Key must be valid ASCII"))?
        .trim();

    let valid_length = (8..=128).contains(&raw.len());
    let printable = raw.chars().all(|character| character.is_ascii_graphic());
    if !valid_length || !printable {
        return Err(AppError::bad_request(
            "Idempotency-Key must be 8-128 printable ASCII characters",
        ));
    }

    Ok(raw.to_string())
}

#[cfg(test)]
mod tests {
    use axum::http::HeaderMap;

    use super::*;

    #[test]
    fn idempotency_key_is_required() {
        let error = idempotency_key(&HeaderMap::new()).expect_err("missing header");
        assert!(matches!(
            error,
            AppError::Api {
                code: "BAD_REQUEST",
                ..
            }
        ));
    }

    #[test]
    fn idempotency_key_rejects_short_or_spaced_values() {
        for value in ["short", "has space", "tab\there"] {
            let mut headers = HeaderMap::new();
            headers.insert("idempotency-key", value.parse().expect("header value"));
            assert!(idempotency_key(&headers).is_err(), "{value}");
        }
    }

    #[test]
    fn idempotency_key_accepts_a_uuid() {
        let mut headers = HeaderMap::new();
        let value = Uuid::new_v4().to_string();
        headers.insert("idempotency-key", value.parse().expect("header value"));

        assert_eq!(idempotency_key(&headers).expect("valid key"), value);
    }
}
