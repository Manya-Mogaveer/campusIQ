from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "CampusIQ"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "campus-iq-super-secure-production-ready-jwt-secret-key-sit-valachil"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    # Defaults to SQLite for immediate local execution, seamlessly interchangeable with PostgreSQL
    DATABASE_URL: str = "sqlite:///./campusiq.db"

    # Default Campus Coordinates: Srinivas Institute of Technology, Valachil, Mangaluru (Verified OSM/Geocoded)
    CAMPUS_CENTER_LAT: float = 12.8746
    CAMPUS_CENTER_LNG: float = 74.9395
    CAMPUS_DEFAULT_ZOOM: int = 18

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # Seed Admin User
    ADMIN_EMAIL: str = "admin@srinivasgroup.com"
    ADMIN_PASSWORD: str = "AdminPassword123!"
    ADMIN_FULL_NAME: str = "SIT Campus Administrator"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )


settings = Settings()
