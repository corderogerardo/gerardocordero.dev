# API contract (v1)

Base URL locally: `http://127.0.0.1:8080`. All paths are versioned under `/v1`.

This document is the contract both the server and the mobile client implement. If
you change a payload, change this file and the mobile types in the same commit.

## Conventions

| Topic | Rule |
| --- | --- |
| Content type | `application/json` for every body, request and response |
| Money | **Always a decimal string**, never a JSON number: `"64250.75000000"` |
| Quantities | Decimal strings with at most 8 decimal places |
| Timestamps | RFC 3339, UTC, e.g. `2026-11-03T15:28:56.167401Z` |
| Auth | `Authorization: Bearer <accessToken>` on protected routes |
| Request id | Every response carries `x-request-id`; send your own to correlate logs |
| Idempotency | `Idempotency-Key` header (8-128 printable chars) is required on `POST /v1/orders` |
| Errors | One envelope, see below |
| Environments | `test`, `development`, `production`; market and portfolio payloads include `environment` |

### Error envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "must be greater than zero",
    "details": { "field": "quantity" }
  }
}
```

`details` is present only when a single field is at fault. `code` is stable and
safe to branch on:

| Status | Code | Meaning |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | Malformed request, missing header, invalid cursor |
| 401 | `UNAUTHORIZED` | Missing, expired, or invalid token |
| 404 | `NOT_FOUND` | Unknown market, order, or resource not owned by the caller |
| 409 | `EMAIL_TAKEN`, `ORDER_NOT_CANCELLABLE`, `REQUEST_IN_PROGRESS` | State conflict |
| 422 | `VALIDATION_ERROR` | Semantically invalid input (`details.field` names it) |
| 422 | `INSUFFICIENT_FUNDS`, `INSUFFICIENT_POSITION` | Order cannot be funded |
| 422 | `IDEMPOTENCY_KEY_REUSED` | Same key, different payload — client bug |
| 429 | `RATE_LIMITED` | Too many requests; honour `Retry-After` |
| 500 | `INTERNAL_ERROR` | Never carries internal details; quote `x-request-id` |

Rate limits (defaults): auth `5 / 15 min` per IP, orders `60 / min` per IP,
everything `300 / min` per IP.

## Auth

### `POST /v1/auth/register`

```json
{ "email": "trader@example.com", "password": "correct horse battery staple", "displayName": "Ada" }
```

`201 Created`

```json
{
  "accessToken": "eyJ0eXAiOiJKV1Qi...",
  "refreshToken": "rt_00e5a...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "d975aba8-9ab6-4321-b89d-594e18ef141f",
    "email": "smoke@example.test",
    "displayName": "Smoke Tester",
    "createdAt": "2026-11-03T15:28:50.865242Z"
  }
}
```

The account starts with `INITIAL_CASH` (default `100000.00`) of simulated cash.
Passwords: 12–128 characters, not the email, not a common password.

### `POST /v1/auth/login`

Same body minus `displayName`, same `200` response. Unknown email and wrong
password return the same `401` body on purpose.

### `POST /v1/auth/refresh`

```json
{ "refreshToken": "rt_..." }
```

`200` with a **new** access token and a **new** refresh token. The presented
refresh token is revoked. Presenting a revoked token revokes every session for
that user (theft detection) and returns `401`.

### `POST /v1/auth/logout`

Requires a bearer token. Body `{ "refreshToken": "rt_..." }`, returns
`204 No Content`. Idempotent.

### `GET /v1/me`

Requires a bearer token.

```json
{
  "user": { "id": "...", "email": "...", "displayName": "...", "createdAt": "..." },
  "cash": "100000.00000000",
  "currency": "USD"
}
```

## Markets

### `GET /v1/markets`

```json
{
  "data": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "kind": "EQUITY",
      "currency": "USD",
      "tickSize": "0.01000000",
      "lastPrice": "226.74804771",
      "changePercent": "0.1537",
      "high": "230.11406441",
      "low": "224.00866644",
      "updatedAt": "2026-11-03T15:28:50.206492Z"
    }
  ],
  "environment": "development"
}
```

`changePercent` is measured from the first point of the retained window (the
simulator's "session open"), not from a real previous close.

### `GET /v1/markets/{symbol}`

`{ "market": { ...MarketView }, "environment": "development" }`

### `GET /v1/markets/{symbol}/history?points=60`

`points` is clamped to `2..=240`, default `60`.

```json
{
  "symbol": "BTC-USD",
  "interval": "1m",
  "points": [
    { "t": "2026-11-03T14:29:00Z", "p": "64250.00000000" }
  ]
}
```

## Orders

### `POST /v1/orders`

Headers: `Authorization`, `Idempotency-Key`, `Content-Type`.

Market order:

```json
{ "symbol": "BTC-USD", "side": "BUY", "type": "MARKET", "quantity": "0.5" }
```

Limit order:

```json
{ "symbol": "BTC-USD", "side": "SELL", "type": "LIMIT", "quantity": "0.5", "limitPrice": "70000.00" }
```

`201 Created` for a new order, **`200 OK` with the original order** for an
idempotent replay.

```json
{
  "id": "8c02fca2-afce-40c7-b03c-cb00cafec180",
  "symbol": "BTC-USD",
  "side": "BUY",
  "type": "MARKET",
  "status": "FILLED",
  "quantity": "0.50000000",
  "limitPrice": null,
  "filledQuantity": "0.50000000",
  "averageFillPrice": "66208.74501568",
  "fee": "33.10437251",
  "rejectionReason": null,
  "createdAt": "2026-11-03T15:28:56.167401Z",
  "updatedAt": "2026-11-03T15:28:56.167401Z"
}
```

Rules the client can rely on:

- Market orders fill immediately at the engine price; `status` is `FILLED`.
- Limit orders rest as `OPEN` and fill at the better of the limit and the market
  price when the price crosses.
- `fee` is 10 bps of the executed notional (configurable).
- Money effects are atomic: an order either applies fully or not at all.
- A key is bound to one payload. Reusing it with a different body is `422
  IDEMPOTENCY_KEY_REUSED`; retry with the same body, or use a new key.

### `GET /v1/orders?status=OPEN&limit=20&cursor=...`

Keyset pagination, newest first. `status` is one of `OPEN`, `FILLED`,
`CANCELLED`, `REJECTED`. `limit` is clamped to `1..=100`.

```json
{ "data": [ { "...Order" } ], "nextCursor": "1762183736167401|8c02fca2-..." }
```

Pass `nextCursor` back verbatim as `cursor`; `nextCursor` is `null` on the last
page. The cursor is URL-safe (digits + uuid), so it needs no encoding.

### `GET /v1/orders/{id}`

`{ ...Order }` or `404`. Another user's order is always `404`, never `403`.

### `POST /v1/orders/{id}/cancel`

Empty JSON body `{}`. Returns the order. Cancelling an already-cancelled order is
`200` with the same order (idempotent); a filled or rejected order is `409
ORDER_NOT_CANCELLABLE`.

## Portfolio

### `GET /v1/portfolio`

```json
{
  "cash": "66862.52311965",
  "currency": "USD",
  "equity": "99990.06868825",
  "realizedPnl": "0",
  "unrealizedPnl": "23.17306076",
  "positions": [
    {
      "symbol": "BTC-USD",
      "quantity": "0.50000000",
      "averageCost": "66208.74501568",
      "marketPrice": "66255.09113719",
      "marketValue": "33127.54556860",
      "unrealizedPnl": "23.17306076",
      "unrealizedPnlPercent": "0.0700"
    }
  ],
  "environment": "development"
}
```

`equity = cash + Σ marketValue`. Closed positions (quantity `0`) are omitted;
their realized P&L stays in `realizedPnl`.

## WebSocket quotes

`GET /v1/stream?symbols=BTC-USD,ETH-USD` (upgrade). No token is required: quotes
are public, and keeping credentials out of URLs keeps them out of logs. Omit
`symbols` to subscribe to everything. Unknown symbols are rejected with `400`
before the upgrade.

Server → client:

```json
{ "type": "snapshot", "quotes": [ { "...Quote" } ] }
{ "type": "quote", "quote": { "...Quote" } }
{ "type": "pong" }
```

Client → server:

```json
{ "type": "subscribe", "symbols": ["SOL-USD"] }
{ "type": "unsubscribe", "symbols": ["SOL-USD"] }
{ "type": "ping" }
```

The server also sends protocol-level `Ping` frames every 20 seconds. Reconnect
with exponential backoff plus jitter and re-send your subscriptions after a
reconnect; the first frame after connecting is always a `snapshot`.

## Client rules

1. Store the refresh token in the platform keychain (`expo-secure-store`), never
   in plain AsyncStorage. Keep the access token in memory only.
2. On `401`, refresh once and replay the failed request; if the refresh fails,
   clear the session and return to sign-in. Never loop.
3. `POST /v1/orders` must be retried only with the **same** `Idempotency-Key`.
   Generate one UUID per intent (button press), not per attempt.
4. Parse money with a decimal library or integer math. Never use `parseFloat` for
   balances.
5. Treat 4xx as terminal for that intent: show the message and let the user act.
