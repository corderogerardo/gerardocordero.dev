# syntax=docker/dockerfile:1

# ---- build -------------------------------------------------------------------
FROM rust:1.99-slim-bookworm AS builder

WORKDIR /app

# Cache dependencies separately from source.
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release && rm -rf src

COPY migrations ./migrations
COPY src ./src
# `sqlx::migrate!` embeds the migrations at compile time, so the runtime image
# needs no migration files and no sqlx CLI.
RUN touch src/main.rs && cargo build --release

# ---- runtime -----------------------------------------------------------------
FROM debian:bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10001 trading

COPY --from=builder /app/target/release/trading-api /usr/local/bin/trading-api

USER trading
EXPOSE 8080

ENV HOST=0.0.0.0 \
    PORT=8080 \
    ENVIRONMENT=production \
    RUST_LOG=trading_api=info,tower_http=info

ENTRYPOINT ["/usr/local/bin/trading-api"]
