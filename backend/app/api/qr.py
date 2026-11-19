import io
import base64
import qrcode
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_admin
from app.schemas.qr import QRCheckpointCreate, QRCheckpointResponse
import app.models as m

router = APIRouter(prefix="/qr", tags=["QR Checkpoints"])


def generate_qr_base64(data: str) -> str:
    """Generates a PNG base64 data URI of the QR code."""
    qr = qrcode.QRCode(
        version=1,
        box_size=10,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0a192f", back_color="white")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"


@router.get("", response_model=List[QRCheckpointResponse])
def get_all_checkpoints(db: Session = Depends(get_db)):
    """Returns all registered physical campus checkpoints."""
    return db.query(m.QRCheckpoint).all()


@router.get("/{code}", response_model=QRCheckpointResponse)
def get_checkpoint_by_code(code: str, db: Session = Depends(get_db)):
    """Resolves a scanned or manually entered QR checkpoint identifier."""
    clean_code = code.strip().upper()
    checkpoint = db.query(m.QRCheckpoint).filter(
        (m.QRCheckpoint.code == clean_code) |
        (m.QRCheckpoint.id == code)
    ).first()

    if not checkpoint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Checkpoint '{code}' not recognized in SIT campus registry.",
        )

    # Attach live QR image if missing
    if not checkpoint.qr_image_url:
        checkpoint.qr_image_url = generate_qr_base64(checkpoint.code)

    return checkpoint


@router.post("/admin", response_model=QRCheckpointResponse, status_code=status.HTTP_201_CREATED)
def create_checkpoint(
    cp_in: QRCheckpointCreate,
    db: Session = Depends(get_db),
    admin: m.User = Depends(get_current_admin),
):
    """Admin endpoint to create a new QR orientation point."""
    existing = db.query(m.QRCheckpoint).filter(m.QRCheckpoint.code == cp_in.code.upper()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Checkpoint code '{cp_in.code}' already exists.",
        )

    qr_data = generate_qr_base64(cp_in.code.upper())

    cp = m.QRCheckpoint(
        code=cp_in.code.upper(),
        name=cp_in.name,
        building_id=cp_in.building_id,
        floor_level=cp_in.floor_level,
        associated_node_id=cp_in.associated_node_id,
        lat=cp_in.lat,
        lng=cp_in.lng,
        description=cp_in.description,
        orientation_guidance=cp_in.orientation_guidance,
        qr_image_url=qr_data,
    )
    db.add(cp)
    db.commit()
    db.refresh(cp)
    return cp
