"""Executive Dashboard API endpoints."""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.analytics.engine import get_dashboard_summary
from app.schemas.analytics import DashboardSummary, FilterParams

router = APIRouter()

@router.get("/dashboard/summary", response_model=DashboardSummary, summary="Executive Dashboard KPIs")
def get_summary(
    role: Optional[str] = Query(None, description="Filter by canonical job role"),
    location: Optional[str] = Query(None, description="Filter by tech location"),
    experience_level: Optional[str] = Query(None, description="Filter by seniority band"),
    is_remote: Optional[bool] = Query(None, description="Filter by remote work flag"),
    has_salary: Optional[bool] = Query(None, description="Filter by salary disclosure"),
    db: Session = Depends(get_db)
):
    filters = FilterParams(
        role=role,
        location=location,
        experience_level=experience_level,
        is_remote=is_remote,
        has_salary=has_salary
    )
    return get_dashboard_summary(db, filters)
