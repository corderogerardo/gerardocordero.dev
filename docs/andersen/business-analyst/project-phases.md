# Project phases — presale through support

### The Presale Phase — What a BA Actually Does
**They ask:** "What does a BA do during presale, and why does it matter for the project's future success?"

Presale is where a project's foundation gets set with the least information and the most consequence — a bad estimate or a fuzzy scope here becomes a contractual constraint the delivery team is stuck with for the whole project. The BA's job in presale is helping produce a credible early scope and estimate: light discovery of the client's problem, a first-pass feature list, and enough clarity on scope boundaries that the estimate isn't fiction. Getting this wrong doesn't just hurt the sale — it hands the delivery team an unrealistic budget or timeline they now have to either meet by cutting corners or renegotiate later, which damages trust either way.

**Say it:** "What I scope and estimate in presale becomes the contract the whole team lives under — so I treat presale analysis with the same rigor as discovery, even though the client relationship and information are both thinner."
**Red flag:** Treating presale as "not real work" compared to discovery — a sloppy presale estimate is one of the most common root causes of an over-budget, over-deadline project.

### Estimating the Presale/Discovery Phase vs the Full Project
**They ask:** "How is estimating the discovery phase itself different from estimating the whole project?"

Estimating discovery is estimating a *known, bounded activity* — you know roughly how many stakeholders, how many sessions, how many artifacts, so it's estimated with reasonable confidence using historical data from similar-sized discoveries. Estimating the full project at the same moment is estimating largely *unknown* work — the actual feature set and complexity aren't fully defined yet, so the estimate is necessarily a range with named assumptions and risk buffers, not a fixed number. Presenting a full-project estimate with false precision at this stage is a classic mistake that sets up a doomed comparison against actual costs later.

**Say it:** "I can estimate discovery itself with real confidence because it's bounded work; the full-project number at that same stage is a ranged estimate with explicit assumptions, and I say so out loud instead of presenting false precision."
**Red flag:** Giving a single-number, high-confidence estimate for the full project before discovery has happened — it sets an expectation you can't actually back, and it's the estimate that gets used against the team later.

### BA's Role in a Real Presale Estimation
**They ask:** "Tell me about a time you participated in presale estimation — what was your specific contribution?"

The senior answer is specific about role: contributing a feature list and rough complexity assessment per feature, flagging assumptions and risks that affect the range, and — critically — pushing back when sales pressure asks for a tighter number than the available information supports. A BA in presale isn't just providing input to someone else's estimate; on a mature team, they may run the estimation session, select the technique (analogous, parametric, expert judgment), and document the assumptions the estimate depends on so they're traceable later.

**Say it:** "My contribution wasn't just a number — it was the feature list, the assumptions the number depends on, and pushing back when the requested estimate didn't match the actual information we had."
**Red flag:** Answering with only "I helped estimate" and no specifics on technique, assumptions, or pushback — it reads as having been in the room, not having driven the work.

### The Discovery Phase — Purpose and Participants
**They ask:** "What's the discovery phase for, who's involved, and what does the analyst actually do there?"

Discovery exists to turn a presale-level rough scope into detailed, validated requirements before the team commits to a development plan — it's where "we think the client needs X" becomes "here's exactly what X means, documented and signed off." Participants typically include the BA (running it), client stakeholders and SMEs, often a solution architect or tech lead (for technical feasibility), and sometimes a PM or delivery lead. The BA's specific job: running elicitation sessions, building the feature list into detailed requirements, and producing the discovery-phase artifacts (V&S, sometimes an early SRS).

**Say it:** "Discovery is where a rough presale scope becomes a validated, detailed requirement set — I'm running the elicitation and producing the artifacts the whole team commits a development plan against."
**Red flag:** Describing discovery as "just more requirements gathering" without connecting it to what it produces (validated scope the team can commit to) — it misses why the phase exists at all.

### Building a Feature List
**They ask:** "Walk me through how you build a feature list during discovery."

A feature list bridges business goals and detailed requirements — it's coarser than a requirement (a feature might decompose into a dozen requirements later) but concrete enough to scope and estimate against. Building one: elicit the business goals first, decompose them into discrete capabilities the system needs to deliver those goals, name each feature in business language (not implementation language), and assign a rough complexity/priority so the list is usable for estimation, not just documentation. A feature list that's really just a rewording of the client's wishlist, with no decomposition or prioritization, doesn't do its job.

**Say it:** "A feature list isn't the client's wishlist copied down — it's business goals decomposed into concrete, estimable capabilities, each one I can trace back to why it exists."
**Red flag:** Producing a feature list with no prioritization or complexity signal — it's unusable for the estimation and scoping decisions the list exists to support.

### Discovery Artifacts — V&S, SRS, and the Rest
**They ask:** "What artifacts does a BA typically produce during the discovery phase, and what's each one's role?"

At minimum, discovery typically produces a Vision & Scope document (problem, boundaries, high-level features) and, depending on the contract model and project complexity, some or all of an SRS. Alongside those: a feature list, a stakeholder list/engagement plan, initial risk register, and often early wireframes or process diagrams (BPMN) used during elicitation to validate understanding with stakeholders. The senior framing: each artifact has a distinct audience and purpose — V&S is for sign-off on scope, SRS is what the dev team builds from, wireframes are for validating UX assumptions before requirements are locked. Producing one without the others usually leaves a gap someone downstream has to fill blind.

**Say it:** "Discovery artifacts aren't redundant — each one serves a different audience: V&S gets scope sign-off, the SRS is what development builds from, wireframes validate assumptions before requirements lock — skipping one just moves that gap downstream."
**Red flag:** Treating the V&S and SRS as interchangeable outputs of discovery — they're sequential, different-altitude documents with different purposes and audiences.

### Running a Real Discovery Phase
**They ask:** "Tell me about a discovery phase you ran end to end — what did you produce, and with what documents?"

The senior version of this answer names the actual document set produced (V&S and/or SRS specifically, not "requirements docs" generically), the elicitation approach used and why, and — importantly — a decision or trade-off made mid-discovery that shaped the outcome (a scope cut, a technique switch when stakeholders disagreed, a risk surfaced that changed the estimate). Vague answers that describe discovery in the abstract, without a concrete artifact and outcome, read as theoretical knowledge rather than done work.

**Say it:** "On [project], discovery produced a V&S and a partial SRS for the payment flow specifically — I switched from interviews to a joint workshop halfway through because two stakeholders had conflicting priority views that needed resolving live, not over email."
**Red flag:** Describing discovery only in generic process terms with no specific artifact or decision named — it's the tell that this is textbook knowledge, not lived experience.

### The Launch Phase — BA Role and Artifacts
**They ask:** "What does a BA do during the launch phase of a project, and what artifacts do they own there?"

Launch is where "the system is built" becomes "the system is live and adopted" — and the BA's role shifts from requirements definition to supporting go-live: verifying acceptance criteria are actually met before sign-off, coordinating user acceptance testing (UAT), documenting known issues and their workarounds, and sometimes producing user-facing documentation or training material. Artifacts here look different from discovery artifacts — release notes, UAT sign-off documents, a cutover/rollback plan if this is a migration — and missing this phase's specific deliverables is a common gap for BAs who've only worked discovery-heavy roles.

**Say it:** "In launch my job shifts from defining requirements to proving they were met — running UAT, getting sign-off, and documenting what's known-broken at go-live so it's not a surprise support inherits."
**Red flag:** Assuming the BA's job ends when development is "done" — unverified acceptance criteria at go-live is exactly the gap the launch phase exists to close.

### The Support Phase — Lines of Support and the BA's Role
**They ask:** "What's the BA's role during the support/maintenance phase, and what are the different lines of support?"

Support is typically tiered: Line 1 (initial triage, often non-technical, resolves common known issues), Line 2 (deeper technical troubleshooting, may need to reproduce and diagnose), Line 3 (development-level fixes, root-cause changes to the system). A BA's role in support is usually clarifying requirement intent when a support ticket is actually a "is this a bug or a missing requirement" question, documenting new requirements that emerge from real usage, and keeping the requirements/traceability artifacts current as the live system evolves — support isn't requirements-free just because development "finished."

**Say it:** "In support, a lot of what looks like a bug ticket is actually 'was this behavior ever specified' — my job is answering that from the requirements artifacts, and updating them when live usage surfaces a genuine gap."
**Red flag:** Assuming a BA has no role once a system reaches support — requirement ambiguity doesn't stop showing up just because the initial build is done; it shows up as production tickets instead.

### Monetization Models for Launched Applications
**They ask:** "What monetization models should a BA understand when scoping a launch-phase product decision?"

Common models: subscription (recurring, predictable revenue, lower barrier to entry for users), freemium (free tier drives adoption, paid tier drives revenue — the BA's job is defining exactly which features sit in which tier), one-time purchase, transaction/commission-based, and advertising-supported. This matters to a BA specifically because the monetization model shapes functional requirements directly — a freemium product needs feature-gating logic and upgrade flows as first-class requirements, not an afterthought bolted on post-launch.

**Say it:** "Monetization isn't a business-side-only decision that happens after the requirements are done — the model picked determines requirements like feature-gating and upgrade flows, so I get it clarified before, not after, I scope those features."
**Red flag:** Treating monetization strategy as entirely outside BA scope — if the product has tiers, gates, or paywalls, that's a functional requirement the BA is responsible for specifying correctly.
