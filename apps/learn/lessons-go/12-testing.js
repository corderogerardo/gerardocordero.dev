window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "go-testing",
  title: "Testing",
  emoji: "🧪",
  lang: "go",
  lessons: [
    {
      id: "basics",
      title: "The testing package",
      steps: [
        {
          type: "text",
          md: [
            "## Tests ship with the language",
            "In Part I you leaned on Xcode's test target. Go needs no target, no framework, and no dependency: the standard library ships a `testing` package, and the `go test` command runs it. Write a function that starts with `Test`, and Go finds it and runs it.",
            "Tests live in files named `_test.go` next to the code they exercise. If you're testing `price.go` in package `walker`, you write `price_test.go` in the **same package** — it can see unexported helpers and all. Those `_test.go` files are invisible to a normal `go build`; they only compile when you run `go test`.",
          ],
        },
        {
          type: "text",
          md: [
            "## The shape of a test function",
            "A test is a function that takes one argument, `t *testing.T`, and returns nothing:",
            "```\nfunc TestPriceLabel(t *testing.T) {\n    // ... check something ...\n}\n```",
            "The name **must** start with a capital `Test`, and the `*testing.T` gives you the reporting tools. A test that never complains is a test that passed — you don't `return true` or assert; you only speak up when something is wrong.",
            "> `*testing.T` is a pointer to a value the test runner owns. You'll see the `*` on pointers everywhere in Go; here it just means \"the test's control handle.\"",
          ],
        },
        {
          type: "code",
          title: "internal/walker/price_test.go",
          source: String.raw`package walker

import "testing"

func TestPriceLabel(t *testing.T) {
	got := PriceLabel(2500)
	want := "$25 / 30 min"
	if got != want {
		t.Errorf("got %s, want %s", got, want)
	}
}`,
          caption: "The whole test in one breath: compute got, state want, compare. If they differ, t.Errorf records the failure and moves on.",
        },
        {
          type: "text",
          md: [
            "## `got` and `want`, and how to fail",
            "That `got` / `want` pairing is a Go convention, not a rule — but it's everywhere, and following it makes failures instantly readable. Compute the real value into `got`, write the expected value into `want`, compare.",
            "Two ways to report a failure:",
            "- **`t.Errorf(...)`** records the failure but lets the test keep running — good when later checks are still worth doing.\n- **`t.Fatalf(...)`** records it and stops this test immediately — use it when continuing makes no sense (e.g. a value you were about to dereference is nil).",
            "Both take a format string just like `fmt.Printf`: `t.Errorf(\"got %s, want %s\", got, want)`.",
          ],
        },
        {
          type: "quiz",
          q: "Where does a test for `PriceLabel` in package `walker` live, and what must its function be named?",
          choices: [
            "In a `_test.go` file in the same package, in a function whose name starts with `Test`",
            "In a `tests/` folder, in any function you register with the runner",
            "In the same `price.go` file, in a function named `check_PriceLabel`",
            "Anywhere, as long as you import a third-party test framework first",
          ],
          answer: 0,
          explain: "Go finds tests by convention: files ending in `_test.go`, functions starting with `Test` that take `t *testing.T`. No registration, no framework, no folder magic — `go test` does the discovery.",
          nudge: "Think about what `go test` scans for. It's all naming convention — file suffix and function prefix.",
        },
        {
          type: "text",
          md: [
            "## Running them",
            "One command runs every test in the current module:",
            "```\ngo test ./...\n```",
            "The `./...` means \"this package and every package beneath it.\" You'll see a `PASS` or a list of failures with the file and line of each `t.Errorf`. Add `-v` (`go test -v ./...`) to see each test name as it runs — handy while you're writing them.",
          ],
        },
        {
          type: "exercise",
          title: "Write your first test",
          prompt: [
            "Fill in `TestPriceLabel`. Call `PriceLabel(2500)` into `got`, set `want` to `\"$25 / 30 min\"`, then compare with `if got != want {` and report a mismatch with `t.Errorf(\"got %s, want %s\", got, want)`.",
          ],
          starter: String.raw`package walker

import "testing"

func TestPriceLabel(t *testing.T) {
	got := PriceLabel(2500)
	want := "$25 / 30 min"
	// your code here
}`,
          solution: String.raw`package walker

import "testing"

func TestPriceLabel(t *testing.T) {
	got := PriceLabel(2500)
	want := "$25 / 30 min"
	if got != want {
		t.Errorf("got %s, want %s", got, want)
	}
}`,
          checks: [
            { re: /func TestPriceLabel\(t\*testing\.T\)\{/, hint: "The signature is exactly `func TestPriceLabel(t *testing.T) {` — capital `Test` prefix, one `*testing.T` argument." },
            { re: /if got!=want\{/, hint: "Compare with `if got != want {` — a test only speaks up when the values differ." },
            { re: /t\.Errorf\("got%s,want%s",got,want\)/, hint: "Report the failure with `t.Errorf(\"got %s, want %s\", got, want)` — the format verbs `%s` fill in from the two trailing arguments." },
          ],
          mustNot: [
            { re: /return/, hint: "A Go test never returns a value — it stays silent on success and calls `t.Errorf`/`t.Fatalf` on failure." },
          ],
          success: "That's a real Go test. Drop it in `price_test.go`, run `go test ./...`, and it guards `PriceLabel` forever.",
        },
      ],
    },
    {
      id: "table-driven",
      title: "Table-driven tests",
      steps: [
        {
          type: "text",
          md: [
            "## One test, many cases",
            "You rarely want to check just one input. `PriceLabel` should be right for 2500, for 0, for an odd number of cents. Copy-pasting the `got`/`want` block three times is noisy and easy to get wrong.",
            "Go's answer is the **table-driven test**: list your cases as data in a slice, then loop over them running the same assertion for each. It's the single most common Go testing pattern — you'll see it in the standard library itself.",
          ],
        },
        {
          type: "text",
          md: [
            "## The table is a slice of structs",
            "Each case is a little struct — a name for the case, the input, and the expected output. You declare the struct type inline (an *anonymous struct*) and fill it in the same expression:",
            "```\ntests := []struct {\n    name string\n    in   int\n    want string\n}{\n    {\"whole dollars\", 2500, \"$25 / 30 min\"},\n    {\"zero\", 0, \"$0 / 30 min\"},\n}\n```",
            "`[]struct{ ... }` is a slice whose element type is that struct. The `{...}` right after the closing brace is the slice literal holding the cases. Each inner `{...}` is one case, fields in order.",
          ],
        },
        {
          type: "text",
          md: [
            "## The loop and `t.Run`",
            "Now walk the table with `range` and run each case as its own **subtest** using `t.Run`:",
            "```\nfor _, tt := range tests {\n    t.Run(tt.name, func(t *testing.T) {\n        got := PriceLabel(tt.in)\n        if got != tt.want {\n            t.Errorf(\"got %s, want %s\", got, tt.want)\n        }\n    })\n}\n```",
            "`t.Run(name, fn)` gives each case its own named subtest, so a failure prints `TestPriceLabel/zero` — you know instantly *which* case broke. The convention `tt` (short for \"table test\") is what you'll see across Go codebases.",
            "> `_` is Go's blank identifier — here it throws away the index from `range` because we only want the case value `tt`.",
          ],
        },
        {
          type: "code",
          title: "internal/walker/price_test.go (table-driven)",
          source: String.raw`func TestPriceLabel(t *testing.T) {
	tests := []struct {
		name string
		in   int
		want string
	}{
		{"whole dollars", 2500, "$25 / 30 min"},
		{"zero", 0, "$0 / 30 min"},
		{"odd cents", 2550, "$25 / 30 min"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := PriceLabel(tt.in)
			if got != tt.want {
				t.Errorf("got %s, want %s", got, tt.want)
			}
		})
	}
}`,
          caption: "Add a case by adding a line to the table — the loop and assertion never change. That's the whole appeal.",
        },
        {
          type: "quiz",
          q: "Why wrap each case in `t.Run(tt.name, func(t *testing.T) { ... })` instead of just asserting inside the loop?",
          choices: [
            "Each case becomes a named subtest, so a failure tells you exactly which case broke and the others still run",
            "It makes the test run faster by skipping cases",
            "`t.Run` is required or Go won't discover the test",
            "It converts the test into a benchmark",
          ],
          answer: 0,
          explain: "`t.Run` names each case as a subtest (`TestPriceLabel/zero`) and isolates it — one case failing doesn't stop the rest, and the output points straight at the culprit. Without it, all cases blur into one test.",
          nudge: "Think about what you see in the output when case #2 of 10 fails.",
        },
        {
          type: "exercise",
          title: "Loop the table",
          prompt: [
            "The `tests` table is already built. Write the loop: `for _, tt := range tests {`, and inside it run each case as a subtest with `t.Run(tt.name, func(t *testing.T) {` — compare `PriceLabel(tt.in)` against `tt.want` and `t.Errorf` on mismatch.",
          ],
          starter: String.raw`func TestPriceLabel(t *testing.T) {
	tests := []struct {
		name string
		in   int
		want string
	}{
		{"whole dollars", 2500, "$25 / 30 min"},
		{"zero", 0, "$0 / 30 min"},
	}
	// your code here
}`,
          solution: String.raw`func TestPriceLabel(t *testing.T) {
	tests := []struct {
		name string
		in   int
		want string
	}{
		{"whole dollars", 2500, "$25 / 30 min"},
		{"zero", 0, "$0 / 30 min"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := PriceLabel(tt.in)
			if got != tt.want {
				t.Errorf("got %s, want %s", got, tt.want)
			}
		})
	}
}`,
          checks: [
            { re: /for _,tt:=range tests\{/, hint: "Walk the table with `for _, tt := range tests {` — the blank `_` discards the index, `tt` is each case." },
            { re: /t\.Run\(tt\.name,func\(t\*testing\.T\)\{/, hint: "Run each case as a subtest: `t.Run(tt.name, func(t *testing.T) {` — the case's `name` labels it." },
            { re: /if got!=tt\.want\{/, hint: "Compare the computed `got` against the case's expected value with `if got != tt.want {`." },
            { re: /t\.Errorf\("got%s,want%s",got,tt\.want\)/, hint: "Report a mismatch with `t.Errorf(\"got %s, want %s\", got, tt.want)`." },
          ],
          success: "That's the pattern you'll reach for in nearly every Go test file. New case? Add a row.",
        },
      ],
    },
    {
      id: "httptest",
      title: "Testing HTTP handlers",
      steps: [
        {
          type: "text",
          md: [
            "## Testing the server without a server",
            "In module 06 you wrote HTTP handlers — functions with the signature `func(w http.ResponseWriter, r *http.Request)`. How do you test one without actually starting a server and firing real network requests at a port?",
            "The standard library's `net/http/httptest` package is the answer. It hands you a fake request and a fake response writer, you call your handler directly with them, and then you inspect what it wrote. No ports, no networking, no flakiness — just a function call.",
          ],
        },
        {
          type: "text",
          md: [
            "## The two helpers",
            "- **`httptest.NewRequest(method, target, body)`** builds an `*http.Request` in memory — exactly what your handler expects as its second argument. For a body-less GET, pass `nil`.\n- **`httptest.NewRecorder()`** returns an `*httptest.ResponseRecorder` — a stand-in for `http.ResponseWriter` that *remembers* everything the handler writes: the status code in `.Code`, the body in `.Body`, headers in `.Header()`.",
            "```\nreq := httptest.NewRequest(\"GET\", \"/walkers\", nil)\nrec := httptest.NewRecorder()\n```",
            "You now have a request to send and a recorder to catch the response.",
          ],
        },
        {
          type: "text",
          md: [
            "## Call the handler, then assert",
            "A handler is just a function, so you call it directly — passing the recorder as the writer and the request as the request:",
            "```\nWalkersHandler(rec, req)\n```",
            "After it returns, the recorder holds the outcome. Check the status code and the body:",
            "```\nif rec.Code != http.StatusOK {\n    t.Errorf(\"got status %d, want %d\", rec.Code, http.StatusOK)\n}\n```",
            "`rec.Body` is a buffer; `rec.Body.String()` gives you the response text to compare or scan for expected content.",
          ],
        },
        {
          type: "code",
          title: "internal/walker/handler_test.go",
          source: String.raw`package walker

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestWalkersHandler(t *testing.T) {
	req := httptest.NewRequest("GET", "/walkers", nil)
	rec := httptest.NewRecorder()

	WalkersHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("got status %d, want %d", rec.Code, http.StatusOK)
	}
	if !strings.Contains(rec.Body.String(), "Mochi") {
		t.Errorf("body missing walker name: %s", rec.Body.String())
	}
}`,
          caption: "A full handler test with no network: build a request, record the response, assert on status then body. Note t.Fatalf on the status — no point checking the body if the request failed.",
        },
        {
          type: "quiz",
          q: "What does `httptest.NewRecorder()` give you, and why use it?",
          choices: [
            "An in-memory `http.ResponseWriter` that captures the status, body, and headers your handler writes — so you can assert on them without a real server",
            "A running HTTP server on a random port that you send real requests to",
            "A mock of the entire `net/http` package you configure by hand",
            "A tool that records your screen while the test runs",
          ],
          answer: 0,
          explain: "`NewRecorder()` returns a `*httptest.ResponseRecorder`, a fake `ResponseWriter` that remembers everything written to it. Your handler can't tell the difference, and afterward you read `.Code` and `.Body` to check what it produced — all in a plain function call.",
          nudge: "It stands in for the thing a handler writes to. What would you need to read back afterward?",
        },
        {
          type: "exercise",
          title: "Set up a handler test",
          prompt: [
            "Start `TestWalkersHandler`. Build the fake request with `req := httptest.NewRequest(\"GET\", \"/walkers\", nil)` and the response recorder with `rec := httptest.NewRecorder()`. (The next lines that call the handler and assert are already there.)",
          ],
          starter: String.raw`func TestWalkersHandler(t *testing.T) {
	// your code here

	WalkersHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("got status %d, want %d", rec.Code, http.StatusOK)
	}
}`,
          solution: String.raw`func TestWalkersHandler(t *testing.T) {
	req := httptest.NewRequest("GET", "/walkers", nil)
	rec := httptest.NewRecorder()

	WalkersHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("got status %d, want %d", rec.Code, http.StatusOK)
	}
}`,
          checks: [
            { re: /req:=httptest\.NewRequest\("GET","\/walkers",nil\)/, hint: "Build the request with `req := httptest.NewRequest(\"GET\", \"/walkers\", nil)` — method, path, and `nil` for the empty GET body." },
            { re: /rec:=httptest\.NewRecorder\(\)/, hint: "Create the recorder with `rec := httptest.NewRecorder()` — it captures whatever the handler writes." },
          ],
          mustNot: [
            { re: /http\.ListenAndServe/, hint: "No real server needed — `httptest` calls the handler directly. Don't start `http.ListenAndServe`." },
          ],
          success: "That's the httptest setup you'll reuse for every handler: a recorded request, a recorder, then call and assert. Your PawWalk backend now has tests at every layer.",
        },
      ],
    },
  ],
});
