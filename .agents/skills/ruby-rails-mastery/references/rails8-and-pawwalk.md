# Rails 8.1 conventions, grounded in apps/pawwalk-api

The book teaches Ruby; this file maps that Ruby onto Rails 8.1 as actually
configured in `apps/pawwalk-api`. **Read the real file before quoting it** — match
it verbatim in lessons. Ruby 3.4.10 via mise; run tools with `mise x -- …`.

## The actual stack (from Gemfile / config)

- **Rails 8.1**, API-oriented but with an HTML admin surface (turbo-rails,
  stimulus-rails, importmap-rails, **propshaft** asset pipeline, **thruster**).
- **Database: SQLite3** (`gem "sqlite3"`) — Rails 8's production-ready SQLite story.
  (Note: some older docs say PostgreSQL; the Gemfile is the source of truth.)
- **The Solid trifecta** (DB-backed, no Redis): **solid_cache** (`cache_store =
  :solid_cache_store`), **solid_queue** (`active_job.queue_adapter = :solid_queue`,
  can run in-Puma via the `solid_queue` plugin), **solid_cable** (Action Cable
  adapter). Production uses multi-DB: `solid_queue.connects_to = { database: {
  writing: :queue } }`.
- **Auth:** `bcrypt` (`has_secure_password`) + `jwt`; the token logic lives in the
  controller concern `app/controllers/concerns/authentication.rb`.
- **Payments:** `stripe` + `stripe_webhooks_controller.rb`.
- **Hardening:** `rack-attack` (throttling), `lograge` (single-line request logs),
  `brakeman` + `bundler-audit` (security scans), `rubocop-rails-omakase` (lint).
- **Deploy:** `kamal` (Docker). **Tests:** `minitest`.
- **The loop:** `cd apps/pawwalk-api && mise x -- bin/rails test && mise x -- bin/rubocop`.

## Rails "magic" = the Ruby you know (see dynamism reference)

Every macro is a **class method called at class-definition time** (`self` = the
class, Part 1), most using `define_method`/hooks (Part 3). Prove any of it with
`Model.instance_method(:m).source_location`.

- `has_many :bookings` — a class method that generates the `bookings` reader/writer
  via `define_method` (closing over the name); the reader returns a **collection
  proxy** whose `build`/`create`/`where` come from ActiveRecord (they're on the
  proxy, not your model).
- `enum :status, {…}` — generates predicate/bang methods (`confirmed?`, `confirm!`)
  and scopes with `define_method`. Real example: `Booking` enum with
  pending/confirmed/in_progress/completed/cancelled.
- `scope :upcoming, -> { … }` — stores a **lambda** (strict arity, contained
  `return` — that's why scopes are lambdas). Real: `Booking.scope :upcoming`.
- `validates :starts_at, presence: true` — class method appending a rule read later
  by `valid?` (you rebuilt this exact shape in lesson 27's capstone).
- `include ActiveModel::Validations` / concerns — the `included(base)` hook pattern.

## ActiveRecord correctness (the review checklist)

- **N+1 queries:** `bookings.each { |b| b.walker.name }` fires one query per row.
  Fix with `includes(:walker)` (eager load); catch them with `strict_loading` or by
  reading the query log. Counter caches (`counter_cache: true` on `belongs_to`, as on
  `Booking#walker`) avoid `COUNT` queries.
- **Large sets:** never `Model.all.each` on a big table (loads every row). Use
  `find_each` / `in_batches` — the DB-scale form of `Enumerable#lazy`.
- **Money:** integer **cents**, never `Float`. `price_cents` is derived server-side
  from the walker's rate — never trusted from the client (`Booking#compute_price!`).
- **Callbacks:** prefer `after_create_commit` (fires after the transaction commits)
  over `after_create` for side effects like broadcasts, so a rollback doesn't emit.
  Real: `Booking` broadcasts to the admin feed via `after_create_commit`.
- Validations run private methods on the implicit `self` (`validate
  :dog_belongs_to_booker` → a `private` method).

## Controllers & security

- **Every non-action method must be `private`** — the router dispatches to *public*
  controller methods, so a public helper becomes a reachable endpoint (Part 1
  visibility rule applied).
- **Strong params:** `params.expect`/`params.require(...).permit(...)` — never
  `permit!` on user input.
- **Never `send(params[:x])`** — `send` bypasses private; use `public_send` + an
  allowlist.
- **Regex validations:** `format: { with: /\A…\z/ }` — `\A…\z`, not `^…$` (line
  anchors are bypassable with a newline).
- Auth via the `Authentication` controller concern; keep secrets out of the repo
  (credentials on EAS/env, per repo CLAUDE.md).

## Caching (module 17 territory)

- HTTP conditional GET: `fresh_when`/`stale?` (ETag/Last-Modified) to return 304.
- `Rails.cache.fetch(key) { … }` with key-based expiry over Solid Cache; `touch:
  true` on `belongs_to` to bust parent cache keys on child change. Watch cache-privacy
  (never cache per-user data under a shared key) and thundering-herd on hot keys.

## When writing Rails lessons/content

Quote real files verbatim, titled with the real path (e.g. `app/models/booking.rb`).
Execute Ruby snippets under mise 3.4.10. Facts checked against a running server or
`bin/rails console`. Apply `senior-coach-content` voice. Validate lessons with
`node tools/validate.mjs lessons-ruby`.
