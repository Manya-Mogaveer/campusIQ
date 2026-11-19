from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_admin
from app.schemas.facility import FacilityResponse, FacilityStatusUpdate
import app.models as m

router = APIRouter(prefix="/facilities", tags=["Facility Intelligence"])


@router.get("", response_model=List[FacilityResponse])
def get_facilities(
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by operational status"),
    db: Session = Depends(get_db),
):
    """Lists campus facilities along with their real-time operational status."""
    query = db.query(m.Facility)
    if category and category.lower() != "all":
        query = query.filter(m.Facility.category == category.lower())

    facilities = query.all()

    if status and status.lower() != "all":
        facilities = [f for f in facilities if f.status and f.status.status == status.lower()]

    return facilities


@router.get("/{facility_id}", response_model=FacilityResponse)
def get_facility_by_id(facility_id: str, db: Session = Depends(get_db)):
    """Retrieves detailed operational intelligence for a single facility."""
    facility = db.query(m.Facility).filter(m.Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Facility with ID '{facility_id}' not found.",
        )
    return facility


@router.patch("/{facility_id}/status", response_model=FacilityResponse)
def update_facility_status(
    facility_id: str,
    status_in: FacilityStatusUpdate,
    db: Session = Depends(get_db),
    admin: m.User = Depends(get_current_admin),
):
    """Updates operational status for a facility (e.g. temporary maintenance closure)."""
    facility = db.query(m.Facility).filter(m.Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Facility with ID '{facility_id}' not found.",
        )

    if not facility.status:
        fac_status = m.FacilityStatus(
            facility_id=facility.id,
            status=status_in.status,
            notice=status_in.notice,
            updated_by=admin.full_name,
        )
        db.add(fac_status)
    else:
        facility.status.status = status_in.status
        if status_in.notice is not None:
            facility.status.notice = status_in.notice
        if status_in.open_time is not None:
            facility.status.open_time = status_in.open_time
        if status_in.close_time is not None:
            facility.status.close_time = status_in.close_time
        if status_in.days_active is not None:
            facility.status.days_active = status_in.days_active
        facility.status.updated_by = admin.full_name

    db.commit()
    db.refresh(facility)
    return facility
