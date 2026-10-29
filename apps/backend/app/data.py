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

from sqlalchemy import update
from sqlmodel import Session, select

from .models_db import BookingTable, WalkerTable
from .schemas import Booking, CreateBookingRequest, Walker

PRICE_PER_30MIN_DEFAULT_CENTS = 3500


class BookingTransitionConflict(ValueError):
    """Raised when an authorized actor requests an invalid booking transition."""


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


def list_assigned_bookings(session: Session, walker_user_id: str) -> list[Booking]:
    rows = session.exec(
        select(BookingTable)
        .join(WalkerTable, BookingTable.walker_id == WalkerTable.id)
        .where(WalkerTable.user_id == walker_user_id)
    ).all()
    return [Booking.model_validate(row, from_attributes=True) for row in rows]


def get_booking(session: Session, booking_id: str, owner_id: str) -> Booking | None:
    """Scoped to owner_id on purpose — someone else's booking 404s, module 26."""
    row = session.get(BookingTable, booking_id)
    if row is None or row.owner_id != owner_id:
        return None
    return Booking.model_validate(row, from_attributes=True)


def transition_booking(
    session: Session,
    booking_id: str,
    actor_id: str,
    actor_role: str,
    allowed_statuses: tuple[str, ...],
    next_status: str,
    action: str,
) -> Booking | None:
    """Atomically transition a booking, returning None for non-owned resources.

    The conditional UPDATE is the concurrency guard: competing requests cannot
    both match the same previous status. ``get_booking`` deliberately remains
    owner-scoped for payment callers.
    """
    if actor_role == "owner":
        actor_filter = BookingTable.owner_id == actor_id
    elif actor_role == "walker":
        assigned_walker_ids = select(WalkerTable.id).where(WalkerTable.user_id == actor_id)
        actor_filter = BookingTable.walker_id.in_(assigned_walker_ids)
    else:
        return None

    result = session.exec(
        update(BookingTable)
        .where(
            BookingTable.id == booking_id,
            BookingTable.status.in_(allowed_statuses),
            actor_filter,
        )
        .values(status=next_status)
    )
    if result.rowcount == 1:
        session.commit()
        row = session.get(BookingTable, booking_id)
        return Booking.model_validate(row, from_attributes=True) if row else None

    session.rollback()
    row = session.get(BookingTable, booking_id)
    if row is None:
        return None
    if actor_role == "owner":
        authorized = row.owner_id == actor_id
    else:
        authorized = session.exec(
            select(WalkerTable.id).where(
                WalkerTable.id == row.walker_id,
                WalkerTable.user_id == actor_id,
            )
        ).first() is not None
    if not authorized:
        return None
    raise BookingTransitionConflict(
        f"Cannot {action} a booking with status '{row.status}'."
    )


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
