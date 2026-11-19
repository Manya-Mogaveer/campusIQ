from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.schemas.building import BuildingResponse


class QRCheckpointCreate(BaseModel):
    code: str
    name: str
    building_id: Optional[str] = None
    floor_level: int = 0
    associated_node_id: Optional[str] = None
    lat: float
    lng: float
    description: Optional[str] = None
    orientation_guidance: Optional[str] = None


class QRCheckpointResponse(BaseModel):
    id: str
    code: str
    name: str
    building_id: Optional[str] = None
    floor_level: int
    associated_node_id: Optional[str] = None
    lat: float
    lng: float
    description: Optional[str] = None
    orientation_guidance: Optional[str] = None
    qr_image_url: Optional[str] = None
    created_at: datetime
    building: Optional[BuildingResponse] = None

    class Config:
        from_attributes = True
