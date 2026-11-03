window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "rust-sqlx",
  title: "PostgreSQL with sqlx",
  emoji: "🗄️",
  lang: "rust",
  lessons: [
    {
      id: "pool",
      title: "The pool & migrations",
      steps: [
        {
          type: "text",
          md: [
            "## A pool, not a connection",
            "`sqlx::PgPool` is a connection pool. Cloning it is cheap — every handler gets its own handle to the same pool, and the pool enforces a maximum concurrency instead of opening 900 connections under load.",
            "```",
            "let pool = PgPoolOptions::new()",
            "    .max_connections(10)",
            "    .connect(&config.database_url)",
            "    .await?;",
            "```",
            "sqlx checks your SQL **at compile time** when you use the `query!` macros, by connecting to a live database during the build. That's why `DATABASE_URL` (or `.sqlx/` offline data) is part of the build environment.",
          ],
        },
        {
          type: "code",
          title: "src/db.rs + migrations/0001_init.sql",
          source: String.raw`use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;

pub async fn connect(url: &str) -> Result<PgPool, sqlx::Error> {
    PgPoolOptions::new()
        .max_connections(10)
        .connect(url)
        .await
}

// Run once at startup — embed the migrations at compile time.
pub async fn migrate(pool: &PgPool) -> Result<(), sqlx::migrate::MigrateError> {
    sqlx::migrate!("./migrations").run(pool).await
}

// migrations/0001_init.sql
// CREATE TABLE walkers (
//     id    BIGSERIAL PRIMARY KEY,
//     name  TEXT NOT NULL,
//     price_per_30_min_cents INTEGER NOT NULL CHECK (price_per_30_min_cents >= 0),
//     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
// );`,
          caption: "`sqlx::migrate!` embeds the SQL files into the binary and applies them in order, tracking what already ran. Migrations are part of the deploy, not a manual step.",
        },
        {
          type: "quiz",
          q: "Why is `PgPool` cloned into each handler instead of a single connection?",
          choices: [
            "Cloning is cheap and the pool caps concurrency while reusing connections",
            "A connection cannot be shared between async tasks",
            "Cloning opens a new TCP connection each time",
            "Because `sqlx` has no connection type",
          ],
          answer: 0,
          explain: "`PgPool` is an `Arc` over a queue of live connections. Cloning shares the same pool; the cap (`max_connections`) is what protects Postgres from a thundering herd.",
          nudge: "What protects the database when 500 requests arrive at once?",
        },
        {
          type: "text",
          md: [
            "## Offline mode for CI",
            "Compile-time checked queries need a database at build time. For CI and Docker builds, run `cargo sqlx prepare` to emit a `.sqlx/` directory of query metadata, commit it, and set `SQLX_OFFLINE=true`. The build then verifies your SQL without a live server.",
            "**Production note:** check `.sqlx/` into git. A stale one is a build failure — which is exactly the signal you want when someone edits a query and forgets to refresh it.",
          ],
        },
        {
          type: "exercise",
          title: "Open the pool",
          prompt: [
            "Implement `connect`: build a `PgPool` with 10 max connections and connect to `url`.",
            "Use `PgPoolOptions::new().max_connections(10).connect(url)`.",
          ],
          starter: String.raw`use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;

pub async fn connect(url: &str) -> Result<PgPool, sqlx::Error> {
    // your code here
}`,
          solution: String.raw`use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;

pub async fn connect(url: &str) -> Result<PgPool, sqlx::Error> {
    PgPoolOptions::new()
        .max_connections(10)
        .connect(url)
        .await
}`,
          checks: [
            { re: /PgPoolOptions::new\(\)/, hint: "Start the builder: `PgPoolOptions::new()`." },
            { re: /\.max_connections\(10\)/, hint: "Cap the pool: `.max_connections(10)`." },
            { re: /\.connect\(url\)/, hint: "Connect with `.connect(url)` and await it." },
          ],
          success: "One pool, shared by every handler, capped so the database never sees a stampede.",
        },
      ],
    },
    {
      id: "queries",
      title: "Queries & transactions",
      steps: [
        {
          type: "text",
          md: [
            "## Three query APIs",
            "- **`sqlx::query_scalar::<_, T>(sql)`** — one column, one row.\n- **`sqlx::query_as::<_, T>(sql)`** — a struct, mapped by column name.\n- **`sqlx::query(sql)`** — no typed result; use for `INSERT`/`UPDATE` returning rows affected.",
            "Each ends with a fetch method: `fetch_one` (exactly one row, error otherwise), `fetch_optional` (`Option`), `fetch_all` (`Vec`), `execute` (rows affected).",
            "Choosing correctly is most of the API: `fetch_optional` for a lookup that may miss, `fetch_one` when the row must exist.",
          ],
        },
        {
          type: "code",
          title: "src/repo/walkers.rs",
          source: String.raw`use sqlx::PgPool;

#[derive(Debug, sqlx::FromRow)]
pub struct WalkerRow {
    pub id: i64,
    pub name: String,
    pub price_per_30_min_cents: i32,
}

pub async fn count(pool: &PgPool) -> Result<i64, sqlx::Error> {
    sqlx::query_scalar("SELECT COUNT(*) FROM walkers")
        .fetch_one(pool)
        .await
}

pub async fn find(pool: &PgPool, id: i64) -> Result<Option<WalkerRow>, sqlx::Error> {
    sqlx::query_as::<_, WalkerRow>(
        "SELECT id, name, price_per_30_min_cents FROM walkers WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(pool)
    .await
}`,
          caption: "`FromRow` maps columns to fields by name. `bind` is positional and type-checked against the placeholder — `$1`, `$2` for Postgres.",
        },
        {
          type: "quiz",
          q: "A lookup may legitimately find nothing. Which fetch method do you use?",
          choices: [
            "`fetch_optional` — it returns `Option<T>`",
            "`fetch_one` — and handle the error",
            "`fetch_all` — and check if empty",
            "`execute`",
          ],
          answer: 0,
          explain: "`fetch_one` treats zero rows as an error. Absence is a normal outcome for a lookup, so `fetch_optional` returns `None` and lets the caller map it to a 404 or a default.",
          nudge: "Absence is not an error.",
        },
        {
          type: "text",
          md: [
            "## Transactions: explicit, and rolled back on drop",
            "`pool.begin()` starts a transaction. Everything runs on `&mut *tx`. `tx.commit()` finalises; if the `Transaction` is dropped without committing, sqlx **rolls back automatically**.",
            "That last property is the important one: an early `?` in the middle of a multi-step write cannot leave a half-applied change behind. The type system makes the unsafe path impossible.",
          ],
        },
        {
          type: "exercise",
          title: "Rename inside a transaction",
          prompt: [
            "Implement `rename`: open a transaction, update the walker's name, then commit.",
            "Use `pool.begin()`, bind both values, `execute(&mut *tx)`, then `tx.commit()`.",
          ],
          starter: String.raw`use sqlx::PgPool;

pub async fn rename(pool: &PgPool, id: i64, name: &str) -> Result<(), sqlx::Error> {
    // your code here
}`,
          solution: String.raw`use sqlx::PgPool;

pub async fn rename(pool: &PgPool, id: i64, name: &str) -> Result<(), sqlx::Error> {
    let mut tx = pool.begin().await?;

    sqlx::query("UPDATE walkers SET name = $1 WHERE id = $2")
        .bind(name)
        .bind(id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await
}`,
          checks: [
            { re: /pool\.begin\(\)\.await\?/, hint: "Start the transaction: `let mut tx = pool.begin().await?;`." },
            { re: /\.bind\(name\)/, hint: "Bind the new name first — it maps to `$1`." },
            { re: /\.bind\(id\)/, hint: "Bind the id second — it maps to `$2`." },
            { re: /tx\.commit\(\)\.await/, hint: "Commit at the end: `tx.commit().await`." },
          ],
          success: "If any step fails, the `?` drops the transaction and Postgres rolls it back. No partial write can survive.",
        },
      ],
    },
    {
      id: "repository",
      title: "The repository pattern",
      steps: [
        {
          type: "text",
          md: [
            "## Keep SQL out of handlers",
            "A handler's job is HTTP: extract, call, respond. A repository's job is persistence. Keeping them apart means you can test the handler without a database and change a query without touching routing.",
            "```",
            "pub struct WalkerRepo { pool: PgPool }",
            "impl WalkerRepo {",
            "    pub fn new(pool: PgPool) -> Self { Self { pool } }",
            "    pub async fn find(&self, id: i64) -> Result<Option<WalkerRow>, sqlx::Error> { … }",
            "}",
            "```",
            "The repo is cheap to clone (`PgPool` is an `Arc`), so it can live in `AppState` alongside the config.",
          ],
        },
        {
          type: "code",
          title: "tests/walkers.rs — integration test against a real database",
          source: String.raw`use sqlx::PgPool;

#[sqlx::test]
async fn finds_a_walker(pool: PgPool) -> sqlx::Result<()> {
    sqlx::query("INSERT INTO walkers (name, price_per_30_min_cents) VALUES ($1, $2)")
        .bind("Mochi")
        .bind(1800)
        .execute(&pool)
        .await?;

    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM walkers")
        .fetch_one(&pool)
        .await?;

    assert_eq!(count, 1);
    Ok(())
}`,
          caption: "`#[sqlx::test]` creates a throwaway database per test, applies your migrations, and gives you a pool. No shared state between tests, no cleanup code.",
        },
        {
          type: "quiz",
          q: "What does `#[sqlx::test]` give you that `#[tokio::test]` doesn't?",
          choices: [
            "An isolated database with migrations applied, per test",
            "Faster compilation",
            "Automatic mocking of queries",
            "A running HTTP server",
          ],
          answer: 0,
          explain: "It provisions a fresh database for each test (transactional or per-test, depending on the attribute) and hands you a `PgPool`. Your tests exercise real SQL, not a mock that can drift from production behaviour.",
          nudge: "What does a database test need before it can run?",
        },
        {
          type: "text",
          md: [
            "## Why not mock the database",
            "A mock asserts that you sent the SQL string you sent — which is a tautology. It cannot catch a wrong join, a missing index, a constraint violation, or a transaction that deadlocks. Use a real Postgres in tests; it's a container away.",
            "**Production note:** keep one integration suite that runs the real queries with `#[sqlx::test]`, and unit-test the pure logic above the repository. That split catches both classes of bug without doubling the work.",
          ],
        },
        {
          type: "exercise",
          title: "Expose the repo through AppState",
          prompt: [
            "Give `AppState` a repository and a constructor that builds it from a `PgPool`.",
            "Clone the pool into the repo — cloning is cheap.",
          ],
          starter: String.raw`use sqlx::PgPool;

pub struct WalkerRepo {
    pool: PgPool,
}

pub struct AppState {
    pub repo: WalkerRepo,
}

impl AppState {
    pub fn new(pool: PgPool) -> Self {
        // your code here
    }
}`,
          solution: String.raw`use sqlx::PgPool;

pub struct WalkerRepo {
    pool: PgPool,
}

pub struct AppState {
    pub repo: WalkerRepo,
}

impl AppState {
    pub fn new(pool: PgPool) -> Self {
        Self { repo: WalkerRepo { pool } }
    }
}`,
          checks: [
            { re: /impl AppState\{/, hint: "Implement the constructor inside `impl AppState { … }`." },
            { re: /pub fn new\(pool:PgPool\)->Self/, hint: "Signature: `pub fn new(pool: PgPool) -> Self`." },
            { re: /repo:WalkerRepo\{pool\}/, hint: "Build the repo with the pool: `Self { repo: WalkerRepo { pool } }`." },
          ],
          success: "Handlers ask the repo; the repo owns the SQL. One seam, tested once.",
        },
      ],
    },
  ],
});
