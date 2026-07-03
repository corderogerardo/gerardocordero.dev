"""Query helpers — the seam between routers and the database.

Not quoted verbatim by any lesson; the lessons quote call sites
(`data.list_walkers(session)`, `data.get_booking(session, id, owner_id)`,
`data.confirm_booking(session, booking_id)`, `data.find_walkers(session,
neighborhood)`) without ever showing this file's body. Filled in to match
every call site actually used across modules 24-31 — see README "Deviations
from the course".
"""
from __future__ import annotations

from uuid import uuid4

from sqlmodel import Session, select

from .models_db import BookingTable, WalkerTable
from .schemas import Booking, CreateBookingRequest, Walker

PRICE_PER_30MIN_DEFAULT_CENTS = 3500


def list_walkers(session: Session, min_rating: float = 0) -> list[Walker]:
    rows = session.exec(
        select(WalkerTable).where(WalkerTable.rating >= min_rating)
    ).all()
    return [Walker.model_validate(row, from_attributes=True) for row in rows]


def get_walker(session: Session, walker_id: str) -> Walker | None:
    row = session.get(WalkerTable, walker_id)
    return Walker.model_validate(row, from_attributes=True) if row else None


def find_walkers(session: Session, neighborhood: str | None) -> list[Walker]:
    """Used by the assistant graph's find_walkers node (module 29)."""
    if neighborhood is None:
        return list_walkers(session)
    rows = session.exec(select(WalkerTable)).all()
    matches = [r for r in rows if neighborhood in (r.neighborhoods or [])]
    return [Walker.model_validate(row, from_attributes=True) for row in matches]


def list_bookings(session: Session, owner_id: str) -> list[Booking]:
    rows = session.exec(
        select(BookingTable).where(BookingTable.owner_id == owner_id)
    ).all()
    return [Booking.model_validate(row, from_attributes=True) for row in rows]


def get_booking(session: Session, booking_id: str, owner_id: str) -> Booking | None:
    """Scoped to owner_id on purpose — someone else's booking 404s, module 26."""
    row = session.get(BookingTable, booking_id)
    if row is None or row.owner_id != owner_id:
        return None
    return Booking.model_validate(row, from_attributes=True)


def create_booking(session: Session, owner_id: str, req: CreateBookingRequest) -> Booking:
    walker = session.get(WalkerTable, req.walker_id)
    if walker is None:
        raise ValueError("walker not found")
    price_cents = round(walker.price_per_30min_cents * (req.duration_minutes / 30))
    row = BookingTable(
        id=f"bkg_{uuid4().hex[:12]}",
        owner_id=owner_id,
        walker_id=req.walker_id,
        dog_name=req.dog_name,
        start_time=req.start_time,
        duration_minutes=req.duration_minutes,
        notes=req.notes,
        status="pending",
        price_cents=price_cents,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    return Booking.model_validate(row, from_attributes=True)


def confirm_booking(session: Session, booking_id: str) -> None:
    """Called from the Stripe webhook (module 27) on payment_intent.succeeded."""
    row = session.get(BookingTable, booking_id)
    if row is not None:
        row.status = "confirmed"
        session.add(row)
        session.commit()
