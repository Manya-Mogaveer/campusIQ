from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_path_nodes_and_edges():
    nodes_resp = client.get("/api/navigation/nodes")
    assert nodes_resp.status_code == 200
    assert len(nodes_resp.json()) >= 14

    edges_resp = client.get("/api/navigation/edges")
    assert edges_resp.status_code == 200
    assert len(edges_resp.json()) >= 13


def test_calculate_route_astar():
    response = client.post(
        "/api/navigation/route",
        json={
            "start_node_id": "node-gate-main",
            "end_node_id": "node-ent-admin-main",
            "wheelchair_mode": False,
            "algorithm": "astar",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_distance_meters"] > 0
    assert len(data["node_ids"]) >= 2
    assert len(data["turn_by_turn"]) >= 1


def test_calculate_route_wheelchair_accessibility():
    # Route to Accessible Portico
    response = client.post(
        "/api/navigation/route",
        json={
            "start_node_id": "node-gate-main",
            "end_node_id": "node-ent-admin-main",
            "wheelchair_mode": True,
            "avoid_stairs": True,
            "algorithm": "astar",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_wheelchair_accessible"] is True
    assert data["has_stairs"] is False


def test_calculate_alternatives():
    response = client.post(
        "/api/navigation/alternatives",
        json={
            "start_node_id": "node-gate-main",
            "end_node_id": "node-ent-sports",
            "wheelchair_mode": False,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "primary" in data
    assert data["primary"]["total_distance_meters"] > 0


def test_resolve_nearest_node_within_campus():
    # Near SIT Main Building (12.874124, 74.939525)
    response = client.get("/api/navigation/nearest-node?lat=12.87415&lng=74.93950")
    assert response.status_code == 200
    data = response.json()
    assert data["is_within_campus"] is True
    assert data["distance_meters"] < 100.0
    assert data["node_id"] is not None


def test_resolve_nearest_node_outside_campus():
    # Mangaluru city center (~12.87, 74.84, ~10km away)
    response = client.get("/api/navigation/nearest-node?lat=12.87&lng=74.84")
    assert response.status_code == 200
    data = response.json()
    assert data["is_within_campus"] is False
    assert data["distance_meters"] > 1000.0
    assert data["default_entrance_id"] == "node-gate-main"


def test_route_calculation_from_outside_campus_rejected():
    response = client.post(
        "/api/navigation/route",
        json={
            "start_lat": 12.87,
            "start_lng": 74.84,
            "end_node_id": "node-ent-admin-main",
        },
    )
    assert response.status_code == 400
    assert "outside the mapped Srinivas Institute of Technology pedestrian network" in response.json()["detail"]
