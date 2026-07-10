# React — Andersen S2 (12 skills)

React internals at the S2 bar: Fiber, batching, lifecycle order, memoization, refs, context, Redux plumbing, and the rules of hooks — the questions that separate "uses React" from "can explain React".

> Part of the [Andersen React Native S2 study guide](README.md). Drill these with [flashcards.md](flashcards.md).

## Reconciliation

### Fiber
**They ask:** "Describe React's Fiber architecture at a deep level — what a fiber actually is, why the rewrite happened, and how the two phases work."

Fiber exists because the old stack reconciler recursed through the whole tree synchronously — once an update started, nothing could interrupt it, so a large render blocked user input for its full duration. Fiber's core move: a fiber is both a **unit of work** and a **node in a linked-list tree** (`child`, `sibling`, `return` pointers instead of recursion). Traversal becomes an explicit loop over pointers, so React can pause after any single fiber, yield to the host, and resume — impossible with a call stack.

Rendering runs in two phases. The **render phase** is interruptible and side-effect-free: React builds a `workInProgress` tree fiber by fiber, diffing against the `current` tree (**double buffering** — two trees, `alternate` pointers between them; commit atomically swaps which one is `current`, so the user never sees a half-applied update). The **commit phase** is synchronous and uninterruptible: mutations, ref attachment, effects — the DOM/native tree must never be left inconsistent.

Priorities are **lanes** — a bitmask where each bit is a priority class; urgent lanes (discrete input) preempt lower ones (transitions), and an interrupted low-priority render is simply thrown away and restarted. The diffing heuristics are unchanged from classic reconciliation: different element `type` means teardown-and-rebuild of the subtree; `key` lets list children match by identity instead of index.

**Say it:** "A fiber is a unit of work plus a linked-list node, which turns rendering into a pausable loop: the interruptible render phase builds a workInProgress tree against the current tree, and the synchronous commit phase swaps them atomically."
**Red flag:** Saying "Fiber made React faster" — it did not speed up total work; it made rendering *interruptible and prioritizable*, which is a responsiveness win, not a throughput win.

### Jobs
**They ask:** "How does React schedule work? Walk me through what happens between calling setState and the screen updating when other work is competing."

Scheduling is why a heavy re-render no longer freezes typing: React does **cooperative scheduling** — it volunteers the thread back to the host instead of relying on preemption, which no JS runtime offers. Every `setState` doesn't render immediately; it marks the fiber with an update at a priority **lane** and schedules a job with React's scheduler package. The scheduler maintains priority queues and runs render work in **time slices**: the work loop processes one fiber at a time and checks `shouldYield()` between units — after roughly a frame's budget (a few milliseconds), it posts a continuation (via `MessageChannel`, not `requestIdleCallback`, which fires too infrequently) and yields so input handlers and paint can run.

```js
while (workInProgress !== null && !shouldYield()) {
  workInProgress = performUnitOfWork(workInProgress);
}
// yielded: post a continuation, resume next slice
```

React 18's concurrent features are this model exposed: `startTransition` marks an update as a low-priority lane, so an urgent update (a keystroke) arriving mid-render interrupts the transition render, which is discarded and restarted after the urgent lane commits. Batching is the other half — since React 18, all updates in one event tick auto-batch into a single render, regardless of whether they originate in an event handler, a promise, or a timeout.

**Say it:** "React's scheduling is cooperative: updates land in priority lanes, the work loop renders in time slices checking shouldYield between fibers, and a transition render is interruptible — an urgent lane discards and restarts it."
**Red flag:** Claiming the render phase runs "in parallel" or on another thread — it is single-threaded time slicing on the JS thread; concurrency in React means interleaving, not parallelism.

## Components

### State
**They ask:** "If I call `setState` three times in an event handler, how many re-renders happen? What changes if the calls sit inside a `setTimeout` or a promise `.then`?"

Batching is React's core rendering optimization — misjudging it means either wasted renders or reading stale state, and it is the classic counting exercise interviewers use to separate memorized answers from understood ones. In React 18+, `createRoot` enables automatic batching everywhere: all `setState` calls in one tick — event handlers, promises, `setTimeout`, native event listeners — flush as a single re-render. In legacy React 17 and earlier, batching happened only inside React event handlers; each call in a `setTimeout` or promise callback triggered its own synchronous re-render. Walk the counting exercise:

```jsx
const [n, setN] = useState(0);
const onClick = () => {
  setN(n + 1); // n is 0 in this closure
  setN(n + 1); // still 0 → result: 1
  setN(prev => prev + 1); // reads queued state → 2
};
// One re-render (React 18). React 17 in setTimeout: three.
```

Same-value updates collapse because non-functional calls all read the same closed-over value — the functional updater is how you queue dependent updates correctly. In class components, object-form `setState` shallow-merges, so multiple updates to the same key overwrite each other unless you pass the updater function. `flushSync` is the escape hatch when you genuinely need a synchronous DOM read after an update.

**Say it:** "React 18 batches all state updates in a tick into one render regardless of origin; in React 17 only React event handlers were batched — and I use functional updaters whenever the next state depends on the previous one."
**Red flag:** Saying "setState is asynchronous" as the whole answer — it is not a promise, it is *batched*; the state variable is a closure constant for the render, and the precise word is batching, not asynchrony.

### Lifecycle methods
**They ask:** "Walk me through the class lifecycle in order — mount, update, unmount — and explain why the `componentWill*` methods were deprecated."

Lifecycle knowledge still matters because legacy codebases run on it and because the deprecation story explains why React's concurrent rendering works the way it does. Mount order: `constructor` → `getDerivedStateFromProps` → `render` → `componentDidMount`. Update order: `getDerivedStateFromProps` → `shouldComponentUpdate` → `render` → `getSnapshotBeforeUpdate` → `componentDidUpdate`. Unmount: `componentWillUnmount`. Each exists for a distinct job: `componentDidMount` for subscriptions and data fetching (the DOM exists, effects are safe), `shouldComponentUpdate` for render bail-outs, `getSnapshotBeforeUpdate` for capturing pre-commit DOM state (scroll position) that `componentDidUpdate` consumes, `componentWillUnmount` for cleanup so you don't leak timers and listeners.

The deprecated trio — `componentWillMount`, `componentWillReceiveProps`, `componentWillUpdate` — ran in the render phase, and concurrent React may start, pause, or re-run the render phase multiple times before committing. Side effects there (network calls, subscriptions) could fire repeatedly or for renders that never commit. React's answer was structural: only commit-phase methods (`componentDid*`) are guaranteed to run exactly once per committed update. Hooks map cleanly: `useEffect` covers `componentDidMount`/`componentDidUpdate`/`componentWillUnmount` (via its cleanup function), `useMemo`/`React.memo` cover `shouldComponentUpdate`-style bail-outs.

**Say it:** "The `componentWill*` methods were unsafe because they run in the interruptible render phase — concurrent React may execute that phase multiple times, so side effects belong only in commit-phase methods or effects."
**Red flag:** Saying they were removed "because hooks replaced them" — the real reason is render-phase re-execution under concurrent rendering; hooks are the replacement, not the cause.

### PureComponent and memo
**They ask:** "Why does React.memo exist, and when does wrapping a component in it actually do nothing?"

`React.memo` exists because React's default is to re-render every child when a parent renders — memoization converts that O(subtree) cost into a shallow prop comparison, which is how you keep large lists and expensive subtrees off the render path. `PureComponent` is the class-era version: it implements `shouldComponentUpdate` as a shallow comparison of props and state. `memo` is the function-component equivalent for props, with an optional second argument — a custom comparator `(prevProps, nextProps) => boolean` returning `true` to *skip* the render (the inverse of `shouldComponentUpdate`).

The catch is referential stability: shallow comparison uses `Object.is` per prop, so an inline object, array, or arrow function created in the parent's render is a new reference every time and defeats the memo silently — you pay the comparison *and* the render. That is why `memo` travels with `useCallback` and `useMemo` on the props feeding it. And memo can hurt: for cheap components the comparison costs more than re-rendering, and for props that change every render it is pure overhead. Profile first (React DevTools Profiler), memoize the proven hot paths — typically list rows and expensive visualization components. The React Compiler automates this memoization, which signals where the ecosystem is heading.

**Say it:** "memo is a shallow reference comparison, so it only pays off when the props feeding it are referentially stable — I pair it with useCallback/useMemo upstream and apply it to profiled hot paths like list rows, not everywhere by default."
**Red flag:** "Wrap everything in memo to be safe" — blanket memoization adds comparison overhead and, worse, hides the real problem, which is usually unstable references or state living too high in the tree.

### Refs
**They ask:** "What are refs really for? Give me concrete cases where a ref is the right tool and state would be wrong."

Refs are React's sanctioned escape hatch from the declarative model — the mechanism for imperative work the render cycle cannot express — and knowing when data belongs in a ref versus state is a correctness question, not a style one. Two distinct meanings: (1) a handle to a host element (DOM node, or the native view in React Native) or class instance, and (2) `useRef` as a render-persistent mutable box — `{ current }` survives re-renders, and mutating it does *not* trigger one. The decision rule: if the value should be reflected in the UI, it is state; if it only needs to persist between renders, it is a ref.

Concrete uses: focusing an input, scrolling, measuring layout (`measure`/`getBoundingClientRect`); storing timer and subscription IDs for cleanup; keeping the previous value of a prop; holding the latest callback to avoid stale closures in long-lived listeners. For exposing an imperative API from a child (`inputRef.current.focus()` on a custom component), `useImperativeHandle` lets the child publish a curated surface instead of leaking its whole instance — historically wrapped in `forwardRef`; in React 19, function components accept `ref` as a regular prop, so `forwardRef` is no longer required. Callback refs (`ref={node => …}`) run at attach/detach time, useful when you need to react to the node appearing.

**Say it:** "A ref is a render-persistent mutable box that doesn't trigger renders — UI-visible data goes in state, everything else that must survive re-renders goes in a ref."
**Red flag:** Storing UI-driving values in a ref "to avoid re-renders" — the screen silently stops updating; if the user should see it, it is state by definition.

### Context
**They ask:** "When a context value changes, what re-renders? How would you architect around that, and when do you reach for an external store instead?"

Context is a dependency-injection tool, not a state manager — treating it as global state is the most common cause of app-wide render storms. Mechanically: every component that calls `useContext` re-renders when the provider's `value` changes, and "changes" means reference identity. There is no selector — a consumer reading one field re-renders when any field changes. Worse, an inline `value={{ user, setUser }}` creates a new object on every provider render, re-rendering all consumers even when nothing meaningful changed.

Mitigations, in order: (1) memoize the value with `useMemo`; (2) split contexts by update frequency — a stable dispatch/actions context separate from the fast-changing state context, so components that only trigger updates never re-render; (3) push state down so the provider sits above only the components that need it. When updates are high-frequency or consumers need slices, that is the boundary where external stores win: Zustand and Redux live outside the React tree and use selector subscriptions — components subscribe to a slice and re-render only when that slice changes. `use-context-selector` retrofits selectors onto context; React 19's `use(Context)` adds conditional reading (legal inside `if` blocks, unlike `useContext`) but does not add selectors.

**Say it:** "I use Context for low-frequency dependency injection — theme, locale, auth session — and an external store with selector subscriptions for high-frequency state, because context has no selectors and re-renders every consumer on any value change."
**Red flag:** "Context replaces Redux" — context solves prop drilling, not subscription granularity; saying it replaces a store tells the interviewer you have never profiled a context-driven render cascade.

## Redux

### Reducers
**They ask:** "What is a reducer, and how do you write one — classic switch/case versus Redux Toolkit?"

Reducers are the contract that makes the entire store predictable: a pure function `(state, action) => state` that never mutates its input, which is what enables time-travel debugging, replayable actions, and the referential-equality checks every subscriber relies on to skip re-renders. Purity means no side effects, no API calls, no `Date.now()` — same inputs, same output, always. Classic style enforces immutability by hand with spread copies in a `switch`:

```js
function todos(state = [], action) {
  switch (action.type) {
    case 'todos/added':
      return [...state, action.payload];
    case 'todos/toggled':
      return state.map((t) =>
        t.id === action.payload ? { ...t, done: !t.done } : t
      );
    default:
      return state;
  }
}
```

Redux Toolkit's `createSlice` replaces this: you write "mutating" syntax inside case reducers, and Immer intercepts it, tracks the draft, and produces a correctly immutable next state — plus action creators and action types are generated for you. The trade-off is a small runtime layer (Immer) in exchange for eliminating the two classic bug classes: forgotten `default` returns and accidental mutation of nested state, which silently breaks `===` change detection downstream. RTK is the officially recommended way to write Redux today; hand-rolled switch reducers survive mainly in legacy codebases — and in interviews.

**Say it:** "A reducer is a pure `(state, action) => state` function; the immutability contract is what makes change detection a cheap reference check — RTK's createSlice keeps that contract via Immer while letting me write mutating syntax."
**Red flag:** Saying Immer "lets you mutate state in Redux" — it doesn't; it translates draft mutations into immutable updates, and stating it as real mutation suggests you don't understand why reference equality matters.

### Middlewares
**They ask:** "Can you write a Redux middleware from scratch? What does the signature look like and why is it curried?"

Middleware is Redux's extension point between `dispatch` and the reducer — it's where side effects, logging, analytics, and async live, keeping reducers pure. The signature is a triple-curried function: `store => next => action => result`. Currying exists because the three arguments arrive at different times — `store` at setup, `next` when the chain is composed, `action` on every dispatch. `next` is the following middleware (or the real dispatch at the end), so calling `next(action)` passes the action down the chain; not calling it swallows the action.

```js
const logger = (store) => (next) => (action) => {
  console.log('dispatching', action.type);
  const result = next(action);
  console.log('next state', store.getState());
  return result;
};
```

redux-thunk, the default async solution, is about 14 lines — worth writing live: if the action is a function, call it with `dispatch` and `getState` instead of forwarding it. Order matters: middlewares compose left to right around dispatch, so thunk must sit early in the chain — otherwise a logger placed before it receives function actions it can't serialize.

**Say it:** "Middleware is a curried `store => next => action` function sitting between dispatch and the reducer; the currying separates setup, chain composition, and per-dispatch execution — and thunk itself is just fourteen lines of 'if the action is a function, call it.'"
**Red flag:** Reciting "thunk vs saga" library trivia without being able to write the `store => next => action` shape — Andersen asks for the signature, and fumbling it reads as never having stepped outside library defaults.

### Selectors
**They ask:** "What are selectors for? Explain in your own words why you wouldn't just read state directly in components."

Selectors are the read-side API of the store: functions from state to derived data that decouple components from state shape, so a store refactor touches one selector instead of fifty components. That encapsulation is the architectural win; two runtime wins follow. First, memoization — reselect's `createSelector` (re-exported by Redux Toolkit) recomputes an expensive derivation (filtering, sorting, aggregating) only when its input selectors return new references, otherwise it returns the cached result. Second, render control — `useSelector` subscribes the component to the selector's result and re-renders only when that result changes by reference, so a narrow selector like `state.cart.items.length` isolates the component from unrelated store updates.

The corresponding trap: a selector that returns a fresh object or array on every call (`state.todos.filter(...)` inline in `useSelector`) defeats the reference check and re-renders the component on every store change. That is exactly the case memoized selectors exist for — the memoized selector returns the same reference until its inputs actually change.

Trade-off: memoized selectors add indirection and a cache to reason about (per-instance caching matters when the same selector serves multiple components with different arguments), but the alternative — components hard-wired to state shape, recomputing derivations every render — costs far more at refactor time and in wasted renders.

**Say it:** "Selectors decouple components from state shape and turn re-render decisions into a reference check — I memoize any selector that derives new objects, because a fresh array every call re-renders on every store update."
**Red flag:** Defining selectors as only "a performance optimization" — the primary purpose is decoupling components from state shape; memoization is the second-order benefit, and leading with it inverts the design rationale.

## Hooks

### Why hooks
**They ask:** "Why did React introduce hooks, and why can't you call a hook inside a condition or a loop? How do you handle branching logic then?"

Hooks exist because class components made stateful logic unshareable — reusing behavior meant mixins (implicit, conflict-prone), HOCs, or render props, which stacked into wrapper pyramids that obscured the tree and bloated devtools. Hooks turn stateful logic into plain composable functions, so the same `useFetch` or `useDebounce` drops into any component with no wrapper cost.

The call-order rule follows from how state is stored. React keeps each component's hook state as an ordered list on its fiber; a hook has no name or key — its identity is its position in the call sequence. On every render React walks that list in order and hands slot N to the Nth hook call. A hook inside an `if` that flips between renders shifts every subsequent hook by one slot: `useState` reads another hook's state, `useEffect` gets the wrong deps, and behavior corrupts silently. Loops and nested functions break the same invariant.

Branching patterns, in preference order: (1) move the condition *inside* the hook — an `enabled` flag on the effect or query, so the hook always runs but its work is conditional; (2) split into two components and branch on which one renders — each gets its own fiber and hook list; (3) extract a custom hook that encapsulates the conditional logic; (4) early returns are fine only *after* all hooks have been called.

**Say it:** "Hook state is positional — call order is identity — so I branch inside the hook with an enabled flag or split the component, never around the hook call."
**Red flag:** Answering only "it's a lint rule from React" — the ESLint plugin enforces the invariant, it doesn't cause it; explain the fiber's ordered hook list or the answer reads as memorized, not understood.

### useState, useReducer, useContext
**They ask:** "When do you reach for useState versus useReducer, and where does useContext fit in?"

Choosing wrong here is a maintenance cost: scattered `useState` calls with interdependent updates become an untestable web of setters, while a reducer over one boolean is ceremony. The decision is about how state *transitions*, not how big it is.

`useState` is for independent, simple values — a toggle, an input, a flag — where the next state doesn't depend on coordinating siblings. `useReducer` earns its keep when transitions are complex or multiple fields must change together atomically: it centralizes transition logic in a pure function (state-machine flavor — actions in, next state out), which is unit-testable without rendering anything, and `dispatch` is referentially stable, so passing it deep never triggers memo-busting re-renders the way fresh setter closures can.

`useContext` is orthogonal — it's dependency injection, not state management. It answers "how do I deliver this value down the tree without prop drilling," and it can carry either a `useState` value or a reducer's `state` + `dispatch`. The reducer-plus-context pair is a mini-Redux: fine for a feature-scoped domain (auth, a wizard, a cart). Reach for a real store (Redux, Zustand) when you need selector-based subscriptions — every context consumer re-renders on any provider change — or middleware and devtools.

**Say it:** "useState for independent values, useReducer when transitions are related or need to be testable, and useContext to inject either one — it's DI, not a state manager."
**Red flag:** Saying "useReducer is for big state and useState for small state" — size is irrelevant; the criterion is transition complexity and update coordination, and missing that distinction reads as junior.
