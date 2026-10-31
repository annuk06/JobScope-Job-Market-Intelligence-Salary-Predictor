"""Integration tests for FastAPI endpoints."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    """Verify root status endpoint."""
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert "JobScope" in data["platform"]
    assert data["status"] == "online"

def test_health():
    """Verify health endpoint."""
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["healthy", "degraded"]
    assert data["database_connected"] is True
    assert data["total_jobs_in_db"] > 0
    assert data["model_loaded"] is True

def test_dashboard_summary():
    """Verify executive summary metrics."""
    res = client.get("/api/v1/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_postings"] > 0
    assert data["total_roles"] > 0
    assert data["currency"] == "INR"
    assert len(data["top_demanded_skills"]) > 0

def test_dashboard_summary_with_filters():
    """Verify dashboard metrics update when filtered."""
    res = client.get("/api/v1/dashboard/summary?role=Frontend+Developer")
    assert res.status_code == 200
    data = res.json()
    assert data["total_postings"] > 0
    assert data["total_roles"] == 1

def test_analytics_roles():
    """Verify role analytics breakdown."""
    res = client.get("/api/v1/analytics/roles")
    assert res.status_code == 200
    data = res.json()
    assert len(data) > 0
    assert "role" in data[0]
    assert data[0]["posting_count"] > 0

def test_analytics_skills():
    """Verify skill demand list."""
    res = client.get("/api/v1/analytics/skills?limit=10")
    assert res.status_code == 200
    data = res.json()
    assert len(data) <= 10
    assert "skill" in data[0]

def test_analytics_cooccurrence():
    """Verify skill cooccurrence combinations."""
    res = client.get("/api/v1/analytics/skills/cooccurrence?limit=5")
    assert res.status_code == 200
    data = res.json()
    assert len(data) > 0
    assert "skill_a" in data[0]

def test_analytics_salaries():
    """Verify salary distribution and breakdown."""
    res = client.get("/api/v1/analytics/salaries")
    assert res.status_code == 200
    data = res.json()
    assert "distribution" in data
    assert "by_experience" in data
    assert "remote_comparison" in data
    assert len(data["distribution"]) > 0

def test_analytics_trends():
    """Verify monthly trends."""
    res = client.get("/api/v1/analytics/trends")
    assert res.status_code == 200
    data = res.json()
    assert len(data) > 0
    assert "month" in data[0]

def test_jobs_list_and_pagination():
    """Verify jobs table pagination and search."""
    res = client.get("/api/v1/jobs?page=1&page_size=10")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    assert len(data["items"]) == 10
    assert data["page"] == 1
    
    first_job_id = data["items"][0]["job_id"]
    detail_res = client.get(f"/api/v1/jobs/{first_job_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["job_id"] == first_job_id

def test_predict_salary_endpoint():
    """Verify ML salary prediction API."""
    payload = {
        "role": "Frontend Developer",
        "experience_years": 4.5,
        "location": "Bengaluru",
        "skills": ["React", "TypeScript", "Tailwind CSS"],
        "employment_type": "Full-time"
    }
    res = client.post("/api/v1/predict/salary", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["predicted_annual_salary"] > 400000
    assert "LPA" in data["predicted_salary_lpa"]
    assert data["currency"] == "INR"
    assert "model_used" in data

def test_skill_gap_endpoint():
    """Verify candidate skill gap analysis."""
    payload = {
        "target_role": "Backend Developer",
        "user_skills": ["Python", "FastAPI"]
    }
    res = client.post("/api/v1/analyze/skill-gap", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["target_role"] == "Backend Developer"
    assert len(data["missing_skills"]) > 0
    assert len(data["evidence_checklist"]) > 0

def test_model_metrics():
    """Verify model metadata API."""
    res = client.get("/api/v1/model/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "champion_metrics" in data
    assert len(data["model_comparison"]) >= 2

def test_dataset_metadata():
    """Verify dataset metadata API."""
    res = client.get("/api/v1/dataset/metadata")
    assert res.status_code == 200
    data = res.json()
    assert "quality_report" in data
    assert data["database_records_count"] > 0
