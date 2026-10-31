"""Skill Gap Analyzer engine."""
from typing import List, Optional
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.job import Job, job_skills_table
from app.models.skill import Skill
from app.data_pipeline.cleaner import CANONICAL_SKILLS
from app.schemas.skill_gap import SkillGapRequest, SkillGapResponse, MissingSkillItem

def canonicalize_user_skill(raw_skill: str) -> str:
    """Canonicalize candidate input skill."""
    cleaned = raw_skill.strip().lower()
    return CANONICAL_SKILLS.get(cleaned, raw_skill.strip().title())

def analyze_skill_gap(db: Session, request: SkillGapRequest) -> SkillGapResponse:
    """
    Computes empirical skill gap by comparing candidate skills against actual
    job postings for the selected role in the database.
    """
    query = db.query(Job).filter(Job.normalized_title == request.target_role)
    if request.location:
        query = query.filter(Job.normalized_location == request.location)
        
    total_postings = query.count()
    if total_postings == 0:
        # Fallback to general role search without location constraint
        query = db.query(Job).filter(Job.normalized_title == request.target_role)
        total_postings = query.count()
        
    if total_postings == 0:
        return SkillGapResponse(
            target_role=request.target_role,
            matched_skills=[],
            missing_skills=[],
            match_percentage=0.0,
            total_role_postings_evaluated=0,
            evidence_checklist=[],
            disclaimer="No job postings found for this target role in the current dataset."
        )
        
    subq = query.with_entities(Job.id).scalar_subquery()
    
    # Get top skills demanded for this target role
    role_skills_query = (
        db.query(Skill.id, Skill.name, func.count(job_skills_table.c.job_id).label("cnt"))
        .join(job_skills_table, Skill.id == job_skills_table.c.skill_id)
        .filter(job_skills_table.c.job_id.in_(subq))
        .group_by(Skill.id, Skill.name)
        .order_by(desc("cnt"))
        .limit(20)
        .all()
    )
    
    # Normalize candidate's current skills
    user_skills_canon = set(canonicalize_user_skill(s) for s in request.user_skills if s.strip())
    
    matched = []
    missing = []
    
    for s_id, s_name, count in role_skills_query:
        freq_pct = round((count / total_postings) * 100, 1)
        
        # Calculate avg salary for postings with this skill
        salaries = (
            db.query(Job.annual_salary_avg)
            .join(job_skills_table, Job.id == job_skills_table.c.job_id)
            .filter(
                job_skills_table.c.skill_id == s_id,
                Job.is_valid_salary == True,
                Job.id.in_(subq)
            )
            .all()
        )
        sal_vals = [s[0] for s in salaries if s[0] is not None]
        avg_sal = round(float(np.mean(sal_vals)), 2) if len(sal_vals) >= 3 else None
        
        if s_name in user_skills_canon:
            matched.append(s_name)
        else:
            tier = "Essential (>50%)" if freq_pct >= 50 else ("Recommended (25-50%)" if freq_pct >= 25 else "Nice to Have (<25%)")
            missing.append(MissingSkillItem(
                skill=s_name,
                frequency_count=count,
                frequency_percentage=freq_pct,
                importance_tier=tier,
                avg_salary_with_skill_inr=avg_sal
            ))
            
    # Match percentage based on top essential & recommended skills for role
    top_role_skills = [name for _, name, _ in role_skills_query[:10]]
    if top_role_skills:
        overlap = len([s for s in top_role_skills if s in user_skills_canon])
        match_score = round((overlap / len(top_role_skills)) * 100, 1)
    else:
        match_score = 0.0
        
    # Generate action checklist
    checklist = [
        f"Prioritize high-frequency requirement: '{m.skill}' (appears in {m.frequency_percentage}% of {request.target_role} postings)."
        for m in missing[:5]
    ]
    
    disclaimer = (
        "Notice: Missing skills indicate differences from observed job postings in this dataset, "
        "not definitive proof that you are unqualified. Job descriptions often list broader toolsets "
        "than daily workflows require."
    )
    
    return SkillGapResponse(
        target_role=request.target_role,
        matched_skills=matched,
        missing_skills=missing,
        match_percentage=match_score,
        total_role_postings_evaluated=total_postings,
        evidence_checklist=checklist,
        disclaimer=disclaimer
    )
