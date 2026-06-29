// Study guide — NestJS sections (01–20). Long-form HTML rendered via <RichText>.
export type StudySection = { id: string; num: string; title: string; html: string };

export const STUDY_INTRO_HTML =
  "<span class=\"lbl\">How to use this</span> Each topic explains the concept at the depth a senior NestJS / Node.js interview expects, then gives a <b>“how to say it”</b> line — the crisp sentence to deliver out loud. Read for understanding first; rehearse the one-liners last. Everything is current to <b>NestJS 11</b> and <b>Node.js 24 LTS</b>.";

export const STUDY_SECTIONS: StudySection[] = [
  {
    id: "st-1",
    num: "01",
    title: "01 · NestJS, TypeScript & the framework model",
    html:
      "<p><b>What they want:</b> you understand <i>why</i> Nest exists. It's a progressive, opinionated Node.js framework written in TypeScript that sits on an HTTP adapter (Express by default, or Fastify) and adds an <b>IoC/DI container</b>, a module system, and decorators. It solves the architecture gap Express leaves open.</p>" +
      "<p>Nest combines OOP, FP, and FRP (RxJS in interceptors/microservices). It leans on TypeScript's emitted <b>decorator metadata</b> (<code>reflect-metadata</code>) to know a constructor parameter's type — which is the injection token. That's why <code>tsconfig</code> needs <code>experimentalDecorators</code> + <code>emitDecoratorMetadata</code>, and why DI works on classes, not interfaces.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Nest is structure and dependency injection on top of Node's HTTP layer — Express with an opinionated architecture, written in TypeScript and modeled on Angular's module/provider system.”</div>",
  },
  {
    id: "st-2",
    num: "02",
    title: "02 · Modules & encapsulation",
    html:
      "<p><b>Core:</b> a module (<code>@Module</code>) groups related controllers and providers; the app is a tree of modules rooted at <code>AppModule</code>. Providers are <b>private to their module</b> unless <b>exported</b>; <code>exports</code> is the module's public API and <code>imports</code> brings another module's exports in.</p>" +
      "<ul><li>Every module is a singleton — export a provider once and all importers share <b>one instance</b>.</li><li>Listing the same class in two modules' <code>providers</code> creates <b>two instances</b> (a state-sharing bug).</li><li><code>@Global()</code> exposes exports everywhere without importing — reserve it for cross-cutting infra (config, DB, logging); overusing it hides coupling.</li></ul>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Modules give you encapsulation: a provider is private until I export it. I keep boundaries explicit and avoid <code>@Global()</code> except for true infrastructure.”</div>",
  },
  {
    id: "st-3",
    num: "03",
    title: "03 · Controllers & routing",
    html:
      "<p><b>Core:</b> controllers (<code>@Controller('users')</code>) map routes to handlers (<code>@Get(':id')</code>, <code>@Post()</code>). Return a value and Nest serializes it to JSON (200, or 201 for POST). Read inputs with <code>@Param</code>, <code>@Query</code>, <code>@Body</code>, <code>@Headers</code>, often combined with a pipe (<code>@Param('id', ParseIntPipe)</code>).</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> Injecting <code>@Res()</code> switches to Express-mode: you must send the response yourself and lose interceptors/<code>@HttpCode</code>. Use <code>@Res({ passthrough: true })</code> if you only need to set a cookie/header.</div>" +
      "<div class=\"callout warn\"><span class=\"lbl\">NestJS 11</span> Express 5 changed wildcard routing — bare <code>*</code> must be named: <code>@Get('files/*')</code> → <code>@Get('files/*splat')</code>.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Controllers are the thin HTTP layer — parse and delegate. The real work lives in injected services.”</div>",
  },
  {
    id: "st-4",
    num: "04",
    title: "04 · Providers & dependency injection",
    html:
      "<p><b>Core:</b> a provider is anything injectable (<code>@Injectable()</code> services, repositories, factories, values). A consumer declares a dependency by type in its constructor; that type is the <b>token</b>. The module registers a provider for the token; at bootstrap the container builds the graph transitively and instantiates bottom-up, caching singletons.</p>" +
      "<p>Custom providers give you control:</p><table><tr><th>Provider</th><th>Use</th></tr>" +
      "<tr><td><code>useClass</code></td><td>Resolve a token to a class (swap by env).</td></tr>" +
      "<tr><td><code>useValue</code></td><td>Inject a constant / mock / external instance.</td></tr>" +
      "<tr><td><code>useFactory</code></td><td>Build dynamically (async ok), inject deps via <code>inject:[]</code>.</td></tr>" +
      "<tr><td><code>useExisting</code></td><td>Alias a token to an existing one (same singleton).</td></tr></table>" +
      "<p>Inject non-class deps (interfaces, config) via a string/symbol token + <code>@Inject(TOKEN)</code> — the ports-and-adapters mechanic.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “DI means classes declare what they need and the container provides it. I depend on interfaces via tokens so implementations are swappable and mockable.”</div>",
  },
  {
    id: "st-5",
    num: "05",
    title: "05 · Injection scopes & lifecycle",
    html:
      "<p><b>Core:</b> three scopes — <b>DEFAULT</b> (singleton, recommended), <b>REQUEST</b> (per request), <b>TRANSIENT</b> (per consumer). Singletons are safe because Node isn't thread-per-request; only store request-specific state in REQUEST scope (or better, AsyncLocalStorage).</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">The cost of REQUEST</span> It <b>bubbles up</b> — a request-scoped leaf makes its consumers (up to the controller) request-scoped, adding per-request allocation/GC. A shared DB/logger going request-scoped can convert the whole app. Use <b>durable providers</b> + a tenant <code>ContextIdStrategy</code> to recover performance.</div>" +
      "<p><b>Lifecycle hooks</b> (order): <code>onModuleInit</code> → <code>onApplicationBootstrap</code> → [running] → <code>onModuleDestroy</code> → <code>beforeApplicationShutdown</code> → <code>onApplicationShutdown</code>. Shutdown hooks fire only after <code>app.enableShutdownHooks()</code>; they don't run for request-scoped providers.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “I default to singletons and reach for request scope only for genuine per-request state — and I know it bubbles, so I prefer AsyncLocalStorage for context.”</div>",
  },
  {
    id: "st-6",
    num: "06",
    title: "06 · Dynamic modules & configuration",
    html:
      "<p><b>Core:</b> a dynamic module returns its metadata from a static method so it can be configured. Convention: <code>register()</code> = per-importer, <code>forRoot()</code> = once app-wide, <code>forFeature()</code> = per-feature tweak of a <code>forRoot</code>. Each has an async variant (<code>forRootAsync</code>) taking <code>useFactory</code>+<code>inject</code> so options can come from <code>ConfigService</code>.</p>" +
      "<p>The modern implementation is <b><code>ConfigurableModuleBuilder</code></b>, which auto-generates the base class, the options token, and the sync/async signatures — removing hand-written boilerplate.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">NestJS 11</span> Importing the same dynamic module twice with deeply-equal config now yields <b>separate</b> instances — assign <code>const m = X.forRoot({...})</code> to a variable and reuse it to share one.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “forRoot configures a module once globally; forFeature tweaks it per feature; the async variants inject config. I use ConfigurableModuleBuilder so I'm not hand-writing forRootAsync.”</div>",
  },
  {
    id: "st-7",
    num: "07",
    title: "07 · The request lifecycle",
    html:
      "<p><b>Memorize this:</b> Incoming request → <b>Middleware</b> → <b>Guards</b> → <b>Interceptors (pre)</b> → <b>Pipes</b> → <b>Handler</b> (→ Service) → <b>Interceptors (post)</b> → <b>Exception filters</b> → Response. Within each level it's global → controller → route; interceptors unwind on the way out, and filters are the only enhancer that resolves route → controller → global.</p>" +
      "<table><tr><th>Block</th><th>Job · has ExecutionContext?</th></tr>" +
      "<tr><td>Middleware</td><td>Pre-routing raw req/res — no context</td></tr>" +
      "<tr><td>Guard</td><td>Authorization — yes (Reflector)</td></tr>" +
      "<tr><td>Interceptor</td><td>AOP before/after (RxJS) — yes</td></tr>" +
      "<tr><td>Pipe</td><td>Validate/transform args — metadata only</td></tr>" +
      "<tr><td>Filter</td><td>Shape errors — ArgumentsHost only</td></tr></table>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Middleware, guards, interceptors, pipes, handler, interceptors again, then filters on error. Only guards and interceptors get the ExecutionContext.”</div>",
  },
  {
    id: "st-8",
    num: "08",
    title: "08 · Pipes & validation",
    html:
      "<p><b>Core:</b> pipes (<code>transform(value, metadata)</code>) validate and transform handler args, running just before the handler inside the exceptions zone. The global <code>ValidationPipe</code> + class-validator on <b>class</b> DTOs is the backbone:</p>" +
      "<div class=\"code\">app.useGlobalPipes(new ValidationPipe({\n  whitelist: true,            // strip undecorated props\n  forbidNonWhitelisted: true, // throw on unknown props\n  transform: true,            // build DTO instance + coerce\n}));</div>" +
      "<p><code>whitelist</code>/<code>forbidNonWhitelisted</code> defend against <b>mass-assignment</b>. Nested objects need <code>@ValidateNested()</code> + <code>@Type(() =&gt; Dto)</code>. Built-in parse pipes: <code>ParseIntPipe</code>, <code>ParseUUIDPipe</code>, <code>ParseArrayPipe</code>, and v11's <code>ParseDatePipe</code>.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Trap</span> DTOs must be classes; <code>import type</code> erases them and validation silently no-ops.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “A global ValidationPipe with whitelist + transform validates class DTOs and blocks mass-assignment — bad input becomes a 400 before my handler runs.”</div>",
  },
  {
    id: "st-9",
    num: "09",
    title: "09 · Guards & authorization",
    html:
      "<p><b>Core:</b> a guard (<code>canActivate(ctx)</code> → boolean) decides whether a request proceeds — the home of <b>authorization</b>. Because it has an <code>ExecutionContext</code>, it reads route metadata via <code>Reflector</code>:</p>" +
      "<div class=\"code\">const roles = this.reflector.getAllAndOverride(ROLES_KEY,\n  [ctx.getHandler(), ctx.getClass()]);</div>" +
      "<p><b>RBAC</b>: <code>@Roles('admin')</code> + a <code>RolesGuard</code> comparing to <code>req.user.roles</code>. <b>Global-auth pattern</b>: register the JWT guard as <code>APP_GUARD</code> (everything protected), add <code>@Public()</code> and short-circuit on it. For per-resource rules step up to <b>ABAC with CASL</b>.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Guards do authorization. I make routes protected-by-default via APP_GUARD with a @Public() escape hatch, and use the Reflector for role checks.”</div>",
  },
  {
    id: "st-10",
    num: "10",
    title: "10 · Interceptors",
    html:
      "<p><b>Core:</b> interceptors wrap the handler in an RxJS stream (<code>intercept(ctx, next)</code> → Observable), giving before/after logic around <code>next.handle()</code>. Skip <code>next.handle()</code> to override (caching).</p>" +
      "<ul><li>Transform responses — <code>map(d =&gt; ({ data: d }))</code></li><li>Logging/timing — <code>tap(...)</code></li><li>Timeouts — <code>timeout(5000)</code> + <code>catchError</code></li><li>Serialization — <code>ClassSerializerInterceptor</code> (<code>@Exclude/@Expose</code>)</li></ul>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Interceptors are AOP: I use them for response envelopes, timing, timeouts, caching, and serialization — anything that wraps the handler.”</div>",
  },
  {
    id: "st-11",
    num: "11",
    title: "11 · Exception filters & error handling",
    html:
      "<p><b>Core:</b> throw <code>HttpException</code> subclasses (<code>NotFoundException</code>, <code>BadRequestException</code>) and Nest's built-in filter shapes the response; unknown errors → 500. A custom filter (<code>@Catch()</code> + <code>catch(exception, host)</code>) lets you standardize the error body, log, and map domain errors to HTTP.</p>" +
      "<p><b>AllExceptionsFilter</b> pattern: <code>@Catch()</code> (everything) + inject <code>HttpAdapterHost</code>; use <code>ArgumentsHost</code> so it works across HTTP/WS/RPC. Extend <code>BaseExceptionFilter</code> and call <code>super.catch()</code> to keep defaults while adding logging.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “I throw typed HttpExceptions for expected failures and use a global AllExceptionsFilter to standardize the error envelope and centralize logging.”</div>",
  },
  {
    id: "st-12",
    num: "12",
    title: "12 · Middleware",
    html:
      "<p><b>Core:</b> middleware runs first, with raw <code>req/res/next</code> — logging, CORS, helmet, body parsing, attaching a request id. Class middleware (<code>NestMiddleware</code>) is DI-capable; functional middleware has no deps. Apply via <code>configure(consumer)</code>: <code>consumer.apply(LoggerMiddleware).forRoutes('users')</code>.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Limitation</span> Middleware has <b>no ExecutionContext</b> — it can't know the target handler or read its metadata. For anything route-aware, use a guard or interceptor. Global <code>app.use()</code> middleware can't use DI.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Middleware is for cross-cutting request setup that doesn't need to know the handler — logging, helmet, request ids. Route-aware logic goes in guards/interceptors.”</div>",
  },
  {
    id: "st-13",
    num: "13",
    title: "13 · Configuration & secrets",
    html:
      "<p><b>Core:</b> <code>@nestjs/config</code> loads <code>.env</code> + merges <code>process.env</code> (real env wins). Make it global, cache it, and <b>validate at boot</b> with Joi/zod so a misconfigured deploy crashes immediately instead of failing at request time. Namespace with <code>registerAs('db', ...)</code> for typed, modular config.</p>" +
      "<p><b>12-factor:</b> config that varies per deploy lives in the environment, not the repo. <code>.env</code> is local-dev only (gitignored + dockerignored); prod secrets come from a manager (k8s Secrets, AWS Secrets Manager, Vault). Node 20+ can load env natively with <code>--env-file</code>.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Config is validated at startup so we fail fast, secrets come from a manager not the repo, and I namespace config for type safety.”</div>",
  },
  {
    id: "st-14",
    num: "14",
    title: "14 · Databases & the repository pattern",
    html:
      "<p><b>Core:</b> Nest integrates TypeORM, Prisma, and Mongoose. TypeORM: <code>forRoot</code> configures the <b>DataSource</b>, <code>forFeature([Entity])</code> registers per module, inject <code>@InjectRepository(User)</code>. Prisma: wrap the generated client in a <code>PrismaService</code> (connect in <code>onModuleInit</code>). Mongoose: <code>@InjectModel</code> over <code>@Schema</code> classes.</p>" +
      "<p>The <b>repository pattern</b> keeps the app talking to repositories, not the raw ORM/SQL — so you can swap the store, add caching, and map rows to domain models at the boundary. Don't leak entities (with secrets/relations) straight into API responses.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">#1 gotcha</span> TypeORM <code>synchronize: true</code> auto-alters the schema and can drop data — never in production. Use migrations.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “I go through repositories and map to domain models at the boundary, run migrations (never synchronize in prod), and keep entities out of the API contract.”</div>",
  },
  {
    id: "st-15",
    num: "15",
    title: "15 · Transactions & data integrity",
    html:
      "<p><b>Core:</b> wrap multi-step writes in a transaction so they commit or roll back atomically. TypeORM gives three ways: a <code>QueryRunner</code> (most control, must <code>release()</code> in <code>finally</code>), the callback <code>dataSource.transaction(async mgr =&gt; ...)</code> (auto commit/rollback), or the community <code>typeorm-transactional</code> decorator. Every operation must share the <b>same EntityManager</b> or it runs outside the transaction.</p>" +
      "<p>Across services you can't use a DB transaction — use the <b>Saga</b> pattern (compensating actions) and the <b>transactional outbox</b> for reliable event publishing, with idempotent consumers.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “In-service, I use a transaction with a shared EntityManager. Across services there's no 2PC — I use sagas with compensations and an outbox for atomic event publishing.”</div>",
  },
  {
    id: "st-16",
    num: "16",
    title: "16 · Authentication (JWT / Passport)",
    html:
      "<p><b>Core:</b> issue a <b>short-lived access token</b> on login (<code>JwtService.signAsync</code>, id in <code>sub</code>) and verify it in a guard on protected routes. With Passport, a <code>JwtStrategy</code> extracts and validates the token (return value → <code>req.user</code>) and you protect with <code>AuthGuard('jwt')</code>; without Passport, a hand-rolled guard uses <code>JwtService</code> directly.</p>" +
      "<p>Pair access tokens with <b>refresh tokens</b> (rotated, stored, revocable) since JWTs can't be revoked before expiry. Hash passwords with <b>bcrypt/argon2</b> (never store plaintext or reversible).</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Short-lived JWT access tokens plus rotating refresh tokens, verified in a global guard with a @Public() opt-out, passwords hashed with bcrypt/argon2.”</div>",
  },
  {
    id: "st-17",
    num: "17",
    title: "17 · Caching",
    html:
      "<p><b>Core:</b> <code>@nestjs/cache-manager</code> (v11 is Keyv-based) gives manual caching (<code>@Inject(CACHE_MANAGER)</code> → <code>get/set/del</code>) and automatic GET caching (<code>CacheInterceptor</code>). Patterns: <b>cache-aside</b> (check → miss → DB → set TTL → invalidate on write), read-through, write-through. Name <b>stale-while-revalidate</b> for instant reads + background refresh.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">At scale</span> The default store is in-memory (per-instance). Use a Redis store (KeyvRedis) so all replicas share the cache, and scope keys (e.g. by tenant). Guard against cache stampede with a lock or jittered TTL. TTLs are in <b>milliseconds</b>; <code>get()</code> returns <code>undefined</code> on miss in v11.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Cache-aside with Redis so it's shared across instances, TTL + delete-on-write invalidation, and stampede protection for hot keys.”</div>",
  },
  {
    id: "st-18",
    num: "18",
    title: "18 · Queues & background jobs",
    html:
      "<p><b>Core:</b> move heavy/slow work off the request path with <b>BullMQ</b> (<code>@nestjs/bullmq</code>, Redis-backed). Producer adds jobs (<code>q.add('name', data, { attempts, backoff, delay, priority })</code>); a <code>@Processor</code> extends <code>WorkerHost</code> and routes by <code>job.name</code> in <code>process()</code>. You get retries, backoff, delays, priorities, and durable persistence.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Idempotency</span> Delivery is at-least-once — a job can run twice (crash before ack). Make processors idempotent (dedupe key / upsert), set timeouts above p99, and route exhausted retries to a DLQ with alerting. In BullMQ, <code>@Process('name')</code> does <b>not</b> work — switch on <code>job.name</code>.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “CPU-bound or slow work goes to a BullMQ queue with retries and backoff; consumers are idempotent because delivery is at-least-once, and dead jobs land in a DLQ.”</div>",
  },
  {
    id: "st-19",
    num: "19",
    title: "19 · Task scheduling & events",
    html:
      "<p><b>Core:</b> <code>@nestjs/schedule</code> gives <code>@Cron()</code>, <code>@Interval()</code>, <code>@Timeout()</code> and a <code>SchedulerRegistry</code> for dynamic jobs. <code>@nestjs/event-emitter</code> gives in-process pub/sub (<code>emit</code> / <code>@OnEvent</code>) for decoupling side effects from the main flow.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Multi-replica trap</span> Cron runs per-instance — with N replicas every instance fires. Use a distributed lock or enqueue a single job so it runs once. The event emitter is synchronous and non-durable — for cross-service or reliable delivery use a queue/broker.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “In-process events for decoupling; a distributed lock or a queue for scheduled work so a cron doesn't fire on every replica.”</div>",
  },
  {
    id: "st-20",
    num: "20",
    title: "20 · Testing strategy",
    html:
      "<p><b>Core:</b> <code>@nestjs/testing</code> builds a DI graph you can override. Unit: <code>Test.createTestingModule({...}).overrideProvider(X).useValue(mock).compile()</code>, then <code>module.get()</code> (or <code>resolve()</code> for scoped). E2E: <code>createNestApplication()</code> → <code>init()</code> → drive with <b>supertest</b> → <code>app.close()</code>.</p>" +
      "<p>The pyramid: many fast unit tests (mock collaborators) → fewer integration tests (real DB/Redis via <b>Testcontainers</b>) → a few e2e. Test the five outcomes of a flow: response, DB change, outgoing call, queued message, observability.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">NestJS 12</span> Vitest is slated to replace Jest as the default runner — the patterns (createTestingModule, overrides, supertest) stay the same.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Mostly fast unit tests with overridden providers, integration tests against real Postgres/Redis via Testcontainers, and a thin e2e layer with supertest.”</div>",
  },
];
