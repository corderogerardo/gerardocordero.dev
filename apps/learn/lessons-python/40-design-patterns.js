window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "design-patterns",
  title: "Design Patterns (All 23 GoF)",
  emoji: "🧠",
  lang: "python",
  lessons: [
    // ─────────────────────────── CREATIONAL (5) ───────────────────────────
    {
      id: "singleton",
      title: "Singleton",
      steps: [
        { type: "text", md: [
          "## One shared instance for the whole app",
          "**Singleton** guarantees a class has exactly one instance and gives everyone a single point of access to it. The classic use is a shared resource: one app `Config`, one logger, one Stripe client that every part of PawWalk talks to.",
          "Here is the honest part you rarely hear: in Python you almost never need the textbook singleton. A plain **module** is already a singleton — imported once, cached in `sys.modules`, shared everywhere. A module-level `config = Config()` gives you a shared instance with zero ceremony.",
        ] },
        { type: "text", md: [
          "### When you do want the class to enforce it",
          "If you truly want `Config()` to always hand back the *same* object no matter who calls it, override `__new__` to cache the instance on the class. `__new__` runs before `__init__` and decides which object you get back.",
          "> `functools.lru_cache` on a factory function is another clean trick — the first call builds it, every later call returns the cached one.",
        ] },
        { type: "code", title: "singleton via __new__",
          source: String.raw`class Config:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.timeout = 30
        return cls._instance

a = Config()
b = Config()
print(a is b)   # True — same object`,
          caption: "__new__ caches the one instance on the class; every call returns it." },
        { type: "quiz",
          q: "Why is a plain Python module often enough instead of a Singleton class?",
          choices: [
            "A module is imported once and cached in sys.modules, so a module-level object is already shared everywhere",
            "Modules cannot hold state",
            "Python forbids more than one instance of any class",
            "Modules are faster than classes at runtime",
          ],
          answer: 0,
          explain: "Import caching makes a module a de-facto singleton; a module-level instance is shared app-wide with no boilerplate.",
          nudge: "Think about what happens the second time you `import config`." },
        { type: "exercise", title: "Make Config a singleton",
          prompt: ["Override `__new__` so every `Config()` returns the same cached instance. Store it on `cls._instance` and return it."],
          starter: String.raw`class Config:
    _instance = None

    def __new__(cls):
        # your code here
        return cls._instance`,
          solution: String.raw`class Config:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance`,
          checks: [
            { re: /if cls._instance is None:/, hint: "Guard: if cls._instance is None:" },
            { re: /cls._instance=super\(\).__new__\(cls\)/, hint: "Build it once: cls._instance = super().__new__(cls)." },
          ],
          mustNot: [ { re: /def __init__/, hint: "You only need to override __new__ here." } ],
          success: "One cached instance, handed back to every caller — the singleton, done the Python way." },
      ],
    },
    {
      id: "factory-method",
      title: "Factory Method",
      steps: [
        { type: "text", md: [
          "## Let a method decide which object to build",
          "**Factory Method** puts object creation behind a function so callers ask for *what* they want, not *how* it's made. When a booking update needs to go out, you don't want `if channel == ...` scattered everywhere — you want one `notifier_for(channel)` that returns the right notifier.",
          "In Python this is just a function that returns an object. No abstract creator class required — a dict or an `if`/`elif` does the job.",
        ] },
        { type: "code", title: "notifier_for",
          source: String.raw`class EmailNotifier:
    def send(self, msg): return f"email: {msg}"

class SmsNotifier:
    def send(self, msg): return f"sms: {msg}"

class PushNotifier:
    def send(self, msg): return f"push: {msg}"

def notifier_for(channel):
    table = {"email": EmailNotifier, "sms": SmsNotifier, "push": PushNotifier}
    return table[channel]()

print(notifier_for("sms").send("Walk started"))   # sms: Walk started`,
          caption: "One place knows the mapping; callers just ask by channel string." },
        { type: "quiz",
          q: "What does the factory method buy you here?",
          choices: [
            "Callers depend on a channel string, not on the concrete notifier classes — creation logic lives in one place",
            "It makes the notifiers run faster",
            "It removes the need for the notifier classes entirely",
            "It guarantees only one notifier ever exists",
          ],
          answer: 0,
          explain: "The knowledge of which class maps to which channel is centralized; adding a new channel touches one function.",
          nudge: "Where does the `if channel == ...` logic live now?" },
        { type: "exercise", title: "Write notifier_for",
          prompt: ["Return an EmailNotifier for \"email\", else an SmsNotifier. Return an *instance*, not the class."],
          starter: String.raw`def notifier_for(channel):
    # your code here
    pass`,
          solution: String.raw`def notifier_for(channel):
    if channel == "email":
        return EmailNotifier()
    return SmsNotifier()`,
          checks: [
            { re: /if channel=="email":/, hint: "Branch on the channel: if channel == \"email\":." },
            { re: /return EmailNotifier\(\)/, hint: "Return an instance: return EmailNotifier()." },
            { re: /return SmsNotifier\(\)/, hint: "Default to return SmsNotifier()." },
          ],
          mustNot: [ { re: /return EmailNotifier(?!\()/, hint: "Return the instance EmailNotifier(), not the class." } ],
          success: "A tiny factory: ask by channel, get the matching notifier back." },
      ],
    },
    {
      id: "abstract-factory",
      title: "Abstract Factory",
      steps: [
        { type: "text", md: [
          "## Build a whole *family* of matched objects",
          "Where Factory Method makes one product, **Abstract Factory** makes a *family* of related products that must go together. For payments you need a matched pair: a **charger** and a **refunder**. A Stripe charger must be paired with a Stripe refunder — never a PayPal one.",
          "The abstract factory hands you a coherent set. Pick Stripe once and you get the whole Stripe family; you can't accidentally mix providers.",
        ] },
        { type: "code", title: "payment provider families",
          source: String.raw`class StripeProvider:
    def charge(self, cents):  return f"stripe charge {cents}"
    def refund(self, cents):  return f"stripe refund {cents}"

class PaypalProvider:
    def charge(self, cents):  return f"paypal charge {cents}"
    def refund(self, cents):  return f"paypal refund {cents}"

def provider_for(name):
    return {"stripe": StripeProvider, "paypal": PaypalProvider}[name]()

p = provider_for("stripe")
print(p.charge(2500))   # stripe charge 2500
print(p.refund(2500))   # stripe refund 2500 — same family`,
          caption: "One choice yields a matched charge/refund pair from the same provider." },
        { type: "quiz",
          q: "How does Abstract Factory differ from a plain Factory Method?",
          choices: [
            "It produces a family of related objects that belong together, not a single product",
            "It can only ever return one object",
            "It requires inheritance in Python",
            "It is the same thing under a different name",
          ],
          answer: 0,
          explain: "The point is coherence across a set: pick the provider once and every related object comes from that same family.",
          nudge: "How many related methods does the returned object expose?" },
        { type: "exercise", title: "Return a matched provider",
          prompt: ["Complete `provider_for`: return a StripeProvider for \"stripe\", otherwise a PaypalProvider. Both expose charge and refund."],
          starter: String.raw`def provider_for(name):
    # your code here
    pass`,
          solution: String.raw`def provider_for(name):
    if name == "stripe":
        return StripeProvider()
    return PaypalProvider()`,
          checks: [
            { re: /if name=="stripe":/, hint: "Branch: if name == \"stripe\":." },
            { re: /return StripeProvider\(\)/, hint: "Return StripeProvider()." },
            { re: /return PaypalProvider\(\)/, hint: "Default to PaypalProvider()." },
          ],
          mustNot: [ { re: /StripeProvider.refund/, hint: "Just return the provider; the caller picks charge vs refund." } ],
          success: "One call, a whole coherent provider family — charger and refunder that always match." },
      ],
    },
    {
      id: "builder",
      title: "Builder",
      steps: [
        { type: "text", md: [
          "## Assemble a complex object step by step",
          "**Builder** separates constructing a complicated object from its final shape, so you build it in readable steps instead of one monster constructor. A booking search query has filters, a sort, a page — passing all of that positionally is a nightmare.",
          "In Python the idiomatic builder is a class whose methods each return `self`, so calls chain fluently, ending in `.build()` that returns the assembled dict.",
        ] },
        { type: "code", title: "QueryBuilder",
          source: String.raw`class QueryBuilder:
    def __init__(self):
        self._filters = {}
        self._sort = None

    def where(self, **kw):
        self._filters.update(kw)
        return self                     # return self -> chainable

    def sort_by(self, field):
        self._sort = field
        return self

    def build(self):
        return {"filters": self._filters, "sort": self._sort}

q = QueryBuilder().where(city="Austin").where(status="open").sort_by("date").build()
print(q)   # {'filters': {'city': 'Austin', 'status': 'open'}, 'sort': 'date'}`,
          caption: "Each step returns self, so the calls read like a sentence." },
        { type: "quiz",
          q: "Why does each builder method `return self`?",
          choices: [
            "So calls can be chained fluently: builder.where(...).sort_by(...).build()",
            "Because Python requires every method to return something",
            "To make a copy of the builder each time",
            "It has no effect; you could drop it",
          ],
          answer: 0,
          explain: "Returning self is what makes the fluent chain possible — each call hands the same builder back for the next step.",
          nudge: "What would `.where(...).sort_by(...)` break if where returned None?" },
        { type: "exercise", title: "Chainable where + build",
          prompt: ["Give QueryBuilder a `where(**kw)` that updates `self._filters` and returns self, plus `build()` returning `self._filters`."],
          starter: String.raw`class QueryBuilder:
    def __init__(self):
        self._filters = {}

    def where(self, **kw):
        # your code here
        pass

    def build(self):
        # your code here
        pass`,
          solution: String.raw`class QueryBuilder:
    def __init__(self):
        self._filters = {}

    def where(self, **kw):
        self._filters.update(kw)
        return self

    def build(self):
        return self._filters`,
          checks: [
            { re: /self._filters.update\(kw\)/, hint: "Accumulate: self._filters.update(kw)." },
            { re: /return self(?!\.)/, hint: "Make it chainable: return self." },
            { re: /return self._filters/, hint: "build() returns the assembled self._filters." },
          ],
          mustNot: [ { re: /return kw/, hint: "Return the accumulated filters, not the latest kwargs." } ],
          success: "A fluent builder: chain .where(...) as many times as you like, then .build()." },
      ],
    },
    {
      id: "prototype",
      title: "Prototype",
      steps: [
        { type: "text", md: [
          "## Make new objects by cloning an existing one",
          "**Prototype** creates a new object by copying a fully-configured existing one, instead of building it from scratch. When a recurring booking template already has the walker, dog, and price set, cloning it and tweaking just the date is far cheaper than reassembling everything.",
          "Python hands you this for free: `copy.copy` for a shallow copy, `copy.deepcopy` when nested objects must be copied too. No `clone()` method to write.",
        ] },
        { type: "code", title: "copy a template",
          source: String.raw`import copy

class BookingTemplate:
    def __init__(self, dog, price_cents, date):
        self.dog = dog
        self.price_cents = price_cents
        self.date = date

template = BookingTemplate("Rex", 2500, "2026-07-10")
monday = copy.copy(template)
monday.date = "2026-07-13"

print(template.date)   # 2026-07-10 — original untouched
print(monday.date)     # 2026-07-13`,
          caption: "copy.copy clones the template; changing the copy leaves the original intact." },
        { type: "quiz",
          q: "When would you reach for copy.deepcopy over copy.copy?",
          choices: [
            "When the object holds nested mutable objects you also need to copy, not share",
            "Always — deepcopy is strictly better",
            "Only for immutable objects",
            "When you want the copy to share state with the original",
          ],
          answer: 0,
          explain: "Shallow copy shares the inner objects; deepcopy recursively copies them so the clone is fully independent.",
          nudge: "What happens to a nested list under a shallow copy if you mutate it?" },
        { type: "exercise", title: "Clone and tweak",
          prompt: ["Make a shallow copy of `template` with `copy.copy`, assign it to `clone`, and set `clone.date` to \"2026-07-20\"."],
          starter: String.raw`import copy
clone = None
# your code here`,
          solution: String.raw`import copy
clone = copy.copy(template)
clone.date = "2026-07-20"`,
          checks: [
            { re: /clone=copy.copy\(template\)/, hint: "Clone it: clone = copy.copy(template)." },
            { re: /clone.date="2026-07-20"/, hint: "Tweak the copy: clone.date = \"2026-07-20\"." },
          ],
          mustNot: [ { re: /template.date=/, hint: "Change the clone's date, not the template's." } ],
          success: "Cloned the template and changed one field — the original stays pristine." },
      ],
    },
    // ─────────────────────────── STRUCTURAL (7) ───────────────────────────
    {
      id: "adapter",
      title: "Adapter",
      steps: [
        { type: "text", md: [
          "## Make a foreign interface fit the one you expect",
          "**Adapter** wraps an object with an incompatible interface so it looks like the interface your code already uses. A third-party geocoder exposes `lat_lng(address)`, but the rest of PawWalk calls `geocoder.coordinates(address)`. Rather than rewrite every caller, you wrap the foreign object.",
          "The adapter holds the foreign object and translates the call — a thin layer of delegation.",
        ] },
        { type: "code", title: "GeocoderAdapter",
          source: String.raw`class ThirdPartyGeo:              # foreign — we can't change it
    def lat_lng(self, address):
        return (30.27, -97.74)        # pretend it geocoded Austin

class GeocoderAdapter:
    def __init__(self, foreign):
        self._foreign = foreign

    def coordinates(self, address):
        return self._foreign.lat_lng(address)

geo = GeocoderAdapter(ThirdPartyGeo())
print(geo.coordinates("Austin"))   # (30.27, -97.74)`,
          caption: "coordinates() is the interface we want; it delegates to the foreign lat_lng()." },
        { type: "quiz",
          q: "What problem does the Adapter solve?",
          choices: [
            "It lets code that expects coordinates() use an object that only offers lat_lng(), without changing either side",
            "It speeds up the foreign geocoder",
            "It removes the dependency on the foreign library",
            "It caches geocoding results",
          ],
          answer: 0,
          explain: "Adapter bridges a name/shape mismatch so incompatible interfaces work together untouched.",
          nudge: "Which method name does your code call, and which does the library offer?" },
        { type: "exercise", title: "Delegate coordinates -> lat_lng",
          prompt: ["Complete `coordinates`: call the foreign object's `lat_lng(address)` and return its result."],
          starter: String.raw`class GeocoderAdapter:
    def __init__(self, foreign):
        self._foreign = foreign

    def coordinates(self, address):
        # your code here
        pass`,
          solution: String.raw`class GeocoderAdapter:
    def __init__(self, foreign):
        self._foreign = foreign

    def coordinates(self, address):
        return self._foreign.lat_lng(address)`,
          checks: [
            { re: /return self._foreign.lat_lng\(address\)/, hint: "Delegate: return self._foreign.lat_lng(address)." },
          ],
          mustNot: [ { re: /def lat_lng/, hint: "The adapter exposes coordinates(); it doesn't redefine lat_lng." } ],
          success: "The adapter speaks your interface and quietly forwards to the foreign one." },
      ],
    },
    {
      id: "bridge",
      title: "Bridge",
      steps: [
        { type: "text", md: [
          "## Split abstraction from implementation",
          "**Bridge** separates a thing (an abstraction) from *how* it's carried out (an implementation) so the two can vary independently. A `Notification` is the abstraction — it has a message and a recipient. The `Transport` (SMS, email) is the implementation. Either axis can grow without touching the other.",
          "Instead of subclassing `Notification` into `SmsNotification`, `EmailNotification`, you *inject* the transport. New transports and new notification types no longer multiply into a combinatorial mess.",
        ] },
        { type: "code", title: "Notification + Transport",
          source: String.raw`class SmsTransport:
    def deliver(self, to, body): return f"SMS to {to}: {body}"

class EmailTransport:
    def deliver(self, to, body): return f"Email to {to}: {body}"

class Notification:
    def __init__(self, transport):
        self._transport = transport       # the implementation, injected

    def send(self, to, body):
        return self._transport.deliver(to, body)

n = Notification(SmsTransport())
print(n.send("Ana", "Walk confirmed"))   # SMS to Ana: Walk confirmed`,
          caption: "The Notification delegates delivery to whichever transport you injected." },
        { type: "quiz",
          q: "What does the Bridge let you vary independently?",
          choices: [
            "The notification kinds and the transports — add either without a class explosion of every combination",
            "Only the message text",
            "Nothing; it's the same as inheritance",
            "The recipient's address format",
          ],
          answer: 0,
          explain: "Abstraction and implementation live on separate axes; you combine them at runtime instead of pre-baking every pairing into a subclass.",
          nudge: "How many subclasses would you need for 3 notification types x 3 transports without a bridge?" },
        { type: "exercise", title: "Delegate send to transport",
          prompt: ["Complete `send`: call the injected transport's `deliver(to, body)` and return it."],
          starter: String.raw`class Notification:
    def __init__(self, transport):
        self._transport = transport

    def send(self, to, body):
        # your code here
        pass`,
          solution: String.raw`class Notification:
    def __init__(self, transport):
        self._transport = transport

    def send(self, to, body):
        return self._transport.deliver(to, body)`,
          checks: [
            { re: /return self._transport.deliver\(to,body\)/, hint: "Delegate: return self._transport.deliver(to, body)." },
          ],
          mustNot: [ { re: /def deliver/, hint: "Notification delegates to the transport; it doesn't implement deliver." } ],
          success: "The abstraction and the transport now vary on their own axes — that's the bridge." },
      ],
    },
    {
      id: "composite",
      title: "Composite",
      steps: [
        { type: "text", md: [
          "## Treat parts and wholes uniformly",
          "**Composite** lets you build a tree where a single item and a group of items share the same interface, so client code can call `total_price()` on either without checking which it is. A walk package can hold plain items *and* sub-packages; a group's price is just the sum of its children.",
          "The trick: both the leaf and the group answer the same method. Recursion falls out naturally — a group asks each child for its price.",
        ] },
        { type: "code", title: "packages and items",
          source: String.raw`class Item:
    def __init__(self, price_cents):
        self.price_cents = price_cents
    def total_price(self):
        return self.price_cents

class Package:
    def __init__(self, children):
        self.children = children
    def total_price(self):
        return sum(c.total_price() for c in self.children)

bundle = Package([Item(2500), Package([Item(500), Item(300)])])
print(bundle.total_price())   # 3300`,
          caption: "A Package sums its children — leaves and sub-packages answer total_price the same way." },
        { type: "quiz",
          q: "Why can total_price() be called the same way on an Item and a Package?",
          choices: [
            "Both expose the same method; a Package recurses over its children while a leaf returns its own price",
            "Packages secretly convert themselves into items first",
            "Python flattens the tree automatically",
            "Only Packages have total_price; Items borrow it",
          ],
          answer: 0,
          explain: "Uniform interface + recursion: the client never branches on leaf-vs-group; the group sums, the leaf returns.",
          nudge: "What does Package.total_price call on each child?" },
        { type: "exercise", title: "Sum the children",
          prompt: ["Complete `Package.total_price`: sum `total_price()` over each child in `self.children`."],
          starter: String.raw`class Package:
    def __init__(self, children):
        self.children = children

    def total_price(self):
        # your code here
        pass`,
          solution: String.raw`class Package:
    def __init__(self, children):
        self.children = children

    def total_price(self):
        return sum(c.total_price() for c in self.children)`,
          checks: [
            { re: /return sum\(c.total_price\(\)for c in self.children\)/, hint: "Recurse: return sum(c.total_price() for c in self.children)." },
          ],
          mustNot: [ { re: /return self.price_cents/, hint: "A Package has no own price; it sums its children." } ],
          success: "A group that totals its children — parts and wholes, handled uniformly." },
      ],
    },
    {
      id: "decorator",
      title: "Decorator",
      steps: [
        { type: "text", md: [
          "## Wrap an object to add behavior without changing it",
          "**Decorator** wraps an object in another object that shares its interface and adds behavior on top. Start with a base walk price; wrap it to add a GPS surcharge; wrap *that* to add insurance. Each layer adds a bit and forwards the rest — the base class never changes.",
          "This is the structural, object-wrapping Decorator — not the same as Python's `@decorator` syntax (which is a function-wrapping cousin of the same idea).",
        ] },
        { type: "code", title: "price decorators",
          source: String.raw`class BasePrice:
    def __init__(self, cents): self.cents = cents
    def total(self): return self.cents

class Surcharge:
    def __init__(self, wrapped, extra):
        self._wrapped = wrapped
        self._extra = extra
    def total(self):
        return self._wrapped.total() + self._extra

price = Surcharge(Surcharge(BasePrice(2500), 300), 150)  # base + GPS + insurance
print(price.total())   # 2950`,
          caption: "Each Surcharge wraps the last and adds its own on top of the wrapped total." },
        { type: "quiz",
          q: "What makes this a Decorator and not just a subclass?",
          choices: [
            "It wraps an existing object at runtime and shares its interface, so you can stack layers in any combination",
            "It changes the BasePrice class in place",
            "It requires inheritance from BasePrice",
            "It can only add exactly one surcharge",
          ],
          answer: 0,
          explain: "Composition over inheritance: wrap and forward, stacking behaviors dynamically without touching the wrapped class.",
          nudge: "How many surcharges did the example stack, and did BasePrice change?" },
        { type: "exercise", title: "Add a surcharge to the wrapped total",
          prompt: ["Complete `Surcharge.total`: return the wrapped object's total plus `self._extra`."],
          starter: String.raw`class Surcharge:
    def __init__(self, wrapped, extra):
        self._wrapped = wrapped
        self._extra = extra

    def total(self):
        # your code here
        pass`,
          solution: String.raw`class Surcharge:
    def __init__(self, wrapped, extra):
        self._wrapped = wrapped
        self._extra = extra

    def total(self):
        return self._wrapped.total() + self._extra`,
          checks: [
            { re: /return self._wrapped.total\(\)\+self._extra/, hint: "Forward and add: return self._wrapped.total() + self._extra." },
          ],
          mustNot: [ { re: /return self._extra(?!\+|\))/, hint: "Include the wrapped total, not just the surcharge." } ],
          success: "A wrapper that adds on top of whatever it wraps — stack as many as you like." },
      ],
    },
    {
      id: "facade",
      title: "Facade",
      steps: [
        { type: "text", md: [
          "## One simple door over a messy subsystem",
          "**Facade** gives a small, friendly entry point over a tangle of subsystems. Booking a walk really means: price it, charge the card, notify the owner. Callers shouldn't juggle three objects and their order — they call `BookingService.book()` and it orchestrates the rest.",
          "The facade doesn't add new behavior; it *coordinates* existing pieces so the common path is one call.",
        ] },
        { type: "code", title: "BookingService facade",
          source: String.raw`class Pricing:
    def quote(self, dog): return 2500

class Payments:
    def charge(self, cents): return f"charged {cents}"

class Notifier:
    def send(self, msg): return f"sent: {msg}"

class BookingService:
    def __init__(self):
        self.pricing = Pricing()
        self.payments = Payments()
        self.notifier = Notifier()

    def book(self, dog):
        cents = self.pricing.quote(dog)
        self.payments.charge(cents)
        self.notifier.send(f"Booked {dog} for {cents}")
        return cents

print(BookingService().book("Rex"))   # 2500`,
          caption: "One call hides pricing + payment + notification behind a single method." },
        { type: "quiz",
          q: "What does a Facade add over calling the subsystems directly?",
          choices: [
            "A simple, single entry point that coordinates the subsystems in the right order",
            "New business logic the subsystems don't have",
            "Faster execution of each subsystem",
            "It replaces the subsystems entirely",
          ],
          answer: 0,
          explain: "The facade is about simplicity and coordination — callers get one method instead of orchestrating parts.",
          nudge: "Does book() invent new logic, or sequence existing objects?" },
        { type: "exercise", title: "Orchestrate the subsystems",
          prompt: ["Complete `book`: quote the price into `cents`, charge it, then return `cents`."],
          starter: String.raw`class BookingService:
    def __init__(self):
        self.pricing = Pricing()
        self.payments = Payments()

    def book(self, dog):
        # your code here
        pass`,
          solution: String.raw`class BookingService:
    def __init__(self):
        self.pricing = Pricing()
        self.payments = Payments()

    def book(self, dog):
        cents = self.pricing.quote(dog)
        self.payments.charge(cents)
        return cents`,
          checks: [
            { re: /cents=self.pricing.quote\(dog\)/, hint: "Quote first: cents = self.pricing.quote(dog)." },
            { re: /self.payments.charge\(cents\)/, hint: "Then charge: self.payments.charge(cents)." },
            { re: /return cents/, hint: "Return the total: return cents." },
          ],
          mustNot: [ { re: /def quote/, hint: "The facade calls quote; it doesn't redefine it." } ],
          success: "One method, the whole booking flow — that's the facade's whole job." },
      ],
    },
    {
      id: "flyweight",
      title: "Flyweight",
      steps: [
        { type: "text", md: [
          "## Share immutable objects to save memory",
          "**Flyweight** shares one copy of an object across many owners instead of duplicating it. Thousands of `Dog` instances each carry a breed — but there are only ~200 breeds, and a breed is immutable. Interning them means every Golden Retriever points at the *same* `Breed` object.",
          "The realization in Python is a factory with a cache dict: same key, same instance returned. Identity (`is`) proves the sharing.",
        ] },
        { type: "code", title: "breed factory with a cache",
          source: String.raw`class Breed:
    def __init__(self, name): self.name = name

_breeds = {}

def breed(name):
    if name not in _breeds:
        _breeds[name] = Breed(name)
    return _breeds[name]

a = breed("Golden Retriever")
b = breed("Golden Retriever")
print(a is b)   # True — one shared Breed object`,
          caption: "The cache guarantees one instance per breed name, shared by every dog." },
        { type: "quiz",
          q: "What must be true of a Flyweight object for sharing to be safe?",
          choices: [
            "It must be immutable (or its shared state must be), so no owner can mutate what everyone shares",
            "It must be a subclass of dict",
            "It must be recreated on every call",
            "It must hold each dog's unique data",
          ],
          answer: 0,
          explain: "Shared state has to be intrinsic and immutable; per-owner (extrinsic) data stays outside the flyweight.",
          nudge: "What breaks if one dog could rename the shared Breed object?" },
        { type: "exercise", title: "Cache one instance per name",
          prompt: ["Complete `breed`: if `name` isn't in `_breeds`, store `Breed(name)` there; then return `_breeds[name]`."],
          starter: String.raw`_breeds = {}

def breed(name):
    # your code here
    return _breeds[name]`,
          solution: String.raw`_breeds = {}

def breed(name):
    if name not in _breeds:
        _breeds[name] = Breed(name)
    return _breeds[name]`,
          checks: [
            { re: /if name not in _breeds:/, hint: "Guard: if name not in _breeds:." },
            { re: /_breeds\[name\]=Breed\(name\)/, hint: "Cache it: _breeds[name] = Breed(name)." },
          ],
          mustNot: [ { re: /return Breed\(name\)/, hint: "Return the cached instance, not a fresh one." } ],
          success: "Repeated calls for the same breed hand back the exact same object — memory saved." },
      ],
    },
    {
      id: "proxy",
      title: "Proxy",
      steps: [
        { type: "text", md: [
          "## A stand-in that controls access to the real object",
          "**Proxy** is an object that fronts another object with the same interface, adding control: lazy loading, access checks, rate limiting, caching. A walker's photo is expensive to load — a proxy defers loading until the first read, then delegates to the real subject.",
          "Same interface as the real thing, but the proxy decides *when* and *whether* the real work happens.",
        ] },
        { type: "code", title: "lazy photo proxy",
          source: String.raw`class RealPhoto:
    def __init__(self, path):
        print(f"loading {path}...")   # pretend this is slow
        self.data = f"<bytes of {path}>"

class PhotoProxy:
    def __init__(self, path):
        self._path = path
        self._real = None

    def data(self):
        if self._real is None:
            self._real = RealPhoto(self._path)   # load on first use
        return self._real.data

p = PhotoProxy("ana.jpg")
print(p.data())   # loads now, then returns the bytes`,
          caption: "Nothing loads until data() is first called — the proxy gates the real object." },
        { type: "quiz",
          q: "What is the proxy doing that a direct reference wouldn't?",
          choices: [
            "Controlling access — here deferring the expensive load until the object is actually needed",
            "Changing the photo's contents",
            "Making the photo load faster",
            "Removing the RealPhoto class",
          ],
          answer: 0,
          explain: "A proxy shares the subject's interface but interposes control: lazy init, auth, throttling, caching.",
          nudge: "When does RealPhoto actually get constructed?" },
        { type: "exercise", title: "Load on first use",
          prompt: ["Complete `data`: if `self._real` is None, set it to `RealPhoto(self._path)`; then return `self._real.data`."],
          starter: String.raw`class PhotoProxy:
    def __init__(self, path):
        self._path = path
        self._real = None

    def data(self):
        # your code here
        pass`,
          solution: String.raw`class PhotoProxy:
    def __init__(self, path):
        self._path = path
        self._real = None

    def data(self):
        if self._real is None:
            self._real = RealPhoto(self._path)
        return self._real.data`,
          checks: [
            { re: /if self._real is None:/, hint: "Guard: if self._real is None:." },
            { re: /self._real=RealPhoto\(self._path\)/, hint: "Load it: self._real = RealPhoto(self._path)." },
            { re: /return self._real.data/, hint: "Delegate: return self._real.data." },
          ],
          mustNot: [ { re: /RealPhoto\(self._path\)\.data/, hint: "Cache the real object in self._real, don't rebuild it each call." } ],
          success: "The real photo loads only when first read — the proxy controlled access." },
      ],
    },
    // ─────────────────────────── BEHAVIORAL (11) ───────────────────────────
    {
      id: "chain-of-responsibility",
      title: "Chain of Responsibility",
      steps: [
        { type: "text", md: [
          "## Pass a request down a line of handlers",
          "**Chain of Responsibility** sends a request along a sequence of handlers; each either handles it or passes it on. A booking must clear a pipeline: availability, then payment, then policy. The *first* failing check stops the chain and reports why.",
          "In Python the whole pattern often collapses to a list of callables and a loop — no linked handler objects needed.",
        ] },
        { type: "code", title: "validation pipeline",
          source: String.raw`def check_availability(req):
    return None if req["slot_free"] else "slot taken"

def check_payment(req):
    return None if req["card_ok"] else "card declined"

def run_chain(req, handlers):
    for handler in handlers:
        error = handler(req)
        if error:
            return error          # first failure stops the chain
    return "ok"

req = {"slot_free": True, "card_ok": False}
print(run_chain(req, [check_availability, check_payment]))   # card declined`,
          caption: "Each handler returns None to pass, or an error string to halt the chain." },
        { type: "quiz",
          q: "How is Chain of Responsibility usually realized in idiomatic Python?",
          choices: [
            "As a list of callables the request passes through, stopping at the first that rejects it",
            "As a single giant if/elif block",
            "As a subclass per handler with mandatory inheritance",
            "As a global variable holding the result",
          ],
          answer: 0,
          explain: "First-class functions make the chain a plain list of callables — no handler base class required.",
          nudge: "What does the loop do the moment a handler returns an error?" },
        { type: "exercise", title: "Stop at the first failure",
          prompt: ["Complete `run_chain`: call each handler on `req`; if it returns a truthy error, return that error. If none fail, return \"ok\"."],
          starter: String.raw`def run_chain(req, handlers):
    for handler in handlers:
        # your code here
        pass
    return "ok"`,
          solution: String.raw`def run_chain(req, handlers):
    for handler in handlers:
        error = handler(req)
        if error:
            return error
    return "ok"`,
          checks: [
            { re: /error=handler\(req\)/, hint: "Run it: error = handler(req)." },
            { re: /if error:/, hint: "Check it: if error:." },
            { re: /return error/, hint: "Bail early: return error." },
          ],
          mustNot: [ { re: /return "ok"(?![\s\S]*for)/, hint: "Return \"ok\" only after the loop, once all handlers pass." } ],
          success: "The request flows through handlers and halts at the first rejection." },
      ],
    },
    {
      id: "command",
      title: "Command",
      steps: [
        { type: "text", md: [
          "## Package a request as an object",
          "**Command** turns a request into a standalone object with an `execute` method, so you can queue it, log it, retry it, or undo it. Background jobs are the perfect fit: each job *is* a command; a runner just calls each one.",
          "In Python any callable is already a command — a function, a lambda, or an object with `__call__`. The pattern earns its keep when the command also needs to carry state or support undo.",
        ] },
        { type: "code", title: "commands and a runner",
          source: String.raw`class SendReceipt:
    def __init__(self, booking_id):
        self.booking_id = booking_id
    def __call__(self):
        return f"receipt sent for {self.booking_id}"

class ChargeCard:
    def __init__(self, cents):
        self.cents = cents
    def __call__(self):
        return f"charged {self.cents}"

def run_all(commands):
    return [cmd() for cmd in commands]

print(run_all([ChargeCard(2500), SendReceipt(7)]))
# ['charged 2500', 'receipt sent for 7']`,
          caption: "Each command carries its own data and runs via __call__; the runner just calls each." },
        { type: "quiz",
          q: "Why package a request as a Command object instead of just calling a function?",
          choices: [
            "So the request can be stored, queued, logged, retried, or undone — it's a value you can pass around",
            "Because functions can't take arguments",
            "It makes the request run twice as fast",
            "Python requires classes for all callbacks",
          ],
          answer: 0,
          explain: "Reifying the request as an object lets you defer, schedule, record, and reverse it — exactly what a job queue needs.",
          nudge: "What can you do with a command object that you can't do with an already-executed call?" },
        { type: "exercise", title: "Run a list of commands",
          prompt: ["Complete `run_all`: call each command in `commands` and return the list of their results."],
          starter: String.raw`def run_all(commands):
    # your code here
    pass`,
          solution: String.raw`def run_all(commands):
    return [cmd() for cmd in commands]`,
          checks: [
            { re: /return\[cmd\(\)for cmd in commands\]/, hint: "Run each: return [cmd() for cmd in commands]." },
          ],
          mustNot: [ { re: /return commands/, hint: "Return the results of calling them, not the commands themselves." } ],
          success: "A runner that executes any list of commands — the heart of a job queue." },
      ],
    },
    {
      id: "interpreter",
      title: "Interpreter",
      steps: [
        { type: "text", md: [
          "## Evaluate sentences in a tiny language",
          "**Interpreter** defines a grammar and an evaluator for a small domain language. Honestly? This is the rarest GoF pattern in everyday app code — if you need a real language you reach for a parser library, not hand-rolled Interpreter classes. But a *tiny* rule language shows the idea.",
          "PawWalk scenario: a price-adjustment rule expressed as tokens like `(\"add\", 500)`, `(\"sub\", 200)`, evaluated against a starting total.",
        ] },
        { type: "code", title: "evaluate price tokens",
          source: String.raw`def evaluate(tokens, start):
    total = start
    for op, amount in tokens:
        if op == "add":
            total += amount
        elif op == "sub":
            total -= amount
    return total

rules = [("add", 500), ("sub", 200)]
print(evaluate(rules, 2500))   # 2800`,
          caption: "Each token is a tiny instruction; the interpreter folds them over the total." },
        { type: "quiz",
          q: "Why is Interpreter rare in ordinary application code?",
          choices: [
            "For anything beyond a trivial grammar you use a real parser/library, not hand-written Interpreter classes",
            "Because Python can't evaluate expressions",
            "Because it's the fastest pattern and thus overused",
            "Because it's identical to Strategy",
          ],
          answer: 0,
          explain: "Real languages need real parsers; Interpreter only pays off for very small, stable, in-house grammars.",
          nudge: "What would you actually reach for to parse a non-trivial expression language?" },
        { type: "exercise", title: "Fold the tokens",
          prompt: ["Complete `evaluate`: for each `(op, amount)`, add on \"add\" and subtract on \"sub\", then return the running `total`."],
          starter: String.raw`def evaluate(tokens, start):
    total = start
    for op, amount in tokens:
        # your code here
        pass
    return total`,
          solution: String.raw`def evaluate(tokens, start):
    total = start
    for op, amount in tokens:
        if op == "add":
            total += amount
        elif op == "sub":
            total -= amount
    return total`,
          checks: [
            { re: /if op=="add":/, hint: "Handle add: if op == \"add\":." },
            { re: /total\+=amount/, hint: "Add it: total += amount." },
            { re: /total-=amount/, hint: "Subtract on sub: total -= amount." },
          ],
          mustNot: [ { re: /return amount/, hint: "Return the accumulated total, not a single amount." } ],
          success: "A minimal interpreter — it folds a list of instructions into a result." },
      ],
    },
    {
      id: "iterator",
      title: "Iterator",
      steps: [
        { type: "text", md: [
          "## Step through a collection without exposing its guts",
          "**Iterator** lets you traverse a collection's elements without revealing how it stores them. This is the pattern most fully absorbed into the language: Python's `for` loop *is* the iterator protocol. You define `__iter__` (often as a generator) and the whole ecosystem — `for`, `list()`, `sum()`, unpacking — just works.",
          "A `Calendar` of bookings can decide its own order and yield entries; callers never touch the internal list.",
        ] },
        { type: "code", title: "a custom iterable",
          source: String.raw`class Calendar:
    def __init__(self, bookings):
        self._bookings = bookings

    def __iter__(self):
        for b in self._bookings:       # yield in our own order
            yield b

cal = Calendar(["Mon walk", "Tue walk", "Wed walk"])
for entry in cal:
    print(entry)
# Mon walk / Tue walk / Wed walk`,
          caption: "Defining __iter__ as a generator makes the object work with any for-loop." },
        { type: "quiz",
          q: "What does defining __iter__ give a custom class?",
          choices: [
            "It becomes iterable — usable in for-loops, list(), sum(), and unpacking, with the internals hidden",
            "It becomes a dict",
            "It gains a length automatically",
            "It can only be looped over once ever",
          ],
          answer: 0,
          explain: "The iterator protocol is built in; __iter__ is the single hook the whole language traverses through.",
          nudge: "Which language construct calls __iter__ under the hood?" },
        { type: "exercise", title: "Yield the items",
          prompt: ["Complete `__iter__`: loop over `self._bookings` and `yield` each one."],
          starter: String.raw`class Calendar:
    def __init__(self, bookings):
        self._bookings = bookings

    def __iter__(self):
        # your code here
        pass`,
          solution: String.raw`class Calendar:
    def __init__(self, bookings):
        self._bookings = bookings

    def __iter__(self):
        for b in self._bookings:
            yield b`,
          checks: [
            { re: /for b in self._bookings:/, hint: "Loop: for b in self._bookings:." },
            { re: /yield b/, hint: "Yield each: yield b." },
          ],
          mustNot: [ { re: /return self._bookings/, hint: "Yield the items to be an iterator, don't return the raw list." } ],
          success: "A custom iterable — the for-loop drives it and the internals stay hidden." },
      ],
    },
    {
      id: "mediator",
      title: "Mediator",
      steps: [
        { type: "text", md: [
          "## A hub so peers don't reference each other",
          "**Mediator** centralizes communication in one object so participants talk to the hub, not to each other. A dispatch center coordinates the walker, the owner, and the GPS tracker: when one raises an event, the mediator decides who else hears it. The peers stay decoupled.",
          "Without a mediator, every participant holds references to every other — an n-to-n tangle. With one, it's n-to-hub.",
        ] },
        { type: "code", title: "dispatch mediator",
          source: String.raw`class Dispatch:
    def __init__(self):
        self.participants = {}

    def register(self, name, participant):
        self.participants[name] = participant

    def notify(self, sender, event):
        out = []
        for name, p in self.participants.items():
            if name != sender:               # route to everyone else
                out.append(p.receive(event))
        return out

class Peer:
    def receive(self, event): return f"got {event}"

d = Dispatch()
d.register("walker", Peer())
d.register("owner", Peer())
print(d.notify("walker", "walk_started"))   # ['got walk_started']`,
          caption: "notify routes an event from one peer to all the others through the hub." },
        { type: "quiz",
          q: "What coupling problem does the Mediator fix?",
          choices: [
            "It removes the n-to-n web of peers referencing each other — everyone talks to one hub instead",
            "It makes each peer faster",
            "It lets peers skip having a receive method",
            "It merges all peers into one object",
          ],
          answer: 0,
          explain: "Centralizing interaction turns a combinatorial mesh of references into a single coordinating point.",
          nudge: "How many references does each peer need if they all go through the hub?" },
        { type: "exercise", title: "Route to everyone but the sender",
          prompt: ["Complete `notify`: for each registered `(name, p)`, if `name` isn't the sender, append `p.receive(event)` to `out`; return `out`."],
          starter: String.raw`def notify(self, sender, event):
    out = []
    for name, p in self.participants.items():
        # your code here
    return out`,
          solution: String.raw`def notify(self, sender, event):
    out = []
    for name, p in self.participants.items():
        if name != sender:
            out.append(p.receive(event))
    return out`,
          checks: [
            { re: /if name!=sender:/, hint: "Skip the sender: if name != sender:." },
            { re: /out.append\(p.receive\(event\)\)/, hint: "Route it: out.append(p.receive(event))." },
          ],
          mustNot: [ { re: /if name==sender:/, hint: "You route to everyone EXCEPT the sender." } ],
          success: "The hub fans one peer's event out to the rest — peers stay decoupled." },
      ],
    },
    {
      id: "memento",
      title: "Memento",
      steps: [
        { type: "text", md: [
          "## Capture state now, restore it later",
          "**Memento** snapshots an object's internal state into a separate token so you can restore it later — without exposing how the object stores things. A booking draft can be saved before risky edits; if the user cancels, you put the saved state back.",
          "The memento is just captured data (often a dict copy). `save_state()` produces it; `restore(memento)` writes it back.",
        ] },
        { type: "code", title: "draft with undo",
          source: String.raw`class BookingDraft:
    def __init__(self, dog, date):
        self.dog = dog
        self.date = date

    def save_state(self):
        return {"dog": self.dog, "date": self.date}   # the memento

    def restore(self, memento):
        self.dog = memento["dog"]
        self.date = memento["date"]

draft = BookingDraft("Rex", "2026-07-10")
snapshot = draft.save_state()
draft.date = "oops"
draft.restore(snapshot)
print(draft.date)   # 2026-07-10 — restored`,
          caption: "save_state captures the fields; restore writes a saved snapshot back." },
        { type: "quiz",
          q: "What is the memento itself in this design?",
          choices: [
            "A captured copy of the object's state that can be handed back to restore()",
            "A reference to the live object, so edits show through",
            "A subclass of BookingDraft",
            "A global variable holding all drafts",
          ],
          answer: 0,
          explain: "The memento is a self-contained snapshot; because it's a copy, later edits to the object don't corrupt it.",
          nudge: "If the memento were a live reference, would restoring undo your changes?" },
        { type: "exercise", title: "Capture the state",
          prompt: ["Complete `save_state`: return a dict copying `self.dog` and `self.date`."],
          starter: String.raw`class BookingDraft:
    def __init__(self, dog, date):
        self.dog = dog
        self.date = date

    def save_state(self):
        # your code here
        pass`,
          solution: String.raw`class BookingDraft:
    def __init__(self, dog, date):
        self.dog = dog
        self.date = date

    def save_state(self):
        return {"dog": self.dog, "date": self.date}`,
          checks: [
            { re: /return\{"dog":self.dog,"date":self.date\}/, hint: "Snapshot both fields: return {\"dog\": self.dog, \"date\": self.date}." },
          ],
          mustNot: [ { re: /return self(?!\.)/, hint: "Return a copy of the fields, not the live object." } ],
          success: "A snapshot you can stash and restore — undo, the GoF way." },
      ],
    },
    {
      id: "observer",
      title: "Observer",
      steps: [
        { type: "text", md: [
          "## Subscribers get notified when the subject changes",
          "**Observer** lets a subject keep a list of interested parties and notify them all when something happens — without knowing who they are. When a walk's status changes, the owner's app, analytics, and push service all need to hear it. The subject just calls each subscriber.",
          "In Python a subscriber is any callable, so the whole pattern is a list of callbacks plus a `notify` that calls each. (`from observer import ...`-style base classes are optional ceremony.)",
        ] },
        { type: "code", title: "status subject",
          source: String.raw`class WalkStatus:
    def __init__(self):
        self._subscribers = []

    def subscribe(self, callback):
        self._subscribers.append(callback)

    def notify(self, status):
        for cb in self._subscribers:
            cb(status)

walk = WalkStatus()
walk.subscribe(lambda s: print(f"owner sees {s}"))
walk.subscribe(lambda s: print(f"analytics logs {s}"))
walk.notify("in_progress")
# owner sees in_progress / analytics logs in_progress`,
          caption: "Subscribers are just callables; notify fans the event out to each." },
        { type: "quiz",
          q: "What does the subject know about its observers?",
          choices: [
            "Only that each is callable — it holds a list and calls them, staying decoupled from who they are",
            "Their concrete classes and method names",
            "Exactly one observer at a time",
            "Nothing; observers poll the subject instead",
          ],
          answer: 0,
          explain: "The subject depends only on the callable contract, so you can add or remove observers freely.",
          nudge: "Does the subject import or name any specific subscriber class?" },
        { type: "exercise", title: "Notify every subscriber",
          prompt: ["Complete `notify`: call each callback in `self._subscribers`, passing `status`."],
          starter: String.raw`class WalkStatus:
    def __init__(self):
        self._subscribers = []

    def subscribe(self, callback):
        self._subscribers.append(callback)

    def notify(self, status):
        # your code here
        pass`,
          solution: String.raw`class WalkStatus:
    def __init__(self):
        self._subscribers = []

    def subscribe(self, callback):
        self._subscribers.append(callback)

    def notify(self, status):
        for cb in self._subscribers:
            cb(status)`,
          checks: [
            { re: /for cb in self._subscribers:/, hint: "Loop: for cb in self._subscribers:." },
            { re: /cb\(status\)/, hint: "Call each: cb(status)." },
          ],
          mustNot: [ { re: /self._subscribers\(status\)/, hint: "Call each subscriber, not the list itself." } ],
          success: "One status change, every subscriber notified — the observer loop." },
      ],
    },
    {
      id: "state",
      title: "State",
      steps: [
        { type: "text", md: [
          "## Behavior changes with internal state, via legal transitions",
          "**State** lets an object change its behavior when its internal state changes, moving between states only along allowed edges. A booking goes `requested -> confirmed -> in_progress -> completed`, or can be `cancelled` from some states — but you must never jump from `completed` back to `requested`.",
          "The lazy, robust realization is a transitions map: `state -> set of allowed next states`. Any move not in the map raises.",
        ] },
        { type: "code", title: "booking state machine",
          source: String.raw`ALLOWED = {
    "requested":   {"confirmed", "cancelled"},
    "confirmed":   {"in_progress", "cancelled"},
    "in_progress": {"completed"},
    "completed":   set(),
    "cancelled":   set(),
}

class Booking:
    def __init__(self):
        self.status = "requested"

    def transition(self, to):
        if to not in ALLOWED[self.status]:
            raise ValueError(f"can't go {self.status} -> {to}")
        self.status = to

b = Booking()
b.transition("confirmed")
b.transition("in_progress")
print(b.status)   # in_progress`,
          caption: "The map encodes every legal edge; illegal moves raise instead of corrupting state." },
        { type: "quiz",
          q: "Why drive the machine from an ALLOWED transitions map?",
          choices: [
            "It makes legal moves explicit and data-driven, so illegal transitions are rejected in one place",
            "It runs faster than an if/elif chain",
            "It lets any state reach any other state",
            "It removes the need to store the current status",
          ],
          answer: 0,
          explain: "A declarative map centralizes the rules; the transition logic is one guard, and the edges are data you can audit.",
          nudge: "Where is the rule that completed can't go anywhere?" },
        { type: "exercise", title: "Guard the transition",
          prompt: ["Complete `transition`: if `to` isn't in `ALLOWED[self.status]`, raise ValueError; otherwise set `self.status = to`."],
          starter: String.raw`class Booking:
    def __init__(self):
        self.status = "requested"

    def transition(self, to):
        # your code here
        pass`,
          solution: String.raw`class Booking:
    def __init__(self):
        self.status = "requested"

    def transition(self, to):
        if to not in ALLOWED[self.status]:
            raise ValueError(f"can't go {self.status} -> {to}")
        self.status = to`,
          checks: [
            { re: /if to not in ALLOWED\[self.status\]:/, hint: "Guard: if to not in ALLOWED[self.status]:." },
            { re: /raise ValueError/, hint: "Reject illegal moves: raise ValueError(...)." },
            { re: /self.status=to/, hint: "On success: self.status = to." },
          ],
          mustNot: [ { re: /self.status=to[\s\S]*if to not in/, hint: "Check legality BEFORE assigning the new status." } ],
          success: "Only legal transitions succeed; everything else raises — a safe state machine." },
      ],
    },
    {
      id: "strategy",
      title: "Strategy",
      steps: [
        { type: "text", md: [
          "## Swap interchangeable algorithms at runtime",
          "**Strategy** captures a family of algorithms behind one interface so you can pick which to use at runtime. Pricing has several strategies — flat, surge, member-discount — and the right one depends on the booking. The calculator doesn't care which; it just applies the strategy it's given.",
          "Say it plainly: in Python a strategy is almost always **just a callable** — a function or lambda you pass in. No Strategy base class, no subclass per algorithm.",
        ] },
        { type: "code", title: "pricing strategies as callables",
          source: String.raw`def flat(base):     return base
def surge(base):    return int(base * 1.5)
def member(base):   return int(base * 0.9)

class PriceCalculator:
    def __init__(self, strategy):
        self._strategy = strategy      # any callable base -> price

    def price(self, base):
        return self._strategy(base)

print(PriceCalculator(surge).price(2500))    # 3750
print(PriceCalculator(member).price(2500))   # 2250`,
          caption: "The strategy is a plain function; swap it to change the algorithm." },
        { type: "quiz",
          q: "What's the idiomatic Python realization of Strategy?",
          choices: [
            "Pass a callable (function or lambda) — no base class or per-algorithm subclass needed",
            "One giant class with an if/elif for every algorithm",
            "A subclass of PriceCalculator per pricing rule",
            "A global flag that the calculator reads",
          ],
          answer: 0,
          explain: "First-class functions ARE the strategy object; injecting a callable is the whole pattern.",
          nudge: "What type is `surge` in the example — a class or a function?" },
        { type: "exercise", title: "Apply the strategy",
          prompt: ["Complete `price`: apply `self._strategy` to `base` and return the result."],
          starter: String.raw`class PriceCalculator:
    def __init__(self, strategy):
        self._strategy = strategy

    def price(self, base):
        # your code here
        pass`,
          solution: String.raw`class PriceCalculator:
    def __init__(self, strategy):
        self._strategy = strategy

    def price(self, base):
        return self._strategy(base)`,
          checks: [
            { re: /return self._strategy\(base\)/, hint: "Apply it: return self._strategy(base)." },
          ],
          mustNot: [ { re: /if .*surge|def flat/, hint: "Don't branch on algorithms — just call the injected strategy." } ],
          success: "One line applies whatever strategy you injected — algorithms swapped at runtime." },
      ],
    },
    {
      id: "template-method",
      title: "Template Method",
      steps: [
        { type: "text", md: [
          "## Base defines the skeleton; subclasses fill in steps",
          "**Template Method** puts the overall algorithm in a base method that calls smaller steps, letting subclasses override individual steps without changing the sequence. A report generator's `run()` always does header, then body, then footer — but each report type supplies its own `body()`.",
          "This one genuinely benefits from inheritance: the base fixes the order; subclasses customize the variable parts.",
        ] },
        { type: "code", title: "report sections",
          source: String.raw`class ReportSection:
    def header(self): return "=== PawWalk Report ==="
    def body(self):   return "(no body)"
    def footer(self): return "--- end ---"

    def run(self):                       # the template method
        return "\n".join([self.header(), self.body(), self.footer()])

class WalksReport(ReportSection):
    def body(self):                      # override just one step
        return "12 walks completed"

print(WalksReport().run())`,
          caption: "run() fixes the header/body/footer order; the subclass overrides only body." },
        { type: "quiz",
          q: "Which part does the subclass control in a Template Method?",
          choices: [
            "Individual steps it overrides — the base method keeps the overall sequence fixed",
            "The order the steps run in",
            "Whether run() is called at all",
            "Nothing; the base does everything",
          ],
          answer: 0,
          explain: "The invariant algorithm lives in the base; subclasses vary only the designated steps.",
          nudge: "Does WalksReport change when header runs, or just what body returns?" },
        { type: "exercise", title: "Override the body step",
          prompt: ["Subclass ReportSection as WalksReport and override `body` to return \"12 walks completed\"."],
          starter: String.raw`class WalksReport(ReportSection):
    # your code here
    pass`,
          solution: String.raw`class WalksReport(ReportSection):
    def body(self):
        return "12 walks completed"`,
          checks: [
            { re: /class WalksReport\(ReportSection\):/, hint: "Subclass it: class WalksReport(ReportSection):." },
            { re: /def body\(self\):/, hint: "Override the step: def body(self):." },
            { re: /return"12 walks completed"/, hint: "Return \"12 walks completed\"." },
          ],
          mustNot: [ { re: /def run\(self\)/, hint: "Don't override run — only the body step." } ],
          success: "The base skeleton stays fixed; your subclass supplied just the body." },
      ],
    },
    {
      id: "visitor",
      title: "Visitor",
      steps: [
        { type: "text", md: [
          "## Add operations over a fixed structure via double dispatch",
          "**Visitor** lets you add new operations to a set of object types *without* modifying them, by having each element `accept(visitor)` and call back `visitor.visit_X(self)`. That two-hop callback is **double dispatch** — the method that runs depends on both the element type and the visitor type.",
          "Be honest: Visitor is clunky in dynamic languages. In Python you'd usually just write a function that does a `match`/`isinstance` on the item type — no accept methods, no double dispatch. Learn it, but reach for pattern matching first.",
        ] },
        { type: "code", title: "line items and visitors",
          source: String.raw`class Item:
    def __init__(self, cents): self.cents = cents
    def accept(self, visitor):
        return visitor.visit_item(self)     # double dispatch

class TotalVisitor:
    def visit_item(self, item):
        return item.cents

class ReceiptVisitor:
    def visit_item(self, item):
        return f"line: {item.cents}"

item = Item(2500)
print(item.accept(TotalVisitor()))     # 2500
print(item.accept(ReceiptVisitor()))   # line: 2500`,
          caption: "accept calls back into visit_item, so the item type and visitor type together pick the code." },
        { type: "quiz",
          q: "Why is Visitor often replaced by pattern matching in Python?",
          choices: [
            "A match/isinstance on the item type does the same dispatch without accept methods and double-dispatch boilerplate",
            "Because Python lacks classes",
            "Because Visitor is faster and thus unnecessary",
            "Because double dispatch is impossible in Python",
          ],
          answer: 0,
          explain: "Dynamic dispatch on type is trivial with match/isinstance, so the accept/visit ceremony rarely pays off.",
          nudge: "What could you write instead of accept + visit_item to branch on the item's type?" },
        { type: "exercise", title: "Wire up accept",
          prompt: ["Complete `Item.accept`: call `visitor.visit_item(self)` and return it."],
          starter: String.raw`class Item:
    def __init__(self, cents):
        self.cents = cents

    def accept(self, visitor):
        # your code here
        pass`,
          solution: String.raw`class Item:
    def __init__(self, cents):
        self.cents = cents

    def accept(self, visitor):
        return visitor.visit_item(self)`,
          checks: [
            { re: /return visitor.visit_item\(self\)/, hint: "Double dispatch: return visitor.visit_item(self)." },
          ],
          mustNot: [ { re: /def visit_item/, hint: "The item defines accept; the visitor defines visit_item." } ],
          success: "accept calls back into the visitor — double dispatch wired, ceremony and all." },
      ],
    },
  ],
});
