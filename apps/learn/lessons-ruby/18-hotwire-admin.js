// Module 18 — A Hotwire Admin Dashboard. See FORMAT.md + FORMAT-RUBY.md for the schema.
// Modules 0-17 built the JSON API: auth, bookings, Stripe, Solid Queue/Cable, caching.
// This module adds a second surface to the SAME app — an internal ops dashboard rendered
// as real HTML, using Hotwire (Turbo + Stimulus) instead of a separate SPA — while every
// existing api:: JSON route keeps behaving exactly as it did before.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "hotwire-admin",
  title: "A Hotwire Admin Dashboard",
  emoji: "⚙️",
  lang: "ruby",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "api-only-meet-hotwire",
      title: "API-only, meet Hotwire",
      steps: [
        {
          type: "text",
          md: [
            "## HTML over the wire",
            "Every module so far talked to PawWalk through JSON — `render json: ...`, a mobile client parsing the response. **Hotwire** is a different way to build a UI: instead of a client-side app that fetches JSON and re-renders itself, the server sends real HTML, and a small JS layer makes that HTML behave like an app. No build step, no bundler, no client-side state to keep in sync with the server — the server IS the source of truth, on every request.",
            "Hotwire is three pieces working together. **Turbo Drive** intercepts normal link clicks and form submits, fetches the new page in the background, and swaps in just the `<body>` — so navigation feels instant without a full page reload, and without writing a client-side router. **Turbo Frames** scope a navigation to one region of the page (lesson 2). **Turbo Streams** let the server push small HTML updates to a page that's just sitting open (lesson 3). **Stimulus** (lesson 4) is the sprinkle-of-JS layer for the few things HTML alone can't do, like a confirm dialog.",
          ],
        },
        {
          type: "text",
          md: [
            "## Why not just build a React admin panel?",
            "You could — but an internal ops dashboard (walker list, live booking feed) is exactly the case Hotwire was built for: a handful of authenticated staff, mostly reading, occasionally clicking a button. Standing up a separate SPA means a second codebase, a second deploy, a second auth story, and a build pipeline for a screen three people use. Hotwire ships it as part of the same Rails app, in the same deploy, using the templating and routing you already have.",
            "This does NOT touch the mobile API. PawWalk's `api_only` setting stays `true` at the application level — every existing `/walkers`, `/bookings`, `/login` route keeps returning exactly the JSON it always has. The admin dashboard is a second, HTML-rendering controller stack living alongside it, not a replacement for it.",
          ],
        },
        {
          type: "code",
          title: "Gemfile — adding Hotwire",
          source: String.raw`# Use the database-backed adapters for Rails.cache, Active Job, and Action Cable
gem "solid_cache"
gem "solid_queue"
gem "solid_cable"

# HTML-over-the-wire for the admin dashboard (Turbo Drive/Frames/Streams + Stimulus)
gem "turbo-rails"
gem "stimulus-rails"
gem "importmap-rails"`,
          caption: "Three gems, nothing exotic: `turbo-rails` and `stimulus-rails` are the Hotwire libraries themselves; `importmap-rails` serves their JS straight from `vendor/javascript` with no `npm install`, no bundler, no `node_modules` — matching the \"no build step\" spirit of this whole course.",
        },
        {
          type: "code",
          title: "app/controllers/admin/base_controller.rb",
          source: String.raw`module Admin
  class BaseController < ActionController::Base
    layout "admin"

    protect_from_forgery with: :exception
  end
end`,
          caption: "The api:: JSON controllers all inherit from `ApplicationController < ActionController::API` — no views, no cookies, no CSRF, by design. `Admin::BaseController` inherits from the full `ActionController::Base` instead, which is what unlocks `render`ing an `.erb` view, layouts, and Turbo's cookie-based CSRF protection. Two controller stacks, one app.",
        },
        {
          type: "quiz",
          q: "What does Turbo Drive replace, day to day?",
          choices: [
            "A full-page reload on every link click and form submit — Turbo Drive fetches the new page in the background and swaps in the body instead",
            "The Rails router — Turbo Drive decides which controller action handles a request",
            "ActiveRecord — Turbo Drive queries the database directly from the browser",
            "Solid Queue — Turbo Drive runs background jobs",
          ],
          answer: 0,
          explain: "Turbo Drive's whole job is turning normal links and forms into background fetches that swap the page body, so navigation feels like a client-side app without you writing a client-side router. Routing, the database, and background jobs are untouched — Turbo Drive only changes how the already-rendered HTML gets onto the screen.",
          nudge: "Think about what happens, today, when you click a plain `<a href>` link with no JS at all. What's the one thing Turbo Drive changes about that?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "turbo-frames-scoped-updates",
      title: "Turbo Frames: scoped updates",
      steps: [
        {
          type: "text",
          md: [
            "## A frame is a region that navigates on its own",
            "Wrap any part of a page in `turbo_frame_tag` and it becomes an independent navigation context: a link or form INSIDE that frame only replaces the content of that frame, not the whole page. Everything else on the page — the header, the other rows in a table, the nav — stays exactly as it was. No JavaScript required; this is plain HTML with a custom element (`<turbo-frame>`) that Turbo watches for.",
            "The walkers admin index is the textbook case: a table of walkers, each row in its own frame. Click \"Edit\" on Luna's row, and only Luna's `<tr>` gets replaced with an edit form — Sam's row, the page title, everything else is untouched. The request that fetches the edit form is scoped, small, and fast, because the server only has to render one row's worth of HTML, not the whole page.",
          ],
        },
        {
          type: "code",
          title: "app/views/admin/walkers/index.html.erb — one row, one frame",
          source: String.raw`<% @walkers.each do |walker| %>
  <%= turbo_frame_tag "walker_#{walker.id}" do %>
    <tr>
      <td><%= walker.name %></td>
      <td><%= walker.city %></td>
      <td><%= walker.price_label %></td>
      <td><%= link_to "Edit", edit_admin_walker_path(walker) %></td>
    </tr>
  <% end %>
<% end %>`,
          caption: "`turbo_frame_tag \"walker_#{walker.id}\"` gives each row a unique frame id. The `edit` view (not shown) wraps its form in a `turbo_frame_tag` with that SAME id — Turbo matches frame ids between the requesting page and the response, and only swaps in that one match.",
        },
        {
          type: "code",
          title: "app/controllers/admin/walkers_controller.rb — update stays inside the frame",
          source: String.raw`module Admin
  class WalkersController < BaseController
    def index
      @walkers = Walker.order(:name)
    end

    def edit
      @walker = Walker.find(params[:id])
    end

    def update
      @walker = Walker.find(params[:id])
      @walker.update(walker_params)
      render partial: "admin/walkers/walker", locals: { walker: @walker }
    end

    private

    def walker_params
      params.require(:walker).permit(:name, :bio, :city, :price_per_30_min_cents)
    end
  end
end`,
          caption: "No redirect after `update` — the action re-renders the SAME frame with the saved row. Turbo swaps that frame back to its read-only display, in place, with no full-page navigation at all.",
        },
        {
          type: "exercise",
          title: "Wrap a walker row in its own frame",
          prompt: [
            "Wrap the `<tr>` for a `walker` in a `turbo_frame_tag`, using an id that interpolates the walker's id (so every row gets a unique frame to navigate independently).",
          ],
          starter: String.raw`<% @walkers.each do |walker| %>
  <!-- your code here, wrapping the <tr> below -->
  <tr>
    <td><%= walker.name %></td>
  </tr>
  <!-- end wrap -->
<% end %>`,
          solution: String.raw`<% @walkers.each do |walker| %>
  <%= turbo_frame_tag "walker_#{walker.id}" do %>
    <tr>
      <td><%= walker.name %></td>
    </tr>
  <% end %>
<% end %>`,
          checks: [
            { re: /turbo_frame_tag"walker_#\{walker\.id\}"do/, hint: "`turbo_frame_tag \"walker_#{walker.id}\" do ... end` — the id has to interpolate `walker.id` so every row's frame id is unique." },
          ],
          mustNot: [
            { re: /turbo_frame_tag"walkers"do/, hint: "One shared id for every row means every row would try to become the SAME frame — each row needs its OWN id, built from that walker's id." },
          ],
          success: "That's a real scoped-update frame — click Edit on this row later and only it will swap, not the whole table.",
        },
        {
          type: "quiz",
          q: "What does a Turbo Frame isolate?",
          choices: [
            "Navigation — a link or form inside the frame only replaces that frame's own content, leaving the rest of the page untouched",
            "Database transactions — a frame wraps its update in a SQL transaction",
            "CSS — a frame prevents styles from leaking outside it",
            "Background jobs — a frame queues its update on Solid Queue instead of running it inline",
          ],
          answer: 0,
          explain: "A Turbo Frame's entire job is scoping NAVIGATION: a click or submit inside it fetches a response and swaps only the matching frame in that response, wherever else on the page it might be. It has nothing to do with transactions, CSS scoping, or background jobs.",
          nudge: "When you click \"Edit\" inside one frame, how much of the PAGE actually gets replaced?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "turbo-streams-over-solid-cable",
      title: "Turbo Streams over Solid Cable",
      steps: [
        {
          type: "text",
          md: [
            "## Frames navigate. Streams get PUSHED to you.",
            "A Turbo Frame updates when you click something inside it — the browser initiates the request. A **Turbo Stream** is the opposite direction: the SERVER pushes a small HTML operation (append, prepend, replace, remove) to a page that's just sitting open, over a live connection, with nobody clicking anything. That's exactly what a \"live\" admin monitor needs: a new booking should appear on the ops dashboard the instant it's created, on every screen that has the page open, without anyone refreshing.",
            "The transport underneath is Action Cable — and this app already runs **Solid Cable** in production (module 17's neighbor: the DB-backed queue/cache/cable trio). `turbo_stream_from` in a view subscribes that page to a named stream over Action Cable; `broadcast_prepend_to` (or `broadcast_append_to`, `broadcast_replace_to`, `broadcast_remove_to`) on the server sends an HTML fragment down that same named stream to every subscriber.",
          ],
        },
        {
          type: "code",
          title: "app/views/admin/dashboard/show.html.erb — subscribe to the live feed",
          source: String.raw`<h1>Live bookings</h1>

<%= turbo_stream_from "admin_bookings" %>

<div id="bookings_feed">
  <%= render partial: "admin/dashboard/booking", collection: @recent_bookings %>
</div>`,
          caption: "`turbo_stream_from \"admin_bookings\"` opens (or joins) an Action Cable subscription named `\"admin_bookings\"` the moment this page loads. Any broadcast sent to that same name, from anywhere in the app, reaches every browser tab that has this page open.",
        },
        {
          type: "code",
          title: "app/models/booking.rb — broadcasting a new booking",
          source: String.raw`class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :walker, counter_cache: true, touch: true
  belongs_to :dog

  after_create_commit -> { broadcast_prepend_to "admin_bookings", target: "bookings_feed", partial: "admin/dashboard/booking", locals: { booking: self } }

  # …unchanged below…
end`,
          caption: "`after_create_commit` — not `after_create` — fires only once the database transaction actually commits, so the broadcast never fires for a booking that gets rolled back. `broadcast_prepend_to` renders the given partial and pushes a Turbo Stream `<turbo-stream action=\"prepend\" target=\"bookings_feed\">` down the `\"admin_bookings\"` stream — every open dashboard gets the new row stitched onto the TOP of `#bookings_feed`, live.",
        },
        {
          type: "exercise",
          title: "Broadcast a new booking to the live admin monitor",
          prompt: [
            "Add an `after_create_commit` callback to `Booking` that calls `broadcast_prepend_to` on the `\"admin_bookings\"` stream, targeting `\"bookings_feed\"`, rendering the `\"admin/dashboard/booking\"` partial with `booking: self` as a local.",
          ],
          starter: String.raw`class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :walker, counter_cache: true, touch: true
  belongs_to :dog

  # your code here

  # …unchanged below…
end`,
          solution: String.raw`class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :walker, counter_cache: true, touch: true
  belongs_to :dog

  after_create_commit -> { broadcast_prepend_to "admin_bookings", target: "bookings_feed", partial: "admin/dashboard/booking", locals: { booking: self } }

  # …unchanged below…
end`,
          checks: [
            { re: /after_create_commit/, hint: "Use `after_create_commit`, not `after_create` — it waits for the transaction to actually commit before broadcasting." },
            { re: /broadcast_prepend_to"admin_bookings",target:"bookings_feed"/, hint: "`broadcast_prepend_to \"admin_bookings\", target: \"bookings_feed\", ...` — the stream name matches the `turbo_stream_from` in the view, the target matches the `id=\"bookings_feed\"` div." },
          ],
          mustNot: [
            { re: /after_create(?!_commit)/, hint: "Plain `after_create` fires INSIDE the transaction — if anything later in that transaction rolls back, you'd have already broadcast a booking that doesn't exist. Use `after_create_commit`." },
          ],
          success: "That's the real live-update wiring — every admin dashboard with this page open now sees new bookings appear with zero polling and zero manual refresh.",
        },
        {
          type: "quiz",
          q: "What's the real difference between a Turbo Stream and a Turbo Frame?",
          choices: [
            "A Turbo Stream is a server-initiated push that can update ANY number of targets on ANY open page over Action Cable; a Turbo Frame is a self-contained region that only updates itself, and only in response to a click or submit inside it",
            "They're two names for the same feature — Turbo Stream is just the newer name for Turbo Frame",
            "A Turbo Frame requires Action Cable; a Turbo Stream does not",
            "A Turbo Stream can only update text content; a Turbo Frame can update any HTML",
          ],
          answer: 0,
          explain: "Direction and scope are the two real differences. A frame is browser-initiated and self-scoped — click something inside it, only it updates. A stream is server-initiated (over Action Cable here) and can target any element, on any page that's subscribed, with no click required at all — exactly what a live feed needs.",
          nudge: "Who starts the update in each case — does the browser click something, or does the server decide to push?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "stimulus-just-enough-js",
      title: "Stimulus: just enough JS",
      steps: [
        {
          type: "text",
          md: [
            "## HTML stays the source of truth",
            "Turbo covers navigation and live updates without any hand-written JS. But a few things genuinely need a script — confirming before a destructive click, toggling a setting, debouncing a search box. **Stimulus** is Hotwire's answer: small, reusable **controllers** that attach behavior to plain HTML via `data-` attributes, instead of a framework that owns and re-renders the DOM itself.",
            "Three vocabulary words, and that's most of Stimulus: a **controller** is a JS class connected to an element via `data-controller=\"name\"`. A **target** is a specific child element the controller needs to read or change, marked `data-name-target=\"thing\"`. An **action** wires a DOM event to a controller method: `data-action=\"click->name#method\"` means \"when this element is clicked, call `method` on the `name` controller.\" The HTML declares the wiring; the JS just supplies the behavior.",
          ],
        },
        {
          type: "code",
          title: "app/javascript/controllers/cancel_confirm_controller.js",
          source: String.raw`import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  confirm(event) {
    if (!window.confirm("Cancel this booking?")) {
      event.preventDefault()
    }
  }
}`,
          caption: "One method, one job: if the admin says no, `event.preventDefault()` stops the click from submitting the cancel form at all. No confirmation library, no modal component — the browser's own `confirm()` dialog, wired up by a five-line controller.",
        },
        {
          type: "code",
          title: "app/views/admin/dashboard/_booking.html.erb — wiring the action",
          source: String.raw`<div data-controller="cancel-confirm">
  <%= button_to "Cancel", admin_booking_path(booking), method: :patch,
        data: { action: "click->cancel-confirm#confirm" } %>
</div>`,
          caption: "`data-controller=\"cancel-confirm\"` connects the Stimulus controller to this `div`. `data-action=\"click->cancel-confirm#confirm\"` on the button says: on click, call `confirm` on that controller BEFORE the button's own submit happens — giving `confirm` the chance to call `preventDefault()` and stop it.",
        },
        {
          type: "exercise",
          title: "Connect a Stimulus controller to a button",
          prompt: [
            "Add a `data-controller` attribute to the `div` below, connecting it to the `cancel-confirm` controller (same name as the JS class file you just saw).",
          ],
          starter: String.raw`<div>
  <!-- your code here: connect this div to the cancel-confirm controller -->
  <button type="submit">Cancel</button>
</div>`,
          solution: String.raw`<div data-controller="cancel-confirm">
  <button type="submit">Cancel</button>
</div>`,
          checks: [
            { re: /data-controller="cancel-confirm"/, hint: "`data-controller=\"cancel-confirm\"` on the `div` — that's what connects the Stimulus class to this piece of HTML." },
          ],
          mustNot: [
            { re: /data-controller="cancelConfirm"/, hint: "Stimulus controller identifiers in HTML are dasherized (`cancel-confirm`), even though the JS file and class are `cancel_confirm_controller` / camelCase internally." },
          ],
          success: "That's the connection point — every `data-target` and `data-action` naming `cancel-confirm` on this element or its children now reaches your controller.",
        },
        {
          type: "quiz",
          q: "What's the core Hotwire philosophy that Stimulus follows?",
          choices: [
            "The server renders real HTML and stays the source of truth; JavaScript is a light sprinkle of behavior on top, not a framework that owns and re-renders the page",
            "JavaScript should own all rendering, and the server should only ever return JSON",
            "Every interactive element needs its own client-side component with local state",
            "Stimulus replaces Turbo for anything involving user interaction",
          ],
          answer: 0,
          explain: "That's the thread running through this whole module: Turbo Drive/Frames/Streams keep the server in charge of the HTML, and Stimulus only steps in for the small slice of behavior HTML alone can't express — a confirm dialog, a toggle. Nothing here re-implements rendering in JS or hands state ownership to the client.",
          nudge: "Across this whole module, who has been building the actual HTML — the server, or JavaScript in the browser?",
        },
      ],
    },
  ],
});
