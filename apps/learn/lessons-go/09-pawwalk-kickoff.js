window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "go-pawwalk-kickoff",
  title: "PawWalk Kickoff",
  emoji: "🐾",
  lang: "go",
  lessons: [
    {
      id: "layout",
      title: "Project layout",
      steps: [
        {
          type: "text",
          md: [
            "## From snippets to a service",
            "Everything so far lived in one `main.go` scratch file. A real backend doesn't. PawWalk will grow walkers, bookings, GPS, auth, and tests — so we lay it out the way every production Go service is laid out, right now, before the code piles up.",
            "Go has a strong community convention for this. It's not enforced by the compiler (except one rule we'll meet in a moment), but every Go engineer recognizes it on sight:",
          ],
        },
        {
          type: "text",
          md: [
            "## The shape",
            "```\npawwalk/\n  go.mod                  module root\n  cmd/\n    api/\n      main.go           the entrypoint: wire things, start the server\n  internal/\n    walker/\n      walker.go         the Walker type + its logic\n      handler.go        HTTP handlers for /walkers\n    server/\n      server.go         mux, middleware, http.Server setup\n```",
            "Two ideas do all the work here:",
            "- **`cmd/`** holds *entrypoints* — each subfolder is one runnable program (`package main` with a `func main`). `cmd/api` is our HTTP server. Later you might add `cmd/worker` for a background job, sharing the same `internal/` code.\n- **`internal/`** holds the *actual logic*, split into small packages by feature (`walker`, `server`, later `booking`, `auth`). `main.go` stays tiny — it imports these packages and glues them together.",
          ],
        },
        {
          type: "text",
          md: [
            "## Why `internal/` is special",
            "`internal` is the one folder name the Go compiler treats magically. **A package under `internal/` can only be imported by code rooted in the same parent.** Your `pawwalk/internal/walker` is importable from anywhere inside `pawwalk/`, but if someone else's module tries to import it, the build fails.",
            "That gives you a real public/private boundary at the package level: `internal/` is *your* code that no outside module can depend on, so you're free to refactor it without breaking anyone. It's the Go equivalent of marking a whole module `internal` in Swift.",
            "> Rule of thumb: if it isn't meant to be imported by other projects, it goes under `internal/`. For an app (as opposed to a library), that's almost everything.",
          ],
        },
        {
          type: "quiz",
          q: "You put the walker logic in `pawwalk/internal/walker`. What does the `internal/` folder guarantee?",
          choices: [
            "Only code inside the `pawwalk` module can import that package; other modules can't",
            "The package is compiled but never included in the final binary",
            "The functions in it are automatically private to their own file",
            "Go encrypts the package so it can't be read",
          ],
          answer: 0,
          explain: "`internal/` is enforced by the compiler: a package under it is importable only by code sharing the same parent directory. It draws a hard module boundary — your internals stay yours.",
          nudge: "It's about *who is allowed to import it*, not about the binary or file-level visibility.",
        },
        {
          type: "text",
          md: [
            "## The module path ties it together",
            "`go mod init pawwalk` writes a `go.mod` whose first line is `module pawwalk`. That string is the **import prefix** for everything in the project. So `internal/walker` is imported as:",
            "```go\nimport \"pawwalk/internal/walker\"\n```",
            "In a real repo you'd use the full path, e.g. `module github.com/gerardocordero/pawwalk`, and import `github.com/gerardocordero/pawwalk/internal/walker`. The rule is the same — the module path plus the folder path *is* the import path. Get the module name right once and every import falls out of it.",
          ],
        },
        {
          type: "xcode",
          label: "Over to the terminal",
          title: "Scaffold the project",
          intro: ["Build the skeleton on disk. You'll fill these files in over the next few modules — right now we just want the shape and a compiling entrypoint."],
          items: [
            "Make the root and enter it: `mkdir pawwalk && cd pawwalk`",
            "`go mod init pawwalk` — creates `go.mod` with `module pawwalk`",
            "Create the entrypoint folder: `mkdir -p cmd/api`",
            "Create the feature packages: `mkdir -p internal/walker internal/server`",
            "Add `cmd/api/main.go` with a `package main` and a `func main` (the exercise below is exactly this file)",
            "`go run ./cmd/api` — note you run the *folder*, not `main.go`; it should build and print your boot line",
          ],
        },
        {
          type: "exercise",
          title: "cmd/api/main.go",
          prompt: [
            "Write the entrypoint. Declare `package main`, import `\"fmt\"`, and give it a `func main()` that prints a boot line with `fmt.Println(\"PawWalk API booting on port\", 8080)`.",
            "This is the whole file `cmd/api/main.go` starts as — tiny on purpose. Real wiring moves in later.",
          ],
          starter: String.raw`package main

import "fmt"

func main() {
	// your code here
}`,
          solution: String.raw`package main

import "fmt"

func main() {
	fmt.Println("PawWalk API booting on port", 8080)
}`,
          checks: [
            { re: /package main/, hint: "An entrypoint file must declare `package main` — that's what makes it a runnable program." },
            { re: /func main\(\)\{/, hint: "Add the entrypoint function: `func main() { ... }` — no arguments, no return." },
            { re: /fmt\.Println\(/, hint: "Print the boot line with `fmt.Println(...)`." },
            { re: /"PawWalk API booting on port",8080/, hint: "Pass the message and the port as two arguments: `fmt.Println(\"PawWalk API booting on port\", 8080)`." },
          ],
          success: "That's `cmd/api/main.go`. `go run ./cmd/api` compiles the whole module and runs this one entrypoint — the foundation everything else hangs off.",
        },
      ],
    },
    {
      id: "config",
      title: "Config from the environment",
      steps: [
        {
          type: "text",
          md: [
            "## Config lives in the environment",
            "Your server needs to know things that change between your laptop and production: which port to listen on, the database URL, the secret used to sign login tokens. Where do those values come from?",
            "The answer the industry settled on is **12-factor config**: read settings from **environment variables**, not from files baked into the build. Same binary runs everywhere; the environment tells it *how*. No secrets in git, and switching from dev to prod is just different env vars — no recompile.",
          ],
        },
        {
          type: "text",
          md: [
            "## One struct holds it all",
            "Instead of calling `os.Getenv` scattered across the codebase, we read everything **once** at startup into a single `Config` struct and pass it down. That gives you one place to see every knob the service has, and one place that fails loudly if something's missing.",
            "`os.Getenv(\"PORT\")` returns the value of the `PORT` environment variable — or an **empty string** if it isn't set. It never errors; an unset variable just reads as `\"\"`. So every field needs a sensible default for local development.",
          ],
        },
        {
          type: "code",
          title: "internal/config/config.go",
          source: String.raw`package config

import "os"

type Config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string
}

func Load() Config {
	return Config{
		Port:        env("PORT", "8080"),
		DatabaseURL: env("DATABASE_URL", "postgres://localhost/pawwalk_dev"),
		JWTSecret:   env("JWT_SECRET", "dev-secret-change-me"),
	}
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}`,
          caption: "`Load` reads each variable through one small helper. Notice the pattern: every field is `env(NAME, default)`, so a fresh checkout runs with zero setup, and production overrides by exporting real values.",
        },
        {
          type: "text",
          md: [
            "## The fallback helper",
            "The whole file leans on one tiny function, `env`. It's the workhorse — given a variable name and a fallback, it returns the env value if there is one, otherwise the fallback:",
            "```go\nfunc env(key, fallback string) string {\n\tif v := os.Getenv(key); v != \"\" {\n\t\treturn v\n\t}\n\treturn fallback\n}\n```",
            "That `if v := os.Getenv(key); v != \"\"` is Go's **if-with-init**: it declares `v`, then tests it, all in one line — and `v` is only in scope inside the `if`. It's the idiomatic way to grab a value and immediately branch on it.",
          ],
        },
        {
          type: "quiz",
          q: "Why read config from environment variables instead of hard-coding the port and database URL?",
          choices: [
            "The same compiled binary can run in dev, staging, and prod with no rebuild — the environment supplies the differences, and secrets stay out of git",
            "Environment variables are faster to read than struct fields at runtime",
            "Go can't store strings in a struct, so env vars are the only option",
            "It's the only way to make `os.Getenv` compile",
          ],
          answer: 0,
          explain: "That's the 12-factor idea: one artifact, many environments. Config (and especially secrets) come from the environment at startup, so nothing sensitive lives in the repo and promoting a build across environments needs no code change.",
          nudge: "Think about what has to change when the same binary moves from your laptop to a production server.",
        },
        {
          type: "exercise",
          title: "Write the env helper",
          prompt: [
            "Implement `func env(key, fallback string) string`. Read the variable with `os.Getenv(key)` using an if-with-init: `if v := os.Getenv(key); v != \"\"`, return `v` when it's non-empty, otherwise return `fallback`.",
          ],
          starter: String.raw`package config

import "os"

func env(key, fallback string) string {
	// your code here
}`,
          solution: String.raw`package config

import "os"

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}`,
          checks: [
            { re: /func env\(key,fallback string\)string\{/, hint: "Match the signature exactly: two `string` params sharing one type, returning a `string` — `func env(key, fallback string) string {`." },
            { re: /if v:=os\.Getenv\(key\);v!=""\{/, hint: "Use if-with-init: `if v := os.Getenv(key); v != \"\" {` — declare `v`, then test it in the same line." },
            { re: /return v/, hint: "Inside the `if`, return the value you found: `return v`." },
            { re: /return fallback/, hint: "After the `if`, return the default: `return fallback`." },
          ],
          success: "That's the helper the whole config layer stands on — one clean way to say 'this env var, or this default.'",
        },
      ],
    },
    {
      id: "walkers-endpoint",
      title: "The walkers endpoint",
      steps: [
        {
          type: "text",
          md: [
            "## The first real endpoint",
            "Time to serve data. In the iOS app, the walker list screen fetched `GET /walkers` and got back JSON. Now you build the other end of that call.",
            "The pattern for every endpoint in this service is the same: a **handler struct** holds its dependencies (here, a repository that knows how to fetch walkers), and each route is a **method** on that struct. Bundling the dependency into the struct means the handler never reaches for globals — everything it needs is a field.",
          ],
        },
        {
          type: "text",
          md: [
            "## What a Walker looks like on the wire",
            "The `Walker` type carries `json` **struct tags** — they tell Go's JSON encoder exactly what key to use for each field, so `PricePer30MinCents` goes out as `price_per_30min_cents`:",
            "```go\ntype Walker struct {\n\tID                 string `json:\"id\"`\n\tName               string `json:\"name\"`\n\tPricePer30MinCents int    `json:\"price_per_30min_cents\"`\n}\n```",
            "> Those backtick-wrapped tags are a Go raw string. You'll write them in your real editor, but never inside a *checked* exercise here — the browser checker can't hold a backtick. We show them read-only; you type the handler around them.",
          ],
        },
        {
          type: "code",
          title: "internal/walker/handler.go",
          source: String.raw`package walker

import (
	"encoding/json"
	"net/http"
)

type Repo interface {
	All() []Walker
}

type WalkerHandler struct {
	repo Repo
}

func NewWalkerHandler(repo Repo) *WalkerHandler {
	return &WalkerHandler{repo: repo}
}`,
          caption: "The handler depends on a `Repo` *interface*, not a concrete database — so tests can pass a fake and production passes the real thing. `NewWalkerHandler` is the constructor that injects it.",
        },
        {
          type: "text",
          md: [
            "## Encoding JSON straight to the response",
            "`http.ResponseWriter` is an `io.Writer` — a stream you write bytes to. `json.NewEncoder(w)` wraps that stream, and `.Encode(walkers)` serializes the slice and writes it out in one call. No intermediate buffer, no `Marshal` then `Write`.",
            "Before writing the body, set the content type so the client parses it as JSON: `w.Header().Set(\"Content-Type\", \"application/json\")`. Headers must be set *before* the first write to the body.",
          ],
        },
        {
          type: "exercise",
          title: "The List handler",
          prompt: [
            "Write the `List` method on `*WalkerHandler`. Its signature is `func (h *WalkerHandler) List(w http.ResponseWriter, r *http.Request)`. Inside: fetch `walkers := h.repo.All()`, set the JSON content-type header, then encode with `json.NewEncoder(w).Encode(walkers)`.",
          ],
          starter: String.raw`package walker

import (
	"encoding/json"
	"net/http"
)

// your code here`,
          solution: String.raw`package walker

import (
	"encoding/json"
	"net/http"
)

func (h *WalkerHandler) List(w http.ResponseWriter, r *http.Request) {
	walkers := h.repo.All()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(walkers)
}`,
          checks: [
            { re: /func\(h\*WalkerHandler\)List\(/, hint: "Start with the method receiver and name: `func (h *WalkerHandler) List(...)` — a pointer receiver `*WalkerHandler`." },
            { re: /w http\.ResponseWriter,r\*http\.Request\)/, hint: "Every handler takes `(w http.ResponseWriter, r *http.Request)` — the response you write to and the incoming request." },
            { re: /walkers:=h\.repo\.All\(\)/, hint: "Fetch the data through the repo: `walkers := h.repo.All()`." },
            { re: /w\.Header\(\)\.Set\("Content-Type",/, hint: "Set the header before writing the body: `w.Header().Set(\"Content-Type\", \"application/json\")`." },
            { re: /json\.NewEncoder\(w\)\.Encode\(/, hint: "Stream the JSON straight to the response: `json.NewEncoder(w).Encode(walkers)`." },
          ],
          success: "That's a complete JSON endpoint handler — fetch, set the type, encode. Every list endpoint in the service follows this exact shape.",
        },
        {
          type: "text",
          md: [
            "## Registering the route",
            "Go 1.22 gave `http.ServeMux` **method-based patterns**. You can register a route as `\"GET /walkers\"` and the mux only matches GET requests to that path — a POST to `/walkers` won't hit this handler. Before 1.22 you had to check `r.Method` by hand; now the router does it.",
            "You wire the handler's method as the handler function: `mux.HandleFunc(\"GET /walkers\", h.List)`. A method value like `h.List` is a perfectly good `func(w, r)` — Go binds `h` for you.",
          ],
        },
        {
          type: "exercise",
          title: "Wire it to the mux",
          prompt: [
            "Write `routes`, which builds and returns the server's mux. Create it with `http.NewServeMux()`, register the walker list with `mux.HandleFunc(\"GET /walkers\", h.List)`, and return the mux.",
          ],
          starter: String.raw`package server

import "net/http"

func routes(h *WalkerHandler) *http.ServeMux {
	// your code here
}`,
          solution: String.raw`package server

import "net/http"

func routes(h *WalkerHandler) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /walkers", h.List)
	return mux
}`,
          checks: [
            { re: /mux:=http\.NewServeMux\(\)/, hint: "Create the router first: `mux := http.NewServeMux()`." },
            { re: /mux\.HandleFunc\("GET\/walkers",/, hint: "Register the route with a method-based pattern: `mux.HandleFunc(\"GET /walkers\", ...)`." },
            { re: /mux\.HandleFunc\("GET\/walkers",h\.List\)/, hint: "Pass the handler method as the function: `mux.HandleFunc(\"GET /walkers\", h.List)`." },
            { re: /return mux/, hint: "Hand the configured mux back: `return mux`." },
          ],
          success: "The endpoint is live: `GET /walkers` routes to `List`, which encodes the walkers as JSON. That's the exact request the iOS app made — you just built its server side.",
        },
      ],
    },
  ],
});
