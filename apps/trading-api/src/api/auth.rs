//! Authentication endpoints. Every response that carries tokens also carries the
//! public user so the client can render immediately after login.

use axum::{Json, extract::State, http::StatusCode};
use chrono::{DateTime, Duration as ChronoDuration, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgConnection;
use uuid::Uuid;

use crate::{
    api::extract::{AuthUser, ValidJson},
    auth::password,
    domain::validation::{validate_display_name, validate_email},
    error::{AppError, AppResult},
    hashing::{generate_refresh_token, sha256_hex},
    state::AppState,
    store::{self, users::User},
};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
    pub display_name: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct RefreshRequest {
    pub refresh_token: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserView {
    pub id: Uuid,
    pub email: String,
    pub display_name: String,
    pub created_at: DateTime<Utc>,
}

impl From<&User> for UserView {
    fn from(user: &User) -> Self {
        Self {
            id: user.id,
            email: user.email.clone(),
            display_name: user.display_name.clone(),
            created_at: user.created_at,
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub token_type: &'static str,
    pub expires_in: u64,
    pub user: UserView,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MeResponse {
    pub user: UserView,
    #[serde(with = "rust_decimal::serde::str")]
    pub cash: rust_decimal::Decimal,
    pub currency: String,
}

pub async fn register(
    State(state): State<AppState>,
    ValidJson(request): ValidJson<RegisterRequest>,
) -> AppResult<(StatusCode, Json<AuthResponse>)> {
    let email_normalized = validate_email(&request.email)?;
    let display_name = validate_display_name(&request.display_name)?;
    password::validate_password(&request.password, &email_normalized)?;

    let password_hash = password::hash_password(request.password).await?;

    let mut transaction = state.db.begin().await?;

    let user = match store::users::create(
        &mut transaction,
        request.email.trim(),
        &email_normalized,
        &display_name,
        &password_hash,
    )
    .await
    {
        Ok(user) => user,
        Err(error) if store::is_unique_violation(&error) => {
            return Err(AppError::conflict(
                "EMAIL_TAKEN",
                "that email is already registered",
            ));
        }
        Err(error) => return Err(error.into()),
    };

    store::accounts::create(&mut transaction, user.id, state.config.initial_cash).await?;

    let response = issue_session(&state, &mut transaction, &user).await?;

    store::audit::record(
        &mut transaction,
        Some(user.id),
        "user.registered",
        Some(&user.id.to_string()),
        serde_json::json!({}),
    )
    .await?;

    transaction.commit().await?;

    Ok((StatusCode::CREATED, Json(response)))
}

pub async fn login(
    State(state): State<AppState>,
    ValidJson(request): ValidJson<LoginRequest>,
) -> AppResult<Json<AuthResponse>> {
    let email_normalized = validate_email(&request.email)?;

    let maybe_user = {
        let mut connection = state.db.acquire().await?;
        store::users::find_by_email_normalized(&mut connection, &email_normalized).await?
    };

    // Always pay the hashing cost: a fast rejection for unknown emails is an
    // account-enumeration oracle.
    let candidate_hash = maybe_user
        .as_ref()
        .map(|user| user.password_hash.clone())
        .unwrap_or_else(|| state.dummy_password_hash.to_string());
    let password_matches = password::verify_password(request.password, candidate_hash).await;

    let Some(user) = maybe_user.filter(|_| password_matches) else {
        return Err(AppError::unauthorized("email or password is incorrect"));
    };

    let mut transaction = state.db.begin().await?;
    let response = issue_session(&state, &mut transaction, &user).await?;
    store::audit::record(
        &mut transaction,
        Some(user.id),
        "user.logged_in",
        Some(&user.id.to_string()),
        serde_json::json!({}),
    )
    .await?;
    transaction.commit().await?;

    Ok(Json(response))
}

pub async fn refresh(
    State(state): State<AppState>,
    ValidJson(request): ValidJson<RefreshRequest>,
) -> AppResult<Json<AuthResponse>> {
    let raw_token = request.refresh_token.trim().to_string();
    if !raw_token.starts_with("rt_") || raw_token.len() != 67 {
        return Err(AppError::unauthorized("invalid refresh token"));
    }
    let token_hash = sha256_hex(&raw_token);

    let mut transaction = state.db.begin().await?;

    let Some(stored) = store::refresh_tokens::lock_by_hash(&mut transaction, &token_hash).await?
    else {
        return Err(AppError::unauthorized("invalid refresh token"));
    };

    if stored.revoked_at.is_some() {
        // Reuse of a rotated token: assume theft and kill the whole family.
        store::refresh_tokens::revoke_all_for_user(&mut transaction, stored.user_id).await?;
        transaction.commit().await?;
        return Err(AppError::unauthorized(
            "refresh token was already used; all sessions were revoked",
        ));
    }

    if stored.expires_at <= Utc::now() {
        store::refresh_tokens::revoke(&mut transaction, stored.id).await?;
        transaction.commit().await?;
        return Err(AppError::unauthorized("refresh token expired"));
    }

    let user = store::users::find_by_id(&mut transaction, stored.user_id)
        .await?
        .ok_or_else(|| AppError::internal("refresh token points at a missing user"))?;

    let access = state.tokens.issue(user.id, Utc::now())?;
    let new_raw = generate_refresh_token();
    let new_hash = sha256_hex(&new_raw);
    let expires_at =
        Utc::now() + ChronoDuration::seconds(state.config.refresh_token_ttl.as_secs() as i64);
    let new_id =
        store::refresh_tokens::insert(&mut transaction, user.id, &new_hash, expires_at).await?;
    store::refresh_tokens::revoke_with_replacement(&mut transaction, stored.id, new_id).await?;

    transaction.commit().await?;

    Ok(Json(AuthResponse {
        access_token: access.token,
        refresh_token: new_raw,
        token_type: "Bearer",
        expires_in: access.expires_in,
        user: (&user).into(),
    }))
}

pub async fn logout(
    State(state): State<AppState>,
    AuthUser { user_id }: AuthUser,
    ValidJson(request): ValidJson<RefreshRequest>,
) -> AppResult<StatusCode> {
    let token_hash = sha256_hex(request.refresh_token.trim());

    let mut transaction = state.db.begin().await?;
    if let Some(stored) = store::refresh_tokens::lock_by_hash(&mut transaction, &token_hash).await?
        && stored.user_id == user_id
    {
        store::refresh_tokens::revoke(&mut transaction, stored.id).await?;
    }
    transaction.commit().await?;

    // Logout is idempotent and never reveals whether the token existed.
    Ok(StatusCode::NO_CONTENT)
}

pub async fn me(
    State(state): State<AppState>,
    AuthUser { user_id }: AuthUser,
) -> AppResult<Json<MeResponse>> {
    let mut connection = state.db.acquire().await?;

    let user = store::users::find_by_id(&mut connection, user_id)
        .await?
        .ok_or_else(|| AppError::unauthorized("account no longer exists"))?;
    let account = store::accounts::get(&mut connection, user_id)
        .await?
        .ok_or_else(|| AppError::internal("account missing for authenticated user"))?;

    Ok(Json(MeResponse {
        user: (&user).into(),
        cash: account.cash,
        currency: account.currency,
    }))
}

async fn issue_session(
    state: &AppState,
    connection: &mut PgConnection,
    user: &User,
) -> AppResult<AuthResponse> {
    let access = state.tokens.issue(user.id, Utc::now())?;
    let refresh_token = generate_refresh_token();
    let refresh_hash = sha256_hex(&refresh_token);
    let expires_at =
        Utc::now() + ChronoDuration::seconds(state.config.refresh_token_ttl.as_secs() as i64);

    store::refresh_tokens::insert(connection, user.id, &refresh_hash, expires_at).await?;

    Ok(AuthResponse {
        access_token: access.token,
        refresh_token,
        token_type: "Bearer",
        expires_in: access.expires_in,
        user: user.into(),
    })
}
