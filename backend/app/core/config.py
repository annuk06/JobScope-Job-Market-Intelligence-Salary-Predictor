"""JobScope Core Configuration."""
from pathlib import Path
from typing import List
import os

# Project root path resolution
# __file__ = backend/app/core/config.py
CORE_DIR = Path(__file__).resolve().parent
APP_DIR = CORE_DIR.parent
BACKEND_DIR = APP_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

class Settings:
    PROJECT_NAME: str = "JobScope — Job Market Intelligence & Salary Predictor"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{PROJECT_ROOT / 'jobscope.db'}"
    )
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000"
    ]
    
    # Data and Model paths
    DATA_DIR: Path = PROJECT_ROOT / "data"
    RAW_DATA_PATH: Path = PROJECT_ROOT / "data" / "raw" / "sample_jobs_raw.csv"
    PROCESSED_DATA_PATH: Path = PROJECT_ROOT / "data" / "processed" / "jobscope_cleaned.csv"
    DATA_REPORT_PATH: Path = PROJECT_ROOT / "data" / "processed" / "data_quality_report.json"
    DATASET_METADATA_PATH: Path = PROJECT_ROOT / "data" / "processed" / "dataset_metadata.json"
    
    MODEL_DIR: Path = PROJECT_ROOT / "data" / "models"
    MODEL_PATH: Path = PROJECT_ROOT / "data" / "models" / "salary_model.joblib"
    MODEL_METADATA_PATH: Path = PROJECT_ROOT / "data" / "models" / "model_metadata.json"

settings = Settings()
