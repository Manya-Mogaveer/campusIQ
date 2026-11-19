# CampusIQ: Testing Strategy & Execution Guide

## Test Suite Organization

```
CampusIQ/
  backend/
    tests/
      test_auth.py           # User registration, login, JWT validation, role checks
      test_locations.py      # Campus locations, buildings, categories, search
      test_navigation.py     # Graph routing, Dijkstra, A*, wheelchair filtering, blocked paths
      test_incidents.py      # Incident reporting lifecycle, admin triage, path status sync
      test_qr.py             # QR checkpoint resolution, code parsing
  frontend/
    # Component tests & Cypress / Playwright e2e hooks
```

## Running Backend Tests

Activate the virtual environment:
```powershell
.\backend\venv\Scripts\Activate.ps1
cd backend
pytest -v
```

## Routing Test Scenarios
1. **Direct Path Test**: Verifies shortest path calculation yields minimal Haversine distance between two nodes.
2. **Blocked Path Avoidance**: Mark an edge blocked; verify route navigates around the obstacle.
3. **Accessibility Constraint**: Ensure a pathway with `has_stairs=True` is never returned when `wheelchair_mode=True`.
4. **Isolated Node Handling**: Ensure friendly 404/422 response with informative message when origin/destination cannot be connected.
