# Swift — language

### Optionals and Safe Unwrapping
**They ask:** "Walk me through Swift's optionals — why does the language force you to unwrap them, and what are the safe ways to do it?"

Optionals exist to kill `nil`-crash bugs at compile time instead of runtime. Objective-C let any pointer silently be `nil`; Swift makes "this may have no value" part of the type (`String?` vs `String`), so the compiler forces you to handle the absence before you can use the value. That's the entire pitch — it moves a whole category of crash from production to a compiler error.

```swift
var name: String? = fetchName()

if let unwrapped = name { print(unwrapped) }        // optional binding
guard let unwrapped = name else { return }           // early exit, unwrapped stays in scope after
let safe = name ?? "default"                          // nil-coalescing
let value = name!                                     // force unwrap — crashes if nil
```

`guard let` is the senior default for early-return code because the unwrapped value stays available for the rest of the function, unlike `if let`, which scopes it to the block. Force unwrap (`!`) and implicitly-unwrapped optionals (`String!`) are for the narrow case where `nil` really is a programmer error (an `@IBOutlet` that must exist after `viewDidLoad`), not a normal control-flow branch.

**Say it:** "Optionals push the nil check into the type system — I reach for `guard let` for early exits and reserve force-unwrap for genuine invariants, never as a shortcut."
**Red flag:** Sprinkling `!` to make the compiler stop complaining. That's not handling the optional, it's postponing the crash to runtime.

### Closures
**They ask:** "What is a closure in Swift and why is it useful?"

A closure is a self-contained block of functionality that captures and stores references to variables from its surrounding scope — the same concept as a function, except it can be passed around as a value and it "closes over" its environment. That capture is the whole point: it's what lets you hand a completion handler to an async API and still have it see the local state that existed when you created it.

```swift
func loadUsers(completion: @escaping ([User]) -> Void) {
    URLSession.shared.dataTask(with: url) { data, _, _ in
        let users = try? JSONDecoder().decode([User].self, from: data ?? Data())
        completion(users ?? [])
    }.resume()
}
```

`@escaping` matters because it changes the closure's lifetime story: a non-escaping closure (the default) is guaranteed to run before the function returns, so the compiler can be lax about capture semantics. An escaping closure — stored for later, like a completion handler — can outlive the function, which is exactly where `[weak self]` capture lists become a memory-management question, not just a syntax detail.

**Say it:** "A closure is a function value that captures its environment; the moment it escapes the current scope — a stored completion handler — its capture list becomes a memory-lifetime decision, not just syntax."
**Red flag:** Not knowing why `@escaping` exists, or capturing `self` strongly in a closure stored on a long-lived object without thinking about the retain cycle.

### Value Types vs Reference Types
**They ask:** "class vs struct vs enum — how do you decide, and what's actually different at runtime?"

The decision is about identity versus value. A `class` is a reference type: two variables can point at the *same* instance, mutating through one is visible through the other, and it lives on the heap with ARC-managed lifetime. A `struct` (and `enum`) is a value type: assignment copies, mutation is local, and Swift's collections (`Array`, `Dictionary`) are structs internally, which is why they're safe to pass around without defensive copying.

```swift
struct Point { var x: Int }     // copy on assignment
class Counter { var value = 0 } // shared on assignment

var a = Point(x: 1)
var b = a           // b is a fully independent copy
b.x = 2              // a.x is still 1

let c1 = Counter()
let c2 = c1          // c2 and c1 point at the same object
c2.value = 5          // c1.value is now 5 too
```

Apple's own guidance: default to `struct` unless you specifically need reference semantics (shared mutable state, identity comparison, or Objective-C interop via `@objc`). Value types eliminate a whole class of aliasing bugs and are what make SwiftUI's "state drives a fresh view tree" model tractable — a `View` is a struct precisely so recomputing it is cheap and side-effect-free. `enum` adds a third axis: a closed set of cases, each of which can carry its own associated values, which makes illegal states unrepresentable in a way a class-based hierarchy can't.

**Say it:** "I default to struct for value semantics and predictable copies; I reach for class only when I need shared, mutable identity — and enums when the model is a closed set of mutually exclusive states."
**Red flag:** Defaulting to `class` out of Objective-C habit, then being surprised when a "shared" struct doesn't mutate the way a reference would.

### Protocol-Oriented Programming and Generics
**They ask:** "What is protocol-oriented programming, and how do generics fit into it?"

Protocol-oriented programming (POP) is Swift's answer to "favor composition over inheritance." Instead of building a class hierarchy and inheriting shared behavior, you define a protocol describing a capability, then supply the default implementation via a protocol extension — any type that conforms gets the behavior for free, including structs and enums, which can't inherit at all.

```swift
protocol Fetchable {
    associatedtype Item
    func fetch() async throws -> [Item]
}

extension Fetchable {
    func fetchOrEmpty() async -> [Item] {
        (try? await fetch()) ?? []
    }
}
```

Generics are what make this composable without losing type safety: a generic function or type is written once against a placeholder type and specialized at the call site, so `Fetchable`'s `associatedtype Item` lets one protocol describe "fetches a collection of *something*" instead of writing `UserFetcher`, `PostFetcher`, `CommentFetcher` by hand. The combination — protocols for the contract, extensions for shared default behavior, generics for the type-safe placeholder — is why Swift's standard library (`Array`, `Sequence`, `Collection`) is built almost entirely out of protocols rather than a class tree.

**Say it:** "POP composes behavior through protocol extensions instead of inheritance, and generics keep that composition type-safe — that's how structs and enums get shared behavior without a class hierarchy."
**Red flag:** Reaching for a base class to share code across unrelated types when a protocol extension would work on structs, enums, *and* classes.

### Opaque Types vs Existentials
**They ask:** "What's the difference between an opaque return type (`some`) and an existential (`any`), and where does `any` cost you?"

Both let a function return "something conforming to this protocol" without naming the concrete type — the difference is *when* the concrete type is fixed. `some View` (an opaque type) commits to one specific, concrete type at compile time; the compiler knows exactly what it is, it's just hidden from the caller. `any View` (an existential) can hold *different* conforming types at runtime behind a boxed wrapper, which needs dynamic dispatch and, for non-class-bound protocols, extra heap allocation for the existential container.

```swift
func makeRow() -> some View { Text("Hi") }           // one concrete type, static dispatch, no boxing
func makeRow(flag: Bool) -> any View {                 // could be Text OR Image, needs the box
    flag ? Text("Hi") : Image(systemName: "star")
}
```

That's why SwiftUI's `body` is `some View`: every call site returns the *same* concrete view tree type, so the compiler can specialize and inline aggressively. `any` is for genuine runtime polymorphism — a heterogeneous array of shapes, a delegate whose concrete type varies — and you pay for that flexibility in indirection and, until recent language versions, in not being able to use it with `associatedtype` protocols at all.

**Say it:** "`some` is a compile-time-fixed concrete type behind an opaque interface — static dispatch, no boxing; `any` is genuine runtime polymorphism, which costs an existential container and dynamic dispatch."
**Red flag:** Using `any` everywhere "to be safe" — it's the slower, boxed option, and Swift will flag it explicitly in modern versions precisely because it's easy to reach for without noticing the cost.

### ARC, Retain Cycles, and Noncopyable Types
**They ask:** "How does ARC work, and where do retain cycles actually creep in?"

ARC (Automatic Reference Counting) tracks how many strong references point at a class instance and deallocates it the instant that count hits zero — it's compile-time inserted retain/release calls, not a background garbage collector, which is why iOS apps don't have GC pauses. The failure mode is a retain cycle: two objects hold strong references to each other, so neither count ever reaches zero and both leak for the app's lifetime.

```swift
class ViewModel {
    var onUpdate: (() -> Void)?
}
class ViewController {
    let viewModel = ViewModel()
    func bind() {
        viewModel.onUpdate = { self.render() }        // leak: closure strongly captures self,
                                                         // viewModel strongly held by self
        viewModel.onUpdate = { [weak self] in self?.render() }  // fixed
    }
}
```

The fix is breaking the cycle with `weak` (the reference can become `nil`, so it must be an `Optional`) or `unowned` (assumes the referenced object always outlives the reference — a crash, not `nil`, if that assumption is wrong). Delegates are the canonical case: a delegate property is declared `weak var delegate: SomeDelegate?` because the delegating object shouldn't keep its delegate alive. Swift 5.9+ adds `~Copyable` (noncopyable) types for the opposite problem — enforcing *unique* ownership at compile time, so a resource like a file handle can't be silently duplicated the way a struct normally would be.

**Say it:** "ARC deallocates the instant the strong-reference count hits zero, so a leak is always two objects strongly holding each other — I break it with `weak` when the reference can legitimately become nil, `unowned` when it can't outlive its owner."
**Red flag:** Reaching for `unowned` by default because it's less typing than `weak self` — if that assumption about lifetime is ever wrong, it's a crash instead of a graceful nil.

### Objective-C Interop and Memory Attributes
**They ask:** "How does Swift bridge to Objective-C, and what do the old ownership attributes (`strong`/`weak`/`copy`/`assign`) actually mean?"

Bridging exists because iOS still ships with decades of Objective-C frameworks, and Swift needs to call into them (and vice versa) without a rewrite. The compiler auto-bridges common types — `NSString` ↔ `String`, `NSArray` ↔ `Array` — and `@objc`/`NSObject` subclassing exposes a Swift type to the Objective-C runtime when you need dynamic dispatch, `@selector`, or KVO, all of which are Objective-C-runtime features Swift itself doesn't have natively.

Objective-C property attributes map directly onto what ARC does in Swift, just spelled differently: `strong` is a normal strong reference (Swift's default for `class` properties), `weak` is the same zeroing-weak reference Swift has, `assign` is an *unsafe* unretained raw pointer (no lifetime management at all — Swift's closest equivalent is `unowned(unsafe)`), and `copy` duplicates the value on assignment, which is why `NSString` properties are declared `copy` — it protects you from the caller mutating an `NSMutableString` out from under you after assignment.

```objc
@property (nonatomic, weak) id<Delegate> delegate;     // zeroing weak, like Swift's weak
@property (nonatomic, copy) NSString *name;             // defensive copy on set
@property (nonatomic, assign) NSInteger count;           // value type, no ARC involved
```

**Say it:** "Objective-C's `strong`/`weak`/`assign`/`copy` are the same ARC concepts Swift has, just declared per-property instead of inferred — `copy` is the one with no direct Swift equivalent, and it exists to stop a caller's mutable object from changing your value after the fact."
**Red flag:** Treating `assign` and `weak` as interchangeable — `assign` doesn't zero out on deallocation, so it's a dangling-pointer crash waiting to happen; it's only safe for non-object value types today.

### Static vs Dynamic Dispatch
**They ask:** "How does Swift decide between static and dynamic dispatch, and why does it matter for performance?"

Static dispatch resolves *which* function implementation runs at compile time — the compiler can inline it, and it's the fast path. Dynamic dispatch resolves it at runtime through a vtable (classes) or witness table (protocols/existentials) lookup, which is what makes overriding and protocol polymorphism possible, at the cost of an indirection the compiler can't optimize away.

Swift picks static dispatch by default for structs, enums, global functions, and anything marked `final`, because there's nothing to override. Classes use dynamic dispatch for any method that *can* be overridden — unless you mark the class or method `final`, which tells the compiler "no subclass will ever override this" and lets it dispatch statically again.

```swift
final class Cache { func read() -> Data { ... } }   // final ⇒ static dispatch, can be inlined
class Base { func read() -> Data { ... } }            // dynamic dispatch — vtable lookup every call
```

This is a real, measurable cost in hot paths — a tight loop calling a non-final class method through a protocol existential pays for the indirection on every iteration. Marking types and methods `final` when you know they won't be subclassed is a legitimate, low-risk performance optimization, not premature.

**Say it:** "Structs and `final` classes dispatch statically and can be inlined; open class methods and existential protocol calls go through a vtable or witness table — in a hot loop, `final` is a real, cheap win."
**Red flag:** Assuming all Swift method calls cost the same. They don't — the dispatch mechanism is decided by whether the compiler can prove the concrete type ahead of time.

### resultBuilder
**They ask:** "What is `@resultBuilder` and how does SwiftUI use it?"

`@resultBuilder` is a compile-time transform that turns a sequence of expressions written in a block into a single composed value — it's the language feature underneath SwiftUI's `body { }` syntax, letting you write a list of views as if it were a DSL when it's really being rewritten into nested `buildBlock`/`buildEither`/`buildOptional` calls that stitch views together into one tree.

```swift
@ViewBuilder
var body: some View {
    Text("Hi")
    if isLoggedIn { Text("Welcome back") }   // rewritten via buildEither/buildOptional
}
```

Behind the scenes the compiler rewrites that block into calls against a type conforming to `@resultBuilder`, most visibly `buildBlock(_:)` for a straight-line list of views and `buildEither(first:)`/`buildOptional(_:)` for `if`/`switch` branches — which is exactly why `if` inside a SwiftUI view builder can only branch between view *types*, not run arbitrary imperative logic. You can write your own result builder for the same reason SwiftUI did: to give a DSL-like syntax to something that's really building up a value (a string, a layout description, a query) piece by piece.

**Say it:** "`@resultBuilder` is what turns SwiftUI's declarative `body` block into a real composed view tree at compile time — `if`/`switch` inside it work because the builder implements `buildEither`, not because SwiftUI runs arbitrary control flow."
**Red flag:** Treating a `@ViewBuilder` block like ordinary imperative code — no loops without `ForEach`, no more than 10 siblings without grouping, because the compiler is generating nested generic types, not executing a script.
