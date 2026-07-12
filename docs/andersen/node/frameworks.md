# Node.js — web frameworks

### Express middleware pipeline
**They ask:** "How does Express's middleware chain work, and what does calling next() actually do?"

Express models a request as a pipeline: every route handler is just a middleware function `(req, res, next)`, and they run in the exact order they were registered — `app.use()` and route handlers are the same mechanism under the hood. `next()` is what hands control to the *next* middleware in that chain; if a handler never calls `next()` and never sends a response, the request hangs forever with no error and no timeout by default.

```js
app.use((req, res, next) => {
  console.log(req.method, req.url); // logging middleware
  next(); // must call this or the request stalls here
});

app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id }); // ends the chain by sending a response
});
```

**Say it:** "Every Express handler is middleware in a chain, and next() is the only thing that advances it — forgetting to call next() (or to send a response) doesn't error, it just hangs the request silently, which is one of the most common Express bugs in the wild."
**Red flag:** Calling `next()` *and* `res.send()` in the same handler without an early `return` — you get a "headers already sent" error because the next middleware also tries to respond.

### Express error-handling middleware
**They ask:** "How do you write error-handling middleware in Express, and what makes it different from regular middleware?"

Express identifies error-handling middleware purely by **arity** — a function with exactly four parameters `(err, req, res, next)` — and it's the only kind of middleware you reach by calling `next(err)` instead of `next()`. Once you call `next(err)`, Express skips every remaining regular middleware/route handler and jumps straight to the nearest error-handling middleware.

```js
app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await db.findUser(req.params.id);
    res.json(user);
  } catch (err) {
    next(err); // hands off to error middleware instead of throwing
  }
});

// must be registered last, and must have exactly 4 params
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal error' });
});
```

**Say it:** "Express tells error middleware apart by counting parameters — exactly four means error handler — and next(err) is the only way in; a thrown error inside an async handler won't be caught by Express automatically unless you catch it and call next(err) yourself (pre-Express 5) or use an async-wrapping helper."
**Red flag:** `throw`ing inside an `async` route handler and expecting Express (pre-5) to catch it the way it catches sync throws — unhandled promise rejections from async handlers don't reach Express's error middleware without an explicit try/catch + next(err) or a wrapper utility.

### Express routing internals
**They ask:** "How does Express match a route, and how do route-level vs app-level middleware differ?"

Express compiles each registered path (`/users/:id`) into a regex via `path-to-regexp` and tries routes in registration order, stopping at the first match unless that handler calls `next()` to fall through. App-level middleware (`app.use(fn)`) runs for every request regardless of path; route-level middleware is scoped to one route or router (`router.get('/x', mw1, mw2, handler)`) and only runs for matching requests — both are the same underlying mechanism, just registered at different scopes.

```js
const router = express.Router();
router.use(requireAuth);      // scoped to this router only
router.get('/profile', getProfile);
app.use('/api', router);      // mounted under /api, so requireAuth only applies there
```

Route params (`:id`) are parsed out of the matched path into `req.params`; query strings are separate and land in `req.query` — a common confusion point for candidates who haven't looked under the hood.

**Say it:** "Routes match in registration order via compiled regex, first match wins unless it falls through with next() — mounting a Router under a path scope lets me apply middleware like auth to a whole subtree without touching every route individually."
**Red flag:** Registering a catch-all error or 404 handler before your actual routes — order is the whole mechanism in Express, so a catch-all registered too early swallows every request behind it.

### NestJS's architecture
**They ask:** "What is NestJS's core architecture, and why did it choose Angular-style DI over Express's minimalism?"

Express gives you routing and middleware and deliberately nothing else — architecture is entirely your call, which is flexible for small services and a liability at scale, where every team reinvents module boundaries and DI by hand. Nest imposes structure: modules, controllers, and injectable providers wired together via a dependency-injection container, borrowed directly from Angular's architecture, specifically to give large teams a consistent, testable structure without each team inventing their own.

```ts
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

Under the hood Nest still runs on Express (or Fastify, pluggable via an adapter) — it's a structural layer on top, not a replacement for the HTTP handling itself.

**Say it:** "Nest is Express (or Fastify) plus an opinionated, DI-driven module system borrowed from Angular — the trade is less freedom for more consistency and testability at scale, which is exactly the trade a small service doesn't need but a large team does."
**Red flag:** Describing Nest as "a completely different runtime from Express" — it's an architectural layer that sits on top of Express/Fastify by default; you can even access the underlying Express instance directly when you need to.

### Providers, modules, and DI in Nest
**They ask:** "Walk through how a Nest module wires providers and controllers together via DI."

A **provider** is anything Nest's DI container can inject — typically a `@Injectable()` service class. A **module** declares which controllers it exposes and which providers it owns (and can `export` providers for other modules to `import` and reuse). Nest resolves constructor parameter types at startup to build the dependency graph and instantiate everything in the right order — you never call `new UsersService()` yourself.

```ts
@Injectable()
class UsersService {
  constructor(private readonly db: DatabaseService) {} // Nest injects this
}

@Controller('users')
class UsersController {
  constructor(private readonly usersService: UsersService) {} // and this
}

@Module({
  controllers: [UsersController],
  providers: [UsersService, DatabaseService],
})
class UsersModule {}
```

**Say it:** "Nest builds the object graph for you from constructor types — a provider is anything injectable, a module is a boundary that declares what it owns and what it exports — which is what makes swapping a real DatabaseService for a test double in unit tests trivial without touching the classes that consume it."
**Red flag:** Manually `new`-ing a service instead of letting Nest inject it — that breaks the DI container's ability to manage its lifecycle (singleton scope by default) and defeats the whole point of using Nest.

### Guards, interceptors, and pipes in Nest
**They ask:** "What are guards, interceptors, and pipes in Nest, and where does each run in the request lifecycle?"

They run in a fixed order for a reason — each answers a different question. **Guards** answer "can this request proceed at all" (auth/authorization) and run *before* the route handler; returning `false` short-circuits the request with a 403 before any handler code runs. **Pipes** answer "is the input valid/well-shaped," running just before the handler to validate and transform arguments (`ValidationPipe` rejecting a malformed DTO). **Interceptors** wrap the handler call itself — they can run logic before *and* after (logging, response transformation, caching), because they get access to the handler's return value via RxJS operators.

```ts
@UseGuards(AuthGuard)
@UsePipes(new ValidationPipe())
@Get('profile')
@UseInterceptors(LoggingInterceptor)
getProfile(@Body() dto: GetProfileDto) { ... }
```

**Say it:** "Guards gate access before the handler runs, pipes validate/transform the input right before the handler, interceptors wrap the whole call and can touch the response on the way out — the order isn't arbitrary, each is scoped to a different question in the request lifecycle."
**Red flag:** Putting authorization logic in an interceptor instead of a guard — interceptors run *after* the handler has already been reached in the pipeline for some checks, so auth belongs in a guard specifically so unauthorized requests never touch handler logic at all.

### What LoopBack adds over hand-rolled Express
**They ask:** "What does LoopBack add on top of Express, and when is that worth the extra structure?"

LoopBack is a full API framework that generates a working REST (or GraphQL) API and OpenAPI spec directly from a data model definition — models, repositories, and datasource connectors are first-class, so CRUD endpoints, validation, and relations exist without hand-writing route handlers for each one. That's worth it when the API surface really is "CRUD over a well-defined schema" (admin panels, internal tooling, data-heavy services) and costly when your API's real complexity is business logic that doesn't map cleanly to generated CRUD.

**Say it:** "LoopBack trades hand-rolled routing for generated CRUD-plus-OpenAPI straight from a model definition — it's a big win when the API is genuinely data-model-shaped, and overhead when the real complexity is business logic the generator can't express."
**Red flag:** Reaching for LoopBack (or any model-driven generator) on an API whose complexity is workflow/business-rule heavy rather than CRUD-heavy — you end up fighting the generator more than you would've spent hand-writing the routes.

### LoopBack's model-driven REST generation
**They ask:** "How does LoopBack generate REST APIs from a data model?"

You define a model (fields, types, validation, relations to other models) and a datasource (which DB/connector backs it); LoopBack's repository layer then exposes a full set of REST endpoints — list, get, create, update, delete, plus relation endpoints — automatically, along with an OpenAPI spec generated from the same model definition, so docs stay in sync with the actual API by construction rather than by discipline.

```ts
@model()
class User extends Entity {
  @property({ type: 'string', required: true }) email: string;
  @property({ type: 'string' }) name: string;
}
// repository + controller scaffolding wires CRUD endpoints to this model automatically
```

**Say it:** "The model definition is the single source of truth — LoopBack derives the CRUD endpoints and the OpenAPI spec from it, so the docs can't drift from the API the way hand-maintained Swagger files do."
**Red flag:** Assuming generated CRUD endpoints are "done" without adding authorization per operation — generated endpoints default to whatever the framework's default access policy is, and forgetting to lock that down is a real, common vulnerability in scaffolded APIs.

### Hapi's configuration-over-code philosophy
**They ask:** "How does Hapi's route configuration differ from Express's middleware chain?"

Where Express composes behavior by chaining middleware functions, Hapi describes a route as one declarative configuration object — validation schema, auth strategy, caching policy, and the handler all live as properties on the route definition rather than as separate middleware calls. The philosophy bet is that configuration is easier to reason about, validate, and test in isolation than an implicit chain of function calls where order matters and nothing enforces what ran before your handler.

```js
server.route({
  method: 'GET',
  path: '/users/{id}',
  options: {
    auth: 'jwt',
    validate: { params: Joi.object({ id: Joi.string().required() }) },
  },
  handler: (request, h) => getUser(request.params.id),
});
```

**Say it:** "Hapi makes a route's concerns — auth, validation, caching — explicit config on one object instead of an implicit middleware order, which trades some of Express's flexibility for routes that are easier to audit and test in isolation."
**Red flag:** Calling Hapi "just Express with more boilerplate" — the actual trade-off is implicit middleware ordering (Express) versus explicit declarative config (Hapi), not a difference in raw capability.

### Hapi plugins
**They ask:** "What are Hapi plugins for, and how do they compare to Express middleware?"

A Hapi plugin is a self-contained unit that registers routes, server methods, and decorations under its own namespace — closer to a Nest module than to a single Express middleware function, because it's meant to package a whole feature (auth, logging, a versioned API surface) as an installable, independently testable unit with its own lifecycle hooks (`onPreAuth`, `onPreHandler`, and so on) rather than a linear chain.

```js
const usersPlugin = {
  name: 'users',
  register: async (server, options) => {
    server.route({ method: 'GET', path: '/users', handler: listUsers });
  },
};
await server.register(usersPlugin);
```

**Say it:** "A plugin is a packaged feature — routes, methods, lifecycle hooks — registered as one unit, which is a coarser and more structured composition boundary than an Express middleware function chained into a pipeline."
**Red flag:** Building a large Hapi app entirely inside one server file instead of plugins — that throws away the exact modularity Hapi's plugin system exists to give you.

### Socket.io vs raw WebSockets
**They ask:** "What does Socket.io give you over the raw ws WebSocket API?"

Raw WebSockets give you a bidirectional message pipe and nothing else — no reconnection, no fallback if WebSocket is blocked by a proxy/firewall, no event routing beyond "here's a message, parse it yourself." Socket.io layers an event-based API (`socket.emit('event', data)` / `socket.on('event', cb)`) on top, plus automatic reconnection with backoff, and a transport fallback to HTTP long polling when a raw WebSocket connection can't be established.

```js
// Socket.io: named events, automatic reconnection
io.on('connection', (socket) => {
  socket.on('chat:message', (msg) => io.emit('chat:message', msg));
});

// raw ws: everything is "a message," no event routing built in
ws.on('message', (data) => {
  const { type, payload } = JSON.parse(data); // you build the routing yourself
});
```

**Say it:** "Socket.io buys you event-based routing, reconnection, and a long-polling fallback for hostile networks — raw ws buys you a thinner, more predictable protocol surface with none of that abstraction; I pick ws when I control both ends and want minimal overhead, Socket.io when I need resilience across unpredictable client networks."
**Red flag:** Assuming Socket.io "is WebSockets" — it can silently fall back to HTTP long polling, which has very different latency and scaling characteristics; not knowing that fallback exists is a real gap when debugging production connection issues.

### Rooms and namespaces in Socket.io
**They ask:** "How do rooms and namespaces let you scope broadcasts in Socket.io?"

**Namespaces** (`io.of('/admin')`) are separate communication channels over the same underlying connection — a coarse split, usually by feature area or access level, each with its own set of connected sockets and event handlers. **Rooms** are a finer-grained, dynamic grouping *within* a namespace — a socket can join/leave rooms at runtime (a chat channel, a specific document's collaborators), and you broadcast to a room without knowing which individual sockets are in it.

```js
socket.join(`document:${docId}`); // dynamic room membership
io.to(`document:${docId}`).emit('doc:update', patch); // broadcast to just that room
```

**Say it:** "Namespaces are a static, connection-level split — usually by feature; rooms are dynamic, runtime membership within a namespace — usually by resource, like 'everyone viewing this document right now' — and broadcasting to a room means I never have to track socket IDs manually."
**Red flag:** Manually tracking arrays of socket IDs to implement "broadcast to this group" — that's reinventing rooms, badly, with none of Socket.io's built-in cleanup on disconnect.

### Scaling Socket.io across processes
**They ask:** "How do you scale Socket.io across multiple Node processes or servers?"

A single Node process holds its connected sockets in memory, so `io.emit()` only reaches clients connected to *that* process — the moment you run more than one instance (cluster, multiple containers behind a load balancer), a broadcast from process A never reaches a socket connected to process B unless something bridges them. The standard fix is a Redis adapter (`@socket.io/redis-adapter`): every instance publishes emitted events to Redis pub/sub, and every instance subscribes, so a broadcast from any process reaches sockets on every process.

```js
const { createAdapter } = require('@socket.io/redis-adapter');
io.adapter(createAdapter(pubClient, subClient)); // now emits fan out across all instances
```

You also need **sticky sessions** at the load balancer (route a given client to the same server instance across requests) if you're using the long-polling fallback transport, since polling requires hitting the same process repeatedly to maintain session state.

**Say it:** "Socket.io state is per-process by default, so scaling horizontally needs a pub/sub adapter like Redis to fan broadcasts out across instances, plus sticky sessions at the load balancer if long polling is in play — skip either and messages silently don't reach every connected client."
**Red flag:** Scaling to multiple Node instances behind a load balancer without adding the Redis adapter — it "works" in testing (few clients, one instance gets lucky) and then randomly drops messages in production once traffic actually spreads across instances.

### Koa vs Express middleware model
**They ask:** "How does Koa's middleware model differ from Express's, and why does that matter for error handling?"

Express middleware is callback-based and one-directional through `next()` — control flows forward, and there's no clean built-in way to run code *after* downstream middleware finishes without nesting callbacks. Koa middleware is `async` and uses `await next()`, which suspends the current middleware, runs everything downstream, and then resumes — giving you a genuine "before and after" shape without callback nesting, and letting a single `try/catch` around `await next()` catch errors from *any* downstream middleware.

```js
// Koa: one try/catch wraps the whole downstream chain
app.use(async (ctx, next) => {
  try {
    await next(); // runs everything downstream, then control returns here
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { error: err.message };
  }
});
```

**Say it:** "Koa's await next() makes middleware a true onion — code before and after downstream middleware in the same function — which is what lets one try/catch at the top catch errors from anywhere in the chain, something Express's forward-only next() can't do without extra plumbing."
**Red flag:** Writing Koa middleware without `await` in front of `next()` — you lose the "onion" ordering guarantee entirely, and code after the call runs before downstream middleware actually finishes.

### Koa's context object and async composition
**They ask:** "What is Koa's ctx object, and how does async/await middleware composition actually work?"

Koa merges `req`/`res` into one `ctx` (context) object per request, with `ctx.request` and `ctx.response` as convenience wrappers — the goal was a smaller, cleaner core than Express, deliberately shipping with no bundled middleware (no router, no body parser) so you compose exactly what you need. Middleware composition itself is implemented with a small recursive function (`koa-compose`) that wraps each middleware's `next` in a promise chain, which is what makes `await next()` actually wait for the entire downstream stack before resuming.

```js
app.use(async (ctx, next) => {
  ctx.state.start = Date.now();
  await next();
  ctx.set('X-Response-Time', `${Date.now() - ctx.state.start}ms`); // runs after downstream
});
```

**Say it:** "ctx unifies request and response into one object per call, and koa-compose is what turns a list of async middleware into a single promise chain where await next() genuinely waits for everything downstream — that's the mechanism, not magic."
**Red flag:** Assuming Koa ships a router or body parser out of the box the way Express does — Koa's core is intentionally minimal; you add `koa-router` and `koa-bodyparser` yourself, which is the whole point of its "smaller core, compose what you need" philosophy.

### Common Express security middleware
**They ask:** "What does helmet actually protect against, and what doesn't it cover?"

`helmet` is a bundle of small middleware functions that each set one HTTP response header Express doesn't set by default — `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, and others — each mitigating a specific class of attack (CSP reduces XSS blast radius, HSTS forces HTTPS on repeat visits, `nosniff` stops MIME-sniffing attacks). It's a checklist of headers, not a firewall — it does nothing about SQL injection, broken auth, insecure deserialization, or any vulnerability that isn't fixed by a response header.

```js
const helmet = require('helmet');
app.use(helmet()); // sane header defaults; still needs per-app CSP tuning
```

**Say it:** "helmet is a curated set of security-relevant headers, each closing one specific gap — it's necessary hygiene, not a substitute for input validation, parameterized queries, or proper auth, which live entirely outside what a header can fix."
**Red flag:** Treating `app.use(helmet())` as "the app is secure now" — headers mitigate a narrow, real set of browser-side attacks and say nothing about your query layer, auth logic, or input validation.

### Rate limiting and DoS protection
**They ask:** "How would you add rate limiting to an Express or Nest API, and what attack does it mitigate?"

Rate limiting caps how many requests a client (by IP, API key, or user id) can make in a window, which mitigates brute-force login attempts, credential stuffing, and basic denial-of-service by a single abusive client — it does not mitigate a distributed attack spread across many IPs, which needs infrastructure-level mitigation (a CDN/WAF) in front of the app.

```js
const rateLimit = require('express-rate-limit');
app.use('/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 })); // 5 attempts per 15 min per IP
```

In-memory rate limiting (the default store) resets per process and doesn't coordinate across instances — behind a load balancer with multiple Node processes, a client can get `max` attempts *per instance*, not globally, unless you back the limiter with a shared store like Redis.

**Say it:** "Rate limiting caps abuse per client identity within a window — it stops brute force and single-source DoS, but it needs a shared store like Redis to actually be a *global* limit once you're running more than one instance, and it does nothing against a distributed attack, which is a CDN/WAF problem."
**Red flag:** Deploying the default in-memory rate limiter behind a multi-instance load-balanced deployment and believing the limit is enforced globally — it's enforced per-process, so the real ceiling is `max × instance count`.

### Testing an Express or Nest endpoint
**They ask:** "How do you write an integration test for an Express or Nest endpoint without hitting a real database?"

The point is to test the real HTTP layer — routing, middleware, status codes, response shape — without the flakiness and setup cost of a real network call or a real database. `supertest` drives requests directly against your app's `listen`-able instance in-process (no real socket, no real port), and you swap the real DB layer for an in-memory fake or a mocked repository so the test is deterministic and fast.

```js
const request = require('supertest');
const app = require('../app');

test('GET /users/:id returns 404 for missing user', async () => {
  jest.spyOn(userRepo, 'findById').mockResolvedValue(null);
  const res = await request(app).get('/users/999');
  expect(res.status).toBe(404);
});
```

Nest's `@nestjs/testing` module builds a full test module with real DI, so you override just the provider that talks to the DB (`overrideProvider`) while keeping everything else — guards, pipes, interceptors — wired exactly as production runs it.

**Say it:** "supertest drives the app's actual HTTP layer in-process — routing, middleware, status codes all run for real — while I mock only the data layer, which is what makes an integration test both fast and honest about catching routing/middleware regressions a pure unit test would miss."
**Red flag:** Calling a controller method directly in a unit test and calling that "testing the endpoint" — that skips routing, middleware, guards, and serialization entirely, which is most of what can actually break in a real request.

### Mocking timers and IO in Node tests
**They ask:** "How do you test code that uses setTimeout or fs without slowing down your test suite?"

Real timers make tests slow and flaky (a test asserting behavior after a 30-second timeout either waits 30 real seconds or gets skipped/reduced, both bad). Test frameworks provide fake timers (`jest.useFakeTimers()`) that let you advance virtual time synchronously (`jest.advanceTimersByTime(30000)`), so time-dependent logic runs instantly and deterministically in the test.

```js
jest.useFakeTimers();
test('retries after backoff', () => {
  const cb = jest.fn();
  scheduleRetry(cb, 5000);
  jest.advanceTimersByTime(5000); // instant, not a real 5-second wait
  expect(cb).toHaveBeenCalled();
});
```

For `fs`, the usual approach is dependency injection or module mocking (`jest.mock('fs')`) rather than touching the real filesystem — a real-disk test is slow, leaves artifacts, and behaves differently across CI environments (permissions, path separators) than it does locally.

**Say it:** "Fake timers let time-dependent logic run in zero real wall-clock time and stay deterministic, and mocking fs keeps tests off the real disk entirely — both are about removing real-world nondeterminism from something that should be a pure logic test."
**Red flag:** Writing a test with a real `setTimeout` and an actual multi-second `await` to "wait for it to happen" — that's a slow, flaky test disguised as a passing one; fake timers exist specifically so you never need to do this.
