from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.database.init_db import seed_database
from app.navigation.graph import graph_manager
from app.api import (
    auth,
    buildings,
    locations,
    navigation,
    facilities,
    incidents,
    qr,
    admin,
    announcements,
    indoor,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist, seed initial data, and build the navigation graph
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        graph_manager.build_graph(db)
        print(f"[CampusIQ] Successfully built navigation graph: {len(graph_manager.graph.nodes)} nodes, {len(graph_manager.graph.edges)} edges.")
    finally:
        db.close()
    yield
    # Shutdown logic if any
    print("[CampusIQ] Shutting down application.")


app = FastAPI(
    title="CampusIQ API - Srinivas Institute of Technology",
    description="Intelligent Campus Navigation & Spatial Awareness Platform Backend REST APIs",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Modular API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(buildings.router, prefix=settings.API_V1_STR)
app.include_router(locations.router, prefix=settings.API_V1_STR)
app.include_router(navigation.router, prefix=settings.API_V1_STR)
app.include_router(facilities.router, prefix=settings.API_V1_STR)
app.include_router(incidents.router, prefix=settings.API_V1_STR)
app.include_router(qr.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(announcements.router, prefix=settings.API_V1_STR)
app.include_router(indoor.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "platform": "CampusIQ",
        "institution": "Srinivas Institute of Technology, Valachil, Mangaluru, Karnataka, India",
        "status": "operational",
        "api_docs": "/docs",
        "center_coordinates": {
            "latitude": settings.CAMPUS_CENTER_LAT,
            "longitude": settings.CAMPUS_CENTER_LNG,
        },
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "graph_nodes": len(graph_manager.graph.nodes),
        "graph_edges": len(graph_manager.graph.edges),
    }
