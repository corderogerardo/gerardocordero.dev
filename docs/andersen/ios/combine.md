# iOS — Combine / Reactive Programming

### Reactive programming principles, Publisher, Subscriber, Operator
**They ask:** "What are the main principles of reactive programming, and what do Publisher, Subscriber, and Operator actually mean in Combine?"

Reactive programming exists because push beats pull for asynchronous, time-varying data: instead of polling a value or nesting completion handlers, you declare a pipeline once and values flow through it as they happen — network responses, text field changes, location updates. The payoff is composability: transforms, error handling, and threading all become chainable operators instead of tangled callback logic.

Combine models this with three roles. A **Publisher** emits a sequence of values over time (`Output`) and can terminate with completion or a typed `Failure`. A **Subscriber** requests and receives those values, applying backpressure via demand. An **Operator** is a Publisher that wraps another Publisher, transforming what flows through — `map`, `filter`, `debounce` are all just publishers under the hood, which is why they chain.

```swift
let cancellable = NotificationCenter.default
    .publisher(for: UIResponder.keyboardWillShowNotification)
    .map { $0.name }
    .sink { print($0) }
```

**Say it:** "Combine is push-based: a Publisher emits values over time, a Subscriber consumes them under backpressure, and operators are themselves publishers, which is why the whole pipeline composes."
**Red flag:** Describing Combine as "just callbacks with extra steps." The compositional operator chain and typed error channel are the actual value — callbacks don't give you either.

### Publisher constructors — Just, Empty, Sequence, Future, Deferred
**They ask:** "How do you create a publisher from a constant value, an array, or a callback-based API — and why does `Deferred` exist when `Future` already does the job?"

Picking the right constructor signals you understand *when* work executes, not just what value comes out. `Just` emits one value then completes — for a constant. `Empty` completes immediately with no values — a valid "nothing happened" publisher. `Sequence` emits each element of a collection then completes — the way to publish from an array.

`Future` wraps a single async, callback-based operation and executes it **eagerly, once, on subscription of the *first* subscriber** — a `Future` created but not yet assigned to a variable still starts running immediately when constructed, because it eagerly invokes the closure on init, not on subscribe.

```swift
func fetchUser() -> Future<User, Error> {
    Future { promise in
        api.getUser { result in promise(result) }
    }
}
```

The gotcha: because `Future`'s side effect runs at *creation* time, every subscriber shares the same in-flight result — fine for a fire-once fetch, wrong if you need the work to restart per subscription. `Deferred` fixes that: it defers publisher *creation* until subscribe time, so wrapping a `Future` in `Deferred` gives you a fresh, lazily-started operation for every new subscriber.

```swift
func fetchUser() -> AnyPublisher<User, Error> {
    Deferred { Future { promise in api.getUser { promise($0) } } }
        .eraseToAnyPublisher()
}
```

**Say it:** "`Future` runs its work eagerly at creation and shares that one result with every subscriber; `Deferred` postpones creation until subscribe time, so I wrap callback-based work in `Deferred { Future { ... } }` when I need it to re-run per subscriber."
**Red flag:** Assuming a `Future` is lazy like other publishers. It fires the moment you construct it, before anyone subscribes — a classic Combine surprise.

### Subject vs Publisher — CurrentValueSubject and PassthroughSubject
**They ask:** "What's the difference between a Subject and a plain Publisher, and when do you reach for `CurrentValueSubject` versus `PassthroughSubject`?"

A plain `Publisher` only emits when something *inside it* produces a value — you can't push values into it from the outside. A **Subject** is a Publisher you can imperatively `.send()` values into, which is exactly what you need to bridge imperative code (delegate callbacks, UIKit target-action, KVO) into a Combine pipeline.

`PassthroughSubject` has no notion of "current value" — a late subscriber gets nothing until the next `send()`. `CurrentValueSubject` holds and replays its latest value to every new subscriber immediately, so it's the right fit for state that a view needs *right now*, not just future changes.

```swift
let statusSubject = CurrentValueSubject<Status, Never>(.idle)
statusSubject.send(.loading)

let tapSubject = PassthroughSubject<Void, Never>()
button.addTarget(self, action: #selector(tap), for: .touchUpInside)
@objc func tap() { tapSubject.send() }
```

**Say it:** "`CurrentValueSubject` replays its latest value to new subscribers, so I use it for state a view needs on appear; `PassthroughSubject` only forwards future events, which is right for one-off signals like a tap."
**Red flag:** Using `PassthroughSubject` for something like connection status and wondering why a late-subscribing view starts blank — it never replays, it only forwards.

### AnyPublisher type erasure and AnyCancellable lifetime
**They ask:** "Why do Combine APIs return `AnyPublisher`, and what does `AnyCancellable` actually manage?"

A publisher's concrete type is the *entire chain* of operators baked in — `Publishers.Map<Publishers.Filter<URLSession.DataTaskPublisher, ...>, ...>` — which leaks implementation detail into every call site and makes the type unstable as you add operators. `eraseToAnyPublisher()` boxes the chain behind `AnyPublisher<Output, Failure>`, giving callers a stable, readable interface — the same reason you return a protocol instead of a concrete generic type.

`AnyCancellable` is what actually keeps the subscription alive: Combine subscriptions are cancelled the moment their token is deallocated, so you must retain it — typically in a `Set<AnyCancellable>` or `.store(in:)`.

```swift
func fetchUsers() -> AnyPublisher<[User], Error> {
    urlSession.dataTaskPublisher(for: url)
        .map(\.data)
        .decode(type: [User].self, decoder: JSONDecoder())
        .eraseToAnyPublisher()
}

private var cancellables = Set<AnyCancellable>()
fetchUsers()
    .sink(receiveCompletion: { _ in }, receiveValue: { self.users = $0 })
    .store(in: &cancellables)
```

**Say it:** "I return `AnyPublisher` from public APIs so the operator chain's concrete type doesn't leak, and I always `.store(in:)` the `AnyCancellable` — the subscription dies the instant that token is deallocated."
**Red flag:** Assigning `.sink(...)` without storing the result. It compiles, runs once, then silently cancels on the next line because the returned `AnyCancellable` was never retained.

### Operators — map, flatMap, compactMap, filter, debounce, throttle
**They ask:** "Walk through Combine's core transform operators and the difference between `debounce` and `throttle`."

`map` transforms each value; `compactMap` transforms *and* drops `nil` results — the Combine equivalent of Swift's `Optional` filtering. `filter` drops values that fail a predicate without transforming survivors. `flatMap` is for when the transform itself returns a *publisher* — chaining a dependent async call — and it flattens the inner publisher's output into the outer stream, subscribing to (by default) all inner publishers concurrently.

```swift
searchText
    .debounce(for: .milliseconds(300), scheduler: DispatchQueue.main)
    .removeDuplicates()
    .flatMap { query in api.search(query).catch { _ in Just([]) } }
    .sink { self.results = $0 }
```

`debounce` and `throttle` both rate-limit, but for different UX intents: `debounce` waits for a *quiet period* after the last event then emits once — right for search-as-you-type, where you want the final settled value. `throttle` emits at most once per interval regardless of quiet periods — right for scroll or drag events where you want a steady sampling rate, not a final value.

**Say it:** "`debounce` waits for silence and fires once with the latest value — ideal for search; `throttle` samples at a fixed interval regardless of activity — ideal for scroll or drag events."
**Red flag:** Reaching for `throttle` on a search field. It'll fire mid-typing on a fixed cadence instead of waiting for the user to pause, which triggers wasted requests.

### Schedulers and combining streams — receive(on:), subscribe(on:), combineLatest, merge, zip
**They ask:** "What's the difference between `receive(on:)` and `subscribe(on:)`, and how do `combineLatest`, `merge`, and `zip` differ?"

Both control *which scheduler* a stage runs on, but at different points in the chain. `subscribe(on:)` moves where the *upstream work* — the subscription itself and everything before this operator — happens; useful to push a slow synchronous data source off the main thread. `receive(on:)` moves where *downstream* operators after it run, which is what you use to land the final `sink` back on `DispatchQueue.main` for UI updates.

```swift
dataSource.publisher
    .subscribe(on: DispatchQueue.global())
    .map(transform)
    .receive(on: DispatchQueue.main)
    .sink { self.label.text = $0 }
```

For combining multiple streams: `combineLatest` re-emits whenever *any* upstream publisher emits, pairing it with the latest value from the others — for "recompute validation whenever email or password changes." `zip` pairs values *positionally* — the nth value from each publisher — waiting until every stream has produced its nth element, useful for aligning parallel API calls. `merge` interleaves multiple publishers of the *same type* into a single stream in emission order, with no pairing at all.

**Say it:** "`subscribe(on:)` moves where the upstream work happens, `receive(on:)` moves where downstream operators run — I use the latter to land UI updates on main. For combining streams: `combineLatest` reacts to any change, `zip` pairs positionally, `merge` just interleaves."
**Red flag:** Putting `receive(on: .main)` right after the network call instead of at the end of the chain. Every operator after it now also runs on main, defeating the point of getting off the main thread in the first place.
