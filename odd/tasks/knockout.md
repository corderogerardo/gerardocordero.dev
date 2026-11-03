# Knockout — offline-first field-sales product (job-target practice build)

Objective: build one complete, real-world-usable product — **Knockout**, a gamified offline-first field-sales app for door-to-door home-improvement canvassers — as an Expo + TypeScript mobile client, a Supabase backend (Postgres, RLS, Realtime, Edge Functions), and a framework-free `sync-core` package, so that every requirement in the target job description is demonstrated by working code, tests, and documentation a junior can follow.

Branch: `feature/knockout-field-sales` (new worktree `~/noofficelocation/gerardocordero.dev-worktrees/knockout`, based on `main`).
Delivery: `feature-branch-chain`. Forecast ~9,500–11,000 authored changed lines (additions + deletions, generated files excluded); slices A–F recorded under `## Tasks`. Work-unit commits are the review slices; push, PR, and merge stay the user's decision.
Verification: repo loop from the worktree (`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm architecture:check`), `pnpm --filter @gerardocordero/sync-core test` (Vitest), `pnpm --filter @gerardocordero/knockout-mobile test` (jest-expo + RNTL), `supabase test db` (pgTAP RLS), `supabase db reset` (migrations + seed), and Maestro flows in `apps/knockout-mobile/.maestro/`.

## Specs

### S1 — Isolated worktree, additive only
- User request: “en un worktree nuevo quiero que pensemos en una idea de una app con backend”
- Scope: New branch + worktree off `main`. New directories: `apps/knockout-mobile/`, `supabase/`, `packages/sync-core/`. Root wiring limited to `pnpm-workspace`-visible packages, the `test` filter, `.gitignore`, `docs/adr/`, `odd/tasks/README.md`, and the workspaces table in `AGENTS.md`. No existing app source is modified.
- Acceptance: `git diff --name-only main...HEAD` lists only additive paths; the portfolio and prep apps are untouched.
- Checks: `git status --short`; `pnpm architecture:check`.

### S2 — Product, not a demo
- User request: “tiene que ser algo útil, con potencial para ser usado en la vida real” / “también puede ser un juego”
- Scope: Knockout is a field-sales operating app for canvassers who knock doors for roofing/windows/remodeling contractors: shift start, territory map with geofence, one-tap knock outcomes, lead capture with photo + QR, appointments, do-not-contact, and a team leaderboard. The game layer (XP, streak, badges, realtime leaderboard) is the retention mechanic real canvassing teams use — it is the fun part, not a separate toy. Domain vocabulary and the demo script live in `apps/knockout-mobile/docs/PRODUCT.md`.
- Acceptance: A person can run one full shift offline on a device and see their score on the board once connectivity returns. Every screen maps to a named actor goal in PRODUCT.md.
- Checks: Maestro flows; the manual demo script in PRODUCT.md.

### S3 — Stack mirrors the target job description
- User request: “un producto completo que satisfaga estos requisitos y me ayude a generar experiencia para conseguir el empleo”
- Scope: React Native + the monorepo's Expo SDK major + TypeScript strict + expo-router; TanStack Query for server state; Zustand for local UI/session state; Zod at every boundary; expo-sqlite as the on-device database; react-native-mmkv for fast key-value; Supabase (Postgres, RLS, Realtime, Edge Functions on Deno, Storage); HubSpot CRM API v3 integration; expo-location, expo-camera, expo-notifications, expo-network, expo-task-manager, expo-background-task; Sentry; EAS Build/Submit/Update profiles. Styling uses a typed token module + `StyleSheet` (NativeWind is already demonstrated in `apps/portfolio`; this app spends its novelty budget on the sync engine).
- Acceptance: Each technology in the scope is installed, used by production code, and named in `GLOSSARY.md` with what/why/how/alternative.
- Checks: `pnpm --filter @gerardocordero/knockout-mobile typecheck`; a dependency audit against GLOSSARY.md.

### S4 — Offline-first engine as the centrepiece
- User request: “offline-first caching and data synchronization engines for field use in low-connectivity areas” (job text) / “todo, que sea facil de entender por un junior”
- Scope: `packages/sync-core` is framework-free TypeScript with injected ports (clock, network, storage, logger). Local write and outbox append happen in one transaction; push is ordered per entity with idempotency keys; pull is cursor-based; failures retry with exponential backoff plus jitter and a capped attempt count; terminal failures quarantine into a dead-letter list; conflicts resolve through named per-field policies (`server-wins`, `client-wins`, `field-merge`, `manual`) and are logged. Nothing in the package imports React or React Native.
- Acceptance: The engine is deterministic under a fake clock and a scripted network. Every policy, the backoff curve, dedupe, ordering, crash-resume, and quarantine have direct unit tests.
- Checks: `pnpm --filter @gerardocordero/sync-core test`.

### S5 — Sync is visible, not magic
- User request: “que sea facil de entender por un junior”
- Scope: A Sync screen shows connectivity, queue depth, per-mutation attempts and last error, conflicts needing a decision, force-sync, and a dev-only offline simulator switch (used by Maestro). The app header carries a four-state sync pill (offline / queued / syncing / synced).
- Acceptance: Turning the simulator on queues knocks that survive an app restart and drain in order when it is turned off.
- Checks: Maestro `offline-knock.yml`; `__tests__/` state tests for the pill.

### S6 — Field features that match the domain
- User request: “app con backend … producto completo”
- Scope: Email/password auth with session restore; shift start/end; territory polygon with property pins coloured by outcome; geofence arrival detection with background location (opt-in); one-tap knock outcomes (no answer, not interested, conversation, do-not-contact, set); lead capture with contact fields, one photo, QR-scanned door-hanger code, and appointment date; lead list with stage/unsynced filters; lead detail timeline; DNC list that blocks future knocks on that property.
- Acceptance: Each feature works with the network off and reconciles when it returns.
- Checks: App unit tests per feature; Maestro flow per critical path.

### S7 — Server-authoritative game layer
- User request: “también puede ser un juego”
- Scope: XP per outcome, daily streak with a capped multiplier, six badges, daily and weekly team leaderboards delivered over Supabase Realtime. XP and ranks are computed **server-side** from raw knock rows by SQL; the client never uploads a score. Ties break by sets, then conversations, then knocks.
- Acceptance: Editing local score state cannot change a rank; a client-claimed XP field is ignored by the server.
- Checks: pgTAP tests for the scoring function; Vitest for the pure display formatter.

### S8 — HubSpot CRM integration with honest adapters
- User request: “integrated with HubSpot CRM” (job text)
- Scope: `hubspot-sync` Edge Function drains a CRM outbox, upserts contacts and deals through the HubSpot CRM v3 API with idempotent search-then-upsert, records `hubspot_links`, honours 429 `Retry-After`, and retries with backoff. A `FakeHubSpot` adapter backs local development and tests; the real adapter is selected by env. Endpoints, required scopes, and the private-app token are documented; no token is committed.
- Acceptance: A lead created offline becomes one contact and one deal, exactly once, across retries and re-runs.
- Checks: Edge-function tests with the fake adapter; a documented manual run against a sandbox portal.

### S9 — Multi-tenant security
- User request: “Production experience with Supabase … Row-Level Security (RLS) policies” (job text)
- Scope: Every table is protected by RLS scoped to `org_id` and team membership; reps read their own knocks and their team's leaderboard, managers read their org; only the server role writes scores and CRM links. Service-role keys never ship in the app bundle; only the anon key plus the user's JWT do.
- Acceptance: A member of org A cannot read or write org B rows through PostgREST, and cannot escalate by spoofing `org_id`.
- Checks: `supabase test db` (pgTAP) with an isolation matrix per table.

### S10 — Release and observability
- User request: “Manages the complete app release lifecycle … crash monitoring, performance tracing” (job text)
- Scope: `app.config.ts` with runtime version policy, `eas.json` with development/preview/production channels and an `e2e-test` profile, documented OTA rollout and rollback, Sentry wrapper that no-ops without a DSN, structured sync telemetry, and native permission configuration through config plugins with a prebuild verification step.
- Acceptance: `eas.json` validates by inspection against EAS schema fields; prebuild produces the expected `Info.plist` background modes and Android permissions; the Sentry no-op path runs in tests.
- Checks: `npx expo config --type public`; `npx expo prebuild --no-install` into a scratch copy; documented release runbook.

### S11 — Tests at every layer
- User request: “Testing & Quality Assurance … unit, component, and end-to-end tests” (job text)
- Scope: Vitest for `sync-core` (deterministic, fake clock); jest-expo + React Native Testing Library for screens, hooks, and the sync provider; Maestro for smoke, offline knock, and leaderboard flows; pgTAP for RLS and scoring. Detox is deliberately not used — documented with its trade-off and the migration path.
- Acceptance: Every layer runs from one documented command; a broken invariant fails the suite that owns it.
- Checks: the commands in the header.

### S12 — Junior-readable documentation set
- User request: “creando un plan, todo, que sea facil de entender por un junior, con glosario tecnico de tech usadas, razonamiento del por que usar esa tecnologia, como funciona”
- Scope: `PRODUCT.md` (what and for whom), `ARCHITECTURE.md` (modules, seams, diagrams, sync state machine, conflict matrix), `GLOSSARY.md` (every technology: what/why/how here/alternative), `PLAN.md` (task-by-task walkthrough: goal, files, order, how to verify, what you learn), `LEARNING-PATH.md` (a curriculum with checkpoints), `AI-WORKFLOW.md` (how the agent harness was used and how output was verified), plus ADRs `0004`–`0008` in `docs/adr/`. All in English, plain language, no unexplained jargon.
- Acceptance: A junior with TypeScript basics can follow PLAN.md top to bottom and knows how to prove each step works. GLOSSARY.md has no entry without an alternative considered.
- Checks: read-back pass; every file path named in PLAN.md exists.

### S13 — The repo loop stays green
- User request: (repo contract) “Run them after any code change and before saying a task is done.”
- Scope: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm architecture:check` pass from the worktree. The new app gets a row in the `AGENTS.md` workspaces table and its gates are named there.
- Acceptance: All four commands exit 0; `pnpm test` covers `sync-core` as well as portfolio and prep-kit.
- Checks: the four commands.

### S14 — Delivery discipline
- User request: (repo contract) work-unit commits.
- Scope: Commits of ~400 authored lines, each a reviewable behaviour with its tests and docs, Conventional Commit messages, no AI attribution. Slices: A foundation (T0–T4), B backend (T5–T7), C app data/runtime (T8–T9), D screens (T10–T13), E quality (T14–T17), F docs (T18–T19).
- Acceptance: `git log --oneline main..HEAD` shows one commit per unit; each body names its `S#`.
- Checks: `git log --stat main..HEAD`.

## Tasks

| ID | Task | Specs | Route | Est. lines | Status | Commit |
|---|---|---|---|---|---|---|
| T0 | Worktree, branch, app scaffold, workspace wiring, loop gates | S1, S13 | inline | 260 | complete | see `## Log` L5 |
| T1 | Design tokens + UI primitives (text, button, card, pill, sheet, empty) | S3 | inline | 320 | pending | — |
| T2 | Postgres schema migrations + seed (2 orgs, 8 reps, properties, knocks, leads) | S6, S9 | inline | 700 | complete | `## Log` L6 |
| T3 | RLS policies + pgTAP isolation matrix | S9 | inline (delegation denied, see L6) | 450 | complete | `## Log` L6 |
| T4 | `sync-core`: contract, outbox, backoff, engine, conflict policies + Vitest | S4 | inline (delegation denied, see L6) | 1,300 | complete | `## Log` L7 |
| T5 | Supabase client, typed DB types, auth store, persistence adapter | S3, S6 | inline | 380 | complete | `## Log` L9 |
| T6 | `sync-push` Edge Function (idempotent batch apply, merge, cursor) | S4, S9 | inline | 420 | pending | — |
| T7 | HubSpot adapter + `hubspot-sync` function + fake adapter + tests | S8 | inline | 460 | pending | — |
| T8 | App SQLite schema, DAOs, TanStack Query hooks, Zustand stores | S4, S6 | inline | 620 | in progress — schema, migrations, outbox adapter and the atomic knock write done; query hooks pending | `## Log` L10 |
| T9 | Sync runtime adapters: network, background task, provider, status pill | S4, S5 | inline | 360 | pending | — |
| T10 | Auth screen + Shift screen (start/end, streak, XP, quick knock) | S6, S7 | inline | 360 | pending | — |
| T11 | Map screen: territory polygon, pins, geofence, knock sheet | S6 | inline | 520 | pending | — |
| T12 | Leads list, detail timeline, capture with photo + QR | S6 | inline | 560 | pending | — |
| T13 | Board screen (leaderboard, badges) + Settings/Sync diagnostics | S5, S7 | inline | 520 | pending | — |
| T14 | Server scoring SQL + realtime publication + client display formatter | S7 | inline | 350 | pending | — |
| T15 | Observability (Sentry wrapper, sync telemetry) + config plugins/permissions | S10 | inline | 260 | partial — native config plugin + `verify:native` done; Sentry wrapper pending (see L8) | `## Log` L8 |
| T16 | App unit/component tests (jest-expo + RNTL) | S11 | delegated (parallel with T17) | 700 | pending | — |
| T17 | Maestro flows: smoke, offline knock, leaderboard | S11 | delegated (parallel with T16) | 200 | pending | — |
| T18 | Docs set + ADRs 0004–0008 + AI workflow | S12 | inline | 2,000 (docs) | pending | — |
| T19 | Final verification + read-back + AGENTS.md/README index updates | S13, S14 | inline | 160 | pending | — |
| P0 | Phase 0: native toolchain verification (export, prebuild, build, boot) | S10, S13 | inline | 380 | complete on iOS compile; boot blocked by OS — see L8 | `## Log` L8 |

Route note: T3 and T4 are disjoint edit surfaces (`supabase/` vs `packages/sync-core/`) and both exceed ~450 lines of independent behaviour, so they run as parallel delegated units. T16 and T17 are disjoint (`__tests__/` vs `.maestro/`) and follow the same rule. Everything else is one coherent unit and runs inline.

## Log

### L1 — user request (verbatim, 2026-11-03)

```
en un worktree nuevo quiero que pensemos en una idea de una app con backend, en un producto completo que satisfaga estos requisitos y me ayude a generar experiencia para conseguir el empleo: Job Title: React Native Mobile Developer - (100% Work From Home) 
Location: Remote from Latin America
Position Type: Full-time
Salary: $5,000 USD/month (Paid semi-monthly as an independent contractor)
Schedule: Monday – Friday, 40 hours/week, requiring a minimum of 6 hours daily overlap with US Pacific Time / PT business hours, working until at least 2:00 PM PT
Position Overview
Our Client is a rapidly growing, award-winning national brand in the residential and commercial renovation contracting industry, generating over $270M in annual revenue. Operating across the United States, our client builds and deploys proprietary mobile technology to empower field marketing and sales teams. Built on a fast-paced, AI-first engineering culture that values high autonomy, rapid iteration, and technical ownership, our client provides a dynamic remote environment where mobile engineering directly streamlines field lead management, production tracking, and enterprise CRM sync.
About the Role
Our Client is seeking a high-autonomy Remote Senior Mobile App Developer with extensive React Native and Expo expertise to build, maintain, and architect cross-platform mobile applications for field personnel. Joining a growing mobile engineering team, this developer will own end-to-end feature delivery, shape mobile architecture for upcoming greenfield projects, and design robust offline-first caching and data synchronization engines for field use in low-connectivity areas. Powered by a Supabase backend and integrated with HubSpot CRM, the position leverages agentic AI development tools to accelerate shipping velocity.
Key Responsibilities
Mobile App Architecture & Offline-First Development
Designs, develops, and maintains cross-platform iOS and Android applications using React Native, TypeScript, and Expo.
Architect and implements offline-first data persistence, local storage caching (SQLite, MMKV, WatermelonDB), background synchronization, conflict resolution, and retry/backoff strategies for low-connectivity environments.
Leads architectural decisions on upcoming greenfield mobile initiatives while refining design patterns in existing codebases.
Leverages agentic (AI-first) development workflows to accelerate feature delivery while rigorously verifying AI model outputs.
API Integration, Backend & Release Management
Integrates mobile applications with Supabase (Postgres, Row-Level Security, Realtime subscriptions), custom production management systems, and third-party APIs such as HubSpot CRM.
Partners with backend engineers and product leads to define efficient schema models and type-safe API contracts.
Manages the complete app release lifecycle: provisioning profiles, certificates, build channel strategies (alpha/beta/prod), TestFlight, and Google Play Console release tracks.
Configures crash monitoring, performance tracing (Sentry, Firebase Crashlytics), and release-health telemetry.
Works below the React Native abstraction layer when necessary, reading native crash logs in Xcode and Android Studio, and patching or writing native modules.
Qualifications, Skills, and Key Competencies
Required Qualifications
Mobile Engineering Experience: 7+ years of professional mobile development experience, with 4+ years specifically focused on React Native in production environments.
TypeScript & Modern JS Mastery: Exceptional proficiency in TypeScript, React hooks, modern ES6+ JavaScript, and state/data-fetching libraries (TanStack Query strongly preferred).
Expo & EAS Expertise: Hands-on experience using Expo across build, deployment, device management, and release channels.
Offline-First Architectural Mastery: Proven track record designing and shipping offline-first architectures, local database engines, background syncing routines, and data conflict resolution.
Supabase & Postgres Ecosystem: Production experience with Supabase or Postgres-backed platforms, including Row-Level Security (RLS) policies and Realtime subscriptions.
Native & Deployment Proficiency: Comfortable navigating Xcode, Android Studio, native crash logs, and managing App Store / Google Play submissions (including handling app review rejections).
AI-First / Agentic Development Habits: Demonstrated experience utilizing AI coding tools effectively with a disciplined approach to validating generated code before deployment.
Testing & Quality Assurance: Experience writing unit, component, and end-to-end tests (Vitest, React Testing Library, Detox) and utilizing mobile debugging tooling.
Fluent English Communication: Excellent written and spoken English skills to participate actively in technical architecture reviews and product discussions.
Schedule Alignment: Full availability for a 40-hour work week overlapping with US business schedules (Eastern Time / ET and Pacific Time / PT).
Remote Workspace Infrastructure: High-performance macOS development computer (capable of running iOS simulators and Android emulators concurrently), HD webcam, noise-canceling headset, and enterprise-grade high-speed internet connection.
Preferred Qualifications
Experience with Expo Application Services (EAS), Expo Router, expo-updates (OTA rollouts), and React Native New Architecture (Fabric, TurboModules).
Familiarity with lightweight state management (Zustand), tRPC, Drizzle ORM, Zod, and NativeWind/Tailwind CSS.
Experience with location-based features: react-native-maps, background location tracking, geofencing, push notifications, and QR code scanning. creando un plan, todo, que sea facil de entender por un junior, con glosario tecnico de tech usadas, razonamiento del por que usar esa tecnologia, como funciona, tambien puede ser un juego, pero tiene que ser algo util, con potencial para ser usado en la vida real quiero que conviertas esto en un /goal o en su similar de gentle-ai para que lo iteres hasta tenerlo completado
```

### L2 — 2026-11-03 — goal mechanism and worktree

- Gentle AI ships no `/goal` command (`gentle-ai --help` lists only install/sync/codegraph/skill-registry/review/update/telemetry). The ODD feature document **is** the goal primitive: `## Specs` are the acceptance criteria, `## Tasks` is the checklist, `## Log` is the iteration record, and work stops only when every task's outcome and checks were observed. That is what this file is.
- Worktree created per repo convention: `<repo-parent>/<repo-name>-worktrees/knockout` → `/Users/gerardocordero/noofficelocation/gerardocordero.dev-worktrees/knockout`, branch `feature/knockout-field-sales` off `main` (`4638fa8`). Session moved into it.
- Local Supabase ports shifted from the CLI defaults (54321–54327) to 54341–54347 because a second Supabase stack (`Torres_del_sisal`) already owns the defaults on this machine. Recorded in `supabase/config.toml`.

### L3 — 2026-11-03 — product and stack decisions (rationale)

- **Idea chosen: Knockout.** The job is field sales for a renovation contractor; the highest-signal portfolio artifact is the product that job's team would actually use. Door-to-door canvassing has a real, unglamorous problem (no signal, records lost, no visibility) that exercises every required skill at once, and it has a natural game layer (XP, streaks, leaderboards) that canvassing companies genuinely use for retention. A generic to-do or fitness app would demonstrate the same stack with none of the domain credibility.
- **A second standalone API was rejected.** The job names Supabase explicitly; a bespoke Node/Rust API would demonstrate backend skill while proving the wrong thing. Postgres schema, RLS, Realtime, Edge Functions and Storage cover the backend surface the role needs.
- **WatermelonDB rejected for this build** (despite being named in the job): its sync layer hides the exact mechanics this project exists to demonstrate, and its New Architecture support adds risk. SQLite + an explicit outbox makes the conflict-resolution decisions visible, testable, and explainable — which is the interview asset.
- **NativeWind rejected for this app**: `apps/portfolio` already demonstrates it. A typed token module + `StyleSheet` keeps this app's dependency surface small so the novelty budget goes to the sync engine.
- **Vitest kept for `sync-core` only** (job names it), jest-expo + RNTL for the app (repo-proven with RN 0.85+ and RNTL v14 async API). Detox rejected in favour of Maestro (already proven in this repo, no native test harness, cross-platform) — documented in `ARCHITECTURE.md` with the migration path.
- **Scoring is server-authoritative.** A leaderboard fed by client-claimed XP is trivially cheatable; recomputing from raw knock rows in SQL also demonstrates RLS-adjacent thinking. This is a deliberate, documented deviation from the naive design.

### L4 — 2026-11-03 — Expo SDK: same major as the repo, not the newest (observed constraint)

Scope line S3 originally said "Expo SDK 58". It was changed after the scaffold proved the constraint, not before:

- First scaffold attempt used `expo ~58.0.22` / `react-native 0.88.1`. `pnpm install` succeeded, but `apps/portfolio`'s Jest suite — green on `main` (verified in the sibling worktree: 4 suites, 18 tests, 0 failures) — turned red inside this worktree: `SyntaxError` from `babel-plugin-syntax-hermes-parser` on React Native's Flow-typed `src/private/specs_DEPRECATED/*.js`.
- Cause, measured by comparing hoisted versions against the `main` worktree: with `node-linker=hoisted`, adding a second Expo major flipped the **root** copies of `react-native` (0.85.3 → 0.88.1), `expo` (56.0.12 → 58.0.22), `babel-preset-expo` (56.0.15 → 58.0.23), `jest-expo` (56.0.5 → 58.0.13) and `hermes-parser`/`babel-plugin-syntax-hermes-parser` (0.33.3 → 0.36.0) — which the older app's toolchain then resolves.
- Decision: **pin the app to the Expo major the repo already uses** (`expo ~56.0.12`, RN 0.85.3, React 19.2.3, `jest-expo ~56.0.5`, `babel-preset-expo ~56.0.15`). One Expo toolchain in a flat tree; no dependency surgery on a shared lockfile; the loop is green again. Moving the whole repo to a newer SDK is a separate tracked task (`odd/tasks/expo-sdk-upgrade.md`), not a side effect of adding an app.
- Second observation: with two RN consumers, pnpm's peer resolution created a second `jest-expo` instance with a nested `expo` (`node_modules/jest-expo/node_modules/expo/...`), which the shared `transformIgnorePatterns` skipped. Fixed by adding `jest-expo` to that allowlist in **both** app configs (one-line config change, no source change) — recorded because it touches `apps/portfolio/jest.config.js`.

### L5 — 2026-11-03 — T0 evidence (scaffold + loop)

Commands and results, force-run (`--force`, no Turbo cache), from the worktree root:

- `pnpm typecheck --force` → `Tasks: 10 successful, 10 total`.
- `pnpm lint --force` → `Tasks: 10 successful, 10 total` (13 pre-existing warnings, all in `apps/learn`, 0 errors).
- `pnpm test --force` → `Tasks: 4 successful, 4 total` (portfolio 37 tests, knockout 1, prep-kit, sync-core).
- `pnpm architecture:check` → `Workspace packages: 15`, `Violations: 0`. `scripts/architecture-fitness.test.mjs` expected the old inventory (13 packages / 9 edges) and was updated to 15 / 10 — the two new workspace members are the packages this feature adds.
- `cd apps/knockout-mobile && npx expo config --type public` → resolves, `sdkVersion: '56.0.0'`, permission strings and `runtimeVersion { policy: appVersion }` present.
- `supabase start` → API on `127.0.0.1:54341` (defaults 54321–54327 are owned by another local stack), DB on 54342, Studio on 54343.
- `npx jest` in `apps/portfolio` → 5 suites / 37 tests pass (was failing before the SDK pin).

Scaffold contents: `apps/knockout-mobile` (expo-router root layout + 5 tab routes with `screen-*`/`tab-*` selectors, tokens, `Screen`), `packages/sync-core` (package + tsconfig + vitest + an eslint rule that forbids React/Expo/Supabase imports), root `test` filter extended, `AGENTS.md` rows for both new packages.

Errors hit and fixed, in order (kept because they are the kind a junior will hit):
1. `newArchEnabled` no longer exists in the Expo config type → removed with a comment.
2. Flow parse error from the second Expo major → SDK pinned (L4).
3. `Cannot use import statement outside a module` from a nested `jest-expo/node_modules/expo` → allowlist fix (L4).
4. `Cannot find module '2g'` from a corrupted hoisted `@expo/cli` → `rm -rf node_modules && pnpm install` (23.8 s); `npx expo config` then worked for both apps.

Commit hashes for every task are filled in one pass at T19, from `git log`, so the record is exact instead of guessed.

### L6 — 2026-11-03 — T2 + T3 evidence (schema, seed, RLS, pgTAP)

**Delegation was denied.** `subagent` returned `permission.rejected: Permission denied: subagent`, so T3 and T4 run inline instead of as parallel units. Route recorded here rather than silently changing the plan.

Delivered (8 migrations + seed + 2 pgTAP files):

- `0001_init.sql` — `app` schema for non-exposed helpers, enums, one global `server_seq` sequence, and the `app.touch()` trigger that stamps `server_seq`/`updated_at` and bumps `version` on every synced table in one place.
- `0002_tenancy.sql` … `0007_scores.sql` — orgs/teams/members, properties/territories (boundary as JSON, with the PostGIS trade-off written next to it), shifts/knocks/DNC (with `app.propagate_dnc()` and a partial unique index for one open shift per rep), leads + `crm_outbox` + `hubspot_links` + `app.queue_lead_for_crm()`, the idempotency ledger `sync_mutations`, `sync_conflicts`, badges and `daily_scores` with `app.xp_for_day()`.
- `0008_rls.sql` — helper functions (`current_org_id`, `current_role`, `is_manager`, `is_member_of`) as `security definer` with a pinned `search_path`, a read and a write policy per table, and an explicit grant surface.
- `supabase/seed.sql` — 2 orgs, 4 teams, 10 people (2 managers), 240 properties, 4800 knocks over 10 days, 360 leads, 80 score rows, plus real `auth.users` + `auth.identities` rows so password sign-in works.
- `supabase/tests/01_rls.sql` (22 assertions) and `02_scoring.sql` (6) — the isolation matrix and a hand-computed XP fixture.

Observed evidence:

```
supabase db reset  → all 8 migrations applied, seed applied, 4800 knocks / 360 leads / 80 score rows
curl POST /auth/v1/token?grant_type=password (marcus@northwind.test) → access_token returned
supabase test db → All tests successful. Files=2, Tests=28
```

Three defects the tests caught, all fixed in the migration rather than in the test:

1. `permission denied for schema app` — `execute` on the helper functions is useless without `grant usage on schema app`. Real finding: policies looked right and every query failed.
2. `update daily_scores set xp = …` **succeeded**. Supabase's default grants on `public` are permissive; my explicit `grant select` never revoked the default `update`. Fixed with `revoke all on all tables in schema public from anon, authenticated` before granting the intended surface. Without this, "the client cannot write a score" was a claim, not a fact.
3. The same default grant let `anon` read `knocks` — the anon key ships in the bundle, so this is the one that matters most.

Work unit note: migrations + seed + policies + their tests ship as one commit (~1,200 authored lines, above the ~400 heuristic). A policy without its table is not reviewable in isolation, and the seed is the fixture the policy tests read. Split anyway would create commits that cannot be verified alone.

### L7 — 2026-11-03 — T4 evidence (sync-core) and T5 partial (Supabase client)

**T4 — `packages/sync-core`.** Five source modules, five test files, 43 tests.

- `contract.ts` — Zod schemas for the mutation envelope and the push response; types are inferred from the schemas, never declared twice.
- `backoff.ts` — `nextDelay(attempt, random)` and `shouldQuarantine(attempt)`. Pure, so the curve is asserted exactly instead of slept on.
- `policies.ts` — the field-group → policy table from ADR-0007, plus `resolveConflict` with a real per-field last-write-wins merge (one-sided change, both-changed, tie to server, restricted field list).
- `outbox.ts` — the `OutboxStore` port and an in-memory adapter used by tests and by the app's offline simulator.
- `engine.ts` — `runDrain(ctx)`: reclaim stale `inflight`, one ordered batch, idempotent replay handling, terminal stop, quarantine at the attempt ceiling, transport errors treated as retryable.

Evidence:

```
pnpm --filter @gerardocordero/sync-core test    → Test Files 5 passed, Tests 43 passed
pnpm --filter @gerardocordero/sync-core typecheck → clean
pnpm --filter @gerardocordero/sync-core lint      → clean
```

**The tests can fail.** Sabotage check, run deliberately: deleting `stopped = true` from the `rejected` branch produced exactly one failure (`stops the batch on the first terminal rejection`) and 42 passes; restoring the line returned 43/43. A suite that stays green under a broken engine is decoration.

Two test bugs were mine, not the engine's: a deferral timestamp in 1970 (already due) and an expected value that ignored the doubling (`attempt 1` starts at twice the base). Both were fixed in the test, because the engine was right.

**T5 (partial) — Supabase client.**

- `supabase gen types typescript --local > packages/sync-core/src/database.types.ts` — 1,069 generated lines, committed. This is the type-safe contract the job asks for: a column rename becomes a compile error.
- `src/api/config.ts` — platform-aware local URL (`10.0.2.2` on the Android emulator, `127.0.0.1` elsewhere) with the shifted ports, and an explicit env override.
- `src/api/storage.ts` — session persistence in two layers: an AES-256 key in Keychain/Keystore, the session in encrypted MMKV. The naive version (session straight into `expo-secure-store`) breaks on Android at 2,048 bytes per value, which is a field failure, not a theoretical one. A shared in-flight promise prevents two MMKV instances over the same file on first launch.
- `src/api/client.ts` — one typed client, `detectSessionInUrl: false`, refresh on.
- `__tests__/api-config.test.ts` (3) and `__tests__/session-storage.test.ts` (4) — the port, the `anon`-role claim in the key, the env override, round-trip, missing key, removal, concurrent first read.

Still open in T5: the auth store (`src/data/stores/session.ts`) and `refreshSession` that stays quiet offline. Tracked, not claimed.

Repo loop after this unit: `pnpm typecheck --force` 10/10, `pnpm lint --force` 10/10, `pnpm test --force` 4/4.

### L8 — 2026-11-03 — Phase 0: native toolchain verification

Goal of the phase: prove the app compiles and runs natively **before** writing screens. It found three real defects and one environment wall. All evidence below was observed, not inferred.

**1. Bundle.** `npx expo export --platform ios` → `iOS Bundled 18331ms node_modules/expo-router/entry.js (1520 modules)`, Hermes bytecode 3.6 MB. No Metro, import, or resolution errors. Re-run after every dependency change.

**2. Prebuild.** `npx expo prebuild --platform ios --no-install` and `--platform android --no-install` both succeed. `ios/Knockout/Info.plist` contains `UIBackgroundModes = [location, fetch, processing]` and the four usage strings; `AndroidManifest.xml` contains the seven declared permissions.

**3. A verifier, not a claim.** `scripts/verify-native-config.mjs` (new, `pnpm --filter @gerardocordero/knockout-mobile verify:native`) compares `app.config.ts` against the generated manifests. Its first run found a real defect: `expo-camera` adds `android.permission.RECORD_AUDIO` through its own library manifest, and this app only takes photos and scans QR codes. Fixed with `android.blockedPermissions`; the verifier now requires the permission to be **explicitly blocked**, not merely absent. It also asserts the Podfile override from (4) is present, because a prebuild after deleting the plugin reintroduces a build failure that looks unrelated.

**4. Xcode 27 vs old podspecs.** First build: `❌ The iOS Simulator deployment target 'IPHONEOS_DEPLOYMENT_TARGET' is set to 12.0, but the range of supported deployment target versions is 15.0 to 27.2.x (in target 'ReachabilitySwift')` and the same for `Sentry-Sentry` at 11.0. `ReachabilitySwift` comes from `expo-updates`. Fixed with `plugins/withIosDeploymentTarget.js`, a config plugin that injects a `post_install` override aligning every pod target with the app's deployment target (16.4). A plugin, not a hand-edited Podfile, because `ios/` is generated and gitignored.

**5. `@sentry/react-native` removed, deliberately.** `expo-doctor` flagged a major mismatch (8.33.0 installed, `~7.11.0` expected by SDK 56). Downgrading to 7.11.0 then failed the build on the same deployment-target rule (its pods declare iOS 11.0). Nothing imports Sentry yet, so it was removed rather than patched around; T15 re-adds it now that the plugin in (4) handles old podspecs. The alternative — keeping a monitoring SDK that no code calls and that blocks the build — is not a trade-off, it is a preference for a checklist.

**6. Swift 6.2 vs `expo-modules-jsi`.** After (4), the build got further and failed in Expo's own code: `❌ a C function pointer can only be formed from a reference to a 'func' or a literal closure` at `expo-modules-jsi/apple/Sources/ExpoModulesJSI/Runtime/JavaScriptRuntime.swift:219`. Installed 56.0.10. I downloaded 56.0.14 with `npm pack` and diffed the file without installing anything: it introduces `let setterPointer: (@convention(c) ...) = setter`, which is exactly what Swift 6.2 requires. `expo@56.0.24` → `expo-modules-core@56.0.27` → `expo-modules-jsi@~56.0.14`, so bumping one dep (as `expo-doctor` had already advised) fixes it. Applied: `expo 56.0.12 → 56.0.24`.

**7. Build succeeds.** `npx expo run:ios --no-bundler --no-install` → exit 0, `› Installing .../Knockout.app`, `› Installing on iPhone 18 Pro Max`, `› Opening on iPhone 18 Pro Max (dev.gerardocordero.knockout)`. Across the session the build compiled 1,500+ modules including `ReactCodegen`, `RNWorklets`, `NitroMmkv`, `NitroModules`, `ExpoSQLite`, `ExpoCamera`, `ExpoLocation`.

**8. Boot blocked by the OS — the wall.** The app installs and exits immediately. Crash report `Knockout-2026-11-03-133936.ips`:

```
exception: EXC_BREAKPOINT (SIGTRAP)
triggered thread frame 0:
  UIKitCore ___UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption_block_invoke
  UIKitCore -[UIApplication workspace:didCreateScene:withTransitionContext:completion:]
```

UIKit on iOS 27 refuses an app that has not adopted `UIScene` lifecycle. `Info.plist` has no `UIApplicationSceneManifest`, `AppDelegate.swift` builds a manual `UIWindow`, and `react-native@0.85.3` has no `application:configurationForConnectingSceneSession:` anywhere in its sources — so this cannot be fixed by adding a plist key; a manifest without a scene delegate gives a black screen. `xcrun simctl list runtimes` shows only `iOS 27.0` and `iOS 27.1` installed on this machine, and the sibling `apps/trading-mobile` (Expo `~58.0.22`) does run here, which corroborates that the missing piece is SDK support, not this app.

**Consequences, written down instead of discovered later:**
- Screen work (T10–T13) cannot be visually verified on this machine until one of: an iOS ≤ 26 simulator runtime is installed (`xcodebuild -downloadPlatform iOS`), or the repo moves to an SDK with UIScene support (`odd/tasks/expo-sdk-upgrade.md`).
- The JS-only work is unaffected: SQLite DAOs, the sync runtime, auth, and every unit test run under Jest with no device.
- Android was attempted as the alternative: the `Medium_Phone` AVD attaches to `adb` but never reaches `sys.boot_completed` headless with SwiftShader within ten minutes, so it was abandoned rather than left running. Recorded as not verified.

**Accepted drift.** `expo-doctor` still reports five patch-level mismatches (`expo-linking`, `expo-router`, `expo-splash-screen`, `expo-updates`, `jest-expo`). They are not fixed here because those versions are hoisted and shared with `apps/portfolio`, whose Jest suite is green and whose SDK upgrade is its own tracked task. Raising them from a side project is how a portfolio app breaks the app next door.

**Loop after the phase:** `pnpm typecheck --force` 10/10, `pnpm test --force` 4/4 (portfolio 37 tests, knockout 8, prep-kit, sync-core 43).

### L9 — 2026-11-03 — Phase 1: session store, sign-in, and the auth gate (T5 complete)

Branch: `feature/knockout-auth-data`, cut from `origin/main` after PR #135 merged (`3350a2a`).

**What was built**

- `src/data/session-store.ts` — the session state machine as a **factory** (`createSessionStore(deps)`), not a singleton. Deps: an auth port (`getSession`, `signInWithPassword`, `signOut`), a profile fetcher, and a cache. The store knows nothing about Supabase, which is why its thirteen tests need no SDK mock.
- `src/data/session.ts` — the one place that wires Supabase and MMKV to those ports (profile row → `MemberProfile`, `error.status === 400` → invalid credentials, thrown request → network).
- `src/data/storage.ts` — a plain MMKV instance for non-secret app state. Session tokens stay in `src/api/storage.ts` (Keychain-held key, encrypted MMKV).
- `src/features/auth/use-protected-route.ts` — one route guard, driven by `useSegments` + `useRouter`, so sign-in and home cannot bounce each other.
- `app/(auth)/sign-in.tsx` and `app/(auth)/_layout.tsx` — email/password form, one error line, busy state, a hint with the seeded demo account only when the app points at the local stack.
- `src/ui/Button.tsx`, `src/ui/Field.tsx` — the first two primitives of T1, extracted because the form needed them.

**Decisions worth keeping**

- *Offline-first sign-in*: on boot the cached profile is applied immediately, then refreshed. No cache and no network → `signed_out` with an explicit sentence, never a guessed org id.
- *Sign-out never depends on the network*: `signOut()` swallows a failed server call because the tokens are discarded locally either way. The first test asserted this and failed against a `try/finally` that re-threw — the implementation was wrong, not the test.
- *The busy guard lives in the handler*, not only in the `onPress` prop. Two tests failed because a disabled `Pressable` still received the press, which is exactly the "one tap becomes two leads" bug the guard exists to prevent.
- *Typed routes are generated*: `.expo/types/router.d.ts` was stale and made `tsc` reject the new `(auth)` group. Regenerated with a short `expo start`; CI is unaffected because the file is gitignored and absent there.

**Evidence**

```
cd apps/knockout-mobile
npx jest                     → 5 suites, 25 tests passed
npx tsc --noEmit             → clean, with regenerated typed routes
npx eslint .                 → 0 errors, 0 warnings
npx expo export --platform ios → Hermes bundle 4.3 MB (was 3.6 MB before the auth route existed,
                                 so the new route, Zustand and the Supabase client are really in the bundle)

from the worktree root
pnpm typecheck --force       → 10/10
pnpm lint --force            → 10/10
pnpm test --force            → 4/4
pnpm architecture:check      → 0 violations
```

**One flake, diagnosed rather than ignored.** The first `pnpm test --force` run failed on `knockout-mobile#test` and the next two passed. Standalone, `sign-in-screen.test.tsx` took 5.42 s — right on Jest's 5 s default — and Turbo runs four suites in parallel. Fixed with `testTimeout: 15_000` in the app's jest config and a comment explaining why, instead of re-running until it went green.

**Still open in T1**: `Card`, `Pill`, `Sheet`, `EmptyState`. They belong with the screens that use them (T10–T13), not before.

### L10 — 2026-11-03 — Phase 2: the offline write path (T8, first half)

Branch: `feature/knockout-offline-write`, cut from `origin/main` after PR #136 merged (`912904f`).

**What was built**

- `src/db/runner.ts` — a four-method `SqliteRunner` seam (`run`, `all`, `first`, `transaction`) with one expo-sqlite adapter. The seam exists so the persistence layer can be **executed** in tests, not asserted against a fake.
- `src/db/migrations.ts` — `PRAGMA user_version` ladder, append-only, with `check` constraints that mirror the Postgres enums. `knocks`, `leads`, `outbox`, `sync_meta`.
- `src/db/outbox-store.ts` — the SQLite implementation of `sync-core`'s `OutboxStore` port. `attempt = attempt + 1` happens in SQL, not read-then-write, so two drains cannot both read 2 and write 3.
- `src/db/knocks.ts` — `recordKnock()`, the write path the product rests on: the knock row and its outbox mutation are inserted in **one transaction**, so the app can never show a knock that will not sync, or sync a knock the rep cannot see.
- `src/db/open.ts` — single open handle, WAL on, migrations applied once.

**Tests run against real SQLite.** `sql.js` (SQLite compiled to WebAssembly) is a devDependency used only by `__tests__/support/sqljs-runner.ts`; Metro never sees it. Fourteen cases:

- migrations create the schema, are idempotent, and the *database* rejects an invalid outcome (not just TypeScript);
- `recordKnock` writes both rows, and a rejected insert leaves **zero** rows behind — the crash window that matters;
- the outbox adapter orders by `created_at`, honours `nextAttemptAt`, increments attempts in SQL, counts the queue, reclaims `inflight` rows after a crash, and quarantines without blocking;
- **the real engine drains the real database**: `runDrain` over the SQLite outbox with a transport that fails once and then succeeds — first pass `retryable` with 2 deferred, second pass `applied: 2`, rows persisted as `applied`.

**Two bugs the loop caught, both real**

1. `typecheck` never looked at test files (`tsconfig.test.json` existed but no script used it). Added `typecheck:test` and made `typecheck` run both configs. It passed — but the gap was open, and a type error in a test is silent under babel-jest.
2. `pnpm test` failed twice while the suite passed standalone: jest-expo's `testMatch` treats every file under `__tests__/` as a suite, so `__tests__/support/sqljs-runner.ts` was reported as "Your test suite must contain at least one test". Fixed with `testPathIgnorePatterns`. This only appears when the loop runs the way CI runs it.

**Evidence**

```
cd apps/knockout-mobile
npx jest                    → 6 suites, 39 tests passed
npx tsc --noEmit && npx tsc -p tsconfig.test.json --noEmit → clean
npx eslint .                → 0 errors

from the worktree root
pnpm typecheck --force      → 10/10
pnpm lint --force           → 10/10
pnpm test --force           → 4/4
pnpm architecture:check     → 0 violations
```

**Still open in T8**: TanStack Query hooks over these DAOs (`useTodayKnocks`, `useLeads`), and the shift store. They land with the screens that consume them.
