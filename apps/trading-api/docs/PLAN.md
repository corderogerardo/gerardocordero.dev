# Delivery plan

This is the working backlog for the trading platform. It is written so a junior
engineer can pick up any task without a meeting: every task names its files, its
acceptance criteria, and the tests that must exist before it is done.

The feature that created this code is tracked in `odd/tasks/trading-platform.md`
(repo root). Specs there use `S#`; tasks here use `B#` (backend), `M#` (mobile),
and `X#` (cross-cutting).

## How to pick up a task

1. Read `docs/ARCHITECTURE.md` and the module you are touching. If a rule is not
   written down, ask before inventing one.
2. Reproduce the current behavior with a test. The test must fail for the right
   reason (RED) before you write the fix.
3. Keep the change inside one task. If you need a schema change, write the
   migration first and mention it in the PR.
4. Run `make verify` for the backend, or `cd apps/trading-mobile && pnpm verify` for
   the mobile app. The mobile app is not a pnpm workspace member (its SDK 58
   install is isolated), so it takes no `--filter`. Both gates must be green.
5. Update `docs/api.md` if a payload changed, and add an entry to
   `docs/ARCHITECTURE.md` if a new module or failure mode appears.

## Definition of done

- [ ] Behavior covered by at least one test that would fail if the behavior
      regressed, at the lowest layer that can prove it.
- [ ] Boundary inputs validated (empty, negative, too long, wrong type, unknown
      enum value).
- [ ] Errors use the existing contract (`code`, `message`, optional field).
- [ ] No secret, token, password hash, or raw SQL parameter in a log or response.
- [ ] `make verify` green; new code has no clippy warnings.
- [ ] Docs updated when the contract changed.
- [ ] One conventional commit (`feat:`, `fix:`, `docs:`, `test:`), and the PR
      description quotes the task id.

## Where to start (first week)

Do these three in order. They are small, they force you to read the whole stack,
and they improve the product immediately.

1. **B1 — trade history endpoint.** Reads `trades` (already written by every fill)
   and exposes it. Touches migration-free SQL, one handler, one test file.
2. **B3 — authenticated order updates over WebSocket.** Forces you to understand
   the broadcast channel, the auth extractor, and the stream protocol.
3. **M3 — recent-trades panel on the market screen.** Uses B1; forces the mobile
   data layer and the empty/loading/error states.

## Backend tasks

| ID | Size | Task | Depends on |
| --- | --- | --- | --- |
| B1 | S | Expose trade history | — |
| B2 | M | Generate OpenAPI from handlers and fail CI on contract drift | B1 |
| B3 | M | Authenticated order events over WebSocket | — |
| B4 | M | Partial fills for limit orders | B3 |
| B5 | M | Reserve cash/shares for resting limit orders | B4 |
| B6 | S | Idempotency retention job plus metrics | — |
| B7 | S | Prometheus metrics endpoint | — |
| B8 | M | Proxy-aware rate limiting | B7 |
| B9 | M | Portfolio equity snapshots for the chart | B7 |
| B10 | M | Admin role and audit query endpoint | — |
| B11 | S | `cargo deny` advisories and licence policy in CI | — |
| B12 | S | Zero-downtime migration policy and rehearsal | B5 |

### B1 — Expose trade history (S)

- **Goal:** `GET /v1/trades?limit=20&cursor=...` returns the caller's executions,
  newest first.
- **Files:** `src/api/trades.rs` (new), `src/store/trades.rs` (add keyset query),
  `src/api/mod.rs`, `docs/api.md`, `tests/trading.rs`.
- **Acceptance:** another user's trades are invisible; `nextCursor` is stable;
  an empty account returns `{"data":[],"nextCursor":null}`.
- **Tests:** integration test with two users and three fills; pagination test with
  `limit=2`; auth test without a token (`401`).
- **Done when:** the mobile order row can show the executed price and fee from
  this endpoint rather than inferring them.

### B2 — OpenAPI and contract drift (M)

- **Goal:** `GET /v1/openapi.json` describes every route, and a test fails if a
  handler changes without the spec changing.
- **Files:** `src/api/openapi.rs`, `Cargo.toml` (`utoipa`), `tests/openapi.rs`,
  `docs/api.md` (generated or validated).
- **Acceptance:** the generated document validates against OpenAPI 3.1; a handler
  added without registration makes the test fail.
- **Tests:** schema validation plus a route-completeness assertion.
- **Note:** do not delete the hand-written `docs/api.md`; keep it as the narrative
  contract and let the JSON be machine-readable.

### B3 — Order events over WebSocket (M)

- **Goal:** a client can authenticate on the socket and receive `order` frames when
  its orders change state.
- **Files:** `src/api/stream.rs`, `src/trading.rs` (publish events),
  `src/state.rs` (an order-event channel), `tests/stream.rs`, `docs/api.md`.
- **Protocol:** first client frame is `{"type":"auth","token":"<access>"}` within
  5 seconds; the server answers `{"type":"authenticated"}` and then streams
  `{"type":"order","order":{...}}` for that user only. Authorization failure closes
  with code `4401`.
- **Acceptance:** no token in the URL; a second user never receives another user's
  order; a limit fill emits exactly one event.
- **Tests:** integration test with a real WebSocket client (`tokio-tungstenite`):
  happy path, missing auth timeout, cross-user isolation, one event per fill.
- **Security:** never log the token; never accept the token as a query parameter.

### B4 — Partial fills (M)

- **Goal:** a limit order larger than the available liquidity fills in pieces
  instead of all-or-nothing.
- **Files:** `migrations/0002_partial_fills.sql`, `src/trading.rs`,
  `src/domain/portfolio.rs`, `src/store/orders.rs`, `tests/concurrency.rs`.
- **Acceptance:** `filled_quantity` and `average_fill_price` are consistent;
  status becomes `FILLED` only when `filled_quantity = quantity`; a partially
  filled order can be cancelled, keeping the executed part.
- **Tests:** table-driven unit tests for the weighted average; integration test for
  two fills; concurrency test proving the sum of fills never exceeds the order.
- **Note:** this changes the ledger invariants. Read ADR-0002 and write the new
  invariant into `docs/ARCHITECTURE.md` in the same PR.

### B5 — Reserve funds and shares (M)

- **Goal:** placing a resting limit order reserves the cash (buy) or units (sell)
  it would need, instead of rejecting it at fill time.
- **Files:** `migrations/0003_reservations.sql`, `src/trading.rs`,
  `src/store/accounts.rs`, `src/store/positions.rs`, `docs/api.md`.
- **Acceptance:** `cash` in the portfolio shows available vs reserved; cancelling
  releases the reservation; a fill consumes it exactly once.
- **Tests:** concurrency test with two crossing orders and one reservation; release
  on cancel; no negative available balance.
- **Done when:** "insufficient_funds at fill time" is no longer a reachable state
  for an order that was accepted.

### B6 — Idempotency retention (S)

- **Goal:** delete idempotency rows older than the configured retention (default
  30 days) without deleting orders.
- **Files:** `src/maintenance.rs` (new task), `src/config.rs`, `Makefile`, tests.
- **Acceptance:** the job is idempotent; deleting a row never cascades into orders;
  the retention window is configurable and logged at startup.
- **Tests:** unit test for cutoff computation; integration test that a replay after
  retention creates a new order (documented behavior).

### B7 — Metrics (S)

- **Goal:** `GET /metrics` exposes request duration, order counts by side/status,
  open orders, WebSocket connections, and pool saturation.
- **Files:** `src/telemetry.rs`, `src/api/metrics.rs`, `Cargo.toml`, `docs/`.
- **Acceptance:** Prometheus text format; no user ids or symbols as unbounded
  labels; `/metrics` is not rate-limited but is bound to an internal listener in
  production.
- **Tests:** integration test asserting the text format and a known counter.

### B8 — Proxy-aware rate limiting (M)

- **Goal:** key the limiter on the real client address behind a trusted proxy.
- **Files:** `src/api/extract.rs`, `src/config.rs`, `docs/SECURITY.md`.
- **Acceptance:** forwarded headers are ignored unless the peer is in
  `TRUSTED_PROXY_CIDRS`; spoofed headers from an untrusted peer change nothing.
- **Tests:** unit tests for the parser; integration test with a fake proxy peer.

### B9 — Equity snapshots (M)

- **Goal:** persist a daily (or per-tick) equity point per user so the portfolio can
  chart its own history.
- **Files:** `migrations/0004_equity_snapshots.sql`, a maintenance task,
  `src/api/portfolio.rs`, `docs/api.md`.
- **Acceptance:** one row per user per interval; a backfill command exists; the
  endpoint returns the last N points.
- **Tests:** unit test for bucketing; integration test for the endpoint and for
  idempotent snapshot writes.

### B10 — Admin role (M)

- **Goal:** a read-only support role that can inspect audit events and orders.
- **Files:** `migrations/0005_roles.sql`, `src/api/extract.rs`, `src/api/admin.rs`,
  tests.
- **Acceptance:** role is checked server-side; a normal user gets `403`; an admin
  can never move money.
- **Tests:** authorization matrix for every admin route.

### B11 — Dependency policy (S)

- **Goal:** CI fails on a known-vulnerable dependency or a disallowed licence.
- **Files:** `deny.toml`, CI workflow.
- **Acceptance:** `cargo deny check advisories bans licences sources` is green and
  runs on every PR.

### B12 — Zero-downtime migrations (S)

- **Goal:** document and rehearse expand → migrate → contract for a destructive
  change.
- **Files:** `docs/ARCHITECTURE.md`, `docs/runbooks/migrations.md`.
- **Acceptance:** a rehearsal on a scratch database shows the old binary still works
  after the expand step.
- **Tests:** none automated; the rehearsal is recorded with commands and output.

## Mobile tasks

| ID | Size | Task | Depends on |
| --- | --- | --- | --- |
| M1 | S | EAS profiles and a store-ready build | — |
| M2 | S | Accessibility pass with screen-reader and dynamic-type checks | — |
| M3 | M | Recent trades panel on market detail | B1 |
| M4 | M | Push notification on fill | B3 |
| M5 | M | Offline-first portfolio cache | — |
| M6 | S | Biometric unlock | — |
| M7 | M | Candlestick chart with gestures | — |
| M8 | S | Maestro flows in CI | M1 |

### M1 — EAS profiles (S)

- **Goal:** `eas.json` with `development`, `preview`, and `production` profiles, and
  a documented release path.
- **Files:** `apps/trading-mobile/eas.json`, `README.md`, `app.json`.
- **Acceptance:** `eas build --profile preview --platform ios` is configured; no
  credentials in the repo; bundle ids are unique to this app.
- **Tests:** `npx expo-doctor` clean; config readback.

### M2 — Accessibility (S)

- **Goal:** every interactive element has a role, label, and state; text respects
  dynamic type; contrast meets WCAG AA on the dark theme.
- **Files:** `src/ui/*`, screens under `src/app/`.
- **Acceptance:** VoiceOver and TalkBack can complete sign-in and place an order;
  no text clipped at 200% font scale; `accessibilityLabel` on icon-only buttons.
- **Tests:** component tests asserting labels; a manual checklist committed in the
  PR.

### M3 — Recent trades (M)

- **Goal:** market detail shows the last fills with price, size, and side.
- **Files:** `src/api/trades.ts`, `src/app/market/[symbol].tsx`, tests.
- **Acceptance:** empty state, loading skeleton, error retry; no float math.
- **Tests:** unit test for the mapper; component test for empty and populated.

### M4 — Push on fill (M)

- **Goal:** the user receives a notification when a resting order fills.
- **Files:** server device-token registration (new endpoint), `expo-notifications`
  client, permission flow.
- **Acceptance:** permission denial degrades gracefully; tokens are per-device and
  revocable; no order data in the notification payload beyond symbol and status.
- **Tests:** server integration test for token registration; client test for the
  permission gate.

### M5 — Offline-first portfolio (M)

- **Goal:** the last portfolio renders instantly on a cold start and reconciles when
  the network returns.
- **Files:** `src/session/`, `src/api/query-client.ts`, tests.
- **Acceptance:** stale data is visibly marked with a timestamp; mutations are never
  replayed offline (orders require connectivity).
- **Tests:** unit test for cache hydration; component test for the stale banner.

### M6 — Biometric unlock (S)

- **Goal:** optional Face ID / fingerprint gate on app resume.
- **Files:** `src/session/biometrics.ts`, settings screen, tests.
- **Acceptance:** refresh token is only readable after a successful unlock; fallback
  to password login; no lockout loop.
- **Tests:** unit tests with a mocked `expo-local-authentication`.

### M7 — Candlesticks (M)

- **Goal:** OHLC chart with pan/zoom on the market screen.
- **Files:** `src/ui/chart/`, `src/api/history.ts`, tests.
- **Acceptance:** 60fps on a mid-range Android device; renders in under 16ms per
  frame; no layout shift on data arrival.
- **Tests:** pure scale/tick math unit tests; a render test with fixture candles.

### M8 — Maestro in CI (S)

- **Goal:** smoke and trade flows run on every PR via EAS Workflows.
- **Files:** `.eas/workflows/e2e.yml`, `apps/trading-mobile/.maestro/`.
- **Acceptance:** iOS and Android jobs pass on a sample PR; the workflow is
  documented as requiring the paid EAS `maestro` job type.
- **Tests:** the flows themselves; a failure screenshot is uploaded as an artifact.

## Cross-cutting tasks

| ID | Size | Task |
| --- | --- | --- |
| X1 | S | Record a load-test baseline in `docs/performance.md` |
| X2 | M | OpenTelemetry traces across HTTP, SQL, and the matcher |
| X3 | S | `EXPLAIN` review of the ten hottest queries and an index write-up |
| X4 | S | Threat-model review using the diff of `docs/SECURITY.md` |

## Testing map

| Layer | Where | What it proves |
| --- | --- | --- |
| Unit | `cargo test --lib` | Money math, order validation, P&L, price walk, JWT, password policy, rate limiter |
| Integration | `tests/*.rs` (except e2e) | HTTP contracts, authorization, idempotency, rate limits, SQL behavior, WebSocket stream |
| Security | `tests/security.rs` | Authn/authz, token tampering and reuse, injection probes, error hygiene |
| Concurrency | `tests/concurrency.rs` | No double fill, no overdraft, one order per key |
| E2E | `tests/e2e_journey.rs` | The full user story over real HTTP + Postgres |
| Load | `scripts/load-test.js` | Latency curve and ledger consistency under sustained load (on demand) |
| Mobile unit | `cd apps/trading-mobile && pnpm test` | Formatting, decimal math, API mapping, reconnect policy |
| Mobile component | same | Screen states with mocked network |
| Mobile E2E | `.maestro/*.yml` | Real device flow (requires a booted simulator) |

Anything not covered is listed in `docs/SECURITY.md` under known gaps. Do not
claim coverage you cannot run.
