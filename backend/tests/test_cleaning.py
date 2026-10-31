"""Unit tests for data validation, cleaning, and currency standardization."""
import pytest
from app.data_pipeline.currency import standardize_salary
from app.data_pipeline.cleaner import (
    normalize_title,
    normalize_location,
    extract_and_normalize_skills,
    normalize_experience_level
)

def test_salary_missing_values():
    """Missing or undisclosed salaries must return None and is_valid=False."""
    min_sal, max_sal, avg_sal, is_valid, note = standardize_salary(None, None, "INR", "annual")
    assert min_sal is None
    assert max_sal is None
    assert avg_sal is None
    assert is_valid is False
    assert "missing" in note.lower()

def test_salary_unknown_currency_never_silently_treated_as_inr():
    """Unknown currency must not be converted silently."""
    min_sal, max_sal, avg_sal, is_valid, note = standardize_salary(500000, 800000, "XYZ", "annual")
    assert is_valid is False
    assert "unknown or missing currency" in note.lower()

def test_salary_annual_inr_calculation():
    """Standard annual INR conversion check."""
    min_sal, max_sal, avg_sal, is_valid, note = standardize_salary(600000, 1000000, "INR", "annual")
    assert is_valid is True
    assert min_sal == 600000.0
    assert max_sal == 1000000.0
    assert avg_sal == 800000.0

def test_salary_monthly_to_annual_conversion():
    """Monthly salary should be properly annualized (x12)."""
    min_sal, max_sal, avg_sal, is_valid, note = standardize_salary(50000, 70000, "INR", "monthly")
    assert is_valid is True
    assert min_sal == 600000.0
    assert max_sal == 840000.0
    assert avg_sal == 720000.0

def test_salary_usd_to_inr_conversion():
    """USD salaries should be converted using documented rate (83.5)."""
    min_sal, max_sal, avg_sal, is_valid, note = standardize_salary(100000, 120000, "USD", "annual")
    assert is_valid is True
    assert min_sal == 8350000.0
    assert max_sal == 10020000.0

def test_salary_outlier_detection():
    """Absurdly low or high salary amounts must be flagged as invalid."""
    _, _, _, is_valid_low, note_low = standardize_salary(1000, 2000, "INR", "annual")
    assert is_valid_low is False
    assert "threshold" in note_low.lower()

def test_title_normalization():
    """Job titles should be mapped to standard roles."""
    assert normalize_title("Senior React.js Developer") == "Frontend Developer"
    assert normalize_title("Python Backend Engineer") == "Backend Developer"
    assert normalize_title("Lead Data Scientist") == "Data Scientist"
    assert normalize_title("Site Reliability Engineer (SRE)") == "DevOps Engineer"
    assert normalize_title("AWS Cloud Solutions Architect") == "Cloud Engineer"

def test_location_normalization():
    """Locations should normalize canonical tech hubs."""
    assert normalize_location("Bangalore, Karnataka") == "Bengaluru"
    assert normalize_location("BLR") == "Bengaluru"
    assert normalize_location("Hyd") == "Hyderabad"
    assert normalize_location("Gurugram") == "Delhi NCR"
    assert normalize_location("Anywhere", is_remote=True) == "Remote"

def test_skill_extraction_canonicalization():
    """Skills should be canonicalized and deduplicated."""
    raw = "py, python3, React.js, TS, Docker, K8s, postgres"
    skills = extract_and_normalize_skills(raw)
    assert "Python" in skills
    assert "React" in skills
    assert "TypeScript" in skills
    assert "Docker" in skills
    assert "Kubernetes" in skills
    assert "PostgreSQL" in skills
    # Ensure no duplicates
    assert len([s for s in skills if s == "Python"]) == 1

def test_experience_level_classification():
    """Experience years correctly mapped to seniority bands."""
    assert normalize_experience_level(1.0) == "Entry Level (0-2 yrs)"
    assert normalize_experience_level(4.0) == "Mid Level (3-5 yrs)"
    assert normalize_experience_level(7.0) == "Senior Level (6-8 yrs)"
    assert normalize_experience_level(10.0) == "Lead / Principal (8+ yrs)"
