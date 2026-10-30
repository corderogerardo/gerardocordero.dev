# Feature: repository organization — readability first

Objective: review every project in the monorepo, document its functionality, and reorganize the code with readability as the top priority, then SOLID boundaries, then general quality, using the software-factory workflow. Branch: `feature/repo-organization`. Delivery: `ask-on-risk`. Verification: the existing loop (`pnpm typecheck`, `pnpm lint`, `pnpm test`), `pnpm architecture:check`, `node tools/validate.mjs`, plus the per-project gates named in each task.

## Specs

- S1: "quiero que revisemos en este repositorio cada proyecto y de cada proyecto su funcionalidad" — every workspace member and every on-disk non-member app has a documented purpose and structure.
- S2: "organicemos mejor el codigo aplicando principios solid y la software factory" — reorganize by responsibility and dependency direction, using the software-factory plan/approval/verify flow.
- S3: "que busquemos ejemplos modernos de cada proyecto en el mono repo y ajustemos nuestro codigo" — each project type is compared against current, primary-source reference implementations before changing its structure.
- S4: "elevando la calidad, la legibilidad sobre todo en lo maximo posible como prioridad" — readability outranks stylistic preference; no behavior changes without a test that pins it.
- S5: Existing toolchain, commands, conventions, and user work are preserved. No gate is invented or skipped.

## Discovery evidence (2026-10-29)

- Declared members: `apps/portfolio`, `apps/learn`, `apps/ios-prep`, `apps/nest-prep`, `apps/android-prep`, `apps/reactnative-prep`, `apps/nextjs-prep`, `apps/template-prep`, `packages/prep-kit`, `packages/ui`, `packages/courses`, `packages/interview-prep`, `packages/server-node-concepts`.
- On disk but outside the workspace glob (no `package.json`): `apps/ios` (SwiftUI), `apps/android` (Compose), `apps/backend` (FastAPI), `apps/pawwalk-api` (Rails), `packages/old-web` (archived).
- Undeclared nested project: `apps/learn/design-system-ui` (name `my-project`, own lockfile, no typecheck/test, invisible to Turbo and CI).
- Root `test` filters only portfolio and prep-kit; learn's tests run only in `validate-learn`; `courses` and `interview-prep` declare vitest configs but no scripts.
- `architecture:check` validates only workspace dependency edges; it cannot catch file-size, layer, or import-depth problems.

## Reference research (T1)

| Project type | Seam to adopt | Primary source | Checkable rule |
| --- | --- | --- | --- |
| Expo + expo-router | `app/**` routes only; components/hooks/tokens outside | Expo Router core concepts, rule 6 | no non-route module under `app/` |
| Next static export + `[locale]` | routing + data in `app/[locale]`, interactivity in leaf clients | Next static exports, i18n guide | no `'use client'` in `page.tsx`/`layout.tsx` |
| Shared TS package | explicit `exports` map as public API | Turborepo internal packages | no `../` across packages, no `src/` specifier |
| Rails 8 API | controller = HTTP, model = domain, cross-model workflow = PORO | Rails API guide + Rails Doctrine | one model query per controller action |
| FastAPI | routers HTTP-only, `crud`/service owns data ops | FastAPI bigger applications + official template | no `select(`/`session.` in `app/api/**` |
| Jetpack Compose | screen-level ViewModel, hoisted state, tokens in theme | Android architecture recommendations | no `ViewModel` param in reusable composables |
| SwiftUI | `@Observable` models own state; networking in services | Apple "Managing model data" + Food Truck sample | `URLSession` only under `Services/` |

Contested points to decide by team, not by citation: barrels vs subpath exports (performance-driven guidance, readability trade-off), Rails service objects (Doctrine defends rich models), SwiftUI MVVM (not Apple guidance). Rails and FastAPI layering get recorded in an ADR if adopted.

## Tasks

- T1 (S1,S3) — Reference research per project type — route: delegated read-only — status: done (see Reference research below).
- T2 (S4) — Portfolio: split `components/hud.tsx` (542) into tokens + primitives, keeping the module path — route: delegated writer — status: done, commit `b1abc8c` (tsc, eslint and jest green; rendered widgets moved verbatim).
- T3 (S4) — Portfolio: extract `XPRing` and static tables out of `app/(tabs)/index.tsx` (723) — route: delegated writer — status: done, commit `c8ebf7b` (723 → 549 lines; render tree identical).
- T4 (S4) — Portfolio: extract the study session state machine from `app/(tabs)/study.tsx` (473) into a pure, tested module — route: delegated writer — status: done, commit `87d01a3` (19 new tests, 37 total green).
- T5 (S2,S4) — Prep apps: consume `LEVELS`/`nav` from prep-kit instead of five local copies — route: delegated writer — status: done, commit `0f7030d` (kit owns taxonomy, display labels, Spanish labels and locale keys; apps re-export and keep taglines plus `resolveLevel`; prep-kit 29/29 tests, 7 typechecks, 5 lints green). Side effect: `reactnative-prep` lesson badges now show `Junior` instead of the literal `level.junior`.
- T6 (S2) — Replace prep-kit deep file imports with the package barrel where the barrel is safe — route: inline — status: pending.
- T7 (S1,S2) — Learn: remove the legacy `src/app/reactnative/**` tree after confirming no live links — route: delegated writer — status: done, commit `151ab31` (1133 lines deleted; redirect entry points kept; `public/_redirects` preserves old URLs on Cloudflare Pages; static build and i18n check pass).
- T8 (S4) — Learn: separate persistence/state from view in `practice/FlashcardDeck.tsx` (371) — route: delegated writer — status: done, commit `6cc466c` (371 → 81-line composition root plus hook and three presentational units; storage key unchanged).
- T9 (S1,S5) — Decide and record the fate of `apps/learn/design-system-ui` (declare or remove) — route: inline, needs user decision — status: pending.
- T10 (S5) — Close gate gaps that protect this work: prep-kit/ui scripts, root test filter breadth, Rails and template-prep CI — route: inline — status: pending.
- T11 (S4) — Docs rot: `apps/nest-prep/README.md` title/filters — route: inline — status: done, commit `856028b`. Catalog derivation from `COURSE_IDS` deferred: the tuple is used in routing type positions, so widening it needs its own change.

## Log

- L1 (user verbatim): "usando la skill de software factory y el knowledge guardado en engram, quiero que revisemos en este repositorio cada proyecto y de cada proyecto su funcionalidad, y organicemos mejor el codigo aplicando principios solid y la software factory, tambien que busquemos ejemplos modernos de cada proyecto en el mono repo y ajustemos nuestro codigo elevando la calidad, la legibilidad sobre todo en lo maximo posible como prioridad"
- L2: Repository is clean on `main` (`a97b3d3`) with one local branch and no worktrees. Read-only inventory completed; findings recorded above with `path:line` evidence.
- L3: Software-factory monorepo branch requires an explicit plan and approval before any target-repository edit. This document is the plan; no source file has been changed.
- L4: Reference research completed with primary sources. Barrels vs subpath exports, Rails service objects, and SwiftUI MVVM are contested and will not be adopted by citation alone.
- L5 (wave 1): T2, T3, T4 and T8 delivered in four work-unit commits (`b1abc8c`, `c8ebf7b`, `87d01a3`, `6cc466c`). Portfolio 37/37 tests, learn typecheck and lint green. T5 stopped before editing: prep-kit and the five apps disagree on `LEVEL_LABEL` semantics and on the per-app tagline fields, so a thin re-export would change rendered text. Awaiting the surface decision.
- L6: Pre-existing defect found during T5: `apps/reactnative-prep/src/app/lessons/page.tsx:72` renders prep-kit's i18n keys directly, so those badges show literal `level.junior` / `level.mid` text. Not caused by this work; needs its own fix.
- L7 (wave 2): T5 and T7 delivered in `0f7030d` and `151ab31`; T5 fixed the lessons badge defect as a side effect of the label change. T7 removed 1133 lines of duplicate routes; `apps/learn/public/_redirects` keeps old bookmarks working without JS, and `next build` plus `node tools/i18n-check.mjs` pass. A worker for T7 timed out mid-run and left the tree partially edited; the parent verified the partial result (3 redirect pages, no stale imports), completed the redirect file and ran the gates instead of relaunching.
- L8 (wave 2): T11 README rot fixed in `856028b`; the learn catalog duplication remains open.
