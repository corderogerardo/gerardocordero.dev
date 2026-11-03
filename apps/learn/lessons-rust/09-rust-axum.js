window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "rust-axum",
  title: "Axum: the HTTP framework",
  emoji: "🌐",
  lang: "rust",
  lessons: [
    {
      id: "axum-basics",
      title: "Router & handlers",
      steps: [
        {
          type: "text",
          md: [
            "## Axum is a router, not a kitchen sink",
            "Axum gives you three things and gets out of the way: a **`Router`** that maps paths to handlers, **extractors** that turn a request into typed arguments, and **responses** that turn your return value into bytes. Everything else is `tower` middleware you opt into.",
            "A handler is any `async fn` whose arguments implement the extractor traits and whose return value implements `IntoResponse`. That's the entire mental model.",
            "```",
            "async fn health() -> &'static str { \"ok\" }",
            "let app = Router::new().route(\"/health\", get(health));",
            "```",
            "> **Pitch line:** in Axum the function signature *is* the request contract — path, query, body and state all appear as typed parameters.",
          ],
        },
        {
          type: "code",
          title: "src/routes.rs",
          source: String.raw`use axum::{routing::get, Json, Router};
use serde::Serialize;

#[derive(Serialize)]
struct Health {
    status: &'static str,
    version: &'static str,
}

async fn health() -> Json<Health> {
    Json(Health { status: "ok", version: env!("CARGO_PKG_VERSION") })
}

async fn root() -> &'static str {
    "PawWalk API"
}

pub fn app() -> Router {
    Router::new()
        .route("/", get(root))
        .route("/health", get(health))
}

#[tokio::main]
async fn main() {
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app()).await.unwrap();
}`,
          caption: "`Json<T>` is both an extractor and a response. Returning it sets `Content-Type: application/json` and serialises `T` — as long as `T: Serialize`.",
        },
        {
          type: "quiz",
          q: "What must a function satisfy to be used as an Axum handler?",
          choices: [
            "Be `async`, take extractor arguments, and return something implementing `IntoResponse`",
            "Implement a `Handler` trait manually",
            "Take a `Request` and return a `Response` only",
            "Be registered in a macro",
          ],
          answer: 0,
          explain: "Handlers are ordinary async functions. The trait machinery is implemented for any `async fn` whose parameters are extractors and whose return type is `IntoResponse` — no registration, no annotation.",
          nudge: "The signature does the work.",
        },
        {
          type: "text",
          md: [
            "## Method routing is explicit",
            "`get(handler)` is a `MethodRouter`. Chain them: `.route(\"/walkers\", get(list).post(create))`. A path that exists but with the wrong verb returns **405**, not 404 — Axum tracks the methods per route.",
            "Path parameters use the same syntax as the rest of the ecosystem: `.route(\"/walkers/:id\", get(show))`. In Axum 0.8 the syntax moved to braces — `.route(\"/walkers/{id}\", get(show))` — so check the version you're on.",
          ],
        },
        {
          type: "exercise",
          title: "Mount the health route",
          prompt: [
            "Build a `Router` exposing `GET /health` returning the text `ok`.",
            "Use an inline closure handler — no separate function needed.",
          ],
          starter: String.raw`use axum::{routing::get, Router};

pub fn app() -> Router {
    // your code here
}`,
          solution: String.raw`use axum::{routing::get, Router};

pub fn app() -> Router {
    Router::new().route("/health", get(|| async { "ok" }))
}`,
          checks: [
            { re: /Router::new\(\)/, hint: "Start from `Router::new()`." },
            { re: /\.route\("\/health",get\(/, hint: "Mount the path with a method router: `.route(\"/health\", get(...))`." },
            { re: /get\(\|\|async\{/, hint: "An async closure works as a handler: `get(|| async { \"ok\" })`." },
          ],
          success: "That's a complete, type-checked HTTP surface in one expression.",
        },
      ],
    },
    {
      id: "extractors",
      title: "Extractors: path, query, body, state",
      steps: [
        {
          type: "text",
          md: [
            "## Arguments are typed requests",
            "An extractor is a type that knows how to build itself from parts of the request. The ones you'll use constantly:",
            "- **`Path<T>`** — typed path segments (`/walkers/{id}`).\n- **`Query<T>`** — the query string, deserialised into a struct.\n- **`Json<T>`** — the request body, parsed as JSON.\n- **`State<S>`** — your shared application state.\n- **`HeaderMap`, `TypedHeader`** — headers.",
            "Extractors that consume the body (`Json`, `String`, `Bytes`) must be **last** in the argument list, because the body can only be read once. `Path`, `Query` and `State` can come in any order.",
          ],
        },
        {
          type: "code",
          title: "src/handlers.rs",
          source: String.raw`use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct Walker {
    pub id: u64,
    pub name: String,
}

#[derive(Deserialize)]
pub struct Page {
    pub limit: Option<u32>,
}

pub async fn show(Path(id): Path<u64>) -> Json<Walker> {
    Json(Walker { id, name: String::from("Mochi") })
}

pub async fn list(Query(page): Query<Page>) -> Json<Vec<Walker>> {
    let limit = page.limit.unwrap_or(20) as usize;
    Json((0..limit as u64).map(|id| Walker { id, name: format!("walker-{id}") }).collect())
}

pub async fn create(Json(body): Json<Walker>) -> Json<Walker> {
    Json(body)
}`,
          caption: "`Path<u64>` fails with a 400 if the segment isn't a number — you never parse it by hand. `Json<Walker>` on the way in requires `Deserialize`; on the way out, `Serialize`.",
        },
        {
          type: "quiz",
          q: "Why must `Json<T>` be the last argument of a handler?",
          choices: [
            "It consumes the request body, which can only be read once",
            "Because of a Rust borrow-checker limitation",
            "It is just a convention with no reason",
            "It must always be the only argument",
          ],
          answer: 0,
          explain: "The body is a stream. `Json` reads it to completion; any extractor after it would find nothing. `Path`, `Query` and `State` read request parts that are cheap and repeatable.",
          nudge: "Think about the underlying bytes.",
        },
        {
          type: "text",
          md: [
            "## State is explicit and typed",
            "Shared state goes in `State<S>` and is attached with `.with_state(s)`. The type must be cheap to clone — which is why `Arc<AppState>` is the usual shape. Every handler that needs the database pool or config asks for it in its signature.",
            "```",
            "let app = Router::new()",
            "    .route(\"/walkers\", get(list))",
            "    .with_state(state);",
            "```",
            "There is no global. If a handler can read the database, you can see it in the signature — and the compiler will remind you when you wire it up.",
          ],
        },
        {
          type: "exercise",
          title: "Return a typed JSON walker",
          prompt: [
            "Implement `show`: take the id from the path and return a `Walker` with that id and the name `Mochi`.",
            "The return type `Json<Walker>` already tells you the shape of the answer.",
          ],
          starter: String.raw`use axum::{extract::Path, Json};
use serde::Serialize;

#[derive(Serialize)]
pub struct Walker {
    pub id: u64,
    pub name: String,
}

pub async fn show(Path(id): Path<u64>) -> Json<Walker> {
    // your code here
}`,
          solution: String.raw`use axum::{extract::Path, Json};
use serde::Serialize;

#[derive(Serialize)]
pub struct Walker {
    pub id: u64,
    pub name: String,
}

pub async fn show(Path(id): Path<u64>) -> Json<Walker> {
    Json(Walker { id, name: String::from("Mochi") })
}`,
          checks: [
            { re: /Path\(id\):Path<u64>/, hint: "Destructure the extractor in the signature: `Path(id): Path<u64>`." },
            { re: /Json\(Walker\{id,name:/, hint: "Wrap the struct in `Json(...)` and use the field shorthand for `id`." },
          ],
          success: "Path in, JSON out, both typed. No manual parsing, no manual serialisation.",
        },
      ],
    },
    {
      id: "errors-middleware",
      title: "Error responses & middleware",
      steps: [
        {
          type: "text",
          md: [
            "## One error type per app, one `IntoResponse`",
            "Handlers return `Result<T, E>` where `E: IntoResponse`. Implement `IntoResponse` for your error enum and every handler gets consistent status codes and JSON bodies for free.",
            "```",
            "impl IntoResponse for AppError {",
            "    fn into_response(self) -> Response {",
            "        let (status, message) = match self { … };",
            "        (status, Json(json!({ \"error\": message }))).into_response()",
            "    }",
            "}",
            "```",
            "Then `async fn show(...) -> Result<Json<Walker>, AppError>` compiles, and `?` works on anything convertible into `AppError`.",
            "> **Pitch line:** the HTTP status code lives in exactly one file, not smeared across every handler.",
          ],
        },
        {
          type: "code",
          title: "src/error.rs",
          source: String.raw`use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

#[derive(Debug)]
pub enum AppError {
    NotFound(u64),
    Database(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::NotFound(id) => (StatusCode::NOT_FOUND, format!("walker {id} not found")),
            AppError::Database(err) => (StatusCode::INTERNAL_SERVER_ERROR, err),
        };

        (status, Json(json!({ "error": message }))).into_response()
    }
}`,
          caption: "The tuple `(StatusCode, Json<Value>)` implements `IntoResponse`, so rendering the error body is one expression. Add a variant and the match forces you to pick a status.",
        },
        {
          type: "quiz",
          q: "A handler returns `Result<Json<Walker>, AppError>`. What does Axum do on `Err`?",
          choices: [
            "Calls `AppError::into_response()` and sends that response",
            "Panics",
            "Returns a plain 500 with no body",
            "Logs and retries the handler",
          ],
          answer: 0,
          explain: "`Result<T, E>` implements `IntoResponse` when both `T` and `E` do. `Ok` renders `T`, `Err` renders `E` — so your error mapping is the single place status codes are decided.",
          nudge: "Both arms of the Result must be renderable.",
        },
        {
          type: "text",
          md: [
            "## Middleware is `tower`, not Axum-specific",
            "Axum sits on **tower**, so any tower layer works: `tower_http::trace::TraceLayer` for request spans, `CompressionLayer`, `CorsLayer`, `TimeoutLayer`, rate limiting. Attach with `.layer(...)`.",
            "```",
            "let app = Router::new()",
            "    .route(\"/walkers\", get(list))",
            "    .layer(TraceLayer::new_for_http());",
            "```",
            "Layers wrap the whole router and run in the order applied. That's also how `tower::ServiceBuilder` composes them, and why you can test the stack without an HTTP server.",
          ],
        },
        {
          type: "exercise",
          title: "Map the error to a status",
          prompt: [
            "Implement `IntoResponse` for `AppError`: `NotFound` becomes **404** with a message, and the response is JSON.",
            "Match on `self`, build a `(StatusCode, message)` tuple, then convert it with `.into_response()`.",
          ],
          starter: String.raw`use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};

pub enum AppError {
    NotFound(u64),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        // your code here
    }
}`,
          solution: String.raw`use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};

pub enum AppError {
    NotFound(u64),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::NotFound(id) => (StatusCode::NOT_FOUND, format!("walker {id} not found")),
        };

        (status, message).into_response()
    }
}`,
          checks: [
            { re: /impl IntoResponse for AppError/, hint: "Implement the trait: `impl IntoResponse for AppError`." },
            { re: /StatusCode::NOT_FOUND/, hint: "Map the variant to `StatusCode::NOT_FOUND`." },
            { re: /\.into_response\(\)/, hint: "Convert the tuple with `.into_response()` — `(StatusCode, String)` implements it." },
          ],
          success: "Every handler in the app can now return `Result<_, AppError>` and let this one function decide the HTTP shape.",
        },
      ],
    },
  ],
});
