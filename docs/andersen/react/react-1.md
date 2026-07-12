# React — core (part 1)

### ReactDOM and render
**They ask:** "What is ReactDOM and why is it a separate package from React?"

React is renderer-agnostic on purpose: the `react` package builds a tree of plain description objects (elements), and a *renderer* decides what to do with them. `react-dom` is the renderer that commits that tree to the browser DOM; `react-native` commits it to native views; `react-test-renderer` to a JSON tree. Splitting them is what lets the same component code target multiple hosts.

Mechanically you mount a tree at a real DOM node. In React 18 that's `createRoot(document.getElementById('root')).render(<App />)` — the older `ReactDOM.render` API is deprecated because it can't opt into concurrent features.

```jsx
import { createRoot } from 'react-dom/client';
createRoot(document.getElementById('root')).render(<App />);
```

**Say it:** "`react` describes the UI, `react-dom` commits it to the browser — the split is what makes React portable to native, canvas, or test renderers."
**Red flag:** Calling `ReactDOM.render` the current API. It still works but is deprecated; the concurrent-capable entry point is `createRoot` from `react-dom/client`.

### Importing React before 17
**They ask:** "Before React 17, why did every JSX file need `import React` even if you never wrote `React.` anywhere?"

Because JSX is syntax sugar, not something the browser understands. The compiler rewrites every JSX tag into a function call, and before React 17 that call was `React.createElement(...)`. So `React` had to be *in scope* even when your code never referenced it directly — otherwise the compiled output threw `React is not defined`.

`<div className="x">Hi</div>` compiled to `React.createElement('div', { className: 'x' }, 'Hi')`. That's why the import was mandatory.

React 17 shipped the *new JSX transform*: the compiler now imports a runtime helper (`react/jsx-runtime`) automatically, so you can drop the `import React` line for JSX alone. You still import `React` when you use `React.something` (hooks, `React.memo`) — most people import those as named imports.

**Say it:** "Pre-17, JSX compiled to `React.createElement`, so `React` had to be in scope; React 17's new JSX transform auto-imports the runtime, so the import is no longer required just for JSX."
**Red flag:** Saying "you don't need it anymore" without knowing *why* — the compiler still emits a call, it just imports the helper for you now.

### Fragments
**They ask:** "What problem do Fragments solve?"

A component must return a single root, but wrapping siblings in an extra `<div>` pollutes the DOM — it breaks flex/grid layouts, valid HTML nesting (a `<tr>` can't sit in a `<div>`), and adds noise for styling and accessibility. Fragments let you return multiple children without adding a real node.

```jsx
return (
  <>
    <td>Name</td>
    <td>Email</td>
  </>
);
```

The shorthand `<>...</>` renders nothing to the DOM. Use the long form `<React.Fragment key={id}>` when you map a list and need a `key`, since the shorthand can't take props.

**Say it:** "Fragments group siblings without emitting a wrapper node, so I don't break table/flex semantics or bloat the DOM just to satisfy the single-root rule."
**Red flag:** Reaching for a wrapper `<div>` in list rows or table bodies — it produces invalid HTML and can break CSS layout.

### Fiber, the basics
**They ask:** "What is Fiber in React?"

Fiber is React 16's rewrite of the reconciler — the part that figures out what changed. The practical payoff is that rendering became *interruptible*: before Fiber, reconciliation was a synchronous recursive walk that couldn't be paused, so a big update could block the main thread and drop frames. Fiber splits that work into small units so React can pause, yield to the browser for a high-priority event, then resume.

A "fiber" is a plain JS object representing one unit of work — one component instance — holding its type, props, state, and pointers to child/sibling/parent. React keeps two trees (current and work-in-progress) and builds the new one incrementally.

**Say it:** "Fiber reimplemented reconciliation as interruptible units of work, so React can pause rendering to stay responsive instead of blocking the main thread on one big synchronous pass."
**Red flag:** Calling Fiber "the virtual DOM." The element tree is the virtual DOM; Fiber is the reconciliation *engine* that diffs and schedules work over it.

### Scheduling and priority
**They ask:** "At a basic level, how does React decide what to render first?"

The point of prioritization is responsiveness: a keystroke or click must feel instant even while a large list is re-rendering. Because Fiber can interrupt work, React can assign updates a priority and process urgent ones before less-urgent ones.

Informally: a user typing is high priority, data arriving in the background is lower. React does urgent work first, and can throw away partially-rendered low-priority work if something more important comes in.

In modern React you influence this explicitly with `useTransition` / `startTransition`, which marks an update as non-urgent so it won't block typing.

```jsx
const [isPending, startTransition] = useTransition();
startTransition(() => setFilter(nextValue)); // low priority
```

**Say it:** "React schedules urgent updates like input ahead of non-urgent ones like filtering a big list, and `startTransition` is how I tell it which is which."
**Red flag:** Claiming React "renders in order of setState calls." Order isn't the model — priority is; low-priority renders can be deferred or discarded.

### Functional components
**They ask:** "What is a functional component and how do you hold state in one?"

A functional component is just a function that takes props and returns React elements. It's the default today because hooks give it everything class components had — state, lifecycle, context — with far less boilerplate and reusable logic.

State lives in the `useState` hook, which returns the current value and a setter. Calling the setter schedules a re-render.

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

Use the updater form `setCount(c => c + 1)` when the next value depends on the previous — it's safe under batching.

**Say it:** "A functional component is a function of props returning elements; state comes from `useState`, and I use the updater callback whenever the next value derives from the previous."
**Red flag:** Saying functional components are "stateless." That was true before hooks (2019); today it's just wrong.

### Class components
**They ask:** "Write a class component with state and a data fetch."

A class component extends `React.Component` and implements `render()`. State is an instance field set in the constructor (or as a class property) and updated with `this.setState`, which merges partial state and re-renders. Side effects like fetching go in `componentDidMount`.

```jsx
class Users extends React.Component {
  state = { users: [], loading: true };
  async componentDidMount() {
    const res = await fetch('/api/users');
    this.setState({ users: await res.json(), loading: false });
  }
  render() {
    if (this.state.loading) return <Spinner />;
    return <List items={this.state.users} />;
  }
}
```

**Say it:** "Class state is an instance field updated via `this.setState`, which shallow-merges and re-renders; effects like fetching go in `componentDidMount`."
**Red flag:** Mutating `this.state` directly, or assuming `setState` merges *deeply* — it's a shallow merge, so nested objects need to be spread yourself.

### Props and reverse data flow
**They ask:** "Why are props read-only, and how does a child send data back to a parent?"

Props are read-only because React's data flow is one-way: a parent owns the data and passes it down. If children could mutate props, you'd lose the single source of truth and couldn't reason about where a value came from — the mental model that makes React predictable.

To send data upward, the parent passes a *callback* prop; the child calls it. The state still lives in the parent (lifting state up).

```jsx
function Parent() {
  const [q, setQ] = useState('');
  return <Search onChange={setQ} />;
}
function Search({ onChange }) {
  return <input onChange={e => onChange(e.target.value)} />;
}
```

**Say it:** "Data flows down through props and back up through callbacks; props are immutable so the parent stays the single source of truth."
**Red flag:** Reassigning a prop inside the child (`props.value = ...`). Mutating props is undefined behavior — lift the state up and pass a setter down instead.

### State and setState
**They ask:** "What actually happens when you call `setState`?"

`setState` doesn't mutate a variable — it schedules a re-render with the new state, and React decides *when* to apply it. That indirection is what lets React batch multiple updates into one render for performance.

Because it's scheduled, reading state right after setting it gives you the old value. When the next value depends on the current one, use the functional updater so you never read a stale value.

```jsx
setCount(count + 1); // risky if batched with others
setCount(c => c + 1); // always correct
```

In class components it's the same idea via `this.setState`, which shallow-merges; functional `useState` *replaces* the value.

**Say it:** "`setState` schedules a re-render rather than mutating immediately, so I use the updater callback whenever the new value depends on the old one."
**Red flag:** Assuming state updates synchronously — logging state right after `setState` and expecting the new value is the classic junior mistake.

### Runtime prop validation
**They ask:** "How did React validate props at runtime before TypeScript?"

`prop-types` is a runtime, development-only check: you declare the shape a component expects, and React warns in the console when a caller passes the wrong type or omits a required prop. It catches integration mistakes early without any build step, but it disappears in production and can't check at compile time.

```jsx
Avatar.propTypes = {
  size: PropTypes.number.isRequired,
  alt: PropTypes.string,
};
Avatar.defaultProps = { alt: '' };
```

`defaultProps` supplies fallbacks for omitted props (for function components, default parameters are now preferred). Modern codebases replace `prop-types` with TypeScript, which validates at compile time instead.

**Say it:** "`prop-types` is a dev-only runtime guard that warns on wrong or missing props; it's largely superseded by TypeScript's compile-time checking."
**Red flag:** Relying on `prop-types` in production for safety — it's stripped in prod builds and only logs warnings, it never blocks bad data.

### Refs, the basics
**They ask:** "What is a ref and when do you need one?"

A ref is an escape hatch to hold a mutable value that persists across renders *without* triggering a re-render — most commonly a handle to a DOM node. You need it when you must talk to the DOM imperatively: focus an input, measure size, play a video, integrate a non-React library.

```jsx
function TextField() {
  const inputRef = useRef(null);
  useEffect(() => inputRef.current.focus(), []);
  return <input ref={inputRef} />;
}
```

`useRef` returns an object whose `.current` you can read and write freely; changing it doesn't re-render.

**Say it:** "A ref is a persistent, mutable box that doesn't cause re-renders — I use it for imperative DOM work like focus or measurement, not for data that drives the UI."
**Red flag:** Storing render-driving state in a ref to "avoid re-renders." If the UI must reflect the value, it belongs in state; refs are for values the render output doesn't depend on.

### Portals
**They ask:** "What are portals for?"

A portal renders a child into a DOM node *outside* the parent's DOM hierarchy, while keeping it in the React tree. The reason you need it: overlays — modals, tooltips, dropdowns — must escape parents that have `overflow: hidden`, `z-index` stacking contexts, or `transform`, which would otherwise clip or mis-stack them.

```jsx
return createPortal(<Modal />, document.body);
```

The key subtlety senior interviewers probe: even though the modal lands in `document.body`, events still bubble through the *React* tree, not the DOM tree — so a click inside the portal still reaches the React parent's `onClick`.

**Say it:** "Portals render into a different DOM subtree so overlays escape `overflow` and stacking-context clipping, but events still bubble through the React tree, not the DOM position."
**Red flag:** Thinking a portal detaches the component from React — it doesn't; context and event bubbling follow the React tree.

### Conditional rendering
**They ask:** "Show the ways to conditionally render, and where the traps are."

Because JSX is expressions, you render conditionally with plain JS: a ternary for either/or, `&&` for render-or-nothing, or an early `return`. The senior point is knowing the `&&` footgun.

```jsx
{isLoading ? <Spinner /> : <List items={items} />}
{error && <Error msg={error} />}
{count && <Badge n={count} />}   // BUG: renders "0" when count is 0
```

`0 && <Badge />` evaluates to `0`, and React *renders* `0` as text. Guard with a boolean: `count > 0 && ...` or `!!count && ...`.

**Say it:** "I use ternaries for either/or and `&&` for optional UI — but I coerce to boolean, because `0 && <X/>` renders a literal `0` instead of nothing."
**Red flag:** `array.length && <List/>` — an empty array renders `0` on screen. Use `array.length > 0 && ...`.

### JSX event handlers
**They ask:** "How do React's JSX handlers differ from native DOM handlers?"

You attach handlers declaratively as camelCase props (`onClick`, not `onclick`) that take a function reference, not a string. But the real difference is under the hood: React doesn't attach a listener to each node. It attaches *one* listener at the root and dispatches events through its own system — this is event delegation, and it's why handlers receive a `SyntheticEvent`, not the raw DOM event.

```jsx
<button onClick={handleClick}>Save</button>   // React
button.addEventListener('click', handleClick)  // native
```

To prevent default you must call `e.preventDefault()` — returning `false` from a React handler does nothing, unlike inline HTML handlers.

**Say it:** "React handlers are camelCase props wired through one delegated root listener, so they hand you a synthetic event and `return false` won't cancel the default — you call `preventDefault`."
**Red flag:** Passing a string or calling the handler immediately (`onClick={handleClick()}`) — that invokes it on render. Pass the reference or an arrow wrapper.

### Handler binding and context
**They ask:** "How do you keep `this` correct in a class handler, and does this matter with hooks?"

In class components a method passed as a callback loses its `this` binding — invoked later, `this` is `undefined` in strict mode. The fixes, cheapest first: define the handler as a class-property arrow function (bound once, lexically), or bind in the constructor. Avoid binding in `render` (`onClick={this.f.bind(this)}`) — it creates a new function every render, defeating child memoization.

```jsx
handleClick = () => { this.setState(...) };   // arrow class field — preferred
```

With function components and hooks the `this` problem disappears entirely — there's no instance — which is one reason hooks reduced a whole class of bugs.

**Say it:** "In classes I bind handlers as arrow class fields so they keep `this` and aren't recreated per render; hooks sidestep the whole issue since there's no `this`."
**Red flag:** `.bind(this)` inside `render` or an inline arrow on a hot path passed to a memoized child — it breaks referential equality and the memo.

### SyntheticEvent
**They ask:** "What is a SyntheticEvent and why does React wrap native events?"

`SyntheticEvent` is React's cross-browser wrapper around the native event. The reason it exists: it normalizes inconsistencies across browsers so `e.target`, `e.preventDefault()`, `e.stopPropagation()` behave identically everywhere, and it plugs into React's delegated event system.

It exposes the same interface as the native event, and `e.nativeEvent` gives you the underlying one if you need it.

One historical gotcha: before React 17, synthetic events were *pooled* — reused and nulled out after the handler — so accessing `e` asynchronously required `e.persist()`. React 17 removed pooling, so that footgun is gone.

**Say it:** "SyntheticEvent is a normalized cross-browser wrapper over the native event that feeds React's delegated dispatch; pre-17 it was pooled and needed `persist()`, but 17 removed pooling."
**Red flag:** Warning about event pooling as if it's current. It was removed in React 17 — mention it only as history.

### Event types
**They ask:** "Briefly, what categories of events does React support?"

React mirrors the DOM event families through synthetic wrappers, so you get the same groups you'd expect natively: mouse (`onClick`, `onMouseEnter`), keyboard (`onKeyDown`, `onKeyUp`), form (`onChange`, `onSubmit`, `onInput`), focus (`onFocus`, `onBlur`), clipboard, touch/pointer, and generic UI events like `onScroll`.

The one worth flagging: React's `onChange` fires on *every* keystroke, unlike native DOM `change`, which fires only on blur. React deliberately made `onChange` behave like native `input` because that's what controlled inputs need.

**Say it:** "React exposes the standard DOM families as synthetic events — mouse, keyboard, form, focus, clipboard, touch — but its `onChange` fires per keystroke like native `input`, not on blur."
**Red flag:** Expecting `onChange` to fire only when the field loses focus — that's native `change`; React's fires continuously.

### Controlled vs uncontrolled
**They ask:** "Controlled versus uncontrolled components — trade-offs?"

The distinction is *where the source of truth lives*. A controlled input's value is driven by React state (`value` + `onChange`), so React is the single source of truth — you get instant validation, conditional disabling, and formatting for free. An uncontrolled input keeps its value in the DOM and you read it via a ref when needed.

```jsx
<input value={name} onChange={e => setName(e.target.value)} /> // controlled
<input defaultValue="Ann" ref={ref} />                         // uncontrolled
```

Controlled costs a render per keystroke but gives full control; uncontrolled is lighter and handy for simple forms, file inputs (which *must* be uncontrolled), or wrapping non-React widgets.

**Say it:** "Controlled inputs put React state as the source of truth for live validation and formatting; uncontrolled leaves the value in the DOM and I read it with a ref — I reach for it for file inputs or simple, write-once forms."
**Red flag:** Setting both `value` and `defaultValue`, or a `value` with no `onChange` — that makes a read-only field and React warns.

### Building custom forms
**They ask:** "How would you implement a custom form from scratch?"

The senior framing: a form is just controlled inputs plus derived validation state, so I lift the field values into one state object, validate on change or submit, and prevent the browser's default submit. No library needed for small forms.

```jsx
function Form({ onSave }) {
  const [values, setValues] = useState({ email: '', pw: '' });
  const set = k => e => setValues(v => ({ ...v, [k]: e.target.value }));
  const submit = e => {
    e.preventDefault();
    if (!values.email.includes('@')) return;
    onSave(values);
  };
  return (
    <form onSubmit={submit}>
      <input value={values.email} onChange={set('email')} />
      <button type="submit">Save</button>
    </form>
  );
}
```

Handle submission on the `<form onSubmit>`, not the button's click, so Enter-to-submit works.

**Say it:** "I keep field values in one state object, validate on change/submit, and always `preventDefault` on the form's `onSubmit` so keyboard submit and validation both work."
**Red flag:** Wiring submit to `button onClick` instead of `form onSubmit` — you lose native Enter-key submission and accessibility.

### Event bubbling in React
**They ask:** "How does event bubbling work in React, and how is it different from the DOM?"

Events bubble up the *React component tree*, which usually mirrors the DOM but isn't the same mechanism. Because React delegates — historically all listeners sat on `document`, and since React 17 on the *root container* — the bubbling you observe is React replaying the event up through the fiber tree, calling each ancestor's handler.

You stop it with `e.stopPropagation()` like native. The senior nuance: React 17 moved delegation from `document` to the root DOM node, which matters when multiple React apps or a React app nested in non-React code share a page — it prevents their events from interfering.

**Say it:** "React replays events up the component tree via one delegated root listener; `stopPropagation` halts it, and since 17 delegation is on the root container, not `document`."
**Red flag:** Assuming `stopPropagation` on a synthetic event also stops *native* listeners on `document` — it stops React's dispatch; use `e.nativeEvent.stopImmediatePropagation()` if you need to stop native ones too.

### Mock servers
**They ask:** "What's a mock server and why use one in a React project?"

A mock server returns canned API responses so the frontend can be built and tested without a finished backend. The value is decoupling: teams work in parallel, and tests run deterministically without a live server, flaky network, or real data.

Options range from a full fake REST server (`json-server`) to intercepting requests in the browser/tests (MSW — Mock Service Worker), which is popular because it mocks at the network layer so your app code and `fetch`/`axios` stay untouched.

**Say it:** "A mock server serves fake API responses so I can develop and test the frontend independently of the backend, deterministically — I reach for MSW because it intercepts at the network layer without changing app code."
**Red flag:** Hardcoding mock data inside components. That leaks test scaffolding into production code; mock at the network boundary so the real code path is exercised.

### WebSockets in React
**They ask:** "Why and how would you use WebSockets in a React app?"

You use a WebSocket when you need *server-pushed*, low-latency, bidirectional data — chat, live prices, notifications, collaborative editing — where polling would be wasteful and laggy. It's a persistent connection, so the server can push without the client asking.

In React the connection is a side effect and a resource that must be cleaned up: open it in `useEffect`, subscribe to messages, and close it in the cleanup to avoid leaks and duplicate connections on re-render.

```jsx
useEffect(() => {
  const ws = new WebSocket(url);
  ws.onmessage = e => setMessages(m => [...m, JSON.parse(e.data)]);
  return () => ws.close();
}, [url]);
```

**Say it:** "WebSockets give server-push, bidirectional, low-latency updates for chat or live data; I own the connection in `useEffect` and close it in cleanup so re-renders don't leak sockets."
**Red flag:** Opening the socket without a cleanup return — every re-render or remount stacks another connection.

### Three Redux principles
**They ask:** "What is Redux for, and what are its three principles?"

Redux exists to make state changes *predictable* in large apps: one place to look, one way to change it, easy time-travel debugging. Its three principles: (1) **single source of truth** — the whole app state is one immutable object tree in one store; (2) **state is read-only** — the only way to change it is to dispatch an action describing what happened; (3) **changes are made by pure functions** — reducers take `(state, action)` and return the next state without mutation or side effects.

The entities: the *store* holds state, *actions* describe events, *reducers* compute the next state, and components *subscribe* to read it.

**Say it:** "Redux is one immutable store, changed only by dispatching actions, computed by pure reducers — that predictability is what buys you time-travel debugging and a single source of truth."
**Red flag:** Reaching for Redux by default on every app. Modern React often needs only Context, `useReducer`, or a lighter store — Redux earns its boilerplate on genuinely complex shared state.

### The connect HOC
**They ask:** "What does `connect` do and where does it sit in the architecture?"

`connect` is the classic higher-order component that bridges a React component to the Redux store, so the component itself stays presentational and store-agnostic — it just receives props. It takes `mapStateToProps` (select the slice this component needs) and `mapDispatchToProps` (bind action creators), and returns a wrapped, subscribed component.

```jsx
export default connect(
  state => ({ user: state.user }),
  { logout }
)(Profile);
```

`connect` also optimizes: it only re-renders the wrapped component when the selected props actually change (shallow-compared). Modern Redux favors the `useSelector`/`useDispatch` hooks, which do the same job with less indirection.

**Say it:** "`connect` is an HOC that subscribes a presentational component to the store via `mapState`/`mapDispatch` and re-renders it only when its selected slice changes — hooks like `useSelector` are the modern equivalent."
**Red flag:** Selecting the whole state in `mapStateToProps`/`useSelector`. That re-renders on every change; select the narrowest slice.

### Redux actions
**They ask:** "What is an action in Redux?"

An action is a plain object describing *that something happened* — never how to handle it. It must have a `type` (a string identifying the event) and optionally a `payload`. This is the entire vocabulary of change in Redux: components dispatch actions, reducers interpret them.

```jsx
{ type: 'todos/added', payload: { text: 'Ship it' } }
```

Action *creators* are functions that build these objects so you don't hand-write them everywhere. Keeping actions as serializable plain objects is what enables logging, replay, and time-travel debugging.

**Say it:** "An action is a serializable plain object with a `type` describing what happened — it states the event, never the mutation, which is what makes the log replayable."
**Red flag:** Putting non-serializable values (promises, functions, class instances) in an action. That breaks devtools/replay — side effects belong in middleware, not the action.

### Redux reducers
**They ask:** "What rules must a reducer follow, and write one."

A reducer is a *pure* function `(state, action) => newState`. The rules that make it safe: it must be pure (same inputs → same output), must not mutate the existing state (return a new object), and must not do side effects (no fetch, no random, no dates). Purity is exactly what lets Redux replay actions and undo/redo.

```jsx
function todos(state = [], action) {
  switch (action.type) {
    case 'todos/added':
      return [...state, action.payload];   // new array, no push
    default:
      return state;                        // unknown action → unchanged
  }
}
```

Redux Toolkit's `createReducer`/`createSlice` let you "mutate" via Immer, which produces immutable updates under the hood.

**Say it:** "A reducer is a pure `(state, action) => newState` that never mutates and never does side effects — that purity is what makes time-travel and replay possible."
**Red flag:** `state.push(...)` or `state.x = y` inside a reducer. Mutating state breaks change detection and devtools; spread or use Toolkit's Immer.

### Redux middleware
**They ask:** "What is middleware in Redux and what's it for?"

Middleware is a hook that sits *between dispatching an action and the reducer receiving it*. It's Redux's extension point for anything a pure reducer can't do: async work, logging, crash reporting, routing. Thunks and sagas are middleware for handling side effects like API calls.

The signature is a curried triple — `store => next => action => {}` — where calling `next(action)` passes it along the chain.

```jsx
const logger = store => next => action => {
  console.log('dispatching', action);
  return next(action);
};
```

**Say it:** "Middleware intercepts actions between dispatch and the reducer — it's where async and side effects live, since reducers must stay pure; thunk and saga are the common ones."
**Red flag:** Doing API calls inside components and dispatching only the result, then claiming reducers "do the fetching." Reducers are pure; async belongs in middleware.

### Redux-form
**They ask:** "How does redux-form fit into a React + Redux app?"

redux-form stores form state — values, touched, errors, submitting — inside the Redux store instead of local component state, so the form participates in the same single source of truth and devtools. That was its selling point in the class era: centralized, inspectable form state with validation wired through.

The catch, and the senior point: keeping *every keystroke* in the global store causes broad re-renders and heavy boilerplate. The community largely moved to Formik and React Hook Form, which keep form state local (RHF even uses uncontrolled inputs to minimize renders) — Redux is for app state, not ephemeral form state.

**Say it:** "redux-form puts form state in the Redux store for central inspection, but per-keystroke global updates are costly — that's why the ecosystem moved to Formik and React Hook Form, which keep form state local."
**Red flag:** Recommending redux-form for new projects. It's effectively legacy; form state is ephemeral and belongs local — reach for React Hook Form.

### Why hooks
**They ask:** "Why were hooks introduced — what do they solve?"

Hooks let function components use state and lifecycle, but the deeper why is *reusable stateful logic*. Before hooks, sharing logic meant HOCs and render props, which produced "wrapper hell" and scattered related code across `componentDidMount`/`componentDidUpdate`/`componentWillUnmount`. Hooks let you extract stateful logic into a custom hook and colocate related effects.

They also removed the `this`-binding confusion and made components plainer functions.

The rules exist for a reason: hooks must be called at the top level, in the same order every render, because React tracks them positionally — which is why you can't call them in conditions or loops.

**Say it:** "Hooks give function components state and lifecycle, but the real win is extracting reusable stateful logic into custom hooks — no more wrapper hell or lifecycle-scattered code."
**Red flag:** Saying hooks are "just a syntax preference." They enable logic reuse and colocated effects that HOCs/render-props couldn't do cleanly.

### useEffect
**They ask:** "What does `useEffect` do, and explain its dependency array and cleanup."

`useEffect` runs side effects *after* render — data fetching, subscriptions, manual DOM work — the things that shouldn't happen during render. It consolidates what class components split across `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount`.

The second argument controls *when* it runs: omit it → after every render; `[]` → once after mount; `[a, b]` → whenever a dep changes. The returned function is cleanup, run before the next effect and on unmount — that's how you unsubscribe.

```jsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // cleanup
}, []);
```

**Say it:** "`useEffect` runs side effects after render; the dependency array decides when it re-runs, and the returned cleanup function unsubscribes before the next run or on unmount."
**Red flag:** Omitting a value the effect uses from the deps to "stop it firing." That's a stale-closure bug — fix the dependency, don't lie to React about it.

### useState, useReducer, useContext
**They ask:** "Compare `useState`, `useReducer`, and `useContext`."

They solve different problems. `useState` holds a single piece of local state and returns `[value, setter]` — best for simple, independent values. `useReducer` centralizes state transitions in a reducer `(state, action) => newState` — best when the next state depends on the previous in complex ways, or several values change together. `useContext` isn't state at all — it *reads* a context value, subscribing the component to a provider so you avoid prop-drilling.

```jsx
const [count, setCount] = useState(0);
const [state, dispatch] = useReducer(reducer, initial);
const theme = useContext(ThemeContext);
```

A common senior pattern: `useReducer` + `useContext` together for a lightweight store without Redux.

**Say it:** "`useState` for simple local values, `useReducer` when transitions get complex or coupled, `useContext` to read shared values without prop-drilling — pairing reducer and context gives a mini store."
**Red flag:** Using `useContext` for high-frequency state. Every consumer re-renders on any provider value change — Context is dependency injection, not a performance-tuned store.

### useCallback and useMemo
**They ask:** "When do `useCallback` and `useMemo` actually help?"

Both memoize across renders to preserve referential stability, but they memoize different things: `useMemo` caches a *computed value*, `useCallback` caches a *function reference*. `useCallback(fn, deps)` is literally `useMemo(() => fn, deps)`.

They pay off in two cases: an expensive calculation you don't want to redo every render, or a value/function passed to a `React.memo` child or a hook dependency array, where a fresh reference each render would defeat the memo or re-run the effect.

```jsx
const sorted = useMemo(() => bigSort(items), [items]);
const onPick = useCallback(id => select(id), [select]);
```

**Say it:** "`useMemo` caches a value, `useCallback` caches a function — I use them to keep expensive work and prop references stable for memoized children and effect deps, not by reflex."
**Red flag:** Wrapping everything in `useMemo`/`useCallback` "for performance." Memoization has its own cost and clutters code — apply it where a profiler or a memoized boundary proves it's needed.

### Fiber, the deep cut
**They ask:** "Explain the Fiber architecture in depth — the two phases and the two trees."

Fiber splits reconciliation into two phases so React can stay responsive. The **render/reconcile phase** is interruptible: React walks the fiber tree building a *work-in-progress* tree, diffing against the *current* tree, and tagging fibers with side-effect flags (placement, update, deletion). Because this phase is pausable and produces no visible output, React can throw it away and restart at a higher priority. The **commit phase** is synchronous and uncancellable: React applies the flagged effects to the DOM and swaps the WIP tree to become current.

Each fiber is a unit of work with `child`/`sibling`/`return` pointers, letting React traverse without recursion (so it can pause mid-traversal). Double-buffering the two trees is what makes the swap atomic.

**Say it:** "Fiber has an interruptible render phase that builds a work-in-progress tree and tags effects, and a synchronous commit phase that flushes them — double-buffered current/WIP trees make the swap atomic."
**Red flag:** Saying side effects run during the render phase. Because that phase can be paused or restarted, effects must wait for commit — putting them earlier causes double-invocation bugs.

### Scheduling priority lanes
**They ask:** "How does React prioritize and schedule work at a good level of detail?"

React assigns each update a priority and schedules rendering cooperatively so urgent work preempts non-urgent work. Modern React models priority with **lanes** — a bitmask where different update sources (discrete input, transitions, retries) map to lanes React can batch and order. Discrete events like clicks/keystrokes get synchronous, highest priority; `startTransition` updates get a transition lane that's interruptible; offscreen/retry work is lowest.

The scheduler yields back to the browser between units of work (cooperative scheduling) so long renders don't block the main thread, and it can abandon in-progress low-priority work when a high-priority update arrives.

**Say it:** "React tags updates into priority lanes — discrete input is synchronous and urgent, transitions are interruptible — and the scheduler yields to the browser between units so high-priority work can preempt low."
**Red flag:** Describing it as a simple FIFO queue. It's priority-based and preemptive; low-priority renders can be interrupted and restarted, not just delayed.

### Recursion over children
**They ask:** "Why does reconciliation recurse over child elements, and what guides the diff?"

React reconciles by walking the tree top-down, recursing into each element's children to compare the new tree against the old one node by node. It needs to descend the whole subtree because a parent's change can cascade, and each child must be matched to its previous counterpart to decide *update vs. remount*.

Two heuristics keep this O(n) instead of O(n³): different element *types* at a position → tear down the old subtree and build fresh (state is lost); same type → keep the instance and update props. For lists, **keys** give children a stable identity across renders so React matches them correctly instead of by position.

**Say it:** "Reconciliation recurses through children matching each to its previous node — same type updates in place, different type remounts — and keys give list children stable identity so a reorder doesn't attach state to the wrong item."
**Red flag:** Using array index as a key on a reorderable/filterable list. Index keys tie state to position, so reordering mangles inputs and component state — use a stable id.

### Functional components in depth
**They ask:** "What are the real pros and cons of functional components versus classes?"

Functional components won because they make logic *reusable and colocated*: custom hooks extract stateful logic without the wrapper hell of HOCs/render props, related effects live together instead of scattered across lifecycle methods, and there's no `this` binding. They're also lighter to read and test.

The trade-offs to be honest about: closures capture values per render, which creates the stale-closure class of bugs if dependency arrays are wrong; effect timing is less obvious than named lifecycle methods; and there's no direct `componentDidCatch` — error boundaries still require a class (or a library).

**Say it:** "Functional components win on reusable logic through custom hooks and colocated effects with no `this`, at the cost of closure/stale-value pitfalls and needing a class for error boundaries."
**Red flag:** Claiming functional components are strictly faster. The bigger wins are logic reuse and maintainability; raw render cost is similar.

### Class components in depth
**They ask:** "Give a deep take on class components and why functional ones are preferred."

Class components carry named lifecycle methods and an instance (`this`) that persists across renders, which made them the only way to hold state and effects pre-hooks. They still uniquely provide error boundaries via `componentDidCatch`/`getDerivedStateFromError`.

Why functional is preferred: classes made logic reuse awkward (HOCs and render props nested deeply), split related logic across `componentDidMount`/`Update`/`WillUnmount`, and exposed the `this`-binding trap. They also interact poorly with some optimizations and are more code. The deprecated unsafe lifecycles (`componentWillMount`, `componentWillReceiveProps`) were footguns hooks avoid entirely.

**Say it:** "Classes gave us lifecycle and instance state and still own error boundaries, but they scatter related logic and carry the `this` trap — hooks colocate that logic and reuse it cleanly, which is why functional is the default."
**Red flag:** Saying classes are "removed" or "deprecated." They're fully supported and still required for error boundaries — they're just no longer the default choice.

### setState batching and async
**They ask:** "Why is `setState` asynchronous, how is it batched, and what's the callback for?"

`setState` is asynchronous because React *batches* multiple updates into a single re-render for performance — flushing on every call would thrash the DOM. So within one event handler, several `setState` calls collapse into one render, and reading state immediately after gives the old value.

That's why sequential increments need the updater form: `setCount(c => c + 1)` queues on the previous queued value, whereas `setCount(count + 1)` three times all read the same stale `count` and land on `+1`.

The class `setState(updater, callback)` runs the callback *after* the re-render commits — the correct place to read the updated DOM/state. In React 18, batching became automatic *everywhere* (promises, timeouts, native handlers), not just React events.

**Say it:** "`setState` is async so React can batch updates into one render; I use the functional updater for dependent updates, and React 18 made batching automatic even in promises and timeouts."
**Red flag:** Expecting three `setCount(count + 1)` calls to add three. Without the updater they all read the same stale value and add one — and pre-18, code assumed setTimeout/promises weren't batched.

### Lifecycle methods
**They ask:** "Walk through the main lifecycle methods and their order."

Class lifecycles fall into three phases. **Mount:** `constructor` → `getDerivedStateFromProps` → `render` → `componentDidMount` (where you fetch/subscribe). **Update** (props/state change): `getDerivedStateFromProps` → `shouldComponentUpdate` (bail out to skip render) → `render` → `getSnapshotBeforeUpdate` → `componentDidUpdate`. **Unmount:** `componentWillUnmount` (cleanup subscriptions/timers).

Knowing *why* each exists is the senior signal: `componentDidMount` for post-render side effects, `shouldComponentUpdate` for perf bailout, `componentWillUnmount` to prevent leaks. The hooks equivalent: `useEffect(fn, [])` ≈ mount, `useEffect(fn, [deps])` ≈ update, the cleanup return ≈ unmount — one API instead of several.

**Say it:** "Mount runs constructor → render → `componentDidMount`; updates run `shouldComponentUpdate` → render → `componentDidUpdate`; unmount runs `componentWillUnmount` for cleanup — and `useEffect` with its cleanup collapses all three."
**Red flag:** Naming `componentWillMount`/`componentWillReceiveProps` as current. They're the deprecated unsafe lifecycles — mention them only as legacy.

### Static typing with TypeScript
**They ask:** "Why add Flow or TypeScript when React already has prop-types?"

Because the two catch bugs at different times. `prop-types` validates at *runtime*, in development only, and just logs warnings — the bad value already flowed through. TypeScript (or Flow) validates at *compile time*: wrong or missing props are errors before the code runs, and typing propagates through the whole call graph, not just component boundaries.

```tsx
type Props = { size: number; alt?: string };
function Avatar({ size, alt = '' }: Props) { ... }
```

You also get editor autocomplete, safe refactors, and self-documenting component contracts. That's why modern codebases drop `prop-types` for TypeScript — same intent, enforced earlier and everywhere.

**Say it:** "prop-types warns at runtime in dev only; TypeScript catches wrong props at compile time across the whole graph and gives autocomplete and safe refactors — that's why it replaced prop-types."
**Red flag:** Running both prop-types and TypeScript on the same components. That's redundant runtime overhead; TypeScript's static check supersedes it.

### PureComponent and memo
**They ask:** "What are `PureComponent` and `React.memo` for, and how do they differ from a plain component?"

Both exist to skip unnecessary re-renders. A plain `Component` re-renders whenever its parent does; `PureComponent` implements `shouldComponentUpdate` with a *shallow* comparison of props and state, so it re-renders only when they actually change. `React.memo` is the same idea for function components — a HOC that shallow-compares props.

```jsx
const Row = React.memo(function Row({ item }) { ... });
```

The critical caveat: shallow comparison means a new object/array/function reference each render *defeats* it — which is exactly why you pair `memo` with `useMemo`/`useCallback` for the props you pass in. `memo` accepts a custom comparator as a second arg for non-shallow cases.

**Say it:** "`PureComponent` and `React.memo` skip re-renders via a shallow prop/state compare; they only help if the props keep stable references, so I pair `memo` with `useCallback`/`useMemo`."
**Red flag:** Wrapping every component in `memo`. If props change references each render it does nothing but add comparison cost — apply it to real re-render hotspots with stable props.

### forwardRef
**They ask:** "What are refs really for, and how does `forwardRef` fit in?"

Refs are for imperative access that lives outside React's declarative data flow: focusing/selecting an input, measuring layout, scrolling, triggering animations, or integrating third-party DOM libraries. The rule of thumb — if the value drives what renders, use state; if it's an imperative handle the render output doesn't depend on, use a ref.

`forwardRef` solves a specific gap: a parent can't put a `ref` on a *custom* component and reach the inner DOM node, because `ref` isn't a normal prop. `forwardRef` passes the parent's ref through to a child element.

```jsx
const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);
```

Pair it with `useImperativeHandle` to expose a curated API (e.g. `{ focus() }`) instead of the raw node. (React 19 makes `ref` a regular prop, retiring the need for `forwardRef`.)

**Say it:** "Refs are for imperative work like focus, measurement, and third-party DOM integration; `forwardRef` forwards a parent's ref through a custom component to the inner node, optionally curated by `useImperativeHandle`."
**Red flag:** Using refs to read or mutate values that should drive rendering. If the UI depends on it, it's state — refs are for imperative handles the render doesn't read.
