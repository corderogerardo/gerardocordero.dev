# Expo SDK Upgrade

Objective: Upgrade every Expo-managed project in the monorepo to the latest stable Expo SDK using the official incremental migration path. Branch: `feature/monorepo-deepening`. Delivery: `ask-on-risk`; forecast ~300–600 authored lines, generated lockfile content excluded. Verification: portfolio typecheck, lint, Jest, Expo Doctor, web export, and native build checks where the local toolchain permits them.

## Specs

### S1 — Upgrade the Expo-managed app to the latest stable SDK
User request: "puedes actualizar el Expo sdk a la ultima version en los proyectos"
Scope: Upgrade Expo-managed app projects only. The current manifest inventory found one such app, `apps/portfolio`; `apps/ios` and `apps/android` are native clients, not Expo SDK projects. Preserve app behavior and the existing static-web/EAS setup.
Assumptions: The latest stable SDK on 2026-10-29 is Expo SDK 58.0.0, per the official Expo SDK reference. Follow Expo's recommendation to upgrade one SDK release at a time (56 → 57 → 58).
Acceptance criteria:
- `apps/portfolio` and its root pnpm lockfile resolve the SDK-58-compatible Expo modules, React Native, React, Router, and SDK-specific tooling.
- Raise Node requirements/configuration to at least 22.13 wherever the portfolio CI/build workflows require it.
- Apply SDK 57 and SDK 58 migration changes only where current app code/config uses the affected APIs; preserve the app's static web export and existing behavior.
- Keep native build configuration and EAS profiles consistent with the final SDK; do not run remote EAS operations without explicit authorization.
- Verify the affected portfolio gates and report any proof that remains unavailable.
Checks: `pnpm --filter @gerardocordero/portfolio typecheck`, `pnpm --filter @gerardocordero/portfolio lint`, `pnpm --filter @gerardocordero/portfolio test`, Expo Doctor, static web export, and local native compile checks where supported.
Risk: item 5 (Expo, React Native, Node, CI, and native build-toolchain dependencies change).

## Tasks

| ID | S# | Route | Status | Commit |
|----|----|-------|--------|--------|
| T1 | S1 | Inline (sequential SDK 56 → 57 migration) | pending | — |
| T2 | S1 | Inline (after T1; SDK 57 → 58 migration) | pending | — |

## Log

### L1 — User request (2026-10-29)
> puedes actualizar el Expo sdk a la ultima version en los proyectos

### L2 — Read-only inventory and official guidance (2026-10-29)
- Only `apps/portfolio/package.json` declares a direct `expo` dependency (`~56.0.12`). It currently uses React 19.2.3, React Native 0.85.3, Expo Router `~56.2.11`, and SDK-56 Expo modules/tooling.
- Expo's official reference reports SDK 58.0.0 as latest stable, with React Native 0.88, React 19.3.0, and Node >=22.13. Expo's official upgrade guide recommends upgrading one SDK version at a time.
- SDK 58 migration review includes the app's Expo Router compatibility imports/custom tab bar, static-web behavior, the existing Metro SharedArrayBuffer shim, and Node 20 in portfolio CI/release workflows.
- The app already sets `web.output` to `static`; no `+html` file or `expo-router/head` use was found in the mapped app.

### L3 — Environment and authorization blockers (2026-10-29)
- The local `pnpm` command and portfolio Expo CLI are absent. The user later authorized obtaining the pinned pnpm and resolving the lockfile; app dependency installs and lifecycle scripts are not authorized.
- The lockfile may require package metadata from `registry.npmjs.org`; use only the anonymous access scope captured in L4, with no credentials or app package installation.
- The active security-audit contract requires a verified OS-enforced sandbox for target builds/tests. The started Docker daemon is Linux/ARM64 and does not provide Xcode; no compliant full validation environment has been verified.
- No application source, package manifest, or lockfile has been changed yet.

### L4 — User confirmation (2026-10-29)
- User confirmed the incremental SDK 56 → 57 → 58 path and authorized anonymous access to `registry.npmjs.org` to obtain pnpm 10.11.0 and resolve the lockfile only; app dependencies/scripts remain excluded.
> SI hazlo gradualmente: Solo encontré un proyecto Expo: apps/portfolio, actualmente en SDK 56. La última estable es SDK 58.0.0; Expo recomienda migrar incrementalmente 56 → 57 → 58. También hay que elevar a Node ≥22.13 y revisar compatibilidad de Expo Router y el export web.

### L5 — Engram mirror status (2026-10-29)
- The full mirror at `odd/expo-sdk-upgrade/tasks` is pending because the runtime could not confirm Engram session registration for `mem_save`. The local tracker is current; resynchronize it when Engram is available.
