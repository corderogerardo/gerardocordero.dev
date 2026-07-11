import type { Challenge } from '../challenges'

export const extraChallenges: Challenge[] = [
  // ─── Extra (92–100) ───
  {
    id: 92,
    title: 'TypeScript generics — identity function',
    category: 'Extra',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Write a generic identity function that returns the same type it receives.
Use it with a string and a number relying on inference, and once with an
explicit type argument.`,
    starterCode: `function identity<T>(arg: T): T {
  return arg
}

// Use with string (inferred)
// Use with number (inferred)
// Use with an explicit type argument`,
    solution: `function identity<T>(arg: T): T {
  return arg
}

// Inference: T is captured from the argument — no annotation needed
const str = identity('hello') // T = string
const num = identity(42)      // T = number

// Explicit type argument — only when inference has nothing to work with
const tags = identity<string[]>([])`,
    explanation: `Generics exist to preserve the relationship between input and output types. \`identity\` is deliberately trivial — the interviewer is checking whether you understand that \`<T>\` declares a *type parameter* captured fresh at each call site: \`identity('hello')\` instantiates \`T = string\`, \`identity(42)\` instantiates \`T = number\`, and no annotation is needed because inference reads the argument.

The senior contrast is with \`any\`: \`function identity(arg: any): any\` also compiles, but it erases the type — the caller gets \`any\` back and every downstream property access is unchecked. The generic keeps the pipe type-safe end to end without writing one overload per type.

Trade-offs worth saying out loud: pass an explicit type argument (\`identity<string[]>([])\`) only when inference has nothing to anchor on — an empty array, or a literal you don't want widened. And generics are compile-time only: they erase at runtime, so there is no \`typeof T\`, and any runtime branching still needs a real value to inspect.

**Red flag:** answering with \`any\` or a stack of overloads. Both "work"; both tell the interviewer you don't know why the feature exists — \`any\` opts out of the type system exactly where the question asked you to use it.

**Say it:** "A generic is a type variable captured at the call site — it preserves the input/output type relationship that any would erase, with inference doing the annotation work for me."`,
    tests: [
      { it: 'declares a type parameter with <T>', check: ['<T>'] },
      { it: 'parameter and return type are both T', check: ['(arg: T): T'] },
      { it: 'returns the argument unchanged', check: ['return arg'] },
      { it: 'calls identity letting TypeScript infer T', check: ['identity('] },
      { it: 'uses an explicit type argument at least once', check: ['identity<'] },
    ],
    hints: [
      '<T> declares a type variable; each call site instantiates its own T',
      'Inference reads T from the argument — annotate only when there is nothing to infer from',
      'any also compiles, but erases the input/output type relationship',
    ],
  },
  {
    id: 93,
    title: 'TypeScript unions and narrowing',
    category: 'Extra',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Define a type Shape that is either Circle ({ kind: 'circle', radius: number })
or Square ({ kind: 'square', side: number }). Write a function area that narrows
the type on the discriminant and returns the area. Handle unknown kinds explicitly —
in TypeScript that is an exhaustiveness check with never; at runtime, throw.`,
    starterCode: `type Circle = { kind: 'circle'; radius: number }
type Square = { kind: 'square'; side: number }
type Shape = Circle | Square

function area(shape: Shape): number {
  // Your code here
  return 0
}`,
    solution: `// Types live in the starter: Shape = Circle | Square, discriminated by kind.
// In TS the signature is area(shape: Shape): number and the default branch is
// const _never: never = shape — a forgotten variant becomes a compile error.
function area(shape) {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'square':
      return shape.side ** 2
    default:
      throw new Error('Unknown shape kind: ' + JSON.stringify(shape))
  }
}`,
    explanation: `Discriminated unions are TypeScript's answer to "this value is one of N shapes": a shared literal field (\`kind\`) acts as the tag, and control flow narrows on it. Inside \`case 'circle'\` the compiler knows \`shape\` is \`Circle\`, so \`shape.radius\` typechecks and \`shape.side\` is an error — narrowing is just the compiler following the same runtime check your code already makes.

The discriminant matters doubly because types are erased at compile time: at runtime, \`kind\` is the *only* dispatch mechanism the running code has. One field serves both worlds — that's the design insight this question probes.

The exhaustiveness trick is the senior layer: in the \`default\` branch, \`const _never: never = shape\` compiles only if every variant is handled — add a \`Triangle\` to the union next quarter and every switch you forgot becomes a compile error instead of a silent \`undefined\`. The runtime \`throw\` covers the other boundary: data arriving from an API was never checked by the compiler at all.

**Red flag:** casting your way through (\`(shape as Circle).radius\`) or sniffing structure with property checks when a discriminant exists. Assertions silence the compiler exactly where the union was supposed to protect you.

**Say it:** "A discriminated union gives me one literal tag that narrows at compile time and dispatches at runtime — and a never check in the default branch turns a forgotten variant into a compile error."`,
    tests: [
      { it: 'circle area is πr²', run: 'area({ kind: "circle", radius: 2 })', expected: 12.57 },
      { it: 'unit circle sanity check', run: 'area({ kind: "circle", radius: 1 })', expected: 3.14 },
      { it: 'square area is side²', run: 'area({ kind: "square", side: 3 })', expected: 9 },
      { it: 'unknown kind throws instead of returning garbage', run: '(() => { try { area({ kind: "triangle", base: 4 }); return "no throw" } catch (e) { return "threw" } })()', expected: 'threw' },
      { it: 'narrows via a switch on the discriminant', check: ['switch (shape.kind)'] },
    ],
    hints: [
      'The shared literal field kind is the discriminant — switch on it',
      'Inside each case the compiler has narrowed shape to one variant',
      'default branch: never-typed assignment in TS, throw at runtime',
    ],
  },
  {
    id: 94,
    title: 'React Native accessibility',
    category: 'Extra',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Add accessibility props to a button component: accessible, accessibilityLabel,
accessibilityRole, and accessibilityState — and make sure the announced state and the
actual touch behavior stay in sync.`,
    starterCode: `export default function AccessibleButton({ label, onPress, disabled }) {
  // Your code here
  return null
}`,
    solution: `export default function AccessibleButton({ label, onPress, disabled }) {
  return (
    <TouchableOpacity
      accessible
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
    >
      <Text>{label}</Text>
    </TouchableOpacity>
  )
}`,
    explanation: `For a VoiceOver or TalkBack user, an unlabeled touchable is a silent rectangle — these four props are what turn it back into a button. Each does one job: \`accessible\` merges the touchable and its children into a single focusable element, so the screen reader lands on one thing instead of stepping into the inner \`Text\` separately. \`accessibilityLabel\` is the text that gets read. \`accessibilityRole="button"\` makes the reader announce "button," telling the user it's actionable. \`accessibilityState={{ disabled }}\` announces the disabled state — and here is the trap the question hides: it only *announces*. The separate \`disabled\` prop is what actually blocks touches. Pass one without the other and the screen reader either promises an interaction the app refuses, or silently ignores a live button.

Trade-off worth defending: for text buttons the explicit label looks redundant (readers fall back to child text), but icon-only buttons ship completely silent without one — so the maintainable team rule is "every interactive element gets a label," enforced by lint (\`eslint-plugin-react-native-a11y\`), not by memory. Keep \`testID\` (automation) and \`accessibilityLabel\` (humans) separate — hijacking labels as E2E selectors corrupts the spoken experience.

**Red flag:** "we'll add accessibility at the end." It retrofits badly, and claiming it's tested without ever turning on VoiceOver/TalkBack tells the interviewer no one has actually listened to the app.

**Say it:** "accessible merges the touchable into one focusable element, the label is what's read, the role announces the trait, and accessibilityState announces disabled — while the disabled prop is what actually blocks the tap, so the two must stay in sync."`,
    tests: [
      { it: 'screen reader label is bound to the label prop', check: ['accessibilityLabel={label}'] },
      { it: 'announces itself as a button', check: ['accessibilityRole="button"'] },
      { it: 'announces the disabled state', check: ['accessibilityState={{ disabled'] },
      { it: 'disabled prop actually blocks touches', check: ['disabled={disabled}'] },
      { it: 'wires the press handler', check: ['onPress={onPress}'] },
    ],
    hints: [
      'accessible merges children into one focusable element',
      'accessibilityState announces disabled; the disabled prop enforces it — you need both',
      'Icon-only buttons are silent without an explicit accessibilityLabel',
    ],
  },
  {
    id: 95,
    title: 'i18n with expo-localization',
    category: 'Extra',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Use expo-localization to detect the device language with the modern
getLocales() API. Create a simple i18n object that returns translated strings for
English and Spanish, falling back to English for unsupported languages.`,
    starterCode: `const translations = {
  en: { greeting: 'Hello', farewell: 'Goodbye' },
  es: { greeting: 'Hola', farewell: 'Adiós' },
}

export default function Greeting() {
  // Your code here
  return null
}`,
    solution: `export default function Greeting() {
  const languageCode = Localization.getLocales()[0]?.languageCode ?? 'en'
  const t = translations[languageCode] ?? translations.en
  return (
    <View>
      <Text>{t.greeting}</Text>
      <Text>{t.farewell}</Text>
    </View>
  )
}`,
    explanation: `i18n at this size is two decisions: where the locale comes from, and what happens when you don't support it. \`Localization.getLocales()\` returns the user's preference list, most-preferred first, already parsed — \`languageCode\` gives you \`'es'\` from \`es-MX\`, so every regional variant shares one dictionary. The older \`Localization.locale\` string (and the \`split('-')[0]\` parsing it forced) is the deprecated pattern this API replaced; using it in an interview dates your Expo knowledge.

The fallback chain is the production-critical line. \`translations[languageCode]\` for a French device returns \`undefined\`, and without \`?? translations.en\` the next property access crashes. Falling back to the default language fails soft: wrong language beats a dead screen, every time.

Trade-offs to defend: a plain object is honest for two locales and a take-home. The moment you need interpolation, pluralization, or lazy-loaded dictionaries, reach for \`i18n-js\` or \`react-i18next\` — plural rules alone justify it, since some languages have up to six plural categories and \`Intl.PluralRules\` exists precisely because \`count === 1 ? 'item' : 'items'\` is wrong outside English.

**Red flag:** caching the locale in a module-level constant. The user can change device language while your app is backgrounded; resolve it per render (or subscribe) or the app ignores the change until a full restart.

**Say it:** "I resolve languageCode from getLocales(), fall back to the default language so unsupported locales degrade instead of crash, and reach for a real i18n library the moment pluralization or interpolation appears."`,
    tests: [
      { it: 'uses the modern getLocales() API', check: ['getLocales()'] },
      { it: 'matches on languageCode so es-MX and es-ES share a dictionary', check: ['languageCode'] },
      { it: 'falls back to English for unsupported languages', check: ['?? translations.en'] },
      { it: 'renders translated strings from the resolved dictionary', check: ['t.greeting'] },
    ],
    hints: [
      'getLocales()[0].languageCode — the old Localization.locale string is deprecated',
      'Unsupported language must fall back, not crash: ?? translations.en',
      'Resolve per render — the device language can change while backgrounded',
    ],
  },
  {
    id: 96,
    title: 'GraphQL query with Apollo Client',
    category: 'Extra',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Write a React Native component that uses Apollo Client's useQuery hook
to fetch a list of books (id, title, author) and display them — handling the
loading and error states before touching data.`,
    starterCode: `const GET_BOOKS = gql\`
  query GetBooks {
    books { id title author }
  }
\`

export default function BookList() {
  // Your code here
  return null
}`,
    solution: `export default function BookList() {
  const { loading, error, data } = useQuery(GET_BOOKS)

  if (loading) return <Text>Loading...</Text>
  if (error) return <Text>Error: {error.message}</Text>

  return (
    <FlatList
      data={data.books}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Text>{item.title} by {item.author}</Text>
      )}
    />
  )
}`,
    explanation: `\`useQuery\` is declarative data fetching: the component states what it needs and Apollo owns the lifecycle — request, cache, dedupe, re-render. The \`gql\` tag is a tagged template — a function receiving the string parts and interpolated values separately — which parses the query into an AST once at module load, not per render. That's the same mechanism behind \`styled-components\`, and naming it earns points.

The three-state ladder — \`loading\`, then \`error\`, then \`data\` — isn't boilerplate, it's the contract: touch \`data.books\` before checking the first two and the first slow network turns into a crash on \`undefined\`.

The senior detail is *why* the query selects \`id\`. Apollo's cache is normalized: objects are stored flat, keyed by \`__typename\` plus \`id\`. Query the \`id\` and a mutation returning the same book updates every screen showing it automatically; omit it and the cache can't normalize, so updates silently stop propagating. \`keyExtractor\` reusing that \`id\` is the free by-product, not the reason.

Also worth saying: \`loading\` is only true on the *first* fetch by default — refetches need \`notifyOnNetworkStatusChange\` if you want a spinner — and \`error\` can coexist with partial data.

**Red flag:** mirroring \`data\` into local state with \`useEffect\` + \`useState\`. The normalized cache *is* the state; the copy goes stale the moment a mutation updates the original.

**Say it:** "useQuery gives me the three render states declaratively, and because Apollo normalizes by __typename plus id, selecting the id is what makes cache updates propagate — not just a keyExtractor convenience."`,
    tests: [
      { it: 'fetches with useQuery against the query document', check: ['useQuery(GET_BOOKS)'] },
      { it: 'renders the loading state first', check: ['if (loading)'] },
      { it: 'renders the error state before touching data', check: ['if (error)'] },
      { it: 'lists books from the query result', check: ['data.books'] },
      { it: 'keys rows by the stable server id', check: ['keyExtractor'] },
    ],
    hints: [
      'Destructure { loading, error, data } and return early for the first two',
      'gql is a tagged template — parses the query to an AST at module load',
      'Selecting id is what lets the normalized cache propagate updates',
    ],
  },
  {
    id: 97,
    title: 'WebSocket connection hook',
    category: 'Extra',
    difficulty: 'hard',
    timeEstimate: '15 min',
    prompt: `Create a custom useWebSocket hook that:
1. Connects to a WebSocket URL
2. Returns the latest message
3. Reconnects on disconnect — but never after unmount
4. Cleans up the socket AND any pending reconnect timer on unmount`,
    starterCode: `function useWebSocket(url) {
  // Your code here
  return { lastMessage, sendMessage }
}`,
    solution: `function useWebSocket(url) {
  const [lastMessage, setLastMessage] = useState(null)
  const wsRef = useRef(null)
  const timerRef = useRef(null)
  const closedRef = useRef(false)

  const connect = useCallback(() => {
    wsRef.current = new WebSocket(url)
    wsRef.current.onmessage = (e) => setLastMessage(e.data)
    wsRef.current.onclose = () => {
      // reconnect only while mounted — cleanup's close() also fires onclose
      if (!closedRef.current) timerRef.current = setTimeout(connect, 3000)
    }
  }, [url])

  useEffect(() => {
    closedRef.current = false
    connect()
    return () => {
      closedRef.current = true
      clearTimeout(timerRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const sendMessage = useCallback((msg) => wsRef.current?.send(msg), [])
  return { lastMessage, sendMessage }
}`,
    explanation: `A socket is imperative, stateful, and outlives renders — exactly what refs are for. The hook's whole job is mapping that lifecycle onto React's: \`wsRef\` holds the instance (a socket is not render data, so it must not live in state), and only \`lastMessage\` is state, because it's the one thing that should trigger a re-render.

The part that separates candidates is the unmount interaction. Cleanup calls \`close()\` — which *fires \`onclose\`* — and a naive \`onclose = () => setTimeout(connect, 3000)\` then schedules a reconnect for a component that no longer exists: a zombie socket that reconnects forever, plus a setState-after-unmount warning. The \`closedRef\` guard breaks that loop, and \`clearTimeout\` covers the other race — unmounting while a reconnect is already pending. Works-in-dev, leaks-in-production is exactly this shape of bug.

Production hardening to name unprompted: exponential backoff with jitter instead of a fixed 3s (a fleet of clients reconnecting in lockstep after a server blip is a thundering herd), application-level heartbeat ping/pong because proxies and load balancers silently kill idle connections, and re-authenticate plus re-subscribe on every reconnect — the new socket knows nothing about the old one's session.

**Red flag:** creating the socket in the render body (one socket per render) or storing it in \`useState\` — both confuse "instance I manage" with "data I render."

**Say it:** "The socket lives in a ref, the latest message in state, and my cleanup both closes the socket and disarms the reconnect — in production I'd add backoff with jitter and heartbeats, because intermediaries kill idle connections."`,
    tests: [
      { it: 'opens the socket against the given url', check: ['new WebSocket(url)'] },
      { it: 'stores the latest message from onmessage', check: ['onmessage'] },
      { it: 'schedules reconnection from onclose', check: ['onclose'] },
      { it: 'clears any pending reconnect timer on unmount', check: ['clearTimeout'] },
      { it: 'closes the socket in the effect cleanup', check: ['.close()'] },
    ],
    hints: [
      'Socket in a ref, latest message in state — only one of them is render data',
      'close() in cleanup fires onclose — guard the reconnect or it resurrects itself',
      'Two things to clean up: the socket AND the pending reconnect timer',
    ],
  },
  {
    id: 98,
    title: 'Gesture handler swipeable row',
    category: 'Extra',
    difficulty: 'hard',
    timeEstimate: '15 min',
    prompt: `Create a swipeable list row using react-native-gesture-handler + Reanimated
that reveals a "Delete" button when swiped left. Clamp the drag to the left,
snap open past a threshold, and make sure the pan doesn't steal the list's
vertical scroll.`,
    starterCode: `export default function SwipeableRow({ children, onDelete }) {
  // Your code here
  return null
}`,
    solution: `export default function SwipeableRow({ children, onDelete }) {
  const translateX = useSharedValue(0)

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10]) // let vertical drags go to the list
    .onUpdate((e) => {
      translateX.value = Math.min(0, e.translationX)
    })
    .onEnd(() => {
      translateX.value = withSpring(translateX.value < -80 ? -100 : 0)
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  return (
    <GestureDetector gesture={pan}>
      <View style={{ flexDirection: 'row' }}>
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          {children}
        </Animated.View>
        <Button title="Delete" onPress={onDelete} />
      </View>
    </GestureDetector>
  )
}`,
    explanation: `The reason this stack — gesture-handler plus Reanimated — is the modern answer is thread placement: \`onUpdate\`/\`onEnd\` and \`useAnimatedStyle\` run as worklets on the UI thread, so the row tracks the finger at frame rate even while the JS thread is busy rendering the rest of the list. The gesture never waits on React.

The mechanics worth narrating: \`Math.min(0, e.translationX)\` clamps the drag to the left — no right-swipe overshoot. \`onEnd\` implements snap semantics: past the \`-80\` threshold, commit to the open position revealing Delete; otherwise spring home. \`withSpring\` gives the release physical feel instead of a linear slide. And \`useAnimatedStyle\` is the only correct way to bind a shared value to style — reading \`translateX.value\` in the render body doesn't subscribe to anything, so the UI would never move.

The detail interviewers use to separate seniors: \`activeOffsetX([-10, 10])\`. Inside a scrollable list, an unconstrained pan captures *vertical* drags too, and your list stops scrolling wherever a row sits. The offset makes the pan activate only after clear horizontal intent, yielding everything else to the scroll view.

**Red flag:** reaching for \`PanResponder\` with JS-driven \`Animated.event\` — every move event crosses to the JS thread, so the row stutters exactly when the app is busy, which is exactly when users are scrolling.

**Say it:** "The pan and the spring run as worklets on the UI thread, so a busy JS thread can't drop the gesture — and activeOffsetX is what keeps my horizontal swipe from stealing the list's vertical scroll."`,
    tests: [
      { it: 'builds the drag with the Gesture.Pan API', check: ['Gesture.Pan()'] },
      { it: 'tracks the finger in onUpdate', check: ['onUpdate'] },
      { it: 'snaps with a spring on release', check: ['withSpring'] },
      { it: 'binds the shared value to style via a worklet', check: ['useAnimatedStyle'] },
      { it: 'wraps the row in a GestureDetector', check: ['GestureDetector'] },
    ],
    hints: [
      'Math.min(0, translationX) clamps the drag to the left',
      'onEnd: threshold decides — spring to -100 (open) or back to 0',
      'activeOffsetX keeps the pan from capturing the list\'s vertical scroll',
    ],
  },
  {
    id: 99,
    title: 'Reanimated shared value animation',
    category: 'Extra',
    difficulty: 'hard',
    timeEstimate: '15 min',
    prompt: `Use react-native-reanimated to create a pulsing circle animation.
The circle should scale between 1x and 1.5x continuously — and the animation
must be cancelled when the component unmounts.`,
    starterCode: `export default function PulsingCircle() {
  // Your code here
  return null
}`,
    solution: `export default function PulsingCircle() {
  const scale = useSharedValue(1)

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.5, { duration: 1000 }),
      -1,   // repeat forever
      true, // reverse: 1 → 1.5 → 1
    )
    return () => cancelAnimation(scale)
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View
      style={[
        { width: 100, height: 100, borderRadius: 50, backgroundColor: 'blue' },
        animatedStyle,
      ]}
    />
  )
}`,
    explanation: `The point of Reanimated here is where the work runs: the shared value and the \`useAnimatedStyle\` worklet live on the UI thread, so the pulse stays at frame rate even when the JS thread is busy — a \`setState\`-driven animation would push sixty re-renders a second through React and stutter under any real load.

Composition is the mechanic to narrate: \`withTiming(1.5, { duration: 1000 })\` describes one leg, \`withRepeat(…, -1, true)\` wraps it — \`-1\` means forever, \`true\` means reverse each iteration, which is what makes it a smooth 1 → 1.5 → 1 pulse instead of snapping back to 1 every cycle.

Two senior details. First, \`cancelAnimation\` in the effect cleanup: an infinite animation nobody cancels keeps ticking after unmount — the same slow-leak family as an uncancelled interval, and the kind of thing that only shows up as battery drain and memory growth in production. Second, the property choice: \`transform: scale\` is composited without recomputing layout; animating \`width\`/\`height\` to fake the same pulse forces layout every frame.

**Red flag:** reading or writing \`scale.value\` in the render body. Renders don't subscribe to shared values — the binding must live inside the \`useAnimatedStyle\` worklet, and mutation belongs in effects or gesture callbacks.

**Say it:** "I animate transform scale on the UI thread with withRepeat and reverse, and I cancel it in the effect cleanup — an uncancelled infinite animation is a leak that outlives the component."`,
    tests: [
      { it: 'starts the shared value at scale 1', check: ['useSharedValue(1)'] },
      { it: 'loops the animation with withRepeat', check: ['withRepeat'] },
      { it: 'animates toward 1.5x with a timing curve', check: ['withTiming(1.5'] },
      { it: 'cancels the infinite animation on unmount', check: ['cancelAnimation'] },
      { it: 'binds scale to style inside a worklet', check: ['useAnimatedStyle'] },
    ],
    hints: [
      'withRepeat(withTiming(...), -1, true) — infinite, reversing each pass',
      'Return cancelAnimation(scale) from the effect or the loop outlives the component',
      'Bind via useAnimatedStyle — reading .value in render subscribes to nothing',
    ],
  },
  {
    id: 100,
    title: 'End-to-end test with Detox',
    category: 'Extra',
    difficulty: 'hard',
    timeEstimate: '15 min',
    prompt: `Write a Detox end-to-end test that:
1. Launches the app
2. Taps a "Login" button
3. Types email and password
4. Asserts the user sees a welcome screen

Match elements by testID, not by text.`,
    starterCode: `describe('Login flow', () => {
  beforeAll(async () => {
    await device.launchApp()
  })
  it('should login successfully', async () => {
    // Your test steps here
  })
})`,
    solution: `it('should login successfully', async () => {
  await element(by.id('loginButton')).tap()
  await element(by.id('emailInput')).typeText('alice@example.com')
  await element(by.id('passwordInput')).typeText('password123')
  await element(by.id('submitButton')).tap()
  await expect(element(by.id('welcomeScreen'))).toBeVisible()
})`,
    explanation: `E2E sits at the top of the testing pyramid for a reason: it's the most expensive layer — real simulator or device, minutes instead of milliseconds, infrastructure flake — so it's reserved for the few flows where a regression costs money: login, checkout, the critical path. Component behavior belongs to the integration layer (React Native Testing Library) below it; a healthy suite is many unit tests, a solid integration layer, and *few* E2E flows.

What makes Detox specifically worth naming is that it's **gray-box**: it instruments the app and waits for it to become idle — pending animations, in-flight network requests, timers — before executing each step. That synchronization is why a correct Detox test contains no \`sleep()\` calls, and why each \`await\` reads as a clean user action.

Matching strategy is the other signal. \`by.id\` targets \`testID\` — a stable contract between the app and its tests, decoupled from copy. \`by.text('Login')\` breaks the day marketing rewords the button or the app ships its Spanish localization. Finally, \`toBeVisible()\` asserts actual on-screen visibility, not mere existence in the tree — a welcome screen hidden behind a modal fails, as it should.

**Red flag:** sprinkling sleeps or generous \`waitFor\` timeouts to fight flakiness. That's suppressing Detox's synchronization instead of fixing the unsettled timer or looping animation that's actually keeping the app busy.

**Say it:** "Detox is gray-box — it waits for the app to be idle, so no sleeps; I match by testID because text is a copy decision, and I keep E2E to the few money paths the pyramid says it should cover."`,
    tests: [
      { it: 'matches elements by testID, not text', check: ["by.id('"] },
      { it: 'types credentials into the inputs', check: ['typeText('] },
      { it: 'drives the flow with taps', check: ['.tap()'] },
      { it: 'asserts through Detox expect on an element', check: ['await expect(element('] },
      { it: 'asserts the welcome screen is actually visible', check: ['toBeVisible()'] },
    ],
    hints: [
      'by.id targets testID — stable against copy and i18n changes',
      'No sleeps: Detox synchronizes with animations, network, and timers',
      'toBeVisible asserts on-screen visibility, not existence in the tree',
    ],
  },
]
