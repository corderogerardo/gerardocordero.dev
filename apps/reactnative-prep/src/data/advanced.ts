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
      "ScrollView mounts <b>every</b> child up front. FlatList/FlashList <b>virtualize</b> — only visible rows render — and FlashList <b>recycles</b> row views instead of mounting/unmounting. A heavy list can go from ~3fps on a ScrollView to 60fps on a recycling list. Note: FlashList <b>v2</b> auto-measures, so <code>estimatedItemSize</code> is deprecated.",
  },
  {
    id: "sk-perf-2",
    category: "perf",
    categoryLabel: "PERF",
    question: "What is the React Compiler and what does it replace?",
    answerHtml:
      "A build-time (Babel) compiler that <b>automatically memoizes</b> components and values, letting you drop most manual <code>memo</code> / <code>useMemo</code> / <code>useCallback</code>. It needs code that follows the <b>Rules of React</b> (run <code>react-compiler-healthcheck</code> first) and works on RN 0.76+ / Expo SDK 52+ (React 19 recommended).",
  },
  {
    id: "sk-perf-3",
    category: "perf",
    categoryLabel: "PERF",
    question: "How do useDeferredValue and useTransition improve responsiveness?",
    answerHtml:
      "Concurrent React lets updates be <b>paused, interrupted, or abandoned</b>. <code>useDeferredValue</code> renders an expensive view from a lagging copy of a value so typing stays responsive; <code>useTransition</code> / <code>startTransition</code> marks updates non-urgent so user input wins. Requires the New Architecture (default 0.76+).",
  },
  {
    id: "sk-perf-4",
    category: "perf",
    categoryLabel: "PERF",
    question: "Why do Reanimated animations stay smooth when the JS thread is busy?",
    answerHtml:
      "They run in <b>worklets on the UI thread</b> — <code>useSharedValue</code> holds the value, <code>useAnimatedStyle</code> maps it, <code>withTiming</code> / <code>withSpring</code> drive it — so frames hit 60fps even while JS is blocked. The old <code>Animated</code> API drives from the JS thread and stutters. Reanimated 4 needs the New Architecture + the worklets Babel plugin (added last).",
  },
  {
    id: "sk-perf-5",
    category: "perf",
    categoryLabel: "PERF",
    question: "Which properties are cheap to animate, and which are expensive?",
    answerHtml:
      "Animate <b>transform</b> (scale/translate) and <b>opacity</b> — GPU-composited, no layout. Avoid animating <code>width</code>, <code>height</code>, <code>top</code>, <code>left</code>, <code>margin</code>, <code>padding</code>: each frame triggers a <b>layout recalculation</b>. e.g. collapse a panel with <code>scaleY</code>, not <code>height</code>.",
  },
  {
    id: "sk-perf-6",
    category: "perf",
    categoryLabel: "PERF",
    question: "On which thread do sync vs async Turbo Module methods run?",
    answerHtml:
      "<b>Sync</b> methods run on — and block — the <b>JS thread</b>; keep them under <b>16ms</b> or you drop frames. <b>Async</b> methods run on the native-modules thread (<code>mqt_v_native</code>). Prefer async for anything non-trivial; reserve sync for tiny instant reads.",
  },
  {
    id: "sk-perf-7",
    category: "perf",
    categoryLabel: "PERF",
    question: "How does disabling Android JS-bundle compression speed up startup?",
    answerHtml:
      "Compressed bundles can't be <b>memory-mapped</b>. Uncompressed, Hermes <code>mmap</code>s the bytecode and the OS pages in only what's used — faster TTI, lower memory. Set <code>androidResources { noCompress += [&quot;bundle&quot;] }</code>. It's the default in RN 0.79+ (only needed on ≤ 0.78).",
  },
  {
    id: "sk-perf-8",
    category: "perf",
    categoryLabel: "PERF",
    question: "Why avoid barrel imports (index.ts re-exports) in a bundle?",
    answerHtml:
      "Importing <code>{ Button } from './components'</code> pulls in <b>every</b> export of the barrel — defeating tree-shaking, bloating the bundle, slowing module evaluation (worse TTI), and inviting circular-dependency / HMR issues. Import from source: <code>./components/Button</code>.",
  },
  {
    id: "sk-perf-9",
    category: "perf",
    categoryLabel: "PERF",
    question: "Why is defining a component inside another component a bug?",
    answerHtml:
      "It creates a <b>new component type on every render</b>, so React <b>fully remounts</b> it — destroying its state and DOM and tanking performance. Move it out and pass props instead of closing over parent variables.",
  },
  {
    id: "sk-perf-10",
    category: "perf",
    categoryLabel: "PERF",
    question: "How do functional setState updates prevent stale closures?",
    answerHtml:
      "<code>setItems(prev =&gt; [...prev, x])</code> reads the latest value at update time, so the callback doesn't need <code>items</code> in its deps — giving a <b>stable</b> reference and avoiding stale reads from a captured old value.",
  },
  {
    id: "sk-perf-11",
    category: "perf",
    categoryLabel: "PERF",
    question: "Why prefer expo-image over React Native's Image?",
    answerHtml:
      "<code>expo-image</code> adds memory-efficient <b>caching</b>, <b>blurhash</b> placeholders, progressive loading, and better list performance — and images are the biggest native-memory cost. Drop-in: <code>import { Image } from 'expo-image'</code>.",
  },
  {
    id: "sk-perf-12",
    category: "perf",
    categoryLabel: "PERF",
    question:
      "Why use GestureDetector + Gesture.Tap() for press animations instead of Pressable's onPressIn/Out?",
    answerHtml:
      "Gesture Handler callbacks run as <b>worklets on the UI thread</b>, so a press scale/opacity animates with <b>no JS-thread round-trip</b> — smoother than Pressable's JS-thread <code>onPressIn</code> / <code>onPressOut</code>.",
  },
  {
    id: "sk-perf-13",
    category: "perf",
    categoryLabel: "PERF",
    question: "Why avoid creating inline objects inside a list's renderItem?",
    answerHtml:
      "A new object literal is a <b>new reference every render</b>, which breaks <code>memo</code> on the row and forces it to re-render. Pass <b>primitives</b> straight off <code>item</code> (e.g. <code>id</code>, <code>name</code>) instead of building <code>{{ ... }}</code> in <code>renderItem</code>.",
  },

  // ---------- Native UI (nativeui) ----------
  {
    id: "sk-ui-1",
    category: "nativeui",
    categoryLabel: "UI",
    question: "What does @expo/ui render, and what is Host?",
    answerHtml:
      "<code>@expo/ui</code> renders <b>real native UI from React</b>: SwiftUI on iOS, Jetpack Compose on Android (react-native-web on web). Its <b>universal</b> components (SDK 56+) are one tree for all three. Every <code>@expo/ui</code> tree must be wrapped in <code>&lt;Host&gt;</code>.",
  },
  {
    id: "sk-ui-2",
    category: "nativeui",
    categoryLabel: "UI",
    question:
      "When do you drop from @expo/ui universal components to the platform-specific layer?",
    answerHtml:
      "Start with <b>universal</b> components (one tree, no file split). Drop to <code>@expo/ui/swift-ui</code> or <code>@expo/ui/jetpack-compose</code> <b>only</b> when the universal API lacks a component, modifier, or behavior you need — accepting the <code>.ios.tsx</code> / <code>.android.tsx</code> split (two trees to maintain).",
  },
  {
    id: "sk-ui-3",
    category: "nativeui",
    categoryLabel: "UI",
    question: "Why is @expo/ui's TextInput different, and what makes it flicker-free?",
    answerHtml:
      "Its <code>value</code> takes an <code>ObservableState</code> from <code>useNativeState</code>, not a string. On typing, <code>onChangeText</code> runs as a <b>worklet on the UI thread</b> and writes <code>value</code> directly with <b>no React render</b> — synchronous, flicker-free masking/formatting. Requires <code>react-native-worklets</code>.",
  },
  {
    id: "sk-ui-4",
    category: "nativeui",
    categoryLabel: "UI",
    question: "What are @expo/ui drop-in replacements?",
    answerHtml:
      "API-compatible swaps for popular RN community libraries, backed by native SwiftUI/Compose — e.g. <code>@expo/ui/community/bottom-sheet</code> for <code>@gorhom/bottom-sheet</code>, plus <code>datetime-picker</code>, <code>picker</code>, <code>segmented-control</code>, and more. Migration is usually just the import path.",
  },
  {
    id: "sk-ui-5",
    category: "nativeui",
    categoryLabel: "UI",
    question: "Why prefer native navigators over JS-based ones?",
    answerHtml:
      "Native stack (<code>@react-navigation/native-stack</code> / expo-router's default) uses <b>UINavigationController</b> (iOS) and <b>Fragment</b> (Android); native tabs likewise. You get platform-correct gestures, transitions, and performance that the JS <code>@react-navigation/stack</code> can't match.",
  },
  {
    id: "sk-ui-6",
    category: "nativeui",
    categoryLabel: "UI",
    question: "Why can `{count && <Text>…</Text>}` crash a React Native app?",
    answerHtml:
      "If <code>count</code> is <code>0</code> (or a string is <code>&quot;&quot;</code>), <code>&amp;&amp;</code> returns that falsy-but-renderable value and RN tries to render a raw number/string <b>outside a <code>&lt;Text&gt;</code></b> → hard crash in production. Use a ternary: <code>count ? &lt;Text&gt;…&lt;/Text&gt; : null</code>.",
  },
  {
    id: "sk-ui-7",
    category: "nativeui",
    categoryLabel: "UI",
    question: "Why is @expo/ui's List not for large datasets?",
    answerHtml:
      "Each <code>ListItem</code> is a JSX node processed on the <b>JS thread</b>, so large datasets slow noticeably. Use a virtualized/recycling list (FlashList) for big collections; reserve <code>List</code> for short, mostly-static content.",
  },
  {
    id: "sk-ui-8",
    category: "nativeui",
    categoryLabel: "UI",
    question: "Pressable vs TouchableOpacity — which, and why?",
    answerHtml:
      "Use <b>Pressable</b> (from react-native or gesture-handler). It's the modern, more flexible press API — press states, hit slop, ripple — that replaces the legacy <code>TouchableOpacity</code> / <code>TouchableHighlight</code>.",
  },

  // ---------- Data & Networking (data) ----------
  {
    id: "sk-data-1",
    category: "data",
    categoryLabel: "DATA",
    question: "What does React Query's staleTime control, and why set it?",
    answerHtml:
      "<code>staleTime</code> is how long cached data is treated as <b>fresh</b> — within it, React Query serves cache and skips refetching (e.g. <code>1000 * 60 * 5</code> = 5 min). It's the main caching knob, alongside automatic <b>deduplication</b> of identical in-flight queries by <code>queryKey</code>.",
  },
  {
    id: "sk-data-2",
    category: "data",
    categoryLabel: "DATA",
    question: "After a mutation, how do you refresh the affected React Query data?",
    answerHtml:
      "In the mutation's <code>onSuccess</code>, call <code>queryClient.invalidateQueries({ queryKey: ['users'] })</code> to mark those queries stale and refetch. For instant UI, apply an <b>optimistic</b> update and roll back in <code>onError</code>.",
  },
  {
    id: "sk-data-3",
    category: "data",
    categoryLabel: "DATA",
    question: "How do you make React Query offline-aware in React Native?",
    answerHtml:
      "Wire its <code>onlineManager</code> to <b>NetInfo</b>: <code>onlineManager.setEventListener(setOnline =&gt; NetInfo.addEventListener(s =&gt; setOnline(s.isConnected)))</code>. Queries then pause when offline and resume on reconnect; add query persistence for an offline-first cache.",
  },
  {
    id: "sk-data-4",
    category: "data",
    categoryLabel: "DATA",
    question: "Where do auth tokens belong in an Expo app — and where do they NOT?",
    answerHtml:
      "In the <b>Keychain/Keystore</b> via <code>expo-secure-store</code> — <i>not</i> <code>AsyncStorage</code> (plaintext). Wrap fetch to attach <code>Authorization: Bearer</code>, and use a single-flight <b>refresh</b> flow so concurrent 401s share one refresh promise.",
  },
  {
    id: "sk-data-5",
    category: "data",
    categoryLabel: "DATA",
    question: "What's the rule for EXPO_PUBLIC_ environment variables?",
    answerHtml:
      "Only vars prefixed <code>EXPO_PUBLIC_</code> reach the app bundle, and they're <b>inlined at build time</b> (restart the dev server after editing <code>.env</code>). They're visible in the shipped app — <b>never put secrets there</b>; keep secret keys in non-prefixed vars used only in server/API routes.",
  },
  {
    id: "sk-data-6",
    category: "data",
    categoryLabel: "DATA",
    question: "Why does Promise.all matter for data fetching?",
    answerHtml:
      "Independent awaits run <b>sequentially</b> — a waterfall of round-trips. <code>Promise.all([a(), b(), c()])</code> runs them <b>concurrently</b>, collapsing latency to the slowest single call (often a 2–10× win). Only serialize when one call truly depends on another.",
  },
  {
    id: "sk-data-7",
    category: "data",
    categoryLabel: "DATA",
    question: "What does React's cache() (or SWR) dedupe, and at what scope?",
    answerHtml:
      "Server <code>cache()</code> dedupes a function (e.g. <code>auth()</code>, a DB query) <b>within one request</b> — many callers, one execution. On the client, <b>SWR</b> / React Query dedupe identical requests <b>across component instances</b> and add caching + revalidation, so ten components mounting share one fetch.",
  },
  {
    id: "sk-data-8",
    category: "data",
    categoryLabel: "DATA",
    question: "Why cancel fetches with AbortController?",
    answerHtml:
      "On unmount or a new query, abort the in-flight request (<code>fetch(url, { signal })</code> + <code>controller.abort()</code>) to avoid setting state on an unmounted component, racing a stale response, and wasting bandwidth. React Query does this automatically.",
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
      "FlashList <b>virtualizes and recycles</b> row views; a ScrollView mounts all 10k children up front, which janks and spikes memory.",
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
      "<code>transform</code> and <code>opacity</code> composite on the GPU without layout; the others trigger a layout recalculation every frame.",
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
      "It auto-memoizes so you can drop most manual <code>memo</code> / <code>useMemo</code> / <code>useCallback</code> — for code that follows the Rules of React.",
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
      "Sync methods execute on (and block) the <b>JS thread</b>; exceed a frame budget and you drop frames. Prefer async for non-trivial work.",
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
      "One React tree renders to <b>SwiftUI</b> on iOS and <b>Jetpack Compose</b> on Android (and react-native-web on web), wrapped in <code>&lt;Host&gt;</code>.",
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
      "When <code>length</code> is <code>0</code>, <code>&amp;&amp;</code> yields <code>0</code>, which RN renders as a bare number outside a <code>&lt;Text&gt;</code> → crash. Use a ternary.",
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
      "Within <code>staleTime</code>, React Query serves cache and skips refetching — the main caching knob, alongside <code>queryKey</code> deduplication.",
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
      "<code>expo-secure-store</code> uses the iOS Keychain / Android Keystore. <code>AsyncStorage</code> is plaintext, and the JS bundle ships to the device.",
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
      "<code>Promise.all</code> runs them concurrently, collapsing latency to the slowest single call instead of summing three round-trips.",
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
