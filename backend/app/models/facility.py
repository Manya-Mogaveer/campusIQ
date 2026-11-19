import uuid
from sqlalchemy import Column, String, Text, ForeignKey, Time
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.base import TimestampMixin


class Facility(Base, TimestampMixin):
    __tablename__ = "facilities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), index=True, nullable=False)
    category = Column(String(50), index=True, nullable=False)  # cafeteria, library, atm, clinic, sports, lab, admin
    building_id = Column(String(36), ForeignKey("buildings.id", ondelete="SET NULL"), nullable=True)
    location_id = Column(String(36), ForeignKey("locations.id", ondelete="SET NULL"), nullable=True)
    description = Column(Text, nullable=True)
    contact_phone = Column(String(50), nullable=True)
    contact_email = Column(String(100), nullable=True)
    operating_hours = Column(String(100), default="08:30 AM - 05:30 PM", nullable=False)

    # Relationships
    building = relationship("Building", back_populates="facilities")
    location = relationship("Location", back_populates="facility")
    status = relationship("FacilityStatus", back_populates="facility", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Facility {self.name} ({self.category})>"


class FacilityStatus(Base, TimestampMixin):
    __tablename__ = "facility_statuses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    facility_id = Column(String(36), ForeignKey("facilities.id", ondelete="CASCADE"), unique=True, nullable=False)
    status = Column(String(50), default="open", nullable=False)  # open, closed, maintenance, temporary_closure
    open_time = Column(String(20), default="08:30", nullable=True)
    close_time = Column(String(20), default="17:30", nullable=True)
    days_active = Column(String(100), default="Monday to Saturday", nullable=False)
    notice = Column(String(255), nullable=True)
    updated_by = Column(String(255), nullable=True)

    # Relationships
    facility = relationship("Facility", back_populates="status")

    def __repr__(self):
        return f"<FacilityStatus {self.facility_id}: {self.status}>"
