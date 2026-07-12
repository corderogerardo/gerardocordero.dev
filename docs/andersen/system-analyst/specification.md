# Specification — SRS and Vision & Scope

### The SRS document — purpose and structure
**They ask:** "What is an SRS document, why is it needed, and what's its typical structure?"

A Software Requirements Specification is the single document a development team, QA, and the client all agree is the source of truth for *what* the system must do — its job is to remove ambiguity before anyone starts building, not to describe how it'll be built. A typical structure: introduction (purpose, scope, definitions), overall description (product perspective, user classes, constraints, assumptions), specific requirements (functional requirements, often organized by feature or use case, plus the non-functional requirements section), and appendices (glossary, analysis models like diagrams).

The value isn't the template — it's that everyone reviewing it is looking at the same, versioned artifact instead of a scattered set of emails and Slack threads.

**Say it:** "An SRS's job is to be the one document everyone — client, dev, QA — agrees is the source of truth for what's being built, before anyone starts building it."
**Red flag:** Treating the SRS as a formality to produce after development starts, rather than the gate that should exist before it does.

### When you actually need a full SRS
**They ask:** "When do you actually draw up a full SRS, versus a lighter form of documentation — and how does an SRS differ from other spec types?"

A full SRS earns its overhead when the cost of ambiguity is high: fixed-price contracts (the SRS *is* the scope you're bound to), regulated domains (medical, financial) where an auditor expects a formal artifact, large teams where verbal alignment doesn't scale, or long-lived systems that will outlive the people who built them. It's overkill for a small agile team iterating weekly with a co-located product owner — a well-groomed backlog with acceptance criteria does the same job with less ceremony.

The difference from other documentation types is precision and completeness: a Vision & Scope document sells the *why* and the boundaries at a high level; a User Story is a placeholder for a conversation; an SRS is meant to be complete and unambiguous enough to build from without further clarification.

**Say it:** "I reach for a full SRS when ambiguity is expensive — fixed-price scope, regulated domains, large or distributed teams — and skip the ceremony when a groomed backlog with acceptance criteria already removes the ambiguity just as well."
**Red flag:** Writing a full IEEE-style SRS for a five-person startup iterating weekly — the process cost outweighs the ambiguity it's removing.

### Writing SRS to IEEE/ISO and RUP standards
**They ask:** "What SRS standards do you know, and what's the difference between writing a section of one under guidance and owning the full document?"

IEEE 830 (and its successor, ISO/IEC/IEEE 29148) define the canonical SRS structure and quality criteria — correct, unambiguous, complete, consistent, ranked, verifiable, modifiable, traceable. RUP (Rational Unified Process) takes a different shape: instead of one monolithic SRS, requirements live as a Vision document plus a set of use cases, iterated across the process's phases. Knowing both means you can adapt to whichever house standard a client already runs.

The seniority line here is real: writing an assigned section against a template is a J3/M1 skill; owning the full document — deciding what sections apply, resolving conflicts between stakeholder input across sections, and being accountable for its completeness — is where M2+ experience shows up.

**Say it:** "IEEE/ISO 29148 and RUP structure requirements differently — monolithic SRS versus Vision-plus-use-cases — and I can work in either, but the real seniority marker is owning the whole document's completeness, not just drafting an assigned section."
**Red flag:** Naming a standard by acronym without being able to say what quality criteria it actually enforces (unambiguous, verifiable, traceable, etc.) — that's a memorized label, not working knowledge.

### Vision & Scope — purpose and structure
**They ask:** "What is a Vision & Scope document for, when is it used, and what's its standard structure?"

A Vision & Scope document answers "why are we building this and what's explicitly out of bounds" at a level a non-technical stakeholder and an executive sponsor can both sign off on — it precedes the SRS and sets the boundary the SRS then fills in with detail. It's most useful at project kickoff or presale, before detailed requirements exist, to align expectations and prevent scope disagreements later.

Standard sections: business requirements/objectives, project scope (in-scope and explicitly out-of-scope), stakeholder list, high-level feature list, constraints and assumptions, and success criteria. Teams typically start from an existing template and adapt it rather than writing one from scratch each time.

**Say it:** "Vision & Scope sets the boundary before the SRS fills in the detail — it's the document that gets a non-technical sponsor's sign-off on 'why' and 'what's out of scope' before anyone argues about feature-level specifics."
**Red flag:** Skipping the "explicitly out of scope" section — an unstated boundary is exactly what turns into a scope dispute three months in.

### Adapting and presenting the V&S document
**They ask:** "How do you adapt a V&S template to a specific project, and how do you present it to stakeholders?"

Adapting a template means removing sections that don't apply (a small internal tool doesn't need a market-analysis section) and adding project-specific ones (a compliance section for a regulated client) rather than filling out every section of a generic template regardless of fit — a bloated V&S gets skimmed, not read. Senior analysts keep their own set of reusable templates and blank sections built from past projects, so this adaptation is fast rather than a from-scratch exercise each time.

Presenting it is a distinct skill from writing it: walking a room of stakeholders and the delivery team through the document, surfacing disagreements about scope boundaries live rather than discovering them after everyone's already "approved" a document they skimmed.

**Say it:** "I adapt the V&S template to the project, not the other way around — and I present it live so scope disagreements surface in the room, not three sprints later as a change request."
**Red flag:** Emailing the V&S for silent sign-off instead of walking stakeholders through it — silence isn't agreement, it's usually "I didn't read it."

### SRS vs Vision & Scope vs lighter specs — choosing the artifact
**They ask:** "Given a project, how do you decide whether it needs a V&S, a full SRS, a lighter backlog-based spec, or some combination?"

The decision runs on three axes: contract model (fixed-price wants a binding SRS; T&M/agile can run leaner), regulatory exposure (compliance usually mandates formal artifacts regardless of methodology), and project size/lifespan (a system multiple teams will maintain for years justifies more formal documentation than a six-week internal tool). In practice these aren't mutually exclusive — a project often starts with a V&S at kickoff, then an SRS for the parts with fixed scope, with agile backlog items covering the parts still being discovered.

**Say it:** "I don't pick one artifact — I match the level of formality to the contract model, regulatory exposure, and lifespan of what's being built, and it's normal for a V&S, an SRS, and a live backlog to coexist on the same project."
**Red flag:** Applying the same documentation template to every project regardless of contract type or regulatory context — that's process for its own sake, not judgment.

### What a well-formed SRS requirement statement looks like
**They ask:** "Show me what a single well-written requirement statement in an SRS actually looks like."

A single requirement needs an ID (for traceability), an unambiguous "shall" statement, a source, and — where it applies — an acceptance criterion or measurable threshold. Vague verbs ("should support," "may allow") are the tell of a requirement that hasn't been pinned down yet; "shall" is the IEEE convention precisely because it reads as mandatory, not aspirational.

```
REQ-FN-042
Title:   Password reset via email
Source:  Stakeholder interview, 2026-05-14 (Security lead)
Statement: The system shall send a password-reset link to the
           user's verified email address within 60 seconds of
           the reset request, valid for 24 hours.
Acceptance: Link expires and is rejected after 24 hours (see NFR-014).
```

**Say it:** "Every requirement I write has an ID, a 'shall' statement, a source, and a measurable acceptance criterion — if I can't write the acceptance criterion, the requirement isn't done yet."
**Red flag:** A requirement with no source listed — if you can't say who asked for it and why, you can't defend it in a scope conversation six months later.
