"""Analytics and Market Intelligence API endpoints."""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.analytics.engine import (
    get_role_analytics,
    get_location_analytics,
    get_skill_demand_analytics,
    get_skill_cooccurrences,
    get_salary_distribution,
    get_salary_by_experience,
    get_remote_vs_onsite,
    get_hiring_trends
)
from app.schemas.analytics import (
    RoleMetric,
    LocationMetric,
    SkillDemandItem,
    SkillCooccurrenceItem,
    SalaryDistributionBucket,
    ExperienceSalaryMetric,
    RemoteComparisonMetric,
    FilterParams
)

router = APIRouter()

@router.get("/analytics/roles", response_model=List[RoleMetric], summary="Job postings and salaries by role")
def get_roles(
    location: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None),
    is_remote: Optional[bool] = Query(None),
    has_salary: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    filters = FilterParams(location=location, experience_level=experience_level, is_remote=is_remote, has_salary=has_salary)
    return get_role_analytics(db, filters)

@router.get("/analytics/locations", response_model=List[LocationMetric], summary="Job postings and remote stats by location")
def get_locations(
    role: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None),
    has_salary: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    filters = FilterParams(role=role, experience_level=experience_level, has_salary=has_salary)
    return get_location_analytics(db, filters)

@router.get("/analytics/skills", response_model=List[SkillDemandItem], summary="Skill demand ranking and associated compensation")
def get_skills(
    limit: int = Query(25, ge=1, le=100),
    role: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return get_skill_demand_analytics(db, limit=limit, role=role, location=location)

@router.get("/analytics/skills/cooccurrence", response_model=List[SkillCooccurrenceItem], summary="Skill co-occurrence combinations")
def get_cooccurrences(
    limit: int = Query(15, ge=1, le=50),
    role: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return get_skill_cooccurrences(db, limit=limit, role=role)

@router.get("/analytics/salaries", summary="Comprehensive salary analytics breakdown")
def get_salaries(
    role: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None),
    is_remote: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    filters = FilterParams(role=role, location=location, experience_level=experience_level, is_remote=is_remote)
    return {
        "distribution": get_salary_distribution(db, filters),
        "by_experience": get_salary_by_experience(db, filters),
        "remote_comparison": get_remote_vs_onsite(db, filters)
    }

@router.get("/analytics/trends", summary="Monthly hiring volume and compensation trends")
def get_trends(
    role: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return get_hiring_trends(db, role=role)
