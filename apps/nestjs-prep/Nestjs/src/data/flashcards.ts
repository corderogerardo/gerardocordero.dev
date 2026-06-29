// NestJS fundamentals flashcards: core, DI & modules, request lifecycle, config.
// Shapes mirror @gerardocordero/prep-kit's Flashcard type (structural typing).
import type { Level } from "@/lib/levels";

export type Flashcard = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  answerHtml: string;
  level?: Level;
};

export const FLASHCARDS: Flashcard[] = [
  // ---------------- CORE ----------------
  {
    id: "c1",
    category: "core",
    categoryLabel: "Core",
    level: "junior",
    question: "What is NestJS, and what problem does it solve?",
    answerHtml:
      "<p>NestJS is a <b>progressive, opinionated Node.js framework</b> for building server-side applications, written in TypeScript. It sits on top of an HTTP adapter (<b>Express by default</b>, or Fastify) and adds a first-class <b>IoC/dependency-injection container</b>, a module system, and decorators.</p><p>It solves the <i>architecture</i> problem Express leaves open: Express gives you routing and middleware but no opinion on structure, so large apps drift into spaghetti. Nest borrows Angular's module/provider/decorator model to give you <b>testable, loosely-coupled, consistently-organized</b> code.</p><div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Nest is structure and DI on top of Node's HTTP layer — it's Express with an architecture, not a replacement for it.”</div>",
  },
  {
    id: "c2",
    category: "core",
    categoryLabel: "Core",
    level: "junior",
    question: "What are the three core building blocks: module, controller, provider?",
    answerHtml:
      "<ul><li><b>Module</b> (<code>@Module</code>) — an organizational unit that groups related controllers and providers; the app is a tree of modules.</li><li><b>Controller</b> (<code>@Controller</code>) — handles incoming requests and returns responses; declares routes with <code>@Get/@Post/...</code>.</li><li><b>Provider</b> (<code>@Injectable</code>) — anything injectable: services, repositories, factories. Holds business logic and is injected into controllers or other providers.</li></ul><div class=\"callout tip\"><span class=\"lbl\">Mental model</span> Controller = thin HTTP layer; Provider/Service = logic; Module = the box that wires them together and decides what's shared.</div>",
  },
  {
    id: "c3",
    category: "core",
    categoryLabel: "Core",
    level: "junior",
    question: "What does a controller do, and how does Nest serialize the return value?",
    answerHtml:
      "<p>A controller maps routes to handler methods. You return a plain value (object, array, string) and Nest <b>auto-serializes it to JSON</b> with status <b>200</b> (or <b>201</b> for <code>@Post</code>). Override with <code>@HttpCode()</code>.</p><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> Injecting <code>@Res()</code> switches to <b>library-specific (Express) mode</b>: you must send the response yourself and you <i>lose</i> interceptors and <code>@HttpCode</code>. Use <code>@Res({ passthrough: true })</code> if you only need to set a header/cookie but want Nest to still handle the body.</div>",
  },
  {
    id: "c4",
    category: "core",
    categoryLabel: "Core",
    question: "Why must DTOs be classes, not interfaces?",
    answerHtml:
      "<p>TypeScript <b>interfaces are erased at compile time</b> — they don't exist at runtime. Nest's <code>ValidationPipe</code> and class-validator need the <b>metatype</b> (the actual class) at runtime to read decorators and validate. A class survives compilation, so the pipe can instantiate and check it.</p><div class=\"callout warn\"><span class=\"lbl\">Trap</span> Using an interface (or <code>import type</code> on a DTO) means validation silently does nothing — no error, just no protection.</div>",
  },
  {
    id: "c5",
    category: "core",
    categoryLabel: "Core",
    question: "What is module encapsulation? How do you share a provider?",
    answerHtml:
      "<p>A provider is <b>private to its module</b> by default. To use it elsewhere, the owning module must <b>export</b> it, and the consuming module must <b>import</b> that module. <code>exports</code> is a module's public API.</p><ul><li>Every module is a <b>singleton</b>: export a provider once and all importers share the same instance.</li><li>Re-registering the same class in two modules' <code>providers</code> creates <b>two separate instances</b> — a classic state-sharing bug.</li><li>A module can <b>re-export</b> modules it imports.</li></ul>",
  },
  {
    id: "c6",
    category: "core",
    categoryLabel: "Core",
    question: "When should you use a @Global() module, and why is it discouraged as a default?",
    answerHtml:
      "<p><code>@Global()</code> makes a module's exported providers available everywhere without importing it — register once (e.g. a config or DB module).</p><div class=\"callout warn\"><span class=\"lbl\">Senior caveat</span> It <b>hides coupling</b>: every module silently depends on it, which hurts testability and makes the dependency graph implicit. Prefer explicit <code>imports</code>; reserve <code>@Global()</code> for truly cross-cutting infrastructure (config, logging, DB).</div>",
  },
  {
    id: "c7",
    category: "core",
    categoryLabel: "Core",
    question: "Express vs Fastify adapter in NestJS — when does Fastify win, and what breaks?",
    answerHtml:
      "<p>Nest is platform-agnostic via an <b>HTTP adapter</b>. Express is the default (huge ecosystem). <b>Fastify</b> (<code>@nestjs/platform-fastify</code>) is roughly <b>2× requests/sec</b> via schema-based serialization (<code>fast-json-stringify</code>) and radix-tree routing.</p><p><b>Choose Fastify</b> for high-throughput, JSON-heavy, latency-sensitive APIs. <b>What breaks:</b> Express middleware gets raw <code>req/res</code> (not Express wrappers), Multer file upload is incompatible (use <code>@fastify/multipart</code>), no subdomain routing, use <code>@fastify/helmet</code>/<code>@fastify/compress</code>, and bind <code>0.0.0.0</code> in containers.</p>",
  },
  {
    id: "c8",
    category: "core",
    categoryLabel: "Core",
    question: "What does the Nest CLI give you, and what is the standard project layout?",
    answerHtml:
      "<p>The CLI (<code>@nestjs/cli</code>) scaffolds and builds: <code>nest new</code>, <code>nest generate module|controller|service|resource</code> (the <code>resource</code> schematic generates a full CRUD module). It wraps the build (tsc or <b>SWC</b> for fast builds) and <code>nest start --watch</code>.</p><p>Conventional layout: one folder per feature module (<code>users/</code> with <code>users.module.ts</code>, <code>users.controller.ts</code>, <code>users.service.ts</code>, <code>dto/</code>, <code>entities/</code>), a root <code>AppModule</code>, and <code>main.ts</code> as the bootstrap entry point.</p>",
  },
  {
    id: "c9",
    category: "core",
    categoryLabel: "Core",
    question: "What happens in main.ts (the bootstrap file)?",
    answerHtml:
      "<p><code>main.ts</code> creates and starts the app:</p><div class=\"code\">const app = await NestFactory.create(AppModule);\napp.useGlobalPipes(new ValidationPipe({ whitelist: true }));\napp.enableShutdownHooks();\nawait app.listen(3000);</div><p>It's where you register <b>global</b> pipes/filters/interceptors (the non-DI way), enable CORS/versioning/shutdown hooks, set a global prefix, and start listening. For DI-aware globals, use the <code>APP_*</code> provider tokens instead.</p>",
  },
  {
    id: "c10",
    category: "core",
    categoryLabel: "Core",
    question: "What is the AppModule and the application graph?",
    answerHtml:
      "<p><code>AppModule</code> is the root module passed to <code>NestFactory.create()</code>. From its metadata Nest builds the <b>application graph</b> — the full tree of modules and the dependency graph of providers within them. At bootstrap Nest walks this graph and instantiates providers <b>bottom-up</b> (dependencies first), caching singletons.</p>",
  },
  {
    id: "c11",
    category: "core",
    categoryLabel: "Core",
    question: "How do you read route params, query, body, and headers?",
    answerHtml:
      "<p>Parameter decorators in the handler signature:</p><ul><li><code>@Param('id')</code> — route param (<code>/users/:id</code>)</li><li><code>@Query('q')</code> — query string</li><li><code>@Body()</code> — request body (typed to a DTO)</li><li><code>@Headers('authorization')</code>, <code>@Req()</code>, <code>@Ip()</code>, <code>@Session()</code></li></ul><p>Combine with pipes: <code>@Param('id', ParseIntPipe) id: number</code> validates + coerces.</p>",
  },
  {
    id: "c12",
    category: "core",
    categoryLabel: "Core",
    question: "Why is TypeScript decorator metadata (reflect-metadata) central to Nest?",
    answerHtml:
      "<p>Nest reads <b>design-time type metadata</b> emitted by TypeScript (<code>emitDecoratorMetadata</code> + <code>reflect-metadata</code>) to know a constructor parameter's type — that's the <b>injection token</b>. Decorators like <code>@Injectable()</code>, <code>@Controller()</code>, and <code>@Get()</code> attach metadata that Nest later reflects over to build routes and resolve dependencies.</p><div class=\"callout\"><span class=\"lbl\">Why it matters</span> This is why a class type (not an interface) is needed for DI, and why <code>tsconfig</code> must have <code>experimentalDecorators</code> + <code>emitDecoratorMetadata</code>.</div>",
  },
  {
    id: "c13",
    category: "core",
    categoryLabel: "Core",
    question: "How does NestJS relate to Angular, and why does that matter?",
    answerHtml:
      "<p>Nest deliberately mirrors <b>Angular's</b> ergonomics on the server: modules, decorators, providers, and a DI container. The payoff is a <b>consistent mental model</b> across full-stack TS teams and a mature pattern for organizing large apps. It's not Angular under the hood — it's an independent framework that borrowed the good ideas.</p>",
  },
  {
    id: "c14",
    category: "core",
    categoryLabel: "Core",
    question: "What's new/important in NestJS 11 (current line)?",
    answerHtml:
      "<ul><li><b>Express v5 &amp; Fastify v5</b> are the defaults. Express 5 changes route matching: bare <code>*</code> wildcards must be <b>named</b> — <code>@Get('users/*')</code> → <code>@Get('users/*splat')</code>.</li><li><b>Logger overhaul</b>: <code>ConsoleLogger</code> gains built-in JSON logging (<code>new ConsoleLogger({ json: true })</code>).</li><li><b>Faster startup</b> via reference-based module keys (gotcha: importing the same dynamic module twice with equal config now yields separate instances — assign to a variable and reuse).</li><li><b>cache-manager v6+</b> built on <b>Keyv</b>; microservice transporters gain <code>status</code>, <code>unwrap()</code>, and <code>on(event)</code>.</li><li>Requires <b>Node ≥ 20</b>.</li></ul>",
  },

  // ---------------- DI & MODULES ----------------
  {
    id: "di1",
    category: "di",
    categoryLabel: "DI & Modules",
    level: "mid",
    question: "What is dependency injection, and how does Nest's IoC container resolve it?",
    answerHtml:
      "<p>DI = a class declares what it <i>needs</i> (via constructor params) and the framework <b>provides</b> it, instead of the class <code>new</code>-ing its own dependencies (Inversion of Control). Benefits: loose coupling, easy mocking, single shared instances.</p><p>Resolution: <code>@Injectable()</code> marks a class as managed → a consumer declares the dependency <b>by type (the token)</b> → the module registers a provider for that token → at bootstrap Nest builds the graph transitively and instantiates bottom-up, caching singletons. <code>NEST_DEBUG=1</code> logs resolution.</p>",
  },
  {
    id: "di2",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "Explain the three injection scopes and the cost of REQUEST scope.",
    answerHtml:
      "<table><tr><th>Scope</th><th>Lifetime</th></tr><tr><td><b>DEFAULT</b> (singleton)</td><td>One instance app-wide, created at bootstrap. The recommended default.</td></tr><tr><td><b>REQUEST</b></td><td>A new instance per incoming request, GC'd after. For per-request state.</td></tr><tr><td><b>TRANSIENT</b></td><td>A dedicated instance per consumer (not shared).</td></tr></table><div class=\"callout warn\"><span class=\"lbl\">The cost</span> REQUEST scope <b>bubbles up</b>: if a deep provider is request-scoped, every consumer up to the controller becomes request-scoped too, adding per-request allocation/GC and disabling some startup optimizations. A shared DB/logger going request-scoped can convert the whole app. Mitigate with <b>durable providers</b> + a tenant <code>ContextIdStrategy</code>, or use AsyncLocalStorage/CLS for request context.</div>",
  },
  {
    id: "di3",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "Is singleton state safe across requests in Node/Nest?",
    answerHtml:
      "<p><b>Yes</b> — Node is single-threaded and <i>not</i> thread-per-request, so a singleton service (DB pool, cache, config) is safe and efficient; concurrent requests interleave on one thread, they don't run a handler in parallel on two cores.</p><div class=\"callout warn\"><span class=\"lbl\">When it isn't</span> Storing <b>user- or request-specific mutable state on a singleton field</b> is a cross-request data-leak bug (request B reads request A's data). Use REQUEST scope or AsyncLocalStorage for genuinely per-request state.</div>",
  },
  {
    id: "di4",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "What are the four custom provider types?",
    answerHtml:
      "<ul><li><b><code>useClass</code></b> — resolve a token to a class, optionally env-dependent: <code>{ provide: ConfigService, useClass: isProd ? ProdConfig : DevConfig }</code>.</li><li><b><code>useValue</code></b> — inject a constant, mock, or external lib instance. Great for tests.</li><li><b><code>useFactory</code></b> — build dynamically; can inject deps via <code>inject: [...]</code> and may be <b>async</b> (connections, config-derived values).</li><li><b><code>useExisting</code></b> — alias one token to another (both resolve to the <i>same</i> singleton).</li></ul>",
  },
  {
    id: "di5",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "How do you inject a non-class dependency (interface, string, constant)?",
    answerHtml:
      "<p>Interfaces vanish at runtime, so you can't use them as tokens. Use a <b>string or symbol token</b> with <code>@Inject()</code>:</p><div class=\"code\">// provider\n{ provide: 'PAYMENTS', useClass: StripePayments }\n// or a Symbol token in a shared constants file\nexport const PAYMENTS = Symbol('PAYMENTS');\n\n// consumer\nconstructor(@Inject(PAYMENTS) private pay: PaymentGateway) {}</div><p>This is the mechanic behind <b>ports &amp; adapters</b>: depend on an interface via a token, bind the concrete implementation in the module.</p>",
  },
  {
    id: "di6",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "What is a dynamic module, and what's the forRoot / forFeature / register convention?",
    answerHtml:
      "<p>A <b>dynamic module</b> is a configurable module — a static method returns a <code>DynamicModule</code> (module metadata computed at runtime). The plugin pattern.</p><ul><li><b><code>register()</code></b> — configure for <i>this importer only</i> (e.g. an HTTP client with specific options).</li><li><b><code>forRoot()</code></b> — configure <i>once, app-wide</i> (DB, ConfigModule).</li><li><b><code>forFeature()</code></b> — a per-feature tweak of a <code>forRoot</code> config (register entities/repos).</li></ul><p>Each has an <b>async</b> counterpart (<code>registerAsync</code>/<code>forRootAsync</code>) accepting <code>useFactory</code>+<code>inject</code>, <code>useClass</code>, or <code>useExisting</code> for injected options.</p>",
  },
  {
    id: "di7",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "What is ConfigurableModuleBuilder and why prefer it?",
    answerHtml:
      "<p>It auto-generates the dynamic-module boilerplate — the base class, the options token, and the sync + async (<code>register</code>/<code>registerAsync</code>) signatures:</p><div class=\"code\">export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =\n  new ConfigurableModuleBuilder&lt;MyOptions&gt;()\n    .setClassMethodName('forRoot')\n    .build();\n\n@Module({})\nexport class MyModule extends ConfigurableModuleClass {}</div><p>You inject <code>MODULE_OPTIONS_TOKEN</code> to read the passed config. It removes the error-prone hand-written <code>forRootAsync</code> plumbing.</p>",
  },
  {
    id: "di8",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "How do you handle circular dependencies?",
    answerHtml:
      "<p>First, treat it as a <b>design smell</b> — it's often caused by <b>barrel <code>index.ts</code> files</b>; importing the concrete file directly frequently fixes it, or you extract a shared provider/module.</p><p>When genuinely needed:</p><ul><li><b><code>forwardRef(() => Other)</code></b> on <b>both</b> sides — <code>@Inject(forwardRef(...))</code> for providers and <code>imports: [forwardRef(...)]</code> for modules.</li><li>Or resolve lazily with <b><code>ModuleRef</code></b> (<code>get()</code> for singletons, <code>resolve()</code> for scoped), often in <code>onModuleInit</code>.</li></ul><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> With forwardRef, instantiation order is indeterminate — don't rely on it, and beware undefined deps when combined with REQUEST scope.</div>",
  },
  {
    id: "di9",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "What is ModuleRef and when do you reach for it?",
    answerHtml:
      "<p><code>ModuleRef</code> lets you resolve providers <b>imperatively</b> from the container instead of via constructor injection:</p><ul><li><code>moduleRef.get(Token)</code> — fetch a singleton (whole app or current module with <code>{ strict: false }</code>).</li><li><code>moduleRef.resolve(Token)</code> — resolve a <b>scoped</b> (request/transient) instance; returns a Promise and gives a unique instance per call (pass a <code>contextId</code> to share one).</li><li><code>moduleRef.create(Class)</code> — instantiate a class that isn't a registered provider.</li></ul><p>Use it for dynamic resolution (plugin systems, resolving by runtime key) and to break circular deps.</p>",
  },
  {
    id: "di10",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "When does re-registering a provider create a subtle bug?",
    answerHtml:
      "<p>If <code>StateService</code> is listed in <code>providers</code> of <b>two</b> modules, each module gets its <b>own instance</b>. Code that assumes a single shared instance (a cache, a counter, a connection) will see divergent state.</p><div class=\"callout tip\"><span class=\"lbl\">Fix</span> Register it in <b>one</b> module, <code>export</code> it, and <code>import</code> that module wherever needed — that guarantees one shared singleton.</div>",
  },
  {
    id: "di11",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "Can a Module class itself be injected? Can it inject things?",
    answerHtml:
      "<p>A module class <b>can inject</b> providers in its constructor (useful to run setup with dependencies), but it <b>cannot itself be injected</b> into other classes — modules are organizational units, not providers.</p>",
  },
  {
    id: "di12",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "What is @Optional() injection and property-based injection?",
    answerHtml:
      "<p><code>@Optional()</code> marks a dependency as non-required — if no provider is found, Nest injects <code>undefined</code> instead of throwing. Useful for optional plugins/config.</p><p><b>Property-based injection</b> (<code>@Inject(TOKEN) private dep: T</code> as a class field) is an alternative to constructor injection, mainly used when a base class can't easily forward constructor args. Constructor injection is preferred for clarity and testability.</p>",
  },

  // ---------------- REQUEST LIFECYCLE ----------------
  {
    id: "lc1",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "Walk through the exact NestJS request lifecycle order.",
    answerHtml:
      "<p>Incoming request →</p><ol><li><b>Middleware</b> (global, then module-bound)</li><li><b>Guards</b> (global → controller → route)</li><li><b>Interceptors</b> — pre-controller (global → controller → route)</li><li><b>Pipes</b> (global → controller → route → param)</li><li><b>Controller handler</b> → <b>Service</b></li><li><b>Interceptors</b> — post (route → controller → global, reversed)</li><li><b>Exception filters</b> (route → controller → global) — only on error</li></ol><p>→ Response.</p><div class=\"callout\"><span class=\"lbl\">Senior detail</span> Filters are the <b>only</b> enhancer that resolve lowest-level-first; interceptors form an onion (first-in/last-out on the way back).</div>",
  },
  {
    id: "lc2",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "Middleware vs Guard vs Interceptor vs Pipe vs Filter — when to use each?",
    answerHtml:
      "<table><tr><th>Block</th><th>Job</th></tr><tr><td><b>Middleware</b></td><td>Pre-routing, raw <code>req/res/next</code> (logging, CORS, helmet, body parsing). No <code>ExecutionContext</code>.</td></tr><tr><td><b>Guard</b></td><td><b>Authorization</b> — returns boolean; has <code>ExecutionContext</code> + <code>Reflector</code> (read metadata).</td></tr><tr><td><b>Interceptor</b></td><td>AOP before/after with RxJS — transform response, cache, timeout, log.</td></tr><tr><td><b>Pipe</b></td><td>Validate + transform handler arguments.</td></tr><tr><td><b>Filter</b></td><td>Catch exceptions and shape the error response.</td></tr></table><div class=\"callout\"><span class=\"lbl\">Key distinction</span> Only guards and interceptors get <code>ExecutionContext</code>; middleware gets neither handler nor class info.</div>",
  },
  {
    id: "lc3",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "What is a Guard for, and how does it read route metadata?",
    answerHtml:
      "<p>A guard implements <code>CanActivate.canActivate(ctx)</code> returning a boolean (or Promise/Observable of one). Its job is <b>authorization/authentication</b>: returning <code>false</code> → automatic 403.</p><p>Because it has an <code>ExecutionContext</code>, it can use the <b><code>Reflector</code></b> to read metadata set by decorators:</p><div class=\"code\">const roles = this.reflector.getAllAndOverride&lt;string[]&gt;(ROLES_KEY, [\n  ctx.getHandler(), ctx.getClass(),\n]);</div><p><code>getAllAndOverride</code> lets a method-level decorator override a class-level one — the basis of RBAC.</p>",
  },
  {
    id: "lc4",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "What can interceptors do that guards and pipes can't?",
    answerHtml:
      "<p>Interceptors wrap the handler with an <b>RxJS stream</b> (<code>intercept(ctx, next)</code> returns an Observable), giving before <i>and</i> after logic around <code>next.handle()</code>:</p><ul><li>Transform the response — <code>map(data =&gt; ({ data }))</code></li><li>Log/timing — <code>tap(...)</code></li><li>Timeouts — <code>timeout(5000)</code> + <code>catchError</code></li><li><b>Override</b> the handler entirely (caching: return a cached value instead of calling <code>next.handle()</code>)</li><li>Serialization — <code>ClassSerializerInterceptor</code> applies <code>@Exclude/@Expose</code></li></ul>",
  },
  {
    id: "lc5",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "What do whitelist, forbidNonWhitelisted, and transform do on ValidationPipe?",
    answerHtml:
      "<ul><li><b><code>whitelist: true</code></b> — strips properties that have no validation decorator (drops unexpected fields).</li><li><b><code>forbidNonWhitelisted: true</code></b> — instead of stripping, <b>throws 400</b> on unknown fields.</li><li><b><code>transform: true</code></b> — uses class-transformer to turn the plain payload into a <b>DTO instance</b> and coerce primitives (e.g. string param → number).</li></ul><div class=\"callout tip\"><span class=\"lbl\">Why it matters</span> <code>whitelist</code>/<code>forbidNonWhitelisted</code> defend against <b>mass-assignment</b> — a user can't sneak <code>isAdmin: true</code> into a body. Register the pipe globally for app-wide safety.</div>",
  },
  {
    id: "lc6",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "What are exception filters, and what's the AllExceptionsFilter pattern?",
    answerHtml:
      "<p>A filter (<code>@Catch(SomeException)</code> + <code>catch(exception, host)</code>) intercepts thrown exceptions and shapes the response. Nest's built-in filter handles <code>HttpException</code> and subclasses; unknown errors → 500.</p><p><b>AllExceptionsFilter</b>: <code>@Catch()</code> with no args (catches everything) + inject <code>HttpAdapterHost</code> so it works regardless of platform. Use <code>ArgumentsHost</code> to support HTTP/WS/RPC. Extend <code>BaseExceptionFilter</code> and call <code>super.catch()</code> to reuse defaults while adding logging.</p>",
  },
  {
    id: "lc7",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "What is a Pipe, and what built-in pipes should you know?",
    answerHtml:
      "<p>A pipe implements <code>transform(value, metadata)</code> and runs <b>just before the handler</b>, inside the exceptions zone (a throw skips the handler). Two jobs: <b>validation</b> and <b>transformation</b>.</p><p>Built-ins: <code>ValidationPipe</code>, <code>ParseIntPipe</code>, <code>ParseUUIDPipe</code>, <code>ParseBoolPipe</code>, <code>ParseArrayPipe</code>, <code>ParseEnumPipe</code>, <code>ParseFloatPipe</code>, <code>DefaultValuePipe</code>, <code>ParseFilePipe</code>, and <b><code>ParseDatePipe</code></b> (added in v11).</p><div class=\"callout warn\"><span class=\"lbl\">Order</span> <code>DefaultValuePipe</code> must come <i>before</i> a <code>Parse*</code> pipe, or the parse throws on null.</div>",
  },
  {
    id: "lc8",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "ArgumentsHost vs ExecutionContext — what's the difference?",
    answerHtml:
      "<p><code>ExecutionContext extends ArgumentsHost</code>.</p><ul><li><b><code>ArgumentsHost</code></b> — abstracts the transport args; <code>switchToHttp()/switchToRpc()/switchToWs()</code>. Filters get this (no handler info).</li><li><b><code>ExecutionContext</code></b> — adds <code>getHandler()</code> and <code>getClass()</code> for reflection. Guards and interceptors get this.</li></ul><p>This abstraction is why the same guard/interceptor/filter works across HTTP, microservices, and WebSockets.</p>",
  },
  {
    id: "lc9",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "Why use APP_GUARD / APP_INTERCEPTOR / APP_PIPE / APP_FILTER instead of app.useGlobalX()?",
    answerHtml:
      "<p><code>app.useGlobalGuards(new X())</code> creates the instance <b>outside</b> the DI container, so it <b>can't inject</b> anything. Registering via the <code>APP_*</code> tokens makes the global enhancer a real provider:</p><div class=\"code\">{ provide: APP_GUARD, useClass: AuthGuard }</div><p>Now it can inject <code>Reflector</code>, services, config, etc. Multiple <code>APP_FILTER</code>/<code>APP_INTERCEPTOR</code> registrations are allowed.</p>",
  },
  {
    id: "lc10",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "Two ways to write middleware, and the big limitation?",
    answerHtml:
      "<p><b>Class middleware</b> (<code>implements NestMiddleware</code>) is DI-capable; <b>functional middleware</b> (<code>(req, res, next) =&gt; ...</code>) has no deps. Apply class middleware in a module via <code>configure(consumer)</code>: <code>consumer.apply(LoggerMiddleware).forRoutes('users')</code> with <code>.exclude(...)</code>.</p><div class=\"callout warn\"><span class=\"lbl\">Limitation</span> Middleware runs <b>before</b> Nest's context exists — it has <b>no <code>ExecutionContext</code></b> and can't read handler metadata. For anything route-aware, use a guard or interceptor. Global <code>app.use()</code> middleware also can't use DI.</div>",
  },
  {
    id: "lc11",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "How do you build a custom param decorator and compose decorators?",
    answerHtml:
      "<p><code>createParamDecorator</code> builds a handler-argument decorator:</p><div class=\"code\">export const User = createParamDecorator(\n  (data: string, ctx: ExecutionContext) =&gt; {\n    const req = ctx.switchToHttp().getRequest();\n    return data ? req.user?.[data] : req.user;\n  },\n);\n// usage: @User('email') email: string</div><p>Bundle several decorators with <b><code>applyDecorators</code></b> — e.g. an <code>@Auth(...roles)</code> that combines <code>SetMetadata</code> + <code>UseGuards</code> + Swagger decorators into one.</p>",
  },
  {
    id: "lc12",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "What are the lifecycle hooks and their order?",
    answerHtml:
      "<p>Init: <b><code>onModuleInit</code></b> (module's deps resolved) → <b><code>onApplicationBootstrap</code></b> (all modules ready, before listening). Shutdown (only if <code>app.enableShutdownHooks()</code> was called): <b><code>onModuleDestroy</code></b> → <b><code>beforeApplicationShutdown</code></b> → <b><code>onApplicationShutdown(signal)</code></b>.</p><p>All may be async (Nest awaits). Use shutdown hooks to drain: stop new work, finish in-flight, close DB pools/queues, flush logs.</p><div class=\"callout warn\"><span class=\"lbl\">Gotchas</span> Hooks don't fire for request-scoped providers; SIGTERM never fires on Windows; <code>app.close()</code> doesn't kill the process; v11 reversed the termination order.</div>",
  },
  {
    id: "lc13",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "How do binding levels (global/controller/route) and execution order interact?",
    answerHtml:
      "<p>You can bind guards/interceptors/pipes/filters at three levels: <b>global</b>, <b>controller</b> (<code>@UseGuards()</code> on the class), and <b>route</b> (<code>@UseGuards()</code> on the method). On the way <i>in</i>, they run global → controller → route. Interceptors then unwind route → controller → global on the way <i>out</i>; filters resolve route → controller → global. Knowing this lets you, e.g., put a broad auth guard globally and a stricter one on a route.</p>",
  },
  {
    id: "lc14",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "How does a global ValidationPipe interact with transformation and implicit conversion?",
    answerHtml:
      "<p>With <code>transform: true</code>, the pipe instantiates the DTO and runs class-transformer. Adding <code>transformOptions: { enableImplicitConversion: true }</code> lets it coerce based on the TS type without explicit <code>@Type()</code> decorators (e.g. a query <code>?page=2</code> string becomes <code>number</code>).</p><div class=\"callout warn\"><span class=\"lbl\">Caveat</span> Implicit conversion is convenient but can surprise you (e.g. <code>'true'</code>/<code>'false'</code> coercion); for nested objects/arrays you still need <code>@Type(() =&gt; Dto)</code> + <code>@ValidateNested()</code>.</div>",
  },

  // ---------------- CONFIG & VALIDATION ----------------
  {
    id: "cfg1",
    category: "config",
    categoryLabel: "Config & Validation",
    level: "mid",
    question: "How does @nestjs/config work, and how do you validate env at boot?",
    answerHtml:
      "<p><code>ConfigModule.forRoot({ isGlobal: true })</code> loads <code>.env</code> + merges <code>process.env</code> (real env wins on conflicts) and wraps dotenv. Read with <code>configService.get&lt;T&gt;('KEY', default)</code>.</p><p><b>Validate at boot (fail fast):</b> pass a <code>validationSchema</code> (Joi) or a custom <code>validate</code> function (zod/class-validator) so a missing/invalid var crashes startup instead of erroring at request time:</p><div class=\"code\">validationSchema: Joi.object({\n  NODE_ENV: Joi.string().valid('development','production').default('development'),\n  PORT: Joi.number().default(3000),\n  DATABASE_URL: Joi.string().required(),\n})</div>",
  },
  {
    id: "cfg2",
    category: "config",
    categoryLabel: "Config & Validation",
    question: "What is namespaced config (registerAs) and why use it?",
    answerHtml:
      "<p><code>registerAs('db', () =&gt; ({ host: process.env.DB_HOST, ... }))</code> groups related config and gives a typed accessor:</p><div class=\"code\">@Inject(dbConfig.KEY) cfg: ConfigType&lt;typeof dbConfig&gt;</div><p>It keeps config modular and type-safe, and <code>dbConfig.asProvider()</code> plugs directly into <code>TypeOrmModule.forRootAsync</code>. Cleaner than scattering <code>configService.get('DB_HOST')</code> calls everywhere.</p>",
  },
  {
    id: "cfg3",
    category: "config",
    categoryLabel: "Config & Validation",
    question: "How do you validate request DTOs with class-validator?",
    answerHtml:
      "<p>Decorate class DTOs and let the global <code>ValidationPipe</code> enforce them:</p><div class=\"code\">export class CreateUserDto {\n  @IsEmail() email: string;\n  @IsString() @MinLength(8) password: string;\n  @IsOptional() @IsInt() @Min(18) age?: number;\n}</div><p>Nested objects need <code>@ValidateNested()</code> + <code>@Type(() =&gt; ChildDto)</code>; arrays of DTOs need <code>@ValidateNested({ each: true })</code>. On failure the pipe throws a 400 with the validation messages.</p>",
  },
  {
    id: "cfg4",
    category: "config",
    categoryLabel: "Config & Validation",
    question: "What are mapped types (PartialType, PickType, OmitType, IntersectionType)?",
    answerHtml:
      "<p>Helpers that derive one DTO from another so you don't repeat decorators:</p><ul><li><b><code>PartialType(CreateDto)</code></b> — all fields optional (perfect for an <code>UpdateDto</code>).</li><li><b><code>PickType(Dto, ['email'])</code></b> / <b><code>OmitType(Dto, ['id'])</code></b> — subset.</li><li><b><code>IntersectionType(A, B)</code></b> — merge.</li></ul><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> Import them from the right package: <code>@nestjs/mapped-types</code> (plain), <code>@nestjs/swagger</code>, or <code>@nestjs/graphql</code> — each preserves that layer's metadata.</div>",
  },
  {
    id: "cfg5",
    category: "config",
    categoryLabel: "Config & Validation",
    question: "What's the difference between config validation and runtime DTO validation?",
    answerHtml:
      "<p>Both use schemas, but at different boundaries: <b>config validation</b> runs <b>once at startup</b> over <code>process.env</code> (fail fast if the deploy is misconfigured). <b>DTO validation</b> runs on <b>every request</b> over untrusted input (reject bad payloads with 400). Don't conflate them — a valid env doesn't make a request body safe.</p>",
  },
  {
    id: "cfg6",
    category: "config",
    categoryLabel: "Config & Validation",
    question: "12-factor config: why env vars, not config files in the repo?",
    answerHtml:
      "<p>Factor III: config that varies per deploy (DB URLs, secrets, feature flags) belongs in the <b>environment</b>, not in code. Litmus test: <i>could you open-source the repo right now without leaking secrets?</i> Keep <code>.env</code> for local dev only (gitignored + dockerignored); in prod inject via the orchestrator's secret store (k8s Secrets, AWS Secrets Manager, Vault). Node 20+ can load env natively with <code>--env-file</code>.</p>",
  },
];

/** Category filters contributed by this file (the aggregator adds "All"). */
export const FLASHCARD_FILTERS = [
  { value: "core", label: "Core" },
  { value: "di", label: "DI & Modules" },
  { value: "lifecycle", label: "Request Lifecycle" },
  { value: "config", label: "Config & Validation" },
];
