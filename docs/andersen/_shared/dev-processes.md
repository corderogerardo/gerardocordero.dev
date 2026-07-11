# Software Development Processes — Andersen foundations

### Why bug trackers exist
**They ask:** "What's the point of a bug tracking system like Jira or Redmine — why not just a spreadsheet or Slack messages?"

The reason isn't storing bugs, it's making work *visible and accountable* so nothing falls through the cracks and everyone shares one source of truth. A tracker gives every defect or task a stable ID, an owner, a status, and a history — so priority conversations happen against real state instead of memory. That's what lets a team, a QA engineer, and a PM coordinate without stepping on each other.

Mechanically it enforces a lifecycle: a ticket moves through states (open → in progress → in review → resolved → closed), carries reproduction steps and severity, and links to the commit or PR that fixed it. Concretely: QA files a crash with steps and a build number, I pick it up, my PR references the ticket ID so the fix is traceable, and when it merges the ticket auto-transitions. Six months later anyone can see *why* that change was made.

**Say it:** "A tracker turns work into shared, searchable state — owner, status, history, and a link to the fix — so coordination and accountability don't depend on anyone's memory."
**Red flag:** "It's just a to-do list." That misses the point — the value is traceability and shared visibility across roles, not storage. Say the tracker is the team's single source of truth, linked to the code that resolves each item.

### Git branching and merging
**They ask:** "Walk me through the core Git operations your team relies on day to day."

Git exists so a team can work in parallel without overwriting each other and can always reconstruct how the code got here. The unit that makes that safe is the branch: you isolate a change, and integrate it deliberately. That isolation is why ten people can touch the same repo the same day.

The everyday loop: `clone`/`pull` to sync, `branch` + `checkout` (or `switch`) to start isolated work, `add` + `commit` to snapshot, `push` to share, and a pull request to merge back. `merge` brings another branch's changes in — a fast-forward when history is linear, a merge commit when both sides moved. `tag` marks a fixed point like a release (`v1.2.0`) so you can always check out exactly what shipped. To pull one specific commit from another branch without merging the whole thing, `cherry-pick` it. Concretely: I branch `feature/login` off `main`, commit as I go, push, open a PR, and merge after review — `main` stays releasable the whole time.

**Say it:** "Branches isolate work, commits snapshot it, PRs integrate it, and tags pin releases — so parallel work never costs us a releasable main."
**Red flag:** Committing straight to `main` or treating branches as optional. On any team that serializes everyone's work and makes review impossible — say every change goes through a branch and a PR.

### Estimating from a WBS
**They ask:** "How do you estimate the effort for a task once you have a work breakdown structure?"

An estimate is a commitment others plan around, so the goal is a defensible number, not a guess — and a WBS makes it defensible by forcing you to estimate small, known pieces instead of one scary blob. Decomposition is the whole trick: you can size a two-hour subtask honestly; you can only wave at "build the payments feature."

The method: take the WBS leaves, estimate each in ideal effort (hours or points), and roll them up — the sum plus a buffer for integration and the unknowns you can name. I estimate against my own past velocity on similar work, not best-case. Concretely, "add password reset" breaks into email template, token generation, expiry handling, the reset endpoint, and tests; each is a few hours, and the total is far more trustworthy than a single top-line number because I can point at every piece.

**Say it:** "I estimate the leaves of the WBS, not the epic — small known pieces summed up, plus a named buffer for integration, sized against my real velocity."
**Red flag:** Giving one number for a big feature with no breakdown. It reads as optimism and always slips — say you decompose first, then estimate and roll up.

### Agile vs Scrum vs Kanban
**They ask:** "What's the difference between Agile, Scrum, and Kanban?"

The distinction matters because people use them interchangeably and then argue past each other. Agile is a *philosophy* — the 2001 manifesto's values: working software over documentation, responding to change over following a plan, delivered iteratively with tight feedback. Scrum and Kanban are two concrete *frameworks* that implement those values differently.

Scrum is timeboxed and cadence-driven: work is planned into fixed-length sprints with defined roles and ceremonies, and you commit to a sprint scope. Kanban is flow-driven and continuous: no sprints, you visualize work on a board and limit work-in-progress per column so bottlenecks surface, pulling new work only as capacity frees up. Concretely: choose Scrum when the team benefits from a predictable rhythm and planning boundaries; choose Kanban for streams of unplanned or interrupt-heavy work like support or ops, where fixed sprints fight reality.

**Say it:** "Agile is the mindset; Scrum implements it with timeboxed sprints and roles, Kanban with continuous flow and WIP limits — I pick the framework by whether the work is plannable or interrupt-driven."
**Red flag:** Calling Agile a methodology or saying "we do Agile" to mean "we have standups." Name it as a set of values, then the framework you actually run.

### Choosing an SDLC model
**They ask:** "What SDLC models do you know, and how do you pick one for a project?"

The model is a bet on how much you'll learn *during* the build, so picking it is a risk decision, not a preference. The primary models: Waterfall runs sequential phases (requirements → design → implementation → testing → deployment → maintenance) with each gated on the last; iterative/incremental builds in repeated cycles; Agile is short iterations with continuous feedback; the V-model pairs each build phase with a matching test phase; the spiral model is iterative with explicit risk analysis each loop.

The choice follows the requirements' stability. Concretely: I'd use Waterfall where scope is fixed and change is expensive — a regulated or contractually-specified system where up-front sign-off is required. I'd use Agile where requirements will evolve and early user feedback is worth more than a locked plan — most product work. The senior move is naming the trade-off out loud rather than defaulting.

**Say it:** "I pick the SDLC by requirement stability — Waterfall when scope is fixed and change is costly, Agile when I expect to learn and re-plan as we ship."
**Red flag:** "Agile is always better." That's dogma — say Waterfall still wins for fixed-scope, sign-off-driven, or regulated work, and match the model to the risk.

### Boards, dashboards, and plugins
**They ask:** "How do you actually use boards, dashboards, and plugins in a tool like Jira?"

These three exist for three different audiences, and knowing which is which is the tell. The board is for the *team's* daily flow — columns are workflow states, cards are work, and it's where standups happen and blockers surface. The dashboard is for *reporting and stakeholders* — configurable widgets (burndown, velocity, open-vs-resolved, sprint health) that answer "are we on track?" at a glance. Plugins extend the tool to your process — CI/CD status, time tracking, test-management, or custom automation rules.

Concretely: my team works the board through the sprint, the PM watches a dashboard with a burndown and a bug-trend chart, and a plugin links each ticket to its GitHub PR and moves the card to "In Review" automatically when the PR opens. The board drives work, the dashboard reports on it, the plugins remove manual bookkeeping.

**Say it:** "Board for the team's flow, dashboard for stakeholder reporting, plugins to wire the tool into our CI and kill manual status updates — three audiences, three tools."
**Red flag:** Treating the board and dashboard as the same thing. They serve different people — one drives daily work, the other answers "are we on track?"

### Reset vs revert
**They ask:** "What's the difference between git reset and git revert, and when do you blame a file?"

This is the classic "did you rewrite shared history?" question, and getting it wrong breaks teammates. `revert` creates a *new* commit that undoes a previous one — history is preserved and nothing is rewritten, so it's the safe choice on shared branches like `main`. `reset` moves the branch pointer backward, rewriting history: `--soft` keeps changes staged, `--mixed` (default) keeps them in the working tree unstaged, `--hard` discards them entirely. Because reset rewrites history, you only use it on your own unpushed work.

Blame (`git blame`, a.k.a. annotate) shows, line by line, which commit and author last touched it — the fastest way to find the context or the change that introduced a behavior. Concretely: to undo a bad commit already on `main`, I `revert` it so the fix is itself a traceable commit; to un-stage or reshape my local commits before pushing, I `reset`; to understand *why* a suspicious line exists, I `blame` it and read that commit's message.

**Say it:** "Revert to undo safely on shared branches — it's a new commit; reset only on my own unpushed work because it rewrites history; blame to find who and why per line."
**Red flag:** Suggesting `reset --hard` on a shared branch to "clean up." That rewrites history everyone else has — force-pushing it corrupts their clones. Reach for `revert` on anything already pushed.

### PERT and critical path
**They ask:** "How do you estimate a large, complex project — beyond summing task hours?"

At project scale the risk isn't any single task, it's the *dependencies and uncertainty*, so estimation becomes about schedule and confidence, not just effort. I start from the WBS, then use a Gantt chart to lay tasks against time with their dependencies, and find the critical path — the longest chain of dependent tasks, which sets the minimum project duration. Anything on the critical path directly moves the end date; slack elsewhere doesn't.

For uncertainty I use PERT: for each task take optimistic (O), most likely (M), and pessimistic (P) estimates and weight them as (O + 4M + P) / 6, which pulls the number toward reality instead of best-case. I sanity-check every estimate against personal and company history on similar work, and from the critical path and effort I derive the team size and schedule. Concretely: two features may each take a week, but if one blocks the other the critical path is two weeks — and that dependency, not the raw hours, is what I flag to the PM.

**Say it:** "I estimate with a WBS, map dependencies on a Gantt, find the critical path for the real timeline, and PERT-weight each task to fold in uncertainty — then reconcile against historical data."
**Red flag:** Summing hours and calling it a schedule. That ignores dependencies and parallelism — name the critical path as what actually sets the delivery date.

### Waterfall lifecycle and Scrum roles
**They ask:** "Contrast the Waterfall and Agile life cycles, and describe the Scrum team and its roles."

The core contrast is *when* you commit to scope. Waterfall's life cycle is sequential and front-loaded — requirements, design, implementation, testing, deployment, maintenance — each phase completed and signed off before the next; change late is expensive because you're unwinding finished phases. Agile's life cycle is iterative — each short cycle carries a slice through design, build, and test to working software, so you re-plan every iteration on real feedback. Waterfall optimizes for predictability and up-front certainty; Agile optimizes for adaptability.

Scrum defines three accountabilities. The Product Owner owns the *what* — the backlog and its priority, representing the business. The Scrum Master owns the *process* — facilitating ceremonies, removing impediments, coaching; a servant-leader, not a manager. The Developers own the *how* — a cross-functional team that self-organizes to turn backlog items into a done increment each sprint. Concretely: when priorities clash mid-sprint, the PO decides what's most valuable, the Scrum Master protects the team from churn, and the developers decide how to build it.

**Say it:** "Waterfall commits scope up front and moves once through the phases; Agile commits a slice per iteration and re-plans on feedback — and in Scrum the PO owns the what, the Scrum Master the process, the developers the how."
**Red flag:** Calling the Scrum Master a project manager who assigns work. That inverts the role — say servant-leader who removes blockers while the team self-organizes.

### Versioning infrastructure and patches
**They ask:** "How would you set up and govern version control infrastructure for a team — including reading history and applying patches?"

At a senior level version control is *infrastructure and policy*, not just personal commands — the goal is a repo that scales safely across many contributors. That means designing a branching strategy (trunk-based or a GitFlow-style release model), protecting key branches so nothing merges without review and green CI, and writing it down as a policy document: naming conventions, commit-message format, who can merge, how releases are tagged. The policy is what keeps history readable when the team grows.

Operationally I lean on history and patch tooling: the revision graph and `git log` (with `--graph`, `--oneline`, or filtered by author/path) to trace how and why code changed, `git bisect` to pinpoint a regression, and patches for moving changes outside the normal push flow — `git format-patch` to export commits and `git apply` or `git am` to apply them, e.g. sharing a fix for a repo you can't push to or backporting a specific commit to a release branch. Concretely: I'd protect `main`, require PRs plus passing CI, tag every release, and use `format-patch`/`am` to backport a hotfix cleanly onto an older supported version.

**Say it:** "I treat VCS as governed infrastructure — a documented branching strategy, protected branches with required review and CI, tagged releases, and patches for backports the normal flow can't reach."
**Red flag:** Only listing commands with no policy or protection. Ungoverned repos rot fast at scale — lead with branch protection, review gates, and a written policy, then the tooling.

### Scaling process: reviews and tests
**They ask:** "As a project scales, how do you define the code-review and unit-testing process within your SDLC?"

The point of formalizing these is that quality practices that work implicitly on a three-person team silently fail at thirty, so a senior defines them as *process*, not habit. Scaling the SDLC means the model absorbs more people without losing feedback speed — for review and testing that means making the standard explicit and automated so it doesn't depend on who's on the PR.

For code review I define what a PR must satisfy before merge: small focused diffs, at least one approving reviewer, green CI, and a checklist for correctness, security, and tests — enforced by branch protection so it's non-negotiable, not a favor. For unit testing I define where it lives in the flow — tests written with the code, run in CI on every PR, with a coverage expectation on new code and a rule that a bug fix ships with a regression test. Concretely: on a large team I'd gate merge on CI + one approval, require tests for new logic, and frame review as helping the author ship, not policing them — that's what keeps velocity and quality together as headcount grows.

**Say it:** "I make review and testing explicit and automated — required approval, green CI, tests-with-code, regression test per bug fix — so quality is enforced by the pipeline, not by who happens to review."
**Red flag:** "Everyone just reviews carefully and writes tests." Good intentions don't scale — define the gate in CI and branch protection so the standard holds regardless of who's on the PR.

### Evaluation reports and parametric models
**They ask:** "How do you produce a project estimate at the pre-sale phase, with risks and assumptions documented?"

Pre-sale estimates are made on the least information and carry the most commercial risk, so the deliverable isn't a number — it's a *reasoned evaluation report* the client and sales can trust. It states the assumptions the estimate depends on (scope boundaries, team size, third-party dependencies), a confidence range rather than a single figure, and both technical risks (unknown integrations, new tech) and organizational risks (unclear requirements, client availability) with their impact. Naming what could break is a seniority signal, not a weakness.

To ground the number I lean on historical data from comparable past projects and parametric models — deriving effort from measurable size drivers (screens, endpoints, integrations) times a rate calibrated on real past delivery, rather than gut feel. Concretely: for a new app pre-sale I'd size by feature count against a similar shipped project, present a range with the assumptions that widen or narrow it, and list the top risks with mitigations — so the client sees the reasoning, and we're covered when scope shifts.

**Say it:** "A pre-sale estimate is an evaluation report, not a number — assumptions stated, a confidence range, technical and organizational risks named, and the figure grounded in historical data and parametric sizing."
**Red flag:** Giving a single confident number at pre-sale with no assumptions or risks. It sets up a fight when scope moves — present a range, the assumptions behind it, and the risks up front.

### Scrum and Kanban artifacts and events
**They ask:** "Run me through Scrum and Kanban end to end — their artifacts and events."

Both are Agile frameworks, but their artifacts and events reveal the core difference: Scrum organizes around *timeboxes*, Kanban around *flow*. Knowing both cold lets you pick and run the right one.

Scrum's artifacts are the Product Backlog (everything, prioritized by the PO), the Sprint Backlog (the slice committed for this sprint plus the plan), and the Increment (the done, potentially shippable output). Its events, all timeboxed: Sprint Planning (pull and plan the sprint's work), the Daily Scrum (a short daily sync on progress and blockers), the Sprint Review (demo the increment to stakeholders for feedback), and the Sprint Retrospective (inspect and improve the process). Kanban has no sprints: its artifact is the Kanban board with explicit WIP limits per column, and its "events" are continuous — pulling work as capacity frees up and reviewing flow metrics like cycle time and cumulative flow to find bottlenecks, rather than planning in fixed batches. Concretely: Scrum answers "what will we deliver this sprint?"; Kanban answers "where is work piling up right now, and how fast does it flow?"

**Say it:** "Scrum plans in timeboxed sprints with a backlog, planning, daily, review, and retro; Kanban runs continuous flow on a WIP-limited board measured by cycle time — timebox versus flow is the whole distinction."
**Red flag:** Describing Kanban as "Scrum without estimates" or bolting sprints onto it. Kanban's engine is WIP limits and pull-based flow — name those, not the absence of Scrum's ceremonies.
