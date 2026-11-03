# Feature documents (ODD task logs)

One document per authorized feature: specs, task list, and a chronological log.
**Read this index first; open a document only when its row matches your task.**
The seven documents below total ~78 KB — reading them all to find the relevant
one is the most expensive navigation mistake available in this repo.

## How to use a document

- Fixed order: header, `## Specs` (`S#`), `## Tasks`, `## Log` last.
- Read until `## Log` before editing, and report which `S#` you covered.
- `L1` in the log is the user's original request, verbatim. Later entries are
  corrections, evidence, and decisions.
- Append log entries; never rewrite history. A requirement change appends its
  verbatim entry, rewrites only the affected `S#`, and reopens only its task.
- Add a row here when you create a document. This index is hand-maintained.

## Index

| Document | Objective | Branch (merged) | Status | Last commit |
|---|---|---|---|---|
| [`knockout.md`](knockout.md) | Knockout: offline-first, gamified field-sales product (Expo + Supabase + `sync-core`), built as job-target practice. Reads as the goal document — specs, tasks, log. | `feature/knockout-field-sales` (open) | **In progress** — T0. Docs and ADRs written; code not started. | `—` |
| [`architecture-deepening.md`](architecture-deepening.md) | Implement nine architecture-deepening candidates across the monorepo (18.7 KB — the largest; read selectively). | `feature/monorepo-deepening` (#125) | **Partial** — T2–T5 `needs_validation`; S7 blocked on a cross-host product decision. Read `## Log` before resuming. | `395a639` |
| [`architecture-fitness-functions.md`](architecture-fitness-functions.md) | Dependency-direction fitness checks plus the Node inventory script and its tests (13.2 KB). | `feature/architecture-fitness-functions` (#109) | **15 of 18 tasks checked**; 3 open. | `f0b0f0c` |
| [`expo-sdk-upgrade.md`](expo-sdk-upgrade.md) | Incremental Expo SDK 56 → 57 → 58 upgrade for `apps/portfolio`, Node ≥22.13, Router/web-export compatibility (4.7 KB). | `feature/monorepo-deepening` (#125) | **Open, not started** — T1 and T2 both `pending`; no source, manifest, or lockfile changed yet. | `395a639` |
| [`monorepo-deepening.md`](monorepo-deepening.md) | Delivery tracker for the same nine deepening candidates (5.6 KB) — the plan/status view. | `feature/monorepo-deepening` (#125) | **6 done, 1 pending, 1 closed** (T5 closed with zero edits after evidence refuted its premise). | `395a639` |
| [`software-factory.md`](software-factory.md) | Approval-gated, skill-first factory for standardizing monorepos and standalone projects (14.6 KB). | `feature/monorepo-deepening` (#125) | **Complete** — 6/6 tasks `status: complete`. | `395a639` |
| [`repo-organization.md`](repo-organization.md) | Repository organization across the monorepo with readability first: the `hud` split, the study-session state machine, the shared prep-kit level taxonomy, and the dead-code removals (9.4 KB). | `feature/repo-organization` (#127) | **10 of 11 tasks done**; T10 blocked on the missing Ruby toolchain (see its log). | `c685c16` |
| [`software-factory-full-workflow.md`](software-factory-full-workflow.md) | Extend the factory to the full Language → Planning → Review workflow (13.8 KB). | `feature/software-factory-full-workflow` (#126) | **Complete** — 5/5 checked. | `a97b3d3` |

## Not indexed here

Architecture decisions live in `docs/adr/` (0001 workspace dependency
boundaries, 0002 skill-first factory, 0003 complete factory workflow) and
point-in-time research in `docs/architecture/`.
