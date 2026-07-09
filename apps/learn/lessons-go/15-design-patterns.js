window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "go-design-patterns",
  title: "Design Patterns in Go",
  emoji: "🧠",
  lang: "go",
  lessons: [
    // ─────────────────────────── FUNCTIONAL OPTIONS ───────────────────────────
    {
      id: "functional-options",
      title: "Functional Options",
      steps: [
        { type: "text", md: [
          "## The most Go pattern there is",
          "You've built the PawWalk server. Now the interview module: the design patterns a Go reviewer actually looks for. We lead with the one that has *no* equivalent in the Gang-of-Four book because it's pure Go — **Functional Options**.",
          "The problem: your `Server` has a dozen knobs — port, timeout, TLS, logger. A constructor `New(port, timeout, tls, logger, ...)` is a wall of positional arguments where nobody remembers the order, and every new knob breaks every caller. Go has no default arguments and no named parameters to fall back on.",
        ] },
        { type: "text", md: [
          "## An option is a function that configures",
          "The trick: an option is a **function that mutates the thing being built**. You define one type — `type Option func(*Server)` — and each `WithX` helper returns a closure that sets one field. The constructor takes a variadic `opts ...Option` and applies them over sensible defaults.",
          "The payoff: callers pass only what they care about, in any order; adding a new knob is a new `WithX` function that breaks nobody.",
        ] },
        { type: "code", title: "internal/server/server.go",
          source: String.raw`package server

import "time"

type Server struct {
	port    int
	timeout time.Duration
}

type Option func(*Server)

func WithTimeout(d time.Duration) Option {
	return func(s *Server) {
		s.timeout = d
	}
}

func New(opts ...Option) *Server {
	s := &Server{port: 8080, timeout: 15 * time.Second} // defaults
	for _, opt := range opts {
		opt(s)
	}
	return s
}

// srv := New(WithTimeout(30 * time.Second))  // port stays 8080`,
          caption: "One Option type, a WithX per knob, and a variadic constructor that folds them over defaults." },
        { type: "quiz",
          q: "Why do Go APIs reach for functional options instead of a big constructor?",
          choices: [
            "Callers set only the knobs they care about in any order, and new options are added without breaking existing callers",
            "It makes the server start faster",
            "Go requires every constructor to be variadic",
            "It removes the need for the Server struct entirely",
          ],
          answer: 0,
          explain: "Go has no default or named arguments, so a variadic list of `Option` closures gives you optional, self-documenting, order-independent config — and appending a `WithX` never touches old call sites.",
          nudge: "Think about what happens to existing callers when you add a fourth positional argument versus a new WithX." },
        { type: "exercise", title: "Write WithPort",
          prompt: [
            "Given `type Option func(*Server)`, write `WithPort` so `New(WithPort(9000))` sets the port.",
            "Return a closure `func(s *Server)` that sets `s.port = p`.",
          ],
          starter: String.raw`type Option func(*Server)

func WithPort(p int) Option {
	// your code here
}`,
          solution: String.raw`type Option func(*Server)

func WithPort(p int) Option {
	return func(s *Server) {
		s.port = p
	}
}`,
          checks: [
            { re: /type Option func\(\*Server\)/, hint: "Keep the type alias: `type Option func(*Server)` — an Option is a function that configures a *Server." },
            { re: /func WithPort\(p int\)Option\{/, hint: "Signature: `func WithPort(p int) Option {` — it takes the port and returns an Option." },
            { re: /return func\(s\*Server\)\{/, hint: "Return a closure: `return func(s *Server) {` — that closure is the Option." },
            { re: /s\.port=p/, hint: "Inside the closure set the field: `s.port = p`." },
          ],
          mustNot: [
            { re: /func New\(/, hint: "Just write WithPort — the constructor already exists." },
          ],
          success: "That closure captures `p` and sets the port when `New` applies it. Every knob on the server is now one small function." },
      ],
    },
    // ─────────────────────────── STRATEGY ───────────────────────────
    {
      id: "strategy",
      title: "Strategy",
      steps: [
        { type: "text", md: [
          "## Swap the algorithm, keep the caller",
          "**Strategy** captures a family of interchangeable algorithms behind one contract so you can pick which runs at runtime. PawWalk prices a walk several ways — flat, weekend surge, member discount — and the code that charges the card shouldn't care which. It just applies the strategy it was handed.",
          "In most languages Strategy means an interface plus a subclass per algorithm. Go gives you two idiomatic routes, and the lighter one is very Go: a **function type**. `type PriceFunc func(int) int` — any function with that shape *is* a pricing strategy. No interface, no struct.",
        ] },
        { type: "code", title: "internal/pricing/pricing.go",
          source: String.raw`package pricing

// A strategy is any function base-cents -> final-cents.
type PriceFunc func(int) int

func Flat(base int) int  { return base }
func Surge(base int) int { return base * 3 / 2 }

type Calculator struct {
	price PriceFunc // the injected strategy
}

func (c Calculator) Total(base int) int {
	return c.price(base)
}

// Calculator{price: Surge}.Total(2500) == 3750`,
          caption: "The function type IS the strategy object; swap Flat for Surge to change the algorithm." },
        { type: "text", md: [
          "## Function type or interface?",
          "Reach for a **function type** when the strategy is one operation (price this, format that). Reach for a small **interface** when the strategy needs several methods or its own state — e.g. `type Pricer interface { Price(base int) int }` implemented by a `SurgePricer` struct that carries a multiplier.",
          "> Both are Strategy. Go's rule of thumb: don't invent an interface for a single function — a `func` type says exactly as much with less ceremony.",
        ] },
        { type: "quiz",
          q: "What is the idiomatic lightweight realization of Strategy in Go?",
          choices: [
            "A named function type like `type PriceFunc func(int) int` — any matching function is a strategy",
            "A giant switch statement inside the calculator",
            "A base struct that every algorithm must embed",
            "A global variable the calculator reads",
          ],
          answer: 0,
          explain: "Functions are first-class values in Go, so a named `func` type is the whole pattern for a single-operation strategy — inject a matching function and call it. Interfaces are the heavier option for multi-method or stateful strategies.",
          nudge: "What type is `Surge` in the example — a struct or a function?" },
        { type: "exercise", title: "Define the strategy type",
          prompt: [
            "Declare the strategy type `PriceFunc` as a function taking an `int` and returning an `int`.",
            "Then write a `Surge` strategy that returns `base * 3 / 2`.",
          ],
          starter: String.raw`// declare the PriceFunc type, then write Surge
// your code here`,
          solution: String.raw`type PriceFunc func(int) int

func Surge(base int) int {
	return base * 3 / 2
}`,
          checks: [
            { re: /type PriceFunc func\(int\)int/, hint: "Name the shape: `type PriceFunc func(int) int` — the parameter has no name in a type, just its type." },
            { re: /func Surge\(base int\)int\{/, hint: "A concrete strategy: `func Surge(base int) int {`." },
            { re: /return base\*3\/2/, hint: "Weekend surge is 1.5x: `return base * 3 / 2` (integer math, so multiply before dividing)." },
          ],
          mustNot: [
            { re: /interface\{/, hint: "For a single operation, a `func` type is enough — no interface needed here." },
          ],
          success: "`Surge` matches `PriceFunc`, so it can be passed anywhere a pricing strategy is expected — algorithms swapped by assignment." },
      ],
    },
    // ─────────────────────────── FACTORY ───────────────────────────
    {
      id: "factory",
      title: "Factory",
      steps: [
        { type: "text", md: [
          "## A constructor that returns an interface",
          "**Factory** hides which concrete type gets built behind a function that returns an *interface*. When a booking changes, PawWalk notifies the owner — by SMS, email, or push. Callers shouldn't scatter `if channel == ...` everywhere; they ask a factory for a `Notifier` and call `Send`.",
          "This is where Go's implicit interfaces shine: `SMSNotifier` and `EmailNotifier` never *declare* that they implement `Notifier` — having the right method is enough. The factory returns the interface; the concrete type is an implementation detail the caller never sees.",
        ] },
        { type: "code", title: "internal/notify/notify.go",
          source: String.raw`package notify

type Notifier interface {
	Send(msg string) error
}

type SMSNotifier struct{}
func (SMSNotifier) Send(msg string) error   { return nil }

type EmailNotifier struct{}
func (EmailNotifier) Send(msg string) error { return nil }

func NewNotifier(kind string) Notifier {
	switch kind {
	case "sms":
		return SMSNotifier{}
	default:
		return EmailNotifier{}
	}
}

// n := NewNotifier("sms"); n.Send("Walk started")`,
          caption: "One switch owns the mapping; the return type is the interface, so callers depend on Send, not on the concrete struct." },
        { type: "quiz",
          q: "Why does `NewNotifier` return `Notifier` (the interface) rather than a concrete struct?",
          choices: [
            "So callers depend only on the Send method — the concrete type can change and adding a channel touches one switch",
            "Because Go can't return structs from functions",
            "To make the notifiers send faster",
            "So that only one notifier can ever exist",
          ],
          answer: 0,
          explain: "Returning the interface decouples callers from the concrete implementation: the mapping lives in one switch, and a new channel is one more `case`. (\"Accept interfaces, return structs\" has an exception — a factory whose whole job is to hide the choice legitimately returns the interface.)",
          nudge: "What would every caller need to know if the factory returned SMSNotifier directly?" },
        { type: "exercise", title: "Write the factory switch",
          prompt: [
            "Write `NewNotifier` returning the `Notifier` interface.",
            "For `\"sms\"` return `SMSNotifier{}`; the default case returns `EmailNotifier{}`.",
          ],
          starter: String.raw`func NewNotifier(kind string) Notifier {
	// your code here
}`,
          solution: String.raw`func NewNotifier(kind string) Notifier {
	switch kind {
	case "sms":
		return SMSNotifier{}
	default:
		return EmailNotifier{}
	}
}`,
          checks: [
            { re: /func NewNotifier\(kind string\)Notifier\{/, hint: "Return the interface: `func NewNotifier(kind string) Notifier {`." },
            { re: /switch kind\{/, hint: "Branch on the input: `switch kind {`." },
            { re: /case"sms":return SMSNotifier\{\}/, hint: "The SMS case: `case \"sms\": return SMSNotifier{}` — an empty struct value." },
            { re: /return EmailNotifier\{\}/, hint: "The `default:` case returns `EmailNotifier{}`." },
          ],
          mustNot: [
            { re: /\*SMSNotifier/, hint: "These notifiers are stateless empty structs — return the value `SMSNotifier{}`, no pointer needed." },
          ],
          success: "Callers ask by channel string and get a `Notifier` back — the concrete choice stays sealed inside the factory." },
      ],
    },
    // ─────────────────────────── SINGLETON ───────────────────────────
    {
      id: "singleton",
      title: "Singleton with sync.Once",
      steps: [
        { type: "text", md: [
          "## One shared instance, built exactly once",
          "**Singleton** guarantees one instance app-wide — one `Config`, one DB pool, one Stripe client. The honest Go answer first: a **package-level variable** initialized in `var` or `func init()` is already a singleton, created once at startup and shared everywhere. If you can build it eagerly, do that and stop.",
          "You reach for machinery only when construction must be **lazy** (defer the expensive work until first use) *and* the program is **concurrent** — and a Go server always is. Two goroutines hitting `Get()` at once must not both build the instance.",
        ] },
        { type: "text", md: [
          "## sync.Once handles the race for you",
          "`sync.Once` runs a function exactly once, no matter how many goroutines call `Do` simultaneously — the rest block until the first finishes, then all see the built instance. It's the correct, lock-free-looking way to do lazy singletons in Go; hand-rolling a `if instance == nil` check is a classic data race.",
        ] },
        { type: "code", title: "internal/config/config.go",
          source: String.raw`package config

import "sync"

type Config struct {
	Timeout int
}

var (
	once     sync.Once
	instance *Config
)

func Get() *Config {
	once.Do(func() {
		instance = &Config{Timeout: 30} // built on first call only
	})
	return instance
}`,
          caption: "once.Do runs its closure a single time across all goroutines; every caller gets the same *Config." },
        { type: "quiz",
          q: "Why use `sync.Once` instead of `if instance == nil { instance = ... }`?",
          choices: [
            "The nil check is a data race under concurrency — two goroutines can both see nil and build twice; sync.Once guarantees exactly one build",
            "sync.Once makes the Config struct smaller",
            "Go forbids comparing pointers to nil",
            "It avoids having to import anything",
          ],
          answer: 0,
          explain: "Under concurrent access the naive check-then-build has a race window where two goroutines both pass the nil check. `sync.Once` serializes the first initialization safely and cheaply.",
          nudge: "Picture two requests hitting Get() at the exact same instant with instance still nil." },
        { type: "exercise", title: "Lazy singleton with once.Do",
          prompt: [
            "Complete `Get`: inside `once.Do`, build `instance = &Config{Timeout: 30}`, then return `instance`.",
          ],
          starter: String.raw`var (
	once     sync.Once
	instance *Config
)

func Get() *Config {
	// your code here
	return instance
}`,
          solution: String.raw`var (
	once     sync.Once
	instance *Config
)

func Get() *Config {
	once.Do(func() {
		instance = &Config{Timeout: 30}
	})
	return instance
}`,
          checks: [
            { re: /once\.Do\(func\(\)\{/, hint: "Run the init once: `once.Do(func() {`." },
            { re: /instance=&Config\{/, hint: "Build the one instance: `instance = &Config{Timeout: 30}` — note the `&` for a pointer." },
            { re: /return instance/, hint: "Hand the shared instance back: `return instance`." },
          ],
          mustNot: [
            { re: /if instance==nil/, hint: "Don't hand-roll the nil check — that's the race `sync.Once` exists to prevent." },
          ],
          success: "First `Get()` builds the Config; every later call — from any goroutine — returns that same pointer, race-free." },
      ],
    },
    // ─────────────────────────── DECORATOR / MIDDLEWARE ───────────────────────────
    {
      id: "decorator",
      title: "Decorator / Middleware",
      steps: [
        { type: "text", md: [
          "## Wrap behavior around something you can't change",
          "**Decorator** wraps an object in another that shares its interface and adds behavior — logging, timing, auth — without touching the wrapped thing. You already met the Go form of this in module 06: **HTTP middleware**. A middleware takes a handler and returns a handler.",
          "The signature is the whole pattern: `func(next http.Handler) http.Handler`. The wrapper does its extra work, then calls `next.ServeHTTP` to delegate. Because the return type matches the input type, decorators **stack** — `Logging(Auth(handler))` is a handler that logs, then authorizes, then runs the real one.",
        ] },
        { type: "code", title: "internal/middleware/logging.go",
          source: String.raw`package middleware

import "net/http"

func Logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// ... log the request here ...
		next.ServeHTTP(w, r) // delegate to the wrapped handler
	})
}

// mux is an http.Handler; wrapping preserves the type:
// handler := Logging(Auth(mux))`,
          caption: "Same type in, same type out — so wrappers compose. http.HandlerFunc adapts the closure into an http.Handler." },
        { type: "quiz",
          q: "Why does HTTP middleware use the shape `func(next http.Handler) http.Handler`?",
          choices: [
            "Because input and output are the same type, decorators can be stacked in any combination around the real handler",
            "Because Go requires all HTTP functions to return handlers",
            "To make each request run concurrently",
            "So the wrapped handler can be garbage collected sooner",
          ],
          answer: 0,
          explain: "Matching the input and output type is what makes middleware composable — each wrapper adds behavior and forwards to `next`, and any number of them nest cleanly around the base handler.",
          nudge: "What has to be true about the return type for Logging(Auth(mux)) to type-check?" },
        { type: "exercise", title: "Write a logging decorator",
          prompt: [
            "Write `Logging` that wraps `next` and returns an `http.Handler`.",
            "Return an `http.HandlerFunc` closure that calls `next.ServeHTTP(w, r)`.",
          ],
          starter: String.raw`func Logging(next http.Handler) http.Handler {
	// your code here
}`,
          solution: String.raw`func Logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		next.ServeHTTP(w, r)
	})
}`,
          checks: [
            { re: /func Logging\(next http\.Handler\)http\.Handler\{/, hint: "The middleware shape: `func Logging(next http.Handler) http.Handler {`." },
            { re: /return http\.HandlerFunc\(/, hint: "Adapt a closure into a handler: `return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {`." },
            { re: /next\.ServeHTTP\(w,r\)/, hint: "Delegate to the wrapped handler: `next.ServeHTTP(w, r)`." },
          ],
          mustNot: [
            { re: /func Logging\(next http\.Handler\)http\.Handler\{\}/, hint: "The body can't be empty — build and return the wrapping handler." },
          ],
          success: "A decorator that adds a layer and forwards the rest — stack as many as you like around any handler." },
      ],
    },
    // ─────────────────────────── OBSERVER ───────────────────────────
    {
      id: "observer",
      title: "Observer with channels",
      steps: [
        { type: "text", md: [
          "## Notify subscribers when something happens",
          "**Observer** lets a subject keep a list of interested parties and tell them all when its state changes — without knowing who they are. When a walk's status flips to `in_progress`, the owner's app, analytics, and the push service all need to hear it.",
          "Go's concurrency toolkit gives this a native flavor: subscribers are **channels**. `Subscribe` appends a fresh channel to a slice and hands it back; `Publish` ranges over the slice and sends the event on each. Every subscriber receives on its own channel in its own goroutine — decoupled and concurrent by construction.",
        ] },
        { type: "code", title: "internal/walk/status.go",
          source: String.raw`package walk

type Subject struct {
	subs []chan string
}

func (s *Subject) Subscribe() chan string {
	ch := make(chan string, 1)
	s.subs = append(s.subs, ch)
	return ch
}

func (s *Subject) Publish(status string) {
	for _, ch := range s.subs {
		ch <- status // fan the event out to every subscriber
	}
}

// owner := subject.Subscribe(); go func() { fmt.Println(<-owner) }()`,
          caption: "Subscribe hands back a channel; Publish sends the status on each. Buffered (cap 1) so a slow reader doesn't block Publish." },
        { type: "quiz",
          q: "What does the Subject know about its observers in the channel-based design?",
          choices: [
            "Only that each is a channel it can send on — it stays decoupled from who reads the other end",
            "The concrete type and method names of every subscriber",
            "Exactly one subscriber at a time",
            "Nothing; subscribers must poll the subject instead",
          ],
          answer: 0,
          explain: "The subject holds `[]chan string` and only ever sends on them. Who receives, and what they do with the value, is entirely the subscriber's business — maximal decoupling, the Go way.",
          nudge: "What is the element type of the subs slice, and what can you do with it besides send?" },
        { type: "exercise", title: "Register a subscriber channel",
          prompt: [
            "Complete `Subscribe`: make a buffered `chan string` (capacity 1), append it to `s.subs`, and return it.",
          ],
          starter: String.raw`type Subject struct {
	subs []chan string
}

func (s *Subject) Subscribe() chan string {
	// your code here
}`,
          solution: String.raw`type Subject struct {
	subs []chan string
}

func (s *Subject) Subscribe() chan string {
	ch := make(chan string, 1)
	s.subs = append(s.subs, ch)
	return ch
}`,
          checks: [
            { re: /func\(s\*Subject\)Subscribe\(\)chan string\{/, hint: "Pointer receiver so the append sticks: `func (s *Subject) Subscribe() chan string {`." },
            { re: /ch:=make\(chan string,1\)/, hint: "Make a buffered channel: `ch := make(chan string, 1)`." },
            { re: /s\.subs=append\(s\.subs,ch\)/, hint: "Register it: `s.subs = append(s.subs, ch)`." },
            { re: /return ch/, hint: "Hand the channel to the caller: `return ch`." },
          ],
          mustNot: [
            { re: /func\(s Subject\)Subscribe/, hint: "Use a *pointer* receiver `(s *Subject)` — a value receiver would append to a copy and lose the subscription." },
          ],
          success: "Each `Subscribe` grows the subject's slice and returns a private channel — `Publish` just ranges and sends." },
      ],
    },
    // ─────────────────────────── ADAPTER ───────────────────────────
    {
      id: "adapter",
      title: "Adapter",
      steps: [
        { type: "text", md: [
          "## Make a foreign type fit the interface you expect",
          "**Adapter** wraps a type with the *wrong* interface so it satisfies the one your code uses. PawWalk sends through a `Notifier` with `Send(msg string) error`. But the legacy mailer you must reuse only offers `Deliver(text string)` — different name, no error return. You can't edit it (it's a vendor package), and you don't want to rewrite every caller.",
          "So you wrap it. A small struct embeds or holds the legacy value and exposes a `Send` method that translates the call. Thanks to Go's implicit interfaces, the moment your adapter has a `Send(string) error` method, it *is* a `Notifier` — no declaration required.",
        ] },
        { type: "code", title: "internal/notify/adapter.go",
          source: String.raw`package notify

// LegacyMailer is a vendor type we can't change:
type LegacyMailer struct{}
func (LegacyMailer) Deliver(text string) {}

// MailerAdapter makes it satisfy Notifier (Send(string) error).
type MailerAdapter struct {
	legacy LegacyMailer
}

func (a MailerAdapter) Send(msg string) error {
	a.legacy.Deliver(msg) // translate Send -> Deliver
	return nil
}

// var n Notifier = MailerAdapter{}  // now it fits!`,
          caption: "The adapter holds the foreign value and forwards, mapping the Notifier method onto the legacy one." },
        { type: "quiz",
          q: "What makes the adapter usable anywhere a `Notifier` is expected?",
          choices: [
            "It has a Send(string) error method, so Go's implicit interfaces treat it as a Notifier automatically",
            "It explicitly declares `implements Notifier` at the top",
            "It edits the LegacyMailer to add a Send method",
            "It copies the Notifier interface into a new file",
          ],
          answer: 0,
          explain: "Go interfaces are satisfied structurally: any type with the right method set implements the interface, no `implements` keyword. The adapter's job is just to supply that method by delegating to the foreign call.",
          nudge: "What did the adapter add that LegacyMailer was missing — and did it announce it?" },
        { type: "exercise", title: "Adapt Deliver to Send",
          prompt: [
            "Define `MailerAdapter` holding a `legacy LegacyMailer`.",
            "Give it `Send(msg string) error` that calls `a.legacy.Deliver(msg)` and returns `nil`.",
          ],
          starter: String.raw`type MailerAdapter struct {
	// your code here
}

func (a MailerAdapter) Send(msg string) error {
	// your code here
}`,
          solution: String.raw`type MailerAdapter struct {
	legacy LegacyMailer
}

func (a MailerAdapter) Send(msg string) error {
	a.legacy.Deliver(msg)
	return nil
}`,
          checks: [
            { re: /type MailerAdapter struct\{/, hint: "Wrap the foreign value: `type MailerAdapter struct {` with a `legacy LegacyMailer` field." },
            { re: /func\(a MailerAdapter\)Send\(msg string\)error\{/, hint: "Supply the interface method: `func (a MailerAdapter) Send(msg string) error {`." },
            { re: /a\.legacy\.Deliver\(msg\)/, hint: "Translate the call: `a.legacy.Deliver(msg)`." },
            { re: /return nil/, hint: "The legacy Deliver returns nothing, so report success: `return nil`." },
          ],
          mustNot: [
            { re: /func\(a MailerAdapter\)Deliver/, hint: "The adapter exposes `Send` (the interface method); it delegates to Deliver, it doesn't redefine it." },
          ],
          success: "Your adapter now speaks `Notifier` and quietly forwards to the legacy mailer — old code reused, no vendor edits." },
      ],
    },
    // ─────────────────────────── COMPOSITION OVER INHERITANCE ───────────────────────────
    {
      id: "composition",
      title: "Composition over Inheritance",
      steps: [
        { type: "text", md: [
          "## Go deleted inheritance on purpose",
          "The closing lesson, and the one that reframes all the others. Go has **no classes and no inheritance** — no `extends`, no base class, no `super`. That sounds like a missing feature; it's a deliberate design choice. Half the Gang-of-Four catalog exists to work *around* the rigidity of inheritance hierarchies. Remove inheritance and many of those patterns simply evaporate.",
          "Go replaces inheritance with two tools: **struct embedding** (composition) and **small interfaces**. You've used both all course. This lesson names them.",
        ] },
        { type: "text", md: [
          "## Embedding: has-a that reads like is-a",
          "Embed a type by writing it with no field name, and its methods are **promoted** to the outer type — callers use them as if they were the outer's own. It's composition (a `LoggingStore` *has a* store) that reads with the convenience of inheritance, but without the fragile base-class coupling.",
          "```type LoggingStore struct { *SQLStore }```",
          "`LoggingStore` gets every `*SQLStore` method for free, and you override just the ones you want by defining a method with the same name on the outer struct. That's Template Method and Decorator, achieved with a struct field.",
        ] },
        { type: "text", md: [
          "## Accept interfaces, return structs",
          "The most quoted Go maxim, and the through-line of this module. **Return a concrete struct** from your constructors so callers get the full, discoverable type. **Accept interfaces** in your functions so callers can pass any implementation — real, adapter, or test fake.",
          "> Keep interfaces tiny — one or two methods (`io.Reader`, `io.Writer`, `Notifier`). Small interfaces are easy to implement, easy to fake in tests, and compose without ceremony. A one-method interface plus a function value covers Strategy, Factory, and Observer between them.",
        ] },
        { type: "code", title: "internal/store/logging.go",
          source: String.raw`package store

// SQLStore is the concrete implementation (returned by its constructor).
type SQLStore struct{}
func (s *SQLStore) Save(id string) error { return nil }

// LoggingStore embeds *SQLStore: Save is promoted, no boilerplate.
type LoggingStore struct {
	*SQLStore
}

// Callers accept the interface, not either concrete type:
type Store interface {
	Save(id string) error
}`,
          caption: "Embedding promotes Save onto LoggingStore; the Store interface lets callers take any of them." },
        { type: "quiz",
          q: "Why do so many Gang-of-Four patterns feel unnecessary in idiomatic Go?",
          choices: [
            "Go replaces inheritance with struct embedding and small implicit interfaces, so composition covers what those patterns worked around",
            "Go is too slow to run design patterns",
            "Go forbids using more than one struct per file",
            "Go automatically generates every pattern at compile time",
          ],
          answer: 0,
          explain: "Much of the GoF catalog exists to soften rigid inheritance trees. Go has no inheritance — you compose with embedding and satisfy tiny interfaces structurally — so patterns like Template Method, Decorator, and Bridge collapse into ordinary struct fields and function values. That's the deep answer a Go interviewer wants.",
          nudge: "What language feature do Decorator, Bridge, and Template Method all exist to work around?" },
      ],
    },
  ],
});
