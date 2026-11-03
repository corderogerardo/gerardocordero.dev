window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "rust-production",
  title: "Production Rust",
  emoji: "🚀",
  lang: "rust",
  lessons: [
    {
      id: "config-tracing",
      title: "Config & observability",
      steps: [
        {
          type: "text",
          md: [
            "## Config is read once, at the edge",
            "Environment variables are untrusted strings. Read them once at startup, parse them into typed fields, and fail fast with a message that names the variable. After that, the rest of the program uses a `Config` struct — no `env::var` calls scattered through handlers.",
            "```",
            "let port: u16 = env::var(\"PORT\")?.parse()?;",
            "```",
            "**Red flag:** `env::var(\"DATABASE_URL\").unwrap()` inside a request handler. It's a panic waiting for a misconfigured deploy, and it hides the dependency.",
          ],
        },
        {
          type: "code",
          title: "src/config.rs",
          source: String.raw`use std::env;

pub struct Config {
    pub port: u16,
    pub database_url: String,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        let port = env::var("PORT")
            .unwrap_or_else(|_| String::from("3000"))
            .parse::<u16>()
            .map_err(|err| format!("PORT must be a number: {err}"))?;

        let database_url =
            env::var("DATABASE_URL").map_err(|_| String::from("DATABASE_URL is required"))?;

        Ok(Self { port, database_url })
    }
}`,
          caption: "A default for `PORT`, a hard requirement for `DATABASE_URL`, and an error message that names the variable. This function is the only place the process environment is read.",
        },
        {
          type: "quiz",
          q: "Why parse configuration into a typed struct at startup?",
          choices: [
            "A misconfiguration fails immediately with a clear message instead of at the first request",
            "It uses less memory",
            "Environment variables cannot be read later",
            "It is required by tokio",
          ],
          answer: 0,
          explain: "Failing at boot is a deploy that rolls back. Failing on the first request is an outage discovered by users. Typed config also means handlers never handle strings that might be invalid.",
          nudge: "When do you want to discover a missing variable?",
        },
        {
          type: "text",
          md: [
            "## Structured logs, not println",
            "`tracing` gives you spans and structured fields. Instead of `println!(\"request failed\")`, you get a line with the method, path, status and latency — filterable and aggregatable.",
            "```",
            "tracing_subscriber::fmt()",
            "    .with_env_filter(EnvFilter::from_default_env())",
            "    .init();",
            "```",
            "`RUST_LOG=pawwalk_api=debug,tower_http=info cargo run` then changes verbosity without a rebuild. Combined with `TraceLayer`, every request gets a span automatically.",
          ],
        },
        {
          type: "exercise",
          title: "Port with a default",
          prompt: [
            "Implement `port_from_env`: read `PORT`, parse it, and fall back to `8080` when it's missing or invalid.",
            "Chain `std::env::var(\"PORT\").ok().and_then(|v| v.parse().ok()).unwrap_or(8080)`.",
          ],
          starter: String.raw`pub fn port_from_env() -> u16 {
    // your code here
}`,
          solution: String.raw`pub fn port_from_env() -> u16 {
    std::env::var("PORT")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(8080)
}`,
          checks: [
            { re: /std::env::var\("PORT"\)/, hint: "Read the variable with `std::env::var(\"PORT\")`." },
            { re: /\.and_then\(\|value\|value\.parse\(\)\.ok\(\)\)/, hint: "Parse inside `and_then`, returning `Option` so an invalid value also falls back." },
            { re: /\.unwrap_or\(8080\)/, hint: "Default to 8080 with `.unwrap_or(8080)`." },
          ],
          success: "One expression, no panic, a default that works in development and an override for production.",
        },
      ],
    },
    {
      id: "graceful-shutdown",
      title: "Graceful shutdown",
      steps: [
        {
          type: "text",
          md: [
            "## Killing in-flight requests is a choice",
            "A rolling deploy sends `SIGTERM`. If the process exits immediately, every in-flight request dies mid-write. `axum::serve(...).with_graceful_shutdown(...)` stops accepting new connections and lets active ones finish.",
            "```",
            "axum::serve(listener, app)",
            "    .with_graceful_shutdown(shutdown_signal())",
            "    .await?;",
            "```",
            "Pair it with a readiness endpoint that starts returning 503 before shutdown, so the load balancer drains the instance first.",
          ],
        },
        {
          type: "code",
          title: "src/main.rs",
          source: String.raw`use tokio::signal;

pub async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c().await.expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install SIGTERM handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    tracing::info!("shutdown signal received; draining connections");
}`,
          caption: "`select!` waits for whichever signal arrives first. The `#[cfg]` split keeps it portable: SIGTERM is Unix-only, so other platforms wait on Ctrl+C alone.",
        },
        {
          type: "quiz",
          q: "What does graceful shutdown actually change?",
          choices: [
            "The server stops accepting new connections and lets in-flight requests finish",
            "It restarts the process",
            "It closes the database pool immediately",
            "It cancels every request",
          ],
          answer: 0,
          explain: "It removes the listener and awaits the active connections. Requests already being served complete; no new ones start. Without it, a deploy truncates whatever was mid-flight.",
          nudge: "What happens to a request that is halfway through a write?",
        },
        {
          type: "text",
          md: [
            "## Order matters on the way down",
            "Drain the listener first, then close the pool. If you close the pool while requests are still running, they fail with a confusing error. The `Arc` refcount naturally does the right thing: the last handler drops the last pool handle.",
            "**Production note:** give the shutdown a deadline (`tokio::time::timeout`). A stuck handler should not keep the process alive forever — Kubernetes will `SIGKILL` you anyway, and now you've lost the log.",
          ],
        },
        {
          type: "exercise",
          title: "Wait for Ctrl+C",
          prompt: [
            "Implement `shutdown_signal`: resolve when the user presses Ctrl+C.",
            "Use `tokio::signal::ctrl_c().await` and handle the error with `expect`.",
          ],
          starter: String.raw`pub async fn shutdown_signal() {
    // your code here
}`,
          solution: String.raw`pub async fn shutdown_signal() {
    tokio::signal::ctrl_c()
        .await
        .expect("failed to install Ctrl+C handler");
}`,
          checks: [
            { re: /tokio::signal::ctrl_c\(\)/, hint: "Await `tokio::signal::ctrl_c()`." },
            { re: /\.await/, hint: "The signal future must be awaited — the function is async." },
            { re: /expect\("failed to install Ctrl\+C handler"\)/, hint: "Handle the error explicitly with `expect`." },
          ],
          success: "That future is what you hand to `with_graceful_shutdown`. Ctrl+C now drains instead of killing.",
        },
      ],
    },
    {
      id: "docker-deploy",
      title: "Containers & release builds",
      steps: [
        {
          type: "text",
          md: [
            "## One binary, no runtime",
            "`cargo build --release` produces a single statically-linked-ish binary. No JVM, no Node, no Python interpreter. That's why Rust containers are routinely 20–50 MB and start in milliseconds.",
            "The Dockerfile shape that matters: **build in one stage, copy the binary into a minimal runtime stage**. Never ship the toolchain.",
            "```",
            "FROM rust:1-slim AS build",
            "WORKDIR /app",
            "COPY . .",
            "RUN cargo build --release",
            "FROM debian:bookworm-slim",
            "COPY --from=build /app/target/release/pawwalk-api /usr/local/bin/",
            "CMD [\"pawwalk-api\"]",
            "```",
          ],
        },
        {
          type: "code",
          title: "Dockerfile",
          source: String.raw`# ---- build ----
FROM rust:1.82-slim AS build
WORKDIR /app

# Cache dependencies separately from source.
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release

COPY . .
RUN touch src/main.rs && cargo build --release

# ---- runtime ----
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/target/release/pawwalk-api /usr/local/bin/pawwalk-api
EXPOSE 3000
CMD ["pawwalk-api"]`,
          caption: "The empty `main.rs` trick builds your dependencies in their own layer, so a source change doesn't re-download the world. `touch src/main.rs` then forces your crate to rebuild.",
        },
        {
          type: "quiz",
          q: "Why build dependencies in a separate Docker layer before copying the source?",
          choices: [
            "So a source-only change reuses the cached dependency layer instead of rebuilding everything",
            "Because Cargo requires it",
            "To make the final image smaller",
            "To enable debug symbols",
          ],
          answer: 0,
          explain: "Docker caches layers. If `Cargo.toml` and `Cargo.lock` are unchanged, the dependency build is a cache hit; only your crate recompiles. Without the trick, every source edit rebuilds all dependencies — minutes per iteration.",
          nudge: "Docker caches by layer. What invalidates a layer?",
        },
        {
          type: "text",
          md: [
            "## The release checklist",
            "Before the first real deploy: `cargo clippy -- -D warnings`, `cargo fmt --check`, `cargo test`, a `--release` build, and one `RUST_LOG=info` run against the real database. Then the operational basics: a `/health` endpoint, structured logs, a shutdown handler, and a database URL from the environment.",
            "**Red flag:** `unwrap()` in a request path, a secret in `Cargo.toml`, or a `println!` where a `tracing` span belongs. Each one is a future incident with a timestamp.",
          ],
        },
        {
          type: "xcode",
          title: "Ship it",
          label: "Over to the terminal",
          intro: [
            "You have the whole stack now: language, ownership, traits, async, Axum, sqlx, auth. Do the release pass on your own machine.",
          ],
          items: [
            "Run `cargo fmt --check` and `cargo clippy --all-targets -- -D warnings` in your service and fix everything they report",
            "Run `cargo test` and confirm the unit, integration and doc tests all pass",
            "Build the release binary with `cargo build --release` and note its size with `ls -lh target/release/pawwalk-api`",
            "Write the two-stage Dockerfile from this lesson and build the image with `docker build -t pawwalk-api .`",
            "Run it with `docker run --rm -e DATABASE_URL=… -p 3000:3000 pawwalk-api` and hit `curl localhost:3000/health`",
            "Send `SIGTERM` with `docker stop pawwalk-api` and confirm the log line says connections were drained",
          ],
        },
      ],
    },
  ],
});
