from uuid import uuid4

from fastapi.testclient import TestClient


def test_waitlist_accepts_and_dedupes(client: TestClient) -> None:
    email = f"lead+{uuid4().hex[:8]}@example.com"
    first = client.post("/waitlist", json={"email": email})
    assert first.status_code == 201
    assert first.json() == {"status": "ok"}
    again = client.post("/waitlist", json={"email": email.upper()})
    assert again.status_code == 200  # deduped case-insensitively
    assert again.json() == {"status": "ok"}


def test_booking_stats(client: TestClient, auth_headers: dict[str, str]) -> None:
    r = client.get("/bookings/stats", headers=auth_headers)
    assert r.status_code == 200
    assert r.json() == {"total": 0}
