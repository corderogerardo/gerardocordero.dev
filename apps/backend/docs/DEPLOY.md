# Deploying the backend

This reference app runs on SQLite by default, which is enough for local
development and the course exercises. To deploy it for real:

## 1. Point at a real database

Set `PAWWALK_DATABASE_URL` to a Postgres connection string. No code changes
are needed — SQLModel's engine is created from `settings.database_url` in
`app/db.py`, and Alembic migrations run against whatever URL is configured.

## 2. Set the required secrets

`PAWWALK_JWT_SECRET` has no default — the app refuses to start without it,
on purpose. Generate one with `python3 -c "import secrets; print(secrets.token_hex(32))"`
and set it as an environment variable on your host, never committed to git.

## 3. Run migrations before serving traffic

`app/db.py`'s `run_migrations()` runs `alembic upgrade head` automatically
in the FastAPI `lifespan` on every startup, so a fresh deploy always ends
up on the latest schema without a manual migration step.

## 4. Optional integrations

- **Stripe** — set `PAWWALK_STRIPE_SECRET_KEY` and
  `PAWWALK_STRIPE_WEBHOOK_SECRET` to enable real payments; omit them and
  `/payments/intent` returns a stub `client_secret` with the same shape.
- **LLM assistant** — set `PAWWALK_LLM_MODEL` (e.g.
  `anthropic:claude-3-5-haiku-latest`) plus the matching provider API key
  to upgrade the assistant from the offline heuristic parser to a real
  Pydantic AI agent. The heuristic keeps working as the fallback either way.

## Running locally

```bash
cd apps/backend
uv sync                 # or: pip install -e ".[dev]"
uv run fastapi dev       # http://localhost:8000/docs
uv run pytest
```
