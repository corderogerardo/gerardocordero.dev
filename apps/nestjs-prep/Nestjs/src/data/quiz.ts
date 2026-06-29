// Multiple-choice quiz — NestJS fundamentals (core, DI, lifecycle, data, auth, testing).
import type { Level } from "@/lib/levels";

export type QuizQuestion = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  options: string[];
  answer: number; // index of the correct option
  explanationHtml: string;
  level?: Level;
};

export const QUIZ: QuizQuestion[] = [
  {
    id: "qz1",
    category: "core",
    categoryLabel: "Core",
    question: "Why must a NestJS DTO be a class rather than a TypeScript interface?",
    options: [
      "Classes are faster to instantiate",
      "Interfaces can't have decorators at all",
      "Interfaces are erased at runtime, so ValidationPipe has no metatype to validate",
      "Nest only supports classes for historical reasons",
    ],
    answer: 2,
    explanationHtml:
      "<p>Interfaces exist only at compile time. <code>ValidationPipe</code> + class-validator need the runtime <b>metatype</b> (the class) to read decorators and validate. An interface DTO means validation silently does nothing.</p>",
  },
  {
    id: "qz2",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "In the request lifecycle, which runs FIRST?",
    options: ["Pipes", "Guards", "Interceptors", "Middleware"],
    answer: 3,
    explanationHtml:
      "<p>Order: <b>Middleware → Guards → Interceptors (pre) → Pipes → Handler → Interceptors (post) → Filters</b>. Middleware runs before Nest's execution context even exists.</p>",
  },
  {
    id: "qz3",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "Which building block is the right place for authorization (RBAC)?",
    options: ["Middleware", "Pipe", "Guard", "Interceptor"],
    answer: 2,
    explanationHtml:
      "<p>Guards (<code>canActivate</code>) are designed for authorization: they return a boolean and have an <code>ExecutionContext</code>, so they can read route metadata via <code>Reflector</code> for role checks.</p>",
  },
  {
    id: "qz4",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "What is the main cost of making a provider REQUEST-scoped?",
    options: [
      "It can no longer be exported",
      "Scope bubbles up the injection chain, making consumers request-scoped too and adding per-request overhead",
      "It becomes a singleton",
      "It disables dependency injection for that provider",
    ],
    answer: 1,
    explanationHtml:
      "<p>REQUEST scope <b>bubbles up</b>: a request-scoped leaf forces its consumers (up to the controller) to be request-scoped, adding per-request instantiation/GC. A shared logger/DB going request-scoped can convert the whole app.</p>",
  },
  {
    id: "qz5",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "You need to inject a value behind an interface. What do you do?",
    options: [
      "Inject the interface directly by name",
      "Use a string/symbol token with @Inject() and bind a provider to it",
      "Make the interface a class automatically",
      "Use @Optional() on the interface",
    ],
    answer: 1,
    explanationHtml:
      "<p>Interfaces vanish at runtime, so they can't be tokens. Define a string/symbol token, bind it with <code>{ provide: TOKEN, useClass/useValue }</code>, and inject with <code>@Inject(TOKEN)</code>. This is the ports &amp; adapters mechanic.</p>",
  },
  {
    id: "qz6",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "Same service class is listed in two modules' `providers`. What happens?",
    options: [
      "Nest throws a duplicate-provider error",
      "Both modules share one instance",
      "Each module gets its own separate instance",
      "Only the first registration wins",
    ],
    answer: 2,
    explanationHtml:
      "<p>Each module that lists it in <code>providers</code> gets its <b>own instance</b>. To share one singleton, register it once, <code>export</code> it, and <code>import</code> that module everywhere.</p>",
  },
  {
    id: "qz7",
    category: "config",
    categoryLabel: "Config & Validation",
    question: "What does `whitelist: true` on ValidationPipe do?",
    options: [
      "Allows only whitelisted IPs",
      "Strips properties that have no validation decorator",
      "Throws on any extra property",
      "Transforms the payload into a class instance",
    ],
    answer: 1,
    explanationHtml:
      "<p><code>whitelist</code> strips undecorated properties (defends against mass-assignment). <code>forbidNonWhitelisted</code> throws on them instead; <code>transform</code> builds the DTO instance and coerces primitives.</p>",
  },
  {
    id: "qz8",
    category: "data",
    categoryLabel: "Data & ORM",
    question: "Which TypeORM setting should NEVER be true in production?",
    options: ["logging", "synchronize", "autoLoadEntities", "migrationsRun"],
    answer: 1,
    explanationHtml:
      "<p><code>synchronize: true</code> auto-alters the schema from your entities and can silently drop data. Use migrations with <code>synchronize: false</code> in production.</p>",
  },
  {
    id: "qz9",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "Why register a global guard via APP_GUARD instead of app.useGlobalGuards(new X())?",
    options: [
      "It's shorter to type",
      "Only APP_GUARD supports multiple guards",
      "APP_GUARD makes it a DI provider, so it can inject dependencies",
      "useGlobalGuards is deprecated",
    ],
    answer: 2,
    explanationHtml:
      "<p>Instances created with <code>new</code> live outside the container and can't inject anything. Registering via <code>APP_GUARD</code> makes the guard a provider that can inject <code>Reflector</code>, services, config, etc.</p>",
  },
  {
    id: "qz10",
    category: "auth",
    categoryLabel: "Auth",
    question: "When is CSRF protection NOT needed?",
    options: [
      "When using session cookies",
      "For a stateless API authenticated with Bearer tokens",
      "When the site has forms",
      "When using HTTPS",
    ],
    answer: 1,
    explanationHtml:
      "<p>CSRF exploits browser-auto-attached credentials (cookies). A stateless Bearer-token API isn't vulnerable because the attacker can't read or attach the token. CSRF protection matters for cookie/session auth.</p>",
  },
  {
    id: "qz11",
    category: "auth",
    categoryLabel: "Auth",
    question: "Best practice for storing user passwords?",
    options: [
      "AES-256 encryption",
      "SHA-256 hash",
      "bcrypt or argon2 (salted, slow, one-way)",
      "Base64 encoding",
    ],
    answer: 2,
    explanationHtml:
      "<p>Passwords need a <b>slow, salted, one-way</b> hash — bcrypt or argon2. Encryption is reversible (wrong for passwords); fast hashes like SHA-256 are brute-forceable; Base64 is not security at all.</p>",
  },
  {
    id: "qz12",
    category: "testing",
    categoryLabel: "Testing",
    question: "In a Nest unit test, how do you replace a real dependency with a mock?",
    options: [
      "Edit the module's providers array directly",
      "Use Test.createTestingModule(...).overrideProvider(X).useValue(mock)",
      "Mocks aren't supported; use the real dependency",
      "Set process.env.MOCK=true",
    ],
    answer: 1,
    explanationHtml:
      "<p><code>Test.createTestingModule({...}).overrideProvider(Token).useValue(mock)</code> (chained before <code>.compile()</code>) swaps the dependency. There are also <code>overrideGuard/Interceptor/Pipe/Filter/Module</code>.</p>",
  },
  {
    id: "qz13",
    category: "core",
    categoryLabel: "Core",
    question: "What happens when you inject @Res() in a controller without passthrough?",
    options: [
      "Nothing changes",
      "You switch to library-specific mode and must send the response yourself, losing interceptors",
      "Nest sends the response twice",
      "It enables streaming automatically",
    ],
    answer: 1,
    explanationHtml:
      "<p><code>@Res()</code> hands you the raw response object — you must call <code>res.send()</code> yourself, and the standard Nest response pipeline (interceptors, <code>@HttpCode</code>) no longer applies. Use <code>@Res({ passthrough: true })</code> to keep Nest handling.</p>",
  },
  {
    id: "qz14",
    category: "lifecycle",
    categoryLabel: "Request Lifecycle",
    question: "Which enhancer is the ONLY one that resolves lowest-level-first (route → controller → global)?",
    options: ["Guards", "Pipes", "Interceptors", "Exception filters"],
    answer: 3,
    explanationHtml:
      "<p>Exception filters resolve route → controller → global. Guards and pre-interceptors go global → route; post-interceptors unwind route → global (onion).</p>",
  },
  {
    id: "qz15",
    category: "di",
    categoryLabel: "DI & Modules",
    question: "What's the recommended first response to a circular dependency?",
    options: [
      "Always use forwardRef()",
      "Refactor — often it's caused by barrel index.ts files; import the concrete file or extract a shared provider",
      "Make both providers global",
      "Switch them to request scope",
    ],
    answer: 1,
    explanationHtml:
      "<p>A cycle is usually a design smell, frequently from barrel files. Fix the structure first (import concrete paths, extract a shared module). <code>forwardRef()</code> on both sides or <code>ModuleRef</code> are fallbacks.</p>",
  },
  {
    id: "qz16",
    category: "config",
    categoryLabel: "Config & Validation",
    question: "Best way to catch a missing required env var?",
    options: [
      "Check it lazily on first request",
      "Validate env at boot with a schema (Joi/zod) in ConfigModule so startup fails fast",
      "Wrap every access in try/catch",
      "Default everything to empty strings",
    ],
    answer: 1,
    explanationHtml:
      "<p>Validate <code>process.env</code> once at startup via <code>validationSchema</code> (or a custom <code>validate</code>). The app crashes immediately on misconfiguration instead of failing unpredictably at request time.</p>",
  },
];

export const QUIZ_FILTERS = [
  { value: "core", label: "Core" },
  { value: "di", label: "DI & Modules" },
  { value: "lifecycle", label: "Request Lifecycle" },
  { value: "config", label: "Config & Validation" },
  { value: "data", label: "Data & ORM" },
  { value: "auth", label: "Auth" },
  { value: "testing", label: "Testing" },
];
