mod common;

use std::time::Duration;

use common::*;
use reqwest::StatusCode;
use serde_json::json;
use sqlx::Row;
use trading_api::config::{Limit, RateLimitConfig};

#[tokio::test]
async fn protected_endpoints_require_authentication() {
    let app = spawn().await;

    for path in ["/v1/me", "/v1/portfolio", "/v1/orders"] {
        let response = app.get(path, None).await;
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED, "{path}");
    }

    let public = app.get("/v1/markets", None).await;
    assert_eq!(public.status(), StatusCode::OK);

    let unauthenticated_order = app
        .post_idempotent(
            "/v1/orders",
            "",
            "unauthenticated-order-key",
            order_body("AAPL", "BUY", "MARKET", "1"),
        )
        .await;
    assert_eq!(
        unauthenticated_order.status(),
        StatusCode::UNAUTHORIZED,
        "an empty bearer token must not authenticate"
    );
}

#[tokio::test]
async fn order_creation_requires_an_idempotency_key() {
    let app = spawn().await;
    let session = app.register().await;

    let response = app
        .post(
            "/v1/orders",
            Some(&session.access_token),
            order_body("AAPL", "BUY", "MARKET", "1"),
        )
        .await;

    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
    let body = body(response).await;
    assert_eq!(body["error"]["code"], "BAD_REQUEST");
    assert!(
        body["error"]["message"]
            .as_str()
            .expect("message")
            .contains("Idempotency-Key")
    );
}

#[tokio::test]
async fn replaying_a_key_returns_the_same_order_without_side_effects() {
    let app = spawn().await;
    let session = app.register().await;
    let key = "replay-me-exactly-once-key";
    let order = order_body("AAPL", "BUY", "MARKET", "1");

    let first = app
        .post_idempotent("/v1/orders", &session.access_token, key, order.clone())
        .await;
    assert_eq!(first.status(), StatusCode::CREATED);
    let first = body(first).await;

    let replay = app
        .post_idempotent("/v1/orders", &session.access_token, key, order)
        .await;
    assert_eq!(replay.status(), StatusCode::OK);
    let replay = body(replay).await;

    assert_eq!(first["id"], replay["id"]);

    let user_id: uuid::Uuid = session.user_id.parse().expect("uuid");
    let order_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM orders WHERE user_id = $1")
        .bind(user_id)
        .fetch_one(&app.pool)
        .await
        .expect("count orders");
    assert_eq!(order_count, 1, "a replay must not create a second order");

    let trade_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM trades WHERE user_id = $1")
        .bind(user_id)
        .fetch_one(&app.pool)
        .await
        .expect("count trades");
    assert_eq!(trade_count, 1, "a replay must not execute a second trade");
}

#[tokio::test]
async fn reusing_a_key_with_a_different_payload_fails_loudly() {
    let app = spawn().await;
    let session = app.register().await;
    let key = "same-key-different-intent";

    let first = app
        .post_idempotent(
            "/v1/orders",
            &session.access_token,
            key,
            order_body("AAPL", "BUY", "MARKET", "1"),
        )
        .await;
    assert_eq!(first.status(), StatusCode::CREATED);

    let changed = app
        .post_idempotent(
            "/v1/orders",
            &session.access_token,
            key,
            order_body("AAPL", "BUY", "MARKET", "2"),
        )
        .await;

    assert_eq!(changed.status(), StatusCode::UNPROCESSABLE_ENTITY);
    let body = body(changed).await;
    assert_eq!(body["error"]["code"], "IDEMPOTENCY_KEY_REUSED");
}

#[tokio::test]
async fn sql_injection_attempts_are_validated_and_leave_the_schema_intact() {
    let app = spawn().await;
    let session = app.register().await;

    let attack = "'; DROP TABLE users; --";
    let response = app
        .post_idempotent(
            "/v1/orders",
            &session.access_token,
            "sql-injection-probe-key",
            order_body(attack, "BUY", "MARKET", "1"),
        )
        .await;

    assert_eq!(response.status(), StatusCode::UNPROCESSABLE_ENTITY);
    assert_eq!(body(response).await["error"]["details"]["field"], "symbol");

    // The table is still there and still enforces invariants.
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
        .fetch_one(&app.pool)
        .await
        .expect("users table still exists");
    assert!(count >= 1);

    let injected_email = app
        .post(
            "/v1/auth/register",
            None,
            json!({
                "email": "'; DROP TABLE users; --@example.test",
                "password": "correct horse battery staple",
                "displayName": "Mallory",
            }),
        )
        .await;
    assert_eq!(injected_email.status(), StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn auth_rate_limit_returns_429_with_retry_after() {
    let app = spawn_with(RateLimitConfig {
        auth: Limit::new(2, Duration::from_secs(60)),
        orders: Limit::new(1_000_000, Duration::from_secs(60)),
        global: Limit::new(1_000_000, Duration::from_secs(60)),
    })
    .await;

    let first = app.login("nobody@example.test", "wrong password").await;
    let second = app.login("nobody@example.test", "wrong password").await;
    let third = app.login("nobody@example.test", "wrong password").await;

    assert_eq!(first.status(), StatusCode::UNAUTHORIZED);
    assert_eq!(second.status(), StatusCode::UNAUTHORIZED);
    assert_eq!(third.status(), StatusCode::TOO_MANY_REQUESTS);
    assert_eq!(
        third
            .headers()
            .get("retry-after")
            .and_then(|value| value.to_str().ok()),
        Some("60")
    );

    let body = body(third).await;
    assert_eq!(body["error"]["code"], "RATE_LIMITED");
}

#[tokio::test]
async fn cors_is_disabled_unless_origins_are_configured() {
    let app = spawn().await;

    let response = app
        .client
        .get(format!("{}/v1/markets", app.base_url))
        .header("origin", "https://evil.example")
        .send()
        .await
        .expect("cors probe");

    assert_eq!(response.status(), StatusCode::OK);
    assert!(
        response
            .headers()
            .get("access-control-allow-origin")
            .is_none(),
        "a native app needs no CORS; a wildcard would expose the API to browsers"
    );
}

#[tokio::test]
async fn secrets_never_leave_the_server() {
    let app = spawn().await;
    let session = app.register().await;

    let me = app.get("/v1/me", Some(&session.access_token)).await;
    let me_text = me.text().await.expect("me body");
    assert!(!me_text.contains("$argon2id$"));

    let login = app
        .login(&session.email, "correct horse battery staple")
        .await;
    let login_text = login.text().await.expect("login body");
    assert!(!login_text.contains("$argon2id$"));
    assert!(!login_text.contains("passwordHash"));

    let row = sqlx::query("SELECT password_hash FROM users WHERE email_normalized = $1")
        .bind(session.email.to_ascii_lowercase())
        .fetch_one(&app.pool)
        .await
        .expect("user row");
    let hash: String = row.get("password_hash");
    assert!(hash.starts_with("$argon2id$"));
    assert_ne!(hash, "correct horse battery staple");
}
