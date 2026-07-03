"""DB engine + session dependency (Phase 1).

Replaces the in-memory store in `data.py` with a real database, without the
router or schema layers changing — `data.py` stays the seam.
"""
from __future__ import annotations

from collections.abc import Iterator

from alembic import command
from alembic.config import Config
from sqlmodel import Session, create_engine

from .config import settings

connect_args = (
    {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
)
engine = create_engine(settings.database_url, connect_args=connect_args)


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session


def run_migrations() -> None:
    """Runs `alembic upgrade head` against the configured database on every startup.

    See app/main.py's lifespan. Never delete the DB file to "reset" the
    schema (module 25 lesson 3) — this is why: the running app always
    expects migrations, not a fresh file, to bring the schema up to date.
    """
    cfg = Config(str(_alembic_ini_path()))
    cfg.set_main_option("sqlalchemy.url", settings.database_url)
    command.upgrade(cfg, "head")


def _alembic_ini_path():
    from pathlib import Path

    return Path(__file__).resolve().parent.parent / "alembic.ini"
