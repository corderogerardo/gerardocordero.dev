import type { Challenge } from '../challenges'

export const reactNativeChallenges: Challenge[] = [
  // ─── React Native (1–38) ───
  {
    id: 1,
    title: 'useState counter with validation',
    category: 'React Native',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Create a React Native component that renders a counter with +1 and -1 buttons.
The counter must never go below 0. Show the current count.`,
    starterCode: `export default function SafeCounter() {
  // Your code here
  return null
}`,
    solution: `const [count, setCount] = useState(0)
return (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
    <Button title="-" onPress={() => setCount(c => Math.max(0, c - 1))} />
    <Text style={{ fontSize: 24 }}>{count}</Text>
    <Button title="+" onPress={() => setCount(c => c + 1)} />
  </View>
)`,
    explanation: `This warm-up is really about **where state transitions live**. The invariant "never below 0" belongs inside the updater — \`setCount(c => Math.max(0, c - 1))\` — not in an \`if\` guard around the call site. With the clamp in the updater, every future caller (a swipe gesture, a reset button) inherits the rule for free; with a guard outside, each new caller must remember it.

The functional-update form matters for correctness, not style. \`setCount(count - 1)\` closes over the \`count\` value from the render that created the handler. React batches state updates, so two rapid presses can both read the same stale value and only decrement once. \`c => c - 1\` receives the **latest** state at apply time, so updates compose no matter how they're batched.

**Red flag:** writing \`if (count > 0) setCount(count - 1)\`. It usually works in a demo, but it reads stale state under batching and duplicates the invariant at every call site. Interviewers use this exact counter to probe whether you understand closures over render snapshots.

**Say it:** "I put invariants inside the functional updater so they hold under React's batching and for every future caller, instead of guarding each call site with stale closed-over state."`,
    tests: [
      { it: 'initializes count with useState(0) and wires onPress handlers', check: ['useState(0)', 'onPress'] },
    ],
    hints: ['Use useState with functional updates', 'Math.max prevents negatives'],
  },
  {
    id: 2,
    title: 'useEffect cleanup',
    category: 'React Native',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Write a component that starts an interval when mounted and increments a counter every second.
Clean up the interval when the component unmounts.`,
    starterCode: `export default function Timer() {
  // Your code here
  return null
}`,
    solution: `const [count, setCount] = useState(0)
useEffect(() => {
  const id = setInterval(() => setCount(c => c + 1), 1000)
  return () => clearInterval(id)
}, [])
return <Text style={{ fontSize: 24 }}>{count}s</Text>`,
    explanation: `Effects exist to synchronize a component with something outside React — here, a timer. The contract is symmetric: whatever the effect sets up, the returned cleanup must tear down. Without \`clearInterval\`, the interval outlives the component, keeps the JS thread ticking every second, and calls \`setState\` on an unmounted component — a memory leak plus wasted battery on a mobile device where the JS thread is a shared, contended resource.

Two details carry the interview. First, the empty dependency array means "run on mount, clean up on unmount" — the interval is created exactly once. Second, that only works because the tick uses the functional update \`c => c + 1\`. If you wrote \`setCount(count + 1)\`, the closure would capture \`count = 0\` forever and the timer would stick at 1 — the classic stale-closure interval bug. The functional form removes \`count\` from the effect's dependencies entirely.

**Red flag:** "fixing" the stale closure by adding \`count\` to the deps array. That tears down and recreates the interval every second — it works by accident and churns timers. The senior fix is the functional updater, which keeps the effect mount-only.

**Say it:** "Every subscription an effect opens, its cleanup closes — and I use functional updates so the interval never depends on state, keeping the effect mount-only."`,
    tests: [
      { it: 'sets up an interval in useEffect and clears it in cleanup', check: ['useEffect(', 'setInterval(', 'clearInterval'] },
    ],
    hints: ['Return a cleanup function from useEffect', 'Use empty dependency array'],
  },
  {
    id: 3,
    title: 'FlatList with pull-to-refresh',
    category: 'React Native',
    difficulty: 'easy',
    timeEstimate: '10 min',
    prompt: `Render a FlatList of 50 items (label "Item #N"). Implement pull-to-refresh that logs "refreshed".
Each item should show its index number.`,
    starterCode: `export default function ItemList() {
  const [refreshing, setRefreshing] = useState(false)
  // Your code here
  return null
}`,
    solution: `const data = Array.from({ length: 50 }, (_, i) => ({ key: String(i), label: \`Item #\${i + 1}\` }))
return (
  <FlatList
    data={data}
    refreshing={refreshing}
    onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1000) }}
    renderItem={({ item }) => <Text style={{ padding: 16 }}>{item.label}</Text>}
  />
)`,
    explanation: `FlatList is the answer to a memory problem, not a styling choice: it virtualizes, mounting only a window of rows around the viewport and replacing everything else with correctly-sized blank space. A \`ScrollView\` with \`.map()\` mounts all 50 native views up front — fine at 50, fatal at 5,000 — so reaching for FlatList by default is the habit interviewers look for.

Pull-to-refresh here is fully **controlled**: you own the \`refreshing\` boolean, the list only reports the gesture via \`onRefresh\`. That's why the spinner never dismisses itself — you set \`refreshing\` to \`true\` when the fetch starts and back to \`false\` when it settles. In production the \`setTimeout\` becomes an async refetch with the reset in a \`finally\` block, so a failed request doesn't leave the spinner stuck forever.

Item identity comes from the \`key\` field on each datum (or a \`keyExtractor\`); stable keys are what let the virtualization window slide without remounting rows.

**Red flag:** rendering long lists with \`ScrollView\` + \`.map()\`, or forgetting to reset \`refreshing\` on fetch failure — both signal you haven't shipped a list screen.

**Say it:** "FlatList virtualizes so only a window of rows is ever mounted, and pull-to-refresh is a controlled pattern — I own the refreshing flag and always reset it in finally."`,
    tests: [
      { it: 'uses FlatList with controlled refresh props', check: ['FlatList', 'refreshing', 'onRefresh', 'renderItem'] },
    ],
    hints: ['FlatList needs data, renderItem, and keyExtractor', 'onRefresh toggles refreshing prop'],
  },
  {
    id: 4,
    title: 'TextInput controlled form',
    category: 'React Native',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Create a form with a TextInput for email and a submit Button.
Validate that the email contains "@" before submitting. Show validation errors inline.`,
    starterCode: `export default function EmailForm() {
  // Your code here
  return null
}`,
    solution: `const [email, setEmail] = useState('')
const [error, setError] = useState('')
const handleSubmit = () => {
  if (!email.includes('@')) { setError('Invalid email'); return }
  setError(''); console.log('submit', email)
}
return (
  <View style={{ padding: 16, gap: 8 }}>
    <TextInput
      value={email}
      onChangeText={setEmail}
      placeholder="Email"
      style={{ borderWidth: 1, padding: 8, borderRadius: 4 }}
    />
    {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
    <Button title="Submit" onPress={handleSubmit} />
  </View>
)`,
    explanation: `The controlled-input pattern makes React state the single source of truth: \`value={email}\` pins what the native field shows, \`onChangeText\` is the only way it changes. That single ownership is what makes validation, transformation (trimming, lowercasing), and programmatic resets trivial — the alternative is interrogating a ref and hoping the native view and your logic agree.

The validation *timing* is the senior detail. Validating on submit — not on every keystroke — is a UX decision: flashing "Invalid email" while the user is mid-typing "jo" punishes them for not being done. Errors are set at the submission boundary and **cleared on the next successful submit**, and they render inline next to the field rather than in an \`Alert\`, which would interrupt the flow and lose context.

Note the conditional render: \`{error ? <Text>...</Text> : null}\`. In React Native, accidentally rendering a bare string outside a \`<Text>\` (e.g. \`{error && ...}\` with a string) is a runtime crash, so the explicit ternary is the safe idiom.

**Red flag:** reading the field through a ref at submit time, or validating on every keystroke with an alert. Both say "I haven't built forms users had to live with."

**Say it:** "Controlled inputs make state the single source of truth; I validate at the submit boundary and render errors inline so the user is corrected without being interrupted."`,
    tests: [
      { it: 'controlled TextInput with value and onChangeText', check: ['TextInput', 'value=', 'onChangeText'] },
    ],
    hints: ['Controlled component with value + onChangeText', 'Validate before submitting'],
  },
  {
    id: 5,
    title: 'useReducer for complex state',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Implement a todo list reducer for useReducer. Support actions: ADD_TODO, TOGGLE_TODO, REMOVE_TODO.
Each todo has { id, text, completed }. ADD_TODO receives { text }, TOGGLE_TODO and REMOVE_TODO receive { id }.
Unknown actions must return the state unchanged.`,
    starterCode: `function todoReducer(state, action) {
  // Your code here
  return state
}

export default function TodoList() {
  const [todos, dispatch] = useReducer(todoReducer, [])
  // Your code here
  return null
}`,
    solution: `function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO': return [...state, { id: Date.now(), text: action.text, completed: false }]
    case 'TOGGLE_TODO': return state.map(t => t.id === action.id ? { ...t, completed: !t.completed } : t)
    case 'REMOVE_TODO': return state.filter(t => t.id !== action.id)
    default: return state
  }
}`,
    explanation: `\`useReducer\` earns its place when state transitions outnumber the state itself: instead of three handlers each calling \`setTodos\` with ad-hoc logic, every legal transition lives in one pure function. That centralization pays twice — the reducer is unit-testable without rendering anything (exactly what these tests do), and dispatching from deep children needs only a stable \`dispatch\`, which React guarantees never changes identity.

The load-bearing requirement is **immutability**. \`map\`, \`filter\`, and spread each return a *new* array/object; React decides whether to re-render by comparing references, so \`state.push(...)\` or flipping \`t.completed\` in place returns the same reference and the UI silently stops updating. Note also that \`TOGGLE_TODO\` copies only the touched todo — untouched items keep their identity, which keeps \`React.memo\`'d rows from re-rendering.

The \`default: return state\` branch isn't boilerplate: returning the same reference for unknown actions tells React nothing changed, so no re-render happens.

**Red flag:** mutating state inside the reducer and "fixing" it with \`[...state]\` at the end — that copies the array but not the todos, so memoized children still see stale references. Immutability applies at every level you change.

**Say it:** "A reducer centralizes every legal state transition into one pure, testable function — and immutability isn't style, it's the reference-equality contract React's rendering depends on."`,
    tests: [
      { it: 'ADD_TODO appends a new todo', run: "todoReducer([], { type: 'ADD_TODO', text: 'buy milk' }).length", expected: 1 },
      { it: 'new todos start uncompleted with the given text', run: "(() => { const t = todoReducer([], { type: 'ADD_TODO', text: 'buy milk' })[0]; return [t.text, t.completed] })()", expected: ['buy milk', false] },
      { it: 'TOGGLE_TODO flips completed for the matching id only', run: "todoReducer([{ id: 1, text: 'a', completed: false }, { id: 2, text: 'b', completed: false }], { type: 'TOGGLE_TODO', id: 1 }).map(t => t.completed)", expected: [true, false] },
      { it: 'REMOVE_TODO removes the matching todo', run: "todoReducer([{ id: 1, text: 'a', completed: false }, { id: 2, text: 'b', completed: false }], { type: 'REMOVE_TODO', id: 1 }).map(t => t.id)", expected: [2] },
      { it: 'unknown action returns the same state reference', run: "(() => { const s = [{ id: 1, text: 'a', completed: false }]; return todoReducer(s, { type: 'UNKNOWN' }) === s })()", expected: true },
    ],
    hints: ['useReducer(reducer, initialState)', 'Dispatch actions with type and payload', 'Return new arrays/objects — never mutate'],
  },
  {
    id: 6,
    title: 'React Navigation stack setup',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Configure a React Navigation stack with two screens: Home and Profile.
Home has a button that navigates to Profile, passing a userId param. Profile displays the userId.`,
    starterCode: `// Your navigation setup here
export default function App() {
  return null
}`,
    solution: `const Stack = createNativeStackNavigator()
function HomeScreen({ navigation }) {
  return <Button title="Go to Profile" onPress={() => navigation.navigate('Profile', { userId: 42 })} />
}
function ProfileScreen({ route }) {
  return <Text>User ID: {route.params.userId}</Text>
}
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}`,
    explanation: `React Navigation keeps navigation **state in JavaScript** — a serializable object describing the stack — which is what makes deep linking, state persistence, and web support possible. Choosing \`createNativeStackNavigator\` over the JS stack is itself a decision worth naming: native-stack delegates each screen to \`UINavigationController\` on iOS and Fragment transitions on Android, so pushes, pops, and back-swipes are the platform's own — you trade away custom JS transition interpolators for platform fidelity and better performance.

The data flow is the interview core: \`navigation.navigate('Profile', { userId: 42 })\` writes params into the navigation state; the target screen reads them from \`route.params\`. Params ride inside that serializable state, which drives the key discipline: **pass identifiers, not objects**. Passing a whole user object (or worse, a callback) breaks deep links, state restoration, and leaves the Profile screen showing stale data when the user updates elsewhere. Pass \`userId\`, fetch or select the user on the target screen.

**Red flag:** passing full objects or functions through params. It works until deep linking, persistence, or a data refresh exposes it — interviewers probe exactly this.

**Say it:** "Navigation state is serializable JS state, so I pass ids through params and resolve data on the target screen — and I use native-stack for platform-fidelity transitions unless I need custom interpolators."`,
    tests: [
      { it: 'sets up a native stack inside NavigationContainer and passes params', check: ['createNativeStackNavigator', 'NavigationContainer', 'navigation.navigate(', 'route.params'] },
    ],
    hints: ['createNativeStackNavigator returns Stack', 'navigation.navigate(name, params)', 'route.params'],
  },
  {
    id: 7,
    title: 'Tab navigator with badges',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Create a bottom tab navigator with two tabs: Home and Notifications.
Show a badge count of 3 on the Notifications tab using the built-in badge option.`,
    starterCode: `// Your tab navigator
export default function App() {
  return null
}`,
    solution: `const Tab = createBottomTabNavigator()
function HomeScreen() { return <Text>Home</Text> }
function NotificationsScreen() { return <Text>Notifications</Text> }
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ tabBarBadge: 3 }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}`,
    explanation: `Tab navigators encode a UX contract stacks don't: each tab keeps its own navigation state alive, so switching tabs preserves scroll position and in-progress input — tabs are siblings, not a history. That's why the standard architecture nests a stack *inside* each tab rather than mixing peers and pushes in one navigator.

The badge is the API-knowledge check. \`tabBarBadge\` is a first-class screen option — pass a number or string and React Navigation renders a correctly positioned, platform-styled badge, handling RTL layouts and font scaling. The per-screen \`options\` prop is the right placement for screen-specific config; \`screenOptions\` on the navigator is for defaults shared by every tab (icons, colors). In production the \`3\` comes from state: compute the unread count with a selector and pass \`options={{ tabBarBadge: unread || undefined }}\` — \`undefined\` hides the badge, \`0\` would render a "0".

**Red flag:** hand-rolling a badge with an absolutely-positioned \`View\` over a tab icon. It breaks on RTL, font scaling, and every navigator update — reinventing a first-class option signals you didn't read the API surface before building.

**Say it:** "Tabs preserve per-tab state so I nest a stack inside each tab, and badges are the built-in tabBarBadge option driven by state — undefined to hide, never a hand-positioned View."`,
    tests: [
      { it: 'uses createBottomTabNavigator with a tabBarBadge option', check: ['createBottomTabNavigator', 'Tab.Screen', 'tabBarBadge'] },
    ],
    hints: ['createBottomTabNavigator', 'options={{ tabBarBadge: 3 }} on the screen', 'screenOptions for shared config'],
  },
  {
    id: 8,
    title: 'Navigation deep link handling',
    category: 'React Native',
    difficulty: 'hard',
    timeEstimate: '15 min',
    prompt: `Configure deep linking for a React Navigation stack so that opening the app via
"myapp://profile/42" navigates directly to the Profile screen with userId 42.`,
    starterCode: `const linking = {
  // Your deep link config here
}
export default function App() {
  return null
}`,
    solution: `const linking = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      Home: '',
      Profile: 'profile/:userId',
    },
  },
}
// Pass linking prop to NavigationContainer: <NavigationContainer linking={linking}>`,
    explanation: `Deep linking exists because navigation state is serializable: the \`linking\` config is a declarative bidirectional mapping between URLs and that state. \`prefixes\` declares which URLs belong to you (custom schemes like \`myapp://\`, plus https domains for universal/app links); \`config.screens\` maps paths to screen names, with \`:userId\` segments parsed straight into \`route.params\`. Handing this to \`NavigationContainer\` covers both hard cases for free: the **cold start** (app launched *by* the URL — the container resolves the initial state from it) and the **warm link** (app already running — it navigates in place).

The senior caveat: the JS config is only half the feature. The scheme itself is registered natively — \`CFBundleURLTypes\` on iOS, an intent filter in \`AndroidManifest.xml\` (or the \`scheme\` field in Expo's app config) — and verified https links need Associated Domains / \`assetlinks.json\`. And you test from the terminal, not by tapping links in Notes: \`xcrun simctl openurl booted "myapp://profile/42"\` and \`adb shell am start -W -a android.intent.action.VIEW -d "myapp://profile/42"\` exercise the same resolution production traffic hits, deterministically covering cold and warm starts.

**Red flag:** manually parsing \`Linking.getInitialURL()\` and calling \`navigate\` imperatively — that re-implements what the config does and usually misses the cold-start race.

**Say it:** "The linking config declaratively maps URLs to navigation state — cold start and warm link both — and I test it with simctl and adb because that's the path production traffic takes."`,
    tests: [
      { it: 'declares the custom scheme prefix', run: 'linking.prefixes[0]', expected: 'myapp://' },
      { it: 'maps Profile with a userId path param', run: 'linking.config.screens.Profile', expected: 'profile/:userId' },
      { it: 'maps Home to the root path', run: 'linking.config.screens.Home', expected: '' },
      { it: 'configures exactly the two screens', run: 'Object.keys(linking.config.screens).length', expected: 2 },
    ],
    hints: ['linking prop on NavigationContainer', 'prefixes + config.screens', ':param for dynamic segments'],
  },
  {
    id: 9,
    title: 'Navigation params typing',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Define TypeScript types for a React Navigation stack with two screens:
Home (no params) and Profile ({ userId: number }). Use the typed navigation hooks.`,
    starterCode: `// Define your param list type here
// Then use it in the navigator`,
    solution: `type RootStackParamList = {
  Home: undefined
  Profile: { userId: number }
}
type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>
// Then: const ProfileScreen: React.FC<ProfileScreenProps> = ({ route, navigation }) => {}
// And: const Stack = createNativeStackNavigator<RootStackParamList>()`,
    explanation: `The param list type is the **single source of truth for every route contract in the app**. Once \`RootStackParamList\` exists, three things become compile errors instead of runtime crashes: navigating to a screen that doesn't exist, forgetting a required param (\`navigate('Profile')\` without \`userId\`), and reading a param that was never declared. On a team, this type *is* the navigation documentation — a new screen isn't done until it's in the param list.

The conventions worth naming: \`undefined\` for param-less screens isn't a placeholder — it's what makes \`navigate('Home')\` legal with no second argument while \`navigate('Profile', { userId })\` *requires* one. \`NativeStackScreenProps<ParamList, 'Profile'>\` derives both \`route.params\` and a \`navigation\` prop that knows every valid destination. Passing the generic to \`createNativeStackNavigator<RootStackParamList>()\` types the navigator itself, and declaring the list on React Navigation's \`RootParamList\` global interface makes bare \`useNavigation()\` typed everywhere without per-call generics.

**Red flag:** typing \`useNavigation<any>\` or scattering local \`type Params = ...\` next to each screen. Duplicated route contracts drift, and \`any\` silently converts every navigation typo into a runtime crash — the exact bug class this type exists to delete.

**Say it:** "One central param list makes every route and param a compile-time contract — undefined means no params required, and the screens derive their props from it instead of redeclaring them."`,
    tests: [
      { it: 'declares Home as param-less and Profile with a numeric userId, consumed via NativeStackScreenProps', check: ['Home: undefined', 'userId: number', 'NativeStackScreenProps'] },
    ],
    hints: ['NativeStackScreenProps or useRoute', 'Generic on createNativeStackNavigator', 'undefined = screen takes no params'],
  },
  {
    id: 10,
    title: 'Screen focus listener',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Create a component that uses useFocusEffect to refresh data every time the screen gains focus.
Log "screen focused" when focused. Simulate a data fetch that returns "fresh data".`,
    starterCode: `export default function Dashboard() {
  const [data, setData] = useState('')
  // Your code here
  return null
}`,
    solution: `const [data, setData] = useState('')
useFocusEffect(useCallback(() => {
  console.log('screen focused')
  setData('fresh data')
  return () => console.log('screen unfocused')
}, []))
return <Text>{data}</Text>`,
    explanation: `This hook exists because of a lifecycle mismatch: in a stack navigator, screens **stay mounted** when you push on top of them. A \`useEffect\` with \`[]\` runs once at mount — so when the user navigates away and comes back, your "fetch on mount" never re-fires and the screen shows stale data. \`useFocusEffect\` re-anchors the effect to the navigation lifecycle: it runs on every focus and cleans up on every blur (and on unmount), which is exactly the contract "refresh when the user returns" needs.

The \`useCallback\` wrapper is not decoration — it's required for correctness. \`useFocusEffect\` re-runs its callback whenever the callback's *identity* changes; an inline arrow is a new function every render, so without \`useCallback([])\` the effect tears down and re-runs on every render while focused. The deps array of the \`useCallback\` becomes, effectively, the deps array of the focus effect.

The blur cleanup is where real value hides: cancel in-flight requests, stop timers or sensor subscriptions — work that shouldn't continue while the screen is buried under another.

**Red flag:** "I fetch in useEffect on mount" for a stack screen — the interviewer will ask what happens on back-navigation, and the answer is stale data.

**Say it:** "Stack screens stay mounted under pushed screens, so mount-time effects go stale — useFocusEffect with a useCallback-stabilized callback re-syncs on every focus and cleans up on blur."`,
    tests: [
      { it: 'wraps the focus callback in useCallback inside useFocusEffect', check: ['useFocusEffect(', 'useCallback('] },
    ],
    hints: ['useFocusEffect from @react-navigation/native', 'Wrap callback in useCallback', 'Cleanup runs on blur'],
  },
  {
    id: 11,
    title: 'useContext theme provider',
    category: 'React Native',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Create a ThemeContext that provides a "dark" or "light" theme value.
Build a component that consumes the context and renders its background color based on the theme.`,
    starterCode: `// ThemeContext and provider
export default function ThemedCard() {
  // Your code here
  return null
}`,
    solution: `const ThemeContext = createContext('light')
function ThemedCard() {
  const theme = useContext(ThemeContext)
  return <View style={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', padding: 16 }}>
    <Text>{theme} mode</Text>
  </View>
}
// Wrap in <ThemeContext.Provider value="dark"><ThemedCard /></ThemeContext.Provider>`,
    explanation: `Context solves prop drilling — threading a value through five layers of components that don't care about it — by letting any descendant read the nearest Provider's value directly. Theme is the canonical use case because it's read almost everywhere and written almost never; that read/write ratio is exactly what Context is good at.

Mechanics worth stating precisely: the argument to \`createContext('light')\` is the **default**, used only when a consumer has no Provider above it — it's a fallback for tests and isolated stories, not the way you set the theme. At runtime, the Provider's \`value\` wins, and every consumer re-renders when that value changes identity.

That re-render rule is the trade-off a senior names unprompted. With a string value it's harmless; the moment the value becomes an object (\`{ theme, toggleTheme }\`) created inline in the Provider's render, every consumer re-renders on *every* Provider render, theme change or not — memoize the value with \`useMemo\`. And keep fast-changing state (input text, scroll position) out of a broad context entirely; that's a subscription-based store's job.

**Red flag:** calling Context "React's state management." It's dependency injection with change notification — no selectors, no partial subscriptions; one value, all consumers re-render.

**Say it:** "Context is for tree-wide, rarely-changing values like theme — every consumer re-renders on value change, so I memoize object values and keep hot state in a store with selectors."`,
    tests: [
      { it: 'creates a context and consumes it with useContext', check: ['createContext(', 'useContext('] },
    ],
    hints: ['createContext + useContext', 'Wrap tree with Provider', 'value prop on Provider'],
  },
  {
    id: 12,
    title: 'Zustand store with persist',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Create a Zustand store for a simple counter with increment and decrement actions.
Persist the state to AsyncStorage using zustand/middleware.`,
    starterCode: `// Your Zustand store with persist
export default function Counter() {
  // Your code here
  return null
}`,
    solution: `import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

const useStore = create(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((s) => ({ count: s.count + 1 })),
      decrement: () => set((s) => ({ count: s.count - 1 })),
    }),
    { name: 'counter-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
)`,
    explanation: `Zustand's pitch is state **outside** the React tree: the store is a plain closure, components subscribe via the hook, and — the part worth saying in an interview — selectors like \`useStore(s => s.count)\` mean a component re-renders only when its selected slice changes, not on every store write. No Provider, no context cascade, actions colocated with state.

The persistence layering is the RN-specific knowledge: \`persist\` serializes state on change and rehydrates on startup, and \`createJSONStorage(() => AsyncStorage)\` adapts AsyncStorage's promise-based, string-only API to the middleware. Because AsyncStorage is **async**, rehydration is not instantaneous — the store starts at \`count: 0\` and the persisted value arrives a tick later. Production code gates on \`onRehydrateStorage\` / \`hasHydrated\` to avoid flashing defaults or overwriting saved state. Also reach for \`partialize\` to persist only what should survive a restart — persisting everything is how transient UI state gets fossilized.

The security boundary matters most: AsyncStorage is **plaintext**. Persisting a counter is fine; persisting tokens or PII through this middleware ships secrets to unencrypted storage.

**Red flag:** persisting auth tokens via zustand-persist-to-AsyncStorage. Sensitivity decides the storage tier — secrets go to Keychain/Keystore-backed storage, never a persisted store.

**Say it:** "Zustand keeps state outside the tree with selector-scoped re-renders; persist plus a JSON storage adapter handles AsyncStorage — but rehydration is async and the store is plaintext, so I gate on hydration and never persist secrets."`,
    tests: [
      { it: 'wraps the store in persist with a JSON storage adapter over AsyncStorage', check: ['create(', 'persist(', 'createJSONStorage(', 'AsyncStorage'] },
    ],
    hints: ['zustand persist middleware', 'createJSONStorage for AsyncStorage', 'Rehydration is async'],
  },
  {
    id: 13,
    title: 'Redux Toolkit slice',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Create a Redux Toolkit slice for a counter with actions: increment, decrement, incrementByAmount.
Wrap a component with the Redux Provider and display the count.`,
    starterCode: `// counterSlice definition
export default function Counter() {
  // Your code here
  return null
}`,
    solution: `const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1 },
    decrement: (state) => { state.value -= 1 },
    incrementByAmount: (state, action) => { state.value += action.payload },
  },
})
const store = configureStore({ reducer: { counter: counterSlice.reducer } })
// Use: <Provider store={store}><Counter /></Provider>
// In component: useSelector(s => s.counter.value) + useDispatch`,
    explanation: `Redux Toolkit is the official answer to Redux's boilerplate reputation: \`createSlice\` generates the action types, action creators, and reducer from one declaration, and \`configureStore\` wires the devtools and default middleware (including the checks that catch accidental state mutation and non-serializable values in dev).

The line interviewers probe: \`state.value += 1\` **looks** like mutation but isn't. Slice reducers run inside **Immer** — \`state\` is a draft proxy, and Immer converts your imperative changes into an immutable update with structural sharing. So the reference-equality contract Redux depends on still holds; you just stop hand-writing nested spreads. Say "Immer draft," not "RTK lets you mutate" — the first is precise, the second is wrong in a way a senior interviewer will catch.

Component wiring follows the same subscription economics as any store: \`useSelector(s => s.counter.value)\` re-renders only when that selected value changes, so select the narrowest slice you need; \`useDispatch\` plus the generated action creators (\`counterSlice.actions.increment()\`) replaces hand-typed action objects.

**Red flag:** hand-writing action type constants and switch-statement reducers in 2026, or claiming RTK "made Redux mutable." Both date your Redux to pre-Toolkit.

**Say it:** "createSlice generates actions and reducer from one declaration, and the 'mutations' are Immer drafts compiled to immutable updates — Redux's reference-equality model is intact, only the ceremony is gone."`,
    tests: [
      { it: 'defines a slice with the three reducers and configures the store', check: ['createSlice(', 'initialState', 'incrementByAmount', 'configureStore('] },
    ],
    hints: ['createSlice with name, initialState, reducers', 'configureStore', 'state mutations are Immer drafts'],
  },
  {
    id: 14,
    title: 'React Query fetch and cache',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Use React Query (@tanstack/react-query) to fetch user data from a mock API.
Show a loading indicator while fetching, the user name on success, and an error message on failure.`,
    starterCode: `export default function UserProfile() {
  // Your code here
  return null
}`,
    solution: `const { data, isLoading, error } = useQuery({
  queryKey: ['user', 1],
  queryFn: () => fetch('https://jsonplaceholder.typicode.com/users/1').then(r => r.json()),
})
if (isLoading) return <Text>Loading...</Text>
if (error) return <Text>Error: {error.message}</Text>
return <Text>{data.name}</Text>`,
    explanation: `React Query's premise is that **server state is not client state**: data you fetched is a cache of someone else's source of truth — it can be stale, needs refetching, deduplication, and retry — and none of that belongs in \`useState\`. The hand-rolled \`useEffect\` + \`useState\` + \`isLoading\` + \`error\` fetch has well-known failure modes: race conditions when params change mid-flight, setState after unmount, no caching across screens, every consumer re-implementing retry. \`useQuery\` deletes that entire class.

The \`queryKey\` is the design center, not a label: \`['user', 1]\` is the cache identity. Two components asking for the same key share one request and one cache entry; changing the key (\`['user', userId]\`) automatically refetches; invalidating the key is how mutations trigger refresh. Treat keys as a structured, hierarchical namespace — it's the API you'll build invalidation on.

The three-state render (\`isLoading\` / \`error\` / \`data\`) is exhaustive by construction, and on mobile the defaults quietly do senior work: stale-while-revalidate serves cached data instantly on back-navigation, and refetch-on-reconnect pairs with NetInfo for flaky networks.

**Red flag:** reaching for \`useEffect\` fetching or stuffing server responses into Redux "to have one store." Name the race-condition and staleness problems those create.

**Say it:** "Server state is a cache, not component state — the query key is the cache identity that drives sharing, refetching, and invalidation, and stale-while-revalidate is what makes mobile back-navigation feel instant."`,
    tests: [
      { it: 'uses useQuery with a query key, query function, and handles loading state', check: ['useQuery(', 'queryKey', 'queryFn', 'isLoading'] },
    ],
    hints: ['useQuery with queryKey + queryFn', 'Returns isLoading, error, data', 'Wrap tree in QueryClientProvider'],
  },
  {
    id: 15,
    title: 'Optimistic updates with React Query',
    category: 'React Native',
    difficulty: 'hard',
    timeEstimate: '15 min',
    prompt: `Implement optimistic updates with React Query for a "like" toggle on a post.
Update the cache immediately, then revert on API failure.`,
    starterCode: `export default function LikeButton({ postId }) {
  // Your optimistic update here
  return null
}`,
    solution: `const queryClient = useQueryClient()
const mutation = useMutation({
  mutationFn: (id) => fetch(\`/api/posts/\${id}/like\`, { method: 'POST' }),
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['post', id] })
    const previous = queryClient.getQueryData(['post', id])
    queryClient.setQueryData(['post', id], (old) => ({ ...old, liked: !old.liked }))
    return { previous }
  },
  onError: (err, id, context) => {
    queryClient.setQueryData(['post', id], context.previous)
  },
  onSettled: (data, err, id) => {
    queryClient.invalidateQueries({ queryKey: ['post', id] })
  },
})`,
    explanation: `Optimistic updates buy perceived latency: on a mobile network a like round-trip can take a second, and a button that doesn't respond for a second reads as broken. The pattern assumes success, updates the cache immediately, and treats failure as the exceptional path to roll back.

The choreography is a three-beat contract, and each beat exists for a specific race:

1. **\`onMutate\`: cancel, snapshot, write.** \`cancelQueries\` first — if a background refetch for this key is already in flight, its response would land *after* your optimistic write and overwrite it with pre-mutation data. Then snapshot \`previous\` and write the optimistic value.
2. **\`onError\`: restore the snapshot.** The \`context\` returned from \`onMutate\` carries \`previous\` to the error handler — that return value is the designed hand-off, not a convenience.
3. **\`onSettled\`: invalidate.** Success or failure, refetch the key so the cache converges on the server's truth — your optimistic guess and the server's result (like counts, timestamps) can differ even on success.

**Red flag:** skipping \`cancelQueries\`. The demo works, then in production a refetch races the optimistic write and users watch their like flicker off. Knowing *why* the cancel is there is the senior tell.

**Say it:** "Optimistic UI is cancel, snapshot, write, then roll back on error via the onMutate context — and always invalidate on settle so the cache reconverges with the server."`,
    tests: [
      { it: 'implements the full optimistic choreography: cancel, snapshot, write, rollback', check: ['useMutation(', 'onMutate', 'cancelQueries', 'setQueryData', 'onError'] },
    ],
    hints: ['onMutate for optimistic update', 'onError to rollback', 'Return context from onMutate', 'onSettled invalidates to reconverge'],
  },
  {
    id: 16,
    title: 'React.memo and useMemo',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Create an expensive computation (factorial calculation) and memoize it with useMemo.
Wrap the display component in React.memo to prevent re-renders when its props haven't changed.`,
    starterCode: `function ExpensiveDisplay({ value }) {
  console.log('rendering')
  return <Text>Result: {value}</Text>
}

export default function App() {
  const [count, setCount] = useState(0)
  // Your code here
  return null
}`,
    solution: `const factorial = useMemo(() => {
  let result = 1
  for (let i = 2; i <= count; i++) result *= i
  return result
}, [count])
const MemoDisplay = React.memo(ExpensiveDisplay)
return (
  <View>
    <MemoDisplay value={factorial} />
    <Button title="+" onPress={() => setCount(c => c + 1)} />
  </View>
)`,
    explanation: `These are two different tools that interviews love to see distinguished. \`useMemo\` caches a **value**: the factorial recomputes only when \`count\` changes, so unrelated re-renders (a theme toggle, a parent update) skip the loop. \`React.memo\` caches a **render**: it shallow-compares props and bails out of re-rendering the child when they're referentially equal. They compose — \`useMemo\` keeps the prop stable, \`React.memo\` uses that stability to skip the render. Break either half and the other stops paying: a memoized child receiving a fresh inline object or arrow function every render re-renders every time, comparison cost included.

On React Native this matters more than on web because the JS thread is also the thread that feeds animations and touch responses — wasted render work there is dropped frames, not just CPU heat.

The honest senior position: memoization is not free. The comparison runs on every render, the cached value holds memory, and the deps array is a new bug surface. Memoize expensive computations and hot paths (list rows, children of frequently-updating parents) — after observing the problem, not preemptively. Note one subtlety: \`React.memo(ExpensiveDisplay)\` should live at module scope in real code; recreating the wrapper inside a render defeats it.

**Red flag:** "I wrap everything in memo for performance." That's cargo-culting — comparisons cost, and unstable props defeat it silently.

**Say it:** "useMemo stabilizes a value, React.memo skips a render off that stability — they only pay together, and I apply them where profiling shows re-render cost, not by default."`,
    tests: [
      { it: 'memoizes the computation and the display component', check: ['useMemo(', 'React.memo('] },
    ],
    hints: ['useMemo with deps array', 'React.memo wraps component', 'Only recomputes when deps change'],
  },
  {
    id: 17,
    title: 'FlatList performance optimization',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Optimize a FlatList rendering 1000 items. Use getItemLayout for fixed-height items,
windowSize to reduce render window, and keyExtractor for stable identity.`,
    starterCode: `const DATA = Array.from({ length: 1000 }, (_, i) => ({ id: i, text: \`Item \${i}\` }))

export default function OptimizedList() {
  // Your code here
  return null
}`,
    solution: `const ITEM_HEIGHT = 50
return (
  <FlatList
    data={DATA}
    keyExtractor={item => String(item.id)}
    getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
    windowSize={5}
    removeClippedSubviews={true}
    renderItem={({ item }) => <View style={{ height: ITEM_HEIGHT, padding: 16 }}><Text>{item.text}</Text></View>}
  />
)`,
    explanation: `Each prop here attacks a different cost, and being precise about *which* is the seniority test.

\`getItemLayout\` removes **measurement**, not rendering. Without it, FlatList must render rows to learn where row N sits, which is why \`scrollToIndex\` throws without it and fast scrolls show blanks. With fixed heights, \`offset = height × index\` turns positioning into O(1) arithmetic — instant jumps, accurate scrollbars. It renders nothing faster; it deletes the layout dependency.

\`keyExtractor\` is the identity contract that makes windowing safe: stable keys let React reuse row instances as the window slides. Index-as-key breaks on insert or reorder — every downstream key shifts and row state attaches to the wrong data.

\`windowSize={5}\` shrinks the mounted region from the default 21 viewport-heights to 5 — less memory and batch work, traded against blank areas on fast flings. It's a dial, not a virtue: tune it against observed blanks. \`removeClippedSubviews\` detaches off-screen native views on top of JS-side virtualization.

Unstated but implied: \`renderItem\` rows should be memoized components with stable handler props, or every window shift re-renders rows for nothing. At the point rows get complex, FlashList's recycling model is the next conversation.

**Red flag:** "getItemLayout makes rendering faster." It removes measurement as a dependency for positioning — precision about what it skips is what interviewers grade.

**Say it:** "getItemLayout turns positioning into arithmetic, keyExtractor gives the sliding window stable identity, and windowSize trades memory against blank cells — three different costs, three different knobs."`,
    tests: [
      { it: 'applies the virtualization toolkit: layout math, stable keys, window tuning', check: ['getItemLayout', 'keyExtractor', 'windowSize', 'removeClippedSubviews'] },
    ],
    hints: ['getItemLayout requires fixed heights', 'windowSize reduces concurrent renders', 'Stable keyExtractor'],
  },
  {
    id: 18,
    title: 'Image caching and preloading',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Implement an image gallery that preloads the next image while displaying the current one.
Use Image.prefetch for preloading. Show a loading placeholder while an image loads.`,
    starterCode: `const IMAGES = [
  'https://picsum.photos/400/300?1',
  'https://picsum.photos/400/300?2',
  'https://picsum.photos/400/300?3',
]

export default function Gallery() {
  // Your code here
  return null
}`,
    solution: `const [index, setIndex] = useState(0)
useEffect(() => {
  if (index < IMAGES.length - 1) Image.prefetch(IMAGES[index + 1])
}, [index])
return (
  <View>
    <Image source={{ uri: IMAGES[index] }} style={{ width: 400, height: 300 }}
      defaultSource={require('./placeholder.png')} />
    <Button title="Next" onPress={() => setIndex(i => Math.min(i + 1, IMAGES.length - 1))} />
  </View>
)`,
    explanation: `Prefetching converts wait time the user *will* experience into background work they never see: while they look at image N, \`Image.prefetch(IMAGES[index + 1])\` pulls N+1 into the **native** image cache (keyed by URL), so tapping Next resolves from disk instead of the network. Keying the effect on \`index\` makes the strategy incremental — always one step ahead, never downloading the whole gallery speculatively, which respects mobile bandwidth and memory.

The details that separate shipping code from demo code: the boundary check stops prefetching past the last image; \`Math.min\` clamps navigation the same way; \`defaultSource\` shows a bundled placeholder synchronously — it's a local \`require\`, available at first paint, no network involved. Note \`prefetch\` returns a promise you can ignore for warming but await when you *must* guarantee readiness (e.g. before a transition).

The honest scope statement: core \`Image\` caching is coarse — you don't control cache size or eviction, and Android's behavior has historically been weaker. Production galleries reach for \`expo-image\` (or FastImage historically) for explicit \`cachePolicy\`, priorities, and recycling — same prefetch-next architecture, better cache control.

**Red flag:** prefetching the entire list on mount. On a metered connection that's user-hostile, and the memory/disk cost buys nothing the incremental strategy doesn't.

**Say it:** "I prefetch exactly one step ahead of the user into the native cache and show a bundled placeholder meanwhile — incremental warming, not speculative bulk download."`,
    tests: [
      { it: 'prefetches the next image reactively as the index changes', check: ['Image.prefetch(', 'useEffect('] },
    ],
    hints: ['Image.prefetch(url)', 'defaultSource for placeholder', 'Preload next in useEffect keyed on index'],
  },
  {
    id: 19,
    title: 'Memoize callbacks with useCallback',
    category: 'React Native',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Create a list of items where each item has a "delete" button.
Use useCallback to memoize the delete handler so it doesn't recreate on every render.
Pass the handler as a prop to a child component wrapped in React.memo.`,
    starterCode: `function ListItem({ item, onDelete }) {
  console.log('render', item.id)
  return <Text onPress={() => onDelete(item.id)}>Delete {item.text}</Text>
}

export default function List() {
  const [items, setItems] = useState([{id:1,text:'A'},{id:2,text:'B'}])
  // Your code here
  return null
}`,
    solution: `const MemoListItem = React.memo(ListItem)
const handleDelete = useCallback((id) => {
  setItems(prev => prev.filter(i => i.id !== id))
}, [])
return (
  <View>
    {items.map(item => <MemoListItem key={item.id} item={item} onDelete={handleDelete} />)}
  </View>
)`,
    explanation: `\`useCallback\` is about **identity, not speed**. An inline arrow is a new function object every render; \`React.memo\`'s shallow comparison sees a new \`onDelete\` prop and re-renders every row — the memo becomes pure overhead. \`useCallback\` returns the *same* function reference across renders, which is what lets the memoized rows actually bail out. The function still gets allocated each render (the arrow is an argument to \`useCallback\`); what you're buying is the stable reference handed to children.

The empty deps array is only legal because of the functional update: \`setItems(prev => prev.filter(...))\` reads the freshest state at apply time, so the handler needs nothing from closure scope. Write \`setItems(items.filter(...))\` instead and you're forced to add \`items\` to deps — new identity on every list change, memo defeated, back to square one. Functional updates and \`useCallback([])\` are a paired idiom.

Per-row memoization is the highest-leverage place for this pattern in RN: deleting one item should re-render one component's removal, not every surviving row, and in long lists that difference is measurable JS-thread time.

**Red flag:** \`useCallback\` sprinkled on handlers whose children aren't memoized — stable identity nobody consumes is pure ceremony. The pattern is a pair: stable callback *plus* memoized consumer.

**Say it:** "useCallback buys referential stability, not speed — it only pays when a memoized child consumes it, and functional setState is what lets the deps array stay empty."`,
    tests: [
      { it: 'pairs a useCallback handler with a React.memo child', check: ['useCallback(', 'React.memo('] },
    ],
    hints: ['useCallback(fn, deps)', 'React.memo on child prevents re-render', 'Functional setState keeps deps empty'],
  },
  {
    id: 20,
    title: 'InteractionManager for heavy ops',
    category: 'React Native',
    difficulty: 'hard',
    timeEstimate: '10 min',
    prompt: `Use InteractionManager.runAfterInteractions to defer a heavy computation
(simulated with a loop of 100M iterations) until after navigation transitions complete.`,
    starterCode: `export default function HeavyScreen() {
  const [ready, setReady] = useState(false)
  // Your code here
  return null
}`,
    solution: `useEffect(() => {
  const task = InteractionManager.runAfterInteractions(() => {
    let result = 0
    for (let i = 0; i < 100_000_000; i++) result += i
    setReady(true)
  })
  return () => task.cancel()
}, [])
if (!ready) return <Text>Preparing...</Text>
return <Text>Ready</Text>`,
    explanation: `The failure mode this solves is structural: a JS-driven navigation transition and your mount-time heavy work compete for the **same JS thread**, so the transition stutters. \`InteractionManager.runAfterInteractions\` sequences instead of competing — defer the expensive work, keep the transition's frame budget intact, run the work immediately after.

Mechanically it's a handle registry, not magic: animations register an interaction handle (\`createInteractionHandle\`) and release it when done — the Animated API does this internally. While any handle is open, deferred callbacks queue; when the count hits zero, the queue flushes. That mechanism defines its blind spot, and naming it is the senior move: **UI-thread animations — native-driver Animated and Reanimated worklets — never register JS-side handles**, so \`runAfterInteractions\` can resolve while such a transition is still visibly running. For navigation specifically, React Navigation's transition-end events are the more precise deferral point.

Two production details in the code: \`task.cancel()\` in the effect cleanup stops the deferred work if the user backs out before it runs, and the \`ready\` placeholder means the screen paints *something* immediately — deferral plus skeleton, not a blank frame. And honestly: a 100M-iteration loop will still freeze the JS thread *when it runs*; InteractionManager schedules work, it doesn't parallelize it. Truly heavy compute belongs off-thread.

**Red flag:** claiming InteractionManager "detects when animations finish." It only sees explicitly registered handles.

**Say it:** "runAfterInteractions defers JS-thread work until registered interaction handles release — but native-driver and Reanimated animations are invisible to it, so for navigation I prefer transition-end events."`,
    tests: [
      { it: 'defers work with runAfterInteractions inside useEffect', check: ['InteractionManager.runAfterInteractions(', 'useEffect(', 'cancel()'] },
    ],
    hints: ['InteractionManager.runAfterInteractions(callback)', 'Cancel the task in cleanup', 'Show placeholder while busy'],
  },
  {
    id: 21,
    title: 'Camera roll permission request',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Use expo-image-picker (or react-native PermissionsAndroid) to request camera permission.
If granted, open the camera; if denied, show an alert directing the user to Settings.`,
    starterCode: `export default function CameraButton() {
  // Your code here
  return null
}`,
    solution: `const [permission, requestPermission] = useCameraPermissions()
const handlePress = async () => {
  if (!permission?.granted) {
    const result = await requestPermission()
    if (!result.granted) {
      Alert.alert('Permission needed', 'Open Settings to enable camera access')
      return
    }
  }
  await ImagePicker.launchCameraAsync()
}
return <Button title="Open Camera" onPress={handlePress} />`,
    explanation: `Permissions are a one-shot UX resource: both platforms show the system prompt essentially once, and after a hard denial only the user flipping it in Settings can recover. That's why the architecture is **check → request → handle denial**, triggered *by the feature* — the request fires when the user taps "Open Camera," so the prompt arrives with context and the grant rate is highest. Requesting at app launch burns the one prompt with zero context.

The code walks the full state machine: check \`permission?.granted\` first (never re-prompt someone who already granted), request only when needed, and treat denial as a real state — the Settings alert exists because asking again is literally impossible once blocked. In production that alert's action button calls \`Linking.openSettings()\` to deep-link the user directly there. Underneath the Expo hook, the platforms differ — iOS requires an \`NSCameraUsageDescription\` purpose string in Info.plist (the app is killed without it) and Android runtime permissions have the rationale/permanent-denial dance — but \`useCameraPermissions\` normalizes both behind one status object, which is exactly the kind of platform-divergence-hidden-behind-a-hook worth naming.

**Red flag:** requesting every permission on app launch. It inflates denial rates and signals you've never watched the funnel; ask lazily, at the moment of need, with rationale.

**Say it:** "Permissions are check-then-request at the moment of use — denied-once is a UI state I design for, and blocked means a Settings deep link, never another prompt."`,
    tests: [
      { it: 'checks and requests permission, alerting toward Settings on denial', check: ['requestPermission', 'granted', 'Alert.alert(', 'launchCameraAsync('] },
    ],
    hints: ['expo-image-picker useCameraPermissions hook', 'Async permission request pattern', 'Alert with Settings deep link for denial'],
  },
  {
    id: 22,
    title: 'expo-notifications local notification',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Schedule a local notification using expo-notifications that fires 5 seconds after a button press.
The notification should have a title "Reminder" and body "Time's up!".`,
    starterCode: `export default function NotifyButton() {
  // Your code here
  return null
}`,
    solution: `const scheduleNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Reminder', body: "Time's up!" },
    trigger: { seconds: 5 },
  })
}
return <Button title="Schedule" onPress={scheduleNotification} />`,
    explanation: `The point of \`scheduleNotificationAsync\` is **who fires it**: the notification is registered with the operating system's scheduler, so it fires on time even if the app is backgrounded or killed. That's the fundamental split from anything JS-side — a \`setTimeout\` lives in the JS runtime and dies with it. Local notifications are the OS outliving your process.

The API separates \`content\` (title, body, data payload, sound) from \`trigger\` (when), and the trigger vocabulary is worth knowing beyond \`{ seconds: 5 }\`: calendar triggers for "9am daily," date triggers for absolute times, and \`null\` to present immediately. Two production prerequisites the challenge elides: notification *permission* must be requested first (iOS always prompts; Android 13+ made \`POST_NOTIFICATIONS\` a runtime permission), and by default iOS won't show a banner while your app is **foregrounded** — you opt in with \`setNotificationHandler\`. Forgetting the foreground handler is the classic "it works when the app is closed but not when it's open" ticket.

Local also draws the boundary with *push*: no server, no device token, no APNs/FCM — the app schedules against its own OS. Reminders and timers are local; anything triggered by remote state is push.

**Red flag:** simulating notifications with \`setTimeout\` + an in-app banner, or forgetting that the OS — not your JS — owns the delivery. The interviewer is checking you know where the process boundary sits.

**Say it:** "Local notifications hand delivery to the OS scheduler, so they survive backgrounding and kill — my job is permission first, content plus trigger, and a foreground handler so iOS shows them while the app is open."`,
    tests: [
      { it: 'schedules through the OS with content and a time trigger', check: ['scheduleNotificationAsync(', 'content', 'trigger'] },
    ],
    hints: ['Notifications.scheduleNotificationAsync', 'content + trigger config', 'Request permissions first'],
  },
  {
    id: 23,
    title: 'Native module bridge (Platform.select)',
    category: 'React Native',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Use Platform.select to render a different component on iOS vs Android.
On iOS show "iOS Button", on Android show "Android Button", default fallback to "Web Button".`,
    starterCode: `export default function PlatformButton() {
  // Your code here
  return null
}`,
    solution: `const buttonText = Platform.select({
  ios: 'iOS Button',
  android: 'Android Button',
  default: 'Web Button',
})
return <Button title={buttonText} onPress={() => {}} />`,
    explanation: `\`Platform.select\` is about keeping platform divergence **declarative and in one place**. The naive alternative — \`Platform.OS === 'ios' ? ... : ...\` ternaries scattered through render code — works, but each one is an ad-hoc branch a reviewer must re-derive, and chains break the moment web or a third platform appears. \`select\` reads as a table: every platform's value visible at a glance, \`default\` as the explicit catch-all for platforms you didn't enumerate (web, windows). It resolves once at execution, returns the matching value, and works for anything — strings, style objects, even components.

Knowing the escalation ladder is the senior part, because \`Platform.select\` is only the *smallest* tool:

- **A value differs** → \`Platform.select\` (often inline in a StyleSheet, e.g. iOS shadow vs Android elevation).
- **A whole implementation differs** → platform file extensions: \`Button.ios.tsx\` / \`Button.android.tsx\`, and Metro resolves the right file at **bundle time** — the other platform's code never ships in the bundle, unlike \`select\`, which carries all branches at runtime.
- **The capability itself differs** → a native module or library boundary.

**Red flag:** sprinkling \`Platform.OS\` ternaries through every component. One or two are fine; a codebase full of them means divergence was never given a home — name file extensions as the structural fix.

**Say it:** "Platform.select keeps small divergences declarative with an explicit default; when a whole component diverges I switch to .ios/.android files so Metro resolves it at bundle time instead of branching at runtime."`,
    tests: [
      { it: 'selects per-platform values with a default fallback', check: ['Platform.select(', 'ios:', 'android:', 'default:'] },
    ],
    hints: ['Platform.select({ ios, android, default })', '.ios.tsx/.android.tsx for whole-file divergence'],
  },
  {
    id: 24,
    title: 'Linking.openURL deep link',
    category: 'React Native',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Use the Linking API to open a URL "https://example.com" in the device browser.
Check if the URL can be opened first, and if not, log an error.`,
    starterCode: `export default function OpenLink() {
  // Your code here
  return null
}`,
    solution: `const handlePress = async () => {
  const supported = await Linking.canOpenURL('https://example.com')
  if (supported) await Linking.openURL('https://example.com')
  else console.error('Cannot open URL')
}
return <Button title="Open Link" onPress={handlePress} />`,
    explanation: `\`Linking\` is the outbound half of deep linking: it hands a URL to the operating system, which routes it to whatever app claims the scheme — browser for \`https\`, Mail for \`mailto:\`, the phone app for \`tel:\`, another app entirely for custom schemes like \`spotify:\`. The check-before-open pattern exists because that routing can fail: no handler for the scheme means \`openURL\` rejects, and \`canOpenURL\` lets you degrade gracefully — hide the button, show a fallback — instead of throwing at tap time.

The trap that makes this an interview question rather than a docs recital: **\`canOpenURL\` lies for custom schemes unless you declare them**. Since iOS 9, querying another app's scheme requires listing it under \`LSApplicationQueriesSchemes\` in Info.plist (Android 11 added similar package-visibility rules); undeclared, \`canOpenURL\` returns \`false\` even when the app is installed. Plain \`https\` is always queryable, which is why this example works unconditioned — but "why does canOpenURL return false for whatsapp://" is the production bug behind the question. Both calls are async and can reject, so real code wraps them in try/catch; and the companion API worth naming is \`Linking.openSettings()\`, the sanctioned deep link into your app's own settings page for permission-blocked flows.

**Red flag:** treating a \`canOpenURL\` \`false\` as "app not installed" without mentioning the Info.plist declaration — that's the exact misdiagnosis the platform docs warn about.

**Say it:** "Linking delegates URL handling to the OS — I check canOpenURL first for graceful fallback, and I know custom schemes must be declared in LSApplicationQueriesSchemes or the check returns false even when the app exists."`,
    tests: [
      { it: 'checks canOpenURL before opening, in an async handler', check: ['Linking.canOpenURL(', 'Linking.openURL(', 'await'] },
    ],
    hints: ['Linking.canOpenURL to check', 'Linking.openURL to navigate', 'Custom schemes need LSApplicationQueriesSchemes on iOS'],
  },
  {
    id: 25,
    title: 'Accelerometer sensor subscription',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Subscribe to the accelerometer using expo-sensors and display the x, y, z values in real time.
Clean up the subscription on unmount. Only show values rounded to 2 decimal places.`,
    starterCode: `export default function AccelerometerDisplay() {
  // Your code here
  return null
}`,
    solution: `const [data, setData] = useState({ x: 0, y: 0, z: 0 })
useEffect(() => {
  const sub = Accelerometer.addListener(({ x, y, z }) => {
    setData({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100, z: Math.round(z * 100) / 100 })
  })
  Accelerometer.setUpdateInterval(100)
  return () => sub.remove()
}, [])
return <Text>x: {data.x} y: {data.y} z: {data.z}</Text>`,
    explanation: `A sensor subscription is a firehose wired to your render cycle, and this challenge is really about **flow control on the JS thread**. Every listener callback is an event crossing from native to JS, and every \`setData\` is a re-render. Left at hardware rates that's a render every few milliseconds — so \`setUpdateInterval(100)\` is the first decision, throttling at the *native* side to 10Hz so the JS thread never sees events it would only waste. Pick the rate the UI needs, not the rate the hardware offers; a shake detector might want 50ms, a level indicator is fine at 200ms.

The cleanup is non-negotiable and this is the pattern for **every** native event source (NetInfo, keyboard, app-state, location): \`addListener\` returns a subscription object, and \`sub.remove()\` in the effect cleanup severs it on unmount. Skip it and the native side keeps sampling and emitting — battery drain the user notices, plus \`setState\` on an unmounted component. On mobile, a leaked subscription isn't just a memory bug; it's a hardware sensor left running.

The rounding is honest about its role: it's display formatting, and it also stabilizes the state values so near-identical readings don't churn renders for invisible changes.

**Red flag:** subscribing without \`remove()\` in cleanup, or leaving the update interval at its default and wondering why the screen janks — both say "I haven't shipped sensor code."

**Say it:** "Sensor work is flow control: throttle at the native side with setUpdateInterval so the JS thread only sees events it needs, and treat the subscription's remove() in effect cleanup as non-negotiable — it's live hardware, not just memory."`,
    tests: [
      { it: 'subscribes with a throttled interval and removes the subscription in cleanup', check: ['Accelerometer.addListener(', 'setUpdateInterval(', '.remove()'] },
    ],
    hints: ['Accelerometer.addListener', 'setUpdateInterval', 'sub.remove() in cleanup'],
  },
  {
    id: 26,
    title: 'Flexbox layout: centered card',
    category: 'React Native',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Create a card that is centered vertically and horizontally on screen.
The card should have a title, subtitle, and an action button at the bottom.`,
    starterCode: `export default function CenteredCard() {
  // Your code here
  return null
}`,
    solution: `return (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
    <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 12, shadowOpacity: 0.1, width: 300 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Card Title</Text>
      <Text style={{ color: '#666', marginTop: 4 }}>Card subtitle here</Text>
      <View style={{ marginTop: 16 }}><Button title="Action" onPress={() => {}} /></View>
    </View>
  </View>
)`,
    explanation: `Centering is the layout question because it forces you to show you know RN's flexbox is **Yoga, not CSS** — same vocabulary, different defaults, and the defaults are where cross-platform layout bugs are born. Three divergences matter: \`flexDirection\` defaults to \`column\` (web: \`row\`), every view is \`position: relative\` and flex by default, and there's no \`display: block\` fallback — everything is flexbox.

Decode the container line precisely. \`flex: 1\` expands to \`flexGrow: 1, flexShrink: 1, flexBasis: 0\` — the view ignores its content size and fills its parent's available space. Without it, the container hugs its content and "centered" quietly means "centered inside a card-sized box at the top of the screen" — the most common centering bug. Then, because the main axis is column by default, \`justifyContent: 'center'\` centers **vertically** (main axis) and \`alignItems: 'center'\` centers **horizontally** (cross axis) — the exact mirror of untweaked web flexbox, and saying which axis is which, unprompted, is the fluency signal.

The card itself needs no positioning: it's sized by \`width\` and padding, placed entirely by its parent — parent controls placement, child controls its own box.

**Red flag:** "it's the same flexbox as the web." The interviewer is checking whether the column-default has ever bitten you; name it before they ask.

**Say it:** "RN flexbox is Yoga with column as the default main axis — so justifyContent centers vertically, alignItems horizontally, and flex: 1 means grow-shrink-basis-zero: fill the parent regardless of content."`,
    tests: [
      { it: 'fills the screen and centers on both axes', check: ['flex: 1', "justifyContent: 'center'", "alignItems: 'center'"] },
    ],
    hints: ['flex:1 to fill parent', 'justifyContent + alignItems for centering', 'Nested View for card'],
  },
  {
    id: 27,
    title: 'Dynamic Styles with useWindowDimensions',
    category: 'React Native',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Use useWindowDimensions to render a responsive layout.
Show "Landscape" when width > height, otherwise show "Portrait".`,
    starterCode: `export default function OrientationDisplay() {
  // Your code here
  return null
}`,
    solution: `const { width, height } = useWindowDimensions()
const isLandscape = width > height
return <Text style={{ fontSize: 24 }}>{isLandscape ? 'Landscape' : 'Portrait'}</Text>`,
    explanation: `The hook exists because screen size is **state, not a constant** — rotation, foldables, split-screen multitasking, and resizable windows all change it mid-session. \`useWindowDimensions\` subscribes the component to those changes: rotate the device and the component re-renders with fresh numbers, no listener plumbing. Its predecessor, \`Dimensions.get('window')\`, is a one-time read — correct at the moment you call it, silently stale afterward.

That distinction produces the classic bug this question fishes for: \`Dimensions.get('window').width\` inside \`StyleSheet.create\` at module scope. It's evaluated **once, at import time** — rotate, and the layout is permanently wrong until app restart. It looks responsive and isn't, which is what makes it dangerous in review. Anything derived from dimensions must be computed in render, where the hook keeps it live.

Deriving orientation as \`width > height\` rather than from a separate orientation API is the right instinct — one source of truth, no second subscription to keep in sync. Also worth a sentence: \`window\` excludes system decorations on Android (vs \`screen\`), and dimension-based breakpoints compose with \`useSafeAreaInsets\` for real device-adaptive layout.

**Red flag:** dimensions captured in module scope or \`StyleSheet.create\`. If layout math lives outside render, rotation breaks it — the interviewer wants to hear "computed at render time, subscribed via the hook."

**Say it:** "Screen size is state — useWindowDimensions subscribes me to it, whereas Dimensions.get is a stale one-time read, so any dimension math belongs in render, never in module-scope StyleSheets."`,
    tests: [
      { it: 'derives orientation from live window dimensions', check: ['useWindowDimensions(', 'Landscape', 'Portrait'] },
    ],
    hints: ['useWindowDimensions returns { width, height }', 'Compare width > height for landscape'],
  },
  {
    id: 28,
    title: 'SafeAreaView for notched devices',
    category: 'React Native',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Use SafeAreaView to render content that respects the safe area insets on notched devices.
Include a header bar and scrollable content below it.`,
    starterCode: `export default function SafeAreaScreen() {
  // Your code here
  return null
}`,
    solution: `return (
  <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
    <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Header</Text>
    </View>
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text>Scrollable content here</Text>
    </ScrollView>
  </SafeAreaView>
)`,
    explanation: `Safe areas exist because modern screens aren't rectangles you can draw on edge to edge: notches, Dynamic Islands, home indicators, and Android display cutouts all overlap the viewport, and content behind them is unreadable or untappable. \`SafeAreaView\` pads its children into the unobstructed region.

The trap that makes this an interview question: **core \`SafeAreaView\` from react-native is iOS-only** — on Android it renders as a plain \`View\`, so shipping it as your cross-platform answer puts Android content under the status bar or cutout. The production answer is \`react-native-safe-area-context\`: wrap the app in \`SafeAreaProvider\` and use either its \`SafeAreaView\` or, better, \`useSafeAreaInsets()\`. Insets-as-numbers beat a wrapper component because they **compose** — add them to a tab bar height, feed them into an animated header — and the library delivers them synchronously on first render via \`initialWindowMetrics\`, avoiding the flicker core SafeAreaView can show during navigation transitions and inside modals.

The layout structure here is the other half: the header sits inside the safe area at fixed height; the \`ScrollView\` takes remaining space, with padding on \`contentContainerStyle\` (the content), not the scroller itself. And apply insets per-edge at screen level — top on headers, bottom on footers — not blanket padding, or scrollable content loses its full-bleed look. That matters more as Android pushes apps toward edge-to-edge rendering.

**Red flag:** presenting core \`SafeAreaView\` as the cross-platform solution. Name the safe-area-context library unprompted.

**Say it:** "Core SafeAreaView is a no-op on Android — I standardize on safe-area-context's provider plus useSafeAreaInsets, because composable inset numbers work per-edge and cover Android cutouts."`,
    tests: [
      { it: 'wraps a header and scrollable content in a safe area', check: ['SafeAreaView', 'ScrollView', 'flex: 1'] },
    ],
    hints: ['SafeAreaView from react-native-safe-area-context in production', 'useSafeAreaInsets for composable insets'],
  },
  {
    id: 29,
    title: 'Shadow and elevation styles',
    category: 'React Native',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Create a View with a shadow on iOS (shadowColor, shadowOffset, shadowOpacity, shadowRadius)
and elevation on Android. The view should look like a raised card.`,
    starterCode: `export default function ShadowCard() {
  // Your code here
  return null
}`,
    solution: `return (
  <View style={{
    width: 200, height: 200, backgroundColor: 'white', borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 8,
    elevation: 5,
  }}>
    <Text>Shadow Card</Text>
  </View>
)`,
    explanation: `Shadows are the clearest daily reminder that React Native styles compile to **two different native rendering systems**, not CSS. iOS exposes Core Animation's layer shadow — four orthogonal dials (\`shadowColor\`, \`shadowOffset\`, \`shadowOpacity\`, \`shadowRadius\`) you compose freely. Android exposes Material Design's \`elevation\` — one number from which the system derives the shadow's size, softness, and direction against a simulated light source; you don't get to art-direct it (color tinting arrived only in API 28+). Neither property set does anything on the other platform, so a raised card needs **both**, side by side, exactly as here — or a \`Platform.select\` when the two designs should differ.

The mechanics that bite in production: on iOS, shadows are computed from the view's shape, so the view needs an opaque \`backgroundColor\` — a transparent view casts nothing, and without a solid fill iOS may fall back to expensive per-pixel shadow paths. On Android, \`elevation\` also controls **z-ordering** — a raised card draws over its siblings, which surprises people using it purely decoratively; and \`overflow: 'hidden'\` (often added for rounded corners) clips the shadow entirely. Since RN 0.76, \`boxShadow\` exists as a unified cross-platform property on the New Architecture — worth naming as the direction of travel, with the dual-API answer still the compatibility baseline.

**Red flag:** shipping only the iOS shadow props and calling it done — flat cards on Android is the exact bug this question screens for.

**Say it:** "iOS gives me four compositional shadow dials, Android gives me one Material elevation value that also affects z-order — I set both, keep an opaque background for iOS, and know boxShadow is unifying this on the New Architecture."`,
    tests: [
      { it: 'declares both the iOS shadow properties and Android elevation', check: ['shadowColor', 'shadowOffset', 'shadowOpacity', 'shadowRadius', 'elevation'] },
    ],
    hints: ['iOS: shadowColor/Offset/Opacity/Radius', 'Android: elevation only', 'Opaque backgroundColor for iOS shadows'],
  },
  {
    id: 30,
    title: 'StyleSheet.create pattern',
    category: 'React Native',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Refactor inline styles into StyleSheet.create for a login screen with Email input,
Password input, and a Login button.`,
    starterCode: `export default function LoginScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <TextInput style={{ borderWidth: 1, padding: 12, marginBottom: 12 }} placeholder="Email" />
      <TextInput style={{ borderWidth: 1, padding: 12, marginBottom: 24 }} placeholder="Password" secureTextEntry />
      <Button title="Login" onPress={() => {}} />
    </View>
  )
}`,
    solution: `const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  input: { borderWidth: 1, padding: 12, marginBottom: 12 },
  lastInput: { borderWidth: 1, padding: 12, marginBottom: 24 },
})
export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Email" />
      <TextInput style={styles.lastInput} placeholder="Password" secureTextEntry />
      <Button title="Login" onPress={() => {}} />
    </View>
  )
}`,
    explanation: `\`StyleSheet.create\` is a create-once contract: the style objects are built a single time at module load, validated in development (a typo like \`paddin\` throws immediately instead of silently doing nothing), and referenced by identity thereafter. An inline object literal, by contrast, is allocated fresh on **every render** — and because it's a new reference each time, it defeats \`React.memo\` and any shallow prop comparison on the component receiving it. That's the precise cost: not "inline styles are slow to render," but *new object identity per render breaks memoization and adds allocation churn*. Getting that mechanism right is what the question tests.

The refactor also changes the code's semantics for humans: \`styles.container\` and \`styles.input\` name the *role* of each style, and repeated patterns become visible — here, \`input\` and \`lastInput\` differing only in \`marginBottom\` is a smell you'd fix by composing: \`style={[styles.input, styles.lastSpacing]}\` — the array syntax merges left-to-right and is the idiomatic way to layer a base style with variants or dynamic values. Truly dynamic styles (a color computed from state) stay inline or memoized, composed on top of the static sheet; the split is static-in-sheet, dynamic-in-render.

**Red flag:** justifying the refactor with vague "it's faster because native" claims. The defensible answer is: created once vs per-render allocation, dev-time validation, and stable references that keep memoized children from re-rendering.

**Say it:** "StyleSheet.create builds and validates styles once and gives me stable references — inline objects are per-render allocations with fresh identity, which is exactly what breaks shallow comparison."`,
    tests: [
      { it: 'moves styles into StyleSheet.create and references them by name', check: ['StyleSheet.create(', 'styles.'] },
    ],
    hints: ['StyleSheet.create validates and creates once', 'Refer by styles.key', 'Array syntax [base, variant] composes styles'],
  },
  {
    id: 31,
    title: 'AsyncStorage CRUD',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Implement a simple note-taking hook using AsyncStorage.
Supports: save a note (by key), load a note (by key), delete a note (by key), list all keys.`,
    starterCode: `export function useNotes() {
  // Your code here
  return { saveNote, loadNote, deleteNote, listKeys }
}`,
    solution: `function useNotes() {
  const saveNote = async (key, value) => {
    await AsyncStorage.setItem(key, value)
  }
  const loadNote = async (key) => {
    return AsyncStorage.getItem(key)
  }
  const deleteNote = async (key) => {
    await AsyncStorage.removeItem(key)
  }
  const listKeys = async () => {
    return AsyncStorage.getAllKeys()
  }
  return { saveNote, loadNote, deleteNote, listKeys }
}`,
    explanation: `AsyncStorage is React Native's plain key-value disk: promise-based, **strings only**, persisted in the app sandbox (a SQLite database on Android, serialized files on iOS). The community package \`@react-native-async-storage/async-storage\` is the living implementation — the core module was deprecated and extracted years ago, and naming the community package is itself a currency signal.

The API surface maps one-to-one onto the hook: \`setItem\`/\`getItem\`/\`removeItem\`/\`getAllKeys\`, all async because disk I/O never belongs on the JS thread synchronously. The contracts worth stating: everything is a string, so structured data is \`JSON.stringify\` on write and \`JSON.parse\` on read — with the parse wrapped in try/catch, because a corrupted or legacy-format entry otherwise crashes the feature that reads it. \`getItem\` returns \`null\` for missing keys (not an exception). For multi-key screens, \`multiGet\`/\`multiSet\` batch the native round-trips. And there's no TTL — stale-cache invalidation is your job.

The boundary a senior always draws unprompted: AsyncStorage is **plaintext**. The OS sandbox is the only barrier, and root, jailbreak, or backup extraction defeats it. Notes, preferences, feature flags, onboarding booleans — yes. Tokens, PII, anything you'd mind leaking — Keychain/Keystore-backed secure storage instead. If reads become hot-path (per-render), the modern escape hatch is MMKV's synchronous JSI storage.

**Red flag:** "I store the auth token in AsyncStorage — it's inside the app sandbox." Sensitivity decides the storage tier, not convenience.

**Say it:** "AsyncStorage is an async, string-only, plaintext key-value store — right for non-sensitive state with JSON serialization at the edges, and anything secret goes to Keychain or Keystore instead."`,
    tests: [
      { it: 'returns the four CRUD functions', run: 'Object.keys(useNotes()).length', expected: 4 },
      { it: 'exposes the expected function names', run: 'Object.keys(useNotes()).sort()', expected: ['deleteNote', 'listKeys', 'loadNote', 'saveNote'] },
      { it: 'every member is a function', run: 'Object.values(useNotes()).every(f => typeof f === "function")', expected: true },
      { it: 'uses the four AsyncStorage primitives', check: ['AsyncStorage.setItem(', 'AsyncStorage.getItem(', 'AsyncStorage.removeItem(', 'AsyncStorage.getAllKeys('] },
    ],
    hints: ['AsyncStorage.setItem/getItem/removeItem/getAllKeys', 'All return Promises', 'Strings only — JSON.stringify structured data'],
  },
  {
    id: 32,
    title: 'SQLite database setup (expo-sqlite)',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Initialize an expo-sqlite database with a "users" table (id, name, email).
Write functions to: create the table, insert a user, and query all users.`,
    starterCode: `export function useDatabase() {
  // Your code here
  return { init, insertUser, getUsers }
}`,
    solution: `function useDatabase() {
  const db = SQLite.openDatabaseSync('app.db')
  const init = () => {
    db.execSync(\`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT)\`)
  }
  const insertUser = (name, email) => {
    db.runSync('INSERT INTO users (name, email) VALUES (?, ?)', [name, email])
  }
  const getUsers = () => {
    return db.getAllSync('SELECT * FROM users')
  }
  return { init, insertUser, getUsers }
}`,
    explanation: `SQLite enters the conversation when data stops being a blob and starts being a **model**: the moment you need "notes containing X, sorted by date, joined to tags," AsyncStorage forces you to load everything and filter in JS, while SQLite indexes, filters, and joins on disk. That's the architectural line — key-value for small unstructured state, relational for anything you query.

The modern expo-sqlite API is worth naming precisely: the synchronous methods (\`openDatabaseSync\`, \`execSync\`, \`runSync\`, \`getAllSync\`) exist because the driver rides JSI — direct native calls, no bridge serialization — replacing the old callback-pyramid \`transaction\` API. Synchronous is a capability to spend deliberately: fine for a small query, wrong for bulk work on the JS thread — the async twins (\`runAsync\`, \`getAllAsync\`) exist for exactly that reason. The method split also carries meaning: \`execSync\` for DDL you fully control, \`runSync\` for writes, \`getAllSync\` returning rows as plain objects for reads.

Two disciplines in the code that interviewers check: \`CREATE TABLE IF NOT EXISTS\` makes \`init\` idempotent — safe on every launch, and the seed of a migrations story (\`PRAGMA user_version\`) as the schema evolves. And the \`?\` placeholders are **not optional style**: parameterized queries are the SQL-injection boundary, and they let SQLite cache the statement plan.

**Red flag:** string-concatenating values into SQL. Injection plus broken escaping on the first apostrophe in a name — instant fail in any review.

**Say it:** "I reach for SQLite when data becomes queryable structure, use the JSI-backed sync API for cheap reads and async for bulk work, and parameterize every value — concatenated SQL is an injection, not a query."`,
    tests: [
      { it: 'defines a useDatabase factory', run: 'typeof useDatabase', expected: 'function' },
      { it: 'creates the table idempotently and parameterizes the insert', check: ['openDatabaseSync(', 'CREATE TABLE IF NOT EXISTS', 'runSync(', 'getAllSync(', 'VALUES (?, ?)'] },
    ],
    hints: ['openDatabaseSync', 'execSync for DDL', 'runSync with ? placeholders for DML', 'getAllSync for queries'],
  },
  {
    id: 33,
    title: 'File system read/write (expo-file-system)',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Use expo-file-system to write a text file to the document directory,
then read it back and display the contents.`,
    starterCode: `export default function FileExample() {
  // Your code here
  return null
}`,
    solution: `const [content, setContent] = useState('')
useEffect(() => {
  const run = async () => {
    const uri = FileSystem.documentDirectory + 'hello.txt'
    await FileSystem.writeAsStringAsync(uri, 'Hello, FileSystem!')
    const text = await FileSystem.readAsStringAsync(uri)
    setContent(text)
  }
  run()
}, [])
return <Text>{content}</Text>`,
    explanation: `The file system is the storage tier for things that are *files* — images, PDFs, exported data, downloaded media — where AsyncStorage's string KV and SQLite's rows are the wrong shape. The API here is simple; the knowledge being tested is the **directory contract**.

\`FileSystem.documentDirectory\` is the app's persistent, sandboxed home: files survive restarts and OS cleanup, and it's included in device backups. Its sibling \`cacheDirectory\` is the opposite deal — the OS may evict it under storage pressure, which makes it the right home for re-downloadable content and the wrong home for anything the user created. Choosing between them *is* the design decision; everything else is plumbing. The critical discipline: these are URIs you get **at runtime**, and the sandbox's absolute path can change between installs and app updates (notoriously on iOS) — so you persist relative filenames and re-derive the full URI from \`documentDirectory\` on every launch, never store absolute paths.

Pattern notes on the code: an async function declared-then-called inside \`useEffect\` (the effect callback itself can't be async — it would return a promise where React expects a cleanup); string reads/writes default to UTF-8, with base64 encoding as the option for binary payloads. Real code adds try/catch — disk-full and missing-file are ordinary runtime events, not exceptional ones.

**Red flag:** persisting an absolute file path and reading it after an app update — the container moved and your "saved" file is gone. Store names, derive URIs.

**Say it:** "documentDirectory is persistent and backed up, cacheDirectory is evictable — and since the sandbox path can change across updates, I persist relative filenames and rebuild URIs at runtime."`,
    tests: [
      { it: 'writes then reads a file under the document directory', check: ['FileSystem.documentDirectory', 'writeAsStringAsync(', 'readAsStringAsync('] },
    ],
    hints: ['FileSystem.documentDirectory', 'writeAsStringAsync / readAsStringAsync', 'Persist filenames, not absolute paths'],
  },
  {
    id: 34,
    title: 'NetInfo connectivity check',
    category: 'React Native',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Use @react-native-community/netinfo to check if the device is connected to the internet.
Display "Online" or "Offline" based on connectivity, and listen for changes.`,
    starterCode: `export default function ConnectivityStatus() {
  // Your code here
  return null
}`,
    solution: `const [connected, setConnected] = useState(true)
useEffect(() => {
  const unsub = NetInfo.addEventListener(state => setConnected(state.isConnected))
  return () => unsub()
}, [])
return <Text>{connected ? 'Online' : 'Offline'}</Text>`,
    explanation: `On mobile, connectivity is a **stream, not a status**: users walk out of Wi-Fi, ride elevators, toggle airplane mode — so the correct architecture is an event subscription that keeps state current, exactly what \`NetInfo.addEventListener\` provides. It fires immediately with the current state and then on every change; the returned function is the unsubscribe, and calling it in the effect cleanup is the same non-negotiable teardown as any native event source.

The distinction that separates senior answers: \`isConnected\` means the device has a network transport (Wi-Fi association, cellular data); \`isInternetReachable\` means the internet actually answers. A captive hotel portal or a dead corporate proxy is connected-but-unreachable — the exact state where naive "online" badges lie. Which flag you gate on is a product decision, and knowing both exist is the point. The \`state\` object also carries \`type\` (wifi/cellular) and details like metered connections — the input for "don't auto-download on cellular" features.

The deeper principle: connectivity state is a **UX hint, not a guard**. Use it to show banners, queue mutations, and decide retry timing — but never as a substitute for handling request failure, because the status can flip between your check and your fetch. The request's own error path is the source of truth; NetInfo is how you explain it to the user. (This is also the signal React Query consumes for refetch-on-reconnect.)

**Red flag:** \`if (isConnected) fetch(...)\` with no failure handling — the check is instantly stale. Requests fail; NetInfo just tells you why.

**Say it:** "Connectivity is an event stream I subscribe to, isConnected is transport while isInternetReachable is truth, and I treat both as UX hints — the request's failure path is still the real guard."`,
    tests: [
      { it: 'subscribes to connectivity changes and unsubscribes in cleanup', check: ['NetInfo.addEventListener(', 'isConnected', 'useEffect('] },
    ],
    hints: ['NetInfo.addEventListener returns unsubscribe', 'state.isConnected vs state.isInternetReachable', 'Cleanup on unmount'],
  },
  {
    id: 35,
    title: 'Clipboard copy/paste',
    category: 'React Native',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Use expo-clipboard to copy a text string to the clipboard,
then paste it back and display the pasted text.`,
    starterCode: `export default function ClipboardExample() {
  // Your code here
  return null
}`,
    solution: `const [pasted, setPasted] = useState('')
const handleCopy = async () => {
  await Clipboard.setStringAsync('Hello from clipboard!')
  const text = await Clipboard.getStringAsync()
  setPasted(text)
}
return (
  <View>
    <Button title="Copy & Paste" onPress={handleCopy} />
    <Text>{pasted}</Text>
  </View>
)`,
    explanation: `The clipboard looks like the most trivial API in the SDK, and that's exactly why it's a good probe: the correct answer is mostly about what the clipboard **is** — a system-wide, OS-owned buffer shared by every app on the device — and what follows from that.

Mechanics first: \`expo-clipboard\` is the maintained module (the core \`Clipboard\` was deprecated and extracted from react-native, same story as AsyncStorage — knowing the extraction pattern is a currency signal). Both operations are async because they cross to a native module; \`getStringAsync\` resolves to the empty string when there's nothing to paste, and the modern API also handles images and URLs, not just text.

The consequences of "system-wide buffer" are the senior content. Writing: anything you put there outlives your app and is readable by the next app the user opens — copying a password or token is publishing it to the least trustworthy app on the device, and OS countermeasures (iOS's paste notification banner, Android 13's clipboard preview and auto-expiry) exist precisely because apps abused this. So sensitive copies should be deliberate, user-initiated, and ideally cleared after a timeout. Reading: don't poll the clipboard on launch to "helpfully" detect content — iOS visibly flags every read, and users experience surprise reads as spying. Copy-on-tap with a "Copied!" confirmation is the pattern; silent reads and writes are the anti-pattern.

**Red flag:** auto-reading the clipboard on app start, or parking secrets in it indefinitely — both are the behaviors the OS vendors literally built warning UI to shame.

**Say it:** "The clipboard is a system-wide buffer every app can read, so I write to it only on explicit user action, treat secrets in it as leaked, and never read it without the user asking me to."`,
    tests: [
      { it: 'copies and pastes through the async clipboard API', check: ['Clipboard.setStringAsync(', 'Clipboard.getStringAsync(', 'await'] },
    ],
    hints: ['Clipboard.setStringAsync / getStringAsync', 'All methods are async', 'expo-clipboard replaced the deprecated core module'],
  },
  {
    id: 36,
    title: 'Animated.Value fade-in',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Create a fade-in animation using Animated API. A View should fade from opacity 0 to 1
over 500ms when the component mounts.`,
    starterCode: `export default function FadeInView() {
  // Your code here
  return null
}`,
    solution: `const opacity = useRef(new Animated.Value(0)).current
useEffect(() => {
  Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }).start()
}, [])
return <Animated.View style={{ opacity, width: 200, height: 200, backgroundColor: 'blue' }} />`,
    explanation: `The Animated API's core idea is animating **outside the render cycle**: \`Animated.Value\` is a mutable container that \`Animated.View\` writes to the native view directly — sixty opacity updates without a single React re-render. Re-rendering per frame through \`setState\` would be the naive alternative, and it's unshippable.

\`useRef(new Animated.Value(0)).current\` is deliberate: the value must survive re-renders. A plain \`const opacity = new Animated.Value(0)\` in the component body creates a *fresh* value on every render, visibly restarting the animation — the classic bug this pattern prevents.

\`useNativeDriver: true\` is the line the interview is about, and precision matters: it does **not** make the animation faster. Without it, every frame is computed in JS and sent across to native — so any JS-thread work (a render, a JSON parse, a navigation transition) starves the ticks and frames drop. With it, the full animation description — curve, duration, target — is serialized to the native side **once** at \`.start()\`, and the UI thread drives every frame independently. The win is decoupling: a blocked JS thread can no longer drop your frames. The price of that decoupling: the native driver only supports non-layout props — \`transform\` and \`opacity\`. Animating \`width\` or \`left\` natively throws at runtime; those need LayoutAnimation or Reanimated.

**Red flag:** "useNativeDriver makes animations faster." Per-frame cost is the same — it decouples the animation from the JS thread. Saying "faster" instead of "decoupled" is the junior tell.

**Say it:** "useNativeDriver serializes the animation to the UI thread once so JS-thread stalls can't drop frames — I default to it and accept its transform-and-opacity limit."`,
    tests: [
      { it: 'persists an Animated.Value in a ref and drives it natively', check: ['Animated.Value(0)', 'useRef', 'Animated.timing(', 'useNativeDriver: true', '.start()'] },
    ],
    hints: ['Animated.Value initial value 0', 'useRef so the value survives re-renders', 'useNativeDriver: true decouples from the JS thread'],
  },
  {
    id: 37,
    title: 'Animated event with PanResponder',
    category: 'React Native',
    difficulty: 'hard',
    timeEstimate: '15 min',
    prompt: `Create a draggable View using PanResponder and Animated.Value for position.
Track both x and y translation as the user drags their finger.`,
    starterCode: `export default function DraggableBox() {
  // Your code here
  return null
}`,
    solution: `const pan = useRef(new Animated.ValueXY()).current
const panResponder = useRef(PanResponder.create({
  onMoveShouldSetPanResponder: () => true,
  onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
  onPanResponderRelease: () => {
    pan.extractOffset()
  },
})).current
return <Animated.View style={[pan.getLayout(), { width: 80, height: 80, backgroundColor: 'red' }]} {...panResponder.panHandlers} />`,
    explanation: `This challenge wires two systems together. PanResponder is the ergonomic wrapper over RN's **gesture responder negotiation** — the arbitration protocol deciding which view owns a touch. \`onMoveShouldSetPanResponder: () => true\` claims the gesture once the finger moves; the negotiation re-runs on every move, which is how a wrapping ScrollView can *steal* your touch mid-drag. That's why production responders also implement \`onPanResponderTerminate\` — handling only release ships gestures that freeze when ownership is taken away.

The Animated side is a pipeline, not a handler: \`Animated.event([null, { dx: pan.x, dy: pan.y }])\` declaratively maps the gesture's per-move deltas into the \`ValueXY\` — no per-event JS callback body, no setState. \`extractOffset()\` on release is the piece candidates fumble: it folds the accumulated value into the offset and zeroes the value, so the *next* gesture's deltas (which always start at 0) continue from where the box rests instead of snapping back to origin.

\`useNativeDriver: false\` is forced twice over — \`getLayout()\` animates \`left\`/\`top\`, layout props the native driver can't drive, and PanResponder events are delivered on the JS thread anyway. That's the honest limitation to volunteer: recognition and tracking both stall when JS is busy, which is precisely why production gesture code is \`react-native-gesture-handler\` + Reanimated — native-thread recognition, worklet-driven tracking. PanResponder remains the right mental model and the zero-dependency fallback.

**Red flag:** no \`extractOffset\`/offset handling (box teleports to origin on the second drag) or omitting termination handling — both are "wrote it, never shipped it" tells.

**Say it:** "PanResponder is JS-thread gesture arbitration — Animated.event maps deltas into a ValueXY and extractOffset banks position between gestures — and when recognition must survive a busy JS thread, I move to gesture-handler with Reanimated."`,
    tests: [
      { it: 'maps gesture deltas into an Animated.ValueXY and banks offsets on release', check: ['Animated.ValueXY(', 'PanResponder.create(', 'Animated.event(', 'extractOffset', 'panHandlers'] },
    ],
    hints: ['Animated.ValueXY for 2D position', 'Animated.event maps gesture dx/dy', 'extractOffset on release so the next drag continues from rest'],
  },
  {
    id: 38,
    title: 'LayoutAnimation for list insert',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Use LayoutAnimation to animate when a new item is added to the beginning of a list.
The existing items should smoothly shift down to make room.`,
    starterCode: `export default function AnimatedList() {
  const [items, setItems] = useState(['A', 'B', 'C'])
  // Your code here
  return null
}`,
    solution: `const addItem = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  setItems(prev => [String.fromCharCode(65 + prev.length), ...prev])
}
return (
  <View>
    <Button title="Add" onPress={addItem} />
    {items.map((item, i) => <Text key={\`\${item}-\${i}\`} style={{ padding: 16 }}>{item}</Text>)}
  </View>
)`,
    explanation: `LayoutAnimation occupies a spot neither Animated nor Reanimated covers as cheaply: animating **layout changes you didn't choreograph**. Inserting at the head of this list moves every existing row — animating that with Animated would mean an \`Animated.Value\` per row and hand-computed target positions. LayoutAnimation inverts the model: \`configureNext\` arms a one-shot animation, and the *next* layout pass — whatever it turns out to move, however many views — is animated natively, frame-by-frame on the platform side, no per-view wiring and no JS-thread involvement per frame.

The call ordering is the whole API: \`configureNext\` **before** the \`setItems\` that triggers the change. It's per-transition, not a mode — each animated change arms it again, which is also its virtue: you opt in exactly where motion is wanted. \`Presets.easeInEaseOut\` covers most cases; the config object underneath lets you tune create/update/delete phases separately.

The trade-offs to name: it's **global and fire-and-forget** — it animates every layout change in that pass, not just your list, so a simultaneous unrelated update animates too; there's no progress value, no interruption, no gesture coupling — for that, Reanimated's layout/entering transitions are the modern, controllable answer. Historically Android required \`UIManager.setLayoutAnimationEnabledExperimental(true)\`; knowing that flag (and that the New Architecture reworks this area) signals real device time.

**Red flag:** reaching for per-item \`Animated.Value\`s to animate a list insert — that's choreographing by hand what the layout engine will diff for free.

**Say it:** "configureNext arms a native one-shot animation for the next layout pass — perfect for inserts where I can't enumerate what moves — and when I need interruptible or per-item control, that's Reanimated layout transitions."`,
    tests: [
      { it: 'arms the next layout pass with a preset before the state change', check: ['LayoutAnimation.configureNext(', 'LayoutAnimation.Presets'] },
    ],
    hints: ['LayoutAnimation.configureNext before state change', 'LayoutAnimation.Presets has presets', 'It animates the whole next layout pass'],
  },
]
