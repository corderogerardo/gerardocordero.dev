"""The assistant as an explicit state machine (module 29), with a RAG fork
for policy questions (module 31): parse_intent -> route_message ->
{answer_question | find_walkers -> draft_booking-or-follow-up}.
"""
from __future__ import annotations

from typing import TypedDict

from langgraph.graph import END, START, StateGraph
from sqlmodel import Session

from .. import data
from ..schemas import AssistantReply, BookingIntent, DraftBooking, Walker
from .intent import extract_intent
from .rag import answer_from_context, retrieve


class AssistantState(TypedDict, total=False):
    message: str
    session: Session
    intent: BookingIntent
    walkers: list[Walker]
    reply: str
    suggested: list[str]
    draft: DraftBooking | None


def parse_intent(state: AssistantState) -> AssistantState:
    return {"intent": extract_intent(state["message"], state.get("session"))}


def route_message(state: AssistantState) -> str:
    intent = state["intent"]
    if not intent.neighborhood and not intent.start_time:
        return "answer_question"
    return "find_walkers"


def answer_question(state: AssistantState) -> AssistantState:
    chunks = retrieve(state["message"], top_k=3)
    context = "\n\n".join(c.text for c in chunks)
    reply = answer_from_context(state["message"], context)
    return {"reply": reply, "suggested": [], "draft": None}


def find_walkers(state: AssistantState) -> AssistantState:
    intent = state["intent"]
    matches = data.find_walkers(state["session"], intent.neighborhood)
    return {"walkers": matches}


def route_after_walkers(state: AssistantState) -> str:
    intent = state["intent"]
    if not intent.dog_name:
        return "ask_followup"
    return "draft_booking"


def ask_followup(state: AssistantState) -> AssistantState:
    return {
        "reply": "Happy to book that! What's your dog's name?",
        "suggested": [w.id for w in state.get("walkers", [])[:3]],
        "draft": None,
    }


def draft_booking(state: AssistantState) -> AssistantState:
    intent = state["intent"]
    walkers = state.get("walkers", [])
    if not walkers:
        return {
            "reply": "I couldn't find a walker in that neighborhood yet.",
            "suggested": [],
            "draft": None,
        }
    top = walkers[0]
    draft = DraftBooking(
        walker_id=top.id,
        dog_name=intent.dog_name,
        neighborhood=intent.neighborhood,
        duration_minutes=intent.duration_minutes,
        start_time=intent.start_time,
    )
    return {
        "reply": f"I found {top.name} for you — want me to book a {intent.duration_minutes}-minute walk?",
        "suggested": [w.id for w in walkers[:3]],
        "draft": draft,
    }


def _build_graph():
    g = StateGraph(AssistantState)
    g.add_node("parse_intent", parse_intent)
    g.add_node("answer_question", answer_question)
    g.add_node("find_walkers", find_walkers)
    g.add_node("ask_followup", ask_followup)
    g.add_node("draft_booking", draft_booking)

    g.add_edge(START, "parse_intent")
    g.add_conditional_edges("parse_intent", route_message)
    g.add_conditional_edges("find_walkers", route_after_walkers)
    g.add_edge("answer_question", END)
    g.add_edge("ask_followup", END)
    g.add_edge("draft_booking", END)
    return g.compile()


GRAPH = _build_graph()


def run_assistant(message: str, session: Session) -> AssistantReply:
    final = GRAPH.invoke({"message": message, "session": session})
    return AssistantReply(
        reply=final["reply"],
        suggested_walkers=final.get("suggested", []),
        draft_booking=final.get("draft"),
    )
