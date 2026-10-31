"""Health and readiness check endpoint."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db
from app.core.config import settings
from app.ml.predict import get_model_metadata

router = APIRouter()

@router.get("/health", summary="Application health status")
def get_health_status(db: Session = Depends(get_db)):
    """Checks database connectivity, ML model availability, and platform uptime."""
    # Check DB
    db_ok = False
    total_jobs = 0
    try:
        total_jobs = db.execute(text("SELECT COUNT(*) FROM jobs")).scalar() or 0
        db_ok = True
    except Exception:
        db_ok = False
        
    # Check ML model
    model_ok = settings.MODEL_PATH.exists()
    metadata = get_model_metadata()
    
    return {
        "status": "healthy" if (db_ok and model_ok) else "degraded",
        "database_connected": db_ok,
        "total_jobs_in_db": total_jobs,
        "model_loaded": model_ok,
        "champion_model": metadata.get("selected_model", "Unknown"),
        "version": settings.VERSION
    }
