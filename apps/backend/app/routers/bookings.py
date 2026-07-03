from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from .. import data
from ..db import get_session
from ..deps import get_current_owner, get_current_user
from ..schemas import Booking, CreateBookingRequest, User

router = APIRouter(prefix="/bookings", tags=["bookings"])


# Specific literal paths declared BEFORE the {booking_id} wildcard — module
# 24 lesson 1: first match wins, so /bookings/stats can't be swallowed by
# {booking_id}.
@router.get("/stats")
def booking_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    bookings = data.list_bookings(session, current_user.id)
    return {"total": len(bookings)}


@router.get("/assigned", response_model=list[Booking])
def list_assigned_bookings(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> list[Booking]:
    # ponytail: no walker-assignment column modeled yet (lessons never show
    # one) — empty list keeps the route real without inventing schema.
    return []


@router.get("", response_model=list[Booking])
def list_bookings(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
) -> Booking:
    booking = data.get_booking(session, booking_id, current_user.id)
    if booking is None:
        # Someone else's booking 404s too — module 26: don't even confirm it exists.
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking
