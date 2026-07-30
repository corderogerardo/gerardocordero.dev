# Part 2 — Built-in Classes & Collections (ch 7–12)

Built-in essentials, strings/symbols, Array/Hash/Set, Enumerable/Enumerator,
regexp, file/IO. Ruby 3.4.

## Built-in essentials (ch 7)

### Three kinds of equality
- `equal?` — **identity** (same object). Never override.
- `==` — **value equality** ("same thing?"). Override for value objects.
- `eql?` — the **Hash-key** equality, paired with `hash`.

### The hash contract (silent-bug source)
`Hash`/`Set` find a key by `hash` (bucket) then confirm with `eql?`. So two objects
that should be the same key need **both** the same `hash` **and** `eql?` true.
Overriding `==` alone → duplicate keys / a Set that won't dedupe. Override all three:
```ruby
def ==(o) = o.is_a?(Money) && cents == o.cents
alias eql? ==
def hash = cents.hash
```

### <=> and Comparable
Define `<=>` (returns -1/0/1) + `include Comparable` → get `< <= == > >= between?
clamp` free.

### Copies
- `dup` — shallow copy; does **not** copy frozen state or singleton methods.
- `clone` — shallow copy that **does** copy frozen state + singleton methods.
- `freeze` — immutable; mutation raises `FrozenError`. Both copies are shallow —
  nested objects are shared. `# frozen_string_literal: true` magic comment is common.

### Conversion: strict vs lenient
`Integer("3")` raises on junk; `"3abc".to_i` → `3` (lenient). `Array(x)` wraps
non-arrays. Bang methods (`sort!`) mutate + may return `nil`; `?` methods return bool.

## Strings & symbols (ch 8)

- Interpolation `"#{expr}"` (double-quoted / heredocs only). Symbols `:name` are
  **immutable, interned identifiers** — same symbol is the same object; use for hash
  keys, method names, states. Frozen string literals are near-symbol-cheap in 3.x.
- Heredocs: `<<~LOG ... LOG` (squiggly strips leading indentation).

## Arrays (ch 9)

- Literals `[…]`, `%w[a b]` (word array), `%i[a b]` (symbol array).
- Access: `a[0]`, `a[-1]`, `a[1, 2]` (start,len), `a[1..3]`, `a.dig(0, :k)`.
- Add/remove: `push/<<`, `pop`, `shift`, `unshift`; `first/last(n)`.

## Hashes (ch 9)

- Read defensively: `fetch(:k)` (raises `KeyError` if required), `fetch(:k, default)`,
  `dig(:a, :b)` (nil-safe nested), `Hash.new(0)` (default for `counts[:x] += 1`).
- Combine: `merge(other) { |k, old, new| … }` resolves collisions. Reshape:
  `transform_values`, `transform_keys`, `slice`, `except`.
- Ruby 3.4 inspect format: `{name: "x"}` (not `{:name=>"x"}`) — match this in captions.

## Set (ch 9)

`require "set"`. Use for membership/dedup: O(1) `include?` (vs O(n) on Array),
auto-dedup, set algebra `| & -`. Turns an accidental O(n²) `array.include?`-in-a-loop
into O(n). Uses the `hash`/`eql?` contract above.

## Enumerable & Enumerator (ch 10)

- **Contract:** define `each`, `include Enumerable` → ~50 methods (`map select reject
  find sort_by group_by sum min_by count …`), each built on your `each`. Argument-less
  `sort/min/max` also need element `<=>`.
- **Workhorses (senior vocabulary):**
  - fold to a container: `each_with_object({}) { |x, h| … }` (object fixed) — prefer
    over `inject` when accumulating into a hash/array (`inject`'s block *return*
    becomes the next accumulator, so `h[k] += v` breaks it by returning the number).
  - fold to a scalar: `inject(:+)` / `reduce`.
  - `group_by` (hash of buckets), `partition` (`[matches, rest]`), `tally` (frequency
    hash), `sum { }`, `flat_map`, `each_slice(n)`, `each_cons(n)`, `chunk_while`,
    `filter_map` (map + compact).
- **Enumerator:** a blockless iterator call (`arr.each`) returns one — chain
  `with_index(1)`, `with_object`, or pull with `.next` (external iteration).
- **Lazy:** `.lazy` pulls elements one-at-a-time through the chain, computing only
  what's demanded — works on infinite/huge sequences: `(1..Float::INFINITY).lazy
  .select { … }.first(3)`. In-memory sibling of Rails `find_each`/`in_batches`.

## Pattern matching — case/in (ch 6, used constantly here)

Structural match + destructure + bind, in one construct (Ruby 3.0+). Not `case/when`.
```ruby
case event
in { type: "charge.succeeded", data: { amount: Integer => cents } }
  cents                       # matched shape+type, bound cents
in { type: String => other }
  ...
else                          # unmatched raises NoMatchingPatternError without this
  ...
end
```
- Array pattern `in [first, *rest]`; hash pattern `in { k: }`; type+bind
  `in { a: Integer => n }`; guard `in [...] if cond`; find pattern `in [*, x, *]`;
  pin `^existing` matches a variable's value (vs binding a new one).
- Custom objects opt in via `deconstruct` (array patterns) / `deconstruct_keys(keys)`
  (hash patterns).

## Regexp (ch 11)

- `/…/` is a `Regexp` object. **`match?`** for boolean tests (fast, no `$~` side
  effects); `match`/`=~` when you need captures.
- **Named captures** `(?<year>\d{4})` → `m[:year]` (self-documenting; Rails routing
  uses this to pull `:id`). `scan` (all matches), `gsub(/…/) { |m| … }` (block replace).
- **Anchors (security):** `\A` start-of-string, `\z` end-of-string. `^`/`$` are
  **line** anchors — `format: { with: /^…$/ }` in a validation is bypassable via a
  newline in the input. Always `\A…\z` for whole-string validation.

## File & I/O (ch 12)

- `File.open(path, "r") { |f| … }` (block form auto-closes). `File.read/readlines`,
  `IO#each_line`, `puts/print/p` (`p` uses `inspect` and returns its arg).
- In Rails, prefer `Rails.root.join("…")` over string paths.
