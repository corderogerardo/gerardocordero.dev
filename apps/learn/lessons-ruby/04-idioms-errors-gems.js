window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "idioms-errors-gems",
  title: "Idioms, Errors & Gems",
  emoji: "🧰",
  lang: "ruby",
  lessons: [
    {
      id: "truthiness-guard-clauses",
      title: "Truthiness & Guard Clauses",
      steps: [
        {
          type: "text",
          md: [
            "## Quick recap: only two falsy values",
            "Back in module 01 you met Ruby's falsy trap: **only `nil` and `false` are falsy.** `0`, `\"\"`, and empty arrays are all truthy — the opposite of JS and Python. That one fact is why the idioms in this lesson read as clean as they do: a bare `if booking` genuinely means \"booking is not nil and not false,\" nothing fuzzier.",
            "This module is the last stop before Rails. Everything here is about reading real Ruby comfortably — the small idioms that show up in almost every method you'll open in `apps/pawwalk-api`.",
          ],
        },
        {
          type: "text",
          md: [
            "## Guard clauses: bail out early, in plain English",
            "A **guard clause** is an early return at the top of a method that handles the \"can't proceed\" case first, so the rest of the method can assume everything's fine. Ruby's trailing `unless`/`if` (module 01) makes these read almost like English sentences:",
            "```\ndef confirm(booking)\n  return \"no booking\" unless booking\n  raise BookingError, \"already cancelled\" if booking.cancelled?\n\n  \"confirmed\"\nend\n```",
            "`return unless booking` — return, unless there's a booking. `raise ... if booking.cancelled?` — raise, if it's cancelled. Compare that to nesting the happy path inside `if booking ... if !booking.cancelled? ... end end` — guard clauses flatten the method instead of indenting it, which is why experienced Rubyists reach for them by reflex.",
          ],
        },
        {
          type: "code",
          title: "playground/guard_clauses.rb",
          source: String.raw`class BookingError < StandardError; end

def confirm(booking)
  return "no booking" unless booking
  raise BookingError, "already cancelled" if booking == :cancelled

  "confirmed"
end

puts confirm(nil)
puts confirm(:pending)`,
          caption: "Run with `ruby playground/guard_clauses.rb` — prints `no booking` then `confirmed`. Two guard clauses up top, the happy path at the bottom with nothing nested inside an `if`.",
        },
        {
          type: "text",
          md: [
            "## `||=` — assign only if nil or false",
            "`||=` (\"or-equals\") is everywhere in real Ruby, and it's easy to misread as \"assign if not already set.\" What it ACTUALLY does is plain `||` plus assignment: `@walkers ||= load_walkers` expands to `@walkers = @walkers || load_walkers`. Because of the falsy rule above, that means **it only reassigns when the current value is `nil` or `false`** — not merely \"unset\" in some looser sense.",
            "```\n@walkers = nil\n@walkers ||= load_walkers   # @walkers is nil, so load_walkers runs\n@walkers ||= load_walkers   # @walkers is already an array (truthy), skipped\n```",
            "This is the classic **memoization** idiom: compute something expensive once, cache it in an instance variable, and every later call is a no-op. The honest caveat: if the cached value could legitimately BE `false` (a boolean flag, say), `||=` would recompute every time — for that narrow case you'd check `defined?` or a dedicated `@loaded` flag instead. For anything that returns an object, an array, or a hash, `||=` is exactly right.",
          ],
        },
        {
          type: "code",
          title: "playground/memoize.rb",
          source: String.raw`def load_walkers
  puts "loading from the database..."
  ["Priya", "Sam"]
end

@walkers ||= load_walkers
@walkers ||= load_walkers
puts @walkers.inspect`,
          caption: "Run it — `\"loading from the database...\"` prints only ONCE, even though `||=` appears on two lines. The second call finds `@walkers` already truthy and skips `load_walkers` entirely.",
        },
        {
          type: "quiz",
          q: "`@cache ||= compute_value` — under what condition does `compute_value` actually run?",
          choices: [
            "Only when `@cache` is currently `nil` or `false`",
            "Every single time this line executes, unconditionally",
            "Only the very first time the program runs, ever",
            "Only when `@cache` is exactly `0` or `\"\"`",
          ],
          answer: 0,
          explain: "`||=` expands to `@cache = @cache || compute_value`. `||` short-circuits on anything truthy, and Ruby's only falsy values are `nil` and `false` — so `compute_value` runs exactly when `@cache` is one of those two.",
          nudge: "`||=` is shorthand for `x = x || y`. Which two values make `x || y` fall through to evaluating `y`?",
        },
        {
          type: "exercise",
          title: "Guard a zero-minute booking",
          prompt: [
            "Write `def book_walk(minutes)` with a guard clause: `return \"invalid\" unless minutes` — no, wait, use the falsy rule directly: `return \"invalid\" if minutes.zero?`. If it passes, return the string `\"booked\"` as the last expression (no explicit `return`).",
          ],
          starter: String.raw`def book_walk(minutes)
  # your code here
end`,
          solution: String.raw`def book_walk(minutes)
  return "invalid" if minutes.zero?

  "booked"
end`,
          checks: [
            { re: /def book_walk\(minutes\)/, hint: "Keep the exact signature: `def book_walk(minutes)`." },
            { re: /return"invalid"if minutes\.zero\?/, hint: "Guard clause first: `return \"invalid\" if minutes.zero?`." },
            { re: /"booked"/, hint: "End the method with the bare string `\"booked\"` — no `return` needed, it's the last expression." },
          ],
          mustNot: [
            { re: /return"booked"/, hint: "Leave `return` off the last line — idiomatic Ruby lets the final expression return itself." },
          ],
          success: "A guard clause up top, an implicit return at the bottom — this is the shape of most real-world Ruby methods you're about to read.",
        },
      ],
    },
    {
      id: "safe-navigation-duck-typing",
      title: "Safe Navigation & Duck Typing",
      steps: [
        {
          type: "text",
          md: [
            "## `&.` — safe navigation",
            "You've written `booking&.walker&.name` conceptually already if you've used Swift's `?.` or JS's `?.` — Ruby's `&.` (the \"safe navigation operator\") is the same idea: call the method **only if** the thing on the left isn't `nil`; if it IS `nil`, the whole expression short-circuits to `nil` instead of raising.",
            "```\nbooking&.walker&.name\n```",
            "Read that chain left to right: if `booking` is `nil`, stop, result is `nil`. Otherwise call `.walker` — if THAT'S `nil`, stop, result is `nil`. Otherwise call `.name`. One typo-proof line instead of three nested nil-checks.",
          ],
        },
        {
          type: "text",
          md: [
            "## Compare: Swift's `?.`, JS's `?.`, Ruby's `&.`",
            "All three exist for the exact same reason and behave almost identically — chain safely through something that might be absent. The syntax is the only difference: Swift and JS spell it `?.`, Ruby spells it `&.` (think \"and, if not nil\"). If you reach for `?.` out of habit in a `.rb` file, that's a real syntax error in Ruby, not a typo.",
            "One plain `.` anywhere in the chain reintroduces the crash risk: `booking.walker&.name` still blows up with `NoMethodError` if `booking` itself is `nil` — the `&.` only protects the call it's directly attached to.",
          ],
        },
        {
          type: "code",
          title: "playground/safe_navigation.rb",
          source: String.raw`class Walker
  attr_accessor :name
  def initialize(name)
    @name = name
  end
end

class Booking
  attr_accessor :walker
  def initialize(walker = nil)
    @walker = walker
  end
end

booking = Booking.new(Walker.new("Priya"))
puts booking&.walker&.name

unassigned = Booking.new
puts unassigned&.walker&.name.inspect

puts nil&.walker&.name.inspect`,
          caption: "Run it — prints `Priya`, then `nil`, then `nil`. Neither missing case raises `NoMethodError`; the chain just quietly resolves to `nil`.",
        },
        {
          type: "text",
          md: [
            "## Duck typing: no interfaces, no protocols",
            "Swift has `protocol`. Something conforms to `Walkable` by explicitly declaring it does. Ruby has no such contract at all — there's no `interface` keyword, no protocol declaration. Ruby asks a much looser question: **\"does this object respond to the method I'm about to call?\"** That's **duck typing** — \"if it walks like a duck and quacks like a duck, treat it as a duck,\" regardless of its class.",
            "```\ndef make_it_speak(animal)\n  animal.respond_to?(:speak) ? animal.speak : \"...\"\nend\n```",
            "`respond_to?(:speak)` asks the object directly, at runtime, whether it has a `speak` method — no shared ancestor or declared protocol required. Two totally unrelated classes can both work with `make_it_speak` as long as each defines `speak`.",
          ],
        },
        {
          type: "code",
          title: "playground/duck_typing.rb",
          source: String.raw`class Dog
  def speak
    "Woof!"
  end
end

class Duck
  def speak
    "Quack!"
  end
end

def make_it_speak(animal)
  animal.respond_to?(:speak) ? animal.speak : "..."
end

puts make_it_speak(Dog.new)
puts make_it_speak(Duck.new)
puts make_it_speak(42)`,
          caption: "`Dog` and `Duck` share no common ancestor besides `Object`, and there's no `Speaker` protocol anywhere — `make_it_speak` doesn't care. It only cares whether `.speak` responds. `42` doesn't, so it falls through to `\"...\"`.",
        },
        {
          type: "text",
          md: [
            "## Why Ruby people don't miss static types (mostly)",
            "Coming from Swift's compiler catching type errors before your app even runs, duck typing can feel scary — what stops you from calling `.speak` on something that doesn't have it? Answer: nothing, until you run it, and then you get a `NoMethodError` with the exact line number. In practice, Ruby's huge test-culture (every gem, every Rails app leans hard on specs) catches what the compiler would have — tests run constantly, so the feedback loop stays fast even without types.",
            "Honest caveat: at real scale, \"no types at all\" stops scaling past a certain team size. Large Ruby codebases increasingly bolt on gradual typing — **Sorbet** or **RBS** — to get IDE autocomplete and some compile-time checking back. You don't need either yet; just recognize the names if you see `sig { ... }` blocks or `.rbs` files later in your career.",
          ],
        },
        {
          type: "quiz",
          q: "`booking.walker&.name` — `booking` turns out to be `nil`. What happens?",
          choices: [
            "`NoMethodError` — the plain `.walker` call still runs on `nil` and crashes; `&.` only guarded the `.name` call",
            "Returns `nil` safely, same as if `&.` had guarded the whole chain",
            "Returns an empty string `\"\"`",
            "Raises a `SyntaxError` because `&.` can't follow a plain `.`",
          ],
          answer: 0,
          explain: "`&.` only protects the call it's directly attached to. `booking.walker` is a plain dot — if `booking` is `nil`, THAT call crashes with `NoMethodError` before `&.name` is ever reached. Every hop in a chain that might be nil needs its own `&.`.",
          nudge: "Look at which dot in `booking.walker&.name` is plain, and which one has the safe-navigation `&`.",
        },
        {
          type: "exercise",
          title: "Chain safely, then duck-type",
          prompt: [
            "Given `booking = nil`, print `booking&.walker&.name.inspect` with `puts`.",
            "Then define `def can_bark?(animal)` returning `animal.respond_to?(:bark)` as the last expression — no `return`.",
          ],
          starter: String.raw`booking = nil
# your code here
`,
          solution: String.raw`booking = nil
puts booking&.walker&.name.inspect

def can_bark?(animal)
  animal.respond_to?(:bark)
end`,
          checks: [
            { re: /puts booking&\.walker&\.name\.inspect/, hint: "Chain safe navigation through both hops: `booking&.walker&.name`, then `.inspect` to see `nil` printed clearly." },
            { re: /def can_bark\?\(animal\)/, hint: "Method names can end in `?` — keep it: `def can_bark?(animal)`." },
            { re: /animal\.respond_to\?\(:bark\)/, hint: "Ask the object directly: `animal.respond_to?(:bark)`." },
          ],
          mustNot: [
            { re: /booking\.walker/, hint: "Use `&.`, not a plain `.`, right after `booking` — it's `nil` here and a plain dot would crash." },
          ],
          success: "Safe navigation stops a nil chain from crashing; `respond_to?` is duck typing's entire vocabulary in one method call.",
        },
      ],
    },
    {
      id: "errors-raise-rescue",
      title: "Errors: raise & rescue",
      steps: [
        {
          type: "text",
          md: [
            "## raise — throwing on purpose",
            "`raise` is Ruby's version of Swift's `throw` or Python's `raise` — you already know the shape. Give it an error class and a message:",
            "```\nraise ArgumentError, \"minutes must be positive\"\n```",
            "`ArgumentError` is one of many built-in error classes (`TypeError`, `ZeroDivisionError`, `NoMethodError`, and more) — pick the one that best describes what went wrong. Unhandled, `raise` crashes the program with that message and a backtrace, same as an uncaught exception in any language you know.",
          ],
        },
        {
          type: "text",
          md: [
            "## begin / rescue / ensure / end",
            "Ruby's try/catch is `begin` / `rescue` / `end`, with an optional `ensure` for cleanup that always runs — Swift's `defer`, Python's `finally`, same idea:",
            "```\nbegin\n  book_walk(0)\nrescue BookingError => e\n  puts \"Booking failed: #{e.message}\"\nensure\n  puts \"done trying\"\nend\n```",
            "`rescue BookingError => e` catches only that class (and its subclasses) and binds the error object to `e` so you can read `e.message`. A `TypeError` raised inside the same `begin` block would NOT be caught here and would keep crashing upward — same \"catch only what you understand\" discipline you saw in Python's `except ValueError`.",
          ],
        },
        {
          type: "code",
          title: "playground/rescue_basics.rb",
          source: String.raw`class BookingError < StandardError; end

def book_walk(minutes)
  raise BookingError, "can't book a 0-minute walk" if minutes.zero?

  "booked #{minutes} minutes"
end

begin
  puts book_walk(30)
  puts book_walk(0)
rescue BookingError => e
  puts "Booking failed: #{e.message}"
ensure
  puts "done trying"
end`,
          caption: "Run it — prints `booked 30 minutes`, then the rescue fires on the second call (`Booking failed: can't book a 0-minute walk`), and `done trying` prints no matter what, from `ensure`.",
        },
        {
          type: "text",
          md: [
            "## Method-level rescue — no begin needed",
            "A method definition already has an implicit block, so Ruby lets you attach `rescue` directly to `def`/`end` without wrapping the body in `begin`/`end` at all:",
            "```\ndef risky_book(minutes)\n  raise ArgumentError, \"minutes must be positive\" if minutes <= 0\n\n  \"booked #{minutes} minutes\"\nrescue ArgumentError => e\n  \"error: #{e.message}\"\nend\n```",
            "You'll see this constantly in real Rails controller actions — it's shorter than nesting a `begin` block inside a method that's already a block.",
          ],
        },
        {
          type: "text",
          md: [
            "## Custom error classes",
            "`class BookingError < StandardError; end` — inheritance again, from module 03. `StandardError` is the base class almost every error you write should inherit from (never inherit straight from `Exception`, which also covers things like a program being killed — you don't want to accidentally catch those). A custom class with no body at all still works: it inherits everything it needs, including `.message` and the `raise ClassName, \"text\"` shorthand.",
          ],
        },
        {
          type: "quiz",
          q: "Inside `rescue BookingError => e`, what does `e` refer to?",
          choices: [
            "The actual error object that was raised — you can call `e.message` on it",
            "The literal string `\"BookingError\"`",
            "`true` if an error occurred, `false` otherwise",
            "Nothing — `e` is unused syntax left over from older Ruby",
          ],
          answer: 0,
          explain: "`rescue SomeError => e` binds the raised error INSTANCE to `e`, so `e.message` reads whatever text was passed to `raise`. It's the same role as `except ValueError as e:` in Python or `catch let error` in Swift.",
          nudge: "You called `e.message` in the sample above — what kind of thing has a `.message` method?",
        },
        {
          type: "exercise",
          title: "Refuse a zero-minute booking",
          prompt: [
            "Define `class BookingError < StandardError; end`.",
            "Define `def book_walk(minutes)` that raises `BookingError, \"can't book a 0-minute walk\"` if `minutes.zero?`, otherwise returns `\"booked\"` as the last expression.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`class BookingError < StandardError; end

def book_walk(minutes)
  raise BookingError, "can't book a 0-minute walk" if minutes.zero?

  "booked"
end`,
          checks: [
            { re: /class BookingError<StandardError;end/, hint: "Define the custom error class: `class BookingError < StandardError; end`." },
            { re: /def book_walk\(minutes\)/, hint: "Keep the exact signature: `def book_walk(minutes)`." },
            { re: /raise BookingError,"can't book a 0-minute walk"if minutes\.zero\?/, hint: "Raise with the class and message, guarded by a trailing `if`: `raise BookingError, \"can't book a 0-minute walk\" if minutes.zero?`." },
          ],
          mustNot: [
            { re: /rescue/, hint: "This method only needs to raise — no `rescue` required here, the caller decides how to handle it." },
          ],
          success: "A custom error class plus a guard clause that raises it — this is exactly how PawWalk's real backend will reject an invalid booking.",
        },
      ],
    },
    {
      id: "files-json",
      title: "Files & JSON",
      steps: [
        {
          type: "text",
          md: [
            "## Writing and reading a file",
            "`File.write(path, contents)` writes a string to disk in one call — no explicit open/close ceremony for the simple case. `File.read(path)` reads the whole file back as one string:",
            "```\nFile.write(\"notes.txt\", \"hello\")\nputs File.read(\"notes.txt\")   # hello\n```",
            "Both are class methods on `File` — no block, no `with`/`defer` needed for a one-shot write-then-read. (Ruby also has a block form, `File.open(path) { |f| ... }`, for streaming line by line, but `File.write`/`File.read` cover almost everything you'll need for now.)",
          ],
        },
        {
          type: "text",
          md: [
            "## require \"json\"",
            "JSON support isn't loaded by default — you opt in with `require \"json\"` at the top of the file, same idea as Python's `import json`. That gives you two methods, mirroring `json.dumps`/`json.loads` exactly:",
            "```\nrequire \"json\"\n\nJSON.generate(data)   # Ruby object -> JSON string\nJSON.parse(text)      # JSON string -> Ruby object\n```",
          ],
        },
        {
          type: "text",
          md: [
            "## symbolize_names: true",
            "By default, `JSON.parse` hands back a hash with **string** keys — `{\"dog\"=>\"Mochi\"}` — because JSON itself has no concept of symbols, only text. Pass `symbolize_names: true` and Ruby converts every key to a symbol as it parses, so you get `{dog: \"Mochi\"}` and can write `booking[:dog]` instead of `booking[\"dog\"]`:",
            "```\nJSON.parse(text, symbolize_names: true)\n```",
            "This matters because symbol keys are the idiom (module 03's `size: :large` pattern) — without this option, every hash coming back from JSON would clash with how the rest of your Ruby code expects to index a hash.",
          ],
        },
        {
          type: "code",
          title: "playground/bookings_roundtrip.rb",
          source: String.raw`require "json"

bookings = [
  { id: 1, dog: "Mochi", price_cents: 2500, status: "confirmed" },
  { id: 2, dog: "Rex", price_cents: 3000, status: "pending" },
  { id: 3, dog: "Fido", price_cents: 2000, status: "confirmed" },
]

File.write("bookings.json", JSON.generate(bookings))

data = File.read("bookings.json")
loaded = JSON.parse(data, symbolize_names: true)

confirmed_total = loaded.select { |b| b[:status] == "confirmed" }.sum { |b| b[:price_cents] }
puts "Confirmed total: #{confirmed_total} cents"`,
          caption: "Run with `ruby playground/bookings_roundtrip.rb` — writes the array as JSON, reads it back, and prints `Confirmed total: 4500 cents` (2500 + 2000, skipping the pending one). `.select` then `.sum` is the same block-chaining idiom from module 02.",
        },
        {
          type: "text",
          md: [
            "## Foreshadowing Rails",
            "Every bit of ceremony in this lesson — `require \"json\"`, `symbolize_names: true`, manually looping to sum a field — Rails does FOR you once module 08 introduces controllers and `render json: bookings`. You're learning the manual version first so the automatic version doesn't feel like magic later.",
          ],
        },
        {
          type: "quiz",
          q: "Why pass `symbolize_names: true` to `JSON.parse`?",
          choices: [
            "So parsed hash keys come back as symbols (`:dog`) instead of strings (`\"dog\"`), matching Ruby's own symbol-key idiom",
            "It's required — `JSON.parse` raises an error without it",
            "It makes parsing run faster with no effect on the returned keys",
            "It converts all the VALUES to symbols too, not just the keys",
          ],
          answer: 0,
          explain: "JSON text has no symbol type — every key parses as a string by default. `symbolize_names: true` converts just the keys to symbols as they're parsed, matching how Ruby code idiomatically indexes hashes (`booking[:dog]`, not `booking[\"dog\"]`). Values are untouched.",
          nudge: "The lesson contrasted `{\"dog\"=>\"Mochi\"}` against `{dog: \"Mochi\"}` — which one does `symbolize_names: true` produce?",
        },
        {
          type: "exercise",
          title: "Round-trip a single booking",
          prompt: [
            "`require \"json\"` is already loaded. Given `booking = { id: 9, dog: \"Fido\", price_cents: 2000 }`, write it to `\"one_booking.json\"` with `File.write` and `JSON.generate`.",
            "Then read it back into `loaded` with `File.read` and `JSON.parse(..., symbolize_names: true)`, and print `loaded[:dog]` with `puts`.",
          ],
          starter: String.raw`require "json"
booking = { id: 9, dog: "Fido", price_cents: 2000 }
# your code here
`,
          solution: String.raw`require "json"
booking = { id: 9, dog: "Fido", price_cents: 2000 }
File.write("one_booking.json", JSON.generate(booking))

loaded = JSON.parse(File.read("one_booking.json"), symbolize_names: true)
puts loaded[:dog]`,
          checks: [
            { re: /File\.write\("one_booking\.json",JSON\.generate\(booking\)\)/, hint: "Write the JSON string: `File.write(\"one_booking.json\", JSON.generate(booking))`." },
            { re: /JSON\.parse\(File\.read\("one_booking\.json"\),symbolize_names:true\)/, hint: "Parse it back with the option: `JSON.parse(File.read(\"one_booking.json\"), symbolize_names: true)`." },
            { re: /puts loaded\[:dog\]/, hint: "Index with a symbol key and print it: `puts loaded[:dog]`." },
          ],
          success: "That's the full manual round-trip — save, load, symbolize — that Rails will automate for you starting in module 08.",
        },
      ],
    },
    {
      id: "gems-bundler",
      title: "Gems & Bundler",
      steps: [
        {
          type: "text",
          md: [
            "## What's a gem?",
            "A **gem** is Ruby's unit of shared, packaged code — same role as an npm package or a Python wheel. Anyone can publish one; `rails` itself is a gem, and it depends on dozens more underneath it. Install one manually with `gem install some_gem`, then load it in code with `require \"some_gem\"` — you've already done this with `require \"json\"`, which happens to ship in Ruby's standard library and needs no separate install.",
          ],
        },
        {
          type: "text",
          md: [
            "## A project's Gemfile",
            "A single `gem install` works for poking around, but a real project needs everyone on the team (and CI, and production) running the EXACT same versions. That's what a **Gemfile** is: a plain-text list of the gems a project depends on, read by a tool called **Bundler**.",
            "```\nsource \"https://rubygems.org\"\n\ngem \"rails\", \"~> 8.1.3\"\ngem \"sqlite3\", \">= 2.1\"\n```",
            "`bundle install` reads the `Gemfile`, resolves a compatible set of exact versions for every gem (and every gem's own dependencies), installs them, and writes the result to `Gemfile.lock`. That lock file is the direct equivalent of `package-lock.json` / `pnpm-lock.yaml` — everyone who runs `bundle install` against the same lock file gets byte-identical versions, no surprises from a dependency quietly shipping a breaking update.",
          ],
        },
        {
          type: "text",
          md: [
            "## Gemfile vs. package.json — the mapping",
            "- **`Gemfile`** ↔ `package.json`'s `dependencies` — the human-edited wishlist of what you depend on, with version constraints (`~> 8.1.3` means \"8.1.3 or higher, but not 8.2\").\n- **`Gemfile.lock`** ↔ `package-lock.json` / `pnpm-lock.yaml` — the exact resolved versions, committed to the repo, never hand-edited.\n- **`bundle install`** ↔ `pnpm install` — reads the manifest, resolves, installs, writes/updates the lock file.",
          ],
        },
        {
          type: "code",
          title: "apps/pawwalk-api/Gemfile",
          source: String.raw`source "https://rubygems.org"

gem "rails", "~> 8.1.3"
gem "sqlite3", ">= 2.1"
gem "puma", ">= 5.0"

gem "bcrypt", "~> 3.1.7"

gem "solid_cache"
gem "solid_queue"
gem "solid_cable"

gem "bootsnap", require: false

gem "kamal", require: false

gem "thruster", require: false

group :development, :test do
  gem "debug", platforms: %i[ mri windows ], require: false
  gem "rubocop-rails-omakase", require: false
end`,
          caption: "This is the actual backend you'll build; look: rails, sqlite3, solid_queue, kamal — by module 15 you'll know every line. `group :development, :test do ... end` scopes gems to those environments only, so production never installs your debugger.",
        },
        {
          type: "text",
          md: [
            "## require vs. Bundler.require",
            "A gem still needs `require \"gem_name\"` somewhere to actually load into memory — a `Gemfile` entry only makes it AVAILABLE, it doesn't load it automatically by itself. Rails apps handle this for you once, in `config/boot.rb`, with `Bundler.require(*Rails.groups)`, which loads every gem in the `Gemfile` in one shot. You won't write that line yourself in this course, but now you know why a Rails app never seems to `require` its own gems one by one.",
          ],
        },
        {
          type: "quiz",
          q: "What's the direct Ruby equivalent of `package-lock.json` / `pnpm-lock.yaml`?",
          choices: [
            "`Gemfile.lock` — the exact resolved versions, written by `bundle install`, committed but never hand-edited",
            "`Gemfile` — the human-edited list of dependencies",
            "There isn't one — Ruby doesn't lock versions",
            "`config/boot.rb`",
          ],
          answer: 0,
          explain: "`Gemfile` is the wishlist (like `package.json`'s dependencies); `Gemfile.lock` is the exact resolved tree Bundler computed, guaranteeing everyone installs identical versions — exactly the role a JS lockfile plays.",
          nudge: "Which file gets WRITTEN BY the install command, rather than hand-edited by a developer?",
        },
        {
          type: "exercise",
          title: "Read the Gemfile",
          prompt: [
            "No code to write this time — instead, answer in a comment. Set `answer` to a string naming which gem in the Gemfile above handles background jobs (hint: it's one of the `solid_*` gems). Assign it, then `puts answer`.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`answer = "solid_queue"
puts answer`,
          checks: [
            { re: /answer="solid_queue"/, hint: "The Gemfile lists three `solid_*` gems — the one for background jobs is `solid_queue`. Assign it: `answer = \"solid_queue\"`." },
            { re: /puts answer/, hint: "Print it: `puts answer`." },
          ],
          success: "solid_queue is Rails 8's built-in, database-backed job queue — no separate Redis needed. You'll use it directly once background jobs show up in module 12.",
        },
      ],
    },
    {
      id: "rubocop-reads-well",
      title: "RuboCop & Writing Ruby that Reads Well",
      steps: [
        {
          type: "text",
          md: [
            "## What a linter/formatter actually does",
            "A **linter** reads your code without running it and flags patterns that are likely bugs or against convention — unused variables, dangerous patterns. A **formatter** rewrites whitespace, quote style, and layout to a consistent shape automatically. Some tools do both at once. You've used this idea before, even if the names were different (ESLint + Prettier in the portfolio app's own toolchain).",
          ],
        },
        {
          type: "text",
          md: [
            "## RuboCop + rails-omakase",
            "**RuboCop** is Ruby's standard linter/formatter. Out of the box it's *extremely* configurable — hundreds of rules, all individually toggleable — which historically meant every team argued about its config file. Rails 8 ships a fix: **`rubocop-rails-omakase`**, a single pre-picked rule set (\"omakase\" = chef's choice, no menu to argue over) that DHH's team curated for how Rails itself is written. You already saw it in the Gemfile: `gem \"rubocop-rails-omakase\", require: false` in the `development, test` group — that's exactly the style `apps/pawwalk-api` will use.",
            "Run it with `bundle exec rubocop` (check only) or `bundle exec rubocop -a` (auto-fix what it safely can) once a real Rails project exists.",
          ],
        },
        {
          type: "text",
          md: [
            "## Idiom upgrade 1: for-loop -> each",
            "```\n# before\nfor walker in walkers\n  puts walker\nend\n\n# after\nwalkers.each { |walker| puts walker }\n```",
            "Both run every element. `each` is preferred because it doesn't leak `walker` into the surrounding scope after the loop ends, and because almost every Ruby collection method (`.map`, `.select`, `.sum` — module 02) follows the same block shape, so `each` reads as \"one of a consistent family\" instead of a special case.",
          ],
        },
        {
          type: "text",
          md: [
            "## Idiom upgrade 2: if !x -> unless x",
            "```\n# before\nif !rating.nil?\n  puts \"has rating\"\nend\n\n# after\nputs \"has rating\" unless rating.nil?\n```",
            "`unless` (module 01) reads as \"if not\" without the visual noise of a `!`, and the trailing form collapses three lines into one for a single statement.",
          ],
        },
        {
          type: "text",
          md: [
            "## Idiom upgrade 3: explicit return -> implicit",
            "```\n# before\ndef price_label(cents)\n  return \"$#{cents / 100} / 30 min\"\nend\n\n# after\ndef price_label(cents)\n  \"$#{cents / 100} / 30 min\"\nend\n```",
            "Module 04's opening lesson already leaned on this: the last expression a method evaluates IS its return value, so a bare `return` at the very end of a method is pure noise RuboCop will flag.",
          ],
        },
        {
          type: "text",
          md: [
            "## Idiom upgrade 4: string keys -> symbols",
            "```\n# before\ndog = { \"name\" => \"Mochi\", \"size\" => \"small\" }\n\n# after\ndog = { name: \"Mochi\", size: :small }\n```",
            "Module 01's rule applies here directly: a string is for text a human reads or that came from outside your program; a symbol is for an internal label your own code compares against. A hash literal's KEYS are always internal labels your code wrote — so they're a symbol by default, reserving string keys for data that genuinely arrived as text (like a parsed JSON payload before you symbolize it).",
          ],
        },
        {
          type: "code",
          title: "playground/idiom_upgrades.rb",
          source: String.raw`walkers = ["Priya", "Sam", "Ana"]
walkers.each { |walker| puts walker }

rating = nil
puts "has rating" unless rating.nil?

def price_label(cents)
  "$#{cents / 100} / 30 min"
end
puts price_label(2500)

dog = { name: "Mochi", size: :small }
puts dog[:name]`,
          caption: "Run it — every idiom upgrade from this lesson in one file, all real, running Ruby: `each`, `unless`, implicit return, symbol keys.",
        },
        {
          type: "quiz",
          q: "Why does RuboCop (with rails-omakase) flag `return \"value\"` as the LAST line of a method body?",
          choices: [
            "Because a method's last evaluated expression is already its return value — the explicit `return` is redundant noise",
            "Because `return` is deprecated and no longer works in Ruby 3.4",
            "Because RuboCop only allows `return` inside guard clauses, never at the end",
            "Because it changes the method's return type",
          ],
          answer: 0,
          explain: "Idiomatic Ruby relies on the implicit-return rule from module 04's first lesson: the last expression evaluated is automatically returned. Writing `return` there adds a keyword that changes nothing, which the omakase style guide flags as unnecessary.",
          nudge: "What did the very first lesson of this module call \"the single biggest habit to build\" about how Ruby methods return values?",
        },
        {
          type: "exercise",
          title: "Capstone: make it idiomatic",
          prompt: [
            "Rewrite `find_walker` idiomatically: replace the clunky `if walkers[id] != nil` with a guard clause (`return nil unless walkers[id]`), and replace the explicit `return walkers[id]` at the end with an implicit return.",
            "Keep the method signature and the `@cache` memoization line (`@cache ||= {}`) exactly as given.",
          ],
          starter: String.raw`def find_walker(walkers, id)
  @cache ||= {}
  # your code here
end`,
          solution: String.raw`def find_walker(walkers, id)
  @cache ||= {}
  return nil unless walkers[id]

  walkers[id]
end`,
          checks: [
            { re: /def find_walker\(walkers,id\)/, hint: "Keep the exact signature: `def find_walker(walkers, id)`." },
            { re: /@cache\|\|=\{\}/, hint: "Keep the memoization line as given: `@cache ||= {}`." },
            { re: /return nil unless walkers\[id\]/, hint: "Guard clause: `return nil unless walkers[id]`." },
            { re: /walkers\[id\]\s*end/, hint: "End the method with the bare expression `walkers[id]` — no `return` keyword." },
          ],
          mustNot: [
            { re: /return walkers\[id\]/, hint: "Drop `return` from the final line — let `walkers[id]` be the last expression instead." },
            { re: /if walkers\[id\]!=nil/, hint: "Replace the `if ... != nil` check with a guard clause using `unless`." },
          ],
          success: "Guard clause plus implicit return plus `||=` memoization — every idiom this module taught, in four lines. This is what fluent, RuboCop-clean Ruby looks like, and you just wrote it.",
        },
      ],
    },
  ],
});
