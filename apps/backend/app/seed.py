"""Demo data — runs on startup, after migrations. Safe to run again and again."""
from __future__ import annotations

from sqlmodel import Session, select

from .models_db import WalkerTable

_WALKERS = [
    {
        "id": "wlk_sam",
        "name": "Sam Rivera",
        "email": "sam@pawwalk.dev",
        "rating": 4.9,
        "price_per_30min_cents": 3000,
        "bio": "Five years walking dogs of every size in the Mission.",
        "neighborhoods": ["Mission", "Bernal Heights"],
    },
    {
        "id": "wlk_ana",
        "name": "Ana Torres",
        "email": "ana@pawwalk.dev",
        "rating": 4.8,
        "price_per_30min_cents": 2800,
        "bio": "Certified dog trainer, loves reactive dogs.",
        "neighborhoods": ["Noe Valley", "Castro"],
    },
    {
        "id": "wlk_ben",
        "name": "Ben Cho",
        "email": "ben@pawwalk.dev",
        "rating": 4.7,
        "price_per_30min_cents": 2500,
        "bio": "Marathon runner — great for high-energy breeds.",
        "neighborhoods": ["Mission", "SOMA"],
    },
]


def seed_demo_data(session: Session) -> None:
    # 1. Public walker profiles.
    if session.exec(select(WalkerTable)).first() is None:
        session.add_all(
            WalkerTable(**{k: v for k, v in w.items() if k != "email"}) for w in _WALKERS
        )
        session.commit()
