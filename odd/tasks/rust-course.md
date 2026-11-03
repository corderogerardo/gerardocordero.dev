# Feature: Rust course for PawWalk Academy

Objective: add a complete Rust course to `apps/learn/` — language fundamentals, ownership, traits,
testing, async, the Axum framework, sqlx/PostgreSQL, auth and production deployment — as a first-class
course alongside the existing eight. Branch: `feat/learn-rust-course`. Delivery: `single-pr`.
Verification: `node tools/validate.mjs` (all dirs), `node tools/i18n-check.mjs`, `node --test`,
`pnpm typecheck`, `pnpm lint`, and `next build` for `apps/learn`.

## Specs

- S1: "dentro de @apps/learn/ puedes crear la version de rust para aprender rust" — a `lessons-rust/`
  course built on the existing lesson engine, reachable at `/en/learn/rust` and `/es/learn/rust`.
- S2: "quiero el sitio completado" — the course is registered everywhere the engine needs it, so the
  picker, routes, progress keys, highlighting and token ramps all work.
- S3: "con todo lo relacionado a rust, frameworks, aprender el framework" — language fundamentals plus
  a real framework track: Axum (router, extractors, error mapping, middleware).
- S4: "como trabajar con tests" — dedicated testing module (unit, integration, doctests, sqlx tests).
- S5: "ejemplos en produccion" — production module: config, tracing, graceful shutdown, multi-stage
  container; plus sqlx, auth and a service rebuild.
- S6: "quiero algo bastante completo" — 14 modules / 41 lessons / 210 steps, each lesson ending on a
  quiz, exercise or checklist.

## Tasks

| ID | S# | Route | Status |
|----|----|-------|--------|
| T1 | S2 | Engine registration: `rust` in `KNOWN_LANGS`, `LangId` unions, highlighter, `COURSE_IDS`, `COURSES`, both homepages, CSS ramps | done |
| T2 | S1,S2 | `lessons-rust/` modules 00–04 (welcome, basics, ownership, structs/enums, traits/generics) | done |
| T3 | S3,S4 | Modules 05–09 (errors, collections/iterators, modules/cargo/testing, concurrency/async, Axum) | done |
| T4 | S5 | Modules 10–13 (PawWalk API, sqlx, auth, production) | done |
| T5 | S2 | Docs: `apps/learn/README.md` and root `AGENTS.md` course lists + registration recipe | done |
| T6 | S1–S6 | Gates: validate (all dirs + token parity), i18n, `node --test`, typecheck, lint, `next build` | done |

## Log

- L1 (user verbatim): "dentro de @apps/learn/ puedes crear la version de rust para aprender rust,
  puedes crear todo en un worktree quiero el sitio completado, con todo lo relacionado a rust,
  frameworks, aprender el framework, como trabajar con tests, ejemplos en produccion, quiero algo
  bastante completo"
- L2: Mapped the lesson contract from `scripts/build-data.mjs`, `tools/validate.mjs` and
  `lessons-go/FORMAT-GO.md`. `rust` was absent from `KNOWN_LANGS`, both `LangId` unions, the
  highlighter and the token ramps, so the engine work came first (T1).
- L3: 14 modules / 41 lessons / 210 steps written. Two format traps hit and fixed: a backtick inside
  a `String.raw` code field terminates the template, and an empty string in an `md` array fails the
  validator's `isBlocks` check.
- L4: Gates green — validate (all nine dirs, token parity passed), i18n 1226 units, `node --test` 23
  passing, typecheck 8/8, lint 8/8 (0 errors), `next build` emitted 25 route files under
  `out/en/learn/rust/` and wrote `public/data/{en,es}/rust.json`.
