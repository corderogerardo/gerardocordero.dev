window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "caching-rate-limiting",
  title: "Caching & Rate Limiting",
  emoji: "🚦",
  lang: "python",
  lessons: [
    {
      id: "cheapest-query-skip",
      title: "The cheapest query is the one you skip",
      steps: [
        {
          type: "text",
          md: [
            "## Stop asking the database the same question over and over",
            "Every time a client opens the app, it asks the API for the list of nearby walkers. That list changes maybe once an hour — a walker updates their bio, adjusts a price, goes on vacation. But the API re-runs the same Postgres query on every single request, even when a thousand requests in a row would get back the exact same rows.",
            "**Cache-aside** (also called lazy loading) fixes that without touching the database schema at all: check a fast key-value store (Redis) first. On a hit, return it — no Postgres round trip. On a miss, run the real query, then write the result into Redis with a **TTL** (time-to-live, an expiry in seconds) before returning it. The next request within that TTL hits Redis instead.",
            "The name comes from where the cache sits: *beside* the database, not in front of it like a proxy. Your application code is the one deciding when to read from it and when to fill it — Redis itself has no idea a Postgres table even exists.",
          ],
        },
        {
          type: "text",
          md: [
            "## What's safe to cache — and what isn't",
            "Cache-aside is a great fit for data that's **read far more than it's written** and can tolerate being a little stale: the walker directory, a walker's public profile, a city's list of service areas. Nobody's hurt if the list is 60 seconds out of date.",
            "It's the wrong tool for **live booking state** — whether a specific walk is still available right now, whether a payment went through. That data changes on every write and being even a few seconds stale means double-booking a walker or showing a charge that already failed. Rule of thumb: if staleness would just look slightly outdated, cache it. If staleness would be *wrong*, don't.",
          ],
        },
        {
          type: "code",
          title: "app/routers/walkers.py — cache-aside read",
          source: String.raw`from fastapi import APIRouter, Depends

from .. import data
from ..cache import get_redis
import json

router = APIRouter(prefix="/walkers", tags=["walkers"])

WALKERS_KEY = "walkers:list"
WALKERS_TTL = 60  # seconds


@router.get("")
async def list_walkers(redis=Depends(get_redis)) -> list[dict]:
    cached = await redis.get(WALKERS_KEY)
    if cached is not None:
        return json.loads(cached)

    walkers = await data.fetch_all_walkers()  # the real Postgres query
    payload = [w.model_dump() for w in walkers]
    await redis.setex(WALKERS_KEY, WALKERS_TTL, json.dumps(payload))
    return payload`,
          caption: "`redis.get` returns `None` on a miss (Redis stores strings, so a hit still needs `json.loads`). `setex(key, ttl, value)` sets the value AND its expiry in one atomic call — no separate `expire` needed for the write path.",
        },
        {
          type: "quiz",
          q: "In cache-aside, who is responsible for writing data into the cache?",
          choices: [
            "The application, right after a cache miss forces it to fetch from the real database",
            "Redis itself — it watches Postgres and copies rows over automatically",
            "Nobody — cache-aside means the cache fills itself lazily with zero app code",
            "A separate nightly cron job that pre-warms every key",
          ],
          answer: 0,
          explain: "Redis has no idea Postgres exists. The app is the one that checks the cache, and on a miss, is the one that fetches the real data AND decides to write it back with `setex`. That's the whole 'aside' in cache-aside — the cache sits next to your code's control flow, not inside the database.",
          nudge: "Redis is just a key-value store here — it has no connection to Postgres. Who actually calls `setex`?",
        },
      ],
    },
    {
      id: "invalidation-hard-part",
      title: "Invalidation, the hard part",
      steps: [
        {
          type: "text",
          md: [
            "## A TTL is a floor, not a correctness guarantee",
            "A 60-second TTL means \"this can be at most 60 seconds stale\" — it does NOT mean \"this will always be fresh within 60 seconds.\" If a walker edits their price the instant after you cache the list, every reader sees the old price for up to 60 more seconds. For a directory listing that's a shrug. For anything that must reflect a write immediately, TTL alone isn't enough — you need **explicit invalidation**: delete the cache key the moment the underlying data changes, so the next read is forced to miss and re-fetch fresh.",
            "The pattern is simple: any endpoint that writes to the walkers table also deletes `walkers:list` in the same request, right after the write commits. The next `GET /walkers` finds nothing cached, falls through to Postgres, and re-populates the key with the new data.",
          ],
        },
        {
          type: "text",
          md: [
            "## Key namespacing and versioning",
            "`walkers:list` is a **namespaced key** — the `walkers:` prefix groups related keys so you can reason about (and bulk-delete) them without stepping on `bookings:` or `sessions:` keys living in the same Redis instance. As the app grows, prefer specific keys over one giant blob: `walkers:list`, `walkers:123:profile`, `walkers:city:toronto` — each invalidated independently instead of nuking everything on every small write.",
            "One more trap: if you change the *shape* of what's cached (add a field, rename one), old cached JSON written by the previous code version is still sitting there with the old shape, and a rolling deploy means both versions run at once. Bake a version into the key — `walkers:list:v2` — so a schema change can't hand old code a payload it doesn't expect, or vice versa.",
            "> One-line thundering-herd note: if a popular key expires and a thousand requests all miss at once, they all hammer Postgres simultaneously. That's a real problem at scale (the fix involves locks or early recomputation) — worth knowing the name for, not something this lesson builds.",
          ],
        },
        {
          type: "code",
          title: "app/routers/walkers.py — invalidate on write",
          source: String.raw`@router.patch("/{walker_id}")
async def update_walker(walker_id: str, patch: WalkerUpdate, redis=Depends(get_redis)) -> dict:
    walker = await data.update_walker(walker_id, patch)
    await redis.delete(WALKERS_KEY)  # force the next read to miss and refill
    return walker.model_dump()`,
          caption: "`redis.delete` takes one or more keys and removes them; a key that doesn't exist is silently a no-op. Deleting is cheaper and more correct here than trying to update the cached list in place.",
        },
        {
          type: "exercise",
          title: "Write the cache-aside getter",
          prompt: [
            "Write `get_walkers(redis)`: check `redis.get(WALKERS_KEY)` first. On a hit, return `json.loads` of it. On a miss, call `await data.fetch_all_walkers()`, then `await redis.setex(WALKERS_KEY, WALKERS_TTL, json.dumps(payload))` before returning the payload.",
          ],
          starter: String.raw`import json

from . import data

WALKERS_KEY = "walkers:list"
WALKERS_TTL = 60


async def get_walkers(redis) -> list[dict]:
    # your code here
    pass`,
          solution: String.raw`import json

from . import data

WALKERS_KEY = "walkers:list"
WALKERS_TTL = 60


async def get_walkers(redis) -> list[dict]:
    cached = await redis.get(WALKERS_KEY)
    if cached is not None:
        return json.loads(cached)
    walkers = await data.fetch_all_walkers()
    payload = [w.model_dump() for w in walkers]
    await redis.setex(WALKERS_KEY, WALKERS_TTL, json.dumps(payload))
    return payload`,
          checks: [
            { re: /await redis\.get\(WALKERS_KEY\)/, hint: "Start with `await redis.get(WALKERS_KEY)` — that's the cache check." },
            { re: /if cached is not None:/, hint: "Guard the hit path with `if cached is not None:` — an empty list is falsy but still a valid cached value, so don't just check truthiness." },
            { re: /await redis\.setex\(WALKERS_KEY,WALKERS_TTL,json\.dumps\(payload\)\)/, hint: "On a miss, write back with `await redis.setex(WALKERS_KEY, WALKERS_TTL, json.dumps(payload))` — key, ttl, then the JSON string." },
            { re: /return payload/, hint: "End with `return payload` — the miss path still has to hand the freshly-fetched data back to the caller." },
          ],
          success: "That's the whole cache-aside read path — check, and only hit the database when Redis comes back empty.",
        },
        {
          type: "quiz",
          q: "Why is a TTL alone not enough for data that can change before it expires?",
          choices: [
            "The TTL only bounds the WORST-case staleness — a write can happen the instant after a value is cached, and every reader sees the stale value until the TTL naturally runs out, however long that is",
            "TTLs in Redis are unreliable and often fail to expire keys on time",
            "It is enough — TTL alone is always sufficient for any kind of cached data",
            "TTLs only work for numeric values, not JSON-encoded lists",
          ],
          answer: 0,
          explain: "A TTL caps how stale a value CAN get, but says nothing about when it actually goes stale relative to a write. Explicit invalidation (deleting the key on write) closes that gap immediately instead of waiting out the clock.",
          nudge: "Picture a write landing one second after the value gets cached with a 60-second TTL — how long do readers see the old value?",
        },
      ],
    },
    {
      id: "rate-limiting-protect-api",
      title: "Rate limiting: protect the API",
      steps: [
        {
          type: "text",
          md: [
            "## Why limit requests at all",
            "Three reasons to cap how often a client can call your API: **abuse** (someone scripting login attempts or scraping every walker profile), **cost** (every request burns CPU, DB connections, maybe a paid third-party call), and **fairness** (one noisy client shouldn't starve everyone else's requests of capacity). Rate limiting turns \"unbounded\" into \"bounded and predictable.\"",
            "**Fixed-window** counting is the simplest approach: pick a window (say, 60 seconds), count requests in that window, reject once the count passes a limit, reset the counter when the window rolls over. It's cheap and easy to reason about — but it has a real flaw at the boundary: a client can send the full limit in the last second of one window, then immediately send the full limit again in the first second of the next window. Two limits' worth of requests land in under two seconds, right at the seam. **Sliding-window** approaches (tracking a rolling timestamp log, or a weighted blend of the current and previous window) smooth that out, at the cost of more bookkeeping. Fixed-window is the right default when \"roughly N per minute\" is good enough — which it usually is.",
          ],
        },
        {
          type: "code",
          title: "app/rate_limit.py — fixed-window counter with incr + expire",
          source: String.raw`WINDOW_SECONDS = 60
MAX_REQUESTS = 30


async def check_rate_limit(redis, client_key: str) -> tuple[bool, int]:
    key = f"ratelimit:{client_key}"
    count = await redis.incr(key)
    if count == 1:
        # First request in a new window — start the clock on it.
        await redis.expire(key, WINDOW_SECONDS)
    allowed = count <= MAX_REQUESTS
    return allowed, count`,
          caption: "`incr` on a missing key creates it at 1 and returns 1 — that's the exact moment `count == 1` fires, so the window's expiry is only ever set once per window, not re-armed on every request (which would let a steady stream of requests keep the key alive forever and never reset).",
        },
        {
          type: "exercise",
          title: "Write the limiter core",
          prompt: [
            "Write `hit(redis, key)`: set `count` from `await redis.incr(key)`. If `count == 1`, call `await redis.expire(key, WINDOW_SECONDS)` to start the window's clock. Return `count`.",
          ],
          starter: String.raw`WINDOW_SECONDS = 60


async def hit(redis, key: str) -> int:
    # your code here
    pass`,
          solution: String.raw`WINDOW_SECONDS = 60


async def hit(redis, key: str) -> int:
    count = await redis.incr(key)
    if count == 1:
        await redis.expire(key, WINDOW_SECONDS)
    return count`,
          checks: [
            { re: /count=await redis\.incr\(key\)/, hint: "Start with `count = await redis.incr(key)` — atomic increment, creates the key at 1 if it doesn't exist yet." },
            { re: /if count==1:/, hint: "Only arm the expiry the first time: `if count == 1:`." },
            { re: /await redis\.expire\(key,WINDOW_SECONDS\)/, hint: "Inside that guard, call `await redis.expire(key, WINDOW_SECONDS)` to start the window." },
            { re: /return count/, hint: "Finish with `return count` — the caller compares it against the limit to decide allow vs. 429." },
          ],
          success: "That's a fixed-window counter in three lines — incr does the counting, expire (guarded to fire once) does the resetting.",
        },
        {
          type: "quiz",
          q: "A client sends 30 requests in the last second of a fixed window, then 30 more in the first second of the next window. What happens?",
          choices: [
            "All 60 requests succeed — fixed-window counts each window independently, so a burst straddling the boundary can briefly exceed the intended per-minute rate by up to 2x",
            "The second batch of 30 is rejected — fixed-window remembers requests across window boundaries",
            "Nothing — Redis automatically smooths bursts regardless of the counting strategy used",
            "Only sliding-window has this problem; fixed-window has no boundary flaw",
          ],
          answer: 0,
          explain: "Fixed-window resets the counter to zero the moment a new window starts, with no memory of the previous window. A burst timed right at the seam gets a full allowance twice in quick succession — the classic fixed-window boundary flaw. Sliding-window exists specifically to close this gap.",
          nudge: "Fixed-window counters reset to zero at the window boundary — does the counter know or care what happened one second earlier, in the previous window?",
        },
      ],
    },
    {
      id: "wire-into-fastapi",
      title: "Wire it into FastAPI",
      steps: [
        {
          type: "text",
          md: [
            "## A dependency, not middleware",
            "You met `Depends` back in module 24 for pulling a DB session into a route. A rate limiter fits the same shape: a small async function that runs before the route body, has the request available (to read an API key or the client's IP), and can short-circuit the request by raising before the route ever executes.",
            "Middleware is the alternative — it wraps *every* request to the app, which is right for something truly global (logging, CORS). A `Depends` limiter is right when different routes need different limits, or some routes need no limit at all (a health check shouldn't be rate-limited alongside a search endpoint). Route-scoped control is why most FastAPI rate limiters, including this one, are dependencies.",
            "The key you rate-limit on matters: an API key if clients authenticate with one, `request.client.host` (their IP) if they don't. Either way, that key is what goes into the Redis counter key from lesson 3 — one counter per client, not one global counter for the whole API.",
          ],
        },
        {
          type: "code",
          title: "app/routers/walkers.py — caching + rate limiting composed",
          source: String.raw`from fastapi import APIRouter, Depends, HTTPException, Request

from ..cache import get_redis
from ..rate_limit import hit, WINDOW_SECONDS, MAX_REQUESTS
from . import get_walkers  # lesson 2's cache-aside getter

router = APIRouter(prefix="/walkers", tags=["walkers"])


async def rate_limiter(request: Request, redis=Depends(get_redis)) -> None:
    client_key = request.client.host
    count = await hit(redis, f"ratelimit:{client_key}")
    if count > MAX_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail="Too many requests",
            headers={"Retry-After": str(WINDOW_SECONDS)},
        )


@router.get("", dependencies=[Depends(rate_limiter)])
async def list_walkers(redis=Depends(get_redis)) -> list[dict]:
    return await get_walkers(redis)`,
          caption: "`dependencies=[Depends(rate_limiter)]` on the route runs the limiter for its side effect (raising or not) without the route needing its return value. `Retry-After` is a standard HTTP header telling a well-behaved client exactly how many seconds to back off — much friendlier than a bare 429 with no guidance.",
        },
        {
          type: "exercise",
          title: "Raise the 429",
          prompt: [
            "Inside `enforce_limit`, when `count > MAX_REQUESTS`, raise `HTTPException` with `status_code=429` and `headers={\"Retry-After\": str(WINDOW_SECONDS)}`.",
          ],
          starter: String.raw`from fastapi import HTTPException

WINDOW_SECONDS = 60
MAX_REQUESTS = 30


def enforce_limit(count: int) -> None:
    if count > MAX_REQUESTS:
        # your code here
        pass`,
          solution: String.raw`from fastapi import HTTPException

WINDOW_SECONDS = 60
MAX_REQUESTS = 30


def enforce_limit(count: int) -> None:
    if count > MAX_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail="Too many requests",
            headers={"Retry-After": str(WINDOW_SECONDS)},
        )`,
          checks: [
            { re: /raise HTTPException\(/, hint: "Raise `HTTPException(...)` — FastAPI turns this straight into an HTTP error response." },
            { re: /status_code=429/, hint: "Set `status_code=429` — that's the \"too many requests\" status." },
            { re: /headers=\{"Retry-After":str\(WINDOW_SECONDS\)\}/, hint: "Pass `headers={\"Retry-After\": str(WINDOW_SECONDS)}` — tell the client how many seconds to wait before trying again." },
          ],
          success: "Now a client that blows through the limit gets a 429 with a Retry-After header telling it exactly when it's safe to come back.",
        },
        {
          type: "quiz",
          q: "Why does rate-limit state need to live in Redis instead of a plain Python dict inside the API process?",
          choices: [
            "A production API usually runs as multiple worker processes (and often multiple machines) — an in-process dict is invisible to every other worker, so a client could get a fresh limit just by having requests land on a different worker",
            "Python dicts can't store integers, only strings, so counting requests would fail",
            "Redis is required by FastAPI itself for any Depends-based dependency to function",
            "It doesn't matter — an in-process dict works identically to Redis for rate limiting",
          ],
          answer: 0,
          explain: "`uvicorn --workers 4` (or any multi-process/multi-machine deployment) means four separate Python processes, each with its own memory — a dict in one process's memory is invisible to the other three. Redis is shared, external storage every worker can reach, so the count is accurate no matter which worker happens to handle a given request. This is the same reason module 33's task queue used Redis as a broker instead of an in-process list.",
          nudge: "How many separate Python processes does a real deployment usually run — and does an in-memory dict get shared between them?",
        },
      ],
    },
  ],
});
