mod common;

use common::*;
use reqwest::StatusCode;
use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use serde_json::json;

const INITIAL_CASH: u32 = 100_000;

fn fee_for(notional: Decimal) -> Decimal {
    (notional * dec!(0.001)).round_dp(8)
}

#[tokio::test]
async fn market_buy_creates_a_position_and_debits_cash() {
    let app = spawn().await;
    let session = app.register().await;
    let price = app.market_price("BTC-USD").await;

    let order = app
        .market_order(&session.access_token, "BTC-USD", "BUY", "1")
        .await;

    assert_eq!(order["status"], "FILLED");
    assert_eq!(parse_decimal(&order["averageFillPrice"]), price);
    assert_eq!(parse_decimal(&order["filledQuantity"]), Decimal::ONE);

    let portfolio = app.portfolio(&session.access_token).await;
    let fee = fee_for(price);

    assert_eq!(
        parse_decimal(&portfolio["cash"]),
        Decimal::from(INITIAL_CASH) - price - fee
    );
    assert_eq!(
        parse_decimal(&portfolio["equity"]),
        Decimal::from(INITIAL_CASH) - fee
    );

    let btc = position(&portfolio, "BTC-USD").expect("position exists");
    assert_eq!(parse_decimal(&btc["quantity"]), Decimal::ONE);
    assert_eq!(parse_decimal(&btc["averageCost"]), price);
    assert_eq!(parse_decimal(&btc["marketPrice"]), price);
}

#[tokio::test]
async fn selling_without_a_position_is_rejected() {
    let app = spawn().await;
    let session = app.register().await;

    let response = app
        .post_idempotent(
            "/v1/orders",
            &session.access_token,
            "sell-without-position-key",
            order_body("AAPL", "SELL", "MARKET", "1"),
        )
        .await;

    assert_eq!(response.status(), StatusCode::UNPROCESSABLE_ENTITY);
    let body = body(response).await;
    assert_eq!(body["error"]["code"], "INSUFFICIENT_POSITION");
}

#[tokio::test]
async fn buying_beyond_available_cash_is_rejected() {
    let app = spawn().await;
    let session = app.register().await;

    let response = app
        .post_idempotent(
            "/v1/orders",
            &session.access_token,
            "buy-beyond-cash-key",
            order_body("BTC-USD", "BUY", "MARKET", "2"),
        )
        .await;

    assert_eq!(response.status(), StatusCode::UNPROCESSABLE_ENTITY);
    let body = body(response).await;
    assert_eq!(body["error"]["code"], "INSUFFICIENT_FUNDS");

    let portfolio = app.portfolio(&session.access_token).await;
    assert_eq!(
        parse_decimal(&portfolio["cash"]),
        Decimal::from(INITIAL_CASH),
        "a rejected order must not move money"
    );
    assert!(
        portfolio["positions"]
            .as_array()
            .expect("positions")
            .is_empty()
    );
}

#[tokio::test]
async fn selling_at_a_higher_price_realizes_profit() {
    let app = spawn().await;
    let session = app.register().await;
    let entry = app.market_price("BTC-USD").await;

    app.market_order(&session.access_token, "BTC-USD", "BUY", "1")
        .await;

    let exit = entry + Decimal::from(1_000);
    app.set_price("BTC-USD", exit);

    let sell = app
        .market_order(&session.access_token, "BTC-USD", "SELL", "1")
        .await;
    assert_eq!(sell["status"], "FILLED");

    let portfolio = app.portfolio(&session.access_token).await;
    let sell_fee = fee_for(exit);

    assert_eq!(
        parse_decimal(&portfolio["realizedPnl"]),
        Decimal::from(1_000) - sell_fee
    );
    assert!(
        position(&portfolio, "BTC-USD").is_none(),
        "closed position is hidden"
    );
    assert_eq!(
        parse_decimal(&portfolio["cash"]),
        Decimal::from(INITIAL_CASH) + Decimal::from(1_000) - fee_for(entry) - sell_fee
    );
}

#[tokio::test]
async fn limit_order_rests_until_the_price_crosses() {
    let app = spawn().await;
    let session = app.register().await;
    let price = app.market_price("BTC-USD").await;

    let limit = app
        .limit_order(
            &session.access_token,
            "BTC-USD",
            "BUY",
            "1",
            &(price - Decimal::from(1_000)).to_string(),
        )
        .await;
    assert_eq!(limit["status"], "OPEN");
    assert_eq!(parse_decimal(&limit["filledQuantity"]), Decimal::ZERO);

    let portfolio = app.portfolio(&session.access_token).await;
    assert_eq!(
        parse_decimal(&portfolio["cash"]),
        Decimal::from(INITIAL_CASH)
    );

    // Price still above the limit: nothing fills.
    app.sweep("BTC-USD").await;
    let order = body(
        app.get(
            &format!("/v1/orders/{}", limit["id"].as_str().expect("order id")),
            Some(&session.access_token),
        )
        .await,
    )
    .await;
    assert_eq!(order["status"], "OPEN");

    // Price crosses below the limit: the resting order fills at the better price.
    let market = price - Decimal::from(2_000);
    app.set_price("BTC-USD", market);
    app.sweep("BTC-USD").await;

    let order = body(
        app.get(
            &format!("/v1/orders/{}", limit["id"].as_str().expect("order id")),
            Some(&session.access_token),
        )
        .await,
    )
    .await;

    assert_eq!(order["status"], "FILLED");
    assert_eq!(parse_decimal(&order["averageFillPrice"]), market);
}

#[tokio::test]
async fn cancel_is_idempotent_and_rejects_terminal_orders() {
    let app = spawn().await;
    let session = app.register().await;
    let price = app.market_price("BTC-USD").await;

    let limit = app
        .limit_order(
            &session.access_token,
            "BTC-USD",
            "BUY",
            "1",
            &(price - Decimal::from(1_000)).to_string(),
        )
        .await;
    let path = format!(
        "/v1/orders/{}/cancel",
        limit["id"].as_str().expect("order id")
    );

    let first = app
        .post(&path, Some(&session.access_token), json!({}))
        .await;
    assert_eq!(first.status(), StatusCode::OK);
    assert_eq!(body(first).await["status"], "CANCELLED");

    let second = app
        .post(&path, Some(&session.access_token), json!({}))
        .await;
    assert_eq!(second.status(), StatusCode::OK);
    assert_eq!(body(second).await["status"], "CANCELLED");

    let filled = app
        .market_order(&session.access_token, "AAPL", "BUY", "1")
        .await;
    let filled_path = format!(
        "/v1/orders/{}/cancel",
        filled["id"].as_str().expect("order id")
    );

    let rejected = app
        .post(&filled_path, Some(&session.access_token), json!({}))
        .await;
    assert_eq!(rejected.status(), StatusCode::CONFLICT);
    assert_eq!(
        body(rejected).await["error"]["code"],
        "ORDER_NOT_CANCELLABLE"
    );
}

#[tokio::test]
async fn order_history_uses_keyset_pagination() {
    let app = spawn().await;
    let session = app.register().await;
    let price = app.market_price("BTC-USD").await;

    for _ in 0..3 {
        app.limit_order(
            &session.access_token,
            "BTC-USD",
            "BUY",
            "1",
            &(price - Decimal::from(1_000)).to_string(),
        )
        .await;
    }

    let first_page = body(
        app.get("/v1/orders?limit=2", Some(&session.access_token))
            .await,
    )
    .await;
    assert_eq!(first_page["data"].as_array().expect("orders").len(), 2);

    let cursor = first_page["nextCursor"].as_str().expect("next cursor");
    let second_page = body(
        app.get(
            &format!("/v1/orders?limit=2&cursor={cursor}"),
            Some(&session.access_token),
        )
        .await,
    )
    .await;

    assert_eq!(second_page["data"].as_array().expect("orders").len(), 1);
    assert!(second_page["nextCursor"].is_null());
}

#[tokio::test]
async fn another_users_order_is_not_readable() {
    let app = spawn().await;
    let owner = app.register().await;
    let stranger = app.register().await;
    let price = app.market_price("AAPL").await;

    let order = app
        .limit_order(
            &owner.access_token,
            "AAPL",
            "BUY",
            "1",
            &(price - Decimal::ONE).to_string(),
        )
        .await;
    let order_id = order["id"].as_str().expect("order id");

    let response = app
        .get(
            &format!("/v1/orders/{order_id}"),
            Some(&stranger.access_token),
        )
        .await;

    assert_eq!(response.status(), StatusCode::NOT_FOUND);

    let cancel = app
        .post(
            &format!("/v1/orders/{order_id}/cancel"),
            Some(&stranger.access_token),
            json!({}),
        )
        .await;
    assert_eq!(cancel.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn markets_expose_quotes_and_history_for_charting() {
    let app = spawn().await;

    let markets = body(app.get("/v1/markets", None).await).await;
    let data = markets["data"].as_array().expect("markets");
    assert_eq!(data.len(), 6);
    assert_eq!(markets["environment"], "test");
    assert!(data.iter().all(|market| market["lastPrice"].is_string()));

    let history = body(app.get("/v1/markets/BTC-USD/history?points=30", None).await).await;
    assert_eq!(history["interval"], "1m");
    assert_eq!(history["points"].as_array().expect("points").len(), 30);

    let unknown = app.get("/v1/markets/NOPE/history", None).await;
    assert_eq!(unknown.status(), StatusCode::NOT_FOUND);
}
