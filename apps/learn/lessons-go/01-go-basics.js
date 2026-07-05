window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "go-basics",
  title: "Go Basics",
  emoji: "🔤",
  lang: "go",
  lessons: [
    {
      id: "variables",
      title: "Variables & constants",
      steps: [
        {
          type: "text",
          md: [
            "## Two ways to name a value",
            "In Swift you reached for `let` (can't change) and `var` (can). Go has the same idea but different spelling, and it leans on **type inference** even harder.",
            "- **`var name string = \"Mochi\"`** — the long form. Spell the type, or drop it and let Go infer.\n- **`name := \"Mochi\"`** — the short form. `:=` **declares and infers** in one move. This is Go's `let name = \"Mochi\"`, and it's what you'll write nearly all the time *inside a function*.",
            "The catch: `:=` only works inside a function. At the top level of a file (package scope) you must use `var` or `const`. Everywhere else, `:=` is the idiom.",
          ],
        },
        {
          type: "code",
          title: "playground/main.go",
          source: String.raw`package main

import "fmt"

func main() {
	var walkerName string = "Mochi"
	pricePer30MinCents := 1800
	var available bool

	fmt.Println(walkerName, pricePer30MinCents, available)
}`,
          caption: "Three declarations, three styles. `walkerName` spells its type, `pricePer30MinCents` infers `int` from `1800`, and `available` gets no value at all — watch what Go does with that next.",
        },
        {
          type: "quiz",
          q: "You write `var available bool` and never assign it. What is `available`?",
          choices: [
            "`false` — Go initializes it to the type's zero value",
            "`nil`",
            "undefined — reading it is a compile error",
            "a random true or false",
          ],
          answer: 0,
          explain: "Go has no uninitialized variables. Every type has a **zero value**: `0` for numbers, `\"\"` for strings, `false` for bools, and `nil` for pointers, slices, and maps. `var available bool` is already `false` — no surprises, no garbage memory.",
          nudge: "Go never leaves a variable holding garbage. What's the natural 'empty' value for a bool?",
        },
        {
          type: "text",
          md: [
            "## Zero values and constants",
            "Because every type has a **zero value**, `var count int` is `0`, `var name string` is `\"\"`, and `var w *Walker` is `nil`. You'll design around this a lot — an empty booking list is just the zero value of a slice, not a special case you have to check for.",
            "For values that never change, use **`const`**. Constants are set at compile time, so they can't hold anything computed at runtime (no function calls, no slices):",
            "```const maxWalkers = 20```",
            "When you have a run of related integer constants, **`iota`** numbers them for you — it starts at `0` in a `const (...)` block and counts up each line. It's Go's tidy way to build enum-like values.",
          ],
        },
        {
          type: "code",
          title: "playground/status.go",
          source: String.raw`package main

import "fmt"

const maxWalkers = 20

type Status int

const (
	Pending Status = iota
	Confirmed
	Completed
)

func main() {
	fmt.Println(maxWalkers, Pending, Confirmed, Completed)
}`,
          caption: "Prints `20 0 1 2`. `iota` gives `Pending` the value 0, then each following line increments automatically — so `Confirmed` is 1 and `Completed` is 2. Change the order and the numbers follow.",
        },
        {
          type: "quiz",
          q: "Where can you use the short declaration `:=`?",
          choices: [
            "Only inside a function body",
            "Anywhere, including at the top (package) level of a file",
            "Only when declaring constants",
            "Only for string values",
          ],
          answer: 0,
          explain: "`:=` is function-scoped. At package level — the top of the file, outside any function — you must use `var` or `const` with an explicit keyword. Inside a function, `:=` is the everyday choice.",
          nudge: "One of these declarations needs an explicit keyword when it lives at the top of the file.",
        },
        {
          type: "exercise",
          title: "Declare a walker",
          prompt: [
            "Inside `main`, use `:=` to declare `walkerName` as `\"Mochi\"` and `pricePer30MinCents` as `1800`. Above `main`... actually keep it simple: also add a package-level `const maxWalkers = 20` — put it right inside `main` is fine too. Declare all three.",
            "Use `:=` for the two variables and `const` for `maxWalkers`.",
          ],
          starter: String.raw`package main

import "fmt"

func main() {
	// your code here

	fmt.Println(walkerName, pricePer30MinCents, maxWalkers)
}`,
          solution: String.raw`package main

import "fmt"

func main() {
	const maxWalkers = 20
	walkerName := "Mochi"
	pricePer30MinCents := 1800

	fmt.Println(walkerName, pricePer30MinCents, maxWalkers)
}`,
          checks: [
            { re: /walkerName:="Mochi"/, hint: "Declare the name with the short form: `walkerName := \"Mochi\"` — no `var`, no type." },
            { re: /pricePer30MinCents:=1800/, hint: "Prices live in cents. Declare `pricePer30MinCents := 1800` with `:=`." },
            { re: /const maxWalkers=20/, hint: "A value that never changes wants `const` — `const maxWalkers = 20`." },
          ],
          mustNot: [
            { re: /var walkerName/, hint: "Inside a function, prefer `:=` over `var walkerName string = ...` — it's the idiomatic short form." },
          ],
          success: "That's Go's declaration toolkit: `:=` for locals you infer, `const` for values fixed at compile time. Zero values cover the rest.",
        },
      ],
    },
    {
      id: "functions",
      title: "Functions",
      steps: [
        {
          type: "text",
          md: [
            "## `func`, with types after the names",
            "A Go function starts with `func`, then the name, then parameters, then the return type. The twist coming from Swift: **the type comes after the name**, both for parameters and for the return.",
            "- Swift: `func greet(name: String) -> String`\n- Go: `func greet(name string) string`",
            "No `->`, no argument labels, no `String` with a capital S. Just `name string`, then the return type sitting bare after the parameter list.",
          ],
        },
        {
          type: "code",
          title: "playground/greet.go",
          source: String.raw`package main

import "fmt"

func greet(name string) string {
	return fmt.Sprintf("Welcome, %s", name)
}

func main() {
	fmt.Println(greet("Mochi"))
}`,
          caption: "`fmt.Sprintf` is Go's string formatter — `%s` slots in a string, `%d` an integer. It *returns* the built string instead of printing it, which is exactly what a function like this wants.",
        },
        {
          type: "quiz",
          q: "In `func priceLabel(cents int) string`, what does the bare `string` at the end mean?",
          choices: [
            "The function returns a `string`",
            "There is a second parameter named `string`",
            "The function is named `string`",
            "It's a type alias for `cents`",
          ],
          answer: 0,
          explain: "The type after the parameter list is the **return type**. `func priceLabel(cents int) string` takes one `int` and returns one `string`. No `->` needed — Go just puts the return type there.",
          nudge: "Everything after the closing `)` and before the `{` describes what comes back out.",
        },
        {
          type: "text",
          md: [
            "## Go's signature move: multiple return values",
            "This is the one that surprises everyone. A Go function can return **more than one value**, and the language leans on it constantly — especially the pair `(result, error)`.",
            "```func bookingPrice(minutes int) (int, error)```",
            "That returns *both* an `int` and an `error`. The caller receives both: `cents, err := bookingPrice(30)`. If `err` is `nil`, the call succeeded and `cents` is good. If `err` is set, something went wrong. This is how Go does error handling — no exceptions, just an extra return value you're expected to check.",
          ],
        },
        {
          type: "code",
          title: "playground/price.go",
          source: String.raw`package main

import (
	"errors"
	"fmt"
)

func bookingPrice(minutes int) (int, error) {
	switch minutes {
	case 30:
		return 1800, nil
	case 60:
		return 3200, nil
	}
	return 0, errors.New("unsupported duration")
}

func main() {
	cents, err := bookingPrice(30)
	if err != nil {
		fmt.Println("error:", err)
		return
	}
	fmt.Println("price:", cents)
}
`,
          caption: "Two return values, comma-separated in the signature `(int, error)` and comma-separated in every `return`. The caller unpacks them into `cents, err` and checks `err != nil` before trusting `cents`. You'll write this shape hundreds of times.",
        },
        {
          type: "quiz",
          q: "A function is declared `func bookingPrice(minutes int) (int, error)`. How many values does it return?",
          choices: [
            "Two — an `int` and an `error`",
            "One — a single tuple object",
            "Zero — the parentheses mean no return",
            "It depends on how the caller calls it",
          ],
          answer: 0,
          explain: "The `(int, error)` return list declares **two** independent values. The caller writes `cents, err := bookingPrice(30)` to receive both. Returning `(value, error)` is the backbone of Go error handling.",
          nudge: "Count the comma-separated types inside the return parentheses.",
        },
        {
          type: "text",
          md: [
            "## A quick word on named returns",
            "You can *name* the return values in the signature. When you do, they act like pre-declared variables, and a bare `return` sends back their current values:",
            "```func split(total int) (walk int, tip int) {\n    walk = total - 200\n    tip = 200\n    return\n}```",
            "Named returns can make short functions read nicely, but they get confusing in long ones — use them sparingly. Most Go code returns values explicitly, like the `bookingPrice` example above.",
          ],
        },
        {
          type: "exercise",
          title: "Write priceLabel",
          prompt: [
            "Write a function `priceLabel` that takes `cents int` and returns a `string`. It should return `fmt.Sprintf(\"$%d\", cents/100)` — the dollar amount, integer-divided from cents.",
            "Type the whole function, including its signature.",
          ],
          starter: String.raw`package main

import "fmt"

// your code here
`,
          solution: String.raw`package main

import "fmt"

func priceLabel(cents int) string {
	return fmt.Sprintf("$%d", cents/100)
}
`,
          checks: [
            { re: /func priceLabel\(cents int\)string\{/, hint: "Signature first: `func priceLabel(cents int) string {` — parameter type and return type both come after the name." },
            { re: /return fmt\.Sprintf/, hint: "Build the string and hand it back with `return fmt.Sprintf(...)`." },
            { re: /fmt\.Sprintf\("\$%d",cents\/100\)/, hint: "Format the dollars: `fmt.Sprintf(\"$%d\", cents/100)` — `%d` slots in the integer `cents/100`." },
          ],
          mustNot: [
            { re: /fmt\.Println/, hint: "Return the string, don't print it — use `fmt.Sprintf` (which builds a string), not `fmt.Println` (which prints)." },
          ],
          success: "A real Go function: `func`, typed parameter, bare return type, and a `Sprintf` that builds the label. This exact shape shows up all over the PawWalk backend.",
        },
      ],
    },
    {
      id: "control-flow",
      title: "Control flow",
      steps: [
        {
          type: "text",
          md: [
            "## `if`, with an optional head start",
            "Go's `if` looks familiar — but **no parentheses around the condition**, and the braces are required even for one line. The bonus: `if` can run a short **init statement** first, separated by a semicolon:",
            "```if price := minutes * 40; price > 1000 {\n    // price is in scope here (and in the else)\n}```",
            "That declares `price`, then tests it. `price` lives only inside the `if`/`else` — a tidy way to scope a value to exactly where it's used. You'll see this constantly with the `err` pattern: `if err := doThing(); err != nil { ... }`.",
          ],
        },
        {
          type: "code",
          title: "playground/decide.go",
          source: String.raw`package main

import "fmt"

func main() {
	minutes := 45

	if minutes >= 60 {
		fmt.Println("long walk")
	} else if minutes >= 30 {
		fmt.Println("standard walk")
	} else {
		fmt.Println("quick walk")
	}

	if price := minutes * 40; price > 1000 {
		fmt.Println("premium:", price)
	}
}`,
          caption: "No parentheses around the conditions, braces always required. The second `if` declares `price` in its init statement — it exists only inside that `if`.",
        },
        {
          type: "quiz",
          q: "What does the init statement do in `if price := minutes * 40; price > 1000 {`?",
          choices: [
            "Declares `price` scoped to the `if`, then tests the condition after the semicolon",
            "Runs the loop body 1000 times",
            "Declares `price` as a package-level constant",
            "It's a syntax error — Go `if` can't declare variables",
          ],
          answer: 0,
          explain: "The part before the `;` is an init statement — it runs first and its variables are scoped to the `if`/`else`. Then the part after the `;` is the actual condition. It keeps short-lived values like `err` from leaking into the surrounding function.",
          nudge: "The semicolon splits a setup step from the real condition.",
        },
        {
          type: "text",
          md: [
            "## `for` is the only loop",
            "Go threw out `while` and `do-while`. There is exactly **one** loop keyword — `for` — and it wears three hats:",
            "- **C-style:** `for i := 0; i < n; i++ { }` — init, condition, post.\n- **While-style:** `for n < 3 { }` — just a condition, no semicolons. This *is* Go's `while`.\n- **Infinite:** `for { }` — no condition at all; you `break` out when you're done.",
            "There's also `for i, v := range xs { }` for walking a slice or map — you'll meet `range` properly in a later module. One keyword, every loop.",
          ],
        },
        {
          type: "code",
          title: "playground/loops.go",
          source: String.raw`package main

import "fmt"

func main() {
	for i := 0; i < 3; i++ {
		fmt.Println("walk", i)
	}

	n := 0
	for n < 3 {
		n++
	}

	count := 0
	for {
		if count >= 3 {
			break
		}
		count++
	}

	fmt.Println(n, count)
}`,
          caption: "Same keyword, three shapes: a C-style counted loop, a while-style condition loop, and a bare infinite loop that `break`s out. No `while` keyword exists — `for n < 3` is how you write one.",
        },
        {
          type: "quiz",
          q: "How many looping keywords does Go have?",
          choices: [
            "One — `for` covers every kind of loop",
            "Three — `for`, `while`, and `do-while`",
            "Two — `for` and `while`",
            "None — Go uses recursion instead of loops",
          ],
          answer: 0,
          explain: "Go deliberately ships a single loop keyword, `for`. Drop the init and post and it's a `while`; drop everything and it's an infinite loop. Fewer keywords, fewer decisions.",
          nudge: "Go's motto is 'less is more.' How many loop keywords fit that?",
        },
        {
          type: "text",
          md: [
            "## `switch`, without the footguns",
            "Go's `switch` fixes two C annoyances. First, **no automatic fallthrough** — after a matching `case` runs, the switch is done. You never write `break`; you'd write `fallthrough` on the rare occasion you actually want to continue.",
            "Second, you can **switch on nothing**: `switch { case x > 10: ... }` acts like a clean `if`/`else if` chain. And `case` can hold multiple values: `case 30, 45, 60:`.",
          ],
        },
        {
          type: "code",
          title: "playground/switch.go",
          source: String.raw`package main

import "fmt"

func priceForDuration(minutes int) int {
	switch minutes {
	case 30:
		return 1800
	case 45:
		return 2500
	case 60:
		return 3200
	default:
		return 0
	}
}

func label(cents int) string {
	switch {
	case cents == 0:
		return "unknown"
	case cents < 2000:
		return "budget"
	default:
		return "premium"
	}
}

func main() {
	fmt.Println(priceForDuration(45), label(1800))
}`,
          caption: "Left: a `switch` on a value, one `case` per duration, no `break` needed. Right: a `switch` on nothing — a tidy `if`/`else if` chain. `default` catches everything else.",
        },
        {
          type: "quiz",
          q: "After a matching `case` runs in a Go `switch`, what happens by default?",
          choices: [
            "It stops — no fallthrough unless you explicitly write `fallthrough`",
            "It falls through to the next `case`, like C",
            "It loops back to the top of the switch",
            "It returns `nil` automatically",
          ],
          answer: 0,
          explain: "Go breaks out of the switch automatically after a matching case. You never write `break`. On the rare occasion you *want* to continue into the next case, you write the keyword `fallthrough` — but that's unusual.",
          nudge: "Go removes a classic C bug here. Which behavior is the bug-prone one?",
        },
        {
          type: "exercise",
          title: "Price by duration",
          prompt: [
            "Write `func priceForDuration(minutes int) int` that uses a `switch minutes` to return the price in cents: `30` -> `1800`, `45` -> `2500`, `60` -> `3200`, and `default` -> `0`.",
            "Use a `switch`, not a chain of `if` statements.",
          ],
          starter: String.raw`package main

// your code here
`,
          solution: String.raw`package main

func priceForDuration(minutes int) int {
	switch minutes {
	case 30:
		return 1800
	case 45:
		return 2500
	case 60:
		return 3200
	default:
		return 0
	}
}
`,
          checks: [
            { re: /func priceForDuration\(minutes int\)int\{/, hint: "Signature: `func priceForDuration(minutes int) int {` — one `int` in, one `int` out." },
            { re: /switch minutes\{/, hint: "Branch on the value with `switch minutes {`, not a stack of `if`s." },
            { re: /case 30:return 1800/, hint: "Each duration is a `case`: `case 30:` then `return 1800`. Go needs no `break`." },
            { re: /default:return 0/, hint: "Catch everything else with `default:` returning `0`." },
          ],
          mustNot: [
            { re: /if minutes/, hint: "Use a `switch` here, not `if minutes == 30` — that's exactly what `switch` is cleaner for." },
          ],
          success: "A `switch` that maps durations to cents, no `break` anywhere. This is the shape the real booking price logic takes.",
        },
      ],
    },
  ],
});
