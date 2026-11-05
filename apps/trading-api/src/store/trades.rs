use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use sqlx::PgConnection;
use uuid::Uuid;

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct Trade {
    pub id: Uuid,
    pub order_id: Uuid,
    pub user_id: Uuid,
    pub symbol: String,
    pub side: String,
    pub quantity: Decimal,
    pub price: Decimal,
    pub fee: Decimal,
    pub executed_at: DateTime<Utc>,
}

pub struct NewTrade<'a> {
    pub order_id: Uuid,
    pub user_id: Uuid,
    pub symbol: &'a str,
    pub side: &'a str,
    pub quantity: Decimal,
    pub price: Decimal,
    pub fee: Decimal,
}

/// The unique index on `order_id` is the last line of defence: even if two
/// transactions somehow reach this insert for the same order, only one commits.
pub async fn insert(conn: &mut PgConnection, trade: &NewTrade<'_>) -> Result<Trade, sqlx::Error> {
    sqlx::query_as::<_, Trade>(
        r#"
        INSERT INTO trades (order_id, user_id, symbol, side, quantity, price, fee)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, order_id, user_id, symbol, side, quantity, price, fee, executed_at
        "#,
    )
    .bind(trade.order_id)
    .bind(trade.user_id)
    .bind(trade.symbol)
    .bind(trade.side)
    .bind(trade.quantity)
    .bind(trade.price)
    .bind(trade.fee)
    .fetch_one(&mut *conn)
    .await
}

pub async fn list_for_user(
    conn: &mut PgConnection,
    user_id: Uuid,
    limit: i64,
) -> Result<Vec<Trade>, sqlx::Error> {
    sqlx::query_as::<_, Trade>(
        r#"
        SELECT id, order_id, user_id, symbol, side, quantity, price, fee, executed_at
        FROM trades
        WHERE user_id = $1
        ORDER BY executed_at DESC, id DESC
        LIMIT $2
        "#,
    )
    .bind(user_id)
    .bind(limit)
    .fetch_all(&mut *conn)
    .await
}
