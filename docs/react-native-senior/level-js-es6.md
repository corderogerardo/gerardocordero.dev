# JavaScript (ES6+) — Andersen matrix, junior→middle levels

## Interview questions

### ES6 syntax essentials
**They ask:** "Run me through the ES6 features you use daily — let/const, destructuring, arrow functions, and the modern array/object helpers."

These features exist to kill whole classes of bugs and boilerplate that `var` and ES5 loops created. `let`/`const` are block-scoped, so a variable can't leak out of a `for` block; `const` fixes the binding (the object's contents can still mutate). The Temporal Dead Zone is the span from the top of a block to the declaration line — the binding is hoisted but uninitialized, so touching it early throws a `ReferenceError` instead of silently reading `undefined`.

Destructuring pulls fields out with renaming and defaults; spread (`...`) makes shallow copies — but it's two rules, not one: in an array or call it expands an **iterable**, while in an object literal (`{ ...defaults }`) it copies **enumerable own properties** — the backbone of immutable updates, while rest collects leftovers. Optional chaining (`?.`) short-circuits to `undefined` on `null`/`undefined` so a missing path doesn't crash. Arrow functions bind `this` lexically — the reason they replaced `.bind(this)` in callbacks. `for...of` iterates values (not keys like `for...in`), template literals interpolate, and `Object.entries`/`fromEntries` plus `flat`/`flatMap`/`includes`/`Array.from` replace hand-rolled loops.

```js
const { name = 'anon', ...rest } = user;
const merged = { ...defaults, ...overrides };   // shallow copy
const city = user?.address?.city;               // undefined if absent
const doubled = Object.fromEntries(
  Object.entries(prices).map(([k, v]) => [k, v * 2])
);
```

**Say it:** "Default to const, spread for immutable copies, optional chaining for absent paths, and arrows when I want lexical this — these are the ES6 defaults that turn silent bugs into loud ones."
**Red flag:** Saying `const` makes objects immutable or that spread deep-clones. `const` freezes the binding, and spread copies one level — nested objects stay shared references.

### Modules: import/export
**They ask:** "How do ES module imports and exports work — named, namespace, and aliasing?"

ES modules exist to make dependencies explicit and statically analyzable, which is what lets bundlers tree-shake unused code. Modules are singletons — evaluated once and cached — and run in strict mode. Named exports expose specific bindings by name, so the import must match those names or alias them.

You export inline (`export const x`) or in a list (`export { a, b }`), import a subset (`import { a } from './m'`), rename with `as` on either side, and pull everything into one namespace object with `* as`.

```js
// utils.js
export const add = (a, b) => a + b;
export const sub = (a, b) => a - b;

// main.js
import { add as sum } from './utils.js';   // alias on import
import * as utils from './utils.js';        // namespace: utils.add
```

**Say it:** "Named exports are statically analyzable, so bundlers tree-shake them — and the module runs once and is cached, so it's effectively a singleton."
**Red flag:** Treating the `* as` namespace object as mutable. Its members are read-only live bindings — you can't reassign `utils.add`.

### Classes: syntax, inheritance, privacy
**They ask:** "Show me class basics — inheritance and how private and protected members work in JS."

Classes are syntactic sugar over prototypal inheritance — they don't add a new object model, they make the constructor/prototype pattern readable. The `constructor` initializes instance state; methods live on the prototype so they're shared, not copied per instance. `extends` sets up the prototype chain, and `super(...)` calls the parent constructor — required before using `this` in a subclass.

Real privacy comes from `#`-prefixed fields, genuinely inaccessible outside the class and enforced by the engine. There is no `protected` keyword in JS; the convention is an underscore prefix (`_x`), which is a signal, not enforcement.

```js
class Animal {
  #energy = 100;                 // truly private
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound`; }
}
class Dog extends Animal {
  speak() { return `${super.speak()} — a bark`; }
}
```

**Say it:** "`#fields` are real privacy the engine enforces; `_underscore` is just convention — JS has no protected keyword."
**Red flag:** Calling `_field` "private." It's readable and writable from anywhere; only `#` is actually private.

### Basic fetch
**They ask:** "How do you make a simple request with fetch and handle the response?"

`fetch` is the built-in promise-based HTTP API — it returns a promise that resolves to a `Response` as soon as headers arrive, before the body downloads. That's why reading the body is a second async step: `response.json()` (or `.text()`) returns another promise.

The senior gotcha: fetch only rejects on network failure, not on HTTP error status. A 404 or 500 still resolves — you have to check `response.ok` (or `response.status`) yourself and throw.

```js
async function getUser(id) {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

**Say it:** "fetch resolves on any HTTP response — it only rejects on network errors — so I always check response.ok before reading the body."
**Red flag:** Assuming a 500 lands in `.catch`. It doesn't; without an `res.ok` check you'll happily parse an error page as data.

### Map/Set, assign vs spread, nullish coalescing
**They ask:** "When do you pick Map or Set over an object, and how does nullish coalescing differ from ||?"

`Map` is a keyed collection that allows *any* key type (objects, functions), preserves insertion order, has a real `.size`, and has no prototype-key collisions — so it beats a plain object when keys are dynamic or non-string. `Set` stores unique values, making dedup and membership checks O(1) and intention-revealing.

`Object.assign(target, src)` mutates its first argument while copying enumerable own props; object spread `{ ...a, ...b }` produces a new object — prefer spread for immutable updates. Nullish coalescing (`??`) falls back only on `null`/`undefined`, unlike `||`, which falls back on any falsy value — so `??` is correct when `0`, `""`, or `false` are valid inputs.

```js
const seen = new Set([1, 2, 2]);       // {1, 2}
const port = config.port ?? 8080;       // keeps 0 if that's the value
const port2 = config.port || 8080;      // WRONG if 0 is valid
```

**Say it:** "I use ?? when zero or empty string are legitimate values — || would wrongly discard them."
**Red flag:** Using a plain object as a hash map with arbitrary keys. Non-string keys get coerced and inherited keys like `__proto__` collide; use Map.

### Default exports and re-exports
**They ask:** "Why do some teams treat default exports as bad practice, and what problem does re-exporting solve?"

A default export has no canonical name — the importer invents one, so the same module gets imported under different identifiers across a codebase, which hurts grep-ability, auto-import consistency, and rename tooling. Named exports pin the name, so the trade-off is: defaults read cleaner for a single-purpose module, named scales better in a large team.

Re-exporting (`export { x } from './x'`) exists to build a barrel — one entry point (`index.js`) that aggregates a folder's public API. Consumers import from one stable path while the internal file layout stays free to change.

```js
// components/index.js — barrel
export { Button } from './Button.js';
export { Modal } from './Modal.js';
export * from './forms.js';
```

**Say it:** "Named exports pin the identifier so tooling and grep stay reliable; I re-export through a barrel to give a module folder one stable public entry point."
**Red flag:** Claiming defaults are "always bad." They're fine for a module with one obvious export — the objection is naming consistency at scale, and barrels can hurt bundle size if they force loading everything.

### instanceof and static members
**They ask:** "How does instanceof actually work, and when do you use static properties or methods?"

`instanceof` checks whether a constructor's `prototype` appears anywhere in an object's prototype chain — so it answers "was this made by this class or a subclass," not "does it have these fields." It's the tool for type-narrowing custom classes, like distinguishing error subclasses in a `catch`.

`static` members belong to the class itself, not instances — use them for factory methods and utilities that don't need instance state (`Array.from`, `Promise.resolve` are static). They're the right home for "operations about the type" versus "operations on an instance."

```js
class ValidationError extends Error {
  static fromField(name) { return new ValidationError(`${name} invalid`); }
}
try { /*...*/ } catch (e) {
  if (e instanceof ValidationError) { /* handle specifically */ }
}
```

**Say it:** "instanceof walks the prototype chain, so it recognizes subclasses too — I use it to branch on error subtypes in a catch, and static for factories that don't need an instance."
**Red flag:** Relying on instanceof across realms (iframes, worker boundaries). Each realm has its own constructors, so the check fails; use a discriminant property there.

### Promises: states, vs callbacks, errors
**They ask:** "What states does a promise have, and what do promises fix about callbacks?"

Promises exist to fix callback hell and, more importantly, inversion of control — with callbacks you hand your continuation to someone else's code and trust it to call you back once, correctly. A promise flips that: you hold the object and attach handlers. A promise is in exactly one of three states — *pending*, then settled as either *fulfilled* (with a value) or *rejected* (with a reason) — and once settled it's immutable.

Errors propagate down the chain to the nearest `.catch`, which also catches a `throw` inside any `.then`. That single failure path replaces error-first callbacks scattered at every level.

```js
fetchUser()
  .then(u => fetchPosts(u.id))  // returned promise is awaited
  .then(render)
  .catch(err => showError(err)); // catches any rejection above
```

**Say it:** "A promise is pending then settled once — fulfilled or rejected — and it fixes callbacks by giving you back control instead of handing your continuation to their code."
**Red flag:** Forgetting a terminal `.catch`. An unhandled rejection can crash the Node process or fire `unhandledrejection` — every chain needs an error handler.

### async/await basics and errors
**They ask:** "Give me an async function example — how do you handle errors, and what's the common performance trap?"

async/await is syntax over promises — it makes asynchronous code read top-to-bottom, so `try/catch` works normally and control flow is linear. An `async` function always returns a promise; `await p` suspends the function until `p` settles, unwrapping its value or throwing its rejection. Crucially it suspends the function and yields the thread — nothing is blocked.

Errors are handled with ordinary `try/catch` around the `await`. The classic trap is accidental serialization: awaiting independent calls in a loop runs them one at a time.

```js
async function load(ids) {
  try {
    return await Promise.all(ids.map(fetchOne)); // concurrent
  } catch (err) {
    log(err);
    throw err;
  }
}
```

**Say it:** "async/await is promises that read sequentially; the trap is awaiting independent calls in a loop instead of Promise.all."
**Red flag:** Saying `await` "blocks the thread." It suspends the async function and yields — the event loop keeps running everything else.

### Symbol type
**They ask:** "What is a Symbol and when would you actually use one?"

A `Symbol` is a primitive whose every value is unique — `Symbol('id') !== Symbol('id')` — created to give objects collision-proof keys. Because a symbol key can never clash with a string key or another symbol, it's the way to attach metadata to an object without risking a collision with existing or future properties, and symbol keys are skipped by `for...in`, `Object.keys`, and `JSON.stringify`.

The practical uses: well-known symbols that hook into language protocols — most importantly `Symbol.iterator`, which makes an object iterable by `for...of` and spread — and `Symbol.for(key)` for a shared global registry.

```js
const range = {
  from: 1, to: 3,
  [Symbol.iterator]() {
    let n = this.from, last = this.to;
    return { next: () => ({ value: n, done: n++ > last }) };
  }
};
[...range]; // [1, 2, 3]
```

**Say it:** "Symbols are guaranteed-unique keys — I use them for collision-free metadata and to implement Symbol.iterator so my object works with for...of and spread."
**Red flag:** Calling symbols "truly private." They're hidden from normal enumeration but reachable via `Object.getOwnPropertySymbols` and `Reflect.ownKeys` — use `#fields` for real privacy.

### Advanced fetch: headers and binary data
**They ask:** "How do you send and read headers with fetch, and how do you get binary data out of a response?"

Beyond the basic call, `fetch`'s second argument configures the request — `method`, `body`, and a `headers` object (or `Headers` instance) for things like `Content-Type` and `Authorization`. On the way back, `response.headers` is a `Headers` object you read with `.get('content-type')`; it's iterable but not a plain object.

The `Response` body can be consumed as more than JSON: `.blob()` for binary you'll hand to an image or download, `.arrayBuffer()` for raw bytes you'll process, `.text()`, or `.formData()`. Each can be read only once — the body is a stream — so pick the right one.

```js
const res = await fetch('/report.pdf', {
  headers: { Authorization: `Bearer ${token}` },
});
console.log(res.headers.get('content-type'));
const bytes = await res.arrayBuffer(); // or res.blob() for a file/URL
```

**Say it:** "Request headers go in the init object, response headers come off a Headers object via .get — and I pick blob or arrayBuffer for binary, remembering the body streams and reads once."
**Red flag:** Reading the body twice (e.g. `.json()` then `.text()`). The stream is already consumed — the second call throws; use `res.clone()` if you genuinely need two reads.

### Promise chaining, custom promises, finally
**They ask:** "Explain promise chaining and fall-through, how you build a custom promise, and what finally is for."

Chaining works because each `.then` returns a *new* promise, and what you return inside a handler is unwrapped into it — return a value and it passes down; return a promise and the chain waits for it. A rejection "falls through" every `.then` until it reaches a `.catch`, which is why you put one handler at the end instead of guarding every step. You can also catch via `.then`'s second argument — but that argument won't catch an error thrown by the *same* step's success handler, whereas a following `.catch` will.

Build a custom promise with `new Promise((resolve, reject) => ...)` to wrap a callback-based API. `.finally` runs on both settle paths for cleanup and passes the value or reason through untouched.

```js
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
showSpinner();
loadData()
  .then(render)
  .catch(showError)
  .finally(hideSpinner); // always runs
```

**Say it:** "Each then returns a new promise so values and promises flow down; a rejection falls through to the nearest catch, and finally runs on both paths for cleanup without touching the result."
**Red flag:** Using `.then(onSuccess, onError)` to catch the success handler's own throw. That error skips the same-step reject handler — only a chained `.catch` sees it.

### Rewriting promises with async/await
**They ask:** "How do you convert a .then chain to async/await, and can class methods be async?"

A `.then` chain maps mechanically to `await` statements: each `.then(fn)` becomes `const x = await promise`, and the whole thing goes inside `try/catch` in place of `.catch`. The win is linear control flow — intermediate values are just variables, so branching and looping between async steps read naturally instead of nesting closures.

Any function can be async, including class methods and static methods — the method simply returns a promise, so callers `await instance.method()`. This is the standard shape for a data-layer class.

```js
// chain
getUser().then(u => getPosts(u.id)).then(render).catch(log);

// async/await
class Feed {
  async load() {
    try {
      const user = await getUser();
      const posts = await getPosts(user.id);
      return render(posts);
    } catch (err) { log(err); }
  }
}
```

**Say it:** "Each .then becomes an await and the .catch becomes a try/catch — async methods just return a promise, so a data class exposes `await feed.load()`."
**Red flag:** Serializing independent steps during the rewrite. If `getUser` and `getConfig` don't depend on each other, `await Promise.all([...])` — don't await them one after another just because await reads sequential.

### Generators and iterators
**They ask:** "How do generators work, and how do you compose them?"

A generator (`function*`) is a function you can pause and resume — calling it returns an iterator, and each `yield` hands a value out and freezes execution until the next `.next()`. That lazy, pull-based evaluation is why generators model infinite or expensive sequences without materializing them, and why they're the easy way to implement `Symbol.iterator` for a custom iterable.

Composition uses `yield*` to delegate to another iterable — it yields every value from the inner generator, so you build complex sequences out of small ones.

```js
function* range(a, b) { for (let i = a; i <= b; i++) yield i; }
function* combined() {
  yield* range(1, 3);   // delegate
  yield* range(10, 12);
}
[...combined()]; // [1, 2, 3, 10, 11, 12]
```

**Say it:** "A generator pauses at each yield and resumes on next, so it's lazy — and yield* delegates to another generator to compose sequences from small pieces."
**Red flag:** Thinking a generator runs its body when called. Calling it executes *no* code — it just returns an iterator; nothing runs until you pull the first `.next()`.
