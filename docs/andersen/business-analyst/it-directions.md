# IT directions — PM, QA, UX/UI, DevOps, BI, contract models

### PM Role and Tasks on a Project
**They ask:** "What's the Project Manager's role, and how does it relate to yours as a BA?"

The PM owns delivery — scope, schedule, budget, and the team's execution against a plan — while the BA owns the *content* of what's being delivered: eliciting, documenting, and validating what the product should actually do. The reason this distinction matters in an interview is that on smaller projects the two roles blur (a BA might carry PM-adjacent responsibilities, or vice versa), and being precise about the boundary shows you understand where your accountability starts and stops.

Concretely, a PM tracks the project triangle (scope, time, cost) and manages risk to *the delivery*, while a BA manages risk to *the requirements* — ambiguity, missed stakeholders, scope creep in what's being built. They collaborate constantly: a BA's discovery output (a feature list, an SRS) is what a PM estimates and schedules against.

**Say it:** "The PM owns delivery — scope, schedule, budget — and I own the content of what's being delivered; my discovery output is exactly what the PM estimates and plans against, so we're in constant lockstep, not separate lanes."
**Red flag:** Describing the PM and BA roles as interchangeable. On a project with both roles staffed, conflating them signals you haven't worked on a team large enough to need the distinction — or haven't thought about where accountability actually sits.

### PM vs Delivery Manager vs Delivery Director
**They ask:** "What's the difference between a PM, a Delivery Manager, and a Delivery Director?"

These three titles track increasing scope, not increasing seniority within the same job. A **Project Manager** owns one project end to end — its scope, timeline, budget, and team. A **Delivery Manager** typically owns delivery *process* across multiple projects or a program, focused more on removing organizational friction and coordinating cross-project dependencies than on any single project's day-to-day plan. A **Delivery Director** sits above that — owning the delivery function's outcomes and health across an account or business unit, closer to a client-relationship and organizational-strategy role than hands-on project execution.

The senior BA signal here is recognizing that as you climb this chain, the work shifts from managing *a plan* to managing *relationships and organizational systems* — which is also roughly the trajectory a BA follows toward more strategic, business-facing work.

**Say it:** "PM owns one project's plan, Delivery Manager owns process and coordination across multiple projects, Delivery Director owns the delivery function's outcomes at the account or business level — each step up trades hands-on execution for organizational and relationship scope."
**Red flag:** Assuming these titles are just seniority levels of the same job. Each one has a genuinely different scope of ownership — conflating them misses what actually changes as you go up.

### PM Responsibilities Across Project Stages
**They ask:** "How does the PM's responsibility change across the different phases of a project?"

A PM's job isn't uniform across the lifecycle — it shifts focus at each stage, and knowing this is what lets a BA anticipate what the PM needs from them at any given moment. In **presale/discovery**, the PM (often alongside a BA) is estimating scope and resourcing, more forecasting than managing. During **active development**, the PM's focus is tracking progress against the plan, managing the team's velocity, and actively managing risk and scope changes as they surface. During **launch**, the PM coordinates the cutover itself — deployment timing, stakeholder communication, rollback readiness. During **support**, the PM's role often shrinks to overseeing SLAs and prioritizing incoming issues rather than driving active delivery.

**Say it:** "The PM's focus moves from forecasting in discovery, to tracking and risk management during build, to coordinating cutover at launch, to overseeing SLAs in support — each stage needs a different kind of PM attention, and I plan my own deliverables around that shift."
**Red flag:** Treating "PM responsibilities" as a static list unrelated to project stage. A PM managing a support queue and a PM running discovery estimation are doing genuinely different jobs.

### QA Role and Basic Artifacts
**They ask:** "What's the QA's role on a project, and what artifacts do they typically produce?"

QA's job is to verify that what was built actually matches what was specified — and the BA connection is direct: QA can only test against requirements that are clear and testable, so vague requirements produce vague test coverage. The core artifacts are the **test plan** (the overall strategy — what will be tested, how, with what resources), **test cases** (specific, step-by-step scenarios with expected results), and **bug/defect reports** (a structured description of what went wrong, with steps to reproduce).

The practical overlap: a BA's acceptance criteria often become the backbone of a QA's test cases directly — which is exactly why acceptance criteria need to be precise and unambiguous, not just "the button works."

**Say it:** "QA verifies the build against the spec, and their test cases often trace directly back to my acceptance criteria — which is a good forcing function for writing criteria precisely, since vague criteria produce vague test coverage."
**Red flag:** Treating QA as a downstream gate unrelated to requirements quality. Weak acceptance criteria is one of the most common root causes of a weak test suite — the BA has real leverage here.

### Testing Types Classification
**They ask:** "What types of testing should a BA be able to talk about, even without owning them directly?"

Testing splits along a few independent axes, and knowing the vocabulary lets a BA participate meaningfully in scope and risk conversations. By **level**: unit (one function/component in isolation), integration (components working together), system (the whole application end to end), acceptance (does it satisfy the business requirement — often where a BA is directly involved). By **approach**: functional (does it do what it should) vs. non-functional (performance, security, usability — testing the non-functional requirements a BA documented). By **automation**: manual vs. automated, a trade-off between upfront cost and long-term repeatability.

The BA's most direct stake is in **acceptance testing** and **user acceptance testing (UAT)** specifically — UAT is where the actual business stakeholder confirms the system does what they asked for, which is the closest thing to a final validation of the BA's own requirements work.

**Say it:** "I don't own most testing types, but I own the requirement UAT validates against — UAT is effectively the final check on my own work, which is why I stay engaged through that stage even though QA drives the mechanics."
**Red flag:** Treating UAT as "QA's problem." UAT specifically validates the business requirement was captured correctly — if it fails, that's often a signal the requirement itself was ambiguous, not just that the code has a bug.

### Defect Classification
**They ask:** "How are defects (bugs) typically classified, and why does a BA need to know this?"

Defects are usually classified along two independent axes: **severity** (the technical impact — how badly it breaks the system: critical/blocker, major, minor, trivial) and **priority** (how urgently it needs fixing, which is a business decision, not a technical one). The two don't always move together — a cosmetic typo on the homepage might be low severity but high priority right before a big launch, while a crash in a rarely-used admin feature might be high severity but low priority.

A BA's stake in this is direct: priority is often a business call the BA is asked to weigh in on, since it requires understanding business impact, not just technical impact — which is exactly the judgment a QA engineer isn't positioned to make alone.

**Say it:** "Severity is a technical judgment about how badly something breaks; priority is a business judgment about how urgently it needs fixing — and priority calls are often where I get pulled in, because they need business context QA doesn't have."
**Red flag:** Conflating severity and priority as the same thing. They can diverge sharply, and defending a triage decision requires being able to name which axis is actually driving the call.

### Test Design Techniques and Bug Reports
**They ask:** "What test design techniques do you know, and what makes a defect report actually useful?"

A few well-known techniques let QA (and a BA reviewing coverage) systematically derive test cases instead of guessing: **equivalence partitioning** (group inputs into classes that should behave the same, test one representative from each), **boundary value analysis** (test right at the edges of valid ranges, where bugs cluster), and **decision table testing** (enumerate every combination of business-rule conditions to make sure none is missed) — that last one maps directly onto a BA's own business rules documentation.

A useful defect report is reproducible and specific: clear steps to reproduce, expected vs. actual result, environment/data context, and severity — a report a developer can't reproduce from is functionally useless regardless of how real the bug is.

**Say it:** "Decision table testing is the technique I lean on most directly, because it maps onto the same business rules I document — every combination of conditions gets a test case, so nothing falls through a gap in my own requirement."
**Red flag:** Writing (or accepting) a bug report with no reproduction steps. "It doesn't work" isn't a defect report — without exact steps and expected-vs-actual, it can't be triaged or fixed.

### UX vs UI
**They ask:** "What's the difference between UX and UI, and why does a BA need to be precise about it?"

**UX (User Experience)** is about whether the product actually solves the user's problem effectively — the flow, the information architecture, the friction points, tested through research and usability studies. **UI (User Interface)** is the actual visual and interactive surface — colors, typography, spacing, components — the concrete artifact a user touches. UX asks "does this work for the user"; UI asks "does this look and feel right."

A BA cares about both but for different reasons: UX overlaps directly with requirements work (a bad flow is a requirements problem as much as a design problem), while UI is more the designer's domain — a BA's job there is usually collaborating and giving business-context feedback, not dictating visual choices.

**Say it:** "UX is whether the flow actually solves the user's problem — which overlaps with requirements — UI is the visual surface itself; I engage deeply on UX and collaborate on UI rather than dictate it."
**Red flag:** Using "UX/UI" as one interchangeable term. Conflating them in an interview signals you haven't worked closely enough with a design team to know where research and flow end and visual design begins.

### UX/UI Principles and Tools a BA Should Know
**They ask:** "What UX/UI principles and tools should a BA at least be conversationally fluent in?"

A BA doesn't design, but needs enough fluency to give useful feedback and write requirements that don't fight good design. Core principles worth knowing: **consistency** (repeated patterns reduce learning cost), **visual hierarchy** (guiding attention to what matters most first), **accessibility** (contrast ratios, readable font sizes, keyboard navigation — often a compliance requirement, not just a nicety), and **feedback** (the system should always show the user the result of their action).

On tools, fluency with **Figma** specifically matters at a senior level — being able to open a design file, leave comments tied to specific elements, and understand a component library well enough to reference exact screens in requirements, rather than describing UI in vague prose.

**Say it:** "I don't design, but I need enough fluency in consistency, hierarchy, and accessibility to write requirements that support good design instead of fighting it — and enough Figma fluency to reference exact screens instead of describing UI in prose."
**Red flag:** Writing UI requirements in vague, subjective language ("make it feel clean and modern") instead of referencing a concrete design artifact. That's not a testable requirement — it's an opinion with nothing to verify against.

### Working With a Designer in Figma
**They ask:** "You've collaborated with a designer — walk me through what that collaboration actually looks like."

The collaboration flows in both directions: the BA feeds the designer requirements, user flows, and business constraints (regulatory copy, required fields, edge cases the design needs to account for) so the design starts from real inputs rather than assumptions; the designer feeds back a concrete visual and interaction model the BA then validates against the original requirement and uses to refine acceptance criteria with actual screens attached.

In Figma specifically, that means leaving comments directly on frames tied to a specific requirement or user story, cross-referencing frame links in the SRS or backlog item instead of screenshots that go stale, and flagging where a design choice conflicts with a business rule *before* it reaches development — catching that in Figma is far cheaper than catching it in a sprint review of built code.

**Say it:** "I feed the designer the business constraints and edge cases up front, then use Figma comments and frame links to tie every design decision back to a specific requirement — catching a design/business-rule conflict in Figma is a five-minute comment; catching it after it's built is a rework ticket."
**Red flag:** Handing off requirements to a designer and only reviewing the finished mockups. Waiting until the design is "done" to catch a business-rule conflict means the fix costs a redesign instead of a comment.

### DevOps Goals and CI/CD/CD
**They ask:** "What are DevOps's goals, and what's the difference between CI, Continuous Delivery, and Continuous Deployment?"

DevOps exists to close the gap between building software and running it reliably in production — its core goals are faster, more reliable releases and shorter feedback loops between writing code and learning whether it works. **Continuous Integration (CI)** means every code change is merged and automatically built/tested frequently, catching integration problems early instead of at a big-bang merge. **Continuous Delivery** extends that: every change that passes CI is automatically prepared for release (built, tested, packaged) and could be deployed at any time — but a human still triggers the actual release. **Continuous Deployment** goes one step further: every change that passes the pipeline is deployed to production automatically, with no manual gate.

The BA-relevant distinction is that last human gate: delivery keeps a deliberate release decision (useful when business timing matters — a coordinated launch, a compliance window); deployment removes it entirely, which requires very high confidence in automated testing.

**Say it:** "CI catches integration problems early through frequent automated builds; Continuous Delivery keeps every passing change release-ready but gated by a human decision; Continuous Deployment removes that gate entirely — which release timing model to run is itself a business decision, not just a technical one."
**Red flag:** Using "Continuous Delivery" and "Continuous Deployment" interchangeably. The presence or absence of that final human release gate is a real, business-relevant difference, not a synonym swap.

### Gitflow and Build Tools (Jenkins, TFS, TeamCity)
**They ask:** "What's the Gitflow branching model, and what are Jenkins, TFS, and TeamCity used for?"

Gitflow is a branching strategy that structures parallel work: a long-lived `main` branch always reflects production, a `develop` branch integrates ongoing work, and short-lived `feature`, `release`, and `hotfix` branches isolate specific pieces of work before merging back. The BA-relevant point: it gives a predictable answer to "what's actually in production right now versus what's still in progress," which matters when scoping a release or explaining to a client what a given deployment will and won't include.

**Jenkins**, **TFS (Team Foundation Server / Azure DevOps)**, and **TeamCity** are CI/CD orchestration tools — they automate the build-test-deploy pipeline that turns a merged branch into a running release. A BA doesn't configure these, but recognizing them signals you understand the mechanism that turns "code is done" into "code is live," which shapes realistic expectations about release timing.

**Say it:** "Gitflow gives a predictable answer to what's actually live versus still in progress, which is exactly what I need to responsibly scope a release conversation with a client — Jenkins, TFS, and TeamCity are the pipeline tools that automate getting a merged branch into production."
**Red flag:** Promising a client a feature is "basically live" the moment it's merged to develop. Gitflow's whole point is that develop and production are different branches — conflating them sets a wrong expectation.

### Contract Models — Fixed Price vs Time & Materials vs Dedicated Team
**They ask:** "Give a complete breakdown of Fixed Price, Time & Materials, and Dedicated Team — pros, cons, and when each fits."

These three models trade off differently across the classic project triangle (scope, time, cost), and picking the wrong one for a given project shape creates friction that surfaces as change-request disputes later. **Fixed Price** locks scope and cost upfront — great for a well-defined project with low ambiguity (a compliance-driven system, a small well-scoped tool), but painful for anything with real discovery risk, since any scope change becomes a formal, often adversarial change-request process. **Time & Materials (T&M)** fixes neither scope nor cost — the client pays for actual hours worked, which fits evolving, Agile projects where requirements are expected to change, but requires real client trust since the total cost isn't capped upfront. **Dedicated Team** is a variant of T&M at a larger scale — the client effectively rents a whole team's capacity over time, ideal for a long-term product with an evolving roadmap rather than a single deliverable.

The senior framing: Fixed Price fixes scope and lets time/cost float within that; T&M fixes the team's cost rate and lets scope float; a BA's job under Fixed Price is airtight upfront requirements, while under T&M it's continuous backlog prioritization since scope is a living decision, not a locked contract.

**Say it:** "Fixed Price locks scope so my job is airtight upfront requirements since every change becomes a formal negotiation; T&M and Dedicated Team leave scope open so my job shifts to continuous backlog prioritization — which model a client picks should track how well-understood the requirements actually are, not just their appetite for cost certainty."
**Red flag:** Recommending Fixed Price for a project with genuine requirements ambiguity (a new product, unclear market fit). Locking scope before the requirements are actually knowable just moves the ambiguity into a change-request fight later.

### Business Intelligence — Purpose and Tools
**They ask:** "What is a BI system used for, and what tools should a BA recognize?"

A BI (Business Intelligence) system exists to turn raw operational data into decisions — collecting data from across the business, transforming it, and surfacing it through reports and dashboards so stakeholders can see trends and make decisions without manually querying a database. The BA angle: BI requirements are a distinct discipline from feature requirements — instead of "what should the system do," the question is "what decision does this stakeholder need to make, and what data answers it."

Common tools a BA should recognize: **Power BI** and **Tableau** for dashboards and visualization, and the underlying data pipeline tools (data warehouses, ETL tools) that feed them — a BA doesn't build the pipeline, but needs to understand there is one, since a dashboard is only as good as the data feeding it.

**Say it:** "BI requirements start from a different question than feature requirements — not 'what should the system do' but 'what decision does this stakeholder need to make, and what data answers it' — and a dashboard is only as trustworthy as the pipeline feeding it, which I need to at least understand exists."
**Red flag:** Treating a dashboard requirement like a UI requirement ("show me these numbers on a screen") without asking what decision it's meant to support. That produces a dashboard nobody actually uses to decide anything.

### ETL, Data Mining, and Building Dashboards
**They ask:** "What are ETL and data mining used for, and what does the full cycle of building a dashboard look like?"

**ETL (Extract, Transform, Load)** is the pipeline that moves data from operational systems into a data warehouse in a usable, consistent shape — extract from source systems, transform (clean, standardize, join) it into the warehouse's schema, load it. Without ETL, a BI report is querying messy, inconsistent operational data directly, which produces unreliable numbers. **Data mining** is the analytical layer on top — finding patterns, correlations, and predictive signals in that cleaned data that aren't obvious from a simple report.

The full dashboard cycle a BA should be able to walk through: (1) identify the business question/decision the dashboard needs to support, (2) identify the data sources that answer it, (3) work with data engineering on the ETL to get that data into a usable shape, (4) define the specific metrics and visualizations that actually answer the business question, (5) validate the dashboard with the stakeholder against real decisions they need to make, not just "does it look right."

**Say it:** "ETL is what makes a dashboard's numbers trustworthy in the first place — clean, consistent data instead of raw operational noise — and the full cycle starts and ends with the business question, not the visualization; I validate a dashboard against real decisions the stakeholder needs to make."
**Red flag:** Starting dashboard requirements with the chart type instead of the business question. That produces a dashboard optimized for looking good in a demo, not for actually supporting a decision.

### Development Domains a BA Should Recognize
**They ask:** "What do you know about AI & ML, Big Data, IoT, Blockchain, and AR/VR as development domains?"

A BA doesn't need deep technical expertise in these domains, but needs enough conceptual grounding to recognize when a client's problem actually fits one, and what that implies for requirements and discovery. **AI & ML** solves problems where the rules are too complex or fuzzy to hand-code (recommendation, fraud detection, classification) — requirements shift from "the system does X" to "the system learns to do X well, given labeled data." **Big Data** is about volume, velocity, and variety of data beyond what a traditional database handles well — requirements center on data pipelines and analytics infrastructure, not just features. **IoT** connects physical devices to software — requirements need to account for unreliable connectivity, device constraints, and real-world latency that a pure web app never has to consider. **Blockchain** provides decentralized, tamper-evident record-keeping — it's a fit only when trustless verification between parties who don't trust each other is the actual requirement, not a buzzword. **AR/VR** overlays or replaces the physical environment — requirements are dominated by spatial UX and hardware constraints that don't exist in a flat-screen app.

**Say it:** "For each of these, my job isn't the implementation — it's recognizing whether the client's actual problem fits the domain at all, because each one reshapes what a requirement even looks like: ML requirements are about training data, IoT requirements are about unreliable connectivity, blockchain only fits genuine trustless verification."
**Red flag:** Recommending blockchain, AI, or any trendy domain because a client asked for it by name rather than because their actual problem needs it. A senior BA pushes back and clarifies the real requirement before endorsing the technology.

### Applying Development Domains to Business Cases
**They ask:** "Give a business-domain example of where AI/ML, Big Data, IoT, Blockchain, or AR/VR is the right fit — and where it's an obvious overreach."

The senior signal here is being specific about *which business domain* a technology genuinely fits, not reciting the tech in the abstract. **AI/ML** fits e-commerce recommendation engines and fraud detection in fintech, where pattern recognition at scale beats hand-coded rules. **Big Data** fits any high-volume analytics use case — telecom call records, retail transaction analysis — where traditional databases hit real scale limits. **IoT** fits logistics (fleet tracking), healthcare (remote patient monitoring), and manufacturing (predictive maintenance from sensor data) — anywhere a physical asset needs continuous, real-world data. **Blockchain** genuinely fits supply-chain provenance tracking and cross-organizational settlement, where multiple parties who don't fully trust each other need a shared, tamper-evident record — it's an overreach for a single-company internal system with one source of truth already. **AR/VR** fits retail (virtual try-on), real estate (virtual tours), and industrial training simulations.

**Say it:** "The test I apply for any of these is whether the domain's core property is actually the requirement — blockchain's core property is trustless multi-party verification, so if there's already one trusted source of truth, it's the wrong tool regardless of how it's pitched."
**Red flag:** Justifying a domain choice with "it's more modern" instead of naming the specific business property it provides. That's the tell an interviewer is listening for — a senior BA ties technology choice to a concrete requirement, not to trend-chasing.
