# Go — core types, OOP, functions, generics

### Rune, Byte, and String Encoding
**They ask:** "What's the difference between rune and byte in Go, and why does Go have both?"

A Go `string` is an immutable, read-only slice of bytes — UTF-8 encoded, not an array of characters. `byte` is an alias for `uint8`, one raw byte. `rune` is an alias for `int32`, one Unicode code point. You need both because a single character like `世` takes 3 bytes in UTF-8 but is one rune — iterating with `for i, b := range s` over a `byte` index gives you byte offsets and decoded runes, not per-byte characters, which trips people up when they assume `len(s)` counts characters.

```go
s := "世界"
fmt.Println(len(s))          // 6 (bytes)
fmt.Println(len([]rune(s)))  // 2 (runes)
for i, r := range s {
    fmt.Println(i, r) // 0 世, 3 界 — index jumps by byte width
}
```

**Say it:** "A Go string is a read-only UTF-8 byte sequence — `byte` is a raw octet, `rune` is a decoded code point, and `len()` on a string counts bytes, not characters."
**Red flag:** Indexing a string with `s[i]` expecting a character — that gives you a single byte, which corrupts multi-byte runes.

### Constants and iota
**They ask:** "How do untyped constants work in Go, and what is iota for?"

Go constants are untyped by default, which means they carry arbitrary precision until they're assigned to a typed variable — that's why `const x = 1 << 62` compiles fine but the equivalent `int` expression could overflow. This gives constant expressions more flexibility than variables: the same untyped constant can be used as an `int`, `float64`, or `int8` depending on context, and the compiler converts it at the point of use.

`iota` is a counter that resets to 0 at each `const` block and increments per line — it's the idiomatic way to build enums since Go has no native enum type.

```go
type Level int
const (
    Debug Level = iota // 0
    Info               // 1
    Warn               // 2
    Error              // 3
)
```

**Say it:** "Constants in Go are untyped until used, which is why iota-based enums are the idiomatic pattern — the compiler assigns the type at the use site."
**Red flag:** Treating a Go "enum" as type-safe the way a Java enum is — an `iota`-based `Level` is just an `int` underneath, so nothing stops you from passing `Level(999)`.

### Pointers and Value Semantics
**They ask:** "When do you pass a pointer vs a value in Go, and what's the actual cost difference?"

The real question is mutability and size, not performance folklore. Pass a pointer when the callee needs to mutate the caller's data, or when the value is large enough that copying it is wasteful (a struct with many fields, not an `int`). Passing by value is Go's default and is usually cheap — small structs copy faster than you'd think, and value semantics avoid aliasing bugs where two callers unexpectedly share state.

```go
func inc(n *int) { *n++ }       // mutates caller's int
func double(n int) int { return n * 2 } // pure, no aliasing
```

**Say it:** "I reach for a pointer when I need to mutate the caller's value or the struct is large — otherwise value semantics are safer because nobody else can alias my data."
**Red flag:** Passing everything by pointer "for performance" without measuring — for small structs the pointer indirection plus potential heap escape can be slower than a stack-copied value.

### Slice Internals
**They ask:** "What is a Go slice under the hood, and why can appending to one silently corrupt another?"

A slice is a 3-word header — pointer to the underlying array, length, and capacity — not the data itself. Slicing an existing slice (`s[1:3]`) doesn't copy; the new slice shares the same backing array. If you then `append` to the sliced-from slice and it has spare capacity, it overwrites elements the other slice can still see — because both headers point at the same array.

```go
a := make([]int, 3, 5)
b := a[:2]
b = append(b, 99) // fits in a's spare capacity — overwrites a[2]!
```

**Say it:** "A slice is a header over a shared backing array, so appending within capacity can silently mutate data another slice still references — that's why I re-slice with a full three-index slice or copy when I need isolation."
**Red flag:** Assuming `append` always allocates. It only allocates when capacity is exceeded — within capacity it mutates in place, which is the source of most slice-aliasing bugs.

### Slice Growth and Preallocation
**They ask:** "How does append grow a slice's capacity, and when should you preallocate?"

When `append` exceeds capacity, Go allocates a new, larger backing array and copies the old elements over — the growth factor is roughly 2x for small slices and tapers to ~1.25x for large ones (implementation detail, not a spec guarantee). Each grow-and-copy is an allocation plus a memcpy, so appending in a tight loop without a size hint means repeated reallocation.

If you know the approximate final size, `make([]T, 0, n)` preallocates capacity so `append` never reallocates — this is one of the highest-leverage micro-optimizations in Go because it removes both allocation churn and GC pressure.

**Say it:** "When I know roughly how many elements I'm appending, I preallocate with `make([]T, 0, n)` — it turns O(log n) reallocations into one allocation."
**Red flag:** Building a large slice with bare `var s []T; s = append(s, x)` in a hot loop and not noticing it in a profile — that's a classic pprof allocation hotspot.

### Arrays vs Slices
**They ask:** "Arrays are value types in Go — what does that actually mean in practice?"

An array's length is part of its type (`[5]int` and `[10]int` are different types), and assigning or passing an array copies the whole thing — unlike a slice, which copies only the 3-word header. That's why arrays are rare in everyday Go code; slices are the practical default because they're cheap to pass and can grow. Arrays still matter where fixed size is a real invariant — a SHA-256 hash (`[32]byte`) or a small lookup table.

**Say it:** "Arrays are value types with size baked into the type, so I only reach for one when the fixed size is a real invariant — everything else is a slice."
**Red flag:** Passing a large array by value into a function without realizing it copies the entire array on every call.

### Map Internals
**They ask:** "How does a Go map work under the hood, and why is iteration order random?"

`map[K]V` is a hash table — Go's runtime implementation uses buckets of key/value pairs with an 8-entry bucket size and overflow buckets for collisions. Iteration order is deliberately randomized by the runtime specifically so nobody depends on it — an early Go design decision to stop accidental behavior from becoming a de facto API contract. If you need ordered output, sort the keys yourself.

```go
keys := make([]string, 0, len(m))
for k := range m { keys = append(keys, k) }
sort.Strings(keys)
```

**Say it:** "Map iteration order is intentionally randomized so nobody accidentally depends on it — if I need deterministic output I collect and sort the keys explicitly."
**Red flag:** Writing a test that asserts on map iteration order — it will flake, by design.

### Map Concurrency
**They ask:** "Why does a concurrent map write panic instead of silently corrupting, and what's your fix?"

Go's built-in map is explicitly documented as not safe for concurrent read/write from multiple goroutines. Rather than silently corrupt memory, the runtime has a cheap concurrent-access detector that panics with "fatal error: concurrent map writes" — a deliberate fail-fast choice because silent corruption is far worse to debug than a crash with a stack trace. The fix is a `sync.RWMutex` guarding the map, or `sync.Map` for specific access patterns (see the sync section).

**Say it:** "The built-in map isn't concurrency-safe by design — Go chose fail-fast panics over silent corruption, so I guard shared maps with a mutex or reach for sync.Map when the access pattern fits."
**Red flag:** Catching the "concurrent map writes" panic and moving on — the underlying race is still there and will corrupt data eventually, the panic was a mercy.

### Interfaces and Implicit Satisfaction
**They ask:** "How does Go decide a type satisfies an interface, and why is that different from Java/C#?"

Go interfaces are satisfied structurally, not declaratively — a type implements an interface simply by having the right method set, with no `implements` keyword. This is what makes Go interfaces cheap to define at the *consumer* side: you write a small interface where you use it, and any existing type that happens to have those methods satisfies it, including types from packages that never knew the interface existed.

```go
type Stringer interface{ String() string }
// any type with a String() string method satisfies this — no declaration needed
```

**Say it:** "Go interfaces are structural — a type satisfies one just by having the methods, which is why idiomatic Go defines small interfaces at the point of use rather than a big interface next to the implementation."
**Red flag:** Defining a huge interface upfront "for the implementation" the way you would in Java — idiomatic Go interfaces are small and defined by the consumer, per the "accept interfaces, return structs" guideline.

### The Empty Interface and any
**They ask:** "What is interface{} (or any) for, and what do you give up when you use it?"

`interface{}` (aliased to `any` since Go 1.18) has zero methods, so every type satisfies it — it's Go's escape hatch for "I don't know the type yet," used by things like `encoding/json` and `fmt.Println`. The cost is you lose compile-time type safety: every value stored as `any` requires a type assertion or switch to get anything useful back out, and it can hide bugs that generics or a concrete interface would catch at compile time.

**Say it:** "`any` is the type-erasure escape hatch — reflection-heavy code and generic containers before Go 1.18 leaned on it, but wherever the value's shape is knowable at compile time I'd rather use generics or a concrete interface."
**Red flag:** Using `map[string]interface{}` as a default data shape instead of a struct — it defers every type error to runtime and makes the code impossible to grep for usages.

### Type Assertions and Type Switches
**They ask:** "What's the difference between a type assertion and a type switch, and how do you do a safe assertion?"

A type assertion (`v.(T)`) extracts the concrete value from an interface, asserting it's actually of type `T`. The single-return form panics if wrong; the two-return "comma-ok" form (`v, ok := x.(T)`) returns the zero value and `false` instead — always prefer comma-ok unless you've already proven the type. A type switch (`switch v := x.(type)`) is the idiomatic way to branch across several possible concrete types.

```go
switch v := x.(type) {
case string:  fmt.Println("string:", v)
case int:     fmt.Println("int:", v)
default:      fmt.Println("unknown:", v)
}
```

**Say it:** "I always use the comma-ok form of a type assertion unless the type is already guaranteed — a bare assertion panicking on unexpected input is a self-inflicted production incident."
**Red flag:** Using `v.(T)` without comma-ok on data you don't fully control, like a decoded JSON payload.

### Nil Interface Gotcha
**They ask:** "Why can a nil pointer stored in an interface compare != nil?"

An interface value is a (type, value) pair internally. When you assign a typed nil pointer to an interface variable, the interface's type field gets set to that concrete type even though the value is nil — so the interface itself is not nil, only the value inside it is. Comparing that interface to `nil` compares the whole (type, value) pair, and the type isn't nil, so the comparison is `false`.

```go
func mayFail() error {
    var e *MyError // nil pointer
    return e       // returns a non-nil error interface!
}
```

**Say it:** "A nil concrete pointer boxed into an interface produces a non-nil interface, because the interface carries a (type, value) pair and only the value is nil — that's why I return a bare `nil`, not a typed nil, from an error-returning function."
**Red flag:** Writing `if err != nil` right after a function that can return a typed nil pointer as an `error` — the check passes even when there's "no error."

### Structs and Field Tags
**They ask:** "How do you define a struct, and what are struct tags actually for?"

A struct is a typed collection of named fields — Go's only real way to model a composite record, since there are no classes. Struct tags are string metadata attached to a field (`json:"name,omitempty"`) that the type itself ignores completely; they're read via reflection by libraries like `encoding/json` or an ORM to control serialization behavior without touching the struct's Go semantics.

```go
type User struct {
    ID    int    `json:"id"`
    Name  string `json:"name,omitempty"`
    email string // unexported: invisible to json and other packages
}
```

**Say it:** "Struct tags are reflection-readable metadata, not compiler-enforced — they let encoding/json or an ORM change field behavior without the struct itself knowing anything about serialization."
**Red flag:** Assuming a typo in a struct tag like `jsno:"name"` fails to compile — it doesn't; tags are just strings, so a typo silently breaks serialization at runtime.

### Encapsulation via Package Visibility
**They ask:** "Go has no private keyword — how do you actually encapsulate state?"

Go encapsulates at the package level, not the type level: an identifier (field, function, type) starting with a lowercase letter is unexported — invisible outside its package — while a capital letter is exported. There's no `protected` or fine-grained access control; the boundary is the package, which pushes you toward designing small, focused packages with a deliberate public API surface, exposing accessor methods where you need controlled mutation.

```go
package account
type Account struct{ balance int } // unexported field
func (a *Account) Balance() int { return a.balance } // controlled read
func (a *Account) Deposit(n int) { a.balance += n }   // controlled write
```

**Say it:** "Go encapsulates at the package boundary via export casing — there's no field-level private/protected, so I design the package's public surface deliberately and keep mutation behind methods."
**Red flag:** Exporting every field on a struct "to be safe" — that removes your only encapsulation boundary and lets any caller in any package mutate invariant-bearing state directly.

### Composition and Embedding
**They ask:** "Go has no inheritance — how does struct embedding give you code reuse, and where's the trap?"

Embedding puts one type inside another without a field name, and the outer struct's method set "promotes" the embedded type's methods — so `Dog` embedding `Animal` gets `Animal`'s methods callable directly on `Dog`, without writing forwarding wrappers. It looks like inheritance but it's composition: there's no polymorphic dispatch, no `super`, and the embedded value is just a regular field the compiler happens to promote.

```go
type Animal struct{ Name string }
func (a Animal) Speak() string { return a.Name + " makes a sound" }
type Dog struct{ Animal } // embeds, not extends
d := Dog{Animal{"Rex"}}
d.Speak() // promoted method — "Rex makes a sound"
```

**Say it:** "Embedding promotes an inner type's methods onto the outer struct, giving you composition-based reuse without inheritance's dispatch semantics — I reach for it to share behavior, not to model an is-a hierarchy."
**Red flag:** Calling embedding "inheritance" in an interview — there's no dynamic dispatch or method overriding; if both the embedded and outer type define the same method, the outer one simply shadows it, no polymorphism involved.

### Interface Composition and Polymorphism
**They ask:** "How do you get polymorphism in Go without class hierarchies?"

Polymorphism in Go comes entirely from interfaces: any function that accepts an interface type can operate over every concrete type that satisfies it, with the runtime dispatching to the right method via the interface's internal method table — that's Go's version of dynamic dispatch. Interfaces themselves can also be composed from smaller interfaces, which is idiomatic for building capability sets (`io.ReadWriter` = `io.Reader` + `io.Writer`).

```go
type Shape interface{ Area() float64 }
func TotalArea(shapes []Shape) float64 {
    var sum float64
    for _, s := range shapes { sum += s.Area() } // dispatches per concrete type
    return sum
}
```

**Say it:** "Polymorphism in Go is interface-based dispatch, not class hierarchies — I compose small interfaces into bigger ones instead of building an inheritance tree."
**Red flag:** Trying to simulate method overriding by embedding and hoping the outer type's method "overrides" the inner one polymorphically — it only shadows at the static type; a caller holding the embedded type directly still calls the inner method.

### Variadic Functions
**They ask:** "How do variadic functions work in Go, and what's the gotcha when you pass a slice to one?"

A variadic parameter (`...T`) lets a function accept zero or more arguments of type `T`, which the compiler packs into a `[]T` inside the function. If you already have a slice and want to pass its elements as variadic arguments, you spread it with `s...` — without that, you'd be passing one `[]T` argument to a function expecting individual `T`s, a compile error.

```go
func sum(nums ...int) int {
    total := 0
    for _, n := range nums { total += n }
    return total
}
sum(1, 2, 3)      // packed into []int{1,2,3}
nums := []int{4,5}
sum(nums...)      // spread — required
```

**Say it:** "Variadic args are sugar for a slice parameter — when I already have a slice I spread it with `...`, otherwise it's a type mismatch."
**Red flag:** Forgetting that `fmt.Println(nums)` versus `fmt.Println(nums...)` produce different output — one prints the slice, the other prints each element space-separated.

### Closures
**They ask:** "What does a Go closure actually capture, and what's the classic loop-variable bug?"

A closure captures variables by reference to their lexical environment, not by value — so a closure formed inside a loop that captures the loop variable sees whatever the variable's *final* value is when the goroutine actually runs, not the value at the time the closure was created. Before Go 1.22, `for i := range` reused a single `i` across iterations, which made this bug extremely common with goroutines launched in a loop; Go 1.22 changed loop variables to be per-iteration, but you still need to know the pattern for pre-1.22 code and for capturing any other shared variable.

```go
// pre-1.22 bug pattern
for i := 0; i < 3; i++ {
    go func() { fmt.Println(i) }() // all print 3, not 0,1,2
}
// fix (works on any version):
for i := 0; i < 3; i++ {
    i := i // shadow — per-iteration copy
    go func() { fmt.Println(i) }()
}
```

**Say it:** "A closure captures variables by reference, so a loop-launched goroutine can see the loop variable's final value — I either shadow the variable per iteration or pass it as a parameter, and I know Go 1.22 fixed this for `for` loop variables specifically."
**Red flag:** Not knowing Go 1.22 changed this — claiming the bug is unconditionally still present, or claiming it's unconditionally fixed regardless of Go version, both signal you haven't kept up with the language.

### Recursion and Stack Growth
**They ask:** "How does Go handle deep recursion — does it blow the stack like C?"

Goroutine stacks start small (a few KB) and grow dynamically — when a function call would overflow the current stack, the runtime allocates a larger stack, copies the old one over (adjusting internal pointers), and continues, up to a large default maximum (measured in hundreds of MB, configurable via `debug.SetMaxStack`). That's very different from a fixed-size OS thread stack, so ordinary recursion depths that would overflow a C thread stack are usually fine in Go — but genuinely unbounded recursion (a missing base case) still eventually hits the max and panics with a fatal stack overflow.

**Say it:** "Goroutine stacks grow and get copied automatically, so recursion depth that would blow a fixed OS thread stack is usually fine — but that's a bigger ceiling, not an infinite one, so I still need a real base case."
**Red flag:** Assuming Go recursion is "unlimited" — it still has a max stack size, and hitting it is an unrecoverable fatal error, not a catchable panic.

### First-Class and Higher-Order Functions
**They ask:** "What does it mean that functions are first-class in Go, and where do you actually use that?"

Functions in Go are values — you can assign them to variables, pass them as arguments, return them from other functions, and store them in structs or maps. That makes patterns like middleware chains, functional options, and strategy-style dependency injection idiomatic without needing a class hierarchy: a `http.Handler` middleware is just a function that takes a handler and returns a wrapped one.

```go
type Middleware func(http.Handler) http.Handler
func Logging(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        log.Println(r.Method, r.URL.Path)
        next.ServeHTTP(w, r)
    })
}
```

**Say it:** "Functions as values are what make middleware chains and the functional-options pattern idiomatic in Go — no interface boilerplate needed just to inject behavior."
**Red flag:** Building a "strategy interface" with a single method when a plain `func(...)` field would do the same job with less ceremony — over-engineering an interface for something Go's first-class functions already solve.

### Generics and Type Parameters
**They ask:** "Why did Go add generics in 1.18, and what problem were people solving with interface{} + reflection before that?"

Before 1.18, a generic-ish container (say, a `Stack` that works for any type) had two bad options: write it once per concrete type (code duplication) or use `interface{}` and reflection/type assertions everywhere (loses compile-time type safety and adds runtime overhead). Generics with type parameters let you write one implementation that the compiler specializes per type, keeping both code reuse and static type checking.

```go
func Map[T, U any](in []T, f func(T) U) []U {
    out := make([]U, len(in))
    for i, v := range in { out[i] = f(v) }
    return out
}
```

**Say it:** "Generics replaced the interface{}-plus-reflection workaround for type-agnostic containers and algorithms — same code reuse, but the compiler catches type errors instead of deferring them to a runtime panic."
**Red flag:** Reaching for generics on every function "for flexibility" — Go's idiom is still to write the concrete version first and generify only when you actually have two or more real call sites that need it.

### Generic Constraints
**They ask:** "What is a type constraint, and how do you write one beyond the built-in comparable?"

A constraint is an interface that restricts which types can satisfy a type parameter — it can list required methods like a normal interface, or (since generics) an explicit set of allowed underlying types using `|`. The standard library ships `comparable` (types usable with `==`) and the `constraints`-style numeric unions live in `golang.org/x/exp/constraints` or you define your own.

```go
type Number interface{ ~int | ~int64 | ~float64 }
func Sum[T Number](nums []T) T {
    var total T
    for _, n := range nums { total += n }
    return total
}
```

**Say it:** "A constraint is just an interface — either a method set like any other interface, or a `~T | ~T2` union restricting which underlying types are allowed, with `~` meaning 'or any type whose underlying type is T'."
**Red flag:** Forgetting the `~` when you want the constraint to also match named types built on the underlying type — without it, a `type Meters float64` wouldn't satisfy a plain `float64` constraint.

### Struct Comparison and Equality
**They ask:** "When can you compare two structs with ==, and when do you need reflect.DeepEqual?"

Structs are comparable with `==` only if every field is itself comparable — slices, maps, and functions aren't, so a struct containing any of those fields can't use `==` and won't even compile if you try. For structs with incomparable fields, or when you want value-based deep equality across nested pointers/slices, you reach for `reflect.DeepEqual` (or, in tests, `testify`'s `assert.Equal` / `go-cmp`, which give better diffs and configurable comparison rules).

**Say it:** "`==` works on structs only when every field is comparable — the moment a slice or map shows up, I need `reflect.DeepEqual` or `go-cmp`, and in tests I default to `go-cmp` for the diff output."
**Red flag:** Trying to `==` two structs that contain a slice field and being surprised by the compile error — "invalid operation: struct containing []int cannot be compared."

### Method Sets: Pointer vs Value Receivers
**They ask:** "How do you decide between a pointer receiver and a value receiver, and how does that affect interface satisfaction?"

Use a pointer receiver when the method mutates the receiver, when the struct is large enough that copying is wasteful, or for consistency once any method on the type needs a pointer receiver. The subtlety that trips people up: a value of type `T` has both `T` and `*T` methods in its method set when addressable, but an *interface* holding a plain `T` only sees methods with value receivers — a type with only pointer-receiver methods needs a `*T` to satisfy that interface, not a `T`.

```go
type Counter struct{ n int }
func (c *Counter) Inc() { c.n++ } // pointer receiver
var _ interface{ Inc() } = &Counter{} // works
// var _ interface{ Inc() } = Counter{} // compile error
```

**Say it:** "If any method needs a pointer receiver to mutate state, I make all methods on that type pointer receivers for consistency — and I remember that only `*T`, not `T`, satisfies an interface requiring a pointer-receiver method."
**Red flag:** Mixing pointer and value receivers on the same type inconsistently — it's legal but it's a code-review flag because it makes the type's addressability requirements unpredictable for callers.
