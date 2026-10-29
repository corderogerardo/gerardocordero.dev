from datetime import datetime
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from app.db import engine
from app.models_db import UserTable


def test_root(client: TestClient) -> None:
    r = client.get("/")
    assert r.status_code == 200


def test_list_walkers(client: TestClient) -> None:
    r = client.get("/walkers")
    assert r.status_code == 200
    assert len(r.json()) >= 1


def test_signup_and_login(client: TestClient) -> None:
    email = "ana@example.com"
    signup = client.post(
        "/auth/signup",
        json={"email": email, "password": "longenough", "name": "Ana"},
    )
    assert signup.status_code == 201
    assert signup.json()["token_type"] == "bearer"

    login = client.post("/auth/login", json={"email": email, "password": "longenough"})
    assert login.status_code == 200
    assert "access_token" in login.json()


def test_duplicate_signup_returns_flat_email_taken_conflict(client: TestClient) -> None:
    email = f"duplicate+{uuid4().hex}@example.com"
    payload = {"email": email, "password": "longenough", "name": "Duplicate"}
    first_signup = client.post("/auth/signup", json=payload)
    assert first_signup.status_code == 201

    duplicate_signup = client.post("/auth/signup", json=payload)

    assert duplicate_signup.status_code == 409
    assert duplicate_signup.json() == {
        "code": "email_taken",
        "detail": "Email already registered",
    }


def test_signup_email_insert_race_returns_email_taken_conflict(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    email = f"race+{uuid4().hex}@example.com"
    original_commit = Session.commit

    def commit_after_competing_signup(session: Session) -> None:
        with Session(engine) as competing_session:
            competing_session.add(
                UserTable(
                    id=f"usr_{uuid4().hex[:12]}",
                    email=email,
                    name="Concurrent signup",
                    password_hash="test-only",
                    role="owner",
                )
            )
            original_commit(competing_session)
        raise IntegrityError(
            "INSERT INTO users (email) VALUES (?)",
            {"email": email},
            Exception("UNIQUE constraint failed: users.email"),
        )

    monkeypatch.setattr(Session, "commit", commit_after_competing_signup)

    response = client.post(
        "/auth/signup",
        json={"email": email, "password": "longenough", "name": "Racing signup"},
    )

    assert response.status_code == 409
    assert response.json() == {
        "code": "email_taken",
        "detail": "Email already registered",
    }


def test_signup_reraises_unrelated_integrity_error(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    def fail_commit(_session: Session) -> None:
        raise IntegrityError("INSERT INTO users", {}, Exception("unrelated constraint"))

    monkeypatch.setattr(Session, "commit", fail_commit)

    with pytest.raises(IntegrityError, match="unrelated constraint"):
        client.post(
            "/auth/signup",
            json={
                "email": f"integrity+{uuid4().hex}@example.com",
                "password": "longenough",
                "name": "Integrity failure",
            },
        )


def test_login_wrong_password_is_401(client: TestClient) -> None:
    client.post(
        "/auth/signup",
        json={"email": "ben@example.com", "password": "longenough", "name": "Ben"},
    )
    r = client.post("/auth/login", json={"email": "ben@example.com", "password": "wrongpass"})
    assert r.status_code == 401


def test_protected_route_requires_auth(client: TestClient) -> None:
    r = client.get("/bookings")
    assert r.status_code == 401


def test_protected_route_with_auth(client: TestClient, auth_headers: dict[str, str]) -> None:
    r = client.get("/bookings", headers=auth_headers)
    assert r.status_code == 200
    assert r.json() == []


def test_create_booking(client: TestClient, auth_headers: dict[str, str]) -> None:
    walkers = client.get("/walkers").json()
    walker_id = walkers[0]["id"]

    r = client.post(
        "/bookings",
        headers=auth_headers,
        json={
            "walker_id": walker_id,
            "dog_name": "Mochi",
            "start_time": "2026-01-01T10:00:00",
            "duration_minutes": 30,
        },
    )
    assert r.status_code == 201
    body = r.json()
    assert body["status"] == "pending"
    assert body["price_cents"] > 0


def test_booking_scoped_to_owner(client: TestClient, auth_headers: dict[str, str]) -> None:
    walkers = client.get("/walkers").json()
    walker_id = walkers[0]["id"]
    created = client.post(
        "/bookings",
        headers=auth_headers,
        json={
            "walker_id": walker_id,
            "dog_name": "Mochi",
            "start_time": "2026-01-01T10:00:00",
            "duration_minutes": 30,
        },
    ).json()

    other_signup = client.post(
        "/auth/signup",
        json={"email": "other@example.com", "password": "longenough", "name": "Other"},
    )
    other_headers = {"Authorization": f"Bearer {other_signup.json()['access_token']}"}

    r = client.get(f"/bookings/{created['id']}", headers=other_headers)
    assert r.status_code == 404


def test_booking_over_281_char_notes_is_422(client: TestClient, auth_headers: dict[str, str]) -> None:
    walkers = client.get("/walkers").json()
    walker_id = walkers[0]["id"]
    r = client.post(
        "/bookings",
        headers=auth_headers,
        json={
            "walker_id": walker_id,
            "dog_name": "Mochi",
            "start_time": "2026-01-01T10:00:00",
            "duration_minutes": 30,
            "notes": "x" * 281,
        },
    )
    assert r.status_code == 422


def test_payment_intent_stub(client: TestClient, auth_headers: dict[str, str]) -> None:
    walkers = client.get("/walkers").json()
    walker_id = walkers[0]["id"]
    booking = client.post(
        "/bookings",
        headers=auth_headers,
        json={
            "walker_id": walker_id,
            "dog_name": "Mochi",
            "start_time": "2026-01-01T10:00:00",
            "duration_minutes": 30,
        },
    ).json()

    r = client.post("/payments/intent", headers=auth_headers, json={"booking_id": booking["id"]})
    assert r.status_code == 200
    assert r.json()["client_secret"].startswith("pi_stub_")


def test_naive_start_time_is_normalized_to_utc(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    walkers = client.get("/walkers").json()
    r = client.post(
        "/bookings",
        headers=auth_headers,
        json={
            "walker_id": walkers[0]["id"],
            "dog_name": "Mochi",
            "start_time": "2026-01-01T10:00:00",
            "duration_minutes": 30,
        },
    )
    assert r.status_code == 201
    start = datetime.fromisoformat(r.json()["start_time"])
    assert start.tzinfo is not None
    assert start.utcoffset().total_seconds() == 0
    assert (start.hour, start.minute) == (10, 0)


def test_offset_start_time_is_normalized_to_utc(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    walkers = client.get("/walkers").json()
    r = client.post(
        "/bookings",
        headers=auth_headers,
        json={
            "walker_id": walkers[0]["id"],
            "dog_name": "Mochi",
            "start_time": "2026-01-01T10:00:00-05:00",
            "duration_minutes": 30,
        },
    )
    assert r.status_code == 201
    start = datetime.fromisoformat(r.json()["start_time"])
    assert start.utcoffset().total_seconds() == 0
    assert (start.hour, start.minute) == (15, 0)


def test_assistant_chat_offline_heuristic(client: TestClient) -> None:
    r = client.post("/assistant/chat", json={"message": "Walk my dog in Mission tomorrow at 3pm"})
    assert r.status_code == 200
    assert r.json()["reply"]
