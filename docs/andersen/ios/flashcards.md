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

## Swiftui

### Swiftui

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

## Uikit

### Uikit

- What's the actual difference between `frame` and `bounds`, and how does the subview/superview hierarchy work? — [answer](uikit.md#frame-vs-bounds-and-the-view-hierarchy)
- Walk me through the `UIViewController` lifecycle — what happens, in order, and where do you put what? — [answer](uikit.md#viewcontroller-lifecycle)
- How does AutoLayout resolve conflicting constraints, and what are intrinsic content size, hugging, and compression resistance for? — [answer](uikit.md#autolayout-and-intrinsic-content-size)
- Explain the cell reuse mechanism in `UITableView`/`UICollectionView`, and how do you debug stuttering or visual artifacts? — [answer](uikit.md#cell-reuse-and-scroll-performance)
- What is the responder chain, and how does `UIView` relate to `CALayer`? — [answer](uikit.md#responder-chain-and-uiview-vs-calayer)
- How do you combine multiple `UIGestureRecognizer`s, and how does parent/child view controller containment work? — [answer](uikit.md#gesture-recognizers-and-container-view-controllers)
- How does Safe Area Layout work, and how would you build a custom view controller transition? — [answer](uikit.md#safe-area-and-custom-transitions)
