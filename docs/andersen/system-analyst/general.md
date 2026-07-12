# System Analyst — role and mandate

### What a System Analyst actually does
**They ask:** "How do you define the System Analyst role, and what does an SA actually do day to day?"

The title gets used loosely, so lead with the mandate: a System Analyst translates a business problem into a technical solution that a delivery team can build. That means eliciting and documenting requirements, but the "system" half of the title is the differentiator — an SA is expected to reason about architecture, data flow, integrations, and non-functional constraints (performance, security, scalability), not just business rules. Junior SAs work under supervision on a defined scope; the ownership of ambiguity grows with seniority.

Concretely: run elicitation sessions, write SRS/use-case documentation, model the system (UML/BPMN), define API and integration contracts, and stay the bridge between business stakeholders, architects, and developers for the life of the feature.

**Say it:** "A System Analyst turns a business need into a technical spec a team can build from — the 'system' half means I own architecture-level and NFR reasoning, not just business rules."
**Red flag:** Describing the role as "writing user stories." That's one artifact of many — leaving out modeling, integration design, and NFRs signals you're thinking BA, not SA.

### Systematic thinking on ambiguous problems
**They ask:** "What does 'applying a systems approach' mean in practice, and can you give an example?"

A systems approach means treating the thing you're specifying as a set of interacting components with inputs, outputs, and boundaries — rather than solving the symptom in front of you. In practice: before writing a requirement, map what upstream system produces the data, what downstream system consumes the output, and what breaks if either side changes. It's the habit that catches integration gaps and NFR gaps that a purely business-rules view misses.

A concrete example: a stakeholder asks for "a button that exports orders to CSV." A systems approach asks who consumes that CSV, how often, at what volume, and whether a scheduled feed or an API would actually serve them better than a manual export — often surfacing the real requirement.

**Say it:** "I treat every requirement as part of a system of inputs, outputs, and dependencies — that's what catches the integration and scale questions a purely business-rules read misses."
**Red flag:** Accepting a feature request at face value without asking what system produces or consumes the data on either side of it.

### Mentoring and proposing new approaches
**They ask:** "At the senior level, what changes about the SA role beyond writing better documents?"

Seniority in this role shows up as leverage, not just document quality: a senior SA proposes new approaches — a better integration pattern, a leaner spec template, a smarter estimation technique — instead of only executing the existing process. The second axis is people: mentoring junior analysts, reviewing their SRS drafts, and owning the analysis process for a whole direction or account, not just a single feature.

The interview signal here is concrete examples: "I introduced X and it reduced Y" carries far more weight than "I'm a good communicator."

**Say it:** "Senior SA work is measured by leverage — process or template improvements that other analysts reuse, and mentoring that raises the floor for the whole team, not just my own output."
**Red flag:** Answering a seniority question with soft-skill adjectives instead of a specific process, template, or mentoring outcome you can point to.

### System Analyst vs Business Analyst
**They ask:** "What's the practical difference between a Business Analyst and a System/IT Business Analyst?"

Both elicit and document requirements — the split is which side of the "business need → technical solution" translation each one leans into. A BA stays closer to the business: process modeling, stakeholder management, business rules, ROI framing. A System/IT-BA (SA) leans into the technical half: system architecture, API contracts, data models, NFRs, and enough platform knowledge (OS, protocols, databases) to write a spec a developer doesn't have to re-interpret.

In practice the roles overlap heavily and the same person often does both — but an SA is expected to hold their own in an architecture or database design conversation, where a pure BA would hand that off.

**Say it:** "A BA optimizes the business-process half of the spec; an SA is expected to also reason about architecture, data, and NFRs well enough to write a spec developers can implement without translation."
**Red flag:** Claiming there's no difference at all — on a project big enough to staff both roles, that answer signals you haven't worked on one that separates them.

### Reading a system from documentation alone
**They ask:** "You're dropped onto a legacy system with no one available to explain it — how do you build understanding from documentation and code alone?"

This is a process question, so answer with a sequence, not a list of things you'd read. 1) Inventory what exists — SRS, architecture diagrams, API specs, ER diagrams, ticket history — and note the gaps rather than assuming silence means "no requirement." 2) Read the data model first; a database schema tells you more ground truth about what the system actually does than stale prose does. 3) Trace one or two real end-to-end flows (a request through the API, through the DB, back out) to validate the diagrams against reality. 4) Log every discrepancy between docs and observed behavior as a question for the next person you *can* talk to, instead of guessing.

**Say it:** "I start from the data model, not the prose — a schema doesn't drift the way a stale requirements doc does — then trace one real flow end-to-end to validate the docs against what the system actually does."
**Red flag:** Trusting an old SRS as current truth without cross-checking it against the running system; documentation rot is the default state, not the exception.
