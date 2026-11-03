use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use sqlx::PgConnection;
use uuid::Uuid;

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct PositionRow {
    pub user_id: Uuid,
    pub symbol: String,
    pub quantity: Decimal,
    pub average_cost: Decimal,
    pub realized_pnl: Decimal,
    pub updated_at: DateTime<Utc>,
}

/// Locks one position row. Lock order is always account first, then position,
/// which is what keeps concurrent fills from deadlocking each other.
pub async fn lock(
    conn: &mut PgConnection,
    user_id: Uuid,
    symbol: &str,
) -> Result<Option<PositionRow>, sqlx::Error> {
    sqlx::query_as::<_, PositionRow>(
        r#"
        SELECT user_id, symbol, quantity, average_cost, realized_pnl, updated_at
        FROM positions
        WHERE user_id = $1 AND symbol = $2
        FOR UPDATE
        "#,
    )
    .bind(user_id)
    .bind(symbol)
    .fetch_optional(&mut *conn)
    .await
}

pub async fn list(conn: &mut PgConnection, user_id: Uuid) -> Result<Vec<PositionRow>, sqlx::Error> {
    sqlx::query_as::<_, PositionRow>(
        r#"
        SELECT user_id, symbol, quantity, average_cost, realized_pnl, updated_at
        FROM positions
        WHERE user_id = $1
        ORDER BY symbol
        "#,
    )
    .bind(user_id)
    .fetch_all(&mut *conn)
    .await
}

pub async fn upsert(conn: &mut PgConnection, position: &PositionRow) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        INSERT INTO positions (user_id, symbol, quantity, average_cost, realized_pnl)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, symbol) DO UPDATE
        SET quantity = EXCLUDED.quantity,
            average_cost = EXCLUDED.average_cost,
            realized_pnl = EXCLUDED.realized_pnl,
            updated_at = now()
        "#,
    )
    .bind(position.user_id)
    .bind(&position.symbol)
    .bind(position.quantity)
    .bind(position.average_cost)
    .bind(position.realized_pnl)
    .execute(&mut *conn)
    .await?;

    Ok(())
}
