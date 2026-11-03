window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "rust-pawwalk-api",
  title: "Build the PawWalk API",
  emoji: "🐾",
  lang: "rust",
  lessons: [
    {
      id: "domain-model",
      title: "Domain model & newtypes",
      steps: [
        {
          type: "text",
          md: [
            "## Make illegal states unrepresentable",
            "The first design decision of a Rust service isn't the router — it's the types. A `u64` called `walker_id` and a `u64` called `booking_id` are the same type, so the compiler happily lets you pass one where the other belongs.",
            "A **newtype** fixes that for free:",
            "```",
            "#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]",
            "pub struct WalkerId(pub u64);",
            "```",
            "Now `fn cancel(id: WalkerId)` cannot receive a booking id. Zero runtime cost — the wrapper disappears after compilation.",
            "> **Pitch line:** types are the cheapest tests you'll ever write. They run at compile time, on every future change.",
          ],
        },
        {
          type: "code",
          title: "src/domain/money.rs",
          source: String.raw`#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct Cents(pub u32);

impl Cents {
    pub fn dollars(&self) -> u32 {
        self.0 / 100
    }

    pub fn checked_add(self, other: Cents) -> Option<Cents> {
        self.0.checked_add(other.0).map(Cents)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct WalkerId(pub u64);

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Walker {
    pub id: WalkerId,
    pub name: String,
    pub price: Cents,
}`,
          caption: "`Cents` owns the money arithmetic, so no handler divides by 100 by hand. `checked_add` returns `Option` — overflow becomes a type-level concern instead of a wrapped integer.",
        },
        {
          type: "quiz",
          q: "What does the newtype `WalkerId(pub u64)` buy you?",
          choices: [
            "A distinct type the compiler won't confuse with other ids — at zero runtime cost",
            "Heap allocation for the id",
            "Automatic JSON serialisation",
            "A faster hash",
          ],
          answer: 0,
          explain: "It's a single-field tuple struct. It compiles to the same `u64`, but the type checker now separates it from `BookingId`. Mixing them is a compile error, not a production bug.",
          nudge: "What happens at runtime to a single-field wrapper?",
        },
        {
          type: "text",
          md: [
            "## Validation belongs at the edge",
            "Parse, don't validate: convert untrusted input into a type that can only exist in a valid state, as early as possible. A `ValidatedEmail` constructor that returns `Result` means every function downstream can assume validity — no defensive re-checking.",
            "**Red flag:** `String` flowing through six layers, each one re-checking `is_empty()`. That's a missing type. The same applies to statuses: an enum with three variants beats `status: String` every time.",
          ],
        },
        {
          type: "exercise",
          title: "Give the money type a dollar view",
          prompt: [
            "`Cents` wraps a `u32`. Implement `dollars(&self) -> u32` so the rest of the app never divides by 100 by hand.",
          ],
          starter: String.raw`#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Cents(pub u32);

impl Cents {
    // your code here
}`,
          solution: String.raw`#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Cents(pub u32);

impl Cents {
    pub fn dollars(&self) -> u32 {
        self.0 / 100
    }
}`,
          checks: [
            { re: /pub struct Cents\(pub u32\)/, hint: "Keep the newtype: `pub struct Cents(pub u32);`." },
            { re: /fn dollars\(&self\)->u32/, hint: "The method signature is `pub fn dollars(&self) -> u32`." },
            { re: /self\.0\/100/, hint: "Read the inner value with `self.0` and divide by 100." },
          ],
          success: "Money maths now has exactly one home. Change the rounding rule later and there's one file to edit.",
        },
      ],
    },
    {
      id: "handlers",
      title: "Handlers & shared state",
      steps: [
        {
          type: "text",
          md: [
            "## State is a struct, cloned cheaply",
            "`AppState` holds the pool, the config, and anything else handlers need. It's wrapped in an `Arc` so cloning it per request is a pointer bump, not a copy.",
            "```",
            "pub struct AppState {",
            "    pub pool: PgPool,",
            "    pub config: Config,",
            "}",
            "type Shared = Arc<AppState>;",
            "```",
            "Handlers take `State(state): State<Shared>` and the router gets `.with_state(shared)`.",
          ],
        },
        {
          type: "code",
          title: "src/handlers/walkers.rs",
          source: String.raw`use std::sync::Arc;

use axum::{extract::{Path, State}, Json};
use serde::Serialize;

#[derive(Serialize)]
pub struct WalkerDto {
    pub id: u64,
    pub name: String,
}

pub struct AppState {
    pub walkers: Vec<WalkerDto>,
}

pub async fn list(State(state): State<Arc<AppState>>) -> Json<Vec<WalkerDto>> {
    Json(state.walkers.clone())
}

pub async fn show(
    State(state): State<Arc<AppState>>,
    Path(id): Path<u64>,
) -> Result<Json<WalkerDto>, crate::error::AppError> {
    state
        .walkers
        .iter()
        .find(|w| w.id == id)
        .cloned()
        .map(Json)
        .ok_or(crate::error::AppError::NotFound(id))
}`,
          caption: "Note the return types: `list` cannot fail, so it returns `Json` directly. `show` can, so it returns `Result` — and `ok_or` turns the `Option` into the error variant.",
        },
        {
          type: "quiz",
          q: "Why is `AppState` usually `Arc<AppState>` instead of `AppState`?",
          choices: [
            "Axum clones state per request; `Arc` makes that a pointer bump rather than a deep copy",
            "`Arc` is required by the `State` extractor",
            "It makes fields mutable",
            "It avoids the borrow checker",
          ],
          answer: 0,
          explain: "Handlers receive an owned clone of the state. Wrapping in `Arc` means the clone is three words, not a copy of the pool and config. `PgPool` is itself an `Arc` internally, but the struct around it isn't.",
          nudge: "Each request gets the state. How expensive is that if it's not shared?",
        },
        {
          type: "text",
          md: [
            "## DTOs are not your domain types",
            "`WalkerDto` exists for the wire; `domain::Walker` exists for the rules. Keeping them separate means a database column rename can't silently change your public JSON, and adding a field to the domain doesn't leak it to clients.",
            "The conversion lives in one place — usually `impl From<&domain::Walker> for WalkerDto` — and is the only code that knows both shapes.",
          ],
        },
        {
          type: "exercise",
          title: "List the walkers from state",
          prompt: [
            "Implement `list` so it returns the state's walkers as JSON.",
            "The state is behind an `Arc`, and the field is a `Vec<WalkerDto>`.",
          ],
          starter: String.raw`use std::sync::Arc;

use axum::{extract::State, Json};
use serde::Serialize;

#[derive(Serialize)]
pub struct WalkerDto {
    pub id: u64,
    pub name: String,
}

pub struct AppState {
    pub walkers: Vec<WalkerDto>,
}

pub async fn list(State(state): State<Arc<AppState>>) -> Json<Vec<WalkerDto>> {
    // your code here
}`,
          solution: String.raw`use std::sync::Arc;

use axum::{extract::State, Json};
use serde::Serialize;

#[derive(Serialize)]
pub struct WalkerDto {
    pub id: u64,
    pub name: String,
}

pub struct AppState {
    pub walkers: Vec<WalkerDto>,
}

pub async fn list(State(state): State<Arc<AppState>>) -> Json<Vec<WalkerDto>> {
    Json(state.walkers.clone())
}`,
          checks: [
            { re: /State\(state\):State<Arc<AppState>>/, hint: "Destructure the extractor: `State(state): State<Arc<AppState>>`." },
            { re: /Json\(state\.walkers\.clone\(\)\)/, hint: "The return type tells you the body: `Json(state.walkers.clone())`." },
          ],
          success: "Typed state in, typed JSON out — and the signature documents exactly what this handler touches.",
        },
      ],
    },
    {
      id: "wiring",
      title: "Wiring the app",
      steps: [
        {
          type: "text",
          md: [
            "## Composition at the top",
            "`main` should read like a table of contents: load config, build the pool, build the state, assemble the router, serve. Anything longer belongs in a function.",
            "```",
            "#[tokio::main]",
            "async fn main() -> anyhow::Result<()> {",
            "    let config = Config::from_env()?;",
            "    let pool = db::connect(&config.database_url).await?;",
            "    let state = Arc::new(AppState { pool, config });",
            "    let app = routes::app(state);",
            "    let listener = TcpListener::bind(addr).await?;",
            "    axum::serve(listener, app).await?;",
            "    Ok(())",
            "}",
            "```",
            "`anyhow::Result<()>` in `main` is the one place the opaque error type is exactly right — nobody matches on a startup failure.",
          ],
        },
        {
          type: "code",
          title: "src/routes.rs",
          source: String.raw`use std::sync::Arc;

use axum::{routing::get, Router};
use tower_http::trace::TraceLayer;

use crate::handlers::walkers::{self, AppState};

pub fn app(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/walkers", get(walkers::list))
        .route("/walkers/{id}", get(walkers::show))
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}`,
          caption: "Order matters: routes, then layers, then state. `with_state` consumes the router and returns one whose handlers no longer need the state parameter at the call site.",
        },
        {
          type: "quiz",
          q: "What does `.with_state(state)` do?",
          choices: [
            "Supplies the concrete state type so `State<S>` extractors can be resolved",
            "Starts the HTTP server",
            "Registers middleware",
            "Clones the router",
          ],
          answer: 0,
          explain: "The router is generic over its state until you provide it. `.with_state` fixes the type and produces a router that can be passed to `axum::serve`.",
          nudge: "The handler signatures mention a state type. Somebody has to supply it.",
        },
        {
          type: "text",
          md: [
            "## Split main from lib",
            "Put the router and handlers in `src/lib.rs` and keep `src/main.rs` to startup only. Two payoffs: integration tests in `tests/` can build the router without booting a real server, and the same code can be embedded in a CLI or a Lambda handler.",
            "That's the layout every production Rust service converges on, and it's what `cargo test` expects when you write an integration test.",
          ],
        },
        {
          type: "exercise",
          title: "Assemble the router",
          prompt: [
            "Build the router: mount `GET /walkers` to `list`, and attach the state.",
            "Attach state last — `with_state` consumes the router.",
          ],
          starter: String.raw`use std::sync::Arc;

use axum::{routing::get, Router};

use crate::handlers::walkers::{self, AppState};

pub fn app(state: Arc<AppState>) -> Router {
    // your code here
}`,
          solution: String.raw`use std::sync::Arc;

use axum::{routing::get, Router};

use crate::handlers::walkers::{self, AppState};

pub fn app(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/walkers", get(walkers::list))
        .with_state(state)
}`,
          checks: [
            { re: /Router::new\(\)/, hint: "Start from `Router::new()`." },
            { re: /\.route\("\/walkers",get\(walkers::list\)\)/, hint: "Mount the handler: `.route(\"/walkers\", get(walkers::list))`." },
            { re: /\.with_state\(state\)/, hint: "Attach the state to the router with `.with_state(state)`." },
          ],
          success: "Router, routes, state. That composition is the whole of an Axum application.",
        },
      ],
    },
  ],
});
