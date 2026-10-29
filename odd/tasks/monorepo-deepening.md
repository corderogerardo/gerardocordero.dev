# Feature: monorepo-deepening

Objective: implement the 9 deepening candidates from the 2026-10-15 architecture review. Branch: feature/monorepo-deepening. Delivery strategy: single-pr. Test runner: pnpm typecheck/lint/test (turbo); pawwalk-api via rails test; mobile via CI gates.

## Specs

- S1: "review my monorepo architecture and look for improving points on each project" — cover every workspace.
- S2: "explore all of them" — all 9 candidates in scope, grilled/verified.
- S3: "kick off subagents o multiple agents to finish the work faster" — parallelize with bounded writers on disjoint surfaces.
- S4 (T1): single SRS+streak home in prep-kit; portfolio+learn consume via deep file import `@gerardocordero/prep-kit/lib/srs` (NOT the barrel); grade-set at the seam keeps learn 2-button UI on unified math; Q2→(a) assumed from user "ok", reversible.
- S5 (T2): SceneTiles takes full tile data; no positional index coupling; same rendered output.
- S6 (T3): one flashcard shape (markdown-deck); legacy design-system-ui deck deleted if unused, migrated if used (measurement decides).
- S7 (T4): HomePageClient deepening — soft candidate; implement only what T2 makes concrete, else follow-up.
- S8 (T5): prep-wrapper deltas measured first; deepen or delete per evidence.
- S9 (T6): typed BookingAction seam in iOS AND Android (both stringly-typed); same behavior.
- S10 (T7): second adapter (fake) for Android repos; needs AuthRepository source (measurement).
- S11 (T8): root CONTEXT.md glossary (docs-only).
- S12 (T9): fitness check reports per-violation file impact; still list-based, no new deps.
- S13: each task pins behavior with tests; portfolio study-srs suite moves to prep-kit with the code.

## Tasks

- T1 (S4,S13): SRS+streak consolidation — route: delegated writer (batch 1). Status: done, commit b8db413. Loop green post-install (suite 17/17, typecheck+lint clean).
- T2 (S5): SceneTiles coupling — route: delegated writer (batch 1). Status: done, commit 93e7408 (incl. parent-applied second call site).
- T3 (S6): flashcard unification — route: delegated writer (batch 2). Status: done, commit 69b4624 (bridge maps simplified + both dead flashcards-data files deleted, zero importers verified).
- T4 (S7): HomePageClient — route: parent inline, after T2. Status: pending (soft scope).
- T5 (S8): prep wrappers — route: none. Status: closed, NO CHANGE. Evidence overruled the premise: pages import prep-kit directly (verified ios-prep + repo-wide grep for re-export shapes = zero hits outside shadcn-local patterns). App-owned depth (locale-data, prep.config, routing, deploys) justifies the apps as-is.
- T6 (S9): typed transition seam — route: delegated writer (batch 1). Status: done, commit bc28ac2 (Android module compiles under JDK 17; device builds = CI gate).
- T7 (S10): Android fake adapter — route: TBD. Status: needs grill (singleton source confirmed).
- T8 (S11): CONTEXT.md — route: delegated writer (batch 2, docs-only). Status: done, commit 9c1b2d9 (readback verified).
- T9 (S12): fitness impact output — route: delegated writer (batch 2). Status: done, commit 05efda6 (real RED→GREEN, 8/8 script tests, live audit clean).
- Seam check: full pnpm loop once after all writers; spot-check one command pre-delivery.

## Log

- L1 (user verbatim): "@improve-codebase-architecture review my monorepo architecture and look for improving points on each project"
- L2: report delivered to temp HTML; explorer map + parent spot-check (SceneTiles confirmed).
- L3 (user verbatim): "explore all of them" → grilling all 9, candidate 1 first.
- L4: Q1 settled — prep-kit single home (user: "ok continue"). Facts: learn fork renamed interface + dropped ease; prep-kit richest; ADR-0001 allows both new edges.
- L5: Q2→(a) assumed from user "ok" (deep-import + optional next peer); reversible on objection. Blocker fact resolved: srs.ts zero imports, barrel pulls React → deep imports only.
- L6: verification corrections — flashcards = 2 interfaces + bridge (not 3); fitness confirmed shallow (115 lines); Android shares string seam; streak copies identical; learn+portfolio lack prep-kit edge (grep).
- L7: user authorized implementation of all candidates with parallel agents (user verbatim S3 + "ok, lets continue the work, kick off subagents o multiple agents to finish the work faster"). Pre-existing dirty files .atl/skill-registry.md + cache are NOT mine; never commit them.
- L8 (batch 1 done): T1 writer first stopped on a phantom iOS-guide instruction (none existed; resumed, completed partial). T2 found 2nd call site page.tsx outside surfaces (parent applied). T6 needed WalkerScreen.kt surface amendment (parent-approved, in authorized S9 scope). Parent fixes: tsconfig paths mappings (expo/next ignore exports map), fork deletions, pnpm install (lockfile peer reshuffle verified frozen-clean). Loop: typecheck 0, lint 0, tests 35/35. Commits b8db413/93e7408/bc28ac2.
- L9 (batch 2 done): T3/T8/T9 all completed clean, no surface breaks. Extra find: second dead shim src/lib/flashcards-data.ts (parent-verified zero importers, deleted with legacy deck). Full loop green again. Commits 69b4624/9c1b2d9/05efda6. Left: grills for T4 (scope), T5 (deepen-vs-delete rule), T7 (fake design).
- L10: T5 closed with zero edits — direct evidence (pages import kit barrel directly; no re-export files exist) refuted the candidate premise. Correction recorded: measurement explorer's "pages re-export" phrasing was loose. T7 facts: no src/test dir in apps/android, but junit4 testImplementation already declared (turbine absent).
