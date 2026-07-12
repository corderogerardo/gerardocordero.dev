# Software development process

### Bug tracking workflow
**They ask:** "What makes a bug report actually actionable, and how do you use a tracker like Jira effectively?"

An actionable bug report has reproduction steps specific enough that someone who never saw the bug happen can trigger it themselves, expected vs actual behavior stated explicitly (not just "it's broken"), environment/version context, and severity/priority set honestly rather than defaulted to "critical" for everything (which trains the team to ignore the priority field entirely). The tracker's real value beyond a to-do list is the audit trail — linking a bug to the commit that introduced it, the commit that fixed it, and the release it shipped in, which is what makes "when did this regress" answerable months later.

**Say it:** "A bug report earns its keep on reproduction steps someone else can follow blind, plus expected-vs-actual stated explicitly — and I keep severity honest, because a tracker where everything is marked critical stops functioning as a priority signal at all."
**Red flag:** Filing a bug as "doesn't work, please fix" with no repro steps. It forces whoever picks it up to first do the reporter's diagnostic work before they can even start on the actual fix.

### Writing a good bug report
**They ask:** "Walk through the anatomy of a bug report you'd actually want to receive."

Title states the symptom specifically, not vaguely ("Checkout fails with 500 when cart has a discount code applied" beats "Checkout broken"). Steps to reproduce are numbered and minimal — the smallest sequence that still triggers it, since a report full of irrelevant steps hides the actual trigger. Expected vs actual behavior is stated as two explicit lines. Environment (browser/OS/version, or API version/environment) is included because plenty of bugs are environment-specific. Severity reflects actual user/business impact, and if there's a workaround, it's noted — that changes urgency without changing severity.

**Say it:** "I write bug reports the way I'd want to receive one — minimal numbered repro steps, expected vs actual stated as two explicit lines, environment included — because most of the time spent on a bug is diagnosis, and a good report does half of that for the person who picks it up."
**Red flag:** A report that describes the investigation instead of the bug ("I was looking at the payment flow and noticed something weird"). Lead with the reproducible symptom; the investigation narrative belongs in a comment, not the title or description.

### Git branching strategies
**They ask:** "Compare trunk-based development, Git Flow, and GitHub Flow — what does each optimize for?"

**Git Flow** has long-lived `develop`/`main`/`release`/`feature` branches with a formal release process — structured, but the long-lived branches accumulate drift and merge conflicts the longer they live, and it optimizes for scheduled, versioned releases (packaged software) more than continuous deployment. **GitHub Flow** simplifies to one long-lived `main` plus short-lived feature branches merged via PR, deployed as soon as they're merged — optimized for continuous deployment. **Trunk-based development** goes further: very short-lived branches (or direct small commits to `main`) behind feature flags, merged multiple times a day — optimized for minimizing merge conflict risk and integration pain by never letting branches diverge for long. The trend in modern high-velocity teams is toward trunk-based + feature flags specifically because long-lived branches are where integration pain concentrates.

**Say it:** "The real axis is branch lifetime versus integration pain — Git Flow's long-lived branches suit scheduled releases, GitHub Flow suits continuous deployment, and trunk-based development minimizes merge pain entirely by keeping branches so short-lived they rarely have time to diverge — feature flags are what make that safe for incomplete work."
**Red flag:** Running Git Flow's full branch ceremony for a team deploying continuously multiple times a day. The structure that helps coordinate scheduled releases becomes pure overhead when there's no release train to coordinate against.

### Git rebase vs merge
**They ask:** "When do you rebase vs merge, and what's the actual risk with rebase?"

`merge` preserves the true history — exactly what happened, including the branch structure — and creates a merge commit; it's always safe on shared branches since it never rewrites existing commits. `rebase` replays your branch's commits on top of another branch's latest state, producing a linear history with no merge commit — cleaner to read, but it **rewrites commit hashes**, which means rebasing a branch other people have already pulled and built on top of creates a painful history divergence for them (their old commits reference hashes that no longer exist on the rebased branch). The safe rule: rebase freely on your own local, not-yet-pushed (or not-yet-shared) branch; never rebase a branch others are actively working from.

```
git rebase main      -- rewrites your branch's history onto main's tip
git merge main        -- creates a merge commit, no history rewritten
```

**Say it:** "I rebase local, not-yet-shared work to keep history linear and readable, and I merge — or ask before rebasing — anything already pushed and pulled by someone else, because rebase rewrites commit hashes and that breaks anyone who already built on the old ones."
**Red flag:** Force-pushing a rebased branch that teammates have already pulled and are working from, without warning anyone. Their local history now diverges irreconcilably from the rewritten remote branch.

### Resolving merge conflicts
**They ask:** "Walk through how you actually resolve a non-trivial merge conflict correctly, not just make the markers go away."

The instinct to avoid is picking a side mechanically just to make the conflict markers disappear — a conflict means two changes touched overlapping code with different *intent*, and resolving it correctly means understanding both changes well enough to combine their intent, not just choosing one. Practically: read both versions and the commit messages/PR context for each side, understand what each change was trying to accomplish, write the resolution that satisfies both intents (which sometimes means neither original version, but a new combination), then — critically — re-run the tests, because a syntactically clean resolution can still be semantically wrong.

**Say it:** "A conflict means two changes had different intent on overlapping code, so I resolve it by understanding both intents well enough to combine them correctly — not by picking whichever side looks more familiar — and I always re-run tests after, because a clean-looking resolution can still be semantically wrong."
**Red flag:** Resolving a conflict by keeping "theirs" or "ours" wholesale without reading what the other side's change was actually doing. That silently discards someone's fix or feature with no one noticing until it regresses later.

### Estimation techniques
**They ask:** "How do story points and planning poker actually help estimate work, versus estimating in hours/days?"

Story points estimate **relative complexity/effort/uncertainty**, not calendar time — the point is that humans are demonstrably bad at absolute time estimates (task-switching, interruptions, unknown unknowns) but reasonably good at *relative* comparison ("this is about twice as complex as that other ticket we did last sprint"). **Planning poker** — each team member privately estimates, then reveals simultaneously — surfaces disagreement early: if two engineers estimate the same ticket wildly differently, that's a signal one of them sees a complexity or risk the other doesn't, worth discussing before work starts, not a number to just average away.

**Say it:** "Story points estimate relative complexity, not hours, because humans are bad at absolute time estimation but good at relative comparison — and the real value of planning poker isn't the number, it's that a wide spread in private estimates surfaces a hidden risk or misunderstanding before anyone starts the ticket."
**Red flag:** Converting story points back into a fixed hours-per-point ratio and holding the team to it. That defeats the entire purpose of using a relative, uncertainty-absorbing unit and just reintroduces the false precision of hour estimates under a different label.

### Communicating estimate uncertainty
**They ask:** "How do you communicate an estimate you're genuinely not confident in, to a stakeholder who wants a single number?"

Give a range, not a false-precision point estimate, and say explicitly what's driving the width of the range — "2-3 days if the third-party API behaves as documented, up to a week if we need a workaround for their rate limiting" is honest and actionable; "4 days" said with the same underlying uncertainty just defers the surprise to later, when it's more expensive to absorb. Naming the specific unknown also gives the stakeholder a real decision to make — they might choose to spike the risky unknown first, explicitly, before committing to a date.

**Say it:** "I give a range and name the specific thing driving the uncertainty, not a single falsely-precise number — that turns 'I don't know' into an actionable decision for the stakeholder, like spiking the risky unknown first before committing to a date."
**Red flag:** Giving a single confident number under pressure when the actual estimate is genuinely uncertain. It feels like it satisfies the stakeholder in the moment, but the inevitable miss costs more trust than an honest range would have upfront.

### Agile vs Scrum vs Kanban vs Waterfall
**They ask:** "Precisely, how do Agile, Scrum, Kanban, and Waterfall relate to each other?"

**Agile** is a set of values/principles (the Agile Manifesto) — iterative delivery, responding to change, working software over comprehensive documentation — not a specific process; it's the umbrella. **Scrum** is one concrete Agile framework: fixed-length sprints, defined ceremonies (planning, standup, review, retro), defined roles. **Kanban** is a different Agile-compatible framework: continuous flow with no fixed iterations, work pulled as capacity allows, visualized on a board with WIP limits — better suited to unpredictable, interrupt-driven work (support/ops) than Scrum's sprint commitment model. **Waterfall** is the pre-Agile model: sequential phases (requirements → design → build → test → release), each fully completed before the next begins, which struggles with changing requirements since course-correction only happens between phases, not continuously.

**Say it:** "Agile is the value set, Scrum and Kanban are two different concrete implementations of it — Scrum for planned, batchable work in fixed iterations, Kanban for continuous, interrupt-driven flow — and Waterfall predates all of it, optimizing for predictability over responsiveness to change."
**Red flag:** Using "Agile" and "Scrum" interchangeably as if they're the same thing. Scrum is one specific framework under the Agile umbrella — plenty of genuinely Agile teams run Kanban or a hybrid instead.

### Standups and sprint ceremonies
**They ask:** "What is each Scrum ceremony actually for, and how do they go wrong in practice?"

**Standup** is a synchronization checkpoint, not a status report to a manager — the value is surfacing blockers early so the team can route around them, and it goes wrong when it turns into a line-by-line status readout with no actual coordination happening. **Sprint planning** commits the team to a scoped, achievable set of work for the sprint — goes wrong when scope is imposed top-down instead of negotiated with the people doing the work. **Sprint review** demonstrates working software to stakeholders for real feedback — goes wrong when it becomes a slide presentation instead of an actual demo. **Retrospective** is the team's own process-improvement loop — goes wrong when it produces the same unaddressed complaints sprint after sprint with no follow-through on action items.

**Say it:** "Every ceremony has one specific job — standup is coordination, not status reporting to a manager, and retro is worthless if the action items from last time never get followed up on — the failure mode across all of them is the same: the ceremony's form survives while its actual purpose quietly drains out."
**Red flag:** A standup where everyone reports status to the scrum master/manager one by one with no team-to-team coordination happening. That's a status meeting wearing standup's clothes — the actual value (surfacing blockers so the team can help) is missing.

### SDLC phases
**They ask:** "Walk through the phases of the SDLC, and where does testing actually belong?"

Requirements gathering, design, implementation, testing, deployment, maintenance — the textbook phases, but the senior point is that in a genuinely mature process these aren't strictly sequential: testing isn't a phase that happens *after* implementation, it's integrated throughout (TDD, CI running tests on every commit, code review as a continuous quality gate) — treating testing as a late, separate phase is exactly what produces late-discovered, expensive-to-fix bugs, since the cost of fixing a defect grows the further downstream it's caught (a design flaw found in requirements review is cheap; the same flaw found in production is not).

**Say it:** "I treat testing as continuous, not a discrete late phase — the cost of a defect grows the further downstream it's caught, so catching a design issue in review is orders of magnitude cheaper than catching the same issue in production."
**Red flag:** Describing a rigid, strictly-sequential SDLC where testing is a phase that only starts after implementation is fully complete. That's the exact structure that defers defect discovery to the most expensive point to fix it.

### Requirements gathering and change management
**They ask:** "How do you handle a requirement changing mid-development without it derailing the timeline?"

The senior move isn't refusing changing requirements — some amount of change is inevitable as stakeholders learn more from seeing early progress — it's making the *cost* of a change visible and explicit at the moment it's requested: what does this change actually touch, does it affect already-completed work, does it change the timeline or scope of something else. Writing requirements as testable acceptance criteria up front (not vague prose) makes it much easier to see precisely what a proposed change actually alters versus leaves intact, which turns "can we also just add X" into a concrete, negotiated trade-off instead of an invisible scope-creep tax absorbed silently by the team.

**Say it:** "I don't fight requirement changes, I make their cost visible the moment they're requested — acceptance criteria written as concrete, testable statements up front is what makes 'this also changes Y and pushes the date by two days' a clear trade-off instead of scope creep nobody explicitly agreed to."
**Red flag:** Silently absorbing every "small" mid-sprint requirement change without renegotiating scope or timeline. Each one feels small individually; the accumulated, unacknowledged cost is what actually blows the deadline.

### Definition of Done
**They ask:** "What belongs in a team's Definition of Done, and why does it matter beyond 'the code works'?"

A Definition of Done is an explicit, team-agreed checklist that turns "done" from a subjective feeling into a verifiable state — typically: code reviewed and approved, tests written and passing, documentation updated if the change affects a public interface, deployed (or deployable) without manual follow-up steps, and any monitoring/alerting a production-affecting change needs already in place. Its real value shows up at estimation and sprint-commitment time — without a shared Definition of Done, "done" means something different to each person, which is exactly how a ticket gets marked complete while missing tests, docs, or monitoring that only surfaces as a gap weeks later.

**Say it:** "Definition of Done turns 'done' from a subjective judgment call into a checklist everyone agreed to upfront — without one, different people quietly mean different things by 'done,' which is how a ticket ships without tests or monitoring that nobody explicitly signed off on skipping."
**Red flag:** A ticket marked "done" that's merged but unreviewed, untested, or undeployed, with the remaining work implicitly deferred to "later." Without an explicit Definition of Done, that deferred work has a real chance of never actually happening.

### Technical debt tracking
**They ask:** "How do you track and prioritize technical debt so it doesn't just accumulate silently?"

Debt tracked only as tribal knowledge ("yeah, that module's a mess, everyone knows") never competes for prioritization against visible feature work — it needs to become a real, visible backlog item with the same rigor as a bug report: what's the debt, what risk or cost does it impose (slower future changes, a specific class of bug it enables, an on-call pain point), and a rough size estimate to pay it down. The pragmatic prioritization framing that actually works: tie debt paydown to the next feature that touches that code, rather than scheduling a separate "debt sprint" that's the first thing cut under deadline pressure — "we're already in this file for the new feature, this is the cheapest moment to also fix the debt here."

**Say it:** "I track debt as a visible backlog item with a stated cost, not tribal knowledge, and I prioritize paying it down when the next feature already touches that code — that's the cheapest moment to fix it, and it survives deadline pressure better than a dedicated debt sprint does."
**Red flag:** Treating technical debt as something to schedule in a separate, dedicated cleanup sprint disconnected from any feature work. That sprint is almost always the first thing cut when a deadline gets tight, and the debt just keeps compounding.
