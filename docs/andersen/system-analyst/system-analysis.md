# System analysis — software types, architecture, algorithms, security

### Software types and where each is used
**They ask:** "What types of software/applications exist, and how do you decide which one fits a given case?"

The main split is desktop, web, and mobile (native/hybrid/cross-platform), and within each, thick vs. thin client. The decision criteria are concrete, not aesthetic: offline capability need (favors thick client/native), distribution and update cadence (web ships instantly to everyone, native goes through app-store review), device capability access (camera, GPS, biometrics push toward native), and total cost of maintaining multiple codebases (cross-platform frameworks trade some native capability for one codebase). A senior analyst justifies the choice against these constraints, not against "what's modern."

**Say it:** "I pick software type against concrete constraints — offline need, distribution speed, device-API access, and maintenance cost of multiple codebases — not against what's trendy; each of those can independently flip the right answer."
**Red flag:** Recommending native mobile by default "for performance" without checking whether the actual requirement (offline mode, camera access, app-store distribution) is what's driving the need. Most CRUD-heavy business apps don't need it.

### Thick vs. thin clients
**They ask:** "What's the difference between a thick and a thin client, with examples?"

A thin client does minimal local processing and relies on the server for logic and data — a browser rendering a server-driven web app is the canonical example; the trade-off is near-zero local install/update burden at the cost of requiring a live connection for most functionality. A thick client runs substantial logic locally — a desktop accounting app, a native mobile app with local caching — trading install/update overhead for offline capability and richer local performance. Most modern systems land somewhere in between (a SPA with local state and service workers is thicker than a pure server-rendered page).

**Say it:** "Thin clients trade offline capability for zero install/update burden; thick clients trade that burden for local performance and offline capability — most real systems today sit somewhere in between, not at either extreme."
**Red flag:** Calling a modern single-page web app "thin" without qualification. A SPA holding significant client-side state and logic is meaningfully thicker than a classic server-rendered page, even though it still runs in a browser.

### Operating system types and virtualization
**They ask:** "What OS types should an analyst know, and what's virtualization for in a project context?"

Beyond the desktop trio (Windows, macOS, Linux) and mobile (iOS, Android), an analyst should know real-time OS (deterministic response time, used in embedded/industrial systems) exists as a category with different guarantees than a general-purpose OS. Virtualization — running a guest OS inside a host via VMware/VirtualBox/Hyper-V, or containerization via Docker — matters practically for cross-platform testing (validating a requirement's behavior on an OS you don't have natively) and for isolating a client's environment for a demo or reproduction without touching your own machine.

**Say it:** "Virtualization is a working tool for me, not just trivia — I spin up a VM to validate a requirement's behavior on an OS I don't run natively, or to reproduce a client-reported issue in an isolated environment."
**Red flag:** Being unable to explain why virtualization matters beyond "it runs another OS." The practical value for an SA is isolated, reproducible testing environments — that's the answer that shows working knowledge, not textbook recall.

### OOP principles
**They ask:** "What are the core principles of object-oriented programming, and why does an analyst need to know them?"

Encapsulation (bundling data and behavior, hiding internal state behind an interface), inheritance (a class extending another's behavior), polymorphism (different classes responding to the same call in their own way), and abstraction (exposing only what's relevant, hiding implementation detail) are the four pillars. An analyst needs them not to write code, but to read a class diagram, discuss a domain model with developers in shared vocabulary, and reason about whether a proposed design (e.g., "should Refund inherit from Payment or compose it") actually matches the business relationship.

**Say it:** "I don't need OOP to write production code, but I need it to read a class diagram and push back intelligently when a domain model's inheritance doesn't actually match the business relationship — like a Refund modeled as a type of Payment instead of something that references one."
**Red flag:** Reciting the four pillars with textbook definitions but no example of using them to reason about a real domain model. That's memorization without the working application an SA actually needs.

### Client-server and three-tier architecture
**They ask:** "Explain client-server architecture and three-tier architecture, and how they relate."

Client-server is the basic split: a client requests, a server responds — true of nearly every networked system. Three-tier architecture is a specific, common way to structure the *server* side: presentation tier (UI), application/logic tier (business rules, often an API layer), and data tier (the database) — kept as separate, independently deployable layers specifically so a change to one (redesigning the UI, swapping the database) doesn't force a rewrite of the others. It's the default architecture an analyst should be able to sketch and defend for a typical web application.

```
[Client/Browser] <--HTTP--> [App Server / API] <--SQL--> [Database]
   presentation         application/logic          data
```

**Say it:** "Three-tier architecture separates presentation, logic, and data specifically so each can change independently — swap the database or redesign the UI without rewriting the other two layers — and it's my default sketch for a typical web system."
**Red flag:** Describing "client-server" and "three-tier" as the same thing. Client-server is the basic request/response relationship; three-tier is a specific way of structuring what's behind the server side of that relationship.

### Monolith vs. microservices vs. SOA
**They ask:** "Compare monolithic, service-oriented, and microservices architecture — trade-offs, not just definitions."

A monolith deploys as one unit — simple to develop, test, and deploy early on, but coupling grows over time and any change requires redeploying the whole system, which caps team scalability. SOA (Service-Oriented Architecture) breaks the system into services communicating over a shared enterprise service bus (ESB) — an earlier attempt at decoupling, but the centralized ESB itself can become a bottleneck and single point of failure. Microservices push decoupling further: small, independently deployable services, each owning its own data, communicating directly (often over HTTP/gRPC or a lightweight message broker) rather than through a heavyweight central bus — at the cost of real operational complexity (distributed tracing, network reliability, data consistency across services).

**Say it:** "The honest trade-off isn't 'microservices are better' — a monolith is the right call for a small team and unclear domain boundaries; microservices earn their operational complexity only once team scale or independent-deployment need actually justifies it."
**Red flag:** Recommending microservices for a new product with a two-person team and no proven domain boundaries yet. That's paying distributed-systems complexity before you even know where the service boundaries should be.

### Choosing an architecture — a worked example
**They ask:** "Walk through an example of choosing between architectures for a real system."

Take a ride-hailing platform at MVP stage versus at scale. At MVP, a monolith with a three-tier structure is the right call — the domain boundaries (matching, pricing, payments) aren't proven yet, the team is small, and monolith deploy simplicity outweighs the theoretical benefits of splitting too early. Once the platform has proven product-market fit and specific components have wildly different scaling needs (the real-time location/matching service needs to scale independently of, say, the billing service), extracting those into separate services becomes justified — driven by an actual, observed scaling or team-ownership constraint, not by following a trend.

**Say it:** "I justify an architecture split with an observed constraint, not a trend — 'the matching service needs to scale 10x independent of billing' is a reason to extract a microservice; 'microservices are the modern approach' isn't."
**Red flag:** Justifying a proposed architecture with an industry trend instead of a specific constraint of the system being designed. That's the tell of someone repeating a pattern without having reasoned about when it applies.

### Programming models
**They ask:** "What programming models/paradigms should an analyst be conversant in, and why does it matter for a spec?"

Imperative (step-by-step instructions, most mainstream languages), object-oriented (modeling the domain as interacting objects), functional (composing pure functions, avoiding mutable state — relevant when a client asks about a Scala/Elixir/Haskell stack), and event-driven (the system reacts to events rather than running a fixed sequence — relevant for real-time systems, IoT, or a pub/sub integration). It matters for a spec because event-driven systems, in particular, need requirements written differently — "when X event occurs, the system shall Y," not a linear step sequence, since there's no fixed order of operations to describe.

**Say it:** "Event-driven systems need requirements written as trigger-and-response, not a linear sequence — recognizing the paradigm up front is what keeps me from writing an SRS that implies an execution order the system doesn't actually have."
**Red flag:** Writing "step 1, step 2, step 3" requirements for a genuinely event-driven, asynchronous system. That implies an ordering guarantee the architecture doesn't provide, and it'll mislead whoever implements against it.

### Data structures and algorithms — the analyst's working level
**They ask:** "What do you need to know about data structures and algorithms as an analyst, not as a developer?"

The point isn't implementing a red-black tree — it's having enough vocabulary to reason about a performance requirement's feasibility. Knowing arrays are O(1) random access but O(n) insertion, that a hash map gives near-O(1) lookup versus a list's O(n) scan, and that a database index is essentially a pre-built lookup structure trading write cost for read speed, is what lets an analyst sanity-check "the system shall return search results in under 100ms for a 10-million-row table" against whether the underlying data structure can plausibly deliver that, instead of writing a number and hoping.

**Say it:** "I don't need to implement the data structure — I need enough of the vocabulary to sanity-check a performance NFR against whether the underlying storage can plausibly deliver it before I write the number down."
**Red flag:** Writing a strict latency NFR with no sense of whether the data access pattern behind it (a full table scan vs. an indexed lookup) can plausibly meet it. That's a number picked to sound precise, not one grounded in feasibility.

### Algorithm and data structure classification
**They ask:** "What types of data structures and algorithms exist, at the classification level an analyst should know?"

Data structures: linear (arrays, linked lists, stacks, queues — ordered, sequential access) versus non-linear (trees, graphs, hash tables — hierarchical or networked relationships). Algorithms classify by purpose: sorting, searching, graph traversal, and by strategy: greedy, divide-and-conquer, dynamic programming. Complexity (Big O) describes how an algorithm's cost grows with input size — O(1) constant, O(log n) logarithmic, O(n) linear, O(n²) quadratic — and it's the concept that turns "this feature might be slow at scale" from a hunch into something you can actually argue for in an NFR conversation.

**Say it:** "Big O is what turns 'this might be slow at scale' from a hunch into an argument — an O(n²) operation on a dataset that's about to 100x is a concrete NFR risk I can flag before launch, not after a client complains."
**Red flag:** Treating algorithm complexity as pure CS trivia irrelevant to the SA role. It's the exact tool for flagging a scaling risk in a requirement before it becomes a production incident.

### Information security fundamentals — the CIA triad
**They ask:** "What are the three states/pillars of information security, and what does each protect against?"

Confidentiality (only authorized parties can read the data — protected by encryption and access control), Integrity (data isn't altered in unauthorized or undetected ways — protected by checksums, digital signatures, audit logs), and Availability (the system is accessible when needed — protected by redundancy, DDoS mitigation, backups). Every security-related NFR maps to one of these three; naming which one a given requirement protects is what turns "make it secure" into something specific and testable.

**Say it:** "Every security NFR I write maps to one of confidentiality, integrity, or availability — naming which one turns 'make it secure' into something specific enough to actually test."
**Red flag:** Writing a security requirement as "the system shall be secure" with no reference to which CIA pillar it protects or how it's measured. That's not a requirement, it's a wish.

### Authentication vs. authorization
**They ask:** "What's the difference between authentication and authorization, and where does each show up in a spec?"

Authentication answers "who are you" — verifying identity, via password, OAuth token, biometric, MFA. Authorization answers "what are you allowed to do" — evaluated *after* identity is established, via roles (RBAC) or fine-grained permissions/policies (ABAC). Conflating them in a requirement is a common junior mistake: "only logged-in users can access the admin panel" is actually two requirements — that they're authenticated *and* that they hold the admin role — and both need to be independently testable.

**Say it:** "Authentication and authorization are two separate requirements even when they read like one sentence — 'only admins can see this' means 'must be authenticated' plus 'must hold the admin role,' and I write and test both independently."
**Red flag:** Writing a single requirement that bundles "must be logged in" and "must have permission" as if they're the same check. A user can be authenticated and still lack authorization — the requirement needs to make that boundary explicit.

### Encryption and public/private keys
**They ask:** "What's data encryption for, and how do public and private keys fit into it?"

Encryption protects confidentiality by making data unreadable without the right key — symmetric encryption uses one shared key for both encrypting and decrypting (fast, but the key itself needs a secure channel to distribute), asymmetric (public/private key) encryption uses a mathematically linked pair where data encrypted with the public key can only be decrypted with the private key — solving the key-distribution problem, since the public key can be shared openly. In practice, TLS/HTTPS uses asymmetric encryption to securely exchange a symmetric session key, then switches to symmetric for the actual data transfer, because asymmetric is computationally expensive at scale.

**Say it:** "Asymmetric encryption solves the key-distribution problem symmetric encryption has — which is exactly why TLS uses it just to exchange a session key, then switches to fast symmetric encryption for the actual data, rather than using asymmetric for everything."
**Red flag:** Claiming HTTPS encrypts the whole session with asymmetric encryption throughout. It only uses asymmetric for the initial handshake/key exchange; the bulk data transfer uses the faster symmetric key it negotiated.

### Firewalls and DDoS protection
**They ask:** "How does a firewall work, and what is a DDoS attack — what NFRs would you write to protect against it?"

A firewall filters network traffic against rules — allowing or blocking based on IP, port, protocol, or (for an application-layer/WAF) request pattern — acting as the gatekeeper between trusted and untrusted networks. A DDoS (Distributed Denial of Service) attack floods a system with traffic from many sources simultaneously, aiming to exhaust its capacity to serve legitimate requests, not to breach data. Defenses show up as availability NFRs: rate limiting, traffic scrubbing/CDN-level mitigation (Cloudflare, AWS Shield), and auto-scaling to absorb legitimate spikes while a WAF filters malicious patterns.

**Say it:** "DDoS defense is an availability NFR, not a confidentiality one — I'd write it as rate limiting plus CDN-level traffic scrubbing, because the attack's goal is exhausting capacity, not stealing data."
**Red flag:** Describing DDoS mitigation purely in terms of encryption or access control. Those protect confidentiality/authorization; DDoS is an availability attack and needs availability-focused defenses.

### Writing NFRs for secure data transfer
**They ask:** "Give an example of a non-functional requirement for secure data transfer, and what makes it well-formed."

A well-formed secure-transfer NFR names the mechanism and the minimum acceptable standard, not just the goal — "data in transit shall be secure" isn't testable; a version and cipher requirement is. It should also state what's covered (all traffic, or specifically PII/payment data) and reference the compliance driver if there is one, since that's usually where the specific standard comes from.

```
NFR-SEC-07  All client-server traffic shall use TLS 1.2 or higher.
NFR-SEC-08  Payment card data shall never be transmitted or stored
            unencrypted; PCI-DSS scope applies to the payment service.
```

**Say it:** "A secure-transfer NFR names the protocol version and what data it covers, not just 'encrypted' — 'TLS 1.2 or higher, all traffic' is testable; 'the connection shall be secure' isn't."
**Red flag:** Writing a security NFR with no version number or scope — "shall use encryption" leaves an implementer free to pick a deprecated cipher and technically satisfy the letter of the requirement.
