# Go — stdlib: context, errors, testing depth

### context.WithValue and request-scoped data
**They ask:** "What is `context.WithValue` for, and why do senior Go engineers discourage it?"

`context.Context` carries three things across API boundaries: cancellation, deadlines, and request-scoped values — but only the last one is controversial. `WithValue` lets you thread data through a call chain without changing every function signature, which is exactly why it's abused: it turns an explicit parameter into an implicit, untyped one that the compiler can't check.

The accepted use is narrow — cross-cutting request metadata that every layer might need but few layers actually use: a request ID, an auth principal, a trace span. It is not a substitute for passing real parameters or config.

```go
type ctxKey int
const userKey ctxKey = 0

ctx = context.WithValue(ctx, userKey, user)
u, ok := ctx.Value(userKey).(*User)
```

Always use an unexported custom type for the key (never a plain `string`) to avoid collisions across packages, and always check the type assertion.

**Say it:** "I reach for `context.WithValue` only for cross-cutting request metadata like trace IDs or the authenticated principal — anything the function actually depends on becomes a real parameter, so the compiler can catch mistakes."
**Red flag:** Passing business parameters (a user ID used for a query, a feature flag driving logic) through context. That's an untyped side channel that hides a function's real dependencies from its signature.

### context cancellation and deadlines
**They ask:** "What's the difference between `context.WithCancel`, `WithTimeout`, and `WithDeadline`, and why must you always call the returned cancel function?"

All three give you a `Context` that can be cancelled, differing only in *what* triggers it: `WithCancel` is triggered manually by calling the returned `cancel`, `WithTimeout` cancels after a duration elapses, `WithDeadline` cancels at a specific wall-clock time. Under the hood `WithTimeout` is just `WithDeadline(time.Now().Add(d))`.

```go
ctx, cancel := context.WithTimeout(parent, 2*time.Second)
defer cancel() // releases timer resources even if it completes early
```

The `cancel` function must be called even when the operation finishes normally — it's what stops the internal timer and lets the context (and anything referencing it) be garbage collected. Skipping `defer cancel()` leaks a timer goroutine until the deadline fires on its own.

**Say it:** "`WithTimeout`/`WithDeadline` are `WithCancel` plus a timer; I always `defer cancel()` immediately after creating any of them, because forgetting it leaks the internal timer until the deadline naturally expires."
**Red flag:** Not calling `cancel()` because "the timeout will fire eventually anyway." That's a resource leak in the meantime, and `go vet` (`lostcancel`) will flag it.

### passing context through API boundaries
**They ask:** "What are the rules for where `context.Context` should live in a function signature, and why?"

The convention exists so cancellation composes predictably across an entire call graph: `ctx` is always the first parameter, named `ctx`, never stored inside a struct. If it lived on a struct, every method call on that struct would implicitly share one context, making it impossible for two concurrent calls to have independent deadlines or cancellation.

```go
func (s *Service) GetUser(ctx context.Context, id string) (*User, error) {
    return s.repo.FindByID(ctx, id)
}
```

Every function that can block — a DB query, an HTTP call, a channel receive — should accept and propagate `ctx` so a cancelled parent unwinds the whole chain instead of leaving orphaned work running.

**Say it:** "`ctx` is always the first parameter, never a struct field, so each call gets its own cancellation scope instead of one shared context leaking across unrelated concurrent calls."
**Red flag:** Storing `ctx` on a struct "to avoid passing it everywhere." That silently couples unrelated calls to the same cancellation/deadline, which is exactly what the convention prevents.

### context for distributed tracing
**They ask:** "How does context carry a trace across service boundaries in a microservice call chain?"

A trace needs a stable identifier (and parent span ID) to follow one logical request across every service it touches, and `context.Context` is the natural carrier because it already flows through every layer of a Go call graph. Instrumentation libraries (OpenTelemetry) store the active span in the context via `WithValue` internally, and `context.Value` retrieval is how a downstream function finds "what request am I part of" without a global.

```go
ctx, span := tracer.Start(ctx, "GetUser")
defer span.End()
result, err := repo.FindByID(ctx, id) // trace context propagates automatically
```

Across a network hop, the trace ID isn't magic — it's serialized into an outgoing HTTP header (`traceparent`) or gRPC metadata, and the receiving service reconstructs a `Context` with that trace ID before continuing.

**Say it:** "Tracing rides on `context.Context` in-process, and crosses the wire as a propagated header like `traceparent` that the next service turns back into a span parented to the caller's."
**Red flag:** Generating a fresh trace ID at every service instead of propagating the inbound one. That breaks the trace into disconnected fragments and defeats the entire point of distributed tracing.

### errors.Is and sentinel error comparison
**They ask:** "What's the difference between comparing an error with `==` and using `errors.Is`, and why does it matter with wrapped errors?"

Direct `==` comparison only matches an *exact* error value — it breaks the moment that error gets wrapped by an intermediate layer adding context (which is normal and expected in a call chain). `errors.Is` walks the wrap chain via `Unwrap()`, checking each layer, so it finds a sentinel even three wraps deep.

```go
var ErrNotFound = errors.New("not found")

// deep in a call chain:
return fmt.Errorf("fetching user %d: %w", id, ErrNotFound)

// caller:
if errors.Is(err, ErrNotFound) { ... } // true even though err != ErrNotFound
if err == ErrNotFound { ... }          // false — the wrap broke identity
```

**Say it:** "`errors.Is` walks the `Unwrap` chain to find a sentinel, so it survives wrapping — plain `==` breaks the moment any layer adds context with `fmt.Errorf(\"...: %w\", err)`."
**Red flag:** Comparing wrapped errors with `==` and then "fixing" the bug by not wrapping errors at all — that throws away the call-chain context that makes error messages debuggable in production.

### errors.As and typed error extraction
**They ask:** "When do you use `errors.As` instead of `errors.Is`, and how do you write a custom error type that supports it?"

`errors.Is` answers "is this *this specific* error" (sentinel matching); `errors.As` answers "is there an error of *this type* anywhere in the chain, and if so, give it to me" — you use it when you need data out of the error, not just a yes/no. It also walks `Unwrap()`.

```go
type ValidationError struct {
    Field string
    Msg   string
}
func (e *ValidationError) Error() string { return e.Field + ": " + e.Msg }

var verr *ValidationError
if errors.As(err, &verr) {
    log.Printf("invalid field %s", verr.Field) // pulled the struct out of the chain
}
```

The target must be a pointer to a type implementing `error` (or an interface); `errors.As` assigns into it if a match is found anywhere in the chain.

**Say it:** "`errors.As` finds a typed error anywhere in the wrap chain and extracts it, so I can pull structured fields like `Field` out — I reach for it whenever the caller needs more than a yes/no."
**Red flag:** Type-asserting the top-level error directly (`err.(*ValidationError)`) instead of `errors.As`. That fails the moment the error is wrapped by even one layer up the stack.

### custom error types vs sentinel errors
**They ask:** "When do you define a sentinel error (`var Err... = errors.New(...)`) versus a custom error struct?"

Choose based on what the caller needs to *do* with the error. A sentinel is enough when the caller only needs to branch on "which known failure was this" — identity is all that matters. A custom struct earns its cost when the caller needs data: which field failed validation, what the retry-after duration is, what the underlying status code was.

```go
var ErrNotFound = errors.New("resource not found") // caller just branches

type RateLimitError struct{ RetryAfter time.Duration } // caller needs data
func (e *RateLimitError) Error() string { return fmt.Sprintf("rate limited, retry after %v", e.RetryAfter) }
```

Both should be checked with `errors.Is`/`errors.As` respectively, never `==` or a raw type assertion, so they survive wrapping.

**Say it:** "Sentinels are for identity-only branching; a custom error type earns its keep when the caller needs structured data out of the failure — I check the first with `errors.Is` and the second with `errors.As`."
**Red flag:** A custom error struct with no exported fields and no behavior beyond `Error() string`. That's a sentinel wearing a struct — simplify it.

### panic and recover semantics
**They ask:** "When is `panic`/`recover` the right tool in Go, given that Go's idiom is explicit error returns?"

Go deliberately keeps panic for *programmer errors and unrecoverable states* — a nil dereference, an out-of-bounds index, an invariant your code assumed but violated — not for expected failure modes like "file not found" or "network timeout," which are `error` returns. The reason for the split: errors are values you're expected to handle at every call site; panics are meant to unwind fast because continuing would be unsafe or meaningless.

`recover` only works when called directly inside a deferred function — calling it anywhere else, or in a deferred function that itself doesn't run during a panic, does nothing.

```go
func safeCall(f func()) (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("recovered: %v", r)
        }
    }()
    f()
    return nil
}
```

**Say it:** "Panic is for programmer errors and invariant violations that make continuing unsafe; expected failures are `error` returns — and `recover` only works when called directly inside a `defer`."
**Red flag:** Using panic/recover as control flow for expected errors ("panic if the user isn't found"). That hides normal failure paths behind a mechanism meant for unrecoverable bugs, and forces every caller up the stack to guess whether recovery is needed.

### panic/recover at service boundaries
**They ask:** "Where in a Go HTTP service should you install a `recover`, and why not scatter it everywhere?"

A single recovering middleware at the top of the HTTP handler chain is the idiomatic pattern: if any handler panics — a bug you didn't catch — the middleware recovers, logs the stack trace, and returns a 500 instead of crashing the whole process (and every other in-flight request on it). Scattering `recover` inside individual handlers or deep helper functions turns bugs into silent swallowed failures instead of surfacing them for a fix.

```go
func recoverMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                log.Printf("panic: %v\n%s", err, debug.Stack())
                w.WriteHeader(http.StatusInternalServerError)
            }
        }()
        next.ServeHTTP(w, r)
    })
}
```

Each goroutine needs its *own* recover if it can panic independently — a panic in a spawned goroutine that isn't recovered crashes the entire process, since it doesn't propagate to the parent's recover.

**Say it:** "I put one recover in top-level middleware so a handler bug returns a 500 instead of taking down the process — but any goroutine I spawn off the request needs its own recover, since a panic there can't be caught by the caller's defer."
**Red flag:** Assuming a `recover` in `main` protects goroutines spawned elsewhere. An unrecovered panic in any goroutine crashes the whole program regardless of what `main` does.

### TDD and BDD in Go
**They ask:** "How do TDD and BDD differ in practice, and what does BDD look like in a Go codebase?"

TDD is a *workflow* — red, green, refactor: write a failing test, make it pass minimally, then clean up — applied at the unit level with Go's standard `testing` package and table-driven tests. BDD is a *specification style* layered on top: it describes behavior from the user's perspective in Given/When/Then language so the test doubles as living documentation a non-engineer can read.

```go
// TDD: standard table-driven unit test
func TestDiscount(t *testing.T) {
    got := Discount(100, 0.1)
    if got != 90 { t.Errorf("got %v, want 90", got) }
}
```

```go
// BDD: Ginkgo + Gomega
var _ = Describe("Discount", func() {
    It("reduces price by the given rate", func() {
        Expect(Discount(100, 0.1)).To(Equal(90.0))
    })
})
```

**Say it:** "TDD is the red-green-refactor workflow; BDD is a Given/When/Then specification style on top of it — in Go that's plain `testing` for TDD and Ginkgo/Gomega when I want tests readable as living spec documentation."
**Red flag:** Treating Ginkgo as mandatory for "real" testing. Most Go teams get full TDD value from the standard `testing` package alone; BDD frameworks earn their weight when specs need to double as stakeholder-readable documentation.

### fakes vs mocks vs stubs
**They ask:** "What's the practical difference between a fake, a mock, and a stub in Go, and which does the language favor?"

The distinction is about *what the test double asserts*. A **stub** returns canned data and asserts nothing about how it was called. A **mock** additionally asserts the interaction itself — "was this method called exactly once with these arguments." A **fake** is a lightweight working implementation — an in-memory map standing in for a database — that behaves correctly, just not durably.

Go's implicit interfaces make hand-written fakes cheap and idiomatic, which is why the Go community leans toward fakes over mock-generation frameworks more than, say, Java does:

```go
type fakeRepo struct{ users map[string]User }
func (f *fakeRepo) FindByID(_ context.Context, id string) (User, error) {
    u, ok := f.users[id]
    if !ok { return User{}, ErrNotFound }
    return u, nil
}
```

`testify/mock` or generated mocks (`mockgen`) earn their place when you specifically need to assert call counts or argument-level interaction, not just return values.

**Say it:** "Stubs return canned data, mocks assert the interaction happened, fakes behave like a lightweight real implementation — Go's implicit interfaces make hand-written fakes cheap, so I reach for a mock only when I actually need to assert an interaction."
**Red flag:** Reaching for a heavyweight mocking framework by default. Go's structural typing makes a five-line fake struct often simpler and more readable than a generated mock with `.On(...)` expectations.

### integration testing in Go
**They ask:** "How do you structure integration tests in a Go project so they don't slow down every `go test` run?"

The goal is keeping the fast unit-test feedback loop fast while still having a real check against actual infrastructure (a real Postgres, a real Kafka) before merge. The idiomatic mechanism is a build tag that excludes integration tests from the default run, combined with `testcontainers-go` to spin up disposable, real dependencies in Docker for the tests that need them.

```go
//go:build integration

func TestUserRepo_Postgres(t *testing.T) {
    ctx := context.Background()
    container, _ := postgres.RunContainer(ctx, ...)
    defer container.Terminate(ctx)
    // ... run real queries against it
}
```

```bash
go test ./...                 # unit tests only
go test -tags=integration ./... # unit + integration
```

**Say it:** "I gate integration tests behind a build tag so `go test ./...` stays fast for everyday development, and use testcontainers to spin up real, disposable infrastructure for the CI stage that runs `-tags=integration`."
**Red flag:** Mocking the database in what's labeled an "integration test." If nothing real is exercised, it's a unit test wearing the wrong name — and it won't catch real query/schema bugs.

### fuzz testing
**They ask:** "What does Go's built-in fuzzing (`go test -fuzz`) actually do, and when does it earn its place over table-driven tests?"

Fuzzing generates *adversarial* inputs automatically rather than relying on the cases you thought to write — it's for functions that parse or transform untrusted input (a JSON decoder, a URL parser, a custom binary format) where the bug you're worried about is exactly the edge case you didn't imagine. Go 1.18+ ships it natively, seeded from a corpus and guided by coverage, so it's not random — it mutates inputs that discover new code paths.

```go
func FuzzParseVersion(f *testing.F) {
    f.Add("v1.2.3") // seed corpus
    f.Fuzz(func(t *testing.T, s string) {
        v, err := ParseVersion(s)
        if err == nil && v.Major < 0 {
            t.Errorf("parsed negative major from %q", s)
        }
    })
}
```

```bash
go test -fuzz=FuzzParseVersion -fuzztime=30s
```

**Say it:** "I reach for `go test -fuzz` on functions that parse untrusted input — it's coverage-guided input mutation, so it finds edge cases in the parser that no table-driven test author would have thought to write."
**Red flag:** Fuzzing pure business logic with no parsing/decoding surface. Fuzzing shines on input-boundary code; for deterministic business rules, table-driven tests give better signal per line of test code.

### assert vs require in testify
**They ask:** "What's the difference between `testify`'s `assert` and `require` packages, and why does the choice matter mid-test?"

Both check the same conditions; they differ in what happens on failure. `assert` logs the failure and *lets the test keep running* — useful when you want to see every mismatch in one run. `require` logs the failure and immediately calls `t.FailNow()`, stopping the test — necessary whenever a later assertion would panic or be meaningless without the earlier one succeeding.

```go
user, err := repo.FindByID(ctx, "1")
require.NoError(t, err)      // stop here if this fails — user may be nil/zero
assert.Equal(t, "Ann", user.Name)
assert.Equal(t, 30, user.Age) // still runs even if Name check above failed
```

**Say it:** "`require` stops the test on failure, `assert` lets it keep going — I use `require` for preconditions like a nil-check on `err`, so a later assertion doesn't panic on a value that was never valid."
**Red flag:** Using `assert.NoError` right before dereferencing the value it's checking. If the assertion fails, the test keeps running and panics on the nil dereference instead of failing cleanly — that should be `require`.
