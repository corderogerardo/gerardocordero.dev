# JavaScript (ES5) — Andersen matrix, junior→middle levels

## Interview questions

### Control flow and hoisting
**They ask:** "Walk me through JavaScript's control-flow constructs, and explain what hoisting does to this code."

Control flow is where subtle bugs hide, so knowing *when* code runs matters as much as knowing the syntax. The mechanics are standard: `if/else` and `switch` for branching, `for`/`while`/`do…while` for iteration, `&&`/`||`/`!` for logical composition, and the ternary `cond ? a : b` as an expression-level `if`. Two things trip juniors. First, `switch` uses strict `===` and falls through without `break`. Second, `==` coerces (`0 == ""` is `true`) while `===` compares type-and-value — always reach for `===`.

Hoisting is the real interview target: `var` declarations and function declarations are moved to the top of their scope, so `console.log(x); var x = 5;` logs `undefined`, not a crash. Function declarations hoist fully (callable before their line); function *expressions* don't. `alert`/`prompt`/`confirm` are blocking browser dialogs — fine to name, never for production.

**Say it:** "`===` never coerces, and hoisting means `var` and function declarations are visible before their line — which is exactly why I use `let`/`const` and function expressions to avoid the surprise."
**Red flag:** Saying `==` and `===` are "basically the same." They aren't — `==` runs the coercion algorithm, and that's a classic source of `"0" == false` bugs.

### Object properties and creation
**They ask:** "What are the different ways to create an object in JavaScript, and how do you read, add, and remove its properties?"

Objects are the workhorse of JS, so fluency with them is table stakes. You create them four common ways: an object literal `{}` (99% of the time), a constructor `new Foo()`, `Object.create(proto)` when you want to control the prototype, and `new Object()` (rare, avoid). The literal wins for readability.

Access is dot or bracket: `obj.name` when the key is a known identifier, `obj["na" + "me"]` when it's dynamic or not a valid identifier. Adding is just assignment (`obj.age = 30`), deleting is the `delete` operator (`delete obj.age`) — which removes the property outright, not just sets it to `undefined`. To enumerate keys, `for (const k in obj)` walks own *and* inherited enumerable keys, so guard with `obj.hasOwnProperty(k)` or prefer `Object.keys(obj)`, which returns only own enumerable keys as an array.

**Say it:** "I reach for `Object.keys` over `for…in` because `for…in` also walks the prototype chain — `Object.keys` gives me just the object's own keys and an array I can map over."
**Red flag:** Using `delete` to "empty" a property expecting it to be `undefined`-equivalent. `delete` removes the key entirely, which changes `in` checks and `Object.keys` length — set to `undefined` if that's what you meant.

### Why garbage collection exists
**They ask:** "What is a garbage collector and why does a language need one?"

Garbage collection exists so you write features instead of manually tracking every allocation — it removes an entire class of bugs (use-after-free, double-free, dangling pointers) that languages like C force you to manage by hand. That safety is the *why*; the mechanics are secondary.

A garbage collector automatically reclaims memory that the program can no longer reach. In JS, every object you create lives on the heap; when nothing references it anymore, the collector is free to reclaim that space so the process doesn't grow unbounded. Without it, a long-running app — say a mobile screen that mounts and unmounts a hundred times — would leak on every cycle and eventually crash. The trade-off is that collection is non-deterministic: you don't control *when* it runs, so you can't rely on it for timely cleanup of non-memory resources (sockets, listeners) — those you release explicitly.

**Say it:** "GC frees me from manual memory management and kills use-after-free bugs — the cost is I don't control when it runs, so timely resource cleanup is still my job."
**Red flag:** Describing GC as "it deletes variables you're done with." It reclaims *unreachable* objects — a variable still in scope but pointing at nothing you use is a leak GC can't help with.

### The data types
**They ask:** "List JavaScript's data types and tell me which are primitives."

Knowing the type system prevents whole categories of coercion and equality bugs, which is why it's the first thing interviewers probe. ES5 has five primitives plus objects: `string`, `number`, `boolean`, `null`, and `undefined` — with `object` (including arrays and functions) as the non-primitive. (ES6 later added `symbol` and `bigint`; mention them to show currency, but the ES5 core is those six.)

Primitives are immutable and compared by value — `"a" === "a"` is `true`. Objects are mutable and compared by reference — `{} === {}` is `false` because they're two different allocations. Two footguns worth naming: `typeof null` returns `"object"` (a historic bug that's now permanent), and `NaN` is a `number` that isn't equal to itself (`NaN === NaN` is `false`), which is why `Number.isNaN` exists.

**Say it:** "Five primitives — string, number, boolean, null, undefined — plus objects; primitives compare by value, objects by reference, and that reference-vs-value distinction is behind most equality surprises."
**Red flag:** Calling arrays and functions their own "types." Under the hood `typeof [] === "object"` and `typeof fn === "function"` — arrays are objects, and treating them as a separate primitive type leads to wrong assumptions.

### Working with Date
**They ask:** "How do you construct a Date and read or set its year, month, and day?"

Date handling is a notorious source of off-by-one and timezone bugs, so the goal is knowing the sharp edges before they bite. You create one with `new Date()` (now), `new Date(2024, 0, 15)` (year, month, day), or `new Date(timestamp)`. The trap that catches everyone: **months are zero-indexed** — January is `0`, December is `11` — while days of the month are one-indexed. So `new Date(2024, 0, 15)` is January 15th.

Reading uses getters: `getFullYear()`, `getMonth()` (0–11), `getDate()` (day of month, 1–31), `getDay()` (day of week, 0=Sunday). Setting mirrors them: `setFullYear`, `setMonth`, `setDate`. Always use `getFullYear()`, never the deprecated `getYear()` which returns years-since-1900. All these operate in local time; the `getUTC*`/`setUTC*` variants work in UTC.

**Say it:** "The one thing I never forget with Date is that months are zero-indexed but days aren't — `new Date(2024, 0, 1)` is January 1st, and mixing that up is the classic date bug."
**Red flag:** Assuming `getMonth()` returns 1–12. It's 0–11 — display code that does `getMonth()` without `+ 1` ships "month 0" to users.

### Cloning with JSON
**They ask:** "How would you deep-clone a plain object using JSON, and when does that break?"

The reason this comes up is that assignment copies a *reference*, not the object — so `const b = a` means mutating `b.x` also mutates `a.x`. `JSON.parse(JSON.stringify(obj))` is the quick deep clone: stringify serializes the whole nested structure to a string, parse rebuilds a fresh independent tree. It's one line and needs no dependency, which is why it's the go-to for cloning config-shaped data.

But name its limits or you'll get burned: it silently drops `undefined` values, functions, and symbols; it converts `Date` objects to strings; it throws on circular references; and it can't carry `Map`/`Set`. So it's perfect for JSON-safe data (strings, numbers, booleans, arrays, plain nested objects) and wrong for anything richer — there, use `structuredClone()` (now widely available) or a library.

**Say it:** "`JSON.parse(JSON.stringify(x))` is my quick deep clone for JSON-safe data — but it drops functions and undefined and turns Dates into strings, so for richer objects I reach for `structuredClone`."
**Red flag:** Presenting the JSON trick as a universal deep clone. It loses Dates, functions, and undefined — say `structuredClone` for the general case and JSON only for plain data.

### Function types and IIFEs
**They ask:** "What kinds of functions does JavaScript have, and what problem does an IIFE solve?"

Functions are first-class values in JS — they can be passed, returned, and stored — which is the foundation for callbacks, higher-order functions, and the whole functional style. The forms: a *declaration* `function foo() {}` (hoisted, callable before its line), a *function expression* `const foo = function () {}` (not hoisted), a named function expression, and arrow functions (ES6). Declarations vs expressions is the interview point — hoisting differs.

An IIFE — Immediately-Invoked Function Expression — is `(function () { … })()`: define and call in one shot. Before ES6 block scoping (`let`/`const`), this was *the* way to create a private scope and avoid polluting the global namespace — libraries wrapped their whole code in one so their internals wouldn't leak onto `window`. Today `let`/`const` and modules cover most of that need, but you'll still see IIFEs in older code and bundler output.

**Say it:** "An IIFE runs a function the moment it's defined to create a private scope — it was the pre-ES6 module pattern for keeping internals off the global object."
**Red flag:** Not knowing why IIFEs existed and calling them obsolete. The pattern is dated, but the *reason* — scope isolation before block scoping — is exactly what an interviewer wants you to explain.

### `this` and binding
**They ask:** "What determines the value of `this` inside a function, and how do you control it?"

`this` is the most misunderstood keyword in JS, and getting it wrong produces `undefined is not a function` at runtime — so seniors explain it by *call site*, not by where the function is defined. In a regular function, `this` is set by *how the function is called*: called as `obj.method()`, `this` is `obj`; called bare `fn()`, `this` is the global object (`window`) in sloppy mode or `undefined` in strict mode; called with `new`, `this` is the fresh instance.

You bind it three ways: `call(thisArg, ...args)` and `apply(thisArg, argsArray)` invoke immediately with a chosen `this`; `bind(thisArg)` returns a *new* function permanently locked to that `this` — the classic fix for passing a method as a callback (`onClick={this.handle.bind(this)}`). Arrow functions (ES6) sidestep all of this by capturing `this` lexically from the enclosing scope.

**Say it:** "`this` is decided by the call site, not the definition — `obj.fn()` binds to `obj`, a bare call binds to global or undefined, and I use `bind` or an arrow function to lock it when passing a method as a callback."
**Red flag:** Saying `this` refers to the function itself or where it's declared. It's the *call site* — the same function has different `this` depending on how it's invoked.

### Prototypes and the prototype chain
**They ask:** "Explain the difference between `__proto__` and `prototype`, and how the prototype chain resolves a property."

Prototypes are JavaScript's actual inheritance model — everything else (`class`, `new`) is sugar over them — so understanding the chain is what separates people who *use* JS from people who understand it. When you read `obj.foo`, the engine checks the object's own properties; if not found, it follows the object's internal link to its prototype, then that prototype's prototype, up the chain until it hits `null`. That lookup chain is how method sharing works: a thousand array instances share one `Array.prototype.map`.

The two names confuse everyone. `prototype` is a property *on constructor functions* — it's the object that will become the prototype of instances the constructor creates. `__proto__` (standardized accessor; `Object.getPrototypeOf`/`setPrototypeOf` are the clean API) is the property *on every object* pointing at its actual prototype. So `new Foo()` sets the instance's `__proto__` to `Foo.prototype`. Create with a chosen prototype via `Object.create(proto)`.

**Say it:** "`prototype` lives on the constructor and becomes the instance's prototype; `__proto__` lives on the instance and points back at it — property lookup walks that chain until it finds the key or hits null."
**Red flag:** Using `__proto__` and `prototype` interchangeably. One is on constructors, one is on instances — conflating them means you can't reason about what `new` actually wires together.

### Blocking code and the single thread
**They ask:** "JavaScript is single-threaded — so what happens when a piece of code takes a long time to run?"

This matters because in a UI, blocking code freezes the screen — taps stop registering, animations stall — which is the difference between an app that feels fast and one that feels broken. JavaScript runs on a single thread with one call stack, so it does exactly one thing at a time. A long synchronous loop (parsing a huge array, a `while` that runs for 500ms) holds the thread and nothing else — no clicks, no rendering, no timers — can run until it finishes.

The escape is not more threads; it's not blocking. Asynchronous work (network, timers, I/O) is handed off and its callback is queued to run later, keeping the thread free. That's why you break heavy work into chunks, move it off the main thread (in RN, a worklet or native module), or make it async. "Single-threaded" is *why* a blocking `for` loop is a bug, not just slow.

**Say it:** "One thread, one call stack — so any long synchronous task blocks everything, including rendering; the fix isn't threads, it's not blocking: chunk the work or make it async."
**Red flag:** Claiming JS is multithreaded because of async. The *engine* runs your JS on one thread — async just defers callbacks; it doesn't run them in parallel with your code.

### Timers: setTimeout and setInterval
**They ask:** "What do `setTimeout` and `setInterval` do, why do you need them, and how do you stop them?"

These are your only built-in way to schedule work for *later* on a single-threaded runtime — you need them for anything time-based: debouncing input, polling, deferring work so the UI can paint first. `setTimeout(fn, ms)` runs `fn` once after *at least* `ms` milliseconds; `setInterval(fn, ms)` runs it repeatedly every `ms`. The key word is "at least" — the delay is a floor, not a guarantee, because the callback only fires when the call stack is clear.

Both return an id you must keep to cancel: `clearTimeout(id)` and `clearInterval(id)`. Forgetting to clear is a real leak — an interval on a screen that unmounts keeps firing and keeps its closure alive. In React that's the canonical `useEffect` cleanup: start the timer, return a function that clears it.

**Say it:** "The delay is a minimum, not a guarantee — the callback waits for the stack to clear — and I always keep the returned id so I can `clearInterval` on cleanup and not leak a firing timer."
**Red flag:** Saying `setTimeout(fn, 100)` runs "exactly 100ms later." It runs *no sooner than* 100ms later — if the thread is busy, it waits, which is why timers aren't reliable for precise timing.

### Regular expression basics
**They ask:** "How do you create a regular expression, what are its two main methods, and how do you make a search global and case-insensitive?"

Regex is the fastest way to validate and extract text patterns — knowing the basics saves you from writing brittle hand-rolled string parsing. You create one two ways: a literal `/pattern/flags` (compiled once, preferred when the pattern is fixed) or the constructor `new RegExp("pattern", "flags")` (use when the pattern is built dynamically from a variable). The two core `RegExp` methods are `test(str)`, which returns a boolean, and `exec(str)`, which returns match details or `null`.

Character classes are the building blocks: `\d` (digit), `\w` (word char), `\s` (whitespace), `.` (any char), and custom sets like `[a-z]`. Flags tune the search: `g` for global (find all matches, not just the first), `i` for case-insensitive. So `/error/gi` finds every "error", "Error", or "ERROR" in a string.

**Say it:** "I use a `/…/` literal for fixed patterns and `new RegExp` when I'm building one from a variable; `test` gives me a boolean, `exec` gives me the match, and `g` plus `i` make it global and case-insensitive."
**Red flag:** Reaching for the `RegExp` constructor with a hardcoded pattern. Use the literal for fixed patterns — the constructor is for when the pattern comes from a variable, and it needs doubled backslashes.

### Function constructor, arguments, recursion
**They ask:** "What is the `arguments` object, why is it 'array-like', and can you write a recursive function?"

These three show whether you understand functions beyond calling them. A *constructor function* is a regular function invoked with `new` to build objects — capitalized by convention (`function User(name){ this.name = name }`), it's the pre-`class` way to stamp out instances sharing a prototype.

Inside any non-arrow function, `arguments` holds every argument passed, even ones the signature didn't name. It's "array-like" — it has `length` and index access (`arguments[0]`) but *not* array methods like `map` or `filter`, because it's a plain object, not a real array. To use array methods you convert it: `Array.prototype.slice.call(arguments)` in ES5, or `Array.from`/rest params `(...args)` in modern JS.

Recursion is a function calling itself until a base case stops it — the base case is non-negotiable, or you overflow the stack. Classic: `function factorial(n){ return n <= 1 ? 1 : n * factorial(n - 1) }`.

**Say it:** "`arguments` is array-like — indexes and length but no `map` — so I spread it into a real array; and every recursion needs a base case or it blows the stack."
**Red flag:** Calling `arguments.map(...)` directly. It's array-*like*, not an array — that throws; convert it first or use rest parameters.

### Closures and lexical scope
**They ask:** "Define a closure, and give a concrete example of why they're useful."

Closures are the mechanism behind data privacy, function factories, and every callback that "remembers" state — they're arguably the single most important concept for writing non-trivial JS, and React hooks are built directly on them. A closure is a function bundled together with the lexical environment it was created in: it keeps access to variables from its outer scope even after that outer function has returned.

The supporting vocabulary: the *lexical environment* is the set of variables in scope at the point a function is *written* (not called); *scope* is where a variable is accessible; *variable shadowing* is an inner variable hiding an outer one of the same name. Closures exploit lexical scope to capture and hold outer variables. Concrete use — a counter with private state:

```js
function makeCounter() {
  let count = 0;                 // private, not reachable from outside
  return () => ++count;          // closes over count
}
const next = makeCounter();
next(); // 1
next(); // 2
```

`count` survives because the returned function still references it.

**Say it:** "A closure is a function plus the scope it was born in — it keeps its outer variables alive after the outer function returns, which is how you get private state and how hooks remember values between renders."
**Red flag:** Defining a closure as just "a function inside a function." Nesting isn't the point — *capturing and retaining outer scope after that scope returns* is what makes it a closure.

### try/catch and throwing errors
**They ask:** "How do you handle exceptions in JavaScript, and when should you throw your own?"

Error handling is what keeps one failure from taking down the whole app, so the goal is catching what you can recover from and letting the rest fail loudly. `try { … } catch (err) { … }` runs the risky code and, if anything *thrown* inside it bubbles up, control jumps to `catch` with the error. You raise your own with `throw` — and you should throw an `Error` object (`throw new Error("Bad input")`), not a string, because `Error` carries a `message`, a `name`, and a `stack` trace that a bare string doesn't.

The senior nuance: `try/catch` only catches *synchronous* throws. A rejected Promise or an error inside a `setTimeout` callback won't be caught by a surrounding `try/catch` — you need `.catch()` or `try/catch` inside an `async/await`. And don't catch errors you can't actually handle; swallowing them silently hides bugs.

**Say it:** "I throw `Error` objects, not strings, so I get a stack and a name — and I remember `try/catch` only catches synchronous throws, so async failures need their own handling."
**Red flag:** An empty `catch {}` that swallows the error. Silent catches hide real bugs — catch only what you can recover from, otherwise log and rethrow.

### Macrotasks and microtasks
**They ask:** "Explain the event loop, and predict the output order when a `setTimeout(…, 0)` and a resolved Promise are both queued."

The event loop is the model that explains *why* async code runs in the order it does — get it wrong and you'll write race conditions you can't debug. JavaScript runs synchronous code on one call stack; when the stack is empty, the event loop pulls queued callbacks in to run. The priority between two *kinds* of work is the whole interview: **microtasks** (Promise callbacks, `queueMicrotask`) and **macrotasks** (`setTimeout`, `setInterval`, I/O). The portable guarantee is that the microtask queue drains completely after each macrotask, before the next one runs — hosts actually have several task sources and their own phases (Node's event-loop phases, the browser's render steps), so "two queues" is the mental model, not the literal implementation.

The rule: after each macrotask (and after the initial sync code), the engine drains the *entire* microtask queue before touching the next macrotask. So `setTimeout(fn, 0)` does **not** run immediately — the `0` means "as soon as possible," but every pending microtask jumps ahead of it. Trace:

```js
console.log('A');
setTimeout(() => console.log('B'), 0);   // macrotask
Promise.resolve().then(() => console.log('C')); // microtask
console.log('D');
// A, D, C, B
```

Sync first (A, D), then microtasks (C), then macrotasks (B).

**Say it:** "Microtasks — Promise callbacks — drain completely before the next macrotask like `setTimeout`, so a resolved Promise always runs before a `setTimeout(…, 0)` queued alongside it."
**Red flag:** Saying `setTimeout(fn, 0)` runs "right away" or before Promise callbacks. It's a macrotask — the entire microtask queue empties first, so Promises win.

### var, implicit globals, and strict mode
**They ask:** "What's wrong with `var`, what happens if you assign to a variable without declaring it, and what does `'use strict'` change?"

This is the "do you write safe JS" question. `var` is function-scoped and hoisted, so it leaks out of blocks — a `var` inside an `if` is visible to the whole function, and it silently redeclares. That's exactly why `let`/`const` (block-scoped, temporal-dead-zone) replaced it; naming that is the expected senior answer.

Assigning without declaring — `x = 5` with no `var`/`let`/`const` — creates an *implicit global*: in sloppy mode it quietly attaches `x` to the global object, a leak that causes spooky action-at-a-distance bugs across files. `'use strict'` (at the top of a file or function) opts into strict mode, which turns that specific mistake into a `ReferenceError` instead of a silent global, makes bare-call `this` `undefined` instead of `window`, and forbids other footguns like duplicate parameter names. ES6 modules are strict by default.

**Say it:** "`var` is function-scoped and hoisted so it leaks out of blocks, and an undeclared assignment creates a silent global — strict mode turns that into a ReferenceError, which is why I default to `const`/`let` in strict modules."
**Red flag:** Not knowing an undeclared assignment becomes a global. In sloppy mode `x = 5` pollutes `window` silently — strict mode is what makes it throw, and that's the whole reason to use it.

### Object internals: descriptors and conversion
**They ask:** "What happens when an object is used where a primitive is expected, and how do property descriptors and getters/setters give you control?"

This is where you show you understand objects below the surface. When an object meets a primitive context (`` `${obj}` ``, `obj + 1`, `alert(obj)`), JS runs a *to-primitive* conversion: it calls `Symbol.toPrimitive` if present, otherwise `valueOf()` then `toString()` (order depends on the hint). That's why a bare object stringifies to `[object Object]` unless you override `toString`.

Every property has a *descriptor* — `value`, plus `writable`, `enumerable`, `configurable` — inspectable via `Object.getOwnPropertyDescriptor` and settable via `Object.defineProperty`. That's how you make a property read-only or hidden from `for…in`. *Getters/setters* (`get`/`set`) are accessor properties: reading or writing runs a function, which is how you compute derived values or validate on assignment.

Critically, objects are held by *reference*: `const b = a` copies the pointer, so `b.x = 1` mutates `a`. A shallow copy is `Object.assign({}, a)` or spread; nested objects still share references, hence deep clone for full independence.

**Say it:** "Objects convert to primitives via `valueOf`/`toString`, descriptors let me make properties read-only or non-enumerable, and assignment copies the reference — so `const b = a` still points at the same object."
**Red flag:** Thinking `const b = a` copies the object. It copies the *reference* — mutating `b` mutates `a`; you need a shallow or deep copy for independence.

### Mark-and-sweep and reachability
**They ask:** "How does JavaScript's garbage collector actually decide what to free, and how can you still leak memory in a GC'd language?"

The practical payoff is that leaks in JS are *reachability* bugs, not missing frees — so once you know how the collector thinks, you know exactly what causes and fixes a leak. The algorithm is **mark-and-sweep**: starting from *roots* (the global object, the current call stack), the collector marks everything reachable by following references, then sweeps — reclaims — everything it didn't mark. Reference counting was the old approach and it can't handle cycles; mark-and-sweep can, because an unreachable cycle is simply never marked.

So "how do I mark a pointer for collection?" — you don't mark it *for* collection, you make it *unreachable*: drop every reference to it (`obj = null`, remove it from the array/`Map` holding it, remove the event listener). As long as one reachable reference remains, the object is marked live and survives. That's why leaks happen: a forgotten listener, an ever-growing global cache, or a closure holding a big object keeps it reachable.

**Say it:** "Mark-and-sweep marks everything reachable from the roots and sweeps the rest — so I don't free objects, I make them unreachable by dropping references, and a leak is just a reference I forgot to drop."
**Red flag:** Saying you free an object by "marking it for GC." You make it *unreachable* — the collector marks the *live* ones; a lingering reference (listener, cache entry) is what keeps garbage alive.

### Type conversion and typeof
**They ask:** "Explain implicit vs explicit type conversion, and what `typeof` can and can't tell you."

Coercion is behind more JS bugs than almost anything else, so a senior treats it as something to control, not stumble into. Conversion is *explicit* when you ask for it (`Number("42")`, `String(x)`, `Boolean(x)`) and *implicit* when the engine does it for you: `"5" - 1` is `4` (string→number), `"5" + 1` is `"51"` (number→string, because `+` prefers concatenation), and `if (value)` coerces to boolean. Knowing the falsy set — `false, 0, "", null, undefined, NaN` — lets you predict every truthiness check.

`typeof` is your runtime type probe: it returns `"string"`, `"number"`, `"boolean"`, `"undefined"`, `"function"`, `"object"`, `"symbol"`. Its two famous holes: `typeof null` is `"object"` (a permanent bug), and it can't distinguish arrays or `null` from plain objects — for arrays use `Array.isArray`, for null use `value === null`.

**Say it:** "`+` with a string concatenates while `-` forces numbers, so `'5' + 1` is `'51'` but `'5' - 1` is `4` — and `typeof null` is `'object'`, so I use `Array.isArray` and explicit null checks instead of trusting `typeof` alone."
**Red flag:** Using `typeof x === "object"` to check for an array or to rule out null. It's `"object"` for arrays *and* for `null` — you'll pass both through; use `Array.isArray` and `=== null`.

### Parsing dates
**They ask:** "How do you parse a date string into a Date, and what makes date parsing risky?"

Date parsing is where timezone bugs are born, so the senior instinct is to distrust loose parsing and pin down the format. You parse with `new Date(str)` or `Date.parse(str)` (returns a timestamp). The only format the spec *guarantees* across engines is ISO 8601: `"2024-01-15"` or `"2024-01-15T10:30:00Z"`. Anything else — `"01/15/2024"`, `"Jan 15 2024"` — is implementation-dependent, so it may parse differently (or return `Invalid Date`) across browsers and Node versions.

The subtle trap: a date-only ISO string like `"2024-01-15"` is parsed as **UTC midnight**, while a date-time string *without* a zone is parsed as *local* time. So the same-looking string can land on different calendar days depending on the user's timezone. Always check `isNaN(date.getTime())` to detect `Invalid Date`, and for anything nontrivial parse with an explicit format (a library like date-fns) rather than trusting the built-in parser.

**Say it:** "I only trust `new Date` with ISO 8601 strings — everything else is engine-dependent — and I remember a date-only string parses as UTC while a zone-less date-time parses as local, which silently shifts the day."
**Red flag:** Passing `"MM/DD/YYYY"` or other locale formats to `new Date` and assuming consistent results. Non-ISO parsing is implementation-defined — stick to ISO or parse explicitly.

### Serializing objects to JSON
**They ask:** "How does `JSON.stringify` convert an object, and what does it silently drop or transform?"

Serialization is the boundary between your in-memory objects and anything that leaves the process — an API body, `AsyncStorage`, a log — so knowing what survives the trip prevents data-loss bugs. `JSON.stringify(obj)` walks the object and produces a JSON string; the optional second arg is a *replacer* (filter/transform keys) and the third is *space* for pretty-printing (`JSON.stringify(obj, null, 2)`).

What it silently changes matters most: `undefined`, functions, and symbols are *omitted* from objects (and become `null` inside arrays); `Date` objects become ISO strings (parsing back gives you a string, not a Date); `NaN` and `Infinity` serialize to `null`; and a circular reference *throws*. You can customize output by giving an object a `toJSON()` method — `stringify` calls it and serializes the result. On the way back, `JSON.parse` has a *reviver* callback to rehydrate values (e.g. turn date strings back into `Date`s).

**Say it:** "`JSON.stringify` drops undefined and functions, turns Dates into strings, and throws on cycles — so I use a `toJSON` method or a replacer when I need control over what crosses the wire."
**Red flag:** Assuming a round-trip through JSON preserves the object faithfully. Dates come back as strings and `undefined`/functions vanish — if that data matters, handle it with `toJSON`/reviver.

### Regex quantifiers, assertions, and escaping
**They ask:** "Explain quantifiers and anchors in a regex, and why escaping matters."

Once past character classes, quantifiers and assertions are what make a regex actually match real-world input precisely — and escaping is what keeps it correct and safe. *Quantifiers* control repetition: `*` (zero or more), `+` (one or more), `?` (zero or one), and `{n,m}` (between n and m). By default they're *greedy* — they grab as much as possible; append `?` (`.*?`) to make them *lazy* and match as little as possible, which is the fix for a regex that overshoots.

*Assertions* match positions, not characters: `^` anchors to start, `$` to end, `\b` to a word boundary. So `/^\d{3}-\d{4}$/` matches a full string of exactly that phone shape and nothing else. *Escaping* with `\` neutralizes a metacharacter's special meaning — to match a literal dot you write `\.`, since a bare `.` means "any character." Forgetting to escape user input built into a `RegExp` is both a correctness bug and a ReDoS risk.

**Say it:** "Quantifiers are greedy by default so I add `?` to make them lazy, `^`/`$`/`\b` anchor position rather than match characters, and I escape metacharacters like `\.` — especially any user input I splice into a pattern."
**Red flag:** Writing `.` expecting a literal dot, or leaving quantifiers greedy when you needed the shortest match. A bare `.` is "any character," and greedy `.*` overshoots — escape and use lazy `.*?` deliberately.

### Prototypal vs classical inheritance
**They ask:** "How does prototypal inheritance differ from the classical OOP inheritance in languages like Java, and how do you build it with constructor functions?"

The reason this matters is that JS only *looks* like classical OOP through the `class` keyword — underneath it's prototypal, and confusing the two leads to wrong mental models about where methods live and how instances share them. In classical inheritance, a *class* is a blueprint and instances are copies stamped from it; the class hierarchy is fixed at definition. In *prototypal* inheritance there are no classes underneath — objects link directly to other objects (their prototype), and lookup walks that live chain at runtime. Methods aren't copied into each instance; they live once on the shared prototype and every instance delegates to them.

Functional prototyping with a constructor: define the constructor for own state, hang shared methods on its `prototype`, and wire the chain.

```js
function Animal(name) { this.name = name; }
Animal.prototype.speak = function () { return this.name + ' makes a sound'; };

function Dog(name) { Animal.call(this, name); }        // inherit own props
Dog.prototype = Object.create(Animal.prototype);       // link the chain
Dog.prototype.constructor = Dog;
```

**Say it:** "JS inheritance is delegation, not copying — instances link to a shared prototype and lookup walks that chain at runtime, whereas classical OOP stamps each instance from a fixed class blueprint."
**Red flag:** Describing JS `class` as true classical inheritance. `class` is syntax sugar over prototypes — methods still live on one shared prototype and instances delegate, they aren't copied per instance.

### finally and the Error object
**They ask:** "What is the `finally` block for, and what properties does an Error object carry?"

`finally` exists to guarantee cleanup runs no matter how the `try` exits — success, thrown error, or even a `return` — which is what keeps you from leaking resources on the error path. It runs after `try`/`catch` unconditionally, so it's where you close a connection, hide a spinner, or release a lock. The senior detail: `finally` runs *even if* `try` or `catch` returns or rethrows — its cleanup still executes before control actually leaves.

The `Error` object is what you catch, and it carries three useful properties: `name` (the error type, e.g. `"TypeError"`), `message` (the human-readable description you passed to `new Error(...)`), and `stack` (a trace of where it was thrown — commonly available across engines but non-standard, not guaranteed by the language spec). Built-in subclasses — `TypeError`, `RangeError`, `SyntaxError` — let you branch on `err.name` or `err instanceof TypeError`, and you can extend `Error` for custom domain errors.

**Say it:** "`finally` always runs — even on a return or rethrow — so it's my cleanup guarantee; and I catch `Error` objects for their `name`, `message`, and `stack`, branching on `instanceof` for typed handling."
**Red flag:** Putting cleanup only in `try` or `catch`. If `try` throws, the cleanup in `try` never runs, and duplicating it in both branches is fragile — `finally` is the one place that always executes.
