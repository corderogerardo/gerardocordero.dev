// Architecture guide — backend system design mapped onto NestJS / Node.js.
export type ArchSection = { id: string; num: string; title: string; html: string };
export type DeepDive = { id: string; pill: string; title: string; html: string };

export const ARCH_INTRO =
  "A senior-level tour of backend system design, mapped onto NestJS and Node.js. This is the “how do you think about building a backend at scale” material — decisions before code, for the worst query, the worst network, and the worst traffic spike.";

export const ARCH_SECTIONS: ArchSection[] = [
  {
    id: "arch-1",
    num: "01",
    title: "01 · Thinking in systems — the CRDDS framework",
    html:
      "<p>System design is <b>decision-making before code</b>. A structured flow keeps you calm under pressure:</p>" +
      "<table><tr><th>Step</th><th>What you do</th><th>Time</th></tr>" +
      "<tr><td><b>C</b> — Clarify</td><td>Functional vs non-functional requirements, scale (RPS, DAU), read/write ratio, consistency needs. Most candidates rush this and design the wrong system.</td><td>~15%</td></tr>" +
      "<tr><td><b>R</b> — Rough HLD</td><td>Draw the high-level diagram: clients, gateway, services, datastores, queues. A city map, not a street map.</td><td>~20%</td></tr>" +
      "<tr><td><b>D</b> — Deep dive</td><td>Zoom into one component (the data model, the rate limiter, the queue) — interfaces, edge cases.</td><td>~35%</td></tr>" +
      "<tr><td><b>D</b> — Discuss trade-offs</td><td>Name alternatives and why you chose one. The senior signal.</td><td>~20%</td></tr>" +
      "<tr><td><b>S</b> — Summarize</td><td>Recap, call out risks, handle follow-ups.</td><td>~10%</td></tr></table>" +
      "<div class=\"callout\"><span class=\"lbl\">Senior tell</span> Say the trade-off out loud: “I'll use cache-aside with a short TTL — I'm trading a little staleness for a big latency win.”</div>",
  },
  {
    id: "arch-2",
    num: "02",
    title: "02 · Layered architecture in NestJS",
    html:
      "<p>Almost every Nest service shares the same skeleton — memorize it as your HLD template:</p>" +
      "<table><tr><th>Layer</th><th>Responsibility</th><th>Nest equivalent</th></tr>" +
      "<tr><td><b>Presentation</b></td><td>HTTP/GraphQL/WS edge: parse, validate, serialize.</td><td>Controllers, resolvers, gateways, DTOs, pipes</td></tr>" +
      "<tr><td><b>Application / Domain</b></td><td>Use-cases and business rules — the most testable layer.</td><td>Services, use-case classes, domain models</td></tr>" +
      "<tr><td><b>Data / Repository</b></td><td>Combines remote + local, caching, maps rows → domain.</td><td>Repository providers over TypeORM/Prisma/Mongoose</td></tr>" +
      "<tr><td><b>Integration</b></td><td>External APIs, message brokers, cache.</td><td>HTTP clients, ClientProxy, cache-manager</td></tr></table>" +
      "<p>For complex, long-lived domains, push to <b>hexagonal architecture</b>: the domain depends on <b>ports</b> (interfaces + DI tokens), and adapters bind concrete implementations — so infrastructure is swappable and the domain is pure. Don't pay that indirection cost on thin CRUD.</p>",
  },
  {
    id: "arch-3",
    num: "03",
    title: "03 · The integration layer — calling other services",
    html:
      "<p>A production client to another service needs more than <code>fetch</code>: <b>timeouts</b> (never wait forever), <b>retries</b> with exponential backoff + jitter (only for idempotent/transient failures — network, 5xx, not 4xx), a <b>circuit breaker</b> (stop hammering a downed dependency), and a <b>bulkhead</b> (cap concurrent calls so one slow dependency can't exhaust your pool).</p>" +
      "<p>Wrap calls in a result/Observable with <code>timeout()</code>, propagate a <b>correlation id</b> (<code>traceparent</code>) for tracing, and map foreign DTOs to your domain at the boundary (an anti-corruption layer) so their schema changes don't ripple into your code.</p>" +
      "<div class=\"callout\"><span class=\"lbl\">Name the pattern</span> Timeout + retry-with-backoff + circuit breaker + bulkhead = the resilience quartet.</div>",
  },
  {
    id: "arch-4",
    num: "04",
    title: "04 · Storage & caching",
    html:
      "<p>Pick the store for the access pattern: relational (Postgres) for transactional integrity + joins; document (Mongo) for flexible schemas; key-value (Redis) for hot/ephemeral data; wide-column (Cassandra/Dynamo) for huge write-heavy time-series. <b>Replication</b> scales reads + HA (mind replica lag); <b>sharding</b> scales writes (pick a good shard key; cross-shard joins hurt).</p>" +
      "<p><b>Caching</b> layers: in-memory (fast, per-instance, lost on restart) and shared Redis (survives restarts, consistent across replicas). Strategies: cache-aside (default), read/write-through, write-behind. Invalidate via TTL, delete-on-write, or versioned keys; guard <b>stampede</b> with a lock/single-flight. Name <b>stale-while-revalidate</b>.</p>",
  },
  {
    id: "arch-5",
    num: "05",
    title: "05 · Scaling Node.js",
    html:
      "<p>Node scales by staying <b>non-blocking</b> and <b>stateless</b>. Keep CPU work off the event loop (worker threads / queues). Scale <b>horizontally</b>: run one process per core (cluster) or, more commonly, N container replicas behind a load balancer. Externalize all state (sessions, cache, uploads) to Redis/DB/object storage so any replica can serve any request.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Distributed-state trap</span> Rate limiting, caching, scheduling, and websocket rooms default to per-instance memory. At scale they must use Redis (throttler storage, KeyvRedis, distributed locks, socket.io Redis adapter) or they're wrong across replicas.</div>" +
      "<div class=\"callout\"><span class=\"lbl\">Vertical vs horizontal</span> Vertical (bigger box) buys time; horizontal (more boxes) is the real answer — and only works if you're stateless.</div>",
  },
  {
    id: "arch-6",
    num: "06",
    title: "06 · Async & messaging",
    html:
      "<p>Decouple work with asynchrony. <b>Queues</b> (BullMQ/SQS/RabbitMQ) distribute work to competing consumers (consume-once); <b>streams/logs</b> (Kafka) are durable, replayable, ordered-per-partition, multi-consumer. Use queues for jobs (email, image processing); use streams for event sourcing and fan-out to many consumers.</p>" +
      "<p>Delivery is <b>at-least-once</b> (visibility timeout → redelivery on crash), so consumers must be <b>idempotent</b>. Retries use backoff + jitter → a <b>DLQ</b> with alerting. Back-pressure: autoscale workers on queue depth.</p>" +
      "<div class=\"callout\"><span class=\"lbl\">Decision guide</span> Two-way low-latency → gRPC/WebSocket. Work distribution → queue. Replayable event history / many consumers → Kafka. One-way push to browser → SSE.</div>",
  },
  {
    id: "arch-7",
    num: "07",
    title: "07 · Service boundaries — monolith to microservices",
    html:
      "<p>Start with a <b>modular monolith</b>: one module per bounded context, each owning its tables, cross-module calls through a small public API + adapter. One deploy, atomic refactors, in-process transactional calls — enforce boundaries in CI with <code>dependency-cruiser</code>.</p>" +
      "<p><b>Extract a microservice</b> only for a concrete need: independent scaling, deployment, fault isolation, or team ownership. If boundaries were clean, you swap the in-process public service for a transport client implementing the same interface. Cross-service consistency uses <b>sagas</b> (compensating actions) + the <b>transactional outbox</b>, not 2PC.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Anti-pattern</span> Premature microservices buy distributed-systems pain (network failures, eventual consistency, ops overhead) for no benefit. Earn them.</div>",
  },
  {
    id: "arch-8",
    num: "08",
    title: "08 · Resilience & failure design",
    html:
      "<p>Design for failure as the default. The toolkit: <b>timeouts</b> everywhere, <b>retries</b> (idempotent only, backoff + jitter), <b>circuit breakers</b>, <b>bulkheads</b>, <b>graceful degradation</b> (serve stale cache / a reduced response instead of an error), and <b>idempotency keys</b> so retried side effects run at-most-once.</p>" +
      "<p>Fail fast and visibly: validate at the edge, cap request size and concurrency, and propagate cancellation (<code>AbortSignal</code>). Decide fail-open vs fail-closed per feature (a downed rate-limiter Redis: fail-open for availability, fail-closed for abuse-sensitive endpoints).</p>",
  },
  {
    id: "arch-9",
    num: "09",
    title: "09 · Multi-tenancy",
    html:
      "<p>Choose an isolation model early (hard to reverse): <b>Silo</b> (DB per tenant — strongest isolation/compliance, priciest), <b>Pool</b> (shared tables + <code>tenant_id</code> — cheapest, noisy-neighbor risk), <b>Bridge</b> (schema per tenant). Tiers often mix (enterprise = silo, SMB = pool).</p>" +
      "<p>Resolve the tenant from subdomain/JWT claim, set it in request context (CLS), and enforce it everywhere — Postgres <b>RLS</b> makes a forgotten filter unable to leak rows. Scope cache keys by tenant; add per-tenant quotas/rate limits for noisy neighbors.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Cardinal sin</span> Cross-tenant data leakage — a missing filter, a mis-resolved tenant, or a cache key without the tenant. RLS + tenant-scoped keys are the guardrails.</div>",
  },
  {
    id: "arch-10",
    num: "10",
    title: "10 · Observability & SLOs",
    html:
      "<p>You can't operate what you can't see. Instrument four signals: <b>health</b> (liveness/readiness probes), <b>metrics</b> (RED — rate/errors/duration — plus Node internals: event-loop lag, heap, GC), <b>traces</b> (OpenTelemetry, propagated via <code>traceparent</code>), and <b>structured logs</b> with correlation ids.</p>" +
      "<p>Define <b>SLOs</b> (e.g. p99 latency &lt; 300ms, 99.9% availability), track an error budget, and alert on guardrails — not on raw CPU. Treat a deploy as “done” only when crash/error rates hold across the rollout.</p>",
  },
];

export const DEEPDIVES_INTRO =
  "Six classic backend system-design prompts, each as Concept → Example → Gotcha → Senior answer. These are the ones interviewers reach for — rehearse the trade-offs out loud.";

export const DEEP_DIVES: DeepDive[] = [
  {
    id: "dd-rate-limiter",
    pill: "System design",
    title: "Design a distributed rate limiter",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concept</span> Cap requests per client per window. Algorithms: token bucket (allows bursts, smooths to an average — the API default), leaky bucket (constant drain), fixed window (cheap, doubles at boundary), sliding window log (exact, memory-heavy), sliding window counter (best accuracy/memory).</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Example</span> Token bucket in Redis: store <code>{tokens, lastRefill}</code> per key; on each request refill by elapsed×rate (capped), allow if ≥1 then decrement. Return 429 + <code>Retry-After</code> + <code>X-RateLimit-*</code>.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Gotcha</span> Read-modify-write across replicas is a race — two requests both read 1 token left and both pass. Naive per-instance memory (Nest's default throttler) is wrong across replicas.</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Senior answer</span> Make refill→check→decrement <b>atomic</b> with a Redis <b>Lua script</b> (or INCR+EXPIRE). Run it at the edge/gateway for cheap global limits. Decide fail-open vs fail-closed if Redis is down; use Redis server time to avoid clock skew.</div>" +
      "</div>",
  },
  {
    id: "dd-url-shortener",
    pill: "System design",
    title: "Design a URL shortener",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concept</span> Map a short code → long URL with ~100:1 read:write. 7 base62 chars ≈ 3.5T codes. KV store, cache-heavy reads, async analytics.</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Example</span> Code generation: counter+base62 (no collisions, but sequential/guessable + counter bottleneck), hash+first-7 (needs collision retry), or a <b>Key Generation Service</b> pre-generating random unused keys offline.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Gotcha</span> 301 (permanent) is browser-cached and <b>loses click analytics</b>; sequential codes are enumerable; the redirect must not block on analytics.</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Senior answer</span> KGS for non-guessable codes; Redis cache-aside (~95% hit) + CDN for hot redirects; <b>302</b> when you need analytics; emit click events async to Kafka→warehouse so the redirect stays fast. DynamoDB/Cassandra at scale.</div>" +
      "</div>",
  },
  {
    id: "dd-notifications",
    pill: "System design",
    title: "Design a notification service",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concept</span> Ingest events → template → route by user preference → per-channel queues → channel workers (email/SMS/push) → status webhooks → metrics. Multi-channel fan-out.</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Example</span> One event fans out to many recipients/devices via a queue, partitioned by user for order + parallelism; versioned templates + i18n; preference center with quiet hours and digests.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Gotcha</span> At-least-once delivery means duplicates; SENT ≠ DELIVERED ≠ READ; a provider outage shouldn't drop everything; legal (unsubscribe/TCPA/GDPR).</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Senior answer</span> Idempotent consumers keyed on (event_id, recipient, channel); retries with backoff → DLQ; circuit breaker + channel fallback (push→SMS for critical); priority lanes so OTPs jump ahead of marketing. Exactly-once is impractical — design for at-least-once + dedup.</div>" +
      "</div>",
  },
  {
    id: "dd-chat",
    pill: "System design",
    title: "Design a chat backend",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concept</span> WebSocket gateways hold live connections (stateless nodes + a Redis registry mapping user→node). Messages stored in a wide-column store keyed by conversation_id + seq.</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Example</span> A server-side sequencer partitioned by conversation_id assigns a monotonic seq (don't trust client clocks); clients reorder/dedupe by (conversation_id, seq). Presence in Redis with TTL heartbeats.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Gotcha</span> Ordering across a partition, exactly-once over flaky mobile, fan-out to huge groups (write amplification), reconnect/resume, multi-device sync.</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Senior answer</span> At-least-once + dedup by stable message_id; <b>fan-out on write</b> for small groups, <b>on read / Kafka</b> for large (hybrid by size — the celebrity problem); resume from last seq on reconnect; socket.io Redis adapter to fan out across nodes.</div>" +
      "</div>",
  },
  {
    id: "dd-job-queue",
    pill: "System design",
    title: "Design a job/task queue",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concept</span> Producer → broker → competing consumers pull. A <b>visibility timeout</b> hides a job while a worker holds it; success deletes it, a crash makes it reappear (redelivery) — the at-least-once engine.</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Example</span> BullMQ (Redis) for delayed/repeatable/priority jobs; SQS (managed, FIFO for order+dedup); Kafka for a replayable log. Priorities via separate queues; delayed jobs via a sorted set.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Gotcha</span> Visibility timeout shorter than p99 duration → premature redelivery + double processing; standard queues don't guarantee order; a DLQ without alerting silently loses work.</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Senior answer</span> Idempotent consumers (idempotency key + dedup), visibility timeout &gt; p99 (or heartbeat-extend), retries with backoff → DLQ <b>with alerts</b>, autoscale workers on queue depth, FIFO/partitioning when order matters.</div>" +
      "</div>",
  },
  {
    id: "dd-file-upload",
    pill: "System design",
    title: "Design large file upload & streaming",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concept</span> Don't route big files through the app's memory. Stream them, and prefer direct-to-object-storage with the app issuing credentials.</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Example</span> Issue a <b>pre-signed S3 URL</b> so the client uploads straight to object storage; for downloads/transforms, <code>pipeline(readStream → transform → res)</code>; multipart upload for very large files.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Gotcha</span> Buffering a whole file blows up memory and blocks the loop; no backpressure leaks memory; unvalidated type/size is a DoS + security hole.</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Senior answer</span> Pre-signed URLs to offload bandwidth; stream with <code>pipeline</code> (auto backpressure + cleanup); validate size + magic-number type with <code>ParseFilePipe</code>; process derivatives (thumbnails, virus scan) async via a queue.</div>" +
      "</div>",
  },
];
