# Trading platform (paper trading)
Objective: Create two new projects under `apps/` — a Rust backend (`apps/trading-api`) and an Expo SDK 58 mobile client (`apps/trading-mobile`) — for a simulated paper-trading product, plus a junior-ready delivery plan covering unit, integration, e2e, security, and concurrency tests.
Branch: `feature/trading-platform`. Delivery: `single-pr` (work-unit commits are the review slices; forecast ~3,500–5,000 authored lines including tests and docs, generated files excluded). Verification: `make verify` in `apps/trading-api` (fmt, clippy, unit + integration + security + concurrency tests against Postgres) and `cd apps/trading-mobile && pnpm verify` plus the repo loop (`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm architecture:check`).

## Specs

### S1 — Two new projects, contained under `apps/`
- User request: “quiero que crees 2 proyectos nuevos uno frontend mobile y el backend para esto”
- Scope: Additive only. `apps/trading-mobile` (Expo) and `apps/trading-api` (Rust). No existing app source is modified. Root wiring is limited to the workspace test filter and new CI/docs files.
- Acceptance: Both directories are self-contained, each with its own README, AGENTS.md, and runnable quality loop; `git diff --name-only` outside those directories lists only additive root wiring.
- Checks: `pnpm architecture:check`; `git status --short` review of touched paths.

### S2 — Rust backend, chosen for concurrency
- User request: “de hecho que mejor lo hagamos sobre rust el backend” / “puede ser go para manejar concurrencia con algun framework de go o rust”
- Scope: Axum 0.8 on Tokio, `sqlx` with PostgreSQL, `rust_decimal` for money, Argon2id passwords, HS256 access tokens, opaque rotating refresh tokens.
- Acceptance: The server builds with `cargo clippy -- -D warnings`; money is never represented as `f64`; concurrent order fills are guarded by atomic SQL, not read-then-write.
- Checks: Unit + integration + concurrency suites in `apps/trading-api`.

### S3 — Latest Expo SDK for the mobile client
- User request: “su app en react native usando el ultimo sdk de expo”
- Scope: Expo SDK 58 (`expo@~58.0.22`, React 19.3, React Native 0.88.1), expo-router, TypeScript strict, React Compiler enabled. No custom Babel/Metro layer; styling uses a typed token module and `StyleSheet`.
- Acceptance: `expo-doctor` reports no blocking issue; typecheck, lint, and jest pass; the app renders markets, market detail with chart and order ticket, portfolio, orders, and settings.
- Checks: `cd apps/trading-mobile && pnpm typecheck && pnpm lint && pnpm test`; `npx expo-doctor`.

### S4 — Trading product surface
- User request: “un backend para una app de trading”
- Scope: Paper trading only. Registration/login with rotating refresh tokens, instrument list with live simulated prices, market and limit orders with idempotent submission, portfolio with positions and P&L, order history, and a public WebSocket quote stream. Explicitly out of scope: real brokerage execution, real market data, deposits/withdrawals, short selling, and regulatory reporting (documented in ADR-0003).
- Acceptance: A user can register, receive $100,000 of simulated cash, place a market order, see the position and cash change, place a limit order, see it fill on a crossing tick or cancel it, and stream quotes over WebSocket.
- Checks: `tests/e2e_trading_journey.rs` exercises that flow over real HTTP against Postgres.

### S5 — Test pyramid, all layers
- User request: “que cubras los tests unit test, e2e, security tests, todos los tests de un producto completo”
- Scope: Rust unit tests (domain + crypto + rate limiter), integration tests (routers against Postgres), security tests (authn/authz, token tampering and reuse, SQL injection probes, rate limiting, idempotency replay/conflict), concurrency tests (no double fill, no negative balance), e2e journey over HTTP, and mobile unit/component tests plus Maestro flows. Load testing is scripted and documented, run on demand.
- Acceptance: Every layer runs from a documented command; concurrency and security suites fail if their invariant is broken; skipped layers are reported explicitly.
- Checks: `make verify` output; `cd apps/trading-mobile && pnpm test`; Maestro flows are authored and marked not-run without a booted simulator.

### S6 — Junior-ready delivery plan
- User request: “quiero que hagas un plan completo con tareas bien definidas que un junior pueda tomar”
- Scope: `apps/trading-api/docs/PLAN.md` holds ordered tasks with goal, files, acceptance criteria, tests required, and done-when. Each task is independently reviewable and names its layer.
- Acceptance: Every future task maps to a spec and states its verification; no task requires undocumented context.
- Checks: Read back against the implemented code so file paths in the plan are real.

### S7 — Tech-lead quality bar
- User request: “necesito que contenga las cualidades que te mencione de un lider tecnico, el mejor stack”
- Scope: Architecture doc, ADRs for the load-bearing decisions, threat model, security policy, error contract, observability (structured tracing with request IDs), CI job with a Postgres service, Dockerfile, compose file, Makefile, and reproducible environment pinning (`mise.toml`, `rust-toolchain.toml`).
- Acceptance: A new engineer can run the product from a clean checkout using only the README; decisions have written rationale and rejected alternatives.
- Checks: Fresh-shell run of the documented commands; CI workflow parses (`yamllint`-level review).

### S8 — English artifacts, Spanish conversation
- Scope: All code, comments, docs, commit messages, and UI copy are English. The reply to the user stays in Spanish.
- Acceptance: No Spanish strings in generated artifacts except verbatim quotes in the ODD log and specs.
- Checks: Spot-check of written files.

### S9 — AI-forward project instructions
- User request: “We’re an AI-forward team: we use AI tools every day”
- Scope: Each project ships an `AGENTS.md` describing the working loop, invariants, and what an agent must not do, so Claude/Cursor/Copilot-assisted work stays consistent.
- Acceptance: Both AGENTS.md files match the real commands and are verified by running them.
- Checks: Command readback.

### S10 — Documented paper-trading boundary
- Scope: README, ADR-0003, and the mobile settings screen state that prices are simulated and no real orders are placed.
- Acceptance: The claim is visible before a user trades (settings + README), and API responses identify the environment.
- Checks: Readback; `environment` field present in `/healthz` and the mobile settings screen.

## Tasks
- [x] T1 — Write the ODD feature document, API contract, and junior plan skeleton — Specs S1–S10, route: inline, status: complete, commit: ac7b255.
- [x] T2 — Scaffold `apps/trading-api` (Cargo, mise/toolchain pin, migrations, config, error contract) — Specs S2, S7, route: inline, status: complete, commit: 97cf64f.
- [x] T3 — Implement domain layer (decimal money, order state machine, P&L, seeded price engine) with unit tests — Spec S2, S5, route: inline, status: complete, commit: 97cf64f.
- [x] T4 — Implement auth (Argon2id, JWT access, rotating refresh with reuse detection) and rate limiting — Specs S2, S4, S5, route: inline, status: complete, commit: 97cf64f.
- [x] T5 — Implement markets, orders with atomic idempotency, portfolio, and WebSocket quotes — Specs S4, S5, route: inline, status: complete, commit: 97cf64f.
- [x] T6 — Implement limit-order matching task with atomic SQL and concurrency tests — Specs S2, S5, route: inline, status: complete, commit: 97cf64f.
- [x] T7 — Write integration, security, concurrency, and e2e suites; run them against Postgres — Spec S5, route: inline, status: complete, commit: 97cf64f.
- [x] T8 — Scaffold `apps/trading-mobile` on Expo SDK 58 and wire the isolated install — Specs S3, S7, route: inline, status: complete, commit: a0672f4.
- [x] T9 — Implement the mobile client (session, API layer, markets, detail/chart, order ticket, portfolio, orders, settings) — Specs S3, S4, route: delegated (Writer trigger: independent unit with a disjoint edit surface; S3/S4 contract supplied), status: complete, commit: a0672f4.
- [x] T10 — Write mobile unit and component tests plus Maestro flows — Spec S5, route: delegated with T9, status: complete, commit: a0672f4.
- [x] T11 — Add architecture, ADRs, threat model, security policy, README, AGENTS.md, plan, Dockerfile, compose, Makefile — Specs S6–S10, route: inline, status: complete, commit: 97cf64f.
- [x] T12 — Add the CI workflow for the new projects and record the isolated mobile install — Specs S1, S7, route: inline, status: complete, commit: ac7b255.
- [x] T13 — Run the full verification (backend `make verify`, mobile gates, expo-doctor, Metro bundle, architecture fitness), review the diff, and close — Specs S1–S10, route: inline plus one independent verifier for the security-touching change, status: complete, commit: ac7b255.

## Log

### L1 — Original request (2026-11-03)
> dentro de @apps/ quiero que crees un proyecto que satisfaga las siguientes requisitos: Happy Monday. 
>
> Recruiting a very strong LATAM based Fullstack (BE leaning) Product Engineer for a fast growing Health Tech startup. 
>
> $7,000-$10,000 USD
>
> Here is the deal: 
>
> They have an extreme high bar for not only their people but themselves. 
>
> They don't just judge on technical ability, but very strong startup experience, a bias for action, and just generally strong EQ. 
>
> Being good, won't be good enough. 
>
> - 5+ years working in Node.js, TypeScript, React.
> - AWS, and strong Postgres experience (indexing, optimizing queries)
> - C1 English
> - If you have worked in Voice AI (huge plus)
> - Former Founder/CTO/Hackaton winner (huge plus)
> - Wanting to be at the front of a mission driven company in healthcare (huge plus) Tech Lead (AI-Forward) – Rebuild a Core Platform from Scratch 🚀 | Nimble.LA
>
> We’re looking for a Tech Lead to drive the rebuild of a client’s core platform, moving from a Python codebase to a modern full-stack architecture with React/Next.js and Node.js.
> We’re an AI-forward team: we use AI tools every day to design, build, review, and ship faster, and we expect you to do the same. You’ll design the new system from scratch, work directly with the client, and bridge legacy Python logic into a scalable stack, with AI as part of your daily workflow.
>
> What you bring:
> Excellent English: you’ll talk directly with the client and push back when needed
> Strong React expertise (architecture, state, performance)
> Node.js backend experience (REST/GraphQL, auth, scalable services)
> Python proficiency to read and migrate legacy logic
> Autonomy and a senior mindset: you drive features end-to-end
> Comfort working with AI coding tools (Claude, Cursor, Copilot, etc.) to move faster without lowering the bar y quiero que hagas un backend para una app de trading con su app en react native usando el ultimo sdk de expo, usa todas las skills que necesites, quiero que crees 2 proyectos nuevos uno frontend mobile y el backend para esto, necesito que contenga las cualidades que te mencione de un lider tecnico, el mejor stack, no tiene que ser node y nest, puede ser go para manejar concurrencia con algun framework de go o rust, de hecho que mejor lo hagamos sobre rust el backend, sea como sea que quieras iniciar, quiero que hagas un plan completo con tareas bien definidas que un junior pueda tomar, que cubras los tests unit test, e2e, security tests, todos los tests de un producto completo, puedes buscar ejemplos en internet y todo lo que necesites investigar

### L2 — Toolchain and SDK decisions (2026-11-03)
- Rust is not on this machine; installed `rust@1.99.1` through `mise` and pinned it in `apps/trading-api/mise.toml` + `rust-toolchain.toml`. The Makefile falls back to `mise exec -- cargo` when `cargo` is not on PATH.
- Expo's latest stable is SDK 58 (`expo@58.0.22`, RN 0.88.1, React 19.3.0), not the portfolio's SDK 56. Scaffolding used the official `default@latest` template and the SDK 58 native-module map for exact versions.
- Mixing SDK 56 and 58 in the hoisted pnpm tree polluted the portfolio's resolution (`@expo/metro-runtime@58` grafted onto expo 56, duplicate native modules). The mobile app is therefore excluded from the workspace (`!apps/trading-mobile`) and installs with `pnpm install --ignore-workspace` and its own lockfile. Result: `expo-doctor` 20/20 and a verified Metro bundle (1475 modules).
- Evidence: `npx expo-doctor@latest` → “20/20 checks passed”; `npx expo export --platform ios` → bundle written.

### L3 — Refresh semantics correction (2026-11-03)
- The generated client cleared the keychain whenever a token refresh failed, including transport failures. Corrected to distinguish them: a rejected refresh (401) clears the session; a transport failure (status 0) keeps it, so an offline moment does not force a re-login. One regression test added (`115` mobile tests total).

### L4 — Install contamination fixed, not a pre-existing failure (2026-11-03)
- `pnpm --filter @gerardocordero/portfolio typecheck` failed in `packages/ui` (`className` is not a prop of `Pressable`/`View`/`Text`). Initial diagnosis blamed the baseline because `pnpm-lock.yaml` matched `main`; that was wrong.
- Root cause: while the mobile app was briefly a workspace member, the hoisted install materialized `packages/ui/node_modules/react-native@0.88.1`. `packages/ui` then type-checked against RN 0.88 types while the NativeWind augmentation applied to the root RN 0.85.3 copy.
- Fix: removed the stale nested `node_modules` and reinstalled. The full repo loop is now green (`pnpm typecheck` 8/8, `pnpm lint` 8/8, `pnpm test` 2/2, `pnpm architecture:check` 0 violations). No shared code changed.

### L5 — Verification evidence (2026-11-03)
- Backend: `make verify` → fmt clean, clippy `-D warnings` clean, **80 unit tests + 32 HTTP suites** (auth 9, trading 9, security 8, concurrency 3, quote stream 2, e2e 1) green against Postgres 17.
- Live smoke: server started, register → market buy (0.5 BTC) → idempotent replay returned the same order id → portfolio reflected cash/position/P&L → invalid order returned `422 VALIDATION_ERROR` with `details.field`.
- Mobile: `pnpm typecheck`, `pnpm lint`, `pnpm test` → **11 suites / 115 tests**; `expo-doctor` 20/20; iOS Metro export succeeded. Maestro flows authored, not run (no booted simulator / dev build).
- Repo: `pnpm architecture:check` green; the new app is outside the workspace by design.
- Commits: `97cf64f` (backend), `a0672f4` (mobile), `ac7b255` (wiring + CI + this record).

### L6 — Delivery closure (2026-11-03)
- PR: https://github.com/corderogerardo/gerardocordero.dev/pull/134 — `MERGEABLE`, base `main`, 6 commits.
- CI on the PR head: `Trading platform` backend and mobile jobs pass; the repo `CI` verify/backend-tests/validate-learn jobs pass.
- Repo loop after the merge with main: `pnpm typecheck` 8/8, `pnpm lint` 8/8, `pnpm test` 2/2, `pnpm architecture:check` 0 violations.
- Maestro on a booted iPhone 17e (iOS 27) with the dev build: `smoke.yml`, `sign-in.yml`, and `place-order.yml` all pass. The flows were hardened for the native password-save sheet, iOS autofill (field erase), and Maestro device selection (`-p ios`).
- Observed during the burst: the matcher logged two `pool timed out` errors and recovered; no stuck transactions remained (4 idle connections, 0 open orders). Not changed; it is a capacity note for production, not a defect.
