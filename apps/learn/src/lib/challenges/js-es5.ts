import type { Challenge } from '../challenges'

export const jsEs5Challenges: Challenge[] = [
  // ─── JS ES5 (51–62) ───
  {
    id: 51,
    title: 'Closure counter factory',
    category: 'JS ES5',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Write a function \`createCounter\` that returns an object with \`increment\` and \`getValue\` methods.
The count variable must be private — enforced via closure, not convention. Two counters created
separately must not share state.`,
    starterCode: `function createCounter() {
  // Your code here
  return { increment, getValue }
}`,
    solution: `function createCounter() {
  var count = 0
  return {
    increment: function() { count++ },
    getValue: function() { return count },
  }
}`,
    explanation: `Pre-\`#private\` fields, closures were JavaScript's only real access modifier — and this factory is the canonical proof you understand *why* they work, not just that they do. Each call to \`createCounter\` creates a new execution context with its own lexical environment containing \`count\`. Normally that environment dies when the call returns; here the two returned functions hold a reference to it, so the GC keeps it alive for exactly as long as the counter object lives. That's the entire mechanism of closures: a function plus the environment it was created in.

Two properties fall out for free. **True privacy** — \`count\` is not a property on the returned object, so no consumer can read or corrupt it; the closure is the only door. **Instance isolation** — every factory call builds a fresh environment, so counters never share state.

The trade-off a senior names: each instance carries its own copies of \`increment\` and \`getValue\`, unlike prototype methods which are shared. For a handful of counters that's irrelevant; for ten thousand instances the prototype pattern wins on memory — privacy versus footprint is the actual choice here.

**Red flag:** storing the count as \`this.count\` and calling it "private by convention." The interviewer asked for closure-enforced privacy; a property is public, period.

**Say it:** "The returned functions keep the factory's lexical environment reachable, so \`count\` lives on, invisible and per-instance — that's closure-based encapsulation, traded against the shared-memory advantage of prototype methods."`,
    tests: [
      { it: 'starts at 0', run: 'createCounter().getValue()', expected: 0 },
      { it: 'increments to 2', run: '(() => { var c = createCounter(); c.increment(); c.increment(); return c.getValue() })()', expected: 2 },
      { it: 'instances are independent', run: '(() => { var a = createCounter(); var b = createCounter(); a.increment(); return b.getValue() })()', expected: 0 },
      { it: 'count is not an accessible property', run: 'createCounter().count === undefined', expected: true },
    ],
    hints: ['Variable declared inside outer function', 'Inner functions close over it', 'No this needed'],
  },
  {
    id: 52,
    title: 'Module pattern (IIFE)',
    category: 'JS ES5',
    difficulty: 'medium',
    timeEstimate: '5 min',
    prompt: `Create a module using an IIFE that exposes a public API with \`add\` and \`getAll\` methods.
The internal \`items\` array must be private, and \`getAll\` must return a copy so callers
cannot mutate internal state.`,
    starterCode: `var Store = (function() {
  // Your code here
  return { add, getAll }
})()`,
    solution: `var Store = (function() {
  var items = []
  return {
    add: function(item) { items.push(item) },
    getAll: function() { return items.slice() },
  }
})()`,
    explanation: `Before ES modules existed, this pattern *was* the module system — every script shared one global scope, and an IIFE was how libraries like jQuery avoided leaking their internals into it. The function expression runs exactly once, creates a lexical environment holding \`items\`, and returns only the public API. The environment survives because the returned methods close over it; everything not returned is unreachable from outside — encapsulation enforced by scope, not documentation.

The detail that separates answers: \`getAll\` returns \`items.slice()\`, a defensive copy. Return the live array and every caller holds a write handle to your private state — \`Store.getAll().push(x)\` would corrupt the module from outside, silently defeating the whole point. Note the copy is shallow; if items were objects, callers could still mutate *them* — worth saying out loud.

The trade-off: singletons. The IIFE runs once, so there's exactly one \`Store\` — fine for app-level services, wrong when you need instances (that's the factory pattern from the closure-counter challenge). And ES modules give you this for free today with real static analysis; the IIFE remains interview-relevant because it proves you understand what the module syntax compiles down to.

**Red flag:** returning \`items\` directly from \`getAll\`. It reads as "I've never been bitten by shared mutable state."

**Say it:** "The IIFE runs once and its closure is the private scope — I return a slice so no caller ever holds a reference to internal state."`,
    tests: [
      { it: 'starts empty', run: 'Store.getAll().length', expected: 0 },
      { it: 'add then getAll returns items in order', run: '(() => { Store.add("a"); Store.add("b"); return Store.getAll() })()', expected: ['a', 'b'] },
      { it: 'getAll returns a copy, not the live array', run: '(() => { Store.add("x"); var copy = Store.getAll(); copy.push("hacked"); return Store.getAll().length })()', expected: 1 },
      { it: 'items array is not exposed', run: 'typeof Store.items', expected: 'undefined' },
    ],
    hints: ['IIFE runs once', 'Closures capture items', 'Return slice to prevent mutation'],
  },
  {
    id: 53,
    title: 'Function.prototype.bind',
    category: 'JS ES5',
    difficulty: 'medium',
    timeEstimate: '5 min',
    prompt: `Given an object with a \`greet\` method, use \`.bind()\` to create \`boundGreet\` — a function
that always uses that object as \`this\`, even when detached from the object or attached to another one.`,
    starterCode: `var person = {
  name: 'Alice',
  greet: function() { return 'Hi, ' + this.name }
}
// Create boundGreet using bind
var boundGreet = person.greet // Fix this`,
    solution: `var person = {
  name: 'Alice',
  greet: function() { return 'Hi, ' + this.name }
}
var boundGreet = person.greet.bind(person)`,
    explanation: `This exists because \`this\` in a regular function is resolved at the **call site**, not where the function was defined. \`var fn = person.greet; fn()\` loses the receiver — \`this\` becomes \`undefined\` in strict mode (or the global object in sloppy mode), and \`this.name\` blows up or reads a global. Every callback API — timers, event handlers, array iteration — invokes your function detached, so this failure mode is everywhere.

\`.bind(person)\` returns a **new** function whose \`this\` is permanently fixed. The tests here prove the guarantee is absolute: calling it detached still works, and even attaching it to a different object as a method can't re-point it — an explicit \`.call\`/\`.apply\` can't either. Bind wins every future \`this\` resolution, which is exactly what you want for a callback and exactly why it's called "hard binding."

Two senior details: \`bind\` also supports partial application (\`fn.bind(null, arg1)\` pre-fills arguments), and the returned function is a distinct identity — binding in a render loop creates a new function each time, which is why React codebases bind once in a constructor or use class fields instead.

**Red flag:** "I'd just use an arrow function" with no mechanism. Fine as a fix, but the question probes whether you know arrows don't *bind* \`this\` — they never had their own, they capture lexically. Different mechanism, and interviewers check you can name both.

**Say it:** "\`this\` is decided at the call site, so passing a method as a callback loses its receiver — \`bind\` returns a new function with the receiver hard-wired, immune to any later call site."`,
    tests: [
      { it: 'boundGreet returns "Hi, Alice"', run: 'boundGreet()', expected: 'Hi, Alice' },
      { it: 'works detached from the object', run: '(() => { var fn = boundGreet; return fn() })()', expected: 'Hi, Alice' },
      { it: 'cannot be re-pointed by another receiver', run: '(() => { var other = { name: "Mallory", greet: boundGreet }; return other.greet() })()', expected: 'Hi, Alice' },
      { it: 'uses .bind()', check: ['.bind('] },
    ],
    hints: ['.bind(obj) creates new function with fixed this', 'Without bind, this context is lost'],
  },
  {
    id: 54,
    title: 'Call and apply',
    category: 'JS ES5',
    difficulty: 'medium',
    timeEstimate: '5 min',
    prompt: `Write a function \`sumAll\` that accepts any number of arguments and returns their sum.
Use a loop over the \`arguments\` object (not rest params). Zero arguments must return 0.`,
    starterCode: `function sumAll() {
  // Your code here (use arguments object)
  return 0
}`,
    solution: `function sumAll() {
  var total = 0
  for (var i = 0; i < arguments.length; i++) {
    total += arguments[i]
  }
  return total
}`,
    explanation: `Before rest parameters, \`arguments\` was the only way to write variadic functions, and it still appears in every ES5 codebase you'll maintain — so interviewers use it to check you know its sharp edges, not because they want you writing it today.

The mechanics: every regular (non-arrow) function gets an \`arguments\` binding in its execution context — an **array-like** object with indexed slots and a \`length\`, but not an \`Array\`. It has none of the array methods; \`arguments.map(...)\` throws. The ES5 conversion idiom is \`Array.prototype.slice.call(arguments)\`, which works because \`slice\` only needs indices and a length from its \`this\`. Starting the accumulator at \`0\` makes the zero-argument case fall out of the loop naturally — no special-casing.

The senior details worth volunteering: arrow functions have **no** \`arguments\` of their own — they see the enclosing function's, same lexical rule as their \`this\`. And in sloppy mode, \`arguments\` is live-linked to the named parameters (mutating one mutates the other), a misfeature strict mode severs. Today you'd write \`function sumAll(...nums)\` and get a real array; knowing both marks you as someone who can read old code and write new code.

**Red flag:** calling \`arguments.reduce(...)\` or \`arguments.forEach(...)\` directly. It signals you've never actually run this code — array-like is not array.

**Say it:** "\`arguments\` is array-like, not an array — I loop by index or borrow \`Array.prototype.slice\`, and I know arrows don't get their own, which is the same lexical rule as their \`this\`."`,
    tests: [
      { it: 'sums 1,2,3', run: 'sumAll(1,2,3)', expected: 6 },
      { it: 'returns 0 for no arguments', run: 'sumAll()', expected: 0 },
      { it: 'handles negatives', run: 'sumAll(-5, 5, 10)', expected: 10 },
      { it: 'single argument returns itself', run: 'sumAll(7)', expected: 7 },
      { it: 'uses the arguments object', check: ['arguments'] },
    ],
    hints: ['arguments is array-like, not array', 'Use for loop with indices', 'Available in regular functions only'],
  },
  {
    id: 55,
    title: 'Hoisting behavior',
    category: 'JS ES5',
    difficulty: 'medium',
    timeEstimate: '5 min',
    prompt: `Write \`hoistingDemo()\` demonstrating hoisting: call a function BEFORE its declaration
(works — declarations hoist entirely) and read a \`var\` BEFORE its assignment (yields undefined).
Return \`{ fnResult, varBeforeInit, myVar }\` where \`varBeforeInit\` is \`String(myVar)\` captured
before the assignment (so it's the string 'undefined').`,
    starterCode: `function hoistingDemo() {
  // 1. Call hoistedFunction here (before its declaration below)
  // 2. Capture String(myVar) here (before its assignment below)
  var myVar = 'assigned'
  function hoistedFunction() { return 'hoisted' }
  return { fnResult: '', varBeforeInit: '', myVar: myVar }
}`,
    solution: `function hoistingDemo() {
  var fnResult = hoistedFunction()   // works: function declarations hoist entirely
  var varBeforeInit = String(myVar)  // 'undefined': declaration hoisted, assignment not
  var myVar = 'assigned'
  function hoistedFunction() { return 'hoisted' }
  return { fnResult: fnResult, varBeforeInit: varBeforeInit, myVar: myVar }
}`,
    explanation: `Hoisting isn't a quirk — it's the visible evidence that JavaScript executes in **two phases**. When a function is called, the engine first creates the execution context: it scans the body, registers every \`var\` in the environment record initialized to \`undefined\`, and registers every function declaration **fully, body and all**. Only then does execution begin, line by line. Nothing "moves to the top"; the names simply already exist before the first line runs.

That model explains both behaviors here in one breath. \`hoistedFunction()\` works before its declaration because the whole function object was created during the setup phase. \`myVar\` reads as \`undefined\` — not a ReferenceError — because its *declaration* was registered but its *assignment* is an ordinary runtime statement that hasn't executed yet. Declaration and initialization are two different events; hoisting affects only the first.

Complete the picture unprompted: \`let\`/\`const\` are **also** hoisted — their names are reserved during setup — but left uninitialized, so touching them before the declaration line throws. That window is the temporal dead zone, and it exists precisely to turn the silent-\`undefined\` bug you just demonstrated into a loud error. Function *expressions* (\`var f = function(){}\`) hoist like any \`var\`: name yes, function no.

**Red flag:** "let and const aren't hoisted." They are — TDZ is uninitialized hoisting, and stating it wrong tells the interviewer your model is memorized, not understood.

**Say it:** "The engine registers declarations in a setup phase before executing a single line — \`var\` initializes to undefined, function declarations hoist whole, and let/const hoist uninitialized, which is the TDZ."`,
    tests: [
      { it: 'function callable before declaration', run: 'hoistingDemo().fnResult', expected: 'hoisted' },
      { it: 'var reads undefined before assignment', run: 'hoistingDemo().varBeforeInit', expected: 'undefined' },
      { it: 'var holds value after assignment', run: 'hoistingDemo().myVar', expected: 'assigned' },
      { it: 'returns the full shape', run: 'hoistingDemo()', expected: { fnResult: 'hoisted', varBeforeInit: 'undefined', myVar: 'assigned' } },
    ],
    hints: ['Function declarations hoist entirely', 'var declarations hoist, not initializations', 'let/const hoist too but stay uninitialized — the TDZ'],
  },
  {
    id: 56,
    title: 'Constructor function and new',
    category: 'JS ES5',
    difficulty: 'medium',
    timeEstimate: '5 min',
    prompt: `Create a constructor function \`Person(name, age)\` that sets both properties on the instance
and adds a \`sayHello\` method on the prototype (shared across all instances, not per-instance).`,
    starterCode: `function Person(name, age) {
  // Your code here
}

Person.prototype.sayHello = function() {
  // Your code here
}`,
    solution: `function Person(name, age) {
  this.name = name
  this.age = age
}

Person.prototype.sayHello = function() {
  return "Hello, I'm " + this.name
}`,
    explanation: `This is the pattern \`class\` desugars to, and interviewers ask it because debugging any class hierarchy eventually means reasoning at this level. What \`new Person('Bob', 30)\` actually does, in four steps: creates a fresh object whose internal prototype link points at \`Person.prototype\`; binds that object as \`this\`; runs the constructor body, which stamps per-instance data onto \`this\`; returns the object (unless the constructor explicitly returns another object — a rarely-used escape hatch worth knowing exists).

The design decision the tests verify: \`sayHello\` lives on the prototype, so **one** function object serves every instance — \`a.sayHello === b.sayHello\` is \`true\`, and \`hasOwnProperty('sayHello')\` is \`false\` because method lookup walks the prototype chain rather than finding it on the instance. Define methods inside the constructor instead and every \`new\` allocates a fresh closure per method — ten thousand instances means ten thousand copies of identical code. Data on the instance, behavior on the prototype: that's the split, and it's exactly what \`class\` syntax generates.

The trade-off cuts the other way when you need closure-based privacy (see the counter factory) — prototype methods can only see \`this\`, never the constructor's local variables.

**Red flag:** assigning \`this.sayHello = function() {...}\` inside the constructor "so it's all in one place." That's the memory-per-instance mistake, and it also breaks the shared-identity check an interviewer will run.

**Say it:** "\`new\` links a fresh object to the constructor's prototype and binds it as \`this\` — I keep data on instances and methods on the prototype, which is exactly what class syntax compiles to."`,
    tests: [
      { it: 'creates person with name', run: 'new Person("Bob", 30).name', expected: 'Bob' },
      { it: 'sets age', run: 'new Person("Bob", 30).age', expected: 30 },
      { it: 'sayHello uses instance name', run: 'new Person("Ana", 25).sayHello()', expected: "Hello, I'm Ana" },
      { it: 'method is shared via prototype', run: 'new Person("a", 1).sayHello === new Person("b", 2).sayHello', expected: true },
      { it: 'sayHello is not an own property', run: 'new Person("a", 1).hasOwnProperty("sayHello")', expected: false },
    ],
    hints: ['Constructor called with new', 'Properties assigned to this', 'Methods on prototype'],
  },
  {
    id: 57,
    title: 'Prototype chain lookup',
    category: 'JS ES5',
    difficulty: 'medium',
    timeEstimate: '5 min',
    prompt: `Create a \`Dog\` constructor that inherits from \`Animal\` via the prototype chain.
\`Animal\` has a \`breathe\` method; \`Dog\` adds \`bark\`. A dog must be \`instanceof Animal\`,
\`Animal.prototype\` must not gain \`bark\`, and \`Dog.prototype.constructor\` must be repaired.`,
    starterCode: `function Animal() {}
Animal.prototype.breathe = function() { return 'breathing' }

function Dog() {}
// Set up inheritance
Dog.prototype = // Your code here

Dog.prototype.bark = function() { return 'woof' }`,
    solution: `function Animal() {}
Animal.prototype.breathe = function() { return 'breathing' }

function Dog() {}
Dog.prototype = Object.create(Animal.prototype)
Dog.prototype.constructor = Dog
Dog.prototype.bark = function() { return 'woof' }`,
    explanation: `This is what \`class Dog extends Animal\` compiles down to, and the two lines after the constructor are where every candidate either proves or disproves prototype fluency. \`Object.create(Animal.prototype)\` builds a fresh object whose internal prototype link points at \`Animal.prototype\` — so lookup on a dog walks instance → \`Dog.prototype\` → \`Animal.prototype\`, finding \`bark\` at the second hop and \`breathe\` at the third. That chain is also what \`instanceof\` traverses.

Why \`Object.create\` and not the two tempting alternatives? \`Dog.prototype = Animal.prototype\` doesn't inherit — it **aliases**: adding \`bark\` would stamp it onto Animal itself, giving every animal a bark (this file's tests catch exactly that pollution). \`Dog.prototype = new Animal()\` mostly works but runs the parent constructor at setup time — with real constructors that means executing side effects and baking parent instance state into the shared prototype. \`Object.create\` gives you the link and nothing else.

The \`constructor\` repair matters because replacing the prototype wholesale discarded the original object that carried \`constructor: Dog\`; without the fix, \`new Dog().constructor\` reports \`Animal\` through the chain — \`constructor\` is a writable convention, only as trustworthy as the last person who reassigned a prototype.

**Red flag:** \`Dog.prototype = Animal.prototype\`. It passes the happy-path test and corrupts the parent — the kind of bug that surfaces three features later.

**Say it:** "\`Object.create\` gives me the prototype link without running the parent constructor, then I repair \`constructor\` because wholesale prototype replacement clobbers it — that's the desugared version of extends."`,
    tests: [
      { it: 'dog breathes via inherited method', run: 'new Dog().breathe()', expected: 'breathing' },
      { it: 'dog barks via own prototype', run: 'new Dog().bark()', expected: 'woof' },
      { it: 'dog is instanceof Animal', run: 'new Dog() instanceof Animal', expected: true },
      { it: 'constructor is repaired', run: 'Dog.prototype.constructor === Dog', expected: true },
      { it: 'Animal.prototype is not polluted with bark', run: 'typeof Animal.prototype.bark', expected: 'undefined' },
    ],
    hints: ['Object.create sets up prototype chain', 'Fix constructor property', 'Methods added after inheritance'],
  },
  {
    id: 58,
    title: 'hasOwnProperty vs in',
    category: 'JS ES5',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Write \`isOwnProp(obj, prop)\` that checks whether a property is an object's OWN property
(vs inherited). It must survive two hostile inputs: an object that shadows \`hasOwnProperty\`
with its own lying version, and an object created with \`Object.create(null)\`.`,
    starterCode: `function isOwnProp(obj, prop) {
  // Your code here
}`,
    solution: `function isOwnProp(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}`,
    explanation: `The own-vs-inherited distinction exists because property lookup walks the prototype chain: \`'toString' in {}\` is \`true\` even though the empty object owns nothing — \`in\` answers "reachable anywhere on the chain," \`hasOwnProperty\` answers "physically on this object." Serialization, iteration guards, and dictionary-style objects all need the second question.

The one-liner is deliberately paranoid, and the paranoia is the interview content. \`obj.hasOwnProperty(prop)\` — the naive call — resolves \`hasOwnProperty\` through the prototype chain like any other property, which means it breaks in two real cases. First, an object can **shadow** it: \`{ hasOwnProperty: function() { return true } }\` makes the naive call return whatever the attacker (or careless teammate, or JSON payload) decided. Second, \`Object.create(null)\` objects — the standard choice for lookup maps precisely because they inherit nothing — have no \`hasOwnProperty\` at all; the naive call throws. Borrowing the canonical method from \`Object.prototype\` and invoking it with \`.call(obj, prop)\` sidesteps both, because you never resolve the method through the untrusted object.

Modern escape hatch worth naming: \`Object.hasOwn(obj, prop)\` (ES2022) is this exact pattern as a built-in static. In ES5 code, \`.call\` is the idiom.

**Red flag:** \`obj.hasOwnProperty(prop)\` straight off the object. ESLint's \`no-prototype-builtins\` rule exists because this bites in production — data-shaped objects come from the network, and the network doesn't promise a clean prototype.

**Say it:** "I call \`Object.prototype.hasOwnProperty.call(obj, prop)\` because resolving the method through the object itself trusts a chain that can be shadowed or absent — same reason Object.hasOwn was added."`,
    tests: [
      { it: 'toString is not own', run: 'isOwnProp({}, "toString")', expected: false },
      { it: 'own property returns true', run: 'isOwnProp({ a: 1 }, "a")', expected: true },
      { it: 'prototype-inherited prop is not own', run: '(() => { function F() {}; F.prototype.x = 1; return isOwnProp(new F(), "x") })()', expected: false },
      { it: 'works on Object.create(null) objects', run: '(() => { var o = Object.create(null); o.k = 1; return isOwnProp(o, "k") })()', expected: true },
      { it: 'immune to shadowed hasOwnProperty', run: 'isOwnProp({ hasOwnProperty: function() { return true } }, "nope")', expected: false },
    ],
    hints: ['.hasOwnProperty checks own props only', 'in operator checks prototype too', 'Borrow the method from Object.prototype via .call'],
  },
  {
    id: 59,
    title: 'Array.map manually',
    category: 'JS ES5',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Implement your own version of \`Array.prototype.map\` as a standalone function \`myMap(arr, callback)\`.
It must return a NEW array (never mutate the input) and pass \`(element, index, array)\` to the callback.`,
    starterCode: `function myMap(arr, callback) {
  // Your code here
  return []
}`,
    solution: `function myMap(arr, callback) {
  var result = []
  for (var i = 0; i < arr.length; i++) {
    result.push(callback(arr[i], i, arr))
  }
  return result
}`,
    explanation: `Interviewers ask for map reimplementations because the exercise exposes whether you know the **contract**, not just the one-argument usage everyone types daily. Map exists to express "same-shape transformation" as a value-producing operation: input untouched, output a new array of identical length, one call per element. That immutability guarantee is why map-produced arrays are safe to hand to React state or memoized selectors — a new reference signals a change, and nobody upstream sees their data mutated.

The mechanics are a loop with three obligations. Fresh \`result\` array; \`push\` the callback's return value (whatever it is — \`undefined\` included, map never filters); and pass the full triple \`(element, index, array)\`, because callers legitimately use the index and occasionally the whole array. Skipping the extra arguments is the most common "works on my test" bug — and it's also the source of the classic \`['1','7','11'].map(parseInt)\` trap, where the index lands in \`parseInt\`'s radix parameter. Knowing the triple is *why* you can explain that trap.

Honest scoping earns points: the real spec also skips holes in sparse arrays and accepts a \`thisArg\` — say you're deliberately omitting those, don't let the interviewer discover it.

**Red flag:** writing \`arr[i] = callback(arr[i])\` and returning \`arr\`. In-place mutation breaks every caller who kept a reference to the input — it's the difference between a transformation and a side effect.

**Say it:** "Map is a pure same-length transformation — new array out, input untouched, callback receives element, index, and array, which is exactly why map(parseInt) misbehaves."`,
    tests: [
      { it: 'doubles values', run: 'myMap([1,2,3], function(x){ return x*2 })', expected: [2, 4, 6] },
      { it: 'empty array yields empty array', run: 'myMap([], function(x){ return x })', expected: [] },
      { it: 'passes the index as second argument', run: 'myMap(["a","b","c"], function(x, i){ return x + i })', expected: ['a0', 'b1', 'c2'] },
      { it: 'does not mutate the input', run: '(() => { var src = [1, 2]; myMap(src, function(x){ return x * 10 }); return src })()', expected: [1, 2] },
    ],
    hints: ['Initialize empty result array', 'Push transformed values', 'Pass (element, index, array) to callback'],
  },
  {
    id: 60,
    title: 'Array.filter manually',
    category: 'JS ES5',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Implement your own version of \`Array.prototype.filter\` as \`myFilter(arr, predicate)\`.
Keep elements whose predicate result is TRUTHY (not just \`=== true\`), return a new array,
and pass \`(element, index, array)\` to the predicate.`,
    starterCode: `function myFilter(arr, predicate) {
  // Your code here
  return []
}`,
    solution: `function myFilter(arr, predicate) {
  var result = []
  for (var i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i, arr)) result.push(arr[i])
  }
  return result
}`,
    explanation: `Filter is map's sibling with a different contract: instead of transforming every element, it selects a subset — output length is 0 to n, and crucially the kept elements are the **same references** as the input's, not copies. That identity preservation matters in practice: filtering a list of objects and then mutating one mutates the original too. A senior mentions that unprompted, because it's the bug that follows "I filtered it, so it's a new array, right?" — new array, same objects.

Two contract details the tests pin down. First, **truthiness**, not strict equality with \`true\`: the spec coerces the predicate's return value, which is exactly why \`arr.filter(Boolean)\` works as the idiomatic compact-the-falsy-values one-liner. Guarding with \`=== true\` would break that idiom and half the predicates in real codebases. Second, the full \`(element, index, array)\` triple — index-based selection like "every other row" is a legitimate, common use.

Note what filter deliberately isn't: it can't short-circuit (that's \`find\`/\`some\`), and it always walks the whole array. Chaining \`filter().map()\` costs two passes and an intermediate array — fine almost always, worth collapsing into one \`reduce\` only when a profiler says so.

**Red flag:** \`if (predicate(arr[i]) === true)\`. It looks defensive and is actually wrong — it silently drops every predicate that returns a truthy non-boolean, including \`filter(Boolean)\`.

**Say it:** "Filter keeps the same element references under a truthiness test — the array is new, the objects aren't, and that distinction is where post-filter mutation bugs come from."`,
    tests: [
      { it: 'filters evens', run: 'myFilter([1,2,3,4], function(x){ return x % 2 === 0 })', expected: [2, 4] },
      { it: 'empty array yields empty array', run: 'myFilter([], function(){ return true })', expected: [] },
      { it: 'no matches yields empty array', run: 'myFilter([1, 3, 5], function(x){ return x > 10 })', expected: [] },
      { it: 'truthiness, not === true (filter(Boolean) idiom)', run: 'myFilter([0, 1, "", "a", null], Boolean)', expected: [1, 'a'] },
      { it: 'passes the index for positional filtering', run: 'myFilter(["a","b","c","d"], function(x, i){ return i % 2 === 0 })', expected: ['a', 'c'] },
    ],
    hints: ['Loop and check predicate', 'Push only when truthy', 'Return new array (immutable)'],
  },
  {
    id: 61,
    title: 'Array.reduce manually',
    category: 'JS ES5',
    difficulty: 'hard',
    timeEstimate: '15 min',
    prompt: `Implement your own version of \`Array.prototype.reduce\` as \`myReduce(arr, callback, initialValue)\`.
Handle both arities correctly:
1. With an initial value — even an explicit \`undefined\` counts as provided (detect via \`arguments.length\`, not \`=== undefined\`)
2. Without one — the first element seeds the accumulator and iteration starts at index 1
3. Empty array with no initial value must throw a TypeError (per spec)`,
    starterCode: `function myReduce(arr, callback, initialValue) {
  // Your code here
  return initialValue
}`,
    solution: `function myReduce(arr, callback, initialValue) {
  var hasInit = arguments.length >= 3
  if (!hasInit && arr.length === 0) {
    throw new TypeError('Reduce of empty array with no initial value')
  }
  var accumulator = hasInit ? initialValue : arr[0]
  for (var i = hasInit ? 0 : 1; i < arr.length; i++) {
    accumulator = callback(accumulator, arr[i], i, arr)
  }
  return accumulator
}`,
    explanation: `Reduce is the hardest of the trio because its contract has a genuine subtlety: "no initial value" and "initial value is \`undefined\`" are **different calls** that must behave differently. The spec distinguishes them by argument count, so the implementation checks \`arguments.length >= 3\` — not \`initialValue === undefined\`, which conflates the two and is precisely the bug this challenge's fourth test catches. Passing \`undefined\` explicitly means "seed the accumulator with undefined and run the callback from index 0"; omitting it means "the first element is the seed, start at index 1."

The two arities cascade through the whole function: seed selection (\`initialValue\` vs \`arr[0]\`), loop start (0 vs 1), and the edge case — an empty array with no seed has nothing to return, so the spec mandates a \`TypeError\`. Throwing there isn't defensive over-engineering; silently returning \`undefined\` turns a caller's bug into corrupted downstream data. This is the same declared-vs-assigned distinction that runs through JavaScript (hoisting, missing keys vs undefined values in deepEqual) — sensing when \`undefined\` is a value versus an absence is a recurring senior tell.

Practical guidance to volunteer: always pass an initial value in application code — it makes empty inputs safe and the accumulator type explicit.

**Red flag:** \`var acc = initialValue !== undefined ? initialValue : arr[0]\`. It passes the happy-path tests and misfires on both explicit-undefined seeds and any array whose reduction legitimately produces undefined.

**Say it:** "I detect the seed by arity — arguments.length, never an undefined check — because omitted and explicitly-undefined are different contracts, and empty-plus-no-seed throws per spec."`,
    tests: [
      { it: 'sums with initial value', run: 'myReduce([1,2,3], function(a,b){ return a+b }, 0)', expected: 6 },
      { it: 'sums without initial value (first element seeds)', run: 'myReduce([1,2,3], function(a,b){ return a+b })', expected: 6 },
      { it: 'empty array with initial returns initial', run: 'myReduce([], function(a,b){ return a+b }, 42)', expected: 42 },
      { it: 'explicit undefined counts as an initial value', run: 'myReduce([5], function(){ return "called" }, undefined)', expected: 'called' },
      { it: 'empty array with no initial throws TypeError', run: '(() => { try { myReduce([], function(a,b){ return a+b }) } catch (e) { return e instanceof TypeError ? "TypeError" : "wrong error" } return "no throw" })()', expected: 'TypeError' },
    ],
    hints: ['arguments.length tells you if a seed was passed — undefined checks cannot', 'No seed: arr[0] is the accumulator, loop from index 1', 'Empty array + no seed = TypeError, per spec'],
  },
  {
    id: 62,
    title: 'typeof vs instanceof',
    category: 'JS ES5',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Write \`typeChecker(value)\` returning a string describing the value's type.
It must return 'null' for null (not 'object'), 'array' for arrays, 'date' for Date instances,
and fall back to \`typeof\` for everything else.`,
    starterCode: `function typeChecker(value) {
  // Your code here
  return ''
}`,
    solution: `function typeChecker(value) {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  if (value instanceof Date) return 'date'
  return typeof value
}`,
    explanation: `This challenge exists because JavaScript's two type operators answer different questions and each has a famous blind spot — reliable runtime type checks are built by ordering guards around both. \`typeof\` reports the primitive category and is safe on anything (including undeclared names), but it lies twice: \`typeof null === 'object'\` — a bug from the first JavaScript implementation, now permanently spec'd because fixing it would break the web — and every object, arrays included, is just \`'object'\`. \`instanceof\` walks the prototype chain, so it distinguishes object flavors, but it can't handle primitives and it's identity-based: an object from another realm (an iframe, a worker boundary, some serialization layers) was built by a *different* \`Array\` constructor, so \`instanceof Array\` returns false on a perfectly good array.

The guard order in the solution encodes all of that. \`null\` first, by strict equality, before anything that would misreport it. \`Array.isArray\` next — it checks the internal class rather than the prototype chain, which is exactly why it's cross-realm safe and the canonical array test. \`instanceof Date\` for the remaining object flavor we care about. \`typeof\` as the fallback where it's trustworthy: primitives, functions, \`undefined\`. And note \`typeChecker(NaN)\` returns \`'number'\` — correctly, since NaN is a number value per IEEE 754.

**Red flag:** \`value instanceof Array\`. It works until data crosses a realm boundary, and "why is this array not an array" is a genuinely miserable production debug.

**Say it:** "typeof lies about null and flattens objects; instanceof fails across realms — so I check null by equality, arrays with Array.isArray, and fall back to typeof only for primitives."`,
    tests: [
      { it: 'array returns "array"', run: 'typeChecker([1,2,3])', expected: 'array' },
      { it: 'null returns "null", not "object"', run: 'typeChecker(null)', expected: 'null' },
      { it: 'Date returns "date"', run: 'typeChecker(new Date())', expected: 'date' },
      { it: 'plain object falls through to typeof', run: 'typeChecker({})', expected: 'object' },
      { it: 'NaN is still a number (IEEE 754)', run: 'typeChecker(NaN)', expected: 'number' },
      { it: 'undefined returns "undefined"', run: 'typeChecker(undefined)', expected: 'undefined' },
    ],
    hints: ['typeof null returns "object" — special case it first', 'Array.isArray for arrays (cross-realm safe)', 'instanceof for Date'],
  },
]
