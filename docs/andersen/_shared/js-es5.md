# JavaScript (ES5) — Andersen foundations

### Control flow and hoisting
**They ask:** "What gets logged if you read a `var` before its declaration, and how does `==` differ from `===`?"

The senior point is that JS *hoists* declarations to the top of their scope before running any line, so control flow isn't purely top-to-bottom — that's the source of a whole class of "undefined but no error" bugs. A `var` declaration is hoisted and initialised to `undefined`; the assignment stays in place. So reading it early gives `undefined`, not a ReferenceError.

Comparison is the other trap. `===` compares type and value with no coercion; `==` coerces first, which produces surprises like `0 == ''` and `null == undefined` being true. Loops (`for`, `while`), `switch` (with fall-through unless you `break`), and logical `&&`/`||` (which short-circuit and return an operand, not a boolean) round out the basics.

```js
console.log(x); // undefined — hoisted
var x = 5;
0 == '';   // true  (coercion)
0 === '';  // false (strict)
```

**Say it:** "I default to `===` and `switch` with explicit breaks, because coercion and fall-through are where silent control-flow bugs hide."
**Red flag:** Saying hoisting "moves your code up." Only the declaration is hoisted; the assignment runs in place, which is exactly why the early read is `undefined`.

### Working with objects
**They ask:** "How many ways can you create an object, and how do you iterate its keys?"

Objects are the core data structure, so knowing the creation paths signals how you think about shape and reuse. Literals (`{}`) for one-offs, `Object.create(proto)` when you want a specific prototype, and constructor functions with `new` when you need many instances sharing methods. You set and read properties with dot or bracket notation, delete with `delete obj.key`, and list own keys with `Object.keys(obj)`.

`for...in` iterates enumerable properties *including inherited ones* — the senior move is guarding with `hasOwnProperty` so you don't walk the prototype chain by accident.

```js
var o = { a: 1 };
o.b = 2; delete o.a;
Object.keys(o);          // ['b']
for (var k in o) {
  if (o.hasOwnProperty(k)) { /* own only */ }
}
```

**Say it:** "I reach for `Object.keys` when I want own enumerable keys, and guard `for...in` with `hasOwnProperty` so inherited props don't leak in."
**Red flag:** Using bare `for...in` on plain data. If anything extended `Object.prototype`, you iterate over it too — `Object.keys` sidesteps that entirely.

### Why a garbage collector
**They ask:** "What is the garbage collector and why does JS need one?"

The why is memory safety without manual bookkeeping: JS has no `free()`, so the engine must decide on its own when memory is no longer needed and reclaim it. Without that, every closure and DOM reference would be a potential leak the developer had to track by hand.

Mechanically, the collector's job is to find values that are no longer *reachable* from any root (the global object, the current call stack, active closures) and release them. You don't call it; it runs on the engine's schedule. Your influence is indirect — you keep memory alive by keeping references, and you release it by dropping them.

```js
var user = { name: 'Ana' };
user = null; // the old object is now unreachable → eligible for collection
```

**Say it:** "The GC reclaims values that are no longer reachable from a root, so I manage memory by managing references, not by freeing manually."
**Red flag:** Saying the GC frees memory "when a variable goes out of scope." It frees when a value becomes *unreachable* — a closure or a global can keep an out-of-scope value alive indefinitely.

### The data types
**They ask:** "List JavaScript's data types."

Knowing the type system cold is what lets you reason about coercion and `typeof` later, so it's foundational, not trivia. ES5 has six primitive-ish buckets plus objects: `number` (one type for ints and floats, IEEE-754 doubles), `string`, `boolean`, `undefined`, `null`, and everything else is `object` — which includes arrays, functions, and dates.

The senior framing: primitives are immutable and compared by value; objects are mutable and compared by reference. `null` is the odd one — it's a primitive but `typeof null` returns `"object"`, a historical bug that's now permanent.

```js
typeof 42;        // 'number'
typeof 'hi';      // 'string'
typeof undefined; // 'undefined'
typeof null;      // 'object'  (legacy quirk)
typeof function(){}; // 'function'
```

**Say it:** "Six primitives — number, string, boolean, undefined, null, plus objects — and primitives are immutable and compared by value while objects are by reference."
**Red flag:** Calling `null` an object because `typeof` says so. It's a primitive; the `typeof` result is a known legacy bug, and saying that is the seniority signal.

### Reading and setting dates
**They ask:** "How do you get and set the year, month, and day on a Date?"

The one fact that saves you in an interview: months are zero-indexed. January is `0`, December is `11` — the most common off-by-one in date code. Days of the *month* are 1-indexed via `getDate`, but the *weekday* from `getDay` is 0 (Sunday) to 6.

You read with `getFullYear`, `getMonth`, `getDate`, and write with the matching `setFullYear`, `setMonth`, `setDate`. Setters also roll over: setting the date to 32 rolls into the next month, which is handy for date arithmetic.

```js
var d = new Date(2026, 0, 15); // Jan 15, 2026 (month 0!)
d.getMonth();     // 0
d.setMonth(11);   // now December
d.setDate(d.getDate() + 40); // rolls into next month automatically
```

**Say it:** "Months are zero-based, so `getMonth` for January is 0 — I always account for that when formatting or parsing by hand."
**Red flag:** Using `getYear`. It's deprecated and returns year-minus-1900; always use `getFullYear`.

### Cloning with JSON
**They ask:** "How do you clone an object with JSON methods, and when does it break?"

The quick deep-clone trick is `JSON.parse(JSON.stringify(obj))` — it serialises to a string and rebuilds a fresh tree, so nested objects are copied too, not shared. That's why people reach for it over a shallow spread when they need independence at every level.

But the senior answer names the failure modes: it silently drops `undefined`, functions, and symbols; converts `Date` objects to strings; throws on circular references; and loses `Infinity`/`NaN` to `null`. So it's fine for plain JSON-shaped data and wrong for anything richer.

```js
var copy = JSON.parse(JSON.stringify(original));
// but: new Date() → string, undefined/functions dropped, cycles throw
```

**Say it:** "`JSON.parse(JSON.stringify(x))` is a quick deep clone for pure data, but it drops functions and undefined and mangles Dates, so I only use it when the object is JSON-safe."
**Red flag:** Recommending it as a universal deep clone. A Date, a Map, or a circular reference makes it lossy or throwing — call that out and it reads as experience.

### Function forms and IIFEs
**They ask:** "What are the ways to define a function, and what's an IIFE for?"

Function *declarations* are hoisted whole, so you can call them before their line; function *expressions* (assigning a function to a variable) are not — only the variable is hoisted. That difference drives where you can put them. There are also named vs anonymous expressions, the latter common as callbacks.

An IIFE — Immediately-Invoked Function Expression — defines and calls a function in one go, mainly to create a private scope. Before block scoping and modules, that was the standard way to avoid polluting the global namespace.

```js
foo();                       // works — declaration hoisted
function foo() {}
var bar = function () {};    // expression — not callable before this line
(function () { /* private scope */ })(); // IIFE
```

**Say it:** "Declarations are fully hoisted; expressions aren't — and an IIFE gives me a private scope in one expression, which is how we isolated modules before ES modules existed."
**Red flag:** Claiming function expressions are hoisted like declarations. Only the variable binding is hoisted (as `undefined`); calling it early throws.

### The value of this
**They ask:** "How is `this` determined, and how do you bind it?"

`this` is set by *how a function is called*, not where it's defined — internalising that resolves most `this` confusion. Called as a method (`obj.fn()`), `this` is the object. Called plain (`fn()`), it's the global object in sloppy mode or `undefined` in strict mode. Called with `new`, it's the fresh instance.

You override it explicitly with `call`/`apply` (invoke now, args inline vs as an array) or `bind` (return a new function permanently bound). That's the classic fix for a callback losing its receiver.

```js
function greet() { return this.name; }
var user = { name: 'Sam', greet: greet };
user.greet();                 // 'Sam'
var bound = greet.bind(user);
bound();                      // 'Sam'
```

**Say it:** "`this` is defined at call time by the call site, and I use `bind` to lock it when I hand a method to a callback that would otherwise call it plain."
**Red flag:** Saying `this` refers to the function itself or where it's declared. It's the call site — the same function has different `this` depending on how it's invoked.

### Prototypes and the chain
**They ask:** "Explain `__proto__` versus `prototype` and the prototype chain."

Prototypes are JS's inheritance mechanism: property lookup that fails on an object walks up a chain of linked objects until it hits the property or `null`. That's how objects share methods without copying them per instance — the memory and consistency win.

The confusing pair: `prototype` is a property *on constructor functions* — the object that instances will delegate to. `__proto__` (standardised, but prefer `Object.getPrototypeOf`) is the actual link *on an instance* pointing to its prototype. You create a linked object with `Object.create(proto)` and inspect/change it with `Object.getPrototypeOf`/`setPrototypeOf`.

```js
function User() {}
User.prototype.hi = function () { return 'hi'; };
var u = new User();
Object.getPrototypeOf(u) === User.prototype; // true
u.hi(); // found via the chain
```

**Say it:** "`prototype` lives on the constructor and is what new instances delegate to; `__proto__` is the live link on an instance — lookups walk that chain until they hit the property or null."
**Red flag:** Conflating `prototype` and `__proto__`. Functions have `prototype`; instances have the `__proto__` link to it — mixing them up is the classic tell.

### Blocking the main thread
**They ask:** "What does 'blocking code' mean in a single-threaded runtime?"

JS runs your code on one thread, so any long synchronous operation *blocks* everything else — no rendering, no clicks, no timers fire — until it returns. That's why a heavy `while` loop or a synchronous network call freezes the whole UI. Understanding this is the reason async patterns exist at all.

The senior framing: the fix isn't a second thread in JS itself, it's *yielding* — break work into chunks, defer with timers, or offload to the environment (browser I/O, Web Workers). Keep the main thread free to respond.

```js
// Blocks the UI for seconds — nothing else runs:
var end = Date.now() + 3000;
while (Date.now() < end) {}
```

**Say it:** "One thread means a long synchronous task blocks rendering and input until it returns, so I keep the main thread free by chunking or offloading heavy work."
**Red flag:** Thinking `setTimeout` or a Promise makes CPU-heavy code non-blocking. Async only defers *when* code runs; a heavy synchronous loop still blocks once it starts.

### Timers: setTimeout and setInterval
**They ask:** "What's the difference between setTimeout and setInterval, and how do you cancel them?"

Timers are how you schedule work to run later without blocking now — the foundation of debouncing, polling, and deferring. `setTimeout(fn, ms)` runs `fn` once after a minimum delay; `setInterval(fn, ms)` runs it repeatedly. Both return an id.

The delay is a *minimum*, not a guarantee — the callback only fires once the call stack is clear. You cancel with `clearTimeout(id)` / `clearInterval(id)`, and forgetting to clear an interval (e.g. on component teardown) is a classic leak.

```js
var t = setTimeout(fn, 1000);
clearTimeout(t);
var i = setInterval(poll, 5000);
clearInterval(i); // always clear on teardown
```

**Say it:** "`setTimeout` fires once, `setInterval` repeats, the delay is a floor not a promise, and I always keep the id so I can `clear` it on cleanup."
**Red flag:** Treating the delay as exact. It's a minimum; a busy stack pushes it later — never rely on `setTimeout` for precise timing.

### Regex basics
**They ask:** "Name the two ways to build a RegExp and the two main methods to use it."

Regex is the tool for pattern matching in strings, and knowing the basics fluently saves reinventing parsing. Two ways to create: a literal `/pattern/flags` (compiled once, best when the pattern is fixed) or `new RegExp('pattern', 'flags')` (when you build it from a variable at runtime).

The two RegExp methods are `test` (returns a boolean — does it match?) and `exec` (returns match details or null). Character classes like `\d`, `\w`, `\s` and custom sets `[a-z]` are the building blocks. Flags `g` (global, all matches) and `i` (case-insensitive) are the ones you reach for most.

```js
/\d+/.test('abc123');           // true
new RegExp('\\d+', 'g');        // dynamic, note escaped backslash
'A1b2'.match(/[a-z]/gi);        // ['A','b']
```

**Say it:** "Literal for fixed patterns, `new RegExp` when it's dynamic; `test` for a boolean, `exec`/`match` for the captured text, with `g` and `i` as the everyday flags."
**Red flag:** Using a `new RegExp` string without doubling backslashes. `'\d'` in a string isn't `\d` — the literal `/\d/` avoids that escaping trap.

### arguments and recursion
**They ask:** "What is the `arguments` object, why is it 'array-like', and give a recursion example."

`arguments` is an array-*like* object available inside every non-arrow function: it has indexed access and `length` but none of the array methods (`map`, `forEach`), which trips people up. To use array methods you convert it, classically with `Array.prototype.slice.call(arguments)`. Functions can also be built at runtime with the `Function` constructor, though that's rare.

Recursion is a function calling itself with a smaller input until a base case stops it — the natural fit for tree/nested structures. The senior note is always naming the base case, because a missing one is a stack overflow.

```js
function sum() {
  var args = Array.prototype.slice.call(arguments);
  return args.reduce(function (a, b) { return a + b; }, 0);
}
function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); }
```

**Say it:** "`arguments` is array-like — indexed with a length but no array methods — so I slice it to a real array, and every recursion I write leads with its base case."
**Red flag:** Calling `.map` directly on `arguments`. It's not a real array; you must convert it first, or use it only for indexed access and `length`.

### Closures and scope
**They ask:** "Define a closure using lexical environment and scope, and show one."

A closure is a function bundled with the lexical environment it was created in, so it keeps access to those variables even after the outer function returns. That's the mechanism behind private state, factories, and callbacks that "remember" — the single most-asked JS concept.

Scope is where a name is visible; JS resolves names *lexically* (by where code is written, not called). Inner scopes see outer variables, and an inner declaration with the same name *shadows* the outer one. The classic use is a counter whose count is private.

```js
function makeCounter() {
  var count = 0;                 // captured
  return function () { return ++count; };
}
var c = makeCounter();
c(); c(); // 1, 2 — count survives, but stays private
```

**Say it:** "A closure is a function plus the lexical environment it closed over, which is how I get private, persistent state without exposing the variable."
**Red flag:** Saying a closure "copies" the outer variables. It closes over the *live* binding — that's why a loop over `var` with closures all see the final value unless you capture per-iteration.

### try/catch and throwing
**They ask:** "How do try/catch and throw work, and what can you throw?"

Exception handling lets you separate the happy path from failure handling instead of threading error checks through every return. Code in `try` runs; if anything throws, control jumps to `catch(err)` with the thrown value. You raise errors yourself with `throw`.

The senior detail: you *can* throw any value, but you should throw `Error` objects (or subclasses) because they carry a `message` and a `stack`. `try/catch` only catches *synchronous* throws — an error inside an async callback escapes it, which is a common misunderstanding.

```js
try {
  if (!user) throw new Error('user required');
} catch (err) {
  console.error(err.message); // 'user required'
}
```

**Say it:** "I throw `Error` objects, not strings, so the catch gets a message and a stack — and I remember try/catch only traps synchronous throws."
**Red flag:** Wrapping an async callback in try/catch and expecting it to catch. The throw happens later, off the current stack — the surrounding try has already exited.

### Macrotasks and microtasks
**They ask:** "Predict the order when a `setTimeout(…,0)` and a resolved Promise both queue."

JS is single-threaded: the call stack runs to completion, then the event loop drains queues. The key ranking is microtasks (Promise callbacks, `queueMicrotask`) run *before* the next macrotask (timers, I/O), and the whole microtask queue empties after each task. So a resolved Promise's `.then` fires before a `setTimeout(…,0)` queued at the same moment.

`setTimeout(fn, 0)` doesn't mean "now" — it's a macrotask that waits for the stack to clear *and* all pending microtasks to drain. That's the reframe: "zero delay" is a scheduling hint, not immediacy.

```js
setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('promise'));
console.log('sync');
// sync → promise → timeout
```

**Say it:** "Microtasks drain fully between macrotasks, so a resolved Promise's `.then` runs before a `setTimeout(0)` queued at the same time."
**Red flag:** Calling `setTimeout(0)` "run immediately." It's a macrotask that waits for the stack to clear and every pending microtask to finish first.

### var and use strict
**They ask:** "How does `var` behave, what happens without any keyword, and what does 'use strict' change?"

`var` is function-scoped (not block-scoped) and hoisted, which is why a `var` inside an `if` leaks to the whole function. Worse: assigning to a name *without* any keyword creates an implicit global — a silent bug that pollutes global scope from inside a function.

`"use strict"` closes those holes: implicit globals become a ReferenceError, `this` in a plain function call is `undefined` instead of the global object, and silent failures (writing a read-only property) start throwing. It's a per-file or per-function opt-in that turns quiet mistakes into loud ones.

```js
function f() {
  'use strict';
  count = 1; // ReferenceError instead of a silent global
}
```

**Say it:** "`var` is function-scoped and hoisted, an undeclared assignment leaks a global, and `use strict` turns those silent mistakes into errors — so I always enable it."
**Red flag:** Thinking `var` is block-scoped like `let`. A `var` in a loop or `if` is visible across the whole function, which is exactly the leakage strict mode and `let` were meant to fix.

### Object references and descriptors
**They ask:** "When you assign an object to a new variable, what's shared — and what are property descriptors?"

Objects are held by reference, so assigning one variable to another copies the *pointer*, not the data: both names see the same object, and mutating through one is visible through the other. Primitives, by contrast, copy by value. This is the root of "why did changing the copy change the original."

Beyond that, every property has a *descriptor* — `value`, plus `writable`, `enumerable`, `configurable` — set via `Object.defineProperty`. Getters/setters let a property run a function on read/write. Object-to-primitive conversion (via `valueOf`/`toString`) is what makes `obj + ''` produce a string. A shallow copy (`Object.assign({}, o)`) duplicates the top level but still shares nested references.

```js
var a = { n: 1 };
var b = a;      // same reference
b.n = 2;        // a.n is now 2
Object.defineProperty(a, 'id', { value: 7, writable: false });
```

**Say it:** "Objects assign by reference, so a plain assignment shares one object — I use a shallow or deep copy when I actually need independence."
**Red flag:** Assuming `Object.assign` or spread gives a deep copy. It's shallow — nested objects are still shared, so mutating a nested field leaks across both.

### Mark and sweep
**They ask:** "Explain the mark-and-sweep algorithm and what 'reachable' means."

Mark-and-sweep is the algorithm that makes GC correct without reference counting's fatal flaw (cycles). The why: two objects referencing each other would keep each other's count above zero forever; reachability from roots doesn't have that problem.

It works in two phases. *Mark*: start from the roots (global object, current stack, active closures) and traverse every reference, marking each reachable object. *Sweep*: anything unmarked is unreachable and gets freed. You "mark" an object as keepable simply by keeping a reference to it reachable from a root; you make it collectable by dropping every path to it.

```js
var a = {}; var b = {};
a.ref = b; b.ref = a;   // a cycle
a = null; b = null;     // both unreachable → swept, despite the cycle
```

**Say it:** "Mark-and-sweep walks references from the roots, marks everything reachable, and sweeps the rest — which is why it collects cyclic references that reference counting can't."
**Red flag:** Describing GC as reference counting. Pure reference counting leaks on cycles; naming mark-and-sweep and the cycle case is the seniority signal.

### Type conversion and typeof
**They ask:** "How does type conversion work, and what does `typeof` return for each type?"

Coercion is where most 'wat' bugs live, so a senior explains it deliberately. Conversion is either *explicit* (`Number(x)`, `String(x)`, `Boolean(x)`) or *implicit* (`+`, `==`, `if(...)` triggering it for you). Rules to know: `+` with a string concatenates; other operators go numeric; the falsy set is `0, '', null, undefined, NaN, false`.

`typeof` is your runtime type check but has two quirks: `typeof null` is `"object"` and `typeof` a function is `"function"` (functions are objects). For arrays, `typeof` says `"object"` — use `Array.isArray`.

```js
Number('42');      // 42
'5' + 1;           // '51'  (concat)
'5' - 1;           // 4     (numeric)
typeof [];         // 'object' — use Array.isArray([])
```

**Say it:** "`+` concatenates when either side is a string; everything else coerces to number — and I lean on explicit `Number`/`String` to keep intent obvious."
**Red flag:** Trusting `typeof` to detect arrays or null. Both report `"object"`; use `Array.isArray` and an explicit `=== null` check.

### Parsing dates
**They ask:** "How do you parse a string into a Date, and what's risky about it?"

Parsing is where dates bite in production, so a senior treats it defensively. `new Date(string)` and `Date.parse(string)` accept a string, but only the ISO 8601 format (`'2026-01-15T00:00:00Z'`) is reliably parsed the same across engines. Other formats are implementation-defined — the same string can parse differently in different browsers.

An unparseable string yields an `Invalid Date` (a Date whose `getTime()` is `NaN`), not an exception — so you must check for it rather than assume success. The senior move is to parse ISO strings only, or use explicit components.

```js
new Date('2026-01-15');            // ISO — reliable
new Date('01/15/2026');           // format-dependent, avoid
isNaN(new Date('nope').getTime()); // true → Invalid Date
```

**Say it:** "I only trust ISO 8601 for parsing because non-ISO formats are engine-specific, and I check for `Invalid Date` since a bad string returns NaN rather than throwing."
**Red flag:** Parsing locale strings like `'01/15/2026'` and assuming consistency. Day/month order and support vary by engine — ISO or explicit fields are the safe path.

### Serializing with JSON.stringify
**They ask:** "How do you turn an object into JSON, and what gets dropped?"

`JSON.stringify(obj)` serialises to a JSON string for storage or transport — the everyday case for `localStorage` and request bodies. The senior value is knowing what it *silently omits*: `undefined` values, functions, and symbols are dropped from objects (and become `null` in arrays), and it throws on circular references.

Two extra arguments matter: a *replacer* (function or allow-list array) to filter or transform fields, and a spacing argument for pretty-printing. An object with a `toJSON` method controls its own serialised form — that's how `Date` becomes an ISO string.

```js
JSON.stringify({ a: 1, b: undefined, c: function(){} }); // '{"a":1}'
JSON.stringify(obj, ['a', 'b'], 2); // allow-list + pretty print
```

**Say it:** "`JSON.stringify` drops undefined, functions, and symbols and throws on cycles — so I use the replacer argument to control exactly what ships."
**Red flag:** Assuming every field survives serialization. Functions and `undefined` vanish and a cyclic reference throws — round-tripping isn't lossless.

### Quantifiers and escaping
**They ask:** "What do assertions and quantifiers do in a regex, and how do you escape special characters?"

This tier is where regex becomes precise rather than approximate. *Quantifiers* set repetition: `*` (zero+), `+` (one+), `?` (zero or one), `{n,m}` (a range). By default they're *greedy* — they match as much as possible — and a trailing `?` makes them lazy. *Assertions* like `^` and `$` anchor to string start/end and `\b` to a word boundary; they match a position, not a character.

Escaping matters because characters like `. * + ? ( ) [ ] { } \ | ^ $` are special. To match a literal dot you write `\.`. In a `new RegExp` string, backslashes double up.

```js
/^\d{3}-\d{4}$/.test('123-4567'); // anchored, fixed lengths
/a+?/.exec('aaa')[0];             // 'a'  (lazy)
/\./.test('3.14');                // literal dot
```

**Say it:** "Quantifiers are greedy by default, `?` makes them lazy, anchors match positions not characters, and I escape metacharacters like `.` with a backslash."
**Red flag:** Forgetting greediness. `/.+/` on `"<a><b>"` grabs the whole string, not the first tag — you need `.+?` when you want the shortest match.

### Currying and new Function
**They ask:** "What is currying, how would you traverse a nested object recursively, and what does `new Function` do?"

Currying transforms a multi-arg function into a chain of single-arg functions, each returning the next — the value is partial application: pre-fill some arguments now, supply the rest later, which makes reusable specialised functions. It leans directly on closures to remember the earlier args.

Recursive traversal is the standard way to walk a tree-shaped object: handle a node, then recurse into its object-valued children. `new Function('a', 'b', 'return a+b')` builds a function from strings at runtime — powerful but rarely justified and a security/perf concern, like `eval`.

```js
function curry(a) { return function (b) { return a + b; }; }
curry(2)(3); // 5
function walk(obj, fn) {
  Object.keys(obj).forEach(function (k) {
    fn(k, obj[k]);
    if (obj[k] && typeof obj[k] === 'object') walk(obj[k], fn);
  });
}
```

**Say it:** "Currying uses closures to fix arguments one at a time, so I get reusable partially-applied functions — and recursive traversal is my default for tree-shaped data."
**Red flag:** Reaching for `new Function` to build logic dynamically. It has the same injection and no-optimization downsides as `eval`; use a real closure or a lookup instead.

### When closures free memory
**They ask:** "A closure keeps variables alive — when does that memory get collected?"

The senior insight is that a closure only pins the variables it *actually references*, and that lexical environment is reclaimed once the closure itself becomes unreachable. So closures aren't automatic leaks — they leak only when you keep a live reference to a function that captured a large object you no longer need.

Engines optimise this: variables in an outer scope that no closure references can be collected even while the function object lives. The practical takeaway is to null out references (or scope large data narrowly) when a long-lived closure would otherwise hold them.

```js
function make() {
  var big = new Array(1e6);
  return function () { return 42; }; // doesn't reference `big`
}
var f = make(); // `big` can be collected — the closure never used it
```

**Say it:** "A closure's environment is freed once the closure is unreachable, and engines only retain the variables the closure actually references — so it's not an automatic leak."
**Red flag:** Believing every variable in the outer function is kept alive by any closure. Only referenced bindings are retained; unused ones are collectable even while the function object lives.

### Prototypal vs classical inheritance
**They ask:** "How does prototypal inheritance differ from classical OOP inheritance?"

The reframe: classical (class-based) inheritance copies structure from a class blueprint into instances; JS's prototypal inheritance *links* an object to another object and delegates lookups at runtime. There's no blueprint — objects inherit directly from objects. That's more flexible (you can change a prototype and every linked object sees it) and lighter (methods live once on the prototype, not per instance).

Before ES classes, the pattern was a *constructor function* plus its `prototype`: instances share methods through the chain. ES2015 `class` is syntax over exactly this — prototypes underneath, not a new model.

```js
function Animal(name) { this.name = name; }
Animal.prototype.speak = function () { return this.name + ' speaks'; };
var dog = new Animal('Rex'); // dog delegates to Animal.prototype
```

**Say it:** "JS links objects to prototypes and delegates lookups at runtime, rather than copying from a class — even ES6 `class` is just sugar over that prototype chain."
**Red flag:** Describing JS inheritance as copying methods into each instance. Methods live once on the prototype and are shared by delegation — that's the memory and consistency advantage.

### finally and the Error object
**They ask:** "What is `finally` for, and what properties does an Error carry?"

`finally` runs *whether or not* an exception was thrown — that's its purpose: guaranteed cleanup (closing a resource, clearing a flag) on both the success and failure paths, so you don't duplicate the cleanup in `try` and `catch`. It even runs if `try` or `catch` returns.

An `Error` object carries `name` (e.g. `'TypeError'`), `message` (the human string you passed), and `stack` (the non-standard-but-ubiquitous call trace). Built-in subclasses like `TypeError` and `RangeError` let you branch on error kind. Throwing these, not strings, is what makes catch blocks useful.

```js
try {
  risky();
} catch (err) {
  console.error(err.name, err.message);
} finally {
  cleanup(); // always runs
}
```

**Say it:** "`finally` guarantees cleanup on both paths, and I throw real `Error` objects so the catch gets `name`, `message`, and `stack` to work with."
**Red flag:** Putting cleanup only in `catch`. If `try` succeeds, that cleanup never runs — `finally` is the block that covers both outcomes.

### Concurrency without threads
**They ask:** "JS is single-threaded — how does it do 'concurrency'?"

The senior distinction is concurrency versus parallelism. JS is concurrent but not parallel: one thread runs your code, but the *environment* (browser, Node) handles I/O — timers, network, file reads — on other threads and hands results back via the event loop's queues. So many operations are *in flight* at once even though only one line of JS executes at a time.

This is why async code feels multithreaded but isn't: your callbacks never run simultaneously, they're interleaved. True parallelism needs Web Workers, which run separate threads with no shared memory (they message-pass).

```js
// Two requests overlap in the environment, but the callbacks
// run one at a time on the single JS thread:
fetchA(function () {});
fetchB(function () {});
```

**Say it:** "JS is concurrent, not parallel — the environment runs I/O off-thread and queues callbacks, but only one line of my JS ever executes at a time."
**Red flag:** Saying async makes JS multithreaded. The offloading is done by the host; your JS callbacks are still serialized on one thread — true parallelism needs Workers.

### requestAnimationFrame
**They ask:** "What is requestAnimationFrame and why prefer it over setInterval for animation?"

`requestAnimationFrame(cb)` schedules a callback to run right *before the browser's next repaint*, which is the why: your animation updates sync to the display's refresh (typically ~60fps), so motion is smooth and you never draw more often than the screen updates. `setInterval` can't align to the paint cycle, causing dropped or duplicated frames.

The other win is efficiency: rAF pauses automatically when the tab is backgrounded, so you don't burn CPU/battery animating an invisible page. You loop by calling `requestAnimationFrame` again inside the callback, and cancel with `cancelAnimationFrame(id)`.

```js
function frame(ts) {
  // update using the timestamp
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```

**Say it:** "`requestAnimationFrame` runs just before each repaint so animation matches the refresh rate and pauses in background tabs — that's why it beats `setInterval` for smoothness and battery."
**Red flag:** Animating with `setInterval(fn, 16)`. It drifts off the paint cycle and keeps running in hidden tabs — rAF syncs to paint and self-throttles.

### Deep clone and linked lists
**They ask:** "How do you deep-clone an object, and how would you model a linked list with objects?"

Deep clone means copying every level so no references are shared — the reframe from shallow copy, which duplicates only the top level and leaves nested objects linked. Beyond the lossy `JSON` trick, a correct deep clone recurses through properties (and must handle cycles and special types), which is why teams use a library for the general case.

A linked list falls straight out of object references: each node is an object with a `value` and a `next` pointer to the following node (or `null`). It shows you understand that objects *are* references — traversal is just following `next`.

```js
var list = { value: 1, next: { value: 2, next: null } };
for (var n = list; n; n = n.next) { /* visit n.value */ }
```

**Say it:** "A deep clone recurses so nothing nested is shared, and a linked list is just node objects each holding a `value` and a `next` reference — objects being references is what makes both work."
**Red flag:** Calling a shallow copy a deep clone. Spread and `Object.assign` share nested objects; a true deep clone must recurse and handle cycles.

### Generational and incremental GC
**They ask:** "What optimizations do modern garbage collectors use beyond mark-and-sweep?"

The senior depth here is *why* naive mark-and-sweep isn't enough: sweeping the whole heap synchronously pauses your program, and most objects die young. Modern engines (like V8) exploit both facts. *Generational* collection splits the heap into a young generation (collected frequently and cheaply) and an old generation (collected rarely), because the "generational hypothesis" says most objects are short-lived.

*Incremental* collection breaks the marking work into small steps interleaved with your code, so you get many tiny pauses instead of one long freeze. *Idle-time* collection schedules GC work when the main thread is otherwise free. Together they keep pauses short and frame rates smooth.

**Say it:** "Engines use generational collection because most objects die young, plus incremental and idle-time marking to spread the work out and avoid long stop-the-world pauses."
**Red flag:** Describing GC as one big periodic stop-the-world sweep. Modern collectors are generational and incremental specifically to avoid that — naming those is the seniority signal.

### Global error handling with window.onerror
**They ask:** "How do you catch errors that escape your try/catch blocks?"

`window.onerror` is the last-resort global handler: it fires for uncaught runtime errors that no local `try/catch` caught, which is exactly why it's the hook for production error monitoring — you can't wrap every line, but you can catch what slips through and report it. It receives the message, source URL, line/column, and the error object.

The senior framing: local `try/catch` is for errors you can *handle*; `window.onerror` (plus `window.onunhandledrejection` for Promises) is for *observing* the ones you didn't anticipate, so they reach your logging service instead of vanishing in the console.

```js
window.onerror = function (msg, src, line, col, err) {
  report({ msg: msg, line: line, stack: err && err.stack });
  return true; // suppress the default console error
};
```

**Say it:** "`window.onerror` is my global net for uncaught errors — I wire it to logging so failures I didn't anticipate still reach monitoring instead of dying silently."
**Red flag:** Relying on it to *recover* from errors. It's for observation and reporting after the fact; recovery belongs in local try/catch where you can still act.

### Groups, ranges, and flags
**They ask:** "How do capture groups and character ranges work, and what advanced flags exist?"

Groups are what make regex extract, not just match. `(…)` is a *capturing* group — its match is available in `exec` results and `replace` via `$1`; `(?:…)` groups without capturing (cheaper when you only need precedence). Ranges inside a class like `[a-z0-9]` match any char in the span, and `[^…]` negates. Alternation `(cat|dog)` matches either.

Beyond `g`/`i`, the useful flags are `m` (multiline — `^`/`$` match each line) and, in later engines, `s` (dotall — `.` matches newlines) and `u` (unicode). Backreferences (`\1`) match what a group already captured.

```js
var m = /(\d{4})-(\d{2})/.exec('2026-01');
m[1]; // '2026'  (first group)
'a1b2'.replace(/([a-z])(\d)/g, '$2$1'); // '1a2b'
```

**Say it:** "`(…)` captures for extraction, `(?:…)` groups without capturing, character ranges and negation refine the class, and `m`/`s`/`u` extend matching across lines and unicode."
**Red flag:** Using a capturing group when you only need grouping for alternation or repetition. Prefer `(?:…)` there — needless captures add cost and clutter the match array.

### UTC, time zones, and valid dates
**They ask:** "How do you handle UTC versus local time, and how do you check a Date is valid?"

The senior rule is store and transmit in UTC, convert to local only for display — that's how you avoid the timezone bugs that plague date code. A `Date` is a single instant (ms since the Unix epoch, UTC); its `getHours` reads *local* time while `getUTCHours` reads UTC. The instant is absolute; the "wall clock" reading depends on the zone.

To validate, remember an unparseable date is an `Invalid Date` object, not an error — its `getTime()` is `NaN`. So the reliable check is `!isNaN(date.getTime())` (or `Object.prototype.toString` for the type first).

```js
var d = new Date('2026-01-15T12:00:00Z');
d.getUTCHours();               // 12  (UTC)
d.getHours();                  // shifts by local offset
!isNaN(new Date('nope').getTime()); // false → invalid
```

**Say it:** "I keep everything in UTC and convert to local only at display time, and I validate a Date with `!isNaN(date.getTime())` since a bad one is an Invalid Date, not a throw."
**Red flag:** Comparing or storing local-time strings across zones. The same instant reads as different wall-clock times per zone — UTC is the only safe common ground.

### The JSON.parse reviver
**They ask:** "What's the second argument to JSON.parse for?"

`JSON.parse(text, reviver)` takes an optional *reviver* callback that runs for every key/value as the object is rebuilt, letting you transform values during parsing instead of walking the result afterward. The classic use is rehydrating types JSON can't represent — turning an ISO date string back into a real `Date`.

The reviver gets `(key, value)` and returns the value to use (or `undefined` to drop the property). It's called bottom-up, so nested values are already revived when the parent sees them.

```js
JSON.parse('{"created":"2026-01-15T00:00:00Z"}', function (key, val) {
  if (key === 'created') return new Date(val);
  return val;
});
// created is now a Date, not a string
```

**Say it:** "The reviver runs per key during parsing, so I use it to rehydrate values JSON can't hold — like converting date strings straight back into Date objects."
**Red flag:** Parsing first and then looping to fix types. The reviver does it in one pass during parse, and it can also drop unwanted keys by returning `undefined`.

### Why eval is evil
**They ask:** "Why is 'eval is evil' a rule of thumb?"

`eval` runs a string as code, and the senior objection is threefold: security, performance, and debuggability. Security first — evaluating any string that includes user input is a code-injection hole. Performance — engines can't optimize a scope that `eval` might mutate, so they deopt the surrounding function. Debuggability — dynamically built code is opaque to tooling and hard to trace.

The reframe is that almost every real use of `eval` has a safer construct: dynamic property access with bracket notation, `JSON.parse` for data, a function/lookup table for behavior. Same goes for the `Function` constructor and string-argument `setTimeout`, which share `eval`'s downsides.

```js
// eval('user.' + prop)  → injection risk + deopt
user[prop];              // bracket access: safe, fast
```

**Say it:** "`eval` opens injection risk, blocks engine optimization, and hides code from tooling — and nearly every use has a safer replacement like bracket access or `JSON.parse`."
**Red flag:** Defending `eval` for parsing data or reading dynamic properties. `JSON.parse` and bracket notation do those safely; reaching for `eval` signals unfamiliarity with the alternatives.

### Recovering the constructor
**They ask:** "How do you find an object's constructor through its prototype?"

Every function's `prototype` object has a `constructor` property pointing back to the function, so an instance can reach its constructor by walking the chain: `instance.constructor` resolves via the prototype to the function that built it. That's the mechanism behind `obj.constructor === SomeType` checks and cloning "an object of the same kind."

The senior caveat: `constructor` is just a normal, writable property on the prototype — if you *replace* a prototype wholesale (`Fn.prototype = {…}`) without restoring `constructor`, it points to `Object` instead. So it's a convenience, not a guarantee; prefer `instanceof` for reliable type checks.

```js
function User() {}
var u = new User();
u.constructor === User;              // true (via User.prototype)
Object.getPrototypeOf(u).constructor; // same thing, explicit
```

**Say it:** "`instance.constructor` resolves through the prototype to the function that made it, but it's a writable property — reassigning a prototype can break it, so I trust `instanceof` for real type checks."
**Red flag:** Treating `constructor` as tamper-proof identity. Overwriting a prototype loses it; it's a hint, not a reliable type guard.
