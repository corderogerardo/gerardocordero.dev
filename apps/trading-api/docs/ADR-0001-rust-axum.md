# ADR-0001 — Rust + Axum for the trading backend

- Status: accepted
- Date: 2026-11-03

## Context

The product moves money in a ledger that must not double-spend under concurrent
retries, runs a per-symbol price ticker, and fans quotes out to many WebSocket
clients. The two realistic stacks were TypeScript (NestJS/Fastify) and Rust
(Axum/Actix). The brief explicitly allowed leaving Node and asked for concurrency
strength. The candidate profile also values "a bias for action" and evidence of
technical depth, so the choice has to be justified, not fashionable.

## Decision

Use Rust (edition 2024, pinned by `rust-toolchain.toml` and `mise.toml`) with Axum
0.8 on Tokio, `sqlx` 0.9 for Postgres, and `rust_decimal` for money.

Why Axum over Actix:

- Extractors let the auth, JSON, and idempotency contracts live in one place.
- `tower`/`tower-http` gives tracing, CORS, request ids, and body limits as
  composable layers.
- Handler signatures stay boring and reviewable, which matters for juniors.

Why `sqlx` with runtime queries rather than compile-time macros:

- The project must build without a live database, in CI, and on a laptop with
  just Docker. `sqlx::query!` requires a prepared database or a checked-in offline
  cache, which is a sharp edge for a first-week contributor.
- The trade-off is real: SQL is checked at runtime, not compile time. Mitigation:
  every query is covered by an integration test against real Postgres, and the SQL
  lives in one module.

## Consequences

- Two languages in the product (Rust + TypeScript), so CI has two toolchains.
  That is the price of the concurrency and money-safety story.
- Compile times are slower than Node. Incremental builds stay reasonable and the
  release image is a ~20 MB binary on Debian slim.
- Hiring signal: the codebase demonstrates ownership of memory, error, and
  concurrency models instead of framework glue.

## Alternatives rejected

- **NestJS**: excellent DX and the industry default for this profile, but the
  ledger and matching loop would lean on the same Postgres locks anyway, and the
  concurrency story would be less visible.
- **Actix-web**: faster in synthetic benchmarks, more ceremony per handler, and
  the benchmark gap does not matter at this product's scale.
- **Go + chi/Fiber**: a fine middle ground; rejected because the strongest
  correctness guarantee for money (`Decimal` + explicit error handling) is more
  ergonomic in Rust.
