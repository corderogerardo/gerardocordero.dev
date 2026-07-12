# Modeling and prototyping — BPMN, UML, prototypes

### What BPMN Is and When to Reach for It
**They ask:** "What is BPMN, and what problem does it solve?"

BPMN (Business Process Model and Notation) is a standardized visual language for describing business processes — the point of standardizing it is that a diagram means the same thing to a developer, a client, and another BA without a legend explaining your personal shape conventions. It sits at the process level, above individual requirements: it shows *who does what, in what order, and under what conditions* across an end-to-end process, which is exactly the layer a discovery-phase feature list or a single user story doesn't capture.

You reach for it whenever a process crosses multiple actors or systems — an order-fulfillment flow touching a customer, a warehouse, and a payment gateway — where a flat list of requirements would hide the sequencing and branching that actually matters.

**Say it:** "BPMN is a standard notation for process flow, not requirements — I use it when a process crosses multiple actors or systems and the sequencing and branching itself is what needs to be validated with the client."
**Red flag:** Using BPMN to document a single screen's UI logic. That's not what it's for — BPMN models cross-actor process flow, not interface behavior.

### Core BPMN Elements
**They ask:** "What are the basic building blocks of a BPMN diagram?"

Every BPMN diagram is built from four element families, and knowing the family a shape belongs to is more important than memorizing every variant. **Events** (circles) mark something that happens — a process starting, ending, or being triggered mid-flow. **Activities** (rounded rectangles) represent work being done — a task or a whole subprocess. **Gateways** (diamonds) represent decision points that split or merge the flow. **Flows** (arrows) connect them and show sequence or message exchange between participants.

Beyond the shapes, a **pool** represents one participant (a company, a system, a role) and a **lane** subdivides a pool by responsibility (a department, a role within that participant) — this is what lets one diagram show handoffs between multiple actors clearly.

**Say it:** "Every BPMN diagram reduces to four families — events, activities, gateways, and flows — plus pools and lanes to show which participant or role owns each step."
**Red flag:** Not knowing the difference between a pool and a lane. A pool is a separate participant (a message crossing pool boundaries is inter-organizational); a lane is a subdivision within one participant — mixing them up misrepresents who actually owns a handoff.

### Drawing a Basic BPMN Process
**They ask:** "Sketch how you'd model a simple process — say, a customer submitting a support ticket — in BPMN."

A basic process needs only three of the element families to be complete and correct: a **start event** (the trigger — customer submits a ticket), a sequence of **tasks** (the work — ticket is logged, assigned, worked, resolved), and an **end event** (the process concludes — customer notified). No gateways are needed yet if there's no branching — a straight-line process is a valid, complete BPMN diagram.

```
(Start: ticket submitted) → [Log ticket] → [Assign to agent] → [Resolve ticket] → (End: customer notified)
```

The senior habit is *not* over-modeling early: a basic process without gateways is easier for a non-technical stakeholder to validate than a diagram cluttered with edge cases before the happy path is even agreed on.

**Say it:** "I start with the happy path — start event, tasks in sequence, end event — with no gateways, so the client validates the core flow before I layer in branching and exceptions."
**Red flag:** Adding every conceivable edge case and gateway to the first draft. It buries the happy path the client needs to confirm first, and makes early review sessions unproductive.

### BPMN Event Types
**They ask:** "What are the different types of events in BPMN?"

Events are typed by two dimensions: **position** in the flow (start, intermediate, end) and **trigger** (what causes them). A start event can be a plain trigger, a message arriving, a timer firing, or a signal from elsewhere in the process. An intermediate event fires mid-process — most commonly a timer (wait X days) or a message (wait for a response) — and can also *catch* or *throw* an event depending on direction. An end event closes a path and can signal termination, an error, or a message sent out.

The senior distinction interviewers probe: a **message** event represents communication between participants (crosses a pool boundary), while a **signal** event broadcasts within the same process without a specific addressee — picking the wrong one misrepresents whether a step depends on another *participant* or just another branch of the same process.

**Say it:** "Events are typed by position — start, intermediate, end — and trigger — message, timer, signal, error — and getting message versus signal right is what correctly shows whether a step depends on another participant or just another branch of the same process."
**Red flag:** Using a plain start/end event everywhere and ignoring triggers. A timer-triggered start (a scheduled job) and a message-triggered start (an incoming request) describe fundamentally different processes — collapsing them loses information a developer needs.

### BPMN Task and Action Types
**They ask:** "What types of tasks or actions exist in BPMN, and why does the type matter?"

BPMN task types encode *who or what* performs the work, which matters because it tells a developer whether a step needs to be built at all. A **user task** requires a human to act through a system (approve a request); a **service task** is fully automated (a system call, no human involved); a **manual task** happens entirely outside any system (a phone call, physically checking inventory); a **script task** runs an automated rule within the process engine itself; a **send/receive task** represents message exchange with another participant.

Getting the type right during discovery directly shapes scope: a step marked "manual task" needs no software built for it at all, while the same step mislabeled "user task" implies a UI that isn't actually needed.

**Say it:** "Task type answers 'who does this work' — user, service, manual, script, or send/receive — and getting it right during discovery is what keeps the team from building a UI for a step that was actually meant to stay manual."
**Red flag:** Defaulting every task to a generic "task" shape without specifying type. That erases exactly the information — human vs. automated vs. manual — a developer needs to scope the build.

### Pools, Lanes, and Multi-Track Processes
**They ask:** "How do you model a process that involves multiple participants, like a customer, your system, and a third-party payment provider?"

Each independent participant gets its own **pool**, and message flows (dashed arrows) crossing pool boundaries represent communication *between* those participants — this is the visual cue for an integration point, which is exactly the information a solution architect needs at a glance. Within a single participant's pool, **lanes** subdivide the work by role or department — e.g. inside "Our System," a lane for the API layer and a lane for the fraud-check service.

The rule of thumb: if two participants can act *independently and simultaneously*, they're separate pools; if they're just different responsibilities inside the same organization or system, they're lanes within one pool.

**Say it:** "Separate, independently-acting participants each get their own pool with message flows crossing between them — that boundary is exactly where an integration point lives; lanes just subdivide responsibility inside one participant."
**Red flag:** Putting a third-party system in the same pool as your own system. That hides a real integration boundary and can mislead a technical reviewer into underestimating integration work.

### BPMN Gateway Types
**They ask:** "What are the different gateway types in BPMN, and how do you choose between them?"

Gateways control how flow splits and merges, and each type encodes a different business rule. An **exclusive (XOR) gateway** picks exactly one path based on a condition — "if approved, else rejected" — only one branch ever executes. A **parallel (AND) gateway** forks into *all* branches simultaneously with no condition — "notify customer AND update inventory," both always happen. An **inclusive (OR) gateway** activates one or more branches based on conditions — the trickiest one, since any combination of paths might fire, and it needs a matching merge gateway to correctly wait for exactly the branches that were actually taken.

Choosing the wrong gateway silently changes the business logic: modeling "approved OR flagged for review" as exclusive when both could legitimately be true drops a real case from the process.

**Say it:** "Exclusive picks exactly one path, parallel always forks into every path, inclusive activates whichever conditions are true — the inclusive merge is the one that trips people up because it has to wait only for the branches that actually ran."
**Red flag:** Defaulting to exclusive gateways for every decision point. If more than one outcome can legitimately happen at once, exclusive silently drops a real scenario from the model.

### Modeling Across Multiple Pools
**They ask:** "You need to model an order process spanning a customer, your platform, and a shipping partner — what changes versus a single-pool diagram?"

The core addition is being disciplined about **message flows** — every point where one participant's process depends on input from another must be shown as a message crossing pool boundaries, not silently assumed. This is where multi-pool diagrams earn their value in a real project: they force you to make every external dependency explicit and visible, which is exactly where integration risk and timing assumptions hide in a real system.

The practical BA discipline: walk each pool's internal flow independently first, then only add cross-pool message flows where one pool genuinely can't proceed without input from another — over-connecting pools with unnecessary messages clutters the diagram and obscures the real dependencies.

**Say it:** "Multi-pool modeling is really about forcing every cross-participant dependency to become an explicit message flow — that's exactly where integration risk hides, and the diagram makes it impossible to hand-wave past it."
**Red flag:** Modeling a multi-participant process as one pool with internal lanes. That erases the actual system/organizational boundary and hides where a real integration has to be built and tested.

### Breaking Out Subprocesses
**They ask:** "When and why do you break part of a process out into a subprocess?"

A subprocess is a self-contained chunk of the flow collapsed into a single activity shape, expandable into its own diagram — you reach for it exactly when a segment has enough internal complexity (its own branching, its own multiple steps) that inlining it would make the parent diagram unreadable. It's the same instinct as extracting a function in code: isolate a coherent unit of behavior so the caller (the parent process) can be read at a glance.

The BA payoff is audience-specific detail: a client reviewing the top-level order process doesn't need to see every branch of the fraud-check subprocess — they need to trust it happens and drill in only if they want to.

**Say it:** "I collapse a segment into a subprocess exactly when its internal branching would clutter the parent diagram — same instinct as extracting a function, so the top-level flow stays readable for a stakeholder who doesn't need every internal detail."
**Red flag:** Leaving every branch inlined in one giant diagram "for completeness." A diagram a stakeholder can't parse in one sitting has failed at its actual job, which is communication.

### What UML Is and Why BAs Use It
**They ask:** "What is UML, and why would a BA use it instead of just BPMN?"

UML (Unified Modeling Language) is a family of diagram types for modeling a *system's* structure and behavior — where BPMN models the business process layer (who does what, across actors), UML models one layer deeper, closer to how the software itself is structured and behaves. A BA reaches for UML diagrams specifically to bridge the gap between a business requirement and a developer's mental model of the system — e.g. a use case diagram scopes what the system must do, a sequence diagram nails down the exact order of interactions the dev team needs to build against.

The two aren't competitors — a BPMN diagram might describe the business process an order goes through, while a use-case diagram scopes exactly which of that process's steps the software system is responsible for.

**Say it:** "BPMN models the business process across actors; UML models the system itself — I use UML diagrams specifically to translate a business requirement into the shape a developer needs to build against."
**Red flag:** Using UML diagrams to explain a business process to a non-technical client. UML is written for a technical audience — for the client, BPMN or a plain flow is the right tool.

### Use Case Diagrams
**They ask:** "What is a use case diagram, and what does it capture that a requirements list doesn't?"

A use case diagram shows the **scope of a system** at a glance: actors (who or what interacts with the system) connected to use cases (discrete goals the system helps them achieve), all inside a boundary representing the system itself. What it captures that a flat requirements list can't in one view: *who* needs *what* capability, and where the system's boundary actually sits — is a particular action inside this system, or does it belong to an external system the actor also touches?

It's deliberately shallow — it doesn't show steps or logic, only the existence and ownership of a capability — which is exactly why it works well as an early scoping artifact reviewed with stakeholders before diving into detail.

**Say it:** "A use case diagram scopes the system — who needs what capability, and where the system boundary sits — without describing any steps; that shallowness is what makes it a fast, reviewable scoping tool early in discovery."
**Red flag:** Trying to cram process steps or conditions into a use case diagram. That's not its job — steps belong in a use case *description* or an activity/sequence diagram; the diagram itself stays at the scope level.

### Activity Diagrams
**They ask:** "What is an activity diagram used for, and how is it different from a BPMN diagram?"

An activity diagram models the **flow of control** through a process or a use case — sequential steps, decision branches, and parallel forks — using a notation close to a flowchart. It's the UML equivalent of what BPMN does at the business-process level, but scoped to *one use case or one system's internal logic* rather than a cross-organizational business process, and it's read primarily by developers, not clients.

The practical use for a BA: once a use case is scoped, an activity diagram is how you work out and document the actual step-by-step logic *within* that use case — what has to happen, in what order, with what branches — before a developer starts building it.

**Say it:** "An activity diagram is the flowchart-level detail behind one use case — decision branches and parallel steps — read by developers, versus BPMN which models the business process across the whole organization."
**Red flag:** Using an activity diagram to show interactions between multiple separate systems. That's what a sequence diagram is for — activity diagrams model control flow within one scope, not message exchange between participants.

### Sequence Diagrams
**They ask:** "What does a sequence diagram show, and when do you reach for one?"

A sequence diagram shows the **order of interactions between participants over time** — actors and system components as vertical lifelines, with horizontal arrows showing each message passed between them in sequence, top to bottom. It's the tool for exactly one question: "in what order does each component need to talk to each other to make this scenario work?"

You reach for it when timing and order are the actual point of ambiguity — an authentication flow with a token exchange, an integration where a third-party callback has to arrive before the next step can proceed. It's overkill for a simple, linear process with no cross-component timing to nail down.

**Say it:** "A sequence diagram exists to answer one question — what order do components need to exchange messages in — so I reach for it exactly when timing and message order are the actual ambiguity, like an auth flow with a callback."
**Red flag:** Drawing a sequence diagram for a single-component, linear process. If there's no cross-component message ordering to clarify, a sequence diagram adds ceremony without adding information.

### UML Diagram Types Overview
**They ask:** "Beyond use case, activity, and sequence diagrams, what other UML diagram types should a BA know, and when does each apply?"

UML diagrams split into two families: **structural** diagrams show what a system *is made of*, **behavioral** diagrams show what it *does over time*. Beyond the three behavioral diagrams already covered (use case, activity, sequence), the ones a BA most often touches are: **class diagrams** (structural — the data model and relationships between entities), **component diagrams** (structural — how the system decomposes into deployable/replaceable modules), and **state (statechart) diagrams** (behavioral — how one object's state changes in response to events, e.g. an order moving through pending → paid → shipped).

Picking the right diagram type is itself a signal of seniority: each one answers a narrow, specific question, and reaching for the wrong one either overcomplicates a simple point or fails to capture the ambiguity that actually needs resolving.

**Say it:** "Structural diagrams show what the system is made of — class, component; behavioral diagrams show what it does over time — use case, activity, sequence, state — and matching the diagram type to the actual open question is what separates a useful model from noise."
**Red flag:** Reaching for a class diagram to describe a business process, or a use case diagram to describe a data model. Each diagram type answers a specific question — using the wrong one signals you're modeling by habit, not by need.

### Statechart and Component Diagrams
**They ask:** "What are statechart and component diagrams for, specifically?"

A **statechart (state machine) diagram** models the distinct states one object can be in and the events that trigger transitions between them — an order that moves pending → confirmed → shipped → delivered, with each arrow labeled by the event or condition that causes the move. It's the right tool whenever business rules depend on "what state is this thing in" — you can't ship an order that isn't paid, you can't cancel one that's already shipped — because it makes every valid and invalid transition explicit.

A **component diagram** shows how a system decomposes into larger, deployable or replaceable units and their dependencies — closer to an architecture-level view than any of the behavioral diagrams. A BA uses it less often, but it's the right artifact when scoping which part of a system a given requirement actually touches, especially in an integration-heavy or microservices context.

**Say it:** "A statechart diagram makes every valid state transition explicit — essential whenever a business rule depends on 'what state is this in,' like blocking a shipment on an unpaid order; a component diagram scopes which deployable piece of the system a requirement actually touches."
**Red flag:** Writing state-dependent business rules as prose ("can't ship unless paid") scattered across multiple requirements instead of one statechart. Prose rules drift out of sync with each other; a single diagram is the source of truth for every valid transition.

### Class Diagrams for BAs
**They ask:** "How does a BA use a class diagram, given it's usually seen as a developer artifact?"

A class diagram models entities, their attributes, and the relationships between them — at the BA level, this is really the **domain model**: what are the real business concepts (Customer, Order, Product), what data does each carry, and how are they related (one Customer has many Orders, one Order has many OrderLines)? A BA doesn't need the implementation detail a developer adds later (types, method signatures) — the value is agreeing on entities and relationships *before* development starts, so requirements written afterward use consistent, unambiguous terminology.

Relationship types carry real business meaning: association (a general link), aggregation (a "has-a" relationship where the parts can exist independently — a Department has Employees who could exist without it), and composition (a stricter "has-a" where the parts can't exist independently — an Order can't exist without its OrderLines).

**Say it:** "At the BA level a class diagram is a domain model — agreeing on entities, their key data, and how they relate before development starts, so every requirement afterward uses the same vocabulary instead of drifting."
**Red flag:** Skipping the domain model and letting each requirement define terms independently. That's exactly how a project ends up with three different definitions of "active customer" scattered across documents.

### What a Prototype Is and Prototype Types
**They ask:** "What is a prototype, and what types are there?"

A prototype is a mock representation of a product built to validate an idea *before* real development starts — the value is that it's cheap and fast to change, so mistakes get caught in a review meeting instead of in a sprint retrospective after code was already written. Prototypes exist on a spectrum of fidelity: **low-fidelity** (paper sketches, wireframes — grayscale boxes and rough layout, fast to produce, easy to throw away) up to **high-fidelity** (interactive, close-to-final visuals and flows, closer to the real product).

The type you pick trades speed against realism: low-fidelity is right when you're still validating *whether the right screens and flow exist at all*; high-fidelity is right when the flow is settled and you need to validate the actual interaction details or get sign-off that will hold up against the built product.

**Say it:** "Fidelity is a trade-off between speed and realism — I stay low-fidelity while the flow itself is still in question, because it's fast to throw away, and only move to high-fidelity once the flow is settled and I need real interaction feedback."
**Red flag:** Building a polished, high-fidelity prototype before the basic flow has been validated. Investing in visual polish before the structure is agreed wastes the entire point of prototyping cheaply.

### Prototyping Software Options
**They ask:** "What tools do you know for building prototypes, and how do they differ?"

Prototyping tools split roughly by fidelity target and collaboration model. For low-fidelity, fast sketching, tools like Balsamiq deliberately look rough (hand-drawn style) so reviewers focus on layout and flow, not visual polish. For high-fidelity, interactive prototypes, **Figma** has become the de facto standard — real-time collaborative design, component libraries, and clickable prototypes that closely simulate the final product, plus developer handoff (inspect spacing, colors, assets directly from the file). Adobe XD and Sketch serve similar high-fidelity roles with different ecosystem strengths.

The BA-relevant distinction isn't "which tool is best" but which fidelity and collaboration model the current discovery stage actually needs — a fast whiteboard-style sketch reviewed live with a client doesn't need Figma's full component system.

**Say it:** "The tool choice tracks the fidelity and collaboration need, not personal preference — Balsamiq-style tools for fast, rough flow validation, Figma for high-fidelity, collaborative, developer-ready prototypes."
**Red flag:** Defaulting to the most polished tool for every prototyping task regardless of stage. Using a heavyweight, high-fidelity tool for an early flow sketch slows down the exact iteration speed prototyping is supposed to buy you.

### Choosing the Right Prototyping Tool
**They ask:** "How do you decide which prototyping tool and fidelity to use for a given situation?"

The decision runs through three questions, in order. First, **what's actually in question** — if it's whether the right screens and flow exist at all, stay low-fidelity; if it's a specific interaction or visual detail, go high-fidelity. Second, **who's reviewing it** — a client unfamiliar with wireframe conventions may need higher fidelity to give useful feedback, while a technical team can work productively from rough sketches. Third, **how much it costs to be wrong** — a prototype for a core checkout flow that will anchor months of development justifies more investment in interactivity than a one-off internal admin screen.

Getting this wrong in either direction has a real cost: too low-fidelity for a client who needs to sign off on visual details produces vague feedback; too high-fidelity for an early exploratory review wastes design time on details that will change anyway.

**Say it:** "I choose fidelity based on what's actually in question, who's reviewing it, and how expensive being wrong would be — not by defaulting to whichever tool the team already has open."
**Red flag:** Using the same fidelity level for every review regardless of audience or stage. A one-size-fits-all prototyping approach either wastes early-stage speed or under-serves a client who needs to see something closer to real.

### When to Skip Prototyping
**They ask:** "Is there a case where you'd deliberately skip prototyping? When?"

Prototyping isn't free — it costs time, and for the wrong kind of requirement it can actively slow delivery without reducing real risk. It's worth skipping (or keeping extremely minimal) when the UI is simple and low-risk (a standard CRUD admin form following an existing design system), when the requirement is backend-only with no user-facing surface at all, or when the team is iterating fast enough in a live environment that a throwaway prototype adds a redundant step rather than removing risk.

The judgment call is about *where the actual uncertainty lives*: prototyping reduces risk around "will users understand and like this flow" — if that risk is already low (a well-understood pattern, an internal tool with a captive audience), the time is better spent elsewhere.

**Say it:** "I skip prototyping when the actual risk isn't about the flow being unclear — a standard form using an existing pattern, or a backend-only requirement — because prototyping only pays for itself when there's real UX uncertainty to resolve."
**Red flag:** Prototyping every requirement uniformly "because that's the process." Applying it where there's no real uncertainty to reduce burns time without buying any risk reduction.
