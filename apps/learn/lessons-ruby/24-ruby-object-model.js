window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "ruby-object-model",
  title: "The Ruby Object Model",
  emoji: "🧬",
  lang: "ruby",
  lessons: [
    {
      id: "messages-and-arguments",
      title: "Messages & Arguments",
      steps: [
        {
          type: "text",
          md: [
            "## Why this module exists",
            "You've written classes, blocks, and a whole Rails backend already. This tier goes one layer down: *how Ruby actually works* — how a method call is resolved, what `self` is at every moment, where methods are found, and (in module 27) how Rails builds its \"magic\" out of plain Ruby. Senior interviews live in this layer. When someone asks \"what happens when you call `booking.confirmed?`\", the answer isn't \"it returns true\" — it's the object model.",
            "> In an interview, say: \"Ruby has no functions, only methods, and every method call is a message sent to a receiver. That one idea explains inheritance, mixins, `method_missing`, and most of Rails.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## Everything is `receiver.message(args)`",
            "In Ruby, `walker.name` is not \"reading a field\" — it's **sending the message `name` to the object `walker`**. `2 + 3` is sending the message `+` with argument `3` to the object `2`. `puts \"hi\"` is sending `puts` to the current `self`. There is no other mechanism. Understanding this is what separates \"I write Ruby\" from \"I know Ruby\".",
            "When you call `booking.confirmed?`, Ruby: (1) evaluates `booking` to get the receiver, (2) looks up a method named `confirmed?` starting from that object's class, (3) runs it with `self` bound to `booking`. Every dot works this way — no exceptions, no fields, no properties.",
          ],
        },
        {
          type: "text",
          md: [
            "## The six kinds of parameters",
            "A senior signal is knowing Ruby's full parameter vocabulary — most people only ever use two. In order, a method can declare:",
            "1. **Required positional** — `def walk(dog)`\n2. **Optional positional (default)** — `def walk(dog, minutes = 30)`\n3. **Splat / rest** — `def walk(dog, *extras)` collects leftover positionals into an array\n4. **Required keyword** — `def walk(dog:)` — caller *must* pass `dog:`\n5. **Optional keyword** — `def walk(dog:, minutes: 30)`\n6. **Double-splat** — `def walk(dog:, **opts)` collects leftover keywords into a hash\n7. **Block** — `def walk(dog, &action)` captures a passed block as a Proc",
            "Keyword arguments (4–6) are the modern default for anything with more than two parameters — they're self-documenting at the call site and order-independent. This is exactly why Rails APIs read like `redirect_to path, status: :see_other`.",
          ],
        },
        {
          type: "code",
          title: "playground/parameters.rb",
          source: String.raw`def book_walk(dog, minutes = 30, *tags, walker:, **opts)
  puts "dog=#{dog} minutes=#{minutes} tags=#{tags.inspect}"
  puts "walker=#{walker} opts=#{opts.inspect}"
end

book_walk("Mochi", 60, :vip, :gentle, walker: "Priya", notes: "back gate")
# dog=Mochi minutes=60 tags=[:vip, :gentle]
# walker=Priya opts={notes: "back gate"}`,
          caption: "One signature, every parameter kind. Ruby sorts the arguments out by position and by the `key:` syntax — positionals fill `dog`/`minutes`/`*tags`, `walker:` is a required keyword, and every other `key: value` lands in `**opts`.",
        },
        {
          type: "text",
          md: [
            "## The classic gotcha: hash vs keywords",
            "Ruby 3 made a hard split that trips up people who learned Ruby 2. **Keyword arguments are not a hash.** `def f(opts)` (a positional hash) and `def f(**opts)` (double-splat keywords) are different signatures, and passing one where the other is expected raises `ArgumentError`. In Ruby 2 they blurred together; in Ruby 3 they don't.",
            "> Red flag: saying \"keyword args are just a hash at the end.\" That was true-ish in Ruby 2 and caused years of bugs. In Ruby 3+, say: \"they're a distinct calling convention — `**` captures keywords, a plain trailing hash must be passed with braces or `**`.\"",
          ],
        },
        {
          type: "quiz",
          q: "Given `def confirm(booking, notify: true, **meta)`, what is `meta` after calling `confirm(b, notify: false, channel: :sms, retries: 3)`?",
          choices: [
            "`{channel: :sms, retries: 3}` — `**meta` collects every keyword not named explicitly",
            "`{notify: false, channel: :sms, retries: 3}` — it collects all keywords including `notify`",
            "`[:sms, 3]` — the leftover values as an array",
            "`nil` — you can't mix a named keyword with a double-splat",
          ],
          answer: 0,
          explain: "`notify:` is captured by its own named parameter, so it's removed from what `**meta` sees. The double-splat collects only the *remaining* keywords — `channel:` and `retries:` — into a hash. This is the same mechanism Rails uses to peel off known options and pass the rest through.",
          nudge: "A named keyword parameter and `**rest` split the keywords between them — the named one wins its key.",
        },
        {
          type: "exercise",
          title: "Design a keyword-first booking method",
          prompt: [
            "Write a method `book_walk` that takes a **required keyword** `dog:`, an **optional keyword** `minutes:` defaulting to `30`, and a **double-splat** `**opts` for anything else. Return the string `\"booked\"` (the body doesn't matter for this check — the signature is the lesson).",
            "This is the modern, self-documenting shape you'll reach for in real Rails service objects.",
          ],
          starter: String.raw`def book_walk( )
  # your code here
  "booked"
end`,
          solution: String.raw`def book_walk(dog:, minutes: 30, **opts)
  "booked"
end`,
          checks: [
            { re: /def book_walk\(/, hint: "Start with `def book_walk(`." },
            { re: /dog:/, hint: "`dog:` with a trailing colon and no default makes it a *required* keyword." },
            { re: /minutes:30/, hint: "Give `minutes:` a default of `30` so it's optional: `minutes: 30`." },
            { re: /\*\*opts/, hint: "Collect leftover keywords with a double-splat: `**opts`." },
          ],
          mustNot: [
            { re: /def book_walk\(dog,/, hint: "`dog` (no colon) is a positional argument. Add the colon — `dog:` — to make it a keyword." },
            { re: /def book_walk\(opts\)/, hint: "A single positional `opts` hash is the Ruby 2 style. Use real keywords: `dog:, minutes: 30, **opts`." },
          ],
          success: "That's the keyword-first signature senior Rubyists default to — readable at the call site, order-independent, and future-proof against Ruby 3's hash/keyword split.",
        },
      ],
    },
    {
      id: "self-default-object",
      title: "self — the Default Object",
      steps: [
        {
          type: "text",
          md: [
            "## `self` is the answer to \"who am I right now?\"",
            "At every point in a running Ruby program, exactly one object is `self` — the **default receiver**. Any method call with no explicit receiver (`save`, `puts`, `validates`) is sent to `self`. Knowing what `self` is at a given line is the single most useful skill for reading unfamiliar Ruby, because it tells you where a bare method call is actually going.",
            "> In an interview, say: \"`self` is whichever object is currently receiving messages. It changes as you move between the top level, a class body, an instance method, and a class method — and knowing which one you're in tells you where every bare call resolves.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## `self` at each level",
            "There are four contexts you'll meet constantly:",
            "- **Top level of a file** — `self` is `main`, a special object Ruby creates for you.\n- **Inside a class/module body** (but outside any method) — `self` is *the class itself*. This is why `attr_accessor :name` and `validates :status` work there: they're method calls sent to the class.\n- **Inside an instance method** — `self` is *the instance* the method was called on.\n- **Inside a class method** (`def self.foo`) — `self` is *the class*.",
            "```\nclass Walker\n  puts self          # Walker (class body)\n  def initialize\n    puts self        # #<Walker:...> (the instance)\n  end\n  def self.roster\n    puts self        # Walker (class method)\n  end\nend\n```",
          ],
        },
        {
          type: "code",
          title: "playground/self_levels.rb",
          source: String.raw`class Walker
  puts "class body: #{self}"

  def self.count
    "class method self: #{self}"
  end

  def describe
    "instance self: #{self.class}"
  end
end

puts Walker.count
puts Walker.new.describe
# class body: Walker
# class method self: Walker
# instance self: Walker`,
          caption: "The class body and the class method both see `self == Walker`. The instance method sees the instance, whose `.class` is `Walker`. Run it and watch `self` shift.",
        },
        {
          type: "text",
          md: [
            "## Why `validates :status` needs no receiver",
            "Now the payoff. Inside the `Booking` model in `apps/pawwalk-api`, you wrote `validates :starts_at, presence: true` and `enum :status, {...}`. Those look like keywords, but they're **ordinary method calls sent to `self`** — and in a class body, `self` is the class `Booking`. `validates` and `enum` are class methods that Rails mixed in; calling them with no receiver sends them to `Booking`, which records the validation. There is no magic — just `self` being the class.",
            "This is the mental model that unlocks module 27. Every `has_many`, `belongs_to`, `scope`, and `validates` is a class method call on `self`, executed once when the class is defined.",
          ],
        },
        {
          type: "text",
          md: [
            "## The one place you MUST write `self`: setters",
            "Bare `name = \"x\"` inside a method always creates a **local variable** — Ruby can't tell you meant the setter. To call an `attr_writer`/setter from inside the object, you must write `self.name = \"x\"`. This is the exception that proves the rule: everywhere else `self` is implicit, but an assignment-looking call needs the explicit receiver to not be mistaken for a local.",
            "> Red flag: a method that \"sets\" a value but the value never changes. Nine times out of ten it's `status = :confirmed` (makes a local) where the author meant `self.status = :confirmed` (calls the setter).",
          ],
        },
        {
          type: "quiz",
          q: "Inside an instance method you write `price_cents = 2400` intending to update the object's `price_cents=` setter. What actually happens?",
          choices: [
            "A local variable `price_cents` is created and the setter is never called — the object is unchanged",
            "The setter runs and the object's price is updated to 2400",
            "It raises `NoMethodError` because bare assignment isn't allowed in methods",
            "It updates the instance variable `@price_cents` directly",
          ],
          answer: 0,
          explain: "Ruby resolves `price_cents = 2400` as a local variable assignment — an unadorned name on the left of `=` is *always* a local, never a method call. To reach the setter you must disambiguate with an explicit receiver: `self.price_cents = 2400`. This is the single most common `self` bug in real code.",
          nudge: "What's the ONE context the lesson said forces you to write `self.` explicitly?",
        },
        {
          type: "exercise",
          title: "Call a setter from inside the object",
          prompt: [
            "This `Booking` has an `attr_accessor :status`. Finish `confirm!` so it sets the status to `\"confirmed\"` by calling the **setter** — remember the one place `self.` is mandatory.",
          ],
          starter: String.raw`class Booking
  attr_accessor :status

  def confirm!
    # your code here
  end
end`,
          solution: String.raw`class Booking
  attr_accessor :status

  def confirm!
    self.status = "confirmed"
  end
end`,
          checks: [
            { re: /self\.status="confirmed"/, hint: "Assignment-looking calls need an explicit receiver: `self.status = \"confirmed\"`." },
          ],
          mustNot: [
            { re: /[^.]status="confirmed"/, hint: "Bare `status = ...` creates a local variable and never touches the object. Prefix it: `self.status = ...`." },
            { re: /@status=/, hint: "Setting `@status` directly works but sidesteps the setter — this lesson is about calling the setter, so use `self.status = ...`." },
          ],
          success: "`self.status = ...` routes through the setter method. Everywhere else `self` is implicit; on the left of `=`, it's the difference between a local variable and a real update.",
        },
      ],
    },
    {
      id: "scope-and-visibility",
      title: "Scope & Visibility",
      steps: [
        {
          type: "text",
          md: [
            "## Scope gates: where local variables live and die",
            "Ruby has a crisp rule most languages blur: `class`, `module`, and `def` each open a **brand-new local scope** — a *scope gate*. A local variable defined outside does not leak in, and one defined inside does not leak out. (Blocks are the deliberate exception — they *close over* their surroundings, which is why `each` can see outer variables. That's module 25.)",
            "> In an interview, say: \"`class`, `module`, and `def` are scope gates — they start a fresh local scope. Blocks are not gates; they close over the enclosing scope. That distinction is why a constant defined at the top of a class is visible in its methods but a local variable isn't.\"",
          ],
        },
        {
          type: "code",
          title: "playground/scope_gates.rb",
          source: String.raw`RATE = 2400        # constant — reachable across gates
outer = "top"      # local — trapped at the top level

class Walker
  # 'outer' is NOT visible here — 'def'/'class' are scope gates
  def rate_label
    "#{RATE} cents"  # constants DO cross the gate
  end
end

puts Walker.new.rate_label   # 2400 cents`,
          caption: "The local `outer` cannot be seen inside `Walker` — the `class` gate blocks it. The constant `RATE` is reachable because constants use a different, lexical lookup, not local scope.",
        },
        {
          type: "text",
          md: [
            "## Three visibility levels — and what they really mean",
            "Method visibility controls *who can send the message*, and Ruby's rules are subtler than Java's:",
            "- **public** (the default) — callable with any receiver: `booking.confirm!`.\n- **private** — callable **only without an explicit receiver**, i.e. only on the implicit `self`. You literally cannot write `booking.compute_price!` from outside; you can only call `compute_price!` from another method of the same object.\n- **protected** — callable with an explicit receiver, *but only if the caller is the same class or a subclass*. Its one real use case: comparing two instances of the same class.",
            "The private rule is about the *syntax of the call site*, not about \"who defined it\" — that's the Ruby-specific twist. That's also why `self.price_cents = x` can call a private setter (setters are the one exception where private allows an explicit `self`).",
          ],
        },
        {
          type: "code",
          title: "playground/protected.rb",
          source: String.raw`class Walker
  def initialize(rating) = @rating = rating

  def better_than?(other)
    rating > other.rating   # needs to read another Walker's rating
  end

  protected

  def rating = @rating       # protected: same-class receivers only
end

a = Walker.new(4.8)
b = Walker.new(4.2)
puts a.better_than?(b)       # true
# a.rating  =>  NoMethodError (protected outside the class)`,
          caption: "`protected` is the right tool here: `better_than?` must read `other.rating` (an explicit receiver), but `rating` stays closed to the outside world. `private` would forbid `other.rating`; `public` would leak it.",
        },
        {
          type: "text",
          md: [
            "## The Rails tie-in",
            "In your `Booking` model, `compute_price!` is public (controllers call it) but `dog_belongs_to_booker` sits under `private` — Rails validations call it on the implicit `self`, and nothing outside should. In controllers, the convention is the reverse safety net: **every non-action method is `private`**, because Rails will happily route a request to any *public* controller method. Marking helpers `private` is how you stop a helper from accidentally becoming a reachable endpoint.",
            "> Red flag: a public controller method that isn't a real route action. To an interviewer that's a security smell — say \"non-action controller methods must be private so the router can't dispatch to them.\"",
          ],
        },
        {
          type: "quiz",
          q: "You mark `charge_card` as `private` in a class. Which call succeeds?",
          choices: [
            "Calling `charge_card` (no receiver) from another instance method of the same object",
            "Calling `payment.charge_card` from outside the object",
            "Calling `self.charge_card` explicitly from inside (non-setter)",
            "Calling `other_payment.charge_card` from a method of a different instance of the same class",
          ],
          answer: 0,
          explain: "`private` means \"callable only without an explicit receiver\" — i.e. only on the implicit `self` from within the object's own methods. `payment.charge_card` and `other_payment.charge_card` both use explicit receivers and fail. Even `self.charge_card` fails for a normal method (the setter form `self.x = ` is the lone exception). `protected` is what you'd use to allow same-class explicit receivers.",
          nudge: "The private rule is about the *call site syntax*: is there an explicit receiver before the dot, or not?",
        },
        {
          type: "exercise",
          title: "Hide a helper with private",
          prompt: [
            "This `Payment` exposes `charge!` (public) but its helper `gateway_token` should not be callable from outside. Add the `private` keyword so `gateway_token` is private, keeping `charge!` public.",
          ],
          starter: String.raw`class Payment
  def charge!
    "charging with #{gateway_token}"
  end

  # your code here

  def gateway_token
    "tok_secret"
  end
end`,
          solution: String.raw`class Payment
  def charge!
    "charging with #{gateway_token}"
  end

  private

  def gateway_token
    "tok_secret"
  end
end`,
          checks: [
            { re: /def charge!/, hint: "Keep `charge!` defined above the `private` line so it stays public." },
            { re: /private/, hint: "Add a bare `private` line — everything defined after it becomes private." },
            { re: /private.*def gateway_token/s, hint: "`private` must come BEFORE `def gateway_token` so the helper falls under it." },
          ],
          mustNot: [
            { re: /private.*def charge!/s, hint: "`private` is above `charge!` — that would make the public action private too. Put `private` between `charge!` and `gateway_token`." },
          ],
          success: "A bare `private` flips every method defined after it to private. `charge!` stays reachable; `gateway_token` is now callable only on the implicit self — the exact pattern Rails controllers use for non-action helpers.",
        },
      ],
    },
    {
      id: "method-lookup-path",
      title: "The Method Lookup Path",
      steps: [
        {
          type: "text",
          md: [
            "## When you send a message, where does Ruby look?",
            "This is *the* object-model question. When you call `booking.confirmed?`, Ruby walks a strict, ordered list of places looking for a `confirmed?` method, and runs the first one it finds. That list is the **ancestor chain**, and you can print it: `Booking.ancestors`. Every mixin, every superclass, `method_missing`, and Rails' entire feature set is just careful arrangement of this chain.",
            "> In an interview, say: \"Method lookup walks the ancestors: singleton class, then the class, then modules it prepends/includes (last included wins, searched bottom-up), then the superclass and its modules, up to `BasicObject`. The first match runs. `super` continues the walk from where the current method was found.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## The order, precisely",
            "For an instance `obj` of class `C`, lookup proceeds:",
            "1. `obj`'s **singleton class** (any methods defined on just that one object)\n2. Modules **prepended** into `C` (most-recently-prepended first)\n3. `C` itself\n4. Modules **included** in `C` (most-recently-included first)\n5. `C`'s superclass — then repeat 2–4 for it, all the way up\n6. `Object` → `Kernel` (a module) → `BasicObject`",
            "The rule of thumb: **`prepend` wins over the class, the class wins over `include`.** That's the whole reason `prepend` exists — it lets a module wrap a class's own method and call `super` to reach it.",
          ],
        },
        {
          type: "code",
          title: "playground/lookup.rb",
          source: String.raw`module Trackable
  def status = "#{super} (tracked)"
end

class Booking
  prepend Trackable          # sits IN FRONT of Booking
  def status = "confirmed"
end

puts Booking.new.status      # confirmed (tracked)
p Booking.ancestors
# [Trackable, Booking, Object, Kernel, BasicObject]`,
          caption: "Because `Trackable` is *prepended*, it appears before `Booking` in the chain, so `Booking.new.status` finds `Trackable#status` first. Its `super` then continues the walk to `Booking#status`. Swap `prepend` for `include` and `Trackable` would fall *after* `Booking` — never reached.",
        },
        {
          type: "text",
          md: [
            "## include vs prepend vs extend",
            "Three verbs, three insertion points:",
            "- **`include Mod`** — adds `Mod` to the ancestor chain *below* the class. Instance methods of `Mod` become instance methods, overridable by the class. (Comparable, Enumerable.)\n- **`prepend Mod`** — adds `Mod` *above* the class, so it intercepts calls first and can wrap them with `super`. (How Rails does some method decoration.)\n- **`extend Mod`** — adds `Mod`'s methods as **class methods** (it mixes into the singleton class). `extend` is `include` aimed at `self` instead of instances.",
            "This is the real answer to \"how does ActiveSupport::Concern's `included do ... end` work\" — it manipulates exactly these insertion points. You'll build one in module 27.",
          ],
        },
        {
          type: "text",
          md: [
            "## The real chain in your app",
            "In `apps/pawwalk-api`, `Booking < ApplicationRecord < ActiveRecord::Base`, and `ActiveRecord::Base` includes dozens of modules (`ActiveModel::Validations`, `ActiveRecord::Persistence`, …). That's why `booking.save`, `booking.valid?`, and `booking.confirmed?` (from the `enum`) all resolve — each lives in some module in that long chain. Run `Booking.ancestors` in `bin/rails console` and you'll see 40+ entries. Nothing is inherited by magic; it's all one lookup list.",
          ],
        },
        {
          type: "quiz",
          q: "A class `C` defines `#greet`. You then `prepend M` where `M` also defines `#greet` and calls `super` inside it. What does `C.new.greet` run, and what does `super` reach?",
          choices: [
            "`M#greet` runs first (prepend sits ahead of C); its `super` reaches `C#greet`",
            "`C#greet` runs first because the class always beats its modules; `super` reaches `M#greet`",
            "`M#greet` runs and `super` raises `NoMethodError` because there's nothing above it",
            "Both run automatically in definition order with no need for `super`",
          ],
          answer: 0,
          explain: "`prepend` inserts `M` *before* `C` in the ancestor chain, so `M#greet` is found first. Its `super` continues lookup from that point and finds `C#greet` next. This wrap-and-`super` pattern is the entire reason `prepend` exists — `include` would place `M` after `C`, so `C#greet` would win and `M#greet` would never run.",
          nudge: "Which verb puts the module IN FRONT of the class? That one's method is found first.",
        },
        {
          type: "exercise",
          title: "Wrap a method with prepend + super",
          prompt: [
            "`Walker#price` returns `2400`. Write a module `Surge` with a `price` method that returns `super * 2`, and `prepend` it into `Walker` so `Walker.new.price` returns `4800`.",
          ],
          starter: String.raw`module Surge
  # your code here
end

class Walker
  prepend Surge
  def price = 2400
end`,
          solution: String.raw`module Surge
  def price = super * 2
end

class Walker
  prepend Surge
  def price = 2400
end`,
          checks: [
            { re: /module Surge/, hint: "Open the module: `module Surge`." },
            { re: /def price=super\*2/, hint: "Define `price` calling up the chain and doubling: `def price = super * 2`." },
            { re: /super/, hint: "Use `super` to reach `Walker#price` (which returns 2400)." },
          ],
          mustNot: [
            { re: /def price=2400\*2/, hint: "Don't hard-code 2400 in the module — call `super` so it works no matter what the class returns." },
            { re: /def price=4800/, hint: "Hard-coding 4800 defeats the point. The module should double whatever `super` (the original) returns." },
          ],
          success: "Because `Surge` is prepended, its `price` runs first and `super` reaches `Walker#price`. That's method wrapping — the mechanism behind Rails callbacks and decorators, expressed in four lines of plain Ruby.",
        },
      ],
    },
    {
      id: "singleton-classes",
      title: "Singleton Classes & Class Methods",
      steps: [
        {
          type: "text",
          md: [
            "## Where do class methods actually live?",
            "You've written `def self.roster` a hundred times. Here's the question that reveals whether you *understand* it: a method belongs to a class, and instances look it up in their class — so where does a **class method** live, given that a class is itself an object? The answer is the **singleton class** (a.k.a. metaclass or eigenclass): a hidden, per-object class that holds methods belonging to that one object alone.",
            "> In an interview, say: \"A class method is a singleton method on the class object. `def self.foo` defines `foo` in the class's singleton class, which is why instances can't see it but the class can. Class methods aren't a separate feature — they're the object model applied to the class-as-an-object.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## Singleton methods on any object",
            "You can give a method to a *single object*, not its whole class:",
            "```\nmochi = \"Mochi\"\ndef mochi.bark = \"woof\"\nmochi.bark        # \"woof\"\n\"Rex\".bark        # NoMethodError — only mochi has it\n```",
            "That `bark` lives in `mochi`'s singleton class, checked first in the lookup path (step 1 from the last lesson). A **class method is exactly this**, applied to a class object: `def self.count` puts `count` in the class's singleton class.",
          ],
        },
        {
          type: "code",
          title: "playground/singleton_class.rb",
          source: String.raw`class Walker
  def self.roster = "all walkers"      # class method

  class << self                         # reopen the singleton class
    def count = 42                      # ...another class method
    def active_count = count - 5        # class methods can call each other
  end
end

puts Walker.roster        # all walkers
puts Walker.count         # 42
puts Walker.active_count  # 37
p Walker.singleton_class  # #<Class:Walker>`,
          caption: "`class << self` opens the class's singleton class directly, so everything defined inside becomes a class method. It's the idiomatic way to define several class methods at once — and it makes explicit *where* `def self.x` was quietly putting them all along.",
        },
        {
          type: "text",
          md: [
            "## `class << self` — the idiom worth knowing",
            "`def self.foo; end` defines one class method. When you have several, `class << self` reads better and shows intent — you're literally saying \"open the singleton class of self and define methods here.\" It's also the *only* clean way to make a class method `private` (a bare `private` inside `class << self` works; `private_class_method` is the clunky alternative).",
            "And this closes the loop on `extend` from the last lesson: `extend Mod` mixes `Mod` into the object's singleton class. So `extend` at the class level = class methods from a module. Three phrasings — `def self.x`, `class << self`, `extend Mod` — all target the same place: the singleton class.",
          ],
        },
        {
          type: "quiz",
          q: "Why can `Walker.count` work while `Walker.new.count` raises `NoMethodError`?",
          choices: [
            "`count` lives in Walker's singleton class, which is in the lookup path for `Walker` but not for its instances",
            "Class methods are globally scoped and instances are sandboxed away from them",
            "`new` creates a frozen object that can't see any methods",
            "`count` is private, so only the class itself can call it",
          ],
          answer: 0,
          explain: "`def self.count` defines `count` in `Walker`'s singleton class. When you send `count` to `Walker`, its singleton class is first in the lookup path, so it's found. An *instance* of `Walker` looks up methods in `Walker` and its ancestors — a path that never includes `Walker`'s singleton class — so the instance can't see `count`. Class methods and instance methods live in genuinely different places.",
          nudge: "Instances look up methods in their class's ancestors. Is the class's *singleton* class on that path?",
        },
        {
          type: "exercise",
          title: "Define class methods with class << self",
          prompt: [
            "Give `Walker` two class methods using a `class << self` block: `default_rate` returning `2400`, and `default_label` returning `\"standard\"`. (Use the block form, not `def self.x`.)",
          ],
          starter: String.raw`class Walker
  # your code here
end`,
          solution: String.raw`class Walker
  class << self
    def default_rate = 2400
    def default_label = "standard"
  end
end`,
          checks: [
            { re: /class<<self/, hint: "Open the singleton class with `class << self`." },
            { re: /def default_rate=2400/, hint: "Inside the block: `def default_rate = 2400`." },
            { re: /def default_label="standard"/, hint: "And `def default_label = \"standard\"`." },
          ],
          mustNot: [
            { re: /def self\.default_rate/, hint: "This exercise wants the `class << self` block form, not `def self.default_rate`. Both work, but practice the block idiom here." },
          ],
          success: "`class << self` opens the class's singleton class, so both methods become class methods — and now you know that's literally where `def self.x` was putting them all along.",
        },
      ],
    },
    {
      id: "equality-and-copies",
      title: "Equality, Comparison & Copies (Capstone)",
      steps: [
        {
          type: "text",
          md: [
            "## Three kinds of \"equal\" — and when each fires",
            "\"Are these equal?\" has three answers in Ruby, and mixing them up causes real bugs (duplicate hash keys, sets that don't dedupe):",
            "- **`equal?`** — identity. Same object in memory. Never override it.\n- **`==`** — value equality. \"Do these represent the same thing?\" Override this for your own value objects.\n- **`eql?`** — the stricter equality used by `Hash` keys, together with `hash`. Two objects that are `eql?` **must** return the same `hash`.",
            "> In an interview, say: \"`equal?` is identity, `==` is value equality you define, and `eql?` + `hash` are the Hash-key contract. If I override `==` for a value object, I override `eql?` and `hash` too, or it'll behave wrong as a hash key or in a Set.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## The hash contract (the part people forget)",
            "`Hash` and `Set` find keys in two steps: bucket by `hash`, then confirm with `eql?`. So if two objects should be treated as the same key, they need **both** the same `hash` value **and** `eql?` returning true. Override one without the other and you get objects that are \"equal\" but sit in different buckets — silent duplicates.",
            "> Red flag: overriding `==` but not `hash`. Say: \"Any value object I compare with `==` also needs a matching `hash`/`eql?`, or it'll create duplicate keys in a Hash or Set.\"",
          ],
        },
        {
          type: "code",
          title: "playground/equality.rb",
          source: String.raw`class Money
  attr_reader :cents
  def initialize(cents) = @cents = cents

  def ==(other) = other.is_a?(Money) && cents == other.cents
  alias eql? ==                       # hash keys use the same rule
  def hash = cents.hash               # equal values => equal hash
end

a = Money.new(2400)
b = Money.new(2400)
puts a == b            # true  (value equality)
puts a.equal?(b)       # false (different objects)
puts({ a => "x" }[b])  # x     (works as a hash key)`,
          caption: "`==`, `eql?`, and `hash` all agree that two 2400-cent Moneys are the same, so `b` finds the value stored under `a`. Drop the `hash` override and that last line prints `nil` — the classic silent bug.",
        },
        {
          type: "text",
          md: [
            "## `<=>` and Comparable — sorting for free",
            "Define one method, `<=>` (the \"spaceship\"), returning `-1`, `0`, or `1`, then `include Comparable`, and you get `<`, `<=`, `==`, `>`, `>=`, `between?`, and `clamp` — all derived from that single method. This is the object model rewarding you: implement the one primitive, mix in the module, inherit seven methods through the ancestor chain.",
          ],
        },
        {
          type: "text",
          md: [
            "## dup vs clone vs freeze",
            "Copying has two verbs and one lock:",
            "- **`dup`** — shallow copy; does **not** copy the frozen state or singleton methods.\n- **`clone`** — shallow copy that **does** copy frozen state and singleton methods (clone means \"as identical as possible\").\n- **`freeze`** — makes an object immutable; further mutation raises `FrozenError`. Both copies are shallow, so nested objects are shared — freeze the container and the elements are still mutable unless you freeze them too.",
            "> In an interview, say: \"`dup` and `clone` are both shallow — `clone` preserves frozen state and singleton methods, `dup` doesn't. For deep copies I reach for a real strategy, not `dup`, because the nested objects are shared references.\"",
          ],
        },
        {
          type: "quiz",
          q: "You override `==` on a `BookingCode` value object so two codes with the same string are equal, but you leave `hash` as the default. You put one in a `Set` and add an equal one. What happens?",
          choices: [
            "The Set ends up with both — they land in different buckets because their default `hash` values differ",
            "The Set dedupes them correctly because `==` returning true is enough",
            "Adding the second raises `FrozenError`",
            "The Set silently drops both entries",
          ],
          answer: 0,
          explain: "`Set` (like `Hash`) buckets by `hash` first, then confirms with `eql?`. With the default `hash`, two distinct objects almost always hash to different buckets, so the Set never even compares them and stores both — a silent duplicate. Overriding `==` alone is not enough; you must override `hash` (and `eql?`) so equal objects share a bucket. This is exactly the contract from earlier in the lesson.",
          nudge: "How does a Set decide two objects are the same key — is `==` alone enough, or does it check `hash` first?",
        },
        {
          type: "exercise",
          title: "A value-equal, sortable Booking",
          prompt: [
            "Make `Booking` compare and sort by `starts_at` (an integer here). Add `include Comparable`, then define `<=>` comparing `starts_at` to the other booking's `starts_at`. That single method unlocks `<`, `>`, `sort`, `min`, and more.",
          ],
          starter: String.raw`class Booking
  attr_reader :starts_at
  def initialize(starts_at) = @starts_at = starts_at

  # your code here
end`,
          solution: String.raw`class Booking
  include Comparable
  attr_reader :starts_at
  def initialize(starts_at) = @starts_at = starts_at

  def <=>(other) = starts_at <=> other.starts_at
end`,
          checks: [
            { re: /include Comparable/, hint: "Mix in the module: `include Comparable`." },
            { re: /def<=>\(other\)/, hint: "Define the spaceship: `def <=>(other)`." },
            { re: /starts_at<=>other\.starts_at/, hint: "Delegate to the integers: `starts_at <=> other.starts_at`." },
          ],
          mustNot: [
            { re: /def<\(other\)/, hint: "Don't define `<` by hand — `Comparable` generates it from `<=>`. Just define `<=>`." },
          ],
          success: "One `<=>` plus `include Comparable` gives you the whole comparison suite through the ancestor chain. That's the object model paying dividends — and a clean note to end this module on. Next up (module 25): blocks, procs, and lambdas.",
        },
      ],
    },
  ],
});
