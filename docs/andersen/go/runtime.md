# Go — runtime, defer, tools, testing

### Struct Alignment and Padding
**They ask:** "Why does field order in a struct affect its memory size?"

The compiler aligns each field to its natural boundary (an `int64` starts at an 8-byte-aligned offset, for example), and inserts padding bytes to satisfy that alignment — so declaring fields in a suboptimal order can waste bytes between them that a reorder would eliminate. Ordering fields from largest to smallest alignment requirement typically minimizes padding, which matters at scale: a struct that's 8 bytes smaller times millions of instances in a slice is real memory.

```go
type Bad struct {  // 24 bytes: bool padded to 8 to align the int64s
    A bool
    B int64
    C int32
}
type Good struct { // 16 bytes: same fields, better order
    B int64
    C int32
    A bool
}
```

**Say it:** "Struct field order affects padding because each field aligns to its own size boundary — ordering large-to-small fields minimizes wasted padding, which is a real win for structs allocated by the millions."
**Red flag:** Not knowing `unsafe.Sizeof` and the `fieldalignment` linter exist to catch this — it's a mechanical, tool-catchable optimization, not something you should hand-verify by memory.

### Escape Analysis
**They ask:** "How does Go decide whether a variable goes on the stack or the heap?"

The compiler's escape analysis pass determines whether a variable's lifetime is provably confined to the function that created it — if so, it stays on the stack, which is cheap to allocate and free (just moving a stack pointer) and needs no GC involvement. A variable "escapes" to the heap when the compiler can't prove that confinement: returning a pointer to a local, storing it somewhere with unbounded lifetime, or passing it to a function the compiler can't fully analyze (like through an interface). Heap allocation is real cost — GC has to track and eventually collect it.

```go
func onStack() int { x := 5; return x }       // x stays on stack
func onHeap() *int { x := 5; return &x }      // x escapes — caller holds the pointer
```

**Say it:** "Escape analysis keeps a variable on the stack whenever it can prove the lifetime is local — the moment a pointer to it can outlive the function, it has to escape to the heap, and that's the real thing driving Go's allocation cost, not whether you 'used a pointer.'"
**Red flag:** Assuming using a value instead of a pointer always avoids heap allocation — a value can still escape if it's captured by a closure that outlives the function or stored in an interface.

### Finding Unexpected Escapes
**They ask:** "What causes a value to 'escape' unexpectedly, and how do you find out with go build -gcflags?"

Common surprise-escape causes: passing a value through an `interface{}` parameter (the compiler often can't prove the concrete type's lifetime through an interface boundary), capturing a variable in a closure that's returned or stored, or a value being too large for the compiler to prove is safe on the stack. `go build -gcflags="-m"` prints the compiler's escape analysis decisions line by line — `"x escapes to heap"` tells you exactly where and, with `-m -m`, often why.

```bash
go build -gcflags="-m" ./...
# ./main.go:12:6: moved to heap: x
```

**Say it:** "When I need to know why something's allocating, `-gcflags=-m` gives me the compiler's actual escape decisions per line — I don't guess about heap vs stack, I check."
**Red flag:** Optimizing allocation behavior based on intuition about pointers vs values without ever running `-gcflags=-m` to confirm — Go's escape analysis has enough edge cases that guessing is unreliable.

### Go's Memory Model
**They ask:** "What does the Go memory model guarantee about visibility of writes across goroutines?"

Without synchronization, the Go memory model gives you no guarantee that one goroutine will ever observe another goroutine's writes, in any order — the compiler and CPU are free to reorder instructions and cache values as long as single-goroutine behavior looks unchanged. Synchronization primitives (channel send/receive, mutex lock/unlock, `sync/atomic`, `sync.Once`) establish explicit "happens-before" edges — a channel send happens-before the corresponding receive completes, for instance — and only those edges guarantee visibility across goroutines.

**Say it:** "Without an explicit happens-before edge — a channel op, a mutex, an atomic — there's no guarantee one goroutine ever sees another's writes, which is exactly why unsynchronized shared state is undefined behavior in Go, not just 'usually works.'"
**Red flag:** Using a plain bool as a 'goroutine finished' flag with no synchronization, assuming the write will 'eventually' be visible to another goroutine polling it — that's a data race with no visibility guarantee at all, not a timing issue.

### Garbage Collector
**They ask:** "How does Go's garbage collector work, and why did they optimize for low latency over throughput?"

Go's GC is a concurrent, tri-color mark-and-sweep collector that runs mostly alongside your program instead of stopping it — it marks reachable objects (with brief, sub-millisecond stop-the-world pauses at the very start and end of a cycle) while goroutines keep running, using a write barrier to track concurrent mutations to the object graph, then sweeps unreachable memory. Go prioritized low, predictable pause times over raw throughput because Go's sweet spot is network services — a 100ms GC pause is a visible latency spike on every request in flight, which matters more for a server than shaving off some allocation throughput.

**Say it:** "Go's GC is concurrent mark-and-sweep with the goal of near-zero stop-the-world time, because the target workload is latency-sensitive services — a predictable sub-millisecond pause beats higher raw throughput with occasional multi-hundred-ms pauses."
**Red flag:** Comparing Go's GC pause times to a naive stop-the-world collector from a decade ago — modern Go GC pauses are typically sub-millisecond; the actual cost to watch is CPU spent on background marking, not pause time.

### GC Tuning
**They ask:** "What does GOGC control, and when would you tune it?"

`GOGC` sets the target heap growth percentage before the next GC cycle triggers — the default `100` means "run a GC when live heap has roughly doubled since the last cycle," trading more memory for less GC CPU time. Raising it (or using `GOMEMLIMIT` since Go 1.19, which caps total memory instead of a ratio) trades memory for less frequent GC and lower CPU overhead; lowering it trades memory for more frequent, shorter cycles. You'd tune it when profiling shows GC CPU time is a meaningful fraction of total CPU and you have memory headroom to spend, or conversely when you're memory-constrained and can spare CPU.

**Say it:** "GOGC trades memory for GC CPU time — I raise it or set GOMEMLIMIT when a profile shows real GC overhead and I have memory to spare, I don't tune it blind without that profiling evidence."
**Red flag:** Setting `GOGC=off` in production "for performance" without a hard memory ceiling — that turns off garbage collection entirely, and an unbounded heap in a long-running service is an OOM waiting to happen.

### Main and Init Functions
**They ask:** "What's the execution order when a package has multiple init functions and imports?"

Go guarantees package initialization in dependency order — every package a package imports is fully initialized (package-level vars, then all `init()` functions in that package) before the importing package's own initialization runs. Within a single package, multiple `init()` functions (even across different files) run in file order as a build convention — most toolchains process files alphabetically — but the language spec does not guarantee that ordering, so cross-file `init()` order is effectively unspecified and shouldn't be relied on. `main()` runs only after every imported package's initialization — and its own — has completed.

**Say it:** "Initialization order follows the import graph — every dependency is fully initialized, including its init functions, before main starts. Within a package, the spec only guarantees dependency order for vars, not a specific order across multiple init() functions in different files, so I never split state-dependent init logic across files and rely on file order."
**Red flag:** Relying on init() functions across multiple files running in a specific order. The language spec doesn't guarantee it — only the import-dependency order is guaranteed — so that's fragile and not something a reviewer should let through.

### Defer Semantics
**They ask:** "How does defer actually work — LIFO order, and when are arguments evaluated?"

`defer` schedules a function call to run when the surrounding function returns, and multiple deferred calls in one function run in LIFO order — last deferred, first executed, like a stack, which is why deferred cleanup (closing resources you opened in order) unwinds correctly. The subtle part: the deferred function's *arguments* are evaluated immediately at the point of the `defer` statement, not when it actually runs later — only the call itself is delayed.

```go
func example() {
    for i := 0; i < 3; i++ {
        defer fmt.Println(i) // args evaluated now: prints 2, 1, 0
    }
}
```

**Say it:** "Defer's call is delayed but its arguments are evaluated immediately at the defer statement — and multiple defers unwind LIFO, which is exactly what you want for symmetric open/close cleanup."
**Red flag:** Deferring a call with an argument you expect to reflect a *later* value (like `defer fmt.Println(err)` before `err` is even set) — the argument snapshot happens at defer time, not call time.

### Defer Performance Cost
**They ask:** "Does defer have a real performance cost, and when does it matter?"

Historically `defer` had measurable overhead versus a direct call, because the runtime had to allocate a deferred-call record. Go 1.14 introduced "open-coded" defers, which inline the deferred call directly at each return point for simple, non-loop cases — that made most defers essentially free. The cost still shows up when `defer` is inside a hot loop (each iteration schedules a new deferred call that only runs once the whole function returns, not once per iteration, which is also a correctness trap, not just a perf one) — in a tight loop you generally want to call cleanup directly instead of deferring it per iteration.

```go
for _, f := range files {
    file, _ := os.Open(f)
    defer file.Close() // all close at function end, not per iteration — fd leak risk in a big loop
}
```

**Say it:** "Modern Go's open-coded defers make a single defer essentially free — the real cost I watch for is deferring inside a loop, which doesn't run per-iteration cleanup at all, it piles up until the function returns, which is both a perf and a resource-leak problem."
**Red flag:** Deferring `Close()` inside a loop that processes many files in one function call — the file descriptors all stay open until the whole function returns, not each iteration.

### Defer, Panic, and Named Return Values
**They ask:** "How do you use defer with a named return to recover from a panic and still return a value?"

A deferred function can modify a named return value even after a panic began unwinding — because `recover()` stops the panic only if called directly inside a deferred function, and that deferred function still executes with access to the named returns before the function actually exits. This is the standard pattern for converting a panic into an error at an API boundary.

```go
func safeDivide(a, b int) (result int, err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("recovered: %v", r)
        }
    }()
    return a / b, nil // panics on b == 0
}
```

**Say it:** "recover only works called directly inside a defer, and to actually return a converted error I need a named return value the deferred function can assign to after recovering — that's the whole mechanism, no magic."
**Red flag:** Calling `recover()` from a function that isn't directly deferred (e.g., a helper function called from inside the deferred func) — recover only stops the panic when invoked directly by the deferred call, one level removed and it returns nil even during an active panic.

### Go Toolchain Basics
**They ask:** "What do gofmt, go vet, and godoc each catch that the others don't?"

`gofmt` is purely formatting — canonical whitespace, brace placement, import grouping — it has zero opinion on correctness, which is exactly why Go code across the entire ecosystem looks the same and code review never argues about style. `go vet` is static analysis for suspicious-but-compilable code: a `Printf` format string that doesn't match its arguments, an unreachable code path, a struct passed by value that contains a `sync.Mutex` (which breaks the mutex if copied). `godoc` extracts and serves documentation from comments directly above declarations — it doesn't check anything, it's a documentation generator/server.

**Say it:** "gofmt is formatting only, go vet is static analysis for correctness smells the compiler doesn't catch, and godoc is documentation tooling — three different jobs, and `gofmt` running clean says nothing about whether `go vet` would flag something."
**Red flag:** Treating `gofmt` passing as "the code is fine" — it only means the whitespace is canonical; it catches zero logic or correctness issues.

### pprof Profiling
**They ask:** "How do you profile a Go program's CPU and memory with pprof?"

`net/http/pprof` (for a running server) or `runtime/pprof` (for a one-off program) exposes profiling data that the `pprof` tool visualizes — CPU profiles sample the call stack periodically to show where time is spent, heap profiles sample allocations to show where memory is going, and goroutine profiles dump every goroutine's current stack (useful for finding leaks). The typical flow is importing `_ "net/http/pprof"` to register the endpoints, hitting `/debug/pprof/profile?seconds=30` for CPU or `/debug/pprof/heap` for memory, then `go tool pprof -http=:8080 <profile>` for the interactive flame graph.

```go
import _ "net/http/pprof"
// then: go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30
```

**Say it:** "I profile before I optimize, not instead of measuring — CPU profile for 'where's the time going,' heap profile for 'where's the memory going,' goroutine profile for 'what's stuck,' and the flame graph tells me which function is actually worth touching."
**Red flag:** Optimizing a function because it "feels slow" without a CPU profile confirming it's actually the bottleneck — premature optimization on the wrong function wastes effort and adds complexity for nothing.

### Linters
**They ask:** "What does a linter like golangci-lint catch that go vet doesn't?"

`go vet` is narrowly scoped to correctness bugs the Go team considers near-universal. `golangci-lint` is a meta-linter that runs dozens of individual linters together — unused variables and imports, ineffective assignments, cyclomatic complexity, security issues (`gosec`), style conventions, error-handling patterns (unchecked errors), and more — configurable per project. It's the practical default for CI because it aggregates linters that would otherwise each need separate invocation and config.

**Say it:** "go vet is a small, conservative set of near-universal correctness checks baked into the toolchain — golangci-lint aggregates dozens of opinionated linters (unused code, complexity, security, unchecked errors) that a team tunes per project, which is why it's the CI default, not vet alone."
**Red flag:** Assuming a clean `go vet` run means the codebase has no lint issues — vet's scope is deliberately narrow; it's not a substitute for a real linter suite.

### Go Modules
**They ask:** "How does Go modules dependency resolution work, and what's the difference between go.mod and go.sum?"

`go.mod` declares the module's own path, its Go version, and its direct dependencies with version constraints; Go modules use Minimum Version Selection — for each dependency, it picks the *minimum* version that satisfies every requirement across the whole dependency graph, not the latest available, which makes builds more reproducible and predictable than "always take latest." `go.sum` is a separate integrity file recording cryptographic checksums of every module version actually used, so a build fails loudly if a dependency's content ever changes without the version changing — protecting against a compromised or altered package.

**Say it:** "go.mod pins the version constraints and resolves via minimum version selection, not 'latest' — go.sum is the integrity layer, checksums that make a supply-chain tamper or mismatch fail the build instead of silently pulling different code."
**Red flag:** Committing code with `go.mod` changes but no corresponding `go.sum` update, or telling a teammate to just delete `go.sum` to "fix" a build issue — that throws away the integrity guarantee instead of diagnosing the actual mismatch.

### Table-Driven Tests
**They ask:** "What's a table-driven test in Go, and why is it the idiomatic pattern?"

A table-driven test defines a slice of input/expected-output cases, then loops over them running the same assertion logic per case — it's idiomatic because it separates the test *data* from the test *logic*, so adding a new case is a one-line addition instead of copy-pasting a whole test function. Combined with `t.Run(name, func(t *testing.T){...})` per case, each case becomes independently identifiable and runnable (`go test -run TestFoo/case_name`), and one failing case doesn't stop the others from reporting.

```go
func TestAdd(t *testing.T) {
    cases := []struct{ a, b, want int }{
        {1, 2, 3}, {0, 0, 0}, {-1, 1, 0},
    }
    for _, c := range cases {
        t.Run(fmt.Sprintf("%d+%d", c.a, c.b), func(t *testing.T) {
            if got := Add(c.a, c.b); got != c.want {
                t.Errorf("got %d, want %d", got, c.want)
            }
        })
    }
}
```

**Say it:** "Table-driven tests separate data from assertion logic, and wrapping each case in `t.Run` gives independently addressable, independently failing subtests — that's the idiomatic Go pattern, not a bag of individually copy-pasted test functions."
**Red flag:** Writing a table-driven test without `t.Run` per case — one bad case aborts the whole loop instead of reporting all failures, and you lose per-case names in the test output.

### Benchmarks
**They ask:** "How do you write and interpret a Go benchmark?"

A benchmark function takes `*testing.B` and runs the code under test `b.N` times, where the testing framework auto-adjusts `N` upward until the measurement is statistically stable. `go test -bench=. -benchmem` reports ns/op (time per operation) and, with `-benchmem`, allocations per operation — the alloc count is often more actionable than the raw time, since it points directly at where to reduce GC pressure. `b.ResetTimer()` excludes expensive setup from the measured loop.

```go
func BenchmarkConcat(b *testing.B) {
    for i := 0; i < b.N; i++ {
        _ = strings.Join([]string{"a", "b", "c"}, "")
    }
}
```

**Say it:** "I run benchmarks with -benchmem, not just for ns/op — allocations per operation usually tells me exactly what to fix, and I reset the timer after any setup that shouldn't count toward the measured loop."
**Red flag:** Comparing two benchmark runs from different machines, different load conditions, or without `benchstat` to check statistical significance — a naive ns/op diff between two runs can easily be noise.

### Mocking in Go
**They ask:** "Go has no mocking framework built in — how do you mock a dependency idiomatically?"

Because Go interfaces are satisfied structurally, the idiomatic approach is to define a small interface at the point of use (e.g., a `UserStore` interface with the two methods a handler actually needs), then write a hand-rolled or generated fake implementation for tests — no framework required, just a struct implementing the interface with configurable behavior. Tools like `mockgen` (from `gomock`) or `moq` generate that boilerplate from an interface definition automatically, but the underlying mechanism is still "any type with the right methods satisfies the interface."

```go
type UserStore interface{ GetUser(id string) (*User, error) }
type fakeStore struct{ user *User; err error }
func (f *fakeStore) GetUser(id string) (*User, error) { return f.user, f.err }
```

**Say it:** "Go's structural typing means mocking is just writing another type that satisfies the same small interface — mockgen and moq automate the boilerplate, but there's no runtime magic, unlike a framework that monkey-patches method dispatch."
**Red flag:** Defining a broad interface with every method the real implementation has "so it can be mocked" — the mock then needs to implement methods the test never uses, which is exactly what small, consumer-defined interfaces are meant to avoid.

### httptest Package
**They ask:** "How do you test an HTTP handler without starting a real server?"

`net/http/httptest` gives you `httptest.NewRequest` and `httptest.NewRecorder` to call an `http.Handler` directly in-process — you build a request, pass a `ResponseRecorder` as the `http.ResponseWriter`, invoke `handler.ServeHTTP(rec, req)`, then assert on `rec.Code`, `rec.Body`, and headers. For tests that genuinely need a live server (integration tests exercising the full stack, or testing a client against a handler), `httptest.NewServer` spins up a real listener on a random port and tears it down with `defer server.Close()`.

```go
req := httptest.NewRequest(http.MethodGet, "/users/1", nil)
rec := httptest.NewRecorder()
handler.ServeHTTP(rec, req)
if rec.Code != http.StatusOK { t.Errorf("got %d", rec.Code) }
```

**Say it:** "For a handler unit test I use NewRequest plus a ResponseRecorder — no real socket, no real server — and I only reach for httptest.NewServer when the test genuinely needs a live listener, like testing an HTTP client."
**Red flag:** Spinning up a real `httptest.NewServer` for every handler test when a direct `ServeHTTP` call with a recorder would do — it's slower and adds teardown complexity for no added coverage.

### Testify
**They ask:** "What does testify add over the standard testing package?"

`testify/assert` and `testify/require` add expressive assertion helpers (`assert.Equal`, `assert.NoError`, `assert.Contains`) with readable failure messages, versus hand-rolling `if got != want { t.Errorf(...) }` every time. The key distinction between the two subpackages: `assert` logs a failure and continues the test, `require` logs and immediately halts via `t.FailNow()` — you use `require` for a precondition where continuing the test with a nil/invalid value would just cause a confusing cascade of failures or a panic. `testify/mock` also provides a generic mocking framework as an alternative to hand-rolled fakes or `mockgen`.

```go
require.NoError(t, err)         // stop here if err is non-nil
assert.Equal(t, want, got)      // report and keep going
```

**Say it:** "The line between assert and require is whether the test can meaningfully continue after a failure — require for a precondition where continuing would panic or produce noise, assert for independent checks I want all reported together."
**Red flag:** Using `assert.NoError` immediately followed by code that dereferences the result assuming it's non-nil — if the assert fails, execution continues and the next line panics; that precondition needed `require`.

### Subtests and Test Organization
**They ask:** "How do t.Run subtests improve on a plain table-driven loop?"

Beyond giving each case an addressable name (`go test -run TestX/case_name`), `t.Run` subtests are independent in failure reporting — a panic or `t.Fatal` in one subtest doesn't abort the sibling subtests in the same table, unlike a bare loop where a `t.Fatal` (or an unrecovered panic) stops the whole test function. Subtests also compose with `t.Parallel()` per case, which lets independent table cases run concurrently — a real speedup for tables with I/O-bound cases — while `t.Cleanup` registers per-subtest teardown that runs even if the subtest fails.

**Say it:** "t.Run gives me per-case isolation and addressability, which is what makes it safe to add `t.Parallel()` to individual table cases — a bare for-loop with t.Fatal inside it stops the whole table on the first failure, subtests don't."
**Red flag:** Calling `t.Parallel()` inside a table-driven subtest without capturing the loop variable correctly in pre-1.22 Go — every parallel subtest can end up running with the same (final) case value.
