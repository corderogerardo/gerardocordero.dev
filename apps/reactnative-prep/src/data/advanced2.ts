// Batch 2 — authored from the Callstack RN-optimization deep-dives
// (react-native-best-practices) and the Expo Router / native-UI skill
// (building-native-ui).
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

/** New flashcard category this batch adds (perf already exists). */
export const ADVANCED2_FLASHCARD_FILTERS: { value: string; label: string }[] = [
  { value: "expo", label: "Expo & Tooling" },
];

export const ADVANCED2_FLASHCARDS: Flashcard[] = [
  // ---------- Performance deep-dives (Callstack) ----------
  {
    id: "cs-perf-1",
    category: "perf",
    categoryLabel: "PERF",
    question: "What's the most common JS memory leak in React Native, and the fix?",
    answerHtml:
      "Subscriptions / timers / listeners that are never cleaned up. Return a cleanup from <code>useEffect</code>: <code>const sub = emitter.addListener(...); return () =&gt; sub.remove();</code>. A tell-tale sign is memory climbing each time you navigate between screens. Hunt it with the React Native DevTools memory profiler.",
  },
  {
    id: "cs-perf-2",
    category: "perf",
    categoryLabel: "PERF",
    question: "How should a heavy Turbo Module method avoid blocking the app?",
    answerHtml:
      "Never do heavy work in a <b>sync</b> method — it blocks the JS thread. Make it <b>async</b> and run on a background thread, e.g. iOS <code>DispatchQueue.global().async { resolve(self.compute()) }</code> with resolve/reject. Reserve sync for tiny, instant reads.",
  },
  {
    id: "cs-perf-3",
    category: "perf",
    categoryLabel: "PERF",
    question: "Name JS libraries worth replacing with native ones, and why.",
    answerHtml:
      "Drop <code>@formatjs</code> Intl polyfills (~430KB) — <b>Hermes ships native Intl</b> (audit your exact APIs first). Swap <code>crypto-js</code> for <code>react-native-quick-crypto</code> (~58× faster, JSI-backed). And use <code>native-stack</code> over the JS <code>@react-navigation/stack</code>.",
  },
  {
    id: "cs-perf-4",
    category: "perf",
    categoryLabel: "PERF",
    question: "How do you enable tree-shaking in a modern Expo app?",
    answerHtml:
      "On Expo SDK 52+, set <code>EXPO_UNSTABLE_TREE_SHAKING=1</code> and <code>EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH=1</code> (with <code>experimentalImportSupport</code>). It eliminates dead exports — the real payoff that makes avoiding barrel imports matter.",
  },
  {
    id: "cs-perf-5",
    category: "perf",
    categoryLabel: "PERF",
    question: "What does enabling R8 do for an Android release build?",
    answerHtml:
      "R8 <b>shrinks, optimizes, and obfuscates</b> Java/Kotlin native code. Turn on <code>minifyEnabled true</code> + <code>shrinkResources true</code> in the release buildType — smaller AAB and a bit of obfuscation for free.",
  },
  {
    id: "cs-perf-6",
    category: "perf",
    categoryLabel: "PERF",
    question: "How do atomic stores (Zustand/Jotai) cut re-renders vs Context?",
    answerHtml:
      "A React <b>Context</b> re-renders <b>every</b> consumer on any change. Zustand/Jotai use <b>selector subscriptions</b> — <code>useStore(s =&gt; s.filter)</code> re-renders only when that slice changes — avoiding widespread re-renders without manual memoization.",
  },
  {
    id: "cs-perf-7",
    category: "perf",
    categoryLabel: "PERF",
    question: "When can a controlled TextInput flicker, and what's the fix?",
    answerHtml:
      "On the <b>legacy architecture</b>, the JS↔native round-trip for <code>value</code> can drop fast keystrokes or show stale characters. Use the <b>uncontrolled</b> form — <code>defaultValue</code> + <code>onChangeText</code> — so native owns the text and stays responsive.",
  },
  {
    id: "cs-perf-8",
    category: "perf",
    categoryLabel: "PERF",
    question: "What is view flattening, and when do you opt out?",
    answerHtml:
      "RN's renderer removes <b>layout-only</b> views to shrink the native hierarchy. That can break a native component that counts its children. Force the view to survive with <code>collapsable={false}</code> on those children.",
  },
  {
    id: "cs-perf-9",
    category: "perf",
    categoryLabel: "PERF",
    question: "What is the Android 16 KB page-size requirement?",
    answerHtml:
      "Google Play requires apps targeting Android 15+ to support <b>16 KB memory pages</b> (deadline Nov 1, 2025). RN supports it since 0.79; the risk is <b>third-party native libraries</b> (<code>.so</code> files) that aren't aligned. Verify with <code>zipalign -c -P 16 …</code>.",
  },
  {
    id: "cs-perf-10",
    category: "perf",
    categoryLabel: "PERF",
    question: "How do you keep a bottom sheet at 60fps during a drag?",
    answerHtml:
      "Keep the gesture/scroll state on the <b>UI thread</b>. Bind <code>@gorhom/bottom-sheet</code>'s <code>animatedIndex</code> to a <code>useSharedValue</code> and drive overlays with <code>useAnimatedStyle</code> — instead of an <code>onAnimate</code> callback that <code>setState</code>s and re-renders the whole subtree each frame.",
  },
  {
    id: "cs-perf-11",
    category: "perf",
    categoryLabel: "PERF",
    question: "How do you measure TTI, and which launches count?",
    answerHtml:
      "Mark interactivity with <code>react-native-performance</code> (<code>performance.mark('screenInteractive')</code>) and compare across releases. Only measure <b>cold starts</b> — exclude warm/hot/prewarmed launches, which don't reflect first-run cost.",
  },
  {
    id: "cs-perf-12",
    category: "perf",
    categoryLabel: "PERF",
    question: "When does code splitting (React.lazy / Re.Pack) actually help RN?",
    answerHtml:
      "Lazy-load rarely-used screens with <code>React.lazy(() =&gt; import(...))</code> + <code>&lt;Suspense&gt;</code>, or remote chunks via Re.Pack. It helps most <b>without Hermes</b> (JSC/V8 pay a parse cost); with Hermes' mmap'd bytecode the win shrinks — so measure first.",
  },

  // ---------- Expo Router & native UI (building-native-ui) ----------
  {
    id: "ex-1",
    category: "expo",
    categoryLabel: "EXPO",
    question: "When can you stay in Expo Go vs needing a custom dev build?",
    answerHtml:
      "Expo Go covers all <code>expo-*</code> packages, Expo Router, Reanimated, gestures, push, and deep links. You need a <b>custom dev build</b> (or EAS build) only for <b>local native modules</b>, Apple targets (widgets/clips), third-party native modules not in Expo Go, or native config you can't express in <code>app.json</code>.",
  },
  {
    id: "ex-2",
    category: "expo",
    categoryLabel: "EXPO",
    question: "How does Expo Router structure routes?",
    answerHtml:
      "<b>File-based</b>: files in <code>app/</code> are routes; <code>_layout.tsx</code> defines the Stack/Tabs for a folder; groups like <code>(index,search)</code> share screens. Rules: there must be a route matching <code>/</code>, and you <b>never co-locate</b> components/utils inside <code>app/</code>.",
  },
  {
    id: "ex-3",
    category: "expo",
    categoryLabel: "EXPO",
    question:
      "Which RN core components/APIs should you avoid in modern Expo, and what replaces them?",
    answerHtml:
      "Avoid the removed/legacy <code>SafeAreaView</code>, <code>Picker</code>, <code>WebView</code>, <code>AsyncStorage</code>, and <code>expo-av</code>. Use <code>react-native-safe-area-context</code>, <code>expo-audio</code> / <code>expo-video</code>, <code>expo-image</code>, and <code>process.env.EXPO_OS</code> instead of <code>Platform.OS</code>.",
  },
  {
    id: "ex-4",
    category: "expo",
    categoryLabel: "EXPO",
    question: "What's the modern way to handle safe areas in a scrollable screen?",
    answerHtml:
      "Put a <code>ScrollView</code> (or FlatList) first in the route with <code>contentInsetAdjustmentBehavior=&quot;automatic&quot;</code> — it computes smarter insets than wrapping in <code>SafeAreaView</code>, and pairs with native stack headers/tabs.",
  },
  {
    id: "ex-5",
    category: "expo",
    categoryLabel: "EXPO",
    question: "Dimensions.get() vs useWindowDimensions — which and why?",
    answerHtml:
      "Prefer <b><code>useWindowDimensions</code></b>: it's a hook that re-renders on rotation / resize / split-view, so layouts stay correct. <code>Dimensions.get()</code> is a one-shot read that goes stale. Better still, lay out with <b>flexbox</b> instead of measuring.",
  },
  {
    id: "ex-6",
    category: "expo",
    categoryLabel: "EXPO",
    question: "How should you do shadows in modern React Native?",
    answerHtml:
      "Use the CSS <code>boxShadow</code> style prop (<code>'0 1px 2px rgba(0,0,0,0.05)'</code>, inset supported) — <b>not</b> legacy iOS <code>shadow*</code> props or Android <code>elevation</code>. Use <code>borderCurve: 'continuous'</code> for Apple-style rounded corners.",
  },
  {
    id: "ex-7",
    category: "expo",
    categoryLabel: "EXPO",
    question: "How do you add a native context menu / preview to an Expo Router Link?",
    answerHtml:
      "Wrap with <code>&lt;Link.Trigger&gt;</code> and add <code>&lt;Link.Menu&gt;</code> containing <code>&lt;Link.MenuAction title icon onPress destructive /&gt;</code>, plus <code>&lt;Link.Preview /&gt;</code> for the iOS peek. It's the real native long-press menu, not a custom JS popover.",
  },
  {
    id: "ex-8",
    category: "expo",
    categoryLabel: "EXPO",
    question: "How do you present a screen as a modal or form sheet in Expo Router?",
    answerHtml:
      "In the Stack, set <code>options={{ presentation: 'modal' }}</code> or <code>'formSheet'</code> (with <code>sheetAllowedDetents</code>, <code>sheetGrabberVisible</code>). Prefer this native presentation over building a custom modal component.",
  },
  {
    id: "ex-9",
    category: "expo",
    categoryLabel: "EXPO",
    question: "What are NativeTabs in Expo Router?",
    answerHtml:
      "<code>NativeTabs</code> (from <code>expo-router/unstable-native-tabs</code>) render the <b>platform-native</b> tab bar (UITabBar / Android tabs) using <code>&lt;NativeTabs.Trigger&gt;</code> + <code>&lt;Icon sf=&quot;…&quot;/&gt;</code> + <code>&lt;Label/&gt;</code> — better feel than JS bottom-tabs, and they support a <code>role=&quot;search&quot;</code> tab.",
  },
  {
    id: "ex-10",
    category: "expo",
    categoryLabel: "EXPO",
    question: "How do you render SF Symbols and set a screen title the idiomatic way?",
    answerHtml:
      "SF Symbols via <code>expo-image</code> with <code>source=&quot;sf:square.and.arrow.up&quot;</code> (not <code>@expo/vector-icons</code>). Set the title through the navigator — <code>&lt;Stack.Screen options={{ title: 'Home' }} /&gt;</code> — rather than a custom header <code>Text</code>.",
  },
];

/** New quiz category this batch adds. */
export const ADVANCED2_QUIZ_FILTERS: { value: string; label: string }[] = [
  { value: "expo", label: "Expo" },
];

export const ADVANCED2_QUIZ: QuizQuestion[] = [
  {
    id: "b2-z1",
    category: "perf",
    categoryLabel: "Performance",
    question: "A heavy native (Turbo Module) computation should run…",
    options: [
      "synchronously, blocking the JS thread",
      "asynchronously on a background thread",
      "on the UI/main thread",
      "in a JavaScript Web Worker",
    ],
    answer: 1,
    explanationHtml:
      "Sync methods block the JS thread. Make it async and offload to a background thread (e.g. <code>DispatchQueue.global().async</code>), then resolve.",
  },
  {
    id: "b2-z2",
    category: "perf",
    categoryLabel: "Performance",
    question: "Why might you remove the @formatjs Intl polyfills?",
    options: [
      "They're a security risk",
      "Hermes provides Intl natively (~430KB saved)",
      "React deprecated them",
      "They break TypeScript",
    ],
    answer: 1,
    explanationHtml:
      "Hermes ships native <code>Intl</code> support, so the polyfills are often dead weight (~430KB). Audit the exact APIs you use before dropping them.",
  },
  {
    id: "b2-z3",
    category: "perf",
    categoryLabel: "Performance",
    question: "When a React Context value changes, which consumers re-render?",
    options: [
      "Only those reading the changed field",
      "All consumers of the context",
      "None until you call forceUpdate",
      "A random subset",
    ],
    answer: 1,
    explanationHtml:
      "Context re-renders <b>every</b> consumer. Atomic stores (Zustand/Jotai) with selector subscriptions re-render only the components reading the changed slice.",
  },
  {
    id: "b2-z4",
    category: "perf",
    categoryLabel: "Performance",
    question: "How do you stop a native child view from being flattened away?",
    options: [
      "Give it a key prop",
      "Set collapsable={false}",
      "Enable removeClippedSubviews",
      "Set shouldRasterizeIOS",
    ],
    answer: 1,
    explanationHtml:
      "RN flattens layout-only views; <code>collapsable={false}</code> forces the view to persist so native components that count children still work.",
  },
  {
    id: "b2-z5",
    category: "expo",
    categoryLabel: "Expo",
    question: "You need a local native module. Can you run in Expo Go?",
    options: [
      "Yes, always",
      "No — you need a custom dev build or EAS build",
      "Only on Android",
      "Only with a config plugin",
    ],
    answer: 1,
    explanationHtml:
      "Expo Go can't load custom native code. Local modules, Apple targets, and unsupported third-party native modules require a custom dev/EAS build.",
  },
  {
    id: "b2-z6",
    category: "expo",
    categoryLabel: "Expo",
    question: "Best way to handle safe areas in a scrollable screen?",
    options: [
      "Wrap everything in SafeAreaView",
      "ScrollView with contentInsetAdjustmentBehavior=\"automatic\"",
      "Hard-code insets from Dimensions",
      "Add manual top/bottom padding",
    ],
    answer: 1,
    explanationHtml:
      "A first-child ScrollView/FlatList with <code>contentInsetAdjustmentBehavior=&quot;automatic&quot;</code> computes smarter insets and pairs with native headers/tabs.",
  },
  {
    id: "b2-z7",
    category: "expo",
    categoryLabel: "Expo",
    question: "For responsive layout that survives rotation, use…",
    options: [
      "Dimensions.get('window')",
      "useWindowDimensions",
      "PixelRatio.get()",
      "a fixed pixel width",
    ],
    answer: 1,
    explanationHtml:
      "<code>useWindowDimensions</code> is a hook that re-renders on resize/rotation; <code>Dimensions.get()</code> is a one-shot read that goes stale.",
  },
  {
    id: "b2-z8",
    category: "expo",
    categoryLabel: "Expo",
    question: "Modern shadows in React Native use…",
    options: [
      "shadowOffset / shadowRadius",
      "the CSS boxShadow style prop",
      "Android elevation",
      "a third-party shadow library",
    ],
    answer: 1,
    explanationHtml:
      "Use the CSS <code>boxShadow</code> style prop (inset supported) instead of the legacy iOS shadow props or Android <code>elevation</code>.",
  },
];

/** New study sessions for batch 2. */
export const ADVANCED2_STUDY: StudySection[] = [
  {
    id: "st-24",
    num: "24",
    title: "24 · Memory, native modules & bundle size",
    html: `<p><b>Core:</b> the senior levers below the JS layer. Hunt <b>JS memory leaks</b> by always cleaning up listeners/timers in a <code>useEffect</code> return (memory climbing per screen navigation is the tell). Build <b>Turbo Modules</b> that offload heavy work to a <b>background thread</b> and stay async. And shrink the app: tree-shaking, R8, and replacing JS with native.</p>
      <ul>
        <li><b>Native over JS</b>: Hermes has native <code>Intl</code> (drop ~430KB of polyfills), <code>react-native-quick-crypto</code> is ~58× faster than <code>crypto-js</code>, and <code>native-stack</code> beats the JS stack.</li>
        <li><b>Bundle</b>: enable tree-shaking (Expo SDK 52+ flags) and <b>R8</b> (<code>minifyEnabled</code> + <code>shrinkResources</code>); lazy-load rare screens with <code>React.lazy</code> + <code>Suspense</code>.</li>
        <li><b>State</b>: atomic stores (Zustand/Jotai) with selectors beat Context's re-render-everyone; uncontrolled <code>TextInput</code> (<code>defaultValue</code>) avoids legacy-arch flicker.</li>
        <li><b>Gotchas</b>: <code>collapsable={false}</code> stops view flattening; ship the <b>Android 16KB</b> page alignment (Play deadline Nov 2025, third-party <code>.so</code> files).</li>
      </ul>
      <div class="callout tip"><span class="lbl">New concept</span> The <b>native-over-JS lever</b>: when a JS library is heavy or slow, a native/JSI equivalent often pays for itself in bundle size <i>and</i> speed — measure both.</div>
      <div class="map"><span class="lbl">Your proof</span> You shipped <b>PSPDFKit native patches</b> and native permission hooks, drove a <b>Hermes rollout</b>, and worked a <b>Turborepo monorepo</b> — you already operate at this layer; now you can name each lever.</div>`,
  },
  {
    id: "st-25",
    num: "25",
    title: "25 · Expo Router & native UI patterns",
    html: `<p><b>Core:</b> modern Expo leans hard on the platform. Routing is <b>file-based</b> (<code>app/</code> + <code>_layout.tsx</code>, shared group routes, always a <code>/</code> route, never co-locate non-routes). Stay in <b>Expo Go</b> until you genuinely need a custom dev build (local native modules, Apple targets, unsupported native deps).</p>
      <ul>
        <li><b>Library defaults</b>: <code>expo-image</code>, <code>expo-audio</code>/<code>expo-video</code> (not <code>expo-av</code>), <code>react-native-safe-area-context</code>, <code>process.env.EXPO_OS</code>.</li>
        <li><b>Responsiveness</b>: a first-child <code>ScrollView</code> with <code>contentInsetAdjustmentBehavior=&quot;automatic&quot;</code>, <code>useWindowDimensions</code> over <code>Dimensions.get()</code>, flexbox over measuring.</li>
        <li><b>Styling</b>: CSS <code>boxShadow</code> (not legacy shadow/elevation), flex <code>gap</code> over margins, <code>borderCurve: 'continuous'</code>.</li>
        <li><b>Native nav UX</b>: <code>Link.Preview</code> + <code>Link.Menu</code> context menus, <code>presentation: 'modal' | 'formSheet'</code>, <code>NativeTabs</code>, SF Symbols via <code>expo-image</code> <code>sf:</code>.</li>
      </ul>
      <div class="callout tip"><span class="lbl">New concept</span> <b>Lean on the platform</b>: reach for native presentation, native tabs, and native menus before hand-rolling JS equivalents — you get correct gestures and feel for free.</div>
      <div class="map"><span class="lbl">Your proof</span> You wired <b>universal/deep-link handling</b> and owned app IDs and associated domains on Valt — native routing and platform conventions are already how you think about navigation.</div>`,
  },
];
