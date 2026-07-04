// Module 19 — Performance & Baseline Profiles (Android track). See ../lessons/FORMAT.md
// and ./FORMAT-KOTLIN.md for the schema and Kotlin-specific traps.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "performance-android",
  title: "Performance & Baseline Profiles",
  emoji: "⏱️",
  lang: "kotlin",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "jank-and-frame-budget",
      title: "Jank & the frame budget",
      steps: [
        {
          type: "text",
          md: [
            "## You have about 16 milliseconds",
            "A screen refreshing at 60 frames per second gives your app roughly **16ms** to produce each frame — measure, layout, draw, all of it. On a 90Hz or 120Hz display that budget shrinks further, to about 11ms or 8ms. Miss it and the screen shows the same frame twice: a dropped frame the walker actually feels as a stutter. That stutter has a name: **jank**.",
            "All of this work happens on the **main thread** — the same thread that handles touch input and runs your Compose code. Block it with something slow (a big computation, a synchronous disk read, a database query) and every frame due during that block gets janked, not just one.",
            "One of the most common causes of jank in a Compose app isn't a slow computation at all — it's a composable **recomposing far more often than it needs to**, redoing layout and draw work every time some unrelated state ticks, like a live GPS position updating 10 times a second and dragging a whole screen along with it.",
            "Don't guess where the time is going. Android Studio's **Layout Inspector** shows you recomposition counts per composable, and a **system trace** (Perfetto) shows exactly which frames blew the budget and why. Measure first, then fix.",
          ],
        },
        {
          type: "code",
          title: "ui/WalkScreen.kt — recomposes too often",
          source: String.raw`@Composable
fun WalkScreen(viewModel: LiveViewModel) {
    val state by viewModel.state.collectAsState()

    // BAD: a new lambda is created on every recomposition of WalkScreen,
    // so PriceBadge below never sees an "unchanged" input and can't be skipped.
    PriceBadge(onClick = { viewModel.showPriceDetails() })

    Text("Distance: \${state.distanceMeters} m")
}`,
          caption: "PriceBadge's onClick lambda is rebuilt fresh every single recomposition — even when nothing about the price actually changed — so Compose can never treat it as \"the same as last time\" and skip PriceBadge's own recomposition.",
        },
        {
          type: "quiz",
          q: "At a steady 60 frames per second, roughly how much time does your app have to produce each frame before the user feels a dropped frame (jank)?",
          choices: [
            "About 16 milliseconds",
            "About 160 milliseconds",
            "About 1 second",
            "There's no real budget — Android just renders as fast as it can",
          ],
          answer: 0,
          explain: "1000ms / 60 frames ≈ 16.6ms per frame. Miss that budget on the main thread — with a slow computation or excessive recomposition — and the same frame gets shown twice, which is what the user perceives as a stutter.",
          nudge: "Divide one second by 60 frames.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "recomposition-and-stability",
      title: "Recomposition & stability",
      steps: [
        {
          type: "text",
          md: [
            "## Compose skips work when it safely can",
            "Recomposition is Compose re-running a composable function to reflect new state. It's normal and expected — the problem is only when it happens **more than necessary**. Compose's optimization is to **skip** recomposing a composable entirely when all of its inputs are **stable** and equal to what they were last time.",
            "A type is stable when Compose can trust that if an instance doesn't report a change, it hasn't changed — `Int`, `String`, and `data class`es of stable types all qualify. What defeats stability (and skipping) are things like: a **lambda recreated on every call** instead of remembered, a class with a **public `var`** Compose can't track, or a plain (non-`@Stable`/non-`@Immutable`) interface type.",
            "**`remember { }`** caches a value across recompositions of the *same* composable instance, computing it only once (or when its keys change) instead of on every recomposition. **`derivedStateOf { }`** goes further: it derives a new value from other state, but only actually triggers recomposition of readers when the *derived* result changes — not every time the underlying state ticks. A GPS feed updating 10 times a second but a `derivedStateOf` that only flips from `false` to `true` once a walk crosses 1km means readers of that derived value recompose once, not ten times a second.",
          ],
        },
        {
          type: "code",
          title: "ui/WalkScreen.kt — hoisted with remember",
          source: String.raw`@Composable
fun WalkScreen(viewModel: LiveViewModel) {
    val state by viewModel.state.collectAsState()

    // GOOD: remember { } caches this lambda across recompositions, so
    // PriceBadge sees the same onClick reference every time and can be skipped.
    val onPriceClick = remember { { viewModel.showPriceDetails() } }
    PriceBadge(onClick = onPriceClick)

    Text("Distance: \${state.distanceMeters} m")
}`,
          caption: "Same screen as before, but the lambda is created once and reused — PriceBadge's onClick input is now stable across recompositions, so Compose can skip re-running PriceBadge when nothing it actually depends on has changed.",
        },
        {
          type: "exercise",
          title: "Cache an expensive value with remember",
          prompt: [
            "`formatWalkSummary()` is expensive to compute and only needs to run once per composition, not on every recomposition. Cache it:",
            "Declare `val summary = remember { formatWalkSummary() }`.",
          ],
          starter: String.raw`@Composable
fun WalkSummaryLabel() {
    // your code here
    Text(summary)
}`,
          solution: String.raw`@Composable
fun WalkSummaryLabel() {
    val summary = remember { formatWalkSummary() }
    Text(summary)
}`,
          checks: [
            { re: /val summary=remember\{formatWalkSummary\(\)\}/, hint: "Wrap the call: `val summary = remember { formatWalkSummary() }` — the expensive call goes inside the `remember` block, not outside it." },
            { re: /Text\(summary\)/, hint: "Render the cached value: `Text(summary)` — pass the `summary` you just declared, not a fresh `formatWalkSummary()` call." },
          ],
          success: "That's exactly the pattern: remember { } caches the result the first time and reuses it on every later recomposition, until this composable leaves the composition.",
        },
        {
          type: "quiz",
          q: "What lets Compose skip recomposing a composable entirely?",
          choices: [
            "Marking the function `suspend`",
            "All of its inputs being stable and unchanged since the last composition",
            "Calling it from a ViewModel instead of another composable",
            "Wrapping the whole screen in a single giant composable",
          ],
          answer: 1,
          explain: "Compose can safely skip a composable's work only when every input it reads is stable (a type Compose can trust to report changes) and none of them actually changed since last time. A freshly-created lambda or an unstable class defeats that, forcing a recompose \"just in case.\"",
          nudge: "Think about what Compose needs to be SURE of before it can safely say \"nothing changed, skip it.\"",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "baseline-profiles",
      title: "Baseline Profiles",
      steps: [
        {
          type: "text",
          md: [
            "## Give the critical path a head start",
            "Normally, Kotlin/Java bytecode is interpreted at first, and only **JIT-compiled** (just-in-time, to native machine code) after it's been run often enough to be worth optimizing. That's fine for code that runs constantly — but it means the *very first* launch, or the first scroll through the walker list, runs on slow, uncompiled code, right when a walker's first impression is being made.",
            "A **Baseline Profile** is a list of classes and methods your app's critical paths use, shipped inside the app as `baseline-prof.txt`. On install, Android **ahead-of-time (AOT) compiles** exactly those methods, so the first launch and first scroll are already running compiled code instead of starting cold. It's a real, measurable win on startup time and first-scroll jank — not a micro-optimization.",
            "You don't write a Baseline Profile by hand — you **generate** it by running a **Macrobenchmark** test that exercises the real user journey (launch the app, scroll the walker list) on a device, using **`BaselineProfileRule`**. The rule records which methods actually ran during that journey and writes them out as the profile.",
          ],
        },
        {
          type: "code",
          title: "baselineprofile/BaselineProfileGenerator.kt",
          source: String.raw`import androidx.benchmark.macro.junit4.BaselineProfileRule
import androidx.test.uiautomator.By
import org.junit.Rule
import org.junit.Test

class BaselineProfileGenerator {
    @get:Rule
    val baselineProfileRule = BaselineProfileRule()

    @Test
    fun generate() = baselineProfileRule.collect(
        packageName = "com.pawwalk.android",
    ) {
        pressHome()
        startActivityAndWait()

        // Scroll the walker list — the journey worth compiling ahead of time.
        device.findObject(By.res("walker_list")).fling(androidx.test.uiautomator.Direction.DOWN)
    }
}`,
          caption: "collect(packageName = …) drives the app through launch and a list scroll on a real device; BaselineProfileRule records every method that ran and writes it into baseline-prof.txt, which ships inside the release build.",
        },
        {
          type: "exercise",
          title: "Collect a baseline profile",
          prompt: [
            "Call `collect` on `baselineProfileRule` for PawWalk's package, then launch the app inside the block:",
            "1. `baselineProfileRule.collect(packageName = \"com.pawwalk.android\") {`\n2. Inside the block: `pressHome()` then `startActivityAndWait()`.",
          ],
          starter: String.raw`@Test
fun generate() {
    // your code here
}`,
          solution: String.raw`@Test
fun generate() = baselineProfileRule.collect(
    packageName = "com.pawwalk.android",
) {
    pressHome()
    startActivityAndWait()
}`,
          checks: [
            { re: /baselineProfileRule\.collect\(/, hint: "Call `collect` on `baselineProfileRule` — that's the API that drives the journey and records the profile." },
            { re: /packageName="com\.pawwalk\.android"/, hint: "Pass PawWalk's real package name: `packageName = \"com.pawwalk.android\"`." },
            { re: /pawwalk\.android",?\)\{pressHome\(\)startActivityAndWait\(\)/, hint: "Put `pressHome()` then `startActivityAndWait()` INSIDE the `collect(...) { … }` block, in that order — an empty block with the calls sitting elsewhere records nothing." },
          ],
          success: "That's a real Baseline Profile generator — collect() drives the journey once, and every method that ran gets written into baseline-prof.txt for AOT compilation on install.",
        },
        {
          type: "quiz",
          q: "What does a Baseline Profile actually speed up?",
          choices: [
            "It makes your Kotlin source code itself run fewer instructions",
            "It ahead-of-time compiles the methods used by critical journeys (like first launch or first scroll), so they don't start out slow and interpreted like normal cold code",
            "It replaces JIT compilation everywhere, so nothing ever needs to be interpreted again",
            "It shrinks the APK's download size",
          ],
          answer: 1,
          explain: "Without a Baseline Profile, hot code is only compiled after the JIT decides it's worth it — meaning the first run of a critical path is on slow, interpreted code. Shipping a Baseline Profile tells Android to compile exactly those methods ahead of time, so the very first launch and first scroll are already fast.",
          nudge: "Think about WHEN code is normally compiled versus what a profile changes about that timing, specifically for a user's first launch.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "r8-and-measuring-startup",
      title: "R8 & measuring startup",
      steps: [
        {
          type: "text",
          md: [
            "## Shrink for release, measure the release build",
            "**R8** is the compiler that processes your **release** build: it removes code nothing reaches (dead-code elimination), inlines small functions, and renames classes/methods/fields to shorter obfuscated names — all of which shrinks the APK and can speed up execution. It runs automatically on a release build once `minifyEnabled true` is set in Gradle.",
            "R8's aggressiveness is also its danger: reflection, JNI, and serialization access classes by name at runtime in ways R8's static analysis can't see. Without a **keep rule** (a ProGuard/R8 rule saying \"never remove or rename this\"), R8 can strip something that's only reached reflectively — and the app crashes only in release, never in debug.",
            "This is also why you always **benchmark the release build, never debug**: a debug build skips R8 entirely and includes extra instrumentation, so its startup time is meaningfully slower and unrepresentative of what a real walker experiences. Measuring debug tells you nothing true about production performance.",
            "To measure startup itself, **Macrobenchmark** again — this time with **`StartupTimingMetric()`**, which records time-to-initial-display across repeated cold (or warm/hot) launches, run through `measureRepeated`.",
          ],
        },
        {
          type: "code",
          title: "benchmark/StartupBenchmark.kt",
          source: String.raw`import androidx.benchmark.macro.StartupMode
import androidx.benchmark.macro.StartupTimingMetric
import androidx.benchmark.macro.junit4.MacrobenchmarkRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class StartupBenchmark {
    @get:Rule
    val benchmarkRule = MacrobenchmarkRule()

    @Test
    fun coldStartup() = benchmarkRule.measureRepeated(
        packageName = "com.pawwalk.android",
        metrics = listOf(StartupTimingMetric()),
        iterations = 5,
        startupMode = StartupMode.COLD,
    ) {
        pressHome()
        startActivityAndWait()
    }
}`,
          caption: "measureRepeated runs the cold-launch journey 5 times against the release build and StartupTimingMetric records time-to-initial-display each time — a real number to compare before and after adding a Baseline Profile.",
        },
        {
          type: "exercise",
          title: "Measure cold startup time",
          prompt: [
            "Inside `benchmarkRule.measureRepeated(...)`, request the startup metric and a cold start:",
            "1. `metrics = listOf(StartupTimingMetric())`\n2. `startupMode = StartupMode.COLD`",
          ],
          starter: String.raw`fun coldStartup() = benchmarkRule.measureRepeated(
    packageName = "com.pawwalk.android",
    // your code here
) {
    pressHome()
    startActivityAndWait()
}`,
          solution: String.raw`fun coldStartup() = benchmarkRule.measureRepeated(
    packageName = "com.pawwalk.android",
    metrics = listOf(StartupTimingMetric()),
    startupMode = StartupMode.COLD,
) {
    pressHome()
    startActivityAndWait()
}`,
          checks: [
            { re: /metrics=listOf\(StartupTimingMetric\(\)\)/, hint: "Pass the metric as a list: `metrics = listOf(StartupTimingMetric())`." },
            { re: /startupMode=StartupMode\.COLD/, hint: "Set `startupMode = StartupMode.COLD` — a true cold launch, process killed before each run." },
            { re: /benchmarkRule\.measureRepeated\(/, hint: "This all goes inside the call to `benchmarkRule.measureRepeated(...)`." },
          ],
          success: "That's a real startup benchmark — StartupTimingMetric records time-to-initial-display across cold launches, giving you a real number instead of a guess.",
        },
        {
          type: "quiz",
          q: "Why do you benchmark the release build instead of the debug build?",
          choices: [
            "Debug builds can't be installed on a real device",
            "Debug skips R8 entirely and adds extra instrumentation, so its startup is meaningfully slower and doesn't represent what a real user actually experiences",
            "Macrobenchmark only supports release builds technically",
            "Release builds are always exactly the same speed as debug, so it doesn't matter — it's just convention",
          ],
          answer: 1,
          explain: "Debug builds skip R8's shrinking/optimization and carry extra instrumentation overhead, making them slower in ways that have nothing to do with what ships to users. Measuring debug gives you a number that doesn't reflect production reality — release is the only build worth timing.",
          nudge: "Think about what's actually different between a debug build and what a walker installs from the Play Store.",
        },
      ],
    },
  ],
});
