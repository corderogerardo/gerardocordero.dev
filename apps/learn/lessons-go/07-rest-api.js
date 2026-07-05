window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "go-rest-api",
  title: "Building a REST API",
  emoji: "🛣️",
  lang: "go",
  lessons: [
    {
      id: "responses",
      title: "Status codes & responses",
      steps: [
        {
          type: "text",
          md: [
            "## What REST actually means",
            "So far your handlers just wrote text back. A **REST API** is a discipline for shaping those handlers: you expose **resources** (walkers, bookings) and act on them with HTTP **verbs**.",
            "- `GET /walkers` — read the list of walkers\n- `POST /bookings` — create a booking\n- `GET /bookings/42` — read booking 42\n- `DELETE /bookings/42` — cancel it",
            "The verb says *what to do*; the path names *the thing*. The PawWalk iOS app you built spoke exactly this language — every screen was a `GET` or a `POST` to a path like these.",
          ],
        },
        {
          type: "text",
          md: [
            "## The other half of a response: the status code",
            "Every HTTP response carries a **status code** — a three-digit number that tells the client *how it went* before it even looks at the body. The app decided whether to show your bookings or an error screen based on this number.",
            "- **2xx — success.** `200 OK`, `201 Created`.\n- **4xx — the client's fault.** `400 Bad Request`, `404 Not Found`.\n- **5xx — the server's fault.** `500 Internal Server Error`.",
            "Go names these as constants in `net/http` so you never memorize the digits: `http.StatusOK` is `200`, `http.StatusCreated` is `201`, `http.StatusBadRequest` is `400`, `http.StatusNotFound` is `404`.",
          ],
        },
        {
          type: "code",
          title: "internal/booking/handler.go",
          source: String.raw`package booking

import (
	"fmt"
	"net/http"
)

func getBooking(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprintln(w, "no such booking")
		return
	}
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "booking %s\n", id)
}`,
          caption: "`w.WriteHeader(code)` sends the status line. Call it BEFORE you write any body — once bytes flow, the status is locked in. If you never call it, Go sends 200 for you.",
        },
        {
          type: "quiz",
          q: "A walker's booking creation succeeds and you've saved a brand-new booking. Which status code should the handler send?",
          choices: [
            "http.StatusCreated (201)",
            "http.StatusOK (200)",
            "http.StatusNotFound (404)",
            "http.StatusBadRequest (400)",
          ],
          answer: 0,
          explain: "`201 Created` is the precise signal that a POST made a new resource. `200 OK` is fine for a plain read, but `201` tells the client 'a new thing now exists' — often alongside its URL in a `Location` header.",
          nudge: "The request didn't just succeed — it brought a new resource into existence. There's a status code for exactly that.",
        },
        {
          type: "text",
          md: [
            "## A JSON error helper",
            "Real APIs answer in JSON, not plain text — so both success and error bodies are machine-readable. Writing the same three lines (set header, write status, encode) in every handler gets old fast, so teams write one helper and call it everywhere:",
            "```go\nfunc writeJSON(w http.ResponseWriter, status int, v any) {\n\tw.Header().Set(\"Content-Type\", \"application/json\")\n\tw.WriteHeader(status)\n\tjson.NewEncoder(w).Encode(v)\n}\n```",
            "Notice the order: set the `Content-Type` header, then `WriteHeader(status)`, then encode the body. Headers must be set before the status; the status before the body. `any` is Go's alias for `interface{}` — 'a value of any type,' which lets one helper serialize a walker, a booking, or an error map.",
          ],
        },
        {
          type: "exercise",
          title: "Write the writeJSON helper",
          prompt: [
            "Fill in `writeJSON`. Set the `Content-Type` header to `application/json`, call `w.WriteHeader(status)`, then encode `v` with `json.NewEncoder(w).Encode(v)`.",
          ],
          starter: String.raw`package booking

import (
	"encoding/json"
	"net/http"
)

func writeJSON(w http.ResponseWriter, status int, v any) {
	// your code here
}`,
          solution: String.raw`package booking

import (
	"encoding/json"
	"net/http"
)

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}`,
          checks: [
            { re: /w\.Header\(\)\.Set\("Content-Type","application\/json"\)/, hint: "Set the content type first: `w.Header().Set(\"Content-Type\", \"application/json\")`." },
            { re: /w\.WriteHeader\(status\)/, hint: "Send the status the caller passed in: `w.WriteHeader(status)` — after the header, before the body." },
            { re: /json\.NewEncoder\(w\)\.Encode\(v\)/, hint: "Stream the value straight to the response: `json.NewEncoder(w).Encode(v)`." },
          ],
          success: "That's the helper every handler in the PawWalk API will lean on — one line to answer in JSON with the right status.",
        },
      ],
    },
    {
      id: "middleware",
      title: "Middleware",
      steps: [
        {
          type: "text",
          md: [
            "## Code that wraps every request",
            "Some work belongs to *every* endpoint: logging each request, checking a login token, timing how long a handler ran. You don't want to copy that into all twenty handlers. **Middleware** is the answer — a function that wraps a handler, does its work, and passes control along.",
            "In Go, a handler is anything satisfying the `http.Handler` interface (it has a `ServeHTTP(w, r)` method). Middleware is a function that **takes a handler and returns a new handler**:",
            "```go\nfunc(next http.Handler) http.Handler\n```",
            "The `next` handler is the real work; the returned handler is your wrapper around it.",
          ],
        },
        {
          type: "text",
          md: [
            "## The shape, piece by piece",
            "The wrapper you return is built with `http.HandlerFunc` — an adapter that turns a plain `func(w, r)` into an `http.Handler`:",
            "- `func logging(next http.Handler) http.Handler {` — takes the next handler, promises to return one.\n- `return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { ... })` — wrap a closure so it counts as a handler.\n- Inside the closure, do your work, then **call `next.ServeHTTP(w, r)`** to run the wrapped handler.",
            "> If you forget `next.ServeHTTP(w, r)`, the chain dead-ends: your middleware runs but the real handler never does. That missing line is the classic middleware bug.",
          ],
        },
        {
          type: "code",
          title: "internal/server/middleware.go",
          source: String.raw`package server

import (
	"log"
	"net/http"
	"time"
)

func logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s took %s", r.Method, r.URL.Path, time.Since(start))
	})
}`,
          caption: "The closure captures `next`. Work before the `ServeHTTP` call runs on the way in; work after runs on the way out — here, timing the whole handler.",
        },
        {
          type: "text",
          md: [
            "## Chaining several",
            "Because middleware takes a handler and returns a handler, you nest them like Russian dolls. Each wraps the next, and the innermost is your real handler:",
            "```go\nmux := http.NewServeMux()\nmux.HandleFunc(\"/walkers\", listWalkers)\nhandler := logging(auth(mux))\nhttp.ListenAndServe(\":8080\", handler)\n```",
            "A request now flows `logging → auth → mux → listWalkers`, and the responses unwind back out the same way. Order matters: `logging(auth(mux))` logs *around* the auth check; `auth(logging(mux))` would check auth first.",
          ],
        },
        {
          type: "quiz",
          q: "Your logging middleware runs and prints its line, but the actual page never renders — the response is empty. What did you most likely forget?",
          choices: [
            "To call next.ServeHTTP(w, r) inside the wrapper",
            "To import the log package",
            "To return http.StatusOK",
            "To close the request body",
          ],
          answer: 0,
          explain: "The wrapper's whole job is to eventually hand control to `next`. Without `next.ServeHTTP(w, r)`, your middleware runs but the wrapped handler never does — so nothing writes the body.",
          nudge: "Middleware runs, but the real handler didn't. What's the one line that passes control along?",
        },
        {
          type: "exercise",
          title: "Write a logging middleware",
          prompt: [
            "Write `logging`. It takes `next http.Handler` and returns an `http.Handler`. Return `http.HandlerFunc(...)` wrapping a `func(w http.ResponseWriter, r *http.Request)` that logs the method, then calls `next.ServeHTTP(w, r)`.",
          ],
          starter: String.raw`package server

import (
	"log"
	"net/http"
)

func logging(next http.Handler) http.Handler {
	// your code here
}`,
          solution: String.raw`package server

import (
	"log"
	"net/http"
)

func logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}`,
          checks: [
            { re: /func logging\(next http\.Handler\)http\.Handler\{/, hint: "The signature takes the next handler and returns one: `func logging(next http.Handler) http.Handler {`." },
            { re: /return http\.HandlerFunc\(func\(/, hint: "Wrap a closure so it counts as a handler: `return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { ... })`." },
            { re: /next\.ServeHTTP\(w,r\)/, hint: "Pass control to the wrapped handler with `next.ServeHTTP(w, r)` — the line that keeps the chain alive." },
          ],
          success: "That's real, composable middleware. Wrap your mux in it and every request gets logged for free.",
        },
      ],
    },
    {
      id: "requests",
      title: "Decoding & validating requests",
      steps: [
        {
          type: "text",
          md: [
            "## Reading the request body",
            "A `POST /bookings` carries a JSON body — the walker id, the date, how long. On the server, that body is `r.Body`, a stream of bytes. You decode it into a Go struct with `encoding/json`:",
            "```go\ntype createBookingReq struct {\n\tWalkerID string `json:\"walker_id\"`\n\tMinutes  int    `json:\"minutes\"`\n}\n```",
            "The `json:\"walker_id\"` **struct tag** tells the decoder which JSON key fills which field. (Tags live inside Go backticks, so you'll only ever see them in read-only snippets like this one — never type one into an exercise.)",
          ],
        },
        {
          type: "text",
          md: [
            "## Decode, then always close",
            "`json.NewDecoder(r.Body).Decode(&req)` reads the stream and fills your struct. You pass `&req` — a **pointer** — so `Decode` can write into your variable. It returns an `error`: non-nil means the body was missing or malformed, which is the client's fault, so you answer `400`.",
            "And you always close the body when you're done — `defer r.Body.Close()` schedules that cleanup the moment the function returns, no matter which path it takes.",
          ],
        },
        {
          type: "code",
          title: "internal/booking/handler.go",
          source: String.raw`package booking

import (
	"encoding/json"
	"net/http"
)

func createBooking(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var req createBookingReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
		return
	}
	if req.WalkerID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "walker_id is required"})
		return
	}
	writeJSON(w, http.StatusCreated, req)
}`,
          caption: "Three checks in order: could we parse it? is the required field present? If both pass, we answer 201 with the parsed booking. Note `writeJSON` — the helper you wrote in lesson 1.",
        },
        {
          type: "text",
          md: [
            "## Why validate at all?",
            "`Decode` catches *malformed* JSON — a stray comma, a truncated stream. It does **not** catch *empty* or *nonsensical* values: an empty `walker_id`, `minutes: -5`, a booking for a walker who doesn't exist. That's your job.",
            "Validate every field you depend on and return `400` with a clear message when it's wrong. A good error body saves the app developer — you, last course — an afternoon of guessing.",
            "> Rule of thumb: never trust the body. Decode it, then check each field before you touch the database.",
          ],
        },
        {
          type: "quiz",
          q: "Why does `Decode` take `&req` (the address of your struct) rather than `req` itself?",
          choices: [
            "So Decode can write the parsed values back into your variable",
            "Pointers make the decode run faster",
            "Because JSON keys are always pointers",
            "To make a copy of req that Decode can safely discard",
          ],
          answer: 0,
          explain: "Go passes arguments by value — a plain `req` would hand `Decode` a copy, and your original would stay empty. Passing `&req` gives `Decode` the address, so it fills the struct you actually keep.",
          nudge: "If Decode only got a copy of your struct, where would the parsed data end up?",
        },
        {
          type: "exercise",
          title: "Decode and validate a booking",
          prompt: [
            "Inside `createBooking`, decode the body into `req` with `json.NewDecoder(r.Body).Decode(&req)`. If it errors, return `400` via `writeJSON`. Then check that `req.WalkerID` is not empty (`req.WalkerID == \"\"`), returning `400` if it is.",
          ],
          starter: String.raw`func createBooking(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var req createBookingReq
	// your code here

	writeJSON(w, http.StatusCreated, req)
}`,
          solution: String.raw`func createBooking(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var req createBookingReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
		return
	}
	if req.WalkerID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "walker_id is required"})
		return
	}

	writeJSON(w, http.StatusCreated, req)
}`,
          checks: [
            { re: /json\.NewDecoder\(r\.Body\)\.Decode\(&req\)/, hint: "Decode the body into your struct's address: `json.NewDecoder(r.Body).Decode(&req)`." },
            { re: /err!=nil\{/, hint: "Check the decode's return: `if err := ...; err != nil {` — a non-nil error means bad input." },
            { re: /req\.WalkerID==""/, hint: "Reject an empty required field: `if req.WalkerID == \"\" {`." },
            { re: /http\.StatusBadRequest/, hint: "Answer bad input with `writeJSON(w, http.StatusBadRequest, ...)` — a 400." },
          ],
          success: "You just wrote the front door of a real POST endpoint: decode, validate, and refuse bad input before it reaches your data.",
        },
      ],
    },
  ],
});
