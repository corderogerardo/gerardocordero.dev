mod common;

use common::*;
use reqwest::StatusCode;
use rust_decimal::Decimal;
use serde_json::json;

#[tokio::test]
async fn registration_creates_a_funded_paper_account() {
    let app = spawn().await;
    let session = app.register().await;

    let me = body(app.get("/v1/me", Some(&session.access_token)).await).await;

    assert_eq!(me["user"]["email"], session.email.as_str());
    assert_eq!(parse_decimal(&me["cash"]), Decimal::from(100_000u32));
    assert_eq!(me["currency"], "USD");
    assert!(me["user"].get("passwordHash").is_none());
    assert!(me["user"].get("password_hash").is_none());
}

#[tokio::test]
async fn duplicate_email_is_a_conflict() {
    let app = spawn().await;
    let email = TestApp::unique_email();
    app.register_with(&email, "correct horse battery staple")
        .await;

    let response = app
        .post(
            "/v1/auth/register",
            None,
            json!({
                "email": email,
                "password": "another correct horse battery",
                "displayName": "Second Trader",
            }),
        )
        .await;

    assert_eq!(response.status(), StatusCode::CONFLICT);
    let body = body(response).await;
    assert_eq!(body["error"]["code"], "EMAIL_TAKEN");
}

#[tokio::test]
async fn a_weak_password_is_rejected_with_the_offending_field() {
    let app = spawn().await;

    let response = app
        .post(
            "/v1/auth/register",
            None,
            json!({
                "email": TestApp::unique_email(),
                "password": "short",
                "displayName": "Test Trader",
            }),
        )
        .await;

    assert_eq!(response.status(), StatusCode::UNPROCESSABLE_ENTITY);
    let body = body(response).await;
    assert_eq!(body["error"]["code"], "VALIDATION_ERROR");
    assert_eq!(body["error"]["details"]["field"], "password");
}

#[tokio::test]
async fn unknown_email_and_wrong_password_look_identical() {
    let app = spawn().await;
    let session = app.register().await;

    let wrong_password = body(app.login(&session.email, "not the right password").await).await;
    let unknown_email = body(
        app.login(
            &format!("nobody-{}@example.test", session.user_id),
            "not the right password",
        )
        .await,
    )
    .await;

    assert_eq!(
        wrong_password["error"]["code"],
        unknown_email["error"]["code"]
    );
    assert_eq!(
        wrong_password["error"]["message"],
        unknown_email["error"]["message"]
    );
}

#[tokio::test]
async fn login_returns_a_new_session() {
    let app = spawn().await;
    let session = app.register().await;

    let response = app
        .login(&session.email, "correct horse battery staple")
        .await;

    assert_eq!(response.status(), StatusCode::OK);
    let login = body(response).await;
    assert_eq!(login["user"]["id"], session.user_id.as_str());
    assert_ne!(login["refreshToken"], session.refresh_token.as_str());
}

#[tokio::test]
async fn refresh_rotates_and_rejects_the_previous_token() {
    let app = spawn().await;
    let session = app.register().await;

    let rotated = body(
        app.post(
            "/v1/auth/refresh",
            None,
            json!({ "refreshToken": session.refresh_token }),
        )
        .await,
    )
    .await;
    let new_refresh = rotated["refreshToken"].as_str().expect("new refresh");

    assert_ne!(new_refresh, session.refresh_token);

    let replay = app
        .post(
            "/v1/auth/refresh",
            None,
            json!({ "refreshToken": session.refresh_token }),
        )
        .await;

    assert_eq!(replay.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn reusing_a_rotated_token_revokes_every_session() {
    let app = spawn().await;
    let session = app.register().await;

    let rotated = body(
        app.post(
            "/v1/auth/refresh",
            None,
            json!({ "refreshToken": session.refresh_token }),
        )
        .await,
    )
    .await;
    let new_refresh = rotated["refreshToken"]
        .as_str()
        .expect("new refresh")
        .to_string();

    // Attacker replays the stolen old token.
    let replay = app
        .post(
            "/v1/auth/refresh",
            None,
            json!({ "refreshToken": session.refresh_token }),
        )
        .await;
    assert_eq!(replay.status(), StatusCode::UNAUTHORIZED);

    // The legitimate token is revoked too: the family is assumed compromised.
    let legitimate = app
        .post(
            "/v1/auth/refresh",
            None,
            json!({ "refreshToken": new_refresh }),
        )
        .await;
    assert_eq!(legitimate.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn logout_revokes_the_refresh_token() {
    let app = spawn().await;
    let session = app.register().await;

    let logout = app
        .post(
            "/v1/auth/logout",
            Some(&session.access_token),
            json!({ "refreshToken": session.refresh_token }),
        )
        .await;
    assert_eq!(logout.status(), StatusCode::NO_CONTENT);

    let refresh = app
        .post(
            "/v1/auth/refresh",
            None,
            json!({ "refreshToken": session.refresh_token }),
        )
        .await;
    assert_eq!(refresh.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn protected_routes_reject_missing_or_tampered_tokens() {
    let app = spawn().await;
    let session = app.register().await;

    for path in ["/v1/me", "/v1/portfolio", "/v1/orders"] {
        let missing = app.get(path, None).await;
        assert_eq!(
            missing.status(),
            StatusCode::UNAUTHORIZED,
            "{path} without token"
        );

        let tampered = app
            .get(path, Some(&format!("{}x", session.access_token)))
            .await;
        assert_eq!(
            tampered.status(),
            StatusCode::UNAUTHORIZED,
            "{path} with tampered token"
        );
    }
}
