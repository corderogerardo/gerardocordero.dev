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

### var vs let
**They ask:** "When do you use `var` versus `let`, and why does Swift push you toward `let`?"

Swift defaults to immutability because a value that can't change is one entire category of bug you don't have to reason about — you never have to trace where it might have been mutated. `let` declares a constant: assign it once, and any further assignment is a compile error. `var` declares a mutable variable you can reassign as many times as you want. The convention is to declare everything `let` first, and only change to `var` when the compiler actually complains that you're reassigning it.

```swift
let maxRetries = 3          // never changes — let
var attempt = 0              // changes each loop — var
attempt += 1
```

**Say it:** "I default to `let` and only reach for `var` when the compiler tells me a value genuinely needs to change — immutable-by-default catches a class of bugs before they exist."
**Red flag:** Declaring everything `var` out of habit. It's not just style — a `let` you can't accidentally reassign is a guarantee the compiler enforces for you, for free.

### Access Control in Swift
**They ask:** "Walk me through Swift's access levels — private, fileprivate, internal, package, public, open."

Access control exists to draw a hard line around a type's implementation details so the rest of the codebase — or consumers of your framework — can only touch what you deliberately expose, which is what makes refactoring internals safe. From most to least restrictive: `private` (visible only inside the enclosing declaration and any extensions of that type in the same file), `fileprivate` (visible anywhere in the same file), `internal` (the default — visible anywhere in the same module), `package` (visible anywhere in the same package/build unit, spanning multiple modules — for multi-module apps that want to share code without making it fully `public`), `public` (visible outside the module, but not subclassable/overridable from outside), and `open` (public, plus subclassable and overridable from outside the module).

```swift
public class Account {
    private var balance: Double = 0          // only Account (and same-file extensions) can touch this
    public func deposit(_ amount: Double) { balance += amount }   // the only sanctioned way to change it
}
```

**Say it:** "`internal` is the default and covers most app code; I reach for `private` to lock down implementation details, `package` when I need to share across modules in the same build without going fully public, and `public`/`open` only at a module boundary — `open` specifically when I want external code to subclass."
**Red flag:** Marking everything `public` in a framework "to be safe." That locks you into every property and method as permanent API surface — you can't tighten it later without a breaking change.

### Extensions
**They ask:** "What are Swift extensions for, and what can't they do?"

Extensions add functionality to an existing type — including ones you don't own, like `String` or a UIKit class — without subclassing or modifying the original source. That's the whole value: it lets you organize code by capability (a `Date+Formatting` extension) instead of cramming everything into one type definition, and it's how you retroactively make a type conform to a protocol.

```swift
extension String {
    var isValidEmail: Bool { contains("@") && contains(".") }
}

extension Int: Identifiable {   // retroactively conform a type you don't own
    public var id: Int { self }
}
```

An extension can add computed properties, methods, initializers, and protocol conformances, but it cannot add stored properties or override existing methods — because it doesn't get its own storage layout, and adding one after the fact would break every existing instance of the type.

**Say it:** "Extensions let me add behavior — including protocol conformance — to a type I don't own, without subclassing; the one thing they can't do is add stored properties, because they don't get their own memory layout."
**Red flag:** Trying to add a stored property in an extension and being surprised it doesn't compile — that's not a syntax gap, it's because extensions don't allocate storage.

### Structs, Tuples, and Enums
**They ask:** "Give me the quick version — what's a struct, a tuple, and an enum in Swift, and when do you reach for each?"

These are Swift's three lightweight ways to group data, and each earns its place for a different shape of problem. A **struct** is a named value type with properties and methods — reach for it the moment the data has a stable shape you'll reuse (a `User`, a `Point`). A **tuple** is an unnamed, ad-hoc grouping of values — good for a quick, local return of 2-3 related values that don't deserve their own named type. An **enum** models a *closed set of cases* — a value that's exactly one of a fixed list of options, optionally carrying its own data per case.

```swift
struct User { let id: Int; let name: String }        // reusable, named shape
func minMax(_ nums: [Int]) -> (min: Int, max: Int)? {  // tuple: quick, local, throwaway
    guard let lo = nums.min(), let hi = nums.max() else { return nil }   // empty array — no crash
    return (lo, hi)
}
enum Direction { case north, south, east, west }        // closed set of cases
```

**Say it:** "I reach for a struct when the data has a shape I'll reuse, a tuple for a quick local grouping that doesn't deserve a name, and an enum the moment the value is genuinely one of a fixed, closed set of options."
**Red flag:** Returning a tuple from a public API instead of a named struct. It works, but it gives callers no labels to lean on at the call site and no room to grow without breaking every caller.

### Computed Properties vs Stored Properties
**They ask:** "What's the difference between a stored and a computed property?"

A **stored** property holds an actual value in memory — assign it, and it stays until you assign again. A **computed** property holds no storage at all; instead it runs a `get` (and optionally `set`) block every time you access it, deriving its value from other properties. The distinction matters because a computed property is never stale — it always reflects its current inputs — at the cost of recomputing on every access, versus a stored value that's cheap to read but has to be kept in sync manually.

```swift
struct Rectangle {
    var width: Double
    var height: Double
    var area: Double { width * height }   // computed — always current, recalculated on read
}
```

**Say it:** "A stored property holds a value; a computed property derives one on every access — I reach for computed when the value must never go stale relative to its inputs, and accept the small recompute cost."
**Red flag:** Storing a derived value (like `area`) and manually updating it everywhere `width`/`height` change. That's exactly the staleness bug a computed property exists to eliminate.

### guard vs if let
**They ask:** "`guard let` versus `if let` — when do you reach for each?"

Both safely unwrap an optional, but they differ in what happens to scope. `if let` binds the unwrapped value only *inside* the `if` block — once you leave it, the binding is gone. `guard let` requires an early exit (`return`, `continue`, `throw`) in its `else` branch, and in exchange the unwrapped value stays available for the *rest* of the enclosing scope, not just one block.

```swift
func greet(_ name: String?) {
    guard let name else {          // Swift 5.7+ shorthand: guard let name = name
        print("no name"); return
    }
    print("Hello, \(name)")         // name is available for the rest of the function
}
```

The senior default for early-return validation code is `guard let`, precisely because it avoids the "pyramid of doom" — nested `if let`s marching the code rightward — and keeps the happy path un-indented and readable top to bottom.

**Say it:** "`if let` scopes the unwrapped value to one block; `guard let` forces an early exit but keeps the value available for the rest of the function — I default to `guard let` for validation because it keeps the happy path flat instead of nested."
**Red flag:** Nesting three or four `if let`s instead of a chain of `guard let`s. It compiles, but it's the exact "pyramid of doom" `guard` exists to flatten.

### Error Handling with throws, try, and catch
**They ask:** "How does Swift's error handling work — `throws`, `try`, `do`/`catch`?"

Swift models recoverable failure as part of a function's *type signature*, not an exception that can silently propagate from anywhere. A function marked `throws` can fail by throwing a value conforming to `Error`; calling it requires `try`, which is a visible marker at the call site that this call can fail — nothing is hidden. You handle the failure with `do { try ... } catch { ... }`, or propagate it further by marking your *own* function `throws` too.

```swift
enum NetworkError: Error { case invalidURL, noConnection }

func fetchUser(id: Int) throws -> User {
    guard id > 0 else { throw NetworkError.invalidURL }
    return User(id: id, name: "Ada")
}

do {
    let user = try fetchUser(id: 1)
} catch NetworkError.invalidURL {
    print("bad id")
} catch {
    print("other failure: \(error)")
}
```

`try?` converts the result to an `Optional` (nil on failure, discarding the error), and `try!` force-runs it and crashes on failure — same escape-hatch trade-off as force-unwrapping an optional, and just as narrowly justified.

**Say it:** "`throws` puts 'this can fail' in the function's signature, and `try` marks every call site that can propagate that failure — nothing fails silently, unlike an untyped exception that could come from anywhere."
**Red flag:** Reaching for `try!` to silence the compiler instead of actually handling the error. It's a force-unwrap in disguise — it crashes at the exact moment the error handling was supposed to prevent that.

### Defining and Conforming to a Protocol
**They ask:** "What is a protocol in Swift, and how does a type conform to it?"

A protocol is a contract — it declares a set of methods, properties, or requirements a conforming type must implement, without providing any implementation itself (unless you add one via an extension). It's how Swift expresses "any type that can do X" without caring what concrete type X actually is, which is the foundation delegation, dependency injection, and Swift's whole standard library (`Equatable`, `Sequence`) are built on.

```swift
protocol Describable {
    var description: String { get }
    func printDescription()
}

struct Product: Describable {
    let name: String
    var description: String { "Product: \(name)" }
    func printDescription() { print(description) }   // must satisfy every requirement
}
```

A type conforms by listing the protocol after its name and implementing every requirement — the compiler won't let you compile until it's fully satisfied, which is exactly the guarantee a protocol is for: promise met, or it doesn't build.

**Say it:** "A protocol is a contract with no implementation of its own — a type conforms by implementing every requirement, and the compiler enforces that promise at build time, not at runtime."
**Red flag:** Confusing a protocol with an abstract class. A protocol has no storage and no default behavior unless you add one via an extension — structs and enums can conform, which they could never do with a class-based abstract base.

### Enums with Associated Values
**They ask:** "What are associated values on a Swift enum, and why are they useful?"

A plain enum case is just a fixed label. An associated value lets *each case* carry its own extra data along with it — so instead of a case plus a separate optional field that's only valid for some cases, the type system itself makes "this data only exists when the case is this one" impossible to get wrong.

```swift
enum NetworkResult {
    case success(data: Data)
    case failure(error: Error)
}

func handle(_ result: NetworkResult) {
    switch result {
    case .success(let data): print("got \(data.count) bytes")
    case .failure(let error): print("failed: \(error)")
    }
}
```

This is the pattern behind Swift's own `Result<Success, Failure>` type, and it's why "illegal state" bugs — a success case that also happens to have a non-nil error field — are structurally impossible: the compiler's exhaustive `switch` forces you to handle every case, and each case only ever carries the data that's actually valid for it.

**Say it:** "Associated values let each enum case carry its own data, so a success/failure result can't be in an invalid combined state — the compiler's exhaustive switch forces me to handle every case explicitly."
**Red flag:** Modeling a success/failure result as a struct with an optional `data` and an optional `error` instead of an enum with associated values — nothing stops both being non-nil, or both being nil, at the same time.

### Optional Chaining and Nil-Coalescing
**They ask:** "What do `?.` and `??` do in Swift?"

They're two tools for working with optionals without force-unwrapping. **Optional chaining** (`?.`) reaches into an optional and stops safely if it's nil — `user?.address?.city` returns `nil` the moment any link is nil, instead of crashing. **Nil-coalescing** (`??`) supplies a fallback when a value is nil — `name ?? "Guest"`. You combine them constantly: `user?.name ?? "Guest"` means "the name if the whole chain is there, otherwise Guest." Both let you handle absence inline instead of nesting `if let`.

```swift
let city = user?.address?.city ?? "Unknown"   // safe all the way down
```

**Say it:** "`?.` safely reaches through optionals and short-circuits to nil if any part is missing; `??` gives a default when something is nil — together they let me handle absence in one readable line instead of nested unwraps."
**Red flag:** Reaching for `!` (force unwrap) to dig into a chain because "I know it's there." One nil anywhere in that chain is a crash; `?.` and `??` express the same intent without the risk.

### Swift Collection Types — Array, Dictionary, Set
**They ask:** "What are Swift's basic collection types, and when do you use each?"

Three, each with a distinct role. An **Array** is an ordered list you access by index — use it when order matters or you have duplicates. A **Dictionary** maps unique keys to values for fast lookup by key — use it when you look things up by an id rather than a position. A **Set** is an unordered collection of unique values with fast membership tests — use it to dedupe or to ask "does this contain X?" quickly. All three are value types (structs) with value semantics — mutating one variable never affects another — but that's implemented with **copy-on-write**: assigning or passing one shares the same backing storage until either copy is mutated, at which point Swift copies it first. So the *semantics* are "copy on assignment," but the actual memory copy is deferred until a write.

**Say it:** "Array for ordered, index-accessed lists; Dictionary for key-to-value lookup by id; Set for uniqueness and fast contains checks — and all three are value types with copy-on-write, so they behave as if copied on assignment but only actually copy the backing storage when one side mutates."
**Red flag:** Using an array and a linear `contains` scan for membership checks on large data when a `Set` gives that in constant time. Picking the structure by its access pattern is a basic seniority signal.

### map, filter, and reduce
**They ask:** "What do `map`, `filter`, and `reduce` do on a Swift array?"

They're the three functional transforms that replace hand-written loops with intent-revealing code. **`map`** transforms every element into a new one (`names.map { $0.uppercased() }`) — same count, new values, returns a new array. **`filter`** keeps only elements matching a condition (`nums.filter { $0 > 0 }`) — fewer elements, same type, also returns a new array. **`reduce`** collapses the whole collection into a single value of whatever type you start with (`nums.reduce(0, +)` returns an `Int`, not an array). Reaching for these over a `for` loop says *what* you're doing, not just *how*, and none of them mutate the original collection.

```swift
let total = cart.map(\.price).reduce(0, +)   // transform, then collapse
```

**Say it:** "`map` transforms each element, `filter` keeps the ones matching a predicate, and `reduce` collapses the collection to one value — I prefer them over loops because they express intent and don't mutate the original."
**Red flag:** Nesting them carelessly on huge collections (each creates an intermediate array) — but for typical UI data, clarity wins; the red flag in an interview is *not* recognizing these as the idiomatic replacement for manual loops.

### Type Inference and Type Annotations
**They ask:** "How does type inference work in Swift, and when do you still annotate?"

Swift infers a variable's type from its initial value, so `let count = 5` is an `Int` and `let name = "Sam"` is a `String` without you writing the type — it keeps code concise while staying fully type-safe (the type is fixed at compile time, not dynamic). You add an explicit annotation when there's no initial value (`var score: Int`), when you want a different type than the default (`let ratio: Double = 3`), or to document a tricky closure/collection type. Inference is a convenience over a statically-typed core, not dynamic typing.

**Say it:** "Swift infers the type from the initial value so I don't repeat myself, but it's still static and type-safe — I annotate when there's no initializer, when I want a non-default type like Double, or to make a complex type clear."
**Red flag:** Assuming inference means Swift is dynamically typed like Python. The type is locked at compile time; `var x = 5; x = "hi"` is a compile error, and saying otherwise reveals a misunderstanding.

### String Basics and Interpolation
**They ask:** "How do you build and combine strings in Swift?"

The idiomatic way is **string interpolation** — `"Hello, \(name)! You have \(count) items"` — which embeds any value directly and is far cleaner than concatenating with `+`. Strings are value types and fully Unicode-correct: `count` gives the number of user-perceived characters (grapheme clusters), not bytes, which is why indexing is by `String.Index` rather than an integer. For multi-line text, triple-quoted `"""..."""` preserves line breaks.

```swift
let greeting = "Hi \(user.name), you're \(user.age) today"
```

**Say it:** "I build strings with interpolation — `\(value)` inline — rather than `+` concatenation; Swift strings are value types and Unicode-correct, so `count` is real characters, not bytes."
**Red flag:** Expecting `str[0]` integer subscripting like other languages. Swift strings index by `String.Index` because a character can be multiple bytes — a small thing that trips juniors up constantly.

### Default and Variadic Parameters
**They ask:** "What are default parameter values and variadic parameters in Swift?"

**Default values** let a parameter be omitted at the call site — `func greet(_ name: String, loudly: Bool = false)` can be called as `greet("Sam")` — which removes the need for multiple overloads. **Variadic parameters** accept zero or more values of a type with `...`, and inside the function you get an array — `func sum(_ numbers: Int...)` is called `sum(1, 2, 3)`. Together they make Swift APIs flexible without a pile of overloaded signatures.

```swift
func log(_ items: String..., level: Level = .info) { /* items is [String] */ }
```

**Say it:** "Default values let callers skip a parameter so I don't need overloads, and a variadic `Type...` accepts any number of arguments as an array inside the function — both keep the API surface small and flexible."
**Red flag:** Writing three overloads of the same function that differ only by an optional flag, when one default parameter expresses it. It's more code to maintain for no benefit.
