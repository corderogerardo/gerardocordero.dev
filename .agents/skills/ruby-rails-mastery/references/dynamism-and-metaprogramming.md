# Part 3 — Ruby Dynamism & Metaprogramming (ch 13–16)

Object individuation, callable objects (proc vs lambda), callbacks/hooks,
introspection, `method_missing`, functional style. Ruby 3.4. This is what Rails is
built from.

## Blocks, procs, lambdas — the callable spectrum (ch 14)

### Blocks
Caller-supplied code a method runs via `yield`; guard with `block_given?`. Blocks
are the lightweight syntax and are **not objects** (can't be stored) until captured.
```ruby
def each(&blk)                 # &blk captures the block AS a Proc
  return to_enum(:each) unless block_given?
  @items.each { |i| yield i }
  self
end
```
`yield` with no block → `LocalJumpError`. Inversion of control: the method owns the
*when*, the block owns the *what* — the reason one `each` powers all of Enumerable.

### Procs & closures
A `Proc` is a block promoted to an object; it **closes over** the live local
variables where it was created (not snapshots — mutations are shared). `&` bridges
the two worlds: `&blk` in a signature *captures* a block as a Proc; `&proc` at a call
site *expands* a Proc into a block. Call styles: `p.call(x)`, `p.(x)`, `p[x]`.

### Lambda = a strict Proc (two differences — top interview question)
`->(x){ }.class == Proc` and `.lambda? == true`, but:
1. **Arity** — a lambda enforces argument count (`ArgumentError` on mismatch); a
   plain proc is lenient (extra dropped, missing → `nil`).
2. **`return`** — inside a lambda, `return` exits the *lambda*; inside a plain proc,
   `return` exits the *method that created the proc* (`LocalJumpError` if it already
   returned). **Store lambdas.** Rails scopes/callbacks/`if:` conditions are lambdas
   deliberately — strict arity + contained `return` keep them safe inside the framework.

### Symbol#to_proc & Method objects
`&:name` == `&` coercing `:name` via `Symbol#to_proc` into `{ |o| o.name }` — one
no-arg call only (args/chaining need a real block). `obj.method(:foo)` → a **Method
object** (callable, `&m`-expandable); knows `.arity`, `.owner`, `.source_location`.

## Functional style (ch 16)

- **Composition:** `f >> g` = "f then g" (left→right, reading order); `f << g` = "g
  then f". Build pipelines from small named lambdas: `base >> surcharge >> to_dollars`.
- **`curry`:** fix args one at a time — `rate = ->(pm, m){ pm*m }.curry; rate[100][30]`.
- **`tap`** runs a block, returns the **receiver** (side effects mid-chain);
  **`then`/`yield_self`** runs a block, returns the **block's result** (inline wrap).
- Prefer pure functions + `freeze` for pipeline steps; avoid shared mutable state.

## Concurrency (ch 14) — the GVL truth
- CRuby's **Global VM Lock**: one thread runs Ruby at a time, **but the lock is
  released during blocking I/O**. So threads give real concurrency for **I/O-bound**
  work (DB, HTTP — most web work), *not* parallelism for **CPU-bound** work. This is
  why threaded **Puma**/**Sidekiq** work well.
- `Thread.new { }` + `join`; share mutable state only under a `Mutex#synchronize`.
- **Fiber** — cooperative, manually paused (`Fiber.yield`/`resume`); powers lazy
  enumerators and async I/O; never runs concurrently.
- **Ractor** — real parallelism (own GVL each) at the cost of isolation (message-pass
  immutable data). Still **experimental** as of 3.4; for CPU-bound work today, use
  multiple processes.

## Object individuation & hooks (ch 13, 15)

Lifecycle callbacks Ruby fires automatically — the seams Rails hooks:
- `included(base)` — module `include`d; the star: lets a mixin add BOTH instance
  methods AND class methods.
- `extended(base)`, `inherited(subclass)`, `method_added(name)`, `prepended(base)`.

**The ActiveSupport::Concern pattern (build it by hand):**
```ruby
module Trackable
  def self.included(base)          # hook fires with the including class
    base.extend(ClassMethods)      # add class-level macros
    base.instance_variable_set(:@events, [])
  end
  module ClassMethods
    def events = @events
  end
  def track!(e) = self.class.events << e   # instance method
end
```
`include Trackable` now grants instance + class methods and runs setup — exactly what
`ActiveSupport::Concern` automates with `included do … end` / `class_methods do … end`.

## Runtime introspection & metaprogramming (ch 15)

- **Introspect:** `respond_to?(:m)` (capability check → duck typing, prefer over
  `is_a?`), `methods`, `instance_variables`, `instance_variable_get(:@x)`,
  `method(:m).owner` / `.source_location` (**the debugging superpower** — find where
  a method *actually* lives through all mixins/gems).
- **`send` / `public_send`:** call a method by name-as-data (serializers, form
  builders). **`send` bypasses private/protected** — with untrusted input it's a
  vulnerability; use **`public_send` + an allowlist**.
- **`define_method`:** generate methods from data at load time. It takes a **block**,
  so the body **closes over** loop vars/config — `def` (a scope gate) can't. This is
  how `enum` makes `confirmed?`, how `attr_accessor` makes getters, how `delegate`
  works.
- **`method_missing(name, *args, &blk)`:** the last stop after a failed lookup.
  Override for ghost methods (dynamic finders, OpenStruct). **Contract:** always pair
  with `respond_to_missing?` (else `respond_to?` lies and breaks `&:sym`/serializers),
  and call `super` for names you don't handle (so real typos still raise).
  **Judgment:** for a *known/finite* name set prefer `define_method` (faster,
  introspectable); reserve `method_missing` for genuinely open-ended names.

### Trade-off pitch (metaprogramming, 3 beats)
Cost is real — harder to grep, harder to debug, slower lookup. But the alternative
for a DSL/ORM/serializer is hundreds of lines of drift-prone boilerplate. So: use it
for framework-level leverage (written once, used everywhere) and keep application
code boring and explicit. Long term it means new methods come free as data grows,
instead of a per-case maintenance tax.
