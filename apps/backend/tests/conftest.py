import os
import tempfile
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient


def pytest_configure(config: pytest.Config) -> None:
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    os.environ["PAWWALK_DATABASE_URL"] = f"sqlite:///{path}"
    config._pawwalk_db_path = path
    # Tests run fully offline with zero setup — a throwaway secret here doesn't
    # weaken the "no default in real deployments" guarantee in app/config.py.
    os.environ.setdefault("PAWWALK_JWT_SECRET", "test-secret-not-for-prod-but-32-bytes-long")


@pytest.fixture()
def client() -> Iterator[TestClient]:
    from app.main import app  # imported lazily so PAWWALK_DATABASE_URL is set first

    with TestClient(app) as c:
        yield c


@pytest.fixture()
def auth_headers(client: TestClient) -> dict[str, str]:
    from uuid import uuid4

    email = f"owner+{uuid4().hex[:8]}@example.com"
    resp = client.post(
        "/auth/signup",
        json={"email": email, "password": "longenough", "name": "Test Owner"},
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
