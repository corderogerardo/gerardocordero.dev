# Modeling — UML, BPMN, prototyping

### UML — purpose and diagram families
**They ask:** "What is UML, what's it used for, and what are the main categories of diagrams?"

UML (Unified Modeling Language) is a standardized visual notation for describing a system's structure and behavior — its value is precision that prose can't match: a sequence diagram removes the ambiguity a paragraph of "then the service calls the database" leaves open. Diagrams split into two families: structural (class, component, deployment — what the system *is made of*) and behavioral (use case, activity, sequence, state machine — what the system *does*). A senior analyst doesn't draw every diagram type on every project — they pick the one or two that resolve the actual ambiguity at hand.

**Say it:** "UML's value is removing the ambiguity prose leaves open — I pick structural diagrams to show what the system is made of and behavioral ones to show what it does, and I only draw the one or two that resolve the actual open question, not the full set by default."
**Red flag:** Treating UML as a deliverable checklist — producing every diagram type regardless of whether it clarifies anything. Diagrams earn their place by resolving a specific ambiguity, not by convention.

### Use Case diagram
**They ask:** "What does a Use Case diagram show, and when do you reach for one?"

A Use Case diagram gives the highest-level, fastest read of *who can do what* with a system — actors (roles, human or system) connected to the use cases (capabilities) they can invoke, with `<<include>>` for a use case another one always triggers and `<<extend>>` for optional behavior that sometimes applies. It's the right tool at the start of scoping — a stakeholder can validate "yes, that's everything an admin should be able to do" in thirty seconds, faster than reading a feature list.

```
Actor: Customer ──> (Browse Catalog)
Actor: Customer ──> (Place Order) ──<<include>>──> (Process Payment)
Actor: Admin    ──> (Manage Inventory)
```

**Say it:** "A Use Case diagram is the fastest way to get a stakeholder to validate scope — 'is this everything an admin can do' reads off the diagram in seconds, before I've written a single detailed requirement."
**Red flag:** Cramming implementation detail (button names, screen flow) into a Use Case diagram. It's meant to stay at the actor-and-capability level; detail belongs in the use case's written flow or in a sequence diagram.

### Activity diagram
**They ask:** "What's an Activity diagram for, and how is it different from a flowchart people already know?"

An Activity diagram models a workflow's control flow — sequence, branching (decision diamonds), and parallel paths (fork/join bars for concurrent activities) — across one or more actors, closer to a business-process flowchart but with UML's standardized notation and support for swimlanes to show which actor owns which step. I reach for it when a process has genuine branching or concurrency worth making explicit — a linear happy-path flow doesn't need one.

**Say it:** "I reach for an Activity diagram specifically when a process branches or runs in parallel across actors — swimlanes make ownership explicit, which a plain flowchart usually leaves implicit."
**Red flag:** Drawing an Activity diagram for a strictly linear, single-actor process. That's a numbered list with extra steps to draw.

### Sequence diagram
**They ask:** "What does a Sequence diagram show, and what's it good at catching that other diagrams miss?"

A Sequence diagram shows *time-ordered messages* between objects/systems — who calls whom, in what order, synchronously or asynchronously, and what comes back. It's the diagram that catches integration bugs before they're built: a missing response message, a call happening before its precondition is met, or an unnecessary synchronous call that should be async are all visible on a sequence diagram in a way they aren't in a use case or a paragraph of prose.

```
Client -> API: POST /orders
API -> PaymentService: charge(amount)
PaymentService --> API: success
API -> DB: insert(order)
API --> Client: 201 Created
```

**Say it:** "A Sequence diagram is where I catch integration bugs before anyone writes code — a missing return message or a call in the wrong order is obvious on the diagram and easy to miss in a paragraph."
**Red flag:** Skipping the sequence diagram for a multi-system integration and going straight to prose. The exact call order and sync/async boundary is precisely what prose tends to leave implicit.

### Class diagram
**They ask:** "What does a class diagram illustrate, and what does the analyst use it for versus the developer?"

A class diagram shows a system's static structure: classes/entities, their attributes and methods, and the relationships between them (association, aggregation, composition, inheritance) with multiplicity (1-to-many, many-to-many) on each relationship. Developers use it to design implementation; the analyst's use is closer to conceptual data modeling — validating that the domain's entities and their relationships are correctly understood *before* a developer commits to a schema, since a wrong relationship discovered after implementation is expensive to unwind.

```
Order "1" --> "many" OrderLine
Order "many" --> "1" Customer
```

**Say it:** "I use a class diagram at the conceptual level to validate entity relationships before anyone commits to a schema — a wrong multiplicity caught here is a five-minute fix; caught after implementation, it's a migration."
**Red flag:** Confusing aggregation and composition, or getting multiplicity backwards, in an interview. Composition means the part can't exist without the whole (order lines die with the order); aggregation means it can (a team member exists independent of the team) — the distinction has real design consequences.

### Component and Deployment diagrams
**They ask:** "What's the difference between a Component diagram and a Deployment diagram?"

A Component diagram shows a system's logical building blocks — modules, services, the interfaces between them — independent of where anything actually runs; it's the diagram for discussing architecture and integration boundaries. A Deployment diagram shows the physical/infrastructure view — which component runs on which server, container, or cloud node, and the network paths between them; it's the diagram for discussing infrastructure, scaling, and deployment topology. The two are complementary views of the same system at different altitudes.

**Say it:** "Component diagrams answer 'what are the pieces and how do they talk'; Deployment diagrams answer 'where does each piece actually run' — I reach for the first in an architecture discussion and the second in an infrastructure or scaling discussion."
**Red flag:** Using a Component diagram to answer an infrastructure question ("how many instances run in production"). That's a Deployment-diagram question; the component view doesn't carry that information.

### Statechart (State Machine) diagram
**They ask:** "What is a Statechart diagram, and what kind of requirement is it best suited to capture?"

A Statechart diagram models an object's lifecycle as a set of discrete states and the events that trigger transitions between them — it's the right tool whenever "what can happen next" genuinely depends on "what state are we currently in," which a flat requirements list handles poorly. A classic use: an order's lifecycle (Placed → Paid → Shipped → Delivered, with a Cancelled state reachable from several of those, but not from Delivered) — the diagram makes illegal transitions (cancelling a delivered order) visually obvious in a way a prose requirement easily misses.

```
[Placed] --pay--> [Paid] --ship--> [Shipped] --deliver--> [Delivered]
[Placed] --cancel--> [Cancelled]
[Paid] --cancel--> [Cancelled]
```

**Say it:** "A Statechart diagram is for objects where 'what's allowed next' depends on current state — an order's cancel button being available from Placed and Paid but not Delivered is exactly the kind of illegal-transition bug this diagram surfaces before development."
**Red flag:** Specifying a stateful lifecycle (order status, ticket status, approval workflow) purely as a list of possible values with no diagram of legal transitions. That's how "cancel a delivered order" becomes a production bug instead of a caught spec gap.

### BPMN — purpose and basic elements
**They ask:** "What is BPMN, what's it used for, and what are its basic building blocks?"

BPMN (Business Process Model and Notation) is a standardized notation for modeling business processes end to end, including the parts that never touch the software system — a human approval step, a manual handoff between departments. It exists because a Use Case diagram shows *system* capability, but a real business process usually spans systems, people, and manual steps that a use case can't represent. Basic elements: events (circles — start/end), activities/tasks (rounded rectangles — a unit of work), gateways (diamonds — decision or parallel-split points), and sequence flows (arrows) connecting them.

**Say it:** "BPMN exists because real business processes span people and manual steps a Use Case diagram can't represent — I reach for it specifically when the process crosses outside the system boundary."
**Red flag:** Using BPMN to model something that's purely a system interaction with no human or cross-department step involved. That's a Use Case or Sequence diagram's job; BPMN's value is modeling the parts outside the software.

### BPMN event and action types
**They ask:** "What event and action/task types does BPMN support, and why does the distinction matter?"

Events carry a type beyond start/end — a Timer event (something happens on a schedule or after a delay), a Message event (triggered by an incoming message from another process/system), an Error event (an exception path), a Signal event (a broadcast trigger). Task types similarly specialize: a User Task (a human does something in a UI), a Service Task (a system does it automatically), a Manual Task (happens entirely outside any system — a phone call). The distinction matters because it tells an implementer exactly what needs building versus what's a business-process constraint with no corresponding code.

**Say it:** "Tagging a step as a Service Task versus a Manual Task is the line between 'this needs an API' and 'this is a phone call someone makes' — getting that wrong means either building automation nobody needed or missing automation that was actually required."
**Red flag:** Modeling every task generically without specifying User vs. Service vs. Manual. That leaves the implementation team guessing which steps actually need software behind them.

### BPMN pools, lanes, and multi-actor processes
**They ask:** "How do pools and lanes work in BPMN, and why do you need them for a multi-actor process?"

A pool represents a whole participant (an organization or major system) in the process; lanes subdivide a pool to show which role or department within it owns each step. The reason they matter: most real processes cross ownership boundaries — a claim gets submitted by a customer, reviewed by an adjuster, approved by a manager — and without lanes, the diagram can't show *who's* responsible for each activity, which is exactly the information a process owner needs to spot a handoff gap or an unclear responsibility.

**Say it:** "Lanes exist to answer 'who owns this step' — without them, a cross-department process diagram shows what happens but not who's accountable for each handoff, which is usually where the real process breaks down."
**Red flag:** Modeling a multi-department process in a single unlaned pool. It hides exactly the ownership information a process improvement conversation needs.

### Prototyping — types and when to use each
**They ask:** "What types of prototypes exist, and how do you choose the right fidelity for a given stage?"

Prototype fidelity should match the question being asked. Low-fidelity (paper sketches, wireframes — grayscale, no real content) answers "is the flow and information architecture right" cheaply and fast, encouraging structural feedback instead of debates about color. High-fidelity (pixel-accurate, often clickable) answers "does this look and feel right" and is what you'd show a client for sign-off or use in usability testing, but it's expensive to iterate on. Interactive prototypes (clickable Figma flows) sit in between — enough fidelity to simulate real navigation without full visual polish.

**Say it:** "I match fidelity to the question — wireframes when I'm validating the flow, since low fidelity keeps feedback on structure instead of color; high-fidelity clickable prototypes only once the flow's settled and I need sign-off or usability testing."
**Red flag:** Presenting a high-fidelity, pixel-perfect mockup for early-stage flow feedback. Stakeholders fixate on color and font instead of the structural question you actually needed answered, and it's expensive to redo when the flow changes.

### Prototyping tools
**They ask:** "What prototyping tools do you know, and what does each fit?"

Figma is the current default for UI prototyping — collaborative, browser-based, supports both static mockups and clickable interactive flows in one tool, which is why it's largely displaced older desktop-only tools. Balsamiq is popular specifically for deliberately low-fidelity wireframing — its sketchy visual style discourages stakeholders from commenting on color instead of structure. Axure fits more complex, logic-heavy interactive prototypes (conditional flows, variables) that Figma's prototyping mode doesn't fully cover. Knowing which tool fits which fidelity/complexity need — not just tool names — is the actual signal here.

**Say it:** "Figma covers most day-to-day prototyping now since it does both static and clickable flows in one collaborative tool — I'd reach for Balsamiq specifically to keep early feedback on structure, not visuals, and Axure only when the prototype needs real conditional logic."
**Red flag:** Naming tools with no sense of what each is actually better at. Rattling off "Figma, Balsamiso, Axure" without the fidelity/complexity distinction is trivia, not working knowledge.
