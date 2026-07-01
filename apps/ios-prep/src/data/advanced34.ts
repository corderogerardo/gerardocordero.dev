// Advanced batch 34 — More GoF patterns in Swift, Clean Architecture + SwiftUI, and
// learning from real open-source codebases & curated resource lists. Merged via all.ts.
// Sources: ochococo/Design-Patterns-In-Swift, nalexn/clean-architecture-swiftui,
// vsouza/awesome-ios, eleev/ios-learning-materials, dkhamsing/open-source-ios-apps
// (see docs/study-resources.md).
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED34_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED34_FLASHCARDS: Flashcard[] = [
  {
    id: "gof1",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What problem does the Command pattern solve, and where does it show up in iOS?",
    answerHtml: `<p>Command turns a <b>request into an object</b> — decoupling the invoker from the receiver and
      letting you queue, log, or undo it. iOS examples: <code>UndoManager</code> registers command-like
      closures/selectors to reverse an action; a background task queue where each task is a serializable
      command object; <code>UIAction</code> bundles a title and handler as one first-class value passed
      around independently of the button that triggers it.</p>`,
    level: "senior",
  },
  {
    id: "gof2",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What is the Chain of Responsibility pattern, and what's an iOS-native example?",
    answerHtml: `<p>A request passes along a chain of handlers until one handles it, without the sender knowing
      which one will. <b>UIKit's responder chain</b> (<code>UIResponder</code> → next responder) is the
      canonical example: an unhandled touch or keyboard event walks from view to view controller to window to
      app. You can build your own — e.g. a chain of form validators that each either fix/reject an input or
      pass it to the next.</p>`,
    level: "mid",
  },
  {
    id: "gof3",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What does the Memento pattern do, and how do Swift value types make it nearly free?",
    answerHtml: `<p>Memento captures an object's internal state so it can be <b>restored later without breaking
      encapsulation</b> — e.g. an undo stack of snapshots. In Swift, a <code>struct</code> conforming to
      <code>Codable</code>/<code>Equatable</code> already <i>is</i> a memento: copying a value type into an
      array is a full, safe snapshot with no custom save/restore API needed, unlike reference types where
      you'd have to deep-copy explicitly.</p>`,
    level: "mid",
  },
  {
    id: "gof4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What is the Template Method pattern, and where do XCTest and UIViewController use it?",
    answerHtml: `<p>A base type defines the <b>skeleton of an algorithm</b> and defers specific steps to
      overrides. <code>XCTestCase</code>'s <code>setUp()</code>/<code>tearDown()</code> around each test
      method, and <code>UIViewController</code>'s <code>viewDidLoad</code>/<code>viewWillAppear</code>/
      <code>viewDidAppear</code> sequence, are both template methods — the framework calls the steps in a
      fixed order and you fill in the pieces that vary.</p>`,
    level: "mid",
  },
  {
    id: "gof5",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How is the Iterator pattern already built into Swift, and what does conforming to it buy you?",
    answerHtml: `<p><code>Sequence</code> + <code>IteratorProtocol</code> <i>are</i> the Iterator pattern,
      standardized: implement <code>next() -&gt; Element?</code> and you get <code>for-in</code>,
      <code>map</code>, <code>filter</code>, and every other sequence algorithm for free. It decouples
      traversal from a collection's internal storage — a linked list, a lazily-computed sequence, and an
      array can all be iterated identically by client code.</p>`,
    level: "mid",
  },
  {
    id: "gof6",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's the Mediator pattern, and how does it differ from wiring child view controllers directly?",
    answerHtml: `<p>Mediator centralizes communication between a set of objects behind one coordinating object,
      so they don't hold references to each other. A parent coordinator that listens to child view
      controllers' callbacks and decides what happens next — rather than child A holding a reference to child
      B and calling it directly — is a mediator: it keeps children reusable and testable in isolation, at the
      cost of concentrating logic in the mediator.</p>`,
    level: "senior",
  },
  {
    id: "gof7",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's the Proxy pattern, and give an iOS example that isn't NSProxy.",
    answerHtml: `<p>Proxy provides a <b>stand-in</b> that controls access to a real object — adding caching,
      lazy loading, access control, or logging transparently. A repository that wraps a network client behind
      the same protocol, serving cached responses when fresh and only hitting the network when stale, is a
      proxy: callers depend on the protocol and can't tell which implementation they're talking to.</p>`,
    level: "senior",
  },
  {
    id: "gof8",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's the Composite pattern, and where does SwiftUI use it structurally?",
    answerHtml: `<p>Composite lets you treat a single object and a <b>tree of objects uniformly</b> through a
      shared interface. SwiftUI's <code>View</code> protocol is composite by design: a leaf view
      (<code>Text</code>) and a container built from many views (a whole screen) both conform to
      <code>View</code> and compose the same way — a parent's <code>body</code> doesn't need to know whether
      a child is a leaf or a deep subtree.</p>`,
    level: "mid",
  },
  {
    id: "gof9",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's the Prototype pattern, and why do Swift structs make it almost invisible?",
    answerHtml: `<p>Prototype creates new objects by <b>cloning an existing instance</b> rather than
      constructing from scratch — useful when construction is expensive or config-heavy. Swift structs get
      this for free via copy-on-write: <code>var b = a</code> clones <code>a</code>'s state cheaply, and
      mutating <code>b</code> only triggers a real copy on write. For reference types you'd implement
      <code>NSCopying</code> or a manual <code>copy()</code> method to get the same effect.</p>`,
    level: "mid",
  },
  {
    id: "gof10",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's the Visitor pattern, and when would you reach for it over a switch on an enum?",
    answerHtml: `<p>Visitor separates an <b>algorithm from the object structure</b> it operates on, letting
      you add new operations without touching the element types. In Swift, a <code>switch</code> over an
      <code>enum</code> with associated values is usually simpler and gets exhaustiveness checking for free —
      reach for a true visitor (a protocol with one <code>visit(_:)</code> method per concrete type) mainly
      when walking a heterogeneous <b>class hierarchy</b> you don't own (e.g. a third-party AST/DOM) and need
      type-safe dispatch without <code>as?</code> casts everywhere.</p>`,
    level: "architect",
  },
  {
    id: "ca1",
    category: "arch",
    categoryLabel: "Architecture",
    question: "In Clean Architecture applied to SwiftUI, what are the three layers and which way does the dependency rule point?",
    answerHtml: `<p><b>Presentation</b> (SwiftUI views + view state) → <b>Domain</b> (<code>Interactor</code>s
      encoding use-cases) → <b>Data</b> (repositories over network/disk). The <b>dependency rule</b> points
      inward only: Presentation depends on Domain, Domain depends on abstractions the Data layer implements —
      an inner layer never imports or knows about an outer one, so the domain logic is testable and portable
      without SwiftUI or a real network stack.</p>`,
    level: "senior",
  },
  {
    id: "ca2",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How does an Interactor differ from a typical MVVM ViewModel?",
    answerHtml: `<p>A ViewModel usually <b>owns</b> its screen's state (<code>@Published</code> properties)
      and its view binds directly to it. An <b>Interactor</b> is stateless — it receives the shared
      <code>AppState</code> (or a repository) as a parameter, performs one use-case, and writes the result
      back into that shared state; views then read their own slice independently. This trades a 1:1
      view/state coupling for a shared-state model that many views can read consistently.</p>`,
    level: "senior",
  },
  {
    id: "ca3",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Why does this architecture centralize everything in a single AppState struct instead of per-screen state objects?",
    answerHtml: `<p>A single <code>AppState</code> gives the app <b>one source of truth</b> — any screen can
      read the same slice of data (e.g. the signed-in user, a countries list) without duplicating a fetch or
      risking two screens disagreeing. It also makes the whole app's state <b>serializable and diffable</b>
      for debugging (print/log a snapshot, drive tests) at the cost of every observer needing to scope its
      reads carefully to avoid over-rendering.</p>`,
    level: "senior",
  },
  {
    id: "ca4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What is a DIContainer in this pattern, and why inject it through the SwiftUI Environment instead of a global singleton?",
    answerHtml: `<p>A <code>DIContainer</code> bundles the app's live dependencies (repositories,
      interactors) behind protocols, built once at launch. Injecting it via a custom
      <code>EnvironmentKey</code> rather than a global singleton means <b>previews and tests can substitute a
      container of mocks</b> for a subtree of the view hierarchy without touching global state — SwiftUI's
      environment is scoped and overridable per-view, a singleton isn't.</p>`,
    level: "senior",
  },
  {
    id: "ca5",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you unit test an Interactor without hitting the network?",
    answerHtml: `<p>Depend on a <b>repository protocol</b>, not a concrete network client. In the test, inject
      a mock conforming to that protocol that returns canned data (or throws), call the interactor's method,
      and assert on the resulting <code>AppState</code> mutation — no <code>URLSession</code>, no server, and
      the test runs in milliseconds. The same seam lets Xcode Previews inject an always-succeeding or
      always-loading mock to preview every state without live data.</p>`,
    level: "mid",
  },
  {
    id: "ca6",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Why might you still reach for Combine publishers (or an AsyncStream) in the domain layer even in a codebase that's otherwise fully async/await?",
    answerHtml: `<p>A single <code>async</code> function returns <b>once</b>; a lot of domain state is
      inherently a <b>stream of updates over time</b> (a live search's results, a websocket feed, a value
      multiple sources write to). Combine/<code>AsyncStream</code> model "zero or more values over time"
      directly, and compose with operators (debounce, combineLatest) that a single <code>await</code> call
      can't express — async/await is the right tool for one-shot work, streams for ongoing state.</p>`,
    level: "architect",
  },
  {
    id: "ca7",
    category: "arch",
    categoryLabel: "Architecture",
    question: "A global AppState causes every observing view to redraw on any mutation. How do you scope reads to avoid that?",
    answerHtml: `<p>Don't bind a view directly to the whole <code>AppState</code>; derive an
      <b>Equatable slice</b> (a small struct or tuple pulled from just the fields that screen needs) and only
      re-render when that slice changes — SwiftUI's diffing then skips the view when unrelated state changes.
      In practice: a small per-screen view model that projects <code>AppState</code> down to its own
      <code>@Published</code> value, or a <code>Binding</code> created with a getter/setter scoped to one
      sub-tree of the state.</p>`,
    level: "senior",
  },
  {
    id: "ca8",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's the real trade-off of adopting full Clean Architecture ceremony versus a simpler MVVM app?",
    answerHtml: `<p>The ceremony (a protocol + interactor + DI entry for every repository) buys
      <b>testability, replaceable layers, and consistency</b> across many contributors — valuable once an app
      has several teams and a real test suite. For a small app or a two-person team it's usually <b>more
      indirection than the problem needs</b>: extra protocols with one implementation, and a DI graph to
      maintain for dependencies that never actually get swapped. Add the layer when a second implementation
      or a test genuinely needs it, not up front.</p>`,
    level: "architect",
  },
  {
    id: "os1",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Before adding a third-party Swift package, what should you check beyond 'does it work'?",
    answerHtml: `<p>Its own <code>Package.swift</code> dependency footprint (does it drag in a large
      sub-graph?), <b>maintenance signal</b> (recent commits/releases vs. abandoned), <b>license</b>
      compatibility, whether its public API is <code>Sendable</code>/concurrency-checked for Swift 6 strict
      mode, and its binary/asset size impact on your app. A one-file utility you could write in an afternoon
      rarely justifies a dependency; a well-maintained networking or crash-reporting SDK usually does.</p>`,
    level: "mid",
  },
  {
    id: "os2",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's a fast way to understand a large unfamiliar iOS codebase's architecture without reading every file top to bottom?",
    answerHtml: `<p>Start at the <b>README</b> and the app's entry point (<code>@main</code> struct or
      <code>AppDelegate</code>), skim the <b>top-level folder structure</b> for the module boundaries the
      team chose, find the <b>composition root</b> (where dependencies get wired together) to see how the
      big pieces connect, and open the <b>tests</b> — they're often the most honest, up-to-date description
      of what the app's boundaries and edge cases actually are.</p>`,
    level: "mid",
  },
  {
    id: "os3",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How can an open-source app's git history teach you more than its current-state code alone?",
    answerHtml: `<p><code>git log --follow</code> on a core file (or browsing merged PRs) shows <b>why</b> an
      architecture changed — a migration from Core Data to SwiftData, or MVC to MVVM — including the
      trade-offs discussed in review, which the final code alone doesn't capture. Reading a decision's
      history is often more instructive than reading its current shape, especially for the "why not the
      alternative" reasoning interviews probe for.</p>`,
    level: "senior",
  },
  {
    id: "os4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Why should your portfolio project's architecture match the seniority level you're interviewing for, rather than showcasing the fanciest pattern you know?",
    answerHtml: `<p>An interviewer reads architectural choices as a proxy for judgment: wrapping a
      five-screen app in full Clean Architecture plus a custom DI container reads as <b>over-engineering</b>
      for that scale, the same way a large, multi-team app done in ad-hoc MVC reads as under-engineered.
      Match ceremony to actual complexity, and be ready to explain the trade-off you made — that's the senior
      signal, not the pattern name itself.</p>`,
    level: "senior",
  },
  {
    id: "os5",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's the interview value of having contributed even a small PR to an open-source iOS project?",
    answerHtml: `<p>It's evidence of working inside <b>someone else's conventions and review process</b> —
      following a CONTRIBUTING guide, passing CI, responding to review feedback on a codebase you don't
      control. That's a closer proxy for team collaboration than a solo portfolio app, and gives you a
      concrete, verifiable story ("I fixed X in library Y, here's the PR") instead of a generic "I'm a team
      player" claim.</p>`,
    level: "mid",
  },
  {
    id: "os6",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Curated lists like awesome-ios exist for hundreds of topics. What's the right way to use one when prepping for an interview, versus how it's easy to misuse it?",
    answerHtml: `<p>Use it as a <b>map</b> to find 2-3 unfamiliar-but-relevant topics or libraries worth going
      deep on — then actually read source/docs for those — not as a checklist to skim every linked repo's
      README. Breadth without depth reads as buzzword familiarity in an interview; being able to explain
      <i>why</i> you'd reach for one specific tool, with a trade-off, beats naming ten you've only
      skimmed.</p>`,
    level: "mid",
  },
];

export const ADVANCED34_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED34_QUIZ: QuizQuestion[] = [
  {
    id: "gofz1",
    category: "arch",
    categoryLabel: "Architecture",
    question: "UIKit's responder chain, where an unhandled touch event walks from view → view controller → window → app, is an example of which pattern?",
    options: ["Command", "Chain of Responsibility", "Mediator", "Visitor"],
    answer: 1,
    explanationHtml: `<p>Each responder gets a chance to handle the event and, if it can't, passes it to the
      next responder — the defining shape of Chain of Responsibility.</p>`,
  },
  {
    id: "gofz2",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Why do Swift value types make the Memento pattern nearly free compared to reference types?",
    options: ["Structs can't be mutated", "Copying a struct is already a safe, independent snapshot; no deep-copy code is needed", "Memento requires classes", "Swift has no undo support"],
    answer: 1,
    explanationHtml: `<p>Copying a value type gives you an independent snapshot automatically (copy-on-write)
      — with a reference type you'd need to hand-write a deep copy to avoid the "snapshot" aliasing the live
      object.</p>`,
  },
  {
    id: "gofz3",
    category: "arch",
    categoryLabel: "Architecture",
    question: "XCTestCase's setUp() → test → tearDown() sequence, where the framework calls a fixed order of steps and you fill in the pieces, is the:",
    options: ["Strategy pattern", "Template Method pattern", "Observer pattern", "Proxy pattern"],
    answer: 1,
    explanationHtml: `<p>The base class defines the algorithm's skeleton (fixed call order) and defers the
      variable steps to overrides — that's Template Method.</p>`,
  },
  {
    id: "gofz4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "A repository that serves cached responses when fresh and only calls the network when stale, all behind the same protocol callers already use, is best described as a:",
    options: ["Factory", "Proxy", "Composite", "Command"],
    answer: 1,
    explanationHtml: `<p>It's a stand-in that transparently controls access to the real network client —
      adding caching without callers knowing which implementation they're talking to. That's Proxy.</p>`,
  },
  {
    id: "gofz5",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Reaching for a full Visitor pattern instead of switch-on-enum makes the most sense when:",
    options: ["The enum has few cases", "You're walking a class hierarchy you don't own and need type-safe dispatch without casts", "You want less code", "Swift enums can't be exhaustively switched"],
    answer: 1,
    explanationHtml: `<p>A switch over an owned enum with associated values is simpler and
      exhaustiveness-checked. Visitor earns its ceremony for heterogeneous class hierarchies (e.g. a
      third-party AST) where you can't add a switch-friendly enum.</p>`,
  },
  {
    id: "caz1",
    category: "arch",
    categoryLabel: "Architecture",
    question: "In Clean Architecture applied to SwiftUI, the dependency rule means:",
    options: ["The Data layer can import SwiftUI views directly", "Outer layers (Presentation) depend on inner layers (Domain), never the reverse", "All layers depend on each other equally", "Interactors depend on concrete network types"],
    answer: 1,
    explanationHtml: `<p>Dependencies only point inward — Presentation depends on Domain, Domain depends on
      abstractions the Data layer fulfills — so the domain logic never imports SwiftUI or a concrete network
      stack.</p>`,
  },
  {
    id: "caz2",
    category: "arch",
    categoryLabel: "Architecture",
    question: "The key difference between an Interactor and a typical MVVM ViewModel is:",
    options: ["Interactors are faster", "An Interactor is stateless and writes results into shared AppState rather than owning its own @Published state", "ViewModels can't call repositories", "Interactors only run on a background thread"],
    answer: 1,
    explanationHtml: `<p>A ViewModel typically owns its screen's published state 1:1 with its view; an
      Interactor is a stateless use-case that mutates a shared AppState which multiple views can then read
      from.</p>`,
  },
  {
    id: "caz3",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Injecting a DIContainer via the SwiftUI Environment instead of a global singleton mainly buys you:",
    options: ["Faster app launch", "The ability to substitute mock dependencies for a scoped subtree in previews and tests", "Automatic Codable conformance", "Smaller binary size"],
    answer: 1,
    explanationHtml: `<p>The environment is scoped and overridable per-view-subtree, so previews and tests
      can swap in a container of mocks without touching global state — a singleton can't be scoped that
      way.</p>`,
  },
  {
    id: "caz4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "The main trade-off of full Clean Architecture ceremony (a protocol + interactor + DI entry for every repository) is:",
    options: ["It's always strictly better regardless of app size", "It buys testability/consistency at large scale but is often more indirection than a small app needs", "It removes the need for any tests", "It's required by Apple for App Store approval"],
    answer: 1,
    explanationHtml: `<p>The ceremony pays off with many contributors and a real test suite; for a small app,
      protocols with a single implementation and an unused DI graph are usually just overhead — add the layer
      when a second implementation or a test needs it.</p>`,
  },
  {
    id: "osz1",
    category: "arch",
    categoryLabel: "Architecture",
    question: "The fastest way to understand a large unfamiliar codebase's architecture is to:",
    options: ["Read every file in alphabetical order", "Start at the README, entry point, folder structure, composition root, and tests", "Only read the view controllers", "Search for TODO comments"],
    answer: 1,
    explanationHtml: `<p>The README, entry point, top-level structure, composition root, and tests together
      give you the architecture and real edge cases far faster than a linear top-to-bottom read.</p>`,
  },
  {
    id: "osz2",
    category: "arch",
    categoryLabel: "Architecture",
    question: "A five-screen portfolio app wrapped in full Clean Architecture with a custom DI container most likely signals to an interviewer:",
    options: ["Senior-level architectural judgment", "Over-engineering relative to the app's actual complexity", "Strong SwiftUI performance skills", "Nothing — architecture choice is never evaluated"],
    answer: 1,
    explanationHtml: `<p>Ceremony should match complexity. Ceremony far beyond what a small app needs reads
      as not knowing when to stop, the same way ad-hoc MVC on a large multi-team app reads as
      under-engineered.</p>`,
  },
  {
    id: "osz3",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Before adding a third-party SPM package, the most important non-functional check is:",
    options: ["Its total download count", "Maintenance signal (recent commits/releases), license, and concurrency-readiness", "Whether it has a logo", "Whether it's written entirely in Swift"],
    answer: 1,
    explanationHtml: `<p>Whether a dependency is actively maintained, licensed compatibly, and
      Sendable/concurrency-checked matters far more long-term than superficial signals like popularity or
      branding.</p>`,
  },
];

export const ADVANCED34_STUDY: StudySection[] = [
  {
    id: "st-adv-75",
    num: "90",
    title: "90 · More GoF patterns in Swift: Command, Chain of Responsibility & friends",
    html: `<p><b>What it is.</b> Topics 72/73 covered the iOS-native patterns you use daily — delegate,
      observer, singleton, DI, factory, builder, coordinator, repository, strategy, adapter, facade,
      decorator, and state. This section rounds out the rest of the classic Gang-of-Four catalog (see
      <a href="https://github.com/ochococo/Design-Patterns-In-Swift">ochococo/Design-Patterns-In-Swift</a> for
      a full Swift implementation of all 23): <b>Command</b> (a request as an object — undo, queued work),
      <b>Chain of Responsibility</b> (UIKit's own responder chain), <b>Memento</b> (state snapshots — nearly
      free with Swift value types), <b>Template Method</b> (<code>XCTestCase</code>,
      <code>UIViewController</code> lifecycle), <b>Iterator</b> (<code>Sequence</code>/
      <code>IteratorProtocol</code>), <b>Mediator</b> (a coordinator centralizing child communication),
      <b>Proxy</b> (a caching stand-in behind the same protocol), <b>Composite</b> (SwiftUI's
      <code>View</code> tree), <b>Prototype</b> (copy-on-write cloning), and <b>Visitor</b> (type-safe
      dispatch over a class hierarchy you don't own).</p>
    <div class="code">// Command: an undo-able action as a first-class value
protocol Command {
  func execute()
  func undo()
}

struct RenameCommand: Command {
  let item: Item
  let oldName: String
  let newName: String
  func execute() { item.name = newName }
  func undo() { item.name = oldName }
}

final class CommandStack {
  private var history: [Command] = []
  func run(_ command: Command) {
    command.execute()
    history.append(command)
  }
  func undoLast() { history.popLast()?.undo() }
}</div>
    <div class="callout tip"><span class="lbl">When to reach for these</span> Most of this batch is already
      in the frameworks you use (responder chain, <code>Sequence</code>, view lifecycle) — recognize them
      rather than reinvent them. Command, Mediator, and Visitor are the three worth hand-rolling
      deliberately, and only when the problem (undo, decoupled child coordination, dispatch over a foreign
      hierarchy) actually calls for the ceremony.</div>`,
  },
  {
    id: "st-adv-76",
    num: "91",
    title: "91 · Clean Architecture with SwiftUI: layers, Interactors & DIContainer",
    html: `<p><b>What it is.</b> A layered architecture — <b>Presentation</b> (SwiftUI views + lightweight
      view state) → <b>Domain</b> (<code>Interactor</code>s expressing business use-cases) → <b>Data</b>
      (repositories talking to network/disk) — where the <b>dependency rule</b> only points inward: outer
      layers know about inner ones, never the reverse. Popularized for SwiftUI by
      <a href="https://github.com/nalexn/clean-architecture-swiftui">nalexn/clean-architecture-swiftui</a>,
      which pairs it with a single <code>AppState</code> struct as the source of truth and a
      <code>DIContainer</code> injected through the SwiftUI <code>Environment</code>.</p>
    <p>An <b>Interactor</b> differs from a plain ViewModel: it's stateless (holds no
      <code>@Published</code> properties of its own), takes the current <code>AppState</code> (or a binding
      into it) plus a repository, performs a use-case, and writes results back into <code>AppState</code> —
      views then read their own slice of that shared state. This makes side effects (network calls,
      persistence) sit entirely behind repository <b>protocols</b>, so tests inject mocks and assert on the
      resulting state mutation instead of stubbing a ViewModel's internals.</p>
    <div class="code">protocol CountriesInteractor {
  func loadCountries()
}

struct RealCountriesInteractor: CountriesInteractor {
  let repository: CountriesRepository
  let appState: Store&lt;AppState&gt;

  func loadCountries() {
    appState.bulkUpdate { $0.countries = .loading }
    Task {
      do {
        let countries = try await repository.fetchCountries()
        appState.bulkUpdate { $0.countries = .loaded(countries) }
      } catch {
        appState.bulkUpdate { $0.countries = .failed(error) }
      }
    }
  }
}</div>
    <div class="callout warn"><span class="lbl">SwiftUI gotcha</span> A single global <code>AppState</code>
      redraws every view observing it on <i>any</i> change unless you scope reads carefully — bind to an
      <code>Equatable</code> slice (a derived, per-screen value) rather than the whole struct, or every
      screen re-renders on every unrelated mutation.</div>
    <div class="callout tip"><span class="lbl">Trade-off</span> The ceremony (protocols for every
      repository/interactor, a DI container, an environment key per dependency) pays off in large apps with
      many contributors and a real test suite; for a small app it's usually more layers than the problem
      needs — see topic 89's "choosing architecture" framing.</div>`,
  },
  {
    id: "st-adv-77",
    num: "92",
    title: "92 · Learning iOS from real codebases & curated resources",
    html: `<p><b>What it is.</b> Reading real code is a different skill from reading docs, and it's a fast
      way to close interview gaps: curated lists like
      <a href="https://github.com/vsouza/awesome-ios">awesome-ios</a> and
      <a href="https://github.com/eleev/ios-learning-materials">ios-learning-materials</a> map the landscape
      of libraries and advanced topics, and
      <a href="https://github.com/dkhamsing/open-source-ios-apps">open-source-ios-apps</a> links to full,
      shipped apps you can actually open in Xcode.</p>
    <p><b>Skimming a large unfamiliar codebase</b> (do this before committing to a top-to-bottom read): start
      at the README and the entry point (<code>App</code>/<code>AppDelegate</code>), look at the top-level
      folder structure for the module boundaries the team chose, skim the composition root to see how the big
      pieces wire together, and open the tests — they're the fastest, most honest description of what the
      app's boundaries and edge cases actually are.</p>
    <p><b>Evaluating a third-party package before adding it</b> (SPM dependency review): check
      <code>Package.swift</code> for its own dependency footprint, the commit/release cadence (abandoned vs.
      maintained), the license, whether its public API is <code>Sendable</code>/concurrency-checked for
      Swift 6, and whether it pulls in a large binary/asset payload you don't need.</p>
    <div class="callout tip"><span class="lbl">Portfolio signal</span> Match your own project's patterns to
      the seniority you're interviewing for — a junior/mid portfolio project done cleanly in plain MVVM reads
      better than a small app wrapped in Clean Architecture ceremony it doesn't need. Save "architect-scale"
      patterns for when the project's actual complexity earns them.</div>
    <div class="callout warn"><span class="lbl">Before you copy a pattern</span> A pattern used in a large
      open-source app (Clean Architecture, TCA, heavy modularization) was chosen for <i>that</i> app's team
      size and lifespan — cite it in an interview as "here's a real example of X, and here's when I would and
      wouldn't reach for it," not as "this is the correct way."</div>`,
  },
];
