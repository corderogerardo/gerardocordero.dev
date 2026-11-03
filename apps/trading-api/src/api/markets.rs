use axum::{
    Json,
    extract::{Path, Query, State},
};
use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

use crate::{
    error::{AppError, AppResult},
    market::{InstrumentKind, PricePoint, Quote},
    state::AppState,
};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MarketView {
    pub symbol: String,
    pub name: String,
    pub kind: InstrumentKind,
    pub currency: String,
    #[serde(with = "rust_decimal::serde::str")]
    pub tick_size: Decimal,
    #[serde(with = "rust_decimal::serde::str")]
    pub last_price: Decimal,
    #[serde(with = "rust_decimal::serde::str")]
    pub change_percent: Decimal,
    #[serde(with = "rust_decimal::serde::str")]
    pub high: Decimal,
    #[serde(with = "rust_decimal::serde::str")]
    pub low: Decimal,
    pub updated_at: DateTime<Utc>,
}

impl MarketView {
    fn from_quote(quote: Quote, instrument: &crate::market::Instrument) -> Self {
        Self {
            symbol: quote.symbol,
            name: instrument.name.clone(),
            kind: instrument.kind,
            currency: instrument.currency.clone(),
            tick_size: instrument.tick_size,
            last_price: quote.price,
            change_percent: quote.change_percent,
            high: quote.high,
            low: quote.low,
            updated_at: quote.updated_at,
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MarketsResponse {
    pub data: Vec<MarketView>,
    pub environment: &'static str,
}

pub async fn list(State(state): State<AppState>) -> Json<MarketsResponse> {
    let data = state
        .market
        .quotes()
        .into_iter()
        .filter_map(|quote| {
            let instrument = state.market.instrument(&quote.symbol)?;
            Some(MarketView::from_quote(quote, &instrument))
        })
        .collect();

    Json(MarketsResponse {
        data,
        environment: state.config.environment.as_str(),
    })
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MarketDetailResponse {
    pub market: MarketView,
    pub environment: &'static str,
}

pub async fn detail(
    State(state): State<AppState>,
    Path(symbol): Path<String>,
) -> AppResult<Json<MarketDetailResponse>> {
    let symbol = normalize_symbol(&symbol);
    let quote = state
        .market
        .quote(&symbol)
        .ok_or_else(|| AppError::not_found("unknown market symbol"))?;
    let instrument = state
        .market
        .instrument(&symbol)
        .ok_or_else(|| AppError::not_found("unknown market symbol"))?;

    Ok(Json(MarketDetailResponse {
        market: MarketView::from_quote(quote, &instrument),
        environment: state.config.environment.as_str(),
    }))
}

#[derive(Debug, Deserialize)]
pub struct HistoryQuery {
    pub points: Option<usize>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryResponse {
    pub symbol: String,
    pub interval: &'static str,
    pub points: Vec<PricePoint>,
}

pub async fn history(
    State(state): State<AppState>,
    Path(symbol): Path<String>,
    Query(query): Query<HistoryQuery>,
) -> AppResult<Json<HistoryResponse>> {
    let symbol = normalize_symbol(&symbol);
    let points = query.points.unwrap_or(60).clamp(2, 240);

    let history = state
        .market
        .history(&symbol, points)
        .ok_or_else(|| AppError::not_found("unknown market symbol"))?;

    Ok(Json(HistoryResponse {
        symbol,
        interval: "1m",
        points: history,
    }))
}

fn normalize_symbol(raw: &str) -> String {
    raw.trim().to_ascii_uppercase()
}
