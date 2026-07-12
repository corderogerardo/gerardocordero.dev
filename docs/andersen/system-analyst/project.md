# Project — phases, estimation, risks, stakeholders, IT roles

### The Discovery phase — who's involved and what the SA delivers
**They ask:** "What happens during the Discovery phase, and what does the analyst actually produce?"

Discovery exists to convert a vague idea into a scoped, estimable plan before anyone commits engineering time — skip it and you're estimating a moving target. It typically involves the client/product owner, a BA/SA, a solution architect, and sometimes a designer, running a short, intense series of workshops. The analyst's output is concrete: a feature list, high-level user stories or use cases, a first-pass architecture sketch, and enough of a Vision & Scope or SRS draft to price the build.

The senior distinction is timeboxing: Discovery has a fixed, short duration (days to a few weeks) — its job is to de-risk the estimate, not to fully spec every requirement, which happens later.

**Say it:** "Discovery's job is to de-risk the estimate, not fully spec the system — I leave it with a feature list, high-level stories, and enough architecture to price the build, not a complete SRS."
**Red flag:** Treating Discovery as an open-ended requirements-gathering phase. It's timeboxed by design; running it like a full SRS effort blows the presale budget and delays the estimate it exists to produce.

### Preparing a feature list
**They ask:** "How do you build a feature list during Discovery, and what makes it useful for estimation?"

A feature list is the bridge between "what the client wants" and "what we can price" — each entry needs to be small enough to estimate independently but large enough that you're not listing implementation details. I group raw stakeholder input into features, tag each with a rough priority (must-have vs. nice-to-have), and flag unknowns explicitly rather than guessing a scope for them.

The output feeds two audiences at once: the estimator sizes off it, and the client sees it as an early checkpoint on whether you understood the ask — so ambiguous phrasing gets caught here, not after 5109 hours of dev.

**Say it:** "A feature list is scoped for two readers at once — the estimator sizing effort, and the client checking I understood the ask — so I flag unknowns explicitly instead of silently guessing a scope for them."
**Red flag:** Listing features as implementation tasks ("add a database column") instead of user-facing capabilities. That's a task list, not a feature list an estimator or client can reason about.

### User Stories and Use Cases during Discovery
**They ask:** "How do you decide the right level of detail for User Stories and Use Cases this early in a project?"

Discovery-stage stories and use cases are deliberately shallow — the goal is to prove you understand the shape of the domain and give the estimator enough to size against, not to write acceptance criteria you'll rewrite three times before build starts. I write the story/use-case title and a one-line goal for every feature, and go deeper (full acceptance criteria, alternate flows) only for the handful of features that are genuinely ambiguous or high-risk.

**Say it:** "At Discovery I go one level deep on every feature and three levels deep only on the risky ones — full acceptance criteria for everything this early gets rewritten anyway once real requirements work starts."
**Red flag:** Writing fully detailed Use Cases for every feature during a two-week Discovery. That's Discovery-phase effort spent doing SRS-phase work, and most of it will be redone.

### Presale — estimating what you don't fully know yet
**They ask:** "How is estimating during presale different from estimating a defined backlog?"

Presale estimation prices *uncertainty*, not a known scope — you're often estimating off a one-page RFP or a sales call, not a groomed backlog. The approach shifts accordingly: use comparable past projects and rough sizing (t-shirt sizes, feature-count heuristics) instead of story-point estimation, and always attach a confidence range, not a single number, because a single number gets quoted as a promise.

Discovery-phase estimation and whole-project estimation are different objects, too: Discovery is cheap and short and gets estimated with high confidence; the *project* estimate coming out of Discovery still carries real uncertainty and should be presented as a range with named assumptions.

**Say it:** "Presale numbers price uncertainty, not a known scope — I give a range with named assumptions, not a single number, because a single number gets quoted back as a fixed-price promise."
**Red flag:** Giving a single-point estimate at presale with no stated assumptions. When scope inevitably shifts, there's nothing to point to that explains why the number moved.

### The Launching phase — release readiness and monetization
**They ask:** "What's the analyst's role once a project moves into the Launching phase?"

Launching is where the spec meets reality — the analyst's artifacts shift from "what to build" to "is it ready to ship and how does it make money." That means release-readiness checklists, coordinating go-live requirements (data migration cutover, rollback plan — the transitional requirements called out earlier), and often owning the monetization model: subscription, freemium, in-app purchase, ads, transaction fee — each with different technical and requirement implications (billing integration, entitlement checks, trial-period logic).

**Say it:** "Launching artifacts answer 'is it ready to ship and how does it make money' — I own the release checklist and the monetization model's requirements, not just feature completeness."
**Red flag:** Treating monetization as a business-team decision with no analyst involvement. The monetization model drives real requirements — entitlements, billing webhooks, trial logic — that need the same rigor as any feature.

### The Support phase — support lines and the analyst's role
**They ask:** "What does an analyst do once a system is in the Support phase, and what are 'support lines'?"

Support-line tiers exist to route issues to the right cost/skill level fast: L1 handles known issues via a runbook or script (often non-technical), L2 investigates and reproduces genuine bugs, L3 is engineering fixing root causes. The analyst's job in Support is keeping the knowledge current — writing/maintaining the runbook L1 works from, triaging ambiguous tickets into the right requirement or defect, and documenting recurring issues as backlog items instead of letting them get manually patched every time.

**Say it:** "Support tiers route by cost and skill — L1 runbook, L2 reproduction, L3 root-cause fix — and my job is keeping the L1 runbook current and turning recurring tickets into real backlog items instead of repeat manual patches."
**Red flag:** Letting the same issue get manually worked around by L1/L2 repeatedly without ever becoming a tracked requirement or bug — that's invisible technical debt accumulating in the support queue.

### Estimation techniques
**They ask:** "What estimation techniques do you know, and when do you reach for each?"

Different techniques trade speed for precision. T-shirt sizing (XS–XL) is fast, coarse, and good for early triage of a large backlog. Story points with Planning Poker force the team to converge on relative size and surface disagreement (a 3 vs. an 8 is a signal someone knows something others don't) — good for a groomed sprint backlog. Three-point (PERT) estimation (optimistic/pessimistic/most-likely) gives a statistically defensible range for higher-stakes, fixed-price commitments. Analogous estimation (comparing to a similar past feature) is fast when you have project history to draw on.

```
PERT estimate = (Optimistic + 4×Most-Likely + Pessimistic) / 6
```

**Say it:** "I match the technique to the stakes — t-shirt sizes for early backlog triage, Planning Poker to surface team disagreement on a groomed sprint, PERT when a fixed-price number needs a defensible range."
**Red flag:** Using story points to produce a client-facing fixed-price number. Points are a relative, team-internal unit — translating them 1:1 into hours/dollars for an external commitment misrepresents their precision.

### Running estimation in a team
**They ask:** "You're responsible for organizing a team estimation session — walk me through it."

The point of a group session over asking each dev individually is surfacing disagreement — when two engineers size the same item wildly differently, that gap is more valuable than either number, because it usually means an unstated assumption or unknown risk. I run it as Planning Poker: everyone estimates independently and reveals simultaneously (to avoid anchoring on the first number said out loud), then the outliers explain their reasoning before re-voting.

At a senior level this extends to picking the right tool (Poker Planning apps, a spreadsheet, a physical deck for a co-located team) and analyzing the *pattern* of a completed estimation round — where the team consistently disagrees is a signal for where the requirements are still underspecified.

**Say it:** "I run estimation as simultaneous-reveal Planning Poker specifically to surface disagreement — a 3-versus-8 split is more useful information than either number, because it flags an unstated assumption."
**Red flag:** Going around the room and asking for estimates out loud one at a time. The first number anchors everyone after it, and you lose the disagreement signal that makes group estimation worth doing.

### Risk types and the risk management cycle
**They ask:** "What types of project risk exist, and what does managing them look like end to end?"

Risks generally fall into categories worth naming distinctly: technical (an unproven integration, a performance unknown), scope (requirements churn), resource (key person leaves or is unavailable), and external (a third-party API changes, a regulatory shift). The management cycle is identify → assess (likelihood × impact) → plan a response (mitigate, transfer, accept, avoid) → monitor — and it's a *cycle*, not a one-time exercise at kickoff, because new risks surface as the project progresses.

**Say it:** "Risk management is identify, assess by likelihood times impact, choose a response — mitigate, transfer, accept, or avoid — then monitor, and I re-run that cycle through the project, not just once at kickoff."
**Red flag:** Producing a risk register once at project start and never revisiting it. Risks that materialize or new ones that appear mid-project need the same identify-assess-respond treatment.

### Identifying and documenting risks
**They ask:** "How do you actually identify risks on a project, and how do you document them so they're useful?"

Identification comes from pattern-matching against what's gone wrong before (past-project retrospectives), interrogating every assumption and dependency in the plan ("what if this third-party API isn't ready"), and asking stakeholders directly what keeps them up at night — they often know a risk you haven't surfaced yet. A documented risk needs a description, likelihood, impact, an owner, and a response plan — "we might run over" isn't a risk entry, it's a feeling; a risk entry is specific and actionable.

**Say it:** "A risk entry needs an owner and a response plan, not just a description — 'we might run over' is a feeling; 'the payment gateway's sandbox has 2-day SLA turnaround, owner: me, mitigation: request prod-like sandbox access week 1' is a risk."
**Red flag:** A risk register full of vague, unowned entries. An unowned risk with no response plan is decoration — it doesn't change what anyone does differently.

### Stakeholder types and identification
**They ask:** "How do you identify and classify stakeholders on a new project?"

Stakeholders split by influence and interest, not just by title — a sponsor with budget authority and low day-to-day interest needs different handling than a power-user with high interest and no formal authority. I build the list by asking "who is affected by this system" and "who can affect this project" as two separate questions, since the answers don't fully overlap, then classify each on a power/interest grid to decide how much engagement each one needs.

**Say it:** "I build the stakeholder list from two separate questions — who's affected by the system, and who can affect the project — because the overlap isn't total, then map each on power versus interest to decide their engagement level."
**Red flag:** Only listing stakeholders who attend meetings. The end users who never show up to a workshop are often the highest-interest group and the easiest to accidentally design around instead of for.

### Stakeholder engagement plans and RACI
**They ask:** "What's a stakeholder engagement plan, and what does a RACI/DACI matrix add to it?"

A stakeholder engagement plan defines, for each stakeholder or group, how and how often they're kept informed or consulted — a weekly demo for the product owner, a monthly steering update for an executive sponsor, ad-hoc for a subject-matter expert. RACI (Responsible, Accountable, Consulted, Informed — DACI swaps in Driver/Approver) solves a narrower, sharper problem: for a given decision or deliverable, who actually decides, versus who just needs to be told. Without it, "everyone weighs in on everything" becomes the default, and decisions stall.

**Say it:** "An engagement plan says how often each stakeholder hears from us; RACI says, for a specific decision, who's actually Accountable versus merely Informed — without that split, every decision becomes a group discussion."
**Red flag:** Copying a generic RACI template without naming actual people against actual decisions. An unfilled RACI is a slide, not a working tool.

### User personas
**They ask:** "What is a user persona, what parameters describe one, and why bother creating them?"

A persona is a composite, research-grounded stand-in for a real user segment — its value is forcing every requirement and design decision to answer "does this serve Maria, the time-pressed dispatcher" instead of an abstract, undifferentiated "the user." Key parameters: goals, pain points, technical proficiency, context of use (device, environment, time pressure), and behavioral patterns — demographic details (age, location) matter only if they actually change the product decision.

**Say it:** "A persona's job is turning 'the user' into a specific person a design decision can be checked against — I include the parameters that change a decision, like context of use and technical proficiency, and skip demographic detail that doesn't."
**Red flag:** A persona that's just a name and a stock photo with age/hobbies. If none of the listed attributes would change a single design or requirement decision, the persona isn't doing its job.

### Customer Journey Maps (CJM)
**They ask:** "What is a Customer Journey Map, how do you use one, and what does it actually influence?"

A CJM traces a persona's steps, thoughts, and emotional state across an entire experience — often starting well before they touch the product and ending after — surfacing pain points and drop-off moments a feature-by-feature requirements list would miss because no single feature "owns" the gap between two touchpoints. It directly influences feature prioritization (fix the step with the steepest emotional dip first), UX flow design, and it's the natural source for usability-testing and UAT scenarios, since a UAT script that follows the real journey catches integration gaps a per-feature test plan doesn't.

**Say it:** "A CJM surfaces the gaps between features that no single requirement owns — the steepest emotional dip in the map is usually a stronger prioritization signal than a stakeholder's opinion, and it's where I source UAT scenarios from."
**Red flag:** Building a CJM once and never updating it as scope evolves. A stale journey map still gets cited in prioritization debates long after it stopped matching the actual product.

### Onboarding onto a project
**They ask:** "You're joining an existing project as the analyst — what's your onboarding process?"

A personal onboarding checklist exists so ramp-up doesn't depend on someone else's bandwidth to walk you through everything — I start with the artifacts that encode ground truth over conversation (SRS/backlog, architecture diagrams, the data model), then trace one real end-to-end flow to validate what the docs say against what actually runs, then meet the team to fill the gaps documentation always has.

At a senior level this extends outward: identifying what artifacts a project is *missing* for good onboarding, and improving that process for whoever joins after you — not just getting yourself ramped.

**Say it:** "My onboarding checklist starts with artifacts that don't drift — data model over prose — then one traced end-to-end flow to validate docs against reality, and I leave notes on what was missing for the next person."
**Red flag:** Relying entirely on a teammate's verbal walkthrough with no artifact review. That doesn't scale, and it means your understanding is only as good as what they remembered to mention.

### Identifying and improving weak project processes
**They ask:** "How do you spot a broken process on a project, and what do you do once you've found one?"

Weak processes usually announce themselves as repeated friction — the same clarification question getting asked every sprint, the same type of bug reaching QA, decisions that keep getting revisited because no one was actually accountable for making them. I look for these patterns rather than waiting for someone to complain, then propose a specific, narrow fix (not a process overhaul) and measure whether the friction actually drops before expanding it.

**Say it:** "I look for repeated friction, not complaints — the same clarifying question every sprint is a process gap, not a training gap — and I fix it narrowly first, then measure before expanding the change."
**Red flag:** Proposing a full process overhaul off one bad sprint. A single data point isn't a pattern, and a heavy process change for a one-off problem creates more friction than it removes.

### The Project Manager's role and responsibility by phase
**They ask:** "What does a PM actually own on a project, and how does that responsibility shift across phases?"

A PM owns the triangle — scope, time, budget — and the team/client relationship around delivery, while the analyst owns *what* gets built. During Discovery/presale the PM is heavily involved in estimation and staffing; during build, the PM tracks velocity and burn against the plan and manages the client relationship on schedule/budget; at launch and support, the PM owns the cutover plan and, often, the support SLA the client signed. The analyst and PM overlap constantly but the accountability line is: PM owns "on time and on budget," analyst owns "the right thing was specified."

**Say it:** "PM owns the delivery triangle — scope, time, budget — analyst owns whether the right thing got specified; the overlap is real, but that's the accountability line I use when a decision needs a single owner."
**Red flag:** Being unable to say where PM and analyst responsibility actually splits. On a project without that clarity, ambiguous decisions default to whoever's most vocal, not whoever should own them.

### PM vs. Delivery Manager vs. Delivery Director
**They ask:** "What's the difference between a PM, a Delivery Manager, and a Delivery Director?"

These titles scale with scope, not just seniority. A PM typically owns one project's triangle end to end. A Delivery Manager (DM) oversees delivery process and quality across *multiple* projects or a whole account — less hands-on with a single backlog, more focused on process consistency and escalation handling across teams. A Delivery Director (DD) operates at the account/portfolio level — commercial relationship, staffing strategy, and escalations that a DM couldn't resolve. Knowing the distinction matters because it tells you who to escalate what to.

**Say it:** "PM owns one project's triangle, DM owns delivery consistency across several projects or an account, DD owns the account-level commercial relationship — knowing the split tells me exactly who to escalate an issue to."
**Red flag:** Escalating every project-level issue straight to a Delivery Director. That's the wrong altitude for most problems and burns the relationship you'd need for the ones that actually require it.

### Contract models — Fixed Price, T&M, Dedicated Team
**They ask:** "Compare Fixed Price, Time & Materials, and Dedicated Team — pros, cons, and when each fits."

The three models fix a different corner of the scope/time/cost triangle. Fixed Price fixes scope and cost upfront — the client gets budget certainty, the vendor bears the estimation risk, and it demands a detailed SRS since the SRS *is* the contract boundary; it fits well-defined, low-ambiguity projects (often waterfall or government). Time & Materials fixes neither scope nor cost, billing actual hours — it fits agile, evolving-requirements work where fixed scope would force premature decisions, at the cost of budget predictability for the client. Dedicated Team is a staffing model, not a delivery model — the client gets a team's capacity for an ongoing period and directs the backlog themselves, which suits a startup or product team that wants control without building an internal hiring pipeline.

**Say it:** "Fixed Price trades flexibility for budget certainty and needs a contract-grade SRS; T&M trades certainty for the flexibility agile requires; Dedicated Team isn't really a delivery model at all — it's capacity the client directs themselves."
**Red flag:** Recommending Fixed Price for a project with genuinely undefined, evolving requirements. Locking scope before the domain is understood just moves the risk into change-request disputes instead of removing it.
