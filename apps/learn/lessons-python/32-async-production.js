window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "async-production",
  title: "Async in Production",
  emoji: "🌀",
  lang: "python",
  lessons: [
    {
      id: "event-loop-honestly",
      title: "The event loop, honestly",
      steps: [
        {
          type: "text",
          md: [
            "## `await` means \"park me, run someone else\"",
            "Module 24 introduced `async def` for I/O-bound work. Here's the part that matters once real traffic hits your API: FastAPI runs on **one event loop, on one thread**. Every `async def` route in your app shares that single loop. `await` is the one moment a coroutine can step aside and let the loop run a *different* request while it waits — for a database reply, an HTTP call, anything I/O-bound.",
            "That only works if the thing you're awaiting actually yields control. Call something that blocks — `time.sleep(1)`, the plain `requests` library, a tight CPU loop — inside an `async def` route, and it does **not** yield. It freezes the whole loop for that entire second. Every other request queued behind it, on every other connection, waits too. One slow blocking call in one route degrades the whole server, not just that request.",
          ],
        },
        {
          type: "code",
          title: "app/routers/debug.py — the same wait, two different outcomes",
          source: String.raw`import time
import asyncio

from fastapi import APIRouter

router = APIRouter(prefix="/debug", tags=["debug"])


@router.get("/slow-blocking")
async def slow_blocking() -> dict:
    time.sleep(1)  # BLOCKS the whole event loop for 1 full second
    return {"slept": "blocking"}


@router.get("/slow-async")
async def slow_async() -> dict:
    await asyncio.sleep(1)  # yields control — other requests run during this second
    return {"slept": "async"}`,
          caption: "Fire 10 concurrent requests at `/debug/slow-blocking` and they finish one after another — roughly 10 seconds total, because `time.sleep` never hands the loop back. Fire 10 at `/debug/slow-async` and they finish together in about 1 second — `await asyncio.sleep(1)` yields, so the loop interleaves all ten waits.",
        },
        {
          type: "text",
          md: [
            "## Spotting a blocking call before it ships",
            "The tell isn't the `async def` keyword — it's whether the call inside actually awaits. A short checklist for reviewing any `async def` route:",
            "- **`requests.get(...)`** — blocks. It has no `await` form; it's a synchronous library making a synchronous socket call. Use `httpx.AsyncClient` and `await client.get(...)` instead.\n- **`time.sleep(...)`** — blocks. Use `await asyncio.sleep(...)`.\n- **Heavy CPU work** (image resizing, a big `for` loop crunching numbers, `hashlib` on a huge payload) — blocks regardless of `await`, because there's nothing to await. CPU-bound work doesn't get faster by wrapping it in `async def`; it needs a thread or process pool (`run_in_executor`), which is outside this lesson's scope but the right search term when you hit it.\n- **A driver without an async mode** — the sync SQLAlchemy engine from module 25 is exactly this. Calling it from `async def` doesn't block the loop the way `time.sleep` does (FastAPI already runs sync `def` routes in a thread pool), but mixing a sync engine inside an `async def` route bypasses that safety net — lesson 4 covers the async-specific trap this creates.",
            "Rule of thumb: if a library's docs don't mention `asyncio` or show you an `await`, assume it blocks.",
          ],
        },
        {
          type: "quiz",
          q: "Which of these, called inside an `async def` route, blocks the entire event loop — not just that one request?",
          choices: [
            "`requests.get(\"https://api.example.com\")` — a synchronous call with no `await`",
            "`await httpx.AsyncClient().get(\"https://api.example.com\")` — an awaited async call",
            "`await asyncio.sleep(2)`",
            "`await session.execute(select(WalkerTable))` against an async database engine",
          ],
          answer: 0,
          explain: "`requests` is a synchronous library — calling it inside `async def` still runs it to completion on the event loop's own thread, with no yield point. Every other request queued on that loop waits until it returns. The other three all `await` something that genuinely hands control back.",
          nudge: "Which of these has no `await` in front of it at all?",
        },
        {
          type: "exercise",
          title: "Fix the blocking call",
          prompt: [
            "This route calls a slow external API with the synchronous `requests` library inside an `async def` route — exactly the mistake that freezes the loop. Rewrite it to use `httpx.AsyncClient` with `await` instead. Keep the route signature and the return shape the same.",
          ],
          starter: String.raw`import requests
from fastapi import APIRouter

router = APIRouter()


@router.get("/weather/{city}")
async def get_weather(city: str) -> dict:
    # your code here
    resp = requests.get(f"https://weather.example.com/{city}")
    return resp.json()`,
          solution: String.raw`import httpx
from fastapi import APIRouter

router = APIRouter()


@router.get("/weather/{city}")
async def get_weather(city: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://weather.example.com/{city}")
    return resp.json()`,
          checks: [
            { re: /import httpx/, hint: "Swap the `requests` import for `import httpx`." },
            { re: /async with httpx\.AsyncClient\(\)as client:/, hint: "Open the client with `async with httpx.AsyncClient() as client:`." },
            { re: /await client\.get\(/, hint: "Call `await client.get(...)` — the `await` is what actually yields control back to the loop." },
          ],
          mustNot: [
            { re: /requests\.get\(/, hint: "Drop `requests.get(...)` entirely — it's the synchronous call that blocks the loop." },
          ],
          success: "Same shape, no more frozen loop: httpx's AsyncClient awaits the network wait instead of blocking on it.",
        },
      ],
    },
    {
      id: "taskgroups-timeouts",
      title: "TaskGroups & timeouts",
      steps: [
        {
          type: "text",
          md: [
            "## Running things concurrently: `gather` vs `TaskGroup`",
            "Once a route needs to await *two* independent things — say, a walker's profile and their bookings — awaiting them one after another wastes time neither depends on the other. `asyncio.gather(a, b)` runs both concurrently and waits for both. It's been around for years and still works, but it has a sharp edge: if one awaitable raises, `gather` (by default) lets the *other* one keep running in the background — it doesn't cancel it for you, and the exception doesn't surface until every task is done.",
            "Python 3.11 added `asyncio.TaskGroup` — **structured concurrency**: a `with`-block where every task you launch inside it is guaranteed to be finished (or cancelled) before the block exits. If ANY task raises, the group cancels every other task in the group immediately, waits for them to unwind, then re-raises. That's the behavior you want for a route: don't leave a stray query running after you've already decided to return a 500.",
          ],
        },
        {
          type: "code",
          title: "app/routers/walkers.py — profile + bookings, concurrently, with a deadline",
          source: String.raw`import asyncio

from fastapi import APIRouter, Depends, HTTPException

from .. import data
from ..db import get_async_session

router = APIRouter(prefix="/walkers", tags=["walkers"])


@router.get("/{walker_id}/dashboard")
async def get_walker_dashboard(walker_id: str, session=Depends(get_async_session)) -> dict:
    try:
        async with asyncio.timeout(2):
            async with asyncio.TaskGroup() as tg:
                walker_task = tg.create_task(data.get_walker_async(session, walker_id))
                bookings_task = tg.create_task(data.list_bookings_for_walker_async(session, walker_id))
    except TimeoutError:
        raise HTTPException(status_code=504, detail="Dashboard took too long to load")

    walker = walker_task.result()
    if walker is None:
        raise HTTPException(status_code=404, detail="Walker not found")
    return {"walker": walker, "bookings": bookings_task.result()}`,
          caption: "`asyncio.timeout(2)` wraps the whole block in a 2-second deadline — if either query is still running when it fires, everything inside gets cancelled and `TimeoutError` raises. `tg.create_task(...)` schedules each coroutine; `.result()` after the `async with` block reads back what each task returned, since by then both are guaranteed complete.",
        },
        {
          type: "text",
          md: [
            "## Why the exception looks different",
            "When a task inside a `TaskGroup` fails, you don't get that exception directly — you get an **`ExceptionGroup`** (or `BaseExceptionGroup` for cancellation-flavored errors) wrapping every exception the group collected, because more than one task can fail before the others finish cancelling. Catch it with Python 3.11's `except*` syntax, which matches by exception type inside the group: `except* ValueError as eg:`. `gather` never does this — it just raises the first exception it sees, plain and un-wrapped, while its sibling tasks may still be running unmanaged in the background.",
          ],
        },
        {
          type: "quiz",
          q: "Inside `asyncio.gather(a, b)`, task `a` raises a `ValueError`. What happens to task `b`?",
          choices: [
            "It keeps running in the background — `gather` doesn't cancel it, and its result (or error) is discarded unless you specifically track it",
            "It's cancelled immediately, exactly like `asyncio.TaskGroup` would",
            "The whole event loop stops until `b` is manually cancelled",
            "`b`'s exception is merged with `a`'s into a single `ExceptionGroup`",
          ],
          answer: 0,
          explain: "This is the exact gap TaskGroup closes. `gather` raises `a`'s exception as soon as it happens, but `b` is left running unsupervised — you have to remember to cancel it yourself. `TaskGroup` cancels every sibling task automatically the moment one fails.",
          nudge: "gather() was written before structured concurrency existed — what does 'structured' mean it guarantees that gather doesn't?",
        },
        {
          type: "exercise",
          title: "Load walker + bookings in a TaskGroup",
          prompt: [
            "Fill in the body: open an `asyncio.TaskGroup()` and schedule two tasks — `data.get_walker_async(session, walker_id)` and `data.list_bookings_for_walker_async(session, walker_id)` — assigning each to a variable so you can read `.result()` after the block.",
          ],
          starter: String.raw`import asyncio

async def load_dashboard(session, walker_id):
    # your code here

    return walker_task.result(), bookings_task.result()`,
          solution: String.raw`import asyncio

async def load_dashboard(session, walker_id):
    async with asyncio.TaskGroup() as tg:
        walker_task = tg.create_task(data.get_walker_async(session, walker_id))
        bookings_task = tg.create_task(data.list_bookings_for_walker_async(session, walker_id))

    return walker_task.result(), bookings_task.result()`,
          checks: [
            { re: /async with asyncio\.TaskGroup\(\)as tg:/, hint: "Open the group with `async with asyncio.TaskGroup() as tg:`." },
            { re: /walker_task=tg\.create_task\(data\.get_walker_async\(session,walker_id\)\)/, hint: "Schedule the walker lookup: `walker_task = tg.create_task(data.get_walker_async(session, walker_id))`." },
            { re: /bookings_task=tg\.create_task\(data\.list_bookings_for_walker_async\(session,walker_id\)\)/, hint: "Schedule the bookings lookup the same way, into `bookings_task`." },
          ],
          success: "Both queries now run concurrently, and if either fails, TaskGroup cancels the other one for you — no orphaned query left running.",
        },
      ],
    },
    {
      id: "cancellation-shutdown",
      title: "Cancellation & graceful shutdown",
      steps: [
        {
          type: "text",
          md: [
            "## `CancelledError` is a request, not a bug",
            "When a client disconnects mid-request, or the timeout from lesson 2 fires, or the server is shutting down — Python cancels the running coroutine by raising `asyncio.CancelledError` **at whatever `await` it's currently sitting on**. It is not an error condition you caused; it's asyncio telling your code \"stop now, please.\" The correct response is almost always: clean up, then let it propagate.",
            "This is why `except Exception:` is safe but a bare `except:` is dangerous. `CancelledError` inherits from `BaseException`, not `Exception` (since Python 3.8, specifically so broad handlers wouldn't accidentally eat it). `except Exception:` lets it pass through untouched. A bare `except:` — or `except BaseException:` without re-raising — swallows it, and now the task thinks it finished normally when the loop believes it's cancelled. That mismatch is how you get connections that never close and shutdowns that hang.",
          ],
        },
        {
          type: "code",
          title: "app/routers/bookings.py — a streaming response that cleans up correctly",
          source: String.raw`from collections.abc import AsyncIterator

from fastapi.responses import StreamingResponse

from ..db import get_async_connection


async def stream_booking_updates(walker_id: str) -> AsyncIterator[bytes]:
    conn = await get_async_connection()
    try:
        async for row in conn.listen(f"walker:{walker_id}:bookings"):
            yield f"data: {row}\n\n".encode()
    except asyncio.CancelledError:
        # Client disconnected or the server is shutting down — no special
        # cleanup beyond what finally already does. Re-raise, don't swallow.
        raise
    finally:
        await conn.close()`,
          caption: "`finally` runs on every exit path — normal completion, an unrelated exception, OR cancellation — so `conn.close()` always fires. The `except asyncio.CancelledError: raise` block is here to make the intent explicit (never swallow it); the same cleanup would still happen without it, because `finally` doesn't care why the block exited.",
        },
        {
          type: "text",
          md: [
            "## Startup and shutdown for the whole app",
            "The same idea scales up to the whole application via FastAPI's **lifespan**: an async context manager that runs setup before the app accepts its first request, and teardown after the last request finishes and the server is asked to stop.",
          ],
        },
        {
          type: "code",
          title: "app/main.py — lifespan",
          source: String.raw`from contextlib import asynccontextmanager

from fastapi import FastAPI

from .db import async_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: runs once, before the app accepts traffic.
    yield
    # Shutdown: runs once, after the server stops accepting new requests.
    await async_engine.dispose()


app = FastAPI(lifespan=lifespan)`,
          caption: "Everything before `yield` is startup; everything after is shutdown. `async_engine.dispose()` closes the database connection pool cleanly instead of leaving sockets open when the process exits — the app-level version of the `finally: await conn.close()` pattern above.",
        },
        {
          type: "exercise",
          title: "Wrap cleanup in try/finally",
          prompt: [
            "This function opens a connection and does some work with it, but never closes it if the work raises or gets cancelled. Wrap the body in `try`/`finally` so `await conn.close()` always runs, no matter how the function exits.",
          ],
          starter: String.raw`async def run_report(query: str):
    conn = await get_async_connection()
    # your code here
    result = await conn.execute(query)
    return result`,
          solution: String.raw`async def run_report(query: str):
    conn = await get_async_connection()
    try:
        result = await conn.execute(query)
        return result
    finally:
        await conn.close()`,
          checks: [
            { re: /try:/, hint: "Open a `try:` block right after the connection is created." },
            { re: /finally:/, hint: "Add a `finally:` block after the `try` body." },
            { re: /finally:\s*await conn\.close\(\)/, hint: "`await conn.close()` has to be the thing that runs in `finally` — that's what guarantees cleanup on every exit path." },
          ],
          mustNot: [
            { re: /except:/, hint: "Don't add a bare `except:` — it would swallow `CancelledError` along with real errors. `finally` alone is enough here; nothing needs to be caught, just cleaned up." },
          ],
          success: "Now the connection closes whether run_report returns normally, raises, or gets cancelled mid-await — finally doesn't care which.",
        },
        {
          type: "quiz",
          q: "A route has `except: return {\"ok\": False}` wrapping its whole body — a bare except, no exception type. What breaks?",
          choices: [
            "It silently swallows `asyncio.CancelledError` too, so a cancelled request looks like it 'succeeded' with `{\"ok\": False}` instead of actually stopping — connections and cleanup never happen the way the caller expects",
            "Nothing — bare `except:` and `except Exception:` behave identically in asyncio code",
            "It causes a `SyntaxError` at import time",
            "It only affects synchronous routes, not `async def` ones",
          ],
          answer: 0,
          explain: "`CancelledError` is a `BaseException`, not an `Exception`, specifically so `except Exception:` won't catch it by accident. A bare `except:` catches everything, including cancellation — which means the task never actually stops when asked, it just returns a normal-looking result instead.",
          nudge: "What exception class does CancelledError inherit from — and does a bare `except:` care about the difference between BaseException and Exception?",
        },
      ],
    },
    {
      id: "async-sqlalchemy-pitfalls",
      title: "Async SQLAlchemy pitfalls",
      steps: [
        {
          type: "text",
          md: [
            "## Lazy loading fires SQL on attribute access — that's the trap",
            "Module 25's `WalkerTable` had no relationships. Add one — `WalkerTable.bookings` pointing at a new `BookingTable` — and SQLAlchemy's default behavior is **lazy loading**: `walker.bookings` looks like a plain attribute read, but the first time you touch it, SQLAlchemy quietly runs a *new* SQL query to fetch those rows, right there, wherever that attribute access happens to sit in your code.",
            "With the synchronous engine from module 25, that's merely a hidden query — sloppy (it can create the N+1 problem: one query per row instead of one query total), but it works. With the **async** engine, it doesn't work at all: firing a query requires an `await`, and `walker.bookings` is a plain attribute access with no `await` anywhere near it. SQLAlchemy can't insert one on your behalf. The result is `sqlalchemy.exc.MissingGreenlet` — a `greenlet_spawn has not been called` error — raised the moment you *read* `walker.bookings`, not when you built the original query.",
          ],
        },
        {
          type: "code",
          title: "app/models_db.py — adding the relationship",
          source: String.raw`from sqlalchemy.orm import relationship
from sqlmodel import Field, Relationship, SQLModel


class BookingTable(SQLModel, table=True):
    __tablename__ = "bookings"

    id: str = Field(primary_key=True)
    walker_id: str = Field(foreign_key="walkers.id")
    duration_minutes: int
    price_cents: int

    walker: "WalkerTable" = Relationship(back_populates="bookings")


class WalkerTable(SQLModel, table=True):
    __tablename__ = "walkers"

    id: str = Field(primary_key=True)
    name: str
    rating: float

    bookings: list["BookingTable"] = Relationship(back_populates="walker")`,
          caption: "`Relationship(...)` (SQLModel's wrapper over SQLAlchemy's `relationship()`) is what makes `walker.bookings` possible at all. It says nothing about WHEN the bookings load — that's a separate decision, made per-query.",
        },
        {
          type: "code",
          title: "app/routers/walkers.py — eager-load instead of lazy-load",
          source: String.raw`from sqlalchemy.orm import selectinload
from sqlmodel import select

from ..models_db import WalkerTable


@router.get("/{walker_id}/with-bookings")
async def get_walker_with_bookings(walker_id: str, session=Depends(get_async_session)) -> dict:
    result = await session.execute(
        select(WalkerTable)
        .where(WalkerTable.id == walker_id)
        .options(selectinload(WalkerTable.bookings))
    )
    walker = result.scalar_one_or_none()
    if walker is None:
        raise HTTPException(status_code=404, detail="Walker not found")

    return {"walker": walker.name, "bookings": len(walker.bookings)}`,
          caption: "`.options(selectinload(WalkerTable.bookings))` tells SQLAlchemy to fetch every matching walker's bookings in ONE extra query, issued right alongside the main one, as part of `await session.execute(...)`. By the time `walker.bookings` is read below, it's already sitting in memory — no lazy load, no MissingGreenlet, and no N+1 either.",
        },
        {
          type: "text",
          md: [
            "## The fix, and why it's the same fix as module 25's session-per-request",
            "`selectinload(...)` is the general answer: tell the query up front everything you'll need, so nothing has to lazy-load later. The alternative — writing an explicit second query for the bookings, the way you would in module 21's Django ORM without `select_related`/`prefetch_related` — works too, it's just more typing for the same result. What doesn't work in async code is leaving it implicit and hoping attribute access sorts itself out.",
            "This connects to a rule you already know: module 25's `get_session` opens one session per request and closes it in a `with` block. The async trap above is really the same lesson at a finer grain — know exactly which queries run, and when, instead of letting attribute access decide for you.",
          ],
        },
        {
          type: "exercise",
          title: "Eager-load the bookings",
          prompt: [
            "This query fetches a `WalkerTable` by id but doesn't eager-load `bookings` — reading `walker.bookings` later would raise `MissingGreenlet` under the async engine. Add `.options(selectinload(WalkerTable.bookings))` to the query chain.",
          ],
          starter: String.raw`from sqlalchemy.orm import selectinload
from sqlmodel import select


async def get_walker_with_bookings(session, walker_id: str):
    result = await session.execute(
        select(WalkerTable)
        .where(WalkerTable.id == walker_id)
        # your code here
    )
    return result.scalar_one_or_none()`,
          solution: String.raw`from sqlalchemy.orm import selectinload
from sqlmodel import select


async def get_walker_with_bookings(session, walker_id: str):
    result = await session.execute(
        select(WalkerTable)
        .where(WalkerTable.id == walker_id)
        .options(selectinload(WalkerTable.bookings))
    )
    return result.scalar_one_or_none()`,
          checks: [
            { re: /\.options\(/, hint: "Chain a `.options(...)` call onto the query." },
            { re: /selectinload\(WalkerTable\.bookings\)/, hint: "Pass `selectinload(WalkerTable.bookings)` to `.options(...)` — that's the relationship to eager-load." },
          ],
          mustNot: [
            { re: /lazy="?select"?/, hint: "Don't change the relationship's default lazy strategy here — fix it at the query with `.options(selectinload(...))`, the way the rest of the codebase does it." },
          ],
          success: "Now the bookings arrive in the same round trip as the walker — walker.bookings is already populated by the time anything reads it, async engine or not.",
        },
        {
          type: "quiz",
          q: "Under the async SQLAlchemy engine, `MissingGreenlet` on a lazy-loaded relationship gets raised — when, exactly?",
          choices: [
            "The moment your code reads the attribute (e.g. `walker.bookings`) — not when the original `select(WalkerTable)` query ran",
            "As soon as `await session.execute(select(WalkerTable))` runs, before you even get a result back",
            "Only when the FastAPI app shuts down",
            "It's raised at import time, when `models_db.py` is first loaded",
          ],
          answer: 0,
          explain: "The original query for the walker succeeds fine — it's a completely separate, implicit query for the RELATED rows that lazy loading tries to fire later, triggered by the attribute read itself. That's what makes the bug confusing: the traceback points at a line that looks like a harmless attribute access, far from any `select(...)` or `await`.",
          nudge: "The select() query for the walker itself works fine — so what's actually different about the moment walker.bookings gets touched?",
        },
      ],
    },
  ],
});
