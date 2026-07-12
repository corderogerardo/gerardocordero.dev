# Concurrency Deep Dive (Flow, RxJava)

### Cold vs Hot Streams — Flow and RxJava
**They ask:** "What's the difference between cold and hot observables/flows?"

A **cold** stream (`Flow`, RxJava's `Observable.create`) runs its producer code fresh for *each* collector — nothing happens until someone subscribes, and two collectors get two independent executions, potentially two independent network calls. A **hot** stream (`StateFlow`/`SharedFlow`, RxJava's `Subject`/`ConnectableObservable`) has a producer that runs independently of any collector — it emits whether or not anyone's listening, and multiple collectors share the *same* emissions from whenever they subscribed.

```kotlin
val cold = flow { emit(api.fetchUser()) }        // runs the network call again for every collect()
val hot = MutableStateFlow<User?>(null)          // all collectors share the same value/updates
```

The senior distinction that trips people up: a cold stream re-executing per collector is usually what you want for a one-shot request (no accidental request sharing), but it's the wrong choice for something like "current auth state" that every screen should observe *without* re-triggering the work that produced it — that's what hot streams are for.

**Say it:** "Cold streams re-run their producer for every collector — right for one-shot work like a network call — hot streams run independently and every collector shares the same emissions, which is what you want for shared state like auth or connectivity."
**Red flag:** Using a cold `Flow` for shared UI state observed from multiple screens. Every screen collecting it re-triggers the producer independently — that's duplicate work where a `StateFlow` would share one source of truth.

### StateFlow and SharedFlow vs LiveData
**They ask:** "What are the alternatives to LiveData, and how do StateFlow and SharedFlow differ from it?"

`LiveData` is Android-only, lifecycle-aware by default, and always has a value (nullable) after creation. `StateFlow`/`SharedFlow` are pure-Kotlin coroutines constructs — no Android dependency, so they're testable and usable in shared/multiplatform code, but *not* lifecycle-aware on their own; collecting one in an Activity without scoping the collection to the lifecycle (`repeatOnLifecycle(STARTED)`) keeps collecting even while the screen is backgrounded, which `LiveData` never does.

`StateFlow` is the closer analog to `LiveData`: it always holds a current value, requires an initial value at construction, and only emits distinct-by-equality updates. `SharedFlow` is more general — no required current value, configurable replay count, and it *can* emit duplicate consecutive values (useful for one-shot events, which is a case `StateFlow`'s "current value" semantics handle awkwardly).

```kotlin
val uiState: StateFlow<UiState> = _uiState.asStateFlow()

lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.uiState.collect { render(it) }   // manual lifecycle-awareness, StateFlow doesn't give it for free
    }
}
```

**Say it:** "StateFlow/SharedFlow drop the Android dependency LiveData carries, which is great for testability and shared code, but they're not lifecycle-aware by default — I have to wrap collection in `repeatOnLifecycle` myself to get what LiveData gave for free."
**Red flag:** Collecting a `StateFlow` directly inside `onCreate` with a plain `lifecycleScope.launch` and no `repeatOnLifecycle`. That keeps the collector active even when the screen is stopped, doing wasted work and potentially crashing on a stale-View update.

### Flow Operators vs RxJava's flatMap Family
**They ask:** "What's the relationship between Flow's `flatMapLatest`/`flatMapConcat`/`flatMapMerge` and RxJava's `flatMap`, `concatMap`, `switchMap`?"

Both ecosystems solve the same problem — you have a stream of streams (each upstream item produces a new inner stream) and need to flatten it into one — but differ in which inner stream's emissions actually make it through when a new upstream item arrives before the previous inner stream finishes.

`flatMapConcat` (Flow) / `concatMap` (RxJava): runs inner streams **sequentially**, queuing the next until the current fully completes — preserves order, but a slow inner stream blocks everything behind it. `flatMapMerge` (Flow) / `flatMap` (RxJava): runs inner streams **concurrently**, interleaving whatever completes first — highest throughput, but no ordering guarantee. `flatMapLatest` (Flow) / `switchMap` (RxJava): **cancels** the previous inner stream the moment a new upstream item arrives — the standard choice for "only the latest search query's result matters."

```kotlin
searchQueryFlow
    .flatMapLatest { query -> api.searchFlow(query) }   // cancels the in-flight search on every new keystroke
    .collect { results -> render(results) }
```

**Say it:** "The three variants are the same idea in both ecosystems — sequential-preserve-order, concurrent-max-throughput, or cancel-and-take-latest — `flatMapLatest`/`switchMap` is the one to reach for on search-as-you-type, since a stale in-flight request should never win over a newer one."
**Red flag:** Using `flatMapMerge`/`flatMap` for a search-as-you-type box. Without cancellation, a slow response to an old query can arrive after a fast response to a newer one and overwrite the correct result on screen.

### RxJava Schedulers — subscribeOn vs observeOn
**They ask:** "What's the difference between `subscribeOn` and `observeOn`? What happens if you call either multiple times in a chain?"

`subscribeOn` controls which thread the *source* — the upstream emission logic itself — runs on; it only takes effect once regardless of where in the chain you place it, because there's only one subscription point to affect. `observeOn` controls which thread *everything downstream of it* runs on, and it can be called multiple times — each call switches the thread for operators after that point in the chain, letting you do work on IO, then switch to computation, then switch to main for the final UI update.

```kotlin
api.fetchUser()
    .subscribeOn(Schedulers.io())        // source runs on IO — only the first call matters
    .map { it.toDomain() }               // still on IO
    .observeOn(AndroidSchedulers.mainThread())
    .subscribe { updateUi(it) }          // this runs on main
```

Calling `subscribeOn` more than once in a chain is effectively a no-op past the first call — only the one closest to the source (the first one Rx encounters at subscription time) has any effect, which surprises people expecting the *last* call to win, since that's how most other chained configuration works.

**Say it:** "`subscribeOn` picks the source's thread and only the first occurrence in the chain matters; `observeOn` switches everything downstream and can be called repeatedly to hop threads multiple times in one chain — that asymmetry is the thing people get backwards."
**Red flag:** Calling `subscribeOn` twice expecting the second call to override the first, the way a builder pattern usually works. Only the first `subscribeOn` Rx encounters has any effect — the rest are silently ignored.

### RxJava Subjects and Relays
**They ask:** "What types of Subject exist? What is a Relay, and how does it differ from a Subject?"

A `Subject` is both an `Observer` and an `Observable` — it can receive emissions (`onNext`) and re-emit them to its own subscribers, making it RxJava's hot, mutable stream. `PublishSubject` emits only what happens after subscription (no replay). `BehaviorSubject` replays the most recent value to a new subscriber (closest to `StateFlow`'s current-value semantics). `ReplaySubject` replays some or all prior emissions to every new subscriber. `AsyncSubject` only emits the *last* value, and only on completion.

```kotlin
val subject = BehaviorSubject.createDefault(0)
subject.subscribe { println(it) }   // gets 0 immediately, then every subsequent onNext
subject.onNext(1)
```

The catch with any `Subject` is that it also exposes `onComplete`/`onError` — calling either terminates the subject for *all* current and future subscribers, which is rarely what you want for a long-lived UI event bus. A `Relay` (from RxRelay) is deliberately the subset of a Subject that can't terminate — it has `accept()` instead of `onNext()` and no `onComplete`/`onError` at all, which is exactly the safer shape for something like a UI event bus that should never accidentally get shut down by a stray error.

**Say it:** "Subjects are hot streams that differ in what a late subscriber gets — nothing, the last value, full replay, or only the terminal value — and Relays exist specifically because a Subject's `onError`/`onComplete` can permanently kill a long-lived bus, which is a footgun for something like a UI event stream."
**Red flag:** Using a plain `PublishSubject` as an app-wide event bus without considering that any accidental `onError` call anywhere terminates it for every subscriber, permanently. That's precisely the failure mode Relay was built to eliminate.

### RxJava Backpressure and Flowable
**They ask:** "Where does backpressure come from? What is Flowable, and what strategies exist for handling it?"

Backpressure is what happens when a source emits faster than a downstream operator (or the actual consumer, like updating a view) can process — without a bound, that mismatch means emissions pile up in an unbounded internal buffer, and can OOM the app. It typically comes up with fast-producing sources: reading from a file, a high-frequency sensor, or an `observeOn` boundary where the downstream thread is genuinely slower than upstream production.

`Observable` has no backpressure support at all — it assumes the consumer can keep up. `Flowable` is RxJava's backpressure-aware type: it implements the Reactive Streams spec, where the *consumer* requests how many items it wants (`request(n)`), so the producer can throttle itself instead of blindly pushing.

```kotlin
Flowable.range(1, 1_000_000)
    .onBackpressureBuffer(1000)   // bound the buffer instead of letting it grow unbounded
    .observeOn(Schedulers.computation())
    .subscribe { process(it) }
```

The strategies differ in what they sacrifice when the buffer would overflow: `BUFFER` queues everything (bounded or unbounded — risks OOM if unbounded), `DROP` discards new items that don't fit, `LATEST` keeps only the most recent item and drops the rest, `ERROR` fails the stream loudly instead of silently losing data.

**Say it:** "Backpressure is what happens when the source outproduces the consumer — `Observable` has no answer for it, `Flowable` does via consumer-driven `request(n)`, and the strategy I pick (`BUFFER`/`DROP`/`LATEST`/`ERROR`) is really a decision about what's acceptable to lose when the mismatch happens, not a technicality."
**Red flag:** Reaching for `Flowable` by default "just in case," on a stream that only ever emits a handful of UI events. Backpressure machinery has real overhead — it earns its place on genuinely fast/unbounded sources, not general-purpose UI streams.

### RxJava Disposables and Memory
**They ask:** "What's the relationship between Observer, Subscriber, Disposable, and Subscription — do you always need to unsubscribe, and what goes wrong if you don't?"

`Observer` is the `Observable` API's consumer interface (`onNext`/`onError`/`onComplete`); `Subscriber` is the equivalent for `Flowable` (Reactive Streams spec), adding backpressure's `onSubscribe(Subscription)` where `Subscription.request(n)` pulls items. `Disposable` (Observable side) and `Subscription` (Flowable side) are both the handle you use to cancel an in-flight stream — calling `.dispose()`/`.cancel()` tells the source to stop emitting and release any resources it's holding.

```kotlin
class MyPresenter {
    private val disposables = CompositeDisposable()

    fun load() {
        disposables.add(repo.getUser().subscribe { view.show(it) })
    }
    fun onDestroy() { disposables.clear() }   // cancels every in-flight subscription at once
}
```

Yes, you effectively always need to dispose — an un-disposed subscription tied to a View or Presenter keeps that reference alive for as long as the stream is active, which for a slow network call or infinite stream means a real memory leak, and can also deliver a result to a destroyed View and crash. `CompositeDisposable` is the standard pattern: add every subscription to it, `.clear()` it in `onDestroy`/`onCleared`, one call instead of tracking each disposable by hand.

**Say it:** "Disposable/Subscription are the cancel handles for Observable/Flowable respectively, and skipping disposal isn't a style choice — it keeps the subscriber alive for the stream's whole lifetime, which is a leak on a slow call and a crash risk if it delivers to a destroyed View."
**Red flag:** Subscribing inside a Fragment or Activity without adding the resulting `Disposable` to a `CompositeDisposable` cleared in the teardown lifecycle method. That's the single most common RxJava-on-Android leak.

### Coroutines vs RxJava — Choosing a Concurrency Model
**They ask:** "When would you choose coroutines over RxJava, or vice versa, on a real project?"

The honest answer is that they solve overlapping but not identical problems, and the choice is rarely "which is objectively better." Coroutines (with `Flow`) are built into the Kotlin language and standard library — no extra dependency, tighter integration with `suspend` functions, structured concurrency and cancellation is the default behavior rather than something you opt into, and the mental model (sequential-looking code that suspends) is generally easier to onboard a team onto.

RxJava has a much larger, more mature operator vocabulary for complex stream composition (backpressure strategies, a wider family of `Subject`s, decades of battle-tested operators for combining/throttling/retrying streams) and remains dominant in codebases that predate widespread coroutine adoption — rewriting a large, working RxJava data layer to Flow purely for its own sake is rarely worth the risk versus the benefit.

```kotlin
// coroutines: reads like sequential code, cancellation is structural
suspend fun loadDashboard() = coroutineScope {
    val user = async { fetchUser() }
    val posts = async { fetchPosts() }
    Dashboard(user.await(), posts.await())
}
```

**Say it:** "New projects default to coroutines/Flow because it's built into the language with structured cancellation by default and a gentler learning curve — RxJava earns its keep on an existing large stream-heavy codebase, or when you specifically need its deeper backpressure and operator vocabulary; migrating a working RxJava layer for its own sake usually isn't worth the churn."
**Red flag:** Treating this as a "coroutines are strictly better, always migrate" question. On a mature RxJava codebase the migration risk and cost is a real engineering trade-off, not a foregone conclusion — the senior answer weighs it, it doesn't default to a rewrite.
