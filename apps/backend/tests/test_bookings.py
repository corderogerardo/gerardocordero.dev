from __future__ import annotations

import sqlite3
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.config import settings
from app.db import engine
from app.models_db import BookingTable, WalkerTable


def create_user(client: TestClient, role: str = "owner") -> tuple[str, str]:
    response = client.post(
        "/auth/signup",
        json={
            "email": f"{uuid4().hex}@example.com",
            "password": "longenough",
            "name": f"Test {role}",
            "role": role,
        },
    )
    assert response.status_code == 201
    body = response.json()
    return body["user"]["id"], f"Bearer {body['access_token']}"


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": token}


def create_linked_walker(user_id: str) -> str:
    walker_id = f"wlk_{uuid4().hex[:12]}"
    with Session(engine) as session:
        session.add(
            WalkerTable(
                id=walker_id,
                name="Linked Walker",
                rating=4.8,
                price_per_30min_cents=3000,
                user_id=user_id,
            )
        )
        session.commit()
    return walker_id


def create_booking(client: TestClient, owner_token: str, walker_id: str) -> dict:
    response = client.post(
        "/bookings",
        headers=auth_header(owner_token),
        json={
            "walker_id": walker_id,
            "dog_name": "Mochi",
            "start_time": "2026-01-01T10:00:00Z",
            "duration_minutes": 30,
        },
    )
    assert response.status_code == 201
    return response.json()


def assert_booking_response(body: dict, expected_status: str) -> None:
    assert body["status"] == expected_status
    assert isinstance(body["created_at"], str)
    assert body["id"].startswith("bkg_")
    assert "booking" not in body


def test_booking_create_list_and_detail_are_flat_and_include_created_at(
    client: TestClient,
) -> None:
    _, owner_token = create_user(client)
    walker_id = client.get("/walkers").json()[0]["id"]

    created = create_booking(client, owner_token, walker_id)
    assert_booking_response(created, "pending")
    created_at = datetime.fromisoformat(created["created_at"])
    assert created_at.tzinfo is not None

    listed = client.get("/bookings", headers=auth_header(owner_token))
    assert listed.status_code == 200
    assert isinstance(listed.json(), list)
    assert any(item["id"] == created["id"] for item in listed.json())
    assert all("created_at" in item for item in listed.json())

    detail = client.get(f"/bookings/{created['id']}", headers=auth_header(owner_token))
    assert detail.status_code == 200
    assert detail.json() == created


def test_assigned_list_contains_only_bookings_for_linked_walker(client: TestClient) -> None:
    walker_user_id, walker_token = create_user(client, "walker")
    assigned_walker_id = create_linked_walker(walker_user_id)
    other_walker_id = client.get("/walkers").json()[0]["id"]
    owner_a_id, owner_a_token = create_user(client)
    owner_b_id, owner_b_token = create_user(client)
    assigned = create_booking(client, owner_a_token, assigned_walker_id)
    unassigned = create_booking(client, owner_b_token, other_walker_id)

    response = client.get("/bookings/assigned", headers=auth_header(walker_token))

    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert [booking["id"] for booking in response.json()] == [assigned["id"]]
    assert all("created_at" in booking for booking in response.json())
    assert unassigned["id"] not in {booking["id"] for booking in response.json()}
    assert owner_a_id != owner_b_id


def test_assigned_list_rejects_owner_role(client: TestClient) -> None:
    _, owner_token = create_user(client)

    response = client.get("/bookings/assigned", headers=auth_header(owner_token))

    assert response.status_code == 403


def test_walker_can_accept_decline_start_and_complete(client: TestClient) -> None:
    walker_user_id, walker_token = create_user(client, "walker")
    walker_id = create_linked_walker(walker_user_id)
    _, owner_token = create_user(client)
    pending = create_booking(client, owner_token, walker_id)

    accepted = client.post(
        f"/bookings/{pending['id']}/accept", headers=auth_header(walker_token)
    )
    assert accepted.status_code == 200
    assert_booking_response(accepted.json(), "confirmed")

    started = client.post(
        f"/bookings/{pending['id']}/start", headers=auth_header(walker_token)
    )
    assert started.status_code == 200
    assert_booking_response(started.json(), "in_progress")

    completed = client.post(
        f"/bookings/{pending['id']}/complete", headers=auth_header(walker_token)
    )
    assert completed.status_code == 200
    assert_booking_response(completed.json(), "completed")

    declined_booking = create_booking(client, owner_token, walker_id)
    declined = client.post(
        f"/bookings/{declined_booking['id']}/decline", headers=auth_header(walker_token)
    )
    assert declined.status_code == 200
    assert_booking_response(declined.json(), "cancelled")


@pytest.mark.parametrize("initial_status", ["pending", "confirmed"])
def test_owner_can_cancel_pending_or_confirmed_booking(
    client: TestClient, initial_status: str
) -> None:
    _, owner_token = create_user(client)
    walker_id = client.get("/walkers").json()[0]["id"]
    booking = create_booking(client, owner_token, walker_id)
    if initial_status == "confirmed":
        with Session(engine) as session:
            row = session.get(BookingTable, booking["id"])
            assert row is not None
            row.status = "confirmed"
            session.add(row)
            session.commit()

    response = client.post(
        f"/bookings/{booking['id']}/cancel", headers=auth_header(owner_token)
    )

    assert response.status_code == 200
    assert_booking_response(response.json(), "cancelled")


def test_payment_confirmed_booking_can_be_started_by_assigned_walker(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    import stripe

    walker_user_id, walker_token = create_user(client, "walker")
    walker_id = create_linked_walker(walker_user_id)
    _, owner_token = create_user(client)
    booking = create_booking(client, owner_token, walker_id)
    monkeypatch.setattr(settings, "stripe_webhook_secret", "test-webhook-secret")
    monkeypatch.setattr(
        stripe.Webhook,
        "construct_event",
        lambda *_args, **_kwargs: {
            "type": "payment_intent.succeeded",
            "data": {"object": {"metadata": {"booking_id": booking["id"]}}},
        },
    )

    webhook = client.post("/payments/webhook", content=b"{}")
    started = client.post(
        f"/bookings/{booking['id']}/start", headers=auth_header(walker_token)
    )

    assert webhook.status_code == 200
    assert webhook.json() == {"received": True}
    assert started.status_code == 200
    assert_booking_response(started.json(), "in_progress")


@pytest.mark.parametrize(
    ("action", "starting_status", "actor_role", "expected_status"),
    [
        ("accept", "confirmed", "walker", "confirmed"),
        ("decline", "confirmed", "walker", "confirmed"),
        ("start", "pending", "walker", "pending"),
        ("complete", "confirmed", "walker", "confirmed"),
        ("cancel", "in_progress", "owner", "in_progress"),
    ],
)
def test_illegal_transition_returns_conflict_and_preserves_booking(
    client: TestClient,
    action: str,
    starting_status: str,
    actor_role: str,
    expected_status: str,
) -> None:
    walker_user_id, walker_token = create_user(client, "walker")
    walker_id = create_linked_walker(walker_user_id)
    _, owner_token = create_user(client)
    booking = create_booking(client, owner_token, walker_id)
    with Session(engine) as session:
        row = session.get(BookingTable, booking["id"])
        assert row is not None
        row.status = starting_status
        session.add(row)
        session.commit()
    actor_token = owner_token if actor_role == "owner" else walker_token

    response = client.post(
        f"/bookings/{booking['id']}/{action}", headers=auth_header(actor_token)
    )

    assert response.status_code == 409
    assert response.json()["code"] == "transition_conflict"
    assert isinstance(response.json()["detail"], str)
    with Session(engine) as session:
        stored = session.get(BookingTable, booking["id"])
        assert stored is not None
        assert stored.status == expected_status


def test_wrong_role_and_foreign_booking_do_not_reveal_or_mutate(
    client: TestClient,
) -> None:
    walker_user_id, walker_token = create_user(client, "walker")
    walker_id = create_linked_walker(walker_user_id)
    _, owner_token = create_user(client)
    booking = create_booking(client, owner_token, walker_id)
    other_walker_user_id, other_walker_token = create_user(client, "walker")
    create_linked_walker(other_walker_user_id)

    owner_transition = client.post(
        f"/bookings/{booking['id']}/accept", headers=auth_header(owner_token)
    )
    foreign_transition = client.post(
        f"/bookings/{booking['id']}/accept", headers=auth_header(other_walker_token)
    )
    walker_cancel = client.post(
        f"/bookings/{booking['id']}/cancel", headers=auth_header(walker_token)
    )

    assert owner_transition.status_code == 403
    assert foreign_transition.status_code == 404
    assert foreign_transition.json()["detail"] == "Booking not found"
    assert walker_cancel.status_code == 403
    with Session(engine) as session:
        stored = session.get(BookingTable, booking["id"])
        assert stored is not None
        assert stored.status == "pending"


def test_competing_transitions_only_allow_one_state_change(client: TestClient) -> None:
    walker_user_id, walker_token = create_user(client, "walker")
    walker_id = create_linked_walker(walker_user_id)
    _, owner_token = create_user(client)
    booking = create_booking(client, owner_token, walker_id)

    accepted = client.post(
        f"/bookings/{booking['id']}/accept", headers=auth_header(walker_token)
    )
    stale_decline = client.post(
        f"/bookings/{booking['id']}/decline", headers=auth_header(walker_token)
    )

    assert accepted.status_code == 200
    assert stale_decline.status_code == 409
    assert stale_decline.json()["code"] == "transition_conflict"
    with Session(engine) as session:
        stored = session.get(BookingTable, booking["id"])
        assert stored is not None
        assert stored.status == "confirmed"


def test_booking_timestamp_migration_preserves_existing_rows(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    with tempfile.TemporaryDirectory(prefix="pawwalk-migration-") as temp_dir:
        database_path = Path(temp_dir) / "legacy.db"
        database_url = f"sqlite:///{database_path}"
        monkeypatch.setattr(settings, "database_url", database_url)
        config = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))
        config.set_main_option("sqlalchemy.url", database_url)
        command.upgrade(config, "d59b73583987")
        with sqlite3.connect(database_path) as connection:
            connection.execute(
                "INSERT INTO users (id, email, name, password_hash, role, created_at) "
                "VALUES ('usr_legacy', 'legacy@example.com', 'Legacy', 'hash', 'owner', ?)",
                ("2025-01-01 00:00:00",),
            )
            connection.execute(
                "INSERT INTO walkers (id, name, rating, price_per_30min_cents, bio) "
                "VALUES ('wlk_legacy', 'Legacy Walker', 4.5, 3000, '')"
            )
            connection.execute(
                "INSERT INTO walkers (id, name, rating, price_per_30min_cents, bio, user_id) "
                "VALUES ('wlk_claimed', 'Claimed Walker', 4.5, 3000, '', 'usr_legacy')"
            )
            connection.execute(
                "INSERT INTO bookings (id, owner_id, walker_id, dog_name, start_time, "
                "duration_minutes, status, price_cents) VALUES "
                "('bkg_legacy', 'usr_legacy', 'wlk_legacy', 'Mochi', ?, 30, 'pending', 3000)",
                ("2025-01-02 10:00:00",),
            )
        command.upgrade(config, "head")
        with sqlite3.connect(database_path) as connection:
            row = connection.execute(
                "SELECT id, created_at FROM bookings WHERE id = 'bkg_legacy'"
            ).fetchone()
            with pytest.raises(sqlite3.IntegrityError):
                connection.execute(
                    "INSERT INTO walkers (id, name, rating, price_per_30min_cents, bio, user_id) "
                    "VALUES ('wlk_duplicate', 'Duplicate', 4.0, 3000, '', 'usr_legacy')"
                )

    assert row is not None
    assert row[0] == "bkg_legacy"
    assert datetime.fromisoformat(row[1]).tzinfo is None
    assert datetime.fromisoformat(row[1]) <= datetime.now(timezone.utc).replace(tzinfo=None)
