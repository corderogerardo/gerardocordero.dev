# PawWalk Backend Architecture

FastAPI, chosen because its typed Pydantic models double as the API
contract: one model validates a request, shapes a response, and generates
the `/docs` page both the iOS and Android clients read.

## Layers

- **Routers** (`app/routers/`) — one file per resource (walkers, bookings,
  auth, payments, pets, assistant, waitlist, live), each an `APIRouter`
  included once in `app/main.py`.
- **Schemas** (`app/schemas.py`) — the API shape. Pydantic `BaseModel`s.
- **Tables** (`app/models_db.py`) — the DB shape. SQLModel `table=True`
  classes, a deliberately separate set of classes from the schemas so
  internal-only columns (like `password_hash`) can never leak to a client.
- **Data** (`app/data.py`) — the seam between routers and the database;
  queries live here so routers stay thin.
- **Auth** (`app/security.py`, `app/deps.py`) — bcrypt password hashing,
  JWT issuing/decoding, and the `Depends(get_current_user)` chain that
  gates every protected route.

## How prices are calculated

Every price lives in the database as `price_cents`, an integer. A booking's
price is the walker's `price_per_30min_cents` scaled by
`duration_minutes / 30`. Cents avoid floating-point rounding drift — the
same reason Stripe's own API is cents-denominated.

## The AI assistant

`POST /assistant/chat` runs a LangGraph state machine
(`app/assistant/graph.py`): `parse_intent` turns the message into a typed
`BookingIntent` (heuristic regex parser, or a Pydantic AI agent if
`PAWWALK_LLM_MODEL` is set — the heuristic is always the fallback). A
router then forks: booking-shaped messages go to `find_walkers` ->
`draft_booking` (or `ask_followup` if the dog's name is missing); plain
questions go to `answer_question`, which runs retrieval-augmented
generation (RAG) over this `docs/` folder and answers only from what it
retrieves — never inventing PawWalk policy.

## Auth is handled with JWTs

Passwords are bcrypt-hashed at signup (`app/security.py`) and never
stored in plaintext. Login verifies by re-hashing the attempt, never by
reversing the stored hash. A successful signup or login returns a signed
JWT (`sub` = user id, `exp` = expiry); every protected route decodes it
via `Depends(get_current_user)` before the route body runs.
