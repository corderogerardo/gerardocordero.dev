# Flashcards — Go (Andersen matrix)

Every matrix row as an interviewer question. Filter by level and category in the deck.

## Concurrency

### Concurrency

- Explain Go's GMP scheduler model — what are G, M, and P? — [answer](concurrency.md#the-gmp-scheduler-model)
- Why are goroutines cheap compared to OS threads, and what's the real startup cost? — [answer](concurrency.md#goroutines-vs-os-threads)
- What does GOMAXPROCS actually control, and when would you change it? — [answer](concurrency.md#gomaxprocs)
- Go's scheduler used to be cooperative-only — what changed in 1.14 and why did it matter? — [answer](concurrency.md#cooperative-vs-preemptive-scheduling)
- How does a goroutine leak happen, and how do you detect one in production? — [answer](concurrency.md#goroutine-leaks)
- What's the actual difference in blocking behavior between a buffered and unbuffered channel? — [answer](concurrency.md#buffered-vs-unbuffered-channels)
- Why would you restrict a channel parameter to send-only or receive-only? — [answer](concurrency.md#channel-directions)
- How does select choose among multiple ready channels, and what does default do? — [answer](concurrency.md#select-statement)
- What are the rules around closing a channel, and what happens if you close it twice or send on a closed channel? — [answer](concurrency.md#closing-channels)
- How do you implement a timeout on a channel receive? — [answer](concurrency.md#select-with-timeout-and-context)
- What is a data race in Go's memory model terms, and how is it different from a logic race? — [answer](concurrency.md#data-races)
- How does go test -race actually catch races, and what are its limits? — [answer](concurrency.md#the-race-detector)
- When do you reach for sync.RWMutex over sync.Mutex, and where's the trap? — [answer](concurrency.md#mutex-vs-rwmutex)
- What's the correct pattern for using sync.WaitGroup with goroutines, and the classic bug? — [answer](concurrency.md#waitgroup)
- What is sync.Once for, and why not just use a bool flag with a mutex? — [answer](concurrency.md#synconce)
- When do you use sync/atomic instead of a mutex, and what's the trade-off? — [answer](concurrency.md#atomic-package)
- What is sync.Pool for, and why is it not a general-purpose object cache? — [answer](concurrency.md#syncpool)
- When would you use sync.Map instead of a mutex-guarded map[string]T? — [answer](concurrency.md#syncmap)
- How would you implement a worker pool in Go, and why cap concurrency at all? — [answer](concurrency.md#worker-pool-pattern)
- What is the pipeline concurrency pattern, and how do you propagate cancellation through stages? — [answer](concurrency.md#pipeline-pattern)
- Explain fan-out/fan-in and how you'd merge multiple channels into one. — [answer](concurrency.md#fan-outfan-in)
- Go has no built-in Future/Promise — how do you build one with a channel? — [answer](concurrency.md#futurepromise-pattern-in-go)
- How does context.Context cancel a whole tree of goroutines? — [answer](concurrency.md#context-cancellation-propagation)
- How does Go detect 'all goroutines are asleep' deadlocks, and what's a common cause? — [answer](concurrency.md#deadlock-detection)
- How does golang.org/x/sync/errgroup improve on a raw WaitGroup? — [answer](concurrency.md#errgroup-for-concurrent-error-handling)
- How do you bound concurrency with a buffered channel used as a semaphore? — [answer](concurrency.md#semaphore-pattern-with-buffered-channels)

## Go Core

### Go Core

- What's the difference between rune and byte in Go, and why does Go have both? — [answer](go-core.md#rune-byte-and-string-encoding)
- How do untyped constants work in Go, and what is iota for? — [answer](go-core.md#constants-and-iota)
- When do you pass a pointer vs a value in Go, and what's the actual cost difference? — [answer](go-core.md#pointers-and-value-semantics)
- What is a Go slice under the hood, and why can appending to one silently corrupt another? — [answer](go-core.md#slice-internals)
- How does append grow a slice's capacity, and when should you preallocate? — [answer](go-core.md#slice-growth-and-preallocation)
- Arrays are value types in Go — what does that actually mean in practice? — [answer](go-core.md#arrays-vs-slices)
- How does a Go map work under the hood, and why is iteration order random? — [answer](go-core.md#map-internals)
- Why does a concurrent map write panic instead of silently corrupting, and what's your fix? — [answer](go-core.md#map-concurrency)
- How does Go decide a type satisfies an interface, and why is that different from Java/C#? — [answer](go-core.md#interfaces-and-implicit-satisfaction)
- What is interface{} (or any) for, and what do you give up when you use it? — [answer](go-core.md#the-empty-interface-and-any)
- What's the difference between a type assertion and a type switch, and how do you do a safe assertion? — [answer](go-core.md#type-assertions-and-type-switches)
- Why can a nil pointer stored in an interface compare != nil? — [answer](go-core.md#nil-interface-gotcha)
- How do you define a struct, and what are struct tags actually for? — [answer](go-core.md#structs-and-field-tags)
- Go has no private keyword — how do you actually encapsulate state? — [answer](go-core.md#encapsulation-via-package-visibility)
- Go has no inheritance — how does struct embedding give you code reuse, and where's the trap? — [answer](go-core.md#composition-and-embedding)
- How do you get polymorphism in Go without class hierarchies? — [answer](go-core.md#interface-composition-and-polymorphism)
- How do variadic functions work in Go, and what's the gotcha when you pass a slice to one? — [answer](go-core.md#variadic-functions)
- What does a Go closure actually capture, and what's the classic loop-variable bug? — [answer](go-core.md#closures)
- How does Go handle deep recursion — does it blow the stack like C? — [answer](go-core.md#recursion-and-stack-growth)
- What does it mean that functions are first-class in Go, and where do you actually use that? — [answer](go-core.md#first-class-and-higher-order-functions)
- Why did Go add generics in 1.18, and what problem were people solving with interface{} + reflection before that? — [answer](go-core.md#generics-and-type-parameters)
- What is a type constraint, and how do you write one beyond the built-in comparable? — [answer](go-core.md#generic-constraints)
- When can you compare two structs with ==, and when do you need reflect.DeepEqual? — [answer](go-core.md#struct-comparison-and-equality)
- How do you decide between a pointer receiver and a value receiver, and how does that affect interface satisfaction? — [answer](go-core.md#method-sets-pointer-vs-value-receivers)

## Runtime

### Runtime

- Why does field order in a struct affect its memory size? — [answer](runtime.md#struct-alignment-and-padding)
- How does Go decide whether a variable goes on the stack or the heap? — [answer](runtime.md#escape-analysis)
- What causes a value to 'escape' unexpectedly, and how do you find out with go build -gcflags? — [answer](runtime.md#finding-unexpected-escapes)
- What does the Go memory model guarantee about visibility of writes across goroutines? — [answer](runtime.md#gos-memory-model)
- How does Go's garbage collector work, and why did they optimize for low latency over throughput? — [answer](runtime.md#garbage-collector)
- What does GOGC control, and when would you tune it? — [answer](runtime.md#gc-tuning)
- What's the execution order when a package has multiple init functions and imports? — [answer](runtime.md#main-and-init-functions)
- How does defer actually work — LIFO order, and when are arguments evaluated? — [answer](runtime.md#defer-semantics)
- Does defer have a real performance cost, and when does it matter? — [answer](runtime.md#defer-performance-cost)
- How do you use defer with a named return to recover from a panic and still return a value? — [answer](runtime.md#defer-panic-and-named-return-values)
- What do gofmt, go vet, and godoc each catch that the others don't? — [answer](runtime.md#go-toolchain-basics)
- How do you profile a Go program's CPU and memory with pprof? — [answer](runtime.md#pprof-profiling)
- What does a linter like golangci-lint catch that go vet doesn't? — [answer](runtime.md#linters)
- How does Go modules dependency resolution work, and what's the difference between go.mod and go.sum? — [answer](runtime.md#go-modules)
- What's a table-driven test in Go, and why is it the idiomatic pattern? — [answer](runtime.md#table-driven-tests)
- How do you write and interpret a Go benchmark? — [answer](runtime.md#benchmarks)
- Go has no mocking framework built in — how do you mock a dependency idiomatically? — [answer](runtime.md#mocking-in-go)
- How do you test an HTTP handler without starting a real server? — [answer](runtime.md#httptest-package)
- What does testify add over the standard testing package? — [answer](runtime.md#testify)
- How do t.Run subtests improve on a plain table-driven loop? — [answer](runtime.md#subtests-and-test-organization)
