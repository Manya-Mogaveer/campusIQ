from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_incident_lifecycle():
    # 1. User submits an incident
    report_resp = client.post(
        "/api/incidents",
        json={
            "category": "blocked_pathway",
            "title": "Fallen tree branch across pathway",
            "description": "Large branch obstructing passage near CS quadrangle.",
            "path_edge_id": "edge-quad-to-cs-ramp",
            "reporter_name": "Rohan Shetty",
        },
    )
    assert report_resp.status_code == 201
    incident_id = report_resp.json()["id"]

    # 2. Login as admin
    login_resp = client.post(
        "/api/auth/login",
        json={
            "username": "admin@srinivasgroup.com",
            "password": "AdminPassword123!",
        },
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Admin retrieves incident list
    list_resp = client.get("/api/incidents/admin/all", headers=headers)
    assert list_resp.status_code == 200
    ids = [inc["id"] for inc in list_resp.json()]
    assert incident_id in ids

    # 4. Admin triages and marks in_progress
    update_resp = client.patch(
        f"/api/incidents/admin/{incident_id}",
        json={
            "status": "in_progress",
            "priority": "high",
            "admin_notes": "Maintenance team dispatched to clear branch.",
        },
        headers=headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "in_progress"

    # 5. Admin resolves incident
    resolve_resp = client.patch(
        f"/api/incidents/admin/{incident_id}",
        json={
            "status": "resolved",
            "admin_notes": "Branch cleared, walkway inspected and safe.",
        },
        headers=headers,
    )
    assert resolve_resp.status_code == 200
    assert resolve_resp.json()["status"] == "resolved"
