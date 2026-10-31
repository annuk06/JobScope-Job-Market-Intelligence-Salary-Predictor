"""Pydantic schemas for Job Postings and Data Explorer."""
from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel

class JobSkillSchema(BaseModel):
    id: int
    name: str

class JobListItem(BaseModel):
    id: int
    job_id: str
    raw_title: str
    normalized_title: str
    company: str
    raw_location: Optional[str]
    normalized_location: str
    is_remote: bool
    experience_years: float
    experience_level: str
    employment_type: str
    annual_salary_avg: Optional[float]
    annual_salary_min: Optional[float]
    annual_salary_max: Optional[float]
    standardized_currency: str
    is_valid_salary: bool
    posting_date: Optional[date]
    skills: List[str]

class JobDetail(JobListItem):
    raw_salary_min: Optional[float]
    raw_salary_max: Optional[float]
    raw_currency: Optional[str]
    raw_period: Optional[str]
    salary_quality_note: Optional[str]
    source: str
    created_at: datetime

class PaginatedJobsResponse(BaseModel):
    items: List[JobListItem]
    total: int
    page: int
    page_size: int
    total_pages: int
