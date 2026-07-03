# PawWalk API

The FastAPI reference backend taught by PawWalk Academy's Python course
(`apps/learn/lessons-python/23-pydantic-fastapi.js` through
`31-rag-assistant-graduation.js`). It didn't exist as a real app until this
PR — the lessons quote its files verbatim (title fields like `app/schemas.py`,
`app/routers/walkers.py`) as a teaching device, and this app is that code,
extracted and assembled so the lessons' `apps/backend` references become
true. **The lessons are the spec**: every file here traces back to a
`code`/`solution` snippet in the course, with gaps filled in only where the
lessons show a call site but never the callee's body (see "Deviations from
the course" below).

PawWalk itself: a dog-walking marketplace. Owners book walkers (bookings
priced in cents), pay via Stripe, and can ask an AI assistant to parse a
booking request or answer a policy question — grounded in this repo's own
`docs/*.md` via retrieval-augmented generation (RAG), never a live API key
required.

## Run it

```bash
cd apps/backend
python3.12 -m venv .venv
.venv/bin/pip install -e ".[dev]"
PAWWALK_JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))") \
  .venv/bin/fastapi dev app/main.py
# http://localhost:8000/docs
```

(The course lessons use `uv run fastapi dev` — `uv` isn't required; a plain
venv + pip works identically, shown above.)

On startup the app runs Alembic migrations against a local SQLite file
(`pawwalk.db`, gitignored) and seeds three demo walkers — see `app/seed.py`.

## Test it

```bash
cd apps/backend
.venv/bin/pytest
```

16 tests, all passing offline (no network, no API keys): health/root, auth
signup/login (+ wrong-password 401), a protected route with and without a
token, booking creation + owner-scoping (someone else's booking 404s), the
`notes` 280-char cap (422), a stub Stripe payment intent, the waitlist's
case-insensitive dedup, the `/walkers/{id}/availability` toy endpoint from
module 24's terminal checklist, the assistant's offline heuristic path, and
the module-31 RAG retrieval-hit-rate eval (5/5 against its exact eval set).

## Environment

Copy `.env.example` to `.env`. `PAWWALK_JWT_SECRET` is the only required
variable — the app refuses to start without it (`app/config.py`). Everything
else (database URL, Stripe keys, `PAWWALK_LLM_MODEL`) is optional and
degrades gracefully: no Stripe key means `/payments/intent` returns a stub
`client_secret`; no `PAWWALK_LLM_MODEL` means the assistant runs its regex
heuristic parser instead of a real LLM call.

## Deviations from the course

The lessons quote real snippets but were never meant to be a complete,
copy-pasteable app on their own — a few files are shown only as call sites
(`data.list_walkers(session)`) with no body ever printed, or a field is used
(`settings.has_stripe`) without its declaration ever appearing. Recorded
here so nothing is a silent invention:

- **`app/data.py`** — no lesson prints this file's body, only call sites
  across modules 24, 26, 27, and 29 (`data.list_walkers`, `data.get_walker`,
  `data.find_walkers`, `data.get_booking`, `data.list_bookings`,
  `data.confirm_booking`). Implemented to match every call site actually
  used, backed by the SQLModel tables from module 25.
- **`app/config.py`** — `settings.has_stripe` (module 27) and `settings.has_llm`
  (module 28) are read but never declared in the `Settings` class shown in
  module 24. Added as `@property` computed from `stripe_secret_key` /
  `llm_model`, plus a `stripe_webhook_secret` field the webhook route
  (module 27) reads but the lesson's `Settings` snippet doesn't include.
- **`app/models_db.py`** — only `WalkerTable` is shown in full (module 25
  lesson 1). `UserTable`, `PetTable`, `BookingTable`, and `WaitlistTable`
  are inferred from the fields their routers/tests actually touch (e.g.
  `UserTable.password_hash` is named explicitly in module 25/26's prose,
  `BookingTable.status`/`price_cents` from module 26/27's payment flow).
  `role`/`duration_minutes`/`status` are stored as plain `str`/`int` columns
  rather than the `Literal[...]` types `schemas.py` uses — SQLModel can't
  derive a SQLAlchemy column type from a bare `Literal`, so the closed-set
  constraint lives only in the Pydantic API models, consistent with module
  25's own "DB shape ≠ API shape" lesson.
- **`app/routers/bookings.py`, `payments.py`, `pets.py`, `waitlist.py`,
  `live.py`** — route bodies for `create_booking`, `list_bookings`,
  `/bookings/stats`, `/bookings/assigned`, pets CRUD, and `live.py` are not
  shown in any lesson (only their existence, in `main.py`'s
  `include_router` list, or their route ordering rule for `bookings.py`).
  Implemented minimally against the schemas/tables the lessons do define.
  `list_assigned_bookings` returns `[]` — no lesson models a
  walker-assignment column, so nothing was invented for it.
- **`app/assistant/intent.py` — `run_sync(message, deps=...)`** — module 29's
  `check_availability` tool reads `ctx.deps.session`, but no lesson shows
  how `deps` is threaded into `agent.run_sync(...)` (module 28's snippet
  calls it with just the message). Added an `_AgentDeps` dataclass carrying
  the DB session, passed at the call site in `extract_intent`.
- **`app/assistant/rag.py` — `answer_from_context` and stopword filtering**
  — module 30 builds `embed`/`chunk`/`cosine`/`retrieve` verbatim, and
  module 31 sketches `answer_question`'s generate step as "the module-28
  assistant" without an LLM key. The offline extractive answer (best-matching
  sentence in the retrieved context) and a small stopword list (so "what
  is your..." doesn't drown out content words in short docs) are additions
  needed to make bag-of-words retrieval actually hit the right doc — verified
  against module 31's own 5-question eval set (5/5).
- **`docs/API-CONTRACT.md`, `ARCHITECTURE.md`, `DEPLOY.md`** — module 31's
  RAG node retrieves from these three files by name but no lesson prints
  their content. Written to accurately describe the app actually built here
  (auth, bookings, payments, the assistant) — this is the corpus the RAG
  pipeline is grounded in, not marketing copy.
- **`app/routers/walkers.py` — `WalkerProfileUpdate` schema unused by a
  route** — module 24 imports it in a code sample's import list but the
  route that would use it (`PATCH /walkers/me`) is never shown. Left the
  schema in `app/schemas.py` (it's real, typed, and may be picked up by a
  future module) without inventing a route body for it.
