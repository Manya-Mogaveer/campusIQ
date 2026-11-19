from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class IncidentCreate(BaseModel):
    category: str
    title: str
    description: str
    location_id: Optional[str] = None
    path_edge_id: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    reporter_name: Optional[str] = None
    reporter_email: Optional[str] = None
    photo_url: Optional[str] = None


class IncidentStatusUpdate(BaseModel):
    status: str  # under_review, approved, in_progress, resolved, rejected
    priority: Optional[str] = None
    admin_notes: Optional[str] = None
    mark_path_blocked: Optional[bool] = None  # Admin option to toggle path block


class IncidentResponse(BaseModel):
    id: str
    category: str
    title: str
    description: str
    location_id: Optional[str] = None
    path_edge_id: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    status: str
    priority: str
    reporter_name: Optional[str] = None
    reporter_email: Optional[str] = None
    photo_url: Optional[str] = None
    admin_notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
