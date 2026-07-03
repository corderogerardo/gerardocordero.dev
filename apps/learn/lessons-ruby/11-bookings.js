// Module 11 — Bookings: The Core API. See FORMAT.md + FORMAT-RUBY.md for the schema.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "pawwalk-bookings",
  title: "Bookings: The Core API",
  emoji: "📅",
  lang: "ruby",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "booking-rules-as-code",
      title: "Booking Rules as Code",
      steps: [
        {
          type: "text",
          md: [
            "## The model that runs the whole app",
            "Everything you've built through module 10 — the schema, the JWT auth guarding every request — exists to protect ONE thing: a `Booking`. It's where money, time, and trust between an owner and a walker all meet. Open the real file and read it slowly; every line earns its place.",
          ],
        },
        {
          type: "code",
          title: "app/models/booking.rb",
          source: String.raw`class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :walker
  belongs_to :dog
  has_one :walk_session
  has_one :payment, dependent: :destroy

  enum :status, {
    pending: "pending",
    confirmed: "confirmed",
    in_progress: "in_progress",
    completed: "completed",
    cancelled: "cancelled"
  }

  validates :starts_at, presence: true
  validates :duration_min, inclusion: { in: [ 30, 60 ] }
  validates :price_cents, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validate :dog_belongs_to_booker

  scope :upcoming, -> { where(starts_at: Time.current..).where.not(status: :cancelled) }
  scope :for_walker, ->(walker) { where(walker: walker) }

  # Price is always derived from the walker's rate, never accepted from the client.
  def compute_price!
    self.price_cents = walker.price_per_30_min_cents * (duration_min / 30)
  end

  private

  def dog_belongs_to_booker
    return if dog.nil? || user.nil?

    errors.add(:dog, "must belong to the user making the booking") if dog.user_id != user_id
  end
end`,
          caption: "This is the real, unedited file. Five belongs/has associations, a string-backed enum, four validations, two scopes, one price method, one private validation method. Nothing else — the model IS the business rules.",
        },
        {
          type: "text",
          md: [
            "## `enum :status` — a small set of states, and free methods",
            "You met symbols for internal labels back in module 01 (`:pending`, `:confirmed`). `enum :status, { pending: \"pending\", confirmed: \"confirmed\", ... }` tells Rails: this column only ever holds one of these five strings, and I want Ruby-ish methods for working with it, not string comparisons scattered everywhere.",
            "That one declaration generates a pile of methods for free, on every `Booking` instance:",
            "```\nbooking.pending?      # true/false — a query method per status\nbooking.confirmed?\nbooking.pending!      # sets status to \"pending\" AND saves immediately\nbooking.confirmed!\nBooking.statuses      # {\"pending\"=>\"pending\", \"confirmed\"=>\"confirmed\", ...}\nBooking.pending       # a scope — every booking where status == \"pending\"\nBooking.cancelled.count\n```",
            "Try it yourself in `bin/rails console` (or `rails c`) against the real app — every one of these is real, running behavior, not a hypothetical:",
            "```\n$ bin/rails console\nirb> b = Booking.first\nirb> b.status\n=> \"confirmed\"\nirb> b.confirmed?\n=> true\nirb> b.pending?\n=> false\nirb> Booking.statuses\n=> {\"pending\"=>\"pending\", \"confirmed\"=>\"confirmed\", \"in_progress\"=>\"in_progress\", \"completed\"=>\"completed\", \"cancelled\"=>\"cancelled\"}\nirb> Booking.pending.count\n=> 1\n```",
            "That `pending: \"pending\"` (string on both sides, not the more common integer-backed enum) matters: the database column stores the readable word `\"pending\"`, not a `0`. Anyone reading raw rows in a SQLite browser sees `confirmed`, not a mystery integer they'd need the model source to decode.",
          ],
        },
        {
          type: "text",
          md: [
            "## The model validates authorization too — not just the controller",
            "Every validation you've written since module 07 checks DATA — is `duration_min` one of the allowed values, is `price_cents` a positive integer. `dog_belongs_to_booker` is different in kind: it's not asking \"is this data well-formed\", it's asking \"is this user even ALLOWED to make this booking\". Read it again:",
            "```\ndef dog_belongs_to_booker\n  return if dog.nil? || user.nil?\n\n  errors.add(:dog, \"must belong to the user making the booking\") if dog.user_id != user_id\nend\n```",
            "This is the single most important line in the whole module. Picture a bug: a future controller change accidentally lets `dog_id` come from anywhere in the request, unchecked. Without this validation, user A could book walker time using user B's dog — a stranger's booking showing up on a dog they don't own. WITH this validation, `booking.save!` raises `ActiveRecord::RecordInvalid` the instant `dog.user_id != user_id`, no matter which controller action, which future refactor, or which bug tried to sneak the mismatched ids through. **Put authorization at the layer nothing can bypass.** A controller can have a bug. The model is the last line, and it's still standing.",
          ],
        },
        {
          type: "text",
          md: [
            "## `compute_price!` — the one line that keeps money honest",
            "```\ndef compute_price!\n  self.price_cents = walker.price_per_30_min_cents * (duration_min / 30)\nend\n```",
            "One multiplication. `walker.price_per_30_min_cents` is the walker's own rate — never something the client sends. `duration_min / 30` turns 30 minutes into `1`, 60 minutes into `2` — a whole-number multiplier on the base 30-minute rate. Call it, and `price_cents` is set; the caller still has to `save!` afterward. You'll see exactly who calls this — and when — in lesson 3.",
          ],
        },
        {
          type: "quiz",
          q: "Why does `dog_belongs_to_booker` live as a validation on the `Booking` MODEL instead of a check in the controller action?",
          choices: [
            "Because a model validation runs no matter which controller action (or future bug) tries to save a Booking — the controller can have a mistake, but the model is the layer nothing bypasses",
            "Model validations run faster than controller code, so it's purely a performance choice",
            "Rails requires all authorization logic to live in models, never in controllers",
            "It's arbitrary — the same check in the controller would behave identically in every way",
          ],
          answer: 0,
          explain: "A controller-level check only protects the one action it's written in — a new action, a refactor, or an added API path could all forget it. A model validation runs on every single `save`/`save!`/`create!` from anywhere, so `dog_belongs_to_booker` is authorization enforced at the layer that's actually impossible to route around.",
          nudge: "What happens to this check if someone adds a second way to create a Booking — a new controller action, a background job, a console script — and forgets to repeat a controller-level check?",
        },
        {
          type: "exercise",
          title: "Retype the enum",
          prompt: [
            "Retype `Booking`'s real `enum :status` declaration exactly: five statuses — `pending`, `confirmed`, `in_progress`, `completed`, `cancelled` — each mapped to its own name as a string.",
          ],
          starter: String.raw`class Booking < ApplicationRecord
  # your code here
end`,
          solution: String.raw`class Booking < ApplicationRecord
  enum :status, {
    pending: "pending",
    confirmed: "confirmed",
    in_progress: "in_progress",
    completed: "completed",
    cancelled: "cancelled"
  }
end`,
          checks: [
            { re: /enum:status,\{/, hint: "Start with `enum :status, {` — a symbol name, then a hash of mappings." },
            { re: /pending:"pending"/, hint: "Each status maps to its own name as a string: `pending: \"pending\"`." },
            { re: /in_progress:"in_progress"/, hint: "Don't forget `in_progress` — it's the fourth status, between `confirmed` and `completed`." },
            { re: /cancelled:"cancelled"/, hint: "The last status: `cancelled: \"cancelled\"`." },
          ],
          mustNot: [
            { re: /enum:status,\{pending:0/, hint: "This enum is string-backed, not integer-backed — every value is a quoted string, not a number." },
          ],
          success: "That's the real declaration from apps/pawwalk-api. Five statuses, string-backed, and every `booking.pending?` / `booking.confirmed!` method on the class comes from this one block.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "reading-bookings-scope-everything",
      title: "Reading Bookings: Scope Everything Through current_user",
      steps: [
        {
          type: "text",
          md: [
            "## The golden rule: never `Booking.all`",
            "`current_user` has been available in every controller since module 10's `Authentication` concern set `@current_user` from the JWT. Here's the rule that matters more than any single line of code in this module: **a controller for a signed-in user's own data never queries the bare model class.** Not `Booking.all`, not `Booking.find(params[:id])`. Every query starts from `current_user.bookings` — the association Rails built the moment you wrote `belongs_to :user` on `Booking` and `has_many :bookings` on `User` back in module 09.",
            "`Booking.all` returns EVERY booking in the database, for every user who ever signed up. `current_user.bookings` returns only the rows where `user_id == current_user.id` — the exact same `WHERE` clause you'd type by hand, generated automatically by the association. Forget this once, in one action, and you've built an endpoint that leaks every stranger's booking history to whoever's logged in.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/bookings_controller.rb — index",
          source: String.raw`def index
  # includes(:walker, :dog) avoids an N+1 query when rendering booking_payload for each row.
  bookings = current_user.bookings.includes(:walker, :dog).order(starts_at: :asc)
  bookings = bookings.where(status: params[:status]) if params[:status].present?

  page = params[:page].to_i.clamp(1, Float::INFINITY).to_i
  bookings = bookings.limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE)

  render json: { bookings: bookings.map { |booking| booking_payload(booking) } }
end`,
          caption: "Four lines build the query, one line renders it. Every line chains off `current_user.bookings` — nothing here ever touches `Booking` directly.",
        },
        {
          type: "text",
          md: [
            "## `.includes(:walker, :dog)` — module 07's N+1 lesson, now shipping",
            "You met the N+1 problem in module 07: loop over N bookings, and calling `.walker.name` inside `booking_payload` for each one fires N *extra* queries — one per booking — on top of the one that fetched the bookings themselves. `.includes(:walker, :dog)` fixes it the same way it always does: two extra queries total (one for all the walkers, one for all the dogs), no matter whether `bookings` has 3 rows or 3,000. This isn't a demo of the idea anymore — it's the exact line shipping in the real controller.",
            "## Filtering and paging — both honest about their limits",
            "`params[:status]` is a query param (`?status=pending`) fed straight into a `where` — and because `status` is an enum column, Rails accepts either the string `\"pending\"` or the symbol form transparently. `.present?` (module 04 or thereabouts) guards it: no query param means no extra filter, not a crash.",
            "The paging is a plain `.limit/.offset` pair — `page.to_i.clamp(1, Float::INFINITY)` refuses a negative or zero page number, then `.offset((page - 1) * PAGE_SIZE)` skips whole pages. Worth naming honestly: **`limit`/`offset` re-scans skipped rows on every request** — fine at the size of one dog-walking app's bookings table, but a real high-traffic API reaches for cursor-based (\"keyset\") pagination instead, where you page by \"give me everything after id 500\" rather than counting offsets. File that away; it's not a bug here, just a scaling ceiling worth knowing about.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/bookings_controller.rb — show",
          source: String.raw`def show
  # Scoped through current_user.bookings so a stranger's booking 404s instead of 403 —
  # a 403 would confirm the booking exists, a 404 doesn't leak that.
  booking = current_user.bookings.find(params[:id])

  render json: { booking: booking_payload(booking) }
end`,
          caption: "The comment is real, straight out of the file — and it explains a decision that isn't obvious on first read.",
        },
        {
          type: "text",
          md: [
            "## Why 404, not 403, for a stranger's booking",
            "Think through the alternative: if `show` first checked `Booking.find(params[:id])` (bare, unscoped — finds ANY booking) and then compared `booking.user_id == current_user.id`, returning **403 Forbidden** on a mismatch, you'd have accidentally built an **existence oracle**. Someone could enumerate ids — 1, 2, 3, 4… — and every 403 response confirms \"yes, a booking with this id exists, you're just not allowed to see it,\" while every 404 confirms it doesn't. That's a real information leak: booking volume, growth rate, roughly how many total users a competitor has, all readable from response codes alone, no data ever shown.",
            "`current_user.bookings.find(params[:id])` sidesteps the whole problem: it only ever looks inside the CURRENT user's own bookings. A stranger's booking id simply isn't in that scoped set, so `.find` raises `ActiveRecord::RecordNotFound` — same exception, same `rescue_from`, same 404 you'd get for an id that never existed at all. The response can't tell the two cases apart, because from the server's point of view inside this action, they're identical: not found in MY bookings.",
          ],
        },
        {
          type: "quiz",
          q: "Why does `show` use `current_user.bookings.find(params[:id])` instead of `Booking.find(params[:id])` followed by an owner check that renders 403 on mismatch?",
          choices: [
            "Because a 403 would confirm the booking EXISTS (just isn't yours), while a 404 doesn't leak that — scoping through `current_user.bookings` makes a stranger's booking indistinguishable from an id that never existed",
            "`Booking.find` doesn't work at all in a Rails API-only app",
            "It's purely a performance optimization — 403 responses are slower to render than 404s",
            "`current_user.bookings.find` skips validations, which speeds up the query",
          ],
          answer: 0,
          explain: "A 403 tells an attacker their guessed id was real, just forbidden — that's an information leak by itself. Scoping the query through `current_user.bookings` means a stranger's booking id raises the exact same RecordNotFound a nonexistent id would, so the response never distinguishes the two.",
          nudge: "Imagine an attacker trying ids 1 through 1000 against `show`. What could they learn from a 403 that a 404 wouldn't tell them?",
        },
        {
          type: "exercise",
          title: "Retype index's query chain",
          prompt: [
            "Retype the query-building lines of `index`: fetch `current_user.bookings`, eager-load `:walker` and `:dog`, and order by `starts_at` ascending. Assign the result to a local `bookings`.",
          ],
          starter: String.raw`def index
  # your code here
end`,
          solution: String.raw`def index
  bookings = current_user.bookings.includes(:walker, :dog).order(starts_at: :asc)
end`,
          checks: [
            { re: /bookings=current_user\.bookings/, hint: "Start from the association, never the bare model: `bookings = current_user.bookings`." },
            { re: /\.includes\(:walker,:dog\)/, hint: "Chain `.includes(:walker, :dog)` to avoid the N+1 from module 07." },
            { re: /\.order\(starts_at::asc\)/, hint: "Finish with `.order(starts_at: :asc)` — soonest booking first." },
          ],
          mustNot: [
            { re: /Booking\.all/, hint: "Never query the bare `Booking` class for a user's own data — that would return every user's bookings." },
            { re: /Booking\.where\(user:current_user\)/, hint: "Use the association `current_user.bookings`, not a hand-written `where` — it's the same result, but the association is the idiom this codebase uses everywhere." },
          ],
          success: "That's the real first line of Api index — scoped through current_user, N+1-safe, and sorted, before a single filter or page param even gets involved.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "create-never-trust-the-client",
      title: "Create: Never Trust the Client with Money",
      steps: [
        {
          type: "text",
          md: [
            "## Strong params that leave money OUT",
            "Module 08 built the mass-assignment story: a `.permit` allowlist stops a client from sneaking an unexpected key — like `admin: true` — into a `create!` call. `Booking`'s version of that allowlist has a second job, more important than blocking an attack: it makes sure the client was never GIVEN the chance to set the two fields that decide what actually happens to a booking.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/bookings_controller.rb — booking_params",
          source: String.raw`def booking_params
  params.permit(:walker_id, :dog_id, :starts_at, :duration_min)
end`,
          caption: "Read the allowlist by what's MISSING. No `:price_cents`. No `:status`. A client can say who, which dog, when, and how long — never how much, and never what state the booking starts in.",
        },
        {
          type: "text",
          md: [
            "Look at what's absent as carefully as what's present: `:price_cents` isn't on that list, and neither is `:status`. That's not an oversight — it's the entire point. If `:price_cents` were permitted, any client could `POST` a booking claiming a walk costs one cent. If `:status` were permitted, a client could `POST` a booking that's already `\"confirmed\"` or even `\"completed\"`, skipping every state the real world requires it to pass through. Module 08's `Api::WalkersController` used `params.require(:walker).permit(...)` — a wrapped top-level key. This controller's `params.permit(...)` (no `.require`) reads the same four fields straight off the top-level JSON body — both are strong params, just shaped for how each client happens to send its request.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/bookings_controller.rb — create",
          source: String.raw`def create
  booking = current_user.bookings.build(booking_params)
  booking.compute_price! # never trust the client with money — price is derived server-side
  booking.save!

  render json: { booking: booking_payload(booking) }, status: :created
end`,
          caption: "Four lines, in order: scope-and-build, compute the real price, persist, respond 201. The comment is the whole module's thesis, spelled out in the actual file.",
        },
        {
          type: "text",
          md: [
            "## Three lines, three separate jobs",
            "`current_user.bookings.build(booking_params)` does two things at once: it builds an in-memory `Booking` from exactly the four permitted fields, AND — because it's built off the `current_user.bookings` association, not `Booking.new` — it pre-fills `user_id` to the current user's own id. That's `dog_belongs_to_booker`'s partner from lesson 1: even if `dog_id` in the request belongs to someone else's dog, `user_id` is locked to whoever's JWT is on the request, so the model validation catches the mismatch when `save!` runs.",
            "`booking.compute_price!` runs BEFORE `save!` — it has to, since `price_cents` has a `presence` validation and would fail an empty save otherwise. It reads `booking.walker.price_per_30_min_cents` (the walker this exact booking is for) and `booking.duration_min` (whatever the client asked for, 30 or 60), multiplies them, and sets `price_cents` on the in-memory object. The client's JSON body was never even capable of setting this field — it's not that the value gets overwritten, it's that `booking_params` never let it in in the first place.",
            "`booking.save!` — the bang version, same as every write you've seen since module 07 — raises `ActiveRecord::RecordInvalid` on any validation failure (bad duration, mismatched dog, missing walker), which `ApplicationController`'s `rescue_from` turns into a 422 automatically. `render ... status: :created` is module 08's 201, unchanged.",
          ],
        },
        {
          type: "quiz",
          q: "`booking_params` permits `:walker_id`, `:dog_id`, `:starts_at`, and `:duration_min` — but NOT `:price_cents` or `:status`. What happens if a client's JSON body includes `\"price_cents\": 1`?",
          choices: [
            "It's silently ignored — `booking_params` never copies it into the built Booking, so `compute_price!` still sets the real, server-computed price",
            "It overrides the computed price, because the client's value always wins if it's present",
            "The request fails with a 422 because `price_cents` isn't allowed in the body at all",
            "It gets stored as a separate, unused column",
          ],
          answer: 0,
          explain: "`.permit` is an allowlist — a key that isn't named simply never makes it into the returned hash, so `Booking.build(booking_params)` never even sees it. `compute_price!` then sets the real `price_cents` from the walker's rate, unconditionally, with nothing left over from the client to conflict with it.",
          nudge: "Strong params work like a guest list at a door — an uninvited name doesn't get turned away loudly, it's just not on the list to begin with. Where would `price_cents: 1` even end up if `booking_params` never mentions it?",
        },
        {
          type: "exercise",
          title: "The strong-params method and the price line",
          prompt: [
            "Define `booking_params` permitting exactly `:walker_id`, `:dog_id`, `:starts_at`, and `:duration_min` (no `.require` wrapper). Then, inside `create`, call `.compute_price!` on the built `booking` before saving it.",
          ],
          starter: String.raw`class BookingsController < ApplicationController
  def create
    booking = current_user.bookings.build(booking_params)
    # your code here
    booking.save!

    render json: { booking: booking_payload(booking) }, status: :created
  end

  private

  def booking_params
    # your code here
  end
end`,
          solution: String.raw`class BookingsController < ApplicationController
  def create
    booking = current_user.bookings.build(booking_params)
    booking.compute_price!
    booking.save!

    render json: { booking: booking_payload(booking) }, status: :created
  end

  private

  def booking_params
    params.permit(:walker_id, :dog_id, :starts_at, :duration_min)
  end
end`,
          checks: [
            { re: /booking\.compute_price!/, hint: "Compute the server-derived price before saving: `booking.compute_price!`." },
            { re: /params\.permit\(:walker_id,:dog_id,:starts_at,:duration_min\)/, hint: "Permit exactly four fields, no `.require` wrapper: `params.permit(:walker_id, :dog_id, :starts_at, :duration_min)`." },
          ],
          mustNot: [
            { re: /permit\([^)]*price_cents/, hint: "Never permit `:price_cents` — the whole point of this method is that the client can't set the price." },
            { re: /permit\([^)]*:status/, hint: "Never permit `:status` either — a booking always starts `pending`, decided by the model default, not the client." },
          ],
          success: "That's the real create action and booking_params, field for field — the client picks a walker, a dog, a time, and a duration; the server decides everything else.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "cancel-guarding-state-transitions",
      title: "Cancel: Guarding State Transitions",
      steps: [
        {
          type: "text",
          md: [
            "## A member route for one specific transition",
            "`index`, `show`, and `create` are three of Rails' seven standard RESTful actions — `resources :bookings` gives you all seven for free, but `only: %i[index show create]` in `routes.rb` deliberately keeps only three. Cancelling isn't `update` (which would let a client PATCH ANY field, including sneaking `status: \"completed\"` in through the back door) — it's its own narrow, named route:",
          ],
        },
        {
          type: "code",
          title: "config/routes.rb",
          source: String.raw`resources :bookings, only: %i[index show create] do
  member do
    patch :cancel
  end

  resource :pay, only: :create, controller: :payments
end`,
          caption: "`member do ... end` adds a route scoped to ONE booking — `patch \"/bookings/:id/cancel\"` — routed to `BookingsController#cancel`. `resource :pay` is next module's story; ignore it for now.",
        },
        {
          type: "text",
          md: [
            "## Why a dedicated route beats a generic `update`",
            "Imagine instead a generic `PATCH /bookings/:id` with `params.permit(:status)`. Nothing about that shape stops a client from sending `status: \"completed\"` directly, skipping `confirmed` and `in_progress` entirely — the walk never actually happened, but the database says it did. A dedicated `PATCH /bookings/:id/cancel` route can't do that even by accident: it's not a generic field-setter, it's a verb. The URL itself says what's happening (`/cancel`), server logs read like a story of what users DID rather than a diff of what fields changed, and the action can enforce a much narrower rule than \"any status update is fine\": exactly one destination status, and only from specific starting statuses.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/bookings_controller.rb — cancel",
          source: String.raw`def cancel
  booking = current_user.bookings.find(params[:id])

  unless booking.pending? || booking.confirmed?
    render json: { error: "cannot cancel a #{booking.status} booking" }, status: :unprocessable_content
    return
  end

  booking.update!(status: :cancelled)
  render json: { booking: booking_payload(booking) }
end`,
          caption: "Same `current_user.bookings.find` scoping as `show` — a stranger's booking 404s here too, not 403. The guard is the whole lesson: two statuses in, one status out.",
        },
        {
          type: "text",
          md: [
            "## The guard, read line by line",
            "`booking.pending?` and `booking.confirmed?` are two of the free query methods `enum :status` generated back in lesson 1. `unless booking.pending? || booking.confirmed?` reads as plain English: unless this booking is still in one of the two cancellable states, refuse. Notice it's `unless ... render ... return` — module 01's early-exit guard-clause idiom, not an `if/else`. The `render` sends a 422 with a message that names the actual blocking status (`\"cannot cancel a completed booking\"`, `\"cannot cancel a cancelled booking\"`) via `#{booking.status}` interpolation, and the bare `return` stops the method right there — the two lines below never run.",
            "If the guard passes, `booking.update!(status: :cancelled)` is the ONE legal transition this action ever performs — not `update!(params.permit(:status))`, not anything the client could redirect. It's hardcoded to `:cancelled`, full stop. `update!` (bang, like every write this module) would raise on a validation failure, but there isn't one to hit here — the guard already ruled out anything that would make this an invalid state to enter.",
          ],
        },
        {
          type: "quiz",
          q: "A booking is `.completed`. A client calls `PATCH /bookings/:id/cancel` on it. What happens?",
          choices: [
            "422 Unprocessable Content, with an error message naming the actual status (\"cannot cancel a completed booking\") — the guard blocks it before any `update!` runs",
            "200 OK — the booking is cancelled anyway, since the client asked for it",
            "404 Not Found, because completed bookings aren't reachable by `current_user.bookings.find`",
            "500 Internal Server Error, because `update!` raises an unhandled exception",
          ],
          answer: 0,
          explain: "`unless booking.pending? || booking.confirmed?` catches every other status — including `.completed` — and renders a 422 with a message built from the real status, then `return`s before `update!` is ever called. No exception, no silent no-op: a clear, client-readable rejection.",
          nudge: "Walk through `cancel` top to bottom for a `.completed` booking: does it pass the `unless` guard, or get caught by it?",
        },
        {
          type: "exercise",
          title: "Retype the guard and the transition",
          prompt: [
            "Write the guard: unless the booking is `pending?` or `confirmed?`, render `{ error: \"cannot cancel a #{booking.status} booking\" }` with `status: :unprocessable_content` and `return`. Then, below the guard, update the booking's status to `:cancelled` using the bang method.",
          ],
          starter: String.raw`def cancel
  booking = current_user.bookings.find(params[:id])

  # your code here

  booking.update!(status: :cancelled)
  render json: { booking: booking_payload(booking) }
end`,
          solution: String.raw`def cancel
  booking = current_user.bookings.find(params[:id])

  unless booking.pending? || booking.confirmed?
    render json: { error: "cannot cancel a #{booking.status} booking" }, status: :unprocessable_content
    return
  end

  booking.update!(status: :cancelled)
  render json: { booking: booking_payload(booking) }
end`,
          checks: [
            { re: /unless booking\.pending\?\|\|booking\.confirmed\?/, hint: "Guard with `unless booking.pending? || booking.confirmed?`." },
            { re: /status::unprocessable_content/, hint: "Render the rejection with `status: :unprocessable_content` — the 422." },
            { re: /return/, hint: "Stop the method after rendering the error — a bare `return`." },
            { re: /booking\.update!\(status::cancelled\)/, hint: "Below the guard: `booking.update!(status: :cancelled)` — the one legal transition this action makes." },
          ],
          mustNot: [
            { re: /update!\(params\.permit\(:status\)\)/, hint: "Never let the client pick the destination status — hardcode `:cancelled`, don't read it from params." },
          ],
          success: "That's the real guard, word for word — the entire reason this endpoint is safer than a generic update.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "the-full-flow-with-curl",
      title: "The Full Flow with curl",
      label: "Over to the terminal",
      steps: [
        {
          type: "text",
          md: [
            "## Centralized error handling, one more time",
            "Before you run anything, look at the piece that makes both the create-with-bad-duration case and the cancel-twice case above return clean JSON instead of a crash. It's the same file module 08 introduced — and by now you've watched it catch errors for `WalkersController`, and every action of `BookingsController` too, without one rescue written in either:",
          ],
        },
        {
          type: "code",
          title: "app/controllers/application_controller.rb",
          source: String.raw`class ApplicationController < ActionController::API
  include Authentication

  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from ActiveRecord::RecordInvalid, with: :render_invalid

  private

  def render_not_found
    render json: { error: "not found" }, status: :not_found
  end

  def render_invalid(exception)
    render json: { errors: exception.record.errors.full_messages }, status: :unprocessable_content
  end
end`,
          caption: "The full, real file — every controller in this module inherits both rescues automatically. `cancel`'s manual 422 is different: it's a business rule (\"can't cancel a completed booking\"), not a model validation failure, so it renders its own response instead of raising and letting this catch it.",
        },
        {
          type: "xcode",
          title: "Run the real flow — booking, reading, and cancelling",
          label: "Over to the terminal",
          intro: [
            "Boot the real app and drive every endpoint this module covered, end to end, against `apps/pawwalk-api`:",
          ],
          items: [
            "`cd apps/pawwalk-api && bin/rails db:prepare && bin/rails db:seed` — make sure the demo data exists.",
            "`bin/rails server` — leave it running (default `http://localhost:3000`).",
            "Log in as the demo owner: `curl -X POST http://localhost:3000/login -H \"Content-Type: application/json\" -d '{\"email\":\"demo@pawwalk.dev\",\"password\":\"walkies123\"}'` — copy the `token` from the response.",
            "Create a booking for tomorrow, 60 minutes, with Luna Martinez (`walker_id: 1`) and Mochi (`dog_id: 1`): `curl -X POST http://localhost:3000/bookings -H \"Authorization: Bearer YOUR_TOKEN\" -H \"Content-Type: application/json\" -d '{\"walker_id\":1,\"dog_id\":1,\"starts_at\":\"2026-07-04T10:00:00Z\",\"duration_min\":60}'` — expect `201 Created` with `\"status\":\"pending\"` and `\"price_cents\":5000` (Luna's `2500`-cent rate × 2, for 60 minutes).",
            "List your bookings: `curl http://localhost:3000/bookings -H \"Authorization: Bearer YOUR_TOKEN\"` — the booking you just created is in the array, alongside any seeded ones.",
            "Fetch it directly by id: `curl http://localhost:3000/bookings/ID -H \"Authorization: Bearer YOUR_TOKEN\"` (swap `ID` for the id from the create response).",
            "Cancel it: `curl -X PATCH http://localhost:3000/bookings/ID/cancel -H \"Authorization: Bearer YOUR_TOKEN\"` — expect `\"status\":\"cancelled\"`.",
            "Try cancelling it AGAIN, same command: expect `422 Unprocessable Content` with `{\"error\":\"cannot cancel a cancelled booking\"}` — the guard from lesson 4, doing its job on the second call.",
            "Stop the server (Ctrl-C) when you're done.",
          ],
        },
        {
          type: "text",
          md: [
            "## What you just watched, end to end",
            "That's a real, verified transcript against the actual app: `201` with a server-computed price of exactly `walker.price_per_30_min_cents × (duration_min / 30)`, a `200` list scoped to nobody but you, a `200` single-booking fetch, a `200` cancel that flips the status, and a `422` the SECOND time you try the same cancel — the guard from lesson 4 refusing a booking that's already in a terminal state. Every one of those responses came from the exact files you just read and retyped pieces of: `booking.rb`'s enum and validation, `bookings_controller.rb`'s four actions, `application_controller.rb`'s two `rescue_from` lines.",
          ],
        },
        {
          type: "quiz",
          q: "Capstone: put the whole module in order. A `POST /bookings` request arrives with a `dog_id` belonging to someone ELSE'S dog. Which layer stops it, and what HTTP status comes back?",
          choices: [
            "The MODEL's `dog_belongs_to_booker` validation fails inside `save!`, `ActiveRecord::RecordInvalid` bubbles up, `ApplicationController`'s `rescue_from` renders 422",
            "The controller's `booking_params` strips out the mismatched `dog_id` before it reaches the model",
            "Nothing stops it — the booking saves successfully with the wrong dog attached",
            "The route itself rejects the request with a 400 before any controller code runs",
          ],
          answer: 0,
          explain: "`booking_params` permits `:dog_id` — it's supposed to be there, that's not the problem. The controller happily builds and tries to save the booking. It's `Booking`'s own `dog_belongs_to_booker` validation, running inside `save!`, that catches `dog.user_id != user_id` and raises — caught centrally by `ApplicationController`'s `rescue_from ActiveRecord::RecordInvalid`, which is exactly why nobody wrote a single rescue block in `BookingsController` itself.",
          nudge: "Trace it in order: strong params don't know whose dog `dog_id` points to, they just check it's a permitted key. Which layer actually knows the dog's owner?",
        },
      ],
    },
  ],
});
