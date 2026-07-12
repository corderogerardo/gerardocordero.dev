# Go — engineering practices, architecture, and infrastructure

### SOLID principles without classes
**They ask:** "Go has no classes or inheritance — how do the SOLID principles even apply, and which ones matter most in idiomatic Go?"

SOLID was formulated for class hierarchies, but the principles are really about *dependency direction and change isolation*, which Go achieves through small interfaces and composition instead of inheritance. **Single Responsibility** and **Interface Segregation** map cleanly: Go's convention of tiny, single-method interfaces (`io.Reader`, `io.Writer`) is ISP taken to its logical extreme. **Dependency Inversion** is exactly what implicit interface satisfaction gives you for free — a package defines the interface it needs, and callers satisfy it without importing or depending on the concrete type.

```go
// DIP: the consumer defines the interface it needs, not the producer
type UserFetcher interface {
    GetUser(ctx context.Context, id string) (*User, error)
}
func NewHandler(f UserFetcher) *Handler { return &Handler{fetcher: f} }
```

**Open/Closed** and **Liskov Substitution** are the ones that translate least directly — there's no subclassing to keep "closed for modification," so OCP shows up more as "add a new type that satisfies the interface" than "extend a base class."

**Say it:** "SOLID isn't about classes, it's about dependency direction — Go gets Dependency Inversion for free from implicit interface satisfaction, and its culture of tiny single-method interfaces is Interface Segregation by default; Open/Closed and Liskov translate the least directly since there's no inheritance."
**Red flag:** Building a deep interface hierarchy or an abstract base struct to "apply SOLID" in Go. That imports an OOP pattern the language and its idioms actively push against — small interfaces and composition are the Go-native equivalent.

### design patterns that fit idiomatic Go
**They ask:** "Which classic Gang-of-Four design patterns actually show up in idiomatic Go, and which ones Go makes unnecessary?"

Several patterns exist specifically to work around limitations Go doesn't have. The **Strategy** pattern is just passing a function value or a small interface — Go doesn't need a `StrategyInterface` + concrete strategy classes when `func(a, b int) int` does the job. **Singleton** is usually just a package-level variable initialized once (or `sync.Once` if lazy init matters) — no private-constructor ceremony needed. Patterns that *do* show up naturally: **Decorator** as middleware (`func(Handler) Handler`), **Functional Options** for configuring constructors with optional parameters, and **Builder** in the rare case a struct genuinely needs staged construction.

```go
// Functional Options — Go's idiomatic answer to "too many constructor params"
func NewServer(opts ...Option) *Server {
    s := &Server{timeout: 30 * time.Second} // defaults
    for _, opt := range opts {
        opt(s)
    }
    return s
}
type Option func(*Server)
func WithTimeout(d time.Duration) Option { return func(s *Server) { s.timeout = d } }
```

**Say it:** "Most GoF patterns exist to route around missing first-class functions or optional constructor params — Go has both, so Strategy is a function value and Singleton is a package variable; the pattern that's genuinely idiomatic here is Functional Options for configurable constructors."
**Red flag:** Porting a Java-style pattern implementation (an interface plus a factory plus concrete classes) verbatim into Go for something a function value would solve in three lines. That's importing ceremony the language doesn't need.

### Domain-Driven Design in a Go service
**They ask:** "How do you apply DDD concepts like bounded contexts and aggregates in a Go codebase?"

A **bounded context** is a boundary around a model where terms mean one specific thing — "Order" in the fulfillment service and "Order" in the billing service can have different shapes and lifecycles, and DDD's point is to stop pretending they're the same entity just because they share a name. In Go this usually maps to service or package boundaries: each bounded context gets its own package (or its own service), its own types, and translates at the edge when talking to another context, rather than sharing one giant `Order` struct across the whole system.

An **aggregate** is a cluster of objects treated as one consistency boundary — you only ever load, modify, and save it as a whole, and only through its root, which is what keeps its invariants enforced in one place instead of scattered across callers.

```go
// Order is the aggregate root — invariants enforced through its methods, not by callers mutating fields directly
type Order struct {
    id     string
    items  []LineItem
    status Status
}
func (o *Order) AddItem(item LineItem) error {
    if o.status != StatusDraft {
        return errors.New("cannot modify a confirmed order")
    }
    o.items = append(o.items, item)
    return nil
}
```

**Say it:** "Bounded contexts stop the same word meaning different things across a codebase — I map them to package or service boundaries and translate at the edges; aggregates enforce invariants by only exposing mutation through the root, not by letting callers poke at fields directly."
**Red flag:** One shared `Order` struct with every field every service might ever need, imported everywhere. That's the exact problem bounded contexts exist to prevent — it silently couples every consumer to every other consumer's changes.

### event sourcing
**They ask:** "What is event sourcing, and what does it cost you compared to storing current state directly?"

Instead of persisting an entity's current state (a row you update in place), event sourcing persists the full sequence of events that produced it — "OrderCreated," "ItemAdded," "OrderConfirmed" — and current state is derived by replaying those events. The payoff: a complete audit trail for free, the ability to answer "what did this look like at any point in time," and easy support for adding new read models later by replaying history through a new projection.

```go
type OrderEvent interface{ isOrderEvent() }
type OrderCreated struct{ ID string }
type ItemAdded struct{ Item LineItem }

func Rebuild(events []OrderEvent) *Order {
    o := &Order{}
    for _, e := range events {
        o.apply(e) // fold each event into current state
    }
    return o
}
```

The cost is real: querying "current state" now requires replaying (or maintaining a separately updated snapshot/projection), the event schema becomes a long-term contract you can rarely change without versioning, and it's meaningfully more complex to build and operate than a CRUD table.

**Say it:** "Event sourcing trades simple current-state storage for a full replayable history — free audit trail and time-travel queries — at the cost of needing projections for fast reads and treating your event schema as a long-lived contract; I reach for it when audit history is a real requirement, not by default."
**Red flag:** Adopting event sourcing for a standard CRUD resource with no audit or replay requirement. The operational complexity (projections, event versioning, eventual consistency between write and read models) isn't free — it needs a real justification.

### microservices vs monolith trade-offs
**They ask:** "What's the honest trade-off between a microservices architecture and a well-structured monolith?"

Microservices buy independent deployability, independent scaling, and fault isolation (one service crashing doesn't take down the whole system) — but every one of those wins is paid for with distributed-systems complexity that doesn't exist in a monolith: network calls replace function calls (with all their new failure modes), data consistency across services requires sagas instead of a local transaction, and you need real observability (distributed tracing, centralized logging) just to debug a single user request that touches five services.

The senior framing: microservices solve *organizational* scaling (many teams shipping independently without stepping on each other) as much as technical scaling — a well-modularized monolith with clean internal package boundaries often gets you most of the technical benefits (testability, separation of concerns) without the operational cost, until team size or independent-scaling needs actually demand the split.

**Say it:** "Microservices mainly buy independent deployability and organizational scaling for many teams — the technical cost is real distributed-systems complexity, so I default to a well-modularized monolith and split out a service only when a specific scaling or team-ownership boundary actually demands it."
**Red flag:** Proposing microservices for a small team building a new product. That's paying the full operational tax of distributed systems before you've even validated the domain boundaries you'd be splitting along.

### functional programming idioms in Go
**They ask:** "Go isn't a functional language — how far do FP idioms actually go here, and where do they stop making sense?"

Go supports the FP building blocks that matter most in practice: first-class functions, closures, and higher-order functions (`map`/`filter`/`reduce`-shaped helpers built on generics since 1.18). What it deliberately lacks is enforced immutability and pattern matching — you can *write* code in an immutable style (return new values instead of mutating), but nothing in the language stops a function from mutating its inputs, so discipline is a convention, not a guarantee.

```go
func Map[T, U any](s []T, f func(T) U) []U {
    out := make([]U, len(s))
    for i, v := range s { out[i] = f(v) }
    return out
}
doubled := Map(nums, func(n int) int { return n * 2 })
```

**Say it:** "Go gives me first-class functions, closures, and generic map/filter/reduce helpers, which covers most of what I actually reach for from FP — what it doesn't give me is enforced immutability or pattern matching, so 'functional style' in Go is a convention I choose, not a guarantee the compiler enforces."
**Red flag:** Overusing generic functional helper chains (`Map(Filter(Reduce(...)))`) where a plain `for` loop reads more clearly to a Go-idiomatic reviewer. Go's culture favors explicit loops for anything beyond a simple transform — legibility beats cleverness.

### Big-O in a Go interview, beyond leetcode
**They ask:** "Why does Big-O complexity actually come up in a Go interview outside of algorithm puzzles?"

Complexity analysis shows up when reasoning about Go's own data structure internals, not just abstract algorithms: knowing that `append` is amortized O(1) but a single call can be O(n) when capacity is exhausted explains why preallocating with `make([]T, 0, n)` matters in a hot loop; knowing map access is O(1) average but the map has real per-key overhead explains why a slice sometimes beats a map for small, known-size collections; knowing `string` concatenation with `+` in a loop is O(n²) total (each `+` copies) is exactly why `strings.Builder` exists.

```go
// O(n²) total across the loop — each += reallocates and copies
var s string
for _, w := range words { s += w }

// O(n) total — Builder grows its internal buffer amortized
var b strings.Builder
for _, w := range words { b.WriteString(w) }
```

**Say it:** "Big-O in Go interviews is less about whiteboard algorithms and more about knowing the amortized cost of `append`, why `strings.Builder` beats repeated `+=` concatenation, and when a small slice beats a map's per-key overhead — the complexity story behind the stdlib's own choices."
**Red flag:** Reciting Big-O definitions with no connection to a real Go data structure decision. The interview signal is applying it to `append`/map/string-building trade-offs, not textbook recall.

### code review as a Go engineer
**They ask:** "What does a senior Go engineer actually look for in a PR review that a linter won't catch?"

Linters and `go vet` catch syntax-level and mechanical issues; a senior reviewer looks one level up: does the error handling actually add context at each layer (`fmt.Errorf("fetching user: %w", err)`) or just `return err` blindly losing the call-site information; are goroutines spawned with a clear owner and a way to know when they're done (no fire-and-forget goroutines with unhandled panics); is the concurrency actually necessary, or does a simple sequential version read more clearly for the same performance; do exported names and doc comments actually explain *why*, not just restate the signature.

The other senior habit: reviewing for the person, not just the diff — leaving comments that explain the *reasoning* behind a suggested change so the author learns the principle, not just fixes the one line.

**Say it:** "Beyond what the linter catches, I'm reading for whether errors carry context at each layer, whether every spawned goroutine has a clear lifecycle and owner, and whether concurrency in this diff is actually earning its complexity over a simpler sequential version."
**Red flag:** A review that only flags style nits a formatter would catch (`gofmt`, import ordering) and misses a goroutine leak or a swallowed error. That's reviewing the diff's surface, not its correctness.

### code smells and refactoring in Go
**They ask:** "What are Go-specific code smells, distinct from the generic 'long function' complaints?"

Some smells are universal (long functions, deep nesting, duplicated logic), but Go has its own recognizable ones: an interface defined by the *producer* with many methods (Go convention is small interfaces defined by the *consumer*, "accept interfaces, return structs"); a function returning `(T, error)` where the error is checked but then ignored or logged-and-swallowed instead of propagated; goroutines spawned without a clear way to wait for or cancel them; a giant `switch` on a type where a real interface dispatch would be clearer; and package-level mutable global state making tests order-dependent.

```go
// smell: producer-defined fat interface forcing every implementer to satisfy methods they may not need
type Storage interface {
    Get(id string) (T, error)
    Set(id string, v T) error
    Delete(id string) error
    List() ([]T, error)
    Backup() error
    Restore() error
}
// fix: split into what each consumer actually needs, e.g. a read-only Getter
```

**Say it:** "The Go-specific smells I look for are producer-defined fat interfaces instead of consumer-defined small ones, swallowed errors that get logged instead of propagated, and untracked goroutines with no owner or cancellation path — those are the ones generic style guides miss."
**Red flag:** Defining every interface at the implementation site with every method the concrete type happens to have. That's the opposite of "accept interfaces, return structs" — it forces every consumer to depend on the full surface even when they use one method.

### Git workflows: rebase vs merge, Gitflow
**They ask:** "Rebase vs merge — what's the actual trade-off, and where does Gitflow fit for a Go service's release process?"

`merge` preserves true history (a merge commit records that two lines of work joined, with both parent commits intact) but the resulting log gets noisy with merge commits and non-linear branches. `rebase` rewrites your branch's commits onto a new base, producing a clean linear history — the cost is it rewrites commit hashes, which is destructive on any branch someone else has already pulled (never rebase a shared/public branch).

**Gitflow** (long-lived `develop` + `main`, feature branches, release branches, hotfix branches) suits products with scheduled, versioned releases where you need to stabilize a release branch while `develop` keeps moving. For a continuously-deployed Go service shipping on every merge to `main`, Gitflow's ceremony is usually overkill — trunk-based development (short-lived feature branches merged frequently into `main`, feature flags for anything not ready) fits the deploy cadence better.

**Say it:** "I rebase local feature branches to keep history linear before merging, but never rebase anything already pushed and shared — and I reach for Gitflow only when there's a real versioned-release cadence to justify it; a continuously deployed service is usually better served by trunk-based development."
**Red flag:** Rebasing a branch other collaborators have already pulled from. That rewrites shared history and breaks everyone else's local branch — force-pushing over it compounds the damage.

### CI/CD pipeline for a Go service
**They ask:** "Walk through what a solid CI/CD pipeline for a Go service actually checks, stage by stage."

The pipeline should fail fast on the cheapest checks first, so a broken build doesn't waste minutes on slow stages: (1) **build** — does it even compile, catching the cheapest class of error immediately; (2) **lint/vet** — `go vet` plus `golangci-lint` catch suspicious patterns before tests even run; (3) **unit tests** — fast, no external dependencies, the bulk of the signal; (4) **integration tests** — gated behind a build tag, spinning up real dependencies (often via testcontainers), slower and run less frequently; (5) **security scan** — dependency vulnerability scanning (`govulncheck`), secret scanning; (6) **build + push the artifact** — a container image, tagged with the commit SHA for traceability; (7) **deploy** — usually to a staging environment automatically, production behind a manual gate or a canary rollout.

```yaml
# conceptual stage order in CI
build → vet/lint → unit test → integration test → security scan → image build → deploy
```

**Say it:** "I order pipeline stages cheapest-and-fastest first — build, then lint, then unit tests — so a broken PR fails in seconds, not after a ten-minute integration suite; security scanning and the deploy gate come last, closest to the artifact that actually ships."
**Red flag:** Running the full integration and security-scan suite before a basic `go build` and `go vet` pass. That wastes CI minutes on every trivial typo instead of failing at the cheapest possible stage.

### structured logging in Go
**They ask:** "Why does production Go code avoid `fmt.Println`/`log.Println`, and what does structured logging actually buy you?"

Plain-text logs are fine to read in a terminal but nearly useless at scale — grepping free-form strings across millions of log lines from dozens of service instances doesn't scale, and you can't reliably filter or aggregate on "which user ID" or "which request" without regex gymnastics. Structured logging emits each log line as a set of key-value fields (usually JSON), so a log aggregation system (or a `WHERE` clause) can filter and group on them directly.

```go
logger.Info("order created",
    slog.String("order_id", order.ID),
    slog.Int("item_count", len(order.Items)),
    slog.Duration("elapsed", time.Since(start)),
)
// {"level":"info","msg":"order created","order_id":"o_123","item_count":3,"elapsed_ms":42}
```

Go 1.21 shipped `log/slog` in the standard library specifically to give structured logging a common interface without requiring a third-party dependency like `zap` or `zerolog` (both still popular for their performance under very high log volume).

**Say it:** "Structured logging emits key-value fields instead of a free-form string, so a log aggregator can filter and group on `order_id` or `user_id` directly — I default to `slog` since it's now the stdlib answer, and reach for `zap`/`zerolog` specifically when allocation overhead at very high log volume matters."
**Red flag:** Logging an interpolated string with the interesting data baked into free text (`log.Printf("order %s created for user %s", oid, uid)`). That's unqueryable at scale — the same information as two structured fields costs nothing extra to emit correctly.

### distributed tracing across services
**They ask:** "How do you actually trace one user request as it flows through five Go microservices?"

A single trace is stitched together from **spans** — each service's unit of work gets its own span, tagged with a shared trace ID and a reference to its parent span, forming a tree that reconstructs the full call path with per-hop timing. The trace ID has to be generated once, at the edge (the first service that receives the request), and propagated on every outbound call — in HTTP via a header (`traceparent`, the W3C Trace Context standard), in gRPC via metadata — so every downstream span attaches to the same trace instead of starting a disconnected one.

```go
ctx, span := tracer.Start(ctx, "OrderService.CreateOrder")
defer span.End()
// any outbound HTTP/gRPC call using this ctx propagates the trace automatically
```

OpenTelemetry is the vendor-neutral standard for this instrumentation in Go — it defines the API and SDK, and you point the exporter at whatever backend (Jaeger, Tempo, a vendor) actually visualizes the traces.

**Say it:** "Tracing works because every service propagates the same trace ID and parents its span to the caller's — OpenTelemetry is the vendor-neutral way to instrument that in Go, and the moment any service generates a fresh trace ID instead of propagating the inbound one, the trace fragments."
**Red flag:** Instrumenting tracing per-service without confirming the trace context actually propagates across the network hop. A beautifully instrumented service that doesn't read the inbound `traceparent` header just produces disconnected single-service traces, not a real distributed trace.

### metrics and Prometheus instrumentation
**They ask:** "What are the core Prometheus metric types, and how do you instrument a Go HTTP handler with them?"

Prometheus's model is pull-based: your service exposes a `/metrics` endpoint, and Prometheus scrapes it periodically — the four metric types cover nearly everything you'd want to track. **Counter** only goes up (total requests, total errors) — useful for rate-of-change queries. **Gauge** goes up or down (current in-flight requests, queue depth). **Histogram** buckets observed values (request latency) so you can compute percentiles server-side at query time. **Summary** is similar to histogram but computes quantiles client-side — less flexible for aggregation across instances, which is why histograms are usually preferred.

```go
var requestDuration = prometheus.NewHistogramVec(
    prometheus.HistogramOpts{Name: "http_request_duration_seconds"},
    []string{"method", "path", "status"},
)
// in the handler, wrapped as middleware:
timer := prometheus.NewTimer(requestDuration.WithLabelValues(r.Method, r.URL.Path, status))
defer timer.ObserveDuration()
```

**Say it:** "I reach for a Counter for anything monotonically increasing, a Gauge for current state like in-flight requests, and a Histogram over a Summary for latency, since histogram buckets aggregate correctly across multiple instances at query time and a client-computed Summary quantile doesn't."
**Red flag:** Using a Gauge to track total requests served. That's a Counter's job — a Gauge implies the value can legitimately go down, which total-request-count never does.

### estimation and Agile practices
**They ask:** "How do you give a realistic estimate for a Go feature, and what does a senior engineer do differently from a junior one here?"

The junior mistake is estimating the *happy path* — the time to write the code that works when nothing goes wrong — and skipping the time that actually dominates real features: error handling, edge cases, tests, code review cycles, and integration with existing systems that don't behave exactly like the ticket assumed. A senior estimate names the unknowns explicitly ("I don't know yet how the legacy billing service handles partial refunds — that's the risk in this number") rather than presenting a false-precision single number.

Story points (relative sizing against past work) exist specifically to sidestep the trap of estimating in hours, which anchors everyone on a false sense of precision that individual variance and unknowns immediately break.

**Say it:** "I estimate the whole feature, not the happy path — tests, error handling, review cycles, and integration surprises are usually most of the actual time — and I name the specific unknowns driving my uncertainty instead of presenting a single number as if it were precise."
**Red flag:** An estimate with no stated assumptions or risk factors. A number with no named unknowns isn't more confident, it's just hiding where it's likely to be wrong.

### Docker and Go's static binary advantage
**They ask:** "Why does Go's compilation model make Docker images unusually simple compared to, say, a Node or Python service?"

Go compiles to a single static binary with no runtime dependency on an interpreter or a language-specific package manager present at container runtime — that means the final image can be built `FROM scratch` or a minimal `distroless` base, containing nothing but the binary and CA certificates, instead of shipping an entire language runtime and its dependency tree.

```dockerfile
FROM golang:1.23 AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /app ./cmd/server

FROM gcr.io/distroless/static
COPY --from=build /app /app
ENTRYPOINT ["/app"]
```

The multi-stage build pattern above is what makes this practical: the first stage has the full Go toolchain to compile, and the second stage discards everything except the compiled binary — final images routinely land under 20MB, versus hundreds of MB for a typical interpreted-language image.

**Say it:** "A statically compiled Go binary needs no runtime in the container, so a multi-stage Docker build can ship `distroless` or `scratch` with just the binary and certs — smaller attack surface and faster pulls than an image carrying an entire language runtime."
**Red flag:** Shipping a Go service in a full `golang:1.23` base image in production. That ships the entire compiler toolchain in your runtime image for no benefit — multi-stage builds exist exactly to avoid this.

### OS-level vs hardware virtualization
**They ask:** "What's the actual difference between Docker (containers) and a VM, and why does it matter for a Go service's deploy story?"

A VM virtualizes hardware — each VM runs its own full OS kernel on top of a hypervisor, which is heavyweight (minutes to boot, gigabytes of overhead per instance) but gives strong isolation, including the ability to run a different OS than the host. A container shares the host's kernel and isolates at the process level using kernel features (namespaces for isolation, cgroups for resource limits) — much lighter (starts in milliseconds, overhead in megabytes) but isolation is weaker since a kernel-level vulnerability can potentially cross container boundaries in a way it can't cross VM boundaries.

For a Go service specifically, this pairs naturally with the static-binary point: since Go needs no runtime, a container's minimal isolation is usually sufficient and the fast startup matters for scaling up replicas quickly under load — you don't need a VM's stronger isolation or OS flexibility for a stateless Go binary.

**Say it:** "Containers share the host kernel and isolate via namespaces/cgroups — lightweight and fast to start; VMs virtualize hardware with a full separate kernel — heavier but stronger isolation. A stateless Go service's fast-scaling needs usually favor containers; VM-level isolation matters more for genuinely untrusted or multi-tenant workloads."
**Red flag:** Treating container isolation as equivalent to VM isolation for security purposes. A container escape reaching the shared host kernel is a real threat model a VM boundary doesn't share.

### OS processes, threads, and Go's scheduling model
**They ask:** "How does an OS thread differ from a goroutine, and why does that distinction matter when reasoning about a Go service's resource usage?"

An OS process has its own memory space; OS threads within a process share memory but each carries real overhead — typically a megabyte-scale stack and kernel-level context-switch cost, which is why a thread-per-connection server tops out at a few thousand concurrent connections before the OS itself becomes the bottleneck. A goroutine is a much lighter unit the Go runtime schedules onto a smaller pool of OS threads (the "M" in Go's GMP model) — a few KB of growable stack, and context switches handled in userspace by the Go scheduler instead of the kernel, which is why tens of thousands of concurrent goroutines are routine.

The practical consequence: `GOMAXPROCS` controls how many OS threads actually run Go code in parallel (typically matched to CPU core count), while the number of goroutines can vastly exceed that — most goroutines are just waiting (blocked on I/O, a channel, a mutex) at any given moment, not actually running.

**Say it:** "OS threads are the kernel's expensive unit — megabyte stacks, kernel-managed context switches; goroutines are the Go runtime's cheap unit multiplexed onto a small pool of OS threads — that M:N model is exactly why a Go service can hold tens of thousands of concurrent connections that a thread-per-connection design couldn't."
**Red flag:** Conflating goroutine count with OS thread count when reasoning about CPU usage. `GOMAXPROCS` OS threads do the actual parallel work; thousands of goroutines mostly sitting blocked on I/O aren't consuming CPU just by existing.

### Kubernetes basics for a Go service
**They ask:** "What are the core Kubernetes objects a Go service actually needs, and what does each one own?"

A **Pod** is the smallest deployable unit — one or more containers sharing network/storage, usually just your Go binary's container plus maybe a sidecar. A **Deployment** manages a set of Pod replicas, handling rolling updates and self-healing (replacing a crashed Pod automatically) — you almost never create bare Pods directly. A **Service** gives that set of Pods a stable network identity and load-balances across whichever Pods are currently healthy, since Pod IPs change every time a Pod is recreated. A **ConfigMap**/**Secret** externalizes configuration and credentials so the container image itself stays environment-agnostic.

```yaml
# conceptual shape, not full YAML
Deployment: replicas: 3, template: { container: myapp:sha }
Service:    selector: app=myapp, port: 8080 → routes to healthy pods
```

**Say it:** "Deployment owns replica count and rollout strategy, Service gives those Pods a stable address since individual Pod IPs churn, and Pods themselves are disposable — I never expect a specific Pod to survive, which is exactly why the health-check story matters so much."
**Red flag:** Designing a service that assumes a specific Pod instance stays alive (in-memory state with no externalized store, hardcoded expectation of the same Pod handling a session). Kubernetes can and will kill and reschedule Pods — statelessness isn't optional, it's the deployment model's core assumption.

### readiness/liveness probes and graceful shutdown
**They ask:** "What's the difference between a readiness and a liveness probe, and how should a Go service handle SIGTERM?"

A **liveness probe** answers "is this process alive enough to keep running, or should Kubernetes kill and restart it" — it should only fail for genuinely unrecoverable states (deadlock, stuck event loop), because a failing liveness probe triggers a hard restart. A **readiness probe** answers "should traffic be routed to this Pod right now" — it can and should fail during startup (still loading a cache, connecting to the DB) or during graceful shutdown, without triggering a restart, just removing it from the load balancer's rotation temporarily.

Graceful shutdown matters because Kubernetes sends `SIGTERM`, waits a grace period, then `SIGKILL`s anything still running — a Go service must catch `SIGTERM`, stop accepting new requests, let in-flight requests finish, then exit cleanly within that window.

```go
srv := &http.Server{Addr: ":8080"}
go srv.ListenAndServe()

sigCh := make(chan os.Signal, 1)
signal.Notify(sigCh, syscall.SIGTERM)
<-sigCh
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()
srv.Shutdown(ctx) // stops taking new conns, waits for in-flight ones
```

**Say it:** "Liveness answers 'restart me or not,' readiness answers 'route traffic to me or not' — they should almost never be the same check, and on `SIGTERM` I call `Shutdown` with a bounded context so in-flight requests finish instead of getting cut off mid-response."
**Red flag:** Using the same endpoint for both readiness and liveness, or ignoring `SIGTERM` entirely and relying on `SIGKILL` to stop the process. The latter drops every in-flight request instead of letting them complete within the grace period.

### twelve-factor principles in a Go microservice
**They ask:** "Which twelve-factor app principles actually matter most for how you'd structure a production Go service?"

The ones that come up constantly in practice: **config via environment** — no hardcoded connection strings or feature flags baked into the binary, so the same built artifact runs identically across dev/staging/prod; **stateless processes** — no in-memory session state that assumes the same instance handles the next request, because load balancers and Kubernetes rescheduling make that assumption false; **disposability** — fast startup and graceful shutdown on `SIGTERM`, since instances are expected to be killed and replaced routinely, not nursed; **logs as event streams** — write to stdout/stderr and let the platform collect and route them, rather than managing log files inside the container yourself.

```go
port := os.Getenv("PORT")
dbURL := os.Getenv("DATABASE_URL") // config from environment, not a config file baked into the image
```

**Say it:** "The ones that actually bite in production are config-via-environment so the same artifact is truly portable across environments, and statelessness plus fast disposability, because Kubernetes will kill and reschedule your Pods routinely — a service that can't handle that isn't production-ready regardless of how correct its business logic is."
**Red flag:** A config file baked into the container image with per-environment values, requiring a rebuild to change an environment variable. That breaks the one-build-many-deploys guarantee that makes a CI/CD pipeline trustworthy.
