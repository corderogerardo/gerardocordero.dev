# Software Development Processes — Andersen S2 (5 skills)

Process maturity: SDLC-aware planning, estimation with historical data and parametric models, Git as infrastructure, and scrum/kanban end-to-end. These are asked to confirm you can *lead* delivery, not just code inside it.

> Part of the [Andersen React Native S2 study guide](README.md). Drill these with [flashcards.md](flashcards.md).

## Processes

### Process Planning (SDLC)
**They ask:** "How does your choice of SDLC model change where testing and code review live, and how do you scale the process when the project grows from one team to several?"

The SDLC model decides *when* you learn a change is wrong — and that cost difference is the whole argument for iterative models. In waterfall, testing is a phase: unit tests and review happen after a long build stage, so defects are found weeks after they were written and the fix cost is maximal. In agile/iterative models, testing and review are merge gates, not phases: every pull request runs unit tests in CI and gets reviewed before integration, so the feedback loop is hours, not weeks. Defining the process means writing entry/exit criteria explicitly — "no merge without green CI and one approving review" is a policy, not a habit. Hybrids are the real world: a fixed-scope regulated deliverable can keep waterfall-style stage gates for compliance while running agile internally.

Scaling to multiple teams: split by feature verticals (each team owns a slice end to end, not a layer), make cross-team APIs contract-first so teams integrate against a spec instead of each other's schedules, keep one shared CI gate so quality criteria don't fork per team, and add an RFC/ADR process so architectural decisions are written down instead of re-litigated in every review. Trunk-based development with feature flags keeps integration continuous even with many contributors.

**Say it:** "The SDLC model determines how late you discover defects — I define unit tests and review as per-merge exit criteria so quality is enforced continuously, and I scale by feature verticals with contract-first APIs and shared CI gates."
**Red flag:** Reciting the six waterfall phases as *the* SDLC — the interviewer wants to hear how the chosen model repositions testing and review, so answer in terms of feedback-loop length and merge gates, not phase names.

### Bug tracking systems
**They ask:** "Beyond creating tickets, how do you actually use boards, dashboards, and plugins in Jira or a similar tracker to run a project?"

A tracker is the team's shared source of truth about state — used well it replaces status meetings; used badly it's a graveyard of stale tickets. Three layers matter. **Workflow:** issues move through defined states (Open → In Progress → In Review → Done) via transitions, and a senior engineer treats the workflow as a contract — a ticket in "In Review" with no open PR is a lie the whole team pays for. **Boards** are views over that workflow: a Scrum board scopes to the sprint and drives the burndown; a Kanban board shows continuous flow with WIP limits per column. **Dashboards** aggregate across issues — burndown, cycle time, created-vs-resolved bug trends — and are how you spot a quality regression before a release, not after. **Plugins/integrations** close the loop with development: GitHub/Bitbucket links attach commits and PRs to issues, CI status surfaces on the ticket, and test-management plugins (e.g. Xray/Zephyr) tie test runs to requirements.

The senior discipline underneath the tooling: triage incoming bugs promptly, and separate **severity** (technical impact — crash, data loss) from **priority** (business urgency — a cosmetic bug on the checkout screen can outrank a crash in an admin tool). Link fixed bugs to fix versions so release notes and regression scope are queryable.

**Say it:** "Boards show flow, dashboards show trends, plugins connect tickets to code — but the discipline that makes any of it work is fast triage and keeping severity and priority as separate fields."
**Red flag:** Treating severity and priority as synonyms — the interviewer is listening for the distinction; give the crash-in-admin-tool vs. cosmetic-bug-in-checkout example.

### Version Control System (Git)
**They ask:** "You're asked to define the version-control infrastructure and policy for a new mobile project. What do you set up, and which advanced Git operations do you actually use?"

Version-control infrastructure is a policy decision before it's a tooling decision — the branching strategy determines integration frequency, which determines merge pain. For a React Native project I choose trunk-based development: short-lived feature branches merged to `main` behind CI, with a release branch cut per store submission — because a mobile release is a frozen artifact under Apple/Google review, you need a branch to hotfix while `main` moves on. GitFlow's long-lived `develop` adds ceremony that mostly manufactures merge conflicts; it earns its keep only when you must maintain several released versions in parallel.

The policy document I write: protected branches (no direct pushes to `main`, required CI + review), a commit-message convention (Conventional Commits, which enables automated changelogs), `CODEOWNERS` for routing reviews, and signed commits where provenance matters.

Revision-graph operations I use routinely: `rebase -i` to squash and reorder before merge, `cherry-pick` to move a hotfix onto the release branch, `bisect` to binary-search the commit that introduced a regression, and `reflog` as the safety net that makes rebase non-destructive. For patches across repos or offline review:

```bash
git format-patch -1 <sha>       # commit -> .patch file (with metadata)
git am 0001-fix.patch           # apply preserving author + message
git diff > change.diff && git apply change.diff   # diff-only variant
```

**Say it:** "I run trunk-based development with a release branch per store submission, enforced through protected branches, CODEOWNERS, and required CI — and I treat reflog as the reason rebase is safe."
**Red flag:** Proposing GitFlow by default because it's the famous diagram — say trunk-based with short-lived branches, and reserve GitFlow for maintaining multiple released versions in parallel.

### Estimations
**They ask:** "A pre-sale needs an estimate for an app you've never seen. What does your evaluation report contain, and how do you use historical data?"

An estimate is a decision-support document, not a number — a bare number hides the assumptions that make it wrong, and the business commits to the hidden version. My evaluation report always contains four parts: the numbers as a **range with a confidence level**, the **assumptions** the numbers depend on ("API is documented and stable", "designs are final"), the **risks** with their cost if they fire ("no store account yet: +1–2 weeks for review setup"), and the **explicit exclusions** ("no offline mode, no tablet layouts") — exclusions are what prevent scope disputes later.

Techniques, in the order I reach for them: **three-point/PERT** — estimate optimistic, most-likely, pessimistic and weight them `(O + 4M + P) / 6` — forces you to price uncertainty instead of averaging it away. **Historical data** ("yesterday's weather"): calibrate story points against the team's actual velocity, and compare the project to analogous past projects. **Parametric models** derive cost per unit — per screen, per API endpoint, per integration — from those past projects, which is exactly what pre-sale needs: multiply counted units by historical unit cost to get a defensible coarse range fast. Pre-sale estimates stay coarse by design; the report says so and prices the unknowns with an explicit buffer.

Then close the loop: track estimate-versus-actual per project, because an uncalibrated estimator repeats the same optimism forever.

**Say it:** "An estimate is a range plus assumptions, risks, and exclusions — I build it with PERT and per-unit costs from historical projects, and I track estimate-versus-actual so the next one is calibrated."
**Red flag:** Giving a single confident number — pad or not, it signals you don't know estimates are probability distributions; always answer with a range and the assumptions it rests on.

### Development methodologies
**They ask:** "Walk me through Scrum planning from start to end — artifacts and events — and then do the same for Kanban. When would you pick each?"

Scrum and Kanban solve different problems: Scrum optimizes for predictable delivery of planned work in fixed timeboxes; Kanban optimizes for flow of continuously arriving work. A senior answer walks both end to end.

**Scrum**, one sprint: 1. The Product Owner keeps an ordered **product backlog**; **refinement** (ongoing) sizes and clarifies upcoming items. 2. **Sprint planning** — the team pulls items into the **sprint backlog** against a sprint goal, sized by historical velocity. 3. **Daily scrum** — 15 minutes to inspect progress toward the goal and surface blockers, not a status report to a manager. 4. The sprint produces the **increment**, which must meet the **Definition of Done** — DoD is the quality contract (tested, reviewed, releasable), not a formality. 5. **Sprint review** — inspect the increment with stakeholders. 6. **Retrospective** — inspect the process itself. Roles: Product Owner (what and why), Scrum Master (process health), Developers (how).

**Kanban** has no fixed iterations: visualize the workflow on a board, set **WIP limits** per column so the system pulls work instead of pushing it, and manage by flow metrics — **cycle time**, **throughput**, and the **cumulative flow diagram**, which exposes bottlenecks as widening bands. Planning is continuous replenishment of the queue.

Fit: Scrum for feature development that benefits from cadence and forecasting; Kanban for support, maintenance, and interrupt-driven streams. Most real teams run a hybrid — sprints for features, a WIP-limited expedite lane for production bugs.

**Say it:** "Scrum manages work in timeboxes with velocity as the forecast; Kanban manages flow with WIP limits and cycle time — I pick by whether work arrives in plannable batches or continuously."
**Red flag:** Describing the daily scrum as a status meeting for the manager — say it's the developers' own inspection of progress toward the sprint goal, or you sound like you've only experienced Scrum done badly.
