import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, DateTime
from app.database.session import Base
from app.models.base import TimestampMixin


class Announcement(Base, TimestampMixin):
    __tablename__ = "announcements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    level = Column(String(20), default="info", nullable=False)  # info, warning, alert, emergency
    starts_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    target_audience = Column(String(50), default="all", nullable=False)  # all, students, faculty, visitors

    def __repr__(self):
        return f"<Announcement {self.title} [{self.level}]>"
