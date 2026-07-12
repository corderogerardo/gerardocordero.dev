# Go — concurrency, sync, and patterns

### The GMP Scheduler Model
**They ask:** "Explain Go's GMP scheduler model — what are G, M, and P?"

Go multiplexes many goroutines onto a small number of OS threads, and GMP is the bookkeeping that makes that work. **G** (goroutine) is a lightweight unit of work with its own small growable stack. **M** (machine) is an OS thread — the thing the kernel actually schedules. **P** (processor) is a logical context that holds a local run queue of runnable Gs and the resources (like a memory cache) an M needs to execute Go code; an M must hold a P to run Go code at all. The number of Ps is capped by `GOMAXPROCS`, which is why that setting — not the number of goroutines — controls actual parallelism.

**Say it:** "GMP decouples goroutines from OS threads: P is the scheduling context that bounds parallelism to GOMAXPROCS, M is the OS thread doing the work, and G is the lightweight goroutine — that indirection is what lets Go run millions of goroutines on a handful of threads."
**Red flag:** Saying "a goroutine is a thread" flatly — it's scheduled cooperatively by the Go runtime onto a small thread pool, which is exactly why they're 100x-plus cheaper to spawn.

### Goroutines vs OS Threads
**They ask:** "Why are goroutines cheap compared to OS threads, and what's the real startup cost?"

An OS thread typically reserves a fixed multi-MB stack upfront and costs the kernel real scheduling overhead per context switch. A goroutine starts with a stack of only a few KB that grows on demand (see the stack-growth mechanics), and the Go runtime scheduler multiplexes goroutines onto OS threads in user space, so creating one is closer to a memory allocation than a syscall. That's why spawning tens of thousands of goroutines is routine in Go, where the same count of OS threads would exhaust memory and choke the kernel scheduler.

**Say it:** "Goroutines start with a few KB of stack and are scheduled in user space by the Go runtime, so creation and context-switch cost are orders of magnitude cheaper than an OS thread — that's the whole reason 'launch a goroutine per request' is a viable default."
**Red flag:** Pooling goroutines "to avoid creation overhead" the way you'd pool OS threads — for most workloads goroutine creation is cheap enough that a worker pool is about bounding concurrency, not amortizing spawn cost.

### GOMAXPROCS
**They ask:** "What does GOMAXPROCS actually control, and when would you change it?"

`GOMAXPROCS` sets the number of Ps — the maximum number of goroutines that can execute Go code simultaneously across OS threads. It defaults to the number of logical CPUs available, which is right for most workloads. You'd tune it down deliberately in a container that's CPU-limited by cgroups but where Go's runtime (pre-1.19-ish) couldn't see that limit and over-scheduled — `go.uber.org/automaxprocs` fixes that by reading the cgroup quota. You'd rarely tune it up beyond CPU count; that just adds scheduling overhead without more real parallelism.

**Say it:** "GOMAXPROCS bounds parallel execution to that many Ps — the case I actually change it is in a cgroup-limited container, where I set it (or use automaxprocs) to match the CPU quota, not the host's full core count."
**Red flag:** Confusing GOMAXPROCS with a goroutine count limit — it caps parallel *execution*, not how many goroutines can exist or be blocked waiting.

### Cooperative vs Preemptive Scheduling
**They ask:** "Go's scheduler used to be cooperative-only — what changed in 1.14 and why did it matter?"

Before Go 1.14, the scheduler could only preempt a goroutine at specific safe points — mainly function calls — so a tight loop with no function calls (`for {}` doing pure arithmetic) could starve the rest of the program, including the garbage collector, indefinitely. Go 1.14 added asynchronous preemption using OS signals, so the runtime can now interrupt a long-running goroutine even mid-loop. It's still cooperative in spirit — goroutines yield at scheduling points — but the runtime is no longer at the mercy of a goroutine that never calls a function.

**Say it:** "Go 1.14 added signal-based async preemption, which closed the starvation hole where a tight compute loop with no function calls could block the scheduler and the GC indefinitely — before that, cooperative scheduling really meant 'yields only at function calls.'"
**Red flag:** Writing a tight numeric loop with a comment like "safe, Go isn't preemptible" — that assumption stopped being true in 1.14, and even before it, it was a latent starvation bug waiting for a big-enough input.

### Goroutine Leaks
**They ask:** "How does a goroutine leak happen, and how do you detect one in production?"

A goroutine leaks when it blocks forever — on a channel send/receive nobody will ever complete, or a `select` with no way out — and never gets garbage collected, because the Go runtime can't reclaim a goroutine's stack while it's still technically "runnable, just blocked." The classic case: a producer sends on an unbuffered channel but the consumer already returned (e.g., a timeout fired first), so the producer goroutine blocks on the send forever. You detect leaks via `runtime.NumGoroutine()` trending upward over time in metrics, or `pprof`'s goroutine profile showing thousands stuck in the same blocked state.

```go
func leaky(ch chan int) {
    go func() { ch <- compute() }() // leaks if nobody ever reads ch
}
```

**Say it:** "A leaked goroutine is one permanently blocked on a channel op or select with no exit path — I catch it in production by graphing runtime.NumGoroutine() and confirm the cause with pprof's goroutine profile, which shows exactly where they're stuck."
**Red flag:** Fire-and-forget goroutines with no cancellation path (`go func() { ch <- x }()` and nothing else) — every goroutine you spawn needs a guaranteed way to exit, usually via a context or a buffered/select-guarded channel.

### Buffered vs Unbuffered Channels
**They ask:** "What's the actual difference in blocking behavior between a buffered and unbuffered channel?"

An unbuffered channel (`make(chan T)`) has zero capacity — a send blocks until a receiver is ready to take the value at that exact moment, making it a synchronization point (a "rendezvous"), not just a data pipe. A buffered channel (`make(chan T, n)`) lets up to `n` sends complete without a waiting receiver; the send only blocks once the buffer is full, and a receive only blocks once it's empty. Buffering decouples producer and consumer timing but doesn't remove the possibility of blocking — it just raises the threshold.

**Say it:** "Unbuffered channels synchronize sender and receiver at the handoff — buffered channels decouple timing up to the buffer size, but they can still block once full or empty, so buffering isn't a fix for backpressure, just a bigger cushion."
**Red flag:** Adding a large buffer to "fix" a deadlock or slow consumer without understanding why it's blocking — that usually just delays the same problem and hides it until the buffer fills under load.

### Channel Directions
**They ask:** "Why would you restrict a channel parameter to send-only or receive-only?"

A bidirectional `chan T` parameter can be typed down to `chan<- T` (send-only) or `<-chan T` (receive-only) in a function signature. This is a compile-time contract: a function that only ever sends on a channel can't accidentally call `<-ch` and consume a value meant for someone else, and the compiler rejects the wrong direction at the call site — it's documentation the type checker enforces, which matters a lot in pipeline-style code with several goroutines each owning one direction.

```go
func producer(out chan<- int) { out <- 42 }
func consumer(in <-chan int) { fmt.Println(<-in) }
```

**Say it:** "Directional channel types turn 'this function only sends' from a comment into something the compiler enforces — cheap correctness for pipeline code where stages must not accidentally read each other's channel."
**Red flag:** Passing a plain bidirectional `chan T` through every layer of a pipeline "because it's simpler" — you lose a free compile-time guarantee for no real benefit.

### Select Statement
**They ask:** "How does select choose among multiple ready channels, and what does default do?"

`select` blocks until at least one of its channel cases can proceed; if multiple are ready simultaneously, Go picks one uniformly at random — not top-to-bottom — specifically to prevent a program from implicitly depending on case order (and to avoid starving later cases). A `default` case makes the whole `select` non-blocking: if no channel op is immediately ready, `default` runs instead of waiting, which is how you implement a non-blocking channel check.

```go
select {
case v := <-ch:
    fmt.Println("got", v)
default:
    fmt.Println("nothing ready, moving on")
}
```

**Say it:** "select picks uniformly at random among ready cases — that's deliberate, so nobody writes code that silently depends on case order — and `default` is what turns a select from blocking into a poll."
**Red flag:** Assuming select checks cases top to bottom like a switch — that's not the semantics, and code that relies on it will behave unpredictably.

### Closing Channels
**They ask:** "What are the rules around closing a channel, and what happens if you close it twice or send on a closed channel?"

Closing signals "no more values are coming" — a receive on a closed channel returns immediately with the zero value and `ok == false` once drained, which is how `for v := range ch` knows to stop. The rules that bite people: sending on a closed channel panics, and closing an already-closed channel also panics. The convention is that only the sender closes a channel, never the receiver — a receiver doesn't know if other senders are still active, so it can't safely decide "no more values."

```go
v, ok := <-ch
if !ok { /* channel closed and drained */ }
```

**Say it:** "Only the sender closes a channel, and only once — send-on-closed and double-close both panic, so close ownership has to be unambiguous, usually one designated goroutine or a sync.Once guarding it."
**Red flag:** Having multiple goroutines that might each try to close the same channel "just to be safe" — that's a guaranteed panic under the right timing, not extra safety.

### Select with Timeout and Context
**They ask:** "How do you implement a timeout on a channel receive?"

The idiomatic pattern races the channel receive against a timer channel or a context's `Done()` channel in a `select` — whichever fires first wins, and you handle both outcomes explicitly. `time.After` is convenient but leaks a timer if the other case usually wins in a hot loop (each call allocates a new timer); in tight loops, a reused `time.Timer` with `Stop()`/`Reset()` avoids that. Using `context.WithTimeout` is preferred in real services because the same context can also propagate cancellation downstream.

```go
select {
case v := <-ch:
    fmt.Println(v)
case <-ctx.Done():
    fmt.Println("timed out:", ctx.Err())
}
```

**Say it:** "I race the receive against ctx.Done() in a select rather than time.After in a loop, both because context composes with cancellation propagation and because time.After leaks a timer per call if it's not the winning case in a hot path."
**Red flag:** Using `time.After` inside a loop that runs thousands of times per second — each call allocates a timer that isn't garbage collected until it fires, which is a slow, easy-to-miss memory leak.

### Data Races
**They ask:** "What is a data race in Go's memory model terms, and how is it different from a logic race?"

A data race is specifically two or more goroutines accessing the same memory location concurrently, at least one of them a write, with no synchronization establishing a happens-before ordering between the accesses. It's undefined behavior in Go — the compiler and CPU are both free to reorder or partially observe writes, so a data race isn't just "might read a stale value," it can produce corrupted values (like half of a 64-bit int from two different writes) or crash. A logic race (two goroutines racing to complete a task first) can be a real bug too, but it's not undefined behavior the way a data race is — it doesn't corrupt memory.

**Say it:** "A data race is unsynchronized concurrent access to the same memory with at least one write — that's undefined behavior at the language level, not just 'might get a slightly wrong answer,' which is why I treat every race detector hit as a must-fix, not a maybe."
**Red flag:** Saying a data race is "usually fine because reads are atomic" — for anything wider than a single word (a struct, an interface, a slice header) that's false, and even for a single word Go makes no such guarantee without sync/atomic.

### The Race Detector
**They ask:** "How does go test -race actually catch races, and what are its limits?"

The race detector instruments memory accesses and synchronization events at compile time (via ThreadSanitizer) and tracks a happens-before relationship between goroutines at runtime, flagging any pair of concurrent accesses to the same address that aren't ordered by that relationship. It's dynamic, not static — it only catches races on code paths that actually execute during the run, so a race in an untested branch or a rare timing window won't show up. It also has real overhead (2-20x slower, more memory), so it runs in CI/tests, not production.

**Say it:** "The race detector only sees races on code paths it actually executes, so a green `-race` run isn't proof of no races — it's proof of no races in what you exercised, which is why I want it on in CI with real concurrency-shaped tests, not just as a sometimes-check."
**Red flag:** Treating a clean `go test -race` run as a guarantee the code is race-free — it's dynamic analysis; untested interleavings are invisible to it.

### Mutex vs RWMutex
**They ask:** "When do you reach for sync.RWMutex over sync.Mutex, and where's the trap?"

`sync.RWMutex` allows any number of concurrent readers OR one exclusive writer, versus `sync.Mutex`'s strict one-at-a-time for everything. It's a win specifically when reads vastly outnumber writes and the critical section is non-trivial — for very short critical sections the extra bookkeeping in `RWMutex` can make it slower than a plain `Mutex`, so it's a measure-first optimization, not a default. The trap: `RLock` doesn't prevent writer starvation by itself in naive use, and forgetting that a writer waits for *all* current readers to release means a long-held read lock blocks every writer behind it.

**Say it:** "RWMutex pays off when reads dominate writes and the critical section does real work — for short, simple locks I default to a plain Mutex because RWMutex's extra bookkeeping can make it the slower choice on paper-thin critical sections."
**Red flag:** Reaching for RWMutex reflexively "because reads are more common" without checking whether the critical section is even large enough for the reader/writer split to pay for itself.

### WaitGroup
**They ask:** "What's the correct pattern for using sync.WaitGroup with goroutines, and the classic bug?"

`sync.WaitGroup` counts outstanding work: `Add(n)` before launching goroutines, `Done()` (via `defer`) inside each one, `Wait()` blocking until the count hits zero. The classic bug is calling `Add` *inside* the goroutine instead of before `go` — that creates a race where `Wait()` can return before all goroutines have even registered, because the counter might still be zero at the moment `Wait` checks it.

```go
var wg sync.WaitGroup
for _, job := range jobs {
    wg.Add(1) // before go, not inside it
    go func(j Job) {
        defer wg.Done()
        process(j)
    }(job)
}
wg.Wait()
```

**Say it:** "Add always happens before the goroutine starts, never inside it — Add-inside-goroutine is a race where Wait can return early because the counter hasn't been incremented yet when Wait checks it."
**Red flag:** Calling `wg.Add(1)` as the first line inside the goroutine closure — that's the textbook version of this bug.

### sync.Once
**They ask:** "What is sync.Once for, and why not just use a bool flag with a mutex?"

`sync.Once.Do(f)` guarantees `f` runs exactly once across any number of goroutines calling it concurrently, and every caller blocks until that single execution completes — including callers that arrive after it's already done, which return immediately. You could hand-roll this with a mutex and a bool, but it's easy to get wrong (checking the bool outside the lock is a race; checking it inside every time adds needless lock contention on the common "already done" path) — `Once` is a correct, lock-free-on-the-fast-path implementation of exactly that pattern, commonly used for lazy singleton initialization.

```go
var once sync.Once
var config *Config
func GetConfig() *Config {
    once.Do(func() { config = loadConfig() })
    return config
}
```

**Say it:** "sync.Once is the correct, race-free version of 'run this exactly once, all callers wait for it, and it's fast afterward' — hand-rolling it with a mutex and a bool is an easy way to introduce a check-outside-the-lock race."
**Red flag:** Reimplementing Once with `if !initialized { mu.Lock(); ... }` — the read of `initialized` before the lock is itself a data race.

### atomic Package
**They ask:** "When do you use sync/atomic instead of a mutex, and what's the trade-off?"

`sync/atomic` provides lock-free operations (`Add`, `Load`, `Store`, `CompareAndSwap`) on individual primitive values, implemented with CPU-level atomic instructions instead of OS-level locking. It's a win for simple counters or flags updated very frequently from many goroutines, where mutex lock/unlock overhead would dominate. The trade-off: atomics only protect a single value at a time — the moment you need to update two related fields consistently together, you need a mutex, because there's no atomic way to change two independent atomic values as one operation.

```go
var counter atomic.Int64 // Go 1.19+ typed atomics
counter.Add(1)
```

**Say it:** "Atomics are for single-value, high-contention counters where lock overhead would dominate — the moment I need to keep two fields consistent with each other, that's a mutex's job, not atomic's."
**Red flag:** Using atomics on two separate fields that must stay consistent with each other (like a balance and a version counter) and assuming atomicity per-field gives you atomicity across both — it doesn't.

### sync.Pool
**They ask:** "What is sync.Pool for, and why is it not a general-purpose object cache?"

`sync.Pool` reduces GC pressure by letting goroutines reuse short-lived objects (buffers, for example) instead of allocating fresh ones — you `Get()` an object, use it, and `Put()` it back when done. The critical caveat: the runtime is free to drop pooled items *at any time*, most aggressively around garbage collection cycles, so a `Pool` gives no guarantee an item you `Put()` will still be there later. That makes it wrong for anything you need to persist — it's purely a reuse optimization for transient allocations, not a cache with a retention contract.

```go
var bufPool = sync.Pool{New: func() any { return new(bytes.Buffer) }}
buf := bufPool.Get().(*bytes.Buffer)
defer bufPool.Put(buf)
buf.Reset() // must reset before reuse — Pool doesn't clear it for you
```

**Say it:** "sync.Pool cuts allocator/GC churn for transient objects, but the runtime can evict anything in it at any time — usually around a GC cycle — so I never use it as a cache I depend on for correctness, and I always reset an object before returning it to the pool."
**Red flag:** Forgetting to reset a pooled object's state before returning it — the next `Get()` can hand back a buffer with stale data from a previous use.

### sync.Map
**They ask:** "When would you use sync.Map instead of a mutex-guarded map[string]T?"

`sync.Map` is optimized for two specific access patterns: keys that are written once and read many times (a stable cache), or many goroutines each operating on disjoint sets of keys with minimal overlap. For those cases it can outperform a mutex-guarded map because it avoids lock contention on the common path. For a typical general-purpose map with mixed, overlapping reads and writes, a plain `map` behind a `sync.RWMutex` is usually simpler to reason about and often just as fast or faster — `sync.Map`'s API (no generics until recently, awkward iteration via `Range`) is also less ergonomic.

**Say it:** "sync.Map earns its keep in the specific case of write-once/read-many or disjoint-key access patterns — for a general shared map I default to RWMutex plus a plain map because it's simpler and usually competitive on performance."
**Red flag:** Reaching for sync.Map as the default "thread-safe map" without checking the access pattern — it's a specialized tool, not a strictly-better replacement for a guarded map.

### Worker Pool Pattern
**They ask:** "How would you implement a worker pool in Go, and why cap concurrency at all?"

A worker pool bounds concurrency by launching a fixed number of goroutines that all pull jobs off a shared channel, rather than spawning one goroutine per job. The point isn't goroutine cost (which is cheap) — it's bounding downstream pressure: unlimited concurrency against a database, an API with a rate limit, or a fixed CPU count just creates contention and can make total throughput *worse*, not better.

```go
jobs := make(chan Job, 100)
var wg sync.WaitGroup
for i := 0; i < numWorkers; i++ {
    wg.Add(1)
    go func() {
        defer wg.Done()
        for job := range jobs { process(job) }
    }()
}
```

**Say it:** "A worker pool exists to bound concurrency against a limited downstream resource — a DB connection pool, an external rate limit, CPU count — not to save on goroutine creation cost, which is already cheap."
**Red flag:** Sizing a worker pool arbitrarily (`numWorkers := 100`) without tying it to the actual constraint downstream — the right number comes from the bottleneck, not a round number.

### Pipeline Pattern
**They ask:** "What is the pipeline concurrency pattern, and how do you propagate cancellation through stages?"

A pipeline chains stages, each a goroutine reading from an input channel and writing to an output channel, so work flows through transformations concurrently — stage N+1 can start processing item 1 while stage N is still working on item 2. The hard part is cancellation: if a downstream stage stops consuming (an error, a client disconnect), upstream stages must not block forever trying to send. The standard fix is a `context.Context` (or a shared "done" channel) that every stage selects on alongside its channel operations, so a cancellation unblocks every stage at once instead of leaking goroutines one by one.

```go
func stage(ctx context.Context, in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for v := range in {
            select {
            case out <- transform(v):
            case <-ctx.Done():
                return
            }
        }
    }()
    return out
}
```

**Say it:** "Every pipeline stage selects on a shared context alongside its channel send, so a downstream cancellation unblocks every upstream stage instead of leaking one goroutine per stage."
**Red flag:** A pipeline stage that does a bare `out <- v` with no select on a cancellation signal — if the consumer stops reading, that goroutine blocks forever.

### Fan-out/Fan-in
**They ask:** "Explain fan-out/fan-in and how you'd merge multiple channels into one."

Fan-out means spreading work from one channel across multiple worker goroutines to parallelize a stage; fan-in means merging the outputs of several channels back into a single channel for the next stage. The merge itself needs its own goroutine per source channel forwarding into a shared output channel, with a `sync.WaitGroup` tracking when all sources are drained so the merged channel can be closed correctly — closing too early drops data, forgetting to close leaks the consumer.

```go
func merge(cs ...<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup
    for _, c := range cs {
        wg.Add(1)
        go func(c <-chan int) {
            defer wg.Done()
            for v := range c { out <- v }
        }(c)
    }
    go func() { wg.Wait(); close(out) }()
    return out
}
```

**Say it:** "Fan-in needs a WaitGroup tracking every source channel so the merged output only closes once all sources are actually drained — closing early silently drops in-flight data."
**Red flag:** Closing the merged output channel as soon as the *first* source channel closes — that drops whatever the other sources hadn't sent yet.

### Future/Promise Pattern in Go
**They ask:** "Go has no built-in Future/Promise — how do you build one with a channel?"

A single-value buffered channel (or a channel plus a struct wrapping value/error) models a future: you launch a goroutine that computes a result and sends it once, and the caller receives from the channel whenever it actually needs the value, blocking only if the result isn't ready yet. Buffering it with capacity 1 means the producer goroutine can complete and exit even if nobody's reading yet, avoiding a goroutine leak on the producer side.

```go
func Future(f func() (int, error)) <-chan Result {
    ch := make(chan Result, 1)
    go func() {
        v, err := f()
        ch <- Result{v, err}
    }()
    return ch
}
```

**Say it:** "A future in Go is just a capacity-1 channel a producer goroutine sends its single result into — buffering it means the producer can finish and exit even if the caller hasn't asked for the value yet."
**Red flag:** Using an unbuffered channel for a future whose consumer might never call receive (e.g., an error path that abandons the result) — the producer goroutine blocks on the send forever, a leak.

### Context Cancellation Propagation
**They ask:** "How does context.Context cancel a whole tree of goroutines?"

`context.WithCancel`/`WithTimeout`/`WithDeadline` return a derived context whose `Done()` channel closes when cancelled — and because contexts form a tree (each derived from a parent), cancelling a parent closes the `Done()` channel of every descendant context transitively. Every goroutine that respects cancellation selects on `ctx.Done()` in its blocking operations, so one cancel call at the root unblocks every downstream goroutine that was passed a context derived from it — that's the entire mechanism, there's no magic broadcast, just a channel close propagating down a tree of derived contexts.

**Say it:** "Cancellation propagates because contexts form a tree and closing a channel is a broadcast to every receiver — cancel the root, every derived Done() channel closes, and every goroutine selecting on it unblocks at once."
**Red flag:** Passing `context.Background()` deep into a call chain instead of threading the real request context through — that silently breaks cancellation propagation for that whole subtree.

### Deadlock Detection
**They ask:** "How does Go detect 'all goroutines are asleep' deadlocks, and what's a common cause?"

The Go runtime tracks every goroutine's state; if it ever detects that *all* goroutines in the program are simultaneously blocked (on a channel op, a mutex, etc.) with none runnable, it knows the program can never make progress and panics with `fatal error: all goroutines are asleep - deadlock!`, dumping every goroutine's stack. It's a whole-program check, not per-goroutine — a single leaked goroutine blocked forever while others are busy doesn't trigger it, which is why individual leaks are harder to catch than a full deadlock. A common cause: `main` sending on an unbuffered channel with no other goroutine ever launched to receive it.

```go
func main() {
    ch := make(chan int)
    ch <- 1 // deadlock: nobody will ever receive
}
```

**Say it:** "The deadlock detector only fires when literally every goroutine is blocked at once — a single leaked goroutine among otherwise-busy ones won't trigger it, which is why I don't rely on the runtime to catch leaks, only true whole-program deadlocks."
**Red flag:** Treating the absence of a "deadlock" panic as proof there are no blocking bugs — the detector's blind spot is exactly the leaked-goroutine case, which is often the more common production issue.

### errgroup for Concurrent Error Handling
**They ask:** "How does golang.org/x/sync/errgroup improve on a raw WaitGroup?"

A raw `sync.WaitGroup` has no built-in way to collect the first error from a set of concurrent goroutines or to cancel the rest once one fails — you'd hand-roll a mutex-guarded error variable and a context. `errgroup.Group` bundles exactly that: `g.Go(func() error {...})` launches goroutines, `g.Wait()` returns the first non-nil error, and `errgroup.WithContext` gives you a context that's automatically cancelled the moment any goroutine returns an error, so sibling goroutines can bail out early instead of doing wasted work.

```go
g, ctx := errgroup.WithContext(context.Background())
for _, url := range urls {
    url := url
    g.Go(func() error { return fetch(ctx, url) })
}
if err := g.Wait(); err != nil { /* first error from any fetch */ }
```

**Say it:** "errgroup gives me first-error-wins semantics plus automatic context cancellation across a group of goroutines — the exact boilerplate I'd otherwise hand-roll with a WaitGroup, a mutex, and a context."
**Red flag:** Hand-rolling error collection from N goroutines with a shared slice and no mutex — that's a data race on the slice itself, on top of missing the early-cancellation behavior errgroup gives for free.

### Semaphore Pattern with Buffered Channels
**They ask:** "How do you bound concurrency with a buffered channel used as a semaphore?"

A buffered channel of capacity `n` can act as a counting semaphore: acquiring a slot means sending a token (or an empty struct) into the channel, which blocks once `n` slots are taken; releasing means receiving from it. This is a common lightweight alternative to a full worker-pool-with-job-channel when you just need to cap how many goroutines run a particular operation concurrently, without the fixed-worker-count machinery.

```go
sem := make(chan struct{}, 5) // max 5 concurrent
for _, job := range jobs {
    sem <- struct{}{}         // acquire
    go func(j Job) {
        defer func() { <-sem }() // release
        process(j)
    }(job)
}
```

**Say it:** "A buffered channel of empty structs is a cheap counting semaphore — send to acquire a slot, receive to release, capacity is the concurrency limit — I reach for it when I want a concurrency cap without standing up a full worker-pool structure."
**Red flag:** Forgetting the `defer` on the release — if `process` panics, the slot never frees and the semaphore silently loses capacity forever.
