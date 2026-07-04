// Module 20 — Hardening the Public API. See FORMAT.md + FORMAT-RUBY.md for the schema.
// Modules 0-19 built the JSON API, auth, bookings, Stripe, Solid Queue/Cable, caching, a
// Hotwire admin surface, and a money ledger. This module is about surviving contact with the
// public internet: freezing a contract so clients don't break, capping what a single response
// can return, throttling abusive clients, and scanning for the security holes Rails is prone to.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "api-hardening",
  title: "Hardening the Public API",
  emoji: "🛡️",
  lang: "ruby",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "versioning",
      title: "Versioning",
      steps: [
        {
          type: "text",
          md: [
            "## Clients break when the shape changes under them",
            "The PawWalk mobile app ships to the App Store and Play Store, gets installed on thousands of phones, and then sits there — unable to force an update the instant you change `GET /walkers` on the server. If you rename `price_per_30_min_cents` to `rate_cents` tomorrow, every app still running yesterday's code crashes or shows garbage. A public API is a promise, not just an implementation detail.",
            "**Versioning** is how you keep that promise while still being able to change your mind. Freeze the CURRENT response shape behind a version marker, and when you need to break it, ship the new shape under a NEW version — old clients keep talking to the old version until they update.",
            "Two common ways to mark the version: **URL versioning** (`/v1/walkers`, `/v2/walkers` — visible, cacheable, easy to route) and **Accept-header versioning** (`Accept: application/vnd.pawwalk.v1+json` — one clean URL, but harder to test in a browser and easy for a client to forget to set). Most public APIs (Stripe, GitHub) pick URL versioning for exactly that visibility — you can see which version a request hit just by reading the path.",
          ],
        },
        {
          type: "code",
          title: "config/routes.rb — namespacing controllers under a version",
          source: String.raw`Rails.application.routes.draw do
  namespace :v1 do
    resources :walkers, only: %i[index show]
    resources :bookings, only: %i[index show create]
  end
end`,
          caption: "`namespace :v1 do ... end` does two things at once: it prefixes every route inside the block with `/v1` (so you get `/v1/walkers`), AND it tells Rails to look for the controllers in a `V1::` module — `app/controllers/v1/walkers_controller.rb` defining `class V1::WalkersController`. A `v2` namespace later can override just the endpoints that changed, while everything else keeps forwarding to `v1`.",
        },
        {
          type: "code",
          title: "app/controllers/v1/walkers_controller.rb — a versioned controller",
          source: String.raw`module V1
  class WalkersController < ApplicationController
    skip_before_action :authenticate_request

    def index
      walkers = Walker.order(rating: :desc)
      render json: { walkers: walkers.map { |w| walker_payload(w) } }
    end

    private

    def walker_payload(walker)
      { id: walker.id, name: walker.name, price_per_30_min_cents: walker.price_per_30_min_cents }
    end
  end
end`,
          caption: "Nothing about the controller's CODE changes because it's versioned — it's a completely ordinary controller. The version lives entirely in the route and the module namespace. That's the point: versioning is a routing/organizational concern, not a rewrite of your business logic.",
        },
        {
          type: "exercise",
          title: "Namespace the walkers route under v1",
          prompt: [
            "Write a `namespace :v1 do ... end` route block. Inside it, declare `resources :walkers, only: :index` — the route must be INSIDE the namespace, not next to it.",
          ],
          starter: String.raw`Rails.application.routes.draw do
  # your code here
end`,
          solution: String.raw`Rails.application.routes.draw do
  namespace :v1 do
    resources :walkers, only: :index
  end
end`,
          checks: [
            { re: /namespace:v1 do resources:walkers,only::index/, hint: "The `resources :walkers, only: :index` line has to come right after `namespace :v1 do` — it needs to be INSIDE the block, not declared separately outside it." },
            { re: /namespace:v1 do.*end/, hint: "Close the namespace block with its own `end`." },
          ],
          mustNot: [],
          success: "That's real URL versioning — every request under this block is automatically prefixed `/v1/…` and routed to a `V1::` controller.",
        },
        {
          type: "quiz",
          q: "Why version a public API at all, instead of just changing endpoints in place as the app evolves?",
          choices: [
            "Because clients (mobile apps installed on users' phones, third-party integrations) can't be forced to update the instant the server changes — freezing old response shapes behind a version keeps them working while new clients get the new shape",
            "Versioning is required by the HTTP spec for any JSON API",
            "It makes the Rails app boot faster by pre-loading each version's routes separately",
            "It's only useful for APIs with paying third-party developers — an internal-only API never needs it",
          ],
          answer: 0,
          explain: "The core problem is that you don't control when a client updates. A mobile app especially can be running months-old code against your API right now. Versioning lets the server change while a frozen contract keeps old clients working.",
          nudge: "Think about the PawWalk app already installed on someone's phone — what happens to it the moment you change a JSON field name on the server, with no version to fall back to?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "pagination",
      title: "Pagination",
      steps: [
        {
          type: "text",
          md: [
            "## Never return an unbounded collection",
            "`GET /bookings` returning `current_user.bookings` sounds harmless — until a long-time user has 4,000 bookings. Rendering all 4,000 as JSON blows up the response size, the memory used to build it, and the database query that fetched them. An UNBOUNDED collection is a liability that scales with how long someone's used your app, and a malicious or just enthusiastic client can make it worse by requesting the same big page over and over.",
            "**Offset pagination** (`page` + `per_page`, using SQL `LIMIT`/`OFFSET`) is simple and what most APIs start with — you saw a basic version of it already in the bookings index. Its weakness shows up at scale: `OFFSET 100000` still means the database walks past 100,000 rows before it can return page 100,001, and if a row gets inserted or deleted between two requests, the offset shifts and a client can see a row twice or skip one entirely.",
            "**Keyset (cursor) pagination** fixes both problems: instead of \"skip N rows,\" you ask for \"rows after the last one I saw\" — `WHERE id > last_seen_id ORDER BY id LIMIT 20`. The database can jump straight there using the index, no matter how deep you are, and rows don't shift under you since you're always anchored to a real id, not a position. The tradeoff is you can't jump to \"page 50\" directly — only walk forward from a cursor. For an API where clients scroll a feed instead of picking page numbers, keyset almost always wins at scale.",
            "Whichever you pick, one rule is non-negotiable: **always cap `per_page`**. Without a cap, a client requesting `per_page=999999` gets exactly the unbounded response you were trying to avoid — the cap is what actually enforces the limit, not the pagination scheme itself. Returning the current page (and ideally the total, or a `has_more` flag) in the response metadata lets the client know where it stands.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/bookings_controller.rb — a capped, paginated index",
          source: String.raw`class BookingsController < ApplicationController
  MAX_PER_PAGE = 100
  DEFAULT_PER_PAGE = 20

  def index
    bookings = current_user.bookings.includes(:walker, :dog).order(starts_at: :asc)
    bookings = bookings.where(status: params[:status]) if params[:status].present?

    page = params[:page].to_i.clamp(1, Float::INFINITY).to_i
    per_page = [ [ params[:per_page].to_i, 1 ].max, MAX_PER_PAGE ].min
    per_page = DEFAULT_PER_PAGE if params[:per_page].blank?

    bookings = bookings.limit(per_page).offset((page - 1) * per_page)

    render json: { bookings: bookings.map { |b| booking_payload(b) }, page: page, per_page: per_page }
  end
end`,
          caption: "`[ [params[:per_page].to_i, 1].max, MAX_PER_PAGE ].min` clamps in both directions: the inner `.max` refuses anything below 1 (so `per_page=0` or a negative number doesn't return nothing or blow up), the outer `.min` refuses anything above the cap. No matter what a client sends — `per_page=-5`, `per_page=999999`, or nothing at all — the number that reaches `.limit` is always between 1 and 100.",
        },
        {
          type: "exercise",
          title: "Clamp per_page and apply it to a scope",
          prompt: [
            "Given a `params_per_page` string/int and a `scope` (an ActiveRecord relation), clamp `per_page` between 1 and 100 using the `[[x, 1].max, 100].min` pattern, then return `scope.limit(per_page)`.",
          ],
          starter: String.raw`def paginate(scope, params_per_page)
  # your code here
end`,
          solution: String.raw`def paginate(scope, params_per_page)
  per_page = [ [ params_per_page.to_i, 1 ].max, 100 ].min
  scope.limit(per_page)
end`,
          checks: [
            { re: /per_page=\[\[params_per_page\.to_i,1\]\.max,100\]\.min/, hint: "Clamp with the nested pattern: `[[params_per_page.to_i, 1].max, 100].min` — inner `.max` floors it at 1, outer `.min` caps it at 100." },
            { re: /scope\.limit\(per_page\)/, hint: "The method must return `scope.limit(per_page)` — apply the clamped value to the scope, don't just compute it and drop it." },
          ],
          mustNot: [],
          success: "That clamp is the one line standing between a normal request and a client accidentally (or deliberately) asking your database for a million rows.",
        },
        {
          type: "quiz",
          q: "Why does keyset (cursor) pagination scale better than offset pagination for very deep pages?",
          choices: [
            "Offset pagination makes the database walk past every skipped row to reach a deep page (`OFFSET 100000` still scans 100,000 rows); keyset pagination jumps straight to `WHERE id > last_seen_id` using the index, regardless of how deep you are",
            "Keyset pagination doesn't need a `LIMIT` at all, so it always returns instantly",
            "Offset pagination is a made-up problem — real databases execute `OFFSET` in constant time no matter the value",
            "Keyset pagination is only about JSON response size, not database query cost",
          ],
          answer: 0,
          explain: "Offset pagination's `OFFSET N` still means the database has to count past N rows before it can start returning results — cost grows with how deep you page. Keyset pagination anchors to a real value (like the last id seen) and uses the index to jump straight there, so a deep page costs about the same as a shallow one.",
          nudge: "Think about what `OFFSET 100000 LIMIT 20` literally asks the database to do before it returns your 20 rows.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "rate-limiting-with-rack-attack",
      title: "Rate limiting with rack-attack",
      steps: [
        {
          type: "text",
          md: [
            "## Protecting the API from abuse and runaway clients",
            "Pagination caps how much a single request can cost you. **Rate limiting** caps how many requests a single client can make in a stretch of time — the other half of protecting the API from abuse, whether that's a scraper hammering `/walkers`, a buggy client stuck retrying in a tight loop, or a real attacker probing `/login`.",
            "`rack-attack` is a gem that does this as **Rack middleware** — meaning it runs BEFORE your request ever reaches a Rails controller. A throttled request never touches `current_user`, never queries the database, never runs any of your application code at all; rack-attack just returns a `429 Too Many Requests` response straight from the middleware layer. That's a deliberate design choice: the whole point of protecting against abuse is to reject cheaply, before the expensive parts of your stack ever get involved.",
            "A `throttle` block gives rack-attack a name, a `limit`, a `period`, and a block that returns the thing to count by (an IP, an API token, a user id — whatever identifies \"one client\"). Once a client crosses `limit` requests within `period`, rack-attack starts returning 429 for the rest of that window. The `429` status itself is the client's cue: it means \"you're fine, just slow down\" — not a permanent ban, just back-pressure.",
            "This is the exact same idea as the Python course's rate-limit module, just at a different layer: there, a decorator wraps one endpoint function inside the app; here, middleware wraps the WHOLE app before any endpoint runs. Same concept — cap how often something can happen in a window — applied one layer earlier.",
          ],
        },
        {
          type: "code",
          title: "config/initializers/rack_attack.rb",
          source: String.raw`class Rack::Attack
  throttle("api/ip", limit: 300, period: 5.minutes) do |req|
    req.ip
  end
end

Rack::Attack.enabled = false if Rails.env.test?`,
          caption: "`throttle(\"api/ip\", limit: 300, period: 5.minutes) do |req| req.ip end` reads as: track requests by `req.ip`, and once one IP crosses 300 requests in a 5-minute window, start rejecting the rest with a 429. `Rack::Attack.enabled = false if Rails.env.test?` matters just as much as the throttle itself — without it, a test suite that fires hundreds of requests (this one runs 71+ tests, many hitting the same endpoints) would start tripping its OWN rate limit and fail for a reason that has nothing to do with the code being tested.",
        },
        {
          type: "exercise",
          title: "Write the IP throttle block",
          prompt: [
            "Write a `throttle` call named `\"api/ip\"`, with `limit: 300` and `period: 5.minutes`, whose block takes `req` and returns `req.ip`.",
          ],
          starter: String.raw`class Rack::Attack
  # your code here
end`,
          solution: String.raw`class Rack::Attack
  throttle("api/ip", limit: 300, period: 5.minutes) do |req|
    req.ip
  end
end`,
          checks: [
            { re: /throttle\("api\/ip",limit:300,period:5\.minutes\)do\|req\|/, hint: "The block signature comes right after the throttle call opens: `throttle(\"api/ip\", limit: 300, period: 5.minutes) do |req|` — name, limit, and period are keyword arguments to `throttle`." },
            { re: /do\|req\|req\.ip end/, hint: "The block's only job is to return `req.ip` — that's what rack-attack counts requests by. It has to be the line right inside `do |req|`, not sitting outside the block." },
          ],
          mustNot: [],
          success: "That's a real rack-attack throttle — 300 requests per IP per 5 minutes, enforced before a single line of your controller code runs.",
        },
        {
          type: "quiz",
          q: "Where does rate limiting with rack-attack actually happen, relative to your Rails controllers?",
          choices: [
            "In Rack middleware, BEFORE the request reaches any controller — a throttled request gets a 429 straight from the middleware and never runs your application code at all",
            "Inside `ApplicationController`, as a `before_action` that every controller inherits",
            "In the database, as a query that counts recent requests per user before each controller action runs",
            "It happens in the JSON response — rack-attack lets every request through but marks throttled ones with a warning field",
          ],
          answer: 0,
          explain: "rack-attack is Rack middleware, which sits in front of the whole Rails app. That's what makes it cheap to reject abuse with: a throttled request never allocates a controller, never touches `current_user`, never queries the database — it's stopped before any of that expensive machinery runs.",
          nudge: "Rack middleware runs in the request/response cycle BEFORE Rails routing even picks a controller — what does that mean for how much work a rejected request costs you?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "security-scanning",
      title: "Security scanning",
      steps: [
        {
          type: "text",
          md: [
            "## Catching security holes before they ship",
            "Rate limiting and pagination guard against abuse from the OUTSIDE. `brakeman` guards against mistakes from the INSIDE — it's a static analyzer that reads your Rails source (no running app, no database, no network calls) and flags patterns known to cause real vulnerabilities: SQL injection (building a query with raw string interpolation instead of a bound parameter), mass assignment (blindly trusting every field a client sends), unsafe redirects (redirecting to a URL a client controls), and more. Running it is a normal part of shipping — add it to the Gemfile, run it locally before a release, and wire it into CI so a vulnerable pattern can't merge unnoticed.",
            "You've actually been practicing brakeman's favorite fix since module 8: **strong parameters**. `params.permit(:walker_id, :dog_id)` is Rails' guard against mass assignment — without it, a client could stuff EXTRA fields into a request body (`status: \"completed\"`, `price_cents: 1`) and have them silently written to the record, because `params` is really just whatever JSON the client felt like sending. `.permit` is an explicit allowlist: only the fields you name make it through, everything else is dropped before it ever reaches `.build` or `.update`.",
            "One more line worth knowing: **secure headers** (like `X-Content-Type-Options: nosniff` or a `Content-Security-Policy`) tell the BROWSER how to treat your responses defensively — Rails 8's `config.action_dispatch.default_headers` sets sane ones out of the box for an HTML app. An `api_only` JSON app like PawWalk's has less browser surface to defend, but it's the same category of \"catch the mistake before it matters\" thinking that `brakeman` and strong params both live in.",
          ],
        },
        {
          type: "code",
          title: "Gemfile + app/controllers/bookings_controller.rb — brakeman and strong params",
          source: String.raw`group :development, :test do
  gem "brakeman", require: false
end`,
          caption: "`require: false` because brakeman is a command-line tool (`bin/brakeman` or `bundle exec brakeman`), not a library your app code calls at runtime — there's no reason to load it into every boot, only when you actually run the scan.",
        },
        {
          type: "exercise",
          title: "Write strong params for a booking update",
          prompt: [
            "Write a private method `booking_update_params` that calls `params.require(:booking)` and `.permit` on exactly two fields: `:duration_min` and `:starts_at`.",
          ],
          starter: String.raw`private

def booking_update_params
  # your code here
end`,
          solution: String.raw`private

def booking_update_params
  params.require(:booking).permit(:duration_min, :starts_at)
end`,
          checks: [
            { re: /params\.require\(:booking\)/, hint: "Start with `params.require(:booking)` — this raises a 400 automatically if the client forgot to wrap the fields under a `booking` key at all." },
            { re: /\.permit\(:duration_min,:starts_at\)/, hint: "Chain `.permit(:duration_min, :starts_at)` onto the `require` — name both fields; anything the client sends outside this allowlist gets silently dropped." },
          ],
          mustNot: [],
          success: "That's the exact guard mass-assignment vulnerabilities run into — a client can send whatever extra fields it wants, but only `duration_min` and `starts_at` ever reach your model.",
        },
        {
          type: "quiz",
          q: "What class of bug does brakeman specialize in catching, and how does it catch it?",
          choices: [
            "Security vulnerabilities in Rails-specific patterns (SQL injection, mass assignment, unsafe redirects) — caught by statically reading the source code, with no running app or database needed",
            "Performance problems like N+1 queries — caught by watching a running app's query log",
            "Style violations like inconsistent spacing — the same category rubocop covers",
            "Broken tests — brakeman runs your test suite and reports which assertions fail",
          ],
          answer: 0,
          explain: "brakeman is a static analyzer: it parses your Rails source looking for known-dangerous patterns and never actually executes your app. That's what makes it fast to run and useful in CI — it catches a whole class of security mistakes (injection, mass assignment, unsafe redirects) before the code ever ships, purely by reading it.",
          nudge: "brakeman never boots your Rails server or hits your database — so what is it actually looking at to find a vulnerability?",
        },
      ],
    },
  ],
});
