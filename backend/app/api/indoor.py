from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.indoor import FloorResponse, RoomResponse
import app.models as m

router = APIRouter(prefix="/indoor", tags=["Indoor Navigation & Floor Intelligence"])


@router.get("/buildings/{building_id}/floors", response_model=List[FloorResponse])
def get_building_floors(building_id: str, db: Session = Depends(get_db)):
    """Returns all floors and associated rooms for an academic or administrative building."""
    floors = db.query(m.Floor).filter(m.Floor.building_id == building_id).order_by(m.Floor.floor_number.asc()).all()
    return floors


@router.get("/rooms", response_model=List[RoomResponse])
def search_rooms(
    search: Optional[str] = Query(None, description="Search room by code, name or department"),
    building_id: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Searches indoor rooms and department facilities."""
    query = db.query(m.Room)
    if building_id:
        query = query.filter(m.Room.building_id == building_id)
    if department:
        query = query.filter(m.Room.department.ilike(f"%{department}%"))
    if search:
        pattern = f"%{search.lower()}%"
        query = query.filter(
            (m.Room.room_code.ilike(pattern)) |
            (m.Room.room_name.ilike(pattern)) |
            (m.Room.department.ilike(pattern))
        )
    return query.order_by(m.Room.room_code.asc()).all()
