# JavaScript (ES6+)

### Destructuring and default parameters
**They ask:** "How do destructuring and default parameters simplify function signatures?"

Destructuring extracts values from objects/arrays directly into named bindings, which turns "positional arguments the caller has to remember the order of" into "a named options bag" — self-documenting at the call site and order-independent. Default parameters (and default values inside a destructuring pattern) collapse what used to be `arg = arg || default` boilerplate into the signature itself, and unlike `||`, they only kick in for `undefined`, not every falsy value.

```js
function createUser({ name, role = 'member', age = null } = {}) {
  return { name, role, age };
}
createUser({ name: 'Ann' }); // role defaults to 'member'
```

**Say it:** "I destructure options objects in the signature so call sites read like named arguments, and I use default values there instead of `arg || default` because defaults only apply to `undefined`, not `0` or `''`."
**Red flag:** Using `arg || default` for a numeric or boolean parameter. `0`, `''`, and `false` are valid values that `||` incorrectly overrides — use a default parameter or an explicit `=== undefined` check.

### Spread and rest operators
**They ask:** "What's the difference between spread and rest, even though they use the same `...` syntax?"

They're inverse operations that share syntax by context. **Spread** expands an iterable/object into individual elements — used to copy/merge arrays and objects immutably, or to pass an array as individual arguments. **Rest** does the opposite: it *collects* remaining arguments or object properties into a single array/object, replacing the old `arguments` object and `Array.prototype.slice.call` tricks.

```js
const merged = { ...defaults, ...overrides };      // spread: expand
function log(first, ...rest) { console.log(rest); } // rest: collect
const [head, ...tail] = [1, 2, 3];                  // rest: collect
```

Both only do a *shallow* copy on objects/arrays — nested references are still shared.

**Say it:** "Spread expands, rest collects — same syntax, opposite direction depending on position — and I remember both are shallow, so nested objects still need their own spread if I want independence."
**Red flag:** Assuming `{ ...obj }` deep-clones. It's a one-level-deep copy; a nested object inside is still the same reference as the original.

### Template literals and tagged templates
**They ask:** "Beyond string interpolation, what are template literals actually good for?"

Interpolation (`` `Hi ${name}` ``) and multi-line strings are the everyday win — no more `+` concatenation or `\n` escapes. The deeper feature is **tagged templates**: a function placed before a template literal receives the string parts and interpolated values *separately*, before they're combined — which is exactly how libraries like `styled-components`, `graphql-tag`, and real parameterized-query builders work, because the tag function can turn the interpolated values into bound parameters instead of ever building a concatenated string.

```js
// illustrative only — a real driver's tag (e.g. postgres.js, Prisma's $queryRaw)
// does this for you; the point is *what* it produces, not this exact code
function sql(strings, ...values) {
  const text = strings.reduce((q, s, i) => q + s + (i < values.length ? `$${i + 1}` : ''), '');
  return { text, values }; // placeholders + a separate values array, never a merged string
}
const { text, values } = sql`SELECT * FROM users WHERE id = ${userId} AND active = ${isActive}`;
await client.query(text, values); // driver binds values as data — 0/false/'' pass through untouched
```

**Say it:** "Template literals aren't just interpolation — tagged templates split the literal parts from the interpolated values *before* they're combined, which is what lets a real driver bind those values as parameters instead of ever building a SQL string. A tag function that escapes-and-reconcatenates isn't the same thing — it's still string building, just with an extra step, and it's easy to get subtly wrong, like dropping falsy values (`0`, `false`, `''`) with a truthy check. Actual safety comes from parameter binding, not escaping."
**Red flag:** Treating a raw template literal as safe for SQL or HTML because "it's not string concatenation." Untagged, it's exactly string concatenation — injection risk included. Same trap one level up: a hand-rolled tag function that escapes and re-concatenates is *also* not production-safe — use the driver's real parameterized query API.

### Optional chaining and nullish coalescing
**They ask:** "What problem do `?.` and `??` solve, and how are they different from `&&` and `||`?"

`?.` short-circuits a property/method/index access to `undefined` the moment any link in the chain is `null`/`undefined`, replacing long `a && a.b && a.b.c` guard chains with one expression. `??` returns the right-hand side only when the left is `null` or `undefined` — unlike `||`, it doesn't treat `0`, `''`, or `false` as "missing," which is exactly the bug `||` causes for numeric/boolean defaults.

```js
const city = user?.address?.city ?? 'Unknown';
const count = input.count ?? 0;   // 0 stays 0
const count2 = input.count || 0;  // 0 becomes 0 too, but breaks if input.count is legitimately 0 and you wanted to detect "unset" differently
```

**Say it:** "`?.` short-circuits a chain on null/undefined instead of writing out guard conditions, and `??` only falls back on null/undefined — not on falsy — which is the fix for the classic `0 || default` bug."
**Red flag:** Chaining `??` and `||`/`&&` in the same expression without parentheses — JS throws a `SyntaxError` on that mix specifically because their precedence would be ambiguous.

### Named vs default exports
**They ask:** "When do you use named exports vs a default export, and what's the trade-off?"

A default export is one per module, imported under any name the importer chooses — convenient for a module with one obvious primary thing, but that freedom means renaming happens silently and tooling can't statically verify the imported name matches anything. Named exports are explicit and multiple-per-module; the import name is checked against the actual export, so a typo is a build-time error, not a runtime `undefined`. Named exports also tree-shake more reliably, since bundlers can see exactly which named bindings are used.

```js
export default function Button() {}      // any importer names it anything
export function useAuth() {}             // import { useAuth } — verified by name
```

**Say it:** "I lean toward named exports because the import name is statically checked and it tree-shakes cleanly — default exports are fine for a module with one clear primary export, but the free-form renaming loses that safety."
**Red flag:** Mixing a default export with several named exports on a module with no clear "primary" thing — it forces every importer to guess which one matters.

### Tree-shaking and ES modules
**They ask:** "Why does tree-shaking need ES modules specifically, and not CommonJS?"

Tree-shaking removes exports a bundle never actually uses, and it can only do that with confidence if it can determine imports/exports *statically*, without running the code — ES modules guarantee this: `import`/`export` are fixed at parse time, always at the top level, never conditional or computed. CommonJS's `require`/`module.exports` are just regular function calls and object mutation, which can happen conditionally or dynamically (`if (x) module.exports = ...`), so a bundler can't safely prove a given export is unused — it has to assume the whole module might have side effects.

```js
// ESM — statically analyzable, tree-shakeable
export function used() {}
export function unused() {} // bundler can safely drop this
```

**Say it:** "Tree-shaking needs static, unconditional import/export declarations to prove something is unused — ESM guarantees that at parse time, CommonJS's dynamic `require`/`module.exports` don't, which is a real reason to prefer ESM for library code."
**Red flag:** Claiming CommonJS "can be tree-shaken too, bundlers just don't bother." It's not laziness — CommonJS's dynamic nature makes safe dead-code elimination provably harder, not just unimplemented.

### Class fields and private #fields
**They ask:** "What do class fields and `#private` fields add over the old constructor-assignment pattern?"

Class fields let you declare instance properties directly in the class body instead of assigning them in the constructor — mostly a readability win, and it makes arrow-function class fields the standard way to auto-bind a method's `this` without a constructor `.bind()` call. `#private` fields are a real, enforced privacy boundary — unlike the old `_underscore` convention (which is just a naming hint anyone can ignore), `#field` is syntactically inaccessible outside the class; even `obj.#field` from outside throws a `SyntaxError` at parse time, not just a lint warning.

```js
class Counter {
  #count = 0;                      // truly private
  increment = () => { this.#count++; }; // class field, auto-bound
  get value() { return this.#count; }
}
```

**Say it:** "Class fields move property declaration into the class body and give arrow-function methods automatic `this` binding for free; `#private` fields are actual language-level encapsulation, not just a naming convention like `_underscore`."
**Red flag:** Calling `_underscore`-prefixed properties "private." They're accessible and mutable from anywhere — `#field` is the only real privacy JS has.

### Static methods and properties
**They ask:** "What are static members for, and when do you reach for them over instance methods?"

`static` members belong to the class itself, not to instances — no instance needs to exist to call them, and they don't have access to instance state via `this`. They're the right fit for factory methods (`User.fromJSON(data)`), utility functions scoped to a class's domain, and shared configuration/counters that all instances need to reference but shouldn't each own a copy of.

```js
class User {
  static fromJSON(json) { return new User(JSON.parse(json)); }
  static #instanceCount = 0;
  constructor() { User.#instanceCount++; }
}
```

**Say it:** "Static members are class-level, not instance-level — I reach for them for factory constructors and shared class-scoped state that no single instance should own."
**Red flag:** Making everything static "to avoid `new`." If the method genuinely needs per-instance state, forcing it static means threading that state through parameters manually instead of letting the instance hold it.

### Getters and setters
**They ask:** "What do `get`/`set` accessors buy you over a plain property?"

Accessors let you expose something that *reads* like a plain property while running computed logic or validation behind the scenes — the caller's syntax (`obj.fullName`) never has to change even if the implementation moves from a stored field to a derived value or gains validation. This is useful for computed/derived properties and for guarding a private field's invariants (reject an invalid assignment in the setter) without forcing callers to call a method.

```js
class Temperature {
  #celsius = 0;
  get fahrenheit() { return this.#celsius * 9 / 5 + 32; }
  set fahrenheit(f) { this.#celsius = (f - 32) * 5 / 9; }
}
```

**Say it:** "Getters/setters keep the call site looking like a plain property while I compute a derived value or validate an assignment behind it — the API doesn't change even if the underlying representation does later."
**Red flag:** Putting expensive or side-effecting work (a network call, heavy computation) inside a getter. Callers expect property access to be cheap and synchronous — surprise cost there is a real footgun.

### The Fetch API
**They ask:** "What does `fetch` give you over the old `XMLHttpRequest`, and what does it *not* handle automatically that people assume it does?"

`fetch` is Promise-based instead of callback/event-based, so it composes with `async`/`await` and `Promise` combinators naturally, and its `Request`/`Response`/`Headers` objects give a cleaner, stream-capable API than `XMLHttpRequest`'s pile of event handlers. The trap: `fetch` only rejects on a *network* failure — a `404` or `500` response resolves successfully, so you must check `response.ok` yourself, unlike most HTTP client libraries that throw on non-2xx by convention.

```js
const res = await fetch(url);
if (!res.ok) throw new Error(`HTTP ${res.status}`); // fetch won't do this for you
const data = await res.json();
```

**Say it:** "`fetch` is promise-based and stream-capable, but it only rejects on network failure — a 404 resolves fine — so I always check `response.ok` explicitly instead of relying on a catch block to see HTTP errors."
**Red flag:** Wrapping a `fetch` call in try/catch and assuming a 404/500 lands in the `catch`. It won't — the promise resolved; the error is in the response status.

### AbortController and cancelling fetch
**They ask:** "How do you cancel an in-flight `fetch`, and why does that matter?"

`AbortController` is a general cancellation primitive — its `.signal` is passed to `fetch` (or any AbortSignal-aware API), and calling `.abort()` rejects the pending fetch with an `AbortError`. It matters most for avoiding wasted work and race conditions: a search-as-you-type input firing a new request per keystroke needs to cancel the previous request, otherwise a slow earlier response can resolve *after* a faster later one and overwrite it with stale data.

```js
let controller;
async function search(query) {
  controller?.abort();               // cancel the previous in-flight request
  controller = new AbortController();
  const res = await fetch(`/search?q=${query}`, { signal: controller.signal });
  return res.json();
}
```

**Say it:** "`AbortController` gives fetch real cancellation — I use it to kill superseded requests, like search-as-you-type, so a stale slow response can't race ahead and overwrite the current fast one."
**Red flag:** "Cancelling" a request by just ignoring its promise and firing a new one. The old request still completes server-side and client-side, wasting bandwidth and creating exactly the race condition `AbortController` prevents.

### Promise combinators: all, race, allSettled, any
**They ask:** "Walk through `Promise.all`, `.race`, `.allSettled`, and `.any` — when does each fit?"

They differ in how they handle rejection and how many results they wait for. `Promise.all` waits for every promise to fulfill but **short-circuits and rejects immediately** if any one rejects — right for "I need all of these or none of them." `Promise.allSettled` waits for every promise regardless of outcome and gives you a result array with each `status` — right when partial failure is acceptable and you need to know which ones failed. `Promise.race` resolves/rejects with whichever settles first — used for timeouts. `Promise.any` resolves with the first *fulfillment*, ignoring rejections unless all reject.

```js
const results = await Promise.allSettled([fetchA(), fetchB(), fetchC()]);
const timeout = Promise.race([fetchData(), new Promise((_, rej) => setTimeout(() => rej('timeout'), 5000))]);
```

**Say it:** "`all` is all-or-nothing and fails fast, `allSettled` waits for everything and reports each outcome, `race` gives me the first settlement of either kind — I use it for timeouts — and `any` gives me the first success."
**Red flag:** Using `Promise.all` for independent, partial-failure-tolerant work (like fetching several optional widgets). One rejection kills the whole batch when `allSettled` was the correct tool.

### Promise chaining pitfalls
**They ask:** "What are the common mistakes in `.then` chains?"

The biggest is forgetting to `return` inside a `.then` — if the callback doesn't return the next promise, the chain doesn't wait for it, and you get a race condition where the "next" step runs before the async work it depended on finishes. The second is nesting `.then` calls instead of chaining them flat, which recreates callback-hell's pyramid and usually signals a missing `return`. The third is swallowing errors: a `.catch` placed too early only catches errors from the steps *before* it, not steps chained after it.

```js
// BUG: missing return — doesn't wait for the write
fetchUser(id).then(user => { saveToCache(user); }).then(() => render());
// fix
fetchUser(id).then(user => saveToCache(user)).then(() => render());
```

**Say it:** "The classic `.then` bug is forgetting to `return` the inner promise, which breaks the chain's ordering guarantee — I check every `.then` callback returns something if the next step depends on it, and I place `.catch` after everything it needs to cover."
**Red flag:** Nesting `.then` calls instead of chaining flat. It's a strong signal of a missing `return` and reintroduces the pyramid-of-doom shape promises were meant to fix.

### Error handling in async/await
**They ask:** "How should you structure error handling around async/await?"

`await` turns a rejected promise into a thrown exception at that line, so `try/catch` around `await` works exactly like synchronous error handling — that's the main ergonomic win over `.then/.catch`. The trap: `try/catch` only catches errors from `await`ed code inside it; a promise you *don't* await (fire-and-forget) rejects invisibly and becomes an `unhandledRejection`. In `Promise.all`, one failure rejects the whole array, so partial-failure-tolerant code needs `allSettled` inside the `try`, not `all`.

```js
async function loadUser(id) {
  try {
    const user = await fetchUser(id);
    return user;
  } catch (err) {
    logger.error('failed to load user', err);
    throw err; // or return a fallback — decide deliberately, don't swallow silently
  }
}
```

**Say it:** "`await` converts rejection into a normal thrown exception, so `try/catch` handles async errors the same way as sync ones — the trap is an un-awaited promise rejecting invisibly outside any catch, which is exactly what turns into an `unhandledRejection`."
**Red flag:** An empty `catch {}` block that swallows the error with no logging or rethrow. It turns a real failure into silent, undebugable data loss.

### Sequential vs parallel awaits
**They ask:** "When should independent async calls run in parallel instead of sequentially, and how do you write that?"

Awaiting each call one after another inside a loop or in sequence forces them to run serially even when they have no dependency on each other — total time becomes the *sum* of each call's latency instead of the *max*. If the calls are independent, start them all first (which fires the underlying work immediately, since a promise begins executing the moment it's created) and only `await` the combined result.

```js
// sequential — slow, waits for A before even starting B
const a = await fetchA();
const b = await fetchB();

// parallel — both start immediately
const [a2, b2] = await Promise.all([fetchA(), fetchB()]);
```

**Say it:** "A promise starts running the moment it's created, not when it's awaited — so for independent calls I start them all first and `Promise.all` the results, turning total latency from a sum into a max."
**Red flag:** `await`ing inside a `for` loop for calls that don't depend on each other's results. It's accidentally serial and is one of the most common real-world performance bugs in async code.

### Map vs plain object
**They ask:** "When do you reach for `Map` instead of a plain object?"

A plain object's keys are always coerced to strings (or Symbols), inherits from `Object.prototype` (so `hasOwnProperty` checks and prototype pollution are real concerns), and has no reliable size or insertion-order guarantee across all engines historically. `Map` keeps keys of *any type* including objects and functions, has a guaranteed insertion-order iteration, an O(1) `.size`, and no prototype pollution risk since it's not backed by the object system. It's the right structure whenever the "object" is really being used as a dictionary with dynamic keys, especially non-string ones.

```js
const cache = new Map();
cache.set(userObject, metadata); // object as key — impossible with plain objects
cache.size; // O(1), no Object.keys(obj).length workaround
```

**Say it:** "I reach for `Map` over a plain object as a dictionary whenever keys are dynamic, non-string, or I need a reliable `.size` and iteration order — plain objects are for fixed, known shapes, not general key-value storage."
**Red flag:** Using a plain object as a cache keyed by user input without sanitizing keys like `__proto__` or `constructor`. That's a real prototype-pollution vector; `Map` sidesteps it entirely.

### Set and its use cases
**They ask:** "What is `Set` for, and what's a practical use beyond 'unique array'?"

`Set` stores unique values with O(1) `has`/`add`/`delete`, which makes "deduplicate an array" a one-liner (`[...new Set(arr)]`), but the deeper use is anywhere you need fast *membership testing* instead of `Array.prototype.includes`, which is O(n) per check. It also composes well for set operations — union, intersection, difference — when modeling things like permission sets or tag filters.

```js
const seen = new Set();
const unique = items.filter(item => (seen.has(item.id) ? false : seen.add(item.id)));
const intersection = [...setA].filter(x => setB.has(x));
```

**Say it:** "`Set` gives O(1) membership checks, so I reach for it any time I'm testing 'have I seen this before' in a loop — `array.includes` in a loop is the O(n²) mistake `Set` fixes."
**Red flag:** Repeatedly calling `array.includes()` inside a loop to check membership against a growing list. That's quadratic; a `Set` makes each check constant time.

### Symbol
**They ask:** "What is `Symbol` for, and where do you actually see it used?"

`Symbol` creates a guaranteed-unique primitive value, even if two symbols are created with the identical description string — used as an object key, it can never collide with a string key or another symbol, which makes it useful for defining "hidden" or protocol-level properties that won't clash with arbitrary user data or accidental string keys. The most common real use is `Symbol.iterator`, the well-known symbol that makes an object work with `for...of` and spread — implementing it is how you make a custom class iterable.

```js
class Range {
  constructor(start, end) { this.start = start; this.end = end; }
  [Symbol.iterator]() {
    let cur = this.start, end = this.end;
    return { next: () => cur <= end ? { value: cur++, done: false } : { value: undefined, done: true } };
  }
}
[...new Range(1, 3)]; // [1, 2, 3]
```

**Say it:** "`Symbol` gives me a collision-proof key, and the practical everyday use is `Symbol.iterator` — implementing it is exactly how a custom class becomes usable with `for...of` and the spread operator."
**Red flag:** Reaching for `Symbol` to make a property "private." It's collision-resistant, not hidden — `Object.getOwnPropertySymbols` still exposes it; `#private` fields are the actual privacy tool.

### WeakMap and WeakRef
**They ask:** "What problem do `WeakMap`/`WeakRef` solve that a regular `Map` doesn't?"

A regular `Map` holds a *strong* reference to its keys/values, so an object used as a `Map` key stays alive in memory as long as the map exists, even if nothing else references it — that's a memory leak if you're using a map to attach metadata to objects with independent lifetimes (e.g. DOM nodes). `WeakMap` holds its keys *weakly*: if nothing else references the key object, the garbage collector can reclaim it, and the entry disappears automatically — no manual cleanup, no `delete`. `WeakRef` is the same idea for a single reference, letting you hold a pointer to an object without keeping it alive.

```js
const metadata = new WeakMap();
function attach(node, data) { metadata.set(node, data); } // no leak when `node` is removed from the DOM
```

**Say it:** "`WeakMap` keys don't keep their objects alive — the entry is garbage-collected along with the key — which is exactly the right tool for attaching metadata to an object without leaking memory when that object goes away elsewhere."
**Red flag:** Trying to iterate a `WeakMap` or read its `.size`. It's intentionally non-enumerable — since entries can vanish at any GC pause, exposing iteration or count would be non-deterministic, so the API forbids it.

### Generator functions
**They ask:** "What is a generator function, and what makes it different from a regular function?"

A `function*` doesn't run to completion when called — it returns an *iterator* and pauses execution at each `yield`, resuming exactly where it left off the next time `.next()` is called. That gives you lazy, on-demand sequences (including infinite ones) without pre-computing everything into an array, and it's the low-level mechanism `async/await` itself is desugared onto in spirit — pausable execution that resumes with a value.

```js
function* idGenerator() {
  let id = 1;
  while (true) yield id++;
}
const gen = idGenerator();
gen.next().value; // 1
gen.next().value; // 2
```

**Say it:** "A generator pauses at `yield` and resumes on demand instead of running to completion, which is how I build lazy or infinite sequences without materializing them into memory up front."
**Red flag:** Calling a generator function and treating the return value as the result directly. `gen()` returns an iterator, not a value — you need `.next().value` or a `for...of`/spread to consume it.

### The iterator protocol
**They ask:** "What is the iterator protocol, and how does `for...of` rely on it?"

An object is *iterable* if it implements `[Symbol.iterator]`, a method returning an *iterator* — an object with a `.next()` method that returns `{ value, done }` on each call. `for...of`, spread, destructuring, and `Promise.all` all work on anything implementing this protocol, which is why arrays, strings, `Map`, `Set`, and generators are all interchangeable in those contexts despite being different data structures — they share one shape at the protocol level, not a common class.

```js
const iterable = {
  [Symbol.iterator]() {
    let i = 0;
    return { next: () => i < 3 ? { value: i++, done: false } : { value: undefined, done: true } };
  },
};
[...iterable]; // [0, 1, 2]
```

**Say it:** "`for...of` and spread don't care about the concrete type, only that it implements `[Symbol.iterator]` returning `{ value, done }` — that's the protocol, and it's why generators, `Map`, `Set`, and arrays all just work with the same syntax."
**Red flag:** Using `for...in` on an array expecting the same guarantee as `for...of`. `for...in` iterates enumerable *keys*, including inherited/non-index ones — it's for objects, not the iteration protocol arrays/iterables use.

### Async generators and for-await-of
**They ask:** "What is an async generator, and when do you reach for it?"

An `async function*` combines both mechanisms: each `yield` can itself be an awaited value, so you get a lazily-pulled *stream* of asynchronously-produced values instead of a fully materialized array you'd have to `await Promise.all` up front. Consume it with `for await (const x of gen())`, which awaits each yielded value in sequence. It's the natural fit for paginated API results, reading data in chunks, or wrapping a Node stream as an async-iterable sequence — process items as they arrive instead of waiting for the whole set.

```js
async function* paginate(url) {
  let next = url;
  while (next) {
    const res = await fetch(next);
    const { items, nextUrl } = await res.json();
    yield* items;
    next = nextUrl;
  }
}
for await (const item of paginate('/api/items')) process(item);
```

**Say it:** "Async generators let me pull an asynchronous stream of values lazily, item by item, instead of awaiting the whole collection up front — `for await...of` is the natural consumer, and it's exactly the pattern for cursor-based pagination or chunked processing."
**Red flag:** Fetching every page of a paginated API into one array before processing anything, when the actual need is "process items as they arrive." An async generator avoids holding the whole result set in memory.
