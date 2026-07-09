window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "metaprogramming-rails-magic",
  title: "Metaprogramming & Rails Magic",
  emoji: "🪄",
  lang: "ruby",
  lessons: [
    {
      id: "introspection",
      title: "Introspection",
      steps: [
        {
          type: "text",
          md: [
            "## The module that pays off everything",
            "You've built the object model (24), closures (25), and the Enumerable/pattern layer (26). Now the reward: **metaprogramming** — code that inspects and writes code at runtime. This is what Rails is *made of*. `has_many`, `validates`, `enum`, `find_by_email` — every one is metaprogramming, and by the end of this module you'll build a working `validates` yourself. The theme: **Rails isn't magic, it's Ruby.**",
            "> In an interview, say: \"Metaprogramming is writing code that operates on code at runtime — introspecting objects and defining methods on the fly. Rails' DSLs are all built from it, so understanding it turns 'magic' into mechanism I can debug.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## Ask an object what it can do",
            "Everything in Ruby is inspectable at runtime. The core questions:",
            "- **`obj.respond_to?(:save)`** — can it handle this message? (Check before calling, for duck typing.)\n- **`obj.methods`** / **`obj.public_methods`** — every method it answers to.\n- **`obj.instance_variables`** and **`obj.instance_variable_get(:@name)`** — peek at internal state.\n- **`obj.class`**, **`obj.class.ancestors`** — where it sits in the object model.",
            "These aren't debugging-only tricks; `respond_to?` is how idiomatic Ruby does capability checks instead of type checks — \"can you quack?\" over \"are you a Duck?\"",
          ],
        },
        {
          type: "code",
          title: "playground/introspect.rb",
          source: String.raw`class Booking
  def initialize(status) = @status = status
  def confirm! = @status = "confirmed"
end

b = Booking.new("pending")

p b.respond_to?(:confirm!)          # true
p b.respond_to?(:cancel!)           # false
p b.instance_variables              # [:@status]
p b.instance_variable_get(:@status) # "pending"

# the debugging superpower: where does a method actually live?
m = b.method(:confirm!)
p m.owner            # Booking
p m.arity            # 0
p m.source_location  # ["playground/introspect.rb", 3]`,
          caption: "`respond_to?` for capability checks, `instance_variable_get` to inspect state, and — the standout — `method(:name).source_location`, which tells you the exact file and line a method is defined on. In a big Rails app that's how you find *which* of 40 ancestors actually defined `save`.",
        },
        {
          type: "text",
          md: [
            "## source_location: your Rails debugging superpower",
            "When a method's behavior surprises you in a Rails app, `SomeModel.instance_method(:foo).source_location` (or `obj.method(:foo).source_location`) jumps you straight to where it's defined — through all the mixins and gems. It's the fastest way to answer \"where is this coming from?\" when method lookup (module 24) has pulled something in from a module you didn't write.",
            "> In an interview, say: \"When a method behaves unexpectedly, `method(:x).source_location` gives me the exact file and line, even for something injected by a gem or concern. It turns 'where does this even come from' into a two-second lookup.\"",
          ],
        },
        {
          type: "quiz",
          q: "A `booking.save` in your app does something surprising and you suspect a gem overrode it. What's the fastest way to find where `save` is actually defined?",
          choices: [
            "`booking.method(:save).source_location` — returns the exact file and line, through all mixins",
            "Read every gem's source until you find `def save`",
            "`booking.save.class` — returns the defining class",
            "There's no way to find it; method lookup is opaque at runtime",
          ],
          answer: 0,
          explain: "`method(:save)` returns a Method object bound to that receiver, and `.source_location` gives the `[file, line]` where it's defined — resolving through the entire ancestor chain to the *actual* definition, gem or concern included. This is the single most useful introspection call for debugging 'magic', because it makes method lookup concrete instead of mysterious.",
          nudge: "Which introspection method returns the `[file, line]` a method is defined at?",
        },
        {
          type: "exercise",
          title: "Check capability before calling",
          prompt: [
            "Write a method `safe_confirm(obj)` that calls `obj.confirm!` **only if** the object responds to it (use `respond_to?`), otherwise returns the string `\"cannot confirm\"`.",
          ],
          starter: String.raw`def safe_confirm(obj)
  # your code here
end`,
          solution: String.raw`def safe_confirm(obj)
  if obj.respond_to?(:confirm!)
    obj.confirm!
  else
    "cannot confirm"
  end
end`,
          checks: [
            { re: /respond_to\?\(:confirm!\)/, hint: "Guard with a capability check: `obj.respond_to?(:confirm!)`." },
            { re: /obj\.confirm!/, hint: "Call it when supported: `obj.confirm!`." },
            { re: /"cannot confirm"/, hint: "Return the fallback string when not: `\"cannot confirm\"`." },
          ],
          mustNot: [
            { re: /is_a\?|kind_of\?|instance_of\?/, hint: "Duck-type with `respond_to?`, not a class check — care about the capability, not the type." },
          ],
          success: "`respond_to?` before calling is idiomatic duck typing — you ask what an object *can do*, not what it *is*. This is the introspection foundation the rest of the module builds on.",
        },
      ],
    },
    {
      id: "send-and-public-send",
      title: "send & public_send",
      steps: [
        {
          type: "text",
          md: [
            "## Call a method by its name-as-data",
            "`send` calls a method whose name you have as a symbol or string: `booking.send(:confirm!)` is the same as `booking.confirm!`. The power is that the name can be *computed* — from user input, a config value, a database column. This is how a generic controller can call `record.public_send(params[:action])` or how a serializer reads every attribute by name.",
            "> In an interview, say: \"`send` invokes a method from its name as data — essential when the method to call is determined at runtime. I default to `public_send` so I don't accidentally reach past an object's public interface.\"",
          ],
        },
        {
          type: "code",
          title: "playground/send.rb",
          source: String.raw`class Walker
  def name  = "Priya"
  def rating = 4.8
  def phone = "555-0100"
end

w = Walker.new

# call a method whose name is data
p w.send(:name)                 # "Priya"

# drive a computed list of attributes — the serializer pattern
attrs = [:name, :rating]
row = attrs.map { |a| w.public_send(a) }
p row                           # ["Priya", 4.8]

# build a hash of selected fields dynamically
p attrs.to_h { |a| [a, w.public_send(a)] }  # {name: "Priya", rating: 4.8}`,
          caption: "`send`/`public_send` turn a *list of method names* into a *list of results* — the core move behind serializers, form builders, and CSV exporters. The method names are data, so the same three lines work for any attribute set.",
        },
        {
          type: "text",
          md: [
            "## send vs public_send — the security difference",
            "`send` can call **private and protected** methods too — it bypasses visibility entirely. That's occasionally useful (testing, deliberate framework internals) but dangerous with untrusted input: `record.send(params[:method])` could invoke `destroy` or a private helper. **`public_send`** respects visibility and raises `NoMethodError` for non-public methods.",
            "> Red flag: `send` with a user-supplied method name. Say: \"Never pass untrusted input to `send` — it bypasses private/protected. Use `public_send`, and ideally allowlist the permitted names.\"",
          ],
        },
        {
          type: "quiz",
          q: "A controller does `record.send(params[:field])` to render a dynamic attribute. Why is this a vulnerability, and what's the fix?",
          choices: [
            "`send` bypasses visibility, so a crafted param could call a private method like `destroy_all` — use `public_send` plus an allowlist",
            "`send` is always slower than a direct call, so it's a performance bug only",
            "`send` doesn't work with symbols from params, so it silently fails",
            "There's no issue; `send` and `public_send` are identical",
          ],
          answer: 0,
          explain: "`send` ignores method visibility — it can invoke private and protected methods. With a user-controlled name, an attacker could reach methods never meant to be callable from outside, including destructive ones. The fix is two-fold: `public_send` (which respects visibility and can't reach private methods) and an explicit allowlist of permitted field names, so only intended attributes are reachable. Trusting `params` into `send` is a real, exploited class of bug.",
          nudge: "What can `send` reach that `public_send` cannot? Now imagine the name comes from `params`.",
        },
        {
          type: "exercise",
          title: "Read fields dynamically and safely",
          prompt: [
            "Write `extract(obj, fields)` that maps each symbol in `fields` to the result of calling that method on `obj`, using the **visibility-respecting** variant of send. Return an array of results.",
          ],
          starter: String.raw`def extract(obj, fields)
  fields.map { |f| }  # your code here — use the safe send
end`,
          solution: String.raw`def extract(obj, fields)
  fields.map { |f| obj.public_send(f) }
end`,
          checks: [
            { re: /fields\.map/, hint: "Map over the field names: `fields.map { |f| ... }`." },
            { re: /obj\.public_send\(f\)/, hint: "Call each safely: `obj.public_send(f)`." },
          ],
          mustNot: [
            { re: /obj\.send\(f\)/, hint: "Use `public_send`, not `send` — `send` bypasses private methods, which is unsafe with dynamic names." },
          ],
          success: "`public_send` calls by computed name while respecting visibility — the safe default for anything driven by data. This is the mechanism inside every Rails serializer.",
        },
      ],
    },
    {
      id: "define-method",
      title: "define_method",
      steps: [
        {
          type: "text",
          md: [
            "## Write methods from data — no repetition",
            "`define_method` creates a method at runtime from a name and a block. Instead of hand-writing five nearly-identical predicates, you generate them from a list. This is the *other half* of metaprogramming: `send` calls methods dynamically, `define_method` *defines* them dynamically.",
            "> In an interview, say: \"`define_method` generates methods from data at load time, so a list of statuses becomes a set of predicate methods with no duplication. It's exactly how ActiveRecord's `enum` gives you `confirmed?` and `cancelled?` for free.\"",
          ],
        },
        {
          type: "code",
          title: "playground/define_method.rb",
          source: String.raw`class Booking
  STATUSES = %w[pending confirmed cancelled completed]

  def initialize(status) = @status = status

  # generate one predicate per status: confirmed?, cancelled?, ...
  STATUSES.each do |s|
    define_method("#{s}?") { @status == s }
  end
end

b = Booking.new("confirmed")
p b.confirmed?   # true
p b.pending?     # false
p b.cancelled?   # false
p Booking.instance_methods(false).sort  # [:cancelled?, :completed?, :confirmed?, :pending?]`,
          caption: "One loop, four generated predicate methods — `confirmed?`, `pending?`, `cancelled?`, `completed?`. This is *precisely* what `enum :status, {...}` does in your real `Booking` model: it reads the status list and `define_method`s a predicate for each. No magic — a loop and `define_method`.",
        },
        {
          type: "text",
          md: [
            "## define_method vs def: the closure difference",
            "`define_method` takes a **block**, so the generated method **closes over** the surrounding scope (module 25) — that's why `s` is visible inside it. A normal `def` is a scope gate and couldn't see `s`. This is the reason `define_method` is the tool for generated methods that need to capture loop variables or configuration.",
            "It's also how Rails' `delegate :name, to: :walker` works: it `define_method`s a `name` method whose body is `walker.name`, capturing the target. And `attr_accessor`? Effectively `define_method` for a getter and setter.",
          ],
        },
        {
          type: "quiz",
          q: "Why must you use `define_method` (not `def`) to generate a method inside an `each` loop that references the loop variable `s`?",
          choices: [
            "`define_method` takes a block that closes over `s`; `def` is a scope gate and can't see the loop variable",
            "`def` can't be used inside a loop at all — it's a syntax error",
            "`define_method` is faster in loops",
            "`def` would define the method on the wrong class",
          ],
          answer: 0,
          explain: "`def` opens a brand-new local scope (a scope gate, from module 24) — code inside a `def` body cannot see the loop's `s`. `define_method` instead takes a *block*, and blocks are closures that capture the surrounding locals, so the generated method body can reference `s`. That closure behavior is exactly why `define_method` exists for data-driven method generation.",
          nudge: "One of them is a scope gate that can't see outer locals; the other takes a closure. Which sees `s`?",
        },
        {
          type: "exercise",
          title: "Generate predicate methods",
          prompt: [
            "Inside this class, loop over `ROLES` and use `define_method` to generate a predicate for each — `admin?`, `walker?`, `owner?` — that returns `@role == r`. Fill in the loop body.",
          ],
          starter: String.raw`class User
  ROLES = %w[admin walker owner]
  def initialize(role) = @role = role

  ROLES.each do |r|
    # your code here
  end
end

p User.new("admin").admin?   # true`,
          solution: String.raw`class User
  ROLES = %w[admin walker owner]
  def initialize(role) = @role = role

  ROLES.each do |r|
    define_method("#{r}?") { @role == r }
  end
end

p User.new("admin").admin?`,
          checks: [
            { re: /define_method\("#\{r\}\?"\)/, hint: "Generate the method named per role: `define_method(\"#{r}?\")`." },
            { re: /@role==r/, hint: "The body compares state to the captured role: `{ @role == r }`." },
          ],
          mustNot: [
            { re: /def #\{r\}/, hint: "You can't interpolate into a `def` name, and `def` couldn't see `r` anyway — use `define_method` with a block." },
          ],
          success: "A three-line loop generated three predicate methods that each close over `r`. That's the engine behind `enum`, `delegate`, and `attr_accessor` — you just built it.",
        },
      ],
    },
    {
      id: "method-missing",
      title: "method_missing & Ghost Methods",
      steps: [
        {
          type: "text",
          md: [
            "## The last stop in method lookup",
            "Remember the ancestor chain from module 24? When Ruby walks it and finds *nothing*, it doesn't give up — it sends the object one more message: `method_missing(name, *args)`. The default implementation raises `NoMethodError`. But override it, and you can respond to methods that *don't exist* — \"ghost methods.\" This is how `find_by_email_and_status` works in Rails without anyone defining it.",
            "> In an interview, say: \"`method_missing` is the hook Ruby calls when method lookup fails. Overriding it lets an object answer messages it has no explicit method for — the basis of ActiveRecord's dynamic finders and OpenStruct — as long as you pair it with `respond_to_missing?`.\"",
          ],
        },
        {
          type: "code",
          title: "playground/method_missing.rb",
          source: String.raw`class WalkerRecord
  def initialize(attrs) = @attrs = attrs

  def method_missing(name, *args)
    key = name.to_s
    if @attrs.key?(key)
      @attrs[key]                      # respond to any attribute name
    else
      super                            # not ours -> normal NoMethodError
    end
  end

  def respond_to_missing?(name, include_private = false)
    @attrs.key?(name.to_s) || super
  end
end

w = WalkerRecord.new("name" => "Priya", "rating" => 4.8)
p w.name                 # "Priya"  (ghost method)
p w.rating               # 4.8      (ghost method)
p w.respond_to?(:name)   # true     (respond_to_missing? makes it honest)
# w.nonexistent          # NoMethodError, via super`,
          caption: "`WalkerRecord` has no `name` or `rating` method — `method_missing` intercepts them and reads the hash. Crucially, unknown names call `super` so real errors still surface, and `respond_to_missing?` keeps `respond_to?` truthful. This is a hand-built slice of OpenStruct / ActiveRecord attributes.",
        },
        {
          type: "text",
          md: [
            "## The contract: always pair it with respond_to_missing?",
            "The number-one `method_missing` mistake is forgetting `respond_to_missing?`. If you handle `name` in `method_missing` but don't teach `respond_to_missing?`, then `w.respond_to?(:name)` lies (returns false), and anything relying on it — `&:name`, serializers, duck-typing checks — breaks. The two must agree. And always call `super` in `method_missing` for names you don't handle, so genuine typos still raise `NoMethodError`.",
            "> Red flag: `method_missing` without `respond_to_missing?`. Say: \"They're a contract — override both, or `respond_to?` and everything built on it will lie about what the object can do.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## The cost: know when NOT to use it",
            "`method_missing` runs only *after* a full failed lookup down the ancestor chain, so it's slower than a real method, and it makes methods invisible to `methods`/introspection. The senior judgment call: for a *known, finite* set of names, prefer `define_method` (real methods, fast, introspectable). Reserve `method_missing` for genuinely *open-ended* names you can't enumerate ahead of time. Rails actually generates real attribute methods on first use partly for this reason.",
          ],
        },
        {
          type: "quiz",
          q: "You add `method_missing` to handle dynamic attributes but skip `respond_to_missing?`. What breaks?",
          choices: [
            "`respond_to?(:that_attr)` returns false, so `&:that_attr`, serializers, and duck-type checks all misbehave",
            "Nothing — `respond_to_missing?` is optional sugar",
            "`method_missing` itself stops being called",
            "The class fails to load with a syntax error",
          ],
          answer: 0,
          explain: "`respond_to?` doesn't know about the messages your `method_missing` secretly handles unless you also implement `respond_to_missing?`. Skip it and `respond_to?(:that_attr)` returns false even though calling `that_attr` works — so `Symbol#to_proc` (`&:that_attr`), serializers, and any `respond_to?`-based duck typing get a wrong answer. The two methods are a required pair: whatever `method_missing` handles, `respond_to_missing?` must acknowledge.",
          nudge: "`method_missing` makes a call *work*, but what tells `respond_to?` the object can handle it?",
        },
        {
          type: "exercise",
          title: "Complete the method_missing contract",
          prompt: [
            "This `Config` reads keys from a hash via `method_missing`, but the contract is incomplete. Add `respond_to_missing?` so it returns true for any key present in `@data` (fall back to `super` otherwise).",
          ],
          starter: String.raw`class Config
  def initialize(data) = @data = data

  def method_missing(name, *)
    @data.key?(name) ? @data[name] : super
  end

  # your code here
end`,
          solution: String.raw`class Config
  def initialize(data) = @data = data

  def method_missing(name, *)
    @data.key?(name) ? @data[name] : super
  end

  def respond_to_missing?(name, include_private = false)
    @data.key?(name) || super
  end
end`,
          checks: [
            { re: /def respond_to_missing\?\(name/, hint: "Define the partner method: `def respond_to_missing?(name, include_private = false)`." },
            { re: /@data\.key\?\(name\)\|\|super/, hint: "Return true for known keys, else defer: `@data.key?(name) || super`." },
          ],
          mustNot: [
            { re: /def respond_to\?\(/, hint: "Override `respond_to_missing?`, not `respond_to?` directly — Ruby routes through the former for you." },
          ],
          success: "Now `method_missing` and `respond_to_missing?` agree — the object honestly reports what it can handle. That's the complete, non-lying ghost-method contract.",
        },
      ],
    },
    {
      id: "hooks-and-concerns",
      title: "Hooks & Concerns",
      steps: [
        {
          type: "text",
          md: [
            "## Ruby tells you when things happen to a class",
            "Classes and modules have lifecycle **hooks** — methods Ruby calls automatically at key moments:",
            "- **`included(base)`** — fired when a module is `include`d into `base`.\n- **`extended(base)`** — fired when a module `extend`s an object.\n- **`inherited(subclass)`** — fired when a class is subclassed.\n- **`method_added(name)`** — fired when a method is defined.",
            "These are the seams Rails hooks into to inject behavior at exactly the right moment. `included` is the star: it's how a module can add *both* instance methods *and* class methods when mixed in.",
            "> In an interview, say: \"`included`, `inherited`, and friends are runtime hooks Ruby fires during class construction. Rails uses `included` to inject class-level macros when a concern is mixed in — that's the whole mechanism behind `ActiveSupport::Concern`.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## The problem included solves",
            "When you `include` a module, its methods become *instance* methods. But macros like `has_many` are *class* methods. So how does one `include Trackable` give a class both `#track!` (instance) and `.tracked_count` (class-level) and run some setup? Answer: the `included` hook fires with the target class, and inside it you `extend` a class-methods sub-module and run configuration.",
          ],
        },
        {
          type: "code",
          title: "playground/concern.rb",
          source: String.raw`module Trackable
  def self.included(base)               # hook: runs when included
    base.extend(ClassMethods)           # add CLASS methods
    base.instance_variable_set(:@events, [])
  end

  module ClassMethods
    def events = @events                # a class-level method
  end

  def track!(event)                     # an INSTANCE method
    self.class.events << event
    "tracked #{event}"
  end
end

class Booking
  include Trackable                     # triggers self.included(Booking)
end

b = Booking.new
puts b.track!("confirmed")   # tracked confirmed
puts b.track!("completed")   # tracked completed
p Booking.events             # ["confirmed", "completed"]`,
          caption: "One `include Trackable` gave `Booking` an instance method (`track!`) AND a class method (`events`) AND ran setup — all coordinated by the `included` hook. This is a from-scratch `ActiveSupport::Concern`; Rails just wraps this exact pattern in nicer syntax (`included do ... end` + `class_methods do ... end`).",
        },
        {
          type: "text",
          md: [
            "## This is how has_many works",
            "Now the big reveal. `has_many :bookings` is a class method (defined via the object model, module 24) that, when called in the class body, uses `define_method` (this module) to generate the `bookings` reader and `bookings=` writer — capturing the association name in a closure (module 25). The reader hands back a collection proxy whose *own* methods (`build`, `create`, `where`) come from ActiveRecord — they live on the proxy, not on your model. The reader/writer are added to the class the moment the macro runs. Every layer of this tier converges here: **Rails is the object model + closures + define_method + hooks, arranged deliberately.**",
          ],
        },
        {
          type: "quiz",
          q: "A module needs to add both instance methods and class-level macros when mixed in with `include`. What's the mechanism?",
          choices: [
            "Define `self.included(base)` and call `base.extend(ClassMethods)` inside it — the hook fires on include and adds the class methods",
            "Use `include` twice — once for instance methods, once for class methods",
            "Class methods can't be added by a module; you must reopen the class manually",
            "Define the class methods with `def self.x` inside the module — they transfer automatically on include",
          ],
          answer: 0,
          explain: "`include` only adds *instance* methods. To also add class methods, you hook the `self.included(base)` callback — which Ruby fires with the including class — and call `base.extend(SomeClassMethodsModule)` there. `extend` mixes those methods into the class's singleton class (module 24), making them class methods. This coordinated pattern is exactly what `ActiveSupport::Concern` automates. (Option 4 is wrong: a module's `def self.x` methods belong to the module itself and don't transfer on include.)",
          nudge: "Which hook fires on `include` and receives the target class, letting you `extend` it with class methods?",
        },
        {
          type: "exercise",
          title: "Add class methods via the included hook",
          prompt: [
            "Complete `Auditable` so that including it runs the `included` hook and extends the base class with `ClassMethods`. Write `def self.included(base)` calling `base.extend(ClassMethods)`.",
          ],
          starter: String.raw`module Auditable
  # your code here

  module ClassMethods
    def audit_log = "audit ready"
  end
end

class Payment
  include Auditable
end

p Payment.audit_log   # "audit ready"`,
          solution: String.raw`module Auditable
  def self.included(base)
    base.extend(ClassMethods)
  end

  module ClassMethods
    def audit_log = "audit ready"
  end
end

class Payment
  include Auditable
end

p Payment.audit_log`,
          checks: [
            { re: /def self\.included\(base\)/, hint: "Define the hook: `def self.included(base)`." },
            { re: /base\.extend\(ClassMethods\)/, hint: "Inside it, add the class methods: `base.extend(ClassMethods)`." },
          ],
          mustNot: [
            { re: /base\.include\(ClassMethods\)/, hint: "Use `extend` (adds class methods), not `include` (adds instance methods), for `ClassMethods`." },
          ],
          success: "The `included` hook fired on `include Auditable` and extended `Payment` with a class method. You've built the core of `ActiveSupport::Concern` by hand.",
        },
      ],
    },
    {
      id: "mini-validates-dsl",
      title: "Capstone: Build a Mini validates DSL",
      steps: [
        {
          type: "text",
          md: [
            "## The payoff: recreate Rails validations from scratch",
            "Everything in this tier converges into one capstone. You'll build a working `validates` — a class-level macro that records rules, plus an instance `valid?` that runs them. When you're done, `validates :name, presence: true` will work on a plain Ruby class *you built*, and you'll understand every line of it. That's the module's thesis made concrete: **Rails is Ruby you already know.**",
            "> In an interview, say: \"I can explain Rails validations end to end: `validates` is a class method that stores rules in class-level state, and `valid?` is an instance method that reads those rules and checks each attribute. It's the object model plus a little metaprogramming — no magic.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## The pieces you already have",
            "The DSL is a synthesis of the whole tier:",
            "1. **`validates` is a class method** (module 24 — a method call on `self`, where `self` is the class in the class body).\n2. **Rules live in class-level state** — a class instance variable set up in the `included` hook (this module).\n3. **`valid?` uses `public_send`** to read each attribute by its symbol name (this module).\n4. **The rule checks are just Ruby** — `presence: true` means \"the value isn't nil or empty.\"",
            "Read the code below slowly — you can name the mechanism behind every line now.",
          ],
        },
        {
          type: "code",
          title: "playground/mini_validations.rb",
          source: String.raw`module MiniValidations
  def self.included(base)
    base.extend(ClassMethods)
    base.instance_variable_set(:@rules, [])
  end

  module ClassMethods
    def validates(attr, presence: false)      # the DSL macro
      @rules << [attr, :presence] if presence
    end
    def rules = @rules
  end

  def errors = @errors ||= []

  def valid?
    @errors = []
    self.class.rules.each do |attr, _rule|
      value = public_send(attr)               # read the attribute by name
      @errors << "#{attr} can't be blank" if value.nil? || value == ""
    end
    @errors.empty?
  end
end

class Booking
  include MiniValidations
  attr_accessor :name, :status
  validates :name, presence: true             # <-- your own DSL, in a class body
  validates :status, presence: true
end

b = Booking.new
b.name = "Mochi walk"
p b.valid?    # false (status is blank)
p b.errors    # ["status can't be blank"]
b.status = "confirmed"
p b.valid?    # true`,
          caption: "A real, working `validates`. The `included` hook sets up per-class rule storage; `validates` is a class method appending rules; `valid?` reads each attribute with `public_send` and checks it. `include ActiveModel::Validations` in real Rails is a bigger, battle-tested version of exactly this shape.",
        },
        {
          type: "text",
          md: [
            "## When to reach for metaprogramming — and when not",
            "You now have the power; here's the senior judgment. Metaprogramming is worth it when it *removes real, repetitive duplication* behind a clean interface used many times — a DSL, an ORM, a serializer. It's a mistake when it *hides* control flow for a one-off: a `define_method` used once is harder to read than a plain `def`.",
            "> In an interview, say (the 3-beat trade-off): \"Metaprogramming's cost is real — it's harder to grep, harder to debug, and can slow method lookup. But the alternative for a DSL is hundreds of lines of near-identical boilerplate that drift out of sync. So I use it for genuine framework-level leverage where it's written once and used everywhere, and I keep application code boring and explicit. Long term, that means new methods come free as data grows, instead of a maintenance tax per case.\"",
          ],
        },
        {
          type: "quiz",
          q: "In the mini `validates` DSL, when does the `validates :name, presence: true` line actually execute, and what does it do?",
          choices: [
            "At class-definition time — it's a class method call that appends a rule to the class's `@rules`, read later by `valid?`",
            "Every time you call `valid?` — it re-runs the macro on each validation",
            "At `Booking.new` time — the constructor runs the validations",
            "It never executes; it's a special keyword Ruby interprets",
          ],
          answer: 0,
          explain: "`validates` is an ordinary class method, and the line runs *once*, when the class body is evaluated at definition time (module 24: bare calls in a class body go to `self`, the class). It appends `[:name, :presence]` to the class-level `@rules`. Later, each `valid?` call *reads* that stored rule list and checks the current attribute values. Separating 'declare the rules once' from 'check them many times' is the entire design — and it's why `validates` isn't a keyword, just a method.",
          nudge: "Bare method calls in a class body run when the class is defined. Is `validates` a keyword, or a class method call?",
        },
        {
          type: "exercise",
          title: "Add a presence check to valid?",
          prompt: [
            "Complete `valid?` so it reads each rule's attribute with `public_send` and records an error when the value is blank. Fill in the loop body: read the value, then push `\"#{attr} can't be blank\"` onto `@errors` if it's `nil` or `\"\"`.",
          ],
          starter: String.raw`def valid?
  @errors = []
  self.class.rules.each do |attr, _rule|
    # your code here
  end
  @errors.empty?
end`,
          solution: String.raw`def valid?
  @errors = []
  self.class.rules.each do |attr, _rule|
    value = public_send(attr)
    @errors << "#{attr} can't be blank" if value.nil? || value == ""
  end
  @errors.empty?
end`,
          checks: [
            { re: /value=public_send\(attr\)/, hint: "Read the attribute by name: `value = public_send(attr)`." },
            { re: /@errors<<"#\{attr\}can't be blank"/, hint: "Record the error message: `@errors << \"#{attr} can't be blank\"`." },
            { re: /if value\.nil\?\|\|value==""/, hint: "Only when blank: `if value.nil? || value == \"\"`." },
          ],
          mustNot: [
            { re: /instance_variable_get/, hint: "Read through the public method with `public_send(attr)`, not by poking at ivars directly — that's how real validations work." },
          ],
          success: "You just wrote the heart of a validation engine — `public_send` to read attributes, a blank check, error accumulation. That completes the deep-Ruby tier: object model, closures, Enumerable, and metaprogramming. You can now read Rails' source and see plain Ruby where you used to see magic.",
        },
      ],
    },
  ],
});
