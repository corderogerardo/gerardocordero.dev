// Practice prompts — NestJS / Node.js coding tasks and backend system-design prompts.
import type { Level } from "@/lib/levels";

export type PromptKind = "coding" | "design";
export type Prompt = {
  id: string;
  kind: PromptKind;
  title: string;
  level: Level;
  tags: string[];
  promptHtml: string;
  reveal: { label: string; html: string }[];
};

export const PROMPTS: Prompt[] = [
  // ---------------- CODING ----------------
  {
    id: "pr-crud",
    kind: "coding",
    title: "Paginated REST endpoint with validation + auth",
    level: "mid",
    tags: ["NestJS", "validation", "guards"],
    promptHtml:
      "<p>Build <code>GET /users?page=1&amp;limit=20</code> that is JWT-protected, validates query params, and returns a paginated result. Show the controller, the query DTO, and how the guard/pipe are wired.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<ul><li>A <code>PaginationDto</code> with <code>@IsInt()/@Min()/@Max()</code> + <code>@Type(() =&gt; Number)</code> for coercion.</li><li>Global <code>ValidationPipe({ transform: true, whitelist: true })</code>.</li><li><code>@UseGuards(JwtAuthGuard)</code> (or a global APP_GUARD).</li><li>Service returns <code>{ data, total, page, limit }</code>; repository uses <code>skip/take</code>.</li></ul>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">export class PaginationDto {\n  @Type(() =&gt; Number) @IsInt() @Min(1) page = 1;\n  @Type(() =&gt; Number) @IsInt() @Min(1) @Max(100) limit = 20;\n}\n\n@Controller('users')\n@UseGuards(JwtAuthGuard)\nexport class UsersController {\n  constructor(private users: UsersService) {}\n\n  @Get()\n  list(@Query() q: PaginationDto) {\n    return this.users.findPage(q.page, q.limit);\n  }\n}\n\n// service\nasync findPage(page: number, limit: number) {\n  const [data, total] = await this.repo.findAndCount({\n    skip: (page - 1) * limit, take: limit, order: { id: 'DESC' },\n  });\n  return { data, total, page, limit, pages: Math.ceil(total / limit) };\n}</div><p>Prefer <b>cursor</b> pagination for large/infinite feeds (stable under inserts).</p>",
      },
    ],
  },
  {
    id: "pr-roles-guard",
    kind: "coding",
    title: "Custom RolesGuard with the Reflector",
    level: "senior",
    tags: ["NestJS", "auth", "RBAC"],
    promptHtml:
      "<p>Implement a <code>@Roles('admin')</code> decorator and a <code>RolesGuard</code> that reads required roles from route metadata and compares them to <code>request.user.roles</code>. Make method-level roles override class-level.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<ul><li>Decorator = <code>SetMetadata(ROLES_KEY, roles)</code>.</li><li>Guard injects <code>Reflector</code> and uses <code>getAllAndOverride(ROLES_KEY, [handler, class])</code>.</li><li>No roles required → allow; else check membership.</li><li>Register as <code>APP_GUARD</code> so it's global + DI-enabled.</li></ul>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">export const ROLES_KEY = 'roles';\nexport const Roles = (...roles: string[]) =&gt; SetMetadata(ROLES_KEY, roles);\n\n@Injectable()\nexport class RolesGuard implements CanActivate {\n  constructor(private reflector: Reflector) {}\n  canActivate(ctx: ExecutionContext): boolean {\n    const required = this.reflector.getAllAndOverride&lt;string[]&gt;(\n      ROLES_KEY, [ctx.getHandler(), ctx.getClass()],\n    );\n    if (!required?.length) return true;\n    const { user } = ctx.switchToHttp().getRequest();\n    return required.some((r) =&gt; user?.roles?.includes(r));\n  }\n}</div><p><b>Gotcha:</b> <code>getAllAndOverride</code> (not <code>get</code>) is what makes the method override the class.</p>",
      },
    ],
  },
  {
    id: "pr-retry",
    kind: "coding",
    title: "Retry with exponential backoff + jitter",
    level: "senior",
    tags: ["Node", "resilience"],
    promptHtml:
      "<p>Write <code>retry(fn, { retries, baseMs })</code> that retries a failing async function with exponential backoff and jitter, only retrying transient errors, and gives up after N attempts.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<ul><li>Loop up to <code>retries+1</code> times; <code>await fn()</code> in try/catch.</li><li>Delay = <code>min(cap, base × 2^attempt)</code> + random jitter.</li><li>Only retry retryable errors (network, 5xx) — rethrow 4xx immediately.</li><li>Support an <code>AbortSignal</code> to cancel.</li></ul>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">async function retry&lt;T&gt;(fn: () =&gt; Promise&lt;T&gt;, opts = {}): Promise&lt;T&gt; {\n  const { retries = 3, baseMs = 100, capMs = 2000, retryable = () =&gt; true } = opts;\n  let attempt = 0;\n  for (;;) {\n    try { return await fn(); }\n    catch (err) {\n      if (attempt &gt;= retries || !retryable(err)) throw err;\n      const backoff = Math.min(capMs, baseMs * 2 ** attempt);\n      const jitter = Math.random() * backoff;\n      await new Promise((r) =&gt; setTimeout(r, backoff / 2 + jitter / 2));\n      attempt++;\n    }\n  }\n}</div><p>Jitter prevents a <b>thundering herd</b> of synchronized retries. Only retry <b>idempotent</b> operations.</p>",
      },
    ],
  },
  {
    id: "pr-lru",
    kind: "coding",
    title: "In-memory LRU cache (O(1))",
    level: "mid",
    tags: ["Node", "data structures"],
    promptHtml:
      "<p>Implement an LRU cache with O(1) <code>get</code> and <code>set</code> and a max capacity that evicts the least-recently-used entry.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>A JS <code>Map</code> preserves insertion order, so you can implement LRU without a hand-rolled linked list: on <code>get</code>, delete + re-set to move the key to the most-recent end; on <code>set</code> over capacity, evict <code>map.keys().next().value</code> (the oldest).</p>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">class LRU&lt;K, V&gt; {\n  private map = new Map&lt;K, V&gt;();\n  constructor(private cap: number) {}\n  get(key: K): V | undefined {\n    if (!this.map.has(key)) return undefined;\n    const v = this.map.get(key)!;\n    this.map.delete(key); this.map.set(key, v); // mark recent\n    return v;\n  }\n  set(key: K, val: V) {\n    if (this.map.has(key)) this.map.delete(key);\n    else if (this.map.size &gt;= this.cap)\n      this.map.delete(this.map.keys().next().value); // evict oldest\n    this.map.set(key, val);\n  }\n}</div><p>The classic interview version uses a <b>HashMap + doubly linked list</b>; the Map trick is the idiomatic JS shortcut.</p>",
      },
    ],
  },
  {
    id: "pr-plimit",
    kind: "coding",
    title: "Async pool with a concurrency limit",
    level: "senior",
    tags: ["Node", "async"],
    promptHtml:
      "<p>Process 10,000 items by running an async <code>worker(item)</code> with at most <b>N</b> in flight at once (a bounded <code>Promise.all</code>). Why not just <code>Promise.all(items.map(worker))</code>?</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>Unbounded <code>Promise.all</code> starts all 10k at once — exhausting sockets/file handles/memory. Instead keep a pool: launch up to N, and when one resolves, pull the next item.</p>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">async function mapLimit&lt;T, R&gt;(items: T[], n: number,\n  worker: (item: T) =&gt; Promise&lt;R&gt;): Promise&lt;R[]&gt; {\n  const results: R[] = new Array(items.length);\n  let i = 0;\n  async function run() {\n    while (i &lt; items.length) {\n      const idx = i++;\n      results[idx] = await worker(items[idx]);\n    }\n  }\n  await Promise.all(Array.from({ length: Math.min(n, items.length) }, run));\n  return results;\n}</div><p>This bounds concurrency to N. Libraries like <code>p-limit</code> do the same — know how to build it from scratch.</p>",
      },
    ],
  },
  {
    id: "pr-interceptor",
    kind: "coding",
    title: "Response-envelope TransformInterceptor",
    level: "mid",
    tags: ["NestJS", "interceptors", "RxJS"],
    promptHtml:
      "<p>Write an interceptor that wraps every successful response in <code>{ data, timestamp }</code> without each handler knowing about it.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>Implement <code>NestInterceptor</code>; return <code>next.handle().pipe(map(...))</code> to transform the stream after the handler runs. Register globally via <code>APP_INTERCEPTOR</code>.</p>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">@Injectable()\nexport class TransformInterceptor&lt;T&gt;\n  implements NestInterceptor&lt;T, { data: T; timestamp: string }&gt; {\n  intercept(_ctx: ExecutionContext, next: CallHandler) {\n    return next.handle().pipe(\n      map((data) =&gt; ({ data, timestamp: new Date().toISOString() })),\n    );\n  }\n}\n// providers: [{ provide: APP_INTERCEPTOR, useClass: TransformInterceptor }]</div><p>For timeouts add <code>timeout(5000)</code> + <code>catchError</code>; for logging add a <code>tap</code> before the map.</p>",
      },
    ],
  },
  {
    id: "pr-stream",
    kind: "coding",
    title: "Stream a large file with backpressure",
    level: "senior",
    tags: ["Node", "streams"],
    promptHtml:
      "<p>Serve a multi-GB file as a gzipped download without loading it into memory, and make sure errors and resources are handled.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>Pipe <code>createReadStream</code> → <code>zlib.createGzip()</code> → the response with <code>stream.pipeline</code> (not <code>.pipe()</code>) so backpressure, error propagation, and stream cleanup are automatic.</p>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">import { pipeline } from 'node:stream/promises';\nimport { createReadStream } from 'node:fs';\nimport { createGzip } from 'node:zlib';\n\n@Get('download')\nasync download(@Res() res: Response) {\n  res.set({ 'Content-Type': 'application/gzip',\n    'Content-Disposition': 'attachment; filename=\"big.json.gz\"' });\n  await pipeline(createReadStream('big.json'), createGzip(), res);\n}</div><p>In Nest, prefer returning a <code>StreamableFile</code> when you don't need raw <code>@Res()</code> — post-controller interceptors still run. Never buffer the whole file.</p>",
      },
    ],
  },
  {
    id: "pr-token-bucket",
    kind: "coding",
    title: "Redis token-bucket rate limiter",
    level: "senior",
    tags: ["Node", "Redis", "rate limiting"],
    promptHtml:
      "<p>Implement a distributed token-bucket limiter (refill rate R, capacity C) that's correct across multiple app instances. Why must it be atomic?</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>Store <code>{tokens, lastRefill}</code> per key in Redis. On each request: refill by <code>elapsed × R</code> (capped at C), allow if ≥1 then decrement. The refill→check→decrement must be <b>atomic</b> or two concurrent requests race and both pass — so run it as a <b>Lua script</b> (Redis executes it atomically).</p>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">-- KEYS[1]=bucket  ARGV: now, rate, capacity, cost\nlocal b = redis.call('HMGET', KEYS[1], 'tokens', 'ts')\nlocal tokens = tonumber(b[1]) or tonumber(ARGV[3])\nlocal ts = tonumber(b[2]) or tonumber(ARGV[1])\nlocal delta = math.max(0, tonumber(ARGV[1]) - ts)\ntokens = math.min(tonumber(ARGV[3]), tokens + delta * tonumber(ARGV[2]))\nlocal allowed = tokens &gt;= tonumber(ARGV[4])\nif allowed then tokens = tokens - tonumber(ARGV[4]) end\nredis.call('HMSET', KEYS[1], 'tokens', tokens, 'ts', ARGV[1])\nredis.call('PEXPIRE', KEYS[1], 60000)\nreturn allowed and 1 or 0</div><p>Use Redis server time to avoid clock skew; decide fail-open vs fail-closed if Redis is unreachable. In Nest, wrap this in a custom <code>ThrottlerGuard</code> storage.</p>",
      },
    ],
  },
  {
    id: "pr-dataloader",
    kind: "coding",
    title: "Fix GraphQL N+1 with DataLoader",
    level: "senior",
    tags: ["NestJS", "GraphQL", "performance"],
    promptHtml:
      "<p>A <code>Post.author</code> field resolver runs one query per post over a list of 50 posts (1+50 queries). Fix it with DataLoader and explain the two classic bugs.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>Create a per-request DataLoader whose batch fn takes all author ids and returns authors with a single <code>WHERE id IN (...)</code>. Resolve the field via <code>loader.load(post.authorId)</code> — calls coalesce within one tick.</p>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">// in the GraphQL context factory (per request):\nconst authorLoader = new DataLoader&lt;string, Author&gt;(async (ids) =&gt; {\n  const rows = await authorRepo.findBy({ id: In([...ids]) });\n  const byId = new Map(rows.map((a) =&gt; [a.id, a]));\n  return ids.map((id) =&gt; byId.get(id) ?? null); // SAME order + length\n});\n\n@ResolveField('author')\nauthor(@Parent() post: Post, @Context('authorLoader') loader) {\n  return loader.load(post.authorId);\n}</div><div class=\"callout warn\"><span class=\"lbl\">Two bugs to avoid</span> (1) the batch fn must return results in the <b>same order and length</b> as the keys — build a Map and re-map. (2) The loader must be <b>per-request</b> — a singleton leaks one user's cache to another.</div>",
      },
    ],
  },
  {
    id: "pr-shutdown",
    kind: "coding",
    title: "Graceful shutdown for a Nest service",
    level: "senior",
    tags: ["NestJS", "ops"],
    promptHtml:
      "<p>Implement graceful shutdown so a SIGTERM (k8s rollout) drains in-flight requests and closes resources before exit.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<ul><li><code>app.enableShutdownHooks()</code> in <code>main.ts</code>.</li><li>Implement <code>OnApplicationShutdown</code>/<code>OnModuleDestroy</code> to close DB pools, queues, sockets.</li><li>Fail the readiness probe first so the LB stops routing; finish in-flight; then exit.</li></ul>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">// main.ts\nconst app = await NestFactory.create(AppModule);\napp.enableShutdownHooks();\nawait app.listen(3000);\n\n@Injectable()\nexport class DbService implements OnApplicationShutdown {\n  async onApplicationShutdown(signal?: string) {\n    await this.pool.end();      // close connections\n    await this.queue.close();   // stop workers\n  }\n}</div><p><b>k8s detail:</b> endpoint removal and SIGTERM happen concurrently, so add a small <code>preStop</code> sleep (or keep serving briefly) to avoid dropping requests, and set <code>terminationGracePeriodSeconds</code> above worst-case drain.</p>",
      },
    ],
  },

  // ---------------- SYSTEM DESIGN ----------------
  {
    id: "pr-multitenant",
    kind: "design",
    title: "Design a multi-tenant SaaS API",
    level: "architect",
    tags: ["architecture", "multi-tenancy"],
    promptHtml:
      "<p>Design the backend for a B2B SaaS where each tenant's data must be isolated. Cover the isolation model, tenant resolution, and how you prevent cross-tenant leakage.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>Clarify scale + compliance first (it drives silo vs pool). Decide isolation model, where the tenant id comes from, how it's propagated, and the guardrail that makes leakage impossible even with a bug.</p>",
      },
      {
        label: "Solution",
        html:
          "<ul><li><b>Isolation:</b> Pool (shared tables + <code>tenant_id</code>) for cost; Silo (DB per tenant) for enterprise/compliance; Bridge (schema per tenant) in between. Mix by tier.</li><li><b>Resolution:</b> tenant from subdomain or a JWT claim → set in request context via <code>nestjs-cls</code> (AsyncLocalStorage).</li><li><b>Guardrail:</b> Postgres <b>Row-Level Security</b> keyed on a session var — a forgotten filter can't leak rows.</li><li><b>Noisy neighbor:</b> per-tenant rate limits/quotas, query timeouts; scope all cache keys by tenant.</li><li><b>Ops:</b> per-tenant migrations (pool=1 run, silo=N), backups, and data residency.</li></ul><div class=\"callout warn\"><span class=\"lbl\">Cardinal sin</span> Cross-tenant leakage — RLS + tenant-scoped cache keys are the defense.</div>",
      },
    ],
  },
  {
    id: "pr-order-pipeline",
    kind: "design",
    title: "Design an event-driven order pipeline",
    level: "architect",
    tags: ["architecture", "microservices", "messaging"],
    promptHtml:
      "<p>An order flows through payment, inventory, and shipping — separate services. Design it for reliability: no double charges, no lost orders, consistent state.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>No distributed transaction. Use a <b>saga</b> with compensations, reliable event publishing via an <b>outbox</b>, and idempotent consumers. Decide orchestration vs choreography.</p>",
      },
      {
        label: "Solution",
        html:
          "<ul><li><b>Saga:</b> order → reserve inventory → charge payment → schedule shipping; on any failure, run compensations (refund, release inventory).</li><li><b>Transactional outbox:</b> each service writes its state change + an outbox event in the same DB transaction; a relay publishes to Kafka/RabbitMQ (at-least-once).</li><li><b>Idempotency:</b> consumers dedupe on (event_id, type); payment uses an idempotency key so retries don't double-charge.</li><li><b>Observability:</b> a correlation id threads the whole flow; a DLQ + alerts catch poison messages.</li><li><b>Orchestration</b> (a coordinator service) for complex flows; <b>choreography</b> (services react to events) for loose coupling.</li></ul>",
      },
    ],
  },
  {
    id: "pr-gateway-auth",
    kind: "design",
    title: "Design auth across an API gateway + microservices",
    level: "architect",
    tags: ["architecture", "auth", "microservices"],
    promptHtml:
      "<p>You have a gateway and several backend services. Where do you authenticate and authorize, and how do downstream services trust the caller?</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>Authenticate once at the edge, propagate verified identity inward, and keep services internal. Decide between opaque tokens (introspection) and JWTs (self-verifying).</p>",
      },
      {
        label: "Solution",
        html:
          "<ul><li><b>Edge:</b> the gateway validates the JWT/refreshes sessions, applies global rate limiting, and rejects bad requests early.</li><li><b>Propagation:</b> pass a verified identity inward (the validated JWT or a signed internal token) so each service can authorize without re-authenticating; services verify the signature (shared JWKS).</li><li><b>Authorization:</b> coarse checks at the gateway, fine-grained (resource-level, RBAC/ABAC) inside each service where the domain lives.</li><li><b>Network:</b> services aren't internet-exposed; mTLS / a service mesh between them; short-lived tokens; centralized JWKS rotation.</li></ul><div class=\"callout\"><span class=\"lbl\">Trade-off</span> JWTs scale (no introspection call) but can't be revoked before expiry — keep them short and pair with a denylist for logout.</div>",
      },
    ],
  },
  {
    id: "pr-cache-strategy",
    kind: "design",
    title: "Design caching for a read-heavy endpoint",
    level: "senior",
    tags: ["architecture", "caching", "performance"],
    promptHtml:
      "<p>A product-detail endpoint gets 50k RPS, 99% reads, data changes a few times a day. Design the caching so it's fast, fresh enough, and survives a cache miss storm.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>Layer caches (CDN/edge → Redis → DB), pick an invalidation strategy that matches the change frequency, and protect against stampede when a hot key expires.</p>",
      },
      {
        label: "Solution",
        html:
          "<ul><li><b>Layers:</b> CDN/edge cache for anonymous reads; shared <b>Redis</b> cache-aside for the app; DB as the source of truth.</li><li><b>Invalidation:</b> since data changes rarely, use a moderate TTL + <b>delete-on-write</b> (or versioned keys) so updates show promptly.</li><li><b>Stampede protection:</b> a single-flight lock (<code>SETNX</code>) or request coalescing so one miss repopulates while others wait; jittered TTLs so keys don't all expire together.</li><li><b>Pattern:</b> stale-while-revalidate — serve stale instantly, refresh in the background.</li><li><b>Consistency:</b> across replicas, Redis (not in-memory) so all instances agree.</li></ul>",
      },
    ],
  },
  {
    id: "pr-idempotent-payments",
    kind: "design",
    title: "Design idempotent payment processing",
    level: "architect",
    tags: ["architecture", "resilience"],
    promptHtml:
      "<p>Clients retry on timeout, so a “charge card” request can arrive twice. Design the API + storage so a customer is never double-charged.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>Make the operation idempotent with a client-supplied key + a dedup store, and handle the in-flight/duplicate cases explicitly.</p>",
      },
      {
        label: "Solution",
        html:
          "<ul><li><b>Idempotency key:</b> the client sends a unique <code>Idempotency-Key</code> header per logical charge.</li><li><b>Dedup store:</b> on first request, insert the key (unique constraint) with status <code>in_progress</code>; do the charge; store the result. A duplicate finds the key and returns the <b>original result</b> instead of charging again.</li><li><b>Races:</b> the unique constraint makes concurrent duplicates fail-fast; return the stored response or 409 while in-progress.</li><li><b>Provider:</b> pass the same idempotency key to the payment provider (Stripe et al. support it) for end-to-end safety.</li><li><b>Expiry:</b> keep keys long enough to cover client retry windows.</li></ul>",
      },
    ],
  },
  {
    id: "pr-observability",
    kind: "design",
    title: "Design observability for a Nest service",
    level: "senior",
    tags: ["architecture", "observability"],
    promptHtml:
      "<p>You're on call for a Nest API and latency just spiked. Design the observability you'd want in place to diagnose it in minutes, not hours.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>Cover the four signals (health, metrics, traces, logs), correlate them, and alert on guardrails — including Node-specific metrics like event-loop lag.</p>",
      },
      {
        label: "Solution",
        html:
          "<ul><li><b>Metrics (RED + Node):</b> request rate/errors/duration, plus <b>event-loop lag</b>, heap, GC, and pool saturation — a latency spike with high loop lag points at CPU blocking.</li><li><b>Traces:</b> OpenTelemetry auto-instrumentation; the slow span tells you DB vs downstream vs CPU. Propagate <code>traceparent</code> across services.</li><li><b>Logs:</b> structured JSON (pino) with a correlation id per request, trace id injected so you can pivot log↔trace.</li><li><b>Health:</b> liveness/readiness probes (terminus) so a bad instance is removed/restarted.</li><li><b>Alerting:</b> on p99 latency, error rate, and loop lag — tied to SLOs, not raw CPU.</li></ul>",
      },
    ],
  },

  // ---------------- LIVE-CODING: implement-the-primitive ----------------
  {
    id: "pr-impl-promise-all",
    kind: "coding",
    title: "Implement Promise.all from scratch",
    level: "senior",
    tags: ["Node", "async", "promises"],
    promptHtml:
      "<p>Reimplement <code>Promise.all(promises)</code>: resolve to an array of results <b>in input order</b>, reject as soon as any input rejects (fail-fast), and resolve to <code>[]</code> for an empty array. Don't use the built-in.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<ul><li>Return a new Promise. Track a <code>remaining</code> counter starting at the input length.</li><li>Store each result at its <b>index</b> — resolution order is nondeterministic, so you can't <code>push</code>.</li><li>First rejection calls <code>reject</code> (fail-fast); later settlements are ignored because a Promise settles once.</li><li>Empty input → resolve <code>[]</code> immediately, or the counter never hits zero.</li></ul>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">function promiseAll&lt;T&gt;(promises: Promise&lt;T&gt;[]): Promise&lt;T[]&gt; {\n  return new Promise((resolve, reject) =&gt; {\n    const results: T[] = new Array(promises.length);\n    let remaining = promises.length;\n    if (remaining === 0) return resolve(results); // [] fast path\n    promises.forEach((p, i) =&gt; {\n      Promise.resolve(p).then(\n        (value) =&gt; {\n          results[i] = value;          // by index, not push\n          if (--remaining === 0) resolve(results);\n        },\n        reject,                        // fail-fast on first rejection\n      );\n    });\n  });\n}</div><p><b>Key insight:</b> results go in by index and the counter drives resolution — you never rely on the order promises happen to settle in.</p>",
      },
    ],
  },
  {
    id: "pr-impl-event-emitter",
    kind: "coding",
    title: "Implement a custom EventEmitter",
    level: "senior",
    tags: ["Node", "events", "patterns"],
    promptHtml:
      "<p>Build an <code>EventEmitter</code> with <code>on</code>, <code>off</code>, <code>once</code>, and <code>emit</code>. A <code>once</code> listener fires exactly one time then removes itself. What breaks if a listener calls <code>off</code> during <code>emit</code>?</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<ul><li>Back it with a <code>Map&lt;event, Set&lt;fn&gt;&gt;</code> — a Set dedupes and gives O(1) add/remove.</li><li><code>once</code> wraps the listener; the wrapper removes itself before invoking, so re-entrant emits don't refire it.</li><li><b>Iterate a copy</b> in <code>emit</code> — a listener that calls <code>off</code> (or <code>once</code> self-removing) mutates the live Set mid-iteration.</li></ul>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">class EventEmitter {\n  private map = new Map&lt;string, Set&lt;Function&gt;&gt;();\n\n  on(event: string, fn: Function) {\n    (this.map.get(event) ?? this.map.set(event, new Set()).get(event)!).add(fn);\n    return this;\n  }\n  off(event: string, fn: Function) {\n    this.map.get(event)?.delete(fn);\n    return this;\n  }\n  once(event: string, fn: Function) {\n    const wrap = (...args: unknown[]) =&gt; {\n      this.off(event, wrap);   // remove before calling\n      fn(...args);\n    };\n    return this.on(event, wrap);\n  }\n  emit(event: string, ...args: unknown[]) {\n    const fns = this.map.get(event);\n    if (!fns) return false;\n    [...fns].forEach((fn) =&gt; fn(...args)); // iterate a COPY\n    return true;\n  }\n}</div><p><b>Key insight:</b> emit over a snapshot (<code>[...fns]</code>) so a listener removing itself — or another — mid-dispatch can't corrupt the iteration.</p>",
      },
    ],
  },
  {
    id: "pr-impl-promise-pool",
    kind: "coding",
    title: "Implement a promise pool (concurrency limit)",
    level: "senior",
    tags: ["Node", "async", "concurrency"],
    promptHtml:
      "<p>Write <code>promisePool(thunks, limit)</code> that runs at most <b>N</b> async tasks at once and returns results in input order. Tasks are <b>thunks</b> (<code>() =&gt; Promise</code>), not promises — why does that matter?</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<ul><li>Thunks are lazy: a raw <code>Promise</code> has already started, so you couldn't limit concurrency. A <code>() =&gt; Promise</code> starts only when you call it.</li><li>Spawn N <b>workers</b>; each pulls the next task off a shared cursor until the list is exhausted.</li><li><b>Capture the index before <code>await</code></b> — <code>i++</code> after the await reads a mutated cursor and misplaces results.</li></ul>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">async function promisePool&lt;T&gt;(\n  thunks: Array&lt;() =&gt; Promise&lt;T&gt;&gt;, limit: number,\n): Promise&lt;T[]&gt; {\n  const results: T[] = new Array(thunks.length);\n  let cursor = 0;\n  async function worker() {\n    while (cursor &lt; thunks.length) {\n      const idx = cursor++;          // capture BEFORE await\n      results[idx] = await thunks[idx]();\n    }\n  }\n  const workers = Array.from(\n    { length: Math.min(limit, thunks.length) }, worker,\n  );\n  await Promise.all(workers);\n  return results;\n}</div><p><b>Key insight:</b> N long-lived workers pulling from one shared cursor keeps exactly N tasks in flight — grab the index synchronously before yielding or two workers stomp the same slot.</p>",
      },
    ],
  },
  {
    id: "pr-impl-lru",
    kind: "coding",
    title: "Implement an LRU cache with a Map",
    level: "senior",
    tags: ["Node", "data structures", "caching"],
    promptHtml:
      "<p>Implement an O(1) LRU cache (<code>get</code>/<code>put</code>, fixed capacity) using only a JS <code>Map</code> — no hand-rolled linked list. How does <code>Map</code> give you the recency order for free?</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<ul><li><code>Map</code> preserves <b>insertion order</b> and its <code>keys()</code> iterator yields oldest-first — that's your recency list already.</li><li><code>get</code> a hit: <code>delete</code> then <code>set</code> to move the key to the most-recent end.</li><li><code>put</code> over capacity: evict <code>keys().next().value</code> (the oldest key).</li></ul>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">class LRUCache&lt;K, V&gt; {\n  private map = new Map&lt;K, V&gt;();\n  constructor(private capacity: number) {}\n\n  get(key: K): V | undefined {\n    if (!this.map.has(key)) return undefined;\n    const value = this.map.get(key)!;\n    this.map.delete(key);\n    this.map.set(key, value);        // re-insert = mark most recent\n    return value;\n  }\n  put(key: K, value: V) {\n    if (this.map.has(key)) this.map.delete(key);\n    else if (this.map.size &gt;= this.capacity) {\n      this.map.delete(this.map.keys().next().value); // evict oldest\n    }\n    this.map.set(key, value);\n  }\n}</div><p><b>Key insight:</b> a <code>Map</code>'s insertion order <i>is</i> the recency list — delete+set to promote, <code>keys().next().value</code> to evict, and you skip the linked-list bookkeeping entirely.</p>",
      },
    ],
  },
  {
    id: "pr-impl-token-bucket",
    kind: "coding",
    title: "Implement an in-process token-bucket limiter",
    level: "senior",
    tags: ["Node", "rate limiting", "algorithms"],
    promptHtml:
      "<p>Build a token-bucket rate limiter: capacity <b>C</b>, refill rate <b>R</b> tokens/sec, <code>tryRemove()</code> returns true (allow) or false (→ 429). No <code>setInterval</code>. How do you refill without a timer?</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<ul><li><b>Lazy refill:</b> don't run a timer — on each call, add <code>elapsed × R</code> tokens since the last check, capped at C. Zero cost when idle.</li><li>Allow if <code>tokens &gt;= 1</code>, then decrement; else reject.</li><li>Capacity C is the <b>burst</b> allowance; R is the steady-state rate.</li></ul>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">class TokenBucket {\n  private tokens: number;\n  private last = Date.now();\n  constructor(private capacity: number, private ratePerSec: number) {\n    this.tokens = capacity;\n  }\n  private refill() {\n    const now = Date.now();\n    const elapsed = (now - this.last) / 1000;\n    this.tokens = Math.min(\n      this.capacity, this.tokens + elapsed * this.ratePerSec,\n    );\n    this.last = now;\n  }\n  tryRemove(cost = 1): boolean {\n    this.refill();\n    if (this.tokens &gt;= cost) { this.tokens -= cost; return true; }\n    return false; // caller responds 429\n  }\n}</div><p><b>Key insight:</b> refill lazily from elapsed time instead of a timer — bursts up to C are allowed, the long-run rate is R, and idle buckets cost nothing. For multiple servers, move this into Redis as a Lua script so the refill→check→decrement is atomic.</p>",
      },
    ],
  },
  {
    id: "pr-impl-retry-backoff",
    kind: "coding",
    title: "Implement retry with backoff + jitter",
    level: "senior",
    tags: ["Node", "resilience", "async"],
    promptHtml:
      "<p>Write <code>retry(fn, retries, baseMs)</code> that retries a failing async call with exponential backoff plus jitter, and rethrows the last error after attempts are exhausted.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<ul><li>Loop up to <code>retries</code> times; on throw, sleep <code>base × 2^attempt</code> plus random jitter, then try again.</li><li>After the last attempt, rethrow so the caller sees the real failure.</li><li>Jitter spreads out synchronized clients so retries don't stampede in lockstep.</li></ul>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">const sleep = (ms: number) =&gt; new Promise((r) =&gt; setTimeout(r, ms));\n\nasync function retry&lt;T&gt;(\n  fn: () =&gt; Promise&lt;T&gt;, retries = 3, baseMs = 100,\n): Promise&lt;T&gt; {\n  let lastErr: unknown;\n  for (let attempt = 0; attempt &lt;= retries; attempt++) {\n    try {\n      return await fn();\n    } catch (err) {\n      lastErr = err;\n      if (attempt === retries) break;      // out of tries\n      const backoff = baseMs * 2 ** attempt;\n      const jitter = Math.random() * backoff;\n      await sleep(backoff + jitter);\n    }\n  }\n  throw lastErr; // rethrow after exhaustion\n}</div><p><b>Key insight:</b> exponential backoff plus jitter turns a thundering herd into a spread-out trickle. Follow-ups the interviewer wants: only retry <b>retryable</b> errors (429/5xx, not 4xx), <b>cap</b> the max delay so it can't grow unbounded, and thread an <code>AbortSignal</code> to cancel in-flight retries.</p>",
      },
    ],
  },
  {
    id: "pr-impl-debounce-throttle",
    kind: "coding",
    title: "Implement debounce and throttle",
    level: "senior",
    tags: ["Node", "async", "patterns"],
    promptHtml:
      "<p>Implement <code>debounce(fn, wait)</code> and <code>throttle(fn, wait)</code>. Explain the difference, and make sure both preserve <code>this</code> and the arguments.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<ul><li><b>Debounce:</b> fire once after activity <b>stops</b> — each call <code>clearTimeout</code>s the pending one and restarts the timer. Good for search-as-you-type.</li><li><b>Throttle:</b> fire at most once per window — ignore calls until the window elapses. Good for scroll/resize.</li><li>Preserve <code>this</code> and args with <code>fn.apply(this, args)</code>; use a normal function (not an arrow) so <code>this</code> binds at call time.</li></ul>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">function debounce&lt;A extends unknown[]&gt;(\n  fn: (...args: A) =&gt; void, wait: number,\n) {\n  let timer: ReturnType&lt;typeof setTimeout&gt; | undefined;\n  return function (this: unknown, ...args: A) {\n    clearTimeout(timer);              // reset the countdown\n    timer = setTimeout(() =&gt; fn.apply(this, args), wait);\n  };\n}\n\nfunction throttle&lt;A extends unknown[]&gt;(\n  fn: (...args: A) =&gt; void, wait: number,\n) {\n  let last = 0;\n  return function (this: unknown, ...args: A) {\n    const now = Date.now();\n    if (now - last &gt;= wait) {          // leading edge\n      last = now;\n      fn.apply(this, args);\n    }\n  };\n}</div><p><b>Key insight:</b> debounce waits for a lull (clearTimeout resets it); throttle enforces a fixed cadence (a timestamp gate). This version fires on the <b>leading</b> edge — mention that a trailing-edge variant runs once more after the burst, and that <code>apply(this, args)</code> is what keeps the wrapped call transparent.</p>",
      },
    ],
  },

  // ---------------- SYSTEM DESIGN: queues, delivery, limits ----------------
  {
    id: "pr-design-job-queue",
    kind: "design",
    title: "Design a job queue with retries + dead-letter",
    level: "senior",
    tags: ["architecture", "messaging", "resilience"],
    promptHtml:
      "<p>Design a background job queue: producers enqueue work, workers process it, transient failures retry, and permanently-failing jobs land somewhere safe instead of blocking the queue.</p>",
    reveal: [
      {
        label: "Clarify",
        html:
          "<ul><li>Throughput and latency target — is this seconds-fresh or best-effort background work?</li><li>Delivery guarantee: at-least-once (dedupe downstream) vs exactly-once (much harder)?</li><li>Are jobs <b>idempotent</b>? If not, a retry can double-execute.</li><li>Ordering: strict per-key order, or independent jobs?</li><li>Max retries, backoff shape, and what \"give up\" means (alert? manual replay?).</li></ul>",
      },
      {
        label: "High-level design",
        html:
          "<ul><li><b>States:</b> <code>PENDING → RUNNING → SUCCEEDED</code>, or <code>FAILED → RETRYING</code> (back to RUNNING) until attempts exhaust, then <code>DEAD</code>.</li><li><b>Visibility timeout:</b> a claimed job is hidden for a lease; if the worker dies without ack, the lease expires and another worker re-claims it — so a crash doesn't lose the job.</li><li><b>Retries:</b> increment an attempt counter, requeue with exponential backoff; after N, move to a <b>dead-letter queue</b> (DLQ) with the failure reason.</li><li><b>Idempotent workers:</b> key each job by a stable id and dedupe on it, since at-least-once means the same job can run twice.</li><li><b>DLQ:</b> alert on depth, keep the payload + error for inspection and manual/automated replay.</li></ul>",
      },
      {
        label: "Trade-offs to say out loud",
        html:
          "<div class=\"callout\"><span class=\"lbl\">Trade-off</span> At-least-once + idempotent workers is the pragmatic default; true exactly-once needs a transactional outbox or dedup store and costs latency. A short visibility timeout re-runs slow jobs (duplicate work); a long one delays recovery from a dead worker. Buy a broker (SQS/RabbitMQ/BullMQ-on-Redis) before building your own — the DLQ, backoff, and leases are the value.</div>",
      },
    ],
  },
  {
    id: "pr-design-notifications",
    kind: "design",
    title: "Design a multi-channel notification system",
    level: "senior",
    tags: ["architecture", "messaging", "scalability"],
    promptHtml:
      "<p>Design a system that sends notifications across email, SMS, and push. It must not double-send on retry, must survive a provider outage, and must fan a single event out to many recipients.</p>",
    reveal: [
      {
        label: "Clarify",
        html:
          "<ul><li>Volume and burst shape — a fan-out to millions, or per-user transactional sends?</li><li>Latency: real-time (push) vs digestible (batched email)?</li><li>User preferences / quiet hours / opt-outs per channel?</li><li>Delivery guarantee and dedup window — how do we define \"same notification\"?</li><li>Do we need delivery/read receipts and per-channel fallback (push fails → email)?</li></ul>",
      },
      {
        label: "High-level design",
        html:
          "<ul><li><b>Ingest:</b> an event hits a notification service that resolves recipients + preferences, then <b>fans out</b> one message per (user, channel).</li><li><b>Per-channel queues:</b> separate email/SMS/push queues so a slow or down provider back-pressures only its own channel, and each can scale workers independently.</li><li><b>Dedup / idempotency keys:</b> each notification carries a stable key (event id + user + channel); workers check it before sending so a retry can't double-send.</li><li><b>Providers:</b> channel workers call SendGrid/Twilio/FCM; on failure retry with backoff, then <b>DLQ</b> for inspection and replay.</li><li><b>Preferences + templating:</b> centralize opt-outs, quiet hours, and rendering so every channel is consistent.</li></ul>",
      },
      {
        label: "Trade-offs to say out loud",
        html:
          "<div class=\"callout\"><span class=\"lbl\">Trade-off</span> Queues buy resilience but add eventual-consistency latency — fine for notifications. At-least-once delivery means the idempotency key is doing the real work; without it, retries spam users. Per-channel isolation costs more moving parts than one queue but stops one flaky provider from stalling the rest. The DLQ is non-negotiable — it's the difference between a lost notification and a replayable one.</div>",
      },
    ],
  },
  {
    id: "pr-design-rate-limiter",
    kind: "design",
    title: "Design a distributed rate limiter",
    level: "senior",
    tags: ["architecture", "rate limiting", "Redis"],
    promptHtml:
      "<p>Design a rate limiter for an API behind N app instances: e.g. 100 requests/min per API key, enforced consistently no matter which instance a request hits. Return 429 with a <code>Retry-After</code> when exceeded.</p>",
    reveal: [
      {
        label: "Clarify",
        html:
          "<ul><li>Limit key — per API key, per user, per IP, or a combination?</li><li>Burst tolerance: is a short spike acceptable (token bucket) or must the window be strict (sliding window)?</li><li>Global limit across all instances, or per-instance is good enough?</li><li>Fail-open (allow on limiter outage) or fail-closed (reject)?</li><li>Accuracy vs cost — is an approximate limit fine at high RPS?</li></ul>",
      },
      {
        label: "High-level design",
        html:
          "<ul><li><b>Shared store:</b> per-instance counters can't enforce a global limit — keep state in <b>Redis</b> so all N instances agree.</li><li><b>Algorithm:</b> <b>token bucket</b> (allows bursts up to capacity, smooth refill) vs <b>sliding-window</b> counter (strict, no boundary spikes at the window edge). Token bucket is the common default.</li><li><b>Atomicity:</b> the check-and-decrement must be atomic or two concurrent requests both read \"1 left\" and both pass — run it as a <b>Lua script</b> in Redis (executed atomically), keyed by the API key, with a PEXPIRE.</li><li><b>Response:</b> on reject return <code>429</code> with <code>Retry-After</code> and <code>X-RateLimit-Remaining/-Reset</code> headers so clients back off.</li><li><b>Placement:</b> enforce at the gateway/edge for cheap global limits; per-service limits for fine-grained control.</li></ul>",
      },
      {
        label: "Trade-offs to say out loud",
        html:
          "<div class=\"callout\"><span class=\"lbl\">Trade-off</span> Redis makes it consistent across instances but adds a network hop per request and a single dependency — decide <b>fail-open vs fail-closed</b> if it's unreachable (usually fail-open so the limiter can't take down the API). Token bucket permits bursts; sliding window is stricter but costs more memory/compute. At extreme RPS, a small per-instance local allowance synced to Redis trades exactness for latency.</div>",
      },
    ],
  },
];
