"""Reproducible Machine Learning Training, Validation, and Model Serialization."""
from datetime import datetime
import json
import logging
from pathlib import Path
import sys
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent.parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.core.config import settings
from app.ml.pipeline import create_full_pipeline

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def parse_skills_column(skills_series: pd.Series) -> list:
    """Parses JSON or string skills into python lists."""
    skills_list = []
    for val in skills_series:
        if pd.isna(val):
            skills_list.append([])
        elif isinstance(val, list):
            skills_list.append(val)
        else:
            try:
                parsed = json.loads(str(val))
                skills_list.append(parsed if isinstance(parsed, list) else [])
            except Exception:
                parts = [s.strip() for s in str(val).split(",") if s.strip()]
                skills_list.append(parts)
    return skills_list

def train_and_evaluate_models(
    csv_path: Path = settings.PROCESSED_DATA_PATH,
    model_save_path: Path = settings.MODEL_PATH,
    metadata_save_path: Path = settings.MODEL_METADATA_PATH
):
    logger.info(f"Loading training data from: {csv_path}")
    df = pd.read_csv(csv_path)
    
    # Filter for valid salary records only (prevent target leakage)
    df_valid = df[df["is_valid_salary"] == True].copy()
    logger.info(f"Retained {len(df_valid)} valid salary records for model training.")
    
    if len(df_valid) < 50:
        raise ValueError("Insufficient training records with valid salaries.")
        
    df_valid["skills_list"] = parse_skills_column(df_valid["required_skills"])
    
    # Feature columns and Target
    feature_cols = ["normalized_title", "normalized_location", "employment_type", "experience_years", "skills_list"]
    X = df_valid[feature_cols]
    y = df_valid["annual_salary_avg"].values
    
    # Reproducible 80/20 train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    logger.info(f"Train set: {len(X_train)} samples | Test set: {len(X_test)} samples")
    
    # Candidate Algorithms
    candidates = {
        "Baseline (Ridge Regression)": Ridge(alpha=1.0, random_state=42),
        "Random Forest Regressor": RandomForestRegressor(
            n_estimators=100, max_depth=12, min_samples_split=4, random_state=42, n_jobs=-1
        ),
        "Gradient Boosting Regressor": GradientBoostingRegressor(
            n_estimators=120, learning_rate=0.08, max_depth=4, random_state=42
        )
    }
    
    model_results = []
    trained_pipelines = {}
    
    for name, regressor in candidates.items():
        logger.info(f"Training and evaluating: {name}...")
        pipe = create_full_pipeline(regressor, min_skill_freq=3)
        
        # Fit on training data only
        pipe.fit(X_train, y_train)
        
        # Predict on holdout test set
        y_pred = pipe.predict(X_test)
        
        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        r2 = float(r2_score(y_test, y_pred))
        
        # 5-Fold Cross Validation on training set
        kf = KFold(n_splits=5, shuffle=True, random_state=42)
        cv_r2_scores = cross_val_score(pipe, X_train, y_train, cv=kf, scoring="r2")
        cv_mae_scores = -cross_val_score(pipe, X_train, y_train, cv=kf, scoring="neg_mean_absolute_error")
        
        res_info = {
            "model_name": name,
            "test_mae": round(mae, 2),
            "test_rmse": round(rmse, 2),
            "test_r2": round(r2, 4),
            "cv_r2_mean": round(float(np.mean(cv_r2_scores)), 4),
            "cv_r2_std": round(float(np.std(cv_r2_scores)), 4),
            "cv_mae_mean": round(float(np.mean(cv_mae_scores)), 2),
        }
        model_results.append(res_info)
        trained_pipelines[name] = pipe
        logger.info(f"{name} Results -> Test MAE: {mae:,.0f} | Test RMSE: {rmse:,.0f} | Test R²: {r2:.4f}")
        
    # Select winning model based on best Test MAE (lowest error)
    best_result = min(model_results, key=lambda m: m["test_mae"])
    best_model_name = best_result["model_name"]
    best_pipeline = trained_pipelines[best_model_name]
    logger.info(f"Selected Champion Model: '{best_model_name}' (Lowest MAE: ₹{best_result['test_mae']:,.0f})")
    
    # Ensure model directory exists
    model_save_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Save best model pipeline
    joblib.dump(best_pipeline, model_save_path)
    logger.info(f"Saved champion model pipeline to: {model_save_path}")
    
    # Extract unique categories for client-side dropdown support
    roles_list = sorted(df_valid["normalized_title"].dropna().unique().tolist())
    locations_list = sorted(df_valid["normalized_location"].dropna().unique().tolist())
    skills_vocab = best_pipeline.named_steps["preprocessor"].named_transformers_["skills"].vocabulary_
    
    # Comprehensive Metadata
    metadata = {
        "pipeline_version": "1.0.0",
        "training_timestamp": datetime.utcnow().isoformat() + "Z",
        "dataset_records_used": len(df_valid),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "target_variable": "annual_salary_avg",
        "currency": "INR",
        "selected_model": best_model_name,
        "champion_metrics": best_result,
        "model_comparison": model_results,
        "feature_schema": {
            "categorical": ["normalized_title", "normalized_location", "employment_type"],
            "numeric": ["experience_years"],
            "multi_hot_skills": f"Vocabulary of {len(skills_vocab)} canonical skills"
        },
        "available_roles": roles_list,
        "available_locations": locations_list,
        "available_skills": sorted(skills_vocab),
        "estimated_interval_formula": "Predicted Salary ± (1.25 * Test MAE)",
        "known_limitations": [
            "Estimates reflect advertised compensation from historical job postings and do not factor in unadvertised stock grants, bonuses, or private negotiations.",
            "Predictions are statistical approximations based on observed role, location, skills, and experience distributions.",
            "Actual company offers vary widely based on candidate interview performance, team urgency, and hiring budget."
        ]
    }
    
    with open(metadata_save_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logger.info(f"Saved model training metadata to: {metadata_save_path}")
    
    return best_pipeline, metadata

if __name__ == "__main__":
    train_and_evaluate_models()
