window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "task-queues",
  title: "Task Queues & Events",
  emoji: "📮",
  lang: "python",
  lessons: [
    {
      id: "why-not-just-await-it",
      title: "Why not just await it?",
      steps: [
        {
          type: "text",
          md: [
            "## The booking-confirmation email problem",
            "A walker just confirmed a booking. Your route needs to send a confirmation email. The naive move: call the mailer with `await` right there in the request handler. But SMTP can take seconds, and the customer is sitting on a spinner waiting for a response that has nothing to do with whether their booking succeeded — the booking is already saved. Module 32 taught you not to block the event loop with sync calls; this is the same problem one level up: even an honestly-async, well-behaved wait doesn't belong on the critical path of a response the user is staring at.",
            "FastAPI ships a built-in escape hatch for exactly this: `BackgroundTasks`. Add one to a route, and FastAPI runs it *after* the response is already sent back to the client — the customer sees \"booking confirmed\" instantly, and the email goes out a moment later, same process, same request lifecycle.",
          ],
        },
        {
          type: "code",
          title: "app/routers/bookings.py — BackgroundTasks vs a real queue",
          source: String.raw`from fastapi import APIRouter, BackgroundTasks, Depends

from .. import mailer
from ..queue import get_redis_pool

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("/{booking_id}/confirm")
async def confirm_booking_inprocess(booking_id: str, background_tasks: BackgroundTasks) -> dict:
    booking = await _mark_confirmed(booking_id)
    # Runs after the response is sent — but in THIS process, on THIS worker.
    background_tasks.add_task(mailer.send_booking_email, booking.id)
    return {"status": "confirmed"}


@router.post("/{booking_id}/confirm-queued")
async def confirm_booking_queued(booking_id: str, redis=Depends(get_redis_pool)) -> dict:
    booking = await _mark_confirmed(booking_id)
    # Handed off to Redis — picked up by a separate worker process.
    await redis.enqueue_job("send_booking_email", booking.id)
    return {"status": "confirmed"}`,
          caption: "Same intent, two very different guarantees. `background_tasks.add_task(...)` runs in-process, on the same worker that handled the request. `redis.enqueue_job(...)` (arq — the async-native Redis queue) serializes the call and hands it to Redis; any worker process, anywhere, can pick it up.",
        },
        {
          type: "text",
          md: [
            "## Why in-process isn't enough for money",
            "`BackgroundTasks` has a hard limit: it lives and dies with the request's process. Deploy a new version while a background task is mid-flight, and it's gone — no error, no log, just silently never happened. The process crashes for any reason (OOM, a bad exception in an unrelated route, the host restarting) and every pending background task vanishes with it. There's no retry, because there's no record it was ever scheduled — it was a function call, not a durable job.",
            "For a logging call or a \"you were mentioned\" notification, that's a fine trade — worst case, one gets dropped, and dropped notifications are cheap. For a booking-confirmation email, or anything that touches money, it's the wrong trade: the customer paid, and the confirmation silently not sending is a support ticket you'll hear about. That's the line: **fire-and-forget, don't-care-if-it's-lost work → `BackgroundTasks`. Anything that must eventually happen → a real queue.**",
            "A real queue has two parts working together: a **broker** (Redis here — durable, shared storage for pending jobs) and one or more **worker processes**, separate from your API server, that pull jobs off Redis and run them. Because the job lives in Redis and not in a request's memory, a worker crashing or redeploying doesn't lose it — the job is still sitting there, waiting for a worker (any worker) to pick it up.",
          ],
        },
        {
          type: "quiz",
          q: "Which of these belongs on `BackgroundTasks` rather than a real queue?",
          choices: [
            "Logging an analytics event for \"walker viewed profile\" — fine to lose occasionally, nobody's paying for it",
            "Sending the booking-confirmation email after a successful payment",
            "Charging a customer's saved card for a recurring booking",
            "Publishing a \"booking_created\" event that other services depend on",
          ],
          answer: 0,
          explain: "An occasional dropped analytics event costs nothing. The other three all have a real cost if silently lost — a customer who paid but got no confirmation, a charge that must happen exactly when scheduled, or a downstream service that never learns a booking exists. Those need a broker + worker that survives a deploy, not a background task tied to one process's lifetime.",
          nudge: "Ask: if this silently never ran, would anyone notice — and would it cost something if they did?",
        },
      ],
    },
    {
      id: "workers-and-retries",
      title: "Workers & retries",
      steps: [
        {
          type: "text",
          md: [
            "## A task is just an async function that takes `ctx`",
            "arq tasks look almost exactly like the route handlers you've been writing since module 24 — the only new thing is the first parameter, `ctx`: a dict arq hands every task, carrying job metadata (`ctx[\"job_id\"]`, `ctx[\"job_try\"]`, `ctx[\"redis\"]`) and anything you stashed there at startup (a DB session factory, an HTTP client). No `ctx` argument, no arq task.",
            "The worker process itself is configured with a `WorkerSettings` class — a list of task functions plus how to reach Redis. You run it as its own process (`arq app.worker.WorkerSettings`), completely separate from `uvicorn` running your API. That separation is the whole point: the API process can crash, deploy, or scale independently of the worker pulling jobs off the queue.",
          ],
        },
        {
          type: "code",
          title: "app/worker.py — the task and its WorkerSettings",
          source: String.raw`from arq import Retry
from arq.connections import RedisSettings

from . import mailer, data
from .db import get_session


async def send_booking_email(ctx, booking_id: str) -> None:
    with get_session() as session:
        booking = data.get_booking(session, booking_id)
    if booking is None:
        return  # nothing to send — not worth retrying
    try:
        await mailer.send_booking_confirmation(booking)
    except mailer.SendError as exc:
        # Defer the retry a little longer each attempt — 5s, 10s, 15s...
        raise Retry(defer=ctx["job_try"] * 5) from exc


class WorkerSettings:
    functions = [send_booking_email]
    redis_settings = RedisSettings(host="localhost", port=6379)
    max_tries = 5`,
          caption: "`ctx[\"job_try\"]` starts at 1 and increments on every retry — multiplying it by 5 gives a simple growing backoff (5s, then 10s, then 15s...) instead of hammering a mail provider that's already struggling. `max_tries = 5` (arq's own default) caps how many times arq will retry before giving up for good.",
        },
        {
          type: "text",
          md: [
            "## Retrying, and what happens when retries run out",
            "Two ways a job retries: raise `arq.Retry(defer=...)` yourself when you know it's worth another attempt (like the `SendError` above), or just let an *unexpected* exception escape — arq catches it, counts it against `max_tries`, and retries automatically without you writing any retry logic at all. Either way, the job keeps its place: same `job_id`, same arguments, just tried again later.",
            "Once a job hits `max_tries` and still fails, arq stops retrying and marks it permanently failed. That's the moment you want a **dead-letter place** — somewhere those poison jobs land instead of vanishing, so a human can look at *why* five attempts to email this one booking all failed (bad address? mail provider down for an hour? a bug in your template?). arq doesn't build this for you automatically; the common move is a small `on_job_failure` hook, or an `except*`-wrapped worker loop, that writes the job id and error to a `failed_jobs` table or an alerting channel.",
          ],
        },
        {
          type: "exercise",
          title: "Write the task with a retry",
          prompt: [
            "Fill in `send_booking_email`: fetch the booking with `data.get_booking(session, booking_id)`, then call `await mailer.send_booking_confirmation(booking)`. If that raises `mailer.SendError`, re-raise it as `Retry(defer=ctx[\"job_try\"] * 5)` so arq retries with backoff instead of losing the job.",
          ],
          starter: String.raw`from arq import Retry

from . import mailer, data
from .db import get_session


async def send_booking_email(ctx, booking_id: str) -> None:
    with get_session() as session:
        booking = data.get_booking(session, booking_id)
    # your code here`,
          solution: String.raw`from arq import Retry

from . import mailer, data
from .db import get_session


async def send_booking_email(ctx, booking_id: str) -> None:
    with get_session() as session:
        booking = data.get_booking(session, booking_id)
    try:
        await mailer.send_booking_confirmation(booking)
    except mailer.SendError as exc:
        raise Retry(defer=ctx["job_try"] * 5) from exc`,
          checks: [
            { re: /await mailer\.send_booking_confirmation\(booking\)/, hint: "Call `await mailer.send_booking_confirmation(booking)` — this is the actual work the job exists to do." },
            { re: /except mailer\.SendError as exc:/, hint: "Catch the mailer's own error type: `except mailer.SendError as exc:`." },
            { re: /raise Retry\(defer=ctx\["job_try"\]\*5\)from exc/, hint: "Re-raise as `raise Retry(defer=ctx[\"job_try\"] * 5) from exc` — that's what tells arq to try again later instead of giving up." },
          ],
          success: "arq will now retry a failed send with growing backoff instead of losing the job on the first bad attempt.",
        },
        {
          type: "quiz",
          q: "arq guarantees at-least-once delivery — the SAME job can run twice. When does that actually happen?",
          choices: [
            "A worker picks up the job, starts running it, crashes or gets killed before finishing — arq can't tell 'it succeeded but didn't report back' from 'it never ran', so the job gets retried and a second worker runs it too",
            "Never — arq guarantees each job runs exactly once, that's the whole point of a queue",
            "Only if you call `enqueue_job` twice with the same arguments",
            "Only when `max_tries` is set higher than 1",
          ],
          answer: 0,
          explain: "A queue can't distinguish 'the worker died right after finishing the email but before marking the job done' from 'the worker died before sending anything.' Either way, from the queue's point of view the job didn't complete, so it gets retried — and now the email might go out twice. This is why at-least-once, not exactly-once, is the honest guarantee any Redis- or broker-based queue can make.",
          nudge: "Think about a worker process getting killed (deploy, OOM, crash) at the worst possible moment — right after the real work finished but before it could report success.",
        },
      ],
    },
    {
      id: "idempotency",
      title: "Idempotency",
      steps: [
        {
          type: "text",
          md: [
            "## At-least-once means every handler must survive running twice",
            "Lesson 2's quiz landed on the real consequence of at-least-once delivery: your task function WILL, eventually, run twice for the same job. That's not a bug to eliminate — it's a property of every queue built on a broker like Redis. The fix isn't trying to make delivery exactly-once (that's a much harder, slower guarantee most systems don't actually need); it's making every handler **idempotent** — safe to run twice, three times, with the same end result as running it once.",
            "Three moves, from weakest to strongest:",
            "- **Natural idempotency.** Design the operation so replay is harmless by construction. `UPDATE bookings SET status = 'emailed'` run twice leaves the same row in the same state. `UPDATE bookings SET email_count = email_count + 1` run twice does NOT — that's a counter, and counters are the classic non-idempotent trap.\n- **An idempotency key with a unique constraint.** When the operation itself can't be made naturally safe (sending an email can't be \"set a flag\" — the email either goes out or it doesn't), record that this specific job already ran, using a column the database enforces uniqueness on.\n- **Check-then-act is NOT enough on its own** — covered next.",
          ],
        },
        {
          type: "code",
          title: "app/models_db.py + app/worker.py — the idempotency-key table",
          source: String.raw`from sqlmodel import Field, SQLModel


class SentEmail(SQLModel, table=True):
    __tablename__ = "sent_emails"

    idempotency_key: str = Field(primary_key=True)
    booking_id: str
    sent_at: str


# In the worker task — insert first, let the DB reject a duplicate:
from sqlalchemy.exc import IntegrityError


async def send_booking_email(ctx, booking_id: str) -> None:
    key = f"booking-email:{booking_id}"
    with get_session() as session:
        try:
            session.add(SentEmail(idempotency_key=key, booking_id=booking_id, sent_at=now_iso()))
            session.commit()
        except IntegrityError:
            session.rollback()
            return  # already sent — this is a replay, do nothing
    await mailer.send_booking_confirmation(booking_id)`,
          caption: "`idempotency_key` as the PRIMARY KEY is what makes this bulletproof — the database itself refuses a second row with the same key, no matter how many workers race to insert it at the same instant. `INSERT ... ON CONFLICT (idempotency_key) DO NOTHING` is the same idea in raw SQL, the shape you saw for Stripe webhooks back in module 27.",
        },
        {
          type: "text",
          md: [
            "## Why check-then-insert races — and the constraint doesn't",
            "The tempting shortcut: `SELECT ... WHERE idempotency_key = key`, and only insert + send if nothing came back. That reads correct and passes every manual test — because you tested it one request at a time. It fails under concurrency: two workers (arq retries can overlap with a redelivered job, or you're running more than one worker process) both run the `SELECT` a few milliseconds apart, both see nothing, both decide it's safe, both send the email. The check and the act are two separate steps with a gap between them, and the gap is exactly where the race lives.",
            "A `UNIQUE`/primary-key constraint closes that gap because the database makes the insert **atomic** — there is no moment where two workers can both believe they \"won.\" One `INSERT` succeeds; the other fails with `IntegrityError` (or does nothing, with `ON CONFLICT DO NOTHING`). The constraint isn't an optimization on top of the check — it replaces the check with something the database itself can't race.",
          ],
        },
        {
          type: "exercise",
          title: "Guard the handler with an idempotency key",
          prompt: [
            "Insert a `SentEmail` row for `key`. If it raises `IntegrityError` (a duplicate — this job already ran), roll back and `return` early. Keep it to the insert + except — no `SELECT` check first.",
          ],
          starter: String.raw`from sqlalchemy.exc import IntegrityError


def guard_once(session, key: str, booking_id: str) -> bool:
    # your code here — insert, catch IntegrityError, return early on duplicate
    return True  # reached only if this is the first time`,
          solution: String.raw`from sqlalchemy.exc import IntegrityError


def guard_once(session, key: str, booking_id: str) -> bool:
    try:
        session.add(SentEmail(idempotency_key=key, booking_id=booking_id, sent_at=now_iso()))
        session.commit()
    except IntegrityError:
        session.rollback()
        return False
    return True`,
          checks: [
            { re: /try:/, hint: "Wrap the insert in `try:`." },
            { re: /session\.add\(SentEmail\(idempotency_key=key,booking_id=booking_id,sent_at=now_iso\(\)\)\)/, hint: "Add a `SentEmail(idempotency_key=key, booking_id=booking_id, sent_at=now_iso())` to the session." },
            { re: /except IntegrityError:/, hint: "Catch `IntegrityError` — that's what the unique constraint raises on a duplicate key." },
            { re: /return False/, hint: "Return early (e.g. `return False`) on the duplicate — that's the whole guard." },
          ],
          mustNot: [
            { re: /select\(SentEmail\)/i, hint: "No SELECT-then-insert here — that's exactly the race this exercise is avoiding. Just insert and handle the constraint violation." },
          ],
          success: "The unique constraint on idempotency_key does the race-proofing — no SELECT needed, no window where two workers can both think they're first.",
        },
        {
          type: "quiz",
          q: "Why does 'SELECT to check, then INSERT if nothing found' fail as an idempotency guard, when a unique constraint on INSERT doesn't?",
          choices: [
            "The SELECT and the INSERT are two separate steps with a gap between them — two concurrent workers can both SELECT before either INSERTs, both see 'nothing yet', and both proceed. A unique constraint makes the insert itself atomic, so only one of two concurrent inserts can ever succeed",
            "SELECT statements are slower than INSERT statements, so they cause timeouts",
            "It doesn't fail — check-then-insert and a unique constraint are equally safe",
            "IntegrityError can only be raised by PostgreSQL, not other databases",
          ],
          answer: 0,
          explain: "This is the classic check-then-act race: correctness depends on nothing changing between your check and your act, and concurrency is exactly what breaks that assumption. The database's unique constraint sidesteps the whole problem — it doesn't check-then-act, it makes the act itself fail atomically for every insert after the first.",
          nudge: "What has to be true for 'check, then act' to be safe — and what does a second worker running the same check a few milliseconds later break?",
        },
      ],
    },
    {
      id: "outbox-pattern",
      title: "The outbox pattern",
      steps: [
        {
          type: "text",
          md: [
            "## The dual-write problem",
            "A booking gets created and, in the same breath, you want to tell the rest of the system: publish a `\"booking_created\"` event to Redis so other consumers (analytics, the walker's mobile push notification, a partner webhook) can react. That's two separate writes — one to Postgres (the booking row), one to Redis (the event) — and they can't be wrapped in one atomic transaction, because Postgres and Redis are two different systems with no shared commit.",
            "Whichever order you pick, there's a failure mode that loses correctness:",
            "- **Publish first, commit second.** The publish to Redis succeeds, consumers start reacting to `\"booking_created\"` — then the database transaction fails or gets rolled back. Now the rest of the system believes a booking exists that was never actually saved. A **ghost event**.\n- **Commit first, publish second.** The database transaction commits — the booking is real. Then the process crashes, or the Redis call fails, right before the publish. The booking exists, but nobody downstream ever hears about it. A **lost event**.",
          ],
        },
        {
          type: "text",
          md: [
            "## The fix: an outbox table in the same transaction",
            "Instead of publishing to Redis directly from the request, write the event as a plain row in an **outbox table** — in the exact same database transaction as the booking itself. A single Postgres transaction either commits both rows or neither; there's no window where one exists without the other. A separate **relay loop** (a small background process, or the same arq worker on a schedule) polls the outbox table for unsent rows, enqueues each one to Redis, and marks it sent — or leaves it unsent to retry on the next poll if the enqueue fails.",
            "The relay is itself at-least-once: if it crashes between enqueuing and marking a row sent, the next poll enqueues that row again. That's fine, because lesson 3 already made every consumer idempotent — a duplicate `\"booking_created\"` event is a no-op, the same way a duplicate confirmation email is. The outbox doesn't eliminate at-least-once delivery; it just guarantees the event is never silently lost or silently phantom, and idempotency handles the rest.",
          ],
        },
        {
          type: "code",
          title: "app/routers/bookings.py + app/outbox_relay.py — write together, relay separately",
          source: String.raw`from sqlmodel import Field, SQLModel, select


class OutboxEvent(SQLModel, table=True):
    __tablename__ = "outbox_events"

    id: str = Field(primary_key=True)
    event_type: str
    payload: str          # JSON-encoded
    sent_at: str | None = None


async def create_booking(session, booking_in: BookingCreate) -> Booking:
    async with session.begin():
        booking = BookingTable(**booking_in.model_dump())
        session.add(booking)
        session.add(OutboxEvent(
            id=str(uuid4()),
            event_type="booking_created",
            payload=json.dumps({"booking_id": booking.id}),
        ))
    return booking


async def relay_outbox_events(session, redis) -> None:
    unsent = (await session.exec(select(OutboxEvent).where(OutboxEvent.sent_at.is_(None)))).all()
    for event in unsent:
        await redis.enqueue_job("handle_domain_event", event.event_type, event.payload)
        event.sent_at = now_iso()
        session.add(event)
    await session.commit()`,
          caption: "The `session.add(OutboxEvent(...))` line lives INSIDE the same `async with session.begin()` block as the booking — that's the entire trick. If the transaction rolls back, both rows vanish together; if it commits, both rows exist together. The relay loop runs completely separately, on its own poll cycle, and only ever reads/writes the outbox table.",
        },
        {
          type: "exercise",
          title: "Put the outbox insert in the booking's transaction",
          prompt: [
            "Inside `create_booking`, add the `OutboxEvent` row in the SAME `async with session.begin()` block as the `BookingTable` insert — same transaction, so both commit or neither does. Use `event_type=\"booking_created\"` and `payload=json.dumps({\"booking_id\": booking.id})`.",
          ],
          starter: String.raw`async def create_booking(session, booking_in: BookingCreate) -> Booking:
    async with session.begin():
        booking = BookingTable(**booking_in.model_dump())
        session.add(booking)
        # your code here — add the OutboxEvent in this SAME transaction
    return booking`,
          solution: String.raw`async def create_booking(session, booking_in: BookingCreate) -> Booking:
    async with session.begin():
        booking = BookingTable(**booking_in.model_dump())
        session.add(booking)
        session.add(OutboxEvent(
            id=str(uuid4()),
            event_type="booking_created",
            payload=json.dumps({"booking_id": booking.id}),
        ))
    return booking`,
          checks: [
            { re: /async with session\.begin\(\):/, hint: "Keep the whole thing inside `async with session.begin():` — that's what makes it one transaction." },
            { re: /session\.add\(OutboxEvent\(/, hint: "Add the outbox row with `session.add(OutboxEvent(...))`." },
            { re: /event_type="booking_created"/, hint: "Set `event_type=\"booking_created\"` on the outbox row." },
            { re: /payload=json\.dumps\(\{"booking_id":booking\.id\}\)/, hint: "Set `payload=json.dumps({\"booking_id\": booking.id})` — JSON-encode the event data." },
          ],
          mustNot: [
            { re: /await redis\.enqueue_job/, hint: "No direct Redis call here — that's the relay's job, on its own separate poll cycle, not inside the request transaction." },
          ],
          success: "Booking and event now live or die together — no ghost events from a rollback, no lost events from a crash between two separate writes.",
        },
        {
          type: "quiz",
          q: "Publish-to-Redis-then-commit-to-Postgres vs the outbox pattern — what failure does each risk?",
          choices: [
            "Publish-then-commit risks a ghost event (consumers react to a booking that then fails to save); the outbox risks neither, because the event and the booking commit atomically in one transaction — the relay's own at-least-once redelivery is handled by consumer idempotency, not a correctness gap",
            "They carry the exact same risk — there's no real difference between the two approaches",
            "Publish-then-commit is always slower; that's the only difference",
            "The outbox pattern risks losing events, while publish-then-commit never does",
          ],
          answer: 0,
          explain: "Publish-first has a real correctness gap: the event can escape before you know the transaction will succeed. The outbox closes that gap at the database level — event and booking commit together, atomically, in Postgres. What's left (the relay redelivering an already-sent event after a crash) isn't a correctness gap, it's an at-least-once replay — exactly what lesson 3's idempotency guard already handles.",
          nudge: "Which of the two writes (Redis publish, Postgres commit) can fail independently of the other — and which pattern removes that independence?",
        },
      ],
    },
  ],
});
