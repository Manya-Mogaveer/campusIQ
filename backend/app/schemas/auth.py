from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = "student"
    exp: Optional[int] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "student"


class UserLogin(BaseModel):
    username: EmailStr  # or email
    password: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
