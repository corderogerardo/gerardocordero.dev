# iOS — Testing

### Why test, and the types of tests
**They ask:** "Why do we need automated tests, and what are the main types you'd have in an iOS project?"

Tests exist to make regressions *cheap to catch* — the alternative is a human manually re-verifying every code path before every release, which doesn't scale past a handful of screens and always misses something. The real ROI is speed of change: a well-tested codebase lets you refactor with confidence because a broken assumption fails a test in seconds instead of shipping to production.

The pyramid shape matters: **unit tests** (fast, isolated, test one function/class in-process — the bulk of the suite) verify logic like a view model's state transitions or a parser. **Integration tests** verify that multiple real components work together correctly (a repository actually talking to a real Core Data stack). **UI tests** (XCUITest) drive the actual app through its interface — slowest and most brittle, so kept to critical user flows only, not exhaustive coverage.

**Say it:** "Tests trade a slow manual re-verification of every path for a fast automated one, which is what makes refactoring safe — I keep the pyramid bottom-heavy: mostly fast unit tests, fewer integration tests, and UI tests reserved for the handful of critical flows."
**Red flag:** Building a test suite that's mostly UI tests. They're slow and flaky by nature (real rendering, real timing) — push logic verification down into unit tests and keep UI tests for smoke-testing critical flows.

### Test doubles — dummy, fake, stub, spy, mock
**They ask:** "Walk through the five kinds of test doubles and give an iOS example of each."

The taxonomy matters because conflating them (calling everything "a mock") hides what a test is actually asserting. A **dummy** is a placeholder passed only to satisfy a signature — never used, e.g. an empty `User()` passed to a function that doesn't touch it in this test. A **fake** has a real, working implementation, just a lighter one — an in-memory Core Data store (`.inMemory` type) standing in for the real SQLite-backed one. A **stub** returns canned answers to calls made during the test but records nothing — a network client stubbed to always return a fixed `User`. A **spy** wraps a real or fake object and *records* what was called, so the test can assert on interaction (`XCTAssertTrue(spy.didCallFetch)`). A **mock** goes further: it's pre-programmed with expectations and fails the test itself if those expectations aren't met, verifying behavior rather than state.

```swift
final class NetworkClientSpy: NetworkClient {
    private(set) var fetchCallCount = 0
    func fetch() async -> User {
        fetchCallCount += 1
        return User.stub
    }
}
```

**Say it:** "Dummies are unused placeholders, fakes are lightweight real implementations, stubs return canned data, spies record calls for the test to assert on, and mocks pre-program expectations and fail themselves — knowing which one I'm reaching for tells the reviewer exactly what the test verifies."
**Red flag:** Calling every test double "a mock." It signals you haven't thought about whether the test is checking *state* (stub/fake) or *interaction* (spy/mock) — those need different assertions.

### XCTest, code coverage, and Quick/Nimble
**They ask:** "What does XCTest give you out of the box, how do you read code coverage, and why would a team reach for Quick/Nimble instead?"

XCTest is Apple's native framework: `XCTestCase` subclasses hold test methods (`test...` prefix), `setUp`/`tearDown` handle fixture lifecycle, and `XCTAssert*` family asserts. It also drives performance tests (`measure {}`) and UI tests (`XCUIApplication`). Xcode's built-in **code coverage** (enable per scheme) reports line/function coverage per file — useful as a *gap finder* ("this error branch is never exercised"), but a dangerous target in itself: 100% coverage with weak assertions (calling code without checking output) proves nothing.

```swift
final class PriceFormatterTests: XCTestCase {
    func test_formats_wholeNumber_withoutDecimals() {
        XCTAssertEqual(PriceFormatter.format(10), "$10")
    }
}
```

**Quick** (a BDD-style test framework layered on XCTest) and **Nimble** (its matcher library) trade XCTest's method-name-as-description (`test_formats_wholeNumber_withoutDecimals`) for nested `describe`/`context`/`it` blocks and readable matchers (`expect(result).to(equal(10))`) — genuinely more readable for deeply nested scenario coverage, at the cost of a third-party dependency and a learning curve for engineers used to plain XCTest.

**Say it:** "XCTest covers unit, performance, and UI testing natively with zero dependencies; coverage numbers are a gap-finder, not a target — I've seen 100% coverage suites with assertions that check nothing. Quick/Nimble buy more readable BDD-style specs at the cost of a dependency, which I'd reach for on a team that already values that style."
**Red flag:** Chasing a coverage percentage as the success metric. A test that calls a function without asserting its output inflates coverage while verifying nothing.

### UI testing, snapshot testing, and mock testing patterns
**They ask:** "How do UI tests and snapshot tests differ from unit tests, and where does mocking fit into all of it?"

XCUITest drives the app like a real user through the accessibility tree — tapping, typing, asserting element existence — which is the only way to catch integration bugs that only manifest in the actual rendered UI (a button that's there in the view model but unreachable behind another view). The cost is speed and flakiness: real animations, real timing, real device state, so they're reserved for critical flows (login, checkout), not every screen.

**Snapshot testing** takes a different angle: render a view, capture it as an image/data, and diff future renders against the stored reference — catching *unintended visual regressions* (a padding change that ripples somewhere unexpected) that assertion-based tests can't express well. The trade-off: snapshots need re-recording (and re-review) on every intentional UI change, and they're sensitive to environment (simulator OS version, device size) unless pinned.

```swift
func test_profileCard_matchesSnapshot() {
    let view = ProfileCard(user: .stub)
    assertSnapshot(of: view, as: .image)
}
```

Both layers lean on **mocking** at their boundary: UI tests typically launch the app with a mocked network layer (a launch argument that swaps in canned responses) so tests are deterministic and don't hit a real backend; unit tests around view models mock their dependencies (network, persistence) so the test isolates *that* layer's logic.

**Say it:** "UI tests catch integration bugs only visible in the rendered app but are slow and flaky, so I reserve them for critical flows and launch them against a mocked backend for determinism; snapshot tests catch unintended visual regressions that assertions can't express, at the cost of needing re-review on every intentional UI change."
**Red flag:** Running UI tests against a live backend. Any network flakiness or data change makes the test flaky for reasons that have nothing to do with the code under test — stub the network layer.
