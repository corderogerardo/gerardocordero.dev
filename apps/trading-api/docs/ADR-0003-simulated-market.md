# ADR-0003 — Simulated market data and paper trading only

- Status: accepted
- Date: 2026-11-03

## Context

The request was "a backend for a trading app". A real trading product needs a
licensed market-data feed, brokerage or exchange connectivity, custody of funds,
and regulatory obligations (KYC, best execution, reporting). None of that is
buildable — or legal to fake — in a portfolio project. Pretending otherwise would
mislead both users and reviewers.

## Decision

Build a **paper-trading platform** with a simulated market:

- `MarketEngine` generates prices with a seeded random walk, deterministic and
  reproducible. It backfills a minute-bucket history so charts work immediately.
- Orders execute against the simulated price. There is no real venue, no real
  money, and no external market-data dependency.
- The boundary is stated in the UI and the API: `environment` appears in market,
  portfolio, and health payloads, and the root endpoint returns a `disclaimer`.
- Trading semantics are still real: decimal money, fees, idempotency, limit
  orders, realized/unrealized P&L, audit trail, and concurrency guarantees. The
  hard engineering is not simulated; only the price source is.

## Consequences

- Swapping in a real feed is a localized change: implement a `MarketDataSource`
  with the same quote/history surface and remove the simulator from `main`.
- Backtests and demos are reproducible: the same seed yields the same prices.
- The product cannot be mistaken for an investment service; the disclaimer is in
  the README, the API root, and the mobile settings screen.
- Some real-world rules are intentionally absent: short selling, partial fills,
  margin, corporate actions, and market sessions. Each is a tracked follow-up
  rather than a hidden gap.

## Alternatives rejected

- **Real market data (free tier)**: adds an external dependency, licensing
  ambiguity, rate limits, and flaky tests without teaching anything new about the
  ledger.
- **Deterministic static prices**: easier, but removes the interesting parts —
  ticks, limit crossings, and live streaming.
