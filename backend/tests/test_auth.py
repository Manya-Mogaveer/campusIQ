import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "CampusIQ"
    assert "Srinivas Institute of Technology" in data["institution"]


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_admin_login_success():
    response = client.post(
        "/api/auth/login",
        json={
            "username": "admin@srinivasgroup.com",
            "password": "AdminPassword123!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["role"] == "admin"


def test_invalid_login_failure():
    response = client.post(
        "/api/auth/login",
        json={
            "username": "admin@srinivasgroup.com",
            "password": "WrongPassword!",
        },
    )
    assert response.status_code == 401


def test_user_registration_and_me():
    new_email = "test.student@srinivasgroup.com"
    response = client.post(
        "/api/auth/register",
        json={
            "email": new_email,
            "password": "ValidPassword123!",
            "full_name": "Test Student",
            "role": "student",
        },
    )
    # 201 or 400 if already exists
    assert response.status_code in [201, 400]

    login_resp = client.post(
        "/api/auth/login",
        json={
            "username": new_email,
            "password": "ValidPassword123!",
        },
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    me_resp = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == new_email
