import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.base import TimestampMixin


class IncidentReport(Base, TimestampMixin):
    __tablename__ = "incident_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category = Column(String(50), nullable=False)  # blocked_pathway, damaged_pathway, accessibility_issue, facility_issue, incorrect_info, other
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    location_id = Column(String(36), ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    path_edge_id = Column(String(36), ForeignKey("path_edges.id", ondelete="SET NULL"), nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    status = Column(String(50), default="submitted", nullable=False)  # submitted, under_review, approved, in_progress, resolved, rejected
    priority = Column(String(20), default="medium", nullable=False)  # low, medium, high, critical
    reporter_name = Column(String(100), nullable=True)
    reporter_email = Column(String(100), nullable=True)
    photo_url = Column(String(500), nullable=True)
    admin_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    location = relationship("Location", back_populates="incidents")
    path_edge = relationship("PathEdge", back_populates="incidents")

    def __repr__(self):
        return f"<IncidentReport {self.title} [{self.status}]>"
