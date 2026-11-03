//! Application service: everything that moves money.
//!
//! Invariants, in order:
//! 1. One database transaction per economic effect.
//! 2. Account row first, then position row — the only lock order used.
//! 3. Order rows are locked `FOR UPDATE` and their status is re-checked, so a
//!    limit order can fill at most once even under concurrent sweeps.
//! 4. Idempotency keys are claimed with one atomic insert, in the same
//!    transaction as the order they describe.

use chrono::Utc;
use rust_decimal::Decimal;
use sqlx::PgConnection;
use uuid::Uuid;

use crate::{
    domain::{
        money,
        order::{
            CreateOrderRequest, Order, OrderStatus, OrderType, Side, validate_create_order,
            validate_notional,
        },
        portfolio::{PositionState, apply_buy, apply_sell},
    },
    error::{AppError, AppResult},
    hashing::sha256_hex,
    state::AppState,
    store::{self, orders::NewOrder, positions::PositionRow, trades::NewTrade},
};

#[derive(Debug, Clone)]
pub struct CreatedOrder {
    pub order: Order,
    pub created: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FillOutcome {
    Filled,
    Rejected,
    Skipped,
}

pub async fn create_order(
    state: &AppState,
    user_id: Uuid,
    request: CreateOrderRequest,
    idempotency_key: &str,
) -> AppResult<CreatedOrder> {
    let validated = validate_create_order(&request, state.config.max_order_notional)?;
    let fingerprint = request_fingerprint(&validated);

    // Market orders need a price before the transaction opens; limit orders need
    // one only to enforce the notional cap at placement.
    let market_price = state
        .market
        .quote(&validated.symbol)
        .ok_or_else(|| AppError::not_found(format!("no market for {}", validated.symbol)))?
        .price;

    let mut transaction = state.db.begin().await?;

    match store::idempotency::claim(&mut transaction, user_id, idempotency_key, &fingerprint)
        .await?
    {
        store::idempotency::Claim::Claimed => {}
        store::idempotency::Claim::Replay {
            request_hash,
            order_id,
        } => {
            if request_hash != fingerprint {
                return Err(AppError::idempotency_key_reused(
                    "this idempotency key was already used with a different order",
                ));
            }

            let Some(order_id) = order_id else {
                return Err(AppError::conflict(
                    "REQUEST_IN_PROGRESS",
                    "an identical request is still being processed",
                ));
            };

            let order = store::orders::get_for_user(&mut transaction, user_id, order_id)
                .await?
                .ok_or_else(|| AppError::internal("idempotency key points at a missing order"))?;

            transaction.commit().await?;

            return Ok(CreatedOrder {
                order,
                created: false,
            });
        }
    }

    let account = store::accounts::lock(&mut transaction, user_id)
        .await?
        .ok_or_else(|| AppError::internal("authenticated user has no account"))?;

    let order = match validated.order_type {
        OrderType::Market => {
            execute_market(
                state,
                &mut transaction,
                user_id,
                account.cash,
                &validated,
                market_price,
            )
            .await?
        }
        OrderType::Limit => {
            validate_notional(
                validated.quantity,
                validated.limit_price.unwrap_or(market_price),
                state.config.max_order_notional,
            )?;

            store::orders::insert(
                &mut transaction,
                &NewOrder {
                    user_id,
                    symbol: &validated.symbol,
                    side: validated.side,
                    order_type: OrderType::Limit,
                    status: OrderStatus::Open,
                    quantity: validated.quantity,
                    limit_price: validated.limit_price,
                    filled_quantity: Decimal::ZERO,
                    average_fill_price: None,
                    fee: Decimal::ZERO,
                    rejection_reason: None,
                },
            )
            .await?
        }
    };

    record_order_audit(&mut transaction, user_id, &order).await?;
    store::idempotency::complete(&mut transaction, user_id, idempotency_key, order.id).await?;
    transaction.commit().await?;

    Ok(CreatedOrder {
        order,
        created: true,
    })
}

async fn execute_market(
    state: &AppState,
    connection: &mut PgConnection,
    user_id: Uuid,
    cash: Decimal,
    order: &crate::domain::order::ValidatedOrder,
    price: Decimal,
) -> AppResult<Order> {
    validate_notional(order.quantity, price, state.config.max_order_notional)?;

    let notional = money::notional(order.quantity, price);
    let fee = money::fee_for(notional, state.config.fee_bps);

    let (new_cash, position) = match order.side {
        Side::Buy => {
            let cost = notional + fee;
            if cash < cost {
                return Err(AppError::unprocessable(
                    "INSUFFICIENT_FUNDS",
                    format!("this order needs {cost} but the account holds {cash}"),
                    Some("quantity"),
                ));
            }

            let previous = load_position(connection, user_id, &order.symbol).await?;
            let updated = apply_buy(&previous, order.quantity, price);
            (cash - cost, updated)
        }
        Side::Sell => {
            let previous = load_position(connection, user_id, &order.symbol).await?;
            let updated = apply_sell(&previous, order.quantity, price, fee).map_err(|_| {
                AppError::unprocessable(
                    "INSUFFICIENT_POSITION",
                    "the account does not hold enough units for this order",
                    Some("quantity"),
                )
            })?;
            (cash + notional - fee, updated)
        }
    };

    store::accounts::set_cash(connection, user_id, new_cash).await?;
    store::positions::upsert(connection, &position_row(user_id, &order.symbol, &position)).await?;

    let created = store::orders::insert(
        connection,
        &NewOrder {
            user_id,
            symbol: &order.symbol,
            side: order.side,
            order_type: OrderType::Market,
            status: OrderStatus::Filled,
            quantity: order.quantity,
            limit_price: None,
            filled_quantity: order.quantity,
            average_fill_price: Some(price),
            fee,
            rejection_reason: None,
        },
    )
    .await?;

    store::trades::insert(
        connection,
        &NewTrade {
            order_id: created.id,
            user_id,
            symbol: &order.symbol,
            side: order.side.as_str(),
            quantity: order.quantity,
            price,
            fee,
        },
    )
    .await?;

    Ok(created)
}

/// Fills one resting limit order at the best price the limit allows.
pub async fn fill_limit_order(
    state: &AppState,
    order_id: Uuid,
    market_price: Decimal,
) -> AppResult<FillOutcome> {
    let mut transaction = state.db.begin().await?;

    let Some(order) = store::orders::lock(&mut transaction, order_id).await? else {
        return Ok(FillOutcome::Skipped);
    };
    if !order.is_open() {
        return Ok(FillOutcome::Skipped);
    }

    let limit = order.limit_price.unwrap_or(market_price);
    let price = match order.side {
        Side::Buy => market_price.min(limit),
        Side::Sell => market_price.max(limit),
    };
    if price <= Decimal::ZERO {
        return Ok(FillOutcome::Skipped);
    }

    let Some(account) = store::accounts::lock(&mut transaction, order.user_id).await? else {
        return Ok(FillOutcome::Skipped);
    };

    let notional = money::notional(order.quantity, price);
    let fee = money::fee_for(notional, state.config.fee_bps);

    let applied = match order.side {
        Side::Buy => {
            let cost = notional + fee;
            if account.cash < cost {
                None
            } else {
                let previous =
                    load_position(&mut transaction, order.user_id, &order.symbol).await?;
                Some((
                    account.cash - cost,
                    apply_buy(&previous, order.quantity, price),
                ))
            }
        }
        Side::Sell => {
            let previous = load_position(&mut transaction, order.user_id, &order.symbol).await?;
            match apply_sell(&previous, order.quantity, price, fee) {
                Ok(updated) => Some((account.cash + notional - fee, updated)),
                Err(_) => None,
            }
        }
    };

    let Some((new_cash, position)) = applied else {
        let reason = match order.side {
            Side::Buy => "insufficient_funds",
            Side::Sell => "insufficient_position",
        };
        let rejected = store::orders::mark_rejected(&mut transaction, order.id, reason).await?;
        store::audit::record(
            &mut transaction,
            Some(order.user_id),
            "order.rejected",
            Some(&order.id.to_string()),
            serde_json::json!({ "reason": reason, "symbol": order.symbol }),
        )
        .await?;
        transaction.commit().await?;

        return Ok(if rejected.is_some() {
            FillOutcome::Rejected
        } else {
            FillOutcome::Skipped
        });
    };

    store::accounts::set_cash(&mut transaction, order.user_id, new_cash).await?;
    store::positions::upsert(
        &mut transaction,
        &position_row(order.user_id, &order.symbol, &position),
    )
    .await?;

    let filled =
        store::orders::mark_filled(&mut transaction, order.id, order.quantity, price, fee).await?;
    if filled.is_none() {
        // Another worker won the race between the lock check and the update.
        transaction.rollback().await?;
        return Ok(FillOutcome::Skipped);
    }

    store::trades::insert(
        &mut transaction,
        &NewTrade {
            order_id: order.id,
            user_id: order.user_id,
            symbol: &order.symbol,
            side: order.side.as_str(),
            quantity: order.quantity,
            price,
            fee,
        },
    )
    .await?;

    store::audit::record(
        &mut transaction,
        Some(order.user_id),
        "order.filled",
        Some(&order.id.to_string()),
        serde_json::json!({
            "symbol": order.symbol,
            "price": price.to_string(),
            "fee": fee.to_string(),
        }),
    )
    .await?;

    transaction.commit().await?;

    Ok(FillOutcome::Filled)
}

pub async fn sweep_symbol(state: &AppState, symbol: &str) -> AppResult<usize> {
    let Some(quote) = state.market.quote(symbol) else {
        return Ok(0);
    };

    let candidates = {
        let mut connection = state.db.acquire().await?;
        store::orders::open_limit_candidates(&mut connection, symbol, quote.price, 50).await?
    };

    let mut filled = 0;
    for order_id in candidates {
        if matches!(
            fill_limit_order(state, order_id, quote.price).await?,
            FillOutcome::Filled
        ) {
            filled += 1;
        }
    }

    Ok(filled)
}

/// Long-running task: every quote tick triggers a sweep of that instrument's
/// resting limit orders.
pub fn spawn_matcher(state: AppState) -> tokio::task::JoinHandle<()> {
    let mut receiver = state.market.subscribe();

    tokio::spawn(async move {
        loop {
            match receiver.recv().await {
                Ok(event) => {
                    if let Err(error) = sweep_symbol(&state, &event.symbol).await {
                        tracing::error!(
                            symbol = %event.symbol,
                            error = %error,
                            "limit order matching failed"
                        );
                    }
                }
                Err(tokio::sync::broadcast::error::RecvError::Lagged(skipped)) => {
                    tracing::warn!(skipped, "matcher lagged behind market events");
                }
                Err(tokio::sync::broadcast::error::RecvError::Closed) => break,
            }
        }
    })
}

async fn load_position(
    connection: &mut PgConnection,
    user_id: Uuid,
    symbol: &str,
) -> AppResult<PositionState> {
    Ok(store::positions::lock(connection, user_id, symbol)
        .await?
        .map(|row| PositionState::new(row.quantity, row.average_cost, row.realized_pnl))
        .unwrap_or_default())
}

fn position_row(user_id: Uuid, symbol: &str, state: &PositionState) -> PositionRow {
    PositionRow {
        user_id,
        symbol: symbol.to_string(),
        quantity: state.quantity,
        average_cost: state.average_cost,
        realized_pnl: state.realized_pnl,
        updated_at: Utc::now(),
    }
}

async fn record_order_audit(
    connection: &mut PgConnection,
    user_id: Uuid,
    order: &Order,
) -> AppResult<()> {
    let action = if order.is_open() {
        "order.placed"
    } else {
        "order.filled"
    };

    store::audit::record(
        connection,
        Some(user_id),
        action,
        Some(&order.id.to_string()),
        serde_json::json!({
            "symbol": order.symbol,
            "side": order.side.as_str(),
            "type": order.order_type.as_str(),
            "quantity": order.quantity.to_string(),
        }),
    )
    .await?;

    Ok(())
}

/// Stable fingerprint of the economic intent. The same key with a different
/// payload is a client bug and must fail loudly instead of replaying.
fn request_fingerprint(order: &crate::domain::order::ValidatedOrder) -> String {
    sha256_hex(&format!(
        "v1|{}|{}|{}|{}|{}",
        order.symbol,
        order.side.as_str(),
        order.order_type.as_str(),
        order.quantity.normalize(),
        order
            .limit_price
            .map(|price| price.normalize().to_string())
            .unwrap_or_default()
    ))
}

#[cfg(test)]
mod tests {
    use rust_decimal_macros::dec;

    use super::*;
    use crate::domain::order::ValidatedOrder;

    fn validated(side: Side, order_type: OrderType, quantity: Decimal) -> ValidatedOrder {
        ValidatedOrder {
            symbol: "BTC-USD".to_string(),
            side,
            order_type,
            quantity,
            limit_price: None,
        }
    }

    #[test]
    fn fingerprint_is_stable_across_scale_noise() {
        let first = validated(Side::Buy, OrderType::Market, dec!(1.5));
        let second = validated(Side::Buy, OrderType::Market, dec!(1.50000000));

        assert_eq!(request_fingerprint(&first), request_fingerprint(&second));
    }

    #[test]
    fn fingerprint_changes_with_economic_intent() {
        let base = validated(Side::Buy, OrderType::Market, dec!(1));
        let other_side = validated(Side::Sell, OrderType::Market, dec!(1));
        let other_quantity = validated(Side::Buy, OrderType::Market, dec!(2));

        assert_ne!(request_fingerprint(&base), request_fingerprint(&other_side));
        assert_ne!(
            request_fingerprint(&base),
            request_fingerprint(&other_quantity)
        );
    }
}
