window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "classes-modules",
  title: "Classes & Modules",
  emoji: "🏗️",
  lang: "ruby",
  lessons: [
    {
      id: "first-class",
      title: "Your First Class",
      steps: [
        {
          type: "text",
          md: [
            "## `class … end` — a blueprint, same idea as Swift/Python",
            "You've built classes before: Swift's `class`/`struct`, Python's `class Walker:`. Ruby's version looks like everything else in this course — no braces, no colon, just `class` opening the block and `end` closing it:",
            "```\nclass Walker\nend\n```",
            "That alone is a complete (if useless) class. `Walker.new` would already work, handing back an empty instance. The interesting part is what you put inside.",
          ],
        },
        {
          type: "text",
          md: [
            "## `initialize` — Ruby's constructor",
            "Swift synthesizes a memberwise initializer for structs for free. Python wants an explicit `__init__(self, ...)`. Ruby sits closer to Python: you define a method named exactly `initialize`, and Ruby calls it automatically whenever someone writes `Walker.new(...)`:",
            "```\nclass Walker\n  def initialize(name, price_per_30_min_cents)\n    @name = name\n    @price_per_30_min_cents = price_per_30_min_cents\n  end\nend\n\npriya = Walker.new(\"Priya\", 2400)\n```",
            "`Walker.new(\"Priya\", 2400)` calls `initialize` under the hood with those two arguments. You never call `initialize` yourself — `.new` does it for you, the same way Python calls `__init__` for you inside `Walker(\"Ana\", 2400)`.",
          ],
        },
        {
          type: "text",
          md: [
            "## `@name` — instance variables",
            "A name prefixed with `@` is an **instance variable** (\"ivar\") — Ruby's equivalent of Swift's `self.name = name` or Python's `self.name = name`. Every object gets its own private set of `@`-variables, alive for as long as the object exists. No declaration keyword, no type annotation: the first time you assign `@name = name`, Ruby creates it.",
          ],
        },
        {
          type: "code",
          title: "playground/walker.rb",
          source: String.raw`class Walker
  def initialize(name, price_per_30_min_cents)
    @name = name
    @price_per_30_min_cents = price_per_30_min_cents
  end
end

priya = Walker.new("Priya", 2400)
puts priya.class
puts priya.inspect`,
          caption: "Run with `ruby playground/walker.rb` — prints `Walker`, then `#<Walker:0x... @name=\"Priya\", @price_per_30_min_cents=2400>`. `.inspect` on any object shows its class and every ivar it's carrying — the fastest way to peek inside one.",
        },
        {
          type: "text",
          md: [
            "## The trap: ivars are PRIVATE by default",
            "Here's the biggest surprise coming from Swift/Python/JS: in every one of those, `walker.name` just works — a property or attribute is visible from outside the object unless you go out of your way to hide it. **Ruby flips the default.** An instance variable is invisible outside the object the instant you declare it. There is no `walker.name` yet — only `walker.instance_variable_get(:@name)`, which nobody actually writes.",
            "```\npriya = Walker.new(\"Priya\", 2400)\npriya.name   # NoMethodError: undefined method 'name' for an instance of Walker\n```",
            "That's not a bug or a missing import — `@name` was never exposed as a method, and in Ruby, a dot always calls a method. Next lesson fixes this with one line.",
          ],
        },
        {
          type: "quiz",
          q: "You write `class Walker` with `@name = name` set inside `initialize`. From outside the class, what does `priya.name` do?",
          choices: [
            "Raises `NoMethodError` — instance variables are private by default; no `name` method exists yet",
            "Returns `\"Priya\"` — ivars are readable from outside, same as Swift/Python attributes",
            "Returns `nil`, since `name` was never explicitly declared public",
            "Works only inside `irb`, not in a `.rb` file",
          ],
          answer: 0,
          explain: "Assigning `@name` creates an instance variable, not a method. Ruby only calls methods when you write `object.something` — since `Walker` never defined a `name` method, `priya.name` has nothing to call and raises `NoMethodError`.",
          nudge: "The lesson named this THE big surprise versus Swift/Python. Is a bare `@name` visible outside the object, or not?",
        },
        {
          type: "exercise",
          title: "Build a Dog class",
          prompt: [
            "Write a `Dog` class with `initialize(name, breed)` that stores both as `@name` and `@breed`. Then create `mochi = Dog.new(\"Mochi\", \"Corgi\")` and print `mochi.class` with `puts`.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`class Dog
  def initialize(name, breed)
    @name = name
    @breed = breed
  end
end

mochi = Dog.new("Mochi", "Corgi")
puts mochi.class`,
          checks: [
            { re: /class Dog/, hint: "Open the class with `class Dog`." },
            { re: /def initialize\(name,breed\)/, hint: "Define the constructor: `def initialize(name, breed)`." },
            { re: /@name=name/, hint: "Store the first ivar: `@name = name`." },
            { re: /@breed=breed/, hint: "Store the second ivar: `@breed = breed`." },
            { re: /Dog\.new\("Mochi","Corgi"\)/, hint: "Create the instance with `Dog.new(\"Mochi\", \"Corgi\")`." },
          ],
          mustNot: [
            { re: /def __init__/, hint: "That's Python's constructor name — Ruby's is `initialize`." },
            { re: /constructor\(/, hint: "That's JS/Swift-flavored naming — Ruby's constructor method is `initialize`, not `constructor`." },
          ],
          success: "A real Ruby class: `initialize` filling in two ivars, called automatically by `.new`.",
        },
      ],
    },
    {
      id: "attr-accessor-friends",
      title: "attr_accessor & Friends",
      steps: [
        {
          type: "text",
          md: [
            "## First, the manual fix — so it's not magic",
            "Last lesson ended with `priya.name` raising `NoMethodError`. The direct fix is a method that just hands back the ivar:",
            "```\nclass Walker\n  def initialize(name)\n    @name = name\n  end\n\n  def name\n    @name\n  end\nend\n```",
            "That's it — `name` is a completely ordinary method whose body happens to be a single ivar. Now `priya.name` calls that method and gets `\"Priya\"` back. Nothing hidden: a \"getter\" in Ruby is just a method, same shape as any other.",
          ],
        },
        {
          type: "text",
          md: [
            "## `attr_reader`, `attr_writer`, `attr_accessor`",
            "Writing `def name; @name; end` for every single ivar gets old fast — especially once a class has five or six of them. Ruby gives you three class-level shortcuts that generate exactly those methods for you:",
            "- **`attr_reader :name`** generates a getter only — `priya.name` works, `priya.name = \"x\"` doesn't.\n- **`attr_writer :name`** generates a setter only — `priya.name = \"x\"` works, reading doesn't.\n- **`attr_accessor :name`** generates BOTH — the common case.",
            "```\nclass Walker\n  attr_accessor :name, :price_per_30_min_cents\n\n  def initialize(name, price_per_30_min_cents)\n    @name = name\n    @price_per_30_min_cents = price_per_30_min_cents\n  end\nend\n```",
            "One line, comma-separated symbols, and every ivar you list gets a real reader and writer method — the exact same methods you'd have typed by hand.",
          ],
        },
        {
          type: "code",
          title: "playground/attr_accessor.rb",
          source: String.raw`class Walker
  attr_accessor :name, :price_per_30_min_cents

  def initialize(name, price_per_30_min_cents)
    @name = name
    @price_per_30_min_cents = price_per_30_min_cents
  end
end

priya = Walker.new("Priya", 2400)
puts priya.name
priya.name = "Priya K."
puts priya.name`,
          caption: "Run it — prints `Priya`, then `Priya K.`. `attr_accessor` generated both `name` (getter) and `name=` (setter) from one declaration; `priya.name = \"Priya K.\"` calls that generated setter.",
        },
        {
          type: "text",
          md: [
            "## Pick the narrowest one that fits",
            "Reach for `attr_reader` when a value should never change after construction from outside (an id, a creation timestamp). Reach for `attr_accessor` when both directions genuinely make sense. It's rarely worth reasoning hard about this in a throwaway script, but in a real class it's a small, free signal to whoever reads it next about what's meant to be mutable.",
          ],
        },
        {
          type: "quiz",
          q: "You write `attr_reader :price_per_30_min_cents` (reader only, not accessor). What happens when you try `walker.price_per_30_min_cents = 3000`?",
          choices: [
            "`NoMethodError` — `attr_reader` only generates a getter, no setter method exists",
            "It works fine — `attr_reader` generates both directions",
            "It silently does nothing and leaves the old value in place",
            "It raises a `FrozenError` because readers make ivars immutable",
          ],
          answer: 0,
          explain: "`attr_reader` generates only the getter method. There's no `price_per_30_min_cents=` method at all, so calling it raises `NoMethodError`, same failure shape as any other missing method.",
          nudge: "`attr_reader` is named for exactly one direction. Which direction is missing?",
        },
        {
          type: "exercise",
          title: "Expose a Dog's name and breed",
          prompt: [
            "Add `attr_accessor :name, :breed` to this `Dog` class (keep `initialize` as-is). Then create `mochi = Dog.new(\"Mochi\", \"Corgi\")` and print `mochi.name` with `puts`.",
          ],
          starter: String.raw`class Dog
  # your code here

  def initialize(name, breed)
    @name = name
    @breed = breed
  end
end
`,
          solution: String.raw`class Dog
  attr_accessor :name, :breed

  def initialize(name, breed)
    @name = name
    @breed = breed
  end
end

mochi = Dog.new("Mochi", "Corgi")
puts mochi.name`,
          checks: [
            { re: /attr_accessor:name,:breed/, hint: "Declare both ivars on one line: `attr_accessor :name, :breed`." },
            { re: /Dog\.new\("Mochi","Corgi"\)/, hint: "Create the instance: `Dog.new(\"Mochi\", \"Corgi\")`." },
            { re: /puts mochi\.name/, hint: "Read it back through the generated getter: `puts mochi.name`." },
          ],
          mustNot: [
            { re: /def name\s*;?\s*@name\s*;?\s*end/, hint: "Let `attr_accessor` generate the getter — no need to write `def name; @name; end` by hand now." },
          ],
          success: "One line replaced two hand-written methods (a getter and a setter) — this is why `attr_accessor` shows up in nearly every Ruby class you'll ever read.",
        },
      ],
    },
    {
      id: "instance-methods-self",
      title: "Instance Methods & self",
      steps: [
        {
          type: "text",
          md: [
            "## Behavior lives next to data",
            "A class isn't just a bag of ivars — it's where you put the methods that act on them. `price_label` computes a display string from `@price_per_30_min_cents`, the same computed value from Part I's Swift course, and the same one the real backend computes too:",
            "```\nclass Walker\n  attr_accessor :name, :price_per_30_min_cents\n\n  def initialize(name, price_per_30_min_cents)\n    @name = name\n    @price_per_30_min_cents = price_per_30_min_cents\n  end\n\n  def price_label\n    \"$#{@price_per_30_min_cents / 100} / 30 min\"\n  end\nend\n```",
            "Say it out loud: this is the *exact same idea* as Swift's `var priceLabel: String { \"$\\(pricePer30MinCents / 100) / 30 min\" }` computed property — a value derived from stored data, recalculated fresh on every call, no `return` needed since it's the method's last expression (implicit return, module 01). And it's *also* a preview of module 07: once `Walker` becomes a real ActiveRecord model, this exact method ships unchanged in `app/models/walker.rb`.",
          ],
        },
        {
          type: "code",
          title: "app/models/walker.rb (the real file, module 07 preview)",
          source: String.raw`class Walker < ApplicationRecord
  def price_label
    "$#{price_per_30_min_cents / 100} / 30 min"
  end
end`,
          caption: "Quoted verbatim from the real PawWalk backend. Same method body you just wrote — the only difference is `price_per_30_min_cents` with no `@`, because ActiveRecord generates reader methods for database columns automatically. More on that in module 07.",
        },
        {
          type: "text",
          md: [
            "## Implicit `self` — most of the time you don't write it",
            "Inside an instance method, Ruby already knows which object you mean — you don't need `self.@name` or anything like it; a bare `@name` always refers to THIS object's ivar. For calling another method on the same object, a bare method name (no receiver at all) is usually enough too:",
            "```\ndef greeting\n  \"Hi, I'm #{name}\"   # implicit self.name — works because `name` has no local var to conflict with\nend\n```",
            "Compare Python, where every single reference needs an explicit `self.`: `self.name`, `self.price_label()`. Ruby only asks for `self.` in ONE common situation: calling a **setter method** from inside the class, because without it Ruby can't tell your intent apart from creating a brand-new local variable:",
            "```\ndef rename(new_name)\n  self.name = new_name   # needs explicit self. — bare `name = new_name` would just create a local variable\nend\n```",
            "Drop the `self.` on that line and Ruby silently does something completely different: it defines a local variable named `name` inside `rename`, assigns to THAT, and the real `@name` never changes. This is the one spot where forgetting `self.` is a real, silent bug — everywhere else it's optional style.",
          ],
        },
        {
          type: "text",
          md: [
            "## `to_s` — how an object describes itself",
            "Override `to_s` and Ruby uses it automatically anywhere it needs to turn your object into text — most notably, `puts some_object` calls `to_s` for you:",
            "```\ndef to_s\n  \"#{@name} (#{price_label})\"\nend\n```",
            "Without a `to_s` override, `puts priya` would print something ugly like `#<Walker:0x00007f...>`. With it, `puts priya` reads `Priya ($24 / 30 min)` — this is Ruby's version of Swift's `CustomStringConvertible` or Python's `__str__`.",
          ],
        },
        {
          type: "code",
          title: "playground/walker_methods.rb",
          source: String.raw`class Walker
  attr_accessor :name, :price_per_30_min_cents

  def initialize(name, price_per_30_min_cents)
    @name = name
    @price_per_30_min_cents = price_per_30_min_cents
  end

  def price_label
    "$#{@price_per_30_min_cents / 100} / 30 min"
  end

  def to_s
    "#{@name} (#{price_label})"
  end

  def rename(new_name)
    self.name = new_name
  end
end

priya = Walker.new("Priya", 2400)
puts priya.price_label
puts priya
priya.rename("Priya K.")
puts priya`,
          caption: "Run it — prints `$24 / 30 min`, then `Priya ($24 / 30 min)`, then `Priya K. ($24 / 30 min)`. `puts priya` never calls `.to_s` explicitly — Ruby does that for you.",
        },
        {
          type: "quiz",
          q: "Inside `Walker`, you write `def rename(new_name); name = new_name; end` (no `self.`) hoping it updates `@name` via the `attr_accessor` setter. What actually happens?",
          choices: [
            "Ruby creates a new LOCAL variable `name` inside `rename` and assigns to that — `@name` never changes",
            "It works exactly like `self.name = new_name` — `self.` is only a style preference here",
            "Ruby raises a `NameError` because `name` was never declared with `let`",
            "It updates `@name` correctly, since Ruby infers you meant the setter",
          ],
          answer: 0,
          explain: "This is the one place explicit `self.` truly matters: a bare `name = new_name` inside a method body looks exactly like creating a local variable, so Ruby takes that reading. `self.name = new_name` is unambiguous — it forces a method call to the generated setter.",
          nudge: "The lesson called out ONE case where dropping `self.` silently breaks things — which case was it, and why does Ruby read a bare assignment that way?",
        },
        {
          type: "exercise",
          title: "Add price_label and to_s to Dog",
          prompt: [
            "Add a method `price_label` to this `Dog` class (walking price, not the dog's own) that returns `\"$#{@walk_price_cents / 100} / 30 min\"`. Then add `to_s` returning `\"#{@name}: #{price_label}\"`.",
          ],
          starter: String.raw`class Dog
  attr_accessor :name, :walk_price_cents

  def initialize(name, walk_price_cents)
    @name = name
    @walk_price_cents = walk_price_cents
  end

  # your code here
end`,
          solution: String.raw`class Dog
  attr_accessor :name, :walk_price_cents

  def initialize(name, walk_price_cents)
    @name = name
    @walk_price_cents = walk_price_cents
  end

  def price_label
    "$#{@walk_price_cents / 100} / 30 min"
  end

  def to_s
    "#{@name}: #{price_label}"
  end
end`,
          checks: [
            { re: /def price_label/, hint: "Define the method: `def price_label`." },
            { re: /@walk_price_cents\/100/, hint: "Divide the ivar by 100 inside the interpolation: `#{@walk_price_cents / 100}`." },
            { re: /def to_s/, hint: "Define `to_s` — Ruby calls this automatically from `puts`." },
            { re: /"#\{@name\}:#\{price_label\}"/, hint: "Interpolate both the name and a call to `price_label`: `\"#{@name}: #{price_label}\"`." },
          ],
          mustNot: [
            { re: /def __str__/, hint: "That's Python's method name for this — Ruby's is `to_s`." },
          ],
          success: "Data (`@name`, `@walk_price_cents`) and behavior (`price_label`, `to_s`) living in the same class — and `to_s` means `puts` prints something readable for free.",
        },
      ],
    },
    {
      id: "class-methods-constants",
      title: "Class Methods & Constants",
      steps: [
        {
          type: "text",
          md: [
            "## `def self.method_name` — a method on the CLASS, not an instance",
            "Every method you've written so far runs on an instance: `priya.price_label`. Sometimes the logic doesn't belong to any one walker — it's about walkers *in general*: finding the cheapest one, building one from raw data, counting how many exist. Prefix `def` with `self.` and the method attaches to the class itself instead:",
            "```\nclass Walker\n  def self.cheapest(walkers)\n    walkers.min_by(&:price_per_30_min_cents)\n  end\nend\n\nWalker.cheapest([priya, sam])   # called on the CLASS, not an instance\n```",
            "`walkers.min_by(&:price_per_30_min_cents)` is the `&:symbol` block shorthand from module 02 — it's equivalent to `walkers.min_by { |w| w.price_per_30_min_cents }`. Compare this to Swift's `static func` or Python's `@classmethod` — different keywords, identical idea: a method that belongs to the type, not to one instance of it.",
          ],
        },
        {
          type: "text",
          md: [
            "## Constants — `MAX_WALK_MINUTES`",
            "Back in module 01 you met constants: a capitalized name, by convention `ALL_CAPS_WITH_UNDERSCORES`. Declared inside a class body, a constant becomes a fact about that class, reachable from anywhere via `Walker::MAX_WALK_MINUTES`:",
            "```\nclass Walker\n  MAX_WALK_MINUTES = 90\nend\n\nputs Walker::MAX_WALK_MINUTES   # 90\n```",
            "The `::` (double colon) is how Ruby reaches into a class or module's namespace — you'll see it constantly for both constants and nested classes.",
          ],
        },
        {
          type: "code",
          title: "playground/class_methods.rb",
          source: String.raw`class Walker
  MAX_WALK_MINUTES = 90

  attr_accessor :name, :price_per_30_min_cents

  def initialize(name, price_per_30_min_cents)
    @name = name
    @price_per_30_min_cents = price_per_30_min_cents
  end

  def self.cheapest(walkers)
    walkers.min_by(&:price_per_30_min_cents)
  end
end

priya = Walker.new("Priya", 2400)
sam = Walker.new("Sam", 1800)

puts Walker::MAX_WALK_MINUTES
cheapest = Walker.cheapest([priya, sam])
puts cheapest.name`,
          caption: "Run it — prints `90`, then `Sam`. `Walker.cheapest(...)` is called on the class directly, no instance needed to ask the question.",
        },
        {
          type: "text",
          md: [
            "## Why this matters: factories and finders",
            "Class methods are the natural home for two jobs: **factories** (building an instance from something else — raw params, a row of data) and **finders** (searching a collection and handing back the match). `self.cheapest` above is a finder. Keep this pattern in mind, because it's about to become extremely familiar: once `Walker` is a real ActiveRecord model in module 07, `Walker.find(3)`, `Walker.find_by(name: \"Priya\")`, and `Walker.create(name: \"Sam\", ...)` are ALL class methods, generated for you the exact same way — `self.` methods that operate on the whole table of walkers, not one instance.",
          ],
        },
        {
          type: "quiz",
          q: "Why does `Walker.cheapest(walkers)` need to be defined as `def self.cheapest(walkers)` rather than a plain instance method?",
          choices: [
            "It's called directly on the `Walker` class (`Walker.cheapest(...)`), not on one walker instance — `self.` inside the class body means \"attach this to the class itself\"",
            "`self.` is required any time a method takes more than one argument",
            "Plain instance methods can't accept arrays as arguments",
            "`self.` makes a method run faster than an instance method",
          ],
          answer: 0,
          explain: "`Walker.cheapest([priya, sam])` is called on the class, with no specific walker instance in sight — that's exactly what `def self.method_name` is for. An instance method could never be called this way; it needs a `walker.` receiver.",
          nudge: "Look at the call site: `Walker.cheapest(...)` — is there an instance (like `priya`) anywhere before the dot?",
        },
        {
          type: "exercise",
          title: "Find the priciest dog's walk",
          prompt: [
            "Add a constant `MAX_WALK_MINUTES = 90` to this `Dog` class. Then add `def self.priciest(dogs)` that returns the dog with the highest `walk_price_cents`, using `max_by(&:walk_price_cents)`.",
          ],
          starter: String.raw`class Dog
  # your code here

  attr_accessor :name, :walk_price_cents

  def initialize(name, walk_price_cents)
    @name = name
    @walk_price_cents = walk_price_cents
  end
end`,
          solution: String.raw`class Dog
  MAX_WALK_MINUTES = 90

  attr_accessor :name, :walk_price_cents

  def initialize(name, walk_price_cents)
    @name = name
    @walk_price_cents = walk_price_cents
  end

  def self.priciest(dogs)
    dogs.max_by(&:walk_price_cents)
  end
end`,
          checks: [
            { re: /MAX_WALK_MINUTES=90/, hint: "Declare the constant: `MAX_WALK_MINUTES = 90`." },
            { re: /def self\.priciest\(dogs\)/, hint: "Prefix the method with `self.` so it attaches to the class: `def self.priciest(dogs)`." },
            { re: /dogs\.max_by\(&:walk_price_cents\)/, hint: "Use the block-shorthand finder: `dogs.max_by(&:walk_price_cents)`." },
          ],
          mustNot: [
            { re: /def priciest\(dogs\)/, hint: "Missing `self.` — without it this becomes an instance method, not something you can call as `Dog.priciest(...)`." },
          ],
          success: "A finder living on the class itself — exactly the shape `Dog.find`/`Dog.create` will take once ActiveRecord enters the picture in module 07.",
        },
      ],
    },
    {
      id: "inheritance",
      title: "Inheritance",
      steps: [
        {
          type: "text",
          md: [
            "## `class Puppy < Dog` — one parent, always",
            "Ruby inheritance reads almost exactly like Python's: `class Child < Parent`. The `<` means \"inherits from\" — every method and ivar-setting behavior on `Dog` is available on `Puppy` for free:",
            "```\nclass Dog\n  attr_accessor :name\n\n  def initialize(name)\n    @name = name\n  end\n\n  def speak\n    \"#{@name} makes a sound\"\n  end\nend\n\nclass Puppy < Dog\nend\n\nmochi = Puppy.new(\"Mochi\")\nputs mochi.speak       # Mochi makes a sound — inherited, unchanged\nputs mochi.is_a?(Dog)  # true — a Puppy IS a Dog\n```",
            "**Be honest about the limit**: Ruby is **single-inheritance** — `class Puppy < Dog` means exactly one parent, full stop. There's no `class Puppy < Dog, Trainable` like some languages allow. (Modules, next lesson, are Ruby's answer to needing more than one source of shared behavior.)",
          ],
        },
        {
          type: "text",
          md: [
            "## Overriding a method, and calling `super`",
            "A subclass can redefine any inherited method. Inside the new version, `super` calls the PARENT's version of that same method — useful when you want to extend behavior, not replace it outright:",
            "```\nclass Puppy < Dog\n  def initialize(name, age_months)\n    super(name)          # calls Dog#initialize with just `name`\n    @age_months = age_months\n  end\n\n  def speak\n    \"#{super} (but it's a tiny yip)\"   # calls Dog#speak, then wraps it\n  end\nend\n```",
            "`super(name)` with explicit parens passes exactly `name` up to `Dog#initialize`. Bare `super` (no parens, seen in `speak`) is a shorthand that forwards ALL of the current method's arguments automatically — `speak` takes none, so bare `super` just calls `Dog#speak` with nothing.",
          ],
        },
        {
          type: "code",
          title: "playground/inheritance.rb",
          source: String.raw`class Dog
  attr_accessor :name

  def initialize(name)
    @name = name
  end

  def speak
    "#{@name} makes a sound"
  end
end

class Puppy < Dog
  def initialize(name, age_months)
    super(name)
    @age_months = age_months
  end

  def speak
    "#{super} (but it's a tiny yip)"
  end
end

mochi = Puppy.new("Mochi", 4)
puts mochi.speak
puts mochi.is_a?(Dog)`,
          caption: "Run it — prints `Mochi makes a sound (but it's a tiny yip)`, then `true`. `Puppy` overrides `speak` but reuses `Dog`'s version via `super` instead of duplicating the string.",
        },
        {
          type: "text",
          md: [
            "## The punchline: this is how ActiveRecord works",
            "Every model in the real PawWalk backend is a subclass — same `<` syntax you just used for `Puppy < Dog`:",
            "```\nclass Walker < ApplicationRecord\nend\n```",
            "In module 07, THIS is how your hand-rolled `Walker` class gets database superpowers — `.save`, `.find`, `.where`, validations — without you writing a single line of that machinery. `ApplicationRecord` is the parent (itself inheriting from `ActiveRecord::Base`); `Walker` inherits every bit of it, same mechanism as `Puppy < Dog`, just with a much bigger parent class doing much more work.",
          ],
        },
        {
          type: "quiz",
          q: "`class Puppy < Dog` — if `Dog` has a `speak` method and `Puppy` doesn't define its own, what does `Puppy.new(\"Mochi\").speak` do?",
          choices: [
            "Calls `Dog`'s `speak` method — Puppy inherits every method Dog defines, unless it overrides one",
            "Raises `NoMethodError` — subclasses only inherit ivars, never methods",
            "Returns `nil` silently",
            "Works only if `Puppy` also writes `include Dog`",
          ],
          answer: 0,
          explain: "Inheritance means a subclass gets every method (and constant) the parent defines, automatically. `Puppy < Dog` alone — with no overrides — behaves identically to `Dog` for every method neither class redefines.",
          nudge: "Nothing in `Puppy` mentions `speak` at all. Where does Ruby look when a method isn't found on the object's own class?",
        },
        {
          type: "exercise",
          title: "A Puppy that overrides speak",
          prompt: [
            "Given the `Dog` class below, write `class Puppy < Dog` with an `initialize(name, age_months)` that calls `super(name)` then stores `@age_months = age_months`. Override `speak` to return `\"#{super} (so tiny!)\"`.",
          ],
          starter: String.raw`class Dog
  def initialize(name)
    @name = name
  end

  def speak
    "#{@name} barks"
  end
end

# your code here
`,
          solution: String.raw`class Dog
  def initialize(name)
    @name = name
  end

  def speak
    "#{@name} barks"
  end
end

class Puppy < Dog
  def initialize(name, age_months)
    super(name)
    @age_months = age_months
  end

  def speak
    "#{super} (so tiny!)"
  end
end`,
          checks: [
            { re: /class Puppy<Dog/, hint: "Inherit with `class Puppy < Dog`." },
            { re: /def initialize\(name,age_months\)/, hint: "Match the signature: `def initialize(name, age_months)`." },
            { re: /super\(name\)/, hint: "Forward just the name up to `Dog#initialize`: `super(name)`." },
            { re: /"#\{super\}\(so tiny!\)"/, hint: "Wrap the parent's result: `\"#{super} (so tiny!)\"`." },
          ],
          mustNot: [
            { re: /class Puppy\(Dog\)/, hint: "That's Python's inheritance syntax — Ruby uses `class Puppy < Dog`." },
          ],
          success: "That `< Dog` is the exact same syntax `class Walker < ApplicationRecord` uses in module 07 — inheritance is inheritance, whether the parent is 10 lines or a whole ORM.",
        },
      ],
    },
    {
      id: "modules-mixins",
      title: "Modules & Mixins",
      steps: [
        {
          type: "text",
          md: [
            "## A module is a bundle of behavior, not a blueprint",
            "A `class` makes instances (`Walker.new`). A **module**, written the same way but with `module` instead of `class`, never makes instances at all — you can't call `Trainable.new`. A module exists purely to hold methods you want to share across UNRELATED classes:",
            "```\nmodule Trainable\n  def train\n    \"#{name} is learning a new trick\"\n  end\nend\n```",
            "Where inheritance is single (`Puppy` has exactly ONE parent, `Dog`), a class can `include` as MANY modules as it wants. This is Ruby's real answer to \"I need shared behavior from more than one place\" — the gap single-inheritance left open last lesson.",
          ],
        },
        {
          type: "text",
          md: [
            "## `include` — the mixin pattern",
            "`include SomeModule` inside a class body pulls every method from that module into the class, as if they'd been defined right there:",
            "```\nclass Dog\n  include Trainable\n\n  attr_accessor :name\n\n  def initialize(name)\n    @name = name\n  end\nend\n\nmochi = Dog.new(\"Mochi\")\nputs mochi.train   # Mochi is learning a new trick\n```",
            "This pattern — a module of behavior, `include`d into a class — is called a **mixin**. It's how Ruby gets most of the benefits of multiple inheritance without actually having it: `Dog` still has exactly one superclass, but it can mix in as many modules as it needs.",
          ],
        },
        {
          type: "text",
          md: [
            "## The capstone mixin: `Comparable`",
            "Ruby ships a module called `Comparable` that, once included, gives a class `<`, `>`, `<=`, `>=`, `==`, and `.between?` — for FREE. The only thing your class has to supply is one method: `<=>` (the \"spaceship operator\"), which compares `self` to another object and returns `-1`, `0`, or `1`:",
            "```\nclass Walker\n  include Comparable\n\n  attr_accessor :name, :price_per_30_min_cents\n\n  def initialize(name, price_per_30_min_cents)\n    @name = name\n    @price_per_30_min_cents = price_per_30_min_cents\n  end\n\n  def <=>(other)\n    price_per_30_min_cents <=> other.price_per_30_min_cents\n  end\nend\n```",
            "Read `price_per_30_min_cents <=> other.price_per_30_min_cents`: that's Ruby's built-in `<=>` on two Integers, which already knows how to compare numbers. Your `Walker#<=>` just delegates to it. Once that ONE method exists, `Comparable` builds `<`, `>`, `.sort`, `.min`, `.max` — everything — on top of it, with zero extra code from you.",
          ],
        },
        {
          type: "code",
          title: "playground/comparable_walker.rb",
          source: String.raw`class Walker
  include Comparable

  attr_accessor :name, :price_per_30_min_cents

  def initialize(name, price_per_30_min_cents)
    @name = name
    @price_per_30_min_cents = price_per_30_min_cents
  end

  def <=>(other)
    price_per_30_min_cents <=> other.price_per_30_min_cents
  end
end

priya = Walker.new("Priya", 2400)
sam = Walker.new("Sam", 1800)
ana = Walker.new("Ana", 3000)

puts priya > sam
walkers = [priya, sam, ana]
puts walkers.sort.map(&:name).inspect
puts walkers.min.name`,
          caption: "Run it — prints `true`, then `[\"Sam\", \"Priya\", \"Ana\"]`, then `Sam`. `>`, `.sort`, and `.min` all came from `include Comparable` — the class defined only `<=>`.",
        },
        {
          type: "text",
          md: [
            "## Where this goes next",
            "You've now built the same shape of class five different ways across this module: plain ivars, `attr_accessor`, instance + class methods, inheritance, and now a mixin. Every one of those pieces is about to reappear in module 07 — except by then, `Walker` won't be a hand-rolled class at all. It'll be `class Walker < ApplicationRecord`, and `initialize`, `attr_accessor`, `.save`, and `.find` will all be handled by Rails. What you just built by hand is what you're about to get automatically — and now you'll know exactly what's happening underneath it.",
          ],
        },
        {
          type: "quiz",
          q: "A class includes `Comparable` and defines only `<=>`. What does that buy the class, for free?",
          choices: [
            "`<`, `>`, `<=`, `>=`, `==`, `.between?`, and sortability via `.sort`/`.min`/`.max` — all built on top of the one `<=>` method",
            "Nothing extra — `Comparable` is just documentation, you still have to write each operator yourself",
            "Only `.sort` — the individual operators (`<`, `>`) still need to be defined separately",
            "A full `initialize` method, generated from the class's ivars",
          ],
          answer: 0,
          explain: "That's the entire point of the `Comparable` mixin: implement `<=>` once, and every comparison operator plus `Array#sort`/`#min`/`#max` come for free, because they're all implemented in terms of `<=>` internally.",
          nudge: "The lesson listed several operators AND some Array methods that all rode along with one `<=>` definition. How many methods did the class itself define?",
        },
        {
          type: "exercise",
          title: "Capstone: a Comparable Walker",
          prompt: [
            "This `Walker` class already has `include Comparable`. Add `def <=>(other)` that compares by `price_per_30_min_cents` using Ruby's built-in `<=>` on the two Integers.",
          ],
          starter: String.raw`class Walker
  include Comparable
  attr_accessor :name, :price_per_30_min_cents

  def initialize(name, price_per_30_min_cents)
    @name = name
    @price_per_30_min_cents = price_per_30_min_cents
  end

  # your code here
end`,
          solution: String.raw`class Walker
  include Comparable
  attr_accessor :name, :price_per_30_min_cents

  def initialize(name, price_per_30_min_cents)
    @name = name
    @price_per_30_min_cents = price_per_30_min_cents
  end

  def <=>(other)
    price_per_30_min_cents <=> other.price_per_30_min_cents
  end
end`,
          checks: [
            { re: /def<=>\(other\)/, hint: "Define the spaceship operator: `def <=>(other)`." },
            { re: /price_per_30_min_cents<=>other\.price_per_30_min_cents/, hint: "Delegate to Integer's own `<=>`: `price_per_30_min_cents <=> other.price_per_30_min_cents`." },
          ],
          mustNot: [
            { re: /def<\(other\)/, hint: "Don't define `<` directly — implement `<=>` once and `Comparable` builds `<`, `>`, and the rest for you." },
          ],
          success: "One method, and this Walker can now be compared, sorted, and ranked with zero extra code — the mixin pattern doing exactly what it's for.",
        },
      ],
    },
  ],
});
