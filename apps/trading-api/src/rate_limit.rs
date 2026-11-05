//! Fixed-window rate limiting, keyed by scope and client address.
//!
//! A fixed window is deliberate: it is easy to reason about, has no background
//! work, and is enough to blunt credential stuffing and order spam. A sliding
//! window or token bucket can replace it without touching call sites.

use std::time::{Duration, Instant};

use dashmap::DashMap;

use crate::config::Limit;

const PRUNE_THRESHOLD: usize = 10_000;
const MAX_TRACKED_WINDOW: Duration = Duration::from_secs(86_400);

#[derive(Debug, Clone, Copy)]
struct WindowState {
    started: Instant,
    count: u32,
}

#[derive(Debug, Default)]
pub struct RateLimiter {
    windows: DashMap<String, WindowState>,
}

impl RateLimiter {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn check(&self, key: &str, limit: Limit) -> bool {
        self.check_at(key, limit, Instant::now())
    }

    /// Injectable clock so the reset behaviour is testable without sleeping.
    pub fn check_at(&self, key: &str, limit: Limit, now: Instant) -> bool {
        if limit.max_requests == 0 {
            return false;
        }

        if self.windows.len() > PRUNE_THRESHOLD {
            self.prune(now);
        }

        let mut entry = self.windows.entry(key.to_string()).or_insert(WindowState {
            started: now,
            count: 0,
        });

        if now.saturating_duration_since(entry.started) >= limit.window {
            entry.started = now;
            entry.count = 0;
        }

        if entry.count >= limit.max_requests {
            return false;
        }

        entry.count += 1;
        true
    }

    pub fn prune(&self, now: Instant) {
        self.windows
            .retain(|_, window| now.saturating_duration_since(window.started) < MAX_TRACKED_WINDOW);
    }

    pub fn tracked_keys(&self) -> usize {
        self.windows.len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn limit(max_requests: u32, seconds: u64) -> Limit {
        Limit::new(max_requests, Duration::from_secs(seconds))
    }

    #[test]
    fn allows_up_to_the_limit_then_blocks() {
        let limiter = RateLimiter::new();
        let now = Instant::now();
        let policy = limit(3, 60);

        for _ in 0..3 {
            assert!(limiter.check_at("login:127.0.0.1", policy, now));
        }

        assert!(!limiter.check_at("login:127.0.0.1", policy, now));
    }

    #[test]
    fn resets_after_the_window() {
        let limiter = RateLimiter::new();
        let now = Instant::now();
        let policy = limit(1, 60);

        assert!(limiter.check_at("login:127.0.0.1", policy, now));
        assert!(!limiter.check_at("login:127.0.0.1", policy, now));

        let later = now + Duration::from_secs(61);

        assert!(limiter.check_at("login:127.0.0.1", policy, later));
    }

    #[test]
    fn keeps_keys_independent() {
        let limiter = RateLimiter::new();
        let now = Instant::now();
        let policy = limit(1, 60);

        assert!(limiter.check_at("login:10.0.0.1", policy, now));
        assert!(!limiter.check_at("login:10.0.0.1", policy, now));
        assert!(limiter.check_at("login:10.0.0.2", policy, now));
        assert!(limiter.check_at("orders:10.0.0.1", policy, now));
    }

    #[test]
    fn zero_limit_always_blocks() {
        let limiter = RateLimiter::new();

        assert!(!limiter.check_at("any", limit(0, 60), Instant::now()));
    }

    #[test]
    fn prune_drops_stale_windows() {
        let limiter = RateLimiter::new();
        let now = Instant::now();

        limiter.check_at("old", limit(1, 60), now);
        assert_eq!(limiter.tracked_keys(), 1);

        limiter.prune(now + MAX_TRACKED_WINDOW + Duration::from_secs(1));

        assert_eq!(limiter.tracked_keys(), 0);
    }
}
