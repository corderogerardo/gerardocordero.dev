//! Configuration is read once at startup and validated eagerly: a server that
//! starts with a weak JWT secret or a bogus port is a security incident waiting
//! for a convenient moment.

use std::{env, fmt, net::SocketAddr, str::FromStr, time::Duration};

use rust_decimal::Decimal;
use thiserror::Error;

const MIN_JWT_SECRET_LEN: usize = 32;
const PLACEHOLDER_FRAGMENTS: [&str; 4] = ["change-me", "changeme", "replace-me", "insecure"];
const PLACEHOLDER_EXACT: [&str; 4] = ["development", "password", "secret", "test"];

/// A string that must never reach logs, error messages, or traces.
#[derive(Clone, PartialEq, Eq)]
pub struct Secret(String);

impl Secret {
    pub fn new(value: impl Into<String>) -> Self {
        Self(value.into())
    }

    /// Explicit accessor: the call site documents that it needs the raw value.
    pub fn expose(&self) -> &str {
        &self.0
    }
}

impl fmt::Debug for Secret {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str("Secret(redacted)")
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Environment {
    Development,
    Test,
    Production,
}

impl Environment {
    fn parse(raw: &str) -> Result<Self, ConfigError> {
        match raw.trim().to_ascii_lowercase().as_str() {
            "development" | "dev" => Ok(Self::Development),
            "test" => Ok(Self::Test),
            "production" | "prod" => Ok(Self::Production),
            other => Err(ConfigError::Invalid {
                name: "ENVIRONMENT",
                reason: format!("expected development, test, or production, got `{other}`"),
            }),
        }
    }

    pub fn as_str(self) -> &'static str {
        match self {
            Self::Development => "development",
            Self::Test => "test",
            Self::Production => "production",
        }
    }

    pub fn is_production(self) -> bool {
        self == Self::Production
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Limit {
    pub max_requests: u32,
    pub window: Duration,
}

impl Limit {
    pub const fn new(max_requests: u32, window: Duration) -> Self {
        Self {
            max_requests,
            window,
        }
    }
}

#[derive(Debug, Clone)]
pub struct RateLimitConfig {
    pub auth: Limit,
    pub orders: Limit,
    pub global: Limit,
}

impl RateLimitConfig {
    /// Effectively unlimited. Tests exercise the limiter explicitly so that
    /// unrelated assertions never fail because of an accumulated request count.
    pub fn for_tests() -> Self {
        let unlimited = Limit::new(1_000_000, Duration::from_secs(60));
        Self {
            auth: unlimited,
            orders: unlimited,
            global: unlimited,
        }
    }
}

#[derive(Debug, Clone)]
pub struct MarketConfig {
    pub tick_interval: Duration,
    pub seed: u64,
    pub volatility_bps: u32,
    pub drift_bps: i32,
    pub history_points: usize,
}

impl MarketConfig {
    pub fn for_tests() -> Self {
        Self {
            tick_interval: Duration::from_millis(50),
            seed: 7,
            volatility_bps: 10,
            drift_bps: 0,
            history_points: 60,
        }
    }
}

#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub jwt_secret: Secret,
    pub bind_addr: SocketAddr,
    pub environment: Environment,
    pub market: MarketConfig,
    pub rate_limits: RateLimitConfig,
    pub cors_origins: Vec<String>,
    pub initial_cash: Decimal,
    pub fee_bps: u32,
    pub max_order_notional: Decimal,
    pub access_token_ttl: Duration,
    pub refresh_token_ttl: Duration,
}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        Self::from_lookup(|key| env::var(key).ok())
    }

    /// Reads configuration through a lookup function so tests can cover the
    /// validation rules without mutating process-wide environment state.
    pub fn from_lookup(lookup: impl Fn(&str) -> Option<String>) -> Result<Self, ConfigError> {
        let database_url = required(&lookup, "DATABASE_URL")?;

        let jwt_secret = required(&lookup, "JWT_SECRET")?;
        if jwt_secret.len() < MIN_JWT_SECRET_LEN {
            return Err(ConfigError::Invalid {
                name: "JWT_SECRET",
                reason: format!("must be at least {MIN_JWT_SECRET_LEN} characters"),
            });
        }
        if PLACEHOLDER_FRAGMENTS
            .iter()
            .any(|fragment| jwt_secret.to_ascii_lowercase().contains(fragment))
            || PLACEHOLDER_EXACT
                .iter()
                .any(|placeholder| jwt_secret.eq_ignore_ascii_case(placeholder))
        {
            return Err(ConfigError::Invalid {
                name: "JWT_SECRET",
                reason: "looks like a placeholder; generate one with `openssl rand -hex 32`"
                    .to_string(),
            });
        }

        let host = optional(&lookup, "HOST").unwrap_or_else(|| "127.0.0.1".to_string());
        let port = parse_or(&lookup, "PORT", 8080u16)?;
        let bind_addr: SocketAddr =
            format!("{host}:{port}")
                .parse()
                .map_err(|error| ConfigError::Invalid {
                    name: "HOST/PORT",
                    reason: format!("not a valid socket address: {error}"),
                })?;

        let environment = match optional(&lookup, "ENVIRONMENT") {
            Some(raw) => Environment::parse(&raw)?,
            None => Environment::Development,
        };

        let tick_ms = parse_or(&lookup, "MARKET_TICK_MS", 1_000u64)?;
        if tick_ms < 10 {
            return Err(ConfigError::Invalid {
                name: "MARKET_TICK_MS",
                reason: "must be at least 10ms".to_string(),
            });
        }

        let history_points = parse_or(&lookup, "MARKET_HISTORY_POINTS", 240usize)?;
        if !(8..=2_000).contains(&history_points) {
            return Err(ConfigError::Invalid {
                name: "MARKET_HISTORY_POINTS",
                reason: "must be between 8 and 2000".to_string(),
            });
        }

        let initial_cash = parse_or(&lookup, "INITIAL_CASH", Decimal::from(100_000u32))?;
        if initial_cash <= Decimal::ZERO {
            return Err(ConfigError::Invalid {
                name: "INITIAL_CASH",
                reason: "must be greater than zero".to_string(),
            });
        }

        let fee_bps = parse_or(&lookup, "FEE_BPS", 10u32)?;
        if fee_bps > 1_000 {
            return Err(ConfigError::Invalid {
                name: "FEE_BPS",
                reason: "must be at most 1000 (10%)".to_string(),
            });
        }

        let max_order_notional =
            parse_or(&lookup, "MAX_ORDER_NOTIONAL", Decimal::from(1_000_000u32))?;
        if max_order_notional <= Decimal::ZERO {
            return Err(ConfigError::Invalid {
                name: "MAX_ORDER_NOTIONAL",
                reason: "must be greater than zero".to_string(),
            });
        }

        let access_token_ttl =
            Duration::from_secs(parse_or(&lookup, "ACCESS_TOKEN_TTL_SECONDS", 900u64)?);
        let refresh_token_ttl = Duration::from_secs(parse_or(
            &lookup,
            "REFRESH_TOKEN_TTL_SECONDS",
            2_592_000u64,
        )?);
        if access_token_ttl.is_zero() || refresh_token_ttl.is_zero() {
            return Err(ConfigError::Invalid {
                name: "TOKEN_TTL",
                reason: "token lifetimes must be greater than zero".to_string(),
            });
        }

        let cors_origins = optional(&lookup, "CORS_ORIGINS")
            .map(|raw| {
                raw.split(',')
                    .map(str::trim)
                    .filter(|origin| !origin.is_empty())
                    .map(str::to_string)
                    .collect::<Vec<_>>()
            })
            .unwrap_or_default();
        for origin in &cors_origins {
            if !(origin.starts_with("http://") || origin.starts_with("https://")) {
                return Err(ConfigError::Invalid {
                    name: "CORS_ORIGINS",
                    reason: format!("`{origin}` must start with http:// or https://"),
                });
            }
        }

        let rate_limits = RateLimitConfig {
            auth: Limit::new(
                parse_or(&lookup, "AUTH_RATE_LIMIT_MAX", 5u32)?,
                Duration::from_secs(parse_or(&lookup, "AUTH_RATE_LIMIT_WINDOW_SECONDS", 900u64)?),
            ),
            orders: Limit::new(
                parse_or(&lookup, "ORDER_RATE_LIMIT_MAX", 60u32)?,
                Duration::from_secs(parse_or(&lookup, "ORDER_RATE_LIMIT_WINDOW_SECONDS", 60u64)?),
            ),
            global: Limit::new(
                parse_or(&lookup, "GLOBAL_RATE_LIMIT_MAX", 300u32)?,
                Duration::from_secs(parse_or(
                    &lookup,
                    "GLOBAL_RATE_LIMIT_WINDOW_SECONDS",
                    60u64,
                )?),
            ),
        };

        Ok(Self {
            database_url,
            jwt_secret: Secret::new(jwt_secret),
            bind_addr,
            environment,
            market: MarketConfig {
                tick_interval: Duration::from_millis(tick_ms),
                seed: parse_or(&lookup, "MARKET_SEED", 42u64)?,
                volatility_bps: parse_or(&lookup, "MARKET_VOLATILITY_BPS", 25u32)?,
                drift_bps: parse_or(&lookup, "MARKET_DRIFT_BPS", 0i32)?,
                history_points,
            },
            rate_limits,
            cors_origins,
            initial_cash,
            fee_bps,
            max_order_notional,
            access_token_ttl,
            refresh_token_ttl,
        })
    }

    /// Deterministic configuration for tests and local harnesses. Not used by
    /// the production entry point.
    pub fn for_tests() -> Self {
        Self {
            database_url: "postgres://trading:trading@127.0.0.1:5433/trading_test".to_string(),
            jwt_secret: Secret::new("test-secret-that-is-long-enough-for-hs256!!"),
            bind_addr: "127.0.0.1:0".parse().expect("valid test address"),
            environment: Environment::Test,
            market: MarketConfig::for_tests(),
            rate_limits: RateLimitConfig::for_tests(),
            cors_origins: Vec::new(),
            initial_cash: Decimal::from(100_000u32),
            fee_bps: 10,
            max_order_notional: Decimal::from(1_000_000u32),
            access_token_ttl: Duration::from_secs(900),
            refresh_token_ttl: Duration::from_secs(2_592_000),
        }
    }
}

fn required(
    lookup: &impl Fn(&str) -> Option<String>,
    name: &'static str,
) -> Result<String, ConfigError> {
    optional(lookup, name).ok_or(ConfigError::Missing(name))
}

fn optional(lookup: &impl Fn(&str) -> Option<String>, name: &str) -> Option<String> {
    lookup(name)
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn parse_or<T>(
    lookup: &impl Fn(&str) -> Option<String>,
    name: &'static str,
    default: T,
) -> Result<T, ConfigError>
where
    T: FromStr,
    T::Err: fmt::Display,
{
    match optional(lookup, name) {
        None => Ok(default),
        Some(raw) => raw.parse::<T>().map_err(|error| ConfigError::Invalid {
            name,
            reason: error.to_string(),
        }),
    }
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum ConfigError {
    #[error("missing required environment variable {0}")]
    Missing(&'static str),
    #[error("invalid value for {name}: {reason}")]
    Invalid { name: &'static str, reason: String },
}

#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use super::*;

    fn lookup(overrides: &[(&str, &str)]) -> impl Fn(&str) -> Option<String> {
        let values: HashMap<String, String> = overrides
            .iter()
            .map(|(key, value)| ((*key).to_string(), (*value).to_string()))
            .collect();
        move |key| values.get(key).cloned()
    }

    fn valid() -> Vec<(&'static str, &'static str)> {
        vec![
            ("DATABASE_URL", "postgres://localhost/trading"),
            ("JWT_SECRET", "a-very-long-and-random-test-secret-value"),
        ]
    }

    #[test]
    fn applies_safe_defaults() {
        let config = Config::from_lookup(lookup(&valid())).expect("valid config");

        assert_eq!(config.bind_addr.port(), 8080);
        assert_eq!(config.bind_addr.ip().to_string(), "127.0.0.1");
        assert_eq!(config.environment, Environment::Development);
        assert_eq!(config.fee_bps, 10);
        assert_eq!(config.initial_cash, Decimal::from(100_000u32));
        assert_eq!(config.rate_limits.auth.max_requests, 5);
        assert!(config.cors_origins.is_empty());
    }

    #[test]
    fn rejects_missing_database_url() {
        let error = Config::from_lookup(lookup(&[("JWT_SECRET", "a".repeat(40).as_str())]))
            .expect_err("missing database url");

        assert_eq!(error, ConfigError::Missing("DATABASE_URL"));
    }

    #[test]
    fn rejects_short_jwt_secret() {
        let error = Config::from_lookup(lookup(&[
            ("DATABASE_URL", "postgres://x/y"),
            ("JWT_SECRET", "too-short"),
        ]))
        .expect_err("short secret");

        assert!(matches!(
            error,
            ConfigError::Invalid {
                name: "JWT_SECRET",
                ..
            }
        ));
    }

    #[test]
    fn rejects_placeholder_jwt_secret() {
        let value = "change-me-change-me-change-me-change-me";
        let error = Config::from_lookup(lookup(&[
            ("DATABASE_URL", "postgres://x/y"),
            ("JWT_SECRET", value),
        ]))
        .expect_err("placeholder secret");

        assert!(matches!(
            error,
            ConfigError::Invalid {
                name: "JWT_SECRET",
                ..
            }
        ));
    }

    #[test]
    fn rejects_invalid_port() {
        let mut values = valid();
        values.push(("PORT", "not-a-port"));

        let error = Config::from_lookup(lookup(&values)).expect_err("invalid port");

        assert!(matches!(error, ConfigError::Invalid { name: "PORT", .. }));
    }

    #[test]
    fn rejects_negative_cash() {
        let mut values = valid();
        values.push(("INITIAL_CASH", "-1"));

        let error = Config::from_lookup(lookup(&values)).expect_err("negative cash");

        assert!(matches!(
            error,
            ConfigError::Invalid {
                name: "INITIAL_CASH",
                ..
            }
        ));
    }

    #[test]
    fn parses_cors_origins_and_rejects_invalid_scheme() {
        let mut values = valid();
        values.push((
            "CORS_ORIGINS",
            "http://localhost:8081, https://app.example.com",
        ));
        let config = Config::from_lookup(lookup(&values)).expect("valid cors");
        assert_eq!(config.cors_origins.len(), 2);

        values.push(("CORS_ORIGINS", "localhost:8081"));
        let error = Config::from_lookup(lookup(&values)).expect_err("invalid cors");
        assert!(matches!(
            error,
            ConfigError::Invalid {
                name: "CORS_ORIGINS",
                ..
            }
        ));
    }

    #[test]
    fn debug_never_leaks_the_secret() {
        let config = Config::for_tests();
        let rendered = format!("{config:?}");

        assert!(!rendered.contains(config.jwt_secret.expose()));
        assert!(rendered.contains("Secret(redacted)"));
    }

    #[test]
    fn production_flag_matches_environment() {
        assert!(Environment::Production.is_production());
        assert!(!Environment::Test.is_production());
    }
}
