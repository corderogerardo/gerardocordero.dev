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

Use a pointer receiver when the method mutates the receiver, when the struct is large enough that copying is wasteful, or for consistency once any method on the type needs a pointer receiver. The subtlety that trips people up: the *method set* of `T` includes only value-receiver methods; the method set of `*T` includes both value- and pointer-receiver methods. An addressable `T` value (a local variable, a struct field) can still *call* a pointer-receiver method directly — the compiler inserts an implicit `&` for you — but that's a call-syntax convenience, not a change to `T`'s method set: `T` still does NOT satisfy an interface that requires a pointer-receiver method, only `*T` does.

```go
type Counter struct{ n int }
func (c *Counter) Inc() { c.n++ } // pointer receiver
var _ interface{ Inc() } = &Counter{} // works
// var _ interface{ Inc() } = Counter{} // compile error
```

**Say it:** "If any method needs a pointer receiver to mutate state, I make all methods on that type pointer receivers for consistency — and I remember that only `*T`, not `T`, satisfies an interface requiring a pointer-receiver method."
**Red flag:** Mixing pointer and value receivers on the same type inconsistently — it's legal but it's a code-review flag because it makes the type's addressability requirements unpredictable for callers.

### encoding/json: custom marshaling and the gotchas
**They ask:** "What do senior engineers get wrong with encoding/json in Go?"

The one that bites everyone: `encoding/json` only sees **exported** fields — a lowercase field is silently omitted on marshal and left at its zero value on unmarshal, with no error. Beyond that, the senior toolkit is: implement `MarshalJSON`/`UnmarshalJSON` on a type when the wire shape differs from the Go shape (custom time formats, enums as strings); use `json.RawMessage` to defer decoding part of a payload whose shape depends on another field (discriminated unions); and use `json.Decoder` (with `DisallowUnknownFields` when you want strictness) to stream-decode large or newline-delimited input instead of buffering it all. `omitempty` drops zero-valued fields — but note it can't distinguish "absent" from "explicitly zero," which is why nullable fields often need a pointer.

```go
type Event struct {
    Type string          `json:"type"`
    Data json.RawMessage `json:"data"` // decode later based on Type
    ts   time.Time       // unexported → invisible to json, silently
}
```

**Say it:** "encoding/json only touches exported fields, so a lowercase field silently vanishes — beyond that I reach for custom MarshalJSON when the wire shape differs, json.RawMessage for payloads whose shape depends on a discriminator, and a pointer when I need to tell 'absent' from 'zero'."
**Red flag:** Wondering why a struct field "isn't saving" and never suspecting the lowercase name. It's the single most common `encoding/json` bug, and it fails silently — no error, just a missing field.

### Short Variable Declaration vs var
**They ask:** "When do you use `:=` instead of `var`, and what's actually different?"

`:=` is Go's short variable declaration — it declares **and** infers the type in one step, and only works inside a function body (not at package level). `var` is the explicit form: you can declare without initializing (giving a zero value), declare with an explicit type Go won't infer correctly, or declare at package scope where `:=` isn't legal. Mechanically `:=` requires at least one new variable on the left side; mixing new and existing names in a multi-assignment redeclares only the new ones.

```go
var count int           // zero value, explicit type
count = 5
total := 0               // inferred int, only inside a func
name, err := fetch()     // both new
name, err2 := fetch()    // name reused, err2 new — still legal
```

**Say it:** "`:=` is shorthand for `var` with type inference, restricted to function scope — I reach for `var` when I need a zero value with no initializer yet, an explicit type, or package-level scope."
**Red flag:** Using `:=` to "reassign" an existing variable inside a new block (`if`/`for`) — it silently creates a new shadowed variable scoped to that block instead of updating the outer one.

### Zero Values
**They ask:** "What value does an uninitialized variable actually have in Go?"

Go has no uninitialized memory — every declared variable gets a deterministic zero value the moment it's declared, which is why `var x int` is always safe to use immediately without an explicit initializer. The zero value is type-specific: numeric types get `0`, `bool` gets `false`, `string` gets `""` (empty, not nil), and pointers, slices, maps, channels, funcs, and interfaces all get `nil`. This design decision is what makes a freshly declared struct usable immediately — every field is already valid.

```go
var i int     // 0
var s string  // ""
var b bool    // false
var p *int    // nil
var sl []int  // nil, but len(sl) == 0 and it's safe to range over
```

**Say it:** "Every Go value is zero-initialized deterministically — numbers to 0, strings to empty, pointers/slices/maps/channels/interfaces to nil — so a freshly declared variable or struct is always in a valid, usable state without an explicit initializer."
**Red flag:** Assuming a nil slice or map behaves identically to an initialized one — reading and ranging a nil slice or map is safe, but writing to a nil map panics.

### The for Loop
**They ask:** "Go has no `while` or `do-while` keyword — how do you write those loops?"

`for` is Go's only looping construct — deliberately, to keep the language small — and it covers every loop shape other languages spread across `for`/`while`/`do-while`. The three-clause form (`init; condition; post`) is the classic counted loop; drop the init and post and you get a `while` loop; drop the condition entirely and you get an infinite loop you `break` out of explicitly. Since Go 1.22, `for range n` (an integer) also works, replacing the old `for i := 0; i < n; i++` idiom for simple counted iteration.

```go
for i := 0; i < 5; i++ { }   // classic counted loop
for cond { }                  // "while" — condition only
for { }                       // infinite — break to exit
for i := range 5 { }          // Go 1.22+: counted range over an int
```

**Say it:** "Go collapsed for/while/do-while into one `for` keyword with optional clauses — same construct, fewer keywords to learn — and range over an int since 1.22 covers the simple counted case even more concisely."
**Red flag:** Writing `for true { ... break ... }` out of habit from another language, instead of the idiomatic bare `for { ... break ... }` — the condition `true` is redundant noise in Go.

### if with an Init Statement
**They ask:** "What's that pattern where people write `if err := doThing(); err != nil`?"

`if` (and `switch`) can carry an init statement before the condition, separated by a semicolon — the variable it declares is scoped only to the `if`/`else` block, not leaked into the surrounding function. This is why `err := f(); err != nil` is everywhere in idiomatic Go: it declares `err` right where it's checked and used, instead of polluting the enclosing scope with an `err` variable that lives on after the check is done.

```go
if v, err := fetch(); err != nil {
    return err
} else {
    use(v) // v and err both scoped to this if/else
}
```

**Say it:** "The if-with-init form scopes the declared variable to just the if/else block, which is why `err := f(); err != nil` is idiomatic — it keeps the error variable from leaking into the rest of the function."
**Red flag:** Declaring `err` outside the `if` just to check it once inside — that keeps a stale, unused-after-this-point variable alive in the enclosing scope for no reason.

### Multiple Return Values
**They ask:** "Why does almost every Go function return two values, like `value, err`?"

Go functions can return more than one value natively — no tuple type, no wrapper object needed — and the language leans on this hard for the `(result, error)` convention instead of exceptions. This is why error handling in Go is explicit at every call site: you get both values back and the caller is forced to at least acknowledge the error is there, even if they only check for nil.

```go
func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, errors.New("divide by zero")
    }
    return a / b, nil
}
result, err := divide(10, 2)
```

**Say it:** "Multiple return values are a language feature, not a convention layered on top — Go uses them for the (result, error) pattern specifically so error handling is visible and explicit at every call site instead of hidden in a try/catch."
**Red flag:** Discarding the error return with `_` just to make code compile faster during a review — that's the one value Go handed you specifically so failures aren't silent.

### Struct Literals: Named Fields vs T Pointer
**They ask:** "What's the difference between `T{...}` and `&T{...}` when constructing a struct?"

A struct literal `T{Field: value, ...}` constructs a value of type `T` with the named fields set and every other field at its zero value — field names make the literal self-documenting and order-independent, unlike the positional `T{value1, value2}` form, which breaks the moment someone reorders the struct's fields. Prefixing with `&` (`&T{...}`) does the same construction but yields a `*T` — a pointer to a freshly allocated value — which is the idiomatic way to build a pointer without a separate `new(T)` plus field assignments.

```go
u := User{Name: "Ana", Age: 30}   // value, named fields — safe if fields reorder
p := &User{Name: "Ana"}           // *User, same literal syntax
bad := User{"Ana", 30}            // positional — breaks silently if field order changes
```

**Say it:** "I always use named fields in a struct literal — it's order-independent and self-documenting — and I prefix with `&` when I need a pointer, which is Go's idiomatic shortcut for allocate-then-assign."
**Red flag:** Using positional struct literals (`User{"Ana", 30}`) outside a very small, stable, same-package type — a reordered field silently swaps values into the wrong field with no compiler error if the types happen to match.

### make vs new
**They ask:** "What's the difference between `make` and `new` in Go?"

Both allocate, but for different purposes and return different things. `new(T)` allocates zeroed memory for any type `T` and returns a `*T` pointer to it — it's a generic allocator you rarely need directly, since `&T{}` does the same thing more idiomatically for structs. `make` is narrower and only works on slices, maps, and channels — the three built-in types that need internal initialization beyond a zeroed memory block (a slice needs a backing array and length/capacity, a map needs its hash table initialized, a channel needs its internal buffer) — and `make` returns the initialized value itself, not a pointer.

```go
p := new(int)              // *int, points to 0
s := make([]int, 0, 5)     // []int, ready to use — not *[]int
m := make(map[string]int)  // map[string]int, ready to write to
```

**Say it:** "`new` gives you a zeroed pointer to any type; `make` is specifically for slices, maps, and channels because those need internal setup a zeroed block doesn't provide, and `make` returns the value itself, not a pointer to it."
**Red flag:** Calling `new(map[string]int)` expecting a usable map — it gives you a pointer to a nil map, which still panics on write; `make` is the one that actually initializes it.

### range Over Slices and Maps
**They ask:** "What do the two values you get from `range` actually mean for a slice versus a map?"

`range` is Go's iteration construct over slices, arrays, maps, strings, and channels, and what the two returned values mean depends on the type: for a slice/array it's `(index, value)`; for a map it's `(key, value)`; for a string it's `(byte-index, decoded rune)` — see rune/byte encoding for why that last one surprises people. Critically, the value in `for _, v := range items` is a **copy** on each iteration, not a reference into the original — mutating `v` doesn't mutate the underlying element, which trips people up with structs.

```go
for i, v := range []string{"a", "b"} { }    // i=index, v=copy of element
for k, v := range map[string]int{"x": 1} {} // k=key, v=value
for i := range items { }                     // index only, value dropped
```

**Say it:** "range's second value is always a copy, so mutating it in the loop body never changes the original slice or map — if I need to mutate elements in place I index with `items[i]` instead."
**Red flag:** Writing `for _, item := range items { item.Field = x }` expecting the underlying slice to change — `item` is a copy; the fix is `items[i].Field = x` or making `items` a slice of pointers.

### fmt.Printf Verbs
**They ask:** "What's the difference between `%v`, `%+v`, `%#v`, and `%T` in Printf?"

fmt's formatting verbs exist because `Println` alone can't show type information or struct internals usefully. `%v` prints a value's default representation; `%+v` adds field names for structs; `%#v` prints a Go-syntax representation you could paste back into source; `%T` prints the value's type instead of its value — invaluable when debugging why an `interface{}` isn't behaving as expected. `%d`, `%s`, `%f` are the typed verbs for int, string, float specifically, and Printf writes an ugly inline error string into the output (not a real panic) if you pass the wrong type for a typed verb.

```go
u := User{Name: "Ana"}
fmt.Printf("%v\n", u)   // {Ana}
fmt.Printf("%+v\n", u)  // {Name:Ana}
fmt.Printf("%#v\n", u)  // main.User{Name:"Ana"}
fmt.Printf("%T\n", u)   // main.User
```

**Say it:** "%v is the general default, %+v adds field names for structs, %#v gives a Go-syntax literal, and %T tells me the actual type — that last one is my go-to when I'm debugging what's actually inside an interface{}."
**Red flag:** Reaching for `fmt.Println` everywhere and manually string-concatenating for debug output — `%+v` on a struct gives far more useful information in one call, especially for nested structs.

### nil for Slices, Maps, and Pointers
**They ask:** "Is a nil slice the same as an empty slice? What about a nil map?"

`nil` means "no underlying value," but its safety depends entirely on the type. A nil slice is safe to range over and index-read `len`/`cap` on, and even append to (`append` allocates a new backing array on first use) — `len(nilSlice) == 0` works fine. A nil map is safe to read from (a missing key just returns the zero value) but panics on write — `m[k] = v` on a nil map crashes. A nil pointer is the narrowest case: the *only* safe operation is comparing it to `nil` — there's no value behind it to read, so dereferencing it (`*p`) panics immediately, it isn't a "read." The pattern to internalize: slices and maps tolerate reads on nil, pointers don't have a read to tolerate — `== nil` is the one safe thing you can do with one.

```go
var s []int           // nil, but len(s)==0 and append(s, 1) works
var m map[string]int  // nil, m["x"] reads fine (returns 0), m["x"]=1 PANICS
var p *int            // nil, p == nil is safe, *p PANICS
```

**Say it:** "A nil slice tolerates reads and even appends, a nil map tolerates reads but panics on write, and a nil pointer only tolerates a `== nil` comparison — dereferencing it isn't a read, it panics — so I always `make(map[K]V)` before assigning into a map that might be nil, and I never dereference a pointer without checking it first."
**Red flag:** Returning a nil map from a constructor and letting a caller write to it — that's a panic waiting for whichever caller doesn't happen to check, when `make(map[K]V)` up front would have prevented it entirely.

### Basic switch Statement
**They ask:** "How is Go's `switch` different from C or Java's?"

Go's `switch` breaks after each matching case automatically — no fallthrough by default, which removes the classic "forgot the break" bug — and you opt into C-style fallthrough explicitly with the `fallthrough` keyword when you actually want it. A case can also list multiple comma-separated values, and `switch` with no expression at all (`switch { case cond1: ... }`) is a clean, idiomatic replacement for a long `if`/`else if` chain.

```go
switch day {
case "Sat", "Sun":
    fmt.Println("weekend")
default:
    fmt.Println("weekday")
}

switch { // no expression — acts like if/else-if
case score > 90:
    grade = "A"
case score > 80:
    grade = "B"
}
```

**Say it:** "Go's switch auto-breaks per case, so there's no fallthrough footgun by default — and the expression-less form is my go-to replacement for a long if/else-if chain because it reads cleaner."
**Red flag:** Adding an explicit `break` at the end of every case out of C/Java habit — it's redundant; Go already breaks automatically, and a stray `break` inside a switch nested in a loop can even confuse readers about which construct it's breaking out of.

### Explicit Type Conversion
**They ask:** "Why won't Go let me assign an `int` to a `float64` variable directly?"

Go has no implicit type coercion between distinct types, even numeric ones that other languages widen automatically — the compiler forces an explicit conversion `T(v)` at every boundary where types differ. This is a deliberate safety trade-off: it costs a few extra keystrokes but makes every precision-changing conversion visible in the code instead of happening silently — the conversion itself can still truncate or overflow (see `int(f)` below), Go just refuses to let that happen invisibly.

```go
var i int = 5
var f float64 = float64(i)  // must convert explicitly
var i2 int = int(f)         // truncates toward zero, not rounds
```

**Say it:** "Go requires an explicit conversion between any two distinct types, including numeric ones — it's more typing but it means every precision-changing conversion is visible in the code instead of happening silently."
**Red flag:** Assuming `int(3.9)` rounds to 4 — conversion from float to int truncates toward zero, so `int(3.9)` is 3 and `int(-3.9)` is -3, not -4.

### The Blank Identifier
**They ask:** "What does the underscore `_` actually mean in Go?"

`_` is the blank identifier — a write-only placeholder that discards whatever value is assigned to it, satisfying Go's rule that every declared variable must be used without actually creating a usable variable. It shows up constantly: discarding one of multiple return values (`value, _ := f()`), discarding the loop variable you don't need (`for _, v := range s`), or importing a package purely for its side effects (`import _ "net/http/pprof"`).

```go
_, err := doWork()          // discard the value, keep the error
for _, v := range items {}  // discard the index
import _ "embed"            // side-effect-only import
```

**Say it:** "The blank identifier is a write-only discard — it lets me satisfy Go's unused-variable rule when I only need some of what a function or range gives back, without inventing a name for a value I'll never touch."
**Red flag:** Discarding an error with `_` as a default habit instead of a deliberate choice — every `_` on an error return is a decision that a failure there is truly safe to ignore, and that should be rare enough to stand out in review.

### Methods: Functions with a Receiver
**They ask:** "What actually makes a function a method in Go?"

A method is just a function with an extra receiver argument written before the name — `func (a Account) Balance() int` — and that receiver is what lets you call it as `a.Balance()` instead of `Balance(a)`. There's no special method syntax beyond that receiver; methods and functions are the same underlying construct, which is also why a method can be referenced as a plain function value (`a.Balance` is a bound function value you can pass around). The receiver can be a value (`T`) or a pointer (`*T`) — see Method Sets for how that choice affects mutation and interface satisfaction.

```go
type Account struct{ balance int }
func (a Account) Balance() int { return a.balance }  // method
func Balance(a Account) int { return a.balance }     // equivalent function

acc := Account{balance: 100}
acc.Balance() // method call sugar for Balance(acc)
```

**Say it:** "A method is a function with a receiver bound to a type — that receiver is what gives you the acc.Method() call syntax, and under the hood it's no different from passing acc as an argument to a plain function."
**Red flag:** Treating methods as a fundamentally different mechanism from functions, the way a class-based language does — in Go they're the same construct, which is exactly why a method value can be passed around like any other function.
