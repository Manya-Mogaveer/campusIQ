from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_buildings():
    response = client.get("/api/buildings")
    assert response.status_code == 200
    buildings = response.json()
    assert len(buildings) >= 7
    codes = [b["code"] for b in buildings]
    assert "SIT-MAIN" in codes
    assert "SIT-ECE" in codes


def test_get_locations():
    response = client.get("/api/locations")
    assert response.status_code == 200
    locations = response.json()
    assert len(locations) >= 9


def test_location_category_filter():
    response = client.get("/api/locations?category=academic")
    assert response.status_code == 200
    locations = response.json()
    for loc in locations:
        assert loc["category"] == "academic"


def test_location_search():
    response = client.get("/api/locations?search=Principal")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "Principal" in data[0]["name"]
