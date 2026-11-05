SHELL := /bin/bash

DATABASE_URL ?= postgres://trading:trading@127.0.0.1:5433/trading
TEST_DATABASE_URL ?= postgres://trading:trading@127.0.0.1:5433/trading_test
# This machine provides Rust through mise. On a machine with cargo on PATH the
# fallback resolves to plain `cargo`, so the same Makefile works in CI.
CARGO ?= $(shell command -v cargo >/dev/null 2>&1 && echo cargo || echo 'mise exec -- cargo')

.PHONY: help db-up db-down db-reset run test test-unit test-integration lint fmt verify load

help: ## List available targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

db-up: ## Start Postgres on host port 5433 and wait until healthy
	docker compose up -d --wait postgres

db-down: ## Stop Postgres and delete its volume
	docker compose down -v

db-reset: db-down db-up ## Recreate the database from migrations on next start

run: ## Run the API against the local database
	set -a; [ -f .env ] && . ./.env; set +a; $(CARGO) run

test-unit: ## Domain, crypto, and rate-limit tests (no database)
	$(CARGO) test --lib

test-integration: ## HTTP suites against real Postgres
	TEST_DATABASE_URL=$(TEST_DATABASE_URL) $(CARGO) test --tests -- --test-threads=6

test: db-up test-unit test-integration ## Full automated suite

lint: ## Format check plus clippy with warnings denied
	$(CARGO) fmt --all -- --check
	$(CARGO) clippy --all-targets -- -D warnings

fmt: ## Apply rustfmt
	$(CARGO) fmt --all

verify: lint test ## The gate to run before every commit

load: ## On-demand load test (requires k6)
	k6 run scripts/load-test.js
