use std::sync::Arc;

use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    auth::{jwt::TokenIssuer, password},
    config::Config,
    error::AppError,
    market::MarketEngine,
    rate_limit::RateLimiter,
    store,
};

/// Everything a handler needs. Cloning is cheap: the pool and services are
/// reference-counted handles.
#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub config: Arc<Config>,
    pub market: Arc<MarketEngine>,
    pub limiter: Arc<RateLimiter>,
    pub tokens: Arc<TokenIssuer>,
    /// Verified against when the email does not exist, so login latency does not
    /// reveal whether an account is registered.
    pub dummy_password_hash: Arc<str>,
}

impl AppState {
    pub async fn build(db: PgPool, config: Config) -> Result<Self, AppError> {
        let instruments = {
            let mut connection = db.acquire().await?;
            store::instruments::list(&mut connection).await?
        };

        let market = Arc::new(MarketEngine::new(instruments, config.market.clone()));
        let tokens = Arc::new(TokenIssuer::new(
            config.jwt_secret.expose(),
            config.access_token_ttl,
        ));
        let dummy_password_hash: Arc<str> = password::hash_password(Uuid::new_v4().to_string())
            .await?
            .into();

        Ok(Self {
            db,
            config: Arc::new(config),
            market,
            limiter: Arc::new(RateLimiter::new()),
            tokens,
            dummy_password_hash,
        })
    }
}
