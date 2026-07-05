window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "go-http-stdlib",
  title: "HTTP with net/http",
  emoji: "🌐",
  lang: "go",
  lessons: [
    {
      id: "handlers",
      title: "Handlers & the server",
      steps: [
        {
          type: "text",
          md: [
            "## The server the app was talking to",
            "In the iOS course, PawWalk's walker list came from an HTTP request to a URL. Something on the other end **received** that request and **wrote back** a response. That something is what you build now — and Go ships a production-grade HTTP server in its **standard library**. No framework to install, no Express, no Rails: `net/http` is enough to serve real traffic.",
            "The whole model is two ideas: a **handler** is a function that receives a request and writes a response, and the **server** listens on a port and calls the right handler for each incoming request. That's it — everything else is detail.",
          ],
        },
        {
          type: "text",
          md: [
            "## The shape of a handler",
            "A handler is any function with this exact signature:",
            "```\nfunc(w http.ResponseWriter, r *http.Request)\n```",
            "- **`w http.ResponseWriter`** is where you *write the response* — the bytes that travel back to the app. Call `w.Write([]byte(...))` to send raw bytes, or `fmt.Fprintf(w, ...)` to write formatted text straight into it.\n- **`r *http.Request`** is the *incoming request* — the URL, method, headers, and body the client sent. The `*` means it's a **pointer** to the request (you saw pointers earlier: one shared copy, not a duplicate).",
            "> `http.ResponseWriter` is an **interface** (module 04): anything that knows how to write response bytes satisfies it. In tests you'll pass a fake writer; in production the real network connection. The handler doesn't care which.",
          ],
        },
        {
          type: "code",
          title: "main.go — a handler and a server",
          source: String.raw`package main

import (
	"fmt"
	"net/http"
)

func hello(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello from PawWalk")
}

func main() {
	http.HandleFunc("/", hello)
	http.ListenAndServe(":8080", nil)
}`,
          caption: "`http.HandleFunc(\"/\", hello)` registers `hello` for the path `/`. `http.ListenAndServe(\":8080\", nil)` starts the server on port 8080 and blocks forever, calling your handler on every request. Run it, open http://localhost:8080, and you get your text back.",
        },
        {
          type: "text",
          md: [
            "## Writing the response",
            "There are two everyday ways to send bytes back:",
            "- **`w.Write([]byte(\"ok\"))`** — the raw method. `w.Write` takes a `[]byte` (a byte slice), so you convert your string with `[]byte(...)`.\n- **`fmt.Fprintf(w, \"count: %d\", n)`** — the convenient one. `Fprintf` is `Printf` that writes to a destination instead of the screen; the destination is `w`. Great when you're formatting values into the response.",
            "Both do the same fundamental thing: append bytes to the response body. Use `w.Write` for plain fixed text, `fmt.Fprintf` when you're interpolating.",
          ],
        },
        {
          type: "quiz",
          q: "What is the correct signature for an `http` handler function?",
          choices: [
            "func(w http.ResponseWriter, r *http.Request)",
            "func(r *http.Request) http.ResponseWriter",
            "func(req Request, res Response) error",
            "func(w http.ResponseWriter, r http.Request) string",
          ],
          answer: 0,
          explain: "Every net/http handler takes the response writer first and a pointer to the request second, and returns nothing. You write the response through `w`; you never return it.",
          nudge: "The writer comes first, the request is a pointer, and a handler returns nothing.",
        },
        {
          type: "exercise",
          title: "A health-check handler",
          prompt: [
            "Every backend needs a `/healthz` endpoint that load balancers ping to ask \"are you alive?\". Write a handler named `healthz` with the standard signature that writes the bytes `ok` back to the client.",
            "Convert the string to a byte slice with `[]byte(\"ok\")` and pass it to `w.Write`.",
          ],
          starter: String.raw`package main

import "net/http"

// your code here
`,
          solution: String.raw`package main

import "net/http"

func healthz(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("ok"))
}`,
          checks: [
            { re: /func healthz\(w http\.ResponseWriter,r\*http\.Request\)\{/, hint: "Match the exact signature: `func healthz(w http.ResponseWriter, r *http.Request) {` — writer first, request pointer second." },
            { re: /w\.Write\(/, hint: "Send bytes with `w.Write(...)` — the raw write method on the response writer." },
            { re: /\[\]byte\("ok"\)/, hint: "`w.Write` needs a `[]byte`, so convert the string: `[]byte(\"ok\")`." },
          ],
          mustNot: [
            { re: /func healthz\(\)/, hint: "A handler always takes `(w http.ResponseWriter, r *http.Request)` — it can't be parameterless." },
          ],
          success: "That's a real health check. Register it with `http.HandleFunc(\"/healthz\", healthz)` and every uptime monitor in the world knows how to talk to it.",
        },
      ],
    },
    {
      id: "json",
      title: "JSON",
      steps: [
        {
          type: "text",
          md: [
            "## Structs in, JSON out",
            "The app didn't want the text `Hello` — it wanted **data**: a list of walkers with names and prices, as JSON. Go's `encoding/json` package converts between your Go structs and JSON, and it's built into the standard library like everything else.",
            "The rule of thumb: your server holds data as **structs** (typed, checked by the compiler) and speaks **JSON** on the wire. `encoding/json` is the translator in the middle.",
          ],
        },
        {
          type: "text",
          md: [
            "## Marshal and Unmarshal",
            "The two core functions:",
            "- **`json.Marshal(v)`** turns a Go value into JSON bytes — struct → `[]byte`. This is the direction a server uses most: you have a `Walker`, you want to send it.\n- **`json.Unmarshal(data, &v)`** goes the other way — JSON bytes → struct. You pass a **pointer** (`&v`) so it can fill your value in place. This is how you read a request body the client sent.",
            "Both return an `error` you should check (`err != nil`) — Marshal can fail on values JSON can't represent, and Unmarshal fails on malformed input.",
          ],
        },
        {
          type: "text",
          md: [
            "## Field names & json tags",
            "Go exports struct fields with **capitalized** names (`Name`, `PricePer30MinCents`), but JSON conventionally uses lowercase or snake_case keys. A **struct tag** bridges the two: a bit of metadata after the field type telling `encoding/json` what key to use.",
            "```\ntype Walker struct {\n\tID                 string `json:\"id\"`\n\tName               string `json:\"name\"`\n\tPricePer30MinCents int    `json:\"price_per_30min_cents\"`\n}\n```",
            "With those tags, `json.Marshal` of a `Walker` produces `{\"id\":\"w1\",\"name\":\"Ana\",\"price_per_30min_cents\":2000}` — exactly the shape the app decodes. Only exported (capitalized) fields are marshaled at all; an unexported `password` field is invisible to JSON, which is a handy safety default.",
            "> The backticks around `json:\"name\"` make it a Go **raw string**. You'll type those tags in your real editor — but never inside these in-browser exercises, where backticks have a special meaning.",
          ],
        },
        {
          type: "code",
          title: "main.go — encode straight to the response",
          source: String.raw`package main

import (
	"encoding/json"
	"net/http"
)

type Walker struct {
	ID   string
	Name string
}

func walkersHandler(w http.ResponseWriter, r *http.Request) {
	walkers := []Walker{
		{ID: "w1", Name: "Ana"},
		{ID: "w2", Name: "Ben"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(walkers)
}`,
          caption: "The idiomatic pattern: instead of Marshal-then-Write, `json.NewEncoder(w).Encode(walkers)` streams the JSON directly into the response writer in one step — less code, no intermediate byte slice.",
        },
        {
          type: "text",
          md: [
            "## Two things every JSON response needs",
            "1. **Set the content type.** `w.Header().Set(\"Content-Type\", \"application/json\")` tells the client \"this body is JSON.\" Set it **before** you write any body bytes — once the body starts, headers are locked.\n2. **Encode the value.** `json.NewEncoder(w).Encode(v)` builds an encoder that writes to `w`, then serializes `v` into it. `Encode` handles the `[]byte` conversion and the write for you.",
            "That two-line pattern — set header, encode — is how nearly every JSON endpoint in the PawWalk backend ends.",
          ],
        },
        {
          type: "quiz",
          q: "Why call `json.NewEncoder(w).Encode(walkers)` instead of `json.Marshal` then `w.Write`?",
          choices: [
            "It encodes the value straight into the response writer in one step — no intermediate byte slice",
            "It is the only function that can encode a slice",
            "Marshal cannot handle structs, only Encode can",
            "Encode automatically sets the Content-Type header for you",
          ],
          answer: 0,
          explain: "`NewEncoder(w).Encode(v)` streams the JSON directly to the writer, saving you the Marshal-into-a-slice-then-Write dance. (It does not set headers — you still set Content-Type yourself.)",
          nudge: "Think about what the encoder writes to, and what step you get to skip.",
        },
        {
          type: "exercise",
          title: "Return the walker list as JSON",
          prompt: [
            "Finish the handler body. First set the response content type to `application/json`, then encode the `walkers` slice straight into the response with `json.NewEncoder(w).Encode(walkers)`.",
          ],
          starter: String.raw`package main

import (
	"encoding/json"
	"net/http"
)

type Walker struct {
	ID   string
	Name string
}

func listWalkers(w http.ResponseWriter, r *http.Request) {
	walkers := []Walker{{ID: "w1", Name: "Ana"}}
	// your code here
}`,
          solution: String.raw`package main

import (
	"encoding/json"
	"net/http"
)

type Walker struct {
	ID   string
	Name string
}

func listWalkers(w http.ResponseWriter, r *http.Request) {
	walkers := []Walker{{ID: "w1", Name: "Ana"}}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(walkers)
}`,
          checks: [
            { re: /w\.Header\(\)\.Set\("Content-Type",/, hint: "Set the header first: `w.Header().Set(\"Content-Type\", \"application/json\")`." },
            { re: /"application\/json"/, hint: "The content-type value for JSON is the string `\"application/json\"`." },
            { re: /json\.NewEncoder\(w\)\.Encode\(/, hint: "Stream the JSON with `json.NewEncoder(w).Encode(...)` — build the encoder on `w`, then call `Encode`." },
            { re: /\.Encode\(walkers\)/, hint: "Encode the `walkers` slice you were given: `.Encode(walkers)`." },
          ],
          mustNot: [
            { re: /json\.Marshal\(/, hint: "Skip `json.Marshal` here — the whole point is to encode straight into `w` with `NewEncoder(w).Encode(...)`." },
          ],
          success: "That's a complete JSON endpoint. The exact shape the PawWalk app decodes into its walker list came off a handler that looks just like this.",
        },
      ],
    },
    {
      id: "routing",
      title: "Routing (Go 1.22 mux)",
      steps: [
        {
          type: "text",
          md: [
            "## One handler isn't a server",
            "A real API has many endpoints: `GET /walkers` to list, `GET /walkers/{id}` for one walker, `POST /bookings` to book. You need something that looks at each request's **method and path** and dispatches to the right handler. That router is called a **mux** (multiplexer), and Go has one built in: `http.ServeMux`.",
            "You've been using the *default* mux implicitly — passing `nil` to `ListenAndServe` and calling the package-level `http.HandleFunc`. Now you'll create your own so routing is explicit and testable.",
          ],
        },
        {
          type: "text",
          md: [
            "## Your own mux",
            "`http.NewServeMux()` returns a fresh router. You register routes on it, then hand *it* to the server instead of `nil`:",
            "```\nmux := http.NewServeMux()\nmux.HandleFunc(\"/healthz\", healthz)\nhttp.ListenAndServe(\":8080\", mux)\n```",
            "Passing `mux` as the second argument tells the server \"route every request through this.\" Same `HandleFunc` you already know — now it's a method on *your* mux, not the hidden global one.",
          ],
        },
        {
          type: "text",
          md: [
            "## Method + path patterns (new in Go 1.22)",
            "Older Go muxes matched only on path prefix — you checked the method yourself inside the handler. **Go 1.22** upgraded `ServeMux` to understand patterns like `\"GET /walkers\"`: the HTTP **method** and the path, together, in the pattern string.",
            "- `mux.HandleFunc(\"GET /walkers\", listWalkers)` — only `GET` requests to `/walkers`.\n- `mux.HandleFunc(\"POST /bookings\", createBooking)` — only `POST` to `/bookings`. A `GET` to the same path won't match, and the mux returns `405 Method Not Allowed` for free.",
            "This is a big deal: the routing table now reads like your API docs, and you stop writing `if r.Method != \"GET\"` boilerplate in every handler.",
          ],
        },
        {
          type: "text",
          md: [
            "## Path wildcards & `PathValue`",
            "Patterns can capture a segment with `{name}`: `\"GET /walkers/{id}\"` matches `/walkers/w1`, `/walkers/w2`, anything in that slot. Inside the handler you read the captured value with **`r.PathValue(\"id\")`** — it returns the string that filled `{id}`.",
            "```\nmux.HandleFunc(\"GET /walkers/{id}\", func(w http.ResponseWriter, r *http.Request) {\n\tid := r.PathValue(\"id\")\n\tfmt.Fprintf(w, \"walker %s\", id)\n})\n```",
            "So a request to `/walkers/w1` writes back `walker w1`. Before Go 1.22 you had to hand-parse the URL string to pull that `id` out; now the mux does it and hands you the value.",
          ],
        },
        {
          type: "quiz",
          q: "In Go 1.22, what does the pattern `\"GET /walkers/{id}\"` do?",
          choices: [
            "Matches GET requests whose path is /walkers/<anything>, capturing that segment as `id`",
            "Matches only the literal path /walkers/{id} with braces in the URL",
            "Matches any method on /walkers and ignores the id",
            "Redirects /walkers to /walkers/{id}",
          ],
          answer: 0,
          explain: "The method (`GET`) constrains which verb matches, and `{id}` is a wildcard capturing one path segment. You read the captured value inside the handler with `r.PathValue(\"id\")`.",
          nudge: "The word before the space is the HTTP method; the `{id}` in braces is a capture, not literal text.",
        },
        {
          type: "exercise",
          title: "Route one walker by id",
          prompt: [
            "Wire up a single-walker route on `mux`. Register the pattern for a `GET` request to `/walkers/{id}` pointing at the `getWalker` handler, then inside `getWalker` read the captured id with `r.PathValue(\"id\")` into a variable named `id`.",
          ],
          starter: String.raw`package main

import (
	"fmt"
	"net/http"
)

func getWalker(w http.ResponseWriter, r *http.Request) {
	// your code here
	fmt.Fprintf(w, "walker %s", id)
}

func main() {
	mux := http.NewServeMux()
	// your code here
	http.ListenAndServe(":8080", mux)
}`,
          solution: String.raw`package main

import (
	"fmt"
	"net/http"
)

func getWalker(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	fmt.Fprintf(w, "walker %s", id)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /walkers/{id}", getWalker)
	http.ListenAndServe(":8080", mux)
}`,
          checks: [
            { re: /mux\.HandleFunc\("GET\/walkers\/\{id\}",/, hint: "Register the method+path pattern on your mux: `mux.HandleFunc(\"GET /walkers/{id}\", getWalker)`." },
            { re: /,getWalker\)/, hint: "Point the route at the `getWalker` handler — pass it as the second argument." },
            { re: /id:=r\.PathValue\("id"\)/, hint: "Read the captured segment: `id := r.PathValue(\"id\")` — the name matches the `{id}` in the pattern." },
          ],
          mustNot: [
            { re: /r\.URL\.Path/, hint: "No need to hand-parse `r.URL.Path` — Go 1.22's `r.PathValue(\"id\")` gives you the segment directly." },
          ],
          success: "That's real Go 1.22 routing: a method-scoped path pattern and a typed capture. The PawWalk backend's walker, booking, and GPS routes are all built from exactly this shape.",
        },
      ],
    },
  ],
});
