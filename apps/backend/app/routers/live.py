"""Wired into app/main.py's include_router list; no route body is ever shown
in the lessons. Kept minimal — see README "Deviations from the course"."""
from fastapi import APIRouter

router = APIRouter(prefix="/live", tags=["live"])


@router.get("/ping")
def ping() -> dict:
    return {"status": "ok"}
