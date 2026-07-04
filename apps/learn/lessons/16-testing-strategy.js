// Module 16 — A Testing Strategy That Scales. See FORMAT.md for the schema.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "testing-strategy",
  title: "A Testing Strategy That Scales",
  emoji: "🧪",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "testing-pyramid",
      title: "The testing pyramid",
      steps: [
        {
          type: "text",
          md: [
            "## Not all tests are the same shape",
            "PawWalk now has real logic worth breaking: price math, a scheduling algorithm, distance calculations, networking, and a handful of screens. If you tested all of it the same way — by launching the whole app and tapping through it — you'd have a test suite that takes ten minutes to run and fails for reasons that have nothing to do with your bug (a flaky animation, a slow simulator, a network hiccup).",
            "The **testing pyramid** is a shape, not a rule: **many** fast unit tests at the bottom, **fewer** integration tests in the middle, and a **handful** of slow UI tests at the top. Wide at the bottom, narrow at the top.",
          ],
        },
        {
          type: "text",
          md: [
            "## Why that shape, specifically",
            "It comes down to three things that get worse as you move up the pyramid:",
            "- **Speed.** A unit test runs in milliseconds — no simulator boot, no UI rendering. A UI test launches the whole app, which can take seconds *per test*. Run a thousand unit tests before your coffee is ready; run a thousand UI tests before lunch.",
            "- **Determinism.** A pure function given the same input always gives the same output. A UI test depends on animation timing, layout, and simulator state — the same test can pass on one run and flake on the next for no code reason at all.",
            "- **Where the bug is cheapest to find.** A unit test that fails points at one function. A UI test that fails could mean the bug is anywhere in the whole flow it exercises — you still have to go dig.",
            "None of this means UI tests are bad — it means put most of your bets where they're fast, deterministic, and precise, and save the slow, broad tests for the handful of things only they can check (**Lesson 4** covers exactly one).",
          ],
        },
        {
          type: "text",
          md: [
            "## What to unit-test in PawWalk",
            "Anything that's **pure logic** — no `SwiftUI`, no networking, no disk — is a unit-test candidate: the booking price math from early modules, the SM-2-style spaced-repetition scheduling if PawWalk ever ships a training-reminder feature, the GPS distance calculation from the live-tracking module. These are functions: input in, output out, nothing else touched.",
            "What needs the **UI** instead: does the booking screen actually show the right price label when you rotate the device, does tapping Confirm actually navigate. Those questions can only be answered by rendering something — which is exactly why they're slower and rarer.",
          ],
        },
        {
          type: "code",
          title: "PawWalkKit/Pricing.swift",
          source: String.raw`import Foundation

/// Pure — no I/O, no UI. A textbook unit-test target.
func totalPriceCents(basePricePerWalkCents: Int, walkCount: Int, discountPercent: Int) -> Int {
    let subtotal = basePricePerWalkCents * walkCount
    let discount = subtotal * discountPercent / 100
    return subtotal - discount
}`,
          caption: "No SwiftUI import, no APIClient, no ModelContext — just numbers in, a number out. Feed it a few (input, expected) pairs and you've covered the function without booting a simulator.",
        },
        {
          type: "quiz",
          q: "Why is the testing pyramid wide at the bottom (many unit tests) and narrow at the top (few UI tests)?",
          choices: [
            "Unit tests are easier to write, so laziness explains the shape",
            "Unit tests are fast and deterministic and pinpoint the failing function; UI tests are slow and can flake for reasons unrelated to the bug, so you want few of them covering only what only they can check",
            "UI tests are more important, so you write fewer of them to keep them special",
            "The shape is arbitrary — any ratio of test types works equally well",
          ],
          answer: 1,
          explain: "Speed and determinism push logic down to unit tests: they run in milliseconds, always give the same answer for the same input, and a failure points straight at one function. UI tests are the only way to check that a real screen renders and responds to taps, but they're slow and can flake on things like animation timing — so you keep them to a handful covering what nothing else can.",
          nudge: "Think about what gets slower and flakier as a test needs more of the real app running underneath it.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "swift-testing-basics",
      title: "Swift Testing basics",
      steps: [
        {
          type: "text",
          md: [
            "## A modern framework, built for this",
            "Apple ships two testing frameworks today: the long-standing **XCTest**, and the newer **Swift Testing** — a framework designed around modern Swift (macros, `async`/`await`, value types) rather than bolted onto Objective-C conventions. Swift Testing is what this module uses.",
            "Three pieces: `import Testing` at the top of a test file, `@Test` marking a function as a test (no `XCTestCase` subclass, no `test` name prefix — just a free function), and `#expect(...)` making an assertion inside it.",
          ],
        },
        {
          type: "text",
          md: [
            "## `#expect` vs `XCTAssert`",
            "XCTest's `XCTAssertEqual(a, b)` tells you *that* two things weren't equal. Swift Testing's `#expect(a == b)` is a normal Swift boolean expression — a macro captures it and, on failure, shows you both sides' actual values automatically. One assertion API (`#expect`) instead of a different function per comparison (`XCTAssertEqual`, `XCTAssertTrue`, `XCTAssertNil`, …).",
            "A `@Test` function can also take **arguments** for parameterized testing — the same test body run once per value in a collection, without copy-pasting the function:",
          ],
        },
        {
          type: "code",
          title: "PawWalkKitTests/PricingTests.swift",
          source: String.raw`import Testing
@testable import PawWalkKit

@Test func totalPriceWithNoDiscount() {
    let total = totalPriceCents(basePricePerWalkCents: 2500, walkCount: 2, discountPercent: 0)
    #expect(total == 5000)
}

@Test(arguments: [0, 10, 25])
func totalPriceNeverExceedsSubtotal(discountPercent: Int) {
    let total = totalPriceCents(basePricePerWalkCents: 2500, walkCount: 2, discountPercent: discountPercent)
    #expect(total <= 5000)
}`,
          caption: "The first test is a plain @Test function. The second takes `arguments:` — Swift Testing runs it three times, once per discount value, each showing up as its own result if it fails. No loop, no XCTest-style helper needed.",
        },
        {
          type: "exercise",
          title: "Write a @Test for priceLabel",
          prompt: [
            "PawWalk's `Walker` has a `priceLabel` computed property (from an earlier module) that formats cents as a dollar string. Write a `@Test` function named `priceLabelFormatsCents` with no arguments, using `#expect` to assert that a `Walker` with `pricePer30MinCents: 3000` has `priceLabel == \"$30 / 30 min\"`.",
          ],
          starter: String.raw`import Testing
@testable import PawWalkKit

// your code here`,
          solution: String.raw`import Testing
@testable import PawWalkKit

@Test func priceLabelFormatsCents() {
    let walker = Walker(pricePer30MinCents: 3000)
    #expect(walker.priceLabel == "$30 / 30 min")
}`,
          checks: [
            { re: /@Test\s*func priceLabelFormatsCents\(\)/, hint: "Mark it `@Test func priceLabelFormatsCents() { … }` — a free function, no XCTestCase subclass." },
            { re: /#expect\(\w+\.priceLabel=="\$30\/30 min"\)/, hint: "The comparison must be the argument to `#expect` itself — `#expect(walker.priceLabel == \"$30 / 30 min\")` — not computed into a separate variable and then `#expect(true)`." },
          ],
          mustNot: [
            { re: /XCTAssert/, hint: "This is Swift Testing, not XCTest — use `#expect`, not `XCTAssertEqual`." },
          ],
          success: "That's a real Swift Testing unit test — free function, `@Test`, `#expect`, no boilerplate.",
        },
        {
          type: "quiz",
          q: "What's the difference between `#expect` and `#require` in Swift Testing?",
          choices: [
            "They're identical — #require is just an older name for #expect",
            "#expect records a failure and keeps running the rest of the test; #require records a failure and stops the test immediately (useful when later lines depend on the value, e.g. unwrapping an optional)",
            "#expect is for synchronous code, #require is only for async code",
            "#require is for UI tests, #expect is for unit tests",
          ],
          answer: 1,
          explain: "#expect keeps going after a failed check, so you see every failure in one run. #require throws and stops the test as soon as it fails — you reach for it when the rest of the test can't meaningfully continue, like unwrapping an optional you need for the next line.",
          nudge: "If a test has three #expect checks and the first one fails, do the other two still run? What about #require?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "testing-async-network",
      title: "Testing async and the network",
      steps: [
        {
          type: "text",
          md: [
            "## `await` works right inside a `@Test`",
            "Module 13 covered `async`/`await` for concurrency; testing it is almost anticlimactic — mark the test function `async` and `await` the call under test, same as anywhere else:",
            "```\n@Test func fetchWalkersReturnsResults() async throws {\n    let client: APIClient = LiveAPIClient()\n    let walkers = try await client.fetchWalkers()\n    #expect(!walkers.isEmpty)\n}\n```",
            "But that test as written has a problem: it hits the **real network**, through the **real** `LiveAPIClient`. Now the test is slow, can fail because a server is down (not because your code is wrong), and needs internet access to run at all in CI.",
          ],
        },
        {
          type: "text",
          md: [
            "## The fix: inject a fake through the protocol seam",
            "This is exactly why Module 14/15 had `WalkRepository` and `APIClient` as **protocols**, not concrete types passed around directly — that protocol boundary is a seam a test can pull apart. Write a `FakeAPIClient` conforming to `APIClient` that returns **canned data** instead of making a request, and hand *that* to the code under test.",
            "The test is no longer testing the network — it's testing that your code does the right thing *given* some walkers, which is exactly what you want a fast, deterministic unit test to check.",
          ],
        },
        {
          type: "code",
          title: "PawWalkKitTests/FakeAPIClient.swift",
          source: String.raw`import Testing
@testable import PawWalkKit

struct FakeAPIClient: APIClient {
    func fetchWalkers() async throws -> [Walker] {
        [Walker(id: "1", name: "Mochi's Human", pricePer30MinCents: 2500)]
    }
}

@Test func bookingViewModelLoadsWalkers() async throws {
    let viewModel = BookingViewModel(client: FakeAPIClient())
    try await viewModel.loadWalkers()
    #expect(viewModel.walkers.count == 1)
}`,
          caption: "FakeAPIClient conforms to the same APIClient protocol the real LiveAPIClient does — the code under test (BookingViewModel) can't tell the difference. No network call ever happens; the canned array comes back instantly, every time.",
        },
        {
          type: "exercise",
          title: "Write a fake WalkerDirectory",
          prompt: [
            "There's a `WalkerDirectory` protocol with one method: `func nearbyWalkers() async throws -> [Walker]`. Write a `struct FakeWalkerDirectory` conforming to it, stubbing `nearbyWalkers()` to return an array with one canned `Walker` (any values you like) — no real lookup.",
          ],
          starter: String.raw`struct FakeWalkerDirectory: WalkerDirectory {
    // your code here
}`,
          solution: String.raw`struct FakeWalkerDirectory: WalkerDirectory {
    func nearbyWalkers() async throws -> [Walker] {
        [Walker(id: "1", name: "Mochi's Human", pricePer30MinCents: 2500)]
    }
}`,
          checks: [
            { re: /struct FakeWalkerDirectory:WalkerDirectory\{/, hint: "Declare `struct FakeWalkerDirectory: WalkerDirectory { … }` — conform to the protocol." },
            { re: /func nearbyWalkers\(\)async throws->\[Walker\]/, hint: "Match the protocol's method signature exactly: `func nearbyWalkers() async throws -> [Walker]`." },
            { re: /\[Walker\(/, hint: "The method body needs to return an array containing at least one `Walker(...)` — an implicit return of `[Walker(...)]` works too." },
          ],
          mustNot: [
            { re: /URLSession|APIClient\(\)|fetchWalkers/, hint: "This is a FAKE — no real networking type or real API client call belongs inside it." },
          ],
          success: "That's a fake conforming to a protocol seam — the same trick FakeAPIClient used, just for a different protocol.",
        },
        {
          type: "quiz",
          q: "Why inject a fake conforming to a protocol instead of just calling the real networking code in a test?",
          choices: [
            "Fakes are required by Swift Testing's syntax — you can't await a real network call in a @Test",
            "A fake returns canned, deterministic data instantly — no real server dependency, no flakiness from network conditions, no slow test — while still exercising the exact same code path through the protocol",
            "Fakes are only needed for UI tests, not unit tests",
            "There's no real difference — it's just a style preference",
          ],
          answer: 1,
          explain: "Hitting a real server makes a test slow, flaky (server down, no internet, rate limits), and non-deterministic. A fake conforming to the same protocol lets the code under test run unmodified while getting fast, predictable canned data back — the whole point of designing around protocol seams in the first place.",
          nudge: "What happens to your test suite the day the staging server is down, if your tests call it directly?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "one-ui-test-that-matters",
      title: "The one UI test that matters",
      steps: [
        {
          type: "text",
          md: [
            "## XCUITest: slow, brittle, but sometimes the only tool",
            "At the very top of the pyramid sits **XCUITest** — Apple's UI-automation framework. It launches the actual app in a simulator, taps real elements, and asserts on what's rendered. It catches things no unit test can: did the app crash on launch, does the first screen actually appear.",
            "It's also the slowest and most brittle layer: a simulator boot takes real seconds, and tests can break because a layout shifted, not because behavior changed. That's the pyramid lesson from Lesson 1 applied — keep **very few** of these.",
          ],
        },
        {
          type: "text",
          md: [
            "## One smoke test, anchored on identifiers",
            "PawWalk keeps exactly one: launch the app, assert the first screen rendered. The contract that makes this reliable is **accessibility identifiers** — a stable string attached to a view (`.accessibilityIdentifier(\"screen-bookings\")`) that a test can look up regardless of layout, text, or localization changes. It's the same idea as a `testID` in a cross-platform app: a name the test and the UI both agree on.",
            "`XCUIApplication()` represents the app under test; `.launch()` starts it fresh; `app.otherElements[\"screen-bookings\"]` (or `.staticTexts`, `.buttons`, matching whatever element type it is) looks up by that identifier, and `.exists` tells you whether it's on screen.",
          ],
        },
        {
          type: "code",
          title: "PawWalkUITests/LaunchTests.swift",
          source: String.raw`import XCTest

final class LaunchTests: XCTestCase {
    func testAppLaunchesToBookingsScreen() {
        let app = XCUIApplication()
        app.launch()

        XCTAssertTrue(app.otherElements["screen-bookings"].exists)
    }
}`,
          caption: "This IS still XCTest, not Swift Testing — XCUITest, the UI-automation layer, still runs on the XCTestCase/XCTAssert foundation as of this writing. That's fine: the framework choice matters far less up here than it does for the hundreds of unit tests below it.",
        },
        {
          type: "exercise",
          title: "Write the launch + assertion",
          prompt: [
            "Inside a test method, create an `XCUIApplication`, call `.launch()` on it, then assert (with `XCTAssertTrue`) that `app.otherElements[\"screen-live-walk\"].exists`.",
          ],
          starter: String.raw`func testAppLaunchesToLiveWalkScreen() {
    // your code here
}`,
          solution: String.raw`func testAppLaunchesToLiveWalkScreen() {
    let app = XCUIApplication()
    app.launch()
    XCTAssertTrue(app.otherElements["screen-live-walk"].exists)
}`,
          checks: [
            { re: /XCUIApplication\(\)/, hint: "Create the app with `XCUIApplication()`." },
            { re: /\.launch\(\)/, hint: "Start it with `.launch()` before asserting anything." },
            { re: /otherElements\["screen-live-walk"\]\.exists/, hint: "Look up the identifier `\"screen-live-walk\"` and assert `.exists`." },
          ],
          mustNot: [
            { re: /sleep\(/, hint: "Don't sleep to wait for launch — XCUITest already waits for the app to become idle before returning from `.launch()`." },
          ],
          success: "That's the whole smoke test — launch, then assert the identifier the UI promises to expose.",
        },
        {
          type: "quiz",
          q: "Why does PawWalk keep only one or two XCUITests instead of covering every screen this way?",
          choices: [
            "XCUITest can only test the first screen an app shows, nothing else",
            "UI tests sit at the top of the pyramid — slow (full app + simulator launch per test) and brittle (layout/timing changes can break them without a real behavior regression) — so they're reserved for the few things only a rendered UI can confirm, like 'does the app boot at all'",
            "Apple limits how many XCUITests a project may contain",
            "Accessibility identifiers only work on the very first screen of an app",
          ],
          answer: 1,
          explain: "Everything from Lesson 1 applies at the top of the pyramid: each XCUITest boots a simulator and renders real UI, so it's slow and prone to breaking on incidental changes rather than real bugs. Reserve this layer for what nothing else can check — the app actually launching and its first screen actually appearing — and push everything else down into fast, deterministic unit tests.",
          nudge: "What did Lesson 1 say happens to speed and determinism as a test needs more of the real app running?",
        },
      ],
    },
  ],
});
