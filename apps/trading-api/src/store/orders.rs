use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use sqlx::{PgConnection, Postgres, QueryBuilder};
use uuid::Uuid;

use crate::domain::order::{Order, OrderStatus, OrderType, Side};

pub struct NewOrder<'a> {
    pub user_id: Uuid,
    pub symbol: &'a str,
    pub side: Side,
    pub order_type: OrderType,
    pub status: OrderStatus,
    pub quantity: Decimal,
    pub limit_price: Option<Decimal>,
    pub filled_quantity: Decimal,
    pub average_fill_price: Option<Decimal>,
    pub fee: Decimal,
    pub rejection_reason: Option<&'a str>,
}

pub async fn insert(conn: &mut PgConnection, new: &NewOrder<'_>) -> Result<Order, sqlx::Error> {
    sqlx::query_as::<_, Order>(
        r#"
        INSERT INTO orders (
            user_id, symbol, side, order_type, status, quantity, limit_price,
            filled_quantity, average_fill_price, fee, rejection_reason
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, user_id, symbol, side, order_type, status, quantity, limit_price,
                  filled_quantity, average_fill_price, fee, rejection_reason,
                  created_at, updated_at
        "#,
    )
    .bind(new.user_id)
    .bind(new.symbol)
    .bind(new.side)
    .bind(new.order_type)
    .bind(new.status)
    .bind(new.quantity)
    .bind(new.limit_price)
    .bind(new.filled_quantity)
    .bind(new.average_fill_price)
    .bind(new.fee)
    .bind(new.rejection_reason)
    .fetch_one(&mut *conn)
    .await
}

pub async fn get_for_user(
    conn: &mut PgConnection,
    user_id: Uuid,
    order_id: Uuid,
) -> Result<Option<Order>, sqlx::Error> {
    sqlx::query_as::<_, Order>(
        r#"
        SELECT id, user_id, symbol, side, order_type, status, quantity, limit_price,
               filled_quantity, average_fill_price, fee, rejection_reason,
               created_at, updated_at
        FROM orders
        WHERE id = $1 AND user_id = $2
        "#,
    )
    .bind(order_id)
    .bind(user_id)
    .fetch_optional(&mut *conn)
    .await
}

pub async fn lock_for_user(
    conn: &mut PgConnection,
    user_id: Uuid,
    order_id: Uuid,
) -> Result<Option<Order>, sqlx::Error> {
    sqlx::query_as::<_, Order>(
        r#"
        SELECT id, user_id, symbol, side, order_type, status, quantity, limit_price,
               filled_quantity, average_fill_price, fee, rejection_reason,
               created_at, updated_at
        FROM orders
        WHERE id = $1 AND user_id = $2
        FOR UPDATE
        "#,
    )
    .bind(order_id)
    .bind(user_id)
    .fetch_optional(&mut *conn)
    .await
}

pub async fn lock(conn: &mut PgConnection, order_id: Uuid) -> Result<Option<Order>, sqlx::Error> {
    sqlx::query_as::<_, Order>(
        r#"
        SELECT id, user_id, symbol, side, order_type, status, quantity, limit_price,
               filled_quantity, average_fill_price, fee, rejection_reason,
               created_at, updated_at
        FROM orders
        WHERE id = $1
        FOR UPDATE
        "#,
    )
    .bind(order_id)
    .fetch_optional(&mut *conn)
    .await
}

pub async fn list(
    conn: &mut PgConnection,
    user_id: Uuid,
    status: Option<OrderStatus>,
    limit: i64,
    cursor: Option<(DateTime<Utc>, Uuid)>,
) -> Result<Vec<Order>, sqlx::Error> {
    // Keyset pagination: `(created_at, id)` is the sort key, so a page never
    // shifts when a new order lands while the user is scrolling.
    let mut query = QueryBuilder::<Postgres>::new(
        "SELECT id, user_id, symbol, side, order_type, status, quantity, limit_price, \
         filled_quantity, average_fill_price, fee, rejection_reason, created_at, updated_at \
         FROM orders WHERE user_id = ",
    );
    query.push_bind(user_id);

    if let Some(status) = status {
        query.push(" AND status = ");
        query.push_bind(status);
    }

    if let Some((created_at, id)) = cursor {
        query.push(" AND (created_at, id) < (");
        query.push_bind(created_at);
        query.push(", ");
        query.push_bind(id);
        query.push(")");
    }

    query.push(" ORDER BY created_at DESC, id DESC LIMIT ");
    query.push_bind(limit);

    query.build_query_as::<Order>().fetch_all(&mut *conn).await
}

pub async fn mark_filled(
    conn: &mut PgConnection,
    order_id: Uuid,
    quantity: Decimal,
    price: Decimal,
    fee: Decimal,
) -> Result<Option<Order>, sqlx::Error> {
    sqlx::query_as::<_, Order>(
        r#"
        UPDATE orders
        SET status = 'FILLED',
            filled_quantity = $2,
            average_fill_price = $3,
            fee = $4,
            updated_at = now()
        WHERE id = $1 AND status = 'OPEN'
        RETURNING id, user_id, symbol, side, order_type, status, quantity, limit_price,
                  filled_quantity, average_fill_price, fee, rejection_reason,
                  created_at, updated_at
        "#,
    )
    .bind(order_id)
    .bind(quantity)
    .bind(price)
    .bind(fee)
    .fetch_optional(&mut *conn)
    .await
}

pub async fn mark_cancelled(
    conn: &mut PgConnection,
    order_id: Uuid,
) -> Result<Option<Order>, sqlx::Error> {
    sqlx::query_as::<_, Order>(
        r#"
        UPDATE orders
        SET status = 'CANCELLED', updated_at = now()
        WHERE id = $1 AND status = 'OPEN'
        RETURNING id, user_id, symbol, side, order_type, status, quantity, limit_price,
                  filled_quantity, average_fill_price, fee, rejection_reason,
                  created_at, updated_at
        "#,
    )
    .bind(order_id)
    .fetch_optional(&mut *conn)
    .await
}

pub async fn mark_rejected(
    conn: &mut PgConnection,
    order_id: Uuid,
    reason: &str,
) -> Result<Option<Order>, sqlx::Error> {
    sqlx::query_as::<_, Order>(
        r#"
        UPDATE orders
        SET status = 'REJECTED', rejection_reason = $2, updated_at = now()
        WHERE id = $1 AND status = 'OPEN'
        RETURNING id, user_id, symbol, side, order_type, status, quantity, limit_price,
                  filled_quantity, average_fill_price, fee, rejection_reason,
                  created_at, updated_at
        "#,
    )
    .bind(order_id)
    .bind(reason)
    .fetch_optional(&mut *conn)
    .await
}

/// Limit orders that the given market price would cross. The caller re-locks
/// each order with `FOR UPDATE` inside its own transaction; correctness does not
/// depend on this read, it only keeps the batch focused.
pub async fn open_limit_candidates(
    conn: &mut PgConnection,
    symbol: &str,
    price: Decimal,
    limit: i64,
) -> Result<Vec<Uuid>, sqlx::Error> {
    sqlx::query_scalar::<_, Uuid>(
        r#"
        SELECT id
        FROM orders
        WHERE symbol = $1
          AND status = 'OPEN'
          AND (
                (side = 'BUY' AND limit_price >= $2)
             OR (side = 'SELL' AND limit_price <= $2)
          )
        ORDER BY created_at ASC
        LIMIT $3
        "#,
    )
    .bind(symbol)
    .bind(price)
    .bind(limit)
    .fetch_all(&mut *conn)
    .await
}
