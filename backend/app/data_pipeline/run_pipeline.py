"""Pipeline execution runner: cleans raw data, computes quality metrics, and persists artifacts."""
import json
import logging
from pathlib import Path
import sys

# Ensure backend directory is in sys.path
backend_path = Path(__file__).resolve().parent.parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.core.config import settings
from app.data_pipeline.loader import process_raw_dataset

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def execute_cleaning_pipeline(
    raw_path: Path = settings.RAW_DATA_PATH,
    out_csv: Path = settings.PROCESSED_DATA_PATH,
    report_path: Path = settings.DATA_REPORT_PATH,
    meta_path: Path = settings.DATASET_METADATA_PATH
):
    logger.info(f"Starting Data Cleaning Pipeline on: {raw_path}")
    
    cleaned_df, quality_report, dataset_metadata = process_raw_dataset(raw_path)
    
    # Ensure processed directory exists
    out_csv.parent.mkdir(parents=True, exist_ok=True)
    
    # Save cleaned dataframe
    cleaned_df.to_csv(out_csv, index=False)
    logger.info(f"Saved {len(cleaned_df)} cleaned records to: {out_csv}")
    
    # Save quality report
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(quality_report, f, indent=2)
    logger.info(f"Saved Data Quality Report to: {report_path}")
    
    # Save metadata
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(dataset_metadata, f, indent=2)
    logger.info(f"Saved Dataset Metadata to: {meta_path}")
    
    logger.info("Data Pipeline executed successfully.")
    return cleaned_df, quality_report, dataset_metadata

if __name__ == "__main__":
    execute_cleaning_pipeline()
