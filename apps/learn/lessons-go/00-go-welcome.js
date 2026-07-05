window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "go-welcome",
  title: "Welcome to Go",
  emoji: "🐹",
  lang: "go",
  lessons: [
    {
      id: "welcome",
      title: "Why Go",
      steps: [
        {
          type: "text",
          md: [
            "## The language that servers are built in",
            "In the iOS course you built the PawWalk app. Every screen — the walker list, the booking form, login — worked by **asking a server for data** over HTTP. This course teaches you to build that server in **Go**: the other side of the URL. (Never written Go? Perfect — this course assumes zero Go and explains the app side as it goes.)",
            "Go was designed at Google to make **fast, concurrent network services** that a large team can maintain. It compiles to a single self-contained binary, starts in milliseconds, and its concurrency model (goroutines) makes handling thousands of simultaneous requests feel natural. That's why so much of modern infrastructure — Docker, Kubernetes, and countless APIs — is written in Go.",
          ],
        },
        {
          type: "text",
          md: [
            "## The course map",
            "- **Go the language** (modules 01–05) — variables to structs, interfaces, and the concurrency model that makes Go *Go*, with Swift comparisons so it clicks fast.\n- **The standard library server** (06–08) — `net/http`, JSON, routing, middleware, and a real database. Go ships a production HTTP server in its standard library; you'll feel exactly what a request is.\n- **Rebuild the PawWalk backend** (09–12) — a real service layout: config, walkers, JWT auth, bookings, and tests.\n- **Ship it** (13) — build a single binary, containerize it, deploy, and graduate.",
            "> Go's motto is *\"less is more.\"* One way to format code (`gofmt`), one loop keyword (`for`), explicit error handling, and no inheritance. It feels strict at first and liberating soon after.",
          ],
        },
        {
          type: "code",
          title: "internal/walker/walker.go (a taste)",
          source: String.raw`package walker

type Walker struct {
	ID                string
	Name              string
	PricePer30MinCents int
}

func (w Walker) PriceLabel() string {
	return fmt.Sprintf("$%d / 30 min", w.PricePer30MinCents/100)
}`,
          caption: "Real code you'll build. In Part I you typed its Swift mirror — `struct Walker`. Same contract, different language: no classes, a method hangs off the struct with a receiver `(w Walker)`.",
        },
        {
          type: "quiz",
          q: "What makes Go especially suited to backend web services?",
          choices: [
            "Lightweight concurrency (goroutines) and a fast, self-contained compiled binary",
            "It runs in the browser without a server",
            "It has the most object-oriented inheritance features",
            "It is interpreted, so there is no build step",
          ],
          answer: 0,
          explain: "Goroutines let one Go program juggle thousands of connections cheaply, and `go build` produces one binary you can copy to a server and run — no runtime to install. That combination is why Go dominates cloud infrastructure.",
          nudge: "Think about what a server does all day: handle many requests at once, and be easy to deploy.",
        },
        {
          type: "text",
          md: [
            "## How Go reads, coming from Swift",
            "- **`:=` declares and infers** — `name := \"Mochi\"` is Go's `let name = \"Mochi\"`. Types are inferred; you rarely write them for locals.\n- **Braces, not indentation** — like Swift, blocks use `{ }`. But Go formats itself: `gofmt` is law, so every Go file everywhere looks the same.\n- **`fmt.Println`** is Go's `print()`. The `fmt` package handles formatted I/O.\n- **Every file starts with `package`** — code lives in packages, and `package main` with a `func main()` is what makes a runnable program.",
            "> The exercises check your Go right here in the browser, exactly like Part I. Same rules: type it, don't paste it.",
          ],
        },
        {
          type: "exercise",
          title: "Your first Go program",
          prompt: [
            "Inside `main`, declare `name` as `\"Mochi\"` using `:=`, then print `Welcome, Mochi` with `fmt.Println(\"Welcome,\", name)`.",
          ],
          starter: String.raw`package main

import "fmt"

func main() {
	// your code here
}`,
          solution: String.raw`package main

import "fmt"

func main() {
	name := "Mochi"
	fmt.Println("Welcome,", name)
}`,
          checks: [
            { re: /name:="Mochi"/, hint: "Declare and assign in one step with `:=` — `name := \"Mochi\"`. No `let`, no `var`, no type." },
            { re: /fmt\.Println\(/, hint: "Print with `fmt.Println(...)` — the `fmt` package's line printer." },
            { re: /"Welcome,",name/, hint: "Pass two arguments: the string `\"Welcome,\"` and the variable `name`, comma-separated — `fmt.Println(\"Welcome,\", name)`." },
          ],
          mustNot: [
            { re: /var name/, hint: "Use the short form `:=` here, not `var name string = ...` — inside a function `:=` is the idiomatic way." },
          ],
          success: "That's a complete Go program: a package, an import, and a main function. `go run` it and it prints your greeting.",
        },
      ],
    },
    {
      id: "toolchain",
      title: "Set up your toolchain",
      steps: [
        {
          type: "text",
          md: [
            "## One install, one command",
            "Swift needed Xcode. Go needs just the Go toolchain:",
            "1. **Go 1.22+** — the compiler, formatter, and tools in one download (macOS: `brew install go`, or grab the installer from go.dev).\n2. That's it. No separate package manager to install — `go` itself fetches dependencies, builds, tests, and formats.",
            "A Go project is defined by a **`go.mod`** file at its root — the equivalent of `Package.swift`. It names the module and pins dependency versions. You create it once with `go mod init`.",
          ],
        },
        {
          type: "text",
          md: [
            "## The commands you'll live in",
            "- **`go run .`** — compile and run the current package, no binary left behind. Your inner-loop command.\n- **`go build`** — produce the standalone binary.\n- **`go test ./...`** — run every test in the module.\n- **`go fmt ./...`** and **`go vet ./...`** — format and catch suspicious code. Run before every commit.\n- **`go mod tidy`** — sync `go.mod` with what your code actually imports.",
          ],
        },
        {
          type: "xcode",
          label: "Over to the terminal",
          title: "Create and run your first module",
          intro: ["Get the toolchain working end to end. Keep this workflow — every Go module in the course starts this way."],
          items: [
            "Install Go (skip if `go version` already prints 1.22 or newer): `brew install go`",
            "Make a scratch project: `mkdir pawwalk-go && cd pawwalk-go`",
            "`go mod init pawwalk` — creates `go.mod`, marking this folder a Go module",
            "Save your first-program code from the last lesson as `main.go`",
            "`go run .` — should print `Welcome, Mochi`",
            "`go build` then `./pawwalk` (or `pawwalk.exe`) — run the compiled binary directly",
          ],
        },
        {
          type: "quiz",
          q: "You ran `go build` and got a single file you can copy to a server and execute with no Go installed there. Why is that possible?",
          choices: [
            "Go compiles your code and its dependencies into one statically-linked binary",
            "The binary secretly downloads Go at startup",
            "It only works if the server already has the Go runtime installed",
            "`go build` uploads your code to go.dev and returns a link",
          ],
          answer: 0,
          explain: "Go statically links everything into the output binary by default. Deployment is often just `scp` the binary and run it — which is why Go containers can be tiny and start instantly. That property shapes the whole deploy story in module 13.",
          nudge: "Think about what 'self-contained' means for putting the program on a machine that has never seen Go.",
        },
      ],
    },
  ],
});
