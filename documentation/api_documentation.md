# CampusIQ: REST API Documentation

Base URL: `http://localhost:8000/api`

## Authentication

### `POST /auth/register`
Registers a new user account.
- **Request Body**:
  ```json
  {
    "email": "user@srinivasgroup.com",
    "password": "StrongPassword123!",
    "full_name": "Srinivas Student",
    "role": "student"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": "uuid",
    "email": "user@srinivasgroup.com",
    "full_name": "Srinivas Student",
    "role": "student",
    "created_at": "2026-11-19T10:00:00Z"
  }
  ```

### `POST /auth/login`
Authenticates a user and returns a signed JWT access token.
- **Request Body**:
  ```json
  {
    "username": "admin@srinivasgroup.com",
    "password": "AdminPassword123!"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": "uuid",
      "email": "admin@srinivasgroup.com",
      "full_name": "Campus Administrator",
      "role": "admin"
    }
  }
  ```

---

## Campus & Locations

### `GET /buildings`
Retrieves list of campus buildings with coordinates, floor counts, and metadata.

### `GET /locations`
Retrieves list of searchable campus locations (entrances, departments, labs, amenities).
- **Query Parameters**:
  - `category` (optional): Filter by category (`academic`, `canteen`, `sports`, `admin`, `library`, `hostel`)
  - `search` (optional): Name or keyword search
  - `accessible_only` (optional): Boolean

### `GET /locations/{id}`
Returns granular location details, connected building, and accessibility profile.

### `GET /facilities`
Returns operational status, hours, and descriptions for campus facilities.

---

## Navigation Engine

### `POST /navigation/route`
Calculates optimal pedestrian route between two points using graph algorithms.
- **Request Body**:
  ```json
  {
    "start_node_id": "node-101",
    "end_node_id": "node-205",
    "wheelchair_mode": false,
    "avoid_stairs": false,
    "algorithm": "astar" // or "dijkstra"
  }
  ```
- **Response**:
  ```json
  {
    "total_distance_meters": 342.5,
    "estimated_time_minutes": 4.8,
    "is_wheelchair_accessible": true,
    "path_node_ids": ["node-101", "node-102", "node-145", "node-205"],
    "coordinates": [[12.8718, 74.9601], [12.8721, 74.9605]],
    "turn_by_turn": [
      { "instruction": "Head northeast towards Main Block Entrance", "distance_meters": 45.0 },
      { "instruction": "Follow paved central boulevard", "distance_meters": 120.0 }
    ],
    "algorithm_used": "astar"
  }
  ```

### `POST /navigation/alternatives`
Returns up to 3 candidate routes (shortest, scenic, accessibility prioritized).

---

## QR Checkpoints

### `GET /qr/{code}`
Retrieves checkpoint data (building, floor, coordinates, orientation tag).

### `POST /admin/qr` (Admin Only)
Generates or updates a QR checkpoint.

---

## Incident Reporting

### `POST /incidents`
Submits an incident report (blocked pathway, broken ramp, facility outage).

### `GET /incidents`
Returns recent public alerts (e.g. active pathway closures).

### `GET /admin/incidents` (Admin Only)
Returns full list of reports with triage controls.

### `PATCH /admin/incidents/{id}` (Admin Only)
Approves, rejects, or marks incident resolved, automatically updating pathway state.

---

## Admin Controls & Analytics

### `PATCH /admin/paths/{id}/block`
Toggles pathway segment blocked state, removing it from live routing graph.

### `PATCH /admin/paths/{id}/reopen`
Restores pathway segment to active routing graph.

### `GET /admin/analytics`
Returns aggregate statistics: total routes requested, popular destinations, incident resolution rate, and accessibility requests.
