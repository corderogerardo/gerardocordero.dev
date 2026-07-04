window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "design-patterns",
  title: "Design Patterns (All 23 GoF)",
  emoji: "🧠",
  lang: "ruby",
  lessons: [
    // ───────────────────────────── CREATIONAL ─────────────────────────────
    {
      id: "singleton",
      title: "Singleton",
      steps: [
        { type: "text", md: [
          "## Singleton: one shared instance for the whole app",
          "**Problem:** you want exactly *one* instance of something — a `Config`, a shared `Stripe` client, a logger — and one global point to reach it.",
          "**PawWalk scenario:** app configuration loaded once at boot. Every part of the API reads the same `Config` object; nobody should build a second one.",
          "Ruby ships the pattern in the stdlib: `require \"singleton\"; include Singleton` makes `.new` private and gives you `.instance`.",
          "> Be honest: in Ruby a plain constant or a module of module-methods is *usually* enough. Reach for `Singleton` only when you need lazy init plus a real object with state." ] },
        { type: "code", title: "playground/singleton.rb", source: String.raw`require "singleton"

class Config
  include Singleton
  attr_accessor :stripe_key, :base_url

  def initialize
    @stripe_key = ENV["STRIPE_KEY"]
    @base_url   = "https://api.pawwalk.dev"
  end
end

Config.instance.base_url            # => "https://api.pawwalk.dev"
Config.instance.equal?(Config.instance)  # => true (same object)
# Config.new                        # => NoMethodError: private method`, caption: "include Singleton privatizes .new and memoizes one .instance." },
        { type: "quiz",
          q: "After include Singleton, what happens when you call Config.new?",
          choices: ["It raises NoMethodError — .new is now private","It returns the shared instance","It builds a fresh, separate Config","It raises FrozenError"],
          answer: 0,
          explain: "Singleton makes .new private so the ONLY way in is Config.instance, guaranteeing one object.",
          nudge: "The whole point is that there is exactly one way to get the instance." },
        { type: "exercise", title: "Make Config a singleton",
          prompt: ["Add the two lines that turn Config into a singleton: require the stdlib and include the module."],
          starter: String.raw`# your code here

class Config
  # include the module here
  attr_accessor :stripe_key
end`,
          solution: String.raw`require "singleton"

class Config
  include Singleton
  attr_accessor :stripe_key
end`,
          checks: [
            { re: /require"singleton"/, hint: "Pull in the stdlib: require \"singleton\"." },
            { re: /include Singleton/, hint: "Inside the class: include Singleton." },
          ],
          mustNot: [ { re: /def instance/, hint: "Let the module supply .instance — don't hand-write it." } ],
          success: "Two lines and Config can never be duplicated." },
      ],
    },
    {
      id: "factory-method",
      title: "Factory Method",
      steps: [
        { type: "text", md: [
          "## Factory Method: a method picks the concrete class",
          "**Problem:** callers should ask for *what* they want, not know *which* class builds it.",
          "**PawWalk scenario:** a booking update goes out over email, SMS, or push. A single `notifier_for(channel)` returns the right notifier; the rest of the code just calls `.notify`.",
          "In Ruby this is often a plain `case` in one method — no `Creator` subclass hierarchy needed. That IS the factory method." ] },
        { type: "code", title: "playground/factory_method.rb", source: String.raw`EmailNotifier = Struct.new(:x) { def notify(msg) = "email: #{msg}" }
SmsNotifier   = Struct.new(:x) { def notify(msg) = "sms: #{msg}" }
PushNotifier  = Struct.new(:x) { def notify(msg) = "push: #{msg}" }

def notifier_for(channel)
  case channel
  when "email" then EmailNotifier.new
  when "sms"   then SmsNotifier.new
  else              PushNotifier.new
  end
end

notifier_for("sms").notify("Walk confirmed")   # => "sms: Walk confirmed"`, caption: "One method decides the class; callers stay ignorant of it." },
        { type: "quiz",
          q: "What does the Factory Method pattern let callers avoid knowing?",
          choices: ["Which concrete class to instantiate","How many CPUs the host has","The Ruby version","Whether a block was given"],
          answer: 0,
          explain: "Callers name the intent (a channel) and the factory maps it to a concrete class.",
          nudge: "It hides the 'which class' decision behind one method." },
        { type: "exercise", title: "Build the right notifier",
          prompt: ["Finish notifier_for so \"email\" returns EmailNotifier.new and anything else returns PushNotifier.new."],
          starter: String.raw`def notifier_for(channel)
  # your code here
end`,
          solution: String.raw`def notifier_for(channel)
  if channel == "email"
    EmailNotifier.new
  else
    PushNotifier.new
  end
end`,
          checks: [
            { re: /def notifier_for\(channel\)/, hint: "Keep the signature: def notifier_for(channel)." },
            { re: /channel=="email"/, hint: "Branch on the channel: channel == \"email\"." },
            { re: /EmailNotifier.new/, hint: "Return EmailNotifier.new for email." },
            { re: /PushNotifier.new/, hint: "Fall back to PushNotifier.new." },
          ],
          success: "One method, all the branching — that's a factory method." },
      ],
    },
    {
      id: "abstract-factory",
      title: "Abstract Factory",
      steps: [
        { type: "text", md: [
          "## Abstract Factory: build FAMILIES of related objects",
          "**Problem:** you need a *matched set* of objects that must be used together — mixing them would be a bug.",
          "**PawWalk scenario:** for payments you need a charger AND a refunder that belong to the same provider. Stripe's charger with PayPal's refunder is nonsense. An abstract factory hands you a coherent pair.",
          "In Ruby the 'factory' is often just a method returning a small object (a `Struct` or `OpenStruct`) that exposes the related methods." ] },
        { type: "code", title: "playground/abstract_factory.rb", source: String.raw`StripeKit = Struct.new(:x) do
  def charge(cents)  = "stripe charge #{cents}"
  def refund(cents)  = "stripe refund #{cents}"
end
PaypalKit = Struct.new(:x) do
  def charge(cents)  = "paypal charge #{cents}"
  def refund(cents)  = "paypal refund #{cents}"
end

def payment_kit(provider)
  provider == "paypal" ? PaypalKit.new : StripeKit.new
end

kit = payment_kit("stripe")
kit.charge(3000)   # => "stripe charge 3000"
kit.refund(3000)   # => "stripe refund 3000"  (same family, guaranteed)`, caption: "One factory call yields a matched charge/refund pair." },
        { type: "quiz",
          q: "How does Abstract Factory differ from Factory Method?",
          choices: ["It produces a family of related objects, not just one","It is faster","It requires threads","It only works with Structs"],
          answer: 0,
          explain: "Factory Method makes one product; Abstract Factory makes a consistent GROUP that belong together.",
          nudge: "Think 'matched set', not 'single item'." },
        { type: "exercise", title: "Return a matched payment kit",
          prompt: ["Finish payment_kit so \"paypal\" returns PaypalKit.new and everything else returns StripeKit.new."],
          starter: String.raw`def payment_kit(provider)
  # your code here
end`,
          solution: String.raw`def payment_kit(provider)
  if provider == "paypal"
    PaypalKit.new
  else
    StripeKit.new
  end
end`,
          checks: [
            { re: /def payment_kit\(provider\)/, hint: "Keep the signature: def payment_kit(provider)." },
            { re: /provider=="paypal"/, hint: "Branch on provider == \"paypal\"." },
            { re: /PaypalKit.new/, hint: "Return PaypalKit.new for paypal." },
            { re: /StripeKit.new/, hint: "Otherwise return StripeKit.new." },
          ],
          success: "One call, one coherent family of objects." },
      ],
    },
    {
      id: "builder",
      title: "Builder",
      steps: [
        { type: "text", md: [
          "## Builder: assemble a complex object step by step",
          "**Problem:** an object has many optional parts, and stuffing them all into one constructor is unreadable.",
          "**PawWalk scenario:** a booking search query with filters, a sort, and a page. You want to add pieces fluently and then produce a plain hash to run.",
          "The Ruby realization: chainable methods that each mutate state and `return self`, plus a final `build` that hands back the assembled hash." ] },
        { type: "code", title: "playground/builder.rb", source: String.raw`class QueryBuilder
  def initialize
    @filters = {}
  end

  def where(key, value)
    @filters[key] = value
    self                # returning self is what makes chaining work
  end

  def build
    { filters: @filters }
  end
end

QueryBuilder.new
  .where(:city, "Austin")
  .where(:status, "confirmed")
  .build
# => { filters: { city: "Austin", status: "confirmed" } }`, caption: "Each .where returns self, so the calls chain into one expression." },
        { type: "quiz",
          q: "What must .where return for the fluent chain .where(...).where(...) to work?",
          choices: ["self (the builder itself)","nil","the filters hash","a new QueryBuilder each time"],
          answer: 0,
          explain: "Returning self lets the next method call land on the same builder — that's the chain.",
          nudge: "The next call in the chain needs a builder to call on." },
        { type: "exercise", title: "Make .where chainable",
          prompt: ["Finish .where so it stores value under key in the filters hash AND returns self."],
          starter: String.raw`class QueryBuilder
  def initialize
    @filters = {}
  end

  def where(key, value)
    # your code here
  end

  def build = { filters: @filters }
end`,
          solution: String.raw`class QueryBuilder
  def initialize
    @filters = {}
  end

  def where(key, value)
    @filters[key] = value
    self
  end

  def build = { filters: @filters }
end`,
          checks: [
            { re: /@filters\[key\]=value/, hint: "Store it: @filters[key] = value." },
            { re: /value\s*self|value.*\bself\b/s, hint: "Then return self on the next line so it chains." },
          ],
          mustNot: [ { re: /def where\(key,value\)self/, hint: "Store the value before returning self." } ],
          success: "Store, then return self — the fluent builder in two lines." },
      ],
    },
    {
      id: "prototype",
      title: "Prototype",
      steps: [
        { type: "text", md: [
          "## Prototype: create new objects by cloning an existing one",
          "**Problem:** building a fresh object from scratch is expensive or fiddly, but you already have a good example to copy.",
          "**PawWalk scenario:** a recurring-booking *template*. Duplicate it, change the date on the copy, and the original template stays untouched for next week.",
          "Ruby gives you this for free: `dup` (shallow copy, ignores frozen/singleton state) and `clone` (also copies frozen state). No `Prototype` interface required." ] },
        { type: "code", title: "playground/prototype.rb", source: String.raw`class BookingTemplate
  attr_accessor :walker, :date
  def initialize(walker, date)
    @walker = walker
    @date   = date
  end
end

template = BookingTemplate.new("Sam", "2026-07-06")
copy = template.dup            # shallow clone of the object
copy.date = "2026-07-13"       # tweak only the copy

template.date  # => "2026-07-06"  (original untouched)
copy.date      # => "2026-07-13"`, caption: "dup makes an independent copy; mutating it leaves the original alone." },
        { type: "quiz",
          q: "After copy = template.dup then copy.date = new_date, what is template.date?",
          choices: ["Unchanged — dup made an independent object","Also the new date","nil","It raises FrozenError"],
          answer: 0,
          explain: "dup copies the object, so assigning to the copy's date never touches the original.",
          nudge: "Prototype's promise is that the original is left intact." },
        { type: "exercise", title: "Clone a template and tweak the copy",
          prompt: ["Duplicate template into copy, then set copy.date to \"2026-07-13\" without touching the original."],
          starter: String.raw`template = BookingTemplate.new("Sam", "2026-07-06")
# your code here`,
          solution: String.raw`template = BookingTemplate.new("Sam", "2026-07-06")
copy = template.dup
copy.date = "2026-07-13"`,
          checks: [
            { re: /copy=template.dup/, hint: "Clone it: copy = template.dup." },
            { re: /copy.date="2026-07-13"/, hint: "Change only the copy: copy.date = \"2026-07-13\"." },
          ],
          mustNot: [ { re: /template.date=/, hint: "Don't reassign the original's date." } ],
          success: "dup gave you an independent object to tweak." },
      ],
    },
    // ───────────────────────────── STRUCTURAL ─────────────────────────────
    {
      id: "adapter",
      title: "Adapter",
      steps: [
        { type: "text", md: [
          "## Adapter: make a foreign interface fit yours",
          "**Problem:** a third-party object exposes the wrong method names, but you don't want that leaking through your whole codebase.",
          "**PawWalk scenario:** a geocoder gem returns `lat_lng`, but your code everywhere calls `.coordinates`. Wrap the gem in an adapter that exposes `coordinates` and delegates.",
          "The adapter owns the vocabulary translation so the rest of your app speaks only *your* interface." ] },
        { type: "code", title: "playground/adapter.rb", source: String.raw`# Foreign gem — we can't change it:
class VendorGeocoder
  def lat_lng(address) = [30.27, -97.74]   # Austin
end

class GeocoderAdapter
  def initialize(vendor) = @vendor = vendor

  def coordinates(address)      # our interface
    @vendor.lat_lng(address)    # delegate to theirs
  end
end

geo = GeocoderAdapter.new(VendorGeocoder.new)
geo.coordinates("Austin, TX")   # => [30.27, -97.74]`, caption: "coordinates is our name; it forwards to the vendor's lat_lng." },
        { type: "quiz",
          q: "What is the adapter's job here?",
          choices: ["Translate our .coordinates call into the vendor's .lat_lng","Cache the coordinates","Add authentication","Run the vendor code on a thread"],
          answer: 0,
          explain: "An adapter maps the interface your code expects onto the foreign one it wraps.",
          nudge: "Same data, different method name — who fixes that mismatch?" },
        { type: "exercise", title: "Delegate coordinates to lat_lng",
          prompt: ["Finish coordinates so it calls lat_lng(address) on the wrapped @vendor."],
          starter: String.raw`class GeocoderAdapter
  def initialize(vendor) = @vendor = vendor

  def coordinates(address)
    # your code here
  end
end`,
          solution: String.raw`class GeocoderAdapter
  def initialize(vendor) = @vendor = vendor

  def coordinates(address)
    @vendor.lat_lng(address)
  end
end`,
          checks: [
            { re: /def coordinates\(address\)/, hint: "Expose your name: def coordinates(address)." },
            { re: /@vendor.lat_lng\(address\)/, hint: "Delegate: @vendor.lat_lng(address)." },
          ],
          success: "The mismatch lives in one place now — the adapter." },
      ],
    },
    {
      id: "bridge",
      title: "Bridge",
      steps: [
        { type: "text", md: [
          "## Bridge: split abstraction from implementation",
          "**Problem:** two dimensions vary independently. If you subclass for every combination you get a class explosion.",
          "**PawWalk scenario:** a `Notification` (the *what* — reminder, receipt) holds a `Transport` (the *how* — SMS, email). Add a new transport OR a new notification type without touching the other axis.",
          "The bridge is just composition: the abstraction holds a reference to the implementation and delegates the varying part to it." ] },
        { type: "code", title: "playground/bridge.rb", source: String.raw`SmsTransport   = Struct.new(:x) { def deliver(text) = "sms:#{text}" }
EmailTransport = Struct.new(:x) { def deliver(text) = "email:#{text}" }

class Notification
  def initialize(transport) = @transport = transport
  def send_it(text)         = @transport.deliver(text)
end

Notification.new(SmsTransport.new).send_it("Walk done")   # => "sms:Walk done"
Notification.new(EmailTransport.new).send_it("Walk done") # => "email:Walk done"`, caption: "Notification varies independently of the injected transport." },
        { type: "quiz",
          q: "Why is Bridge better than subclassing SmsReminder, EmailReminder, SmsReceipt, EmailReceipt?",
          choices: ["It avoids a class per combination — the two axes stay separate","It runs faster","It removes the need for objects","It forces a single transport"],
          answer: 0,
          explain: "Composition over inheritance: N notifications x M transports become N + M classes, not N*M.",
          nudge: "Count the classes for 5 types x 5 transports each way." },
        { type: "exercise", title: "Delegate send_it to the transport",
          prompt: ["Finish send_it so it calls deliver(text) on the injected @transport."],
          starter: String.raw`class Notification
  def initialize(transport) = @transport = transport
  def send_it(text)
    # your code here
  end
end`,
          solution: String.raw`class Notification
  def initialize(transport) = @transport = transport
  def send_it(text)
    @transport.deliver(text)
  end
end`,
          checks: [
            { re: /def send_it\(text\)/, hint: "Keep the signature: def send_it(text)." },
            { re: /@transport.deliver\(text\)/, hint: "Delegate across the bridge: @transport.deliver(text)." },
          ],
          success: "The two axes now grow independently." },
      ],
    },
    {
      id: "composite",
      title: "Composite",
      steps: [
        { type: "text", md: [
          "## Composite: treat parts and wholes uniformly",
          "**Problem:** you have a tree — items inside groups inside groups — and you want one operation to work on a leaf and a branch the same way.",
          "**PawWalk scenario:** a walk *package* made of individual items and sub-packages. `total_price` should work whether you call it on one item or the whole nested bundle.",
          "The trick: both a leaf and a group answer the same method. A group's answer sums its children (which may themselves be groups)." ] },
        { type: "code", title: "playground/composite.rb", source: String.raw`class Item
  def initialize(price) = @price = price
  def total_price       = @price
end

class Package
  def initialize = @children = []
  def add(child)
    @children << child
    self
  end
  def total_price
    @children.sum(&:total_price)   # recurses through nested packages
  end
end

bundle = Package.new
bundle.add(Item.new(2000)).add(Item.new(500))
inner = Package.new.add(Item.new(1000))
bundle.add(inner)
bundle.total_price   # => 3500`, caption: "Item and Package share total_price; the group just sums its children." },
        { type: "quiz",
          q: "How does a Package compute total_price?",
          choices: ["It sums total_price of each child, which may itself be a Package","It only counts direct Items","It ignores nested packages","It multiplies the children"],
          answer: 0,
          explain: "Because every child answers total_price, summing them recurses through the whole tree uniformly.",
          nudge: "The children respond to the same method the whole does." },
        { type: "exercise", title: "Sum the children",
          prompt: ["Finish Package#total_price so it sums total_price across every child."],
          starter: String.raw`class Package
  def initialize = @children = []
  def add(child)
    @children << child
    self
  end
  def total_price
    # your code here
  end
end`,
          solution: String.raw`class Package
  def initialize = @children = []
  def add(child)
    @children << child
    self
  end
  def total_price
    @children.sum(&:total_price)
  end
end`,
          checks: [
            { re: /def total_price/, hint: "Define the shared method: def total_price." },
            { re: /@children.sum\(&:total_price\)/, hint: "Sum uniformly: @children.sum(&:total_price)." },
          ],
          success: "Leaf and branch answer the same call — that's composite." },
      ],
    },
    {
      id: "decorator",
      title: "Decorator",
      steps: [
        { type: "text", md: [
          "## Decorator: wrap an object to add behavior",
          "**Problem:** you want to add responsibilities to a single object without subclassing or editing its class.",
          "**PawWalk scenario:** a base walk price, then optional GPS and insurance surcharges. Wrap the price object; the wrapper's `total` adds its surcharge to the wrapped `total`.",
          "Ruby's `SimpleDelegator` forwards everything to the wrapped object so you override only the method you're changing — but a plain wrapper class works just as well." ] },
        { type: "code", title: "playground/decorator.rb", source: String.raw`BasePrice = Struct.new(:cents) { def total = cents }

class GpsSurcharge
  def initialize(inner) = @inner = inner
  def total             = @inner.total + 300   # adds to the wrapped total
end

class InsuranceSurcharge
  def initialize(inner) = @inner = inner
  def total             = @inner.total + 500
end

price = InsuranceSurcharge.new(GpsSurcharge.new(BasePrice.new(2000)))
price.total   # => 2800  (2000 + 300 + 500)`, caption: "Each decorator wraps the previous total and adds its own surcharge." },
        { type: "quiz",
          q: "What does a decorator's total do with the wrapped object?",
          choices: ["Calls the wrapped total and adds its own surcharge","Replaces the wrapped total entirely","Ignores the wrapped object","Mutates the base price object"],
          answer: 0,
          explain: "A decorator delegates to the inner object and layers extra behavior on top of the result.",
          nudge: "It adds to what's inside, it doesn't discard it." },
        { type: "exercise", title: "Add a surcharge on top",
          prompt: ["Finish GpsSurcharge#total so it returns the wrapped @inner.total plus 300."],
          starter: String.raw`class GpsSurcharge
  def initialize(inner) = @inner = inner
  def total
    # your code here
  end
end`,
          solution: String.raw`class GpsSurcharge
  def initialize(inner) = @inner = inner
  def total
    @inner.total + 300
  end
end`,
          checks: [
            { re: /@inner.total\+300/, hint: "Wrap and add: @inner.total + 300." },
          ],
          mustNot: [ { re: /^\s*def total\s*=?\s*300\s*$/m, hint: "Add to the inner total, don't hardcode 300." } ],
          success: "Behavior added without touching the wrapped class." },
      ],
    },
    {
      id: "facade",
      title: "Facade",
      steps: [
        { type: "text", md: [
          "## Facade: one simple entry point over a messy subsystem",
          "**Problem:** doing one useful thing requires orchestrating several objects in the right order, and every caller repeats that dance.",
          "**PawWalk scenario:** booking a walk means pricing, then payment, then notification. `BookingService.book!` hides all three behind one call.",
          "A facade doesn't add new logic — it just provides a friendly front door so callers don't wire the subsystem themselves." ] },
        { type: "code", title: "playground/facade.rb", source: String.raw`Pricer   = Struct.new(:x) { def quote(mins) = mins * 100 }
Payments = Struct.new(:x) { def charge(cents) = "charged #{cents}" }
Notifier = Struct.new(:x) { def confirm      = "notified" }

class BookingService
  def initialize
    @pricer = Pricer.new
    @pay    = Payments.new
    @notify = Notifier.new
  end

  def book!(mins)
    cents = @pricer.quote(mins)
    @pay.charge(cents)
    @notify.confirm
    { cents: cents, status: "booked" }
  end
end

BookingService.new.book!(30)   # => { cents: 3000, status: "booked" }`, caption: "One method sequences three subsystems and returns a tidy result." },
        { type: "quiz",
          q: "What does a Facade add to the subsystem it fronts?",
          choices: ["Nothing new — just a simpler, single entry point","A cache layer","Retries","A database"],
          answer: 0,
          explain: "A facade's value is simplification: it orchestrates existing pieces behind one call, adding no new behavior.",
          nudge: "It's a front door, not a new room." },
        { type: "exercise", title: "Sequence the subsystem",
          prompt: ["Finish book! so it quotes with @pricer, charges @pay with those cents, then returns { cents: cents, status: \"booked\" }."],
          starter: String.raw`class BookingService
  def initialize
    @pricer = Pricer.new
    @pay    = Payments.new
  end
  def book!(mins)
    # your code here
  end
end`,
          solution: String.raw`class BookingService
  def initialize
    @pricer = Pricer.new
    @pay    = Payments.new
  end
  def book!(mins)
    cents = @pricer.quote(mins)
    @pay.charge(cents)
    { cents: cents, status: "booked" }
  end
end`,
          checks: [
            { re: /cents=@pricer.quote\(mins\)/, hint: "Quote first: cents = @pricer.quote(mins)." },
            { re: /@pay.charge\(cents\)/, hint: "Then charge: @pay.charge(cents)." },
            { re: /\{cents:cents,status:"booked"\}/, hint: "Return { cents: cents, status: \"booked\" }." },
          ],
          success: "One friendly call over three moving parts." },
      ],
    },
    {
      id: "flyweight",
      title: "Flyweight",
      steps: [
        { type: "text", md: [
          "## Flyweight: share immutable objects to save memory",
          "**Problem:** you'd otherwise create thousands of identical, unchanging objects — wasting memory.",
          "**PawWalk scenario:** thousands of `Dog` records, but only a few dozen breeds. Intern each `Breed` once and share the single instance across every dog of that breed.",
          "The realization is a cache: a hash keyed by the intrinsic value, returning the SAME object every time." ] },
        { type: "code", title: "playground/flyweight.rb", source: String.raw`class Breed
  attr_reader :name
  def initialize(name) = @name = name.freeze
end

module BreedFactory
  @pool = {}
  def self.get(name)
    @pool[name] ||= Breed.new(name)   # one instance per name, forever
  end
end

a = BreedFactory.get("Corgi")
b = BreedFactory.get("Corgi")
a.equal?(b)   # => true  (literally the same object)`, caption: "Repeated calls for the same key return the one shared instance." },
        { type: "quiz",
          q: "What makes a Flyweight save memory?",
          choices: ["Repeated requests for the same key return the SAME shared instance","It compresses the objects","It stores objects on disk","It deletes objects after use"],
          answer: 0,
          explain: "By sharing one immutable instance per key, thousands of references point at a handful of objects.",
          nudge: "How many Corgi objects exist after 10,000 Corgis?" },
        { type: "exercise", title: "Cache one instance per name",
          prompt: ["Finish BreedFactory.get so it memoizes a Breed per name in @pool (build it only if missing)."],
          starter: String.raw`module BreedFactory
  @pool = {}
  def self.get(name)
    # your code here
  end
end`,
          solution: String.raw`module BreedFactory
  @pool = {}
  def self.get(name)
    @pool[name] ||= Breed.new(name)
  end
end`,
          checks: [
            { re: /@pool\[name\]\|\|=Breed.new\(name\)/, hint: "Memoize: @pool[name] ||= Breed.new(name)." },
          ],
          success: "One object per key — the fly is now a flyweight." },
      ],
    },
    {
      id: "proxy",
      title: "Proxy",
      steps: [
        { type: "text", md: [
          "## Proxy: a stand-in that controls access",
          "**Problem:** you want to gate, delay, or guard access to a real object — lazy loading, auth, rate limiting — without changing that object.",
          "**PawWalk scenario:** a walker's high-res photo is expensive to load. A proxy loads it only on first read, then delegates to the real photo afterward.",
          "The proxy shares the real object's interface but wraps the call with its own logic (here: memoized lazy load)." ] },
        { type: "code", title: "playground/proxy.rb", source: String.raw`class RealPhoto
  def initialize(url) = (@url = url; @bytes = load!)
  def load!           = "bytes(#{@url})"     # pretend this is slow
  def data            = @bytes
end

class PhotoProxy
  def initialize(url) = @url = url
  def data
    @real ||= RealPhoto.new(@url)   # load only on first access
    @real.data
  end
end

p = PhotoProxy.new("walker.jpg")   # nothing loaded yet
p.data                              # => "bytes(walker.jpg)"  (loads now)`, caption: "The proxy defers the expensive RealPhoto until data is first read." },
        { type: "quiz",
          q: "When does PhotoProxy build the RealPhoto?",
          choices: ["Lazily, on the first call to data","Immediately in initialize","Never","On every call to data"],
          answer: 0,
          explain: "The ||= memoizes: the real object is created on first access and reused after.",
          nudge: "Look at where @real is assigned." },
        { type: "exercise", title: "Lazily delegate to the real subject",
          prompt: ["Finish PhotoProxy#data: build @real (a RealPhoto for @url) only if it's missing, then return @real.data."],
          starter: String.raw`class PhotoProxy
  def initialize(url) = @url = url
  def data
    # your code here
  end
end`,
          solution: String.raw`class PhotoProxy
  def initialize(url) = @url = url
  def data
    @real ||= RealPhoto.new(@url)
    @real.data
  end
end`,
          checks: [
            { re: /@real\|\|=RealPhoto.new\(@url\)/, hint: "Lazy-load: @real ||= RealPhoto.new(@url)." },
            { re: /@real.data/, hint: "Then delegate: @real.data." },
          ],
          success: "Access controlled, real object untouched." },
      ],
    },
    // ───────────────────────────── BEHAVIORAL ─────────────────────────────
    {
      id: "chain-of-responsibility",
      title: "Chain of Responsibility",
      steps: [
        { type: "text", md: [
          "## Chain of Responsibility: pass a request down handlers",
          "**Problem:** several checks must run in order, and the first failure should stop the rest.",
          "**PawWalk scenario:** a booking validation pipeline — availability, then payment, then policy. If availability fails, don't bother charging.",
          "In Ruby the whole chain is often just an array of callables you run until one returns a failure. No linked-list of handler objects required." ] },
        { type: "code", title: "playground/chain.rb", source: String.raw`availability = ->(req) { req[:slot_free] ? nil : "no slot" }
payment      = ->(req) { req[:funds]     ? nil : "declined" }
policy       = ->(req) { req[:allowed]   ? nil : "blocked" }

def validate(req, handlers)
  handlers.each do |h|
    failure = h.call(req)
    return failure if failure    # first failure stops the chain
  end
  nil                            # nil means all passed
end

req = { slot_free: true, funds: false, allowed: true }
validate(req, [availability, payment, policy])   # => "declined"`, caption: "Each handler returns nil to pass or a message to stop the chain." },
        { type: "quiz",
          q: "In this chain, what does a handler return to let the request continue?",
          choices: ["nil (no failure)","true","the request","a new handler"],
          answer: 0,
          explain: "A nil means 'I have no objection'; a non-nil failure short-circuits the chain.",
          nudge: "The loop returns early only when the handler gives back something truthy." },
        { type: "exercise", title: "Stop at the first failure",
          prompt: ["Finish validate: for each handler, call it with req; return the result immediately if it's a failure (truthy). Return nil if all pass."],
          starter: String.raw`def validate(req, handlers)
  handlers.each do |h|
    # your code here
  end
  nil
end`,
          solution: String.raw`def validate(req, handlers)
  handlers.each do |h|
    failure = h.call(req)
    return failure if failure
  end
  nil
end`,
          checks: [
            { re: /failure=h.call\(req\)/, hint: "Run the handler: failure = h.call(req)." },
            { re: /return failure if failure/, hint: "Short-circuit: return failure if failure." },
          ],
          success: "First failure wins — the chain stops early." },
      ],
    },
    {
      id: "command",
      title: "Command",
      steps: [
        { type: "text", md: [
          "## Command: package a request as an object",
          "**Problem:** you want to store, queue, log, or undo an action — which means the action must be a *thing*, not just a method call.",
          "**PawWalk scenario:** background jobs. Each job IS a command: an object responding to `call`. A runner executes a list of them in order.",
          "In Ruby, 'responds to call' is the whole contract — an object with a `call` method, a lambda, or a `Proc` all qualify." ] },
        { type: "code", title: "playground/command.rb", source: String.raw`class SendReceipt
  def initialize(email) = @email = email
  def call              = "receipt -> #{@email}"
end

class ChargeCard
  def initialize(cents) = @cents = cents
  def call              = "charged #{@cents}"
end

def run_all(commands)
  commands.map(&:call)   # each command just responds to call
end

run_all([ChargeCard.new(3000), SendReceipt.new("a@b.com")])
# => ["charged 3000", "receipt -> a@b.com"]`, caption: "Every command answers call; the runner treats them uniformly." },
        { type: "quiz",
          q: "What is the single method a Command must respond to here?",
          choices: ["call","execute!","run","perform_later"],
          answer: 0,
          explain: "The runner does commands.map(&:call), so every command just needs a call method.",
          nudge: "Look at what run_all sends to each element." },
        { type: "exercise", title: "Run a list of commands",
          prompt: ["Finish run_all so it returns an array of the result of call on each command."],
          starter: String.raw`def run_all(commands)
  # your code here
end`,
          solution: String.raw`def run_all(commands)
  commands.map(&:call)
end`,
          checks: [
            { re: /def run_all\(commands\)/, hint: "Keep the signature: def run_all(commands)." },
            { re: /commands.map\(&:call\)/, hint: "Execute each: commands.map(&:call)." },
          ],
          success: "Actions became objects — now they queue, log, and replay." },
      ],
    },
    {
      id: "interpreter",
      title: "Interpreter",
      steps: [
        { type: "text", md: [
          "## Interpreter: evaluate sentences in a tiny language",
          "**Problem:** you have a small grammar — rules, formulas, filters — and want to evaluate expressions written in it.",
          "> Be honest: full Interpreter is rare in app code. Most 'tiny languages' are better served by data + a fold, or a real parser gem. But the idea is worth knowing.",
          "**PawWalk scenario:** a minimal price-adjustment rule: a list of `[\"add\", n]` / `[\"sub\", n]` tokens applied to a starting total." ] },
        { type: "code", title: "playground/interpreter.rb", source: String.raw`def evaluate(tokens, start)
  tokens.reduce(start) do |total, (op, n)|
    case op
    when "add" then total + n
    when "sub" then total - n
    else            total
    end
  end
end

program = [["add", 500], ["sub", 200], ["add", 100]]
evaluate(program, 2000)   # => 2400`, caption: "reduce folds the token 'program' over a running total." },
        { type: "quiz",
          q: "How does this interpreter evaluate the token list?",
          choices: ["It folds (reduce) each token over a running total","It compiles to machine code","It sends each token to a database","It ignores the order of tokens"],
          answer: 0,
          explain: "Each token transforms the accumulator; reduce applies them left to right — a tiny expression evaluator.",
          nudge: "Order matters and there's an accumulator — which Enumerable method is that?" },
        { type: "exercise", title: "Interpret an add/sub program",
          prompt: ["Finish evaluate: reduce tokens starting from start; \"add\" adds n, \"sub\" subtracts n, anything else leaves total unchanged."],
          starter: String.raw`def evaluate(tokens, start)
  tokens.reduce(start) do |total, (op, n)|
    # your code here
  end
end`,
          solution: String.raw`def evaluate(tokens, start)
  tokens.reduce(start) do |total, (op, n)|
    case op
    when "add" then total + n
    when "sub" then total - n
    else            total
    end
  end
end`,
          checks: [
            { re: /when"add"then total\+n/, hint: "Add branch: when \"add\" then total + n." },
            { re: /when"sub"then total-n/, hint: "Sub branch: when \"sub\" then total - n." },
          ],
          success: "A tiny language, evaluated by a fold." },
      ],
    },
    {
      id: "iterator",
      title: "Iterator",
      steps: [
        { type: "text", md: [
          "## Iterator: step through a collection without exposing internals",
          "**Problem:** callers want to walk your collection in order without knowing whether it's an array, a tree, or a linked list inside.",
          "> Say it plainly: in Ruby this is nearly built in. Define `each`, `include Enumerable`, and you get `map`, `select`, `sort`, `to_a`, and dozens more for free.",
          "**PawWalk scenario:** iterate a booking calendar in order — callers just call `.each` or `.map` and never see the storage." ] },
        { type: "code", title: "playground/iterator.rb", source: String.raw`class Calendar
  include Enumerable
  def initialize(days) = @days = days
  def each(&block)
    @days.each(&block)   # yield each item; Enumerable builds the rest
  end
end

cal = Calendar.new(["Mon", "Tue", "Wed"])
cal.map(&:upcase)        # => ["MON", "TUE", "WED"]  (free from Enumerable)
cal.select { |d| d != "Tue" }   # => ["Mon", "Wed"]`, caption: "One each method plus Enumerable = a full iterator toolkit." },
        { type: "quiz",
          q: "What do you get by include Enumerable and defining each?",
          choices: ["map, select, sort, to_a and dozens more, for free","Only each","Thread safety","A database connection"],
          answer: 0,
          explain: "Enumerable builds every collection method on top of the single each you provide.",
          nudge: "That's the whole reason to include the module." },
        { type: "exercise", title: "Make Calendar enumerable",
          prompt: ["Finish each so it yields every item in @days (pass the block through with &block)."],
          starter: String.raw`class Calendar
  include Enumerable
  def initialize(days) = @days = days
  def each(&block)
    # your code here
  end
end`,
          solution: String.raw`class Calendar
  include Enumerable
  def initialize(days) = @days = days
  def each(&block)
    @days.each(&block)
  end
end`,
          checks: [
            { re: /def each\(&block\)/, hint: "Accept the block: def each(&block)." },
            { re: /@days.each\(&block\)/, hint: "Yield each item: @days.each(&block)." },
          ],
          success: "One method, and the whole Enumerable API lit up." },
      ],
    },
    {
      id: "mediator",
      title: "Mediator",
      steps: [
        { type: "text", md: [
          "## Mediator: a hub that coordinates peers",
          "**Problem:** many objects need to talk to each other. Wire them directly and you get an N-to-N tangle where everyone references everyone.",
          "**PawWalk scenario:** a dispatch center. Walker, owner, and tracker don't hold references to each other — they notify the mediator, which routes to the others.",
          "The mediator centralizes the 'who tells whom' logic so the peers stay decoupled." ] },
        { type: "code", title: "playground/mediator.rb", source: String.raw`class Dispatch
  def initialize = @peers = {}
  def register(name, peer) = @peers[name] = peer

  def notify(sender, event)
    @peers.each do |name, peer|
      peer.receive(event) unless name == sender   # everyone but the sender
    end
  end
end

Peer = Struct.new(:log) do
  def receive(event) = log << event
end

hub = Dispatch.new
owner = Peer.new([]); tracker = Peer.new([])
hub.register(:owner, owner)
hub.register(:tracker, tracker)
hub.notify(:owner, "walk_started")
tracker.log   # => ["walk_started"]`, caption: "notify routes an event to every peer except the sender." },
        { type: "quiz",
          q: "What does the Mediator prevent among its peers?",
          choices: ["Direct references between every pair of peers (an N-to-N tangle)","Any communication at all","Using structs","Logging"],
          answer: 0,
          explain: "Peers talk to the mediator, not each other, collapsing N-to-N wiring into N-to-1.",
          nudge: "Count the connections with and without the hub." },
        { type: "exercise", title: "Route to the other peers",
          prompt: ["Finish notify: for each registered name/peer, call peer.receive(event) unless that name equals sender."],
          starter: String.raw`class Dispatch
  def initialize = @peers = {}
  def register(name, peer) = @peers[name] = peer
  def notify(sender, event)
    @peers.each do |name, peer|
      # your code here
    end
  end
end`,
          solution: String.raw`class Dispatch
  def initialize = @peers = {}
  def register(name, peer) = @peers[name] = peer
  def notify(sender, event)
    @peers.each do |name, peer|
      peer.receive(event) unless name == sender
    end
  end
end`,
          checks: [
            { re: /peer.receive\(event\)unless name==sender/, hint: "Route to others: peer.receive(event) unless name == sender." },
          ],
          success: "Peers stay decoupled; the hub does the routing." },
      ],
    },
    {
      id: "memento",
      title: "Memento",
      steps: [
        { type: "text", md: [
          "## Memento: capture state to restore later",
          "**Problem:** you want undo — snapshot an object's state now, and put it back later — without exposing the object's internals to whoever holds the snapshot.",
          "**PawWalk scenario:** a booking *draft*. Snapshot it before risky edits; on cancel, restore the snapshot.",
          "The memento is just a copy of the fields. `save_state` returns it; `restore` copies it back." ] },
        { type: "code", title: "playground/memento.rb", source: String.raw`class BookingDraft
  attr_accessor :walker, :mins
  def initialize(walker, mins) = (@walker = walker; @mins = mins)

  def save_state = { walker: @walker, mins: @mins }   # the memento

  def restore(memento)
    @walker = memento[:walker]
    @mins   = memento[:mins]
  end
end

draft = BookingDraft.new("Sam", 30)
snapshot = draft.save_state
draft.mins = 60                      # risky edit
draft.restore(snapshot)              # undo
draft.mins   # => 30`, caption: "save_state captures the fields; restore puts them back." },
        { type: "quiz",
          q: "What does save_state return in this memento implementation?",
          choices: ["A copy of the object's fields to restore later","The object itself","nil","A new BookingDraft"],
          answer: 0,
          explain: "The memento is a snapshot of the fields; restore reads them back into the object.",
          nudge: "It's the thing you hand to restore later." },
        { type: "exercise", title: "Restore from a memento",
          prompt: ["Finish restore so it copies walker and mins out of the memento hash back into the object's ivars."],
          starter: String.raw`class BookingDraft
  attr_accessor :walker, :mins
  def initialize(walker, mins) = (@walker = walker; @mins = mins)
  def save_state = { walker: @walker, mins: @mins }
  def restore(memento)
    # your code here
  end
end`,
          solution: String.raw`class BookingDraft
  attr_accessor :walker, :mins
  def initialize(walker, mins) = (@walker = walker; @mins = mins)
  def save_state = { walker: @walker, mins: @mins }
  def restore(memento)
    @walker = memento[:walker]
    @mins   = memento[:mins]
  end
end`,
          checks: [
            { re: /@walker=memento\[:walker\]/, hint: "Restore walker: @walker = memento[:walker]." },
            { re: /@mins=memento\[:mins\]/, hint: "Restore mins: @mins = memento[:mins]." },
          ],
          success: "Snapshot and restore — undo in two methods." },
      ],
    },
    {
      id: "observer",
      title: "Observer",
      steps: [
        { type: "text", md: [
          "## Observer: subscribers get notified on change",
          "**Problem:** when one object changes, several others need to react — but the subject shouldn't hardcode who they are.",
          "**PawWalk scenario:** a walk status flips to `completed`. Notify the owner, analytics, and push — each subscribed independently.",
          "Ruby has `require \"observer\"; include Observable`, but a plain array of callbacks is often clearer: `subscribe` appends, `notify` calls each." ] },
        { type: "code", title: "playground/observer.rb", source: String.raw`class Walk
  def initialize = @subscribers = []
  def subscribe(&callback) = @subscribers << callback

  def status=(new_status)
    @status = new_status
    notify(new_status)          # fan out on change
  end

  def notify(status)
    @subscribers.each { |cb| cb.call(status) }
  end
end

walk = Walk.new
log = []
walk.subscribe { |s| log << "owner:#{s}" }
walk.subscribe { |s| log << "push:#{s}" }
walk.status = "completed"
log   # => ["owner:completed", "push:completed"]`, caption: "subscribe registers a callback; notify calls every one." },
        { type: "quiz",
          q: "Why does the subject keep a list of callbacks instead of naming its observers directly?",
          choices: ["So observers can subscribe/unsubscribe without the subject knowing them","To run faster","To avoid using blocks","To store them in a database"],
          answer: 0,
          explain: "The subject stays decoupled: it just calls whatever subscribed, whoever that turns out to be.",
          nudge: "The subject shouldn't need to import the analytics module." },
        { type: "exercise", title: "Notify every subscriber",
          prompt: ["Finish notify so it calls each subscriber callback with status (use .call)."],
          starter: String.raw`class Walk
  def initialize = @subscribers = []
  def subscribe(&callback) = @subscribers << callback
  def notify(status)
    # your code here
  end
end`,
          solution: String.raw`class Walk
  def initialize = @subscribers = []
  def subscribe(&callback) = @subscribers << callback
  def notify(status)
    @subscribers.each { |cb| cb.call(status) }
  end
end`,
          checks: [
            { re: /@subscribers.each\{\|cb\|cb.call\(status\)\}/, hint: "Fan out: @subscribers.each { |cb| cb.call(status) }." },
          ],
          success: "Change once, notify many — decoupled." },
      ],
    },
    {
      id: "state",
      title: "State",
      steps: [
        { type: "text", md: [
          "## State: behavior changes with internal state",
          "**Problem:** an object behaves differently depending on which state it's in, and only certain transitions are legal.",
          "**PawWalk scenario:** a booking machine — `requested -> confirmed -> in_progress -> completed`, with `cancelled` reachable from a few states. Illegal jumps must be rejected.",
          "A clean Ruby realization: a map of allowed transitions and a `transition` method that consults it, raising on an illegal move." ] },
        { type: "code", title: "playground/state.rb", source: String.raw`ALLOWED = {
  "requested"   => ["confirmed", "cancelled"],
  "confirmed"   => ["in_progress", "cancelled"],
  "in_progress" => ["completed"],
  "completed"   => [],
  "cancelled"   => [],
}

class Booking
  attr_reader :state
  def initialize = @state = "requested"

  def transition(to)
    unless ALLOWED[@state].include?(to)
      raise "illegal: #{@state} -> #{to}"
    end
    @state = to
  end
end

b = Booking.new
b.transition("confirmed")     # ok
b.transition("in_progress")   # ok
# b.transition("requested")   # => raises "illegal: in_progress -> requested"`, caption: "The transition map is the state machine; transition enforces it." },
        { type: "quiz",
          q: "What does transition do when the target isn't in the allowed list for the current state?",
          choices: ["Raises — the move is illegal","Silently ignores it","Resets to requested","Allows it anyway"],
          answer: 0,
          explain: "Only transitions listed in the map are legal; anything else raises, which is the whole safety point.",
          nudge: "The unless-guard leads to a raise." },
        { type: "exercise", title: "Guard the transition",
          prompt: ["Finish transition: unless ALLOWED[@state] includes to, raise an error; otherwise set @state = to."],
          starter: String.raw`class Booking
  attr_reader :state
  def initialize = @state = "requested"
  def transition(to)
    # your code here
  end
end`,
          solution: String.raw`class Booking
  attr_reader :state
  def initialize = @state = "requested"
  def transition(to)
    unless ALLOWED[@state].include?(to)
      raise "illegal"
    end
    @state = to
  end
end`,
          checks: [
            { re: /unless ALLOWED\[@state\].include\?\(to\)/, hint: "Guard: unless ALLOWED[@state].include?(to)." },
            { re: /raise/, hint: "Reject illegal moves with raise." },
            { re: /@state=to/, hint: "On success: @state = to." },
          ],
          success: "Only legal moves get through — a real state machine." },
      ],
    },
    {
      id: "strategy",
      title: "Strategy",
      steps: [
        { type: "text", md: [
          "## Strategy: swap interchangeable algorithms at runtime",
          "**Problem:** one operation has several interchangeable implementations, chosen per call.",
          "**PawWalk scenario:** pricing — flat, surge, or member-discount — picked per booking.",
          "> Say it plainly: in Ruby a strategy is usually just a lambda or any callable. You don't need a `Strategy` class hierarchy; you inject a block." ] },
        { type: "code", title: "playground/strategy.rb", source: String.raw`flat    = ->(base) { base }
surge   = ->(base) { base * 2 }
member  = ->(base) { base - 500 }

class PriceCalculator
  def initialize(strategy) = @strategy = strategy
  def price(base)          = @strategy.call(base)
end

PriceCalculator.new(surge).price(2000)    # => 4000
PriceCalculator.new(member).price(2000)   # => 1500`, caption: "The strategy is just an injected callable; price delegates to it." },
        { type: "quiz",
          q: "In idiomatic Ruby, what is a Strategy most often?",
          choices: ["A lambda or any callable you inject","A subclass of Strategy","A frozen constant","A database row"],
          answer: 0,
          explain: "Ruby's first-class callables mean the strategy is usually just a lambda, no class hierarchy needed.",
          nudge: "First-class functions dissolve the pattern." },
        { type: "exercise", title: "Apply the injected strategy",
          prompt: ["Finish price so it calls the injected @strategy with base and returns the result."],
          starter: String.raw`class PriceCalculator
  def initialize(strategy) = @strategy = strategy
  def price(base)
    # your code here
  end
end`,
          solution: String.raw`class PriceCalculator
  def initialize(strategy) = @strategy = strategy
  def price(base)
    @strategy.call(base)
  end
end`,
          checks: [
            { re: /def price\(base\)/, hint: "Keep the signature: def price(base)." },
            { re: /@strategy.call\(base\)/, hint: "Delegate to the strategy: @strategy.call(base)." },
          ],
          success: "Swap the lambda, swap the algorithm." },
      ],
    },
    {
      id: "template-method",
      title: "Template Method",
      steps: [
        { type: "text", md: [
          "## Template Method: base defines the skeleton, subclass fills a step",
          "**Problem:** several variants share the same overall flow but differ in one or two steps.",
          "**PawWalk scenario:** a report generator whose `run` always does header, body, footer. Each report type overrides only `body`.",
          "The base method calls overridable methods; subclasses override just the varying step. (In Ruby you could also inject a block — but the classic template method is a clean fit when the skeleton is fixed.)" ] },
        { type: "code", title: "playground/template_method.rb", source: String.raw`class ReportSection
  def run
    [header, body, footer].join("\n")   # the fixed skeleton
  end
  def header = "== Report =="
  def body   = "(empty)"                 # meant to be overridden
  def footer = "== End =="
end

class WalksReport < ReportSection
  def body = "walks: 42"
end

WalksReport.new.run
# => "== Report ==\nwalks: 42\n== End =="`, caption: "run is the template; subclasses override only body." },
        { type: "quiz",
          q: "Which part does the subclass override in Template Method?",
          choices: ["Only the varying step(s), not the overall skeleton","The entire run method","The constructor","Nothing"],
          answer: 0,
          explain: "The base fixes the sequence in run; subclasses change just the steps that differ, like body.",
          nudge: "The skeleton stays put; the filling changes." },
        { type: "exercise", title: "Override one step",
          prompt: ["Make WalksReport subclass ReportSection and override body to return \"walks: 42\"."],
          starter: String.raw`class WalksReport < ReportSection
  # your code here
end`,
          solution: String.raw`class WalksReport < ReportSection
  def body = "walks: 42"
end`,
          checks: [
            { re: /class WalksReport<ReportSection/, hint: "Subclass it: class WalksReport < ReportSection." },
            { re: /def body="walks:42"/, hint: "Override the step: def body = \"walks: 42\"." },
          ],
          mustNot: [ { re: /def run/, hint: "Leave run to the base class — override only body." } ],
          success: "One overridden step, whole skeleton reused." },
      ],
    },
    {
      id: "visitor",
      title: "Visitor",
      steps: [
        { type: "text", md: [
          "## Visitor: add operations over a fixed structure via double dispatch",
          "**Problem:** you have a fixed set of node types and keep needing *new operations* over them — and you don't want to edit every node class each time.",
          "**PawWalk scenario:** booking line items. A `Total` visitor sums them; a `Receipt` visitor formats them. Add a new visitor without touching the items.",
          "> Be honest: Visitor is clunky in dynamic languages. In real Ruby you'd often replace it with a `case` on type or pattern matching. It shines only when the node set is truly fixed and operations grow often." ] },
        { type: "code", title: "playground/visitor.rb", source: String.raw`class LineItem
  attr_reader :cents
  def initialize(cents) = @cents = cents
  def accept(visitor)   = visitor.visit_item(self)   # double dispatch
end

class TotalVisitor
  def initialize      = @sum = 0
  def visit_item(item) = @sum += item.cents
  attr_reader :sum
end

items = [LineItem.new(2000), LineItem.new(500)]
totaler = TotalVisitor.new
items.each { |i| i.accept(totaler) }
totaler.sum   # => 2500`, caption: "accept calls back into visit_item — the double dispatch handshake." },
        { type: "quiz",
          q: "What is the 'double dispatch' in Visitor?",
          choices: ["item.accept(visitor) then visitor.visit_item(item) — two calls select behavior by both types","Calling accept twice","Using two threads","Two inheritance levels"],
          answer: 0,
          explain: "The node's accept picks the right visit_x, so the operation is chosen by BOTH the node type and the visitor.",
          nudge: "Two method calls, each picking on a different type." },
        { type: "exercise", title: "Wire up accept",
          prompt: ["Finish LineItem#accept so it calls visit_item(self) on the visitor."],
          starter: String.raw`class LineItem
  attr_reader :cents
  def initialize(cents) = @cents = cents
  def accept(visitor)
    # your code here
  end
end`,
          solution: String.raw`class LineItem
  attr_reader :cents
  def initialize(cents) = @cents = cents
  def accept(visitor)
    visitor.visit_item(self)
  end
end`,
          checks: [
            { re: /def accept\(visitor\)/, hint: "Keep the signature: def accept(visitor)." },
            { re: /visitor.visit_item\(self\)/, hint: "Double dispatch: visitor.visit_item(self)." },
          ],
          success: "accept hands 'self' back to the visitor — dispatch complete." },
      ],
    },
  ],
});
