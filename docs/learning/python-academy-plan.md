# Python Academy Plan

## Summary

The Python course teaches backend development from zero: Python the language, then three
frameworks in deliberate order — Flask (manual wiring), Django (batteries included),
FastAPI (typed, modern) — and finishes with AI engineering: structured LLM output,
LangGraph agents, and RAG, all anchored in the PawWalk dog-walking universe.

Originally authored as "Part II" of the iOS course, it became its own course in July 2026:
`apps/learn/python.html` loads `apps/learn/lessons-python/*.js` with store key
`pawwalk-academy-python-v1` (progress from the old shared `pawwalk-academy-v1` key is
migrated automatically on first load). Format rules: `apps/learn/lessons-python/FORMAT-PYTHON.md`
on top of the shared `apps/learn/lessons/FORMAT.md`. Validate with
`node tools/validate.mjs lessons-python` (or no argument for all four courses).

## Modules

| # | File | Title | Focus |
|---|---|---|---|
| 13 | `13-py-welcome.js` | Welcome to Python | Why Python; course map; first lines of Python |
| 14 | `14-python-basics.js` | Python Basics | Variables, strings, numbers, functions, control flow |
| 15 | `15-collections.js` | Collections | Lists, dicts, tuples, sets, comprehensions |
| 16 | `16-classes-typing.js` | Classes & Typing | Classes, dataclasses, type hints |
| 17 | `17-errors-files-json.js` | Errors, Files & JSON | Exceptions, context managers, files, JSON |
| 18 | `18-http-flask.js` | HTTP & Flask | HTTP verbs/headers, routes, request/response by hand |
| 19 | `19-flask-deeper.js` | Flask Deeper | Blueprints, templates, forms, app structure |
| 20 | `20-django-anatomy.js` | Django Anatomy | Project layout, settings, URLs, views, admin |
| 21 | `21-django-orm.js` | Django ORM | Models, migrations, queries, relationships |
| 22 | `22-django-api-auth.js` | Django APIs & Auth | DRF-style JSON APIs, sessions vs tokens |
| 23 | `23-pydantic-fastapi.js` | Pydantic & FastAPI | Validation, schemas, first FastAPI routes |
| 24 | `24-fastapi-routers-di.js` | Routers & Dependency Injection | APIRouter, Depends, app assembly |
| 25 | `25-database-sqlalchemy.js` | Databases & SQLAlchemy | Engine/session, models, queries, Alembic idea |
| 26 | `26-auth-security.js` | Auth & Security | Password hashing, JWT, auth dependencies |
| 27 | `27-payments-testing.js` | Payments & Testing | Stripe flow, webhooks, pytest, TestClient |
| 28 | `28-llm-foundations.js` | LLM Foundations | Tokens, prompts, structured output, function calling |
| 29 | `29-langgraph-agent.js` | LangGraph Agents | Agents as graphs, tools, state, loops |
| 30 | `30-rag-from-scratch.js` | RAG from Scratch | Embeddings, chunking, retrieval, grounded answers |
| 31 | `31-rag-assistant-graduation.js` | RAG in the Assistant + Graduation | The full assistant pipeline; graduation |

Numbering starts at 13 (a relic of the Part II era) — kept because module ids key learner
progress; renumbering would orphan it.

## Reference backend

Lessons 23–31 quote a FastAPI service under `apps/backend` paths (e.g. `app/schemas.py`).
**That app does not exist in the repo yet.** It will be assembled from the code the lessons
already quote (the lessons are the spec) when the senior tier lands, so existing references
become true without lesson edits. Flask (18–19) and Django (20–22) modules build throwaway
projects under `apps/learn/playground/` (gitignored) — that stays.

## Senior tier (planned, files 32+)

Production-hardening modules informed by Sentry, the FastAPI full-stack template, and
Django internals — each landing alongside the real `apps/backend` code it teaches:

| # | Title | Focus |
|---|---|---|
| 32 | Async in Production ✅ | `32-async-production.js` — event loop honesty, TaskGroups & timeouts, cancellation/graceful shutdown, async SQLAlchemy pitfalls (`MissingGreenlet`, `selectinload`) |
| 33 | Task Queues & Events ✅ | `33-task-queues.js` — BackgroundTasks vs a real queue, arq workers & retries, idempotency keys, the outbox pattern |
| 34 | Caching & Rate Limiting ✅ | `34-caching-rate-limiting.js` — Redis cache-aside, invalidation & key namespacing, fixed-window rate limiting, FastAPI `Depends` limiter |
| 35 | Postgres at Scale ✅ | `35-postgres-at-scale.js` — EXPLAIN/EXPLAIN ANALYZE, composite & partial indexes, ORM N+1 via selectinload, zero-downtime Alembic migrations |
| 36 | Observability ✅ | `36-observability.js` — structured logging (structlog) + request ids via contextvars, FastAPI request-id middleware, OpenTelemetry auto-instrumentation + manual spans, Sentry init, liveness vs readiness health endpoints |
| 37 | LLM Production Hardening ✅ | `37-llm-hardening.js` — evals (structured checks, semantic similarity, LLM-as-judge), Pydantic guardrails against prompt injection + malformed output with retry, streaming responses, cost/latency logging |
| 38 | Ship It & Graduation ✅ | `38-ship-it.js` — multi-stage Dockerfile with uv (`uv.lock`, `--frozen`), CI building the image, Locust load testing (p50/p95/p99), graduation recap |

## Status

- Modules 13–31: **complete** (19 modules, 68 lessons, 382 steps; validator green).
- Course split out of the iOS shell: **done** (July 2026).
- Module 32 (Async in Production): **complete** — first senior-tier module landed.
- Module 33 (Task Queues & Events): **complete** — arq workers, idempotency, outbox pattern.
- Module 34 (Caching & Rate Limiting): **complete** — Redis cache-aside, invalidation, fixed-window limiter wired into FastAPI via `Depends`.
- Module 35 (Postgres at Scale): **complete** — reading EXPLAIN/EXPLAIN ANALYZE, composite/partial indexes, fixing the ORM N+1 with selectinload, zero-downtime Alembic migrations.
- Module 36 (Observability): **complete** — structured logs vs print, request-scoped logging via structlog contextvars, OpenTelemetry auto-instrumentation and manual spans, Sentry init, liveness/readiness health endpoints and alerting on symptoms.
- Module 37 (LLM Production Hardening): **complete** — evals (structured/semantic/LLM-as-judge), prompt-injection and Pydantic output-validation guardrails with retry, streaming for perceived latency, cost/latency logging tying back to module 36.
- Module 38 (Ship It & Graduation): **complete** — multi-stage Dockerfile (`uv.lock` +
  `uv sync --frozen`, non-root user), `.dockerignore`, `docker-compose.yml` (backend +
  Postgres) added to `apps/backend`; Locust load testing and p50/p95/p99 reading; the
  final graduation recap capping the whole Python track (modules 13-38).
- **PYTHON SENIOR TIER COMPLETE**: modules 32-38 all landed (async in production, task
  queues, caching & rate limiting, Postgres at scale, observability, LLM hardening,
  ship it & graduation). The Python course now runs 13-38, 26 modules end to end, from
  `print("hello")` to a containerized, tested, observable, AI-assisted FastAPI backend.
