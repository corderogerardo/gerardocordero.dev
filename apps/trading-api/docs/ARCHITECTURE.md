# Architecture

## Shape

```
                    ┌──────────────────────────────┐
  Expo client ──────▶  axum HTTP + WebSocket      │
  (REST + WS)       │  api/  (transport)           │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │  trading/ (application)      │
                    │  use cases + transactions    │
                    └───────┬──────────────┬───────┘
                            │              │
              ┌─────────────▼───┐   ┌──────▼──────────┐
              │ domain/         │   │ market/         │
              │ pure rules      │   │ in-memory feed  │
              └─────────────────┘   └─────────────────┘
                            │
                    ┌───────▼──────────┐
                    │ store/ (SQL)     │
                    └───────┬──────────┘
                            │
                    ┌───────▼──────────┐
                    │ PostgreSQL 17    │
                    └──────────────────┘
```

Dependencies point inward: `api` depends on `trading` and `store`, `trading`
depends on `domain` and `store`, `domain` depends on nothing but `rust_decimal`.
The domain can be tested with no server, no database, and no clock.

## Modules

| Path | Responsibility | Rule |
| --- | --- | --- |
| `src/api/` | HTTP transport: routing, extractors, status codes, serialization | No SQL, no business decisions |
| `src/trading.rs` | Use cases that move money: create order, fill limit order, sweep | Owns transactions and lock ordering |
| `src/domain/` | Money, order validation, position math, price walk, seeded RNG | Pure functions, unit-tested |
| `src/market.rs` | In-memory quotes, history ring buffer, broadcast fan-out | No database access |
| `src/store/` | Every SQL statement in the project | No HTTP types |
| `src/auth/` | Argon2id hashing, JWT issue/verify | No database access |
| `src/rate_limit.rs` | Fixed-window limiter | Independent of transport |
| `src/config.rs` | Environment parsing and validation | Fails fast at startup |
| `src/error.rs` | The public error contract | Never leaks internals |

## Request lifecycle: placing a market order

1. `ValidJson` validates the body shape; `AppError` maps every rejection to the
   public error envelope.
2. `AuthUser` verifies the JWT and yields the user id.
3. `trading::create_order` validates semantics and computes a fingerprint of the
   economic intent.
4. One transaction:
   1. `INSERT … ON CONFLICT DO NOTHING` claims the idempotency key. A duplicate
      blocks on the unique index, then replays the committed order.
   2. `SELECT … FOR UPDATE` locks the account row.
   3. For sells, the position row is locked and the pure position math runs.
   4. Cash and position are written; the order and its trade are inserted.
   5. An audit event is appended.
   6. The idempotency row is completed and the transaction commits.
5. The handler returns `201` (new) or `200` (replay).

If any step fails, the transaction rolls back; there is no partial economic
effect.

## Lock ordering and concurrency

The only lock order is **order row → account row → position row**. Two flows use
it:

- Order creation locks account, then position.
- Limit fills lock the order, then account, then position.

Consequences:

- Two orders for the same account serialize on the account row. That is a
  deliberate throughput/latency trade: a single user's balance can never be
  overdrawn by a race.
- Sixteen concurrent matcher sweeps over one order produce exactly one trade.
  The status guard (`WHERE status = 'OPEN' … RETURNING`) and the unique index on
  `trades.order_id` both defend the invariant.
- Read paths (`portfolio`, `markets`) take no locks.

Verified by `tests/concurrency.rs`: one fill under 16 concurrent sweeps, no
overdraft under 6 concurrent market buys, and one order under 8 concurrent
retries with the same idempotency key.

## Money

- `NUMERIC(20, 8)` in Postgres, `rust_decimal::Decimal` in Rust, decimal
  **strings** on the wire.
- No `f64` anywhere in the money path. JavaScript clients must not use
  `parseFloat` for balances.
- Every value is rounded to 8 places at the boundary (`domain::money`).
- Fees are 10 bps of notional, charged on execution. The cost basis excludes the
  fee; realized P&L subtracts the exit fee. This is documented, tested, and
  consistent between buy and sell.

## Market data

`MarketEngine` owns a deterministic random walk per instrument, seeded from
configuration. At startup it backfills `MARKET_HISTORY_POINTS` minute buckets so
charts have data immediately. Tick events fan out through a Tokio broadcast
channel; the WebSocket layer forwards per-subscription quotes, and the matcher
sweeps resting limit orders for that symbol.

Determinism is a feature: the same seed produces the same series, which is what
makes market and matching tests reproducible. `set_price` exists for tests and
demos.

## Failure modes

| Failure | Behaviour |
| --- | --- |
| Postgres down | `/v1/readyz` returns `500`; requests fail fast after a 5s acquire timeout |
| Duplicate retry | Idempotent replay, `200`, no second trade |
| Two matchers on one order | Exactly one fill |
| Refresh token theft | Reuse detection revokes the whole family |
| Slow WebSocket client | Broadcast lag is logged; the client reconnects and re-subscribes |
| Market engine restart | Prices restart from the seed; positions are unaffected because they live in Postgres |

## Scaling path

Today the API is a single binary with an in-memory feed. That is enough for a
paper-trading product and it keeps the concurrency story easy to reason about.
The seams for growth are already in place:

1. **Multiple API instances** work for REST today (state is in Postgres). The
   price feed would diverge per instance; move `MarketEngine` behind a single
   publisher (Redis/NATS) or a dedicated market-data service.
2. **Matching** is idempotent and row-locked, so it can move to a worker pool.
   `open_limit_candidates` is the query to shard by symbol.
3. **History** is in memory for charting; persist candles to a time-series store
   when retention matters.
4. **Metrics and traces** are the next observability step (see `docs/PLAN.md`).

## What this is not

- Not a brokerage integration: no real orders, no custody, no regulatory
  reporting.
- Not a real market-data feed: prices are simulated and labelled as such.
- Not a multi-tenant enterprise system: no roles yet, one account per user.
