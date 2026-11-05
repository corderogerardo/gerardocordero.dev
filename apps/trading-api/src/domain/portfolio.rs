//! Pure position math. Handlers persist these results inside a transaction, so
//! the arithmetic can be tested without a database and without any clock.

use rust_decimal::Decimal;

use super::money::{MONEY_SCALE, round_money};

#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct PositionState {
    pub quantity: Decimal,
    pub average_cost: Decimal,
    pub realized_pnl: Decimal,
}

impl PositionState {
    pub fn new(quantity: Decimal, average_cost: Decimal, realized_pnl: Decimal) -> Self {
        Self {
            quantity,
            average_cost,
            realized_pnl,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PositionError {
    InsufficientQuantity {
        available: Decimal,
        requested: Decimal,
    },
}

/// Weighted average cost, the standard cost basis for a long-only book.
pub fn apply_buy(position: &PositionState, quantity: Decimal, price: Decimal) -> PositionState {
    let new_quantity = position.quantity + quantity;
    if new_quantity.is_zero() {
        return position.clone();
    }

    let total_cost = position.quantity * position.average_cost + quantity * price;

    PositionState {
        quantity: new_quantity,
        average_cost: round_money(total_cost / new_quantity),
        realized_pnl: position.realized_pnl,
    }
}

/// Selling keeps the average cost of the remaining units and books realized P&L
/// net of fees. Short selling is intentionally rejected.
pub fn apply_sell(
    position: &PositionState,
    quantity: Decimal,
    price: Decimal,
    fee: Decimal,
) -> Result<PositionState, PositionError> {
    if quantity > position.quantity {
        return Err(PositionError::InsufficientQuantity {
            available: position.quantity,
            requested: quantity,
        });
    }

    let realized = (price - position.average_cost) * quantity - fee;
    let remaining = position.quantity - quantity;

    Ok(PositionState {
        quantity: remaining,
        average_cost: if remaining.is_zero() {
            Decimal::ZERO
        } else {
            position.average_cost
        },
        realized_pnl: round_money(position.realized_pnl + realized),
    })
}

pub fn market_value(quantity: Decimal, price: Decimal) -> Decimal {
    round_money(quantity * price)
}

pub fn unrealized_pnl(position: &PositionState, price: Decimal) -> Decimal {
    round_money((price - position.average_cost) * position.quantity)
}

/// Fractional return of the position, used by the mobile portfolio card.
pub fn unrealized_pnl_percent(position: &PositionState, price: Decimal) -> Decimal {
    if position.average_cost.is_zero() || position.quantity.is_zero() {
        return Decimal::ZERO;
    }
    ((price - position.average_cost) / position.average_cost * Decimal::from(100))
        .round_dp(MONEY_SCALE.min(4))
}

#[cfg(test)]
mod tests {
    use rust_decimal_macros::dec;

    use super::*;

    #[test]
    fn buying_weights_the_average_cost() {
        let position = PositionState::new(dec!(10), dec!(100), Decimal::ZERO);

        let updated = apply_buy(&position, dec!(10), dec!(200));

        assert_eq!(updated.quantity, dec!(20));
        assert_eq!(updated.average_cost, dec!(150));
        assert_eq!(updated.realized_pnl, Decimal::ZERO);
    }

    #[test]
    fn partial_sell_keeps_the_average_cost() {
        let position = PositionState::new(dec!(20), dec!(150), Decimal::ZERO);

        let updated = apply_sell(&position, dec!(5), dec!(200), dec!(1)).expect("sell");

        assert_eq!(updated.quantity, dec!(15));
        assert_eq!(updated.average_cost, dec!(150));
        assert_eq!(updated.realized_pnl, dec!(249));
    }

    #[test]
    fn closing_the_position_resets_the_basis() {
        let position = PositionState::new(dec!(4), dec!(50), dec!(10));

        let updated = apply_sell(&position, dec!(4), dec!(60), dec!(0.24)).expect("sell");

        assert_eq!(updated.quantity, Decimal::ZERO);
        assert_eq!(updated.average_cost, Decimal::ZERO);
        assert_eq!(updated.realized_pnl, dec!(49.76));
    }

    #[test]
    fn selling_more_than_owned_is_rejected() {
        let position = PositionState::new(dec!(1), dec!(100), Decimal::ZERO);

        let error = apply_sell(&position, dec!(2), dec!(100), Decimal::ZERO).expect_err("oversell");

        assert_eq!(
            error,
            PositionError::InsufficientQuantity {
                available: dec!(1),
                requested: dec!(2)
            }
        );
    }

    #[test]
    fn unrealized_pnl_and_percent_track_the_market_price() {
        let position = PositionState::new(dec!(10), dec!(100), Decimal::ZERO);

        assert_eq!(market_value(dec!(10), dec!(125)), dec!(1250));
        assert_eq!(unrealized_pnl(&position, dec!(125)), dec!(250));
        assert_eq!(unrealized_pnl_percent(&position, dec!(125)), dec!(25));
    }

    #[test]
    fn percentages_are_zero_for_empty_positions() {
        let position = PositionState::default();

        assert_eq!(unrealized_pnl_percent(&position, dec!(99)), Decimal::ZERO);
    }
}
