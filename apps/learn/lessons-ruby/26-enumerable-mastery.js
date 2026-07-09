window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "enumerable-mastery",
  title: "Enumerable, Enumerator & Pattern Matching",
  emoji: "🔁",
  lang: "ruby",
  lessons: [
    {
      id: "enumerable-contract",
      title: "The Enumerable Contract",
      steps: [
        {
          type: "text",
          md: [
            "## One method in, fifty methods out",
            "`Enumerable` is the best deal in Ruby. Define **one** method — `each` — `include Enumerable`, and your class instantly gains `map`, `select`, `reject`, `find`, `sort_by`, `group_by`, `sum`, `min_by`, `count`, `to_a`, and ~40 more. All of them are implemented once, in the module, in terms of the `each` *you* wrote. This is the ancestor chain (module 24) paying off: `Enumerable` sits in your class's lookup path and every method drives your `each`.",
            "> In an interview, say: \"`Enumerable` is a mixin that builds ~50 collection methods on top of a single `each`. Any class that can iterate can `include Enumerable` and get the whole query vocabulary for free — that's how `Array`, `Hash`, `Range`, and ActiveRecord relations all share the same API.\"",
          ],
        },
        {
          type: "code",
          title: "playground/enumerable_roster.rb",
          source: String.raw`class Roster
  include Enumerable                  # <-- unlocks the whole toolkit

  def initialize(*walkers) = @walkers = walkers

  def each(&block)                    # <-- the ONE method you must supply
    @walkers.each(&block)
  end
end

roster = Roster.new(
  { name: "Priya", rating: 4.8 },
  { name: "Marco", rating: 4.2 },
  { name: "Ana",   rating: 4.9 },
)

p roster.map { |w| w[:name] }               # ["Priya", "Marco", "Ana"]
p roster.select { |w| w[:rating] > 4.5 }.size  # 2
p roster.max_by { |w| w[:rating] }[:name]   # "Ana"
p roster.sum { |w| w[:rating] }             # 13.9`,
          caption: "`Roster` only defines `each`. `map`, `select`, `max_by`, and `sum` all come from `Enumerable`, each one driving that `each` and layering its own block on top. This is exactly the shape of the mini-`each` you wrote in module 25 — now formalized.",
        },
        {
          type: "text",
          md: [
            "## Add `<=>` for the sorting methods",
            "`sort`, `min`, and `max` (the argument-less versions) need to compare *whole elements*, so they require your elements to define `<=>`. If your elements are custom objects, give them the `Comparable`/`<=>` treatment from module 24. For hashes or numbers you're already covered. This is why `include Comparable` and `include Enumerable` so often appear together on data-rich classes.",
          ],
        },
        {
          type: "quiz",
          q: "You `include Enumerable` in a class but forget to define `each`. What happens when you call `.map` on an instance?",
          choices: [
            "`NoMethodError` for `each` — every Enumerable method is built on `each`, so it's required",
            "`.map` returns an empty array because there's nothing to iterate",
            "It works but returns `nil`",
            "A compile-time error when the class is defined",
          ],
          answer: 0,
          explain: "`Enumerable`'s methods are all implemented by calling `each` internally. Without an `each`, `map` has nothing to drive and Ruby raises `NoMethodError` when it tries to call the missing `each`. The contract is explicit: `include Enumerable` promises the toolkit *in exchange for* you providing `each`.",
          nudge: "Every Enumerable method is built on top of one method you must supply. Which one?",
        },
        {
          type: "exercise",
          title: "Make a class Enumerable",
          prompt: [
            "This `Kennel` holds an array of dog names. Make it `Enumerable`: add `include Enumerable`, then define `each` that yields each name (delegate to `@dogs.each(&block)`).",
          ],
          starter: String.raw`class Kennel
  def initialize(*dogs) = @dogs = dogs

  # your code here
end

p Kennel.new("Mochi", "Rex").map(&:upcase)`,
          solution: String.raw`class Kennel
  include Enumerable

  def initialize(*dogs) = @dogs = dogs

  def each(&block)
    @dogs.each(&block)
  end
end

p Kennel.new("Mochi", "Rex").map(&:upcase)`,
          checks: [
            { re: /include Enumerable/, hint: "Mix in the module: `include Enumerable`." },
            { re: /def each\(&block\)/, hint: "Define `each` taking the block: `def each(&block)`." },
            { re: /@dogs\.each\(&block\)/, hint: "Delegate to the array: `@dogs.each(&block)`." },
          ],
          mustNot: [
            { re: /def map/, hint: "Don't define `map` yourself — `Enumerable` gives it to you once you provide `each`." },
          ],
          success: "`include Enumerable` + one `each` = the full collection toolkit on your own class. That's the single most leveraged three lines in Ruby.",
        },
      ],
    },
    {
      id: "beyond-map",
      title: "Beyond map: The Workhorses",
      steps: [
        {
          type: "text",
          md: [
            "## The methods that separate fluent Ruby from loops",
            "Everyone knows `map` and `select`. The senior vocabulary is the aggregation and grouping set — reaching for the right one turns a ten-line loop into one expressive line. This lesson is a tour of the ones that earn their keep in real analytics code.",
            "> In an interview, say: \"When I catch myself writing `each` with an accumulator outside the loop, that's a signal — the right method is usually `each_with_object`, `inject`, `group_by`, or `tally`. Naming the operation is clearer than hand-rolling the loop.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## inject / reduce vs each_with_object",
            "Both fold a collection into a single result. The difference is a common gotcha:",
            "- **`inject(:+)`** (a.k.a. `reduce`) — the block's *return value* becomes the next accumulator. Great for sums/products where the accumulator is a scalar.\n- **`each_with_object({})`** — the object is *fixed*; the block mutates it and its return value is ignored. Great when the accumulator is a hash or array you're filling, because you never have to remember to return it.",
            "```\n[1, 2, 3].inject(0) { |sum, n| sum + n }        # 6\nwalkers.each_with_object({}) { |w, h| h[w.id] = w }  # id => walker index\n```",
          ],
        },
        {
          type: "code",
          title: "playground/analytics.rb",
          source: String.raw`bookings = [
  { walker: "Priya", cents: 2400, status: :completed },
  { walker: "Marco", cents: 4800, status: :completed },
  { walker: "Priya", cents: 2400, status: :cancelled },
  { walker: "Ana",   cents: 2400, status: :completed },
]

# group_by: hash of key => matching elements
by_walker = bookings.group_by { |b| b[:walker] }
p by_walker.transform_values(&:size)   # {"Priya"=>2, "Marco"=>1, "Ana"=>1}

# partition: split into [matches, non-matches]
done, open = bookings.partition { |b| b[:status] == :completed }
p [done.size, open.size]               # [3, 1]

# tally: count occurrences (Ruby 2.7+)
p bookings.map { |b| b[:status] }.tally  # {completed: 3, cancelled: 1}

# sum with a block: total completed revenue
p done.sum { |b| b[:cents] }             # 9600`,
          caption: "Four one-liners that would each be a manual loop-with-accumulator in a lesser language: `group_by` (hash of buckets), `partition` (two-way split), `tally` (frequency count), `sum {}` (mapped total).",
        },
        {
          type: "text",
          md: [
            "## flat_map, each_slice, each_cons, chunk_while",
            "The shaping methods, for when structure matters:",
            "- **`flat_map`** — `map` then flatten one level. Turning each booking into several line items: `bookings.flat_map { |b| b.line_items }`.\n- **`each_slice(n)`** — fixed-size batches: `records.each_slice(500)` for bulk inserts.\n- **`each_cons(n)`** — sliding window of consecutive elements: `pings.each_cons(2)` to compute distance between successive GPS fixes.\n- **`chunk_while`** — group runs where a condition between neighbors holds.",
          ],
        },
        {
          type: "quiz",
          q: "You're building a hash of `walker_id => total_cents`. Which is the cleanest, least error-prone choice?",
          choices: [
            "`each_with_object(Hash.new(0)) { |b, h| h[b[:walker]] += b[:cents] }` — the accumulator is fixed, no need to return it",
            "`inject({}) { |h, b| h[b[:walker]] += b[:cents] }` — works identically with no gotcha",
            "`map { |b| b[:cents] }` — that already gives per-walker totals",
            "`select { |b| b[:cents] }` — filtering produces the sum",
          ],
          answer: 0,
          explain: "`each_with_object` is ideal when the accumulator is a container you mutate: the object is fixed across iterations and the block's return value is ignored, so you can't forget to return the hash. The `inject` version has a real bug — `h[k] += v` returns the *number*, not the hash, so the next iteration gets a number as its accumulator and crashes. That footgun is exactly why `each_with_object` exists.",
          nudge: "With `inject`, the block's return value becomes the next accumulator. What does `h[k] += v` return — the hash, or the number?",
        },
        {
          type: "exercise",
          title: "Count statuses with tally",
          prompt: [
            "Given an array of status symbols, produce a frequency hash like `{completed: 2, cancelled: 1}` using the single method built for this. (One method call, no block needed.)",
          ],
          starter: String.raw`statuses = [:completed, :cancelled, :completed]
counts = statuses  # your code here
p counts`,
          solution: String.raw`statuses = [:completed, :cancelled, :completed]
counts = statuses.tally
p counts`,
          checks: [
            { re: /statuses\.tally/, hint: "`tally` counts occurrences into a hash: `statuses.tally`." },
          ],
          mustNot: [
            { re: /group_by/, hint: "`group_by` would give you arrays of elements, not counts — `tally` is the direct tool here." },
            { re: /each_with_object/, hint: "You could hand-roll it, but `tally` does exactly this in one word. Use it." },
          ],
          success: "`tally` is the purpose-built frequency counter — `{completed: 2, cancelled: 1}` in one call. Reaching for it instead of a manual hash is the fluent move.",
        },
      ],
    },
    {
      id: "enumerators-and-lazy",
      title: "Enumerators & Lazy Evaluation",
      steps: [
        {
          type: "text",
          md: [
            "## A blockless iterator returns an Enumerator",
            "You saw it in module 25: call `each` (or `map`, `select`, …) *without* a block and you get back an **Enumerator** — an object that has captured \"how to iterate\" and can be driven later. This is why `arr.each.with_index` and `arr.map.with_index` work: the blockless call returns an Enumerator, and `with_index` chains onto it.",
            "> In an interview, say: \"Calling an iterator without a block returns an Enumerator — a paused, resumable iteration you can chain (`with_index`, `with_object`) or pull one-at-a-time with `next`. It decouples *how to iterate* from *what to do*.\"",
          ],
        },
        {
          type: "code",
          title: "playground/enumerators.rb",
          source: String.raw`walkers = ["Priya", "Marco", "Ana"]

# blockless => Enumerator, then chain with_index
walkers.each.with_index(1) { |w, i| puts "#{i}. #{w}" }
# 1. Priya / 2. Marco / 3. Ana

# external iteration: pull values by hand
e = walkers.each
puts e.next    # Priya
puts e.next    # Marco

# with_object threads an accumulator through
result = walkers.each_with_object([]) { |w, acc| acc << w.upcase }
p result       # ["PRIYA", "MARCO", "ANA"]`,
          caption: "`walkers.each` with no block is an Enumerator. `with_index(1)` numbers from 1; `.next` pulls values on demand (external iteration); `with_object` carries an accumulator. All three are Enumerator superpowers you don't get from a plain loop.",
        },
        {
          type: "text",
          md: [
            "## Lazy: process infinite or huge sequences without building them",
            "Chain `.lazy` and Enumerable stops being eager. Normally `map` builds a whole new array, then `select` builds another — wasteful on big or infinite sequences. A **lazy** enumerator pulls elements through the whole chain **one at a time**, only as many as you actually take:",
            "```\n(1..Float::INFINITY).lazy\n  .map  { |n| n * n }\n  .select { |n| n.even? }\n  .first(3)              # [4, 16, 36] — computed 6 numbers, not infinity\n```",
            "Without `.lazy` that would run forever. With it, only enough work happens to produce three results. Lazy is powered by Fibers (module 25) under the hood.",
          ],
        },
        {
          type: "text",
          md: [
            "## The Rails tie-in: find_each and in_batches",
            "This exact idea is why Rails has `find_each` and `in_batches`. `User.all.each` loads *every* row into memory at once — fine for 100 rows, a disaster for 10 million. `User.find_each { |u| ... }` pulls them in batches (default 1000), keeping memory flat. It's the database-scale version of lazy evaluation: never materialize the whole collection when you can stream it.",
            "> Red flag: `.all.each` over a large table. Say: \"For large result sets I use `find_each`/`in_batches` so I'm not loading the whole table into memory — same principle as `Enumerator::Lazy`, applied to the database.\"",
          ],
        },
        {
          type: "quiz",
          q: "`(1..Float::INFINITY).map { |n| n * 2 }.first(3)` hangs forever, but adding `.lazy` before `.map` returns `[2, 4, 6]` instantly. Why?",
          choices: [
            "Lazy pulls elements through the chain one at a time, stopping after 3 — eager `map` tries to build the whole (infinite) array first",
            "`.lazy` caps infinite ranges at 3 elements automatically",
            "`.lazy` makes `map` run on a background thread that times out",
            "`.lazy` converts the range to an array, which is faster",
          ],
          answer: 0,
          explain: "Eager `map` computes a result for *every* element before returning, so on an infinite range it never finishes. `.lazy` changes the evaluation model: each element is pulled through `map` (and any further steps) only when demanded, and `first(3)` demands exactly three — so only three doublings happen. Lazy trades whole-collection materialization for on-demand, element-at-a-time streaming.",
          nudge: "Eager `map` finishes the whole array before returning. What does lazy do differently about *when* each element is computed?",
        },
        {
          type: "exercise",
          title: "Take from an infinite sequence lazily",
          prompt: [
            "From the infinite range `1..Float::INFINITY`, get the first 3 multiples of 10 (`[10, 20, 30]`) **without** hanging. Insert `.lazy` before the chain, then `select` multiples of 10 and take `first(3)`.",
          ],
          starter: String.raw`result = (1..Float::INFINITY)
  # your code here — add .lazy, select multiples of 10, first(3)
p result`,
          solution: String.raw`result = (1..Float::INFINITY)
  .lazy
  .select { |n| n % 10 == 0 }
  .first(3)
p result`,
          checks: [
            { re: /\.lazy/, hint: "Make the chain lazy first: add `.lazy`." },
            { re: /select\{\|n\|n%10==0\}/, hint: "Keep multiples of 10: `.select { |n| n % 10 == 0 }`." },
            { re: /first\(3\)/, hint: "Pull just three: `.first(3)`." },
          ],
          mustNot: [
            { re: /\.map.*\.select.*\.to_a/s, hint: "Don't materialize with `to_a` on an infinite range — that hangs. Use `.lazy` and `first(3)`." },
          ],
          success: "`.lazy` streams elements one at a time, so `first(3)` stops after finding 10, 20, 30 — three results from an infinite sequence, instantly. This is `find_each` thinking in pure Ruby.",
        },
      ],
    },
    {
      id: "hashes-and-sets",
      title: "Hashes & Sets in Anger",
      steps: [
        {
          type: "text",
          md: [
            "## Reading hashes safely: fetch, dig, and defaults",
            "`hash[:missing]` returns `nil` silently — the source of countless `NoMethodError: undefined method for nil`. The senior toolkit reads defensively:",
            "- **`fetch(:key)`** — raises `KeyError` if absent (fail loud when the key is required), or `fetch(:key, default)` for a fallback.\n- **`dig(:a, :b, :c)`** — safely reach into nested hashes/arrays; returns `nil` at the first missing link instead of exploding. Perfect for parsing API payloads.\n- **`Hash.new(0)`** — a default value for missing keys, so `counts[:x] += 1` just works.",
            "> In an interview, say: \"I use `fetch` when a key is required so a missing one fails loudly at the source, and `dig` for nested payloads so one missing level returns nil instead of raising three calls deep. Silent `nil` from `[]` is how bugs travel far from their cause.\"",
          ],
        },
        {
          type: "code",
          title: "playground/hash_toolkit.rb",
          source: String.raw`payload = { data: { object: { amount: 2400, currency: "usd" } } }

# dig: safe nested access
p payload.dig(:data, :object, :amount)   # 2400
p payload.dig(:data, :missing, :amount)  # nil (no crash)

# fetch: loud when required
p payload.fetch(:data)                    # {...}
# payload.fetch(:nope)  =>  KeyError

# merge with a block resolves key collisions
totals   = { priya: 2400 }
incoming = { priya: 4800, marco: 2400 }
p totals.merge(incoming) { |_k, old, new| old + new }  # {priya: 7200, marco: 2400}

# transform_values / transform_keys reshape a hash
prices = { small: 2400, large: 4800 }
p prices.transform_values { |c| c / 100.0 }   # {small: 24.0, large: 48.0}`,
          caption: "`dig` for safe nested reads, `fetch` for required keys, `merge` with a block to combine on collision, `transform_values` to reshape — the four hash methods you'll use constantly parsing webhooks and building reports.",
        },
        {
          type: "text",
          md: [
            "## Set: the right tool for membership and dedup",
            "When you care about *\"is this in the collection?\"* or *\"unique items only\"*, an `Array` makes you write `include?` (which is O(n)) and `uniq`. A `Set` is built for it: O(1) membership, automatic dedup, and set algebra (`|` union, `&` intersection, `-` difference).",
            "```\nrequire \"set\"\nseen = Set.new\npings.each { |p| seen << p.walker_id }   # dedups as it goes\nseen.include?(42)                          # O(1) membership check\n```",
            "Reaching for `Set` instead of `array.include?` in a loop is a real performance answer: it turns an accidental O(n²) scan into O(n). (This connects to the hash contract from module 24 — a Set uses `hash`/`eql?` to dedupe.)",
          ],
        },
        {
          type: "quiz",
          q: "A webhook gives you `{ \"data\" => { \"object\" => { \"id\" => \"ch_123\" } } }`, but sometimes `object` is missing entirely. Which access is safest?",
          choices: [
            "`payload.dig(\"data\", \"object\", \"id\")` — returns nil at the first missing level instead of raising",
            "`payload[\"data\"][\"object\"][\"id\"]` — nil-safe by default",
            "`payload.fetch(\"data\").fetch(\"object\").fetch(\"id\")` — safest because it never raises",
            "`payload.values.last` — grabs the id directly",
          ],
          answer: 0,
          explain: "`dig` walks the path and returns `nil` the moment a level is missing — no crash. Chained `[]` would raise `NoMethodError` because `payload[\"data\"][\"object\"]` is `nil` and you can't call `[\"id\"]` on nil. Chained `fetch` is the *opposite* of safe here — it raises `KeyError` when `object` is missing, which is what you're trying to avoid. `dig` is purpose-built for uncertain nested payloads.",
          nudge: "Which method is designed to traverse nested structures and return nil (not raise) when a level is absent?",
        },
        {
          type: "exercise",
          title: "Safely dig into a payload",
          prompt: [
            "Extract the amount from a Stripe-style payload using `dig` so a missing level returns `nil` instead of crashing. The path is `:data` → `:object` → `:amount`.",
          ],
          starter: String.raw`payload = { data: { object: { amount: 2400 } } }
amount = payload  # your code here — use dig
p amount`,
          solution: String.raw`payload = { data: { object: { amount: 2400 } } }
amount = payload.dig(:data, :object, :amount)
p amount`,
          checks: [
            { re: /payload\.dig\(:data,:object,:amount\)/, hint: "Traverse safely: `payload.dig(:data, :object, :amount)`." },
          ],
          mustNot: [
            { re: /payload\[:data\]\[:object\]/, hint: "Chained `[]` crashes if a level is missing. Use `dig` for a nil-safe path." },
          ],
          success: "`dig` walks the whole path and returns nil at the first gap — the safe way to read nested webhook payloads. Next lesson: matching those payloads by shape with `case/in`.",
        },
      ],
    },
    {
      id: "pattern-matching",
      title: "Pattern Matching with case/in",
      steps: [
        {
          type: "text",
          md: [
            "## Not a switch statement — a structural matcher",
            "`case/in` (Ruby 3.0+) is one of the biggest additions to modern Ruby, and it's nothing like `case/when`. `case/when` asks \"does this value match?\"; `case/in` asks **\"does this data have this *shape*, and if so, bind these pieces to variables.\"** It destructures arrays and hashes, checks types, and extracts values — in one construct. It's tailor-made for parsing the webhook payloads from the last lesson.",
            "> In an interview, say: \"`case/in` is structural pattern matching — it matches the *shape* of data and destructures it in one step, binding parts to locals. It's how I'd parse a variable-shaped API payload instead of a pile of nested `if`/`dig` checks.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## Array and hash patterns",
            "Patterns mirror the literal syntax of the thing you're matching:",
            "- **Array pattern** — `in [first, *rest]` binds `first` and collects the rest.\n- **Hash pattern** — `in { status:, amount: }` matches a hash with those keys and binds `status`/`amount` to their values.\n- **Type + bind** — `in { amount: Integer => cents }` matches only if `amount` is an `Integer`, and binds it to `cents`.\n- **Guard** — `in { amount: Integer => c } if c > 1000` adds an arbitrary condition.",
            "An unmatched `case/in` raises `NoMatchingPatternError` — use a bare `else` (or `in _`) to handle the fallthrough.",
          ],
        },
        {
          type: "code",
          title: "playground/webhook_router.rb",
          source: String.raw`def handle(event)
  case event
  in { type: "charge.succeeded", data: { amount: Integer => cents } }
    "charged #{cents} cents"
  in { type: "charge.refunded", data: { amount: Integer => cents } }
    "refunded #{cents} cents"
  in { type: String => other }
    "ignoring #{other}"
  else
    "malformed event"
  end
end

puts handle({ type: "charge.succeeded", data: { amount: 2400 } })  # charged 2400 cents
puts handle({ type: "invoice.paid", data: {} })                    # ignoring invoice.paid
puts handle([1, 2, 3])                                             # malformed event`,
          caption: "One `case/in` routes a Stripe-style webhook by matching its *shape*: it checks the `type`, reaches into nested `data`, verifies `amount` is an Integer, and binds it to `cents` — replacing a thicket of `if`/`dig`/`is_a?`. This is the payoff of the last lesson's `dig` example.",
        },
        {
          type: "text",
          md: [
            "## The find pattern and the pin operator",
            "Two more tools worth knowing:",
            "- **Find pattern** — `in [*, { status: :failed } => bad, *]` searches an array for the first element matching a sub-pattern (note the splats on *both* sides).\n- **Pin `^`** — normally an identifier in a pattern *binds* a new variable; `^existing` instead matches against the *value* of an existing variable: `expected = 2400; case h; in { amount: ^expected }`.",
            "For your own objects to participate, define `deconstruct` (returns an array for array patterns) and `deconstruct_keys(keys)` (returns a hash for hash patterns). That's how a custom class becomes matchable — the same protocol ActiveRecord-adjacent objects use.",
          ],
        },
        {
          type: "quiz",
          q: "Why is `case event; in { type: \"charge.succeeded\", amount: Integer => c }` better than `if event[:type] == \"charge.succeeded\" && event[:amount].is_a?(Integer)`?",
          choices: [
            "It checks shape, type, AND binds `c` in one construct — and fails cleanly on malformed input instead of nil-chaining",
            "It runs faster because pattern matching is compiled to machine code",
            "It's identical; `case/in` is just alternate syntax with no real advantage",
            "It automatically retries the webhook on a mismatch",
          ],
          answer: 0,
          explain: "`case/in` collapses three concerns — key presence, type check, and value binding — into one readable pattern, and an unmatched shape routes to `else` rather than silently producing `nil` that blows up later. The `if` version re-reads the hash multiple times, doesn't bind the value, and grows unreadable as the payload nests. Structural matching is both safer and clearer for variable-shaped data.",
          nudge: "Count what the `case/in` line does at once: presence check, type check, and variable binding. How many statements is that the other way?",
        },
        {
          type: "exercise",
          title: "Route a payload by shape",
          prompt: [
            "Complete the `in` pattern so it matches a hash with `type: \"charge.succeeded\"` and a nested integer amount, binding the amount to `cents`. Match `{ type: \"charge.succeeded\", data: { amount: <Integer> } }` and bind `cents`.",
          ],
          starter: String.raw`event = { type: "charge.succeeded", data: { amount: 2400 } }
case event
in # your pattern here
  puts "charged #{cents} cents"
else
  puts "ignored"
end`,
          solution: String.raw`event = { type: "charge.succeeded", data: { amount: 2400 } }
case event
in { type: "charge.succeeded", data: { amount: Integer => cents } }
  puts "charged #{cents} cents"
else
  puts "ignored"
end`,
          checks: [
            { re: /in\{type:"charge\.succeeded"/, hint: "Start the pattern by matching the type: `in { type: \"charge.succeeded\", ... }`." },
            { re: /data:\{amount:Integer=>cents\}/, hint: "Match the nested integer and bind it: `data: { amount: Integer => cents }`." },
          ],
          mustNot: [
            { re: /event\[:data\]\[:amount\]/, hint: "Don't fall back to `[]` access — the whole point is to destructure with the `in` pattern." },
            { re: /when /, hint: "Use `in` (structural match), not `when` (value match) — this is `case/in`." },
          ],
          success: "`in { type: ..., data: { amount: Integer => cents } }` matches shape, checks type, and binds `cents` in one line. That's structural pattern matching doing the work of a dozen conditionals.",
        },
      ],
    },
    {
      id: "regexp-that-earns-its-keep",
      title: "Regexp That Earns Its Keep (Capstone)",
      steps: [
        {
          type: "text",
          md: [
            "## Match, don't extract, when you only need a yes/no",
            "Regular expressions in Ruby are objects (`/.../ ` is a `Regexp` literal). The first senior habit: use the right method for the job. To test *whether* something matches, use **`match?`** — it returns a plain boolean and skips the expensive capture-group machinery and the `$~` globals. Reserve `match`/`=~` for when you actually need the captured pieces.",
            "> In an interview, say: \"I use `match?` for boolean checks — it's faster and has no side effects on the `$~` globals. I only reach for `match` or named captures when I need to *extract* data, not just confirm a match.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## Named captures beat numbered ones",
            "When you *do* extract, name your groups — `(?<year>\\d{4})` — so you read `m[:year]` instead of the position-counting `m[1]`. Named captures are self-documenting and survive someone reordering the pattern:",
            "```\nm = \"2026-07-08\".match(/(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/)\nm[:year]   # \"2026\"\nm[:month]  # \"07\"\n```",
            "This is exactly the mechanism Rails routing uses to pull `:id` out of a URL path — named captures over a path pattern.",
          ],
        },
        {
          type: "code",
          title: "playground/gps_log.rb",
          source: String.raw`log = <<~LOG
  2026-07-08T10:00Z walker=42 lat=37.7749 lng=-122.4194
  2026-07-08T10:01Z walker=42 lat=37.7750 lng=-122.4195
  malformed line, skip me
LOG

pattern = /walker=(?<id>\d+) lat=(?<lat>[-\d.]+) lng=(?<lng>[-\d.]+)/

fixes = log.each_line.filter_map do |line|
  next unless line.match?(pattern)        # match? for the yes/no gate
  m = line.match(pattern)                 # match for extraction
  { walker: m[:id].to_i, lat: m[:lat].to_f, lng: m[:lng].to_f }
end

p fixes.size          # 2 (malformed line skipped)
p fixes.first         # {walker: 42, lat: 37.7749, lng: -122.4194}`,
          caption: "The two-method split in action: `match?` gates each line cheaply, `match` with named captures extracts the fields only from lines that pass. `filter_map` (map + compact in one) drops the malformed line. Real log-parsing shape.",
        },
        {
          type: "text",
          md: [
            "## scan, gsub with a block, and the Rails tie-in",
            "Two more high-value patterns:",
            "- **`scan`** — return *all* matches as an array: `text.scan(/#\\w+/)` for every hashtag.\n- **`gsub` with a block** — transform each match with code, not just a replacement string: `s.gsub(/\\d+/) { |n| (n.to_i * 2).to_s }`.",
            "And the Rails tie: `validates :booking_code, format: { with: /\\A[A-Z]{3}-\\d{4}\\z/ }`. Note `\\A` and `\\z` (start/end of *string*), **not** `^`/`$` (start/end of *line*). Using `^`/`$` in a format validation is a classic security bug — a multiline input can smuggle a valid line past a `$` anchor.",
            "> Red flag: `format: { with: /^...$/ }` in a validation. Say: \"Anchor with `\\A...\\z`, not `^...$` — `$` matches end-of-line, so multiline input can bypass it. `\\z` is end-of-string.\"",
          ],
        },
        {
          type: "quiz",
          q: "A model has `validates :code, format: { with: /^[A-Z]{3}\\d{4}$/ }`. Why is this a bug, and what's the fix?",
          choices: [
            "`^`/`$` match line boundaries, so `\"ABC1234\\nhacked\"` passes; anchor with `\\A...\\z` for string boundaries",
            "It's not a bug — `^`/`$` and `\\A`/`\\z` are interchangeable in Ruby",
            "The character class is wrong; it should use `\\d` outside brackets",
            "`format:` isn't a real validation option; use `matches:`",
          ],
          answer: 0,
          explain: "In Ruby, `^` and `$` match the start/end of a *line*, not the whole string. So a value like `\"ABC1234\\nmalicious\"` has a first line that satisfies the pattern and passes validation, even though the full string is not a valid code. `\\A` (start of string) and `\\z` (end of string) anchor the *entire* input, closing the hole. This is a well-known Rails security gotcha.",
          nudge: "What do `^` and `$` anchor to — the whole string, or each line? What could a newline in the input do?",
        },
        {
          type: "exercise",
          title: "Validate a booking code safely",
          prompt: [
            "Write a `Regexp` literal named `pattern` that matches a booking code of exactly three uppercase letters, a hyphen, then four digits (e.g. `\"ABC-1234\"`) — anchored to the **whole string** with `\\A` and `\\z` (not `^`/`$`). Then test it with `match?`.",
          ],
          starter: String.raw`pattern = # your regexp here
p pattern.match?("ABC-1234")   # should be true`,
          solution: String.raw`pattern = /\A[A-Z]{3}-\d{4}\z/
p pattern.match?("ABC-1234")`,
          checks: [
            { re: /\/\\A/, hint: "Anchor the start with `\\A`: begin the regexp `/\\A...`." },
            { re: /\[A-Z\]\{3\}-\\d\{4\}/, hint: "Three uppercase letters, hyphen, four digits: `[A-Z]{3}-\\d{4}`." },
            { re: /\\z\//, hint: "Anchor the end with `\\z` (end of string): `...\\z/`." },
            { re: /\.match\?\(/, hint: "Test with the boolean method: `pattern.match?(\"ABC-1234\")`." },
          ],
          mustNot: [
            { re: /\/\^/, hint: "Don't anchor with `^` — it matches line start. Use `\\A` for string start." },
            { re: /\$\//, hint: "Don't anchor with `$` — it matches line end, a security hole. Use `\\z` for string end." },
          ],
          success: "`/\\A[A-Z]{3}-\\d{4}\\z/` with `match?` is a safe, self-documenting validator — string-anchored, no `^`/`$` bypass. That caps the module: Enumerable, Enumerator, pattern matching, and regexp are the query-and-parse layer senior Rubyists reach for daily. Next: metaprogramming and how Rails builds its magic (module 27).",
        },
      ],
    },
  ],
});
