#![allow(dead_code)]

//! Shared harness for the integration suites.
//!
//! Every test talks to a real axum server over TCP and a real Postgres database.
//! No router is called in-process and no SQL is mocked — the tests exercise the
//! same path a mobile client takes.

use std::net::SocketAddr;

use reqwest::{Client, Response, StatusCode};
use rust_decimal::Decimal;
use serde_json::{Value, json};
use sqlx::{PgPool, postgres::PgPoolOptions};
use trading_api::{
    api,
    config::{Config, RateLimitConfig},
    state::AppState,
};
use uuid::Uuid;

pub fn database_url() -> String {
    std::env::var("TEST_DATABASE_URL")
        .or_else(|_| std::env::var("DATABASE_URL"))
        .unwrap_or_else(|_| "postgres://trading:trading@127.0.0.1:5433/trading_test".to_string())
}

/// Each test owns its pool: a `PgPool` spawns background tasks on the runtime
/// that created it, so sharing one across tests (separate runtimes) produces
/// "A Tokio 1.x context was found, but it is being shutdown" flakiness.
pub async fn pool() -> PgPool {
    let url = database_url();
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .acquire_timeout(std::time::Duration::from_secs(5))
        .connect(&url)
        .await
        .unwrap_or_else(|error| {
            panic!(
                "cannot connect to Postgres at {url}: {error}. \
                 Start it with `make db-up` in apps/trading-api."
            )
        });

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("run migrations");

    pool
}

#[derive(Debug, Clone)]
pub struct Session {
    pub user_id: String,
    pub email: String,
    pub access_token: String,
    pub refresh_token: String,
}

pub struct TestApp {
    pub base_url: String,
    pub client: Client,
    pub pool: PgPool,
    pub state: AppState,
}

pub async fn spawn() -> TestApp {
    spawn_with(RateLimitConfig::for_tests()).await
}

pub async fn spawn_with(rate_limits: RateLimitConfig) -> TestApp {
    let _ = tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("trading_api=error")),
        )
        .try_init();

    let pool = pool().await;

    let mut config = Config::for_tests();
    config.rate_limits = rate_limits;

    let state = AppState::build(pool.clone(), config)
        .await
        .expect("build app state");
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0")
        .await
        .expect("bind test port");
    let address = listener.local_addr().expect("local address");
    let router = api::router(state.clone());

    tokio::spawn(async move {
        axum::serve(
            listener,
            router.into_make_service_with_connect_info::<SocketAddr>(),
        )
        .await
        .expect("serve test app");
    });

    TestApp {
        base_url: format!("http://{address}"),
        client: Client::builder().build().expect("http client"),
        pool,
        state,
    }
}

impl TestApp {
    pub fn unique_email() -> String {
        format!("trader-{}@example.test", Uuid::new_v4())
    }

    pub async fn register(&self) -> Session {
        self.register_with(&Self::unique_email(), "correct horse battery staple")
            .await
    }

    pub async fn register_with(&self, email: &str, password: &str) -> Session {
        let response = self
            .client
            .post(format!("{}/v1/auth/register", self.base_url))
            .json(&json!({
                "email": email,
                "password": password,
                "displayName": "Test Trader",
            }))
            .send()
            .await
            .expect("register request");

        assert_eq!(
            response.status(),
            StatusCode::CREATED,
            "registration failed: {}",
            response.text().await.unwrap_or_default()
        );

        session_from(response).await
    }

    pub async fn login(&self, email: &str, password: &str) -> Response {
        self.post(
            "/v1/auth/login",
            None,
            json!({ "email": email, "password": password }),
        )
        .await
    }

    pub async fn post(&self, path: &str, token: Option<&str>, body: Value) -> Response {
        let mut request = self
            .client
            .post(format!("{}{path}", self.base_url))
            .json(&body);
        if let Some(token) = token {
            request = request.bearer_auth(token);
        }
        request.send().await.expect("post request")
    }

    pub async fn post_idempotent(
        &self,
        path: &str,
        token: &str,
        key: &str,
        body: Value,
    ) -> Response {
        self.client
            .post(format!("{}{path}", self.base_url))
            .bearer_auth(token)
            .header("idempotency-key", key)
            .json(&body)
            .send()
            .await
            .expect("idempotent post request")
    }

    pub async fn get(&self, path: &str, token: Option<&str>) -> Response {
        let mut request = self.client.get(format!("{}{path}", self.base_url));
        if let Some(token) = token {
            request = request.bearer_auth(token);
        }
        request.send().await.expect("get request")
    }

    pub async fn market_price(&self, symbol: &str) -> Decimal {
        let body = body(self.get(&format!("/v1/markets/{symbol}"), None).await).await;
        parse_decimal(&body["market"]["lastPrice"])
    }

    pub async fn portfolio(&self, token: &str) -> Value {
        body(self.get("/v1/portfolio", Some(token)).await).await
    }

    pub fn set_price(&self, symbol: &str, price: Decimal) {
        assert!(self.state.market.set_price(symbol, price), "unknown symbol");
    }

    pub async fn sweep(&self, symbol: &str) {
        trading_api::trading::sweep_symbol(&self.state, symbol)
            .await
            .expect("sweep limit orders");
    }

    pub async fn market_order(
        &self,
        token: &str,
        symbol: &str,
        side: &str,
        quantity: &str,
    ) -> Value {
        let response = self
            .post_idempotent(
                "/v1/orders",
                token,
                &Uuid::new_v4().to_string(),
                order_body(symbol, side, "MARKET", quantity),
            )
            .await;

        assert_eq!(
            response.status(),
            StatusCode::CREATED,
            "market order failed: {}",
            response.text().await.unwrap_or_default()
        );

        body(response).await
    }

    pub async fn limit_order(
        &self,
        token: &str,
        symbol: &str,
        side: &str,
        quantity: &str,
        limit_price: &str,
    ) -> Value {
        let response = self
            .post_idempotent(
                "/v1/orders",
                token,
                &Uuid::new_v4().to_string(),
                limit_order_body(symbol, side, quantity, limit_price),
            )
            .await;

        assert_eq!(
            response.status(),
            StatusCode::CREATED,
            "limit order failed: {}",
            response.text().await.unwrap_or_default()
        );

        body(response).await
    }
}

pub async fn body(response: Response) -> Value {
    response.json().await.expect("valid json body")
}

pub fn parse_decimal(value: &Value) -> Decimal {
    value
        .as_str()
        .expect("decimal encoded as a string")
        .parse()
        .expect("valid decimal")
}

pub fn order_body(symbol: &str, side: &str, order_type: &str, quantity: &str) -> Value {
    json!({
        "symbol": symbol,
        "side": side,
        "type": order_type,
        "quantity": quantity,
    })
}

pub fn limit_order_body(symbol: &str, side: &str, quantity: &str, limit_price: &str) -> Value {
    json!({
        "symbol": symbol,
        "side": side,
        "type": "LIMIT",
        "quantity": quantity,
        "limitPrice": limit_price,
    })
}

pub fn position<'a>(portfolio: &'a Value, symbol: &str) -> Option<&'a Value> {
    portfolio["positions"]
        .as_array()?
        .iter()
        .find(|position| position["symbol"] == symbol)
}

async fn session_from(response: Response) -> Session {
    let body = body(response).await;

    Session {
        user_id: body["user"]["id"].as_str().expect("user id").to_string(),
        email: body["user"]["email"].as_str().expect("email").to_string(),
        access_token: body["accessToken"]
            .as_str()
            .expect("access token")
            .to_string(),
        refresh_token: body["refreshToken"]
            .as_str()
            .expect("refresh token")
            .to_string(),
    }
}
