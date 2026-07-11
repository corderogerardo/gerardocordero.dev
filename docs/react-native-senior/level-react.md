# React — Andersen matrix, junior→middle levels

### React Fiber
**They ask:** "What is Fiber in React, and in your own words, what does it do?"

Fiber is the reconciliation engine React rewrote in React 16 so that rendering could be *interruptible* — the whole reason your UI stays responsive during a big update instead of freezing while React walks the tree. Before Fiber, reconciliation was a single recursive pass on the call stack that couldn't be paused; a large update blocked the main thread until it finished.

Mechanically, a fiber is a plain JavaScript object representing one unit of work — one component instance or DOM node. React keeps a linked tree of them (`child`, `sibling`, `return` pointers) so it can walk the tree with a loop instead of recursion. That loop can stop after each fiber, hand control back to the browser, and resume later. Work happens in two phases: a *render* phase that builds the tree and is interruptible, and a *commit* phase that applies changes to the DOM and runs synchronously.

**Say it:** "Fiber turned reconciliation from an unstoppable recursive pass into a linked tree of work units React can pause, resume, and prioritize."
**Red flag:** Calling Fiber "the virtual DOM." The virtual DOM is the concept of diffing element trees; Fiber is the specific data structure and scheduler that makes that diffing interruptible.

### Scheduling and priority
**They ask:** "At a basic level, how does React decide what to work on first?"

React prioritizes updates so that things a user directly feels — typing, clicking — never get stuck behind slower background work like rendering a long list. That's the payoff: an urgent keystroke can jump ahead of a low-priority re-render instead of waiting in line.

The basic model is that not all updates are equal. A state update from an input is treated as urgent and rendered immediately; an update you mark as non-urgent can be rendered in the background and even interrupted if something more important arrives. React assigns each update a priority (a "lane") and the scheduler works through them highest-first.

```jsx
const [tab, setTab] = useState('home');
const [isPending, startTransition] = useTransition();

function select(next) {
  startTransition(() => setTab(next)); // low priority, interruptible
}
```

**Say it:** "React schedules updates by priority — urgent input stays responsive while low-priority transitions render in the background and can be interrupted."
**Red flag:** Claiming React "runs everything in order top to bottom." Concurrent React can start, abandon, and restart a render before it ever commits.

### Component state basics
**They ask:** "How do you work with state in a class versus a functional component, and what does setState do?"

State is the data a component owns that, when it changes, tells React to re-render that component — that's the contract that makes UI declarative. You never mutate it directly; you ask React to schedule an update, and React re-renders with the new value.

In a class you initialize `this.state` and call `this.setState({...})`, which shallow-merges the patch. In a function you use the `useState` hook, which replaces the value (no merge) and gives you a setter:

```jsx
// class
this.setState({ count: this.state.count + 1 });
// function
const [count, setCount] = useState(0);
setCount(c => c + 1); // updater form
```

Both schedule a re-render rather than changing the value on the spot, so reading state right after setting it still shows the old value.

**Say it:** "Setting state is a request to re-render with a new value, not an in-place mutation — and `setState` merges while `useState` replaces."
**Red flag:** Mutating state directly (`this.state.count++` or pushing into a state array). React won't re-render and you get stale UI; always produce a new value.

### Refs: why and what
**They ask:** "What is a ref in React, and why would you need one?"

A ref is React's escape hatch to hold a value or reach a DOM node *without* triggering a re-render when it changes — you reach for it exactly when the declarative model doesn't fit. The common case is imperative DOM work React has no declarative API for: focusing an input, measuring layout, playing a video, integrating a non-React library.

```jsx
const inputRef = useRef(null);
useEffect(() => { inputRef.current.focus(); }, []);
return <input ref={inputRef} />;
```

The other use is storing a mutable value that should survive re-renders but not cause them — a timer id, a previous value. Reading or writing `ref.current` never schedules a render, which is the key difference from state.

**Say it:** "A ref holds a mutable value or a DOM node across renders without causing one — it's the escape hatch for imperative work state can't express."
**Red flag:** Reaching for refs to read or share ordinary data between components. If a change should update the UI, it belongs in state or props; refs are for the imperative exceptions.

### Redux three principles
**They ask:** "What is Redux for, and what are its three principles?"

Redux exists to make state changes in a large app *predictable and traceable* — one place to look, one way things change — which is what makes complex state debuggable and testable. It's a value when many distant components share and mutate the same state.

The three principles: (1) **Single source of truth** — the whole app state lives in one store object. (2) **State is read-only** — you never mutate it; the only way to change it is to dispatch an action, a plain object describing what happened. (3) **Changes are made with pure reducers** — a reducer is a pure function `(state, action) => newState` that computes the next state from the current one.

Together those give you time-travel debugging, easy testing (pure functions), and a clear audit trail of every change.

**Say it:** "One store, state changed only by dispatching actions, and pure reducers computing the next state — that's what makes Redux predictable."
**Red flag:** Saying "Redux is for all app state." Modern guidance is to keep server data in a query library and local UI state in components; Redux earns its keep for genuinely shared, frequently-updated client state.

### connect HOC
**They ask:** "What does Redux's `connect` do, and what role does it play in the architecture?"

`connect` is the bridge between the Redux store and a React component, and its architectural job is to keep your components ignorant of Redux — they receive plain props and stay reusable and testable. It's a higher-order component: it wraps your component and injects store data and dispatchers as props.

```jsx
const mapState = state => ({ count: state.counter });
const mapDispatch = { increment };
export default connect(mapState, mapDispatch)(Counter);
```

`mapStateToProps` selects the slice this component needs; `connect` subscribes to the store and re-renders the wrapped component only when that selected slice changes (a shallow-equality check), which is where its performance value comes from. `mapDispatchToProps` gives the component action creators as callable props.

Today the hooks API (`useSelector`, `useDispatch`) is the idiomatic replacement, but `connect` and hooks do the same job.

**Say it:** "`connect` is an HOC that injects selected state and dispatchers as props, so components consume data without knowing Redux exists."
**Red flag:** Describing `connect` as a global-variable grab. It subscribes to specific slices via `mapStateToProps` and re-renders only on relevant changes — the selection is the whole point.

### Redux actions
**They ask:** "What is an action in Redux, and what makes it different from a function call?"

An action is a plain object that *describes something that happened* — not a command that changes state. That distinction is the seniority signal: actions are events ("USER_LOGGED_IN"), not setters ("setUser"). Framing them as events is what gives you a replayable, auditable history.

By convention an action has a `type` string and an optional `payload`:

```js
{ type: 'todos/added', payload: { id: 1, text: 'Ship' } }
```

You rarely write them by hand; an *action creator* is a function that returns one, so call sites stay clean. Dispatching the action is the only way to trigger a state change — the action flows through middleware, then to reducers, which decide how state responds.

**Say it:** "An action is a plain object describing what happened; reducers decide how state reacts to it — the event and the response are decoupled."
**Red flag:** Putting logic or side effects inside an action creator's return value. Actions are inert data; async work and side effects belong in middleware (thunks/sagas), keeping the action itself a serializable event.

### Redux reducers
**They ask:** "What rules must a reducer follow, and can you write one?"

A reducer is the pure function that computes the next state from the current state and an action — and *pure* is the non-negotiable rule, because purity is exactly what gives Redux time-travel, testability, and predictable replays. Same inputs must always produce the same output, with no side effects.

Concretely a reducer must: never mutate its arguments (return a new object/array instead), never call anything non-deterministic (no `Date.now`, no `fetch`, no random), and return the unchanged state for actions it doesn't handle.

```js
function todos(state = [], action) {
  switch (action.type) {
    case 'todos/added':
      return [...state, action.payload]; // new array, no mutation
    default:
      return state;
  }
}
```

Redux Toolkit's `createReducer`/`createSlice` lets you "mutate" via Immer, but that's sugar — Immer produces a new immutable state under the hood.

**Say it:** "A reducer is a pure `(state, action) => newState` function — no mutation, no side effects, and it returns current state for actions it doesn't know."
**Red flag:** Mutating state and returning it (`state.push(...)`). It breaks change detection and time-travel; always return a fresh copy.

### Redux middleware
**They ask:** "What is middleware in Redux, and why does it exist?"

Middleware is the extension point that sits between dispatching an action and the reducer receiving it — it exists because reducers must stay pure, so anything impure (async calls, logging, side effects) needs somewhere else to live. Middleware is that somewhere.

Structurally it's a chain of functions wrapping `dispatch`; each can inspect an action, transform it, delay it, dispatch new actions, or stop it. That's how `redux-thunk` lets you dispatch a function that does async work and dispatches real actions when it resolves, and how logging or crash-reporting middleware observe every action.

```js
const logger = store => next => action => {
  console.log('dispatching', action.type);
  return next(action);
};
```

**Say it:** "Middleware wraps dispatch so side effects and async logic live outside reducers, keeping reducers pure."
**Red flag:** Putting API calls directly in components and dispatching results ad hoc. Centralizing side effects in middleware keeps the data flow one-directional and testable.

### Why hooks
**They ask:** "What are hooks, and what problem did they solve?"

Hooks let function components use state and lifecycle features, and the reason they took over is *logic reuse* — before hooks, sharing stateful logic meant wrapping components in HOCs and render props, which produced deeply nested "wrapper hell." Hooks let you extract that logic into a plain function and share it directly.

They also fixed how class lifecycles *split related code*: a subscription's setup lived in `componentDidMount` and its teardown in `componentWillUnmount`, far apart. `useEffect` co-locates setup and cleanup. And they removed `this` binding confusion and the boilerplate of class constructors.

```jsx
function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}
```

**Say it:** "Hooks let you extract and reuse stateful logic as plain functions, replacing HOC/render-prop wrapper hell and co-locating setup with cleanup."
**Red flag:** Saying hooks are "just shorter syntax for classes." The real win is composable, reusable logic — a custom hook shares behavior no class pattern could without nesting.

### useEffect
**They ask:** "Which lifecycle methods does `useEffect` replace, what's the second argument, and how do you clean up?"

`useEffect` is where you run side effects — the work that must happen *because* the UI rendered, like subscriptions, fetches, or DOM syncing — kept out of render so rendering stays pure. It covers what `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount` did, but organized by effect instead of by lifecycle moment.

The second argument is the dependency array: it tells React when to re-run the effect. `[]` runs it once after mount; `[userId]` re-runs whenever `userId` changes; omitting it runs the effect after every render. To unsubscribe, return a cleanup function — React calls it before the next effect run and on unmount.

```jsx
useEffect(() => {
  const sub = api.subscribe(id, setData);
  return () => sub.unsubscribe(); // cleanup
}, [id]);
```

**Say it:** "The dependency array controls when an effect re-runs, and the function it returns is the cleanup React runs before re-running or on unmount."
**Red flag:** Leaving out dependencies to "run it once" when the effect reads props/state. That captures stale values; list every value the effect uses, and restructure if the array fights you.

### useState, useReducer, useContext
**They ask:** "How do `useState`, `useReducer`, and `useContext` work, and what do they take?"

These are the three core state hooks, and knowing which to reach for is the point: `useState` for simple independent values, `useReducer` when the next state depends on the current state through complex transitions, `useContext` to read shared state without prop-drilling.

`useState(initial)` returns `[value, setValue]`; the setter accepts a new value or an updater `prev => next`. `useReducer(reducer, initialState)` returns `[state, dispatch]`; you send actions and a pure reducer computes the next state — the same model as Redux, scoped to one component tree.

```jsx
const [state, dispatch] = useReducer(reducer, { count: 0 });
dispatch({ type: 'inc' });

const theme = useContext(ThemeContext); // reads nearest provider's value
```

`useContext(Context)` returns the current value of the nearest matching provider and re-renders the component whenever that value changes.

**Say it:** "`useState` for simple values, `useReducer` when transitions are complex or state-dependent, `useContext` to read shared data without threading props."
**Red flag:** Chaining many `useState` calls that always change together. That's a signal to consolidate into `useReducer`, where the transitions live in one testable function.

### useCallback and useMemo
**They ask:** "When and why would you use `useCallback` and `useMemo`?"

Both exist to preserve *referential identity* across renders — and the senior framing is that they're optimizations, not correctness tools, so you add them where a measured cost justifies them, not everywhere. `useMemo` caches a computed value; `useCallback` caches a function. `useCallback(fn, deps)` is just `useMemo(() => fn, deps)`.

They earn their keep in two situations: skipping an genuinely expensive recomputation on every render, and keeping a stable reference so a `React.memo` child or an effect dependency doesn't re-run needlessly.

```jsx
const sorted = useMemo(() => bigList.sort(cmp), [bigList]);
const onSelect = useCallback(id => setSelected(id), []);
```

Both recompute only when their dependencies change. Overusing them adds memory and comparison overhead that can cost more than the render they save.

**Say it:** "`useMemo` caches a value, `useCallback` caches a function — I use them to stabilize references for memoized children or skip expensive work, only where profiling shows it pays off."
**Red flag:** Wrapping every value and callback "for performance." The memoization and dependency checks aren't free; unmeasured, they often add overhead without preventing any real re-render.

### Fiber internals
**They ask:** "Explain how Fiber is implemented and how a render actually proceeds."

Fiber's implementation is what makes concurrent rendering possible: React keeps *two* trees and does interruptible work on one while the other stays live on screen — so an in-progress render can be thrown away without the user ever seeing a half-finished UI. Inaccuracies aside, that double-buffering is the core idea.

Each fiber node holds its type, props, state, and pointers (`child`, `sibling`, `return`). React maintains the `current` tree (what's on screen) and builds a `workInProgress` tree during the render phase. It walks the work-in-progress tree in a loop, one fiber at a time, and between units it checks whether it should yield to the browser (using a scheduler with time-slicing). If higher-priority work arrives, it can discard the in-progress tree and start over.

The render phase (building work-in-progress, running components, diffing) is interruptible and side-effect-free. The commit phase — swapping `workInProgress` to become `current` and mutating the DOM, running layout effects — is synchronous and uninterruptible.

**Say it:** "Fiber double-buffers two trees: an interruptible render phase builds work-in-progress, and a synchronous commit phase swaps it in — so partial renders never reach the screen."
**Red flag:** Describing render and commit as one atomic step. Separating the interruptible render from the atomic commit is exactly what lets React pause and prioritize.

### Scheduler priorities
**They ask:** "Explain in depth how React's prioritization works."

React's scheduling exists to protect *perceived responsiveness*: urgent interactions must never be blocked by slower background rendering, so React assigns every update a priority and renders the highest first — interrupting lower-priority work if it has to.

React tracks priority with **lanes** — a bitmask where each bit is a priority band (synchronous/discrete input, default, transition, idle). An update from a click or keystroke lands in a high-priority lane and is flushed urgently. An update wrapped in `startTransition` lands in the transition lane, rendered in the background and interruptible. When a high-priority update arrives mid-render, React can abandon the in-progress low-priority render, handle the urgent one, then restart the background work.

```jsx
setInput(value);                         // urgent lane
startTransition(() => setResults(next)); // transition lane, yields to input
```

`useDeferredValue` is the read-side counterpart: it lets a value lag behind so an expensive subtree renders at low priority while the input stays snappy.

**Say it:** "React groups updates into priority lanes, flushes urgent ones like input synchronously, and renders transitions in the background where they can be interrupted and restarted."
**Red flag:** Saying transitions "make things faster." They don't reduce work — they reorder it so urgent updates win, trading a slightly stale background for a responsive foreground.

### setState and batching
**They ask:** "Why is `setState` asynchronous, and how do the updater form and callback work?"

`setState` is asynchronous because React *batches* multiple updates into a single re-render — that batching is a performance decision: several state changes in one event produce one render, not one per call. The trade-off is that `this.state` (or the state variable) doesn't update on the line after you set it.

That's why the updater form matters. When the next value depends on the current one, pass a function so React applies each update against the latest queued state, not the stale snapshot:

```jsx
setCount(c => c + 1);
setCount(c => c + 1); // both apply → +2, not +1
```

In a class, `setState` takes an optional second-argument callback that runs after the re-render commits; in function components you read the committed value in a `useEffect` keyed on that state. Since React 18, batching is automatic everywhere — event handlers, promises, timeouts — not just React event handlers.

**Say it:** "`setState` is async so React can batch changes into one render; use the updater function when the next value depends on the previous one, and a post-commit callback or effect to act on the result."
**Red flag:** Reading state immediately after setting it and expecting the new value. It's still the old snapshot until the next render — use the updater form and don't rely on synchronous reads.

### Lifecycle methods
**They ask:** "Walk me through the main lifecycle methods and what each is for."

Lifecycle methods let a class component hook into React's phases — mounting, updating, unmounting — so you can run setup, respond to changes, and clean up at the right moment; knowing them still matters because they map directly to what hooks now express.

**Mounting:** `constructor` (init state, bind handlers), `render` (return elements, must be pure), `componentDidMount` (run after first paint — fetch data, set up subscriptions). **Updating:** `render` again, then `componentDidUpdate(prevProps, prevState)` (react to changes, e.g. refetch when an id changed — always guard with a comparison to avoid loops). **Unmounting:** `componentWillUnmount` (tear down subscriptions, timers, listeners). `getDerivedStateFromProps` and `getSnapshotBeforeUpdate` cover rarer cases; `componentDidCatch`/`getDerivedStateFromError` power error boundaries.

The hooks equivalents: `useState`/`useMemo` for the constructor, `useEffect(fn, [])` for mount + unmount cleanup, `useEffect(fn, [dep])` for update.

**Say it:** "Mount, update, unmount — `componentDidMount` for setup, `componentDidUpdate` for reacting to changes, `componentWillUnmount` for cleanup, and `useEffect` collapses all three."
**Red flag:** Fetching or subscribing in `render` (or the render body). Render must be pure and can run many times; side effects belong in `componentDidMount`/`useEffect`.

### PureComponent and memo
**They ask:** "What are `PureComponent` and `React.memo` for, why did they appear, and how do they differ from a plain component?"

Both exist to skip re-renders a component doesn't need — the problem they solve is a parent re-rendering and dragging every child along even when the child's props didn't change. They cut that wasted work with a shallow props (and state) comparison.

`PureComponent` is the class version: it implements `shouldComponentUpdate` as a shallow compare of props and state, so it re-renders only when a top-level value actually changed. `React.memo` is the function-component equivalent — a wrapper that shallow-compares props and reuses the last render if they're equal.

```jsx
const Row = React.memo(function Row({ item }) { /* ... */ });
```

The difference from a plain `Component`/function is only the bail-out check. And "shallow" is the catch: a new object or array literal (or an inline function) is a different reference every render, so the optimization silently does nothing.

**Say it:** "`PureComponent` and `React.memo` shallow-compare props to skip re-renders, so they only help when the props you pass keep stable references."
**Red flag:** Wrapping a component in `memo` while passing `style={{...}}` or `onClick={() => ...}` inline. Fresh references defeat the comparison — stabilize the props (`useMemo`/`useCallback`) or the memo is dead weight.

### Refs and forwardRef
**They ask:** "What are refs for, and how does `forwardRef` fit in?"

Refs give you an imperative handle to a DOM node or a mutable value without re-rendering — used when you must focus, scroll, measure, or otherwise touch a node directly. The wrinkle is that a ref attached to *your* component doesn't automatically reach the DOM node inside it, because refs aren't passed through like props.

`forwardRef` solves that: it lets a component receive a ref and forward it to a specific child element, so a parent can control a DOM node buried inside a reusable component.

```jsx
const Input = forwardRef(function Input(props, ref) {
  return <input ref={ref} {...props} />;
});
// parent: <Input ref={inputRef} /> → inputRef.current is the <input>
```

`useImperativeHandle` pairs with it to expose a curated method surface (e.g. a `focus()`) instead of the raw node. (Note: React 19 lets you take `ref` as a normal prop, but `forwardRef` remains the pattern to know.)

**Say it:** "`forwardRef` passes a ref through your component to a child DOM node, so a parent can imperatively control an element inside a reusable component."
**Red flag:** Using refs to read or push state between components. Refs are for imperative DOM access; data that drives UI belongs in state or props.

### React Context
**They ask:** "Explain the concept of React Context and when you'd use it."

Context is a **dependency-injection** tool, not a state manager — its job is to pass data through the tree without threading props at every level, which is what you want for values many components need but few components set. Think theme, locale, current user, auth.

You create a context, wrap a subtree in its Provider with a value, and any descendant reads it with `useContext`:

```jsx
const ThemeContext = createContext('light');
<ThemeContext.Provider value={theme}>
  <App />
</ThemeContext.Provider>
// deep child: const theme = useContext(ThemeContext);
```

The crucial mechanic: every consumer re-renders whenever the provider's value changes — there's no selector to subscribe to a slice. That makes Context perfect for low-frequency updates and a poor fit for high-frequency state, where a store like Redux or Zustand lets components subscribe to just the slice they use.

**Say it:** "Context is dependency injection for low-frequency shared data like theme or auth — every consumer re-renders on any value change, so it's not a substitute for a selective state store."
**Red flag:** Reaching for Context as a general state manager for fast-changing data. Without slice-level subscriptions, one change re-renders every consumer; use a real store for high-frequency state.
