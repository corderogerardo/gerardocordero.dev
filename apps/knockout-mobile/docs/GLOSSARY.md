# Technical glossary

Every technology and pattern this product uses, with the same four questions answered:
**what it is**, **why we use it here**, **how it works in this code**, and **what we rejected**.

Read the sections in order the first time. Later, jump by name.

---

## A. The app: language, framework, navigation

### TypeScript (strict mode)

- **What.** JavaScript plus a static type system that is erased at build time.
- **Why.** A sync engine is a state machine with many illegal states — "queued but already
  applied", "synced but never sent". Types make those states unrepresentable, and the job asks for
  "exceptional proficiency".
- **How here.** `"strict": true`, `noUncheckedIndexedAccess`, and discriminated unions for anything
  with a state field (`type Mutation = { state: "pending" } | { state: "inflight"; attempt: number }
  | …`). No `any`; `unknown` at boundaries and Zod to narrow it.
- **Rejected.** Plain JS (no), and `tsc` as a bundler (too slow; Metro/Babel strips types).

### React 19

- **What.** The UI library. React 19 adds `use()`, actions, and removes most `forwardRef` needs.
- **Why.** It is what the monorepo's Expo SDK ships. Hooks discipline is a named requirement.
- **How here.** Function components only. Server state belongs to TanStack Query, not `useEffect`;
  the only effects are subscriptions (Realtime, network listener, app-state listener) and each one
  cleans up.
- **Rejected.** Class components, and Redux for state that is really server cache.

### React Native

- **What.** A framework where JS drives real native views instead of the DOM.
- **Why.** One codebase for iOS and Android, which is the job.
- **How here.** No `react-native-web` target: this app is field-only, so every design decision can
  assume a phone held in one hand, in sunlight, with gloves off.
- **Rejected.** Flutter (different hire), native Swift/Kotlin (two teams, not one).

### Expo SDK (the monorepo's pinned major)

- **What.** A curated set of React Native libraries, build tooling, and OTA updates, with versions
  pinned to work together.
- **Why.** The job says "extensive React Native and Expo expertise" and "Expo across build,
  deployment, device management, and release channels". Expo is the release pipeline.
- **How here.** `app.config.ts`, `expo-*` modules only (no unmaintained third-party native libs
  except MMKV), and a development build (not Expo Go) so native modules work.
- **Version note.** This app pins the **same Expo major the rest of the repo uses**, not the newest
  one. Reason, observed rather than assumed: this workspace installs with `node-linker=hoisted`, and
  a second Expo major flips the *hoisted* `react-native`, `babel-preset-expo`, `jest-expo` and
  `hermes-parser` to the newer versions, which breaks `apps/portfolio`'s Jest run. Two RN majors in
  one flat tree is the constraint; moving the whole repo to a new SDK is a separate, tracked upgrade
  (`odd/tasks/expo-sdk-upgrade.md`), not a side effect of adding an app.
- **Rejected.** Bare RN without Expo: you then own Fastlane, code signing, and OTA yourself.

### Expo Router

- **What.** File-system routing built on React Navigation, with typed routes.
- **Why.** Deep links matter here: a push notification ("you were assigned a lead") must open the
  lead, not the home screen.
- **How here.** `app/(auth)`, `app/(tabs)`, and two dynamic routes: `app/lead/[id].tsx` and
  `app/knock/[propertyId].tsx` (the latter presented as a modal).
- **Rejected.** Manual React Navigation config: more files, no typed routes, same result.

### React Native New Architecture (Fabric + TurboModules)

- **What.** RN's rewritten renderer and native-module bridge (JSI instead of the async bridge).
- **Why.** It is the default in current RN, and the job lists it as preferred.
- **How here.** Nothing to opt into, but two consequences you must know: native modules must be
  TurboModule-compatible (MMKV is), and `expo prebuild` generates the native projects for you — so
  the "below the abstraction" work is configuration (permissions, background modes), not Swift.
- **Rejected.** Legacy architecture: it is going away, and some libraries already require the new one.

### Hermes

- **What.** The JS engine React Native ships on both platforms.
- **Why.** Fast startup and low memory, which matters on a cheap Android phone a contractor hands
  to a canvasser.
- **How here.** Default. Consequence: no `Intl` edge cases to worry about, but always test on a
  real Hermes build rather than assuming Node semantics.

---

## B. State and data on the device

### TanStack Query v5

- **What.** A cache for server state: fetching, caching, background refetching, mutations, and
  cache invalidation, keyed by query.
- **Why.** The job says "strongly preferred", and it solves the classic bug: two screens showing
  two versions of the same lead.
- **How here.** All reads go through query keys (`["leads", orgId]`, `["board", "daily", date]`).
  With no network the cache serves the last good value and marks it stale. `onlineManager` is wired
  to the app's own connectivity source so TanStack stops trying to refetch while offline.
- **Rejected.** Redux Toolkit Query (fine, but heavier), raw `fetch` + `useEffect` (the bug factory).

### Zustand

- **What.** A tiny store: `create((set) => ({ … }))`, no providers, no boilerplate.
- **Why.** Session and UI state (current shift id, sync status, offline simulator) are not server
  cache and must not live in React state that dies on navigation.
- **How here.** Three slices: `session`, `shift`, `sync`. Persisted slices use `persist` with a
  custom storage adapter over MMKV.
- **Rejected.** Redux (ceremony for three slices), Context (re-renders the tree on every change).

### Zod

- **What.** Runtime schema validation with TypeScript types inferred from the schema.
- **Why.** TypeScript vanishes at runtime. Everything crossing a boundary — PostgREST responses,
  edge-function payloads, QR codes, the offline queue rehydrated from disk — is untrusted.
- **How here.** `packages/sync-core/src/contract.ts` owns the wire schemas (mutation envelope,
  push response, knock outcome enum). Parse at the edge, use the inferred type inside.
- **Rejected.** Hand-written type guards (drift), io-ts (smaller ecosystem), no validation (bugs
  that only appear on a real device).

### expo-sqlite

- **What.** SQLite compiled into the app, with an async API over the same file on iOS and Android.
- **Why.** A field app's source of truth must survive a crash, an OOM kill, and a battery pull. A
  JSON file or AsyncStorage cannot hold a few thousand knocks plus an outbox with transactional
  guarantees.
- **How here.** `src/db/` owns schema creation, a `PRAGMA user_version` migration ladder, and typed
  DAOs. Every write that also enqueues a mutation uses one transaction
  (`withTransactionAsync`) — that atomicity is the entire correctness argument.
- **Rejected.** AsyncStorage (no queries, no transactions), WatermelonDB (see ADR-0005).

### react-native-mmkv

- **What.** A key-value store backed by a memory-mapped file; reads are synchronous and fast.
- **Why.** The job names MMKV. It is the right tool for small, hot, synchronous data.
- **How here.** Only three things live there: the session token envelope, the last-sync cursor, and
  the offline-simulator flag. Never business data — that is SQLite's job.
- **Rejected.** AsyncStorage for these: it is async, so every read forces an await on the startup
  path where you least want one. (Note: MMKV needs a dev build, not Expo Go.)

### expo-secure-store

- **What.** Keychain on iOS, Keystore on Android.
- **Why.** A refresh token in plain MMKV is readable on a rooted or jailbroken device.
- **How here.** Tokens only. The rest of the session (user id, org id, role) sits in MMKV.

### WatermelonDB — rejected, deliberately

- **What.** A reactive database for RN with a built-in sync protocol.
- **Why rejected.** Its sync layer hides exactly the mechanics this project exists to demonstrate:
  which side wins a conflict, what happens on a partial batch failure, how idempotency is
  guaranteed. Its New Architecture support is also newer than SQLite's. Full reasoning in
  `docs/adr/0005-sqlite-over-watermelondb.md`.
- **When you would pick it.** A large app with many tables and a team that has already agreed on
  those semantics and does not want to write them.

---

## C. Sync concepts (the part that gets you hired)

### Offline-first

- **What.** The local database is the source of truth for the user's actions; the server is a
  replica that catches up. The opposite — "online-first with a cache" — means a tap needs the
  network to count.
- **How here.** A knock is committed to SQLite and acknowledged on screen before any HTTP call.

### Outbox pattern

- **What.** Instead of calling the API from the UI, you append the intent to a local queue in the
  same transaction as the local write, and a single drainer sends the queue.
- **Why.** It gives you ordering, retry, dedupe, and crash-resume for free — and it makes "did this
  action reach the server?" a queryable fact instead of a hope.
- **How here.** `outbox` table: `id`, `entity`, `entity_id`, `op`, `payload`, `created_at`,
  `attempt`, `next_attempt_at`, `state`, `last_error`. One drainer, one at a time, ordered by
  `created_at, id`.
- **Rejected.** Fire-and-forget requests from the UI (loses data), service-worker-style background
  queues (not available in RN).

### Idempotency key

- **What.** A client-generated UUID attached to a mutation so that re-sending it is a no-op.
- **Why.** The killer case: the server commits, the response is lost, the client retries. Without a
  key you get two leads and Priya in ops finds them.
- **How here.** The mutation id is generated once, at write time, and never regenerated. The server
  keeps `sync_mutations(mutation_id primary key, applied_at)`; a replay returns the original result
  instead of applying again.

### Exponential backoff with jitter

- **What.** Wait `base × 2^attempt` (capped) plus a random fraction.
- **Why.** Without jitter, a hundred phones coming out of a tunnel retry in lockstep and knock the
  API over. Without backoff, a broken endpoint gets hammered.
- **How here.** `backoff.ts` in `sync-core`: `min(cap, base * 2 ** attempt) * (0.5 + random()/2)`,
  `base = 1s`, `cap = 60s`, max 8 attempts, then quarantine. Pure function of `(attempt, random)` so
  tests can pin it.

### Dead-letter queue (quarantine)

- **What.** Mutations that failed terminally leave the retry loop and wait for a human.
- **Why.** An infinite retry loop is indistinguishable from a hang, and it blocks everything behind
  it if your queue is ordered.
- **How here.** `state = 'quarantined'`, shown on the Sync screen with its last error and a *Retry*
  and *Discard* action. A quarantined mutation does not block the ones behind it.

### Conflict resolution

- **What.** Deciding what a record becomes when two devices changed it since the last pull.
- **Policies used here** (one per field group, declared in `policies.ts`):
  - `server-wins` — reference data: properties, territories, DNC. The server is authoritative.
  - `client-wins` — the rep's own observations: knock outcome, notes, photo.
  - `field-merge` — lead contact fields (per-field last-write-wins using `updated_at`).
  - `manual` — lead ownership (reassignment). Never guessed; shown to the user.
- **Why not CRDTs.** A CRDT buys you convergence without coordination, at the cost of tangled
  semantics and payloads. For five outcomes and a handful of contact fields, explicit policies are
  smaller, explainable, and testable. That trade-off is the answer you give in the interview.
- **Why not vector clocks.** One writer per field group in practice; a version integer plus
  `updated_at` is enough.

### Cursor-based pull (watermark)

- **What.** Instead of "give me everything changed since timestamp X", you pull by a monotonic
  sequence: `where server_seq > cursor order by server_seq limit n`.
- **Why.** Clocks lie. A phone's clock can be minutes off, and two rows committed in the same
  millisecond can be skipped by `>` on a timestamp.
- **How here.** Every synced table has `server_seq bigint` filled by a trigger from a sequence; the
  push response returns the new cursor; the client stores it in MMKV.

### Optimistic UI

- **What.** The UI updates as if the write succeeded, then reconciles with the server.
- **Why.** Waiting 400 ms for a round trip while standing on a porch is unacceptable; waiting
  forever with no signal is worse.
- **How here.** Local insert + outbox append + `queryClient.setQueryData`. If the mutation is
  quarantined, the row is flagged `unsynced` in the list instead of vanishing.

### Background sync

- **What.** Syncing while the app is not in the foreground.
- **Why.** A rep pockets the phone after a knock; the queue should drain before the next street.
- **How here.** `expo-background-task` registers a periodic task (Android WorkManager / iOS
  BGTaskScheduler) that runs one bounded drain. It is *opportunistic*: iOS decides when. The app
  therefore also drains on foreground, on reconnect, and on demand. Never claim background sync is
  instant.
- **Rejected.** `expo-background-fetch` (deprecated in favour of `expo-background-task`).

---

## D. Backend: Supabase and Postgres

### Supabase

- **What.** Managed Postgres with a REST layer (PostgREST), auth, realtime, storage, and serverless
  functions — all speaking to the client through one URL and one anon key.
- **Why.** Named explicitly in the job. It also removes an entire backend service from the scope
  while keeping the hard part (data modelling, RLS, sync semantics) in view.
- **Rejected.** A bespoke Node/Rust API: demonstrates backend skill but not the backend this role
  actually uses (ADR-0006).

### Postgres

- **What.** The relational database.
- **Why.** This domain is relational: orgs own teams own members who own knocks on properties.
  Constraints belong in the database, not only in TypeScript.
- **How here.** `org_id` on every tenant row; composite indexes shaped by the real queries
  (`knocks (org_id, rep_id, occurred_at desc)`); `check` constraints on enums; a sequence plus
  trigger for `server_seq`.

### Row-Level Security (RLS)

- **What.** Per-row policies evaluated by Postgres for every query, using the JWT claims of the
  caller.
- **Why.** The anon key ships inside the app bundle. Anyone can extract it. RLS is the only thing
  standing between that key and another contractor's data.
- **How here.** Every table `enable row level security`, plus explicit `using` and `with check`
  policies. Membership is resolved through a `security definer` helper
  (`app.current_org_id()`, `app.is_manager()`) so policies stay one line and are not recursive.
  Tested with pgTAP, not by hand (see below).
- **Rejected.** Filtering in the client (trivially bypassed), a service-role key on the device
  (worst possible idea).

### PostgREST

- **What.** Supabase's auto-generated REST API over Postgres, driven by table privileges and RLS.
- **How here.** Reads (properties, leads, board) go straight through PostgREST via
  `@supabase/supabase-js`. Writes that need business logic or ordering go through the
  `sync-push` Edge Function instead, so the merge rules live in one place.

### Supabase Realtime

- **What.** Postgres changes streamed over a WebSocket channel.
- **How here.** One channel per team for `daily_scores`; the board refetches on `postgres_changes`.
  Realtime is a hint, not a source of truth — if the socket drops, the next foreground refetch fixes it.
- **Rejected.** Polling the board every 5 s (battery, and it is a battery-powered product).

### Edge Functions (Deno)

- **What.** TypeScript functions deployed next to the database, running on Deno.
- **Why.** `sync-push` needs to apply a batch atomically with idempotency; `hubspot-sync` needs a
  secret HubSpot token. Neither can live on the device.
- **How here.** `supabase/functions/sync-push/`, `supabase/functions/hubspot-sync/`, shared code in
  `supabase/functions/_shared/` (auth, CORS, error contract, Zod schemas).
- **Gotcha.** Deno ≠ Node: use `npm:` specifiers, `Deno.env.get`, and no `process`.

### pgTAP

- **What.** A Postgres unit-testing extension (`plan()`, `ok()`, `results_eq()`).
- **Why.** RLS bugs are silent. A policy that is too permissive returns data with a 200 and looks
  fine in the app until someone else's customer shows up.
- **How here.** `supabase/tests/*.sql`, run by `supabase test db`, with an isolation matrix: for
  each table, a member of org A tries to read, insert, update, and delete org B rows and must fail.
- **Rejected.** Testing RLS from JS: you would be testing PostgREST's error formatting, and each
  case costs a network round trip.

### Postgres triggers and `security definer` functions

- **What.** Server-side code that runs inside the same transaction as the write.
- **How here.** `server_seq` assignment, and `recompute_daily_score(member, date)` — the scoring
  function. `security definer` is required so the function can read across the rows it needs; it is
  therefore written with an explicit `search_path` to avoid privilege escalation.

### Supabase Storage

- **What.** S3-compatible object storage with RLS-scoped buckets.
- **How here.** `lead-photos` bucket. The device keeps the local file URI in SQLite; the sync
  uploads the binary after the row is accepted, and stores the returned path.

### Supabase CLI (local stack)

- **What.** `supabase start` runs Postgres, PostgREST, GoTrue, Realtime, Storage, and Studio in
  Docker.
- **Why.** The whole backend is reproducible from `supabase/migrations` with one command, and CI
  can run the same thing.
- **How here.** Ports are shifted to **54341–54347** in `supabase/config.toml` because another
  Supabase stack on this machine already owns the defaults. `supabase db reset` rebuilds schema and
  seed in seconds.

### Postgres Cron (`pg_cron`) — where used

- **What.** Scheduled SQL inside the database.
- **How here.** Nightly re-score of open days and a `hubspot-sync` kick. Nothing that must happen
  within seconds belongs in cron.

---

## E. Integrations

### HubSpot CRM API v3

- **What.** HubSpot's REST API for CRM objects — contacts, deals, and the associations between them.
- **Why.** Named in the job. This is how a field lead becomes revenue-visible for the contractor.
- **How here.** `hubspot-sync` drains a `crm_outbox` table: search contact by email/phone →
  create-or-update → upsert the deal → associate → record ids in `hubspot_links`. Every step is
  idempotent because it is re-runnable.
- **Gotchas.** Search indexing lags a create by seconds, so "search then create" can duplicate under
  concurrency; we serialise per lead and store the link on first success. Rate limits are per second
  and per day; honour `Retry-After` on 429 and never retry a 4xx that is not 429.

### FakeHubSpot

- **What.** An adapter implementing the same interface as the real HubSpot client, backed by an
  in-memory store plus a JSON fixture.
- **Why.** Tests must not need the internet or a secret. And a demo without a token must still be
  honest: the same code path runs, only the transport differs.
- **How here.** `supabase/functions/_shared/hubspot/{interface,real,fake}.ts`, selected by
  `HUBSPOT_MODE=fake|real`.

---

## F. Device capabilities

### expo-location + geofencing

- **What.** Permissioned access to device location, plus native geofences that wake the app on
  entry/exit.
- **How here.** Foreground watch while the map is open; `startGeofencingAsync` for the territory
  boundary; background updates require `askAsync` + a config-plugin permission string. The header
  shows *In zone* / *Out of zone*; being outside never blocks a knock.
- **Gotchas.** iOS caps simultaneous geofence regions and throttles background location; requesting
  "always" before explaining why gets you a denial you cannot re-ask.

### expo-camera

- **What.** Camera plus barcode/QR scanning (`CameraView` with `barcodeScannerSettings`).
- **How here.** Two uses: one property photo per lead (`takePictureAsync`), and scanning the code
  printed on the door hanger to bind the property without typing an address.

### expo-notifications

- **What.** Local and remote notifications.
- **How here.** Local notifications are scheduled on shift start (*"4pm — close out your shift"*)
  and fired when Realtime reports a lead assigned to you. True remote push needs APNs/FCM
  credentials, which are documented but not committed.

### expo-network

- **What.** Connectivity state.
- **How here.** The single connectivity source: it feeds the sync pill, `onlineManager`, and the
  drainer's "should I even try" check.

---

## G. Observability and release

### Sentry

- **What.** Crash and error reporting with breadcrumbs, releases, and performance traces.
- **Why.** The job names Sentry and "release-health telemetry". Without it you learn about field
  crashes from a tweet.
- **How here.** A thin `src/observability/sentry.ts` that initialises only when
  `EXPO_PUBLIC_SENTRY_DSN` exists, wraps the root component, tags events with `release`,
  `runtime_version`, and `org_id` (never PII), and scrubs lead contact fields from breadcrumbs.
- **Rejected.** Firebase Crashlytics: two dashboards for one job, and it needs Google services files.

### Sync telemetry

- **What.** Structured events for the sync loop: `sync.drain.start/end`, per-mutation outcome,
  retry, quarantine, conflict.
- **Why.** "It did not sync" is not a bug report. `queue_depth`, `last_success_at`, and
  `attempt histogram` are.

### EAS Build / Submit / Update

- **What.** Expo's cloud build (with credentials), store submission, and over-the-air JS updates.
- **How here.** Three channels — `development`, `preview`, `production` — mapped to build profiles;
  `runtimeVersion` policy `fingerprint`-style so an OTA never lands on an incompatible native build;
  OTA rollout documented with a rollback step (`eas update:republish` to the previous group).
- **Gotcha to know cold.** OTA can only ship JS and assets. A new native module requires a new
  build and therefore a new runtime version.

### Config plugins + `expo prebuild`

- **What.** Small scripts that patch the generated `Info.plist` / `AndroidManifest.xml`.
- **How here.** Background location, camera, photo library, and notification permission strings are
  declared once in `app.config.ts`; `expo prebuild` produces the native project. This is the
  practical, Expo-native version of "work below the RN abstraction layer".
- **Verification.** `npx expo prebuild --no-install` into a scratch copy, then assert the expected
  keys exist — that check is the difference between a claim and a fact.

---

## H. Testing

### Vitest

- **What.** A fast test runner with native ESM, `vi.useFakeTimers()`, and snapshot support.
- **Why.** Named in the job. Used where it shines: pure TypeScript with no React Native.
- **How here.** `packages/sync-core` only — engine, policies, backoff, cursor, dedupe. Thousands of
  deterministic cases in milliseconds because time and randomness are injected.
- **Not used for** the app: mixing Vitest and jest in one package fights over transforms and mocks.

### jest-expo

- **What.** A Jest preset configured for Expo/RN transforms.
- **How here.** `apps/knockout-mobile`, with the repo's proven setup. RNTL v14 is async-by-default:
  `await render(...)`, `await fireEvent.press(...)`.

### React Native Testing Library (RNTL)

- **What.** Render a component, query it the way a user would (`getByRole`, `getByText`), fire
  events.
- **Why.** Component tests should survive a styling refactor. Querying by test id everywhere makes
  them brittle to intent changes.
- **How here.** Behaviour per screen: the knock sheet saves on tap; the pill shows four states; the
  Sync screen lists attempts.

### Maestro

- **What.** A black-box mobile E2E tool driven by YAML flows, using accessibility labels.
- **Why.** It is already proven in this repo, needs no native test harness, and runs on both
  platforms. Detox is the job's named tool, but it requires a native build pipeline and is
  appreciably heavier — the migration path is documented in `ARCHITECTURE.md`.
- **How here.** `.maestro/smoke.yml`, `.maestro/offline-knock.yml`, `.maestro/leaderboard.yml`. The
  offline flow uses the app's own offline simulator (deterministic on both platforms) instead of
  Maestro's Android-only airplane-mode toggle.

### fake clock / injected randomness

- **What.** Passing `now()` and `random()` into the engine instead of calling `Date.now()` and
  `Math.random()`.
- **Why.** A test that sleeps is a flaky test; a test that asserts on real time is worse.
- **How here.** Every port is a plain function or object parameter. The Vitest suite advances a
  virtual clock and asserts exact `next_attempt_at` values.

---

## I. Repo tooling

### pnpm workspaces

- **What.** One `node_modules` layout, workspace packages linked by name (`workspace:*`).
- **How here.** `apps/knockout-mobile` depends on `@gerardocordero/sync-core`; the root script
  `pnpm test` includes it so the loop covers it.

### Turborepo

- **What.** Task runner with caching and dependency graph awareness (`dependsOn: ["^build"]`).
- **How here.** `typecheck`, `lint`, `test` run per workspace, cached by input hash. Adding a package
  means adding scripts with those exact names, or the loop silently skips you.

### ESLint 9 flat config

- **What.** The linter, now configured as a flat array instead of `.eslintrc`.
- **Gotcha.** ESLint is pinned to `^9` in this repo because `eslint-config-expo` depends on
  `eslint-plugin-react@7`, which crashes on ESLint 10.

### Conventional Commits + work-unit commits

- **What.** `type(scope): summary` and commits sized to one reviewable behaviour.
- **Why.** The commit history is part of the portfolio: a reviewer should be able to read it as a
  plan. No AI attribution lines.

---

## J. Words people misuse in interviews

| Say this | Not this | Because |
| --- | --- | --- |
| offline-first | offline mode | One is an architecture, the other is a toggle. |
| mutation queue / outbox | sync queue | The queue holds *intent*, not data. |
| idempotent | retryable | Idempotent means re-sending is safe; retryable means worth re-sending. |
| conflict policy | merge conflict | A policy is chosen in advance; a conflict is the event. |
| watermark / cursor | timestamp | Clocks lie; sequences do not. |
| quarantined | failed | Failed is a state; quarantined is a decision. |
