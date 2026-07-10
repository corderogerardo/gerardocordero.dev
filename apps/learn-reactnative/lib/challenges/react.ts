import type { Challenge } from '../challenges'

export const reactChallenges: Challenge[] = [
  // ─── React (39–50) ───
  {
    id: 39,
    title: 'Conditional rendering',
    category: 'React',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Render a welcome message if the user is logged in, otherwise show a login prompt.
Use a "loggedIn" state variable and a button to toggle it. Use a ternary for the conditional.`,
    starterCode: `export default function Welcome() {
  const [loggedIn, setLoggedIn] = useState(false)
  // Your code here
  return null
}`,
    solution: `export default function Welcome() {
  const [loggedIn, setLoggedIn] = useState(false)
  return (
    <View>
      {loggedIn ? <Text>Welcome back!</Text> : <Text>Please log in</Text>}
      <Button title={loggedIn ? 'Log Out' : 'Log In'} onPress={() => setLoggedIn(l => !l)} />
    </View>
  )
}`,
    explanation: `Conditional rendering exists because JSX is just expressions — there is no template directive like \`v-if\`; you branch with plain JavaScript, and the reconciler handles mounting and unmounting whatever the expression evaluates to. The ternary is the workhorse: both branches are visible in one place, and each branch produces a real element the diff can compare.

The mechanics here: \`loggedIn\` lives in state because it drives the UI — flipping it re-renders, and React swaps the \`<Text>\` subtree. The toggle uses the **functional updater** (\`setLoggedIn(l => !l)\`) because the next state depends on the previous one; reading the closed-over \`loggedIn\` works today but breaks the moment two toggles batch into one render.

Know the \`&&\` trap: \`{count && <Badge />}\` renders the literal \`0\` when count is zero — and in React Native, a bare string or number outside a \`<Text>\` throws. Coerce (\`count > 0 &&\`) or use a ternary with an explicit \`null\`.

**Red flag:** Juniors say "setState is asynchronous" when asked why the toggle needs an updater function. The precise answer is *batching* — the state variable is a closure constant for the render, and functional updaters read the queued value, not the stale one.

**Say it:** "Conditional rendering is just expression evaluation — I use ternaries for two-branch UI, guard \`&&\` against falsy-zero rendering, and functional updaters whenever next state depends on previous."`,
    tests: [
      { it: 'initializes loggedIn state to false', check: ['useState(false)'] },
      { it: 'branches on loggedIn with a ternary', check: ['loggedIn ?'] },
      { it: 'toggles state via the setter', check: ['setLoggedIn('] },
    ],
    hints: ['Ternary operator for conditional rendering', 'Toggle state on button press', 'Functional updater: setLoggedIn(l => !l)'],
  },
  {
    id: 40,
    title: 'List rendering with keys',
    category: 'React',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Render a list of groceries from an array of objects { id, name }.
Each item must have a unique key prop taken from the data — not the array index.`,
    starterCode: `const groceries = [
  { id: 1, name: 'Milk' },
  { id: 2, name: 'Bread' },
  { id: 3, name: 'Eggs' },
]

export default function GroceryList() {
  // Your code here
  return null
}`,
    solution: `const groceries = [
  { id: 1, name: 'Milk' },
  { id: 2, name: 'Bread' },
  { id: 3, name: 'Eggs' },
]

export default function GroceryList() {
  return (
    <View>
      {groceries.map(item => <Text key={item.id}>{item.name}</Text>)}
    </View>
  )
}`,
    explanation: `Keys exist because of how reconciliation matches list children between renders. Without keys, React pairs old and new children **by index** — insert one item at the top and every row below it diffs against the wrong previous row, so React mutates all of them instead of moving one. \`key\` lets children match **by identity**: same key, same fiber, state and DOM preserved; the reconciler reorders instead of rewriting.

The mechanics are one line: \`map\` the data to elements, put \`key\` on the **outermost element returned from the map** (not on some nested child), and source the key from a stable id in the data. Stability is the whole contract — the key must identify the *entity*, not the *position*.

Index-as-key is exactly as broken as no key, because the index *is* the position. It bites hardest when rows hold state: reorder a list of inputs keyed by index and the text stays in the old slots while the labels move. \`Math.random()\` as key is worse — a new identity every render means full teardown and remount of every row.

**Red flag:** Saying "keys silence the console warning." Keys are a correctness mechanism for the diffing algorithm; the warning is just the messenger. Explain identity-vs-index matching or the answer reads as memorized.

**Say it:** "Keys give list children identity so reconciliation matches by entity instead of index — I key on a stable data id, never the index, because index keys corrupt row state on reorder."`,
    tests: [
      { it: 'maps over the groceries array', check: ['groceries.map('] },
      { it: 'sets a key prop on each item', check: ['key='] },
    ],
    hints: ['map over array', 'key prop on outermost element', 'Use unique id from data'],
  },
  {
    id: 41,
    title: 'Composition vs inheritance',
    category: 'React',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Create a Dialog component that uses composition — accept a "title" prop and
"children" for the body content. Render a close button and the children.`,
    starterCode: `function Dialog({ title, children }) {
  // Your code here
  return null
}

export default function App() {
  return <Dialog title="Confirm">Are you sure?</Dialog>
}`,
    solution: `function Dialog({ title, children, onClose }) {
  return (
    <View style={{ padding: 24, backgroundColor: 'white', borderRadius: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{title}</Text>
        <Button title="X" onPress={onClose} />
      </View>
      {children}
    </View>
  )
}`,
    explanation: `React chose composition over inheritance deliberately: a component hierarchy built on \`extends\` couples every variant to a base class's internals, while composition keeps each component a black box configured entirely through its props. The React team's own guidance is that they've found no case where inheritance is the better tool — specialization is "a specific component rendering a generic one and configuring it with props."

The mechanics: \`children\` is just a prop — whatever sits between \`<Dialog>\` and \`</Dialog>\` arrives as \`props.children\`, and the Dialog renders it as an opaque slot. Dialog owns the *chrome* (padding, header row, close button); the caller owns the *content*. Neither knows the other's internals, which is what makes Dialog reusable for a confirm, a form, or an image preview without modification. Need multiple slots? Pass elements as named props (\`header\`, \`footer\`) — props can hold JSX like any other value.

The trade-off to name: composition pushes configuration to the call site, so a deeply configurable component can grow a wide prop surface. That's still cheaper than an inheritance tree, because each prop is an explicit contract instead of an implicit override.

**Red flag:** Reaching for a \`BaseDialog\` class with \`ConfirmDialog extends BaseDialog\`. In a React interview that signals fighting the framework — the idiomatic answer is a generic component specialized via props and children.

**Say it:** "children is just a prop, so containment is free — the component owns its chrome, callers own the content, and specialization happens with props, never with extends."`,
    tests: [
      { it: 'renders the title prop', check: ['{title}'] },
      { it: 'renders children as the body slot', check: ['{children}'] },
      { it: 'has a close button handler', check: ['onPress'] },
    ],
    hints: ['children prop for composition', 'Component owns chrome, caller owns content', 'Avoid inheritance in React'],
  },
  {
    id: 42,
    title: 'Higher-Order Component pattern',
    category: 'React',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Write a HOC called withLogging that logs "Component rendered" each time the wrapped component renders.
Apply it to a simple Text component. Remember to forward props through.`,
    starterCode: `function withLogging(WrappedComponent) {
  // Your code here
  return null
}

function Hello() { return <Text>Hello</Text> }
const HelloWithLogging = withLogging(Hello)`,
    solution: `function withLogging(WrappedComponent) {
  return function LoggedComponent(props) {
    console.log('Component rendered')
    return <WrappedComponent {...props} />
  }
}`,
    explanation: `HOCs were the pre-hooks answer to sharing cross-cutting behavior — logging, auth gating, data subscription — without inheritance: a function that takes a component and returns a **new component** wrapping it. \`connect\` from React Redux and \`withRouter\` made the pattern famous.

The mechanics: \`withLogging\` runs **once** at definition time and returns \`LoggedComponent\`; the \`console.log\` sits in the returned component's render path, so it fires on every render of the wrapper. \`{...props}\` forwarding is non-negotiable — the wrapper must be transparent, or every HOC in the chain becomes a prop bottleneck. Production HOCs also set \`displayName\` for devtools and hoist static members; knowing those chores exist is part of the answer.

Two classic landmines: never call a HOC **inside render** — \`withLogging(Hello)\` produces a brand-new component type each call, so reconciliation sees a different type every render and remounts the entire subtree, destroying its state. And HOCs stack into wrapper pyramids — five of them means five layers in devtools — which is precisely the pain hooks were designed to remove by making stateful logic a plain composable function.

**Red flag:** Presenting HOCs as today's default for logic reuse. The senior answer is historical placement: "I can write one, I maintain them in legacy code, but new cross-cutting logic becomes a custom hook."

**Say it:** "A HOC is a component-in, component-out factory — apply it at module scope, forward all props, and in modern code I'd reach for a custom hook instead of stacking wrappers."`,
    tests: [
      { it: 'returns a new component that renders the wrapped one', check: ['<WrappedComponent'] },
      { it: 'forwards props through the wrapper', check: ['{...props}'] },
      { it: 'logs on every render', check: ["console.log('Component rendered')"] },
    ],
    hints: ['HOC returns a new component', 'Spread props through', 'Never call a HOC inside render — new type = remount'],
  },
  {
    id: 43,
    title: 'Custom useDebounce hook',
    category: 'React',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Write a custom useDebounce hook that delays updating a value until
a specified delay (ms) has passed since the last change.`,
    starterCode: `function useDebounce(value, delay) {
  // Your code here
  return value
}

export default function Search() {
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 300)
  return <TextInput value={query} onChangeText={setQuery} placeholder="Search..." />
}`,
    solution: `function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}`,
    explanation: `Custom hooks are the payoff of the hooks redesign: stateful logic as a plain composable function. Before hooks, "debounce this value" meant a HOC or render prop wrapping your component; now it's four lines that drop into any component with no wrapper cost — which is exactly why hooks exist.

The mechanism is an elegant inversion: the hook doesn't fight re-renders, it **uses** them. Every keystroke re-renders the component with a new \`value\`; the effect's dependency array \`[value, delay]\` sees the change, runs the **cleanup from the previous effect first** — cancelling the pending timer — then schedules a fresh one. Only when the value survives \`delay\` milliseconds untouched does the timeout fire and update \`debouncedValue\`. The cleanup function is the entire algorithm; without it you'd stack timers and fire once per keystroke, just late.

Note the two-state design: the raw \`value\` stays responsive (the input never lags), while consumers read the debounced one. That split — urgent UI state versus derived, rate-limited state — is the same shape \`useDeferredValue\` formalizes.

**Red flag:** Debouncing the *handler* with a bare \`setTimeout\` and no cleanup. It leaks timers, fires with stale closures, and keeps running after unmount. The effect-plus-cleanup version is the answer that shows you understand the effect lifecycle.

**Say it:** "The cleanup function is the debounce — each value change cancels the previous timer via effect cleanup, so only a value that survives the full delay ever commits."`,
    tests: [
      { it: 'keeps internal debounced state', check: ['useState('] },
      { it: 'schedules the update in an effect', check: ['useEffect(', 'setTimeout('] },
      { it: 'cancels the pending timer on change (cleanup)', check: ['clearTimeout('] },
    ],
    hints: ['setTimeout with delay', 'Clear timeout on value change (cleanup)', 'Return debounced value'],
  },
  {
    id: 44,
    title: 'Custom useLocalStorage hook',
    category: 'React',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Write a custom useLocalStorage hook that syncs state with localStorage.
It should work like useState but persist the value across page reloads.`,
    starterCode: `function useLocalStorage(key, initialValue) {
  // Your code here
  return [value, setValue]
}`,
    solution: `function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch { return initialValue }
  })
  const setValue = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value
    setStoredValue(valueToStore)
    window.localStorage.setItem(key, JSON.stringify(valueToStore))
  }
  return [storedValue, setValue]
}`,
    explanation: `This hook is an interview favorite because it packs three senior concerns into a dozen lines: initialization cost, API parity, and failure at a trust boundary.

**Lazy initializer:** \`useState(() => …)\` runs the function only on mount. Passing \`useState(readAndParse())\` would hit \`localStorage\` and \`JSON.parse\` on **every render** — the result gets thrown away after the first, but you pay the synchronous I/O each time. The initializer-function form is precisely for expensive initial state.

**API parity:** \`useState\`'s contract includes functional updates, so \`setValue\` checks \`value instanceof Function\` and applies it to the current value before persisting. Skip this and \`setCount(c => c + 1)\` stores a stringified function — the hook silently stops being a drop-in replacement.

**The try/catch is not defensive noise:** \`localStorage\` genuinely throws — SSR has no \`window\`, Safari private mode used to throw on write, quota can be exceeded, and stored JSON can be corrupt. Falling back to \`initialValue\` keeps the app rendering when storage is hostile. React state stays the source of truth; storage is a write-through side effect.

**Red flag:** Reading \`localStorage\` directly in render without the lazy wrapper, or forgetting serialization entirely. Both say "I've never shipped this hook."

**Say it:** "Lazy initializer so storage is read once, functional-update support to keep useState's contract, and try/catch because storage throws in SSR and private mode — state is the source of truth, storage is write-through."`,
    tests: [
      { it: 'initializes state lazily from storage', check: ['useState(', 'localStorage.getItem('] },
      { it: 'persists on update', check: ['localStorage.setItem('] },
      { it: 'serializes and deserializes JSON', check: ['JSON.parse(', 'JSON.stringify('] },
    ],
    hints: ['Lazy initializer for useState', 'Wrap in try/catch for SSR/security', 'Stringify for storage'],
  },
  {
    id: 45,
    title: 'useRef for DOM access',
    category: 'React',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Use useRef to focus a TextInput when a button is pressed.
The TextInput should auto-focus when the component mounts.`,
    starterCode: `export default function FocusInput() {
  // Your code here
  return null
}`,
    solution: `export default function FocusInput() {
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])
  return (
    <View>
      <TextInput ref={inputRef} placeholder="Type here" />
      <Button title="Focus" onPress={() => inputRef.current?.focus()} />
    </View>
  )
}`,
    explanation: `Refs are React's sanctioned escape hatch from the declarative model. Focus is imperative by nature — "focus this now" is a command, not a description of UI — so it cannot be expressed as rendered output. The ref gives you a handle to the host element (the native view in React Native, the DOM node on web) to issue that command.

Mechanics: \`useRef(null)\` creates a stable \`{ current }\` box that survives re-renders; passing it as \`ref\` makes React assign the host instance into \`.current\` during the **commit phase**. That timing is why the auto-focus lives in \`useEffect\` with \`[]\` deps — effects run after commit, so the node is guaranteed attached. Calling \`.focus()\` in the render body would fire before attachment (and would be a render-phase side effect, illegal under concurrent rendering, where the render phase can run multiple times without committing). The \`?.\` guard covers the detached window around unmount.

The decision rule worth stating: if a value should be *reflected in the UI*, it's state; if it only needs to *persist between renders* — timer ids, previous values, element handles — it's a ref, because mutating \`.current\` triggers no render.

**Red flag:** Storing UI-driving values in a ref "to avoid re-renders." The screen silently stops updating — if the user should see it, it's state by definition.

**Say it:** "A ref is a render-persistent mutable box that doesn't trigger renders — refs are attached at commit, so imperative calls like focus belong in effects or handlers, never in the render body."`,
    tests: [
      { it: 'creates a ref for the input', check: ['useRef(null)'] },
      { it: 'attaches the ref to the element', check: ['ref='] },
      { it: 'auto-focuses after mount in an effect', check: ['useEffect(', '.focus()'] },
    ],
    hints: ['useRef(null) for DOM refs', 'Ref prop on native component', 'Focus in useEffect — refs attach at commit'],
  },
  {
    id: 46,
    title: 'Error boundary component',
    category: 'React',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Create an ErrorBoundary class component that catches errors in its child tree.
Display a fallback UI with "Something went wrong" and a retry button.`,
    starterCode: `class ErrorBoundary extends React.Component {
  // Your code here
  render() {
    return this.props.children
  }
}`,
    solution: `class ErrorBoundary extends React.Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error, info) { console.error(error, info) }
  render() {
    if (this.state.hasError) {
      return (
        <View>
          <Text>Something went wrong</Text>
          <Button title="Retry" onPress={() => this.setState({ hasError: false })} />
        </View>
      )
    }
    return this.props.children
  }
}`,
    explanation: `Error boundaries exist because an uncaught error during rendering unmounts the **entire React tree** — one broken product card takes down the whole app. A boundary converts that into a localized fallback: the failed subtree is replaced, everything outside it keeps working.

The two methods map onto React's two-phase render model, and that mapping is the interview answer. \`getDerivedStateFromError\` is **static and pure** because it runs during the render phase, which concurrent React may execute multiple times before committing — its only job is deriving fallback state. \`componentDidCatch\` runs in the **commit phase**, guaranteed once per committed error, so side effects like logging to Sentry belong there. Same split as the \`componentWill*\` deprecation: side effects only in commit-phase code.

Boundaries only catch errors thrown **during rendering, lifecycle methods, and constructors of the tree below**. Event handlers, async callbacks, and \`setTimeout\` bodies are not render — use try/catch there (or throw from state inside the handler to route it into render). Retry is just \`setState({ hasError: false })\` to re-attempt the children. This remains a class-component-only API — there is no hook equivalent, which is why libraries like \`react-error-boundary\` wrap this exact class. Place boundaries per feature (per screen, per widget), not one global catch-all.

**Red flag:** Expecting a boundary to catch a failed \`fetch\` in an onPress handler. Saying "boundaries catch render-phase errors only" is the line that shows you've actually used one.

**Say it:** "getDerivedStateFromError is render-phase and pure — derive fallback state; componentDidCatch is commit-phase — log there; and handlers or async errors never reach a boundary."`,
    tests: [
      { it: 'derives fallback state from the error (render phase)', check: ['getDerivedStateFromError'] },
      { it: 'logs via commit-phase lifecycle', check: ['componentDidCatch'] },
      { it: 'renders children when healthy', check: ['this.props.children'] },
    ],
    hints: ['getDerivedStateFromError static', 'componentDidCatch for logging', 'Retry resets hasError'],
  },
  {
    id: 47,
    title: 'Profiling with React.memo',
    category: 'React',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Create a list where each item is rendered by a component wrapped in React.memo.
Verify that items don't re-render when their props haven't changed (add a console.log in the child).`,
    starterCode: `function ListItem({ label }) {
  console.log('render', label)
  return <Text>{label}</Text>
}

export default function List() {
  const [count, setCount] = useState(0)
  const items = ['Apple', 'Banana', 'Cherry']
  // Your code here
  return null
}`,
    solution: `const MemoListItem = React.memo(ListItem)

export default function List() {
  const [count, setCount] = useState(0)
  const items = ['Apple', 'Banana', 'Cherry']
  return (
    <View>
      <Text>Count: {count}</Text>
      <Button title="+" onPress={() => setCount(c => c + 1)} />
      {items.map(item => <MemoListItem key={item} label={item} />)}
    </View>
  )
}`,
    explanation: `\`React.memo\` exists because React's default is brutal: when a parent renders, **every child re-renders**, props changed or not. Memo converts that O(subtree) cost into a shallow prop comparison — here, pressing "+" re-renders \`List\`, but each \`MemoListItem\` sees the same \`label\` (compared with \`Object.is\`) and skips. The \`console.log\` in the child is your proof: it fires once per item on mount, then stays silent while the counter climbs.

Two placement details matter. The wrap happens **at module scope** — \`React.memo(ListItem)\` inside \`List\`'s body would create a new component type every render, forcing a remount of every row, the exact opposite of the goal. And the memo only holds because the props are primitives: strings compare equal by value under \`Object.is\`. Pass an inline object, array, or arrow function and it's a new reference every render — the memo silently never hits, and you pay the comparison *plus* the render. That's why \`memo\` travels with \`useCallback\`/\`useMemo\` on the props feeding it.

Memo can also hurt: for cheap components the comparison costs more than re-rendering. Profile first (React DevTools Profiler), then memoize proven hot paths — typically list rows and expensive visualizations. The React Compiler automates exactly this, which tells you where the ecosystem is heading.

**Red flag:** "Wrap everything in memo to be safe." Blanket memoization adds overhead and hides the real problem — usually unstable references or state living too high in the tree.

**Say it:** "memo is a shallow reference comparison, so it only pays off when the props feeding it are referentially stable — I apply it to profiled hot paths like list rows, not everywhere by default."`,
    tests: [
      { it: 'memoizes the row component at module scope', check: ['React.memo('] },
      { it: 'renders the rows from data', check: ['items.map('] },
      { it: 'keys each memoized row', check: ['key='] },
    ],
    hints: ['React.memo wraps component', 'Only shallow-compares props', 'useCallback for function props'],
  },
  {
    id: 48,
    title: 'Virtualization with react-window',
    category: 'React',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Use react-window (FixedSizeList) to render 10,000 items efficiently.
Each item shows "Row #N". Only visible rows should be in the DOM.`,
    starterCode: `const items = Array.from({ length: 10000 }, (_, i) => i)

export default function BigList() {
  // Your code here
  return null
}`,
    solution: `const items = Array.from({ length: 10000 }, (_, i) => i)

export default function BigList() {
  return (
    <FixedSizeList height={400} itemCount={items.length} itemSize={35} width={300}>
      {({ index, style }) => <div style={style}>Row #{items[index]}</div>}
    </FixedSizeList>
  )
}`,
    explanation: `Virtualization exists because the DOM, not React, is the bottleneck for huge lists. Reconciling 10,000 elements is survivable; **mounting 10,000 DOM nodes** is not — layout, paint, and memory all scale with node count. A virtualized list renders only the rows intersecting the viewport (~12 here) plus a small overscan buffer, and swaps them as you scroll. \`React.memo\` cannot save you from this — memo skips re-renders, but the nodes still exist.

The mechanics: with a fixed \`itemSize\`, row position is pure arithmetic — offset = index × 35 — so the list knows every row's location without measuring anything (the same reason \`getItemLayout\` matters for FlatList in React Native). The children render prop receives \`index\` and a \`style\` containing \`position: absolute\` and \`top\`; **applying that \`style\` is mandatory** — drop it and every row stacks at the top, the classic first-time bug. \`height\`/\`width\` define the viewport; an outer scrollbar stays honest because total content height is also just arithmetic.

The trade-off: \`FixedSizeList\` demands uniform row height. Variable content needs \`VariableSizeList\` plus a size estimator, which reintroduces measurement cost — so fixed heights are a *design* win worth fighting for, not just an implementation detail.

**Red flag:** Answering a "slow long list" question with memoization alone. The senior instinct is: node count is the problem, so windowing is the fix; memo tunes what remains mounted.

**Say it:** "Virtualization keeps DOM cost proportional to the viewport, not the dataset — fixed row height turns positioning into arithmetic, and the injected style prop is what places each row absolutely."`,
    tests: [
      { it: 'uses a windowed list', check: ['FixedSizeList'] },
      { it: 'declares itemCount and fixed itemSize', check: ['itemCount=', 'itemSize='] },
      { it: 'applies the injected positioning style', check: ['style={style}'] },
    ],
    hints: ['FixedSizeList from react-window', 'Render prop with index + style', 'Only visible rows mounted'],
  },
  {
    id: 49,
    title: 'Suspense with React.lazy',
    category: 'React',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Lazy-load a heavy component using React.lazy and Suspense.
Show "Loading..." fallback while it loads.`,
    starterCode: `const HeavyComponent = React.lazy(() => import('./HeavyComponent'))

export default function App() {
  // Your code here
  return null
}`,
    solution: `const HeavyComponent = React.lazy(() => import('./HeavyComponent'))

export default function App() {
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <HeavyComponent />
    </Suspense>
  )
}`,
    explanation: `\`React.lazy\` is code splitting expressed in the component model. The user-facing problem: without splitting, your bundle grows with every feature and everyone pays the download cost of screens they may never open. \`import('./HeavyComponent')\` is a dynamic import the bundler turns into a **separate chunk**, fetched over the network only when the component first renders.

Mechanics: \`lazy\` wraps the import promise in a component. On first render it *suspends* — signalling "I'm not ready" — and the nearest \`<Suspense>\` boundary above it catches that and shows \`fallback\` until the chunk resolves; then the real component renders in place. This is the same suspension mechanism React 18+ uses for data fetching, which is why the boundary is a generic \`Suspense\`, not something lazy-specific. Constraints worth naming: \`lazy\` requires a **default export** (wrap named exports: \`.then(m => ({ default: m.Named }))\`), call it at **module scope** — inside a component it creates a new lazy component each render and refetches — and boundary *placement* is design: one per route gives page-level loading; nested boundaries let the shell render while a widget streams in.

A network fetch can fail, so a production lazy component pairs Suspense with an **error boundary** for the chunk-load failure case.

**Red flag:** Lazy-loading everything. Splitting has a cost — a network round-trip at interaction time. Split at route boundaries and for genuinely heavy, rarely-used components; the login screen should not lazy-load its button.

**Say it:** "lazy turns a dynamic import into a component that suspends; Suspense catches the suspension and shows the fallback — I split at route boundaries and pair it with an error boundary for failed chunks."`,
    tests: [
      { it: 'creates the component with React.lazy + dynamic import', check: ['React.lazy(', 'import('] },
      { it: 'wraps it in a Suspense boundary', check: ['<Suspense'] },
      { it: 'provides a loading fallback', check: ['fallback='] },
    ],
    hints: ['React.lazy takes dynamic import()', 'Suspense with fallback required', 'Only works with default exports'],
  },
  {
    id: 50,
    title: 'useTransition for pending state',
    category: 'React',
    difficulty: 'hard',
    timeEstimate: '10 min',
    prompt: `Use useTransition to mark a slow filtering operation as non-urgent.
The UI should remain responsive while the filter runs in the background.
Show a "Loading..." indicator while the transition is pending.`,
    starterCode: `export default function FilterList() {
  const [query, setQuery] = useState('')
  const [list, setList] = useState(Array.from({ length: 10000 }, (_, i) => \`Item \${i}\`))
  // Your code here
  return null
}`,
    solution: `export default function FilterList() {
  const [query, setQuery] = useState('')
  const [list, setList] = useState(Array.from({ length: 10000 }, (_, i) => \`Item \${i}\`))
  const [isPending, startTransition] = useTransition()
  const handleChange = (text) => {
    setQuery(text)
    startTransition(() => {
      setList(Array.from({ length: 10000 }, (_, i) => \`Item \${i}\`).filter(x => x.includes(text)))
    })
  }
  return (
    <View>
      <TextInput value={query} onChangeText={handleChange} />
      {isPending && <Text>Loading...</Text>}
      <Text>Results: {list.length}</Text>
    </View>
  )
}`,
    explanation: `\`useTransition\` is React's concurrent scheduling exposed as an API. The problem it solves: typing into a filter over 10,000 rows makes every keystroke pay for a huge list render, so the input stutters. The fix is priority, not speed — split the update in two. \`setQuery(text)\` stays **urgent**: the keystroke echoes immediately. The expensive \`setList\` goes inside \`startTransition\`, marking it a **low-priority lane**.

What the scheduler does with that: the transition render runs in time slices on the JS thread, checking \`shouldYield()\` between fibers. When the next keystroke arrives mid-render, its urgent lane preempts — the half-finished transition render is **thrown away and restarted** with the fresh value, and because the render phase is side-effect-free, discarding it is safe. Nothing half-applied ever commits. \`isPending\` is true from the moment the transition is scheduled until it commits — that's your "Loading..." indicator, and it renders *with the urgent update*, so feedback is instant even while results lag.

Ordering matters: the urgent \`setQuery\` sits **outside** \`startTransition\`; wrap it too and the input itself goes low-priority, reintroducing the lag you were fixing.

**Red flag:** Saying the transition runs "in the background" or "on another thread." It's single-threaded time slicing — concurrency in React means *interleaving*, not parallelism. That one word is the difference between a senior and a junior answer here.

**Say it:** "startTransition marks an update as a low-priority lane: the keystroke commits urgently, the heavy render is interruptible and restartable, and isPending drives the feedback UI — it's cooperative time slicing, not a second thread."`,
    tests: [
      { it: 'uses the transition hook', check: ['useTransition()'] },
      { it: 'wraps the slow update in a transition', check: ['startTransition('] },
      { it: 'keeps the urgent input update outside the transition', check: ['setQuery('] },
    ],
    hints: ['useTransition returns [isPending, startTransition]', 'Wrap slow state update in startTransition', 'Urgent update (input) outside transition'],
  },
]
