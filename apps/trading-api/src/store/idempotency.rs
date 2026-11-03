use sqlx::PgConnection;
use uuid::Uuid;

/// Result of trying to claim an idempotency key.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Claim {
    /// This request owns the key; it must complete the row before commit.
    Claimed,
    /// The key already exists. The caller decides whether the payload matches.
    Replay {
        request_hash: String,
        order_id: Option<Uuid>,
    },
}

/// Claims the key with a single atomic insert. `ON CONFLICT DO NOTHING` means a
/// concurrent duplicate blocks on the unique index until the first transaction
/// commits, then observes the committed row — no check-then-act race.
pub async fn claim(
    conn: &mut PgConnection,
    user_id: Uuid,
    key: &str,
    request_hash: &str,
) -> Result<Claim, sqlx::Error> {
    let inserted = sqlx::query(
        r#"
        INSERT INTO idempotency_keys (user_id, key, request_hash)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, key) DO NOTHING
        "#,
    )
    .bind(user_id)
    .bind(key)
    .bind(request_hash)
    .execute(&mut *conn)
    .await?;

    if inserted.rows_affected() == 1 {
        return Ok(Claim::Claimed);
    }

    let (request_hash, order_id): (String, Option<Uuid>) = sqlx::query_as(
        r#"
        SELECT request_hash, order_id
        FROM idempotency_keys
        WHERE user_id = $1 AND key = $2
        "#,
    )
    .bind(user_id)
    .bind(key)
    .fetch_one(&mut *conn)
    .await?;

    Ok(Claim::Replay {
        request_hash,
        order_id,
    })
}

pub async fn complete(
    conn: &mut PgConnection,
    user_id: Uuid,
    key: &str,
    order_id: Uuid,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        UPDATE idempotency_keys
        SET order_id = $3
        WHERE user_id = $1 AND key = $2
        "#,
    )
    .bind(user_id)
    .bind(key)
    .bind(order_id)
    .execute(&mut *conn)
    .await?;

    Ok(())
}
