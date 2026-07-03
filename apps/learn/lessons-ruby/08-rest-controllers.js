window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "rest-controllers",
  title: "REST & JSON Controllers",
  emoji: "🔌",
  lang: "ruby",
  lessons: [
    {
      id: "render-json",
      title: "render json:",
      steps: [
        {
          type: "text",
          md: [
            "## dogpark has been HTML this whole time",
            "Every controller action you've written so far — the scaffolded `Walker` views back in an earlier module — renders an `.html.erb` template. A browser asks for `/walkers`, Rails hands back a full HTML page. That's the ONLY thing a browser can display directly, so it made sense while you were learning Rails' shape.",
            "But PawWalk's real clients are iOS and (later) Android apps. They don't want a page — they want data: a JSON object they can decode into a `Walker` struct. Rails controllers don't care what format they respond in; `render` just needs a different argument.",
          ],
        },
        {
          type: "text",
          md: [
            "## An API namespace, and `render json:`",
            "Route JSON endpoints under `/api/...` so they live alongside the HTML routes without colliding — a `namespace` block in `routes.rb` prefixes both the URL and the controller's module:",
            "```\nnamespace :api do\n  resources :walkers, only: %i[index show]\nend\n```",
            "That generates `/api/walkers` and `/api/walkers/:id`, routed to a controller class Rails expects to find nested under an `Api` module: `Api::WalkersController`. Inside it, swap `render :index` (a template) for `render json:` (a Ruby value, serialized to a JSON string):",
            "```\nclass Api::WalkersController < ApplicationController\n  def index\n    render json: Walker.all\n  end\nend\n```",
            "That's genuinely enough to work — hit `/api/walkers` and you get back a JSON array of every column on every walker. `render json:` accepts almost anything: a Hash, an Array, an ActiveRecord relation. It calls `.to_json` under the hood either way.",
          ],
        },
        {
          type: "text",
          md: [
            "## Why `Walker.all` isn't good enough",
            "`render json: Walker.all` dumps every database column, in whatever order ActiveRecord happens to store them, including columns you may never want a client to see (imagine an internal `admin_notes` field added later). The fix isn't a gem — it's a plain Ruby method that builds exactly the hash you want to expose:",
            "```\nclass Api::WalkersController < ApplicationController\n  def index\n    walkers = Walker.all\n\n    render json: { walkers: walkers.map { |walker| walker_payload(walker) } }\n  end\n\n  private\n\n  def walker_payload(walker)\n    {\n      id: walker.id,\n      name: walker.name,\n      city: walker.city,\n      price_label: walker.price_label\n    }\n  end\nend\n```",
            "`.map` (module 02) turns the relation into an array of plain hashes, one per walker, using a private helper so the shaping logic lives in one place instead of being copy-pasted into `show` too. Wrapping the array in `{ walkers: ... }` also matters: a bare top-level JSON array is an old security footgun in some browsers, and a wrapper key gives you somewhere to add `{ walkers: [...], total: 12 }`-style metadata later without a breaking change.",
            "**This hand-written helper is exactly how the real PawWalk backend works.** No serializer gem, no auto-generated schema — `apps/pawwalk-api`'s actual `WalkersController#walker_payload` is this same pattern, verbatim.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/api/walkers_controller.rb",
          source: String.raw`class Api::WalkersController < ApplicationController
  def index
    walkers = Walker.all

    render json: { walkers: walkers.map { |walker| walker_payload(walker) } }
  end

  def show
    walker = Walker.find(params[:id])

    render json: { walker: walker_payload(walker) }
  end

  private

  def walker_payload(walker)
    {
      id: walker.id,
      name: walker.name,
      city: walker.city,
      price_label: walker.price_label
    }
  end
end`,
          caption: "Two actions, one shared private helper. `show` reuses `walker_payload` instead of re-listing the fields — the exact DRY instinct module 07 already built into your model scopes.",
        },
        {
          type: "code",
          title: "Terminal — curl it",
          source: String.raw`$ curl http://localhost:3000/api/walkers
{"walkers":[{"id":1,"name":"Priya","city":"Austin","price_label":"$25 / 30 min"},{"id":2,"name":"Sam","city":"Austin","price_label":"$20 / 30 min"},{"id":3,"name":"Ana","city":"Denver","price_label":"$30 / 30 min"}]}

$ curl http://localhost:3000/api/walkers/1
{"walker":{"id":1,"name":"Priya","city":"Austin","price_label":"$25 / 30 min"}}`,
          caption: "Real output from a real dogpark server. Notice exactly the fields `walker_payload` lists — nothing more, nothing less.",
        },
        {
          type: "quiz",
          q: "Why write a private `walker_payload(walker)` helper instead of just `render json: Walker.all`?",
          choices: [
            "It shapes the response to exactly the fields you want exposed, in one place reused by every action — `Walker.all` dumps every raw column with no control over what's public",
            "`render json: Walker.all` doesn't work at all — Rails requires a payload helper for any JSON response",
            "It makes the response render faster, with no effect on which fields appear",
            "It's required so `curl` can parse the response",
          ],
          answer: 0,
          explain: "`render json: Walker.all` technically works, but it leaks every database column verbatim and duplicates field-listing logic across every action that needs it. A small helper hash gives you an explicit, reusable contract for what the API actually promises to clients.",
          nudge: "Think about what `Walker.all`'s raw JSON contains versus what `walker_payload` returns — which one would you rather promise to an iOS client forever?",
        },
        {
          type: "exercise",
          title: "Shape the index action",
          prompt: [
            "Given the private `walker_payload(walker)` helper already defined below, write the `index` action: fetch `Walker.all` into a local `walkers`, then `render json:` a hash with one key, `walkers`, whose value maps each walker through `walker_payload`.",
          ],
          starter: String.raw`class Api::WalkersController < ApplicationController
  def index
    # your code here
  end

  private

  def walker_payload(walker)
    { id: walker.id, name: walker.name }
  end
end`,
          solution: String.raw`class Api::WalkersController < ApplicationController
  def index
    walkers = Walker.all
    render json: { walkers: walkers.map { |walker| walker_payload(walker) } }
  end

  private

  def walker_payload(walker)
    { id: walker.id, name: walker.name }
  end
end`,
          checks: [
            { re: /walkers=Walker\.all/, hint: "Fetch every walker first: `walkers = Walker.all`." },
            { re: /render json:\{walkers:walkers\.map\{\|walker\|walker_payload\(walker\)\}\}/, hint: "Render a hash with one `walkers` key: `render json: { walkers: walkers.map { |walker| walker_payload(walker) } }`." },
          ],
          mustNot: [
            { re: /render json:Walker\.all/, hint: "Don't render the raw relation directly — shape it through `walker_payload` first." },
          ],
          success: "That's the real `index` action from apps/pawwalk-api's WalkersController, field for field.",
        },
      ],
    },
    {
      id: "params-strong-params",
      title: "Params & Strong Params",
      steps: [
        {
          type: "text",
          md: [
            "## One hash, three sources",
            "Every controller action has access to a `params` hash, and it doesn't care WHERE a value came from — Rails merges three different sources into that one hash before your action ever runs:",
            "- **Path params** — captured from the URL itself by the route: `/api/walkers/:id` means `params[:id]` is whatever segment sat where `:id` was.\n- **Query params** — the `?key=value` part of the URL: `/api/walkers?city=Austin` means `params[:city]` is `\"Austin\"`.\n- **Body params** — a JSON object sent in a POST/PATCH request body, parsed automatically into the same hash.",
            "You've already used the first two without naming them: `Walker.find(params[:id])` reads a path param, and `walkers.in_city(params[:city]) if params[:city].present?` (a real line from `apps/pawwalk-api`) reads a query param straight into the scope you built in module 07.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/api/walkers_controller.rb — filtering by query param",
          source: String.raw`def index
  walkers = Walker.all
  walkers = walkers.in_city(params[:city]) if params[:city].present?

  render json: { walkers: walkers.map { |walker| walker_payload(walker) } }
end`,
          caption: "`curl \"http://localhost:3000/api/walkers?city=Austin\"` filters the exact same `index` action down to Austin-only walkers — the `in_city` scope from module 07, called with a query param instead of a hardcoded string.",
        },
        {
          type: "text",
          md: [
            "## Body params and a naive create",
            "A POST request's JSON body lands in `params` too. The naive version just hands the whole thing to `Walker.create!`:",
            "```\ndef create\n  walker = Walker.create!(params[:walker])\n  render json: { walker: walker_payload(walker) }, status: :created\nend\n```",
            "That line should make you nervous, and Rails agrees — it actually refuses to run `Walker.create!` on a bare `params[:walker]` at all, raising `ForbiddenAttributesError`. Here's why that protection exists.",
          ],
        },
        {
          type: "text",
          md: [
            "## Mass assignment: the 2012 GitHub story",
            "Picture `Walker.create!(params[:walker])` actually working, no questions asked. Now picture a client — not your iOS app, anyone with `curl` — sending this instead of `{\"walker\":{\"name\":\"Jon\",\"city\":\"Austin\"}}`:",
            "```\n{\"walker\": {\"name\": \"Jon\", \"city\": \"Austin\", \"admin\": true}}\n```",
            "If `Walker` ever grows an `admin` column and nothing stops it, that single extra key silently promotes the new row to admin — no exploit, no cleverness, just a hash with one more key than you expected. This is **mass assignment**, and it's not hypothetical: in 2012, someone did almost exactly this to Rails-hosted GitHub itself, pushing arbitrary commits by mass-assigning a public key onto another user's account. Rails' response was to make unfiltered mass assignment impossible by default, everywhere.",
          ],
        },
        {
          type: "text",
          md: [
            "## Strong params: an explicit allowlist",
            "`params.require(:walker).permit(:name, :city, :price_per_30_min_cents)` is the fix, read left to right: **require** a top-level `:walker` key to even exist (raising `ActionController::ParameterMissing`, a 400-level error, if it's absent), then **permit** exactly those three keys — anything else on the incoming hash (`admin`, `id`, whatever) is silently stripped, never reaching `.create!` at all.",
            "```\ndef create\n  walker = Walker.create!(walker_params)\n  render json: { walker: walker_payload(walker) }, status: :created\nend\n\nprivate\n\ndef walker_params\n  params.require(:walker).permit(:name, :city, :price_per_30_min_cents)\nend\n```",
            "That `admin: true` from the attack above just gets dropped on the floor — `walker_params` never had `:admin` on its allowlist, so it isn't there to assign. This is real, running dogpark behavior, not a hypothetical: sending an unpermitted `id` in the JSON body gets logged and ignored, and the walker still gets created with the next sequential id, exactly as if the extra key had never been sent.",
          ],
        },
        {
          type: "quiz",
          q: "A malicious client sends `{\"walker\": {\"name\": \"Jon\", \"admin\": true}}` to `Walker.create!(walker_params)`, where `walker_params` is `params.require(:walker).permit(:name, :city, :price_per_30_min_cents)`. What happens to `admin: true`?",
          choices: [
            "It's silently dropped — `.permit` only lets the listed keys through, `:admin` was never on the allowlist",
            "It gets assigned — `.permit` only blocks keys that don't exist as columns",
            "The whole request fails with a 500 error because of the unexpected key",
            "It's stored, but only readable by other admins",
          ],
          answer: 0,
          explain: "`.permit(:name, :city, :price_per_30_min_cents)` is an allowlist, not a validator — any key not named survives filtering by simply not being copied into the permitted hash. `Walker.create!` never even sees `admin`.",
          nudge: "Strong params work like a bouncer with a guest list, not a security guard checking IDs against a blocklist. Is `:admin` on the guest list in this example?",
        },
        {
          type: "exercise",
          title: "Write the strong-params method",
          prompt: [
            "Define a private method `walker_params` that requires a top-level `:walker` key and permits exactly `:name`, `:city`, and `:price_per_30_min_cents`.",
          ],
          starter: String.raw`class Api::WalkersController < ApplicationController
  private

  # your code here
end`,
          solution: String.raw`class Api::WalkersController < ApplicationController
  private

  def walker_params
    params.require(:walker).permit(:name, :city, :price_per_30_min_cents)
  end
end`,
          checks: [
            { re: /def walker_params/, hint: "Name it exactly `walker_params` — Rails convention for this helper." },
            { re: /params\.require\(:walker\)\.permit\(:name,:city,:price_per_30_min_cents\)/, hint: "Chain `.require(:walker)` then `.permit(:name, :city, :price_per_30_min_cents)`." },
          ],
          mustNot: [
            { re: /Walker\.create!\(params\[:walker\]\)/, hint: "This exercise is just the params method — no bare `params[:walker]` anywhere near `.create!`." },
          ],
          success: "That's the exact allowlist that stops a stray `admin: true` from ever reaching the database.",
        },
      ],
    },
    {
      id: "before-action-thin-controllers",
      title: "before_action & Thin Controllers",
      steps: [
        {
          type: "text",
          md: [
            "## Repeating yourself across show/update/destroy",
            "`show`, `update`, and `destroy` all start the same way: look a walker up by `params[:id]`. Writing `walker = Walker.find(params[:id])` three separate times isn't wrong, but it's the kind of duplication Ruby always has a DRYer answer for. A **`before_action`** runs a method before the listed actions, every time:",
            "```\nclass Api::BookingsController < ApplicationController\n  before_action :set_booking, only: %i[show destroy]\n\n  def show\n    render json: { booking: booking_payload(@booking) }\n  end\n\n  def destroy\n    @booking.destroy!\n    head :no_content\n  end\n\n  private\n\n  def set_booking\n    @booking = Booking.find(params[:id])\n  end\nend\n```",
            "`only: %i[show destroy]` scopes it — `index` and `create` don't have an `:id` to look up yet, so they'd crash if `set_booking` ran for them too. The lookup happens once, in one place, and every listed action can just assume `@booking` is already there.",
          ],
        },
        {
          type: "text",
          md: [
            "## Thin controllers: traffic cop, not the law",
            "A controller's job is narrow on purpose: **find** the record, **authorize** the request (module 10 builds real auth), and **respond** with the right status and payload. Business logic — validations, computing a price, deciding what counts as a valid booking — belongs on the MODEL, not the controller. You already felt this in module 07: `compute_price!` and the `upcoming`/`for_walker` scopes live on `Booking` and `Walker`, not scattered across controller actions.",
            "That split is why `Api::BookingsController#create` reads as four short lines instead of a wall of validation `if`s: `Booking.new(...)`, `compute_price!`, `save!`, `render`. The controller directs traffic; the model does the actual work.",
          ],
        },
        {
          type: "text",
          md: [
            "## The real ApplicationController — centralized error handling",
            "One more piece of \"controllers stay thin\": what happens when `Walker.find` can't find anything, or `save!` hits a validation failure? Neither `show` nor `create` handles that with a `rescue` of its own — `ApplicationController` catches both, for every controller that inherits from it, in one place:",
          ],
        },
        {
          type: "code",
          title: "apps/pawwalk-api/app/controllers/application_controller.rb",
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
          caption: "This is the real file. `rescue_from` says \"if THIS exception ever bubbles up from any action of any controller that inherits from me, run THIS handler instead of crashing.\" Every controller gets a 404 for a missing record and a 422 for a failed validation for free — you build the `Authentication` concern it references in module 10.",
        },
        {
          type: "quiz",
          q: "`Api::BookingsController#show` calls `Booking.find(params[:id])`, which raises `ActiveRecord::RecordNotFound` for a missing id. Where does that exception actually get handled?",
          choices: [
            "In `ApplicationController`, via `rescue_from ActiveRecord::RecordNotFound, with: :render_not_found` — every controller inherits this for free",
            "Inside `show` itself, with a `begin/rescue` block you must write in every action",
            "It isn't handled — the request just crashes with a 500 and an HTML stack trace",
            "Rails silently returns `nil` instead of raising anything",
          ],
          answer: 0,
          explain: "`rescue_from` is declared once on `ApplicationController` and applies to every action of every controller beneath it in the inheritance chain — that's centralized error handling. No individual action needs its own rescue for the common cases.",
          nudge: "Look at where `rescue_from ActiveRecord::RecordNotFound` is declared — on `show` itself, or somewhere every controller shares?",
        },
        {
          type: "exercise",
          title: "Add a before_action lookup",
          prompt: [
            "In `Api::BookingsController`, add a `before_action :set_booking, only: %i[show destroy]`. Then define the private `set_booking` method setting `@booking` to `Booking.find(params[:id])`.",
          ],
          starter: String.raw`class Api::BookingsController < ApplicationController
  # your code here

  def show
    render json: { booking: booking_payload(@booking) }
  end

  def destroy
    @booking.destroy!
    head :no_content
  end

  private
end`,
          solution: String.raw`class Api::BookingsController < ApplicationController
  before_action :set_booking, only: %i[show destroy]

  def show
    render json: { booking: booking_payload(@booking) }
  end

  def destroy
    @booking.destroy!
    head :no_content
  end

  private

  def set_booking
    @booking = Booking.find(params[:id])
  end
end`,
          checks: [
            { re: /before_action:set_booking,only:%i\[show destroy\]/, hint: "Declare it near the top: `before_action :set_booking, only: %i[show destroy]`." },
            { re: /def set_booking/, hint: "Name the callback method `set_booking` — it has to match the symbol passed to `before_action`." },
            { re: /@booking=Booking\.find\(params\[:id\]\)/, hint: "Inside `set_booking`, assign `@booking = Booking.find(params[:id])`." },
          ],
          mustNot: [
            { re: /only:%i\[show destroy create\]/, hint: "Only `show` and `destroy` need a lookup by id — `create` doesn't have one yet." },
          ],
          success: "One lookup, shared by two actions — this is the exact `before_action` shape you'll reuse constantly starting in module 09.",
        },
      ],
    },
    {
      id: "status-codes-done-right",
      title: "Status Codes Done Right",
      steps: [
        {
          type: "text",
          md: [
            "## Recap: the status-code families (module 05)",
            "Module 05 grouped HTTP status codes by their first digit: **2xx** means success, **4xx** means the CLIENT made a mistake, **5xx** means the SERVER broke. A JSON API leans on that grouping constantly — the exact number inside each family tells the client precisely what happened, which matters when the client is Swift code deciding whether to retry, show a form error, or alert the user.",
          ],
        },
        {
          type: "text",
          md: [
            "## `:created` — 201, not 200",
            "Rails defaults every `render` to `200 OK` if you don't say otherwise. That's wrong for `create` — the resource didn't just succeed, it came into existence for the first time, and REST convention has a status specifically for that: **201 Created**.",
            "```\ndef create\n  booking = current_user.bookings.build(booking_params)\n  booking.compute_price!\n  booking.save!\n\n  render json: { booking: booking_payload(booking) }, status: :created\nend\n```",
            "`status: :created` is Rails' symbol shorthand for `201`; you could write `status: 201` and it'd behave identically, but the symbol form self-documents at a glance.",
          ],
        },
        {
          type: "text",
          md: [
            "## `head :no_content` — 204, no body at all",
            "A `destroy` action has nothing left to describe once the row is gone — there's no JSON worth sending back. **`head :no_content`** sends a bare `204 No Content` response: the right status, zero bytes of body, no `render json:` needed because there's nothing to render:",
            "```\ndef destroy\n  @booking.destroy!\n  head :no_content\nend\n```",
          ],
        },
        {
          type: "text",
          md: [
            "## `:unprocessable_content` — 422, from a failed validation",
            "You already met this one: `save!`/`create!`/`update!` raise `ActiveRecord::RecordInvalid` the instant a model validation fails, and `ApplicationController`'s `rescue_from` catches it and responds with **422** — the client sent a well-formed request, but the DATA in it fails business rules (a blank name, a negative price). That's different from a 400: the request itself parsed fine, its contents just aren't valid.",
          ],
        },
        {
          type: "text",
          md: [
            "## `:not_found` — 404, via rescue_from",
            "Same idea, different rescue: `Model.find(missing_id)` raises `ActiveRecord::RecordNotFound`, caught by the OTHER `rescue_from` line in `ApplicationController`, responding **404**. Neither of these two rescues needs a single line of code in `Api::WalkersController` or `Api::BookingsController` themselves — they're inherited, for every action, automatically.",
          ],
        },
        {
          type: "code",
          title: "Terminal — curl -i each one",
          source: String.raw`$ curl -i -X POST http://localhost:3000/api/bookings \
  -d '{"booking":{"walker_id":1,"dog_id":1,"starts_at":"2026-08-01T10:00:00Z","duration_min":30}}' \
  -H "Content-Type: application/json"
HTTP/1.1 201 Created
{"booking":{"id":2,"status":"pending","starts_at":"2026-08-01T10:00:00.000Z","duration_min":30,"price_cents":2500}}

$ curl -i -X DELETE http://localhost:3000/api/bookings/1
HTTP/1.1 204 No Content

$ curl -i -X POST http://localhost:3000/api/bookings \
  -d '{"booking":{"walker_id":1,"dog_id":1,"starts_at":"2026-08-01T10:00:00Z","duration_min":45}}' \
  -H "Content-Type: application/json"
HTTP/1.1 422 Unprocessable Content
{"errors":["Duration min is not included in the list"]}

$ curl -i http://localhost:3000/api/bookings/999
HTTP/1.1 404 Not Found
{"error":"not found"}`,
          caption: "All four transcripts are real output from dogpark's server. `duration_min: 45` fails `Booking`'s `inclusion: { in: [30, 60] }` validation from module 07 — the 422 and its error message come entirely from that one validation line, with zero controller code written for it.",
        },
        {
          type: "quiz",
          q: "Match the action to its correct status when it succeeds: (1) create a new booking, (2) destroy a booking, (3) a `find` that hits a missing id, (4) a `save!` that fails validation.",
          choices: [
            "(1) 201 Created (2) 204 No Content (3) 404 Not Found (4) 422 Unprocessable Content",
            "(1) 200 OK (2) 200 OK (3) 400 Bad Request (4) 500 Internal Server Error",
            "(1) 202 Accepted (2) 410 Gone (3) 403 Forbidden (4) 409 Conflict",
            "All four should return 200 — the JSON body is what communicates success or failure, not the status code",
          ],
          answer: 0,
          explain: "201 for a resource that now exists, 204 for a successful action with nothing left to show, 404 for a record that isn't there, 422 for data that failed validation — each status tells the client precisely what class of thing happened, before it even parses the body.",
          nudge: "Which status means 'created something new'? Which means 'succeeded but there's no body'? Which two are about something being WRONG, and how do they differ?",
        },
        {
          type: "exercise",
          title: "The create action, with proper statuses",
          prompt: [
            "Write the `create` action: build a `booking` from `Booking.new(booking_params)`, call `booking.compute_price!`, then `booking.save!`. Render `{ booking: booking_payload(booking) }` with `status: :created`.",
          ],
          starter: String.raw`class Api::BookingsController < ApplicationController
  def create
    # your code here
  end
end`,
          solution: String.raw`class Api::BookingsController < ApplicationController
  def create
    booking = Booking.new(booking_params)
    booking.compute_price!
    booking.save!

    render json: { booking: booking_payload(booking) }, status: :created
  end
end`,
          checks: [
            { re: /booking=Booking\.new\(booking_params\)/, hint: "Build first: `booking = Booking.new(booking_params)`." },
            { re: /booking\.compute_price!/, hint: "Compute the server-derived price: `booking.compute_price!`." },
            { re: /booking\.save!/, hint: "Persist with the bang version so a validation failure raises (and `rescue_from` turns it into a 422): `booking.save!`." },
            { re: /status::created/, hint: "Render with `status: :created` — the 201 for a newly-created resource." },
          ],
          mustNot: [
            { re: /status::ok/, hint: "A create action wants `:created` (201), not the default `:ok` (200)." },
          ],
          success: "Three lines to build and persist, one line to respond with the right status — this is the real Api::BookingsController#create.",
        },
      ],
    },
    {
      id: "api-only-rails-bridge",
      title: "API-only Rails & the Bridge",
      steps: [
        {
          type: "text",
          md: [
            "## dogpark carried baggage it never needed",
            "Every dogpark app you've built inherits from `ActionController::Base` — the full Rails controller, built for a browser: it can render HTML templates, read and write cookies, flash a message between requests, and defend against cross-site form attacks. None of that ever mattered for `/api/walkers` — you were shaping a JSON hash from the very first line of this module. It worked, but the app was carrying weight it never used.",
            "`rails new --api` builds a DIFFERENT kind of app from the ground up: one that assumes every response is JSON and never generates a browser page at all.",
          ],
        },
        {
          type: "code",
          title: "apps/pawwalk-api/app/controllers/application_controller.rb",
          source: String.raw`class ApplicationController < ActionController::API`,
          caption: "The real PawWalk backend's very first line. Not `ActionController::Base` — `ActionController::API`, a smaller superclass with an entirely different set of built-in behavior.",
        },
        {
          type: "text",
          md: [
            "## What actually changes",
            "- **No `app/views` at all.** `rails new --api` doesn't even generate the directory — there is nothing to render as a template, ever.\n- **`ActionController::API` instead of `ActionController::Base`.** It drops cookies, sessions, flash messages, and CSRF protection — all of it exists to serve a browser tab, and a mobile client and a `curl` command have neither a cookie jar nor a form to forge.\n- **A slimmer middleware stack.** Every request passes through Rack middleware before it reaches your controller; API-only mode drops the ones a JSON API never needs.",
            "Comparing `rails middleware` on a real dogpark app against a fresh `--api` app shows the difference honestly — these are actual diffs, not a hypothetical:",
            "```\n# dogpark (ActionController::Base) has, and --api DROPS:\nuse Propshaft::Server                              # asset pipeline\nuse Rack::MethodOverride                           # lets an HTML <form> fake PUT/DELETE\nuse ActionDispatch::Cookies                        # cookie jar\nuse ActionDispatch::Session::CookieStore           # session-in-a-cookie\nuse ActionDispatch::Flash                          # cross-request flash messages\nuse ActionDispatch::ContentSecurityPolicy::Middleware\nuse Rack::TempfileReaper\n```",
            "Every one of those exists to support a browser rendering pages and submitting forms. A JSON API talking to native apps has no session cookie, no `<form>` to fake a DELETE from, no CSP header protecting a page it never serves — so `--api` mode just doesn't load them.",
          ],
        },
        {
          type: "text",
          md: [
            "## PawWalk was born API-only",
            "dogpark had to carry that view baggage because it started as a browser-facing scaffold in module 06 — that's a fine way to learn Rails' shape, but it's not how you'd start a real mobile backend. `apps/pawwalk-api` skipped all of it: `rails new --api` from day one, because its ONLY clients are the iOS app (and later Android) — never a browser tab. There was never a reason to pay for cookies, flash, or CSRF protection it would never use.",
          ],
        },
        {
          type: "text",
          md: [
            "## Course map recap — what's next",
            "- **Modules 00–04** — pure Ruby: variables, strings, collections, blocks, classes, errors, gems.\n- **Modules 05–08** — how the web and Rails work: Rack, Rails' anatomy, ActiveRecord, and this module's REST controllers.\n- **Modules 09–15 — you build PawWalk for real, starting next:**",
            "- **09** — kick off `apps/pawwalk-api` itself\n- **10** — auth (the `Authentication` concern `ApplicationController` already references)\n- **11** — bookings, for real, with the real `Api::BookingsController`\n- **12** — payments and background jobs (`solid_queue` from module 04's Gemfile)\n- **13** — live GPS tracking\n- **14** — tests\n- **15** — deploy with Kamal",
            "Nothing from here forward will look unfamiliar — `namespace :api`, `render json:`, strong params, `before_action`, and status codes are the entire vocabulary the real backend speaks.",
          ],
        },
        {
          type: "quiz",
          q: "Why does `apps/pawwalk-api`'s `ApplicationController` inherit from `ActionController::API` instead of `ActionController::Base`?",
          choices: [
            "Its only clients are native apps, never a browser — so cookies, sessions, flash, and CSRF protection (all browser-serving features) are pure overhead it doesn't need",
            "`ActionController::API` is simply a newer, faster version of `ActionController::Base` with no functional difference",
            "`ActionController::Base` can't render JSON at all, so an API is impossible without `::API`",
            "It's required by the `resources :walkers` route helper",
          ],
          answer: 0,
          explain: "`ActionController::Base` CAN render JSON — dogpark did it all module. `::API` is a smaller superclass that drops browser-only concerns (views, cookies, sessions, flash, CSRF) that a mobile-only backend never touches, which is why PawWalk chose it from day one.",
          nudge: "dogpark's controllers inherit from `ActionController::Base` and still rendered JSON just fine. So what is `::API` actually removing, if not JSON support?",
        },
        {
          type: "exercise",
          title: "Capstone: a health endpoint",
          prompt: [
            "Define `class Api::HealthController < ApplicationController` with an `index` action that renders `{ status: \"ok\" }` as JSON — no explicit status needed, 200 is the default.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`class Api::HealthController < ApplicationController
  def index
    render json: { status: "ok" }
  end
end`,
          checks: [
            { re: /class Api::HealthController<ApplicationController/, hint: "Nest it under the `Api::` module, same as every other controller this module: `class Api::HealthController < ApplicationController`." },
            { re: /def index/, hint: "Name the action `index`." },
            { re: /render json:\{status:"ok"\}/, hint: "Render exactly `{ status: \"ok\" }` as JSON: `render json: { status: \"ok\" }`." },
          ],
          success: "A tiny, real capstone — this is the same shape as Rails' own built-in `/up` health check, and the exact idea behind any load balancer's \"is this backend alive\" probe. Module 09 starts building the real thing.",
        },
      ],
    },
  ],
});
