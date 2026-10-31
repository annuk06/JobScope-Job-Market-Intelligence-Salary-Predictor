"""Pydantic schemas for ML Salary Prediction."""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class SalaryPredictionRequest(BaseModel):
    role: str = Field(..., description="Target job role e.g. 'Backend Developer'")
    experience_years: float = Field(..., ge=0, le=40, description="Years of relevant experience")
    location: str = Field(..., description="Candidate tech location or Remote")
    skills: List[str] = Field(default_factory=list, description="List of technical skills possessed")
    employment_type: str = Field(default="Full-time", description="Employment arrangement")

class SalaryPredictionResult(BaseModel):
    predicted_annual_salary: float
    predicted_salary_lpa: str
    estimated_range_min: float
    estimated_range_max: float
    estimated_range_lpa: str
    currency: str = "INR"
    model_used: str
    model_mae: float
    model_r2: float
    input_profile: Dict[str, Any]
    limitations: List[str]
    disclaimer: str
