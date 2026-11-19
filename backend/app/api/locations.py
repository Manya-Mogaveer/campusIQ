from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.location import LocationResponse
import app.models as m

router = APIRouter(prefix="/locations", tags=["Locations"])


@router.get("", response_model=List[LocationResponse])
def get_locations(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search query by name, code or tags"),
    accessible_only: bool = Query(False, description="Filter wheelchair accessible locations"),
    building_id: Optional[str] = Query(None, description="Filter by building"),
    db: Session = Depends(get_db),
):
    """Retrieves campus points of interest with multi-criteria filtering."""
    query = db.query(m.Location)

    if category and category.lower() != "all":
        query = query.filter(m.Location.category == category.lower())

    if building_id:
        query = query.filter(m.Location.building_id == building_id)

    if accessible_only:
        query = query.filter(m.Location.is_accessible == True)

    if search:
        search_pattern = f"%{search.lower()}%"
        query = query.filter(
            (m.Location.name.ilike(search_pattern)) |
            (m.Location.code.ilike(search_pattern)) |
            (m.Location.tags.ilike(search_pattern)) |
            (m.Location.description.ilike(search_pattern))
        )

    locations = query.order_by(m.Location.name.asc()).all()
    return locations


@router.get("/categories")
def get_location_categories(db: Session = Depends(get_db)):
    """Returns unique location categories with their item counts."""
    categories = [
        {"id": "all", "label": "All POIs", "count": db.query(m.Location).count()},
        {"id": "academic", "label": "Academic & Classes", "count": db.query(m.Location).filter(m.Location.category == "academic").count()},
        {"id": "admin", "label": "Administration & Offices", "count": db.query(m.Location).filter(m.Location.category == "admin").count()},
        {"id": "lab", "label": "Laboratories & Research", "count": db.query(m.Location).filter(m.Location.category == "lab").count()},
        {"id": "library", "label": "Libraries", "count": db.query(m.Location).filter(m.Location.category == "library").count()},
        {"id": "canteen", "label": "Cafeterias & Food", "count": db.query(m.Location).filter(m.Location.category == "canteen").count()},
        {"id": "sports", "label": "Sports & Gymnasium", "count": db.query(m.Location).filter(m.Location.category == "sports").count()},
        {"id": "medical", "label": "Health Center", "count": db.query(m.Location).filter(m.Location.category == "medical").count()},
        {"id": "gate", "label": "Campus Gates", "count": db.query(m.Location).filter(m.Location.category == "gate").count()},
    ]
    return categories


@router.get("/{location_id}", response_model=LocationResponse)
def get_location_by_id(location_id: str, db: Session = Depends(get_db)):
    """Retrieves specific location details."""
    loc = db.query(m.Location).filter(m.Location.id == location_id).first()
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location with ID '{location_id}' not found.",
        )
    return loc
