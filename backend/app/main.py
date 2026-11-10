import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.config import UPLOAD_DIR
from app.clock import init_clock, get_clock_status
from app.seed import seed_database
from app.scheduler import start_background_scheduler, stop_background_scheduler

from app.routers import (
    auth,
    complaints,
    supervisor,
    admin,
    audit,
    analytics,
    notifications,
    chat
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    print("Initializing CIVANTA backend services...")
    Base.metadata.create_all(bind=engine)
    init_clock()
    seed_database()
    start_background_scheduler()
    print("CIVANTA backend initialization complete. Ready for service.")
    yield
    # Shutdown sequence
    print("Shutting down CIVANTA background jobs...")
    stop_background_scheduler()

app = FastAPI(
    title="CIVANTA — Smart Grievance Management & Accountability System",
    description="Pilot Implementation for Karnataka State Police (KSP). Academic Demonstration Prototype.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for evidence attachments
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(complaints.router)
app.include_router(supervisor.router)
app.include_router(admin.router)
app.include_router(audit.router)
app.include_router(analytics.router)
app.include_router(notifications.router)
app.include_router(chat.router)

@app.get("/")
def root():
    return {
        "system": "CIVANTA — Smart Grievance Management & Accountability System",
        "tagline": "Every Complaint Matters. Every Action Counts.",
        "department": "Karnataka State Police (KSP Pilot)",
        "disclaimer": "Academic Demonstration Prototype. Does not decide legal offences or FIR registration.",
        "clock": get_clock_status(),
        "api_docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "civanta-backend"}
