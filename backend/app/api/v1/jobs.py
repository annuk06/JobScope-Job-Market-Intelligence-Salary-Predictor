"""Jobs Data Explorer API endpoints."""
import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, or_

from app.core.database import get_db
from app.models.job import Job
from app.schemas.job import PaginatedJobsResponse, JobDetail, JobListItem

router = APIRouter()

@router.get("/jobs", response_model=PaginatedJobsResponse, summary="Search and filter job postings table")
def list_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search keyword in title, company, or skills"),
    role: Optional[str] = Query(None, description="Filter by role"),
    location: Optional[str] = Query(None, description="Filter by location"),
    experience_level: Optional[str] = Query(None, description="Filter by experience band"),
    is_remote: Optional[bool] = Query(None, description="Filter by remote work"),
    has_salary: Optional[bool] = Query(None, description="Filter by valid salary disclosure"),
    sort_by: str = Query("posting_date", description="Field to sort by: posting_date, annual_salary_avg, raw_title"),
    sort_order: str = Query("desc", description="Sort direction: asc or desc"),
    db: Session = Depends(get_db)
):
    query = db.query(Job)
    
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Job.raw_title.ilike(search_term),
                Job.company.ilike(search_term),
                Job.normalized_title.ilike(search_term)
            )
        )
        
    if role:
        query = query.filter(Job.normalized_title == role)
    if location:
        query = query.filter(Job.normalized_location == location)
    if experience_level:
        query = query.filter(Job.experience_level == experience_level)
    if is_remote is not None:
        query = query.filter(Job.is_remote == is_remote)
    if has_salary is not None:
        query = query.filter(Job.is_valid_salary == has_salary)
        
    total_count = query.count()
    
    # Sorting
    sort_col = getattr(Job, sort_by, Job.posting_date)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_col))
    else:
        query = query.order_by(desc(sort_col))
        
    # Pagination
    offset = (page - 1) * page_size
    records = query.offset(offset).limit(page_size).all()
    
    items = []
    for r in records:
        skills_names = [s.name for s in r.skills]
        items.append(JobListItem(
            id=r.id,
            job_id=r.job_id,
            raw_title=r.raw_title,
            normalized_title=r.normalized_title,
            company=r.company,
            raw_location=r.raw_location,
            normalized_location=r.normalized_location,
            is_remote=r.is_remote,
            experience_years=r.experience_years,
            experience_level=r.experience_level,
            employment_type=r.employment_type,
            annual_salary_avg=r.annual_salary_avg,
            annual_salary_min=r.annual_salary_min,
            annual_salary_max=r.annual_salary_max,
            standardized_currency=r.standardized_currency,
            is_valid_salary=r.is_valid_salary,
            posting_date=r.posting_date,
            skills=skills_names
        ))
        
    total_pages = math.ceil(total_count / page_size) if total_count > 0 else 1
    
    return PaginatedJobsResponse(
        items=items,
        total=total_count,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/jobs/{job_id}", response_model=JobDetail, summary="Single job record details")
def get_job_by_id(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(or_(Job.job_id == job_id, Job.id == int(job_id) if job_id.isdigit() else False)).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job record '{job_id}' not found.")
        
    skills_names = [s.name for s in job.skills]
    return JobDetail(
        id=job.id,
        job_id=job.job_id,
        raw_title=job.raw_title,
        normalized_title=job.normalized_title,
        company=job.company,
        raw_location=job.raw_location,
        normalized_location=job.normalized_location,
        is_remote=job.is_remote,
        experience_years=job.experience_years,
        experience_level=job.experience_level,
        employment_type=job.employment_type,
        raw_salary_min=job.raw_salary_min,
        raw_salary_max=job.raw_salary_max,
        raw_currency=job.raw_currency,
        raw_period=job.raw_period,
        annual_salary_avg=job.annual_salary_avg,
        annual_salary_min=job.annual_salary_min,
        annual_salary_max=job.annual_salary_max,
        standardized_currency=job.standardized_currency,
        is_valid_salary=job.is_valid_salary,
        salary_quality_note=job.salary_quality_note,
        posting_date=job.posting_date,
        source=job.source,
        created_at=job.created_at,
        skills=skills_names
    )
