use axum::{Json, extract::State};
use rust_decimal::Decimal;
use serde::Serialize;

use crate::{
    api::extract::AuthUser,
    domain::{
        money::round_money,
        portfolio::{PositionState, market_value, unrealized_pnl, unrealized_pnl_percent},
    },
    error::{AppError, AppResult},
    state::AppState,
    store,
};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PositionView {
    pub symbol: String,
    #[serde(with = "rust_decimal::serde::str")]
    pub quantity: Decimal,
    #[serde(with = "rust_decimal::serde::str")]
    pub average_cost: Decimal,
    #[serde(with = "rust_decimal::serde::str")]
    pub market_price: Decimal,
    #[serde(with = "rust_decimal::serde::str")]
    pub market_value: Decimal,
    #[serde(with = "rust_decimal::serde::str")]
    pub unrealized_pnl: Decimal,
    #[serde(with = "rust_decimal::serde::str")]
    pub unrealized_pnl_percent: Decimal,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PortfolioResponse {
    #[serde(with = "rust_decimal::serde::str")]
    pub cash: Decimal,
    pub currency: String,
    #[serde(with = "rust_decimal::serde::str")]
    pub equity: Decimal,
    #[serde(with = "rust_decimal::serde::str")]
    pub realized_pnl: Decimal,
    #[serde(with = "rust_decimal::serde::str")]
    pub unrealized_pnl: Decimal,
    pub positions: Vec<PositionView>,
    pub environment: &'static str,
}

pub async fn get(
    State(state): State<AppState>,
    AuthUser { user_id }: AuthUser,
) -> AppResult<Json<PortfolioResponse>> {
    let mut connection = state.db.acquire().await?;

    let account = store::accounts::get(&mut connection, user_id)
        .await?
        .ok_or_else(|| AppError::internal("account missing for authenticated user"))?;
    let rows = store::positions::list(&mut connection, user_id).await?;

    let mut positions = Vec::new();
    let mut invested_value = Decimal::ZERO;
    let mut total_unrealized = Decimal::ZERO;
    let mut realized_pnl = Decimal::ZERO;

    for row in rows {
        realized_pnl += row.realized_pnl;

        if row.quantity.is_zero() {
            continue;
        }

        let Some(quote) = state.market.quote(&row.symbol) else {
            continue;
        };

        let position = PositionState::new(row.quantity, row.average_cost, row.realized_pnl);
        let value = market_value(row.quantity, quote.price);
        let pnl = unrealized_pnl(&position, quote.price);

        invested_value += value;
        total_unrealized += pnl;

        positions.push(PositionView {
            symbol: row.symbol,
            quantity: row.quantity,
            average_cost: row.average_cost,
            market_price: quote.price,
            market_value: value,
            unrealized_pnl: pnl,
            unrealized_pnl_percent: unrealized_pnl_percent(&position, quote.price),
        });
    }

    Ok(Json(PortfolioResponse {
        cash: account.cash,
        currency: account.currency,
        equity: round_money(account.cash + invested_value),
        realized_pnl: round_money(realized_pnl),
        unrealized_pnl: round_money(total_unrealized),
        positions,
        environment: state.config.environment.as_str(),
    }))
}
