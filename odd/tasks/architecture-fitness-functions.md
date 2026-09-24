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

### ODD-AFF-02 — Implement and test the workspace dependency fitness function — COMPLETE
- [x] Add a deterministic Node script that inventories workspace package manifests, rejects forbidden dependency directions, and reports counts for allowed edges and violations.
- [x] Add Node tests for allowed and forbidden edge cases; observe RED before implementing behavior.
- **Acceptance:** Current workspace graph reports 13 packages, 7 allowed local edges, and zero forbidden edges; synthetic app-to-app and package-to-app edges fail the test/function.
- **RED:** `node --test scripts/architecture-fitness.test.mjs` failed before implementation because the validator module did not exist.
- **GREEN:** `node --test scripts/architecture-fitness.test.mjs` passed (3 tests, 0 failures).
- **Real audit:** `node scripts/architecture-fitness.mjs` reported 13 workspace packages, 7 local dependency edges, 7 allowed edges, and 0 violations.
- **Commit:** `81391b2 feat: add workspace dependency fitness function`.
- **Project checks after the source change:** `pnpm typecheck` passed (8 successful Turbo tasks); `pnpm test` passed (5 suites, 34 tests). Post-change `pnpm lint` is UNVERIFIED; the user explicitly approved proceeding without post-change lint evidence. The pre-change baseline lint passed with 17 warnings in `apps/learn`.
- **RDD review:** Native risk assessment was medium. The user granted candidate review consent; the single `review-reliability` review ended approved. Exact acknowledgement returned `action: acknowledged`, authority `burned`. No correction was opened.
- **Non-blocking follow-ups (not implemented here):** Add automated CLI-path assertions for inventory/output/exit-code behavior; include the manifest path in malformed-manifest failures; decide how to report unsupported inventory cases such as symlinked workspaces and the hardcoded roots.
- **Likely files:** `scripts/architecture-fitness.mjs`, `scripts/architecture-fitness.test.mjs`.

### ODD-AFF-03 — Wire the fitness function into the standard CI path — COMPLETE
- [x] Add `pnpm architecture:check` to the root scripts, running the focused tests and real workspace audit.
- [x] Add the command to the existing CI `verify` job so pull requests and main pushes enforce it.
- **Acceptance:** The command passes on the current graph and exits non-zero for a forbidden dependency; CI invokes it in the existing verification job.
- **Implementation:** The root script runs `node --test scripts/architecture-fitness.test.mjs && node scripts/architecture-fitness.mjs`; the `Architecture fitness` step follows `Test` in the existing `verify` job. Existing PR and main-push triggers and broad CI path coverage are unchanged.
- **Verification:** `pnpm architecture:check` passed (3 tests, 0 failures); the real audit reported 13 workspace packages, 7 local edges, 7 allowed, and 0 violations. Post-change `pnpm lint` remains UNVERIFIED by the user's explicit choice and was not run.
- **Project checks after the CI change:** `pnpm typecheck` passed (8 Turbo tasks); `pnpm test` passed (5 suites, 34 tests). Post-change `pnpm lint` remains UNVERIFIED by the user's explicit choice; do not treat the entire project loop as passed.
- **Commit:** `0986ffb ci: enforce workspace dependency fitness check`.
- **RDD review:** Assessment for `0986ffb` against last reviewed boundary `81391b2` returned high risk due to the shell-source signal in CI YAML. The user granted consent; the canonical four-lens review completed and was approved. Exact acknowledgement returned `action: acknowledged`, authority `burned`. No correction was opened.
- **Non-blocking follow-ups (not implemented here):** Add automated CLI exit-code assertions for forbidden dependencies; document/track that the CI gate consumes scripts added by the prior commit and preserve its audited scope; retain the declared-dependencies-only limitation and consider future inventory-path/symlink diagnostics.
- **Status:** Complete; the declared-dependencies-only scope and non-blocking follow-ups remain for later consideration.
- **Checks:** `pnpm architecture:check`; inspect workflow placement and run the focused command locally.
- **Likely files:** root `package.json`, `.github/workflows/ci.yml`.

### ODD-AFF-04 — Document the fitness-function and decision-evidence model — COMPLETE
- [x] Document what the first check enforces and its declared-dependencies-only limitation.
- [x] Define the decision evidence fields: quality attribute, fitness function/metric, baseline, target or threshold rationale, owner, measurement cadence, and revisit trigger.
- [x] Record the workspace dependency-direction decision in the existing intended ADR location (`docs/adr/`, which does not currently exist).
- [x] List follow-on baseline candidates—cross-workspace change rate, CI p50/p95 duration, and app-appropriate runtime measures—without assigning unsupported targets.
- **Acceptance:** The docs distinguish hard CI invariants from trend metrics; no arbitrary targets or claims of unimplemented observability.
- **Artifacts:** `docs/architecture/fitness-functions.md` and `docs/adr/0001-workspace-dependency-boundaries.md`.
- **Structural readback:** Both documents were read back. They state the current guardrail and measured baseline, declared-dependency-only scope and inventory limitations, review follow-ups, decision-evidence template, separate candidate metrics, adoption loop, and ADR alternatives/consequences. No additional checks were run.
- **Verification status:** Post-change `pnpm lint` remains UNVERIFIED by the user's explicit choice; the full project loop is not claimed as green.
- **Commit:** `416ff70 docs: define architecture fitness functions`.
- **RDD review:** Assessment for `416ff70` against last reviewed boundary `0986ffb` was passive. Structural readback was the complete proportional check; no semantic review was launched.
- **Status:** Complete. Post-change `pnpm lint` remains UNVERIFIED by the user's explicit choice; the full project loop is not claimed as green.
- **Checks:** Structural readback completed; no test or project checks were run for this documentation-only task.
- **Likely files:** `docs/architecture/fitness-functions.md`, `docs/adr/0001-workspace-dependency-boundaries.md`.

### ODD-AFF-05 — Enable safe feature-branch verification in GitHub Actions — IN PROGRESS
- [ ] Add `feature/**` alongside `main` in the existing `.github/workflows/ci.yml` `push.branches` filter; do not change deploy job conditions.
- [ ] After the work-unit commit and its RDD assessment/review, push `feature/architecture-fitness-functions` to `origin` and verify the corresponding GitHub Actions run without opening a PR.
- **Route:** Do not dispatch `ci.yml` manually. Its existing `workflow_dispatch` also enables deployment jobs; the selected route is the feature-branch push trigger.
- **First-push behavior:** With an all-zero `before` SHA, path-detection jobs may treat all paths as changed and run the `apps/learn`, backend, iOS, and Android validation/build jobs. Deployment jobs remain skipped on this feature-branch push because their existing conditions require a main push or manual dispatch.
- **Acceptance:** A push to `feature/architecture-fitness-functions` triggers CI verification without a PR or deployment; record the GitHub Actions result honestly.
- **Remote authorization:** Destination `origin` -> `https://github.com/corderogerardo/gerardocordero.dev`, branch `feature/architecture-fitness-functions`; use the active GitHub CLI HTTPS session `corderogerardo`. No SSH, PR, or deployment operation is authorized.
- **Verification:** Review the workflow structure locally; after commit, run RDD assessment/review; after the authorized push, inspect the GitHub Actions run. Do not dispatch `ci.yml` manually. Local post-change `pnpm lint` remains UNVERIFIED until the workflow run reports its result.
- **Likely file:** `.github/workflows/ci.yml`.

## Applicable Checks
- Focused RED/GREEN: `node --test scripts/architecture-fitness.test.mjs`.
- Fitness check: `pnpm architecture:check`.
- Project loop before completion: `pnpm typecheck`, `pnpm lint`, `pnpm test`.
- Record unavailable, failed, partial, or skipped checks honestly; do not attribute the initial typecheck failure to this change.

## Authorized Scope
This feature plan authorizes ODD-AFF-01 through ODD-AFF-05 only. ODD-AFF-05 authorizes adding `feature/**` to the existing CI push branch filter, then pushing only `feature/architecture-fitness-functions` to `origin` at `https://github.com/corderogerardo/gerardocordero.dev` using the active GitHub CLI HTTPS session `corderogerardo`, and inspecting that run. Keep existing deploy job conditions unchanged. Do not dispatch `ci.yml`, use SSH, open a PR, or perform any deployment operation. Preserve the existing dependency declarations, application behavior, and unrelated `.atl` modifications in the original checkout.

## Progress
- [x] Baseline architecture mapping and gate inventory.
- [x] Workspace dependency fitness function and tests.
- [x] CI integration.
- [x] Decision/metric documentation and ADR.
- [ ] Feature-branch CI verification (in progress).

## Next Step
Implement ODD-AFF-05 by adding the feature branch to the CI push filter, then commit, complete RDD review, push only the authorized branch, and record the Actions result. Keep local post-change `pnpm lint` unverified until that workflow run reports its result.
