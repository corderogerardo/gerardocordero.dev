// Android (Kotlin) interview deck. Typed data is the source of truth — edit directly.
// Same shape as the iOS and React Native decks: RN-renderable markup only (inline
// `code`, **bold**, blank-line paragraphs, "- " bullets), NEVER HTML.
import type { Subject } from "../types";

export const androidSubject: Subject = {
  "id": "android",
  "label": "Android (Kotlin)",
  "short": "Android",
  "blurb": "Kotlin, coroutines, Compose, lifecycle & performance.",
  "cards": [
    {
      "id": "android-kotlin-1",
      "category": "kotlin",
      "categoryLabel": "KOTLIN LANGUAGE",
      "question": "How does Kotlin's null safety work? When do you reach for `?.`, `?:`, `let`, and why is `!!` a code smell?",
      "answer": "Kotlin splits every type into a non-null (`String`) and a nullable (`String?`) variant, so the compiler forces you to handle absence instead of crashing with an NPE at runtime — nullability is in the type system, not a convention.\n\nMy toolkit:\n\n- Safe-call `?.` short-circuits a whole chain to `null` (`user?.profile?.avatarUrl`) instead of nesting checks.\n- Elvis `?:` supplies a default or an early exit: `val name = raw ?: return`.\n- `value?.let { ... }` runs a block only when the value is non-null, and smart-casts it to non-null inside.\n\nThe not-null assertion `!!` is a smell because it asserts the value is never null and **throws** an NPE if you are wrong — it trades a compile-time guarantee for a runtime crash.\n\n- Red flag: reaching for `!!` to silence a compiler warning instead of handling the null case — that just moves the crash from the compiler to production.\n\n**I only use `!!` for genuine invariants, never for data coming from the network, intents, or platform calls.** The senior nuance is **platform types** (`String!`) coming from Java: Kotlin can't see Java's nullability, so it trusts you — annotate Java with `@Nullable`/`@NonNull` or guard at the boundary.",
      "level": "mid"
    },
    {
      "id": "android-kotlin-2",
      "category": "kotlin",
      "categoryLabel": "KOTLIN LANGUAGE",
      "question": "`val` vs `var`, and is a Kotlin `List` actually immutable?",
      "answer": "`val` binds a name once (a read-only reference); `var` is reassignable. I default to `val` everywhere — it removes a class of bugs by making accidental reassignment a compile error, and it signals intent.\n\nThe trap is that `val` freezes the **reference**, not the object: `val list = mutableListOf(1)` still lets you call `list.add(2)`. And a `List<T>` is **read-only, not immutable** — it has no mutating methods, but the underlying object may still be a `MutableList` someone else holds and changes under you. For true immutability you copy into something nobody else references, or use a persistent/immutable collection.\n\n`const val` is the stricter form: a compile-time constant, allowed only for primitives and `String` at the top level or in an `object`, inlined at the call site — unlike a regular `val`, which is computed at runtime.\n\n**`val` only guarantees the reference can't be reassigned — it says nothing about whether the object behind it can mutate.**",
      "level": "mid"
    },
    {
      "id": "android-kotlin-3",
      "category": "kotlin",
      "categoryLabel": "KOTLIN LANGUAGE",
      "question": "What does a `data class` generate for you, and what is the one equality gotcha?",
      "answer": "Marking a class `data` makes the compiler synthesize `equals`, `hashCode`, `toString`, `componentN` (for destructuring), and `copy` from the **primary-constructor properties**. So you get value-style equality, readable logging, and `val updated = state.copy(loading = false)` for cheap immutable updates — exactly what you want for UI state and DTOs.\n\nThe gotcha: only properties declared in the **primary constructor** participate in `equals`/`hashCode`. A property declared in the class body is ignored — two instances that differ only in a body property compare equal, which silently breaks set membership and `DiffUtil`. Keep identity-bearing fields in the constructor.\n\nNuance: destructuring is **positional**, not by name (`val (id, name) = user`), so reordering constructor properties is a source-compatible change that quietly breaks every destructuring call site.\n\n- Red flag: adding a field to a data class's body instead of its primary constructor and assuming it's covered by `equals`/`hashCode` — it silently isn't, and `DiffUtil`/set membership breaks quietly.\n\n**Every identity-bearing field belongs in the primary constructor — that's the only place `equals`, `hashCode`, and `copy` look.**",
      "level": "mid"
    },
    {
      "id": "android-kotlin-4",
      "category": "kotlin",
      "categoryLabel": "KOTLIN LANGUAGE",
      "question": "What problem do `sealed class` / `sealed interface` solve, and how do they differ from an `enum`?",
      "answer": "A sealed type fixes a **closed set of subtypes known at compile time**, all in the same module. That lets a `when` over it be **exhaustive without an `else`** — and the moment you add a new subtype, every `when` that lacks the new branch becomes a compile error. That compiler-enforced completeness is the whole point: it makes illegal states unrepresentable and turns model growth into a checklist.\n\nThe canonical use is UI state: `sealed interface UiState { object Loading; data class Success(val items: List<Item>); data class Error(val msg: String) }`. Each case carries its own payload, and you can't have items and an error at once.\n\nVersus an `enum`: enum constants are a fixed set of **singletons** that all share the same fields, so they can't carry per-case data of different shapes. Reach for `enum` for simple flags, `sealed` when each case needs a distinct payload. `sealed interface` is the modern default — it allows multiple inheritance and lets `object`s and `data class`es from different files participate.\n\n**Reach for `sealed` the moment two cases need different payloads; an `enum` only works while every case shares the same shape.**",
      "level": "senior"
    },
    {
      "id": "android-kotlin-5",
      "category": "kotlin",
      "categoryLabel": "KOTLIN LANGUAGE",
      "question": "How do extension functions resolve, and what is the senior gotcha about dispatch? Also: when do you use the scope functions?",
      "answer": "An extension function is **syntactic sugar over a static method** that takes the receiver as a hidden first argument. It does not actually add anything to the class, so it resolves **statically, on the declared (compile-time) type of the receiver** — not polymorphically. If a base and a subtype both have an extension with the same signature, the one chosen depends on the variable's static type, not the runtime object. A member function always wins over an extension with the same signature.\n\nThe five scope functions differ on two axes — how they refer to the receiver (`this` vs `it`) and what they return (the receiver vs the lambda result):\n\n- `let` — `it`, returns lambda result. Null-guarding and transforming: `value?.let { transform(it) }`.\n- `run` / `with` — `this`, returns lambda result. Compute over an object.\n- `apply` — `this`, returns the receiver. Configure-and-return: builder-style setup.\n- `also` — `it`, returns the receiver. Side effects like logging in a chain.\n\n**Extension resolution is static: call through the base type and you get the base type's extension, even when the object underneath is the subtype — only member functions dispatch polymorphically.**",
      "level": "senior"
    },
    {
      "id": "android-kotlin-6",
      "category": "kotlin",
      "categoryLabel": "KOTLIN LANGUAGE",
      "question": "Explain declaration-site variance (`out` / `in`) and `reified` generics in Kotlin.",
      "answer": "Generics are invariant by default: a `Box<Cat>` is **not** a `Box<Animal>` even though `Cat` is an `Animal`, because that would be unsafe if you could write into it. Kotlin fixes this at the **declaration site** with variance annotations:\n\n- `out T` (covariance) — the type only ever appears in **output** position (return types). `List<out E>` means a `List<Cat>` is a `List<Animal>`. Producers.\n- `in T` (contravariance) — the type only appears in **input** position (parameters). A `Comparable<Animal>` is a `Comparable<Cat>`. Consumers.\n\nThis is the classic producer-out, consumer-in (PECS) rule, enforced once on the type rather than at every use site. At a use site you can also write `out`/`in` projections.\n\n`reified` solves type erasure: normally a generic type argument is erased at runtime, so you can't write `T::class` or `is T`. Marking a function `inline` and its parameter `reified` makes the compiler substitute the concrete type into the call, so `inline fun <reified T> Gson.fromJson(s: String): T` and `is T` checks work. It only works on `inline` functions.\n\n**Producers go out, consumers go in — that's the whole PECS rule, enforced once at the declaration instead of at every call site.**",
      "level": "senior"
    },
    {
      "id": "android-coroutines-1",
      "category": "coroutines",
      "categoryLabel": "COROUTINES & CONCURRENCY",
      "question": "What is a `suspend` function, and how is a coroutine different from a thread?",
      "answer": "A `suspend` function is one that can **pause and resume without blocking the thread** it runs on. At a suspension point the coroutine saves its state and frees the thread to do other work; when the awaited result is ready it resumes, possibly on a different thread. The compiler implements this by rewriting the function into a state machine and threading a hidden `Continuation` parameter through it (continuation-passing style) — that is why a `suspend` function can only be called from another `suspend` function or a coroutine builder.\n\nA thread is an OS-scheduled resource — a few hundred KB of stack each, expensive to create and context-switch. A coroutine is a **language-level construct** scheduled onto a small pool of threads; you can run hundreds of thousands of them. Ten thousand coroutines doing `delay(1000)` cost almost nothing because `delay` suspends rather than blocking, whereas ten thousand threads each doing `Thread.sleep` would exhaust memory.\n\nThe key reframing: suspension is cooperative concurrency, not parallelism. Parallelism still comes from running on a multi-threaded dispatcher.\n\n**A suspended coroutine frees its thread to do other work; a blocked thread just sits there reserved — that's why you can run hundreds of thousands of coroutines but only a few thousand threads.**",
      "level": "mid"
    },
    {
      "id": "android-coroutines-2",
      "category": "coroutines",
      "categoryLabel": "COROUTINES & CONCURRENCY",
      "question": "Explain structured concurrency. What's the difference between `launch` and `async`, and between `coroutineScope` and `supervisorScope`?",
      "answer": "Structured concurrency means every coroutine has a **parent scope**, and the parent does not complete until all its children do. This gives three guarantees for free: child failures and cancellations propagate, scopes can't leak coroutines, and cancelling the scope cancels the whole subtree. In practice you launch from a lifecycle-bound scope (`viewModelScope`, `lifecycleScope`) so work is cancelled automatically when the owner dies.\n\n`launch` is fire-and-forget — it returns a `Job` and is for work whose result you don't await. `async` returns a `Deferred<T>` you `await()` — use it to run things in parallel and collect results: `val a = async { ... }; val b = async { ... }; a.await() + b.await()`.\n\n`coroutineScope` vs `supervisorScope` differ in failure handling: in `coroutineScope`, if one child throws, the scope cancels all siblings and rethrows. In `supervisorScope`, a child's failure is **isolated** — siblings keep running. Reach for supervisor scope when independent jobs shouldn't take each other down (e.g. loading several widgets on a dashboard).\n\n**Use `launch` when you don't need the result, `async` when you do and want parallelism, and `supervisorScope` the moment one child's failure shouldn't take its siblings down.**",
      "level": "senior"
    },
    {
      "id": "android-coroutines-3",
      "category": "coroutines",
      "categoryLabel": "COROUTINES & CONCURRENCY",
      "question": "What are Dispatchers, and what does `withContext` do? What is main-safety?",
      "answer": "A `CoroutineDispatcher` decides which thread(s) a coroutine runs on:\n\n- `Dispatchers.Main` — the UI thread; touch UI only here.\n- `Dispatchers.IO` — a large, elastic pool for blocking I/O (disk, network, database).\n- `Dispatchers.Default` — a CPU-bound pool sized to the core count, for parsing, sorting, JSON, image work.\n- `Dispatchers.Unconfined` — rarely used outside tests.\n\n`withContext(dispatcher) { ... }` switches the coroutine to another dispatcher for the duration of the block and **switches back** when it returns, suspending rather than blocking. It is the idiomatic way to move heavy work off the main thread.\n\n**Main-safety** is the principle that a `suspend` function should be safe to call from the main thread — it should do its own `withContext(IO/Default)` internally rather than forcing the caller to remember. So a repository function offloads its own database/network call, and the ViewModel can call it straight from `Dispatchers.Main` without freezing the UI.\n\n**A main-safe function does its own `withContext` internally, so the caller never has to remember to get off the main thread.**",
      "level": "mid"
    },
    {
      "id": "android-coroutines-4",
      "category": "coroutines",
      "categoryLabel": "COROUTINES & CONCURRENCY",
      "question": "What is a `Flow`? How is it different from a `suspend` function returning a value, and how does it handle backpressure?",
      "answer": "A `Flow<T>` is a **cold, asynchronous stream** of values — the coroutine equivalent of a sequence that can suspend between emissions. A `suspend` function returns one value once; a `Flow` emits zero, one, or many over time, which is the right model for things like database observation, location updates, or search-as-you-type.\n\n**Cold** means the `flow { ... }` builder block does nothing until a terminal operator (`collect`) runs, and it re-runs for each new collector — no shared side effects. You transform with `map`, `filter`, `debounce`, `flatMapLatest`, and so on, all of which are themselves suspending.\n\nBackpressure is handled structurally: emission and collection are **sequential by default**, so a slow collector simply suspends the producer at `emit` — there is no unbounded buffer to overflow. When you do want concurrency you opt in explicitly with `buffer()`, `conflate()` (drop intermediate values, keep the latest), or `collectLatest` (cancel the previous collector on a new value). `flowOn(dispatcher)` changes the dispatcher of the **upstream** producer without affecting the collector.\n\n**Backpressure isn't something I configure by default — it falls out of `collect` being sequential, so a slow collector simply suspends the producer.**",
      "level": "senior"
    },
    {
      "id": "android-coroutines-5",
      "category": "coroutines",
      "categoryLabel": "COROUTINES & CONCURRENCY",
      "question": "`StateFlow` vs `SharedFlow` vs `LiveData` — when do you use each in a ViewModel?",
      "answer": "All three are **hot** observable holders, but they differ in semantics:\n\n- `StateFlow` — always holds **exactly one current value**, conflated, and replays it to every new collector. It is the modern replacement for `LiveData` as a state holder: `private val _state = MutableStateFlow(UiState.Loading); val state = _state.asStateFlow()`. Requires an initial value; emits only on a distinct new value.\n- `SharedFlow` — a configurable broadcast with `replay` and buffer settings and **no required initial value**. Use it for one-off **events** (show a snackbar, navigate) where replaying the last value would be wrong; a `replay = 0` SharedFlow fires each event once.\n- `LiveData` — the older, lifecycle-aware holder. It is main-thread bound and automatically stops delivering to stopped views, but it has no operators and is awkward off the main thread. New code prefers `StateFlow` + `repeatOnLifecycle`.\n\nRule of thumb: **state → StateFlow, events → SharedFlow**, and only reach for LiveData in legacy code.",
      "level": "senior"
    },
    {
      "id": "android-coroutines-6",
      "category": "coroutines",
      "categoryLabel": "COROUTINES & CONCURRENCY",
      "question": "How does coroutine cancellation work, and how should exceptions be handled?",
      "answer": "Cancellation is **cooperative**: cancelling a `Job` flips it to a cancelling state, but a coroutine only actually stops at a suspension point or where it checks. All `kotlinx.coroutines` suspend functions (`delay`, `withContext`, `yield`) are cancellation-aware and throw `CancellationException` when cancelled. Tight CPU loops with no suspension won't stop until you call `ensureActive()` or check `isActive` yourself.\n\nTwo traps:\n\n- Red flag: a blanket `catch (e: Exception)` that swallows `CancellationException` — it's **special**, signaling normal cancellation and rethrown by the machinery, so swallowing it breaks cancellation for the whole scope. Either catch specific types, or rethrow `CancellationException`.\n- Cleanup that suspends must run in `withContext(NonCancellable)` inside a `finally`, because the coroutine is already cancelled.\n\n**Never let a broad `catch (e: Exception)` swallow `CancellationException` — that's the one exception type you always let propagate.**\n\nFor real failures: in a regular scope an uncaught exception cancels the parent and siblings. `CoroutineExceptionHandler` is the last-resort handler for `launch` (not `async`, whose exception surfaces at `await`). Use `supervisorScope` when you want a child's failure to stay isolated.",
      "level": "senior"
    },
    {
      "id": "android-compose-1",
      "category": "compose",
      "categoryLabel": "JETPACK COMPOSE",
      "question": "What is recomposition, and what triggers it?",
      "answer": "Compose is **declarative**: a composable function describes UI as a function of state. Recomposition is Compose re-invoking those functions when their inputs change to produce the new UI — there are no `findViewById` mutations, you just re-run the description.\n\nRecomposition is triggered when a composable **reads** a `State` object whose value changes. The Compose runtime tracks, at the granularity of individual state reads, which composables read which state, so when `mutableStateOf` updates it re-invokes **only** the composables that actually read it — not the whole tree. State must be a Compose-observable type (`mutableStateOf`, `StateFlow.collectAsState`, etc.); mutating a plain `var` does nothing.\n\nThe senior nuance: composables can run **frequently, out of order, and in parallel**, and skippable ones may be **skipped** entirely. So a composable must be side-effect-free in its body — any side effect goes through `LaunchedEffect`/`DisposableEffect`, and expensive work goes through `remember`.\n\n- Red flag: putting a side effect (a network call, logging, mutating a var) directly in a composable's body — because the body can run any number of times, in any order, that side effect fires unpredictably instead of once.\n\n**Never rely on a composable running a fixed number of times — treat the body as pure and route every side effect through an effect API.**",
      "level": "mid"
    },
    {
      "id": "android-compose-2",
      "category": "compose",
      "categoryLabel": "JETPACK COMPOSE",
      "question": "What is state hoisting, and what's the difference between `remember` and `rememberSaveable`?",
      "answer": "State hoisting is moving state **up** out of a composable so the composable becomes **stateless** — it receives the value as a parameter and an `onValueChange` callback as the other. This is unidirectional data flow: state flows down, events flow up. The payoff is that stateless composables are reusable, testable, and have a single source of truth, while the state lives at the lowest common ancestor that needs it (often a ViewModel).\n\n`remember { ... }` caches a value across recompositions so it isn't recomputed every frame — but it is **lost on configuration change and process death** because it lives only in the composition.\n\n`rememberSaveable { ... }` additionally persists the value into the saved-instance-state `Bundle`, so it survives rotation and process death. Use it for UI state the user would be annoyed to lose (scroll position, text field contents, selected tab). The constraint is that the value must be `Bundle`-storable or have a custom `Saver`. Durable app state still belongs in a ViewModel or repository, not in `rememberSaveable`.\n\n**Stateless, hoisted composables are the reusable and testable ones — state flows down, events flow up.**",
      "level": "mid"
    },
    {
      "id": "android-compose-3",
      "category": "compose",
      "categoryLabel": "JETPACK COMPOSE",
      "question": "Walk through Compose side effects: `LaunchedEffect`, `DisposableEffect`, `SideEffect`, `rememberCoroutineScope`.",
      "answer": "Because a composable body must be side-effect-free and may run any number of times, anything with a side effect goes through an effect API tied to the composition lifecycle:\n\n- `LaunchedEffect(key)` — runs a **suspending** block when it enters composition and **restarts** when a key changes; its coroutine is cancelled when it leaves composition. Use it for one-shot loads, animations, observing a flow. Passing `Unit`/`true` as the key means run once.\n- `DisposableEffect(key)` — for effects that need **cleanup**: register a listener/callback in the body and remove it in the required `onDispose { }`. Restarts on key change.\n- `SideEffect { }` — runs after **every successful recomposition**, to publish Compose state to a non-Compose object (e.g. analytics).\n- `rememberCoroutineScope()` — returns a composition-scoped scope to launch coroutines from **event callbacks** (a button tap), where `LaunchedEffect` doesn't fit.\n\nThe cardinal rule is **keys**: an effect that captures a value but doesn't list it as a key will run with a stale value.\n\n**Get the key set right and most Compose effect bugs disappear on their own.**",
      "level": "senior"
    },
    {
      "id": "android-compose-4",
      "category": "compose",
      "categoryLabel": "JETPACK COMPOSE",
      "question": "What makes a composable skippable, and why can an unstable parameter hurt performance?",
      "answer": "On recomposition, Compose can **skip** a composable if all its parameters are **stable** and unchanged (`equals` returns true). Skipping is the main performance lever — it stops recomposition from cascading through subtrees that didn't actually change.\n\nA type is stable if Compose can prove its public properties won't change without notifying composition: all primitives, `String`, function types, and anything marked `@Stable`/`@Immutable` or inferred stable (e.g. a `data class` of stable `val`s). The classic trap is a **`List<T>` parameter**: `List` is an interface that *could* be backed by a mutable implementation, so Compose treats it as **unstable** and the composable becomes non-skippable, recomposing every time the parent does. Fixes: use `kotlinx.collections.immutable` (`ImmutableList`), mark the holder `@Immutable`, or enable strong skipping.\n\nLambdas are stable only if they don't capture unstable values; an inline lambda that captures stable state is memoized. The practical workflow is to run the **Compose Compiler reports** to see which composables are skippable and which params are unstable, then fix the unstable ones.\n\n**A composable is only as fast as its least stable parameter — one raw `List<T>` can make an entire subtree non-skippable.**",
      "level": "senior"
    },
    {
      "id": "android-compose-5",
      "category": "compose",
      "categoryLabel": "JETPACK COMPOSE",
      "question": "When do you use `derivedStateOf` versus `remember(key)`?",
      "answer": "Both avoid redundant work, but they solve different problems.\n\n`remember(key) { compute() }` recomputes **whenever the key changes**. Use it when the output should track its inputs one-to-one — the key *is* the input, and every input change should produce a new value.\n\n`derivedStateOf { ... }` is for when a value is **derived from frequently-changing state but itself changes rarely**. The classic example: `val showButton by remember { derivedStateOf { listState.firstVisibleItemIndex > 0 } }`. The scroll index changes on every frame of scrolling, but the boolean flips only once — `derivedStateOf` recomputes on every read of the source but only **notifies readers when the result actually changes**, so the button composable recomposes once instead of every frame.\n\nThe rule: use `derivedStateOf` when one or more rapidly-changing states collapse into a state that changes much **less** often. If you used `remember(scrollIndex)` there, you'd recompute and recompose on every frame — the bug `derivedStateOf` exists to prevent.\n\n**Reach for `derivedStateOf` only when a fast-changing input collapses into a slow-changing output — if the output changes as often as the input, it's just overhead.**",
      "level": "senior"
    },
    {
      "id": "android-compose-6",
      "category": "compose",
      "categoryLabel": "JETPACK COMPOSE",
      "question": "Why does `Modifier` order matter? Give a concrete example.",
      "answer": "A `Modifier` chain is applied **in order, outermost-first** — each modifier wraps the rest. So reordering two modifiers changes the layout and drawing, not just the syntax. Modifiers are not a bag of independent properties; they're a composition.\n\nThe canonical example is padding vs background:\n\n- `Modifier.padding(16.dp).background(Blue)` — padding is applied first, so the background paints **inside** the padded region: a smaller blue box with transparent margins.\n- `Modifier.background(Blue).padding(16.dp)` — background fills the whole element, then padding insets the **content**: a full blue box with blue padding around the content.\n\nSame two modifiers, visibly different result. The same logic governs `clickable` vs `padding` (does the padded area register taps?), `size` vs `padding`, and `clip` vs `border`. Getting touch targets and clip regions right is almost always a question of modifier order.\n\n**Read a modifier chain top-to-bottom as boxes nested from the outside in — the first modifier is the outermost box.**",
      "level": "mid"
    },
    {
      "id": "android-lifecycle-1",
      "category": "lifecycle",
      "categoryLabel": "LIFECYCLE & ARCHITECTURE",
      "question": "Walk through the Activity lifecycle. What work belongs in which callback?",
      "answer": "The core callbacks, paired as create/destroy, start/stop, resume/pause:\n\n- `onCreate` — one-time setup: inflate/`setContent`, wire the ViewModel, restore saved state. Runs once per instance.\n- `onStart` / `onStop` — the Activity becomes **visible** / **hidden**. Register and unregister things tied to visibility (broadcast receivers, some sensors).\n- `onResume` / `onPause` — the Activity is in the **foreground and interactive** / losing focus. `onResume` starts camera/animations/exclusive resources; `onPause` must be **fast** (it blocks the next Activity) and release them.\n\n- Red flag: treating `onPause` as the safe place to persist important data — it isn't guaranteed to be the last call before the process is killed.\n- `onDestroy` — final cleanup, either because `finish()` was called or the system is reclaiming memory.\n\n**The senior framing: these callbacks are about visibility and focus transitions, not durability.** Persistence and state restoration go through `onSaveInstanceState`/`SavedStateHandle`, and most app state should live in a ViewModel that outlives these transitions, so the Activity callbacks mostly manage resources rather than data.",
      "level": "mid"
    },
    {
      "id": "android-lifecycle-2",
      "category": "lifecycle",
      "categoryLabel": "LIFECYCLE & ARCHITECTURE",
      "question": "Why does a `ViewModel` survive a configuration change but not process death, and what is `viewModelScope`?",
      "answer": "On a configuration change (rotation, theme, locale) Android **destroys and recreates the Activity**, but the `ViewModelStore` is retained across that recreation, so the same `ViewModel` instance is handed to the new Activity. That's why UI state in a ViewModel survives rotation for free — it lives **outside** the Activity instance and is scoped to the navigation/Activity entry rather than to one Activity object.\n\nIt does **not** survive **process death** (the system killing your app in the background to reclaim memory) because the entire process — and the ViewModelStore with it — is gone. When the user returns, Android recreates the task from saved instance state, not from your old objects. So transient UI state goes in the ViewModel, but anything that must survive process death goes through `SavedStateHandle` (which is backed by the saved-state Bundle) or real persistence.\n\n`viewModelScope` is a `CoroutineScope` tied to the ViewModel's lifetime — coroutines launched in it are **automatically cancelled in `onCleared`**, so work doesn't leak past the screen.\n\n**A ViewModel survives rotation because it lives outside the Activity instance; it doesn't survive process death because the whole process — ViewModelStore included — is gone with it.**",
      "level": "senior"
    },
    {
      "id": "android-lifecycle-3",
      "category": "lifecycle",
      "categoryLabel": "LIFECYCLE & ARCHITECTURE",
      "question": "How do you survive process death? Compare `onSaveInstanceState` and `SavedStateHandle`.",
      "answer": "Process death is the system killing your backgrounded process to free memory. Your objects are gone, but when the user navigates back, Android **recreates** the Activity and offers back the small `Bundle` you saved. Restoring from it is what makes the app feel like it was never killed.\n\n- `onSaveInstanceState(Bundle)` — the classic View-system hook. Write the minimum transient UI state (scroll position, a half-typed query) into the Bundle; read it back in `onCreate`/`onRestoreInstanceState`. It is **not** for large or durable data — the Bundle is size-limited (it crosses an IPC boundary) and is only for transient UI.\n- `SavedStateHandle` — the ViewModel-era equivalent, injected into the ViewModel and backed by the same saved-state Bundle. You read/write keys (`handle.get`/`handle.getStateFlow`), and the value survives both config change **and** process death without the Activity plumbing.\n\nRule of thumb: **small transient UI state → SavedStateHandle/Bundle; anything large or that must truly persist → Room/DataStore/network.** A common test is enabling “Don't keep activities” to force process death and verify restoration.",
      "level": "senior"
    },
    {
      "id": "android-lifecycle-4",
      "category": "lifecycle",
      "categoryLabel": "LIFECYCLE & ARCHITECTURE",
      "question": "What's the Fragment view-lifecycle gotcha, and how do you collect a Flow safely from the UI?",
      "answer": "A Fragment outlives its **view**: `onCreateView`/`onDestroyView` can fire multiple times (e.g. when the fragment goes onto the back stack) while the Fragment object itself lives on.\n\n- Red flag: observing with `this` (the Fragment's own lifecycle) and holding a binding reference — the old view leaks, and observers fire against a destroyed view. Observe with **`viewLifecycleOwner`** instead, and null out the binding in `onDestroyView`.\n\nFor collecting a `Flow`/`StateFlow` from the UI, a bare `lifecycleScope.launch { flow.collect { } }` keeps collecting even when the screen is in the background — wasting work and risking crashes. The correct pattern is:\n\n- `viewLifecycleOwner.lifecycleScope.launch { repeatOnLifecycle(Lifecycle.State.STARTED) { flow.collect { ... } } }`\n\n`repeatOnLifecycle(STARTED)` **starts** collection when the view reaches STARTED and **cancels** it when it drops below, restarting on the next STARTED — so you only collect while visible. In Compose, `collectAsStateWithLifecycle()` does the same thing.\n\n**`repeatOnLifecycle` is what makes a Flow collector visibility-aware — it stops burning work the instant the screen isn't shown.**",
      "level": "senior"
    },
    {
      "id": "android-lifecycle-5",
      "category": "lifecycle",
      "categoryLabel": "LIFECYCLE & ARCHITECTURE",
      "question": "MVVM vs MVI — how do you structure state in a modern Android app?",
      "answer": "Both keep the UI thin and put logic in a ViewModel; they differ in how state is shaped.\n\n**MVVM**: the ViewModel exposes observable state and the View renders it, but state is often **several** independent streams (a `StateFlow` for loading, one for data, one for error). It's simple, but with many fields it's easy to produce inconsistent combinations (loading true *and* error set).\n\n**MVI** tightens this into a **single immutable `UiState`** exposed as one `StateFlow`, mutated only by reducing **intents/events** (`onSearch`, `onRetry`) into a new state via `copy`. The UI is a pure function of that one state object, and updates are unidirectional: event in → reduce → new state out → render. That single source of truth makes the screen deterministic and trivial to snapshot in tests, at the cost of more boilerplate.\n\n**My default is MVI-flavored MVVM: one `data class UiState` per screen behind a single `StateFlow`, immutable updates via `copy`, and one-off effects (navigation, snackbars) on a separate `SharedFlow` so they aren't replayed on rotation.**",
      "level": "senior"
    },
    {
      "id": "android-lifecycle-6",
      "category": "lifecycle",
      "categoryLabel": "LIFECYCLE & ARCHITECTURE",
      "question": "Why use dependency injection, and what does Hilt give you on Android?",
      "answer": "DI means a class receives its collaborators (via constructor parameters) instead of constructing them itself. The payoff is **testability** (swap a real repository for a fake), decoupling, and a single place that owns object graphs and lifetimes — without it, ViewModels new-up their own dependencies and become impossible to test in isolation.\n\nHilt is the standard Android DI framework, built on Dagger but with Android-aware **components and scopes** wired up for you:\n\n- Annotate the `Application` with `@HiltAndroidApp`, and Activities/Fragments with `@AndroidEntryPoint`.\n- Provide dependencies with `@Inject` constructors, or `@Module` + `@Provides`/`@Binds` for interfaces and types you don't own (Retrofit, Room, OkHttp).\n- Scopes match Android lifetimes: `@Singleton` (app), `@ActivityRetainedScoped` (survives config change), `@ViewModelScoped`.\n- `@HiltViewModel` lets Hilt construct ViewModels with injected dependencies, and `by viewModels()` retrieves them.\n\n**Hilt validates the dependency graph at compile time, so a missing or cyclic binding is a build error you catch before shipping, not a runtime crash a user hits.**",
      "level": "mid"
    },
    {
      "id": "android-memory-1",
      "category": "memory",
      "categoryLabel": "MEMORY",
      "question": "How does memory management work on Android, and why do allocations cause jank?",
      "answer": "Android apps run on **ART** with a tracing, **generational, mostly-concurrent garbage collector** — there is no manual free; objects are reclaimed when unreachable. Each app gets a bounded heap (the per-device limit; exceed it and you get an `OutOfMemoryError`). Generational means short-lived objects are collected cheaply from a young generation, which is why churn in hot paths is the problem.\n\nGC causes jank because, although modern ART does most work concurrently, collection still competes for CPU and can introduce small pauses. If you **allocate heavily inside a frame** — creating objects in `onDraw`, in a `LazyColumn` item, on every recomposition — you trigger frequent GCs, and the resulting pauses make you miss the ~16ms frame budget, producing visible stutter.\n\nThe practical rules: don't allocate in tight render/scroll loops, reuse objects and buffers, avoid autoboxing in hot collections, and watch for accidental allocations from lambdas/iterators. Profile with the **Memory Profiler** to see allocation spikes and GC events, and let the heap tell you where the churn is rather than guessing.\n\n**Don't allocate inside a hot render or scroll loop — that's the single biggest lever against GC-induced jank.**",
      "level": "mid"
    },
    {
      "id": "android-memory-2",
      "category": "memory",
      "categoryLabel": "MEMORY",
      "question": "What is a Context leak, and how do you avoid the most common one?",
      "answer": "A `Context` leak is the most common Android memory leak: a **long-lived object holds a reference to a short-lived `Activity` Context**, so the GC can't reclaim the Activity (and its entire view tree, bitmaps, and resources) after it's destroyed. Over rotations this can leak many full Activity instances.\n\n- Red flag: a **singleton or static field holding an Activity Context** — `object Manager { lateinit var context: Context }` initialized with an Activity means that Activity can never be collected for the life of the process.\n\nThe fixes:\n\n- For anything that outlives the Activity, use `applicationContext` — it lives for the whole process, so holding it leaks nothing.\n- Keep Activity Context only where you genuinely need an Activity (inflation, theming, dialogs), and only for the Activity's lifetime.\n- Be wary of what implicitly captures a Context: a non-static inner class, a `Handler`, a listener, a `Drawable`'s callback.\n\nThe rule of thumb: **ask “will this object outlive the Activity?” — if yes, it must not hold an Activity Context.**",
      "level": "senior"
    },
    {
      "id": "android-memory-3",
      "category": "memory",
      "categoryLabel": "MEMORY",
      "question": "What are the most common sources of memory leaks, and how do you find them?",
      "answer": "Beyond Activity-Context leaks, the usual suspects all share a shape — **something long-lived retains something short-lived**:\n\n- **Unregistered callbacks**: registering a `BroadcastReceiver`, listener, or `LiveData`/Flow observer and never removing it. Always pair register in `onStart`/`onResume` with unregister in `onStop`/`onPause`, or observe with a lifecycle owner.\n- **Inner classes and Handlers**: a non-static inner class (or an anonymous `Runnable`/`Handler`) implicitly holds a reference to its outer Activity; a delayed message keeps the Activity alive until it fires. Use a static class with a `WeakReference`, or remove callbacks in `onDestroy`.\n- **Long-lived coroutines/Flows**: collecting in the wrong scope (see `GlobalScope`) keeps the collector and its captures alive.\n- **Caches without bounds**: a `HashMap` cache that only grows.\n\nTo find them:\n\n1. Run debug builds with **LeakCanary** — it watches destroyed Activities/Fragments and automatically dumps a reference chain when one doesn't get collected.\n2. For anything LeakCanary doesn't catch, capture a heap dump in the **Memory Profiler** and inspect retained objects manually.\n3. Read the reference chain to find the exact field holding the leak, then fix the retaining scope (weak reference, unregister, or correct lifecycle owner).\n\n**The reference chain tells you exactly which field is holding the leak — read it before you guess at a fix.**",
      "level": "senior"
    },
    {
      "id": "android-memory-4",
      "category": "memory",
      "categoryLabel": "MEMORY",
      "question": "When would you reach for a `WeakReference` (or `SoftReference`)?",
      "answer": "A normal (strong) reference keeps an object alive. A `WeakReference` lets you **refer to an object without preventing its collection** — if nothing else holds it strongly, the GC reclaims it and your `weakRef.get()` returns `null`. It is the tool for breaking the retain in a leak-prone relationship: a `static Handler` or a long-lived helper that needs *occasional* access to an Activity holds it weakly, so the Activity can still be collected, and you simply no-op when `get()` is null.\n\n`SoftReference` is weaker than strong but stronger than weak: the GC keeps soft-referenced objects **until memory pressure**, then reclaims them. Historically used for memory-sensitive caches, but it's discouraged on Android now — the GC can't tune it well, and a purpose-built bounded cache like `LruCache` gives predictable behavior.\n\n**Weak references are a fix for a design that already over-retains, not a default** — if you find yourself reaching for them constantly, the better fix is usually correct scoping (lifecycle-aware observers, `applicationContext`, cancelling coroutines) so the strong reference never outlives its target in the first place.",
      "level": "mid"
    },
    {
      "id": "android-memory-5",
      "category": "memory",
      "categoryLabel": "MEMORY",
      "question": "Why are bitmaps a memory risk, and how do you handle large images?",
      "answer": "Bitmaps are usually an app's **single largest memory consumer**. A decoded bitmap costs `width × height × bytes-per-pixel` in RAM regardless of the file size on disk — at the default `ARGB_8888` (4 bytes/pixel), a 4000×3000 photo is about **48 MB decoded**, even if the JPEG is 2 MB. Decode a few of those into an unbounded list and you hit `OutOfMemoryError`.\n\n**A bitmap's memory cost is width × height × bytes-per-pixel, completely independent of the file size on disk — always decode at display size, not source size.**\n\nThe techniques:\n\n- **Downsample at decode time** to the size you'll actually display, using `BitmapFactory.Options.inSampleSize` (or `inJustDecodeBounds` first to read dimensions without allocating). Never decode full-res for a thumbnail.\n- **Use an image-loading library** (Coil, Glide) — they handle downsampling to the target `ImageView`/`Composable` size, memory + disk caching, bitmap reuse/pooling, and lifecycle-aware cancellation, which removes almost all of this boilerplate.\n- Pick the **cheapest format** the use case allows (`RGB_565` halves the cost when alpha isn't needed).\n- Reclaim and cap: bound any custom cache (`LruCache` sized as a fraction of the heap) so it can't grow forever.",
      "level": "mid"
    },
    {
      "id": "android-memory-6",
      "category": "memory",
      "categoryLabel": "MEMORY",
      "question": "How can coroutines and Flows leak, and how do you prevent it?",
      "answer": "Coroutines leak the same way other things do — by being **launched in a scope that outlives what they reference**. The two classic mistakes:\n\n- Red flag: **`GlobalScope.launch { ... }`** — a process-lifetime scope. Anything it captures (a ViewModel, a View, a Context) is retained for the whole app, and the work isn't cancelled when the screen dies. It is almost always a bug; reach for a lifecycle-bound scope instead.\n- **Collecting a hot Flow without lifecycle awareness** — a bare `lifecycleScope.launch { flow.collect { } }` keeps running while the UI is in the background, holding references and burning work.\n\nThe prevention is **structured, lifecycle-scoped concurrency**:\n\n- Launch from `viewModelScope` (cancelled in `onCleared`) or `lifecycleScope` (cancelled with the lifecycle owner) so cancellation is automatic.\n- Collect UI flows inside `repeatOnLifecycle(STARTED)` (or `collectAsStateWithLifecycle` in Compose) so collection stops when not visible.\n- Pass a cancellable scope down rather than capturing a Context; let cancellation, not the GC, be what stops the work.\n\n**Every coroutine should have an owner whose death cancels it.**",
      "level": "senior"
    },
    {
      "id": "android-performance-1",
      "category": "performance",
      "categoryLabel": "PERFORMANCE",
      "question": "What causes UI jank, and how do you diagnose it?",
      "answer": "Jank is a **dropped frame**: the UI thread didn't finish producing a frame within the display's budget (~16.7ms at 60Hz, ~8.3ms at 120Hz), so the same frame shows twice and the user sees a stutter. The frame pipeline is driven by `Choreographer`, and the work that overruns is almost always on the **main thread**.\n\nMy framework for diagnosing it:\n\n1. **Isolate** — is it consistent (every frame) or a spike (one bad frame)? Consistent points at layout/recomposition cost; a spike points at a one-off allocation, GC, or I/O call on the main thread.\n2. **Prove it** — **Android Studio Profiler / system trace (Perfetto)** to see exactly what the main thread was doing during the janky window and which frames missed the deadline; **Jank stats / `FrameMetrics`** and **Macrobenchmark** to quantify it repeatably; **Layout Inspector** / Compose recomposition counts to spot redundant work.\n3. **Fix the specific bottleneck** — move the offending work off the main thread (`withContext`), cut allocations in the hot path, flatten deep view hierarchies, or make the composable skippable. Don't apply all four; the trace tells you which one.\n\n**Never guess at a jank fix — the trace tells you whether it's I/O, allocation, layout, or recomposition, and each has a different cure.**",
      "level": "mid"
    },
    {
      "id": "android-performance-2",
      "category": "performance",
      "categoryLabel": "PERFORMANCE",
      "question": "What is overdraw, and how do you keep layout cheap in Views and in Compose?",
      "answer": "**Overdraw** is the GPU painting the same pixel multiple times in one frame — an opaque background behind another opaque background behind a card. Each extra layer is wasted fill-rate, and on big surfaces it costs real time. You spot it with **Debug GPU Overdraw** (the developer-option color overlay) and fix it by removing redundant backgrounds, not stacking opaque layers, and using `clipRect`/`canvas` clipping where applicable.\n\nIn the **View system**, layout cost grows with hierarchy depth because measure/layout can run multiple passes: nested `LinearLayout`s with `layout_weight` measure their children **twice**, and deep trees compound it. The fix is a **flat hierarchy with `ConstraintLayout`**, which resolves complex layouts in fewer passes, plus `merge`/`ViewStub` to avoid wrapper views.\n\nIn **Compose**, layout is a single measure/place pass per node (children are measured once), so depth is cheaper, but the analogous costs are **excessive recomposition** and reading scroll/size state too high in the tree.\n\n**Defer state reads with lambda-based modifiers (`Modifier.offset { }`, `graphicsLayer { }`) so animation updates skip recomposition and layout entirely, touching only the draw phase.**",
      "level": "mid"
    },
    {
      "id": "android-performance-3",
      "category": "performance",
      "categoryLabel": "PERFORMANCE",
      "question": "How do you make a long list (`LazyColumn` / `RecyclerView`) scroll smoothly?",
      "answer": "Both recycle: only visible items exist, and they're reused as you scroll. The performance work is making each item cheap and helping the framework reuse correctly.\n\n**LazyColumn (Compose)**:\n\n- Give items a stable **`key`** (`items(list, key = { it.id })`) so reorders/insertions animate and Compose reuses slot state instead of recomposing everything.\n- Provide `contentType` when item shapes differ, so Compose reuses compatible item compositions.\n- Keep item composables **skippable** (stable params, hoisted state) and avoid allocating or doing work in the item body.\n\n**RecyclerView (Views)**:\n\n- Use **`DiffUtil`** (via `ListAdapter`) to compute minimal updates instead of `notifyDataSetChanged()`, and `setHasStableIds(true)` for smooth animations.\n- Keep `onBindViewHolder` trivial — no allocation, no inflation, no layout work there.\n- Avoid nested scrolling views; set fixed size and use a shared `RecycledViewPool` for nested lists.\n\nThe shared principle: **stable identity + cheap item rendering + no per-item allocation**. Most list jank traces to a heavy bind/item body or missing keys defeating recycling.",
      "level": "senior"
    },
    {
      "id": "android-performance-4",
      "category": "performance",
      "categoryLabel": "PERFORMANCE",
      "question": "Explain cold, warm, and hot app startup, and how you make startup faster.",
      "answer": "The three start types differ by how much already exists:\n\n- **Cold start** — the process doesn't exist; Android forks a process, creates the `Application`, then the first Activity. The slowest path and the one to optimize.\n- **Warm start** — the process is alive but the Activity must be recreated (e.g. it was destroyed in the background). Cheaper.\n- **Hot start** — the Activity is just brought to the foreground. Nearly instant.\n\nLevers for cold start:\n\n- Red flag: doing heavy SDK/library initialization in `Application.onCreate` because it “needs to run early” — it's on the critical path for **every** cold start. Defer and parallelize it with the **App Startup** library or lazy init; do nothing on the main thread that the first frame doesn't need.\n- **Avoid a fake splash that blocks** — use the official `SplashScreen` API and keep `setContent`/the first frame light.\n- **Baseline Profiles** (below) precompile hot startup paths.\n- Measure with the **Macrobenchmark** library's `StartupTimingMetric` (time-to-initial-display / time-to-full-display) so you're optimizing real numbers, not impressions.\n\n**Cold start is the one to optimize — everything on `Application.onCreate`'s critical path delays every user's first frame.**",
      "level": "senior"
    },
    {
      "id": "android-performance-5",
      "category": "performance",
      "categoryLabel": "PERFORMANCE",
      "question": "What does R8 do, and why do you need keep rules?",
      "answer": "**R8** is the default code shrinker/optimizer in the Android build (it replaced ProGuard and also does the dexing). Enabled for release builds (`isMinifyEnabled = true`), it does four things:\n\n- **Shrinking** — tree-shakes unused classes, methods, and fields, cutting APK size and method count.\n- **Optimization** — inlining, dead-code elimination, and other transforms that can also speed up runtime.\n- **Obfuscation** — renames classes/members to short names, shrinking the file and making reverse-engineering harder.\n- **Resource shrinking** (with `shrinkResources`) — drops unused resources.\n\nThe catch is **reflection**: R8 reasons about code statically, so anything accessed by name at runtime — reflection, JNI, Gson/Moshi model classes, serialization, named entry points — looks unused and gets removed or renamed, causing release-only `ClassNotFoundException`/`NoSuchMethodError`. **Keep rules** (`-keep` in `proguard-rules.pro`) tell R8 to preserve those classes/members exactly. Well-behaved libraries ship their own consumer keep rules; you add rules for your own reflective code.\n\n- Red flag: debugging a release-only `ClassNotFoundException`/`NoSuchMethodError` by starting with the debug build — it never repros there. Reproduce on the **release/minified** build first, then narrow it down with keep rules.\n\n**Always test the release/minified build before shipping — these bugs never appear in debug.**",
      "level": "mid"
    },
    {
      "id": "android-performance-6",
      "category": "performance",
      "categoryLabel": "PERFORMANCE",
      "question": "What are Baseline Profiles, and how do they speed up an app?",
      "answer": "By default, app code starts **interpreted** and ART's JIT compiles hot methods to native code only after they've run enough times — so the very first runs of a screen (including startup) are slower until the JIT warms up. A **Baseline Profile** is a list of the classes and methods on critical user journeys (startup, first scroll) that gets shipped with the app and used to **ahead-of-time compile those paths at install time**, before the user ever runs them. The result is faster startup and smoother first interactions — often a meaningful double-digit-percent startup improvement — with no code changes to the feature itself.\n\nHow it's done:\n\n- You write a **Macrobenchmark** test that exercises the journey and generate the profile with the **Baseline Profile Gradle plugin** (`baselineProfile` rule), which produces `baseline-prof.txt` packaged into the app.\n- ART compiles those methods AOT on install and keeps improving with the device's own usage profile over time.\n- The same Macrobenchmark harness lets you **measure** startup/jank before and after to confirm the win.\n\n**Think of it as telling the runtime in advance which code matters, so it doesn't have to learn that at the user's expense.**",
      "level": "senior"
    },
    {
      "id": "android-persistence-1",
      "category": "persistence",
      "categoryLabel": "PERSISTENCE & DATA",
      "question": "What is Room, and why use it over raw SQLite?",
      "answer": "Room is the Jetpack **persistence library that wraps SQLite** with a typed, compile-checked API. Raw SQLite means stringly-typed queries, manual `Cursor` parsing, and boilerplate; Room removes all of that while keeping full SQL power.\n\nThe three pieces:\n\n- **`@Entity`** — a data class mapped to a table.\n- **`@Dao`** — an interface of query methods; you write the SQL in `@Query`, plus `@Insert`/`@Update`/`@Delete`.\n- **`@Database`** — ties entities and DAOs together and gives the database instance.\n\nThe big wins are **compile-time verification** (Room parses your SQL and checks columns/types at build time, so a typo is a build error, not a runtime crash) and **observability**: a DAO method returning `Flow<List<T>>` emits a fresh list automatically whenever the underlying table changes — perfect for a single source of truth feeding the UI. It also handles threading (suspend/Flow APIs keep you off the main thread) and migrations.\n\n**Room turns SQL typos into a build-time error instead of a runtime crash, and turns the database into the observable cache at the center of an offline-first architecture.**",
      "level": "mid"
    },
    {
      "id": "android-persistence-2",
      "category": "persistence",
      "categoryLabel": "PERSISTENCE & DATA",
      "question": "DataStore vs SharedPreferences — why is DataStore preferred?",
      "answer": "Both store small key-value data, but `SharedPreferences` has real problems that **DataStore** was built to fix:\n\n- **SharedPreferences blocks**: the first read loads and parses the whole file, and `commit()` writes synchronously **on the calling thread** — frequently the main thread, a source of ANRs and jank. `apply()` is async but its disk write can still stall on `fsync` at lifecycle boundaries. There's no error signaling.\n- **DataStore** is built on **coroutines and Flow**: reads are a `Flow` you observe, writes are `suspend` functions that run off the main thread transactionally, and errors surface as exceptions you can catch. No main-thread I/O, no silent failures.\n\nTwo flavors: **Preferences DataStore** (untyped key-value, the drop-in SharedPreferences replacement) and **Proto DataStore** (a typed schema via protobuf, with compile-time type safety for structured settings).\n\n**New code uses DataStore; SharedPreferences survives only in legacy paths.** The one nuance — DataStore is for small app/user settings, not a database; structured or relational data still belongs in Room.",
      "level": "senior"
    },
    {
      "id": "android-persistence-3",
      "category": "persistence",
      "categoryLabel": "PERSISTENCE & DATA",
      "question": "How do Room database migrations work, and what's the risk of destructive migration?",
      "answer": "Every Room `@Database` has a **version number**. My process for evolving the schema:\n\n1. **Bump the version** the moment the schema changes (a column, a table, an index).\n2. **Write a `Migration(from, to)`** whose `migrate()` runs the raw `ALTER TABLE`/`CREATE TABLE` SQL to carry existing rows from the old shape to the new one — Room chains whatever migrations are needed to bring any user's on-device version up to current, so existing data survives the update.\n3. **Verify it** — Room can export the schema JSON, and `MigrationTestHelper` runs each migration against a real previous-version database in a test, not just against an empty one.\n\nIf a schema change ships with no matching migration, Room throws `IllegalStateException` at open time.\n\n- Red flag: reaching for `fallbackToDestructiveMigration()` as the default escape hatch — it **drops and recreates** the database, silently deleting all local data. Fine for a pure re-fetchable cache; a data-loss bug for anything the user authored offline.\n\n**Treat every schema change like an API change: version it, write the migration, and test it against real previous-version data instead of leaning on destructive fallback.**",
      "level": "senior"
    },
    {
      "id": "android-persistence-4",
      "category": "persistence",
      "categoryLabel": "PERSISTENCE & DATA",
      "question": "What is WorkManager for, and when do you choose it over a coroutine or a service?",
      "answer": "**WorkManager** is the Jetpack API for **deferrable, guaranteed background work** — work that must run eventually even if the app is killed or the device reboots. It persists the work request, survives process death and reboot, respects Doze/background limits, and lets you attach **constraints** (network connected, charging, battery not low), set retry/backoff policies, and chain or make work unique.\n\nChoose by lifetime and guarantee:\n\n- **Coroutine in `viewModelScope`/`lifecycleScope`** — for work tied to the current screen that should be **cancelled** when the user leaves (a network call to populate the UI). No durability needed.\n- **WorkManager** — for work that must **complete regardless of UI**: syncing data to a server, uploading logs, periodic refresh, processing a queue. It's the modern replacement for `JobScheduler`/`FirebaseJobDispatcher`/most background services.\n- **Foreground service** — only for work the user is actively aware of **right now** that must run immediately and continuously (music playback, an active navigation or workout), with a visible notification.\n\n**If it can wait and must not be lost, it's WorkManager; if it dies with the screen, it's a coroutine; if it's happening now and the user is watching, it's a foreground service.**",
      "level": "mid"
    },
    {
      "id": "android-persistence-5",
      "category": "persistence",
      "categoryLabel": "PERSISTENCE & DATA",
      "question": "How do you set up networking with Retrofit + OkHttp, and how do you cache responses?",
      "answer": "**Retrofit** turns a typed Kotlin interface into HTTP calls — you annotate methods (`@GET(\"users/{id}\")`) and it generates the implementation, deserializing JSON via a converter (Moshi/Kotlinx Serialization). It supports `suspend` functions directly, so a call is just `suspend fun user(@Path(\"id\") id: String): User` and you `await` it in a coroutine. **OkHttp** is the HTTP engine underneath.\n\nThe layered setup:\n\n- **Interceptors** on the OkHttp client handle cross-cutting concerns: an auth interceptor adds the token header, a logging interceptor traces requests, and an interceptor can transform the `Cache-Control` header to enable offline reads.\n- **HTTP caching** is configured by giving OkHttp a `Cache(dir, sizeBytes)`; it then honors server cache headers (ETag, max-age) automatically, serving 304s from disk. For offline, a network interceptor can rewrite cache headers to serve stale data when there's no connectivity.\n- **Timeouts, retries, and connection pooling** are set on the `OkHttpClient`.\n\n**HTTP cache is convenient but coarse — for an offline-first app the real source of truth is a Room cache the repository writes to, with the network only as a refresh.**",
      "level": "mid"
    },
    {
      "id": "android-persistence-6",
      "category": "persistence",
      "categoryLabel": "PERSISTENCE & DATA",
      "question": "What does the repository pattern with a single source of truth look like for offline-first data?",
      "answer": "The **repository** is the layer that owns a data type and hides where it comes from — the ViewModel asks the repository, never Retrofit or Room directly. The key design choice is a **single source of truth (SSOT)**: the **local database** is what the UI observes, and the network only **updates** that database.\n\nThe canonical offline-first flow (the NetworkBoundResource pattern):\n\n- The DAO exposes `Flow<List<T>>` from Room — the UI subscribes to **this**, so it renders instantly from cache and updates reactively.\n- On load/refresh, the repository fetches from the network, **writes the result into Room**, and Room's Flow re-emits — the UI updates without the repository pushing to it directly.\n- Errors/loading are surfaced alongside (e.g. a `Resource` wrapper or a separate state flow), but the **data** always flows UI ← Room ← network.\n\nWhy it matters: the app works offline (you always have the last-known data), there's exactly one place the UI reads from (no inconsistent caches to reconcile), and writes/refreshes are deterministic.\n\n**The network is a write path into the cache, not a read path into the UI — that inversion is what makes offline-first robust.**",
      "level": "senior"
    },
    {
      "id": "android-testing-1",
      "category": "testing",
      "categoryLabel": "TESTING",
      "question": "How do you structure unit tests on Android, and what should you actually mock?",
      "answer": "A unit test runs on the **JVM** (in `src/test/`, no device/emulator), so it's fast and runs on every build — that's where the bulk of tests should live (the wide base of the testing pyramid). You test logic in isolation: ViewModels, use cases, mappers, reducers, pure functions.\n\nTools: **JUnit** as the runner, **MockK** (Kotlin-first; handles coroutines, `object`s, and `final` classes that Mockito struggles with) or Mockito for test doubles, and **Truth**/AssertJ for readable assertions.\n\nWhat to mock — and what not to:\n\n- **Mock at boundaries you don't own or that do I/O**: the repository's network/DB collaborators, system clocks, external SDKs. Mocking these makes the test deterministic.\n- **Don't mock the thing under test**, and don't mock simple value types or your own pure functions — call the real code.\n- Prefer **fakes over mocks** for collaborators with behavior (a `FakeUserRepository` backed by an in-memory list) — they're more robust than stacks of `every { } returns` and test real interactions rather than your assumptions about them.\n\nThe goal: tests that pin **behavior** (given input, assert output/state), not implementation details that break on every refactor.\n\n**Mock the boundaries you don't own or that do I/O; call the real code for everything else, and prefer fakes over mocks whenever a collaborator has real behavior.**",
      "level": "mid"
    },
    {
      "id": "android-testing-2",
      "category": "testing",
      "categoryLabel": "TESTING",
      "question": "How do you test coroutines deterministically?",
      "answer": "The whole point is to make asynchronous code **synchronous and controllable** in a test, so it's fast and never flaky. The `kotlinx-coroutines-test` library provides this:\n\n- **`runTest { }`** is the entry point — it runs the test body in a `TestScope` with a **virtual clock**, so `delay(10_000)` returns **instantly** by advancing time rather than actually waiting. It also auto-advances and fails the test if coroutines are still pending at the end.\n- **`TestDispatcher`** comes in two forms: `StandardTestDispatcher` (queues coroutines; you control execution with `advanceUntilIdle()` / `advanceTimeBy()` to assert intermediate states) and `UnconfinedTestDispatcher` (runs eagerly, simplest when you don't need fine control).\n\nThe enabling practice is **dependency injection of dispatchers**: never hardcode `Dispatchers.IO`/`Main` inside a class — inject a dispatcher (or a `CoroutineDispatcher` provider) so the test can substitute a `TestDispatcher`. For the **main dispatcher** (used by `viewModelScope`), call `Dispatchers.setMain(testDispatcher)` in setup and `resetMain()` in teardown (often via a JUnit rule).\n\nThe result: you can assert loading→loaded transitions precisely, with no real waiting and no race conditions.\n\n**Never hardcode `Dispatchers.IO`/`Main` inside a class — inject the dispatcher so a test can swap in a `TestDispatcher` and make async code fully deterministic.**",
      "level": "senior"
    },
    {
      "id": "android-testing-3",
      "category": "testing",
      "categoryLabel": "TESTING",
      "question": "How do you test a `Flow` or `StateFlow`?",
      "answer": "A `Flow` emits over time, so the test has to **collect** emissions and assert the sequence. Doing that by hand (launching a collector, capturing into a list, cancelling) is fiddly and race-prone, so the standard tool is **Turbine**:\n\n- `flow.test { assertThat(awaitItem()).isEqualTo(first); assertThat(awaitItem()).isEqualTo(second); awaitComplete() }`. `awaitItem()` suspends for the next emission, and Turbine **fails the test if you don't consume every emission** or if the flow errors unexpectedly — so you can't accidentally miss an event.\n\nFor a **`StateFlow`** (hot, conflated, always has a current value):\n\n- The simplest assertion is `.value` after triggering an action: drive the ViewModel, then assert `viewModel.uiState.value` equals the expected state.\n- To assert **transitions** (Loading → Success), collect with Turbine inside `runTest`, trigger the action, and `awaitItem()` through the sequence — remembering StateFlow replays its current value first and **conflates**, so you may not see every intermediate value if they happen faster than collection.\n\nCombine this with `runTest` + an injected `TestDispatcher` so the emissions are deterministic, and you can pin a ViewModel's exact state machine in a fast JVM test.\n\n**Turbine fails the test the moment an emission goes unconsumed — that's what stops you from silently missing a state transition.**",
      "level": "senior"
    },
    {
      "id": "android-testing-4",
      "category": "testing",
      "categoryLabel": "TESTING",
      "question": "How do you test Jetpack Compose UI?",
      "answer": "Compose has its own testing API built around a **`ComposeTestRule`** (`createComposeRule()` for isolated composables, or `createAndroidComposeRule<Activity>()` when you need a real Activity). You set content and then drive the **semantics tree** — Compose's accessibility-backed model of the UI — rather than poking at pixels:\n\n- **Find** nodes by their semantics: `composeTestRule.onNodeWithText(\"Sign in\")`, `onNodeWithContentDescription(...)`, or `onNodeWithTag(\"email-field\")` after tagging with `Modifier.testTag(\"email-field\")`.\n- **Act**: `performClick()`, `performTextInput(\"...\")`, `performScrollTo()`.\n- **Assert**: `assertIsDisplayed()`, `assertTextEquals(...)`, `assertIsEnabled()`.\n\nTwo senior points:\n\n- Compose tests **synchronize automatically** with recomposition and animations (the rule waits for the UI to be idle before asserting), which removes most of the flakiness that plagues Espresso. For your own async work you can control the test clock.\n- These run as **instrumented** tests on a device/emulator by default, but using a **Robolectric** + Compose setup lets many of them run on the JVM for speed.\n\n**Prefer `testTag` over text-based selectors — text changes with copy and locale, tags don't.**",
      "level": "mid"
    },
    {
      "id": "android-testing-5",
      "category": "testing",
      "categoryLabel": "TESTING",
      "question": "What are instrumented tests / Espresso for, and when do you use them over unit tests?",
      "answer": "**Instrumented tests** run **on a device or emulator** (in `src/androidTest/`) with access to the real Android framework, Context, and resources — unlike JVM unit tests. **Espresso** is the classic UI-testing framework for the **View system**: you find a view (`onView(withId(...))`), perform an action (`perform(click())`), and check state (`check(matches(isDisplayed()))`).\n\nYou reach for them when the thing under test **needs the real framework or a real UI**: end-to-end flows across screens, navigation, integration with the actual database/system services, and verifying that the assembled UI behaves. They're the narrow top of the testing pyramid — high confidence, but **slow and flakier** (they need a booted device, real timing, and animations), so you keep them few and put most logic in fast JVM unit tests.\n\nThe senior detail is **synchronization**: Espresso auto-waits for the main thread and the default `AsyncTask` pool to idle, but it can't see your custom async work (coroutines, OkHttp threads).\n\n**Espresso doesn't see your own coroutines or OkHttp threads — that's what `IdlingResource` is for (or, better, controlling that work via injected test dispatchers).** Disable system animations on the test device to cut flakiness.",
      "level": "mid"
    },
    {
      "id": "android-testing-6",
      "category": "testing",
      "categoryLabel": "TESTING",
      "question": "How do you test a ViewModel, and how do you decide between Robolectric and instrumented tests?",
      "answer": "A well-built ViewModel is a **pure JVM unit** — it depends on interfaces (a repository, use cases) and an injected dispatcher, touches no Android UI, so it tests fast in `src/test/` without a device. The recipe:\n\n- Inject a **fake repository** (in-memory, deterministic) rather than mocking every call — fakes exercise real interactions and survive refactors.\n- Inject a **`TestDispatcher`** and `Dispatchers.setMain(...)` so `viewModelScope` is controllable; wrap the body in **`runTest`**.\n- Drive an action, then assert the exposed state — `.value` for a snapshot, or **Turbine** to assert the Loading→Success/Error transition sequence.\n\nFor `SavedStateHandle`, just construct one with the test's initial values.\n\n**Robolectric vs instrumented**: Robolectric simulates the Android framework **on the JVM**, so tests that need a `Context`, resources, or framework classes can still run fast in `src/test/` without an emulator — good for code that lightly touches the framework. **Instrumented** tests run on a real device and exercise the genuine framework, needed for true integration/UI confidence. The trade-off is speed vs fidelity: prefer JVM (plain unit or Robolectric) for the bulk, and reserve instrumented tests for the few real end-to-end paths.\n\n**A ViewModel that only depends on interfaces and an injected dispatcher is a plain JVM unit test — no device required.**",
      "level": "senior"
    }
  ]
};
