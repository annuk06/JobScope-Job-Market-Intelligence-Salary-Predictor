"""Salary Prediction and Model Evaluation API endpoints."""
from fastapi import APIRouter, HTTPException
from app.schemas.prediction import SalaryPredictionRequest, SalaryPredictionResult
from app.ml.predict import predict_salary, get_model_metadata

router = APIRouter()

@router.post("/predict/salary", response_model=SalaryPredictionResult, summary="Predict annual salary from candidate profile")
def predict_candidate_salary(request: SalaryPredictionRequest):
    """
    Computes statistical annual market compensation based on candidate job role,
    experience years, location, employment type, and technical skills using
    our trained regression pipeline.
    """
    try:
        return predict_salary(request)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@router.get("/model/metrics", summary="Model evaluation metrics and comparison table")
def get_metrics():
    """Returns champion model metrics, baseline comparisons, and documented limitations."""
    return get_model_metadata()
