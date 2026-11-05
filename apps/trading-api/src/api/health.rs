use axum::{Json, extract::State};
use serde::Serialize;

use crate::{error::AppResult, state::AppState};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HealthResponse {
    pub status: &'static str,
    pub environment: &'static str,
    pub version: &'static str,
    pub service: &'static str,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IndexResponse {
    pub service: &'static str,
    pub environment: &'static str,
    pub version: &'static str,
    pub docs: &'static str,
    pub disclaimer: &'static str,
}

pub async fn index(State(state): State<AppState>) -> Json<IndexResponse> {
    Json(IndexResponse {
        service: "meridian paper-trading api",
        environment: state.config.environment.as_str(),
        version: env!("CARGO_PKG_VERSION"),
        docs: "https://github.com/gerardocordero/gerardocordero.dev/tree/main/apps/trading-api/docs",
        disclaimer: "Simulated market data and paper trading only. No real orders are executed.",
    })
}

pub async fn healthz(State(state): State<AppState>) -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        environment: state.config.environment.as_str(),
        version: env!("CARGO_PKG_VERSION"),
        service: "trading-api",
    })
}

pub async fn readyz(State(state): State<AppState>) -> AppResult<Json<HealthResponse>> {
    sqlx::query_scalar::<_, i32>("SELECT 1")
        .fetch_one(&state.db)
        .await?;

    Ok(Json(HealthResponse {
        status: "ready",
        environment: state.config.environment.as_str(),
        version: env!("CARGO_PKG_VERSION"),
        service: "trading-api",
    }))
}
