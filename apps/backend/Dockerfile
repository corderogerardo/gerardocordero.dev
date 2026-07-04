# syntax=docker/dockerfile:1

# ---- builder: install deps from the lockfile, build the venv --------------
FROM python:3.12-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/app/.venv

WORKDIR /app

# Copy only the lock + project metadata first so this layer (the slow part)
# is cached until dependencies actually change, independent of app code edits.
COPY pyproject.toml uv.lock* ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# Now add the app source and install it (fast — no deps to resolve again).
COPY app ./app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# ---- runtime: slim image, no build tools, no root -------------------------
FROM python:3.12-slim AS runtime

RUN useradd --create-home --uid 1000 pawwalk
WORKDIR /app
# /app itself must be owned by the runtime user too, not just its contents —
# the default SQLite URL (sqlite:///./pawwalk.db) creates its file directly
# in the working directory on first request.
RUN chown pawwalk:pawwalk /app

COPY --from=builder --chown=pawwalk:pawwalk /app/.venv /app/.venv
COPY --chown=pawwalk:pawwalk app ./app
COPY --chown=pawwalk:pawwalk alembic ./alembic
COPY --chown=pawwalk:pawwalk alembic.ini ./

ENV PATH="/app/.venv/bin:$PATH"
USER pawwalk

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
