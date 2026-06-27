// React Native Performance — 20 read-along lessons + 20 coding sessions.
// Source material: "The Ultimate Guide to React Native Optimization 2026" (Callstack)
// and "A Practical Developer's Guide to react-native-executorch v0.9.2" (Software Mansion).
import type { Flashcard } from "./flashcards";
import type { Prompt } from "./prompts";

// ─── 20 LESSONS ────────────────────────────────────────────────────────────────
// category "perf" reuses the existing "Performance" filter chip.
export const PERF_LESSONS: Flashcard[] = [
  // ── BEGINNER (1-5) ──────────────────────────────────────────────────────────
  {
    id: "pl-01",
    category: "perf",
    categoryLabel: "PERF",
    level: "junior",
    question: "Lesson 1 · The two metrics that matter: TTI and FPS",
    answerHtml: `<p><b>TTI (Time to Interactive)</b> — how long from tapping the app icon until users can actually do something. Covers four phases: native process init → native app init → JS bundle load → React render. Users expect under 2-4 s; every 100 ms matters.</p>
<p><b>FPS (Frames Per Second)</b> — how smooth the running app feels. Devices refresh at 60 Hz (1 frame = 16.6 ms) or 120 Hz (1 frame = 8.3 ms). Drop below 60 FPS and the user sees jank — stutter, lag, an "unpolished" feel. <b>Two independent FPS monitors</b> exist: JS-thread FPS and UI-thread FPS. A drop in only one tells you where the problem lives.</p>
<p>Rule: measure both before optimizing. The React Perf Monitor overlay (Dev Menu → Perf Monitor) shows both live in development.</p>`,
  },
  {
    id: "pl-02",
    category: "perf",
    categoryLabel: "PERF",
    level: "junior",
    question: "Lesson 2 · React's five re-render triggers",
    answerHtml: `<p>A React Native component re-renders when <b>any</b> of these five things happen:</p>
<ol>
  <li><b>Parent re-renders</b> — even if the child's props didn't logically change, a new object/function reference counts as "changed".</li>
  <li><b>State changes</b> — <code>useState</code>, <code>useReducer</code>, or any hook that manages state.</li>
  <li><b>Props change</b> — compared by <i>reference</i>, not deep equality.</li>
  <li><b>Context changes</b> — every consumer of a changed context re-renders.</li>
  <li><b>Force update</b> — an escape hatch, avoid it.</li>
</ol>
<p>According to Callstack's internal survey of 100 RN developers, <b>80% of perf issues originate on the JS/React side</b> — so mastering re-render control is the highest-ROI skill.</p>`,
  },
  {
    id: "pl-03",
    category: "perf",
    categoryLabel: "PERF",
    level: "junior",
    question: "Lesson 3 · The 16 ms JS-thread budget (and why 8 ms is the new target)",
    answerHtml: `<p>A 60 Hz display refreshes every <b>16.6 ms</b>. Your JS thread must finish its work — reconciliation, state updates, any synchronous native calls — within that window or the frame is dropped.</p>
<p>With 120 Hz screens (iPhone 13 Pro+, Pixel 6 Pro+) the budget shrinks to <b>8.3 ms</b>. A function that takes 12 ms passes at 60 Hz but fails at 120 Hz.</p>
<p>How to catch violations: open React Native DevTools → JavaScript Profiler → record → call the slow function → stop. The profiler shows each function's wall time. Any call exceeding 16 ms on the JS thread is a candidate for optimization or deferral to a background thread or worklet.</p>
<div class="code">// Too slow — blocks JS thread for ~1s at 1 billion iterations
const longRunningFunction = () => {
  let i = 0;
  while (i &lt; 1_000_000_000) i++;
};</div>`,
  },
  {
    id: "pl-04",
    category: "perf",
    categoryLabel: "PERF",
    level: "junior",
    question: "Lesson 4 · How to profile React with React Native DevTools",
    answerHtml: `<p>Open DevTools via Metro (<code>j</code>) or Dev Menu → "Open DevTools" → <b>Profiler tab</b>. Before recording, enable two settings:</p>
<ol>
  <li>"Highlight updates when components render" — paints a colored border around every re-rendering component in real time.</li>
  <li>"Record why each component rendered while profiling" — adds a "Why did this render?" panel.</li>
</ol>
<p>Hit <b>Start Profiling</b> (or "Reload and start" for startup analysis), interact with the slow part, stop. The <b>Flame Chart</b> shows every render commit. Yellow = slow; green/gray = memoized/fast. Click a bar → "Why did this render?" to see the exact prop or state that changed.</p>
<p>The <b>Ranked view</b> sorts components slowest→fastest — a quick "bottom-up" to find where React spends the most time. The profiler is the single most important tool in your perf toolkit.</p>`,
  },
  {
    id: "pl-05",
    category: "perf",
    categoryLabel: "PERF",
    level: "junior",
    question: "Lesson 5 · React.memo + useCallback: the memoization pair",
    answerHtml: `<p><b>React.memo</b> wraps a component. It skips re-renders when props are shallowly equal to the previous render. Without it, a child re-renders every time the parent does, regardless of whether the child's data changed.</p>
<p><b>useCallback</b> keeps a function reference stable across renders (only recreates when its deps change). This matters because an inline <code>() =&gt; …</code> in JSX creates a new reference every render, breaking <code>React.memo</code>'s shallow comparison.</p>
<div class="code">// Bad: new function reference on every parent render
&lt;Button onPress={() =&gt; setCount(c + 1)} /&gt;

// Good: stable reference; Button (wrapped in memo) skips re-renders
const onPress = useCallback(() =&gt; setCount(c =&gt; c + 1), []);
const Button = memo(({ onPress, title }) =&gt; &lt;Pressable onPress={onPress}&gt;…&lt;/Pressable&gt;);</div>
<p>Profile first — the profiler's "Why did this render?" confirms the inline function was the culprit before you add the hooks.</p>`,
  },

  // ── INTERMEDIATE (6-12) ─────────────────────────────────────────────────────
  {
    id: "pl-06",
    category: "perf",
    categoryLabel: "PERF",
    level: "mid",
    question: "Lesson 6 · React Compiler: automatic memoization at build time",
    answerHtml: `<p>React Compiler (from the React core team) analyzes your components at <b>build time</b> and inserts memoization automatically — no manual <code>React.memo</code>, <code>useMemo</code>, or <code>useCallback</code>. It respects the Rules of React; components that violate them are skipped.</p>
<p><b>Setup (Expo):</b></p>
<div class="code">npm install -D babel-plugin-react-compiler@latest
// babel.config.js
plugins: [['babel-plugin-react-compiler', { target: '19' }]]</div>
<p>Add <code>eslint-plugin-react-compiler</code> first — it catches Rules-of-React violations that would block the compiler. Adopt incrementally with the <code>sources</code> config option.</p>
<p><b>What to expect:</b> Expensify reported a 4.3% TTI improvement on a large production app. Apps already hand-memoized will see smaller gains. Optimized components appear with a ✨ Memo badge in React DevTools. The recommendation: enable the compiler and then <i>remove</i> your manual memoization hooks — the compiler does it better.</p>`,
  },
  {
    id: "pl-07",
    category: "perf",
    categoryLabel: "PERF",
    level: "mid",
    question: "Lesson 7 · Concurrent React: useDeferredValue vs useTransition",
    answerHtml: `<p>Both hooks let React defer non-critical work so user input stays responsive.</p>
<p><b>useDeferredValue(value)</b> — defers the rendering of components that consume <code>value</code>. The current (stale) value keeps rendering while React prepares the next one in the background. Best for deferring a single prop or search input downstream.</p>
<div class="code">const deferredQuery = useDeferredValue(query);
// SearchResults re-renders with deferredQuery while typing stays instant
&lt;SearchResults query={deferredQuery} /&gt;</div>
<p><b>useTransition()</b> — marks entire state updates as low-priority. <code>startTransition</code> wraps the slow setter; <code>isPending</code> lets you show a spinner while React works in the background. Best when multiple states or a whole section of the UI needs to update together.</p>
<p>Rule of thumb: one value to defer → <code>useDeferredValue</code>. Multiple state updates or view transitions → <code>useTransition</code>. Both require the <b>New Architecture</b> (default since RN 0.76).</p>`,
  },
  {
    id: "pl-08",
    category: "perf",
    categoryLabel: "PERF",
    level: "mid",
    question: "Lesson 8 · Atomic state management: Jotai and granular re-renders",
    answerHtml: `<p>Global state at the top of the component tree causes cascading re-renders downward — every subscriber re-renders, even if its data didn't change. The fix: <b>atomic state</b>, where state is split into small independent atoms, each subscribed to individually.</p>
<p><b>Jotai</b> is the go-to atomic library. Each atom is a piece of state outside the React tree:</p>
<div class="code">const filterAtom = atom('all');
const todosAtom = atom(initialTodos);

// Only FilterMenuItem re-renders when filter changes — TodoItems don't
const FilterMenuItem = () =&gt; {
  const [filter, setFilter] = useAtom(filterAtom);
  …
};
// useSetAtom: only the setter, no re-render on reads
const TodoItem = () =&gt; {
  const setTodos = useSetAtom(todosAtom);
  …
};</div>
<p>Callstack's conclusion: React Compiler often makes atomic state unnecessary for perf reasons alone. But atoms are still useful for their architectural clarity — colocating state with the components that own it. Use Jotai/Zustand if you prefer the bottom-up model; use the Compiler if you want to keep top-down state without hand-memoizing.</p>`,
  },
  {
    id: "pl-09",
    category: "perf",
    categoryLabel: "PERF",
    level: "mid",
    question: "Lesson 9 · High-performance animations: Reanimated worklets",
    answerHtml: `<p>Animations that run on the <b>JS thread</b> are at the mercy of garbage collection, state updates, and any other JS work — they jank under load. The fix: run them on the <b>UI thread</b> via <b>worklets</b>.</p>
<p>A worklet is a JS function annotated with <code>'worklet'</code> that Reanimated serializes and executes on the UI thread via JSI. <code>useAnimatedStyle</code> runs in a worklet by default:</p>
<div class="code">const opacity = useSharedValue(1);
const style = useAnimatedStyle(() =&gt; {
  'worklet';
  return { opacity: opacity.value }; // runs on UI thread
});

// Schedule something on the UI thread manually:
scheduleOnUI(() =&gt; { 'worklet'; opacity.value = withTiming(0); });

// Call back to JS from the UI thread:
scheduleOnRN(notifyCompletion); // replaces deprecated runOnJS</div>
<p>Reanimated 4 (New Architecture required) adds a <b>CSS Transitions API</b> — declare which style properties should animate on change, no worklets needed for simple state-driven animations. The authors recommend adopting CSS Transitions for state-driven cases and keeping worklets for gesture-driven or complex sequenced animations.</p>`,
  },
  {
    id: "pl-10",
    category: "perf",
    categoryLabel: "PERF",
    level: "mid",
    question: "Lesson 10 · JS memory leaks: the three patterns to know",
    answerHtml: `<p>A leak happens when the garbage collector can't free memory because something holds a live reference. Hermes' GC is called <b>Hades</b>. The three most common RN patterns:</p>
<p><b>1. Listeners without cleanup:</b></p>
<div class="code">useEffect(() =&gt; {
  const sub = EventEmitter.addListener('myEvent', handler);
  return () =&gt; sub.remove(); // missing this = leak
}, []);</div>
<p><b>2. Timers without cleanup:</b></p>
<div class="code">useEffect(() =&gt; {
  const id = setInterval(tick, 1000);
  return () =&gt; clearInterval(id); // missing this = leak
}, []);</div>
<p><b>3. Closures retaining large objects:</b></p>
<div class="code">// Bad: closure captures the entire largeData array
const createLeaky = () =&gt; {
  const largeData = new Array(1_000_000).fill('…');
  return () =&gt; largeData.length; // whole array retained
};
// Good: capture only the scalar you need
const createEfficient = () =&gt; {
  const length = new Array(1_000_000).fill('…').length;
  return () =&gt; length;
};</div>`,
  },
  {
    id: "pl-11",
    category: "perf",
    categoryLabel: "PERF",
    level: "mid",
    question: "Lesson 11 · JS memory profiling: the DevTools allocation timeline",
    answerHtml: `<p>Open React Native DevTools → <b>Memory tab</b> → select <b>"Allocation instrumentation on timeline"</b> → Start. Exercise the leaky flow → Stop.</p>
<p>Reading the output:</p>
<ul>
  <li><b>Blue bars</b> = memory allocated during that time window and still live at the end — a candidate leak.</li>
  <li><b>Grey bars</b> = allocated then collected — healthy.</li>
  <li><b>Shallow size</b> = memory the object itself holds.</li>
  <li><b>Retained size</b> = memory freed if this object is deleted (includes all objects only reachable through it) — the number that matters for leaks.</li>
</ul>
<p>Tip: force a GC (DevTools → Memory → GC icon) before stopping — retained blue bars after a GC are genuine leaks, not just young-gen objects waiting for collection. Compare two heap snapshots (before/after exercising the flow) to see which constructor counts grow unexpectedly.</p>`,
  },
  {
    id: "pl-12",
    category: "perf",
    categoryLabel: "PERF",
    level: "mid",
    question: "Lesson 12 · Specialized list components: FlashList and LegendList",
    answerHtml: `<p><b>FlatList</b> renders each item as a new native view. Fine for small lists, painful for feeds of hundreds of items.</p>
<p><b>FlashList</b> (Shopify) <i>recycles</i> native cell views, the same optimization used by UICollectionView/RecyclerView. Under the New Architecture it auto-measures item sizes synchronously — no <code>getItemLayout</code> needed. Drop-in replacement: swap <code>FlatList</code> → <code>FlashList</code>, add <code>estimatedItemSize</code>.</p>
<p><b>LegendList</b> (<code>@legendapp/list</code>) v2 is a pure-TypeScript alternative with no native deps. Opt-in recycling via <code>recycleItems</code> prop, built-in bidirectional infinite scroll, and a <code>KeyboardAvoidingLegendList</code> for chat UIs. Safer default (no recycling unless you opt in) but you must enable it for long lists.</p>
<p>Rule: always measure. Run the profiler before and after the swap to confirm the re-render count and scroll FPS actually improved. A specialized component is only worth its bundle cost if your list is the bottleneck.</p>`,
  },

  // ── ADVANCED (13-20) ────────────────────────────────────────────────────────
  {
    id: "pl-13",
    category: "perf",
    categoryLabel: "PERF",
    level: "senior",
    question: "Lesson 13 · Native profiling: Instruments (iOS) and Android Studio Profiler",
    answerHtml: `<p>React DevTools profiles the JS/React layer. For native-side bottlenecks you need native tools.</p>
<p><b>iOS — Xcode Instruments:</b> Xcode → Open Developer Tool → Instruments → Time Profiler. Select device + app → record → reproduce the slow interaction → stop. The flame graph shows the Main (UI) thread and JS thread side by side. A "Microhang" on the UI thread means the system noticed it was unresponsive; a "Hang" is worse. Filter by Hermes or React Native to hide system noise. Use Bottom-Up view sorted by "weight" to find the heaviest callers.</p>
<p><b>Android — Android Studio Profiler:</b> View → Tool Windows → Profiler → "Find CPU Hotspots" task. The flame graph shows the JS thread (<code>mqt_v_js</code>) and main thread together. JSI's sync calls mean touch events on the main thread map almost precisely to JS-thread work starting — visible in the trace. Always test on the <b>lowest-end device</b> you support; Android fragmentation means behavior varies widely. Export traces to Perfetto (<code>ui.perfetto.dev</code>) for additional analysis.</p>`,
  },
  {
    id: "pl-14",
    category: "perf",
    categoryLabel: "PERF",
    level: "senior",
    question: "Lesson 14 · TTI measurement: startup pipeline markers",
    answerHtml: `<p>Measuring TTI naively (cold + warm + hot starts mixed together) gives useless variance. <b>Always measure cold starts only</b> and exclude prewarm, warm, and hot starts.</p>
<p>Use <code>react-native-performance</code> to instrument each phase:</p>
<ul>
  <li><b>nativeLaunchStart / nativeLaunchEnd</b> — native process init (measured with <code>clock_gettime</code> on iOS, <code>Process.getElapsedCpuTime()</code> on Android).</li>
  <li><b>appCreationStart / appCreationEnd</b> — iOS: <code>main()</code> → <code>didFinishLaunchingWithOptions</code>; Android: <code>Application.onCreate</code>.</li>
  <li><b>runJSBundleStart / runJSBundleEnd</b> — listen to RN's internal <code>RCTJavaScriptWillStartLoadingNotification</code> (iOS) or <code>ReactMarker.RUN_JS_BUNDLE_START</code> (Android).</li>
  <li><b>screenInteractive</b> — place this in a <code>useEffect</code> on your home screen when meaningful content is visible and interactive.</li>
</ul>
<p>iOS prewarms apps using ML predictions (can cut cold-start time up to 40%), so filter out prewarmed starts using <code>ProcessInfo.environment["ActivePrewarm"]</code>. Ship these markers to your analytics; track p50/p95 by device tier, not just averages.</p>`,
  },
  {
    id: "pl-15",
    category: "perf",
    categoryLabel: "PERF",
    level: "senior",
    question: "Lesson 15 · Threading model of TurboModules and Fabric",
    answerHtml: `<p>Knowing which thread runs what prevents freezes and crashes in native code.</p>
<p><b>TurboModules:</b></p>
<ul>
  <li>iOS <code>init</code> → main thread (UIKit assumption). Android <code>init</code> → JS thread (<code>mqt_v_js</code>).</li>
  <li>Synchronous methods → JS thread. Block it here and you freeze the whole app.</li>
  <li>Async (Promise-returning) methods → Native modules thread (<code>mqt_v_native</code>, a shared pool).</li>
  <li>Void methods → <code>mqt_v_native</code>.</li>
  <li>Eager-init on Android (<code>needsEagerInit: true</code>) → <code>mqt_v_native</code>.</li>
</ul>
<p><b>Fabric (native views):</b> both <code>init</code> and <code>updateProps</code> run on the <b>main thread</b> — Yoga layout ops that back them run on the JS thread. All view mutations must ultimately reach the main thread; JSI makes this synchronous in the New Architecture, which is why the Android profiler shows touch events on the main thread lining up exactly with JS work starting immediately after.</p>`,
  },
  {
    id: "pl-16",
    category: "perf",
    categoryLabel: "PERF",
    level: "senior",
    question: "Lesson 16 · View flattening and the collapsable prop",
    answerHtml: `<p>Fabric's renderer identifies <b>"layout-only" nodes</b> — views that only affect layout (position, size) but don't render any visual content. It flattens them out of the native view hierarchy to save memory and CPU layout passes.</p>
<p>This is transparent in most cases. It becomes a problem when a <b>native component</b> expects a specific number of children:</p>
<div class="code">&lt;MyNativeComponent&gt;
  &lt;Child1 /&gt;  {/* if Child1 is layout-only, it may be flattened */}
  &lt;Child2 /&gt;
&lt;/MyNativeComponent&gt;
// Native side may receive Child1's children instead of Child1 itself</div>
<p>Fix: set <code>collapsable={false}</code> to prevent a specific view from being flattened:</p>
<div class="code">&lt;Child1 collapsable={false} /&gt;</div>
<p>Debug the live view hierarchy in Xcode (Debug → View Hierarchy) or Android Studio (Layout Inspector) to see what actually reaches the native layer. View flattening is a free optimization — only opt out where correctness requires it.</p>`,
  },
  {
    id: "pl-17",
    category: "perf",
    categoryLabel: "PERF",
    level: "senior",
    question: "Lesson 17 · Native memory management: ARC, WeakReference, and cleanup",
    answerHtml: `<p>Swift uses <b>ARC</b> (Automatic Reference Counting) — the compiler inserts retain/release calls. A retain cycle (two objects holding strong references to each other) prevents deallocation. Fix: use <code>[weak self]</code> in closures or <code>weak var</code> for delegates.</p>
<p>Kotlin/Android: the GC handles most cases, but listeners stored in a manager class keep their host object alive. Fix: <code>WeakReference</code> in the listener list, or implement <code>AutoCloseable</code> and call <code>close()</code> in the lifecycle teardown.</p>
<div class="code">// Kotlin: WeakReference prevents DataManager from retaining listeners
class DataManager {
  private val listeners = mutableListOf&lt;WeakReference&lt;DataListener&gt;&gt;()
}

// Swift: weak capture prevents retain cycle
button.action = { [weak self] in self?.handleTap() }</div>
<p><b>Manual ARC (<code>Unmanaged</code>) in Swift</b> is used for C-interop. Rule: match every <code>passRetained</code> with a <code>takeRetainedValue</code>. Mismatched calls cause crashes or double-frees. This rarely appears in application code but is important in TurboModule glue code.</p>`,
  },
  {
    id: "pl-18",
    category: "perf",
    categoryLabel: "PERF",
    level: "senior",
    question: "Lesson 18 · Bundle analysis: barrel exports are the silent bloat",
    answerHtml: `<p>A <b>barrel export</b> is an <code>index.ts</code> that re-exports everything from a folder:</p>
<div class="code">// components/index.ts
export { Button } from './Button';
export { Modal } from './Modal';
export { VideoPlayer } from './VideoPlayer'; // huge dep</div>
<p>When you import <code>Button</code> via the barrel, Metro must parse the whole <code>index.ts</code> and may pull <code>VideoPlayer</code>'s dependencies into the bundle even if you never use it — because <b>tree-shaking requires statically provable unused exports</b>, which barrel files make hard to prove.</p>
<p><b>Fix:</b> import directly: <code>import { Button } from './components/Button'</code>.</p>
<p><b>Measure your bundle:</b></p>
<div class="code">npx react-native bundle --platform ios --dev false \\
  --entry-file index.js --bundle-output out.js --sourcemap-output out.map
npx source-map-explorer out.js out.map</div>
<p>The treemap shows which modules contribute most to bundle size. Also check: duplicate transitive dependencies (two versions of the same package), moment.js (replace with date-fns + specific imports), lodash (use lodash-es with tree-shaking or individual package imports).</p>`,
  },
  {
    id: "pl-19",
    category: "perf",
    categoryLabel: "PERF",
    level: "senior",
    question: "Lesson 19 · On-device AI with react-native-executorch: architecture and setup",
    answerHtml: `<p><b>react-native-executorch</b> (Software Mansion) wraps Meta's ExecuTorch runtime — a 50KB C++ runtime that runs exported <code>.pte</code> model binaries on XNNPACK (CPU, default), Core ML (iOS), or QNN (Qualcomm). <b>New Architecture required.</b></p>
<p><b>Setup:</b></p>
<div class="code">npm install react-native-executorch
npm install react-native-executorch-expo-resource-fetcher  // Expo
// bare RN: react-native-executorch-bare-resource-fetcher

// App entry point — MUST call before any hook:
import { initExecutorch } from 'react-native-executorch';
import { ExpoResourceFetcher } from 'react-native-executorch-expo-resource-fetcher';
initExecutorch({ resourceFetcher: ExpoResourceFetcher });</div>
<p><b>Model lifecycle:</b> a hook (e.g., <code>useLLM</code>) auto-loads on mount. Observe <code>downloadProgress</code> (0–1) and <code>isReady</code>. For LLMs, <code>isGenerating</code> tracks active inference; <code>interrupt()</code> cancels it. <b>Critical:</b> call <code>interrupt()</code> and wait for <code>isGenerating === false</code> before unmounting — a live model being torn down crashes the app. Only <b>one LLM instance</b> can run at a time. Pin the exact version — breaking changes land nearly every minor release.</p>`,
  },
  {
    id: "pl-20",
    category: "perf",
    categoryLabel: "PERF",
    level: "senior",
    question: "Lesson 20 · On-device AI: RAM budget, quantization, and model families",
    answerHtml: `<p><b>RAM rule of thumb:</b> 1B parameter model ≈ 1 GB download / ~2 GB RAM. Device tier recommendations:</p>
<ul>
  <li><b>8 GB+ RAM</b> (flagship): 3B models (Qwen 3 1.7B, LLaMA 3.2 3B, Phi 4 Mini 4B)</li>
  <li><b>6 GB RAM</b> (mid-range): 1B quantized models (LLaMA 3.2 1B, SmolLM2 1.7B q4)</li>
  <li><b>4 GB RAM</b> (low-end): vision models only (SSDLite, YOLO26N), no LLMs</li>
</ul>
<p><b>Quantization</b> reduces model size and speeds up inference with minimal quality loss. SpinQuant reduces a 1B model by ~42%. All pre-exported models in <code>models.*</code> include quantized variants.</p>
<p><b>v0.9.2 model families:</b> LLMs: Hammer 2.1, Qwen 3/3.5, Phi 4 Mini, SmolLM2, LLaMA 3.2, LFM2.5 (vision). CV: SSDLite, RF-DETR, YOLO26, DeepLab (segmentation), pose estimation (new in 0.9.x). Speech: Whisper tiny/base/small. Embeddings: all-MiniLM-L6-v2. TTS: Kokoro.</p>
<p><b>Never</b> bundle a large model — use remote download with progress UI. Bundled assets are capped at ~512 MB and bloat the binary for every user, even those who never use the AI feature.</p>`,
  },
];

// ─── 20 CODING SESSIONS ────────────────────────────────────────────────────────
export const PERF_SESSIONS: Prompt[] = [
  // ── BEGINNER (1-5) ──────────────────────────────────────────────────────────
  {
    id: "perf-s01",
    kind: "coding",
    title: "Debug renders · useRenderCount hook",
    level: "junior",
    tags: ["hooks", "debugging", "performance"],
    promptHtml: `<p>Write a <code>useRenderCount(label?: string)</code> hook that prints to the console every time a component re-renders, including a running count and the component label. This is a cheap development-only debugging aid to verify that your memoization is actually working before reaching for the profiler.</p>
<p><b>Usage:</b></p>
<div class="code">const MyComponent = () =&gt; {
  useRenderCount('MyComponent');
  return &lt;Text&gt;Hello&lt;/Text&gt;;
};
// Console: [MyComponent] render #1, #2, …</div>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
<li>A <code>useRef</code> persists a counter across renders without causing a re-render itself.</li>
<li>Increment it synchronously during render (not in an effect — we want to count every render, including renders that get abandoned in Concurrent React).</li>
<li>Gate behind <code>__DEV__</code> so it compiles away in production.</li>
</ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">import { useRef } from 'react';

export function useRenderCount(label = 'Component') {
  if (!__DEV__) return;
  // ponytail: ref intentionally mutated during render; no state = no extra renders
  const count = useRef(0);
  count.current += 1;
  console.log(\`[\${label}] render #\${count.current}\`);
}

// Usage: drop into any component; remove before shipping.
// When the profiler "Why did this render?" is enough, skip this hook.</div>
<p>Mutating a ref during render is one of the few safe side-effects — it doesn't schedule another render. This is the minimal debugging hook; the profiler's "Why did this render?" panel gives more detail.</p>`,
      },
    ],
  },
  {
    id: "perf-s02",
    kind: "coding",
    title: "Re-render fix · inline object and function props",
    level: "junior",
    tags: ["performance", "re-renders", "memoization"],
    promptHtml: `<p>The component below has two performance bugs that cause <code>Card</code> to re-render on every parent update even though its data hasn't changed. Identify and fix both bugs without changing what the UI renders.</p>
<div class="code">const Feed = ({ items }) =&gt; {
  const [query, setQuery] = useState('');

  return items.map(item =&gt; (
    &lt;Card
      key={item.id}
      item={item}
      style={{ marginBottom: 8 }}
      onPress={() =&gt; console.log(item.id)}
    /&gt;
  ));
};

const Card = memo(({ item, style, onPress }) =&gt; (
  &lt;Pressable style={style} onPress={onPress}&gt;
    &lt;Text&gt;{item.title}&lt;/Text&gt;
  &lt;/Pressable&gt;
));</div>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
<li>Bug 1: <code>style={{ marginBottom: 8 }}</code> creates a new object on every render. <code>Card</code> sees a new style reference → <code>memo</code> is bypassed.</li>
<li>Bug 2: <code>() =&gt; console.log(item.id)</code> creates a new function on every render for every item. Same issue.</li>
<li>Fix 1: hoist the constant style outside the component (or use <code>StyleSheet.create</code>).</li>
<li>Fix 2: wrap the handler in <code>useCallback</code> keyed on <code>item.id</code>. But since items are mapped, <code>useCallback</code> inside the map doesn't help — move <code>onPress</code> into the <code>Card</code> component itself and pass only the stable <code>item.id</code>.</li>
</ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">const CARD_STYLE = { marginBottom: 8 }; // hoisted: stable reference

const Feed = ({ items }) =&gt; {
  const [query, setQuery] = useState('');
  return items.map(item =&gt; (
    &lt;Card key={item.id} item={item} style={CARD_STYLE} /&gt;
  ));
};

const Card = memo(({ item, style }) =&gt; {
  // Handler lives here — stable ref, no prop needed
  const onPress = useCallback(() =&gt; console.log(item.id), [item.id]);
  return (
    &lt;Pressable style={style} onPress={onPress}&gt;
      &lt;Text&gt;{item.title}&lt;/Text&gt;
    &lt;/Pressable&gt;
  );
});</div>
<p>Now <code>style</code> is a stable constant and <code>onPress</code> is stable as long as <code>item.id</code> doesn't change. <code>memo</code>'s shallow comparison passes → <code>Card</code> skips re-renders. Confirm in the Profiler's "Why did this render?" before shipping.</p>`,
      },
    ],
  },
  {
    id: "perf-s03",
    kind: "coding",
    title: "Hooks · useThrottle",
    level: "junior",
    tags: ["hooks", "timers", "performance"],
    promptHtml: `<p>Write a <code>useThrottle&lt;T&gt;(value: T, limit: number): T</code> hook that emits the input value at most once per <code>limit</code> milliseconds. Unlike debounce (fires after silence), a throttle fires on the <b>leading edge</b> and then suppresses updates until the interval expires.</p>
<p><b>Example use case:</b> throttle a scroll position so expensive layout reads happen at most every 100 ms.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
<li>Track the last-emitted time in a ref (doesn't cause re-renders).</li>
<li>Track the current throttled value in state (causes a re-render when emitted).</li>
<li>In a <code>useEffect</code>: if enough time has passed since the last emit, emit immediately and record the timestamp. Otherwise, schedule a timeout to emit the pending value when the interval expires.</li>
<li>Return the cleanup to cancel any pending timeout.</li>
</ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">import { useEffect, useRef, useState } from 'react';

export function useThrottle&lt;T&gt;(value: T, limit: number): T {
  const [throttled, setThrottled] = useState(value);
  const lastEmit = useRef(0);
  const timer = useRef&lt;ReturnType&lt;typeof setTimeout&gt;&gt;();

  useEffect(() =&gt; {
    const now = Date.now();
    const remaining = limit - (now - lastEmit.current);
    if (remaining &lt;= 0) {
      clearTimeout(timer.current);
      lastEmit.current = now;
      setThrottled(value);
    } else {
      clearTimeout(timer.current);
      timer.current = setTimeout(() =&gt; {
        lastEmit.current = Date.now();
        setThrottled(value);
      }, remaining);
    }
    return () =&gt; clearTimeout(timer.current);
  }, [value, limit]);

  return throttled;
}</div>
<p>Leading-edge emit gives instant feedback on first change; the timeout catches the final trailing value if rapid changes occur. Compare to <code>useDebounce</code>: throttle guarantees a minimum emit rate; debounce guarantees silence before emitting.</p>`,
      },
    ],
  },
  {
    id: "perf-s04",
    kind: "coding",
    title: "FlatList · stable keyExtractor + getItemLayout",
    level: "junior",
    tags: ["lists", "flatlist", "performance"],
    promptHtml: `<p>You have a <code>FlatList</code> of fixed-height user cards (height = 80 dp, separator = 1 dp). Write the correct <code>keyExtractor</code> and <code>getItemLayout</code> props, then explain why each one matters for scroll performance.</p>
<div class="code">const ITEM_HEIGHT = 80;
const SEPARATOR = 1;

&lt;FlatList
  data={users}
  renderItem={renderUser}
  // add keyExtractor and getItemLayout here
/&gt;</div>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
<li><b>keyExtractor:</b> a stable unique string per item. Never use the index — on insert/delete/reorder, the recycler reuses the wrong native view, causing visual glitches. Use the item's server-assigned ID.</li>
<li><b>getItemLayout:</b> pre-computes each item's <code>length</code>, <code>offset</code>, and <code>index</code>, so FlatList can skip measuring items it hasn't rendered yet. This enables accurate jump-to-index, reduces layout passes, and speeds up initial render. Only applicable when every item has a known, fixed height.</li>
</ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">const ITEM_HEIGHT = 80;
const SEPARATOR = 1;
const ROW = ITEM_HEIGHT + SEPARATOR; // total height per slot

&lt;FlatList
  data={users}
  renderItem={renderUser}
  keyExtractor={(item) =&gt; item.id}  // stable server ID, not index
  getItemLayout={(_, index) =&gt; ({
    length: ITEM_HEIGHT,
    offset: ROW * index,
    index,
  })}
  ItemSeparatorComponent={() =&gt; &lt;View style={{ height: SEPARATOR }} /&gt;}
/&gt;</div>
<p><code>getItemLayout</code> only works when heights are truly uniform. If heights vary, use FlashList (auto-measures) or estimate with <code>estimatedItemSize</code>. If you later add section headers or footers, their heights must be factored into the offset calculation.</p>`,
      },
    ],
  },
  {
    id: "perf-s05",
    kind: "coding",
    title: "React Compiler · enable in an Expo project",
    level: "junior",
    tags: ["build-tools", "react-compiler", "performance"],
    promptHtml: `<p>Walk through enabling React Compiler in an Expo SDK 55+ project: install the ESLint plugin, install the Babel plugin, and configure Babel. Then show how to use the <code>sources</code> option to adopt it incrementally on just one directory.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
<li>Step 1: ESLint plugin catches Rules-of-React violations that would block compiler optimizations — add it before enabling the compiler itself.</li>
<li>Step 2: Babel plugin transforms code at build time — must run <b>first</b> in the plugins array.</li>
<li>Step 3: Incremental adoption with <code>sources</code> — point at a known-clean directory first; expand as you fix violations.</li>
<li>Expo SDK 55+ ships React 19, so <code>target: '19'</code>. For older RN, use <code>'18'</code> + <code>react-compiler-runtime</code>.</li>
</ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code"># 1. ESLint plugin
npm install -D eslint-plugin-react-compiler

# eslint.config.js
import reactCompiler from 'eslint-plugin-react-compiler';
export default [{ plugins: { 'react-compiler': reactCompiler },
  rules: { 'react-compiler/react-compiler': 'error' } }];

# 2. Babel plugin
npm install -D babel-plugin-react-compiler@latest

# babel.config.js
module.exports = () =&gt; ({
  plugins: [
    ['babel-plugin-react-compiler', {
      target: '19',
      // Incremental: only compile files in src/screens for now
      sources: (filename) =&gt; filename.includes('src/screens'),
    }],
    // other plugins after
  ],
});
</div>
<p>Verify in React DevTools: optimized components show a ✨ Memo badge. Once stable, remove manual <code>React.memo</code>, <code>useMemo</code>, and <code>useCallback</code> calls — the compiler handles them better. Class components are never optimized; migrate to functions to get the benefit.</p>`,
      },
    ],
  },

  // ── INTERMEDIATE (6-13) ─────────────────────────────────────────────────────
  {
    id: "perf-s06",
    kind: "coding",
    title: "Lists · FlatList → FlashList migration",
    level: "mid",
    tags: ["lists", "flashlist", "optimization"],
    promptHtml: `<p>Migrate this janky <code>FlatList</code> to <code>FlashList</code>. The list renders tweet-like cards with variable heights (approximate average: 120 dp). Add the minimal required props and explain what FlashList does differently under the hood.</p>
<div class="code">import { FlatList } from 'react-native';

&lt;FlatList
  data={tweets}
  keyExtractor={(t) =&gt; t.id}
  renderItem={({ item }) =&gt; &lt;TweetCard tweet={item} /&gt;}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/&gt;</div>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
<li>Install: <code>npx expo install @shopify/flash-list</code>.</li>
<li>Swap the import. FlashList's API is a superset of FlatList's — most props transfer directly.</li>
<li>Add <code>estimatedItemSize</code> (required): your best guess at the average item height in pixels. FlashList uses this to pre-allocate recycled views and size the scroll content. A poor estimate still works but causes a one-time layout correction flash.</li>
<li>Under New Architecture, FlashList v2 auto-measures synchronously, so <code>estimatedItemSize</code> becomes advisory rather than mandatory — but still improves first-paint accuracy.</li>
</ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">import { FlashList } from '@shopify/flash-list';

&lt;FlashList
  data={tweets}
  keyExtractor={(t) =&gt; t.id}
  renderItem={({ item }) =&gt; &lt;TweetCard tweet={item} /&gt;}
  estimatedItemSize={120}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/&gt;</div>
<p><b>What changes under the hood:</b> FlatList creates a new native view for every item that enters the window. FlashList <i>recycles</i> the same native views (like UICollectionView/RecyclerView), swapping in new data without touching the native layer. Fewer native view creations → lower memory, faster scroll, fewer dropped frames on heavy lists. The profiler should show a drop in both render count and frame time.</p>`,
      },
    ],
  },
  {
    id: "perf-s07",
    kind: "coding",
    title: "Concurrent React · useTransition for tab switching",
    level: "mid",
    tags: ["concurrent", "hooks", "performance"],
    promptHtml: `<p>A tab bar switches between three tabs. The "Analytics" tab renders a heavy chart component that takes ~200 ms to compute. Without optimization, tapping "Analytics" causes the entire UI to freeze while the chart renders, blocking the tab-bar press animation.</p>
<p>Fix this using <code>useTransition</code> so the tab-bar tap feels instant and a loading indicator appears during the chart computation.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
<li>Wrap the slow state update (<code>setActiveTab</code>) in <code>startTransition</code>. React processes it as low-priority, letting the tab-bar highlight update immediately.</li>
<li><code>isPending</code> is <code>true</code> while React is rendering the deferred update — show a spinner or dimmed overlay.</li>
<li>The slow component must be wrapped in <code>React.memo</code> (or handled by React Compiler) so it doesn't re-render for unrelated parent updates; otherwise <code>useTransition</code> still triggers it.</li>
</ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">import { useState, useTransition, memo } from 'react';

function TabScreen() {
  const [activeTab, setActiveTab] = useState('home');
  const [isPending, startTransition] = useTransition();

  const switchTab = (tab: string) =&gt; {
    // Tab highlight updates instantly (not wrapped)
    // Chart render is deferred (low priority)
    startTransition(() =&gt; setActiveTab(tab));
  };

  return (
    &lt;&gt;
      &lt;TabBar active={activeTab} onPress={switchTab} /&gt;
      {isPending &amp;&amp; &lt;LoadingOverlay /&gt;}
      {activeTab === 'analytics' &amp;&amp; &lt;HeavyChart /&gt;}
    &lt;/&gt;
  );
}

const HeavyChart = memo(() =&gt; {
  // expensive computation here
  return &lt;Chart /&gt;;
});</div>
<p>Without <code>startTransition</code>, React treats the state update as urgent — it blocks everything. With it, React can interrupt the chart render if the user taps again. Requires New Architecture (default since RN 0.76).</p>`,
      },
    ],
  },
  {
    id: "perf-s08",
    kind: "coding",
    title: "Memory safety · useEventListener hook",
    level: "mid",
    tags: ["hooks", "memory", "event-listeners"],
    promptHtml: `<p>Write a <code>useEventListener(emitter, event, handler)</code> hook that registers a native event emitter listener and <b>guarantees cleanup</b> on unmount, even if the component throws. The handler should always be the latest version (no stale closures).</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
<li>Store the handler in a ref so the subscription doesn't need to be torn down and recreated when the handler updates (same trick as <code>useInterval</code>).</li>
<li>Subscribe once in an effect keyed on <code>[emitter, event]</code> — the returned cleanup removes the subscription.</li>
<li>The cleanup runs both on unmount and when <code>emitter</code> or <code>event</code> changes — preventing double-subscriptions.</li>
</ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">import { useEffect, useRef } from 'react';
import type { EmitterSubscription, NativeEventEmitter } from 'react-native';

export function useEventListener(
  emitter: NativeEventEmitter,
  event: string,
  handler: (...args: unknown[]) =&gt; void,
) {
  const savedHandler = useRef(handler);

  // Keep ref pointing at the latest handler — no stale closure
  useEffect(() =&gt; { savedHandler.current = handler; }, [handler]);

  useEffect(() =&gt; {
    const sub: EmitterSubscription = emitter.addListener(
      event,
      (...args) =&gt; savedHandler.current(...args),
    );
    return () =&gt; sub.remove(); // guaranteed cleanup
  }, [emitter, event]);
}</div>
<p>The two-effect pattern is the canonical solution: one effect to keep the ref fresh (runs every render, zero cost), one effect to manage the subscription (runs only when source/event changes). Missing the cleanup is the #1 source of JS memory leaks in React Native.</p>`,
      },
    ],
  },
  {
    id: "perf-s09",
    kind: "coding",
    title: "Reanimated · scroll-driven animated header",
    level: "mid",
    tags: ["animation", "reanimated", "scroll"],
    promptHtml: `<p>Build a header that fades out as the user scrolls down and fades back in as they scroll up. The animation must run on the <b>UI thread</b> so it stays smooth even when the JS thread is busy processing data. Use Reanimated 3.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
<li><code>useSharedValue</code> holds the scroll position on the UI thread.</li>
<li><code>useAnimatedScrollHandler</code> intercepts scroll events on the UI thread — no JS-thread round-trip.</li>
<li><code>useAnimatedStyle</code> (a worklet) derives the header opacity from the shared value — also on the UI thread.</li>
<li><code>interpolate</code> maps 0–80 px scroll range to opacity 1–0.</li>
</ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">import Animated, {
  useSharedValue, useAnimatedStyle,
  useAnimatedScrollHandler, interpolate, Extrapolation,
} from 'react-native-reanimated';

export function ScrollScreen() {
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) =&gt; {
    'worklet';
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() =&gt; {
    'worklet';
    return {
      opacity: interpolate(scrollY.value, [0, 80], [1, 0], Extrapolation.CLAMP),
    };
  });

  return (
    &lt;&gt;
      &lt;Animated.View style={[styles.header, headerStyle]}&gt;
        &lt;Text&gt;My Header&lt;/Text&gt;
      &lt;/Animated.View&gt;
      &lt;Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16}&gt;
        {/* content */}
      &lt;/Animated.ScrollView&gt;
    &lt;/&gt;
  );
}</div>
<p><code>scrollEventThrottle={16}</code> ensures scroll events fire at 60fps. The shared value and animated style both live on the UI thread — JS thread jank cannot affect the header fade. This is the Reanimated advantage over <code>useNativeDriver: true</code> (which only handles transforms/opacity but can't do derived computations).</p>`,
      },
    ],
  },
  {
    id: "perf-s10",
    kind: "coding",
    title: "Navigation perf · InteractionManager + useFocusEffect",
    level: "mid",
    tags: ["navigation", "performance", "interaction-manager"],
    promptHtml: `<p>A screen loads expensive data inside <code>useFocusEffect</code>. When users navigate to it, the screen-transition animation stutters because the data fetch triggers heavy re-renders that compete with the animation. Fix it using <code>InteractionManager</code> so the expensive work defers until the animation finishes.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
<li><code>InteractionManager.runAfterInteractions</code> queues a callback to run after all pending interactions (animations, gestures) complete.</li>
<li><code>useFocusEffect</code> runs on screen focus — wrapping the expensive call inside <code>runAfterInteractions</code> means the data fetch starts <i>after</i> the nav animation finishes.</li>
<li>The returned task object has a <code>cancel()</code> method — call it in the effect cleanup to prevent stale fetches if the user navigates away before the animation ends.</li>
</ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">import { InteractionManager } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

function AnalyticsScreen() {
  const [data, setData] = useState(null);

  useFocusEffect(
    useCallback(() =&gt; {
      const task = InteractionManager.runAfterInteractions(async () =&gt; {
        const result = await fetchHeavyAnalytics();
        setData(result);
      });
      return () =&gt; task.cancel(); // prevent stale fetch on fast back-nav
    }, []),
  );

  if (!data) return &lt;Skeleton /&gt;;
  return &lt;Chart data={data} /&gt;;
}</div>
<p>React Navigation's native stack animations run on the UI thread — they won't drop frames regardless. But JS-thread work (data fetching, reconciliation) can make other JS animations stutter. <code>InteractionManager</code> is the lightweight way to sequence this without <code>useTransition</code>.</p>`,
      },
    ],
  },
  {
    id: "perf-s11",
    kind: "coding",
    title: "Network perf · in-flight request deduplicator",
    level: "mid",
    tags: ["network", "performance", "caching"],
    promptHtml: `<p>Multiple components mount simultaneously and each calls <code>fetchUser(id)</code> for the same user ID. This fires N duplicate network requests. Build a <code>dedupeFetch(url)</code> wrapper that collapses concurrent requests for the same URL into a single in-flight promise, returning the same result to all callers.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
<li>Keep a <code>Map&lt;url, Promise&gt;</code> of in-flight requests.</li>
<li>On a new call: if a promise for that URL is already in the map, return it. Otherwise start a new fetch, store the promise, and delete it from the map when it settles (success or failure) so the next call after completion goes fresh.</li>
<li>This is <b>request coalescing</b> — different from caching (which persists results). Coalescing only merges concurrent duplicate requests.</li>
</ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">const inflight = new Map&lt;string, Promise&lt;unknown&gt;&gt;();

export async function dedupeFetch&lt;T&gt;(url: string): Promise&lt;T&gt; {
  if (inflight.has(url)) return inflight.get(url) as Promise&lt;T&gt;;

  const promise = fetch(url)
    .then((r) =&gt; r.json())
    .finally(() =&gt; inflight.delete(url)); // clean up on settle

  inflight.set(url, promise);
  return promise as Promise&lt;T&gt;;
}

// Usage — 5 components all call this; only 1 network request fires:
const user = await dedupeFetch&lt;User&gt;('/api/users/42');</div>
<p>This is the core of React Query's deduplication — it keeps an inflight map per query key. The <code>.finally</code> ensures the map is cleared even on error, so a retry gets a fresh request rather than a cached failure. Combine with a short-lived cache (TTL map) to also coalesce near-simultaneous requests separated by a few ms.</p>`,
      },
    ],
  },
  {
    id: "perf-s12",
    kind: "coding",
    title: "Memory debug · find and fix a missing effect cleanup",
    level: "mid",
    tags: ["debugging", "memory", "hooks"],
    promptHtml: `<p>The component below has a memory leak. A timer keeps running after the component unmounts, holding a closure over <code>setCount</code> which retains the component's state. Find the leak, explain what the DevTools timeline would show, and fix it.</p>
<div class="code">function LiveCounter({ userId }) {
  const [count, setCount] = useState(0);

  useEffect(() =&gt; {
    const id = setInterval(() =&gt; {
      fetchCount(userId).then((n) =&gt; setCount(n));
    }, 5000);
    // return () =&gt; clearInterval(id); // accidentally deleted
  }, [userId]);

  return &lt;Text&gt;{count}&lt;/Text&gt;;
}</div>`,
    reveal: [
      {
        label: "What the DevTools timeline shows",
        html: `<p>Open DevTools → Memory → Allocation instrumentation on timeline → record → navigate away from the component → stop. You would see <b>blue bars</b> (allocations) from the closure over <code>setCount</code> and the <code>fetchCount</code> promise chain that never go grey. They grow on every 5-second interval. The "Shallow/Retained size" for the interval's closure object would keep climbing.</p>
<p>On Android Profiler: heap usage would grow by the closure size ~every 5 seconds, visible as a staircase pattern in the memory graph.</p>`,
      },
      {
        label: "Fix",
        html: `<div class="code">useEffect(() =&gt; {
  let cancelled = false; // guard async state update on unmounted component

  const id = setInterval(() =&gt; {
    fetchCount(userId).then((n) =&gt; {
      if (!cancelled) setCount(n); // skip update if already unmounted
    });
  }, 5000);

  return () =&gt; {
    cancelled = true;
    clearInterval(id); // guaranteed cleanup
  };
}, [userId]);</div>
<p>Two fixes: (1) <code>clearInterval</code> stops the timer, freeing the closure. (2) The <code>cancelled</code> flag prevents a stale <code>setCount</code> call if the fetch resolves after unmount — a separate bug that causes "Can't perform state update on unmounted component" warnings.</p>`,
      },
    ],
  },

  // ── ADVANCED (14-20) ────────────────────────────────────────────────────────
  {
    id: "perf-s13",
    kind: "coding",
    title: "Bundle · diagnose and fix a barrel export",
    level: "senior",
    tags: ["bundling", "tree-shaking", "performance"],
    promptHtml: `<p>Your bundle includes the entire <code>@icons/pack</code> library (350 KB) even though you only use <code>HomeIcon</code>. The library has a barrel <code>index.ts</code>. Show: (1) how to confirm this with <code>source-map-explorer</code>, (2) the barrel-import culprit, and (3) the fix.</p>`,
    reveal: [
      {
        label: "Diagnose",
        html: `<div class="code"># Build a sourcemap-equipped bundle:
npx react-native bundle --platform ios --dev false \\
  --entry-file index.js --bundle-output out.js --sourcemap-output out.map

# Visualize — open the treemap in a browser:
npx source-map-explorer out.js out.map</div>
<p>In the treemap, look for <code>@icons/pack</code> taking up a large rectangle. Drilling in shows it contains every icon module — not just <code>HomeIcon</code>. This is the barrel-import bloat.</p>`,
      },
      {
        label: "Root cause + fix",
        html: `<div class="code">// ❌ Barrel import — pulls entire library through index.ts:
import { HomeIcon } from '@icons/pack';

// ✅ Direct (deep) import — only HomeIcon's module is bundled:
import { HomeIcon } from '@icons/pack/dist/HomeIcon';

// If the library supports "sideEffects": false in package.json,
// Metro can tree-shake the barrel too. But deep imports are safer
// and don't depend on the library author's config.

// Also check: moment → date-fns/format, lodash → lodash-es + specific:
import format from 'date-fns/format'; // not: import { format } from 'date-fns'</div>
<p>After fixing, re-run the bundle and compare the treemap. The <code>@icons/pack</code> section should shrink to just the HomeIcon module. Track bundle size in CI: add a check that fails PRs adding more than a threshold (e.g., 50 KB uncompressed) to prevent silent regressions.</p>`,
      },
    ],
  },
  {
    id: "perf-s14",
    kind: "coding",
    title: "TTI · instrument the startup pipeline",
    level: "senior",
    tags: ["startup", "TTI", "performance-markers"],
    promptHtml: `<p>Add TTI measurement markers to a React Native app using <code>react-native-performance</code>. Place markers at: (a) the JS bundle finishing load, (b) the home screen becoming interactive. Also show how to detect and exclude warm/hot starts from the measurement.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
<li><code>react-native-performance</code> exposes the <code>performance</code> web API and built-in markers that tap into RN's internal startup lifecycle.</li>
<li>Use <code>performance.measure</code> between two marks to get a duration entry.</li>
<li>Cold-start detection: iOS checks <code>ActivePrewarm</code> env variable; Android checks <code>savedInstanceState</code> in <code>onActivityCreated</code>.</li>
<li><code>screenInteractive</code> is application-specific — place it when the first meaningful, interactive content is visible.</li>
</ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">import performance from 'react-native-performance';

// In your home screen component:
export default function HomeScreen() {
  useEffect(() =&gt; {
    // Mark when the home screen is interactive
    performance.mark('screenInteractive');

    // Measure total TTI from bundle start to screen ready
    performance.measure(
      'TTI',
      'runJsBundleEnd',   // built-in RN marker
      'screenInteractive',
    );

    const [tti] = performance.getEntriesByName('TTI');
    analytics.track('app_tti', { duration: tti.duration });
  }, []);

  return &lt;TabNavigator /&gt;;
}

// iOS cold-start guard (AppDelegate.swift):
// if ProcessInfo.processInfo.environment["ActivePrewarm"] == "1" { return }
// Only send TTI analytics from cold starts to avoid false-fast measurements.</div>
<p>The built-in markers (<code>nativeLaunchStart</code>, <code>runJsBundleEnd</code>, etc.) are instrumented by <code>react-native-performance</code> automatically. Track p50/p95 by device class — a Pixel 4a shows different TTI than a Galaxy S24. iOS prewarm can make cold TTI appear 40% faster without any code change.</p>`,
      },
    ],
  },
  {
    id: "perf-s15",
    kind: "coding",
    title: "Atomic state · Jotai atoms + derived selector",
    level: "senior",
    tags: ["state", "atoms", "performance"],
    promptHtml: `<p>Convert a Redux-style global store that causes full-tree re-renders into Jotai atoms. The store has <code>filter</code> (string) and <code>todos</code> (array). Add a <b>derived atom</b> for the filtered result so neither the filter nor the todos atom causes unnecessary re-renders in unrelated components.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
<li>Split state into two primitive atoms: one for <code>filter</code>, one for <code>todos</code>.</li>
<li>Create a <b>derived (read-only) atom</b> using a compute function — Jotai re-computes it only when its dependencies change and memoizes the result.</li>
<li>Components subscribe only to what they read: <code>FilterMenu</code> reads <code>filterAtom</code>, <code>TodoList</code> reads <code>filteredTodosAtom</code>. Changing todos doesn't re-render <code>FilterMenu</code>.</li>
</ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">import { atom, useAtom, useSetAtom, useAtomValue } from 'jotai';

// Primitive atoms
const filterAtom = atom&lt;'all' | 'active' | 'completed'&gt;('all');
const todosAtom = atom&lt;Todo[]&gt;([]);

// Derived atom — recomputes only when filter or todos changes
const filteredTodosAtom = atom((get) =&gt; {
  const todos = get(todosAtom);
  const filter = get(filterAtom);
  if (filter === 'active') return todos.filter((t) =&gt; !t.completed);
  if (filter === 'completed') return todos.filter((t) =&gt; t.completed);
  return todos;
});

// FilterMenu: only re-renders on filter change
const FilterMenu = () =&gt; {
  const [filter, setFilter] = useAtom(filterAtom);
  return &lt;SegmentedControl value={filter} onChange={setFilter} /&gt;;
};

// TodoList: only re-renders when filtered result changes
const TodoList = () =&gt; {
  const filtered = useAtomValue(filteredTodosAtom);
  return &lt;FlashList data={filtered} renderItem={renderTodo} estimatedItemSize={56} /&gt;;
};

// TodoItem: write-only, never re-renders from reads
const TodoItem = ({ id }: { id: string }) =&gt; {
  const setTodos = useSetAtom(todosAtom);
  const toggle = useCallback(() =&gt;
    setTodos((prev) =&gt; prev.map((t) =&gt; t.id === id ? { ...t, completed: !t.completed } : t)),
  [id]);
  …
};</div>`,
      },
    ],
  },
  {
    id: "perf-s16",
    kind: "coding",
    title: "View recycling · LegendList with recycleItems",
    level: "senior",
    tags: ["lists", "legendlist", "recycling"],
    promptHtml: `<p>You have a chat list where messages can contain text, images, or voice notes (three different layouts). Implement it using <code>LegendList</code> with <code>recycleItems</code> enabled. Show how to handle the recycling caveat — components receiving different item types must not carry over stale local state from the previous item.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
<li>LegendList recycles views by default when <code>recycleItems</code> is set. A <code>TextMessage</code> cell might be recycled for a <code>VoiceNote</code> item — any internal state (expanded, playing) must reset.</li>
<li>The fix: key internal state to the item's <code>id</code> using a <code>key</code> prop on the row renderer, or reset state in a <code>useEffect</code> that runs when the item changes.</li>
<li>Alternative: use <code>getType</code> prop so LegendList only recycles cells of the same type — the safest approach for heterogeneous lists.</li>
</ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">import { LegendList } from '@legendapp/list';

&lt;LegendList
  data={messages}
  keyExtractor={(m) =&gt; m.id}
  recycleItems            // enable recycling
  getType={(m) =&gt; m.type} // only recycle same-type cells ✅
  renderItem={({ item }) =&gt; {
    switch (item.type) {
      case 'text': return &lt;TextMessage message={item} /&gt;;
      case 'image': return &lt;ImageMessage message={item} /&gt;;
      case 'voice': return &lt;VoiceNote message={item} /&gt;;
    }
  }}
  estimatedItemSize={72}
/&gt;

// VoiceNote: reset playback state when item changes
const VoiceNote = ({ message }) =&gt; {
  const [playing, setPlaying] = useState(false);
  useEffect(() =&gt; {
    setPlaying(false); // reset on item change when recycled
  }, [message.id]);
  …
};</div>
<p><code>getType</code> tells LegendList to maintain separate recycle pools per message type — a text cell is never reused for a voice note. This eliminates the stale-state problem at the cost of slightly more memory (one pool per type). Measure: recycling only wins if your list has 50+ items and renderItem is expensive.</p>`,
      },
    ],
  },
  {
    id: "perf-s17",
    kind: "coding",
    title: "Native modules · avoid blocking the JS thread in a TurboModule",
    level: "senior",
    tags: ["native-modules", "turbomodules", "threading"],
    promptHtml: `<p>A TurboModule exposes a synchronous <code>readLargeFile(path)</code> method to JS. In testing, calling it freezes the app for 800 ms. Explain why this happens, and show the pattern to fix it — both the JS spec and the native implementation change needed.</p>`,
    reveal: [
      {
        label: "Why it freezes",
        html: `<p>Synchronous TurboModule methods run on the <b>JS thread</b> (via JSI's direct function call). Any blocking work — disk I/O, heavy computation — holds the JS thread for its full duration. During those 800 ms: no React renders, no state updates, no event handling. The UI is not completely frozen (native gestures still register on the UI thread) but JS is deaf.</p>
<p>Rule: synchronous TurboModule methods must be < 1 ms. Anything that can block goes async.</p>`,
      },
      {
        label: "Fix: async TurboModule",
        html: `<div class="code">// JS spec (NativeReadFileSpec.ts):
export interface Spec extends TurboModule {
  // Return Promise — async dispatch to native modules thread
  readLargeFile(path: string): Promise&lt;string&gt;;
}

// iOS (Swift) — runs on mqt_v_native (TurboModules pool thread):
@objc func readLargeFile(_ path: String,
  resolve: @escaping RCTPromiseResolveBlock,
  reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.global(qos: .userInitiated).async {
      let contents = try? String(contentsOfFile: path)
      resolve(contents)
    }
}

// Android (Kotlin) — also on mqt_v_native, dispatch to background:
override fun readLargeFile(path: String, promise: Promise) {
  val scope = CoroutineScope(Dispatchers.IO)
  scope.launch {
    val contents = File(path).readText()
    promise.resolve(contents)
  }
}

// JS call site:
const contents = await NativeReadFile.readLargeFile('/path/to/file');</div>
<p>Async methods are dispatched to the native modules thread (<code>mqt_v_native</code>) by React Native, freeing the JS thread immediately. If the native module pool is saturated, spawn your own background thread/coroutine as shown above.</p>`,
      },
    ],
  },
  {
    id: "perf-s18",
    kind: "coding",
    title: "On-device AI · streaming LLM chat with react-native-executorch",
    level: "senior",
    tags: ["on-device-ai", "executorch", "llm"],
    promptHtml: `<p>Build a minimal chat screen using <code>useLLM</code> from <code>react-native-executorch</code>. Requirements: (a) download progress bar before the model is ready, (b) streaming token-by-token response display, (c) a Stop button during generation, (d) safe unmount that prevents a crash when the LLM is generating.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
<li>The hook exposes <code>downloadProgress</code>, <code>isReady</code>, <code>isGenerating</code>, and a live <code>response</code> (updates token-by-token).</li>
<li>Call <code>interrupt()</code> on the Stop button and in a cleanup effect to prevent the crash caused by unmounting a generating model.</li>
<li>Only <b>one LLM instance</b> can be active at a time — unmounting without interrupting crashes the native runtime.</li>
</ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">import { useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { useLLM, models } from 'react-native-executorch';

export function ChatScreen() {
  const llm = useLLM({ model: models.llm.lfm2_5_1_2b_instruct() });
  const [input, setInput] = useState('');

  // Safe unmount — MUST interrupt before the component tears down
  useEffect(() =&gt; () =&gt; { if (llm.isGenerating) llm.interrupt(); }, []);

  if (!llm.isReady) return (
    &lt;View&gt;
      &lt;Text&gt;Loading model… {Math.round(llm.downloadProgress * 100)}%&lt;/Text&gt;
      &lt;ProgressBar progress={llm.downloadProgress} /&gt;
    &lt;/View&gt;
  );

  const send = async () =&gt; {
    const msg = input.trim();
    if (!msg || llm.isGenerating) return;
    setInput('');
    await llm.sendMessage(msg); // streams into llm.response token by token
  };

  return (
    &lt;View style={{ flex: 1 }}&gt;
      &lt;FlatList data={llm.messageHistory} keyExtractor={(_, i) =&gt; String(i)}
        renderItem={({ item }) =&gt; &lt;Text&gt;{item.role}: {item.content}&lt;/Text&gt;} /&gt;
      {llm.isGenerating &amp;&amp; &lt;Text&gt;{llm.response}&lt;/Text&gt;}
      {llm.isGenerating
        ? &lt;Button title="Stop" onPress={() =&gt; llm.interrupt()} /&gt;
        : &lt;&gt;&lt;TextInput value={input} onChangeText={setInput} /&gt;
           &lt;Button title="Send" onPress={send} /&gt;&lt;/&gt;}
    &lt;/View&gt;
  );
}</div>
<p>The unmount cleanup is non-negotiable — without it, navigating away while the LLM is generating crashes the app. Download large models from a URL (the default for <code>models.*</code> constants) rather than bundling — a 1B model is ~1 GB and would bloat every user's install.</p>`,
      },
    ],
  },
  {
    id: "perf-s19",
    kind: "coding",
    title: "On-device AI · speech-to-text with Whisper",
    level: "senior",
    tags: ["on-device-ai", "executorch", "speech-to-text"],
    promptHtml: `<p>Build a voice transcription screen using <code>useSpeechToText</code> from <code>react-native-executorch</code> and Whisper Tiny English. The flow: record audio → decode to 16kHz Float32Array → transcribe → display text. Show the key API calls and the audio format requirement.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
<li>Whisper expects a <b>16 kHz mono Float32Array</b>. Use <code>react-native-audio-api</code>'s <code>AudioContext</code> to decode any audio file to this format.</li>
<li><code>useSpeechToText</code> has the same lifecycle as <code>useLLM</code>: observe <code>isReady</code> / <code>downloadProgress</code> before calling <code>transcribe</code>.</li>
<li>For longer audio, use the streaming API (<code>streamInsert</code> + <code>stream</code> async generator) to get partial results while audio is still being processed.</li>
</ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">import { useSpeechToText, WHISPER_TINY_EN } from 'react-native-executorch';
import { AudioContext } from 'react-native-audio-api';
import * as FileSystem from 'expo-file-system';
import { useState } from 'react';

export function TranscribeScreen() {
  const model = useSpeechToText({ model: WHISPER_TINY_EN });
  const [transcript, setTranscript] = useState('');

  const transcribe = async (audioUrl: string) =&gt; {
    if (!model.isReady) return;

    // 1. Download audio to local cache
    const { uri } = await FileSystem.downloadAsync(
      audioUrl, FileSystem.cacheDirectory + 'audio.wav',
    );

    // 2. Decode to 16kHz mono Float32Array (Whisper's required format)
    const ctx = new AudioContext({ sampleRate: 16_000 });
    const decoded = await ctx.decodeAudioDataSource(uri);
    const waveform = decoded.getChannelData(0); // Float32Array @ 16kHz

    // 3. Transcribe
    const result = await model.transcribe(waveform);
    setTranscript(result.text);

    // Multilingual: model.transcribe(waveform, { language: 'es' })
    // Word timestamps: model.transcribe(waveform, { verbose: true })
    //   → result.segments[].words[]
  };

  if (!model.isReady) return &lt;Text&gt;Loading Whisper… {Math.round(model.downloadProgress * 100)}%&lt;/Text&gt;;
  return (
    &lt;View&gt;
      &lt;Button title="Transcribe" onPress={() =&gt; transcribe(AUDIO_URL)} /&gt;
      {transcript ? &lt;Text&gt;{transcript}&lt;/Text&gt; : null}
    &lt;/View&gt;
  );
}</div>
<p>Whisper Tiny English (~150 MB) transcribes a 30-second clip in ~3 s on a mid-range device. The multilingual <code>WHISPER_TINY</code> model handles 99+ languages but is slightly slower. For real-time transcription, use <code>streamInsert</code> to feed audio chunks as they arrive from the microphone.</p>`,
      },
    ],
  },
  {
    id: "perf-s20",
    kind: "coding",
    title: "On-device AI · real-time object detection with YOLO",
    level: "senior",
    tags: ["on-device-ai", "executorch", "computer-vision"],
    promptHtml: `<p>Build a screen that uses <code>useObjectDetection</code> from <code>react-native-executorch</code> with YOLO26N to detect objects in a photo. Show: (a) loading and running inference, (b) interpreting the bounding box output, and (c) how to use <code>runOnFrame</code> for real-time VisionCamera integration.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ul>
<li><code>forward(imagePath, options)</code> runs inference on a local image file and returns an array of detections.</li>
<li>Each detection has <code>bbox: { x1, y1, x2, y2 }</code> (normalized 0-1 coordinates), <code>label</code> (class name), and <code>score</code> (confidence 0-1).</li>
<li><code>runOnFrame</code> is a VisionCamera frame processor worklet — it runs on the UI thread for every camera frame, enabling real-time detection without going through JS.</li>
</ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">import { useObjectDetection, YOLO26N } from 'react-native-executorch';
import * as ImagePicker from 'expo-image-picker';

export function DetectScreen() {
  const model = useObjectDetection({ model: YOLO26N });
  const [detections, setDetections] = useState([]);

  const detect = async () =&gt; {
    const result = await ImagePicker.launchImageLibraryAsync();
    if (result.canceled || !model.isReady) return;

    const imagePath = result.assets[0].uri;
    const hits = await model.forward(imagePath, {
      detectionThreshold: 0.5, // confidence cutoff
      inputSize: 640,           // YOLO supports 384/512/640
    });
    // hits: Array&lt;{ bbox: {x1,y1,x2,y2}, label: string, score: number }&gt;
    setDetections(hits);
  };

  if (!model.isReady) return &lt;Text&gt;Loading YOLO… {Math.round(model.downloadProgress * 100)}%&lt;/Text&gt;;
  return (
    &lt;View&gt;
      &lt;Button title="Pick Photo" onPress={detect} /&gt;
      {detections.map((d, i) =&gt; (
        &lt;Text key={i}&gt;{d.label} ({Math.round(d.score * 100)}%) @ {JSON.stringify(d.bbox)}&lt;/Text&gt;
      ))}
    &lt;/View&gt;
  );
}

// Real-time VisionCamera integration (UI-thread worklet):
const frameProcessor = useFrameProcessor((frame) =&gt; {
  'worklet';
  const hits = model.runOnFrame(frame, { detectionThreshold: 0.4 });
  runOnJS(setDetections)(hits);
}, [model]);</div>
<p>YOLO26N is the nano variant — fast and small (~6 MB). Use <code>YOLO26S</code> or <code>RF-DETR</code> for higher accuracy at the cost of speed. For real-time use, <code>runOnFrame</code> runs entirely on the UI thread as a VisionCamera worklet — no JS-thread involvement, so inference doesn't compete with React re-renders.</p>`,
      },
    ],
  },
];
