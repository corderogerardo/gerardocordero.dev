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
    "explanationHtml": "TTI is the headline cold-start metric: tap to a screen the user can actually use. It&#x27;s dominated by JS bundle parse and the work you run before first paint."
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
    "explanationHtml": "Hermes ships bytecode, so there&#x27;s no parse/compile step at launch — lower TTI and lower memory. It&#x27;s the default engine under the New Architecture."
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
    "explanationHtml": "React.memo does a shallow compare; an unstable prop reference defeats it. Stabilize with useMemo/useCallback."
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
    "explanationHtml": "Index keys make a recycling list reuse the wrong view on changes (glitches); random keys break identity every render. Use a stable unique id."
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
    "explanationHtml": "UI-thread animations keep running even when JS is blocked. Reanimated worklets or useNativeDriver:true move work off the JS thread."
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
    "explanationHtml": "Missing cleanup retains references and blocks GC. Always return a cleanup from useEffect: remove listeners, clear intervals, cancel subscriptions."
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
    "explanationHtml": "Measure before optimizing. Blind memoization adds overhead and often fixes nothing; fix the proven hotspot, then re-measure."
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
    "explanationHtml": "Deep specific imports plus sideEffects:false and minify/shrink (R8) strip dead code. Barrel files and side-effects defeat tree-shaking."
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
    "explanationHtml": "v2 uses New-Architecture synchronous layout to auto-measure items, so estimatedItemSize is no longer needed."
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
    "explanationHtml": "JSI lets JS call native synchronously with no JSON bridge — the foundation of the New Architecture (Fabric + TurboModules)."
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
    "explanationHtml": "runAfterInteractions defers work until animations/interactions finish, protecting the frame rate during navigation."
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
    "explanationHtml": "The Profiler attributes each re-render to the prop, state, or context change that caused it."
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
    "explanationHtml": "Local weights + local compute means privacy (data never leaves the device), offline use, no server cost, and low latency."
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
    "explanationHtml": "It ships native code that requires the New Architecture; the old architecture is unsupported."
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
    "explanationHtml": "Native modules can&#x27;t run in the prebuilt Expo Go sandbox — you need a dev build (expo-dev-client + prebuild/EAS)."
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
    "explanationHtml": "Initialization with a resource-fetcher adapter is mandatory at the app root, or model APIs throw an &#x27;adapter not initialized&#x27; error."
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
    "explanationHtml": "Budget storage and RAM carefully. Roughly: 8GB+ devices handle 3B; 6GB handle 1B quantized; 4GB are computer-vision only."
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
    "explanationHtml": "Unmounting while generating crashes the app. Stop generation first; only one LLM instance can be active at a time."
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
    "explanationHtml": "Quantization lowers weight precision for a big memory/speed win (e.g. ~42% smaller) at minimal quality cost."
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
    "explanationHtml": "Bundling has a &lt;512MB limit and bloats the app. Download large models on demand, show downloadProgress, and cache in the documents dir."
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
    "explanationHtml": "CPU (XNNPACK) is the default path; iOS may use Core ML for some models, and Android GPU acceleration is currently limited."
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
    "explanationHtml": "Breaking changes are routine pre-1.0. Pinned model constants guarantee runtime compatibility — don&#x27;t hand-edit them or blind-upgrade."
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
    "explanationHtml": "Generation can exceed 60 tok/s; batching emissions protects the render thread from a flood of state updates."
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
    "explanationHtml": "A sliding-window strategy bounds context; capping generation length (~256 tokens for short answers) keeps memory and latency in check."
  }
];
