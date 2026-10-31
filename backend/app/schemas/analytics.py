"""Pydantic schemas for Analytics, KPIs, and Dashboard outputs."""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class FilterParams(BaseModel):
    role: Optional[str] = None
    location: Optional[str] = None
    experience_level: Optional[str] = None
    is_remote: Optional[bool] = None
    has_salary: Optional[bool] = None

class DashboardSummary(BaseModel):
    total_postings: int
    total_roles: int
    total_locations: int
    top_demanded_skills: List[Dict[str, Any]]
    median_annual_salary: Optional[float]
    mean_annual_salary: Optional[float]
    salary_disclosure_percentage: float
    total_valid_salary_records: int
    currency: str = "INR"

class RoleMetric(BaseModel):
    role: str
    posting_count: int
    market_share_percentage: float
    avg_annual_salary: Optional[float]
    median_annual_salary: Optional[float]
    salary_sample_size: int
    is_statistically_reliable: bool

class LocationMetric(BaseModel):
    location: str
    posting_count: int
    percentage: float
    avg_annual_salary: Optional[float]
    remote_percentage: float

class SkillDemandItem(BaseModel):
    skill: str
    count: int
    percentage_of_postings: float
    avg_salary_inr: Optional[float]
    salary_sample_size: int

class SkillCooccurrenceItem(BaseModel):
    skill_a: str
    skill_b: str
    cooccurrence_count: int

class SalaryDistributionBucket(BaseModel):
    bracket_label: str
    min_val: float
    max_val: float
    job_count: int
    percentage: float

class ExperienceSalaryMetric(BaseModel):
    experience_level: str
    avg_years: float
    job_count: int
    avg_annual_salary: Optional[float]
    median_annual_salary: Optional[float]

class RemoteComparisonMetric(BaseModel):
    work_mode: str
    job_count: int
    percentage: float
    avg_annual_salary: Optional[float]
