# CampusIQ: System Requirements Specification

## 1. Functional Requirements (FR)

### FR1: Campus Digital Twin
- **FR1.1**: The system shall render an interactive map centered on Srinivas Institute of Technology (SIT), Valachil campus.
- **FR1.2**: All campus buildings, landmarks, open grounds, pathways, and gates shall be displayed with distinctive visual indicators.
- **FR1.3**: Users shall be able to filter facilities by category (Academic, Laboratories, Administration, Amenities, Sports, Medical, Transport).
- **FR1.4**: Clicking any building or facility marker shall display an informative drawer/card with operational hours, departments, and available floors.

### FR2: Intelligent Context-Aware Navigation
- **FR2.1**: Users can choose any two campus locations (or drop pins) as Origin and Destination.
- **FR2.2**: The backend navigation engine shall calculate the shortest path adhering strictly to established pedestrian paths using Dijkstra or A* algorithms.
- **FR2.3**: Straight-line connections across grass/buildings are strictly forbidden.
- **FR2.4**: Distance (meters) and estimated walking time (minutes at 1.2 m/s avg speed) must be displayed alongside turn-by-turn directions.
- **FR2.5**: The system shall offer alternative viable routes when available.

### FR3: Accessibility-Aware Navigation
- **FR3.1**: Users can toggle "Wheelchair Accessible Mode".
- **FR3.2**: When activated, the path solver shall completely prune pathway segments featuring stairs, steps, or non-negotiable slopes.
- **FR3.3**: Ramped entrances and automated elevators shall be highlighted.

### FR4: Campus Facility Intelligence
- **FR4.1**: Directory listing with live operational status (Open Now, Closed, Under Maintenance).
- **FR4.2**: Facility detail pages displaying contact persons, operating hours, capacity, and active notices.
- **FR4.3**: Proximity search (e.g. "Find nearest restroom" from selected location).

### FR5: QR Checkpoints & Indoor Direction
- **FR5.1**: Unique QR codes placed at major campus junctions and building entrances.
- **FR5.2**: Scanning or entering a checkpoint identifier immediately orients the user on the map.
- **FR5.3**: Checkpoints can serve as the instantaneous starting point for routing requests.
- **FR5.4**: Building floor layouts and room directories cataloged for structured multi-floor navigation.

### FR6: Incident Reporting & Admin Control
- **FR6.1**: Community reporting of blocked routes, construction, hazards, or broken amenities.
- **FR6.2**: Admin dashboard to review, approve, reject, or mark incidents resolved.
- **FR6.3**: Admin tools to instantly toggle pathways as blocked, immediately triggering route recalculation for active users.
- **FR6.4**: Real-time analytics on popular campus routes, frequent incidents, and navigation traffic.

---

## 2. Non-Functional Requirements (NFR)

- **Performance**: Route calculations must return within 250 milliseconds for graphs with up to 10,000 nodes.
- **Security**: JWT-based stateless authentication, bcrypt password hashing, input sanitization, and parameterized ORM queries.
- **Data Integrity**: Foreign key constraints, cascade deletes where appropriate, spatial validation.
- **Responsiveness**: Mobile-first design adapting seamlessly from 360px smartphone viewports to 4K ultra-wide monitors.
- **Auditability**: All admin state modifications and incident lifecycle changes logged with timestamps.
