"""Pydantic schemas for Skill Gap Analysis."""
from typing import List, Optional
from pydantic import BaseModel, Field

class SkillGapRequest(BaseModel):
    target_role: str = Field(..., description="Target job role e.g. Frontend Developer")
    user_skills: List[str] = Field(..., description="Candidate's current technical skills")
    location: Optional[str] = Field(None, description="Optional target location filter")

class MissingSkillItem(BaseModel):
    skill: str
    frequency_count: int
    frequency_percentage: float
    importance_tier: str # "Essential (>50%)", "Recommended (25-50%)", "Nice to Have (<25%)"
    avg_salary_with_skill_inr: Optional[float] = None

class SkillGapResponse(BaseModel):
    target_role: str
    matched_skills: List[str]
    missing_skills: List[MissingSkillItem]
    match_percentage: float
    total_role_postings_evaluated: int
    evidence_checklist: List[str]
    disclaimer: str
