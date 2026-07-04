window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "observability",
  title: "Observability",
  emoji: "🔭",
  lang: "python",
  lessons: [
    {
      id: "logs-metrics-traces",
      title: "Logs, metrics, traces",
      steps: [
        {
          type: "text",
          md: [
            "## The three pillars",
            "**Observability** means you can answer questions about a running system you didn't think to ask in advance — without shipping new code first. It rests on three kinds of data: **logs** (discrete events — \"this booking was created\"), **metrics** (numbers over time — requests per second, p99 latency), and **traces** (the path one request took across your system, service by service). Each answers a different question: logs tell you *what happened*, metrics tell you *how much/how often*, traces tell you *where the time went*.",
            "You've used `print()` for debugging since module 1. In production, `print` output is a wall of unstructured text — one line per statement, no shared shape. Once you have more than a handful of requests per minute, grepping that wall for the one line you need stops working.",
          ],
        },
        {
          type: "text",
          md: [
            "## Structured logs: key-value pairs, not sentences",
            "A **structured log** emits a log line as a set of key-value fields (often serialized as JSON) instead of a formatted sentence. Compare `\"Booking 42 created for walker 7\"` to `{event: \"booking_created\", booking_id: 42, walker_id: 7}`. The second one a log aggregator (Datadog, CloudWatch, Honeycomb) can **query and aggregate**: \"count booking_created events per walker_id, last 24 hours\" is one query against structured fields. Against a sentence, you're stuck writing regexes and hoping nobody changes the wording.",
            "The single most useful field to add is a **correlation id** (often called a request id): one value generated at the start of a request and attached to every log line produced while handling it. Search the logs for that one id and you get every step of that request's story — the query it ran, the external call it made, the error it hit — in order, even though real production traffic interleaves hundreds of requests' log lines together on the same stream.",
          ],
        },
        {
          type: "code",
          title: "A structured log call with structlog",
          source: String.raw`import structlog

logger = structlog.get_logger()

logger.info(
    "booking_created",
    booking_id=42,
    walker_id=7,
    price_cents=3500,
)
# emits (roughly):
# {"event": "booking_created", "booking_id": 42, "walker_id": 7,
#  "price_cents": 3500, "level": "info", "timestamp": "..."}`,
          caption: "`structlog` is the standard structured-logging library for Python — it wraps stdlib `logging` and adds key-value fields plus JSON output. The first argument is the event name (a short, stable string); everything else is a field.",
        },
        {
          type: "quiz",
          q: "Why do structured logs (key-value fields) beat plain string logs like print(f\"Booking {id} created\")?",
          choices: [
            "Structured fields can be queried and aggregated directly by a log platform (\"count booking_created by walker_id\"), instead of requiring fragile text parsing on a sentence whose wording might change",
            "Structured logs run faster than print statements at the CPU level",
            "Plain string logs cannot include numbers, only text",
            "Structured logs are only useful for errors, never for normal request events",
          ],
          answer: 0,
          explain: "The value isn't speed — it's queryability. A field like walker_id=7 is a first-class value a log platform can filter, group, and count on. A sentence is just text you'd have to pattern-match to extract the same information, and any wording change breaks the pattern.",
          nudge: "Think about what happens when you want to ask a question of your logs later, like \"how many bookings did walker 7 have last week\" — which format answers that directly?",
        },
      ],
    },
    {
      id: "request-scoped-logging",
      title: "Request-scoped logging in FastAPI",
      steps: [
        {
          type: "text",
          md: [
            "## One id, every log line in that request",
            "The goal: generate a request id when a request comes in, and have it show up automatically on every log line logged anywhere while handling that request — the route, a service function three calls deep, an error handler — without passing `request_id` as an argument through every single function signature.",
            "**`contextvars`** (stdlib, `contextlib`'s cousin for context-local state) is what makes this possible. A `ContextVar` holds a value that's local to the current async task — set it once near the top of a request, and any code running as part of that same request can read it back, with no threading of the value through function parameters. `structlog.contextvars` builds on this: `bind_contextvars(request_id=...)` stores the id, and as long as your logger config includes `structlog.contextvars.merge_contextvars` as a processor, every subsequent `logger.info(...)` call in that context automatically includes it.",
          ],
        },
        {
          type: "text",
          md: [
            "## Log at boundaries",
            "You don't need a log line for every function call — that's noise, not signal. Log at **boundaries**: when a request starts and ends (with status code and duration), when an error occurs, when you cross into another system (a database call, an external API). Those are the moments worth being able to find later.",
            "A middleware is the natural home for the start/end boundary logs, since it wraps every request regardless of which route handled it. `clear_contextvars()` at the top of the middleware resets any stale context left over between requests on the same worker; `bind_contextvars()` right after sets the fresh request id.",
          ],
        },
        {
          type: "code",
          title: "app/middleware.py — request id middleware",
          source: String.raw`import time
import uuid

import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = structlog.get_logger()


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)

        start = time.monotonic()
        logger.info("request_started", path=request.url.path)
        response = await call_next(request)
        duration_ms = (time.monotonic() - start) * 1000

        logger.info(
            "request_finished",
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=round(duration_ms, 1),
        )
        response.headers["X-Request-ID"] = request_id
        return response`,
          caption: "Every `logger.info` call inside `dispatch`, and inside any route or service function this request goes on to call, now carries `request_id` automatically — `bind_contextvars` stores it once, `merge_contextvars` in the logger config attaches it to every subsequent line.",
        },
        {
          type: "exercise",
          title: "Generate and bind a request id",
          prompt: [
            "Inside `dispatch`, write an `async def dispatch(self, request, call_next):` middleware method. Generate a request id with `uuid.uuid4()` and assign it to a variable `request_id` (as a string, since headers and log fields both want strings, not UUID objects).",
          ],
          starter: String.raw`import uuid

from starlette.middleware.base import BaseHTTPMiddleware


class RequestIdMiddleware(BaseHTTPMiddleware):
    # your code here
    pass`,
          solution: String.raw`import uuid

from starlette.middleware.base import BaseHTTPMiddleware


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request_id = str(uuid.uuid4())
        return await call_next(request)`,
          checks: [
            { re: /async def dispatch\(self,request,call_next\):/, hint: "Define `async def dispatch(self, request, call_next):` — this is the method Starlette's `BaseHTTPMiddleware` calls per request." },
            { re: /request_id=str\(uuid\.uuid4\(\)\)/, hint: "Assign `request_id = str(uuid.uuid4())` — a fresh random id, converted to a string." },
            { re: /return await call_next\(request\)/, hint: "The middleware must still call and return `await call_next(request)` to let the request continue to the route." },
          ],
          success: "That request_id is now ready to bind into the logging context so every log line in this request carries it.",
        },
        {
          type: "quiz",
          q: "A production API handles 200 requests per second, all logging to the same stream. What does attaching one request id to every log line for a given request actually buy you?",
          choices: [
            "You can search the logs for that one id and get every log line from that specific request, in order — even though hundreds of other requests' lines are interleaved on the same stream",
            "It makes each individual log line print faster",
            "It replaces the need for log levels like INFO and ERROR",
            "It automatically fixes bugs found in the logs",
          ],
          answer: 0,
          explain: "Without a shared id, one request's five log lines are scattered among a thousand other lines from concurrent requests, with no way to tell which lines belong together. The id is the join key that reconstructs one request's whole story from an interleaved stream.",
          nudge: "Picture the raw log stream with 200 requests/second all writing to it at once — how do you pull out just the lines for the one request you care about?",
        },
      ],
    },
    {
      id: "distributed-tracing-otel",
      title: "Distributed tracing with OpenTelemetry",
      steps: [
        {
          type: "text",
          md: [
            "## A trace is a tree of spans",
            "A **trace** represents one request's full journey, possibly across several services. It's made of **spans** — each span is one unit of work (an HTTP request, a database query, a function call) with a start time, a duration, and a parent. A span with no parent is the **root span**; every other span in the trace points to a parent, so the whole trace forms a tree. Looking at that tree tells you exactly where the time in a slow request went: was it the database, an external API call, or your own code?",
            "**OpenTelemetry** (often shortened to OTel) is the vendor-neutral standard for producing this data — the same instrumentation works whether you export to Jaeger, Grafana Tempo, Honeycomb, or Datadog, because OTel defines the data format and the export protocol (**OTLP**), not the backend.",
          ],
        },
        {
          type: "text",
          md: [
            "## Auto-instrumentation, then manual spans where you need detail",
            "For the common cases, you don't write span code by hand: `opentelemetry-instrumentation-fastapi` wraps every route so each incoming request becomes a span automatically, and companion packages do the same for SQLAlchemy (each query becomes a span) and `httpx` (each outbound HTTP call becomes a span). Wire those up once at startup and most of a request's trace is already populated.",
            "A **manual span** covers the gap: a chunk of work auto-instrumentation doesn't know about, like a pricing calculation or an image resize. `tracer.start_as_current_span(\"name\")` used as a context manager (a `with` block) opens a span, makes it the active span for anything called inside the block (so a DB query inside that block automatically becomes its child), and closes it — recording its duration — when the block exits.",
          ],
        },
        {
          type: "code",
          title: "app/main.py — auto-instrumentation + a manual span",
          source: String.raw`from fastapi import FastAPI
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

app = FastAPI()
FastAPIInstrumentor.instrument_app(app)

tracer = trace.get_tracer("pawwalk.pricing")


def compute_walk_price(distance_km: float, duration_min: int) -> int:
    with tracer.start_as_current_span("compute_walk_price") as span:
        span.set_attribute("distance_km", distance_km)
        price_cents = int(distance_km * 150 + duration_min * 40)
        span.set_attribute("price_cents", price_cents)
        return price_cents`,
          caption: "`FastAPIInstrumentor.instrument_app(app)` gives every route its own span for free. `compute_walk_price` gets its own manual span nested under whichever route called it, with a couple of attributes attached for context when you're staring at the trace later.",
        },
        {
          type: "exercise",
          title: "Wrap a GPS-distance calculation in a span",
          prompt: [
            "Inside `calculate_walk_distance`, open a manual span named `\"calculate_walk_distance\"` using `tracer.start_as_current_span(...)` in a `with` statement, then `return` the existing `distance_km` computation from inside that block.",
          ],
          starter: String.raw`from opentelemetry import trace

tracer = trace.get_tracer("pawwalk.gps")


def calculate_walk_distance(gps_points: list[tuple[float, float]]) -> float:
    distance_km = sum_haversine(gps_points)
    # your code here`,
          solution: String.raw`from opentelemetry import trace

tracer = trace.get_tracer("pawwalk.gps")


def calculate_walk_distance(gps_points: list[tuple[float, float]]) -> float:
    distance_km = sum_haversine(gps_points)
    with tracer.start_as_current_span("calculate_walk_distance"):
        return distance_km`,
          checks: [
            { re: /with tracer\.start_as_current_span\("calculate_walk_distance"\):/, hint: "Open the span with `with tracer.start_as_current_span(\"calculate_walk_distance\"):` — name the span after the function it covers." },
            { re: /"calculate_walk_distance"\):return distance_km/, hint: "The `return distance_km` must be the statement INSIDE the `with` block, not after it — otherwise the span closes before you've captured the work it's meant to cover." },
          ],
          success: "The span now wraps the return, so its recorded duration actually covers the calculation it's named after — and it nests as a child under whatever request span called this function.",
        },
        {
          type: "quiz",
          q: "What does a single span represent in a trace?",
          choices: [
            "One unit of work with a start time and a duration — a request, a database query, or a function call — that's a node in the trace's tree, pointing to a parent span",
            "An entire trace from start to finish, across every service involved",
            "A single log line with no timing information",
            "A metric like requests-per-second sampled once a minute",
          ],
          answer: 0,
          explain: "A span is the unit; a trace is the whole tree of spans for one request. Confusing the two makes trace-reading confusing — you look at a trace's waterfall view span by span, each one showing how long that specific piece of work took and what it was nested under.",
          nudge: "Is a span the whole request's story, or one timed piece of it?",
        },
      ],
    },
    {
      id: "errors-health-alerting",
      title: "Errors, health & alerting",
      steps: [
        {
          type: "text",
          md: [
            "## Don't let exceptions die quietly in a log line",
            "An uncaught exception logged as one text line is easy to lose — it scrolls past, and nobody sees it until a user complains. **Sentry** (and similar error-tracking tools) captures each exception as its own event: the full stack trace, the request that triggered it, any breadcrumbs (recent log lines / actions) leading up to it, and groups repeats of the same error together so you see \"this crash happened 400 times today\" instead of 400 separate log lines to sift through.",
            "`sentry_sdk.init(dsn=..., traces_sample_rate=...)` once at startup is most of the setup — the FastAPI/Starlette integration activates automatically once `sentry-sdk` sees FastAPI installed, capturing unhandled exceptions without you writing a try/except around every route. `traces_sample_rate` controls what fraction of requests also get performance tracing data sent to Sentry (1.0 = 100%, expensive at scale; a small fraction like 0.1 is typical in production).",
          ],
        },
        {
          type: "text",
          md: [
            "## Liveness vs readiness",
            "Kubernetes (and similar orchestrators) poll two different endpoints for two different questions. **Liveness** (`/health`) asks \"is this process alive, or should it be killed and restarted?\" — it should do the absolute minimum: return 200 if the process can respond at all. **Readiness** (`/ready`) asks \"can this instance currently handle real traffic?\" — it's allowed to check dependencies (database reachable? cache reachable?) and return a non-200 to say \"don't route traffic to me yet/right now\" without killing the process.",
            "Mixing these up causes real outages: if `/health` (liveness) checks the database and the database has a blip, Kubernetes kills and restarts every instance of your app — even though the process itself was fine and restarting does nothing to fix a down database. That's why liveness stays trivial and readiness carries the dependency checks.",
          ],
        },
        {
          type: "text",
          md: [
            "## Alert on symptoms, not every error",
            "An alert that fires on every single exception trains everyone to ignore alerts — a single blip that self-resolves shouldn't page anyone at 3am. Alert on **symptoms** users actually feel: error **rate** crossing a threshold (say, more than 5% of requests failing over 5 minutes), or **p99 latency** (the slowest 1% of requests) crossing a threshold. Those catch real, ongoing problems while staying quiet through the occasional one-off error that's already been retried successfully.",
          ],
        },
        {
          type: "code",
          title: "app/main.py — Sentry init + a health endpoint",
          source: String.raw`import sentry_sdk
from fastapi import FastAPI

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    traces_sample_rate=0.1,
    environment="production",
)

app = FastAPI()


@app.get("/health")
def liveness():
    return {"status": "ok"}


@app.get("/ready")
async def readiness(db_ok: bool = True):
    if not db_ok:
        return {"status": "not ready"}, 503
    return {"status": "ok"}`,
          caption: "`/health` never touches the database — it's a liveness check, cheap and always fast. `/ready` is where a real dependency check (database ping, cache ping) would go; a 503 there tells the load balancer to hold off routing traffic, without triggering a restart.",
        },
        {
          type: "exercise",
          title: "Add a liveness health route",
          prompt: [
            "Write a `GET /health` route (an `async def` function decorated with `@app.get(\"/health\")`) that returns a dict with a `\"status\"` key set to `\"ok\"` — no dependency checks, just proof the process is alive.",
          ],
          starter: String.raw`from fastapi import FastAPI

app = FastAPI()

# your code here`,
          solution: String.raw`from fastapi import FastAPI

app = FastAPI()


@app.get("/health")
async def health():
    return {"status": "ok"}`,
          checks: [
            { re: /@app\.get\("\/health"\)/, hint: "Decorate the route with `@app.get(\"/health\")`." },
            { re: /async def health\(\):/, hint: "Define an `async def` route function — name it whatever reads clearly, like `health`." },
            { re: /return\{"status":"ok"\}/, hint: "Return a dict with a `\"status\"` key, e.g. `{\"status\": \"ok\"}`." },
          ],
          success: "That's a liveness probe: no dependency checks, just confirmation the process can respond — exactly what Kubernetes should poll to decide whether to restart the container.",
        },
        {
          type: "quiz",
          q: "Why does mixing up liveness and readiness cause outages?",
          choices: [
            "If a liveness check (/health) tests dependencies like the database and that dependency has a temporary blip, the orchestrator kills and restarts every healthy instance — restarting does nothing to fix a down database, and now there's also downtime from the restarts",
            "There's no real difference between the two checks — they're interchangeable in every orchestrator",
            "Readiness checks are only used in local development, never in production",
            "Liveness checks are supposed to be slow, so they always cause timeouts",
          ],
          answer: 0,
          explain: "Liveness answers \"should this process be restarted\" — it must stay trivial, or a shared dependency's blip triggers restarts across every instance simultaneously, which is its own outage on top of the original problem. Readiness is where dependency checks belong, because failing it just pauses traffic to that instance rather than killing it.",
          nudge: "If /health checks the database and the database blips for 10 seconds, what does the orchestrator do to every instance of your app — and does restarting them fix the database?",
        },
      ],
    },
  ],
});
