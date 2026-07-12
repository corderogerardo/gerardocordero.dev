# JavaScript (ES6+) — Andersen foundations

### Modern bindings and syntax
**They ask:** "Walk me through the ES6 basics you reach for daily — let/const, destructuring, arrow functions."

The reason these landed is predictability: `var` hoists and function-scopes, which caused whole classes of bugs, so `let`/`const` are block-scoped and live in a Temporal Dead Zone — referencing them before declaration throws instead of silently giving `undefined`. Default to `const`; use `let` only when you reassign.

The rest is about writing intent with less noise. Destructuring pulls fields out by name, spread copies and merges, optional chaining (`?.`) short-circuits on `null`/`undefined` instead of throwing "cannot read property of undefined."

```js
const { name, roles = [] } = user;      // default when missing
const next = { ...user, active: true }; // shallow copy + override
const city = user?.address?.city;        // undefined, never throws
for (const role of roles) log(role);     // values, not indices
Object.entries(map).flatMap(([k, v]) => [k, v]);
```

`for...of` iterates values (arrays, Maps, any iterable); `for...in` iterates keys and is the wrong tool for arrays.

**Say it:** "I default to `const`, reach for `let` only on reassignment, and lean on optional chaining and destructuring to express intent with less defensive code."
**Red flag:** Saying `const` makes objects immutable. It only freezes the binding — `const arr = []; arr.push(1)` is fine. Use `Object.freeze` for shallow immutability.

### ES modules
**They ask:** "How do imports and exports work in ES modules?"

Modules matter because they give you a real dependency graph the bundler and tree-shaker can analyze statically — dead code drops out, and load order is resolved for you. A file is a module the moment it has an `import` or `export`; each has its own scope, so no more leaking globals.

There are named exports and one default per module. You import named bindings by their exact name in braces, rename with `as`, or grab everything as a namespace object with `*`.

```js
export const parse = () => {};
export default function App() {}

import App, { parse as parseInput } from './app.js';
import * as utils from './utils.js'; // utils.parse(...)
```

Imports are live read-only bindings, not copies — if the exporting module reassigns the value, importers see the update. `import` statements are also hoisted and statically resolved, which is exactly why they must sit at the top level, not inside conditionals.

**Say it:** "ES modules give a statically analyzable dependency graph — that's what enables tree-shaking and per-file scope, unlike the old script-tag global soup."
**Red flag:** Treating `import`/`require` as interchangeable. ESM is static and async-friendly; CommonJS `require` is synchronous and dynamic — mixing them causes interop headaches.

### Class fundamentals
**They ask:** "Show me class syntax in JS — constructor, inheritance, private fields."

Classes are honest syntax over the prototype chain — they don't add a new object model, they make the existing one readable and give a single place for construction logic. Use `extends` for inheritance and `super()` to run the parent constructor before you touch `this`.

Privacy used to be convention-only (`_name`). The `#` prefix gives true hard privacy enforced by the engine — inaccessible outside the class body, not just discouraged.

```js
class Animal {
  #id;                          // truly private
  constructor(name) { this.name = name; this.#id = crypto.randomUUID(); }
  speak() { return `${this.name} makes a sound`; }
}
class Dog extends Animal {
  speak() { return `${super.speak()} — woof`; }
}
```

There is no `protected` keyword in JavaScript; the ecosystem convention is a leading underscore, and TypeScript adds a compile-time-only `protected`.

**Say it:** "Classes are sugar over prototypes — `#fields` are the one genuinely new capability, giving hard privacy the underscore convention never did."
**Red flag:** Claiming `#private` is just a naming convention like `_name`. It's engine-enforced; accessing `obj.#id` from outside is a syntax error, not `undefined`.

### Fetch basics
**They ask:** "Make a simple GET request with fetch and handle the response."

`fetch` returns a promise for a `Response` object, so the mechanics are two awaits: one for the response headers, one to read the body (`.json()`, `.text()`). The gotcha that trips people is that `fetch` only rejects on network failure — a 404 or 500 still resolves. You must check `response.ok` yourself.

```js
async function getUser(id) {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

For a POST you pass a second options object with `method`, `headers`, and a stringified `body`. Because the body is a stream you can only read it once — call `.json()` twice and the second throws.

**Say it:** "`fetch` only rejects on network errors, so I always gate on `response.ok` — an HTTP 500 is a resolved promise, not a rejection."
**Red flag:** Wrapping `fetch` in try/catch and assuming the catch fires on a 404. It won't — the catch only sees network/DNS failures, so a missing `res.ok` check ships broken error handling.

### Map, Set, and nullish coalescing
**They ask:** "When do you use Map over a plain object, and what does `??` solve that `||` doesn't?"

Reach for `Map` when keys aren't strings or when you need reliable size and iteration order — objects coerce keys to strings and carry prototype keys you have to guard against. `Set` gives O(1) membership and dedupe. Both are iterable, so `for...of` and spread work directly.

```js
const seen = new Set([1, 1, 2]);   // {1, 2}
const cache = new Map();
cache.set(objKey, value);          // any value as key
[...new Set(arr)];                 // dedupe an array
```

`??` exists because `||` treats every falsy value — `0`, `''`, `false` — as "missing." Nullish coalescing only falls through on `null`/`undefined`, so a legitimate `0` survives.

```js
const count = input.count ?? 10;   // 0 stays 0; only null/undefined → 10
```

`Object.assign(target, src)` mutates its first argument and copies enumerable own properties; spread (`{...a, ...b}`) builds a fresh object — prefer spread to avoid accidental mutation.

**Say it:** "I use `??` whenever `0`, empty string, or `false` are valid values, because `||` would wrongly swap them for the default."
**Red flag:** Using `config.timeout || 5000` for a numeric setting. A user's `0` silently becomes `5000`; `??` is the correct operator.

### Default exports and re-exports
**They ask:** "Why do some teams ban default exports, and what's a re-export for?"

The trade-off with `export default` is that it has no canonical name — each importer invents one, so `import Foo` and `import Bar` can be the same module. That breaks grep-ability, makes automated refactors and renames unreliable, and weakens editor auto-import. Named exports enforce one consistent identifier and tree-shake more predictably.

Re-exports exist to create a clean public surface — a barrel file that flattens many internal modules into one import path, so consumers depend on the package boundary, not your folder layout.

```js
// index.js — a barrel
export { Button } from './button.js';
export { Input } from './input.js';
export * from './icons.js';

// consumer
import { Button, Input } from './ui';
```

The seniority note: over-broad barrels can defeat tree-shaking and create circular imports, so keep them at real package boundaries, not every folder.

**Say it:** "Default exports lose the one canonical name that makes renames and auto-import reliable; I prefer named exports and use barrel re-exports only at genuine package boundaries."
**Red flag:** Saying default exports are simply "worse." The real cost is naming inconsistency and refactor friction — name the concrete downside, don't just assert a preference.

### instanceof and static members
**They ask:** "What does `instanceof` actually check, and when do static methods make sense?"

`instanceof` is a prototype-chain check, not a type check — `x instanceof C` is true when `C.prototype` appears anywhere in `x`'s chain. That's why it works through inheritance but breaks across execution realms (an array from an iframe fails `instanceof Array` in the parent).

Static members belong to the class itself, not instances — use them for factory constructors and helpers that don't need `this` of an instance.

```js
class User {
  constructor(name) { this.name = name; }
  static fromJSON(json) { return new User(JSON.parse(json).name); }
}
const u = User.fromJSON('{"name":"Ann"}');
u instanceof User;        // true — walks the prototype chain
[] instanceof Object;     // true — arrays inherit from Object
```

For robust cross-realm or primitive checks, prefer `Array.isArray` or `typeof`.

**Say it:** "`instanceof` walks the prototype chain, so it respects inheritance but lies across realms — for arrays I use `Array.isArray`, which is realm-safe."
**Red flag:** Using `instanceof` to distinguish primitives like strings. `'hi' instanceof String` is `false` — primitives aren't instances; reach for `typeof` there.

### Promises versus callbacks
**They ask:** "What do promises give you over callbacks, and what are their states?"

Promises fix the two structural failures of callbacks: callback hell (deep nesting) and inversion of control — with a raw callback you hand your continuation to someone else's code and hope they call it once, at the right time, with the right errors. A promise is a first-class value you own, so you compose it with `.then` and centralize errors in one `.catch`.

A promise has three states: pending, then settled as either fulfilled or rejected. Settling is one-way and permanent — it can't flip back or fire twice, which is exactly the guarantee callbacks lack.

```js
fetchUser()
  .then(user => fetchOrders(user.id))  // flatten, not nest
  .then(render)
  .catch(handleError);                  // one place for all failures
```

Errors propagate down the chain until a `.catch` handles them, so a single handler covers every preceding step.

**Say it:** "Promises restore control — the continuation is a value I own and settle exactly once, instead of surrendering it to a callback that might fire zero times or twice."
**Red flag:** Saying a promise "runs the async work." The executor runs immediately and eagerly; the promise only represents the eventual result — it doesn't start or schedule anything on its own.

### Async functions and error handling
**They ask:** "Give me an async/await example and show how you handle errors."

`async`/`await` is syntax over promises that lets asynchronous code read top-to-bottom, and — crucially — makes ordinary `try/catch` work again, because `await` throws a rejection as a real exception. An `async` function always returns a promise; `await p` unwraps its fulfilled value or throws its rejection.

```js
async function loadDashboard(id) {
  try {
    const user = await getUser(id);
    const orders = await getOrders(user.id);
    return { user, orders };
  } catch (err) {
    reportError(err);          // catches either await's rejection
    throw err;                 // rethrow so the caller still knows
  }
}
```

The trap is accidental serialization: awaiting independent calls in a loop runs them one after another. For calls that don't depend on each other, use `Promise.all` to run them concurrently.

**Say it:** "`await` turns a promise rejection into a thrown exception, so I get plain try/catch back — but I watch for awaiting independent calls in a loop instead of `Promise.all`."
**Red flag:** Saying `await` "blocks the thread." It suspends the async function and yields control to the event loop; nothing else is blocked.

### The Symbol type
**They ask:** "What is a Symbol and where is it genuinely useful?"

`Symbol` is a primitive whose whole purpose is a guaranteed-unique identifier — every `Symbol()` is distinct even with the same description, so you can add properties to an object with zero risk of colliding with existing or future string keys. That makes them ideal for library metadata and non-enumerable hooks.

The bigger use is well-known symbols, which let you plug into language protocols. Implementing `Symbol.iterator` makes any object work with `for...of` and spread.

```js
const id = Symbol('id');
obj[id] = 123;                 // invisible to string-key iteration

const range = {
  *[Symbol.iterator]() { yield 1; yield 2; yield 3; }
};
[...range];                    // [1, 2, 3]
```

Symbol keys are skipped by `Object.keys`, `for...in`, and `JSON.stringify` — reach for `Object.getOwnPropertySymbols` to see them.

**Say it:** "Symbols are collision-proof keys — I use them for library metadata that must never clash with user keys, and well-known symbols like `Symbol.iterator` to hook into language protocols."
**Red flag:** Calling symbols "private." They're hidden from normal enumeration but fully reachable via `getOwnPropertySymbols` — that's obscurity, not privacy; `#fields` are the real privacy tool.

### Advanced fetch: binary and headers
**They ask:** "How do you download binary data with fetch and set request headers?"

The key idea is that `Response` exposes the body through several typed readers, so you pick the one matching the payload: `.blob()` for files and images, `.arrayBuffer()` for raw bytes you'll process, `.json()`/`.text()` for the common cases. Reading binary as text corrupts it, so match the reader to the content.

Headers are a `Headers` object on both sides — iterable, case-insensitive, with `get`/`set`/`has`.

```js
const res = await fetch('/report.pdf', {
  headers: { Authorization: `Bearer ${token}`, Accept: 'application/pdf' },
});
const contentType = res.headers.get('content-type');
const blob = await res.blob();
const url = URL.createObjectURL(blob);   // e.g. an <a download> or <img>
```

Remember `URL.revokeObjectURL` when you're done, or the blob leaks memory.

**Say it:** "The `Response` body is a stream with typed readers — `.blob()` or `.arrayBuffer()` for binary, never `.text()`, which would mangle the bytes."
**Red flag:** Reading an image with `.json()` and being surprised it throws. The reader must match the payload; binary needs `.blob()`/`.arrayBuffer()`.

### Promise chaining and finally
**They ask:** "Explain promise chaining, value fall-through, and what `finally` is for."

Chaining works because `.then` always returns a new promise, and the chain adopts whatever you return: a plain value passes down, a returned promise is awaited and flattened, a throw skips to the next `.catch`. "Fall-through" is a `.then` without a handler for the current state — the value or error passes untouched to the next link.

```js
doThing()
  .then(v => v * 2)              // returns a value → next .then sees it
  .then(v => fetchMore(v))       // returns a promise → auto-awaited
  .catch(err => fallback)        // recovers; chain continues fulfilled
  .finally(() => spinner.hide());// runs on success AND failure
```

`.finally` is for cleanup that must run either way — hide a spinner, close a handle. It receives no value and, unless it throws, passes the original outcome through unchanged. You can also "catch" by passing a second argument to `.then(onFulfilled, onRejected)`, though a trailing `.catch` reads cleaner and also catches errors thrown inside `onFulfilled`.

**Say it:** "`.then` returns a new promise that adopts what I return — a value falls through, a promise flattens, a throw jumps to `.catch` — and `.finally` runs cleanup on both paths without altering the result."
**Red flag:** Thinking `.then(fn, errFn)` and a trailing `.catch` are equivalent. The two-argument form won't catch an error thrown inside `fn` itself; a chained `.catch` will.

### Rewriting promises with async await
**They ask:** "Convert a promise chain to async/await, including an async class method."

The reason to rewrite is readability and honest control flow — chains hide branching and shared state in closures, while `await` lets conditionals, loops, and try/catch read normally. Each `.then(cb)` becomes `const x = await promise`, and `.catch` becomes `catch`.

```js
// chain
function load(id) {
  return getUser(id).then(u => getOrders(u.id).then(o => ({ u, o })));
}
// async/await
async function load(id) {
  const u = await getUser(id);
  const o = await getOrders(u.id);
  return { u, o };
}
class Repo {
  async find(id) {                    // methods can be async
    const res = await fetch(`/x/${id}`);
    if (!res.ok) throw new Error(res.status);
    return res.json();
  }
}
```

Watch the one behavior change: a chain's parallel branches (`Promise.all`) must stay parallel — don't accidentally serialize them into sequential awaits during the rewrite.

**Say it:** "I map each `.then` to an `await` and `.catch` to try/catch, but I keep any `Promise.all` as `Promise.all` so I don't turn concurrent work into a slow sequence."
**Red flag:** Forgetting `async` methods still return promises — a caller that ignores the returned promise gets an unhandled rejection, not a synchronous throw.

### Generators and composition
**They ask:** "How does a generator work, and how do you compose two of them?"

A generator is a function that can pause and resume — calling it returns an iterator, and each `next()` runs to the next `yield` and hands back that value. The point is lazy, on-demand production: you can model infinite or expensive sequences and only compute what's consumed.

You compose generators with `yield*`, which delegates to another iterable and yields all its values in place — no manual looping.

```js
function* range(a, b) { for (let i = a; i < b; i++) yield i; }
function* pair() {
  yield* range(0, 2);   // delegates: 0, 1
  yield* range(10, 12); // then 10, 11
}
[...pair()];            // [0, 1, 10, 11]
```

Because a generator returns an iterator, it drops straight into `for...of` and spread.

**Say it:** "Generators give lazy, pausable sequences — `next()` runs to the next `yield`, and `yield*` delegates to another generator so I compose them without manual glue."
**Red flag:** Assuming the body runs when you call the generator. Calling it only builds the iterator; nothing executes until the first `next()`.

### Mixins and decorators
**They ask:** "How do you share behavior across classes without deep inheritance — mixins, decorators, functional inheritance?"

The driver is that JavaScript has single inheritance, so when unrelated classes need the same capability, deep hierarchies get brittle. Mixins solve it by composing behavior: a function takes a base class and returns an extended one, so you stack capabilities instead of forcing one lineage. Class and functional inheritance are interconvertible — a `class Dog extends Animal` is the same prototype wiring you'd build by hand with `Object.create` and `Object.setPrototypeOf`.

```js
const Serializable = (Base) => class extends Base {
  toJSON() { return JSON.stringify(this); }
};
class Model {}
class User extends Serializable(Model) {}   // composed capability
```

Decorators wrap a class or member to add cross-cutting behavior — logging, memoization, access control — without editing the target. They're now a standardized language feature, and TypeScript has shipped them for years.

**Say it:** "Because JS is single-inheritance, I compose shared behavior with mixin factories — `Base => class extends Base` — rather than forcing everything into one deep hierarchy."
**Red flag:** Reaching for a deep inheritance chain to share one method. That couples unrelated classes; a mixin or plain composition keeps the capability independent and reusable.

### XHR versus fetch
**They ask:** "What's the real difference between XMLHttpRequest and fetch?"

`fetch` replaced `XHR` because `XHR` is an event-based, callback-driven API from before promises — request state came through `onreadystatechange` and nested callbacks. `fetch` is promise-based, so it composes with `.then` and `async/await` and reads cleanly.

The trade-offs worth naming: `fetch` uses `AbortController` for cancellation and streams the response body, but it does not reject on HTTP errors (you check `res.ok`) and, unlike `XHR`, has no built-in upload/download progress events — you reconstruct progress from the response stream. `XHR` still has native `onprogress`, which is occasionally why legacy upload code stays on it.

```js
const controller = new AbortController();
fetch(url, { signal: controller.signal });
controller.abort();   // cancel
```

**Say it:** "`fetch` is the promise-native successor with `AbortController` cancellation and streaming, but it doesn't reject on 4xx/5xx and lacks XHR's native progress events."
**Red flag:** Saying `fetch` can't be cancelled. It can — via `AbortController`/`signal`; that was the one early gap, and it's long closed.

### WeakMap, Proxy, and tagged templates
**They ask:** "Explain WeakMap versus Map, what Proxy/Reflect enable, and tagged templates."

`WeakMap`/`WeakSet` hold keys weakly, so an entry doesn't keep its key object alive — when the key is otherwise unreachable, it's garbage-collected and the entry vanishes. That's the tool for per-object private data and caches that must not leak; the cost is they're not iterable and have no size.

`Proxy` wraps an object with traps (`get`, `set`, `has`) to intercept operations, and `Reflect` provides the default behavior you delegate to inside a trap — so you add logic without reimplementing the language.

```js
const logged = new Proxy(target, {
  get(obj, key, recv) { console.log('read', key); return Reflect.get(obj, key, recv); }
});
```

Tagged templates let a function receive a template literal's static strings and interpolated values separately — the basis of safe escaping (SQL/HTML sanitizers) and libraries like styled-components.

```js
function safe(strings, ...values) { /* escape values, rejoin */ }
safe`Hello ${userInput}`;
```

**Say it:** "`WeakMap` keys are GC-eligible, so it's my choice for per-object metadata that must not leak; `Proxy` plus `Reflect` intercepts operations while delegating the default behavior."
**Red flag:** Iterating a `WeakMap` or reading its `.size`. It exposes neither by design — that's the price of weak references; use a `Map` when you need enumeration.

### BigInt
**They ask:** "Why does BigInt exist and what should you watch out for?"

`BigInt` exists because JS numbers are IEEE-754 doubles that lose integer precision beyond `Number.MAX_SAFE_INTEGER` (2^53 − 1) — so 64-bit database IDs, financial counters, and timestamps in nanoseconds silently round. `BigInt` represents arbitrary-precision integers, written with an `n` suffix.

```js
9007199254740993 === 9007199254740992;   // true — precision lost!
9007199254740993n === 9007199254740992n; // false — exact
```

The catch: `BigInt` and `Number` don't mix in arithmetic — `1n + 1` throws a TypeError; you must convert explicitly. `BigInt` is also integer-only (no fractions) and not JSON-serializable by default, so APIs typically transmit large IDs as strings.

**Say it:** "`BigInt` handles integers past 2^53 exactly — I use it for 64-bit IDs and money-as-integers, and I never mix it with `Number` in arithmetic, which throws."
**Red flag:** Using `BigInt` for decimals or money with cents. It's integer-only; for currency you either scale to integer minor units or use a decimal library.

### Dynamic imports and namespace exports
**They ask:** "How do you lazy-load a module, and what's a module namespace export?"

Static `import` is resolved up front, which is great for tree-shaking but means everything loads eagerly. Dynamic `import()` is a function that returns a promise for the module, so you defer loading until it's needed — the mechanism behind route-based code splitting and loading a heavy dependency only on demand.

```js
button.onclick = async () => {
  const { renderChart } = await import('./chart.js');  // fetched on click
  renderChart(data);
};
```

Because it's just a promise, it composes with `await` and error handling, and it accepts a computed specifier — impossible with static imports.

Namespace re-export (`export * as ns from './mod'`) bundles another module's entire public surface under one named binding, so a barrel can expose sub-namespaces cleanly.

```js
export * as validators from './validators.js';  // import { validators } from '...'
```

**Say it:** "Dynamic `import()` returns a promise, so I defer heavy or route-specific modules until they're actually needed — that's the core of code splitting."
**Red flag:** Reaching for dynamic `import()` everywhere for "performance." It adds a network round-trip and defeats static analysis; use it for genuinely deferred code, not routine imports.

### Promise combinators
**They ask:** "Compare Promise.all, race, and allSettled — and sketch an all polyfill."

These combinators express different concurrency intents, and picking the wrong one is a real bug. `all` runs promises concurrently and fulfills with an array — but rejects the instant any one rejects (fail-fast). `allSettled` waits for every promise and reports each as `{status, value|reason}`, so one failure doesn't lose the successes — the right choice for independent tasks like a batch of uploads. `race` settles as soon as the first promise settles, fulfilled or rejected — useful for timeouts.

```js
function all(promises) {
  return new Promise((resolve, reject) => {
    const out = []; let left = promises.length;
    if (!left) return resolve(out);
    promises.forEach((p, i) =>
      Promise.resolve(p).then(v => { out[i] = v; if (--left === 0) resolve(out); }, reject));
  });
}
```

The polyfill shows the mechanics: preserve order by index, count completions, and reject on the first failure.

**Say it:** "`all` is fail-fast concurrency, `allSettled` collects every outcome so one failure doesn't discard the rest, and `race` settles on the first — I use `allSettled` for independent batches."
**Red flag:** Using `Promise.all` for a batch where partial success matters. One rejection throws away every other result; `allSettled` is the correct combinator there.

### Async await under the hood
**They ask:** "What is async/await actually doing under the hood?"

Under the hood, an `async` function is a state machine built on promises and generators — conceptually the same as a generator that `yield`s at each `await` and a driver that resumes it when the awaited promise settles. Each `await` suspends the function, returns control to the event loop, and schedules the resumption as a microtask when the promise resolves. That microtask timing is why `await` continuations run before `setTimeout` callbacks.

So the concurrency helpers are the same promise combinators — there's no special async-only version. For parallelism you still reach for `Promise.all`; for first-to-settle, `Promise.race`.

```js
// sequential — ~sum of both
const a = await one(); const b = await two();
// concurrent — ~max of both
const [a, b] = await Promise.all([one(), two()]);
```

**Say it:** "`async`/`await` compiles to a promise-driven state machine — each `await` suspends and schedules resumption as a microtask, so it's promises, not a new concurrency model."
**Red flag:** Believing async functions run on a separate thread. JS is single-threaded; `await` interleaves work on the event loop via the microtask queue — nothing runs in parallel unless the work itself is offloaded (Web Workers, native I/O).

### Iterators and async generators
**They ask:** "Explain the iterator protocol, sending values into a generator, and async generators."

The iterator protocol is the contract behind `for...of` and spread: an object is iterable if it has a `Symbol.iterator` method returning an object with `next()`, which yields `{ value, done }`. Generators implement this for free.

Two advanced pieces. First, `next(value)` sends a value *into* the generator — the argument becomes the result of the paused `yield` expression, making generators two-way channels (the basis of older coroutine-style async libraries). Second, async generators (`async function*` + `for await...of`) yield promises, so you can stream asynchronous sequences — paginated API results, a readable stream — pulling each chunk on demand.

```js
async function* pages(url) {
  let next = url;
  while (next) {
    const res = await fetch(next);
    const { items, nextUrl } = await res.json();
    yield* items;                  // stream this page's items
    next = nextUrl;
  }
}
for await (const item of pages('/api')) process(item);
```

**Say it:** "`for await...of` over an async generator lets me stream asynchronous sequences like paginated APIs, pulling each chunk lazily instead of buffering the whole thing."
**Red flag:** Confusing `for...of` and `for await...of`. Plain `for...of` on an async iterable yields promises, not values — you need `for await` to unwrap each one.
