# JVM (Memory, Collections, Concurrency)

### JVM Memory Layout — Stack vs Heap
**They ask:** "Why is Stack needed at all — why not put everything in the Heap?"

The Stack and Heap exist for two different access patterns, and conflating them misses the whole point of the split. Each thread gets its own Stack — a fast, LIFO region holding method call frames: local variables, primitive values, and object *references* (not the objects themselves). It's fast specifically because allocation/deallocation is just moving a pointer, and it's automatically reclaimed the instant a method returns — no garbage collector involvement at all.

The Heap is shared across all threads and holds every object instance — it has to be, because an object can outlive the method that created it (returned, stored in a field, captured by a closure) in a way a stack frame's local variables can't. That shared, dynamic-lifetime property is exactly what forces heap allocation to be slower and to need a garbage collector, where stack cleanup needs neither.

```kotlin
fun compute() {
    val x = 5              // primitive local — lives on this thread's stack frame
    val user = User("Ann") // reference `user` on the stack; the User object itself on the heap
}   // frame popped here — x and the reference are gone instantly, no GC involved
```

**Say it:** "Stack is fast, thread-local, and reclaimed automatically because a frame's lifetime is exactly its method call — Heap exists because an object's lifetime can outlive the method that created it, which is precisely what forces it to be GC-managed instead of just popped."
**Red flag:** Saying objects "live on the stack" in the JVM. Only primitives and references live on the stack — every object instance, no exceptions, lives on the heap.

### Garbage Collection — Algorithm, References, and Generations
**They ask:** "What is GC and its basic algorithm? What are root objects, and how does GC decide to promote an object from Young to Old generation?"

GC's job is reclaiming heap memory for objects nothing can reach anymore — but "nothing can reach" has to be computed, not guessed, so the basic algorithm starts from a fixed set of **GC roots**: local variables on active thread stacks, static fields, and JNI references — anything the running program can directly touch right now. From those roots, the collector traces every reachable object (mark), and anything never visited is garbage (sweep/reclaim) — an object with zero references pointing to it, or one that's only reachable through other garbage, is eligible regardless of how large its own reference graph is.

Modern JVM/ART GCs are generational, based on the empirical observation that most objects die young (a short-lived loop variable, a temporary DTO). The **Young generation** is collected frequently and cheaply (a minor GC); an object that survives several of those collections — meaning something is still holding a real reference to it — gets promoted to the **Old generation**, which is collected less often but more expensively (a major/full GC), because objects that already proved they're long-lived are statistically unlikely to become garbage soon.

**Say it:** "GC traces reachability from a fixed set of roots — active stack locals, statics, JNI refs — anything unreached is collected; generational GC promotes objects to Old only after surviving repeated Young-gen collections, because objects that already survived several rounds are statistically the long-lived ones."
**Red flag:** Describing GC as "reference counting." That's a different algorithm family (used by some other runtimes) with a real weakness — circular references — that mark-and-sweep from roots doesn't have, since a cycle unreachable from any root is still correctly collected.

### HashMap Internals — Buckets, Collisions, and loadFactor
**They ask:** "How does HashMap work internally — buckets, collisions, and what happens on `put()`? What is `loadFactor` and what does it affect? Can key or value be null?"

`HashMap` is an array of **buckets**, where a key's `hashCode()` determines which bucket it lands in (via a hash-spreading function, then modulo the array size). `put(key, value)` computes the hash, finds the bucket, and either inserts fresh or — if the bucket already holds an entry — walks the bucket's chain comparing via `equals()` to either overwrite an existing key or append a new entry. This is exactly why the `equals`/`hashCode` contract matters: two keys that are `equal()` but return different `hashCode()`s can end up in different buckets and the map will never find one via the other.

A **collision** is two different keys hashing into the same bucket — resolved by chaining (each bucket holds a small linked list, or since Java 8, a red-black tree once a bucket gets dense enough, to keep worst-case lookup from degrading to O(n)). `loadFactor` (default 0.75) controls when the internal array resizes: once `size > capacity * loadFactor`, the map rehashes into a larger array — a lower loadFactor trades more memory for fewer collisions and faster average lookups; a higher one trades the reverse.

```kotlin
val map = HashMap<String?, Int?>()
map[null] = 1        // one null key is allowed — reserved bucket 0
map["x"] = null       // any number of null values allowed
```

`HashMap` allows exactly one `null` key (Java reserves bucket 0 for it) and any number of `null` values — `Hashtable` and `ConcurrentHashMap` forbid both, which is a common trip-up when swapping implementations.

**Say it:** "put() hashes the key into a bucket and resolves collisions via chaining — a linked list, or a tree once a bucket gets dense — loadFactor is the resize trigger and a direct memory-vs-collision-rate trade-off, and HashMap's null-key/null-value tolerance is specifically NOT shared by Hashtable or ConcurrentHashMap."
**Red flag:** Overriding `equals()` without overriding `hashCode()` on a class used as a HashMap key. Two objects that are logically equal can land in different buckets, so `map[equalKey]` silently returns null even though an "equal" entry exists.

### ArrayList vs LinkedList vs Array
**They ask:** "What's the difference between Array and ArrayList? What is ArrayList built on, and what happens when you add an element in the middle? How is LinkedList different?"

An `Array` is a fixed-size, contiguous memory block, fast at index access (`O(1)`, pure pointer arithmetic) and can hold primitives directly without boxing. `ArrayList` wraps a resizable array — internally still contiguous memory, but it grows by allocating a new, larger backing array and copying every existing element over when capacity is exceeded (roughly 1.5x growth), which is why "does the old array get deleted" is real: yes, the old backing array becomes garbage the moment the copy finishes, eligible for GC.

Inserting or removing in the *middle* of an `ArrayList` means shifting every subsequent element by one slot (`System.arraycopy` under the hood) — `O(n)` in the worst case, not `O(1)`, which surprises people who think of `ArrayList` as "just an array with extra methods."

`LinkedList` trades that for the opposite profile: each node holds a value plus pointers to the next/previous node, so insertion/removal at a known position is `O(1)` (just relink pointers, no shifting) — but random index access degrades to `O(n)`, since reaching index `k` means walking `k` links from whichever end is closer. In practice `ArrayList` wins for most Android use cases (mostly read/iterate, rarely insert in the middle); `LinkedList`'s O(1) insertion advantage rarely outweighs its worse cache locality and access cost in real workloads.

**Say it:** "ArrayList's middle insertion is O(n) because it shifts every subsequent element — that's the thing people assume is free — LinkedList makes that O(1) but pays for it with O(n) random access, and in practice ArrayList wins most real Android workloads because reads dominate over middle-inserts."
**Red flag:** Defaulting to `LinkedList` "because insertion is faster," without checking the actual access pattern. If the code mostly reads by index or iterates forward, `ArrayList`'s better cache locality usually wins in practice despite the theoretical insertion cost.

### Tree-Based Collections and WeakHashMap
**They ask:** "What are `NavigableSet`/`NavigableMap` for? What algorithm keeps a tree normalized? What is `WeakHashMap`?"

`TreeMap`/`TreeSet` keep entries sorted by key (natural ordering or a supplied `Comparator`), backed internally by a self-balancing red-black tree — which is what guarantees `O(log n)` for insert/lookup/delete even in the worst case, instead of degrading toward `O(n)` the way an unbalanced binary search tree would if you inserted already-sorted data. Inserting values in already-ascending order into a *naive* BST would degenerate into effectively a linked list (`O(n)` per operation); the red-black tree's rebalancing rotations on every insert/delete are exactly what prevents that.

`NavigableMap`/`NavigableSet` (which `TreeMap`/`TreeSet` implement) add the operations sorting actually unlocks: `floorKey`, `ceilingKey`, `higherKey`, `lowerKey`, `headMap`/`tailMap` for range queries — things a plain `HashMap` has no meaningful answer for, since it has no ordering at all.

```kotlin
val scores = WeakHashMap<Bitmap, Int>()   // entry disappears once nothing else references the Bitmap key
```

`WeakHashMap` holds its **keys** via `WeakReference` — an entry is automatically removed once its key becomes otherwise unreachable, which makes it a natural fit for a cache keyed by an object you don't want to keep alive just because it's a map key (a classic use: caching computed data per-Bitmap without preventing that Bitmap from being collected).

**Say it:** "TreeMap's red-black tree rebalances on every insert specifically to prevent the worst case a naive BST hits on sorted input — a linked list in disguise — and WeakHashMap's real feature is that holding a key there doesn't keep it alive, which is exactly what you want for a cache that shouldn't outlive its keys."
**Red flag:** Assuming `WeakHashMap` also weakly references its *values*. Only the keys are weak by default — a value can still keep its own key artificially alive if the value happens to hold a strong reference back to it.

### Thread Synchronization — synchronized, Locks, and Deadlocks
**They ask:** "How does `synchronized` work, what's the difference from `Lock`, and what causes a deadlock vs a race condition?"

`synchronized` acquires a monitor (intrinsic lock) tied to an object — either an instance (`synchronized(this)` or a `synchronized` instance method) or a `Class` object (`synchronized(Obj.class)` or a `synchronized static` method) — and only one thread can hold that monitor at a time, blocking others until it's released, which happens automatically even if the block throws.

`Lock` (`java.util.concurrent.locks.ReentrantLock`) is the more flexible, explicit alternative: it supports `tryLock()` (attempt without blocking indefinitely), a timed acquire, interruptible waiting, and fairness policies — none of which `synchronized` offers — at the cost of needing a manual `try { ... } finally { lock.unlock() }`, since nothing releases it automatically on an exception the way `synchronized` does.

```kotlin
val lock = ReentrantLock()
lock.lock()
try { criticalSection() } finally { lock.unlock() }   // manual — synchronized does this for you
```

A **race condition** is two threads reading-modifying-writing shared state without coordination, producing a result that depends on scheduling luck (a lost increment). A **deadlock** is a *symptom of over-coordination* going wrong: two or more threads each hold a lock the other needs and neither can proceed — classically, Thread A locks `resource1` then wants `resource2` while Thread B holds `resource2` and wants `resource1`. The standard prevention is a consistent, global lock-acquisition ordering across the whole codebase, so two threads can never approach the same pair of locks from opposite directions.

**Say it:** "synchronized gives automatic, exception-safe lock release at the cost of no timeout or fairness control; Lock trades that convenience for tryLock/timed/interruptible acquisition — and a race condition is unsynchronized access producing scheduling-dependent results, while a deadlock is circular lock ordering between threads, prevented by a consistent global acquisition order."
**Red flag:** Calling a race condition and a deadlock "basically the same bug." A race condition corrupts data from too little coordination; a deadlock freezes threads from lock ordering gone wrong — the fixes are opposite in spirit (add synchronization vs. enforce a consistent lock order).

### java.util.concurrent — Atomics, Executors, and Concurrent Collections
**They ask:** "How does `Atomic` work, and is it better or worse than `volatile`? Why do we need Executors? What's the difference between `CopyOnWriteArrayList`/`ConcurrentHashMap` and `Collections.synchronizedList`/`synchronizedMap`?"

`volatile` guarantees visibility (a write on one thread is visible to reads on others, no stale CPU-cache copy) but *not* atomicity for compound operations — `volatile int count; count++` is still a read-modify-write race, because increment isn't a single hardware operation. `AtomicInteger`/`AtomicLong`/etc. solve exactly that gap using CAS (compare-and-swap) hardware instructions — `count.incrementAndGet()` is genuinely atomic, lock-free, and typically faster than `synchronized` for simple counter-style updates because it avoids blocking entirely under low contention.

`Executor`/`ExecutorService` exist to stop the "one raw `Thread` per task" pattern from exhausting the system — a thread pool reuses a bounded set of worker threads across many tasks, avoiding the real cost of thread creation/teardown, and gives you lifecycle control (`shutdown()`, `awaitTermination()`) a bare `Thread` never had.

```kotlin
val cache = ConcurrentHashMap<String, User>()   // fine-grained internal locking, safe under high concurrent read/write
```

`Collections.synchronizedList`/`synchronizedMap` wrap an existing collection with a single lock around *every* operation — simple, but that one lock serializes all access, including reads, and still requires manual external synchronization when iterating (a `ConcurrentModificationException` risk otherwise). `CopyOnWriteArrayList` and `ConcurrentHashMap` take a fundamentally different approach: `CopyOnWriteArrayList` copies the entire backing array on every *write*, making reads/iteration lock-free and safe with no external synchronization — ideal for read-heavy, rarely-written lists (like a set of registered listeners). `ConcurrentHashMap` uses fine-grained internal locking (segment/bucket-level, not one global lock), giving genuinely concurrent reads and writes from multiple threads without serializing everything through one lock.

**Say it:** "volatile gives visibility but not atomicity for compound ops — that's what Atomic classes fix via CAS — Executors exist to stop raw-Thread-per-task from exhausting the system, and CopyOnWriteArrayList/ConcurrentHashMap outperform the synchronizedX wrappers under real concurrency because they avoid serializing every access through one global lock."
**Red flag:** Using `count++` on a `volatile` field expecting it to be thread-safe. Visibility isn't atomicity — that's precisely the gap `AtomicInteger` exists to close.

### Equals vs Reference Equality in Java
**They ask:** "What is `equals()` for, and how does it differ from `==`?"

`==` on objects compares **references** — whether two variables point at the exact same object in memory — never the content. `equals()` is a method meant to compare **logical/content equality** — whether two objects represent the same value, even if they're different instances. `Object`'s default `equals()` just falls back to `==` (reference comparison), which is exactly why a class has to override it to get meaningful value comparison.

```java
String a = new String("hi");
String b = new String("hi");
System.out.println(a == b);        // false — different objects
System.out.println(a.equals(b));   // true — same content
```

`String` and the boxed primitive wrapper types already override `equals()` for you; a custom class (a `User`, a `Point`) has to override it explicitly, or `==` semantics leak through `equals()` too and two logically-identical objects compare as unequal.

**Say it:** "`==` always compares references, `equals()` is supposed to compare content — but that only holds once a class actually overrides `equals()`, since the default `Object` implementation is just reference comparison in disguise."
**Red flag:** Comparing two boxed values or custom objects with `==` expecting content comparison. For anything beyond a few cached small Integer values, `==` on objects is a reference check, full stop.

### Equals and hashCode — The Contract
**They ask:** "What are `equals()` and `hashCode()` for, and why do you need to override them together?"

The Java contract is strict: if two objects are `equal()`, they **must** return the same `hashCode()` — the reverse isn't required (equal hash codes don't have to mean equal objects, that's just a collision). Hash-based collections (`HashMap`, `HashSet`) rely on this contract structurally: they use `hashCode()` to pick a bucket first, then `equals()` to confirm a match within that bucket — break the contract and a lookup can miss an object that's logically present, because it landed in a different bucket than an "equal" one.

```java
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof User)) return false;
    return id.equals(((User) o).id);
}
@Override
public int hashCode() { return id.hashCode(); }   // must use the same fields as equals()
```

The practical rule: override both together, based on the *same* fields, or not at all — an IDE-generated pair or Kotlin's `data class` (which generates both from the constructor properties automatically) is the safe default over hand-writing one and forgetting the other.

**Say it:** "The contract is one-directional but strict: equal objects must have equal hash codes, or hash-based collections silently fail to find entries that are logically present — which is why `equals` and `hashCode` always get overridden together, from the same fields."
**Red flag:** Overriding `equals()` without `hashCode()` (or vice versa) on a class ever used as a `HashMap`/`HashSet` key. That breaks the contract silently — no compile error, just entries that mysteriously "aren't found" at runtime.

### Object Class — Core Methods
**They ask:** "What methods does every Java `Object` have, and what are they for?"

Every class implicitly extends `Object`, which is why every instance — without writing anything — already has: `equals()` (identity comparison by default), `hashCode()` (identity-based hash by default), `toString()` (a `ClassName@hexHash` string by default, which is why unoverridden objects print unreadable garbage in logs), `getClass()` (runtime type introspection), and the wait/notify family (`wait()`, `notify()`, `notifyAll()` — low-level thread coordination primitives, mostly superseded by `java.util.concurrent` in real code today).

```java
class User { String name; }
System.out.println(new User());   // User@1b6d3586 — toString() not overridden
```

`toString()` is the one worth overriding on almost anything you'll ever log or debug — the default is genuinely useless for diagnosis, since it tells you the class and an identity hash, nothing about the object's actual state.

**Say it:** "Every object gets `equals`, `hashCode`, `toString`, `getClass`, and the wait/notify family for free from `Object` — `toString()` is the one I override on almost everything, since the default prints an unreadable class-and-hash string instead of anything useful for debugging."
**Red flag:** Debugging with `println(someObject)` and being confused by a `ClassName@hexHash` string. That's the unoverridden default `toString()` — the fix is overriding it, not squinting at the hash.

### Enums — What They're For
**They ask:** "What is an `Enum`, and why use one instead of constants?"

An enum defines a fixed, closed set of named values — its whole purpose is replacing a set of loose `int`/`String` constants (`STATUS_PENDING = 0`, `STATUS_DONE = 1`) with actual type-safe values the compiler can check. Passing a raw `int` where a status is expected compiles even if the value is meaningless (`setStatus(99)`); passing an enum where one is expected literally can't compile with an invalid value, because there is no invalid value — only the ones declared.

```kotlin
enum class OrderStatus { PENDING, SHIPPED, DELIVERED, CANCELLED }

fun handle(status: OrderStatus) = when (status) {   // exhaustive — no else needed
    OrderStatus.PENDING -> "waiting"
    OrderStatus.SHIPPED -> "on the way"
    OrderStatus.DELIVERED -> "done"
    OrderStatus.CANCELLED -> "cancelled"
}
```

An enum can also carry its own properties and methods (a constructor per constant, computed behavior per value), which plain integer constants can't — that's the difference between "a set of labels" and "a set of small, well-defined types."

**Say it:** "An enum replaces loose int/string constants with a closed, type-safe set the compiler enforces — you can't accidentally pass an invalid status, because every possible value is one of the declared constants."
**Red flag:** Reaching for a raw `Int`/`String` constant set ("magic numbers") for a genuinely fixed set of states instead of an enum. That trades compile-time safety for nothing — it's strictly worse once the set of valid values is actually closed.

### Abstract Classes vs Interfaces
**They ask:** "What's the difference between an abstract class and an interface?"

Both let you define a contract some methods must fulfill without providing a full implementation, but they answer different questions. An **abstract class** models "is-a" with shared state and partial implementation — it can hold fields, constructors, and a mix of implemented and unimplemented (`abstract`) methods, but a class can only extend *one*. An **interface** models a capability/contract — traditionally no state and no implementation at all, though modern Java/Kotlin interfaces can include default method bodies — and a class can implement *many* of them.

```kotlin
abstract class Animal(val name: String) {           // shared state + partial implementation
    abstract fun speak(): String                      // subclass must provide this
    fun describe() = "$name says ${speak()}"           // shared, already implemented
}
interface Flyer { fun fly(): String }                 // pure contract, no state

class Bird(name: String) : Animal(name), Flyer {      // one abstract class, multiple interfaces
    override fun speak() = "Tweet"
    override fun fly() = "Flying"
}
```

The practical decision rule: reach for an abstract class when subclasses genuinely share state or implementation and the "is-a" relationship is singular; reach for an interface when you're describing a capability that unrelated classes might all need (`Comparable`, `Flyer`) — multiple inheritance of interfaces is exactly what lets unrelated classes share a capability without a forced class hierarchy.

**Say it:** "Abstract class is for shared state and a genuine 'is-a' hierarchy — single inheritance only — interface is for a capability contract that unrelated classes can all implement, which is why a class can implement several interfaces but extend only one abstract class."
**Red flag:** Reaching for an abstract class just to share a couple of default methods between unrelated classes. If there's no real state or "is-a" relationship, an interface with default methods usually fits better and doesn't burn the single-inheritance slot.

### Java Exception Hierarchy — Error, Exception, and RuntimeException
**They ask:** "What types of exceptions are there in Java?"

Every throwable descends from `Throwable`, which splits into two branches with very different meanings. `Error` represents a problem the application generally shouldn't try to recover from — `OutOfMemoryError`, `StackOverflowError` — serious enough that catching it rarely makes sense. `Exception` represents a recoverable problem, and it splits again: **checked** exceptions (`IOException`, direct `Exception` subclasses not extending `RuntimeException`) must be declared with `throws` or caught, enforced by the compiler; **unchecked** exceptions (`RuntimeException` and its subclasses — `NullPointerException`, `IllegalArgumentException`, `IndexOutOfBoundsException`) need no such declaration, and typically signal a programming bug rather than an expected, recoverable condition.

```text
Throwable
├── Error (OutOfMemoryError, StackOverflowError — don't catch)
└── Exception
    ├── RuntimeException (unchecked — NullPointerException, IllegalArgumentException)
    └── checked exceptions (IOException, SQLException — must declare or catch)
```

**Say it:** "Everything throwable splits into `Error` — don't try to recover — and `Exception`, which further splits into checked exceptions the compiler forces you to handle and unchecked `RuntimeException`s that usually mean a bug, not an expected condition."
**Red flag:** Catching `Throwable` or `Exception` broadly "to be safe." That swallows `Error`s you can't meaningfully recover from alongside real bugs, hiding both behind one silent catch instead of letting each fail the way it should.

### The final Keyword
**They ask:** "Where can `final` be used, and what does it do in each case?"

`final` means "cannot be changed further," but what that means depends on where it's applied. On a **variable**, it means the reference can be assigned exactly once — like Kotlin's `val` — but, just like `val`, the object it points to can still be internally mutable. On a **method**, it prevents a subclass from overriding it — useful when a method's behavior is load-bearing for the class's invariants and overriding it would be unsafe. On a **class**, it prevents any subclassing at all — Kotlin actually flips this and makes `final` the *default* for every class and method, requiring `open` to allow overriding instead.

```java
final int MAX = 10;          // reference/value can't be reassigned
final class Utils { ... }    // can't be subclassed
class Base {
    final void validate() { ... }   // can't be overridden
}
```

**Say it:** "`final` means single-assignment on a variable, non-overridable on a method, and non-subclassable on a class — and it's worth knowing Kotlin inverted the class/method default, making everything final unless you explicitly mark it `open`."
**Red flag:** Assuming `final` on a variable makes the referenced object immutable. It only locks the reference — a `final List` can still have elements added or removed, same trap as Kotlin's `val`.

### The static Keyword
**They ask:** "Where can `static` be used, and how does it affect behavior?"

`static` ties a member to the **class** itself rather than to any instance — a static field is shared across every instance (one copy total, not one per object), and a static method can be called without creating an instance at all (`Math.max(a, b)`, no `Math` object needed). That's the trade-off to know: a static method has no access to instance (`this`) state, because there's no guaranteed instance behind the call.

```java
class Counter {
    static int totalCreated = 0;     // one copy, shared by every instance
    Counter() { totalCreated++; }
}
int total = Counter.totalCreated;   // accessed via the class, not an instance
```

A static nested class (as opposed to a plain inner class) doesn't hold an implicit reference to an outer instance, which is why it's the safer default for a nested class that doesn't need outer-class state — an inner class implicitly captures the outer instance, which is a common, easy-to-miss memory leak source (an inner class outliving the outer instance it's silently holding onto).

**Say it:** "`static` ties a field or method to the class, not an instance — one shared copy for a field, no `this` access for a method — and a static nested class deliberately drops the implicit outer-instance reference a plain inner class holds, which matters for avoiding leaks."
**Red flag:** Using a non-static inner class purely out of habit when it never touches outer-class state. That implicit outer reference is a real, easy-to-miss leak source — default to `static` nested unless outer access is actually needed.
