# Concurrency — GCD, Structured Concurrency, Actors

### GCD Fundamentals
**They ask:** "Walk me through Grand Central Dispatch — sync vs async, queues, and QoS."

GCD exists so you never manage OS threads by hand — you describe *work* (a closure) and *where* it should run (a queue), and the system's thread pool handles scheduling. The `sync`/`async` choice is about whether the calling thread blocks: `async` submits the work and returns immediately; `sync` blocks the caller until the work finishes — which is exactly how you deadlock yourself if you `sync`-dispatch onto the same serial queue you're already running on.

```swift
DispatchQueue.global(qos: .userInitiated).async {
    let result = expensiveWork()
    DispatchQueue.main.async {                 // hop back to the UI thread to update UI
        self.label.text = result
    }
}
```

Queues come in two flavors: **serial** (one task at a time, FIFO — the main queue is serial) and **concurrent** (multiple tasks in parallel, order not guaranteed). QoS (`.userInteractive`, `.userInitiated`, `.default`, `.utility`, `.background`) tells the system how urgently to schedule the work relative to everything else competing for CPU — it's a priority hint, not a hard guarantee.

**Say it:** "`async` never blocks the caller, `sync` always does — and the QoS class is how I tell the scheduler this work is user-blocking versus can wait, not just a label."
**Red flag:** Calling `DispatchQueue.main.sync` from the main thread, or `sync`-dispatching a task onto the same serial queue you're currently executing on — both deadlock instantly.

### Structured Concurrency: async/await and Task
**They ask:** "What does structured concurrency actually give you over completion-handler closures?"

Structured concurrency ties a unit of async work to a parent scope, so cancellation, error propagation, and lifetime are automatic instead of something you wire by hand. A completion-handler callback has no relationship to the code that spawned it — nothing cancels it when the caller goes away, and errors either get silently swallowed or threaded through an `(Result<T, Error>) -> Void` by convention. `async`/`await` collapses that into linear, readable code the compiler can reason about.

```swift
func loadProfile() async throws -> Profile {
    async let user = fetchUser()          // starts concurrently
    async let posts = fetchPosts()        // starts concurrently
    return try await Profile(user: user, posts: posts)   // awaits both
}

Task {
    do {
        let profile = try await loadProfile()
        self.render(profile)
    } catch {
        self.showError(error)
    }
}
```

`Task { }` is the entry point from synchronous code into the async world — it inherits the current actor context and priority by default. `await` is a *suspension point*: the calling thread is freed to do other work while waiting, which is the fundamental difference from GCD, where a blocked thread is just gone until the work finishes.

**Say it:** "Structured concurrency ties an async task's lifetime, cancellation, and error propagation to its parent scope automatically — that's what a detached completion-handler callback never gave you."
**Red flag:** Calling `async`/`await` "just cleaner GCD syntax." The syntax is the smallest part of it — cancellation propagation and suspension-not-blocking are the actual architectural change.

### Multithreading Pitfalls
**They ask:** "Name the classic multithreading bugs — deadlock, race condition, data race, priority inversion — and how each one actually manifests."

These get confused constantly, so precision here is a real signal. A **race condition** is a bug where the *outcome* depends on timing — two operations that should be ordered aren't. A **data race** is the specific, more dangerous case where two threads access the same memory concurrently and at least one is a write, with no synchronization — Swift's Thread Sanitizer catches this category specifically because it's undefined behavior, not just "wrong answer sometimes." A **deadlock** is two (or more) threads each waiting on a resource the other holds, so neither ever proceeds. **Priority inversion** is a low-priority thread holding a lock a high-priority thread needs, while a *medium*-priority thread preempts the low-priority one — so the high-priority thread waits behind a task priority-scheduling should never have let ahead of it. **Livelock** is threads actively responding to each other but never making progress, like two people repeatedly stepping the same direction to avoid colliding in a hallway.

```swift
var counter = 0
DispatchQueue.global().async { counter += 1 }   // data race: unsynchronized concurrent write
DispatchQueue.global().async { counter += 1 }
```

**Say it:** "A data race is concurrent unsynchronized access with a write involved — undefined behavior, not just a wrong number — while a deadlock is mutual waiting and priority inversion is a scheduling-priority bug, not a correctness bug."
**Red flag:** Using "race condition" and "data race" interchangeably. A race condition can be a logic bug with no memory hazard at all; a data race is specifically about unsynchronized memory access.

### GCD Advanced: DispatchGroup and DispatchWorkItem
**They ask:** "How do you know when several independent async GCD calls have all finished?"

`DispatchGroup` solves the "wait for N independent async operations" problem without nesting completion handlers. You `enter()` before each unit of work and `leave()` when it finishes; `notify(queue:)` fires once the enter/leave count balances back to zero — it's the GCD-era answer to what `async let` does natively in structured concurrency today.

```swift
let group = DispatchGroup()
let syncQueue = DispatchQueue(label: "images.sync")   // serial: one writer at a time
var images: [UIImage] = []

for url in urls {
    group.enter()
    download(url) { image in           // callbacks may fire concurrently
        syncQueue.async {
            images.append(image)        // serialized — no data race on the array
            group.leave()               // leave AFTER the append lands
        }
    }
}
group.notify(queue: syncQueue) {        // read the array on the same serial queue
    let snapshot = images
    DispatchQueue.main.async { self.render(snapshot) }
}
```

The append is the subtle part: `download` completions can run in parallel, so mutating the shared `images` array directly is a data race. Funnel every write through one **serial queue**, call `leave()` *inside* that queue so the count only balances once the append is committed, and read the array back on the same queue before hopping to main to render.

`DispatchWorkItem` wraps a closure as a cancellable, observable object instead of a bare closure — you can check `isCancelled` inside the work, cancel it before it runs, or chain a `notify` onto its completion, which a plain closure passed to `.async` can't do.

**Say it:** "`DispatchGroup` balances `enter`/`leave` across independent async work and fires `notify` once they're all done — but shared mutable results still need their own serialization, so I funnel the appends through a serial queue and `leave()` from inside it."
**Red flag:** Appending to a shared array straight from concurrent completion handlers — that's an unsynchronized write, i.e. a data race. Also forgetting a `leave()` on an error path, which leaves the count unbalanced so `notify` never fires.

### OperationQueue vs GCD
**They ask:** "When do you reach for `OperationQueue` over raw GCD?"

`OperationQueue` (backed by `Operation`/`NSOperation`) is a higher-level abstraction over GCD that adds the things GCD doesn't give you natively: **dependencies** between units of work (`operationB.addDependency(operationA)`), **cancellation** you can check from inside the running operation, **KVO-observable state** (`isExecuting`, `isFinished`), and **re-usable, subclassable work objects** instead of one-shot closures. GCD is the leaner, lower-level tool — reach for it for a simple "run this off the main thread" or "batch these and wait."

```swift
let queue = OperationQueue()
let fetch = BlockOperation { self.fetchData() }
let parse = BlockOperation { self.parseData() }
parse.addDependency(fetch)          // parse won't start until fetch finishes
queue.addOperations([fetch, parse], waitUntilFinished: false)
```

The rule of thumb: GCD for simple, fire-and-forget or grouped async work; `OperationQueue` when you need a real dependency graph, need to cancel in-flight work cleanly, or want `maxConcurrentOperationCount` to throttle parallelism explicitly.

**Say it:** "GCD is the low-level primitive; `OperationQueue` adds dependencies, cancellation, and observable state on top of it — I reach for `Operation` the moment I need a real dependency graph or clean mid-flight cancellation."
**Red flag:** Building a manual dependency chain of nested GCD closures when `addDependency` would express the same thing declaratively and cancel cleanly.

### Thread Safety APIs
**They ask:** "What are your options for protecting shared mutable state, from `NSLock` to `os_unfair_lock`?"

Every one of these solves "only one thread touches this at a time," but they trade off overhead and semantics. `NSLock`/`NSRecursiveLock` are the simplest Foundation locks — recursive lets the *same* thread re-acquire without deadlocking itself, useful for recursive functions that touch protected state. A **semaphore** (`DispatchSemaphore`) generalizes a lock to allow *N* concurrent accessors, not just one — useful for throttling concurrent network requests to a fixed pool size. A **barrier** (`DispatchQueue.concurrentPerform` combined with `.async(flags: .barrier)`) lets a concurrent queue run reads in parallel but forces a write to run alone with no concurrent readers — the reader-writer pattern. `os_unfair_lock`/`OSAllocatedUnfairLock` are the lowest-overhead, kernel-level locks, replacing the now-deprecated `OSSpinLock` (which caused priority inversion under contention). Swift's `actor` is the modern, compiler-enforced alternative to all of these for isolating state.

```swift
private let lock = NSLock()
private var cache: [String: Data] = [:]

func read(_ key: String) -> Data? {
    lock.lock(); defer { lock.unlock() }
    return cache[key]
}
```

**Say it:** "For new code I reach for `actor` first — for existing GCD code, barriers give reader/writer concurrency and `OSAllocatedUnfairLock` is the low-overhead lock now that `OSSpinLock` is deprecated for causing priority inversion."
**Red flag:** Reaching for `OSSpinLock` in new code — it's deprecated specifically because spinning under priority inversion could starve higher-priority threads indefinitely.

### async let and TaskGroup
**They ask:** "How do you run several async operations concurrently and wait for all of them?"

`async let` is for a **fixed, known number** of concurrent child tasks — you bind each to a name, and every one starts running immediately without needing `await` yet; you only suspend when you actually `await` the value. `TaskGroup` (via `withTaskGroup`) is for a **dynamic** number — spawned in a loop — where you don't know the count until runtime, and you collect results as each child finishes.

```swift
// async let: fixed count, known at compile time
async let user = fetchUser()
async let posts = fetchPosts()
let profile = try await Profile(user: user, posts: posts)

// TaskGroup: dynamic count
func fetchAll(ids: [Int]) async throws -> [User] {
    try await withThrowingTaskGroup(of: User.self) { group in
        for id in ids { group.addTask { try await fetchUser(id) } }
        var results: [User] = []
        for try await user in group { results.append(user) }
        return results
    }
}
```

Both are structured: if the parent task is cancelled, every child task is cancelled too, and if one child throws in a `withThrowingTaskGroup`, the others are cancelled automatically — that automatic propagation is the entire value proposition over manually managing a `DispatchGroup`.

**Say it:** "`async let` is for a known, fixed set of concurrent children; `TaskGroup` is for a dynamic count — both are structured, so a parent cancellation or a thrown error cancels every sibling automatically."
**Red flag:** Reaching for a loop of sequential `await` calls when the operations are actually independent — that serializes work that should run concurrently.

### Actors and MainActor
**They ask:** "What is an actor, and how does `@MainActor` fit in?"

An `actor` is a reference type that the compiler guarantees is accessed by only one task at a time — it serializes access to its mutable state automatically, so you get thread safety without hand-rolling a lock. Calling a method or reading a property on an actor from *outside* it requires `await`, because the compiler has to potentially wait for the actor's serial executor to be free; calling from *inside* the actor's own methods doesn't need `await` since you're already isolated.

```swift
actor ImageCache {
    private var storage: [URL: UIImage] = [:]
    func image(for url: URL) -> UIImage? { storage[url] }
    func store(_ image: UIImage, for url: URL) { storage[url] = image }
}

let cache = ImageCache()
let img = await cache.image(for: url)   // await required — crossing an actor boundary
```

`@MainActor` is a *specific*, built-in global actor tied to the main thread — annotate a type, property, or function with it and the compiler guarantees that code only ever runs on the main thread, which is exactly the guarantee UIKit/SwiftUI need. It replaces the old "did I remember to `DispatchQueue.main.async` this UI update" discipline with a compile-time check.

**Say it:** "An actor serializes access to its own state so the compiler — not a lock I wrote by hand — guarantees thread safety; `@MainActor` is the same mechanism specialized to guarantee 'this only runs on the main thread.'"
**Red flag:** Marking an entire large type `@MainActor` "to make the concurrency warnings go away" instead of isolating only the UI-touching parts — that silently forces unrelated work onto the main thread.

### Task Lifecycle: Priority, Detached, Cancellation
**They ask:** "What's the difference between `Task { }` and `Task.detached { }`, and how does cancellation actually work?"

`Task { }` inherits context from where it's created — the current actor isolation, priority, and task-local values. `Task.detached { }` starts a brand-new, top-level task with none of that inherited context — no actor isolation, no inherited priority unless specified. Detached tasks are the exception, not the default: reach for one only when you deliberately want to escape the current context, like firing genuinely independent background work from a `@MainActor` method.

```swift
Task(priority: .userInitiated) {
    guard !Task.isCancelled else { return }
    let data = try await fetchData()
    self.render(data)          // still on the calling actor's context
}
```

Cancellation in Swift concurrency is **cooperative** — calling `task.cancel()` doesn't forcibly stop anything, it just flips a flag. Long-running work has to check `Task.isCancelled` (or call `try Task.checkCancellation()`, which throws `CancellationError`) at reasonable points itself. Many system APIs (`URLSession`, `Task.sleep`) already check this internally and throw `CancellationError` for you.

**Say it:** "Cancellation is cooperative — I have to check `Task.isCancelled` or call `checkCancellation()` at real checkpoints, because calling `cancel()` only flips a flag, it doesn't interrupt anything by itself."
**Red flag:** Assuming `task.cancel()` immediately stops the work. It's advisory — code that never checks the flag just keeps running to completion.

### AsyncSequence and AsyncStream
**They ask:** "What is `AsyncSequence`, and when do you reach for `AsyncStream`?"

`AsyncSequence` is the async analog of `Sequence` — instead of a synchronous `next()`, its iterator's `next()` is `async`, so you can `for try await` over a source that produces values over time instead of all at once. It's the natural fit for anything that used to be a delegate callback or Combine publisher: incoming WebSocket frames, location updates, notification streams.

```swift
for try await line in url.lines {           // Foundation ships AsyncSequence conformances
    process(line)
}

let stream = AsyncStream<Int> { continuation in
    var count = 0
    let timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
        continuation.yield(count)
        count += 1
    }
    continuation.onTermination = { _ in timer.invalidate() }
}
```

`AsyncStream` is how you *build* one from a push-based, non-async source — you get a `continuation` and call `.yield(value)` whenever a new value is available, and `.finish()` when the source is done. It's the structured-concurrency bridge for exactly the delegate-callback and closure-based APIs that predate `async`/`await`.

**Say it:** "`AsyncSequence` is `for try await` over values that arrive over time; `AsyncStream` is how I wrap a push-based API — a delegate callback, a timer — into one, using `continuation.yield` instead of a completion handler."
**Red flag:** Forgetting `onTermination` on an `AsyncStream` wrapping a resource like a timer or observer — the underlying resource keeps running even after consumers stop iterating.

### Sendable, TaskLocal, and Nonisolated
**They ask:** "What does `Sendable` actually check, and what's `nonisolated` for?"

`Sendable` is a marker protocol the compiler uses to verify a type is safe to pass across concurrency boundaries — into a `Task`, across an actor call, into a `TaskGroup` child. A value type with only `Sendable` members is automatically safe (a copy crossing the boundary can't create a data race); a class needs to prove its own thread safety (immutable, or internally locked) to conform, and the compiler will flag a mutable class crossing an actor boundary as a real compile-time error, not a runtime crash waiting to happen.

```swift
struct UserDTO: Sendable { let id: Int; let name: String }   // auto-Sendable: all members are

actor Store {
    nonisolated let id: UUID = UUID()   // safe to read without `await` — never mutates, no isolation needed
    var items: [String] = []             // actor-isolated — needs await from outside
}
```

`nonisolated` marks a member of an actor as *not* needing actor isolation — typically a truly immutable `let` — so it can be accessed without `await` from outside. `@TaskLocal` is Swift's structured-concurrency answer to thread-local storage: a value bound for the duration of a task tree (commonly used for request IDs or tracing context) that's automatically inherited by child tasks without manual threading.

**Say it:** "`Sendable` is the compiler's proof that a value can safely cross an actor or task boundary — a mutable class crossing unchecked is exactly the class of bug the concurrency checker exists to catch at compile time instead of in production."
**Red flag:** Silencing a `Sendable` warning with `@unchecked Sendable` without actually verifying the type's thread safety — that's disabling the safety net, not satisfying it.

### Testing Async Code
**They ask:** "How do you write a reliable XCTest for an `async` function?"

`XCTest`'s test functions can themselves be `async`, so you `await` the code under test directly instead of the old expectation-and-`waitForExpectations` dance needed for completion-handler APIs — that dance is exactly what structured concurrency removes from your test code too.

```swift
func testLoadProfile() async throws {
    let profile = try await sut.loadProfile()
    XCTAssertEqual(profile.name, "Ada")
}
```

For code that still uses callbacks or Combine internally, `XCTestExpectation` remains the tool — `fulfillment(of:timeout:)` is the modern, async-native way to await an expectation instead of the older blocking `wait(for:timeout:)`. The harder case is testing actor-isolated or `@MainActor` code from a test: your test function needs to be `async` (and possibly `@MainActor`-isolated itself) to call into it without a compiler error, which is the concurrency checker doing its job across test boundaries too.

**Say it:** "Async test functions let me `await` the code under test directly — `XCTestExpectation` is still there for callback-based code, but `fulfillment(of:timeout:)` is the async-native replacement for the old blocking `wait`."
**Red flag:** Wrapping an `async` API back into a `DispatchSemaphore.wait()` inside a test to make it "synchronous" — that reintroduces the exact deadlock risk structured concurrency was designed to remove.
