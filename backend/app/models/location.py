import uuid
from sqlalchemy import Column, String, Float, Integer, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.base import TimestampMixin


class Location(Base, TimestampMixin):
    __tablename__ = "locations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), index=True, nullable=False)
    code = Column(String(50), index=True, nullable=True)
    building_id = Column(String(36), ForeignKey("buildings.id", ondelete="SET NULL"), nullable=True)
    category = Column(String(50), index=True, nullable=False)  # academic, admin, lab, library, canteen, sports, hostel, gate, parking, medical
    floor_number = Column(Integer, default=0, nullable=False)
    room_number = Column(String(50), nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    is_accessible = Column(Boolean, default=True, nullable=False)
    tags = Column(String(255), nullable=True)  # comma separated keywords for search
    image_url = Column(String(500), nullable=True)

    # Relationships
    building = relationship("Building", back_populates="locations")
    facility = relationship("Facility", back_populates="location", uselist=False)
    incidents = relationship("IncidentReport", back_populates="location")

    def __repr__(self):
        return f"<Location {self.name} ({self.category})>"
