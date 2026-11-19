import uuid
from sqlalchemy import Column, String, Integer, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.base import TimestampMixin


class Floor(Base, TimestampMixin):
    __tablename__ = "floors"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    building_id = Column(String(36), ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)
    floor_number = Column(Integer, nullable=False)  # 0 = Ground, 1 = 1st Floor, -1 = Basement
    floor_name = Column(String(100), nullable=False)  # "Ground Floor", "First Floor"
    blueprint_url = Column(String(500), nullable=True)
    is_accessible = Column(Boolean, default=True, nullable=False)
    has_restroom = Column(Boolean, default=True, nullable=False)
    has_accessible_restroom = Column(Boolean, default=True, nullable=False)

    # Relationships
    building = relationship("Building", back_populates="floors")
    rooms = relationship("Room", back_populates="floor", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Floor {self.floor_name} (Bldg: {self.building_id})>"


class Room(Base, TimestampMixin):
    __tablename__ = "rooms"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    floor_id = Column(String(36), ForeignKey("floors.id", ondelete="CASCADE"), nullable=False)
    building_id = Column(String(36), ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)
    room_code = Column(String(50), index=True, nullable=False)  # e.g. "LH-101", "CS-LAB-3"
    room_name = Column(String(255), nullable=False)
    room_type = Column(String(50), default="classroom", nullable=False)  # classroom, lab, staff_room, hod_office, restroom, auditorium
    department = Column(String(100), nullable=True)  # CSE, ISE, ECE, ME, Civil, Basic Science
    capacity = Column(Integer, default=60, nullable=False)
    is_accessible = Column(Boolean, default=True, nullable=False)
    description = Column(Text, nullable=True)

    # Relationships
    floor = relationship("Floor", back_populates="rooms")

    def __repr__(self):
        return f"<Room {self.room_code} - {self.room_name}>"
