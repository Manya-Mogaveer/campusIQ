import uuid
from sqlalchemy import Column, String, Boolean
from app.database.session import Base
from app.models.base import TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student", nullable=False)  # admin, faculty, student, visitor
    is_active = Column(Boolean, default=True, nullable=False)

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
