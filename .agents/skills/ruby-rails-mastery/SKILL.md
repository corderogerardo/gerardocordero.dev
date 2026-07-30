---
name: ruby-rails-mastery
description: Deep Ruby & Rails reference distilled from "The Well-Grounded Rubyist, 4th Ed." (Ruby 3.4) plus this repo's Rails 8.1 backend (apps/pawwalk-api). Use whenever writing, reviewing, teaching, or debugging Ruby or Rails — lessons in apps/learn/lessons-ruby, the pawwalk-api app, Ruby study/prep content, or any .rb code — to keep it accurate, idiomatic, and free of the classic gotchas. Covers the object model (self, scope, method lookup, singleton classes), blocks/procs/lambdas & closures, Enumerable/Enumerator/pattern matching/regexp, metaprogramming, and Rails 8 conventions. NOT for NestJS/Node (nest-prep) or non-Ruby languages.
---

# Ruby & Rails Mastery

Ground every Ruby/Rails artifact in this repo — lesson content, prep cards, and
real `apps/pawwalk-api` code — in accurate, idiomatic Ruby 3.4 / Rails 8.1. This
skill is the **reference** form of the material; the **tutorial** form lives in
`apps/learn/lessons-ruby/24…27` (object model, blocks/procs/lambdas, Enumerable &
pattern matching, metaprogramming). Source: *The Well-Grounded Rubyist, 4th Ed.*
(Black & Leo). Repo Ruby is **3.4.10** via mise; the book targets Ruby 3.4+.

When authoring or reviewing **content**, also load `senior-coach-content` for the
voice (why-first, `Red flag:`, quotable "In an interview, say:" lines). This skill
supplies the *substance*; that one supplies the *style*.

## When to use / not

- **Use** for any `.rb` code, `apps/learn/lessons-ruby/*`, Ruby/Rails prep or study
  content, `apps/pawwalk-api`, or answering a Ruby/Rails question.
- **Don't** use for `apps/nest-prep` (NestJS/TypeScript), or non-Ruby languages —
  those have their own skills.

## The five mental models (say these; everything else follows)

1. **Everything is `receiver.message(args)`.** No functions, only methods; `2 + 3`
   sends `+` to `2`. Fields/properties don't exist — a dot always calls a method.
2. **`self` is the current default receiver.** Any bare call goes to `self`. In a
   class body `self` is the class (so `validates :x` is a method call on the class);
   in an instance method it's the instance.
3. **Method lookup walks the ancestor chain.** `Klass.ancestors` is the literal,
   ordered search list: singleton class → prepended modules → class → included
   modules → superclass → … → `BasicObject`. `super` continues from the current hit.
4. **Blocks/procs/lambdas are the callable spectrum.** Block = syntax; proc =
   block-as-object (a closure); lambda = a strict proc (method-like arity + `return`).
5. **Rails is Ruby, not magic.** `has_many`, `validates`, `enum`, `scope` are class
   methods that run at class-definition time and use `define_method`/hooks. Anything
   "magic" resolves to the four models above — prove it with `method(:x).source_location`.

## Top gotchas (the ones that actually bite)

| Symptom / trap | Reality | Do |
|---|---|---|
| "keyword args are just a trailing hash" | Ruby 3 split them — distinct calling conventions | `**opts` captures keywords; a real hash needs `{}` or `**` |
| a setter "doesn't set" | bare `x = v` in a method makes a **local** | write `self.x = v` (the one place `self.` is mandatory) |
| `obj.priv` fails but you expected access | `private` = **no explicit receiver**, not "same class" | use `protected` for same-class explicit-receiver comparison |
| a stored `proc` `return` blows up the method | proc `return` exits the **defining method**; lambda `return` is local | store **lambdas** (`->`); Rails scopes/conditions are lambdas on purpose |
| `map(&:x)` can't take args | `&:sym` == `{ \|o\| o.sym }`, one no-arg call | full block for anything with arguments/chaining |
| custom object dupes in a Hash/Set | overriding `==` without `hash`/`eql?` | override all three; equal objects must share `hash` |
| `method_missing` but `respond_to?` lies | the two are a **contract** | always add `respond_to_missing?`; `super` for unknowns |
| `format: { with: /^...$/ }` bypassable | `^`/`$` are **line** anchors | anchor with `\A…\z` (string anchors) |
| `Model.all.each` on a big table | loads every row into memory | `find_each` / `in_batches` (DB-scale lazy) |
| `records.each { \|r\| r.assoc }` slow | N+1 queries | `includes(:assoc)`; verify with the query log / `strict_loading` |
| `send(params[:x])` | `send` bypasses private/protected | `public_send` + an allowlist |

## Idiom cheat-sheet

- Aggregate into a container: **`each_with_object({})`** (object fixed) — not
  `inject` (block return becomes the accumulator; `h[k] += v` returns the *number*).
- Frequency count: **`tally`**. Group into buckets: **`group_by`**. Two-way split:
  **`partition`**. Safe nested read: **`dig`**. Required key: **`fetch`**.
- One `each` + `include Enumerable` = ~50 methods free. Add `<=>` + `include
  Comparable` = the full comparison suite from one method.
- Blockless iterator → **Enumerator** (chain `with_index`/`with_object`, or `.lazy`
  for infinite/huge sequences). `.lazy` is the in-memory sibling of `find_each`.
- Structural parsing: **`case/in`** (matches shape + type, binds vars) over nested
  `if`/`dig`. Boolean regex: **`match?`** (no `$~` side effects); extract with named
  captures `(?<name>…)` → `m[:name]`.
- Generate methods from data: **`define_method`** (a closure; sees loop vars — `def`
  can't). Add class methods on include: the **`included(base)` + `base.extend`** hook.

## Reference files (load the one you need)

- [foundations-and-object-model.md](references/foundations-and-object-model.md) —
  Part 1 (ch 1–6): objects, methods, arguments, classes, modules, `self`, scope
  gates, visibility, method lookup, singleton classes, control flow.
- [builtins-and-collections.md](references/builtins-and-collections.md) — Part 2
  (ch 7–12): built-in essentials (`==`/`eql?`/`hash`, dup/clone/freeze,
  `<=>`/Comparable), strings/symbols, Array/Hash/Set, Enumerable/Enumerator/lazy,
  regexp, file/IO.
- [dynamism-and-metaprogramming.md](references/dynamism-and-metaprogramming.md) —
  Part 3 (ch 13–16): object individuation, callable objects (proc vs lambda deep
  dive), callbacks/hooks, introspection, `method_missing`, functional style
  (composition, `curry`).
- [rails8-and-pawwalk.md](references/rails8-and-pawwalk.md) — Rails 8.1 conventions
  grounded in `apps/pawwalk-api`: the Solid trifecta, `enum`/`scope`/associations as
  metaprogramming, validations, callbacks, strong params, N+1, caching, security.

## Authoring rules for `lessons-ruby` (if writing lessons)

Real, running Ruby 3.4+ only; execute samples/solutions before shipping (repo Ruby:
`~/.local/share/mise/installs/ruby/3.4.10/bin/ruby`). Follow
`apps/learn/lessons-ruby/FORMAT-RUBY.md` — notably **no bare `#` inside checked
string literals** (the normalizer eats the line), escape `\?`/pipes/`#\{` in check
regexes, and `lang: "ruby"` on every module. Validate: `node tools/validate.mjs
lessons-ruby`.
