# ADR-0002 — Decimal money, one transaction per effect, atomic idempotency

- Status: accepted
- Date: 2026-11-03

## Context

A trading ledger fails in ways that are hard to see: a rounding drift of
`0.00000001` per trade, a balance overdrawn by two concurrent buys, or a retried
request that charges twice. Floating point and check-then-act code are the usual
causes.

## Decision

1. **Money is `NUMERIC(20, 8)` in Postgres and `Decimal` in Rust.** On the wire it
   is a string. `f64` never enters the money path.
2. **One transaction per economic effect.** Order insert, cash movement, position
   update, trade row, audit row, and idempotency completion commit together or not
   at all.
3. **Row locks in a fixed order**: order → account → position. Locking is
   pessimistic on purpose: the ledger is the product, and a retryable deadlock is
   better than an overdraft.
4. **Idempotency is a unique constraint, not a read-then-write.** The key is
   claimed with `INSERT … ON CONFLICT DO NOTHING` inside the same transaction as
   the order. A concurrent duplicate blocks on the index, wakes after the commit,
   and replays the committed order. The request body is fingerprinted (SHA-256 over
   the normalized intent), so the same key with a different body fails with
   `IDEMPOTENCY_KEY_REUSED` instead of silently returning the wrong order.
5. **Defence in depth in the schema**: `CHECK` constraints for non-negative cash,
   quantity, fee, and limit-price/type coherence; a unique index on
   `trades.order_id`; a partial index for open orders.

## Consequences

- A single account's orders serialize on its account row. For a paper-trading
  product that is the right trade: correctness over per-user throughput. Sharding
  by user is straightforward if it ever matters.
- Every fill path must follow the lock order. This is documented in
  `src/trading.rs` and punished by `tests/concurrency.rs`.
- Fees are expensed, not capitalized into the cost basis. That is a product
  decision, documented and tested; changing it requires updating the portfolio
  tests in the same commit.
- The idempotency row stays forever in v1. A retention job is a tracked follow-up
  (`docs/PLAN.md`, B6); the key must outlive the longest retry window, which is
  longer than a day.

## Alternatives rejected

- **Advisory locks / serializable isolation**: correct but harder to explain and
  easier to misconfigure. Row locks with one order are explicit.
- **Optimistic concurrency with a version column**: pushes retry loops into every
  handler; for money, blocking is simpler.
- **Redis-based idempotency**: adds a second consistency domain (Redis vs
  Postgres) and cannot commit atomically with the order.
