"""Unit tests for analytics calculations and skill gap analysis."""
import pytest
from app.core.database import SessionLocal
from app.analytics.engine import (
    get_dashboard_summary,
    get_role_analytics,
    get_location_analytics,
    get_skill_demand_analytics,
    get_skill_cooccurrences,
    get_salary_distribution
)
from app.analytics.skill_gap import analyze_skill_gap
from app.schemas.skill_gap import SkillGapRequest

@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()

def test_dashboard_summary(db):
    """Verify dashboard summary metrics calculated from database."""
    summary = get_dashboard_summary(db)
    assert summary.total_postings > 0
    assert summary.total_roles > 0
    assert summary.total_locations > 0
    assert len(summary.top_demanded_skills) > 0
    assert summary.salary_disclosure_percentage > 50.0
    assert summary.median_annual_salary is not None
    assert summary.median_annual_salary > 100000

def test_role_analytics(db):
    """Verify role analytics calculation."""
    roles = get_role_analytics(db)
    assert len(roles) > 0
    first = roles[0]
    assert first.posting_count > 0
    assert first.market_share_percentage > 0

def test_location_analytics(db):
    """Verify location breakdown and remote stats."""
    locations = get_location_analytics(db)
    assert len(locations) > 0
    loc_names = [l.location for l in locations]
    assert "Bengaluru" in loc_names or "Remote" in loc_names

def test_skill_demand(db):
    """Verify skill demand ranking."""
    skills = get_skill_demand_analytics(db, limit=10)
    assert len(skills) > 0
    assert skills[0].count >= skills[-1].count
    assert skills[0].percentage_of_postings > 0

def test_skill_cooccurrence(db):
    """Verify co-occurrence matrix returns pairs."""
    pairs = get_skill_cooccurrences(db, limit=5)
    assert len(pairs) > 0
    assert pairs[0].skill_a != pairs[0].skill_b
    assert pairs[0].cooccurrence_count > 0

def test_skill_gap_analysis(db):
    """Verify skill gap evaluation for candidate profile."""
    req = SkillGapRequest(
        target_role="Frontend Developer",
        user_skills=["HTML/CSS", "JavaScript"]
    )
    res = analyze_skill_gap(db, req)
    assert res.target_role == "Frontend Developer"
    assert res.total_role_postings_evaluated > 0
    assert len(res.missing_skills) > 0
    # React and TypeScript should be in missing or top requirements
    missing_names = [m.skill for m in res.missing_skills]
    assert "React" in missing_names or "TypeScript" in missing_names
    assert len(res.evidence_checklist) > 0
    assert "Notice:" in res.disclaimer
