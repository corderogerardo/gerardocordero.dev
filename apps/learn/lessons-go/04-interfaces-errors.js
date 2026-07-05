window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "go-interfaces-errors",
  title: "Interfaces & Errors",
  emoji: "🔌",
  lang: "go",
  lessons: [
    {
      id: "interfaces",
      title: "Interfaces",
      steps: [
        {
          type: "text",
          md: [
            "## A contract, not a class",
            "You have structs (`Walker`, `Booking`) and methods hanging off them. An **interface** is the next idea: a named list of method signatures — a *contract*. Anything that has those methods **satisfies** the interface, and can be used wherever that interface is expected.",
            "In Swift you'd write a `protocol` and then say `struct Walker: Pricer`. Go is different in one big way, and it's the thing to internalize this lesson: there is **no `implements` keyword**. You never declare that a type satisfies an interface. If the type has the methods, it satisfies it — automatically, silently, everywhere.",
            "> This is called **structural** or **implicit** satisfaction. The interface describes a shape; any type of that shape fits.",
          ],
        },
        {
          type: "code",
          title: "playground/pricer.go",
          source: String.raw`package main

import "fmt"

// A Pricer is anything that can label its own price.
type Pricer interface {
	PriceLabel() string
}

type Walker struct {
	Name               string
	PricePer30MinCents int
}

// Walker has a PriceLabel() string method, so Walker satisfies Pricer.
// We never wrote "Walker implements Pricer" anywhere.
func (w Walker) PriceLabel() string {
	return fmt.Sprintf("$%d / 30 min", w.PricePer30MinCents/100)
}

func main() {
	var p Pricer = Walker{Name: "Mochi", PricePer30MinCents: 2500}
	fmt.Println(p.PriceLabel())
}`,
          caption: "`var p Pricer = Walker{...}` only compiles because Walker has the one method Pricer asks for. Add a second type with a PriceLabel() and it fits the same slot for free.",
        },
        {
          type: "text",
          md: [
            "## Why this matters",
            "Because satisfaction is implicit, you can write a function against an **interface** and it works with any type — including types written later, or in other packages, that you never anticipated.",
            "A function that takes a `Pricer` doesn't care whether it got a `Walker`, a `Sitter`, or a `Groomer`. It only knows: *this thing can tell me its price label.* That's the whole point — code depends on **behavior**, not on concrete types.",
          ],
        },
        {
          type: "code",
          title: "playground/print.go",
          source: String.raw`// printPrice works for ANY Pricer, present or future.
func printPrice(p Pricer) {
	fmt.Println("Price:", p.PriceLabel())
}

type Sitter struct {
	NightlyCents int
}

func (s Sitter) PriceLabel() string {
	return fmt.Sprintf("$%d / night", s.NightlyCents/100)
}

// Both calls compile: each type has PriceLabel() string.
// printPrice(Walker{PricePer30MinCents: 2500})
// printPrice(Sitter{NightlyCents: 6000})`,
          caption: "One function, many types. Sitter was added without touching printPrice or Pricer — implicit satisfaction is what makes that painless.",
        },
        {
          type: "text",
          md: [
            "## Two things you'll meet constantly",
            "**`Stringer`** — the standard library's most famous interface. It's just `String() string`. If your type has a `String() string` method, `fmt.Println(x)` automatically uses it. That's how you give a type a nice human-readable form.",
            "**`any`** (a.k.a. `interface{}`) — the *empty* interface. It lists **zero** methods, so **every** type satisfies it. `any` means \"literally anything.\" It's Go's escape hatch (like Swift's `Any`), useful but weak — you lose all type information. Reach for a small, specific interface first; use `any` only when you truly mean \"any value.\"",
            "> **Small interfaces are better.** Go's culture prizes one- or two-method interfaces (`Stringer`, `io.Reader`). The smaller the contract, the more types can satisfy it and the easier your code is to reuse.",
          ],
        },
        {
          type: "quiz",
          q: "You define `type Pricer interface { PriceLabel() string }`, then write a `Sitter` struct with a `PriceLabel() string` method. What must you add so `Sitter` satisfies `Pricer`?",
          choices: [
            "Nothing — having the PriceLabel() string method is enough; satisfaction is implicit",
            "A line `type Sitter implements Pricer`",
            "`Sitter: Pricer` in the struct declaration",
            "A call to `register(Sitter{}, Pricer)` at startup",
          ],
          answer: 0,
          explain: "Go has no `implements` keyword. Because `Sitter` has the exact method the interface lists, it satisfies `Pricer` automatically — you can pass a `Sitter` anywhere a `Pricer` is wanted, with no declaration connecting them.",
          nudge: "Reread how `Walker` became a `Pricer`. Did any code say the two were related?",
        },
        {
          type: "exercise",
          title: "Define an interface and satisfy it",
          prompt: [
            "Two jobs. First declare an interface `Pricer` with one method, `PriceLabel() string`. Then give `Walker` a `PriceLabel() string` method that returns a dollar label using `fmt.Sprintf`. Because the method matches the interface, `Walker` will satisfy `Pricer` with no other wiring.",
            "Return `fmt.Sprintf(\"$%d / 30 min\", w.PricePer30MinCents/100)` from the method.",
          ],
          starter: String.raw`package main

import "fmt"

type Walker struct {
	Name               string
	PricePer30MinCents int
}

// your code here: define Pricer, then a PriceLabel method on Walker

func main() {
	var p Pricer = Walker{Name: "Mochi", PricePer30MinCents: 2500}
	fmt.Println(p.PriceLabel())
}`,
          solution: String.raw`package main

import "fmt"

type Walker struct {
	Name               string
	PricePer30MinCents int
}

type Pricer interface {
	PriceLabel() string
}

func (w Walker) PriceLabel() string {
	return fmt.Sprintf("$%d / 30 min", w.PricePer30MinCents/100)
}

func main() {
	var p Pricer = Walker{Name: "Mochi", PricePer30MinCents: 2500}
	fmt.Println(p.PriceLabel())
}`,
          checks: [
            { re: /type Pricer interface\{/, hint: "Declare the interface with `type Pricer interface { ... }`. The body lists method signatures, no bodies." },
            { re: /PriceLabel\(\)string/, hint: "The interface's one method is `PriceLabel() string` — a name, empty parens, and the return type `string`." },
            { re: /func\(w Walker\)PriceLabel\(\)string\{/, hint: "Attach the method to Walker with a receiver: `func (w Walker) PriceLabel() string {`." },
            { re: /PricePer30MinCents\/100/, hint: "Convert cents to dollars by dividing: `w.PricePer30MinCents / 100` inside the Sprintf." },
          ],
          success: "You defined a contract and satisfied it — with zero `implements` boilerplate. `var p Pricer = Walker{...}` compiles purely because Walker has the method the interface names.",
        },
      ],
    },
    {
      id: "errors",
      title: "Errors",
      steps: [
        {
          type: "text",
          md: [
            "## An error is a value",
            "Swift throws. Go does not. In Go, an error is an ordinary **value** you return alongside your result — there is no `try`/`catch`, no stack unwinding for the everyday case. A function that might fail returns **two** things: the result *and* an error.",
            "The convention is ironclad: the error is the **last** return value, and its type is the built-in interface `error`. When everything worked, the error is `nil`. When something went wrong, it's a non-`nil` error describing what.",
            "> `error` is itself just an interface — one method, `Error() string`. Anything that can describe itself as a string is an error. (Yes, this is exactly the interface idea from Lesson 1.)",
          ],
        },
        {
          type: "code",
          title: "playground/duration.go",
          source: String.raw`package main

import (
	"errors"
	"fmt"
)

// Returns (result, error). error is always the last return.
func parseDuration(minutes int) (int, error) {
	if minutes <= 0 {
		return 0, errors.New("duration must be positive")
	}
	return minutes, nil
}

func main() {
	d, err := parseDuration(30)
	if err != nil {
		fmt.Println("bad input:", err)
		return
	}
	fmt.Println("booked for", d, "minutes")
}`,
          caption: "The caller gets two values and checks the error first. On success the error is `nil`; the code that uses `d` runs only after we know there was no error.",
        },
        {
          type: "text",
          md: [
            "## Making errors",
            "Two functions cover almost everything:",
            "- **`errors.New(\"walker not found\")`** — the simplest error: a fixed message. Import the `errors` package.\n- **`fmt.Errorf(\"parsing id %d: %w\", id, err)`** — a *formatted* error. Like `Printf`, but it returns an error. The special verb **`%w`** *wraps* another error inside the new one, so the original is still reachable later (you'll use that next lesson).",
            "Use `errors.New` for a plain message; use `fmt.Errorf` when you want to add context (an id, a field name) or wrap a lower-level error with `%w`.",
          ],
        },
        {
          type: "code",
          title: "playground/wrap.go",
          source: String.raw`// %w wraps the underlying error, adding context without hiding it.
func loadConfig(path string) error {
	err := readFile(path)
	if err != nil {
		return fmt.Errorf("loading config from %s: %w", path, err)
	}
	return nil
}

// The message becomes e.g. "loading config from app.env: file not found",
// and the original "file not found" is still recoverable from the wrapper.`,
          caption: "`%w` is the wrapping verb — it keeps the original error chained inside the new one. `%s` or `%v` would only paste the text and lose the chain.",
        },
        {
          type: "quiz",
          q: "In Go, how does a function report that it failed to find a walker?",
          choices: [
            "It returns an `error` value as its last result; the caller checks `if err != nil`",
            "It throws an exception the caller catches with `try`/`catch`",
            "It sets a global `lastError` variable",
            "It returns `nil` and prints the problem to the console",
          ],
          answer: 0,
          explain: "Errors in Go are values returned alongside the result — the error is the last return, and callers inspect it with `if err != nil`. There is no exception mechanism for ordinary failures; the error path is written out explicitly.",
          nudge: "Go has no `try`/`catch`. How did `parseDuration` tell its caller something went wrong?",
        },
        {
          type: "exercise",
          title: "Return an error when the walker is missing",
          prompt: [
            "Finish `findWalker`. It looks a walker up in a map. If the id isn't present, return a zero `Walker{}` and `errors.New(\"walker not found\")`. If it is present, return the walker and `nil`.",
            "The signature is `func findWalker(id string) (Walker, error)` — result first, error last.",
          ],
          starter: String.raw`package main

import (
	"errors"
	"fmt"
)

type Walker struct {
	ID   string
	Name string
}

func findWalker(id string) (Walker, error) {
	walkers := map[string]Walker{
		"w1": {ID: "w1", Name: "Mochi"},
	}
	w, ok := walkers[id]
	// your code here: return an error if !ok, otherwise return w, nil
}

func main() {
	w, err := findWalker("w9")
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(w.Name)
}`,
          solution: String.raw`package main

import (
	"errors"
	"fmt"
)

type Walker struct {
	ID   string
	Name string
}

func findWalker(id string) (Walker, error) {
	walkers := map[string]Walker{
		"w1": {ID: "w1", Name: "Mochi"},
	}
	w, ok := walkers[id]
	if !ok {
		return Walker{}, errors.New("walker not found")
	}
	return w, nil
}

func main() {
	w, err := findWalker("w9")
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(w.Name)
}`,
          checks: [
            { re: /if!ok\{/, hint: "The map lookup gave you `ok`. Branch on the missing case with `if !ok {`." },
            { re: /return Walker\{\},errors\.New\("walker not found"\)/, hint: "On the missing path return a zero value and the error: `return Walker{}, errors.New(\"walker not found\")`." },
            { re: /return w,nil/, hint: "On success return the found walker and a nil error: `return w, nil`." },
          ],
          success: "That's the Go error contract in miniature: the value on success, a non-nil `error` on failure, and the error carried as the last return.",
        },
      ],
    },
    {
      id: "error-patterns",
      title: "Error handling patterns",
      steps: [
        {
          type: "text",
          md: [
            "## The idiom you'll type a thousand times",
            "Because errors are values, handling them is just an `if`. The Go program is dotted with this exact block:",
            "```\nresult, err := doSomething()\nif err != nil {\n    return result, err\n}\n```",
            "It looks repetitive, and it is — deliberately. Every failure is visible at the point it happens; nothing is hidden in an invisible `throw`. Reading a Go function top to bottom, you see every place it can bail out. That explicitness is the trade Go makes on purpose.",
          ],
        },
        {
          type: "text",
          md: [
            "## Add context as it goes up",
            "Returning the raw `err` is fine, but often you want to say *where* it failed. That's `fmt.Errorf` with **`%w`** — wrap the error with a bit of context and keep passing it up:",
            "```\nif err != nil {\n    return Walker{}, fmt.Errorf(\"loading walker: %w\", err)\n}\n```",
            "Now the top of the program sees a message like `loading walker: not found` — a breadcrumb trail — while the original error stays wrapped inside, still inspectable. Wrap with `%w` at each layer that adds meaning.",
          ],
        },
        {
          type: "text",
          md: [
            "## Sentinel errors, and checking for them",
            "Sometimes callers need to react to a *specific* error — \"if it was **not found**, show a 404; otherwise it's a 500.\" For that you define a **sentinel**: a package-level error variable, by convention named `ErrSomething`.",
            "```\nvar ErrNotFound = errors.New(\"not found\")\n```",
            "To test whether an error *is* that sentinel — even after it's been wrapped with `%w` — use **`errors.Is`**. It unwraps the chain for you:",
            "- **`errors.Is(err, ErrNotFound)`** — \"is this error, or anything it wraps, the ErrNotFound sentinel?\" Returns a bool.\n- **`errors.As(err, &target)`** — the sibling for *custom error types*: it checks the chain for an error of a particular type and, if found, fills `target` so you can read its fields. Use `Is` to match a value, `As` to extract a type.",
            "> Never compare error messages with `==` on strings. Use `errors.Is` / `errors.As` — they see through wrapping, string comparison doesn't.",
          ],
        },
        {
          type: "text",
          md: [
            "## What about panic?",
            "Go does have `panic` (and `recover`), which *does* unwind the stack like an exception. But it is **not** for ordinary failures. A walker not being found, bad input, a network blip — those are **errors**, returned as values. `panic` is reserved for truly unrecoverable situations: a bug that means the program can't sensibly continue (an impossible state, a nil pointer you never guarded).",
            "> Rule of thumb: if a reasonable caller could plausibly handle it, return an `error`. Only `panic` when there's no sane way forward.",
          ],
        },
        {
          type: "quiz",
          q: "An error was created as `ErrNotFound` deep down, then wrapped on the way up with `fmt.Errorf(\"loading walker: %w\", err)`. How do you reliably detect it at the top?",
          choices: [
            "`errors.Is(err, ErrNotFound)` — it unwraps the `%w` chain and matches the sentinel",
            "`err == ErrNotFound` — direct equality still works after wrapping",
            "`err.Error() == \"not found\"` — compare the message strings",
            "You can't; wrapping with `%w` permanently hides the original error",
          ],
          answer: 0,
          explain: "`%w` keeps the original error wrapped inside, and `errors.Is` walks that chain, so it finds `ErrNotFound` even under layers of context. Direct `==` fails because the top-level value is the wrapper, and string comparison is brittle — always use `errors.Is`.",
          nudge: "After `%w` wraps it, the outer value is the wrapper, not the sentinel. Which function looks *through* the wrapping?",
        },
        {
          type: "exercise",
          title: "Wrap an error and check for a sentinel",
          prompt: [
            "Two small edits. In `loadWalker`, when `findWalker` fails, return a zero walker and the error wrapped with context: `fmt.Errorf(\"loading walker: %w\", err)`. Then in `main`, branch on the sentinel with `errors.Is(err, ErrNotFound)`.",
            "The `%w` verb preserves `ErrNotFound` inside the wrapper, which is exactly why `errors.Is` can still find it.",
          ],
          starter: String.raw`package main

import (
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("not found")

type Walker struct {
	ID string
}

func findWalker(id string) (Walker, error) {
	if id == "" {
		return Walker{}, ErrNotFound
	}
	return Walker{ID: id}, nil
}

func loadWalker(id string) (Walker, error) {
	w, err := findWalker(id)
	if err != nil {
		// your code here: return a zero Walker and the error wrapped with fmt.Errorf and %w
	}
	return w, nil
}

func main() {
	_, err := loadWalker("")
	// your code here: if errors.Is(err, ErrNotFound), print a friendly message
	fmt.Println(err)
}`,
          solution: String.raw`package main

import (
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("not found")

type Walker struct {
	ID string
}

func findWalker(id string) (Walker, error) {
	if id == "" {
		return Walker{}, ErrNotFound
	}
	return Walker{ID: id}, nil
}

func loadWalker(id string) (Walker, error) {
	w, err := findWalker(id)
	if err != nil {
		return Walker{}, fmt.Errorf("loading walker: %w", err)
	}
	return w, nil
}

func main() {
	_, err := loadWalker("")
	if errors.Is(err, ErrNotFound) {
		fmt.Println("no such walker")
	}
	fmt.Println(err)
}`,
          checks: [
            { re: /fmt\.Errorf\("loading walker:%w",err\)/, hint: "Wrap with context and the `%w` verb: `fmt.Errorf(\"loading walker: %w\", err)`. `%w` keeps the original error reachable." },
            { re: /errors\.Is\(err,ErrNotFound\)/, hint: "Match the sentinel through the wrapping with `errors.Is(err, ErrNotFound)`." },
            { re: /return Walker\{\},fmt\.Errorf/, hint: "On the failure path return a zero value and the wrapped error: `return Walker{}, fmt.Errorf(...)`." },
          ],
          success: "You wrapped an error with context and still matched the sentinel through the wrap — the core Go error-handling loop, exactly as the real backend does it.",
        },
      ],
    },
  ],
});
