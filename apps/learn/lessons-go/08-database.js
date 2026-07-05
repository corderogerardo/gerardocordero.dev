window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "go-database",
  title: "Databases with database/sql",
  emoji: "🗄️",
  lang: "go",
  lessons: [
    {
      id: "querying",
      title: "Connecting & querying",
      steps: [
        {
          type: "text",
          md: [
            "## Where the walkers actually live",
            "So far your handlers have returned data you hard-coded in Go. A real PawWalk backend keeps walkers, bookings, and GPS fixes in a **database** — usually PostgreSQL — that survives restarts and serves many requests at once.",
            "Go talks to SQL databases through one standard-library package: **`database/sql`**. It gives you a common API (`Query`, `Exec`, `Scan`) and you plug in a **driver** for your specific database. Import the package the usual way, and pull in the driver for its side effect of registering itself:",
            "```",
            "import (",
            "    \"database/sql\"",
            "    _ \"github.com/lib/pq\"   // registers the postgres driver",
            ")",
            "```",
            "The underscore `_` means *import this only for its side effects* — the driver registers the name `\"postgres\"` in its `init()`, and you never call it directly.",
          ],
        },
        {
          type: "code",
          title: "internal/db/db.go",
          source: String.raw`package db

import "database/sql"

func Open(dsn string) (*sql.DB, error) {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}
	return db, nil
}`,
          caption: "`sql.Open` doesn't actually connect — it just validates arguments and prepares a pool. `db.Ping()` forces one real connection so you find out immediately if the database is unreachable. The `dsn` (data source name) is the connection string, e.g. \"postgres://user:pass@localhost/pawwalk\".",
        },
        {
          type: "text",
          md: [
            "## Reading one row: `QueryRow` + `Scan`",
            "The most common read is *fetch a single row and copy its columns into Go variables*. That's `QueryRow` followed by `Scan`:",
            "```",
            "var name string",
            "err := db.QueryRow(\"SELECT name FROM walkers WHERE id = $1\", id).Scan(&name)",
            "```",
            "`QueryRow` runs the query; `Scan` copies each selected column into the variable whose **address** you pass (`&name`). One column selected, one pointer to `Scan` — they line up left to right.",
          ],
        },
        {
          type: "text",
          md: [
            "## Placeholders, never string-concat",
            "Notice the `$1` in the query. That's a **placeholder**: you pass the actual value as a separate argument, and the driver sends it apart from the SQL text. PostgreSQL numbers them `$1`, `$2`, `$3` in argument order.",
            "This is not just tidy — it's how you stop **SQL injection**. Never build a query with `\"... WHERE id = \" + id`; a malicious `id` could rewrite your query. Always use placeholders and let the driver handle the value.",
            "> Rule of thumb: if a value came from outside your program (a request, a form, a URL), it belongs in a placeholder argument, never glued into the query string.",
          ],
        },
        {
          type: "quiz",
          q: "Why write `db.QueryRow(\"... WHERE id = $1\", id)` instead of concatenating `id` into the SQL string?",
          choices: [
            "Placeholders keep the value separate from the SQL text, preventing SQL injection",
            "Concatenation doesn't compile in Go",
            "`$1` makes the query run faster on every database",
            "It's only a style preference with no real difference",
          ],
          answer: 0,
          explain: "The driver sends the SQL and the argument separately, so a value like `\"1; DROP TABLE walkers\"` is treated as data, not code. Placeholders are the primary defense against SQL injection — always prefer them over string building.",
          nudge: "Think about what happens if `id` contained a snippet of SQL rather than a number.",
        },
        {
          type: "text",
          md: [
            "## The 'not found' case: `sql.ErrNoRows`",
            "What if no walker has that id? `QueryRow(...).Scan(...)` returns a special sentinel error, **`sql.ErrNoRows`**. It isn't a database failure — it's Go's way of saying *the query ran fine and matched nothing*.",
            "You check it explicitly with `==`, because 'no such walker' usually means a `404`, while any other error means something actually broke:",
            "```",
            "if err == sql.ErrNoRows {",
            "    // no walker with that id -> 404",
            "}",
            "```",
            "This is the same pattern you'll wire into an HTTP handler: `ErrNoRows` becomes a not-found response, other errors become a 500.",
          ],
        },
        {
          type: "exercise",
          title: "Look up a walker's name",
          prompt: [
            "Inside `LookupName`, read the `name` column for the walker with the given `id`. Use `db.QueryRow` with the query `\"SELECT name FROM walkers WHERE id = $1\"`, pass `id` as the argument, and `.Scan(&name)` the result into `name`.",
          ],
          starter: String.raw`func LookupName(db *sql.DB, id string) (string, error) {
	var name string
	// your code here
	if err != nil {
		return "", err
	}
	return name, nil
}`,
          solution: String.raw`func LookupName(db *sql.DB, id string) (string, error) {
	var name string
	err := db.QueryRow("SELECT name FROM walkers WHERE id = $1", id).Scan(&name)
	if err != nil {
		return "", err
	}
	return name, nil
}`,
          checks: [
            { re: /db\.QueryRow\("SELECT name FROM walkers WHERE id=\$1",id\)\.Scan\(&name\)/, hint: "Chain it: `db.QueryRow(\"SELECT name FROM walkers WHERE id = $1\", id).Scan(&name)` — query, then Scan the address of `name`." },
            { re: /err:=/, hint: "Capture the result into `err` with `:=` so the existing `if err != nil` check can use it." },
          ],
          mustNot: [
            { re: /"\+id/, hint: "Don't concatenate `id` into the SQL — use the `$1` placeholder and pass `id` as a separate argument." },
          ],
          success: "That's the read path for a single walker: a placeholder query, Scan into a variable, and an error to bubble up. Next you'll write rows and read many.",
        },
      ],
    },
    {
      id: "writing",
      title: "Writing & multiple rows",
      steps: [
        {
          type: "text",
          md: [
            "## Changing data: `Exec`",
            "`QueryRow` and `Query` are for reads. When a statement changes the database — `INSERT`, `UPDATE`, `DELETE` — you use **`db.Exec`**. It doesn't return rows; it returns a `sql.Result` with metadata like how many rows changed.",
            "```",
            "res, err := db.Exec(\"INSERT INTO walkers (name) VALUES ($1)\", name)",
            "```",
            "Same placeholder rule as before: the new `name` goes in as a `$1` argument, never concatenated. If you don't care about the result metadata, you can ignore it with `_, err := db.Exec(...)`.",
          ],
        },
        {
          type: "code",
          title: "internal/walker/repo.go",
          source: String.raw`func Insert(db *sql.DB, name string) error {
	_, err := db.Exec("INSERT INTO walkers (name) VALUES ($1)", name)
	return err
}

func Rename(db *sql.DB, id, name string) error {
	_, err := db.Exec("UPDATE walkers SET name = $1 WHERE id = $2", name, id)
	return err
}`,
          caption: "Two writes. `Insert` adds a walker; `Rename` updates one, using two placeholders `$1` and `$2` filled by `name` then `id` — argument order matches the numbers, not the columns.",
        },
        {
          type: "exercise",
          title: "Add a walker",
          prompt: [
            "Inside `AddWalker`, insert a new row into the `walkers` table. Use `db.Exec` with the query `\"INSERT INTO walkers (name) VALUES ($1)\"`, pass `name` as the argument, and discard the result with `_`, keeping the error.",
          ],
          starter: String.raw`func AddWalker(db *sql.DB, name string) error {
	// your code here
	return err
}`,
          solution: String.raw`func AddWalker(db *sql.DB, name string) error {
	_, err := db.Exec("INSERT INTO walkers (name) VALUES ($1)", name)
	return err
}`,
          checks: [
            { re: /db\.Exec\("INSERT INTO walkers\(name\)VALUES\(\$1\)",name\)/, hint: "Call `db.Exec(\"INSERT INTO walkers (name) VALUES ($1)\", name)` — the SQL string plus `name` as the placeholder argument." },
            { re: /_,err:=/, hint: "`Exec` returns two values; discard the result with `_` and keep the error: `_, err := db.Exec(...)`." },
          ],
          success: "That's a full write: a parameterized INSERT with the result ignored and the error returned. Now the hard part — reading many rows.",
        },
        {
          type: "text",
          md: [
            "## Reading many rows: `Query` + `rows.Next()`",
            "For a list — every walker, all bookings for a dog — use **`db.Query`**. Unlike `QueryRow`, it returns a `*sql.Rows` you step through one row at a time with `rows.Next()`, calling `rows.Scan` inside the loop:",
            "```",
            "rows, err := db.Query(\"SELECT id, name FROM walkers\")",
            "if err != nil { return nil, err }",
            "defer rows.Close()",
            "for rows.Next() {",
            "    var w Walker",
            "    rows.Scan(&w.ID, &w.Name)",
            "    walkers = append(walkers, w)",
            "}",
            "return walkers, rows.Err()",
            "```",
            "`rows.Next()` returns `false` when there are no more rows *or* when an error stopped iteration — that's why you finish with `rows.Err()`.",
          ],
        },
        {
          type: "text",
          md: [
            "## Two things you must not skip",
            "- **`defer rows.Close()`** — right after the error check. Each open `*sql.Rows` holds a database connection from the pool; not closing it leaks connections until the pool is exhausted and your server stalls. `defer` guarantees it runs however the function exits.",
            "- **`rows.Err()`** at the end — the loop's `rows.Next()` returning `false` hides whether iteration ended cleanly or crashed. Checking `rows.Err()` surfaces any error that cut the loop short.",
            "> The order is always: `Query`, check err, `defer rows.Close()`, loop with `Scan`, then return `rows.Err()`. Memorize that shape — every list query in the codebase follows it.",
          ],
        },
        {
          type: "quiz",
          q: "In a `db.Query` + `for rows.Next()` loop, why call `rows.Err()` after the loop finishes?",
          choices: [
            "`rows.Next()` returns false both at the end of data and on an error — `rows.Err()` tells the two apart",
            "It re-runs the query to double-check the results",
            "It's what actually closes the rows and frees the connection",
            "It converts the rows into JSON automatically",
          ],
          answer: 0,
          explain: "The loop exits when `Next()` returns false, which happens on normal completion AND when an error stops iteration. `rows.Err()` is the only way to know a mid-loop failure didn't silently truncate your results. (Closing is a separate job — that's `rows.Close()`, usually deferred.)",
          nudge: "Both 'no more rows' and 'something broke' make `Next()` return false. How do you tell which happened?",
        },
      ],
    },
    {
      id: "repository",
      title: "Repository pattern & pooling",
      steps: [
        {
          type: "text",
          md: [
            "## `*sql.DB` is a pool, not a connection",
            "One idea reshapes how you use `database/sql`: a `*sql.DB` is **not** a single connection — it's a **pool** of connections that Go manages for you. It's safe to share across goroutines, so you open it **once** at startup and hand the same `*sql.DB` to everything that touches the database.",
            "You do not open a new `*sql.DB` per request. Each `Query`/`Exec` borrows a connection from the pool, uses it, and returns it. That's what lets one Go server handle thousands of concurrent requests against a handful of real database connections.",
          ],
        },
        {
          type: "text",
          md: [
            "## Stop passing `db` everywhere: the repository",
            "Passing `db *sql.DB` into every free function (like `LookupName(db, id)`) gets noisy fast. The **repository pattern** bundles the pool and all the queries for one kind of thing into a struct. A `WalkerRepo` *has a* `*sql.DB` and exposes methods like `FindByID` and `Create`.",
            "The rest of your app then depends on the repo, not on `database/sql` directly — handlers call `repo.FindByID(ctx, id)` and never see SQL. Swapping the storage or mocking it in tests becomes a matter of swapping the repo.",
          ],
        },
        {
          type: "code",
          title: "internal/walker/repo.go",
          source: String.raw`type WalkerRepo struct {
	db *sql.DB
}

func NewWalkerRepo(db *sql.DB) *WalkerRepo {
	return &WalkerRepo{db: db}
}`,
          caption: "The struct holds the pool (lowercase `db` — unexported, private to the package). `NewWalkerRepo` is the constructor: you build it once at startup with the shared `*sql.DB` and pass the repo around.",
        },
        {
          type: "exercise",
          title: "Define the repository",
          prompt: [
            "Declare the repository type. Write `type WalkerRepo struct { ... }` with a single unexported field `db` of type `*sql.DB`.",
          ],
          starter: String.raw`// A repository wraps the connection pool.
// your code here`,
          solution: String.raw`type WalkerRepo struct {
	db *sql.DB
}`,
          checks: [
            { re: /type WalkerRepo struct\{/, hint: "Start with `type WalkerRepo struct {` — a named struct type." },
            { re: /db\*sql\.DB/, hint: "Give it one field: `db *sql.DB` — the pointer to the shared pool. Lowercase `db` keeps it unexported." },
          ],
          success: "That struct is the home for every walker query. Now give it a method that uses the pool.",
        },
        {
          type: "text",
          md: [
            "## Methods take a `context.Context`, use `QueryRowContext`",
            "Repository methods take a **`context.Context`** as their first argument. The context carries deadlines and cancellation — if the HTTP request is abandoned, the context is cancelled and the database query can be cut short instead of running for nothing.",
            "So instead of `QueryRow`, you call the **context-aware** variant **`QueryRowContext(ctx, ...)`**. Every method mirrors this: `QueryContext`, `ExecContext`, `QueryRowContext`. Same behavior as before, plus they honor the context:",
            "```",
            "func (r *WalkerRepo) FindByID(ctx context.Context, id string) (Walker, error) {",
            "    var w Walker",
            "    err := r.db.QueryRowContext(ctx,",
            "        \"SELECT id, name FROM walkers WHERE id = $1\", id).Scan(&w.ID, &w.Name)",
            "    ...",
            "}",
            "```",
          ],
        },
        {
          type: "exercise",
          title: "Find a walker by id",
          prompt: [
            "Fill in `FindByID`. Run `r.db.QueryRowContext(ctx, \"SELECT id, name FROM walkers WHERE id = $1\", id)` and `.Scan(&w.ID, &w.Name)`. Then, if `err == sql.ErrNoRows`, return an empty `Walker{}` with that error so the handler can turn it into a 404.",
          ],
          starter: String.raw`func (r *WalkerRepo) FindByID(ctx context.Context, id string) (Walker, error) {
	var w Walker
	// your code here
	return w, err
}`,
          solution: String.raw`func (r *WalkerRepo) FindByID(ctx context.Context, id string) (Walker, error) {
	var w Walker
	err := r.db.QueryRowContext(ctx, "SELECT id, name FROM walkers WHERE id = $1", id).Scan(&w.ID, &w.Name)
	if err == sql.ErrNoRows {
		return Walker{}, err
	}
	return w, err
}`,
          checks: [
            { re: /r\.db\.QueryRowContext\(ctx,/, hint: "Use the context-aware call on the pool: `r.db.QueryRowContext(ctx, ...)`, passing `ctx` first." },
            { re: /\.Scan\(&w\.ID,&w\.Name\)/, hint: "Scan both selected columns into the struct fields by address: `.Scan(&w.ID, &w.Name)`." },
            { re: /if err==sql\.ErrNoRows\{/, hint: "Check the sentinel explicitly: `if err == sql.ErrNoRows {` — that's your 'no such walker' branch." },
          ],
          success: "That's an idiomatic repository method: context-aware, pooled, with the not-found case handled. This is the exact shape the real PawWalk backend uses for every lookup.",
        },
        {
          type: "quiz",
          q: "A `*sql.DB` is best described as:",
          choices: [
            "A pool of connections, safe for concurrent use — opened once and shared everywhere",
            "A single live connection you must open per request",
            "A connection that only one goroutine may touch at a time",
            "An in-memory cache of query results",
          ],
          answer: 0,
          explain: "`*sql.DB` manages a pool of connections behind one safe-to-share handle. You call `sql.Open` once at startup, store the result (often inside a repository), and every goroutine borrows and returns connections through it — no per-request opening, no manual locking.",
          nudge: "Think about why you never call `sql.Open` inside a handler.",
        },
      ],
    },
  ],
});
