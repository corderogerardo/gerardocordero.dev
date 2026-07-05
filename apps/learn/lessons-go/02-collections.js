window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "go-collections",
  title: "Collections",
  emoji: "📦",
  lang: "go",
  lessons: [
    {
      id: "slices",
      title: "Slices",
      steps: [
        {
          type: "text",
          md: [
            "## A list of walkers, not just one",
            "So far you've held a single value in a variable — one name, one price. A real PawWalk backend deals in *lists*: every walker near you, every booking in a day, every GPS fix on a route. Go's everyday list type is the **slice**.",
            "Go has two list-like types, and the difference matters:",
            "- An **array** has a *fixed* length baked into its type: `[3]string` is exactly three strings, forever. You almost never write these.\n- A **slice** is a *growable* view over a run of values: `[]string` — note the empty brackets. This is what you actually use, every day.",
            "> Coming from Swift, a Go slice is your `Array`. The fixed `[3]string` array is the odd one out — reach for a slice unless you have a specific reason not to.",
          ],
        },
        {
          type: "code",
          title: "playground/slices.go",
          source: String.raw`package main

import "fmt"

func main() {
	// A slice literal: empty brackets, then the values.
	names := []string{"Mochi", "Biscuit", "Cocoa"}

	fmt.Println(names)     // [Mochi Biscuit Cocoa]
	fmt.Println(len(names)) // 3 — how many elements
	fmt.Println(names[0])  // Mochi — indexing is zero-based
}`,
          caption: "`[]string{...}` is a slice literal. `len(names)` gives the count. Indexing starts at 0, exactly like Swift.",
        },
        {
          type: "text",
          md: [
            "## Growing a slice with `append`",
            "A slice starts at some length and grows as you add to it. You grow it with the built-in **`append`** — and here's the one rule that trips everyone up: `append` *returns* the new slice, so you must assign the result back.",
            "```names = append(names, \"Rex\")```",
            "Reading that as a sentence: \"names becomes names-with-Rex-on-the-end.\" Forgetting the `names =` on the left is the classic Go beginner bug — the append happens but you throw the result away.",
          ],
        },
        {
          type: "quiz",
          q: "Which line correctly adds \"Rex\" to a `[]string` called `walkers`?",
          choices: [
            "walkers = append(walkers, \"Rex\")",
            "walkers.append(\"Rex\")",
            "append(walkers, \"Rex\")",
            "walkers += \"Rex\"",
          ],
          answer: 0,
          explain: "`append` is a built-in function, not a method — you call `append(slice, value)` and it returns the grown slice, so you assign it back with `walkers = ...`. Dropping the assignment is the classic mistake: the result is discarded.",
          nudge: "`append` hands back a new slice. Where does that returned value need to go?",
        },
        {
          type: "text",
          md: [
            "## Length, capacity, and slicing",
            "Two numbers describe a slice: **`len`** (how many elements it holds now) and **`cap`** (how many it can hold before Go allocates a bigger backing array). You'll mostly care about `len`; `cap` is a performance detail that append manages for you.",
            "You can also take a **sub-slice** with `s[low:high]` — a window from index `low` up to *but not including* `high`:",
            "```first := bookings[1:3]```",
            "That's elements at index 1 and 2 — two of them. The half-open range (`high` excluded) is the same convention Swift uses for `..<`.",
          ],
        },
        {
          type: "code",
          title: "playground/slicing.go",
          source: String.raw`package main

import "fmt"

func main() {
	durations := []int{30, 45, 60, 90}

	fmt.Println(len(durations)) // 4
	fmt.Println(durations[1:3]) // [45 60] — index 1 and 2, not 3

	// The zero value of a slice is nil: usable, len 0, ready to append.
	var pending []string
	fmt.Println(pending == nil) // true
	fmt.Println(len(pending))   // 0
	pending = append(pending, "walk-1")
	fmt.Println(pending)        // [walk-1]
}`,
          caption: "`s[1:3]` is a half-open window (high index excluded). A slice you never initialized is `nil` — but a nil slice is perfectly usable: `len` is 0 and you can `append` straight to it.",
        },
        {
          type: "quiz",
          q: "What is the zero value of a `[]string` you declared but never assigned, e.g. `var names []string`?",
          choices: [
            "nil — but it still works: len is 0 and you can append to it directly",
            "An empty array of length 3",
            "A runtime crash the moment you touch it",
            "The string \"\"",
          ],
          answer: 0,
          explain: "An unassigned slice is `nil`. Unlike some languages, that's not a trap here — a nil slice has length 0 and you can `append` to it immediately. So you rarely need to write `[]string{}` explicitly just to start empty.",
          nudge: "Go slices default to something, and appending to that default is allowed. What's the name for 'no backing array yet'?",
        },
        {
          type: "exercise",
          title: "Build a roster and add to it",
          prompt: [
            "Inside `main`, create a `[]string` named `names` holding `\"Mochi\"` and `\"Biscuit\"` with a slice literal. Then `append` `\"Cocoa\"` to it, assigning the result back to `names`.",
          ],
          starter: String.raw`package main

import "fmt"

func main() {
	// your code here
	fmt.Println(names)
}`,
          solution: String.raw`package main

import "fmt"

func main() {
	names := []string{"Mochi", "Biscuit"}
	names = append(names, "Cocoa")
	fmt.Println(names)
}`,
          checks: [
            { re: /names:=\[\]string\{/, hint: "Start with a slice literal: `names := []string{ ... }` — empty brackets mean 'slice', not a fixed array." },
            { re: /"Mochi","Biscuit"/, hint: "Put both starting names inside the braces, comma-separated: `{\"Mochi\", \"Biscuit\"}`." },
            { re: /names=append\(names,"Cocoa"\)/, hint: "Grow it and assign back: `names = append(names, \"Cocoa\")`. The `names =` on the left is required." },
          ],
          mustNot: [
            { re: /\[2\]string/, hint: "Use a slice `[]string`, not a fixed-size array `[2]string` — you need it to grow." },
          ],
          success: "That's the slice you'll build a walker roster from — declare with a literal, grow with append.",
        },
      ],
    },
    {
      id: "maps",
      title: "Maps",
      steps: [
        {
          type: "text",
          md: [
            "## Looking things up by key",
            "A slice is great for an *ordered list*. But often you want to look something up by a **key**: the rating for a given walker ID, the price for a given duration. That's a **map** — Go's dictionary.",
            "The type spells out both halves: `map[KeyType]ValueType`.",
            "- `map[string]int` — string keys, int values (walker ID → rating).\n- `map[int]int` — int keys, int values (duration in minutes → price in cents).",
            "> This is Swift's `Dictionary<Key, Value>` — same idea, terser syntax. Keys are unique; assigning to an existing key overwrites it.",
          ],
        },
        {
          type: "code",
          title: "playground/maps.go",
          source: String.raw`package main

import "fmt"

func main() {
	// A map literal: type, then key: value pairs.
	prices := map[int]int{
		30: 1800, // 30 min -> $18.00
		45: 2500,
		60: 3200,
	}

	fmt.Println(prices[30]) // 1800 — read by key
	prices[90] = 4500       // write a new pair
	fmt.Println(len(prices)) // 4
}`,
          caption: "Prices in cents, keyed by duration. Read with `prices[key]`, write with `prices[key] = value`. `len` counts the pairs.",
        },
        {
          type: "text",
          md: [
            "## The missing-key trap, and the comma-ok fix",
            "Reading a key that isn't in the map does **not** crash — it hands back the value type's *zero value*. For `map[int]int` that's `0`. So `prices[999]` returns `0`, and you can't tell \"the price is zero\" from \"there's no such duration.\"",
            "Go's answer is the **comma-ok idiom** — the read can return a second boolean telling you whether the key was actually present:",
            "```price, ok := prices[45]```",
            "Now `ok` is `true` if `45` was a real key, `false` if you got the zero value by default. This pattern shows up everywhere in Go.",
          ],
        },
        {
          type: "quiz",
          q: "For `prices := map[int]int{30: 1800}`, what does `v, ok := prices[45]` give you?",
          choices: [
            "v is 0 and ok is false — 45 isn't a key, so you get the zero value plus a 'not found' signal",
            "It panics because 45 is missing",
            "v is 45 and ok is true",
            "v is nil and ok is nil",
          ],
          answer: 0,
          explain: "A missing key returns the value type's zero value (`0` for `int`) and never panics. The comma-ok form adds `ok`, which is `false` here — that's how you distinguish 'stored a real 0' from 'key absent'.",
          nudge: "Reading a missing key is safe in Go. What number does an `int` default to, and what does `ok` report?",
        },
        {
          type: "text",
          md: [
            "## Deleting and iterating",
            "Remove a pair with the built-in **`delete`**: `delete(prices, 45)`. Deleting a key that isn't there is a harmless no-op.",
            "Walk over every pair with `range` (you'll go deep on `range` next lesson):",
            "```for duration, cents := range prices {\n    fmt.Println(duration, cents)\n}```",
            "> One catch worth knowing now: map iteration order is **random** in Go, on purpose. Never rely on the order pairs come out.",
          ],
        },
        {
          type: "code",
          title: "playground/mapops.go",
          source: String.raw`package main

import "fmt"

func main() {
	ratings := map[string]int{"w-1": 5, "w-2": 4}

	ratings["w-3"] = 3
	delete(ratings, "w-2")

	if r, ok := ratings["w-1"]; ok {
		fmt.Println("w-1 rating:", r)
	}
	fmt.Println(len(ratings)) // 2
}`,
          caption: "Write, `delete`, then a comma-ok read guarded by `if`. Declaring `r, ok :=` inside the `if` is idiomatic Go — the values live only inside that block.",
        },
        {
          type: "exercise",
          title: "Price lookup by duration",
          prompt: [
            "Inside `main`, create a `map[int]int` named `prices` with a literal mapping `30` to `1800` and `60` to `3200`. Then read the 30-minute price with the comma-ok form into `price, ok`.",
          ],
          starter: String.raw`package main

import "fmt"

func main() {
	// your code here
	fmt.Println(price, ok)
}`,
          solution: String.raw`package main

import "fmt"

func main() {
	prices := map[int]int{30: 1800, 60: 3200}
	price, ok := prices[30]
	fmt.Println(price, ok)
}`,
          checks: [
            { re: /prices:=map\[int\]int\{/, hint: "Declare it with a map literal: `prices := map[int]int{ ... }` — key type in brackets, value type after." },
            { re: /30:1800/, hint: "Inside the braces use `key: value` pairs, e.g. `30: 1800`." },
            { re: /price,ok:=prices\[30\]/, hint: "Use the comma-ok read: `price, ok := prices[30]` — the second variable tells you if the key was present." },
          ],
          mustNot: [
            { re: /map\[string\]/, hint: "The keys are durations (ints), so the type is `map[int]int`, not `map[string]...`." },
          ],
          success: "That comma-ok read is exactly how the booking service will look up a price and reject an unknown duration.",
        },
      ],
    },
    {
      id: "range-strings",
      title: "Ranging & strings",
      steps: [
        {
          type: "text",
          md: [
            "## One loop keyword to walk anything",
            "Go has exactly one loop keyword — `for` — and its `range` form walks slices, maps, and strings. Over a **slice**, `range` gives you two things each turn: the **index** and a **copy of the value**.",
            "```for i, name := range names {\n    fmt.Println(i, name)\n}```",
            "Over a **map**, `range` gives the **key** and the **value** instead (order random, as you saw):",
            "```for id, rating := range ratings {\n    fmt.Println(id, rating)\n}```",
          ],
        },
        {
          type: "text",
          md: [
            "## The blank identifier `_`",
            "Go refuses to compile if you declare a variable and never use it. But often you want the value and not the index. The **blank identifier `_`** is the escape hatch — it says \"range gives me this, and I'm deliberately throwing it away\":",
            "```for _, name := range names {\n    fmt.Println(name) // index ignored\n}```",
            "> `_` isn't a variable you can read back — it's a black hole. Use it any time Go hands you something you don't need.",
          ],
        },
        {
          type: "quiz",
          q: "You're ranging a `[]string` and only want each name, not its position. What's the idiomatic first variable?",
          choices: [
            "_ — the blank identifier, e.g. `for _, name := range names`",
            "nil, e.g. `for nil, name := range names`",
            "Nothing — `for name := range names` gives the value",
            "You must declare `i` and add a fake use of it",
          ],
          answer: 0,
          explain: "`_` discards the index so Go doesn't complain about an unused variable. Note the trap in choice 3: `for name := range names` gives you the *index*, not the value — the single-variable form over a slice is the position.",
          nudge: "Go won't let an unused variable slide. What single character means 'throw this one away'?",
        },
        {
          type: "text",
          md: [
            "## Strings: bytes vs runes",
            "A Go string is really a read-only sequence of **bytes**. For plain ASCII (`\"Mochi\"`) that's one byte per character and `len(\"Mochi\")` is `5`. But a character like `é` or an emoji takes *several* bytes, so `len` counts **bytes, not characters**.",
            "When you `range` a string, Go does the smart thing: it decodes one **rune** (Unicode character) at a time, giving you the **byte index** and the **rune**:",
            "```for i, r := range \"Mögen\" {\n    fmt.Println(i, r) // i jumps by 2 across the ö\n}```",
            "So `len(s)` is the byte count, but ranging a string counts real characters. For a dog name like `\"Åke\"`, `len` is 4 but ranging yields 3 runes.",
          ],
        },
        {
          type: "code",
          title: "playground/strings.go",
          source: String.raw`package main

import "fmt"

func main() {
	name := "Mochi"
	fmt.Println(len(name)) // 5 bytes (all ASCII here)

	count := 0
	for i, r := range name {
		fmt.Println(i, string(r)) // byte index, then the character
		count++
	}
	fmt.Println(count) // 5 runes
}`,
          caption: "`len` reports bytes; ranging a string yields `(byteIndex, rune)` and counts real characters. `string(r)` turns a single rune back into a printable string.",
        },
        {
          type: "quiz",
          q: "For a name with an accented letter, `len(name)` is 6 but `for i, r := range name` runs 5 times. Why?",
          choices: [
            "len counts bytes; ranging a string decodes runes (characters), and the accented letter is 2 bytes",
            "One of the characters is invisible and gets skipped",
            "range always runs one fewer time than len",
            "The name has a trailing space that len counts",
          ],
          answer: 0,
          explain: "`len` on a string is the raw byte count. Ranging decodes UTF-8 into runes, so a 2-byte accented character counts as one turn of the loop but two toward `len`. That's why 6 bytes can be 5 characters.",
          nudge: "Two different units are being counted. What does `len` measure, and what does `range` hand you each turn?",
        },
        {
          type: "exercise",
          title: "Sum the day's prices",
          prompt: [
            "You have `prices := []int{1800, 2500, 3200}` and `total := 0`. Range over `prices`, ignoring the index with `_`, and add each price `p` to `total` with `total += p`.",
          ],
          starter: String.raw`package main

import "fmt"

func main() {
	prices := []int{1800, 2500, 3200}
	total := 0
	// your code here
	fmt.Println(total)
}`,
          solution: String.raw`package main

import "fmt"

func main() {
	prices := []int{1800, 2500, 3200}
	total := 0
	for _, p := range prices {
		total += p
	}
	fmt.Println(total)
}`,
          checks: [
            { re: /for _,p:=range prices\{/, hint: "Range with the index discarded: `for _, p := range prices {` — `_` throws away the position." },
            { re: /total\+=p/, hint: "Accumulate each price: `total += p` inside the loop body." },
          ],
          mustNot: [
            { re: /for i,p:=range/, hint: "You don't use the index here, so discard it with `_` instead of naming it `i` — an unused `i` won't compile." },
          ],
          success: "That's the shape of every total in the backend — range the list, discard the index, add as you go.",
        },
      ],
    },
  ],
});
