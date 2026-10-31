"""Skill Gap Analysis API endpoint."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.skill_gap import SkillGapRequest, SkillGapResponse
from app.analytics.skill_gap import analyze_skill_gap

router = APIRouter()

@router.post("/analyze/skill-gap", response_model=SkillGapResponse, summary="Analyze candidate skill gaps for target role")
def perform_skill_gap_analysis(request: SkillGapRequest, db: Session = Depends(get_db)):
    """
    Evaluates candidate's current technical stack against live requirements
    in database job postings for the selected role.
    """
    return analyze_skill_gap(db, request)
