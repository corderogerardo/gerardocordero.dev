// Multiple-choice quiz — Node.js internals, microservices, performance, security, architecture.
import type { QuizQuestion } from "./quiz";

export const QUIZ2: QuizQuestion[] = [
  {
    id: "qz17",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "Inside an I/O callback, which fires first: setTimeout(fn, 0) or setImmediate(fn)?",
    options: [
      "setTimeout always",
      "setImmediate always",
      "It's random",
      "They fire simultaneously",
    ],
    answer: 1,
    explanationHtml:
      "<p>Inside an I/O callback the loop goes poll → check, so <b>setImmediate always wins</b>. At the top level (outside I/O) their order is non-deterministic — the classic trick question.</p>",
  },
  {
    id: "qz18",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "Which of these does NOT use the libuv thread pool?",
    options: [
      "fs.readFile",
      "crypto.pbkdf2",
      "An incoming HTTP/TCP connection",
      "zlib.gzip",
    ],
    answer: 2,
    explanationHtml:
      "<p>Network I/O (TCP/UDP/HTTP) is handled by the OS kernel (epoll/kqueue/IOCP), not the thread pool. <code>fs</code>, <code>crypto</code>, <code>zlib</code>, and <code>dns.lookup</code> do use the pool (default 4 threads).</p>",
  },
  {
    id: "qz19",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "Why prefer stream.pipeline() over readable.pipe(writable)?",
    options: [
      "pipeline is faster",
      "pipeline forwards errors and destroys all streams on failure; pipe leaks file descriptors",
      "pipe is deprecated",
      "pipeline supports object mode and pipe doesn't",
    ],
    answer: 1,
    explanationHtml:
      "<p><code>pipe()</code> does NOT forward errors or clean up downstream streams on failure (you can leak FDs). <code>pipeline()</code> propagates errors, destroys all streams, and gives one completion callback/promise.</p>",
  },
  {
    id: "qz20",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "You have a CPU-bound task that must run in-process without blocking requests. Use:",
    options: ["cluster", "child_process.exec", "worker_threads", "setImmediate"],
    answer: 2,
    explanationHtml:
      "<p><code>worker_threads</code> run CPU-bound JS off the main thread within the same process (shared memory via SharedArrayBuffer). <code>cluster</code> scales I/O across processes; <code>exec</code> shells out; <code>setImmediate</code> just defers, still on the main thread.</p>",
  },
  {
    id: "qz21",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "Which Promise combinator resolves with the first FULFILLED value (ignoring rejections unless all fail)?",
    options: ["Promise.all", "Promise.race", "Promise.any", "Promise.allSettled"],
    answer: 2,
    explanationHtml:
      "<p><code>Promise.any</code> resolves on first success; rejects only if all fail (<code>AggregateError</code>). <code>race</code> settles on the first to <i>settle</i> (including rejection) — a common mix-up.</p>",
  },
  {
    id: "qz22",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "What does process.nextTick risk if used recursively?",
    options: [
      "A memory leak only",
      "Starving the event loop — Promise and macrotask queues never run",
      "Nothing, it's safe",
      "A stack overflow immediately",
    ],
    answer: 1,
    explanationHtml:
      "<p>The nextTick queue drains completely before the loop continues. Recursively scheduling nextTick callbacks starves the Promise microtask queue and all macrotask phases — the loop never progresses.</p>",
  },
  {
    id: "qz23",
    category: "micro",
    categoryLabel: "Microservices",
    question: "Which decorator pairs with client.emit() for fire-and-forget events?",
    options: ["@MessagePattern", "@EventPattern", "@GrpcMethod", "@SubscribeMessage"],
    answer: 1,
    explanationHtml:
      "<p><code>@EventPattern</code> handles fire-and-forget events from <code>client.emit()</code> (hot Observable, no reply). <code>@MessagePattern</code> + <code>client.send()</code> is request-response (cold Observable).</p>",
  },
  {
    id: "qz24",
    category: "micro",
    categoryLabel: "Microservices",
    question: "Across microservices, how do you keep data consistent without distributed 2PC?",
    options: [
      "Lock all databases globally",
      "Saga pattern with compensating actions + transactional outbox + idempotent consumers",
      "Use a single shared database for everything",
      "Retry forever until consistent",
    ],
    answer: 1,
    explanationHtml:
      "<p>Sagas (local transactions + compensations), the transactional outbox (publish events atomically with the DB write), and idempotent consumers give reliable eventual consistency without fragile distributed transactions.</p>",
  },
  {
    id: "qz25",
    category: "graphql",
    categoryLabel: "GraphQL",
    question: "DataLoader fixes the N+1 problem primarily by:",
    options: [
      "Caching the whole response on a CDN",
      "Batching per-key loads within one tick into a single query, plus per-request memoization",
      "Switching to REST",
      "Running resolvers in parallel threads",
    ],
    answer: 1,
    explanationHtml:
      "<p>DataLoader coalesces <code>load(key)</code> calls in one event-loop tick into one <code>WHERE id IN (...)</code> and memoizes per request. The batch fn must return results in the same order/length as keys, and the loader must be per-request.",
  },
  {
    id: "qz26",
    category: "perf",
    categoryLabel: "Performance",
    question: "Rate limiting / caching / queues default to in-memory. What breaks across replicas?",
    options: [
      "Nothing, in-memory is fine",
      "Each instance has its own state, so limits/caches aren't shared or correct globally",
      "They crash on startup",
      "They automatically sync via the database",
    ],
    answer: 1,
    explanationHtml:
      "<p>In-memory state is per-instance. For correctness at scale use Redis: throttler Redis storage, cache-manager with KeyvRedis, BullMQ (Redis by design), and the socket.io Redis adapter.</p>",
  },
  {
    id: "qz27",
    category: "perf",
    categoryLabel: "Performance",
    question: "Which adapter typically gives ~2× throughput for JSON-heavy APIs?",
    options: ["Express", "Fastify", "Koa", "They're identical"],
    answer: 1,
    explanationHtml:
      "<p>The Fastify adapter uses schema-based serialization (fast-json-stringify) and radix-tree routing. Trade-off: Express-specific middleware/Multer don't apply directly; use Fastify equivalents.</p>",
  },
  {
    id: "qz28",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you correctly measure event-loop lag?",
    options: [
      "console.time around a request",
      "perf_hooks.monitorEventLoopDelay() histogram (or a setTimeout drift probe)",
      "Count the number of requests",
      "Read process.cpuUsage() only",
    ],
    answer: 1,
    explanationHtml:
      "<p><code>perf_hooks.monitorEventLoopDelay()</code> gives a high-resolution histogram of loop delay — the canonical metric. A simpler probe measures actual vs expected <code>setTimeout</code> delay.</p>",
  },
  {
    id: "qz29",
    category: "security",
    categoryLabel: "Security",
    question: "The Node.js permission model (--permission) is best described as:",
    options: [
      "A full sandbox that stops malicious code",
      "A seat belt limiting accidental overreach by trusted code — not protection against malicious code",
      "A replacement for authentication",
      "A way to run code as root safely",
    ],
    answer: 1,
    explanationHtml:
      "<p>Per the docs, it constrains <i>trusted</i> code from accidental overreach but does NOT defend against malicious code (Node trusts code it runs; symlinks/FDs can bypass). Real isolation = OS-level (containers, seccomp).</p>",
  },
  {
    id: "qz30",
    category: "security",
    categoryLabel: "Security",
    question: "An attacker sends `__proto__` in JSON that your deep-merge copies. This is:",
    options: ["SQL injection", "Prototype pollution", "ReDoS", "SSRF"],
    answer: 1,
    explanationHtml:
      "<p>Prototype pollution mutates <code>Object.prototype</code> via crafted keys. Defend with schema validation (whitelist), <code>Object.create(null)</code>/<code>Map</code> for untrusted dictionaries, and safe merge functions.</p>",
  },
  {
    id: "qz31",
    category: "arch",
    categoryLabel: "Architecture",
    question: "In a pool-model multi-tenant app, the cardinal sin to prevent is:",
    options: [
      "Using one database",
      "Cross-tenant data leakage (a missing tenant filter)",
      "Having a tenant_id column",
      "Using Redis for cache",
    ],
    answer: 1,
    explanationHtml:
      "<p>Shared tables mean a forgotten <code>tenant_id</code> filter leaks another tenant's data. Postgres RLS enforces the filter at the engine level; also scope cache keys by tenant.</p>",
  },
  {
    id: "qz32",
    category: "queues",
    categoryLabel: "Queues & Jobs",
    question: "Why must queue/job consumers be idempotent?",
    options: [
      "To run faster",
      "Because at-least-once delivery means a job can be delivered/processed more than once",
      "To support multiple queues",
      "Idempotency is optional and rarely needed",
    ],
    answer: 1,
    explanationHtml:
      "<p>If a worker crashes before ack, the job reappears (visibility timeout) and runs again. Idempotent consumers (dedupe key, upsert) make reprocessing safe. Exhausted retries should go to a DLQ with alerting.</p>",
  },
  {
    id: "qz33",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "After an uncaughtException, the recommended action is to:",
    options: [
      "Swallow it and keep serving",
      "Log, run cleanup, and exit — let a supervisor restart (the process is in an undefined state)",
      "Restart only the failed request",
      "Ignore it in production",
    ],
    answer: 1,
    explanationHtml:
      "<p>After an uncaught exception the process state is unknown — resuming risks corruption/leaks. Log, clean up, exit; a process manager/orchestrator restarts a fresh instance.</p>",
  },
  {
    id: "qz34",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's the strongest reason to extract a module into a separate microservice?",
    options: [
      "The codebase has too many files",
      "It needs independent scaling, deployment, fault isolation, or team ownership",
      "Microservices are always better",
      "To use more transports",
    ],
    answer: 1,
    explanationHtml:
      "<p>Extract for a concrete operational need — independent scaling/deploy/fault-isolation/ownership. Otherwise a well-bounded modular monolith is simpler (one deploy, in-process transactional calls). Premature microservices add distributed-systems cost for no gain.</p>",
  },
];

export const QUIZ2_FILTERS = [
  { value: "node", label: "Node.js Core" },
  { value: "micro", label: "Microservices" },
  { value: "graphql", label: "GraphQL" },
  { value: "perf", label: "Performance" },
  { value: "security", label: "Security" },
  { value: "arch", label: "Architecture" },
  { value: "queues", label: "Queues & Jobs" },
];
