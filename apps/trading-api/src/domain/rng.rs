//! Deterministic pseudo-random source. The market simulator must be reproducible
//! from a seed: a flaky price feed would make the trading tests flaky too.
//!
//! `SplitMix64` is a small, well-known generator — good enough for simulation,
//! never used for tokens or anything security-sensitive.

pub trait Rng {
    fn next_u64(&mut self) -> u64;
}

#[derive(Debug, Clone)]
pub struct SplitMix64 {
    state: u64,
}

impl SplitMix64 {
    pub fn new(seed: u64) -> Self {
        Self { state: seed }
    }
}

impl Rng for SplitMix64 {
    fn next_u64(&mut self) -> u64 {
        self.state = self.state.wrapping_add(0x9E37_79B9_7F4A_7C15);
        let mut z = self.state;
        z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
        z ^ (z >> 31)
    }
}

/// Inclusive range without modulo bias, using the high bits of a widening
/// multiply (Lemire's method).
pub fn range_inclusive(rng: &mut impl Rng, low: i64, high: i64) -> i64 {
    assert!(low <= high, "empty range: {low}..={high}");
    let span = (high - low) as u128 + 1;
    let scaled = ((rng.next_u64() as u128) * span) >> 64;
    low + scaled as i64
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn same_seed_replays_the_same_sequence() {
        let mut first = SplitMix64::new(42);
        let mut second = SplitMix64::new(42);

        let a: Vec<u64> = (0..8).map(|_| first.next_u64()).collect();
        let b: Vec<u64> = (0..8).map(|_| second.next_u64()).collect();

        assert_eq!(a, b);
    }

    #[test]
    fn different_seeds_diverge() {
        let mut first = SplitMix64::new(1);
        let mut second = SplitMix64::new(2);

        assert_ne!(first.next_u64(), second.next_u64());
    }

    #[test]
    fn range_stays_inclusive_and_covers_both_ends() {
        let mut rng = SplitMix64::new(7);
        let mut seen_low = false;
        let mut seen_high = false;

        for _ in 0..10_000 {
            let value = range_inclusive(&mut rng, -3, 3);
            assert!((-3..=3).contains(&value));
            seen_low |= value == -3;
            seen_high |= value == 3;
        }

        assert!(seen_low && seen_high);
    }

    #[test]
    fn single_value_range_is_that_value() {
        let mut rng = SplitMix64::new(9);
        assert_eq!(range_inclusive(&mut rng, 5, 5), 5);
    }
}
