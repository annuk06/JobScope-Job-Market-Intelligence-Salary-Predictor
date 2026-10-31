"""Unit tests for ML salary prediction pipeline and model inference."""
import pytest
from app.ml.predict import predict_salary, get_model, get_model_metadata
from app.schemas.prediction import SalaryPredictionRequest

def test_model_artifact_loaded():
    """Verify champion model and metadata are properly loaded."""
    model = get_model()
    metadata = get_model_metadata()
    assert model is not None
    assert metadata["selected_model"] != "Not Yet Trained"
    assert metadata["champion_metrics"]["test_r2"] > 0.70
    assert metadata["champion_metrics"]["test_mae"] > 0

def test_prediction_output_structure():
    """Test standard prediction response format."""
    req = SalaryPredictionRequest(
        role="Frontend Developer",
        experience_years=4.0,
        location="Bengaluru",
        skills=["React", "TypeScript", "JavaScript"],
        employment_type="Full-time"
    )
    res = predict_salary(req)
    assert res.predicted_annual_salary > 400000.0
    assert "₹" in res.predicted_salary_lpa
    assert "LPA" in res.predicted_salary_lpa
    assert res.estimated_range_min < res.predicted_annual_salary < res.estimated_range_max
    assert res.currency == "INR"
    assert len(res.limitations) > 0
    assert "Notice" in res.disclaimer

def test_experience_salary_trajectory():
    """Senior candidate must receive higher prediction than entry-level for same profile."""
    junior_req = SalaryPredictionRequest(
        role="Backend Developer",
        experience_years=1.0,
        location="Hyderabad",
        skills=["Python", "FastAPI"]
    )
    senior_req = SalaryPredictionRequest(
        role="Backend Developer",
        experience_years=8.0,
        location="Hyderabad",
        skills=["Python", "FastAPI"]
    )
    junior_res = predict_salary(junior_req)
    senior_res = predict_salary(senior_req)
    assert senior_res.predicted_annual_salary > junior_res.predicted_annual_salary

def test_unseen_skills_graceful_handling():
    """Handling unknown or unlisted skills without throwing an exception."""
    req = SalaryPredictionRequest(
        role="Full Stack Developer",
        experience_years=3.0,
        location="Pune",
        skills=["CustomObscureFrameworkX", "RandomLibrary123"]
    )
    res = predict_salary(req)
    assert res.predicted_annual_salary > 300000.0
