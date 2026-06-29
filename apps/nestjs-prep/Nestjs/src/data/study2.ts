// Study guide — Node.js internals & advanced sections (21–36).
import type { StudySection } from "./study";

export const STUDY2_SECTIONS: StudySection[] = [
  {
    id: "st-21",
    num: "21",
    title: "21 · The Node.js event loop",
    html:
      "<p><b>Core:</b> Node runs your JS on one thread atop <b>libuv</b>. The loop's phases, in order: <b>timers</b> → pending callbacks → idle/prepare → <b>poll</b> (I/O) → <b>check</b> (<code>setImmediate</code>) → close callbacks. Between every callback, two microtask queues drain: <code>process.nextTick</code> first, then Promises.</p>" +
      "<p>Key facts: inside an I/O callback <code>setImmediate</code> beats <code>setTimeout(0)</code>; recursive <code>nextTick</code> can <b>starve</b> the loop; the <b>thread pool</b> (default 4) serves <code>fs</code>, <code>dns.lookup</code>, <code>crypto</code>, <code>zlib</code> — but <b>not</b> network I/O (that's kernel-async).</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “One JS thread, libuv phases timers→poll→check, microtasks drain between callbacks. Network I/O is kernel-async; fs/crypto/zlib use the 4-thread pool.”</div>",
  },
  {
    id: "st-22",
    num: "22",
    title: "22 · Async patterns & error handling",
    html:
      "<p><b>Core:</b> callbacks → promises → async/await; most core APIs have promise variants (<code>fs/promises</code>, <code>timers/promises</code>). Know the combinators: <code>all</code> (all-or-fast-fail), <code>allSettled</code> (collect partials), <code>race</code> (first to settle), <code>any</code> (first success). Use <b>AbortController/AbortSignal</b> for cancellation and timeouts.</p>" +
      "<p>Pitfalls: floating promises (errors vanish), <code>forEach</code> with async (doesn't await), unbounded <code>Promise.all</code> over huge arrays (use a concurrency limiter), and <b>unhandled rejections</b> (process exits by default since Node 15). Distinguish <b>operational</b> errors (handle) from <b>programmer</b> errors (let it crash).</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “async/await with try/catch, AbortSignal for cancellation, bounded concurrency for fan-out, and I crash-and-restart on programmer errors rather than swallowing them.”</div>",
  },
  {
    id: "st-23",
    num: "23",
    title: "23 · Streams & backpressure",
    html:
      "<p><b>Core:</b> four types — Readable, Writable, Duplex, Transform. Stream large data instead of buffering it into memory. <b>Backpressure</b> stops a fast producer overrunning a slow consumer: <code>write()</code> returns <code>false</code> + the <code>'drain'</code> event is the manual protocol.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">pipeline &gt; pipe</span> Always use <code>stream.pipeline()</code>: <code>pipe()</code> doesn't forward errors or clean up on failure (FD leaks). Readables are async-iterable — <code>for await (const chunk of stream)</code> respects backpressure automatically.</div>" +
      "<div class=\"code\">await pipeline(\n  fs.createReadStream(src),\n  zlib.createGzip(),\n  fs.createWriteStream(dst),\n);</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Stream large payloads with pipeline so backpressure and error cleanup are handled — never buffer a whole file in memory.”</div>",
  },
  {
    id: "st-24",
    num: "24",
    title: "24 · Concurrency: worker_threads, cluster, child_process",
    html:
      "<p><b>Core:</b> Node scales by <i>not</i> blocking the loop and by using more processes/threads.</p>" +
      "<table><tr><th>Tool</th><th>Use</th></tr>" +
      "<tr><td><b>worker_threads</b></td><td>CPU-bound JS in-process; shared memory via SharedArrayBuffer.</td></tr>" +
      "<tr><td><b>cluster</b></td><td>Scale a stateless HTTP server across cores (processes sharing a port).</td></tr>" +
      "<tr><td><b>child_process</b></td><td>Run external programs: spawn (stream), exec (buffer + shell), fork (Node + IPC).</td></tr></table>" +
      "<p>In containers, N single-process replicas behind a load balancer often replace in-process cluster. Keep instances stateless (state in Redis/DB) so any replica serves any request.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Scale I/O with replicas/cluster, offload CPU work to a worker-thread pool, shell out with child_process — and keep app instances stateless.”</div>",
  },
  {
    id: "st-25",
    num: "25",
    title: "25 · Modules: CommonJS vs ESM",
    html:
      "<p><b>Core:</b> CJS (<code>require</code>/<code>module.exports</code>) is synchronous with free <code>__dirname</code>; ESM (<code>import</code>/<code>export</code>) is async, statically analyzable, supports top-level <code>await</code>, and uses <code>import.meta.dirname</code>. Opt in with <code>\"type\": \"module\"</code> or <code>.mjs</code>.</p>" +
      "<p>Interop: ESM imports CJS fine; CJS importing ESM was dynamic-<code>import()</code>-only until <b>synchronous <code>require(esm)</code> stabilized in Node 24</b>. The <code>\"exports\"</code> field defines public entry points and encapsulates internals (no deep imports). NestJS 12 plans a CJS→ESM transition.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “ESM is async/static with top-level await; CJS is sync. Node 24 made require(esm) work, and the exports field controls a package's public surface.”</div>",
  },
  {
    id: "st-26",
    num: "26",
    title: "26 · Performance & profiling",
    html:
      "<p><b>Core:</b> the #1 rule is <b>don't block the event loop</b> — offload CPU work, avoid sync APIs on the hot path, and prefer native methods. Measure, don't guess: <code>perf_hooks.monitorEventLoopDelay()</code> for loop lag, <code>--cpu-prof</code> / clinic.js / <code>0x</code> for flamegraphs, heap snapshots for memory.</p>" +
      "<p>Other levers: connection pooling, keep-alive, response compression (ideally at the proxy), caching, pagination + streaming for large results, and the Fastify adapter for raw throughput. Distributed state (rate limits, cache, sessions) must live in Redis so replicas agree.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “I profile with flamegraphs and event-loop-lag metrics, keep CPU work off the loop, pool connections, and cache — then verify with a load test.”</div>",
  },
  {
    id: "st-27",
    num: "27",
    title: "27 · Memory management & leak hunting",
    html:
      "<p><b>Core:</b> V8 uses a generational GC — a fast Scavenger for the young generation (most objects die young) and Mark-Sweep-Compact for the old generation. A leak shows as steadily growing <b>old-space</b> retained size across snapshots.</p>" +
      "<p>Common causes: unbounded caches/Maps, forgotten event listeners (<code>MaxListenersExceededWarning</code>), timers never cleared, closures capturing large objects, module-level globals that only grow. Hunt by comparing two heap snapshots over time (retained constructors + retainer paths). <code>WeakMap</code>/<code>WeakRef</code> help where appropriate.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Leaks are usually listeners, timers, or unbounded caches. I take two heap snapshots under load and diff retained objects to find the retainer path.”</div>",
  },
  {
    id: "st-28",
    num: "28",
    title: "28 · Microservices & transports",
    html:
      "<p><b>Core:</b> a Nest microservice uses a non-HTTP transport (TCP, Redis, NATS, RabbitMQ, Kafka, gRPC) with the same DI/pipes/guards/filters. <b>Request-response</b> uses <code>@MessagePattern</code> + <code>client.send()</code> (cold Observable); <b>events</b> use <code>@EventPattern</code> + <code>client.emit()</code> (fire-and-forget). Throw <code>RpcException</code>; RPC filters return Observables.</p>" +
      "<p>Pick gRPC for typed low-latency RPC, Kafka for durable replayable streams, RabbitMQ for reliable work queues. An <b>API gateway</b> (often the HTTP half of a hybrid app) fronts the services and centralizes auth/routing/aggregation. Keep consistency with sagas + outbox + idempotency, not 2PC.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Same Nest building blocks over a message transport; send() for RPC, emit() for events; gateway for cross-cutting concerns; sagas and outbox for consistency.”</div>",
  },
  {
    id: "st-29",
    num: "29",
    title: "29 · GraphQL",
    html:
      "<p><b>Core:</b> prefer <b>code-first</b> (TS classes generate the SDL — no drift). Resolvers hold <code>@Query</code>/<code>@Mutation</code>/<code>@ResolveField</code>; field resolvers fetch relations lazily. The headline senior topic is the <b>N+1 problem</b>: a field resolver firing per parent over a list → 1+N queries. Fix with <b>DataLoader</b> batching (1+1) — return results in the same order/length as keys, and make the loader <b>per-request</b>.</p>" +
      "<p>Subscriptions use <code>graphql-ws</code> (back PubSub with Redis in prod). Federation splits the graph into subgraphs + a gateway via <code>@key</code> + <code>@ResolveReference()</code>.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Code-first resolvers, and I solve N+1 with per-request DataLoader that batches per-key loads into one IN query.”</div>",
  },
  {
    id: "st-30",
    num: "30",
    title: "30 · WebSockets & real-time",
    html:
      "<p><b>Core:</b> gateways (<code>@WebSocketGateway</code>) handle <code>@SubscribeMessage</code> events with connection lifecycle hooks. socket.io (IoAdapter) gives rooms/namespaces/acks; ws (WsAdapter) is leaner. Gateways are <b>singletons</b> (can't be request-scoped) — keep per-connection state on the socket.</p>" +
      "<p>Scale across instances with the socket.io <b>Redis adapter</b> (pub/sub fans out room events) plus sticky sessions or websocket-only transport. Authenticate in the <b>handshake</b>, not per message. For real-time choices: WebSocket for two-way, SSE for one-way server push, push notifications when the app is closed.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Gateways with socket.io + the Redis adapter to fan out across nodes, auth at the handshake, and SSE when I only need one-way push.”</div>",
  },
  {
    id: "st-31",
    num: "31",
    title: "31 · Security hardening",
    html:
      "<p><b>Core:</b> the biggest real risk is the <b>supply chain</b> — lockfile + <code>npm ci</code>, audit/Snyk, minimize deps, <code>--ignore-scripts</code>. App-level: validate all input (whitelist DTOs), limit body size (single-thread DoS), rate-limit, helmet headers, strict CORS, parameterized queries (injection), guard against prototype pollution and ReDoS, hide error internals, run as non-root.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Permission model</span> <code>--permission</code> is a seat belt for trusted code, <b>not</b> a sandbox against malicious code. Real isolation is OS-level (containers, seccomp).</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Lockfile + audits for supply chain, validation + parameterized queries + helmet + rate limiting at the app, and OS-level isolation for real sandboxing.”</div>",
  },
  {
    id: "st-32",
    num: "32",
    title: "32 · Logging & observability",
    html:
      "<p><b>Core:</b> structured <b>JSON logs</b> (pino via <code>nestjs-pino</code>) to stdout, with <b>redaction</b> of secrets and a <b>correlation id</b> per request (via <code>nestjs-cls</code>/AsyncLocalStorage) so every line is traceable. Add <b>OpenTelemetry</b> tracing (load the SDK before the app) — traces are span trees sharing a trace id, propagated cross-service via the <code>traceparent</code> header.</p>" +
      "<p>Monitor four signals: uptime/health, metrics (incl. event-loop lag, RED), traces, and logs. Alert on guardrails (error rate, p99 latency, loop lag).</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “JSON logs with correlation ids, OpenTelemetry traces correlated to logs, and alerts on event-loop lag and p99 — not just CPU.”</div>",
  },
  {
    id: "st-33",
    num: "33",
    title: "33 · CI/CD, Docker & deployment",
    html:
      "<p><b>Core:</b> a <b>multi-stage Dockerfile</b> — build stage compiles + prunes dev deps, runtime stage copies only <code>node_modules</code> + <code>dist</code> onto a small/distroless base, runs as the non-root <code>node</code> user, uses exec-form <code>CMD [\"node\",\"dist/main.js\"]</code>, and handles signals (<code>--init</code>/tini). Set <code>NODE_ENV=production</code> and a V8 heap limit matching the container.</p>" +
      "<p>CI runs typecheck + lint + tests on every push (the loop); use <code>npm ci</code> with a committed lockfile; design atomic, zero-downtime deploys and let the orchestrator restart — don't bundle a process manager inside k8s.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Multi-stage image, non-root, proper signal handling, NODE_ENV=production, npm ci with a lockfile, and CI gating on typecheck/lint/test.”</div>",
  },
  {
    id: "st-34",
    num: "34",
    title: "34 · Graceful shutdown & health checks",
    html:
      "<p><b>Core:</b> call <code>app.enableShutdownHooks()</code>, then on SIGTERM: fail readiness first (stop new traffic), stop accepting connections, finish in-flight requests, close DB/Redis/brokers, flush logs, exit. Nest awaits promises from the shutdown hooks.</p>" +
      "<p><b>Probes</b> (<code>@nestjs/terminus</code>): <b>liveness</b> = process alive (cheap, no DB) → restart on failure; <b>readiness</b> = can serve now (checks real deps) → removed from the load balancer on failure; <b>startup</b> guards slow boots. In k8s, add a small <code>preStop</code> delay since endpoint removal and SIGTERM race.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “On SIGTERM I fail readiness, drain in-flight work, then close resources — and I keep liveness cheap so a slow DB doesn't trigger a restart loop.”</div>",
  },
  {
    id: "st-35",
    num: "35",
    title: "35 · Versioning, compression & file handling",
    html:
      "<p><b>Core:</b> API <b>versioning</b> via <code>app.enableVersioning({ type })</code> — URI (<code>/v1</code>, default), header, media-type, or custom — with <code>@Version('1')</code> per controller/route and <code>VERSION_NEUTRAL</code> for shared routes. <b>Compression</b> (Express <code>compression</code> / <code>@fastify/compress</code>) is best offloaded to a reverse proxy at scale.</p>" +
      "<p><b>File upload</b>: Multer via <code>FileInterceptor</code> + <code>ParseFilePipe</code> (size + magic-number type validation); Multer is incompatible with Fastify (use <code>@fastify/multipart</code>). <b>Streaming files</b>: return a <code>StreamableFile</code> so post-controller interceptors still run.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “URI versioning, ParseFilePipe to validate uploads by size and magic number, StreamableFile for downloads, and compression at the proxy.”</div>",
  },
  {
    id: "st-36",
    num: "36",
    title: "36 · Soft skills & system-design interviews",
    html:
      "<p><b>What they want:</b> communication, structured thinking, and trade-off awareness. In a design round, <b>clarify</b> requirements (functional + non-functional, scale, read/write ratio) before drawing — most candidates skip this — then sketch a high-level design, <b>deep-dive</b> one component, <b>discuss trade-offs</b> out loud (“I'm trading freshness for speed”), and <b>summarize</b> risks.</p>" +
      "<p>For behavioral questions, use <b>STAR</b> (Situation, Task, Action, Result) with a concrete metric. Explain trade-offs to non-technical stakeholders in business terms, and disagree-and-commit in reviews.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “I clarify before I design, name the trade-off for every decision, and tie behavioral stories to a measurable result.”</div>",
  },
];
