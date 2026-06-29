// Microservices, queues, Node.js internals, security, deploy/ops, architecture,
// beyond, and behavioral flashcards.
import type { Flashcard } from "./flashcards";

export const FLASHCARDS3: Flashcard[] = [
  // ---------------- MICROSERVICES ----------------
  {
    id: "m1",
    category: "micro",
    categoryLabel: "Microservices",
    question: "What is a Nest microservice, and which transports are supported?",
    answerHtml:
      "<p>A Nest microservice is an app that uses a <b>non-HTTP transport</b>; all the building blocks (DI, pipes, guards, filters) apply identically. Bootstrap with <code>NestFactory.createMicroservice(AppModule, { transport, options })</code>.</p><p>Transports: <b>TCP</b> (default), <b>Redis</b>, <b>MQTT</b>, <b>NATS</b>, <b>RabbitMQ (RMQ)</b>, <b>Kafka</b>, and <b>gRPC</b> (plus custom).</p>",
  },
  {
    id: "m2",
    category: "micro",
    categoryLabel: "Microservices",
    question: "@MessagePattern vs @EventPattern (send vs emit)?",
    answerHtml:
      "<ul><li><b><code>@MessagePattern</code></b> + <code>client.send()</code> — <b>request-response</b>; returns a <b>cold</b> Observable (nothing happens until you subscribe). Use for queries/RPC.</li><li><b><code>@EventPattern</code></b> + <code>client.emit()</code> — <b>fire-and-forget</b>; returns a <b>hot</b> Observable (dispatched immediately); multiple handlers can react. Use for domain events.</li></ul><div class=\"callout warn\"><span class=\"lbl\">Gotchas</span> <code>send()</code> does nothing until subscribed; patterns must live in controllers; throw <code>RpcException</code> (not <code>HttpException</code>) and RPC filters must return an Observable.</div>",
  },
  {
    id: "m3",
    category: "micro",
    categoryLabel: "Microservices",
    question: "When would you pick gRPC, Kafka, or RabbitMQ?",
    answerHtml:
      "<table><tr><th>Transport</th><th>Best for</th></tr><tr><td><b>gRPC</b></td><td>Low-latency, strongly-typed RPC between services; streaming; polyglot via <code>.proto</code> contracts.</td></tr><tr><td><b>Kafka</b></td><td>Durable, partitioned, <b>replayable</b> event streaming; high-throughput pub/sub; event sourcing.</td></tr><tr><td><b>RabbitMQ</b></td><td>Reliable work queues with acks, routing, and per-message delivery guarantees.</td></tr></table>",
  },
  {
    id: "m4",
    category: "micro",
    categoryLabel: "Microservices",
    question: "What is a hybrid application and the API Gateway pattern?",
    answerHtml:
      "<p>A <b>hybrid app</b> serves HTTP <i>and</i> listens on microservice transports: <code>app.connectMicroservice(opts)</code> → <code>app.startAllMicroservices()</code> → <code>app.listen(3000)</code>.</p><p>The <b>API Gateway</b> is the single HTTP-facing app that injects <code>ClientProxy</code> and uses <code>send()</code>/<code>emit()</code> to reach backend services. It centralizes auth, routing, rate limiting, and response aggregation so backend services stay domain-focused and aren't internet-exposed.</p><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> Global pipes/guards/filters aren't inherited by the microservice unless you pass <code>{ inheritAppConfig: true }</code>.</div>",
  },
  {
    id: "m5",
    category: "micro",
    categoryLabel: "Microservices",
    question: "How do you keep data consistent across microservices (no 2PC)?",
    answerHtml:
      "<p>Avoid distributed two-phase commit. Use the <b>Saga</b> pattern (a sequence of local transactions with <b>compensating</b> actions on failure — orchestrated or choreographed) and the <b>Transactional Outbox</b> (write the domain change and an outbox event in the <i>same</i> DB transaction, then a relay publishes the event to Kafka/RMQ). Combine with <b>idempotent consumers</b> and correlation-ID tracing for at-least-once delivery without duplicates causing harm.</p>",
  },
  {
    id: "m6",
    category: "micro",
    categoryLabel: "Microservices",
    question: "Modular monolith vs microservices — how do you decide?",
    answerHtml:
      "<p>Start with a <b>modular monolith</b>: clear module boundaries, each owning its tables, cross-module calls through a small public API. One deploy = simple ops, atomic refactors, in-process (transactional) calls.</p><p><b>Extract a microservice</b> only when a module needs <b>independent scaling, deployment, fault isolation, or team ownership</b>. If you drew boundaries well, you swap the in-process public service for a transport client implementing the same interface. Premature microservices buy distributed-systems pain for no benefit.</p>",
  },
  {
    id: "m7",
    category: "micro",
    categoryLabel: "Microservices",
    question: "What is gRPC's contract style in Nest, and a casing gotcha?",
    answerHtml:
      "<p>You define services/messages in a <code>.proto</code> file; the server uses <code>@GrpcMethod()</code> and the client gets a typed service via <code>ClientGrpc.getService('Svc')</code> (in <code>onModuleInit</code>). Methods return Observables; streaming uses <code>@GrpcStreamMethod()</code>.</p><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> proto <code>FindOne</code> maps to client <code>findOne()</code>, and the loader drops <code>snake_case</code> fields unless you set <code>keepCase: true</code>. Add <code>*.proto</code> to <code>nest-cli</code> assets so they're copied to <code>dist</code>.</div>",
  },

  // ---------------- QUEUES & JOBS ----------------
  {
    id: "q1",
    category: "queues",
    categoryLabel: "Queues & Jobs",
    question: "Why use a queue (BullMQ), and how is a consumer written?",
    answerHtml:
      "<p>Queues offload heavy/slow work off the request path, smooth traffic spikes, and add retries, delays, priorities, and durable persistence. <b>BullMQ</b> (<code>@nestjs/bullmq</code>, Redis-backed) is the current recommendation over legacy Bull.</p><p>Producer: <code>@InjectQueue('audio') q</code> → <code>q.add('transcode', data, { attempts: 3, backoff })</code>. Consumer:</p><div class=\"code\">@Processor('audio')\nexport class AudioProcessor extends WorkerHost {\n  async process(job: Job) { switch (job.name) { /* ... */ } }\n}</div><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> In BullMQ <code>@Process('name')</code> does <b>not</b> work — route by <code>job.name</code> inside <code>process()</code>. Make processors idempotent (jobs can reprocess on restart).</div>",
  },
  {
    id: "q2",
    category: "queues",
    categoryLabel: "Queues & Jobs",
    question: "What's the gotcha with @nestjs/schedule cron in a multi-replica deploy?",
    answerHtml:
      "<p><code>@Cron()</code>/<code>@Interval()</code>/<code>@Timeout()</code> run <b>in-process and per-instance</b>. With N replicas, <b>every</b> replica fires the cron — duplicate work, double emails.</p><div class=\"callout tip\"><span class=\"lbl\">Fix</span> Use a <b>distributed lock</b> (Redis <code>SETNX</code>/Redlock) so only one instance runs the job, or enqueue a single job to a queue and let one worker process it.</div>",
  },
  {
    id: "q3",
    category: "queues",
    categoryLabel: "Queues & Jobs",
    question: "What is @nestjs/event-emitter for, and its limits?",
    answerHtml:
      "<p>In-process pub/sub for <b>decoupling</b> within one app: <code>eventEmitter.emit('order.created', payload)</code> and handle with <code>@OnEvent('order.created')</code>. Great for side effects (send email, update read model) without coupling the emitter to the listener.</p><div class=\"callout warn\"><span class=\"lbl\">Limits</span> Synchronous and <b>non-durable</b> — if the process dies, the event is lost. Listeners can't be request-scoped. For cross-service or reliable delivery, use a queue/broker, not the emitter.</div>",
  },
  {
    id: "q4",
    category: "queues",
    categoryLabel: "Queues & Jobs",
    question: "What is the visibility timeout / at-least-once delivery, and why must consumers be idempotent?",
    answerHtml:
      "<p>A worker picks a job; the broker <b>hides</b> it for a timeout. If the worker crashes before ack, the job <b>reappears</b> and runs again — so delivery is <b>at-least-once</b>, meaning a job can run twice.</p><div class=\"callout tip\"><span class=\"lbl\">Idempotency</span> Make the consumer safe to run twice (dedupe on an idempotency key, upsert instead of insert). Set the visibility timeout above the job's p99 duration (or heartbeat-extend) to avoid premature redelivery, and route exhausted retries to a <b>DLQ</b> with alerting.</div>",
  },
  {
    id: "q5",
    category: "queues",
    categoryLabel: "Queues & Jobs",
    question: "Why offload CPU-bound work to a queue or worker thread?",
    answerHtml:
      "<p>Node runs your JS on a <b>single thread</b>. A CPU-bound task (image processing, big PDF, heavy crypto) in a request handler <b>blocks the event loop</b> — every other request stalls. Push it to a <b>queue</b> (processed by separate worker processes) or a <b>worker_thread</b> so the main loop stays responsive. This is the most common Node performance lesson.</p>",
  },

  // ---------------- NODE.JS CORE ----------------
  {
    id: "n1",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "Explain the Node.js event loop phases.",
    answerHtml:
      "<p>One libuv loop iteration runs phases in order: <b>timers</b> (<code>setTimeout</code>/<code>setInterval</code>) → <b>pending callbacks</b> → idle/prepare (internal) → <b>poll</b> (retrieve &amp; run I/O callbacks; may block here waiting for I/O) → <b>check</b> (<code>setImmediate</code>) → <b>close callbacks</b>.</p><p>Between every callback, two <b>microtask</b> queues drain: <code>process.nextTick</code> first, then Promise callbacks. So microtasks run far more often than once per loop.</p>",
  },
  {
    id: "n2",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "process.nextTick vs setImmediate vs setTimeout(fn, 0)?",
    answerHtml:
      "<ul><li><b><code>process.nextTick</code></b> — runs <i>before</i> the loop continues (after the current op, before even Promise microtasks); highest priority. Recursive nextTick can <b>starve</b> the loop.</li><li><b><code>setImmediate</code></b> — runs in the <b>check</b> phase of the next iteration.</li><li><b><code>setTimeout(fn, 0)</code></b> — runs in the timers phase, subject to a ~1ms minimum.</li></ul><div class=\"callout warn\"><span class=\"lbl\">Trick question</span> Inside an I/O callback, <code>setImmediate</code> <b>always</b> beats <code>setTimeout(0)</code> (poll → check). At the top level, their order is <b>non-deterministic</b>.</div>",
  },
  {
    id: "n3",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "Is Node single-threaded? What runs on the libuv thread pool?",
    answerHtml:
      "<p>Your <b>JS executes on one thread</b>, but Node isn't single-threaded overall: libuv has a <b>thread pool</b> (default 4, <code>UV_THREADPOOL_SIZE</code>) and the OS handles network I/O asynchronously.</p><p><b>Thread pool:</b> <code>fs</code> (file ops), <code>dns.lookup</code>, <code>crypto</code> (pbkdf2/scrypt/randomBytes), <code>zlib</code>. <b>Not the pool (kernel async):</b> TCP/UDP/HTTP network I/O — that's epoll/kqueue/IOCP.</p><div class=\"callout warn\"><span class=\"lbl\">Misconception</span> “All async I/O uses the thread pool” is false — heavy <code>crypto</code>/<code>fs</code> under load can bottleneck on 4 threads, but a high-connection HTTP server won't.</div>",
  },
  {
    id: "n4",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "What blocks the event loop, and why is it fatal?",
    answerHtml:
      "<p>Synchronous CPU-bound work or sync APIs — <code>fs.readFileSync</code>, <code>JSON.parse</code> of a huge payload, sync crypto, tight loops, catastrophic regex. While blocked, <b>no other callback, timer, or incoming request is processed</b>: latency spikes for every connected client and health checks can fail.</p><p>Fixes: async APIs, <code>worker_threads</code>, the thread pool (async crypto/zlib), chunking work, or offloading to a queue. Measure loop lag with <code>perf_hooks.monitorEventLoopDelay()</code>.</p>",
  },
  {
    id: "n5",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "Streams: the four types and backpressure.",
    answerHtml:
      "<p>Types: <b>Readable</b> (source), <b>Writable</b> (sink), <b>Duplex</b> (both, e.g. TCP socket), <b>Transform</b> (Duplex where output derives from input, e.g. gzip).</p><p><b>Backpressure</b>: if a fast Readable outpaces a slow Writable, the buffer grows unbounded → memory blowup. <code>write()</code> returning <code>false</code> + the <code>'drain'</code> event is the manual protocol.</p><div class=\"callout warn\"><span class=\"lbl\">pipeline &gt; pipe</span> Always prefer <code>stream.pipeline()</code> over <code>.pipe()</code> — <code>pipe</code> doesn't forward errors or clean up on failure (FD leaks); <code>pipeline</code> propagates errors and destroys all streams.</div>",
  },
  {
    id: "n6",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "worker_threads vs cluster vs child_process?",
    answerHtml:
      "<ul><li><b><code>worker_threads</code></b> — real threads <i>inside one process</i>, each its own V8 isolate; share memory via <code>SharedArrayBuffer</code>. For <b>CPU-bound JS</b> (parsing, compute, image/crypto).</li><li><b><code>cluster</code></b> — forks <i>multiple processes</i> sharing a listening port; scales a stateless HTTP server across cores with fault isolation.</li><li><b><code>child_process</code></b> — runs external programs: <code>spawn</code> (streams), <code>exec</code> (buffers, shell — injection risk), <code>fork</code> (a Node child with an IPC channel).</li></ul><div class=\"callout warn\"><span class=\"lbl\">Rule</span> Scale I/O → cluster/replicas; offload CPU → worker threads; shell out → child_process.</div>",
  },
  {
    id: "n7",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "CommonJS vs ESM, and the interop story?",
    answerHtml:
      "<p><b>CJS</b> (<code>require</code>/<code>module.exports</code>): synchronous, runtime resolution, free <code>__dirname</code>. <b>ESM</b> (<code>import</code>/<code>export</code>): asynchronous, statically analyzable, top-level <code>await</code>, no <code>__dirname</code> (use <code>import.meta.dirname</code>). Opt in via <code>\"type\": \"module\"</code> or <code>.mjs</code>.</p><p>Interop: ESM can import CJS; CJS importing ESM was dynamic-<code>import()</code>-only until <b>synchronous <code>require(esm)</code> was stabilized in Node 24</b> (for ESM without top-level await). The <code>\"exports\"</code> field defines public entry points and encapsulates internals.</p>",
  },
  {
    id: "n8",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "Promise.all vs allSettled vs race vs any?",
    answerHtml:
      "<ul><li><b><code>all</code></b> — resolves with all values; <b>rejects fast</b> on the first rejection. Use when all must succeed.</li><li><b><code>allSettled</code></b> — never rejects; returns each result's status. Use to collect partials from a fan-out.</li><li><b><code>race</code></b> — settles as soon as the first promise <b>settles</b> (resolve <i>or</i> reject).</li><li><b><code>any</code></b> — resolves with the first <b>fulfilled</b> value; rejects only if all fail (<code>AggregateError</code>).</li></ul><div class=\"callout warn\"><span class=\"lbl\">Trap</span> <code>race</code> takes the first to <i>settle</i> (including a rejection) — “first success wins” is <code>any</code>.</div>",
  },
  {
    id: "n9",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "Common async pitfalls in Node?",
    answerHtml:
      "<ul><li><b>Floating promises</b> — calling an async fn without <code>await</code>/<code>.catch</code>; errors vanish.</li><li><b><code>forEach</code> with async</b> — doesn't await; callbacks run concurrently and the loop returns immediately. Use <code>for...of</code> + <code>await</code> for sequential, or <code>Promise.all(map(...))</code> for bounded-concurrent.</li><li><b>Unbounded <code>Promise.all</code></b> over thousands of items — exhausts sockets/memory; use a concurrency limiter (<code>p-limit</code>).</li><li><b>Unhandled rejection</b> — terminates the process by default since Node 15.</li></ul>",
  },
  {
    id: "n10",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "AbortController / AbortSignal — what's it for?",
    answerHtml:
      "<p>The standard cancellation mechanism: <code>const ac = new AbortController(); fetch(url, { signal: ac.signal }); ac.abort();</code>. Supported by <code>fetch</code>, <code>fs</code>, <code>timers/promises</code>, streams, and <code>events.on</code>. <code>AbortSignal.timeout(ms)</code> auto-aborts; <code>AbortSignal.any([...])</code> combines signals. Aborting yields an <code>AbortError</code>. It's how you implement request timeouts and tear down sibling work when one task fails.</p>",
  },
  {
    id: "n11",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "Operational vs programmer errors, and handling uncaughtException?",
    answerHtml:
      "<p><b>Operational</b> errors are expected runtime problems in correct code (network timeout, file not found, bad input) — handle them gracefully (retry, 4xx/5xx). <b>Programmer</b> errors are bugs (undefined is not a function) — don't try to recover; let it crash and fix the code.</p><p>On <code>uncaughtException</code>/<code>unhandledRejection</code>: <b>log, run cleanup, then exit</b> — the process is in an undefined state; a supervisor restarts it. Never resume normal operation. <code>domain</code> is deprecated; use <code>AsyncLocalStorage</code> for context.</p>",
  },
  {
    id: "n12",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "What Node version should a new backend target in 2026, and why?",
    answerHtml:
      "<p>Target the <b>Active LTS</b>. As of mid-2026 that's <b>Node.js 24 (\"Krypton\")</b>; Node 22 is Maintenance LTS, Node 26 is Current (don't run odd/Current lines in prod). Rule from the docs: production should use Active or Maintenance LTS only.</p><div class=\"callout\"><span class=\"lbl\">Heads-up</span> From Node 27 the release model becomes <b>annual</b> and every major goes LTS — the even/odd distinction ends.</div>",
  },
  {
    id: "n13",
    category: "node",
    categoryLabel: "Node.js Core",
    question: "What newer built-in Node APIs reduce dependencies?",
    answerHtml:
      "<ul><li><b><code>node:test</code></b> + <code>node:assert</code> — built-in test runner (stable since v20).</li><li><b>Global <code>fetch</code></b> (undici) — no axios needed for basic HTTP.</li><li><b><code>--env-file</code></b> — load <code>.env</code> natively (replaces dotenv for basic use).</li><li><b><code>--watch</code></b> — restart on change (replaces nodemon).</li><li><b><code>AsyncLocalStorage</code></b>, <code>structuredClone</code>, <code>util.parseArgs</code>, and the <b>permission model</b> (<code>--permission</code>, now stable).</li><li><b><code>node:sqlite</code></b> — embedded SQLite (release candidate).</li></ul>",
  },

  // ---------------- SECURITY ----------------
  {
    id: "s1",
    category: "security",
    categoryLabel: "Security",
    question: "What's the biggest real-world Node security risk?",
    answerHtml:
      "<p><b>Supply chain</b> — malicious or compromised npm dependencies (typosquatting, malicious post-install scripts, compromised transitive deps). Defend with a committed <b>lockfile</b> + <code>npm ci</code>, <code>npm audit</code>/Dependabot/Snyk, minimizing dependencies, provenance/signed packages, and <code>--ignore-scripts</code> where feasible. App-level risks follow: injection, prototype pollution, ReDoS.</p>",
  },
  {
    id: "s2",
    category: "security",
    categoryLabel: "Security",
    question: "What is prototype pollution and how do you prevent it?",
    answerHtml:
      "<p>An attacker sends keys like <code>__proto__</code> or <code>constructor.prototype</code> in JSON that a naive deep-merge copies onto <code>Object.prototype</code>, tampering with every object (privilege escalation, DoS, sometimes RCE).</p><p>Prevent: validate input against a schema (class-validator <code>whitelist</code> strips unknown keys), use <code>Map</code> or <code>Object.create(null)</code> for untrusted dictionaries, avoid unsafe recursive merges, and keep libraries patched.</p>",
  },
  {
    id: "s3",
    category: "security",
    categoryLabel: "Security",
    question: "Is the Node permission model a sandbox?",
    answerHtml:
      "<p><b>No.</b> <code>--permission</code> (with <code>--allow-fs-read</code>, <code>--allow-net</code>, etc.) is a <b>“seat belt”</b> that limits accidental overreach by <i>trusted</i> code. Per the docs it does <b>not</b> defend against malicious code — Node trusts code it runs, symlinks can escape allowed paths, and existing file descriptors bypass it. For real isolation use OS-level controls: separate users, containers, seccomp/AppArmor.</p>",
  },
  {
    id: "s4",
    category: "security",
    categoryLabel: "Security",
    question: "Name five practical API hardening steps.",
    answerHtml:
      "<ol><li><b>Validate all input</b> (class-validator + <code>whitelist</code>) and <b>limit request body size</b> (single-thread DoS).</li><li><b>Rate-limit</b> (throttler/edge) and throttle auth attempts.</li><li><b>Helmet</b> for secure headers; strict CORS.</li><li><b>Hide error internals</b> from clients (no stack traces/secrets in responses).</li><li>Run as <b>non-root</b>, keep <code>NODE_ENV=production</code>, and pull secrets from a manager — never the repo or image.</li></ol>",
  },
  {
    id: "s5",
    category: "security",
    categoryLabel: "Security",
    question: "What is ReDoS and how do you avoid it?",
    answerHtml:
      "<p><b>ReDoS</b> = a crafted input triggers catastrophic regex backtracking, pinning the CPU and blocking the event loop for every client. Avoid ambiguous patterns (nested quantifiers like <code>(a+)+</code>), prefer linear-time regex engines or simple parsing, cap input length before matching, and lint with <code>eslint-plugin-security</code> / <code>safe-regex</code>.</p>",
  },
  {
    id: "s6",
    category: "security",
    categoryLabel: "Security",
    question: "How should secrets be handled across environments?",
    answerHtml:
      "<p>Never commit secrets or bake them into images/build args. Local dev: <code>.env</code> (gitignored + dockerignored) or <code>--env-file</code>. Prod: a secret manager — k8s Secrets, AWS Secrets Manager/SSM, GCP Secret Manager, or Vault — injected as env at runtime. Don't log secrets (redact), rotate regularly, and scope each service to only the secrets it needs.</p>",
  },

  // ---------------- DEPLOY & OPS ----------------
  {
    id: "dep1",
    category: "deploy",
    categoryLabel: "Deploy & Ops",
    question: "How do you write a graceful shutdown in Nest?",
    answerHtml:
      "<p>Call <code>app.enableShutdownHooks()</code> (off by default), then implement shutdown hooks. On SIGTERM: <b>(1) fail readiness</b> so the orchestrator stops routing, <b>(2) stop accepting</b> new connections, <b>(3) finish in-flight</b> requests within a timeout, <b>(4) close</b> DB pools/Redis/brokers and flush logs, then exit. Nest awaits promises returned by the hooks.</p><div class=\"callout warn\"><span class=\"lbl\">Gotchas</span> Hooks don't fire for request-scoped providers; in k8s, endpoint removal and SIGTERM happen concurrently, so a brief <code>preStop</code> sleep avoids dropping in-flight requests; set the grace period above worst-case drain.</div>",
  },
  {
    id: "dep2",
    category: "deploy",
    categoryLabel: "Deploy & Ops",
    question: "What goes into a production Dockerfile for a Node/Nest app?",
    answerHtml:
      "<p><b>Multi-stage build</b>: build stage installs all deps (<code>npm ci</code>), compiles, then prunes dev deps; runtime stage copies only <code>node_modules</code> + <code>dist</code>. Plus: a small base (<code>-slim</code>/distroless), <code>NODE_ENV=production</code>, run as the non-root <code>node</code> user, exec-form <code>CMD [\"node\",\"dist/main.js\"]</code> (not <code>npm start</code>), <code>--init</code> or <code>tini</code> for signal handling, a <code>.dockerignore</code>, and a V8 memory limit (<code>--max-old-space-size</code>) matching the container limit.</p>",
  },
  {
    id: "dep3",
    category: "deploy",
    categoryLabel: "Deploy & Ops",
    question: "Liveness vs readiness probes (and @nestjs/terminus)?",
    answerHtml:
      "<p><b>Liveness</b> = is the process alive / not deadlocked — cheap, <b>no DB ping</b>; failing → kubelet <b>restarts</b> the pod. <b>Readiness</b> = can it serve now — <b>includes real deps</b> (DB, Redis); failing → pod is <b>removed from the Service</b> (no restart). A <b>startup probe</b> guards slow boots.</p><p><code>@nestjs/terminus</code> provides <code>@HealthCheck()</code> + indicators (DB ping, memory, disk, HTTP, microservice). Fail readiness on SIGTERM to drain.</p>",
  },
  {
    id: "dep4",
    category: "deploy",
    categoryLabel: "Deploy & Ops",
    question: "Why structured logging (pino), and what's redaction?",
    answerHtml:
      "<p>Structured <b>JSON</b> logs are queryable by aggregators and far faster on the hot path than pretty console logging. <b>pino</b> (via <code>nestjs-pino</code>) auto-logs HTTP req/res and integrates with DI; use <code>pino-pretty</code> only in dev. <b>Redaction</b> (<code>redact</code> paths) strips secrets like <code>req.headers.authorization</code>, <code>password</code>, cookies during serialization. Pair with a <b>correlation/request id</b> (via <code>nestjs-cls</code>/AsyncLocalStorage) so every log line at any depth is traceable.</p>",
  },
  {
    id: "dep5",
    category: "deploy",
    categoryLabel: "Deploy & Ops",
    question: "How do you add distributed tracing (OpenTelemetry) to Nest?",
    answerHtml:
      "<p>Use the OTel Node SDK (<code>@opentelemetry/sdk-node</code>) with auto-instrumentations. <b>Load it before the app</b> — <code>node --require ./instrumentation.js dist/main.js</code> — or the monkey-patching won't apply. A <b>trace</b> is a tree of <b>spans</b> sharing a trace id; context propagates in-process via AsyncLocalStorage and across services via the W3C <code>traceparent</code> header. Export OTLP to a collector (Jaeger/Tempo/Datadog) and inject <code>trace_id</code> into logs to pivot between traces and logs.</p>",
  },
  {
    id: "dep6",
    category: "deploy",
    categoryLabel: "Deploy & Ops",
    question: "What are the four observability signals you should monitor?",
    answerHtml:
      "<p><b>(1) Uptime/health</b> (probes), <b>(2) Metrics</b> — including Node internals like <b>event-loop lag</b>, heap, GC, plus request rate/latency/error rate (RED), <b>(3) Distributed traces</b> (OTel), and <b>(4) Structured logs</b> with correlation ids. Tie alerts to guardrail metrics (error rate, p99 latency, loop lag) so regressions page you, not your users.</p>",
  },

  // ---------------- ARCHITECTURE ----------------
  {
    id: "ar1",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What is hexagonal (ports & adapters) architecture in Nest?",
    answerHtml:
      "<p>Layers point <b>inward</b>: <code>domain</code> ← <code>application</code> (use-cases + <b>ports</b>) ← <code>infrastructure</code> (adapters) ← <code>presentation</code>. A <b>port</b> is an interface + a DI token; an <b>adapter</b> is a provider bound to that token:</p><div class=\"code\">{ provide: USER_REPOSITORY, useClass: PrismaUserRepository }</div><p>The use-case depends on the port, never the concrete class — so swapping Prisma→in-memory fake is one line, and domain/use-case unit tests need no DB. The Nest <code>@Module</code> is the composition root. Overkill for thin CRUD; powerful for complex domains.</p>",
  },
  {
    id: "ar2",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What is CQRS and when is it worth it?",
    answerHtml:
      "<p>CQRS (<code>@nestjs/cqrs</code>) splits writes (<b>Commands</b> → one handler) from reads (<b>Queries</b> → one handler) via buses, with <b>Events</b> fanning out to N handlers and <b>Sagas</b> turning events into new commands. It lets read/write models scale and evolve independently.</p><div class=\"callout warn\"><span class=\"lbl\">Gotcha &amp; cost</span> Errors in <b>event handlers</b> run outside the HTTP context — exception filters won't catch them. CQRS adds real complexity and eventual consistency; use it for complex domains with divergent read/write needs, <b>not</b> CRUD.</div>",
  },
  {
    id: "ar3",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you enforce module boundaries in a modular monolith?",
    answerHtml:
      "<p>One module per bounded context, each owning its <b>own tables</b> (no cross-module joins/FKs). Cross-module calls go through a small <b>public API</b> + an adapter (the consumer defines a local interface; only the adapter imports the other module's public service). Keep domain services/repos private (export almost nothing). <b>Enforce in CI</b> with <code>dependency-cruiser</code> (no deep cross-module imports). Clean boundaries make later extraction to a microservice cheap.</p>",
  },
  {
    id: "ar4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you design a multi-tenant SaaS backend?",
    answerHtml:
      "<p>Pick an isolation model: <b>Silo</b> (DB-per-tenant — strongest isolation, priciest), <b>Pool</b> (shared tables + <code>tenant_id</code> — cheapest, noisy-neighbor risk), or <b>Bridge</b> (schema-per-tenant). Resolve the tenant from subdomain/JWT claim, set it in request context (CLS), and enforce it everywhere — Postgres <b>RLS</b> makes a forgotten filter unable to leak rows.</p><div class=\"callout warn\"><span class=\"lbl\">Cardinal sin</span> Cross-tenant data leakage (missing filter, mis-resolved tenant, cache key without tenant). Scope cache keys by tenant and add per-tenant quotas for noisy neighbors.</div>",
  },
  {
    id: "ar5",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Caching strategies and invalidation?",
    answerHtml:
      "<p>Patterns: <b>cache-aside</b> (read: check cache → miss → DB → set TTL; write: update DB → invalidate key), read-through, write-through, write-behind. <b>Invalidate</b> via TTL, delete-on-write, or versioned keys. Guard against <b>stampede</b> (a popular key expiring → thundering herd) with a lock/single-flight or jittered TTLs.</p><div class=\"callout\"><span class=\"lbl\">Name the pattern</span> <b>Stale-while-revalidate</b>: serve cache instantly, refresh in the background.</div>",
  },
  {
    id: "ar6",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Idempotency keys — what problem do they solve?",
    answerHtml:
      "<p>Clients retry (timeouts, network blips), so a “create payment” can arrive twice. A client-supplied <b>idempotency key</b> + a dedup store lets the server detect the retry and return the original result instead of charging twice — making a non-idempotent operation safe to retry. Essential for payments, order creation, and any at-least-once consumer.</p>",
  },

  // ---------------- BEYOND ----------------
  {
    id: "b1",
    category: "beyond",
    categoryLabel: "Beyond",
    question: "How do you run NestJS in serverless / edge environments?",
    answerHtml:
      "<p>Wrap the Nest app in a serverless handler (e.g. <code>@vendia/serverless-express</code> or a platform adapter) and <b>cache the bootstrapped app</b> across warm invocations so you don't rebuild the DI graph per request. Watch cold starts (trim deps, lazy-load heavy modules), use connection poolers (DB connections are scarce in serverless), and prefer the Fastify adapter for lower overhead. For true edge runtimes, keep to Web-standard APIs since Node built-ins may be unavailable.</p>",
  },
  {
    id: "b2",
    category: "beyond",
    categoryLabel: "Beyond",
    question: "What's coming in NestJS 12, and why does it matter?",
    answerHtml:
      "<p>The v12 roadmap (≈ Q3 2026) is a modernization pass: a <b>CommonJS → ESM</b> transition, native <b>Standard Schema</b> support in route decorators (use <b>Zod/Valibot/ArkType</b> directly for validation), and a toolchain refresh — <b>Vitest</b> replacing Jest, <b>oxlint</b> replacing ESLint, <b>Rspack</b> replacing Webpack — plus NATS v3 and Express graceful shutdown. It matters because validation, testing, and build ergonomics all shift.</p>",
  },
  {
    id: "b3",
    category: "beyond",
    categoryLabel: "Beyond",
    question: "How would you add streaming LLM/AI responses to a Nest API?",
    answerHtml:
      "<p>Stream tokens to the client with <b>Server-Sent Events</b> (<code>@Sse()</code> returns an RxJS Observable) or a WebSocket gateway, bridging the model provider's stream into the Observable. Offload heavy pre/post-processing to a queue/worker so the event loop stays free, apply rate limiting + per-user quotas, and use <code>AbortSignal</code> to cancel generation when the client disconnects.</p>",
  },
  {
    id: "b4",
    category: "beyond",
    categoryLabel: "Beyond",
    question: "What is AsyncLocalStorage and why is it powerful?",
    answerHtml:
      "<p><code>AsyncLocalStorage</code> propagates context (request id, tenant, user, trace) implicitly across async boundaries <b>without threading arguments</b> through every function. It's the foundation of <code>nestjs-cls</code>, request-scoped logging, multi-tenancy, and transaction propagation — giving you request context with singleton-scope performance instead of paying the REQUEST-scope bubbling cost.</p>",
  },
  {
    id: "b5",
    category: "beyond",
    categoryLabel: "Beyond",
    question: "When do you reach for event sourcing?",
    answerHtml:
      "<p>Event sourcing persists the <b>stream of events</b> as the source of truth and rebuilds state by replaying them, with read <b>projections</b> for queries. It buys a full audit log, time-travel, and flexible projections — at the cost of eventual consistency, schema-evolution complexity, and harder debugging. Use it for audit-heavy/complex domains (finance, logistics); avoid it for simple CRUD.</p>",
  },

  // ---------------- BEHAVIORAL ----------------
  {
    id: "bh1",
    category: "behavior",
    categoryLabel: "Behavioral",
    question: "How do you ramp on a large, unfamiliar NestJS codebase?",
    answerHtml:
      "<p>Read the <b>module graph</b> first (the <code>imports</code>/<code>exports</code> tell you the architecture), trace one request end-to-end through its lifecycle, and follow the data flow before reading every file. Find the smallest safe change, lean on the types and tests, and <b>follow existing patterns</b> rather than importing your own. Nest's consistent structure makes this faster than an unopinionated Express app.</p>",
  },
  {
    id: "bh2",
    category: "behavior",
    categoryLabel: "Behavioral",
    question: "Describe debugging a production performance issue methodically.",
    answerHtml:
      "<p><b>Reproduce → measure → isolate → fix → add a regression test.</b> Measure first (don't guess): check event-loop lag, p99 latency, and traces to find the slow span. Is it CPU (blocking the loop), I/O (slow query, N+1), or memory (leak)? Use a CPU profile/flamegraph or heap snapshots accordingly. Fix the root cause, then add a test or alert so it can't silently regress. “I profile instead of guessing” is the signal.</p>",
  },
  {
    id: "bh3",
    category: "behavior",
    categoryLabel: "Behavioral",
    question: "How do you explain a technical trade-off to a non-technical stakeholder?",
    answerHtml:
      "<p>Lead with the <b>business impact</b>, not the mechanism: “Option A ships in a week but costs more under load; option B takes three weeks but halves our infra bill.” Use one concrete analogy, give a clear recommendation with the risk named, and avoid jargon. Senior engineers translate engineering into decisions stakeholders can own.</p>",
  },
  {
    id: "bh4",
    category: "behavior",
    categoryLabel: "Behavioral",
    question: "How do you approach a system-design interview round?",
    answerHtml:
      "<p>Use a structured flow: <b>Clarify</b> requirements (functional + non-functional, scale, read/write ratio) before drawing anything — most candidates rush this. Then a <b>rough high-level design</b>, <b>deep-dive</b> one component, explicitly <b>discuss trade-offs</b> (“I'm trading freshness for speed here”), and <b>summarize</b> risks. Naming patterns <i>and</i> their trade-offs out loud is the senior signal.</p>",
  },
  {
    id: "bh5",
    category: "behavior",
    categoryLabel: "Behavioral",
    question: "How do you handle a disagreement on a technical approach in code review?",
    answerHtml:
      "<p>Separate facts from preferences: ground the discussion in concrete criteria (performance, maintainability, risk), ask for the reasoning behind the other approach, and propose a small spike or benchmark when it's empirical. Disagree-and-commit once a decision is made, and document the trade-off so it's not relitigated. The goal is the best outcome for the codebase, not winning.</p>",
  },
];

export const FLASHCARD3_FILTERS = [
  { value: "micro", label: "Microservices" },
  { value: "queues", label: "Queues & Jobs" },
  { value: "node", label: "Node.js Core" },
  { value: "security", label: "Security" },
  { value: "deploy", label: "Deploy & Ops" },
  { value: "arch", label: "Architecture" },
  { value: "beyond", label: "Beyond" },
  { value: "behavior", label: "Behavioral" },
];
