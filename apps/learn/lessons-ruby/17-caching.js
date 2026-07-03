// Module 17 — Caching Layers. See FORMAT.md + FORMAT-RUBY.md for the schema.
// Module 16 fixed query COUNT and query COST. This module fixes the THIRD lever:
// skip the work entirely, at three different layers — HTTP (skip the render),
// Rails.cache (skip the recompute), and cache correctness (the three ways caches lie).
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "caching-layers",
  title: "Caching Layers",
  emoji: "⚡",
  lang: "ruby",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "http-caching-for-an-api",
      title: "HTTP caching for an API",
      steps: [
        {
          type: "text",
          md: [
            "## The cheapest response is the one you don't render",
            "Module 16 made queries fewer (`.includes`) and faster (composite indexes). This module asks a different question: what if the client already has the exact response you're about to build? Re-running the query, re-serializing the JSON, re-sending the bytes — all of that is wasted work if nothing changed since the client's last request.",
            "HTTP has a built-in answer: **conditional GET**. The server response carries an `ETag` — a fingerprint of the resource's current state. The client stores it and sends it back on the next request as `If-None-Match`. If the fingerprint still matches, the server replies `304 Not Modified` with **no body at all** — the client just keeps using the copy it already has.",
          ],
        },
        {
          type: "text",
          md: [
            "## `fresh_when` — Rails does the ETag dance for you",
            "Rails gives you `fresh_when(record)` (or a collection) in a controller action: it computes an ETag from the record, compares it against the `If-None-Match` header on the request, and — if they match — sends the `304` right there. One thing it does NOT do: stop your method. `fresh_when` calls `head :not_modified` but doesn't `return` — if you have a `render json:` line after it, Rails runs it and raises `DoubleRenderError` (you already sent a response, now you're trying to send another). The fix is a one-word guard: `render json: ... unless performed?` — `performed?` is true the instant a response has been sent, so the render only fires when `fresh_when` didn't already handle it.",
            "`stale?` is the same check spelled the other way round: it returns `true` when a fresh render is needed and returns `false` (after already sending the 304) when it isn't — so `if stale?(record) ... end` wraps the expensive work directly, no separate `performed?` guard needed, because the `if` itself only enters the block on a miss.",
            "One more distinction worth a single line: a **strong** ETag (the default) means byte-for-byte identical; a **weak** ETag (prefixed `W/`, which is what `fresh_when` generates) means equivalent-enough for caching purposes even if bytes could theoretically differ — fine for JSON APIs, where two payloads with the same data are what you actually care about matching.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/walkers_controller.rb — show, with fresh_when",
          source: String.raw`def show
  walker = Walker.find(params[:id])

  fresh_when(walker)
  render json: { walker: walker_payload(walker) } unless performed?
end`,
          caption: "`fresh_when(walker)` fingerprints the record and checks it against the request's `If-None-Match`. On a match it sends the 304 immediately — but doesn't halt the method — so `unless performed?` is what actually skips the `render json:` line below.",
        },
        {
          type: "code",
          title: "curl — first request, then a repeat with the ETag",
          source: String.raw`$ curl -i http://localhost:3000/walkers/1
HTTP/1.1 200 OK
ETag: W/"3f2504e04f8964..."
Content-Type: application/json

{"walker":{"id":1,"name":"Luna Martinez", ...}}

$ curl -i http://localhost:3000/walkers/1 -H 'If-None-Match: W/"3f2504e04f8964..."'
HTTP/1.1 304 Not Modified
ETag: W/"3f2504e04f8964..."`,
          caption: "Same ETag sent back as `If-None-Match` → 304, empty body. The client already has this walker; the server didn't rebuild the JSON to say so.",
        },
        {
          type: "quiz",
          q: "A request arrives with `If-None-Match` matching the current ETag, and the action already called `fresh_when(walker)`. Which of these does the server NOT do?",
          choices: [
            "Load `walker` from the database, serialize `walker_payload(walker)` to JSON, and send it in the response body",
            "Compute an ETag from the current state of `walker`",
            "Compare that ETag against the `If-None-Match` header",
            "Send a `304 Not Modified` response",
          ],
          answer: 0,
          explain: "`fresh_when` still needs to load the record to compute its ETag — that query happens either way. What it skips is everything AFTER the match is confirmed: `walker_payload` never runs, no JSON gets built, and the body sent back is empty. The render is the expensive step it cuts, not the lookup.",
          nudge: "`fresh_when` still has to look at the record to know its current fingerprint. What's the step that only matters if the fingerprints DON'T match?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "ship-it-conditional-get-on-the-walkers-index",
      title: "Ship it: conditional GET on the walkers index",
      steps: [
        {
          type: "text",
          md: [
            "## `fresh_when` on a single record is easy. A collection needs a key.",
            "`show` fingerprints one `Walker` — simple, Rails hashes the one record. `index` returns however many walkers match the query. `fresh_when` accepts a collection too, but a collection has no single `updated_at` to hash — Rails needs you to tell it what \"freshness\" means for the whole list.",
            "The standard shape: **key on the count, and the most recent `updated_at` in the set.** If a walker is added, removed, or edited, at least one of those two numbers changes — so the ETag changes, and stale caches correctly miss. Nothing else about the list needs to change for the ETag to still catch it: renaming one walker bumps that walker's `updated_at`, which bumps `maximum(:updated_at)`, which changes the fingerprint.",
            "## Where this wins",
            "Picture a mobile client polling `/walkers` every 30 seconds so the walker list feels live. Most polls land on an unchanged list — no new walkers, no rating updates. Without conditional GET, every poll re-runs the query, re-serializes every walker, and ships the full payload over the wire. With it, most polls come back as an empty 304 in a fraction of the time, and the ones that DO carry new data are exactly the ones where something actually changed.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/walkers_controller.rb — index (before)",
          source: String.raw`def index
  walkers = Walker.order(rating: :desc)
  walkers = walkers.in_city(params[:city]) if params[:city].present?

  render json: { walkers: walkers.map { |walker| walker_payload(walker) } }
end`,
          caption: "The real, unpatched `index` — no conditional GET yet. This is what you're adding to next.",
        },
        {
          type: "exercise",
          title: "Add fresh_when to the walkers index",
          prompt: [
            "Add a `fresh_when` call to `index`, after the `walkers` relation is built (city filter included) and before the `render`. Key the ETag on `walkers` itself (Rails hashes the whole relation — record count and every id/`updated_at` pair) and set `last_modified` to the most recent `updated_at` in that same relation, so an empty result set still gets a valid, correct ETag. Guard the existing `render` with `unless performed?` — `fresh_when` doesn't halt the method on its own.",
          ],
          starter: String.raw`def index
  walkers = Walker.order(rating: :desc)
  walkers = walkers.in_city(params[:city]) if params[:city].present?

  # your code here
  render json: { walkers: walkers.map { |walker| walker_payload(walker) } }
end`,
          solution: String.raw`def index
  walkers = Walker.order(rating: :desc)
  walkers = walkers.in_city(params[:city]) if params[:city].present?

  fresh_when(etag: walkers, last_modified: walkers.maximum(:updated_at))
  render json: { walkers: walkers.map { |walker| walker_payload(walker) } } unless performed?
end`,
          checks: [
            { re: /fresh_when\(etag:walkers,last_modified:walkers\.maximum\(:updated_at\)\)/, hint: "`fresh_when(etag: walkers, last_modified: walkers.maximum(:updated_at))` — etag from the filtered relation, last_modified from its most recent update." },
            { re: /unless performed\?/, hint: "`fresh_when` sends the 304 but doesn't stop the method — guard the `render` with `unless performed?` or you'll hit `DoubleRenderError` on a fresh (non-304) request." },
          ],
          mustNot: [
            { re: /fresh_when\(walkers\)/, hint: "Passing the relation directly works for a single record, but a collection needs `etag:`/`last_modified:` keywords so Rails knows how to key it — including the count." },
          ],
          success: "That's the real fix — a poll that finds nothing new now returns an empty 304 instead of re-rendering the whole list, and the guard keeps a fresh request from double-rendering.",
        },
        {
          type: "code",
          title: "test/integration/walkers_test.rb — conditional GET",
          source: String.raw`test "index returns a 304 on a repeat request with the same ETag" do
  get "/walkers"
  assert_response :success
  etag = response.headers["ETag"]
  assert_not_nil etag

  get "/walkers", headers: { "If-None-Match" => etag }
  assert_response :not_modified
end`,
          caption: "First GET is 200 with an `ETag` header. Second GET, replaying that same ETag as `If-None-Match`, comes back 304 — this is the exact exercise you just wrote, gated by a real assertion.",
        },
        {
          type: "quiz",
          q: "Why does the collection version key the ETag on `walkers.maximum(:updated_at)` instead of just the count of walkers?",
          choices: [
            "Because editing an existing walker's rating or bio doesn't change the count, but DOES change that walker's `updated_at` — the max-updated_at catches edits that count alone would miss",
            "Because `updated_at` is required by `fresh_when` and count is optional",
            "Because count-based ETags are slower to compute than timestamp-based ones",
            "There's no real difference — either one works identically",
          ],
          answer: 0,
          explain: "Count only changes on insert/delete. Editing a walker's name or rating leaves the count untouched but bumps that row's `updated_at` — which is exactly the kind of change a caching client needs to notice. Keying on both covers additions/removals (count) AND in-place edits (max updated_at).",
          nudge: "What happens to the walkers COUNT when you rename an existing walker? Does that change need to invalidate the cache anyway?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "rails-cache-and-key-based-expiry",
      title: "Rails.cache & key-based expiry (Solid Cache)",
      steps: [
        {
          type: "text",
          md: [
            "## `fresh_when` skips the render. `Rails.cache` skips the WORK.",
            "Conditional GET saves you from re-sending bytes the client already has. It doesn't save you from re-computing the payload when the ETag DOESN'T match, or when the caller is another service (no browser cache, no `If-None-Match`) that always needs a fresh response body. For that, Rails gives you a general-purpose cache: `Rails.cache.fetch(key) { expensive_work }`.",
            "`fetch` checks the cache for `key` first. A hit returns the cached value — the block never runs. A miss runs the block, stores the result under `key`, and returns it. One method, both branches.",
          ],
        },
        {
          type: "text",
          md: [
            "## The key IS the invalidation strategy",
            "The naive instinct is: cache the payload, then remember to delete the cache entry whenever the underlying data changes. That's a manual bookkeeping problem, and manual bookkeeping problems get forgotten. Rails' idiom flips it: **encode freshness into the key itself.** `record.cache_key_with_version` returns a string like `\"walkers/1-20260703120000123456\"` — the model name, id, and `updated_at` (to the microsecond), fused together. Change the record, and `updated_at` changes, and the key changes.",
            "That means you never call a `delete`. The OLD key (`walkers/1-<old-timestamp>`) still exists in the cache store, holding stale data — but nothing ever asks for that key again, because every future request computes the NEW key from the NOW-current `updated_at`. An unreachable cache entry might as well not exist; it just ages out under whatever expiry or eviction policy the store uses, without you writing a line of invalidation code.",
          ],
        },
        {
          type: "text",
          md: [
            "## Solid Cache: this app's actual store",
            "Rails 8 ships **Solid Cache** as the default `ActiveSupport::Cache::Store` backend — a DB-backed cache (its own table, `solid_cache_entries`) instead of Redis or Memcached. The advantage for a small deploy: one less service to run, and cached entries **survive a deploy** (a restarted process reconnects to the same table; an in-process memory store would come back empty).",
            "PawWalk's `Gemfile` already has `solid_cache` in it, and `config/environments/production.rb` sets `config.cache_store = :solid_cache_store` — so `Rails.cache.fetch` in production writes to that table. Development uses `config.cache_store = :memory_store` instead (fast, per-process, fine for local iteration — and wiped on every `bin/rails server` restart, which is exactly what you want while you're editing code). Test uses `:null_store`, which never actually caches anything — every `fetch` call runs its block for real, so tests always see current data and never get a false pass from a stale cached value.",
          ],
        },
        {
          type: "code",
          title: "Wrapping an expensive payload — pattern",
          source: String.raw`def show
  walker = Walker.find(params[:id])

  payload = Rails.cache.fetch(walker.cache_key_with_version) do
    walker_payload(walker)
  end

  render json: { walker: payload }
end`,
          caption: "First request for this walker (at this `updated_at`): cache miss, block runs, `walker_payload` builds the hash, it's stored under the versioned key. Every request after that, until the walker changes: cache hit, block never runs.",
        },
        {
          type: "exercise",
          title: "Write the versioned Rails.cache.fetch",
          prompt: [
            "Write the line that wraps `walker_payload(walker)` in `Rails.cache.fetch`, keyed by `walker.cache_key_with_version` — the shape that needs no manual invalidation because the key changes whenever the walker does.",
          ],
          starter: String.raw`def show
  walker = Walker.find(params[:id])

  # your code here

  render json: { walker: payload }
end`,
          solution: String.raw`def show
  walker = Walker.find(params[:id])

  payload = Rails.cache.fetch(walker.cache_key_with_version) do
    walker_payload(walker)
  end

  render json: { walker: payload }
end`,
          checks: [
            { re: /Rails\.cache\.fetch\(walker\.cache_key_with_version\)do/, hint: "`Rails.cache.fetch(walker.cache_key_with_version) do ... end` — the versioned key, not just `walker.id`." },
            { re: /walker_payload\(walker\)/, hint: "The block's job is to build the payload — call `walker_payload(walker)` inside it." },
          ],
          mustNot: [
            { re: /Rails\.cache\.fetch\(walker\.id\)/, hint: "Keying on plain `walker.id` never changes when the walker is edited — that's a cache that never invalidates, which is worse than no cache. Use `cache_key_with_version`." },
          ],
          success: "That's the key-based expiry idiom — cache correctness with zero manual delete calls.",
        },
        {
          type: "quiz",
          q: "Why does `cache_key_with_version` need no explicit `Rails.cache.delete` call when a walker is updated?",
          choices: [
            "Updating the walker changes `updated_at`, which changes the key the code asks for next time — the old cache entry is simply never requested again, so it doesn't matter that it's still sitting in the store",
            "Rails automatically deletes old cache entries the moment `updated_at` changes on any record",
            "Solid Cache polls the database every few seconds looking for changed records to evict",
            "It does need a delete call — `cache_key_with_version` alone doesn't handle invalidation",
          ],
          answer: 0,
          explain: "Nothing proactively removes the stale entry — it just becomes unreachable. Every future read computes a key from the CURRENT `updated_at`, and that key was never written before the update, so it's a guaranteed miss that recomputes fresh data. The old entry ages out on its own via the store's expiry/eviction, not because anyone deleted it.",
          nudge: "Does anything ever call `.delete` on the OLD key in this pattern? If not, what makes the old cached value stop being served?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "when-caches-lie",
      title: "When caches lie",
      steps: [
        {
          type: "text",
          md: [
            "## Three ways a cache tells you something false",
            "Caching trades correctness risk for speed. Get the risk wrong and the cache doesn't just underperform — it actively serves wrong answers. Three classic failure modes, in order of how often you'll actually hit them:",
          ],
        },
        {
          type: "text",
          md: [
            "## 1. Stale association: the parent doesn't know the child changed",
            "`walker.cache_key_with_version` only changes when `walker.updated_at` changes. But updating a `Booking` — confirming it, cancelling it — does NOT touch the `Walker` row it belongs to. If a walker's profile card shows something derived from their bookings (their `bookings_count`, say, or a \"last booked\" date), the walker's cache key can stay frozen while the underlying booking data moves underneath it.",
            "The fix is `belongs_to :walker, touch: true` — add `touch: true` to the association, and every `Booking` save/destroy also updates `walker.updated_at` to now. That propagation is what makes `cache_key_with_version` correct again: the parent's timestamp — and therefore its cache key — now moves whenever a thing that affects it changes.",
            "This app's `Booking` already has `belongs_to :walker, counter_cache: true` from module 16. `touch` and `counter_cache` are two independent options on the *same* `belongs_to` line, and they solve different problems: `counter_cache` keeps a specific count column correct with zero reads; `touch` keeps the parent's `updated_at` (and therefore anything keyed on it, like a cache) correct. Nothing stops you from having both.",
          ],
        },
        {
          type: "code",
          title: "app/models/booking.rb — adding touch alongside counter_cache",
          source: String.raw`class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :walker, counter_cache: true, touch: true
  belongs_to :dog
  # …unchanged below…
end`,
          caption: "Same `belongs_to` line, one more keyword. `counter_cache: true` was already here from module 16; `touch: true` is additive — every booking create/update/destroy now also bumps `walker.updated_at`.",
        },
        {
          type: "text",
          md: [
            "## 2. Thundering herd: one hot key, one instant, one recompute stampede",
            "A popular walker's cached payload expires. In the same instant, 200 requests hit `show` for that walker. Every one of them sees a cache miss — because the FIRST request hasn't finished recomputing and re-storing yet — so all 200 run the expensive block concurrently, all hitting the database at once for the exact same work.",
            "`race_condition_ttl:` tells `Rails.cache.fetch` to let the first miss compute normally, but serve the (technically expired) OLD value to any request that arrives WHILE that recompute is still in flight, for up to the given number of seconds. One recompute instead of 200, at the cost of a few seconds of very-slightly-stale data on a hot key — a trade almost every read-heavy endpoint is happy to make.",
          ],
        },
        {
          type: "code",
          title: "race_condition_ttl in practice",
          source: String.raw`Rails.cache.fetch(walker.cache_key_with_version, expires_in: 5.minutes, race_condition_ttl: 10.seconds) do
  walker_payload(walker)
end`,
          caption: "When this key expires, the first request past the expiry recomputes it. Any OTHER request arriving within the next 10 seconds gets the stale-but-still-cached value instead of piling onto the same recompute.",
        },
        {
          type: "text",
          md: [
            "## 3. The privacy bug: user-specific data under a shared key",
            "The most dangerous lie: caching something under a key that doesn't encode WHO it's for. Imagine `Rails.cache.fetch(\"walker/#{walker.id}/profile\")` returning a payload that includes `current_bookings_with_this_walker` for the logged-in user. The first user to hit that endpoint gets their own bookings cached under a walker-only key — every DIFFERENT user who hits it next, for the SAME walker, gets served the FIRST user's private booking data.",
            "The fix is always the same shape: if the response depends on who's asking, the user has to be part of the key — `\"walker/#{walker.id}/profile/user/#{current_user.id}\"` — not layered on top after the fact. A cache key is a promise about what varies; leave a variable out of the key and the cache will silently pretend that variable doesn't exist.",
          ],
        },
        {
          type: "exercise",
          title: "Add touch: true to the walker association",
          prompt: [
            "Extend `Booking`'s `belongs_to :walker` line to add `touch: true` alongside the existing `counter_cache: true` — so any booking change also bumps the walker's `updated_at`.",
          ],
          starter: String.raw`class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :walker, counter_cache: true
  belongs_to :dog
end`,
          solution: String.raw`class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :walker, counter_cache: true, touch: true
  belongs_to :dog
end`,
          checks: [
            { re: /belongs_to:walker,counter_cache:true,touch:true/, hint: "`belongs_to :walker, counter_cache: true, touch: true` — add `touch: true` after the existing `counter_cache: true`, same line." },
          ],
          mustNot: [
            { re: /belongs_to:walker,touch:true\n/, hint: "Keep `counter_cache: true` too — you're adding `touch: true` alongside it, not replacing it." },
          ],
          success: "That's the real change — every booking write now keeps `walker.updated_at`, and anything keyed on it, honest.",
        },
        {
          type: "quiz",
          q: "A walker-detail endpoint caches its response under `Rails.cache.fetch(\"walker/#{walker.id}\")` and the payload includes `is_favorited_by_current_user`. What's the bug, and what's the fix?",
          choices: [
            "The key doesn't encode WHICH user is asking, so the first user's `is_favorited_by_current_user` value gets served to every other user who requests the same walker — the fix is including the user's id in the key",
            "There's no bug — `is_favorited_by_current_user` will be recomputed correctly for each request regardless of the cache key",
            "The bug is that `walker.id` shouldn't be in the key at all",
            "The fix is to lower `expires_in` so the cache clears faster",
            ],
          answer: 0,
          explain: "Any response field that varies per-caller has to be part of the cache key, or every caller after the first shares the first caller's answer — including private data like a favorite flag, a booking list, or a balance. A shorter `expires_in` shrinks the exposure window but doesn't fix the bug: it just serves the wrong user's data for less time instead of not at all.",
          nudge: "Two different users hit this endpoint for the same walker, seconds apart. Does the cache key have anything in it that tells them apart?",
        },
      ],
    },
  ],
});
