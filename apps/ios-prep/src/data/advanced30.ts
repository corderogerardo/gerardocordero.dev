// Advanced batch 30 — Testing & TDD deep-dive (mid/senior). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED30_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED30_FLASHCARDS: Flashcard[] = [
  {
    id: "td1",
    category: "test",
    categoryLabel: "Testing",
    question: "What does Swift Testing look like vs XCTest?",
    answerHtml: `<p>Functions marked <code>@Test</code> (free or in a <code>@Suite</code> type, often a struct),
      assertions via the <code>#expect</code>/<code>#require</code> macros, and native async support — no
      <code>XCTestCase</code> subclass or <code>test</code>-prefixed naming.</p>
    <div class="code">import Testing

@Test func cartTotals() {
  #expect(Cart(items: [2, 3]).total == 5)
}</div>`,
    level: "mid",
  },
  {
    id: "td2",
    category: "test",
    categoryLabel: "Testing",
    question: "#expect vs #require?",
    answerHtml: `<p><code>#expect</code> records a failure but <b>continues</b> the test (good for several
      independent checks). <code>#require</code> <b>stops</b> the test if it fails — and can <b>unwrap</b>
      optionals (<code>let x = try #require(maybe)</code>) so the rest of the test has a non-optional value, like
      a guard.</p>`,
    level: "senior",
  },
  {
    id: "td3",
    category: "test",
    categoryLabel: "Testing",
    question: "What are parameterized tests?",
    answerHtml: `<p><code>@Test(arguments: [...])</code> runs the same test body across many inputs, each
      reported as a <b>separate</b> case (so you see exactly which input failed). It replaces copy-pasted tests or
      a hand-rolled loop and makes data-driven testing first-class.</p>`,
    level: "senior",
  },
  {
    id: "td4",
    category: "test",
    categoryLabel: "Testing",
    question: "What are test traits in Swift Testing?",
    answerHtml: `<p>Metadata/behavior attached to a test or suite: <code>.tags</code> (group/filter across
      files), <code>.enabled(if:)</code> / <code>.disabled("reason")</code>, <code>.timeLimit</code>, and
      <code>.bug(...)</code> to link an issue. Tags let CI run subsets (e.g. only smoke tests).</p>`,
    level: "senior",
  },
  {
    id: "td5",
    category: "test",
    categoryLabel: "Testing",
    question: "How do you test that code throws?",
    answerHtml: `<p><code>#expect(throws: MyError.self) { try doThing() }</code> (or a specific error value)
      asserts a throw; conversely <code>try thing()</code> in the test body fails the test if it unexpectedly
      throws. You can also match the thrown error's properties.</p>`,
    level: "mid",
  },
  {
    id: "td6",
    category: "test",
    categoryLabel: "Testing",
    question: "How do you test async code and callbacks?",
    answerHtml: `<p>For async/await, just mark the test <code>async</code> and <code>await</code> directly — no
      expectations needed. For callback/notification-style APIs that should fire N times, use
      <code>confirmation</code> (Swift Testing) or <code>XCTestExpectation</code> (XCTest) to wait for and count
      the events.</p>`,
    level: "senior",
  },
  {
    id: "td7",
    category: "test",
    categoryLabel: "Testing",
    question: "What is the TDD cycle?",
    answerHtml: `<p><b>Red → Green → Refactor</b>: write a <i>failing</i> test for the next small behavior,
      write the minimum code to pass it, then refactor with the test as a safety net — repeat. It drives small,
      testable units and a design shaped by how the code is used, not just how it's built.</p>`,
    level: "senior",
  },
  {
    id: "td8",
    category: "test",
    categoryLabel: "Testing",
    question: "Name the kinds of test doubles.",
    answerHtml: `<p><b>Dummy</b> (passed but unused), <b>Stub</b> (returns canned values), <b>Spy</b> (records how
      it was called), <b>Mock</b> (a spy with built-in expectations/verification), and <b>Fake</b> (a working
      lightweight implementation, e.g. an in-memory store). Pick the simplest that proves the behavior.</p>`,
    level: "senior",
  },
  {
    id: "td9",
    category: "test",
    categoryLabel: "Testing",
    question: "What makes code testable?",
    answerHtml: `<p><b>Dependency injection</b> behind protocols (no internally-constructed singletons or
      <code>URLSession.shared</code>), <b>pure functions</b> where possible, small single-purpose units, and
      logic kept out of views/controllers. If a test needs the network, the clock, or the file system to run,
      that's a design smell — inject those.</p>`,
    level: "senior",
  },
  {
    id: "td10",
    category: "test",
    categoryLabel: "Testing",
    question: "How do you mock a dependency in Swift?",
    answerHtml: `<p>Depend on a <b>protocol</b>, not a concrete type, and pass a fake/spy conforming to it in the
      test.</p>
    <div class="code">protocol APIClient { func items() async throws -&gt; [Item] }
struct MockAPI: APIClient {
  var result: [Item]
  func items() async throws -&gt; [Item] { result }
}
// model = ItemsModel(api: MockAPI(result: [.stub]))</div>
    <p>No mocking framework needed — protocols + plain structs.</p>`,
    level: "senior",
  },
  {
    id: "td11",
    category: "test",
    categoryLabel: "Testing",
    question: "What are the XCTest essentials?",
    answerHtml: `<p>An <code>XCTestCase</code> subclass with <code>test…</code> methods, <code>setUp</code>/
      <code>tearDown</code> for fixtures, the <code>XCTAssert…</code> family
      (<code>XCTAssertEqual</code>, <code>XCTAssertThrowsError</code>, <code>XCTUnwrap</code>), and
      <code>XCTestExpectation</code> for async waits. Still widely used and fully supported alongside Swift
      Testing.</p>`,
    level: "mid",
  },
  {
    id: "td12",
    category: "test",
    categoryLabel: "Testing",
    question: "How do UI tests interact with the app?",
    answerHtml: `<p>A separate process drives <code>XCUIApplication</code>, querying elements by
      <b>accessibilityIdentifier</b> (stable, non-localized) and tapping/typing. Seed deterministic state by
      passing <b>launch arguments/environment</b> the app reads on startup (e.g. a "UITEST" flag that loads
      fixtures and disables animations).</p>`,
    level: "senior",
  },
  {
    id: "td13",
    category: "test",
    categoryLabel: "Testing",
    question: "What is the Page Object pattern in UI testing?",
    answerHtml: `<p>Wrap each screen in a type that exposes its <b>elements and actions</b>
      (<code>LoginScreen().enterEmail(...).submit()</code>) instead of scattering raw queries through tests. It
      centralizes selectors, so a UI change updates one place — the main defense against brittle, unmaintainable
      UI tests.</p>`,
    level: "senior",
  },
  {
    id: "td14",
    category: "test",
    categoryLabel: "Testing",
    question: "When is snapshot testing worth it, and what's the risk?",
    answerHtml: `<p>Render a view to an image and diff against a stored reference — great for catching
      <b>unintended visual changes</b> in a design system. Risk: references are <b>brittle</b> across OS/device/
      font changes and can rubber-stamp wrong UI if updated carelessly. Scope it to key components and review
      diffs deliberately.</p>`,
    level: "senior",
  },
  {
    id: "td15",
    category: "test",
    categoryLabel: "Testing",
    question: "What causes flaky tests and how do you fix them?",
    answerHtml: `<p>Common causes: <b>timing</b> (<code>sleep</code>/race conditions — wait on conditions, not
      fixed delays), <b>shared/global state</b> across tests (isolate, reset in setUp), <b>test-order</b>
      dependence, and hitting the <b>real network/clock</b> (inject fakes). A flaky test is worse than none —
      teams stop trusting the suite. Make tests deterministic and independent.</p>`,
    level: "senior",
  },
  {
    id: "td16",
    category: "test",
    categoryLabel: "Testing",
    question: "How do performance tests and coverage fit in?",
    answerHtml: `<p>Wrap hot paths in <code>measure { }</code> (XCTest, with <code>XCTMetric</code>s for time/
      memory) to catch regressions against a baseline. Track <b>code coverage</b> as a guide to untested areas —
      not a target to game (100% coverage of trivial code proves little). Wire both into <b>CI</b> with test
      plans so they run on every PR.</p>`,
    level: "senior",
  },
];

export const ADVANCED30_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED30_QUIZ: QuizQuestion[] = [
  {
    id: "tdz1",
    category: "test",
    categoryLabel: "Testing",
    question: "In Swift Testing, the macro that stops the test and can unwrap an optional is:",
    options: ["#expect", "#require", "XCTAssert", "#available"],
    answer: 1,
    explanationHtml: `<p><code>#require</code> short-circuits on failure and can unwrap (like a guard);
      <code>#expect</code> records the failure but continues.</p>`,
  },
  {
    id: "tdz2",
    category: "test",
    categoryLabel: "Testing",
    question: "Running one test body over many inputs uses:",
    options: ["A for loop in the test", "@Test(arguments:) parameterized tests", "Multiple suites", "Snapshot tests"],
    answer: 1,
    explanationHtml: `<p>Parameterized tests report each input as a separate case, so you see exactly which one
      failed.</p>`,
  },
  {
    id: "tdz3",
    category: "test",
    categoryLabel: "Testing",
    question: "The TDD cycle is:",
    options: ["Write code, then tests, then ship", "Red → Green → Refactor", "Refactor → test → code", "Test only at the end"],
    answer: 1,
    explanationHtml: `<p>Write a failing test, make it pass minimally, then refactor with the test as a safety
      net — repeat in small steps.</p>`,
  },
  {
    id: "tdz4",
    category: "test",
    categoryLabel: "Testing",
    question: "The cleanest way to mock a dependency in Swift is:",
    options: ["A heavy mocking framework", "Depend on a protocol and inject a fake/spy struct", "Subclass and override randomly", "Use a singleton"],
    answer: 1,
    explanationHtml: `<p>Protocol + injected fake/spy needs no framework and makes the unit deterministic and
      offline.</p>`,
  },
  {
    id: "tdz5",
    category: "test",
    categoryLabel: "Testing",
    question: "UI tests should locate elements by:",
    options: ["Screen coordinates", "accessibilityIdentifier", "Localized label text", "View tag"],
    answer: 1,
    explanationHtml: `<p>Identifiers are stable and non-localized; querying by visible/localized text makes tests
      brittle across copy and locale changes.</p>`,
  },
  {
    id: "tdz6",
    category: "test",
    categoryLabel: "Testing",
    question: "A common cause of flaky tests is:",
    options: ["Too many assertions", "Fixed sleeps / shared state / real network", "Using #expect", "Small test units"],
    answer: 1,
    explanationHtml: `<p>Timing via sleeps, shared/global state, order dependence, and real I/O make tests
      nondeterministic — wait on conditions and inject fakes instead.</p>`,
  },
];

export const ADVANCED30_STUDY: StudySection[] = [
  {
    id: "st-adv-67",
    num: "82",
    title: "82 · Testing with Swift Testing & XCTest",
    html: `<p><b>What it is.</b> Two unit frameworks. <b>Swift Testing</b>: <code>@Test</code> functions in
      <code>@Suite</code>s, <code>#expect</code> (continues) vs <code>#require</code> (stops + unwraps),
      <b>parameterized</b> tests (<code>arguments:</code>), <b>traits</b> (<code>.tags</code>/<code>.disabled</code>/
      <code>.timeLimit</code>), <code>#expect(throws:)</code>, native async + <code>confirmation</code> for
      callbacks. <b>XCTest</b> (still fully supported): <code>XCTestCase</code>, <code>setUp/tearDown</code>,
      <code>XCTAssert…</code>, <code>XCTestExpectation</code>. <b>UI tests</b> drive
      <code>XCUIApplication</code>, querying by <b>accessibilityIdentifier</b> and seeding state via launch
      arguments.</p>
    <div class="callout tip"><span class="lbl">Keep UI tests sane</span> Use the Page Object pattern and disable
      animations in a UI-test launch mode so they're fast and not brittle.</div>`,
  },
  {
    id: "st-adv-68",
    num: "83",
    title: "83 · TDD, test doubles & reliable suites",
    html: `<p><b>What it is.</b> The discipline around tests. <b>TDD</b> (red → green → refactor) drives small,
      well-shaped units. Use the right <b>test double</b> — dummy/stub/spy/mock/fake — and make code testable with
      <b>DI behind protocols</b>, pure functions, and logic out of views (if a test needs the network/clock/disk,
      inject a fake). Apply the <b>pyramid</b>: many fast unit tests, fewer integration, a thin layer of UI
      tests.</p>
    <p><b>Reliability</b> is paramount: eliminate flakiness (no fixed sleeps, no shared state, no test-order
      dependence, no real I/O), track <b>coverage</b> as a guide (not a target), add <b>performance</b> baselines
      with <code>measure</code>, and run it all in <b>CI</b> via test plans.</p>
    <div class="callout warn"><span class="lbl">Trust</span> One flaky test erodes confidence in the whole suite
      — deterministic and independent beats numerous.</div>`,
  },
];
