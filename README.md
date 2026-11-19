# CampusIQ: Intelligent Campus Navigation & Spatial Awareness Platform
### Srinivas Institute of Technology (SIT), Valachil, Mangaluru, Karnataka, India

CampusIQ is an enterprise-grade full-stack spatial intelligence and pedestrian routing platform designed for Srinivas Institute of Technology, Valachil. Built with a high-performance **FastAPI (Python 3.13)** backend, **SQLAlchemy 2.0 / PostgreSQL / PostGIS** database, **NetworkX** weighted graph routing engine (A* and Dijkstra), and a responsive **React 18 / Tailwind CSS / Leaflet.js** frontend.

---

## 1. Core Modules

1. **Module 1: Campus Digital Twin**: Cartographic Leaflet campus map centered on SIT Valachil coordinates (`12.8718° N, 74.9602° E`), building footprints, POIs, pathway network overlays, and layer controls.
2. **Module 2: Intelligent Context-Aware Navigation**: True graph-based pedestrian routing (Dijkstra and A* with Haversine distance heuristic). Real distance (meters), walking duration (at 1.2 m/s), turn-by-turn guidance, and alternative routes.
3. **Module 3: Accessibility-Aware Navigation**: Strict wheelchair mode enforcing stair avoidance, ramp identification, and elevation slope constraints (&le; 8°).
4. **Module 4: Campus Facility Intelligence**: Real-time operational statuses (`open`, `closed`, `maintenance`, `temporary_closure`), operating schedules, and administrative alerts.
5. **Module 5: Indoor Navigation & QR Checkpoints**: Physical QR checkpoints (e.g. `SIT-GATE-01`, `SIT-CS-G01`) for instant positioning and navigation kickoff, paired with multi-floor room directories and capacities.
6. **Module 6: Campus Administration & Incident Mitigation**: Role-based access control, incident verification triage, dynamic pathway block/unblock controls, and aggregate spatial usage analytics.

---

## 2. Technology Stack

- **Frontend**: React 18, Vite, JavaScript (ESNext), Tailwind CSS, React Router DOM, Leaflet.js, React-Leaflet, Lucide React, Recharts.
- **Backend**: Python 3.13, FastAPI, SQLAlchemy 2.0, Pydantic v2, PyJWT, bcrypt, NetworkX, Shapely.
- **Database**: PostgreSQL / PostGIS (with automatic SQLite fallback for immediate local development & testing), Alembic database migrations.

---

## 3. Getting Started & Execution

### Prerequisites
- Python 3.11+ (Python 3.13 installed)
- Node.js 18+ (Node v24.12 installed)

### 3.1 Backend Setup & Execution

1. Open PowerShell and navigate to the project directory:
   ```powershell
   cd d:\user\Documents\campusIQ
   ```

2. Activate the virtual environment:
   ```powershell
   .\backend\venv\Scripts\Activate.ps1
   ```

3. Initialize the database and sample campus dataset:
   ```powershell
   cd backend
   python -m app.database.init_db
   ```

4. Run the backend API server:
   ```powershell
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

   - **API Base URL**: `http://localhost:8000`
   - **Interactive Swagger Docs**: `http://localhost:8000/docs`
   - **ReDoc Specifications**: `http://localhost:8000/redoc`

### 3.2 Frontend Setup & Execution

1. In a separate terminal, navigate to the frontend:
   ```powershell
   cd d:\user\Documents\campusIQ\frontend
   ```

2. Run the Vite development server:
   ```powershell
   npm run dev
   ```

   - **Web Application URL**: `http://localhost:5173`

---

## 4. Default Seeded Credentials

| Role | Email Address | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@srinivasgroup.com` | `AdminPassword123!` | Full control: Block/Reopen paths, triage incidents, edit buildings/POIs |
| **Student** | `student@srinivasgroup.com` | `StudentPassword123!` | Campus navigation, directory lookup, issue reporting |

*(One-click demo buttons are also provided directly on the Sign-In screen)*

---

## 5. Running the Backend Test Suite

The test suite validates authentication, JWT security, spatial queries, A* routing, wheelchair constraint enforcement, blocked edge avoidance, and incident workflows:

```powershell
cd d:\user\Documents\campusIQ\backend
.\venv\Scripts\pytest.exe -v
```

Output:
```
======================== 16 passed in 6.82s ========================
```

---

## 6. Directory Structure

```
CampusIQ/
    frontend/
        src/
            components/       # Navbar, Sidebar, status pills, cards
            pages/            # 16 complete responsive application pages
            layouts/          # MainLayout with persistent alert banner
            maps/             # CampusMap (Leaflet custom SVG markers & route polyline)
            navigation/       # Navigation state controllers
            services/         # API services (auth, navigation, buildings, incidents...)
            hooks/            # useAuth context provider
            utils/            # Spatial formatting utilities
        package.json
        vite.config.js
        tailwind.config.js
    backend/
        app/
            api/              # Modular FastAPI endpoints (auth, navigation, incidents...)
            core/             # Settings, security, JWT token utils
            models/           # 14 SQLAlchemy ORM entities
            schemas/          # Pydantic v2 validation models
            services/         # Business logic services
            navigation/       # NetworkX Campus graph manager, Dijkstra & A* solvers
            database/         # Session manager, engine, database initializer
            main.py           # Application entrypoint & CORS middleware
        tests/                # Automated pytest suite (16 comprehensive tests)
        requirements.txt
        pytest.ini
    database/
        migrations/           # Alembic migration versions
        schema/               # Exported SQL DDL schema
    dataset/
        buildings/            # SIT Valachil campus building dataset
        locations/            # Searchable points of interest dataset
        pathways/             # Weighted graph nodes & edges dataset
        checkpoints/          # Physical QR orientation checkpoint dataset
    documentation/
        architecture.md       # Full architecture specification
        requirements.md       # Functional & Non-functional requirements
        api_documentation.md  # Complete REST API reference
        testing.md            # Testing methodology & routing test cases
    .env.example
    .gitignore
    README.md
```

---

## 7. Sample Data Notice

All building footprints, coordinates, and pathway links are explicitly identified sample data for Srinivas Institute of Technology (SIT), Valachil campus, until surveyed ground-truth geographic data is supplied.
