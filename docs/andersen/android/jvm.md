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
