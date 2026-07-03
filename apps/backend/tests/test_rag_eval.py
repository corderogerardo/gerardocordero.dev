"""The module-31 retrieval-hit-rate eval, as a real test: for each question,
does retrieval reach a chunk from the doc that actually holds the answer?
"""
from app.assistant.rag import retrieve

EVAL_SET = [
    {"question": "what is your cancellation policy?", "expected_source": "docs/API-CONTRACT.md"},
    {"question": "how are prices calculated?", "expected_source": "docs/ARCHITECTURE.md"},
    {"question": "how do I deploy the backend?", "expected_source": "docs/DEPLOY.md"},
    {"question": "what does the assistant do?", "expected_source": "docs/ARCHITECTURE.md"},
    {"question": "how is auth handled?", "expected_source": "docs/ARCHITECTURE.md"},
]


def test_retrieval_hit_rate() -> None:
    hits = 0
    for case in EVAL_SET:
        chunks = retrieve(case["question"], top_k=3)
        sources = [c.source for c in chunks]
        if case["expected_source"] in sources:
            hits += 1
    assert hits == len(EVAL_SET), f"hit-rate: {hits}/{len(EVAL_SET)}"


def test_answer_question_route_is_grounded(client) -> None:
    r = client.post("/assistant/chat", json={"message": "what is your cancellation policy?"})
    assert r.status_code == 200
    body = r.json()
    assert "cancel" in body["reply"].lower()
    assert body["suggested_walkers"] == []
    assert body["draft_booking"] is None
