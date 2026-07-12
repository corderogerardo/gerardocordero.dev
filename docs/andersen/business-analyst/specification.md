# Specification — Vision & Scope, SRS

### Vision and Scope — Purpose and Structure
**They ask:** "What is a Vision and Scope document, and what's it actually for?"

A V&S document exists to lock down agreement *before* detailed requirements work starts — it answers "what problem are we solving, for whom, and what's explicitly out of scope" at a business level, so that six weeks into discovery nobody discovers the team and client had different mental models of what "the project" even means. Standard structure: business requirements/problem statement, project scope (in-scope and explicitly out-of-scope), stakeholder profiles, high-level feature list, business context, and assumptions/constraints. Skipping it doesn't save time — it just moves the scope disagreement later, when it's more expensive to resolve.

**Say it:** "A V&S is the document that gets everyone agreeing on the problem and its boundaries before we spend time on detailed requirements — it's cheap insurance against a scope disagreement surfacing after the expensive work is already done."
**Red flag:** Treating scope as "everything the client mentioned" — the explicit out-of-scope section is as important as what's in scope; it's what you point to when a client tries to add something mid-project without a change request.

### When to Write a Vision and Scope Document
**They ask:** "At what point in a project do you write a V&S, and when would you skip it?"

A V&S is written during presale or the earliest part of discovery, before detailed requirements elicitation — it's the foundation those requirements get scoped against. You'd scale it down (not skip it entirely) for a small, well-understood project where the problem and scope are already unambiguous — but even then, some lightweight version documenting scope boundaries protects against creep. Skipping it on anything beyond a trivial fixed-scope task is a red flag, not a time-saver.

**Say it:** "I write it as early as possible — during presale or the start of discovery — because everything downstream, including the estimate, is scoped against it; I'll lighten the format for a small project, but I don't skip the scope-boundary conversation."
**Red flag:** Saying "we skip it for Agile projects" — Agile changes how requirements evolve, it doesn't remove the need to agree on the problem and its boundaries up front.

### Adapting the V&S Template to a Project
**They ask:** "How do you decide which sections of the standard V&S template to keep, cut, or add for a specific project?"

The template is a starting point, not a mandate — a senior BA adapts it to the project's actual risk profile: a regulated project needs a compliance/constraints section that a simple internal tool doesn't; a project with many external integrations needs a more detailed technical context section; a small, well-scoped project can compress stakeholder profiles into a paragraph instead of a full section. The judgment call is knowing which section, if cut, would remove information someone downstream actually needs — versus which section is boilerplate for this project.

**Say it:** "I treat the standard template as a checklist to react to, not fill in mechanically — I add sections the project's risk profile demands and cut ones that would just be padding for this specific case."
**Red flag:** Using the exact same V&S structure on every project regardless of size or risk — it either bloats a simple project or under-documents a complex one.

### Presenting the V&S to Client and Team
**They ask:** "You've written the V&S — how do you actually present it to the client and the team?"

Writing it is half the job; getting explicit sign-off is the other half, and that requires walking through it live rather than emailing a document and hoping it gets read. The senior approach: present scope boundaries explicitly and check for reaction in the room (silence isn't agreement), confirm the out-of-scope items are understood as *excluded*, not just "not mentioned," and get an explicit acknowledgment — verbal in the meeting plus written sign-off — because that sign-off is what you point back to the first time scope creep is proposed.

**Say it:** "I don't send a V&S and assume silence means agreement — I walk it through live, specifically calling out what's excluded, because that's the moment scope disputes get prevented instead of litigated later."
**Red flag:** Treating the V&S as done once it's written — an unread or unconfirmed document has zero authority when a scope dispute actually happens.

### SRS — Purpose and Structure
**They ask:** "What is an SRS document, why is it needed, and what's its structure?"

A Software Requirements Specification is the detailed, technically-precise requirements document that sits below a V&S — where the V&S answers "what problem, what boundaries," the SRS answers "exactly what does the system do, in enough detail for a developer to build it and QA to test it without guessing." Standard structure (loosely following IEEE 830 / ISO/IEC/IEEE 29148): introduction and purpose, overall description, specific functional requirements, non-functional requirements, external interface requirements, and appendices/glossary. It exists because a V&S is intentionally too high-level to build from directly.

**Say it:** "The V&S agrees on the problem and its boundaries; the SRS is the detailed spec a developer and QA actually build and test against — different altitude, different audience."
**Red flag:** Using "SRS" and "V&S" interchangeably — they're sequential documents at different levels of detail, and conflating them signals you haven't actually written one.

### SRS vs Other Specification Documents
**They ask:** "How does an SRS differ from other ways of specifying requirements, like a backlog of user stories or a functional spec?"

An SRS is comprehensive and static-by-design — it aims to capture the complete, agreed system behavior up front, which fits Waterfall or contractually fixed-scope (often fixed-price) projects where the contract itself may require it. A user-story backlog is incremental and living — it evolves sprint over sprint and deliberately doesn't try to capture everything up front, fitting Agile delivery. A lighter functional spec sits in between: more detail than a story, less ceremony than a full SRS, often used for a single complex feature inside an otherwise Agile project.

**Say it:** "The real difference isn't format, it's philosophy — an SRS front-loads completeness for a fixed-scope engagement, a backlog defers detail and expects change; I pick based on the contract model and how much the scope is expected to move."
**Red flag:** Calling an SRS "outdated" in a general sense — it's the correct tool for fixed-price and regulated engagements specifically, not a legacy practice to be avoided everywhere.

### Writing an SRS to ISO/IEC/IEEE and RUP Standards
**They ask:** "What standards inform how you structure and write an SRS, and why do they matter?"

ISO/IEC/IEEE 29148 (successor to the older IEEE 830) defines the recommended structure and quality characteristics for a software requirements specification — following it isn't box-checking, it's what makes an SRS *portable*: any engineer or auditor familiar with the standard can navigate the document without a walkthrough, and it maps cleanly to compliance and contractual review. RUP (Rational Unified Process) approaches requirements differently — via use cases and an iterative, phased structure — and knowing it matters specifically on projects still run against RUP-style processes or that mix use-case-driven specification into an otherwise standards-based SRS.

**Say it:** "Following ISO/IEC/IEEE 29148 isn't bureaucracy — it means an unfamiliar reviewer, auditor, or new team member can navigate the SRS without me walking them through it, which matters most on regulated or contractually strict projects."
**Red flag:** Not being able to name any standard when asked — on projects that require formal SRS work, the standard is often a contractual deliverable requirement, not a stylistic choice.

### Owning a Full SRS End to End
**They ask:** "Tell me about a full SRS you've owned — not sections you contributed to, the whole document."

This is a scope-of-experience question, and the honest senior answer distinguishes "I wrote sections under review" from "I owned structure, content, and sign-off for the whole document." Owning a full SRS means making the structural calls (which sections apply to this project), driving elicitation deep enough to fill every section without gaps, resolving internal contradictions across sections before they reach the team, and carrying it through client and team review to sign-off. It's a materially different skill from contributing well-written individual sections.

**Say it:** "Owning a full SRS means I'm accountable for the whole document being internally consistent and complete, not just for the sections I personally drafted being well-written."
**Red flag:** Conflating "I've written parts of several SRS docs" with "I've owned one end to end" — a senior interviewer will ask a follow-up that surfaces the gap immediately, so don't overstate it.
