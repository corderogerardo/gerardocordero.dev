# Go Academy Plan

## Summary

The Go course teaches backend development from zero: Go the language, then the
standard-library HTTP server, a real database, and finally a production PawWalk
backend — auth, bookings, tests, and deploy — all anchored in the PawWalk
dog-walking universe. Go's pitch for this course: one static binary, millisecond
startup, and goroutines that make concurrent network services natural.

`apps/learn/go.html` loads `apps/learn/lessons-go/*.js` with store key
`pawwalk-academy-go-v1`, so its progress is independent of the iOS/Android/Ruby/Python
courses. Format rules: `apps/learn/lessons-go/FORMAT-GO.md` on top of the shared
`apps/learn/lessons/FORMAT.md`. Validate with `node tools/validate.mjs lessons-go`
(or no argument for all five courses).

## Modules

| # | File | Title | Focus |
|---|---|---|---|
| 00 | `00-go-welcome.js` | Welcome to Go | Why Go; course map; first program; toolchain |
| 01 | `01-go-basics.js` | Go Basics | Variables, constants, zero values, functions, control flow |
| 02 | `02-collections.js` | Collections | Slices, maps, range, strings & runes |
| 03 | `03-structs-methods.js` | Structs & Methods | Structs, methods, pointers, embedding/composition |
| 04 | `04-interfaces-errors.js` | Interfaces & Errors | Implicit interfaces, error values, wrapping, `errors.Is/As` |
| 05 | `05-goroutines-channels.js` | Goroutines & Channels | Goroutines, `WaitGroup`, channels, `select`, `context`, `Mutex` |
| 06 | `06-http-stdlib.js` | HTTP with net/http | Handlers, JSON, the Go 1.22 `ServeMux` |
| 07 | `07-rest-api.js` | Building a REST API | Status codes, middleware, decoding & validating requests |
| 08 | `08-database.js` | Databases with database/sql | `sql.Open`, queries, `Exec`, the repository pattern |
| 09 | `09-pawwalk-kickoff.js` | PawWalk Kickoff | `cmd/`+`internal/` layout, env config, the walkers endpoint |
| 10 | `10-auth.js` | Authentication | bcrypt hashing, JWT tokens, auth middleware |
| 11 | `11-bookings.js` | Bookings | Booking domain, create handler, business rules |
| 12 | `12-testing.js` | Testing | `testing` pkg, table-driven tests, `httptest` |
| 13 | `13-deploy-graduation.js` | Ship It & Graduation | `go build`, cross-compile, multi-stage Docker, graduation |

### Interview-prep tier (post-graduation)

Mirrors the Ruby/Python courses, which append `data-structures` + `design-patterns`
modules after graduation. Content is original and PawWalk-anchored, informed by the
standard topic checklists in the popular Go interview repos (e.g. `tmrts/go-patterns`,
`loong/go-concurrency-exercises`, `Devinterview-io/golang-interview-questions`) —
used as coverage guides, not copied.

| # | File | Title | Focus |
|---|---|---|---|
| 14 | `14-data-structures.js` | Data Structures & Problem-Solving | Big-O, slices/maps, stacks/queues, two pointers, linked lists, trees & graphs |
| 15 | `15-design-patterns.js` | Design Patterns in Go | Functional options, strategy, factory, `sync.Once` singleton, decorator/middleware, observer, adapter, composition-over-inheritance |
| 16 | `16-concurrency-patterns.js` | Concurrency Patterns | Worker pools, fan-out/fan-in, pipelines + `context` cancellation, data races & the `-race` detector |

## Reference backend

The course rebuilds a Go PawWalk backend from zero. Early modules (00–08) build
throwaway snippets and teach the standard library; modules 09–13 assemble a real
service layout (`cmd/api`, `internal/walker`, `internal/booking`, …) and title code
blocks with their paths so the mental model of a real project accrues. Unlike the
iOS/Ruby courses there is no committed Go app in the repo yet — the lessons are the
spec, mirroring how the Python course's `apps/backend` references were authored
ahead of the code.

## Engine support

Go is a first-class course language in the shared engine (`apps/learn/app.js`):
`lang: "go"` adds a Go keyword set and token regex for syntax highlighting and
routes through the C-style normalizer (`//` and `/* */` comments stripped) for
exercise checking — the same normalization Swift and Kotlin use. `go` is in the
validator's `KNOWN_LANGS`, and `lessons-go` is in its `ALL_DIRS`, so the
`deploy-learn` CI gate validates the Go course alongside the other four.

## The one Go-specific authoring trap

Go raw-string literals and struct tags use backticks (`` `json:"name"` ``), which
collide with the `String.raw` backtick templates that hold every code field. The
rule (enforced by convention, documented in `FORMAT-GO.md`): never put a backtick
inside a `source`/`starter`/`solution` field — use double-quoted strings, and show
struct tags only in a `text` step's markdown fenced block, never in a checked
exercise.
