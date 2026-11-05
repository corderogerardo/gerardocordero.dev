//! Seeded random walk used by the simulated market-data feed.
//!
//! The walk is a pure function of `(previous price, config, rng)`, which is what
//! makes the engine deterministic and the market tests boring in the best way.

use rust_decimal::Decimal;

use super::{
    money::round_money,
    rng::{Rng, range_inclusive},
};

/// Smallest price the simulator will quote (0.0001).
fn min_price() -> Decimal {
    Decimal::new(1, 4)
}

#[derive(Debug, Clone, Copy)]
pub struct PriceWalk {
    volatility_bps: u32,
    drift_bps: i32,
}

impl PriceWalk {
    pub fn new(volatility_bps: u32, drift_bps: i32) -> Self {
        Self {
            volatility_bps,
            drift_bps,
        }
    }

    pub fn next(&self, previous: Decimal, rng: &mut impl Rng) -> Decimal {
        let span = i64::from(self.volatility_bps);
        let shock = if span == 0 {
            0
        } else {
            range_inclusive(rng, -span, span)
        };
        let total_bps = shock + i64::from(self.drift_bps);
        let factor = Decimal::ONE + Decimal::from(total_bps) / Decimal::from(10_000);
        let next = round_money(previous * factor);

        next.max(min_price())
    }
}

#[cfg(test)]
mod tests {
    use rust_decimal_macros::dec;

    use super::*;
    use crate::domain::rng::SplitMix64;

    #[test]
    fn replays_deterministically_for_a_seed() {
        let walk = PriceWalk::new(25, 5);
        let mut first_rng = SplitMix64::new(42);
        let mut second_rng = SplitMix64::new(42);

        let mut first = dec!(100.00);
        let mut second = dec!(100.00);
        for _ in 0..16 {
            first = walk.next(first, &mut first_rng);
            second = walk.next(second, &mut second_rng);
        }

        assert_eq!(first, second);
    }

    #[test]
    fn movement_stays_within_volatility_plus_drift() {
        let volatility = 25i64;
        let drift = 5i64;
        let bound = volatility + drift.abs();
        let walk = PriceWalk::new(volatility as u32, drift as i32);
        let mut rng = SplitMix64::new(3);
        let mut price = dec!(100.00);

        for _ in 0..500 {
            let next = walk.next(price, &mut rng);
            let change_bps = ((next - price) / price * dec!(10000)).round_dp(0);
            assert!(
                change_bps >= Decimal::from(-bound) && change_bps <= Decimal::from(bound),
                "change {change_bps} bps exceeded ±{bound} bps"
            );
            price = next;
        }
    }

    #[test]
    fn zero_volatility_zero_drift_keeps_the_price() {
        let walk = PriceWalk::new(0, 0);
        let mut rng = SplitMix64::new(1);

        assert_eq!(walk.next(dec!(123.45678901), &mut rng), dec!(123.45678901));
    }

    #[test]
    fn positive_drift_climbs_without_volatility() {
        let walk = PriceWalk::new(0, 10);
        let mut rng = SplitMix64::new(1);
        let mut price = dec!(100.00);

        for _ in 0..3 {
            let next = walk.next(price, &mut rng);
            assert!(next > price);
            price = next;
        }
    }

    #[test]
    fn price_never_falls_to_or_below_zero() {
        let walk = PriceWalk::new(0, -100_000);
        let mut rng = SplitMix64::new(1);

        assert_eq!(walk.next(dec!(10.00), &mut rng), min_price());
    }
}
