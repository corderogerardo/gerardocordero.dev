# JavaScript — Andersen S2 (ES6+: 8 skills · ES5: 12 skills)

Language depth: the ES6+ rows probe modern primitives (WeakMap, Proxy, generators, Promise combinators as polyfills); the ES5 rows probe fundamentals most seniors have forgotten how to articulate (GC generations, lexical environments, the event loop's "fake multithreading").

> Part of the [Andersen React Native S2 study guide](README.md). Drill these with [flashcards.md](flashcards.md).

## JS (ES6+)

### WeakMap, WeakSet, Proxy and tagged templates
**They ask:** "What problems do WeakMap and Proxy solve that a plain Map or object can't, and where have you seen tagged templates in real code?"

These features exist to solve lifecycle and interception problems that plain objects can't: WeakMap prevents memory leaks in caches, and Proxy is the foundation of modern reactivity systems. A `WeakMap` holds its keys weakly — if the key object has no other references, the garbage collector reclaims the entry. That makes it the correct structure for associating metadata or private data with objects you don't own (DOM nodes, request objects) without pinning them in memory. The trade-off is deliberate: weak collections are not iterable and have no `size`, because enumerating them would expose GC timing. `WeakSet` is the membership-only variant.

`Proxy` wraps a target and intercepts fundamental operations via traps — `get`, `set`, `has`, `deleteProperty`, `apply` — while `Reflect` provides the matching default behaviors, so a trap can customize one case and delegate the rest with `Reflect.get(...)`. This is how MobX, Immer, and Vue 3 track reads and writes without explicit setters.

Any object becomes `for...of`-able by implementing `Symbol.iterator` — the same protocol that powers spread and destructuring.

A tagged template is a function receiving the string parts and interpolated values separately: `` fn(strings, ...values) `` — which is why `styled-components` and `gql` can parse CSS or GraphQL out of a template literal at runtime.

**Say it:** "I use WeakMap when the object's lifetime should control the entry's lifetime — a cache that garbage-collects itself — and I know Proxy plus Reflect is what makes MobX and Vue reactivity work without explicit setters."
**Red flag:** Calling WeakMap "a Map you can't iterate" as if that's a limitation — the non-iterability is the design: say it exists so the GC can reclaim entries, which iteration would make observable.

### BigInt
**They ask:** "When would a JavaScript Number silently corrupt your data, and how does BigInt fix it?"

The business risk is silent precision loss: `Number` is an IEEE 754 double, so integers above `Number.MAX_SAFE_INTEGER` (2^53 − 1) can no longer be represented exactly — two different backend IDs can round to the same JavaScript value with no error thrown. `BigInt` is an arbitrary-precision integer type: literal `10n`, constructor `BigInt("9007199254740993")`, its own `typeof "bigint"`.

The type is deliberately strict. Mixing `BigInt` and `Number` in arithmetic throws a `TypeError` rather than guessing which precision to lose — you convert explicitly. Division truncates (`5n / 2n === 2n`) because there is no fractional part. And `JSON.stringify` throws on a BigInt, which matters in practice: the standard pattern for 64-bit IDs (Twitter/X snowflake IDs, database bigserial keys) is to transmit them as **strings** over JSON and parse with `BigInt(str)` only when you need arithmetic — nanosecond timestamps and cryptographic math are the other common cases.

For a React Native engineer the trap usually appears at the API boundary: a backend sends a numeric 64-bit ID, `JSON.parse` coerces it through `Number`, and the last digits are already wrong before your code runs. The fix is contract-level — IDs as strings — not client-side.

**Say it:** "Above 2^53 − 1, Number loses integer precision silently, so for 64-bit backend IDs I keep them as strings in JSON and use BigInt only when arithmetic is actually required."
**Red flag:** Proposing "just use BigInt everywhere for IDs" — JSON.stringify throws on BigInt and the corruption happens inside JSON.parse before you can intervene; the senior answer fixes the API contract (string IDs), not the client parsing.

### Modules
**They ask:** "How does dynamic import enable code splitting, and what's the React Native equivalent given Metro ships one bundle?"

Static ESM structure is what makes modern bundle optimization possible: because `import`/`export` are resolved at parse time, bundlers can tree-shake unused exports — something CommonJS's runtime `require()` can't guarantee. The dynamic form, `import(specifier)`, returns a promise resolving to the module namespace object, which turns a module into a load-on-demand unit: on the web, bundlers emit it as a separate chunk fetched over the network only when that line executes — conditional loading, route-level splitting.

The React Native distinction is the senior detail: Metro produces one bundle, so there is no network-fetched chunk. The analog is **inline requires** — deferring a module's *execution* (not its download) until first use, which improves TTI because startup doesn't evaluate code the first screen never touches. Same principle — pay for code when you use it — different mechanism.

Namespace re-export composes public APIs without touching internals:

```js
// index.js — package facade
export * as validators from './validators.js';
export * as formatters from './formatters.js';
```

Two ESM-vs-CJS differences worth naming: ESM exports are **live bindings** (importers see later reassignments; CJS copies values at require time), and ESM loading is asynchronous by design, which is what makes top-level `await` possible.

**Say it:** "import() gives me a promise of the module namespace — on web that's a separate chunk, and in React Native the analog is inline requires: one bundle, but deferred execution, which is what actually moves TTI."
**Red flag:** Claiming dynamic import gives you lazy network loading in React Native — Metro ships a single bundle, so if you don't name inline requires (deferred execution, not deferred download) the interviewer knows you've only done web.

### Classes
**They ask:** "class is syntactic sugar over prototypes — can you rewrite a class hierarchy with constructor functions, and how do you compose behavior without multiple inheritance?"

Understanding that `class` is sugar over the prototype chain is what separates engineers who use the language from engineers who can debug it — every `extends`, `super`, and `instanceof` question reduces to prototype links. The desugaring: methods live on `Constructor.prototype`, inheritance is two links — `Child.prototype = Object.create(Parent.prototype)` for instances, plus `Object.setPrototypeOf(Child, Parent)` for statics — and `super(...)` is `Parent.call(this, ...)`. Converting back is mechanical: constructor function body → `constructor`, prototype methods → class methods.

JavaScript has single inheritance, so behavior composition uses **mixins**: a function that takes a superclass and returns a class expression extending it —

```js
const Serializable = (Base) => class extends Base {
  serialize() { return JSON.stringify(this); }
};
const Trackable = (Base) => class extends Base {
  track(ev) { analytics.log(ev, this.id); }
};
class Booking extends Trackable(Serializable(Model)) {}
```

Each application creates one link in the prototype chain, so composition order is explicit and `super` still works — without the diamond problem of true multiple inheritance.

Decorators are functions that wrap or annotate classes and members. Two incompatible generations exist: TypeScript's legacy `experimentalDecorators` (what MobX's `@observable` and NestJS's `@Injectable()` historically used) and the newer TC39 standard decorators with a different signature — know which one a codebase targets before mixing libraries.

**Say it:** "class is sugar over prototypes — extends is two Object.create links — and since JS is single-inheritance, I compose behavior with subclass-factory mixins, which keep super working without the diamond problem."
**Red flag:** Saying "decorators are just an ES feature now" without qualification — TypeScript legacy decorators and TC39 standard decorators have different signatures and are not interchangeable; naming the split is the senior signal.

### Promise
**They ask:** "Write Promise.all from scratch. Then tell me when you'd reach for race, allSettled, or any instead."

Combinators are how you control the failure semantics of concurrent work — `all` is all-or-nothing, and picking the wrong one turns one failed request into a blank screen. The polyfill test checks three things: index preservation (results in input order, not settlement order), a counter (not `results.length` — sparse assignment lies), and fail-fast rejection:

```js
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let remaining = promises.length;
    if (remaining === 0) return resolve(results);
    promises.forEach((p, i) => {
      Promise.resolve(p).then((value) => {
        results[i] = value;
        if (--remaining === 0) resolve(results);
      }, reject);
    });
  });
}
```

`Promise.resolve(p)` handles non-promise values; `reject` passed directly makes the first error win. The empty-array early resolve is the edge case interviewers wait for.

The rest of the family: `race` settles (fulfills *or* rejects) with the first settled promise — the standard timeout pattern is racing a fetch against a rejecting timer. `allSettled` never rejects; it returns `{status, value|reason}` records, right for independent batch operations where partial success is acceptable. `any` is the mirror of `all`: first fulfillment wins, and it rejects with an `AggregateError` only when every input rejects — fastest-mirror/fallback-endpoint scenarios.

**Say it:** "I choose the combinator by failure semantics: `all` when results are interdependent, `allSettled` when partial success is fine, `race` for timeouts, `any` for redundant sources."
**Red flag:** Pushing results with `results.push(value)` in the polyfill — settlement order isn't input order, so you silently shuffle the output; always assign by index and count with a separate counter.

### Async await
**They ask:** "What does async/await actually do under the hood, and how do you express Promise.all with it?"

`async/await` changes the syntax, not the concurrency model — misunderstanding that is the number-one source of accidentally serialized network waterfalls. An `async` function always returns a promise: returned values are wrapped in a fulfilled promise, thrown errors become rejections. `await` suspends the function at that point and yields control back to the event loop; when the awaited promise settles, the continuation is scheduled as a microtask. Historically this was specced and transpiled as exactly that — a generator plus a driver loop that calls `next()` with each resolved value — which is why the mental model "await is a yield the engine resumes for you" is accurate.

The Promise.all analogue is about *when you start* the work, not how you await it:

```js
// serialized — two round trips
const a = await fetchA();
const b = await fetchB();

// parallel — start both, then await
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```

Calling the functions first starts both promises; the `await` only observes them. `Promise.race` translates the same way: `await Promise.race([fetch(url), timeout(5000)])`. Error handling becomes ordinary `try/catch`, which unifies sync and async failure paths — that's the real ergonomic win over `.catch()` chains.

**Say it:** "async/await is generator-style suspension over promises — it makes code read sequentially, so I have to opt in to parallelism explicitly by starting promises before awaiting them."
**Red flag:** `await` inside a `for` loop over independent items — that's an N-round-trip waterfall; map to promises first and `await Promise.all(...)`, unless sequencing is intentional (rate limits, ordering).

### Generators and iterators
**They ask:** "How does next(value) communicate with yield, and where have you actually used generators?"

Generators matter because they are the primitive under both `async/await` and redux-saga — a function whose execution the *caller* controls. `function*` returns a generator object without running the body; each `next()` runs to the next `yield`, and the yielded value comes out as `{value, done}`. The senior detail is the reverse direction: `next(v)` resumes the paused generator and `v` becomes the value of the suspended `yield` expression itself. That two-way channel is what lets a driver run a generator's async steps — redux-saga yields effect descriptions (plain objects) and the middleware feeds results back in with `next(result)`, which is why sagas are testable without mocking: you assert on the yielded descriptions.

The iterator protocol underneath is just an object with `next()` returning `{value, done}`; anything with `[Symbol.iterator]` works in `for..of` and spread. Generators are the shorthand for writing conforming iterators by hand. The protocol also includes `return()` (early termination — `for..of` calls it on `break`, so `finally` blocks run for cleanup) and `throw()` (inject an error at the paused `yield`).

Async generators (`async function*`) yield promises consumed with `for await..of` — the natural shape for paginated APIs: yield each page, and the consumer decides when to stop pulling.

**Say it:** "yield is a two-way channel: the generator sends a value out, and next(v) sends a value back in as the result of that yield — that's the mechanism sagas and async/await are built on."

### Fetch
**They ask:** "What's the real difference between XHR and fetch(), and what does that mean in React Native?"

The API difference is architectural: XHR is a stateful event-emitter object; `fetch` is promise-based with composable `Request`/`Response` objects and a streamable body — which is why it fits `async/await` and modern middleware patterns. But three behavioral gotchas decide seniority. First, `fetch` rejects **only on network failure** — an HTTP 404 or 500 *resolves*; you must check `response.ok` / `response.status`, or errors sail through your `catch`. Second, cancellation isn't built in: XHR has `.abort()`, `fetch` needs an `AbortController` whose signal you pass in — and aborting rejects the promise with an `AbortError` you should handle distinctly from real failures. Third, `fetch` has no native **upload** progress events, while XHR exposes `xhr.upload.onprogress` — for a file-upload progress bar, XHR is still the pragmatic choice.

In React Native there is no browser: both `fetch` and XHR are implemented over the platform networking stacks — OkHttp on Android, NSURLSession on iOS. RN's `fetch` is a polyfill layered on its XHR implementation, so the two share behavior and limitations. The practical consequence: capabilities like TLS certificate pinning or proxy debugging live at the native layer, not in JS — you configure OkHttp/NSURLSession (or use a pinning library), and tools like Charles/Proxyman intercept at that level.

**Say it:** "fetch rejects only on network failure — HTTP error statuses resolve, so the first line after any fetch is a response.ok check."
**Red flag:** Claiming `try/catch` around `fetch` handles server errors — it doesn't; 4xx/5xx resolve successfully, and shipping that assumption means failed API calls are silently treated as success.

## JS (ES5)

### eval is evil
**They ask:** "Why is `eval` considered evil, and when would you ever reach for it?"

`eval` turns any string in your system into executable code, so one unsanitized input becomes remote code execution — that is a security incident, not a code-style debate. Mechanically it does two kinds of damage. First, injection: `eval(userInput)` runs with the privileges of your app, so anything that flows into it — query params, API payloads, storage — is an attack surface. Second, performance: direct `eval` can introduce new bindings into the enclosing scope, so the engine can no longer statically resolve variable access in that function; V8 deoptimizes the whole surrounding scope to dynamic lookup. This is why Content Security Policy blocks `eval` by default (`unsafe-eval` must be explicitly allowed) — the platform itself treats it as a hazard. In React Native the point is even sharper: Hermes compiles JavaScript to bytecode ahead of time, deliberately excludes local-scope (direct) `eval` from the language surface, and runs any string it must evaluate on a slow interpreted path outside the AOT pipeline — code built around `eval` forfeits exactly the startup wins Hermes exists for. The alternatives cover every legitimate use: `JSON.parse` for data, lookup tables or `Map` for dynamic dispatch, and `new Function` only as a last resort — it is still string-to-code (same CSP and injection concerns) but at least executes in global scope, so it cannot capture your closures.

**Say it:** "eval is an injection vector and a deoptimization trigger — I parse data with JSON.parse and dispatch with lookup tables; string-to-code never ships."
**Red flag:** Answering "it's slow" as the main reason — the security answer comes first; performance is the secondary cost, and naming CSP and Hermes's AOT model is what makes the answer senior.

### Deep copy and object structures
**They ask:** "How do you deep-clone an object in JavaScript, and can you sketch a linked list on plain objects?"

Shallow-vs-deep confusion is a real bug class: a "copied" object still shares nested references, so a mutation three screens away corrupts state you thought was isolated. Spread and `Object.assign` copy only the first level. The classic `JSON.parse(JSON.stringify(obj))` trick is lossy — functions and `undefined` are dropped, `Date` becomes a string, `Map`/`Set` become `{}`, and circular references throw. The modern answer is `structuredClone`: it handles cycles, `Date`, `Map`, `Set`, and typed arrays correctly, but throws `DataCloneError` on functions — clone data, not behavior. If you need custom semantics, a recursive clone is a five-line interview staple: recurse into objects/arrays, track visited nodes in a `WeakMap` to survive cycles.

A linked list is just objects pointing at objects:

```js
const node = (value, next = null) => ({ value, next });
let head = node(1, node(2, node(3)));
head = node(0, head);                      // O(1) insert at head
for (let n = head; n; n = n.next) visit(n.value);
```

The reason it exists: inserting at the front of an array is O(n) because every element shifts; a list re-points one reference. The trade-off is the loss of O(1) index access and worse cache locality — arrays win for iteration-heavy workloads.

**Say it:** "Spread is shallow, the JSON round-trip is lossy, structuredClone is the correct built-in for data — and a linked list buys O(1) head operations at the cost of indexed access."
**Red flag:** Offering `JSON.parse(JSON.stringify())` as *the* deep-copy answer — name its losses and lead with `structuredClone` instead.

### Garbage collector
**They ask:** "How does a modern JavaScript garbage collector work — what do generational, incremental, and idle-time collection mean?"

GC strategy is a latency question: a naive collector stops the world, and a long pause is a dropped frame or a frozen tap — so every modern design exists to shrink or hide pauses. The base model is reachability: the collector starts from roots (the global object, the current stack, closures in flight) and marks everything reachable; whatever is unmarked is swept. Everything else layers on top of mark-and-sweep. **Generational** collection exploits the generational hypothesis — most objects die young — so allocations land in a small nursery collected frequently and cheaply (minor GC); survivors are promoted to old space, which is collected rarely (major GC). **Incremental** collection chops the marking work into slices interleaved with program execution, capping the length of any single pause instead of paying one long one. **Idle-time** collection schedules those slices into moments the thread is otherwise idle — between frames, after input — so the work happens when nobody is watching. For React Native this is concrete: Hermes ships Hades, a garbage collector that runs old-generation collection concurrently on a background thread specifically to keep pauses short on the JS thread — the thread whose stalls users feel as unresponsive taps.

**Say it:** "Modern GC is mark-and-sweep tuned for latency: generational so young garbage is cheap, incremental so no single pause is long, idle-time so the work hides between frames — Hermes's Hades does the old generation concurrently for the same reason."
**Red flag:** Describing reference counting as how JS GC works — reference counting can't reclaim cycles; JS engines use tracing (reachability) collectors.

### Date and time
**They ask:** "How does JavaScript's Date handle timezones, and how do you check that a Date object is actually valid?"

Date bugs are silent data corruption — a booking shifted by a day survives every unit test run in your own timezone and fails in production in another. The model to hold: a `Date` stores exactly one number, milliseconds since the Unix epoch in UTC. Timezone is a *display* concern — `getHours()` renders in the host's local zone, `getUTCHours()` in UTC, and `getTimezoneOffset()` returns the local-to-UTC difference in minutes. Serialization should always be ISO 8601 (`toISOString()`), because parsing anything else is implementation-defined: `new Date("2026-07-09")` is spec'd, but formats like `"07/09/2026"` vary by engine and locale. Validity has a canonical idiom, because an invalid Date is still `instanceof Date` — it just holds `NaN`:

```js
const isValidDate = (d) => d instanceof Date && !isNaN(d.getTime());
```

Two classic traps: months are zero-indexed (`new Date(2026, 6, 9)` is July), and constructing from a partial string can flip between UTC and local interpretation depending on whether a time component is present. For display, `Intl.DateTimeFormat` handles locale and timezone formatting without a library. The long-term fix is Temporal — a TC39 proposal with immutable, timezone-explicit types — now beginning to ship in engines; until it's universal, keep storage in UTC ISO strings and convert at the edge.

**Say it:** "A Date is just UTC milliseconds — timezone is a rendering concern; I store ISO UTC, convert at display time, and validate with `instanceof Date && !isNaN(getTime())`."
**Red flag:** Checking validity with `instanceof Date` alone — `new Date("garbage")` passes that check; the `isNaN(d.getTime())` half is the actual test.

### JSON
**They ask:** "What does the reviver callback in JSON.parse do, and when have you used it?"

JSON is a data format with fewer types than JavaScript — no Date, Map, undefined, or functions — so every parse boundary is a place where type information silently degrades, and the reviver is the hook that restores it in one pass instead of ad-hoc fixups scattered across the codebase. `JSON.parse(text, reviver)` calls the reviver for every key/value pair, **bottom-up**: leaves first, the root last (with key `""`), and inside the callback `this` is the object holding the current property. Whatever you return replaces the value; returning `undefined` deletes the property entirely — which makes the reviver double as a filter. The canonical use is reviving Dates:

```js
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
const data = JSON.parse(payload, (key, value) =>
  typeof value === "string" && ISO.test(value) ? new Date(value) : value
);
```

The symmetric hook on the write side is `JSON.stringify(value, replacer)` — a function or an allowlist array of keys — plus `toJSON()`, which any object can define to control its own serialization (Date's `toJSON` is why dates come out as ISO strings in the first place). Together, replacer/`toJSON` and reviver form the serialization boundary: transform on the way out, restore on the way in, and the rest of the app never sees the degraded wire format.

**Say it:** "The reviver visits every key bottom-up and its return value replaces the parsed one — I use it to revive ISO strings into Dates at the parse boundary, and returning undefined drops a key."
**Red flag:** Saying the reviver runs top-down or only on the root — it runs on every value, leaves first, and missing that ordering detail is what the question is probing.

### Functions
**They ask:** "Walk an unknown nested object recursively, explain what `new Function` does differently from a normal closure, and write a generic curry helper."

Recursion, dynamic function creation, and currying are all about controlling *where* code and data live — get that wrong and you leak memory, break under CSP, or ship untestable call sites. A recursive object walk needs three guards: `typeof value === 'object' && value !== null` (because `typeof null === 'object'`), `Array.isArray` if arrays need different handling, and cycle protection — track visited objects in a `WeakSet` so a self-referencing structure doesn't blow the stack. `new Function(args, body)` compiles a function from a string whose scope is the **global** lexical environment — it captures no closure variables. That is occasionally the point (a template compiled once can't accidentally retain the surrounding scope), but it is `eval`-adjacent: blocked by CSP without `unsafe-eval`, and on Hermes in React Native the string is compiled at runtime on a slow interpreted path — it can never ship as precompiled bytecode, and Hermes builds can disable runtime evaluation entirely, so libraries that depend on `new Function` are a portability risk. Currying transforms `f(a, b, c)` into `f(a)(b)(c)`, enabling partial application — fix configuration arguments early, pass data late:

```js
const curry = (fn) =>
  function curried(...args) {
    return args.length >= fn.length
      ? fn.apply(this, args)
      : (...rest) => curried.apply(this, [...args, ...rest]);
  };
const log = curry((level, tag, msg) => `[${level}] ${tag}: ${msg}`);
const warnUI = log('warn')('UI'); // partially applied
```

**Say it:** "`new Function` compiles from a string in the global scope with no closure capture — CSP blocks it, and on Hermes it falls off the precompiled-bytecode fast path, so string-to-code never ships in my apps."
**Red flag:** Recursing without cycle protection — a `WeakSet` of visited objects is the one-line answer; presenting a depth counter as the fix signals you've never hit a real circular reference.

### Execution context
**They ask:** "When does a lexical environment get garbage-collected, and how can a closure become a memory leak?"

This is a production-memory question in disguise: closures are the number-one source of "why is my heap growing" in long-lived JS apps. Every function call creates an execution context containing a variable environment (the environment record), a reference to the outer lexical environment (the scope chain), and the `this` binding. Normally the environment dies with the call — it becomes unreachable and the GC reclaims it. But if the call returns a function, that function holds a reference to its outer environment, so the environment survives as long as the function does. That is the entire mechanism of closures — and the entire mechanism of the classic leak: an event handler or interval callback that closes over a large parsed payload keeps the whole structure alive for the handler's lifetime, even if the callback only reads one field. Modern engines like V8 optimize by capturing only variables the inner function actually references, but they are conservative — variables shared by *any* closure in the same scope can be retained by *all* of them. The fix is structural, not engine-dependent: extract the small value you need into a local before creating the callback, and deregister listeners when the owning component unmounts.

**Say it:** "A lexical environment is collected when nothing references it — a closure is a live reference, so it keeps the whole outer environment reachable, which is why closing over a large object in a long-lived callback is the classic JS memory leak."

### Prototypes and inheritance
**They ask:** "How do you get an object's constructor through its prototype, and when is `obj.constructor` lying to you?"

`constructor` matters because runtime type identification and object cloning patterns depend on it — and it is one of the most silently-broken properties in JavaScript. Mechanically: `obj.constructor` is almost never an own property. The lookup walks the prototype chain, finds `constructor` on `Object.getPrototypeOf(obj)` (typically `SomeClass.prototype`), and that property was placed there by the engine when the function was defined. The trap: `SomeClass.prototype = { method() {} }` replaces the whole prototype object, and the replacement's `constructor` inherits from `Object.prototype` — so `obj.constructor` now reports `Object`. Any code that reassigns a prototype wholesale must restore it: `SomeClass.prototype.constructor = SomeClass` (non-enumerable via `Object.defineProperty` to be exact). Keep the two sides of the relationship distinct: `prototype` is a property of constructor *functions* — the object future instances will inherit from; `__proto__` (properly `Object.getPrototypeOf`) is the actual link on an *instance*. `Object.create(proto)` builds that link directly without invoking a constructor, which is the ES5 primitive underneath class inheritance. Because `constructor` is writable and frequently clobbered, reliable type checks use `instanceof` (chain-based) or a discriminant field — treat `constructor` as a convention, not a guarantee.

**Say it:** "`obj.constructor` resolves through the prototype chain, so it's only as trustworthy as the last person who reassigned the prototype — reliable checks use `instanceof` or an explicit discriminant."
**Red flag:** Saying `prototype` and `__proto__` are the same thing — one is the constructor function's property, the other is the instance's actual chain link; confusing them ends the prototype discussion immediately.

### Error handling
**They ask:** "What is `window.onerror` for, and what's the equivalent in a React Native app in production?"

Global error handlers exist because the errors that hurt you in production are, by definition, the ones you didn't catch — without a last-resort hook you're blind to real-user failures. In the browser, `window.onerror(message, source, lineno, colno, error)` fires for uncaught synchronous exceptions; returning `true` suppresses the default console report. It does not catch rejected promises — those go to the `unhandledrejection` event, and a complete web setup listens to both. Two operational caveats: errors from cross-origin scripts arrive as `"Script error."` with no detail unless the script is served with CORS headers and loaded via `crossorigin`, and the handler is for *reporting*, not *recovery* — by the time it fires, application state is suspect. The senior move is mapping this to the React Native production story: RN's analog is `ErrorUtils.setGlobalHandler((error, isFatal) => …)` on the JS side, which is exactly the hook Sentry and Crashlytics install to capture JS crashes with sourcemapped stack traces. That covers only the JS thread — native crashes (Objective-C/Swift, Kotlin/Java) never reach it, so a production app needs the crash SDK's native handlers too, plus React error boundaries for render-phase errors you *can* recover from with a fallback UI.

**Say it:** "`window.onerror` plus `unhandledrejection` is the browser's last-resort telemetry; in React Native the same role is played by `ErrorUtils.setGlobalHandler` for JS plus native crash handlers — one layer never covers both worlds."
**Red flag:** Claiming a global handler is your error-handling strategy — it's a reporting hook of last resort; recoverable errors belong in `try/catch`, rejection handlers, and error boundaries close to where state can actually be repaired.

### Event loop
**They ask:** "JavaScript is single-threaded — so how does it handle thousands of concurrent operations, and in what order do `setTimeout` and `Promise.then` callbacks run?"

The event loop is why JS can serve high concurrency on one thread — and why one long synchronous function freezes your entire UI. JavaScript executes on a single call stack; the host (browser, Node, the RN runtime) provides the loop: take one macrotask from the task queue (timers, I/O, events), run it to completion, then **drain the microtask queue entirely** (promise reactions, `queueMicrotask`), then the browser may render, then the next macrotask. So `Promise.resolve().then(...)` always runs before `setTimeout(fn, 0)` scheduled in the same turn — microtasks jump the queue. This is concurrency by cooperative interleaving, not parallelism: nothing runs simultaneously, tasks just take turns, which is why "fake multithreading" is an apt label. Real parallelism requires Web Workers (or worklets/threads in RN), which run separate event loops and communicate by message passing — no shared mutable state, no locks. In React Native the JS thread runs this exact model; work crosses to native threads through the bridge/JSI, so a blocked JS thread means unresponsive touches even while native-driven animations keep running — the classic diagnostic split. The practical rule: never block the loop; chunk long work or move it off-thread.

**Say it:** "JavaScript concurrency is cooperative interleaving on one thread — microtasks drain completely between macrotasks, which is why `Promise.then` beats `setTimeout(0)` every time."
**Red flag:** Answering the ordering quiz with "they're both async so it's nondeterministic" — the microtask/macrotask ordering is fully specified, and not knowing it reads as never having debugged async code.

### Scheduling
**They ask:** "Why does `requestAnimationFrame` exist when `setTimeout(fn, 16)` seems to do the same thing?"

This is a jank question: animation code scheduled with the wrong primitive produces dropped frames no amount of optimization elsewhere can fix. `requestAnimationFrame(callback)` asks the browser to run your callback once, immediately before the next repaint, passing a high-resolution timestamp. Three properties `setTimeout(16)` cannot match: the callback is synchronized with the display's actual refresh (vsync) instead of drifting against it — a timer at ~16ms accumulates phase error and periodically lands after the paint, dropping a frame; all rAF callbacks in a frame are batched, so reads and writes can be organized to avoid layout thrashing; and rAF automatically throttles in background tabs and hidden iframes, so off-screen animations stop burning CPU and battery — with timers you pay that cost forever. Timestamp-based animation (compute position from elapsed time, not per-tick increments) makes the animation frame-rate independent. Browser support is universal in every current browser; only historic engines needed vendor prefixes, which no modern codebase should carry. React Native ships its own `requestAnimationFrame` tied to the JS thread's frame ticks — same contract — though for RN animations the stronger answer is moving work off the JS thread entirely (native driver, Reanimated worklets) so a busy JS thread can't drop frames at all.

**Say it:** "rAF aligns work with vsync, batches visual updates before paint, and pauses in background tabs — `setTimeout(16)` drifts against the refresh rate and burns battery when nobody is watching."

### Regular expressions
**They ask:** "Explain named groups, lookarounds, and the flags beyond `g`, `i`, `m` — and when would you refuse to solve a problem with a regex?"

Regexes are a performance and security surface, not just a matching tool — a pathological pattern on user input can take a server down (ReDoS). The advanced pattern set: capture groups `(...)` extract submatches; named groups `(?<name>...)` surface them as `match.groups.name`, which keeps multi-group patterns maintainable; backreferences `\1` / `\k<name>` match a previously captured value again; lookahead `(?=...)` / `(?!...)` and lookbehind `(?<=...)` / `(?<!...)` assert context without consuming it; character classes and ranges `[a-z0-9]` with negation `[^...]` define alphabets. Flags beyond the basics: `s` (dotAll) lets `.` match newlines, `u` enables correct Unicode/surrogate-pair handling, `y` (sticky) anchors matching at `lastIndex` exactly — the tokenizer flag — and `d` adds match indices. For iteration, `str.matchAll(re)` (regex must have `g`) returns all matches with groups cleanly, replacing the stateful `re.exec` loop that mutates `lastIndex`. The senior boundary: nested quantifiers over overlapping alternatives like `(a+)+` backtrack exponentially on non-matching input — catastrophic backtracking. On untrusted input, bound the input length, keep patterns linear, or use a real parser; regexes are for regular languages, not nested structure.

**Say it:** "I use named groups and `matchAll` for maintainability, and I treat any regex that runs on user input as a ReDoS review item — nested quantifiers over overlapping alternatives are exponential on failure."
**Red flag:** Demonstrating regex depth by parsing HTML or nested brackets with one — recognizing that nested structure needs a parser, not a bigger regex, is the actual senior signal.
