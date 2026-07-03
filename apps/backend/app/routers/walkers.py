from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from .. import data
from ..db import get_session
from ..schemas import Walker

router = APIRouter(prefix="/walkers", tags=["walkers"])


@router.get("", response_model=list[Walker])
def list_walkers(min_rating: float = 0, session: Session = Depends(get_session)) -> list[Walker]:
    return data.list_walkers(session, min_rating)


@router.get("/{walker_id}", response_model=Walker)
def get_walker(walker_id: str, session: Session = Depends(get_session)) -> Walker:
    walker = data.get_walker(session, walker_id)
    if walker is None:
        raise HTTPException(status_code=404, detail="Walker not found")
    return walker


@router.get("/{walker_id}/availability")
def get_walker_availability(walker_id: str, session: Session = Depends(get_session)) -> dict:
    """Module 24's terminal checklist: a small, honest toy endpoint —
    hardcoded slots, no real calendar yet."""
    walker = data.get_walker(session, walker_id)
    if walker is None:
        raise HTTPException(status_code=404, detail="Walker not found")
    return {"slots": ["09:00", "11:00", "14:00"]}
