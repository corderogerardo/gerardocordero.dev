window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "pawwalk-kickoff",
  title: "PawWalk Kickoff",
  emoji: "🐾",
  lang: "ruby",
  lessons: [
    {
      id: "the-real-thing",
      title: "The Real Thing",
      steps: [
        {
          type: "text",
          md: [
            "## dogpark was practice. This is the app.",
            "Every model, controller, and JSON response from modules 00–08 lived in a throwaway app you'll never touch again. Starting now, you're rebuilding `apps/pawwalk-api` — a real Rails 8.1 API-only backend that already sits FINISHED in your repo. It's the answer key. Every remaining module in this course has you read a real file, then retype the heart of it yourself.",
            "There's no suspense about whether it works — you already curled it in module 08's capstone spirit, and you're about to curl the real thing in a minute. The suspense is whether YOU can write it.",
          ],
        },
        {
          type: "text",
          md: [
            "## The whole API surface, one table",
            "Here's every endpoint PawWalk ships, and which module builds it. Nothing here is a guess — this is `apps/pawwalk-api/config/routes.rb`, read top to bottom:",
            "| Endpoint | What it does | Built in |\n|---|---|---|\n| `POST /signup` | create an account | module 10 |\n| `POST /login` | exchange credentials for a session | module 10 |\n| `GET /me` | who am I | module 10 |\n| `GET /walkers`, `GET /walkers/:id` | browse walkers | **module 09 (now)** |\n| `GET /bookings`, `POST /bookings` | list / create a booking | module 11 |\n| `GET /bookings/:id` | one booking | module 11 |\n| `PATCH /bookings/:id/cancel` | cancel a booking | module 11 |\n| `POST /bookings/:id/pay` | pay for a booking | module 12 |\n| `POST /stripe/webhooks` | Stripe tells us a payment settled | module 12 |\n| live tracking channel | GPS pings while a walk is in progress | module 13 |",
            "Notice something already: there's no `Api::` module anywhere in that list. dogpark namespaced its JSON routes under `/api/...` because it ALSO served HTML from the same app. PawWalk never serves HTML — it's `--api` mode from birth — so there's nothing to disambiguate from. `GET /walkers` just IS the API.",
          ],
        },
        {
          type: "text",
          md: [
            "## One line, an entire app: `rails new pawwalk-api --api`",
            "Module 08 covered what `--api` mode strips: no `app/views`, `ActionController::API` instead of `::Base`, no cookies/sessions/flash/CSRF, a slimmer middleware stack. `rails new pawwalk-api --api` is the one command that bakes all of that in from the very first commit — nobody had to remember to remove view-layer cruft later, because it was never generated.",
          ],
        },
        {
          type: "code",
          title: "Terminal — a repo tour",
          source: String.raw`$ cd apps/pawwalk-api
$ ls app
controllers  jobs  mailers  models

$ ls app/models
application_record.rb  booking.rb  dog.rb  location_ping.rb
user.rb  walk_session.rb  walker.rb

$ ls app/controllers
application_controller.rb  walkers_controller.rb

$ ls db/migrate
20260703150107_create_users.rb
20260703150126_create_walkers.rb
20260703150133_create_dogs.rb
20260703150140_create_bookings.rb
20260703150146_create_walk_sessions.rb
20260703150153_create_location_pings.rb
20260703160738_create_payments.rb`,
          caption: "No `app/views` directory at all — exactly what `--api` mode promises. Six models, six migrations (a seventh, `payments`, arrived after the fact) — you'll meet every one of them by module 12.",
        },
        {
          type: "text",
          md: [
            "## Boot it for real",
            "Enough reading — run the actual repo app.",
          ],
        },
        {
          type: "xcode",
          title: "Over to the terminal",
          label: "Over to the terminal",
          intro: [
            "From the repo root:",
          ],
          items: [
            "`cd apps/pawwalk-api`",
            "`bin/rails db:prepare` — creates the database and loads the schema (idempotent: safe to run again)",
            "`bin/rails db:seed` — loads four walkers and a demo user + dog + booking (also idempotent, via `find_or_create_by!`)",
            "`bin/rails s` — boots the server on port 3000",
            "In a second terminal tab: `curl localhost:3000/up` — Rails' built-in health endpoint",
            "`curl localhost:3000/walkers` — the endpoint you're about to rebuild",
          ],
        },
        {
          type: "code",
          title: "Terminal — real output",
          source: String.raw`$ curl -i localhost:3000/up
HTTP/1.1 200 OK
content-type: text/html; charset=utf-8
<!DOCTYPE html><html><body style="background-color: green"></body></html>

$ curl localhost:3000/walkers
{"walkers":[{"id":1,"name":"Luna Martinez","bio":null,"city":"Austin","rating":"5.0","price_per_30_min_cents":2500,"price_label":"$25 / 30 min"},{"id":2,"name":"Sam Okafor","bio":null,"city":"Portland","rating":"5.0","price_per_30_min_cents":2200,"price_label":"$22 / 30 min"},{"id":3,"name":"Priya Shah","bio":null,"city":"Chicago","rating":"5.0","price_per_30_min_cents":2800,"price_label":"$28 / 30 min"},{"id":4,"name":"Jonah Lee","bio":null,"city":"Denver","rating":"5.0","price_per_30_min_cents":2000,"price_label":"$20 / 30 min"}]}`,
          caption: "Real transcript from the real repo app on a spare port. `/up` is Rails' zero-config health check — green HTML, 200, meant for load balancers, not humans. `/walkers` is hand-shaped JSON, four seeded walkers, ordered by rating.",
        },
        {
          type: "quiz",
          q: "dogpark routed its JSON endpoints under `/api/walkers`, inside an `Api::` module. PawWalk's real `config/routes.rb` just has `resources :walkers, only: %i[index show]` at the top level, no namespace. Why the difference?",
          choices: [
            "dogpark also served HTML from the same app, so `/api/...` disambiguated JSON routes from page routes — PawWalk never serves HTML at all, so there's nothing to disambiguate from",
            "PawWalk forgot to add the namespace and it's a bug that gets fixed later",
            "`Api::` namespacing only works with `ActionController::Base`, not `ActionController::API`",
            "Namespacing is required only once a project has more than 10 routes",
          ],
          answer: 0,
          explain: "A namespace like `/api/...` exists to separate one kind of route from another kind living in the same app. PawWalk is `--api` mode from birth — every route is already a JSON route — so the disambiguation dogpark needed simply doesn't apply.",
          nudge: "What was `/api/...` FOR in dogpark? Does PawWalk have the other kind of route it was distinguishing itself from?",
        },
      ],
    },
    {
      id: "the-schema",
      title: "The Schema",
      steps: [
        {
          type: "text",
          md: [
            "## Six tables, in plain words",
            "`db/schema.rb` is auto-generated — you never hand-edit it, migrations produce it — but it's the fastest way to see the whole shape of the app at once. Six tables (a seventh, `payments`, shows up in module 12):",
            "- **`users`** — an account: `name`, `email`, `password_digest` (module 10 explains that column).\n- **`walkers`** — a dog walker for hire: `name`, `city`, `price_per_30_min_cents`, `rating`. Nothing links a walker to a user yet — walkers aren't users in this app, just listings.\n- **`dogs`** — belongs to a `user`: `name`, `breed`, `size`.\n- **`bookings`** — the hub. It references `user`, `walker`, AND `dog` all at once: a user books a specific dog with a specific walker.\n- **`walk_sessions`** — one per booking (`has_one`), tracks `started_at`/`ended_at` for the walk actually happening.\n- **`location_pings`** — many per walk_session, a GPS fix at a moment in time (`lat`, `lng`, `recorded_at`).",
            "In one sentence: **users → dogs**, and **users + walkers + dogs → bookings → walk_sessions → location_pings**. Everything downstream of a booking exists because that booking exists.",
          ],
        },
        {
          type: "text",
          md: [
            "## Why money is `price_cents`, an integer — never a float",
            "You've heard this since module 01, but here's where it stops being theoretical: `bookings.price_cents` is `t.integer`, not `t.float` or `t.decimal`. Floats can't represent most decimal fractions exactly in binary — `0.1 + 0.2` famously isn't `0.3` in almost every language, Ruby included. Store money as the smallest indivisible unit (cents) as a plain integer, and every arithmetic operation is exact. `$25.00` is stored as `2500`, and `walker.price_label` (module 07, still true today) turns it back into `\"$25 / 30 min\"` only at the moment a human needs to read it.",
          ],
        },
        {
          type: "text",
          md: [
            "## Why `status` is a STRING, not an integer",
            "`bookings.status` is `t.string, default: \"pending\"`. Older Rails apps (and plenty of other frameworks) store an enum-like column as an integer — `0` for pending, `1` for confirmed — because integers are marginally smaller on disk. PawWalk deliberately doesn't do that: run `SELECT status FROM bookings` in any database tool and you see `\"confirmed\"`, not a bare `2` you'd have to cross-reference against application code to decode. A readable database beats a few bytes saved, every time you're debugging at 2am with nothing but a SQL client.",
          ],
        },
        {
          type: "code",
          title: "db/migrate/…_create_users.rb",
          source: String.raw`class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :name
      t.string :email, null: false
      t.string :password_digest

      t.timestamps
    end
    add_index :users, :email, unique: true
  end
end`,
          caption: "The real migration, verbatim. `password_digest` — never a plain `password` column — is `has_secure_password`'s doing; module 10 goes deep. `add_index ... unique: true` means the database itself refuses two accounts with the same email, a stronger guarantee than any Ruby-level check alone.",
        },
        {
          type: "code",
          title: "db/migrate/…_create_bookings.rb",
          source: String.raw`class CreateBookings < ActiveRecord::Migration[8.1]
  def change
    create_table :bookings do |t|
      t.references :user, null: false, foreign_key: true
      t.references :walker, null: false, foreign_key: true
      t.references :dog, null: false, foreign_key: true
      t.datetime :starts_at, null: false
      t.integer :duration_min, default: 30
      t.integer :price_cents, null: false
      t.string :status, default: "pending", index: true

      t.timestamps
    end
  end
end`,
          caption: "Three `t.references` in one table — that's the hub shape from the ER description above, made concrete. `foreign_key: true` on each one means the database itself refuses a booking pointing at a user, walker, or dog id that doesn't exist. `index: true` on `status` because you'll filter bookings by status constantly starting module 11.",
        },
        {
          type: "quiz",
          q: "`bookings.status` is `t.string, default: \"pending\"` — a real column holding `\"pending\"`, `\"confirmed\"`, etc. as text. Why not `t.integer` with `0` for pending, `1` for confirmed, and so on?",
          choices: [
            "A string is readable directly in the database — `SELECT status FROM bookings` shows `\"confirmed\"`, not a bare integer you'd have to decode against application code",
            "Rails doesn't support integer-backed enums at all",
            "Strings are always faster to query than integers",
            "It's required because `duration_min` is also stored as an integer",
          ],
          answer: 0,
          explain: "The tradeoff is readability versus a few bytes of disk space. PawWalk picks readability: any database tool shows you the actual status word, no lookup table required, no risk of misremembering which integer means what.",
          nudge: "Picture debugging with nothing but a SQL client at 2am. Would you rather see `status = 2` or `status = \"confirmed\"`?",
        },
        {
          type: "exercise",
          title: "Retype the bookings migration's core",
          prompt: [
            "Inside `create_table :bookings do |t|`, write the three `t.references` lines for `user`, `walker`, and `dog` — each `null: false, foreign_key: true` — then `t.string :status, default: \"pending\", index: true`.",
          ],
          starter: String.raw`create_table :bookings do |t|
  # your code here
end`,
          solution: String.raw`create_table :bookings do |t|
  t.references :user, null: false, foreign_key: true
  t.references :walker, null: false, foreign_key: true
  t.references :dog, null: false, foreign_key: true
  t.string :status, default: "pending", index: true
end`,
          checks: [
            { re: /t\.references:user,null:false,foreign_key:true/, hint: "First reference: `t.references :user, null: false, foreign_key: true`." },
            { re: /t\.references:walker,null:false,foreign_key:true/, hint: "Second reference: `t.references :walker, null: false, foreign_key: true`." },
            { re: /t\.references:dog,null:false,foreign_key:true/, hint: "Third reference: `t.references :dog, null: false, foreign_key: true`." },
            { re: /t\.string:status,default:"pending",index:true/, hint: "Status column: `t.string :status, default: \"pending\", index: true`." },
          ],
          mustNot: [
            { re: /t\.integer:status/, hint: "Status is a string in this schema, never an integer — readability over a few saved bytes." },
          ],
          success: "That's the real hub table, field for field — three references in, and every downstream table (walk_sessions, location_pings) exists only because a booking like this one does.",
        },
      ],
    },
    {
      id: "models-user-walker-dog",
      title: "Models: User, Walker, Dog",
      steps: [
        {
          type: "text",
          md: [
            "## The real `user.rb`",
            "Three ideas packed into thirteen lines: `has_secure_password` (a one-liner teaser — module 10 goes deep on what it actually does with that `password_digest` column), `normalizes :email`, and two `validates` calls.",
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
          caption: "`normalizes :email, with: ->(email) { email.strip.downcase }` runs automatically on every assignment — `user.email = \"  Ana@X.com \"` is stored as `\"ana@x.com\"` before validation even runs, so `\"Ana@x.com\"` and `\"ana@x.com\"` can never both exist as separate accounts. `has_secure_password` is what turns a plain `password:` argument into that `password_digest` column from module 10's migration — full story next module.",
        },
        {
          type: "text",
          md: [
            "## The real `walker.rb`",
            "You already wrote every line of this once, in module 07's throwaway `Walker` — `price_label` is the exact same computed value the iOS course builds as a Swift computed property, and `in_city` is the exact scope you first met filtering by query param in module 08.",
          ],
        },
        {
          type: "code",
          title: "app/models/walker.rb",
          source: String.raw`class Walker < ApplicationRecord
  has_many :bookings

  validates :name, presence: true
  validates :city, presence: true
  validates :price_per_30_min_cents, presence: true,
                                      numericality: { only_integer: true, greater_than: 0 }

  scope :in_city, ->(city) { where("LOWER(city) = ?", city.to_s.downcase) }

  def price_label
    "$#{price_per_30_min_cents / 100} / 30 min"
  end
end`,
          caption: "`in_city` lowercases BOTH sides of the comparison — the column via SQL `LOWER(city)`, the argument via `.to_s.downcase` — so `in_city(\"austin\")` and `in_city(\"Austin\")` return identical results. `price_label` divides integer cents by integer 100, Ruby's integer division, which is exactly why `$25` (not `$25.0`) shows up in every curl transcript you've seen.",
        },
        {
          type: "text",
          md: [
            "## The real `dog.rb`",
            "Short, and it should look familiar: `size` inclusion is the exact validation pattern module 07 covered, just with PawWalk's real three sizes.",
          ],
        },
        {
          type: "code",
          title: "app/models/dog.rb",
          source: String.raw`class Dog < ApplicationRecord
  belongs_to :user
  has_many :bookings

  validates :name, presence: true
  validates :size, inclusion: { in: %w[small medium large] }
end`,
          caption: "`%w[small medium large]` builds `[\"small\", \"medium\", \"large\"]` with no quotes or commas — module 02's array shorthand, still paying off here. `inclusion: { in: ... }` rejects anything else at the model layer, before it ever reaches the database.",
        },
        {
          type: "quiz",
          q: "`User` calls `normalizes :email, with: ->(email) { email.strip.downcase }`. A client signs up with `email: \"  Ana@Example.com \"`. What actually gets stored and validated?",
          choices: [
            "`\"ana@example.com\"` — the lambda runs automatically on assignment, before validations, trimming and lowercasing it first",
            "`\"  Ana@Example.com \"` exactly as sent — `normalizes` only affects how it's displayed, not stored",
            "The signup fails immediately because of the leading whitespace",
            "Only the lowercasing happens; the surrounding whitespace is kept",
          ],
          answer: 0,
          explain: "`normalizes` runs its block on every assignment to that attribute, so by the time `presence`/`uniqueness`/`format` validations run, the value is already `\"ana@example.com\"` — trimmed and downcased. That's also why two signups differing only in case or stray whitespace collide on the uniqueness check.",
          nudge: "The lambda calls `.strip` then `.downcase`. Does `normalizes` run that BEFORE or AFTER the value is assigned to the attribute?",
        },
        {
          type: "exercise",
          title: "Retype walker.rb's heart",
          prompt: [
            "Write the `price_per_30_min_cents` validation (`presence: true, numericality: { only_integer: true, greater_than: 0 }`), the `in_city` scope, and the `price_label` method, exactly as they appear in the real file.",
          ],
          starter: String.raw`class Walker < ApplicationRecord
  has_many :bookings

  validates :name, presence: true
  validates :city, presence: true
  # your code here
end`,
          solution: String.raw`class Walker < ApplicationRecord
  has_many :bookings

  validates :name, presence: true
  validates :city, presence: true
  validates :price_per_30_min_cents, presence: true,
                                      numericality: { only_integer: true, greater_than: 0 }

  scope :in_city, ->(city) { where("LOWER(city) = ?", city.to_s.downcase) }

  def price_label
    "$#{price_per_30_min_cents / 100} / 30 min"
  end
end`,
          checks: [
            { re: /validates:price_per_30_min_cents,presence:true,numericality:\{only_integer:true,greater_than:0\}/, hint: "Match the exact validation: `validates :price_per_30_min_cents, presence: true, numericality: { only_integer: true, greater_than: 0 }`." },
            { re: /scope:in_city,->\(city\)\{where\("LOWER\(city\)=\?",city\.to_s\.downcase\)\}/, hint: "The scope lowercases both sides: `scope :in_city, ->(city) { where(\"LOWER(city) = ?\", city.to_s.downcase) }`." },
            { re: /def price_label/, hint: "Define `def price_label`." },
            { re: /"\$#\{price_per_30_min_cents\/100\}\/30 min"/, hint: "Return `\"$#{price_per_30_min_cents / 100} / 30 min\"` from inside the method." },
          ],
          mustNot: [
            { re: /def price_label\(/, hint: "`price_label` takes no arguments — it reads `price_per_30_min_cents` off `self`, no parens needed after the method name." },
          ],
          success: "Word for word, the real `apps/pawwalk-api/app/models/walker.rb` — the same validation and scope you'll see filtering real curl requests in lesson 5.",
        },
      ],
    },
    {
      id: "models-booking-and-friends",
      title: "Models: Booking & Friends",
      steps: [
        {
          type: "text",
          md: [
            "## `Booking` — the busiest model in the app",
            "This is the real file, in full. Take it one piece at a time below.",
          ],
        },
        {
          type: "code",
          title: "app/models/booking.rb",
          source: String.raw`class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :walker
  belongs_to :dog
  has_one :walk_session
  has_one :payment, dependent: :destroy

  enum :status, {
    pending: "pending",
    confirmed: "confirmed",
    in_progress: "in_progress",
    completed: "completed",
    cancelled: "cancelled"
  }

  validates :starts_at, presence: true
  validates :duration_min, inclusion: { in: [ 30, 60 ] }
  validates :price_cents, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validate :dog_belongs_to_booker

  scope :upcoming, -> { where(starts_at: Time.current..).where.not(status: :cancelled) }
  scope :for_walker, ->(walker) { where(walker: walker) }

  # Price is always derived from the walker's rate, never accepted from the client.
  def compute_price!
    self.price_cents = walker.price_per_30_min_cents * (duration_min / 30)
  end

  private

  def dog_belongs_to_booker
    return if dog.nil? || user.nil?

    errors.add(:dog, "must belong to the user making the booking") if dog.user_id != user_id
  end
end`,
          caption: "Five belongs_to/has_one lines, a string-backed enum, four validations, two scopes, one price-computing method, one custom validation. Every piece of it earns its place — nothing here is decoration.",
        },
        {
          type: "text",
          md: [
            "## `enum :status` — free methods, backed by real strings",
            "`enum :status, { pending: \"pending\", confirmed: \"confirmed\", ... }` maps each Ruby-side symbol to the exact string stored in the `status` column — the string-enum choice from lesson 2, made concrete. In exchange for that mapping, Rails generates a whole family of methods for free: `booking.pending?`, `booking.confirmed?`, and bang setters like `booking.confirmed!` (which both sets the status AND saves the record in one call). You never write `if booking.status == \"confirmed\"` anywhere in this codebase — you write `if booking.confirmed?`, which reads like English and can't typo the string.",
          ],
        },
        {
          type: "text",
          md: [
            "## The custom validation, line by line",
            "`validates :starts_at, presence: true` and friends are Rails' built-in validators — you've used their shape since module 07. `validate :dog_belongs_to_booker` (no `s`, singular) is different: it names a PRIVATE METHOD that runs custom logic no built-in validator covers.",
            "```\ndef dog_belongs_to_booker\n  return if dog.nil? || user.nil?\n\n  errors.add(:dog, \"must belong to the user making the booking\") if dog.user_id != user_id\nend\n```",
            "Line by line: `return if dog.nil? || user.nil?` is a guard clause (module 04) — if either association hasn't loaded yet, there's nothing to check, so bail out instead of crashing on `nil.user_id`. Then the real rule: `errors.add(:dog, \"...\")` pushes a message onto the record's `errors` collection — the SAME `errors` object `render_invalid` reads in `ApplicationController` (module 08) to build a 422 response — but only `if dog.user_id != user_id`. In plain English: **you can't book someone else's dog.** Without this, any signed-in user could pass an arbitrary `dog_id` in the request body and walk a stranger's dog.",
          ],
        },
        {
          type: "text",
          md: [
            "## `compute_price!` — money, computed server-side",
            "`self.price_cents = walker.price_per_30_min_cents * (duration_min / 30)` is the whole method. The comment above it says everything: **price is derived from the walker's rate, never accepted from the client.** If a client could send `price_cents: 1` directly, every booking would cost a penny. Module 11 tells the full story of where `compute_price!` gets called in the create flow — for now, just recognize why it exists.",
          ],
        },
        {
          type: "text",
          md: [
            "## `walk_session.rb` and `location_ping.rb` — quiet for now",
            "Two small models finish the chain from lesson 2's ER description:",
          ],
        },
        {
          type: "code",
          title: "app/models/walk_session.rb + app/models/location_ping.rb",
          source: String.raw`class WalkSession < ApplicationRecord
  belongs_to :booking
  has_many :location_pings, dependent: :destroy
end

class LocationPing < ApplicationRecord
  belongs_to :walk_session

  validates :lat, presence: true, numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }
  validates :lng, presence: true, numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }
end`,
          caption: "`LocationPing`'s bounds (`-90..90` for latitude, `-180..180` for longitude) reject a GPS fix that's physically impossible before it ever reaches the database — cheap insurance against a buggy client. Both models sit quiet today; module 13 brings them alive with a real walk in progress, pings streaming in every few seconds.",
        },
        {
          type: "quiz",
          q: "`Booking`'s custom `dog_belongs_to_booker` validation checks `dog.user_id != user_id`. What real-world bug does this specifically prevent?",
          choices: [
            "A signed-in user booking a walk for a dog that belongs to a DIFFERENT user — an attacker passing someone else's `dog_id`",
            "A booking with an invalid `duration_min`, like 45 instead of 30 or 60",
            "A walker double-booking the same time slot",
            "A dog with a `size` outside `small`/`medium`/`large`",
          ],
          answer: 0,
          explain: "`dog.user_id != user_id` compares the dog's actual owner against the user making THIS booking. If they differ, `errors.add(:dog, ...)` blocks the save — stopping anyone from booking a walk for a dog they don't own, even though nothing in the request format would otherwise catch it.",
          nudge: "The check compares two different `user_id`s — the dog's owner, and the person making the booking. What does a mismatch between those two mean?",
        },
        {
          type: "exercise",
          title: "Retype the custom validation and the enum",
          prompt: [
            "Write the `enum :status` block exactly as it appears (five string-backed statuses), then the private `dog_belongs_to_booker` method.",
          ],
          starter: String.raw`class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :walker
  belongs_to :dog

  # your code here

  private

  # and your code here
end`,
          solution: String.raw`class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :walker
  belongs_to :dog

  enum :status, {
    pending: "pending",
    confirmed: "confirmed",
    in_progress: "in_progress",
    completed: "completed",
    cancelled: "cancelled"
  }

  private

  def dog_belongs_to_booker
    return if dog.nil? || user.nil?

    errors.add(:dog, "must belong to the user making the booking") if dog.user_id != user_id
  end
end`,
          checks: [
            { re: /enum:status,\{pending:"pending",confirmed:"confirmed",in_progress:"in_progress",completed:"completed",cancelled:"cancelled"\}/, hint: "All five statuses, string-backed, in this exact order: pending, confirmed, in_progress, completed, cancelled." },
            { re: /def dog_belongs_to_booker/, hint: "Name the method exactly `dog_belongs_to_booker` — it has to match the `validate :dog_belongs_to_booker` line elsewhere in the real file." },
            { re: /return if dog\.nil\?\|\|user\.nil\?/, hint: "The guard clause first: `return if dog.nil? || user.nil?`." },
            { re: /errors\.add\(:dog,"must belong to the user making the booking"\)if dog\.user_id!=user_id/, hint: "Then: `errors.add(:dog, \"must belong to the user making the booking\") if dog.user_id != user_id`." },
          ],
          success: "That's the real enum and the real security check, word for word — the exact line standing between this API and a stranger walking your dog.",
        },
      ],
    },
    {
      id: "seeds-and-first-endpoint",
      title: "Seeds & Your First Real Endpoint",
      steps: [
        {
          type: "text",
          md: [
            "## The real `db/seeds.rb`",
            "You already ran this file in lesson 1's checklist. Here it is in full — notice every single record uses `find_or_create_by!`, the exact idempotency pattern module 07 first taught: run this file ten times, get four walkers and one demo user, never eight or forty.",
          ],
        },
        {
          type: "code",
          title: "db/seeds.rb",
          source: String.raw`[
  { name: "Luna Martinez", city: "Austin", price_per_30_min_cents: 2500 },
  { name: "Sam Okafor", city: "Portland", price_per_30_min_cents: 2200 },
  { name: "Priya Shah", city: "Chicago", price_per_30_min_cents: 2800 },
  { name: "Jonah Lee", city: "Denver", price_per_30_min_cents: 2000 }
].each do |attrs|
  Walker.find_or_create_by!(name: attrs[:name]) do |walker|
    walker.city = attrs[:city]
    walker.price_per_30_min_cents = attrs[:price_per_30_min_cents]
  end
end

demo_user = User.find_or_create_by!(email: "demo@pawwalk.dev") do |user|
  user.name = "Demo User"
  user.password = "walkies123"
end

mochi = Dog.find_or_create_by!(user: demo_user, name: "Mochi") do |dog|
  dog.breed = "Shiba Inu"
  dog.size = "small"
end`,
          caption: "The block form of `find_or_create_by!` only runs its block (`walker.city = ...`) on the CREATE path — if a walker named \"Luna Martinez\" already exists, Rails finds her and skips the block entirely, leaving her untouched. That's what makes re-running `db:seed` safe.",
        },
        {
          type: "text",
          md: [
            "## The real `WalkersController`, verbatim",
            "This is the exact file — no `Api::` module, matching what lesson 1 showed you in `routes.rb`.",
          ],
        },
        {
          type: "code",
          title: "app/controllers/walkers_controller.rb",
          source: String.raw`class WalkersController < ApplicationController
  skip_before_action :authenticate_request

  def index
    walkers = Walker.order(rating: :desc)
    walkers = walkers.in_city(params[:city]) if params[:city].present?

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
      bio: walker.bio,
      city: walker.city,
      rating: walker.rating,
      price_per_30_min_cents: walker.price_per_30_min_cents,
      price_label: walker.price_label
    }
  end
end`,
          caption: "`skip_before_action :authenticate_request` at the top is the tell: `ApplicationController` is going to require every request to prove who it is, starting next module — but browsing walkers has to work for someone who hasn't signed up yet, so THIS controller opts out. Every other controller you'll meet from module 11 onward stays locked down by default. `Walker.order(rating: :desc)` — best-rated walkers first — plus the same `in_city` query-param filter module 08 taught, plus `walker_payload` hand-shaping every field the iOS client actually needs.",
        },
        {
          type: "text",
          md: [
            "## The route that wires it up",
            "One line in `config/routes.rb`: `resources :walkers, only: %i[index show]`. That's `GET /walkers` → `index`, `GET /walkers/:id` → `show` — nothing else, because there's no create/update/destroy for a walker listing yet (and maybe never, from this API's side).",
          ],
        },
        {
          type: "code",
          title: "Terminal — filter by city",
          source: String.raw`$ curl "localhost:3000/walkers?city=Austin"
{"walkers":[{"id":1,"name":"Luna Martinez","bio":null,"city":"Austin","rating":"5.0","price_per_30_min_cents":2500,"price_label":"$25 / 30 min"}]}

$ curl localhost:3000/walkers/1
{"walker":{"id":1,"name":"Luna Martinez","bio":null,"city":"Austin","rating":"5.0","price_per_30_min_cents":2500,"price_label":"$25 / 30 min"}}`,
          caption: "Real output, real repo, real port. One seeded walker lives in Austin — the `in_city` scope from lesson 3 filters the other three out entirely, driven by nothing but a query param.",
        },
        {
          type: "xcode",
          title: "Over to the terminal",
          label: "Over to the terminal",
          intro: [
            "With the server still running from lesson 1 (or reboot it with `bin/rails s`):",
          ],
          items: [
            "`curl \"localhost:3000/walkers?city=Austin\"` — should return exactly one walker, Luna Martinez",
            "`curl localhost:3000/walkers/1` — the same walker, by id, wrapped in a `walker` key instead of `walkers`",
          ],
        },
        {
          type: "quiz",
          q: "`WalkersController` has `skip_before_action :authenticate_request` as its very first line. What does that tell you about every OTHER controller in this app, starting next module?",
          choices: [
            "Every other controller requires the request to be authenticated by default — `WalkersController` is the deliberate exception, because browsing walkers has to work before you've signed up",
            "Nothing — `skip_before_action` is decorative and has no effect on other controllers",
            "It means authentication is optional everywhere in the app",
            "It means `WalkersController` is the only controller that will ever exist",
          ],
          answer: 0,
          explain: "You can't SKIP a `before_action` that doesn't exist somewhere above it in the inheritance chain. `ApplicationController` is about to declare `before_action :authenticate_request` (module 10) applying to every controller by default — `WalkersController` opting out is the exception that proves the rule.",
          nudge: "Can you skip something that was never going to run in the first place? What does `skip_before_action` being NEEDED here imply about the default?",
        },
        {
          type: "exercise",
          title: "Capstone: retype walker_payload and index",
          prompt: [
            "Write the private `walker_payload(walker)` helper returning the seven fields shown in the real file, then the `index` action: `Walker.order(rating: :desc)`, filter by `in_city` if `params[:city]` is present, then render.",
          ],
          starter: String.raw`class WalkersController < ApplicationController
  skip_before_action :authenticate_request

  def index
    # your code here
  end

  private

  # and your walker_payload here
end`,
          solution: String.raw`class WalkersController < ApplicationController
  skip_before_action :authenticate_request

  def index
    walkers = Walker.order(rating: :desc)
    walkers = walkers.in_city(params[:city]) if params[:city].present?

    render json: { walkers: walkers.map { |walker| walker_payload(walker) } }
  end

  private

  def walker_payload(walker)
    {
      id: walker.id,
      name: walker.name,
      bio: walker.bio,
      city: walker.city,
      rating: walker.rating,
      price_per_30_min_cents: walker.price_per_30_min_cents,
      price_label: walker.price_label
    }
  end
end`,
          checks: [
            { re: /walkers=Walker\.order\(rating: ?:desc\)/, hint: "Order by rating, best first: `walkers = Walker.order(rating: :desc)`." },
            { re: /walkers=walkers\.in_city\(params\[:city\]\)if params\[:city\]\.present\?/, hint: "Filter conditionally: `walkers = walkers.in_city(params[:city]) if params[:city].present?`." },
            { re: /render json:\{walkers:walkers\.map\{\|walker\|walker_payload\(walker\)\}\}/, hint: "Render the wrapped, mapped hash: `render json: { walkers: walkers.map { |walker| walker_payload(walker) } }`." },
            { re: /def walker_payload\(walker\)/, hint: "Name the helper `walker_payload(walker)`." },
            { re: /price_label:walker\.price_label/, hint: "The last field is `price_label: walker.price_label`." },
          ],
          mustNot: [
            { re: /render json:Walker\.all/, hint: "Never render a raw relation — shape every field through `walker_payload` first." },
          ],
          success: "That's `apps/pawwalk-api/app/controllers/walkers_controller.rb`, field for field, action for action. Module 10 locks every OTHER controller behind real authentication — this is the last endpoint in the course that gets to stay wide open.",
        },
      ],
    },
  ],
});
