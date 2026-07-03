from fastapi.testclient import TestClient


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


def test_assistant_chat_offline_heuristic(client: TestClient) -> None:
    r = client.post("/assistant/chat", json={"message": "Walk my dog in Mission tomorrow at 3pm"})
    assert r.status_code == 200
    assert r.json()["reply"]
