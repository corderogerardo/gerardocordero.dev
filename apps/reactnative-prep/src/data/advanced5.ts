// Batch 5 — junior foundations, React patterns (deeper vercel-react-best-practices),
// production observability (expo-observe), DOM components (use-dom), and
// architect-level system design. Cards carry an explicit seniority `level`.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

/** New flashcard category this batch adds. */
export const ADVANCED5_FLASHCARD_FILTERS: { value: string; label: string }[] = [
  { value: "react", label: "React Patterns" },
];

export const ADVANCED5_FLASHCARDS: Flashcard[] = [
  // ---------- Junior foundations ----------
  {
    id: "j-1",
    category: "rn",
    categoryLabel: "RN",
    level: "junior",
    question: "What's the difference between props and state?",
    answerHtml:
      "<b>Props</b> are inputs passed <i>into</i> a component by its parent — read-only from the child's view. <b>State</b> is data a component <b>owns and changes</b> over time with <code>useState</code>; updating it re-renders the component. Lift state up to the closest common parent when siblings need it.",
  },
  {
    id: "j-2",
    category: "rn",
    categoryLabel: "RN",
    level: "junior",
    question: "What do useState and useEffect do?",
    answerHtml:
      "<code>useState</code> holds local state and returns a setter that re-renders on change. <code>useEffect</code> runs <b>side effects</b> after render (subscriptions, fetches, timers) and returns an optional <b>cleanup</b> that runs on unmount / before the next run. Its dependency array controls when it re-runs.",
  },
  {
    id: "j-3",
    category: "rn",
    categoryLabel: "RN",
    level: "junior",
    question: "Why use FlatList instead of mapping items in a ScrollView?",
    answerHtml:
      "A <code>ScrollView</code> mounts <b>every</b> child immediately; a long list janks and spikes memory. <code>FlatList</code> <b>virtualizes</b> — it renders only what's on screen and recycles as you scroll. Give it <code>data</code>, <code>renderItem</code>, and a stable <code>keyExtractor</code>.",
  },
  {
    id: "j-4",
    category: "state",
    categoryLabel: "STATE",
    level: "junior",
    question: "Why does a list need a stable key — and why not the array index?",
    answerHtml:
      "React uses <code>key</code> to match elements across renders. A <b>stable unique id</b> lets it reuse and reorder correctly. The <b>array index</b> changes when items insert/move/delete, so React reuses the wrong element → wrong data, lost input, and visual glitches.",
  },
  {
    id: "j-5",
    category: "rn",
    categoryLabel: "RN",
    level: "junior",
    question: "How do you lay out UI in React Native?",
    answerHtml:
      "With <b>Flexbox</b> via <code>style</code> — <code>flexDirection</code> (default <b>column</b>, unlike web's row), <code>justifyContent</code>, <code>alignItems</code>, <code>flex</code>, and <code>gap</code>. Use <code>StyleSheet.create</code> (or NativeWind/Tailwind), and avoid magic numbers from <code>Dimensions</code>.",
  },
  {
    id: "j-6",
    category: "data",
    categoryLabel: "DATA",
    level: "junior",
    question: "What's the minimum correct way to fetch data?",
    answerHtml:
      "<code>await fetch(url)</code>, then <b>check <code>response.ok</code></b> before parsing, and handle the loading and error states: <code>if (!res.ok) throw new Error(res.status)</code>. Don't just <code>.then(r =&gt; r.json())</code> — that silently swallows HTTP errors.",
  },
  {
    id: "j-7",
    category: "rn",
    categoryLabel: "RN",
    level: "junior",
    question: "What is JSX, really?",
    answerHtml:
      "Syntactic sugar for function calls: <code>&lt;View /&gt;</code> compiles to <code>React.createElement(View, …)</code>. It describes <b>what</b> the UI should look like for the current state; React reconciles that description against the previous one and updates the native views.",
  },
  {
    id: "j-8",
    category: "test",
    categoryLabel: "TEST",
    level: "junior",
    question: "What's the simplest useful test for a component?",
    answerHtml:
      "Render it and assert on <b>behavior</b>, not implementation: with React Native Testing Library, <code>render(&lt;X /&gt;)</code>, find by accessible role/text, fire an event, and assert the result. Test what the user sees and does — not internal state.",
  },
  {
    id: "j-9",
    category: "expo",
    categoryLabel: "EXPO",
    level: "junior",
    question: "What is Expo Router, and how do you make a screen?",
    answerHtml:
      "<b>File-based</b> routing — a file in <code>app/</code> is a route, and <code>app/index.tsx</code> is <code>/</code>. Navigate with <code>&lt;Link href=&quot;/profile&quot; /&gt;</code> or <code>router.push()</code>. <code>_layout.tsx</code> defines the stack/tabs for a folder.",
  },
  {
    id: "j-10",
    category: "expo",
    categoryLabel: "EXPO",
    level: "junior",
    question: "Expo Go vs a development build — what's the difference?",
    answerHtml:
      "<b>Expo Go</b> is a prebuilt sandbox app — scan a QR code and run your JS instantly; great for learning and most <code>expo-*</code> features. A <b>development build</b> is your own app binary that also bundles <b>custom native code</b> — needed once you add native modules Expo Go doesn't include.",
  },

  // ---------- React patterns (vercel-react-best-practices, deeper) ----------
  {
    id: "rp-1",
    category: "react",
    categoryLabel: "REACT",
    level: "mid",
    question: "Why derive state during render instead of syncing it in an effect?",
    answerHtml:
      "If a value is computable from props/state (e.g. <code>fullName = first + ' ' + last</code>), compute it <b>in render</b>. Storing it in state + a <code>useEffect</code> causes an extra render and risks the two drifting apart. Rule: don't <code>setState</code> in an effect just to mirror props.",
  },
  {
    id: "rp-2",
    category: "react",
    categoryLabel: "REACT",
    level: "mid",
    question: "When should a value be a ref instead of state?",
    answerHtml:
      "When it changes <b>often</b> but shouldn't trigger a re-render — a mouse position, a scroll offset, an interval id, a 'has-run' flag. <code>useRef</code> updates don't re-render; keep <code>useState</code> for values the UI actually displays.",
  },
  {
    id: "rp-3",
    category: "react",
    categoryLabel: "REACT",
    level: "senior",
    question: "How do you run app-wide initialization exactly once?",
    answerHtml:
      "<b>Not</b> in a component's <code>useEffect([])</code> — components remount and StrictMode double-invokes effects in dev. Use a <b>module-level guard</b> or run it in the entry module, so it runs once per app load, not per mount.",
  },
  {
    id: "rp-4",
    category: "react",
    categoryLabel: "REACT",
    level: "mid",
    question: "Why subscribe to derived booleans instead of raw continuous values?",
    answerHtml:
      "A component reading a continuous value (window width) re-renders on every pixel change. Subscribe to the <b>derived boolean</b> you actually use (<code>isMobile = width &lt; 768</code>) so it only re-renders when that flips — far fewer renders.",
  },
  {
    id: "rp-5",
    category: "react",
    categoryLabel: "REACT",
    level: "senior",
    question: "In React Server Components, how do you avoid a server-side fetch waterfall?",
    answerHtml:
      "RSCs execute <b>sequentially down the tree</b>, so a parent's <code>await</code> blocks its children. <b>Restructure with composition</b> (or <code>Promise.all</code>) so sibling components fetch in <b>parallel</b>, and wrap slow parts in <code>&lt;Suspense&gt;</code> to stream the shell first.",
  },
  {
    id: "rp-6",
    category: "react",
    categoryLabel: "REACT",
    level: "mid",
    question: "What does Next.js after() do?",
    answerHtml:
      "Schedules work to run <b>after the response is sent</b> — logging, analytics, cache warming — so those side effects don't block the user's response. It's the server-side 'don't make the user wait for non-critical work'.",
  },
  {
    id: "rp-7",
    category: "react",
    categoryLabel: "REACT",
    level: "mid",
    question: "When do you reach for a Set/Map over an array?",
    answerHtml:
      "For repeated <b>membership or lookup</b> checks. <code>array.includes()</code> in a loop is O(n) each — O(n²) overall. A <code>Set</code> (membership) or <code>Map</code> (keyed lookup) makes each check <b>O(1)</b>. Build it once, then query.",
  },

  // ---------- Production observability (expo-observe) ----------
  {
    id: "ob-1",
    category: "perf",
    categoryLabel: "PERF",
    level: "senior",
    question: "What does EAS Observe measure, and how do you wire it?",
    answerHtml:
      "Production <b>startup, navigation, and custom-event performance</b>. Wrap the root layout in <code>ObserveRoot</code> (SDK 56+) / <code>AppMetricsRoot</code> (SDK 55), call <code>markInteractive()</code> (via <code>useObserve()</code>) when the screen is usable, and add the Expo Router integration for per-route metrics.",
  },
  {
    id: "ob-2",
    category: "perf",
    categoryLabel: "PERF",
    level: "senior",
    question: "What's the difference between TTR and TTI?",
    answerHtml:
      "<b>TTR</b> (time-to-render) is when the first content paints; <b>TTI</b> (time-to-interactive) is when the user can actually <i>use</i> it. TTI is the headline metric — a screen can paint fast yet be janky or blocked. EAS Observe reports both, for cold and warm launches.",
  },
  {
    id: "ob-3",
    category: "perf",
    categoryLabel: "PERF",
    level: "senior",
    question: "Cold vs warm launch — why measure them separately?",
    answerHtml:
      "A <b>cold</b> start initializes the native app + JS from scratch (the worst case, what first-run users feel); a <b>warm</b> start resumes a backgrounded app. Their budgets differ, so averaging them hides regressions. Optimize and track <b>cold start</b> specifically.",
  },
  {
    id: "ob-4",
    category: "perf",
    categoryLabel: "PERF",
    level: "senior",
    question: "How do you tell 'slow but smooth' startup from 'main-thread blocked'?",
    answerHtml:
      "Read the TTI <b>frameRate</b> params: steady frames but a long TTI means too much <i>work</i> (do less / defer it); dropped frames or stalls mean <b>main-thread contention</b> or a hard block (move work off the UI thread). The metric tells you which fix to reach for.",
  },

  // ---------- DOM components (use-dom) ----------
  {
    id: "dom-1",
    category: "expo",
    categoryLabel: "EXPO",
    level: "beyond",
    question: "What are Expo DOM components and the 'use dom' directive?",
    answerHtml:
      "Adding <code>'use dom';</code> to the top of a component runs that component's <b>web code in a WebView</b> on native (and as-is on web). It lets you drop in web-only libraries — charts (recharts), syntax highlighters, rich-text editors, Canvas/WebGL — without rewriting them for native.",
  },
  {
    id: "dom-2",
    category: "expo",
    categoryLabel: "EXPO",
    level: "beyond",
    question: "When should you NOT use a DOM component?",
    answerHtml:
      "When <b>native performance is critical</b> (WebViews add overhead), for <b>simple UI</b> (RN views are lighter), for <b>deep native integration</b> (use a native module), and for <code>_layout</code> files (they can't be DOM components). It's a bridge for web-only capability, not a default.",
  },
  {
    id: "dom-3",
    category: "expo",
    categoryLabel: "EXPO",
    level: "beyond",
    question: "Why are DOM components useful for migration?",
    answerHtml:
      "They let you bring an <b>existing React web codebase into a native app incrementally</b> — ship the web component as-is in a WebView today, then rewrite the highest-value screens as native RN over time. Web-to-native without a big-bang rewrite.",
  },

  // ---------- Architect system design ----------
  {
    id: "sd-1",
    category: "arch",
    categoryLabel: "ARCH",
    level: "architect",
    question: "What's the senior framework for a mobile system-design question?",
    answerHtml:
      "Design for the <b>worst phone, worst network, worst moment</b> — not lab conditions. Use a structured pass like <b>CRDDS</b> (Clarify → Requirements → Data → Design → Scale): clarify scope, list functional + non-functional needs, model the data and sync, design the layers, then talk scale and failure modes.",
  },
  {
    id: "sd-2",
    category: "arch",
    categoryLabel: "ARCH",
    level: "architect",
    question: "What are the layers of a well-structured mobile app?",
    answerHtml:
      "A <b>4-layer</b> split: <b>UI</b> (screens/components), <b>state</b> (client + server state), <b>domain/data</b> (use-cases, repositories, caching), and <b>platform/native</b> (modules, storage, networking). Dependencies point inward, so you can swap an implementation without touching the UI.",
  },
  {
    id: "sd-3",
    category: "arch",
    categoryLabel: "ARCH",
    level: "architect",
    question: "How do you design offline-first?",
    answerHtml:
      "Make the <b>local store the source of truth</b>: render from it instantly, queue mutations, and sync to the network in the background with conflict resolution (last-write-wins or merge). Add <b>optimistic updates</b> with rollback. The network keeps the local DB in sync — not the other way round.",
  },
  {
    id: "sd-4",
    category: "arch",
    categoryLabel: "ARCH",
    level: "architect",
    question: "How do you choose a real-time transport on mobile?",
    answerHtml:
      "Match the need: <b>WebSocket</b> for bidirectional / low-latency (chat, presence), <b>SSE</b> for server→client streams, <b>polling</b> for simple low-frequency updates, and <b>push</b> for out-of-app delivery. Plan for reconnection, backoff, and battery — and degrade gracefully on a bad network.",
  },
  {
    id: "sd-5",
    category: "arch",
    categoryLabel: "ARCH",
    level: "architect",
    question: "How do you keep crash rate and tech debt under control at scale?",
    answerHtml:
      "<b>Measure first</b> (crash-free rate via Sentry/Crashlytics, EAS Observe), refactor behind tests in small steps, <b>strangle</b> legacy patterns gradually rather than big-bang, and tie every refactor to a metric (startup, crash rate, re-renders). Make the safe path the easy path via shared packages and conventions.",
  },
  {
    id: "sd-6",
    category: "arch",
    categoryLabel: "ARCH",
    level: "architect",
    question: "How does an architect multiply a team, not just write code?",
    answerHtml:
      "Build <b>leverage</b>: shared UI/util packages others depend on, conventions and lint/types that make mistakes hard, a fast CI loop, code review that teaches, and clear docs/ADRs. The output is a team that ships safely without you in the loop — that's the role.",
  },
];

/** New quiz category this batch adds. */
export const ADVANCED5_QUIZ_FILTERS: { value: string; label: string }[] = [
  { value: "react", label: "React" },
];

export const ADVANCED5_QUIZ: QuizQuestion[] = [
  {
    id: "b5-z1",
    category: "react",
    categoryLabel: "React",
    question: "Props vs state — which is right?",
    options: [
      "Both are owned and mutated by the component",
      "Props are read-only inputs from the parent; state is owned and changeable",
      "State is passed in; props change over time",
      "They're the same thing",
    ],
    answer: 1,
    explanationHtml:
      "Props flow in from the parent (read-only); state is local data the component owns and updates with <code>useState</code>, triggering a re-render.",
  },
  {
    id: "b5-z2",
    category: "perf",
    categoryLabel: "Performance",
    question: "Why use FlatList over a ScrollView for a long list?",
    options: [
      "It looks nicer",
      "It virtualizes — renders only visible rows",
      "It runs on the GPU",
      "It caches images",
    ],
    answer: 1,
    explanationHtml:
      "FlatList virtualizes and recycles rows; a ScrollView mounts every child up front, which janks and uses more memory.",
  },
  {
    id: "b5-z3",
    category: "react",
    categoryLabel: "React",
    question: "Should you store derived data in state and sync it with a useEffect?",
    options: [
      "Yes, always",
      "No — derive it during render instead",
      "Only on the server",
      "Only with Redux",
    ],
    answer: 1,
    explanationHtml:
      "Deriving during render avoids an extra render and state drift. Don't <code>setState</code> in an effect just to mirror props/state.",
  },
  {
    id: "b5-z4",
    category: "react",
    categoryLabel: "React",
    question: "A value changes every frame but shouldn't re-render the UI. Use…",
    options: ["useState", "useRef", "useMemo", "useContext"],
    answer: 1,
    explanationHtml:
      "<code>useRef</code> holds a mutable value without triggering re-renders — ideal for transient values like scroll offsets or timers.",
  },
  {
    id: "b5-z5",
    category: "react",
    categoryLabel: "React",
    question: "How do you fix a React Server Component fetch waterfall?",
    options: [
      "Add more useEffect calls",
      "Compose siblings / use Promise.all so fetches run in parallel",
      "Disable Suspense",
      "Move everything to the client",
    ],
    answer: 1,
    explanationHtml:
      "RSCs run sequentially down the tree; parallelize independent fetches via composition or <code>Promise.all</code>, and stream with Suspense.",
  },
  {
    id: "b5-z6",
    category: "perf",
    categoryLabel: "Performance",
    question: "Time-to-Interactive (TTI) measures…",
    options: [
      "When the first pixels paint",
      "When the user can actually interact with the screen",
      "Total download size",
      "Frames per second",
    ],
    answer: 1,
    explanationHtml:
      "TTI is when the screen is usable; first paint is TTR. A screen can render fast but still be blocked/janky — TTI is the headline.",
  },
  {
    id: "b5-z7",
    category: "expo",
    categoryLabel: "Expo",
    question: "The 'use dom' directive makes a component…",
    options: [
      "Render faster natively",
      "Run its web code in a WebView on native",
      "Disable JavaScript",
      "Become a layout route",
    ],
    answer: 1,
    explanationHtml:
      "<code>'use dom'</code> runs the component's web code in a WebView on native (as-is on web) — for web-only libraries and incremental migration.",
  },
  {
    id: "b5-z8",
    category: "arch",
    categoryLabel: "Architecture",
    question: "In an offline-first design, the source of truth is…",
    options: [
      "The server",
      "The local store; the network syncs it in the background",
      "The Redux store only",
      "The component state",
    ],
    answer: 1,
    explanationHtml:
      "Render instantly from the local DB, queue mutations, and sync to the network in the background with conflict resolution and optimistic updates.",
  },
];

/** New study sessions for batch 5. */
export const ADVANCED5_STUDY: StudySection[] = [
  {
    id: "st-32",
    num: "32",
    title: "32 · Foundations (junior → mid)",
    html: `<p><b>Core:</b> the fundamentals everything else stands on. A component renders UI from <b>props</b> (inputs) and <b>state</b> (owned, changeable). React <b>reconciles</b> your JSX against the previous render and updates the native views — so list <b>keys</b> must be stable unique ids, not array indexes.</p>
      <ul>
        <li><b>Hooks</b>: <code>useState</code> for local state, <code>useEffect</code> for side effects (always clean up).</li>
        <li><b>Lists</b>: <code>FlatList</code> (virtualized), never <code>map</code> inside a <code>ScrollView</code> for long data.</li>
        <li><b>Layout</b>: Flexbox (<code>flexDirection</code> defaults to <b>column</b>), <code>StyleSheet</code> or NativeWind.</li>
        <li><b>Data</b>: <code>fetch</code> + check <code>response.ok</code> + handle loading/error; graduate to React Query for caching.</li>
        <li><b>Run it</b>: Expo Go for fast iteration, a dev build once you add native code.</li>
      </ul>
      <div class="callout tip"><span class="lbl">New concept</span> Build the mental model: <b>state → re-render → reconcile → commit</b>. Most bugs and perf issues trace back to misunderstanding which step you're in.</div>
      <div class="map"><span class="lbl">Your proof</span> With <b>10 years of JavaScript and 8 of React</b>, these are second nature for you — the value at this level is <b>teaching</b> them clearly, which you've done mentoring juniors.</div>`,
  },
  {
    id: "st-33",
    num: "33",
    title: "33 · Production observability & startup",
    html: `<p><b>Core:</b> once it ships, you run on <b>production signals</b>, not dev profiling. <b>EAS Observe</b> tracks startup, navigation, and custom-event performance: wrap the root in <code>ObserveRoot</code>, call <code>markInteractive()</code> when the screen is usable, and add the Expo Router integration for per-route metrics.</p>
      <ul>
        <li><b>TTR vs TTI</b>: first paint vs actually-usable — TTI is the headline.</li>
        <li><b>Cold vs warm</b>: optimize and track <b>cold start</b> separately; it's what first-run users feel.</li>
        <li><b>Diagnose</b>: steady frames + long TTI = too much work (defer it); dropped frames = main-thread contention (move off the UI thread).</li>
        <li><b>Crashes</b>: crash-free rate (Sentry/Crashlytics) with source maps; gate or roll back on a spike.</li>
      </ul>
      <div class="callout tip"><span class="lbl">New concept</span> <b>Measure production, not just dev.</b> Real devices and networks surface what your laptop never will — instrument the metrics that map to user pain (TTI, crash-free rate).</div>
      <div class="map"><span class="lbl">Your proof</span> You used <b>App Center analytics</b> and owned <b>production releases</b> on Valt — wiring observability and reading startup metrics is a natural extension of work you've already done.</div>`,
  },
  {
    id: "st-34",
    num: "34",
    title: "34 · Architect-level system design",
    html: `<p><b>Core:</b> architecture is <b>decision-making before code</b>, designed for the <b>worst phone, worst network, worst moment</b>. Run a structured pass (<b>CRDDS</b>: Clarify → Requirements → Data → Design → Scale) and lay the app out in <b>4 layers</b> — UI, state, domain/data, platform/native — with dependencies pointing inward.</p>
      <ul>
        <li><b>Offline-first</b>: the local store is the source of truth; queue mutations, sync in the background, resolve conflicts, update optimistically.</li>
        <li><b>Real-time</b>: pick WebSocket / SSE / polling / push by need; plan reconnection, backoff, battery.</li>
        <li><b>Stability at scale</b>: measure first, strangle legacy gradually, tie every refactor to a metric.</li>
        <li><b>Leverage</b>: shared packages, conventions, lint/types, fast CI, teaching reviews — multiply the team.</li>
      </ul>
      <div class="callout tip"><span class="lbl">New concept</span> The architect's output isn't code — it's <b>good decisions and team leverage</b>: a system that's correct under the worst conditions and a team that ships safely without you in the loop.</div>
      <div class="map"><span class="lbl">Your proof</span> You architected a <b>schema-driven Form Builder</b> reused across a Turborepo, integrated <b>Twilio real-time chat</b>, and shipped <b>version-based cache invalidation</b> — that's offline/real-time/stability architecture in production.</div>`,
  },
  {
    id: "st-35",
    num: "35",
    title: "35 · React patterns that scale",
    html: `<p><b>Core:</b> the cross-cutting React habits that keep apps fast as they grow — fewer renders, no waterfalls. <b>Derive</b> values during render instead of syncing them in effects; reach for a <b>ref</b> when a value changes often but shouldn't re-render; and run app-wide <b>init once</b> (module guard), not in a component effect.</p>
      <ul>
        <li>Subscribe to <b>derived booleans</b> (<code>isMobile</code>), not raw continuous values.</li>
        <li>Kill <b>waterfalls</b>: parallelize independent fetches (<code>Promise.all</code> / RSC composition), stream with Suspense.</li>
        <li>Push non-critical work off the response with <code>after()</code>; load analytics after hydration.</li>
        <li>Use <b>Set/Map</b> for O(1) lookups instead of <code>array.includes</code> in a loop.</li>
      </ul>
      <div class="callout tip"><span class="lbl">New concept</span> Most React performance is <b>not</b> memoization — it's not re-rendering when you don't need to and not waterfalling data. Fix those first.</div>
      <div class="map"><span class="lbl">Your proof</span> Your re-render and frozen-screen fixes on Valt are exactly this discipline — these patterns name the habits behind that work and extend them to data fetching.</div>`,
  },
];
