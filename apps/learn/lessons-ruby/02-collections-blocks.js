window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "collections-blocks",
  title: "Collections & Blocks",
  emoji: "🧺",
  lang: "ruby",
  lessons: [
    {
      id: "arrays",
      title: "Arrays",
      steps: [
        {
          type: "text",
          md: [
            "## An array literal looks familiar",
            "Ruby arrays look almost exactly like Swift's or JS's — square brackets, comma-separated, no type annotation required:",
            "```\nwalkers = [\"Ana\", \"Ben\", \"Cleo\"]\n```",
            "Same object-everywhere rule from module 01 applies: `walkers` is an instance of `Array`, and every element is its own full object.",
          ],
        },
        {
          type: "text",
          md: [
            "## Indexing: zero-based, and negative counts from the end",
            "Positive indices work exactly like Swift/JS — `walkers[0]` is the first element. Ruby also supports **negative indices**, same trick Python has: `walkers[-1]` is the last element, `walkers[-2]` the second-to-last. Swift arrays have no such shortcut — you'd write `walkers[walkers.count - 1]`.",
            "```\nwalkers = [\"Ana\", \"Ben\", \"Cleo\"]\nwalkers[0]    # \"Ana\"\nwalkers[-1]   # \"Cleo\"\n```",
          ],
        },
        {
          type: "text",
          md: [
            "## first, last, length — read like English",
            "For the two ends and the size, Ruby gives you named methods instead of making you remember index math:",
            "```\nwalkers.first    # \"Ana\"       — same as walkers[0]\nwalkers.last     # \"Cleo\"      — same as walkers[-1]\nwalkers.length   # 3            — .size works too, same thing\n```",
            "Prefer `.first`/`.last` over `walkers[0]`/`walkers[-1]` when you're just grabbing an end — it reads better and never risks an off-by-one.",
          ],
        },
        {
          type: "text",
          md: [
            "## `<<` — the idiomatic push",
            "Ruby has `.push(item)`, but the everyday spelling is the **shovel operator** `<<`, which appends and reads left-to-right like you're pouring the item in:",
            "```\nwalkers << \"Deja\"\nwalkers.length   # 4\n```",
            "And `.include?` answers a yes/no membership question — the `?` is the same convention from module 01, a method that reads like a question:",
            "```\nwalkers.include?(\"Ben\")   # true\n```",
          ],
        },
        {
          type: "code",
          title: "playground/walkers.rb",
          source: String.raw`walkers = ["Ana", "Ben", "Cleo"]

puts walkers[0]
puts walkers[-1]
puts walkers.first
puts walkers.last
puts walkers.length

walkers << "Deja"
puts walkers.length
puts walkers.include?("Ben")
puts walkers.inspect`,
          caption: "Run with `ruby playground/walkers.rb` — prints `Ana`, `Cleo`, `Ana`, `Cleo`, `3`, `4`, `true`, then `[\"Ana\", \"Ben\", \"Cleo\", \"Deja\"]` from `.inspect`.",
        },
        {
          type: "quiz",
          q: "`walkers = [\"Ana\", \"Ben\", \"Cleo\"]`. What does `walkers[-1]` give you, and how would you write the same thing with a named method?",
          choices: [
            "`\"Cleo\"` — the last element; same as `walkers.last`",
            "`\"Ana\"` — negative indices count from the front in Ruby",
            "An error — Ruby arrays don't support negative indices",
            "`\"Cleo\"`, but only if you call `.reverse` first",
          ],
          answer: 0,
          explain: "Negative indices count backward from the end, same idea as Python. `walkers[-1]` and `walkers.last` are two spellings of the same last-element access.",
          nudge: "Which end of the array does a NEGATIVE index count from?",
        },
        {
          type: "exercise",
          title: "Build a walker roster",
          prompt: [
            "Declare an array `walkers` containing `\"Ana\"`, `\"Ben\"`, `\"Cleo\"`. Push `\"Deja\"` onto it with `<<`. Print `walkers.length` and `walkers.include?(\"Cleo\")` with `puts`.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`walkers = ["Ana", "Ben", "Cleo"]
walkers << "Deja"
puts walkers.length
puts walkers.include?("Cleo")`,
          checks: [
            { re: /walkers=\["Ana","Ben","Cleo"\]/, hint: "Start with the literal: `walkers = [\"Ana\", \"Ben\", \"Cleo\"]`." },
            { re: /walkers<<"Deja"/, hint: "Use the shovel operator to push: `walkers << \"Deja\"`." },
            { re: /puts walkers\.length/, hint: "Print the size with `puts walkers.length`." },
            { re: /puts walkers\.include\?\("Cleo"\)/, hint: "Check membership with `puts walkers.include?(\"Cleo\")`." },
          ],
          mustNot: [
            { re: /\.push\(/, hint: "Use the idiomatic `<<` shovel operator instead of `.push(...)` here." },
          ],
          success: "That's the whole array toolkit for now — literal, negative indexing, `<<` to grow it, `.include?` to ask a yes/no question.",
        },
      ],
    },
    {
      id: "hashes",
      title: "Hashes",
      steps: [
        {
          type: "text",
          md: [
            "## A hash is Ruby's dictionary — with a symbol-key shortcut",
            "Ruby's **hash** does the same job as Swift's `[String: Any]` or a JS object. With symbol keys — the common case — Ruby has a shorthand that drops the `=>` entirely:",
            "```\nwalker = { name: \"Luna\", city: \"Austin\", price_cents: 2500 }\n```",
            "Read `name: \"Luna\"` as \"the key `:name` maps to `\\\"Luna\\\"`\" — it's exactly `:name => \"Luna\"` under the hood, just shorter to write. This is the form you'll see everywhere in Ruby and Rails.",
          ],
        },
        {
          type: "text",
          md: [
            "## Access: `[]`, and `fetch` with a default",
            "Square brackets read a key, same shape as Swift/JS. A missing key returns `nil` rather than crashing — but `.fetch` gives you a safer, more explicit option with a default:",
            "```\nwalker[:name]              # \"Luna\"\nwalker[:bio]               # nil — key missing, no crash, easy to miss\nwalker.fetch(:bio, \"n/a\")  # \"n/a\" — explicit default, same idea as Python's .get()\n```",
            "Reach for `.fetch` with a default whenever a missing key should mean something specific rather than silently propagating `nil`.",
          ],
        },
        {
          type: "text",
          md: [
            "## Adding keys, and nesting hashes",
            "A hash is mutable — assign into a new key to add it, exactly like a JS object:",
            "```\nwalker[:rating] = 4.9\n```",
            "Hashes nest freely, which is how a booking naturally holds its own walker's info:",
            "```\nbooking = {\n  dog: \"Mochi\",\n  walker: { name: \"Luna\", city: \"Austin\" }\n}\nbooking[:walker][:name]   # \"Luna\"\n```",
          ],
        },
        {
          type: "text",
          md: [
            "## Hash vs. JS object, in one line",
            "A JS object's keys are usually bare identifiers or strings and the object doubles as both a struct AND a map. A Ruby hash is *always* an explicit key→value map — even when keys are symbols, you're never confusing it with an instance of a class the way `{ name: \"Luna\" }.constructor` can blur in JS.",
          ],
        },
        {
          type: "code",
          title: "playground/walker_hash.rb",
          source: String.raw`walker = { name: "Luna", city: "Austin", price_cents: 2500 }
puts walker[:name]
puts walker.fetch(:bio, "n/a")

walker[:rating] = 4.9
puts walker.inspect

booking = {
  dog: "Mochi",
  walker: { name: "Luna", city: "Austin" }
}
puts booking[:walker][:name]`,
          caption: "Run with `ruby playground/walker_hash.rb` — prints `Luna`, `n/a`, the updated hash via `.inspect`, then `Luna` again from the nested lookup.",
        },
        {
          type: "quiz",
          q: "`walker = { name: \"Luna\" }`. Why prefer `walker.fetch(:bio, \"n/a\")` over `walker[:bio]` when the key might not exist?",
          choices: [
            "`.fetch` with a default returns `\"n/a\"` instead of silently giving back `nil`",
            "`[]` raises an error on any missing key, so `.fetch` is required",
            "`.fetch` is the only way to read a symbol key",
            "There's no difference — they always behave identically",
          ],
          answer: 0,
          explain: "`walker[:bio]` on a missing key quietly returns `nil` — easy to miss. `.fetch(:bio, \"n/a\")` makes the missing case explicit with a real default, the same job Python's `.get(key, default)` does.",
          nudge: "What does plain `[]` give you back on a key that isn't there — and does `.fetch` let you say what SHOULD come back instead?",
        },
        {
          type: "exercise",
          title: "Build a booking hash",
          prompt: [
            "Declare a hash `booking` with keys `dog:` set to `\"Mochi\"` and `walker:` set to a nested hash `{ name: \"Luna\", city: \"Austin\" }`. Print `booking[:walker][:city]` with `puts`.",
          ],
          starter: String.raw`# your code here
`,
          solution: String.raw`booking = { dog: "Mochi", walker: { name: "Luna", city: "Austin" } }
puts booking[:walker][:city]`,
          checks: [
            { re: /booking=\{dog:"Mochi",walker:\{name:"Luna",city:"Austin"\}\}/, hint: "Build the nested literal exactly: `{ dog: \"Mochi\", walker: { name: \"Luna\", city: \"Austin\" } }`." },
            { re: /puts booking\[:walker\]\[:city\]/, hint: "Chain two lookups: `puts booking[:walker][:city]`." },
          ],
          success: "A nested hash — the same shape a real booking-with-walker payload will take once the API is in play.",
        },
      ],
    },
    {
      id: "blocks-each",
      title: "Blocks: each",
      steps: [
        {
          type: "text",
          md: [
            "## A block is just code you hand to a method",
            "This is Ruby's real superpower, and it's simpler than it sounds: a **block** is a chunk of code attached to a method call, which the method runs however many times it wants — once per item, once total, or not at all. You've already been passed the idea in Swift's trailing closures (`[1,2,3].map { $0 * 2 }`); a Ruby block is the same concept, built into the language's core syntax instead of being \"just another closure value.\"",
            "There are two ways to write one — a `do ... end` form for multiple lines, and a `{ ... }` form for one line:",
            "```\nwalkers.each do |walker|\n  puts \"Walker: #{walker}\"\nend\n\nwalkers.each { |walker| puts walker }\n```",
            "Same block, two spellings. The stuff between the pipes — `|walker|` — names the parameter the block receives each time it runs, same job as a closure's parameter list.",
          ],
        },
        {
          type: "text",
          md: [
            "## The convention: `do...end` for multi-line, `{ }` for one-line",
            "Ruby style isn't arbitrary here — it's a real convention worth internalizing now: use `do ... end` when the block body spans multiple lines, and `{ ... }` when it's a single short expression. Both work either way syntactically, but mixing them backwards (a giant `{ }` block, or a one-liner `do...end`) reads as a beginner tell in real Ruby code.",
          ],
        },
        {
          type: "text",
          md: [
            "## `each` over a hash: two block params",
            "`each` works on a hash too — the block just takes two parameters instead of one, key then value:",
            "```\nbooking = { dog: \"Mochi\", price_cents: 2500 }\nbooking.each do |key, value|\n  puts \"#{key}: #{value}\"\nend\n```",
          ],
        },
        {
          type: "text",
          md: [
            "## Ruby has `for` — but nobody idiomatic uses it",
            "Ruby technically has a `for item in collection ... end` loop. It exists, it runs, and you should basically never write it. Idiomatic Ruby reaches for `each` (and the block methods in the next two lessons) every time — `for` even leaks its loop variable into the surrounding scope after the loop ends, one more reason it's avoided. If you see `for` in Ruby code, treat it as a smell.",
          ],
        },
        {
          type: "code",
          title: "playground/each.rb",
          source: String.raw`walkers = ["Ana", "Ben", "Cleo"]

walkers.each do |walker|
  puts "Walker: #{walker}"
end

walkers.each { |walker| puts walker.upcase }

booking = { dog: "Mochi", price_cents: 2500 }
booking.each do |key, value|
  puts "#{key}: #{value}"
end`,
          caption: "Run with `ruby playground/each.rb`. Notice the two `each` calls on `walkers` use the two different block spellings — `do...end` for the multi-line body, `{ }` for the one-liner.",
        },
        {
          type: "quiz",
          q: "Which is the idiomatic Ruby convention for writing a block?",
          choices: [
            "`{ ... }` for a short one-liner, `do ... end` when the body spans multiple lines",
            "`do ... end` for a short one-liner, `{ ... }` for multi-line bodies",
            "Always `{ ... }` — `do...end` is deprecated",
            "It never matters; pick whichever looks nicer that day",
          ],
          answer: 0,
          explain: "Both forms work identically — the convention is about readability: braces for a single short expression, `do...end` once the block body needs room to breathe across several lines.",
          nudge: "Which form reads better for ONE short line — braces, or a whole `do...end` block?",
        },
        {
          type: "exercise",
          title: "Greet every walker",
          prompt: [
            "Given the array `walkers` below, use `.each` with a `do |walker| ... end` block to `puts` a line reading `Hi, <name>!` for every walker.",
          ],
          starter: String.raw`walkers = ["Ana", "Ben", "Cleo"]
# your code here
`,
          solution: String.raw`walkers = ["Ana", "Ben", "Cleo"]
walkers.each do |walker|
  puts "Hi, #{walker}!"
end`,
          checks: [
            { re: /walkers\.each do\|walker\|/, hint: "Start the block with `walkers.each do |walker|`." },
            { re: /puts"Hi,#\{walker\}!"/, hint: "Interpolate the name: `puts \"Hi, #{walker}!\"`." },
            { re: /end/, hint: "Close the `do...end` block with `end`." },
          ],
          mustNot: [
            { re: /for walker in/, hint: "Use `.each`, not a `for` loop — idiomatic Ruby never reaches for `for`." },
          ],
          success: "`each` with a block is the single most-used pattern in all of Ruby — you'll type this a thousand more times.",
        },
      ],
    },
    {
      id: "transform-map-select",
      title: "Transform: map & select",
      steps: [
        {
          type: "text",
          md: [
            "## `map` — transform every item into something new",
            "`each` just runs a block; it hands back the original collection untouched. `map` runs a block too, but collects what the block RETURNS into a brand-new array — this is a transform, same idea as Swift/JS's `.map`, just with a Ruby block instead of an arrow function:",
            "```\nnames = [\"ana\", \"ben\", \"cleo\"]\nupcased = names.map { |n| n.upcase }\n# [\"ANA\", \"BEN\", \"CLEO\"]\n```",
            "`map` also shines on an array of hashes — pull one field out of every element:",
            "```\nbookings = [{ dog: \"Mochi\", price_cents: 2500 }, { dog: \"Rex\", price_cents: 3000 }]\ndogs = bookings.map { |b| b[:dog] }\n# [\"Mochi\", \"Rex\"]\n```",
          ],
        },
        {
          type: "text",
          md: [
            "## `select` and `reject` — filter, don't transform",
            "`select` keeps only the items where the block returns something truthy; `reject` is the mirror image, keeping items where the block is falsy:",
            "```\nbookings = [\n  { dog: \"Mochi\", status: :confirmed },\n  { dog: \"Rex\", status: :pending },\n]\nconfirmed = bookings.select { |b| b[:status] == :confirmed }\n# [{ dog: \"Mochi\", status: :confirmed }]\n\npending = bookings.reject { |b| b[:status] == :confirmed }\n# [{ dog: \"Rex\", status: :pending }]\n```",
            "Swift's `.filter` is `select`'s twin — same job, different name. Ruby has no built-in `.filter` alias in older versions, though recent Ruby actually added `filter` as a synonym for `select`; you'll see `select` far more often in existing code, so lead with that.",
          ],
        },
        {
          type: "text",
          md: [
            "## Chaining: `select` then `map`",
            "Because both return a plain array, you can chain them — filter first, then transform what's left, all in one readable line:",
            "```\nconfirmed_dogs = bookings.select { |b| b[:status] == :confirmed }.map { |b| b[:dog] }\n# [\"Mochi\"]\n```",
            "Read it left to right: \"keep the confirmed ones, then pull out each dog's name.\" This chain — `select.map` — is the Ruby equivalent of Swift's `bookings.filter { ... }.map { ... }` or JS's `.filter(...).map(...)`. Same shape, blocks instead of arrow functions.",
          ],
        },
        {
          type: "code",
          title: "playground/transform.rb",
          source: String.raw`bookings = [
  { dog: "Mochi", status: :confirmed, price_cents: 2500 },
  { dog: "Rex", status: :pending, price_cents: 3000 },
  { dog: "Fido", status: :confirmed, price_cents: 2000 },
]

names_only = bookings.map { |b| b[:dog] }
puts names_only.inspect

confirmed = bookings.select { |b| b[:status] == :confirmed }
puts confirmed.length

confirmed_names = bookings.select { |b| b[:status] == :confirmed }.map { |b| b[:dog] }
puts confirmed_names.inspect`,
          caption: "Run with `ruby playground/transform.rb` — prints `[\"Mochi\", \"Rex\", \"Fido\"]`, then `2`, then `[\"Mochi\", \"Fido\"]` from the chained `select.map`.",
        },
        {
          type: "quiz",
          q: "`bookings.select { |b| b[:status] == :confirmed }` returns 2 out of 3 bookings. What's the key difference between `select` and `map`?",
          choices: [
            "`select` filters — keeps only matching items; `map` transforms — returns a new value for every item",
            "They're aliases for the exact same behavior",
            "`select` can only be used on hashes, `map` only on arrays",
            "`map` filters, `select` transforms — the names are swapped from what you'd expect",
          ],
          answer: 0,
          explain: "`select` decides yes/no per item and keeps the yeses. `map` runs on every item unconditionally and swaps each one for whatever the block returns. Different jobs, often chained together.",
          nudge: "One of these two methods can shrink the array (by dropping items); the other always returns the same NUMBER of items, just transformed. Which is which?",
        },
        {
          type: "exercise",
          title: "Confirmed bookings, dog names only",
          prompt: [
            "Given the `bookings` array below, build `confirmed_dogs`: `select` the bookings where `:status` is `:confirmed`, then `map` to each one's `:dog` name. Chain both calls in one line.",
          ],
          starter: String.raw`bookings = [
  { dog: "Mochi", status: :confirmed },
  { dog: "Rex", status: :pending },
  { dog: "Fido", status: :confirmed },
]
# your code here
`,
          solution: String.raw`bookings = [
  { dog: "Mochi", status: :confirmed },
  { dog: "Rex", status: :pending },
  { dog: "Fido", status: :confirmed },
]
confirmed_dogs = bookings.select { |b| b[:status] == :confirmed }.map { |b| b[:dog] }`,
          checks: [
            { re: /confirmed_dogs=bookings\.select\{\|b\|b\[:status\]==:confirmed\}/, hint: "Start with `bookings.select { |b| b[:status] == :confirmed }`." },
            { re: /\.map\{\|b\|b\[:dog\]\}/, hint: "Chain `.map { |b| b[:dog] }` right after the `select`." },
          ],
          mustNot: [
            { re: /\.filter\(/, hint: "This is Ruby, not JS — use `.select { ... }`, not `.filter(...)`." },
            { re: /for b in/, hint: "Chain `select` and `map`, not a `for` loop." },
          ],
          success: "Filter then transform, one line — you'll reach for `select.map` (or its cousin `reject.map`) constantly once real booking data shows up.",
        },
      ],
    },
    {
      id: "crunch-sum-sort-min-max",
      title: "Crunch: sum, sort_by, min_by",
      steps: [
        {
          type: "text",
          md: [
            "## `sum` — add up a field with a block",
            "`sum` totals a collection of numbers directly, but its real power shows up with a block: give it a block and it sums WHATEVER the block returns for each item, without a separate `map` step first:",
            "```\nbookings = [{ price_cents: 2500 }, { price_cents: 3000 }, { price_cents: 2000 }]\ntotal_cents = bookings.sum { |b| b[:price_cents] }\n# 7500\n```",
            "Read `bookings.sum { |b| b[:price_cents] }` as \"for each booking, take its `price_cents`, and add all of those together.\"",
          ],
        },
        {
          type: "text",
          md: [
            "## `sort_by` — order by a computed key",
            "`sort_by` reorders a collection by whatever the block returns, ascending:",
            "```\nsorted = bookings.sort_by { |b| b[:price_cents] }\n# cheapest booking first\n```",
            "This beats writing a custom comparison — you just say WHAT to sort by, and Ruby handles the rest.",
          ],
        },
        {
          type: "text",
          md: [
            "## `min_by` / `max_by` — the one extreme, without sorting everything",
            "When you only need the single cheapest or priciest item, `min_by`/`max_by` skip sorting the whole collection and just hand back that one element:",
            "```\ncheapest = bookings.min_by { |b| b[:price_cents] }\npriciest = bookings.max_by { |b| b[:price_cents] }\n```",
          ],
        },
        {
          type: "text",
          md: [
            "## `count` with a block — a filtered tally",
            "`.length` counts everything. `.count { block }` counts only the items where the block is truthy — a `select { ... }.length` in one step:",
            "```\nconfirmed_count = bookings.count { |b| b[:status] == :confirmed }\n```",
          ],
        },
        {
          type: "code",
          title: "playground/earnings.rb",
          source: String.raw`bookings = [
  { dog: "Mochi", status: :confirmed, price_cents: 2500 },
  { dog: "Rex", status: :pending, price_cents: 3000 },
  { dog: "Fido", status: :confirmed, price_cents: 2000 },
]

total_cents = bookings.sum { |b| b[:price_cents] }
puts total_cents

sorted_names = bookings.sort_by { |b| b[:price_cents] }.map { |b| b[:dog] }
puts sorted_names.inspect

cheapest = bookings.min_by { |b| b[:price_cents] }
puts cheapest[:dog]

confirmed_count = bookings.count { |b| b[:status] == :confirmed }
puts confirmed_count`,
          caption: "Run with `ruby playground/earnings.rb` — prints `7500`, then `[\"Fido\", \"Mochi\", \"Rex\"]` (cheapest first), then `Fido`, then `2`.",
        },
        {
          type: "quiz",
          q: "You need the single cheapest booking out of a large array — nothing else. Which is the better fit: `bookings.sort_by { |b| b[:price_cents] }.first`, or `bookings.min_by { |b| b[:price_cents] }`?",
          choices: [
            "`min_by` — it finds the one extreme directly, no need to sort the whole collection",
            "`sort_by(...).first` — `min_by` can only be used on numbers, never hashes",
            "They're exactly the same speed and style; pick either",
            "`min_by` only works if the array is already sorted",
          ],
          answer: 0,
          explain: "`sort_by(...).first` works, but it sorts everything just to throw away all but one result. `min_by` (and `max_by`) go straight to the single extreme — clearer intent, less wasted work.",
          nudge: "One approach sorts the ENTIRE array just to grab the first element afterward. Is there a method whose whole job is finding just the one extreme?",
        },
        {
          type: "exercise",
          title: "Compute a walker's earnings",
          prompt: [
            "Given the `bookings` array below, compute `earnings_cents`: the sum of `:price_cents` for every booking where `:status` is `:confirmed`. Use `select` then `sum` with a block, chained in one line.",
          ],
          starter: String.raw`bookings = [
  { dog: "Mochi", status: :confirmed, price_cents: 2500 },
  { dog: "Rex", status: :pending, price_cents: 3000 },
  { dog: "Fido", status: :confirmed, price_cents: 2000 },
]
# your code here
`,
          solution: String.raw`bookings = [
  { dog: "Mochi", status: :confirmed, price_cents: 2500 },
  { dog: "Rex", status: :pending, price_cents: 3000 },
  { dog: "Fido", status: :confirmed, price_cents: 2000 },
]
earnings_cents = bookings.select { |b| b[:status] == :confirmed }.sum { |b| b[:price_cents] }`,
          checks: [
            { re: /earnings_cents=bookings\.select\{\|b\|b\[:status\]==:confirmed\}/, hint: "Start with `bookings.select { |b| b[:status] == :confirmed }`." },
            { re: /\.sum\{\|b\|b\[:price_cents\]\}/, hint: "Chain `.sum { |b| b[:price_cents] }` right after the `select`." },
          ],
          mustNot: [
            { re: /\.reduce\(/, hint: "This is a `select.sum` job — no need for `.reduce` here." },
          ],
          success: "select.sum with blocks — that's how you'd compute a real walker's earnings once bookings come from the database instead of a starter array.",
        },
      ],
    },
    {
      id: "ranges-capstone",
      title: "Ranges & capstone",
      steps: [
        {
          type: "text",
          md: [
            "## `1..5` vs `1...5` — inclusive vs. exclusive",
            "A **range** is a compact way to describe \"every value from here to there.\" Two dots include the end; three dots exclude it:",
            "```\n(1..5).to_a     # [1, 2, 3, 4, 5] — end INCLUDED\n(1...5).to_a    # [1, 2, 3, 4]    — end EXCLUDED\n```",
            "`.to_a` turns a range into a real array. Ranges aren't just for numbers, either — `to_a` is just the easiest way to see one's contents while you're learning.",
          ],
        },
        {
          type: "text",
          md: [
            "## Ranges inside `case/when` — price tiers",
            "Module 01 showed `case/when` matching exact values like `:pending`. `when` can also match a RANGE — perfect for bucketing a number into a tier without a chain of `elsif` comparisons:",
            "```\nprice_cents = 2500\ntier = case price_cents\n       when 0...2000\n         \"budget\"\n       when 2000...3000\n         \"standard\"\n       else\n         \"premium\"\n       end\n# tier == \"standard\"\n```",
            "Each `when` here is a range; Ruby checks whether `price_cents` falls inside it with the range's own `===` behavior — you don't write any comparison operators yourself.",
          ],
        },
        {
          type: "code",
          title: "playground/ranges.rb",
          source: String.raw`puts (1..5).to_a.inspect
puts (1...5).to_a.inspect

price_cents = 2500
tier = case price_cents
       when 0...2000
         "budget"
       when 2000...3000
         "standard"
       else
         "premium"
       end
puts tier`,
          caption: "Run with `ruby playground/ranges.rb` — prints `[1, 2, 3, 4, 5]`, then `[1, 2, 3, 4]`, then `standard` (2500 falls in the `2000...3000` range).",
        },
        {
          type: "quiz",
          q: "What's the one character that separates `(1..5)` from `(1...5)` — and what does it change?",
          choices: [
            "A third dot; `1...5` excludes the final value, so it stops at `4`",
            "Nothing — they're identical, just alternate styles",
            "A third dot; `1...5` INCLUDES one extra value past 5",
            "The three-dot form is only valid inside `case/when`, never with `.to_a`",
          ],
          answer: 0,
          explain: "Two dots (`..`) is an inclusive range — the end value is part of it. Three dots (`...`) is exclusive — it stops just short of the end value.",
          nudge: "Which form has fewer values in it: two dots, or three?",
        },
        {
          type: "exercise",
          title: "Capstone: total up confirmed earnings",
          prompt: [
            "Given the `bookings` array below, `select` the ones where `:status` is `:confirmed`, `sum` their `:price_cents`, then `puts` a line reading `Confirmed total: $<dollars>` — divide the cents by `100.0` inside the interpolation so it shows a decimal.",
          ],
          starter: String.raw`bookings = [
  { dog: "Mochi", status: :confirmed, price_cents: 2500 },
  { dog: "Rex", status: :pending, price_cents: 3000 },
  { dog: "Fido", status: :confirmed, price_cents: 2000 },
]
# your code here
`,
          solution: String.raw`bookings = [
  { dog: "Mochi", status: :confirmed, price_cents: 2500 },
  { dog: "Rex", status: :pending, price_cents: 3000 },
  { dog: "Fido", status: :confirmed, price_cents: 2000 },
]
confirmed_total_cents = bookings.select { |b| b[:status] == :confirmed }.sum { |b| b[:price_cents] }
puts "Confirmed total: $#{confirmed_total_cents / 100.0}"`,
          checks: [
            { re: /bookings\.select\{\|b\|b\[:status\]==:confirmed\}\.sum\{\|b\|b\[:price_cents\]\}/, hint: "Chain `bookings.select { |b| b[:status] == :confirmed }.sum { |b| b[:price_cents] }` to get the total cents." },
            { re: /puts"Confirmed total:\$#\{.+\/100\.0\}"/, hint: "Interpolate the total divided by `100.0`: `puts \"Confirmed total: $#{... / 100.0}\"`." },
          ],
          mustNot: [
            { re: /for b in/, hint: "Stick with `select` and `sum` — no `for` loop needed." },
          ],
          success: "Four lines, and it's everything modules 01–02 taught: a hash literal, symbols, `select`/`sum` blocks, and string interpolation — this is what real Ruby data-crunching looks like.",
        },
      ],
    },
  ],
});
