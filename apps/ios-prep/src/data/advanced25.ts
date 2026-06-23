// Advanced batch 25 — Design patterns in Swift (mid/senior/architect). Merged via all.ts.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";
import type { StudySection } from "./study";

export const ADVANCED25_FLASHCARD_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED25_FLASHCARDS: Flashcard[] = [
  {
    id: "dp1",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What is the delegate pattern and its one gotcha?",
    answerHtml: `<p>A <b>one-to-one</b> callback contract: an object exposes a <code>delegate</code> protocol and
      calls back into whoever adopts it (UIKit is built on this). The gotcha: declare the delegate
      <code>weak</code> — a strong delegate reference creates a retain cycle (the owner holds the object, the
      object holds the owner).</p>`,
    level: "mid",
  },
  {
    id: "dp2",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What are the observer-pattern options in iOS, and when each?",
    answerHtml: `<p><b>Observation</b> (<code>@Observable</code>) / <b>Combine</b> for app state and reactive
      pipelines, <b>NotificationCenter</b> for broadcast, app-wide, decoupled events (many listeners), and
      <b>KVO</b> mostly for observing Apple/legacy <code>NSObject</code> properties. Prefer Observation/Combine
      for your own models; NotificationCenter when sender and receiver shouldn't know each other.</p>`,
    level: "senior",
  },
  {
    id: "dp3",
    category: "arch",
    categoryLabel: "Architecture",
    question: "When is a Singleton fine, and when is it a trap?",
    answerHtml: `<p>Fine for genuinely single, stateless-ish system resources (<code>URLSession.shared</code>,
      <code>FileManager.default</code>). The trap: using singletons for your services creates <b>hidden global
      dependencies</b> that can't be mocked, makes tests order-dependent, and hides coupling. Prefer injecting a
      protocol; if you keep a shared instance, still depend on its abstraction.</p>`,
    level: "senior",
  },
  {
    id: "dp4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What is dependency injection and why does it matter?",
    answerHtml: `<p>Passing a type its collaborators (via initializer, property, or SwiftUI
      <code>@Environment</code>) instead of constructing them internally — <b>inversion of control</b>. It makes
      code testable (inject a mock), decoupled (depend on protocols), and configurable per environment
      (live/test/preview). It's the backbone of most other good patterns here.</p>`,
    level: "senior",
  },
  {
    id: "dp5",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What problem does the Factory pattern solve?",
    answerHtml: `<p>It <b>encapsulates object creation</b> so callers don't hard-code concrete types or complex
      setup. A factory method/type returns instances behind a protocol — handy for choosing an implementation at
      runtime (e.g. live vs mock service), centralizing configuration, and keeping construction out of business
      logic.</p>`,
    level: "mid",
  },
  {
    id: "dp6",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's the Builder pattern, and its Swift twist?",
    answerHtml: `<p>Construct a complex object <b>step by step</b> instead of a giant initializer — good for
      objects with many optional parts. Swift's idiomatic versions: chained configuration methods, default
      parameters, and <b>result builders</b> (the DSL approach SwiftUI uses) to assemble structured values
      declaratively.</p>`,
    level: "senior",
  },
  {
    id: "dp7",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What does the Coordinator / Router pattern do?",
    answerHtml: `<p>It lifts <b>navigation flow</b> out of view controllers/views into a dedicated object, so
      screens don't know how to present each other. The coordinator owns the navigation stack and decides
      transitions; features just emit intent. Result: reusable, decoupled screens and centralized, testable
      navigation (and easy deep linking).</p>`,
    level: "architect",
  },
  {
    id: "dp8",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What is the Repository pattern?",
    answerHtml: `<p>An abstraction over data sources: the UI/view model asks a <code>Repository</code> protocol
      for domain models, and the repository hides whether data comes from the network, a cache, or a local store
      (and owns the fresh-vs-cached decision). One source of truth, a clean testing seam, and swappable
      backends.</p>`,
    level: "senior",
  },
  {
    id: "dp9",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's the Strategy pattern in Swift?",
    answerHtml: `<p>Encapsulate interchangeable <b>algorithms</b> behind a protocol (or just a closure) and inject
      the one you want — e.g. a <code>SortStrategy</code>, a pricing rule, or a retry policy. Swift often expresses
      it simply as a stored closure or a protocol-typed property, swapped at runtime.</p>`,
    level: "senior",
  },
  {
    id: "dp10",
    category: "arch",
    categoryLabel: "Architecture",
    question: "When do you use the Adapter pattern?",
    answerHtml: `<p>To wrap an <b>incompatible or third-party API</b> in a protocol <i>you</i> own, so your code
      depends on your abstraction, not the vendor's. It isolates the dependency (swap SDKs without touching call
      sites) and keeps your domain clean of foreign types — a key tactic for testability and vendor risk.</p>`,
    level: "senior",
  },
  {
    id: "dp11",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's the Facade pattern?",
    answerHtml: `<p>A <b>simple interface over a complex subsystem</b>: one type that coordinates several others
      and exposes a small, task-focused API. Example: a <code>MediaService</code> facade hiding AVFoundation
      capture + Photos saving + permission handling behind <code>capturePhoto()</code>. Reduces coupling and
      cognitive load for callers.</p>`,
    level: "senior",
  },
  {
    id: "dp12",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's the Decorator pattern, and a SwiftUI parallel?",
    answerHtml: `<p>Wrap an object to <b>add behavior</b> without changing it, conforming to the same interface so
      decorators stack. SwiftUI's <b>view modifiers</b> are decorator-like — each <code>.padding()</code>/
      <code>.background()</code> wraps the view and adds behavior, composing outward.</p>`,
    level: "senior",
  },
  {
    id: "dp13",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What is protocol-oriented programming?",
    answerHtml: `<p>Designing around <b>protocols + default implementations</b> (in extensions) and composition,
      rather than class inheritance — keeping value types and avoiding deep hierarchies. You get polymorphism and
      shared behavior without a base class. It's the idiomatic Swift answer to many classic OOP patterns.</p>`,
    level: "senior",
  },
  {
    id: "dp14",
    category: "arch",
    categoryLabel: "Architecture",
    question: "When use Result vs throws?",
    answerHtml: `<p><code>throws</code> is the default for synchronous/async functions (clean call-site with
      <code>try</code>). <code>Result&lt;Success, Failure&gt;</code> shines when you need to <b>store</b> or
      <b>pass around</b> an outcome — e.g. completion handlers, caching a success/failure, or representing state.
      With async/await, prefer <code>throws</code>; reach for <code>Result</code> to hold an outcome as a
      value.</p>`,
    level: "mid",
  },
  {
    id: "dp15",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you model state with the State pattern in Swift?",
    answerHtml: `<p>Use an <b>enum</b> with associated values for finite states
      (<code>idle / loading / loaded(Data) / failed(Error)</code>) and <code>switch</code> over it — the compiler
      forces you to handle every case and makes <b>impossible states unrepresentable</b>. Far safer than several
      independent <code>Bool</code>s (isLoading, hasError) that can contradict each other.</p>`,
    level: "senior",
  },
  {
    id: "dp16",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Name common iOS anti-patterns to avoid.",
    answerHtml: `<p><b>Massive View Controller</b> (push logic into view models/services), <b>singletons
      everywhere</b> (hidden deps, untestable), <b>stringly-typed</b> code (use enums/types/keypaths),
      <b>premature abstraction</b> (protocols with one implementation forever), and god objects. The fix is almost
      always: smaller types, injected dependencies, and modeling state with the type system.</p>`,
    level: "architect",
  },
];

export const ADVANCED25_QUIZ_FILTERS: { value: string; label: string }[] = [];

export const ADVANCED25_QUIZ: QuizQuestion[] = [
  {
    id: "dpz1",
    category: "arch",
    categoryLabel: "Architecture",
    question: "A delegate property should be declared weak to:",
    options: ["Improve speed", "Avoid a retain cycle", "Allow multiple delegates", "Enable KVO"],
    answer: 1,
    explanationHtml: `<p>The owner holds the object and the object holds the delegate (often the owner) — a
      strong delegate cycles. <code>weak</code> breaks it.</p>`,
  },
  {
    id: "dpz2",
    category: "arch",
    categoryLabel: "Architecture",
    question: "The main downside of using singletons for your services is:",
    options: ["They're slow", "Hidden global dependencies that hurt testability", "They use more memory", "They can't hold state"],
    answer: 1,
    explanationHtml: `<p>Singletons hide coupling and can't be substituted with mocks; prefer injecting a
      protocol even if a shared instance exists.</p>`,
  },
  {
    id: "dpz3",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Dependency injection primarily improves:",
    options: ["Binary size", "Testability and decoupling (inversion of control)", "Launch time", "Animation smoothness"],
    answer: 1,
    explanationHtml: `<p>Passing in collaborators (vs constructing them) lets you mock in tests and swap
      implementations — the foundation of testable architecture.</p>`,
  },
  {
    id: "dpz4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Lifting navigation out of view controllers into a dedicated object is the:",
    options: ["Repository pattern", "Coordinator/Router pattern", "Factory pattern", "Adapter pattern"],
    answer: 1,
    explanationHtml: `<p>A coordinator/router owns navigation flow so screens stay decoupled and reusable, and
      deep linking is centralized.</p>`,
  },
  {
    id: "dpz5",
    category: "arch",
    categoryLabel: "Architecture",
    question: "To make impossible states unrepresentable, model state as:",
    options: ["Several Bool flags", "An enum with associated values", "A dictionary", "Global variables"],
    answer: 1,
    explanationHtml: `<p>An enum (idle/loading/loaded/failed) forces exhaustive handling and prevents
      contradictory combinations that independent Bools allow.</p>`,
  },
  {
    id: "dpz6",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Wrapping a third-party SDK behind a protocol you own is the:",
    options: ["Facade", "Adapter pattern", "Singleton", "Observer"],
    answer: 1,
    explanationHtml: `<p>The Adapter isolates the vendor type behind your abstraction, so call sites depend on
      your protocol and the SDK is swappable/mockable.</p>`,
  },
];

export const ADVANCED25_STUDY: StudySection[] = [
  {
    id: "st-adv-57",
    num: "72",
    title: "72 · Core iOS patterns: delegate, observer, DI",
    html: `<p><b>What it is.</b> The everyday patterns. <b>Delegate</b> (one-to-one callbacks via a
      <code>weak</code> protocol — UIKit's backbone). <b>Observer</b> in its modern forms: Observation
      (<code>@Observable</code>) / Combine for app state, <b>NotificationCenter</b> for decoupled broadcast,
      <b>KVO</b> for Apple/legacy objects. And <b>dependency injection</b> (init/property/<code>@Environment</code>)
      — the inversion of control that makes everything testable. Use a <b>singleton</b> only for truly singular
      system resources, and still depend on its protocol.</p>
    <div class="callout tip"><span class="lbl">Through-line</span> Depend on protocols, inject collaborators, and
      keep references weak where ownership would cycle.</div>`,
  },
  {
    id: "st-adv-58",
    num: "73",
    title: "73 · Structural patterns & avoiding anti-patterns",
    html: `<p><b>What it is.</b> Composition tools: <b>Factory</b> (encapsulate creation), <b>Builder</b>/result
      builders (assemble complex values), <b>Coordinator/Router</b> (navigation as a separate concern),
      <b>Repository</b> (abstract data sources), <b>Strategy</b> (swap algorithms via protocol/closure),
      <b>Adapter</b> (wrap third-party APIs), <b>Facade</b> (simple API over a subsystem), and <b>Decorator</b>
      (SwiftUI modifiers are the familiar example). Lean on <b>protocol-oriented</b> design and model state with
      <b>enums</b>.</p>
    <p>Avoid the classics: Massive View Controller, singletons-everywhere, stringly-typed code, and premature
      abstraction. The fix is consistent: smaller types, injected dependencies, and the type system doing the
      work.</p>
    <div class="callout warn"><span class="lbl">Balance</span> Patterns serve clarity and testability — don't add
      a protocol or layer until a second implementation or a test actually needs it.</div>`,
  },
];
