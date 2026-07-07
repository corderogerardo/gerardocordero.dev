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
    "answerHtml": "The New Architecture exists to remove the JSON-serialization bridge bottleneck — the old bridge batched everything asynchronously, which caused jank and slow startup on real devices. It replaces that bridge with four pieces: <b>JSI</b> (direct JS↔C++ calls, no JSON serialization), <b>Fabric</b> (a new concurrent renderer), <b>TurboModules</b> (lazy native modules), and <b>Codegen</b> (type-safe native interfaces from TS specs). Default since RN 0.76. <b>I'd frame it as: the New Architecture swaps async JSON serialization for direct, synchronous JSI calls, which is what makes concurrent React possible on native.</b>"
  },
  {
    "id": "q2",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "What is JSI and why does it matter?",
    "answerHtml": "JSI matters because it removes the single biggest React Native performance bottleneck and is the foundation Fabric and TurboModules are built on. Mechanically: it's a lightweight C++ layer that lets JavaScript hold references to native objects and call their methods <b>synchronously</b>, without serializing to JSON over the bridge. It also makes the engine swappable — that's how Hermes plugs in. <b>I'd describe it as the layer that turned native calls from async JSON round-trips into direct, synchronous C++ calls.</b>"
  },
  {
    "id": "q3",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "How is Fabric different from the old (Paper) renderer?",
    "answerHtml": "Fabric matters because it's what lets React Native use React 18+ concurrent features (Suspense, transitions) and synchronous layout — the old Paper renderer was async-only and couldn't support any of that. Mechanically: it's the new renderer built on JSI with a shared C++ <b>shadow tree</b>, giving synchronous layout and tighter interop with native views. <b>I'd put it as: Fabric replaced an async-only renderer with a synchronous, JSI-backed one so React Native could adopt concurrent React.</b>"
  },
  {
    "id": "q4",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "TurboModules vs the old NativeModules?",
    "answerHtml": "NativeModules' role was eager registration — every module loaded at startup whether used or not, which cost startup time and memory. TurboModules' role is lazy, on-demand loading — a module initializes only on first access via JSI, and Codegen makes the whole surface type-safe. <b>I'd say it as: TurboModules turned native module loading from eager-and-wasteful into lazy-and-typed.</b>"
  },
  {
    "id": "q5",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "What is Hermes and why use it?",
    "answerHtml": "Hermes is the JS engine built for React Native. It precompiles JS to <b>bytecode</b> at build time, so there's no parse step at launch — giving faster startup, lower memory use, and smaller app size. It's the default engine in the New Architecture, with improved garbage collection. <b>I'd say: Hermes trades a build-time compile step for a runtime parse step, which is a straight win for startup and memory.</b>"
  },
  {
    "id": "q6",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "How many threads does React Native use and what runs where?",
    "answerHtml": "Knowing which thread owns what matters because it tells you where to look first when something's slow. Three threads classically: the <b>JS thread</b> (your React code and logic), the <b>native/UI (main) thread</b> (rendering, gestures, native views), and a <b>shadow thread</b> for Yoga layout. Jank while taps still register usually means the UI thread is busy; an app that's unresponsive to taps but still animating natively means the JS thread is blocked. Reanimated runs animations on the UI thread via worklets specifically so they stay smooth even when JS is busy. <b>I'd say: diagnose thread issues by asking whether taps still register — that tells you JS or UI thread before you open a profiler.</b>"
  },
  {
    "id": "q7",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "What does “bridgeless” mode mean?",
    "answerHtml": "Bridgeless matters because it's the final step in killing bridge latency — faster startup and lower-latency native calls, since every JS↔native communication now goes through JSI/Fabric/TurboModules directly instead of an async queue. It became the default with the New Architecture, and the legacy bridge is being fully removed (disabled by default around RN 0.82). <b>I'd frame it as: bridgeless isn't a new API, it's the removal of the old one — nothing left to serialize through.</b>"
  },
  {
    "id": "q8",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "Expo vs bare React Native — when would you pick which?",
    "answerHtml": "Expo's role is managed velocity — builds, EAS Build/Update, config plugins, and a huge module library, while still fully supporting native code and the New Architecture. Bare RN's role is unrestricted native access when you need something Expo's plugin system genuinely can't express. For most teams today, Expo + dev clients is the productive default, and you drop to bare only for that specific gap, not by default. <b>Red flag:</b> saying you'd go bare RN \"for control\" as a blanket default — modern Expo supports custom native code via config plugins, so that's rarely still true. <b>I'd say: I default to Expo and only reach for bare when a specific native requirement can't be expressed as a config plugin.</b>"
  },
  {
    "id": "q9",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "Since which version is the New Architecture the default?",
    "answerHtml": "Default since <b>React Native 0.76</b> (late 2024), with Hermes as the default engine. Subsequent releases keep hardening it, and the legacy bridge is being removed (disabled by default around 0.82). <b>I'd say: New Architecture became default in 0.76, and by 0.82 the legacy bridge is disabled outright.</b>"
  },
  {
    "id": "q10",
    "category": "rn",
    "categoryLabel": "RN",
    "question": "How would you integrate a native SDK that has no RN wrapper?",
    "answerHtml": "The goal is keeping the JS surface small and typed so the native glue doesn't become a maintenance burden. My process: <b>1.</b> Define a TS spec for just the methods you need. <b>2.</b> Implement it as a <b>TurboModule</b> (or native module) in Swift/Kotlin, calling into the SDK. <b>3.</b> Bridge async native events back to JS via the emitter. <b>4.</b> Handle build config — Pods/Gradle, permissions. I've done this kind of native glue — e.g. patching PSPDFKit and writing camera-permission hooks. <b>I'd say: wrap only what you need, typed end-to-end through Codegen, so the native SDK stays an implementation detail.</b>"
  },
  {
    "id": "q11",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "Walk me through how you'd approach a mobile system design question.",
    "answerHtml": "For system design questions, structure beats content — a rambling correct answer sounds junior. My framework, <b>CRDDS</b>: <b>1. Clarify</b> requirements (functional/non-functional, scale, platforms, offline) for several minutes first. <b>2. Rough HLD</b> — sketch the four layers. <b>3. Deep-dive</b> one key component. <b>4. Discuss trade-offs</b> explicitly. <b>5. Summarize</b> and handle follow-ups. <b>I always say: clarify before designing, and say the trade-off out loud even if no one asks.</b>"
  },
  {
    "id": "q12",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "What are the core layers of a mobile app architecture?",
    "answerHtml": "Separating these layers is what keeps a codebase testable and swappable as it grows — business logic that doesn't import React or a network client can be unit-tested and reused across screens. The four layers: <b>UI/Presentation</b> (screens, components — render state, emit events), <b>Business/Domain</b> (use-cases, validation — framework-agnostic and most testable), <b>Data/Repository</b> (combines remote + local, caching, DTO→model mapping), and <b>Network</b> (HTTP client, serialization, interceptors). <b>The UI talks to repositories, never directly to the API.</b>"
  },
  {
    "id": "q13",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "What is the repository pattern and why use it?",
    "answerHtml": "A repository exists so the UI never has to know or care where data comes from — that's what makes a screen testable with a fake repo and safe to change data sources under. Mechanically: it's the single entry point for a domain's data, hiding whether it comes from network, cache, or DB, handling stale-while-revalidate, and mapping DTOs to clean domain models. <b>I'd say: the repository is the seam that keeps the UI decoupled from network and caching logic.</b>"
  },
  {
    "id": "q14",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "What does “offline-first” mean and how do you build it?",
    "answerHtml": "The <b>local database is the source of truth</b>; the network just syncs it. The UI always reads local data, so the app works with no signal. Building blocks: optimistic updates for instant feedback, a sync queue that replays offline mutations when connectivity returns, and a conflict-resolution strategy (last-write-wins, server-wins, or merge) per data type. <b>I'd frame it as: the network is just a sync mechanism for a database that already works standalone.</b>"
  },
  {
    "id": "q15",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "How do optimistic updates work, and how do you roll back?",
    "answerHtml": "Optimistic updates matter for perceived latency on <b>mutations</b> — an action like a like or bookmark feels instant because you update local state before the server confirms. Mechanically: apply the change immediately, keep the previous value, and on failure roll back to it and surface an error; React Query's <code>onMutate</code>/<code>onError</code>/<code>onSettled</code> is the canonical implementation. I shipped exactly this across profiles and bookmarks on Valt. <b>Red flag:</b> reaching for optimistic updates on an initial data load — that's a staged/progressive-loading problem, not a mutation problem. <b>I'd say: optimistic updates hide mutation latency; they're the wrong tool for hiding a slow first fetch.</b>"
  },
  {
    "id": "q16",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "Cache eviction vs cache invalidation?",
    "answerHtml": "<b>Eviction</b>'s role is freeing space — LRU (drop least-recently-used) or TTL (expire after N seconds). <b>Invalidation</b>'s role is correctness — knowing data is stale and refetching, via time-based, event-based (a mutation or push invalidates a key), or version-based (bump a version to bust old clients) strategies. <b>Eviction is about memory; invalidation is about correctness.</b>"
  },
  {
    "id": "q17",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "Explain stale-while-revalidate.",
    "answerHtml": "Show cached (possibly stale) data immediately so the screen is instant, then fetch fresh data in the background and reconcile the UI when it arrives. It's the core of React Query and SWR. <b>It's the reason well-built apps feel fast — the user almost never stares at a spinner.</b>"
  },
  {
    "id": "q18",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "WebSocket vs SSE vs polling vs push — when do you use each?",
    "answerHtml": "<b>WebSocket</b>'s role is two-way, low-latency (chat, presence, trading). <b>SSE</b>'s role is one-way server→client streams (feeds, live scores). <b>Polling/long-polling</b>'s role is simple or low-frequency updates without socket infra. <b>Push (FCM/APNs)</b>'s role is reaching the app when it's backgrounded or killed. <b>Red flag:</b> holding a WebSocket open for occasional updates — it drains battery via radio tail energy for no latency benefit. <b>I'd say: I pick the transport by update frequency and directionality, not by what's trendiest.</b>"
  },
  {
    "id": "q19",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "Offset vs cursor vs keyset pagination?",
    "answerHtml": "<b>Offset/limit</b> is simple and supports jump-to-page but breaks under inserts and is slow on big tables. <b>Cursor</b> uses an opaque token to the next slice — stable for infinite feeds (usually the right answer). <b>Keyset</b> (<code>WHERE id &lt; lastId</code>) is fastest for very large datasets. <b>For a social feed, I'd default to cursor pagination — it's stable under inserts, which offset breaks.</b>"
  },
  {
    "id": "q20",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "What makes a robust API client?",
    "answerHtml": "A robust client keeps a network fix from becoming a rewrite — when auth or retry logic lives in one interceptor instead of scattered across call sites, you change it once. Six separated pieces: HTTP engine, serializer, a typed service interface, <b>interceptors</b> (auth token, logging, retries), DTOs matching server JSON, and a repository that adds caching. Plus sane timeouts, a result type for errors, and retry-with-backoff only on idempotent calls. <b>DTOs never leak into the UI.</b>"
  },
  {
    "id": "q21",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "MVVM vs MVI — and where does React Native land?",
    "answerHtml": "MVVM's role is exposing observable state from a view-model that the view binds to. MVI's role is stricter: <b>one-way data flow</b> with immutable state and reducers (intent → state → render). React Native is essentially MVVM/MVI: components observe a store, dispatch actions, and unidirectional flow re-renders the UI. <b>MVI's predictability shines in complex, experiment-heavy screens.</b>"
  },
  {
    "id": "q22",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "How does Zustand work, and what's “selector discipline”?",
    "answerHtml": "You create a store with <code>create()</code> holding state + actions. Components subscribe with a <b>selector</b> — <code>useStore(s =&gt; s.user)</code> — and re-render only when that slice changes. Selector discipline means selecting the narrowest slice and using <code>shallow</code> equality for objects, so you don't re-render on unrelated updates. No providers, and you can read/write the store outside React too. <b>I'd say: selector discipline is the whole ballgame with Zustand — subscribe to the smallest slice that makes the component correct.</b>"
  },
  {
    "id": "q23",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "Explain MobX's core model.",
    "answerHtml": "MobX matters because it removes the boilerplate of manually deciding what triggers a re-render — mark state <code>observable</code>, wrap components in <code>observer()</code>, and they auto-re-render when the exact observables they read change. You mutate state directly inside <code>action</code>s, and <code>computed</code> values are cached derivations. Informally: it's like a spreadsheet — change a cell, dependent formulas recalculate. <b>I'd say: MobX trades explicit dispatch for automatic dependency tracking — powerful, but you have to know what's reactive to debug it.</b>"
  },
  {
    "id": "q24",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "Zustand vs MobX vs Redux — trade-offs?",
    "answerHtml": "<b>Redux</b>'s role: explicit, predictable, lots of boilerplate, great devtools/time-travel. <b>Zustand</b>'s role: minimal, selector-based, low ceremony, easy to scale. <b>MobX</b>'s role: least boilerplate, mutable + automatic reactivity, very ergonomic but the magic can hide where re-renders come from. For a large experiment-driven app, Zustand and MobX both reduce boilerplate. <b>The choice is team preference around explicit vs reactive, not a correctness question.</b>"
  },
  {
    "id": "q25",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "Why separate “server state” from “client state”?",
    "answerHtml": "Server state's role: async, shared, and can go stale — it needs caching, deduping, background refetch, and invalidation, which is what <b>React Query/SWR</b> provide. Client/UI state's role: synchronous and local — toggles, form state, selected tab — which is what <b>Zustand/MobX</b> handle. <b>Red flag:</b> putting server data in a global UI store (or client UI state in React Query) — it leads to manual cache bugs you'll fight for months. <b>I'd say: if it can go stale on the server, it's server state — no exceptions.</b>"
  },
  {
    "id": "q26",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "GraphQL normalized cache vs React Query's query-key cache?",
    "answerHtml": "Apollo/urql's role is a <b>normalized</b> cache — entities stored by <code>__typename:id</code>, so updating one entity reflects everywhere it's referenced. React Query's role is a <b>query key</b> cache — each query's result is a blob; you invalidate keys after mutations. Normalized is powerful for highly relational data; query-key is simpler and transport-agnostic. <b>I'd say: normalize when entities are shared across screens; keyed caching is fine when each query owns its data.</b>"
  },
  {
    "id": "q27",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "How do you stop a global store from causing extra re-renders?",
    "answerHtml": "The fix is always the same shape — narrow what triggers a re-render, then verify. <b>1.</b> Subscribe to the narrowest slice via selectors. <b>2.</b> Use shallow equality for object/array selections. <b>3.</b> Split large stores into focused ones. <b>4.</b> Keep derived data in computed selectors/<code>computed</code> instead of recomputing in render. In MobX, read only the observables a component truly needs inside <code>observer</code>. <b>Red flag:</b> assuming a fix worked without profiling — verify the re-render count actually dropped."
  },
  {
    "id": "q28",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "A long list is janky while scrolling. How do you fix it?",
    "answerHtml": "This is a profiling problem before it's a props problem — jumping straight to memoizing renderItem without confirming what's actually re-rendering wastes time. <b>1. Isolate:</b> confirm it's render cost, not JS-thread contention elsewhere. <b>2. Prove it:</b> profile to see how many rows re-render per scroll frame and why. <b>3. Fix:</b> virtualize (FlatList/FlashList) so only visible rows render, add a stable <code>keyExtractor</code>, memoize <code>renderItem</code>, avoid inline functions/objects in props, provide <code>getItemLayout</code> when row height is known, and downsize images. <b>4. Re-profile</b> to confirm the re-render count actually dropped. FlashList helps a lot for heavy feeds. <b>Red flag:</b> reaching for memoization before profiling — you might be optimizing the wrong component."
  },
  {
    "id": "q29",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "How do you reduce app startup time?",
    "answerHtml": "Startup time is measured start-to-interactive, so the work is minimizing everything before first paint: lazy-load heavy screens/modules, defer non-critical init off the launch path, lean on TurboModules (lazy native init) and Hermes (bytecode, no parse). Audit the bundle, trim unused dependencies, and measure TTI with the profiler. <b>I'd say: splash-to-interactive is the one number I optimize for, not any individual line of code.</b>"
  },
  {
    "id": "q30",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "When do useMemo/useCallback actually help — and when not?",
    "answerHtml": "They help when (a) a child is wrapped in <code>React.memo</code> and you must keep props referentially stable, or (b) a computation is genuinely expensive. <b>The rule: profile, find the real re-render or hot computation, then memoize that specific thing.</b> <b>Red flag:</b> wrapping every value in useMemo/useCallback by default — it adds overhead for zero benefit on cheap values or non-memoized children."
  },
  {
    "id": "q31",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "Which FlatList props matter most for performance?",
    "answerHtml": "<code>keyExtractor</code> (stable keys), <code>getItemLayout</code> (skip measurement), <code>windowSize</code> / <code>maxToRenderPerBatch</code> / <code>initialNumToRender</code> (tune the render window), <code>removeClippedSubviews</code>, and a memoized <code>renderItem</code>. For very heavy lists, switch to FlashList. Always pair changes with profiling. <b>I'd say: keyExtractor and a memoized renderItem are non-negotiable; everything else is tuning once you've profiled.</b>"
  },
  {
    "id": "q32",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "How do you track down a memory leak or image-memory issue?",
    "answerHtml": "Memory leaks fail silently until a crash report shows up weeks later, so the process has to be systematic, not a guess. <b>1. Isolate:</b> reproduce the suspect flow repeatedly. <b>2. Prove it:</b> watch memory in Xcode Instruments / Android Profiler while exercising it — confirm the curve climbs and doesn't come back down. <b>3. Fix:</b> the common RN causes are listeners/subscriptions/timers never cleared in <code>useEffect</code> teardown, retained closures, and oversized decoded images — clean up effects, release off-screen resources, right-size and cache images. <b>4. Re-measure</b> to confirm the curve flattens. <b>Red flag:</b> shipping a fix without re-profiling — a leak that \"feels fixed\" without a flat memory curve isn't fixed."
  },
  {
    "id": "q33",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "How does battery efficiency affect your network design?",
    "answerHtml": "The radio is the biggest battery drain and stays warm after each call (“tail energy”), so 10 small requests cost far more than 1 batched one. I batch and coalesce calls, cancel in-flight requests when the user leaves a screen, cache aggressively to avoid refetching, and schedule background sync for good conditions (charging/Wi-Fi) instead of constant polling. <b>I'd say: I design network calls around radio tail energy, not just request count.</b>"
  },
  {
    "id": "q34",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "What's your testing strategy for a React Native app?",
    "answerHtml": "The pyramid shape exists because slow tests don't get run — most of the safety net has to be cheap. Many fast <b>unit</b> tests (Jest) on pure logic, hooks, and reducers; a solid layer of <b>integration</b> tests with React Native Testing Library that assert behavior (what the user sees) not implementation; and a few <b>E2E</b> tests (Maestro or Detox) on critical flows like auth and checkout, gated in CI. I design for testability — pure functions, injected dependencies, thin components. <b>I'd say: I write for the pyramid, not against it — if I catch myself writing E2E tests for logic a unit test could cover, that's a smell.</b>"
  },
  {
    "id": "q35",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "Unit vs integration vs E2E — and the tools?",
    "answerHtml": "<b>Unit</b>'s role: one function/hook in isolation (Jest). <b>Integration</b>'s role: a component or screen with its store and mocked network, asserting user-visible behavior (React Native Testing Library). <b>E2E</b>'s role: the real app driven like a user across screens (Maestro — simple YAML flows — or Detox). <b>Balance: lots of unit, fewer integration, a handful of E2E on must-not-break paths.</b>"
  },
  {
    "id": "q36",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "What does CI/CD look like for a mobile app, and what are OTA limits?",
    "answerHtml": "CI runs lint, types, unit/integration tests and a build on every PR; CD builds signed artifacts (EAS Build / Fastlane) and ships to TestFlight/Play internal tracks, then staged production rollout. <b>OTA</b> (EAS Update / CodePush) can push <b>JS-only</b> changes instantly. <b>Red flag:</b> assuming an OTA update can ship a new native module or native code change — it can't; only JS-only changes qualify, anything touching native still needs a store build. <b>I'd say: I know exactly where the OTA line is, so I never promise an instant fix for something that needs App Review.</b>"
  },
  {
    "id": "q37",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "How do you keep crash rate low after release?",
    "answerHtml": "Crash rate degrades trust faster than almost any other metric, so the process is preventive, not reactive: track crash-free rate with Sentry/Crashlytics, set error boundaries around risky screens, validate inputs and handle network failures gracefully, gate risky features behind flags with a <b>kill switch</b>, and roll out in stages so you catch regressions on 1–5% before 100%. <b>Every crash gets a root-cause fix plus a regression test.</b>"
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
    "answerHtml": "<b>Profile first.</b> Measure to find the real bottleneck, fix that specific thing, then re-measure — never optimize on a guess."
  },
  {
    "id": "fopt2",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "Name three classic React Native memory-leak sources.",
    "answerHtml": "Listeners never removed, timers/intervals never cleared, and closures retaining large objects — all from a missing useEffect cleanup. <b>I'd say: leaks are missing teardown, not missing memory.</b>"
  },
  {
    "id": "fopt3",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "Why is index-as-key dangerous in a list?",
    "answerHtml": "<b>Red flag:</b> using the array index as key on a reorderable list. On reorder/insert/delete, a recycling list reuses the wrong view for the data → visual glitches. <b>Always use a stable unique id instead.</b>"
  },
  {
    "id": "fopt4",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "How do you keep an animation smooth when the JS thread is busy?",
    "answerHtml": "Run it on the UI thread — Reanimated worklets or useNativeDriver:true — so it isn&#x27;t blocked by JS work. <b>The JS thread being busy should never be visible in an animation.</b>"
  },
  {
    "id": "fopt5",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "Two levers to cut JS bundle size?",
    "answerHtml": "Specific (deep) imports + tree-shaking (sideEffects:false), and minify/shrink with R8/Proguard. <b>Visualize the bundle to find bloat — don't guess at what's heavy.</b>"
  },
  {
    "id": "fopt6",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "What does Hermes do for startup?",
    "answerHtml": "Precompiles JS to bytecode at build time → no runtime parse, faster TTI, lower memory. Default under the New Architecture. <b>Bytecode at build time means the app never pays a parse cost at launch.</b>"
  },
  {
    "id": "fopt7",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "FlashList v2 prerequisite and benefit?",
    "answerHtml": "Requires the New Architecture; it auto-measures item layout synchronously, so no estimatedItemSize and smoother recycling. <b>That auto-measurement is the whole upgrade — one less prop to tune and one less thing to get wrong.</b>"
  },
  {
    "id": "fai1",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "Three benefits of on-device inference?",
    "answerHtml": "Privacy (data stays on the device), offline operation, and no server cost — plus low latency with small models. <b>On-device is the answer whenever \"works with no connection\" is a requirement, not a nice-to-have.</b>"
  },
  {
    "id": "fai2",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "Mandatory setup before any model call?",
    "answerHtml": "<code>initExecutorch()</code> with a resource-fetcher adapter at the app entry; the library also requires the New Architecture. <b>I'd say: initExecutorch() is the one call every screen using this library assumes already ran.</b>"
  },
  {
    "id": "fai3",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "Why can't you use Expo Go for on-device AI?",
    "answerHtml": "It ships native code, so you need a development build (expo-dev-client + prebuild or EAS) — Expo Go can&#x27;t load it. <b>Red flag:</b> assuming Expo Go will work for \"just testing\" a native AI feature — it won't load the native module at all. <b>I'd say: any native-code dependency means a dev client, no exceptions.</b>"
  },
  {
    "id": "fai4",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "Crash-safety rule for an LLM screen?",
    "answerHtml": "Call <code>interrupt()</code> and wait for <code>isGenerating===false</code> before unmounting; only one LLM instance can be active at a time. <b>Interrupting before unmount is what keeps \"only one instance active\" from turning into a crash on the next screen.</b>"
  },
  {
    "id": "fai5",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "RAM rule of thumb by device tier?",
    "answerHtml": "1B model ≈ 1GB download / ~2GB RAM. 8GB+ → 3B; 6GB → 1B quantized; 4GB → computer-vision models only. <b>I'd size the model to the device tier, not the other way around.</b>"
  },
  {
    "id": "fai6",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "Why quantize a model?",
    "answerHtml": "Smaller and faster with minimal quality loss (e.g. SpinQuant ≈ 42% smaller). <b>Essential to fit mid-range devices.</b>"
  },
  {
    "id": "fai7",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "Bundle the model or download it?",
    "answerHtml": "Download large models from a remote URL with a progress UI and user opt-in; bundling is capped (&lt;512MB) and bloats the binary. <b>I'd say: users opt into a multi-hundred-MB download once; they don't opt into a bloated app binary forever.</b>"
  }
];
