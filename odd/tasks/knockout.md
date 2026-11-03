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
| T2 | Postgres schema migrations + seed (2 orgs, 8 reps, properties, knocks, leads) | S6, S9 | inline | 700 | pending | — |
| T3 | RLS policies + pgTAP isolation matrix | S9 | delegated (parallel with T4) | 450 | pending | — |
| T4 | `sync-core`: contract, outbox, backoff, engine, conflict policies + Vitest | S4 | delegated (parallel with T3) | 1,300 | pending | — |
| T5 | Supabase client, typed DB types, auth store, persistence adapter | S3, S6 | inline | 380 | pending | — |
| T6 | `sync-push` Edge Function (idempotent batch apply, merge, cursor) | S4, S9 | inline | 420 | pending | — |
| T7 | HubSpot adapter + `hubspot-sync` function + fake adapter + tests | S8 | inline | 460 | pending | — |
| T8 | App SQLite schema, DAOs, TanStack Query hooks, Zustand stores | S4, S6 | inline | 620 | pending | — |
| T9 | Sync runtime adapters: network, background task, provider, status pill | S4, S5 | inline | 360 | pending | — |
| T10 | Auth screen + Shift screen (start/end, streak, XP, quick knock) | S6, S7 | inline | 360 | pending | — |
| T11 | Map screen: territory polygon, pins, geofence, knock sheet | S6 | inline | 520 | pending | — |
| T12 | Leads list, detail timeline, capture with photo + QR | S6 | inline | 560 | pending | — |
| T13 | Board screen (leaderboard, badges) + Settings/Sync diagnostics | S5, S7 | inline | 520 | pending | — |
| T14 | Server scoring SQL + realtime publication + client display formatter | S7 | inline | 350 | pending | — |
| T15 | Observability (Sentry wrapper, sync telemetry) + config plugins/permissions | S10 | inline | 260 | pending | — |
| T16 | App unit/component tests (jest-expo + RNTL) | S11 | delegated (parallel with T17) | 700 | pending | — |
| T17 | Maestro flows: smoke, offline knock, leaderboard | S11 | delegated (parallel with T16) | 200 | pending | — |
| T18 | Docs set + ADRs 0004–0008 + AI workflow | S12 | inline | 2,000 (docs) | pending | — |
| T19 | Final verification + read-back + AGENTS.md/README index updates | S13, S14 | inline | 160 | pending | — |

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
