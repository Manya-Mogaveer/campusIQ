from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.schemas.building import BuildingResponse


class LocationBase(BaseModel):
    name: str
    code: Optional[str] = None
    building_id: Optional[str] = None
    category: str
    floor_number: int = 0
    room_number: Optional[str] = None
    lat: float
    lng: float
    description: Optional[str] = None
    is_accessible: bool = True
    tags: Optional[str] = None
    image_url: Optional[str] = None


class LocationCreate(LocationBase):
    pass


class LocationUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    building_id: Optional[str] = None
    category: Optional[str] = None
    floor_number: Optional[int] = None
    room_number: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    description: Optional[str] = None
    is_accessible: Optional[bool] = None
    tags: Optional[str] = None
    image_url: Optional[str] = None


class LocationResponse(LocationBase):
    id: str
    created_at: datetime
    building: Optional[BuildingResponse] = None

    class Config:
        from_attributes = True
