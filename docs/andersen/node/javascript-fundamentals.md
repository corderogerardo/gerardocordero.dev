# JavaScript fundamentals (ES5)

### var, let, and const
**They ask:** "What's the real difference between `var`, `let`, and `const`?"

The difference that matters isn't syntax, it's *scope and lifetime*. `var` is function-scoped and hoisted with an initial value of `undefined`, so it leaks out of `if`/`for` blocks and survives being read before its declaration line — a classic source of loop-closure bugs. `let`/`const` are block-scoped and live in the "temporal dead zone" until their declaration executes, so reading them early throws instead of silently returning `undefined`.

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 0); // 3 3 3
for (let j = 0; j < 3; j++) setTimeout(() => console.log(j), 0); // 0 1 2
```

`const` doesn't mean immutable — it means the *binding* can't be reassigned; object/array contents are still mutable.

**Say it:** "`var` is function-scoped and hoisted to `undefined`, which is why it leaks out of blocks; `let`/`const` are block-scoped and throw if read before declaration — I default to `const` and only reach for `let` when a value is reassigned."
**Red flag:** Saying `const` makes an object immutable. It freezes the binding, not the contents — mutate `const obj` freely unless you `Object.freeze` it.

### Hoisting
**They ask:** "Explain hoisting — what actually gets hoisted?"

Hoisting is a consequence of how the JS engine builds scope in two passes: a compile pass that registers every `var`/function/`let`/`const` declaration in scope before execution, then an execution pass that runs the code top to bottom. Function *declarations* are hoisted with their full body, so you can call one before its text appears. `var` is hoisted but only initialized to `undefined`; `let`/`const` are hoisted too, but stay in the temporal dead zone until their line runs.

```js
console.log(typeof foo); // "function" — declaration hoisted whole
function foo() {}
console.log(bar); // undefined — var hoisted, not initialized
var bar = 1;
console.log(baz); // ReferenceError — TDZ
let baz = 2;
```

**Say it:** "Hoisting is the compile pass registering declarations before execution — function declarations hoist whole, `var` hoists as `undefined`, and `let`/`const` hoist but stay in the temporal dead zone until their line runs."
**Red flag:** Claiming `let` and `const` "aren't hoisted at all." They are — the TDZ *is* the hoisted-but-uninitialized state; that's why redeclaring a `let` in the same scope throws instead of just shadowing.

### Closures
**They ask:** "What is a closure, and give a practical use for one."

A closure is a function bundled with the lexical scope it was created in, so it keeps access to outer variables even after the outer function has returned. It matters because it's the mechanism behind private state, memoization, and factory functions — anywhere you want a function to remember something between calls without polluting the outer scope.

```js
function makeCounter() {
  let count = 0;
  return () => ++count;
}
const counter = makeCounter();
counter(); // 1
counter(); // 2
```

`count` isn't garbage-collected because the returned function still references it — the closure keeps it alive.

**Say it:** "A closure is a function plus the scope it captured at creation time — I use it for private state and memoization, and I remember it's also why unintentionally captured large objects can leak memory."
**Red flag:** Calling a closure "just a nested function." Nesting isn't the point — retaining access to the *outer scope after that scope would otherwise be gone* is.

### `this` binding rules
**They ask:** "How is `this` determined in JavaScript?"

`this` isn't lexical for regular functions — it's determined by *how a function is called*, not where it's defined. Four rules, in priority order: `new Foo()` binds `this` to the new object; `fn.call(obj)`/`fn.apply(obj)`/`fn.bind(obj)` binds explicitly; `obj.method()` binds `this` to `obj` (implicit); a bare function call binds `this` to `undefined` in strict mode (or the global object otherwise). Arrow functions break this pattern entirely — they have no own `this` and inherit it lexically from the enclosing scope at definition time.

```js
const obj = {
  name: 'a',
  regular() { return this.name; },
  arrow: () => this?.name,
};
obj.regular(); // 'a' — implicit binding
obj.arrow();   // undefined — inherited from module scope
```

**Say it:** "`this` is determined by call-site, not definition-site, except for arrow functions, which lexically inherit `this` from where they were written — that's exactly why arrows are the right choice for callbacks that need the surrounding `this`."
**Red flag:** Passing `obj.method` as a bare callback (`setTimeout(obj.method, 0)`) and expecting `this` to still be `obj`. It loses its receiver; bind it or wrap it in an arrow.

### call, apply, and bind
**They ask:** "What's the difference between `call`, `apply`, and `bind`?"

All three explicitly set `this` for a function call, differing only in *when* the call happens and how arguments are passed. `call(thisArg, a, b)` invokes immediately with a comma-separated argument list. `apply(thisArg, [a, b])` invokes immediately with an argument array — useful when you have arguments as an array already (e.g. `Math.max.apply(null, arr)`, though the spread operator replaced most of that use case). `bind(thisArg)` doesn't call anything — it returns a *new function* permanently bound to `thisArg`, safe to pass around as a callback.

```js
function greet(greeting) { return `${greeting}, ${this.name}`; }
greet.call({ name: 'Ann' }, 'Hi');    // "Hi, Ann"
greet.apply({ name: 'Ann' }, ['Hi']); // "Hi, Ann"
const bound = greet.bind({ name: 'Ann' });
bound('Hi'); // "Hi, Ann"
```

**Say it:** "`call`/`apply` invoke immediately with different argument shapes; `bind` returns a new function permanently bound to a `this` — I reach for `bind` when a method is handed off as a callback and needs to keep its receiver."
**Red flag:** Rebinding an already-bound function and expecting the new `this` to win. Once bound, a function's `this` can't be re-bound — later `call`/`apply`/`bind` calls on it are silently ignored.

### Object creation patterns
**They ask:** "What are the ways to create objects in JS, and when do you reach for each?"

Object literals cover the common case — a fixed shape, created once. Factory functions return a plain object built from parameters, useful when you need creation logic without the `new`/prototype machinery. Constructor functions plus `new` (or the equivalent `class`) give you shared methods on a prototype instead of duplicated per-instance functions, which matters at scale — one function on the prototype vs. one per object. `Object.create(proto)` is the most explicit: it builds an object with a given prototype directly, useful for prototypal inheritance without a constructor at all.

```js
const literal = { name: 'a' };
function factory(name) { return { name }; }
function Ctor(name) { this.name = name; }
Ctor.prototype.greet = function () { return `hi ${this.name}`; };
const viaCreate = Object.create(Ctor.prototype);
```

**Say it:** "I use literals for fixed shapes, factories for creation logic without `new`, and constructors/classes when instances need shared prototype methods instead of a copy per object."
**Red flag:** Defining methods inside the constructor (`this.greet = function(){}`) instead of on the prototype. Every instance gets its own copy of the function, wasting memory at scale.

### Object.freeze, seal, and assign
**They ask:** "What do `Object.freeze`, `Object.seal`, and `Object.assign` actually guarantee?"

They sit on a spectrum of immutability. `Object.freeze` locks an object completely — no new props, no deletions, no value changes (silently no-ops in non-strict mode, throws in strict). `Object.seal` is looser — it blocks adding/removing properties but still allows changing existing values. `Object.assign(target, ...sources)` does a *shallow* merge, copying own enumerable properties left to right, which is the classic way to build a new object without mutating the originals — provided nested objects aren't shared by reference.

```js
const frozen = Object.freeze({ a: 1 });
frozen.a = 2; // silently ignored (non-strict)
const merged = Object.assign({}, defaults, overrides);
```

**Say it:** "`freeze` locks everything, `seal` only blocks add/remove, and `assign` shallow-merges — for a true immutable update of nested state I still need to spread or clone each level myself."
**Red flag:** Assuming `Object.freeze` is deep. It only freezes the top level — nested objects inside a frozen object are still fully mutable.

### Shallow vs deep clone
**They ask:** "How do you clone an object in JS, and what's the shallow-vs-deep trap?"

A shallow clone (`{...obj}`, `Object.assign({}, obj)`, `Array.prototype.slice`) copies the top-level keys but nested objects/arrays are copied *by reference* — mutating a nested value through the clone mutates the original too. A deep clone recursively copies every nested level so the two are fully independent. `structuredClone(obj)` (built into modern Node/browsers) is the standard deep-clone tool now; `JSON.parse(JSON.stringify(obj))` is the old workaround but silently drops functions, `undefined`, `Symbol` keys, and turns `Date`/`Map`/`Set` into plain objects or strings.

```js
const shallow = { ...state, user: { ...state.user } }; // manual deep-ish
const deep = structuredClone(state); // real deep clone
```

**Say it:** "A shallow clone shares nested references with the original, which is exactly why mutating a nested field after a shallow clone still corrupts the source — I reach for `structuredClone` when I actually need independence, not the `JSON.stringify` trick, which drops functions and dates."
**Red flag:** Using `JSON.parse(JSON.stringify(x))` on data containing `Date`, `undefined`, or functions and being surprised they vanished or changed type.

### Garbage collection in V8
**They ask:** "How does garbage collection work in Node/V8, at a level a senior should know?"

V8 uses generational, mostly-tracing GC built on reachability: an object is garbage once nothing reachable from the root (global object, call stack, closures) references it — reference counting alone isn't used because it can't handle cycles. The heap splits into a small **young generation** (Scavenge, a fast copying collector — most objects die young, so this runs often and cheaply) and a larger **old generation** (Mark-Sweep-Compact, which runs less often since it's more expensive and can pause the main thread). Objects that survive a couple of Scavenge cycles get promoted to old space.

The practical impact: allocating a lot of short-lived garbage is cheap; the killer for latency is when old-space Mark-Sweep pauses (or an oversized heap) blocks the event loop long enough to matter.

**Say it:** "V8's GC is generational and reachability-based, not reference-counted, so it handles cycles — young objects die fast and cheap in Scavenge, survivors get promoted to old space where the more expensive Mark-Sweep-Compact runs, and that's the pause you actually have to watch for in a latency-sensitive server."
**Red flag:** Saying JS "uses reference counting" for GC. That was old IE/early browser behavior for some objects; V8 is a tracing, reachability-based collector precisely because reference counting can't collect cycles.

### Common memory leak patterns
**They ask:** "What are the classic ways a long-running Node process leaks memory?"

Leaks in a garbage-collected language mean *unintentionally reachable* objects, not literally lost memory. The recurring culprits: forgotten `setInterval`/event listeners that keep a closure (and everything it captured) alive after the thing it was watching is gone; an ever-growing module-level cache or array with no eviction; closures over large objects when only a small piece was needed; and detached references held by a global `Map` keyed by request or socket that's never cleaned up on disconnect.

```js
// leak: listener never removed, closure keeps `bigData` alive per connection
socket.on('data', () => process(bigData));
// fix
const handler = () => process(bigData);
socket.on('data', handler);
socket.on('close', () => socket.off('data', handler));
```

**Say it:** "Leaks in Node are almost always something staying reachable longer than intended — a listener that outlives its emitter, an unbounded cache, or a closure capturing more than it needs — so I reach for `--inspect` heap snapshots and diff them across GCs to find the retainer, not guess."
**Red flag:** Fixing a "leak" by manually calling `global.gc()` in production. That masks symptoms without finding the retained reference — heap snapshot comparison finds the actual root cause.

### Primitive vs reference types
**They ask:** "What's the practical difference between primitive and reference types in JS?"

Primitives (`string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`) are immutable and compared/copied *by value* — assigning or passing one always copies the value. Objects (including arrays and functions) are compared/copied *by reference* — a variable holds a pointer to the object, so assignment copies the pointer, not the data, and two variables can alias the same object.

```js
let a = 1, b = a; b = 2; // a is still 1
let obj1 = { x: 1 }, obj2 = obj1; obj2.x = 2; // obj1.x is now 2 too
obj1 === obj2; // true — same reference
```

**Say it:** "Primitives copy by value on assignment; objects copy the reference, so two variables can end up pointing at the same object — that's the root cause behind most 'I mutated one and the other changed too' bugs."
**Red flag:** Comparing two structurally-identical objects with `===` and expecting `true`. Reference equality checks identity, not shape — use a deep-equal check or compare specific fields.

### Type coercion and strict equality
**They ask:** "Explain type coercion, and why prefer `===` over `==`?"

`==` performs type coercion before comparing — it converts operands to a common type using rules that are genuinely hard to memorize (`'' == 0` is `true`, `null == undefined` is `true` but `null == 0` is `false`). `===` compares both value *and* type with no coercion, which is predictable and matches what most engineers actually mean. The one common, intentional use of `==` is `x == null`, which reads as "null or undefined" in one check.

```js
0 == '0';        // true (coerced)
0 === '0';       // false
null == undefined; // true — special-cased
[] == false;     // true (very surprising)
```

**Say it:** "`==` coerces types with rules that surprise people, so I default to `===` everywhere except the deliberate `x == null` idiom for catching both null and undefined in one check."
**Red flag:** Not knowing `[] == false` is `true`. If a candidate defends `==` as "basically the same," that's the tell they haven't hit the coercion table's edge cases.

### Date pitfalls
**They ask:** "What are the common gotchas with JavaScript's `Date`?"

`Date` is mutable — every setter (`setDate`, `setMonth`, ...) changes the instance in place, so passing a `Date` around and mutating it corrupts every reference that holds it, the same aliasing trap as any object. Months are zero-indexed (`0` = January), a constant source of off-by-one bugs. `Date` has no built-in timezone type — it stores a UTC timestamp internally but `toString()`/getters use the *host system's* local timezone, so the same code produces different output on different servers unless you explicitly work in UTC or use a library.

```js
const d = new Date(2024, 0, 15); // Jan 15, 2024 — month is 0-indexed
d.getUTCDate(); // timezone-safe
```

**Say it:** "`Date` is mutable, zero-indexes months, and formats in the host's local timezone by default — for anything server-side that needs consistency across machines I work in UTC explicitly or reach for a library like `date-fns`/`Temporal`."
**Red flag:** Storing and comparing dates as locale-formatted strings. Compare timestamps (`.getTime()`) or ISO strings, never locale-dependent display strings.

### JSON.stringify and JSON.parse edge cases
**They ask:** "What does `JSON.stringify` silently drop or change?"

JSON has a smaller type system than JS, so `stringify` makes lossy choices: `undefined`, functions, and `Symbol` values are *omitted* entirely from objects (or turned to `null` inside arrays); `NaN` and `Infinity` become `null`; `Date` objects call `.toJSON()` and become ISO strings, losing the `Date` type on the way back; circular references throw a `TypeError`. `parse` is the mirror problem — everything comes back as plain objects/arrays/primitives, so a `Map`, `Set`, or class instance you stringified is now just a plain object.

```js
JSON.stringify({ a: undefined, b: () => {}, c: NaN }); // '{"c":null}'
JSON.stringify([undefined, function(){}]); // '[null,null]'
```

**Say it:** "`JSON.stringify` silently drops `undefined`/functions, turns `NaN`/`Infinity` into `null`, and throws on circular structures — I use it as a serialization boundary, never assume round-tripping preserves the original type."
**Red flag:** Round-tripping a `Map` or `Date` through `JSON.stringify`/`parse` and expecting the original type back. You get a plain object or string — reconstruct the real type explicitly on the way in.

### Higher-order functions
**They ask:** "What is a higher-order function, and why do `map`/`filter`/`reduce` matter?"

A higher-order function either takes a function as an argument or returns one — it's the mechanism behind treating behavior as data, which is what lets `map`/`filter`/`reduce` replace imperative loops with declarative, composable pipelines. `map` transforms each element 1:1, `filter` keeps a subset by predicate, `reduce` folds the array into a single accumulated value (including building a new array or object). The senior nuance: chaining several of these creates multiple intermediate arrays, which is fine for readability at typical sizes but worth collapsing into one `reduce` on a genuine hot path.

```js
const total = orders
  .filter(o => o.status === 'paid')
  .map(o => o.amount)
  .reduce((sum, amt) => sum + amt, 0);
```

**Say it:** "Higher-order functions let me pass behavior as data, which is why `map`/`filter`/`reduce` read as intent instead of loop mechanics — I only collapse a chain into one pass when profiling shows the intermediate arrays actually matter."
**Red flag:** Using `.forEach` with a mutation to build a new array instead of `.map`. It works, but it hides intent and loses the guarantee that the output has the same length as the input.

### Execution context and the call stack
**They ask:** "What is an execution context, and how does the call stack relate to it?"

Every time a function runs, the engine creates an execution context: a record of that call's variable bindings, its `this`, and a reference to the outer (lexical) scope. The **call stack** is the stack of these contexts — pushing one on every function call, popping it on return. This is exactly why a synchronous, deeply recursive function without a base case throws `RangeError: Maximum call stack size exceeded` — it keeps pushing contexts with nowhere to pop.

The global context sits at the bottom, created once when the script starts; everything else nests on top of it during execution.

**Say it:** "An execution context is the per-call record of scope, variables, and `this`; the call stack is the LIFO stack of those contexts, and stack overflow is just that stack growing without returning."
**Red flag:** Confusing the call stack with the event loop's callback/task queues. The stack is synchronous execution; the queues hold *pending* callbacks waiting for the stack to empty.

### Scope chain and lexical scoping
**They ask:** "What is the scope chain, and how does JS resolve a variable lookup?"

JS is lexically (statically) scoped: a function's set of accessible outer scopes is determined by *where it's written* in the source, not by who calls it. When code references a variable, the engine walks the scope chain — starts in the current function's local scope, then each enclosing function's scope, then module/global — returning the first match, or `ReferenceError` if none exists. This chain is fixed at definition time, which is exactly what makes closures work: the function keeps a live link to that chain even after the outer function returns.

```js
const x = 'outer';
function outer() {
  const x = 'inner';
  function inner() { console.log(x); } // resolves to 'inner', lexically nearest
  return inner;
}
```

**Say it:** "Scope is lexical — fixed by where a function is written, not where it's called — so lookup walks outward through enclosing scopes at definition time, and that fixed chain is exactly what a closure keeps alive."
**Red flag:** Saying JS has dynamic scoping. It doesn't (`this` is dynamic, but variable scope is not) — conflating the two is a common but telling mistake.

### The prototype chain
**They ask:** "How does property lookup work through the prototype chain?"

Every object has an internal `[[Prototype]]` link (exposed as `__proto__`, set properly via `Object.create`/`class extends`) to another object. When you read a property, the engine checks the object's own properties first; if missing, it walks up `[[Prototype]]` links until it finds the property or hits `null` (the end of the chain, `Object.prototype`'s prototype). This is how methods are shared without duplication — every array instance doesn't carry its own copy of `.push`, they all resolve it through `Array.prototype`.

```js
const arr = [];
arr.hasOwnProperty('push'); // false — it's on the prototype
Object.getPrototypeOf(arr) === Array.prototype; // true
```

**Say it:** "Property lookup walks the `[[Prototype]]` chain until it finds a match or hits `null` — it's how every instance shares methods from one prototype object instead of carrying its own copy."
**Red flag:** Confusing `Function.prototype` (the object every instance inherits from) with a function's own `prototype` property (which exists only on functions used as constructors) — they're related but distinct concepts.

### Prototypal vs classical inheritance
**They ask:** "How is JS's prototypal inheritance different from classical (class-based) inheritance, and what is `class` actually doing?"

Classical inheritance (Java, C++) copies behavior from a class blueprint at instantiation. JS's prototypal inheritance instead *links* objects: an object delegates to its prototype at lookup time, so changes to the prototype are visible to every object linked to it, even after they were created. `class`/`extends` in modern JS is syntactic sugar over exactly this mechanism — it still builds a prototype chain under the hood, it just hides the `Object.create`/constructor-function boilerplate.

```js
class Animal { speak() { return 'sound'; } }
class Dog extends Animal { speak() { return 'bark'; } }
Object.getPrototypeOf(Dog.prototype) === Animal.prototype; // true
```

**Say it:** "JS inheritance is prototype delegation, not copying — `class`/`extends` is sugar over the same prototype chain, which is why `instanceof` and `super` still work the way they do under the hood."
**Red flag:** Saying `class` makes JS "actually class-based now." It's the same prototypal mechanism with cleaner syntax — there's no new inheritance model underneath.

### Regular expressions in practice
**They ask:** "Walk through the regex methods you actually use, and their differences."

`String.prototype.match`/`matchAll` extract matches, `replace`/`replaceAll` substitute, `test` returns a boolean, `RegExp.prototype.exec` steps through matches one at a time (stateful with the `g` flag — it remembers `lastIndex` between calls). The flags that matter most: `g` (global, all matches), `i` (case-insensitive), `m` (multiline `^`/`$`), `s` (dot matches newline). Named capture groups (`(?<year>\d{4})`) make extraction self-documenting instead of counting positional groups.

```js
const re = /(?<year>\d{4})-(?<month>\d{2})/;
const { groups } = '2024-03'.match(re);
groups.year; // '2024'
```

**Say it:** "I reach for named groups over positional ones for readability, and I remember `exec`/`test` with the `g` flag are stateful across calls on the same regex object — reusing one without resetting `lastIndex` is a classic bug."
**Red flag:** Reusing a global regex object across calls (e.g. in a loop or across requests) without realizing `lastIndex` persists between them, silently skipping or missing matches.

### Catastrophic backtracking
**They ask:** "What is catastrophic backtracking in regex, and why is it a security concern (ReDoS)?"

Certain regex patterns — typically nested quantifiers like `(a+)+` or overlapping alternations — force the backtracking engine to try an exponential number of ways to fail a match on adversarial input. A carefully crafted input string can make a "simple" regex take seconds or minutes on a single request, and since Node's regex engine runs synchronously on the main thread, that one request blocks the entire event loop for everyone — this is ReDoS, a real denial-of-service vector, not just a performance curiosity.

```js
// vulnerable: nested quantifier
/^(a+)+$/.test('a'.repeat(30) + '!'); // exponential blowup
```

**Say it:** "Nested or ambiguous quantifiers can make backtracking exponential, and because regex execution is synchronous, that's a real ReDoS vector against a Node server — I avoid nested quantifiers on untrusted input and, for anything user-supplied, validate length first or use a linear-time engine."
**Red flag:** Running a user-supplied regex pattern, or a hand-written pattern with nested quantifiers, directly against untrusted input with no length cap or timeout.

### try/catch/finally semantics
**They ask:** "What are the precise semantics of try/catch/finally, especially with return values?"

`catch` only intercepts *synchronous* throws in the `try` block (or a rejected promise you `await` inside it) — it does nothing for an error thrown inside an uncaught callback or an unawaited promise. `finally` always runs, whether the block completed normally, threw, or returned — even a `return` inside `try` is deferred until `finally` finishes. If `finally` itself contains a `return`, it silently overrides whatever `try`/`catch` was about to return, which is a real footgun.

```js
function f() {
  try { return 1; }
  finally { console.log('cleanup'); } // runs before the return completes
}
```

**Say it:** "`catch` only catches synchronous throws or awaited rejections in scope; `finally` always runs for cleanup, and I never put a `return` inside `finally` — it silently swallows whatever the `try`/`catch` was returning."
**Red flag:** Wrapping a `.then()` chain in `try/catch` and expecting it to catch the promise's rejection. Without `await`, the promise rejects asynchronously, long after the synchronous `try` block already finished.

### Custom Error subclasses
**They ask:** "Why and how do you create custom Error subclasses?"

Distinguishing error *types* lets calling code branch on what actually went wrong instead of parsing message strings — `instanceof ValidationError` vs `instanceof NotFoundError` drives different HTTP status codes or retry logic. Extend the built-in `Error`, call `super(message)` so `.message`/`.stack` are set up correctly, and attach any extra context as properties.

```js
class NotFoundError extends Error {
  constructor(resource) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}
```

One Node/V8 gotcha worth knowing: `Error.captureStackTrace(this, NotFoundError)` (V8-only) excludes the constructor itself from the stack trace, keeping it focused on the actual call site.

**Say it:** "Custom Error subclasses let calling code branch on error *type*, not message text — I extend `Error`, call `super(message)`, and attach structured context like a status code as properties instead of stuffing it into the message."
**Red flag:** Branching on `error.message.includes('not found')` instead of `instanceof`. It's brittle to wording changes and doesn't survive translation or refactors — model errors as types.

### Array iteration methods: map, filter, find, and reduce
**They ask:** "Walk me through map, filter, find, and reduce — when do you reach for each?"

These four replace hand-written `for` loops for the most common array transformations, and reaching for the right one signals you think in terms of intent, not mechanics. `map` transforms every element 1:1 into a new array (same length in, same length out). `filter` keeps only elements that pass a test, producing a shorter (or equal) array. `find` returns the first element that passes a test, or `undefined` — not an array. `reduce` folds the whole array down to a single accumulated value (a sum, an object, another array) via a callback that receives the running accumulator.

```js
const orders = [{ total: 20 }, { total: 5 }, { total: 40 }];
const totals = orders.map(o => o.total);               // [20, 5, 40]
const big = orders.filter(o => o.total > 10);           // orders over 10
const first = orders.find(o => o.total > 30);           // {total: 40}
const sum = orders.reduce((acc, o) => acc + o.total, 0); // 65
```

None of them mutate the original array — each returns a new array (or value), which is why they compose cleanly in a chain.

**Say it:** "I reach for map when I'm transforming every item 1:1, filter when I'm narrowing the set, find when I want one matching item, and reduce when I'm folding the array into a single value — and none of them mutate the original array."
**Red flag:** Using `forEach` with a `push` to build a new array where `map`/`filter` would say the same thing more directly — it works, but it hides the intent and is easy to get subtly wrong (forgetting to return, mutating outer state).

### What is a callback function?
**They ask:** "What is a callback function, and why does JavaScript use them so much?"

A callback exists because JavaScript needs a way to say "run this code later, once some other work finishes" — functions are values in JS, so you just pass one in to be called when the time comes. Mechanically, a callback is nothing special: it's a plain function passed as an argument to another function, which invokes ("calls back") that function at the appropriate point — synchronously (like `array.map(fn)`) or asynchronously (like `fs.readFile(path, fn)` once the file is read, or `setTimeout(fn, 1000)` once the timer fires).

```js
function greet(name, callback) {
  callback(`Hello, ${name}`);
}
greet('Ann', (message) => console.log(message)); // "Hello, Ann"
```

Before Promises existed, callbacks were the *only* way to handle asynchronous work in JS, which is why older Node APIs (like `fs.readFile`) still take a callback as their last argument.

**Say it:** "A callback is just a function passed into another function to be run later — synchronously or async — and it's the original mechanism Node used for async work before Promises, which is why a lot of core Node APIs still take one."
**Red flag:** Confusing "callback" with "asynchronous." Callbacks can run synchronously too (`array.forEach(cb)` runs `cb` immediately, in order) — what makes something async is *when* the callback fires, not that a callback is involved.

### Function declarations vs function expressions vs arrow functions
**They ask:** "What's the difference between a function declaration, a function expression, and an arrow function?"

They differ in hoisting and in how `this` is bound, and picking the wrong one is a common source of bugs. A **function declaration** (`function foo() {}`) is hoisted with its full body, so it can be called before its line in the file, and it gets its own `this` bound at call time. A **function expression** (`const foo = function() {}`) is just a value assigned to a variable — the variable is hoisted (if `var`) but stays `undefined` until the assignment runs, so calling it early throws. An **arrow function** (`const foo = () => {}`) is always an expression, has no `this` of its own (it inherits `this` from the enclosing scope), and can't be used as a constructor.

```js
sayHi(); // works — declaration is hoisted
function sayHi() { console.log('hi'); }

sayBye(); // TypeError — sayBye is undefined at this point
var sayBye = function() { console.log('bye'); };
```

**Say it:** "Declarations hoist whole and get their own `this`; expressions don't hoist their value; arrow functions never have their own `this` — they close over the surrounding scope's, which is exactly why I use them for callbacks inside class methods or event handlers."
**Red flag:** Using an arrow function as an object method that needs `this` to refer to the object. `const obj = { name: 'x', greet: () => this.name }` doesn't work — `this` there is the outer scope, not `obj`. Use a regular method or function expression when you need the caller's `this`.

### JavaScript's primitive data types
**They ask:** "What are the primitive data types in JavaScript?"

Knowing the primitives cold matters because everything that isn't one of these seven is an object, and objects behave completely differently (see: primitive vs reference types). JavaScript has: `string`, `number`, `boolean`, `undefined`, `null`, `symbol` (ES6+, unique identifiers), and `bigint` (ES2020+, arbitrary-precision integers). All primitives are immutable and compared **by value** — two strings with the same characters are `===` equal, unlike two objects with the same shape.

```js
typeof 'hi';       // "string"
typeof 42;          // "number"
typeof true;         // "boolean"
typeof undefined;   // "undefined"
typeof null;        // "object" — a famous, unfixed JS bug
typeof Symbol();    // "symbol"
typeof 10n;          // "bigint"
```

**Say it:** "JS has seven primitives — string, number, boolean, undefined, null, symbol, and bigint — they're all immutable and compared by value, and everything else in the language is an object compared by reference."
**Red flag:** Trusting `typeof null === 'object'` as meaningful. It's a long-standing language bug, not a design choice — check for `null` explicitly with `=== null`, don't rely on `typeof`.

### Object literals: creating and accessing properties
**They ask:** "How do you create and work with a plain object in JS?"

The object literal is the fastest way to model a record — a bag of related key/value pairs — without a class or constructor, and it's the shape most JSON and function arguments take. You create one with `{}`, read/write properties with dot notation (`obj.name`) when the key is a known identifier, or bracket notation (`obj['first-name']`) when the key is dynamic or not a valid identifier. Properties can be added, overwritten, or deleted after creation — object literals are mutable by default.

```js
const user = { name: 'Ann', age: 30 };
user.age = 31;              // update
user['email'] = 'a@x.com';  // add via bracket notation
delete user.age;             // remove
const key = 'name';
console.log(user[key]);      // dynamic access -> 'Ann'
```

**Say it:** "I use dot notation for known, static keys and bracket notation when the key comes from a variable or isn't a valid identifier — and I remember object literals are mutable, so I don't assume a passed-in object is safe to mutate without checking."
**Red flag:** Trying `obj.first-name` instead of `obj['first-name']` for a key with a hyphen. Dot notation only works for valid JS identifiers — anything with a hyphen, space, or leading digit needs bracket notation.

### Synchronous vs asynchronous code
**They ask:** "What's the difference between synchronous and asynchronous code, in plain terms?"

The distinction is about *when* code runs relative to the rest of the program, and it's the first mental model you need before anything about Promises or the event loop makes sense. **Synchronous** code runs immediately, in order, and blocks the next line until it finishes — like reading a recipe top to bottom. **Asynchronous** code kicks off a task and lets the rest of the program keep running; the async task's result arrives later, on its own turn, via a callback, Promise, or `await`.

```js
console.log('1');
setTimeout(() => console.log('2 (async, runs later)'), 0);
console.log('3');
// logs: 1, 3, 2 — because setTimeout's callback is deferred, not run in place
```

**Say it:** "Synchronous code runs top to bottom and blocks; asynchronous code schedules work to happen later and lets the rest of the script keep going in the meantime — that's why `console.log('3')` above logs before the `setTimeout` callback, even with a 0ms delay."
**Red flag:** Assuming `setTimeout(fn, 0)` runs `fn` immediately. It always defers `fn` to run *after* the current synchronous code finishes, no matter how small the delay.

### What JSON.stringify and JSON.parse actually do
**They ask:** "What are JSON.stringify and JSON.parse for?"

JSON exists as a plain-text format both sides of a network call can agree on — JS objects can't travel over HTTP or into a file as-is, so you need to convert them to text and back. `JSON.stringify(value)` serializes a JS value into a JSON string; `JSON.parse(jsonString)` does the reverse, turning a JSON string back into a live JS value. This pair is how request/response bodies, `localStorage`, and config files move structured data as text.

```js
const user = { name: 'Ann', age: 30 };
const json = JSON.stringify(user);   // '{"name":"Ann","age":30}'
const back = JSON.parse(json);       // { name: 'Ann', age: 30 } — a new object
```

**Say it:** "stringify turns a JS value into JSON text for sending or storing; parse turns that text back into a JS value — it's how data survives crossing a network call or a file, since you can't send a live object over HTTP."
**Red flag:** Assuming `JSON.parse(JSON.stringify(obj))` is a safe universal deep clone. It silently drops functions, `undefined`, and `Symbol` values, and turns `Date`s into strings — fine for plain data, wrong for anything with those types.
