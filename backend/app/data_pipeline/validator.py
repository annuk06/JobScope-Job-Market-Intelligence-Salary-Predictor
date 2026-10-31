"""Dataset validation and quality check rules."""
from typing import Dict, Any, List, Optional
import pandas as pd

DEFAULT_COLUMN_MAPPING = {
    "job_title": ["job_title", "title", "role", "position"],
    "company": ["company", "company_name", "employer"],
    "location": ["location", "city", "job_location"],
    "country": ["country", "nation"],
    "experience_years": ["experience_years", "experience", "exp_years", "years_of_experience"],
    "experience_level": ["experience_level", "seniority_level", "seniority"],
    "employment_type": ["employment_type", "job_type", "type"],
    "salary_min": ["salary_min", "salary_minimum", "min_salary", "sal_min"],
    "salary_max": ["salary_max", "salary_maximum", "max_salary", "sal_max"],
    "salary_currency": ["salary_currency", "currency", "sal_currency"],
    "salary_period": ["salary_period", "period", "pay_period"],
    "required_skills": ["required_skills", "skills", "key_skills", "tech_stack"],
    "job_description": ["job_description", "description", "details"],
    "is_remote": ["is_remote", "remote", "remote_work", "work_from_home"],
    "posting_date": ["posting_date", "posted_date", "date_posted", "created_at"],
    "source": ["source", "job_board", "platform"]
}

def resolve_column_mapping(df_columns: List[str], custom_mapping: Optional[Dict[str, str]] = None) -> Dict[str, Optional[str]]:
    """
    Map dataset column names to JobScope canonical schema fields.
    Supports user custom mapping overrides.
    """
    mapping = {}
    normalized_cols = {c.lower().strip().replace(" ", "_"): c for c in df_columns}
    
    for canonical_field, synonyms in DEFAULT_COLUMN_MAPPING.items():
        matched = None
        # Check if user provided an explicit custom override
        if custom_mapping and canonical_field in custom_mapping:
            user_target = custom_mapping[canonical_field]
            if user_target in df_columns:
                matched = user_target
                
        # Otherwise search default synonyms
        if not matched:
            for syn in synonyms:
                if syn in normalized_cols:
                    matched = normalized_cols[syn]
                    break
        mapping[canonical_field] = matched
        
    return mapping

def validate_dataframe_schema(df: pd.DataFrame) -> Dict[str, Any]:
    """Inspect dataframe structure and detect required vs missing fields."""
    mapping = resolve_column_mapping(list(df.columns))
    missing_critical = []
    
    if not mapping.get("job_title"):
        missing_critical.append("job_title")
    if not mapping.get("company"):
        missing_critical.append("company")
        
    return {
        "is_valid": len(missing_critical) == 0,
        "total_columns": len(df.columns),
        "total_rows": len(df),
        "mapping": mapping,
        "missing_critical_fields": missing_critical
    }
