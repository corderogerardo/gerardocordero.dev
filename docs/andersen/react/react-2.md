# React — core (part 2)

### React Context
**They ask:** "What is React.Context and when do you actually reach for it?"

Context solves prop drilling — passing data through layers of components that don't use it. But the senior framing is that Context is a dependency-injection tool, not a state manager: every consumer re-renders whenever the provider's `value` changes, with no selector to subscribe to a slice. That's why it fits low-frequency, app-wide values — theme, locale, current user, an auth token — and fights you for high-frequency state.

Mechanically you create a context, wrap a subtree in its `Provider`, and read it with `useContext`.

```jsx
const ThemeContext = createContext('light');
<ThemeContext.Provider value={theme}>
  <App />
</ThemeContext.Provider>
// deep child:
const theme = useContext(ThemeContext);
```

A common gotcha: passing an inline object as `value` creates a new reference every render, forcing all consumers to re-render — memoize it.

**Say it:** "I use Context for low-frequency, app-wide values like theme or auth; for high-frequency state I use a store with selectors so only the components that read a slice re-render."
**Red flag:** Calling Context "React's built-in Redux." It has no selectors and no memoized subscriptions — any value change re-renders every consumer.

### Portals in practice
**They ask:** "What are portals for, and can you give a concrete case where you'd reach for one?"

Portals let you render a child into a DOM node outside the parent's DOM hierarchy while keeping it in the React tree. The reason they exist is CSS containment: modals, tooltips, and dropdowns break when an ancestor has `overflow: hidden`, `z-index` stacking, or `transform`. A portal escapes that clipping by mounting into `document.body`, yet the component still receives props and context from where it's declared in JSX.

```jsx
function Modal({ children }) {
  return createPortal(children, document.getElementById('modal-root'));
}
```

The property people forget is that events still bubble through the React tree, not the DOM tree — an `onClick` on a parent catches clicks from the portaled child even though they live in different DOM subtrees. That's what makes portals feel seamless.

**Say it:** "Portals render outside the DOM hierarchy to escape overflow and z-index clipping, but stay in the React tree — so props, context, and event bubbling all still work."
**Red flag:** Saying portals are "for performance." They're a layout/escape-hatch tool, not an optimization.

### Render props
**They ask:** "Explain the render-props pattern and what problem it solves."

Render props share behavior between components by passing a function that returns JSX, letting the parent own logic while the consumer owns presentation. Before hooks, this was the main way to reuse stateful, non-visual logic — a mouse tracker, a data fetcher, a toggle — without inheritance or wrapper hell.

```jsx
<MouseTracker render={({ x, y }) => <p>{x}, {y}</p>} />
// inside MouseTracker: this.props.render(this.state)
```

The `children`-as-a-function variant is the same idea. The why-first point in an interview: render props and HOCs both solved logic reuse, and both add tree nesting ("wrapper hell"); hooks replaced most of these cases because they reuse logic without adding components.

**Say it:** "Render props share stateful logic by handing the consumer a function to render — hooks superseded most uses, but the pattern still fits when you need to control what gets rendered around dynamic state."
**Red flag:** Presenting render props as current best practice for everything. For logic reuse today, a custom hook is cleaner; render props remain useful for render-controlling APIs.

### Reselect and Recompose
**They ask:** "What are Reselect and Recompose used for?"

Both are optimization/composition helpers from the Redux era. Reselect creates memoized selectors: it caches a derived computation and only recomputes when its inputs change, so `mapStateToProps` doesn't return new references every dispatch and trigger needless re-renders. Recompose was a utility belt of HOCs (`withState`, `withHandlers`, `compose`) for building components functionally before hooks existed.

```jsx
const selectVisibleTodos = createSelector(
  [state => state.todos, state => state.filter],
  (todos, filter) => todos.filter(t => t.status === filter)
);
```

The honest senior note: Recompose is deprecated — its author now works on React hooks, which replace it. Reselect is still relevant and ships inside Redux Toolkit's `createSelector`.

**Say it:** "Reselect memoizes derived state so selectors stay referentially stable; Recompose was the pre-hooks HOC toolkit and hooks made it obsolete."
**Red flag:** Recommending Recompose for new code. Say hooks replaced it and its author confirmed as much.

### List virtualization
**They ask:** "What is virtualization and what problem does it solve?"

Virtualization (windowing) renders only the rows currently visible in the viewport plus a small buffer, instead of mounting every item in a long list. The why: a 10,000-row list creates 10,000 DOM nodes, blowing up memory and making mount/scroll janky. Virtualization keeps the DOM node count roughly constant no matter how long the data is.

Mechanically, the library measures the container, computes which items fall in the scroll window, and absolutely-positions them inside a spacer sized to the full list height so the scrollbar still feels right.

```jsx
<FixedSizeList height={500} itemCount={10000} itemSize={35} width={300}>
  {({ index, style }) => <div style={style}>Row {index}</div>}
</FixedSizeList>
```

**Say it:** "Virtualization renders only the visible window of a long list, so DOM node count stays flat regardless of data size — that's what keeps scroll at 60fps."
**Red flag:** Reaching for virtualization on a 20-item list. It adds complexity (measurement, absolute positioning) that only pays off past hundreds/thousands of rows.

### Concurrent Mode and Suspense
**They ask:** "Explain Concurrent Mode and Suspense in your own words."

The goal is interruptible rendering: letting React pause, prioritize, and resume work so a big update doesn't block user input. "Concurrent Mode" was the experimental name; it never shipped as a distinct mode. React 18 delivered the same capability as concurrent *features* you opt into — `startTransition`, `useDeferredValue`, and Suspense — once you render with `createRoot`.

Suspense lets a component "wait" for something (lazy code, or data with a supporting library) and show a fallback meanwhile, declaratively.

```jsx
<Suspense fallback={<Spinner />}>
  <ProfilePage />
</Suspense>
```

`startTransition` marks an update as non-urgent, so typing stays responsive while an expensive re-render happens in the background.

**Say it:** "Concurrent rendering makes React interruptible — urgent updates like keystrokes preempt non-urgent ones; in React 18 you get it through createRoot plus startTransition, useDeferredValue, and Suspense."
**Red flag:** Calling "Concurrent Mode" a released mode you flip on. Be accurate: it was experimental and shipped as opt-in concurrent features in React 18.

### Bundle splitting: lazy-loading and tree shaking
**They ask:** "How do lazy-loading and tree shaking reduce bundle size?"

Both cut the JavaScript a user downloads before the app is interactive, which is the dominant lever on load performance. Tree shaking is a build-time step: the bundler statically analyzes ES module `import`/`export` graphs and drops code that's never imported (dead-code elimination). It only works with ES modules and side-effect-free code — CommonJS `require` and unmarked side effects defeat it.

Lazy-loading is runtime: split the bundle at route or component boundaries and fetch a chunk on demand.

```jsx
const Settings = lazy(() => import('./Settings'));
<Suspense fallback={<Spinner />}><Settings /></Suspense>
```

**Say it:** "Tree shaking removes unused exports at build time; lazy-loading defers whole chunks to runtime — together they shrink the initial bundle so the app is interactive sooner."
**Red flag:** Claiming tree shaking removes anything unused. It relies on static ES module analysis; dynamic access and CommonJS interop can silently keep dead code in the bundle.

### React and Redux DevTools
**They ask:** "How do you use React DevTools and Redux DevTools?"

They turn "why is this slow / wrong" from guessing into observation — the seniority signal is that you profile before optimizing. React DevTools' Components tab inspects props/state/hooks and highlights re-renders; the Profiler tab records a commit and shows which components rendered, how long each took, and *why* (props changed, state changed, parent rendered).

Redux DevTools gives a time-travel action log: every dispatched action, the state diff it caused, and the ability to jump to any prior state.

The practical loop: reproduce, record in the Profiler, read the "why did this render" flame graph, fix the specific offender (a new object prop, a missing memo), record again to confirm.

**Say it:** "I don't optimize by intuition — I record a Profiler commit, find the component that actually re-rendered and why, and fix that one thing, then re-record to prove it."
**Red flag:** Wrapping everything in `memo`/`useMemo` before profiling. Without a measurement you're adding cost blindly and often masking the real re-render cause.

### Service workers
**They ask:** "Where are service workers useful in a React app?"

A service worker is a script the browser runs in the background, separate from the page, that sits as a proxy between the app and the network. That intercept point is what unlocks offline support, asset caching, background sync, and push notifications — capabilities a normal page can't reach.

The lifecycle matters: it registers, installs (pre-cache assets), then activates and starts intercepting `fetch`. Because it's a network proxy, it only runs over HTTPS (localhost excepted) for security.

```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

In a React context you'd use it for a cache-first strategy on the app shell so a repeat visit loads instantly, or offline fallback for a PWA.

**Say it:** "A service worker is a background network proxy — it's how a React PWA gets offline support, asset caching, and push, and it's HTTPS-only for that reason."
**Red flag:** Confusing service workers with web workers. Web workers offload CPU work off the main thread; service workers proxy the network and persist across page loads.

### Server-side rendering basics
**They ask:** "What is SSR and how does hydration fit in?"

SSR renders the component tree to HTML on the server so the user sees meaningful content on first paint and crawlers get real markup — the payoff is faster perceived load and better SEO than a blank client-rendered shell. `ReactDOMServer.renderToString` produces that HTML.

The catch is that server HTML is inert — no event handlers. Hydration is the client step where React attaches listeners and reconciles its virtual tree against the already-present DOM instead of recreating it.

```jsx
// server
const html = ReactDOMServer.renderToString(<App />);
// client (React 18)
ReactDOM.hydrateRoot(document.getElementById('root'), <App />);
```

**Say it:** "SSR sends real HTML for a fast first paint and SEO; hydration then attaches React's event listeners to that existing markup instead of re-rendering it."
**Red flag:** Saying SSR "makes the app faster" flatly. It improves first paint and SEO but adds server cost and a hydration gap where the page looks ready but isn't interactive.

### Jest and Enzyme
**They ask:** "What are Jest and Enzyme for, and how do they differ?"

Jest is the test runner and assertion framework — it finds tests, runs them, provides `expect`, mocking, and coverage. Enzyme was a component testing utility (from Airbnb) that let you shallow-render and reach into a component's internals — state, props, instance methods.

That internals access is exactly why the industry moved on: testing implementation details makes tests brittle to refactors. React Testing Library replaced Enzyme by querying the rendered output the way a user sees it (roles, text) rather than component internals.

```jsx
render(<Counter />);
fireEvent.click(screen.getByText('Increment'));
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

Be honest: Enzyme has no officially maintained adapter for React 17+, so new projects use RTL.

**Say it:** "Jest runs and asserts; Enzyme tested component internals, and RTL replaced it by testing behavior the user can observe — which survives refactors."
**Red flag:** Recommending Enzyme for a new React 18 project. Note its adapter situation and reach for React Testing Library.

### Snapshot testing
**They ask:** "What is snapshot testing and when is it worth using?"

A snapshot test serializes a component's rendered output, stores it, and on later runs fails if the output changed. Its value is catching *unintended* UI changes cheaply — one line covers a whole render tree, so accidental regressions surface in the diff.

```jsx
const tree = render(<Button label="Save" />).asFragment();
expect(tree).toMatchSnapshot();
```

The senior caveat is the failure mode: large, auto-generated snapshots become noise nobody reads, and developers reflexively press `-u` to update them, which defeats the purpose. Keep snapshots small and targeted, and prefer explicit assertions for behavior. Snapshots verify structure didn't change; they don't verify it's *correct*.

**Say it:** "Snapshots are cheap regression guards against unintended UI changes, but only if they're small — a giant snapshot that everyone updates on autopilot tests nothing."
**Red flag:** Snapshotting entire pages as your main strategy. That produces churny, ignored diffs; use focused snapshots plus behavioral assertions.

### End-to-end testing
**They ask:** "What are e2e tests for, and how do they differ from unit and integration tests?"

E2e tests exercise the whole system through the real UI — a browser drives clicks and typing against a running app and backend — verifying user flows work end to end (login, checkout). The distinction is the testing pyramid: unit tests check one function/component in isolation (many, fast); integration tests check a few units together (fewer); e2e tests check the full stack through the user's path (fewest, slowest, most brittle).

```js
// Cypress
cy.visit('/login');
cy.get('[name=email]').type('a@b.com');
cy.get('button[type=submit]').click();
cy.contains('Dashboard');
```

The seniority framing: heavy at the unit base, thin at the e2e top, because e2e is slow and flaky — you reserve it for the critical revenue paths.

**Say it:** "E2e proves the real user flow works across the whole stack; because it's slow and flaky I keep it thin and reserve it for critical paths, with the bulk of coverage in fast unit tests."
**Red flag:** Wanting e2e coverage for everything. Inverting the pyramid gives you a slow, flaky suite people learn to ignore.

### React Router
**They ask:** "How do you work with React Router?"

React Router keeps the URL in sync with what's rendered so a single-page app gets real, shareable, back-button-friendly URLs without full page reloads. You wrap the app in a router, declare routes that map paths to components, and use `Link` for navigation instead of `<a>` (which would reload the page).

```jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/users/:id" element={<User />} />
  </Routes>
</BrowserRouter>
```

Version awareness is a senior tell: v5 used `<Switch>` and a `component`/`render` prop; v6 replaced `Switch` with `Routes`, uses `element`, and adds relative/nested routes. Name which you've used.

**Say it:** "React Router maps the URL to the component tree so an SPA still has real, linkable URLs — I use Link for client navigation so it doesn't trigger a full reload."
**Red flag:** Blurring v5 and v6 APIs. Mixing `Switch`/`component` with `Routes`/`element` signals you haven't tracked the library's changes.

### React Router API: Route, Switch, Link
**They ask:** "Walk me through Route, Switch, and Link."

These are the three primitives of the v5 API, and knowing each one's job shows you understand routing, not just copy-paste. `Route` maps a path to a component. `Switch` renders only the *first* matching `Route` in its children — without it, every matching route renders, so `/` would match alongside `/users`. `Link` renders an anchor that changes the URL through the history API instead of reloading.

```jsx
<Switch>
  <Route exact path="/" component={Home} />
  <Route path="/users/:id" component={User} />
</Switch>
<Link to="/users/1">User 1</Link>
```

`exact` matters because paths match by prefix — `/` matches everything without it. In v6, `Switch` became `Routes` and matching is exact by default.

**Say it:** "Route maps a path to UI, Switch renders only the first match so routes don't stack, and Link navigates via history instead of reloading — v6 folds Switch into Routes with exact matching by default."
**Red flag:** Forgetting `exact`/`Switch` and claiming routes "just work." Without them, prefix matching renders multiple routes at once.

### Lazy routes
**They ask:** "How do you lazy-load routes and why?"

Route-based code splitting is the highest-leverage place to split a bundle: a user landing on `/login` shouldn't download the admin dashboard's code. You wrap each route's component in `React.lazy` with a dynamic `import()`, and the bundler emits a separate chunk fetched only when that route is visited.

```jsx
const Dashboard = lazy(() => import('./Dashboard'));

<Suspense fallback={<Spinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</Suspense>
```

`Suspense` provides the fallback while the chunk loads. The senior refinement: you can prefetch the next route's chunk on hover or when the current screen is idle, so the wait is gone by the time the user clicks — removing the wait rather than just hiding it.

**Say it:** "I split at route boundaries with React.lazy so each route ships its own chunk, and prefetch the likely-next chunk on hover so navigation feels instant."
**Red flag:** Lazy-loading tiny components everywhere. Each split adds a network round-trip; the win is at route/heavy-component boundaries, not on a 2KB button.

### Why ReactDOM is a separate package
**They ask:** "Why was ReactDOM moved into its own library?"

Because React the library is renderer-agnostic by design, and separating packages makes that explicit. `react` holds the core — components, elements, hooks, reconciliation — with no knowledge of the DOM. `react-dom` is *one* renderer that commits the reconciled tree to the browser DOM. That split is exactly what lets other renderers exist against the same core: React Native (native views), react-three-fiber (WebGL), Ink (terminal).

```jsx
import { useState } from 'react';        // core, platform-agnostic
import { createRoot } from 'react-dom/client'; // DOM renderer
```

So a component's logic is portable; only the renderer changes per platform. The reconciliation algorithm lives in core (via `react-reconciler`); the renderer just implements how to create and update host nodes.

**Say it:** "React core is renderer-agnostic — react-dom is just the browser renderer, which is why the same component model powers React Native and other targets."
**Red flag:** Saying they split it "for bundle size." The real reason is architectural: decoupling the reconciler from any specific host platform.

### JSX-to-JS compilation
**They ask:** "What does JSX compile to, and why did older code need React in scope?"

JSX is syntactic sugar — the browser can't run it, so a compiler (Babel/tsc) transforms it into plain function calls. Understanding this demystifies "why React?": before React 17, JSX compiled to `React.createElement(...)`, so `React` had to be imported in every file even if you never referenced it by name.

```jsx
<h1 className="title">Hi</h1>
// classic transform ->
React.createElement('h1', { className: 'title' }, 'Hi');
```

React 17 introduced the new JSX transform: the compiler imports the factory from `react/jsx-runtime` automatically, so the explicit `import React` is no longer required. `createElement` returns a plain object — the React element — a lightweight description of what to render, not actual DOM.

**Say it:** "JSX compiles to createElement calls that return plain element objects; the pre-17 `import React` requirement existed because that transform referenced React by name — the new JSX runtime removed it."
**Red flag:** Thinking JSX is HTML the browser understands. It's a function-call syntax; without a compiler step it's a syntax error.

### SyntheticEvent supported events
**They ask:** "What is SyntheticEvent and what events does React support through it?"

SyntheticEvent is React's cross-browser wrapper around the native event. The why: it normalizes API differences across browsers so `e.stopPropagation()` and `e.preventDefault()` behave identically everywhere, and it plugs into React's event delegation system rather than binding a listener per node.

React supports the full range through it — mouse (`onClick`, `onMouseEnter`), keyboard (`onKeyDown`), form (`onChange`, `onSubmit`), focus (`onFocus`, `onBlur`), touch, pointer, clipboard, and more — each typed and named in camelCase.

```jsx
<input onChange={(e) => console.log(e.target.value)} />
```

Two version facts worth knowing: React 17 moved event delegation from `document` to the root container, and removed event pooling — so you no longer need `e.persist()` to read an event asynchronously.

**Say it:** "SyntheticEvent is a normalized cross-browser event wrapper tied into React's delegation — and since React 17, events attach to the root container and pooling is gone."
**Red flag:** Claiming you still need `e.persist()`. That was pre-17; pooling was removed and the event is no longer nulled after the handler.

### Event types deep dive
**They ask:** "Go deeper on how React's event system routes events."

The key insight is that React does not attach a listener to each element. It uses event delegation: a single listener per event type, attached (since React 17) to the root DOM container. When a native event fires, it bubbles to that root, React reconstructs which fiber it targeted, wraps it in a SyntheticEvent, and walks the *React* tree firing your handlers. This keeps listener count constant regardless of how many elements have `onClick`.

Because dispatch follows the React tree, capture-phase handlers exist too (`onClickCapture`), and events flow through portals along the component hierarchy, not the DOM hierarchy.

```jsx
<div onClickCapture={onCapture} onClick={onBubble}>...</div>
```

Some events don't bubble (focus/blur), so React synthesizes bubbling versions (`onFocus`/`onBlur` do bubble in React) for consistency.

**Say it:** "React delegates one listener per event type to the root and replays dispatch over its own fiber tree — so listener count stays flat and events traverse the component hierarchy, including through portals."
**Red flag:** Saying React binds a handler to every element. It's delegation to the root; the per-element `onClick` is just a registration in React's tree.

### Uncontrolled components
**They ask:** "What's an uncontrolled component and when would you use one?"

An uncontrolled component lets the DOM own the input's value; you read it via a ref only when you need it, rather than driving it from state on every keystroke. The trade-off: controlled inputs give you validation, formatting, and a single source of truth on every change, but re-render each keystroke; uncontrolled inputs skip that overhead and are simpler when you just need the final value on submit.

```jsx
function Form() {
  const nameRef = useRef();
  const onSubmit = (e) => { e.preventDefault(); console.log(nameRef.current.value); };
  return <form onSubmit={onSubmit}><input ref={nameRef} defaultValue="" /></form>;
}
```

Note `defaultValue`, not `value` — that's the tell of an uncontrolled input. File inputs are always uncontrolled because their value is read-only.

**Say it:** "Uncontrolled inputs let the DOM hold the value and I read it via ref at submit — cheaper than re-rendering per keystroke, and the right default for file inputs and simple forms."
**Red flag:** Putting both `value` and no `onChange` on an input. That makes it read-only and logs a React warning; pick controlled (`value`+`onChange`) or uncontrolled (`defaultValue`+ref).

### Form libraries: Formik and React Final Form
**They ask:** "Why use Formik or React Final Form instead of hand-rolling forms?"

Because real forms are more than inputs — they need validation, error/touched tracking, submission state, and array/nested fields, and re-implementing that per form is bug-prone boilerplate. These libraries centralize form state and give you a schema-driven validation hook (commonly Yup).

```jsx
<Formik
  initialValues={{ email: '' }}
  validationSchema={schema}
  onSubmit={submit}
>
  {({ errors }) => <Form><Field name="email" />{errors.email}</Form>}
</Formik>
```

The senior distinction is re-render strategy: Formik historically re-renders the whole form on each change (simpler mental model), while React Final Form and React Hook Form use subscriptions so only the changed field re-renders — which matters on large forms. That performance argument is why React Hook Form now dominates new projects.

**Say it:** "Form libraries own validation, touched/error state, and submission so I don't rebuild it per form — and I pick a subscription-based one like React Final Form or React Hook Form when the form is large enough that per-field re-renders matter."
**Red flag:** Reaching for a library on a two-field form. There the overhead isn't worth it — controlled inputs plus a ref are enough.

### Portal event bubbling
**They ask:** "How does event bubbling work through a portal?"

This is the subtle, senior part of portals: even though a portaled child renders into a different DOM subtree (e.g. `document.body`), its events bubble through the *React* component tree, not the DOM tree. So a handler on the portal's React parent catches events from the portaled child — which is why a modal rendered into `body` can still fire a parent's `onClick` or context handlers.

```jsx
function Parent() {
  return (
    <div onClick={() => console.log('caught from portal child')}>
      {createPortal(<button>Click</button>, document.body)}
    </div>
  );
}
```

The practical consequence: a "click outside to close" that relies on DOM-tree bubbling can misfire, because React-tree bubbling routes the portal's clicks back to the logical parent, not the DOM ancestor.

**Say it:** "Portal events bubble along the React tree, not the DOM tree — so a parent handler still catches them, and outside-click logic has to account for that mismatch."
**Red flag:** Assuming portal events follow the DOM hierarchy. They follow React's virtual tree — that's the whole point that makes portals composable.

### Keys and shouldComponentUpdate
**They ask:** "What are keys for, and how does shouldComponentUpdate help performance?"

Keys give React a stable identity for each item in a list so its diffing algorithm can match elements across renders instead of re-creating them. Without stable keys, reordering or inserting an item makes React re-render or remount the wrong nodes, which is both slow and a correctness bug (lost input state).

```jsx
{items.map(item => <Row key={item.id} {...item} />)} // id, never index
```

`shouldComponentUpdate(nextProps, nextState)` is the class-component escape hatch: return `false` to skip a re-render when nothing relevant changed. `PureComponent` implements it with a shallow prop/state comparison; `React.memo` is the functional-component equivalent.

**Say it:** "Keys are stable identity for the diff — always a data id, never the array index for dynamic lists — and shouldComponentUpdate/PureComponent/memo skip re-renders when props haven't meaningfully changed."
**Red flag:** Using the array index as a key on a reorderable list. It breaks identity, so React reuses the wrong DOM nodes and inputs keep stale values.

### Reselect and Recompose in depth
**They ask:** "How does Reselect memoization actually work, and where does it break?"

Reselect's `createSelector` memoizes on its input selectors by reference equality: it recomputes the result only when one of the inputs' outputs changes identity. That's what keeps derived data (filtered lists, totals) referentially stable so connected components don't re-render every dispatch.

The classic bug is a shared selector used by many component instances: the default cache size is 1, so two components asking for different props thrash the cache, recomputing every time. The fix is a selector *factory* — one memoized instance per component.

```jsx
const makeSelectTodosByUser = () => createSelector(
  [todos, (_, userId) => userId],
  (todos, userId) => todos.filter(t => t.userId === userId)
);
```

Recompose, by contrast, composed HOCs functionally — deprecated in favor of hooks.

**Say it:** "Reselect memoizes by input reference with a cache of 1, so for per-instance props I use a selector factory to avoid cache thrash — and Recompose is legacy that hooks replaced."
**Red flag:** Sharing one memoized selector across instances with per-prop arguments. Cache size 1 means it never hits; hand each instance its own factory-made selector.

### Virtualization libraries
**They ask:** "How do you implement virtualization with a library?"

You reach for `react-window` (lightweight) or `react-virtualized` (feature-rich) rather than hand-rolling windowing, because correct measurement, scroll math, and edge cases (variable heights, sticky headers) are where naive implementations break.

You give the list its container size, item count, and an item size (fixed or a per-index function), and render each row through a child function that receives an absolute-positioned `style`.

```jsx
import { VariableSizeList } from 'react-window';
<VariableSizeList height={600} itemCount={rows.length}
  itemSize={i => rows[i].height} width="100%">
  {({ index, style }) => <div style={style}>{rows[index].text}</div>}
</VariableSizeList>
```

The `style` must be applied — it's the absolute positioning that places each row in the scroll window. Variable-height content needs a measured/estimated size or it jumps.

**Say it:** "I use react-window for fixed or variable rows, passing the container size and item sizes and applying the provided style — hand-rolling windowing gets the scroll math and variable heights wrong."
**Red flag:** Forgetting to spread the `style` prop onto each row. Without it every row stacks at the top and scrolling is broken.

### useMemo vs useCallback
**They ask:** "When do useMemo and useCallback actually help versus add noise?"

They exist to preserve referential identity across renders — which only matters when something downstream depends on that identity: a `React.memo` child, an effect's dependency array, or a genuinely expensive computation. `useMemo` caches a value; `useCallback` caches a function (it's `useMemo` returning a function). Wrapping everything "to be safe" adds allocation and dependency-tracking cost for zero benefit and hides bugs when deps are wrong.

```jsx
const filtered = useMemo(() => big.filter(fn), [big]);      // caches a value
const onClick = useCallback(() => doThing(id), [id]);       // caches a function
```

`useCallback(fn, deps)` is exactly `useMemo(() => fn, deps)`. The reason a stable `onClick` matters is that passing a fresh function to a memoized child defeats its memoization every render.

**Say it:** "I reach for useMemo/useCallback when identity is load-bearing — a memoized child or an effect dep — not by default; memoizing everything has its own cost."
**Red flag:** Memoizing every value and handler "for performance." Unnecessary memoization costs allocation and often masks a deeper re-render problem you should fix instead.

### Lazy and dynamic imports
**They ask:** "Explain lazy loading and how dynamic imports enable it."

The dynamic `import()` expression is a runtime, promise-returning module load — and that's the primitive bundlers use as a split point: everything reachable only through an `import()` goes into its own chunk, fetched on demand. `React.lazy` wraps that promise so a component can be code-split declaratively.

```jsx
const Chart = lazy(() => import('./HeavyChart'));
// non-component dynamic import:
button.onclick = async () => (await import('./analytics')).track();
```

The mental model: static `import` is resolved at build time and always in the bundle; dynamic `import()` is resolved at runtime and carved into a separate chunk. That's what lets you defer a heavy dependency (a charting lib, a rich-text editor) until the moment it's actually used.

**Say it:** "Dynamic import() is a runtime promise the bundler treats as a chunk boundary — React.lazy wraps it so heavy components load only when rendered, shrinking the initial payload."
**Red flag:** Thinking `import()` runs at build time. It's evaluated at runtime; that's precisely why it defers download.

### Concurrent UI patterns
**They ask:** "Which concurrent UI patterns do you apply and when?"

The point of the concurrent APIs is to keep the UI responsive during expensive updates by marking work as interruptible. The core patterns: `startTransition`/`useTransition` for non-urgent state updates (filtering a big list while typing stays snappy), `useDeferredValue` to lag a derived value behind a fast-changing input, and Suspense boundaries to show fallbacks without manual loading flags.

```jsx
const [isPending, startTransition] = useTransition();
const onChange = (e) => {
  setText(e.target.value);                 // urgent: input stays live
  startTransition(() => setResults(filter(e.target.value))); // interruptible
};
```

The senior nuance: optimistic/transition updates are for keeping *interactions* responsive; Suspense is for *loading* boundaries. Don't conflate them — each targets a different kind of wait.

**Say it:** "I split urgent from non-urgent updates with startTransition so keystrokes never block on an expensive re-render, and use Suspense for loading boundaries — different tools for interaction lag versus data waits."
**Red flag:** Marking urgent updates like the controlled input's own value as a transition. That makes typing feel laggy — only the derived, expensive work should be deferred.

### Bundle optimization: chunks and import cost
**They ask:** "How do you optimize a webpack bundle beyond lazy-loading?"

Beyond splitting, the levers are chunking strategy, dependency cost, and caching. `splitChunks` extracts shared and vendor code into separate chunks so a small app-code change doesn't bust the cache on your large, rarely-changing vendor bundle. Tools like `import-cost` and `webpack-bundle-analyzer` show which imports are actually expensive so you can swap or trim them (e.g. importing a single `lodash-es` function instead of all of `lodash`).

Content-hashed filenames plus long-lived cache headers mean returning users only re-download what changed.

```js
optimization: { splitChunks: { chunks: 'all' } }
output: { filename: '[name].[contenthash].js' }
```

**Say it:** "I separate vendor from app chunks with contenthash filenames so unchanged vendor code stays cached, and use bundle-analyzer/import-cost to find and trim the heaviest imports."
**Red flag:** Optimizing bundle size by feel. Without the analyzer you can't see that one date library or icon set is half your bundle — measure, then cut.

### Profiling with DevTools
**They ask:** "How do you find and fix a performance bottleneck with DevTools?"

Use a numbered loop rather than guessing. 1. Reproduce the slow interaction. 2. Record it in the React Profiler — it shows every commit, which components rendered, their render duration, and why. 3. Read the flame graph to find the component that renders too often or too long. 4. Diagnose the cause — a new object/array/function prop each render, a context value changing, a missing key. 5. Fix that specific thing (memoize the prop, split the context, add a stable key). 6. Re-record to confirm the commit is gone.

The "why did this render" panel is the whole game — it tells you props changed vs. parent rendered vs. state changed.

**Say it:** "I profile before I touch anything: record the interaction, read which component re-rendered and why, fix that one cause, then re-record to prove the commit disappeared."
**Red flag:** Sprinkling `memo` everywhere after a vague "it feels slow." Optimization without a Profiler recording is guessing — and often the real cost is elsewhere.

### Service worker internals
**They ask:** "Walk through the service worker lifecycle and why registration might fail."

The lifecycle is register → install → activate → fetch-intercept, and each stage has a purpose. On `install` you pre-cache the app shell; on `activate` you clean up old caches (this is where you version and evict stale assets); after activation the worker intercepts `fetch` and serves from cache per your strategy (cache-first, network-first, stale-while-revalidate).

```js
self.addEventListener('install', e =>
  e.waitUntil(caches.open('v1').then(c => c.addAll(['/', '/app.js']))));
self.addEventListener('fetch', e =>
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
```

Common registration failures: not served over HTTPS (localhost is exempt), wrong scope (the file's path limits which URLs it can control), or a syntax/parse error in the worker script. A new worker also waits in "installed" until existing tabs close unless you call `skipWaiting`.

**Say it:** "Install pre-caches, activate evicts old caches, then fetch intercepts per strategy — and registration fails most often on non-HTTPS, a scope narrower than the paths you expect to control, or a parse error in the script."
**Red flag:** Not knowing why an update didn't take effect. A new worker waits until old tabs close; `skipWaiting` + `clients.claim` is how you take control immediately.

### ReactDOMServer render methods
**They ask:** "Compare the ReactDOMServer render methods."

They differ on two axes: buffered vs. streaming, and hydratable vs. static. `renderToString` returns the full HTML string with React's hydration markers — the classic SSR method, but it buffers the whole tree before sending a byte. `renderToStaticMarkup` drops the hydration attributes — for content that never becomes interactive (emails, static pages), producing cleaner HTML. The streaming pair, `renderToNodeStream` / `renderToStaticNodeStream`, send HTML as it renders, improving time-to-first-byte for large pages.

```js
const html = ReactDOMServer.renderToString(<App />);        // hydratable, buffered
const email = ReactDOMServer.renderToStaticMarkup(<Email/>);// static, buffered
```

Version-accurate note: React 18 introduced `renderToPipeableStream` (Node) and `renderToReadableStream` (edge/web streams), which support Suspense on the server and streaming SSR — and deprecated the older `renderToNodeStream`.

**Say it:** "renderToString is hydratable but buffered, renderToStaticMarkup strips hydration for non-interactive HTML, and the streaming methods improve TTFB — with React 18's renderToPipeableStream being the modern, Suspense-aware choice."
**Red flag:** Recommending `renderToNodeStream` for new React 18 SSR. It's deprecated; the streaming path is `renderToPipeableStream`.

### How React Router works
**They ask:** "Explain how React Router works under the hood."

At its core React Router is a thin layer over the browser's History API plus context. A router component subscribes to history changes (`pushState`/`popstate`), stores the current location in context, and the route-matching components read that location and render whichever route's path matches — no full page reload, because navigation just calls `history.pushState` and updates React state.

Conceptually you could build a minimal version yourself: hold `location` in state, listen for `popstate`, provide it via context, and have a `Route` compare `path` to `location.pathname`.

```jsx
const [path, setPath] = useState(window.location.pathname);
useEffect(() => {
  const onPop = () => setPath(window.location.pathname);
  window.addEventListener('popstate', onPop);
  return () => window.removeEventListener('popstate', onPop);
}, []);
```

**Say it:** "React Router wraps the History API in React context — navigation is a pushState plus a state update, and route components render by matching the current location; you could reimplement a basic version with popstate and context."
**Red flag:** Describing it as "custom URL magic." It's the standard History API plus context; being able to sketch a minimal clone is the senior signal.

### Routing hooks
**They ask:** "Which hooks does React Router provide and how do you use them?"

The hooks API (v5.1+, expanded in v6) replaced the render-prop/`withRouter` HOC pattern for reading router state — cleaner, no wrapper components. The core set: `useNavigate` (v6) or `useHistory` (v5) to navigate programmatically, `useParams` for path params, `useLocation` for the current location object, and `useRouteMatch` (v5) / `useMatch` (v6) for match info.

```jsx
function User() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <button onClick={() => navigate('/users')}>Back</button>;
}
```

The value: programmatic navigation after an async action (redirect on successful login) without threading router props down through components.

**Say it:** "I read router state with useParams/useLocation and navigate imperatively with useNavigate — the hooks replaced withRouter, so no HOC wrappers just to read the URL."
**Red flag:** Mixing v5 (`useHistory`, `history.push`) with v6 (`useNavigate`, `navigate()`). Name the version — the navigation API changed between them.

### React Router API with Redirect
**They ask:** "What are Route, Switch, Link, and Redirect each for?"

Redirect is the fourth primitive: it declaratively sends the user from one path to another when rendered — the classic uses are auth guards (bounce to `/login` if not authenticated) and moving deprecated URLs. Route maps path→component, Switch renders the first match, Link navigates via history, Redirect changes the location.

```jsx
<Switch>
  <Route path="/login" component={Login} />
  <Route path="/dashboard">
    {isAuth ? <Dashboard /> : <Redirect to="/login" />}
  </Route>
</Switch>
```

Version note: in v6 `Redirect` became `<Navigate to="/login" />`, and it's an element you render rather than the imperative-feeling component. Rendering a redirect replaces the history entry by default with `replace`.

**Say it:** "Redirect declaratively changes the route on render — I use it for auth guards — and in v6 it's `<Navigate>`; pair it with replace so the guarded URL doesn't stay in history."
**Red flag:** Using `Redirect` for programmatic post-submit navigation. That's what `useNavigate`/`history.push` is for; `Redirect`/`Navigate` is declarative, rendered as part of the tree.

### history, location, match
**They ask:** "What are the history, location, and match objects, and how do they differ from the native ones?"

These are the three route props React Router injects (v5) or exposes via hooks (v6). `history` is React Router's wrapper around the browser History API — it adds `push`, `replace`, `goBack`, and a `listen` subscription the native API lacks. `location` describes the current URL (`pathname`, `search`, `hash`, plus a `state` object you can attach). `match` holds how the current route matched — `params`, the matched `path`, and `url`.

```jsx
history.push('/users', { from: 'dashboard' }); // navigate + attach state
console.log(location.state.from);              // read it on the next screen
console.log(match.params.id);
```

The difference from native: `history.listen` gives you a subscribe/unsubscribe hook, and `location.state` lets you pass data between routes without exposing it in the URL — the native `history.state` is lower-level and not React-aware.

**Say it:** "history wraps the browser History API with push/replace/listen, location is the parsed current URL plus a state payload, and match carries the params — the wins over native are the listen subscription and passing location.state between routes."
**Red flag:** Confusing `location.state` with component state, or putting sensitive data in the URL. `location.state` travels with navigation and stays out of the query string.

### Connected React Router
**They ask:** "What is connected-react-router and why use it?"

It synchronizes React Router's history into the Redux store, so the current location lives in Redux state and navigation can be dispatched as an action. The why: if your app is Redux-driven and you use time-travel debugging or want navigation to be part of the auditable action log, having the router state outside Redux creates a blind spot. connected-react-router dispatches a `@@router/LOCATION_CHANGE` action on every navigation and lets you `push()` through `dispatch`.

```js
const store = createStore(
  connectRouter(history)(rootReducer),
  applyMiddleware(routerMiddleware(history))
);
dispatch(push('/users')); // navigate via Redux
```

The honest senior note: this couples routing to Redux and is largely legacy — modern apps keep router state in React Router itself and don't mirror it into a global store. You'd explain it, then say why you'd avoid it now.

**Say it:** "connected-react-router mirrors router state into Redux so navigation is a dispatchable, time-travelable action — useful in heavily Redux-driven apps, but it couples routing to the store and modern React Router makes it unnecessary."
**Red flag:** Recommending it for a greenfield app. It's a legacy integration; today you'd keep routing in React Router and reach for the router hooks.

### Working with an API: Axios and Fetch
**They ask:** "How do you interact with a server in React, and Axios versus Fetch?"

The architectural point first: data fetching is a side effect, so it belongs in `useEffect` (or better, a data library), never in render, and you must handle the three states — loading, success, error — plus cleanup to avoid setting state on an unmounted component. Fetch is the built-in browser API; Axios is a library adding conveniences: automatic JSON parsing, request/response interceptors, timeout, and it rejects on HTTP error status (Fetch only rejects on network failure, so you must check `res.ok`).

```jsx
useEffect(() => {
  const ctrl = new AbortController();
  fetch('/api/users', { signal: ctrl.signal })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(setUsers).catch(handle);
  return () => ctrl.abort();
}, []);
```

The senior reframe: for real apps I'd use React Query/SWR, which handle caching, dedup, retries, and stale-while-revalidate instead of hand-managing loading state everywhere.

**Say it:** "Fetching is a side effect I handle in useEffect with loading/error/cleanup — Axios adds interceptors and rejects on HTTP errors where Fetch needs a res.ok check — but for anything real I reach for React Query so caching and retries aren't hand-rolled."
**Red flag:** Forgetting Fetch resolves on a 404/500. It only rejects on network failure; without `res.ok` you treat error responses as success.

### Mock servers
**They ask:** "What's a mock server and which tools do you use?"

A mock server returns fake API responses so frontend work isn't blocked on a real backend, and tests run deterministically without network flakiness. `json-server` spins a full REST API from a JSON file in seconds; `json-graphql-server` does the same for GraphQL. For test-time interception, Mock Service Worker (MSW) intercepts requests at the network layer via a service worker, so your app code is unchanged — it thinks it's hitting a real endpoint.

```js
// json-server: db.json -> instant GET/POST/PUT/DELETE on /users
// msw:
rest.get('/api/users', (req, res, ctx) => res(ctx.json([{ id: 1 }])));
```

The senior distinction: MSW is preferred for tests because it mocks at the boundary (the network) rather than stubbing `fetch`/`axios`, so your tests exercise the real request code path.

**Say it:** "Mock servers unblock frontend work and make tests deterministic — json-server for a quick REST stub, and MSW for tests because it intercepts at the network layer instead of stubbing the HTTP client."
**Red flag:** Mocking by monkey-patching `fetch` in every test. That skips your real request code; MSW intercepts the actual network call so the code path is genuinely tested.

### WebSockets with React
**They ask:** "How and why do you use WebSockets in a React app?"

WebSockets give a persistent, full-duplex connection for real-time, server-pushed data — chat, live prices, notifications, collaborative editing — where polling would be wasteful and laggy. The React-specific concern is lifecycle: you open the connection once, subscribe to messages, and critically *clean up* on unmount, or you leak sockets and duplicate listeners across re-renders.

```jsx
useEffect(() => {
  const ws = new WebSocket('wss://api/feed');
  ws.onmessage = (e) => setData(JSON.parse(e.data));
  return () => ws.close();
}, []);
```

The senior details: handle reconnection with backoff (networks drop), buffer or drop messages under backpressure, and for production reach for a library like `socket.io` that adds reconnection, rooms, and a fallback transport. You also want the socket outside component render — a ref or a context/provider — so re-renders don't recreate it.

**Say it:** "WebSockets are a persistent full-duplex channel for server-pushed real-time data — in React the discipline is opening once, cleaning up on unmount, and adding reconnection with backoff, ideally via a provider so re-renders don't churn the connection."
**Red flag:** Opening a socket in render or an effect without cleanup. That leaks connections and stacks duplicate `onmessage` handlers on every re-render.

### Rules of Hooks
**They ask:** "Why can't hooks run in conditions or loops, and how do you branch instead?"

Because React tracks hook state by *call order*, not by name — it keeps an ordered list per component and matches each `useState`/`useEffect` to its slot by the sequence they're called. Put a hook inside an `if` and the order shifts between renders, so React hands the wrong state to the wrong hook. That's why the rules are: only call hooks at the top level, and only from React functions (components or custom hooks).

```jsx
// wrong — order changes when `open` flips
if (open) { const [x] = useState(0); }
// right — hook always runs; branch the value
const [x, setX] = useState(0);
if (open) { /* use x */ }
```

To branch behavior, put the condition *inside* the hook (early-return inside `useEffect`, conditional logic inside the callback), not around the hook call. For conditional rendering of hook-using logic, split it into a separate component you render conditionally.

**Say it:** "React matches hooks to their state by call order, so they must run unconditionally at the top level — I branch inside the hook or split logic into a child component I render conditionally, never wrap the hook call in an if."
**Red flag:** "You can call a hook in an if as long as you're careful." You can't — order-based tracking breaks; the lint rule `react-hooks/rules-of-hooks` exists precisely to catch this.
