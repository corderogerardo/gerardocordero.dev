use sqlx::PgConnection;

use crate::market::Instrument;

pub async fn list(conn: &mut PgConnection) -> Result<Vec<Instrument>, sqlx::Error> {
    sqlx::query_as::<_, Instrument>(
        r#"
        SELECT symbol, name, kind, currency, tick_size
        FROM instruments
        ORDER BY symbol
        "#,
    )
    .fetch_all(&mut *conn)
    .await
}

pub async fn exists(conn: &mut PgConnection, symbol: &str) -> Result<bool, sqlx::Error> {
    sqlx::query_scalar::<_, bool>(
        r#"
        SELECT EXISTS (SELECT 1 FROM instruments WHERE symbol = $1)
        "#,
    )
    .bind(symbol)
    .fetch_one(&mut *conn)
    .await
}
