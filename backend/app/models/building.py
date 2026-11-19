import uuid
from sqlalchemy import Column, String, Float, Integer, Text, Boolean
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.base import TimestampMixin


class Building(Base, TimestampMixin):
    __tablename__ = "buildings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), index=True, nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    floors_count = Column(Integer, default=1, nullable=False)
    has_elevator = Column(Boolean, default=False, nullable=False)
    has_ramp = Column(Boolean, default=False, nullable=False)
    image_url = Column(String(500), nullable=True)

    # Relationships
    locations = relationship("Location", back_populates="building", cascade="all, delete-orphan")
    floors = relationship("Floor", back_populates="building", cascade="all, delete-orphan")
    path_nodes = relationship("PathNode", back_populates="building")
    facilities = relationship("Facility", back_populates="building")
    checkpoints = relationship("QRCheckpoint", back_populates="building")

    def __repr__(self):
        return f"<Building {self.code} - {self.name}>"
