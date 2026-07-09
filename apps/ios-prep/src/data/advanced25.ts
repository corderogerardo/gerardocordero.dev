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
    answerHtml: `<p>The delegate pattern exists so an object can hand work back to whoever owns it without knowing
      that owner's concrete type — a <b>one-to-one</b> callback contract via a <code>delegate</code> protocol
      (UIKit is built on this). Mechanically: the owning object holds the delegate, and the delegate's callbacks
      fire back into the owner.</p>
      <p>Red flag: declaring the delegate property strong. The owner holds the delegate-conforming object and that
      object holds a reference back to the owner — strong on both sides is a retain cycle. Always declare
      <code>weak var delegate: SomeDelegate?</code>.</p>
      <p><b>I make delegate properties weak by default — it's a one-to-one callback contract, and strong on both
      sides of that relationship is a retain cycle waiting to happen.</b></p>`,
    level: "mid",
  },
  {
    id: "dp2",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What are the observer-pattern options in iOS, and when each?",
    answerHtml: `<p>iOS has three observer variants because they solve different coupling problems, not because
      one replaced the others. <b>Observation</b> (<code>@Observable</code>) / <b>Combine</b> are for app state and
      reactive pipelines where sender and receiver both know the model. <b>NotificationCenter</b> is for
      broadcast, app-wide, decoupled events with many listeners who shouldn't know each other exist. <b>KVO</b> is
      mostly for observing Apple/legacy <code>NSObject</code> properties you don't own.</p>
      <p><b>I default to Observation or Combine for my own models, and reach for NotificationCenter only when
      sender and receiver genuinely shouldn't know about each other.</b></p>`,
    level: "senior",
  },
  {
    id: "dp3",
    category: "arch",
    categoryLabel: "Architecture",
    question: "When is a Singleton fine, and when is it a trap?",
    answerHtml: `<p>A singleton is a convenience, not an architecture — it's fine when it's genuinely a single,
      stateless-ish system resource (<code>URLSession.shared</code>, <code>FileManager.default</code>). It becomes
      a trap the moment you use it for your own services: it creates <b>hidden global dependencies</b> that can't
      be mocked, makes tests order-dependent, and hides coupling between unrelated parts of the app.</p>
      <p>Red flag: reaching for <code>MyService.shared</code> as the default way to share a service. Inject a
      protocol instead — if you still want one shared instance under the hood, depend on the abstraction, not the
      static accessor.</p>
      <p><b>I treat singletons as an implementation detail behind a protocol, never as the thing my code depends
      on directly.</b></p>`,
    level: "senior",
  },
  {
    id: "dp4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What is dependency injection and why does it matter?",
    answerHtml: `<p>Dependency injection matters because it's what makes everything else testable — pass a type
      its collaborators (via initializer, property, or SwiftUI <code>@Environment</code>) instead of letting it
      construct them internally, which is <b>inversion of control</b>.</p>
      <p>Mechanically it buys you three things: testable code (inject a mock), decoupled code (depend on
      protocols, not concrete types), and per-environment configuration (live/test/preview). Most of the other
      patterns in this deck — Factory, Repository, Adapter — are really just different ways to construct or
      supply the thing you inject.</p>
      <p><b>I inject collaborators through the initializer against a protocol, so I can swap in a mock in tests
      without touching production code.</b></p>`,
    level: "senior",
  },
  {
    id: "dp5",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What problem does the Factory pattern solve?",
    answerHtml: `<p>Factory exists so construction logic doesn't leak into every call site — it <b>encapsulates
      object creation</b> behind a method or type that returns instances via a protocol, instead of callers
      hard-coding concrete types or repeating complex setup. That's what lets you choose an implementation at
      runtime (live vs mock service) and centralize configuration in one place.</p>
      <p><b>I put construction behind a factory whenever the choice of concrete type depends on runtime context —
      it keeps that decision out of business logic.</b></p>`,
    level: "mid",
  },
  {
    id: "dp6",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's the Builder pattern, and its Swift twist?",
    answerHtml: `<p>Builder solves the giant-initializer problem: when an object has many optional parts, one
      initializer with a dozen parameters is unreadable and error-prone at the call site — Builder constructs the
      object <b>step by step</b> instead.</p>
      <p>Swift rarely needs a classic Builder class. Its idiomatic versions are chained configuration methods,
      default parameters, and — the DSL approach SwiftUI popularized — <b>result builders</b>, which assemble
      structured values declaratively.</p>
      <p><b>In Swift I reach for result builders or chained configuration methods before I'd write a classic
      Builder class — the language already gives you the ergonomics.</b></p>`,
    level: "senior",
  },
  {
    id: "dp7",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What does the Coordinator / Router pattern do?",
    answerHtml: `<p>Coordinator/Router exists because screens that know how to present each other can't be
      reused or tested in isolation — it lifts <b>navigation flow</b> out of view controllers/views into a
      dedicated object. The coordinator owns the navigation stack and decides transitions; features just emit
      intent ("user tapped checkout") without knowing what screen comes next.</p>
      <p>Result: reusable, decoupled screens, centralized and testable navigation logic, and deep linking that has
      one place to live instead of being smeared across every screen.</p>
      <p><b>I keep navigation decisions in a coordinator so a screen never needs to know what comes after it —
      that's what lets me reuse it and deep-link into it.</b></p>`,
    level: "architect",
  },
  {
    id: "dp8",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What is the Repository pattern?",
    answerHtml: `<p>Repository exists so the UI/view model never has to know or care where data physically comes
      from — it's an abstraction over data sources: the caller asks a <code>Repository</code> protocol for domain
      models, and the repository hides whether the answer came from the network, a cache, or a local store (and
      owns the fresh-vs-cached decision).</p>
      <p>That gives you one source of truth, a clean seam for testing (fake the protocol, no network needed), and
      backends you can swap without touching call sites.</p>
      <p><b>My view models talk to a Repository protocol, never to networking or persistence directly — that's
      the seam I test against.</b></p>`,
    level: "senior",
  },
  {
    id: "dp9",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's the Strategy pattern in Swift?",
    answerHtml: `<p>Strategy exists so you can change an algorithm without touching the code that uses it —
      encapsulate interchangeable <b>algorithms</b> behind a protocol (or just a closure) and inject the one you
      want: a <code>SortStrategy</code>, a pricing rule, a retry policy.</p>
      <p>Swift rarely needs the full protocol-with-multiple-conformers ceremony; a stored closure or a
      protocol-typed property, swapped at runtime, is usually enough.</p>
      <p><b>When behavior needs to vary by context, I inject a closure or protocol-typed strategy rather than
      branching on a flag inside the algorithm itself.</b></p>`,
    level: "senior",
  },
  {
    id: "dp10",
    category: "arch",
    categoryLabel: "Architecture",
    question: "When do you use the Adapter pattern?",
    answerHtml: `<p>Adapter exists to contain vendor risk: wrap an <b>incompatible or third-party API</b> in a
      protocol <i>you</i> own, so your code depends on your abstraction, not the vendor's shape. That isolates the
      dependency — you can swap SDKs without touching call sites — and keeps your domain models clean of foreign
      types.</p>
      <p><b>I never let a third-party SDK's types leak into my domain models — I wrap it behind a protocol I own,
      so swapping the SDK later is a one-file change.</b></p>`,
    level: "senior",
  },
  {
    id: "dp11",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's the Facade pattern?",
    answerHtml: `<p>Facade exists to reduce cognitive load for callers: a <b>simple interface over a complex
      subsystem</b> — one type that coordinates several others and exposes a small, task-focused API. Example: a
      <code>MediaService</code> facade hiding AVFoundation capture + Photos saving + permission handling behind a
      single <code>capturePhoto()</code> call.</p>
      <p><b>When a feature needs three or four subsystems working together, I wrap them in a facade so the caller
      sees one method, not the orchestration.</b></p>`,
    level: "senior",
  },
  {
    id: "dp12",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What's the Decorator pattern, and a SwiftUI parallel?",
    answerHtml: `<p>Decorator exists so you can add behavior without subclassing or modifying the original type —
      wrap an object to <b>add behavior</b>, conforming to the same interface so decorators stack.</p>
      <p>SwiftUI's <b>view modifiers</b> are the decorator pattern in disguise — each <code>.padding()</code>/
      <code>.background()</code> wraps the view and returns a new one with added behavior, composing outward.</p>
      <p><b>Every time I chain view modifiers in SwiftUI, that's the Decorator pattern — each call wraps the
      previous view rather than mutating it.</b></p>`,
    level: "senior",
  },
  {
    id: "dp13",
    category: "arch",
    categoryLabel: "Architecture",
    question: "What is protocol-oriented programming?",
    answerHtml: `<p>Protocol-oriented programming exists because deep class hierarchies get brittle fast —
      it designs around <b>protocols + default implementations</b> (in extensions) and composition, instead of
      inheritance, which lets you keep value types and avoid deep hierarchies entirely.</p>
      <p>You still get polymorphism and shared behavior, just without a base class forcing every conformer into
      the same shape. It's the idiomatic Swift answer to a lot of classic OOP patterns in this deck.</p>
      <p><b>I reach for a protocol with a default extension implementation before I reach for a base class —
      it gives me shared behavior without locking conformers into one hierarchy.</b></p>`,
    level: "senior",
  },
  {
    id: "dp14",
    category: "arch",
    categoryLabel: "Architecture",
    question: "When use Result vs throws?",
    answerHtml: `<p>The distinction is about control flow versus value: <code>throws</code> is the default for
      synchronous/async functions because it gives a clean call site with <code>try</code> and propagates errors up
      the call stack automatically. <code>Result&lt;Success, Failure&gt;</code> shines when you need to
      <b>store</b> or <b>pass around</b> an outcome as data — completion handlers, caching a success/failure, or
      representing state in a model.</p>
      <p>Red flag: reaching for <code>Result</code> inside an async/await function just out of habit — that's the
      wrong tool once <code>throws</code> is available; use <code>Result</code> when you need the outcome to
      outlive the call, not to replace <code>throws</code>.</p>
      <p><b>With async/await I use throws for propagation and Result only when I need to hold an outcome as a
      value — the two aren't interchangeable defaults.</b></p>`,
    level: "mid",
  },
  {
    id: "dp15",
    category: "arch",
    categoryLabel: "Architecture",
    question: "How do you model state with the State pattern in Swift?",
    answerHtml: `<p>The State pattern in Swift matters because bugs from contradictory flags are entirely
      preventable at compile time — model finite states as an <b>enum</b> with associated values
      (<code>idle / loading / loaded(Data) / failed(Error)</code>) and <code>switch</code> over it. The compiler
      forces you to handle every case, which makes <b>impossible states unrepresentable</b>.</p>
      <p>Red flag: several independent <code>Bool</code>s (<code>isLoading</code>, <code>hasError</code>) — nothing
      stops <code>isLoading == true && hasError == true</code> at the same time, and that combination usually
      means a real bug shipped.</p>
      <p><b>I model view state as one enum with associated values instead of a handful of Bools — it makes
      contradictory states impossible to construct, not just unlikely.</b></p>`,
    level: "senior",
  },
  {
    id: "dp16",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Name common iOS anti-patterns to avoid.",
    answerHtml: `<p>These anti-patterns matter because they all trade short-term speed for long-term
      untestability: <b>Massive View Controller</b> (push logic into view models/services), <b>singletons
      everywhere</b> (hidden deps, untestable), <b>stringly-typed</b> code (use enums/types/keypaths instead of
      raw strings), <b>premature abstraction</b> (a protocol with one implementation forever, added "for
      flexibility" nobody used), and god objects doing too much.</p>
      <p>The fix is almost always the same three moves: smaller types, injected dependencies, and modeling state
      with the type system instead of conventions.</p>
      <p><b>When I review code, most anti-patterns trace back to one root cause: a type that knows how to build
      its own dependencies instead of receiving them.</b></p>`,
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
      strong delegate cycles, so <code>weak</code> breaks it. "Improve speed" is the tempting wrong answer because
      <code>weak</code> sounds like an optimization; it isn't — it costs a tiny bit of runtime overhead and exists
      purely for memory correctness, not performance.</p>`,
  },
  {
    id: "dpz2",
    category: "arch",
    categoryLabel: "Architecture",
    question: "The main downside of using singletons for your services is:",
    options: ["They're slow", "Hidden global dependencies that hurt testability", "They use more memory", "They can't hold state"],
    answer: 1,
    explanationHtml: `<p>Singletons hide coupling and can't be substituted with mocks — prefer injecting a
      protocol even if a shared instance exists. "They're slow" is the tempting wrong answer: a singleton isn't
      inherently slower than any other object, the real cost is architectural (untestable, order-dependent tests),
      not runtime performance.</p>`,
  },
  {
    id: "dpz3",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Dependency injection primarily improves:",
    options: ["Binary size", "Testability and decoupling (inversion of control)", "Launch time", "Animation smoothness"],
    answer: 1,
    explanationHtml: `<p>Passing in collaborators (vs constructing them) lets you mock in tests and swap
      implementations — the foundation of testable architecture. "Launch time" is the tempting wrong answer since
      DI is sometimes blamed for slow app startup (container resolution overhead), but that's a misuse concern for
      heavyweight DI frameworks, not what DI is for.</p>`,
  },
  {
    id: "dpz4",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Lifting navigation out of view controllers into a dedicated object is the:",
    options: ["Repository pattern", "Coordinator/Router pattern", "Factory pattern", "Adapter pattern"],
    answer: 1,
    explanationHtml: `<p>A coordinator/router owns navigation flow so screens stay decoupled and reusable, and
      deep linking is centralized. "Repository" is the tempting wrong answer because both patterns are about
      pulling a concern out of the view layer — but Repository abstracts data access, not navigation.</p>`,
  },
  {
    id: "dpz5",
    category: "arch",
    categoryLabel: "Architecture",
    question: "To make impossible states unrepresentable, model state as:",
    options: ["Several Bool flags", "An enum with associated values", "A dictionary", "Global variables"],
    answer: 1,
    explanationHtml: `<p>An enum (idle/loading/loaded/failed) forces exhaustive handling and prevents
      contradictory combinations that independent Bools allow. "Several Bool flags" is the tempting wrong answer —
      it's the common first instinct, but it's exactly what lets <code>isLoading</code> and <code>hasError</code>
      both be true at once, which is the bug this pattern is meant to prevent.</p>`,
  },
  {
    id: "dpz6",
    category: "arch",
    categoryLabel: "Architecture",
    question: "Wrapping a third-party SDK behind a protocol you own is the:",
    options: ["Facade", "Adapter pattern", "Singleton", "Observer"],
    answer: 1,
    explanationHtml: `<p>The Adapter isolates the vendor type behind your abstraction, so call sites depend on
      your protocol and the SDK is swappable/mockable. "Facade" is the tempting wrong answer since both patterns
      wrap other code behind a simpler interface — but Facade simplifies your own subsystem, while Adapter's job
      is specifically to make an incompatible external API conform to a protocol you own.</p>`,
  },
];

export const ADVANCED25_STUDY: StudySection[] = [
  {
    id: "st-adv-57",
    num: "72",
    title: "72 · Core iOS patterns: delegate, observer, DI",
    html: `<p><b>Why it matters.</b> These patterns exist to keep objects decoupled and testable without
      inheritance. <b>Delegate</b> gives one-to-one callbacks via a <code>weak</code> protocol (UIKit's backbone).
      <b>Observer</b> has modern forms for different fan-out shapes: Observation (<code>@Observable</code>) /
      Combine for app state, <b>NotificationCenter</b> for decoupled broadcast, <b>KVO</b> for Apple/legacy
      objects. <b>Dependency injection</b> (init/property/<code>@Environment</code>) is the inversion of control
      that makes everything testable. Use a <b>singleton</b> only for truly singular system resources, and still
      depend on its protocol.</p>
    <div class="callout tip"><span class="lbl">Say this</span> "I depend on protocols and inject collaborators —
      the only references I make strong are ones where I intend to own the lifetime."</div>`,
  },
  {
    id: "st-adv-58",
    num: "73",
    title: "73 · Structural patterns & avoiding anti-patterns",
    html: `<p><b>Why it matters.</b> Each structural pattern here exists to pull one specific concern out of a
      type that would otherwise grow to own it: <b>Factory</b> (encapsulate creation), <b>Builder</b>/result
      builders (assemble complex values), <b>Coordinator/Router</b> (navigation as a separate concern),
      <b>Repository</b> (abstract data sources), <b>Strategy</b> (swap algorithms via protocol/closure),
      <b>Adapter</b> (wrap third-party APIs), <b>Facade</b> (simple API over a subsystem), and <b>Decorator</b>
      (SwiftUI modifiers are the familiar example). Lean on <b>protocol-oriented</b> design and model state with
      <b>enums</b> rather than class hierarchies or loose Bools.</p>
    <p>The anti-patterns worth naming out loud are Massive View Controller, singletons-everywhere, stringly-typed
      code, and premature abstraction. All four trace back to the same root cause: a type that constructs or owns
      something it should instead receive. The fix is consistent — smaller types, injected dependencies, and the
      type system doing the work.</p>
    <div class="callout warn"><span class="lbl">Say this</span> "I add a pattern when a second implementation or a
      test actually needs the seam — not preemptively. A protocol with one conformer forever is the anti-pattern,
      not the fix."</div>`,
  },
];
