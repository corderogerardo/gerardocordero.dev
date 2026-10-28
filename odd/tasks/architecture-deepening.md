# Architecture Deepening — Monorepo + Standalone

Objective: Implement five architecture-deepening candidates across the monorepo and standalone-style packages using the approval-gated, skill-first software factory. Branch: feature/monorepo-deepening (already pushed). Delivery: ask-on-risk (default); forecast ~1,200–1,800 authored lines across units; generated files excluded. Verification: pnpm typecheck, pnpm lint, pnpm test, pnpm architecture:check, backend pytest, unit tests per unit, native review for high-risk units.

## Specs

### S1 — Scene tile catalog (apps/learn)
User request: "hagamos todas las mejoras" applied to the scene tile seam discovered during architecture review.
Scope: Move label/href/Icon/hue into one canonical tile catalog inside the tile module; callers supply locale only.
Acceptance criteria:
- One canonical source of SceneTile records in apps/learn/src/components/SceneTiles.tsx or a dedicated catalog module.
- HomePageClient and locale page callers no longer pair by array index.
- No `Icon: undefined` risk from mismatched indices.
Checks: typecheck, lint, test on apps/learn; visual/manual inspection of tile rendering.

### S2 — Booking transition seam — FastAPI backend (apps/backend)
User request: implement all architecture improvements including booking transitions.
Scope: Add POST/PATCH transition routes for accept/decline/start/complete/cancel on /bookings/{id}/{action}; add created_at to FastAPI Booking schema; add Alembic migration; add owner/walker authorization.
Acceptance criteria:
- Routes exist and return updated Booking with status and created_at.
- Invalid transitions return 409 with structured error code.
- Unauthorized or foreign-booking transitions return 403/404.
- Alembic migration applies cleanly.
Checks: backend pytest (18 tests), typecheck, CI verify job.

### S3 — Booking transition seam — Rails backend (apps/pawwalk-api)
Scope: Add member routes for accept/decline/start/complete on bookings; ensure created_at in booking payload; add tests.
Acceptance criteria:
- Routes exist and transition status.
- Cancel remains PATCH /cancel with existing semantics.
- Authorization via current_user.bookings scoping.
Checks: Rails test suite (test/integration/bookings_test.rb), RuboCop.

### S4 — Booking transitions — iOS client (apps/ios/PawWalk)
Scope: Wire CreateBookingView and WalkerHomeView to the transition routes; ensure Booking decodes created_at; map local BookingAction to APIClient.transitionBooking.
Acceptance criteria:
- App compiles (xcodebuild scheme).
- APIClient.transitionBooking used by WalkerHomeView actions.
- Booking model decodes created_at.
Checks: xcodebuild -scheme PawWalk -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build (CI gate).

### S5 — Booking transitions — Android client (apps/android)
Scope: Wire BookingRepository.transition and PawWalkApi.transitionBooking; ensure Booking.status is typed; CreateBookingViewModel/WalkerViewModel use transition.
Acceptance criteria:
- App assembles (./gradlew assembleDebug).
- BookingRepository.transition calls api.transitionBooking.
Checks: android-build CI gate.

### S6 — Shared SRS scheduler + tests (packages/prep-kit + apps/portfolio)
Scope: Move the shared SRS + streak scheduler test suite beside the module in prep-kit; give prep-kit a test script wired into Turbo; portfolio consumes via deep file import.
Acceptance criteria:
- packages/prep-kit/src/lib/srs.ts and study-srs.test.ts coexist.
- packages/prep-kit/package.json has a test script.
- apps/portfolio no longer duplicates the scheduler logic.
- Turbo test runs prep-kit tests.
Checks: pnpm test (portfolio), prep-kit test script, root turbo test.

### S7 — Study persistence seam (packages/prep-kit + apps/portfolio + apps/learn)
Scope: One state module with load/save adapters; each host supplies its adapter; transitions SRS math shared, storage per-host.
Acceptance criteria:
- prep-kit owns state transitions (grade, streak, day log, reset).
- Portfolio and Learn supply only adapter implementations.
- Hydration, write-through, day-log keys, reset semantics in one place.
Checks: portfolio tests, learn tests, structural review of adapter surface.

### S8 — Architecture fitness gate tests (scripts/architecture-fitness.mjs + test)
Scope: Expose evaluateWorkspace(root) or equivalent; test inventory + group assignment + violation output with real temporary manifests.
Acceptance criteria:
- Tests build manifest objects AND exercise CLI inventory.
- Group assignment verified.
- Violation output from real temp manifests.
Checks: node --test scripts/architecture-fitness.test.mjs, verify job.

## Tasks

| ID | S# | Route | Status | Commit |
|----|----|-------|--------|--------|
| T1 | S1 | Delegated writer (parallel unit) | complete | 4cad5c1 |
| T2 | S2 | Delegated writer (parallel unit) | pending | — |
| T3 | S3 | Delegated writer (parallel unit) | pending | — |
| T4 | S4 | Delegated writer (parallel unit) | pending | — |
| T5 | S5 | Delegated writer (parallel unit) | pending | — |
| T6 | S6 | Delegated writer (parallel unit) | complete | d6e0c7f |
| T7 | S7 | Delegated writer (parallel unit) | pending | — |
| T8 | S8 | Delegated writer (parallel unit) | complete | 417e330 |

## Log

### L1 — User request (2026-10-28)
> hagamos todas las mejoras

### L2 — Plan (2026-10-28)
- Five candidates converted to eight tasks; all eight are independent units with disjoint edit surfaces, so they run as parallel writers.
- High-risk units (S2–S5 touch data/contracts/concurrency) get an independent verifier after their own checks.
- Risk line will be closed on every task: `Risk: item N (reason)` or `Risk: none`.
- Native review (RDD) runs on work-unit commits when review_due is true; candidate is the work-unit commit, not the accumulated branch.