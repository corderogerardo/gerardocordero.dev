# Build plan — a task-by-task walkthrough for a junior

> This is the *how*. `PRODUCT.md` is the *what*, `ARCHITECTURE.md` is the *why*, `GLOSSARY.md` is
> the *what is that word*.
>
> Every task below has the same shape:
> **Goal** (one sentence) · **Why now** (what breaks if you skip it) · **Files** · **Do** ·
> **Prove it** (the command or behaviour that tells you it works) · **You learned** (what you can
> now defend in an interview).
>
> Do not skip ahead. Tasks 2–4 are the ones that make the rest cheap; skipping them means rewriting
> screens later.

---

## How to run the project

```bash
# once, from the worktree root
pnpm install

# the backend (Docker required). Ports are 54341-54347 on purpose, see supabase/config.toml
supabase start
supabase db reset            # drop + migrate + seed

# the app (needs a development build, not Expo Go: MMKV and camera are native)
pnpm --filter @gerardocordero/knockout-mobile start

# prove the config became native permissions (macOS; run after prebuild)
npx expo prebuild --no-install
pnpm --filter @gerardocordero/knockout-mobile verify:native
```

### Native prerequisites (macOS), and two traps this project already hit

1. **Xcode 27 rejects any pod whose deployment target is below iOS 15.0.**
   `ReachabilitySwift` (pulled in by `expo-updates`) still declares 12.0, and the build
   dies with `The iOS Simulator deployment target ... is set to 12.0`. `plugins/withIosDeploymentTarget.js`
   aligns every pod target with the app's own deployment target. It is a config plugin,
   not a hand-edited Podfile, because `ios/` is generated and gitignored.
2. **An Expo SDK 56 app traps at launch on an iOS 27 simulator** with
   `EXC_BREAKPOINT` in `_UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`:
   UIKit requires UIScene adoption, and React Native 0.85 does not implement it.
   Compiling, installing and signing all work; the process dies the moment it tries to
   create a window. Until this repo moves to an SDK with UIScene support, run the app on
   an **iOS 26 or older simulator runtime**, or verify the runtime behaviour on Android.
   Do not chase this as an app bug — the crash report and the iOS 27-only runtime list
   are in `odd/tasks/knockout.md` (L8).

The loop you run before saying "done", every time:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm architecture:check
```

---

## T0 — Scaffold and wire the workspace

- **Goal.** A running Expo app and an empty `sync-core` package, both visible to Turbo.
- **Why now.** Turbo only runs scripts it can find. A package without `typecheck`/`lint`/`test` is
  silently excluded from the loop, and you will not notice until CI is green but the code is broken.
- **Files.** `apps/knockout-mobile/{package.json,app.config.ts,tsconfig.json,eslint.config.js,jest.config.js,metro.config.js,babel.config.js}`, `packages/sync-core/{package.json,tsconfig.json,vitest.config.ts}`, root `package.json` (test filter).
- **Do.**
  1. Copy `apps/portfolio`'s config shapes, not its dependencies. Keep `types: []` in `tsconfig.json`
     (load-bearing in this repo) and exclude `__tests__` from the app tsconfig.
  2. Metro config must set `watchFolders` to the workspace root and `disableHierarchicalLookup: true`
     — without it the hoisted tree can resolve two copies of React.
  3. `sync-core` gets `"main": "./src/index.ts"` and `"exports"`, exactly like `packages/ui`.
- **Prove it.** `pnpm typecheck`, `pnpm lint`, `pnpm test` all exit 0 with the new packages present.
  `pnpm --filter @gerardocordero/sync-core test` prints "no tests" rather than "no script".
- **You learned.** How a pnpm + Turbo monorepo decides what "the project is green" means.

## T1 — Design tokens and UI primitives

- **Goal.** Six primitives (`Text`, `Button`, `Card`, `Pill`, `Sheet`, `EmptyState`) over a token
  module, so screens never hardcode a colour or a spacing number.
- **Why now.** Every later screen composes these. Retrofitting tokens after 12 screens is a rename
  campaign across the whole app.
- **Files.** `apps/knockout-mobile/src/ui/{tokens.ts,Text.tsx,Button.tsx,Card.tsx,Pill.tsx,Sheet.tsx,EmptyState.tsx}`.
- **Do.** Tokens are plain objects (`colors.bg`, `space[4]`, `radius.lg`, `font.body`). Primitives
  accept only token-backed props (`tone: "brand" | "danger"`), never a raw hex. `Button` takes
  `label`, `onPress`, `tone`, `disabled`, `busy`.
- **Prove it.** No file outside `src/ui/tokens.ts` contains a hex colour:
  `grep -rn "#[0-9a-fA-F]\{6\}" apps/knockout-mobile/src | grep -v tokens.ts` returns nothing.
- **You learned.** Why a design system is a *seam*, and why component APIs beat CSS-in-JS for
  reviewability.

## T2 — Database schema and seed

- **Goal.** The full relational model from `ARCHITECTURE.md §6`, with constraints, indexes, the
  `server_seq` trigger, and a seed that makes every screen non-empty.
- **Why now.** The schema decides the sync payloads. Writing the client first means rewriting both.
- **Files.** `supabase/migrations/0001_init.sql` … `0008_sync.sql`, `supabase/seed.sql`.
- **Do.**
  1. One migration per concern (orgs/teams, properties/territories, knocks, leads, dnc, scores,
     sync ledger, crm outbox). Never edit an applied migration — add a new one.
  2. Enums as Postgres `check` constraints or `create type`; pick one and stay consistent.
  3. Indexes shaped by the queries you will actually run, e.g.
     `create index on knocks (org_id, rep_id, occurred_at desc)`.
  4. Seed two orgs on purpose — a second org is how you test isolation later.
- **Prove it.** `supabase db reset` finishes with no error; `\d knocks` shows the index;
  `select count(*) from knocks` returns a plausible number.
- **You learned.** Migrations as append-only history, and why the second tenant in the seed is a
  test, not decoration.

## T3 — RLS policies and the pgTAP isolation matrix

- **Goal.** Every table denies cross-org access, proven by tests rather than by reading.
- **Why now.** RLS is the security boundary for a client that ships the anon key. A policy written
  after the screens is a policy written around them.
- **Files.** `supabase/migrations/0009_rls.sql`, `supabase/tests/01_rls.sql`, `supabase/tests/02_scoring.sql`.
- **Do.**
  1. `alter table … enable row level security;` on every table. No exception, not even lookups.
  2. `security definer` helpers `app.current_org_id()`, `app.is_manager()` with an explicit
     `search_path`.
  3. For each table: `select`, `insert`, `update`, `delete` policy — and a test that a member of
     org A gets zero rows from org B, and that an insert claiming org B fails.
- **Prove it.** `supabase test db` → all plans pass. Then break one policy deliberately and watch
  the suite fail; a test that cannot fail is not a test.
- **You learned.** The difference between authentication (who are you) and authorisation (what rows
  may you touch), at the row level.

## T4 — `sync-core`: the engine, in the open

- **Goal.** A framework-free module that turns a local outbox into server state, with backoff,
  idempotency, ordering, quarantine, and named conflict policies.
- **Why now.** It is the product's differentiator and the riskiest code. It has no UI dependency, so
  it can be finished and trusted before any screen exists.
- **Files.** `packages/sync-core/src/{contract.ts,backoff.ts,outbox.ts,policies.ts,engine.ts,index.ts}`, `packages/sync-core/test/*.test.ts`.
- **Do.**
  1. `contract.ts` first: Zod schemas for the mutation envelope and push response. Types come from
     the schemas, never the reverse.
  2. `backoff.ts` as a pure function of `(attempt, random)`.
  3. `engine.ts` receives ports: `{ outbox, transport, clock, random, log }`. It must not import
     anything from React, Expo, or Supabase — that rule is what makes the tests fast.
  4. Write the failure tests before the happy path: replay, partial batch, 409, terminal 422, clock
     skew, poison mutation.
- **Prove it.** `pnpm --filter @gerardocordero/sync-core test` — every described behaviour has a
  test that fails when you break the implementation.
- **You learned.** Dependency inversion in practice, and why "inject the clock" is the difference
  between a test suite that runs in 200 ms and one that is flaky in CI.

## T5 — Supabase client, typed database, auth

- **Goal.** Sign in, restore a session offline, and hold a typed handle to the database.
- **Files.** `apps/knockout-mobile/src/api/{client.ts,auth.ts}`, `packages/sync-core/src/database.types.ts` (generated), `src/data/stores/session.ts`.
- **Do.**
  1. Generate types: `supabase gen types typescript --local > packages/sync-core/src/database.types.ts`.
     Commit it and regenerate when the schema changes — a diff in that file is a reviewable schema change.
  2. Tokens go to `expo-secure-store`; the rest of the session to MMKV. Wire a `refreshSession`
     that is safe to call when offline (it must fail quietly and keep the cached session).
- **Prove it.** Kill the app and reopen with no network: you land on Shift, not Sign in.
- **You learned.** Where a token should live, and why generated types beat hand-written interfaces.

## T6 — `sync-push` Edge Function

- **Goal.** One endpoint that applies a batch atomically, deduplicates by mutation id, resolves
  conflicts server-side, and returns the new cursor.
- **Files.** `supabase/functions/sync-push/index.ts`, `supabase/functions/_shared/{auth.ts,cors.ts,errors.ts,schema.ts}`.
- **Do.** Authenticate the JWT → validate the batch with Zod → for each mutation: already applied?
  return the stored result. Otherwise apply inside a transaction, write `sync_mutations`, and update
  the row. Compare `version`; on mismatch return `409` with the server snapshot.
- **Prove it.** Send the same mutation twice with `curl`; the second response is identical and
  `select count(*) from leads` did not change.
- **You learned.** What a transaction buys you, and how idempotency is implemented rather than
  hoped for.

## T7 — HubSpot adapter and `hubspot-sync`

- **Goal.** A lead becomes exactly one HubSpot contact and one deal, once, even across retries.
- **Files.** `supabase/functions/_shared/hubspot/{interface.ts,real.ts,fake.ts,index.ts}`, `supabase/functions/hubspot-sync/index.ts`, `supabase/functions/_shared/hubspot/*.test.ts`.
- **Do.** Interface first (`findContact`, `upsertContact`, `upsertDeal`, `associate`). `FakeHubSpot`
  stores rows in memory. The real adapter maps 429 → retry with `Retry-After`, 4xx → terminal.
  `hubspot_links` records `(lead_id, contact_id, deal_id)` and is the proof of idempotency.
- **Prove it.** Run the function twice on the same lead with the fake adapter: one contact, one deal,
  two log lines, zero duplicates.
- **You learned.** How to integrate a third-party API without letting it dictate your architecture.

## T8 — Local database, DAOs, queries, stores

- **Goal.** The app reads and writes SQLite through typed DAOs, and screens consume TanStack Query
  hooks.
- **Files.** `src/db/{schema.ts,migrations.ts,dao/*.ts}`, `src/data/queries/*.ts`, `src/data/stores/{shift.ts,sync.ts}`.
- **Do.** `PRAGMA user_version` ladder for migrations. DAOs return domain types, not rows. Query
  hooks take `orgId` in the key so switching org cannot serve stale data. Writes go through a
  `mutateX()` helper that does the transaction of `ARCHITECTURE.md §3`.
- **Prove it.** A unit test writes a knock with the fake DB and asserts one row in `knocks` **and**
  one row in `outbox`.
- **You learned.** Why "one write, two tables, one transaction" is a design decision and not
  plumbing.

## T9 — Sync runtime: connectivity, background task, status pill

- **Goal.** The drainer runs at the right moments and the UI always knows the truth.
- **Files.** `src/sync/{transport.ts,runtime.ts,sqlite-outbox.ts,background.ts}`, `src/features/sync/SyncPill.tsx`.
- **Do.** One connectivity source feeds `onlineManager` and the pill. Drain on: app foreground,
  reconnect, manual, and the background task. Debounce; never run two drains concurrently (a single
  in-flight promise is enough). Reset stale `inflight` rows on boot.
- **Prove it.** Toggle the dev offline switch, make three knocks, kill and reopen the app, go online:
  all three drain in order exactly once.
- **You learned.** Concurrency control with one boolean, and why the OS will not sync for you on
  demand.

## T10 — Auth screen and Shift screen

- **Goal.** A rep can sign in and start a shift.
- **Files.** `app/_layout.tsx`, `app/(auth)/sign-in.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `src/features/shift/*`.
- **Do.** Root layout owns providers (Query, sync runtime, Sentry). Shift screen: streak ring, today's
  XP, knock count, *Start shift* / *End shift*, quick-knock row, sync pill in the header.
- **Prove it.** Maestro `smoke.yml` reaches `screen-shift`; a unit test renders the pill in all four
  states.
- **You learned.** Provider composition and why the root layout is the only correct place for it.

## T11 — Map, geofence, knock sheet

- **Goal.** A rep sees the territory, taps a property, records an outcome in one tap.
- **Files.** `app/(tabs)/map.tsx`, `app/knock/[propertyId].tsx`, `src/features/knock/*`, `src/features/territory/geo.ts`.
- **Do.** Point-in-polygon is a pure function (test it separately). Location permission is asked with
  a sentence explaining the benefit. The knock sheet is a modal with five big targets; a `set` opens
  the lead form. DNC properties render as non-tappable with a reason.
- **Prove it.** Pure geo tests; a component test that tapping *No answer* writes one knock; Maestro
  records a knock.
- **You learned.** Permissions as UX, and why geometry belongs in a pure function.

## T12 — Leads: list, detail, capture

- **Goal.** Find a lead, understand its history, add a photo and a QR-scanned code.
- **Files.** `app/(tabs)/leads.tsx`, `app/lead/[id].tsx`, `src/features/leads/*`, `src/features/capture/*`.
- **Do.** Filters: mine / unsynced / stage. Detail shows a timeline built from knocks and edits.
  Capture: photo to the app's document directory (never base64 in SQLite), QR via `CameraView`,
  validation with Zod before save.
- **Prove it.** A lead saved offline shows `unsynced`; after drain the badge disappears and a photo
  path appears in Storage.
- **You learned.** Binary assets do not belong in a row, and validation belongs at every boundary.

## T13 — Board and Sync diagnostics

- **Goal.** The game is visible; the sync engine is inspectable.
- **Files.** `app/(tabs)/board.tsx`, `app/(tabs)/settings.tsx`, `src/features/board/*`, `src/features/sync/SyncDiagnostics.tsx`.
- **Do.** Board: my rank, team board, badges, streak; subscribe to Realtime and refetch on change.
  Diagnostics: queue rows with attempt counts and last error, conflicts with *Keep mine / Keep
  theirs*, force sync, offline simulator switch.
- **Prove it.** Two simulators, one knock: the other device's board moves without a manual refresh.
- **You learned.** Realtime as a hint, not a source of truth.

## T14 — Server-authoritative scoring

- **Goal.** Ranks computed from raw knocks in SQL; the client only displays.
- **Files.** `supabase/migrations/0010_scoring.sql`, `supabase/tests/02_scoring.sql`, `src/features/board/format.ts`.
- **Do.** `recompute_daily_score(member, day)` sums XP, applies the capped streak multiplier, writes
  `daily_scores`. Trigger on `knocks`. Publish `daily_scores` to Realtime. Client formatting is a
  pure function with its own test.
- **Prove it.** pgTAP: a forged client XP value changes nothing; the function's output matches a
  hand-computed fixture.
- **You learned.** Never trust a number the client can compute, especially when money depends on it.

## T15 — Observability, permissions, native config

- **Goal.** Crashes and sync failures are visible in production; permissions are declared once.
- **Files.** `src/observability/{sentry.ts,telemetry.ts}`, `app.config.ts`, `scripts/verify-native-config.mjs`.
- **Do.** Sentry initialises only with a DSN present; scrub lead fields from breadcrumbs. Add camera,
  photo, location (when-in-use and always), and notification strings. The verify script runs
  `expo prebuild --no-install` in a temp dir and asserts the keys exist.
- **Prove it.** `node scripts/verify-native-config.mjs` exits 0; with no DSN the app boots and the
  Sentry module is a no-op.
- **You learned.** The honest version of "native work" in an Expo codebase — and how to prove it.

## T16 — App test suite

- **Goal.** Screens and hooks have behaviour tests, not snapshot noise.
- **Files.** `apps/knockout-mobile/__tests__/*.test.tsx`, `jest-setup.ts`, `tsconfig.test.json`.
- **Do.** One test per user-visible rule: the pill's four states, the sheet's write, the list's
  unsynced badge, the diagnostics' attempt list, the formatter's tie-breaks. Remember RNTL v14 is
  async: `await render(...)`.
- **Prove it.** `pnpm --filter @gerardocordero/knockout-mobile test`.
- **You learned.** The difference between testing implementation and testing a promise to the user.

## T17 — Maestro flows

- **Goal.** Three flows that prove the product's three promises.
- **Files.** `.maestro/smoke.yml`, `.maestro/offline-knock.yml`, `.maestro/leaderboard.yml`.
- **Do.** Use `testID`s already placed for unit tests (`tab-*`, `screen-*`, `knock-outcome-*`). The
  offline flow toggles the in-app simulator, not the device radio — deterministic on both platforms.
- **Prove it.** `maestro test .maestro/smoke.yml` on a booted simulator with a dev build.
- **You learned.** Why E2E should assert journeys, not pixels.

## T18 — Documentation and ADRs

- **Goal.** A junior, or an interviewer, can reconstruct every decision.
- **Files.** `docs/PRODUCT.md`, `ARCHITECTURE.md`, `GLOSSARY.md`, `PLAN.md`, `LEARNING-PATH.md`, `AI-WORKFLOW.md`, `docs/adr/0004..0008`.
- **Do.** Keep the four-question shape (what / why / how / alternative). Delete any paragraph that
  only restates the code.
- **Prove it.** Every file path named in this plan exists (`PLAN.md` is checked in T19).
- **You learned.** Writing is the last debugging step.

## T19 — Final verification

- **Goal.** Claim nothing you did not observe.
- **Do.** Run the loop, `supabase db reset`, `supabase test db`, the app suite, and the Maestro smoke
  flow. Reconcile every doc against the code. Update `AGENTS.md` (workspaces table) and
  `odd/tasks/README.md`.
- **Prove it.** Paste the commands and their exit codes into `odd/tasks/knockout.md` under `## Log`.
- **You learned.** The difference between "it should work" and "I watched it work".

---

## Order of work, and why it is this order

```
T0 ──▶ T1 ──▶ T2 ──▶ T3
                └──▶ T4 ──▶ T6 ──▶ T5 ──▶ T8 ──▶ T9 ──▶ T10..T13 ──▶ T14 ──▶ T15
                                     └──▶ T7
T16, T17 alongside the screens they cover. T18 after behaviour settles. T19 last, always.
```

`sync-core` (T4) can be built before the schema (T2) if you prefer: it only needs the *contract*, not
the tables. That is the point of the seam.
