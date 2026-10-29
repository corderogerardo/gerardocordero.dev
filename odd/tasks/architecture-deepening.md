# Architecture Deepening — Monorepo + Standalone

Objective: Implement nine selected architecture-deepening candidates across the monorepo using the approval-gated, skill-first software factory. Branch: feature/monorepo-deepening (already pushed). Delivery: ask-on-risk (default); forecast ~1,200–1,900 authored lines across units; generated files excluded. Verification: pnpm typecheck, pnpm lint, pnpm test, pnpm architecture:check, backend pytest, Rails tests, Android build, and native review for high-risk units.

## Specs

### S1 — Scene tile catalog (apps/learn)
User request: "hagamos todas las mejoras" applied to the scene tile seam discovered during architecture review.
Scope: Move label/href/Icon/hue into one canonical tile catalog inside the tile module; callers supply locale only.
Acceptance criteria:
- One canonical source of SceneTile records in apps/learn/src/components/SceneTiles.tsx or a dedicated catalog module.
- HomePageClient and locale page callers no longer pair by array index.
- No `Icon: undefined` risk from mismatched indices.
Checks: typecheck, lint, test on apps/learn; visual/manual inspection of tile rendering.

### S2 — Booking lifecycle contract — FastAPI backend (apps/backend)
User request: implement all architecture improvements including booking transitions.
Scope: Match the native booking routes and flat Booking response shape. Support `GET /bookings/assigned`, `POST /bookings/{id}/accept`, `/decline`, `/start`, `/complete`, and `POST /bookings/{id}/cancel`; include `created_at` and add a non-destructive Alembic migration. Return the shared structured 409 contract for duplicate-email signup conflicts. Keep existing owner-scoped booking reads. Preserve current Dog persistence/create semantics and payment-webhook behavior; do not create Dog records as an implicit booking side effect. Booking-create request semantics remain outside this transition slice.
Acceptance criteria:
- Existing booking create/list/detail responses and the listed transition/cancellation responses use the native flat Booking DTO, including `created_at`; list endpoints return arrays, not nested wrappers. `/bookings/assigned` returns only bookings assigned to the authenticated linked walker.
- Lifecycle: create `pending`; assigned walker `accept` `pending` → `confirmed`, `decline` `pending` → `cancelled`, `start` `confirmed` → `in_progress`, and `complete` `in_progress` → `completed`; the owner may cancel only their own `pending` or `confirmed` booking.
- Invalid transitions return HTTP 409 with `code: "transition_conflict"` and human-readable `detail`; duplicate-email signup conflicts return HTTP 409 with `code: "email_taken"` and `detail`.
- Owner-role booking create/list/detail/cancel routes reject walker accounts; walker assigned-list/transitions require a linked walker profile. Foreign or unassigned booking IDs are not disclosed. A payment-confirmed booking remains eligible for `start`, and webhook behavior is unchanged.
- The migration preserves existing rows, gives new bookings a server-generated `created_at`, and is verified against an isolated database.
Checks: focused backend pytest, migration upgrade test on a temporary database, `pnpm typecheck`, and the CI verify job.
Risk: item 2 (booking mutations depend on owner-versus-assigned-walker authorization).

### S3 — Booking lifecycle contract — Rails backend (apps/pawwalk-api)
Scope: Match the native booking routes and flat Booking response shape, add assigned bookings and transition actions, link Walker profiles to exclusive owner/walker accounts, and return the shared structured 409 contract for duplicate-email signup conflicts. Keep existing Dog persistence/create semantics and payment-webhook behavior; do not create Dog records as an implicit booking side effect. Booking-create request semantics remain outside this transition slice.
Acceptance criteria:
- Existing booking create/list/detail responses and new transition/cancellation responses use the native flat Booking DTO, including the existing `created_at` timestamp; list endpoints return arrays, not nested wrappers. Add POST `accept`, `decline`, `start`, `complete`, and `cancel` booking routes plus `GET /bookings/assigned`.
- Preserve `PATCH /bookings/:id/cancel` as a compatibility alias with the same owner-only semantics; POST is the shared native route.
- Apply the S2 lifecycle and structured 409 error contract. Owner-role booking create/list/detail/cancel routes reject walker accounts; only a linked assigned walker may use the assigned list and walker transitions; owners may cancel their own eligible bookings.
- Add exclusive `owner`/`walker` roles and an optional, unique `Walker.user_id` association. Assumption: legacy accounts without a role become owners; unclaimed catalog profiles stay unlinked, and walker privileges require explicit trusted provisioning.
- Duplicate-email signup conflicts return HTTP 409 with `code: "email_taken"` and human-readable `detail`.
- Preserve the existing payment webhook transition to `confirmed`; verify that a payment-confirmed booking can still be started by its assigned walker.
Checks: focused Rails integration tests, migration tests against the isolated test database, and RuboCop.
Risk: item 2 (role and Walker-link authorization guard the booking state machine).

### S4 — Booking transitions — iOS client (apps/ios/PawWalk)
Scope: Decode the shared structured conflict codes in `APIClient.checkStatus`; preserve the already-wired native booking routes, actions, and `created_at` decoding.
Acceptance criteria:
- `email_taken` remains the duplicate-email error; `transition_conflict` becomes a distinct transition error carrying `detail`; unknown 409 responses are not mislabeled as duplicate email.
- Existing `POST /bookings/{id}/{action}`, `POST /bookings/{id}/cancel`, assigned-booking loading, and `created_at` decoding remain intact.
Checks: `xcodebuild -scheme PawWalk -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build` (CI gate). No iOS test target was found during mapping; document this proof limitation rather than adding test infrastructure in this task.
Risk: item 3 (HTTP conflict codes are a shared client/backend contract).

### S5 — Booking transitions — Android client (apps/android)
Scope: Type the booking status wire values and load the walker's assigned bookings through the shared native route; preserve the existing transition action route.
Acceptance criteria:
- `Booking.status` is a typed representation of the existing wire values (`pending`, `confirmed`, `in_progress`, `completed`, `cancelled`) and all consumers preserve current behavior.
- `PawWalkApi` and `BookingRepository` expose `GET /bookings/assigned`; `WalkerViewModel` loads that result rather than the owner's `/bookings` list.
- Existing `POST /bookings/{id}/{action}` transitions continue through `BookingRepository.transition`.
Checks: relevant Gradle tests if a deterministic runner exists, then `./gradlew assembleDebug` (android-build CI gate). No Android test files were found during mapping; do not add a test framework solely for this unit.
Risk: item 3 (typed statuses and assigned-booking routes are consumed API contracts).

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
Risk: item 1 (study progress and reset behavior operate on persisted user data).

### S8 — Architecture fitness gate tests (scripts/architecture-fitness.mjs + test)
Scope: Expose evaluateWorkspace(root) or equivalent; test inventory + group assignment + violation output with real temporary manifests.
Acceptance criteria:
- Tests build manifest objects AND exercise CLI inventory.
- Group assignment verified.
- Violation output from real temp manifests.
Checks: node --test scripts/architecture-fitness.test.mjs, verify job.

### S9 — SRS grade presentation boundary (packages/prep-kit + apps/portfolio)
Scope: Keep `packages/prep-kit/src/lib/srs.ts` focused on grade identity and pure scheduling/state math; move Tailwind classes, locale keys, user-facing next-review labels, and other presentation metadata to the appropriate host/component layer. Retain Portfolio's native theme presentation separately from prep-kit web styling.
Acceptance criteria:
- The SRS core contains no Tailwind class strings, i18n keys, or user-facing grade/next-review text.
- Prep-kit and Portfolio preserve the existing four-grade order, labels, colors, hints, keyboard behavior if actually consumed, and scheduling results; web and native presentation remain host-specific.
- `Grade` and the pure scheduling API remain usable by existing consumers; update all in-repository callers and pin unchanged behavior with tests.
Checks: prep-kit SRS tests, portfolio Study tests, `pnpm typecheck`, `pnpm lint`, and `pnpm test`.
Risk: item 3 (the shared SRS module interface is consumed by multiple workspaces).

## Tasks

| ID | S# | Route | Status | Commit |
|----|----|-------|--------|--------|
| T1 | S1 | Delegated writer (parallel unit) | complete | 4cad5c1 |
| T2 | S2 | Delegated direct (parallel unit) | partial; needs_validation | — |
| T3 | S3 | Delegated direct (parallel unit) | partial; needs_validation | — |
| T4 | S4 | Delegated direct (parallel unit) | partial; needs_validation | — |
| T5 | S5 | Delegated direct (parallel unit) | partial; needs_validation | — |
| T6 | S6 | Delegated writer (parallel unit) | complete | d6e0c7f |
| T7 | S7 | Inline (after semantic decision; overlaps S9) | pending | — |
| T8 | S8 | Delegated writer (parallel unit) | complete | 417e330 |
| T9 | S9 | Inline (before T7; overlaps S7) | pending | — |

## Log

### L1 — User request (2026-10-28)
> hagamos todas las mejoras

### L2 — Plan (2026-10-28)
- Five candidates converted to eight tasks; all eight are independent units with disjoint edit surfaces, so they run as parallel writers.
- High-risk units (S2–S5 touch data/contracts/concurrency) get an independent verifier after their own checks.
- Risk line will be closed on every task: `Risk: item N (reason)` or `Risk: none`.
- Native review (RDD) runs on work-unit commits when review_due is true; candidate is the work-unit commit, not the accumulated branch.

### L3 — Contract and remaining-candidate reconciliation (2026-10-29)
- Reconciled S2–S5 to the user-selected native booking routes/flat DTO, lifecycle, exclusive roles, Walker linkage, and structured 409 codes (Engram observations #442–#444). Owner endpoints are owner-role-only; walkers use the assigned route. Both signup handlers also need to emit `email_taken` for duplicate addresses; current mappings expose only generic validation/detail responses. The Rails PATCH cancellation route remains only as a compatibility alias; do not change Dog persistence or webhook behavior in this slice. Booking-create request semantics remain for a later parity stage rather than inventing Dog persistence behavior.
- Added the omitted ninth architecture candidate: remove UI/i18n presentation from the shared SRS scheduler while preserving host-specific rendering.
- T2–T5 are the parallel writer batch because their backend/client edit surfaces are disjoint. S7 and S9 share SRS and Study files; run T9 before T7, inline, rather than parallelizing them.
- The S7 map found differing day-log, streak, and reset semantics across hosts. Do not silently unify those product behaviors; resolve them with the user before implementing T7.

### L4 — Mirror status (2026-10-29)
- The full Engram mirror at `odd/architecture-deepening/tasks` is pending because the runtime could not confirm session registration for the save. The local task file remains current; resynchronize the full document when Engram is available.

### L5 — T2–T5 implementation and source-only verification (2026-10-29)
- T2–T5 implementation and one bounded correction batch are present locally. The independent source recheck found the Android enum `when` issue resolved, Rails owner-role routes guarded, and FastAPI duplicate-email race mapped to `email_taken` only when the requested email exists.
- Final `gentle-ai review assess` result: `risk: high`, `review_due: true` (`high_risk`). The current untracked inventory was explicitly scoped. No work-unit commit or native review lifecycle was started.
- Dynamic proof is `needs_validation`: the active security-audit contract requires an OS-enforced sandbox with network denial, empty allowlisted environment, read-only target/toolchain, scratch-only writes, and explicit CPU/memory/process/file/disk/wall-clock limits. No sandbox meeting all controls was verified; `sandbox-exec` exists, but disk/resource isolation was not established. Do not run tests, builds, migrations, or target scripts until a compliant sandbox is available. Earlier worker-reported commands ran without this required isolation and are not accepted proof.
- T2–T5 remain partial; no commit or push was made. S7 remains blocked on the cross-host streak/day-log/reset semantics decision; T9 remains pending and must precede T7 because their edit surfaces overlap.
- The current feature forecast exceeds 400 authored lines under `ask-on-risk`; before any next commit, obtain the chain choice (`stacked-to-main` or `feature-branch-chain`).
- Source review found that Android consumes `GET /bookings/stats` while Rails does not expose it. That endpoint is outside the current transition slice and remains a later staged parity gap. The required `email_taken` 409 also reveals whether an account exists; this is an explicit consequence of the user-selected error contract.

### L6 — Commit and delivery instruction (2026-10-29)
> hagamos commit and push de todo lo que hemos trabajado antes de hacer los updates/upgrades del sdk de expo
- The user selected `stacked-to-main` as the chain strategy.
- Commit only the architecture-deepening work-unit paths and their tracker; preserve pre-existing `CONTEXT.md`, `odd/tasks/monorepo-deepening.md`, and `.atl` changes.
- The requested push still requires explicit remote destination and credential/session authorization. T2–T5 remain `partial; needs_validation`; do not represent the commits as fully verified.
