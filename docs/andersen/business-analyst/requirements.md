# Requirements — types, elicitation, documentation, management, verification

### Requirement Types — The Basics
**They ask:** "What are the main types of requirements, and what does each represent?"

The classification exists to make sure nothing gets forgotten: functional requirements describe *what the system does* (a user can reset their password); non-functional requirements describe *how well it does it* (password reset responds in under 2 seconds, is available 99.9% of the time); business rules are constraints the system must enforce regardless of feature (passwords must be 8+ characters per policy). Missing a category isn't a documentation gap — it's a shipped bug: teams that only capture functional requirements ship systems that work but don't scale, aren't secure, or violate a policy nobody wrote down.

**Say it:** "Functional requirements are the what, non-functional are the how-well, and business rules are the constraints — I check all three explicitly, because a requirement that only covers 'what' ships a system that technically works and practically fails."
**Red flag:** Only naming functional requirements when asked "what types of requirements are there" — it's the single most common gap interviewers probe for.

### Non-Functional Requirements and Business Rules — Going Deeper
**They ask:** "Give me concrete categories of non-functional requirements, and explain how business rules differ from them."

Non-functional requirements (NFRs) aren't a single bucket — they split into performance (response time, throughput), reliability (uptime, MTBF), usability, security, scalability, maintainability, and portability, and a senior BA elicits each category deliberately rather than hoping stakeholders volunteer them (they rarely do — "make it fast" and "keep it secure" are the extent of most stakeholder input unless you ask targeted questions).

Business rules are different in kind, not degree: they're policy constraints that exist independent of any one feature — a discount can't exceed 20% without manager approval, for example — and they get violated silently if they're only enforced in one screen instead of centrally in the requirement.

**Say it:** "NFRs need to be elicited category by category — performance, security, scalability — because stakeholders won't volunteer them unprompted; business rules are policy constraints I make sure are enforced everywhere the rule applies, not just where someone remembered to check."
**Red flag:** Treating "the system should be secure" as a complete non-functional requirement — it's not testable. A real NFR has a measurable threshold.

### Requirement Types — Full Taxonomy, Transitional Requirements
**They ask:** "What are transitional requirements, and how does a mature requirements taxonomy handle the full set of types with real examples?"

Transitional requirements are a category most junior BAs miss entirely: they're requirements that only exist to get from the old system to the new one — data migration rules, temporary interfaces, parallel-run behavior — and they disappear once the new system is fully live. Missing them is a classic go-live surprise: the new system meets every functional and non-functional requirement and still fails on day one because nobody specified how existing data gets migrated in.

A mature taxonomy covers: functional, non-functional (by category), business rules, and transitional — and for each, you should be able to give a concrete example from a real project, not just a definition, because that's what separates "I read the glossary" from "I've actually elicited these."

**Say it:** "Transitional requirements are the ones that exist only during cutover — data migration, parallel-run rules — and they're the category that gets missed most often because they vanish from scope once go-live is done, which is exactly why I call them out explicitly in discovery."
**Red flag:** Never having heard of transitional requirements at a senior level — it signals you've only ever worked greenfield builds, not migrations or replacements of live systems.

### Elicitation Techniques — Overview
**They ask:** "What requirements elicitation techniques do you know, and what are the trade-offs between them?"

No single technique surfaces every requirement, which is why you pick per situation, not by habit: interviews get depth from one stakeholder but don't scale; workshops/JAD sessions surface conflicting stakeholder views in the room where they can be resolved live; surveys/questionnaires scale to many stakeholders but get shallow, ambiguous answers; document analysis (existing specs, contracts, system docs) is fast and free but only as good as what's already written down; observation (shadowing a user doing their job) surfaces requirements users can't articulate because the behavior is second nature to them; and prototyping elicits requirements by letting stakeholders react to something concrete instead of describing an abstraction.

**Say it:** "I pick the elicitation technique by what I'm missing — depth from one person, interviews; conflicting views resolved live, a workshop; requirements a user can't articulate, observation — not by whichever technique I default to."
**Red flag:** Naming only "interviews and surveys" — it's the shallow answer. A senior BA has used observation and prototyping specifically because stakeholders can't always say what they need in words.

### Preparing for Elicitation
**They ask:** "Walk me through how you prepare before an elicitation session."

Unprepared elicitation wastes the one thing you can't get back — stakeholder time — and produces vague answers because vague questions were asked. Preparation: identify the right stakeholders (not just the available ones), review existing documentation and prior decisions so you don't ask a question already answered, draft a structured question list or agenda scoped to what you actually need from *this* session, and set expectations up front (what will be covered, what won't, how long it'll take).

**Say it:** "Before any elicitation session I know exactly what gap I'm filling, who can actually fill it, and what's already documented — so I'm not spending stakeholder time re-asking what's already on record."
**Red flag:** Walking into a stakeholder interview with an open-ended "tell me what you need" and no structure — it produces a transcript, not requirements.

### Choosing the Right Elicitation Technique
**They ask:** "How do you decide which elicitation technique to use for a given situation?"

The decision runs on three axes: how many stakeholders (one → interview, many → workshop or survey), how well stakeholders can articulate the need (clearly → interview/survey, tacit/habitual → observation), and how much conflicting input exists (high conflict → live workshop where disagreement gets resolved in the room, not sequentially and worse over email). A senior BA names the trade-off out loud when picking — "I'm running a workshop instead of individual interviews because these three stakeholders disagree on priority and I need that resolved together" — rather than defaulting to whatever technique they're most comfortable with.

**Say it:** "The technique follows the situation — stakeholder count, how tacit the knowledge is, and how much conflict exists — not my personal default."
**Red flag:** Using the same technique (usually interviews) for every situation regardless of context — it's a sign of comfort-zone elicitation, not deliberate technique selection.

### Building an Elicitation Toolkit
**They ask:** "What does it mean to 'have your own elicitation toolkit,' and why does it matter at a senior level?"

Junior BAs run elicitation from scratch each time; senior BAs have accumulated reusable assets — question checklists per requirement type, artifact templates, "life hacks" for surfacing NFRs stakeholders won't volunteer (e.g., asking "what happens when this fails" instead of "is it reliable") — because reinventing the elicitation approach on every project is slow and inconsistent. The toolkit is also what lets a senior BA effectively build and manage the elicitation process end-to-end instead of just executing sessions someone else designed.

**Say it:** "I keep a reusable set of question checklists and templates per requirement type — it's what lets me run consistent, fast elicitation instead of designing the approach from zero on every project."
**Red flag:** Having "years of experience" but no concrete reusable artifacts to point to — it suggests the experience didn't compound into anything transferable.

### Why You Document Requirements
**They ask:** "Why bother formally documenting requirements instead of just tracking decisions in conversation and tickets?"

Undocumented requirements decay the moment the conversation ends — the client remembers it one way, the developer implements it another, and there's no artifact to resolve the dispute except memory. Documentation exists to create a single, unambiguous, traceable source of truth: it's what a new team member reads to onboard, what QA tests against, what the client signs off on, and what settles a scope disagreement without relitigating a six-month-old conversation.

**Say it:** "Documentation isn't bureaucracy — it's the only artifact that survives after the conversation ends, and it's what everyone downstream builds, tests, and signs off against."
**Red flag:** Framing documentation as overhead that slows the team down — on any project past a handful of people, undocumented requirements cost far more in rework than writing them down costs in time.

### User Stories vs Use Cases
**They ask:** "What's the difference between a User Story and a Use Case, and when do you reach for each?"

A User Story is intentionally lightweight — "As a [user], I want [goal], so that [benefit]" plus acceptance criteria — built for Agile teams that iterate fast and prefer a conversation over exhaustive up-front documentation. A Use Case is a fuller specification: actors, preconditions, a main success scenario, alternate flows, and exception flows, written for teams (often Waterfall or regulated/complex-integration projects) that need the full behavior — including every failure path — documented before development starts.

The trade-off: user stories are fast to write and force ongoing conversation but can leave edge cases unspecified until a developer hits them; use cases front-load the edge-case thinking but are slower to produce and harder to keep current under fast-changing scope.

**Say it:** "User stories trade completeness for speed and conversation — good for Agile, iterative scope; use cases trade speed for completeness — I reach for them when the alternate and exception flows themselves are the risk, like a payment or compliance flow."
**Red flag:** Saying "use cases are old and user stories are the modern replacement" — they solve different problems; a senior BA picks based on the project's risk profile and process, not fashion.

### Gherkin Syntax and BDD Acceptance Criteria
**They ask:** "What is Gherkin, and how do you use it to write acceptance criteria?"

Gherkin is the Given/When/Then syntax behind Behavior-Driven Development — it exists to make acceptance criteria unambiguous *and* directly executable as automated tests, closing the gap between "the requirement is documented" and "the requirement is verified." Given sets up the precondition, When is the triggering action, Then is the observable, testable outcome.

```gherkin
Given a user has an item in their cart
When they apply a valid discount code
Then the cart total reflects the discount
And the code cannot be reused on the same order
```

The senior value: because it's structured and executable, Gherkin acceptance criteria remove the "well, I interpreted 'should work correctly' to mean X" argument between BA, dev, and QA — everyone tests against the same literal statement.

**Say it:** "Gherkin's Given/When/Then isn't just a documentation format — it's acceptance criteria that QA can automate directly, so 'done' means the same thing to the BA, the developer, and the test suite."
**Red flag:** Writing Gherkin scenarios that describe UI steps ("click the button") instead of business behavior ("the discount is applied") — that couples the acceptance criteria to implementation and breaks the first time the UI changes.

### Choosing the Right Documentation Format
**They ask:** "Given a real project, how do you decide between user stories, use cases, Gherkin, or a full SRS?"

The senior answer treats format as a tool selected per requirement, not a project-wide default: a fast-moving Agile team building a UI feature gets user stories with Gherkin acceptance criteria; a complex integration or compliance-heavy flow gets a full use case with alternate and exception flows spelled out; a fixed-price, contractually-bound project needs an SRS because the contract itself often demands it. A single project can legitimately mix formats — the mistake is picking one format because it's familiar and forcing every requirement through it regardless of fit.

**Say it:** "I don't pick one format for a project — I pick per requirement, based on how much ambiguity the risk in that specific flow can tolerate."
**Red flag:** Insisting on a single documentation standard across a whole project regardless of what's being documented — rigidity here usually means the BA hasn't actually had to defend the choice against a counter-example.

### Requirements Prioritization — MoSCoW and Kano
**They ask:** "How do you prioritize requirements when everything is labeled 'high priority' by the client?"

This is the actual senior skill being tested — stakeholders default to "everything is critical" because they don't see the cost trade-off, so prioritization is your job to structure, not theirs to volunteer. MoSCoW forces a scope conversation into four buckets — Must have (non-negotiable for release), Should have (important, painful to skip, but not release-blocking), Could have (desirable if time allows), Won't have this time (explicitly deferred, not forgotten) — and it works because it's binary per item, which kills the "everything is a 9/10" problem.

Kano goes a level deeper on *why* a feature matters: Basic/Threshold features cause dissatisfaction if missing but earn no delight if present (login working); Performance features scale satisfaction linearly with how well they're done (faster search = happier users); Delighters are unexpected features that create disproportionate satisfaction (a feature nobody asked for that becomes the thing they show off). Kano tells you *where* to invest beyond the baseline — MoSCoW tells you what ships first.

**Say it:** "MoSCoW forces a real trade-off conversation instead of a wall of 'high priority' labels, and Kano tells me which of the remaining features are just table stakes versus which ones actually move satisfaction — I use them together, not one or the other."
**Red flag:** Letting the client rank every item "must have" without pushing back — that's not prioritization, it's just recording the wishlist, and it guarantees scope conflict later.

### Writing Acceptance Criteria That Hold Up
**They ask:** "What makes acceptance criteria good enough to actually prevent 'it works on my machine' disputes at handoff?"

Good acceptance criteria are testable, unambiguous, and complete for the scenario — not "the form validates input" (untestable: validates *how*?) but "the form rejects submission and shows 'Email is required' when the email field is empty." The senior discipline is writing negative and edge-case criteria, not just the happy path — what happens on empty input, on a network failure, on a duplicate submission — because those are exactly the cases that get argued about in a bug triage six weeks later if they weren't specified up front.

**Say it:** "Every acceptance criterion I write has to be pass/fail testable by someone who wasn't in the room when I wrote it — if it needs interpretation, it's not done yet."
**Red flag:** Writing acceptance criteria that only cover the happy path — the disputes that eat sprint time are almost always about an edge case nobody wrote down, not the main flow.

### Requirements Management and Traceability
**They ask:** "How do you manage a growing set of requirements across a project without losing track of what maps to what?"

Requirements management is keeping every requirement traceable — to its source (which stakeholder or business goal generated it), to its implementation (which feature/ticket satisfies it), and to its verification (which test proves it's met) — usually via a Requirements Traceability Matrix (RTM) or the equivalent structure in a tool like Jira/Azure DevOps. Without traceability, "why does this feature exist" and "did we actually implement everything the client signed off on" both become unanswerable without re-reading every document.

**Say it:** "Every requirement I write is traceable end to end — source, implementation, and verification — so I can answer 'why does this exist' and 'did we build everything we promised' without re-reading the whole spec."
**Red flag:** Managing requirements only in a document with no link back to tickets or tests — it looks organized on day one and becomes untraceable the moment scope starts changing.

### Managing Requirement Changes
**They ask:** "A client asks for a requirement change mid-sprint. Walk me through how you handle it."

The senior framework, in order: (1) capture the change request formally, don't just verbally agree to it; (2) assess impact — what does this change touch: other requirements, already-built functionality, timeline, cost; (3) get the impact assessed and re-approved by whoever owns budget/scope authority, not just the requester; (4) update every affected artifact — requirements doc, traceability matrix, any dependent user stories; (5) communicate the change and its downstream effects to the whole team, not just log it. Skipping the impact assessment step is the single most common way scope creep quietly becomes a budget or timeline problem nobody agreed to.

**Say it:** "Every requirement change goes through impact assessment and re-approval before it touches the backlog — that's the step that turns 'quick client ask' into scope creep if it's skipped."
**Red flag:** Treating a change request as "just update the doc" — without impact assessment, uncontrolled change is how fixed-price projects go over budget silently.

### Full Requirements Lifecycle Ownership
**They ask:** "At a senior level, what does it mean to fully own communications and changes to requirements across a project?"

It means being the single accountable point for the requirement's entire lifecycle — not just writing it once, but tracking every conversation, decision, and change against it, so that at any point you can answer "what does this requirement currently say, who asked for the last change, and why." That's what lets you run change control as a process rather than reactively, and it's what a client and delivery lead actually rely on a senior BA for: a reliable single source of truth they don't have to independently verify.

**Say it:** "I'm the accountable owner for a requirement's whole history, not just its first draft — anyone on the project can ask me 'why does this say what it says' and get a traceable answer."
**Red flag:** Only being able to speak to the current state of a requirement, not its history — clients and PMs escalate to a senior BA specifically because they need the "why" behind a change, not just the "what."

### Requirements Validation vs Verification
**They ask:** "What's the actual difference between requirements validation and requirements verification?"

They get confused constantly, and the distinction is the interview signal: verification checks "did we build the requirement correctly" — does the documented requirement match the standard/template, is it internally consistent, unambiguous, testable. Validation checks "did we capture the *right* requirement" — does it actually reflect what the business needs, confirmed with the stakeholder who owns that need. You can verify a requirement perfectly (well-written, unambiguous, testable) and still have it be wrong, because verification never checks it against reality — only validation does.

**Say it:** "Verification asks 'is this requirement well-formed,' validation asks 'is this requirement actually what the business needs' — you can pass one and fail the other, and a lot of expensive rework comes from skipping validation because verification felt like enough."
**Red flag:** Using "verification" and "validation" interchangeably — in a BA interview this is one of the most reliably-tested distinctions, and getting it wrong signals you haven't internalized why both steps exist.

### Characteristics of a Well-Written Requirement
**They ask:** "What makes a requirement 'well-written'? What are the checkable characteristics?"

A senior BA has a checklist, not a vibe: unambiguous (one interpretation only), testable/verifiable (someone can prove pass/fail), complete (no missing information needed to implement it), consistent (doesn't contradict another requirement), feasible (technically and within constraints achievable), traceable (linked to its source and to its verification), and prioritized (its relative importance is known). A requirement that's clear but untestable, or complete but contradicts another requirement elsewhere in the doc, still fails review — every characteristic is a separate check.

**Say it:** "I run every requirement against the same checklist — unambiguous, testable, complete, consistent, feasible, traceable, prioritized — because 'well-written' isn't a feeling, it's seven separate checks."
**Red flag:** Defining a good requirement only as "clear" — clarity is one of at least seven properties; a requirement can be perfectly clear and still be untestable or contradict another one.

### Requirements Testing Techniques
**They ask:** "How do you actually test or verify requirements before they reach development?"

Techniques include peer review/walkthrough (another BA or SME reads it independently), checklists against the well-written-requirement criteria, formal inspection (structured, role-assigned review meeting for high-risk requirements), prototyping (validate by having stakeholders react to something concrete), and traceability analysis (confirm every requirement maps to a business objective, and every objective has at least one requirement covering it — catching both orphan requirements and unaddressed goals). Senior BAs match the technique's rigor to the requirement's risk — a checkout-flow requirement gets more scrutiny than a cosmetic UI tweak.

**Say it:** "I scale the verification rigor to the risk — a peer walkthrough for a low-risk requirement, formal inspection for anything touching payment, compliance, or data integrity."
**Red flag:** Applying the same light-touch review to every requirement regardless of risk — high-risk requirements that skip rigorous verification are where the expensive production bugs come from.

### Running a Requirements Review Process
**They ask:** "How do you organize the requirements-checking process across a whole project, not just review your own work?"

At senior level you're not just verifying your own requirements — you're designing the process: defining who reviews what (peer BA, tech lead, QA, client), at what stage (draft, before dev handoff, before client sign-off), with what criteria, and how disagreements get resolved. This is where "knows how to review other people's requirements" becomes "knows how to organize the review process for the whole team" — the shift from individual contributor to process owner.

**Say it:** "I don't just review my own requirements — on a project I own the review process itself: who checks what, at which stage, and how we resolve disagreement before it reaches development."
**Red flag:** Describing requirements review only as something done to your own work — at senior level, interviewers are checking whether you can design and run the process for the team, not just execute your part of it.

### Gap Analysis — Current State vs Future State
**They ask:** "What is gap analysis, and how do you actually run one?"

Gap analysis compares the **current state (AS-IS)** of a process or system against the **desired future state (TO-BE)** and names the specific difference between them — that difference *is* the scope of what needs to be built or changed. Without it, requirements risk describing the future state in a vacuum, disconnected from what already exists, which is how projects end up rebuilding functionality that already worked fine or missing a dependency the current process quietly relied on.

Running one well means documenting both states with the same rigor — the AS-IS isn't a formality to rush through, it's what makes the gap real and measurable instead of a vague sense that "things should be better." A senior BA also separates gaps by type: process gaps (how work gets done), technology gaps (what systems support it), and people/skills gaps (what capability the organization needs to operate the future state) — because each implies a different kind of requirement, not just a feature.

**Say it:** "The AS-IS documentation isn't a formality — it's what turns 'things should be better' into a specific, measurable gap, and I split gaps into process, technology, and people/skills because each one produces a different kind of requirement, not just a feature request."
**Red flag:** Jumping straight to describing the future state without documenting the current one. Without a real AS-IS baseline, the "gap" is just an opinion about what's missing, not an analyzed difference.
