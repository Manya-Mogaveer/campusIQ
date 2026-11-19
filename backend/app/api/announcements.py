from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
import app.models as m

router = APIRouter(prefix="/announcements", tags=["Announcements"])


@router.get("")
def get_active_announcements(db: Session = Depends(get_db)):
    """Returns active campus notifications and travel advisories."""
    return db.query(m.Announcement).filter(m.Announcement.is_active == True).order_by(m.Announcement.created_at.desc()).all()
