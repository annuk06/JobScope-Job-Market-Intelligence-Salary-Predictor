"""Inference service for ML salary prediction."""
import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any
import numpy as np
import pandas as pd
import joblib

from app.core.config import settings
from app.schemas.prediction import SalaryPredictionRequest, SalaryPredictionResult

logger = logging.getLogger(__name__)

# Cache loaded model & metadata in memory
_MODEL = None
_METADATA = None

def get_model():
    """Loads and caches serialized pipeline model."""
    global _MODEL
    if _MODEL is None:
        if not settings.MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model file not found at {settings.MODEL_PATH}. Run training script first."
            )
        _MODEL = joblib.load(settings.MODEL_PATH)
    return _MODEL

def get_model_metadata() -> Dict[str, Any]:
    """Loads model training metadata and benchmark comparison."""
    global _METADATA
    if _METADATA is None:
        if not settings.MODEL_METADATA_PATH.exists():
            return {
                "selected_model": "Not Yet Trained",
                "champion_metrics": {"test_mae": 0, "test_r2": 0},
                "model_comparison": [],
                "known_limitations": ["Model has not been trained yet."]
            }
        with open(settings.MODEL_METADATA_PATH, "r", encoding="utf-8") as f:
            _METADATA = json.load(f)
    return _METADATA

def predict_salary(request: SalaryPredictionRequest) -> SalaryPredictionResult:
    """Predicts expected annual market salary based on candidate profile."""
    model = get_model()
    metadata = get_model_metadata()
    
    # Construct input dataframe
    input_df = pd.DataFrame([{
        "normalized_title": request.role.strip(),
        "normalized_location": request.location.strip(),
        "employment_type": request.employment_type.strip(),
        "experience_years": float(request.experience_years),
        "skills_list": [s.strip() for s in request.skills if s.strip()]
    }])
    
    # Run prediction
    raw_pred = float(model.predict(input_df)[0])
    predicted_annual = max(300000.0, round(raw_pred, 2))
    
    # Estimated confidence range based on test set MAE
    mae = float(metadata.get("champion_metrics", {}).get("test_mae", 150000.0))
    r2 = float(metadata.get("champion_metrics", {}).get("test_r2", 0.75))
    
    range_half_width = mae * 1.25
    range_min = max(250000.0, round(predicted_annual - range_half_width, -3))
    range_max = round(predicted_annual + range_half_width, -3)
    
    # LPA formatting
    pred_lpa = f"₹ {predicted_annual / 100000:.1f} LPA"
    range_lpa = f"₹ {range_min / 100000:.1f} - {range_max / 100000:.1f} LPA"
    
    disclaimer = (
        "Statistical Estimate Notice: Predictions are derived from regression models trained on "
        "advertised job postings. They do not represent guaranteed offers or encompass discretionary "
        "bonuses, stock options (ESOPs), or non-public compensation agreements."
    )
    
    return SalaryPredictionResult(
        predicted_annual_salary=predicted_annual,
        predicted_salary_lpa=pred_lpa,
        estimated_range_min=range_min,
        estimated_range_max=range_max,
        estimated_range_lpa=range_lpa,
        currency="INR",
        model_used=metadata.get("selected_model", "Trained Ensemble Regressor"),
        model_mae=mae,
        model_r2=r2,
        input_profile=request.model_dump(),
        limitations=metadata.get("known_limitations", []),
        disclaimer=disclaimer
    )
