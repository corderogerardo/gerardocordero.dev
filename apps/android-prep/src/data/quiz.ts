// Base Android quiz. Typed modules are the source of truth — edit directly.
export type QuizQuestion = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  options: string[];
  answer: number;
  explanationHtml: string;
};

// Base quiz filter chips. Advanced files add coroutines, compose, framework,
// di, data, arch, test — "all" is declared only here so it appears once.
export const QUIZ_FILTERS: { value: string; label: string }[] = [
  { "value": "all", "label": "All" },
  { "value": "kotlin", "label": "Kotlin" },
  { "value": "opt", "label": "Optimization" },
  { "value": "ai", "label": "On-Device AI" }
];

export const QUIZ: QuizQuestion[] = [
  {
    "id": "z1",
    "category": "kotlin",
    "categoryLabel": "Kotlin",
    "question": "What does the Elvis operator ?: do?",
    "options": [
      "Throws if the left side is null",
      "Returns the right side when the left side is null",
      "Casts a nullable type to non-null",
      "Calls a method only if non-null"
    ],
    "answer": 1,
    "explanationHtml": "<code>a ?: b</code> evaluates to <code>a</code> if it is non-null, otherwise <code>b</code>. <code>!!</code> throws on null; <code>?.</code> is the safe call."
  },
  {
    "id": "z2",
    "category": "kotlin",
    "categoryLabel": "Kotlin",
    "question": "Which scope function returns the receiver object (not the lambda result)?",
    "options": [
      "let",
      "run",
      "apply",
      "with"
    ],
    "answer": 2,
    "explanationHtml": "<code>apply</code> (and <code>also</code>) return the receiver, ideal for configuring an object. <code>let</code>/<code>run</code>/<code>with</code> return the lambda result."
  },
  {
    "id": "z3",
    "category": "kotlin",
    "categoryLabel": "Kotlin",
    "question": "Why does an exhaustive `when` over a sealed type need no `else`?",
    "options": [
      "Kotlin always requires an else branch",
      "The compiler knows all subtypes, so it can verify completeness",
      "sealed types can't be used in when",
      "else is added automatically at runtime"
    ],
    "answer": 1,
    "explanationHtml": "Because a sealed hierarchy is closed at compile time, the compiler checks every case is handled — adding a new subtype turns the missing case into a compile error."
  },
  {
    "id": "z4",
    "category": "kotlin",
    "categoryLabel": "Kotlin",
    "question": "What does `reified` require to work?",
    "options": [
      "A companion object",
      "The function to be `inline`",
      "Reflection enabled at runtime",
      "A sealed class"
    ],
    "answer": 1,
    "explanationHtml": "Type parameters are normally erased. Marking a function <code>inline</code> lets the type be <code>reified</code> — its concrete type is available at the call site, e.g. <code>T::class.java</code>."
  },
  {
    "id": "z5",
    "category": "kotlin",
    "categoryLabel": "Kotlin",
    "question": "`List<out T>` expresses which kind of variance?",
    "options": [
      "Contravariance (consumer)",
      "Invariance",
      "Covariance (producer)",
      "Bivariance"
    ],
    "answer": 2,
    "explanationHtml": "<code>out</code> is covariance: T is only produced, so <code>List&lt;Cat&gt;</code> is usable as <code>List&lt;out Animal&gt;</code>. <code>in</code> is contravariance (consumer)."
  },
  {
    "id": "z6",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "What does a Baseline Profile improve?",
    "options": [
      "Network latency",
      "Cold start and first-run jank via AOT compilation of hot paths",
      "APK signing speed",
      "Battery only"
    ],
    "answer": 1,
    "explanationHtml": "Baseline Profiles let ART precompile listed hot code at install time, so the first runs aren't interpreted — improving cold start and early scroll smoothness."
  },
  {
    "id": "z7",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "A Composable re-runs on every recomposition even though its data looks unchanged. Most likely cause?",
    "options": [
      "It's written in Kotlin",
      "An unstable parameter (e.g. a plain List) defeats skipping",
      "It uses too few Modifiers",
      "Hermes is disabled"
    ],
    "answer": 1,
    "explanationHtml": "Compose only skips composables whose params are stable and unchanged. An unstable type forces recomposition — fix with immutable collections or <code>@Immutable</code>."
  },
  {
    "id": "z8",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "Best key for a LazyColumn whose items can reorder or be deleted?",
    "options": [
      "The list index",
      "A stable unique id from the item",
      "Math.random() each composition",
      "The item's display title"
    ],
    "answer": 1,
    "explanationHtml": "Index keys tie identity to position and glitch on reorder/delete; random keys break identity each pass. Use a stable unique id via <code>key = { it.id }</code>."
  },
  {
    "id": "z9",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "What's the correct first step before optimizing performance?",
    "options": [
      "Add remember everywhere",
      "Profile to find the real bottleneck on a release build",
      "Rewrite the screen in XML Views",
      "Increase the heap size"
    ],
    "answer": 1,
    "explanationHtml": "Measure first (Perfetto / Macrobenchmark / profilers) on a release build, fix the proven hotspot, then re-measure. Blind memoization adds overhead and often fixes nothing."
  },
  {
    "id": "z10",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "An ANR is most often caused by what?",
    "options": [
      "Too many Composables",
      "Blocking the main thread (I/O, locks) for several seconds",
      "Using StateFlow",
      "Enabling R8"
    ],
    "answer": 1,
    "explanationHtml": "ANRs fire when the main thread can't process input (~5s). The fix is moving I/O and heavy work off the main thread with coroutines + the right dispatcher."
  },
  {
    "id": "z11",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "Which tool auto-detects retained objects and shows the reference chain in debug builds?",
    "options": [
      "LeakCanary",
      "Retrofit",
      "WorkManager",
      "Espresso"
    ],
    "answer": 0,
    "explanationHtml": "LeakCanary watches destroyed objects, triggers a heap dump on retention, and reports the shortest path keeping them alive — your first leak-hunting tool."
  },
  {
    "id": "z12",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "Why prefer an Android App Bundle (AAB) over a universal APK?",
    "options": [
      "It disables R8",
      "Play generates optimized per-device splits (density, ABI, language), shrinking download size",
      "It encrypts the app",
      "It removes the need for signing"
    ],
    "answer": 1,
    "explanationHtml": "From an AAB, Play delivers only the code/resources each device needs, reducing install size versus shipping every density and ABI in one APK."
  },
  {
    "id": "z13",
    "category": "ai",
    "categoryLabel": "On-Device AI",
    "question": "What does on-device inference primarily buy you?",
    "options": [
      "Unlimited model size",
      "Privacy, offline operation, and no per-call server cost",
      "Guaranteed higher accuracy than any server model",
      "No need to handle device differences"
    ],
    "answer": 1,
    "explanationHtml": "Local weights + local compute keep data on the device, work offline, and avoid server cost — at the price of model size, RAM, and device fragmentation."
  },
  {
    "id": "z14",
    "category": "ai",
    "categoryLabel": "On-Device AI",
    "question": "How do apps typically access Gemini Nano on Android?",
    "options": [
      "By bundling the weights in the APK",
      "Through the system AICore service / ML Kit GenAI APIs",
      "Via a WebView",
      "Only through a cloud endpoint"
    ],
    "answer": 1,
    "explanationHtml": "Gemini Nano runs in the on-device AICore system service; apps call it via ML Kit GenAI APIs (summarize, rewrite, etc.). It's gated to capable devices."
  },
  {
    "id": "z15",
    "category": "ai",
    "categoryLabel": "On-Device AI",
    "question": "Why quantize an on-device model (e.g. int4/int8)?",
    "options": [
      "To increase numerical precision",
      "Smaller size and faster inference with minimal quality loss",
      "To remove the RAM requirement entirely",
      "To require a network connection"
    ],
    "answer": 1,
    "explanationHtml": "Quantization lowers weight precision, cutting memory and speeding inference at a small quality cost — essential to fit mid-range devices."
  },
  {
    "id": "z16",
    "category": "ai",
    "categoryLabel": "On-Device AI",
    "question": "Best way to ship a multi-hundred-MB on-device model?",
    "options": [
      "Bundle it in the APK with the rest of the assets",
      "Hardcode it as a base64 string",
      "Download it on demand with a progress UI and cache it",
      "Email it to users"
    ],
    "answer": 2,
    "explanationHtml": "Bundling huge models bloats the binary and hits delivery limits. Download on first use with progress + opt-in and cache to app storage; feature-detect device capability first."
  },
  {
    "id": "z17",
    "category": "kotlin",
    "categoryLabel": "Kotlin",
    "question": "In Kotlin, `a == b` on two data class instances compares…",
    "options": [
      "Object identity (same instance)",
      "Structural equality via equals() (field by field)",
      "Memory addresses",
      "Always false unless identical references"
    ],
    "answer": 1,
    "explanationHtml": "<code>==</code> is structural (calls <code>equals()</code>, null-safe); <code>===</code> is referential identity. Data classes generate field-based <code>equals</code>."
  },
  {
    "id": "z18",
    "category": "kotlin",
    "categoryLabel": "Kotlin",
    "question": "What does a @JvmInline value class primarily provide?",
    "options": [
      "Faster reflection",
      "Type safety for a single wrapped value with no allocation in most cases",
      "Automatic serialization",
      "Thread safety"
    ],
    "answer": 1,
    "explanationHtml": "It wraps one value (e.g. <code>UserId(String)</code>) for type safety without the boxing cost of a normal wrapper class."
  },
  {
    "id": "z19",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "Edge-to-edge layouts should pad around system bars using…",
    "options": [
      "Hardcoded status bar height",
      "WindowInsets (e.g. safeDrawingPadding / imePadding)",
      "A fixed 24dp top padding",
      "Disabling the navigation bar"
    ],
    "answer": 1,
    "explanationHtml": "WindowInsets adapt to status/navigation bars, the IME, and cutouts across devices; hardcoding heights breaks on gesture nav, keyboards, and notches."
  },
  {
    "id": "z20",
    "category": "opt",
    "categoryLabel": "Optimization",
    "question": "Excessive 'red' in the Debug GPU Overdraw tool indicates…",
    "options": [
      "Memory leaks",
      "The same pixels are painted many times per frame (wasted fill rate)",
      "Network errors",
      "Too many coroutines"
    ],
    "answer": 1,
    "explanationHtml": "Overdraw means stacked opaque layers repaint pixels. Remove redundant backgrounds and flatten hierarchies to reduce it."
  },
  {
    "id": "z21",
    "category": "ai",
    "categoryLabel": "On-Device AI",
    "question": "Why batch token emissions when streaming an on-device LLM into Compose?",
    "options": [
      "To slow generation deliberately",
      "To avoid a recomposition storm from very fast token updates",
      "To save network bandwidth",
      "To increase model accuracy"
    ],
    "answer": 1,
    "explanationHtml": "Generation can exceed 60 tokens/sec; emitting per token would trigger a flood of recompositions. Coalesce ~10 tokens / frame to protect the UI thread."
  },
  {
    "id": "z22",
    "category": "ai",
    "categoryLabel": "On-Device AI",
    "question": "Gemini Nano is hosted by which Android system component?",
    "options": [
      "WorkManager",
      "AICore",
      "The Play Store app",
      "A bundled .task file in your APK"
    ],
    "answer": 1,
    "explanationHtml": "Gemini Nano runs inside the AICore system service (shared across apps), accessed via ML Kit GenAI APIs — your app ships no model weights."
  }
];
