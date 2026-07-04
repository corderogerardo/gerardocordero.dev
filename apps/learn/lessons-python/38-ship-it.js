// Module 38 — Ship It & Graduation (Senior tier finale). See ../lessons/FORMAT.md
// and ./FORMAT-PYTHON.md for the schema.
window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "ship-it",
  title: "Ship It & Graduation",
  emoji: "🚢",
  lang: "python",
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    {
      id: "containerize-with-docker",
      title: "Containerize with Docker",
      steps: [
        {
          type: "text",
          md: [
            "## Same code, same result, anywhere",
            "\"It works on my machine\" is a real failure mode: your laptop has Python 3.12, a `.venv` full of exact package versions, and an OS that happens to have the right system libraries. The server that runs your app in production has none of that guaranteed. A **container** is a bundle of the app *plus* everything it needs to run — the Python interpreter, the exact dependency versions, the OS libraries — packaged so it behaves identically on your laptop, in CI, and in production.",
            "**Docker** is the tool that builds and runs containers from a recipe called a `Dockerfile`. PawWalk's backend (the FastAPI app you've been building since module 23) is about to get one.",
          ],
        },
        {
          type: "text",
          md: [
            "## Multi-stage: a build stage, then a slim stage",
            "A naive Dockerfile installs a compiler, build tools, and every dependency into one image — and ships all of that to production, even though production never needs a compiler. A **multi-stage** Dockerfile fixes this: an early stage (`FROM ... AS builder`) has the tools to install dependencies and build the app; the *final* stage starts fresh from a slim base image and copies over only what's needed to run — no build tools, a much smaller image, a smaller attack surface.",
            "Each `FROM ... AS <name>` line starts a new stage. `COPY --from=<name>` pulls files from an earlier stage into the current one. Only the *last* stage in the file becomes the image Docker actually ships.",
          ],
        },
        {
          type: "code",
          title: "apps/backend/Dockerfile",
          source: String.raw`# ---- builder: install deps, build the venv --------------------------
FROM python:3.12-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app
COPY pyproject.toml uv.lock* ./
RUN uv sync --frozen --no-install-project --no-dev
COPY app ./app
RUN uv sync --frozen --no-dev

# ---- runtime: slim image, no build tools, no root --------------------
FROM python:3.12-slim AS runtime

RUN useradd --create-home --uid 1000 pawwalk
WORKDIR /app
RUN chown pawwalk:pawwalk /app

COPY --from=builder --chown=pawwalk:pawwalk /app/.venv /app/.venv
COPY --chown=pawwalk:pawwalk app ./app

ENV PATH="/app/.venv/bin:$PATH"
USER pawwalk

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`,
          caption: "Two `FROM` lines, two stages. `builder` has `uv` and does the slow work (resolving and installing packages). `runtime` starts over from a clean `python:3.12-slim` and copies in only the finished virtual environment (`/app/.venv`) and the app code — no `uv` binary, no build cache, none of it ships. `USER pawwalk` (not root) and `chown`ing `/app` so that non-root user can actually write its SQLite file are both real production concerns, not decoration.",
        },
        {
          type: "text",
          md: [
            "## `.dockerignore`: keep the build context small and safe",
            "Every file in the project directory gets sent to the Docker daemon as the **build context**, even files no `COPY` line touches — unless you exclude them. `.dockerignore` works like `.gitignore`: list what to skip. Skip `.venv/` (huge, and wrong-platform anyway), `tests/` (production doesn't need them), `.env` (never let secrets ride along in an image layer), and `.git/` (history you don't need at runtime).",
          ],
        },
        {
          type: "exercise",
          title: "Start the final stage",
          prompt: [
            "Write the line that starts the **final** stage of a multi-stage Dockerfile: a fresh `python:3.12-slim` base, named `runtime`.",
            "One line: `FROM`, the base image, `AS`, the stage name.",
          ],
          starter: String.raw`# ---- builder stage above this line, already written ----

# your code here`,
          solution: String.raw`FROM python:3.12-slim AS runtime`,
          checks: [
            { re: /^FROM/, hint: "Start a new stage with `FROM` — every stage in a multi-stage Dockerfile begins with its own `FROM`." },
            { re: /python:3\.12-slim/, hint: "Use the slim base image: `python:3.12-slim` — no build tools, small footprint." },
            { re: /AS runtime/, hint: "Name this stage with `AS runtime` — that's how the runtime stage gets referenced (and how you tell it apart from `builder`)." },
          ],
          mustNot: [
            { re: /AS builder/, hint: "This is the FINAL stage, not the builder — name it `runtime` (or anything but `builder`, which is already taken)." },
          ],
          success: "That's the whole trick: start clean, copy in only the finished artifacts. The build stage's compiler and package cache never make it here.",
        },
        {
          type: "quiz",
          q: "Why use a multi-stage Dockerfile instead of installing everything in one stage?",
          choices: [
            "The final image ships only the runtime artifacts (the built venv, the app code) — build tools, caches, and intermediate files from the builder stage never reach production, keeping the image smaller and reducing attack surface",
            "Multi-stage builds run the app faster at request time",
            "Docker requires at least two `FROM` lines to run any container",
            "It lets you skip writing a `.dockerignore` file",
          ],
          answer: 0,
          explain: "A single-stage build ships everything used to build the app, including compilers and package caches, even though production only needs the finished result. Multi-stage separates \"what it takes to build this\" from \"what it takes to run this\" — the final `FROM` starts clean and `COPY --from=builder` cherry-picks only the finished venv and app code.",
          nudge: "Think about what a compiler or a package-manager cache is doing sitting inside your production container, when nothing at runtime ever calls it.",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "reproducible-installs-with-uv",
      title: "Reproducible installs with uv",
      steps: [
        {
          type: "text",
          md: [
            "## A lockfile pins every version, exactly",
            "`pyproject.toml` says PawWalk's backend needs `fastapi>=0.115` — a *range*. That's fine for a human reading it, but terrible for a build: two builds a week apart could resolve to two different `fastapi` patch versions, and now \"it works on my machine\" is back. `uv` — the same tool the course has used since module 13 (`uv sync`, `uv run`) — solves this with a **lockfile**, `uv.lock`: every dependency (and every dependency *of* a dependency) pinned to one exact version, generated once by `uv lock` and committed to the repo.",
            "`uv sync --frozen` installs *exactly* what's in `uv.lock` — it refuses to re-resolve versions, so a build today and a build next month install byte-identical dependencies. That's what \"reproducible\" means: not \"probably the same,\" but guaranteed the same.",
          ],
        },
        {
          type: "text",
          md: [
            "## Layer caching: copy the lock before the app",
            "Docker builds a stack of layers and reuses cached ones if the inputs didn't change. Dependency installs are the *slow* step; app code changes on every commit. So the Dockerfile copies `pyproject.toml` and `uv.lock` first and runs `uv sync` **before** copying `app/` — as long as the lockfile doesn't change, Docker reuses the cached dependency layer even though you just edited a route file, and the rebuild takes seconds instead of minutes.",
          ],
        },
        {
          type: "code",
          title: "apps/backend/Dockerfile (the uv sync lines)",
          source: String.raw`COPY pyproject.toml uv.lock* ./
RUN uv sync --frozen --no-install-project --no-dev

COPY app ./app
RUN uv sync --frozen --no-dev`,
          caption: "The first `uv sync --frozen --no-install-project --no-dev` installs only third-party dependencies — `--no-install-project` skips installing the app itself, since `app/` hasn't even been copied in yet. That's the layer Docker caches. The second `uv sync` (after `COPY app ./app`) installs the app package itself — fast, since every dependency is already there. `--no-dev` skips `pytest`/`httpx` — production doesn't need the test tools.",
        },
        {
          type: "exercise",
          title: "Install dependencies from the lockfile",
          prompt: [
            "Write the Docker `RUN` line that installs dependencies via `uv`, using the lockfile exactly as pinned (no re-resolving), skipping dev-only dependencies.",
          ],
          starter: String.raw`COPY pyproject.toml uv.lock* ./
# your code here`,
          solution: String.raw`RUN uv sync --frozen --no-dev`,
          checks: [
            { re: /RUN uv sync/, hint: "It's a Docker `RUN` line calling `uv sync` — the command that installs from the lockfile." },
            { re: /--frozen/, hint: "Add `--frozen` — this is what refuses to re-resolve versions and guarantees you get exactly what's in `uv.lock`." },
            { re: /--no-dev/, hint: "Add `--no-dev` — skip `pytest`/`httpx` and any other dev-only dependency; production doesn't need them." },
          ],
          mustNot: [
            { re: /uv lock(?!file)/, hint: "That's `uv lock` (which GENERATES the lockfile) — you want `uv sync` (which INSTALLS from an existing one)." },
          ],
          success: "`--frozen` is the whole point: same `uv.lock`, same exact versions, every single time, on your machine or in CI.",
        },
        {
          type: "quiz",
          q: "Why does `uv sync --frozen` matter for reproducible builds, compared to just running `uv sync`?",
          choices: [
            "`--frozen` refuses to re-resolve dependency versions and installs exactly what's pinned in `uv.lock` — without it, `uv sync` could resolve a newer version that satisfies `pyproject.toml`'s range and silently change what gets installed",
            "`--frozen` makes the Docker build run in a sandboxed network with no internet access at all",
            "`--frozen` is required for `uv` to work inside a container — plain `uv sync` doesn't run in Docker",
            "`--frozen` skips installing the app's own dependencies entirely",
          ],
          answer: 0,
          explain: "`pyproject.toml` declares a range (`fastapi>=0.115`); `uv.lock` pins one exact version chosen from that range. Plain `uv sync` would still respect the lockfile if present, but `--frozen` makes that a hard guarantee — it errors instead of silently updating the lock if `pyproject.toml` and `uv.lock` have drifted apart. That's the difference between \"probably reproducible\" and \"guaranteed reproducible.\"",
          nudge: "What's the difference between a version RANGE in `pyproject.toml` and an exact pin in `uv.lock` — and what could go wrong if a build ignored the lock?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "ci-and-load-testing",
      title: "CI & load testing",
      steps: [
        {
          type: "text",
          md: [
            "## CI: the loop runs on every push, not just your laptop",
            "You've run `pytest` locally since module 27. A **CI (continuous integration)** pipeline runs the same checks automatically on every push — lint, type-check, `pytest`, and now, build the Docker image — so a regression is caught before it merges, not after a teammate pulls `main` and something's broken. PawWalk's own portfolio monorepo does exactly this: `.github/workflows/ci.yml` runs the loop (`typecheck`, `lint`, `test`) on every push and PR.",
            "Adding \"build the Docker image\" as a CI step catches a whole category of bug that `pytest` alone can't: a `Dockerfile` typo, a missing file in `COPY`, a dependency that resolves locally but not in the container's base image.",
          ],
        },
        {
          type: "text",
          md: [
            "## Load testing: how many walkers can hit `/walkers` at once?",
            "Passing tests prove the code is *correct*. They say nothing about whether the server survives 500 owners checking availability at the same moment on a Saturday morning. **Load testing** answers that: simulate many concurrent users hitting the API and watch where it slows down or falls over. **Locust** is a Python load-testing tool — you write real Python classes that describe simulated user behavior, and it spins up thousands of them.",
            "A Locust file defines an `HttpUser` subclass; each method decorated `@task` is one action a simulated user might take, calling `self.client.get(...)` / `.post(...)` the same way `httpx`'s `TestClient` does in your `pytest` suite.",
          ],
        },
        {
          type: "code",
          title: "apps/backend/loadtest/locustfile.py",
          source: String.raw`from locust import HttpUser, task, between


class PawWalkUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def list_walkers(self):
        self.client.get("/walkers")

    @task(3)
    def view_root(self):
        self.client.get("/")`,
          caption: "`wait_time = between(1, 3)` makes each simulated user pause 1-3 seconds between actions, like a real person. `@task(3)` gives `view_root` 3x the weight of the plain `@task` on `list_walkers` — Locust picks tasks randomly, weighted like this. Run it with `locust -f locustfile.py --host http://localhost:8000` and open the web UI to set concurrent user count and watch requests/sec and latency live.",
        },
        {
          type: "text",
          md: [
            "## Reading p50 / p95 / p99 — the tail is where users live",
            "Locust (and most load/monitoring tools) report latency as **percentiles**, not just an average. **p50** (median) is the typical request. **p95** is the latency 95% of requests beat — 1 in 20 is slower than this. **p99** is the slow tail: 1 in 100 requests. An average can look great (`120ms`) while p99 is terrible (`4s`) — a handful of slow requests get smoothed away by thousands of fast ones. Real users don't experience the average; some fraction of them *always* land in the tail, and p99 is what tells you how bad their day is.",
          ],
        },
        {
          type: "exercise",
          title: "Define a load-test task",
          prompt: [
            "Add a task to `PawWalkUser` (an `HttpUser` subclass). It should be decorated `@task` and, when run, `GET /walkers` through the Locust HTTP client.",
          ],
          starter: String.raw`class PawWalkUser(HttpUser):
    # your code here`,
          solution: String.raw`class PawWalkUser(HttpUser):
    @task
    def list_walkers(self):
        self.client.get("/walkers")`,
          checks: [
            { re: /@task def list_walkers\(self\):/, hint: "Decorate the method with `@task` directly above `def list_walkers(self):` — that's what tells Locust this method is a simulated user action." },
            { re: /@task def list_walkers\(self\):self\.client\.get\("\/walkers"\)/, hint: "The `self.client.get(\"/walkers\")` call has to be the BODY of `list_walkers` itself, right after its `def` line — not sitting somewhere else in the file." },
          ],
          success: "That's a load-test task: Locust will spin up many simulated `PawWalkUser`s, each calling this at random intervals, so you can watch `/walkers`'s p50/p95/p99 under real concurrent load.",
        },
        {
          type: "quiz",
          q: "Your load test shows p50 latency of 80ms — fast! But you keep getting complaints from real users about slow page loads. What does p50 hide that p99 would reveal?",
          choices: [
            "p50 is the median — half of all requests are faster and half slower, but it says nothing about how bad the SLOWEST requests get; p99 shows the tail latency that some fraction of real users always experience",
            "p50 and p99 always report the exact same number under load",
            "p50 measures requests per second, not latency at all",
            "p99 is only relevant for database queries, never for HTTP endpoints",
          ],
          answer: 0,
          explain: "p50 tells you about the *typical* request — most users, most of the time. But 1% of requests (p99) can be dramatically slower — a cold cache, a slow query, a GC pause — and at any real scale, that 1% is still a lot of actual people having a bad experience every single day. Averages and medians hide exactly the outliers that load testing exists to surface.",
          nudge: "If p50 is 80ms, could p99 still be seconds? What would have to be true for that gap to exist?",
        },
      ],
    },
    // ────────────────────────────────────────────────────────────────────
    {
      id: "ship-it-graduation",
      title: "Ship it & graduation",
      steps: [
        {
          type: "text",
          md: [
            "## From `print(\"hello\")` to a containerized, tested, observable backend",
            "Module 14 started with `print(\"hello\")`. Since then, across 25 modules, you built: the language itself — types, collections, classes, exceptions (14-17); three frameworks in deliberate order — Flask by hand, Django batteries-included, FastAPI typed-and-modern (18-27); a real database with Alembic migrations, JWT auth, and Stripe payments, all under `pytest` (25-27); an AI assistant — LangGraph agent, RAG from scratch, wired into the real backend and hardened with evals, guardrails, and streaming (28-31, 37); and, in the senior tier, everything that turns \"it works on my laptop\" into \"it survives production\" — async correctness, background job queues, caching and rate limiting, indexed Postgres at scale, structured observability, and now, today, a multi-stage Docker image built from a locked, reproducible dependency set, with a load test to know its limits (32-38).",
            "None of module 38 introduced a genuinely new *idea*. A multi-stage Dockerfile is just \"do the slow part in one place, ship only the result.\" A lockfile is just \"pin every version, once.\" A load test is just \"call the API a lot, on purpose, and read the numbers.\" That's the whole arc of this course: complexity you'd have found intimidating in module 14 is now just a combination of things you already know.",
          ],
        },
        {
          type: "code",
          title: "Building and running the real image",
          source: String.raw`cd apps/backend
docker build -t pawwalk-backend .
docker run -p 8000:8000 -e PAWWALK_JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))") pawwalk-backend
# http://localhost:8000/docs

# Local dev with Postgres instead of SQLite:
PAWWALK_JWT_SECRET=... docker compose up`,
          caption: "That's the whole deploy story for a small service: one image, one run command. `docker-compose.yml` adds a Postgres service for local dev so you're testing against the same database engine (module 35's `EXPLAIN ANALYZE` work) that a real deployment (`docs/DEPLOY.md`'s `PAWWALK_DATABASE_URL`) would use.",
        },
        {
          type: "text",
          md: [
            "## Where this goes next",
            "A container is the unit every deployment target runs: a **PaaS** (Fly.io, Render, Railway) takes your image and handles the rest — load balancing, TLS, restarts — for a single service at moderate scale. **Kubernetes** is what teams reach for once they have *many* services, need fine-grained autoscaling, or want the same orchestration across a large fleet — it's real complexity, worth deferring until you actually feel the pain a PaaS doesn't solve. Either way, the image you just built is the same artifact both worlds run.",
          ],
        },
        {
          type: "quiz",
          q: "Final quiz. Put the pieces of 'ship it' in the order this module built them.",
          choices: [
            "Multi-stage Dockerfile (slim runtime image) → uv.lock for reproducible installs → CI runs the build on every push → Locust load test reads p50/p95/p99 to find the breaking point",
            "Load test first, then write the app, then containerize, then delete the tests",
            "Kubernetes first, Docker never",
            "A single-stage Dockerfile with no lockfile, then hope",
          ],
          answer: 0,
          explain: "Containerize first (so there's an artifact to ship at all) → make it reproducible with a lockfile (so every build is identical) → wire it into CI (so every push is checked automatically) → load test it (so you know its limits before real traffic finds them for you). Each step depends on the one before it.",
          nudge: "You can't load-test an image that doesn't build reproducibly, and you can't have CI build something that isn't containerized yet. What has to exist before what?",
        },
        {
          type: "quiz",
          q: "Graduate's send-off: 38 modules, one dog-walking backend. What's true about it now that wasn't true at module 14?",
          choices: [
            "It's typed, tested, database-backed, authenticated, payment-processing, AI-assisted, observable, and now ships as a reproducible container with a known load limit — a real production backend, not a script",
            "It's exactly the same as module 14's `print(\"hello\")`, just longer",
            "It no longer runs in Python",
            "It can only ever run on one specific laptop",
          ],
          answer: 0,
          explain: "Every module added one real capability, and none of them were thrown away: FastAPI's typed contract, SQLModel + Alembic's real database, JWT auth, Stripe payments, an AI assistant with evals and guardrails, structured logs and traces, and — as of today — a container that runs identically anywhere and a load test that tells you where it breaks. That's what \"production-ready\" means, built one honest module at a time. Congratulations, graduate. 🎓🐾",
          nudge: "Count the capabilities: auth, a database, payments, an AI assistant, observability, and now packaging. What does all of that add up to?",
        },
      ],
    },
  ],
});
