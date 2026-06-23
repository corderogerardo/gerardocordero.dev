// Content migrated from the original single-file study guide. These typed modules are now the source of truth — edit directly.
import type { Level } from "@/lib/levels";

export type Flashcard = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  answerHtml: string;
  /** Optional seniority level; defaults are derived per-category in lib/levels. */
  level?: Level;
};

export const FLASHCARD_FILTERS: { value: string; label: string }[] = [
  {
    "value": "all",
    "label": "All"
  },
  {
    "value": "rn",
    "label": "React Native"
  },
  {
    "value": "arch",
    "label": "Architecture"
  },
  {
    "value": "state",
    "label": "State & Data"
  },
  {
    "value": "perf",
    "label": "Performance"
  },
  {
    "value": "test",
    "label": "Testing/CI"
  },
  {
    "value": "behavior",
    "label": "Behavioral"
  },
  {
    "value": "opt",
    "label": "Optimization"
  },
  {
    "value": "ai",
    "label": "On-Device AI"
  }
];

export const FLASHCARDS: Flashcard[] = [
  {
    "id": "q1",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "What is React Native's New Architecture and what problem does it solve?",
    "answerHtml": "It replaces the legacy async <b>Bridge</b> with four pieces: <b>JSI</b> (direct JS↔C++ calls, no JSON serialization), <b>Fabric</b> (a new concurrent renderer), <b>TurboModules</b> (lazy native modules), and <b>Codegen</b> (type-safe native interfaces from TS specs). The problem it solves is the bridge bottleneck — everything used to be serialized to JSON and batched asynchronously, which caused jank and slow startup. It's the default since RN 0.76."
  },
  {
    "id": "q2",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "What is JSI and why does it matter?",
    "answerHtml": "JSI (JavaScript Interface) is a lightweight C++ layer that lets JavaScript hold references to native objects and call their methods <b>synchronously</b>, without serializing to JSON over the bridge. It matters because it removes the single biggest performance bottleneck and enables Fabric and TurboModules. It also makes the engine swappable — that's how Hermes plugs in."
  },
  {
    "id": "q3",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "How is Fabric different from the old (Paper) renderer?",
    "answerHtml": "Fabric is the new renderer built on JSI with a shared C++ <b>shadow tree</b>. It supports synchronous layout, concurrent React features (Suspense, transitions), and better interop with native views. The old Paper renderer was async-only and couldn't take advantage of React 18+ concurrency."
  },
  {
    "id": "q4",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "TurboModules vs the old NativeModules?",
    "answerHtml": "NativeModules were all initialized eagerly at startup, even unused ones. TurboModules are <b>lazy</b> — loaded on first access via JSI — which cuts startup time and memory. They're also type-safe through Codegen."
  },
  {
    "id": "q5",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "What is Hermes and why use it?",
    "answerHtml": "Hermes is the JS engine built for React Native. It precompiles JS to <b>bytecode</b> at build time, so there's no parse step at launch — giving faster startup, lower memory use, and smaller app size. It's the default engine in the New Architecture, with improved garbage collection."
  },
  {
    "id": "q6",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "How many threads does React Native use and what runs where?",
    "answerHtml": "Classically three: the <b>JS thread</b> (your React code and logic), the <b>native/UI (main) thread</b> (rendering, gestures, native views), and a <b>shadow thread</b> for Yoga layout. Jank usually means you blocked the JS thread. Libraries like Reanimated run animations on the UI thread so they stay smooth even when JS is busy."
  },
  {
    "id": "q7",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "What does “bridgeless” mode mean?",
    "answerHtml": "Bridgeless removes the legacy bridge entirely — all JS↔native communication goes through JSI/Fabric/TurboModules. It became the default with the New Architecture, and the old bridge is being fully removed (disabled by default around RN 0.82). Result: faster startup and lower latency on native calls."
  },
  {
    "id": "q8",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "Expo vs bare React Native — when would you pick which?",
    "answerHtml": "Expo gives you managed builds, EAS Build/Update, config plugins, and a huge module library — great velocity, and modern Expo fully supports native code and the New Architecture. You go bare (or eject) only when you need something Expo's tooling truly can't express. For most teams today, Expo + dev clients is the productive default."
  },
  {
    "id": "q9",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "Since which version is the New Architecture the default?",
    "answerHtml": "Default since <b>React Native 0.76</b> (late 2024), with Hermes as the default engine. Subsequent releases keep hardening it, and the legacy bridge is being removed (disabled by default around 0.82). Quoting this signals you're current."
  },
  {
    "id": "q10",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "How would you integrate a native SDK that has no RN wrapper?",
    "answerHtml": "Write a thin <b>TurboModule</b> (or native module) that exposes just the methods you need: define a TS spec, implement it in Swift/Kotlin, bridge events via the emitter, and handle build config (Pods/Gradle, permissions). Keep the JS surface small and typed. I've done this kind of native glue — e.g. patching PSPDFKit and writing camera-permission hooks."
  },
  {
    "id": "q11",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "Walk me through how you'd approach a mobile system design question.",
    "answerHtml": "I use <b>CRDDS</b>: <b>Clarify</b> requirements (functional/non-functional, scale, platforms, offline) for several minutes first; sketch a <b>Rough HLD</b> with the four layers; <b>Deep-dive</b> one key component; <b>Discuss trade-offs</b> explicitly; then <b>Summarize</b> and handle follow-ups. The discipline is: clarify before designing, and always say the trade-off out loud."
  },
  {
    "id": "q12",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "What are the core layers of a mobile app architecture?",
    "answerHtml": "<b>UI/Presentation</b> (screens, components — render state, emit events), <b>Business/Domain</b> (use-cases, validation — framework-agnostic and most testable), <b>Data/Repository</b> (combines remote + local, caching, DTO→model mapping), and <b>Network</b> (HTTP client, serialization, interceptors). The UI talks to repositories, never directly to the API."
  },
  {
    "id": "q13",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "What is the repository pattern and why use it?",
    "answerHtml": "A repository is the single entry point for a domain's data. It hides whether data comes from network, cache, or DB, handles the stale-while-revalidate logic, and maps DTOs to clean domain models. Benefits: the UI stays decoupled from data sources, it's easy to test with a fake repo, and caching/offline logic lives in one place."
  },
  {
    "id": "q14",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "What does “offline-first” mean and how do you build it?",
    "answerHtml": "The <b>local database is the source of truth</b>; the network just syncs it. The UI always reads local data, so the app works with no signal. Building blocks: optimistic updates for instant feedback, a sync queue that replays offline mutations when connectivity returns, and a conflict-resolution strategy (last-write-wins, server-wins, or merge) per data type."
  },
  {
    "id": "q15",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "How do optimistic updates work, and how do you roll back?",
    "answerHtml": "You apply the change to local state and update the UI immediately, before the server confirms — so an action like a like or bookmark feels instant. You keep the previous value; if the request fails, you roll back to it and surface an error. React Query's <code>onMutate</code>/<code>onError</code>/<code>onSettled</code> is the canonical implementation. I shipped exactly this across profiles and bookmarks on Valt."
  },
  {
    "id": "q16",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "Cache eviction vs cache invalidation?",
    "answerHtml": "<b>Eviction</b> removes data to free space — LRU (drop least-recently-used) or TTL (expire after N seconds). <b>Invalidation</b> is knowing data is stale and refetching — time-based, event-based (a mutation or push invalidates a key), or version-based (bump a version to bust old clients). Eviction is about memory; invalidation is about correctness."
  },
  {
    "id": "q17",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "Explain stale-while-revalidate.",
    "answerHtml": "Show cached (possibly stale) data immediately so the screen is instant, then fetch fresh data in the background and reconcile the UI when it arrives. It's the core of React Query and SWR and the reason well-built apps feel fast — the user almost never stares at a spinner."
  },
  {
    "id": "q18",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "WebSocket vs SSE vs polling vs push — when do you use each?",
    "answerHtml": "<b>WebSocket</b> for two-way, low-latency (chat, presence, trading). <b>SSE</b> for one-way server→client streams (feeds, live scores). <b>Polling/long-polling</b> for simple or low-frequency updates without socket infra. <b>Push (FCM/APNs)</b> when the app is backgrounded or killed. Don't hold a socket open for occasional updates — it drains battery via radio tail energy."
  },
  {
    "id": "q19",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "Offset vs cursor vs keyset pagination?",
    "answerHtml": "<b>Offset/limit</b> is simple and supports jump-to-page but breaks under inserts and is slow on big tables. <b>Cursor</b> uses an opaque token to the next slice — stable for infinite feeds (usually the right answer). <b>Keyset</b> (<code>WHERE id &lt; lastId</code>) is fastest for very large datasets. For a social feed, cursor."
  },
  {
    "id": "q20",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "What makes a robust API client?",
    "answerHtml": "Six separated pieces: HTTP engine, serializer, a typed service interface, <b>interceptors</b> (auth token, logging, retries), DTOs matching server JSON, and a repository that adds caching. Plus sane timeouts, a result type for errors, and retry-with-backoff only on idempotent calls. DTOs never leak into the UI."
  },
  {
    "id": "q21",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "MVVM vs MVI — and where does React Native land?",
    "answerHtml": "MVVM exposes observable state from a view-model that the view binds to. MVI adds strict <b>one-way data flow</b> with immutable state and reducers (intent → state → render). React Native is essentially MVVM/MVI: components observe a store, dispatch actions, and unidirectional flow re-renders the UI. MVI's predictability shines in complex, experiment-heavy screens."
  },
  {
    "id": "q22",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "How does Zustand work, and what's “selector discipline”?",
    "answerHtml": "You create a store with <code>create()</code> holding state + actions. Components subscribe with a <b>selector</b> — <code>useStore(s =&gt; s.user)</code> — and re-render only when that slice changes. Selector discipline means selecting the narrowest slice and using <code>shallow</code> equality for objects, so you don't re-render on unrelated updates. No providers, and you can read/write the store outside React too."
  },
  {
    "id": "q23",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "Explain MobX's core model.",
    "answerHtml": "MobX is transparent reactive state: mark state <code>observable</code>, wrap components in <code>observer()</code>, and they auto-re-render when the exact observables they read change. You mutate state directly inside <code>action</code>s, and <code>computed</code> values are cached derivations. Mental model: a spreadsheet — change a cell, dependent formulas recalculate automatically."
  },
  {
    "id": "q24",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "Zustand vs MobX vs Redux — trade-offs?",
    "answerHtml": "<b>Redux</b>: explicit, predictable, lots of boilerplate, great devtools/time-travel. <b>Zustand</b>: minimal, selector-based, low ceremony, easy to scale. <b>MobX</b>: least boilerplate, mutable + automatic reactivity, very ergonomic but the magic can hide where re-renders come from. For a large experiment-driven app, Zustand and MobX both reduce boilerplate; the choice is team preference around explicit vs reactive."
  },
  {
    "id": "q25",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "Why separate “server state” from “client state”?",
    "answerHtml": "Server state is async, shared, and can go stale — it needs caching, deduping, background refetch, and invalidation, which is what <b>React Query/SWR</b> provide. Client/UI state is synchronous and local — toggles, form state, selected tab — which is what <b>Zustand/MobX</b> handle. Putting server data in a global UI store (or vice versa) is a classic mistake that leads to manual cache bugs."
  },
  {
    "id": "q26",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "GraphQL normalized cache vs React Query's query-key cache?",
    "answerHtml": "Apollo/urql keep a <b>normalized</b> cache — entities stored by <code>__typename:id</code>, so updating one entity reflects everywhere it's referenced. React Query caches by <b>query key</b> — each query's result is a blob; you invalidate keys after mutations. Normalized is powerful for highly relational data; query-key is simpler and transport-agnostic. Knowing the distinction shows real data-layer depth."
  },
  {
    "id": "q27",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "How do you stop a global store from causing extra re-renders?",
    "answerHtml": "Subscribe to the narrowest slice via selectors, use shallow equality for object/array selections, split large stores into focused ones, and keep derived data in computed selectors/<code>computed</code> rather than recomputing in render. In MobX, read only the observables a component truly needs inside <code>observer</code>. Then verify with the profiler instead of assuming."
  },
  {
    "id": "q28",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "A long list is janky while scrolling. How do you fix it?",
    "answerHtml": "Virtualize it (FlatList/FlashList) so only visible rows render; give stable <code>keyExtractor</code>; make <code>renderItem</code> cheap and memoized; avoid inline functions/objects in props; provide <code>getItemLayout</code> when row height is known; downsize images. Then profile to confirm the re-render count actually dropped. FlashList helps a lot for heavy feeds."
  },
  {
    "id": "q29",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "How do you reduce app startup time?",
    "answerHtml": "Minimize work before first paint: lazy-load heavy screens/modules, defer non-critical init off the launch path, lean on TurboModules (lazy native init) and Hermes (bytecode, no parse). Audit the bundle, trim unused dependencies, and measure TTI with the profiler. Splash-to-interactive is the metric to watch."
  },
  {
    "id": "q30",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "When do useMemo/useCallback actually help — and when not?",
    "answerHtml": "They help when (a) a child is wrapped in <code>React.memo</code> and you must keep props referentially stable, or (b) a computation is genuinely expensive. They <b>don't</b> help — and add overhead — when wrapping cheap values or passing to non-memoized children. The rule: profile, find the real re-render or hot computation, then memoize that specific thing. Don't sprinkle them everywhere."
  },
  {
    "id": "q31",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "Which FlatList props matter most for performance?",
    "answerHtml": "<code>keyExtractor</code> (stable keys), <code>getItemLayout</code> (skip measurement), <code>windowSize</code> / <code>maxToRenderPerBatch</code> / <code>initialNumToRender</code> (tune the render window), <code>removeClippedSubviews</code>, and a memoized <code>renderItem</code>. For very heavy lists, switch to FlashList. Always pair changes with profiling."
  },
  {
    "id": "q32",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "How do you track down a memory leak or image-memory issue?",
    "answerHtml": "Watch memory in Xcode Instruments / Android Profiler while exercising the suspect flow. Common RN causes: listeners/subscriptions/timers not cleaned up in <code>useEffect</code> teardown, retained closures, and oversized decoded images. Fix by cleaning up effects, releasing off-screen resources, right-sizing and caching images, and re-measuring to confirm the curve flattens."
  },
  {
    "id": "q33",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "How does battery efficiency affect your network design?",
    "answerHtml": "The radio is the biggest battery drain and stays warm after each call (“tail energy”), so 10 small requests cost far more than 1 batched one. I batch and coalesce calls, cancel in-flight requests when the user leaves a screen, cache aggressively to avoid refetching, and schedule background sync for good conditions (charging/Wi-Fi) instead of constant polling."
  },
  {
    "id": "q34",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "What's your testing strategy for a React Native app?",
    "answerHtml": "The pyramid: many fast <b>unit</b> tests (Jest) on pure logic, hooks, and reducers; a solid layer of <b>integration</b> tests with React Native Testing Library that assert behavior (what the user sees) not implementation; and a few <b>E2E</b> tests (Maestro or Detox) on critical flows like auth and checkout, gated in CI. I design for testability — pure functions, injected dependencies, thin components."
  },
  {
    "id": "q35",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "Unit vs integration vs E2E — and the tools?",
    "answerHtml": "<b>Unit</b>: one function/hook in isolation (Jest). <b>Integration</b>: a component or screen with its store and mocked network, asserting user-visible behavior (React Native Testing Library). <b>E2E</b>: the real app driven like a user across screens (Maestro — simple YAML flows — or Detox). Balance: lots of unit, fewer integration, a handful of E2E on must-not-break paths."
  },
  {
    "id": "q36",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "What does CI/CD look like for a mobile app, and what are OTA limits?",
    "answerHtml": "CI runs lint, types, unit/integration tests and a build on every PR; CD builds signed artifacts (EAS Build / Fastlane) and ships to TestFlight/Play internal tracks, then staged production rollout. <b>OTA</b> (EAS Update / CodePush) can push <b>JS-only</b> changes instantly — but anything touching native code or new native modules still requires a store build. Knowing that boundary is key."
  },
  {
    "id": "q37",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "How do you keep crash rate low after release?",
    "answerHtml": "Track crash-free rate with Sentry/Crashlytics, set error boundaries around risky screens, validate inputs and handle network failures gracefully, gate risky features behind flags with a <b>kill switch</b>, and roll out in stages so you catch regressions on 1–5% before 100%. Every crash gets a root-cause fix plus a regression test."
  },
  {
    "id": "q38",
    "category": "behavior",
    "categoryLabel": "STAR",
    "question": "Tell me about the hardest performance problem you solved.",
    "answerHtml": "See <b>Pitch 07</b> for the full STAR. Headline: re-render flickering and frozen screens on Valt Connect; I <i>profiled instead of guessing</i>, found components re-rendering on unstable props/context, memoized them, moved hot state into Zustand selectors, and added optimistic updates. Result: smooth navigation, instant interactions, and a team habit of profiling first.\n        <div class=\"hint\">English tip: say the four STAR words quietly as signposts; end on the <b>lesson</b>, not just the fix.</div>"
  },
  {
    "id": "q39",
    "category": "behavior",
    "categoryLabel": "STAR",
    "question": "Tell me about a disagreement with product or design.",
    "answerHtml": "Frame it calmly: I disagree with <b>data and options</b>, not ego. Example shape — product wanted a feature that risked performance/scope; I laid out the trade-off (cost, risk, a lighter alternative), asked clarifying questions about the actual user goal, and we picked a phased path. The point I make: I push back early and in writing, then commit fully once we decide.\n        <div class=\"hint\">English tip: use “I'd frame the trade-off as…” and avoid words like “fight” — say “align” and “trade-off.”</div>"
  },
  {
    "id": "q40",
    "category": "behavior",
    "categoryLabel": "STAR",
    "question": "How do you ramp up on a large, unfamiliar codebase?",
    "answerHtml": "I read the <b>data flow before the files</b> — entry points, navigation, the store, the API layer — then make the smallest safe change to learn the feedback loop, leaning on types and tests. I follow existing patterns rather than importing my own, and I ask targeted questions early. I've done this repeatedly — learning AWS Amplify on the job at Novacomp and ramping into Valt's growing codebase.\n        <div class=\"hint\">English tip: “the smallest safe change that unblocks the next feature” is a clean, memorable phrase — use it.</div>"
  },
  {
    "id": "q41",
    "category": "behavior",
    "categoryLabel": "STAR",
    "question": "Describe a time you owned a release end-to-end.",
    "answerHtml": "On Valt I owned production releases and App Store review responses on a two-person team: cutting builds with EAS, managing signing and store metadata, shipping a compliant account-deletion flow, adding version-based cache invalidation so fixes wouldn't break older clients, and responding to App Store review feedback to get approvals through. Ownership through QA to production is something I actually did, not just helped with.\n        <div class=\"hint\">English tip: emphasize “I owned…” — it's the seniority word the JD repeats.</div>"
  },
  {
    "id": "q42",
    "category": "behavior",
    "categoryLabel": "STAR",
    "question": "Are you comfortable with 100% remote and a large time-zone overlap (e.g. 6 hrs with PST)?",
    "answerHtml": "Yes — clearly and without hesitation. I've worked fully remote for most of my career across US and LATAM teams, I'm set up for it, and I can commit to a wide time-zone overlap. I work well async too: clear written updates, proactive flags on blockers, and asking the clarifying question early so time-zone gaps never stall the work.\n        <div class=\"hint\">English tip: answer the logistics question with a confident, short “Yes” first — then add detail. Don't hedge.</div>"
  },
  {
    "id": "fopt1",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "The single most important rule before optimizing performance?",
    "answerHtml": "Profile first. Measure to find the real bottleneck, fix that specific thing, then re-measure — never optimize on a guess."
  },
  {
    "id": "fopt2",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "Name three classic React Native memory-leak sources.",
    "answerHtml": "Listeners never removed, timers/intervals never cleared, and closures retaining large objects — all from a missing useEffect cleanup."
  },
  {
    "id": "fopt3",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "Why is index-as-key dangerous in a list?",
    "answerHtml": "On reorder/insert/delete, a recycling list reuses the wrong view for the data → visual glitches. Use a stable unique id instead."
  },
  {
    "id": "fopt4",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "How do you keep an animation smooth when the JS thread is busy?",
    "answerHtml": "Run it on the UI thread — Reanimated worklets or useNativeDriver:true — so it isn&#x27;t blocked by JS work."
  },
  {
    "id": "fopt5",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "Two levers to cut JS bundle size?",
    "answerHtml": "Specific (deep) imports + tree-shaking (sideEffects:false), and minify/shrink with R8/Proguard. Visualize the bundle to find bloat."
  },
  {
    "id": "fopt6",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "What does Hermes do for startup?",
    "answerHtml": "Precompiles JS to bytecode at build time → no runtime parse, faster TTI, lower memory. Default under the New Architecture."
  },
  {
    "id": "fopt7",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "FlashList v2 prerequisite and benefit?",
    "answerHtml": "Requires the New Architecture; it auto-measures item layout synchronously, so no estimatedItemSize and smoother recycling."
  },
  {
    "id": "fai1",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "Three benefits of on-device inference?",
    "answerHtml": "Privacy (data stays on the device), offline operation, and no server cost — plus low latency with small models."
  },
  {
    "id": "fai2",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "Mandatory setup before any model call?",
    "answerHtml": "initExecutorch() with a resource-fetcher adapter at the app entry; the library also requires the New Architecture."
  },
  {
    "id": "fai3",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "Why can't you use Expo Go for on-device AI?",
    "answerHtml": "It ships native code, so you need a development build (expo-dev-client + prebuild or EAS) — Expo Go can&#x27;t load it."
  },
  {
    "id": "fai4",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "Crash-safety rule for an LLM screen?",
    "answerHtml": "Call interrupt() and wait for isGenerating===false before unmounting; only one LLM instance can be active at a time."
  },
  {
    "id": "fai5",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "RAM rule of thumb by device tier?",
    "answerHtml": "1B model ≈ 1GB download / ~2GB RAM. 8GB+ → 3B; 6GB → 1B quantized; 4GB → computer-vision models only."
  },
  {
    "id": "fai6",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "Why quantize a model?",
    "answerHtml": "Smaller and faster with minimal quality loss (e.g. SpinQuant ≈ 42% smaller). Essential to fit mid-range devices."
  },
  {
    "id": "fai7",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "Bundle the model or download it?",
    "answerHtml": "Download large models from a remote URL with a progress UI and user opt-in; bundling is capped (&lt;512MB) and bloats the binary."
  }
];
