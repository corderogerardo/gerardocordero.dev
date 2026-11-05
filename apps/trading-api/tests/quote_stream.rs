//! WebSocket quote stream: the public contract the mobile app consumes.

mod common;

use std::time::Duration;

use common::*;
use futures_util::{SinkExt, StreamExt};
use serde_json::{Value, json};
use tokio::{net::TcpStream, time::timeout};
use tokio_tungstenite::{
    MaybeTlsStream, WebSocketStream, connect_async,
    tungstenite::{Error as WsError, Message},
};

type Socket = WebSocketStream<MaybeTlsStream<TcpStream>>;

async fn next_frame(socket: &mut Socket) -> Value {
    loop {
        let frame = timeout(Duration::from_secs(5), socket.next())
            .await
            .expect("frame timed out")
            .expect("socket closed")
            .expect("socket error");

        match frame {
            Message::Text(text) => return serde_json::from_str(text.as_str()).expect("json frame"),
            Message::Close(_) => panic!("socket closed"),
            // Protocol-level keepalives are not part of the JSON contract.
            _ => continue,
        }
    }
}

/// Quote frames can interleave with pong, so wait for the type we care about.
async fn wait_for(socket: &mut Socket, kind: &str) -> Value {
    for _ in 0..40 {
        let frame = next_frame(socket).await;
        if frame["type"] == kind {
            return frame;
        }
    }

    panic!("frame `{kind}` was not observed");
}

#[tokio::test]
async fn streams_a_snapshot_live_quotes_and_pong() {
    let app = spawn().await;
    app.state.market.spawn_ticker();

    let url = format!(
        "{}/v1/stream?symbols=BTC-USD",
        app.base_url.replacen("http", "ws", 1)
    );
    let (mut socket, _) = connect_async(url).await.expect("connect websocket");

    let snapshot = next_frame(&mut socket).await;
    assert_eq!(snapshot["type"], "snapshot");
    let quotes = snapshot["quotes"].as_array().expect("snapshot quotes");
    assert_eq!(quotes.len(), 1);
    assert_eq!(quotes[0]["symbol"], "BTC-USD");
    assert!(
        quotes[0]["price"].is_string(),
        "prices are decimal strings on the wire"
    );

    socket
        .send(Message::Text(json!({ "type": "ping" }).to_string().into()))
        .await
        .expect("send ping");
    let pong = wait_for(&mut socket, "pong").await;
    assert_eq!(pong["type"], "pong");

    let quote = wait_for(&mut socket, "quote").await;
    assert_eq!(quote["quote"]["symbol"], "BTC-USD");
    assert!(quote["quote"]["price"].is_string());
}

#[tokio::test]
async fn rejects_unknown_symbols_before_the_upgrade() {
    let app = spawn().await;
    let url = format!(
        "{}/v1/stream?symbols=NOPE",
        app.base_url.replacen("http", "ws", 1)
    );

    let error = connect_async(url)
        .await
        .expect_err("unknown symbol must reject");

    match error {
        WsError::Http(response) => assert_eq!(response.status(), 400),
        other => panic!("unexpected websocket error: {other}"),
    }
}
