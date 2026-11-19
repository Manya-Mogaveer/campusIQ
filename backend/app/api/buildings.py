from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.building import BuildingResponse
import app.models as m

router = APIRouter(prefix="/buildings", tags=["Buildings"])


@router.get("", response_model=List[BuildingResponse])
def get_buildings(db: Session = Depends(get_db)):
    """Returns all campus buildings with metadata and coordinates."""
    buildings = db.query(m.Building).order_by(m.Building.name.asc()).all()
    return buildings


@router.get("/{building_id}", response_model=BuildingResponse)
def get_building_by_id(building_id: str, db: Session = Depends(get_db)):
    """Returns detailed information for a specific building."""
    building = db.query(m.Building).filter(m.Building.id == building_id).first()
    if not building:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Building with ID '{building_id}' not found.",
        )
    return building
