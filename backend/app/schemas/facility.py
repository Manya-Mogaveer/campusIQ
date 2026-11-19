from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.schemas.building import BuildingResponse
from app.schemas.location import LocationResponse


class FacilityStatusResponse(BaseModel):
    id: str
    status: str
    open_time: Optional[str] = None
    close_time: Optional[str] = None
    days_active: str
    notice: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True


class FacilityResponse(BaseModel):
    id: str
    name: str
    category: str
    building_id: Optional[str] = None
    location_id: Optional[str] = None
    description: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    operating_hours: str
    created_at: datetime
    building: Optional[BuildingResponse] = None
    location: Optional[LocationResponse] = None
    status: Optional[FacilityStatusResponse] = None

    class Config:
        from_attributes = True


class FacilityStatusUpdate(BaseModel):
    status: str  # open, closed, maintenance, temporary_closure
    notice: Optional[str] = None
    open_time: Optional[str] = None
    close_time: Optional[str] = None
    days_active: Optional[str] = None
