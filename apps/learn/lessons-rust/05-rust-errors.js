window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "rust-errors",
  title: "Error Handling",
  emoji: "🚧",
  lang: "rust",
  lessons: [
    {
      id: "result-propagation",
      title: "Result & the ? operator",
      steps: [
        {
          type: "text",
          md: [
            "## Errors are values, and they have a shape",
            "`Result<T, E>` is `Ok(T)` or `Err(E)`. There is no stack unwinding, no `throws`, no invisible control flow. A function that can fail says so in its signature, and the caller must deal with it.",
            "`panic!` exists, but it is for **bugs**, not for expected failures. A missing file, bad JSON, a failed query — those are `Err`. A violated invariant your code promised — that's a panic.",
            "> **The line:** `panic!` when the program is broken; `Result` when the world is.",
          ],
        },
        {
          type: "code",
          title: "src/pricing.rs",
          source: String.raw`pub fn parse_price(raw: &str) -> Result<u32, std::num::ParseIntError> {
    raw.trim().parse::<u32>()
}

pub fn total(raw_prices: &[&str]) -> Result<u32, std::num::ParseIntError> {
    let mut sum = 0;
    for raw in raw_prices {
        sum += parse_price(raw)?; // propagate on the first failure
    }
    Ok(sum)
}`,
          caption: "`?` means: on `Err`, return that error from the enclosing function immediately. On `Ok`, unwrap the value. It replaces the entire `if err != nil { return err }` ladder.",
        },
        {
          type: "quiz",
          q: "What does `?` do when the value is `Err(e)`?",
          choices: [
            "Returns `Err(e)` from the enclosing function, converting `e` if needed",
            "Panics with `e`",
            "Logs `e` and continues with a default value",
            "Retries the call",
          ],
          answer: 0,
          explain: "`?` is an early return. It also applies `From`, so a function returning `MyError` can use `?` on a call that yields `io::Error` — provided `MyError: From<io::Error>` exists.",
          nudge: "It's control flow, not logging.",
        },
        {
          type: "text",
          md: [
            "## `?` has a type requirement",
            "The error type of the expression must convert into the function's error type. Either they're the same type, or `From` is implemented. That's why the `?` operator composes so well with custom error enums: you implement `From<io::Error>` once and every `io` call in the function becomes a `?`.",
            "**Red flag:** `unwrap()` in a request handler. It turns every expected failure into a 500 and a panicking thread. Reserve `unwrap` for tests, prototypes, and cases you can prove are infallible.",
          ],
        },
        {
          type: "exercise",
          title: "Parse, trim, return",
          prompt: [
            "Implement `parse_price`: trim the input and parse it as `u32`, returning the `Result` unchanged.",
            "The signature already declares the error type — let `?` or the bare expression do the work.",
          ],
          starter: String.raw`pub fn parse_price(raw: &str) -> Result<u32, std::num::ParseIntError> {
    // your code here
}

fn main() {
    println!("{:?}", parse_price(" 1800 "));
}`,
          solution: String.raw`pub fn parse_price(raw: &str) -> Result<u32, std::num::ParseIntError> {
    raw.trim().parse::<u32>()
}

fn main() {
    println!("{:?}", parse_price(" 1800 "));
}`,
          checks: [
            { re: /fn parse_price\(raw:&str\)->Result<u32,std::num::ParseIntError>/, hint: "Keep the signature: the error type is `std::num::ParseIntError`." },
            { re: /\.trim\(\)/, hint: "Trim the input first — callers pass padded strings." },
            { re: /\.parse::<u32>\(\)/, hint: "Parse explicitly: `raw.trim().parse::<u32>()`." },
          ],
          success: "No unwrap, no exception, and the failure is visible in the signature. This is the function every HTTP handler will call.",
        },
      ],
    },
    {
      id: "custom-errors",
      title: "Custom error types",
      steps: [
        {
          type: "text",
          md: [
            "## One enum per failure domain",
            "A library should expose a small, precise error enum. Each variant carries the context needed to render a useful message — the id that wasn't found, the transition that was rejected.",
            "```",
            "#[derive(Debug)]",
            "pub enum BookingError {",
            "    NotFound(u64),",
            "    InvalidTransition { from: String, to: String },",
            "}",
            "```",
            "Then implement `Display` (for humans) and `std::error::Error` (for the ecosystem, including `?` and `Box<dyn Error>`).",
          ],
        },
        {
          type: "code",
          title: "src/error.rs",
          source: String.raw`#[derive(Debug)]
pub enum BookingError {
    NotFound(u64),
    InvalidTransition { from: String, to: String },
}

impl std::fmt::Display for BookingError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            BookingError::NotFound(id) => write!(f, "booking {id} not found"),
            BookingError::InvalidTransition { from, to } => {
                write!(f, "cannot go from {from} to {to}")
            }
        }
    }
}

impl std::error::Error for BookingError {}`,
          caption: "`Display` is the human message; the empty `impl std::error::Error` opts into the standard error protocol. Match on `self` inside `fmt` — this is the idiomatic shape.",
        },
        {
          type: "quiz",
          q: "Why keep `Debug` AND implement `Display`?",
          choices: [
            "`Debug` is for developers (derived, structural); `Display` is the user-facing message you control",
            "`Debug` is required by the compiler and `Display` is optional",
            "They are the same trait",
            "`Display` is only for numbers",
          ],
          answer: 0,
          explain: "`{:?}` prints the derived structure — invaluable in logs and panics. `{}` prints your `Display` implementation, which should read like a sentence. Logs want both; APIs return the `Display` text.",
          nudge: "One is structural, one is written for a human.",
        },
        {
          type: "text",
          md: [
            "## Mapping errors at the boundary",
            "Your domain error shouldn't leak `sqlx::Error` or `serde_json::Error` to HTTP. Convert at the edge:",
            "```",
            "impl From<sqlx::Error> for AppError {",
            "    fn from(err: sqlx::Error) -> Self {",
            "        AppError::Database(err.to_string())",
            "    }",
            "}",
            "```",
            "Once that exists, every `?` on a database call inside a handler converts automatically. That's the whole trick: **implement `From` once, get `?` everywhere.**",
          ],
        },
        {
          type: "exercise",
          title: "Write the Display impl",
          prompt: [
            "Implement `fmt` for `BookingError` so each variant renders a readable sentence.",
            "Use `write!` and match on `self`. Handle both variants explicitly.",
          ],
          starter: String.raw`#[derive(Debug)]
pub enum BookingError {
    NotFound(u64),
    InvalidTransition { from: String, to: String },
}

impl std::fmt::Display for BookingError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // your code here
    }
}`,
          solution: String.raw`#[derive(Debug)]
pub enum BookingError {
    NotFound(u64),
    InvalidTransition { from: String, to: String },
}

impl std::fmt::Display for BookingError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            BookingError::NotFound(id) => write!(f, "booking {id} not found"),
            BookingError::InvalidTransition { from, to } => {
                write!(f, "cannot go from {from} to {to}")
            }
        }
    }
}`,
          checks: [
            { re: /match self\{/, hint: "Match on `self` — that's what binds the variant data." },
            { re: /BookingError::NotFound\(id\)/, hint: "First arm: `BookingError::NotFound(id) => …`." },
            { re: /write!/, hint: "Render with `write!(f, …)` — the formatter's writer, not `println!`." },
            { re: /BookingError::InvalidTransition\{from,to\}/, hint: "Second arm destructures both fields: `BookingError::InvalidTransition { from, to }`." },
          ],
          success: "That's the exact shape a library error takes. `#[derive(Debug)]` plus a hand-written `Display` is the convention across the ecosystem.",
        },
      ],
    },
    {
      id: "anyhow-thiserror",
      title: "thiserror & anyhow in practice",
      steps: [
        {
          type: "text",
          md: [
            "## Two crates, two jobs",
            "- **`thiserror`** — for **libraries**. It generates the `Display` and `From` boilerplate for your error enum. You keep a precise, matchable type.",
            "- **`anyhow`** — for **applications**. One `anyhow::Error` type that carries any error plus context. You stop writing `From` impls at the top of the stack.",
            "The rule of thumb: **`thiserror` at the library boundary, `anyhow` in `main`, setup code, and CLI glue.** A web handler usually returns a domain error (`thiserror`) so it can map to a status code; a startup routine returns `anyhow::Result` because nobody matches on it.",
          ],
        },
        {
          type: "code",
          title: "src/error.rs + src/main.rs",
          source: String.raw`use thiserror::Error;

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("missing environment variable {0}")]
    Missing(String),
    #[error("invalid port: {0}")]
    InvalidPort(#[from] std::num::ParseIntError),
}

// Application layer: anyhow adds context and keeps the chain.
use anyhow::{Context, Result};

pub fn load_port(raw: Option<&str>) -> Result<u16> {
    let raw = raw.context("PORT is not set")?;
    let port = raw.parse::<u16>().context("PORT must be a number")?;
    Ok(port)
}`,
          caption: "`#[error(\"…\")]` generates `Display`; `#[from]` generates the `From` impl so `?` works. `anyhow::Context` attaches a human sentence to a lower-level error without inventing a type.",
        },
        {
          type: "quiz",
          q: "Which crate belongs in a library that downstream code will match on?",
          choices: [
            "`thiserror` — it keeps a concrete, matchable error enum",
            "`anyhow` — it is simpler",
            "Both at once in the same public API",
            "Neither; use `String` for errors",
          ],
          answer: 0,
          explain: "A library's callers may need to branch on a specific failure, so the public API must expose a precise type. `anyhow::Error` is intentionally opaque — great for a `main`, hostile to a consumer that wants `match err { … }`.",
          nudge: "Can the caller match on the variant?",
        },
        {
          type: "text",
          md: [
            "## Context is the difference between a log line and a debugging session",
            "`anyhow` errors carry a chain. `.context(\"loading config\")` wraps the cause, and the printed chain reads top-down:",
            "```",
            "Error: loading config",
            "Caused by: invalid digit found in string",
            "```",
            "**Production habit:** add context at every boundary where the error crosses a layer — file I/O, parsing, HTTP. Six words now save an hour later.",
          ],
        },
        {
          type: "exercise",
          title: "Add context, propagate cleanly",
          prompt: [
            "Implement `load`: turn the optional string into a `u16`, attaching context at each step.",
            "Use `.context(\"missing config\")?` for the `Option` and `.context(\"invalid number\")?` for the parse.",
          ],
          starter: String.raw`use anyhow::{Context, Result};

pub fn load(raw: Option<&str>) -> Result<u16> {
    // your code here
}`,
          solution: String.raw`use anyhow::{Context, Result};

pub fn load(raw: Option<&str>) -> Result<u16> {
    let raw = raw.context("missing config")?;
    let value = raw.parse::<u16>().context("invalid number")?;
    Ok(value)
}`,
          checks: [
            { re: /\.context\("missing config"\)\?/, hint: "`Option` also has `.context(...)`, which converts it into a `Result`. Use it first." },
            { re: /\.parse::<u16>\(\)/, hint: "Parse as `u16`: `raw.parse::<u16>()`." },
            { re: /\.context\("invalid number"\)\?/, hint: "Attach the second context to the parse result and propagate with `?`." },
          ],
          success: "Two context points, zero `match` ladders. This is how application code reads in production Rust.",
        },
      ],
    },
  ],
});
