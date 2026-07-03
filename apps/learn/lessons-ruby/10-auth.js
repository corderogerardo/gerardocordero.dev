window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "pawwalk-auth",
  title: "Auth: Passwords & Tokens",
  emoji: "🔐",
  lang: "ruby",
  lessons: [
    {
      id: "passwords-done-right",
      title: "Passwords Done Right",
      steps: [
        {
          type: "text",
          md: [
            "## Never store the real password",
            "In 2012, LinkedIn's database of 6.5 million passwords leaked — stored as plain unsalted hashes, cracked in days, dumped online for anyone to search. The lesson the whole industry took from that: if your database is ever stolen, the attacker must NOT get everyone's real password. PawWalk's `users` table doesn't even have a column called `password` — it has `password_digest`, and nothing in the codebase ever writes a real password into it.",
            "A **digest** is the one-way scramble of a password — feed in `\"walkies123\"`, get back something like `$2a$12$Q.yrgB7Ym9a9ev3geHF.zOH00IjlHUeJhtQ6HnA15qqx9C6AIDRvG`. There's no function that turns that string back into `\"walkies123\"` — that's what \"one-way\" means.",
          ],
        },
        {
          type: "text",
          md: [
            "## Hashing is not encryption",
            "Encryption is reversible on purpose — you encrypt so the RIGHT person can decrypt later with a key. Hashing is irreversible on purpose — you hash so that NO ONE, not even PawWalk itself, can ever recover the original. Three properties make a hash good for passwords:",
            "- **One-way** — there's no `unhash()`. The only way to test a guess is to hash the guess and compare digests.\n- **Salted** — random bytes get mixed in before hashing, so two users who both pick `\"password123\"` end up with two completely different digests. Without a salt, an attacker precomputes one giant table of hash → common-password and matches your whole database against it in seconds.\n- **Slow, on purpose** — algorithms like `bcrypt` (what PawWalk uses) take real, non-trivial time per guess. Fast hashes like plain SHA-256 let a stolen database be brute-forced at billions of guesses a second; bcrypt turns that into years.",
          ],
        },
        {
          type: "text",
          md: [
            "## `has_secure_password` — one line, three methods",
            "Rails ships a single line that wires up bcrypt hashing, salting, and comparison for you: `has_secure_password`. Add it to a model with a `password_digest` string column, and Rails gives you `password=`, `password_confirmation=`, and `authenticate` for free — no hashing code anywhere in your own app.",
          ],
        },
        {
          type: "code",
          title: "app/models/user.rb",
          source: String.raw`class User < ApplicationRecord
  has_secure_password

  has_many :dogs
  has_many :bookings

  normalizes :email, with: ->(email) { email.strip.downcase }

  validates :name, presence: true
  validates :email, presence: true,
                     uniqueness: { case_sensitive: false },
                     format: { with: /\A[^@\s]+@[^@\s]+\z/ }
end`,
          caption: "`has_secure_password` reads the `password_digest` column and gives `User` a virtual `password=` setter (hashes and stores into `password_digest`, never keeps the plaintext around) plus `#authenticate(guess)` (re-hashes `guess`, compares digests, returns the user or `false`). Nothing else in this file mentions hashing at all — that's the whole point of the one-liner.",
        },
        {
          type: "text",
          md: [
            "## What that one line actually buys you",
            "```\nuser = User.new(name: \"Ana\", email: \"ana@example.com\")\nuser.password = \"walkies123\"          # hashes it, stores password_digest, never keeps \"walkies123\"\nuser.password_digest                    # \"$2a$12$Q.yrgB7Ym9a9ev3geHF...\"\nuser.authenticate(\"walkies123\")         # => the user (truthy)\nuser.authenticate(\"wrong-guess\")        # => false\n```",
            "`authenticate` never decrypts `password_digest` to check a guess — it hashes the guess with the SAME salt and compares the two digests for equality. That's the entire trick behind verifying a password you can never read back.",
          ],
        },
        {
          type: "quiz",
          q: "Why is bcrypt deliberately SLOW instead of a fast hash like plain SHA-256?",
          choices: [
            "Slowness makes brute-forcing millions of stolen-digest guesses expensive for an attacker",
            "Slow code gives Rails time to write to the audit log",
            "Fast hashes don't fit in a `password_digest` string column",
            "It makes `has_secure_password` easier to spell",
          ],
          answer: 0,
          explain: "A fast hash lets an attacker who steals `password_digest` values try billions of guesses per second. bcrypt is tuned to cost real, non-trivial time per guess, so the same attack takes years instead of hours — the slowness punishes whoever stole the database, not your real users logging in once.",
          nudge: "Think about who actually calls the hash function billions of times in a row — your login route, or an attacker with a stolen table?",
        },
        {
          type: "exercise",
          title: "The auth-relevant lines of User",
          prompt: [
            "Retype the top of `User`: the class declaration `class User < ApplicationRecord`, then the one line that gives it `password=`/`authenticate` for free, `has_secure_password`.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`class User < ApplicationRecord
  has_secure_password
end`,
          checks: [
            { re: /class User<ApplicationRecord/, hint: "Match the real class line: `class User < ApplicationRecord`." },
            { re: /has_secure_password/, hint: "Add the one line that wires up bcrypt: `has_secure_password`." },
            { re: /end/, hint: "Close the class with `end`." },
          ],
          mustNot: [
            { re: /def authenticate/, hint: "Don't hand-write `authenticate` — `has_secure_password` already generates it for you." },
            { re: /password_digest=password/, hint: "Never assign `password_digest` directly from a raw password — that would store it unhashed." },
          ],
          success: "That's the exact line from apps/pawwalk-api/app/models/user.rb — one word doing the job of a hand-rolled hashing module.",
        },
      ],
    },
    {
      id: "jwt-101",
      title: "JWT 101",
      steps: [
        {
          type: "text",
          md: [
            "## Why tokens, not cookies, for an API",
            "A browser juggling a session cookie makes sense for a website — the browser has a cookie jar and sends it back automatically. PawWalk's real clients are the iOS app (and later Android) — no cookie jar, no browser. What they need is a portable, self-contained proof of identity they can store themselves and attach to every request by hand: a **JWT** (JSON Web Token).",
            "This is exactly the string the iOS app got back from `/signup` and `/login` and stored in the Keychain, then sent back as `Authorization: Bearer <token>` on every request after that. Module 10 is where that token actually gets minted and checked, server-side.",
          ],
        },
        {
          type: "text",
          md: [
            "## Anatomy: header.payload.signature",
            "A JWT is one string, three base64 chunks joined by dots: `header.payload.signature`. Take a real token PawWalk issued and split it on the dots:",
            "```\neyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3ODMxODE2Njh9.1px2SI57baHJeEFn-dMFRAic9BGcGHeyXu06zHFpbTo\n```",
            "Decode the first two chunks (plain base64, no secret needed) and you get:",
            "```\nheader:  {\"alg\" => \"HS256\"}\npayload: {\"user_id\" => 1, \"exp\" => 1783181668}\n```",
            "**Header** says which algorithm signed it. **Payload** holds the claims — `user_id` (who this token is for) and `exp` (a Unix timestamp: when it stops being valid). **Signature** is the server signing `header + payload` with a secret key only it knows — change one character of the payload and the signature no longer matches, so tampering is detectable immediately.",
          ],
        },
        {
          type: "text",
          md: [
            "## Signed, not encrypted",
            "That decode above didn't need any secret — just base64. **Anyone holding a JWT can read its payload.** What they can't do is forge a NEW payload with a valid signature, because producing a matching signature requires the secret key, which never leaves the server. This is why a JWT payload must never contain a real secret (a password, a credit card number) — assume every claim in it is public. `user_id` is fine to expose; it's an identifier, not a secret.",
          ],
        },
        {
          type: "code",
          title: "app/lib/json_web_token.rb",
          source: String.raw`module JsonWebToken
  SECRET = Rails.application.secret_key_base

  def self.encode(payload, exp: 24.hours.from_now)
    payload = payload.merge(exp: exp.to_i)
    JWT.encode(payload, SECRET, "HS256")
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET, true, algorithm: "HS256").first
    ActiveSupport::HashWithIndifferentAccess.new(decoded)
  end
end`,
          caption: "`encode` takes a hash of claims, merges in an `exp` 24 hours out by default, and signs it with `Rails.application.secret_key_base` — the app's own secret, never sent to a client. `decode` verifies that signature (the `true` argument) and hands back an indifferent-access hash, so `payload[:user_id]` and `payload[\"user_id\"]` both work. An expired or tampered token raises `JWT::DecodeError` — module 10's next lesson is where that gets caught.",
        },
        {
          type: "text",
          md: [
            "## The Ruby 3.4 trap this file's call sites hit",
            "Look at the signature again: `def self.encode(payload, exp: 24.hours.from_now)`. `exp:` is a **keyword argument** — it MUST be passed as `name: value`, never positionally. Every real call site in the app passes `payload` as an explicit hash literal for exactly this reason:",
            "```\n# This FAILS in Ruby 3.4 — ArgumentError: wrong number of arguments (given 0, expected 1)\nJsonWebToken.encode(user_id: 1)\n\n# This works — an explicit hash literal as the FIRST positional argument\nJsonWebToken.encode({ user_id: 1 })\n```",
            "Here's why the bare version blows up: Ruby 3.4 sees `encode(user_id: 1)` and reads `user_id: 1` as an attempt to fill KEYWORD parameters, not the first positional `payload`. `encode` only declares one keyword parameter, `exp:`, and `user_id:` isn't it — so Ruby treats the call as \"zero positional arguments given, one required,\" and raises. Wrapping the hash in `{ }` — `encode({ user_id: 1 })` — makes it unambiguously a single positional Hash argument again. This is a real trap the app's own authors hit; every call site in `users_controller.rb` and `sessions_controller.rb` uses the `{ ... }` form deliberately.",
          ],
        },
        {
          type: "quiz",
          q: "`JsonWebToken.encode(user_id: 1)` raises `ArgumentError: wrong number of arguments (given 0, expected 1)` in Ruby 3.4. Why?",
          choices: [
            "Ruby reads bare `user_id: 1` as a keyword argument, not the positional `payload` hash the method expects — wrap it in `{ }` to pass it positionally",
            "`JsonWebToken.encode` doesn't accept a `user_id` claim at all",
            "`self.encode` methods can never accept keyword arguments in Ruby 3.4",
            "The call is missing the `exp:` keyword, which is required",
          ],
          answer: 0,
          explain: "`encode(payload, exp: ...)` has exactly one keyword parameter, `exp:`. A bare `user_id: 1` at the call site gets parsed as an attempt to fill keyword params, not as the positional `payload`. Since `user_id:` isn't a declared keyword, Ruby sees zero positional args where one is required. `JsonWebToken.encode({ user_id: 1 })` — an explicit hash literal — is unambiguous and works.",
          nudge: "Ruby 3.4 changed how bare `key: value` at a call site gets interpreted when the method ALSO declares real keyword parameters. Is `user_id:` one of `encode`'s declared keywords?",
        },
        {
          type: "exercise",
          title: "Encode, then decode",
          prompt: [
            "Call `JsonWebToken.encode` with an explicit hash literal containing `user_id: 1`, storing the result in `token`. Then call `JsonWebToken.decode(token)`, storing the result in `payload`. Finally `puts payload[:user_id]`.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`token = JsonWebToken.encode({ user_id: 1 })
payload = JsonWebToken.decode(token)
puts payload[:user_id]`,
          checks: [
            { re: /token=JsonWebToken\.encode\(\{user_id:1\}\)/, hint: "Pass an explicit hash literal, not a bare keyword: `JsonWebToken.encode({ user_id: 1 })`." },
            { re: /payload=JsonWebToken\.decode\(token\)/, hint: "Decode the token you just made: `payload = JsonWebToken.decode(token)`." },
            { re: /puts payload\[:user_id\]/, hint: "Read the claim back out: `puts payload[:user_id]`." },
          ],
          mustNot: [
            { re: /JsonWebToken\.encode\(user_id:1\)/, hint: "That's the bare-keyword form that raises `ArgumentError` in Ruby 3.4 — wrap the hash in `{ }`." },
          ],
          success: "A full round-trip: sign a claim, then verify and read it back — exactly what `/login` and `authenticate_request` do on opposite ends of every request.",
        },
      ],
    },
    {
      id: "signup-login",
      title: "Signup & Login",
      steps: [
        {
          type: "text",
          md: [
            "## Signup: create, hash, mint a token",
            "`/signup` (`UsersController#create`) takes a name/email/password, creates the user (hashing the password via `has_secure_password` along the way), and hands back a token so the client is immediately logged in — no separate login step required right after signing up.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/users_controller.rb",
          source: String.raw`class UsersController < ApplicationController
  skip_before_action :authenticate_request

  def create
    user = User.create!(user_params)
    token = JsonWebToken.encode({ user_id: user.id })

    render json: { user: user_payload(user), token: }, status: :created
  end

  private

  def user_params
    params.permit(:name, :email, :password)
  end
end`,
          caption: "`user_params` is strong params — an explicit allowlist of `:name`, `:email`, `:password`, so nothing else on an incoming request body reaches `User.create!`. `create!` (bang) raises `ActiveRecord::RecordInvalid` on a bad email or missing name — `ApplicationController`'s `rescue_from` turns that into a 422 automatically, so this action never handles validation itself. `token:` is Ruby's shorthand for `token: token` in a hash literal. `skip_before_action :authenticate_request` matters here: you can't require a token to sign up FOR a token.",
        },
        {
          type: "text",
          md: [
            "## Login: the same 401 for two different reasons",
            "`/login` (`SessionsController#create`) looks up a user by email, then tries to authenticate. Read the condition closely — it's doing two checks in one expression on purpose.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/sessions_controller.rb",
          source: String.raw`class SessionsController < ApplicationController
  skip_before_action :authenticate_request

  def create
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      token = JsonWebToken.encode({ user_id: user.id })
      render json: { user: user_payload(user), token: }, status: :ok
    else
      render json: { error: "invalid email or password" }, status: :unauthorized
    end
  end
end`,
          caption: "`User.find_by` returns `nil` for an unknown email instead of raising — that's what makes `user&.authenticate(...)` safe: module 04's safe-navigation operator (`&.`) means \"call `.authenticate` only if `user` isn't `nil`\", so a missing user just evaluates the whole condition to `nil` (falsy) instead of crashing with `NoMethodError`. A wrong password makes `authenticate` itself return `false`. Both paths land in the SAME `else` branch, with the SAME message and the SAME 401 — deliberately. If \"no such user\" and \"wrong password\" returned different errors, an attacker could enumerate which emails have accounts on PawWalk just by trying logins.",
        },
        {
          type: "quiz",
          q: "`SessionsController#create` returns the exact same `401 invalid email or password` whether the email doesn't exist OR the password is wrong. Why not tell the client which one failed?",
          choices: [
            "Revealing which one failed would let an attacker enumerate which emails have registered PawWalk accounts, one login attempt at a time",
            "Rails can't distinguish a missing record from a failed `authenticate` call",
            "A more specific error message would be slower to render",
            "`user&.authenticate` can only ever return one kind of failure",
          ],
          answer: 0,
          explain: "\"No such user\" and \"wrong password\" are collapsed into one identical response on purpose. If they differed, an attacker could feed in a list of emails and learn which ones are registered PawWalk users just from the error message — a real information leak with no upside for a legitimate user.",
          nudge: "Imagine an attacker trying a thousand emails against `/login`. What could they learn if a missing user and a wrong password gave DIFFERENT errors?",
        },
        {
          type: "exercise",
          title: "Retype the login action's core",
          prompt: [
            "Given `user` (a `User` or `nil`, already looked up) and `params[:password]`, write the branch: if `user&.authenticate(params[:password])` is truthy, `render json: { user: user_payload(user) }, status: :ok`. Otherwise render `{ error: \"invalid email or password\" }` with `status: :unauthorized`.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`if user&.authenticate(params[:password])
  render json: { user: user_payload(user) }, status: :ok
else
  render json: { error: "invalid email or password" }, status: :unauthorized
end`,
          checks: [
            { re: /if user&\.authenticate\(params\[:password\]\)/, hint: "Guard with safe navigation so a `nil` user doesn't crash: `if user&.authenticate(params[:password])`." },
            { re: /status::ok/, hint: "The success branch renders with `status: :ok`." },
            { re: /render json:\{error:"invalid email or password"\},status::unauthorized/, hint: "Match the exact failure branch: `render json: { error: \"invalid email or password\" }, status: :unauthorized`." },
          ],
          mustNot: [
            { re: /user\.authenticate/, hint: "Use `user&.authenticate`, not a bare `user.authenticate` — a `nil` user would crash without the safe-navigation `&.`." },
            { re: /params\[:password\]==user\.password/, hint: "Never compare against a raw `password` field — there isn't one. Passwords are only ever checked through `authenticate`." },
          ],
          success: "That's the real branch from SessionsController#create — one condition, two silent failure modes, one identical response.",
        },
      ],
    },
    {
      id: "authentication-concern",
      title: "The Authentication Concern",
      steps: [
        {
          type: "text",
          md: [
            "## One concern, every controller",
            "Signup and login skip authentication because they GRANT it. Everything else in PawWalk needs to check a token before running — and instead of repeating that check in every single controller, it lives in one shared module: `Authentication`, a Rails **concern** mixed into `ApplicationController`.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/concerns/authentication.rb",
          source: String.raw`module Authentication
  extend ActiveSupport::Concern

  included do
    attr_reader :current_user

    before_action :authenticate_request
  end

  private

  def authenticate_request
    token = request.headers["Authorization"]&.split(" ")&.last
    payload = JsonWebToken.decode(token)
    @current_user = User.find(payload[:user_id])
  rescue JWT::DecodeError, ActiveRecord::RecordNotFound
    render json: { error: "unauthorized" }, status: :unauthorized
  end

  def user_payload(user)
    { id: user.id, name: user.name, email: user.email }
  end
end`,
          caption: "`ActiveSupport::Concern` lets `included do ... end` run its block in the CONTEXT of whatever class includes this module — so `attr_reader :current_user` and `before_action :authenticate_request` get declared on `ApplicationController` itself, not on `Authentication`. Every controller that inherits from `ApplicationController` gets both for free.",
        },
        {
          type: "text",
          md: [
            "## Reading `authenticate_request` line by line",
            "`request.headers[\"Authorization\"]` is a string like `\"Bearer eyJhbGci...\"`. `&.split(\" \")` splits it into `[\"Bearer\", \"eyJhbGci...\"]` — but only if the header exists at all (`&.` again, guarding a missing header the same way it guarded a missing user in the last lesson). `&.last` takes the second element, the actual token, or `nil` if any earlier step came back `nil`.",
            "`JsonWebToken.decode(token)` either returns a payload hash or raises `JWT::DecodeError` — for a missing, garbage, or expired token, all three. `User.find(payload[:user_id])` raises `ActiveRecord::RecordNotFound` if that user id doesn't exist (a deleted account, say). **Both exceptions are caught by the SAME rescue clause**, rendering the same `401 unauthorized` — a missing header, garbage token, expired token, and a deleted user's token all fail identically, for the same reason the login errors were collapsed: don't hand an attacker information about WHY it failed.",
          ],
        },
        {
          type: "text",
          md: [
            "## How `ApplicationController include Authentication` protects everything",
            "```\nclass ApplicationController < ActionController::API\n  include Authentication\n  # ...\nend\n```",
            "`include Authentication` runs that `included do ... end` block once, at class-definition time — which is why `before_action :authenticate_request` ends up applying to EVERY action of EVERY controller in the app, automatically, with zero repeated code. That's the default. Now module 09's `walkers#index` — public, no login required — finally makes sense: it has to explicitly OPT OUT.",
            "```\nclass WalkersController < ApplicationController\n  skip_before_action :authenticate_request\n\n  def index\n    walkers = Walker.order(rating: :desc)\n    render json: { walkers: walkers.map { |w| walker_payload(w) } }\n  end\nend\n```",
            "`skip_before_action :authenticate_request` is the exact same line `UsersController` and `SessionsController` use — the walkers list, signup, and login are the deliberate exceptions to an otherwise locked-down API. Everything else — bookings, `/me`, payments — requires a valid `Authorization: Bearer <token>` header by default, with no per-controller code needed to make that true.",
          ],
        },
        {
          type: "quiz",
          q: "`authenticate_request` rescues BOTH `JWT::DecodeError` and `ActiveRecord::RecordNotFound` with the exact same `401 unauthorized`. Why lump two different exceptions into one response?",
          choices: [
            "A garbage/expired/missing token and a valid-looking token for a since-deleted user should look identical to the client — neither case should leak WHY authentication failed",
            "Rails requires exactly one `rescue` clause per method",
            "`ActiveRecord::RecordNotFound` and `JWT::DecodeError` are actually the same exception class",
            "It's a performance optimization — one rescue is faster than two",
          ],
          answer: 0,
          explain: "Same instinct as the login lesson: whether the token is garbage, expired, or valid-but-for-a-user-that-no-longer-exists, the client just gets 401 unauthorized. Distinguishing them would tell an attacker probing tokens more than they should ever learn about the server's internal state.",
          nudge: "You just saw this exact pattern in `SessionsController` — collapsing two different failure causes into one response. What was the reasoning there?",
        },
        {
          type: "exercise",
          title: "Retype authenticate_request's core",
          prompt: [
            "Write `authenticate_request`: read the token out of `request.headers[\"Authorization\"]` (split on a space, take the last piece, guarding a missing header with `&.`), decode it with `JsonWebToken.decode`, then set `@current_user` to `User.find(payload[:user_id])`.",
          ],
          starter: String.raw`def authenticate_request
  # your code here
end`,
          solution: String.raw`def authenticate_request
  token = request.headers["Authorization"]&.split(" ")&.last
  payload = JsonWebToken.decode(token)
  @current_user = User.find(payload[:user_id])
end`,
          checks: [
            { re: /token=request\.headers\["Authorization"\]&\.split\("\s*"\)&\.last/, hint: "Chain safe-navigation through both steps: `request.headers[\"Authorization\"]&.split(\" \")&.last`." },
            { re: /payload=JsonWebToken\.decode\(token\)/, hint: "Decode the extracted token: `payload = JsonWebToken.decode(token)`." },
            { re: /@current_user=User\.find\(payload\[:user_id\]\)/, hint: "Load the user by the decoded claim: `@current_user = User.find(payload[:user_id])`." },
          ],
          mustNot: [
            { re: /request\.headers\["Authorization"\]\.split/, hint: "Use `&.split`, not a bare `.split` — a missing header is `nil`, and `nil.split` would crash without the safe-navigation guard." },
          ],
          success: "That's the real guts of the Authentication concern — the same three lines protecting every route in PawWalk except the handful that opt out.",
        },
      ],
    },
    {
      id: "prove-it-with-curl",
      title: "Prove It with curl",
      steps: [
        {
          type: "text",
          md: [
            "## Time to hit the real thing",
            "Everything in this module is running code in `apps/pawwalk-api` right now. Boot it and drive the whole auth flow yourself with `curl` — signup, login, an authenticated request, and both ways it can fail.",
          ],
        },
        {
          type: "xcode",
          label: "Over to the terminal",
          title: "Signup, login, /me — and both ways it fails",
          intro: [
            "Make sure the server's running (`bin/dev` or `rails server` from module 09), then work through these one at a time:",
          ],
          items: [
            "Sign up a new user: `curl -X POST http://localhost:3000/signup -d \"name=Cur L\" -d \"email=curl-demo@example.com\" -d \"password=secret123\"` — copy the `token` field from the response",
            "Log in with the seeded demo user instead: `curl -X POST http://localhost:3000/login -d \"email=demo@pawwalk.dev\" -d \"password=walkies123\"`",
            "Save the token into a shell variable: `TOKEN=$(curl -s -X POST http://localhost:3000/login -d \"email=demo@pawwalk.dev\" -d \"password=walkies123\" | ruby -rjson -e 'puts JSON.parse(STDIN.read)[\"token\"]')`",
            "Call the protected route with it: `curl http://localhost:3000/me -H \"Authorization: Bearer $TOKEN\"` — expect your demo user's `name` and `email` back",
            "Now with NO token at all: `curl -i http://localhost:3000/me` — expect `401` and `{\"error\":\"unauthorized\"}`",
            "Now with a garbage token: `curl -i http://localhost:3000/me -H \"Authorization: Bearer garbage\"` — expect the same `401`",
          ],
        },
        {
          type: "code",
          title: "Terminal — real transcript from this exact flow",
          source: String.raw`$ curl -X POST http://localhost:3029/login -d "email=demo@pawwalk.dev" -d "password=walkies123"
{"user":{"id":1,"name":"Demo User","email":"demo@pawwalk.dev"},"token":"eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE3ODMxODE2Njh9.1px2SI57baHJeEFn-dMFRAic9BGcGHeyXu06zHFpbTo"}

$ curl http://localhost:3029/me -H "Authorization: Bearer $TOKEN"
{"user":{"id":1,"name":"Demo User","email":"demo@pawwalk.dev"}}

$ curl -i http://localhost:3029/me
{"error":"unauthorized"}
status: 401

$ curl -i http://localhost:3029/me -H "Authorization: Bearer garbage"
{"error":"unauthorized"}
status: 401

$ curl -X POST http://localhost:3029/login -d "email=demo@pawwalk.dev" -d "password=wrong-password"
{"error":"invalid email or password"}
status: 401`,
          caption: "Real output, captured against a running dogpark server on a spare port. Notice `/me` with no token and `/me` with a garbage token return the EXACT same body and status — no hint which was missing versus invalid.",
        },
        {
          type: "text",
          md: [
            "## Security notes — short and punchy",
            "- **HTTPS only in production.** A JWT sent over plain HTTP is readable by anyone on the network between the client and PawWalk's server — the signature stops forgery, not eavesdropping. Every real deploy (module 15's Kamal setup) terminates TLS before a request ever reaches Rails.\n- **Never log a token.** A token in a log file is as dangerous as the password it replaced — anyone who can read the logs can impersonate that user until the token expires. Treat `Authorization` headers like passwords in every log line and error report.\n- **Short expiry + refresh strategies** — PawWalk's tokens expire in 24 hours (`json_web_token.rb`'s default). A shorter-lived access token paired with a separate longer-lived refresh token is the standard way to limit how long a STOLEN token stays useful, without forcing a user to re-enter their password constantly. PawWalk doesn't implement refresh tokens yet — worth naming as the next step for a production-grade system.\n- **Rate-limit login attempts.** Nothing in `SessionsController#create` currently stops someone from trying a password a million times a second. The standard fix is `rack-attack`, a gem that throttles requests by IP or by the params being sent — worth adding before this API ever takes real traffic.",
          ],
        },
        {
          type: "quiz",
          q: "Capstone: a token is valid, signed correctly, and not expired — but it was issued for a user account that was deleted five minutes ago. What does `authenticate_request` do?",
          choices: [
            "`User.find(payload[:user_id])` raises `ActiveRecord::RecordNotFound`, caught by the same rescue as a bad token, rendering `401 unauthorized`",
            "It succeeds — the signature is valid, so the request proceeds with `current_user` set to `nil`",
            "It crashes the server with an unhandled 500 error",
            "Rails automatically re-creates the deleted user",
          ],
          answer: 0,
          explain: "A structurally valid, correctly-signed, unexpired token still needs to resolve to a REAL row. `User.find` raises `ActiveRecord::RecordNotFound` for a missing id, and `authenticate_request`'s rescue clause catches that alongside `JWT::DecodeError` — both paths end at the identical `401 unauthorized`, whether the token itself was bad or the account behind it is simply gone.",
          nudge: "Signature validity and 'does this user still exist' are two separate checks in `authenticate_request`. Which line handles the second one, and what does it raise when it fails?",
        },
      ],
    },
  ],
});
