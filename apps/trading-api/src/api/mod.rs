pub mod auth;
pub mod extract;
pub mod health;
pub mod markets;
pub mod orders;
pub mod portfolio;
pub mod stream;

use std::time::Duration;

use axum::{
    Router,
    extract::DefaultBodyLimit,
    http::{HeaderName, HeaderValue, Method, header},
    middleware::{from_fn, from_fn_with_state},
    routing::{get, post},
};
use tower_http::{
    cors::{AllowOrigin, CorsLayer},
    trace::TraceLayer,
};

use crate::{api::extract::RateLimitPolicy, config::Config, state::AppState};

pub fn router(state: AppState) -> Router {
    let auth_routes = Router::new()
        .route("/v1/auth/register", post(auth::register))
        .route("/v1/auth/login", post(auth::login))
        .route("/v1/auth/refresh", post(auth::refresh))
        .route_layer(from_fn_with_state(
            (
                state.limiter.clone(),
                RateLimitPolicy {
                    scope: "auth",
                    limit: state.config.rate_limits.auth,
                },
            ),
            extract::rate_limit,
        ));

    let order_routes = Router::new()
        .route("/v1/orders", post(orders::create).get(orders::list))
        .route("/v1/orders/{id}", get(orders::get))
        .route("/v1/orders/{id}/cancel", post(orders::cancel))
        .route_layer(from_fn_with_state(
            (
                state.limiter.clone(),
                RateLimitPolicy {
                    scope: "orders",
                    limit: state.config.rate_limits.orders,
                },
            ),
            extract::rate_limit,
        ));

    let cors = cors_layer(&state.config);

    let router = Router::new()
        .merge(auth_routes)
        .merge(order_routes)
        .route("/v1/auth/logout", post(auth::logout))
        .route("/v1/me", get(auth::me))
        .route("/v1/markets", get(markets::list))
        .route("/v1/markets/{symbol}", get(markets::detail))
        .route("/v1/markets/{symbol}/history", get(markets::history))
        .route("/v1/portfolio", get(portfolio::get))
        .route("/v1/stream", get(stream::stream))
        .route("/v1/healthz", get(health::healthz))
        .route("/v1/readyz", get(health::readyz))
        .route("/", get(health::index))
        .layer(DefaultBodyLimit::max(16 * 1024))
        .layer(TraceLayer::new_for_http())
        .layer(from_fn(extract::request_id))
        .layer(from_fn_with_state(
            (
                state.limiter.clone(),
                RateLimitPolicy {
                    scope: "global",
                    limit: state.config.rate_limits.global,
                },
            ),
            extract::rate_limit,
        ))
        .with_state(state);

    match cors {
        Some(cors) => router.layer(cors),
        None => router,
    }
}

fn cors_layer(config: &Config) -> Option<CorsLayer> {
    if config.cors_origins.is_empty() {
        return None;
    }

    let origins: Vec<HeaderValue> = config
        .cors_origins
        .iter()
        .filter_map(|origin| HeaderValue::from_str(origin).ok())
        .collect();

    if origins.is_empty() {
        return None;
    }

    Some(
        CorsLayer::new()
            .allow_origin(AllowOrigin::list(origins))
            .allow_methods([Method::GET, Method::POST])
            .allow_headers([
                header::AUTHORIZATION,
                header::CONTENT_TYPE,
                header::ACCEPT,
                HeaderName::from_static("idempotency-key"),
                HeaderName::from_static("x-request-id"),
            ])
            .expose_headers([HeaderName::from_static("x-request-id")])
            .max_age(Duration::from_secs(600)),
    )
}
