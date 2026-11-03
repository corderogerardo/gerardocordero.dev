use chrono::{DateTime, Utc};
use sqlx::PgConnection;
use uuid::Uuid;

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub email_normalized: String,
    pub display_name: String,
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
}

pub async fn create(
    conn: &mut PgConnection,
    email: &str,
    email_normalized: &str,
    display_name: &str,
    password_hash: &str,
) -> Result<User, sqlx::Error> {
    sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (email, email_normalized, display_name, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, email_normalized, display_name, password_hash, created_at
        "#,
    )
    .bind(email)
    .bind(email_normalized)
    .bind(display_name)
    .bind(password_hash)
    .fetch_one(&mut *conn)
    .await
}

pub async fn find_by_email_normalized(
    conn: &mut PgConnection,
    email_normalized: &str,
) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as::<_, User>(
        r#"
        SELECT id, email, email_normalized, display_name, password_hash, created_at
        FROM users
        WHERE email_normalized = $1
        "#,
    )
    .bind(email_normalized)
    .fetch_optional(&mut *conn)
    .await
}

pub async fn find_by_id(conn: &mut PgConnection, id: Uuid) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as::<_, User>(
        r#"
        SELECT id, email, email_normalized, display_name, password_hash, created_at
        FROM users
        WHERE id = $1
        "#,
    )
    .bind(id)
    .fetch_optional(&mut *conn)
    .await
}
