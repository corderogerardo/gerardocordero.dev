//! Structured logs with a strict rule: no secrets, no tokens, no raw SQL
//! parameters. Human-readable locally, JSON in production for aggregation.

use tracing_subscriber::EnvFilter;

use crate::config::Environment;

const DEFAULT_FILTER: &str = "trading_api=info,tower_http=info,sqlx=warn";

pub fn init(environment: Environment) {
    let filter =
        EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new(DEFAULT_FILTER));

    let result = if environment.is_production() {
        tracing_subscriber::fmt()
            .json()
            .with_env_filter(filter)
            .with_current_span(false)
            .try_init()
    } else {
        tracing_subscriber::fmt().with_env_filter(filter).try_init()
    };

    // A second subscriber (tests, embedding) is not an error worth crashing for.
    let _ = result;
}
