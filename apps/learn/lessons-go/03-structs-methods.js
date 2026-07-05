window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "go-structs-methods",
  title: "Structs & Methods",
  emoji: "🏗️",
  lang: "go",
  lessons: [
    {
      id: "structs",
      title: "Structs",
      steps: [
        {
          type: "text",
          md: [
            "## A shape for your data",
            "A PawWalk backend juggles walkers, dogs, bookings, GPS fixes. Each is a little bundle of related fields: a walker has a name and a price; a booking has a walker, a dog, and a time. In Go you describe that bundle with a **struct** — a named type made of fields.",
            "If you did the iOS course, this is the same idea as Swift's `struct Walker { ... }`. Go's version is leaner: no `class` alternative to weigh it against, no inheritance, just fields and (next lesson) methods hung off them.",
          ],
        },
        {
          type: "code",
          title: "internal/walker/walker.go",
          source: String.raw`package walker

type Walker struct {
	ID                 string
	Name               string
	PricePer30MinCents int
}`,
          caption: "`type Walker struct { ... }` defines a new type. Each line is a field: a name and a type. Exported names start with a capital letter (Walker, Name), so other packages can see them — that convention IS Go's access control.",
        },
        {
          type: "text",
          md: [
            "## Building one: literals",
            "Once the type exists, you create values from it with a **struct literal**. Two styles:",
            "- **Keyed** (do this): `Walker{Name: \"Mochi\", PricePer30MinCents: 2500}`. You name each field, so order doesn't matter and you can skip fields.\n- **Positional**: `Walker{\"w1\", \"Mochi\", 2500}` — every field, in declaration order. Brittle: add a field and every positional literal breaks. Avoid it outside tiny throwaway code.",
            "Keyed literals are the Go idiom for exactly the reason positional ones are fragile: they survive the struct growing new fields.",
          ],
        },
        {
          type: "text",
          md: [
            "## The zero value is real, and usable",
            "Declare a struct without a literal and every field gets its type's **zero value** — no `nil`, no crash, no `undefined`:",
            "```",
            "var w Walker   // w.ID == \"\", w.Name == \"\", w.PricePer30MinCents == 0",
            "```",
            "Numbers zero, strings empty, booleans false. Go guarantees a fully-formed value the moment you declare it — a `Walker{}` literal does the same. You access any field with a dot: `w.Name`, `w.PricePer30MinCents`.",
          ],
        },
        {
          type: "quiz",
          q: "You write `w := Walker{Name: \"Mochi\"}` but never set `PricePer30MinCents`. What is `w.PricePer30MinCents`?",
          choices: [
            "`0` — the zero value for `int`, filled in automatically",
            "`nil` — the field is unset",
            "A compile error — every field must be given",
            "Undefined behavior — reading it may crash",
          ],
          answer: 0,
          explain: "A keyed literal fills the fields you name and leaves the rest at their zero value. For `int` that's `0`; you never get `nil` or garbage from a Go struct. This is why zero values are a design tool, not a hazard.",
          nudge: "Go never leaves a field in an unusable state — think about what an unset `int` defaults to.",
        },
        {
          type: "exercise",
          title: "Define and build a Booking",
          prompt: [
            "Define a `Booking` struct with three fields: `ID string`, `WalkerID string`, and `DogName string`.",
            "Then, inside `makeBooking`, build one with a **keyed** literal — set `WalkerID` to `\"w1\"` and `DogName` to `\"Mochi\"` — assign it to `b`, and return it.",
          ],
          starter: String.raw`package main

type Booking struct {
	// your code here
}

func makeBooking() Booking {
	// your code here
}`,
          solution: String.raw`package main

type Booking struct {
	ID       string
	WalkerID string
	DogName  string
}

func makeBooking() Booking {
	b := Booking{WalkerID: "w1", DogName: "Mochi"}
	return b
}`,
          checks: [
            { re: /type Booking struct\{/, hint: "Start the definition with `type Booking struct {` — a named type built from fields." },
            { re: /WalkerID string/, hint: "Give it a `WalkerID string` field (capitalized, since it's exported). Add `ID string` and `DogName string` too." },
            { re: /b:=Booking\{/, hint: "Build the value with a keyed literal assigned via `:=` — `b := Booking{ ... }`." },
            { re: /DogName:"Mochi"/, hint: "Inside the literal, key the fields: `WalkerID: \"w1\", DogName: \"Mochi\"`." },
          ],
          success: "That's a struct definition plus a keyed literal — the exact pattern every handler in the backend uses to build a booking.",
        },
      ],
    },
    {
      id: "methods",
      title: "Methods & pointers",
      steps: [
        {
          type: "text",
          md: [
            "## Behavior hangs off the struct",
            "A struct holds data; a **method** gives it behavior. Go has no classes, so a method isn't written *inside* the type — it's a plain function with a **receiver**: an extra parameter in parentheses before the name that says which type it belongs to.",
            "`func (w Walker) PriceLabel() string` reads: \"a method named `PriceLabel`, on `Walker`, that returns a `string`.\" Inside, `w` is the walker it was called on — like Swift's `self`, but you name it yourself (Go convention: one or two letters, usually the type's first letter).",
          ],
        },
        {
          type: "code",
          title: "internal/walker/walker.go",
          source: String.raw`func (w Walker) PriceLabel() string {
	return fmt.Sprintf("$%d / 30 min", w.PricePer30MinCents/100)
}`,
          caption: "Call it with a dot, like a field: `w.PriceLabel()`. `fmt.Sprintf` builds a string from a format — `%d` slots in the integer dollars after dividing cents by 100.",
        },
        {
          type: "quiz",
          q: "In `func (w Walker) PriceLabel() string`, what is the `(w Walker)` part?",
          choices: [
            "The receiver — it binds the method to the `Walker` type, with `w` as the value it's called on",
            "The first argument the caller must pass in",
            "The return type of the method",
            "A generic type parameter",
          ],
          answer: 0,
          explain: "The receiver names the type the method belongs to and the variable you use to reach its fields (`w.PricePer30MinCents`). It's Go's stand-in for `self`, written before the method name instead of implied.",
          nudge: "It comes before the method name — that position is special. It's not a normal argument.",
        },
        {
          type: "text",
          md: [
            "## Pointers: sharing a value instead of copying it",
            "By default Go **copies** a struct when you pass it around or receive it in a method. Reading is fine, but a copy means changes don't stick to the original. To reach the real value you use a **pointer**.",
            "- `&w` takes the **address** of `w` — a `*Walker`, \"pointer to Walker.\"\n- `*Walker` as a type means \"the address of a Walker.\" Through it, Go lets you read and write the original's fields with the same dot syntax — `p.Name = \"Mochi\"` updates the walker `p` points at.",
            "Coming from Swift, this is the moment `struct` copy semantics become explicit: you choose, per method, whether to work on a copy or the real thing.",
          ],
        },
        {
          type: "code",
          title: "A pointer receiver mutates the original",
          source: String.raw`func (w *Walker) SetName(name string) {
	w.Name = name
}`,
          caption: "The receiver is `*Walker`, so `w` points at the caller's walker. `w.Name = name` changes it for real. Call it as `p.SetName(\"Mochi\")` — Go takes the address for you.",
        },
        {
          type: "text",
          md: [
            "## Value receiver or pointer receiver?",
            "The rule of thumb:",
            "- **Need to mutate the receiver?** Use a pointer receiver (`*Walker`). A value receiver only gets a copy, so any change is thrown away when the method returns.\n- **Just reading?** A value receiver (`Walker`) is fine — `PriceLabel` only reads `PricePer30MinCents`, so it doesn't need a pointer.",
            "> In real code you'll often see pointer receivers used consistently across a type — partly for mutation, partly to avoid copying a large struct on every call. For now: pointer when you write, value is fine when you only read.",
          ],
        },
        {
          type: "quiz",
          q: "You write a method that updates a booking's status field and you want the change to persist. Which receiver do you use?",
          choices: [
            "A pointer receiver — `func (b *Booking) ...` — so the method works on the original, not a copy",
            "A value receiver — `func (b Booking) ...` — Go always updates the original",
            "Either one works identically for mutation",
            "Neither — methods in Go can never change fields",
          ],
          answer: 0,
          explain: "A value receiver gets a copy; writing to it changes only the copy, which vanishes when the method returns. To make a mutation stick you need a pointer receiver so the method holds the address of the real value.",
          nudge: "One of these gets a throwaway copy. Which one reaches the actual value?",
        },
        {
          type: "exercise",
          title: "Add a PriceLabel method",
          prompt: [
            "Add a method `PriceLabel` to `Walker`. It takes no arguments, returns a `string`, and returns `fmt.Sprintf(\"$%d / 30 min\", w.PricePer30MinCents/100)`.",
            "It only reads a field, so a value receiver `(w Walker)` is right here.",
          ],
          starter: String.raw`package main

import "fmt"

type Walker struct {
	Name               string
	PricePer30MinCents int
}

func (w Walker) PriceLabel() string {
	// your code here
}`,
          solution: String.raw`package main

import "fmt"

type Walker struct {
	Name               string
	PricePer30MinCents int
}

func (w Walker) PriceLabel() string {
	return fmt.Sprintf("$%d / 30 min", w.PricePer30MinCents/100)
}`,
          checks: [
            { re: /func\(w Walker\)PriceLabel\(\)string\{/, hint: "The signature is `func (w Walker) PriceLabel() string {` — value receiver, no arguments, returns a string." },
            { re: /fmt\.Sprintf\(/, hint: "Build the string with `fmt.Sprintf(...)` and return it." },
            { re: /w\.PricePer30MinCents\/100/, hint: "Divide the cents by 100 to get dollars: `w.PricePer30MinCents/100`, slotted in with `%d`." },
          ],
          mustNot: [
            { re: /func\(w\*Walker\)PriceLabel/, hint: "This method only reads a field — use a value receiver `(w Walker)`, not a pointer `(w *Walker)`." },
          ],
          success: "That's the real `PriceLabel` from the walker package — a value receiver formatting cents into a human price.",
        },
      ],
    },
    {
      id: "composition",
      title: "Composition",
      steps: [
        {
          type: "text",
          md: [
            "## No inheritance — on purpose",
            "In many languages you'd make a `PremiumWalker` by *inheriting* from `Walker`. Go has **no inheritance**. There are no subclasses, no base classes, no `extends`.",
            "Instead Go gives you **composition**: you build bigger types by *embedding* smaller ones. Rather than \"a premium walker IS A walker (plus extras),\" you say \"a walker-with-stats HAS A walker inside it.\" It turns out that covers almost everything inheritance was used for, with far fewer sharp edges.",
          ],
        },
        {
          type: "code",
          title: "internal/walker/stats.go",
          source: String.raw`type WalkerWithStats struct {
	Walker
	Rating     float64
	WalksTotal int
}`,
          caption: "`Walker` appears with no field name — that's an EMBEDDED field. WalkerWithStats now contains a whole Walker, plus its own Rating and WalksTotal.",
        },
        {
          type: "text",
          md: [
            "## Promotion: the inner fields come along",
            "Because `Walker` is embedded (no field name), its fields and methods are **promoted** — you reach them directly on the outer struct, as if they were declared there:",
            "```",
            "ws := WalkerWithStats{Walker: Walker{Name: \"Mochi\"}, Rating: 4.9}",
            "ws.Name          // \"Mochi\"  — promoted from the embedded Walker",
            "ws.PriceLabel()  // works too — the method is promoted",
            "```",
            "You *can* still reach the inner value explicitly as `ws.Walker.Name`, but promotion means you rarely need to. The outer type gets the inner type's behavior for free.",
          ],
        },
        {
          type: "quiz",
          q: "`WalkerWithStats` embeds `Walker` (which has a `Name` field). Given `ws` of type `WalkerWithStats`, how do you read the walker's name?",
          choices: [
            "`ws.Name` — the field is promoted from the embedded `Walker`",
            "`ws.get(\"Name\")` — embedded fields need a getter",
            "You can't — embedded fields are hidden from the outer struct",
            "`Walker.Name` — through the type, not the value",
          ],
          answer: 0,
          explain: "Embedding without a field name promotes the inner type's fields and methods to the outer struct, so `ws.Name` reads the embedded Walker's `Name` directly. `ws.Walker.Name` also works, but promotion makes the short form the norm.",
          nudge: "Embedding is what makes the inner fields feel like they belong to the outer struct.",
        },
        {
          type: "text",
          md: [
            "## Composition > inheritance",
            "The Go community's guidance is blunt: **prefer composition over inheritance.** Embedding gives you code reuse without the fragile, deep class hierarchies inheritance tends to grow. You assemble a type from the pieces it needs, and each piece stays small and testable on its own.",
            "> You'll lean on this hard later: a `Server` struct embeds a logger and a database handle; a handler embeds shared dependencies. Same move every time — put the smaller thing inside the bigger thing.",
          ],
        },
        {
          type: "exercise",
          title: "Embed and reach a promoted field",
          prompt: [
            "Define `WalkerWithStats` by **embedding** `Walker` (write `Walker` on its own line, no field name) and adding a `Rating float64` field.",
            "Then, inside `describe`, return `ws.Name` — the field promoted up from the embedded `Walker`.",
          ],
          starter: String.raw`package main

type Walker struct {
	Name string
}

type WalkerWithStats struct {
	// your code here
}

func describe(ws WalkerWithStats) string {
	// your code here
}`,
          solution: String.raw`package main

type Walker struct {
	Name string
}

type WalkerWithStats struct {
	Walker
	Rating float64
}

func describe(ws WalkerWithStats) string {
	return ws.Name
}`,
          checks: [
            { re: /type WalkerWithStats struct\{/, hint: "Open the definition with `type WalkerWithStats struct {`." },
            { re: /struct\{Walker /, hint: "Embed `Walker` by writing it on its own line with no field name — that's what makes its fields promote." },
            { re: /Rating float64/, hint: "Add the outer struct's own field: `Rating float64`." },
            { re: /return ws\.Name/, hint: "Return the promoted field directly: `return ws.Name` — no `ws.Walker.Name` needed." },
          ],
          success: "You embedded one struct in another and read a promoted field — composition, the Go way to reuse a type without inheriting from it.",
        },
      ],
    },
  ],
});
