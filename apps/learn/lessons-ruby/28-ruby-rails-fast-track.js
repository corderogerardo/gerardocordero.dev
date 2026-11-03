window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "ruby-rails-fast-track",
  title: "Ruby & Rails Fast Track",
  emoji: "⚡",
  lang: "ruby",
  lessons: [
    {
      id: "the-20-percent",
      title: "The 20 Percent That Carries the Language",
      steps: [
        {
          type: "text",
          md: [
            "## Twenty percent of the language, all of the reading",
            "You don't need all of Ruby to be effective in a Rails codebase. You need the handful of shapes that appear in nearly every file, and the confidence to read the rest on demand instead of memorizing it.",
            "Here is the honest short list:",
            "- **Callables:** blocks, procs and lambdas — the one mechanism behind every DSL you'll meet.\n- **Symbols vs strings:** the role split that explains half the silent bugs in an API.\n- **`nil` handling:** the other half.\n- **Three reducers:** `each_with_object`, `tally`, `group_by` — they replace almost every accumulator loop you would write by hand.",
            "This module is built for one outcome: you open a file in `apps/pawwalk-api` and can say what each line *costs* and why it is there. The drills at the end are the practice reps.",
            "> In an interview, say: \"I don't try to memorize Rails. Four things carry it — the callable spectrum, the symbol/string split, nil-safe reads, and three container reducers. Everything else is a variation I can look up.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## The callable spectrum — one idea, three shapes",
            "Ruby has a single callback mechanism and three ways to hold it. The differences are behavioral, not cosmetic:",
            "- A **block** is syntax, not an object. `bookings.map { |b| b.price_cents }` attaches it to one method call, and that method decides whether to `yield`. You cannot name it, store it, or pass it on unchanged.\n- A **proc** is that block captured as an object — `Proc.new { ... }`, or any `&block` parameter. Its arity is loose: missing arguments arrive as `nil`, extras are silently dropped. Its `return` returns from the method where the proc was *created*.\n- A **lambda** is a proc with method semantics — `->(b) { ... }`. Its arity is strict: the argument count is enforced like a real call. Its `return` returns only from the lambda.",
            "Why this matters outside a quiz: a stored proc whose body says `return` raises `LocalJumpError` the moment the defining method has already returned. That is the bug that turns a callback that works in `rails console` into a 2am page. Lambdas cannot do that to you — which is why `scope` asks for a callable and the idiomatic answer is always a lambda.",
            "Red flag: answering \"procs and lambdas are basically the same thing.\" They differ in arity and in what `return` does. Both differences change behavior in production, and an interviewer asking this question is listening for precisely those two words.",
          ],
        },
        {
          type: "code",
          title: "playground/callables.rb",
          source: String.raw`late = Proc.new { |name| "hi #{name}" }
strict = ->(name) { "hi #{name}" }

p late.call              # "hi " — the missing name arrives as nil, no complaint
begin
  strict.call            # ArgumentError: wrong number of arguments (given 0, expected 1)
rescue ArgumentError => error
  p error.class
end

def with_proc
  early = Proc.new { return "from proc" }
  early.call
  "never reached"
end

def with_lambda
  early = -> { return "from lambda" }
  early.call
  "reached"
end

p with_proc
p with_lambda`,
          caption: "Run it: `\"hi \"`, `ArgumentError`, `\"from proc\"`, `\"reached\"`. The proc accepted a missing argument and its `return` exited `with_proc` before the last line ran. The lambda refused the same call and its `return` stayed local.",
        },
        {
          type: "text",
          md: [
            "## Symbols and strings — a role split, not a style choice",
            "Use a **string** for text a human reads, or bytes that arrived from outside your program: a walker's name, an email, a JSON body. Use a **symbol** for an internal label your own code compares against: `:pending`, `:walker`, a hash key you typed yourself.",
            "That is the whole rule. What makes it matter is that they are different types, and `==` never crosses the line — `:pending == \"pending\"` is `false`, forever, silently.",
            "Here is the production version of that bug. `apps/pawwalk-api` stores status as a string, and `enum` maps names onto those strings: `enum :status, { pending: \"pending\", ... }`. So `booking.status` hands you a **String**. Comparing it to a symbol compiles, runs, and is always false:",
            "```\nif booking.status == :cancelled   # never true: String compared to Symbol\n```",
            "The fix is not to scatter `== \"cancelled\"` through the codebase — it is to ask the model. `enum` generated `booking.cancelled?` for exactly this reason, and it reads better at the call site anyway.",
            "Red flag: writing `booking.status == :pending` in an interview. It looks like Rails, it is a type error, and nothing warns you. Say `booking.pending?`.",
          ],
        },
        {
          type: "text",
          md: [
            "## `nil` — three reads, three different answers",
            "Ruby gives you three ways to read a value that might be missing, and they fail differently. Pick by what a missing value *means* at that spot:",
            "- **`hash[:missing]` gives `nil`.** Correct when `nil` is a legitimate answer.\n- **`hash.fetch(:key)` raises `KeyError`.** Correct when the key is required — a missing one is a bug, not a case. `fetch(:key, 0)` gives you a default instead.\n- **`hash.dig(:dog, :name)` gives `nil` if any key in the chain is missing.** Made for nested JSON.",
            "`dig` is nil-safe about *missing keys*, not about wrong types. If `hash[:dog]` happens to be the string `\"Mochi\"`, `dig(:dog, :name)` raises `TypeError`, because a String has no `dig`. Safe navigation has the same shape of caveat: `booking&.walker&.name` needs a `&.` on *every* hop that can be nil — one plain dot anywhere in the chain brings the crash back.",
            "The production version of good `nil` handling is boring on purpose. From `BookingsController#paginate` in the real app:",
            "```\npage = params[:page].to_i.clamp(1, Float::INFINITY).to_i\n```",
            "A missing param becomes `0`, `clamp` lifts it to `1`, and nobody writes a three-branch `nil?` check. Done well, nil handling looks like arithmetic rather than like `if`.",
            "Red flag: `params[:page] ? params[:page].to_i : 1`. It is not wrong, it is just three concepts where one coercion and one `clamp` express the same intent with no branch to test.",
          ],
        },
        {
          type: "code",
          title: "playground/walk_report.rb",
          source: String.raw`bookings = [
  { walker: "Priya", status: "completed", price_cents: 2400, dog: { name: "Mochi" } },
  { walker: "Priya", status: "completed", price_cents: 2400, dog: { name: "Rex" } },
  { walker: "Sam",   status: "cancelled", price_cents: 3000, dog: { name: "Nori" } },
  { walker: "Sam",   status: "completed", price_cents: 3000, dog: { name: "Kobe" } }
]

status_mix = bookings.map { |booking| booking[:status] }.tally

revenue = bookings
            .select { |booking| booking[:status] == "completed" }
            .each_with_object(Hash.new(0)) { |booking, totals| totals[booking[:walker]] += booking[:price_cents] }

dog_names = bookings.map { |booking| booking.dig(:dog, :name) }
buckets   = bookings.group_by { |booking| booking[:status] }

p status_mix
p revenue
p dog_names
p buckets.keys`,
          caption: "The four lines an admin dashboard is actually made of: `tally` for the status mix, `each_with_object` for revenue per walker, `dig` for a nested read, `group_by` for the buckets. No accumulator loop anywhere.",
        },
        {
          type: "quiz",
          q: "`late = Proc.new { |name| name }` and `strict = ->(name) { name }`. You call `late.call` and then `strict.call`, both with zero arguments. What happens?",
          choices: [
            "`late.call` returns `nil`; `strict.call` raises `ArgumentError` — a lambda enforces arity, a proc does not",
            "Both return `nil` — the missing argument is filled in either way",
            "Both raise `ArgumentError` — arity is enforced for any callable",
            "`late.call` raises `ArgumentError`; `strict.call` returns `nil`",
          ],
          answer: 0,
          explain: "A proc has loose arity: it is a block captured as an object, and blocks tolerate missing arguments (they arrive as `nil`). A lambda behaves like a method and enforces the argument count, so `strict.call` raises `ArgumentError: wrong number of arguments (given 0, expected 1)`. The same split applies to `return`: proc returns from the defining method, lambda returns from itself.",
          nudge: "One of these two is a block in object form, and blocks have never complained about a missing argument. Which one?",
        },
        {
          type: "exercise",
          title: "Revenue per walker, with a defaulted hash",
          prompt: [
            "`revenue_by_walker(bookings)` returns `{ walker_name => total_cents }` for **completed** bookings only — the number the walker payout screen shows.",
            "- `bookings` is an array of hashes: `{ walker: \"Priya\", status: \"completed\", price_cents: 2400 }`.\n- Only `status == \"completed\"` counts. Cancellations and pending money are not revenue.\n- A walker with no completed bookings must be **absent**, not present with `0`.",
            "Write it as one chain: `select` the completed rows, then `each_with_object(Hash.new(0))` that adds each `price_cents` into `totals[booking[:walker]]`.",
            "Sample: Priya with two completed 2400 bookings, and Sam with one completed 3000 plus one cancelled 3000, must produce `{ \"Priya\" => 4800, \"Sam\" => 3000 }`. The cancelled money is not revenue.",
            "Why the `Hash.new(0)` matters: on a plain `{}`, `totals[key] += 1` reads `nil + 1` and raises `NoMethodError`. The zero default turns \"missing key\" into `0` without an `||=` guard on every line.",
          ],
          starter: String.raw`def revenue_by_walker(bookings)
  # your code here
end

sample = [
  { walker: "Priya", status: "completed", price_cents: 2400 },
  { walker: "Priya", status: "completed", price_cents: 2400 },
  { walker: "Sam", status: "cancelled", price_cents: 3000 },
  { walker: "Sam", status: "completed", price_cents: 3000 }
]

p revenue_by_walker(sample)`,
          solution: String.raw`def revenue_by_walker(bookings)
  bookings
    .select { |booking| booking[:status] == "completed" }
    .each_with_object(Hash.new(0)) { |booking, totals| totals[booking[:walker]] += booking[:price_cents] }
end

sample = [
  { walker: "Priya", status: "completed", price_cents: 2400 },
  { walker: "Priya", status: "completed", price_cents: 2400 },
  { walker: "Sam", status: "cancelled", price_cents: 3000 },
  { walker: "Sam", status: "completed", price_cents: 3000 }
]

p revenue_by_walker(sample)`,
          checks: [
            { re: /def revenue_by_walker\(bookings\)/, hint: "Keep the exact signature: `def revenue_by_walker(bookings)`." },
            { re: /\.select\{\|\w+\|\w+\[:status\]=="completed"\}/, hint: "Filter the completed rows first: `.select { |booking| booking[:status] == \"completed\" }`." },
            { re: /\.each_with_object\(Hash\.new\(0\)\)/, hint: "Accumulate into a defaulted hash: `.each_with_object(Hash.new(0))` — a plain `{}` raises on the first `+=`." },
            { re: /\w+\[:walker\]\]\+=\w+\[:price_cents\]/, hint: "Inside the block, add the money into the walker's slot: `totals[booking[:walker]] += booking[:price_cents]`." },
          ],
          mustNot: [
            { re: /\.each do\|\w+\|/, hint: "No `each` with an accumulator declared outside the loop — `each_with_object` exists so the accumulator can't be forgotten." },
          ],
          success: "That is the exact shape of a payout aggregate: filter, then accumulate into a defaulted hash. `Hash.new(0)` is the reason this never touches `nil`.",
        },
      ],
    },
    {
      id: "rails-is-ruby",
      title: "Rails as Ruby, Not Magic",
      steps: [
        {
          type: "text",
          md: [
            "## The class body is Ruby, running once",
            "Every DSL line in a Rails model is a **method call executed while the class body is evaluated** — at boot, not per request and not per instance. That one fact explains `has_many`, `validates`, `scope`, `before_save` and `enum`: all of them are class methods, and `self` inside the class body is the class itself.",
            "Which means you can prove it instead of trusting it. In a console:",
            "```\nBooking.instance_method(:confirmed?).source_location\n```",
            "It does **not** point at `app/models/booking.rb`. It points at the `define_method` call inside Rails that generated the predicate — because `enum :status, { ... }` looped over that hash and defined one method per status. Your model never wrote `confirmed?`; a loop did, at load time. `source_location` is how you find the line that actually produced the behavior you're debugging, whether that line is yours or the framework's.",
            "> In an interview, say: \"Rails isn't magic, it's Ruby running at class-definition time. `has_many` and `enum` are class methods that generate methods with `define_method`, so I can point `source_location` at the line that defined whatever I'm debugging.\"",
            "Red flag: calling it \"Rails magic.\" It tells the interviewer you stop at the DSL — that you would debug a callback by guessing instead of reading `Booking.instance_method(:confirmed?).source_location`.",
          ],
        },
        {
          type: "text",
          md: [
            "## `has_many :bookings` — one class method, three consequences",
            "Read `belongs_to :walker, counter_cache: true, touch: true` from the real `Booking` model as what it literally is: a call to the class method `belongs_to`, with a symbol and an options hash. At that moment Rails does three things:",
            "1. It **generates instance methods** — `walker`, `walker=`, `build_walker`, `walker_id` — with `define_method`, closing over `:walker`.\n2. It **stores configuration** the runtime reads later: the foreign key (`walker_id`), the class name (`Walker`), `counter_cache: true`, `touch: true`.\n3. It **wires callbacks**: `counter_cache` bumps `walkers.bookings_count` on insert and delete; `touch` bumps `walkers.updated_at` on every save.",
            "That third point is load-bearing somewhere else in the app. `WalkersController#index` serves cacheable responses with `fresh_when(etag: walkers, last_modified: walkers.maximum(:updated_at))`. That cache is only correct because `touch: true` moves the parent timestamp whenever a booking changes. Delete `touch` and the walker index serves stale data — with no error anywhere to warn you.",
            "And note the same `has_many :bookings` appears on both `User` and `Walker`. Same method, different foreign key, because the key is inferred from the class that declared it (`user_id` vs `walker_id`). That inference *is* the API.",
          ],
        },
        {
          type: "code",
          title: "playground/rails_is_ruby.rb",
          source: String.raw`class Walker
  # has_many :bookings, minus the database
  def self.has_many_bookings
    define_method(:bookings) { @bookings ||= [] }
  end
  has_many_bookings

  # scope :in_city, ->(city) { ... }, minus ActiveRecord::Relation
  def self.scope(name, body)
    define_singleton_method(name) { |*args| body.call(*args) }
  end
  scope :in_city, ->(city) { "WHERE lower(city) = '#{city.downcase}'" }
end

p Walker.instance_method(:bookings).owner
p Walker.singleton_class.instance_methods(false).sort
p Walker.method(:in_city).call("Austin")
p Walker.new.bookings`,
          caption: "Eleven lines that reproduce both DSLs: a class method that `define_method`s an instance method, and a `scope` helper that `define_singleton_method`s a class method. Output: `Walker`, then `[:has_many_bookings, :in_city, :scope]`, then the WHERE clause, then `[]`. `Walker.method(:in_city).arity` is `-1` because the helper splats — the real `scope` splats for the same reason, forwarding the arguments to the lambda, and the lambda is what enforces arity.",
        },
        {
          type: "text",
          md: [
            "## `scope` — a lambda wearing a class method's clothes",
            "Those two lines from the real models:",
            "```\nscope :upcoming, -> { where(starts_at: Time.current..).where.not(status: :cancelled) }\nscope :for_walker, ->(walker) { where(walker: walker) }\n```",
            "`scope` is `define_singleton_method` with two guarantees bolted on.",
            "**Guarantee one: a scope always returns a relation**, so it composes. `walker.bookings.upcoming.order(:starts_at)` works because each link hands back something chainable. A plain class method can return anything — a number, a hash, `nil` — and the chain breaks the moment someone returns the wrong thing. That is the distinction interviewers listen for: scopes are query fragments you intend to chain; class methods are for everything else.",
            "**Guarantee two: strict arity**, inherited from the lambda. `scope :for_walker, ->(walker)` fails loudly when called with no argument. A proc-based version would quietly pass `nil` into the `WHERE` and return an empty set — a bug that looks like \"this walker has no bookings\" instead of \"you forgot an argument.\"",
            "Red flag: a scope that limits instead of filtering — `scope :recent, -> { order(created_at: :desc).limit(5) }`. That `limit` survives into `count` and into `merge`, so `Booking.recent.count` returns 5 no matter how many rows exist. Keep scopes to filters and ordering; put `limit` at the call site where you can see it.",
          ],
        },
        {
          type: "text",
          md: [
            "## Callbacks are stored callables, and *when* they run is the point",
            "```\nbefore_save :normalize_city                    # a Symbol: late-bound, Rails sends it to the instance\nbefore_save -> { self.city = city.strip }      # a lambda: called with the instance\n```",
            "Both land in one ordered chain that `ActiveSupport::Callbacks` runs around the write. A symbol is late-bound (`send`); a lambda is a closure. That is the entire difference in *how* they are stored.",
            "The difference that bites is *when* they run:",
            "- `before_save` and `after_save` run **inside the transaction**, before it commits.\n- `after_create` also runs inside the transaction — a later rollback undoes the row but not whatever your callback already did.\n- `after_create_commit` runs **after the commit**. The real `Booking` uses it to push a new booking onto the admin live feed, precisely so a booking that rolls back is never broadcast.",
            "Red flag: an external side effect in `before_save` — a Stripe charge, an email, a webhook. It runs inside the transaction, can run twice on retry, and cannot be rolled back. PawWalk keeps exactly this split: `Booking#compute_price!` (a pure rule) stays in the model, while `Stripe::PaymentIntent.create` lives in `PaymentsController`, outside the write path.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/bookings_controller.rb",
          source: String.raw`class BookingsController < ApplicationController
  before_action :require_owner_role!, only: %i[index show create cancel]

  def show
    # Scoped through current_user.bookings so a stranger's booking 404s instead of 403 —
    # a 403 would confirm the booking exists, a 404 doesn't leak that.
    booking = current_user.bookings.find(params[:id])

    render json: booking_payload(booking)
  end

  private

  def require_owner_role!
    return if current_user.owner?

    render json: { error: "This action is for pet owners" }, status: :forbidden
  end

  def owned_booking
    current_user.bookings.find(params[:id])
  end
end`,
          caption: "Verbatim from the app, comments included — they explain the design better than a paraphrase would. Two guards, two different jobs: a role check that answers 403, and a scope that answers 404.",
        },
        {
          type: "text",
          md: [
            "## Authorization: guard the role, scope the record",
            "Read those two guards as a pair, because that pairing is the whole pattern.",
            "`before_action :require_owner_role!, only: ...` is a class method call that stores a filter; at request time Rails `send`s it on the controller instance, before the action. It answers \"is this account the right *kind* of account?\" — a 403.",
            "`current_user.bookings.find(params[:id])` answers \"is this *record* yours?\" and the answer is a 404, because `.find` raises `RecordNotFound` on a row that isn't in the scope. A 403 would confirm the booking exists. A 404 leaks nothing.",
            "That is the sentence worth memorizing: **scoping is authorization, not just filtering.** If every read goes through `current_user.bookings`, there is no code path where a stranger's row is even reachable.",
            "> In an interview, say: \"I authorize in two layers — a filter for role, and a scope for ownership. The scope turns a cross-tenant read into a 404 instead of a 403, so a probe can't confirm which ids exist.\"",
            "## When a service object earns its place",
            "The honest trade-off, in three beats. **(a)** Fat models are a real cost: callbacks and cross-model logic accumulate until the model owns everything and every test needs a database. **(b)** But the alternative isn't free either — a `app/services/` directory where every operation is a porcelain class with a `call` leaves two places that know the pricing rule, and now a bug can live in either. **(c)** So: keep the *invariant* in the model and push only the *I/O* out.",
            "That is literally what this app does. `compute_price!` and `transition_as_walker!` are model methods because they are invariants — price is derived, transitions are legal only from certain statuses. The Stripe call sits in `PaymentsController` because it is I/O that must not happen inside a transaction. A service object starts earning its keep when the same operation has two entry points (HTTP plus a background job), or when it is a multi-step protocol with a compensation step.",
            "The Rails Doctrine counterpoint is worth saying out loud: Rails is omakase — the default is a rich `ActiveRecord` model plus concerns, and the framework is designed around that. Reach for a service when the default stops fitting, not preemptively because a blog post said fat models are bad.",
            "Red flag: `app/services/` containing thirty classes that each wrap one model call — `BookingCreator.call(...)` around `Booking.create(...)`. That is indirection with no invariant to protect: more files, same logic, one more place for the call to be forgotten.",
          ],
        },
        {
          type: "quiz",
          q: "`class Booking < ApplicationRecord; has_many :bookings; end` — when does the code inside `has_many` actually run?",
          choices: [
            "Once, while the class body is evaluated at boot — it is a class method that defines instance methods",
            "On every request, the first time a `Booking` instance is created",
            "Every time you call `booking.bookings` on an instance",
            "Lazily, the first time the `bookings` table is queried",
          ],
          answer: 0,
          explain: "A class body is ordinary Ruby that executes once, when the file is loaded. Inside it, `self` is the class, so `has_many :bookings` is a method call on `Booking` — which is why it can generate `#bookings` with `define_method` right there and then. Per-request work happens in the generated methods, not in the declaration.",
          nudge: "Ask who `self` is inside a class body, and when a class body executes.",
        },
        {
          type: "exercise",
          title: "Write the guard and the scoped finder",
          prompt: [
            "The `show` action below finds a booking by id with no role check and no ownership scope — any signed-in user can read any booking. Fix both, in the shape the real controller uses.",
            "1. Add the filter at the top of the class: `before_action :require_owner_role!, only: %i[show]`.\n2. Scope the lookup through the current user: `current_user.bookings.find(params[:id])`.\n3. Define the private guard: `return if current_user.owner?`, otherwise render `{ error: \"This action is for pet owners\" }` with `status: :forbidden`.",
            "Why the private method and not an inline `if`: the filter runs before the action, so the action stays a three-line read of what it does. That is the \"thin controller\" shape the rest of this app follows.",
          ],
          starter: String.raw`class BookingsController < ApplicationController
  # your code here

  def show
    booking = Booking.find(params[:id])

    render json: booking_payload(booking)
  end

  # your code here
end`,
          solution: String.raw`class BookingsController < ApplicationController
  before_action :require_owner_role!, only: %i[show]

  def show
    booking = current_user.bookings.find(params[:id])

    render json: booking_payload(booking)
  end

  private

  def require_owner_role!
    return if current_user.owner?

    render json: { error: "This action is for pet owners" }, status: :forbidden
  end
end`,
          checks: [
            { re: /before_action:require_owner_role!,(only:%i\[show\]|only::show)/, hint: "Register the filter before the action: `before_action :require_owner_role!, only: %i[show]`." },
            { re: /current_user\.bookings\.find\(params\[:id\]\)/, hint: "Scope the lookup to the signed-in user's bookings: `current_user.bookings.find(params[:id])` — a foreign id then 404s instead of leaking." },
            { re: /return if current_user\.owner\?/, hint: "The guard bails out early for owners: `return if current_user.owner?`." },
            { re: /status::forbidden/, hint: "Everyone else gets 403: `render json: { error: ... }, status: :forbidden`." },
          ],
          mustNot: [
            { re: /Booking\.find\(params\[:id\]\)/, hint: "Unscoped `Booking.find` is the defect — it can reach any user's row. Go through `current_user.bookings`." },
          ],
          success: "Role guard plus ownership scope — 403 for the wrong kind of account, 404 for someone else's booking. That is the authorization pattern the rest of the API uses.",
        },
      ],
    },
    {
      id: "drills-data-shaping",
      title: "Drills: Data Shaping",
      steps: [
        {
          type: "text",
          md: [
            "## Drills, not exercises",
            "These three are shaped like LeetCode: a signature, sample data, an exact expected output. The only difference is that each one is a query you will write next month for a real dashboard.",
            "Every drill is solvable with one of three reducers. If you can produce all three from memory, the data-shaping half of a Ruby interview is done:",
            "- **`tally`** — frequency count. `bookings.map { |b| b[:status] }.tally` gives `{\"completed\" => 3}`.\n- **`group_by`** — buckets. `bookings.group_by { |b| b[:walker] }` gives `{\"Priya\" => [...]}`, then `transform_values` turns each bucket into a number.\n- **`each_with_object(hash)`** — one accumulator, fixed across the block. Start it from `Hash.new(0)` and missing keys read as zero.",
            "> In an interview, say: \"When I catch myself writing `each` with a variable declared outside the loop, that's my signal. The operation usually has a name — `tally`, `group_by`, `each_with_object` — and naming it is shorter and harder to get wrong.\"",
            "One rule across all three: no `each` with an outside accumulator. The checks below forbid it, and so will the next person who has to read your code.",
          ],
        },
        {
          type: "exercise",
          title: "Drill 1: frequency count with a fixed key set",
          prompt: [
            "`status_counts(bookings)` returns a hash with **all five** statuses as keys, in this order — `pending`, `confirmed`, `in_progress`, `completed`, `cancelled` — and integer counts as values.",
            "A status that never appears must come back as `0`, not be missing: the admin chart draws a fixed axis, and a missing key shifts every bar left.",
            "Sample: statuses `completed`, `confirmed`, `completed`, `cancelled` must produce `{ \"pending\" => 0, \"confirmed\" => 1, \"in_progress\" => 0, \"completed\" => 2, \"cancelled\" => 1 }`.",
            "Two things the loop below gets wrong. `counts[booking[:status]] += 1` on a plain `{}` reads `nil + 1` and raises `NoMethodError` on the very first row. And even with a zero default it can only report statuses that actually occurred.",
            "Write it in two steps: tally the statuses in one pass with `tally`, then build the full key set from `STATUSES` with `to_h`, reading each count through `fetch(status, 0)`.",
            "Why `fetch` and not `counted[status] || 0`: they agree here because the values are integers. `fetch` says what you mean — \"this key may be absent, use this default\" — and keeps working the day a value can legitimately be `false`.",
          ],
          starter: String.raw`STATUSES = %w[pending confirmed in_progress completed cancelled]

def status_counts(bookings)
  counts = {}
  bookings.each do |booking|
    counts[booking[:status]] += 1
  end

  counts
end

sample = [
  { status: "completed" },
  { status: "confirmed" },
  { status: "completed" },
  { status: "cancelled" }
]

p status_counts(sample)`,
          solution: String.raw`STATUSES = %w[pending confirmed in_progress completed cancelled]

def status_counts(bookings)
  counted = bookings.map { |booking| booking[:status] }.tally

  STATUSES.to_h { |status| [status, counted.fetch(status, 0)] }
end

sample = [
  { status: "completed" },
  { status: "confirmed" },
  { status: "completed" },
  { status: "cancelled" }
]

p status_counts(sample)`,
          checks: [
            { re: /def status_counts\(bookings\)/, hint: "Keep the exact signature: `def status_counts(bookings)`." },
            { re: /\.map\{\|\w+\|\w+\[:status\]\}\.tally/, hint: "Count in one pass by mapping to the status first: `bookings.map { |booking| booking[:status] }.tally`." },
            { re: /\.to_h\{/, hint: "Build the fixed key set in one call: `STATUSES.to_h { |status| [...] }` — not `map { }.to_h`." },
            { re: /\.fetch\(\w+,0\)/, hint: "Read the count with an explicit default: `counted.fetch(status, 0)`." },
          ],
          mustNot: [
            { re: /\[:status\]\]\+=1/, hint: "`counts[key] += 1` on a plain `{}` raises on the first row — there is no zero to add to. That is the defect you are removing." },
          ],
          success: "Two lines: one pass to count, one to shape. Every key present, in a fixed order, and no `nil` arithmetic possible.",
        },
        {
          type: "text",
          md: [
            "## Buckets into numbers",
            "`group_by` on its own gives you a hash of arrays — useful, but not what a dashboard renders. The second half of the pattern is always `transform_values`:",
            "```\nbookings.group_by { |b| b[:starts_at].strftime(\"%Y-%m-%d\") }.transform_values { |day| day.sum { |b| b[:price_cents] } }\n```",
            "Read it as three sentences: group the rows by day, turn each group into its total, done. `sum { }` takes a block, so you never need `map` followed by `sum`.",
            "The key detail is `strftime(\"%Y-%m-%d\")` rather than the `Time` itself. Two bookings at 09:00 and 14:00 are different `Time` objects — as hash keys they would form different buckets, and in JSON they would serialize as full timestamps. A date string is the bucket a dashboard actually wants.",
            "Which rows get counted is a separate decision, and getting it wrong is a real bug rather than a style nit. Cancelled money in a revenue total is the kind of defect a customer finds before you do.",
          ],
        },
        {
          type: "exercise",
          title: "Drill 2: group and aggregate",
          prompt: [
            "`daily_totals(bookings)` groups bookings by the calendar day they start and returns `{ \"2026-11-02\" => 4800, \"2026-11-03\" => 3000 }` — a `%Y-%m-%d` string key mapped to the summed `price_cents` of that day.",
            "Sample: `2400` on 2026-11-02 at 09:00, `2400` on 2026-11-02 at 14:00, `3000` (cancelled) on 2026-11-03 at 09:00, `3000` (completed) on 2026-11-03 at 10:00.",
            "The version below works and is wrong: it counts the cancelled booking, so 2026-11-03 reads `6000` instead of `3000`. Fix the filter, and rewrite the loop as a pipeline — `reject` out the cancelled rows, `group_by` the day, `transform_values` each bucket into a number with `sum`.",
            "Two things worth knowing while you write it. The bucket key must be `booking[:starts_at].strftime(\"%Y-%m-%d\")`, not the `Time` — otherwise 09:00 and 14:00 land in different buckets. And `sum { |booking| booking[:price_cents] }` replaces `map` plus `sum` with one method.",
          ],
          starter: String.raw`def daily_totals(bookings)
  totals = {}
  bookings.each do |booking|
    day = booking[:starts_at].strftime("%Y-%m-%d")
    totals[day] = (totals[day] || 0) + booking[:price_cents]
  end

  totals
end

sample = [
  { status: "completed", price_cents: 2400, starts_at: Time.new(2026, 11, 2, 9, 0) },
  { status: "confirmed", price_cents: 2400, starts_at: Time.new(2026, 11, 2, 14, 0) },
  { status: "cancelled", price_cents: 3000, starts_at: Time.new(2026, 11, 3, 9, 0) },
  { status: "completed", price_cents: 3000, starts_at: Time.new(2026, 11, 3, 10, 0) }
]

p daily_totals(sample)`,
          solution: String.raw`def daily_totals(bookings)
  bookings
    .reject { |booking| booking[:status] == "cancelled" }
    .group_by { |booking| booking[:starts_at].strftime("%Y-%m-%d") }
    .transform_values { |day| day.sum { |booking| booking[:price_cents] } }
end

sample = [
  { status: "completed", price_cents: 2400, starts_at: Time.new(2026, 11, 2, 9, 0) },
  { status: "confirmed", price_cents: 2400, starts_at: Time.new(2026, 11, 2, 14, 0) },
  { status: "cancelled", price_cents: 3000, starts_at: Time.new(2026, 11, 3, 9, 0) },
  { status: "completed", price_cents: 3000, starts_at: Time.new(2026, 11, 3, 10, 0) }
]

p daily_totals(sample)`,
          checks: [
            { re: /def daily_totals\(bookings\)/, hint: "Keep the exact signature: `def daily_totals(bookings)`." },
            { re: /\[:status\]=="cancelled"/, hint: "Drop the cancelled rows before grouping: `reject { |booking| booking[:status] == \"cancelled\" }`." },
            { re: /\.group_by\{\|\w+\|\w+\[:starts_at\]\.strftime\("%Y-%m-%d"\)\}/, hint: "Bucket by the date string: `.group_by { |booking| booking[:starts_at].strftime(\"%Y-%m-%d\") }`." },
            { re: /\.transform_values\{/, hint: "Turn each bucket into a number with `.transform_values { |day| ... }`." },
            { re: /\.sum\{\|\w+\|\w+\[:price_cents\]\}/, hint: "Sum the money inside each bucket: `day.sum { |booking| booking[:price_cents] }`." },
          ],
          mustNot: [
            { re: /\.each do\|\w+\|/, hint: "The `each` loop is what this drill removes — `group_by` plus `transform_values` says the same thing with no accumulator to initialize." },
          ],
          success: "One pipeline: filter, bucket, total. The cancelled money is gone and the shape is the same one you would write for a chart endpoint.",
        },
        {
          type: "text",
          md: [
            "## Ranking, and why ties are a production bug",
            "Sorting by one key is the easy half. The half that separates a working leaderboard from a correct one is the **tie-break**:",
            "```\nwalkers.sort_by { |w| [ -w[:bookings_count], w[:name] ] }.first(10)\n```",
            "Two ideas in one line. A **two-element array key** sorts by the first element, then the second — count descending, then name ascending. And **negating** the count is how you sort descending without `.reverse`, which would also reverse the tie order you were trying to fix.",
            "Why anyone should care: `ORDER BY bookings_count DESC LIMIT 10` has no defined order for ties. The database may return Sam before Ana on one query and Ana before Sam on the next. Paginate that and one walker appears on two pages while another never appears at all. Any ranked list that gets sliced needs a deterministic secondary key.",
            "Red flag: calling a single-key `ORDER BY ... DESC LIMIT n` a leaderboard. With ties it is not deterministic, and a non-deterministic rank is a bug report waiting for a busy week.",
          ],
        },
        {
          type: "exercise",
          title: "Drill 3: top N with a deterministic tie-break",
          prompt: [
            "`top_walkers(walkers, n)` ranks by `bookings_count` descending, breaks ties by `name` ascending, and returns at most `n` hashes.",
            "Sample: `[Priya 20, Sam 12, Ana 12, Kai 3]` with `n = 2` must produce `[Priya 20, Ana 12]`. Ana comes before Sam on a tie, because the name decides.",
            "The starter uses `max_by(n)`, which returns the top n with no secondary key — run it and you get `[Priya, Sam]`. Ties come back in whatever order the collection had, and the collection's order changes with the query plan.",
            "Write it as one `sort_by` whose key is a two-element array: the negated count, then the name. `first(n)` then slices the deterministic order.",
            "Why negation instead of `.reverse`: reversing an ascending sort also reverses ties, so ties end up in descending-name order — still arbitrary, just differently wrong. Negating the number keeps every secondary key ascending.",
          ],
          starter: String.raw`def top_walkers(walkers, n)
  walkers.max_by(n) { |walker| walker[:bookings_count] }
end

sample = [
  { name: "Priya", bookings_count: 20 },
  { name: "Sam", bookings_count: 12 },
  { name: "Ana", bookings_count: 12 },
  { name: "Kai", bookings_count: 3 }
]

p top_walkers(sample, 2)`,
          solution: String.raw`def top_walkers(walkers, n)
  walkers
    .sort_by { |walker| [ -walker[:bookings_count], walker[:name] ] }
    .first(n)
end

sample = [
  { name: "Priya", bookings_count: 20 },
  { name: "Sam", bookings_count: 12 },
  { name: "Ana", bookings_count: 12 },
  { name: "Kai", bookings_count: 3 }
]

p top_walkers(sample, 2)`,
          checks: [
            { re: /def top_walkers\(walkers,n\)/, hint: "Keep the exact signature: `def top_walkers(walkers, n)`." },
            { re: /sort_by\{\|\w+\|\[-\w+\[:bookings_count\],\w+\[:name\]\]\}/, hint: "Sort by a two-element key: `sort_by { |walker| [-walker[:bookings_count], walker[:name]] }`." },
            { re: /\.(?:first|take)\(n\)/, hint: "Slice the top n off the sorted list: `.first(n)`." },
          ],
          mustNot: [
            { re: /max_by/, hint: "`max_by(n)` has no tie-break — that is the defect. A two-element `sort_by` key forces a deterministic order." },
            { re: /\.reverse/, hint: "`.reverse` flips the tie order you just fixed. Negate the count instead." },
          ],
          success: "Deterministic ranking: count descending, name ascending, ties resolved. Same page 1 and page 2 every time — which is the only kind of leaderboard that survives pagination.",
        },
      ],
    },
    {
      id: "drills-read-a-controller",
      title: "Drills: Read a Real Controller",
      steps: [
        {
          type: "text",
          md: [
            "## Three defects, one controller",
            "Almost every production bug in a JSON API is one of three things: the client can write fields it shouldn't, the render path runs a query per row, or the status code lies about what happened. You can read a controller and find all three in under a minute.",
            "1. **Params** — what is the client allowed to set? Anything not explicitly permitted should not be permitted at all. Money and status are server decisions.\n2. **Queries** — how many SQL statements run for one response? If a payload touches an association, one per row is the default.\n3. **Status codes** — does the code match the outcome? 201 for a create, 422 for a rejected body, 404 for a record that isn't yours. 200 for everything is a client-side bug factory.",
            "Each drill gives you a small action in the shape `apps/pawwalk-api` uses, with one defect. Read the action first, say out loud which of the three it is, then fix it.",
            "> In an interview, say: \"On an API review I check params, queries, and status codes in that order. Permissive params and N+1s are the two that reach production; a wrong status code is what makes a client retry forever.\"",
            "Red flag: `render json: booking` or `render json: user`. It serializes every column — including `password_digest` on `users` — and instantly couples your database schema to your public wire format. Every response in this app is a hand-built payload hash for exactly that reason.",
          ],
        },
        {
          type: "exercise",
          title: "Drill 1: close the mass-assignment hole",
          prompt: [
            "The action below hands `params[:booking]` — a raw `ActionController::Parameters` — straight to `build`. Rails raises `ActiveModel::ForbiddenAttributesError` the moment an unpermitted hash reaches mass assignment, so every create request 500s.",
            "Fix it the way the real controller does: build from a `booking_params` method that permits exactly the four fields a client legitimately chooses — `walker_id`, `dog_id`, `starts_at`, `duration_min`.",
            "Why the list is short: `price_cents` and `status` are server decisions. `compute_price!` derives the price from the walker's rate, and the status comes from the transition methods. Those two columns must never be writable from a request body.",
            "Why not `permit!`: it turns the allowlist off for the whole params object, which is how a client ends up setting `status: \"completed\"` or `price_cents: 1`.",
            "The API posts a flat body, so `params.permit(...)` is correct here — no `require(:booking)`. The private `require_owner_role!` guard is already defined; read it before you write anything, because it is the other half of this action's security.",
          ],
          starter: String.raw`class BookingsController < ApplicationController
  before_action :require_owner_role!, only: %i[create]

  def create
    booking = current_user.bookings.build(params[:booking])
    booking.compute_price! # the price is derived from the walker's rate, never from the client
    booking.save!

    render json: booking_payload(booking), status: :created
  end

  private

  def require_owner_role!
    return if current_user.owner?

    render json: { error: "This action is for pet owners" }, status: :forbidden
  end

  # your code here
end`,
          solution: String.raw`class BookingsController < ApplicationController
  before_action :require_owner_role!, only: %i[create]

  def create
    booking = current_user.bookings.build(booking_params)
    booking.compute_price!
    booking.save!

    render json: booking_payload(booking), status: :created
  end

  private

  def require_owner_role!
    return if current_user.owner?

    render json: { error: "This action is for pet owners" }, status: :forbidden
  end

  def booking_params
    params.permit(:walker_id, :dog_id, :starts_at, :duration_min)
  end
end`,
          checks: [
            { re: /build\(booking_params\)/, hint: "Mass-assign from the allowlist, not from raw params: `current_user.bookings.build(booking_params)`." },
            { re: /def booking_params/, hint: "Define the private allowlist method: `def booking_params`." },
            { re: /params\.permit\(:walker_id,:dog_id,:starts_at,:duration_min\)/, hint: "Permit exactly the four client-chosen fields: `params.permit(:walker_id, :dog_id, :starts_at, :duration_min)`. No `price_cents`, no `status`." },
          ],
          mustNot: [
            { re: /params\[:booking\]/, hint: "Passing raw `params[:booking]` is the defect — an unpermitted hash raises `ForbiddenAttributesError`." },
            { re: /permit!/, hint: "`permit!` disables the allowlist entirely. Name the four fields instead." },
            { re: /permit\(:price_cents/, hint: "Never permit `price_cents` — `compute_price!` derives it. A client that can send money can send `1`." },
          ],
          success: "Explicit allowlist, money still derived server-side. This is the same four-field permit list the real `BookingsController` ships with.",
        },
        {
          type: "text",
          md: [
            "## Defect two: the query inside the loop",
            "`includes(:dog)` is the fix; why it works matters more than the syntax. `includes` is a *preload* instruction: Rails issues one extra `SELECT` for the dogs of all the bookings it just loaded, and after that `booking.dog` reads from memory instead of from the database.",
            "The near-misses that do not fix it:",
            "- **`joins(:dog)`** filters with an SQL `JOIN` but does not load the association. `booking.dog.name` still issues a query per row — the N+1 survives and the diff looks like a fix in code review.\n- **`find_each`** batches by primary key and *ignores* your `order`. It is for backfills over millions of rows, not for an action that renders twenty.",
            "Verify instead of trusting. Watch the log for a repeated `Dog Load` per booking, or enable `strict_loading` in development and let Rails raise on the first lazy load. The skill is not remembering `includes`; it is knowing how to prove the N+1 is gone.",
          ],
        },
        {
          type: "exercise",
          title: "Drill 2: kill the N+1 in the index",
          prompt: [
            "`booking_payload` reads `booking.dog.name` for every row. This `index` loads the bookings but not their dogs, so a 20-booking page runs 1 query for bookings plus 20 for dogs.",
            "Fix it by preloading the association: `current_user.bookings.includes(:dog).order(starts_at: :asc)`.",
            "Keep the existing status filter and the `order` — they are correct. And keep `.map` on the outside: adding `includes` changes when the dogs load, not how the payload is built.",
            "Two tempting non-fixes, both of which fail the checks below. `joins(:dog)` filters with an SQL join but leaves the association unloaded, so the per-row queries remain. `find_each` ignores the `order` you just set and is meant for backfills, not responses.",
          ],
          starter: String.raw`class BookingsController < ApplicationController
  def index
    bookings = current_user.bookings.order(starts_at: :asc)
    bookings = bookings.where(status: params[:status]) if params[:status].present?

    render json: bookings.map { |booking| booking_payload(booking) }
  end

  private

  def booking_payload(booking)
    {
      id: booking.id.to_s,
      dog_name: booking.dog.name,
      start_time: booking.starts_at,
      status: booking.status,
      price_cents: booking.price_cents
    }
  end
end`,
          solution: String.raw`class BookingsController < ApplicationController
  def index
    bookings = current_user.bookings.includes(:dog).order(starts_at: :asc)
    bookings = bookings.where(status: params[:status]) if params[:status].present?

    render json: bookings.map { |booking| booking_payload(booking) }
  end

  private

  def booking_payload(booking)
    {
      id: booking.id.to_s,
      dog_name: booking.dog.name,
      start_time: booking.starts_at,
      status: booking.status,
      price_cents: booking.price_cents
    }
  end
end`,
          checks: [
            { re: /current_user\.bookings\.includes\(:dog\)/, hint: "Preload the association on the relation: `current_user.bookings.includes(:dog)`." },
            { re: /\.order\(starts_at::asc\)/, hint: "Keep the existing ordering — `includes` does not replace it: `.order(starts_at: :asc)`." },
          ],
          mustNot: [
            { re: /\.joins\(:dog\)/, hint: "`joins` filters with a SQL join but does not load the association — `booking.dog` still queries once per row. Preload with `includes`." },
            { re: /find_each/, hint: "`find_each` ignores your `order` and is built for backfills. A render path needs the loaded relation, not batches." },
          ],
          success: "Two queries per page instead of twenty-one, and the shape of the action is unchanged. That is the fix a reviewer can check at a glance.",
        },
        {
          type: "text",
          md: [
            "## Defect three: the status code that lies",
            "`render json: booking_payload(booking)` with no `status:` is a **200**. For a create that is wrong twice: 200 says \"I found the thing you asked for\", and a client that distinguishes created from updated cannot tell what happened.",
            "Two codes cover this action, and both appear in the real controller:",
            "- **`status: :created`** — 201, the success branch of a create.\n- **`status: :unprocessable_content`** — 422, the validation-failure branch, with `errors.full_messages` in the body so the client can highlight a field.",
            "Note the branch condition too: `if booking.save`, not `booking.save!`. In this app both paths end at 422 with the same body — `ApplicationController` rescue_froms `RecordInvalid` — but the explicit branch keeps the failure visible where the decision is made, instead of depending on a global rescue three files away.",
            "Red flag: `status: :ok` on every render with the real outcome buried in the JSON body. Mobile clients branch on status codes, so a 200 containing `{ \"error\": ... }` is a bug in their error handling — and a bug you caused.",
          ],
        },
        {
          type: "exercise",
          title: "Drill 3: make the status codes tell the truth",
          prompt: [
            "This `create` works, and lies about it: both branches render a 200, so a client cannot tell a created booking from a rejected one.",
            "Fix both branches. The success branch renders the payload with `status: :created`. The failure branch renders `booking.errors.full_messages` with `status: :unprocessable_content`.",
            "Keep the branch condition as `if booking.save`. With `save!` the failure raises and the 422 would have to come from `ApplicationController#rescue_from` — it does, and the body is identical, but then the failure path is invisible to anyone reading this action.",
            "Do not touch `compute_price!` or the `build` line. The defect here is the response, and only the response.",
          ],
          starter: String.raw`class BookingsController < ApplicationController
  before_action :require_owner_role!, only: %i[create]

  def create
    booking = current_user.bookings.build(booking_params)
    booking.compute_price!

    if booking.save
      render json: booking_payload(booking)
    else
      render json: { errors: booking.errors.full_messages }
    end
  end

  private

  def booking_params
    params.permit(:walker_id, :dog_id, :starts_at, :duration_min)
  end

  def require_owner_role!
    return if current_user.owner?

    render json: { error: "This action is for pet owners" }, status: :forbidden
  end
end`,
          solution: String.raw`class BookingsController < ApplicationController
  before_action :require_owner_role!, only: %i[create]

  def create
    booking = current_user.bookings.build(booking_params)
    booking.compute_price!

    if booking.save
      render json: booking_payload(booking), status: :created
    else
      render json: { errors: booking.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def booking_params
    params.permit(:walker_id, :dog_id, :starts_at, :duration_min)
  end

  def require_owner_role!
    return if current_user.owner?

    render json: { error: "This action is for pet owners" }, status: :forbidden
  end
end`,
          checks: [
            { re: /if booking\.save\b/, hint: "Keep the non-bang branch so the failure path stays in this action: `if booking.save`." },
            { re: /status::created/, hint: "A successful create is 201: `render json: booking_payload(booking), status: :created`." },
            { re: /status::unprocessable_content/, hint: "A rejected body is 422: `status: :unprocessable_content` on the errors branch." },
          ],
          mustNot: [
            { re: /booking\.save!/, hint: "`save!` raises, which moves the 422 into `ApplicationController#rescue_from` and hides the branch. Keep `save`." },
            { re: /status::ok/, hint: "200 on a create tells the client nothing was made. Use 201 for success and 422 for a rejected body." },
          ],
          success: "201 when it was created, 422 with field errors when it was not. Two codes, two truths — and that is the contract a mobile client branches on.",
        },
      ],
    },
  ],
});
