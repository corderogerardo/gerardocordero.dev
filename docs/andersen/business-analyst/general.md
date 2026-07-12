# Business Analyst — role fundamentals

### What a Business Analyst Actually Does
**They ask:** "Walk me through the role of a Business Analyst — what do you actually do day to day?"

A BA exists to close the gap between "what the business needs" and "what gets built" — without that role, requirements live in someone's head, get reinterpreted at every handoff, and the team ships the wrong thing correctly. The job is elicitation (finding out what's really needed, not just what's said), analysis (structuring it, spotting conflicts and gaps), documentation (making it unambiguous and traceable), and validation (getting stakeholders and the team to agree it's right before a line of code is written).

Day to day that's running elicitation sessions, writing and maintaining requirements artifacts (user stories, use cases, SRS sections), facilitating between business stakeholders and the delivery team, and owning requirements changes so nothing gets lost between "the client asked for X" and "the team built X."

**Say it:** "My job is to make sure the team builds the right thing — I turn ambiguous business need into requirements precise enough that a developer and a stakeholder read them the same way."
**Red flag:** Describing the BA as "the person who writes documents." Documentation is an output, not the job — the job is closing the understanding gap between business and delivery.

### BA vs IT-BA
**They ask:** "What's the difference between a Business Analyst and an IT Business Analyst?"

A pure Business Analyst works on the business side — process improvement, organizational change, ROI analysis — often without touching a specific software system at all. An IT-BA (or Systems/Technical BA) does the same discovery and documentation work but specifically to feed a software development team: translating business need into functional requirements a dev team can build against, and often bridging into technical specification.

The distinction matters because it sets expectations: an IT-BA is expected to understand enough of the technical landscape (APIs, data, architecture options) to write requirements that are technically realistic, not just business-correct.

**Say it:** "A BA improves business processes generally; an IT-BA does the same analysis but scopes and documents it specifically for a software delivery team, which means understanding enough tech to keep requirements realistic."
**Red flag:** Treating the two as interchangeable in an IT-services interview — the interviewer is checking you understand you'll be embedded in a dev team, not doing generic process consulting.

### Core BA Tasks
**They ask:** "Name the core tasks a BA owns on a project."

The senior framing: these tasks aren't a checklist, they're a pipeline — elicit, analyze, document, validate, manage change — and a BA who only does one link (say, just documentation) isn't doing the job. Concretely: eliciting requirements from stakeholders, classifying and prioritizing them, writing them into an agreed format (user stories, use cases, SRS), validating them with the team and client, and then managing every change to them for the life of the project.

**Say it:** "Elicit, analyze, document, validate, and manage change — that's the pipeline, and I own all five, not just the writing part."
**Red flag:** Listing tasks as a flat bag with no sense of sequence or ownership — it signals you've seen the job description but not done the job.

### Working Under Guidance vs Independently
**They ask:** "At your level, how independently do you work — and how do you know when to escalate?"

This is really a seniority-calibration question. Junior BAs work under a lead's guidance: they run elicitation with a senior in the room, escalate ambiguous requirements rather than resolve them solo. The senior answer isn't "I never need help" — it's knowing *which* decisions are yours to make and which need a second set of eyes: scope-changing ambiguity, conflicting stakeholder input, and anything touching cost or timeline always gets escalated; day-to-day clarification and documentation don't.

**Say it:** "I make the calls that are mine to make — clarifying detail, documentation structure — and escalate anything that changes scope, cost, or timeline, because those decisions aren't mine alone to own."
**Red flag:** Claiming total independence at a junior level — it reads as either inexperience with how much can go wrong, or an unwillingness to loop in the team.

### Explaining the Value of an Analyst to a Skeptical Client
**They ask:** "A client says 'why do we need a BA, just let the developers talk to us directly.' How do you respond?"

The senior move is reframing the objection: the client isn't wrong that direct communication happens — they're missing that without a BA, that communication is unstructured, undocumented, and easy to reinterpret differently by different developers on different days. Name the concrete cost of skipping the role — rework from misunderstood requirements, scope creep with no paper trail, no single source of truth when the client and a developer remember a conversation differently — then reframe the BA as insurance against exactly that cost, not overhead on top of it.

Practically: a BA doesn't replace developer-client conversation, it structures it — turning conversations into traceable, testable requirements everyone can point back to.

**Say it:** "Without a BA, requirements live in Slack threads and memory — with one, they live in a document the whole team and the client can point to when there's a disagreement, which is what actually prevents expensive rework."
**Red flag:** Getting defensive or listing BA tasks as a rebuttal — the client isn't asking what you do, they're asking why it's worth paying for. Answer the cost question, not the task-list question.

### Systems Analyst — Role, Tasks, and Systems Thinking
**They ask:** "How does a Systems Analyst's role differ from a Business Analyst's, and what does 'systems thinking' mean in practice?"

An SA extends the BA role one layer deeper into the technical system: where a BA stops at "what does the business need," an SA is also responsible for how that need maps onto the technical system — data flows, integrations, architecture constraints — and for writing specifications precise enough for engineers to implement without re-interpreting intent. At senior level this is where "systems thinking" becomes real: instead of analyzing a requirement in isolation, you trace its ripple effects — which other modules, integrations, or data structures does this change touch, and where does a locally-good decision cause a system-level problem.

**Say it:** "An SA's job is translating validated business requirements into a technically implementable specification — and systems thinking means I evaluate every requirement against its ripple effects on the rest of the system, not just in isolation."
**Red flag:** Describing systems thinking as "seeing the big picture" with no concrete mechanism — the interviewer wants to hear you actually trace dependencies (data, integration, architecture) before signing off on a requirement.

### BABOK — What It Is and Why It Matters
**They ask:** "What is BABOK, and how do you actually use it, versus just having heard of it?"

BABOK (the Business Analysis Body of Knowledge, from IIBA) isn't a methodology you follow step by step — it's a reference framework that names and organizes the knowledge areas a BA draws on: business analysis planning, elicitation and collaboration, requirements life cycle management, strategy analysis, requirements analysis and design definition, and solution evaluation. Its real value is vocabulary and completeness: it gives you a checklist of *categories of work* so nothing gets silently skipped on a project (nobody explicitly owns strategy analysis, so it never happens), and it gives you shared terms so "elicitation technique" or "requirements traceability" mean the same thing across a whole industry, not just your last project.

At a senior level, BABOK shows up less as a document you cite and more as a mental model you use to audit your own process — when a project goes sideways, mapping the failure back to a BABOK knowledge area (was this a planning gap? an elicitation gap? a solution-evaluation gap that was skipped entirely?) turns a vague postmortem into a specific, fixable one.

**Say it:** "BABOK isn't a process I follow line by line — it's the framework I use to audit my own work, so when something goes wrong I can name which knowledge area actually got shortchanged instead of describing the failure vaguely."
**Red flag:** Reciting BABOK's six knowledge areas from memory with no example of applying one. An interviewer wants evidence you use it as a working tool, not that you memorized a glossary.
