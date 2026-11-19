import uuid
from sqlalchemy import Column, String, Float, Integer, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.models.base import TimestampMixin


class PathNode(Base, TimestampMixin):
    __tablename__ = "path_nodes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    node_type = Column(String(50), default="junction", nullable=False)  # entrance, junction, pathway_point, gate, stair, ramp
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    elevation_meters = Column(Float, default=0.0, nullable=False)
    building_id = Column(String(36), ForeignKey("buildings.id", ondelete="SET NULL"), nullable=True)
    floor_level = Column(Integer, default=0, nullable=False)
    is_accessible = Column(Boolean, default=True, nullable=False)

    # Relationships
    building = relationship("Building", back_populates="path_nodes")

    def __repr__(self):
        return f"<PathNode {self.name} ({self.node_type})>"


class PathEdge(Base, TimestampMixin):
    __tablename__ = "path_edges"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    start_node_id = Column(String(36), ForeignKey("path_nodes.id", ondelete="CASCADE"), nullable=False)
    end_node_id = Column(String(36), ForeignKey("path_nodes.id", ondelete="CASCADE"), nullable=False)
    distance_meters = Column(Float, nullable=False)
    pathway_type = Column(String(50), default="paved", nullable=False)  # paved, road, walkway, stairs, ramp, indoor_corridor
    is_bidirectional = Column(Boolean, default=True, nullable=False)
    is_blocked = Column(Boolean, default=False, nullable=False)
    is_wheelchair_accessible = Column(Boolean, default=True, nullable=False)
    has_stairs = Column(Boolean, default=False, nullable=False)
    has_ramp = Column(Boolean, default=False, nullable=False)
    slope_degrees = Column(Float, default=0.0, nullable=False)
    block_reason = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)

    # Relationships
    start_node = relationship("PathNode", foreign_keys=[start_node_id])
    end_node = relationship("PathNode", foreign_keys=[end_node_id])
    incidents = relationship("IncidentReport", back_populates="path_edge")

    def __repr__(self):
        return f"<PathEdge {self.start_node_id} -> {self.end_node_id} ({self.distance_meters}m)>"
