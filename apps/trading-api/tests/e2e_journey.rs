//! End-to-end journey over real HTTP + real Postgres: the same path the mobile
//! client takes from a cold install to a cancelled order.

mod common;

use std::str::FromStr;

use common::*;
use reqwest::StatusCode;
use rust_decimal::Decimal;
use serde_json::json;

#[tokio::test]
async fn a_new_trader_can_browse_trade_and_manage_orders() {
    let app = spawn().await;

    // 1. Sign up.
    let session = app.register().await;
    assert_eq!(session.access_token.split('.').count(), 3, "JWT shape");

    // 2. Browse the market.
    let markets = body(app.get("/v1/markets", None).await).await;
    let symbols: Vec<&str> = markets["data"]
        .as_array()
        .expect("markets")
        .iter()
        .filter_map(|market| market["symbol"].as_str())
        .collect();
    assert!(symbols.contains(&"BTC-USD"));
    assert!(symbols.contains(&"AAPL"));

    // 3. Read the chart data for one instrument.
    let history = body(app.get("/v1/markets/BTC-USD/history?points=45", None).await).await;
    assert_eq!(history["points"].as_array().expect("points").len(), 45);

    // 4. Open a small position at market.
    let price = app.market_price("BTC-USD").await;
    let buy = app
        .market_order(&session.access_token, "BTC-USD", "BUY", "0.5")
        .await;
    assert_eq!(buy["status"], "FILLED");

    // 5. See it in the portfolio.
    let portfolio = app.portfolio(&session.access_token).await;
    let position = position(&portfolio, "BTC-USD").expect("position");
    assert_eq!(
        parse_decimal(&position["quantity"]),
        Decimal::from_str("0.5").expect("decimal")
    );
    assert!(parse_decimal(&portfolio["equity"]) <= Decimal::from(100_000u32));

    // 6. Rest a limit order that cannot fill yet.
    let limit = app
        .limit_order(
            &session.access_token,
            "BTC-USD",
            "SELL",
            "0.5",
            &(price + Decimal::from(10_000)).to_string(),
        )
        .await;
    assert_eq!(limit["status"], "OPEN");

    // 7. See it in the order history.
    let orders = body(
        app.get("/v1/orders?status=OPEN", Some(&session.access_token))
            .await,
    )
    .await;
    let open_orders = orders["data"].as_array().expect("orders");
    assert!(open_orders.iter().any(|order| order["id"] == limit["id"]));

    // 8. Cancel it.
    let cancelled = body(
        app.post(
            &format!(
                "/v1/orders/{}/cancel",
                limit["id"].as_str().expect("limit order id")
            ),
            Some(&session.access_token),
            json!({}),
        )
        .await,
    )
    .await;
    assert_eq!(cancelled["status"], "CANCELLED");

    // 9. Rotate the session and keep working.
    let rotated = body(
        app.post(
            "/v1/auth/refresh",
            None,
            json!({ "refreshToken": session.refresh_token }),
        )
        .await,
    )
    .await;
    let access = rotated["accessToken"].as_str().expect("rotated access");
    let me = app.get("/v1/me", Some(access)).await;
    assert_eq!(me.status(), StatusCode::OK);

    // 10. Log out and confirm the refresh token is dead.
    let logout = app
        .post(
            "/v1/auth/logout",
            Some(access),
            json!({ "refreshToken": rotated["refreshToken"] }),
        )
        .await;
    assert_eq!(logout.status(), StatusCode::NO_CONTENT);

    let after_logout = app
        .post(
            "/v1/auth/refresh",
            None,
            json!({ "refreshToken": rotated["refreshToken"] }),
        )
        .await;
    assert_eq!(after_logout.status(), StatusCode::UNAUTHORIZED);
}
