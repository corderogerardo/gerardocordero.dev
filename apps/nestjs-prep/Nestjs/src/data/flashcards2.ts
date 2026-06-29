// NestJS techniques flashcards: data/ORM, auth, testing, GraphQL, WebSockets.
import type { Flashcard } from "./flashcards";

export const FLASHCARDS2: Flashcard[] = [
  // ---------------- DATA & ORM ----------------
  {
    id: "d1",
    category: "data",
    categoryLabel: "Data & ORM",
    level: "mid",
    question: "How does TypeORM integrate with Nest, and what's the repository pattern here?",
    answerHtml:
      "<p><code>TypeOrmModule.forRoot({...})</code> configures the <b>DataSource</b> (the old <code>Connection</code>) app-wide; <code>forFeature([User])</code> registers entities per module. Inject a repository with <code>@InjectRepository(User) repo: Repository&lt;User&gt;</code> and call <code>repo.find()</code>, <code>repo.save()</code>, etc.</p><div class=\"callout warn\"><span class=\"lbl\">#1 gotcha</span> <code>synchronize: true</code> auto-alters your schema from entities — <b>never in production</b> (silent data loss). Use <code>synchronize: false</code> + migrations.</div>",
  },
  {
    id: "d2",
    category: "data",
    categoryLabel: "Data & ORM",
    question: "Three ways to run a transaction in TypeORM?",
    answerHtml:
      "<ol><li><b>QueryRunner</b> — <code>connect()</code> → <code>startTransaction()</code> → work → <code>commitTransaction()</code>/<code>rollbackTransaction()</code> → <code>release()</code> in <code>finally</code>. Most control.</li><li><b>Callback</b> — <code>dataSource.transaction(async (mgr) =&gt; { ... })</code> auto-commits or rolls back on throw. Simplest.</li><li><b>Decorator</b> — no built-in <code>@Transactional</code>; the community <code>typeorm-transactional</code> (CLS-based) provides one.</li></ol><div class=\"callout warn\"><span class=\"lbl\">Key rule</span> Every operation in a transaction must use the <b>same EntityManager</b>, or it runs outside the transaction.</div>",
  },
  {
    id: "d3",
    category: "data",
    categoryLabel: "Data & ORM",
    question: "Prisma vs TypeORM in Nest — how do they differ?",
    answerHtml:
      "<p><b>TypeORM</b> is a decorator-based ORM with Nest-native repository injection. <b>Prisma</b> is a schema-first, type-safe client — no repository decorators; you wrap the generated <code>PrismaClient</code>:</p><div class=\"code\">@Injectable()\nexport class PrismaService extends PrismaClient implements OnModuleInit {\n  async onModuleInit() { await this.$connect(); }\n}</div><p>Inject <code>PrismaService</code> and call <code>this.prisma.user.findMany()</code>. Transactions: <code>$transaction([...])</code> or interactive <code>$transaction(async (tx) =&gt; ...)</code>. Prisma's strength is end-to-end type safety + migrations; TypeORM's is flexibility + active-record/data-mapper options.</p>",
  },
  {
    id: "d4",
    category: "data",
    categoryLabel: "Data & ORM",
    question: "How does Mongoose integrate, and how do you define schemas?",
    answerHtml:
      "<p><code>MongooseModule.forRoot(uri)</code> + <code>forFeature([{ name: Cat.name, schema: CatSchema }])</code>. Define schema classes with <code>@Schema()</code>/<code>@Prop()</code>, compile with <code>SchemaFactory.createForClass(Cat)</code>, and inject the model: <code>@InjectModel(Cat.name) model: Model&lt;Cat&gt;</code>.</p><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> Schema hooks/plugins must be registered <b>before</b> the model compiles — use <code>forFeatureAsync</code> with a factory.</div>",
  },
  {
    id: "d5",
    category: "data",
    categoryLabel: "Data & ORM",
    question: "Why keep DTOs, entities, and domain models separate?",
    answerHtml:
      "<ul><li><b>Entity</b> — the persistence shape (ORM-decorated, maps to a table/collection).</li><li><b>DTO</b> — the API contract (validated input / serialized output).</li><li><b>Domain model</b> — business concepts, free of framework/ORM concerns.</li></ul><p>Coupling them leaks the database schema into your API (over-exposure, accidental breaking changes) and the API into your domain. Map at the boundary (repository maps row→domain; serializer maps domain→DTO) so each layer evolves independently.</p>",
  },
  {
    id: "d6",
    category: "data",
    categoryLabel: "Data & ORM",
    question: "How do you avoid leaking sensitive fields (e.g. password) in responses?",
    answerHtml:
      "<p>Use the <code>ClassSerializerInterceptor</code> with class-transformer decorators on the entity/DTO: <code>@Exclude()</code> on <code>password</code>, <code>@Expose()</code> for opt-in fields. Apply the interceptor globally or per-route. Alternatively select only safe columns at the query level, or map to a response DTO. Never return raw entities with secrets attached.</p>",
  },
  {
    id: "d7",
    category: "data",
    categoryLabel: "Data & ORM",
    question: "How do you prevent SQL/NoSQL injection in a Nest data layer?",
    answerHtml:
      "<p>Use the ORM's <b>parameterized queries</b> / query builder — never string-concatenate user input into SQL. For raw queries use bound parameters (<code>repo.query('... WHERE id = $1', [id])</code>). For Mongo, validate input shapes so an attacker can't inject operator objects (<code>{ $gt: '' }</code>) — class-validator + <code>whitelist</code> strips unexpected keys. The combination of typed DTOs + parameterized queries closes most injection vectors.</p>",
  },
  {
    id: "d8",
    category: "data",
    categoryLabel: "Data & ORM",
    question: "What is the N+1 query problem at the ORM level, and how do you fix it?",
    answerHtml:
      "<p>Loading N parent rows then lazily loading a relation per parent → 1 + N queries. Fixes: <b>eager join</b> the relation (<code>relations: ['posts']</code> or a query-builder <code>leftJoinAndSelect</code>), or batch with a single <code>WHERE id IN (...)</code>. In GraphQL the same problem is solved with <b>DataLoader</b> batching. Always profile the query count under realistic list sizes.</p>",
  },

  // ---------------- AUTH ----------------
  {
    id: "a1",
    category: "auth",
    categoryLabel: "Auth",
    question: "Outline JWT authentication in Nest (with or without Passport).",
    answerHtml:
      "<p>Login: POST credentials → validate → <code>JwtService.signAsync(payload)</code> (put the user id in <code>sub</code>) → return the token. Protected routes: client sends <code>Authorization: Bearer &lt;token&gt;</code> → a guard calls <code>jwtService.verifyAsync()</code> and attaches the user to the request.</p><p><b>With Passport</b>: a <code>JwtStrategy extends PassportStrategy(Strategy)</code> reads the token via <code>ExtractJwt.fromAuthHeaderAsBearerToken()</code> and implements <code>validate(payload)</code> (return value → <code>req.user</code>); protect with <code>AuthGuard('jwt')</code>. <b>Without Passport</b>: a hand-rolled guard does the same with <code>JwtService</code>. Passport is optional.</p>",
  },
  {
    id: "a2",
    category: "auth",
    categoryLabel: "Auth",
    question: "How do you make every route protected by default with a @Public() escape hatch?",
    answerHtml:
      "<p>Register the JWT guard globally as <code>APP_GUARD</code> so everything is protected, then add a <code>@Public()</code> = <code>SetMetadata(IS_PUBLIC_KEY, true)</code> decorator and short-circuit in the guard:</p><div class=\"code\">const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [\n  ctx.getHandler(), ctx.getClass(),\n]);\nif (isPublic) return true;</div><p>This is safer than opt-in protection — you can't forget to guard a new route.</p>",
  },
  {
    id: "a3",
    category: "auth",
    categoryLabel: "Auth",
    question: "Authentication vs authorization — and how do you implement RBAC?",
    answerHtml:
      "<p><b>Authentication</b> = who you are (verify identity → <code>req.user</code>). <b>Authorization</b> = what you may do.</p><p><b>RBAC</b>: a <code>@Roles('admin')</code> decorator (<code>SetMetadata</code>) + a <code>RolesGuard</code> that reads required roles via <code>reflector.getAllAndOverride([handler, class])</code> and compares to <code>req.user.roles</code>; insufficient → 403. For per-resource/conditional rules (e.g. “can edit <i>own</i> article”) step up to <b>ABAC with CASL</b> + a <code>PoliciesGuard</code>.</p>",
  },
  {
    id: "a4",
    category: "auth",
    categoryLabel: "Auth",
    question: "Access tokens vs refresh tokens — what's the pattern?",
    answerHtml:
      "<p>Issue a <b>short-lived access token</b> (minutes) used on every request, plus a <b>longer-lived refresh token</b> (days) stored securely (HttpOnly cookie). When the access token expires, the client exchanges the refresh token for a new pair.</p><div class=\"callout warn\"><span class=\"lbl\">Revocation</span> JWTs can't be revoked before expiry, so keep access tokens short and maintain a refresh-token store/denylist (rotate on use, detect reuse) for logout and compromise handling.</div>",
  },
  {
    id: "a5",
    category: "auth",
    categoryLabel: "Auth",
    question: "How do you hash passwords, and hashing vs encryption?",
    answerHtml:
      "<p><b>Hashing is one-way</b> — for passwords. Use <code>bcrypt</code> (<code>bcrypt.hash(pwd, 10)</code> / <code>bcrypt.compare(plain, hash)</code>; the salt is embedded) or <b>argon2</b> (memory-hard, modern preferred). Never compare with <code>===</code>.</p><p><b>Encryption is two-way</b> — for data you must read back. Use Node <code>crypto</code> with an AEAD mode like <code>aes-256-gcm</code>, a key derived via <code>scrypt</code>, and a unique random IV per encryption. Nest ships no wrapper — you use <code>crypto</code> directly.</p>",
  },
  {
    id: "a6",
    category: "auth",
    categoryLabel: "Auth",
    question: "When is CSRF protection relevant, and when is it not?",
    answerHtml:
      "<p>CSRF matters for <b>cookie/session-based</b> auth, where the browser auto-attaches the credential — a malicious site can forge requests. It is <b>not</b> relevant for stateless <b>Bearer-token</b> APIs (the attacker can't read or attach the token).</p><p>For cookie auth use the double-submit pattern (<code>csrf-csrf</code> on Express; <code>@fastify/csrf-protection</code> on Fastify), plus <code>SameSite</code> cookies.</p>",
  },
  {
    id: "a7",
    category: "auth",
    categoryLabel: "Auth",
    question: "How does @nestjs/throttler rate-limit, and what breaks at scale?",
    answerHtml:
      "<p><code>ThrottlerModule.forRoot([{ ttl, limit }])</code> + the <code>ThrottlerGuard</code> (as <code>APP_GUARD</code>) limit requests per client. <code>@Throttle()</code> / <code>@SkipThrottle()</code> tune per route; named throttlers (short/medium/long) can stack. <b><code>ttl</code> is milliseconds</b> (use the <code>seconds()</code>/<code>minutes()</code> helpers).</p><div class=\"callout warn\"><span class=\"lbl\">At scale</span> Default storage is <b>in-memory (per-instance)</b> — useless across replicas. Use a <b>Redis</b> storage so the limit is global. Behind a proxy, set <code>trust proxy</code> and override <code>getTracker()</code> to use the real client IP.</div>",
  },
  {
    id: "a8",
    category: "auth",
    categoryLabel: "Auth",
    question: "Where does helmet go and why is order critical?",
    answerHtml:
      "<p>Helmet sets security headers (CSP, HSTS, X-Frame-Options, etc.). Apply it <b>before</b> any other middleware or route: Express <code>app.use(helmet())</code>, Fastify <code>app.register(@fastify/helmet)</code>. If registered late, responses sent earlier won't carry the headers.</p><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> Strict CSP can break GraphQL playgrounds / Swagger UI — relax CSP for those routes.</div>",
  },

  // ---------------- TESTING ----------------
  {
    id: "t1",
    category: "testing",
    categoryLabel: "Testing",
    level: "mid",
    question: "How do you write a unit test with @nestjs/testing?",
    answerHtml:
      "<div class=\"code\">const moduleRef = await Test.createTestingModule({\n  providers: [UsersService, { provide: UsersRepo, useValue: mockRepo }],\n}).compile();\nconst service = moduleRef.get(UsersService);</div><p><code>Test.createTestingModule()</code> builds a DI graph; <code>.compile()</code> is async. Use <code>module.get(Token)</code> for singletons and <code>await module.resolve(Token)</code> for scoped providers. Swap real deps via <code>.overrideProvider(X).useValue(mock)</code> before <code>.compile()</code>.</p>",
  },
  {
    id: "t2",
    category: "testing",
    categoryLabel: "Testing",
    question: "How do you write an e2e test in Nest?",
    answerHtml:
      "<div class=\"code\">const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();\nconst app = moduleRef.createNestApplication();\nawait app.init();\nawait request(app.getHttpServer()).get('/users').expect(200);\n// afterAll: await app.close();</div><p>Spin up the real app, drive it with <b>supertest</b>, and override providers (e.g. swap the DB for a test container) the same way. Always <code>app.close()</code> in teardown to avoid open-handle leaks.</p>",
  },
  {
    id: "t3",
    category: "testing",
    categoryLabel: "Testing",
    question: "How do you override guards, interceptors, pipes, or a whole module in tests?",
    answerHtml:
      "<p>The testing module exposes override builders: <code>.overrideProvider()</code>, <code>.overrideGuard()</code>, <code>.overrideInterceptor()</code>, <code>.overridePipe()</code>, <code>.overrideFilter()</code>, and <code>.overrideModule()</code> — all chained before <code>.compile()</code>.</p><div class=\"callout warn\"><span class=\"lbl\">Global enhancer gotcha</span> A guard registered via <code>APP_GUARD</code> must be registered as <code>useExisting</code> + a normal provider to be overridable, or use <code>overrideProvider</code> on its class.</div>",
  },
  {
    id: "t4",
    category: "testing",
    categoryLabel: "Testing",
    question: "What's the test pyramid for a Nest backend?",
    answerHtml:
      "<p>Many fast <b>unit</b> tests (isolate one class, mock collaborators) → fewer <b>integration</b> tests (real DB/Redis via <b>Testcontainers</b>, exercise a module) → a few slow <b>e2e</b> tests (boot the app, hit HTTP). Mock at the boundaries (DB, HTTP, queue, clock) in unit tests; use real dependencies in integration. Test the <b>five outcomes</b> of a flow: response, DB change, outgoing call, queued message, observability.</p>",
  },
  {
    id: "t5",
    category: "testing",
    categoryLabel: "Testing",
    question: "How do you auto-mock dependencies in a testing module?",
    answerHtml:
      "<p><code>.useMocker(token =&gt; ...)</code> provides a fallback for any unresolved dependency — pair it with <code>createMock</code> from <code>@golevelup/ts-jest</code> to deep-mock automatically. Libraries like <b>Suites</b> (formerly Automock) generate solitary unit tests with mocked collaborators. This avoids hand-writing a mock for every transitive dep.</p>",
  },
  {
    id: "t6",
    category: "testing",
    categoryLabel: "Testing",
    question: "Why use Testcontainers for integration tests?",
    answerHtml:
      "<p>Testcontainers spins up <b>real, throwaway</b> Postgres/Redis/etc. in Docker for the test run, so integration tests exercise the actual database (real SQL, constraints, transactions) instead of brittle mocks. <code>new PostgreSqlContainer().start()</code> → use <code>getConnectionUri()</code>. It catches bugs mocks hide (migrations, query syntax, isolation) while staying disposable and CI-friendly.</p>",
  },
  {
    id: "t7",
    category: "testing",
    categoryLabel: "Testing",
    question: "What makes code testable in Nest?",
    answerHtml:
      "<p>DI does most of the work: depend on <b>injected abstractions</b> (interfaces via tokens), not concretes, so tests swap in fakes. Keep controllers thin, push logic into services, keep functions pure where possible, and inject the clock/uuid/HTTP client so they're mockable. Avoid reaching for globals or <code>new</code>-ing dependencies inside a class.</p>",
  },

  // ---------------- GRAPHQL ----------------
  {
    id: "g1",
    category: "graphql",
    categoryLabel: "GraphQL",
    question: "Code-first vs schema-first GraphQL in Nest?",
    answerHtml:
      "<p><b>Code-first</b> (<code>autoSchemaFile</code>): TS classes with <code>@ObjectType/@Field/@Query/@Mutation</code> are the source of truth; Nest generates the SDL. One language, no drift — the common modern choice. <b>Schema-first</b> (<code>typePaths</code>): the SDL is the source of truth and you generate TS typings. Language-agnostic and reviewable, but two artifacts to keep in sync.</p>",
  },
  {
    id: "g2",
    category: "graphql",
    categoryLabel: "GraphQL",
    question: "What is the N+1 problem in GraphQL and how does DataLoader fix it?",
    answerHtml:
      "<p>A list query of N parents whose field resolver fetches per parent → <b>1 + N</b> queries. <b>DataLoader</b> wraps a batch function <code>(keys[]) =&gt; Promise&lt;values[]&gt;</code>; <code>loader.load(key)</code> calls are coalesced within one event-loop tick into a single <code>WHERE id IN (...)</code> (1+1), plus per-request memoization.</p><div class=\"callout warn\"><span class=\"lbl\">Two classic bugs</span> (1) The batch fn must return results in the <b>same order and length</b> as <code>keys</code> (build a Map, then <code>keys.map(...)</code>). (2) The loader must be <b>per-request</b> — a singleton loader leaks one user's cache to another.</div>",
  },
  {
    id: "g3",
    category: "graphql",
    categoryLabel: "GraphQL",
    question: "What are resolvers and @ResolveField?",
    answerHtml:
      "<p><code>@Resolver(() =&gt; Author)</code> classes hold <code>@Query</code>, <code>@Mutation</code>, and <b><code>@ResolveField</code></b> methods. <code>@ResolveField</code> resolves a relation lazily (only when requested), receiving the parent via <code>@Parent()</code>. Args use <code>@Args('id', { type: () =&gt; Int })</code>. The resolver's type argument tells Nest the parent type so field resolvers wire up.</p>",
  },
  {
    id: "g4",
    category: "graphql",
    categoryLabel: "GraphQL",
    question: "How do GraphQL subscriptions work in Nest, and the production caveat?",
    answerHtml:
      "<p><code>@Subscription(() =&gt; T)</code> returns <code>pubSub.asyncIterableIterator('event')</code>; publish with <code>pubSub.publish('event', { event: payload })</code>. Use the modern <b><code>graphql-ws</code></b> transport (not the legacy <code>subscriptions-transport-ws</code>).</p><div class=\"callout warn\"><span class=\"lbl\">Caveat</span> The default in-memory <code>PubSub</code> doesn't work across instances — back it with <code>graphql-redis-subscriptions</code> in production. Federation doesn't support subscriptions.</div>",
  },
  {
    id: "g5",
    category: "graphql",
    categoryLabel: "GraphQL",
    question: "What is Apollo Federation and when do you use it?",
    answerHtml:
      "<p>Federation splits one graph into <b>subgraphs</b> (owned by different teams/services) composed by a <b>gateway</b> into a supergraph. Mark an entity with <code>@key(fields: \"id\")</code> and implement <code>@ResolveReference()</code> so the gateway can hydrate it across subgraphs. Use it when a single monolithic schema becomes a team bottleneck; for a single team, one schema is simpler.</p>",
  },
  {
    id: "g6",
    category: "graphql",
    categoryLabel: "GraphQL",
    question: "How do guards/pipes/filters work in GraphQL resolvers?",
    answerHtml:
      "<p>The same enhancers work, but the execution context differs: use <code>GqlExecutionContext.create(ctx)</code> to read the GraphQL args/context (there's no HTTP <code>req</code> in the usual place). Field-resolver enhancers are <b>off by default</b> (enable via <code>fieldResolverEnhancers</code>) because running a guard per field over a large list is expensive.</p>",
  },

  // ---------------- WEBSOCKETS ----------------
  {
    id: "w1",
    category: "ws",
    categoryLabel: "WebSockets",
    question: "What is a Gateway and its lifecycle hooks?",
    answerHtml:
      "<p>A <code>@WebSocketGateway()</code> class is a provider (DI-capable) that handles socket events. Handlers: <code>@SubscribeMessage('event')</code> with <code>@MessageBody()</code> + <code>@ConnectedSocket()</code>. Lifecycle: <code>afterInit</code> (<code>OnGatewayInit</code>), <code>handleConnection</code> (<code>OnGatewayConnection</code>), <code>handleDisconnect</code> (<code>OnGatewayDisconnect</code>). Inject the server with <code>@WebSocketServer()</code>.</p><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> Gateways are <b>singletons</b> — they cannot be request-scoped (a live socket can't be re-instantiated per message). Keep per-connection state on the socket.</div>",
  },
  {
    id: "w2",
    category: "ws",
    categoryLabel: "WebSockets",
    question: "socket.io (IoAdapter) vs ws (WsAdapter) — how to choose?",
    answerHtml:
      "<p><b>IoAdapter</b> (socket.io, the default) gives namespaces, <b>rooms</b>, acknowledgements, and auto-reconnect — richest features. <b>WsAdapter</b> (<code>@nestjs/platform-ws</code>) is faster and uses the native browser WebSocket, but has no rooms/namespaces. Pick socket.io for chat/presence apps that need rooms; pick ws for lean, high-throughput streaming.</p>",
  },
  {
    id: "w3",
    category: "ws",
    categoryLabel: "WebSockets",
    question: "How do you scale WebSockets across multiple instances?",
    answerHtml:
      "<p>A socket lives on one node, so an event emitted on node A won't reach a client connected to node B. Use the <b>socket.io Redis adapter</b> (<code>@socket.io/redis-adapter</code>): it publishes room/broadcast events through Redis pub/sub so all nodes deliver them. Pair with sticky sessions or force the <code>websocket</code> transport so a client stays on one node.</p>",
  },
  {
    id: "w4",
    category: "ws",
    categoryLabel: "WebSockets",
    question: "How do you authenticate a WebSocket connection?",
    answerHtml:
      "<p>Validate the token during the <b>handshake</b>, not per message: read <code>socket.handshake.auth.token</code> (or a query param) in a custom adapter or in <code>handleConnection</code>, verify the JWT, attach the user to the socket, and disconnect on failure. Guards can also run on <code>@SubscribeMessage</code> handlers (throwing <code>WsException</code>), but authenticating once at connect is cheaper and standard.</p>",
  },
];

export const FLASHCARD2_FILTERS = [
  { value: "data", label: "Data & ORM" },
  { value: "auth", label: "Auth" },
  { value: "testing", label: "Testing" },
  { value: "graphql", label: "GraphQL" },
  { value: "ws", label: "WebSockets" },
];
