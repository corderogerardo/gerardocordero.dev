// Performance — lessons (flashcards, category "perf") and debugging sessions (prompts).
import type { Flashcard } from "./flashcards";
import type { Prompt } from "./prompts";

export const PERF_LESSONS: Flashcard[] = [
  {
    id: "pf1",
    category: "perf",
    categoryLabel: "Performance",
    question: "What is the #1 performance rule in Node, and why?",
    answerHtml:
      "<p><b>Don't block the event loop.</b> Your JS runs on one thread; a synchronous CPU-bound task (big <code>JSON.parse</code>, sync crypto, a tight loop, catastrophic regex) freezes <b>every</b> request while it runs. Offload to worker threads, the async thread pool (crypto/zlib), or a queue; chunk long work with <code>setImmediate</code>.</p>",
  },
  {
    id: "pf2",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you measure event-loop lag?",
    answerHtml:
      "<p>Use <code>perf_hooks.monitorEventLoopDelay()</code> — a high-resolution histogram of how late the loop is running — and export it as a metric. A simple probe schedules <code>setTimeout(fn, N)</code> and measures actual vs expected delay. Rising loop lag is the earliest sign of CPU blocking, before latency even spikes.</p>",
  },
  {
    id: "pf3",
    category: "perf",
    categoryLabel: "Performance",
    question: "When does the Fastify adapter actually help?",
    answerHtml:
      "<p>For high-throughput, JSON-heavy APIs, Fastify is ~2× Express via schema-based serialization (<code>fast-json-stringify</code>) and radix-tree routing. It helps when serialization/routing overhead is your bottleneck — not when you're I/O-bound on a slow DB (fix the query first).</p>",
  },
  {
    id: "pf4",
    category: "perf",
    categoryLabel: "Performance",
    question: "Why is connection pooling essential?",
    answerHtml:
      "<p>Opening a DB/HTTP connection per request is expensive (TCP + TLS handshake). A <b>pool</b> reuses a fixed set of warm connections, capping concurrency and amortizing setup. Size it to the DB's limits (too large overwhelms the DB; too small starves the app). Use keep-alive for outbound HTTP. In serverless, use a pooler (PgBouncer) since connections are scarce.</p>",
  },
  {
    id: "pf5",
    category: "perf",
    categoryLabel: "Performance",
    question: "Why avoid *Sync APIs on the request path?",
    answerHtml:
      "<p><code>fs.readFileSync</code>, <code>crypto.pbkdf2Sync</code>, etc. block the single thread until they complete — every concurrent request waits. Sync APIs are fine at <b>startup</b> (loading config once) but never inside a hot handler. Use the async variants so the loop keeps serving.</p>",
  },
  {
    id: "pf6",
    category: "perf",
    categoryLabel: "Performance",
    question: "How does caching improve performance, and where do you put it?",
    answerHtml:
      "<p>Caching trades a little staleness for big latency/throughput wins and DB load reduction. Layer it: CDN/edge for static + anonymous reads, Redis for shared app cache (cache-aside), in-memory for tiny hot data. Always pair with an invalidation strategy (TTL, delete-on-write) and stampede protection. Across replicas, cache must be in Redis, not per-instance memory.</p>",
  },
  {
    id: "pf7",
    category: "perf",
    categoryLabel: "Performance",
    question: "Where should response compression happen?",
    answerHtml:
      "<p>Compression (gzip/brotli) saves bandwidth but costs CPU. At scale, offload it to a <b>reverse proxy</b> (Nginx) or CDN rather than burning your app's single thread on it. If you must do it in-app, prefer gzip over slow brotli levels and skip already-compressed payloads.</p>",
  },
  {
    id: "pf8",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you handle large result sets without blowing memory?",
    answerHtml:
      "<p><b>Paginate</b> (cursor-based for stability) so you never load everything, and <b>stream</b> large responses/exports (DB cursor → transform → response via <code>pipeline</code>) instead of building a giant array/string in memory. Buffering a huge result both spikes memory and blocks the loop during serialization.</p>",
  },
  {
    id: "pf9",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you profile a Node CPU bottleneck?",
    answerHtml:
      "<p>Capture a CPU profile (<code>node --cpu-prof</code>, <code>clinic flame</code>, or <code>0x</code>) and read the <b>flamegraph</b> — the widest frames are the hot path. <code>clinic doctor</code> classifies the issue (CPU vs I/O vs GC). For a quick look, the Chrome DevTools profiler loads <code>.cpuprofile</code> files directly.</p>",
  },
  {
    id: "pf10",
    category: "perf",
    categoryLabel: "Performance",
    question: "What does --max-old-space-size do, and how does it relate to containers?",
    answerHtml:
      "<p>It caps V8's old-generation heap. In a container, set it <b>below</b> the container memory limit (e.g. 75%) so V8 GCs before the OOM killer strikes — otherwise the kernel kills the process with no graceful handling. Watch GC with <code>--trace-gc</code>; long/frequent old-space GC signals pressure or a leak.</p>",
  },
  {
    id: "pf11",
    category: "perf",
    categoryLabel: "Performance",
    question: "Why can JSON.parse/stringify be a performance trap?",
    answerHtml:
      "<p>They're <b>synchronous and CPU-bound</b> — parsing/serializing a multi-MB payload blocks the loop for the whole duration. Mitigate: limit request body size, stream large JSON (streaming parsers), use Fastify's schema serializer for responses, and avoid serializing huge objects in hot paths.</p>",
  },
  {
    id: "pf12",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you reduce cold starts in serverless Nest?",
    answerHtml:
      "<p>Cache the bootstrapped Nest app across warm invocations (don't rebuild the DI graph per request), trim dependencies and lazy-load heavy modules, prefer the lighter Fastify adapter, and keep the bundle small. Use a connection pooler since each cold instance otherwise opens new DB connections.</p>",
  },
];

export const PERF_SESSIONS: Prompt[] = [
  {
    id: "ps-latency",
    kind: "design",
    title: "Debug: an endpoint's latency just spiked",
    level: "senior",
    tags: ["performance", "debugging"],
    promptHtml:
      "<p>p99 latency on one endpoint jumped from 80ms to 2s. You have logs, metrics, and traces. Walk through how you find and fix the cause.</p>",
    reveal: [
      { label: "Approach", html: "<p>Reproduce/measure first; localize to CPU vs I/O vs GC vs downstream before changing anything.</p>" },
      { label: "Solution", html: "<ul><li><b>Check event-loop lag</b> — if it spiked, something is blocking the loop (sync work, big JSON, regex). Capture a CPU flamegraph to find the hot frame.</li><li><b>Read the trace</b> — if a DB span dominates, it's a slow/N+1 query or missing index; if a downstream span dominates, add a timeout/circuit breaker.</li><li><b>Check GC</b> — frequent old-space GC ⇒ memory pressure/leak.</li><li><b>Correlate logs</b> by request id for the slow requests.</li><li><b>Fix the root cause</b> (index, batch the query, offload CPU, cache), then add an alert on loop lag / p99 so it can't silently regress.</li></ul>" },
    ],
  },
  {
    id: "ps-leak",
    kind: "coding",
    title: "Debug: memory grows until the pod is OOM-killed",
    level: "senior",
    tags: ["performance", "memory"],
    promptHtml:
      "<p>RSS climbs steadily over hours until k8s OOM-kills the pod. How do you find the leak?</p>",
    reveal: [
      { label: "Approach", html: "<p>Confirm it's a real leak (growing retained heap, not just cache warming), then diff heap snapshots to find the retained objects and their retainer path.</p>" },
      { label: "Solution", html: "<ul><li>Watch <code>process.memoryUsage()</code> + GC; if old-space keeps growing after GC, it's a leak.</li><li>Take <b>two heap snapshots</b> under load (DevTools / <code>v8.getHeapSnapshot()</code>), compare — the constructor whose count/retained size grows is the culprit; follow the <b>retainer path</b>.</li><li>Usual suspects: listeners added without removal, timers never cleared, an unbounded Map/array cache, closures capturing big objects, module-level globals.</li><li>Fix (bound the cache, remove listeners on destroy, clear timers), then add a memory alert.</li></ul>" },
    ],
  },
  {
    id: "ps-nplusone",
    kind: "coding",
    title: "Optimize: an endpoint runs hundreds of queries",
    level: "senior",
    tags: ["performance", "database"],
    promptHtml:
      "<p>A list endpoint that returns 100 orders fires ~400 queries. Diagnose and fix it.</p>",
    reveal: [
      { label: "Approach", html: "<p>It's an N+1: a relation is lazily loaded per row. Confirm by logging the query count, then batch or join.</p>" },
      { label: "Solution", html: "<ul><li><b>Eager join</b> the relations you need: TypeORM <code>relations: ['customer','items']</code> or a query-builder <code>leftJoinAndSelect</code> — one query instead of N.</li><li>For GraphQL, use a <b>per-request DataLoader</b> to batch <code>load(id)</code> into one <code>WHERE id IN (...)</code>.</li><li>Add the missing index for the join/filter columns.</li><li>Verify the query count dropped (1–3 queries) and add a test asserting it, so a future lazy relation can't silently reintroduce N+1.</li></ul>" },
    ],
  },
  {
    id: "ps-cpu",
    kind: "coding",
    title: "Make a CPU-bound endpoint non-blocking",
    level: "senior",
    tags: ["performance", "worker_threads"],
    promptHtml:
      "<p>An endpoint generates a PDF / resizes an image synchronously and tanks throughput under load. Make it non-blocking.</p>",
    reveal: [
      { label: "Approach", html: "<p>Move the CPU work off the main thread. For request-time results, use a worker-thread pool; for fire-and-forget, push to a queue and return a job id.</p>" },
      { label: "Solution", html: "<ul><li><b>Worker-thread pool</b> (e.g. <code>piscina</code>): the handler posts the task to a worker and awaits the result — the event loop stays free for other requests.</li><li><b>Or a queue</b> (BullMQ): enqueue the job, return <code>202 + jobId</code>, deliver the result via polling/webhook/websocket. Best when the work is slow and the client can wait async.</li><li>Cap concurrency to CPU cores; add backpressure (reject/queue if saturated).</li><li>Verify event-loop lag stays low under load.</li></ul>" },
    ],
  },
  {
    id: "ps-startup",
    kind: "design",
    title: "Profile and fix slow startup / cold start",
    level: "senior",
    tags: ["performance", "startup"],
    promptHtml:
      "<p>The service takes 8s to become ready, hurting deploys and serverless cold starts. How do you cut it?</p>",
    reveal: [
      { label: "Approach", html: "<p>Measure where boot time goes (module load vs connections vs warmup), then defer or parallelize the slow parts.</p>" },
      { label: "Solution", html: "<ul><li>Profile startup (<code>--cpu-prof</code> over the boot) — often heavy synchronous module loading or eager work in <code>onModuleInit</code>.</li><li><b>Lazy-load</b> heavy/optional modules; trim dependencies; avoid sync I/O at boot.</li><li>Parallelize independent connections (DB, Redis) instead of awaiting them serially.</li><li>For serverless, cache the bootstrapped app across warm invocations and use a connection pooler.</li><li>Separate <b>liveness</b> (cheap) from <b>readiness</b> (checks deps) so a slow dep doesn't restart-loop the pod.</li></ul>" },
    ],
  },
];
