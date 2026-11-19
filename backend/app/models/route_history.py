import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime
from app.database.session import Base


class RouteHistory(Base):
    __tablename__ = "route_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    start_node_id = Column(String(36), nullable=False)
    end_node_id = Column(String(36), nullable=False)
    origin_name = Column(String(255), nullable=True)
    destination_name = Column(String(255), nullable=True)
    total_distance_meters = Column(Float, nullable=False)
    estimated_time_minutes = Column(Float, nullable=False)
    algorithm_used = Column(String(50), default="astar", nullable=False)
    wheelchair_mode = Column(Boolean, default=False, nullable=False)
    avoid_stairs = Column(Boolean, default=False, nullable=False)
    calculated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f"<RouteHistory {self.start_node_id} -> {self.end_node_id} ({self.total_distance_meters}m)>"
