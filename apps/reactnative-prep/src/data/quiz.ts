// Content migrated from the original single-file study guide. These typed modules are now the source of truth — edit directly.
export type QuizQuestion = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  options: string[];
  answer: number;
  explanationHtml: string;
};

export const QUIZ_FILTERS: { value: string; label: string }[] = [
  {
    "value": "all",
    "label": "All"
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

export const QUIZ: QuizQuestion[] = [
  {
    "id": "z1",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "What does Time-to-Interactive (TTI) measure?",
    "options": [
      "The app's total download size",
      "Time from launch/tap to a usable, interactive screen",
      "Frames rendered per second",
      "Server response time"
    ],
    "answer": 1,
    "explanationHtml": "TTI is the metric that decides whether a slow launch reads as a bug report or a bounce — it&#x27;s what the user actually feels between tapping the icon and getting a usable screen. Mechanically it&#x27;s dominated by JS bundle parse/execution and whatever work runs before first interactive paint. Red flag: don&#x27;t conflate it with FPS (smoothness after launch) or bundle size (a proxy, not the measurement) — they move independently. <b>TTI is what I optimize for cold start; FPS is a separate metric for runtime smoothness.</b>"
  },
  {
    "id": "z2",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "Why does Hermes improve startup time?",
    "options": [
      "It precompiles JS to bytecode at build time, skipping the runtime parse",
      "It replaces React with native views",
      "It renders on the GPU",
      "It caches all network calls"
    ],
    "answer": 0,
    "explanationHtml": "Startup time is dominated by the JS engine parsing and compiling source before it can run — Hermes removes that step by shipping precompiled bytecode, so the engine just executes it. That&#x27;s lower TTI and lower memory, not a rendering change: Hermes doesn&#x27;t touch how React renders or replace it, and it has nothing to do with the GPU. <b>Hermes buys startup speed by moving compilation to build time, not by changing the rendering pipeline.</b> It&#x27;s the default engine under the New Architecture."
  },
  {
    "id": "z3",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "A component wrapped in React.memo still re-renders every time. Most likely cause?",
    "options": [
      "Hermes is disabled",
      "The component has too few props",
      "It's written in TypeScript",
      "The parent passes a new inline object/array/function reference every render"
    ],
    "answer": 3,
    "explanationHtml": "A component that keeps re-rendering despite React.memo is almost always a props-identity problem, not a memo bug — memo only helps if the props it receives are referentially stable. React.memo does a shallow compare, so a new inline object/array/function literal from the parent fails that comparison every render even when the values are logically unchanged. Red flag: don&#x27;t reach for more memoization (or blame memo itself) before checking prop stability — stabilize the offending prop with useMemo/useCallback first. <b>I check for unstable prop references before I add more memoization.</b>"
  },
  {
    "id": "z4",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "Best key for a list of items that can reorder, insert, or delete?",
    "options": [
      "The array index",
      "Math.random() per render",
      "A stable unique id from the data",
      "The item's display title"
    ],
    "answer": 2,
    "explanationHtml": "Keys are how a recycling list preserves component identity across renders — get this wrong and a reorder or delete shows stale content in the wrong row, not just a performance hit. Index keys look fine until the list reorders, inserts, or deletes, at which point the index no longer maps to the same item and the list reuses the wrong view; Math.random() is worse — it breaks identity on every single render, so nothing ever stays mounted. Red flag: saying 'index is fine for a list' without qualifying 'as long as it never reorders or filters' — assume it will. <b>I key lists on a stable, unique id from the data, never the index.</b>"
  },
  {
    "id": "z5",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "How do you keep an animation smooth while the JS thread is busy?",
    "options": [
      "Call setState in a tight loop",
      "Run the animation on the UI thread (worklet / useNativeDriver)",
      "Increase the list windowSize",
      "Add more console.logs"
    ],
    "answer": 1,
    "explanationHtml": "Smoothness under a busy JS thread comes down to which thread owns the animation — if it's the JS thread, a blocked JS thread (heavy computation, a slow callback) drops frames no matter how good the animation code is. Reanimated worklets and useNativeDriver:true move the animation to the UI thread, so it keeps running independent of JS. Red flag: more setState calls or a larger list windowSize do nothing for animation smoothness — those affect list rendering, not the animation thread. <b>Anything that must stay smooth under JS load has to run on the UI thread, not be driven by JS state updates.</b>"
  },
  {
    "id": "z6",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "Most common source of a memory leak in a React Native screen?",
    "options": [
      "Subscriptions, timers, or listeners not cleaned up in useEffect teardown",
      "Using function components",
      "Enabling Hermes",
      "Using a selector-based store"
    ],
    "answer": 0,
    "explanationHtml": "Memory leaks in RN screens are almost always a lifecycle mismatch — a subscription outlives the screen that created it, so the screen (and everything it closes over) can never be garbage collected even after the user navigates away. This has nothing to do with function components, Hermes, or which store you use — those are red herrings. <b>Every subscription, timer, or listener gets a matching teardown in the useEffect cleanup — no exceptions.</b>"
  },
  {
    "id": "z7",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "What's the right first step before optimizing performance?",
    "options": [
      "Add React.memo to every component",
      "Profile to find the actual bottleneck first",
      "Rewrite the screen in native code",
      "Upgrade every dependency"
    ],
    "answer": 1,
    "explanationHtml": "Optimization work you can't point at a profiler trace is a guess, and guesses waste review cycles fixing things that were never slow. Profile first to find the actual bottleneck, fix that specific thing, then re-measure to confirm it moved the number. Red flag: reaching for React.memo everywhere, a native rewrite, or a blanket dependency upgrade as a first move — each adds cost (memo overhead, dev time, regression risk) without evidence it addresses the real hotspot. <b>I profile before I optimize, and I re-measure after — otherwise I can't prove the change helped.</b>"
  },
  {
    "id": "z8",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "Which approach actually shrinks a large JS bundle?",
    "options": [
      "Import libraries through barrel files",
      "Disable Hermes",
      "Import specific paths and enable tree-shaking + minification",
      "Inline all images as base64"
    ],
    "answer": 2,
    "explanationHtml": "Bundle size is a direct lever on TTI, so the fix has to actually let the bundler remove code, not just look tidier. Deep, specific imports plus sideEffects:false and minification/shrinking (R8) let the bundler prove which code is unused and strip it. Red flag: barrel-file imports look cleaner but pull in the whole module graph and defeat tree-shaking — the opposite of the intended effect; base64-inlining images bloats the JS bundle further instead of shrinking it. <b>I import specific paths, not barrel files, because tree-shaking can only remove what it can prove is unused.</b>"
  },
  {
    "id": "z9",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "A modern recycling list (FlashList v2) requires what?",
    "options": [
      "Redux",
      "The legacy architecture",
      "An estimatedItemSize prop",
      "The New Architecture (synchronous layout)"
    ],
    "answer": 3,
    "explanationHtml": "The prop that's missing in v2 tells you what changed under the hood: v2 relies on the New Architecture's synchronous layout to auto-measure items, so it doesn't need a size hint upfront the way v1 did with estimatedItemSize. Red flag: don&#x27;t assume that prop is still required — passing it on v2 is a tell you're pattern-matching from v1 docs rather than the current API. <b>FlashList v2 auto-measures via synchronous layout, so it needs the New Architecture, not an estimatedItemSize.</b>"
  },
  {
    "id": "z10",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "Which removes the legacy bridge serialization bottleneck?",
    "options": [
      "JSI — direct JS to C++ calls",
      "AsyncStorage",
      "Flexbox",
      "PNG compression"
    ],
    "answer": 0,
    "explanationHtml": "The legacy bridge's bottleneck was serialization: every native call became a JSON message queued and processed asynchronously, adding latency and blocking batching. JSI removes that step entirely — JS holds direct references to native objects/functions and calls them synchronously in C++, no JSON round-trip. Red flag: don&#x27;t describe the New Architecture as 'a faster bridge' — it removes the bridge. <b>JSI replaces the async JSON bridge with direct, synchronous JS-to-native calls — that's what Fabric and TurboModules are built on.</b>"
  },
  {
    "id": "z11",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "Heavy work must run after a screen transition without dropping frames. Best tool?",
    "options": [
      "A busy while-loop",
      "InteractionManager.runAfterInteractions()",
      "A larger JS bundle",
      "setState during render"
    ],
    "answer": 1,
    "explanationHtml": "Running heavy work during a screen transition competes with the animation for the same JS thread, so the fix is to defer the work rather than make it faster. InteractionManager.runAfterInteractions() queues the callback until animations/interactions finish, protecting the frame rate during navigation. Red flag: a busy while-loop or setState during render both block the thread synchronously — they make the problem worse, not better. <b>I defer non-critical work past the interaction boundary instead of racing it against the animation.</b>"
  },
  {
    "id": "z12",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "Where do you confirm WHY a component re-rendered?",
    "options": [
      "The Network tab",
      "package.json",
      "The React DevTools Profiler ('why did this render')",
      "The App Store listing"
    ],
    "answer": 2,
    "explanationHtml": "Fixing an unnecessary re-render requires knowing its cause, not guessing — memoizing the wrong thing wastes effort and can add overhead of its own. The React DevTools Profiler's 'why did this render' view attributes each re-render to the specific prop, state, or context change that triggered it. <b>I check the Profiler's render reason before touching memoization — otherwise I'm optimizing blind.</b>"
  },
  {
    "id": "z13",
    "category": "ai",
    "categoryLabel": "On-Device AI",
    "question": "What does 'on-device inference' mean?",
    "options": [
      "The model runs on a cloud GPU",
      "Weights live on the phone; all compute is local, no server round-trip",
      "It needs a constant connection",
      "It runs inside a web view"
    ],
    "answer": 1,
    "explanationHtml": "On-device inference changes the trust and cost model of the feature, not just where compute happens: weights live on the phone and every forward pass runs locally, so user data never leaves the device, the feature works offline, there's no per-call server cost, and latency isn't subject to a network round-trip. Red flag: don&#x27;t describe it as 'the model runs in the cloud but locally for privacy' — a cloud GPU isn&#x27;t involved at all once weights are on-device. <b>On-device means the data and the compute both stay on the phone — that's the privacy and latency story in one sentence.</b>"
  },
  {
    "id": "z14",
    "category": "ai",
    "categoryLabel": "On-Device AI",
    "question": "Which RN architecture does the on-device AI runtime require?",
    "options": [
      "The legacy architecture only",
      "Neither architecture",
      "Web only",
      "The New Architecture (Fabric + TurboModules)"
    ],
    "answer": 3,
    "explanationHtml": "The runtime ships native modules that depend on JSI for direct, synchronous calls into native inference code — the legacy bridge's async JSON messaging can't support that, so the old architecture isn't a slower fallback, it's simply unsupported. <b>On-device AI is a New Architecture feature — there's no legacy-bridge code path.</b>"
  },
  {
    "id": "z15",
    "category": "ai",
    "categoryLabel": "On-Device AI",
    "question": "Why can't you use Expo Go with it?",
    "options": [
      "It ships native code and needs a development build / New Arch",
      "Expo Go is a paid product",
      "It requires Redux",
      "It only supports iOS"
    ],
    "answer": 0,
    "explanationHtml": "Expo Go ships a fixed, prebuilt native binary — any native code that isn't already compiled into that binary simply isn't there at runtime, which is why native modules (not licensing, not platform support) are the blocker. You need a development build (expo-dev-client + prebuild/EAS) that actually compiles the native module in. <b>If a library ships native code, it needs a dev build — Expo Go can't load native code it wasn't built with.</b>"
  },
  {
    "id": "z16",
    "category": "ai",
    "categoryLabel": "On-Device AI",
    "question": "What must you call before any model API?",
    "options": [
      "Nothing special",
      "initExecutorch() with a resource-fetcher adapter, at the app entry",
      "A fetch() warm-up call",
      "AsyncStorage.getItem()"
    ],
    "answer": 1,
    "explanationHtml": "Model APIs need a registered path to fetch and manage model resources before they can do anything, so initialization isn't optional setup — it's a hard runtime dependency. Call initExecutorch() with a resource-fetcher adapter once at the app entry; skip it and every model API call throws an 'adapter not initialized' error. Red flag: a bare fetch() warm-up or lazy init inside a screen isn&#x27;t equivalent — it has to be registered at the root before any model API is touched. <b>Runtime init at the app root is a hard prerequisite for every model call, not a performance nicety.</b>"
  },
  {
    "id": "z17",
    "category": "ai",
    "categoryLabel": "On-Device AI",
    "question": "Approximate footprint of a 1B-parameter on-device LLM?",
    "options": [
      "~10 MB download / ~50 MB RAM",
      "Zero — it's cloud-backed",
      "~1 GB download / ~2 GB RAM",
      "~50 GB"
    ],
    "answer": 2,
    "explanationHtml": "Model size is a device-support decision, not just a download-time concern — get the budget wrong and the app OOMs on exactly the mid-range devices most of your users own. A ~1B-parameter model is roughly ~1GB download / ~2GB RAM, which already rules out low-RAM devices. Roughly: 8GB+ devices handle 3B models; 6GB devices handle 1B quantized; 4GB devices are computer-vision only. <b>I size the model to the RAM budget of the target device tier, not the other way around.</b>"
  },
  {
    "id": "z18",
    "category": "ai",
    "categoryLabel": "On-Device AI",
    "question": "You must leave an LLM screen mid-generation. Correct handling?",
    "options": [
      "Just navigate away immediately",
      "Call interrupt() and wait for isGenerating === false",
      "Force-reload the whole app",
      "Delete the model file"
    ],
    "answer": 1,
    "explanationHtml": "Only one LLM instance can be active at a time, so navigating away mid-generation without stopping it first isn't a UX nicety — it's a crash: the native runtime keeps writing to a context the screen no longer owns. Call interrupt() and wait for isGenerating === false before unmounting. Red flag: 'just navigate away' or force-reloading the app both leave generation state inconsistent for the next session. <b>I always stop generation and confirm isGenerating === false before leaving an LLM screen.</b>"
  },
  {
    "id": "z19",
    "category": "ai",
    "categoryLabel": "On-Device AI",
    "question": "Why prefer a quantized model (SpinQuant / 8da4w)?",
    "options": [
      "Smaller and faster with minimal quality loss",
      "It increases precision",
      "It removes the RAM requirement",
      "It avoids needing the New Architecture"
    ],
    "answer": 0,
    "explanationHtml": "Quantization is a deliberate trade of numeric precision for memory and speed — lowering weight precision (e.g. SpinQuant / 8da4w) shrinks the model significantly (roughly ~42% smaller) and speeds up inference, at a quality cost that's usually small enough to accept. Red flag: don&#x27;t claim it increases precision or removes the RAM requirement entirely — it reduces RAM pressure, it doesn&#x27;t eliminate it, and precision goes down, not up. <b>Quantization trades a small, usually-acceptable quality hit for a large win in memory and speed.</b>"
  },
  {
    "id": "z20",
    "category": "ai",
    "categoryLabel": "On-Device AI",
    "question": "Best way to load a multi-hundred-MB model?",
    "options": [
      "Bundle it via require() into the binary",
      "Hardcode it as base64",
      "Email it to users",
      "Download from a remote URL with progress + user opt-in"
    ],
    "answer": 3,
    "explanationHtml": "A multi-hundred-MB model shipped inside the binary via require() or base64 blows past app-store bundle limits (&lt;512MB) and forces every user to download the full weight file just to install the app, whether or not they ever use the feature. Download it on demand instead: show downloadProgress, cache it in the documents directory, and gate it behind explicit user opt-in. <b>Large models are a runtime download with progress and opt-in, never a bundled asset.</b>"
  },
  {
    "id": "z21",
    "category": "ai",
    "categoryLabel": "On-Device AI",
    "question": "Default hardware backend for most models on both platforms?",
    "options": [
      "GPU / Vulkan on every device",
      "CPU (XNNPACK) by default",
      "A cloud TPU",
      "WebGL"
    ],
    "answer": 1,
    "explanationHtml": "Hardware backend choice determines both speed and portability, and the safe default across the widest device range is CPU: XNNPACK is the default backend for most models on both platforms. iOS can use Core ML for some models for extra speed, but Android GPU acceleration is currently limited, so don&#x27;t assume GPU/Vulkan is available everywhere. <b>CPU via XNNPACK is the portable default; GPU paths are a platform-specific optimization, not a baseline.</b>"
  },
  {
    "id": "z22",
    "category": "ai",
    "categoryLabel": "On-Device AI",
    "question": "The library is pre-1.0. What's the senior practice?",
    "options": [
      "Always auto-update to the latest",
      "Fork the library",
      "Pin the exact version + adapter and read release notes before bumping",
      "Ignore versioning"
    ],
    "answer": 2,
    "explanationHtml": "A pre-1.0 library treats breaking changes as routine, not exceptional, so the senior move is to control when you absorb them rather than get surprised by them: pin the exact library version and adapter, and read release notes before bumping. Red flag: auto-updating to latest or forking the library both trade a small maintenance cost now for a much bigger one later — an unreviewed breaking change in production, or a fork that drifts from upstream fixes. <b>Pre-1.0, I pin exact versions and read release notes before bumping — I don't find out about breaking changes in production.</b>"
  },
  {
    "id": "z23",
    "category": "ai",
    "categoryLabel": "On-Device AI",
    "question": "Why does the LLM batch token emissions (~10 tokens / 80ms)?",
    "options": [
      "To deliberately slow generation",
      "To avoid re-render storms when tokens arrive very fast",
      "Only to save battery",
      "To throttle the network"
    ],
    "answer": 1,
    "explanationHtml": "Generation can exceed 60 tokens/sec, and firing a state update per token at that rate floods the render thread — the bottleneck isn't the model, it's React trying to re-render dozens of times a second. Batching emissions (~10 tokens / 80ms) caps the update rate to something the render thread can absorb without dropping frames. Red flag: 'it's just to save battery' undersells it — the real reason is protecting render throughput. <b>I batch high-frequency emissions to protect the render thread, not just to save battery.</b>"
  },
  {
    "id": "z24",
    "category": "ai",
    "categoryLabel": "On-Device AI",
    "question": "How do you bound an LLM's context memory?",
    "options": [
      "Increase max tokens without limit",
      "Disable Hermes",
      "Add more screens",
      "Use a sliding-window context strategy and cap generation length"
    ],
    "answer": 3,
    "explanationHtml": "An unbounded context window grows memory and per-token latency with conversation length, so left unchecked a long session degrades until it OOMs or stalls. A sliding-window strategy bounds the context that's kept, and capping generation length (e.g. ~256 tokens for short answers) bounds the output side too. Red flag: 'just increase max tokens' is the opposite of the fix — it's the thing causing the degradation. <b>I bound both the context window and the generation length up front — unbounded either one is a memory and latency leak waiting to happen.</b>"
  }
];
