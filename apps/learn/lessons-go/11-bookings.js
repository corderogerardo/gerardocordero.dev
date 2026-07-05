window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "go-bookings",
  title: "Bookings",
  emoji: "📅",
  lang: "go",
  lessons: [
    {
      id: "domain",
      title: "The Booking domain",
      steps: [
        {
          type: "text",
          md: [
            "## The heart of the app",
            "PawWalk sells one thing: a walk. A **booking** is the record of one — *this user* hired *this walker* for *this long*, at *this time*, for *this price*. Every other feature (payments, GPS tracking, the chat) hangs off a booking. So the type that models it is the most important struct in the whole backend.",
            "In the iOS course you already saw this shape from the app's side — a booking form that posted a walker id, a duration, and a date. Now you build the thing that receives it and gives it a life: a status, a price, an id.",
          ],
        },
        {
          type: "text",
          md: [
            "## The fields, one by one",
            "A booking is just data, but each field earns its place:",
            "- **`ID`** — the booking's own identifier, so the app can ask for `GET /bookings/42`.\n- **`WalkerID` / `UserID`** — who's walking, who's paying. Both are ids pointing at other records.\n- **`DurationMinutes`** — 30, 45, or 60. PawWalk sells three lengths.\n- **`PriceCents`** — money in **cents**, always an `int`. Never store money as a float — `0.1 + 0.2` isn't `0.3` in floating point, and that rounding error is a lawsuit.\n- **`Status`** — where the booking is in its life: pending, confirmed, cancelled.\n- **`ScheduledAt`** — *when* the walk happens, as a real timestamp.",
          ],
        },
        {
          type: "text",
          md: [
            "## Time is its own type",
            "That last field isn't a string. Go's standard library ships a proper time type in the **`time`** package — `time.Time` — that knows about time zones, comparison, and arithmetic. Storing a date as `\"2026-07-05\"` text would force you to parse it every time you wanted to ask \"is this in the past?\". A `time.Time` answers that with `t.Before(time.Now())`.",
            "You import it like any package: `import \"time\"`, then use `time.Time` as the field's type.",
          ],
        },
        {
          type: "code",
          title: "internal/booking/booking.go",
          source: String.raw`package booking

import "time"

type Booking struct {
	ID              string
	WalkerID        string
	UserID          string
	DurationMinutes int
	PriceCents      int
	Status          Status
	ScheduledAt     time.Time
}`,
          caption: "The whole domain in one struct. Notice `Status` — the field's type is another type you're about to define, not a plain string. And `ScheduledAt` is a real `time.Time`, so comparisons are one method call away.",
        },
        {
          type: "text",
          md: [
            "## Over the wire it carries JSON tags",
            "When this struct is encoded to JSON for the app, each field gets a **struct tag** naming its JSON key — the same tags you met when decoding requests:",
            "```go\ntype Booking struct {\n\tID              string    `json:\"id\"`\n\tWalkerID        string    `json:\"walker_id\"`\n\tUserID          string    `json:\"user_id\"`\n\tDurationMinutes int       `json:\"duration_minutes\"`\n\tPriceCents      int       `json:\"price_cents\"`\n\tStatus          Status    `json:\"status\"`\n\tScheduledAt     time.Time `json:\"scheduled_at\"`\n}\n```",
            "Those tags live inside Go backticks, so you'll only ever see them in read-only snippets like this — never type one into an exercise. The exercises below use the tag-free form.",
          ],
        },
        {
          type: "text",
          md: [
            "## Why `Status` is its own type",
            "You could type `Status` as a plain `string` and pass `\"pending\"` around. Don't. Instead, Go lets you make a **named type on top of string**:",
            "```go\ntype Status string\n```",
            "Now `Status` is a distinct type. You declare its allowed values as **typed constants** — `const StatusPending Status = \"pending\"` — and use those names everywhere. Two payoffs: a typo like `\"pendign\"` becomes a compile error instead of a silent bug, and every place that reads a `Status` documents itself. This is the same instinct as an `enum` in Swift, expressed the Go way.",
            "> A named string type is still a string underneath — it prints as `\"pending\"`, encodes to JSON as `\"pending\"` — but the compiler now guards which strings are allowed to be one.",
          ],
        },
        {
          type: "quiz",
          q: "Why declare `type Status string` and typed constants instead of just passing the plain string `\"pending\"` around the code?",
          choices: [
            "The compiler catches typos and each Status value is named in one place",
            "Named types make the program run faster at runtime",
            "A plain string cannot be stored in a struct field",
            "JSON can only encode named types, not plain strings",
          ],
          answer: 0,
          explain: "A named type turns a category of values into something the compiler understands. `StatusPending` is defined once; misspell it and the build fails. A bare `\"pending\"` scattered through the code is a typo waiting to slip past you.",
          nudge: "Think about what goes wrong when someone writes `\"pendign\"` by hand in the twentieth handler.",
        },
        {
          type: "exercise",
          title: "Define the Status type",
          prompt: [
            "Declare `type Status string`, then declare two constants of that type: `StatusPending` equal to `\"pending\"` and `StatusConfirmed` equal to `\"confirmed\"`. Each constant is `const NAME Status = \"value\"`.",
          ],
          starter: String.raw`package booking

// Define a Status string type and two typed constants of it.
// your code here
`,
          solution: String.raw`package booking

type Status string

const StatusPending Status = "pending"
const StatusConfirmed Status = "confirmed"
`,
          checks: [
            { re: /type Status string/, hint: "Start with the named type: `type Status string` — a distinct type built on string." },
            { re: /const StatusPending Status="pending"/, hint: "Declare the constant with its type and value: `const StatusPending Status = \"pending\"`." },
            { re: /const StatusConfirmed Status="confirmed"/, hint: "Now the second one, same shape: `const StatusConfirmed Status = \"confirmed\"`." },
          ],
          mustNot: [
            { re: /StatusPending string=/, hint: "The constant's type is `Status`, not `string` — `const StatusPending Status = \"pending\"`." },
          ],
          success: "That's the vocabulary of a booking's life. Add StatusCancelled and StatusCompleted the same way and the whole state machine is named and typed.",
        },
      ],
    },
    {
      id: "create",
      title: "Creating a booking",
      steps: [
        {
          type: "text",
          md: [
            "## From request to record",
            "A `POST /bookings` arrives carrying a walker id, a user id, a duration, and a time. Your handler's job is to turn that raw request into a real `Booking`: decode the body, figure out the **price**, stamp it **pending**, and answer `201 Created` with the finished record.",
            "You already know the front half — decode with `json.NewDecoder(r.Body).Decode(&req)` and reject bad JSON with a `400`. This lesson is about the middle: computing the fields the *server* owns, not the ones the client sent.",
          ],
        },
        {
          type: "text",
          md: [
            "## The client doesn't set the price",
            "Never trust a client-sent price — a walker could post `price_cents: 1` and get a free hour. The **server** owns the price. It's a pure function of the duration:",
            "- 30 minutes → **1500** cents ($15)\n- 45 minutes → **2000** cents ($20)\n- 60 minutes → **2500** cents ($25)",
            "That mapping wants a small helper, `priceForDuration(minutes int) int`. A `switch` on the minutes is the clearest way to write it — one `case` per length, returning the cents. The status is just as much the server's call: a brand-new booking is always **pending** until a walker confirms it, so the handler stamps `StatusPending` itself.",
          ],
        },
        {
          type: "code",
          title: "internal/booking/handler.go",
          source: String.raw`package booking

import (
	"encoding/json"
	"net/http"
	"time"
)

type createBookingReq struct {
	WalkerID    string
	UserID      string
	Minutes     int
	ScheduledAt time.Time
}

func createBooking(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var req createBookingReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON"})
		return
	}

	b := Booking{
		ID:              newID(),
		WalkerID:        req.WalkerID,
		UserID:          req.UserID,
		DurationMinutes: req.Minutes,
		PriceCents:      priceForDuration(req.Minutes),
		Status:          StatusPending,
		ScheduledAt:     req.ScheduledAt,
	}

	writeJSON(w, http.StatusCreated, b)
}`,
          caption: "The server fills in what the server owns: a fresh `ID`, the `PriceCents` it computed, and `StatusPending`. The client only supplied who, how long, and when. Then `201 Created` with the whole booking.",
        },
        {
          type: "text",
          md: [
            "## A switch that returns",
            "Go's `switch` is tidy for this. There's no fall-through by default — each `case` runs and stops — and a `case` can just `return`. A `default` catches any duration you didn't sell (return `0`, and the validation in the next lesson will reject it before it ever reaches here):",
            "```go\nswitch minutes {\ncase 30:\n\treturn 1500\ncase 45:\n\treturn 2000\ncase 60:\n\treturn 2500\ndefault:\n\treturn 0\n}\n```",
            "> A `switch` with `return` in every branch needs no `break` and no explicit result variable — each case answers and exits. It reads like a price list.",
          ],
        },
        {
          type: "quiz",
          q: "Why should the server compute `PriceCents` from the duration instead of reading a price sent in the request body?",
          choices: [
            "A client could send any price it likes; the server must be the source of truth for money",
            "Computing on the server is the only way to store an int",
            "JSON cannot encode a price field",
            "The client has no way to know the duration",
          ],
          answer: 0,
          explain: "Anything the client sends, a malicious client can forge. Price is money, so the server owns it — it derives the cents from the duration it trusts. The same rule applies to status, ids, and timestamps you generate.",
          nudge: "Imagine the request body said `price_cents: 0`. Who gets to decide what a walk costs?",
        },
        {
          type: "exercise",
          title: "Write priceForDuration",
          prompt: [
            "Write `func priceForDuration(minutes int) int` using a `switch minutes`. Return `1500` for `case 30`, `2000` for `case 45`, `2500` for `case 60`, and `0` in the `default`.",
          ],
          starter: String.raw`package booking

func priceForDuration(minutes int) int {
	// your code here
}
`,
          solution: String.raw`package booking

func priceForDuration(minutes int) int {
	switch minutes {
	case 30:
		return 1500
	case 45:
		return 2000
	case 60:
		return 2500
	default:
		return 0
	}
}
`,
          checks: [
            { re: /func priceForDuration\(minutes int\)int\{/, hint: "Match the signature exactly: `func priceForDuration(minutes int) int {`." },
            { re: /switch minutes\{/, hint: "Branch on the argument: `switch minutes {`." },
            { re: /case 30:/, hint: "One case per length — start with `case 30:`." },
            { re: /return 1500/, hint: "Thirty minutes costs 1500 cents: `return 1500`." },
          ],
          mustNot: [
            { re: /return 15\.0/, hint: "Money is cents as an int, never dollars as a float — return `1500`, not `15.0`." },
          ],
          success: "That's the price list as code — pure, testable, and the only place a walk's cost is decided.",
        },
      ],
    },
    {
      id: "rules",
      title: "Business rules",
      steps: [
        {
          type: "text",
          md: [
            "## Decoding isn't validating",
            "`Decode` proves the JSON *parsed*. It says nothing about whether the booking makes *sense*. Three rules stand between a decoded request and a real booking:",
            "- **Known duration** — PawWalk sells 30, 45, 60. A request for 37 minutes is nonsense; reject it.\n- **Not in the past** — you can't book a walk for yesterday.\n- **No double-booking** — a walker can't be in two places at once, so their slot must be free.",
            "Each rule that fails is a specific kind of wrong, and the app deserves to be told *which*. That's what domain errors are for.",
          ],
        },
        {
          type: "text",
          md: [
            "## Domain errors are named values",
            "In Go an error is any value with an `Error() string` method, and the simplest one comes from `errors.New`. Declare each rule's failure as a package-level `var` so the whole package — and its tests — can refer to the *same* error value by name:",
            "```go\nvar (\n\tErrInvalidDuration = errors.New(\"invalid duration\")\n\tErrPastBooking     = errors.New(\"scheduled time is in the past\")\n\tErrSlotTaken       = errors.New(\"walker already booked for that slot\")\n)\n```",
            "Because `ErrInvalidDuration` is one shared value, a caller can ask \"is this *that* error?\" with `errors.Is(err, ErrInvalidDuration)` — instead of matching on the message text, which would break the moment someone reworded it.",
          ],
        },
        {
          type: "code",
          title: "internal/booking/rules.go",
          source: String.raw`package booking

import (
	"errors"
	"time"
)

var (
	ErrInvalidDuration = errors.New("invalid duration")
	ErrPastBooking     = errors.New("scheduled time is in the past")
	ErrSlotTaken       = errors.New("walker already booked for that slot")
)

func validateDuration(m int) error {
	switch m {
	case 30, 45, 60:
		return nil
	default:
		return ErrInvalidDuration
	}
}

func validateScheduledAt(t time.Time) error {
	if t.Before(time.Now()) {
		return ErrPastBooking
	}
	return nil
}`,
          caption: "Each validator returns `nil` when the rule holds and a named error when it doesn't. `validateDuration` folds three good cases into one `case 30, 45, 60`. `validateScheduledAt` leans on `time.Time`'s own `Before` — the reason you stored a real timestamp back in lesson 1.",
        },
        {
          type: "text",
          md: [
            "## Mapping errors to status codes",
            "The handler catches these errors and answers with the *right* HTTP status. Bad input from the client is a **`400 Bad Request`**. But a double-booking is different — the request was well-formed, it just **conflicts** with a booking that already exists. That's a **`409 Conflict`** (`http.StatusConflict`).",
            "One small function turns a domain error into a status code, using `errors.Is` so it matches the value, not the text:",
            "```go\nfunc statusForError(err error) int {\n\tswitch {\n\tcase errors.Is(err, ErrInvalidDuration), errors.Is(err, ErrPastBooking):\n\t\treturn http.StatusBadRequest\n\tcase errors.Is(err, ErrSlotTaken):\n\t\treturn http.StatusConflict\n\tdefault:\n\t\treturn http.StatusInternalServerError\n\t}\n}\n```",
            "A `switch` with no value after the keyword is Go's clean `if/else if` chain — each `case` is a boolean. The `default` maps anything unexpected to a `500`, because an error you didn't plan for is *your* bug, not the client's.",
          ],
        },
        {
          type: "text",
          md: [
            "## Where double-booking gets checked",
            "Duration and time you can check from the request alone. Whether the slot is free needs a look at the *other* bookings — so that check lives where the data does, in the store: fetch the walker's bookings for that time and return `ErrSlotTaken` if one already sits there. The handler doesn't care *how* it was decided; it just maps whatever error comes back through `statusForError` and answers.",
            "> This is the shape of every real endpoint: validate what you can from the request, ask the store about the rest, and translate any error into the HTTP status the client understands.",
          ],
        },
        {
          type: "quiz",
          q: "A perfectly valid booking request arrives, but that walker is already booked for the same time slot. Which HTTP status fits best?",
          choices: [
            "409 Conflict (http.StatusConflict)",
            "400 Bad Request (http.StatusBadRequest)",
            "404 Not Found (http.StatusNotFound)",
            "201 Created (http.StatusCreated)",
          ],
          answer: 0,
          explain: "The request was well-formed, so it isn't a `400`. It failed because it *conflicts* with state that already exists — a booking in that slot. `409 Conflict` says exactly that: try again with a different time.",
          nudge: "Nothing was malformed. The problem is that the request clashes with a booking that's already there.",
        },
        {
          type: "exercise",
          title: "Write validateDuration",
          prompt: [
            "Write `func validateDuration(m int) error`. Use a `switch m` that returns `nil` for `case 30, 45, 60`, and returns `ErrInvalidDuration` in the `default`. Assume `ErrInvalidDuration` is already declared in the package.",
          ],
          starter: String.raw`package booking

func validateDuration(m int) error {
	// your code here
}
`,
          solution: String.raw`package booking

func validateDuration(m int) error {
	switch m {
	case 30, 45, 60:
		return nil
	default:
		return ErrInvalidDuration
	}
}
`,
          checks: [
            { re: /func validateDuration\(m int\)error\{/, hint: "Match the signature: `func validateDuration(m int) error {` — it returns an `error`." },
            { re: /case 30,45,60:/, hint: "Fold the three good lengths into one case: `case 30, 45, 60:`." },
            { re: /return nil/, hint: "A valid duration is no error at all: `return nil`." },
            { re: /return ErrInvalidDuration/, hint: "Anything else is the named failure: `default: return ErrInvalidDuration`." },
          ],
          mustNot: [
            { re: /errors\.New\(/, hint: "Return the shared `ErrInvalidDuration` value, don't mint a new error with `errors.New` — callers match on the shared one with `errors.Is`." },
          ],
          success: "That's a business rule as a pure function — easy to test, and it returns the exact error the handler already knows how to turn into a 400.",
        },
      ],
    },
  ],
});
