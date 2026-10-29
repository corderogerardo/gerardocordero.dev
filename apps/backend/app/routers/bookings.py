from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlmodel import Session

from .. import data
from ..db import get_session
from ..deps import get_current_owner, get_current_walker
from ..schemas import Booking, CreateBookingRequest, User

router = APIRouter(prefix="/bookings", tags=["bookings"])


# Specific literal paths declared BEFORE the {booking_id} wildcard — module
# 24 lesson 1: first match wins, so /bookings/stats can't be swallowed by
# {booking_id}.
@router.get("/stats")
def booking_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_owner),
) -> dict:
    bookings = data.list_bookings(session, current_user.id)
    return {"total": len(bookings)}


@router.get("/assigned", response_model=list[Booking])
def list_assigned_bookings(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_walker),
) -> list[Booking]:
    return data.list_assigned_bookings(session, current_user.id)


@router.get("", response_model=list[Booking])
def list_bookings(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_owner),
) -> list[Booking]:
    return data.list_bookings(session, current_user.id)


@router.post("", response_model=Booking, status_code=201)
def create_booking(
    req: CreateBookingRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_owner),
) -> Booking:
    try:
        return data.create_booking(session, current_user.id, req)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Walker not found") from exc


@router.get("/{booking_id}", response_model=Booking)
def get_booking(
    booking_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_owner),
) -> Booking:
    booking = data.get_booking(session, booking_id, current_user.id)
    if booking is None:
        # Someone else's booking 404s too — module 26: don't even confirm it exists.
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


def _apply_transition(
    booking_id: str,
    action: str,
    allowed_statuses: tuple[str, ...],
    next_status: str,
    session: Session,
    current_user: User,
) -> Booking | JSONResponse:
    try:
        booking = data.transition_booking(
            session,
            booking_id,
            current_user.id,
            current_user.role,
            allowed_statuses,
            next_status,
            action,
        )
    except data.BookingTransitionConflict as exc:
        return JSONResponse(
            status_code=409,
            content={"code": "transition_conflict", "detail": str(exc)},
        )
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.post("/{booking_id}/accept", response_model=Booking)
def accept_booking(
    booking_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_walker),
) -> Booking | JSONResponse:
    return _apply_transition(
        booking_id, "accept", ("pending",), "confirmed", session, current_user
    )


@router.post("/{booking_id}/decline", response_model=Booking)
def decline_booking(
    booking_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_walker),
) -> Booking | JSONResponse:
    return _apply_transition(
        booking_id, "decline", ("pending",), "cancelled", session, current_user
    )


@router.post("/{booking_id}/start", response_model=Booking)
def start_booking(
    booking_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_walker),
) -> Booking | JSONResponse:
    return _apply_transition(
        booking_id, "start", ("confirmed",), "in_progress", session, current_user
    )


@router.post("/{booking_id}/complete", response_model=Booking)
def complete_booking(
    booking_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_walker),
) -> Booking | JSONResponse:
    return _apply_transition(
        booking_id, "complete", ("in_progress",), "completed", session, current_user
    )


@router.post("/{booking_id}/cancel", response_model=Booking)
def cancel_booking(
    booking_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_owner),
) -> Booking | JSONResponse:
    return _apply_transition(
        booking_id, "cancel", ("pending", "confirmed"), "cancelled", session, current_user
    )
