window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "ruby-basics",
  title: "Ruby Basics",
  emoji: "💎",
  lang: "ruby",
  lessons: [
    {
      id: "variables-objects",
      title: "Variables & Everything is an Object",
      steps: [
        {
          type: "text",
          md: [
            "## No `let`, no `var`, no `const`",
            "Swift makes you pick: `let` for a constant, `var` for something that changes. Python drops the keyword but keeps the assignment. Ruby goes even further — there's no keyword at all. You just write a name, `=`, and a value:",
            "```\nwalker_name = \"Priya\"\nwalk_price_cents = 2400\n```",
            "That's a **local variable**, full stop. Ruby has no `let`/`const` distinction baked into the syntax — every plain assignment can be reassigned later. (You'll meet `freeze` in a later module for the rare case you truly want to lock a value down.)",
          ],
        },
        {
          type: "text",
          md: [
            "## snake_case, always",
            "Ruby's naming convention is `snake_case` for variables and methods — same as Python, unlike Swift/JS's `camelCase`. You'll write `walker_name`, never `walkerName`. This isn't just style: Ruby method names like `attr_accessor` and `has_many` are snake_case too, so fighting the convention makes your code look foreign next to everyone else's.",
            "**CONSTANTS** are different: a name starting with a capital letter (by convention, `ALL_CAPS` with underscores) is a constant. Ruby won't stop you from reassigning it, but it prints a warning:",
            "```\nMAX_WALK_MINUTES = 90\nMAX_WALK_MINUTES = 120   # warning: already initialized constant\n```",
          ],
        },
        {
          type: "text",
          md: [
            "## Everything is an object — no primitives",
            "This is the single biggest mental shift coming from Swift/JS/Python. In those languages, a number is a lightweight primitive and a class instance is a heavier \"object\" — two different worlds. **In Ruby, there is only one world.** `5` is an object. `\"hi\"` is an object. Even `nil` is an object. Every single value you touch has a class and can have methods called on it:",
            "```\n5.class          # Integer\n5.even?          # true\n\"hi\".length     # 2\n\"hi\".class       # String\nnil.class        # NilClass\n```",
            "Notice `5.even?` — a method call, with a `?`, directly on a number literal. There's no `Integer(5).isEven()` ceremony and no autoboxing to think about. It's objects all the way down.",
          ],
        },
        {
          type: "code",
          title: "playground/basics.rb",
          source: String.raw`walker_name = "Priya"
walk_price_cents = 2400
walker_rating = 4.8
is_available = true
backup_walker = nil

puts walker_name.class
puts walk_price_cents.class
puts walker_rating.class
puts is_available.class
puts backup_walker.class`,
          caption: "Run with `ruby playground/basics.rb` — prints `String`, `Integer`, `Float`, `TrueClass`, `NilClass`. Notice `true` gets its OWN class, `TrueClass` — even booleans are objects with exactly one instance each.",
        },
        {
          type: "text",
          md: [
            "## irb — your playground",
            "Ruby ships with `irb` (Interactive Ruby), a REPL you already have via mise. Open a terminal and type `irb` to get a `>` prompt where every line you type runs immediately and prints its result — perfect for poking at `.class` and `.length` while you build intuition, the same way you'd use Python's REPL or a Swift Playground.",
            "```\n$ irb\nirb(main):001> 5.class\n=> Integer\nirb(main):002> \"hi\".length\n=> 2\n```",
            "Keep an `irb` tab open for the rest of this course — when you're not sure what a method returns, just try it.",
          ],
        },
        {
          type: "quiz",
          q: "In Swift, `5` is a primitive `Int` value, and calling methods on it feels like special compiler magic. What IS `5` in Ruby?",
          choices: [
            "A full object — an instance of the `Integer` class, with real methods like `.even?`",
            "A primitive, same as Swift — Ruby just hides the boxing from you",
            "A special case that only responds to arithmetic operators, not methods",
            "Only an object if you wrap it as `Integer.new(5)` first",
          ],
          answer: 0,
          explain: "Ruby has no primitive/object split. `5` is an instance of `Integer` the moment it exists — `5.class`, `5.even?`, `5.times { ... }` all just work, no wrapping required.",
          nudge: "You just ran `5.class` in the code sample above. What did it print, and what does that tell you about what `5` actually is?",
        },
        {
          type: "exercise",
          title: "Everything is an object",
          prompt: [
            "Declare a local variable `dog_name` set to `\"Mochi\"`. Then declare `walk_minutes` set to `30`. Print `dog_name.class` and `walk_minutes.class` with `puts` — one `puts` call per line.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`dog_name = "Mochi"
walk_minutes = 30
puts dog_name.class
puts walk_minutes.class`,
          checks: [
            { re: /dog_name="Mochi"/, hint: "Assign the string directly, no keyword: `dog_name = \"Mochi\"`." },
            { re: /walk_minutes=30/, hint: "Assign the number directly: `walk_minutes = 30`." },
            { re: /puts dog_name\.class/, hint: "Call `.class` on the variable and hand it to `puts`: `puts dog_name.class`." },
            { re: /puts walk_minutes\.class/, hint: "Same pattern for the number: `puts walk_minutes.class`." },
          ],
          mustNot: [
            { re: /let |var |const /, hint: "No declaration keyword in Ruby — just `name = value`." },
          ],
          success: "You just proved it yourself: every value, even a plain integer, is an object you can ask questions of.",
        },
      ],
    },
    {
      id: "strings-interpolation",
      title: "Strings & Interpolation",
      steps: [
        {
          type: "text",
          md: [
            "## Single quotes vs. double quotes",
            "Ruby has two string literal forms, and unlike Python, they're **not** interchangeable. Single quotes (`'...'`) are literal — almost nothing inside them is special. Double quotes (`\"...\"`) turn on interpolation and escape sequences like `\\n`:",
            "```\nputs 'Hello #{name}'   # prints literally: Hello #{name}\nputs \"Hello \\n world\"  # prints an actual newline\n```",
            "Rule of thumb: reach for double quotes whenever you need interpolation or an escape sequence, single quotes for plain text. Both are `String` — this is about behavior, not type.",
          ],
        },
        {
          type: "text",
          md: [
            "## `#{}` — Ruby's interpolation syntax",
            "Every language you know solves this differently. Swift uses backslash-parens: `\"Hello \\(name)\"`. Python uses an f-string prefix: `f\"Hello {name}\"`. Ruby drops any prefix requirement and instead uses a `#` sigil with braces, **inside a double-quoted string only**:",
            "```\nname = \"Mochi\"\nputs \"Hello #{name}\"        # Hello Mochi\nputs \"Total: #{2 + 2}\"      # Total: 4 — any expression works, not just variables\n```",
            "No `f` prefix to remember and no backslash to type — just `#{...}` wherever you want a live expression dropped into the string. Forget the double quotes, though, and `#{name}` prints as literal text, same trap as Python's missing `f`.",
          ],
        },
        {
          type: "code",
          title: "playground/strings.rb",
          source: String.raw`walker_name = "  ana  "
puts walker_name.strip                 # "ana" — trims whitespace from both ends
puts walker_name.strip.upcase          # "ANA"
puts walker_name.include?("ana")       # true
puts "woof" * 3                        # "woofwoofwoof"
puts "Walker: #{walker_name.strip.capitalize}"`,
          caption: "`.strip`, `.upcase`, and `.include?` read like plain English. `*` on a string REPEATS it — that one surprises everybody coming from arithmetic-only languages.",
        },
        {
          type: "text",
          md: [
            "## One more thing: frozen string literals",
            "You'll sometimes see `# frozen_string_literal: true` as the very first line of a real Ruby file (including ones in `apps/pawwalk-api`) — it makes every string literal in that file immutable, which is faster and safer. You don't need to use it yet; just recognize it when you see it.",
          ],
        },
        {
          type: "quiz",
          q: "You write `name = \"Mochi\"` then `puts 'Hi #{name}'` (single quotes). What prints?",
          choices: [
            "The literal text `Hi #{name}` — single quotes don't interpolate",
            "`Hi Mochi` — Ruby interpolates in any string",
            "A crash: `NameError`",
            "`Hi ` followed by nothing",
          ],
          answer: 0,
          explain: "Interpolation with `#{}` only fires inside double-quoted strings. Single quotes are (almost) completely literal, so `#{name}` stays as four plain characters plus the braces.",
          nudge: "Which quote style did the lesson say turns on interpolation — single, or double?",
        },
        {
          type: "exercise",
          title: "Build a greeting",
          prompt: [
            "Declare `walker_name` set to `\"Priya\"`. Then use `puts` to print an interpolated greeting reading exactly `Hello, Priya!` — use double quotes and `#{}`.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`walker_name = "Priya"
puts "Hello, #{walker_name}!"`,
          checks: [
            { re: /walker_name="Priya"/, hint: "Assign the string first: `walker_name = \"Priya\"`." },
            { re: /puts"Hello,#\{walker_name\}!"/, hint: "Interpolate inside double quotes: `puts \"Hello, #{walker_name}!\"`." },
          ],
          mustNot: [
            { re: /puts'Hello,#\{walker_name\}!'/, hint: "Single quotes won't interpolate — switch to double quotes." },
          ],
          success: "That's `#{}` interpolation — no prefix, no backslash, just braces inside a double-quoted string.",
        },
      ],
    },
    {
      id: "symbols-nil",
      title: "Symbols & nil",
      steps: [
        {
          type: "text",
          md: [
            "## What's a symbol?",
            "Ruby has a type neither Swift nor Python has: the **symbol**, written with a leading colon — `:pending`, `:small`, `:confirmed`. A symbol is basically a lightweight, immutable name. Think of it as a string that's optimized for being an *identifier* rather than *text you display to a user*:",
            "```\nstatus = :pending\nstatus.class     # Symbol\nstatus == :pending   # true\n```",
            "Two symbols with the same name are always the exact same object in memory — Ruby only ever creates one `:pending`. Two strings `\"pending\"` and `\"pending\"` are equal in *value* but are separate objects. That's the whole reason symbols exist: cheap, fast, unambiguous identity.",
          ],
        },
        {
          type: "text",
          md: [
            "## Symbols vs. strings — when to use which",
            "Use a **string** for anything a human reads or that comes from outside your program (user input, a name, a message). Use a **symbol** for an internal label your own code compares against — hash keys and enum-ish states are the classic cases:",
            "```\ndog = { name: \"Rex\", size: :large }\nbooking_status = :confirmed\n```",
            "That `size: :large` pattern — a symbol key mapped to a symbol value — is everywhere in Ruby and Rails. A few modules from now, PawWalk's `Booking` model will use exactly this idea: a booking's status will be one of `:pending`, `:confirmed`, `:cancelled`, `:completed` — a fixed, small set of internal labels. Symbols are how Ruby spells that.",
          ],
        },
        {
          type: "code",
          title: "playground/symbols.rb",
          source: String.raw`booking_status = :pending
puts booking_status.class          # Symbol
puts booking_status == :pending    # true
puts booking_status == "pending"   # false — different types never match

dog_size = :small
puts dog_size.inspect               # :small`,
          caption: "`.inspect` shows a value the way Ruby SEES it — a symbol prints with its leading colon, which is the fastest way to tell a symbol and a string apart at a glance.",
        },
        {
          type: "text",
          md: [
            "## nil — and the falsy trap",
            "`nil` is Ruby's \"nothing here\" object — roughly Swift's `nil` or Python's `None`. Like Python, **any** variable can hold `nil` at any time; nothing in plain Ruby stops you from calling a method on it and crashing with `NoMethodError`. Check for it with `.nil?`:",
            "```\nbackup_walker = nil\nbackup_walker.nil?   # true\n```",
            "Now the trap: **in Ruby, only `nil` and `false` are falsy.** Everything else — including `0` and `\"\"` (empty string) — is truthy. That's different from JS and Python, where `0`, `\"\"`, and empty collections are ALL falsy:",
            "```\nputs \"skip\" if 0        # prints \"skip\" — 0 is truthy in Ruby!\nputs \"skip\" if \"\"       # prints \"skip\" — empty string is truthy too!\nputs \"skip\" if nil      # never prints\n```",
            "If you carry JS/Python instincts into Ruby, checking `if walk_count` to mean \"walk_count is nonzero\" will silently do the wrong thing. Check explicitly: `if walk_count != 0` or `if walk_count.zero?`.",
          ],
        },
        {
          type: "quiz",
          q: "In JavaScript and Python, `0` and `\"\"` are falsy — `if (0)` and `if \"\":` both skip. In Ruby, what does `puts \"hi\" if 0` do?",
          choices: [
            "Prints `hi` — in Ruby, only `nil` and `false` are falsy; `0` is truthy",
            "Does nothing — `0` is falsy in Ruby too, same as JS/Python",
            "Raises an error — you can't use an Integer in an `if` condition",
            "Prints `hi` only if `0` is written as `0.0`",
          ],
          answer: 0,
          explain: "Ruby's falsy set is exactly two values: `nil` and `false`. Everything else — `0`, `\"\"`, empty arrays — is truthy. This is the single most common bug JS/Python developers write in their first week of Ruby.",
          nudge: "The lesson named exactly two values that are falsy in Ruby. Is `0` one of them?",
        },
        {
          type: "exercise",
          title: "Check a booking status",
          prompt: [
            "Declare `booking_status` set to the symbol `:confirmed`. Declare `backup_walker` set to `nil`. Print whether `booking_status` equals `:confirmed` using `puts`, then print `backup_walker.nil?`.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`booking_status = :confirmed
backup_walker = nil
puts booking_status == :confirmed
puts backup_walker.nil?`,
          checks: [
            { re: /booking_status=:confirmed/, hint: "Assign a symbol with a leading colon, no quotes: `booking_status = :confirmed`." },
            { re: /backup_walker=nil/, hint: "Assign `nil` directly: `backup_walker = nil`." },
            { re: /puts booking_status==:confirmed/, hint: "Compare with `==`: `puts booking_status == :confirmed`." },
            { re: /puts backup_walker\.nil\?/, hint: "Call `.nil?` on it: `puts backup_walker.nil?`." },
          ],
          mustNot: [
            { re: /booking_status="confirmed"/, hint: "Use a symbol (`:confirmed`), not a string, for this internal status label." },
          ],
          success: "Symbols for internal labels, `.nil?` to check for nothing — both habits you'll lean on hard once Bookings show up.",
        },
      ],
    },
    {
      id: "conditionals",
      title: "Conditionals the Ruby Way",
      steps: [
        {
          type: "text",
          md: [
            "## if / elsif / else / end — no braces, no parens",
            "Swift wraps a condition in parens and a body in braces. Python drops the parens but keeps significant indentation with a colon. Ruby drops BOTH parens and braces — the block is closed with an explicit `end` keyword instead:",
            "```\nrating = 4.9\nif rating >= 4.8\n  puts \"top rated\"\nelsif rating >= 4.0\n  puts \"solid\"\nelse\n  puts \"needs reviews\"\nend\n```",
            "`elsif` — no second `e`, easy to misspell once and never again. Indentation (2 spaces, by convention) is purely cosmetic here, unlike Python — Ruby knows the block ends at `end`, not by dedenting.",
          ],
        },
        {
          type: "text",
          md: [
            "## `unless` — Ruby's negative if",
            "`unless condition` reads as `if not condition`. Ruby offers it because \"do this unless X\" is often more natural English than \"do this if not X\":",
            "```\nunless walker.available?\n  puts \"fully booked\"\nend\n```",
            "Reach for `unless` only when there's no `else` branch and the positive phrasing would need an ugly `!`. `unless ... else` exists but reads confusingly — prefer flipping it to `if` instead.",
          ],
        },
        {
          type: "text",
          md: [
            "## Trailing modifiers — put the condition at the end",
            "For a single-line body, Ruby lets you write the `if`/`unless` AFTER the statement, reading almost like English:",
            "```\nreturn if cancelled\nputs \"low rating\" if rating < 4.0\n```",
            "`return if cancelled` means exactly what it says: return, if cancelled. This is idiomatic Ruby for early-exit guard clauses — you'll see it constantly in real Rails code, including later in `apps/pawwalk-api`.",
          ],
        },
        {
          type: "text",
          md: [
            "## Ternary and case/when",
            "Ruby's ternary is identical in shape to Swift/JS/Python's: `condition ? a : b`. For matching one value against several options, `case/when` beats a long `elsif` chain:",
            "```\nlabel = rating >= 4.8 ? \"top rated\" : \"standard\"\n\ncase booking_status\nwhen :pending\n  puts \"waiting for a walker\"\nwhen :confirmed\n  puts \"walker on the way\"\nwhen :cancelled\n  puts \"cancelled\"\nelse\n  puts \"unknown status\"\nend\n```",
            "That `case booking_status when :pending ... when :confirmed ...` shape is exactly how the real PawWalk backend will branch on a booking's status once `Booking` gets a status field — file this pattern away.",
          ],
        },
        {
          type: "code",
          title: "playground/conditionals.rb",
          source: String.raw`rating = 4.9
puts "top rated" if rating >= 4.8

walk_minutes = 30
label = walk_minutes == 30 ? "short walk" : "long walk"
puts label

booking_status = :confirmed
case booking_status
when :pending
  puts "waiting"
when :confirmed
  puts "on the way"
else
  puts "done"
end`,
          caption: "Three ways to branch, same file: a trailing `if`, a ternary, and `case/when` — pick whichever reads clearest for the situation.",
        },
        {
          type: "quiz",
          q: "Which line is idiomatic Ruby for an early-exit guard clause, given a boolean `cancelled`?",
          choices: [
            "`return if cancelled`",
            "`if (cancelled) { return }`",
            "`if cancelled: return`",
            "`return unless not cancelled`",
          ],
          answer: 0,
          explain: "Trailing modifiers put the condition after the statement for single-line bodies. `return if cancelled` is the standard Ruby idiom — no parens, no braces, no colon.",
          nudge: "The lesson showed a condition placed AFTER the statement it guards. Which choice does that with no punctuation left over?",
        },
        {
          type: "exercise",
          title: "Label a booking status",
          prompt: [
            "Declare `booking_status` set to `:confirmed`. Write a `case` on `booking_status` with `when :pending` printing `waiting`, `when :confirmed` printing `on the way`, and an `else` printing `unknown`.",
          ],
          starter: String.raw`booking_status = :confirmed
# your code here
`,
          solution: String.raw`booking_status = :confirmed
case booking_status
when :pending
  puts "waiting"
when :confirmed
  puts "on the way"
else
  puts "unknown"
end`,
          checks: [
            { re: /case booking_status/, hint: "Start the block with `case booking_status`." },
            { re: /when:pending/, hint: "Match the pending case: `when :pending`." },
            { re: /when:confirmed/, hint: "Match the confirmed case: `when :confirmed`." },
            { re: /end/, hint: "Close the case block with `end` — Ruby has no closing brace." },
          ],
          mustNot: [
            { re: /elsif/, hint: "This is a `case/when` block, not an `if/elsif` chain — no `elsif` needed here." },
          ],
          success: "That's the exact shape you'll reuse once a real `Booking` gets a status field a few modules from now.",
        },
      ],
    },
    {
      id: "methods",
      title: "Methods",
      steps: [
        {
          type: "text",
          md: [
            "## def / end, and the implicit return",
            "Swift declares a function with `func`. Ruby uses `def`, closed with `end` — same as every other Ruby block:",
            "```\ndef greet(name)\n  \"Hello, #{name}!\"\nend\n```",
            "Look closely: there's no `return` keyword in that method, yet it hands back the greeting. **This is the single biggest habit to build:** a Ruby method automatically returns the value of the LAST expression it evaluates. You *can* write `return` explicitly, and you will for early exits — but for the normal \"compute a value and hand it back\" case, idiomatic Ruby leaves `return` off entirely.",
          ],
        },
        {
          type: "text",
          md: [
            "## Default args and keyword args",
            "A parameter can have a default, exactly like Swift and Python:",
            "```\ndef booking_total(duration, rate_cents_per_30 = 2400)\n  duration / 30.0 * rate_cents_per_30\nend\n```",
            "Ruby also supports **keyword arguments** — named at the call site, order-independent — using a trailing colon in the definition:",
            "```\ndef booking_total(duration:, rate_cents_per_30: 2400)\n  duration / 30.0 * rate_cents_per_30\nend\n\nbooking_total(duration: 45, rate_cents_per_30: 3000)\nbooking_total(rate_cents_per_30: 3000, duration: 45)   # same call, reordered\n```",
            "Keyword args make call sites self-documenting — `booking_total(duration: 45)` reads clearly even months later, unlike a bare `booking_total(45)`.",
          ],
        },
        {
          type: "text",
          md: [
            "## `?` and `!` are real characters in method names",
            "Ruby lets a method name end in `?` or `!` — these aren't decoration, they're conventions with real meaning:",
            "- A trailing **`?`** means the method returns something boolean-ish and reads as a yes/no question: `confirmed?`, `valid?`, `empty?`.\n- A trailing **`!`** flags a method as the \"dangerous\" twin of a same-named method without it — usually because it mutates in place or raises instead of failing quietly: `save!` raises if saving fails, where plain `save` just returns `false`.",
            "You'll see both constantly once Rails models show up: `booking.confirmed?`, `booking.save!`.",
          ],
        },
        {
          type: "code",
          title: "playground/price_label.rb",
          source: String.raw`def price_label(cents)
  "$#{cents / 100} / 30 min"
end

puts price_label(2500)`,
          caption: "No `return` anywhere — the string built by `#{}` interpolation is the last expression evaluated, so it's automatically what `price_label` hands back. The iOS course builds this exact `\"$25 / 30 min\"` value with a computed property; Ruby gets there with a method and an implicit return.",
        },
        {
          type: "quiz",
          q: "`def greet(name)` has NO `return` keyword anywhere in its body, yet calling it gives back a value. Why?",
          choices: [
            "A Ruby method implicitly returns the value of its last evaluated expression",
            "Ruby methods always return `nil` unless `return` is written explicitly",
            "It's a syntax error — every Ruby method requires an explicit `return`",
            "It only works because the method has exactly one line",
          ],
          answer: 0,
          explain: "Implicit return is a core Ruby habit: whatever the last expression evaluates to is automatically the method's return value. `return` still exists for early exits, but idiomatic Ruby omits it at the end of a method.",
          nudge: "The lesson called this out as THE big habit to build. What does a Ruby method return if you never write `return`?",
        },
        {
          type: "exercise",
          title: "Write price_label",
          prompt: [
            "Define `def price_label(cents)` that returns a string like `\"$25 / 30 min\"` given `cents = 2500` — divide `cents` by `100` inside a `#{}` interpolation. No `return` keyword needed.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`def price_label(cents)
  "$#{cents / 100} / 30 min"
end`,
          checks: [
            { re: /def price_label\(cents\)/, hint: "Match the exact signature: `def price_label(cents)`." },
            { re: /cents\/100/, hint: "Divide cents by 100 inside the interpolation: `#{cents / 100}`." },
            { re: /end/, hint: "Close the method with `end`." },
          ],
          mustNot: [
            { re: /return/, hint: "Leave `return` off — the interpolated string is already the last expression, so it returns automatically." },
          ],
          success: "Same computed value the iOS course builds as `priceLabel` — here it's a method with an implicit return instead of a computed property.",
        },
      ],
    },
    {
      id: "puts-p-running-files",
      title: "puts, p, and Running Files",
      steps: [
        {
          type: "text",
          md: [
            "## puts vs. p vs. inspect",
            "Ruby has two everyday printing methods, and they behave differently — mixing them up is a classic first-week confusion:",
            "- **`puts`** prints a human-readable version and adds a trailing newline. On `nil` it prints nothing but a blank line. On a string, no quotes show.\n- **`p`** prints the `.inspect` form — the DEBUG view, quotes included — and returns the value itself, which makes it handy inside a chain while debugging.",
            "```\nputs \"Mochi\"     # Mochi\np \"Mochi\"        # \"Mochi\"  (quotes shown)\nputs nil          # (blank line)\np nil             # nil\n```",
            "Reach for `puts` when a script talks to a human. Reach for `p` when you're debugging and need to see exactly what a value IS — a symbol vs. a string, `nil` vs. an empty string, etc.",
          ],
        },
        {
          type: "text",
          md: [
            "## Running a file: `ruby walk.rb`",
            "You've been running samples with `ruby playground/whatever.rb` throughout this module — that's the whole ceremony. No compile step, no project file: Ruby reads the file top to bottom and runs it. `irb` is for quick one-liners; a `.rb` file is for anything you want to save and re-run.",
          ],
        },
        {
          type: "code",
          title: "playground/walk_summary.rb",
          source: String.raw`def price_label(cents)
  "$#{cents / 100} / 30 min"
end

walker_name = "Priya"
walk_price_cents = 2500
dog_name = "Mochi"

puts "Walker: #{walker_name}"
puts "Price: #{price_label(walk_price_cents)}"
puts "#{walker_name} is walking #{dog_name} today!"`,
          caption: "Run with `ruby playground/walk_summary.rb`. Every idea from this module in one script: a method with an implicit return, string interpolation, and plain variables — no imports, no `main`, no boilerplate.",
        },
        {
          type: "quiz",
          q: "You run `p \"Mochi\"` in irb. What's different from `puts \"Mochi\"`?",
          choices: [
            "`p` prints the `.inspect` form, quotes included — `puts` prints the plain text with no quotes",
            "They're identical — `p` is just a shorter alias for `puts`",
            "`p` only works inside `irb`, never in a `.rb` file",
            "`puts` shows quotes, `p` does not",
          ],
          answer: 0,
          explain: "`puts \"Mochi\"` prints `Mochi`. `p \"Mochi\"` prints `\"Mochi\"` — the inspect/debug view. Reach for `p` whenever you need to see a value's exact shape, not just its human-readable text.",
          nudge: "Which one is meant for debugging — showing you exactly what a value IS, quotes and all?",
        },
        {
          type: "exercise",
          title: "Capstone: assemble a walk summary",
          prompt: [
            "Using the `price_label` method already defined below, declare `walker_name = \"Ana\"` and `walk_price_cents = 3000`. Then `puts` an interpolated line reading like `Ana charges $30 / 30 min` — call `price_label(walk_price_cents)` inside the interpolation.",
          ],
          starter: String.raw`def price_label(cents)
  "$#{cents / 100} / 30 min"
end

# your code here
`,
          solution: String.raw`def price_label(cents)
  "$#{cents / 100} / 30 min"
end

walker_name = "Ana"
walk_price_cents = 3000
puts "#{walker_name} charges #{price_label(walk_price_cents)}"`,
          checks: [
            { re: /walker_name="Ana"/, hint: "Assign the walker's name: `walker_name = \"Ana\"`." },
            { re: /walk_price_cents=3000/, hint: "Assign the price in cents: `walk_price_cents = 3000`." },
            { re: /puts"#\{walker_name\}charges#\{price_label\(walk_price_cents\)\}"/, hint: "Interpolate both the name and a call to `price_label(walk_price_cents)` in one `puts` line." },
          ],
          success: "Variables, interpolation, and a method with an implicit return, all in one script — that's the whole toolkit this module built, and it's exactly how real Ruby scripts read.",
        },
      ],
    },
  ],
});
