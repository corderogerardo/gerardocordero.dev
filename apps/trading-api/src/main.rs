use std::{error::Error, net::SocketAddr, time::Duration};

use sqlx::postgres::PgPoolOptions;
use trading_api::{api, config::Config, state::AppState, telemetry, trading};

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenvy::dotenv().ok();

    let config = Config::from_env()?;
    telemetry::init(config.environment);

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .acquire_timeout(Duration::from_secs(5))
        .connect(&config.database_url)
        .await?;

    sqlx::migrate!("./migrations").run(&pool).await?;

    let state = AppState::build(pool, config).await?;
    let ticker = state.market.spawn_ticker();
    let matcher = trading::spawn_matcher(state.clone());

    let listener = tokio::net::TcpListener::bind(state.config.bind_addr).await?;
    tracing::info!(
        address = %listener.local_addr()?,
        environment = state.config.environment.as_str(),
        "trading api listening"
    );

    axum::serve(
        listener,
        api::router(state).into_make_service_with_connect_info::<SocketAddr>(),
    )
    .with_graceful_shutdown(shutdown_signal())
    .await?;

    ticker.abort();
    matcher.abort();

    Ok(())
}

async fn shutdown_signal() {
    let _ = tokio::signal::ctrl_c().await;
}
