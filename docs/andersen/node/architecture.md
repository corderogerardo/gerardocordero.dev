# Architecture and design

### Monolith vs microservices trade-offs
**They ask:** "Give a real trade-off analysis for monolith vs microservices — not just 'microservices scale better.'"

A monolith deploys as one unit — simpler operationally (one deploy pipeline, one set of logs, no network calls between internal modules, trivial to run locally), and a single in-process function call is orders of magnitude cheaper and more reliable than a network call, which is exactly why splitting too early adds latency and failure modes for no real benefit. Microservices earn their complexity when **team boundaries** need to scale independently (different teams owning different services, deploying on their own schedule without coordinating a shared release) or when parts of the system have genuinely different scaling/reliability profiles. The honest framing: microservices trade development simplicity for operational flexibility, and that trade only pays off at a specific organizational scale.

**Say it:** "I default to a monolith until there's a concrete organizational reason to split — usually team-boundary scaling — because a network call is strictly less reliable and more expensive than a function call, and splitting a system into services before that need is real just adds distributed-systems complexity for no corresponding benefit."
**Red flag:** Starting a new product on a microservices architecture "for future scale" before there's a team or load pattern that actually needs it. That's paying the full operational tax of distributed systems on day one, for a scaling problem that doesn't exist yet.

### Service boundaries and domain-driven design
**They ask:** "How do you decide where to draw a service boundary?"

The reliable signal is a **bounded context** from domain-driven design — a part of the domain with its own consistent model and vocabulary, where the same term can mean something different in another context (a "Product" in the catalog service has different attributes and lifecycle than a "Product" in the shipping service). Draw the boundary where the domain model genuinely diverges, not along arbitrary technical lines (e.g. splitting by database table). A strong signal you've got the boundary right: each service can be deployed independently, most changes stay within one service, and cross-service calls are the exception, not the norm for a typical feature.

**Say it:** "I draw service boundaries at bounded contexts — where the domain model itself genuinely diverges — not along arbitrary technical seams, because the real test is whether most feature changes stay inside one service instead of touching several."
**Red flag:** Splitting services by technical layer (a 'database service,' a 'validation service') instead of by business capability. That forces almost every feature to touch multiple services for one unit of business logic, which is the opposite of what the split was supposed to buy.

### API gateway pattern
**They ask:** "What does an API gateway do in a microservices architecture, and what problem does it solve for clients?"

Without a gateway, a client (mobile app, frontend) needs to know the address of every individual backend service and stitch together multiple calls itself — brittle, and it leaks internal topology to the outside world. An **API gateway** sits in front of all services as a single entry point: it routes requests to the right service, and centralizes cross-cutting concerns — auth/token validation, rate limiting, request logging, response aggregation from multiple services into one client-facing response — so individual services don't each reimplement that logic.

```
client -> API gateway (auth, rate limit, routing) -> orders-service
                                                    -> inventory-service
```

**Say it:** "The gateway centralizes cross-cutting concerns — auth, rate limiting, routing — so individual services stay focused on their domain logic instead of each reimplementing the same infrastructure concerns, and it also hides internal service topology from external clients."
**Red flag:** Putting business logic inside the API gateway itself. It should stay thin — routing and cross-cutting infra concerns — pushing domain logic into it recreates a monolith at the edge, coupled to every service behind it.

### Event-driven architecture and message queues
**They ask:** "What does event-driven architecture solve that direct service-to-service HTTP calls don't?"

Direct HTTP calls couple services **temporally** — the caller blocks waiting for the callee to be up and respond, and if the callee is slow or down, the caller fails too (or has to build its own retry/circuit-breaker logic). An event-driven architecture decouples that: a service publishes an event to a message queue/broker (RabbitMQ, Kafka, SQS) and moves on immediately; consumers process it whenever they're ready, independently of the publisher's availability at that moment. This buys resilience (a consumer being briefly down doesn't fail the producer's request) and natural load-leveling (a burst of events queues up instead of overwhelming a downstream service synchronously) — at the cost of eventual rather than immediate consistency, and genuinely harder debugging since the flow isn't a single traceable call stack anymore.

```js
await queue.publish('order.created', { orderId, items }); // fire and move on
// consumer, independently, whenever it's ready:
queue.subscribe('order.created', async (event) => await sendConfirmationEmail(event));
```

**Say it:** "Events decouple services temporally — the publisher doesn't block on or even know about the consumer's availability — which buys resilience and load-leveling at the cost of eventual consistency and a harder-to-trace flow, so I reach for it specifically where 'processed eventually' is an acceptable trade for 'processed synchronously right now.'"
**Red flag:** Using an event queue for something that genuinely needs an immediate, synchronous answer (like validating a payment before confirming an order to the user). Fire-and-forget is the wrong shape when the caller actually needs the result before it can proceed.

### CQRS and event sourcing
**They ask:** "What is CQRS, and how does event sourcing relate to it?"

**CQRS** (Command Query Responsibility Segregation) splits the model used to *write* data from the model used to *read* it — instead of one schema serving both, writes go through a command model optimized for validating and applying business rules, and reads go through a separately-optimized (often denormalized) query model, which lets each side scale and evolve independently, especially valuable when read and write load patterns are very different. **Event sourcing** is a complementary but distinct pattern: instead of storing current state, you store the full sequence of events that *led to* that state, and current state is derived by replaying them — which gives a complete audit trail and lets you rebuild any past state, at the cost of real complexity in querying (you generally need a separate read-model projection, which is why event sourcing and CQRS are so often paired).

**Say it:** "CQRS separates the write model from the read model so each can be optimized independently; event sourcing goes further and stores the event history instead of current state, which gives a full audit trail but usually forces you into CQRS anyway, since querying raw event history directly is impractical."
**Red flag:** Adopting event sourcing for a typical CRUD domain with no real need for audit history or point-in-time replay. It's a significant complexity and tooling investment that only pays off when the audit trail or temporal query capability is an actual requirement, not just "sounds more sophisticated."

### Designing for horizontal scalability
**They ask:** "What architectural properties does a service need to actually scale horizontally?"

The foundational requirement is **statelessness** at the application layer — any instance can handle any request, with no session or in-memory state tied to a specific instance, because a load balancer distributing traffic across N instances assumes exactly that. Anything stateful (sessions, caches, uploaded file processing) has to move to a shared external store (Redis, S3, the database) that every instance can reach identically. Beyond that: the database itself needs a scaling strategy (read replicas, sharding) since it's usually the actual bottleneck once the application layer scales out cleanly, and background work needs to be safely idempotent/re-runnable, since multiple instances might pick up overlapping work under retries.

**Say it:** "Horizontal scaling starts with statelessness at the application layer — any instance handles any request — everything that would tie a request to a specific instance has to move to a shared external store, and the database usually becomes the real bottleneck once the app layer itself scales out cleanly."
**Red flag:** Scaling an application layer horizontally while it still stores session state or in-memory caches locally per instance. Traffic routed to a different instance than the one that set the state sees inconsistent or missing data.

### Caching strategies
**They ask:** "Walk through cache-aside, write-through, and write-behind, and how you handle invalidation."

**Cache-aside** (lazy loading): the application checks the cache first, and on a miss, reads from the database and populates the cache for next time — simple, and the cache only ever holds what's actually been requested, but the first request after any eviction always pays full latency. **Write-through**: every write goes to the cache and the database together, synchronously — reads are always warm, but writes are slower since both stores must succeed. **Write-behind**: writes go to the cache immediately and the database is updated asynchronously afterward — fast writes, but a real risk of data loss if the process crashes before the async write completes. Invalidation is the genuinely hard part of any strategy — a TTL is the simplest and most robust default; explicit invalidation on write is more precise but requires catching every code path that mutates the underlying data.

**Say it:** "Cache-aside is my default because it's simplest and self-limiting to what's actually requested — I reach for write-through when reads must always be warm, and I treat cache invalidation as the genuinely hard part, defaulting to a TTL over explicit invalidation unless every write path is guaranteed to hit the invalidation logic."
**Red flag:** Relying entirely on explicit cache invalidation with no TTL fallback. The moment one write path forgets to invalidate — a batch job, an admin tool, a new feature — the cache silently serves stale data indefinitely with no self-healing.

### Circuit breaker pattern
**They ask:** "What is the circuit breaker pattern, and what failure mode does it prevent?"

Without one, a service calling a failing downstream dependency keeps retrying every request against it — which does two bad things: it wastes resources (threads, connections) waiting on a dependency that's already down, and it can make the downstream service's recovery *harder* by continuing to hammer it with traffic the moment it comes back up. A circuit breaker tracks failure rate on calls to a dependency; once failures cross a threshold, it "opens" — failing fast immediately without even attempting the call, for a cooldown period — then periodically allows a trial request through ("half-open") to check if the dependency has recovered before fully closing again.

```
closed (normal) -> failures exceed threshold -> open (fail fast, no calls attempted)
                                              -> after cooldown -> half-open (trial request)
                                              -> success -> closed / failure -> open again
```

**Say it:** "A circuit breaker fails fast once a dependency's failure rate crosses a threshold, instead of every caller queuing up retries against something that's already down — that protects both the caller's own resources and gives the failing dependency room to actually recover instead of getting hammered the moment it comes back."
**Red flag:** Retrying a failing downstream call indefinitely with no circuit breaker or backoff. Under a real outage, that turns one dependency's failure into cascading resource exhaustion across every service that calls it.

### The saga pattern for distributed transactions
**They ask:** "How do you keep data consistent across a multi-step operation that spans several microservices, when a single ACID transaction can't span them?"

A distributed transaction can't rely on a database's transactional guarantees, since each service owns its own data store — the **saga pattern** breaks the operation into a sequence of local transactions, each in one service, where every step also defines a **compensating action** that undoes it if a later step fails. In an orchestrated saga, a coordinator explicitly calls each step and triggers compensations on failure; in a choreographed saga, each service reacts to the previous step's event and knows its own compensation, with no central coordinator. Either way, the guarantee is weaker than ACID — **eventual consistency**, not immediate — which has to be an acceptable trade for the business operation in question.

```
1. reserve-inventory (service A)     -- compensate: release-inventory
2. charge-payment (service B)        -- compensate: refund-payment
3. create-shipment (service C)       -- if this fails, run compensations for 2 then 1
```

**Say it:** "A saga replaces one ACID transaction with a sequence of local transactions, each paired with a compensating action to undo it — that trades immediate consistency for eventual consistency, which is the real cost of a distributed transaction and has to be an explicit, accepted trade-off, not an afterthought."
**Red flag:** Assuming a saga gives the same atomicity guarantee as a database transaction. It doesn't — there's a real window where the system is in a partially-completed state, visible to other operations, until compensations finish running.

### Multi-tenancy data isolation strategies
**They ask:** "How do you isolate tenant data in a multi-tenant SaaS system, and what's the trade-off between the approaches?"

**Separate database per tenant** gives the strongest isolation (a bug or query mistake can't leak across tenants at the database level) and simplest per-tenant backup/compliance story, at the cost of operational overhead that grows linearly with tenant count — migrations, monitoring, and connection pooling all multiply. **Shared database, separate schema per tenant** is a middle ground — one database instance, less operational overhead, still decent isolation, but schema migrations now have to run across every tenant's schema. **Shared database and schema, tenant ID column on every table** scales operationally the best (one schema to migrate, one connection pool) but isolation is entirely an application-code discipline — every single query must filter by tenant ID, and one missed `WHERE tenant_id = ?` is a cross-tenant data leak.

**Say it:** "The isolation-vs-operational-overhead trade-off runs from separate databases per tenant — strongest isolation, most ops overhead — down to a shared schema with a tenant ID column, which scales best operationally but pushes isolation entirely onto disciplined query-writing, where one missed filter is a real data leak."
**Red flag:** Choosing the shared-schema, tenant-ID-column approach for a compliance-sensitive domain (health, finance) without row-level security or a query-layer guarantee enforcing the tenant filter. Relying purely on developer discipline to never forget a `WHERE tenant_id` clause is exactly the kind of gap that becomes a real incident.
