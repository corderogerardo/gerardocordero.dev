//! Public WebSocket quote stream.
//!
//! Protocol (JSON text frames):
//!   server -> client  {"type":"snapshot","quotes":[...]}
//!                     {"type":"quote","quote":{...}}
//!                     {"type":"pong"}
//!   client -> server  {"type":"subscribe","symbols":["BTC-USD"]}
//!                     {"type":"unsubscribe","symbols":["BTC-USD"]}
//!                     {"type":"ping"}
//!
//! Quotes are public, so the socket needs no token; order updates stay on the
//! authenticated REST endpoints, which keeps credentials out of URLs and logs.

use std::{collections::HashSet, time::Duration};

use axum::{
    extract::{
        Query, State,
        ws::{Message, WebSocket, WebSocketUpgrade},
    },
    response::Response,
};
use serde::{Deserialize, Serialize};

use crate::{
    error::{AppError, AppResult},
    market::Quote,
    state::AppState,
};

const PING_INTERVAL: Duration = Duration::from_secs(20);

#[derive(Debug, Deserialize)]
pub struct StreamQuery {
    pub symbols: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(tag = "type", rename_all = "lowercase")]
enum ServerFrame {
    Snapshot { quotes: Vec<Quote> },
    Quote { quote: Quote },
    Pong,
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "lowercase")]
enum ClientCommand {
    Subscribe { symbols: Vec<String> },
    Unsubscribe { symbols: Vec<String> },
    Ping,
}

pub async fn stream(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
    Query(query): Query<StreamQuery>,
) -> AppResult<Response> {
    let subscriptions = resolve_symbols(&state, query.symbols.as_deref())?;

    Ok(ws.on_upgrade(move |socket| handle(socket, state, subscriptions)))
}

fn resolve_symbols(state: &AppState, raw: Option<&str>) -> AppResult<HashSet<String>> {
    let Some(raw) = raw else {
        return Ok(state.market.symbols().into_iter().collect());
    };

    let mut subscriptions = HashSet::new();
    for candidate in raw.split(',') {
        let symbol = candidate.trim().to_ascii_uppercase();
        if symbol.is_empty() {
            continue;
        }
        if !state.market.contains(&symbol) {
            return Err(AppError::bad_request(format!(
                "unknown market symbol `{symbol}`"
            )));
        }
        subscriptions.insert(symbol);
    }

    if subscriptions.is_empty() {
        return Err(AppError::bad_request("at least one symbol is required"));
    }

    Ok(subscriptions)
}

async fn handle(mut socket: WebSocket, state: AppState, mut subscribed: HashSet<String>) {
    let mut receiver = state.market.subscribe();

    let quotes = subscribed
        .iter()
        .filter_map(|symbol| state.market.quote(symbol))
        .collect();
    if send_frame(&mut socket, &ServerFrame::Snapshot { quotes })
        .await
        .is_err()
    {
        return;
    }

    // First keepalive after one full interval: an immediate send would race the
    // initial snapshot on every new connection.
    let mut ping =
        tokio::time::interval_at(tokio::time::Instant::now() + PING_INTERVAL, PING_INTERVAL);
    ping.set_missed_tick_behavior(tokio::time::MissedTickBehavior::Delay);

    loop {
        tokio::select! {
            incoming = socket.recv() => {
                match incoming {
                    Some(Ok(Message::Text(text))) => {
                        if let Ok(command) = serde_json::from_str::<ClientCommand>(&text) {
                            match command {
                                ClientCommand::Subscribe { symbols } => {
                                    let mut added = Vec::new();
                                    for raw in symbols {
                                        let symbol = raw.trim().to_ascii_uppercase();
                                        if state.market.contains(&symbol) && subscribed.insert(symbol.clone()) {
                                            added.push(symbol);
                                        }
                                    }
                                    if !added.is_empty() {
                                        let quotes = added.iter().filter_map(|symbol| state.market.quote(symbol)).collect();
                                        if send_frame(&mut socket, &ServerFrame::Snapshot { quotes }).await.is_err() {
                                            break;
                                        }
                                    }
                                }
                                ClientCommand::Unsubscribe { symbols } => {
                                    for raw in symbols {
                                        subscribed.remove(&raw.trim().to_ascii_uppercase());
                                    }
                                }
                                ClientCommand::Ping => {
                                    if send_frame(&mut socket, &ServerFrame::Pong).await.is_err() {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    Some(Ok(Message::Close(_))) | None => break,
                    Some(Err(_)) => break,
                    _ => {}
                }
            }
            event = receiver.recv() => {
                match event {
                    Ok(event) if subscribed.contains(&event.symbol) => {
                        if let Some(quote) = state.market.quote(&event.symbol)
                            && send_frame(&mut socket, &ServerFrame::Quote { quote }).await.is_err()
                        {
                            break;
                        }
                    }
                    Ok(_) => {}
                    Err(tokio::sync::broadcast::error::RecvError::Lagged(skipped)) => {
                        tracing::warn!(skipped, "quote stream client lagged behind");
                    }
                    Err(tokio::sync::broadcast::error::RecvError::Closed) => break,
                }
            }
            _ = ping.tick() => {
                if socket.send(Message::Ping(Default::default())).await.is_err() {
                    break;
                }
            }
        }
    }
}

async fn send_frame(socket: &mut WebSocket, frame: &ServerFrame) -> Result<(), ()> {
    let Ok(payload) = serde_json::to_string(frame) else {
        return Err(());
    };

    socket
        .send(Message::Text(payload.into()))
        .await
        .map_err(|_| ())
}
