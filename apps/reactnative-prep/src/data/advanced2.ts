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
      "On React Native, memory leaks are almost always JS-side, not native — a subscription, timer, or event listener that outlives its screen keeps its closure (and everything it references) alive, so memory climbs every time the user navigates back until the app slows or gets killed. Fix: return a cleanup from <code>useEffect</code>: <code>const sub = emitter.addListener(...); return () =&gt; sub.remove();</code>. Hunt it with the React Native DevTools memory profiler, watching for a step pattern that never comes back down. <b>I always pair a subscription with its cleanup in the same effect, so it can't outlive the component that created it.</b>",
  },
  {
    id: "cs-perf-2",
    category: "perf",
    categoryLabel: "PERF",
    question: "How should a heavy Turbo Module method avoid blocking the app?",
    answerHtml:
      "A synchronous Turbo Module method runs to completion on the JS thread before returning — so heavy work there freezes every touch, animation, and re-render in the app, not just the caller. Make it <b>async</b> and run the work on a background thread, e.g. iOS <code>DispatchQueue.global().async { resolve(self.compute()) }</code> with resolve/reject; reserve sync for tiny, instant reads. <b>If a native method can take more than a millisecond, I make it async — the JS thread has no room to block.</b>",
  },
  {
    id: "cs-perf-3",
    category: "perf",
    categoryLabel: "PERF",
    question: "Name JS libraries worth replacing with native ones, and why.",
    answerHtml:
      "Every pure-JS library you can replace with a native or JSI-backed one cuts both bundle size and runtime cost, since the work moves off the JS thread. Drop <code>@formatjs</code> Intl polyfills (~430KB) — <b>Hermes ships native Intl</b> (audit your exact APIs first). Swap <code>crypto-js</code> for <code>react-native-quick-crypto</code> (~58× faster, JSI-backed). And use <code>native-stack</code> over the JS <code>@react-navigation/stack</code>. <b>My default is: if a JSI-backed or native equivalent exists, prefer it over a pure-JS library.</b>",
  },
  {
    id: "cs-perf-4",
    category: "perf",
    categoryLabel: "PERF",
    question: "How do you enable tree-shaking in a modern Expo app?",
    answerHtml:
      "Tree-shaking matters because bundle size directly drives cold-start and download time — every unused export you ship is pure cost. On Expo SDK 52+, set <code>EXPO_UNSTABLE_TREE_SHAKING=1</code> and <code>EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH=1</code> (with <code>experimentalImportSupport</code>). It eliminates dead exports — the real payoff that makes avoiding barrel imports matter. <b>Tree-shaking is why I avoid barrel-file re-exports in shared packages — they defeat dead-code elimination.</b>",
  },
  {
    id: "cs-perf-5",
    category: "perf",
    categoryLabel: "PERF",
    question: "What does enabling R8 do for an Android release build?",
    answerHtml:
      "Enabling R8 shrinks install size — better conversion on slow connections and less pressure on app-store size limits — and raises the bar against casual reverse-engineering, two wins for one flag. Mechanically, R8 <b>shrinks, optimizes, and obfuscates</b> Java/Kotlin code; turn it on with <code>minifyEnabled true</code> + <code>shrinkResources true</code> in the release buildType. <b>I turn on R8 for every release build — there's no reason to ship an unshrunk, unobfuscated AAB.</b>",
  },
  {
    id: "cs-perf-6",
    category: "perf",
    categoryLabel: "PERF",
    question: "How do atomic stores (Zustand/Jotai) cut re-renders vs Context?",
    answerHtml:
      "Context is a <b>dependency-injection mechanism</b>, not a state manager — every consumer re-renders on any change to the provided value, regardless of which field it reads. Zustand/Jotai are state managers that live outside the render tree and use <b>selector subscriptions</b> — <code>useStore(s =&gt; s.filter)</code> re-renders only when that slice changes — avoiding widespread re-renders without manual memoization. <p><b>Red flag:</b> treating Context as a general-purpose state manager for frequently-changing state — it re-renders the whole subtree on every update, which is exactly the problem selector-based stores solve.</p> <b>I use Context for low-frequency values like theme or locale, and a selector-based store for anything that changes often.</b>",
  },
  {
    id: "cs-perf-7",
    category: "perf",
    categoryLabel: "PERF",
    question: "When can a controlled TextInput flicker, and what's the fix?",
    answerHtml:
      "A controlled <code>TextInput</code> ties every keystroke to a JS round-trip before the character appears — on the <b>legacy architecture</b> that round-trip can drop fast keystrokes or briefly show stale text, which reads to the user as a broken, laggy input. Use the <b>uncontrolled</b> form — <code>defaultValue</code> + <code>onChangeText</code> — so native owns the text buffer and stays responsive regardless of JS thread load. <b>For text inputs I default to uncontrolled with onChangeText, and only go controlled when I actually need to transform or validate the value as it's typed.</b>",
  },
  {
    id: "cs-perf-8",
    category: "perf",
    categoryLabel: "PERF",
    question: "What is view flattening, and when do you opt out?",
    answerHtml:
      "View flattening is a perf optimization — RN's renderer removes <b>layout-only</b> views to keep the native view hierarchy smaller and layout faster. The trade-off shows up when a native component counts or measures its children directly: a flattened view disappears from that count. Force the view to survive with <code>collapsable={false}</code> on those specific children. <b>If a native component's children count looks wrong, my first check is whether view flattening removed one.</b>",
  },
  {
    id: "cs-perf-9",
    category: "perf",
    categoryLabel: "PERF",
    question: "What is the Android 16 KB page-size requirement?",
    answerHtml:
      "Miss this and your app can't be updated on Google Play after the deadline — Play requires apps targeting Android 15+ to support <b>16 KB memory pages</b> (deadline Nov 1, 2025). RN itself supports it since 0.79, but the real risk is <b>third-party native libraries</b> (<code>.so</code> files) built without page-size-agnostic alignment. Verify with <code>zipalign -c -P 16 …</code>. <p><b>Red flag:</b> assuming you're covered because your RN version supports 16 KB pages — the failure usually comes from a third-party native dependency, not your own code.</p> <b>Before every release I check every native dependency's .so alignment, not just the RN version.</b>",
  },
  {
    id: "cs-perf-10",
    category: "perf",
    categoryLabel: "PERF",
    question: "How do you keep a bottom sheet at 60fps during a drag?",
    answerHtml:
      "Hitting 60fps during a drag means every frame's work has to finish before the next one is due — bouncing back to JS via <code>setState</code> on each frame blows that budget. Keep the gesture/scroll state on the <b>UI thread</b> instead: bind <code>@gorhom/bottom-sheet</code>'s <code>animatedIndex</code> to a <code>useSharedValue</code> and drive overlays with <code>useAnimatedStyle</code>, rather than an <code>onAnimate</code> callback that <code>setState</code>s and re-renders the whole subtree each frame. <b>Any animation driven by drag needs to live entirely on the UI thread — the moment it round-trips through setState, dropped frames are a when, not an if.</b>",
  },
  {
    id: "cs-perf-11",
    category: "perf",
    categoryLabel: "PERF",
    question: "How do you measure TTI, and which launches count?",
    answerHtml:
      "TTI only means something if you're comparing the same kind of launch release over release — mixing in warm or prewarmed launches hides regressions behind faster numbers. Mark interactivity with <code>react-native-performance</code> (<code>performance.mark('screenInteractive')</code>) and track it across releases. Only measure <b>cold starts</b> — exclude warm/hot/prewarmed launches, which don't reflect first-run cost. <p><b>Red flag:</b> reporting a TTI average across mixed launch types — a handful of warm launches will make a regressed cold start look fine.</p> <b>I only trust TTI numbers when I know they're cold-start-only.</b>",
  },
  {
    id: "cs-perf-12",
    category: "perf",
    categoryLabel: "PERF",
    question: "When does code splitting (React.lazy / Re.Pack) actually help RN?",
    answerHtml:
      "Code splitting only pays off when there's a real parse cost to defer — lazy-load rarely-used screens with <code>React.lazy(() =&gt; import(...))</code> + <code>&lt;Suspense&gt;</code>, or remote chunks via Re.Pack. It helps most <b>without Hermes</b> (JSC/V8 pay that parse cost upfront); with Hermes' mmap'd bytecode the win shrinks, so measure before committing to the complexity. <b>On Hermes I profile startup before reaching for code splitting — it's not free complexity, and the JS-engine cost it avoids may not be there.</b>",
  },

  // ---------- Expo Router & native UI (building-native-ui) ----------
  {
    id: "ex-1",
    category: "expo",
    categoryLabel: "EXPO",
    question: "When can you stay in Expo Go vs needing a custom dev build?",
    answerHtml:
      "Expo Go's role is a fast-iteration sandbox with a fixed, pre-built set of native modules — great for shipping speed until you need code Expo didn't bundle. It covers all <code>expo-*</code> packages, Expo Router, Reanimated, gestures, push, and deep links. A <b>custom dev build</b> (or EAS build) is your own native binary, needed only for <b>local native modules</b>, Apple targets (widgets/clips), third-party native modules not in Expo Go, or native config you can't express in <code>app.json</code>. <b>I stay in Expo Go until a specific native dependency forces a custom dev build — not before.</b>",
  },
  {
    id: "ex-2",
    category: "expo",
    categoryLabel: "EXPO",
    question: "How does Expo Router structure routes?",
    answerHtml:
      "File-based routing removes an entire class of bugs — a route can't exist in the navigator config but not on disk, because the file <b>is</b> the route. Files in <code>app/</code> are routes; <code>_layout.tsx</code> defines the Stack/Tabs for a folder; groups like <code>(index,search)</code> share screens. Rules: there must be a route matching <code>/</code>, and you <b>never co-locate</b> components/utils inside <code>app/</code> — the router would treat them as routes. <b>Anything that isn't a screen lives outside app/, full stop.</b>",
  },
  {
    id: "ex-3",
    category: "expo",
    categoryLabel: "EXPO",
    question:
      "Which RN core components/APIs should you avoid in modern Expo, and what replaces them?",
    answerHtml:
      "RN core deprecated or dropped several APIs because dedicated packages do the job better — maintained separately, better perf, not tied to the RN release cycle. Avoid the removed/legacy <code>SafeAreaView</code>, <code>Picker</code>, <code>WebView</code>, <code>AsyncStorage</code>, and <code>expo-av</code>. Use <code>react-native-safe-area-context</code>, <code>expo-audio</code> / <code>expo-video</code>, <code>expo-image</code>, and <code>process.env.EXPO_OS</code> instead of <code>Platform.OS</code>. <p><b>Red flag:</b> still importing <code>AsyncStorage</code> or <code>expo-av</code> out of habit in a new Expo project — both are on the way out, and the replacements are drop-in.</p> <b>In a new project I reach for the dedicated package first and only fall back to an RN core API if there isn't one.</b>",
  },
  {
    id: "ex-4",
    category: "expo",
    categoryLabel: "EXPO",
    question: "What's the modern way to handle safe areas in a scrollable screen?",
    answerHtml:
      "Safe-area handling is about not fighting the native header/tab bar for space — get it wrong and content either hides under the notch or has dead padding. Put a <code>ScrollView</code> (or FlatList) first in the route with <code>contentInsetAdjustmentBehavior=&quot;automatic&quot;</code> — it computes smarter insets than wrapping in <code>SafeAreaView</code>, and pairs correctly with native stack headers/tabs. <p><b>Red flag:</b> wrapping the whole screen in <code>SafeAreaView</code> on top of a native stack header — you double up the inset and get extra dead space at the top.</p> <b>My default for a scrollable screen is contentInsetAdjustmentBehavior, not SafeAreaView.</b>",
  },
  {
    id: "ex-5",
    category: "expo",
    categoryLabel: "EXPO",
    question: "Dimensions.get() vs useWindowDimensions — which and why?",
    answerHtml:
      "<code>Dimensions.get()</code>'s role is a one-shot synchronous read — call it once and it goes stale on rotation, split-view, or foldables. <b><code>useWindowDimensions</code></b> is a hook that re-renders on every layout change, so derived sizes stay correct. Better still, lay out with <b>flexbox</b> instead of measuring at all. <p><b>Red flag:</b> caching <code>Dimensions.get('window')</code> in a module-level constant — it freezes your layout at whatever size the app launched with.</p> <b>I only reach for useWindowDimensions when flexbox genuinely can't express the layout.</b>",
  },
  {
    id: "ex-6",
    category: "expo",
    categoryLabel: "EXPO",
    question: "How should you do shadows in modern React Native?",
    answerHtml:
      "The old iOS <code>shadow*</code> props and Android <code>elevation</code> are two different visual languages, so a shared style needs a <code>Platform.select</code> just for a shadow. The CSS <code>boxShadow</code> style prop (<code>'0 1px 2px rgba(0,0,0,0.05)'</code>, inset supported) renders consistently on both platforms from one line. Pair with <code>borderCurve: 'continuous'</code> for Apple-style rounded corners. <b>One boxShadow value, no Platform.select — that's the whole pitch.</b>",
  },
  {
    id: "ex-7",
    category: "expo",
    categoryLabel: "EXPO",
    question: "How do you add a native context menu / preview to an Expo Router Link?",
    answerHtml:
      "A real native context menu gets you the system long-press gesture, haptics, and blur-preview animation for free — a JS popover has to reimplement all of that by hand. Wrap with <code>&lt;Link.Trigger&gt;</code> and add <code>&lt;Link.Menu&gt;</code> containing <code>&lt;Link.MenuAction title icon onPress destructive /&gt;</code>, plus <code>&lt;Link.Preview /&gt;</code> for the iOS peek. <b>For long-press actions I reach for Link.Menu before I'd ever build a custom popover.</b>",
  },
  {
    id: "ex-8",
    category: "expo",
    categoryLabel: "EXPO",
    question: "How do you present a screen as a modal or form sheet in Expo Router?",
    answerHtml:
      "Native modal presentation gives you the platform's swipe-to-dismiss, interruptible animation, and detents for free — a hand-rolled modal component has to reimplement all of it, usually worse. In the Stack, set <code>options={{ presentation: 'modal' }}</code> or <code>'formSheet'</code> (with <code>sheetAllowedDetents</code>, <code>sheetGrabberVisible</code>). <b>I reach for the Stack's presentation option before writing a custom Modal component.</b>",
  },
  {
    id: "ex-9",
    category: "expo",
    categoryLabel: "EXPO",
    question: "What are NativeTabs in Expo Router?",
    answerHtml:
      "A JS-rendered tab bar can never quite match the system one — subtle spring physics, blur, and platform conventions users notice even if they can't name them. <code>NativeTabs</code> (from <code>expo-router/unstable-native-tabs</code>) render the <b>platform-native</b> tab bar (UITabBar / Android tabs) using <code>&lt;NativeTabs.Trigger&gt;</code> + <code>&lt;Icon sf=&quot;…&quot;/&gt;</code> + <code>&lt;Label/&gt;</code>, including a <code>role=&quot;search&quot;</code> tab. <b>For a tab bar I default to NativeTabs now — it's the platform-native one, not a JS approximation.</b>",
  },
  {
    id: "ex-10",
    category: "expo",
    categoryLabel: "EXPO",
    question: "How do you render SF Symbols and set a screen title the idiomatic way?",
    answerHtml:
      "Routing title and icon rendering through the navigator's own props, instead of custom components, keeps native header behaviors — large-title collapse, Dynamic Type, safe-area alignment — working automatically. Render SF Symbols via <code>expo-image</code> with <code>source=&quot;sf:square.and.arrow.up&quot;</code> (not <code>@expo/vector-icons</code>), and set the title through the navigator — <code>&lt;Stack.Screen options={{ title: 'Home' }} /&gt;</code> — rather than a custom header <code>Text</code>. <p><b>Red flag:</b> rendering the title as a custom Text inside the header — it silently drops large-title collapse and Dynamic Type support.</p> <b>Title and icons go through the navigator's own props, never a hand-rolled header component.</b>",
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
      "Sync methods block the JS thread, freezing every touch and re-render app-wide. Make it async and offload to a background thread (e.g. <code>DispatchQueue.global().async</code>), then resolve. The UI/main thread option is a tempting pick because native code 'feels' like it belongs there — but that thread is busy rendering frames, so heavy work there causes dropped frames just as surely as blocking JS does.",
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
      "Hermes ships native <code>Intl</code> support, so the polyfills are often dead weight (~430KB) — audit the exact APIs you use before dropping them. The security and deprecation options are misdirects: nothing about <code>@formatjs</code> is insecure or deprecated, it's simply redundant once Hermes covers the same surface.",
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
      "Context re-renders <b>every</b> consumer, full stop — there's no per-field opt-out. 'Only those reading the changed field' is the tempting wrong answer because that's exactly how selector-based stores like Zustand/Jotai behave; don't confuse the two mental models. Atomic stores re-render only the components reading the changed slice — Context doesn't have that granularity.",
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
      "RN flattens layout-only views; <code>collapsable={false}</code> forces the view to persist so native components that count children still work. <code>removeClippedSubviews</code> and <code>shouldRasterizeIOS</code> are unrelated perf knobs — one skips offscreen rendering, the other rasterizes for cheaper compositing — neither stops view flattening.",
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
      "Expo Go can't load custom native code, on either platform — local modules, Apple targets, and unsupported third-party native modules all require a custom dev/EAS build. The config-plugin option is a trap: plugins configure the native project at prebuild time, but Expo Go has no prebuild step, so a plugin can't get new native code into it.",
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
      "A first-child ScrollView/FlatList with <code>contentInsetAdjustmentBehavior=&quot;automatic&quot;</code> computes smarter insets and pairs correctly with native headers/tabs. <b>Red flag:</b> wrapping the screen in <code>SafeAreaView</code> on top of a native stack header double-counts the inset, adding dead space at the top.",
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
      "<code>useWindowDimensions</code> is a hook that re-renders on resize/rotation; <code>Dimensions.get()</code> is a one-shot read that goes stale the moment the window changes. <code>PixelRatio.get()</code> is a different concept entirely — pixel density for asset scaling, not window size — so it doesn't solve this problem at all.",
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
      "Use the CSS <code>boxShadow</code> style prop (inset supported) instead of the legacy iOS <code>shadow*</code> props or Android <code>elevation</code> — those are single-platform props, so picking either one alone leaves the other platform without a shadow.",
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
