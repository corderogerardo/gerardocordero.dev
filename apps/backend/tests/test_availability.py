from fastapi.testclient import TestClient


def test_walker_availability(client: TestClient) -> None:
    resp = client.get("/walkers/wlk_sam/availability")
    assert resp.status_code == 200
    assert len(resp.json()["slots"]) >= 1
