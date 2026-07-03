window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "activerecord",
  title: "ActiveRecord",
  emoji: "🗄️",
  lang: "ruby",
  lessons: [
    {
      id: "migrations",
      title: "Migrations",
      steps: [
        {
          type: "text",
          md: [
            "## Schema as versioned Ruby",
            "So far `dogpark` has exactly one table, `walkers`, and you got it for free from `bin/rails g scaffold`. From here on you're hand-building models — starting with `Dog` — so it's time to see what a **migration** actually is: a plain Ruby file that describes one change to your database's shape, checked into git like any other source file, applied in order.",
            "Think of migrations as **version control for the schema**. Just like git tracks changes to code over time, migrations track changes to your tables over time — one file per change, timestamped, replayable from scratch on a fresh database.",
          ],
        },
        {
          type: "text",
          md: [
            "## The model generator — a scaffold with the training wheels off",
            "You already know `bin/rails g scaffold` — model, migration, controller, views, routes, all at once. For `Dog` you want a different generator:",
            "```\nbin/rails g model Dog name:string breed:string size:string\n```",
            "`g model` gives you only two files: the migration and the model class. **What you DON'T get:** no controller, no views, no routes, no jbuilder JSON templates. Rails assumes you're building the data layer first and deciding later whether `Dog` even needs its own web-facing routes (in the real backend, it doesn't get its own controller at all — dogs are managed through `bookings`). Reach for `g model` any time you want a table without a matching pile of web boilerplate.",
          ],
        },
        {
          type: "code",
          title: "db/migrate/..._create_dogs.rb (generated)",
          source: String.raw`class CreateDogs < ActiveRecord::Migration[8.1]
  def change
    create_table :dogs do |t|
      t.string :name
      t.string :breed
      t.string :size

      t.timestamps
    end
  end
end`,
          caption: "This is exactly what `bin/rails g model Dog name:string breed:string size:string` writes to disk — nothing has touched the database yet. `t.timestamps` adds `created_at`/`updated_at` columns for free; every generated migration includes it.",
        },
        {
          type: "text",
          md: [
            "## You own the file — edit it before migrating",
            "A generator gives you a *starting point*, not a final answer. Open the generated migration and tighten it up before running it: dog walkers need every dog to have a name, and a sensible default for the ones nobody sets a size for.",
            "```\nt.string :name, null: false\nt.string :size, default: \"medium\"\n```",
            "`null: false` is a database-level constraint — even a stray `Dog.new.save(validate: false)` can't sneak a nameless row past it. `default: \"medium\"` means any `Dog.create!(name: \"Rex\")` with no `size` argument still gets a real value instead of `nil`. Both are edits YOU make to the generated file; Rails never assumes them for you.",
          ],
        },
        {
          type: "code",
          title: "db/migrate/..._create_dogs.rb (edited)",
          source: String.raw`class CreateDogs < ActiveRecord::Migration[8.1]
  def change
    create_table :dogs do |t|
      t.string :name, null: false
      t.string :breed
      t.string :size, default: "medium"

      t.timestamps
    end
  end
end`,
          caption: "Two small edits, verified against a real run: `null: false` on `name`, `default: \"medium\"` on `size`. `breed` stays optional — plenty of dogs are mixed-breed or unknown.",
        },
        {
          type: "text",
          md: [
            "## db:migrate, db/schema.rb, and db:rollback",
            "`bin/rails db:migrate` runs every migration Rails hasn't applied yet, in timestamp order, against your actual database. After it runs, `db/schema.rb` is regenerated to reflect the CURRENT shape of every table — it's the single file that tells you the truth about your schema right now, without reading through years of migration history.",
            "Made a mistake? `bin/rails db:rollback` undoes the most recent migration — verified in dogpark: it dropped the `dogs` table cleanly, and running `db:migrate` again recreated it. Rollback only works if the migration's `change` method is reversible (plain `create_table`/`add_column` calls are; some hand-written raw SQL isn't).",
          ],
        },
        {
          type: "code",
          title: "db/schema.rb (after migrating)",
          source: String.raw`ActiveRecord::Schema[8.1].define(version: 2026_07_03_160612) do
  create_table "dogs", force: :cascade do |t|
    t.string "breed"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.string "size", default: "medium"
    t.datetime "updated_at", null: false
  end

  create_table "walkers", force: :cascade do |t|
    t.string "city"
    t.datetime "created_at", null: false
    t.string "name"
    t.integer "price_per_30_min_cents"
    t.datetime "updated_at", null: false
  end
end`,
          caption: "Trimmed from a real dogpark run. Notice `name` carries `null: false` and `size` carries its default — schema.rb reflects your edited migration, not the generator's original guess. `walkers` shows up too, since schema.rb always lists every table.",
        },
        {
          type: "xcode",
          label: "Over to the terminal",
          title: "Generate, edit, and migrate Dog in dogpark",
          intro: ["In your `dogpark` app:"],
          items: [
            "`bin/rails g model Dog name:string breed:string size:string`",
            "Open the generated migration in `db/migrate/` and add `null: false` to `name` and `default: \"medium\"` to `size`",
            "`bin/rails db:migrate`",
            "Open `db/schema.rb` and confirm the `dogs` table shows your edits",
            "Try `bin/rails db:rollback` then `bin/rails db:migrate` again — watch the table drop and get recreated",
          ],
        },
        {
          type: "quiz",
          q: "You add `null: false` and a `default:` by hand-editing a generated migration, then run `bin/rails db:migrate`. Where do those constraints actually end up living?",
          choices: [
            "In the real database column itself — the database enforces `null: false` and applies the default, and `db/schema.rb` is regenerated to reflect it",
            "Only in the migration file — the database ignores anything you add beyond what the generator originally wrote",
            "Only in `db/schema.rb` — the actual database table is untouched by hand-edits",
            "Nowhere — you'd need a second migration to apply hand-written changes",
          ],
          answer: 0,
          explain: "A migration is a real instruction set. `db:migrate` runs your EDITED file exactly as written — the database column genuinely gets `NOT NULL` and a default value, and `db/schema.rb` is just Rails re-describing the database's new, true shape.",
          nudge: "Generators give you a starting point, but the file you migrate is the one Rails actually runs — did you edit it before or after `db:migrate`?",
        },
      ],
    },
    {
      id: "validations",
      title: "Validations",
      steps: [
        {
          type: "text",
          md: [
            "## A migration enforces the database. A validation enforces Ruby.",
            "`null: false` on the `dogs.name` column stops a nameless row from ever reaching the database — but it does that with a low-level SQL error, which is a harsh way to find out. **Validations** live in the model instead, run in Ruby before any SQL fires, and give you back a friendly, structured list of what's wrong:",
            "```\nclass Dog < ApplicationRecord\n  validates :name, presence: true\n  validates :size, inclusion: { in: %w[small medium large] }\nend\n```",
            "This is the SAME validation the real PawWalk backend's `Dog` model has — open `apps/pawwalk-api/app/models/dog.rb` in a later module and you'll recognize both lines exactly.",
          ],
        },
        {
          type: "text",
          md: [
            "## presence and inclusion",
            "`presence: true` fails if the attribute is `nil` or an empty/whitespace-only string — exactly the gap `null: false` covers at the database layer, just checked earlier and more gently. `inclusion: { in: %w[small medium large] }` fails unless the value is one of those three exact strings — `%w[...]` is Ruby's shorthand for an array of words, so `%w[small medium large]` is `[\"small\", \"medium\", \"large\"]` without the quotes and commas.",
            "There's also `numericality` for number-shaped attributes, which you'll meet again on `Booking`'s `price_cents` in the next lesson: `validates :price_cents, numericality: { only_integer: true, greater_than: 0 }`.",
          ],
        },
        {
          type: "text",
          md: [
            "## valid? and errors.full_messages",
            "Call `.valid?` on any record — saved or not — to run every validation and get back `true`/`false`. If it's `false`, `.errors.full_messages` gives you a plain-English array of what failed:",
            "```\nd = Dog.new(size: \"medium\")\nd.valid?                    # false\nd.errors.full_messages      # [\"Name can't be blank\"]\n\nd2 = Dog.new(name: \"Mochi\", size: \"huge\")\nd2.valid?                    # false\nd2.errors.full_messages      # [\"Size is not included in the list\"]\n```",
            "Verified in a real dogpark console — those are the exact messages Rails generates from the two validations above, no custom message text needed.",
          ],
        },
        {
          type: "text",
          md: [
            "## save vs. save!, create vs. create!",
            "`save` and `create` fail QUIETLY when validations fail: `save` returns `false`, `create` hands back an unsaved record with errors attached — nothing raises, so a careless caller can miss the failure entirely. The bang versions, `save!` and `create!`, do the opposite: they raise `ActiveRecord::RecordInvalid` the instant validation fails, refusing to let a bad state pass silently.",
            "```\nDog.create!(size: \"medium\")\n# raises ActiveRecord::RecordInvalid: Validation failed: Name can't be blank\n```",
            "The course's own backend leans on bang methods paired with a `rescue_from ActiveRecord::RecordInvalid` handler at the controller level (you'll build that in module 08) — fail loudly in the model, catch it once, centrally, instead of checking a boolean after every single save.",
          ],
        },
        {
          type: "code",
          title: "app/models/dog.rb",
          source: String.raw`class Dog < ApplicationRecord
  validates :name, presence: true
  validates :size, inclusion: { in: %w[small medium large] }
end`,
          caption: "Verified: `Dog.new(name: \"Mochi\", size: \"medium\").save` returns `true`; `Dog.create!(size: \"medium\")` raises `ActiveRecord::RecordInvalid: Validation failed: Name can't be blank`.",
        },
        {
          type: "quiz",
          q: "`Dog.create(size: \"medium\")` (no bang) fails validation because `name` is blank. What actually happens?",
          choices: [
            "No exception is raised — `create` returns an unsaved `Dog` with `errors` populated, and the caller has to check for that themselves",
            "It raises `ActiveRecord::RecordInvalid` immediately, same as `create!`",
            "It saves anyway, since only `null: false` at the database level is enforced, not model validations",
            "It raises a plain `RuntimeError` with no error details attached",
          ],
          answer: 0,
          explain: "Plain `create` (no bang) never raises on a validation failure — it hands back an object where `.persisted?` is false and `.errors.full_messages` explains why. Only the bang form, `create!`, turns that failure into a raised exception.",
          nudge: "The lesson drew a hard line between the bang and non-bang forms. Which one fails LOUDLY, and which one fails quietly?",
        },
        {
          type: "exercise",
          title: "Write the Dog validations",
          prompt: [
            "Inside `class Dog < ApplicationRecord`, add two validations: `name` must be present, and `size` must be included in `%w[small medium large]`.",
          ],
          starter: String.raw`class Dog < ApplicationRecord
  # your code here
end`,
          solution: String.raw`class Dog < ApplicationRecord
  validates :name, presence: true
  validates :size, inclusion: { in: %w[small medium large] }
end`,
          checks: [
            { re: /validates:name,presence:true/, hint: "Match the exact form: `validates :name, presence: true`." },
            { re: /validates:size,inclusion:\{in:%w\[small medium large\]\}/, hint: "Use `validates :size, inclusion: { in: %w[small medium large] }` — `%w[...]` is Ruby's word-array shorthand." },
          ],
          mustNot: [
            { re: /size,presence:true/, hint: "`size` needs `inclusion`, not `presence` — it must be one of three specific words, not merely non-blank." },
          ],
          success: "Same two lines the real backend's Dog model ships — you'll see this file verbatim again in module 09.",
        },
      ],
    },
    {
      id: "associations",
      title: "Associations",
      steps: [
        {
          type: "text",
          md: [
            "## Booking connects Walker and Dog",
            "A dog walk needs three things to exist: a `Walker` doing the walking, a `Dog` going on it, and the booking details themselves. Generate `Booking` with two `references` columns — Rails' shorthand for \"this points at another table\":",
            "```\nbin/rails g model Booking walker:references dog:references starts_at:datetime duration_min:integer price_cents:integer status:string\n```",
            "`references` does two things at once: it adds a `walker_id`/`dog_id` foreign-key column (with a real foreign-key CONSTRAINT in the database, not just a plain integer), and it writes `belongs_to :walker` / `belongs_to :dog` into the generated model automatically — you get that part for free.",
          ],
        },
        {
          type: "code",
          title: "db/migrate/..._create_bookings.rb (generated)",
          source: String.raw`class CreateBookings < ActiveRecord::Migration[8.1]
  def change
    create_table :bookings do |t|
      t.references :walker, null: false, foreign_key: true
      t.references :dog, null: false, foreign_key: true
      t.datetime :starts_at
      t.integer :duration_min
      t.integer :price_cents
      t.string :status

      t.timestamps
    end
  end
end`,
          caption: "`references` already came with `null: false, foreign_key: true` baked in by the generator — you don't need to add those yourself the way you did for `name` on `Dog`.",
        },
        {
          type: "code",
          title: "app/models/booking.rb (generated)",
          source: String.raw`class Booking < ApplicationRecord
  belongs_to :walker
  belongs_to :dog
end`,
          caption: "Both `belongs_to` lines were written by the generator the moment it saw `walker:references` and `dog:references` — you didn't type these.",
        },
        {
          type: "text",
          md: [
            "## Edit the migration: sensible defaults",
            "Same habit as `Dog` — the generator gives you a shape, you own the file. Most bookings are a standard 30-minute walk starting out `pending`:",
            "```\nt.integer :duration_min, default: 30\nt.string :status, default: \"pending\"\n```",
          ],
        },
        {
          type: "text",
          md: [
            "## has_many — the other half of the relationship",
            "`belongs_to` only describes the Booking's side (\"I point at exactly one Walker\"). To go the other direction — \"give me every booking for this walker\" — you write `has_many :bookings` on `Walker` and `Dog` yourself. The generator never adds this side automatically, because it has no way to know a `Walker` should be Booking-aware.",
            "```\nclass Walker < ApplicationRecord\n  has_many :bookings, dependent: :destroy\nend\n```",
            "`dependent: :destroy` is worth being honest about: it means deleting a `Walker` cascades to delete every `Booking` that points at them. That's rarely what you actually want for a real dog-walking business — you'd more likely want to keep booking HISTORY even after a walker leaves the platform. It's used here because it's the simplest option to reach for while learning, and because an orphaned `booking.walker` returning `nil` would crash the next `.walker.name` call. A real app often reaches for `dependent: :restrict_with_error` (block the delete) or a `deactivated_at` flag (never hard-delete a Walker at all) instead — file that away for later, don't take `dependent: :destroy` as the default answer.",
          ],
        },
        {
          type: "code",
          title: "app/models/walker.rb and app/models/dog.rb (edited)",
          source: String.raw`class Walker < ApplicationRecord
  has_many :bookings, dependent: :destroy
end

class Dog < ApplicationRecord
  has_many :bookings, dependent: :destroy

  validates :name, presence: true
  validates :size, inclusion: { in: %w[small medium large] }
end`,
          caption: "Verified: after this edit and a `db:migrate`, `walker.bookings.count` and `dog.bookings.count` both work in the console.",
        },
        {
          type: "text",
          md: [
            "## Traversing the graph",
            "Once both sides exist, you can walk the relationship in either direction — no SQL, just method calls Rails builds for you from the associations:",
            "```\nbooking = Booking.create!(walker: walker, dog: dog, starts_at: Time.current, price_cents: 2400)\nbooking.walker.name      # \"Priya\" — belongs_to, singular\nbooking.dog.name         # \"Mochi\"\nwalker.bookings.count    # 1 — has_many, plural, returns a collection\n```",
            "Verified in a real dogpark console session — `booking.walker.name` and `walker.bookings.count` both returned exactly what you'd expect after creating one booking.",
          ],
        },
        {
          type: "xcode",
          label: "Over to the terminal",
          title: "Generate Booking and wire up has_many",
          intro: ["In `dogpark`:"],
          items: [
            "`bin/rails g model Booking walker:references dog:references starts_at:datetime duration_min:integer price_cents:integer status:string`",
            "Edit the generated migration: `default: 30` on `duration_min`, `default: \"pending\"` on `status`",
            "Add `has_many :bookings, dependent: :destroy` to both `Walker` and `Dog`",
            "`bin/rails db:migrate`",
            "In `bin/rails console`, create a Booking and confirm `booking.walker.name`, `booking.dog.name`, and `walker.bookings.count` all work",
          ],
        },
        {
          type: "quiz",
          q: "You generate `Booking` with `walker:references`. The generator writes `belongs_to :walker` into `Booking` automatically. Does it also write `has_many :bookings` into `Walker`?",
          choices: [
            "No — `has_many :bookings` has to be added to `Walker` by hand; the generator only knows about the model it's generating, not every model that might reference it",
            "Yes, the generator finds `Walker` and edits it too",
            "It's not needed — `belongs_to` alone is enough to call `walker.bookings`",
            "Only if you pass a `--has-many` flag to the generator",
          ],
          answer: 0,
          explain: "`references` only touches the model being generated (`Booking`). The reverse side, `has_many :bookings` on `Walker`, is something you add yourself — Rails has no way to infer that `Walker` should expose a `bookings` collection just because some other model points at it.",
          nudge: "Which file did you have to open and edit yourself to make `walker.bookings` work — was it generated, or hand-added?",
        },
        {
          type: "exercise",
          title: "Add the has_many lines",
          prompt: [
            "Add a `has_many :bookings, dependent: :destroy` line to both `Walker` and `Dog` below.",
          ],
          starter: String.raw`class Walker < ApplicationRecord
  # your code here
end

class Dog < ApplicationRecord
  # your code here
  validates :name, presence: true
end`,
          solution: String.raw`class Walker < ApplicationRecord
  has_many :bookings, dependent: :destroy
end

class Dog < ApplicationRecord
  has_many :bookings, dependent: :destroy
  validates :name, presence: true
end`,
          checks: [
            { re: /class Walker<ApplicationRecord has_many:bookings,dependent::destroy/, hint: "Add `has_many :bookings, dependent: :destroy` as the first line inside `Walker`." },
            { re: /class Dog<ApplicationRecord has_many:bookings,dependent::destroy/, hint: "Add the same `has_many :bookings, dependent: :destroy` line inside `Dog`, above the existing validation." },
          ],
          mustNot: [
            { re: /belongs_to:bookings/, hint: "`Booking` belongs to `Walker`/`Dog` — but `Walker`/`Dog` each `has_many :bookings`, not the other way around." },
          ],
          success: "Both directions now work: `booking.walker` (belongs_to) and `walker.bookings` (has_many) — the full shape a real has-many/belongs-to pair needs.",
        },
      ],
    },
    {
      id: "query-interface",
      title: "The Query Interface",
      steps: [
        {
          type: "text",
          md: [
            "## where, order, limit, find_by",
            "Every model gets these query methods for free, and they read almost like English. `where` takes a hash of conditions; `order` sorts; `limit` caps how many rows come back; `find_by` returns the first match or `nil`:",
            "```\nWalker.where(city: \"Austin\")\nWalker.where(price_per_30_min_cents: 2000..2500)   # a Ruby Range works as a BETWEEN\nWalker.order(:price_per_30_min_cents)\nWalker.limit(1)\nWalker.find_by(name: \"Sam\")                        # one record, or nil — never raises\n```",
            "You can chain all of these together, because each one returns something you can keep calling methods on — not a final result.",
          ],
        },
        {
          type: "text",
          md: [
            "## Chaining is lazy — nothing runs until you look",
            "`Walker.where(city: \"Austin\").order(:price_per_30_min_cents).limit(1)` does NOT hit the database the moment you write it. It builds up a description of a query — an `ActiveRecord::Relation` — and only fires real SQL the instant you actually use the result: looping over it, calling `.first`, printing it, anything that needs actual rows.",
            "You can see the SQL it WOULD run, without running it, by calling `.to_sql`:",
            "```\nWalker.where(city: \"Austin\").order(:price_per_30_min_cents).limit(1).to_sql\n# => SELECT \"walkers\".* FROM \"walkers\" WHERE \"walkers\".\"city\" = 'Austin'\n#    ORDER BY \"walkers\".\"price_per_30_min_cents\" ASC LIMIT 1\n```",
            "Verified against a real dogpark console — that's the exact SQL for that exact chain. This laziness is WHY chaining is cheap: each `.where`/`.order`/`.limit` just adds a clause to a query object, and the database only ever runs the fully-assembled version, once.",
          ],
        },
        {
          type: "text",
          md: [
            "## scope — naming a query so you can reuse it",
            "A `scope` gives a chainable query a name, right on the model, so callers don't have to repeat the same `where` everywhere it's needed:",
            "```\nclass Booking < ApplicationRecord\n  scope :upcoming, -> { where(starts_at: Time.current.., status: %w[pending confirmed]) }\nend\n\nBooking.upcoming            # every not-yet-happened, not-cancelled booking\nBooking.upcoming.count      # scopes chain with anything else too\n```",
            "`Time.current..` is a Ruby **beginless-end Range** — every moment from right now onward, with no upper bound. Verified in dogpark: `Booking.upcoming.to_sql` produces `WHERE starts_at >= '...' AND status IN ('pending', 'confirmed')`, and it correctly excluded a past booking and a cancelled one while keeping a real upcoming, confirmed one.",
          ],
        },
        {
          type: "code",
          title: "app/models/booking.rb (scope added)",
          source: String.raw`class Booking < ApplicationRecord
  belongs_to :walker
  belongs_to :dog

  scope :upcoming, -> { where(starts_at: Time.current.., status: %w[pending confirmed]) }
end`,
          caption: "This exact scope was verified against three real bookings in dogpark — one upcoming+confirmed, one past, one cancelled — and `Booking.upcoming.count` returned `1`, correctly keeping only the first.",
        },
        {
          type: "code",
          title: "apps/pawwalk-api/app/models/booking.rb (the real backend)",
          source: String.raw`scope :upcoming, -> { where(starts_at: Time.current..).where.not(status: :cancelled) }`,
          caption: "The REAL PawWalk backend's `upcoming` scope, read straight from `apps/pawwalk-api/app/models/booking.rb`. Same idea, one difference: it chains a second `.where.not(status: :cancelled)` instead of listing allowed statuses — because the real `Booking` has a fifth status, `in_progress`, that also counts as \"upcoming.\" Excluding what you DON'T want scales better than listing every status you DO want as that list grows.",
        },
        {
          type: "text",
          md: [
            "## pluck and count",
            "`.pluck(:name)` skips loading full model objects and asks the database for just that one column, as a plain Ruby array — `Walker.pluck(:name)` returns `[\"Priya\", \"Sam\", \"Ana\"]`, not three `Walker` instances. `.count` asks the database to count matching rows with `SELECT COUNT(*)` rather than loading every row into Ruby just to call `.length` on them. Both verified in dogpark against real data.",
          ],
        },
        {
          type: "quiz",
          q: "`Walker.where(city: \"Austin\").order(:price_per_30_min_cents)` — at what point does Rails actually run a SQL query against the database?",
          choices: [
            "Not until the result is actually used — looped over, `.first`ed, printed, etc. — relations are lazy and only fire once you need real rows",
            "Immediately when `.where` is called, before `.order` even runs",
            "Immediately when the whole chained expression is written, top to bottom",
            "Never — `.where`/`.order` only work on data already loaded into Ruby memory",
          ],
          answer: 0,
          explain: "ActiveRecord relations are lazy: `.where` and `.order` each just add to a description of a query. `.to_sql` even lets you see that description without running it. Only using the result — iterating, calling `.first`, etc. — triggers the actual SQL.",
          nudge: "The lesson showed `.to_sql` as a way to see the query WITHOUT running it — what does that tell you about when the real query fires?",
        },
        {
          type: "exercise",
          title: "Write an upcoming scope",
          prompt: [
            "Add a `scope :upcoming` to `Booking` that finds bookings where `starts_at` is `Time.current..` (now or later) and `status` is in `%w[pending confirmed]`.",
          ],
          starter: String.raw`class Booking < ApplicationRecord
  belongs_to :walker
  belongs_to :dog

  # your code here
end`,
          solution: String.raw`class Booking < ApplicationRecord
  belongs_to :walker
  belongs_to :dog

  scope :upcoming, -> { where(starts_at: Time.current.., status: %w[pending confirmed]) }
end`,
          checks: [
            { re: /scope:upcoming,->\{/, hint: "Start with `scope :upcoming, -> { ... }` — a scope is a name plus a lambda." },
            { re: /where\(starts_at:Time\.current\.\.,status:%w\[pending confirmed\]\)/, hint: "Match the exact condition: `where(starts_at: Time.current.., status: %w[pending confirmed])`." },
          ],
          mustNot: [
            { re: /def upcoming/, hint: "This is a `scope`, not a regular method — use `scope :upcoming, -> { ... }`, not `def upcoming`." },
          ],
          success: "That's a chainable, reusable query living right on the model — `Booking.upcoming` now reads as plainly as the SQL it generates.",
        },
      ],
    },
    {
      id: "seeds-n-plus-one",
      title: "Seeds & the N+1 Trap",
      steps: [
        {
          type: "text",
          md: [
            "## db/seeds.rb — idempotent, on purpose",
            "`db/seeds.rb` is where you describe data every environment needs to boot with something real in it — a few walkers, a dog, a demo booking — run with `bin/rails db:seed`. The trap: if you write plain `Walker.create!(...)`, running `db:seed` twice creates two identical walkers. The fix is `find_or_create_by!`, which looks for a matching row first and only creates one if it's missing:",
            "```\nWalker.find_or_create_by!(name: \"Priya\") do |walker|\n  walker.city = \"Austin\"\n  walker.price_per_30_min_cents = 2400\nend\n```",
            "The block only runs on CREATE, not on an existing match — so re-running `db:seed` after the walker already exists just finds it and moves on, no duplicate, no error. This exact pattern is how the real backend's `apps/pawwalk-api/db/seeds.rb` works too — every `find_or_create_by!` there, none of them plain `create!`.",
          ],
        },
        {
          type: "code",
          title: "db/seeds.rb",
          source: String.raw`[
  { name: "Priya", city: "Austin", price_per_30_min_cents: 2400 },
  { name: "Sam", city: "Austin", price_per_30_min_cents: 2000 }
].each do |attrs|
  Walker.find_or_create_by!(name: attrs[:name]) do |walker|
    walker.city = attrs[:city]
    walker.price_per_30_min_cents = attrs[:price_per_30_min_cents]
  end
end

mochi = Dog.find_or_create_by!(name: "Mochi") do |dog|
  dog.breed = "Shiba Inu"
  dog.size = "small"
end

priya = Walker.find_by!(name: "Priya")

Booking.find_or_create_by!(walker: priya, dog: mochi) do |booking|
  booking.starts_at = 1.day.from_now
  booking.price_cents = priya.price_per_30_min_cents
end`,
          caption: "Verified: running `bin/rails db:seed` twice in a row in dogpark left the counts unchanged — 2 walkers, 1 dog, 1 booking — no duplicates on the second run.",
        },
        {
          type: "text",
          md: [
            "## The N+1 trap",
            "Here's a loop that looks completely innocent:",
            "```\nBooking.all.each { |b| puts b.walker.name }\n```",
            "For every booking, `b.walker` fires its OWN separate query to fetch that one walker. Ten bookings means one query for the bookings, plus ten MORE queries — one per walker. That's the **N+1 problem**: 1 query to get the list, N more queries, one per row, to get something each row needed. It's invisible in dev with three rows and brutal in production with three thousand.",
          ],
        },
        {
          type: "code",
          title: "Real SQL log — the N+1 version",
          source: String.raw`Booking Load (0.1ms)  SELECT "bookings".* FROM "bookings"
Walker Load (0.1ms)  SELECT "walkers".* FROM "walkers" WHERE "walkers"."id" = 4 LIMIT 1
Priya
Walker Load (0.0ms)  SELECT "walkers".* FROM "walkers" WHERE "walkers"."id" = 6 LIMIT 1
Ana`,
          caption: "Trimmed, real log output from `Booking.all.each { |b| puts b.walker.name }` against two bookings in dogpark. One `bookings` query, then ONE MORE `walkers` query per booking — exactly the N+1 shape, caught in the act.",
        },
        {
          type: "text",
          md: [
            "## The fix: includes",
            "`.includes(:walker)` tells Rails up front: \"I'm about to need every booking's walker — go get them all together.\" Rails runs one query for the bookings, then ONE more query for every walker those bookings need, batched with a single `WHERE id IN (...)` — not one query per row:",
            "```\nBooking.includes(:walker).each { |b| puts b.walker.name }\n```",
          ],
        },
        {
          type: "code",
          title: "Real SQL log — the includes version",
          source: String.raw`Booking Load  SELECT "bookings".* FROM "bookings"
Walker Load  SELECT "walkers".* FROM "walkers" WHERE "walkers"."id" IN (4, 6)
Priya
Ana`,
          caption: "Same two bookings, same result printed — but now exactly TWO queries total, no matter how many bookings there are: one for bookings, one batched `IN (...)` for every walker they need. This exact `.includes` call ships in the real `BookingsController` you'll build in module 11.",
        },
        {
          type: "quiz",
          q: "`Booking.all.each { |b| puts b.walker.name }` runs against 500 bookings, each with a different walker. Roughly how many SQL queries does that loop fire?",
          choices: [
            "About 501 — one to load the bookings, plus one more for EACH booking's `.walker` call",
            "Exactly 1 — ActiveRecord batches all the walker lookups automatically by default",
            "Exactly 2 — Rails always batches associations unless told not to",
            "0 — `.walker` is cached from the `belongs_to` declaration alone",
          ],
          answer: 0,
          explain: "Without `.includes`, every `.walker` call inside the loop is its own separate query — that's the N+1 problem by definition: 1 query for the list, N more for each row's association. `.includes(:walker)` is what collapses this down to 2 total queries.",
          nudge: "The lesson's SQL log showed exactly this shape with 2 bookings and 2 walker queries — scale that pattern up to 500.",
        },
        {
          type: "exercise",
          title: "Capstone: rewrite the N+1 loop",
          prompt: [
            "Rewrite the loop below to avoid the N+1 problem — load every booking's walker in one extra batched query instead of one query per booking.",
          ],
          starter: String.raw`Booking.all.each { |b| puts b.walker.name }
# your code here (replace the line above)`,
          solution: String.raw`Booking.includes(:walker).each { |b| puts b.walker.name }`,
          checks: [
            { re: /Booking\.includes\(:walker\)\.each\{\|b\|puts b\.walker\.name\}/, hint: "Swap `Booking.all` for `Booking.includes(:walker)`, keeping the same `.each { |b| puts b.walker.name }` block." },
          ],
          mustNot: [
            { re: /Booking\.all\.each\{\|b\|puts b\.walker\.name\}/, hint: "That's the N+1 version from the prompt — swap `.all` for `.includes(:walker)`." },
          ],
          success: "One line changed, N fewer queries. This is the single most common performance fix in any Rails app — you'll reach for `.includes` constantly once real traffic shows up in module 11.",
        },
      ],
    },
  ],
});
