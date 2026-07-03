// Module 16 — Query Performance. See FORMAT.md + FORMAT-RUBY.md for the schema.
// First SENIOR module: modules 00-15 taught you to ship a working app. This one
// teaches what breaks it under load — the N+1, the missing index, the COUNT(*)
// on every render — using the real bookings/walkers code you already wrote.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "query-performance",
  title: "Query Performance",
  emoji: "🏎️",
  lang: "ruby",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "the-n1-you-already-shipped",
      title: "The N+1 You Already Shipped",
      steps: [
        {
          type: "text",
          md: [
            "## A query that looks fine at 5 rows and dies at 5,000",
            "Module 11 shipped `BookingsController#index` scoped through `current_user.bookings`, ordered, paged — and already carrying `.includes(:walker, :dog)`. You typed that line as an exercise and moved on. This module stops and asks: what happens the moment that `.includes` isn't there? Not hypothetically — read the Rails log both ways, because an N+1 is invisible in the one place most people look (the response) and screaming in the one place almost nobody checks first (the log).",
            "Picture `index` without `.includes`, one line changed:",
            "```\nbookings = current_user.bookings.order(starts_at: :asc)\n```",
            "`booking_payload` still calls `booking.walker.id` and `booking.dog.id` for every booking in the array. Each of those is a method call on an association Rails hasn't loaded yet — so each one fires its own `SELECT`, the instant it's touched.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/bookings_controller.rb — index (unpatched, for illustration)",
          source: String.raw`def index
  bookings = current_user.bookings.order(starts_at: :asc)
  bookings = bookings.where(status: params[:status]) if params[:status].present?

  page = params[:page].to_i.clamp(1, Float::INFINITY).to_i
  bookings = bookings.limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE)

  render json: { bookings: bookings.map { |booking| booking_payload(booking) } }
end`,
          caption: "One line missing — no `.includes` — and `booking_payload`'s `booking.walker` / `booking.dog` calls become the trap. This is NOT what ships; it's what module 11's fix replaced. Keep reading for the log it would have produced.",
        },
        {
          type: "code",
          title: "log/development.log (hypothetical, unpatched index)",
          source: String.raw`Booking Load (0.4ms)  SELECT "bookings".* FROM "bookings" WHERE "bookings"."user_id" = ? ORDER BY "starts_at" ASC LIMIT ? OFFSET ?
Walker Load (0.2ms)  SELECT "walkers".* FROM "walkers" WHERE "walkers"."id" = ? LIMIT ?
Dog Load (0.2ms)  SELECT "dogs".* FROM "dogs" WHERE "dogs"."id" = ? LIMIT ?
Walker Load (0.2ms)  SELECT "walkers".* FROM "walkers" WHERE "walkers"."id" = ? LIMIT ?
Dog Load (0.2ms)  SELECT "dogs".* FROM "dogs" WHERE "dogs"."id" = ? LIMIT ?
Walker Load (0.2ms)  SELECT "walkers".* FROM "walkers" WHERE "walkers"."id" = ? LIMIT ?
Dog Load (0.2ms)  SELECT "dogs".* FROM "dogs" WHERE "dogs"."id" = ? LIMIT ?`,
          caption: "One `Booking Load` (the \"1\"), then a `Walker Load` + `Dog Load` pair repeated once per booking in the page (the \"N\"). This is the whole pattern's name: N+1 — one query for the list, N more for what the loop touches.",
        },
        {
          type: "text",
          md: [
            "## Why it hides in dev and bites in production",
            "`PAGE_SIZE = 20` caps a page at 20 bookings. Without `.includes`, that's `1 + 20 + 20 = 41` queries — instead of the `1 + 2 = 3` queries `.includes(:walker, :dog)` actually produces. On your laptop, against a SQLite dev database with a handful of seed rows, 41 tiny local queries finish in single-digit milliseconds combined. You'd never notice from the response time. Now picture the same endpoint under real load: a production Postgres database with network latency per query, thousands of users hitting `/bookings` concurrently, each request now issuing 41 round-trips instead of 3. The bug doesn't change — the multiplier does. That gap between \"fine in dev\" and \"fatal in production\" is exactly why you read the LOG, not just the response: the log shows query COUNT, and query count is what scales with data size, not response time on your machine with five rows in it.",
          ],
        },
        {
          type: "quiz",
          q: "You're reading a Rails development log for a request that returned correctly. You see one `Booking Load`, followed by 20 pairs of `Walker Load` / `Dog Load` — 41 queries total. What does this tell you?",
          choices: [
            "The controller is missing `.includes` (or equivalent eager loading) — each booking's `.walker` and `.dog` are being lazy-loaded one at a time inside the render loop",
            "Nothing is wrong — 41 queries for 20 bookings is expected and means the app is working correctly",
            "The database is corrupted and needs a full reindex",
            "The N+1 pattern in the log means the request will fail with a timeout",
          ],
          answer: 0,
          explain: "The shape — one query for the collection, then a repeating pair per row — is the fingerprint of lazy-loaded associations inside a loop. The request still succeeds (that's what makes it dangerous); it just does far more database work than it needs to, and that work count grows linearly with every row added to the page.",
          nudge: "Count the `Walker Load` lines against the number of bookings in the page. Is that ratio 1-to-1, or 1-to-many?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "includes-strict-loading-and-friends",
      title: "includes, strict_loading & Friends",
      steps: [
        {
          type: "text",
          md: [
            "## `.includes` — one method, two strategies, Rails picks",
            "`.includes(:walker, :dog)` doesn't commit to a single SQL shape. Rails looks at the rest of your query and picks one of two strategies for you:",
            "- **Preload** (separate queries): `SELECT * FROM bookings ...`, then `SELECT * FROM walkers WHERE id IN (...)`, then `SELECT * FROM dogs WHERE id IN (...)`. Three total queries, each simple, results stitched together in Ruby. This is what `index` gets, because nothing in the query filters or orders by a column on `walkers` or `dogs`.",
            "- **Eager load** (one JOIN): a single `LEFT OUTER JOIN` query. Rails switches to this automatically the moment your `.where` or `.order` references a column on the included association — because a preload's separate queries can't apply a condition against a table they haven't joined yet.",
            "You can force either by name — `.preload(:walker, :dog)` always does separate queries, `.eager_load(:walker, :dog)` always does one JOIN — but plain `.includes` is the right default almost everywhere: let Rails pick.",
          ],
        },
        {
          type: "text",
          md: [
            "## When each one wins",
            "Preload wins for `index`'s shape: no filtering happens on `walkers` or `dogs` columns, so N+1 simple queries beat one wide JOIN that would repeat every `bookings` row's columns once per matching `walkers`/`dogs` row. Eager load wins the moment you filter or sort by the association — e.g. `Booking.eager_load(:walker).where(walkers: { city: \"Austin\" })` — because a preload has no JOIN to filter through; the WHERE clause literally cannot reach the `walkers` table without one.",
            "## `strict_loading` — the guardrail that fails loudly instead of lazily",
            "`.includes` fixes the N+1 you already found. `strict_loading` catches the NEXT one before it ships. Add it to a query, and any association access that would trigger a lazy load raises `ActiveRecord::StrictLoadingViolationError` instead of silently firing an extra query:",
            "```\ncurrent_user.bookings.strict_loading.order(starts_at: :asc)\n# booking.walker.name  -> raises immediately if :walker wasn't preloaded\n```",
            "That's the real value: a missing `.includes` becomes a loud test failure in development, not a silent 41-query response that only shows up as a slow endpoint months later once the bookings table has real volume. `Model.strict_loading!` (Rails config) applies it globally; scoping it query-by-query like above is the more common, more surgical choice — turn it on for the hot paths first.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/bookings_controller.rb — index (the real, shipped line)",
          source: String.raw`def index
  bookings = current_user.bookings.includes(:walker, :dog).order(starts_at: :asc)
  bookings = bookings.where(status: params[:status]) if params[:status].present?

  page = params[:page].to_i.clamp(1, Float::INFINITY).to_i
  bookings = bookings.limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE)

  render json: { bookings: bookings.map { |booking| booking_payload(booking) } }
end`,
          caption: "This is what's actually in the repo — module 11's fix. `.includes(:walker, :dog)` turns 41 queries back into 3, no matter how many bookings are on the page.",
        },
        {
          type: "quiz",
          q: "`Booking.includes(:walker).where(walkers: { city: \"Austin\" })` — which strategy does Rails use for `:walker`, and why?",
          choices: [
            "Eager load (one JOIN) — the `.where` filters on a `walkers` column, and a separate preload query has no JOIN to apply that filter through",
            "Preload (separate queries) — `.includes` always does two queries no matter what the rest of the chain does",
            "Neither — this raises an error because `.includes` can't be combined with `.where` on the association",
            "It depends on database vendor, not on the query shape",
          ],
          answer: 0,
          explain: "The moment a `.where` (or `.order`) references a column on the included association, Rails switches `.includes` from preload to eager-load automatically — a plain preload has no JOIN, so it has no way to filter rows by a column on the other table.",
          nudge: "A preload runs `bookings` and `walkers` as two separate, unrelated SELECT statements. Can a filter on `walkers.city` narrow down `bookings` rows if those two queries never touch each other in SQL?",
        },
        {
          type: "exercise",
          title: "Add the N+1 fix to index",
          prompt: [
            "Starting from the unpatched query, add `.includes(:walker, :dog)` to the chain — eager-loading the two associations `booking_payload` touches, in the same order the real file uses.",
          ],
          starter: String.raw`def index
  bookings = current_user.bookings.order(starts_at: :asc)
  # your code here
end`,
          solution: String.raw`def index
  bookings = current_user.bookings.includes(:walker, :dog).order(starts_at: :asc)
end`,
          checks: [
            { re: /current_user\.bookings\.includes\(:walker,:dog\)/, hint: "Chain `.includes(:walker, :dog)` directly onto `current_user.bookings` — walker first, dog second, matching `booking_payload`'s field order." },
            { re: /\.order\(starts_at::asc\)/, hint: "Keep `.order(starts_at: :asc)` after `.includes` — soonest booking first." },
          ],
          mustNot: [
            { re: /\.preload\(/, hint: "Use `.includes`, not `.preload` — let Rails choose the strategy; this query doesn't filter on the association so it'll pick preload anyway." },
          ],
          success: "That's the real fix from the repo — the exact line that turns 41 queries into 3 on a full page of bookings.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "explain-and-indexes",
      title: "EXPLAIN & Indexes",
      steps: [
        {
          type: "text",
          md: [
            "## Reading EXPLAIN: seq scan vs. index scan",
            "`.includes` fixed query COUNT. This lesson is about query COST — how expensive each individual query is once it hits the database. `EXPLAIN` (prefix any query with it in `bin/rails dbconsole` or wrap it with `ActiveRecord::Base.connection.explain`) shows you the plan the database actually ran:",
            "- **Seq Scan** (sequential scan / full table scan): the database reads every row, checking each one against your `WHERE`. Fine for a tiny table; ruinous for a bookings table with a million rows and a request that only wants 20 of them.",
            "- **Index Scan**: the database uses an index — a separate, sorted structure — to jump straight to matching rows without touching the rest of the table. This is what you're aiming for on any column that shows up in a `WHERE` or `ORDER BY` on a large table.",
            "The bookings table already has single-column indexes on `user_id`, `walker_id`, `dog_id`, and `status` — Rails added those automatically from `t.references` and the migration's `index: true`. The gap: `index`'s real query filters `user_id` AND (optionally) `status`, then sorts by `starts_at` — three columns, one query, and no SINGLE index covers all three together.",
          ],
        },
        {
          type: "code",
          title: "EXPLAIN — before the composite index",
          source: String.raw`EXPLAIN SELECT * FROM bookings
WHERE user_id = 1 AND status = 'confirmed'
ORDER BY starts_at ASC;

-- SEARCH bookings USING INDEX index_bookings_on_user_id (user_id=?)
-- USE TEMP B-TREE FOR ORDER BY`,
          caption: "SQLite can use the lone `user_id` index to narrow the search, but `status` still gets checked row-by-row against every one of that user's bookings, and `ORDER BY starts_at` needs a whole separate sort step (\"TEMP B-TREE\") because nothing is pre-sorted by `starts_at` within a user's rows.",
        },
        {
          type: "text",
          md: [
            "## Composite index column order: equality first, then range",
            "A composite (multi-column) index is one structure indexing several columns together, in a specific order — and that order is the entire lesson. The rule: put columns used with **equality** (`=`) first, then a **range or sort** column last. Why order matters: an index on `(a, b, c)` is only useful as a single lookup for a query pattern that matches a PREFIX of that order — equality on `a`, then equality on `b`, then range/sort on `c`. Flip it — sort column first — and the database can't use the index to narrow rows at all, only to avoid a separate sort step at best.",
            "For `index`'s real query — `current_user.bookings` (`user_id = ?`, always equality, always present), optional `status` (`=`, present sometimes), `ORDER BY starts_at` (range/sort, always last) — the right composite index is `[:user_id, :status, :starts_at]`. `user_id` first because every single call to this action filters by it. `status` second because it's the other equality filter. `starts_at` last because it's the sort key, and a composite index's trailing column can serve an `ORDER BY` for free once the leading columns have narrowed the search to one user's rows.",
          ],
        },
        {
          type: "code",
          title: "db/migrate/…_add_index_to_bookings_on_user_status_starts_at.rb",
          source: String.raw`class AddIndexToBookingsOnUserStatusStartsAt < ActiveRecord::Migration[8.1]
  def change
    add_index :bookings, [ :user_id, :status, :starts_at ]
  end
end`,
          caption: "Equality columns first (`user_id`, `status`), range/sort column last (`starts_at`) — the same rule as the text above, as a real migration.",
        },
        {
          type: "code",
          title: "EXPLAIN — after the composite index",
          source: String.raw`EXPLAIN SELECT * FROM bookings
WHERE user_id = 1 AND status = 'confirmed'
ORDER BY starts_at ASC;

-- SEARCH bookings USING INDEX index_bookings_on_user_id_and_status_and_starts_at
--   (user_id=? AND status=?)`,
          caption: "One index serves the whole query: both equality filters narrow the search AND the trailing `starts_at` column already leaves matching rows in the right order — no more \"TEMP B-TREE\" sort step.",
        },
        {
          type: "quiz",
          q: "The new index is on `[:user_id, :status, :starts_at]`. Which of these queries can it serve as a single index lookup (not just a partial scan)?",
          choices: [
            "`WHERE user_id = ? AND status = ? ORDER BY starts_at` — uses all three columns in the index's exact order",
            "`WHERE status = ? ORDER BY starts_at` — skips `user_id` but keeps the other two in order",
            "`WHERE starts_at > ? AND user_id = ?` — same two columns, order in the query doesn't matter",
            "All three queries use the index equally well, since it covers all three columns",
          ],
          answer: 0,
          explain: "A composite index can only be used as a lookup for a PREFIX of its column order. `[:user_id, :status, :starts_at]` serves queries that filter `user_id` (and optionally also `status`, and optionally also sort by `starts_at`) — but a query that skips `user_id` and goes straight to `status` can't use the index to narrow rows, because `user_id` is the leading column and nothing skips the front of a composite index.",
          nudge: "Composite indexes work like a phone book sorted by last name, then first name. Can you jump straight to everyone named \"John\" without first knowing a last name?",
        },
        {
          type: "exercise",
          title: "Write the composite index migration",
          prompt: [
            "Write a migration named `AddIndexToBookingsOnUserStatusStartsAt` that adds a composite index on `bookings` covering `user_id`, `status`, then `starts_at`, in that order.",
          ],
          starter: String.raw`class AddIndexToBookingsOnUserStatusStartsAt < ActiveRecord::Migration[8.1]
  def change
    # your code here
  end
end`,
          solution: String.raw`class AddIndexToBookingsOnUserStatusStartsAt < ActiveRecord::Migration[8.1]
  def change
    add_index :bookings, [ :user_id, :status, :starts_at ]
  end
end`,
          checks: [
            { re: /add_index:bookings,\[:user_id,:status,:starts_at\]/, hint: "`add_index :bookings, [:user_id, :status, :starts_at]` — equality columns first, sort column last." },
          ],
          mustNot: [
            { re: /add_index:bookings,\[:starts_at,:user_id/, hint: "`starts_at` can't lead — it's the sort/range column, not an equality filter. Equality columns (`user_id`, `status`) come first." },
          ],
          success: "That's the composite index this table needs — the exact column order that lets one index serve the filter AND the sort.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "counter-caches",
      title: "Counter Caches",
      steps: [
        {
          type: "text",
          md: [
            "## `walker.bookings.count` is a COUNT(*), every single render",
            "`WalkersController#walker_payload` doesn't show a booking count today — but the moment a feature asks \"how many bookings has this walker done,\" the obvious line is `walker.bookings.count`. That's not free: `.count` on an association issues `SELECT COUNT(*) FROM bookings WHERE walker_id = ?` — a real query, scanning (or index-scanning) every matching row, every single time you render it. List 20 walkers, show each one's booking count, and that's 20 extra `COUNT(*)` queries on top of everything else — the exact same shape as the N+1 from lesson 1, just wearing a `.count` instead of a lazy association load.",
            "## `counter_cache` — Rails keeps a column in sync for you",
            "`counter_cache: true` on the `belongs_to` side tells Rails: maintain an integer column on the OTHER model that always holds the current count, updated automatically on every create and destroy. Read it back with plain attribute access — `walker.bookings_count` — no query at all, because it's just a column already sitting on the row you loaded.",
          ],
        },
        {
          type: "code",
          title: "app/models/booking.rb — the belongs_to change",
          source: String.raw`class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :walker, counter_cache: true
  belongs_to :dog
  # …unchanged below…
end`,
          caption: "One keyword on the association that already existed. `counter_cache: true` goes on `belongs_to` (the \"many\" side, `Booking`), because that's the side whose `create`/`destroy` needs to trigger an update on the `Walker` row it belongs to.",
        },
        {
          type: "code",
          title: "db/migrate/…_add_bookings_count_to_walkers.rb",
          source: String.raw`class AddBookingsCountToWalkers < ActiveRecord::Migration[8.1]
  def change
    add_column :walkers, :bookings_count, :integer, default: 0, null: false

    reversible do |dir|
      dir.up { Walker.find_each { |walker| Walker.reset_counters(walker.id, :bookings) } }
    end
  end
end`,
          caption: "Two jobs, one migration: add the column (`default: 0, null: false` — every walker starts at zero, never NULL), then backfill it for walkers that already have bookings. `reset_counters` is a real ActiveRecord method built exactly for this — it recounts and writes the correct value for existing rows, since the column didn't exist when those bookings were created.",
        },
        {
          type: "text",
          md: [
            "## Why `reset_counters`, not a raw SQL UPDATE",
            "The naive backfill is `UPDATE walkers SET bookings_count = (SELECT COUNT(*) FROM bookings WHERE walker_id = walkers.id)` — and it would work. `Walker.reset_counters(id, :bookings)` does the same recount through ActiveRecord instead: one call per walker id, each running the real COUNT and writing it back, without hand-rolling SQL that has to stay in sync with the association name if `:bookings` is ever renamed. For a handful of walkers this difference barely matters; the habit is what matters — reach for the framework's own counter-repair tool before writing raw SQL that duplicates what it already does correctly.",
            "## When NOT to reach for counter_cache",
            "A counter cache trades read cost for write cost: every `Booking.create`/`destroy` now does an extra `UPDATE walkers SET bookings_count = bookings_count + 1 WHERE id = ?` (wrapped in the same transaction). That's invisible on a table booked a few times a day. It's a real cost on a WRITE-HEAVY association — imagine a `likes_count` incremented thousands of times a second on a viral post; now every single like contends for a lock on the SAME parent row, and that row becomes the bottleneck. The rule of thumb: counter_cache pays for itself when reads (`walker.bookings.count`, rendered on every walker card) vastly outnumber writes (a booking created once, per row, occasionally). Flip that ratio and the cache itself becomes the slow part.",
          ],
        },
        {
          type: "quiz",
          q: "A social app considers `counter_cache: true` for `Like belongs_to :post` so `post.likes_count` avoids a `COUNT(*)`. The catch: a viral post can receive hundreds of likes per second. What's the tradeoff?",
          choices: [
            "Every like now also UPDATEs the same `posts` row to bump the counter — on a viral post, that turns hundreds of concurrent writes per second into hundreds of concurrent updates contending for a lock on ONE row, which can become the actual bottleneck",
            "counter_cache only works with `has_many`, not with the `Like belongs_to :post` direction, so it wouldn't compile",
            "There's no tradeoff — counter_cache has no write cost, only a one-time migration cost",
            "counter_cache would make `post.likes_count` slower to read than the original `.count` query",
            ],
          answer: 0,
          explain: "counter_cache turns every create/destroy on the child (`Like`) into an extra UPDATE on the parent (`Post`) row holding the cached count. Reads get fast and query-free — but writes now all funnel through updating that same parent row, and on a write-heavy, high-concurrency association that shared row becomes a lock contention point. Fine for a dog-walking app's booking counts; a real ceiling for a viral post's like count.",
          nudge: "counter_cache moves cost from every READ to every WRITE. What happens when writes on one association start arriving hundreds of times a second, all targeting the same parent row?",
        },
        {
          type: "exercise",
          title: "Add the counter cache",
          prompt: [
            "Change `Booking`'s `belongs_to :walker` to add `counter_cache: true`. Then write the migration that adds `bookings_count` to `walkers` as a non-null integer defaulting to `0`.",
          ],
          starter: String.raw`class Booking < ApplicationRecord
  belongs_to :user
  # your code here
  belongs_to :dog
end`,
          solution: String.raw`class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :walker, counter_cache: true
  belongs_to :dog
end`,
          checks: [
            { re: /belongs_to:walker,counter_cache:true/, hint: "`belongs_to :walker, counter_cache: true` — the keyword goes on the `belongs_to` side, right after the association name." },
          ],
          mustNot: [
            { re: /belongs_to:walker,counter_cache:'bookings_count'/, hint: "`counter_cache: true` is enough — Rails infers the column name `bookings_count` from the association name. No need to spell it out." },
          ],
          success: "That's the real change — one keyword on an association you've had since module 09, and every future booking create/destroy keeps `walker.bookings_count` correct with zero extra reads.",
        },
        {
          type: "quiz",
          q: "Capstone: a walker's profile page renders 50 walkers, each showing a booking count. Before this module's changes, what was the TOTAL query cost of that page — combining the N+1 risk, the missing index, and the missing counter cache?",
          choices: [
            "Without `.includes`: 1 + 2N queries for associations; without a composite index: each filtered/sorted query does a slower scan even after it runs; without counter_cache: one extra `COUNT(*)` per walker rendered — all three compound, and all three are fixed independently by the changes in this module",
            "Only one of the three problems can exist on a single page — they're mutually exclusive",
            "The missing index is the only real cost; N+1 queries and COUNT(*) queries are equally fast regardless of table size",
            "counter_cache would fix the N+1 problem too, since they're the same underlying issue",
          ],
          answer: 0,
          explain: "These are three separate, additive costs: query COUNT (N+1, fixed by `.includes`/`strict_loading`), query COST (missing index, fixed by the right composite index), and redundant COUNT(*) queries (fixed by counter_cache). None of the three fixes substitutes for another — a real production endpoint typically needs all three lenses, not just one.",
          nudge: "Walk through what changes if you fix only ONE of the three problems and leave the other two. Does the page get fast?",
        },
      ],
    },
  ],
});
