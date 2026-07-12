# Flashcards — iOS (Andersen matrix)

Every matrix row as an interviewer question. Filter by level and category in the deck.

## Architecture

### Architecture

- How does Apple's MVC differ from textbook MVC, and what does 'Massive View Controller' actually mean? — [answer](architecture.md#mvc-and-the-massive-view-controller)
- Walk me through KVO, Singleton, Delegate, and Observer — where does each genuinely earn its place in an iOS codebase? — [answer](architecture.md#core-design-patterns)
- Compare MVVM, VIPER, Clean Swift, and TCA — what problem does each actually solve, and what does it cost? — [answer](architecture.md#mvvm-viper-clean-swift-and-tca)
- Give me a practiced take on SOLID and how dependency injection ties into it. — [answer](architecture.md#solid-and-dependency-injection)
- How does OOP differ from Swift's protocol-oriented approach in practice — not in theory? — [answer](architecture.md#oop-vs-protocol-oriented-programming)
- Walk me through Factory, Builder, and Adapter — with a real iOS use case for each. — [answer](architecture.md#factory-builder-and-adapter)
- How do you approach modular architecture — refactoring a monolith into modules, or building modular from scratch? — [answer](architecture.md#modular-architecture)
- How do you actually choose between architectures for a new project or a refactor — not just list them? — [answer](architecture.md#choosing-an-architecture)

## Concurrency

### Junior Foundations

- Why must UI updates happen on the main thread, and how do you get back to it after a background task? — [answer](concurrency.md#the-main-thread-rule) {J1, J2, J3}

### Concurrency

- Walk me through Grand Central Dispatch — sync vs async, queues, and QoS. — [answer](concurrency.md#gcd-fundamentals)
- What does structured concurrency actually give you over completion-handler closures? — [answer](concurrency.md#structured-concurrency-asyncawait-and-task)
- Name the classic multithreading bugs — deadlock, race condition, data race, priority inversion — and how each one actually manifests. — [answer](concurrency.md#multithreading-pitfalls)
- How do you know when several independent async GCD calls have all finished? — [answer](concurrency.md#gcd-advanced-dispatchgroup-and-dispatchworkitem)
- When do you reach for `OperationQueue` over raw GCD? — [answer](concurrency.md#operationqueue-vs-gcd)
- What are your options for protecting shared mutable state, from `NSLock` to `os_unfair_lock`? — [answer](concurrency.md#thread-safety-apis)
- How do you run several async operations concurrently and wait for all of them? — [answer](concurrency.md#async-let-and-taskgroup)
- What is an actor, and how does `@MainActor` fit in? — [answer](concurrency.md#actors-and-mainactor)
- What's the difference between `Task { }` and `Task.detached { }`, and how does cancellation actually work? — [answer](concurrency.md#task-lifecycle-priority-detached-cancellation)
- What is `AsyncSequence`, and when do you reach for `AsyncStream`? — [answer](concurrency.md#asyncsequence-and-asyncstream)
- What does `Sendable` actually check, and what's `nonisolated` for? — [answer](concurrency.md#sendable-tasklocal-and-nonisolated)
- How do you write a reliable XCTest for an `async` function? — [answer](concurrency.md#testing-async-code)

## Swift

### Junior Foundations

- When do you use `var` versus `let`, and why does Swift push you toward `let`? — [answer](swift.md#var-vs-let) {J1, J2, J3}
- Walk me through Swift's access levels — private, fileprivate, internal, public, open. — [answer](swift.md#access-control-in-swift) {J1, J2, J3}
- What are Swift extensions for, and what can't they do? — [answer](swift.md#extensions) {J1, J2, J3}
- Give me the quick version — what's a struct, a tuple, and an enum in Swift, and when do you reach for each? — [answer](swift.md#structs-tuples-and-enums) {J1, J2, J3}
- What's the difference between a stored and a computed property? — [answer](swift.md#computed-properties-vs-stored-properties) {J1, J2, J3}
- `guard let` versus `if let` — when do you reach for each? — [answer](swift.md#guard-vs-if-let) {J1, J2, J3}
- How does Swift's error handling work — `throws`, `try`, `do`/`catch`? — [answer](swift.md#error-handling-with-throws-try-and-catch) {J1, J2, J3}
- What is a protocol in Swift, and how does a type conform to it? — [answer](swift.md#defining-and-conforming-to-a-protocol) {J1, J2, J3}
- What are associated values on a Swift enum, and why are they useful? — [answer](swift.md#enums-with-associated-values) {J1, J2, J3}
- What do `?.` and `??` do in Swift? — [answer](swift.md#optional-chaining-and-nil-coalescing) {J1, J2, J3}
- What are Swift's basic collection types, and when do you use each? — [answer](swift.md#swift-collection-types--array-dictionary-set) {J1, J2, J3}
- What do `map`, `filter`, and `reduce` do on a Swift array? — [answer](swift.md#map-filter-and-reduce) {J1, J2, J3}
- How does type inference work in Swift, and when do you still annotate? — [answer](swift.md#type-inference-and-type-annotations) {J1, J2, J3}
- How do you build and combine strings in Swift? — [answer](swift.md#string-basics-and-interpolation) {J1, J2, J3}
- What are default parameter values and variadic parameters in Swift? — [answer](swift.md#default-and-variadic-parameters) {J1, J2, J3}

### Swift

- Walk me through Swift's optionals — why does the language force you to unwrap them, and what are the safe ways to do it? — [answer](swift.md#optionals-and-safe-unwrapping)
- What is a closure in Swift and why is it useful? — [answer](swift.md#closures)
- class vs struct vs enum — how do you decide, and what's actually different at runtime? — [answer](swift.md#value-types-vs-reference-types)
- What is protocol-oriented programming, and how do generics fit into it? — [answer](swift.md#protocol-oriented-programming-and-generics)
- What's the difference between an opaque return type (`some`) and an existential (`any`), and where does `any` cost you? — [answer](swift.md#opaque-types-vs-existentials)
- How does ARC work, and where do retain cycles actually creep in? — [answer](swift.md#arc-retain-cycles-and-noncopyable-types)
- How does Swift bridge to Objective-C, and what do the old ownership attributes (`strong`/`weak`/`copy`/`assign`) actually mean? — [answer](swift.md#objective-c-interop-and-memory-attributes)
- How does Swift decide between static and dynamic dispatch, and why does it matter for performance? — [answer](swift.md#static-vs-dynamic-dispatch)
- What is `@resultBuilder` and how does SwiftUI use it? — [answer](swift.md#resultbuilder)

## SwiftUI

### Junior Foundations

- What is a View in SwiftUI, and how is it different from a UIView? — [answer](swiftui.md#what-is-a-swiftui-view) {J1, J2, J3}
- What do `@State` and `@Binding` do, and how do they relate? — [answer](swiftui.md#state-and-binding-basics) {J1, J2, J3}
- SwiftUI or UIKit — how do you choose today? — [answer](swiftui.md#uikit-vs-swiftui--when-to-use-each) {J1, J2, J3}

### SwiftUI

- Walk me through `@State`, `@Binding`, `@ObservedObject`, `@StateObject`, and `@Published` — what does each one actually own? — [answer](swiftui.md#property-wrappers)
- What do `VStack`, `HStack`, `ZStack`, `Group`, `Spacer`, and `AnyView` each actually do? — [answer](swiftui.md#stacks-and-layout-containers)
- Why does modifier order matter — `background()` before `padding()` versus after — and what design pattern is this? — [answer](swiftui.md#modifier-order-and-the-builder-pattern)
- What is `@Environment`, and when do you reach for it over passing a value down explicitly? — [answer](swiftui.md#environment)
- How do UIKit and SwiftUI talk to each other — `UIHostingController`, `UIViewRepresentable`, `UIViewControllerRepresentable`? — [answer](swiftui.md#uikit-and-swiftui-interop)
- What does `@ViewBuilder` do, and why can't you put arbitrary logic inside a SwiftUI view body? — [answer](swiftui.md#viewbuilder)
- Walk me through SwiftUI's layout process — how do `ViewModifier`, `GeometryReader`, `PreferenceKey`, and `alignmentGuide` fit together? — [answer](swiftui.md#layout-system-geometryreader-and-preferencekey)
- What's the real difference between `List` and `ForEach`, and when do `LazyVStack`/`LazyVGrid` matter? — [answer](swiftui.md#list-vs-foreach-and-lazy-containers)
- Walk me through SwiftUI's drawing and animation primitives — `Path`, `Shape`, `Canvas` — and the difference between `onAppear` and `.task`. — [answer](swiftui.md#drawing-animation-and-gestures)
- You've got a SwiftUI screen with hundreds of animating elements and it's dropping frames — what tools do you reach for? — [answer](swiftui.md#high-performance-swiftui)

## UIKit

### Junior Foundations

- What is the delegate pattern, and why is a delegate usually `weak`? — [answer](uikit.md#the-delegate-pattern) {J1, J2, J3}
- What's the difference between a UIView and a UIViewController? — [answer](uikit.md#uiviewcontroller-vs-uiview) {J1, J2, J3}
- What are IBOutlet and IBAction? — [answer](uikit.md#iboutlet-and-ibaction) {J1, J2, J3}
- How does navigation between screens work with a UINavigationController? — [answer](uikit.md#uinavigationcontroller--push-and-pop) {J1, J2, J3}
- What are the ways to build a UIKit screen, and what's the trade-off? — [answer](uikit.md#storyboard-vs-xib-vs-programmatic-ui) {J1, J2, J3}

### UIKit

- What's the actual difference between `frame` and `bounds`, and how does the subview/superview hierarchy work? — [answer](uikit.md#frame-vs-bounds-and-the-view-hierarchy)
- Walk me through the `UIViewController` lifecycle — what happens, in order, and where do you put what? — [answer](uikit.md#viewcontroller-lifecycle)
- How does AutoLayout resolve conflicting constraints, and what are intrinsic content size, hugging, and compression resistance for? — [answer](uikit.md#autolayout-and-intrinsic-content-size)
- Explain the cell reuse mechanism in `UITableView`/`UICollectionView`, and how do you debug stuttering or visual artifacts? — [answer](uikit.md#cell-reuse-and-scroll-performance)
- What is the responder chain, and how does `UIView` relate to `CALayer`? — [answer](uikit.md#responder-chain-and-uiview-vs-calayer)
- How do you combine multiple `UIGestureRecognizer`s, and how does parent/child view controller containment work? — [answer](uikit.md#gesture-recognizers-and-container-view-controllers)
- How does Safe Area Layout work, and how would you build a custom view controller transition? — [answer](uikit.md#safe-area-and-custom-transitions)

## Reactive Programming

### Combine

- What are the main principles of reactive programming, and what do Publisher, Subscriber, and Operator actually mean in Combine? — [answer](combine.md#reactive-programming-principles-publisher-subscriber-operator) {M1, M2}
- How do you create a publisher from a constant value, an array, or a callback-based API — and why does `Deferred` exist when `Future` already does the job? — [answer](combine.md#publisher-constructors--just-empty-sequence-future-deferred) {M1, M2, S2}
- What's the difference between a Subject and a plain Publisher, and when do you reach for `CurrentValueSubject` versus `PassthroughSubject`? — [answer](combine.md#subject-vs-publisher--currentvaluesubject-and-passthroughsubject) {M1, M2, M3, S1}
- Why do Combine APIs return `AnyPublisher`, and what does `AnyCancellable` actually manage? — [answer](combine.md#anypublisher-type-erasure-and-anycancellable-lifetime) {M3, S1}
- Walk through Combine's core transform operators and the difference between `debounce` and `throttle`. — [answer](combine.md#operators--map-flatmap-compactmap-filter-debounce-throttle) {M1, M2, M3, S1}
- What's the difference between `receive(on:)` and `subscribe(on:)`, and how do `combineLatest`, `merge`, and `zip` differ? — [answer](combine.md#schedulers-and-combining-streams--receiveon-subscribeon-combinelatest-merge-zip) {M1, M2, M3, S1, S2}

## Data Persistence

### Junior Foundations

- What is UserDefaults, and what should you *not* store in it? — [answer](persistence.md#userdefaults-basics) {J1, J2, J3}

### Data Persistence

- Keychain, UserDefaults, and .plist — how do you decide which one to use, and how do you share data across an app and its extensions? — [answer](persistence.md#keychain-userdefaults-plist-and-app-groups) {J3, M1}
- Walk through the Core Data stack — what does each piece do, and how do `NSFetchedResultsController` and `@FetchRequest` fit in? — [answer](persistence.md#core-data-stack--context-coordinator-store-types-fetching) {J3, M1}
- How do you use Core Data safely across threads, and what happens when your model changes between app versions? — [answer](persistence.md#core-data-multithreading-and-migrations) {M2, M3, S1, S2}
- How does Realm's threading model differ from Core Data's, and when would you actually choose one over the other? — [answer](persistence.md#realm-vs-core-data) {M2, M3}
- Beyond Core Data and UserDefaults, what are your other options for persisting data on-device? — [answer](persistence.md#nsfilemanager-archiving-sqlite-nscache-and-uidocument) {M2, M3, S1, S2}

## Network

### Junior Foundations

- How do you make a simple GET request and decode JSON in Swift? — [answer](networking.md#making-a-basic-network-request) {J1, J2, J3}

### Networking

- Walk through URLSession — the session/task model, and the different task subtypes. — [answer](networking.md#urlsession-fundamentals-and-task-subtypes) {J1, J2, J3, M1, M2, M3}
- Codable versus JSONSerialization — why did Codable win, and what do you do when the JSON shape doesn't match your Swift model? — [answer](networking.md#codable-and-jsonserialization) {J1, J2, J3, M1}
- How does URLSession cache responses, and how do you handle custom headers and OAuth2 auth for every request? — [answer](networking.md#caching-and-authentication--urlcache-urlprotocol-oauth2) {M2, M3}
- How would you design a custom APIClient, and how do you handle non-REST protocols or long-lived connections? — [answer](networking.md#custom-apiclient--response-codes-soap-and-long-polling) {S1, S2}

## Testing processes

### Testing

- Why do we need automated tests, and what are the main types you'd have in an iOS project? — [answer](testing.md#why-test-and-the-types-of-tests) {M1, M2}
- Walk through the five kinds of test doubles and give an iOS example of each. — [answer](testing.md#test-doubles--dummy-fake-stub-spy-mock) {M3, S1, S2}
- What does XCTest give you out of the box, how do you read code coverage, and why would a team reach for Quick/Nimble instead? — [answer](testing.md#xctest-code-coverage-and-quicknimble) {M3, S1, S2}
- How do UI tests and snapshot tests differ from unit tests, and where does mocking fit into all of it? — [answer](testing.md#ui-testing-snapshot-testing-and-mock-testing-patterns) {M1, M2, M3, S1, S2}

## Application Lifecycle

### App Lifecycle

- Walk through the app's states and which delegate methods fire at each transition. — [answer](app-lifecycle.md#appdelegatescenedelegate-methods-and-application-states) {M3, S1}

## User Notifications

### Notifications

- How does Apple Push Notification service actually work end to end, and what do service/content extensions let you do with a payload before it's shown? — [answer](app-lifecycle.md#apns-local-vs-remote-notifications-and-notification-extensions) {M1, M2, M3, S1}

## Security

### Security

- What is App Transport Security, when would you add an exception, and how do you responsibly store and access private user data? — [answer](app-lifecycle.md#security--app-transport-security-private-data-storage-and-biometrics) {M3, S1, S2}

## Deep Linking

### Deep Linking

- Custom URL schemes versus Universal Links — what are the actual trade-offs, and why would you still add something like Branch.io on top? — [answer](app-lifecycle.md#deep-linking--url-schemes-universal-links-and-third-party-services) {M2, M3, S1, S2}
