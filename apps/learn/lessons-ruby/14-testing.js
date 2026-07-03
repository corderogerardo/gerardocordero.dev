// Module 14 — Testing the API: from test-runner to test-writer. See FORMAT.md + FORMAT-RUBY.md for the schema.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "pawwalk-testing",
  title: "Testing the API",
  emoji: "✅",
  lang: "ruby",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "the-loop-and-minitest",
      title: "The Loop & Minitest",
      steps: [
        {
          type: "text",
          md: [
            "## You've been running this the whole time",
            "Every checklist since module 09 has told you to run `bin/rails test` before moving on. Thirteen modules, sixty-six tests, and you've watched the dots print green every single time — without ever reading what a single one of those tests actually says. That changes now. This module doesn't add a feature to PawWalk. It teaches you to read, and then write, the suite that's been quietly guarding every feature you already built.",
            "The JS apps in this monorepo call their green gate **the loop** — `typecheck`, `lint`, `test`, run after every change, before anything ships. PawWalk has the exact same idea in Ruby clothes: `bin/rails test` and `bin/rubocop`. Every feature from auth to payments to live tracking landed in this app gated on both commands passing. A test suite isn't homework bolted on afterward — it's the reason you've been able to add fourteen modules of features on top of module 09's foundation without anything from module 09 quietly breaking.",
          ],
        },
        {
          type: "text",
          md: [
            "## Why tests: the fearless refactor",
            "Picture editing `Booking#compute_price!` with no tests at all. You'd have to manually re-check every place a booking gets created, re-run every curl command from every past module's checklist, and still not be sure you didn't break `cancel` or the Stripe flow. With the real suite in place, you make the change and run one command. If the dots stay green, you've just proven — not guessed — that bookings, cancellations, payments, jobs, mailers, and channels all still behave. That's the whole pitch for automated tests: they turn \"I think this still works\" into \"I know this still works,\" in seconds, not an afternoon of manual clicking.",
          ],
        },
        {
          type: "text",
          md: [
            "## Minitest: plain Ruby, Rails' default",
            "Rails ships with **Minitest** as its default test framework, and the honest reason it feels approachable is that a Minitest test is just a Ruby class with methods — no special DSL to memorize before you can read one:",
            "```\nclass BookingTest < ActiveSupport::TestCase\n  test \"upcoming scope includes future bookings\" do\n    assert_includes Booking.upcoming, bookings(:upcoming)\n  end\nend\n```",
            "`test \"description\" do ... end` is a thin wrapper that defines a real method named after the description. Everything inside is plain Ruby you already know: local variables, method calls, `if`. There's a second major framework worth naming honestly, since it shows up constantly in job postings: **RSpec**. RSpec wraps the same underlying ideas — setup, action, assertion — in its own `describe`/`it`/`expect` DSL. Same job, different syntax. This course teaches Minitest because it's what `apps/pawwalk-api` actually runs, but if a future job uses RSpec, you already understand the shape underneath the different words.",
          ],
        },
        {
          type: "text",
          md: [
            "## The real test-directory tree",
            "Open `apps/pawwalk-api/test/` and the folder names tell you exactly what layer each test targets — this isn't a convention you memorize from a guide, it's the actual tree sitting in the repo right now:",
            "```\ntest/\n  models/        # ActiveRecord validations, enums, scopes — no HTTP involved\n  integration/    # full HTTP requests through routes + controllers, like a real client\n  channels/       # ActionCable subscriptions (WalkChannel from module 13)\n  mailers/        # ActionMailer content (BookingMailer)\n  jobs/           # ActiveJob behavior (BookingConfirmationJob)\n  test_helper.rb  # shared setup every test file requires\n```",
            "Five directories, five layers of the app, each with its own base class: `ActiveSupport::TestCase` for models, `ActionDispatch::IntegrationTest` for integration, `ActionCable::Channel::TestCase` for channels, `ActionMailer::TestCase` for mailers, `ActiveJob::TestCase` for jobs. You'll meet a real file from every one of these five directories before this module ends.",
          ],
        },
        {
          type: "code",
          title: "test/test_helper.rb",
          source: String.raw`ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "ostruct"      # stdlib OpenStruct, used to stub Stripe's response objects in tests
require "minitest/mock" # Object#stub, used to stub Stripe's class methods in tests

module ActiveSupport
  class TestCase
    include ActionMailer::TestHelper

    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...

    def auth_headers(user)
      { "Authorization" => "Bearer #{JsonWebToken.encode({ user_id: user.id })}" }
    end
  end
end`,
          caption: "The real, unedited file. Every test in every directory loads this once. Two lines matter most for this lesson: `parallelize(workers: :number_of_processors)` and `auth_headers` — you'll meet `auth_headers` properly in lesson 4.",
        },
        {
          type: "text",
          md: [
            "## `parallelize(workers: :number_of_processors)`",
            "This one line is why 66 tests finish in a couple of seconds instead of thirty: Rails splits the suite across multiple OS processes — one per CPU core by default — and runs them at the same time instead of one after another. Each worker gets its own copy of the test database, so parallel tests never step on each other's data. You don't write anything differently to get this; it's already configured, and it's exactly why the terminal output you're about to see says `Running 66 tests in parallel using N processes` instead of running them one by one.",
          ],
        },
        {
          type: "text",
          md: [
            "## Running tests: the whole suite, one file, or one line",
            "Three commands, three levels of precision, all from `apps/pawwalk-api`:",
            "```\nbin/rails test                              # everything — every directory, every file\nbin/rails test test/models/booking_test.rb  # one file\nbin/rails test test/models/booking_test.rb:12 # one test — the one containing line 12\n```",
            "That last form is the one you'll reach for constantly while writing a NEW test: no need to wait for the other 65 to run while you're iterating on one. Rails finds whichever `test \"...\" do ... end` block contains the line number you gave it and runs just that one.",
          ],
        },
        {
          type: "quiz",
          q: "You're iterating on a single new test inside `test/models/booking_test.rb`, around line 40, and don't want to wait for the other 65 tests to run every time. What command targets just that one test?",
          choices: [
            "`bin/rails test test/models/booking_test.rb:40`",
            "`bin/rails test --only 40`",
            "`bin/rails test test/models/booking_test.rb --line=40`",
            "There's no way to run a single test — it's always the whole file or nothing",
          ],
          answer: 0,
          explain: "A colon plus a line number after the file path runs whichever test block contains that line. `bin/rails test test/models/booking_test.rb:40` runs exactly one test, not the other 65 in that file or anywhere else.",
          nudge: "The lesson showed three levels of precision — the whole suite, one file, and one line. What punctuation separated the file path from the line number in that last example?",
        },
        {
          type: "exercise",
          title: "Name the five test directories",
          prompt: [
            "You're writing a new test for the `Payment` model's validations. Declare a local variable `test_file_path` and assign it the path where that test file belongs, as a string, matching the real tree: `\"test/models/payment_test.rb\"`.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`test_file_path = "test/models/payment_test.rb"`,
          checks: [
            { re: /test_file_path="test\/models\/payment_test\.rb"/, hint: "Assign the path as a string: `test_file_path = \"test/models/payment_test.rb\"`." },
          ],
          mustNot: [
            { re: /test\/integration\//, hint: "This is a model test — no HTTP involved — so it belongs in `test/models/`, not `test/integration/`." },
          ],
          success: "Every layer of the app has its own directory: models, integration, channels, mailers, jobs. The folder name tells you what's being tested before you even open the file.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "fixtures-your-test-world",
      title: "Fixtures: Your Test World",
      steps: [
        {
          type: "text",
          md: [
            "## Fixtures: a fresh, known world for every test",
            "Every test you've watched pass so far reads `users(:demo)`, `bookings(:upcoming)`, `walkers(:luna)` — plain-looking method calls that hand back real, saved ActiveRecord objects. Where do those rows come from? **Fixtures**: YAML files under `test/fixtures/`, one file per model, each entry a named row. `test_helper.rb`'s `fixtures :all` loads every one of them fresh before each test runs, so no test ever depends on data left behind by a previous test — every test starts from the exact same known world.",
          ],
        },
        {
          type: "code",
          title: "test/fixtures/users.yml",
          source: String.raw`# Read about fixtures at https://api.rubyonrails.org/classes/ActiveRecord/FixtureSet.html

demo:
  name: Demo User
  email: demo@pawwalk.dev
  password_digest: <%= BCrypt::Password.create("walkies123") %>

jane:
  name: Jane Booker
  email: jane@example.com
  password_digest: <%= BCrypt::Password.create("walkies123") %>`,
          caption: "The real file, unedited. Two named rows, `demo` and `jane`. `users(:demo)` in a test resolves to the User row built from this exact YAML block.",
        },
        {
          type: "text",
          md: [
            "## The bcrypt line — fixtures can run Ruby",
            "Look closely at `password_digest: <%= BCrypt::Password.create(\"walkies123\") %>`. Fixture YAML files are run through ERB before being parsed — that `<%= ... %>` is the same embedded-Ruby syntax you'd see in a Rails view template. `User` has `has_secure_password`, so it never stores a plain password, only a `password_digest`. The fixture can't just write `password_digest: walkies123` — that would store the WRONG thing, a plain string where a bcrypt hash belongs. `<%= BCrypt::Password.create(\"walkies123\") %>` runs the real hashing function at fixture-load time, so `users(:demo).authenticate(\"walkies123\")` in a test works exactly like it would against a real signed-up user.",
          ],
        },
        {
          type: "code",
          title: "test/fixtures/bookings.yml",
          source: String.raw`# Read about fixtures at https://api.rubyonrails.org/classes/ActiveRecord/FixtureSet.html

upcoming:
  user: demo
  walker: luna
  dog: mochi
  starts_at: <%= 1.day.from_now %>
  duration_min: 30
  price_cents: 2500
  status: confirmed

past:
  user: jane
  walker: sam
  dog: biscuit
  starts_at: <%= 2.days.ago %>
  duration_min: 60
  price_cents: 4400
  status: completed`,
          caption: "Two of the four real bookings fixtures (`pending_cancel` and `walking_now` also exist). `user: demo` and `walker: luna` are references BY NAME — Rails resolves them to the matching row's real id automatically.",
        },
        {
          type: "text",
          md: [
            "## Relative dates and references by name",
            "`starts_at: <%= 1.day.from_now %>` is ERB again — it runs `1.day.from_now` fresh every time the fixtures load, so `bookings(:upcoming)` is ALWAYS genuinely in the future, no matter when you run the suite. A hardcoded date like `starts_at: 2026-01-01` would eventually become a bug: the day that date is in the past, `Booking.upcoming`'s scope would silently stop including it, and a test that used to pass would start failing for a reason that has nothing to do with the code being tested.",
            "`user: demo` and `walker: luna` and `dog: mochi` are the second trick: instead of writing a numeric `user_id`, you reference the OTHER fixture by its name. Rails resolves `demo` to whatever id the `demo` row in `users.yml` actually gets assigned, so fixture files never hardcode ids that could silently drift.",
          ],
        },
        {
          type: "text",
          md: [
            "## Fixtures still obey your model's rules",
            "Fixtures are just rows — but they're rows that get validated the moment your code calls `.valid?` or `.save!` on them in a test, same as any other record. Notice `bookings.yml`'s `upcoming` entry: `user: demo`, `dog: mochi` — and `dogs.yml`'s `mochi` entry belongs to `demo` too. That's not an accident. `Booking`'s `dog_belongs_to_booker` validation from module 11 would reject a booking where the dog belongs to someone else, so a fixture author has to respect the same cross-model rule a real API client would hit. Fixtures describe a consistent world, not a pile of arbitrary rows.",
          ],
        },
        {
          type: "text",
          md: [
            "## Honest alternative: factory_bot",
            "Plenty of Rails teams reach for the `factory_bot` gem instead of plain YAML fixtures — factories build objects with Ruby code at test-run time (`create(:booking, status: :pending)`) rather than loading a fixed YAML row up front. Same job — a known, valid object to test against — different mechanism. `apps/pawwalk-api` uses YAML fixtures because Rails ships them for free with zero extra gems; you'll see `factory_bot` in plenty of real-world codebases and should recognize it as solving the exact same problem.",
          ],
        },
        {
          type: "quiz",
          q: "Why does `bookings.yml`'s `upcoming` fixture write `starts_at: <%= 1.day.from_now %>` instead of a fixed date like `starts_at: 2026-08-01`?",
          choices: [
            "So the booking is always genuinely in the future no matter when the suite runs — a hardcoded date would eventually become the past and silently break `Booking.upcoming`",
            "Because YAML doesn't support writing dates directly",
            "It's purely stylistic — `1.day.from_now` and a fixed date behave identically in tests",
            "Because fixture files are re-read on every request, so the date must be recalculated constantly",
          ],
          answer: 0,
          explain: "`<%= 1.day.from_now %>` is ERB, evaluated fresh every time fixtures load — so `bookings(:upcoming).starts_at` is always tomorrow relative to whenever the test suite actually runs, keeping `Booking.upcoming`'s scope test meaningful forever instead of only until some fixed date passes.",
          nudge: "What happens to a test asserting a booking is 'upcoming' the day AFTER a hardcoded `starts_at: 2026-08-01` becomes yesterday?",
        },
        {
          type: "exercise",
          title: "Write a walker fixture entry",
          prompt: [
            "Add a new fixture named `priya` to `walkers.yml`: `name: Priya Shah`, `city: Denver`, `price_per_30_min_cents: 2800`. (This is YAML, not Ruby — indentation matters in a real file even though these checks can't verify it. Match the two-space indentation of the existing `luna`/`sam` entries.)",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`priya:
  name: Priya Shah
  city: Denver
  price_per_30_min_cents: 2800`,
          checks: [
            { re: /priya:/, hint: "Name the fixture `priya:` — a top-level key, same shape as `luna:` and `sam:`." },
            { re: /name:Priya Shah/, hint: "Set `name: Priya Shah` under the fixture." },
            { re: /price_per_30_min_cents:2800/, hint: "Set `price_per_30_min_cents: 2800`." },
          ],
          success: "That's a real fixture entry — `walkers(:priya)` would now resolve to this exact row in any test that needs a third walker.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "model-tests",
      title: "Model Tests",
      steps: [
        {
          type: "text",
          md: [
            "## Testing DATA, not HTTP",
            "A model test never touches a route, a controller, or an HTTP status code — it talks directly to an ActiveRecord class, the same way `bin/rails console` does. That makes model tests the fastest, most focused layer: no request/response cycle, just \"given this object, is `.valid?` true or false, and what does `.errors` say?\"",
          ],
        },
        {
          type: "code",
          title: "test/models/user_test.rb",
          source: String.raw`require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "normalizes email to a stripped, downcased value" do
    user = User.new(name: "Alex", email: "  Alex@Example.com  ", password: "walkies123")

    assert user.valid?
    assert_equal "alex@example.com", user.email
  end

  test "is invalid without a unique email" do
    dupe = User.new(name: "Copycat", email: users(:demo).email, password: "walkies123")

    assert_not dupe.valid?
    assert_includes dupe.errors[:email], "has already been taken"
  end
end`,
          caption: "Two of the four real tests in this file. Notice the rhythm in each: build an object (setup), call `.valid?` (exercise), then `assert`/`assert_not`/`assert_includes` on the result (assert).",
        },
        {
          type: "text",
          md: [
            "## setup → exercise → assert, one behavior per test",
            "Both tests above follow the same three-beat rhythm, and almost every test in this suite does too: **setup** (build the object or grab a fixture), **exercise** (call the one method you're testing — here, `.valid?`), **assert** (check the result matches what you expect). Each test also checks exactly ONE behavior — email normalization in the first, uniqueness in the second — not both crammed into one giant test. When a test fails, its NAME already tells you what broke, before you've read a single line of the failure output.",
          ],
        },
        {
          type: "text",
          md: [
            "## `assert` / `refute` / `assert_not` / `assert_equal` / `assert_raises`",
            "Minitest's core assertions, all plain method calls:",
            "- `assert user.valid?` — passes if the argument is truthy.\n- `refute user.valid?` — Minitest's name for \"assert this is falsy.\" Rails adds `assert_not` as a friendlier alias for the exact same thing — you'll see `assert_not` far more often in this codebase.\n- `assert_equal expected, actual` — passes if `expected == actual`. Argument order matters for readable failure messages: expected first, actual second.\n- `assert_includes collection, item` — passes if `item` is `.include?`-able in `collection`; the codebase uses this constantly for checking `errors[:field]` arrays.\n- `assert_raises(SomeError) { ... }` — passes if the block raises exactly that error class; you'd use this around a `save!` call you expect to blow up with `ActiveRecord::RecordInvalid`.",
          ],
        },
        {
          type: "code",
          title: "test/models/booking_test.rb",
          source: String.raw`require "test_helper"

class BookingTest < ActiveSupport::TestCase
  test "status enum transitions between pending, confirmed, and completed" do
    booking = bookings(:upcoming)

    assert booking.confirmed?

    booking.pending!
    assert booking.pending?

    booking.completed!
    assert booking.completed?
  end

  test "is invalid when the dog does not belong to the booking's user" do
    booking = Booking.new(
      user: users(:demo),
      walker: walkers(:luna),
      dog: dogs(:biscuit), # belongs to jane, not demo
      starts_at: 1.day.from_now,
      duration_min: 30,
      price_cents: 2500
    )

    assert_not booking.valid?
    assert_includes booking.errors[:dog], "must belong to the user making the booking"
  end

  test "upcoming scope includes future, non-cancelled bookings only" do
    assert_includes Booking.upcoming, bookings(:upcoming)
    assert_not_includes Booking.upcoming, bookings(:past)
  end
end`,
          caption: "Three of the five real tests in this file. The second test is module 11's `dog_belongs_to_booker` validation, proven directly — `dogs(:biscuit)` belongs to Jane, `users(:demo)` is Demo, and the mismatch is exactly what `errors[:dog]` reports.",
        },
        {
          type: "text",
          md: [
            "## Reading the enum test closely",
            "`booking.pending!` (the bang form `enum :status` generates, from module 11) sets the status AND saves immediately — no separate `.save!` call needed. The test then asserts `booking.pending?` right after, proving the free query method reflects the change. Three transitions, three assertions, one test — because it's really ONE behavior: \"the enum's bang setters and query methods stay in sync with each other,\" checked at each step along the way.",
          ],
        },
        {
          type: "quiz",
          q: "`test \"is invalid when the dog does not belong to the booking's user\"` builds a `Booking` with `dog: dogs(:biscuit)` but `user: users(:demo)`. Why does this test deliberately mismatch them instead of using a consistent dog/user pair?",
          choices: [
            "Because the whole point of the test is to prove `dog_belongs_to_booker` catches exactly this mismatch — a valid pairing would never exercise that validation at all",
            "It's a mistake in the fixture data that happens to still pass",
            "Because `dogs(:biscuit)` doesn't have a real owner in the fixtures",
            "Because Minitest requires every model test to use mismatched associations",
          ],
          answer: 0,
          explain: "A test proving a validation REJECTS bad data has to actually construct bad data. `dogs(:biscuit)` belongs to Jane in the fixtures; pairing it with `users(:demo)` deliberately creates the exact mismatch `dog_belongs_to_booker` exists to catch — if the test used a consistent pair instead, `.valid?` would just return true and the validation would never even run.",
          nudge: "If you want to prove a guard dog barks at strangers, do you introduce it to a stranger or to someone it already knows?",
        },
        {
          type: "exercise",
          title: "Test Walker#price_label",
          prompt: [
            "Write a model test for `Walker#price_label` (from module 09): using `walkers(:luna)` (whose `price_per_30_min_cents` is `2500`), assert that `.price_label` equals the string `\"$25 / 30 min\"`.",
          ],
          starter: String.raw`require "test_helper"

class WalkerTest < ActiveSupport::TestCase
  test "price_label formats cents as dollars per 30 minutes" do
    # your code here
  end
end`,
          solution: String.raw`require "test_helper"

class WalkerTest < ActiveSupport::TestCase
  test "price_label formats cents as dollars per 30 minutes" do
    assert_equal "$25 / 30 min", walkers(:luna).price_label
  end
end`,
          checks: [
            { re: /assert_equal"\$25\/30 min",walkers\(:luna\)\.price_label/, hint: "Call `assert_equal \"$25 / 30 min\", walkers(:luna).price_label` — expected value first, actual second." },
          ],
          mustNot: [
            { re: /assert walkers\(:luna\)\.price_label==/, hint: "Use `assert_equal expected, actual` here, not a bare `assert` with `==` — it gives a clearer failure message." },
          ],
          success: "That's a real model test — one fixture, one method call, one assertion, proving the exact `$25 / 30 min` string module 09's `price_label` promised to produce.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "integration-tests-test-the-api-like-a-client",
      title: "Integration Tests: Test the API like a Client",
      steps: [
        {
          type: "text",
          md: [
            "## A different layer, a different question",
            "Model tests ask \"is this data valid?\" **Integration tests** ask a bigger question: \"if a real client sent this exact HTTP request, what comes back?\" They live in `test/integration/`, extend `ActionDispatch::IntegrationTest`, and drive the app through actual routes — the same `post`/`get`/`patch` your curl commands have been hitting since module 08, just called from Ruby instead of a terminal.",
          ],
        },
        {
          type: "code",
          title: "test/integration/authentication_test.rb",
          source: String.raw`require "test_helper"

class AuthenticationTest < ActionDispatch::IntegrationTest
  test "login with correct credentials returns a token" do
    post "/login", params: { email: users(:demo).email, password: "walkies123" }

    assert_response :success
    body = JSON.parse(response.body)

    assert_equal users(:demo).id, body["user"]["id"]
    assert JsonWebToken.decode(body["token"])
  end

  test "login with the wrong password is rejected" do
    post "/login", params: { email: users(:demo).email, password: "wrong-password" }

    assert_response :unauthorized
    assert_equal "invalid email or password", JSON.parse(response.body)["error"]
  end
end`,
          caption: "Two of the eight real tests in this file. `post \"/login\", params: { ... }` IS the request — no mocking, no fake router, the real Rails routing and controller code run exactly as they would for a live client.",
        },
        {
          type: "text",
          md: [
            "## `post`/`get`/`patch` and `assert_response`",
            "`get path`, `post path, params: {...}`, `patch path, params: {...}` fire real requests at the app under test. `assert_response :success` (2xx), `:created` (201), `:unauthorized` (401), `:not_found` (404), `:unprocessable_content` (422) check the status code the controller actually returned — the same symbols you've been reading in `render json: ..., status: :created` since module 08, now on the asserting side instead of the rendering side. `response.parsed_body` (or `JSON.parse(response.body)`, same result) gives you the response as a Ruby Hash so you can assert on individual fields instead of comparing raw JSON text.",
          ],
        },
        {
          type: "code",
          title: "test/integration/bookings_test.rb — auth_headers in use",
          source: String.raw`class BookingsTest < ActionDispatch::IntegrationTest
  test "index requires auth" do
    get "/bookings"

    assert_response :unauthorized
  end

  test "create computes price server-side from the walker's rate" do
    post "/bookings",
      params: {
        walker_id: walkers(:luna).id,
        dog_id: dogs(:mochi).id,
        starts_at: 1.day.from_now.change(hour: 10, min: 0),
        duration_min: 60
      },
      headers: auth_headers(users(:demo))

    assert_response :created
    body = JSON.parse(response.body)

    assert_equal 5000, body["booking"]["price_cents"] # 2500 * (60 / 30)
    assert_equal "pending", body["booking"]["status"]
  end
end`,
          caption: "Two of the eight real tests in this file (the 1st and 4th — six others sit in between and after, testing filtering, ownership, and cancellation). `headers: auth_headers(users(:demo))` is how every authenticated integration test proves it's a logged-in request — no auth header means no `current_user`, exactly like a real unauthenticated client.",
        },
        {
          type: "text",
          md: [
            "## `auth_headers` — quoted straight from `test_helper.rb`",
            "Here's the real helper, unedited, from the file you read in lesson 1:",
            "```\ndef auth_headers(user)\n  { \"Authorization\" => \"Bearer #{JsonWebToken.encode({ user_id: user.id })}\" }\nend\n```",
            "This isn't a fake auth bypass for tests — it mints a REAL JWT, using the exact same `JsonWebToken.encode` module 10's `AuthenticationController#login` calls on a real login. `auth_headers(users(:demo))` returns a real `Authorization: Bearer <token>` header, and the `Authentication` concern decodes it exactly as it would for any live request. The only thing `auth_headers` skips is typing out a `post \"/login\"` call first to get a token — it hands you a valid one directly, because logging in isn't the behavior THIS test is checking.",
          ],
        },
        {
          type: "text",
          md: [
            "## The philosophy: unhappy paths are where security lives",
            "Count the tests across this suite's integration files and something jumps out: **21 of the 40 integration tests** — just over half — assert a REJECTION: a 401, a 404, or a 422. `index requires auth`. `create is rejected when the dog belongs to another user`. `show for another user's booking returns 404`. `cancel a completed booking is rejected`. `pay a non-pending booking is rejected`. Every one of those is proving the app correctly REFUSES to do something, not that it successfully does something.",
            "That ratio isn't an accident, and it isn't padding. A happy-path test proves a feature works when everything goes right — useful, but the easy half. An unhappy-path test proves the app holds the line when a request is unauthenticated, malformed, or trying to touch data it doesn't own. Security bugs live almost entirely in that second category: not \"does login work\" but \"does `/me` correctly reject a garbage token\", not \"can I book a walk\" but \"can I book a walk using a STRANGER'S dog.\" A suite that only tests happy paths would pass right up until the day an attacker tries exactly the thing nobody wrote a test for.",
          ],
        },
        {
          type: "quiz",
          q: "Just over half of this suite's integration tests (21 of 40) assert a 401, 404, or 422 rather than a success status. Why does that ratio matter?",
          choices: [
            "Because unhappy-path tests are where security actually gets verified — proving the app correctly REFUSES bad requests (wrong auth, wrong owner, wrong state) catches the bugs that matter most, not just proving features work when everything goes right",
            "It's a coincidence with no real significance",
            "Because Rails requires at least half of all tests to check for failure responses",
            "Because happy-path tests are harder to write, so the suite has fewer of them",
            ],
          answer: 0,
          explain: "Happy-path tests prove a feature works; unhappy-path tests prove the app holds its boundaries when something is wrong — unauthenticated, malformed, or belonging to someone else. That second category is exactly where authorization bugs and security holes tend to hide, so a suite this heavy on rejection tests is a suite that takes its own boundaries seriously.",
          nudge: "Which kind of bug is worse to ship: a feature that doesn't work when it should, or one that works when it SHOULDN'T?",
        },
        {
          type: "exercise",
          title: "An integration test skeleton",
          prompt: [
            "Write a test named `\"show requires auth\"` inside `WalkersTest`: `get \"/walkers/1\"` with no headers, then assert the response is `:unauthorized`.",
          ],
          starter: String.raw`class WalkersTest < ActionDispatch::IntegrationTest
  # your code here
end`,
          solution: String.raw`class WalkersTest < ActionDispatch::IntegrationTest
  test "show requires auth" do
    get "/walkers/1"

    assert_response :unauthorized
  end
end`,
          checks: [
            { re: /test"show requires auth"do/, hint: "Name the test exactly: `test \"show requires auth\" do`." },
            { re: /get"\/walkers\/1"/, hint: "Fire the request with no headers: `get \"/walkers/1\"`." },
            { re: /assert_response:unauthorized/, hint: "Assert the rejection: `assert_response :unauthorized`." },
          ],
          mustNot: [
            { re: /headers:auth_headers/, hint: "This test proves the UNAUTHENTICATED case — leave off `headers: auth_headers(...)` entirely." },
          ],
          success: "Request, then two asserts — that's the whole shape of an integration test. This one happens to be one of the unhappy-path tests the previous step just made the case for.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "stubs-jobs-mailers-and-the-whole-suite",
      title: "Stubs, Jobs, Mailers & the Whole Suite",
      label: "Over to the terminal",
      steps: [
        {
          type: "text",
          md: [
            "## Faking the boundary, never the code under test",
            "Module 12 already showed you this trick in the payments story — here it is again, because it's the single most important idea for testing anything that talks to the outside world. `apps/pawwalk-api` has no real Stripe account configured, and this course never asked you to make one. So how does `payments_test.rb` prove `PaymentsController#create` calls Stripe correctly, with zero real network calls?",
          ],
        },
        {
          type: "code",
          title: "test/integration/payments_test.rb",
          source: String.raw`test "pay a pending booking creates a Stripe PaymentIntent and a Payment row" do
  booking = bookings(:pending_cancel)
  intent = OpenStruct.new(id: "pi_123", client_secret: "pi_123_secret_abc")

  Stripe::PaymentIntent.stub :create, intent do
    post "/bookings/#{booking.id}/pay", headers: auth_headers(users(:demo))
  end

  assert_response :created
  body = JSON.parse(response.body)

  assert_equal "processing", body["payment"]["status"]
  assert_equal booking.price_cents, body["payment"]["amount_cents"]
  assert_equal "pi_123_secret_abc", body["client_secret"]
end`,
          caption: "The real test, unedited. `Stripe::PaymentIntent.stub :create, intent do ... end` swaps out ONE method for the duration of the block — everything else in `PaymentsController#create` runs for real.",
        },
        {
          type: "text",
          md: [
            "`SomeClass.stub(:method_name, return_value) { ... }` is Minitest's built-in stubbing helper — no extra gem, no `webmock`, no cassette recordings. For the duration of the block only, calling `Stripe::PaymentIntent.create(...)` returns `intent` instead of making a real HTTPS call, then the real method is automatically restored afterward. The `post \"/bookings/.../pay\"` line inside the block still runs the REAL controller action — every guard, every `render`, every line of `PaymentsController#create` executes exactly as it would in production. Only the one line that would otherwise hit Stripe's network gets swapped. **Fake the boundary you don't control. Never fake the code you're actually testing** — a stub replacing `PaymentsController#create` itself would prove nothing.",
            "Quick recap from module 12, since it's the same story: Minitest 6 split `Object#stub` out into a separate `minitest-mock` gem, so the Gemfile pins `gem \"minitest\", \"~> 5.25\"` in `group :test` — a real version constraint keeping every `.stub` call in this suite working, not decoration.",
            "## Jobs: `assert_enqueued_with` and `perform_enqueued_jobs`",
            "`ActiveJob::TestCase` gives you assertions for the async layer module 12 introduced. `assert_enqueued_with(job: SomeJob, args: [...])` checks that a job was QUEUED without actually running it — useful inside a controller/webhook test where you only care that the right job got scheduled. `perform_enqueued_jobs { ... }` does the opposite: it runs whatever jobs get enqueued inside the block, for real, right there in the test.",
          ],
        },
        {
          type: "code",
          title: "test/jobs/booking_confirmation_job_test.rb",
          source: String.raw`require "test_helper"

class BookingConfirmationJobTest < ActiveJob::TestCase
  test "performing the job delivers the confirmation email" do
    booking = bookings(:upcoming)

    perform_enqueued_jobs do
      BookingConfirmationJob.perform_later(booking.id)
    end

    assert_emails 1
  end
end`,
          caption: "The real, complete file. `perform_later` normally just QUEUES the job — wrapping it in `perform_enqueued_jobs` forces it to actually run inside the test, so `assert_emails 1` can prove a real email got delivered as a side effect. `ActionMailer::TestCase` (up next) gives you the mailer-side equivalent: build a mail object directly and assert on its shape — subject, recipients, body — without sending anything over real SMTP.",
        },
        {
          type: "code",
          title: "test/mailers/booking_mailer_test.rb",
          source: String.raw`require "test_helper"

class BookingMailerTest < ActionMailer::TestCase
  test "confirmation" do
    booking = bookings(:upcoming)
    mail = BookingMailer.confirmation(booking)

    assert_equal "Your PawWalk booking is confirmed \u{1F43E}", mail.subject
    assert_equal [ booking.user.email ], mail.to
    assert_equal [ "bookings@pawwalk.dev" ], mail.from
    assert_match booking.walker.name, mail.body.encoded
    assert_match booking.dog.name, mail.body.encoded
  end
end`,
          caption: "The real, complete file. `BookingMailer.confirmation(booking)` builds the mail object directly — no delivery needed to check its subject, recipients, sender, and that the body actually mentions the right walker and dog by name. Module 13's `WalkChannel` gets the same treatment next, one layer down: `stub_connection current_user: users(:demo)` fakes WHO is connecting, `subscribe(id: ...)` drives the real subscription logic, and `assert subscription.confirmed?` / `.rejected?` prove an owner gets in and a stranger gets bounced — the companion `assert_broadcast_on(walk_session, payload) { ... }` is the ActionCable equivalent of `assert_emails`, proving a real message got pushed to a stream.",
        },
        {
          type: "code",
          title: "test/channels/walk_channel_test.rb",
          source: String.raw`require "test_helper"

class WalkChannelTest < ActionCable::Channel::TestCase
  test "the booking owner can subscribe to their walk session" do
    stub_connection current_user: users(:demo)

    subscribe(id: walk_sessions(:in_progress).id)

    assert subscription.confirmed?
    assert_has_stream_for walk_sessions(:in_progress)
  end

  test "a stranger is rejected" do
    stub_connection current_user: users(:jane)

    subscribe(id: walk_sessions(:in_progress).id)

    assert subscription.rejected?
  end
end`,
          caption: "The real, complete file — both tests. Same owner-scoping philosophy as `bookings_controller.rb`'s `show`, proven at the WebSocket layer instead of plain HTTP.",
        },
        {
          type: "text",
          md: [
            "## rubocop — the loop's second gate",
            "`bin/rails test` is the correctness gate. `bin/rubocop` is the STYLE gate — and PawWalk's `.rubocop.yml` is one line: `inherit_gem: { rubocop-rails-omakase: rubocop.yml }`. \"Omakase\" is Rails creator DHH's own opinionated style config, extracted into a gem so every Rails app can just inherit it wholesale instead of relitigating tabs-vs-spaces and quote styles from scratch. Zero config debates, because there's almost no config TO debate — you take the house style or you don't use the gem.",
          ],
        },
        {
          type: "xcode",
          title: "Run the whole loop for real",
          label: "Over to the terminal",
          intro: [
            "This is the capstone checklist for the whole module — and the whole course's testing story. Run both gates against the real app:",
          ],
          items: [
            "`cd apps/pawwalk-api && bin/rails test` — expect `66 runs, 171 assertions, 0 failures, 0 errors, 0 skips`, printed after a line like `Running 66 tests in parallel using N processes`.",
            "`bin/rails test test/models/booking_test.rb:12` — targets just the enum-transition test by line number; expect `1 runs, 3 assertions, 0 failures`.",
            "`bin/rubocop` — expect `70 files inspected, no offenses detected`.",
            "Both commands green is the same signal this course's JS apps get from `pnpm typecheck && pnpm lint && pnpm test` — a different language, the identical idea: the loop passing means the change is safe.",
          ],
        },
        {
          type: "text",
          md: [
            "## What a real run just showed",
            "That's a real, verified transcript against the actual app: 66 tests across five directories — models, integration, channels, mailers, jobs — 171 assertions, 0 failures, finishing in a couple of seconds thanks to `parallelize`. And `bin/rubocop` inspecting all 70 Ruby files in the app with zero offenses. Every idea this module covered — fixtures, the setup/exercise/assert rhythm, `auth_headers` minting real JWTs, stubbing Stripe at the boundary, jobs and mailers and channels — is proven, right now, by the exact suite you just ran.",
          ],
        },
        {
          type: "quiz",
          q: "Capstone: `payments_test.rb` stubs `Stripe::PaymentIntent.stub :create, intent do ... end` around a `post \"/bookings/:id/pay\"` call. Which line of `PaymentsController#create` does the stub actually replace?",
          choices: [
            "Only the line that calls `Stripe::PaymentIntent.create` — every other line of the controller (guards, building the Payment row, rendering the response) runs as real, unmodified code",
            "The entire `create` action — the stub replaces the whole controller method with a fake one",
            "Nothing in the controller — the stub only affects code inside the test file itself",
            "Every Stripe-related class in the whole app, for the rest of the test run",
          ],
          answer: 0,
          explain: "A Minitest stub replaces exactly the one method named — `Stripe::PaymentIntent.create` — only for the duration of the block, and only that one call site's return value changes. Everything else in `PaymentsController#create`, from the pending-status guard to `render json: ...`, is the real, unedited code path being exercised by the real `post` request.",
          nudge: "The lesson's rule was 'fake the boundary, never the code under test.' Which single method call is the actual boundary to Stripe's network here?",
        },
      ],
    },
  ],
});
