//! Order model, wire contract, and boundary validation.
//!
//! The database representation and the HTTP representation are the same struct
//! on purpose: one shape means a field cannot drift between layers. Money is
//! always a string so no JavaScript client can silently lose precision.

use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::money::{MONEY_SCALE, fits_scale, notional};

pub use super::validation::ValidationError;

const MAX_QUANTITY_UNITS: u32 = 1_000_000;
const MAX_SYMBOL_LEN: usize = 16;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[serde(rename_all = "UPPERCASE")]
#[sqlx(type_name = "text", rename_all = "UPPERCASE")]
pub enum Side {
    Buy,
    Sell,
}

impl Side {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Buy => "BUY",
            Self::Sell => "SELL",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[serde(rename_all = "UPPERCASE")]
#[sqlx(type_name = "text", rename_all = "UPPERCASE")]
pub enum OrderType {
    Market,
    Limit,
}

impl OrderType {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Market => "MARKET",
            Self::Limit => "LIMIT",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[serde(rename_all = "UPPERCASE")]
#[sqlx(type_name = "text", rename_all = "UPPERCASE")]
pub enum OrderStatus {
    Open,
    Filled,
    Cancelled,
    Rejected,
}

impl OrderStatus {
    pub fn is_terminal(self) -> bool {
        !matches!(self, Self::Open)
    }

    pub fn as_str(self) -> &'static str {
        match self {
            Self::Open => "OPEN",
            Self::Filled => "FILLED",
            Self::Cancelled => "CANCELLED",
            Self::Rejected => "REJECTED",
        }
    }

    pub fn parse(raw: &str) -> Option<Self> {
        match raw.trim().to_ascii_uppercase().as_str() {
            "OPEN" => Some(Self::Open),
            "FILLED" => Some(Self::Filled),
            "CANCELLED" => Some(Self::Cancelled),
            "REJECTED" => Some(Self::Rejected),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Order {
    pub id: Uuid,
    #[serde(skip_serializing)]
    pub user_id: Uuid,
    pub symbol: String,
    pub side: Side,
    #[serde(rename = "type")]
    pub order_type: OrderType,
    pub status: OrderStatus,
    #[serde(with = "rust_decimal::serde::str")]
    pub quantity: Decimal,
    #[serde(with = "rust_decimal::serde::str_option")]
    pub limit_price: Option<Decimal>,
    #[serde(with = "rust_decimal::serde::str")]
    pub filled_quantity: Decimal,
    #[serde(with = "rust_decimal::serde::str_option")]
    pub average_fill_price: Option<Decimal>,
    #[serde(with = "rust_decimal::serde::str")]
    pub fee: Decimal,
    pub rejection_reason: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Order {
    pub fn is_open(&self) -> bool {
        matches!(self.status, OrderStatus::Open)
    }
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CreateOrderRequest {
    pub symbol: String,
    pub side: Side,
    #[serde(rename = "type")]
    pub order_type: OrderType,
    #[serde(with = "rust_decimal::serde::str")]
    pub quantity: Decimal,
    #[serde(default, with = "rust_decimal::serde::str_option")]
    pub limit_price: Option<Decimal>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ValidatedOrder {
    pub symbol: String,
    pub side: Side,
    pub order_type: OrderType,
    pub quantity: Decimal,
    pub limit_price: Option<Decimal>,
}

/// Structural validation. Execution-price checks (market orders) happen in the
/// handler via [`validate_notional`], because only it knows the live quote.
pub fn validate_create_order(
    request: &CreateOrderRequest,
    max_notional: Decimal,
) -> Result<ValidatedOrder, ValidationError> {
    let symbol = request.symbol.trim().to_ascii_uppercase();
    if !is_valid_symbol(&symbol) {
        return Err(ValidationError::new(
            "symbol",
            "must be 1-16 characters of A-Z, 0-9 and at most one dash",
        ));
    }

    if request.quantity <= Decimal::ZERO {
        return Err(ValidationError::new(
            "quantity",
            "must be greater than zero",
        ));
    }
    if !fits_scale(request.quantity, MONEY_SCALE) {
        return Err(ValidationError::new(
            "quantity",
            format!("must have at most {MONEY_SCALE} decimal places"),
        ));
    }
    if request.quantity > Decimal::from(MAX_QUANTITY_UNITS) {
        return Err(ValidationError::new(
            "quantity",
            format!("must not exceed {MAX_QUANTITY_UNITS}"),
        ));
    }

    let limit_price = match request.order_type {
        OrderType::Market => {
            if request.limit_price.is_some() {
                return Err(ValidationError::new(
                    "limitPrice",
                    "must be omitted for market orders",
                ));
            }
            None
        }
        OrderType::Limit => {
            let price = request.limit_price.ok_or_else(|| {
                ValidationError::new("limitPrice", "is required for limit orders")
            })?;
            if price <= Decimal::ZERO {
                return Err(ValidationError::new(
                    "limitPrice",
                    "must be greater than zero",
                ));
            }
            if !fits_scale(price, MONEY_SCALE) {
                return Err(ValidationError::new(
                    "limitPrice",
                    format!("must have at most {MONEY_SCALE} decimal places"),
                ));
            }
            Some(price)
        }
    };

    if let Some(price) = limit_price {
        validate_notional(request.quantity, price, max_notional)?;
    }

    Ok(ValidatedOrder {
        symbol,
        side: request.side,
        order_type: request.order_type,
        quantity: request.quantity,
        limit_price,
    })
}

pub fn validate_notional(
    quantity: Decimal,
    price: Decimal,
    max_notional: Decimal,
) -> Result<(), ValidationError> {
    let value = notional(quantity, price);
    if value > max_notional {
        return Err(ValidationError::new(
            "quantity",
            format!("order notional {value} exceeds the limit of {max_notional}"),
        ));
    }
    Ok(())
}

pub fn is_valid_symbol(symbol: &str) -> bool {
    if symbol.is_empty() || symbol.len() > MAX_SYMBOL_LEN {
        return false;
    }
    if symbol.starts_with('-') || symbol.ends_with('-') {
        return false;
    }

    let mut dashes = 0;
    for character in symbol.chars() {
        match character {
            'A'..='Z' | '0'..='9' => {}
            '-' => {
                dashes += 1;
                if dashes > 1 {
                    return false;
                }
            }
            _ => return false,
        }
    }
    true
}

#[cfg(test)]
mod tests {
    use rust_decimal_macros::dec;

    use super::*;

    fn request(json: &str) -> CreateOrderRequest {
        serde_json::from_str(json).expect("valid create-order request")
    }

    #[test]
    fn accepts_a_well_formed_market_order() {
        let request =
            request(r#"{"symbol":"btc-usd","side":"BUY","type":"MARKET","quantity":"0.5"}"#);

        let validated = validate_create_order(&request, dec!(1_000_000)).expect("valid");

        assert_eq!(validated.symbol, "BTC-USD");
        assert_eq!(validated.side, Side::Buy);
        assert_eq!(validated.order_type, OrderType::Market);
        assert_eq!(validated.quantity, dec!(0.5));
        assert!(validated.limit_price.is_none());
    }

    #[test]
    fn accepts_a_well_formed_limit_order() {
        let request = request(
            r#"{"symbol":"AAPL","side":"SELL","type":"LIMIT","quantity":"10","limitPrice":"250.25"}"#,
        );

        let validated = validate_create_order(&request, dec!(1_000_000)).expect("valid");

        assert_eq!(validated.limit_price, Some(dec!(250.25)));
    }

    #[test]
    fn rejects_unknown_fields() {
        let error = serde_json::from_str::<CreateOrderRequest>(
            r#"{"symbol":"AAPL","side":"BUY","type":"MARKET","quantity":"1","sneaky":true}"#,
        )
        .expect_err("unknown field must be rejected");

        assert!(error.to_string().contains("sneaky"));
    }

    #[test]
    fn rejects_non_positive_quantity() {
        for quantity in ["0", "-1", "0.00000000"] {
            let request = request(&format!(
                r#"{{"symbol":"AAPL","side":"BUY","type":"MARKET","quantity":"{quantity}"}}"#
            ));
            let error = validate_create_order(&request, dec!(1_000_000)).expect_err("invalid");
            assert_eq!(error.field, "quantity");
        }
    }

    #[test]
    fn rejects_excess_precision() {
        let request =
            request(r#"{"symbol":"AAPL","side":"BUY","type":"MARKET","quantity":"0.000000001"}"#);

        let error = validate_create_order(&request, dec!(1_000_000)).expect_err("invalid");

        assert_eq!(error.field, "quantity");
    }

    #[test]
    fn rejects_market_order_with_limit_price() {
        let request = request(
            r#"{"symbol":"AAPL","side":"BUY","type":"MARKET","quantity":"1","limitPrice":"10"}"#,
        );

        let error = validate_create_order(&request, dec!(1_000_000)).expect_err("invalid");

        assert_eq!(error.field, "limitPrice");
    }

    #[test]
    fn rejects_limit_order_without_price() {
        let request = request(r#"{"symbol":"AAPL","side":"BUY","type":"LIMIT","quantity":"1"}"#);

        let error = validate_create_order(&request, dec!(1_000_000)).expect_err("invalid");

        assert_eq!(error.field, "limitPrice");
    }

    #[test]
    fn rejects_limit_orders_above_the_notional_cap() {
        let request = request(
            r#"{"symbol":"BTC-USD","side":"BUY","type":"LIMIT","quantity":"100","limitPrice":"100000"}"#,
        );

        let error = validate_create_order(&request, dec!(1_000_000)).expect_err("invalid");

        assert_eq!(error.field, "quantity");
        assert!(error.message.contains("exceeds"));
    }

    #[test]
    fn rejects_symbols_that_the_market_cannot_have() {
        for symbol in ["", "-BTC", "BTC-", "BT C", "BTC--USD", "btc/usd"] {
            assert!(!is_valid_symbol(&symbol.to_ascii_uppercase()), "{symbol}");
        }

        assert!(is_valid_symbol("BTC-USD"));
        assert!(is_valid_symbol("AAPL"));
        assert!(is_valid_symbol("X"));
    }

    #[test]
    fn market_notional_is_checked_against_the_live_price() {
        assert!(validate_notional(dec!(1), dec!(100), dec!(1_000)).is_ok());
        assert!(validate_notional(dec!(1), dec!(100_001), dec!(100_000)).is_err());
    }
}
