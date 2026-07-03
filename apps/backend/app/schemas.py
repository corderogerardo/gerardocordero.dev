"""Pydantic request/response models — the API shape.

Deliberately separate from `models_db.py` (the DB shape). See module 25
lesson 1 in the Python course: same fields sometimes, but the API model
adds validation and hides internal-only columns (password_hash, foreign
keys) that a client should never see.
"""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

Role = Literal["owner", "walker"]
Duration = Literal[30, 45, 60]
BookingStatus = Literal["pending", "confirmed", "in_progress", "completed", "cancelled"]


# ── Auth ─────────────────────────────────────────────────────────────────


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str
    role: Role = "owner"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class User(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: Role


class AuthResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    user: User


# ── Walkers ──────────────────────────────────────────────────────────────


class Walker(BaseModel):
    id: str
    name: str
    photo_url: str | None = None
    rating: float = Field(ge=0, le=5)
    price_per_30min_cents: int
    bio: str = ""
    neighborhoods: list[str] = []


class WalkerProfileUpdate(BaseModel):
    bio: str | None = None
    neighborhoods: list[str] | None = None
    price_per_30min_cents: int | None = None


# ── Pets ─────────────────────────────────────────────────────────────────


class Pet(BaseModel):
    id: str
    owner_id: str
    name: str
    breed: str | None = None
    notes: str | None = None


class CreatePetRequest(BaseModel):
    name: str
    breed: str | None = None
    notes: str | None = None


# ── Bookings ─────────────────────────────────────────────────────────────


class CreateBookingRequest(BaseModel):
    walker_id: str
    dog_name: str
    start_time: datetime
    duration_minutes: Duration = 30
    # ponytail: module 23's "contract loop" lesson has the learner edit this
    # line live to add the cap and watch /docs react — ship the app already
    # at that lesson's end state rather than the "before" it starts from.
    notes: str | None = Field(default=None, max_length=280)


class Booking(BaseModel):
    id: str
    owner_id: str
    walker_id: str
    dog_name: str
    start_time: datetime
    duration_minutes: Duration
    notes: str | None = None
    status: BookingStatus
    price_cents: int


# ── Reviews (module 23 exercise; schema only, no route in the course) ─────


class ReviewRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(max_length=280)


# ── Payments ─────────────────────────────────────────────────────────────


class PaymentIntentRequest(BaseModel):
    booking_id: str


class PaymentIntentResponse(BaseModel):
    client_secret: str
    amount_cents: int


# ── Waitlist ─────────────────────────────────────────────────────────────


class WaitlistRequest(BaseModel):
    email: EmailStr


# ── Assistant ────────────────────────────────────────────────────────────


class BookingIntent(BaseModel):
    """Typed output of the intent-parsing step (heuristic or Pydantic AI agent)."""

    neighborhood: str | None = None
    dog_name: str | None = None
    duration_minutes: Duration = 30
    start_time: datetime | None = None


class DraftBooking(BaseModel):
    walker_id: str
    dog_name: str | None = None
    neighborhood: str | None = None
    duration_minutes: Duration = 30
    start_time: datetime | None = None


class AssistantChatRequest(BaseModel):
    message: str


class AssistantReply(BaseModel):
    reply: str
    suggested_walkers: list[str] = []
    draft_booking: DraftBooking | None = None
