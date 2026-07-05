window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "go-auth",
  title: "Authentication",
  emoji: "🔐",
  lang: "go",
  lessons: [
    {
      id: "hashing",
      title: "Password hashing",
      steps: [
        {
          type: "text",
          md: [
            "## Never store the password",
            "PawWalk needs accounts: a walker signs up with an email and a password, and later logs back in. The tempting mistake is to save that password in the database as-is. **Don't.** If your database ever leaks — a backup goes missing, a query is logged, an intern runs the wrong `SELECT` — every plaintext password is exposed, and people reuse passwords everywhere.",
            "The rule every backend follows: **you never store the password, you store a one-way hash of it.** A hash is a fingerprint — you can compute it from the password, but you can't run it backwards to recover the password. At login you hash what the user typed and compare fingerprints.",
            "> Even you, the person who runs the server, should be unable to recover a user's password. That's the whole point.",
          ],
        },
        {
          type: "text",
          md: [
            "## Why not just SHA-256?",
            "You may have heard of hash functions like SHA-256. They're the *wrong* tool here for one reason: they're **fast**. An attacker who steals your hashes can try billions of password guesses per second on a GPU, hashing each one and checking for a match.",
            "Password hashing wants the opposite — a function that is *deliberately slow* and *salted* (so two users with the same password get different hashes). The industry-standard choice in Go is **bcrypt**, from `golang.org/x/crypto/bcrypt`. It builds in a salt and a tunable **cost** that makes each hash take a measurable fraction of a second — trivial for one honest login, ruinous for an attacker trying millions.",
            "You add it to your module once:",
            "```\ngo get golang.org/x/crypto/bcrypt\n```",
          ],
        },
        {
          type: "code",
          title: "internal/auth/password.go",
          source: String.raw`package auth

import "golang.org/x/crypto/bcrypt"

// HashPassword turns a plaintext password into a storable bcrypt hash.
func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// CheckPassword reports whether password matches the stored hash.
func CheckPassword(hash, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}`,
          caption: "bcrypt speaks bytes, not strings, so everything is wrapped in []byte(...). GenerateFromPassword returns (hash, error); CompareHashAndPassword returns a single error — nil means the password matched.",
        },
        {
          type: "text",
          md: [
            "## Read the two calls closely",
            "- **`bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)`** — takes the password as bytes and a *cost*. `bcrypt.DefaultCost` (currently 10) is a sensible default; a bigger number is slower and stronger. It returns `(hash, error)` — the hash already contains the salt and the cost baked in, so you store just that one string.",
            "- **`bcrypt.CompareHashAndPassword(hash, []byte(pw))`** — re-hashes the candidate password using the salt and cost it reads out of the stored hash, then compares. It returns an **`error`**: `nil` means a match, a non-nil error means no match. There is no `bool` — you check `err == nil`.",
            "> Notice you never compare hashes yourself with `==`. bcrypt does the comparison for you, in constant time, because it has to re-derive the salt first.",
          ],
        },
        {
          type: "quiz",
          q: "`bcrypt.CompareHashAndPassword(storedHash, []byte(typed))` returns `nil`. What does that mean?",
          choices: [
            "The typed password matches the stored hash — the login is valid",
            "Something went wrong and the comparison failed",
            "The password was empty",
            "The hash needs to be regenerated",
          ],
          answer: 0,
          explain: "CompareHashAndPassword returns an error, and nil is the 'no error' value — the password matched. A non-nil error (like bcrypt.ErrMismatchedHashAndPassword) means it did not. That's why the idiom is `if err == nil` for a successful login.",
          nudge: "In Go, a returned error of nil means 'nothing went wrong.' Here 'nothing went wrong' means the passwords lined up.",
        },
        {
          type: "quiz",
          q: "Why is bcrypt preferred over a fast hash like SHA-256 for passwords?",
          choices: [
            "It is deliberately slow and salted, which cripples brute-force guessing",
            "It produces shorter hashes that save database space",
            "It can be reversed to recover the original password when needed",
            "It does not require importing any package",
          ],
          answer: 0,
          explain: "bcrypt's slowness is a feature: a single honest login barely notices, but an attacker trying to test billions of guesses against a stolen database is throttled to a crawl. The built-in per-user salt also means identical passwords never share a hash.",
          nudge: "Think about what an attacker with your leaked hashes wants to do, and which property gets in their way.",
        },
        {
          type: "exercise",
          title: "Hash a signup password",
          prompt: [
            "A new walker is signing up. Inside `HashPassword`, call `bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)`, capturing `hash` and `err`. If `err != nil`, return `\"\", err`. Otherwise return `string(hash), nil`.",
          ],
          starter: String.raw`package auth

import "golang.org/x/crypto/bcrypt"

func HashPassword(password string) (string, error) {
	// your code here
}`,
          solution: String.raw`package auth

import "golang.org/x/crypto/bcrypt"

func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}`,
          checks: [
            { re: /hash,err:=bcrypt\.GenerateFromPassword/, hint: "Capture both return values with `:=` — `hash, err := bcrypt.GenerateFromPassword(...)`." },
            { re: /bcrypt\.GenerateFromPassword\(\[\]byte\(password\),bcrypt\.DefaultCost\)/, hint: "Pass the password as bytes and the cost: `bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)`." },
            { re: /err!=nil/, hint: "Guard the error first — `if err != nil { return \"\", err }`." },
            { re: /return string\(hash\),nil/, hint: "bcrypt hands you bytes; store a string — `return string(hash), nil`." },
          ],
          mustNot: [
            { re: /sha256/, hint: "Use bcrypt for passwords, not a fast hash like SHA-256." },
          ],
          success: "That's exactly the password.go you'll ship. Every account's stored 'password' is now an un-reversible bcrypt hash.",
        },
      ],
    },
    {
      id: "jwt",
      title: "JWT tokens",
      steps: [
        {
          type: "text",
          md: [
            "## After login, then what?",
            "Hashing solves *proving who you are once* — at login. But HTTP is **stateless**: the next request PawWalk makes (list my bookings, start a walk) arrives as a fresh connection that knows nothing about the login that just happened. Something has to travel with every request to say *\"I'm the walker who logged in a minute ago.\"*",
            "That something is a **token**. When login succeeds, the server hands the client a token; the app stores it and attaches it to every later request. The classic way to make that token trustworthy without a database lookup on every call is a **JWT** — a JSON Web Token.",
          ],
        },
        {
          type: "text",
          md: [
            "## What a JWT actually is",
            "A JWT is three base64 chunks joined by dots: `header.payload.signature`. The **payload** is just JSON — a set of **claims** like *who this is* and *when it expires*. The **signature** is the important part: the server signs the header+payload with a **secret key** only it knows. Anyone can read a JWT (it isn't encrypted), but nobody can forge or tamper with one, because they can't reproduce the signature without the secret.",
            "So when a token comes back later, the server just re-checks the signature with its secret. Valid signature → this token really came from us → trust the claims inside. No session table, no database hit. That's why JWTs are called **stateless** auth.",
            "> Because anyone can *read* a JWT, never put secrets in the claims. A user id and an expiry are fine; a password is not.",
          ],
        },
        {
          type: "text",
          md: [
            "## The library and the pieces",
            "Go's go-to library is `github.com/golang-jwt/jwt/v5`. Three moving parts build a token:",
            "- **Claims** — `jwt.MapClaims{...}`, a `map` of the facts you're asserting. Two standard claim names: `\"sub\"` (the *subject* — who the token is about, i.e. the user id) and `\"exp\"` (the expiry, as a Unix timestamp).\n- **`jwt.NewWithClaims(method, claims)`** — bundles the claims with a **signing method**. `jwt.SigningMethodHS256` is HMAC-SHA256: one shared secret signs and verifies.\n- **`token.SignedString([]byte(secret))`** — actually signs it and returns the finished `header.payload.signature` string.",
            "```\ngo get github.com/golang-jwt/jwt/v5\n```",
          ],
        },
        {
          type: "code",
          title: "internal/auth/token.go",
          source: String.raw`package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// IssueToken signs a JWT that identifies userID and expires in 24 hours.
func IssueToken(userID, secret string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}`,
          caption: "\"sub\" carries the walker's id; \"exp\" is a Unix timestamp 24 hours out so a stolen token can't live forever. NewWithClaims pairs the claims with HS256; SignedString turns it into the dotted string you send back to the app.",
        },
        {
          type: "text",
          md: [
            "## Where the token lives on the app side",
            "In the iOS course, `APIClient` sent requests to this backend. Once login returns a JWT, the app stores it (in the Keychain) and adds it to every request as a header — `Authorization: Bearer <token>`. That header is the thread that ties an anonymous HTTP request back to a logged-in walker. Verifying it is the next lesson.",
            "For now, focus on **minting** the token: correct claims, a signing method, a secret.",
          ],
        },
        {
          type: "quiz",
          q: "Why can a server trust a JWT's claims without looking anything up in a database?",
          choices: [
            "The signature proves the token was made with the server's secret and hasn't been altered",
            "The claims are encrypted so no one else can read them",
            "The token is stored in a sessions table the server checks",
            "JWTs can only be created by the golang-jwt library",
          ],
          answer: 0,
          explain: "The signature is an HMAC of the header and payload using the server's secret. Re-computing it verifies both authenticity (it came from us) and integrity (nothing was changed). No lookup needed — that statelessness is the whole appeal. Note the claims are only signed, not encrypted, so they're readable by anyone.",
          nudge: "One of the three parts of a JWT is what makes tampering detectable. It isn't the header or the payload.",
        },
        {
          type: "exercise",
          title: "Mint a login token",
          prompt: [
            "Finish `IssueToken`. Build `claims` as a `jwt.MapClaims` with `\"sub\"` set to `userID` and `\"exp\"` set to `time.Now().Add(24 * time.Hour).Unix()`. Then create the token with `jwt.NewWithClaims(jwt.SigningMethodHS256, claims)`.",
          ],
          starter: String.raw`package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func IssueToken(userID, secret string) (string, error) {
	// your code here
	return token.SignedString([]byte(secret))
}`,
          solution: String.raw`package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func IssueToken(userID, secret string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}`,
          checks: [
            { re: /claims:=jwt\.MapClaims\{/, hint: "Start the claims with `claims := jwt.MapClaims{ ... }` — a map of your assertions." },
            { re: /"sub":userID/, hint: "The subject claim names the user — `\"sub\": userID`." },
            { re: /jwt\.NewWithClaims\(jwt\.SigningMethodHS256,claims\)/, hint: "Bundle claims with the signing method — `jwt.NewWithClaims(jwt.SigningMethodHS256, claims)`." },
          ],
          mustNot: [
            { re: /"password":/, hint: "Never put a password (or any secret) in a JWT claim — the payload is readable by anyone." },
          ],
          success: "You just issued a signed, self-expiring token. Login can now return this string, and the app will send it back on every request.",
        },
      ],
    },
    {
      id: "auth-middleware",
      title: "Auth middleware",
      steps: [
        {
          type: "text",
          md: [
            "## One guard for every protected route",
            "Now the app sends `Authorization: Bearer <token>` on each request. You *could* copy the same verify-the-token code into every handler — but that's the exact thing **middleware** exists to prevent. Middleware is a function that wraps a handler: it runs first, decides whether the request may proceed, and either calls the next handler or rejects the request.",
            "One `RequireAuth` middleware, wrapped around your bookings and walk routes, means every protected endpoint is guarded by the same audited code. Public routes (login, signup, the health check) simply aren't wrapped.",
          ],
        },
        {
          type: "text",
          md: [
            "## Pull the token out of the header",
            "The token arrives inside a header whose value looks like `Bearer eyJhbGci...`. Two standard-library moves extract it:",
            "- **`r.Header.Get(\"Authorization\")`** — reads the header value (empty string if it's absent). `r` is the `*http.Request`.\n- **`strings.TrimPrefix(h, \"Bearer \")`** — strips the `\"Bearer \"` scheme prefix, leaving the raw token. `TrimPrefix` returns the string unchanged if the prefix isn't there, so a malformed header naturally yields something you can reject.",
            "If the header was missing, `r.Header.Get` returned `\"\"` and after trimming you still have `\"\"` — that's your signal to reject.",
          ],
        },
        {
          type: "text",
          md: [
            "## Reject, or stash the user and continue",
            "A missing or invalid token gets **`http.StatusUnauthorized`** (401): call `w.WriteHeader(http.StatusUnauthorized)` and `return` — do not call the next handler. `w` is the `http.ResponseWriter`.",
            "When the token *is* valid, the middleware knows *who* the request is from (the `\"sub\"` claim). It attaches that to the request's **context** so downstream handlers can read it, using `context.WithValue` and `r.WithContext(...)`. Context is Go's standard way to carry request-scoped values down the call chain without changing every function signature.",
            "> The shape of every Go middleware: `func(next http.Handler) http.Handler`. It takes the handler to protect and returns a new handler that wraps it.",
          ],
        },
        {
          type: "code",
          title: "internal/auth/middleware.go",
          source: String.raw`package auth

import (
	"context"
	"net/http"
	"strings"
)

type ctxKey string

const userKey ctxKey = "userID"

// RequireAuth rejects requests without a valid Bearer token.
func RequireAuth(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			h := r.Header.Get("Authorization")
			token := strings.TrimPrefix(h, "Bearer ")
			if token == "" {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			userID, err := parseToken(token, secret)
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			ctx := context.WithValue(r.Context(), userKey, userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}`,
          caption: "parseToken (verifying the signature with the secret and reading \"sub\") is the token.go counterpart to last lesson's IssueToken. On success the user id rides down in the request context; on any failure the request never reaches next.",
        },
        {
          type: "text",
          md: [
            "## Reading the user back out",
            "Downstream, a booking handler pulls the id out of context with `r.Context().Value(userKey)` and knows exactly which walker is asking — no re-parsing, no globals. Because `RequireAuth` already rejected everyone without a valid token, the handler can trust that the id is there.",
            "This is the payoff of the whole module: password → hash at signup, verify at login, mint a JWT, and this middleware turns that JWT back into a trusted user id on every protected request.",
          ],
        },
        {
          type: "quiz",
          q: "In `RequireAuth`, after finding the token is missing you call `w.WriteHeader(http.StatusUnauthorized)` and then `return`. Why the `return`?",
          choices: [
            "To stop the middleware from calling the next handler, so the rejected request goes no further",
            "To restart the request from the top",
            "Because WriteHeader requires a return value",
            "To free the response writer's memory",
          ],
          answer: 0,
          explain: "Writing the 401 status doesn't by itself end the function — without `return`, execution would fall through and call next.ServeHTTP, letting an unauthenticated request reach the protected handler. The `return` is what actually blocks it.",
          nudge: "Think about what the next line of code would do if you didn't stop here.",
        },
        {
          type: "exercise",
          title: "Guard a protected route",
          prompt: [
            "Write the guard inside this handler. Read the header with `r.Header.Get(\"Authorization\")` into `h`, strip the scheme with `strings.TrimPrefix(h, \"Bearer \")` into `token`, and if `token == \"\"` call `w.WriteHeader(http.StatusUnauthorized)` then `return`.",
          ],
          starter: String.raw`package auth

import (
	"net/http"
	"strings"
)

func guard(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	// your code here
	next(w, r)
}`,
          solution: String.raw`package auth

import (
	"net/http"
	"strings"
)

func guard(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	h := r.Header.Get("Authorization")
	token := strings.TrimPrefix(h, "Bearer ")
	if token == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	next(w, r)
}`,
          checks: [
            { re: /h:=r\.Header\.Get\("Authorization"\)/, hint: "Read the header value — `h := r.Header.Get(\"Authorization\")`." },
            { re: /strings\.TrimPrefix\(h,"Bearer"\)/, hint: "Strip the scheme prefix — `strings.TrimPrefix(h, \"Bearer \")`." },
            { re: /token==""/, hint: "Reject an empty token — `if token == \"\" { ... }`." },
            { re: /w\.WriteHeader\(http\.StatusUnauthorized\)/, hint: "Send a 401 — `w.WriteHeader(http.StatusUnauthorized)`." },
          ],
          mustNot: [
            { re: /StatusOK/, hint: "A missing token is unauthorized (401), not OK (200)." },
          ],
          success: "That's the heart of RequireAuth: no valid Bearer token, no entry. Wrap it around your bookings routes and they're protected.",
        },
      ],
    },
  ],
});
