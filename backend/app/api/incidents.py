from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_admin
from app.navigation.graph import graph_manager
from app.schemas.incident import IncidentCreate, IncidentStatusUpdate, IncidentResponse
import app.models as m

router = APIRouter(prefix="/incidents", tags=["Incident Reporting"])


@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def submit_incident_report(report_in: IncidentCreate, db: Session = Depends(get_db)):
    """Submits a campus infrastructure or accessibility issue report. Unverified by default."""
    report = m.IncidentReport(
        category=report_in.category,
        title=report_in.title,
        description=report_in.description,
        location_id=report_in.location_id,
        path_edge_id=report_in.path_edge_id,
        lat=report_in.lat,
        lng=report_in.lng,
        reporter_name=report_in.reporter_name or "Anonymous Campus Member",
        reporter_email=report_in.reporter_email,
        photo_url=report_in.photo_url,
        status="submitted",
        priority="medium",
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("", response_model=List[IncidentResponse])
def get_public_incidents(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
):
    """Returns list of active/verified campus incidents and advisories."""
    query = db.query(m.IncidentReport)
    if status_filter:
        query = query.filter(m.IncidentReport.status == status_filter)
    else:
        # By default show approved or in_progress public alerts
        query = query.filter(m.IncidentReport.status.in_(["submitted", "under_review", "approved", "in_progress"]))
    return query.order_by(m.IncidentReport.created_at.desc()).all()


@router.get("/admin/all", response_model=List[IncidentResponse])
def get_admin_incidents(
    status_filter: Optional[str] = Query(None),
    category_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: m.User = Depends(get_current_admin),
):
    """Admin endpoint: lists all submitted, in-review, and resolved incidents."""
    query = db.query(m.IncidentReport)
    if status_filter and status_filter.lower() != "all":
        query = query.filter(m.IncidentReport.status == status_filter.lower())
    if category_filter and category_filter.lower() != "all":
        query = query.filter(m.IncidentReport.category == category_filter.lower())

    return query.order_by(m.IncidentReport.created_at.desc()).all()


@router.patch("/admin/{incident_id}", response_model=IncidentResponse)
def update_incident_triage(
    incident_id: str,
    update_in: IncidentStatusUpdate,
    db: Session = Depends(get_db),
    admin: m.User = Depends(get_current_admin),
):
    """Admin triage: Approve, mark in-progress, or resolve incidents, syncing pathway accessibility."""
    incident = db.query(m.IncidentReport).filter(m.IncidentReport.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with ID '{incident_id}' not found.",
        )

    incident.status = update_in.status
    if update_in.priority:
        incident.priority = update_in.priority
    if update_in.admin_notes is not None:
        incident.admin_notes = update_in.admin_notes

    # If resolved, set resolved timestamp
    if update_in.status == "resolved":
        incident.resolved_at = datetime.now(timezone.utc)
        # Re-open any associated pathway
        if incident.path_edge_id:
            edge = db.query(m.PathEdge).filter(m.PathEdge.id == incident.path_edge_id).first()
            if edge:
                edge.is_blocked = False
                edge.block_reason = None
                graph_manager.build_graph(db)

    # If marked blocked upon approval
    elif update_in.mark_path_blocked and incident.path_edge_id:
        edge = db.query(m.PathEdge).filter(m.PathEdge.id == incident.path_edge_id).first()
        if edge:
            edge.is_blocked = True
            edge.block_reason = f"Blocked: {incident.title}"
            graph_manager.build_graph(db)

    db.commit()
    db.refresh(incident)
    return incident
