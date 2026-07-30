# Part 1 — Foundations & the Object Model (ch 1–6)

Objects, methods, arguments, classes, modules, `self`, scope, visibility, method
lookup, singleton classes, control flow. All Ruby 3.4.

## Objects, methods, messages (ch 2)

- No functions — only **methods**, invoked by sending a **message** to a receiver.
  `walker.name` sends `name`; `2 + 3` sends `+`. A dot always calls a method.
- **Identifiers:** local (`x`), instance (`@x`), class (`@@x`, rare — avoid; prefer
  class instance vars), global (`$x`, avoid), constant (`X`, `Klass`), method (`x`,
  `x?`, `x!`, `x=`). `?`/`!`/`=` suffixes are real parts of the name.
- Instance variables are **private by default** — `@name` is invisible outside the
  object until a method exposes it (`attr_reader`/`attr_accessor` generate those
  methods). Ruby flips the Swift/Python/JS default.

### The seven parameter kinds (in required order)
1. required positional `def f(a)`
2. optional positional `def f(a, b = 1)`
3. splat/rest `def f(a, *rest)` → array of leftover positionals
4. required keyword `def f(a:)`
5. optional keyword `def f(a:, b: 1)`
6. double-splat `def f(a:, **opts)` → hash of leftover keywords
7. block `def f(a, &blk)` → captures the block as a Proc

**Ruby 3 hash/keyword split (gotcha):** keyword args are a distinct calling
convention, not a trailing hash. `def f(opts)` (positional hash) ≠ `def f(**opts)`.
Passing the wrong one raises `ArgumentError`. Keyword-first is the modern default
for 3+ params — self-documenting and order-independent.

## Classes (ch 3)

- `initialize` is the constructor, called by `.new`. `attr_reader/writer/accessor`
  generate getter/setter methods (they are `define_method` under the hood).
- Inheritance: `class Puppy < Dog`; `super` calls up the chain (`super` forwards
  same args, `super()` sends none, `super(x)` sends `x`).
- Class methods: `def self.x` (or `class << self`), see singleton classes below.

## Modules (ch 4)

- **Namespacing** (`Module::Const`) and **mixins** (shared behavior).
- `include` — instance methods, inserted *below* the class in ancestors.
- `prepend` — inserted *above* the class; intercepts and can wrap with `super`.
- `extend` — adds the module's methods as *singleton* (usually class) methods.
- Canonical mixins: `Comparable` (needs `<=>`), `Enumerable` (needs `each`).

## self — the default object (ch 5)

`self` is the current default receiver; bare calls (no receiver) go to it.

| Context | `self` is |
|---|---|
| top level | `main` |
| class/module body | the class/module (so `validates :x` = a method call on the class) |
| instance method | the instance |
| class method (`def self.x`) | the class |

**The one place `self.` is mandatory:** setters. Bare `name = v` inside a method
is *always* a local-variable assignment; to hit the setter write `self.name = v`.
(This is the exception where `private` also permits an explicit `self` receiver.)

## Scope & visibility (ch 5)

- **Scope gates:** `class`, `module`, `def` each start a fresh local scope — outer
  locals don't cross in. **Blocks are NOT gates** — they close over the enclosing
  scope (basis of closures). Constants use lexical (not local) lookup, so they *do*
  cross into method bodies.
- **Visibility** (about the *call site*, not the definer):
  - `public` (default) — any receiver.
  - `private` — **no explicit receiver** (implicit `self` only). `obj.priv` fails
    even from a sibling instance. (Setter form `self.x =` is the lone exception.)
  - `protected` — explicit receiver allowed **only if caller is same class/subclass**.
    Its real use: comparing two instances (`other.rating` inside `better_than?`).
- **Rails tie:** controller — every non-action method must be `private` (the router
  dispatches to *public* methods; a public helper becomes a reachable endpoint).

## Method lookup path (ch 4 + 13)

For instance `obj` of class `C`, `obj.msg` searches, first match wins:
1. `obj`'s singleton class
2. modules `prepend`ed into `C` (most-recent first)
3. `C`
4. modules `include`d in `C` (most-recent first)
5. `C`'s superclass — repeat 2–4 upward → `Object` → `Kernel` → `BasicObject`

Rule of thumb: **prepend beats the class beats include.** `super` continues from
the current method's position. Nothing found → `method_missing` (see Part 3).
Inspect: `C.ancestors`, `obj.method(:m).owner`, `.source_location`.

## Singleton classes & class methods (ch 13)

- A **singleton method** belongs to one object: `def obj.foo`. It lives in the
  object's hidden **singleton class** (metaclass/eigenclass), searched first (step 1).
- A **class method is a singleton method on the class object** — that's the whole
  story. `def self.count`, `class << self; def count; end; end`, and `extend Mod`
  all put methods in the class's singleton class.
- `class << self` is the idiom for several class methods at once and the clean way
  to make a class method `private`.

## Control flow (ch 6)

- `if/unless/while/until` (and their trailing-modifier forms); everything is an
  expression and returns a value. `case/when` uses `===` (threequal).
- Iterators via blocks: `each`, `times`, `upto`, `loop`. `yield`/`block_given?` in
  Part 3 / lesson 25.
- `case/in` **pattern matching** (Ruby 3.0+) — matches *shape* and destructures;
  see Part 2 / builtins-and-collections for the full treatment.
- Truthiness: only `false` and `nil` are falsy — `0` and `""` are truthy.
