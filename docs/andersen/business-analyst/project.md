# Project — stakeholders, estimation, onboarding, processes, risks

### Stakeholder Types and Mapping a Stakeholder List
**They ask:** "How do you identify and categorize stakeholders on a project?"

Missing a stakeholder isn't a documentation gap — it's a requirement gap, because whoever you didn't talk to has needs that never made it into scope. Categorize by influence and interest at minimum (high-influence/high-interest stakeholders need direct engagement; low-influence/low-interest just need to be kept informed), and by role: sponsors (fund and own success criteria), end users (use the system, often not the same as who pays for it), SMEs (domain knowledge), and technical stakeholders (architecture, ops, security — often forgotten because they're internal). Building the list is a deliberate exercise, not "whoever showed up to the kickoff call."

**Say it:** "I map stakeholders by influence and interest, not just who's in the kickoff meeting — the low-visibility, high-influence stakeholder you miss early is the one who blocks sign-off later."
**Red flag:** Building a stakeholder list purely from the people already in early meetings — it systematically misses stakeholders who should be consulted but weren't proactively invited.

### Stakeholder Engagement Plan
**They ask:** "What's a stakeholder engagement plan, and why do you need one beyond just a list of names?"

A list tells you who exists; an engagement plan tells you how and how often to actually involve each one — communication frequency, format (workshop vs. status email vs. one-on-one), and decision authority (who can actually approve a requirement vs. who's consulted for input). Without a plan, high-influence stakeholders get under-engaged (surprised by decisions) and low-influence ones get over-engaged (wasting their time and yours), and both outcomes cause friction later.

**Say it:** "The stakeholder list tells me who's involved — the engagement plan tells me how much and how often, so I'm not under-engaging the person who can veto a decision or over-engaging the person who just needs a status update."
**Red flag:** Engaging every stakeholder identically regardless of their influence or interest level — it burns goodwill with people who wanted less involvement and creates blind spots with people who needed more.

### RACI/DARCI Matrix
**They ask:** "What is a RACI or DARCI matrix, and how do you use it on a project?"

RACI (Responsible, Accountable, Consulted, Informed) assigns exactly one role per task per person, and it exists to kill the single most common project failure mode: nobody actually being accountable for a decision because "the team" owned it. DARCI adds a Driver — the person actively pushing the task forward, distinct from who's ultimately Accountable for its outcome — useful when the person driving day-to-day isn't the person whose neck is on the line for the result. The senior use: build it explicitly for major decisions and deliverables, not as a document nobody references, and use it to resolve "who signs off on this" disputes before they happen.

**Say it:** "RACI's value isn't the chart — it's forcing exactly one Accountable name per decision, which is what prevents the 'I thought someone else was handling that' failure."
**Red flag:** Assigning multiple people as "Accountable" for the same task — that's the exact ambiguity RACI exists to eliminate; if two people are accountable, functionally nobody is.

### User Personas — What and Why
**They ask:** "What is a user persona, and what key parameters describe one?"

A persona is a fictional, research-based archetype representing a segment of real users — its job is making abstract "the user" concrete enough that the team makes consistent design and requirement decisions without re-litigating "which user did we mean" every time. Key parameters: goals and motivations, pain points, behavioral patterns (how they actually use similar systems today), technical proficiency, and context of use (device, environment, frequency). A persona built from assumptions instead of research is worse than no persona — it creates false confidence about what users actually need.

**Say it:** "A persona's value is forcing the team to agree on a concrete user before designing for them — but only if it's built from actual research, because an assumption-based persona just launders bias as data."
**Red flag:** Presenting a persona as a fun creative exercise (name, stock photo, hobbies) with no grounding in real user research or data — it looks like a persona but doesn't do a persona's job.

### Customer Journey Maps (CJM) — Building and Using Them
**They ask:** "What is a Customer Journey Map, and how does it actually influence the product beyond being a nice diagram?"

A CJM traces a persona's full experience across a goal — touchpoints, actions, emotions, and pain points at each stage — and its real value is surfacing gaps *between* touchpoints that no single feature-level requirement would catch (the moment between "signed up" and "first successful use" where users silently churn, for example). A CJM done well feeds directly into: feature prioritization (fix the worst pain point first), UX design decisions, and deriving concrete scenarios for usability testing and UAT — it's not a deliverable that sits in a slide deck, it's an input to other artifacts.

**Say it:** "A CJM's value is finding the gaps between touchpoints that no individual requirement catches — and it only earns its keep if it actually drives prioritization and UAT scenarios, not just sits as a diagram nobody references again."
**Red flag:** Building a CJM as a one-time deliverable disconnected from prioritization or testing — if it doesn't change what gets built or tested, it wasn't worth the workshop time.

### Leading Stakeholder Meetings and Managing Groups of Stakeholders
**They ask:** "How do you run a meeting with multiple stakeholder groups who have conflicting priorities?"

The senior framework: (1) set a clear agenda and shared goal for the meeting before it starts, so disagreement has a frame to happen within; (2) surface conflicting views explicitly rather than letting them stay implicit — naming the tension is what lets it get resolved instead of resurfacing later as scope churn; (3) separate "decisions that need consensus" from "decisions with a clear decision-owner" (tie back to RACI) so the meeting doesn't stall waiting for agreement that was never going to happen; (4) close with explicit next steps and owners, documented and circulated, not left to memory.

**Say it:** "I don't try to get every stakeholder group to agree in the room — I surface the conflict explicitly, route it to whoever actually has decision authority, and leave with documented next steps, not a false consensus that unravels the next week."
**Red flag:** Ending a multi-stakeholder meeting with vague "we'll figure it out" instead of explicit decisions and owners — unresolved conflict doesn't disappear, it resurfaces as a scope dispute later, at a worse time.

### End-Users vs Customers
**They ask:** "What's the difference between end-users and customers on a project, and why does it matter to requirements?"

The customer is who pays and typically holds sign-off authority; the end-user is who actually operates the system day to day — and on B2B and enterprise projects these are frequently different people with different, sometimes conflicting priorities (the customer wants cost control and reporting; the end-user wants a fast, low-friction workflow). Requirements elicited only from the customer risk producing a system that satisfies the buyer's checklist but frustrates the daily user — which shows up as low adoption even when the contract's acceptance criteria are technically met.

**Say it:** "If I only elicit from the customer, I risk building something that satisfies the contract but not the person who actually has to use it every day — I make sure both voices are in the requirement set, even when they conflict."
**Red flag:** Treating "stakeholder interviews" as complete after talking only to the buyer/sponsor — low end-user adoption post-launch is a common symptom of exactly this gap.

### Estimation Basics — Why and What Techniques
**They ask:** "Why does a BA need to understand estimation, and what techniques do you know?"

A BA is frequently the person with the earliest, deepest understanding of scope — so an estimate built without BA input is often built on an incomplete feature list. Common techniques: analogous estimation (compare to a similar past project — fast but only as good as the comparison), parametric estimation (formula-based, using historical unit costs — more precise, needs good historical data), and expert judgment / three-point estimation (optimistic/likely/pessimistic, useful when uncertainty is high). Each technique has a different confidence-vs-speed trade-off, and a senior BA picks based on how much historical data actually exists for this type of work.

**Say it:** "The estimation technique I pick depends on how much reliable historical data exists — analogous when there's a close comparable, parametric when I have real unit-cost history, three-point when uncertainty is genuinely high and I need to communicate a range, not a false-precision number."
**Red flag:** Giving a single estimation technique as "the" way to estimate — different project maturity and data availability call for different techniques.

### Applying Estimation Techniques on Real Projects
**They ask:** "Tell me about a project where you actually applied an estimation technique — not just described one."

The senior answer names the technique, why it fit that project's data availability, and — critically — how the estimate held up against actuals and what was learned. Utilities matter here too: story points with planning poker for Agile teams, PERT/three-point formulas for higher-uncertainty work, and tracking actuals against estimates over time to calibrate future ones. A BA who's only ever produced estimates without later checking them against reality is missing the feedback loop that actually improves estimation skill.

**Say it:** "I don't just produce an estimate and move on — I track it against actuals afterward, because that's the only way estimation technique actually improves instead of repeating the same bias project after project."
**Red flag:** Never having compared an estimate to actual delivered effort — without that feedback loop, "I have estimation experience" just means "I have produced numbers," not that the numbers got better over time.

### Organizing Team Estimation Sessions
**They ask:** "How do you run a team estimation session, not just estimate solo?"

At senior level you're not just contributing an estimate, you're running the session: selecting participants who actually have the relevant knowledge (not just whoever's available), choosing the technique (planning poker for relative sizing, three-point for absolute), surfacing and documenting assumptions the estimate depends on (so it's traceable when reality diverges), and — importantly — facilitating disagreement productively when two engineers size the same item very differently, because that divergence is often signaling a hidden requirement ambiguity, not just an estimation skill gap.

**Say it:** "When estimators disagree by a wide margin, I don't just average it and move on — that divergence is usually pointing at a requirement that's more ambiguous than anyone realized, and I run it down before we lock the number."
**Red flag:** Treating wide estimation divergence as noise to be averaged away — it's frequently a signal, and ignoring it produces an estimate built on an unresolved ambiguity.

### Onboarding — Building Your Checklist and Artifacts
**They ask:** "What's your personal onboarding checklist when you join a new project?"

A senior BA doesn't rebuild their onboarding approach from scratch each time — they've iterated a checklist: existing documentation to review first (V&S, SRS, architecture docs), key stakeholders to meet in what order, tools/access to request immediately versus later, and open questions to log rather than silently assume answers to. The artifacts that most improve onboarding quality for whoever comes after you: a living glossary of project-specific terms, a decision log (why things are the way they are, not just what they are), and a current architecture/data-flow overview — because "what" is documented far more often than "why," and "why" is what a new person actually needs.

**Say it:** "My onboarding checklist isn't generic — it's built from what's actually slowed me down on past projects, and the artifact I prioritize leaving behind is a decision log, because 'why is it built this way' is the question new team members ask most and documentation answers least."
**Red flag:** Describing onboarding only as "reading the docs" — the highest-value onboarding artifact is almost always the undocumented "why," which requires deliberately capturing decisions, not just current state.

### Onboarding Others Onto a Project
**They ask:** "Tell me about onboarding a new team member onto a project you were already on."

This is asking for a concrete example, not a definition — a strong answer names what artifacts you had ready (or built on the spot because they didn't exist), how you sequenced the ramp-up (what they needed day one vs. week two), and a specific gap you caught by actively checking their understanding rather than assuming the docs alone were sufficient. Passive onboarding — "I pointed them at the wiki" — under-delivers; active onboarding checks understanding and corrects it before it becomes a wrong assumption baked into their first deliverable.

**Say it:** "I don't just hand over documentation — I check understanding actively in the first week, because catching a wrong assumption before their first deliverable is far cheaper than fixing it after."
**Red flag:** Equating "I onboarded someone" with "I sent them a link to the docs" — that's making documentation available, not actually onboarding someone.

### Describing the Client/Team Interaction Process
**They ask:** "Walk me through how you'd describe the interaction process between the client and the delivery team on a typical project."

This tests whether you can articulate process, not just execute it: who talks to the client and when (BA as primary liaison for requirements, PM for schedule/budget, tech lead for feasibility — and why routing matters, so the client isn't getting inconsistent answers from different people), what cadence of communication exists (regular syncs vs. ad-hoc), and how information flows both directions — client feedback into requirements changes, team constraints back into what's feasible. A vague answer ("we talk to the client a lot") signals you've participated in the process without ever having to design or explain it.

**Say it:** "I can name exactly who talks to the client about what and why — it's not 'everyone talks to the client,' it's routed so the client gets one consistent voice on requirements instead of conflicting answers from different team members."
**Red flag:** Being unable to say who owns client communication on what topic — inconsistent client-facing answers from different team members is one of the fastest ways to erode trust.

### Spotting and Fixing Weak Processes on a Project
**They ask:** "Tell me about a weak process you identified on a project, and what you did about it."

The senior signal here is diagnosis plus concrete fix, not just complaint. A strong answer: names a specific symptom (repeated miscommunication, requirements changing without traceable approval, sign-off bottlenecks), traces it to the actual process gap causing it (no single owner for change requests, for example), proposes and implements a fix (a lightweight change-control step), and — ideally — has a way of knowing the fix worked (fewer repeat disputes, faster sign-off turnaround). "I noticed things were disorganized" without a traced cause and a fix is an observation, not process improvement.

**Say it:** "I don't just flag that a process is broken — I trace the symptom back to a specific gap, like an undefined change-approval owner, and I can tell you the fix I put in and how I confirmed it actually worked."
**Red flag:** Describing a process problem without naming the root cause or the fix — it reads as complaint, not the process-improvement skill the question is actually testing for.

### Risk Types and the Risk Management Cycle
**They ask:** "What types of risk exist on a software project, and what's the risk management cycle?"

Risk types: scope risk (requirements incomplete or misunderstood), schedule risk, resource risk (key person dependency, availability), technical risk (feasibility, integration unknowns), and external risk (vendor, regulatory, market). The cycle is continuous, not a one-time exercise: identify → assess (likelihood × impact) → plan response (avoid, mitigate, transfer, accept) → monitor → repeat, because new risks surface and old ones change probability as the project progresses. Treating risk management as a document written once at kickoff and never revisited is the most common failure mode.

**Say it:** "Risk management isn't a document I write once at kickoff — it's a cycle I run continuously, because the risk landscape at month one and month four is never the same."
**Red flag:** Listing only technical risks when asked about project risk — scope, schedule, resource, and external risks are just as common and often less visible until they've already caused damage.

### Identifying and Documenting Risks
**They ask:** "How do you actually identify risks on a project, and how do you document them so they're useful?"

Identification comes from structured sources, not gut feel: reviewing the requirements for ambiguity or assumption-heavy areas, talking to the team about technical unknowns, checking historical data from similar past projects, and reviewing external dependencies (vendors, integrations, regulatory changes). Documentation that's actually useful captures more than "risk: integration might fail" — it needs likelihood, impact, a named owner, and a response plan, in a risk register the team actually reviews on a cadence, not a document filed away after the kickoff meeting.

**Say it:** "A risk entry without an owner and a response plan isn't actually managed — it's just recorded, and recorded risk with no owner is the risk that materializes with nobody having done anything about it."
**Red flag:** Documenting risks without assigning an owner or a response strategy — an unowned risk is functionally unmanaged, no matter how well it's described.

### Running the Full Risk Management Cycle
**They ask:** "Tell me about a risk you identified and actively managed through its full lifecycle on a project."

The strong answer traces the whole cycle for one concrete risk: how it was identified, how likelihood/impact was assessed, what response strategy was chosen and why (and why not one of the alternatives — avoid vs. mitigate vs. transfer vs. accept is a real trade-off, not a formality), how it was monitored, and the eventual outcome (materialized and was handled per plan, or didn't materialize and was closed). This demonstrates ownership of the full cycle, not just having identified a risk once and moved on.

**Say it:** "I can walk a risk through its full lifecycle — identification, the response strategy I picked and why I didn't pick the alternatives, how I monitored it, and how it actually resolved — not just that I once flagged something as risky."
**Red flag:** Only being able to describe risk identification, not the response and monitoring that follows — identifying a risk without managing its lifecycle isn't risk management, it's just noticing a problem.

### Demo — Purpose and How to Run One
**They ask:** "What's a sprint or stakeholder demo actually for, and how do you run one well?"

A demo's real purpose is validating that what got built matches what was actually needed — not a status update, and not a sales pitch. Running one well: demo working functionality against real (or realistic) data, not a scripted happy-path-only walkthrough that hides gaps; frame it around the user goal the feature serves, not the technical implementation; and actively solicit feedback in the room rather than treating it as a one-way presentation, because a demo that doesn't surface a misunderstanding early is a demo that just delayed that misunderstanding to UAT or production.

**Say it:** "A demo's job is surfacing a misunderstanding while it's still cheap to fix — so I run it against realistic data and actively ask for reaction, not as a scripted happy-path show-and-tell."
**Red flag:** Running a demo as a purely scripted happy-path walkthrough with no room for stakeholder reaction — it protects the presenter's ego at the cost of catching the misunderstanding early, which is the entire point of the exercise.

### Articulating Business Value
**They ask:** "How do you justify a feature or requirement in terms of business value, not just 'the client asked for it'?"

"The client asked for it" is a request, not a justification — a senior BA translates a request into the actual business outcome it's meant to produce: does it increase revenue, reduce cost, reduce risk, or improve retention/satisfaction? Naming which of those a requirement serves is what lets a team make a real prioritization call when capacity is limited, instead of prioritizing by whoever asked loudest or most recently.

The practical discipline is tying value to something measurable wherever possible — not inventing a number, but asking the stakeholder what metric they'd expect to move, and by roughly how much, before development starts. That's also what makes solution evaluation possible later: without a stated expected outcome, there's no way to check afterward whether the feature actually delivered the value it was justified by.

**Say it:** "I don't accept 'the client wants it' as the justification — I ask which business outcome it serves and what metric should move, because that's the only way to prioritize honestly and the only way to check afterward whether it actually worked."
**Red flag:** Justifying every requirement as valuable by default because a stakeholder requested it. Not naming the actual business outcome means the team can't prioritize rationally or evaluate whether the delivered feature was worth building.
