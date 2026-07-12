# Agile — Scrum, Kanban, and scaling

### Agile Methodologies Overview
**They ask:** "What are the main Agile software development methodologies, and how does a BA fit into them?"

Agile isn't one process — it's a family of frameworks built on the same value set (working software over documentation, responding to change over following a plan), and the BA's job shifts depending on which one a project runs. Scrum structures work into fixed-length sprints with defined roles and ceremonies; Kanban is a continuous flow model with no fixed iterations, just a visualized board and WIP limits; scaled frameworks (SAFe, LeSS, Nexus) coordinate that same rhythm across multiple teams on one product.

The reason this matters in an interview: naming "Scrum" isn't enough — an interviewer wants to see that you pick the framework to fit the problem, not out of habit. A single small team with a stable backlog and a client who wants predictable delivery dates fits Scrum. A support/maintenance team fielding unpredictable incoming work fits Kanban better than sprints.

**Say it:** "I don't default to Scrum — I match the framework to the work: Scrum for a team that can commit to a stable sprint scope, Kanban for continuous, unpredictable flow, and a scaled framework only once multiple teams share one backlog."
**Red flag:** Treating "Agile" and "Scrum" as synonyms. Scrum is one Agile framework among several — conflating them signals you've only worked one flavor of Agile and haven't reasoned about why.

### What Scrum Is
**They ask:** "What is Scrum, at a basic level?"

Scrum is a framework for delivering work in short, fixed-length iterations called sprints (typically one to two weeks), each ending in a potentially shippable increment. The point of the fixed timebox is fast, regular feedback: instead of discovering at the end of a six-month project that the requirements were wrong, the team and stakeholders inspect real working software every sprint and adapt.

It rests on three pillars — transparency (work and progress are visible to everyone), inspection (regular checkpoints to catch problems early), and adaptation (adjusting the plan based on what inspection reveals). As a BA you feed the backlog that drives each sprint and represent the "what" the team is building against.

**Say it:** "Scrum delivers in short, fixed sprints so the team and stakeholders inspect real working software regularly and adapt the plan — that's the whole point of the timebox, not just a scheduling convention."
**Red flag:** Describing Scrum purely as "meetings and a board." The meetings and board are the mechanics; the reason they exist is fast feedback and adaptation.

### Scrum Roles, Artifacts, and Ceremonies
**They ask:** "Walk me through the roles, artifacts, and ceremonies in Scrum."

The Scrum Team has exactly three accountabilities, and each closes a specific gap: the **Product Owner** owns the "what" and prioritizes the backlog so the team never has to guess what matters most; the **Scrum Master** owns the process and removes blockers so the team can focus on delivery; the **Developers** own the "how" and are self-organizing. A BA typically works closest to the Product Owner, sometimes holding parts of that role directly.

The artifacts track the same three things at different zoom levels: the **Product Backlog** (everything that could be built, prioritized), the **Sprint Backlog** (the Developers' plan for achieving the Sprint Goal — what they'll build and how), and the **Increment** (the working result). The ceremonies are the checkpoints where transparency and inspection actually happen — planning, daily standup, review, and retrospective.

**Say it:** "Product Owner owns priority, Scrum Master owns process, the team owns delivery — and the backlog, sprint backlog, and increment are the same plan viewed at three different zoom levels."
**Red flag:** Calling the Scrum Master "the project manager." Scrum deliberately has no PM role — the Scrum Master serves the team and removes impediments, they don't assign work or own the timeline.

### Running Sprint Ceremonies as a BA
**They ask:** "You've run daily standups and retrospectives on a project — what does that actually look like, and what's each ceremony for?"

Each ceremony answers a different question, and running them well means keeping that question in focus instead of letting the meeting drift. Sprint planning answers "what can we commit to and why" — the BA walks the team through prioritized, refined backlog items so effort estimates are grounded in real understanding. The daily standup answers "are we on track" in under fifteen minutes — each person reports progress, plan, and blockers, not a status report to the Scrum Master.

Sprint review answers "did we build the right thing" — a demo to stakeholders that produces real feedback, not a rehearsed presentation. The retrospective answers "how do we get better" — the team owns naming what to keep, drop, or change, and a BA facilitating one has to protect it from turning into blame.

**Say it:** "Each ceremony maps to one question — planning is 'what and why,' standup is 'are we on track,' review is 'did we build the right thing,' retro is 'how do we improve' — and keeping that question in focus is what stops a ceremony from becoming a wasted meeting."
**Red flag:** Letting standup become a status report to a single person, or letting retro turn into blame. Both kill the psychological safety the ceremony depends on.

### Scrum Metrics That Matter
**They ask:** "How do you evaluate whether a Scrum team is performing well?"

Velocity — the average story points a team completes per sprint — is the most common metric, but its real value is *forecasting*, not judging performance: a stable velocity lets you predict how many sprints a given backlog will take. Comparing velocity across different teams, or treating a rising number as inherently "better," is a trap — it invites gaming (inflated estimates) and ignores that velocity is relative to one team's own estimation scale.

A burndown chart tracks remaining work against time within a sprint, showing whether the team is on pace to finish what it committed to; a burnup chart tracks completed work against total scope, which is more honest when scope changes mid-sprint since it doesn't hide added work the way a burndown can.

**Say it:** "Velocity is for forecasting how much a specific team can commit to next sprint, not a productivity score to compare across teams — comparing it invites gamed estimates instead of honest ones."
**Red flag:** Using velocity to compare two different teams' performance. Story points aren't a standardized unit across teams — that comparison is meaningless and incentivizes inflation.

### What Kanban Is
**They ask:** "What is Kanban?"

Kanban is a method for visualizing and managing work as a continuous flow rather than fixed iterations — work items move through columns on a board (e.g. To Do → In Progress → Done) and new work is pulled in as capacity frees up, instead of being batched into a sprint. There's no prescribed roles or ceremonies; it's a set of principles layered onto whatever process already exists.

The core idea is limiting **work in progress (WIP)** so the team finishes what it starts before pulling more in, which surfaces bottlenecks immediately instead of hiding them behind a full backlog of half-started work.

**Say it:** "Kanban visualizes work as continuous flow and limits WIP so bottlenecks show up immediately instead of hiding behind a pile of half-finished tasks — no fixed iterations, no prescribed roles."
**Red flag:** Describing Kanban as "just a board." The board is the visualization; the actual discipline is the WIP limit — a board without an enforced WIP limit isn't really Kanban.

### Kanban vs Scrum
**They ask:** "What's the difference between Kanban and Scrum, and how do you decide which fits a project?"

The core difference is the unit of planning: Scrum plans and commits in fixed-length sprints with defined roles; Kanban has continuous flow with no timeboxes and no prescribed roles, just visualized work and WIP limits. Scrum forces a fixed cadence of inspection (every sprint); Kanban inspects continuously as items move across the board.

The decision comes down to the shape of the incoming work. Scrum fits teams that can plan ahead and commit to a scope — new feature development with a roadmap. Kanban fits teams facing unpredictable, interrupt-driven work — support, maintenance, ops — where committing to a two-week scope in advance doesn't match reality.

**Say it:** "Scrum commits to a fixed scope on a fixed cadence; Kanban flows continuously with WIP limits instead of sprints — I pick Scrum when the work can be planned ahead, Kanban when it's interrupt-driven and unpredictable."
**Red flag:** Assuming Kanban is "Scrum without meetings" or somehow less rigorous. Kanban has its own discipline — WIP limits and flow metrics — it's just optimized for a different shape of work.

### Kanban Board and WIP Limits
**They ask:** "What is a Kanban board, and how do WIP limits actually work?"

A Kanban board visualizes the stages work passes through as columns, and each card represents one unit of work moving left to right. The mechanism that makes it more than a to-do list is the **WIP limit** — a cap on how many cards can sit in a given column at once. When a column hits its limit, no new work enters it until something moves out, which forces the team to *finish* work (or actively unblock it) instead of starting new work while things pile up half-done.

This surfaces bottlenecks visibly and immediately: if "In Review" is capped at 3 and hits the cap, the team sees the constraint right there on the board instead of discovering it three weeks later as a mountain of unreviewed work.

**Say it:** "The WIP limit is what makes a Kanban board more than a status list — capping a column forces the team to finish or unblock work before starting new work, so bottlenecks show up on the board instead of hiding behind it."
**Red flag:** Running a "Kanban board" with no WIP limits set. That's just a visualization of work in progress, not the flow-management discipline Kanban is actually built on.

### The Pull System
**They ask:** "What is the 'pull' effect in Kanban?"

In a push system, work is assigned to people regardless of their current capacity, which causes overload and half-finished work piling up. Kanban flips that: team members **pull** the next item from the queue only when they have capacity to start it, respecting the WIP limits on each stage. Nothing moves forward until there's room downstream to receive it.

This keeps the system self-regulating — capacity constraints are enforced by the board itself, not by a person deciding who should work on what next, and it naturally exposes where the flow is actually bottlenecked.

**Say it:** "Pull means people take on work when they have capacity, not when someone assigns it — the WIP limits enforce that automatically, so the system self-regulates instead of relying on a manager to notice overload."
**Red flag:** Assigning tasks to team members in a Kanban system. That's push, not pull — it defeats the self-regulating mechanism that keeps WIP under control.

### When to Use Kanban on a Project
**They ask:** "You've worked on a project using Kanban — when did it make sense, and what would make you switch away from it?"

Kanban earns its keep when work arrives unpredictably and can't be meaningfully batched into a fixed sprint scope — production support, a live ops queue, a maintenance backlog where priorities shift daily based on incoming tickets. Forcing that kind of work into two-week sprint commitments just produces broken commitments and constant re-planning, which erodes trust with stakeholders.

The signal to switch away from it: if the team starts wanting a regular cadence for planning and retrospecting — because the work has become predictable enough to batch — a hybrid ("Scrumban") or a move to full Scrum often serves better, since Kanban alone doesn't prescribe those inspection points.

**Say it:** "I reach for Kanban when the work is interrupt-driven and can't be honestly committed to a sprint — support and maintenance queues are the classic case; once the work becomes predictable enough to batch, I'd introduce sprint-style planning on top."
**Red flag:** Running Kanban just because "Scrum felt like too much process." That's picking a framework to avoid discipline rather than to match the shape of the work — an interviewer will probe past that answer.

### Scaled Agile Basics — SAFe and LeSS
**They ask:** "What do you know about SAFe and LeSS, and why does a single Scrum team's process need scaling at all?"

A single Scrum team's ceremonies coordinate one team's backlog — they say nothing about how five teams building one product avoid stepping on each other's dependencies, or how a company-wide roadmap turns into synchronized sprints across those teams. Scaled frameworks exist to solve that coordination problem without reverting to heavyweight, top-down planning.

**SAFe** (Scaled Agile Framework) adds layers above the team — Program, Large Solution, Portfolio — with structured cadences like Program Increment (PI) Planning that synchronize multiple teams' roadmaps. **LeSS** (Large-Scale Scrum) takes the opposite philosophy: it scales Scrum by adding as *little* as possible on top of standard Scrum — one Product Owner, one backlog, shared sprint reviews — rather than introducing new layers of process.

**Say it:** "Single-team Scrum doesn't answer how multiple teams sharing one product avoid dependency conflicts — SAFe solves that with added structural layers and synchronized planning cadences, while LeSS deliberately scales by adding as little process as possible."
**Red flag:** Treating SAFe and LeSS as interchangeable "enterprise Scrum." They start from opposite philosophies — SAFe adds structure, LeSS minimizes it — and picking one over the other is itself a real trade-off decision.

### Scaled Scrum vs Standard Scrum
**They ask:** "What actually changes when you move from standard Scrum to a scaled Scrum framework?"

Standard Scrum assumes one team, one backlog, one Product Owner — decisions and dependencies stay inside that one group. Scaled Scrum keeps the same core mechanics (sprints, backlog, review, retro) but adds coordination layers on top: cross-team synchronization events, shared or federated backlogs, and often an additional role or ceremony to resolve dependencies *between* teams before they become blockers inside a sprint.

The practical shift for a BA: requirements work now has to account for cross-team dependencies and shared definitions of "done" across teams building the same product, not just one team's scope.

**Say it:** "The team-level mechanics don't change — sprints, backlog, review, retro all still happen — what's added is coordination across teams: synchronized cadences and a way to resolve cross-team dependencies before they block a sprint."
**Red flag:** Assuming scaling just means "more teams running independent Scrums." Without an explicit coordination mechanism, independent team backlogs create silent dependency conflicts that surface late and expensively.

### Nexus and Multi-Team Scaling
**They ask:** "What is Nexus, and how does it differ from the other scaling frameworks you know?"

Nexus is a lighter-weight scaling framework from the creators of Scrum itself, built for roughly 3–9 teams working from one Product Backlog. Its key addition is the **Nexus Integration Team** — a small group responsible for ensuring the combined increment from all teams is actually integrated and releasable at the end of each sprint, which is the hardest part of scaling: individual teams can each finish "their" work while the combined product still doesn't integrate.

Compared to SAFe's multi-layer structure, Nexus stays closer to vanilla Scrum with a few added events (like a Nexus Sprint Planning and Nexus Daily Scrum) focused specifically on cross-team dependencies and integration, not portfolio-level planning.

**Say it:** "Nexus scales Scrum for a handful of teams with minimal added structure — its distinct piece is the integration team, whose job is making sure the combined output of every team actually integrates into one releasable increment, not just that each team finished its own tickets."
**Red flag:** Describing Nexus as "SAFe for smaller companies." They solve different problems — Nexus is about integration across a handful of teams; SAFe is about portfolio-level alignment across many more teams and programs.

### SAFe vs LeSS vs Nexus — Choosing a Framework
**They ask:** "Given a specific organization, how would you choose between SAFe, LeSS, and Nexus?"

The choice tracks organizational scale and appetite for structure, not technical merit alone. **Nexus** fits a handful of teams (roughly up to 9) that mostly need help with cross-team integration and dependency resolution — light process addition. **LeSS** fits organizations that want to scale Scrum's *philosophy*, not just its mechanics — minimal added roles, a genuine belief in self-management, which requires real organizational buy-in to work. **SAFe** fits large enterprises that need portfolio-level alignment across many teams and often a more prescriptive structure to get buy-in from stakeholders used to traditional planning.

The honest trade-off to name: SAFe's structure makes it easier to adopt in a change-resistant enterprise but risks recreating waterfall bureaucracy at scale if applied mechanically; LeSS demands more organizational discipline but preserves more of Agile's original intent.

**Say it:** "Nexus for a handful of teams needing integration discipline, LeSS for an organization that genuinely wants minimal-process scaling, SAFe for a large enterprise that needs a prescriptive structure stakeholders can buy into — the real trade-off is structure versus fidelity to Agile's original intent."
**Red flag:** Picking a scaled framework based on popularity alone ("everyone uses SAFe"). Popularity doesn't mean fit — recommending a heavyweight framework onto a small, agile-minded organization can do more harm than staying with standard Scrum.
