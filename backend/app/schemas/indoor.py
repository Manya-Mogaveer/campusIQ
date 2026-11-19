from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class RoomResponse(BaseModel):
    id: str
    floor_id: str
    building_id: str
    room_code: str
    room_name: str
    room_type: str
    department: Optional[str] = None
    capacity: int
    is_accessible: bool
    description: Optional[str] = None

    class Config:
        from_attributes = True


class FloorResponse(BaseModel):
    id: str
    building_id: str
    floor_number: int
    floor_name: str
    blueprint_url: Optional[str] = None
    is_accessible: bool
    has_restroom: bool
    has_accessible_restroom: bool
    rooms: List[RoomResponse] = []

    class Config:
        from_attributes = True
