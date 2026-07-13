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
- What does the `go` keyword actually do? — [answer](concurrency.md#starting-a-goroutine) {J1, J2, J3}
- How do you actually create and use a channel to pass a value between goroutines? — [answer](concurrency.md#creating-and-using-a-channel) {J1, J2, J3}

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
- What do senior engineers get wrong with encoding/json in Go? — [answer](go-core.md#encodingjson-custom-marshaling-and-the-gotchas)
- When do you use `:=` instead of `var`, and what's actually different? — [answer](go-core.md#short-variable-declaration-vs-var) {J1, J2, J3}
- What value does an uninitialized variable actually have in Go? — [answer](go-core.md#zero-values) {J1, J2, J3}
- Go has no while or do-while keyword — how do you write those loops? — [answer](go-core.md#the-for-loop) {J1, J2, J3}
- What's that pattern where people write `if err := doThing(); err != nil`? — [answer](go-core.md#if-with-an-init-statement) {J1, J2, J3}
- Why does almost every Go function return two values, like value, err? — [answer](go-core.md#multiple-return-values) {J1, J2, J3}
- What's the difference between `T{...}` and `&T{...}` when constructing a struct? — [answer](go-core.md#struct-literals-named-fields-vs-t-pointer) {J1, J2, J3}
- What's the difference between `make` and `new` in Go? — [answer](go-core.md#make-vs-new) {J1, J2, J3}
- What do the two values you get from `range` actually mean for a slice versus a map? — [answer](go-core.md#range-over-slices-and-maps) {J1, J2, J3}
- What's the difference between `%v`, `%+v`, `%#v`, and `%T` in Printf? — [answer](go-core.md#fmtprintf-verbs) {J1, J2, J3}
- Is a nil slice the same as an empty slice? What about a nil map? — [answer](go-core.md#nil-for-slices-maps-and-pointers) {J1, J2, J3}
- How is Go's switch different from C or Java's? — [answer](go-core.md#basic-switch-statement) {J1, J2, J3}
- Why won't Go let me assign an int to a float64 variable directly? — [answer](go-core.md#explicit-type-conversion) {J1, J2, J3}
- What does the underscore `_` actually mean in Go? — [answer](go-core.md#the-blank-identifier) {J1, J2, J3}
- What actually makes a function a method in Go? — [answer](go-core.md#methods-functions-with-a-receiver) {J1, J2, J3}

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
- A hot code path is allocating too much and GC pressure is hurting latency — how do you bring allocations down? — [answer](runtime.md#reducing-allocations-in-a-hot-path)
- What's the minimal skeleton of a runnable Go program? — [answer](runtime.md#program-structure-package-import-func-main) {J1, J2, J3}
- What's actually different between `go run` and `go build`? — [answer](runtime.md#go-run-vs-go-build) {J1, J2, J3}
- What makes a function in Go a test, and how does `go test` find it? — [answer](runtime.md#writing-a-basic-test-function) {J1, J2, J3}

## Stdlib & Idioms

### Context

- What is context.WithValue for, and why do senior Go engineers discourage it? — [answer](stdlib.md#contextwithvalue-and-request-scoped-data) {J1, J2, J3, M1, M2, M3, S1, S2}
- What's the difference between context.WithCancel, WithTimeout, and WithDeadline, and why must you always call the returned cancel function? — [answer](stdlib.md#context-cancellation-and-deadlines) {J1, J2, J3, M1, M2, M3, S1, S2}
- What are the rules for where context.Context should live in a function signature, and why? — [answer](stdlib.md#passing-context-through-api-boundaries) {J1, J2, J3, M1, M2, M3, S1, S2}
- How does context carry a trace across service boundaries in a microservice call chain? — [answer](stdlib.md#context-for-distributed-tracing) {J1, J2, J3, M1, M2, M3, S1, S2}

### Error Handling

- Why does Go use return values for errors instead of exceptions? — [answer](stdlib.md#the-basic-error-return-convention) {J1, J2, J3}
- What's the difference between comparing an error with == and using errors.Is, and why does it matter with wrapped errors? — [answer](stdlib.md#errorsis-and-sentinel-error-comparison) {J1, J2, J3, M1, M2, M3, S1, S2}
- When do you use errors.As instead of errors.Is, and how do you write a custom error type that supports it? — [answer](stdlib.md#errorsas-and-typed-error-extraction) {J1, J2, J3, M1, M2, M3, S1, S2}
- When do you define a sentinel error versus a custom error struct? — [answer](stdlib.md#custom-error-types-vs-sentinel-errors) {J1, J2, J3, M1, M2, M3, S1, S2}
- When is panic/recover the right tool in Go, given that Go's idiom is explicit error returns? — [answer](stdlib.md#panic-and-recover-semantics) {J1, J2, J3, M1, M2, M3, S1, S2}
- Where in a Go HTTP service should you install a recover, and why not scatter it everywhere? — [answer](stdlib.md#panicrecover-at-service-boundaries) {J1, J2, J3, M1, M2, M3, S1, S2}
- Several operations run and more than one can fail — how do you return all the failures, not just the first? — [answer](stdlib.md#errorsjoin-and-aggregating-multiple-errors) {J3, M1, M2, M3, S1, S2}

### Testing Depth

- How do TDD and BDD differ in practice, and what does BDD look like in a Go codebase? — [answer](stdlib.md#tdd-and-bdd-in-go) {J1, J2, J3, M1, M2, M3, S1, S2}
- What's the practical difference between a fake, a mock, and a stub in Go, and which does the language favor? — [answer](stdlib.md#fakes-vs-mocks-vs-stubs) {J1, J2, J3, M1, M2, M3, S1, S2}
- How do you structure integration tests in a Go project so they don't slow down every go test run? — [answer](stdlib.md#integration-testing-in-go) {J1, J2, J3, M1, M2, M3, S1, S2}
- What does Go's built-in fuzzing (go test -fuzz) actually do, and when does it earn its place over table-driven tests? — [answer](stdlib.md#fuzz-testing) {J1, J2, J3, M1, M2, M3, S1, S2}
- What's the difference between testify's assert and require packages, and why does the choice matter mid-test? — [answer](stdlib.md#assert-vs-require-in-testify) {J1, J2, J3, M1, M2, M3, S1, S2}

## Frameworks

### Web Frameworks

- How does Gin differ from raw net/http, and where does its performance claim actually come from? — [answer](frameworks.md#gin) {J2, J3, M1, M2, M3, S1, S2}
- How does Echo compare to Gin, and when would you pick one over the other? — [answer](frameworks.md#echo) {J2, J3, M1, M2, M3, S1, S2}
- What problem does Go-kit solve that Gin/Echo don't, and why has its popularity declined? — [answer](frameworks.md#go-kit) {J2, J3, M1, M2, M3, S1, S2}
- What kind of framework is Beego, and why is it less common in new Go services today? — [answer](frameworks.md#beego) {J2, J3, M1, M2, M3, S1, S2}
- When would a senior engineer choose plain net/http over any framework? — [answer](frameworks.md#framework-vs-plain-nethttp) {J2, J3, M1, M2, M3, S1, S2}

### Service Composition

- How is middleware implemented in Go, and why does the pattern work the same way across net/http, Gin, and Echo? — [answer](frameworks.md#middleware-chaining-pattern) {J2, J3, M1, M2, M3, S1, S2}
- Go has no DI container/framework by default — how do senior Go codebases actually wire dependencies? — [answer](frameworks.md#dependency-injection-in-go) {J2, J3, M1, M2, M3, S1, S2}

## Databases & Messaging

### SQL & Transactions

- How does Go's database/sql manage connections, and what happens if you don't tune the pool? — [answer](databases.md#databasesql-and-connection-pooling) {J1, J2, J3, M1, M2, M3, S1, S2}
- What is the N+1 query problem, and how would you fix it in a Go service? — [answer](databases.md#the-n1-query-problem) {J1, J2, J3, M1, M2, M3, S1, S2}
- How do database indexes actually speed up a query, and what's the cost you're trading for it? — [answer](databases.md#indexes-how-they-help-and-when-they-hurt) {J2, J3, M1, M2, M3, S1, S2}
- What do ACID transactions guarantee, and how do you use them correctly from Go's database/sql? — [answer](databases.md#transactions-and-isolation-levels) {J2, J3, M1, M2, M3, S1, S2}
- How do you keep data consistent across a write that spans two microservices, when you can't use one database transaction? — [answer](databases.md#distributed-transactions-and-the-saga-pattern) {J2, J3, M1, M2, M3, S1, S2}
- How do you shard a dataset that's outgrown a single database instance, and what's the hardest part to get right? — [answer](databases.md#sharding-strategies) {J2, J3, M1, M2, M3, S1, S2}
- How does leader-follower replication work, and what does 'eventual consistency' cost you in a Go service reading from a replica? — [answer](databases.md#replication-and-replication-lag) {J2, J3, M1, M2, M3, S1, S2}

### NoSQL & Search

- What kind of problem makes a graph database like Neo4j the right choice over a relational schema? — [answer](databases.md#graph-databases-neo4j) {M1, M2, M3, S1, S2}
- What's Cassandra's data model, and what does 'tunable consistency' actually mean when you're calling it from Go? — [answer](databases.md#cassandra-and-tunable-consistency) {M1, M2, M3, S1, S2}
- Why does DynamoDB schema design look so different from a relational schema, and what is 'single-table design'? — [answer](databases.md#dynamodb-partition-key-and-single-table-design) {M1, M2, M3, S1, S2}
- Why is ClickHouse dramatically faster than Postgres for analytics queries over the same data volume? — [answer](databases.md#clickhouse-and-columnar-olap) {J2, J3, M1, M2, M3, S1, S2}
- When does a document store like MongoDB actually beat a relational schema, and what do you give up? — [answer](databases.md#mongodb-and-the-document-model) {J2, J3, M1, M2, M3, S1, S2}
- How does Elasticsearch make full-text search fast, and when do you actually need it over a SQL LIKE? — [answer](databases.md#elasticsearch-and-the-inverted-index) {J2, J3, M1, M2, M3, S1, S2}

### Message Brokers & Caching

- How does Kafka guarantee ordering, and how do consumer groups let you scale processing? — [answer](databases.md#kafka-partitions-and-consumer-groups) {J2, J3, M1, M2, M3, S1, S2}
- What's the difference between at-least-once and exactly-once delivery in Kafka, and which do most Go consumers actually implement? — [answer](databases.md#kafka-delivery-guarantees) {J2, J3, M1, M2, M3, S1, S2}
- How does RabbitMQ route a message from producer to queue, and how does that differ conceptually from Kafka? — [answer](databases.md#rabbitmq-exchanges-and-routing) {J2, J3, M1, M2, M3, S1, S2}
- Kafka or RabbitMQ — how do you actually decide? — [answer](databases.md#kafka-vs-rabbitmq) {J2, J3, M1, M2, M3, S1, S2}
- What makes NATS different from Kafka/RabbitMQ, and what does JetStream add? — [answer](databases.md#nats-and-jetstream) {J2, J3, M1, M2, M3, S1, S2}
- Standard vs FIFO SQS queues — what do you trade for ordering guarantees, and what's a visibility timeout? — [answer](databases.md#amazon-sqs) {J2, J3, M1, M2, M3, S1, S2}
- Why does almost every messaging system in practice deliver at-least-once, and how do you make a Go consumer safe under redelivery? — [answer](databases.md#idempotent-message-consumers) {J2, J3, M1, M2, M3, S1, S2}
- Walk through the common caching strategies and where each one's failure mode bites. — [answer](databases.md#caching-principles-cache-aside-write-through-ttl) {J2, J3, M1, M2, M3, S1, S2}
- What makes Redis more than 'a cache,' and what data structures actually earn that reputation? — [answer](databases.md#redis) {J2, J3, M1, M2, M3, S1, S2}
- When would you actually pick Memcached over Redis? — [answer](databases.md#memcached-vs-redis) {J2, J3, M1, M2, M3, S1, S2}

## Networking & APIs

### Protocols

- Walk through the OSI model — which layers does a backend Go engineer actually reason about? — [answer](networking.md#the-osi-model-the-layers-that-matter-day-to-day) {J1, J2, J3, M1, M2, M3, S1, S2}
- What problem does HTTP/2 actually solve over HTTP/1.1, and does Go's net/http give it to you for free? — [answer](networking.md#http11-vs-http2) {J1, J2, J3, M1, M2, M3, S1, S2}
- What does HTTP/3 change that HTTP/2 couldn't fix? — [answer](networking.md#http3-and-quic-briefly) {J1, J2, J3, M1, M2, M3, S1, S2}
- How does Go's net/http server handle thousands of concurrent connections without threads blowing up? — [answer](networking.md#gos-nethttp-server-concurrency-model) {J1, J2, J3, M1, M2, M3, S1, S2}
- TLS and mTLS for service-to-service auth — what does mutual TLS add over regular TLS? — [answer](networking.md#tls-and-mtls-for-service-to-service-auth) {J1, J2, J3, M1, M2, M3, S1, S2}

### API Design

- What are the concrete design decisions that separate a maintainable REST API from one that breaks clients every release? — [answer](networking.md#rest-api-design-versioning-pagination-idempotency) {J1, J2, J3, M1, M2, M3, S1, S2}
- What makes an API's error responses actually usable by the client calling it? — [answer](networking.md#rest-api-design-status-codes-and-error-responses) {J1, J2, J3, M1, M2, M3, S1, S2}
- How do you implement a WebSocket server in Go, and what's the concurrency contract you must respect per connection? — [answer](networking.md#websocket-in-go) {J1, J2, J3, M1, M2, M3, S1, S2}
- When do you actually need WebSocket, versus SSE or long polling? — [answer](networking.md#websocket-vs-long-polling-vs-server-sent-events) {J1, J2, J3, M1, M2, M3, S1, S2}

### gRPC

- Why would you choose gRPC over a REST/JSON API for service-to-service communication? — [answer](networking.md#grpc-and-protobuf) {J1, J2, J3, M1, M2, M3, S1, S2}
- What are the four RPC types in gRPC, and when does streaming actually earn its complexity over unary? — [answer](networking.md#grpc-unary-vs-streaming-rpcs) {J1, J2, J3, M1, M2, M3, S1, S2}
- How does a deadline set by a gRPC client propagate through a chain of service calls? — [answer](networking.md#grpc-deadlines-and-cancellation-propagation) {J1, J2, J3, M1, M2, M3, S1, S2}

## Engineering Practices

### Architecture & Design

- Go has no classes or inheritance — how do the SOLID principles even apply, and which ones matter most in idiomatic Go? — [answer](engineering.md#solid-principles-without-classes) {J1, J2, J3, M1, M2, M3, S1, S2}
- Which classic Gang-of-Four design patterns actually show up in idiomatic Go, and which ones does Go make unnecessary? — [answer](engineering.md#design-patterns-that-fit-idiomatic-go) {J1, J2, J3, M1, M2, M3, S1, S2}
- How do you apply DDD concepts like bounded contexts and aggregates in a Go codebase? — [answer](engineering.md#domain-driven-design-in-a-go-service) {J1, J2, J3, M1, M2, M3, S1, S2}
- What is event sourcing, and what does it cost you compared to storing current state directly? — [answer](engineering.md#event-sourcing) {J1, J2, J3, M1, M2, M3, S1, S2}
- What's the honest trade-off between a microservices architecture and a well-structured monolith? — [answer](engineering.md#microservices-vs-monolith-trade-offs) {J1, J2, J3, M1, M2, M3, S1, S2}
- Go isn't a functional language — how far do FP idioms actually go here, and where do they stop making sense? — [answer](engineering.md#functional-programming-idioms-in-go) {J1, J2, J3, M1, M2, M3, S1, S2}
- Why does Big-O complexity actually come up in a Go interview outside of algorithm puzzles? — [answer](engineering.md#big-o-in-a-go-interview-beyond-leetcode) {J1, J2, J3, M1, M2, M3, S1, S2}

### Process & Delivery

- What does a senior Go engineer actually look for in a PR review that a linter won't catch? — [answer](engineering.md#code-review-as-a-go-engineer) {J2, J3, M1, M2, M3, S1, S2}
- What are Go-specific code smells, distinct from the generic 'long function' complaints? — [answer](engineering.md#code-smells-and-refactoring-in-go) {J2, J3, M1, M2, M3, S1, S2}
- Rebase vs merge — what's the actual trade-off, and where does Gitflow fit for a Go service's release process? — [answer](engineering.md#git-workflows-rebase-vs-merge-gitflow) {J1, J2, J3, M1, M2, M3, S1, S2}
- Walk through what a solid CI/CD pipeline for a Go service actually checks, stage by stage. — [answer](engineering.md#cicd-pipeline-for-a-go-service) {J2, J3, M1, M2, M3, S1, S2}
- How do you give a realistic estimate for a Go feature, and what does a senior engineer do differently from a junior one here? — [answer](engineering.md#estimation-and-agile-practices) {J2, J3, M1, M2, M3, S1, S2}

### Observability

- Why does production Go code avoid fmt.Println/log.Println, and what does structured logging actually buy you? — [answer](engineering.md#structured-logging-in-go) {J2, J3, M1, M2, M3, S1, S2}
- How do you actually trace one user request as it flows through five Go microservices? — [answer](engineering.md#distributed-tracing-across-services) {J2, J3, M1, M2, M3, S1, S2}
- What are the core Prometheus metric types, and how do you instrument a Go HTTP handler with them? — [answer](engineering.md#metrics-and-prometheus-instrumentation) {J2, J3, M1, M2, M3, S1, S2}

### Infrastructure

- Why does Go's compilation model make Docker images unusually simple compared to a Node or Python service? — [answer](engineering.md#docker-and-gos-static-binary-advantage) {J1, J2, J3, M1, M2, M3, S1, S2}
- What's the actual difference between Docker (containers) and a VM, and why does it matter for a Go service's deploy story? — [answer](engineering.md#os-level-vs-hardware-virtualization) {J2, J3, M1, M2, M3, S1, S2}
- How does an OS thread differ from a goroutine, and why does that distinction matter when reasoning about a Go service's resource usage? — [answer](engineering.md#os-processes-threads-and-gos-scheduling-model) {J2, J3, M1, M2, M3, S1, S2}
- What are the core Kubernetes objects a Go service actually needs, and what does each one own? — [answer](engineering.md#kubernetes-basics-for-a-go-service) {J3, M1, M2, M3, S1, S2}
- What's the difference between a readiness and a liveness probe, and how should a Go service handle SIGTERM? — [answer](engineering.md#readinessliveness-probes-and-graceful-shutdown) {J3, M1, M2, M3, S1, S2}
- Which twelve-factor app principles actually matter most for how you'd structure a production Go service? — [answer](engineering.md#twelve-factor-principles-in-a-go-microservice) {J2, J3, M1, M2, M3, S1, S2}
