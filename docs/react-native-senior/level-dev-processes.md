# Software Development Processes — Andersen matrix, junior→middle levels

## Interview questions

### Bug tracking systems
**They ask:** "Why do teams use a bug tracker like Jira instead of a spreadsheet or a Slack thread?"

A bug tracker exists to make work *visible, assignable, and accountable* — it turns "someone said something's broken" into a durable record with an owner, a status, and a history. That matters because on any team of more than one person, the expensive failures are dropped context and duplicated effort, not the coding. A ticket is the single source of truth: repro steps, environment, severity, who's on it, and what changed when it closed.

Concretely, a good ticket lets a bug travel through a workflow (Open → In Progress → In Review → Done) without a handoff meeting. It links to the branch and PR that fix it, so six months later `git blame` plus the ticket tells you *why* a line exists. Severity and priority let the team triage — a crash on checkout jumps the queue over a cosmetic misalignment.

**Say it:** "A tracker turns a vague complaint into an owned, searchable unit of work with status and history — that's what makes triage and accountability possible at team scale."
**Red flag:** "It's just a to-do list." That undersells it — the value is the audit trail and triage, not the checkbox. Say you use it to prioritize by severity and to link fixes back to the code that changed.

### Git fundamentals for teamwork
**They ask:** "Walk me through the basic Git operations you use every day and how branching lets a team work in parallel."

Version control exists so several people can change the same codebase without overwriting each other, and so any change is reversible. Git is *distributed* — everyone has the full history locally, commits are offline, and you sync explicitly with push/pull. The unit of change is a commit; the unit of parallel work is a branch.

The daily loop: `git pull` to get others' work, `git checkout -b feature/x` to branch off, edit, `git add` to stage, `git commit -m` to record, `git push` to share. Branching gives each task an isolated line of history, so an unfinished feature never destabilizes what everyone else builds on. You `git merge` (usually via a pull request) to bring a branch's changes back into main, and `git tag v1.2.0` to mark a release commit so you can always find exactly what shipped.

**Say it:** "Git is distributed, so I commit locally and sync deliberately — I branch per task to isolate work, then merge back through a PR, and tag the commits I release."
**Red flag:** Committing straight to main and treating branches as scary. Say branches are cheap and expected — one per feature or fix — and main stays releasable.

### Task estimation from a WBS
**They ask:** "How do you estimate the effort for a task you've been assigned?"

Estimation exists to make commitments plannable — it's the input that lets a team promise a date and spot when a task is secretly a project. The honest goal isn't a perfect number; it's a defensible range with the assumptions stated. Start by breaking the task down: a Work Breakdown Structure (WBS) splits it into pieces small enough to reason about — build the form, wire the API call, handle errors, write tests.

Estimate each leaf, not the whole, because small pieces are where your intuition is accurate; then sum them and add a buffer for the unknowns you named. For a login screen I'd size UI, validation, the auth request, error/loading states, and tests separately, then total them. If any single piece is fuzzy, that's a signal to spike it first rather than guess.

**Say it:** "I decompose the task into a WBS, estimate each small piece where my intuition is reliable, sum them, and state the assumptions — an estimate is a range with assumptions, not a promise."
**Red flag:** Giving one confident number for a big task. Say you break it down first; a single gut number for a whole feature is where estimates go wrong.

### Agile vs Scrum and Kanban
**They ask:** "What's the difference between Agile, Scrum, and Kanban?"

Agile is a *philosophy*, not a process — the value set from the Agile Manifesto: working software over documentation, responding to change over following a plan, short feedback loops over big up-front design. Scrum and Kanban are two concrete frameworks that implement those values, so the honest framing is "Agile is the why; Scrum and Kanban are two hows."

Scrum is timeboxed and cadence-driven: work is pulled into fixed-length sprints (commonly two weeks), with defined ceremonies (planning, daily standup, review, retro) and roles. You commit to a sprint scope and inspect-and-adapt at its boundary. Kanban is flow-based and continuous: no sprints, a visual board, and work-in-progress limits that pull the next item only when capacity frees up. Scrum suits feature teams shipping in batches; Kanban suits continuous or interrupt-driven work like support and ops.

**Say it:** "Agile is the mindset — short feedback loops and responding to change; Scrum delivers that in timeboxed sprints, Kanban delivers it as continuous flow with WIP limits."
**Red flag:** "Agile means no planning / no process." Agile is disciplined, just iteratively — say it front-loads feedback, not that it removes structure.

### SDLC models and choosing one
**They ask:** "What SDLC models do you know, and how do you decide which one fits a project?"

The SDLC (Software Development Life Cycle) is the sequence every project moves through — requirements, design, implementation, testing, deployment, maintenance — and the *model* is how you order and repeat those phases. Choosing well matters because the model encodes when you get feedback and how expensive change is: pick wrong and you either over-plan a moving target or under-plan a fixed one.

The primary models: **Waterfall** runs the phases once, in sequence — good when requirements are fixed and change is costly (regulated, hardware-adjacent work). **Iterative/Incremental** repeats the cycle on slices, delivering value early. **Agile** (Scrum/Kanban) is iterative with tight feedback — good when requirements will evolve, which is most product work. **V-model** pairs each build phase with a test phase for high-assurance systems. In practice I default to Agile for product apps because requirements move, and reserve Waterfall for genuinely fixed-scope, high-cost-of-change work.

**Say it:** "The model is a bet on how stable the requirements are — Waterfall when they're fixed and change is expensive, Agile when they'll evolve, which is most product work."
**Red flag:** "Waterfall is always bad, Agile is always better." Say it's context — Waterfall is right for fixed-scope, high-assurance work; Agile is right when feedback should drive the plan.

### Git repository administration
**They ask:** "Beyond commit and push — how do you configure a repo, inspect history, and undo changes safely?"

The senior distinction here is knowing which "undo" rewrites history and which doesn't, because that decides whether you break your teammates. **Revert** is safe on shared branches: `git revert <sha>` creates a *new* commit that inverts a bad one, preserving history. **Reset** rewrites history: `git reset` moves the branch pointer — `--soft` keeps changes staged, `--mixed` (default) unstages them, `--hard` discards them entirely. Reset is for your own local, unpushed work only.

For setup and inspection: `git init` / `git clone` create or copy a repo; `.gitignore` and `git config` (user, remotes, hooks) configure it. Import/export is `git clone`/`git remote add` to pull sources in and `git push`/`git archive` or bundles to get them out. To find *why* a line exists, `git blame <file>` annotates each line with the commit, author, and date that last touched it — the fastest route from "who wrote this and why" to the ticket behind it.

**Say it:** "Revert is a new inverse commit — safe on shared branches; reset rewrites history, so I only reset my own unpushed work. Blame tells me which commit owns each line."
**Red flag:** "I'd `reset --hard` to undo a bad commit on main." On a shared branch that rewrites everyone's history — use `revert`; reserve `reset --hard` for local commits nobody has pulled.

### Estimating complex projects
**They ask:** "How do you estimate a whole feature or release, not just a single task — and how do you defend the number?"

At project scale the goal shifts from "how long is this task" to "what's the schedule, the critical path, and where's the risk" — because the thing that slips a release is rarely the biggest task, it's the dependency chain. I still start with a WBS, but then I add structure: a **Gantt chart** lays tasks on a timeline with dependencies; the **critical path** is the longest dependent chain, and it sets the minimum schedule — shortening anything off the critical path buys you nothing.

To handle uncertainty I use **PERT**: for each task take optimistic (O), most likely (M), and pessimistic (P) estimates and weight them as (O + 4M + P) / 6, which pulls the estimate toward the likely case while pricing in the tail. I sanity-check totals against past velocity and team experience rather than trusting the spreadsheet, and I translate the estimate into what it implies — team size, phase and release scope, and where to spike the riskiest unknowns first.

**Say it:** "I estimate the WBS, find the critical path because that's what sets the schedule, and use PERT — (O + 4M + P) / 6 — to price in uncertainty, then validate against real velocity."
**Red flag:** Presenting a single date with false precision. Say you give a range driven by the critical path and PERT, and you check it against how the team has actually delivered before.

### Waterfall vs Agile and Scrum roles
**They ask:** "Compare the Waterfall and Agile life cycles, and describe how a Scrum team is structured."

The core trade is *when you find out you were wrong*. Waterfall runs phases once and in order — requirements → design → build → test → deploy → maintain — with each phase gated and signed off before the next. It's predictable and heavily documented, but feedback comes late: if the requirements were wrong, you learn it at the testing/deploy phase, when change is most expensive. Agile inverts that — it delivers working software in short iterations so feedback arrives every cycle and the plan bends to reality; the cost is less up-front certainty on final scope and date.

A Scrum team has three roles. The **Product Owner** owns the backlog and priorities — the *what and why*. The **Scrum Master** is a facilitator who removes blockers and protects the process — not a manager. The **Developers** (the Scrum Guide's current term — it dropped "Development Team" in 2020) are cross-functional and self-managing — they decide *how* and *forecast* the sprint's work rather than formally committing to a fixed scope. Ceremonies (planning, daily standup, review, retro) keep the loop tight.

**Say it:** "Waterfall gates phases and gets feedback late; Agile iterates and gets it every cycle. In Scrum the PO owns priorities, the Scrum Master removes blockers, and a cross-functional team owns the how."
**Red flag:** Calling the Scrum Master the team's boss. Say they're a facilitator who clears impediments — the team is self-organizing and the Product Owner, not the Scrum Master, sets priorities.
