# CampusIQ: System Architecture Documentation

**Institution**: Srinivas Institute of Technology (SIT), Valachil, Mangaluru, Karnataka, India  
**Platform**: CampusIQ — Intelligent Campus Navigation & Spatial Awareness Platform  
**Version**: 1.0.0

---

## 1. High-Level Architecture Overview

CampusIQ follows a modular, decoupled Client-Server architecture designed for high spatial fidelity, sub-second routing responses, and strict role-based access control.

```
+-----------------------------------------------------------------------------------+
|                                  USER CLIENTS                                     |
|  Students / Faculty / Visitors               Campus Administrators                |
|  - Interactive Leaflet Campus Map            - Infrastructure Operations          |
|  - Dynamic Route Solver (A*, Dijkstra)       - Incident Review & Mitigation       |
|  - Wheelchair / Accessibility Preferences     - Pathway Block/Reopen Controls      |
|  - QR Checkpoint Scanner                     - Facility & Schedule Management     |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / JSON REST APIs
                                           v
+-----------------------------------------------------------------------------------+
|                              FASTAPI BACKEND APIS                                 |
|                                                                                   |
|  [ Auth Router ]      [ Campus & Directory ]      [ Navigation Engine ]           |
|  - JWT token issuing  - Building, floor, room     - NetworkX Campus Graph         |
|  - Password hashing   - Facility schedules        - Dijkstra & A* Path Solvers    |
|  - RBAC Middleware    - Spatial search            - Accessibility/Stair Avoidance |
|                                                                                   |
|  [ Incident Manager ] [ QR Checkpoints ]          [ Admin Intelligence ]          |
|  - User reporting     - Code lookup & navigation  - Graph rebuild triggers        |
|  - Triage & status    - Indoor orientation        - Analytics aggregation         |
+------------------------------------------+----------------------------------------+
                                           | SQLAlchemy 2.0 ORM / GeoAlchemy2
                                           v
+-----------------------------------------------------------------------------------+
|                         POSTGRESQL + POSTGIS DATABASE                             |
|                                                                                   |
|  - Users & Roles              - Buildings & Locations   - PathNodes & PathEdges   |
|  - Facilities & Schedules     - Incident Reports        - Floors & Rooms          |
|  - QR Checkpoints             - Route History & Logs    - Announcements           |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Modules Decomposition

### Module 1: Campus Digital Twin
- **Cartographic Foundation**: OpenStreetMap base layer centered on Srinivas Institute of Technology, Valachil, Mangaluru coordinates (`12.8718° N, 74.9602° E`).
- **Data Layers**: Building footprints, pedestrian pathways, facility markers, entrances, emergency exits, and accessibility waypoints.
- **Sample Coordinate System**: Clearly tagged sample dataset representing SIT Valachil layout until surveyed real coordinates are mapped.

### Module 2: Intelligent Context-Aware Navigation
- **Graph Representation**: Undirected/Directed weighted graph $G = (V, E)$ maintained in NetworkX.
- **Node Attributes**: $V = \{id, name, lat, lng, type, elevation, is_accessible\}$.
- **Edge Attributes**: $E = \{(u, v): distance, surface_type, is_blocked, is_wheelchair_accessible, has_stairs, has_ramp, slope\}$.
- **Algorithms**:
  - **Dijkstra's Algorithm**: Single-source shortest path for benchmark and alternative route exploration.
  - **A\* Search Algorithm**: Heuristic-guided routing using Haversine distance heuristic $h(n)$ for rapid convergence.
- **Dynamic Recalculation**: Edges tagged as blocked (via verified incident reports or administrative toggle) are pruned from the routing graph in real-time.

### Module 3: Accessibility-Aware Navigation
- **Filter Policies**: Strict edge filtering on `is_wheelchair_accessible == True` and `has_stairs == False`.
- **Ramp & Elevator Preference**: Prioritizes ramps and accessible entrances, providing turn-by-turn alerts where assistance might be needed.
- **Truthful Labeling**: Routes without validated accessibility records are flagged as "Unverified Accessibility".

### Module 4: Campus Facility Intelligence
- **Operational Lifecycle**: Tracks real-time status (`open`, `closed`, `maintenance`, `temporary_closure`).
- **Proximity Discovery**: Spatial radius queries to find nearest water points, restrooms, computer centers, and cafeterias.
- **Administrative Notices**: Broadcast alerts linked to specific facilities or campus zones.

### Module 5: Indoor Navigation & QR Checkpoints
- **Orientation Checkpoints**: Physical QR labels positioned at building entrances, lobbies, and stairway junctions.
- **Checkpoint Data**: Encodes checkpoint identifier, building ID, floor number, latitude/longitude, and accessible egress points.
- **Floor Directory**: Multi-level floor records with room designations (classrooms, labs, department offices).

### Module 6: Campus Administration & Intelligence
- **Role-Based Access Control**: `ADMIN`, `OPERATOR`, `STUDENT/VISITOR`.
- **Infrastructure Controls**: Immediate pathway block/unblock, facility status override, incident triage, and route analytics.
- **Incident Mitigation**: Resolving an incident directly unblocks affected pathway edges and updates the live navigation graph.

---

## 3. Technology Stack Summary

| Tier | Component | Technology |
|---|---|---|
| **Frontend** | Framework | React 18 / Vite / JavaScript (ESNext) |
| | Styling | Tailwind CSS |
| | Routing | React Router DOM v6 |
| | Mapping | Leaflet.js & React-Leaflet |
| | Visualizations | Recharts, Lucide Icons |
| **Backend** | Framework | FastAPI (Python 3.13) |
| | ORM | SQLAlchemy 2.0 (Declarative Base) |
| | Schemas | Pydantic v2 |
| | Routing Engine | NetworkX, Shapely |
| | Auth | PyJWT / Passlib / Cryptography |
| **Database** | Primary | PostgreSQL 16+ with PostGIS Extension |
| | Migrations | Alembic |
| | Compatibility | Pure geometric fallback layer for offline / testing |
