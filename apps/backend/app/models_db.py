"""SQLModel table definitions (Phase 1 — DB-backed storage).

Mirrors the field shapes in `schemas.py`. These are the storage layer; the
Pydantic models in `schemas.py` stay the request/response shapes and are
never returned directly from a route.
"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel

# ponytail: Role/Duration/BookingStatus are `Literal[...]` in schemas.py (the
# API shape's job is enforcing the closed set) — SQLModel/SQLAlchemy can't
# derive a column type from a bare Literal, so table columns below use the
# plain `str`/`int` the Literal narrows. Same DB-shape-vs-API-shape split
# module 25 lesson 1 already teaches, just extended to these three fields.


class UserTable(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    password_hash: str
    role: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class WalkerTable(SQLModel, table=True):
    __tablename__ = "walkers"

    id: str = Field(primary_key=True)
    name: str
    photo_url: str | None = None
    rating: float
    price_per_30min_cents: int
    bio: str = ""
    neighborhoods: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    user_id: str | None = Field(default=None, foreign_key="users.id")


class PetTable(SQLModel, table=True):
    __tablename__ = "pets"

    id: str = Field(primary_key=True)
    owner_id: str = Field(foreign_key="users.id")
    name: str
    breed: str | None = None
    notes: str | None = None


class BookingTable(SQLModel, table=True):
    __tablename__ = "bookings"

    id: str = Field(primary_key=True)
    owner_id: str = Field(foreign_key="users.id")
    walker_id: str = Field(foreign_key="walkers.id")
    dog_name: str
    start_time: datetime
    duration_minutes: int
    notes: str | None = None
    status: str = "pending"
    price_cents: int


class WaitlistTable(SQLModel, table=True):
    __tablename__ = "waitlist"

    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
