import os
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.database.session import Base, engine, SessionLocal
from app.core.config import settings
from app.core.security import get_password_hash
import app.models as m


def seed_database(db: Session) -> None:
    # 1. Seed Admin User
    admin = db.query(m.User).filter(m.User.email == settings.ADMIN_EMAIL).first()
    if not admin:
        admin = m.User(
            email=settings.ADMIN_EMAIL,
            hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
            full_name=settings.ADMIN_FULL_NAME,
            role="admin",
            is_active=True,
        )
        db.add(admin)

    # 2. Seed Student User
    student = db.query(m.User).filter(m.User.email == "student@srinivasgroup.com").first()
    if not student:
        student = m.User(
            email="student@srinivasgroup.com",
            hashed_password=get_password_hash("StudentPassword123!"),
            full_name="Karthik Bhat",
            role="student",
            is_active=True,
        )
        db.add(student)

    # 3. Seed Faculty User
    faculty = db.query(m.User).filter(m.User.email == "faculty@srinivasgroup.com").first()
    if not faculty:
        faculty = m.User(
            email="faculty@srinivasgroup.com",
            hashed_password=get_password_hash("FacultyPassword123!"),
            full_name="Prof. Ananth Sharma",
            role="faculty",
            is_active=True,
        )
        db.add(faculty)

    db.commit()

    # Paths to datasets
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    bldg_file = os.path.join(base_dir, "dataset", "buildings", "buildings.json")
    loc_file = os.path.join(base_dir, "dataset", "locations", "locations.json")
    path_file = os.path.join(base_dir, "dataset", "pathways", "pathways.json")
    check_file = os.path.join(base_dir, "dataset", "checkpoints", "checkpoints.json")

    # 3. Seed Buildings
    if os.path.exists(bldg_file):
        with open(bldg_file, "r", encoding="utf-8") as f:
            bldgs_data = json.load(f)
            for item in bldgs_data:
                existing = db.query(m.Building).filter(m.Building.id == item["id"]).first()
                if not existing:
                    bldg = m.Building(
                        id=item["id"],
                        name=item["name"],
                        code=item["code"],
                        description=item["description"],
                        lat=item["lat"],
                        lng=item["lng"],
                        floors_count=item.get("floors_count", 1),
                        has_elevator=item.get("has_elevator", False),
                        has_ramp=item.get("has_ramp", False),
                        image_url=item.get("image_url"),
                    )
                    db.add(bldg)
            db.commit()

    # 4. Seed Locations
    if os.path.exists(loc_file):
        with open(loc_file, "r", encoding="utf-8") as f:
            locs_data = json.load(f)
            for item in locs_data:
                existing = db.query(m.Location).filter(m.Location.id == item["id"]).first()
                if not existing:
                    loc = m.Location(
                        id=item["id"],
                        name=item["name"],
                        code=item.get("code"),
                        building_id=item.get("building_id"),
                        category=item["category"],
                        floor_number=item.get("floor_number", 0),
                        room_number=item.get("room_number"),
                        lat=item["lat"],
                        lng=item["lng"],
                        description=item["description"],
                        is_accessible=item.get("is_accessible", True),
                        tags=item.get("tags"),
                    )
                    db.add(loc)
            db.commit()

    # 5. Seed Pathways (Nodes & Edges)
    if os.path.exists(path_file):
        with open(path_file, "r", encoding="utf-8") as f:
            path_data = json.load(f)
            for node in path_data.get("nodes", []):
                existing = db.query(m.PathNode).filter(m.PathNode.id == node["id"]).first()
                if not existing:
                    pn = m.PathNode(
                        id=node["id"],
                        name=node["name"],
                        node_type=node.get("node_type", "junction"),
                        lat=node["lat"],
                        lng=node["lng"],
                        elevation_meters=node.get("elevation_meters", 0.0),
                        building_id=node.get("building_id"),
                        floor_level=node.get("floor_level", 0),
                        is_accessible=node.get("is_accessible", True),
                    )
                    db.add(pn)
            db.commit()

            for edge in path_data.get("edges", []):
                existing = db.query(m.PathEdge).filter(m.PathEdge.id == edge["id"]).first()
                if not existing:
                    pe = m.PathEdge(
                        id=edge["id"],
                        start_node_id=edge["start_node_id"],
                        end_node_id=edge["end_node_id"],
                        distance_meters=edge["distance_meters"],
                        pathway_type=edge.get("pathway_type", "paved"),
                        is_bidirectional=edge.get("is_bidirectional", True),
                        is_blocked=edge.get("is_blocked", False),
                        is_wheelchair_accessible=edge.get("is_wheelchair_accessible", True),
                        has_stairs=edge.get("has_stairs", False),
                        has_ramp=edge.get("has_ramp", False),
                        slope_degrees=edge.get("slope_degrees", 0.0),
                        description=edge.get("description"),
                    )
                    db.add(pe)
            db.commit()

    # 6. Seed QR Checkpoints
    if os.path.exists(check_file):
        with open(check_file, "r", encoding="utf-8") as f:
            check_data = json.load(f)
            for item in check_data:
                existing = db.query(m.QRCheckpoint).filter(m.QRCheckpoint.code == item["code"]).first()
                if not existing:
                    cp = m.QRCheckpoint(
                        code=item["code"],
                        name=item["name"],
                        building_id=item.get("building_id"),
                        floor_level=item.get("floor_level", 0),
                        associated_node_id=item.get("associated_node_id"),
                        lat=item["lat"],
                        lng=item["lng"],
                        description=item.get("description"),
                        orientation_guidance=item.get("orientation_guidance"),
                    )
                    db.add(cp)
            db.commit()

    # 7. Seed Facilities & Statuses
    facilities_data = [
        {
            "id": "fac-central-lib",
            "name": "Central Campus Library",
            "category": "library",
            "building_id": "bldg-central-lib",
            "location_id": "loc-central-reading-hall",
            "description": "Comprehensive engineering research repository with digital access portals.",
            "contact_phone": "+91 824 2274730",
            "contact_email": "library@srinivasgroup.com",
            "status": "open",
            "open_time": "08:30 AM",
            "close_time": "08:00 PM",
            "days_active": "Mon - Sat",
        },
        {
            "id": "fac-main-canteen",
            "name": "Srinivas Central Food Court",
            "category": "cafeteria",
            "building_id": "bldg-cafeteria",
            "location_id": "loc-food-court",
            "description": "Hygienic vegetarian and non-vegetarian food court with breakfast and lunch service.",
            "contact_phone": "+91 824 2274731",
            "contact_email": "canteen@srinivasgroup.com",
            "status": "open",
            "open_time": "07:30 AM",
            "close_time": "06:00 PM",
            "days_active": "All 7 Days",
        },
        {
            "id": "fac-health-dispensary",
            "name": "SIT Health & Emergency Care",
            "category": "clinic",
            "building_id": "bldg-main-admin",
            "location_id": "loc-health-center",
            "description": "Primary healthcare and emergency consultation facility with trained nursing staff.",
            "contact_phone": "+91 824 2274732",
            "contact_email": "health@srinivasgroup.com",
            "status": "open",
            "open_time": "09:00 AM",
            "close_time": "05:00 PM",
            "days_active": "Mon - Sat",
        },
        {
            "id": "fac-sports-gym",
            "name": "Srinivas Fitness & Sports Arena",
            "category": "sports",
            "building_id": "bldg-sports-complex",
            "location_id": "loc-indoor-badminton",
            "description": "Full gymnasium, multi-sports hall and outdoor athletic coaching facility.",
            "contact_phone": "+91 824 2274733",
            "contact_email": "sports@srinivasgroup.com",
            "status": "open",
            "open_time": "06:00 AM",
            "close_time": "07:30 PM",
            "days_active": "Mon - Sat",
        }
    ]

    for item in facilities_data:
        existing = db.query(m.Facility).filter(m.Facility.id == item["id"]).first()
        if not existing:
            fac = m.Facility(
                id=item["id"],
                name=item["name"],
                category=item["category"],
                building_id=item["building_id"],
                location_id=item["location_id"],
                description=item["description"],
                contact_phone=item["contact_phone"],
                contact_email=item["contact_email"],
            )
            db.add(fac)
            db.flush()

            fac_status = m.FacilityStatus(
                facility_id=fac.id,
                status=item["status"],
                open_time=item["open_time"],
                close_time=item["close_time"],
                days_active=item["days_active"],
                notice="Operating on normal academic schedule.",
                updated_by="System Initializer",
            )
            db.add(fac_status)
    db.commit()

    # 8. Seed Floors & Rooms for Indoor Module
    bldg_cs = db.query(m.Building).filter(m.Building.id == "bldg-cs-is").first()
    if bldg_cs:
        for f_num, f_name in [(0, "Ground Floor"), (1, "First Floor"), (2, "Second Floor")]:
            existing_f = db.query(m.Floor).filter(
                m.Floor.building_id == bldg_cs.id,
                m.Floor.floor_number == f_num
            ).first()
            if not existing_f:
                flr = m.Floor(
                    building_id=bldg_cs.id,
                    floor_number=f_num,
                    floor_name=f_name,
                    is_accessible=True,
                    has_restroom=True,
                    has_accessible_restroom=True,
                )
                db.add(flr)
                db.flush()

                # Add sample rooms per floor
                if f_num == 0:
                    db.add(m.Room(floor_id=flr.id, building_id=bldg_cs.id, room_code="CS-001", room_name="General Programming Lab 1", room_type="lab", department="CSE", capacity=45, is_accessible=True))
                    db.add(m.Room(floor_id=flr.id, building_id=bldg_cs.id, room_code="CS-002", room_name="Seminar Hall A", room_type="auditorium", department="CSE", capacity=120, is_accessible=True))
                elif f_num == 1:
                    db.add(m.Room(floor_id=flr.id, building_id=bldg_cs.id, room_code="CS-101", room_name="Lecture Hall 101", room_type="classroom", department="CSE", capacity=60, is_accessible=True))
                    db.add(m.Room(floor_id=flr.id, building_id=bldg_cs.id, room_code="CS-102", room_name="HOD Chamber & Faculty Room", room_type="hod_office", department="CSE", capacity=10, is_accessible=True))
                elif f_num == 2:
                    db.add(m.Room(floor_id=flr.id, building_id=bldg_cs.id, room_code="CS-204", room_name="AI & Robotics Research Lab", room_type="lab", department="CSE", capacity=40, is_accessible=True))
        db.commit()

    # 9. Seed Announcements
    existing_ann = db.query(m.Announcement).first()
    if not existing_ann:
        db.add(m.Announcement(
            title="Welcome to CampusIQ - SIT Valachil Spatial Navigator",
            content="Explore Srinivas Institute of Technology campus, find verified walking routes, check accessibility features, and report pathway issues in real-time.",
            level="info",
            is_active=True,
        ))
        db.add(m.Announcement(
            title="Scheduled Maintenance Notice",
            content="West stairway near CS Block under routine floor tile repair. Wheelchair ramp route is fully open and recommended.",
            level="warning",
            is_active=True,
        ))
        db.commit()


def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        print("Database initialized and sample data seeded successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
