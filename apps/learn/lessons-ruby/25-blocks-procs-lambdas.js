window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "blocks-procs-lambdas",
  title: "Blocks, Procs & Lambdas",
  emoji: "🧩",
  lang: "ruby",
  lessons: [
    {
      id: "methods-that-take-blocks",
      title: "Methods That Take Blocks",
      steps: [
        {
          type: "text",
          md: [
            "## Blocks are Ruby's superpower — and you've only used them",
            "You've *passed* blocks to `each`, `map`, and `select` since module 02. Now you'll *write methods that accept them*. This is the skill that makes Ruby feel like Ruby: methods that hand control back to their caller mid-execution. `File.open(path) { |f| ... }`, `transaction { ... }`, `respond_to { |f| ... }` — every one is a method yielding to a block you supply.",
            "> In an interview, say: \"A block is a chunk of caller-supplied code a method can run via `yield`. It's how Ruby does the template-method pattern without ceremony — the method owns the *when*, the block owns the *what*.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## `yield` runs the block; `block_given?` checks for one",
            "Any method can call `yield` to run the block passed to it — no declaration needed. If you `yield` when no block was passed, you get a `LocalJumpError`, so guard optional blocks with `block_given?`:",
            "```\ndef each_walker(names)\n  return names.to_enum unless block_given?   # graceful when called without a block\n  names.each { |n| yield n }\nend\n```",
            "`yield n` passes `n` into the block as its parameter; whatever the block returns comes back as the value of the `yield` expression. This is the entire contract — `yield` is a method calling *back into* its caller.",
          ],
        },
        {
          type: "code",
          title: "playground/mini_each.rb",
          source: String.raw`class Roster
  def initialize(*names) = @names = names

  def each
    return to_enum(:each) unless block_given?   # no block? return an Enumerator
    @names.each { |n| yield n }
    self                                         # each returns the receiver, like Array#each
  end
end

r = Roster.new("Priya", "Marco", "Ana")
r.each { |name| puts "Walking with #{name}" }
lengths = r.each.map { |n| n.length }           # blockless each => Enumerator => chainable
p lengths                                        # [5, 5, 3]`,
          caption: "This `each` is the real thing: it `yield`s each name to the block, returns `self` when given one, and returns an `Enumerator` when not — which is why `r.each.map { ... }` works. You'll formalize that Enumerator trick in module 26.",
        },
        {
          type: "text",
          md: [
            "## Why not just pass an array of results?",
            "Because `yield` lets the *caller* decide what happens to each element — print it, transform it, sum it, short-circuit it — without your method knowing or caring. That inversion of control is why `Enumerable` can give you ~50 methods from a single `each`: they all drive your `each` and supply their own block. Write `each` once, get the ecosystem.",
          ],
        },
        {
          type: "quiz",
          q: "You write `def run; yield 10; end` and call it as `run` with no block attached. What happens?",
          choices: [
            "`LocalJumpError` — `yield` with no block passed raises at runtime",
            "It returns `10` silently",
            "It returns `nil` because there's nothing to yield to",
            "`NoMethodError` — `yield` isn't a real keyword",
          ],
          answer: 0,
          explain: "`yield` runs *the block passed to the current method*. If none was passed, there's nothing to run and Ruby raises `LocalJumpError`. That's exactly why you guard optional blocks with `block_given?` — it lets a method behave differently (e.g. return an Enumerator) when called without a block, which is how the built-in iterators work.",
          nudge: "`yield` needs a block to jump to. What if the caller didn't supply one?",
        },
        {
          type: "exercise",
          title: "Write a method that yields",
          prompt: [
            "Write `each_price(prices)` that yields **each** element of the `prices` array to the block, one at a time, using `yield`. (Loop with `prices.each` and `yield` the element inside.)",
          ],
          starter: String.raw`def each_price(prices)
  # your code here
end

each_price([2400, 4800]) { |c| puts c }`,
          solution: String.raw`def each_price(prices)
  prices.each { |c| yield c }
end

each_price([2400, 4800]) { |c| puts c }`,
          checks: [
            { re: /def each_price\(prices\)/, hint: "Keep the signature `def each_price(prices)`." },
            { re: /prices\.each/, hint: "Iterate the array with `prices.each { ... }`." },
            { re: /yield c/, hint: "Hand each element to the caller's block with `yield c`." },
          ],
          mustNot: [
            { re: /prices\.each do\|c\|puts/, hint: "Don't `puts` inside — the whole point is to `yield` to the caller's block so *they* decide what to do." },
          ],
          success: "That's a method that takes a block. `yield c` hands control back to the caller for each element — the inversion of control that powers every Ruby iterator.",
        },
      ],
    },
    {
      id: "procs-and-closures",
      title: "Procs & Closures",
      steps: [
        {
          type: "text",
          md: [
            "## A Proc is a block you can store and pass around",
            "A block isn't an object — you can't put it in a variable or return it. A **Proc** is: it's a block turned into a first-class object you can store, pass, and `call` later. This is Ruby's version of a function value / closure, and it's the substrate lambdas are built on.",
            "```\ngreet = Proc.new { |name| \"Hi #{name}\" }\ngreet.call(\"Priya\")   # \"Hi Priya\"\ngreet.(\"Priya\")       # same thing, .() sugar\ngreet[\"Priya\"]        # same thing, [] sugar\n```",
            "> In an interview, say: \"A Proc is a callable object that captures the block *and* the surrounding local variables — a closure. Blocks are the lightweight syntax; procs are blocks promoted to objects.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## Closures: a proc remembers where it was born",
            "The defining feature: a proc **closes over** the local variables in scope when it was created — not their values at that instant, but the live variables themselves. It can read and even change them later, long after the enclosing method has returned. This is why blocks can see outer locals (from the last module's scope-gate discussion — blocks aren't scope gates).",
          ],
        },
        {
          type: "code",
          title: "playground/closure.rb",
          source: String.raw`def make_counter
  count = 0                       # a local variable
  increment = -> { count += 1 }   # the proc closes over 'count'
  report    = -> { count }
  [increment, report]
end

inc, report = make_counter
inc.call
inc.call
puts report.call   # 2  — 'count' lived on inside the closures`,
          caption: "`make_counter` returned, but `count` didn't die — both procs captured the *same* live variable, so incrementing through one is visible through the other. That's a closure: state kept alive by the functions that reference it.",
        },
        {
          type: "text",
          md: [
            "## The `&` operator: block ⇄ proc",
            "`&` is the bridge between the two worlds. In a method signature, `&blk` **captures** the passed block as a Proc object you can store or forward. At a call site, `&some_proc` **expands** a proc back into a block:",
            "```\ndef wrap(&blk)      # capture the block as a Proc\n  blk.call(\"before\")\n  blk.call(\"after\")\nend\n\ndoubler = ->(x) { x * 2 }\n[1, 2, 3].map(&doubler)   # expand a proc into map's block => [2, 4, 6]\n```",
            "That second form is the same `&` you've been writing as `map(&:name)` — `&` on a Symbol makes a proc, then expands it. You'll see exactly why next lesson.",
          ],
        },
        {
          type: "quiz",
          q: "A method returns two procs that both reference a local variable `total` created inside it. After the method returns, one proc modifies `total`. What does the other proc see?",
          choices: [
            "The change — both procs closed over the same live variable, which outlives the method",
            "The original value — each proc got its own frozen copy at creation time",
            "`nil` — the local variable is destroyed when the method returns",
            "A `FrozenError` — you can't modify captured variables",
          ],
          answer: 0,
          explain: "A closure captures the *variable*, not a snapshot of its value. Both procs reference the same `total`, and Ruby keeps it alive as long as any closure references it. A change through one proc is visible through the other — that shared, persistent state is the whole point of closures (and the basis of the counter pattern).",
          nudge: "Does a closure copy the value, or keep a reference to the living variable?",
        },
        {
          type: "exercise",
          title: "Capture a block as a proc",
          prompt: [
            "Write `build_greeter` that **captures** its block as a proc using `&blk` in the signature, and returns that proc so the caller can `call` it later.",
          ],
          starter: String.raw`def build_greeter( )
  # your code here
end

hi = build_greeter { |name| "Hi #{name}" }
puts hi.call("Priya")`,
          solution: String.raw`def build_greeter(&blk)
  blk
end

hi = build_greeter { |name| "Hi #{name}" }
puts hi.call("Priya")`,
          checks: [
            { re: /def build_greeter\(&blk\)/, hint: "Capture the block in the signature with `&blk`: `def build_greeter(&blk)`." },
            { re: /blk/, hint: "Return the captured proc — the last expression should be `blk`." },
          ],
          mustNot: [
            { re: /yield/, hint: "Don't `yield` here — the goal is to *capture and return* the block as a proc object, so use `&blk`." },
            { re: /Proc\.new/, hint: "You don't need `Proc.new` — `&blk` already turns the passed block into a Proc." },
          ],
          success: "`&blk` captures the passed block as a Proc object you can return, store, and `call` later — the move that lets blocks escape the method they were passed to.",
        },
      ],
    },
    {
      id: "lambdas-vs-procs",
      title: "Lambdas vs Procs",
      steps: [
        {
          type: "text",
          md: [
            "## A lambda IS a proc — with two strict differences",
            "`->(x) { x * 2 }` creates a lambda, which is a `Proc` object (`lambda.class == Proc`, `lambda.lambda? == true`). But it behaves more strictly than a plain proc in exactly two ways, and those two differences are a top-5 Ruby interview question.",
            "> In an interview, say: \"A lambda is a proc with method-like semantics: it checks arity strictly, and `return` inside it returns from the lambda, not from the enclosing method. Plain procs are lenient on arity and their `return` blows through the enclosing method.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## Difference 1: arity (argument count)",
            "A **lambda** enforces its argument count like a method — wrong number of args raises `ArgumentError`. A **proc** is lenient: extra args are dropped, missing ones become `nil`.",
            "```\nlam  = ->(a, b) { [a, b] }\nlam.call(1)          # ArgumentError: wrong number of arguments\n\npr = proc { |a, b| [a, b] }\npr.call(1)           # [1, nil]  — no complaint\n```",
          ],
        },
        {
          type: "text",
          md: [
            "## Difference 2: what `return` does (the bug that bites everyone)",
            "This is the dangerous one. `return` inside a **lambda** returns from the *lambda*. `return` inside a plain **proc** returns from the *method that created the proc* — which, if that method already finished, raises `LocalJumpError`, and if it hasn't, silently short-circuits it.",
          ],
        },
        {
          type: "code",
          title: "playground/return_semantics.rb",
          source: String.raw`def with_lambda
  checker = -> { return 10 }
  result = checker.call     # return exits the LAMBDA
  "lambda returned #{result}, method continues"
end

def with_proc
  checker = proc { return 10 }
  checker.call              # return exits with_proc ITSELF
  "this line never runs"
end

puts with_lambda   # lambda returned 10, method continues
puts with_proc     # 10  — the proc's return jumped out of the whole method`,
          caption: "Same body, opposite control flow. The lambda's `return` is local and well-behaved; the proc's `return` hijacks the enclosing method. This is why you almost always want a lambda when you store a callable.",
        },
        {
          type: "text",
          md: [
            "## The Rails tie-in: scopes and conditions are lambdas on purpose",
            "In your `Booking` model, `scope :upcoming, -> { where(...) }` and callbacks like `after_create_commit -> { ... }` use the `->` (lambda) form deliberately. Two reasons: (1) lambda arity is predictable, and (2) a stray `return` inside won't tear out of the surrounding Rails machinery — it stays contained. A plain proc there could `return` out of Rails' internals and cause baffling bugs.",
            "> Red flag: using `Proc.new`/`proc` for a Rails scope or validation condition. Say: \"scopes and `if:`/`unless:` conditions should be lambdas — strict arity plus a contained `return` keeps them safe inside the framework's call stack.\"",
          ],
        },
        {
          type: "quiz",
          q: "Inside a method, you create `p = proc { return 42 }` and then call `p.call` before the method's last line. What happens?",
          choices: [
            "The method returns 42 immediately — a proc's `return` exits the enclosing method",
            "`p.call` returns 42 and the method continues to its last line",
            "`ArgumentError` because the proc takes no arguments",
            "`nil`, because `return` inside a proc is a no-op",
          ],
          answer: 0,
          explain: "A plain proc's `return` returns from the *method that defined the proc*, not from the proc. So `p.call` short-circuits the whole method, which returns 42 and never reaches its last line. A lambda would behave like a method call: `return` would exit only the lambda, and the method would continue. This difference is the #1 reason to prefer lambdas for stored callables.",
          nudge: "Proc `return` and lambda `return` target different frames. Which one exits the *enclosing method*?",
        },
        {
          type: "exercise",
          title: "Write a strict lambda",
          prompt: [
            "Create a lambda named `surge` using the `->` arrow syntax that takes one argument `cents` and returns `cents * 2`. Then call it with `surge.call(2400)`.",
          ],
          starter: String.raw`# your code here
puts surge.call(2400)`,
          solution: String.raw`surge = ->(cents) { cents * 2 }
puts surge.call(2400)`,
          checks: [
            { re: /surge=->\(cents\)/, hint: "Use the arrow literal: `surge = ->(cents) { ... }`." },
            { re: /cents\*2/, hint: "Double the argument: `cents * 2`." },
          ],
          mustNot: [
            { re: /surge=proc/, hint: "Use a lambda (`->`), not `proc` — this lesson is about the strict, method-like form." },
            { re: /def surge/, hint: "Make it a lambda stored in a variable, not a method: `surge = ->(cents) { ... }`." },
          ],
          success: "`->(cents) { cents * 2 }` is a lambda — strict arity, contained `return`. This is the exact form Rails scopes and conditions use, and the one to reach for whenever you store a callable.",
        },
      ],
    },
    {
      id: "symbol-to-proc-and-methods",
      title: "Symbol#to_proc & Method Objects",
      steps: [
        {
          type: "text",
          md: [
            "## Why `map(&:name)` works — finally explained",
            "You've written `walkers.map(&:name)` for modules. Here's the machinery, and it's a favorite interview probe. `&` expects a proc; if you give it something else, Ruby calls `to_proc` on it first. `Symbol#to_proc` turns `:name` into the proc `->(x) { x.name }`. So `&:name` becomes \"call `.name` on each element.\"",
            "> In an interview, say: \"`&:name` is `&` coercing the symbol via `Symbol#to_proc` into `->(x){ x.name }`, then expanding that proc into the block. It's shorthand for `{ |x| x.name }` — great for single no-arg method calls, useless the moment you need arguments.\"",
          ],
        },
        {
          type: "code",
          title: "playground/to_proc.rb",
          source: String.raw`names = ["priya", "marco", "ana"]

# these three are identical:
p names.map { |n| n.upcase }
p names.map(&:upcase)
p names.map(&:upcase.to_proc)   # what &:upcase expands to under the hood

# the limit: &:sym can't pass arguments
p names.map { |n| n.ljust(6, ".") }   # must use a full block here`,
          caption: "`&:upcase` is pure sugar for `{ |n| n.upcase }`. It only works for a single argument-less method call on each element — anything needing arguments (like `ljust(6, \".\")`) needs a real block.",
        },
        {
          type: "text",
          md: [
            "## Method objects: turn an existing method into a callable",
            "`object.method(:name)` grabs an existing method as a **Method object** — a callable bound to that receiver. This lets you pass a named method wherever a proc/block is expected, instead of re-wrapping it in a lambda:",
            "```\ndef shout(s) = s.upcase + \"!\"\n\nm = method(:shout)     # a Method object\nm.call(\"hi\")           # \"HI!\"\n[\"a\", \"b\"].map(&m)     # [\"A!\", \"B!\"]  — & converts Method to a block too\n```",
            "`Method#to_proc` is why `&m` works. And a Method object knows things a proc doesn't: `m.arity`, `m.owner`, `m.source_location` — the last one being a real debugging superpower you'll use in module 27.",
          ],
        },
        {
          type: "quiz",
          q: "You want to uppercase and then truncate each name: `n.upcase[0, 3]`. Can you express that with `&:some_symbol`?",
          choices: [
            "No — `&:sym` only calls a single argument-less method; chaining or arguments needs a full block",
            "Yes — `&:upcase[0,3]` chains automatically",
            "Yes, but only if you freeze the symbol first",
            "No — `&` never works with strings, only integers",
          ],
          answer: 0,
          explain: "`&:upcase` expands to `{ |n| n.upcase }` — one method, no arguments, no chaining. The moment you need arguments (`[0, 3]`) or a second call, `Symbol#to_proc` can't express it and you write a normal block: `{ |n| n.upcase[0, 3] }`. Knowing this boundary is the point — `&:sym` is a targeted shortcut, not a general tool.",
          nudge: "`&:sym` becomes `{ |x| x.sym }` — exactly one no-arg call. Does your case fit that shape?",
        },
        {
          type: "exercise",
          title: "Use Symbol#to_proc",
          prompt: [
            "Given an array of walker name strings, use the `&:` shorthand to uppercase them all. Fill in the `map` call so `roster` becomes `[\"PRIYA\", \"MARCO\"]`.",
          ],
          starter: String.raw`names = ["priya", "marco"]
roster = names.map( )   # use &: here
p roster`,
          solution: String.raw`names = ["priya", "marco"]
roster = names.map(&:upcase)
p roster`,
          checks: [
            { re: /map\(&:upcase\)/, hint: "Pass the symbol as a block-proc: `map(&:upcase)`." },
          ],
          mustNot: [
            { re: /map\{/, hint: "Use the `&:upcase` shorthand, not a full `{ |n| ... }` block — that's the technique this lesson is drilling." },
          ],
          success: "`&:upcase` = `&` coercing `:upcase` through `Symbol#to_proc` into `{ |n| n.upcase }`. Now you know exactly what that idiom compiles to.",
        },
      ],
    },
    {
      id: "composition-functional",
      title: "Composition & Functional Style",
      steps: [
        {
          type: "text",
          md: [
            "## Compose small functions into pipelines",
            "Ruby leans object-oriented but has sharp functional tools. Two lambdas (or method objects) compose with `>>` and `<<`: `f >> g` makes a new callable that runs `f` then feeds its result to `g` (left-to-right); `f << g` runs `g` then `f` (right-to-left). Small, named, testable steps assembled into a pipeline beats one long method.",
            "> In an interview, say: \"`>>` composes callables left-to-right into a pipeline. I use it to build a price calculation out of named, individually-testable steps instead of one procedure — each step is pure and the composition documents the flow.\"",
          ],
        },
        {
          type: "code",
          title: "playground/compose.rb",
          source: String.raw`base       = ->(mins)  { mins * 80 }        # 80 cents/min
surcharge  = ->(cents) { cents + 500 }      # flat booking fee
to_dollars = ->(cents) { cents / 100.0 }

price = base >> surcharge >> to_dollars     # left-to-right pipeline
p price.call(30)   # ((30*80)+500)/100.0 => 29.0

# >> reads in data-flow order; << is the reverse
same = to_dollars << surcharge << base
p same.call(30)    # 29.0`,
          caption: "`base >> surcharge >> to_dollars` builds one callable that threads a value through all three, in reading order. Each lambda stays tiny and testable on its own; the composition is the spec.",
        },
        {
          type: "text",
          md: [
            "## `curry` — fix arguments one at a time",
            "`curry` turns a multi-arg callable into one you can feed arguments to gradually, getting back a new function until it's fully applied. It's how you make specialized functions from general ones:",
            "```\nrate = ->(per_min, mins) { per_min * mins }.curry\npremium = rate[100]        # per_min fixed at 100; premium is a 1-arg fn\npremium[30]                # 3000\n```",
          ],
        },
        {
          type: "text",
          md: [
            "## `tap` and `then` (a.k.a. `yield_self`)",
            "Two Kernel methods that keep pipelines flowing:",
            "- **`tap`** runs a block on the object and returns *the object* — for side effects (logging, debugging) mid-chain: `booking.tap { |b| logger.info b.id }.save`.\n- **`then`** runs a block and returns *the block's result* — for wrapping a value in a transformation inline: `price.then { |c| Money.new(c) }`.",
            "> In an interview, say: \"`tap` returns the receiver — use it for side effects without breaking a chain. `then` returns the block's value — use it to feed a value into an expression. Reaching for the right one keeps a pipeline readable instead of introducing a temp variable.\"",
          ],
        },
        {
          type: "quiz",
          q: "`f = ->(x){ x + 1 }` and `g = ->(x){ x * 2 }`. What does `(f >> g).call(3)` return?",
          choices: [
            "8 — `>>` runs `f` first (3+1=4), then `g` (4*2=8)",
            "7 — `>>` runs `g` first (3*2=6), then `f` (6+1=7)",
            "9 — it adds both results",
            "It raises because lambdas can't be composed",
          ],
          answer: 0,
          explain: "`f >> g` means \"f then g\", left-to-right: `f(3)` = 4, then `g(4)` = 8. (`f << g` would be the reverse — g then f — giving 7.) The `>>` direction matches reading order, which is why it's the more intuitive default for data-flow pipelines.",
          nudge: "`>>` is 'first this, then that' in reading order. Which lambda runs first?",
        },
        {
          type: "exercise",
          title: "Build a price pipeline",
          prompt: [
            "Compose two lambdas into a pipeline with `>>`. Given `base = ->(m){ m * 80 }` and `fee = ->(c){ c + 500 }`, create `price = base >> fee` so `price.call(30)` returns `2900`.",
          ],
          starter: String.raw`base = ->(m) { m * 80 }
fee  = ->(c) { c + 500 }
# your code here
p price.call(30)`,
          solution: String.raw`base = ->(m) { m * 80 }
fee  = ->(c) { c + 500 }
price = base >> fee
p price.call(30)`,
          checks: [
            { re: /price=base>>fee/, hint: "Compose left-to-right with `>>`: `price = base >> fee`." },
          ],
          mustNot: [
            { re: /price=fee>>base/, hint: "That composes in the wrong order — `base` must run first. Use `base >> fee`." },
            { re: /price=->/, hint: "Don't rewrite the math in a new lambda — *compose* the two given ones with `>>`." },
          ],
          success: "`base >> fee` threads minutes → base cents → plus fee, in reading order. Composition turns tiny pure functions into a pipeline you can test piece by piece.",
        },
      ],
    },
    {
      id: "threads-fibers-ractors",
      title: "Threads, Fibers & Ractors (Survey)",
      steps: [
        {
          type: "text",
          md: [
            "## The GVL: the one fact that explains Ruby concurrency",
            "Ruby (MRI/CRuby) has a **Global VM Lock**: only one thread executes Ruby code at a time. This sounds fatal but isn't, because the GVL is *released during blocking I/O* — network calls, DB queries, file reads. So threads give you real concurrency for **I/O-bound** work (the usual web-app case) but **not** parallelism for **CPU-bound** work.",
            "> In an interview, say: \"CRuby's GVL means threads don't run Ruby code in parallel, but the lock is released on I/O — so threads win for I/O-bound work like DB and HTTP calls, which is most web work. For CPU-bound parallelism you need multiple processes or Ractors.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## Threads and the mutex",
            "A `Thread` runs a block concurrently; `join` waits for it. Because threads share memory, any shared mutable state needs a `Mutex` to prevent races:",
            "```\nmutex = Mutex.new\ncount = 0\nthreads = 10.times.map do\n  Thread.new { mutex.synchronize { count += 1 } }\nend\nthreads.each(&:join)\ncount   # reliably 10\n```",
            "This is why **Puma** (multi-threaded web server) and **Sidekiq** (multi-threaded job processor) work well for a Rails app: each request/job is mostly waiting on the database, and the GVL releases during that wait so other threads run. Their throughput comes from overlapping I/O, not parallel CPU.",
          ],
        },
        {
          type: "text",
          md: [
            "## Fibers: cooperative, manual pausing",
            "A `Fiber` is a block whose execution you can **pause and resume** by hand with `Fiber.yield` and `fiber.resume`. Unlike threads, fibers never run concurrently — you drive them explicitly. They're lightweight and are the engine behind lazy enumerators (module 26) and async I/O libraries:",
            "```\nf = Fiber.new do\n  Fiber.yield 1\n  Fiber.yield 2\n  3\nend\nf.resume   # 1\nf.resume   # 2\nf.resume   # 3\n```",
          ],
        },
        {
          type: "text",
          md: [
            "## Ractors: actual parallelism (still experimental)",
            "A **Ractor** (Ruby Actor) is the answer to the GVL: each Ractor has its own lock, so Ractors run Ruby code **truly in parallel** across cores. The price is isolation — Ractors can't freely share mutable objects; they pass messages, and only shareable (frozen/immutable) objects cross the boundary. As of Ruby 3.4 they're still **experimental** (you'll see a warning) and rare in production, but they're the direction Ruby parallelism is heading.",
            "> In an interview, say: \"Ractors give real parallelism by giving each its own GVL, at the cost of enforced isolation — you message-pass immutable data instead of sharing memory. They're experimental as of 3.x, so for CPU-bound work today I'd still reach for multiple processes.\"",
          ],
        },
        {
          type: "quiz",
          q: "Your Rails app spends most of each request waiting on Postgres. A colleague says \"threads are pointless in Ruby because of the GVL.\" What's the accurate correction?",
          choices: [
            "The GVL is released during I/O like DB queries, so threads DO give real concurrency for I/O-bound work — which this is",
            "They're right; you must switch to Ractors for any concurrency at all",
            "The GVL only affects Rails, not plain Ruby, so it's fine",
            "Threads help only if you disable the GVL with a flag",
          ],
          answer: 0,
          explain: "The GVL blocks parallel execution of *Ruby code*, but it's released during blocking I/O. A request that's mostly waiting on Postgres spends most of its time with the GVL released, so other threads run meanwhile — real, useful concurrency. That's precisely why Puma and Sidekiq are threaded. The GVL only bites CPU-bound work, where you'd reach for processes or Ractors.",
          nudge: "The GVL is released during one specific kind of work. Is waiting on the database that kind?",
        },
        {
          type: "exercise",
          title: "Guard shared state with a Mutex",
          prompt: [
            "Complete the thread body so the increment is protected: wrap `count += 1` in `mutex.synchronize { ... }` so ten threads reliably produce `10`.",
          ],
          starter: String.raw`mutex = Mutex.new
count = 0
threads = 10.times.map do
  Thread.new do
    # your code here
  end
end
threads.each(&:join)
p count`,
          solution: String.raw`mutex = Mutex.new
count = 0
threads = 10.times.map do
  Thread.new do
    mutex.synchronize { count += 1 }
  end
end
threads.each(&:join)
p count`,
          checks: [
            { re: /mutex\.synchronize/, hint: "Serialize access with `mutex.synchronize { ... }`." },
            { re: /count\+=1/, hint: "Increment inside the synchronized block: `count += 1`." },
          ],
          mustNot: [
            { re: /synchronize.*\n?.*count.*\n?.*end.*count\+=1/s, hint: "The `count += 1` must be INSIDE `mutex.synchronize { ... }`, not outside it." },
          ],
          success: "`mutex.synchronize` lets only one thread touch `count` at a time, eliminating the race. Shared mutable state across threads always needs this — the lesson that keeps Puma and Sidekiq code correct.",
        },
      ],
    },
  ],
});
