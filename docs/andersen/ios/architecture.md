# Architecture

### MVC and the Massive View Controller
**They ask:** "How does Apple's MVC differ from textbook MVC, and what does 'Massive View Controller' actually mean?"

Textbook MVC keeps Controller as a thin coordinator between an independent Model and View that don't know about each other. Apple's `UIViewController` collapses that boundary: it's simultaneously the controller *and* a huge chunk of view-management responsibility (layout, lifecycle, `UITableViewDataSource`/`Delegate` conformance), which is exactly why the pattern gets nicknamed "Massive View Controller" in practice — the natural home for network calls, business logic, formatting, and UI code all being the same object.

The Passive vs Active Model distinction matters here: a **passive** model is dumb data with no behavior of its own — the controller drives everything, including update notifications. An **active** model can notify observers of its own changes (via KVO, `NotificationCenter`, or Combine), which is what lets a view controller stay reactive instead of manually polling.

```swift
// Massive VC symptom: networking, parsing, and UI logic all in the controller
class ProfileViewController: UIViewController, UITableViewDataSource {
    func viewDidLoad() {
        URLSession.shared.dataTask(with: url) { data, _, _ in
            self.user = try? JSONDecoder().decode(User.self, from: data ?? Data())
            DispatchQueue.main.async { self.tableView.reloadData() }
        }.resume()
    }
}
```

The fix isn't abandoning MVC wholesale — it's pulling networking, parsing, and formatting logic *out* into dedicated services/view models, leaving the controller genuinely thin: wiring views to data and forwarding user actions. LVC ("Lean View Controller") is the informal name for that disciplined version of the same pattern.

**Say it:** "Apple's MVC isn't broken, it's just that `UIViewController` absorbs view *and* controller responsibilities by design — Massive View Controller is what happens when you also let it absorb networking and business logic; the fix is extracting those into services, not switching architectures."
**Red flag:** Blaming "MVC" itself for a bloated view controller. The pattern didn't put the networking code there — nothing enforced the extraction, and that's a discipline gap, not an architectural inevitability.

### Core Design Patterns
**They ask:** "Walk me through KVO, Singleton, Delegate, and Observer — where does each genuinely earn its place in an iOS codebase?"

**Delegate** is one-to-one: an object hands off a specific decision or event to exactly one other object via a protocol (`UITableViewDataSource`, a custom `PhotoPickerDelegate`) — it's explicit and easy to trace, which is why UIKit leans on it so heavily. **Observer** (via `NotificationCenter` or Combine) is one-to-many and decoupled: the poster doesn't know or care who's listening, which is powerful but harder to trace — a notification fired from anywhere can be picked up by code you'd never find by searching call sites.

```swift
protocol PhotoPickerDelegate: AnyObject {
    func photoPicker(_ picker: PhotoPicker, didSelect image: UIImage)
}

NotificationCenter.default.addObserver(forName: .userDidLogin, object: nil, queue: .main) { _ in
    self.refreshSession()
}
```

**KVO** (Key-Value Observing) is Objective-C-runtime-based property observation — genuinely useful for observing properties on Apple frameworks that don't offer a Combine/delegate alternative, but increasingly displaced by `@Published`/Combine in pure-Swift code. **Singleton** (`URLSession.shared`, `UserDefaults.standard`) guarantees exactly one instance and global access — legitimate for genuinely single, app-wide resources, but overused as a shortcut around dependency injection, which is the actual interview red flag: a singleton hides a dependency and makes testing require the same global state to be reset between tests.

**Say it:** "Delegate is explicit one-to-one, Observer is decoupled one-to-many — I reach for Singleton only for genuinely single, app-wide resources, because every other use is really an untested dependency hiding behind a convenient global."
**Red flag:** Defaulting to Singleton for anything that needs to be "accessible everywhere" — that's a dependency-injection problem wearing a singleton costume, and it makes the type untestable in isolation.

### MVVM, VIPER, Clean Swift, and TCA
**They ask:** "Compare MVVM, VIPER, Clean Swift, and TCA — what problem does each actually solve, and what does it cost?"

**MVVM** adds a ViewModel between View and Model that exposes state and intent as bindable properties instead of the view directly manipulating a model — the view becomes dumb and observably driven, which makes it trivially testable without instantiating any UIKit/SwiftUI machinery. It's the lightest step up from Massive View Controller and pairs naturally with SwiftUI's `@Published`/`ObservableObject` or Combine.

**VIPER** (View, Interactor, Presenter, Entity, Router) goes further: it splits *presentation logic* (Presenter) from *business logic* (Interactor) from *navigation* (Router) into distinct protocols, each independently testable and swappable — the cost is real ceremony, five files and five protocols for what might be a two-file MVVM screen. **Clean Swift (VIP)** is a stricter unidirectional variant of the same idea (View → Interactor → Presenter → View, one-way data flow, no back-references), trading even more boilerplate for stricter enforced flow. **TCA** (The Composable Architecture) is a third-party, Redux-inspired pattern: a single `State` struct, an `Action` enum describing every possible event, and a pure `Reducer` function computing the next state — side effects are isolated and explicitly modeled, which makes the entire app's behavior deterministic and exhaustively testable, at the cost of a real learning curve and dependency on the library.

```swift
// MVVM: the lightest step up
class ProfileViewModel: ObservableObject {
    @Published var name = ""
    func load() async { name = try await fetchUser().name }
}
```

**Say it:** "MVVM is the right default for most screens — a bindable, testable layer between view and model with almost no ceremony; VIPER/Clean Swift earn their boilerplate on large, long-lived modules with big teams, and TCA trades a learning curve for exhaustive, deterministic testability."
**Red flag:** Adopting VIPER or TCA for a small app or a short-lived feature "because it's more scalable" — the ceremony cost is real and constant, and it only pays off at a team size and codebase lifespan that justifies it.

### SOLID and Dependency Injection
**They ask:** "Give me a practiced take on SOLID and how dependency injection ties into it."

SOLID is five principles for code that stays changeable as it grows: **S**ingle Responsibility (a type should have one reason to change — the direct antidote to Massive View Controller), **O**pen/Closed (open for extension, closed for modification — add behavior via new conformances, not by editing existing branches), **L**iskov Substitution (a subtype must be usable anywhere its supertype is expected without breaking correctness), **I**nterface Segregation (many small, focused protocols beat one fat protocol clients are forced to partially implement), **D**ependency Inversion (depend on abstractions/protocols, not concrete types).

Dependency Inversion is where DI (Dependency *Injection*) becomes the practical technique: instead of a type constructing its own dependencies internally (tight coupling, untestable), you pass them in — via initializer, property, or a container — so a test can substitute a mock conforming to the same protocol.

```swift
protocol NetworkClient { func fetch(_ url: URL) async throws -> Data }

class UserRepository {
    private let client: NetworkClient
    init(client: NetworkClient) { self.client = client }   // injected, not created internally
}

// test: init(client: MockNetworkClient()) — no real network needed
```

**Say it:** "Dependency Inversion is the SOLID principle; Dependency Injection is the technique that satisfies it — passing a protocol-typed dependency into an initializer instead of constructing it internally is what actually makes that type unit-testable in isolation."
**Red flag:** Reciting the SOLID acronym without a concrete example of Dependency Inversion. Interviewers use it specifically to see if you can connect the principle to a testability payoff, not just recall the letters.

### OOP vs Protocol-Oriented Programming
**They ask:** "How does OOP differ from Swift's protocol-oriented approach in practice — not in theory?"

Classical OOP models shared behavior through class inheritance — a base class provides implementation, subclasses override or extend it. That works until you need to share behavior across types that *aren't* naturally in the same hierarchy, or across value types (structs/enums) at all, since only classes can inherit. Swift's answer is protocol extensions: define the contract as a protocol, supply a default implementation in an extension, and *any* conforming type — struct, enum, or class, related or not — gets that behavior without inheriting from anything.

```swift
protocol Loggable { var logDescription: String { get } }
extension Loggable {
    func log() { print("[LOG] \(logDescription)") }   // shared default, works on ANY conformer
}

struct Order: Loggable { var logDescription: String { "Order" } }
enum Status: Loggable { case active; var logDescription: String { "Status" } }
// Order and Status share no inheritance relationship at all, both get .log() for free
```

The practical payoff: composition over inheritance avoids the classic "diamond problem" and rigid hierarchy lock-in — a type can conform to as many protocols as make sense, picking up each one's default behavior à la carte, instead of being forced into a single linear ancestor chain.

**Say it:** "OOP shares behavior through a class hierarchy a type has to belong to; POP shares it through protocol extensions any conforming type can opt into — including structs and enums, which can't inherit from anything at all."
**Red flag:** Explaining POP as "just protocols instead of classes" without mentioning extensions with default implementations — protocols alone are just contracts; extensions are what actually deliver shared code.

### Factory, Builder, and Adapter
**They ask:** "Walk me through Factory, Builder, and Adapter — with a real iOS use case for each."

**Factory** centralizes *how* an object is created, hiding the concrete type behind a creation method — useful when the concrete type to instantiate depends on runtime conditions (feature flags, environment, A/B test variant) and callers shouldn't need to know which one they got, just that it conforms to the expected protocol.

```swift
protocol PaymentProcessor { func charge(_ amount: Decimal) }
enum PaymentProcessorFactory {
    static func make(for region: Region) -> PaymentProcessor {
        region == .eu ? SEPAProcessor() : StripeProcessor()
    }
}
```

**Builder** separates the *construction* of a complex object from its final representation, typically via chained calls that accumulate configuration before producing the final immutable value — SwiftUI's fluent modifier chain is effectively a builder pattern (each call wraps and returns a new configured view), and `URLRequest`/`URLComponents` construction follows the same shape imperatively.

**Adapter** converts one interface into another a client already expects — the canonical iOS case is wrapping a third-party SDK's API behind your own protocol, so the rest of the app depends on *your* abstraction instead of the vendor's types directly, which is what lets you swap the vendor later without touching every call site.

```swift
protocol AnalyticsTracking { func track(_ event: String) }
class FirebaseAnalyticsAdapter: AnalyticsTracking {
    func track(_ event: String) { Analytics.logEvent(event, parameters: nil) }  // adapts vendor API
}
```

**Say it:** "Factory hides *which* concrete type gets created, Builder separates step-by-step construction from the final object, and Adapter is how I isolate a third-party SDK behind my own protocol so swapping vendors later doesn't ripple through the codebase."
**Red flag:** Depending directly on a third-party SDK's types throughout the app instead of behind an Adapter — it's the single biggest reason a vendor swap turns into a multi-week rewrite instead of a contained change.

### Modular Architecture
**They ask:** "How do you approach modular architecture — refactoring a monolith into modules, or building modular from scratch?"

Modularization means splitting a single app target into independent modules (Swift Packages or separate frameworks) with explicit, deliberately narrow public interfaces — the payoff is faster incremental builds (unchanged modules don't recompile), enforced boundaries (a module literally cannot reach into another's internals without an explicit public API), and independent ownership by different teams.

The practical approach for an existing monolith: identify natural seams first — usually by feature (a `Booking` module, a `Profile` module) or by layer (a `NetworkKit`, `DesignSystem`, `Persistence` foundation layer everything else depends on). Extract leaf dependencies first (things nothing else depends on — a design system, a networking layer) before extracting feature modules that depend on them, since extracting a dependent module before its dependency just moves the coupling problem, not solves it.

```swift
// Package.swift
.target(name: "Booking", dependencies: ["NetworkKit", "DesignSystem"]),
.target(name: "Profile", dependencies: ["NetworkKit", "DesignSystem"])
// Booking and Profile can't see each other's internals — only what NetworkKit/DesignSystem expose publicly
```

The real discipline is resisting circular dependencies: if `Booking` needs something from `Profile`, that shared piece usually belongs in a lower-level module both depend on, not a cross-dependency between features — module graphs should be a DAG (directed acyclic graph), never a cycle.

**Say it:** "I extract foundation layers — networking, design system — before feature modules, because a feature module's whole point is depending on those, not the other way around; and I treat any circular dependency between two feature modules as a sign something belongs one layer down."
**Red flag:** Letting two feature modules depend on each other to "get it working fast." That's a circular dependency baked into the build graph — Swift Package Manager will reject it outright once you try, but the underlying design problem exists whether the tooling catches it or not.

### Choosing an Architecture
**They ask:** "How do you actually choose between architectures for a new project or a refactor — not just list them?"

The framework: state the **problem** the architecture needs to solve for *this* codebase specifically (is it Massive View Controller? Untestable business logic? A large team stepping on each other?), then weigh **team size and experience** (VIPER's ceremony pays off with many contributors on long-lived modules; it's overhead for a two-person short-lived feature), **testability requirements** (TCA and VIPER both push toward near-total testability at the cost of boilerplate; MVVM gets most of that benefit far more cheaply), **codebase lifespan** (a throwaway prototype doesn't need the same investment as a five-year product), and **existing team familiarity** (introducing an unfamiliar architecture has a real ramp-up cost that has to be weighed against its theoretical benefits).

The senior answer is never "always use X" — it's a stated trade-off given the actual constraints:

```
Given: small team, SwiftUI-first, feature ships in 6 weeks, but expected to live for years
→ MVVM: lightweight enough for the timeline, testable enough for the lifespan,
  and it's the natural fit for SwiftUI's @Published/ObservableObject already.
```

The 3-beat pitch for defending a heavier architecture like VIPER to a skeptical team: (1) acknowledge the real cost — more files, more ceremony per screen; (2) name the concrete cost of *not* doing it — a monolithic view controller that becomes unreviewable and untestable as the team grows past 3-4 engineers touching the same screens; (3) reframe it as an investment that pays off specifically at the team size and timeline in question, not as a universal best practice.

**Say it:** "I don't pick an architecture in the abstract — I state the actual problem, the team size, the testability bar, and the expected lifespan, and let those pick the architecture; VIPER's ceremony is an investment that only pays off at a specific team size and codebase lifespan, not a default."
**Red flag:** A confident "VIPER is always better because it's more testable" with no mention of team size, timeline, or the ceremony cost — that's reciting a preference, not making an engineering trade-off.
