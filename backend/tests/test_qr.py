from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_qr_checkpoint_by_code():
    response = client.get("/api/qr/SIT-GATE-01")
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == "SIT-GATE-01"
    assert data["name"] == "Main Entrance Gate Checkpoint"
    assert "data:image/png;base64," in data["qr_image_url"]


def test_unknown_qr_checkpoint():
    response = client.get("/api/qr/UNKNOWN-CHECKPOINT-999")
    assert response.status_code == 404
