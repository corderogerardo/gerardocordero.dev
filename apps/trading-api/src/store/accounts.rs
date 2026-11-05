use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use sqlx::PgConnection;
use uuid::Uuid;

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct Account {
    pub user_id: Uuid,
    pub cash: Decimal,
    pub currency: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub async fn create(
    conn: &mut PgConnection,
    user_id: Uuid,
    cash: Decimal,
) -> Result<Account, sqlx::Error> {
    sqlx::query_as::<_, Account>(
        r#"
        INSERT INTO accounts (user_id, cash)
        VALUES ($1, $2)
        RETURNING user_id, cash, currency, created_at, updated_at
        "#,
    )
    .bind(user_id)
    .bind(cash)
    .fetch_one(&mut *conn)
    .await
}

pub async fn get(conn: &mut PgConnection, user_id: Uuid) -> Result<Option<Account>, sqlx::Error> {
    sqlx::query_as::<_, Account>(
        r#"
        SELECT user_id, cash, currency, created_at, updated_at
        FROM accounts
        WHERE user_id = $1
        "#,
    )
    .bind(user_id)
    .fetch_optional(&mut *conn)
    .await
}

/// Locks the account row for the duration of the transaction. Every ledger
/// mutation takes this lock first, so two orders for the same user serialize
/// instead of racing on a read-modify-write.
pub async fn lock(conn: &mut PgConnection, user_id: Uuid) -> Result<Option<Account>, sqlx::Error> {
    sqlx::query_as::<_, Account>(
        r#"
        SELECT user_id, cash, currency, created_at, updated_at
        FROM accounts
        WHERE user_id = $1
        FOR UPDATE
        "#,
    )
    .bind(user_id)
    .fetch_optional(&mut *conn)
    .await
}

pub async fn set_cash(
    conn: &mut PgConnection,
    user_id: Uuid,
    cash: Decimal,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        UPDATE accounts
        SET cash = $2, updated_at = now()
        WHERE user_id = $1
        "#,
    )
    .bind(user_id)
    .bind(cash)
    .execute(&mut *conn)
    .await?;

    Ok(())
}
