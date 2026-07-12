# Requirements — types, elicitation, documentation, verification

### Classifying requirements: functional, non-functional, and beyond
**They ask:** "How do you classify requirements, and what does each type actually represent?"

Classification isn't academic — it drives who signs off and how you test the requirement. Functional requirements describe *what the system does* ("the system shall let a user reset their password") and map directly to test cases. Non-functional requirements describe *how well* it does it — performance, security, scalability, usability — and usually need a measurable threshold to be testable at all, not just an adjective. Business rules are constraints the business imposes independent of any one feature (a discount policy, a compliance rule) and tend to show up in multiple functional requirements at once. Constraints are externally imposed limits — a mandated tech stack, a regulatory deadline — that aren't negotiable the way a feature is.

**Say it:** "Functional requirements are testable behavior, non-functional requirements are testable quality attributes, and business rules are the constraints that cut across both — mixing them into one undifferentiated backlog item is where traceability breaks down."
**Red flag:** Writing a non-functional requirement without a number — "the system should be fast" isn't verifiable; "95th-percentile response time under 300ms at 500 concurrent users" is.

### Non-functional requirements — the SA's home turf
**They ask:** "Walk me through the categories of non-functional requirements you'd elicit for a new system, with an example of each."

This is where the "system" in System Analyst earns its name — NFRs are the requirements a purely business-focused BA is least equipped to elicit. Performance (response time, throughput under load), scalability (horizontal vs. vertical, expected growth curve), security (authN/authZ model, encryption at rest/in transit, compliance regime), availability/reliability (uptime SLA, disaster-recovery RTO/RPO), and usability/accessibility round out the common set. Each needs a number and a measurement method, or it's not actionable — a developer can't "design for scalability" without knowing the target load.

```
NFR-014  Performance   95th-percentile API response < 300ms @ 1,000 rps
NFR-022  Availability  99.9% uptime, RTO 15 min, RPO 5 min
NFR-031  Security      All PII encrypted at rest (AES-256) and in transit (TLS 1.2+)
```

**Say it:** "I elicit NFRs the same way as functional ones — by category, with a number and a measurement method attached, because 'fast' and 'secure' aren't requirements until they're testable."
**Red flag:** Treating NFRs as an afterthought appended at the end of discovery instead of eliciting them category by category alongside the functional scope.

### Transitional requirements
**They ask:** "What are transitional (transition) requirements, and when do they show up in a project?"

Transitional requirements describe what's needed to move *from* the current state *to* the new system — they disappear once the cutover is done, unlike functional and non-functional requirements which describe the target state permanently. Data migration rules, a period of parallel-running old and new systems, user training, and a rollback plan are the classic examples. They're easy to miss because nobody "owns" the current state in the same way they own the target state, but skipping them is how a technically correct system still fails its launch.

**Say it:** "Transitional requirements are temporary by definition — data migration, parallel run, rollback plan — and I call them out separately so they don't get silently dropped once the target-state spec looks done."
**Red flag:** Treating data migration as an implementation detail instead of a requirement with its own acceptance criteria and rollback plan.

### Choosing an elicitation technique
**They ask:** "What elicitation techniques do you know, and how do you decide which one fits a given situation?"

The techniques — interviews, workshops/JAD sessions, surveys/questionnaires, observation (job shadowing), document analysis, and prototyping — trade off depth against reach. Interviews and workshops surface depth and unstated assumptions but don't scale past a handful of stakeholders; surveys scale but only answer questions you thought to ask; observation catches the gap between what people say they do and what they actually do; document/artifact analysis is cheap but only as current as the documentation.

The selection criteria: number of stakeholders, how well-defined the domain already is, and how much stakeholder time you can realistically get. A greenfield product with five founders gets workshops; a compliance-heavy rewrite of an existing system starts with document analysis and observation before you ever schedule an interview.

**Say it:** "I pick the technique by stakeholder count and domain maturity — workshops for a small, undefined domain, document analysis and observation first when a system already exists and I need to validate against reality, not just opinion."
**Red flag:** Defaulting to interviews for everything — they don't scale, and they miss the gap between stated and actual behavior that observation catches.

### Preparing for and following up on elicitation
**They ask:** "How do you prepare for an elicitation session, and what do you do with what you gather afterward?"

Preparation is what separates a productive session from a rambling one: define the session's goal and scope up front, identify and invite the right stakeholders (not just the available ones), and prepare a question list or agenda so the conversation doesn't drift. For a workshop, that includes a facilitation plan — who's driving, how disagreements get parked instead of derailing the session.

Afterward, raw notes aren't a requirement — the follow-up work is where the analysis happens: consolidate overlapping input from multiple stakeholders, resolve conflicts, convert statements into testable requirement language, and get sign-off before it becomes the source of truth. Senior analysts keep their own reusable blanks — question checklists, artifact templates — so this doesn't start from a blank page every time.

**Say it:** "The session is the easy part — the value is in the prep, which keeps the room focused, and the follow-up, which turns raw notes into testable, sourced requirements before anyone builds against them."
**Red flag:** Pasting stakeholder statements directly into the requirements doc as-is — untranslated, unverified, and usually not independently testable.

### Why you document requirements at all
**They ask:** "Why bother formally documenting requirements instead of just building from the conversation?"

Documentation exists to survive the people who had the conversation — a verbal agreement isn't reviewable, traceable, or testable, and it evaporates when a stakeholder changes their mind or leaves the project. A written requirement is what QA tests against, what a new team member reads on day one, and what settles a "that's not what I asked for" dispute six months later with evidence instead of memory.

The basic ways to document range from a lightweight backlog item (user story + acceptance criteria) for an agile team, to a formal SRS section for a regulated or fixed-price engagement — the format changes with project needs, but the underlying job (make the requirement reviewable and testable) doesn't.

**Say it:** "Documentation isn't bureaucracy — it's the artifact that survives the meeting, gets tested against, and settles scope disputes with evidence instead of memory."
**Red flag:** Treating documentation format as a fixed company standard rather than something you tailor to the project's contract model and regulatory needs.

### Use Cases vs User Stories vs Gherkin
**They ask:** "How do Use Cases and User Stories differ, and when would you reach for Gherkin instead of either?"

A Use Case is a structured, actor-centric description of a full interaction with the system — main flow plus alternate and exception flows — and suits complex, multi-step business processes where the branching matters (an insurance claim, a checkout with three payment failure paths). A User Story ("As a &lt;role&gt;, I want &lt;goal&gt;, so that &lt;benefit&gt;") is deliberately lightweight — a placeholder for a conversation, sized for one sprint — and fits agile teams iterating fast on smaller slices. Use Cases front-load detail; User Stories defer it to acceptance criteria written closer to implementation.

Gherkin (`Given/When/Then`) sits underneath either one as an executable specification format — it turns acceptance criteria into something a BDD framework can run as a test, which is why teams doing continuous delivery reach for it even on top of a User Story.

```gherkin
Scenario: Password reset with expired token
  Given a user requests a password reset
  And the reset token is older than 24 hours
  When the user submits a new password with that token
  Then the system rejects the request with "token expired"
```

**Say it:** "Use Cases carry the branching detail up front for complex flows; User Stories defer detail to a later conversation for fast iteration; Gherkin makes the acceptance criteria executable regardless of which one I started from."
**Red flag:** Writing a User Story with no acceptance criteria at all — "so that" isn't a substitute for a testable Given/When/Then.

### Managing requirements end to end
**They ask:** "How do you manage requirements over the life of a project, beyond just writing them down?"

Requirements management is the discipline of keeping the requirement set traceable and current — a requirements traceability matrix links each requirement to its source (stakeholder, business goal), its downstream artifacts (design, code, test case), and its status. Without it, you can't answer "why does this exist" or "what breaks if I remove it," and impact analysis on a change request becomes guesswork instead of a lookup.

In practice this lives in a requirements management tool (Jira, Azure DevOps, or a dedicated RM tool like Jama/DOORS on regulated projects) rather than a static document, precisely because requirements move.

**Say it:** "A traceability matrix is what turns 'why does this requirement exist' from an archaeology project into a lookup — every requirement links back to its source and forward to its test case."
**Red flag:** Treating the SRS as a document you write once at the start and never touch again — requirements management is the ongoing discipline of keeping it current, not a one-time deliverable.

### Managing changes to requirements
**They ask:** "A stakeholder wants to change an already-approved requirement mid-sprint — what's your process?"

Uncontrolled requirement change is how scope creep happens invisibly. The process: 1) log the change request with its rationale, not just the new ask; 2) run impact analysis using the traceability matrix — what design, code, tests, and *other* requirements does this touch; 3) get the change re-approved by whoever owns that requirement, with the cost/impact visible to them, not buried; 4) update the requirement's version and re-baseline the affected artifacts, so "why did this change" stays answerable a year later.

At senior level this extends to fully tracking communications, not just the requirement text — who asked for what, when, and why, so a dispute about scope has a paper trail.

**Say it:** "Change isn't the enemy — undocumented change is. Every change gets impact-analyzed against the traceability matrix and re-approved with the cost visible before it's baselined."
**Red flag:** Quietly editing the requirement to match what got built instead of running it through change control — that's how "the spec" stops meaning anything.

### Verification vs validation
**They ask:** "What's the difference between requirements verification and requirements validation, and what makes a requirement 'good' in the first place?"

Verification asks "did we build the requirement right" — is it internally consistent, unambiguous, complete, testable — and happens against the requirement document itself. Validation asks "did we build the right requirement" — does it actually solve the stakeholder's problem — and happens against the business need, ideally with the stakeholder in the room. You can pass verification (a perfectly clear, testable requirement) and still fail validation (clear specification of the wrong thing).

The characteristics of a well-written requirement — unambiguous, testable, traceable to a source, feasible, prioritized, and atomic (one requirement, one thing) — are exactly what verification checks for. Both should happen *before* development starts, not after, when the cost of a wrong requirement is orders of magnitude higher to fix.

**Say it:** "Verification checks the requirement is well-formed; validation checks it's the right requirement at all — I run both before a single line of code depends on it, because catching a wrong requirement post-build costs ten times more."
**Red flag:** Conflating the two terms in an interview — it's a fast way to signal you've memorized the words but not the distinction.

### Reviewing requirements — techniques and process
**They ask:** "How do you review requirements — your own and other people's — and how would you set that process up for a whole project?"

Reviewing your own requirements starts with a checklist pass against the well-formed criteria (unambiguous, testable, atomic, traceable) before anyone else sees it — catching your own gaps is cheaper than someone else catching them. Reviewing someone else's adds a second lens: does it actually match what the stakeholder described, and does it conflict with any existing requirement.

At project scale this becomes a formal process: peer review or a walkthrough session before a requirement is baselined, a checklist or definition-of-ready gate, and — on stricter projects — techniques like inspections or requirements testing (walking through the requirement as if it were a test case, checking it produces an unambiguous pass/fail). The goal is catching ambiguity while it's still a sentence, not after it's a feature.

**Say it:** "I run my own requirements against a well-formed checklist before anyone else sees them, then set up a peer-review gate at the project level so ambiguity gets caught as a sentence, not as a built feature."
**Red flag:** Skipping requirement review because "the developers will ask if something's unclear" — that pushes the cost of ambiguity into the sprint instead of catching it for free beforehand.
