# Go — web frameworks and service composition

### Gin
**They ask:** "How does Gin differ from raw `net/http`, and where does its performance claim actually come from?"

Gin adds a router, middleware chaining, and request/response helpers (JSON binding, validation, param parsing) on top of `net/http`'s `Handler` interface — it doesn't replace the standard library's server, it wraps it. The performance claim comes from its router: `httprouter`-style radix-tree matching resolves a path to a handler without the linear route-scanning or heavy regex some frameworks use.

```go
r := gin.Default()
r.GET("/users/:id", func(c *gin.Context) {
    id := c.Param("id")
    c.JSON(http.StatusOK, gin.H{"id": id})
})
r.Run(":8080")
```

The trade-off senior engineers weigh: Gin's `gin.Context` is a framework-specific abstraction, not `context.Context` (though it embeds one) — code written against it is coupled to Gin in a way plain `net/http` handlers aren't.

**Say it:** "Gin is `net/http` plus a radix-tree router and middleware ergonomics — the speed comes from route matching, not from replacing the server; the cost is coupling handler code to `gin.Context` instead of the standard `http.Handler`."
**Red flag:** Claiming Gin makes the HTTP server itself faster. It's still `net/http` underneath — the win is routing and developer ergonomics, not the transport layer.

### Echo
**They ask:** "How does Echo compare to Gin, and when would you pick one over the other?"

Both are thin, high-performance routers with middleware chains over `net/http`, and in practice the choice is closer to team convention than technical necessity — they solve the same problem with similar radix-tree routing. Echo tends to be praised for cleaner middleware composition and built-in support for things like automatic TLS and HTTP/2, while Gin has a larger ecosystem and more Stack Overflow mass.

```go
e := echo.New()
e.GET("/users/:id", func(c echo.Context) error {
    return c.JSON(http.StatusOK, map[string]string{"id": c.Param("id")})
})
e.Start(":8080")
```

The senior answer isn't "Echo is better" — it's naming the actual differentiators (error-handling model, middleware ergonomics, ecosystem size) and admitting most teams pick based on existing familiarity, not a benchmark.

**Say it:** "Gin and Echo solve the same problem with similar router internals — I pick based on the team's existing familiarity and the middleware ecosystem I need, not a performance difference that rarely matters at that layer."
**Red flag:** Justifying a framework choice purely on a microbenchmark. At the router layer the difference is noise next to your actual handler's DB/network latency.

### Go-kit
**They ask:** "What problem does Go-kit solve that Gin/Echo don't, and why has its popularity declined?"

Go-kit is a toolkit for building microservices with explicit separation of transport (HTTP/gRPC), endpoint (business logic wrapped as a uniform function type), and service (the actual domain logic) — it standardizes cross-cutting concerns like logging, tracing, and rate limiting as composable middleware around that endpoint layer, not the HTTP layer. Gin/Echo only address the HTTP transport; Go-kit addresses the whole service architecture.

```go
type Endpoint func(ctx context.Context, request interface{}) (response interface{}, err error)
```

The decline is mostly about ergonomics: that three-layer separation and heavy use of `interface{}` (pre-generics) produced a lot of boilerplate for a small service, and many teams found they got 80% of the value with plain layered Go and less ceremony.

**Say it:** "Go-kit standardizes the service layer itself — transport/endpoint/service separation with middleware around business logic, not just HTTP — but the boilerplate cost is real, and most teams now get similar structure with plainer, hand-rolled layering."
**Red flag:** Reaching for Go-kit on a small service "for structure." Its value shows up at genuine microservice scale with many cross-cutting concerns — on a small service it's mostly ceremony.

### Beego
**They ask:** "What kind of framework is Beego, and why is it less common in new Go services today?"

Beego is a full-stack MVC framework — ORM, session management, routing, and a CLI code generator bundled together, closer to Rails or Django's philosophy than Gin's minimalism. That's exactly why it's fallen out of favor in idiomatic Go circles: Go's ecosystem culture favors small, composable packages (a router, a separate SQL library, a separate validator) over an opinionated batteries-included framework, and Beego's monolithic design fights that.

The honest trade-off: a full-stack framework gets a small team shipping faster on day one, at the cost of being locked into its ORM and conventions when you outgrow them.

**Say it:** "Beego is a batteries-included MVC framework in a Rails-like style, which is out of step with Go's compose-small-packages culture — it can get a small team moving fast but locks you into its ORM and conventions as you scale."
**Red flag:** Recommending Beego for a new microservice without naming the trade-off. Its lock-in is the real cost; not mentioning it reads as unfamiliarity with why the ecosystem moved away from it.

### framework vs plain net/http
**They ask:** "When would a senior engineer choose plain `net/http` over any framework?"

The stdlib's `net/http` got dramatically better routing in Go 1.22 (method + wildcard patterns in `ServeMux`), which closed most of the gap that used to justify a third-party router. The remaining case for a framework is ergonomics at scale: request binding/validation helpers, a large middleware ecosystem, and team familiarity — not raw capability.

```go
mux := http.NewServeMux()
mux.HandleFunc("GET /users/{id}", func(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    json.NewEncoder(w).Encode(map[string]string{"id": id})
})
```

A senior default: start with stdlib for a small service or library where you don't want a framework dependency baked into every handler signature; reach for Gin/Echo when the team needs the ergonomics and you're building enough endpoints that the boilerplate savings compound.

**Say it:** "Since Go 1.22's `ServeMux` got real pattern matching, stdlib covers most routing needs — I reach for a framework for validation/binding ergonomics and middleware ecosystem at scale, not because stdlib can't route."
**Red flag:** Saying "you always need a framework for a real HTTP API in Go." Plenty of production Go services run on `net/http` alone; the framework buys convenience, not new capability.

### middleware chaining pattern
**They ask:** "How is middleware implemented in Go, and why does the pattern work the same way across `net/http`, Gin, and Echo?"

Middleware in Go is a higher-order function: it takes a handler and returns a new handler that wraps it, so you can compose cross-cutting concerns (logging, auth, recovery, CORS) around a handler without the handler itself knowing about them. This works because `http.Handler` is just an interface with one method — any function matching that shape composes.

```go
func Logging(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}
mux.Handle("/users", Logging(AuthRequired(usersHandler)))
```

Ordering matters: middleware wraps outside-in, so the first one applied runs first on the way in and last on the way out — auth should usually sit closer to the handler than logging, so you log every request including rejected ones.

**Say it:** "Middleware is a `func(Handler) Handler` closure — composable because `http.Handler` is a one-method interface — and the wrap order decides execution order, so I put logging outside auth to capture rejected requests too."
**Red flag:** Putting auth middleware outside logging and then wondering why unauthorized requests never show up in logs. Wrap order is execution order — get it backwards and you lose visibility into exactly the requests you most want to see.

### dependency injection in Go
**They ask:** "Go has no DI container/framework by default — how do senior Go codebases actually wire dependencies?"

Go favors *explicit constructor injection* over a reflection-based container: a service's dependencies are just fields set via a constructor function, and interfaces at the boundary let you swap real implementations for fakes in tests. This is deliberate — Go's culture distrusts magic; a `NewService(repo Repo, logger Logger) *Service` call is greppable and type-checked, where a container's dependency graph is often only discoverable at runtime.

```go
type Service struct {
    repo   Repo
    logger Logger
}
func NewService(repo Repo, logger Logger) *Service {
    return &Service{repo: repo, logger: logger}
}
```

For larger graphs, `google/wire` generates that same constructor-chaining code at compile time (no runtime reflection) rather than replacing the pattern — it just automates the wiring boilerplate once the graph gets big.

**Say it:** "Go DI is plain constructor injection against interfaces — no runtime container — and when the dependency graph gets large I reach for `wire`, which code-generates the same constructor chain at compile time instead of resolving it via reflection."
**Red flag:** Building or adopting a reflection-based DI container for a small Go service. It buys you the exact magic Go's ecosystem tries to avoid, for a wiring problem constructor functions already solve cleanly.
