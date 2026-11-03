//! Money rules live in one place so no handler can quietly invent its own
//! rounding. Every value that reaches the database or the wire is rounded to
//! eight decimal places, matching `NUMERIC(20, 8)`.

use rust_decimal::Decimal;

/// Matches the scale of every money column in the schema.
pub const MONEY_SCALE: u32 = 8;
pub const BPS_DENOMINATOR: u32 = 10_000;

pub fn round_money(value: Decimal) -> Decimal {
    value.round_dp(MONEY_SCALE)
}

pub fn notional(quantity: Decimal, price: Decimal) -> Decimal {
    round_money(quantity * price)
}

/// Fee charged on the executed notional. Rounded in the platform's favour by
/// rounding half away from zero, which keeps the invariant `fee >= 0`.
pub fn fee_for(notional: Decimal, fee_bps: u32) -> Decimal {
    let raw = notional * Decimal::from(fee_bps) / Decimal::from(BPS_DENOMINATOR);
    round_money(raw.max(Decimal::ZERO))
}

/// True when the value does not carry more precision than the schema stores.
/// `1.50000000` is accepted because `normalize` drops the trailing zeros.
pub fn fits_scale(value: Decimal, scale: u32) -> bool {
    value.normalize().scale() <= scale
}

#[cfg(test)]
mod tests {
    use rust_decimal_macros::dec;

    use super::*;

    #[test]
    fn notional_is_rounded_to_schema_scale() {
        assert_eq!(notional(dec!(0.333333333), dec!(3.00)), dec!(1.00000000));
        assert_eq!(notional(dec!(2), dec!(10.123456789)), dec!(20.24691358));
    }

    #[test]
    fn fee_uses_basis_points() {
        assert_eq!(fee_for(dec!(1000.00), 10), dec!(1.00000000));
        assert_eq!(fee_for(dec!(0.01), 10), dec!(0.00001000));
        assert_eq!(fee_for(dec!(100.00), 0), dec!(0.00000000));
    }

    #[test]
    fn fee_is_never_negative() {
        assert_eq!(fee_for(dec!(-50), 10), dec!(0));
    }

    #[test]
    fn scale_check_ignores_trailing_zeros() {
        assert!(fits_scale(dec!(1.50000000), 8));
        assert!(!fits_scale(dec!(0.000000001), 8));
        assert!(fits_scale(dec!(1000000), 8));
    }
}
