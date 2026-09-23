# ODD Tasks: Architecture Fitness Functions

## Objective
Introduce a small, objective architecture fitness function for the pnpm workspace dependency graph, wire it into CI, and establish a documented path for measuring broader architecture decisions from observed baselines.

## Problem and Why
The monorepo has distinct apps and shared packages, but current quality gates primarily verify types, lint, tests, builds, and content. Workspace dependency direction is not directly guarded. Decisions about future structural, delivery, and runtime metrics need explicit baselines and owners rather than invented targets.

## Scope
- **In:** pnpm workspace package boundaries; declared local workspace dependency direction; deterministic reporting of workspace and dependency-edge counts; CI enforcement; documenting fitness-function and decision-evidence conventions.
- **Out:** Source-level import scanning, architectural refactors, microservice extraction, blanket coverage goals, a dashboard/telemetry platform, production runtime instrumentation, and changes to course or archived code.

## Constraints and Decisions
- The fitness function checks declared dependencies between pnpm workspace packages only. It does not claim to prevent bypasses through relative imports or TypeScript path aliases; evaluate source-level enforcement as a later fitness function.
- Allowed declared edges: `apps -> packages` and `packages -> packages`.
- Forbidden declared edges: `apps -> apps` and `packages -> apps`.
- Discover current workspaces from the repository's `apps/*` and `packages/*` workspace layout. Ignore directories without a workspace `package.json`.
- Use Node.js built-ins and Node's `node:test`; add no dependency.
- Scope policy by workspace class; do not impose production rules on learning/educational directories that are not pnpm workspaces.
- Strict TDD is enabled by current session configuration. Runner: Node built-in test runner (`node --test`).
- Delivery strategy: `ask-on-risk`; current change forecast is under the advisory ~400 authored-line heuristic. Do not push or open a PR.

## Baseline Evidence (2026-09-23)
- The pnpm workspace contains 13 packages: 8 under `apps/*`, 5 under `packages/*`.
- Existing local workspace dependency edges observed: six prep apps depend on `@gerardocordero/prep-kit`; `@gerardocordero/portfolio` depends on `@gerardocordero/ui` — 7 total, with no observed forbidden app-to-app or package-to-app edges.
- CI `verify` runs `pnpm typecheck`, `pnpm lint`, and `pnpm test`; `pnpm test` is filtered to the portfolio. `apps/learn` has separate change-triggered CI validation, translation drift checks, and Node tests. Other non-pnpm apps have scoped build/test jobs.
- Clean worktree setup: `pnpm install --offline --frozen-lockfile` succeeded.
- First `pnpm typecheck` attempt exited 1 with TypeScript 7 CLI help and no diagnostics. All eight workspace typechecks then passed individually; a subsequent root `pnpm typecheck` passed (8 successful tasks). The initial failure's cause is unconfirmed; do not claim it was fixed.
- `pnpm lint` passed with 17 warnings in `apps/learn`; `pnpm test` passed with 5 suites and 34 tests.
- The existing main worktree has unrelated modified `.atl` files; this feature is isolated in its own clean worktree.

## Tasks

### ODD-AFF-01 — Map current workspace and quality-gate baseline — COMPLETE
- [x] Inventory workspace package categories and declared local dependency edges.
- [x] Read the root Turbo task graph and applicable CI workflow gates.
- [x] Record test/typecheck caveats and exclusions.
- **Evidence:** `pnpm -r list --depth -1 --json`, package manifests, `turbo.json`, and `.github/workflows/ci.yml`; baseline results above.

### ODD-AFF-02 — Implement and test the workspace dependency fitness function — NOT STARTED
- [ ] Add a deterministic Node script that inventories workspace package manifests, rejects forbidden dependency directions, and reports counts for allowed edges and violations.
- [ ] Add Node tests for allowed and forbidden edge cases; observe RED before implementing behavior.
- **Acceptance:** Current workspace graph reports 13 packages, 7 allowed local edges, and zero forbidden edges; synthetic app-to-app and package-to-app edges fail the test/function.
- **Checks:** `node --test scripts/architecture-fitness.test.mjs`; `node scripts/architecture-fitness.mjs`.
- **Likely files:** `scripts/architecture-fitness.mjs`, `scripts/architecture-fitness.test.mjs`.

### ODD-AFF-03 — Wire the fitness function into the standard CI path — NOT STARTED
- [ ] Add `pnpm architecture:check` to the root scripts, running the focused tests and real workspace audit.
- [ ] Add the command to the existing CI `verify` job so pull requests and main pushes enforce it.
- **Acceptance:** The command passes on the current graph and exits non-zero for a forbidden dependency; CI invokes it in the existing verification job.
- **Checks:** `pnpm architecture:check`; inspect workflow placement and run the focused command locally.
- **Likely files:** root `package.json`, `.github/workflows/ci.yml`.

### ODD-AFF-04 — Document the fitness-function and decision-evidence model — NOT STARTED
- [ ] Document what the first check enforces and its declared-dependencies-only limitation.
- [ ] Define the decision evidence fields: quality attribute, fitness function/metric, baseline, target or threshold rationale, owner, measurement cadence, and revisit trigger.
- [ ] Record the workspace dependency-direction decision in the existing intended ADR location (`docs/adr/`, which does not currently exist).
- [ ] List follow-on baseline candidates—cross-workspace change rate, CI p50/p95 duration, and app-appropriate runtime measures—without assigning unsupported targets.
- **Acceptance:** The docs distinguish hard CI invariants from trend metrics; no arbitrary targets or claims of unimplemented observability.
- **Checks:** Structural readback; verify paths and statements against this repository.
- **Likely files:** `docs/architecture/fitness-functions.md`, `docs/adr/0001-workspace-dependency-boundaries.md`.

## Applicable Checks
- Focused RED/GREEN: `node --test scripts/architecture-fitness.test.mjs`.
- Fitness check: `pnpm architecture:check`.
- Project loop before completion: `pnpm typecheck`, `pnpm lint`, `pnpm test`.
- Record unavailable, failed, partial, or skipped checks honestly; do not attribute the initial typecheck failure to this change.

## Authorized Scope
This feature plan authorizes the four tasks above only. Do not alter application behavior, workspace dependency declarations, tests in educational apps, or the unrelated `.atl` modifications in the original checkout. Do not enable receipt-driven development, push, or create a PR.

## Progress
- [x] Baseline architecture mapping and gate inventory.
- [ ] Workspace dependency fitness function and tests.
- [ ] CI integration.
- [ ] Decision/metric documentation and ADR.

## Next Step
Implement ODD-AFF-02 test-first, then verify and update both this file and its Engram mirror before continuing.
