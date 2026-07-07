// Advanced content authored from the bundled best-practice skills:
// react-native-best-practices, @expo/ui, vercel-react-native-skills,
// vercel-react-best-practices, and native-data-fetching.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

/** New flashcard categories these cards add (perf already exists in the base set). */
export const ADVANCED_FLASHCARD_FILTERS: { value: string; label: string }[] = [
  { value: "nativeui", label: "Native UI" },
  { value: "data", label: "Data & Networking" },
];

export const ADVANCED_FLASHCARDS: Flashcard[] = [
  // ---------- Performance (perf) ----------
  {
    id: "sk-perf-1",
    category: "perf",
    categoryLabel: "PERF",
    question: "Why replace ScrollView with FlatList / FlashList for long lists?",
    answerHtml:
      "ScrollView mounts <b>every</b> child up front. FlatList/FlashList <b>virtualize</b> — only visible rows render — and FlashList <b>recycles</b> row views instead of mounting/unmounting. A heavy list can go from ~3fps on a ScrollView to 60fps on a recycling list. Note: FlashList <b>v2</b> auto-measures, so <code>estimatedItemSize</code> is deprecated. <b>\"I only reach for ScrollView on short, fixed lists — anything scrollable and unbounded gets FlashList so scroll performance doesn't degrade as the list grows.\"</b>",
  },
  {
    id: "sk-perf-2",
    category: "perf",
    categoryLabel: "PERF",
    question: "What is the React Compiler and what does it replace?",
    answerHtml:
      "A build-time (Babel) compiler that <b>automatically memoizes</b> components and values, letting you drop most manual <code>memo</code> / <code>useMemo</code> / <code>useCallback</code>. It needs code that follows the <b>Rules of React</b> (run <code>react-compiler-healthcheck</code> first) and works on RN 0.76+ / Expo SDK 52+ (React 19 recommended). <b>\"I let the compiler own memoization by default and only reach for manual useMemo/useCallback when it genuinely can't help.\"</b>",
  },
  {
    id: "sk-perf-3",
    category: "perf",
    categoryLabel: "PERF",
    question: "How do useDeferredValue and useTransition improve responsiveness?",
    answerHtml:
      "Concurrent React lets updates be <b>paused, interrupted, or abandoned</b>. <code>useDeferredValue</code> renders an expensive view from a lagging copy of a value so typing stays responsive; <code>useTransition</code> / <code>startTransition</code> marks updates non-urgent so user input wins. Requires the New Architecture (default 0.76+). <b>\"Anything that can lag typing or navigation I mark non-urgent with useTransition, or defer with useDeferredValue, so user input always wins the frame.\"</b>",
  },
  {
    id: "sk-perf-4",
    category: "perf",
    categoryLabel: "PERF",
    question: "Why do Reanimated animations stay smooth when the JS thread is busy?",
    answerHtml:
      "They run in <b>worklets on the UI thread</b> — <code>useSharedValue</code> holds the value, <code>useAnimatedStyle</code> maps it, <code>withTiming</code> / <code>withSpring</code> drive it — so frames hit 60fps even while JS is blocked. The old <code>Animated</code> API drives from the JS thread and stutters. Reanimated 4 needs the New Architecture + the worklets Babel plugin (added last). <b>\"I animate on Reanimated worklets, not the JS thread, specifically so gestures and transitions stay smooth even while JS is busy with data or navigation work.\"</b>",
  },
  {
    id: "sk-perf-5",
    category: "perf",
    categoryLabel: "PERF",
    question: "Which properties are cheap to animate, and which are expensive?",
    answerHtml:
      "Animate <b>transform</b> (scale/translate) and <b>opacity</b> — GPU-composited, no layout. Avoid animating <code>width</code>, <code>height</code>, <code>top</code>, <code>left</code>, <code>margin</code>, <code>padding</code>: each frame triggers a <b>layout recalculation</b>. e.g. collapse a panel with <code>scaleY</code>, not <code>height</code>. <b>\"I only animate transform and opacity — anything touching layout, like width or margin, I redesign the animation around instead.\"</b>",
  },
  {
    id: "sk-perf-6",
    category: "perf",
    categoryLabel: "PERF",
    question: "On which thread do sync vs async Turbo Module methods run?",
    answerHtml:
      "<b>Sync</b> methods run on — and block — the <b>JS thread</b>; keep them under <b>16ms</b> or you drop frames. <b>Async</b> methods run on the native-modules thread (<code>mqt_v_native</code>). Prefer async for anything non-trivial; reserve sync for tiny instant reads. <b>\"I default new Turbo Module methods to async, and only make one sync if it's a trivial, instant read — sync work is JS-thread work, and JS-thread work has a frame budget.\"</b>",
  },
  {
    id: "sk-perf-7",
    category: "perf",
    categoryLabel: "PERF",
    question: "How does disabling Android JS-bundle compression speed up startup?",
    answerHtml:
      "Compressed bundles can't be <b>memory-mapped</b>. Uncompressed, Hermes <code>mmap</code>s the bytecode and the OS pages in only what's used — faster TTI, lower memory. Set <code>androidResources { noCompress += [&quot;bundle&quot;] }</code>. It's the default in RN 0.79+ (only needed on ≤ 0.78). <b>\"On older RN versions I explicitly disable bundle compression on Android, because an mmap-able bundle beats a smaller file every time for cold start.\"</b>",
  },
  {
    id: "sk-perf-8",
    category: "perf",
    categoryLabel: "PERF",
    question: "Why avoid barrel imports (index.ts re-exports) in a bundle?",
    answerHtml:
      "Importing <code>{ Button } from './components'</code> pulls in <b>every</b> export of the barrel — defeating tree-shaking, bloating the bundle, slowing module evaluation (worse TTI), and inviting circular-dependency / HMR issues. Import from source: <code>./components/Button</code>. <b>\"I import from the source file, not the barrel, because a barrel import silently pulls in everything it re-exports whether I use it or not.\"</b>",
  },
  {
    id: "sk-perf-9",
    category: "perf",
    categoryLabel: "PERF",
    question: "Why is defining a component inside another component a bug?",
    answerHtml:
      "It creates a <b>new component type on every render</b>, so React <b>fully remounts</b> it — destroying its state and DOM and tanking performance. Move it out and pass props instead of closing over parent variables. <p><b>Red flag:</b> this bug looks correct in code review and often works fine in dev — the state loss only surfaces once a parent re-renders in production and an input loses focus or a form clears mid-typing.</p> <b>\"I always hoist component definitions out of render functions and pass data through props instead of closures.\"</b>",
  },
  {
    id: "sk-perf-10",
    category: "perf",
    categoryLabel: "PERF",
    question: "How do functional setState updates prevent stale closures?",
    answerHtml:
      "<code>setItems(prev =&gt; [...prev, x])</code> reads the latest value at update time, so the callback doesn't need <code>items</code> in its deps — giving a <b>stable</b> reference and avoiding stale reads from a captured old value. <b>\"I default to the functional form of setState whenever the new value depends on the old one, so I never have to think about whether the closure is stale.\"</b>",
  },
  {
    id: "sk-perf-11",
    category: "perf",
    categoryLabel: "PERF",
    question: "Why prefer expo-image over React Native's Image?",
    answerHtml:
      "<code>expo-image</code> adds memory-efficient <b>caching</b>, <b>blurhash</b> placeholders, progressive loading, and better list performance — and images are the biggest native-memory cost. Drop-in: <code>import { Image } from 'expo-image'</code>. <b>\"I default to expo-image over the core Image component in any Expo app — the caching and blurhash placeholders pay for themselves the first time a list scrolls.\"</b>",
  },
  {
    id: "sk-perf-12",
    category: "perf",
    categoryLabel: "PERF",
    question:
      "Why use GestureDetector + Gesture.Tap() for press animations instead of Pressable's onPressIn/Out?",
    answerHtml:
      "Gesture Handler callbacks run as <b>worklets on the UI thread</b>, so a press scale/opacity animates with <b>no JS-thread round-trip</b> — smoother than Pressable's JS-thread <code>onPressIn</code> / <code>onPressOut</code>. <b>\"For interactive press animations I reach for Gesture Handler over Pressable's callbacks, because the worklet runs on the UI thread with no JS round-trip.\"</b>",
  },
  {
    id: "sk-perf-13",
    category: "perf",
    categoryLabel: "PERF",
    question: "Why avoid creating inline objects inside a list's renderItem?",
    answerHtml:
      "A new object literal is a <b>new reference every render</b>, which breaks <code>memo</code> on the row and forces it to re-render. Pass <b>primitives</b> straight off <code>item</code> (e.g. <code>id</code>, <code>name</code>) instead of building <code>{{ ... }}</code> in <code>renderItem</code>. <b>\"I never build an object literal inside renderItem — I pass primitives off the item and let memo do its job.\"</b>",
  },

  // ---------- Native UI (nativeui) ----------
  {
    id: "sk-ui-1",
    category: "nativeui",
    categoryLabel: "UI",
    question: "What does @expo/ui render, and what is Host?",
    answerHtml:
      "<code>@expo/ui</code> renders <b>real native UI from React</b>: SwiftUI on iOS, Jetpack Compose on Android (react-native-web on web). Its <b>universal</b> components (SDK 56+) are one tree for all three. Every <code>@expo/ui</code> tree must be wrapped in <code>&lt;Host&gt;</code>. <b>\"I wrap every @expo/ui tree in Host and start with the universal components — one tree covers iOS, Android, and web instead of three.\"</b>",
  },
  {
    id: "sk-ui-2",
    category: "nativeui",
    categoryLabel: "UI",
    question:
      "When do you drop from @expo/ui universal components to the platform-specific layer?",
    answerHtml:
      "Start with <b>universal</b> components (one tree, no file split). Drop to <code>@expo/ui/swift-ui</code> or <code>@expo/ui/jetpack-compose</code> <b>only</b> when the universal API lacks a component, modifier, or behavior you need — accepting the <code>.ios.tsx</code> / <code>.android.tsx</code> split (two trees to maintain). <b>\"I stay on the universal API by default and only fork into swift-ui/jetpack-compose when a specific component or modifier isn't there yet — that's a deliberate trade of one tree for native-specific power, not the starting point.\"</b>",
  },
  {
    id: "sk-ui-3",
    category: "nativeui",
    categoryLabel: "UI",
    question: "Why is @expo/ui's TextInput different, and what makes it flicker-free?",
    answerHtml:
      "Its <code>value</code> takes an <code>ObservableState</code> from <code>useNativeState</code>, not a string. On typing, <code>onChangeText</code> runs as a <b>worklet on the UI thread</b> and writes <code>value</code> directly with <b>no React render</b> — synchronous, flicker-free masking/formatting. Requires <code>react-native-worklets</code>. <b>\"When I need a flicker-free native TextInput — currency masking, phone formatting — I reach for @expo/ui's ObservableState-backed input instead of driving it through React state.\"</b>",
  },
  {
    id: "sk-ui-4",
    category: "nativeui",
    categoryLabel: "UI",
    question: "What are @expo/ui drop-in replacements?",
    answerHtml:
      "API-compatible swaps for popular RN community libraries, backed by native SwiftUI/Compose — e.g. <code>@expo/ui/community/bottom-sheet</code> for <code>@gorhom/bottom-sheet</code>, plus <code>datetime-picker</code>, <code>picker</code>, <code>segmented-control</code>, and more. Migration is usually just the import path. <b>\"For any RN community UI library @expo/ui already covers, I default to its native drop-in — same API, one native implementation instead of a JS one.\"</b>",
  },
  {
    id: "sk-ui-5",
    category: "nativeui",
    categoryLabel: "UI",
    question: "Why prefer native navigators over JS-based ones?",
    answerHtml:
      "Native stack (<code>@react-navigation/native-stack</code> / expo-router's default) uses <b>UINavigationController</b> (iOS) and <b>Fragment</b> (Android); native tabs likewise. You get platform-correct gestures, transitions, and performance that the JS <code>@react-navigation/stack</code> can't match. <b>\"I default to the native stack and native tabs, not the JS-based navigators, because UINavigationController and Fragment give me platform-correct gestures and transitions for free.\"</b>",
  },
  {
    id: "sk-ui-6",
    category: "nativeui",
    categoryLabel: "UI",
    question: "Why can `{count && <Text>…</Text>}` crash a React Native app?",
    answerHtml:
      "If <code>count</code> is <code>0</code> (or a string is <code>&quot;&quot;</code>), <code>&amp;&amp;</code> returns that falsy-but-renderable value and RN tries to render a raw number/string <b>outside a <code>&lt;Text&gt;</code></b> → hard crash in production. Use a ternary: <code>count ? &lt;Text&gt;…&lt;/Text&gt; : null</code>. <p><b>Red flag:</b> writing <code>{count &amp;&amp; &lt;Text&gt;…&lt;/Text&gt;}</code> out of web-JSX habit — on the web a stray 0 just renders as harmless text; in React Native it throws.</p> <b>\"I never use && to conditionally render in RN — a ternary against null costs nothing and removes a whole class of production crashes.\"</b>",
  },
  {
    id: "sk-ui-7",
    category: "nativeui",
    categoryLabel: "UI",
    question: "Why is @expo/ui's List not for large datasets?",
    answerHtml:
      "Each <code>ListItem</code> is a JSX node processed on the <b>JS thread</b>, so large datasets slow noticeably. Use a virtualized/recycling list (FlashList) for big collections; reserve <code>List</code> for short, mostly-static content. <b>\"I keep @expo/ui's List for short, mostly-static content and reach for FlashList the moment a dataset can grow unbounded.\"</b>",
  },
  {
    id: "sk-ui-8",
    category: "nativeui",
    categoryLabel: "UI",
    question: "Pressable vs TouchableOpacity — which, and why?",
    answerHtml:
      "Use <b>Pressable</b> (from react-native or gesture-handler). It's the modern, more flexible press API — press states, hit slop, ripple — that replaces the legacy <code>TouchableOpacity</code> / <code>TouchableHighlight</code>. <b>\"I default to Pressable for any new touchable — TouchableOpacity is a legacy API I only touch in code I'm not otherwise refactoring.\"</b>",
  },

  // ---------- Data & Networking (data) ----------
  {
    id: "sk-data-1",
    category: "data",
    categoryLabel: "DATA",
    question: "What does React Query's staleTime control, and why set it?",
    answerHtml:
      "<code>staleTime</code> is how long cached data is treated as <b>fresh</b> — within it, React Query serves cache and skips refetching (e.g. <code>1000 * 60 * 5</code> = 5 min). It's the main caching knob, alongside automatic <b>deduplication</b> of identical in-flight queries by <code>queryKey</code>. <b>\"I set staleTime deliberately per query — long for data that rarely changes, short or zero for anything that needs to feel live — instead of leaving it at the default everywhere.\"</b>",
  },
  {
    id: "sk-data-2",
    category: "data",
    categoryLabel: "DATA",
    question: "After a mutation, how do you refresh the affected React Query data?",
    answerHtml:
      "In the mutation's <code>onSuccess</code>, call <code>queryClient.invalidateQueries({ queryKey: ['users'] })</code> to mark those queries stale and refetch. For instant UI, apply an <b>optimistic</b> update and roll back in <code>onError</code>. <p><b>Red flag:</b> reaching for an optimistic update on a screen's <i>initial</i> load — that's a staged/progressive-loading problem, not a mutation. Optimistic updates are for changes the user just made, where you already know the likely outcome and can cleanly roll it back.</p> <b>\"After a mutation I invalidate the specific query key so the server stays the source of truth, and I only go optimistic when I need the UI to feel instant and can cleanly roll back on error.\"</b>",
  },
  {
    id: "sk-data-3",
    category: "data",
    categoryLabel: "DATA",
    question: "How do you make React Query offline-aware in React Native?",
    answerHtml:
      "Wire its <code>onlineManager</code> to <b>NetInfo</b>: <code>onlineManager.setEventListener(setOnline =&gt; NetInfo.addEventListener(s =&gt; setOnline(s.isConnected)))</code>. Queries then pause when offline and resume on reconnect; add query persistence for an offline-first cache. <b>\"I wire React Query's onlineManager to NetInfo so queries automatically pause offline and resume on reconnect instead of silently failing and retrying blind.\"</b>",
  },
  {
    id: "sk-data-4",
    category: "data",
    categoryLabel: "DATA",
    question: "Where do auth tokens belong in an Expo app — and where do they NOT?",
    answerHtml:
      "In the <b>Keychain/Keystore</b> via <code>expo-secure-store</code> — <i>not</i> <code>AsyncStorage</code> (plaintext). Wrap fetch to attach <code>Authorization: Bearer</code>, and use a single-flight <b>refresh</b> flow so concurrent 401s share one refresh promise. <p><b>Red flag:</b> storing auth tokens in AsyncStorage because it's the familiar key-value API — AsyncStorage is plaintext on disk, so a token there is one device compromise away from account takeover.</p> <b>\"Auth tokens go in the Keychain/Keystore via expo-secure-store, never AsyncStorage, and I dedupe concurrent 401s behind a single refresh call.\"</b>",
  },
  {
    id: "sk-data-5",
    category: "data",
    categoryLabel: "DATA",
    question: "What's the rule for EXPO_PUBLIC_ environment variables?",
    answerHtml:
      "Only vars prefixed <code>EXPO_PUBLIC_</code> reach the app bundle, and they're <b>inlined at build time</b> (restart the dev server after editing <code>.env</code>). They're visible in the shipped app — <b>never put secrets there</b>; keep secret keys in non-prefixed vars used only in server/API routes. <b>\"Anything prefixed EXPO_PUBLIC_ I treat as public — visible in the shipped bundle — so real secrets stay server-side, never in a client env var.\"</b>",
  },
  {
    id: "sk-data-6",
    category: "data",
    categoryLabel: "DATA",
    question: "Why does Promise.all matter for data fetching?",
    answerHtml:
      "Independent awaits run <b>sequentially</b> — a waterfall of round-trips. <code>Promise.all([a(), b(), c()])</code> runs them <b>concurrently</b>, collapsing latency to the slowest single call (often a 2–10× win). Only serialize when one call truly depends on another. <b>\"Whenever calls don't depend on each other's results I fire them with Promise.all — a sequential await chain just pays round-trip latency three times over for no reason.\"</b>",
  },
  {
    id: "sk-data-7",
    category: "data",
    categoryLabel: "DATA",
    question: "What does React's cache() (or SWR) dedupe, and at what scope?",
    answerHtml:
      "Server <code>cache()</code> dedupes a function (e.g. <code>auth()</code>, a DB query) <b>within one request</b> — many callers, one execution. On the client, <b>SWR</b> / React Query dedupe identical requests <b>across component instances</b> and add caching + revalidation, so ten components mounting share one fetch. <b>\"I use cache() to dedupe a call within a single server request, and React Query/SWR to dedupe and cache across component instances on the client — different scopes, same duplicate-fetch problem.\"</b>",
  },
  {
    id: "sk-data-8",
    category: "data",
    categoryLabel: "DATA",
    question: "Why cancel fetches with AbortController?",
    answerHtml:
      "On unmount or a new query, abort the in-flight request (<code>fetch(url, { signal })</code> + <code>controller.abort()</code>) to avoid setting state on an unmounted component, racing a stale response, and wasting bandwidth. React Query does this automatically. <b>\"I always pass an AbortSignal through fetch and abort on unmount or when a newer request supersedes it, so I never race a stale response into state.\"</b>",
  },
];

/** New quiz categories these questions add. */
export const ADVANCED_QUIZ_FILTERS: { value: string; label: string }[] = [
  { value: "perf", label: "Performance" },
  { value: "nativeui", label: "Native UI" },
  { value: "data", label: "Data" },
];

export const ADVANCED_QUIZ: QuizQuestion[] = [
  {
    id: "sk-z1",
    category: "perf",
    categoryLabel: "Performance",
    question: "Why does FlashList outperform ScrollView for a 10k-row list?",
    options: [
      "It renders on the GPU",
      "It recycles row views and only renders the visible ones",
      "It disables Hermes",
      "It compresses the images",
    ],
    answer: 1,
    explanationHtml:
      "FlashList <b>virtualizes and recycles</b> row views; a ScrollView mounts all 10k children up front, which janks and spikes memory. It's tempting to credit \"the GPU,\" but there's no GPU-specific rendering path here — the win is entirely about how many native views get mounted, not how they're drawn.",
  },
  {
    id: "sk-z2",
    category: "perf",
    categoryLabel: "Performance",
    question: "Which pair of properties is GPU-cheap to animate?",
    options: [
      "width and height",
      "top and left",
      "transform and opacity",
      "margin and padding",
    ],
    answer: 2,
    explanationHtml:
      "<code>transform</code> and <code>opacity</code> composite on the GPU without layout; the others trigger a layout recalculation every frame. <code>top</code>/<code>left</code> feel like simple positioning changes, which is why they're the tempting wrong answer — but they still move the element by recomputing layout, not by compositing.",
  },
  {
    id: "sk-z3",
    category: "perf",
    categoryLabel: "Performance",
    question: "What does the React Compiler do?",
    options: [
      "Bundles and minifies the app",
      "Automatically memoizes components and values",
      "Replaces the Hermes engine",
      "Type-checks your code",
    ],
    answer: 1,
    explanationHtml:
      "It auto-memoizes so you can drop most manual <code>memo</code> / <code>useMemo</code> / <code>useCallback</code> — for code that follows the Rules of React. It's easy to confuse with Metro (bundling) since both run at build time, but the Compiler only rewrites components for memoization — it doesn't bundle or minify.",
  },
  {
    id: "sk-z4",
    category: "perf",
    categoryLabel: "Performance",
    question: "A synchronous Turbo Module method should stay under ~16ms because…",
    options: [
      "It runs on the UI thread",
      "It blocks the JS thread and can drop frames",
      "iOS enforces it",
      "Hermes limits it",
    ],
    answer: 1,
    explanationHtml:
      "Sync methods execute on (and block) the <b>JS thread</b>; exceed a frame budget and you drop frames. Prefer async for non-trivial work. \"Runs on the UI thread\" is the tempting distractor because \"sync\" sounds native/UI-related — but sync Turbo Module calls execute inline on JS, which is exactly why they're dangerous.",
  },
  {
    id: "sk-z5",
    category: "nativeui",
    categoryLabel: "Native UI",
    question: "@expo/ui's universal components render as…",
    options: [
      "WebViews",
      "Real native SwiftUI (iOS) and Jetpack Compose (Android)",
      "Canvas drawings",
      "Only React Native core views",
    ],
    answer: 1,
    explanationHtml:
      "One React tree renders to <b>SwiftUI</b> on iOS and <b>Jetpack Compose</b> on Android (and react-native-web on web), wrapped in <code>&lt;Host&gt;</code>. \"WebViews\" is the tempting wrong answer if you're picturing a Cordova/Ionic-style cross-platform layer — @expo/ui is the opposite of that: it's a real native render tree, not HTML in a WebView.",
  },
  {
    id: "sk-z6",
    category: "nativeui",
    categoryLabel: "Native UI",
    question: "Why can `{items.length && <List/>}` crash in React Native?",
    options: [
      "length is always truthy",
      "When length is 0, the 0 is rendered as raw text outside <Text>",
      "&& isn't supported in JSX",
      "It causes a memory leak",
    ],
    answer: 1,
    explanationHtml:
      "When <code>length</code> is <code>0</code>, <code>&amp;&amp;</code> yields <code>0</code>, which RN renders as a bare number outside a <code>&lt;Text&gt;</code> → crash. Use a ternary. \"length is always truthy\" is the misconception this bug hides behind — an empty list (<code>length === 0</code>) is exactly the case that reveals it, usually the first time the list is genuinely empty in production.",
  },
  {
    id: "sk-z7",
    category: "data",
    categoryLabel: "Data",
    question: "What does React Query's staleTime do?",
    options: [
      "Deletes the cache after a delay",
      "Sets how long cached data is treated as fresh (no refetch)",
      "Sets the request timeout",
      "Sets the retry count",
    ],
    answer: 1,
    explanationHtml:
      "Within <code>staleTime</code>, React Query serves cache and skips refetching — the main caching knob, alongside <code>queryKey</code> deduplication. \"Deletes the cache after a delay\" is the common confusion with <code>gcTime</code> (cache-time) — <code>staleTime</code> only controls whether cached data is refetched, it doesn't remove anything from the cache.",
  },
  {
    id: "sk-z8",
    category: "data",
    categoryLabel: "Data",
    question: "Where should auth tokens be stored in an Expo app?",
    options: [
      "AsyncStorage",
      "A module-level variable",
      "expo-secure-store (Keychain / Keystore)",
      "Inside the JS bundle",
    ],
    answer: 2,
    explanationHtml:
      "<code>expo-secure-store</code> uses the iOS Keychain / Android Keystore. <code>AsyncStorage</code> is plaintext, and the JS bundle ships to the device. A module-level variable is the other tempting-but-wrong answer — it looks \"in-memory and safe,\" but it's wiped on every app restart and doesn't survive a kill, so it fails as durable token storage even before the security question comes up.",
  },
  {
    id: "sk-z9",
    category: "data",
    categoryLabel: "Data",
    question: "Three independent API calls should be run with…",
    options: [
      "sequential awaits",
      "Promise.all for concurrency",
      "a for-loop of awaits",
      "nested setTimeouts",
    ],
    answer: 1,
    explanationHtml:
      "<code>Promise.all</code> runs them concurrently, collapsing latency to the slowest single call instead of summing three round-trips. Sequential awaits and a for-loop of awaits are the same mistake in two shapes — both look like normal async/await code, which is exactly why the waterfall is easy to miss in review.",
  },
];

/** New study-guide sessions distilled from the skills (same experiential style). */
export const ADVANCED_STUDY: StudySection[] = [
  {
    id: "st-21",
    num: "21",
    title: "21 · React Native performance playbook",
    html: `<p><b>Core:</b> performance work is a loop — <b>measure → optimize → re-measure → validate</b>. Profile first (React Native DevTools), then reach for the right lever: virtualize long lists with <b>FlashList</b> (it recycles rows; v2 auto-measures), let the <b>React Compiler</b> auto-memoize, keep input responsive with <b>Concurrent React</b> (<code>useDeferredValue</code> / <code>useTransition</code>), and run animations as <b>worklets on the UI thread</b> with Reanimated.</p>
      <ul>
        <li>Animate <b>transform</b> / <b>opacity</b> (GPU), never <code>width</code> / <code>height</code> / <code>top</code> / <code>left</code> (per-frame layout).</li>
        <li>Threading: a <b>sync</b> native method blocks the JS thread — keep it &lt; 16ms or make it async.</li>
        <li>Startup: ship <b>Hermes</b> (bytecode, no parse), uncompress the Android bundle for <code>mmap</code>, and measure <b>TTI on cold starts only</b>.</li>
        <li>Bundle: avoid <b>barrel imports</b>, lazy-load heavy screens, and analyze with source-map tooling.</li>
      </ul>
      <div class="callout tip"><span class="lbl">New concept</span> <b>Measure, don't guess.</b> Every fix is paired with a before/after number (FPS 45→60, TTI 3.2s→1.8s). If the metric didn't move, revert and try the next lever.</div>
      <div class="map"><span class="lbl">Your proof</span> You killed <b>re-render flicker and frozen screens</b> on Valt and drove a <b>Hermes rollout</b> — this playbook is already your instinct; now you can name each lever and the metric it moves.</div>`,
  },
  {
    id: "st-22",
    num: "22",
    title: "22 · Native UI with @expo/ui",
    html: `<p><b>Core:</b> <code>@expo/ui</code> renders <b>real native UI from React</b> — SwiftUI on iOS, Jetpack Compose on Android. Work down a ladder: start with <b>universal</b> components (SDK 56+: <code>Host</code>, <code>Column</code>, <code>Row</code>, <code>Text</code>, <code>Button</code>, <code>List</code>, <code>BottomSheet</code>…) — one tree for iOS, Android, and web — and drop to <code>@expo/ui/swift-ui</code> / <code>@expo/ui/jetpack-compose</code> only when the universal API can't express what you need.</p>
      <ul>
        <li><code>useNativeState</code> + worklets give a <b>flicker-free</b> native <code>TextInput</code> that updates on the UI thread with no React render.</li>
        <li><b>Drop-in replacements</b> (<code>@expo/ui/community/*</code>) swap community libs like <code>@gorhom/bottom-sheet</code> by import path.</li>
        <li>Prefer <b>native navigators</b> (UINavigationController / Fragment) and <b>Pressable</b> over Touchables; <code>List</code> isn't for large datasets.</li>
        <li>Guard JSX: never <code>{count &amp;&amp; …}</code> when <code>count</code> can be <code>0</code> — use a ternary.</li>
      </ul>
      <div class="callout tip"><span class="lbl">New concept</span> The <b>universal-first ladder</b>: reach for the cross-platform layer before writing two platform trees — you only pay the <code>.ios</code>/<code>.android</code> split when you must.</div>
      <div class="map"><span class="lbl">Your proof</span> You did <b>PSPDFKit native integration and native permission hooks</b> — you already bridge to native. <code>@expo/ui</code> is that same instinct with far less glue, straight from React.</div>`,
  },
  {
    id: "st-23",
    num: "23",
    title: "23 · Data fetching, caching & offline",
    html: `<p><b>Core:</b> wrap <code>fetch</code> with a status check, typed errors, and exponential-backoff retry. For real apps, reach for <b>React Query</b>: <code>staleTime</code> controls cache freshness, identical <code>queryKey</code>s dedupe in-flight requests, and mutations refresh data via <code>invalidateQueries</code> (with optimistic updates rolled back on error).</p>
      <ul>
        <li><b>Server vs client state</b>: React Query / SWR own the <i>server</i> cache; Zustand / MobX own <i>client</i> state — don't mix them.</li>
        <li><b>Offline-aware</b>: wire React Query's <code>onlineManager</code> to <b>NetInfo</b> so queries pause offline and resume on reconnect.</li>
        <li><b>Tokens</b>: store in <code>expo-secure-store</code> (Keychain/Keystore), never AsyncStorage; use a single-flight refresh flow.</li>
        <li><b>Config</b>: only <code>EXPO_PUBLIC_</code> vars reach the bundle (inlined at build time) — never put secrets there.</li>
        <li><b>Waterfalls</b>: run independent calls with <code>Promise.all</code>; cancel stale ones with <code>AbortController</code>.</li>
      </ul>
      <div class="callout tip"><span class="lbl">New concept</span> Treat the network boundary as <b>untrusted</b>: check <code>response.ok</code>, type your errors, and validate shapes — types vanish at runtime.</div>
      <div class="map"><span class="lbl">Your proof</span> You built <b>AppSync GraphQL</b> at Novacomp and shipped <b>React Query / SWR with optimistic updates</b> plus version-based cache invalidation on Valt — this card is your daily work, framed in interview language.</div>`,
  },
];
