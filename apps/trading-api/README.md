# Meridian — paper-trading API

A production-shaped **paper-trading backend**: Rust + Axum, PostgreSQL, decimal
money, atomic ledger, rotating refresh tokens, idempotent order submission, and a
live WebSocket quote stream. The mobile client lives in
[`apps/trading-mobile`](../trading-mobile).

> **Paper trading only.** Prices are simulated by a seeded engine and no real
> order is ever placed. The API states this in `/`, `/v1/markets`, and
> `/v1/portfolio`, and the app repeats it in Settings. See
> [`docs/ADR-0003`](docs/ADR-0003-simulated-market.md).

## What it does

- Register / login with Argon2id + rotating refresh tokens (reuse detection).
- Browse six instruments with live simulated prices and minute-bucket history.
- Submit **market** and **limit** orders with `Idempotency-Key`, fees, and a
  per-user audit trail.
- Track cash, positions, average cost, realized and unrealized P&L.
- Stream quotes over `/v1/stream` (public) with subscribe/unsubscribe frames.
- Match resting limit orders on every tick, exactly once, under concurrency.

## Quick start

Prerequisites: Rust 1.94+ (this repo pins `1.99.1` through `mise`), Docker, and
`make`.

```bash
cd apps/trading-api

make db-up                      # Postgres 17 on localhost:5433
cp env.example .env
printf 'JWT_SECRET=%s\n' "$(openssl rand -hex 32)" >> .env   # 32+ chars required

make run                        # http://127.0.0.1:8080
curl -s localhost:8080/v1/healthz
```

On this machine the toolchain is provided by `mise`, so prefix cargo commands
with `mise exec --` if `cargo` is not on your PATH:

```bash
mise exec -- cargo test --lib
```

## The loop

```bash
make verify     # fmt check + clippy -D warnings + unit + integration (+ Postgres)
make test       # same suite, explicit
make load       # on-demand k6 load test (requires k6)
```

`make verify` is the gate. It starts Postgres if needed and runs **112 tests**:
80 unit tests (no database) and 32 HTTP suites against real Postgres, including
security, concurrency, end-to-end, and the WebSocket stream contract.

## Configuration

| Variable | Default | Notes |
| --- | --- | --- |
| `DATABASE_URL` | — | Required |
| `JWT_SECRET` | — | Required, 32+ chars, placeholders rejected |
| `HOST` / `PORT` | `127.0.0.1` / `8080` | Bind address |
| `ENVIRONMENT` | `development` | `development`, `test`, `production` |
| `RUST_LOG` | `trading_api=info,tower_http=info,sqlx=warn` | `tracing` filter |
| `MARKET_TICK_MS` | `1000` | Simulator tick |
| `MARKET_SEED` | `42` | Deterministic price seed |
| `MARKET_VOLATILITY_BPS` | `25` | Per-tick walk width |
| `MARKET_DRIFT_BPS` | `0` | Per-tick bias |
| `MARKET_HISTORY_POINTS` | `240` | Minute buckets retained |
| `INITIAL_CASH` | `100000.00` | Opening simulated balance |
| `FEE_BPS` | `10` | 0.10% per execution |
| `MAX_ORDER_NOTIONAL` | `1000000.00` | Rejects absurd orders |
| `ACCESS_TOKEN_TTL_SECONDS` | `900` | 15 minutes |
| `REFRESH_TOKEN_TTL_SECONDS` | `2592000` | 30 days |
| `CORS_ORIGINS` | empty | Comma-separated; disabled by default |
| `AUTH_RATE_LIMIT_MAX` / `..._WINDOW_SECONDS` | `5` / `900` | Login/register per IP |
| `ORDER_RATE_LIMIT_MAX` / `..._WINDOW_SECONDS` | `60` / `60` | Orders per IP |
| `GLOBAL_RATE_LIMIT_MAX` / `..._WINDOW_SECONDS` | `300` / `60` | All routes per IP |

Invalid configuration fails at startup with a specific message. That is
deliberate: a server with a weak secret should not boot.

## Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` | — | Service info + disclaimer |
| `GET` | `/v1/healthz` | — | Liveness |
| `GET` | `/v1/readyz` | — | Readiness (checks Postgres) |
| `POST` | `/v1/auth/register` | — | Create account with simulated cash |
| `POST` | `/v1/auth/login` | — | Email + password |
| `POST` | `/v1/auth/refresh` | — | Rotate refresh token |
| `POST` | `/v1/auth/logout` | Bearer | Revoke a refresh token |
| `GET` | `/v1/me` | Bearer | User + cash |
| `GET` | `/v1/markets` | — | Instruments with live quotes |
| `GET` | `/v1/markets/{symbol}` | — | One instrument |
| `GET` | `/v1/markets/{symbol}/history?points=60` | — | Minute points for charts |
| `POST` | `/v1/orders` | Bearer + `Idempotency-Key` | Market or limit order |
| `GET` | `/v1/orders?status=&limit=&cursor=` | Bearer | Keyset-paginated history |
| `GET` | `/v1/orders/{id}` | Bearer | One order |
| `POST` | `/v1/orders/{id}/cancel` | Bearer | Cancel an open order |
| `GET` | `/v1/portfolio` | Bearer | Cash, equity, positions, P&L |
| `GET` | `/v1/stream?symbols=...` | — | WebSocket quotes |

Full request/response contract: [`docs/api.md`](docs/api.md).

## Project layout

```
src/
  api/         HTTP transport (routes, extractors, handlers, WebSocket)
  domain/      money, order rules, position math, price walk, seeded RNG
  store/       every SQL statement in the project
  auth/        Argon2id + HS256 tokens
  market.rs    in-memory quotes, history, broadcast fan-out
  trading.rs   use cases that move money (transactions, lock ordering)
  config.rs    validated environment
  error.rs     the public error contract
migrations/    forward-only SQL, embedded at compile time
tests/         auth, trading, security, concurrency, quote stream, e2e (real Postgres)
docs/          architecture, API contract, ADRs, security, plan
```

## Design decisions worth reading

- [`ADR-0001`](docs/ADR-0001-rust-axum.md) — why Rust/Axum, and why runtime SQL
  instead of compile-time macros.
- [`ADR-0002`](docs/ADR-0002-decimal-money-and-atomic-ledger.md) — decimal money,
  one transaction per effect, idempotency as a unique constraint, lock ordering.
- [`ADR-0003`](docs/ADR-0003-simulated-market.md) — the paper-trading boundary.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — data flow, concurrency model,
  failure modes, scaling path.
- [`docs/SECURITY.md`](docs/SECURITY.md) — threat model, controls, known gaps.
- [`docs/PLAN.md`](docs/PLAN.md) — junior-ready backlog with acceptance criteria.

## What is intentionally missing

Real market data, brokerage connectivity, deposits/withdrawals, short selling,
partial fills, margin, roles, email verification, and password reset. Each is a
tracked task in [`docs/PLAN.md`](docs/PLAN.md), not a hidden gap. Short selling is
explicitly rejected by the ledger.

## License

MIT. Educational and portfolio use.
