# API design & integration — web services, protocols, integration patterns

### Web services — definition and purpose
**They ask:** "What is a web service, and what problem does it actually solve?"

A web service is a standardized way for two systems to exchange data or trigger behavior over a network, independent of what language or platform either side is built on — its whole value is interoperability without either party needing to know the other's internals. It's the mechanism behind almost every integration an SA specifies: a mobile app talking to a backend, two companies' systems exchanging order data, a frontend calling a microservice. Knowing this framing matters because it's what separates "we need an API" (a specific technical ask) from "the systems need to talk" (the actual business need it serves).

**Say it:** "A web service's whole value is letting two systems built on different stacks exchange data without either needing to know the other's internals — I keep that framing when a stakeholder says 'we need an API' so the actual integration need drives the design, not the buzzword."
**Red flag:** Specifying "add a web service" as a requirement with no stated consumer or data contract. A web service isn't the requirement — the data it needs to move between which two systems is.

### SOAP vs. REST — architecture and trade-offs
**They ask:** "Compare SOAP and REST — not just definitions, the actual trade-offs that decide which one fits a project."

SOAP is a protocol with a strict contract (WSDL defines the interface upfront) and built-in standards for security (WS-Security) and transactions — it fits enterprise, regulated, or legacy-integration contexts where a rigid, formally verifiable contract matters more than developer ergonomics. REST is an architectural style, not a protocol — it leans on plain HTTP verbs and typically JSON, trading SOAP's strict contract for simplicity, smaller payloads, and better fit with web and mobile clients. The honest trade-off: REST is faster to build and consume; SOAP's strict typing and built-in standards still win in some banking/government/legacy contexts where those matter more than developer speed.

**Say it:** "REST wins on developer speed and payload size for most modern web/mobile work; SOAP still wins when a formally verifiable contract and built-in transactional/security standards matter more than that speed — which is why it hasn't disappeared from banking and legacy integration."
**Red flag:** Dismissing SOAP as simply "outdated." It's a worse fit for most new web/mobile work, but it's still the right, deliberate choice in some regulated and legacy-heavy integration contexts.

### REST principles and HTTP methods
**They ask:** "What makes an API actually RESTful, and what do the HTTP methods mean semantically?"

REST's core constraints: statelessness (each request carries everything needed, server holds no client session state — which is what lets it scale horizontally without sticky sessions), a uniform interface (resources identified by URLs, manipulated through standard HTTP verbs), and resource-orientation (nouns, not verbs, in the URL — `/orders/42`, not `/getOrder?id=42`). The verbs carry semantic meaning that matters for correctness, not just convention: `GET` is safe and idempotent (never mutates), `POST` creates, `PUT` replaces a whole resource (idempotent — calling it twice with the same body gives the same result), `PATCH` partially updates, `DELETE` removes.

```
GET    /orders/42        → fetch order 42
PUT    /orders/42        → replace order 42 entirely
PATCH  /orders/42        → update specific fields
DELETE /orders/42        → remove order 42
```

**Say it:** "Statelessness is what lets a REST API scale horizontally with no sticky sessions — every request has to carry everything needed, and idempotency on PUT/DELETE is what makes retrying a failed request safe instead of dangerous."
**Red flag:** Designing an endpoint like `POST /updateOrderStatus` instead of `PATCH /orders/42`. Verbs in the URL are a tell the API isn't actually resource-oriented, even if it happens to work over HTTP.

### HTTP status codes
**They ask:** "Walk through the HTTP status code categories, and give examples that actually matter for API design."

The first digit is the category: 2xx success (`200 OK`, `201 Created` after a POST, `204 No Content` for a successful delete with no body), 3xx redirection, 4xx client error — the caller did something wrong (`400 Bad Request` malformed input, `401 Unauthorized` not authenticated, `403 Forbidden` authenticated but not allowed, `404 Not Found`, `409 Conflict` for something like a duplicate resource or optimistic-lock conflict), 5xx server error — the server's fault, not the caller's (`500 Internal Server Error`, `503 Service Unavailable`). The 401-vs-403 distinction is the one candidates most often blur, and it's the one an interviewer most often probes.

**Say it:** "401 means 'I don't know who you are,' 403 means 'I know exactly who you are and you're still not allowed' — collapsing that distinction in a spec means a client can't tell 'log in again' from 'this account will never be allowed to do this.'"
**Red flag:** Returning 401 for a permission failure on an already-authenticated request, or 200 with an error message in the body instead of an actual error status. Both make the API lie about what happened to any client trying to handle errors programmatically.

### HTTP vs. HTTPS
**They ask:** "What's the actual difference between HTTP and HTTPS, and why does it matter beyond 'HTTPS is more secure'?"

HTTPS is HTTP layered over TLS — same request/response semantics, but the entire exchange is encrypted and the server's identity is verified via certificate. The concrete "why it matters" beyond a vague security label: without it, credentials, session tokens, and any payload data are readable in plaintext to anyone on the network path (a public wifi, a compromised router), and the connection is vulnerable to man-in-the-middle tampering, not just eavesdropping. It's a baseline NFR for essentially every modern API, not an optional hardening step.

**Say it:** "HTTPS isn't a hardening extra — over plain HTTP, session tokens and payload data sit in plaintext on the wire for anyone on the network path, which is why I treat TLS as a baseline requirement, not an optional NFR."
**Red flag:** Listing HTTPS as a "nice to have" NFR for a system handling any authenticated or personal data. For anything beyond a static public page, it's a baseline, not an enhancement.

### Tooling — Postman, Swagger, SOAP UI
**They ask:** "How do you use Postman, Swagger/OpenAPI, and SOAP UI in your day-to-day work as an analyst?"

Postman is for manually exercising an API — sending requests, inspecting responses, building a collection that doubles as executable documentation of expected behavior; I use it to validate an API actually matches its spec before signing off a requirement as done. Swagger/OpenAPI is the specification format itself — a machine-readable contract (YAML/JSON) describing every endpoint, its parameters, and response shape, which both generates interactive docs and lets frontend/backend teams work against an agreed contract in parallel before either side is fully built. SOAP UI is Postman's equivalent for SOAP services, understanding WSDL contracts.

```yaml
paths:
  /orders/{id}:
    get:
      summary: Get an order by ID
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      responses:
        '200':
          description: Order found
        '404':
          description: Order not found
```

**Say it:** "An OpenAPI spec is a contract two teams can build against in parallel before either side is done — I write it early specifically so frontend and backend don't block on each other, and I use Postman afterward to verify the built API actually matches it."
**Red flag:** Writing an API requirement only in prose with no OpenAPI/Swagger contract for anything beyond a trivial one-off endpoint. That leaves the exact field names, types, and error shapes to be discovered through Slack messages during implementation.

### JSON Schema and XML Schema
**They ask:** "What is a JSON Schema or XML Schema, and what does it actually enforce that the format itself doesn't?"

JSON and XML are just syntax — neither format alone guarantees a payload has the fields a consumer expects, in the right types, in the right shape. A schema is a separate, formal contract layered on top that defines required fields, types, value constraints (min/max, enum, pattern), and nested structure, so a payload can be *validated* against it programmatically rather than a consumer discovering a missing field at runtime. It's what turns "here's roughly what the JSON looks like" in a Slack message into a document a developer can generate types from and a test suite can validate against automatically.

```json
{
  "type": "object",
  "required": ["id", "email"],
  "properties": {
    "id": { "type": "integer" },
    "email": { "type": "string", "format": "email" }
  }
}
```

**Say it:** "A schema is what turns 'here's roughly what the payload looks like' into something a test suite can actually validate against — without one, a missing required field is a runtime surprise instead of a contract violation caught before deployment."
**Red flag:** Specifying an API payload with only an example JSON blob and no schema. An example shows one valid case; it doesn't say which fields are required, what types are enforced, or what values are valid.

### Data transfer protocols — what they are and why they exist
**They ask:** "What is a data transfer protocol, at a fundamental level, and why do multiple ones exist instead of just one?"

A protocol is an agreed set of rules for how data is formatted, transmitted, and acknowledged between two systems — it exists because different transfer needs have genuinely different requirements: reliability (guaranteed delivery, in order) versus speed (no delivery guarantee, but lower latency), connection-oriented versus connectionless, and different layers of the stack solving different problems (routing versus reliable delivery versus application-level meaning). No single protocol optimizes for all of these simultaneously, which is why the stack has layers, each with its own protocol choice.

**Say it:** "Different protocols exist because reliability and speed are a real trade-off, not a solved problem — TCP pays a latency cost for guaranteed, ordered delivery; UDP skips that guarantee for speed, and picking wrong for the use case is a real design mistake, not a detail."
**Red flag:** Treating "which protocol" as an implementation detail irrelevant to requirements. A live video-call feature and a bank-transfer feature have opposite protocol needs, and that choice belongs in the NFRs, not left silent.

### The OSI model
**They ask:** "Walk through the OSI model's layers and what each one is responsible for."

Seven layers, physical to application, each solving a distinct problem: Physical (raw bits over a medium — cables, radio), Data Link (framing, MAC addressing on a local segment), Network (routing between networks — IP lives here), Transport (reliable end-to-end delivery — TCP/UDP live here), Session (managing a conversation's lifecycle), Presentation (data format/encryption translation), Application (the protocols actual software talks — HTTP, DNS, FTP). The practical value for an SA: when a "network issue" gets reported, knowing which layer a given protocol operates at narrows down where to actually look, instead of treating "the network" as one undifferentiated black box.

**Say it:** "The OSI model's practical use for me is triage — knowing HTTP is application-layer and TCP is transport-layer means a 'the API is slow' complaint and a 'packets are being dropped' complaint point to genuinely different layers to investigate, not the same undifferentiated 'network problem.'"
**Red flag:** Being unable to place common protocols (HTTP, TCP, IP) at their correct layer. That's the level of OSI knowledge that actually matters for troubleshooting — the mnemonic without the protocol mapping is trivia.

### Common protocols and their purpose
**They ask:** "Name the data transfer protocols an analyst should recognize, and what each is actually for."

IP (addressing and routing packets between networks), TCP (reliable, ordered, connection-based delivery on top of IP — the foundation under HTTP), UDP (fast, connectionless, no delivery guarantee — used where speed beats reliability, like video streaming or DNS lookups), FTP (bulk file transfer), DNS (translates domain names to IP addresses), HTTP/HTTPS (the web's application protocol), NTP (clock synchronization across systems — quietly critical for anything using timestamps across distributed services), SSH (encrypted remote shell access), POP3 (older protocol for retrieving email, downloads and typically removes from server, contrasted with IMAP which syncs).

**Say it:** "I don't just name these — I map each to the problem it solves, because a spec that says 'sync data every night' has a very different NTP/clock-sync dependency once multiple services are involved than a single-server system where drift never gets noticed."
**Red flag:** Listing protocol names with no sense of what layer or problem each solves. An interviewer probing this is checking working knowledge, not that you memorized an acronym list.

### Integration methods overview
**They ask:** "What integration methods exist for connecting systems, and what problem does each solve?"

SOA/ESB routes messages through a central enterprise service bus — centralizes transformation and routing logic, at the cost of that bus becoming a bottleneck/single point of failure. MSA (microservices-style direct integration) has services call each other directly, often over REST/gRPC — more decoupled deployability, more distributed complexity to manage. Message queues (RabbitMQ, Kafka, SQS) decouple producer and consumer in time — the sender doesn't need the receiver to be up right now, which is essential for reliability at scale and for absorbing traffic spikes. Direct database integration (one system reading another's DB) is the fastest to build and the most fragile — a schema change on one side silently breaks the other with no contract to catch it. gRPC uses Protocol Buffers over HTTP/2 for fast, strongly-typed, low-latency service-to-service calls — common inside a microservices architecture where both ends are internal services you control. File exchange (SFTP drops, batch files) is the oldest and still common pattern for high-volume, non-real-time B2B data transfer, especially with legacy or third-party systems that don't expose an API.

**Say it:** "Each integration method trades something specific — a message queue trades immediate consistency for reliability and decoupled uptime; direct DB integration trades a formal contract for speed of implementation, which is exactly why it's fragile — I pick based on which trade-off the actual requirement can tolerate."
**Red flag:** Defaulting to direct database integration between two systems because it's the fastest to build. It has no contract layer — a schema change on either side breaks the other silently, with no version negotiation to catch it.

### Choosing an integration method — a worked example
**They ask:** "Walk through choosing an integration method for a concrete case: an e-commerce platform needs to notify a warehouse system whenever an order is placed."

Start from the requirement's actual constraints, not a default preference. Does the warehouse system need to react instantly (favors a direct API call or gRPC) or can it tolerate a short delay (favors a message queue)? Does the order-placing flow need to know synchronously that the warehouse accepted it (favors a direct, synchronous call) or is fire-and-forget acceptable (favors an async queue)? What happens if the warehouse system is down — should orders queue and retry, or should placing an order fail entirely? A message queue (order-placed event, warehouse consumes when ready) is usually the right call here specifically because it decouples uptime — the e-commerce flow doesn't need the warehouse system to be online at the exact moment of purchase, and messages persist and retry instead of getting lost.

**Say it:** "The deciding question for this integration isn't 'which pattern is modern' — it's 'does checkout need to block on warehouse acceptance,' and since it usually doesn't, a queue that decouples uptime and retries on failure beats a synchronous call that makes checkout depend on the warehouse system being up."
**Red flag:** Choosing a synchronous, direct API call for this scenario without asking what happens when the downstream system is temporarily down. That single unasked question is the difference between orders queuing safely and orders getting silently dropped.

### Writing technical specs for an integration
**They ask:** "What does a technical spec for an integration actually need to contain, beyond the endpoint list?"

Beyond the contract itself (endpoints, schema, auth mechanism), a real integration spec needs: the failure mode (what happens on timeout, on a 5xx from the other side — retry with backoff? dead-letter queue? fail the whole operation?), idempotency requirements (can this safely be retried without double-processing — critical for anything involving money or inventory), rate limits on either side, and a data-ownership statement (which system is the source of truth if both sides can write the same field). Skipping the failure-mode section is the single most common gap — it's the part that only shows up as a production incident when it's missing.

**Say it:** "The section most specs skip is failure mode — what happens when the other system times out or errors — and it's exactly the part that turns into a 2am incident when it's missing, so I write it before the happy path, not after."
**Red flag:** An integration spec with a clean happy-path contract and no failure-mode or idempotency section. That's the exact gap that becomes duplicate charges or lost orders in production.
