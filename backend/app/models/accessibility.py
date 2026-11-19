import uuid
from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from app.database.session import Base
from app.models.base import TimestampMixin


class AccessibilityFeature(Base, TimestampMixin):
    __tablename__ = "accessibility_features"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    building_id = Column(String(36), ForeignKey("buildings.id", ondelete="CASCADE"), nullable=True)
    location_id = Column(String(36), ForeignKey("locations.id", ondelete="CASCADE"), nullable=True)
    path_edge_id = Column(String(36), ForeignKey("path_edges.id", ondelete="CASCADE"), nullable=True)
    feature_type = Column(String(50), nullable=False)  # ramp, elevator, tactile_paving, accessible_toilet, wide_doorway, braille_signage
    description = Column(Text, nullable=True)
    is_operational = Column(Boolean, default=True, nullable=False)
    verified = Column(Boolean, default=True, nullable=False)

    def __repr__(self):
        return f"<AccessibilityFeature {self.feature_type} (Verified: {self.verified})>"
