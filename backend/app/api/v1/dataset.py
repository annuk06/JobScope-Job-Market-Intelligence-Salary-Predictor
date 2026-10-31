"""Dataset Metadata and Management API endpoints."""
import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.dataset_meta import DatasetMetadata
from app.data_pipeline.run_pipeline import execute_cleaning_pipeline
from app.core.seed_db import init_and_seed_database
from app.ml.train import train_and_evaluate_models

router = APIRouter()

@router.get("/dataset/metadata", summary="Dataset metadata and data quality report")
def get_dataset_info(db: Session = Depends(get_db)):
    """Returns dataset overview, data quality breakdown, and cleaning audit logs."""
    report_data = {}
    if settings.DATA_REPORT_PATH.exists():
        with open(settings.DATA_REPORT_PATH, "r", encoding="utf-8") as f:
            report_data = json.load(f)
            
    meta_record = db.query(DatasetMetadata).first()
    meta_json = {}
    if meta_record and meta_record.metadata_json:
        try:
            meta_json = json.loads(meta_record.metadata_json)
        except Exception:
            meta_json = {}
            
    return {
        "dataset_metadata": meta_json,
        "quality_report": report_data,
        "database_records_count": meta_record.record_count if meta_record else 0,
        "last_updated": meta_record.updated_at.isoformat() if meta_record and meta_record.updated_at else None
    }

@router.post("/dataset/import", summary="Re-run data cleaning, DB sync, and model training")
def trigger_data_sync():
    """Triggers the full pipeline: clean raw CSV -> seed DB -> retrain model."""
    try:
        execute_cleaning_pipeline()
        init_and_seed_database()
        train_and_evaluate_models()
        return {
            "status": "success",
            "message": "Dataset pipeline executed, database updated, and ML models retrained successfully."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")
