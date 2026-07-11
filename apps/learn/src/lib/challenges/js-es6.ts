import type { Challenge } from '../challenges'

export const jsEs6Challenges: Challenge[] = [
  // ─── JS ES6+ (63–70) ───
  {
    id: 63,
    title: 'Promise chain',
    category: 'JS ES6+',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Create a promise chain that:
1. Fetches a user (simulated: resolve with {id:1, name:'Alice'})
2. Then fetches their posts (simulated: resolve with ['post1', 'post2'])
Log each step. Assign the chain to \`const chain\`.`,
    starterCode: `function fetchUser() {
  return Promise.resolve({ id: 1, name: 'Alice' })
}

function fetchPosts(userId) {
  return Promise.resolve(['post1', 'post2'])
}

// Chain them
const chain = fetchUser()
  // Your code here`,

    solution: `function fetchUser() {
  return Promise.resolve({ id: 1, name: 'Alice' })
}

function fetchPosts(userId) {
  return Promise.resolve(['post1', 'post2'])
}

const chain = fetchUser()
  .then(user => {
    console.log('User:', user)
    return fetchPosts(user.id)
  })
  .then(posts => console.log('Posts:', posts))`,
    explanation: `Chaining exists to keep sequential async work **flat** — the alternative is nesting each request inside the previous callback, which is exactly the pyramid promises were invented to kill. The mechanics that make it work: every \`.then\` returns a **new** promise, and what you return from the callback decides what that promise resolves with. Return a plain value and it's wrapped; return a promise — \`return fetchPosts(user.id)\` — and the chain *adopts* it, so the next \`.then\` waits for the posts request to settle. That one \`return\` is the whole exercise: drop it and the second \`.then\` fires immediately with \`undefined\`, a bug that type-checks and only surfaces at runtime.

The other structural win is error handling: a single \`.catch()\` appended to the end observes a rejection from *any* step, because rejections propagate down the chain until something handles them. Nested callbacks need per-level handling; a flat chain needs one.

**Red flag:** nesting \`.then\` inside \`.then\` (\`fetchUser().then(u => { fetchPosts(u.id).then(...) })\`). It works, but it recreates callback hell, orphans the inner promise from the outer chain, and means the trailing \`.catch\` never sees the inner failure. Interviewers read it as "uses promises, doesn't understand them."

**Say it:** "Every .then returns a new promise; returning the next async call from the callback is what sequences the chain, and one .catch at the end observes a failure from any step."`,
    tests: [
      { it: 'fetchUser returns a promise', run: 'typeof fetchUser().then', expected: 'function' },
      { it: 'the chain itself is a promise', run: 'chain instanceof Promise', expected: true },
      { it: 'chain exposes then for further composition', run: 'typeof chain.then', expected: 'function' },
      { it: 'chains with .then and returns the next fetch', check: ['.then', 'return fetchPosts'] },
    ],
    hints: ['Return the next promise from .then()', 'Chain .then() calls sequentially — each returns a new promise', 'One .catch at the end covers every step'],
  },
  {
    id: 64,
    title: 'Promise.all for parallel requests',
    category: 'JS ES6+',
    difficulty: 'medium',
    timeEstimate: '5 min',
    prompt: `Use Promise.all to fetch two users in parallel and return a promise of an array of their names.
Simulate with Promise.resolve.`,
    starterCode: `function fetchUser(id) {
  return Promise.resolve({ id, name: id === 1 ? 'Alice' : 'Bob' })
}

function getUsers() {
  // Use Promise.all here
  return Promise.all([])
}`,
    solution: `function fetchUser(id) {
  return Promise.resolve({ id, name: id === 1 ? 'Alice' : 'Bob' })
}

function getUsers() {
  return Promise.all([fetchUser(1), fetchUser(2)])
    .then(([user1, user2]) => [user1.name, user2.name])
}`,
    explanation: `\`Promise.all\` is about **when work starts**, not how it's awaited. Both \`fetchUser\` calls execute immediately when the array literal is built — the requests are already in flight before \`Promise.all\` ever sees them. The combinator just aggregates settlement: it resolves with results in **input order** (not settlement order — index preservation is guaranteed even if the second request finishes first) and rejects **fast** with the first error, dropping the other results.

That fail-fast semantic is a choice, and the senior move is naming the family it belongs to: \`all\` for interdependent results (one failure invalidates the screen), \`allSettled\` when partial success is acceptable (independent batch operations — it never rejects, returning \`{status, value|reason}\` records), \`race\` for timeout patterns, \`any\` for redundant sources where the first fulfillment wins. Picking \`all\` when \`allSettled\` fits turns one failed request into a blank screen.

**Red flag:** \`const a = await fetchUser(1); const b = await fetchUser(2)\` — sequential awaits serialize independent requests into an N-round-trip waterfall. Same total code, double the latency. The parallel form starts both promises first and only then awaits.

**Say it:** "Promise.all preserves input order and fails fast on the first rejection — I choose the combinator by failure semantics: all when results are interdependent, allSettled when partial success is fine, race for timeouts."`,
    tests: [
      { it: 'getUsers returns a promise', run: 'getUsers() instanceof Promise', expected: true },
      { it: 'result is thenable for composition', run: 'typeof getUsers().then', expected: 'function' },
      { it: 'fetchUser resolves per id', run: 'typeof fetchUser(2).then', expected: 'function' },
      { it: 'uses Promise.all and maps to names with .then', check: ['Promise.all', '.then'] },
    ],
    hints: ['Promise.all takes an array of promises — the calls start when the array is built', 'Results arrive in input order, not settlement order', 'Rejects fast if any input rejects — allSettled if partial success is OK'],
  },
  {
    id: 65,
    title: 'Async/await error handling',
    category: 'JS ES6+',
    difficulty: 'medium',
    timeEstimate: '5 min',
    prompt: `Write an async function getUser(id) that awaits fetchUserData(id) (provided — it rejects for id <= 0)
and uses try/catch for error handling. If the fetch fails, return a default object { name: 'Guest' }.`,
    starterCode: `function fetchUserData(id) {
  return id > 0
    ? Promise.resolve({ id, name: 'Alice' })
    : Promise.reject(new Error('Not found'))
}

async function getUser(id) {
  // Your code here
  return null
}`,
    solution: `function fetchUserData(id) {
  return id > 0
    ? Promise.resolve({ id, name: 'Alice' })
    : Promise.reject(new Error('Not found'))
}

async function getUser(id) {
  try {
    const data = await fetchUserData(id)
    return data
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return { name: 'Guest' }
  }
}`,
    explanation: `The real ergonomic win of \`async/await\` is that **try/catch unifies the sync and async failure paths** — one construct handles a thrown error and a rejected promise identically, replacing the \`.catch()\` chains where errors sail past handlers attached at the wrong level. Under the hood nothing changed about concurrency: an \`async\` function *always* returns a promise (returned values are wrapped in a fulfillment, thrown errors become rejections), and each \`await\` suspends the function, yielding to the event loop; the continuation is scheduled as a microtask when the awaited promise settles. Historically this was transpiled as exactly a generator plus a driver loop calling \`next()\` with each resolved value — "await is a yield the engine resumes for you" is the accurate mental model.

Returning \`{ name: 'Guest' }\` from the \`catch\` is a deliberate contract: callers always get a user-shaped object, so the failure is absorbed at the boundary that knows the fallback, not re-thrown for every caller to handle.

**Red flag:** believing \`try/catch\` around a real \`fetch\` handles server errors. \`fetch\` rejects **only on network failure** — an HTTP 404 or 500 *resolves*, so without a \`response.ok\` check, failed API calls are silently treated as success and your catch block never runs.

**Say it:** "An async function always returns a promise — throws become rejections — and await suspends into a microtask continuation, so try/catch gives me one error path for sync and async failures alike."`,
    tests: [
      { it: 'returns a promise on success path', run: 'typeof getUser(1).then', expected: 'function' },
      { it: 'failure path still returns a promise (caught internally)', run: 'getUser(0) instanceof Promise', expected: true },
      { it: 'fetchUserData resolves for valid ids', run: 'typeof fetchUserData(1).then', expected: 'function' },
      { it: 'uses try/catch around await', check: ['try', 'await', 'catch'] },
    ],
    hints: ['try/catch around the await — rejection becomes a catchable throw', 'Return the fallback object from catch so callers get one shape', 'An async function always returns a Promise, even when it throws'],
  },
  {
    id: 66,
    title: 'Async generator with for-await-of',
    category: 'JS ES6+',
    difficulty: 'hard',
    timeEstimate: '10 min',
    prompt: `Create an async generator that yields numbers 1 to 5 with a short delay (50 ms) between each.
Write consume() that collects them with for-await-of and returns the array.`,
    starterCode: `async function* numberGenerator() {
  // Your code here
}

async function consume() {
  // Your code here
}`,
    solution: `async function* numberGenerator() {
  for (let i = 1; i <= 5; i++) {
    await new Promise(r => setTimeout(r, 50))
    yield i
  }
}

async function consume() {
  const results = []
  for await (const num of numberGenerator()) {
    results.push(num)
  }
  return results
}`,
    explanation: `Async generators are **pull-based streams**: the consumer decides when to ask for the next value, so backpressure is built in — the producer does no work until \`next()\` is called. That's the natural shape for paginated APIs: yield each page as it arrives, and the consumer stops pulling when it has enough, so page 7 is never fetched if the caller breaks after page 2. Compare that to eagerly fetching everything and filtering afterwards.

Mechanics: \`async function*\` combines both protocols — each \`next()\` returns a **promise** of \`{value, done}\`, and \`for await...of\` is the loop that awaits each one in sequence. The generator body reads synchronously top-to-bottom while actually suspending twice per iteration: once at \`await\` (the delay), once at \`yield\` (waiting for the consumer to pull again). The protocol also includes \`return()\` — \`for await...of\` calls it when you \`break\`, so a \`finally\` block in the generator runs for cleanup (close the connection, abort the request). That cleanup guarantee is what makes generators safer than hand-rolled iterator objects.

**Red flag:** fetching all pages with \`Promise.all\` and then yielding them. It "works" but destroys the two things the pattern exists for — laziness and bounded memory — and signals you reached for a familiar tool instead of understanding the streaming contract.

**Say it:** "An async generator is a pull-based stream — next() returns a promise of {value, done}, the consumer controls pacing, and for-await-of calls return() on break so my finally cleanup always runs."`,
    tests: [
      { it: 'numberGenerator returns a stepper object', run: 'typeof numberGenerator().next', expected: 'function' },
      { it: 'next() returns a promise (async protocol)', run: '(() => { const g = numberGenerator(); return typeof g.next().then })()', expected: 'function' },
      { it: 'generator is async-iterable', run: '(() => { const g = numberGenerator(); return typeof g[Symbol.asyncIterator] })()', expected: 'function' },
      { it: 'consume returns a promise of the results', run: 'typeof consume().then', expected: 'function' },
      { it: 'uses async generator syntax and for-await-of', check: ['async function*', 'yield', 'for await'] },
    ],
    hints: ['async function* declares an async generator', 'await the delay, then yield i — two suspension points per loop', 'for await (const x of gen()) consumes it; break triggers generator cleanup'],
  },
  {
    id: 67,
    title: 'Destructuring and default params',
    category: 'JS ES6+',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Create a function createUser that takes an object with name and email,
with defaults: { name: 'Anonymous', email: 'unknown@example.com' }.
Use destructuring in the function signature. Calling createUser() with no arguments must also work.`,
    starterCode: `function createUser(/* destructure with defaults */) {
  return { name, email }
}`,
    solution: `function createUser({ name = 'Anonymous', email = 'unknown@example.com' } = {}) {
  return { name, email }
}`,
    explanation: `This one-liner is really an API-design question: a destructured options object gives you **named, order-independent, individually defaultable parameters** — the reason nearly every modern library takes \`(options)\` instead of five positional arguments. The signature does two distinct jobs, and interviewers check that you know they're different.

Per-property defaults (\`name = 'Anonymous'\`) fire only when the property is **\`undefined\`** — a missing key or an explicit \`undefined\`. They do *not* fire for \`null\`, \`''\`, or \`0\`; \`createUser({ name: null })\` returns \`{ name: null }\`. That's a feature: default parameters distinguish "not provided" from "provided as empty," which \`name || 'Anonymous'\` cannot.

The outer \`= {}\` is the part juniors miss. Destructuring is an operation *on a value* — destructuring \`undefined\` throws \`TypeError: Cannot destructure property\`. Without the outer default, \`createUser()\` with no argument crashes before your first line runs. \`= {}\` substitutes an empty object, every property comes up \`undefined\`, and every inner default engages.

**Red flag:** "fixing" the no-arg crash with \`options = options || {}\` inside the body plus manual property checks. It works, but it reintroduces the falsy-value bug (\`0\` and \`''\` get overwritten) and signals you don't know the signature can express the whole contract.

**Say it:** "Defaults trigger on undefined only — not null or falsy — and the outer = {} exists because destructuring undefined throws, so the no-argument call must have something to destructure."`,
    tests: [
      { it: 'default name works for empty object', run: "createUser({}).name", expected: 'Anonymous' },
      { it: 'no-argument call works (outer default)', run: "createUser().email", expected: 'unknown@example.com' },
      { it: 'provided values win over defaults', run: "createUser({ name: 'Zoe', email: 'z@ex.com' })", expected: { name: 'Zoe', email: 'z@ex.com' } },
      { it: 'partial input mixes provided and default', run: "createUser({ name: 'Zoe' })", expected: { name: 'Zoe', email: 'unknown@example.com' } },
      { it: 'null is NOT replaced by the default (undefined only)', run: "createUser({ name: null }).name", expected: null },
    ],
    hints: ['Destructure in the parameter list: { name = ..., email = ... }', 'Defaults engage on undefined only — null passes through', 'Add = {} after the pattern so createUser() with no args does not throw'],
  },
  {
    id: 68,
    title: 'Spread and rest operators',
    category: 'JS ES6+',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Write a function mergeAndSum that takes any number of arrays (rest param),
flattens them (spread) and returns the sum of all numbers.`,
    starterCode: `function mergeAndSum(...arrays) {
  // Your code here
  return 0
}`,
    solution: `function mergeAndSum(...arrays) {
  const flat = [].concat(...arrays)
  return flat.reduce((sum, n) => sum + n, 0)
}`,
    explanation: `Rest and spread are the same \`...\` token doing opposite jobs, and naming the direction is the point: **rest collects** (variadic arguments into a real array — no more \`arguments\` object, which isn't an array and doesn't exist in arrow functions) and **spread expands** (an iterable into individual elements). Here \`...arrays\` gathers any number of arrays, then \`[].concat(...arrays)\` spreads them back out as separate arguments to \`concat\`, which flattens exactly one level.

The \`reduce\` with an explicit initial value \`0\` is not decoration: without it, \`mergeAndSum()\` on zero arrays would throw \`TypeError: Reduce of empty array with no initial value\`. The empty-input case is the edge interviewers wait for, and the initial value handles it for free.

Two limits worth volunteering: spread is **shallow** — it copies references one level deep, so spreading an array of objects shares the objects — and spreading into a function call materializes every element as an argument, which can overflow the engine's argument limit on very large arrays (\`arr.flat()\` or a loop avoids that).

**Red flag:** saying spread "copies" an array or object without qualifying *shallow*. \`[...state]\` gives a new outer array with the same inner references — mutate a nested object and both copies see it. In React that's the classic "I spread it but the component didn't re-render correctly" bug.

**Say it:** "Rest collects arguments into a real array and spread expands iterables — both are shallow, one level deep, so spreading never deep-clones nested structures."`,
    tests: [
      { it: 'merges and sums', run: 'mergeAndSum([1,2],[3,4],[5])', expected: 15 },
      { it: 'no arguments returns 0 (reduce initial value)', run: 'mergeAndSum()', expected: 0 },
      { it: 'empty arrays contribute nothing', run: 'mergeAndSum([], [7], [])', expected: 7 },
      { it: 'single array works', run: 'mergeAndSum([1, 2, 3])', expected: 6 },
      { it: 'uses rest/spread and reduce', check: ['...', '.reduce'] },
    ],
    hints: ['Rest param ...arrays collects all args into a real array', 'Spread into [].concat(...) flattens one level', 'Give reduce an initial value 0 — empty input must not throw'],
  },
  {
    id: 69,
    title: 'Arrow functions and lexical this',
    category: 'JS ES6+',
    difficulty: 'medium',
    timeEstimate: '5 min',
    prompt: `Create an object with a method that uses setTimeout with an arrow function
to preserve the lexical this. Log the object's name after 100ms.`,
    starterCode: `const timer = {
  name: 'Timer',
  delayedHello() {
    // Use arrow function here
    setTimeout(function() {
      console.log(this.name) // This won't work — fix it
    }, 100)
  }
}`,
    solution: `const timer = {
  name: 'Timer',
  delayedHello() {
    setTimeout(() => {
      console.log(this.name)
    }, 100)
  }
}`,
    explanation: `A regular function gets its \`this\` from **how it's called**, and \`setTimeout\` invokes its callback as a plain function — so \`this\` is \`undefined\` in strict mode (or the global object otherwise), and \`this.name\` silently logs \`undefined\`. Arrow functions don't have their own \`this\` at all: they resolve it **lexically**, from the enclosing scope at the point of definition, exactly like closing over a variable. Since the arrow is defined inside \`delayedHello\` — whose \`this\` is \`timer\` when called as \`timer.delayedHello()\` — the callback sees the right object. No \`bind\`, no \`const self = this\`; those are the pre-ES6 workarounds this syntax retired.

The consequence of lexical binding: an arrow's \`this\` is fixed forever — \`call\`, \`apply\`, and \`bind\` cannot rebind it. Arrows also lack their own \`arguments\` and can't be constructors. That's why they're perfect as **callbacks** and wrong as anything that needs a dynamic \`this\`.

**Red flag:** "fixing" the bug by making the *method itself* an arrow — \`delayedHello: () => { ... }\`. Now the method's \`this\` is the enclosing module scope, not \`timer\`, and the bug is back one level up. The rule: method shorthand for the method (needs dynamic \`this\`), arrow for the callback inside it.

**Say it:** "Arrow functions have no own this — they capture it lexically at definition and can never be rebound — so I use method shorthand for the method and an arrow for the callback inside it."`,
    tests: [
      { it: 'name is Timer', run: 'timer.name', expected: 'Timer' },
      { it: 'delayedHello is a method', run: 'typeof timer.delayedHello', expected: 'function' },
      { it: 'callback logs the object name (lexical this)', run: "(() => { const logs = []; const origLog = console.log; const origST = globalThis.setTimeout; console.log = (...a) => logs.push(a.join(' ')); globalThis.setTimeout = (fn) => { fn(); return 0 }; timer.delayedHello(); globalThis.setTimeout = origST; console.log = origLog; return logs[0] })()", expected: 'Timer' },
      { it: 'uses an arrow function callback', check: ['=>', 'setTimeout'] },
    ],
    hints: ['Arrow functions inherit this from the enclosing scope at definition', 'Regular function callbacks get their own this — undefined in strict mode', 'Keep the method as shorthand; only the setTimeout callback becomes an arrow'],
  },
  {
    id: 70,
    title: 'Map, filter, reduce chaining',
    category: 'JS ES6+',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Given const numbers = [1, 2, 3, 4, 5, 6, 7], chain map, filter, and reduce to:
1. Double each number (map)
2. Keep only numbers > 5 (filter)
3. Sum the result (reduce)
Assign the answer to \`const result\`.`,
    starterCode: `const numbers = [1, 2, 3, 4, 5, 6, 7]

const result = numbers
  // Your chain here`,

    solution: `const numbers = [1, 2, 3, 4, 5, 6, 7]

const result = numbers
  .map(n => n * 2)
  .filter(n => n > 5)
  .reduce((sum, n) => sum + n, 0)`,

    explanation: `The chain works because \`map\` and \`filter\` each return a **new array** without touching the source — that non-mutation is what makes the pipeline composable and is the same contract React state updates depend on. Each stage does one thing: transform, select, aggregate. A reviewer can verify each line independently, which is the honest argument for this style over a hand-rolled loop that interleaves all three concerns.

Trace it, because interviewers make you: doubling gives \`[2,4,6,8,10,12,14]\`; filtering \`> 5\` keeps \`[6,8,10,12,14]\` — note 6 and 14 both survive, the two values people drop — and the sum is **50**. The \`reduce\` initial value \`0\` matters twice: it makes an empty filtered result return \`0\` instead of throwing, and it makes the accumulator's type explicit.

Know the cost you're paying: three passes and two intermediate arrays. For UI-sized data that's noise; in a hot path over large data (a React Native list transform running per render), collapsing into a single \`reduce\` — or better, memoizing so it doesn't rerun at all — is the senior answer. Say the trade-off before the interviewer asks.

**Red flag:** omitting \`reduce\`'s initial value. It "works" on this array by using the first element as the seed, but it throws on an empty array and skips your callback for index 0 — a latent production bug that passes the happy-path test.

**Say it:** "map and filter return new arrays, so the chain is pure and composable — I pay two intermediate allocations for readability, and I collapse to a single pass only when profiling says it matters."`,
    tests: [
      { it: 'result is 50', run: 'result', expected: 50 },
      { it: 'source array is not mutated', run: 'numbers', expected: [1, 2, 3, 4, 5, 6, 7] },
      { it: 'source length unchanged', run: 'numbers.length', expected: 7 },
      { it: 'uses the map → filter → reduce chain', check: ['.map', '.filter', '.reduce'] },
    ],
    hints: ['Chain methods in sequence — each returns a new array', 'Double first, then filter > 5: 6 and 14 both survive', 'Give reduce an initial value 0 so empty input cannot throw'],
  },
]
