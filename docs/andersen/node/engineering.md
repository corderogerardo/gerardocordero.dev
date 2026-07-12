# Engineering practices

### OOP principles in JS/TS
**They ask:** "Walk through encapsulation, abstraction, inheritance, and polymorphism with real JS/TS examples — and which ones actually earn their keep in a Node codebase."

**Encapsulation** bundles state with the behavior that operates on it and hides internals (`#private` fields, or a module's non-exported internals) so callers depend only on a stable interface. **Abstraction** exposes what something does, not how — an interface/type describing a `PaymentProvider` without callers knowing if it's Stripe or PayPal underneath. **Inheritance** shares behavior down a hierarchy (`class AdminUser extends User`), but is the most misused of the four in JS — deep hierarchies get brittle fast. **Polymorphism** lets different types respond to the same call in their own way — several classes implementing the same interface, called uniformly by client code.

```ts
interface PaymentProvider { charge(amount: number): Promise<Receipt>; }
class StripeProvider implements PaymentProvider { async charge(a) { /* ... */ } }
class PaypalProvider implements PaymentProvider { async charge(a) { /* ... */ } }
function checkout(provider: PaymentProvider, amount: number) { return provider.charge(amount); } // polymorphic call site
```

**Say it:** "Encapsulation and polymorphism pull the most weight in a real Node codebase — hiding internals and coding to an interface — while I reach for inheritance sparingly, since deep class hierarchies tend to get brittle faster than composition does."
**Red flag:** Building a deep inheritance chain (`Base > Middle > Specific > MoreSpecific`) to share behavior. It's usually a sign composition — small, combinable pieces — would express the same behavior with far less coupling.

### Composition over inheritance
**They ask:** "Why do senior engineers generally prefer composition over inheritance?"

Inheritance couples a subclass to its entire ancestor chain's implementation — changing a base class can silently break every descendant (the "fragile base class" problem), and a class can only extend one thing, forcing awkward hierarchies when behavior doesn't cleanly nest. Composition builds behavior by *combining* small, independent pieces (functions, injected dependencies, mixins) rather than inheriting them — each piece is testable and swappable in isolation, and an object can combine as many behaviors as it needs without a rigid single-parent constraint.

```ts
// inheritance: rigid, single hierarchy
class Logger extends BaseService { }

// composition: swap pieces independently
function createService(logger: Logger, db: Database) {
  return { save: (x) => { logger.log('saving'); return db.insert(x); } };
}
```

**Say it:** "Inheritance couples a subclass to its entire ancestor chain's implementation, so a base class change can silently break every descendant — composition combines small, independently testable pieces, which is why dependency injection reads as composition, not inheritance."
**Red flag:** Reaching for inheritance to share a handful of utility methods across unrelated classes. That's exactly what a shared function or injected dependency solves without coupling those classes together.

### Big-O and choosing the right data structure
**They ask:** "How do you reason about algorithmic complexity when picking a data structure in real code, not a whiteboard problem?"

The senior signal isn't reciting Big-O notation, it's mapping the *actual operation your code does most* to the structure that makes it cheap: repeated membership checks want a `Set`/`Map` (O(1)) over an array's `.includes` (O(n)); a priority-ordered queue (job scheduling, Dijkstra) wants a heap (O(log n) insert/extract) over a sorted array (O(n) insert); frequent inserts/deletes at arbitrary positions favor a linked structure over an array's O(n) shift. The mistake pattern to catch in review: an `array.includes()` or `array.find()` inside a loop, which silently turns an O(n) operation into O(n²) across the whole loop.

```js
const seen = new Set(ids); // O(1) lookup
if (seen.has(candidateId)) { /* ... */ } // vs array.includes — O(n) per check
```

**Say it:** "I pick the data structure by matching it to the operation I'll do most — repeated membership checks go to a Set, not an array — and the review-time smell I watch for is an array lookup inside a loop, since that's the classic accidental O(n²)."
**Red flag:** Optimizing an algorithm's Big-O in a hot path that runs on 10 items while ignoring an actual O(n²) pattern on a 100,000-row dataset elsewhere. Complexity only matters where n is large enough for it to matter — profile first.

### Common algorithm patterns interviewers probe
**They ask:** "What algorithm patterns come up repeatedly in senior interviews, briefly?"

**Two-pointer** — two indices moving through a sorted array/string to find pairs or reverse in place, O(n) instead of nested loops. **Sliding window** — a variable-size window over an array/string for subarray/substring problems (longest substring without repeats), avoiding recomputation by adjusting the window's edges incrementally instead of restarting. **BFS/DFS** — traversing graphs/trees, BFS for shortest-path/level-order, DFS for exhaustive exploration or backtracking. **Hash map for O(1) lookup** — turning a brute-force O(n²) pair-search into O(n) by trading space for time (classic "two sum").

```js
// sliding window: longest substring without repeating chars
let start = 0, seen = new Map(), max = 0;
for (let end = 0; end < s.length; end++) {
  if (seen.has(s[end]) && seen.get(s[end]) >= start) start = seen.get(s[end]) + 1;
  seen.set(s[end], end);
  max = Math.max(max, end - start + 1);
}
```

**Say it:** "The recurring senior interview patterns are two-pointer and sliding window for O(n) array/string problems, and trading space for time with a hash map to collapse an O(n²) brute force into O(n) — recognizing which pattern a problem maps to is the actual skill being tested."
**Red flag:** Reaching for nested loops as the first instinct on an array problem without checking whether a hash map or two-pointer approach collapses it to linear time. Interviewers are specifically listening for that recognition.

### Structured logging
**They ask:** "Why does structured logging matter more than readable console output in production?"

`console.log('user logged in: ' + userId)` is human-readable but machine-unqueryable — finding every log line for a specific user across millions of entries means grep and hope. Structured logging emits each entry as a consistent, machine-parseable shape (usually JSON) with fields like `level`, `timestamp`, `requestId`, `userId`, `message` — which is what makes a log aggregator (Datadog, ELK) able to filter, aggregate, and correlate logs across a distributed system by field, not by parsing free text. The `requestId`/correlation-ID field specifically is what lets you trace one request's full log trail across multiple services.

```js
logger.info({ event: 'user.login', userId, requestId, durationMs }, 'user logged in');
```

**Say it:** "Structured logs are queryable by field across a whole fleet of instances — I always include a correlation/request ID so I can trace one request's full path through several services, which plain `console.log` text can't give me without painful regex parsing."
**Red flag:** Logging with string concatenation (`console.log('Error: ' + err)`) in a production service with a log aggregator. It's unqueryable at scale and loses structured fields the aggregator could otherwise index and alert on.

### Application monitoring and metrics
**They ask:** "What's the difference between logs, metrics, and traces, and why do you need all three?"

**Logs** are discrete, timestamped events — good for "what exactly happened on this one request," expensive to query at high cardinality. **Metrics** are aggregated numeric time series (request rate, error rate, p99 latency) — cheap to store and graph over long time ranges, but they tell you *that* something's wrong, not *why*. **Traces** follow one request's full path across services, showing where time was actually spent — the tool for "why is this specific request slow." The senior framing (the "three pillars of observability"): metrics tell you *something* broke, traces tell you *where*, logs tell you *exactly what happened* at that point — you typically triage in that order.

```js
histogram.observe({ route: '/checkout' }, durationMs); // metric
tracer.startSpan('db.query', { parent: currentSpan });  // trace
logger.error({ orderId, err }, 'checkout failed');       // log
```

**Say it:** "Metrics tell me *something* is wrong at a glance, traces tell me *where* in the request path, logs tell me *exactly what happened* there — I triage an incident in that order instead of grepping logs first."
**Red flag:** Having only logs with no metrics or tracing on a distributed system. Diagnosing a latency regression by grepping logs across a dozen services with no trace correlation is slow and often just doesn't converge.

### Distributed tracing
**They ask:** "How does distributed tracing actually work across service boundaries?"

Each request gets a trace ID generated at the entry point (the API gateway, or the first service) and propagated on every downstream call via a header (commonly the W3C `traceparent` header, or vendor-specific equivalents) — every service that receives it attaches the same trace ID to its own spans, and each unit of work (a DB query, an HTTP call to another service) becomes a **span** with a start/end time and a parent-span reference, so the whole thing reconstructs into a tree/waterfall view showing where the request's total time was actually spent, across every service it touched.

```js
// propagate the trace context on an outbound call
fetch(url, { headers: { traceparent: currentSpan.traceparent } });
```

**Say it:** "Tracing works by propagating one trace ID through every downstream call header and stitching each service's spans back into a waterfall — the reason it needs explicit propagation is that without it, each service's trace is an island with no way to correlate to the request that triggered it."
**Red flag:** Adding tracing to a service without propagating the trace context header to its downstream calls. Each service ends up with an isolated trace instead of one connected picture of the whole request.

### Refactoring safely
**They ask:** "What makes a refactor 'safe,' and how do you refactor a risky piece of legacy code with no tests?"

A refactor changes internal structure without changing external behavior — the safety comes entirely from having a way to *prove* behavior didn't change, which for untested legacy code means writing **characterization tests** first: tests that pin down current actual behavior (bugs and all), not the intended behavior, purely as a safety net before touching anything. For larger structural changes, the **strangler pattern** — building the new implementation alongside the old, routing an increasing share of traffic to it, and only removing the old path once the new one is proven — avoids a risky big-bang rewrite and cutover.

```
1. Write characterization tests against current behavior (no changes yet)
2. Refactor in small steps, running tests after each
3. For a large rewrite: strangle — route traffic incrementally, old path stays until new is proven
```

**Say it:** "Safety comes from having tests that pin down current behavior before I touch anything — for legacy code with none, I write characterization tests first, and for a large rewrite I strangle it incrementally instead of a big-bang cutover with no rollback path."
**Red flag:** Refactoring untested legacy code directly "carefully, by reading it closely." Careful reading doesn't catch what a test would — the safety net has to exist before the change, not be inferred from confidence.

### Code smells worth flagging in review
**They ask:** "What are the code smells you actually flag in review, beyond style nits?"

The ones that predict real future pain: **long functions doing multiple unrelated things** (hard to test, hard to reason about, high change-risk); **duplicated logic** in more than one place (a bug fix applied to one copy and forgotten in the other); **primitive obsession** (passing five loose string/number params instead of one typed object, losing the compiler's ability to catch a swapped argument order); **deep nesting** (more than 2-3 levels of `if`/loop nesting usually means an early-return or extraction would clarify intent); and **feature envy** (a function that reaches into another object's internals repeatedly instead of that object exposing the behavior itself).

```js
// primitive obsession — easy to swap params silently
function createOrder(userId, productId, qty, price, discount) {}
// fixed — compiler catches misuse
function createOrder(order: OrderInput) {}
```

**Say it:** "The smells I actually flag predict future bugs, not just readability — duplicated logic that'll drift out of sync, primitive obsession that lets argument order swap silently, and deep nesting that's usually an unextracted function hiding in plain sight."
**Red flag:** Flagging only naming/formatting in review while a genuinely risky duplicated-logic pattern goes unmentioned. Style nits are cheap to catch with a linter; the value a human reviewer adds is exactly the structural risk a linter can't see.

### Unit vs integration vs e2e testing
**They ask:** "How do you decide what belongs in a unit test vs an integration test vs an e2e test?"

**Unit tests** isolate one function/module, mocking its dependencies — fast, precise about what broke, but they don't prove the pieces actually work *together*. **Integration tests** exercise multiple real collaborating pieces (a route handler talking to a real, ephemeral test database) — slower, but catch the wiring bugs unit tests structurally can't, since mocks can drift from what the real dependency actually does. **E2E tests** drive the whole system through its real interface (browser, HTTP) — the highest confidence, slowest, most brittle, reserved for the critical user paths. The **testing pyramid** framing: many fast unit tests, fewer integration tests, a small number of e2e tests for what truly matters end-to-end.

```
many:  unit tests (fast, isolated, mocked deps)
some:  integration tests (real DB, real wiring)
few:   e2e tests (full system, critical paths only)
```

**Say it:** "I follow the testing pyramid — heavy on fast unit tests for logic, integration tests for the wiring unit tests can't verify because mocks can drift from reality, and e2e reserved for the handful of paths where full-system confidence actually matters."
**Red flag:** An inverted pyramid — mostly e2e tests, few unit tests. It's slow to run, flaky, and a failure tells you almost nothing about *where* the bug is, just that something broke somewhere in a huge surface area.

### Test doubles: mocks, stubs, spies, fakes
**They ask:** "What's the precise difference between a mock, a stub, a spy, and a fake?"

**Stub** returns canned data for a call, with no assertion on how it was called — used to control a dependency's output so the test can focus on the code under test's own logic. **Mock** goes further: it asserts the *interaction itself* happened correctly (called once, with specific arguments) — the test fails if the expected call didn't happen as specified, not just based on the return value. **Spy** wraps a *real* implementation while recording calls to it, so you get real behavior plus the ability to assert on how it was invoked. **Fake** is a lightweight but functionally real implementation (an in-memory database standing in for a real one) — behaves correctly, just not production-grade, useful when a stub's canned response would be too shallow to trust the test.

```js
const stub = jest.fn().mockReturnValue({ id: 1 });               // stub
const mock = jest.fn(); /* ... */ expect(mock).toHaveBeenCalledWith(x); // mock assertion
const spy = jest.spyOn(obj, 'method');                            // spy on real impl
```

**Say it:** "A stub controls output, a mock asserts the interaction happened as expected, a spy wraps a real implementation while recording calls, and a fake is a lightweight-but-real working substitute — picking the wrong one is usually what makes tests either too shallow or too brittle."
**Red flag:** Calling every test double a "mock" regardless of which behavior it actually provides. The imprecision usually correlates with over-asserting on implementation details (mocking when a simple stub would do), which is what makes tests break on harmless refactors.

### Functional programming concepts in JS
**They ask:** "What functional programming concepts show up in idiomatic JS, and why do they matter for correctness?"

**Pure functions** — same input always produces the same output, no side effects — are trivially testable and safe to memoize/parallelize/reorder, because nothing outside the function changes as a result of calling it. **Immutability** — never mutating existing data structures, always producing a new one — eliminates a whole class of bugs from shared references changing underneath code that didn't expect it (exactly the shallow-clone aliasing trap covered elsewhere in this deck). **First-class functions** — treating functions as values you can pass, return, and store — is what makes `map`/`filter`/`reduce` and higher-order functions possible at all.

```js
// impure — depends on and mutates external state
let total = 0;
function addToTotal(n) { total += n; }
// pure — same input, same output, no external state touched
function add(a, b) { return a + b; }
```

**Say it:** "Pure functions and immutability aren't academic — they eliminate the entire class of bugs where shared mutable state changes underneath code that assumed it wouldn't, which is exactly why reducers in Redux and React state updates are required to be pure."
**Red flag:** Writing a `reduce` callback (or a Redux reducer) that mutates the accumulator's nested properties directly instead of returning a new object. It breaks the purity guarantee the whole pattern depends on for correct change detection.

### Currying and composition
**They ask:** "What is currying, and how does it enable function composition?"

Currying transforms a function taking multiple arguments into a sequence of functions each taking one argument, returning the next function until all arguments are supplied — the practical payoff is **partial application**: you can pre-fill some arguments to create a specialized, reusable function. This composes naturally with `pipe`/`compose` utilities, which chain single-argument functions together into a pipeline, each stage's output feeding the next stage's input — a declarative alternative to nesting function calls or writing intermediate variables.

```js
const multiply = a => b => a * b;
const double = multiply(2); // partially applied
double(5); // 10

const pipeline = pipe(parse, validate, transform); // compose single-arg stages
pipeline(rawInput);
```

**Say it:** "Currying turns a multi-arg function into a chain of single-arg ones, which is what makes partial application and pipe-style composition possible — I reach for it when I want a specialized, reusable function derived from a general one, not as a stylistic default everywhere."
**Red flag:** Currying every function in a codebase reflexively, including ones that will never be partially applied. It adds indirection with no real payoff when a function is always called with all its arguments at once.

### What to look for in code review
**They ask:** "What does a genuinely useful code review actually check, beyond 'does it work'?"

Correctness first — does it handle the stated requirement, including edge cases and error paths, not just the happy path. Then: does it fit the codebase's existing patterns (a wildly different approach next to five similar files creates maintenance drag), is the blast radius of the change understood (what else could this touch), is there adequate test coverage for the *risk* of the change (not just line coverage), and are names/structure clear enough that the next person reading it — possibly the author in six months — doesn't have to reconstruct the reasoning from scratch.

**Say it:** "Beyond correctness, I check whether it fits existing patterns, whether test coverage matches the actual risk of the change, and whether someone unfamiliar with this PR's context could understand the reasoning from the code and its tests alone — that last one is what separates a passing review from a genuinely useful one."
**Red flag:** A review that only leaves style/formatting comments. That's what a linter is for — a human reviewer's value is judging correctness, risk, and whether the approach fits the system, not spacing.

### Giving code review feedback well
**They ask:** "How do you give critical code review feedback without it landing badly?"

Frame feedback around the code and its consequences, not the person — "this loop re-queries the DB per item, which will N+1 under load" lands very differently from "this is inefficient." Distinguish blocking issues (must fix before merge — correctness, security) from suggestions (nice-to-have, non-blocking) explicitly, so the author isn't guessing what's actually required. Ask questions when you're not sure of the intent ("was this deliberate, or missed?") rather than asserting a mistake outright — sometimes there's context you don't have, and it keeps the tone collaborative instead of adversarial.

**Say it:** "I frame feedback around consequences, not the person, and I explicitly separate blocking issues from suggestions so the author isn't left guessing what's actually required to merge — the goal of a review is to help them ship it well, not to catch them out."
**Red flag:** Leaving a comment like "this is wrong" with no explanation of why or what to do instead. It's not actionable, and it reads as a verdict rather than help getting the change to a mergeable state.

### Reactive programming and RxJS basics
**They ask:** "What is reactive programming, and what does an Observable give you over a Promise?"

Reactive programming models data as **streams of events over time** that you subscribe to and react to declaratively — a Promise resolves exactly once; an **Observable** (RxJS's core primitive, used heavily in Angular/NestJS's microservice transports) can emit zero, one, or many values over its lifetime, and crucially is **cancellable** and **lazy** — nothing happens until something subscribes, and unsubscribing stops the work, unlike a Promise which starts executing immediately and can't be cancelled once started.

```js
const clicks$ = fromEvent(button, 'click');
const debounced$ = clicks$.pipe(debounceTime(300), map(e => e.target.value));
const sub = debounced$.subscribe(handleSearch);
sub.unsubscribe(); // actually stops the work — a Promise can't do this
```

**Say it:** "An Observable can emit many values over time and is lazily started and genuinely cancellable, which a Promise — single-value, eager, uncancellable — structurally can't do; that's exactly why RxJS operators like `debounceTime` and `switchMap` are the natural fit for UI event streams."
**Red flag:** Reaching for RxJS/Observables for a single async operation that a Promise/`async-await` already models cleanly. It adds real conceptual overhead for a case where cancellation and multi-emission aren't actually needed.

### Backpressure in reactive streams vs Node streams
**They ask:** "How does backpressure in a reactive stream (RxJS) compare to backpressure in a Node stream?"

Both describe the same underlying problem — a fast producer overwhelming a slow consumer — but the mechanisms differ. Node streams handle it at the **byte/chunk level**: `write()` returns `false` when the internal buffer is full, and the producer is expected to pause until `'drain'` fires (or let `pipe()` manage it automatically) — this is covered in depth elsewhere in this deck. RxJS operates at the **event level**, and backpressure there is handled by choosing the right operator to shed or buffer excess emissions when the consumer can't keep up: `debounceTime`/`throttleTime` drop intermediate emissions, `buffer`/`bufferTime` batch them, `switchMap` cancels the previous inner subscription entirely when a new value arrives.

```js
source$.pipe(throttleTime(200)); // reactive backpressure: shed excess emissions
readable.pipe(writable);         // Node stream backpressure: buffer + pause/drain
```

**Say it:** "Both are the same fast-producer-slow-consumer problem, but Node streams manage it at the byte level with pause/drain signaling, while RxJS manages it at the event level by choosing an operator that sheds, batches, or cancels excess emissions — picking the right operator is the RxJS equivalent of respecting `write()`'s return value."
**Red flag:** Piping a fast event stream into a slow consumer with no backpressure strategy at all — either no `debounceTime`/`throttleTime` in RxJS, or ignoring `write()`'s `false` return in a raw Node stream. Both silently balloon memory as the buffer grows unbounded.

### CI/CD pipeline stages
**They ask:** "Walk through the stages of a typical CI/CD pipeline and what each is guarding against."

**Lint/format** catches style and trivial-error issues cheaply, before anything more expensive runs. **Build/typecheck** catches compile-time errors — a broken build should fail fast, before tests even run. **Test** (unit, then integration) verifies behavior. **Security scan** (dependency vulnerabilities, secret scanning) catches issues a functional test wouldn't. **Deploy to staging** verifies the artifact actually runs in a production-like environment. **Deploy to production**, typically gated by manual approval or automated canary analysis. Ordering matters: cheap, fast checks run first so a trivial mistake fails in seconds, not after a 20-minute e2e suite.

```
lint -> typecheck -> unit tests -> integration tests -> build artifact -> deploy staging -> (gate) -> deploy prod
```

**Say it:** "I order pipeline stages cheapest-and-fastest first, so a lint error fails in seconds instead of after a 20-minute test suite finishes — and I never let a deploy stage run without every earlier gate passing first."
**Red flag:** A pipeline that runs the slow e2e suite before a fast lint/typecheck step. It wastes CI minutes and developer feedback-loop time discovering a typo only after the expensive stage already ran.

### Blue-green and canary deployments
**They ask:** "What's the difference between blue-green and canary deployments, and what risk does each manage?"

**Blue-green** keeps two full production environments — the currently live one ("blue") and the new version ("green") — and cuts traffic over all at once after green is verified healthy; rollback is instant (flip the router back to blue), but it doesn't limit *blast radius* if a bug only shows up under real production load, since 100% of traffic hits the new version the moment it's live. **Canary** shifts a small percentage of real traffic to the new version first, watches error rates/latency, and gradually ramps up — it catches production-only bugs while they're still only affecting a small slice of users, at the cost of more complex traffic-routing infrastructure and needing both versions to run correctly side-by-side for longer.

```
blue-green: 100% blue -> (verify green) -> 100% green (instant cutover)
canary:      100% v1 -> 5% v2 -> (watch metrics) -> 25% v2 -> 100% v2
```

**Say it:** "Blue-green gives instant, clean rollback but no blast-radius limiting since the cutover is all-at-once; canary limits blast radius by ramping gradually while watching real metrics — I reach for canary specifically when a change is risky enough that I want production signal before it reaches everyone."
**Red flag:** Calling a rolling deploy (replacing instances gradually with no traffic-percentage control or metric gating) a "canary." A real canary requires deliberately watching metrics at each traffic increment before proceeding, not just rolling through instances on a timer.

### Common web security vulnerabilities
**They ask:** "Walk through the OWASP-style vulnerabilities you actually defend against in a Node API."

**SQL/NoSQL injection** — untrusted input concatenated into a query; fixed by parameterized queries/prepared statements, never string interpolation. **XSS** — untrusted input rendered as HTML/JS in a browser; fixed by output encoding and a strict Content-Security-Policy. **Broken authentication/session management** — weak password hashing, predictable session tokens, missing rate limiting on login. **Insecure deserialization** — trusting `eval`/unsafe deserializers on untrusted input, which can lead to remote code execution. **Sensitive data exposure** — logging secrets/PII, transmitting over plain HTTP, weak encryption at rest.

```js
// injection-safe: parameterized query
db.query('SELECT * FROM users WHERE email = $1', [email]);
// injection-vulnerable: string concatenation
db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

**Say it:** "The pattern behind almost every item on that list is the same — untrusted input treated as trusted code or trusted structure — so my default defense is parameterize, encode on output, and validate/sanitize at every trust boundary, not just the obvious ones."
**Red flag:** Building any query, shell command, or HTML output by string-concatenating user input, "just this once, it's an internal tool." Internal tools get exposed, forked, and copy-pasted into external-facing code more often than anyone plans for.

### Hashing vs encryption
**They ask:** "What's the practical difference between hashing and encryption, and why does password storage need one specifically, never the other?"

**Encryption** is reversible by design — given the right key, ciphertext converts back to plaintext, which is exactly right for data you need to *read back* later (a stored API key, a message payload). **Hashing** is one-way by design — there's no key that turns a hash back into the original input, which is exactly right for a password: the server never needs the plaintext back, only needs to verify a login attempt matches. Password hashing specifically needs a *slow*, salted algorithm (bcrypt, argon2, scrypt) — a fast general-purpose hash (SHA-256 alone) is deliberately unsuitable because its speed makes brute-forcing leaked hashes cheap.

```js
const hash = await bcrypt.hash(password, 12); // one-way, salted, deliberately slow
await bcrypt.compare(attempt, hash);           // verify without ever storing plaintext
```

**Say it:** "Passwords get hashed, never encrypted, because the server should never be able to recover the plaintext even with a key — and password hashing specifically needs a deliberately slow, salted algorithm like bcrypt, since a fast general hash makes brute-forcing a leaked database cheap."
**Red flag:** Storing passwords encrypted (reversibly) "so we can help users who forgot theirs." That means anyone with the decryption key — or anyone who breaches it — can recover every plaintext password; the correct recovery flow is a reset token, never plaintext retrieval.

### JWT and session-based auth trade-offs
**They ask:** "JWT vs server-side sessions — what's the actual trade-off, not just 'JWT is stateless'?"

Server-side sessions store session data server-side (in memory, Redis) keyed by an opaque session ID the client holds in a cookie — revocation is instant (delete the server-side record) and the client never sees any session data, but it requires a shared session store across every server instance, adding infrastructure and a lookup per request. **JWT** encodes claims directly in a signed token the client holds — no server-side lookup needed to validate it (just verify the signature), which scales trivially across instances, but the trade-off is real: a JWT **can't be revoked** before its expiry without maintaining a server-side blocklist (which reintroduces the exact server-side state JWT was meant to avoid), so compromised tokens stay valid until they naturally expire.

```js
// session: instant revocation, needs shared store
req.session.destroy();
// JWT: no server lookup, but can't truly revoke before exp
jwt.sign({ userId }, secret, { expiresIn: '15m' }); // short expiry limits the exposure window
```

**Say it:** "JWT's statelessness is real, but it comes at the cost of unrevokability — a stolen token stays valid until it expires — so I keep JWT expiry short and pair it with a refresh-token rotation flow, or fall back to server-side sessions when instant revocation genuinely matters more than horizontal scalability."
**Red flag:** Issuing a JWT with a long expiry (days/weeks) and no revocation strategy for a security-sensitive application. A stolen long-lived token is a stolen credential with no way to cut it off before it naturally expires.

### Input validation and sanitization
**They ask:** "What's the difference between validation and sanitization, and where should each happen?"

**Validation** rejects input that doesn't meet the expected shape/constraints — reject, don't silently fix, so the caller knows their request was wrong. **Sanitization** transforms input to make it safe for a specific context — escaping HTML entities before rendering, stripping/normalizing whitespace — appropriate when the input is otherwise legitimate but needs to be made safe for where it's going. Validation should happen at the **API boundary**, as early as possible, with a schema (`zod`, `joi`, class-validator in Nest) so malformed data never reaches business logic; sanitization happens at the **output boundary**, specific to the sink (HTML, SQL, shell) it's headed into.

```ts
const schema = z.object({ email: z.string().email(), age: z.number().int().min(0) });
const result = schema.safeParse(req.body); // validate at the boundary, reject if invalid
```

**Say it:** "Validation rejects at the input boundary with a schema so bad data never reaches business logic; sanitization transforms at the output boundary, specific to where the data is headed — conflating the two, like trying to 'sanitize' invalid input into something acceptable, hides bugs instead of surfacing them."
**Red flag:** "Fixing" invalid input by silently coercing it into something plausible (e.g. clamping an out-of-range value) instead of rejecting the request. The caller never learns their integration is sending bad data, and the silent coercion can mask a real upstream bug.
