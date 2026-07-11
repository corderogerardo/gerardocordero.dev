# React — core (part 3)

### Choosing useState, useReducer, useContext
**They ask:** "You have three state hooks — how do you decide which one a piece of state belongs in?"

The decision is about *where* state lives and *how complex its transitions are*, and getting it wrong is what turns a component into spaghetti. `useState` is for independent values with simple set-and-forget updates. `useReducer` is for state where the *next* value depends on the *previous* one through several named transitions — it centralizes that logic in a pure reducer you can test in isolation. `useContext` isn't state at all; it's the read side of dependency injection, letting a subtree consume a value without prop-drilling.

```jsx
const [state, dispatch] = useReducer(reducer, { items: [], status: 'idle' });
// dispatch({ type: 'add', item }) — transitions live in one pure function
const theme = useContext(ThemeContext); // inject, don't drill
```

Reach for `useReducer` the moment you have three-plus related fields or updates that fire from many handlers. Pair `useReducer` with `useContext` and you have a lightweight store for a feature — dispatch travels down, no library needed.

**Say it:** "useState for independent values, useReducer when the next state derives from the previous through named actions, and Context to inject a value into a subtree — Context reads state, it doesn't own it."
**Red flag:** Calling Context a state manager. Every consumer re-renders on any provider value change; it's a transport for low-frequency values, not a performant store.

### Custom Hooks
**They ask:** "What's a custom hook, and what does extracting one actually buy you?"

A custom hook exists to make *stateful logic* reusable — the thing components couldn't share before hooks without render props or HOC wrappers. It's just a function whose name starts with `use` and that calls other hooks; it shares logic, never state. Two components calling `useAuth()` each get their own isolated state, because the hook runs fresh in each caller's render.

```jsx
function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
```

The `use` prefix isn't cosmetic — it's how the linter and React know to enforce the Rules of Hooks inside it. Good custom hooks have a clear return contract (a value, a tuple, or an object) and hide the effect/cleanup wiring so the component reads declaratively.

**Say it:** "Custom hooks extract stateful logic, not state — each caller gets its own isolated instance, so `useDebouncedValue` in two components debounces independently."
**Red flag:** Thinking a custom hook shares state between components. It shares behavior; state is per-call. If you need shared state, lift it or use a store.

### useRef, useImperativeHandle, useLayoutEffect, useDebugValue
**They ask:** "Walk me through the less common hooks — when do you actually reach for each?"

These are the escape hatches for when the declarative model isn't enough. `useRef` holds a mutable value that survives re-renders *without triggering one* — perfect for DOM nodes or a timer id you don't want in state. `useLayoutEffect` runs synchronously after DOM mutations but before the browser paints, so it's for measuring layout and adjusting it flicker-free. `useImperativeHandle` (with `forwardRef`) lets a component expose a controlled imperative API — `focus()`, `scrollTo()` — instead of leaking its whole DOM node. `useDebugValue` just labels a custom hook in React DevTools.

```jsx
const Input = forwardRef((props, ref) => {
  const inner = useRef(null);
  useImperativeHandle(ref, () => ({ focus: () => inner.current.focus() }));
  return <input ref={inner} {...props} />;
});
```

Prefer `useEffect` by default; `useLayoutEffect` blocks paint, so only use it when you'd otherwise see a visual jump.

**Say it:** "useRef for mutable values that shouldn't re-render, useLayoutEffect to measure before paint, and useImperativeHandle to expose a narrow imperative API instead of the raw node."
**Red flag:** Reaching for `useLayoutEffect` everywhere "to be safe." It blocks the browser from painting — default to `useEffect` and only escalate when you measure a flicker.

### Testing Components, HOCs, and Modals
**They ask:** "How do you test different kinds of React entities — a plain component, a utility, a HOC, a modal rendered in a portal?"

The principle first: test behavior the user observes, not implementation details, so refactors don't break your suite. Plain utilities are pure functions — assert input/output. Components: render and assert on visible output and interactions, using Testing Library queries by role/text rather than internal state. A HOC is tested through a stub component you wrap, asserting the props it injects. Modals rendered through a portal land outside the component's DOM subtree, so you query the whole document.

```jsx
render(<Modal open>Hi</Modal>);
expect(screen.getByRole('dialog')).toHaveTextContent('Hi'); // portal still in document.body
await userEvent.click(screen.getByRole('button', { name: /close/i }));
```

React Testing Library queries `document.body`, so portals just work. For a HOC, render `withAuth(Probe)` and assert `Probe` received the expected `user` prop.

**Say it:** "I test the contract, not the internals — visible output and interactions for components, injected props for HOCs, and I query the whole document for portalled modals."
**Red flag:** Asserting on internal state or instance methods with Enzyme's `.state()`. It couples tests to implementation; query rendered output so a refactor that keeps behavior keeps tests green.

### Snapshot Testing
**They ask:** "When is snapshot testing genuinely useful, and when does it become noise?"

Snapshot testing serializes rendered output and diffs it against a stored baseline, so its value is catching *unintended* markup changes cheaply — a guardrail, not a specification. It shines on stable, presentational components and on serializable data (a formatted object, a reducer's output). It becomes noise when snapshots are huge, cover volatile UI, or when the team's habit is to press `--updateSnapshot` on every failure without reading the diff — at which point the test asserts nothing.

```jsx
it('renders the badge', () => {
  const { asFragment } = render(<Badge count={3} />);
  expect(asFragment()).toMatchSnapshot();
});
```

Keep snapshots small and reviewable; prefer inline snapshots for tiny output so the expectation lives in the test file. Pair them with explicit assertions for the behavior that actually matters — a snapshot proves "nothing changed," never "this is correct."

**Say it:** "Snapshots are a cheap regression guard for stable output — small and reviewed on every diff; the moment people rubber-stamp updates, the test stops asserting anything."
**Red flag:** Snapshotting whole pages. Massive, churny snapshots get blindly updated and catch nothing — scope them to stable units and back them with real assertions.

### End-to-End Testing with Cypress
**They ask:** "What do e2e tests give you that unit and integration tests don't, and how does Cypress fit?"

E2E tests are the only layer that proves the *whole system* works together — real browser, real routing, real network — so they catch integration gaps unit tests can't see: a broken redirect, a misconfigured API, a build that ships. Cypress drives an actual browser, runs in the same event loop as the app, and auto-waits for elements, which kills most flakiness from arbitrary sleeps.

```js
cy.visit('/login');
cy.findByLabelText('Email').type('a@b.com');
cy.findByRole('button', { name: /sign in/i }).click();
cy.location('pathname').should('eq', '/dashboard');
```

Because they're slow and broad, keep e2e to critical user journeys — login, checkout, the money paths — and push edge cases down to faster unit/integration tests. That's the testing pyramid: many unit, fewer integration, a thin layer of e2e.

**Say it:** "E2E proves the full stack works end to end in a real browser; I keep it to critical journeys and cover edge cases lower down where tests are fast."
**Red flag:** Trying to test every branch through Cypress. E2E is slow and flaky at volume — reserve it for high-value journeys and let the pyramid carry the rest.

### Reducers and Redux Toolkit
**They ask:** "How do you write reducers today — still switch/case, or Redux Toolkit? What changed?"

A reducer must stay a pure function `(state, action) => newState` that returns a *new* reference on change — that immutability is what lets Redux and `connect`/`useSelector` detect updates by reference equality. The classic form is a `switch` on `action.type` spreading previous state. Redux Toolkit's `createSlice` is the modern default because it removes the boilerplate and the biggest footgun: it uses Immer, so you write "mutating" code that's applied immutably under the hood.

```js
const cart = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    add: (state, action) => { state.items.push(action.payload); }, // Immer-safe
  },
});
export const { add } = cart.actions;
```

RTK auto-generates action creators and types, and `configureStore` wires the DevTools and thunk middleware by default. The switch/case knowledge still matters — it's what Immer abstracts.

**Say it:** "Reducers are pure and return new references; I default to Redux Toolkit's createSlice so Immer handles immutability and I stop hand-writing action types and spreads."
**Red flag:** Mutating state in a hand-written reducer (`state.items.push(...)` then returning `state`). Same reference means the store thinks nothing changed and components don't re-render — inside `createSlice` it's fine because Immer intercepts it.

### Writing Custom Middleware
**They ask:** "Redux middleware — what is it, and can you write one?"

Middleware is Redux's extension point: it sits between dispatching an action and the moment it reaches the reducer, so it's where side effects, logging, and async live without polluting pure reducers. The signature is a curried triple — `store => next => action` — and the chain is what makes async libraries like thunk possible.

```js
const logger = store => next => action => {
  console.log('dispatching', action.type);
  const result = next(action); // pass along; skip to short-circuit
  console.log('next state', store.getState());
  return result;
};
```

Call `next(action)` to pass control down the chain (eventually to the reducer); don't call it, and you swallow the action. Call `store.dispatch` instead and you restart the chain from the top. Thunk is just middleware that checks `typeof action === 'function'` and calls it with `dispatch`.

**Say it:** "Middleware is `store => next => action` sitting between dispatch and the reducer — `next(action)` continues the chain, and that's exactly how thunk intercepts function actions for async."
**Red flag:** Forgetting to return `next(action)`. Downstream middleware and `dispatch`'s return value break — always pass the action along unless you deliberately short-circuit it.

### Selectors
**They ask:** "What problem do selectors solve, and why memoize them?"

Selectors decouple components from the *shape* of the store — components ask "give me the visible todos," not "reach into `state.todos.byId` and filter." That indirection means you can restructure state without touching every consumer. The second job is performance: a memoized selector (Reselect's `createSelector`) recomputes derived data only when its inputs change, and returns the *same reference* otherwise, so `useSelector` doesn't trigger needless re-renders.

```js
const selectVisibleTodos = createSelector(
  [state => state.todos, state => state.filter],
  (todos, filter) => todos.filter(t => t.status === filter) // recomputed only on input change
);
```

Without memoization, a selector that `.filter()`s returns a new array every call, and `useSelector`'s reference check sees "changed" on every dispatch — re-rendering the component even when the data is identical.

**Say it:** "Selectors hide store shape and derive data; I memoize with createSelector so derived arrays keep a stable reference and useSelector only re-renders when inputs actually change."
**Red flag:** Doing `.filter()`/`.map()` inline in `useSelector`. A fresh array every dispatch fails the reference check and re-renders constantly — memoize the derivation.

### Redux-Form
**They ask:** "What is redux-form, and how does it fit the Redux ecosystem?"

Redux-form keeps *form state* — values, touched fields, errors, submitting flag — inside the Redux store instead of local component state, which is its whole premise and also its main cost. You connect a form with its `reduxForm()` HOC and register inputs with its `Field` component; every keystroke dispatches an action and updates the store.

```jsx
let SignIn = ({ handleSubmit }) => (
  <form onSubmit={handleSubmit}>
    <Field name="email" component="input" type="email" />
  </form>
);
SignIn = reduxForm({ form: 'signIn' })(SignIn);
```

Be honest about the trade-off in an interview: routing every keystroke through Redux causes broad re-renders and bloats the store with ephemeral UI state. That's why the ecosystem moved to Formik and React Hook Form, which keep form state local and only touch the store on submit. Know redux-form's API, but frame it as legacy.

**Say it:** "Redux-form stores the entire form lifecycle in the Redux store via its reduxForm HOC and Field components — powerful, but keystroke-level dispatches are why React Hook Form and Formik replaced it."
**Red flag:** Recommending redux-form for a greenfield form. Form state is ephemeral and local — putting every keystroke in global state is the anti-pattern; reach for React Hook Form instead.

### Redux Alternatives: MobX and Sagas
**They ask:** "Name an alternative to plain Redux and explain the different philosophy."

The point of naming an alternative is showing you understand the *trade-off space*, not just one tool. MobX is a different paradigm entirely — reactive/observable state: you mark data observable, components that read it auto-subscribe, and mutations trigger precise re-renders. Far less boilerplate than Redux's explicit actions/reducers, at the cost of Redux's strict one-way, time-travelable data flow. Redux-Saga is not an alternative *store* but an alternative to thunks for async: it models side effects as generator functions, so complex flows (debounce, cancel, retry, race) become readable, testable sequences.

```js
function* onSearch() {
  yield takeLatest('search', function* (action) {
    const results = yield call(api.search, action.query); // cancellable
    yield put({ type: 'searchDone', results });
  });
}
```

`takeLatest` auto-cancels the previous search — the kind of concurrency control that's awkward in a thunk.

**Say it:** "MobX trades Redux's explicit one-way flow for reactive observables and less boilerplate; Redux-Saga keeps Redux but models async as cancellable generator flows — I'd pick Saga when side-effect orchestration gets complex."
**Red flag:** Presenting these as strictly better than Redux. MobX gives up time-travel and explicitness; Sagas add a generator learning curve. Frame each as a trade-off, not an upgrade.

### Fiber Internals
**They ask:** "Explain Fiber at a deep level — what is a fiber node and how does the two-phase work loop function?"

Fiber is the reconciler rewritten so rendering can be *interrupted*, which is the whole reason concurrent features exist — before Fiber, reconciliation was a synchronous recursion that blocked the main thread until done. A fiber is a plain JS object representing a unit of work for one element: its type, props, and pointers (`child`, `sibling`, `return`) forming a linked-list tree that React can traverse iteratively and pause.

Work happens in two phases. The **render/reconcile** phase builds a work-in-progress tree, diffing against the current one and flagging effects — this phase is interruptible and produces no visible output. The **commit** phase applies those effects to the DOM in one synchronous, uninterruptible pass. React keeps two trees (`current` and `work-in-progress`) and swaps them on commit — double-buffering, so a half-built tree is never shown.

**Say it:** "A fiber is a unit of work as a linked-list node; the render phase builds a work-in-progress tree and can be paused, and the commit phase flushes it to the DOM synchronously — that split is what makes rendering interruptible."
**Red flag:** Saying Fiber made React faster. Raw throughput is similar; Fiber made work *interruptible and prioritizable* — it's about responsiveness and scheduling, not speed.

### Fiber Work Prioritization
**They ask:** "How does React decide what to render first — explain the scheduling model fully."

Prioritization exists so urgent updates (a keystroke, a click) never wait behind slow ones (rendering a huge filtered list) — that's what keeps an app responsive under load. React assigns each update a priority (a "lane"), and because the render phase is broken into interruptible fiber units, the scheduler can pause low-priority work, service a high-priority update, then resume — checking against the browser's frame budget so it yields rather than blocking.

```jsx
const [isPending, startTransition] = useTransition();
startTransition(() => setQuery(input)); // low priority; keystroke stays responsive
```

`startTransition` is how you *declare* an update non-urgent: the input's own state updates at high priority (typing stays instant) while the expensive re-render it triggers runs as an interruptible transition. If a more urgent update arrives mid-transition, React throws away the in-progress work and restarts — which is safe precisely because the render phase has no side effects.

**Say it:** "React tags updates with lane priorities and, because render is interruptible, pauses low-priority work for urgent input — startTransition is how I mark an expensive update non-urgent so typing stays smooth."
**Red flag:** Claiming everything renders in strict order. Concurrent React can interrupt, abandon, and restart renders by priority — that restart-safety is exactly why the render phase must stay side-effect-free.

### Recursion Over Child Elements
**They ask:** "Why does reconciliation involve recursion over children, and how does React apply it in practice?"

A UI tree is recursive by nature — a component renders children that render their own children — so reconciliation has to descend the whole tree to diff it, conceptually a recursion on child elements. React compares children position by position: same type at the same position means reuse and update the existing fiber; different type means tear down the subtree and rebuild. This is also *why keys exist* — for lists, position isn't stable, so keys tell React which child is which across renders, turning an O(n) reorder into a match instead of a destroy-and-recreate.

```jsx
{items.map(item => <Row key={item.id} data={item} />)} // key = stable identity
```

In modern Fiber the "recursion" is implemented as an iterative walk over the linked-list tree (`child`/`sibling`/`return` pointers) so it can pause — but the mental model is still a depth-first traversal of children.

**Say it:** "Reconciliation descends children depth-first, matching by type and position; keys give list children stable identity so a reorder reuses fibers instead of destroying and rebuilding subtrees."
**Red flag:** Using array index as a key for a reorderable list. Index ties identity to position, so React reuses the wrong fiber on reorder — state and DOM leak across rows. Use a stable domain id.

### How React Router Works
**They ask:** "Explain how React Router works internally — could you sketch a minimal version?"

React Router turns the URL into a *piece of application state* so navigation stays a client-side render, not a full page reload — that's the core value in a SPA. It listens to the browser's History API (`pushState`/`popstate`), keeps the current location in context, and re-renders the matching route when it changes. `Route` components subscribe to that location and render when their path matches; `Link` calls `history.push` instead of doing a real navigation.

```jsx
function useLocation() {
  const [loc, setLoc] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setLoc(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return loc;
}
```

That hook plus a `push` that calls `history.pushState` then updates state is the essence: a `Route` matches `loc` against its path, a `Link` prevents the default and pushes. Everything else is matching semantics and nesting.

**Say it:** "React Router makes the URL app state — it wraps the History API, holds location in context, and re-renders matching routes; Link pushes to history instead of reloading the page."
**Red flag:** Describing it as "just anchor tags." Plain `<a>` triggers a full reload and loses SPA state — Router intercepts navigation and updates via the History API so it's a client render.

### Routing Hooks
**They ask:** "Which hooks does React Router expose, and when would you write your own routing hook?"

Router hooks exist so components read navigation state without prop-drilling `history`/`match` through every level — the class-era pain the HOC `withRouter` used to solve. React Router v6 exposes `useNavigate` (imperative navigation), `useParams` (dynamic segments), `useLocation` (current location + state), and `useSearchParams` (query string as state).

```jsx
const navigate = useNavigate();
const { id } = useParams();
const [params, setParams] = useSearchParams();
navigate(`/user/${id}`, { replace: true });
```

You write a *custom* routing hook to encapsulate a repeated navigation concern — a `useQueryParam(key)` that reads/writes a single search param, or a `useRequireAuth()` that redirects when there's no session. Composing the built-in hooks keeps that logic in one testable place instead of scattered `navigate` calls.

**Say it:** "v6 gives me useNavigate, useParams, useLocation, and useSearchParams; I wrap them in custom hooks like useQueryParam or useRequireAuth to keep navigation concerns in one testable place."
**Red flag:** Still reaching for `withRouter` and `this.props.history` in new code. That's the v5/class pattern — v6 is hooks-first, and `withRouter` was removed.

### Router Types: Browser, Static, Memory
**They ask:** "What's the difference between BrowserRouter, StaticRouter, HashRouter, and MemoryRouter?"

They differ only in *where the location lives*, and picking the right one is an environment decision, not a preference. `BrowserRouter` uses the HTML5 History API and real URLs (`/users/1`) — the default for browser apps, but it needs the server to serve `index.html` for every path. `HashRouter` keeps the route after a `#`, so the server never sees it — the fallback for static hosts you can't configure. `StaticRouter` takes a fixed location and never listens for changes — it's the SSR router, where you render one specific URL on the server. `MemoryRouter` keeps history in memory with no URL bar at all — ideal for tests and React Native.

```jsx
<StaticRouter location={req.url}>  {/* server: render this one URL */}
  <App />
</StaticRouter>
```

**Say it:** "They vary by location source: BrowserRouter for real URLs, HashRouter when the server can't be configured, StaticRouter for SSR, and MemoryRouter for tests and React Native."
**Red flag:** Using `BrowserRouter` for SSR. It reads `window.history`, which doesn't exist on the server — SSR needs `StaticRouter` fed the incoming request URL.

### history, location, match
**They ask:** "What are the history, location, and match objects, and how do they differ from the native browser equivalents?"

These three carry all of a route's context, and the distinction from native matters because React Router's versions are *React-aware* — changing them re-renders subscribed components, which the raw browser objects don't. `history` is the imperative API — `push`, `replace`, `go` — a wrapper over the native History API that also notifies the router. `location` is the current URL broken into `pathname`, `search`, `hash`, plus a `state` field for data you attach to a navigation without putting it in the URL. `match` describes how the current path matched a route — the matched `path`, the concrete `url`, and extracted `params`.

```jsx
navigate('/checkout', { state: { from: 'cart' } }); // location.state, not in the URL
```

Versus native: `window.location` is a live string-y object with no React integration, and `window.history` gives you `state` but no `params`, no pattern matching, and no re-render on change.

**Say it:** "history navigates, location describes the current URL plus attached state, and match holds the pattern and params — unlike the native objects, mutating them re-renders subscribed components."
**Red flag:** Manipulating `window.history.pushState` directly inside a Router app. It changes the URL but the router never hears about it, so nothing re-renders — go through `navigate`/`history`.

### Connected React Router
**They ask:** "What is connected-react-router, why use it, and how would you build it from scratch?"

Connected-react-router synchronizes React Router's history with the Redux store, so the current location becomes part of state — useful when you want route changes visible in Redux DevTools time-travel, or want to dispatch navigation from sagas/thunks. Mechanically it does two things: a reducer stores the latest location, and a middleware translates navigation actions (`push('/x')`) into real `history.push` calls, while a listener on `history` dispatches `LOCATION_CHANGE` back into the store.

```js
history.listen((location) => store.dispatch({ type: 'LOCATION_CHANGE', location }));
// middleware: on push() action -> history.push(action.payload)
```

From scratch that's: (1) a `router` reducer keyed on `LOCATION_CHANGE`, (2) a middleware that intercepts push/replace actions and calls the history methods, (3) subscribing to `history` to feed changes back. Be honest that it's a v5-era library; the modern successor is `redux-first-history`, and most apps no longer need routing in Redux at all now that hooks read location directly.

**Say it:** "It mirrors router location into the Redux store via a reducer plus a history-syncing middleware, so navigation is time-travelable and dispatchable — though redux-first-history superseded it and most apps don't need routing in Redux anymore."
**Red flag:** Proposing it for a new app "to centralize routing." It adds coupling and boilerplate for a problem hooks already solve — only reach for store-synced routing when you genuinely need navigation in Redux DevTools or sagas.

### Component vs PureComponent Profiling
**They ask:** "When do you choose Component over PureComponent, and how do you find what's actually re-rendering too much?"

The choice is about *how much you trust your props*, because `PureComponent`'s shallow-compare `shouldComponentUpdate` is a bet: it skips renders when props/state are shallow-equal, which pays off for expensive components with stable props but *costs* extra comparisons — and silently breaks — when you pass fresh object/array/function literals every render. Use `PureComponent`/`React.memo` for pure, frequently-rendered leaves with primitive or stable-reference props; plain `Component` when props always change or comparison is pointless.

The senior half is measurement. Don't guess — profile:

1. Open the React DevTools **Profiler**, record an interaction.
2. Read the flame graph for components that render on every commit.
3. Check *why* — DevTools shows "why did this render" (props/state/hooks).
4. Fix the specific cause: memoize the prop, stabilize the callback, or split the component.

**Say it:** "PureComponent is a shallow-compare bet that only pays off with stable props; I profile with the DevTools Profiler to find real re-render hotspots before memoizing anything."
**Red flag:** Wrapping everything in PureComponent/memo "to be safe." With inline `{}`/`[]`/`() =>` props the shallow compare always fails — you pay the comparison cost and gain nothing. Measure first, stabilize the props.

### Reselect and Recompose API
**They ask:** "Explain the Reselect and Recompose APIs in depth."

Both are functional-composition libraries, but they solve opposite problems. **Reselect** builds memoized selectors: `createSelector` takes input selectors and a result function, recomputes only when an input's *reference* changes, and caches the last result — so derived data stays stable and cheap. Its subtlety is cache size one by default: a selector shared across many components with different arguments thrashes, which is why `createSelectorCreator` / per-component selector factories exist.

```js
const makeSelectById = () => createSelector(
  [s => s.items, (_, id) => id],
  (items, id) => items.find(i => i.id === id) // per-instance cache avoids thrash
);
```

**Recompose** was a toolbox of HOCs — `withState`, `withHandlers`, `compose`, `branch`, `lifecycle` — for composing behavior into function components *before hooks existed*. Its author deprecated it when hooks shipped, because hooks do the same composition natively without the wrapper-hell. Know it for legacy code; write custom hooks for new work.

**Say it:** "Reselect memoizes derived state with createSelector — mind the size-one cache, so use selector factories per instance; Recompose composed behavior via HOCs but hooks replaced it, so it's legacy."
**Red flag:** Sharing one memoized selector across list items with different ids. The single-entry cache invalidates on every call and memoization does nothing — use a per-instance selector factory.

### List Virtualization
**They ask:** "What is virtualization and why does rendering a long list need it?"

The DOM is the bottleneck: rendering ten thousand rows mounts ten thousand nodes, blowing memory and making scroll janky, even though the user sees maybe twenty at a time. Virtualization (windowing) renders only the visible slice plus a small buffer, and as the user scrolls it recycles rows — swapping data into a roughly constant set of DOM nodes — while a sized spacer keeps the scrollbar honest.

```jsx
<FixedSizeList height={600} itemCount={10000} itemSize={40} width="100%">
  {({ index, style }) => <div style={style}>{rows[index].name}</div>}
</FixedSizeList>
```

Libraries like `react-window` and `react-virtualized` handle the math; the `style` with absolute positioning is what places each visible row. The trade-offs to name: variable-height rows need measurement, `Ctrl+F` won't find off-screen content, and accessibility/anchor links to hidden items need handling. It's the go-to when a list is large enough that mounting all of it is the actual cost.

**Say it:** "Virtualization renders only the visible window and recycles DOM nodes as you scroll, so a 10k-row list keeps a near-constant node count — I reach for react-window when full-list mounting is the measured bottleneck."
**Red flag:** Virtualizing a 30-item list. It adds complexity and breaks find-in-page for no gain — virtualization is for lists big enough that mounting them all is the real cost.

### Avoiding Over-Memoization
**They ask:** "useMemo and useCallback have a cost too — how do you decide when they're worth it?"

Every `useMemo`/`useCallback` adds memory for the cached value plus a dependency comparison on every render — so wrapping cheap work makes the app *slower*, not faster. They earn their keep in exactly two cases: (1) memoizing a genuinely expensive computation, and (2) stabilizing a reference (object, array, or callback) that a memoized child or a hook dependency array relies on to skip work.

```jsx
const onSelect = useCallback(id => dispatch(select(id)), [dispatch]);
return <MemoizedRow onSelect={onSelect} />; // stable ref lets memo actually skip
```

The tell for a *useless* memo: the value is a primitive or trivial expression, or the memoized value flows into a child that isn't memoized anyway. If nothing downstream does a reference check, `useMemo` just burns cycles. Profile first; add memoization to fix a *measured* re-render or a slow computation, not on reflex.

**Say it:** "Memoization isn't free — it costs memory and a deps check — so I only use it for expensive computations or to stabilize a reference a memoized child depends on, and I confirm the win with the profiler."
**Red flag:** `useMemo(() => a + b, [a, b])` or callbacks passed to non-memoized children. The comparison costs more than recomputing, and an unmemoized child re-renders regardless — remove it.

### Lazy and Dynamic Imports
**They ask:** "How does lazy loading work in React, and what actually happens at the bundle level?"

Lazy loading exists to cut *initial* bundle size — you ship only what the first screen needs and defer the rest, so time-to-interactive drops. It rides on the dynamic `import()` expression, which the bundler treats as a code-split point: everything under that import becomes a separate chunk fetched on demand. `React.lazy` wraps a dynamic import into a component, and `Suspense` renders a fallback while the chunk is in flight.

```jsx
const Settings = React.lazy(() => import('./Settings')); // its own chunk
<Suspense fallback={<Spinner />}>
  <Settings />
</Suspense>
```

The natural boundaries are route level (each page a chunk) and heavy, rarely-used widgets (a chart, an editor). Trade-off to name: too granular and you trade one big download for many round-trips; combine with prefetching (`import(/* webpackPrefetch: true */)`) so the chunk is warm before the user clicks.

**Say it:** "Dynamic import() is a bundler split point; React.lazy turns it into a component and Suspense shows a fallback while the chunk loads — I split at routes and heavy widgets, and prefetch so the click feels instant."
**Red flag:** Splitting every small component. Each chunk is a network round-trip — over-splitting trades one download for many and hurts. Split at meaningful boundaries and prefetch likely-next chunks.

### Concurrent Rendering and Suspense
**They ask:** "Explain the concurrent rendering APIs — useTransition, useDeferredValue, and Suspense for data."

Concurrent rendering lets React *prepare multiple versions of the UI at once* and keep the app responsive during heavy updates — the payoff is no more frozen input while a big list re-renders. `useTransition` marks a state update as non-urgent and gives you an `isPending` flag; the urgent update (typing) commits immediately while the transition renders interruptibly. `useDeferredValue` does the same from the consuming side — it hands you a lagging copy of a value so the expensive subtree can render behind the fresh input.

```jsx
const deferredQuery = useDeferredValue(query);
const results = useMemo(() => filter(list, deferredQuery), [deferredQuery]);
```

`Suspense` extends this to async: a component can "suspend" while data or code loads, and React shows the nearest fallback, coordinating multiple suspensions so you avoid waterfalls. Together they let you express *priority* declaratively instead of hand-rolling debounces and spinners.

**Say it:** "useTransition and useDeferredValue mark work non-urgent so input stays responsive while heavy renders happen interruptibly, and Suspense coordinates async loading with fallbacks — it's declaring priority, not micromanaging spinners."
**Red flag:** Calling it a separate "Concurrent Mode" you switch on. React 18 ships concurrent *features* you opt into per update via these APIs — there's no global mode flag.

### Bundle Optimization and Caching
**They ask:** "Beyond code-splitting, how do you keep a React bundle small and well-cached?"

The goal is twofold: ship less JS, and make the JS you ship *cacheable long-term* so repeat visits are free. Tree shaking drops unused exports — it works only with ES modules and honors `sideEffects: false` in `package.json`, so importing named exports (`import { debounce } from 'lodash-es'`) beats importing the whole library. Split vendor code from app code into separate chunks so a dependency bump doesn't bust the cache on your own code, and use content-hashed filenames so unchanged chunks keep their long `Cache-Control` immutable headers.

```js
// webpack: stable vendor chunk + content hashes
output: { filename: '[name].[contenthash].js' },
optimization: { splitChunks: { chunks: 'all' } },
```

Audit with a bundle analyzer to catch accidental heavyweights (moment, full lodash, duplicate deps). React's own lever: build in production mode so dev warnings and PropTypes checks are stripped.

**Say it:** "Tree-shake via ES module named imports, split vendor from app code, and use content-hashed filenames with immutable caching so unchanged chunks stay cached across deploys — then verify with a bundle analyzer."
**Red flag:** `import _ from 'lodash'` for one function. It defeats tree shaking and pulls the whole library — import the specific function or use `lodash-es` named imports.

### Profiling with DevTools
**They ask:** "Walk me through profiling a slow React screen with the DevTools."

Profiling turns "it feels slow" into a specific, fixable cause — the senior move is never guessing. The React DevTools **Profiler** records commits during an interaction and shows a flame graph of what rendered and how long each took. The workflow:

1. Enable "Record why each component rendered" in settings.
2. Record the slow interaction, then stop.
3. Read the commit list — spikes are the expensive commits.
4. In the flame graph, find components that rendered unexpectedly; DevTools tells you *why* (props changed, hook changed, parent re-rendered).
5. Fix the specific cause — stabilize a prop, memoize a child, or lift/split state — then re-record to confirm.

For state, **Redux DevTools** gives you the action log, state diffs per action, and time-travel — invaluable for catching an action that mutates too broadly. Pair the two: Redux DevTools finds the over-broad dispatch, React Profiler shows the re-render fallout.

**Say it:** "I record the interaction in the Profiler, read the flame graph for unexpected renders, use 'why did this render' to find the cause, fix that one thing, then re-record to confirm the win."
**Red flag:** Optimizing from intuition before profiling. You'll memoize the wrong component and add complexity with no measured gain — record first, fix the specific hotspot, verify.

### Service Worker Registration
**They ask:** "How do service workers work, and what are the common reasons one fails to register?"

A service worker is a script the browser runs *separate from the page*, acting as a programmable network proxy — that's what enables offline support, asset caching, and push, none of which the page thread can do. It has a lifecycle: `register` → `install` (precache assets) → `activate` (clean old caches) → it intercepts `fetch` events and can serve from the Cache Storage API.

```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js'); // scope defaults to the file's directory
}
```

Registration failures cluster around a few causes worth naming: it's **not served over HTTPS** (required, except `localhost`); the **scope** is wrong (a worker at `/js/sw.js` can only control `/js/`, so it must sit at the root to control the whole app); the **MIME type** is wrong (`sw.js` must be served as JavaScript); or a stale worker is cached and skipping updates without `skipWaiting`.

**Say it:** "A service worker is a network proxy with an install/activate/fetch lifecycle for offline and caching; registration fails on non-HTTPS, wrong scope, wrong MIME type, or a stale worker — those are the first things I check."
**Red flag:** Expecting a worker at a subpath to control the whole site. Scope is bounded by the script's directory — serve `sw.js` from the root (or set `Service-Worker-Allowed`) for app-wide control.

### Server-Side Rendering Deep Dive
**They ask:** "Explain SSR end to end — how does it work, and what does hydration actually do?"

SSR renders React to HTML *on the server* so the user sees meaningful content on first paint and crawlers get real markup — it fixes the two weaknesses of a pure client SPA: slow time-to-content and poor SEO. The server calls `renderToString` (or the streaming `renderToPipeableStream`) to produce HTML from the component tree, sends it, and the browser paints it immediately — but that HTML is inert. Then the same JS bundle loads and **hydration** attaches event listeners and rebuilds React's internal state over the existing DOM, making it interactive.

```jsx
// server
const html = renderToString(<App url={req.url} />);
// client
hydrateRoot(document.getElementById('root'), <App />);
```

The hard rule: the server and client must render *identical* markup, or hydration mismatches and React discards the server DOM. Frameworks — Next.js, Gatsby (SSG), Remix — exist because doing this by hand (data fetching, routing, bundling, streaming) is a lot; streaming SSR + Suspense lets you flush HTML progressively instead of blocking on all data.

**Say it:** "The server renders React to HTML for fast first paint and SEO, then hydration attaches interactivity over that DOM — server and client markup must match exactly, which is why frameworks like Next.js manage the whole pipeline."
**Red flag:** Treating SSR as "just faster." It shifts render cost to the server and demands identical server/client output — mismatches, unguarded `window` access, and hydration cost are real trade-offs you have to manage.

### Batching and setState Timing
**They ask:** "If I call setState three times in a sync handler versus inside a setTimeout or async callback, how many re-renders happen and why?"

The answer hinges on **automatic batching**, and it's a React 18 behavior change worth stating precisely. Batching means React groups multiple state updates into a *single* re-render. In React 18, batching is automatic in *all* contexts — event handlers, promises, `setTimeout`, native callbacks — so three `setState` calls anywhere collapse to one re-render.

```jsx
setCount(c => c + 1);
setName('a');
setFlag(true);
// React 18: one re-render — everywhere, including inside setTimeout/await
```

Before React 18, batching only happened inside React event handlers. The same three calls inside a `setTimeout` or after an `await` each triggered a *separate* re-render — three renders — because those ran outside React's batched context. If you ever need to force a synchronous flush (rare), `flushSync` opts out of batching. Also note updater functions (`c => c + 1`) matter when calls depend on the previous value, since state is stale within the batch.

**Say it:** "React 18 batches automatically everywhere, so three setStates are one re-render whether in a handler or a setTimeout; pre-18 only handlers batched, so async callbacks re-rendered per call — and I use the updater form when each update depends on the last."
**Red flag:** Saying setState is "instant" or reading state right after setting it. State is a snapshot per render — the variable doesn't change until the next render, so depend on the updater function, not the local value.

### Lifecycle Method Order
**They ask:** "Name the class lifecycle methods and explain their execution order across mount, update, and unmount."

Lifecycle methods map to *phases*, and knowing the order matters because side effects belong in specific ones — data fetching after paint, cleanup before removal. Mount order: `constructor` → `getDerivedStateFromProps` → `render` → (DOM committed) → `componentDidMount`. Update order (on new props/state): `getDerivedStateFromProps` → `shouldComponentUpdate` → `render` → `getSnapshotBeforeUpdate` → `componentDidUpdate`. Unmount: `componentWillUnmount`.

```jsx
componentDidMount() { this.sub = api.subscribe(this.onData); }   // start effects
componentDidUpdate(prev) { if (prev.id !== this.props.id) this.refetch(); }
componentWillUnmount() { this.sub.unsubscribe(); }               // cleanup
```

The split maps cleanly to the render/commit phases: `render`, `getDerivedStateFromProps`, and `shouldComponentUpdate` are *render-phase* (pure, no side effects, can be interrupted by concurrent React); `getSnapshotBeforeUpdate`, `componentDidMount/Update`, and `componentWillUnmount` are *commit-phase*, where the DOM exists and effects are safe. In function components, `useEffect` collapses mount/update/unmount into one API.

**Say it:** "Mount is constructor → render → componentDidMount; update is shouldComponentUpdate → render → componentDidUpdate; unmount is componentWillUnmount — render-phase methods stay pure, commit-phase methods run effects."
**Red flag:** Putting side effects or `setState` in `render` or the deprecated `componentWillMount`. Render must stay pure and can run multiple times under concurrency — effects go in `componentDidMount`/`componentDidUpdate`.

### Why React.memo
**They ask:** "Why do we need React.memo, and how is it different from PureComponent?"

`React.memo` exists to give *function components* the same skip-render optimization `PureComponent` gives class components: it memoizes the rendered output and re-renders only when props change by shallow comparison. A component re-renders whenever its parent does, even with identical props — `memo` short-circuits that for expensive, frequently-rendered children whose props are stable.

```jsx
const Row = React.memo(function Row({ data }) {
  return <li>{data.name}</li>;
}, (prev, next) => prev.data.id === next.data.id); // optional custom compare
```

Two things to say to sound senior. First, it only compares props — for state and context changes the component still re-renders, and it accepts a custom comparator as a second argument. Second, it's *undone* by unstable props: pass a new object/array/function literal each render and the shallow compare always fails, so `memo` must be paired with `useMemo`/`useCallback` on those props to do anything. It's `PureComponent` for functions — same shallow-compare bet, same caveats.

**Say it:** "React.memo is PureComponent for function components — it skips re-renders when props are shallow-equal, but it's only worth it for expensive children and only works if their props keep stable references."
**Red flag:** Wrapping every component in `memo`. The comparison isn't free, and with inline object/callback props it never skips anyway — apply it to measured hotspots with stable props.

### The Meaning of Refs
**They ask:** "What do refs really mean in React, and what are the legitimate use cases?"

Refs are the deliberate *escape hatch* from React's declarative model — a way to reach an imperative handle (a DOM node or a mutable value) that shouldn't drive rendering. That's the mental model: state is what you render from; a ref is what you reach for when the framework's declarative API can't express something. Legitimate uses: focusing/scrolling/measuring a DOM node, integrating a non-React library that owns its own DOM, holding a mutable value like a timer id or previous-value across renders, and exposing an imperative API via `useImperativeHandle`.

```jsx
const inputRef = useRef(null);
useEffect(() => inputRef.current.focus(), []); // imperative, but declaratively triggered
```

The key property: mutating `ref.current` does *not* re-render — that's the whole point, and also the trap. Don't store rendered data in a ref (the UI won't update); don't read a DOM ref during render (it's null until commit). Use it for imperative side-channels, keep rendered data in state.

**Say it:** "A ref is the imperative escape hatch — DOM access, third-party integration, or a mutable value that survives renders without causing one; anything the UI renders from belongs in state, not a ref."
**Red flag:** Storing display data in a ref to "avoid re-renders." Mutating a ref doesn't update the UI — you'll show stale data. Refs are for imperative handles, not rendered state.

### Applying Context
**They ask:** "How do you apply Context well, and what's the deep understanding of its cost?"

Context is a *dependency-injection* mechanism — it lets any descendant read a value without threading props through every intermediate level. That's the right framing, and the deep part is the cost: **every consumer re-renders whenever the provider's value changes by reference**, regardless of which slice it reads. So Context is ideal for low-frequency, app-wide values — theme, locale, current user, auth — and a performance trap for high-frequency state.

```jsx
const value = useMemo(() => ({ user, logout }), [user]); // stable ref, no needless renders
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
```

Two senior moves: memoize the provider value so you don't hand consumers a fresh object every render, and *split contexts* by update frequency (a stable `dispatch` context separate from a changing `state` context) so a change in one doesn't re-render readers of the other. When you need selector-level subscriptions — components reading only a slice — that's the signal to reach for Zustand or Redux, which live outside the tree and use pub-sub.

**Say it:** "Context is dependency injection, not a state manager — every consumer re-renders on any provider value change, so I use it for low-frequency values, memoize the value, and split contexts by update frequency."
**Red flag:** Putting fast-changing state (form input, cursor position) in one big Context. Every consumer re-renders on every keystroke — split contexts or use a store with selector subscriptions.

### Event Bubbling Through Portals
**They ask:** "A portal renders its DOM outside the parent — so how do events bubble through it?"

This is the counter-intuitive property that makes portals genuinely useful: even though a portal's DOM node sits elsewhere in the document (say, `document.body`), events still bubble to the portal's parent *in the React tree*, not its DOM parent. React propagates events along the *component* hierarchy through its synthetic event system, independent of physical DOM placement. So a modal portalled to `body` still fires the `onClick` handler on the component that rendered it.

```jsx
function Modal({ children }) {
  return createPortal(
    <div className="overlay">{children}</div>,
    document.body // physically outside, but React events bubble to the JSX parent
  );
}
// a click inside the portal reaches a handler on the component tree above <Modal>
```

That's exactly why portals are the right tool for modals, tooltips, and dropdowns: you escape parent `overflow: hidden` / `z-index` stacking-context traps in the DOM, *while keeping* React context, event bubbling, and handler wiring as if the content were inline.

**Say it:** "Portals move the DOM but not the React tree — events bubble to the JSX parent, not the DOM parent, so a modal in document.body still triggers handlers and context from where it's declared."
**Red flag:** Assuming a portalled modal is detached from its parent's handlers or context. React bubbles synthetic events along the component tree — the portal keeps context and event flow intact despite the DOM move.

### Higher-Order Components
**They ask:** "What is a HOC, and can you write a custom one? When would you still use it over a hook?"

A HOC is a function that takes a component and returns an enhanced component — the pre-hooks pattern for *reusing cross-cutting logic* (auth checks, data injection, logging) across many components. It's just composition: wrap, add behavior, pass props through.

```jsx
function withAuth(Component) {
  return function Guarded(props) {
    const user = useContext(AuthContext);
    if (!user) return <Redirect to="/login" />;
    return <Component {...props} user={user} />; // inject + forward
  };
}
```

The rules that signal you know the pattern: forward *all* props with `{...props}`, copy static methods (or use `hoist-non-react-statics`), don't create the HOC inside `render` (a new component type every render remounts the subtree and loses state), and forward refs with `forwardRef` since they don't pass through automatically. Be honest about relevance: hooks replaced most HOC use — a `useAuth()` hook is simpler and avoids wrapper hell — but HOCs still fit when you must control *what renders* (a guard returning a redirect) or wrap a component you don't own.

**Say it:** "A HOC wraps a component to inject cross-cutting behavior; I forward all props and refs and never define it inside render — but I default to hooks now and reserve HOCs for cases like render guards where I need to control what renders."
**Red flag:** Defining a HOC-wrapped component inside another component's render. It's a new type every render, so React remounts and drops all subtree state — hoist the wrapped component to module scope.

### Test Patterns and the Testing Pyramid
**They ask:** "How do you structure a test suite — the pyramid, patterns, and where TDD fits?"

A structured suite is what keeps tests *fast, trustworthy, and cheap to maintain* — the pyramid is the shape that gets you there: a wide base of fast unit tests, a smaller layer of integration tests, and a thin cap of slow e2e. Inverting it — mostly e2e — gives you a slow, flaky suite nobody trusts. Patterns that keep tests maintainable: Arrange-Act-Assert structure, test behavior through public interfaces (query by role/text, not internals), one logical assertion per test, and factory/builder helpers for test data instead of copy-pasted fixtures.

```js
it('shows an error on failed login', async () => {
  render(<Login onSubmit={() => Promise.reject(new Error('bad'))} />); // Arrange
  await userEvent.click(screen.getByRole('button', { name: /sign in/i })); // Act
  expect(await screen.findByRole('alert')).toBeInTheDocument(); // Assert
});
```

TDD — red, green, refactor — fits best on logic with clear inputs/outputs (reducers, utils, validation): write the failing test first so the design is driven by usage, then make it pass, then clean up.

**Say it:** "I keep the pyramid — many fast unit tests, fewer integration, a thin e2e cap — test behavior through public interfaces with Arrange-Act-Assert, and use TDD where logic has clear inputs and outputs."
**Red flag:** An inverted pyramid — mostly e2e "because they test real usage." They're slow and flaky at volume; the suite gets ignored. Push coverage down to fast unit/integration and keep e2e thin.

### e2e as a Regular Practice
**They ask:** "You write e2e tests regularly — how do you keep them fast and non-flaky in practice?"

E2E earns its place only if the team *trusts* it, and trust dies with flakiness — so the day-to-day discipline is about stability, not coverage. The recurring practices: select elements by stable, semantic locators (roles, `data-testid`), never by brittle CSS paths or text that changes; rely on the framework's auto-waiting/retriable assertions instead of fixed `sleep`s (the number one flake source); and control the environment — seed the database to a known state and stub or intercept third-party APIs so a slow external service can't fail your suite.

```js
cy.intercept('GET', '/api/user', { fixture: 'user.json' }); // deterministic
cy.findByRole('button', { name: /checkout/i }).click();     // semantic + auto-wait
```

Scope-wise, keep the suite to critical journeys so it stays fast enough to run on every PR, and run the full matrix on a schedule. A flaky test is worse than no test — quarantine and fix it, don't retry-loop it into the pipeline.

**Say it:** "I keep e2e trustworthy by selecting on semantic locators, using auto-waiting assertions instead of sleeps, and stubbing external APIs with seeded data — scoped to critical journeys so it runs on every PR."
**Red flag:** Fixing flakiness with fixed `sleep`s or blanket retries. Sleeps are the main flake cause and retries hide real bugs — use retriable assertions and deterministic, stubbed data instead.

### Server Interaction Strategy
**They ask:** "At a high level, how do you interact with a server in React, and how does that change with Redux or a data library?"

The senior framing is that "fetching data" is really *managing server state* — caching, loading/error status, invalidation, refetching — and where that lives is the real design decision. Plain React: `fetch`/`axios` in an effect, storing data + status in local state. That's fine for isolated, local data, but it doesn't dedupe requests or share cache across components. Redux (with thunks or sagas) centralizes server data in the store so many components share it and you get DevTools visibility — at the cost of writing loading/error/caching boilerplate by hand.

```jsx
const { data, isLoading, error } = useQuery({
  queryKey: ['user', id],
  queryFn: () => api.getUser(id), // dedupes, caches, refetches on the library's terms
});
```

The modern answer: server state and client state are different problems, so use a dedicated server-cache library (React Query, RTK Query, SWR) for the former and keep Redux/Context for genuine *client* state. That split is the thing to say out loud.

**Say it:** "Fetching is really server-state management — caching, status, invalidation — so I separate it from client state: React Query or RTK Query for server data, Redux/Context only for genuine client state."
**Red flag:** Dumping all fetched data into Redux and hand-rolling loading/error/cache logic. Server state has different needs than client state — a caching layer handles dedupe, refetch, and invalidation you'd otherwise reinvent.

### WebSockets in React
**They ask:** "Explain WebSockets in a React app in depth — the lifecycle, and how you manage the connection cleanly?"

WebSockets give a *persistent, bidirectional* channel over a single TCP connection — unlike HTTP request/response, the server can push without the client asking, which is what real-time features (chat, live prices, presence) require. The lifecycle after an HTTP upgrade handshake: `open` → `message` (both directions) → `close`, with `error`. In React the design problem is that a socket is a long-lived side effect that must be created, subscribed, and *torn down* with the component or app.

```jsx
useEffect(() => {
  const ws = new WebSocket(url);
  ws.onmessage = (e) => setMessages(m => [...m, JSON.parse(e.data)]);
  return () => ws.close(); // critical: close on unmount / url change
}, [url]);
```

Deeper concerns to raise: reconnection with exponential backoff when the connection drops, heartbeat/ping-pong to detect dead connections behind proxies, buffering messages sent while disconnected, and hoisting one shared connection to context/a store rather than opening a socket per component. Libraries like `socket.io` add reconnection and fallbacks; raw `WebSocket` needs you to build those.

**Say it:** "A WebSocket is a persistent bidirectional channel so the server can push; in React I open it in an effect and close it in cleanup, then add reconnection with backoff, heartbeats, and a single shared connection in context rather than one per component."
**Red flag:** Opening a socket in an effect without cleanup, or one per component. You leak connections and pile up duplicate listeners on every remount — always `close()` in cleanup and share one connection.
