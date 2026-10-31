"""Analytics computation engine utilizing database queries and pandas aggregations."""
from typing import Dict, Any, List, Optional
import json
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, desc

from app.models.job import Job, job_skills_table
from app.models.skill import Skill
from app.schemas.analytics import (
    FilterParams,
    DashboardSummary,
    RoleMetric,
    LocationMetric,
    SkillDemandItem,
    SkillCooccurrenceItem,
    SalaryDistributionBucket,
    ExperienceSalaryMetric,
    RemoteComparisonMetric
)

def apply_filters_to_query(query, filters: Optional[FilterParams]):
    """Applies common filters to a SQLAlchemy Job query."""
    if not filters:
        return query
    if filters.role:
        query = query.filter(Job.normalized_title == filters.role)
    if filters.location:
        query = query.filter(Job.normalized_location == filters.location)
    if filters.experience_level:
        query = query.filter(Job.experience_level == filters.experience_level)
    if filters.is_remote is not None:
        query = query.filter(Job.is_remote == filters.is_remote)
    if filters.has_salary is not None:
        if filters.has_salary:
            query = query.filter(Job.is_valid_salary == True)
        else:
            query = query.filter(Job.is_valid_salary == False)
    return query

def get_dashboard_summary(db: Session, filters: Optional[FilterParams] = None) -> DashboardSummary:
    """Calculates top-level executive KPIs strictly from the loaded database."""
    base_query = db.query(Job)
    filtered_query = apply_filters_to_query(base_query, filters)
    
    total_postings = filtered_query.count()
    if total_postings == 0:
        return DashboardSummary(
            total_postings=0,
            total_roles=0,
            total_locations=0,
            top_demanded_skills=[],
            median_annual_salary=None,
            mean_annual_salary=None,
            salary_disclosure_percentage=0.0,
            total_valid_salary_records=0,
            currency="INR"
        )
        
    total_roles = filtered_query.with_entities(func.count(distinct(Job.normalized_title))).scalar() or 0
    total_locations = filtered_query.with_entities(func.count(distinct(Job.normalized_location))).scalar() or 0
    
    # Salary metrics
    salary_query = filtered_query.filter(Job.is_valid_salary == True)
    valid_salary_count = salary_query.count()
    salary_disclosure_pct = round((valid_salary_count / total_postings) * 100, 2)
    
    salaries = [r[0] for r in salary_query.with_entities(Job.annual_salary_avg).all() if r[0] is not None]
    if salaries:
        mean_sal = round(float(np.mean(salaries)), 2)
        median_sal = round(float(np.median(salaries)), 2)
    else:
        mean_sal = None
        median_sal = None
        
    # Top demanded skills
    subquery = filtered_query.with_entities(Job.id).scalar_subquery()
    top_skills_query = (
        db.query(Skill.name, func.count(job_skills_table.c.job_id).label("skill_count"))
        .join(job_skills_table, Skill.id == job_skills_table.c.skill_id)
        .filter(job_skills_table.c.job_id.in_(subquery))
        .group_by(Skill.id, Skill.name)
        .order_by(desc("skill_count"))
        .limit(6)
        .all()
    )
    
    top_skills = [
        {
            "skill": name,
            "count": count,
            "percentage": round((count / total_postings) * 100, 1)
        }
        for name, count in top_skills_query
    ]
    
    return DashboardSummary(
        total_postings=total_postings,
        total_roles=total_roles,
        total_locations=total_locations,
        top_demanded_skills=top_skills,
        median_annual_salary=median_sal,
        mean_annual_salary=mean_sal,
        salary_disclosure_percentage=salary_disclosure_pct,
        total_valid_salary_records=valid_salary_count,
        currency="INR"
    )

def get_role_analytics(db: Session, filters: Optional[FilterParams] = None) -> List[RoleMetric]:
    """Role breakdown with posting counts and salary distributions."""
    query = apply_filters_to_query(db.query(Job), filters)
    total_postings = query.count()
    if total_postings == 0:
        return []
        
    roles_agg = (
        query.with_entities(
            Job.normalized_title,
            func.count(Job.id).label("cnt")
        )
        .group_by(Job.normalized_title)
        .order_by(desc("cnt"))
        .all()
    )
    
    result = []
    for role_name, count in roles_agg:
        # Salary stats for role
        role_salaries = [
            r[0] for r in query.filter(Job.normalized_title == role_name, Job.is_valid_salary == True)
            .with_entities(Job.annual_salary_avg).all() if r[0] is not None
        ]
        sample_size = len(role_salaries)
        avg_sal = round(float(np.mean(role_salaries)), 2) if sample_size > 0 else None
        med_sal = round(float(np.median(role_salaries)), 2) if sample_size > 0 else None
        
        result.append(RoleMetric(
            role=role_name,
            posting_count=count,
            market_share_percentage=round((count / total_postings) * 100, 2),
            avg_annual_salary=avg_sal,
            median_annual_salary=med_sal,
            salary_sample_size=sample_size,
            is_statistically_reliable=sample_size >= 25
        ))
    return result

def get_location_analytics(db: Session, filters: Optional[FilterParams] = None) -> List[LocationMetric]:
    """Location distribution and remote availability."""
    query = apply_filters_to_query(db.query(Job), filters)
    total_postings = query.count()
    if total_postings == 0:
        return []
        
    locs = (
        query.with_entities(
            Job.normalized_location,
            func.count(Job.id).label("cnt")
        )
        .group_by(Job.normalized_location)
        .order_by(desc("cnt"))
        .all()
    )
    
    results = []
    for loc_name, count in locs:
        salaries = [
            r[0] for r in query.filter(Job.normalized_location == loc_name, Job.is_valid_salary == True)
            .with_entities(Job.annual_salary_avg).all() if r[0] is not None
        ]
        avg_sal = round(float(np.mean(salaries)), 2) if salaries else None
        
        remote_cnt = query.filter(Job.normalized_location == loc_name, Job.is_remote == True).count()
        remote_pct = round((remote_cnt / count) * 100, 1)
        
        results.append(LocationMetric(
            location=loc_name,
            posting_count=count,
            percentage=round((count / total_postings) * 100, 2),
            avg_annual_salary=avg_sal,
            remote_percentage=remote_pct
        ))
    return results

def get_skill_demand_analytics(
    db: Session, 
    limit: int = 25, 
    role: Optional[str] = None, 
    location: Optional[str] = None
) -> List[SkillDemandItem]:
    """Ranks most in-demand skills and associates compensation benchmarks."""
    job_q = db.query(Job)
    if role:
        job_q = job_q.filter(Job.normalized_title == role)
    if location:
        job_q = job_q.filter(Job.normalized_location == location)
        
    total_jobs = job_q.count()
    if total_jobs == 0:
        return []
        
    subq = job_q.with_entities(Job.id).scalar_subquery()
    
    skills_query = (
        db.query(Skill.id, Skill.name, func.count(job_skills_table.c.job_id).label("skill_count"))
        .join(job_skills_table, Skill.id == job_skills_table.c.skill_id)
        .filter(job_skills_table.c.job_id.in_(subq))
        .group_by(Skill.id, Skill.name)
        .order_by(desc("skill_count"))
        .limit(limit)
        .all()
    )
    
    results = []
    for skill_id, skill_name, count in skills_query:
        # Calculate salary for jobs requiring this skill
        salaries = (
            db.query(Job.annual_salary_avg)
            .join(job_skills_table, Job.id == job_skills_table.c.job_id)
            .filter(
                job_skills_table.c.skill_id == skill_id,
                Job.is_valid_salary == True,
                Job.id.in_(subq)
            )
            .all()
        )
        sal_vals = [s[0] for s in salaries if s[0] is not None]
        avg_sal = round(float(np.mean(sal_vals)), 2) if len(sal_vals) >= 5 else None
        
        results.append(SkillDemandItem(
            skill=skill_name,
            count=count,
            percentage_of_postings=round((count / total_jobs) * 100, 2),
            avg_salary_inr=avg_sal,
            salary_sample_size=len(sal_vals)
        ))
    return results

def get_skill_cooccurrences(db: Session, limit: int = 15, role: Optional[str] = None) -> List[SkillCooccurrenceItem]:
    """Finds frequently co-occurring skill pairs."""
    job_subq = db.query(Job.id)
    if role:
        job_subq = job_subq.filter(Job.normalized_title == role)
    job_ids_sub = job_subq.scalar_subquery()
    
    # Query pairs
    from sqlalchemy.orm import aliased
    js1 = aliased(job_skills_table)
    js2 = aliased(job_skills_table)
    s1 = aliased(Skill)
    s2 = aliased(Skill)
    
    pairs = (
        db.query(
            s1.name.label("name1"),
            s2.name.label("name2"),
            func.count().label("freq")
        )
        .join(js1, s1.id == js1.c.skill_id)
        .join(js2, (js1.c.job_id == js2.c.job_id) & (js1.c.skill_id < js2.c.skill_id))
        .join(s2, js2.c.skill_id == s2.id)
        .filter(js1.c.job_id.in_(job_ids_sub))
        .group_by("name1", "name2")
        .order_by(desc("freq"))
        .limit(limit)
        .all()
    )
    
    return [
        SkillCooccurrenceItem(
            skill_a=r.name1,
            skill_b=r.name2,
            cooccurrence_count=r.freq
        )
        for r in pairs
    ]

def get_salary_distribution(db: Session, filters: Optional[FilterParams] = None) -> List[SalaryDistributionBucket]:
    """Computes salary distribution histogram across brackets."""
    query = apply_filters_to_query(db.query(Job), filters).filter(Job.is_valid_salary == True)
    salaries = [r[0] for r in query.with_entities(Job.annual_salary_avg).all() if r[0] is not None]
    total_valid = len(salaries)
    
    if total_valid == 0:
        return []
        
    brackets = [
        ("< 6 LPA", 0, 600000),
        ("6 - 12 LPA", 600000, 1200000),
        ("12 - 20 LPA", 1200000, 2000000),
        ("20 - 30 LPA", 2000000, 3000000),
        ("30 - 45 LPA", 3000000, 4500000),
        ("45+ LPA", 4500000, float("inf"))
    ]
    
    results = []
    sal_arr = np.array(salaries)
    for label, low, high in brackets:
        if high == float("inf"):
            count = int(np.sum(sal_arr >= low))
        else:
            count = int(np.sum((sal_arr >= low) & (sal_arr < high)))
            
        results.append(SalaryDistributionBucket(
            bracket_label=label,
            min_val=low,
            max_val=high if high != float("inf") else 50000000,
            job_count=count,
            percentage=round((count / total_valid) * 100, 2)
        ))
    return results

def get_salary_by_experience(db: Session, filters: Optional[FilterParams] = None) -> List[ExperienceSalaryMetric]:
    """Computes compensation trajectory across experience bands."""
    query = apply_filters_to_query(db.query(Job), filters).filter(Job.is_valid_salary == True)
    
    bands = ["Entry Level (0-2 yrs)", "Mid Level (3-5 yrs)", "Senior Level (6-8 yrs)", "Lead / Principal (8+ yrs)"]
    results = []
    
    for band in bands:
        records = query.filter(Job.experience_level == band).with_entities(Job.experience_years, Job.annual_salary_avg).all()
        if not records:
            continue
        exp_years = [r[0] for r in records if r[0] is not None]
        salaries = [r[1] for r in records if r[1] is not None]
        
        avg_yrs = round(float(np.mean(exp_years)), 1) if exp_years else 0.0
        avg_sal = round(float(np.mean(salaries)), 2) if salaries else None
        med_sal = round(float(np.median(salaries)), 2) if salaries else None
        
        results.append(ExperienceSalaryMetric(
            experience_level=band,
            avg_years=avg_yrs,
            job_count=len(records),
            avg_annual_salary=avg_sal,
            median_annual_salary=med_sal
        ))
    return results

def get_remote_vs_onsite(db: Session, filters: Optional[FilterParams] = None) -> List[RemoteComparisonMetric]:
    """Compares remote vs onsite compensation and volume."""
    query = apply_filters_to_query(db.query(Job), filters)
    total = query.count()
    if total == 0:
        return []
        
    results = []
    for is_rem, label in [(True, "Remote"), (False, "Onsite / Hybrid")]:
        cnt = query.filter(Job.is_remote == is_rem).count()
        salaries = [
            r[0] for r in query.filter(Job.is_remote == is_rem, Job.is_valid_salary == True)
            .with_entities(Job.annual_salary_avg).all() if r[0] is not None
        ]
        avg_sal = round(float(np.mean(salaries)), 2) if salaries else None
        
        results.append(RemoteComparisonMetric(
            work_mode=label,
            job_count=cnt,
            percentage=round((cnt / total) * 100, 2),
            avg_annual_salary=avg_sal
        ))
    return results

def get_hiring_trends(db: Session, role: Optional[str] = None) -> List[Dict[str, Any]]:
    """Analyzes monthly posting counts and average compensation over time."""
    query = db.query(Job).filter(Job.posting_date != None)
    if role:
        query = query.filter(Job.normalized_title == role)
        
    records = query.with_entities(Job.posting_date, Job.annual_salary_avg, Job.is_valid_salary).all()
    if not records:
        return []
        
    df = pd.DataFrame([
        {
            "month": r[0].strftime("%Y-%m"),
            "salary": r[1] if r[2] else np.nan
        }
        for r in records if r[0] is not None
    ])
    
    if df.empty:
        return []
        
    monthly = df.groupby("month").agg(
        postings=("month", "count"),
        avg_salary=("salary", lambda s: float(np.round(s.dropna().mean(), 2)) if not s.dropna().empty else None)
    ).reset_index().sort_values("month")
    
    return monthly.to_dict(orient="records")
