// Batch 5 — Testing (JUnit, MockK, Turbine, Robolectric, Compose/Espresso) and Gradle/build.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED5_FLASHCARD_FILTERS: { value: string; label: string }[] = [
  { value: "gradle", label: "Gradle & Build" },
];

export const ADVANCED5_FLASHCARDS: Flashcard[] = [
  {
    "id": "te-1",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "How do you make coroutine code deterministically testable?",
    "answerHtml": "<b>Inject</b> the dispatcher (don't call <code>Dispatchers.IO</code> directly) and test with <code>runTest</code>, which provides a virtual-time scheduler so <code>delay</code> is skipped and ordering is controllable.\n      <div class=\"code\">@Test fun loads() = runTest {\n  val repo = Repo(io = StandardTestDispatcher(testScheduler))\n  val vm = MyViewModel(repo)\n  advanceUntilIdle()\n  assertEquals(expected, vm.state.value)\n}</div>\n      Hardcoded dispatchers make tests flaky and slow."
  },
  {
    "id": "te-2",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "StandardTestDispatcher vs UnconfinedTestDispatcher?",
    "answerHtml": "<code>StandardTestDispatcher</code> queues coroutines and only runs them when you advance virtual time (<code>advanceUntilIdle()</code>, <code>runCurrent()</code>) — giving precise control over ordering. <code>UnconfinedTestDispatcher</code> runs eagerly (starts coroutines immediately, no dispatch), which is convenient for simple cases but hides ordering bugs. Use Standard when timing matters; Unconfined for quick state-after-launch assertions."
  },
  {
    "id": "te-3",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "How do you test a Flow's emissions?",
    "answerHtml": "With <b>Turbine</b>: <code>flow.test { ... }</code> gives <code>awaitItem()</code>, <code>awaitComplete()</code>, <code>awaitError()</code>, and fails if you leave items unconsumed.\n      <div class=\"code\">vm.uiState.test {\n  assertEquals(Loading, awaitItem())\n  assertEquals(Success(data), awaitItem())\n  cancelAndConsumeRemainingEvents()\n}</div>\n      For a hot <code>StateFlow</code>, remember the current value is replayed as the first item."
  },
  {
    "id": "te-4",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "Fakes vs mocks — the senior position?",
    "answerHtml": "Prefer <b>fakes</b> (hand-written implementations, e.g. an in-memory repository) for state-based tests: reusable, refactor-resistant, and they exercise real behavior. Use <b>mocks</b> (MockK) for interaction verification when 'was X called with Y' is the actual contract under test. Over-mocking couples tests to implementation details, so tests break on harmless refactors — a smell."
  },
  {
    "id": "te-5",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "When do you use Robolectric vs an instrumented test?",
    "answerHtml": "<b>Robolectric</b> runs Android-framework-dependent tests on the local JVM (no emulator) — fast, good for things touching <code>Context</code>, resources, or simple framework calls. <b>Instrumented</b> tests run on a real device/emulator (<code>androidTest</code>) — needed for real rendering, sensors, true integration, and Espresso/Compose UI tests on the actual platform. Balance: Robolectric for speed, instrumented for fidelity on critical flows."
  },
  {
    "id": "te-6",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "How do you assert on Compose UI without reaching into internal state?",
    "answerHtml": "Query the <b>semantics tree</b> exposed for accessibility: <code>onNodeWithText</code>, <code>onNodeWithContentDescription</code>, <code>onNodeWithTag(\"submit\")</code>, then assert (<code>assertIsDisplayed</code>, <code>assertIsEnabled</code>) or act (<code>performClick</code>, <code>performTextInput</code>). Add <code>Modifier.testTag</code> for nodes without text. Testing through semantics also validates accessibility for free."
  },
  {
    "id": "te-7",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "What is an idling/sync concern in Compose tests, and how is it handled?",
    "answerHtml": "Compose tests automatically synchronize with the composition/recomposition clock, so most assertions wait for the UI to settle. For long-running async not driven by the test clock, you can disable auto-advance (<code>mainClock.autoAdvance = false</code>) and manually <code>advanceTimeBy</code>, or wait with <code>waitUntil { }</code>. The Espresso equivalent is an <code>IdlingResource</code>; in Compose it's largely built in."
  },
  {
    "id": "te-8",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "How do you test a ViewModel that exposes StateFlow?",
    "answerHtml": "Construct it with fake collaborators, drive an action, and assert <code>vm.state.value</code> after advancing the test dispatcher — or collect with Turbine. Replace <code>Dispatchers.Main</code> in tests via a JUnit rule that calls <code>Dispatchers.setMain(testDispatcher)</code>/<code>resetMain()</code>, since <code>viewModelScope</code> uses Main. Assert on the single immutable state object rather than intermediate fields."
  },
  {
    "id": "te-9",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "How do you test Room and migrations?",
    "answerHtml": "For DAOs, build an <b>in-memory</b> database (<code>Room.inMemoryDatabaseBuilder</code>) in an instrumented or Robolectric test and assert on Flow output via Turbine. For migrations, use <code>MigrationTestHelper</code> with the exported schema JSON to create the old schema, run the migration, and verify data/shape — this catches crash-on-update before users do."
  },
  {
    "id": "te-10",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "What belongs at each layer of the Android test pyramid?",
    "answerHtml": "Bottom (most): <b>unit</b> tests on ViewModels, use-cases, mappers, pure logic (JVM, fast). Middle: <b>integration</b> — repository + fake API, Room with in-memory DB. Top (fewest): <b>UI/E2E</b> on must-not-break flows (auth, checkout) via Compose test/Espresso, gated in CI. Inverting it (lots of slow E2E, few unit) gives flaky, slow suites."
  },
  {
    "id": "gr-1",
    "category": "gradle",
    "categoryLabel": "GRADLE",
    "question": "KSP vs kapt — why migrate?",
    "answerHtml": "<b>kapt</b> runs Java annotation processors by generating Java stubs for your Kotlin — slow, and a frequent build bottleneck. <b>KSP</b> (Kotlin Symbol Processing) understands Kotlin directly, skipping stub generation, and is typically ~2x faster. Room, Hilt, Moshi, and Glide support KSP. Migrating off kapt is one of the highest-leverage build-speed wins."
  },
  {
    "id": "gr-2",
    "category": "gradle",
    "categoryLabel": "GRADLE",
    "question": "Build types vs product flavors vs variants?",
    "answerHtml": "<b>Build types</b> configure how you build (debug vs release: minify, signing, debuggable). <b>Product flavors</b> configure different versions of the app (free/paid, staging/prod: different app IDs, endpoints). A <b>build variant</b> is the cross-product (e.g. <code>paidRelease</code>). Use flavors for genuinely different builds, not for runtime configuration that a feature flag should handle."
  },
  {
    "id": "gr-3",
    "category": "gradle",
    "categoryLabel": "GRADLE",
    "question": "api vs implementation in Gradle — why does it matter?",
    "answerHtml": "<code>implementation</code> keeps a dependency internal to the module — consumers don't see it on their compile classpath, so changes don't trigger their recompilation (faster builds, better encapsulation). <code>api</code> leaks the dependency transitively to consumers — only use it when your module's public API <i>exposes</i> that dependency's types. Defaulting to <code>implementation</code> is a real build-speed and modularity lever."
  },
  {
    "id": "gr-4",
    "category": "gradle",
    "categoryLabel": "GRADLE",
    "question": "What are version catalogs (libs.versions.toml)?",
    "answerHtml": "A centralized, type-safe place to declare dependency versions and bundles, referenced as <code>libs.androidx.core</code> in build files. They remove version drift across modules, give IDE autocomplete, and make upgrades a one-line change. The standard for multi-module projects, replacing scattered <code>ext</code> version constants."
  },
  {
    "id": "gr-5",
    "category": "gradle",
    "categoryLabel": "GRADLE",
    "question": "Why modularize, and what's the cost?",
    "answerHtml": "Splitting into <code>:feature:*</code> and <code>:core:*</code> modules enables <b>parallel</b> and <b>incremental</b> compilation (only changed modules + dependents rebuild), enforces <b>architectural boundaries</b> (a feature can't import another feature's internals), and unlocks dynamic delivery. Costs: navigation/DI wiring across modules and some boilerplate — usually managed with an api-module pattern and convention plugins."
  },
  {
    "id": "gr-6",
    "category": "gradle",
    "categoryLabel": "GRADLE",
    "question": "What are convention plugins (build-logic) for?",
    "answerHtml": "Instead of copy-pasting the same Android/Kotlin/Compose config into every module's build file, you write a <b>convention plugin</b> in an included <code>build-logic</code> build and apply it (<code>id(\"myapp.android.feature\")</code>). It DRYs up configuration, keeps modules consistent, and centralizes upgrades. It's the scalable alternative to a giant <code>subprojects { }</code> block in the root build."
  },
  {
    "id": "gr-7",
    "category": "gradle",
    "categoryLabel": "GRADLE",
    "question": "How do you speed up Gradle builds in practice?",
    "answerHtml": "Enable the <b>configuration cache</b> and <b>build cache</b>, keep modules small and decoupled, prefer <code>implementation</code> over <code>api</code>, migrate kapt→KSP, avoid dynamic versions, and don't do expensive work in configuration phase. Profile with the <code>--scan</code> build scan to find the actual bottleneck rather than guessing — the same 'measure first' discipline as runtime perf."
  },
  {
    "id": "gr-8",
    "category": "gradle",
    "categoryLabel": "GRADLE",
    "question": "What does R8 do that ProGuard rules still matter for?",
    "answerHtml": "R8 (default since AGP 3.4) does shrinking, optimization, and obfuscation in one pass during release builds. You still maintain <b>keep rules</b>: reflection-based libraries (Gson/Moshi reflective adapters, serialization, named classes loaded by string) break if their members are renamed/removed. Test the release build — a crash that only happens in release is almost always a missing keep rule."
  },
  {
    "id": "te-11",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "How do you replace Dispatchers.Main in a ViewModel test?",
    "answerHtml": "<code>viewModelScope</code> uses <code>Dispatchers.Main</code>, which isn't available on the JVM test runtime. Install a JUnit rule that calls <code>Dispatchers.setMain(testDispatcher)</code> in setup and <code>Dispatchers.resetMain()</code> in teardown. Then the ViewModel's coroutines run on your controllable test dispatcher, and <code>advanceUntilIdle()</code> drives them deterministically."
  },
  {
    "id": "te-12",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "What is screenshot / snapshot testing and when is it worth it?",
    "answerHtml": "Tools like Paparazzi (render Compose on the JVM, no device) or Roborazzi capture a composable to an image and diff it against a golden on every run, catching unintended visual regressions (spacing, theming, dark mode). Worth it for a design system or visually critical screens. Caveat: goldens need maintenance and can be flaky across renderers/fonts — gate them and review diffs deliberately."
  },
  {
    "id": "te-13",
    "category": "test",
    "categoryLabel": "TEST",
    "question": "How do you write a Macrobenchmark to measure startup?",
    "answerHtml": "Use the <code>androidx.benchmark.macro</code> library with a <code>MacrobenchmarkRule</code> and <code>StartupTimingMetric</code>: it installs the app, runs <code>startActivityAndWait()</code> over several iterations with a chosen <code>CompilationMode</code> (e.g. <code>None</code>, <code>Partial</code> with a baseline profile, <code>Full</code>), and reports cold/warm start times. Compare modes to quantify a baseline profile's win. It runs on a real device/emulator, not the JVM."
  },
  {
    "id": "gr-9",
    "category": "gradle",
    "categoryLabel": "GRADLE",
    "question": "What are flavor dimensions?",
    "answerHtml": "When you have two independent axes of flavor — e.g. <code>tier</code> (free/paid) and <code>env</code> (staging/prod) — you declare <code>flavorDimensions += listOf(\"tier\", \"env\")</code> and assign each flavor a dimension. Gradle then generates the cross-product variants (<code>freeStagingDebug</code>, <code>paidProdRelease</code>, …). Dimensions keep combinatorial config organized instead of hand-listing every combination."
  },
  {
    "id": "gr-10",
    "category": "gradle",
    "categoryLabel": "GRADLE",
    "question": "What is the Gradle configuration cache and why does it matter?",
    "answerHtml": "It caches the <i>result of the configuration phase</i> (the task graph) so subsequent builds skip re-running build scripts when nothing relevant changed — a big speedup, especially on large multi-module projects. It requires build logic to be configuration-cache-compatible (no reading mutable state at execution time, no <code>Project</code> access in task actions). Enabling it (and fixing violations) is a high-leverage build-speed project."
  },
  {
    "id": "gr-11",
    "category": "gradle",
    "categoryLabel": "GRADLE",
    "question": "buildSrc vs an included build-logic build for convention plugins?",
    "answerHtml": "Both share build logic, but <code>buildSrc</code> is an implicit dependency of <i>every</i> project — a change to it invalidates the whole build's configuration cache and recompiles everything. An <b>included build</b> (<code>build-logic</code> via <code>includeBuild</code>) is more granular and the current best practice for convention plugins: changes are scoped, and it composes better in large modular projects."
  }
];

export const ADVANCED5_QUIZ_FILTERS: { value: string; label: string }[] = [
  { value: "test", label: "Testing" },
  { value: "gradle", label: "Gradle" },
];

export const ADVANCED5_QUIZ: QuizQuestion[] = [
  {
    "id": "zt1",
    "category": "test",
    "categoryLabel": "Testing",
    "question": "What makes coroutine tests deterministic?",
    "options": [
      "Thread.sleep between assertions",
      "runTest with an injected TestDispatcher and virtual time",
      "Running on Dispatchers.IO",
      "Disabling coroutines"
    ],
    "answer": 1,
    "explanationHtml": "<code>runTest</code> + an injected <code>TestDispatcher</code> skips real delays and controls ordering. Hardcoded real dispatchers make tests flaky."
  },
  {
    "id": "zt2",
    "category": "test",
    "categoryLabel": "Testing",
    "question": "Which library asserts Flow emissions with awaitItem()?",
    "options": [
      "Espresso",
      "Turbine",
      "Robolectric",
      "Hamcrest"
    ],
    "answer": 1,
    "explanationHtml": "Turbine collects a Flow and exposes <code>awaitItem()</code>/<code>awaitComplete()</code>, failing on unconsumed events."
  },
  {
    "id": "zt3",
    "category": "test",
    "categoryLabel": "Testing",
    "question": "Compose UI tests assert against what?",
    "options": [
      "Private composable state",
      "The semantics tree (onNodeWithText/Tag, assertIsDisplayed)",
      "Pixel colors",
      "The Gradle config"
    ],
    "answer": 1,
    "explanationHtml": "Compose tests query the accessibility/semantics tree, which also keeps tests robust and validates a11y."
  },
  {
    "id": "zt4",
    "category": "gradle",
    "categoryLabel": "Gradle",
    "question": "Why migrate annotation processing from kapt to KSP?",
    "options": [
      "KSP adds more features to Java",
      "KSP understands Kotlin directly and skips stub generation, building ~2x faster",
      "kapt was removed",
      "KSP disables R8"
    ],
    "answer": 1,
    "explanationHtml": "KSP processes Kotlin symbols without generating Java stubs, a major build-speed win for Room/Hilt/Moshi."
  },
  {
    "id": "zt5",
    "category": "gradle",
    "categoryLabel": "Gradle",
    "question": "Defaulting to `implementation` over `api` mainly buys you…",
    "options": [
      "Smaller APKs only",
      "Faster builds + encapsulation (deps don't leak transitively)",
      "Automatic obfuscation",
      "Access to more modules"
    ],
    "answer": 1,
    "explanationHtml": "<code>implementation</code> hides a dependency from consumers, so changes don't recompile them and internals stay encapsulated. Use <code>api</code> only when your public API exposes the dependency."
  },
  {
    "id": "zt6",
    "category": "gradle",
    "categoryLabel": "Gradle",
    "question": "A feature works in debug but crashes in release with a 'class not found'. Likely cause?",
    "options": [
      "Hermes is off",
      "A missing R8 keep rule for a reflection-based class",
      "Too many modules",
      "Wrong product flavor"
    ],
    "answer": 1,
    "explanationHtml": "R8 shrinking/obfuscation in release can strip or rename classes loaded reflectively; add a <code>-keep</code> rule and always test the release build."
  }
];

export const ADVANCED5_STUDY: StudySection[] = [
  {
    "id": "st-te-1",
    "num": "E1",
    "title": "E1 · A testing strategy that scales",
    "html": "<p>Design for testability first, then pick tools:</p>\n      <ul>\n        <li><b>Architecture</b>: pure use-cases, injected dispatchers, interfaces at boundaries — most logic becomes a fast JVM unit test.</li>\n        <li><b>Unit</b>: JUnit + MockK; fakes for state, mocks for interaction; <code>runTest</code> + Turbine for coroutines/Flow.</li>\n        <li><b>Integration</b>: in-memory Room, repository with a fake API, migration tests via <code>MigrationTestHelper</code>.</li>\n        <li><b>UI/E2E</b>: a few Compose-test/Espresso flows on auth/checkout, gated in CI; assert via semantics.</li>\n        <li><b>Main dispatcher</b>: swap it with a rule (<code>Dispatchers.setMain</code>) so <code>viewModelScope</code> works under test.</li>\n      </ul>\n      <div class=\"map\"><span class=\"lbl\">In practice</span> The injectable-dispatcher + fake-repository combo is what makes a ViewModel testable in milliseconds. Over-mocking is the anti-pattern to call out.</div>"
  },
  {
    "id": "st-gr-1",
    "num": "E2",
    "title": "E2 · Gradle, modularization & build speed",
    "html": "<p>You should be able to reason about the build like any other system:</p>\n      <ul>\n        <li><b>Variants</b> = build types × product flavors; flavors for genuinely different builds, flags for runtime config.</li>\n        <li><b>Version catalogs</b> centralize versions; <b>convention plugins</b> centralize module config.</li>\n        <li><b>KSP over kapt</b>, <b>implementation over api</b>, configuration + build caches — the big speed levers.</li>\n        <li><b>Modularize</b> by feature and layer for parallel/incremental builds and enforced boundaries; profile with a build <code>--scan</code> to target the real bottleneck.</li>\n        <li><b>R8</b> on for release: shrink/optimize/obfuscate, with keep rules for reflection; ship an <b>App Bundle</b> for per-device delivery.</li>\n      </ul>"
  }
];
