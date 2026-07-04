// Module 18 — The Testing Pyramid (Android track). See ../lessons/FORMAT.md
// and ./FORMAT-KOTLIN.md for the schema and Kotlin-specific traps.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "testing-pyramid-android",
  title: "The Testing Pyramid",
  emoji: "📐",
  lang: "kotlin",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "the-pyramid",
      title: "The pyramid",
      steps: [
        {
          type: "text",
          md: [
            "## Not all tests are worth the same",
            "PawWalk has real logic worth testing: the distance math from module 11 (turning GPS fixes into meters and kilometers), the price formatting from module 3, the offline sync queue from module 14. But not every test should look the same, or cost the same to run. The **testing pyramid** is a shape, not a rulebook: a wide base of cheap tests, a narrower middle, a small tip.",
            "At the base sit **JVM unit tests** — plain JUnit, no Android device or emulator involved, just the JVM on your laptop. They test pure logic: given this input, is the output correct? A function that turns 1,842 meters into `\"1.84 km\"` doesn't need a phone to verify — it needs a value and an assertion. These run in milliseconds and there should be hundreds of them.",
            "In the middle, **Robolectric** simulates Android framework classes (`Context`, `SharedPreferences`, resources) directly on the JVM, no emulator required. It's for code that touches the framework but doesn't need to be pixel-perfect — a repository that reads a string resource, a class that checks `ConnectivityManager`.",
            "At the top, a handful of **instrumented tests** — Compose UI tests that actually render a screen and click through it. These are the slowest and priciest to run, so the pyramid keeps them few and reserved for flows where only \"does the real UI behave\" is a good enough question.",
            "Speed and determinism drive the shape: a test suite that's mostly UI tests is slow to run and flaky to trust, so most of the confidence should come from the fast, deterministic base.",
          ],
        },
        {
          type: "code",
          title: "core/DistanceFormatterTest.kt",
          source: String.raw`import org.junit.Assert.assertEquals
import org.junit.Test

class DistanceFormatterTest {
    @Test
    fun formatsUnder1000MetersAsWholeMeters() {
        val label = formatDistance(842.0)
        assertEquals("842 m", label)
    }

    @Test
    fun formats1000MetersAndOverAsKilometers() {
        val label = formatDistance(1840.0)
        assertEquals("1.84 km", label)
    }
}`,
          caption: "No Context, no emulator, no Android import at all — just a function and two assertions. This is the base of the pyramid: it runs in the JVM in milliseconds, and it's the exact distance-formatting logic from module 11's LiveViewModel.",
        },
        {
          type: "quiz",
          q: "Which of these belongs in a fast JVM unit test at the base of the pyramid?",
          choices: [
            "A test that renders WalkScreen and taps the \"Book\" button to check navigation",
            "A test of the pure function that converts a price in cents to a display string like \"$25.00\"",
            "A test that checks a real notification appears in the system tray",
            "A screenshot comparison of the booking confirmation screen",
          ],
          answer: 1,
          explain: "Pure logic with no Android framework dependency — given cents in, get a formatted string out — is exactly what a JVM unit test is for: no device, no simulation, just a function and an assertion, so it runs in milliseconds.",
          nudge: "Look for the option that takes a plain value and returns a plain value, with nothing about screens, taps, or system UI involved.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "coroutines-flow-turbine",
      title: "Coroutines & Flow with Turbine",
      steps: [
        {
          type: "text",
          md: [
            "## Testing suspend functions and Flows needs its own tools",
            "Module 13 built `LiveViewModel`'s state as a `StateFlow` — values arriving over time, not just once. A plain JUnit assertion can't wait for \"the next emission\"; it needs `kotlinx-coroutines-test`.",
            "**`runTest`** is a coroutine test builder that runs on **virtual time**: a `delay(30_000)` inside the code under test doesn't actually pause the test for 30 real seconds — the virtual clock just skips forward instantly. That's what keeps a suite of coroutine tests fast even when the production code has real delays and retries built in. Under the hood `runTest` uses a **`TestDispatcher`**, which is what makes that time control possible in the first place.",
            "For asserting on a `Flow` (or `StateFlow`) emission-by-emission, the **Turbine** library adds a `.test { }` block: inside it, **`awaitItem()`** suspends until the next value arrives and returns it, so you can assert against exactly what came out, in order.",
          ],
        },
        {
          type: "code",
          title: "viewmodel/LiveViewModelTest.kt",
          source: String.raw`import app.cash.turbine.test
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Test

class LiveViewModelTest {
    @Test
    fun distanceStartsAtZero() = runTest {
        val viewModel = LiveViewModel(fakeLocationSource())

        viewModel.distanceMeters.test {
            assertEquals(0.0, awaitItem())
        }
    }
}`,
          caption: "runTest gives the coroutine scope virtual time; inside it, `.test { }` opens a Turbine block on the StateFlow, and `awaitItem()` reads the first emission — the same `distanceMeters` StateFlow module 13's LiveScreen collects with `collectAsState()`.",
        },
        {
          type: "exercise",
          title: "Assert the first emission",
          prompt: [
            "Inside the Turbine block already open on `state`, assert that the first emission equals `expected`:",
            "Call `assertEquals(expected, awaitItem())`.",
          ],
          starter: String.raw`fun emitsTheInitialState() = runTest {
    val expected = WalkUiState(distanceMeters = 0.0)

    viewModel.state.test {
        // your code here
    }
}`,
          solution: String.raw`fun emitsTheInitialState() = runTest {
    val expected = WalkUiState(distanceMeters = 0.0)

    viewModel.state.test {
        assertEquals(expected, awaitItem())
    }
}`,
          checks: [
            { re: /viewModel\.state\.test\{/, hint: "Open the Turbine block on `viewModel.state` with `.test { … }`." },
            { re: /awaitItem\(\)/, hint: "Call `awaitItem()` to read the next emission from the Flow." },
            { re: /assertEquals\(expected,awaitItem\(\)\)/, hint: "Assert with `assertEquals(expected, awaitItem())` — expected first, then the emission." },
          ],
          success: "That's exactly how PawWalk's ViewModel tests check a StateFlow — awaitItem() reads it, assertEquals checks it, one emission at a time.",
        },
        {
          type: "quiz",
          q: "Why does runTest use virtual time instead of letting delays run for real?",
          choices: [
            "It doesn't — runTest just runs slower to match real delays",
            "So a test suite covering code with real delays (retries, debounces, timeouts) still runs in milliseconds, by skipping delay() forward instantly instead of actually waiting",
            "Virtual time is only for UI tests, not coroutine tests",
            "To make tests less deterministic, simulating network jitter",
          ],
          answer: 1,
          explain: "Production code is full of legitimate delays — retry backoff, debounce, polling intervals. Virtual time lets a test assert on the outcome of a 30-second delay without the test itself taking 30 seconds, which is exactly what keeps the fast base of the pyramid fast even when the code it's testing isn't instant.",
          nudge: "Think about what would happen to a large test suite if every delay() in the production code actually had to elapse in real time during every test run.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "fakes-over-mocks",
      title: "Fakes over mocks",
      steps: [
        {
          type: "text",
          md: [
            "## A fake is a second, simpler implementation — not a script of expectations",
            "Module 15 introduced `WalkerRepository` as an interface, injected via Hilt. A **mock** is a generated stand-in that plays back a scripted expectation — \"when `getWalkers()` is called, return this list\" — and can fail a test for reasons that have nothing to do with the behavior you actually care about, like calling a method one extra time.",
            "A **fake** is different: it's a small, real class that implements the same interface with real (if simplified) behavior — an in-memory list instead of a network call — and returns canned data because that's genuinely what it does, not because it was told to expect a call. Fakes are more robust than mocks precisely because there's no expectation script to break; the test just asks the fake what it returns, the same way it would ask the real thing.",
            "In a Hilt-based app, swapping a fake in for tests is exactly what module 15's `@Module`/`@InstallIn` pattern is for: a test-only Hilt module binds `WalkerRepository` to the fake instead of the real network-backed implementation, so anything under test that injects the interface gets the fake without changing a line of production code.",
          ],
        },
        {
          type: "code",
          title: "test/fakes/FakeWalkerRepository.kt",
          source: String.raw`class FakeWalkerRepository : WalkerRepository {
    var walkersToReturn: List<Walker> = emptyList()

    override suspend fun getWalkers(): List<Walker> = walkersToReturn
}`,
          caption: "Implements the real WalkerRepository interface from module 15 — no scripted expectations, just a var a test can set before calling getWalkers(). Swap it in via a test Hilt module and every class that injects WalkerRepository gets this instead of the network-backed one.",
        },
        {
          type: "exercise",
          title: "Write a fake booking repository",
          prompt: [
            "Write `FakeBookingRepository`, implementing `BookingRepository`, whose `getBookings()` returns a canned list:",
            "1. `class FakeBookingRepository : BookingRepository {`\n2. A `var bookingsToReturn: List<Booking> = emptyList()` property.\n3. `override suspend fun getBookings(): List<Booking> = bookingsToReturn`.",
          ],
          starter: String.raw`// your code here`,
          solution: String.raw`class FakeBookingRepository : BookingRepository {
    var bookingsToReturn: List<Booking> = emptyList()

    override suspend fun getBookings(): List<Booking> = bookingsToReturn
}`,
          checks: [
            { re: /class FakeBookingRepository:BookingRepository\{/, hint: "Declare `class FakeBookingRepository : BookingRepository { … }` — a real class implementing the interface." },
            { re: /var bookingsToReturn:List<Booking>=emptyList\(\)/, hint: "Declare the settable backing property: `var bookingsToReturn: List<Booking> = emptyList()` — a test sets it before calling. The override returns it, so it must actually exist." },
            { re: /override suspend fun getBookings\(\):List<Booking>=bookingsToReturn/, hint: "Override `getBookings()` to return the `bookingsToReturn` property, not a hardcoded list inline." },
          ],
          success: "That's a real fake — a class implementing BookingRepository with canned data a test can set, ready to swap in via a test Hilt module.",
        },
        {
          type: "quiz",
          q: "Why does a fake tend to be more robust than a mock for testing a repository?",
          choices: [
            "Fakes run faster on the JVM than mocks do",
            "A fake is a real implementation returning real data, so a test only breaks when the actual behavior changes — a mock's scripted expectations can break for incidental reasons, like an extra call, unrelated to the behavior under test",
            "Mocks can't implement Kotlin interfaces at all",
            "Fakes don't need to implement the interface, so there's less code to write",
          ],
          answer: 1,
          explain: "A mock's brittleness comes from the expectation script itself — it can fail on incidental details (call count, argument matching) that have nothing to do with whether the code under test behaves correctly. A fake just behaves like a simplified real thing, so it only fails when that behavior is actually wrong.",
          nudge: "Think about what makes a test fail with each approach: a mock fails when the scripted expectations don't match; a fake fails when its actual behavior doesn't match. Which one is more tightly coupled to internals that have nothing to do with correctness?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "compose-ui-tests-sparingly",
      title: "Compose UI tests, sparingly",
      steps: [
        {
          type: "text",
          md: [
            "## The tip of the pyramid: a real Compose tree, rendered and clicked",
            "**`createComposeRule()`** sets up a Compose UI test — it can host any `@Composable` content directly, without a full Android activity, which keeps it faster than a true instrumented test on a device. Inside a test, `composeTestRule.setContent { … }` renders the composable under test.",
            "Nodes are found by what a user would actually see or by a stable tag: **`onNodeWithText(\"…\")`** finds a node by its visible text, and `onNodeWithTag(\"…\")` finds one by an explicit `Modifier.testTag(\"…\")` for nodes without unique text. Once found, **`assertIsDisplayed()`** checks it's actually visible, and `performClick()` simulates a tap.",
            "For pixel-level regressions — did this screen's layout shift unexpectedly — **Roborazzi** takes a screenshot during a Robolectric-backed test and diffs it against a saved baseline, giving deterministic pixel comparisons on the JVM instead of a real device.",
            "These are the most expensive tests to write and run, and the ones most likely to be flaky (timing, animation, layout). Keep the count small and pick them for the highest-value flows — booking a walk, not every button on every screen.",
          ],
        },
        {
          type: "code",
          title: "ui/BookingScreenTest.kt",
          source: String.raw`import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import org.junit.Rule
import org.junit.Test

class BookingScreenTest {
    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun bookingButtonIsShown() {
        composeTestRule.setContent { BookingScreen() }

        composeTestRule.onNodeWithText("Book a walk").assertIsDisplayed()
    }
}`,
          caption: "createComposeRule() as a JUnit @Rule hosts BookingScreen without a full Activity. onNodeWithText finds the button by its visible label — the same label a real walker would tap — and assertIsDisplayed checks it actually rendered.",
        },
        {
          type: "exercise",
          title: "Assert the booking button is displayed",
          prompt: [
            "`composeTestRule` already rendered the screen above the marker. Find the \"Book a walk\" node and assert it's displayed:",
            "Call `composeTestRule.onNodeWithText(\"Book a walk\").assertIsDisplayed()`.",
          ],
          starter: String.raw`fun showsTheBookingButton() {
    composeTestRule.setContent { BookingScreen() }
    // your code here
}`,
          solution: String.raw`fun showsTheBookingButton() {
    composeTestRule.setContent { BookingScreen() }
    composeTestRule.onNodeWithText("Book a walk").assertIsDisplayed()
}`,
          checks: [
            { re: /composeTestRule\.onNodeWithText\("Book a walk"\)\.assertIsDisplayed\(\)/, hint: "Chain it in one call: `composeTestRule.onNodeWithText(\"Book a walk\").assertIsDisplayed()` — assert on the same node you found, not a different one." },
          ],
          success: "That's a real Compose UI test assertion — find the node a walker would actually see, then confirm it rendered.",
        },
        {
          type: "quiz",
          q: "Why does the pyramid keep Compose UI and screenshot tests to a small number, compared to hundreds of JVM unit tests?",
          choices: [
            "Compose UI tests can't check anything a unit test can't already check",
            "They're the slowest and most timing-sensitive tests to run, so most of the suite's confidence should come from the fast, deterministic base — UI tests are reserved for the highest-value flows",
            "Roborazzi doesn't support Compose, only old Views",
            "Because Android Studio limits how many UI tests a project can have",
          ],
          answer: 1,
          explain: "UI tests render real composition trees and are far more sensitive to timing, layout, and animation than a pure-function unit test — so they're the most expensive per test to write, run, and keep un-flaky. The pyramid shape puts most of the confidence in the fast base and saves the few, pricier UI/screenshot tests for flows where only a rendered check will do.",
          nudge: "Compare what each layer costs to run and how likely it is to be flaky — that's exactly why the pyramid is wide at the bottom and narrow at the top.",
        },
      ],
    },
  ],
});
