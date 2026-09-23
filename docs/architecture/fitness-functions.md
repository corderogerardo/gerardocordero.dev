# Architecture Fitness Functions

The current architecture guardrail is `pnpm architecture:check` in the CI `verify` job. It allows declared workspace dependency edges from `apps` to `packages` and from `packages` to `packages`; it rejects `apps` to `apps` and `packages` to `apps`. The observed baseline is **13 workspace packages, 7 local edges, and 0 forbidden edges**.

## What the guardrail checks

An architecture fitness function is an executable, repeatable test of an architectural decision. This function checks package dependency declarations in `package.json` for direct children of `apps/*` and `packages/*`, and counts an edge only when its target is another discovered local workspace package. It checks `dependencies`, `devDependencies`, `peerDependencies`, and `optionalDependencies`.

The check does **not** inspect relative imports or TypeScript path aliases. Its inventory uses the `apps/*` and `packages/*` roots directly; it does not parse `pnpm-workspace.yaml`. If workspace roots or layout change, keep the inventory aligned. This gate therefore enforces declared package edges, not all possible source-level dependencies.

Review follow-ups remain open; the current implementation does not claim to provide them:

- Add CLI-level tests for failure paths and exit codes, including forbidden dependencies.
- Include manifest-path context in malformed-manifest errors.
- Define explicit inventory coverage, including symlinked workspaces and workspace-root changes.

## Invariants and trends

Use a hard CI gate for a decision with a clear pass/fail rule and a failure that should block the change. Keep trend metrics separate: they describe how an attribute changes over time and need a baseline, scope, owner, and review cadence before anyone can justify a threshold. Do not combine different quality attributes into one numeric score; a combined score can hide a serious regression in one attribute behind improvement in another.

| Attribute or decision | Measure | Status and scope |
|---|---|---|
| Workspace dependency direction | Number of forbidden declared local edges | **Hard CI gate.** Current observed scope: 13 direct workspace packages, 7 local edges, 0 forbidden edges. |
| Cross-workspace change coupling | Candidate: share of changes touching more than one workspace package, with package-pair counts as context | Trend candidate; not measured by this initiative. Define the change unit and history window before interpreting it. |
| CI duration | Candidate: p50/p95 duration for `verify` and its relevant jobs | Trend candidate; no baseline or target established here. Keep workflow and job scope consistent when comparing runs. |
| Runtime behavior | Static sites: Web Vitals; mobile clients: crash-free sessions and startup time; APIs: availability, latency, and error rate | Separate, app-appropriate candidates; not instrumented or measured by this initiative. Do not treat these as one universal SLI. |

Set targets for trend metrics only after collecting a representative baseline and recording why the threshold is useful. No runtime or coupling targets are established here.

## Decision evidence template

Record one decision or quality attribute per entry. Use `Pending baseline` when evidence does not yet support a target.

| Field | Record |
|---|---|
| Decision / date | What is being decided and when |
| Quality attribute | The single attribute this decision affects |
| Hypothesis | The expected architectural effect and why |
| Fitness function / metric | The executable rule or measured quantity |
| Observed baseline / scope | Starting value, population, and measurement window; or `Pending baseline` |
| Target / threshold and rationale | A justified bound; or `Pending baseline` |
| Owner | Role or person responsible for interpreting and revisiting the evidence |
| Data source | Where the result comes from |
| Measurement cadence | On each change, per release, or a stated review interval |
| Revisit trigger | A threshold breach, topology change, new evidence, or other explicit event |

## Adoption loop

1. Record the decision and its hypothesis for one quality attribute.
2. Define the measure and scope, then establish an observed baseline.
3. Choose a threshold only when the baseline supports one; record its rationale. Otherwise leave it `Pending baseline`.
4. Run hard invariants continuously in CI and collect trend metrics at their stated cadence.
5. Revisit the decision when its trigger occurs or when the measure no longer represents the architecture.

A trend metric is ready to become a CI gate when its scope and calculation are stable, the threshold follows from evidence, the check is repeatable and affordable, and failure gives maintainers an actionable signal with an acceptable false-positive rate. Until then, report it as a trend rather than a blocker.
