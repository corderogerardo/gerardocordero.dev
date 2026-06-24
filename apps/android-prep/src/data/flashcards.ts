// Base Android interview flashcards. Typed modules are the source of truth — edit directly.
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

// Master filter list — every category used across all flashcard files appears
// exactly once across these arrays (advanced files add coroutines, di, data,
// gradle, security). Keeps the filter chips de-duplicated.
export const FLASHCARD_FILTERS: { value: string; label: string }[] = [
  { "value": "all", "label": "All" },
  { "value": "kotlin", "label": "Kotlin" },
  { "value": "compose", "label": "Compose" },
  { "value": "framework", "label": "Framework" },
  { "value": "arch", "label": "Architecture" },
  { "value": "state", "label": "State & Flow" },
  { "value": "perf", "label": "Performance" },
  { "value": "test", "label": "Testing" },
  { "value": "behavior", "label": "Behavioral" },
  { "value": "opt", "label": "Optimization" },
  { "value": "ai", "label": "On-Device AI" }
];

export const FLASHCARDS: Flashcard[] = [
  {
    "id": "k1",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "val vs var — and why does Kotlin push immutability?",
    "answerHtml": "<code>val</code> is a read-only reference (assigned once); <code>var</code> is reassignable. Immutability by default makes state easier to reason about and is essential for thread-safety and Compose stability. Note <code>val</code> only freezes the <i>reference</i>, not the object — a <code>val list: MutableList</code> can still be mutated; prefer immutable types like <code>List</code> to truly lock it."
  },
  {
    "id": "k2",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "How does Kotlin null-safety work, and why is !! a smell?",
    "answerHtml": "Types are non-null by default; <code>String?</code> opts into nullability. You access safely with <code>?.</code>, default with the Elvis <code>?:</code>, and smart-cast after a null check. <code>!!</code> asserts non-null and throws <code>NullPointerException</code> if wrong — it converts a compile-time guarantee back into a runtime crash. Push nullability to the boundary (parsing, Java platform types) so the rest of the code is non-null by construction."
  },
  {
    "id": "k3",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "What do data classes give you, and what's the copy() gotcha?",
    "answerHtml": "<code>data class</code> auto-generates <code>equals</code>/<code>hashCode</code>/<code>toString</code>/<code>componentN</code>/<code>copy</code> from the primary-constructor properties. Use them for immutable models and update with <code>copy(field = new)</code>. Gotcha: generated <code>equals</code> only considers <i>constructor</i> properties (not body <code>val</code>s), and <code>copy</code> performs a <b>shallow</b> copy — nested mutable objects are shared."
  },
  {
    "id": "k4",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "When do you reach for a sealed interface/class?",
    "answerHtml": "To model a closed set of types — a state machine or result. Because the compiler knows all subtypes, an exhaustive <code>when</code> needs no <code>else</code>, so adding a new case becomes a compile error you must handle. Classic uses: <code>sealed interface UiState { object Loading; data class Success(...); data class Error(...) }</code> and a <code>Result</code> success/failure type."
  },
  {
    "id": "k5",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "Explain the scope functions: let, run, with, apply, also.",
    "answerHtml": "They differ by <b>receiver</b> and <b>return</b>. <code>let</code> (it → result) for null-guarded transforms; <code>run</code> (this → result) for compute-and-return; <code>with</code> (this → result) like run but not an extension; <code>apply</code> (this → receiver) for configuring an object; <code>also</code> (it → receiver) for side-effects like logging. Rule of thumb: <code>apply</code>/<code>also</code> return the object; <code>let</code>/<code>run</code>/<code>with</code> return the lambda result."
  },
  {
    "id": "k6",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "What do inline + reified buy you?",
    "answerHtml": "<code>inline</code> copies a function's body (and its lambdas) into the call site, eliminating lambda-allocation overhead and enabling non-local returns. That inlining is what makes <code>reified</code> possible: a <code>reified T</code> retains the concrete type at runtime, so you can write <code>inline fun &lt;reified T&gt; Gson.fromJson(s) = fromJson(s, T::class.java)</code> without passing a <code>Class</code>. Cost: inlining large functions bloats bytecode."
  },
  {
    "id": "k7",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "Explain generics variance: out vs in (covariance/contravariance).",
    "answerHtml": "<code>out T</code> (covariant) means T is only <i>produced</i> — a <code>List&lt;Cat&gt;</code> is a <code>List&lt;out Animal&gt;</code>. <code>in T</code> (contravariant) means T is only <i>consumed</i> — a <code>Comparator&lt;Animal&gt;</code> works as a <code>Comparator&lt;Cat&gt;</code>. This is declaration-site variance; at use sites you can also write <code>List&lt;out Animal&gt;</code>. <code>*</code> is the star-projection when you don't care about the argument."
  },
  {
    "id": "k8",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "extension functions vs member functions — and a caveat?",
    "answerHtml": "Extensions add functions to a type without subclassing — great for utilities and keeping classes focused. They're resolved <b>statically</b> on the declared (compile-time) type, so they don't polymorphically override members and a real member always wins over an extension with the same signature. They compile to static methods taking the receiver as the first parameter."
  },
  {
    "id": "comp1",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "What is Jetpack Compose and how is it different from Views?",
    "answerHtml": "Compose is a <b>declarative</b> UI toolkit: you write <code>@Composable</code> functions that describe UI as a function of state, and the framework re-invokes (recomposes) them when state changes. There's no imperative view tree to <code>findViewById</code> and mutate. Versus XML/Views: less boilerplate, state-driven updates, and powerful composition over inheritance."
  },
  {
    "id": "comp2",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "What is recomposition and when does it happen?",
    "answerHtml": "Recomposition re-invokes composables whose <b>inputs changed</b> to update the UI. Compose tracks reads of <code>State</code> objects; when a state you read changes, the enclosing recomposition scope re-runs. It's intelligent (skips unchanged, stable composables) and can run out of order or in parallel — so composables must be side-effect-free and idempotent."
  },
  {
    "id": "comp3",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "What is state hoisting?",
    "answerHtml": "Moving state up out of a composable so the composable becomes <b>stateless</b> — it receives <code>value</code> and emits changes via <code>onValueChange</code>. This makes UI reusable, testable, and gives a single source of truth (often the ViewModel). The pattern: state flows down, events flow up (unidirectional data flow)."
  },
  {
    "id": "comp4",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "remember vs rememberSaveable?",
    "answerHtml": "<code>remember</code> caches a value across <b>recompositions</b> but is lost on configuration change or process death. <code>rememberSaveable</code> additionally persists through those via the saved-instance-state bundle (the value must be Parcelable / in the Saver). Use <code>remember</code> for derived/transient state, <code>rememberSaveable</code> for UI state the user expects to survive rotation (scroll position, input)."
  },
  {
    "id": "comp5",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "Why is LaunchedEffect preferred over launching a coroutine in the body?",
    "answerHtml": "A composable body runs on every recomposition, so launching a coroutine there fires repeatedly. <code>LaunchedEffect(key)</code> launches once when it enters composition, cancels when it leaves, and restarts only when <code>key</code> changes — exactly the lifecycle you want for one-shot side effects like loading data or showing a snackbar."
  },
  {
    "id": "comp6",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "What makes a Composable 'skippable', and why does stability matter?",
    "answerHtml": "Compose skips re-running a composable if all its parameters are <b>stable</b> and unchanged. Stable = the compiler can trust equality and change-notification (primitives, <code>@Immutable</code>/<code>@Stable</code> types, functional types). An unstable param (e.g. a plain <code>List</code> or a class from another module without stability info) forces recomposition every time. Fix with immutable collections or stability annotations."
  },
  {
    "id": "fw1",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "Walk through the Activity lifecycle.",
    "answerHtml": "<code>onCreate</code> (create UI) → <code>onStart</code> (visible) → <code>onResume</code> (foreground, interactive). Going away: <code>onPause</code> (losing focus) → <code>onStop</code> (hidden) → <code>onDestroy</code> (finishing or config change). Returning re-enters at <code>onStart</code>/<code>onRestart</code>. Do lightweight work in <code>onPause</code> (it blocks the next activity); release resources in <code>onStop</code>."
  },
  {
    "id": "fw2",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "What happens on a configuration change like rotation?",
    "answerHtml": "By default the system destroys and recreates the Activity so it can load config-specific resources. Transient view state is saved/restored via <code>onSaveInstanceState</code>; durable state belongs in a <code>ViewModel</code> (survives the recreation) or persistent storage. Handling it yourself with <code>android:configChanges</code> is an escape hatch you should rarely use."
  },
  {
    "id": "fw3",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "Why use viewLifecycleOwner in a Fragment?",
    "answerHtml": "A Fragment's view can be created and destroyed multiple times while the Fragment instance lives (e.g. on the back stack). Observing LiveData/Flow with the <i>fragment</i> as owner leaks the old view and double-subscribes. <code>viewLifecycleOwner</code> is tied to the view's lifecycle, so observers are removed when the view is destroyed."
  },
  {
    "id": "fw4",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "Explicit vs implicit Intents?",
    "answerHtml": "An <b>explicit</b> Intent names the exact component (<code>Intent(this, DetailActivity::class.java)</code>) — used within your app. An <b>implicit</b> Intent declares an action/data (<code>ACTION_VIEW</code> a URL) and the system resolves a handler via intent filters. On modern Android, package visibility and background-launch limits restrict implicit intents, so verify resolution and handle the no-handler case."
  },
  {
    "id": "fw5",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "What is process death and how do you survive it?",
    "answerHtml": "When your app is backgrounded, the OS may kill its process to reclaim memory. On return the user expects their place back, but your in-memory state (including ViewModel) is gone. Survive it by persisting UI state in <code>SavedStateHandle</code>/<code>onSaveInstanceState</code> for transient values and a database/DataStore for durable data. Test with developer-option \"Don't keep activities.\""
  },
  {
    "id": "fw6",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "WorkManager vs a foreground Service vs coroutines — which when?",
    "answerHtml": "<b>WorkManager</b> for deferrable, guaranteed background work that must survive process death/reboot (sync, upload) with constraints. <b>Foreground Service</b> for user-visible ongoing work that must run now (media playback, navigation), with a notification. <b>coroutines in a lifecycle scope</b> for in-app async tied to a screen. Don't use a Service for a one-off sync, and don't use WorkManager for immediate UI-scoped work."
  },
  {
    "id": "arch1",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "Describe a modern Android app architecture in layers.",
    "answerHtml": "<b>UI layer</b> (Compose + ViewModel exposing immutable state) → <b>Domain layer</b> (optional use-cases, pure Kotlin) → <b>Data layer</b> (repositories that own a single source of truth, plus remote + local data sources). Dependencies point inward; UI never touches the network directly. State flows up from the data layer as Flows; events flow down as function calls."
  },
  {
    "id": "arch2",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "What is the repository pattern and why use it?",
    "answerHtml": "A repository is the single entry point for a type of data. It hides whether data came from network, cache, or DB; owns the stale-while-revalidate logic; and maps DTOs to clean domain models. Benefits: the UI is decoupled from data sources, caching/offline logic lives in one place, and you can swap a fake repository in tests trivially."
  },
  {
    "id": "arch3",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "MVVM vs MVI — what's the difference?",
    "answerHtml": "MVVM: the ViewModel exposes observable state and the View binds to it; updates can come from multiple methods. MVI tightens this into <b>one immutable UiState</b> plus a single stream of intents/actions reduced into new state — strict unidirectional flow. MVI's single-state-object predictability shines on complex, experiment-heavy screens; MVVM is lighter for simple ones."
  },
  {
    "id": "arch4",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "What does 'single source of truth' mean in practice?",
    "answerHtml": "Each piece of data has exactly one authoritative owner; everyone else observes it. For offline-first, the <b>local database is the source of truth</b> — the UI always reads from Room, and the network layer's only job is to update the DB, which then emits to the UI via Flow. This prevents the bugs you get when the cache and the screen hold divergent copies."
  },
  {
    "id": "arch5",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "Why model UI state as one immutable data class?",
    "answerHtml": "A single <code>data class UiState(val items: List, val isLoading: Boolean, val error: String?)</code> makes invalid combinations visible and renders atomically — no flicker from updating three separate <code>LiveData</code> out of sync. The ViewModel emits a new immutable copy via <code>copy()</code>; the UI renders exactly what it's given. It's also trivially testable: assert on one object."
  },
  {
    "id": "arch6",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "Why modularize an Android codebase?",
    "answerHtml": "Splitting into <code>:feature:*</code> and <code>:core:*</code> Gradle modules buys <b>faster builds</b> (parallel + incremental compilation; only changed modules rebuild), <b>enforced boundaries</b> (a feature physically can't import another feature's internals), and clearer ownership. It also enables dynamic feature delivery. The cost is wiring/navigation between modules, usually handled by an API-module pattern."
  },
  {
    "id": "stt1",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "StateFlow vs LiveData — why do teams move to StateFlow?",
    "answerHtml": "Both are observable holders, but <code>StateFlow</code> is a Kotlin-first, always-has-a-value, conflated Flow that composes with operators and works in pure-Kotlin (testable, multiplatform) code. LiveData is Android-only and lifecycle-aware by default. With <code>collectAsStateWithLifecycle()</code> / <code>repeatOnLifecycle</code>, StateFlow gets the same lifecycle safety — so most modern apps standardize on StateFlow."
  },
  {
    "id": "stt2",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "StateFlow vs SharedFlow — when each?",
    "answerHtml": "<code>StateFlow</code> holds a single current <b>state</b> value (initial required, conflated, distinct-until-changed) — perfect for UI state. <code>SharedFlow</code> is a configurable hot stream good for <b>one-shot events</b> (navigate, show toast) where you don't want a 'current value' replayed on every new collector. Modeling events as state causes them to re-fire on rotation — a common bug."
  },
  {
    "id": "stt3",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "What does stateIn(WhileSubscribed) do and why use 5000ms?",
    "answerHtml": "<code>stateIn</code> converts a cold Flow into a hot <code>StateFlow</code> shared among collectors. <code>SharingStarted.WhileSubscribed(5000)</code> keeps the upstream active while there are subscribers and for 5s after the last one leaves. That 5s window means a configuration change (which briefly drops the subscriber) doesn't tear down and re-run the upstream — you keep the cached value and avoid a re-fetch."
  },
  {
    "id": "stt4",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "How do you collect a Flow safely from the UI?",
    "answerHtml": "In Compose use <code>collectAsStateWithLifecycle()</code>; in Views use <code>repeatOnLifecycle(Lifecycle.State.STARTED) { flow.collect { } }</code>. Both stop collecting when the UI goes below STARTED, so you don't waste work or update invisible UI in the background. Avoid the deprecated <code>launchWhenStarted</code> — it suspends but keeps the upstream hot."
  },
  {
    "id": "stt5",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "How do you combine multiple data sources into one UI state?",
    "answerHtml": "Use <code>combine(flowA, flowB) { a, b -> UiState(a, b) }</code> in the ViewModel, then <code>stateIn</code> it. <code>combine</code> emits whenever any source emits, giving a single reactive state stream. For 'cancel the previous when input changes' (e.g. search → results) use <code>flatMapLatest</code>, which cancels the in-flight inner flow when a new query arrives."
  },
  {
    "id": "pf1",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "What causes jank and how do you measure it?",
    "answerHtml": "Jank is a frame that misses the ~16.6ms budget (60fps), usually from main-thread work: I/O, large JSON parsing, bitmap decoding, or excessive recomposition. Measure with <b>JankStats</b> in the field, the <b>Macrobenchmark</b> library + Perfetto traces in the lab, and the Layout Inspector's recomposition counts for Compose. Profile on a <i>release</i> build."
  },
  {
    "id": "pf2",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "What are Baseline Profiles and why do they help?",
    "answerHtml": "A Baseline Profile ships a list of hot code paths so ART can <b>AOT-compile</b> them at install time instead of interpreting/JIT-ing on first run. The payoff is faster cold start and smoother first-time scroll/animation — often 20–30%+ on key journeys. You generate them with a Macrobenchmark test that exercises the critical user flows."
  },
  {
    "id": "pf3",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "How do you keep a LazyColumn smooth?",
    "answerHtml": "Provide stable <code>key</code>s in <code>items(list, key = { it.id })</code> so items aren't needlessly recomposed/moved; keep item content stable (avoid unstable params); hoist expensive work out of the item; use <code>contentType</code> for heterogeneous lists; and avoid nesting scrollables. Then verify recomposition counts dropped rather than guessing."
  },
  {
    "id": "pf4",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "Your screen recomposes too often. How do you fix it?",
    "answerHtml": "Find the unstable input with Layout Inspector / compiler metrics, then: make models <code>@Immutable</code> or use <code>kotlinx.collections.immutable</code>; pass lambdas stably (Compose auto-remembers most); defer frequently-changing reads to the layout/draw phase (e.g. <code>Modifier.offset { }</code>) or wrap with <code>derivedStateOf</code>; and read state as low in the tree as possible. Measure before and after."
  },
  {
    "id": "pf5",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "Single most important rule before optimizing?",
    "answerHtml": "Profile first. Measure with Perfetto / Macrobenchmark / the Studio profilers to find the real bottleneck, fix that specific thing, then re-measure. Blind optimization (sprinkling <code>remember</code>, adding threads) adds complexity and often fixes nothing — and can hide the real cost."
  },
  {
    "id": "tst1",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "What does the Android test pyramid look like?",
    "answerHtml": "Many fast <b>unit</b> tests (JUnit + MockK) on ViewModels, use-cases, mappers, and pure logic; a middle layer of <b>integration</b> tests (Room with an in-memory DB, repositories with a fake API); and a few <b>UI/E2E</b> tests (Compose UI test or Espresso) on must-not-break flows like auth and checkout. Robolectric runs framework-dependent tests on the JVM for speed."
  },
  {
    "id": "tst2",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "How do you test coroutines and Flows?",
    "answerHtml": "Use <code>runTest</code> from kotlinx-coroutines-test, which gives a virtual-time <code>TestScope</code> so delays are skipped deterministically. <b>Inject</b> dispatchers (never hardcode <code>Dispatchers.IO</code>) and pass a <code>StandardTestDispatcher</code>/<code>UnconfinedTestDispatcher</code>. Assert Flow emissions with <b>Turbine</b>: <code>flow.test { assertEquals(x, awaitItem()) }</code>."
  },
  {
    "id": "tst3",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "Fakes vs mocks — which do you prefer?",
    "answerHtml": "Prefer a hand-written <b>fake</b> (e.g. an in-memory repository implementing the same interface) for state-based tests — it's reusable and doesn't couple to call sequences. Use <b>mocks</b> (MockK) for interaction verification when the behavior under test <i>is</i> 'did we call X'. Over-mocking makes tests assert implementation details and breaks on every refactor."
  },
  {
    "id": "tst4",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "How do you test a Composable?",
    "answerHtml": "With <code>createComposeRule()</code> / <code>createAndroidComposeRule()</code>. You set content, then query the <b>semantics</b> tree: <code>composeTestRule.onNodeWithText(\"Submit\").performClick()</code> and assert with <code>assertIsDisplayed()</code>/<code>assertIsEnabled()</code>. Test behavior through semantics, not internal state, and add <code>testTag</code>/content descriptions for nodes that need stable handles."
  },
  {
    "id": "beh1",
    "category": "behavior",
    "categoryLabel": "STAR",
    "question": "Tell me about the hardest performance problem you solved.",
    "answerHtml": "Use STAR. Shape: a list screen dropped frames on mid-range devices. I <i>profiled instead of guessing</i> (Perfetto + recomposition counts), found an unstable list parameter forcing full recomposition and a synchronous image decode on the main thread. I made the model immutable, added stable keys, moved decoding off-thread, and added a baseline profile + Macrobenchmark to guard it. Result: smooth scroll and a regression test.\n        <div class=\"hint\">Tip: end on the lesson — \"I profile, fix the proven hotspot, then add a benchmark so it can't regress.\"</div>"
  },
  {
    "id": "beh2",
    "category": "behavior",
    "categoryLabel": "STAR",
    "question": "Describe a disagreement with product or design.",
    "answerHtml": "Frame it calmly: I disagree with <b>data and options</b>, not ego. Shape: product wanted a feature that risked an ANR-prone main-thread path; I laid out the trade-off (cost, risk, a lighter alternative), asked what user goal we were actually serving, and we shipped a phased version. Point I make: I raise concerns early and in writing, then commit fully once we decide.\n        <div class=\"hint\">Tip: say \"align\" and \"trade-off,\" not \"fight.\"</div>"
  },
  {
    "id": "beh3",
    "category": "behavior",
    "categoryLabel": "STAR",
    "question": "How do you ramp up on a large, unfamiliar codebase?",
    "answerHtml": "I read the <b>data flow before the files</b> — entry points, DI graph, the navigation graph, the repositories — then make the smallest safe change to learn the feedback loop, leaning on types and tests. I follow existing patterns rather than importing my own, and I ask targeted questions early. The phrase I use: \"the smallest safe change that unblocks the next feature.\"\n        <div class=\"hint\">Tip: name a concrete first PR you'd make — a small bug fix with a test.</div>"
  },
  {
    "id": "beh4",
    "category": "behavior",
    "categoryLabel": "STAR",
    "question": "Tell me about owning a release end-to-end.",
    "answerHtml": "Shape: I owned a release on a small team — wiring CI to run unit + instrumented tests, managing signing and Play Console tracks, a staged rollout (5% → 100%) gated on crash-free rate, and a kill-switch flag for the risky feature. When a regression appeared at 5%, I halted, root-caused, fixed, added a regression test, and re-rolled. Ownership through QA to production, with monitoring as part of 'done.'\n        <div class=\"hint\">Tip: stress \"I owned\" and \"crash-free rate as the guardrail.\"</div>"
  },
  {
    "id": "opt1",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "Name three common Android memory-leak sources.",
    "answerHtml": "Holding a <code>Context</code>/View/Activity past its lifecycle (static refs, long-lived singletons); inner classes / callbacks / Handlers that capture the outer Activity; and listeners/observers/coroutines not cancelled (e.g. <code>GlobalScope</code> or a flow collected without lifecycle awareness). LeakCanary surfaces the retaining reference chain."
  },
  {
    "id": "opt2",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "Why is a stable key important in a list?",
    "answerHtml": "Without stable keys, a recycling/lazy list ties item identity to position, so on insert/reorder/delete it reuses the wrong slot — causing visual glitches and needless recomposition. Provide a stable unique id (<code>key = { it.id }</code>) so Compose/RecyclerView can track items across changes and animate correctly."
  },
  {
    "id": "opt3",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "Two levers to shrink an Android app and speed it up?",
    "answerHtml": "Enable <b>R8</b> (shrinking + resource removal + obfuscation) to cut dead code and size, and ship the app as an <b>Android App Bundle</b> so Play delivers per-device splits (density, ABI, language). Add a <b>baseline profile</b> for startup. Audit dependencies and use the APK Analyzer to find bloat."
  },
  {
    "id": "opt4",
    "category": "opt",
    "categoryLabel": "OPT",
    "question": "How do you keep heavy work from blocking app startup?",
    "answerHtml": "Trim <code>Application.onCreate</code>; use the <b>App Startup</b> library to order/lazy-init components; defer non-critical SDK init off the launch path (or to a background dispatcher); show first content fast and hydrate the rest. Measure cold start on a release build with Macrobenchmark and treat it as a budget."
  },
  {
    "id": "ai1",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "Why run an AI model on-device instead of server-side?",
    "answerHtml": "Three benefits: <b>privacy</b> (data never leaves the device), <b>offline</b> operation, and <b>no per-call server cost</b> — plus low latency for small models. The trade-offs are model size, RAM/thermals, and device fragmentation, so you feature-detect capability and fall back to a server model when needed."
  },
  {
    "id": "ai2",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "What is Gemini Nano and how do you access it on Android?",
    "answerHtml": "Gemini Nano is Google's smallest model that runs <b>on-device</b> via the system <b>AICore</b> service. You access it through high-level <b>ML Kit GenAI APIs</b> (summarization, proofreading, rewrite, image description) or the AICore/Edge SDK. It's gated to capable devices (e.g. Pixel 8+/select flagships), so you must check availability and may need to trigger a model download."
  },
  {
    "id": "ai3",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "What is the MediaPipe LLM Inference API for?",
    "answerHtml": "It runs open LLMs (Gemma, and others) fully on-device across a wider range of phones than Nano, with GPU/CPU backends. You bundle or download a quantized <code>.task</code>/<code>.bin</code> model, create an inference session, and stream tokens. Use it when you need a specific open model or broader device reach than AICore's Gemini Nano provides."
  },
  {
    "id": "ai4",
    "category": "ai",
    "categoryLabel": "AI",
    "question": "How do you size an on-device LLM to a device?",
    "answerHtml": "Budget RAM and storage: a ~1–2B quantized model needs roughly 1–2GB RAM at runtime. Use <b>quantization</b> (int4/int8) to cut size and speed inference with minimal quality loss. Check available memory and device tier, prefer GPU delegates where supported, cap context/generation length, and download large models on demand with a progress UI rather than bloating the APK."
  },
  {
    "id": "k9",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "== vs === in Kotlin?",
    "answerHtml": "<code>==</code> is <b>structural</b> equality — it calls <code>equals()</code> (and is null-safe: <code>a == b</code> translates to <code>a?.equals(b) ?: (b === null)</code>). <code>===</code> is <b>referential</b> equality — same object instance. For data classes, <code>==</code> compares fields; <code>===</code> checks identity. Coming from Java, <code>==</code> in Kotlin is the Java <code>.equals()</code>, not <code>==</code>."
  },
  {
    "id": "k10",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "map vs flatMap vs associateBy on collections?",
    "answerHtml": "<code>map</code> transforms each element 1:1. <code>flatMap</code> maps each element to a collection and flattens the results into one list (e.g. all tags across posts). <code>associateBy { it.id }</code> builds a <code>Map</code> keyed by a selector — handy to index a list for O(1) lookup. Kotlin's sequence (<code>asSequence()</code>) variants make long operator chains lazy to avoid intermediate lists."
  },
  {
    "id": "k11",
    "category": "kotlin",
    "categoryLabel": "KOTLIN",
    "question": "What is a value class (inline class) and why use one?",
    "answerHtml": "A <code>@JvmInline value class UserId(val raw: String)</code> wraps a single value with <b>no runtime allocation</b> in most cases — the compiler inlines the underlying type. It gives you type safety (a <code>UserId</code> can't be passed where an <code>OrgId</code> is expected) without the boxing cost of a normal wrapper. Use it for domain-typed primitives (ids, money) to prevent mix-ups."
  },
  {
    "id": "stt6",
    "category": "state",
    "categoryLabel": "STATE",
    "question": "Why does emitting to MutableStateFlow sometimes 'drop' a value?",
    "answerHtml": "<code>StateFlow</code> is <b>conflated</b> and uses equality: if you set the same value (by <code>equals</code>) it won't emit, and fast successive updates may skip intermediates because collectors only see the latest. That's correct for <i>state</i> (you only care about current). If you need every discrete event (including duplicates), use a <code>SharedFlow</code>/<code>Channel</code> instead — modeling events as StateFlow is the bug."
  },
  {
    "id": "pf6",
    "category": "perf",
    "categoryLabel": "PERF",
    "question": "What is overdraw and how do you reduce it?",
    "answerHtml": "Overdraw is the GPU painting the same pixel multiple times per frame (stacked opaque backgrounds, full-screen layers). Reduce it by removing redundant backgrounds, not setting a window/background color you'll fully cover, and flattening view hierarchies. In Compose, avoid stacking opaque <code>Box</code> backgrounds. Diagnose with the 'Debug GPU overdraw' developer option — too much red means wasted fill rate."
  },
  {
    "id": "fw7",
    "category": "framework",
    "categoryLabel": "FRAMEWORK",
    "question": "edge-to-edge and WindowInsets — what changed recently?",
    "answerHtml": "Modern apps draw <b>edge-to-edge</b> (content behind the status/navigation bars) and use <b>WindowInsets</b> to pad around system bars, the IME (keyboard), and cutouts. Android 15 enforces edge-to-edge for apps targeting it. In Compose you consume insets with modifiers like <code>Modifier.safeDrawingPadding()</code> or <code>imePadding()</code> rather than hardcoding bar heights — so layouts adapt to gestures nav, keyboards, and notches."
  },
  {
    "id": "arch7",
    "category": "arch",
    "categoryLabel": "ARCH",
    "question": "What is unidirectional data flow (UDF) and why does it reduce bugs?",
    "answerHtml": "UDF means <b>state flows down</b> (from ViewModel/state holder to UI) and <b>events flow up</b> (UI calls functions that produce new state). There's one direction and one owner of truth, so you can't get two-way binding loops or widgets mutating shared state behind each other's backs. It makes the UI a pure function of state — predictable, replayable, and easy to test by asserting on emitted state."
  },
  {
    "id": "comp7",
    "category": "compose",
    "categoryLabel": "COMPOSE",
    "question": "Preview-driven development: why design composables to be previewable?",
    "answerHtml": "<code>@Preview</code> renders a composable in the IDE without running the app — fast iteration on states (loading/empty/error), themes, and screen sizes. To use it well, keep composables <b>stateless</b> (take data + lambdas, not a ViewModel), so a preview can pass fake data directly. Previewability and testability are the same property: a composable that's easy to preview is easy to test."
  }
];
