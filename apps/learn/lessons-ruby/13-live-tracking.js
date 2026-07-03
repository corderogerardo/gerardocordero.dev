// Module 13 — Live Tracking with Action Cable. See FORMAT.md + FORMAT-RUBY.md for the schema.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "pawwalk-tracking",
  title: "Live Tracking with Action Cable",
  emoji: "📍",
  lang: "ruby",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "real-time-on-the-web",
      title: "Real-Time on the Web",
      steps: [
        {
          type: "text",
          md: [
            "## The owner wants the pin moving",
            "A dog walk is LIVE. Somewhere out there, a walker's phone is producing a new GPS position every few seconds, and the owner staring at the app wants to see that pin crawl across the map **as it happens** — not refresh and hope. Everything you've built through module 12 was *ask once, answer once*: a `curl` request, a JSON response, done. That shape doesn't fit a moving dog.",
            "The iOS side of this exact feature (`Services/LiveTracker.swift`, if you've seen that course) opens one socket per booking and watches it stream. This module builds the SERVER half of that same feature — the piece that decides who's allowed to listen, and pushes the fix out to everyone who is.",
          ],
        },
        {
          type: "text",
          md: [
            "## Polling works. WebSockets work better.",
            "The honest first answer is: you don't strictly NEED anything new. `GET /bookings/:id/location_pings` already exists — you'll meet it fully in lesson 5 — and a client could hit it every couple of seconds on a timer. That's called **polling**, and it works. It's also wasteful (most of those requests return nothing new) and always a beat behind the real event.",
            "A **WebSocket** flips the relationship: the client makes one special request that says \"keep this connection open,\" the server agrees, and after that either side can push a message at any moment for as long as the connection lives. Polling is checking your mailbox every five minutes. A WebSocket is a phone call that's already connected — the other side just talks when there's something to say.",
          ],
        },
        {
          type: "text",
          md: [
            "## Action Cable: Rails' WebSocket framework, four ideas",
            "Rails ships WebSockets built in, under the name **Action Cable**. Four vocabulary words carry the whole framework:",
            "- **Connection** — the one WebSocket per browser/device tab; it authenticates who's on the other end.\n- **Channel** — a logical topic a client subscribes to (here, one walk session).\n- **Stream** — the plumbing that ties a channel subscription to a named broadcast so it actually receives messages.\n- **Broadcast** — the act of pushing a payload to every client currently streaming that name.",
            "One connection authenticates the user; that user's channel subscription streams a topic; a broadcast is what actually shows up on every subscriber's screen. Lesson 2 builds the connection, lesson 3 the channel and its stream, lesson 5 the broadcast.",
          ],
        },
        {
          type: "text",
          md: [
            "## The pub/sub adapter — different per environment",
            "Under the hood, a broadcast has to travel from wherever it's triggered (a controller action, maybe a background job) to every server process holding an open socket for that channel. Something has to relay that message, and Rails calls it the **adapter**. Read the real config — it picks a different adapter per environment, on purpose:",
          ],
        },
        {
          type: "code",
          title: "config/cable.yml",
          source: String.raw`# Async adapter only works within the same process, so for manually triggering cable updates from a console,
# and seeing results in the browser, you must do so from the web console (running inside the dev process),
# not a terminal started via bin/rails console! Add "console" to any action or any ERB template view
# to make the web console appear.
development:
  adapter: async

test:
  adapter: test

production:
  adapter: solid_cable
  connects_to:
    database:
      writing: cable
  polling_interval: 0.1.seconds
  message_retention: 1.day`,
          caption: "The real, unedited file. `async` in dev is a one-process shortcut. `test` swaps in test-friendly assertion helpers (you'll use one directly in lesson 5). `production` runs Solid Cable — a Rails 8 default that stores messages in a database table instead of requiring Redis.",
        },
        {
          type: "text",
          md: [
            "## Why Solid Cable instead of Redis",
            "Every Action Cable tutorial from the last decade tells you to run Redis alongside Rails — it's fast, in-memory pub/sub, exactly shaped for this job. Rails 8 ships **Solid Cable** as the default instead: broadcasts get written as rows to a database table (`connects_to: { database: { writing: cable } }` points it at its own database), and every server process polls that table (`polling_interval: 0.1.seconds`) for new rows. Slightly higher latency than Redis, but one fewer piece of infrastructure to run, patch, and pay for — for an app this size, that trade is a clear win. `message_retention: 1.day` is Solid Cable's own cleanup: broadcast rows older than a day get swept away automatically.",
          ],
        },
        {
          type: "text",
          md: [
            "## Mounting Action Cable — the one routes.rb line",
            "An API-only Rails app (which `apps/pawwalk-api` is, since module 05) doesn't get Action Cable's endpoint for free the way a full Rails app would — it has to be mounted explicitly. Here's the real line, already in the app:",
          ],
        },
        {
          type: "code",
          title: "config/routes.rb",
          source: String.raw`mount ActionCable.server => "/cable"`,
          caption: "One line. Every WebSocket connection this module builds dials into `/cable` — you'll see that exact path again in lesson 2's connection test.",
        },
        {
          type: "quiz",
          q: "Why does `config/cable.yml` specify `solid_cable` for production instead of the classic Redis adapter?",
          choices: [
            "Solid Cable stores broadcasts as rows in a database table and polls them — one fewer piece of infrastructure (no separate Redis server) to run, at the cost of slightly higher latency, which is the right trade for an app this size",
            "Redis doesn't support WebSockets at all",
            "Solid Cable is required by every Rails 8 app and Redis can no longer be used",
            "It's purely a licensing issue — Redis became a paid product",
          ],
          answer: 0,
          explain: "Solid Cable is Rails 8's database-backed default: broadcasts become rows, and every process polls for new ones every `polling_interval`. It trades a bit of latency for not needing a whole separate Redis deployment — a good trade for a small app, which is exactly why it's the default now.",
          nudge: "Read the comment on `development: adapter: async` and think about what `production: adapter: solid_cable` is avoiding by NOT being Redis.",
        },
        {
          type: "exercise",
          title: "Retype the mount line and the production adapter",
          prompt: [
            "In `config/routes.rb`, mount `ActionCable.server` at `\"/cable\"`. Separately, retype the `production` section of `config/cable.yml`: adapter `solid_cable`, `connects_to.database.writing` set to `cable`.",
          ],
          starter: String.raw`# config/routes.rb
# your code here

# config/cable.yml
production:
  # your code here
`,
          solution: String.raw`# config/routes.rb
mount ActionCable.server => "/cable"

# config/cable.yml
production:
  adapter: solid_cable
  connects_to:
    database:
      writing: cable
`,
          checks: [
            { re: /mount ActionCable\.server=>"\/cable"/, hint: "Mount it exactly like this: `mount ActionCable.server => \"/cable\"`." },
            { re: /adapter:solid_cable/, hint: "The production adapter is `solid_cable` — no quotes needed in YAML." },
            { re: /writing:cable/, hint: "Point the writing connection at the `cable` database: `writing: cable`." },
          ],
          success: "That's the real mount line and the real production adapter — the exact plumbing that turns a controller's broadcast_to call into a message on someone's socket.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "authenticating-the-socket",
      title: "Authenticating the Socket",
      steps: [
        {
          type: "text",
          md: [
            "## HTTP auth doesn't just carry over",
            "Since module 10, every controller action has relied on `Authentication`'s `before_action :authenticate_request` — it reads `request.headers[\"Authorization\"]`, splits off the bearer token, decodes the JWT, and sets `current_user`. That's an HTTP request/response cycle: headers are cheap to set on every call.",
            "A WebSocket connection is different: it's ONE handshake, held open, and depending on the client, custom headers aren't always easy or possible to attach to that handshake. So Action Cable's connection auth can't just reuse `authenticate_request` — it needs its own entry point, running once, at connect time.",
          ],
        },
        {
          type: "text",
          md: [
            "## The token rides in the query string",
            "Read the real connection class slowly — the comment explains the one design decision that matters:",
          ],
        },
        {
          type: "code",
          title: "app/channels/application_cable/connection.rb",
          source: String.raw`module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      # WebSocket clients can't always set custom headers, so the JWT rides in the query string instead.
      payload = JsonWebToken.decode(request.params[:token])
      self.current_user = User.find(payload[:user_id])
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      reject_unauthorized_connection
    end
  end
end`,
          caption: "The real, unedited file. `identified_by :current_user` declares the one thing every connection is tagged with. `connect` runs once, at handshake time — decode, find, assign, or reject.",
        },
        {
          type: "text",
          md: [
            "## `identified_by :current_user`",
            "This line tells Action Cable: every connection carries a `current_user`, and that identifier is how Action Cable tells connections apart (it's also how you could later broadcast to \"all of user X's open tabs\" if you ever needed to — not something this app does, but the hook is there). Without `identified_by`, `self.current_user =` on the next line wouldn't even be legal — the attribute has to be declared first.",
            "Compare this to `Authentication`'s `attr_reader :current_user` from module 10 — same idea, same name, different mechanism, because a Connection isn't a Controller.",
          ],
        },
        {
          type: "text",
          md: [
            "## Same fail-closed posture as `authenticate_request`",
            "Look at the shape: decode the token, find the user, and if EITHER step raises — a garbage token (`JWT::DecodeError`) or a well-formed token pointing at a user that doesn't exist (`ActiveRecord::RecordNotFound`) — `reject_unauthorized_connection` fires and the socket never opens. No silent \"connect as guest\" fallback, no partial connection. This is the exact same fail-closed instinct as `authenticate_request`'s `rescue ... render json: { error: \"unauthorized\" }, status: :unauthorized` — the only difference is what \"say no\" looks like at each layer: a 401 response for HTTP, a rejected handshake for a socket.",
          ],
        },
        {
          type: "quiz",
          q: "Why does the JWT arrive as `request.params[:token]` (a query param, `/cable?token=...`) instead of an `Authorization` header, the way every controller action reads it?",
          choices: [
            "WebSocket clients can't always set custom headers on the initial handshake request, so the token has to travel somewhere every client CAN attach — the URL's query string",
            "Query params are more secure than headers because they're encrypted separately",
            "Action Cable doesn't support headers at all, on any request",
            "It's an arbitrary style choice with no technical reason",
          ],
          answer: 0,
          explain: "The real comment in `connection.rb` says it directly: some WebSocket clients can't set custom headers on the connecting request. A query param is the one place every client can reliably attach data to that first handshake URL.",
          nudge: "Re-read the comment directly above `payload = JsonWebToken.decode(...)` in the real file — it names the exact limitation.",
        },
        {
          type: "exercise",
          title: "Retype connect",
          prompt: [
            "Retype the `connect` method's core: decode `request.params[:token]` into `payload`, set `self.current_user` by finding the `User` with `payload[:user_id]`, and rescue `JWT::DecodeError` and `ActiveRecord::RecordNotFound` by calling `reject_unauthorized_connection`.",
          ],
          starter: String.raw`module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      # your code here
    end
  end
end`,
          solution: String.raw`module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      payload = JsonWebToken.decode(request.params[:token])
      self.current_user = User.find(payload[:user_id])
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      reject_unauthorized_connection
    end
  end
end`,
          checks: [
            { re: /payload=JsonWebToken\.decode\(request\.params\[:token\]\)/, hint: "Decode the query-string token: `payload = JsonWebToken.decode(request.params[:token])`." },
            { re: /self\.current_user=User\.find\(payload\[:user_id\]\)/, hint: "Assign via `self.current_user = User.find(payload[:user_id])` — the `self.` is required, it's not a local variable." },
            { re: /rescue JWT::DecodeError,ActiveRecord::RecordNotFound/, hint: "Rescue both exceptions on one line: `rescue JWT::DecodeError, ActiveRecord::RecordNotFound`." },
            { re: /reject_unauthorized_connection/, hint: "Call `reject_unauthorized_connection` — the socket-auth equivalent of rendering a 401." },
          ],
          mustNot: [
            { re: /request\.headers/, hint: "Not a header this time — the token comes from `request.params[:token]`, the query string." },
          ],
          success: "That's the real connect method — same fail-closed shape as HTTP auth, adapted for a handshake instead of a request/response cycle.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "walkchannel-subscribe-and-stream",
      title: "WalkChannel: Subscribe & Stream",
      steps: [
        {
          type: "text",
          md: [
            "## Base classes, then the real channel",
            "Two tiny files set the stage. `ApplicationCable::Channel` is the empty base every channel inherits from — Rails generates it once and it's fine to leave it empty:",
          ],
        },
        {
          type: "code",
          title: "app/channels/application_cable/channel.rb",
          source: String.raw`module ApplicationCable
  class Channel < ActionCable::Channel::Base
  end
end`,
          caption: "The whole file. Nothing to add — it exists so every real channel has a common ancestor to inherit from.",
        },
        {
          type: "text",
          md: [
            "`WalkChannel` is where the actual decision lives — read it slowly, it's short:",
          ],
        },
        {
          type: "code",
          title: "app/channels/walk_channel.rb",
          source: String.raw`class WalkChannel < ApplicationCable::Channel
  def subscribed
    # Scoped through current_user.bookings, same as the REST layer — only the booking's
    # owner may listen in on their walk.
    walk_session = WalkSession.joins(:booking).merge(current_user.bookings).find_by(id: params[:id])

    if walk_session
      stream_for walk_session
    else
      reject
    end
  end
end`,
          caption: "The real, unedited file. One method, one query, one branch: found and owned → stream; anything else → reject.",
        },
        {
          type: "text",
          md: [
            "## `subscribed` and the client's `params`",
            "`subscribed` runs once per client, the moment they ask to join this channel. Whatever the client sent when subscribing shows up in `params` — here, `params[:id]`, the walk session's id, exactly like `params[:id]` in a controller action.",
          ],
        },
        {
          type: "text",
          md: [
            "## The module-11 golden rule, now on sockets",
            "You met this rule with `Booking` in module 11: **a controller for a signed-in user's own data never queries the bare model class** — always scope through `current_user.bookings`. Look at the query here: `WalkSession.joins(:booking).merge(current_user.bookings).find_by(id: params[:id])`. It joins `WalkSession` to its `Booking`, then `merge`s in the exact same `current_user.bookings` scope the REST controllers use — so this line only ever finds a walk session whose booking belongs to whoever's socket this is. A stranger cannot subscribe to your dog's walk, full stop, for the identical reason a stranger can't `GET /bookings/:id` and see your booking. The golden rule didn't get a WebSocket-specific exception; it got a WebSocket-specific rendering.",
            "If the id doesn't resolve — wrong id, or a real id that belongs to someone else's booking — `walk_session` is `nil` and `find_by` (not `find`) means no exception gets raised; the code just falls to the `else` branch and calls `reject`.",
          ],
        },
        {
          type: "text",
          md: [
            "## `stream_for` — what it actually does",
            "`stream_for walk_session` subscribes THIS client's socket to a broadcasting name that Action Cable derives from the record itself (you saw its exact shape — a `walk:<global-id>` string — in the runner transcript, and you'll build the broadcast side of it in lesson 5). Every future call to `WalkChannel.broadcast_to(walk_session, payload)` anywhere in the app — a controller action, a console line, a background job — reaches every client currently streaming for that same `walk_session`, and only those clients. `stream_for` is the subscribe half; `broadcast_to` is the publish half; they're matched by Action Cable computing the identical name from the same record on both sides.",
          ],
        },
        {
          type: "text",
          md: [
            "## `reject` — the channel's version of `reject_unauthorized_connection`",
            "Calling `reject` inside `subscribed` tells the client this specific channel subscription failed — the underlying socket connection itself stays open (it was already authenticated in lesson 2), but this one channel never streams anything. It's a narrower refusal than rejecting the whole connection: you might legitimately be connected and simply not allowed to listen to THIS particular walk.",
          ],
        },
        {
          type: "quiz",
          q: "Jane (a real, authenticated user) tries to subscribe to a `WalkChannel` for a walk session belonging to Demo's booking. What happens?",
          choices: [
            "`WalkSession.joins(:booking).merge(current_user.bookings).find_by(id: params[:id])` returns `nil` for Jane (the session isn't inside HER bookings), so the `else` branch runs and `reject` is called — no stream, no data",
            "It streams anyway, because the connection itself was already authenticated in lesson 2",
            "It raises `ActiveRecord::RecordNotFound`, crashing the channel",
            "It succeeds, but the broadcast payload is empty for Jane",
          ],
          answer: 0,
          explain: "`merge(current_user.bookings)` scopes the whole query to walk sessions whose booking belongs to `current_user` — for Jane, that's her own bookings, not Demo's. Demo's walk session simply isn't in that set, so `find_by` returns `nil`, and the explicit `if walk_session ... else reject end` branch refuses the subscription.",
          nudge: "Being authenticated (module 2's connection check) and being AUTHORIZED for this specific walk session (this lesson's subscribed check) are two different gates — which one is Jane failing?",
        },
        {
          type: "exercise",
          title: "Retype subscribed",
          prompt: [
            "Write `subscribed`: find a `WalkSession` by joining `:booking`, merging in `current_user.bookings`, and calling `find_by(id: params[:id])`. If found, `stream_for` it; otherwise `reject`.",
          ],
          starter: String.raw`class WalkChannel < ApplicationCable::Channel
  def subscribed
    # your code here
  end
end`,
          solution: String.raw`class WalkChannel < ApplicationCable::Channel
  def subscribed
    walk_session = WalkSession.joins(:booking).merge(current_user.bookings).find_by(id: params[:id])

    if walk_session
      stream_for walk_session
    else
      reject
    end
  end
end`,
          checks: [
            { re: /WalkSession\.joins\(:booking\)\.merge\(current_user\.bookings\)\.find_by\(id:params\[:id\]\)/, hint: "Chain exactly: `WalkSession.joins(:booking).merge(current_user.bookings).find_by(id: params[:id])`." },
            { re: /if walk_session/, hint: "Branch on the found record: `if walk_session`." },
            { re: /stream_for walk_session/, hint: "On success, subscribe: `stream_for walk_session`." },
            { re: /reject/, hint: "On failure, refuse the subscription: `reject`." },
          ],
          mustNot: [
            { re: /WalkSession\.find\(/, hint: "Never look up a bare `WalkSession.find` — that would return ANY session, not just ones the current user owns." },
          ],
          success: "That's the real subscribed method — the golden rule from module 11, now guarding a socket instead of an HTTP response.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "walk-sessions-start-and-end",
      title: "Walk Sessions: Start & End",
      steps: [
        {
          type: "text",
          md: [
            "## `resource :walk_session`, singular — on purpose",
            "Read the real route again, this time noticing what's different about it: `resource :walk_session, only: %i[create update]` — no `s`. Rails' `resource` (singular) generates routes for exactly ONE record scoped to its parent, with NO `:id` in the URL and no `index`: `POST /bookings/:booking_id/walk_session` and `PATCH /bookings/:booking_id/walk_session`, nothing else. Compare that to `resources :location_pings` (plural, lesson 5) which DOES carry an `:id` and DOES have an index.",
            "Why singular here: a booking has **at most one** walk session — you start it once, you end it once. There's no list to index and no id to look up, because \"the walk session for booking 7\" is already a complete, unambiguous address. Reaching for `resource` instead of `resources` isn't a style pick — it's the route shape telling the truth about the data.",
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
  resource :walk_session, only: %i[create update]
  resources :location_pings, only: %i[index create]
end`,
          caption: "Three nested resources under `:bookings`, and only one of them — `location_pings` — is plural. `walk_session` and `pay` are both singular for the identical reason: one booking, at most one of each.",
        },
        {
          type: "text",
          md: [
            "## The honest comment: the owner drives it here",
            "Read the real controller's opening comment before anything else — it tells you exactly what corner this app cuts, and why that's fine for what it is:",
          ],
        },
        {
          type: "code",
          title: "app/controllers/walk_sessions_controller.rb",
          source: String.raw`class WalkSessionsController < ApplicationController
  # In real life the walker's device would drive start/end; this app only authenticates
  # the booking's owner, so the owner drives the walk here.
  def create
    booking = current_user.bookings.find(params[:booking_id])

    unless booking.confirmed? && booking.walk_session.nil?
      render json: { error: "walk can only start on a confirmed booking" }, status: :unprocessable_content
      return
    end

    walk_session = booking.create_walk_session!(started_at: Time.current)
    booking.update!(status: :in_progress)

    render json: { walk_session: walk_session_payload(walk_session) }, status: :created
  end

  def update
    booking = current_user.bookings.find(params[:booking_id])
    walk_session = booking.walk_session

    unless walk_session && walk_session.ended_at.nil?
      render json: { error: "walk session is not active" }, status: :unprocessable_content
      return
    end

    walk_session.update!(ended_at: Time.current)
    booking.update!(status: :completed)

    render json: { walk_session: walk_session_payload(walk_session) }
  end

  private

  def walk_session_payload(walk_session)
    {
      id: walk_session.id,
      booking_id: walk_session.booking_id,
      started_at: walk_session.started_at,
      ended_at: walk_session.ended_at
    }
  end
end`,
          caption: "The real, unedited file. Two actions, one guard each, one state transition each. A real deployment would authenticate the walker's phone separately and let IT call these — this app only has owner accounts, so the comment says so plainly instead of pretending otherwise.",
        },
        {
          type: "text",
          md: [
            "## `create` — only a CONFIRMED booking with no session yet can start",
            "`unless booking.confirmed? && booking.walk_session.nil?` guards two separate things at once: the booking must be in the `confirmed` state (module 11's enum, `booking.confirmed?`), AND it must not already have a walk session (`has_one :walk_session` from `Booking`, so `booking.walk_session` is either the one session or `nil`). Both conditions have to hold, or the request is rejected with a 422 naming the reason plainly. Trying to start a `pending` booking's walk fails this guard; so does trying to start the SAME confirmed booking's walk twice — the second call finds `booking.walk_session` is no longer `nil`.",
            "Once the guard passes, two things happen together: `booking.create_walk_session!` (a Rails-generated method from `has_one :walk_session` — build-and-save the associated record in one call) sets `started_at`, and `booking.update!(status: :in_progress)` moves the booking forward. That's the full status lifecycle from module 11 completing here: `pending → confirmed` (module 11's create/payment flow) `→ in_progress` (this action) `→ completed` (the next action, `update`).",
          ],
        },
        {
          type: "text",
          md: [
            "## `update` — only an ACTIVE session can end",
            "`unless walk_session && walk_session.ended_at.nil?` reads almost identically to the `create` guard, mirrored: there has to BE a walk session at all, and it must not already have an `ended_at`. Ending a booking that never started a walk fails the first half; ending an already-ended walk fails the second half — both collapse to the same message, `\"walk session is not active\"`, because from the caller's point of view both are the same complaint: there's no active walk here to end.",
            "Passing the guard flips both records forward one more step: `walk_session.update!(ended_at: Time.current)` and `booking.update!(status: :completed)` — the last leg of the lifecycle. There's no going back from here; `completed` is terminal, same as `cancelled`.",
          ],
        },
        {
          type: "quiz",
          q: "A booking is `pending` (never confirmed, never paid). A client calls `PATCH /bookings/:id/walk_session` on it. What happens?",
          choices: [
            "422 Unprocessable Content, `\"walk session is not active\"` — `booking.walk_session` is `nil` for a booking that never started a walk session, so the `update` guard's `walk_session && walk_session.ended_at.nil?` fails at the very first condition",
            "200 OK — the booking is marked completed anyway",
            "404 Not Found, because pending bookings can't be looked up at all",
            "500 Internal Server Error from calling `.ended_at` on `nil`",
          ],
          answer: 0,
          explain: "`walk_session` is `nil` for a booking that never had `create` called on it — the guard's `walk_session && ...` short-circuits on that `nil` before ever touching `.ended_at`, so there's no crash, just a clean 422 with the same message every other \"nothing active to end\" case produces.",
          nudge: "Walk the `unless` condition left to right for a booking with no session at all: what does plain `walk_session` (no session, so `nil`) evaluate to as the first half of `&&`?",
        },
        {
          type: "exercise",
          title: "Retype a guard + transition pair",
          prompt: [
            "Write `create`'s guard and transition: unless the booking is `confirmed?` AND its `walk_session` is `nil`, render `{ error: \"walk can only start on a confirmed booking\" }` with `status: :unprocessable_content` and `return`. Otherwise, create the walk session with `started_at: Time.current` and update the booking's status to `:in_progress`.",
          ],
          starter: String.raw`def create
  booking = current_user.bookings.find(params[:booking_id])

  # your code here

  walk_session = booking.create_walk_session!(started_at: Time.current)
  booking.update!(status: :in_progress)

  render json: { walk_session: walk_session_payload(walk_session) }, status: :created
end`,
          solution: String.raw`def create
  booking = current_user.bookings.find(params[:booking_id])

  unless booking.confirmed? && booking.walk_session.nil?
    render json: { error: "walk can only start on a confirmed booking" }, status: :unprocessable_content
    return
  end

  walk_session = booking.create_walk_session!(started_at: Time.current)
  booking.update!(status: :in_progress)

  render json: { walk_session: walk_session_payload(walk_session) }, status: :created
end`,
          checks: [
            { re: /unless booking\.confirmed\?&&booking\.walk_session\.nil\?/, hint: "Guard with `unless booking.confirmed? && booking.walk_session.nil?` — both conditions, joined with `&&`." },
            { re: /status::unprocessable_content/, hint: "Render the rejection with `status: :unprocessable_content`." },
            { re: /return/, hint: "Stop the method with a bare `return` after rendering the error." },
            { re: /booking\.update!\(status::in_progress\)/, hint: "After the guard: `booking.update!(status: :in_progress)`." },
          ],
          mustNot: [
            { re: /booking\.pending\?/, hint: "The guard checks `confirmed?`, not `pending?` — a walk starts from a confirmed booking, not a pending one." },
          ],
          success: "That's the real create guard and transition — the booking status lifecycle's third stage, landing exactly here.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "pings-broadcast-and-prove-it",
      title: "Pings, Broadcast & Prove It",
      label: "Over to the terminal",
      steps: [
        {
          type: "text",
          md: [
            "## The fan-out moment",
            "Everything so far — the socket, the auth, the channel, the guarded lifecycle — exists to make ONE line possible. Read the real controller:",
          ],
        },
        {
          type: "code",
          title: "app/controllers/location_pings_controller.rb",
          source: String.raw`class LocationPingsController < ApplicationController
  def index
    booking = current_user.bookings.find(params[:booking_id])
    walk_session = booking.walk_session

    render json: { location_pings: walk_session.location_pings.order(:recorded_at).map { |ping| ping_payload(ping) } }
  end

  def create
    booking = current_user.bookings.find(params[:booking_id])
    walk_session = booking.walk_session

    unless walk_session && walk_session.started_at.present? && walk_session.ended_at.nil?
      render json: { error: "walk session is not active" }, status: :unprocessable_content
      return
    end

    ping = walk_session.location_pings.create!(ping_params.merge(recorded_at: Time.current))

    # Fan-out moment: every client subscribed to this walk session's WalkChannel stream gets this.
    WalkChannel.broadcast_to(walk_session, ping_payload(ping))

    render json: { location_ping: ping_payload(ping) }, status: :created
  end

  private

  def ping_params
    params.permit(:lat, :lng)
  end

  def ping_payload(ping)
    { lat: ping.lat, lng: ping.lng, recorded_at: ping.recorded_at }
  end
end`,
          caption: "The real, unedited file. `create`'s comment names the moment this whole module has been building toward.",
        },
        {
          type: "text",
          md: [
            "## `create` — guard, persist, broadcast, respond",
            "The active-session guard is the same shape you just wrote in lesson 4, checked one notch stricter: `walk_session && walk_session.started_at.present? && walk_session.ended_at.nil?` — there has to be a session, it has to have actually started, and it must not have ended. Pass that, and `walk_session.location_pings.create!(ping_params.merge(recorded_at: Time.current))` does two familiar things at once: `ping_params` is a strong-params allowlist (module 08's pattern) permitting only `:lat` and `:lng` — nothing else the client sends reaches the database — and `recorded_at: Time.current` is the server, not the client, stamping when the ping was actually received.",
            "Then the line the whole module has been pointed at: `WalkChannel.broadcast_to(walk_session, ping_payload(ping))`. `stream_for walk_session` in lesson 3 subscribed clients to a name Action Cable derives from that exact record; `broadcast_to(walk_session, ...)` here computes the SAME name from the SAME record and pushes `ping_payload(ping)` to everyone currently streaming it. One line, and every phone watching this walk gets the new dot — no polling, no delay beyond the adapter's own latency.",
          ],
        },
        {
          type: "text",
          md: [
            "## `index` — the replay endpoint for reconnects",
            "`index` is the honest, unglamorous other half of live tracking: sockets drop. A phone loses signal in a tunnel, backgrounds the app, whatever — and when it reconnects, it needs to catch up on everything it missed before picking the live stream back up. `walk_session.location_pings.order(:recorded_at).map { ... }` is a plain REST read, no socket involved: every ping ever recorded for this session, oldest first. This is the exact \"the replay endpoint exists for reconnects\" idea named back in lesson 1 — catch up via REST, stay live via socket. (If you've seen the iOS live-tracking course, this is precisely what the app's `LiveTracker` does on connect: fetch history, then listen for `position` messages one at a time.)",
          ],
        },
        {
          type: "text",
          md: [
            "## The testing war story: `assert_broadcasts` keys on the STREAM NAME",
            "Testing a broadcast is where this feature earns its `test` adapter from lesson 1. You can't just assert \"the walk session received a message\" — Action Cable doesn't organize broadcasts by record, it organizes them by the DERIVED STRING `stream_for`/`broadcast_to` both compute (you saw its exact shape, `walk:<global-id>`, in the runner transcript below). So the real test doesn't key on `walk_session` directly — it keys on `WalkChannel.broadcasting_for(walk_session)`, the same helper the channel and controller both use internally to agree on a name:",
          ],
        },
        {
          type: "code",
          title: "test/integration/location_pings_test.rb",
          source: String.raw`test "pinging an active walk creates a ping and broadcasts it to the walk channel" do
  booking = bookings(:walking_now)
  walk_session = walk_sessions(:in_progress)

  assert_difference("LocationPing.count", 1) do
    assert_broadcasts(WalkChannel.broadcasting_for(walk_session), 1) do
      post "/bookings/#{booking.id}/location_pings",
           params: { lat: 30.269, lng: -97.741 },
           headers: auth_headers(users(:demo))
    end
  end

  assert_response :created
  body = JSON.parse(response.body)
  assert_equal "30.269", body["location_ping"]["lat"]
end`,
          caption: "Real, unedited excerpt. `assert_broadcasts(name, count)` asserts exactly `count` broadcasts went out under that derived name — and `WalkChannel.broadcasting_for(walk_session)` is the one correct way to compute it, matching whatever `stream_for`/`broadcast_to` used internally.",
        },
        {
          type: "quiz",
          q: "Why does the test call `assert_broadcasts(WalkChannel.broadcasting_for(walk_session), 1)` instead of something like `assert_broadcasts(walk_session, 1)`?",
          choices: [
            "Action Cable doesn't track broadcasts by record — it tracks them by a derived STRING name, and `broadcasting_for` is the one method guaranteed to compute the exact same string `stream_for`/`broadcast_to` used, so the assertion actually matches",
            "`walk_session` alone would raise a `NoMethodError`",
            "It's just a style preference — both forms work identically",
            "`broadcasting_for` is required because `walk_session` might be `nil`",
          ],
          answer: 0,
          explain: "`stream_for` and `broadcast_to` both convert a record into the same broadcasting name behind the scenes — that name, not the record itself, is what Action Cable's test adapter actually tracks. `WalkChannel.broadcasting_for(walk_session)` recomputes that exact name, so the assertion lines up with what the channel and controller really did.",
          nudge: "`stream_for walk_session` in lesson 3 and `broadcast_to(walk_session, ...)` in this lesson both take a RECORD but have to agree on a common ground to actually connect — what do they secretly both compute from that record?",
        },
        {
          type: "xcode",
          title: "Run the real tests, then watch a broadcast happen",
          label: "Over to the terminal",
          intro: [
            "Prove this entire module against the real app — 16 tests across the channel, connection, and both controllers:",
          ],
          items: [
            "`cd apps/pawwalk-api && bin/rails test test/channels test/integration/walk_sessions_test.rb test/integration/location_pings_test.rb` — expect all green: 16 runs, 0 failures.",
            "Open `bin/rails runner` and create a session + ping by hand, then broadcast it and print the derived stream name: `booking = Booking.confirmed.first; walk_session = booking.create_walk_session!(started_at: Time.current); ping = walk_session.location_pings.create!(lat: 30.269, lng: -97.741, recorded_at: Time.current); WalkChannel.broadcast_to(walk_session, lat: ping.lat, lng: ping.lng); puts WalkChannel.broadcasting_for(walk_session)` — watch it print a `walk:<gid>`-shaped string, the exact name lesson 3's `stream_for` and this lesson's `broadcast_to` both compute.",
          ],
        },
        {
          type: "text",
          md: [
            "## What a real run just showed",
            "That's a real, verified transcript against the actual app: `16 runs, 37 assertions, 0 failures, 0 errors, 0 skips` across `test/channels/application_cable/connection_test.rb`, `test/channels/walk_channel_test.rb`, `test/integration/walk_sessions_test.rb`, and `test/integration/location_pings_test.rb`. The `runner` snippet above produced a real broadcasting name shaped like `walk:Z2lkOi8vcGF3d2Fsay1hcGkvV2Fsa1Nlc3Npb24vMg` — Action Cable's Global ID encoding of the walk session, the same string `assert_broadcasts` matched against in the test file you just read.",
          ],
        },
        {
          type: "quiz",
          q: "Capstone: put the whole module in order. A walker's phone posts a GPS fix while the owner's phone is subscribed to the same walk. What's the full path, start to finish?",
          choices: [
            "POST /bookings/:id/location_pings passes the active-session guard → LocationPing.create! persists it with a server-set recorded_at → WalkChannel.broadcast_to(walk_session, ...) computes the session's derived stream name → every client whose WalkChannel#subscribed called stream_for on that same session (verified against current_user.bookings at subscribe time) receives the payload instantly",
            "The controller writes directly to the owner's socket by user id, bypassing Action Cable entirely",
            "The ping is only visible after the owner's app polls the index endpoint on its own timer",
            "WalkChannel#subscribed re-runs on every ping to re-check authorization before delivering it",
          ],
          answer: 0,
          explain: "Authorization happens ONCE, at subscribe time, in lesson 3's `subscribed` — not re-checked per broadcast. After that, every ping flows: guard → persist → `broadcast_to` (computing the same derived name `stream_for` used) → instant delivery to every already-authorized subscriber. The REST `index` from this lesson is the separate reconnect/replay path, not the live one.",
          nudge: "Trace it in order: which check runs once (at subscribe) versus which line runs on every single ping?",
        },
      ],
    },
  ],
});
