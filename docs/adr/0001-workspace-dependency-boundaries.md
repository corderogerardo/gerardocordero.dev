# ADR-0001: Workspace Dependency Boundaries

## Status
Accepted

## Date
2026-09-23

## Context
This repository is a heterogeneous pnpm/Turbo monorepo with 13 direct workspace packages: 8 under `apps/*` and 5 under `packages/*`. The observed graph has 7 declared local dependency edges and currently 0 forbidden edges. Existing checks cover correctness, including typechecking, linting, and tests, but did not guard the direction of declared workspace dependencies.

## Decision
Enforce the declared workspace layer rule with dependency-free Node.js code and the root `pnpm architecture:check` command in the CI `verify` job.

- Allow `apps -> packages` and `packages -> packages`.
- Reject `apps -> apps` and `packages -> apps`.
- Inspect declared dependencies among direct workspace directories under `apps/*` and `packages/*`; count edges only when the target package is also a discovered local workspace.
- Run the focused Node tests and real workspace audit through `pnpm architecture:check`.

## Alternatives Considered

### Manual code review only

Manual review requires reviewers to notice and consistently apply the dependency rule on every change. It provides no repeatable graph-wide check and can miss a forbidden declaration, so it is weaker than a deterministic CI gate.

### Add a dependency-parser tool immediately

An additional parser dependency would increase maintenance and supply-chain surface before the first check demonstrates a need. The initial rule can be evaluated from the existing package manifests with Node.js built-ins. Reconsider a tool if the manifest formats or inventory requirements outgrow this implementation.

### Enforce source imports and aliases now

Scanning relative imports and TypeScript path aliases would cover dependency paths that package declarations miss, but it expands the first check beyond its measured package-graph baseline. Defer it until a concrete bypass or a source-level baseline shows that a separate fitness function is needed.

## Consequences

- CI fails deterministically when a forbidden declared workspace edge appears.
- The rule adds no dependency and changes no application behavior.
- The check does not detect deep relative imports or TypeScript path aliases.
- The script does not parse `pnpm-workspace.yaml`; workspace-root or layout changes can drift from its direct `apps/*` and `packages/*` inventory.
- CLI failure-path/exit-code tests, malformed-manifest path context, and explicit inventory coverage for symlinks and workspace roots remain follow-ups.
- Broader measures such as cross-workspace coupling, CI duration trends, and app-specific runtime signals remain candidates; this decision establishes no targets or claims of instrumentation for them.
