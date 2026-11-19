import uuid
from sqlalchemy import Column, String, Float, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.base import TimestampMixin


class QRCheckpoint(Base, TimestampMixin):
    __tablename__ = "qr_checkpoints"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(50), unique=True, index=True, nullable=False)  # e.g., SIT-MAIN-LOBBY-01
    name = Column(String(255), nullable=False)
    building_id = Column(String(36), ForeignKey("buildings.id", ondelete="SET NULL"), nullable=True)
    floor_level = Column(Integer, default=0, nullable=False)
    associated_node_id = Column(String(36), ForeignKey("path_nodes.id", ondelete="SET NULL"), nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    orientation_guidance = Column(Text, nullable=True)  # "Facing North towards Principal Office"
    qr_image_url = Column(String(500), nullable=True)

    # Relationships
    building = relationship("Building", back_populates="checkpoints")
    associated_node = relationship("PathNode")

    def __repr__(self):
        return f"<QRCheckpoint {self.code} - {self.name}>"
