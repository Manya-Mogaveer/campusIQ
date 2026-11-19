from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class BuildingBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    lat: float
    lng: float
    floors_count: int = 1
    has_elevator: bool = False
    has_ramp: bool = False
    image_url: Optional[str] = None


class BuildingCreate(BuildingBase):
    pass


class BuildingUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    floors_count: Optional[int] = None
    has_elevator: Optional[bool] = None
    has_ramp: Optional[bool] = None
    image_url: Optional[str] = None


class BuildingResponse(BuildingBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
