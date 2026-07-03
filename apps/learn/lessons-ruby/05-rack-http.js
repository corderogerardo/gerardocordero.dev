window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "rack-http",
  title: "HTTP & Rack",
  emoji: "🕸️",
  lang: "ruby",
  lessons: [
    {
      id: "how-the-web-talks",
      title: "How the Web Talks",
      steps: [
        {
          type: "text",
          md: [
            "## Every network call, unwrapped",
            "Four modules of pure Ruby down — no server, no network, just values and methods. That changes now. Once PawWalk's iOS and Android apps ask for walkers or book a walk, they're sending an **HTTP request** over the network and getting an **HTTP response** back. Both are just plain text — no magic, no binary format. You could type one by hand and a server would understand it.",
          ],
        },
        {
          type: "code",
          title: "A raw HTTP request and response",
          source: String.raw`GET /walkers/w_1 HTTP/1.1
Host: localhost:9292
Accept: application/json

HTTP/1.1 200 OK
content-type: application/json
content-length: 74

{"id":"w_1","name":"Ana","rating":4.9,"price_per_30min_cents":2400}`,
          caption: "Top half: the request — a method, a path, headers, a blank line, then a body (empty here). Bottom half: the response — a status line, headers, a blank line, then the body.",
        },
        {
          type: "text",
          md: [
            "## The four pieces of a request",
            "- **Method** — the verb: `GET` (fetch), `POST` (create), `PATCH` (partially update), `DELETE` (remove).\n- **Path** — which resource: `/walkers/w_1`.\n- **Headers** — metadata as `Key: Value` lines. `Accept: application/json` means \"send me JSON back.\"\n- **Body** — the payload. A `GET` usually carries none; a `POST /bookings` carries the new booking as JSON text.",
            "A response mirrors that shape: a **status code** instead of a method and path, then headers, then a body.",
          ],
        },
        {
          type: "text",
          md: [
            "## Mapping methods to PawWalk actions",
            "- `GET /walkers` — browse walkers\n- `POST /bookings` — sign up for a walk\n- `PATCH /bookings/:id` — reschedule or update a booking\n- `DELETE /bookings/:id` — cancel a booking",
            "Nothing here is Ruby-specific — this is the same four-verb shape PawWalk's real backend answers to, whatever language sits behind it.",
          ],
        },
        {
          type: "text",
          md: [
            "## Status codes you'll live with",
            "- **200 OK** — success, here's your data.\n- **201 Created** — success, and something new now exists (a fresh booking).\n- **401 Unauthorized** — you didn't prove who you are.\n- **404 Not Found** — that path or id doesn't exist.\n- **422 Unprocessable Entity** — the request body didn't validate (bad shape, missing field).\n- **500 Internal Server Error** — the server's own code blew up.",
            "That number is exactly what shows up as `.statusCode` or `.status` in every mobile HTTP client PawWalk's apps use — this is where it comes from.",
          ],
        },
        {
          type: "text",
          md: [
            "## curl -i — your microscope",
            "`curl` sends a real HTTP request from your terminal. The `-i` flag prints the response headers along with the body, so you see exactly what came back — the same raw shape as the code block above:",
            "```\n$ curl -i http://localhost:9292/walkers\nHTTP/1.1 200 OK\ncontent-type: application/json\ncontent-length: 137\n\n[{\"id\":\"w_1\",\"name\":\"Ana\", ...}]\n```",
            "You'll use `curl -i` constantly for the rest of this course — it's faster than opening a browser and it shows the parts a browser hides.",
          ],
        },
        {
          type: "quiz",
          q: "The PawWalk app wants to cancel an existing booking. Which HTTP method fits, and what status code should a successful cancel return?",
          choices: [
            "DELETE, and 200 (or 204) for success",
            "GET, and 201 for success",
            "POST, and 404 for success",
            "PATCH, and 500 for success",
          ],
          answer: 0,
          explain: "Cancelling removes a booking, so DELETE is the right verb. A successful DELETE typically answers 200 or 204 — never 404 (that means the booking wasn't found at all) or 500 (that means the server crashed).",
          nudge: "Which verb means \"remove\", and which status family means \"it worked\" rather than \"it crashed\" or \"it's missing\"?",
        },
      ],
    },
    {
      id: "the-rack-contract",
      title: "The Rack Contract",
      steps: [
        {
          type: "text",
          md: [
            "## One contract, every framework",
            "Rails. Sinatra. Every Ruby web framework you'll ever touch. Underneath all of them is the same tiny agreement, called **Rack**: a web app is ANY Ruby object that responds to `call(env)` and returns a 3-element array — `[status, headers, body]`.",
            "- `env` — a hash describing the incoming request (method, path, headers — you'll read from it directly in the next lesson).\n- `status` — an integer, like `200` or `404`.\n- `headers` — a hash of header names to values. Rack 3 requires **lowercase** header names: `\"content-type\"`, not `\"Content-Type\"`.\n- `body` — anything that responds to `each` and yields strings. An array of one string is the simplest possible body.",
            "That's it. No inheritance, no base class to extend — just an object with a `call` method shaped the right way. Rails itself is, underneath everything, one very large object that answers `call(env)`.",
          ],
        },
        {
          type: "code",
          title: "playground/rack_hello/config.ru",
          source: String.raw`run lambda { |env| [200, { "content-type" => "text/plain" }, ["Hello from Rack!"]] }`,
          caption: "The whole app is one line: a lambda takes `env` and returns the `[status, headers, body]` triplet. `run` tells Rack \"this object is the app.\"",
        },
        {
          type: "text",
          md: [
            "## Running it: rackup",
            "A file named `config.ru` (\"ru\" = \"rackup\") is the standard entry point every Rack app uses — Rails has one, Sinatra has one, your throwaway app has one. The `rackup` gem reads it and starts a real HTTP server:",
            "```\ngem install rack rackup puma\nrackup\n```",
            "`puma` is the actual server doing the listening — `rackup` just wires your `config.ru` app into whichever server gem is installed. Rails uses Puma too, by default, for exactly this reason: it's the same Rack-compatible server underneath.",
          ],
        },
        {
          type: "xcode",
          label: "Over to the terminal",
          title: "Run your first Rack app",
          intro: ["Build and run the one-line app above for real:"],
          items: [
            "`mkdir -p playground/rack_hello && cd playground/rack_hello`",
            "`gem install rack rackup puma` (skip if already installed)",
            "Create `config.ru` in that folder with the one-line lambda app shown above",
            "`rackup` — starts Puma, listening on port 9292 by default",
            "In a second terminal: `curl -i http://localhost:9292` — you should see `HTTP/1.1 200 OK` and `Hello from Rack!`",
          ],
        },
        {
          type: "text",
          md: [
            "## Read the real curl output",
            "Notice the response header comes back exactly as you wrote it — lowercase:",
            "```\nHTTP/1.1 200 OK\ncontent-type: text/plain\ncontent-length: 16\n\nHello from Rack!\n```",
            "`content-length` isn't something you set — Rack computes it for you from the body. You only ever hand back `status`, `headers`, and `body`; everything else is the framework's job.",
          ],
        },
        {
          type: "exercise",
          title: "Write the 3-line lambda app",
          prompt: [
            "Write a `config.ru` that runs a lambda taking `env` and returning `[200, { \"content-type\" => \"text/plain\" }, [\"Hello from Rack!\"]]` — the exact app you just ran.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`run lambda { |env| [200, { "content-type" => "text/plain" }, ["Hello from Rack!"]] }`,
          checks: [
            { re: /run lambda\{\|env\|/, hint: "Start with `run lambda { |env| ...` — `run` tells Rack this object is the app." },
            { re: /\[200,\{"content-type"=>"text\/plain"\},\["Hello from Rack!"\]\]/, hint: "Return the exact triplet: `[200, { \"content-type\" => \"text/plain\" }, [\"Hello from Rack!\"]]`." },
          ],
          mustNot: [
            { re: /"Content-Type"/, hint: "Rack 3 headers must be lowercase — use `\"content-type\"`, not `\"Content-Type\"`." },
          ],
          success: "Three elements, one contract — `[status, headers, body]` is the entire vocabulary Rack understands, and now Rails, Sinatra, and everything else make sense as elaborate ways of building that array.",
        },
      ],
    },
    {
      id: "routing-by-hand",
      title: "Routing by Hand",
      steps: [
        {
          type: "text",
          md: [
            "## From a lambda to a class",
            "A one-line lambda can't hold much logic. Rack doesn't care whether your app is a lambda or a class — only that it has a `call(env)` method — so let's grow `config.ru` into a real class and start reading the request instead of ignoring it.",
          ],
        },
        {
          type: "text",
          md: [
            "## Reading env by hand",
            "`env` is a plain hash. Two keys matter for routing: `env[\"REQUEST_METHOD\"]` (a string like `\"GET\"`) and `env[\"PATH_INFO\"]` (a string like `\"/walkers\"`). There's no routing table, no path parser — just string comparisons you write yourself:",
            "```\ndef call(env)\n  if env[\"REQUEST_METHOD\"] == \"GET\" && env[\"PATH_INFO\"] == \"/walkers\"\n    # handle it\n  end\nend\n```",
          ],
        },
        {
          type: "code",
          title: "playground/rack_hello/config.ru",
          source: String.raw`require "json"

class PawWalkApp
  WALKERS = [
    { id: "w_1", name: "Ana", rating: 4.9, price_per_30min_cents: 2400 },
    { id: "w_2", name: "Sam", rating: 4.7, price_per_30min_cents: 2000 },
  ]

  def call(env)
    method = env["REQUEST_METHOD"]
    path = env["PATH_INFO"]

    if method == "GET" && path == "/walkers"
      body = JSON.generate(WALKERS)
      [200, { "content-type" => "application/json" }, [body]]
    else
      [404, { "content-type" => "text/plain" }, ["not found"]]
    end
  end
end

run PawWalkApp.new`,
          caption: "`run PawWalkApp.new` — an instance, not the class itself, since Rack calls `.call` on whatever object you hand it. `JSON.generate` turns the hardcoded walker array straight into a JSON string body.",
        },
        {
          type: "text",
          md: [
            "## Feel the pain",
            "Restart `rackup` and hit both routes. `GET /walkers` works. Anything else — `/walkers/w_1`, `/bookings`, a typo — falls straight into the `else` branch and gets a flat 404, no matter what it was. There's no params parsing (`/walkers/w_1` can't extract `w_1` without you slicing the string yourself), no distinguishing `POST /walkers` from `GET /walkers/w_1`, nothing. Every single case is a manual `if`. This is exactly the tedium Rails's router exists to delete.",
          ],
        },
        {
          type: "xcode",
          label: "Over to the terminal",
          title: "Run the routed app",
          intro: ["Replace your one-line config.ru with the class version above and try both paths:"],
          items: [
            "Overwrite `playground/rack_hello/config.ru` with the `PawWalkApp` class shown above",
            "Stop the old server (Ctrl+C) and run `rackup` again",
            "`curl -i http://localhost:9292/walkers` — see the JSON array with a `content-type: application/json` header",
            "`curl -i http://localhost:9292/nope` — see `HTTP/1.1 404 Not Found` and `not found`",
          ],
        },
        {
          type: "quiz",
          q: "In the hand-rolled `PawWalkApp#call`, what happens if a request comes in as `POST /walkers` instead of `GET /walkers`?",
          choices: [
            "It falls into the `else` branch and gets a 404 — the code never checks the method for that branch alone",
            "Rack automatically routes it to a `post_walkers` method",
            "It raises a `NoMethodError`",
            "It's treated identically to `GET /walkers` since the path matches",
          ],
          answer: 0,
          explain: "The `if` only matches when BOTH the method is `\"GET\"` AND the path is `\"/walkers\"`. A `POST` to the same path fails that check and drops straight to `else` — a 404, even though `/walkers` technically exists for GET. Real routers distinguish this properly; hand-rolled `if`s don't, unless you write every combination yourself.",
          nudge: "Look at the `if` condition again — does it check the path alone, or the method AND the path together?",
        },
        {
          type: "exercise",
          title: "Add a /ping route",
          prompt: [
            "Add a branch to `call` (before the final `else`) so `GET /ping` returns `[200, { \"content-type\" => \"text/plain\" }, [\"pong\"]]`. Keep the existing `/walkers` branch and the `else` 404 branch exactly as they are.",
          ],
          starter: String.raw`def call(env)
  method = env["REQUEST_METHOD"]
  path = env["PATH_INFO"]

  if method == "GET" && path == "/walkers"
    body = JSON.generate(WALKERS)
    [200, { "content-type" => "application/json" }, [body]]
  # your code here
  else
    [404, { "content-type" => "text/plain" }, ["not found"]]
  end
end`,
          solution: String.raw`def call(env)
  method = env["REQUEST_METHOD"]
  path = env["PATH_INFO"]

  if method == "GET" && path == "/walkers"
    body = JSON.generate(WALKERS)
    [200, { "content-type" => "application/json" }, [body]]
  elsif method == "GET" && path == "/ping"
    [200, { "content-type" => "text/plain" }, ["pong"]]
  else
    [404, { "content-type" => "text/plain" }, ["not found"]]
  end
end`,
          checks: [
            { re: /elsif method=="GET"&&path=="\/ping"/, hint: "Add `elsif method == \"GET\" && path == \"/ping\"` right after the `/walkers` branch." },
            { re: /\[200,\{"content-type"=>"text\/plain"\},\["pong"\]\]/, hint: "Return `[200, { \"content-type\" => \"text/plain\" }, [\"pong\"]]` for that branch." },
          ],
          mustNot: [
            { re: /"Content-Type"/, hint: "Keep the header lowercase: `\"content-type\"`." },
          ],
          success: "One more `elsif`, one more manual comparison — and you can already feel why nobody hand-writes routing for a real app past a couple of endpoints.",
        },
      ],
    },
    {
      id: "why-frameworks-exist",
      title: "Why Frameworks Exist",
      steps: [
        {
          type: "text",
          md: [
            "## What you just hand-rolled, badly",
            "Look back at `PawWalkApp#call`: string-compare routing, no path parameters, no request body parsing, no validation, no database, no security headers, one `if` chain that only gets uglier as routes grow. Every one of those gaps is a real feature Rails gives you for free.",
          ],
        },
        {
          type: "text",
          md: [
            "## What Rails gives you",
            "- **Routing DSL** — `get \"/walkers/:id\", to: \"walkers#show\"` replaces the whole `if`/`elsif` chain, path parameters included.\n- **Params** — `params[:id]` is parsed for you from the path, query string, or JSON body.\n- **ActiveRecord (the ORM)** — real persistence instead of a hardcoded `WALKERS` array.\n- **Migrations** — versioned, repeatable database schema changes.\n- **Security headers & protections** — CSRF tokens, safe defaults against common attacks, baked in.\n- **Middleware** — small Rack apps that wrap your Rack app, each one adding one behavior (logging a request, catching an exception, checking a session) before handing off to the next layer inward. A request passes through every middleware on the way in, and the response passes back through every one of them on the way out.",
          ],
        },
        {
          type: "code",
          title: "rails middleware (from a real Rails 8 app)",
          source: String.raw`use ActionDispatch::HostAuthorization
use Rack::Sendfile
use ActionDispatch::Static
use ActionDispatch::Executor
use ActionDispatch::ServerTiming
use ActiveSupport::Cache::Strategy::LocalCache::Middleware
use Rack::Runtime
use ActionDispatch::RequestId
use ActionDispatch::RemoteIp
use Rails::Rack::Logger
use ActionDispatch::ShowExceptions
use ActionDispatch::DebugExceptions
use ActionDispatch::ActionableExceptions
use ActionDispatch::Reloader
use ActionDispatch::Callbacks
use ActiveRecord::Migration::CheckPending
use Rack::Head
use Rack::ConditionalGet
use Rack::ETag
run PawwalkApi::Application.routes`,
          caption: "Every `use` line is a Rack app wrapping the next one — logging, exception handling, request IDs, caching — stacked in front of the final `run`, which is your actual routes. That final line is the same `run` keyword from your one-line `config.ru`, just pointed at something much bigger.",
        },
        {
          type: "text",
          md: [
            "## Same contract, much bigger app",
            "That whole stack — dozens of middleware plus a full routing table — still ultimately answers `call(env)` and returns `[status, headers, body]`. Nothing about the Rack contract changed; Rails just built an enormous, well-tested object that honors it. Module 06: you'll generate a real Rails app with `rails new` and watch it do all of this for real.",
          ],
        },
        {
          type: "quiz",
          q: "A request hits a Rails app wrapped in five middleware, then the router, then your controller. On the way OUT, in what order does the response pass back through those five middleware?",
          choices: [
            "Reverse order — the last middleware the request passed through on the way in is the first to see the response on the way out",
            "The same order as the request — first to last",
            "Middleware only runs on the way in, never on the way out",
            "A random order chosen at boot time",
          ],
          answer: 0,
          explain: "Middleware wraps the app like layers of an onion: the request goes in layer by layer to the core, and the response comes back out through the same layers in reverse. The first middleware to touch the request is the last to touch the response.",
          nudge: "Think of nested wrapping — if you wrap a gift in five boxes, which box do you remove first when unwrapping? Now flip that for wrapping.",
        },
        {
          type: "exercise",
          title: "Return a 201 Created",
          prompt: [
            "Write a single Ruby expression — the Rack return triplet — for a successful `POST /bookings` that creates a booking. Status `201`, header `\"content-type\" => \"application/json\"`, and body `[\"{\\\"id\\\":\\\"b_1\\\"}\"]`.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`[201, { "content-type" => "application/json" }, ["{\"id\":\"b_1\"}"]]`,
          checks: [
            { re: /^\[201,\{"content-type"=>"application\/json"\},\["\{\\"id\\":\\"b_1\\"\}"\]\]$/, hint: "Match the full triplet: `[201, { \"content-type\" => \"application/json\" }, [\"{\\\"id\\\":\\\"b_1\\\"}\"]]`." },
          ],
          mustNot: [
            { re: /^\[200,/, hint: "Creating a new booking is a 201, not a 200 — 200 is for a plain success with nothing new created." },
          ],
          success: "201 for \"created something new\", the exact triplet shape Rack expects everywhere — you've now written the same three-element array by hand, by lambda, by class, and for a real endpoint.",
        },
      ],
    },
  ],
});
