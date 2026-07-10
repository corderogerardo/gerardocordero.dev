import type { Challenge } from '../challenges'

// ─── Senior Practice (136–147) — deep, multi-case, mentor-explained ───
export const seniorPracticeChallenges: Challenge[] = [
  {
    id: 139,
    title: 'Debounce with leading edge and cancel',
    category: 'JS ES6+',
    difficulty: 'medium',
    timeEstimate: '15 min',
    prompt: `Implement \`debounce(fn, wait, options)\`:
1. Trailing by default: \`fn\` runs once, \`wait\` ms after the **last** call
2. \`{ leading: true }\`: \`fn\` fires immediately on the first call, then ignores calls until quiet
3. The returned function exposes \`.cancel()\` to drop any pending invocation
4. Arguments and \`this\` of the last call are forwarded to \`fn\`

This is the search-box / resize-handler primitive — write it like you'd ship it.`,
    starterCode: `function debounce(fn, wait, options = {}) {
  // Your code here
}`,
    solution: `function debounce(fn, wait, { leading = false } = {}) {
  let timer = null
  function debounced(...args) {
    const callNow = leading && timer === null
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      if (!leading) fn.apply(this, args)
    }, wait)
    if (callNow) fn.apply(this, args)
  }
  debounced.cancel = () => {
    clearTimeout(timer)
    timer = null
  }
  return debounced
}`,
    explanation: `Debounce exists to convert a **stream of events into one decision** — without it, a search box fires a request per keystroke and the last response to arrive (not the last query typed) wins the race. That's the why an interviewer wants first; the timer mechanics are secondary.

The design decisions that read as senior:
- **The timer variable is the entire state machine.** \`timer === null\` means "quiet period over" — that one check implements the leading edge. No booleans, no timestamps.
- **\`.cancel()\` is not optional polish.** In React, a debounced callback that survives unmount calls \`setState\` on a dead component. The cleanup story (\`useEffect\` return calling \`.cancel()\`) is part of the API, which is why lodash and use-debounce both ship it.
- **\`fn.apply(this, args)\`** forwards the *last* call's arguments — with a plain \`fn()\` the search box debounces correctly but searches for an empty string.

**Red flag:** confusing debounce with throttle. Debounce = "wait for silence" (search input); throttle = "at most once per interval" (scroll position). Saying "I'd debounce the scroll handler" ships a UI that only updates when the user *stops* scrolling.

**Say it:** "Debounce collapses a burst of events into the final one after quiet time; the leading option trades freshness for immediacy, and cancel is what makes it safe to use inside a component lifecycle."`,
    tests: [
      { it: 'returns a function', run: 'typeof debounce(() => {}, 100)', expected: 'function' },
      { it: 'exposes .cancel()', run: 'typeof debounce(() => {}, 100).cancel', expected: 'function' },
      { it: 'trailing mode does not fire synchronously', run: '(() => { let n = 0; const d = debounce(() => n++, 1000); d(); d(); return n })()', expected: 0 },
      { it: 'leading mode fires exactly once immediately', run: '(() => { let n = 0; const d = debounce(() => n++, 1000, { leading: true }); d(); d(); d(); return n })()', expected: 1 },
      { it: 'trailing edge fires once, with the last call\'s args and this', run: '(() => { const rs = globalThis.setTimeout, rc = globalThis.clearTimeout; let cb = null; globalThis.setTimeout = f => { cb = f; return 1 }; globalThis.clearTimeout = () => { cb = null }; try { const calls = []; const d = debounce(function (x) { calls.push([this && this.tag, x]) }, 100); d.call({ tag: "a" }, 1); d.call({ tag: "b" }, 2); const before = calls.length; if (cb) cb(); return [before, calls.length, calls[0] && calls[0][1], calls[0] && calls[0][0]] } finally { globalThis.setTimeout = rs; globalThis.clearTimeout = rc } })()', expected: [0, 1, 2, 'b'] },
      { it: '.cancel() drops the pending trailing call', run: '(() => { const rs = globalThis.setTimeout, rc = globalThis.clearTimeout; let cb = null; globalThis.setTimeout = f => { cb = f; return 1 }; globalThis.clearTimeout = () => { cb = null }; try { let n = 0; const d = debounce(() => { n++ }, 100); d(); d.cancel(); if (cb) cb(); return n } finally { globalThis.setTimeout = rs; globalThis.clearTimeout = rc } })()', expected: 0 },
      { it: 'uses clearTimeout to reset the quiet period', check: ['clearTimeout'] },
    ],
    hints: [
      'One `timer` variable is enough state — null means "not waiting"',
      'Leading edge: call fn when timer is null, then start the timer anyway',
      'cancel = clearTimeout + reset timer to null',
    ],
  },
  {
    id: 140,
    title: 'Predict the event-loop order',
    category: 'JS ES5',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Given this snippet, write \`predictOrder()\` returning the labels in the exact order they log:

\`\`\`js
log('A')
setTimeout(() => log('B'), 0)
Promise.resolve().then(() => log('C'))
Promise.resolve().then(() => {
  log('D')
  setTimeout(() => log('E'), 0)
})
log('F')
\`\`\`

Return an array of strings. No guessing — reason through sync → microtasks → macrotasks.`,
    starterCode: `function predictOrder() {
  // Your code here — return the labels in output order
  return []
}`,
    solution: `function predictOrder() {
  // 1. Synchronous code runs to completion: A, F
  // 2. Microtask queue drains fully: C, D (D enqueues a NEW macrotask E)
  // 3. Macrotasks run one per tick, oldest first: B, then E
  return ['A', 'F', 'C', 'D', 'B', 'E']
}`,
    explanation: `This ordering question is the fastest senior/junior separator in JavaScript interviews because it tests the **model**, not memorization: the call stack runs to completion, then the engine drains the **entire microtask queue**, and only then takes **one** macrotask — and repeats.

Walk it like a mentor would:
1. **Sync first, always.** \`A\` and \`F\` print before any callback — nothing asynchronous can interleave with running synchronous code. JavaScript's single thread is a guarantee, not a limitation, here.
2. **Microtasks drain completely.** Both \`.then\` callbacks (\`C\`, \`D\`) run before *any* \`setTimeout\`, even though the timeouts were scheduled earlier. Priority beats scheduling order.
3. **Macrotasks go one per tick.** \`B\` was enqueued during sync execution; \`E\` was enqueued while draining microtasks — so \`B\` precedes \`E\`.

The React Native tie-in that earns points: the bridge and \`InteractionManager\` live on this same loop — a long microtask chain (e.g. a \`.then\` that synchronously processes a huge JSON payload) starves timers and touch responsiveness exactly like a long sync block does.

**Red flag:** saying "setTimeout 0 runs immediately after the current line." It runs after sync code *and after every pending microtask* — and never sooner than the next tick.

**Say it:** "Sync runs to completion, the microtask queue drains fully, then one macrotask per tick — so promise callbacks always beat timers, and a microtask can starve the loop."`,
    tests: [
      { it: 'predicts the exact order', run: 'predictOrder()', expected: ['A', 'F', 'C', 'D', 'B', 'E'] },
      { it: 'returns all six labels', run: 'predictOrder().length', expected: 6 },
    ],
    hints: [
      'Sync code (A, F) always finishes before any callback runs',
      'ALL microtasks (.then) run before ANY macrotask (setTimeout)',
      'E is enqueued during microtask processing — after B was already queued',
    ],
  },
  {
    id: 141,
    title: 'deepEqual from scratch',
    category: 'JS ES5',
    difficulty: 'hard',
    timeEstimate: '20 min',
    prompt: `Implement \`deepEqual(a, b)\` — structural equality:
1. Primitives compare by value; \`NaN\` equals \`NaN\` (unlike \`===\`)
2. Arrays: same length, elements deep-equal in order
3. Plain objects: same key set (an explicit \`undefined\` value still counts as a key), values deep-equal
4. \`null\` equals only \`null\` — remember \`typeof null === 'object'\`
5. No JSON.stringify — it lies about key order, undefined, and NaN`,
    starterCode: `function deepEqual(a, b) {
  // Your code here
}`,
    solution: `function deepEqual(a, b) {
  // Fast path — also handles primitives and reference-equal objects
  if (a === b) return true
  // NaN is the only value !== itself
  if (Number.isNaN(a) && Number.isNaN(b)) return true
  // null check before typeof: typeof null === 'object'
  if (a === null || b === null) return false
  if (typeof a !== 'object' || typeof b !== 'object') return false
  if (Array.isArray(a) !== Array.isArray(b)) return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  return keysA.every(key =>
    Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key])
  )
}`,
    explanation: `Interviewers ask for deepEqual because the naive answer — \`JSON.stringify(a) === JSON.stringify(b)\` — fails in exactly the ways that matter in production: key order changes the string, \`undefined\` values vanish, \`NaN\` becomes \`null\`, and a Date silently becomes a string. Naming those failures *before* writing code is the senior move.

What the reference solution encodes:
- **\`a === b\` first** is both the primitive comparison and a reference-equality fast path — comparing an object to itself costs O(1), which matters when this runs in a memoized selector.
- **The null guard sits before \`typeof\`** because \`typeof null === 'object'\` is a 30-year-old bug you're expected to know by name.
- **Key-count comparison + \`hasOwnProperty\`** catches both extra keys and inherited keys. Using \`b[key] !== undefined\` as an existence check is the classic subtle bug — it conflates "missing" with "present but undefined".
- Scope honestly: this doesn't handle \`Date\`, \`Map\`/\`Set\`, RegExp, or **cycles** (a cyclic structure recurses forever — production versions carry a \`WeakMap\` of visited pairs). Saying "I'd add a WeakMap for cycles" unprompted is a strong signal.

The React connection: this is what \`React.memo\`'s comparator *could* do but deliberately doesn't — deep comparison costs O(tree size) per render, which is why React bets on shallow equality plus immutable updates instead.

**Say it:** "I check reference equality first, handle NaN and null explicitly, then compare key sets recursively — and I'd flag that cycles need a WeakMap and that this cost is exactly why React chose shallow comparison."`,
    tests: [
      { it: 'nested structures compare by value', run: 'deepEqual({ a: [1, 2, { b: 3 }] }, { a: [1, 2, { b: 3 }] })', expected: true },
      { it: 'NaN equals NaN', run: 'deepEqual(NaN, NaN)', expected: true },
      { it: 'extra key on one side fails', run: 'deepEqual({ a: 1 }, { a: 1, b: 2 })', expected: false },
      { it: 'array order matters', run: 'deepEqual([1, 2], [2, 1])', expected: false },
      { it: 'null is not an empty object', run: 'deepEqual(null, {})', expected: false },
      { it: 'array is not an object with same keys', run: 'deepEqual([1], { 0: 1 })', expected: false },
    ],
    hints: [
      'a === b first: primitives AND reference-equal objects in one line',
      'Number.isNaN for the NaN case; null check BEFORE typeof object',
      'Compare Object.keys lengths, then recurse per key with hasOwnProperty',
    ],
  },
  {
    id: 142,
    title: 'LRU cache with Map',
    category: 'JS ES6+',
    difficulty: 'hard',
    timeEstimate: '20 min',
    prompt: `Implement \`class LRUCache(capacity)\`:
1. \`get(key)\` → value, or \`-1\` if missing; a hit makes the key most-recently-used
2. \`put(key, value)\` → inserts/updates; over capacity evicts the **least**-recently-used entry
3. Both operations O(1)

Hint: a JS \`Map\` remembers insertion order — that's the whole trick.`,
    starterCode: `class LRUCache {
  constructor(capacity) {
    // Your code here
  }
  get(key) {}
  put(key, value) {}
}`,
    solution: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.map = new Map()
  }
  get(key) {
    if (!this.map.has(key)) return -1
    // refresh recency: delete + re-insert moves the key to the "newest" end
    const value = this.map.get(key)
    this.map.delete(key)
    this.map.set(key, value)
    return value
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key)
    this.map.set(key, value)
    if (this.map.size > this.capacity) {
      // Map iterates in insertion order — first key is the LRU
      const oldest = this.map.keys().next().value
      this.map.delete(oldest)
    }
  }
}`,
    explanation: `LRU is the interview's favorite cache because the naive answers are all O(n): an array you re-sort, timestamps you scan for the minimum. The senior insight is that **JS \`Map\` preserves insertion order and supports O(1) delete** — so "recency order" and "insertion order" become the same thing if you re-insert on every touch.

Why this shape:
- **delete + set = move to back.** That two-line idiom is the entire recency bookkeeping. In a language without ordered maps you'd hand-roll a doubly-linked list over a hash map — worth *saying* in the interview, because it shows you know what Map is doing for you.
- **Eviction reads the first key** via \`map.keys().next().value\` — the iterator's first element is always the stalest entry. No scan.
- **\`put\` on an existing key must delete first**, or the update keeps the old position and a "fresh" key gets evicted as if it were stale.

Where this lands in a React Native app: memory is the constrained resource, and unbounded caches are slow-motion leaks. Image caches, memoized API responses, even \`react-query\`'s garbage collection are LRU-shaped decisions. An unbounded \`Map\` used as a memo cache is the same bug as an uncancelled \`Animated.loop\` — it just OOMs slower.

**Red flag:** storing a \`lastUsed\` timestamp per entry and scanning for the minimum on eviction — it works, but it's O(n) eviction and signals you didn't know the data structure. Name the linked-list-over-hashmap design even if you use Map.

**Say it:** "Map gives me ordered keys with O(1) delete, so delete-and-reinsert is my recency update and the first key is always the eviction victim — same design as a linked hash map, one structure instead of two."`,
    tests: [
      { it: 'get refreshes recency so a stale key is evicted instead', run: "(() => { const c = new LRUCache(2); c.put('a', 1); c.put('b', 2); c.get('a'); c.put('c', 3); return [c.get('a'), c.get('b'), c.get('c')] })()", expected: [1, -1, 3] },
      { it: 'missing keys return -1', run: "(() => { const c = new LRUCache(1); return c.get('nope') })()", expected: -1 },
      { it: 'updating an existing key refreshes value and recency', run: "(() => { const c = new LRUCache(2); c.put('a', 1); c.put('b', 2); c.put('a', 9); c.put('c', 3); return [c.get('a'), c.get('b')] })()", expected: [9, -1] },
      { it: 'capacity 1 keeps only the newest', run: "(() => { const c = new LRUCache(1); c.put('a', 1); c.put('b', 2); return [c.get('a'), c.get('b')] })()", expected: [-1, 2] },
    ],
    hints: [
      'Map iterates in insertion order — first key = least recently used',
      'delete + set again = move key to the newest position',
      'put on an existing key must delete first or its position goes stale',
    ],
  },
  {
    id: 143,
    title: 'curry and compose',
    category: 'JS ES5',
    difficulty: 'medium',
    timeEstimate: '15 min',
    prompt: `Two functional-programming staples:
1. \`curry(fn)\` — collects arguments across calls (\`f(1)(2)\`, \`f(1, 2)\`, \`f(1)(2, 3)\` all work) and invokes \`fn\` once it has \`fn.length\` of them
2. \`compose(...fns)\` — right-to-left composition: \`compose(f, g)(x) === f(g(x))\``,
    starterCode: `function curry(fn) {
  // Your code here
}

function compose(...fns) {
  // Your code here
}`,
    solution: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args)
    return (...more) => curried.apply(this, [...args, ...more])
  }
}

function compose(...fns) {
  return input => fns.reduceRight((acc, fn) => fn(acc), input)
}`,
    explanation: `These two are asked together because they're the same idea from both ends: **treating functions as data**. Curry specializes a function by fixing arguments; compose builds a pipeline out of small functions. Every middleware chain you've used — Redux, Express — is compose wearing a costume.

The parts worth narrating:
- **\`fn.length\` is the arity** — the number of declared parameters — and it's the termination condition. Senior caveat to say out loud: default parameters and rest args don't count toward \`.length\`, so \`curry((a, b = 1) => ...)\` has length 1 and fires early. Curry works on honest signatures.
- **Accumulate, never mutate:** \`[...args, ...more]\` builds a fresh array per partial call, so \`const add2 = add(2)\` can be reused safely — a mutated shared array would make two partials contaminate each other.
- **\`reduceRight\` is right-to-left** because composition reads like math: \`compose(f, g)(x)\` is f(g(x)). If the interviewer asks for \`pipe\`, it's the same body with \`reduce\` — say that instead of writing it twice.

The Redux connection that lands: \`applyMiddleware\` literally composes middlewares, and each middleware's \`store => next => action => ...\` signature *is* a curried function — you're writing this pattern every time you write a middleware, whether you name it or not.

**Say it:** "Curry accumulates arguments until fn.length is satisfied; compose is reduceRight over the functions — and Redux middleware is exactly these two patterns combined."`,
    tests: [
      { it: 'fully curried calls work', run: 'curry((a, b, c) => a + b + c)(1)(2)(3)', expected: 6 },
      { it: 'grouped arguments work', run: 'curry((a, b, c) => a + b + c)(1, 2)(3)', expected: 6 },
      { it: 'all-at-once still works', run: 'curry((a, b) => a * b)(4, 5)', expected: 20 },
      { it: 'compose applies right-to-left', run: 'compose(x => x + 1, x => x * 2)(5)', expected: 11 },
      { it: 'compose with one function is identity-ish', run: 'compose(x => x.toUpperCase())("hey")', expected: 'HEY' },
    ],
    hints: [
      'fn.length = declared parameter count — your stop condition',
      'Recurse with the accumulated args spread into a new array',
      'compose = reduceRight; pipe = reduce. Same body, opposite direction',
    ],
  },
  {
    id: 144,
    title: 'Undo/redo reducer',
    category: 'React',
    difficulty: 'medium',
    timeEstimate: '15 min',
    prompt: `Write \`historyReducer(state, action)\` over the shape \`{ past: [], present, future: [] }\`:
1. \`{ type: 'SET', value }\` — pushes current present onto past, sets new present, **clears future**
2. \`{ type: 'UNDO' }\` — moves present to future, pops the last past entry into present
3. \`{ type: 'REDO' }\` — inverse of UNDO
4. UNDO with empty past / REDO with empty future return state unchanged
5. Pure function — no mutation, no side effects`,
    starterCode: `function historyReducer(state, action) {
  // state: { past: [], present: any, future: [] }
  // Your code here
  return state
}`,
    solution: `function historyReducer(state, action) {
  const { past, present, future } = state
  switch (action.type) {
    case 'SET':
      if (action.value === present) return state
      return { past: [...past, present], present: action.value, future: [] }
    case 'UNDO': {
      if (past.length === 0) return state
      return {
        past: past.slice(0, -1),
        present: past[past.length - 1],
        future: [present, ...future],
      }
    }
    case 'REDO': {
      if (future.length === 0) return state
      const [next, ...rest] = future
      return { past: [...past, present], present: next, future: rest }
    }
    default:
      return state
  }
}`,
    explanation: `Undo/redo is the interview's favorite reducer because it proves you understand *why* reducers must be pure: time travel only works if every state was a **new object** — mutate the past and there's no past to go back to. This is the concrete payoff of immutability, not the abstract lecture version.

Design notes a mentor would flag:
- **The three-field shape (\`past / present / future\`) is the whole design.** Undo and redo become array moves. Candidates who store an index into one array get lost in off-by-ones; candidates who store snapshots inside the present conflate data with history.
- **SET clears \`future\`** — after you undo twice and type something new, redo must die. Branching history (a tree) is the follow-up question; naming that trade-off ("linear history loses the abandoned branch; Photoshop keeps a tree") is a seniority marker.
- **The no-op guards** (\`past.length === 0 → return state\`) aren't just correctness: returning the **same reference** means React/Redux bail out of re-rendering. \`return state\` and \`return { ...state }\` behave identically to your logic and completely differently to React.
- The unchanged-value guard on SET keeps a same-value dispatch from polluting history with duplicates.

This is also \`useReducer\` interview gold: wrap any value in this reducer and you've added undo to a form, a drawing canvas, a filter panel — with zero library code.

**Say it:** "History is past/present/future arrays and every transition builds new objects — which is exactly why reducers must be pure: undo is only possible if the past was never mutated."`,
    tests: [
      { it: 'UNDO returns to the previous value', run: "(() => { let s = { past: [], present: 0, future: [] }; s = historyReducer(s, { type: 'SET', value: 1 }); s = historyReducer(s, { type: 'SET', value: 2 }); s = historyReducer(s, { type: 'UNDO' }); return s.present })()", expected: 1 },
      { it: 'REDO restores what UNDO removed', run: "(() => { let s = { past: [], present: 0, future: [] }; s = historyReducer(s, { type: 'SET', value: 1 }); s = historyReducer(s, { type: 'UNDO' }); s = historyReducer(s, { type: 'REDO' }); return s.present })()", expected: 1 },
      { it: 'SET after UNDO clears the future', run: "(() => { let s = { past: [], present: 0, future: [] }; s = historyReducer(s, { type: 'SET', value: 1 }); s = historyReducer(s, { type: 'UNDO' }); s = historyReducer(s, { type: 'SET', value: 5 }); return s.future.length })()", expected: 0 },
      { it: 'UNDO on empty past is a no-op returning same state', run: "(() => { const s = { past: [], present: 0, future: [] }; return historyReducer(s, { type: 'UNDO' }) === s })()", expected: true },
      { it: 'does not mutate the previous state', run: "(() => { const s = { past: [], present: 0, future: [] }; historyReducer(s, { type: 'SET', value: 1 }); return s.past.length })()", expected: 0 },
    ],
    hints: [
      'Shape: { past: [], present, future: [] } — undo/redo are array moves',
      'SET must clear future — you cannot redo into an abandoned branch',
      'Empty-past UNDO: return state (same reference = render bailout)',
    ],
  },
  {
    id: 145,
    title: 'Normalized entities reducer',
    category: 'React',
    difficulty: 'medium',
    timeEstimate: '15 min',
    prompt: `APIs return arrays; stores want lookup tables. Write \`entitiesReducer(state, action)\` over \`{ byId: {}, allIds: [] }\`:
1. \`{ type: 'ADD', entity }\` — entity has an \`id\`; adds to both structures (ignore if id exists)
2. \`{ type: 'UPDATE', id, changes }\` — shallow-merges changes into the entity (no-op if missing)
3. \`{ type: 'REMOVE', id }\` — removes from both structures
4. Pure — new objects on every change, \`allIds\` preserves insertion order`,
    starterCode: `function entitiesReducer(state, action) {
  // state: { byId: {}, allIds: [] }
  // Your code here
  return state
}`,
    solution: `function entitiesReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { entity } = action
      if (state.byId[entity.id]) return state
      return {
        byId: { ...state.byId, [entity.id]: entity },
        allIds: [...state.allIds, entity.id],
      }
    }
    case 'UPDATE': {
      const existing = state.byId[action.id]
      if (!existing) return state
      return {
        ...state,
        byId: { ...state.byId, [action.id]: { ...existing, ...action.changes } },
      }
    }
    case 'REMOVE': {
      if (!state.byId[action.id]) return state
      const { [action.id]: removed, ...rest } = state.byId
      return { byId: rest, allIds: state.allIds.filter(id => id !== action.id) }
    }
    default:
      return state
  }
}`,
    explanation: `Normalization is the answer to a question juniors don't know they have: "why is updating one item in my list so awkward?" With an array, an update is a \`map\` scan, a lookup is a \`find\` scan, and the same user appearing in two lists means two copies that drift apart. \`byId\` + \`allIds\` makes updates O(1), keeps exactly **one copy of each entity**, and preserves order separately from identity — it's a relational table, which is why Redux Toolkit ships it as \`createEntityAdapter\`.

The moves that read as senior:
- **UPDATE spreads three levels** — state, byId, entity — because immutability isn't "use spread once"; every object *on the path* to the change must be new, and everything off the path must keep its reference. That reference stability is what makes \`memo\`'d list rows skip re-rendering.
- **REMOVE uses destructuring-with-rest** (\`const { [id]: removed, ...rest }\`) to drop a dynamic key without mutating — the idiomatic alternative to \`delete\` on a copy.
- **Guards return the same reference** for no-ops (add-existing, update-missing) so subscribers don't wake up for nothing.

In React Native this pattern has a second payoff: \`FlatList\` wants \`data\` (order) and fast row lookup separately — \`allIds\` *is* your data prop, \`byId\` *is* your row resolver, and an update to one row changes one reference instead of remapping the whole array.

**Red flag:** storing the array and "normalizing later." The migration never happens; every new feature adds another \`.find()\`. Normalize at the reducer boundary — the API shape is the server's concern, the store shape is yours.

**Say it:** "I normalize at the reducer: byId for O(1) identity, allIds for order, spread every object on the update path — same model as createEntityAdapter, and it's what keeps memoized list rows stable."`,
    tests: [
      { it: 'ADD writes to both structures in order', run: "(() => { let s = { byId: {}, allIds: [] }; s = entitiesReducer(s, { type: 'ADD', entity: { id: 'a', name: 'Ada' } }); s = entitiesReducer(s, { type: 'ADD', entity: { id: 'b', name: 'Bo' } }); return [s.allIds, s.byId['a'].name] })()", expected: [['a', 'b'], 'Ada'] },
      { it: 'UPDATE merges changes without losing fields', run: "(() => { let s = { byId: { a: { id: 'a', name: 'Ada', age: 30 } }, allIds: ['a'] }; s = entitiesReducer(s, { type: 'UPDATE', id: 'a', changes: { age: 31 } }); return [s.byId['a'].name, s.byId['a'].age] })()", expected: ['Ada', 31] },
      { it: 'REMOVE cleans both structures', run: "(() => { let s = { byId: { a: { id: 'a' }, b: { id: 'b' } }, allIds: ['a', 'b'] }; s = entitiesReducer(s, { type: 'REMOVE', id: 'a' }); return [s.allIds, 'a' in s.byId] })()", expected: [['b'], false] },
      { it: 'duplicate ADD is a same-reference no-op', run: "(() => { const s0 = { byId: { a: { id: 'a' } }, allIds: ['a'] }; return entitiesReducer(s0, { type: 'ADD', entity: { id: 'a' } }) === s0 })()", expected: true },
      { it: 'UPDATE of a missing id is a no-op', run: "(() => { const s0 = { byId: {}, allIds: [] }; return entitiesReducer(s0, { type: 'UPDATE', id: 'x', changes: {} }) === s0 })()", expected: true },
    ],
    hints: [
      'byId = identity, allIds = order — they change together on ADD/REMOVE',
      'UPDATE: spread state, spread byId, spread the entity — the whole path',
      'Dynamic key removal: const { [id]: _, ...rest } = byId',
    ],
  },
  {
    id: 146,
    title: 'createSelector with memoization',
    category: 'React',
    difficulty: 'hard',
    timeEstimate: '20 min',
    prompt: `Implement Reselect's core: \`createSelector(inputSelectors, combiner)\`:
1. Returns \`selector(state)\` that runs each input selector, then \`combiner(...inputResults)\`
2. If every input result is **reference-equal** (\`===\`) to last time, return the cached combiner result WITHOUT calling the combiner
3. Cache size 1 (like Reselect's default)`,
    starterCode: `function createSelector(inputSelectors, combiner) {
  // Your code here
}`,
    solution: `function createSelector(inputSelectors, combiner) {
  let lastInputs = null
  let lastResult
  return function selector(state) {
    const inputs = inputSelectors.map(sel => sel(state))
    const hit = lastInputs !== null &&
      inputs.length === lastInputs.length &&
      inputs.every((input, i) => input === lastInputs[i])
    if (hit) return lastResult
    lastInputs = inputs
    lastResult = combiner(...inputs)
    return lastResult
  }
}`,
    explanation: `Selectors exist because of an uncomfortable fact: \`state.todos.filter(t => t.done)\` returns a **new array every call**, so a component subscribed to it re-renders on *every* store change — the filter result is equal by value but never by reference. Memoized selectors fix the reference, and this challenge is the entire mechanism in 15 lines.

What to narrate while writing it:
- **The cache key is the input references, not the state object.** Comparing \`state === lastState\` would invalidate on every dispatch (reducers return new roots). Comparing the *extracted slices* means a dispatch that didn't touch \`state.todos\` produces the same \`todos\` reference → cache hit → **same output reference** → subscribed components bail out. The chain "same input refs → skipped combiner → stable output ref" is the whole answer.
- **This is why immutable updates matter**: reference equality is only a meaningful "did it change?" signal if reducers never mutate. Memoized selectors and immutability are two halves of one contract.
- **Cache size 1 is a deliberate trade-off**: selectors are usually called with the latest state repeatedly, so one slot covers the hot path with zero memory management. The moment one selector instance serves many components with different arguments, you need a factory (or Reselect's \`weakMapMemoize\`) — knowing *when* size-1 breaks is the senior part.
- The combiner-call counter in the tests is exactly how you'd prove a selector works in a unit test — recompute count, not output value.

**Red flag:** "I'd just useMemo in the component." useMemo memoizes per component instance; a selector memoizes per store slice across all subscribers, and it composes (selectors as inputs to selectors). They solve different layers.

**Say it:** "The selector caches on input references: unrelated dispatches reuse the slice reference, the combiner is skipped, and the stable output reference is what lets React bail out of re-rendering."`,
    tests: [
      { it: 'combiner runs once for reference-equal inputs', run: "(() => { let calls = 0; const items = [1, 2, 3]; const sel = createSelector([s => s.items], list => { calls++; return list.length }); sel({ items }); sel({ items }); sel({ items, other: 1 }); return calls })()", expected: 1 },
      { it: 'new input reference triggers recompute', run: '(() => { let calls = 0; const sel = createSelector([s => s.items], list => { calls++; return list.length }); sel({ items: [1] }); sel({ items: [1] }); return calls })()', expected: 2 },
      { it: 'returns the combined value', run: '(() => { const sel = createSelector([s => s.a, s => s.b], (a, b) => a + b); return sel({ a: 2, b: 3 }) })()', expected: 5 },
      { it: 'cache hit returns the SAME result reference', run: "(() => { const items = [1, 2]; const sel = createSelector([s => s.items], list => list.map(x => x * 2)); return sel({ items }) === sel({ items }) })()", expected: true },
    ],
    hints: [
      'Store the last input ARRAY and last result in closure variables',
      'Hit = every input === its previous counterpart (reference equality)',
      'On hit, return the cached result — do NOT call the combiner',
    ],
  },
  {
    id: 147,
    title: 'FlatList windowing math',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '15 min',
    prompt: `The math behind \`getItemLayout\` and virtualization, for fixed-height rows:
1. \`makeItemLayout(rowHeight)\` → returns \`(data, index) => ({ length, offset, index })\`
2. \`visibleRange(scrollY, viewportHeight, rowHeight, itemCount)\` → \`{ first, last }\` — the inclusive indexes of rows intersecting the viewport, clamped to \`[0, itemCount - 1]\``,
    starterCode: `function makeItemLayout(rowHeight) {
  // Your code here
}

function visibleRange(scrollY, viewportHeight, rowHeight, itemCount) {
  // Your code here
}`,
    solution: `function makeItemLayout(rowHeight) {
  return (data, index) => ({
    length: rowHeight,
    offset: rowHeight * index,
    index,
  })
}

function visibleRange(scrollY, viewportHeight, rowHeight, itemCount) {
  if (itemCount <= 0) return { first: 0, last: -1 }
  const maxIndex = itemCount - 1
  const first = Math.min(maxIndex, Math.max(0, Math.floor(scrollY / rowHeight)))
  const last = Math.max(0, Math.min(
    maxIndex,
    Math.ceil((scrollY + viewportHeight) / rowHeight) - 1
  ))
  return { first, last }
}`,
    explanation: `This is the arithmetic that makes a 10,000-row list scroll at 60fps, and knowing it cold is what separates "I pass \`getItemLayout\` because the docs said so" from understanding virtualization.

Why each piece exists:
- **Without \`getItemLayout\`, FlatList must render every row above index N to know where N sits.** Async measurement is why \`scrollToIndex\` throws without it and why fast scrolls show blanks. Providing \`offset = rowHeight × index\` turns layout into O(1) math — no rendering, no measurement, instant jumps. That's the real answer to "why does keyExtractor + getItemLayout matter": identity and geometry are the two things the virtualizer can't guess cheaply.
- **\`visibleRange\` is the virtualizer's core loop**: \`floor(scrollY / rowHeight)\` finds the first intersecting row; the last one comes from the viewport's bottom edge — \`ceil\` then \`-1\` because a row that *touches* the bottom edge pixel is still visible. Off-by-one here is exactly the class of bug that shows as a blank strip at the bottom of a fast scroll.
- **The clamps aren't decoration.** Overscroll (iOS bounce) sends negative \`scrollY\`; scroll-to-end sends a bottom edge past the content. Both would index outside the data. Handling the physical world's inputs — bounce, momentum — is the difference between the whiteboard version and the shipping version.
- **The empty list is its own case.** With zero items there is no valid index, so clamping to \`itemCount - 1\` (= \`-1\`) is nonsense. Return an *empty range* — \`{ first: 0, last: -1 }\`, where \`last < first\` means "iterate nothing" — before the arithmetic runs. A list that renders and then empties (filter, search) hits this every time.
- Real FlatList renders \`windowSize\` viewports around this range as a buffer; the math is identical with padding added to both ends.

**Red flag:** claiming \`getItemLayout\` speeds up *rendering*. It doesn't render anything faster — it removes measurement as a dependency for *positioning*, which unlocks scrollToIndex and eliminates layout passes. Precision about what it skips is the seniority signal.

**Say it:** "Fixed row height turns layout into arithmetic: offset is height times index, the visible window is floor and ceil over the scroll edges, clamped for bounce — that's all a virtualized list is doing."`,
    tests: [
      { it: 'item layout is height × index', run: 'makeItemLayout(80)(null, 5)', expected: { length: 80, offset: 400, index: 5 } },
      { it: 'computes the visible window mid-scroll', run: 'visibleRange(400, 600, 80, 100)', expected: { first: 5, last: 12 } },
      { it: 'row touching the bottom edge is NOT included when exactly flush', run: 'visibleRange(0, 160, 80, 100)', expected: { first: 0, last: 1 } },
      { it: 'clamps negative scroll (iOS bounce)', run: 'visibleRange(-50, 600, 80, 100)', expected: { first: 0, last: 6 } },
      { it: 'clamps past the end of content', run: 'visibleRange(7900, 600, 80, 100)', expected: { first: 98, last: 99 } },
      { it: 'both ends stay inside [0, itemCount-1] under extreme scroll', run: '[visibleRange(1e6, 600, 80, 100), visibleRange(-1e6, 600, 80, 100)]', expected: [{ first: 99, last: 99 }, { first: 0, last: 0 }] },
      { it: 'empty list returns an empty range (last < first), not an invalid index', run: 'visibleRange(0, 600, 80, 0)', expected: { first: 0, last: -1 } },
    ],
    hints: [
      'offset = rowHeight * index — that is the entire getItemLayout win',
      'first = floor(scrollY / rowHeight); last from the bottom edge with ceil − 1',
      'Clamp both ends: bounce gives negative scrollY, momentum overshoots the end',
      'Guard itemCount === 0 first — return { first: 0, last: -1 }, an empty range',
    ],
  },
  {
    id: 148,
    title: 'Worklet-style interpolate and clamp',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '15 min',
    prompt: `The two math primitives inside every Reanimated gesture:
1. \`clamp(value, lower, upper)\`
2. \`interpolate(value, [inMin, inMax], [outMin, outMax], extrapolate)\` — linear mapping; \`extrapolate\` is \`'extend'\` (default, keep the line going) or \`'clamp'\` (pin to the output range)

Example: drag progress 0→1 mapping to translateY 0→−300.`,
    starterCode: `function clamp(value, lower, upper) {
  // Your code here
}

function interpolate(value, inputRange, outputRange, extrapolate = 'extend') {
  // Your code here
}`,
    solution: `function clamp(value, lower, upper) {
  return Math.min(Math.max(value, lower), upper)
}

function interpolate(value, [inMin, inMax], [outMin, outMax], extrapolate = 'extend') {
  const progress = (value - inMin) / (inMax - inMin)
  const result = outMin + progress * (outMax - outMin)
  if (extrapolate === 'clamp') {
    // clamp in OUTPUT space, handling inverted ranges (e.g. 0 → -300)
    const lo = Math.min(outMin, outMax)
    const hi = Math.max(outMin, outMax)
    return clamp(result, lo, hi)
  }
  return result
}`,
    explanation: `Every gesture-driven animation is this one line of math — normalize to progress, project onto the output — run once per frame on the UI thread. Interviewers like it because it's small enough to write live and deep enough to expose whether you understand *what a worklet is allowed to be*.

The load-bearing details:
- **Normalize, then project.** \`(value − inMin) / (inMax − inMin)\` is progress ∈ [0,1] *only inside the input range* — outside it, progress goes negative or past 1, and that's not a bug: \`'extend'\` deliberately keeps the line going (a drag past the threshold keeps moving the card). \`'clamp'\` is the choice for opacity — extrapolated opacity 1.4 is nonsense.
- **Clamp in output space, min/max the bounds first.** The natural mistake is \`clamp(result, outMin, outMax)\` — but output ranges are routinely inverted (\`[0, -300]\` for drag-up), and clamping between (0, −300) with min=0 returns 0 forever. Ordering the bounds is the difference between "works in the demo" and "works when the designer flips the direction."
- **Why this must be pure math:** these run as Reanimated worklets on the UI-thread runtime — no closures over React state, no side effects, just number → number. That purity is what lets the gesture track the finger while the JS thread is blocked parsing JSON. Pure functions aren't a style preference here; they're the execution model.

**Red flag:** hardcoding the pixel math inside the gesture handler (\`translateY = gestureY * -0.6\` sprinkled around). Interpolate centralizes the mapping so the input range, output range, and edge policy are declared once — when the design changes, one array changes.

**Say it:** "Interpolate is normalize-then-project with an explicit edge policy — extend for spatial motion, clamp for bounded properties like opacity — and it's pure math because it has to run per-frame on the UI thread."`,
    tests: [
      { it: 'maps the midpoint linearly', run: 'interpolate(0.5, [0, 1], [0, 100])', expected: 50 },
      { it: 'extends past the range by default', run: 'interpolate(2, [0, 1], [0, 100])', expected: 200 },
      { it: 'clamp pins to the output range', run: "interpolate(2, [0, 1], [0, 100], 'clamp')", expected: 100 },
      { it: 'handles inverted output ranges (drag up)', run: 'interpolate(0.5, [0, 1], [0, -300])', expected: -150 },
      { it: 'clamp works on inverted ranges too', run: "interpolate(1.5, [0, 1], [0, -300], 'clamp')", expected: -300 },
      { it: 'clamp basics', run: '[clamp(5, 0, 10), clamp(-5, 0, 10), clamp(15, 0, 10)]', expected: [5, 0, 10] },
    ],
    hints: [
      'progress = (value − inMin) / (inMax − inMin), then outMin + progress × span',
      'extend = return the raw projection; clamp = pin in OUTPUT space',
      'Inverted ranges: Math.min/max the output bounds before clamping',
    ],
  },
  {
    id: 149,
    title: 'Exponential backoff with jitter',
    category: 'Engineering Practices',
    difficulty: 'medium',
    timeEstimate: '15 min',
    prompt: `Design the retry delays for a flaky API:
1. \`backoffSchedule(retries, base, cap)\` → array of delays: \`base × 2^attempt\`, each capped at \`cap\`
   e.g. \`backoffSchedule(5, 100, 1000)\` → \`[100, 200, 400, 800, 1000]\`
2. \`withJitter(schedule, rand)\` → full jitter: each delay becomes \`rand() × delay\` (rand injected for testability; use Math.floor on the result)`,
    starterCode: `function backoffSchedule(retries, base, cap) {
  // Your code here
}

function withJitter(schedule, rand) {
  // Your code here
}`,
    solution: `function backoffSchedule(retries, base, cap) {
  return Array.from({ length: retries }, (_, attempt) =>
    Math.min(base * 2 ** attempt, cap)
  )
}

function withJitter(schedule, rand) {
  return schedule.map(delay => Math.floor(rand() * delay))
}`,
    explanation: `Retry logic is where mobile engineers ship distributed-systems bugs without noticing. The interview question isn't "can you multiply by two" — it's whether you know **why each of the three ingredients exists**, because each one prevents a specific production incident.

1. **Exponential growth** exists because the failure you're retrying against is usually load. Fixed-interval retries (every 2s, forever) hold constant pressure on a struggling server — backoff is the client voluntarily shedding load so the server can recover.
2. **The cap** exists because 100ms doubled 10 times is 102 seconds — past a point, longer waits punish the user without helping the server. The cap is a product decision (how long will a user stare at a spinner?) wearing a technical costume.
3. **Jitter** is the one candidates miss, and it's the senior differentiator: when a deploy drops 10,000 mobile clients at once, they all fail at t=0 and — without jitter — all retry at exactly t=100ms, t=300ms, t=700ms as a synchronized wave. That's a **thundering herd**: the retries *are* the outage. Full jitter (\`rand() × delay\`) spreads the wave into noise. AWS's architecture blog made "full jitter" the standard answer.
- **Injecting \`rand\`** instead of calling \`Math.random()\` inline is the testability move — the tests below only pass because randomness is a parameter. Same reason you inject clocks.

The mobile-specific layer worth adding: retries are only safe on **idempotent** operations. Retrying a GET is free; retrying a POST /payments needs an idempotency key. And on device you cap *total* retry time, because the user can walk into a tunnel — reachability listeners beat blind persistence.

**Say it:** "Exponential backoff sheds load, the cap bounds user-visible latency, and jitter breaks retry synchronization — without jitter, ten thousand clients retrying in lockstep are the second outage."`,
    tests: [
      { it: 'doubles from base and respects the cap', run: 'backoffSchedule(5, 100, 1000)', expected: [100, 200, 400, 800, 1000] },
      { it: 'cap applies to everything past the crossover', run: 'backoffSchedule(6, 50, 200)', expected: [50, 100, 200, 200, 200, 200] },
      { it: 'zero retries → empty schedule', run: 'backoffSchedule(0, 100, 1000)', expected: [] },
      { it: 'full jitter scales each delay by rand()', run: '(() => { const s = backoffSchedule(3, 100, 1000); return withJitter(s, () => 0.5) })()', expected: [50, 100, 200] },
      { it: 'rand() = 0 floors every delay to zero', run: 'withJitter([100, 200], () => 0)', expected: [0, 0] },
    ],
    hints: [
      'base * 2 ** attempt, Math.min with the cap',
      'Array.from({ length: retries }, (_, i) => ...) builds the schedule',
      'Injecting rand as a parameter is what makes jitter testable',
    ],
  },
  {
    id: 150,
    title: 'OTA update gate (runtimeVersion)',
    category: 'Dev Processes',
    difficulty: 'medium',
    timeEstimate: '15 min',
    prompt: `Model the server-side gate of an OTA system like EAS Update. Given:
- \`binary = { runtimeVersion, channel }\` — what the installed app reports
- \`updates = [{ id, runtimeVersion, channel, createdAt }]\` — published updates (createdAt is a number)

Write \`selectUpdate(updates, binary)\`:
1. An update is compatible only if BOTH \`runtimeVersion\` and \`channel\` match the binary exactly
2. Return the **newest** compatible update (highest createdAt), or \`null\` if none`,
    starterCode: `function selectUpdate(updates, binary) {
  // Your code here
}`,
    solution: `function selectUpdate(updates, binary) {
  const compatible = updates.filter(u =>
    u.runtimeVersion === binary.runtimeVersion &&
    u.channel === binary.channel
  )
  if (compatible.length === 0) return null
  return compatible.reduce((newest, u) =>
    u.createdAt > newest.createdAt ? u : newest
  )
}`,
    explanation: `This ten-line filter is the entire safety model of over-the-air updates, and being able to explain *why each check exists* is what "I've operated OTA in production" sounds like.

- **\`runtimeVersion\` equality is a crash prevented.** OTA replaces the JS bundle only — never native code. If a JS update calls a native module that the installed binary doesn't contain, the app crashes at launch, for every user, with no way to push a fix *because the updater itself is what's broken*. The runtime version is a contract string: "this JS requires exactly this native capability set." Exact match, not semver-compatible match — you can't reason about ABI compatibility from version arithmetic.
- **\`channel\` is environment isolation.** Production binaries point at the production channel; staging at staging. The check is what makes "promote to production" an explicit act (republish to the channel) instead of an accident. Rollback falls out for free: republish the last known-good update, and this same selector picks it as newest.
- **Newest-wins via \`reduce\`** instead of \`sort()[0]\` is a small habit that matters: sort mutates the input array (a rude thing for a selector to do to shared state) and costs O(n log n) for a question that needs O(n).
- The historical framing that earns credibility: this is the machinery CodePush pioneered — retired with App Center in 2025 — and EAS Update standardized. Answering "CodePush" as your current OTA tool dates you; explaining the gate it *shared* with EAS Update shows you understand the invariant rather than the brand.

**Red flag:** treating OTA as "deploy anything instantly." State the boundary unprompted: JS and assets only, gated by runtime version; native changes always ride a store release.

**Say it:** "The updater filters on exact runtimeVersion and channel, then takes the newest — the runtime version is what guarantees the JS can't call native code the binary doesn't have, and that gate is the whole reason OTA is safe."`,
    tests: [
      { it: 'picks the newest compatible update', run: "(() => { const updates = [ { id: 'u1', runtimeVersion: '1.0', channel: 'prod', createdAt: 10 }, { id: 'u2', runtimeVersion: '1.0', channel: 'prod', createdAt: 20 }, { id: 'u3', runtimeVersion: '2.0', channel: 'prod', createdAt: 30 } ]; return selectUpdate(updates, { runtimeVersion: '1.0', channel: 'prod' }).id })()", expected: 'u2' },
      { it: 'wrong channel is filtered out', run: "(() => { const updates = [ { id: 'u1', runtimeVersion: '1.0', channel: 'staging', createdAt: 50 } ]; return selectUpdate(updates, { runtimeVersion: '1.0', channel: 'prod' }) })()", expected: null },
      { it: 'runtime mismatch returns null even if channel matches', run: "(() => { const updates = [ { id: 'u1', runtimeVersion: '3.0', channel: 'prod', createdAt: 50 } ]; return selectUpdate(updates, { runtimeVersion: '1.0', channel: 'prod' }) })()", expected: null },
      { it: 'empty update list returns null', run: "selectUpdate([], { runtimeVersion: '1.0', channel: 'prod' })", expected: null },
      { it: 'rollback = republished old code as newest wins', run: "(() => { const updates = [ { id: 'broken', runtimeVersion: '1.0', channel: 'prod', createdAt: 20 }, { id: 'rollback-of-v5', runtimeVersion: '1.0', channel: 'prod', createdAt: 30 } ]; return selectUpdate(updates, { runtimeVersion: '1.0', channel: 'prod' }).id })()", expected: 'rollback-of-v5' },
    ],
    hints: [
      'filter on BOTH runtimeVersion and channel, strict equality',
      'reduce to the max createdAt — sort() mutates and over-works',
      'No compatible updates is a normal case: return null, not undefined',
    ],
  },
]
