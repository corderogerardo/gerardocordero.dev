use sqlx::PgConnection;
use uuid::Uuid;

/// Append-only audit trail. This is intentionally not a full financial ledger:
/// trades are the ledger, this records who did what and when.
pub async fn record(
    conn: &mut PgConnection,
    user_id: Option<Uuid>,
    action: &str,
    subject: Option<&str>,
    metadata: serde_json::Value,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        INSERT INTO audit_events (user_id, action, subject, metadata)
        VALUES ($1, $2, $3, $4)
        "#,
    )
    .bind(user_id)
    .bind(action)
    .bind(subject)
    .bind(metadata)
    .execute(&mut *conn)
    .await?;

    Ok(())
}
