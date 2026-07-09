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
    answerHtml: `<p>Swift Testing replaced XCTest's class-and-convention model with plain functions and macros,
      which cuts boilerplate and gives compile-time checked assertions instead of string-based ones. Mechanically:
      functions marked <code>@Test</code> (free or in a <code>@Suite</code> type, often a struct), assertions via
      the <code>#expect</code>/<code>#require</code> macros, and native async support — no <code>XCTestCase</code>
      subclass or <code>test</code>-prefixed naming.</p>
    <div class="code">import Testing

@Test func cartTotals() {
  #expect(Cart(items: [2, 3]).total == 5)
}</div>
    <p><b>I reach for Swift Testing on new work and keep XCTest where UI testing or existing suites need it —
      they interop in the same target.</b></p>`,
    level: "mid",
  },
  {
    id: "td2",
    category: "test",
    categoryLabel: "Testing",
    question: "#expect vs #require?",
    answerHtml: `<p>They exist for two different failure modes — whether a broken precondition should stop the
      test outright or just get logged alongside other checks. <code>#expect</code> records a failure but
      <b>continues</b> the test (good for several independent checks). <code>#require</code> <b>stops</b> the
      test if it fails — and can <b>unwrap</b> optionals (<code>let x = try #require(maybe)</code>) so the rest
      of the test has a non-optional value, like a guard.</p>
      <p>Red flag: using <code>#expect</code> to unwrap a setup value — if it's nil, every later assertion in
      that test fails too and buries the real error. <b>I use #require for setup/preconditions and #expect for
      the actual behavior checks.</b></p>`,
    level: "senior",
  },
  {
    id: "td3",
    category: "test",
    categoryLabel: "Testing",
    question: "What are parameterized tests?",
    answerHtml: `<p>They exist because copy-pasted tests and hand-rolled loops both hide which input actually
      failed — a loop's failure just points at one assertion, not the input that triggered it.
      <code>@Test(arguments: [...])</code> runs the same test body across many inputs, each reported as a
      <b>separate</b> case, so the failing input is visible directly in the test report.</p>
      <p><b>Parameterized tests turn a table of edge cases into first-class, individually-reported test
      results.</b></p>`,
    level: "senior",
  },
  {
    id: "td4",
    category: "test",
    categoryLabel: "Testing",
    question: "What are test traits in Swift Testing?",
    answerHtml: `<p>Traits let CI and reviewers reason about tests without reading every body — they encode
      intent (why this is skipped, how it's grouped, how long it should take) as metadata instead of comments.
      Mechanically: <code>.tags</code> (group/filter across files), <code>.enabled(if:)</code> /
      <code>.disabled("reason")</code>, <code>.timeLimit</code>, and <code>.bug(...)</code> to link an issue.</p>
      <p><b>I tag tests by cost — smoke vs full suite — so CI can run the fast subset on every push and the full
      suite less often.</b></p>`,
    level: "senior",
  },
  {
    id: "td5",
    category: "test",
    categoryLabel: "Testing",
    question: "How do you test that code throws?",
    answerHtml: `<p>Error paths are often the least-tested code in a codebase, so an explicit assertion for
      "this must throw" matters as much as one for the happy path. <code>#expect(throws: MyError.self) { try
      doThing() }</code> (or a specific error value) asserts a throw; conversely <code>try thing()</code> in the
      test body fails the test if it unexpectedly throws. You can also match the thrown error's properties.</p>
      <p><b>I assert both directions — that the failure path throws the right error, and that the success path
      doesn't throw at all.</b></p>`,
    level: "mid",
  },
  {
    id: "td6",
    category: "test",
    categoryLabel: "Testing",
    question: "How do you test async code and callbacks?",
    answerHtml: `<p>Concurrency needs different tools depending on whether it's structured (async/await) or
      not (callbacks) — treating both the same way is what produces flaky, sleep-based tests. For async/await,
      just mark the test <code>async</code> and <code>await</code> directly — no expectations needed. For
      callback/notification-style APIs that should fire N times, use <code>confirmation</code> (Swift Testing) or
      <code>XCTestExpectation</code> (XCTest) to wait for and count the events.</p>
      <p>Red flag: reaching for <code>sleep()</code> to "wait for" an async callback — it's slow and still races.
      <b>I let async/await tests suspend naturally and use confirmation/expectation for anything callback-based.</b></p>`,
    level: "senior",
  },
  {
    id: "td7",
    category: "test",
    categoryLabel: "Testing",
    question: "What is the TDD cycle?",
    answerHtml: `<p>TDD's value isn't "tests exist" — it's that writing the test first forces the API to be
      designed from the caller's point of view, before implementation details bias it. The cycle: <b>1. Red</b> —
      write a <i>failing</i> test for the next small behavior. <b>2. Green</b> — write the minimum code to pass
      it. <b>3. Refactor</b> — clean up with the test as a safety net. Repeat.</p>
      <p><b>TDD gives me a design shaped by how the code is used, not just how it's built, and a regression net
      for free as I go.</b></p>`,
    level: "senior",
  },
  {
    id: "td8",
    category: "test",
    categoryLabel: "Testing",
    question: "Name the kinds of test doubles.",
    answerHtml: `<p>The names matter because reaching for a heavier double than the test needs adds coupling
      and maintenance cost without adding confidence. <b>Dummy</b> (passed but unused), <b>Stub</b> (returns
      canned values), <b>Spy</b> (records how it was called), <b>Mock</b> (a spy with built-in
      expectations/verification), and <b>Fake</b> (a working lightweight implementation, e.g. an in-memory
      store).</p>
      <p><b>I default to the simplest double that proves the behavior — usually a stub or fake — and only reach
      for a mock when I actually need to verify interaction, not just outcome.</b></p>`,
    level: "senior",
  },
  {
    id: "td9",
    category: "test",
    categoryLabel: "Testing",
    question: "What makes code testable?",
    answerHtml: `<p>Testability isn't a testing concern — it's an architecture concern, because untestable
      code is code with hidden, hard-wired dependencies. The fix is <b>dependency injection</b> behind protocols
      (no internally-constructed singletons or <code>URLSession.shared</code>), <b>pure functions</b> where
      possible, small single-purpose units, and logic kept out of views/controllers.</p>
      <p>Red flag: "I'll add tests later, it's faster to hard-code the dependency now." <b>If a test needs the
      network, the clock, or the file system to run, that's a design smell — inject those instead of skipping the
      test.</b></p>`,
    level: "senior",
  },
  {
    id: "td10",
    category: "test",
    categoryLabel: "Testing",
    question: "How do you mock a dependency in Swift?",
    answerHtml: `<p>Swift's protocol-oriented design means you don't need a mocking framework to get test
      doubles — depend on a <b>protocol</b>, not a concrete type, and pass a fake/spy conforming to it in the
      test.</p>
    <div class="code">protocol APIClient { func items() async throws -&gt; [Item] }
struct MockAPI: APIClient {
  var result: [Item]
  func items() async throws -&gt; [Item] { result }
}
// model = ItemsModel(api: MockAPI(result: [.stub]))</div>
    <p><b>I mock with a plain struct conforming to the same protocol as production — no mocking library, no
      runtime magic, and it's checked by the compiler.</b></p>`,
    level: "senior",
  },
  {
    id: "td11",
    category: "test",
    categoryLabel: "Testing",
    question: "What are the XCTest essentials?",
    answerHtml: `<p>XCTest is still the framework UI testing and most legacy suites run on, so knowing it stays
      relevant even as Swift Testing takes new work. Essentials: an <code>XCTestCase</code> subclass with
      <code>test…</code> methods, <code>setUp</code>/<code>tearDown</code> for fixtures, the
      <code>XCTAssert…</code> family (<code>XCTAssertEqual</code>, <code>XCTAssertThrowsError</code>,
      <code>XCTUnwrap</code>), and <code>XCTestExpectation</code> for async waits.</p>
      <p><b>Both frameworks coexist in the same target, so I don't need to migrate an existing suite just to
      start writing new tests in Swift Testing.</b></p>`,
    level: "mid",
  },
  {
    id: "td12",
    category: "test",
    categoryLabel: "Testing",
    question: "How do UI tests interact with the app?",
    answerHtml: `<p>UI tests run in a separate process from the app, which is exactly why they need a stable
      contract to find elements instead of reaching into app internals. A separate process drives
      <code>XCUIApplication</code>, querying elements by <b>accessibilityIdentifier</b> (stable, non-localized)
      and tapping/typing. Seed deterministic state by passing <b>launch arguments/environment</b> the app reads
      on startup (e.g. a "UITEST" flag that loads fixtures and disables animations).</p>
      <p>Red flag: querying by visible label text — it breaks the moment copy or locale changes.
      <b>I query by accessibilityIdentifier and seed fixtures via launch arguments so the test doesn't depend on
      real network state.</b></p>`,
    level: "senior",
  },
  {
    id: "td13",
    category: "test",
    categoryLabel: "Testing",
    question: "What is the Page Object pattern in UI testing?",
    answerHtml: `<p>Scattering raw element queries across dozens of UI tests means one UI change breaks dozens
      of tests in dozens of places — the Page Object pattern exists to make that a one-line fix instead. Wrap
      each screen in a type that exposes its <b>elements and actions</b>
      (<code>LoginScreen().enterEmail(...).submit()</code>) instead of scattering raw queries through tests.</p>
      <p><b>Page objects centralize selectors so a UI change updates one place — it's the main defense against
      brittle UI test suites.</b></p>`,
    level: "senior",
  },
  {
    id: "td14",
    category: "test",
    categoryLabel: "Testing",
    question: "When is snapshot testing worth it, and what's the risk?",
    answerHtml: `<p>Snapshot testing trades logical assertions for pixel comparison, which catches a whole
      class of regressions unit tests can't — but only if the team treats reference updates as seriously as code
      review. Render a view to an image and diff against a stored reference — great for catching <b>unintended
      visual changes</b> in a design system.</p>
      <p>Red flag: routinely re-recording snapshots on CI failure without looking at the diff — that turns the
      suite into a rubber stamp. <b>I scope snapshots to key design-system components and treat every reference
      update as a reviewed change, since references are brittle across OS/device/font changes.</b></p>`,
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
    answerHtml: `<p>Both exist to catch regressions humans won't notice in review — a performance baseline
      slipping 20% or a whole code path silently losing coverage. Wrap hot paths in <code>measure { }</code>
      (XCTest, with <code>XCTMetric</code>s for time/memory) to catch regressions against a baseline. Track
      <b>code coverage</b> as a guide to untested areas — not a target to game (100% coverage of trivial code
      proves little).</p>
      <p>Red flag: chasing a coverage percentage instead of asking which untested paths carry risk.
      <b>I wire both into CI via test plans so they run on every PR, and use coverage as a map, not a
      scoreboard.</b></p>`,
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
    explanationHtml: `<p><code>#require</code> short-circuits on failure and can unwrap (like a guard). The
      tempting wrong pick, <code>#expect</code>, records the failure but continues — useful for independent
      checks, but it won't stop the test or give you a non-optional value to keep working with.</p>`,
  },
  {
    id: "tdz2",
    category: "test",
    categoryLabel: "Testing",
    question: "Running one test body over many inputs uses:",
    options: ["A for loop in the test", "@Test(arguments:) parameterized tests", "Multiple suites", "Snapshot tests"],
    answer: 1,
    explanationHtml: `<p>Parameterized tests report each input as a separate case, so you see exactly which one
      failed. A for loop in the test body is the tempting shortcut, but a failure inside it just points at one
      assertion line — you lose which input actually triggered it.</p>`,
  },
  {
    id: "tdz3",
    category: "test",
    categoryLabel: "Testing",
    question: "The TDD cycle is:",
    options: ["Write code, then tests, then ship", "Red → Green → Refactor", "Refactor → test → code", "Test only at the end"],
    answer: 1,
    explanationHtml: `<p>Write a failing test, make it pass minimally, then refactor with the test as a safety
      net — repeat in small steps. Writing code first and tests after (the tempting order) means the test just
      confirms what the code already does, not what it should do — it can't shape the design.</p>`,
  },
  {
    id: "tdz4",
    category: "test",
    categoryLabel: "Testing",
    question: "The cleanest way to mock a dependency in Swift is:",
    options: ["A heavy mocking framework", "Depend on a protocol and inject a fake/spy struct", "Subclass and override randomly", "Use a singleton"],
    answer: 1,
    explanationHtml: `<p>Protocol + injected fake/spy needs no framework and makes the unit deterministic and
      offline. A heavy mocking framework is tempting for its convenience methods, but it adds a dependency and
      runtime indirection for something Swift's type system already solves at compile time.</p>`,
  },
  {
    id: "tdz5",
    category: "test",
    categoryLabel: "Testing",
    question: "UI tests should locate elements by:",
    options: ["Screen coordinates", "accessibilityIdentifier", "Localized label text", "View tag"],
    answer: 1,
    explanationHtml: `<p>Identifiers are stable and non-localized; querying by visible/localized text — the
      tempting choice because it reads naturally — makes tests brittle the moment copy or locale changes.</p>`,
  },
  {
    id: "tdz6",
    category: "test",
    categoryLabel: "Testing",
    question: "A common cause of flaky tests is:",
    options: ["Too many assertions", "Fixed sleeps / shared state / real network", "Using #expect", "Small test units"],
    answer: 1,
    explanationHtml: `<p>Timing via sleeps, shared/global state, order dependence, and real I/O make tests
      nondeterministic — wait on conditions and inject fakes instead. "Too many assertions" is a red herring: a
      test with many correct, independent assertions is fine; it's shared mutable state or timing that actually
      causes flakiness.</p>`,
  },
];

export const ADVANCED30_STUDY: StudySection[] = [
  {
    id: "st-adv-67",
    num: "82",
    title: "82 · Testing with Swift Testing & XCTest",
    html: `<p><b>Why it matters.</b> The framework choice affects how much boilerplate and false-positive
      flakiness your suite carries — modern macro-based assertions and native async support remove entire
      classes of test bugs that string-based XCTest assertions and expectation dances used to hide.</p>
      <p><b>Swift Testing</b>: <code>@Test</code> functions in <code>@Suite</code>s, <code>#expect</code>
      (continues) vs <code>#require</code> (stops + unwraps), <b>parameterized</b> tests
      (<code>arguments:</code>), <b>traits</b> (<code>.tags</code>/<code>.disabled</code>/<code>.timeLimit</code>),
      <code>#expect(throws:)</code>, native async + <code>confirmation</code> for callbacks. <b>XCTest</b> (still
      fully supported, and required for UI testing): <code>XCTestCase</code>, <code>setUp/tearDown</code>,
      <code>XCTAssert…</code>, <code>XCTestExpectation</code>. <b>UI tests</b> drive
      <code>XCUIApplication</code>, querying by <b>accessibilityIdentifier</b> and seeding state via launch
      arguments.</p>
    <div class="callout tip"><span class="lbl">Say this</span> "I write unit tests in Swift Testing and keep UI
      tests on XCTest's XCUIApplication — they interop in the same target, so there's no migration tax." Use the
      Page Object pattern and disable animations in a UI-test launch mode so UI tests stay fast and not
      brittle.</div>`,
  },
  {
    id: "st-adv-68",
    num: "83",
    title: "83 · TDD, test doubles & reliable suites",
    html: `<p><b>Why it matters.</b> Tests only pay off if the team trusts them — a suite full of flaky,
      slow, or over-mocked tests gets ignored or deleted, which is worse than not having tests at all.</p>
      <p><b>1. Design for testability first.</b> <b>DI behind protocols</b>, pure functions, and logic kept out
      of views — if a test needs the network/clock/disk, inject a fake instead. <b>2. Drive with TDD</b>
      (red → green → refactor) to keep units small and shaped by their callers. <b>3. Pick the right test
      double</b> — dummy/stub/spy/mock/fake — the simplest one that proves the behavior. <b>4. Shape the suite as
      a pyramid</b>: many fast unit tests, fewer integration, a thin layer of UI tests.</p>
    <p><b>Reliability</b> is paramount: eliminate flakiness (no fixed sleeps, no shared state, no test-order
      dependence, no real I/O), track <b>coverage</b> as a guide (not a target), add <b>performance</b> baselines
      with <code>measure</code>, and run it all in <b>CI</b> via test plans.</p>
    <div class="callout warn"><span class="lbl">Say this</span> "One flaky test erodes trust in the whole suite —
      I treat flakiness as a bug in isolation, not something to retry past. Deterministic and independent beats
      numerous."</div>`,
  },
];
