use axum::{
    Json,
    extract::{Path, Query, State},
    http::{HeaderMap, StatusCode},
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    api::extract::{AuthUser, ValidJson, idempotency_key},
    domain::order::{CreateOrderRequest, Order, OrderStatus},
    error::{AppError, AppResult},
    state::AppState,
    store, trading,
};

const DEFAULT_PAGE_SIZE: i64 = 20;
const MAX_PAGE_SIZE: i64 = 100;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListOrdersQuery {
    pub status: Option<String>,
    pub limit: Option<i64>,
    pub cursor: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrdersResponse {
    pub data: Vec<Order>,
    pub next_cursor: Option<String>,
}

pub async fn create(
    State(state): State<AppState>,
    AuthUser { user_id }: AuthUser,
    headers: HeaderMap,
    ValidJson(request): ValidJson<CreateOrderRequest>,
) -> AppResult<(StatusCode, Json<Order>)> {
    let key = idempotency_key(&headers)?;
    let result = trading::create_order(&state, user_id, request, &key).await?;

    let status = if result.created {
        StatusCode::CREATED
    } else {
        StatusCode::OK
    };

    Ok((status, Json(result.order)))
}

pub async fn list(
    State(state): State<AppState>,
    AuthUser { user_id }: AuthUser,
    Query(query): Query<ListOrdersQuery>,
) -> AppResult<Json<OrdersResponse>> {
    let status = match query.status.as_deref() {
        None => None,
        Some(raw) => Some(OrderStatus::parse(raw).ok_or_else(|| {
            AppError::bad_request("status must be one of OPEN, FILLED, CANCELLED, REJECTED")
        })?),
    };
    let limit = query
        .limit
        .unwrap_or(DEFAULT_PAGE_SIZE)
        .clamp(1, MAX_PAGE_SIZE);
    let cursor = query.cursor.as_deref().map(parse_cursor).transpose()?;

    let mut connection = state.db.acquire().await?;
    let orders = store::orders::list(&mut connection, user_id, status, limit, cursor).await?;

    let next_cursor = if orders.len() as i64 == limit {
        orders
            .last()
            .map(|order| format!("{}|{}", order.created_at.timestamp_micros(), order.id))
    } else {
        None
    };

    Ok(Json(OrdersResponse {
        data: orders,
        next_cursor,
    }))
}

pub async fn get(
    State(state): State<AppState>,
    AuthUser { user_id }: AuthUser,
    Path(order_id): Path<String>,
) -> AppResult<Json<Order>> {
    let order_id = parse_order_id(&order_id)?;

    let mut connection = state.db.acquire().await?;
    let order = store::orders::get_for_user(&mut connection, user_id, order_id)
        .await?
        .ok_or_else(|| AppError::not_found("order not found"))?;

    Ok(Json(order))
}

pub async fn cancel(
    State(state): State<AppState>,
    AuthUser { user_id }: AuthUser,
    Path(order_id): Path<String>,
) -> AppResult<Json<Order>> {
    let order_id = parse_order_id(&order_id)?;

    let mut transaction = state.db.begin().await?;
    let order = store::orders::lock_for_user(&mut transaction, user_id, order_id)
        .await?
        .ok_or_else(|| AppError::not_found("order not found"))?;

    match order.status {
        OrderStatus::Cancelled => {
            transaction.commit().await?;
            return Ok(Json(order));
        }
        OrderStatus::Filled | OrderStatus::Rejected => {
            return Err(AppError::conflict(
                "ORDER_NOT_CANCELLABLE",
                format!("order is already {}", order.status.as_str().to_lowercase()),
            ));
        }
        OrderStatus::Open => {}
    }

    let Some(cancelled) = store::orders::mark_cancelled(&mut transaction, order.id).await? else {
        return Err(AppError::conflict(
            "ORDER_NOT_CANCELLABLE",
            "order changed state while cancelling; retry",
        ));
    };

    store::audit::record(
        &mut transaction,
        Some(user_id),
        "order.cancelled",
        Some(&order.id.to_string()),
        serde_json::json!({ "symbol": order.symbol }),
    )
    .await?;

    transaction.commit().await?;

    Ok(Json(cancelled))
}

fn parse_cursor(raw: &str) -> AppResult<(DateTime<Utc>, Uuid)> {
    let (timestamp, id) = raw
        .split_once('|')
        .ok_or_else(|| AppError::bad_request("invalid cursor"))?;

    let micros: i64 = timestamp
        .parse()
        .map_err(|_| AppError::bad_request("invalid cursor timestamp"))?;
    let created_at = DateTime::<Utc>::from_timestamp_micros(micros)
        .ok_or_else(|| AppError::bad_request("invalid cursor timestamp"))?;
    let id = Uuid::parse_str(id).map_err(|_| AppError::bad_request("invalid cursor id"))?;

    Ok((created_at, id))
}

fn parse_order_id(raw: &str) -> AppResult<Uuid> {
    Uuid::parse_str(raw.trim()).map_err(|_| AppError::not_found("order not found"))
}
