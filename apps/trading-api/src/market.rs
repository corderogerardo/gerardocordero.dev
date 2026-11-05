//! In-memory market data engine.
//!
//! Prices are simulated, deterministic per seed, and fanned out through a Tokio
//! broadcast channel. Swapping this for a real venue feed means replacing this
//! module and the `Quote` source; the rest of the system only depends on the
//! `MarketEngine` surface.

use std::{
    collections::{BTreeMap, VecDeque},
    sync::{Arc, PoisonError, RwLock},
};

use chrono::{DateTime, Timelike, Utc};
use rust_decimal::Decimal;
use serde::Serialize;
use tokio::sync::broadcast;

use crate::{
    config::MarketConfig,
    domain::{price::PriceWalk, rng::SplitMix64},
};

const EVENT_BUFFER: usize = 1_024;
const MIN_HISTORY_CAPACITY: usize = 2;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, sqlx::Type)]
#[serde(rename_all = "UPPERCASE")]
#[sqlx(type_name = "text", rename_all = "UPPERCASE")]
pub enum InstrumentKind {
    Crypto,
    Equity,
}

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Instrument {
    pub symbol: String,
    pub name: String,
    pub kind: InstrumentKind,
    pub currency: String,
    #[serde(with = "rust_decimal::serde::str")]
    pub tick_size: Decimal,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Quote {
    pub symbol: String,
    #[serde(with = "rust_decimal::serde::str")]
    pub price: Decimal,
    #[serde(with = "rust_decimal::serde::str")]
    pub change_percent: Decimal,
    #[serde(with = "rust_decimal::serde::str")]
    pub session_open: Decimal,
    #[serde(with = "rust_decimal::serde::str")]
    pub high: Decimal,
    #[serde(with = "rust_decimal::serde::str")]
    pub low: Decimal,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PricePoint {
    pub t: DateTime<Utc>,
    #[serde(with = "rust_decimal::serde::str")]
    pub p: Decimal,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuoteEvent {
    pub symbol: String,
    #[serde(with = "rust_decimal::serde::str")]
    pub price: Decimal,
    pub at: DateTime<Utc>,
}

struct InstrumentState {
    instrument: Instrument,
    quote: Quote,
    session_open: Decimal,
    history: VecDeque<PricePoint>,
    rng: SplitMix64,
}

pub struct MarketEngine {
    config: MarketConfig,
    walk: PriceWalk,
    book: RwLock<BTreeMap<String, InstrumentState>>,
    events: broadcast::Sender<QuoteEvent>,
}

impl MarketEngine {
    pub fn new(instruments: Vec<Instrument>, config: MarketConfig) -> Self {
        let (events, _) = broadcast::channel(EVENT_BUFFER);
        let walk = PriceWalk::new(config.volatility_bps, config.drift_bps);
        let capacity = config.history_points.max(MIN_HISTORY_CAPACITY);
        let now = Utc::now();
        let mut book = BTreeMap::new();

        for instrument in instruments {
            let mut rng = SplitMix64::new(config.seed ^ fnv1a(instrument.symbol.as_bytes()));
            let mut price = initial_price(&instrument.symbol);
            let mut history = VecDeque::with_capacity(capacity);

            for index in 0..capacity {
                if index > 0 {
                    price = walk.next(price, &mut rng);
                }
                let minutes_ago = (capacity - 1 - index) as i64;
                history.push_back(PricePoint {
                    t: minute_bucket(now - chrono::Duration::minutes(minutes_ago)),
                    p: price,
                });
            }

            let session_open = history.front().map(|point| point.p).unwrap_or(price);
            let high = history.iter().map(|point| point.p).max().unwrap_or(price);
            let low = history.iter().map(|point| point.p).min().unwrap_or(price);
            let quote = Quote {
                symbol: instrument.symbol.clone(),
                price,
                change_percent: change_percent(price, session_open),
                session_open,
                high,
                low,
                updated_at: now,
            };

            book.insert(
                instrument.symbol.clone(),
                InstrumentState {
                    instrument,
                    quote,
                    session_open,
                    history,
                    rng,
                },
            );
        }

        Self {
            config,
            walk,
            book: RwLock::new(book),
            events,
        }
    }

    pub fn quotes(&self) -> Vec<Quote> {
        let book = self.book.read().unwrap_or_else(PoisonError::into_inner);
        book.values().map(|state| state.quote.clone()).collect()
    }

    pub fn quote(&self, symbol: &str) -> Option<Quote> {
        let book = self.book.read().unwrap_or_else(PoisonError::into_inner);
        book.get(symbol).map(|state| state.quote.clone())
    }

    pub fn instrument(&self, symbol: &str) -> Option<Instrument> {
        let book = self.book.read().unwrap_or_else(PoisonError::into_inner);
        book.get(symbol).map(|state| state.instrument.clone())
    }

    pub fn history(&self, symbol: &str, points: usize) -> Option<Vec<PricePoint>> {
        let book = self.book.read().unwrap_or_else(PoisonError::into_inner);
        let state = book.get(symbol)?;
        let take = points.max(MIN_HISTORY_CAPACITY);
        let skip = state.history.len().saturating_sub(take);

        Some(state.history.iter().skip(skip).cloned().collect())
    }

    pub fn contains(&self, symbol: &str) -> bool {
        let book = self.book.read().unwrap_or_else(PoisonError::into_inner);
        book.contains_key(symbol)
    }

    pub fn symbols(&self) -> Vec<String> {
        let book = self.book.read().unwrap_or_else(PoisonError::into_inner);
        book.keys().cloned().collect()
    }

    pub fn subscribe(&self) -> broadcast::Receiver<QuoteEvent> {
        self.events.subscribe()
    }

    /// Advances every instrument by one step and returns the emitted events.
    pub fn tick(&self) -> Vec<QuoteEvent> {
        let now = Utc::now();
        let capacity = self.config.history_points.max(MIN_HISTORY_CAPACITY);
        let mut emitted = Vec::new();

        {
            let mut book = self.book.write().unwrap_or_else(PoisonError::into_inner);
            for state in book.values_mut() {
                let next = self.walk.next(state.quote.price, &mut state.rng);
                state.quote.price = next;
                state.quote.high = state.quote.high.max(next);
                state.quote.low = state.quote.low.min(next);
                state.quote.change_percent = change_percent(next, state.session_open);
                state.quote.updated_at = now;
                update_history(&mut state.history, now, next, capacity);

                emitted.push(QuoteEvent {
                    symbol: state.instrument.symbol.clone(),
                    price: next,
                    at: now,
                });
            }
        }

        for event in &emitted {
            let _ = self.events.send(event.clone());
        }

        emitted
    }

    /// Test- and demo-only hook that forces a quote, letting order-matching
    /// tests cross a limit price without waiting for the random walk.
    pub fn set_price(&self, symbol: &str, price: Decimal) -> bool {
        let now = Utc::now();
        let capacity = self.config.history_points.max(MIN_HISTORY_CAPACITY);

        let Some(event) = ({
            let mut book = self.book.write().unwrap_or_else(PoisonError::into_inner);
            book.get_mut(symbol).map(|state| {
                state.quote.price = price;
                state.quote.high = state.quote.high.max(price);
                state.quote.low = state.quote.low.min(price);
                state.quote.change_percent = change_percent(price, state.session_open);
                state.quote.updated_at = now;
                update_history(&mut state.history, now, price, capacity);

                QuoteEvent {
                    symbol: symbol.to_string(),
                    price,
                    at: now,
                }
            })
        }) else {
            return false;
        };

        let _ = self.events.send(event);
        true
    }

    pub fn spawn_ticker(self: &Arc<Self>) -> tokio::task::JoinHandle<()> {
        let engine = Arc::clone(self);

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(engine.config.tick_interval);
            interval.set_missed_tick_behavior(tokio::time::MissedTickBehavior::Skip);
            loop {
                interval.tick().await;
                engine.tick();
            }
        })
    }
}

fn minute_bucket(at: DateTime<Utc>) -> DateTime<Utc> {
    at.with_second(0)
        .and_then(|value| value.with_nanosecond(0))
        .unwrap_or(at)
}

fn update_history(
    history: &mut VecDeque<PricePoint>,
    now: DateTime<Utc>,
    price: Decimal,
    capacity: usize,
) {
    let bucket = minute_bucket(now);

    if let Some(last) = history.back_mut()
        && minute_bucket(last.t) == bucket
    {
        last.p = price;
        return;
    }

    history.push_back(PricePoint {
        t: bucket,
        p: price,
    });
    while history.len() > capacity {
        history.pop_front();
    }
}

fn change_percent(price: Decimal, session_open: Decimal) -> Decimal {
    if session_open <= Decimal::ZERO {
        return Decimal::ZERO;
    }

    ((price - session_open) / session_open * Decimal::from(100)).round_dp(4)
}

fn initial_price(symbol: &str) -> Decimal {
    use rust_decimal_macros::dec;

    match symbol {
        "BTC-USD" => dec!(64250.00),
        "ETH-USD" => dec!(3150.00),
        "SOL-USD" => dec!(148.50),
        "AAPL" => dec!(226.40),
        "TSLA" => dec!(248.75),
        "NVDA" => dec!(121.30),
        _ => dec!(100.00),
    }
}

fn fnv1a(bytes: &[u8]) -> u64 {
    let mut hash = 0xcbf2_9ce4_8422_2325u64;

    for byte in bytes {
        hash ^= u64::from(*byte);
        hash = hash.wrapping_mul(0x0000_0100_0000_01b3);
    }

    hash
}

#[cfg(test)]
mod tests {
    use rust_decimal_macros::dec;

    use super::*;

    fn instruments() -> Vec<Instrument> {
        vec![
            Instrument {
                symbol: "BTC-USD".to_string(),
                name: "Bitcoin / US Dollar".to_string(),
                kind: InstrumentKind::Crypto,
                currency: "USD".to_string(),
                tick_size: dec!(0.01),
            },
            Instrument {
                symbol: "AAPL".to_string(),
                name: "Apple Inc.".to_string(),
                kind: InstrumentKind::Equity,
                currency: "USD".to_string(),
                tick_size: dec!(0.01),
            },
        ]
    }

    #[test]
    fn replays_deterministically_for_a_seed() {
        let config = MarketConfig::for_tests();
        let first = MarketEngine::new(instruments(), config.clone());
        let second = MarketEngine::new(instruments(), config);

        for _ in 0..20 {
            first.tick();
            second.tick();
        }

        let snapshot = |engine: &MarketEngine| {
            engine
                .quotes()
                .into_iter()
                .map(|quote| {
                    (
                        quote.symbol,
                        quote.price,
                        quote.high,
                        quote.low,
                        quote.change_percent,
                    )
                })
                .collect::<Vec<_>>()
        };

        assert_eq!(snapshot(&first), snapshot(&second));
    }

    #[test]
    fn builds_a_history_of_the_requested_length() {
        let engine = MarketEngine::new(instruments(), MarketConfig::for_tests());
        let history = engine.history("BTC-USD", 60).expect("history");

        assert_eq!(history.len(), 60);
        assert!(history.windows(2).all(|pair| pair[0].t <= pair[1].t));
        assert_eq!(
            history.last().map(|point| point.p),
            engine.quote("BTC-USD").map(|quote| quote.price)
        );
    }

    #[test]
    fn tick_keeps_quotes_consistent() {
        let engine = MarketEngine::new(instruments(), MarketConfig::for_tests());
        let before = engine.quote("AAPL").expect("quote");

        engine.tick();

        let after = engine.quote("AAPL").expect("quote");
        assert!(after.price > Decimal::ZERO);
        assert!(after.high >= after.price);
        assert!(after.low <= after.price);
        assert!(after.updated_at >= before.updated_at);
    }

    #[test]
    fn set_price_updates_the_quote_and_broadcasts() {
        let engine = MarketEngine::new(instruments(), MarketConfig::for_tests());
        let mut receiver = engine.subscribe();

        assert!(engine.set_price("BTC-USD", dec!(70000.00)));
        assert_eq!(
            engine.quote("BTC-USD").expect("quote").price,
            dec!(70000.00)
        );

        let event = receiver.try_recv().expect("broadcast event");
        assert_eq!(event.symbol, "BTC-USD");
        assert_eq!(event.price, dec!(70000.00));
    }

    #[test]
    fn unknown_symbols_are_absent() {
        let engine = MarketEngine::new(instruments(), MarketConfig::for_tests());

        assert!(engine.quote("NOPE").is_none());
        assert!(engine.history("NOPE", 10).is_none());
        assert!(!engine.set_price("NOPE", dec!(1.00)));
        assert!(!engine.contains("NOPE"));
    }

    #[test]
    fn change_percent_is_signed_and_rounded() {
        assert_eq!(change_percent(dec!(110), dec!(100)), dec!(10));
        assert_eq!(change_percent(dec!(90), dec!(100)), dec!(-10));
        assert_eq!(change_percent(dec!(100), Decimal::ZERO), Decimal::ZERO);
    }

    #[test]
    fn symbols_are_listed_in_a_stable_order() {
        let engine = MarketEngine::new(instruments(), MarketConfig::for_tests());

        assert_eq!(
            engine.symbols(),
            vec!["AAPL".to_string(), "BTC-USD".to_string()]
        );
    }
}
