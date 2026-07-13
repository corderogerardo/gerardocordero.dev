# Kotlin

### Null Safety and the Elvis Operator
**They ask:** "How does null safety work in Kotlin, and what's the Elvis operator for?"

Kotlin pushes the null check into the type system, which eliminates the most common source of accidental NPEs — dereferencing a value you forgot could be null. `String` can never hold null; `String?` can, and the compiler forces you to handle the null case before you use it — that's the actual value, not the syntax sugar. It's risk reduction, not a guarantee: `!!`, `lateinit` accessed before assignment, platform types coming back from Java interop (unannotated Java APIs report as `String!`, bypassing the compiler entirely), and an explicit `throw` can all still NPE at runtime.

```kotlin
val name: String? = user.name
val display = name ?: "Unknown"   // Elvis: fall back when null
val length = name?.length         // safe call: null propagates instead of throwing
val forced = name!!.length        // non-null assertion: throws NPE if null — last resort
```

`?:` (Elvis) gives a default when the left side is null; `?.` short-circuits to null instead of throwing; `!!` opts back into Java-style crashing and should be rare — every `!!` is a claim you're making to the compiler that you can be wrong about.

**Say it:** "Kotlin makes nullability part of the type — `String?` versus `String` — so most accidental null dereferences get caught at compile time instead of at runtime. It's risk reduction, not immunity — `!!`, `lateinit`, and Java interop can still NPE."
**Red flag:** Sprinkling `!!` to make the compiler stop complaining. That's just deferring the same NPE to runtime — use `?:`, `?.`, or a proper `if (x != null)` smart-cast instead.

### Kotlin Class Inheritance vs Java
**They ask:** "What's different about class inheritance in Kotlin compared to Java?"

Kotlin flips Java's default: every class and method is `final` unless you explicitly mark it `open`. Java assumes inheritance is fine unless you `final` it off; Kotlin assumes composition and closed classes are safer unless you opt in — that's a deliberate design stance (effective-Java's "design for inheritance or prohibit it" enforced by the compiler).

```kotlin
open class Animal(val name: String) {
    open fun speak() = "..."
}
class Dog(name: String) : Animal(name) {
    override fun speak() = "Woof"
}
```

You also inherit via the constructor call `: Animal(name)`, not a separate `extends` plus `super()` call in the body.

**Say it:** "Kotlin classes are final by default — I have to opt into `open` — which pushes teams toward composition over inheritance unless a class is deliberately designed to be extended."
**Red flag:** Marking every class `open` out of habit "in case someone needs to extend it." That defeats the whole point — it should be a deliberate API decision, not a default.

### Kotlin Access Modifiers vs Java
**They ask:** "How do access modifiers differ between Java and Kotlin?"

Kotlin adds `internal`, visible only within the same module (Gradle module/compile unit), which Java has no equivalent for — Java's closest is package-private, which is weaker because any class in the same package can see it, even across modules. `internal` gives real module-boundary encapsulation.

Default visibility is also flipped: Kotlin's unmarked default is `public`; Java's unmarked default is package-private. That trips people coming from Java who expect "no modifier" to mean "package only."

**Say it:** "Kotlin's default visibility is public, not package-private like Java, and `internal` gives me a real module boundary that Java's package-private can't express."
**Red flag:** Assuming an unmarked Kotlin member is package-scoped like Java — it's public, and forgetting that leaks internals across module boundaries.

### when vs switch-case
**They ask:** "How does `when` differ from a Java switch-case?"

`when` is an expression, not just a statement — it returns a value, so you assign it directly instead of building up a mutable variable across cases. It also isn't limited to matching constants: it can match types (`is Foo`), ranges (`in 1..10`), and arbitrary boolean conditions, and the compiler forces exhaustiveness when used as an expression over a sealed type.

```kotlin
val label = when (val code = response.code) {
    in 200..299 -> "OK"
    404 -> "Not Found"
    else -> "Error $code"
}
```

No fallthrough, no `break` needed — each branch is isolated, which removes the classic missing-`break` bug entirely.

**Say it:** "`when` is an expression that can match types and ranges, not just constants, and it has no fallthrough — so I use it to build a value directly instead of mutating a variable across cases."
**Red flag:** Treating `when` as "just a switch with different syntax" — missing that it's exhaustiveness-checked against sealed types, which is a real compile-time safety net.

### data class vs POJO
**They ask:** "What's the difference between a Kotlin `data class` and a Java POJO?"

A Java POJO needs `equals`, `hashCode`, `toString`, and getters/setters hand-written or generated by a tool (Lombok, IDE templates) — boilerplate that's easy to get subtly wrong (forgetting a field in `equals` but not `hashCode`). `data class` generates all of that from the primary constructor properties automatically, plus `copy()` for immutable updates and `componentN()` for destructuring.

```kotlin
data class User(val id: String, val name: String)
val renamed = user.copy(name = "New Name")   // new instance, id unchanged
val (id, name) = user                        // destructuring
```

**Say it:** "A `data class` gets `equals`, `hashCode`, `toString`, `copy`, and destructuring generated from the constructor — a Java POJO needs all of that hand-written or tool-generated, and it's easy to let `equals`/`hashCode` drift out of sync."
**Red flag:** Putting mutable `var` collections inside a `data class` used as a value/state object — generated `equals`/`hashCode` on a mutable field breaks the moment the collection changes after being hashed (e.g. stored in a `HashSet`).

### Kotlin Exceptions vs Java
**They ask:** "How do exceptions differ between Java and Kotlin?"

Kotlin has no checked exceptions — every exception is unchecked, and the compiler never forces you to `catch` or declare `throws`. That's a deliberate reaction to Java's checked-exception experience, where teams routinely wrote empty `catch` blocks just to satisfy the compiler, silently swallowing real failures.

The trade-off: you lose the compiler's reminder that a call can fail, so API documentation and code review carry more weight for surfacing what can throw. `try` is also an expression in Kotlin, so you can return its value directly.

```kotlin
val result = try { risky() } catch (e: IOException) { fallback() }
```

**Say it:** "Kotlin dropped checked exceptions on purpose — Java's version pushed people to write empty catch blocks just to compile — but that means documenting what a function can throw is now on me, not the compiler."
**Red flag:** Assuming Kotlin exceptions "work exactly like Java's." The unchecked-only model changes how you design error handling — sealed `Result`-style return types are common precisely to bring back compile-time enforcement.

### Kotlin-Java Interop
**They ask:** "Can Kotlin and Java call each other, and what breaks at the boundary?"

Yes, both directions — that interop is why Kotlin could be adopted incrementally in existing Android codebases instead of requiring a rewrite. Kotlin compiles to the same JVM bytecode, so a Java class calls a Kotlin class like any other Java class, and vice versa.

The friction shows up at the type-system boundary: Java has no nullability annotations by default, so a value coming from Java is a "platform type" (`String!`) — Kotlin can't verify it's non-null, so a null from Java code can still slip through and NPE. Top-level Kotlin functions compile into a synthetic class (`FileNameKt`) that Java calls statically; `@JvmStatic` and `@JvmOverloads` exist specifically to make Kotlin APIs feel natural from Java (real static methods, overloads for default params).

**Say it:** "Kotlin and Java interop at the bytecode level, so migration can be incremental — the sharp edge is platform types: a value from Java has unknown nullability, so I still have to defend against null even though Kotlin normally guarantees it."
**Red flag:** Trusting a value from a Java API as definitely non-null just because Kotlin "has null safety." Platform types opt you out of that guarantee at every Java boundary.

### Kotlin Constructors
**They ask:** "How do Kotlin constructors differ from Java's?"

Kotlin has one primary constructor in the class header and optional secondary constructors that must delegate to it (directly or transitively) — the opposite of Java, where every constructor is independent unless you explicitly chain with `this(...)`. Properties declared in the primary constructor (`val`/`var`) are both parameters and fields in one line, removing the assign-every-field boilerplate.

```kotlin
class User(val id: String, var name: String) {
    var isActive: Boolean = true
        private set

    init {
        require(id.isNotBlank()) { "id required" }
    }

    constructor(id: String) : this(id, "Unknown")
}
```

`init` blocks run in declaration order interleaved with property initializers — useful for validation that can't live in the constructor signature.

**Say it:** "Kotlin's primary constructor doubles as the field declaration, and secondary constructors must funnel through it via `this(...)`, so there's exactly one source of truth for how a `User` gets built."
**Red flag:** Putting real initialization logic in a secondary constructor instead of an `init` block — secondary constructors are for alternate call signatures, not for owning setup logic.

### Properties and Backing Fields
**They ask:** "What are properties and backing fields in Kotlin, and how do they differ from Java fields?"

Java fields are just storage; getters/setters are separate methods you write by hand. Kotlin properties are the language-level unit — declaring `var name: String` generates a default getter/setter for you, and `field` (the implicit backing field) only exists if the accessor references it.

```kotlin
var name: String = ""
    set(value) {
        field = value.trim()   // "field" is the backing field
    }
```

If you write a custom getter/setter that never touches `field`, no backing field is generated at all — the property becomes purely computed, which matters when reasoning about memory and about what actually gets serialized.

**Say it:** "A Kotlin property bundles the field and its accessors into one declaration, and `field` inside a custom accessor is the only way to reach the actual backing storage — reference `name` there and you'd recurse infinitely."
**Red flag:** Writing `set(value) { name = value }` inside the setter for `name` — that calls the setter again instead of writing to `field`, causing infinite recursion and a stack overflow.

### var, val, and const
**They ask:** "What's the difference between `var`, `val`, and why do we also need `const`?"

`val` is a read-only *reference* — you can't reassign it — but the object it points to can still be mutable internally (a `val list = mutableListOf(...)` can still have items added). `var` allows reassignment. `const val` goes further: it's a true compile-time constant, inlined at every call site, and it's restricted to primitives and `String` at the top level or in a companion object — it can't hold a computed value.

```kotlin
val user = User("1", "Ann")     // reference can't change
user.name = "New"               // fine — object itself is mutable

const val MAX_RETRIES = 3        // compile-time constant, inlined
```

**Say it:** "`val` means the reference is fixed, not that the object is immutable — `const` is the one that's actually a compile-time constant, which is why it's limited to primitives and strings known at compile time."
**Red flag:** Calling a `val` "immutable" without qualification. A `val` holding a `MutableList` is still very mutable — immutability is a property of the object's type, not the reference keyword.

### Unit and Any Types
**They ask:** "Why do we need the `Unit` and `Any` types?"

`Unit` is Kotlin's equivalent of `void`, but it's a real type with a single instance (`Unit`) instead of "no type" — that matters because it lets a function-typed parameter uniformly return something, so generic higher-order functions don't need a special case for "returns nothing." `Any` is the root of the Kotlin type hierarchy — every non-nullable type is an `Any`, playing the role Java's `Object` plays, but `Any?` is required to also include null, since `Any` itself is non-nullable.

```kotlin
fun printAndReturn(x: Int): Unit { println(x) }   // Unit is implicit and optional to write
fun accept(x: Any?) { println(x) }                 // truly anything, including null
```

**Say it:** "`Unit` is `void` promoted to a real, single-instance type so higher-order functions don't need special-case handling for 'returns nothing,' and `Any` is the root type — but it's non-nullable, so `Any?` is what actually means 'anything.'"
**Red flag:** Assuming `Any` behaves like Java's `Object` for null. `Any` alone excludes null — you need `Any?` to accept it, which is easy to miss coming from Java.

### Scope Functions: let, run, with, apply, also
**They ask:** "What are Kotlin's scope functions, and how do you pick between `let`, `run`, `with`, `apply`, and `also`?"

They all execute a block against an object, but they differ on two axes: what the block returns, and how you refer to the receiver (`this` vs `it`) — picking the right one is about readability intent, not just mechanics.

```kotlin
user?.let { println(it.name) }              // null-check + use "it"; returns block result
val greeting = user.run { "Hi $name" }       // "this" context; returns block result
with(user) { println("$name, $id") }         // "this" context, not an extension; returns block result
val configured = User().apply { name = "A" } // "this" context; returns the receiver itself
user.also { logger.log("created $it") }      // "it" context; returns the receiver — for side effects
```

Rule of thumb: `apply`/`also` return the receiver (fluent config or side effects); `let`/`run`/`with` return the lambda's result (transform or compute). `let` is the one to reach for on nullable types because of `?.let`.

**Say it:** "I pick by what I need back — `apply` for configuring and returning the object itself, `let` for a nullable transform, `run` when I want `this`-style access but need the block's result, not the receiver."
**Red flag:** Chaining scope functions purely because they're idiomatic — nesting three `apply`/`let` calls to avoid one `if` is a readability regression, not an improvement.

### Higher-Order Functions and Function Types
**They ask:** "What are higher-order functions, and why do they matter in Kotlin?"

A higher-order function takes a function as a parameter or returns one — Kotlin makes this first-class with function types (`(Int) -> String`) and lambda syntax, instead of Java's workaround of a single-method interface. That's what makes callback-style APIs (click listeners, coroutine builders, collection operators) concise instead of ceremony-heavy.

```kotlin
fun retry(times: Int, block: () -> Unit) {
    repeat(times) { runCatching { block() }.onSuccess { return } }
}
retry(3) { fetchData() }
```

Under the hood a lambda compiles to a `Function` object (or, with `inline`, gets inlined directly with no allocation) — that's the connection to why `inline` exists for hot-path higher-order functions.

**Say it:** "Higher-order functions are what make Kotlin's collection API and coroutine builders read like control-flow instead of callback boilerplate — `map`, `filter`, and `launch` are all just functions that take a function."
**Red flag:** Not knowing that a non-inline lambda allocates a `Function` object per call — fine almost everywhere, but the reason `inline` exists for something called in a tight loop.

### Companion Objects
**They ask:** "What is a companion object, and how is it different from Java statics?"

Kotlin has no `static` keyword — a companion object is a single, named singleton instance tied to the class that gives you the equivalent of static members, but as a real object: it can implement an interface, extend a class, and be passed around as a value where a static member never could.

```kotlin
class User private constructor(val id: String) {
    companion object {
        fun create(id: String) = User(id)
    }
}
val user = User.create("42")
```

By default a companion member compiles to a nested object's instance member, not a true JVM static — calling it from Java goes through `Companion.create(...)` unless you add `@JvmStatic`, which is the interop escape hatch.

**Say it:** "A companion object gives me class-level members as a real singleton object instead of a static keyword — which is why it can implement interfaces — but from Java it's `Companion.method()` unless I add `@JvmStatic`."
**Red flag:** Assuming a companion object member is a true JVM static by default. It's an instance member of a hidden singleton — that's exactly why `@JvmStatic` needs to exist for clean Java interop.

### lateinit vs lazy
**They ask:** "What's the difference between `lateinit` and `lazy`, and how do you check if `lateinit` is initialized?"

Both defer initialization past declaration, but for different reasons and with different mechanics. `lateinit var` is for a `var` you'll assign from outside the constructor (Android's classic case: view binding in `onCreate`, or field injection) — it's your responsibility to set it before first read, and reading it early throws `UninitializedPropertyAccessException`. `lazy` is a `val` delegate that computes its value once, on first access, and caches it — the initializer is a closure you provide once, and thread-safety is configurable via `LazyThreadSafetyMode`.

```kotlin
lateinit var binding: ActivityMainBinding   // set later, e.g. in onCreate

val config: Config by lazy { loadConfigFromDisk() }  // computed once, on first use
if (::binding.isInitialized) { /* safe to use */ }
```

**Say it:** "`lateinit` is for a `var` I'll assign externally and is my responsibility to set before reading — `::prop.isInitialized` checks that safely — `lazy` is a `val` that computes and caches itself the first time it's touched."
**Red flag:** Using `lateinit` on a primitive type — it only works on non-null reference types, because it relies on a null sentinel internally to detect "not yet set."

### SAM Conversions and Fun Interfaces
**They ask:** "What are SAM conversions, and what's the `fun interface` keyword for?"

SAM (Single Abstract Method) conversion lets you pass a lambda anywhere a Java functional interface (like `Runnable` or `OnClickListener`) is expected — Kotlin auto-wraps the lambda into an implementation of that interface, which is why click listeners read as `view.setOnClickListener { ... }` instead of an anonymous inner class.

```kotlin
fun interface Validator { fun isValid(input: String): Boolean }
val notBlank = Validator { it.isNotBlank() }   // lambda becomes a Validator
```

`fun interface` extends the same convenience to your *own* Kotlin interfaces — mark a single-abstract-method interface `fun` and callers get to pass a lambda instead of an explicit anonymous object.

**Say it:** "SAM conversion is why I can pass a lambda for a Java functional interface like a click listener — `fun interface` brings that same lambda ergonomics to interfaces I define myself."
**Red flag:** Adding a second abstract method to a `fun interface` and being surprised the lambda syntax stops compiling — SAM conversion requires *exactly one* abstract method.

### Why Coroutines Instead of Threads
**They ask:** "Why do we need coroutines? Why not just use regular threads?"

A native `Thread` is expensive — megabytes of stack, real OS scheduling — so you can only run a few thousand concurrently before the system chokes, and there's no cheap way to "pause" one mid-task without blocking it. A coroutine is a *suspendable* computation: it can pause at a suspension point and release the underlying thread back to a pool, so thousands of coroutines can share a handful of real threads. That's the core trade: coroutines give you thread-like concurrency at a fraction of the cost, with structured lifecycle management on top (a coroutine is always tied to a `Job`/`Scope`, so it can be cancelled as a group).

```kotlin
viewModelScope.launch {
    val user = repository.fetchUser()   // suspends without blocking the thread
    _state.value = user
}
```

**Say it:** "Coroutines are cheap, suspendable units of work that release the thread instead of blocking it, so I get thread-like concurrency without the memory and scheduling cost of one native `Thread` per task — and cancellation comes for free through structured scopes."
**Red flag:** Calling coroutines "just threads with nicer syntax." They run on a thread pool but a suspended coroutine isn't occupying a thread at all — that distinction is the entire performance argument for using them.

### Coroutine Builders: launch, async, runBlocking
**They ask:** "What are the ways to start a coroutine, and how do `launch`, `async`, and `runBlocking` differ?"

`launch` fires off a coroutine and returns a `Job` — use it for work whose result you don't need back, like updating UI state. `async` returns a `Deferred<T>`, so you call `.await()` to get the result — use it when you need the return value, especially for parallel work. `runBlocking` bridges blocking and suspending code by blocking the current thread until the coroutine completes — it exists mainly for `main()` functions and tests, and using it inside an app's normal flow defeats the entire point of coroutines.

```kotlin
scope.launch { saveToDb(user) }                    // fire-and-forget, no return value

val deferred = scope.async { fetchUser() }          // returns Deferred<User>
val user = deferred.await()

fun main() = runBlocking { doSuspendingWork() }     // blocks the calling thread — entry points only
```

**Say it:** "`launch` is for work I don't need a result from, `async` is for work I do — I `await()` it — and `runBlocking` blocks the real thread, so it belongs at an entry point like `main()` or a test, never inside app code that's trying to stay non-blocking."
**Red flag:** Reaching for `runBlocking` inside a ViewModel or Activity to "just make the suspend function work." That reintroduces the exact main-thread blocking coroutines exist to avoid.

### Coroutine Dispatchers and Switching Context
**They ask:** "What are coroutine dispatchers, and how do you switch between them?"

A dispatcher decides which thread pool a coroutine runs on. `Dispatchers.Main` is the UI thread (Android's single main thread) for updating views; `Dispatchers.IO` is a large pool tuned for blocking I/O (network, disk, database); `Dispatchers.Default` is a pool sized to CPU cores, for CPU-bound work like parsing or sorting. `withContext` suspends the current coroutine and moves execution to a different dispatcher without blocking any thread — it's the standard way to hop off the main thread for work and back.

```kotlin
suspend fun loadUser(): User = withContext(Dispatchers.IO) {
    api.fetchUser()   // runs on the IO pool, not the caller's thread
}
```

Yes — you *can* technically call a network request from `Dispatchers.Main`, and it will suspend and free the main thread while waiting; the problem isn't a hard block, it's that you've made the main thread responsible for scheduling that work at all, which is why the convention is to dispatch I/O explicitly.

**Say it:** "Dispatchers pick which thread pool runs the coroutine — Main for UI, IO for blocking calls, Default for CPU work — and `withContext` is how I hop between them without ever blocking a thread."
**Red flag:** Doing all networking inside `Dispatchers.Main` "because suspend functions don't block." Technically true for well-behaved suspend functions, but it's still the wrong dispatcher — IO work belongs on the IO pool by convention and by resource isolation.

### Structured Concurrency, CoroutineScope, and GlobalScope
**They ask:** "What is a `CoroutineScope`, and why is `GlobalScope` discouraged?"

Structured concurrency means every coroutine has a parent scope, and cancelling the parent cancels every child — that's what prevents leaked work: an Activity or ViewModel that's destroyed should take its in-flight coroutines down with it. `viewModelScope` and `lifecycleScope` are Android's built-in scopes tied to component lifecycles for exactly this reason.

```kotlin
class MyViewModel : ViewModel() {
    fun load() {
        viewModelScope.launch { repository.fetchUser() }   // cancelled automatically on clear()
    }
}
```

`GlobalScope` opts out of structure entirely — a coroutine launched there lives until the process dies or you cancel it manually, with nothing tying it to any lifecycle. That's a leak waiting to happen: a screen navigates away, but the `GlobalScope` coroutine keeps running, holding references and doing wasted (or worse, harmful) work.

**Say it:** "Structured concurrency ties every coroutine to a parent scope so cancelling the parent cancels the children automatically — `GlobalScope` breaks that contract, which is why it's a leak risk rather than a convenience."
**Red flag:** Reaching for `GlobalScope.launch` to "make an error go away." It compiles, but it silently detaches the coroutine from the lifecycle that should own it.

### Coroutine Exception Handling
**They ask:** "How do you catch an error thrown inside a coroutine?"

`try`/`catch` around a `suspend` call works exactly like normal code and is the right tool for expected, recoverable failures at a specific call site. The complication is uncaught exceptions in `launch`: they propagate up and cancel the parent job (and its siblings, under a regular `Job`) — a `CoroutineExceptionHandler` installed on the scope catches what escapes, but only for `launch`, not `async` (an `async` failure is stored on the `Deferred` and only surfaces when you call `.await()`).

```kotlin
val handler = CoroutineExceptionHandler { _, e -> log(e) }
scope.launch(handler) {
    riskyWork()   // uncaught exception here goes to the handler
}
```

`SupervisorJob` changes the propagation rule so a failing child doesn't cancel its siblings — useful when you're launching independent tasks from one scope and one failure shouldn't take the others down.

**Say it:** "`try`/`catch` handles an expected failure at the call site; `CoroutineExceptionHandler` is the safety net for what escapes a `launch` — and if I don't want one failing child to cancel its siblings, that's what `SupervisorJob` is for."
**Red flag:** Wrapping an `async` block in `try`/`catch` around the `async {}` call itself instead of around `.await()`. The exception doesn't surface until you await the `Deferred` — catching around the launch does nothing.

### Job, Deferred, and Running Requests in Parallel
**They ask:** "What is a `Job`? What's `Deferred` for, and how do you run two requests in parallel?"

A `Job` is the handle to a coroutine's lifecycle — you can check if it's active, cancel it, or wait for it to complete (`join()`). `Deferred<T>` extends `Job` and adds a return value you retrieve with `await()` — it's the coroutine equivalent of a `Future`/`Promise`.

To run work in parallel rather than sequentially, start both with `async` *before* awaiting either — awaiting immediately after each `async` call serializes them right back into sequential execution, which is the classic mistake.

```kotlin
suspend fun loadDashboard(): Dashboard = coroutineScope {
    val userDeferred = async { fetchUser() }
    val postsDeferred = async { fetchPosts() }     // starts concurrently with the line above
    Dashboard(userDeferred.await(), postsDeferred.await())
}
```

**Say it:** "`Job` is the cancellable handle to a coroutine's lifecycle, `Deferred` adds a result I get via `await()` — and true parallelism means starting both `async` calls first, then awaiting both, not awaiting each one right after starting it."
**Red flag:** Writing `val a = async { x() }.await(); val b = async { y() }.await()`. That's sequential execution with extra ceremony — the two `async` calls never overlap.

### Sealed Classes
**They ask:** "What is a `sealed class`, and why would you reach for one?"

A `sealed class` restricts its subtypes to a known, closed set defined in the same module — which lets the compiler exhaustively check a `when` over it with no `else` branch needed. That's the real payoff: add a new subtype later, and every `when` that handles the sealed hierarchy fails to compile until you handle the new case — the compiler finds every call site for you instead of you hunting for them.

```kotlin
sealed class UiState {
    data object Loading : UiState()
    data class Success(val data: List<Item>) : UiState()
    data class Error(val message: String) : UiState()
}

fun render(state: UiState) = when (state) {   // exhaustive, no else needed
    UiState.Loading -> showSpinner()
    is UiState.Success -> showList(state.data)
    is UiState.Error -> showError(state.message)
}
```

**Say it:** "A sealed class gives me an exhaustive `when` — the compiler forces every branch to be handled, so adding a new state later breaks the build at every place I forgot to update it, instead of failing silently at runtime."
**Red flag:** Adding an `else` branch to a `when` over a sealed type "just to be safe." That silently swallows the compiler's exhaustiveness check — the entire benefit of using `sealed` in the first place.

### Inline Functions, Reified Types, noinline, and crossinline
**They ask:** "What does `inline` do, why does `reified` only work in inline functions, and what are `noinline`/`crossinline` for?"

`inline` tells the compiler to paste the function's bytecode directly at every call site instead of a real function call — that removes both the lambda allocation for its function-type parameters and the call overhead, which is why hot-path stdlib functions like `let`, `apply`, and `filter` are all `inline`.

Because the function body is copied into the caller, the type parameter's actual class is known at compile time at that call site — that's what `reified` exploits: it lets you use `T::class` or `is T` inside a generic function, which is normally erased and unavailable at runtime.

```kotlin
inline fun <reified T> Gson.fromJson(json: String): T = fromJson(json, T::class.java)
```

`noinline` opts a specific lambda parameter out of inlining (needed if you want to store it or pass it to a non-inline function). `crossinline` forbids a lambda parameter from doing a non-local `return` — required when that lambda will run inside another execution context (like a nested `Runnable`) where returning from the outer function wouldn't make sense.

**Say it:** "`inline` copies the function body to the call site, which is what makes `reified` possible — the type isn't erased at that point — and `noinline`/`crossinline` fine-tune which lambda parameters keep or lose that inlining behavior."
**Red flag:** Marking a large function `inline` purely "for performance" without a lambda parameter to justify it. Inlining bloats bytecode at every call site — it only pays off when it removes a lambda allocation or enables `reified`.

### Delegated Properties
**They ask:** "What are delegates in Kotlin, and what does the `lazy` delegate actually do?"

A delegate hands off a property's `get`/`set` implementation to another object via `by`, so common patterns (lazy init, observing changes, storing in a map) become reusable instead of hand-rolled in every class. `by lazy { ... }` is the standard-library delegate for lazy initialization — it wraps your initializer, caches the result after the first access, and by default is thread-safe (synchronized) unless you pass `LazyThreadSafetyMode.NONE`.

```kotlin
val expensiveResource: Resource by lazy { loadResource() }   // computed once, on first read

var name: String by Delegates.observable("") { _, old, new ->
    println("changed from $old to $new")
}
```

Under the hood, `by` compiles to calling `getValue`/`setValue` on the delegate object — you can write your own delegate by implementing those two operator functions.

**Say it:** "`by` hands a property's get/set to a delegate object, so `lazy` gives me thread-safe, compute-once-on-first-access initialization without writing that caching logic myself every time."
**Red flag:** Using `by lazy` for a property whose value can legitimately change over the object's lifetime. `lazy` computes exactly once — it's for one-time expensive setup, not for a value you expect to recompute.

### Sequence vs Collection
**They ask:** "What is a `Sequence`, and what's the advantage over a regular collection operation chain?"

`List`/collection operators (`map`, `filter`, …) are *eager*: each call produces a whole new intermediate list before the next operator runs, so a chain of five operators over a million-element list allocates five million-element intermediate lists. `Sequence` is *lazy*: operators are composed but nothing runs until a terminal operation (`toList()`, `first()`, `sum()`) pulls elements through the whole pipeline one at a time.

```kotlin
val result = list.asSequence()
    .filter { it.isActive }
    .map { it.toDto() }
    .take(10)
    .toList()   // only now does anything actually execute, and only enough to get 10
```

That laziness is what makes `take(10)` on a `Sequence` genuinely short-circuit — the eager `List` version would still filter and map every element before taking 10.

**Say it:** "`Sequence` is lazy — no intermediate collections, and a terminal op like `take` can short-circuit the whole pipeline — so I reach for it on large data or when I don't need every element processed."
**Red flag:** Wrapping a small, already-in-memory list (say, under a few hundred items) in `asSequence()` for every chain "for performance." The lazy machinery has its own overhead — it only pays off with real data volume or genuine short-circuiting.

### Named and Default Arguments
**They ask:** "How do default parameters work in Kotlin, for both methods and constructors?"

Default parameters exist to kill the Java pattern of overloading a method three times just to offer optional arguments — you give a parameter a default value in the signature itself, and callers only pass what they want to override. Combined with named arguments, callers can also skip straight to a later parameter without repeating the ones before it, which matters once a function has several optional settings.

```kotlin
fun createUser(name: String, isAdmin: Boolean = false, age: Int = 18) { /* ... */ }

createUser("Ann")                       // isAdmin and age use defaults
createUser("Ann", age = 25)             // skip isAdmin by name, override age
```

A constructor works the same way — one primary constructor with defaults often replaces what Java would need several overloaded constructors to express. The one rule to know: once you name an argument, every argument after it in the call can be unordered, but positional arguments must still come first.

**Say it:** "Default parameters replace constructor/method overloading — one signature with sensible defaults — and named arguments let a caller override just the one setting that matters without repeating everything before it."
**Red flag:** Writing three overloaded Java-style functions in Kotlin to fake optional parameters. That's solving a problem the language already solves — it's a tell that someone hasn't internalized default arguments yet.

### Extension Functions
**They ask:** "What are extension functions, and how do you call one from Java?"

Extension functions let you add a method to a class you don't own — a final class, a library type, even a built-in like `String` — without inheritance or a wrapper class. That matters on Android specifically because so much of the SDK is Java classes you can't subclass or edit; extensions are how Kotlin code still gets to write `view.isVisible()` instead of a static utility method taking the view as a parameter.

```kotlin
fun String.isValidEmail(): Boolean = contains("@") && contains(".")

val ok = "a@b.com".isValidEmail()   // reads like a real member, but isn't one
```

Under the hood it's a compiler trick, not real injection into the class: an extension compiles to a static method taking the receiver as its first parameter, so it can't access private members and is resolved statically at compile time based on the declared type, not the runtime type. Calling one from Java looks exactly like calling that generated static method — `StringUtilsKt.isValidEmail("a@b.com")` — through the synthetic `FileNameKt` class Kotlin generates for top-level functions.

**Say it:** "An extension function is a static method in disguise — the receiver becomes the first parameter under the hood — which is why it can't touch private members and why Java calls it as a static method on the generated `FileNameKt` class."
**Red flag:** Assuming an extension function is resolved polymorphically like a real member override. It's resolved statically by the declared type at the call site, not the runtime type — a classic surprise when an extension is called through a supertype reference.

### Lambda Expressions and Trailing Lambda Syntax
**They ask:** "What's the syntax for a Kotlin lambda, and what's 'trailing lambda syntax' for?"

A lambda is an anonymous block of code you can pass around as a value — `{ x, y -> x + y }` — and Kotlin gives it special call-site syntax specifically because lambdas are so common in idiomatic Kotlin (collection operators, coroutine builders, click listeners). When a function's *last* parameter is a lambda, you can move it outside the parentheses — and if it's the *only* parameter, you can drop the parentheses entirely.

```kotlin
list.filter({ it > 0 })     // valid, but not idiomatic
list.filter { it > 0 }      // trailing lambda syntax — the common style

val sum = { a: Int, b: Int -> a + b }   // multi-param lambda, explicit names
list.map { it * 2 }                      // single param, implicit "it"
```

`it` is the implicit name for a lambda's single parameter — available only when there's exactly one parameter and you didn't name it yourself; naming becomes mandatory once there's more than one, or when nesting lambdas would make an implicit `it` ambiguous.

**Say it:** "Trailing lambda syntax is why `setOnClickListener { ... }` and `list.filter { ... }` read like control-flow keywords instead of function calls with an anonymous-class argument — it's a real syntax rule, not just a style convention."
**Red flag:** Nesting two lambdas and relying on `it` in both. The inner `it` shadows the outer one silently — name at least the outer parameter explicitly once you're nesting.

### Type Checks and Casts — is and as
**They ask:** "How do you check a type at runtime in Kotlin, and what's the difference between `as` and `as?`?"

`is` checks whether a value is a given type at runtime — Kotlin's answer to Java's `instanceof` — and it does more than answer a boolean: inside the branch where an `is` check succeeded, Kotlin smart-casts the variable to that type automatically, no manual cast needed afterward.

```kotlin
fun describe(x: Any) {
    if (x is String) {
        println(x.length)   // smart-cast: x is treated as String here, no explicit cast
    }
}

val str = x as String    // throws ClassCastException if x isn't a String
val safe = x as? String  // null instead of throwing if the cast fails
```

`as` force-casts and throws `ClassCastException` on a mismatch; `as?` is the safe variant that returns `null` instead — pick `as?` whenever the value's type is genuinely uncertain, and reserve plain `as` for casts you can prove will always succeed.

**Say it:** "`is` doubles as a smart-cast — no separate cast needed once the check passes — and `as?` is the safe-cast escape hatch that turns a potential `ClassCastException` into a null I can handle instead of a crash."
**Red flag:** Reaching for `as` when the type genuinely might not match, "because it usually works." That's a `ClassCastException` waiting for the one input that breaks the assumption — `as?` plus a null check is the correct default when uncertain.

### Mutable vs Immutable Collections
**They ask:** "Why does Kotlin divide collections into mutable and immutable, and what's the difference?"

Java has one `List` interface with optional support for mutation (`UnsupportedOperationException` at runtime if you call `add` on an immutable one — a runtime surprise). Kotlin splits that into the type system instead: `List`/`Set`/`Map` expose only read operations, `MutableList`/`MutableSet`/`MutableMap` add `add`/`remove`/`put` — so "can this be mutated" is a compile-time fact visible in the signature, not something you discover by calling the wrong method and catching an exception.

```kotlin
val readOnly: List<Int> = mutableListOf(1, 2, 3)   // view is read-only...
val mutable = readOnly as? MutableList<Int>         // ...but the underlying object might still be mutable

val readOnlyLiteral: List<Int> = listOf(1, 2, 3)    // read-only — but not guaranteed immutable underneath
```

The sharp edge: `List` in Kotlin means "this reference can't mutate," not "this object can never change" — a `List` and a `MutableList` reference can point at the *same* underlying mutable list, so something else holding the mutable reference can still change what your read-only view sees. Even `listOf(...)` isn't an exception to that: it hands back a *read-only* `List`, not a type-system guarantee that the backing collection is genuinely immutable — the interface just has no mutating methods, so nothing *through that reference* can add to it. If you need strict, structural immutability (no aliasing hazard at all), reach for a persistent/immutable-collection library (e.g. `kotlinx.collections.immutable`'s `PersistentList`) instead of assuming `List` provides it.

**Say it:** "Kotlin encodes mutability in the type — `List` vs `MutableList` — so it's a compile-time signal in the function signature instead of a runtime `UnsupportedOperationException`. The catch: a `List` reference, including one from `listOf(...)`, is a read-only *view*, not a guarantee the underlying object is frozen — for that you'd reach for a persistent-collections library."
**Red flag:** Treating a function parameter typed `List<T>` — or the result of `listOf(...)` — as proof the data can never change elsewhere. It only promises *this reference* won't mutate it — a `MutableList` alias elsewhere can still edit the same backing collection.

### What Is a suspend Function
**They ask:** "What does the `suspend` keyword actually do?"

`suspend` marks a function as one that can pause and resume without blocking the thread it's running on — that's the entire mechanism coroutines are built from. Marking a function `suspend` doesn't make it run in the background by itself; it just makes it *legal* to call other suspend functions from inside it (like a delay or a network call) and to be paused at those points.

```kotlin
suspend fun fetchUser(id: String): User {
    delay(100)              // suspension point — releases the thread instead of blocking it
    return api.getUser(id)  // another suspend call
}
```

A `suspend` function can only be called from another `suspend` function, or from a coroutine builder like `launch`/`async` — that's the compiler enforcing that suspension only happens inside something set up to actually suspend. Under the hood, the compiler transforms a suspend function via continuation-passing style, but you don't need the mechanics to use it correctly — just the rule: `suspend` functions can pause; regular functions can't.

**Say it:** "`suspend` just marks a function as pausable — it doesn't run it on a background thread by itself — and the compiler enforces that you can only call it from another suspend function or a coroutine builder, which is what keeps suspension points explicit."
**Red flag:** Calling a `suspend` function "asynchronous" as if that's automatic. It's pausable, not automatically backgrounded — which dispatcher it actually runs on still depends on the coroutine's context (`Dispatchers.Main`, `IO`, etc.), not the `suspend` keyword itself.
