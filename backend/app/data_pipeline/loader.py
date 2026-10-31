"""Dataset loading, cleaning, and quality report pipeline."""
from datetime import datetime
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple, Union
import pandas as pd
import numpy as np

from app.core.config import settings
from app.data_pipeline.validator import resolve_column_mapping, validate_dataframe_schema
from app.data_pipeline.cleaner import (
    normalize_title,
    normalize_location,
    extract_and_normalize_skills,
    normalize_experience_level
)
from app.data_pipeline.currency import standardize_salary

logger = logging.getLogger(__name__)

def process_raw_dataset(
    file_path: Union[str, Path],
    custom_mapping: Optional[Dict[str, str]] = None,
    target_currency: str = "INR"
) -> Tuple[pd.DataFrame, Dict[str, Any], Dict[str, Any]]:
    """
    Ingests, cleans, deduplicates, and standardizes a raw job market CSV dataset.
    
    Returns:
        (cleaned_df, quality_report, dataset_metadata)
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Dataset file not found at: {path}")
        
    df_raw = pd.read_csv(path)
    total_raw_records = len(df_raw)
    
    mapping = resolve_column_mapping(list(df_raw.columns), custom_mapping)
    
    # Track metrics for data quality report
    duplicates_count = 0
    missing_title_count = 0
    missing_company_count = 0
    missing_salary_count = 0
    unknown_currency_count = 0
    outliers_flagged_count = 0
    valid_salary_count = 0
    
    records = []
    seen_dedup_keys = set()
    all_skills_found = set()
    
    for idx, row in df_raw.iterrows():
        # Title
        raw_title = str(row[mapping["job_title"]]).strip() if mapping["job_title"] and pd.notna(row[mapping["job_title"]]) else None
        if not raw_title or raw_title.lower() in ["nan", "none", ""]:
            missing_title_count += 1
            continue
            
        # Company
        raw_company = str(row[mapping["company"]]).strip() if mapping["company"] and pd.notna(row[mapping["company"]]) else "Confidential / Undisclosed"
        if raw_company == "Confidential / Undisclosed":
            missing_company_count += 1
            
        # Location & Remote
        raw_loc = str(row[mapping["location"]]).strip() if mapping.get("location") and pd.notna(row[mapping["location"]]) else "India"
        is_remote_val = False
        if mapping.get("is_remote") and pd.notna(row[mapping["is_remote"]]):
            val = str(row[mapping["is_remote"]]).lower()
            is_remote_val = val in ["true", "1", "yes", "remote"]
            
        norm_title = normalize_title(raw_title)
        norm_loc = normalize_location(raw_loc, is_remote=is_remote_val)
        
        # Deduplication key
        posting_date = str(row[mapping["posting_date"]]).strip() if mapping.get("posting_date") and pd.notna(row[mapping["posting_date"]]) else "2026-01-01"
        dedup_key = (norm_title.lower(), raw_company.lower(), norm_loc.lower(), posting_date)
        if dedup_key in seen_dedup_keys:
            duplicates_count += 1
            continue
        seen_dedup_keys.add(dedup_key)
        
        # Experience
        exp_years = None
        if mapping.get("experience_years") and pd.notna(row[mapping["experience_years"]]):
            try:
                exp_years = float(row[mapping["experience_years"]])
                if exp_years < 0 or exp_years > 40:
                    exp_years = None
            except (ValueError, TypeError):
                exp_years = None
                
        raw_exp_level = str(row[mapping["experience_level"]]).strip() if mapping.get("experience_level") and pd.notna(row[mapping["experience_level"]]) else None
        norm_exp_level = normalize_experience_level(exp_years, raw_exp_level)
        
        # Skills
        raw_skills = str(row[mapping["required_skills"]]).strip() if mapping.get("required_skills") and pd.notna(row[mapping["required_skills"]]) else None
        raw_desc = str(row[mapping["job_description"]]).strip() if mapping.get("job_description") and pd.notna(row[mapping["job_description"]]) else None
        extracted_skills = extract_and_normalize_skills(raw_skills, raw_desc)
        all_skills_found.update(extracted_skills)
        
        # Salary
        sal_min = None
        sal_max = None
        if mapping.get("salary_min") and pd.notna(row[mapping["salary_min"]]):
            try:
                sal_min = float(row[mapping["salary_min"]])
            except (ValueError, TypeError):
                sal_min = None
        if mapping.get("salary_max") and pd.notna(row[mapping["salary_max"]]):
            try:
                sal_max = float(row[mapping["salary_max"]])
            except (ValueError, TypeError):
                sal_max = None
                
        currency = str(row[mapping["salary_currency"]]).strip().upper() if mapping.get("salary_currency") and pd.notna(row[mapping["salary_currency"]]) else None
        period = str(row[mapping["salary_period"]]).strip().lower() if mapping.get("salary_period") and pd.notna(row[mapping["salary_period"]]) else "annual"
        
        if sal_min is None and sal_max is None:
            missing_salary_count += 1
            annual_min, annual_max, annual_avg, is_valid_salary, note = None, None, None, False, "No salary disclosed"
        else:
            annual_min, annual_max, annual_avg, is_valid_salary, note = standardize_salary(
                sal_min=sal_min,
                sal_max=sal_max,
                currency=currency,
                period=period,
                target_currency=target_currency
            )
            if not is_valid_salary:
                if "Unknown or missing currency" in note:
                    unknown_currency_count += 1
                elif "threshold" in note:
                    outliers_flagged_count += 1
            else:
                valid_salary_count += 1
                
        emp_type = str(row[mapping["employment_type"]]).strip() if mapping.get("employment_type") and pd.notna(row[mapping["employment_type"]]) else "Full-time"
        source = str(row[mapping["source"]]).strip() if mapping.get("source") and pd.notna(row[mapping["source"]]) else "Sample Job Market Feed"
        
        records.append({
            "job_id": f"JS-{idx+1:05d}",
            "raw_title": raw_title,
            "normalized_title": norm_title,
            "company": raw_company,
            "raw_location": raw_loc,
            "normalized_location": norm_loc,
            "is_remote": is_remote_val,
            "experience_years": exp_years if exp_years is not None else 3.0,
            "experience_level": norm_exp_level,
            "employment_type": emp_type,
            "raw_salary_min": sal_min,
            "raw_salary_max": sal_max,
            "raw_currency": currency,
            "raw_period": period,
            "annual_salary_min": annual_min,
            "annual_salary_max": annual_max,
            "annual_salary_avg": annual_avg,
            "is_valid_salary": is_valid_salary,
            "salary_quality_note": note,
            "standardized_currency": target_currency,
            "required_skills": json.dumps(extracted_skills),
            "skill_count": len(extracted_skills),
            "posting_date": posting_date,
            "source": source
        })
        
    cleaned_df = pd.DataFrame(records)
    
    # Compile Data Quality Report
    quality_report = {
        "pipeline_version": "1.0.0",
        "processed_timestamp": datetime.utcnow().isoformat() + "Z",
        "total_raw_records": total_raw_records,
        "clean_records_retained": len(cleaned_df),
        "duplicate_records_removed": duplicates_count,
        "missing_title_dropped": missing_title_count,
        "records_with_salary_disclosed": total_raw_records - missing_salary_count,
        "records_with_valid_annual_salary": valid_salary_count,
        "records_missing_salary": missing_salary_count,
        "unknown_or_missing_currency": unknown_currency_count,
        "salary_outliers_flagged": outliers_flagged_count,
        "valid_salary_percentage": round((valid_salary_count / len(cleaned_df) * 100), 2) if len(cleaned_df) > 0 else 0,
        "unique_roles_count": int(cleaned_df["normalized_title"].nunique()) if not cleaned_df.empty else 0,
        "unique_locations_count": int(cleaned_df["normalized_location"].nunique()) if not cleaned_df.empty else 0,
        "unique_skills_count": len(all_skills_found),
        "target_standardized_currency": target_currency
    }
    
    # Compile Dataset Metadata
    dataset_metadata = {
        "dataset_name": "JobScope Curated Tech Market Dataset",
        "source": "Aggregated Industry Job Postings (Cleaned & Standardized)",
        "license": "Open Data Commons / CC BY 4.0 for Educational & Portfolio Analytics",
        "last_updated": datetime.utcnow().strftime("%Y-%m-%d"),
        "total_records": len(cleaned_df),
        "roles_covered": sorted(cleaned_df["normalized_title"].unique().tolist()) if not cleaned_df.empty else [],
        "locations_covered": sorted(cleaned_df["normalized_location"].unique().tolist()) if not cleaned_df.empty else [],
        "currency_standard": target_currency,
        "is_synthetic_labeled": True,
        "data_notice": "Demonstration dataset curated for data analytics, salary regression modeling, and skill demand intelligence. Figures reflect processed benchmark data."
    }
    
    return cleaned_df, quality_report, dataset_metadata
