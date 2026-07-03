"""Parses a free-text message into a typed BookingIntent.

Runs the heuristic (regex, offline, deterministic) first, always. If
PAWWALK_LLM_MODEL is set, a Pydantic AI agent runs on top and its
non-blank fields win — but any LLM/network failure falls back to the
heuristic result. The endpoint can never fail just because the model is
down (module 28's "fallback pattern").
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from functools import lru_cache

from ..config import settings
from ..schemas import BookingIntent, Duration


@dataclass
class _AgentDeps:
    session: object | None = None


_KNOWN_HOODS = ["Mission", "Bernal Heights", "Noe Valley", "Castro", "SOMA"]

_DURATION_WORDS: dict[str, Duration] = {
    "half hour": 30,
    "half-hour": 30,
    "30": 30,
    "45": 45,
    "hour": 60,
    "60": 60,
}


def _parse_neighborhood(text: str) -> str | None:
    t = text.lower()
    for hood in _KNOWN_HOODS:
        if hood.lower() in t:
            return hood
    return None


def _parse_duration(text: str) -> Duration:
    t = text.lower()
    for word, minutes in _DURATION_WORDS.items():
        if word in t:
            return minutes
    return 30


def _parse_start_time(text: str) -> datetime | None:
    """A deliberately crude heuristic: recognizes "tomorrow at H(am|pm)".
    Anything fancier is exactly what the LLM path (when configured) is for.
    """
    m = re.search(r"tomorrow at (\d{1,2})\s*(am|pm)?", text.lower())
    if not m:
        return None
    hour = int(m.group(1))
    if m.group(2) == "pm" and hour != 12:
        hour += 12
    tomorrow = datetime.now(timezone.utc) + timedelta(days=1)
    return tomorrow.replace(hour=hour, minute=0, second=0, microsecond=0)


def _parse_dog_name(text: str) -> str | None:
    m = re.search(r"(?:for|my dog)\s+([A-Z][a-z]+)", text)
    return m.group(1) if m else None


def heuristic_intent(message: str) -> BookingIntent:
    return BookingIntent(
        neighborhood=_parse_neighborhood(message),
        dog_name=_parse_dog_name(message),
        duration_minutes=_parse_duration(message),
        start_time=_parse_start_time(message),
    )


@lru_cache(maxsize=1)
def _agent():
    from pydantic_ai import Agent, RunContext

    from .. import data

    agent = Agent(
        settings.llm_model,
        deps_type=_AgentDeps,
        output_type=BookingIntent,
        instructions=(
            "You extract dog-walking booking details from a user's message. "
            f"Known neighborhoods: {', '.join(_KNOWN_HOODS)}. "
            "Only fill fields you are confident about; leave others null. "
            "Use check_availability to confirm a walker is actually free "
            "before suggesting one."
        ),
    )

    @agent.tool
    def check_availability(ctx: RunContext, neighborhood: str) -> list[str]:
        """Return the names of walkers who serve this neighborhood."""
        matches = data.find_walkers(ctx.deps.session, neighborhood)
        return [w.name for w in matches]

    return agent


def extract_intent(message: str, session=None) -> BookingIntent:
    base = heuristic_intent(message)
    if not settings.has_llm:
        return base
    try:
        agent = _agent()
        # ponytail: module 29's check_availability tool reads ctx.deps.session,
        # but no lesson shows run_sync's deps= wiring — smallest reconciling
        # change is to thread the session through here.
        result = agent.run_sync(message, deps=_AgentDeps(session=session))
        llm = result.output
        # Prefer LLM values, but fall back to heuristic where the LLM left blanks.
        return BookingIntent(
            neighborhood=llm.neighborhood or base.neighborhood,
            dog_name=llm.dog_name or base.dog_name,
            duration_minutes=llm.duration_minutes or base.duration_minutes,
            start_time=llm.start_time or base.start_time,
        )
    except Exception:
        # Never let an LLM/network error break the endpoint.
        return base
