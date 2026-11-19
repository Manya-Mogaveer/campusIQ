from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.api.deps import get_current_user
from app.schemas.auth import Token, UserCreate, UserLogin, UserResponse
import app.models as m

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Registers a new user on the campus platform."""
    existing = db.query(m.User).filter(m.User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    # Restrict direct admin registration via public endpoint
    role = "student"
    if user_in.role in ["student", "faculty", "visitor"]:
        role = user_in.role

    new_user = m.User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=role,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    db: Session = Depends(get_db),
):
    """Authenticates a user and returns a signed JWT access token. Accepts JSON or Form Data."""
    username = None
    password = None

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            username = body.get("username") or body.get("email")
            password = body.get("password")
        except Exception:
            pass
    else:
        try:
            form = await request.form()
            username = form.get("username")
            password = form.get("password")
        except Exception:
            pass

    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username/email and password are required.",
        )

    user = db.query(m.User).filter(m.User.email == username.lower()).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Contact campus administration.",
        )

    access_token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: m.User = Depends(get_current_user)):
    """Returns profile information for the authenticated user."""
    return current_user
