mod common;

use std::collections::HashSet;

use common::*;
use reqwest::StatusCode;
use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use serde_json::Value;
use uuid::Uuid;

const INITIAL_CASH: u32 = 100_000;

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn a_limit_order_fills_exactly_once_under_concurrent_sweeps() {
    let app = spawn().await;
    let session = app.register().await;
    let price = app.market_price("BTC-USD").await;

    let limit = app
        .limit_order(
            &session.access_token,
            "BTC-USD",
            "BUY",
            "1",
            &(price + Decimal::from(500)).to_string(),
        )
        .await;
    let order_id = limit["id"].as_str().expect("order id").to_string();
    let order_uuid: Uuid = order_id.parse().expect("uuid");

    let mut handles = Vec::new();
    for _ in 0..16 {
        let state = app.state.clone();
        handles.push(tokio::spawn(async move {
            trading_api::trading::sweep_symbol(&state, "BTC-USD")
                .await
                .expect("sweep");
        }));
    }
    for handle in handles {
        handle.await.expect("join sweep");
    }

    let trades: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM trades WHERE order_id = $1")
        .bind(order_uuid)
        .fetch_one(&app.pool)
        .await
        .expect("count trades");
    assert_eq!(trades, 1, "sixteen sweeps must produce one fill");

    let status: String = sqlx::query_scalar("SELECT status FROM orders WHERE id = $1")
        .bind(order_uuid)
        .fetch_one(&app.pool)
        .await
        .expect("order status");
    assert_eq!(status, "FILLED");

    let fee = (price * dec!(0.001)).round_dp(8);
    let portfolio = app.portfolio(&session.access_token).await;
    assert_eq!(
        parse_decimal(&portfolio["cash"]),
        Decimal::from(INITIAL_CASH) - price - fee,
        "cash must be debited exactly once"
    );
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn concurrent_market_orders_never_overdraw_the_account() {
    let app = spawn().await;
    let session = app.register().await;
    let price = app.market_price("BTC-USD").await;

    let mut handles = Vec::new();
    for _ in 0..6 {
        let client = app.client.clone();
        let url = format!("{}/v1/orders", app.base_url);
        let token = session.access_token.clone();
        let key = Uuid::new_v4().to_string();

        handles.push(tokio::spawn(async move {
            client
                .post(url)
                .bearer_auth(token)
                .header("idempotency-key", key)
                .json(&order_body("BTC-USD", "BUY", "MARKET", "1"))
                .send()
                .await
                .expect("concurrent order")
        }));
    }

    let mut successes = 0u32;
    let mut failures = 0u32;
    for handle in handles {
        let response = handle.await.expect("join order");
        match response.status() {
            StatusCode::CREATED => successes += 1,
            StatusCode::UNPROCESSABLE_ENTITY => {
                let body: Value = response.json().await.expect("error body");
                assert_eq!(body["error"]["code"], "INSUFFICIENT_FUNDS");
                failures += 1;
            }
            other => panic!("unexpected status {other}"),
        }
    }

    assert!(successes >= 1, "at least one order should fit the balance");
    assert_eq!(successes + failures, 6);

    let fee = (price * dec!(0.001)).round_dp(8);
    let spent = (price + fee) * Decimal::from(successes);
    assert!(
        spent <= Decimal::from(INITIAL_CASH),
        "spent {spent} exceeds the initial balance"
    );

    let portfolio = app.portfolio(&session.access_token).await;
    assert!(parse_decimal(&portfolio["cash"]) >= Decimal::ZERO);
    assert_eq!(
        parse_decimal(&portfolio["cash"]),
        Decimal::from(INITIAL_CASH) - spent
    );
}

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn concurrent_retries_with_one_idempotency_key_create_one_order() {
    let app = spawn().await;
    let session = app.register().await;
    let key = "concurrent-retry-same-intent";
    let payload = order_body("AAPL", "BUY", "MARKET", "1");

    let mut handles = Vec::new();
    for _ in 0..8 {
        let client = app.client.clone();
        let url = format!("{}/v1/orders", app.base_url);
        let token = session.access_token.clone();
        let payload = payload.clone();

        handles.push(tokio::spawn(async move {
            client
                .post(url)
                .bearer_auth(token)
                .header("idempotency-key", key)
                .json(&payload)
                .send()
                .await
                .expect("retry")
        }));
    }

    let mut ids = HashSet::new();
    for handle in handles {
        let response = handle.await.expect("join retry");
        assert!(
            matches!(response.status(), StatusCode::CREATED | StatusCode::OK),
            "unexpected status {}",
            response.status()
        );
        let body: Value = response.json().await.expect("order body");
        ids.insert(body["id"].as_str().expect("order id").to_string());
    }

    assert_eq!(ids.len(), 1, "every retry must observe the same order");

    let user_id: Uuid = session.user_id.parse().expect("uuid");
    let orders: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM orders WHERE user_id = $1")
        .bind(user_id)
        .fetch_one(&app.pool)
        .await
        .expect("count orders");
    let trades: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM trades WHERE user_id = $1")
        .bind(user_id)
        .fetch_one(&app.pool)
        .await
        .expect("count trades");

    assert_eq!(orders, 1);
    assert_eq!(trades, 1);
}
