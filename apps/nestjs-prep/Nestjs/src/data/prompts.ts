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
];
