"""Database initialization and seeding script."""
from datetime import datetime
import json
import logging
from pathlib import Path
import sys
import pandas as pd

# Add backend directory to path
backend_path = Path(__file__).resolve().parent.parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models import Job, Skill, DatasetMetadata

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def init_and_seed_database(csv_path: Path = settings.PROCESSED_DATA_PATH):
    logger.info("Creating database tables if not existing...")
    Base.metadata.create_all(bind=engine)
    
    if not csv_path.exists():
        logger.warning(f"Cleaned dataset not found at {csv_path}. Please run cleaning pipeline first.")
        return
        
    df = pd.read_csv(csv_path)
    logger.info(f"Loaded {len(df)} records from {csv_path}")
    
    session = SessionLocal()
    try:
        # Check if already seeded
        existing_jobs = session.query(Job).count()
        if existing_jobs > 0:
            logger.info(f"Database already contains {existing_jobs} jobs. Re-seeding tables...")
            session.query(Job).delete()
            session.query(Skill).delete()
            session.query(DatasetMetadata).delete()
            session.commit()
            
        # 1. Discover and insert all unique skills
        skill_cache = {}
        for _, row in df.iterrows():
            skills_raw = row.get("required_skills")
            if pd.notna(skills_raw):
                try:
                    s_list = json.loads(skills_raw)
                    for s_name in s_list:
                        s_name = s_name.strip()
                        if s_name and s_name not in skill_cache:
                            skill_obj = Skill(name=s_name, category="Technical")
                            session.add(skill_obj)
                            skill_cache[s_name] = skill_obj
                except Exception:
                    pass
                    
        session.commit()
        logger.info(f"Inserted {len(skill_cache)} unique skills into skills table.")
        
        # 2. Insert Jobs and link skills
        jobs_to_add = []
        for _, row in df.iterrows():
            # Parse date safely
            p_date = None
            if pd.notna(row.get("posting_date")):
                try:
                    p_date = datetime.strptime(str(row["posting_date"]).strip(), "%Y-%m-%d").date()
                except Exception:
                    p_date = None
                    
            job = Job(
                job_id=str(row["job_id"]),
                raw_title=str(row.get("raw_title", "")),
                normalized_title=str(row.get("normalized_title", "Software Engineer")),
                company=str(row.get("company", "Confidential")),
                raw_location=str(row.get("raw_location", "")),
                normalized_location=str(row.get("normalized_location", "Remote")),
                is_remote=bool(row.get("is_remote", False)),
                experience_years=float(row.get("experience_years", 3.0)),
                experience_level=str(row.get("experience_level", "Mid Level")),
                employment_type=str(row.get("employment_type", "Full-time")),
                raw_salary_min=float(row["raw_salary_min"]) if pd.notna(row.get("raw_salary_min")) else None,
                raw_salary_max=float(row["raw_salary_max"]) if pd.notna(row.get("raw_salary_max")) else None,
                raw_currency=str(row.get("raw_currency")) if pd.notna(row.get("raw_currency")) else None,
                raw_period=str(row.get("raw_period")) if pd.notna(row.get("raw_period")) else None,
                annual_salary_min=float(row["annual_salary_min"]) if pd.notna(row.get("annual_salary_min")) else None,
                annual_salary_max=float(row["annual_salary_max"]) if pd.notna(row.get("annual_salary_max")) else None,
                annual_salary_avg=float(row["annual_salary_avg"]) if pd.notna(row.get("annual_salary_avg")) else None,
                is_valid_salary=bool(row.get("is_valid_salary", False)),
                salary_quality_note=str(row.get("salary_quality_note", "")),
                standardized_currency=str(row.get("standardized_currency", "INR")),
                posting_date=p_date,
                source=str(row.get("source", "Sample Feed"))
            )
            
            # Associate skills
            skills_raw = row.get("required_skills")
            if pd.notna(skills_raw):
                try:
                    s_list = json.loads(skills_raw)
                    for s_name in s_list:
                        s_name = s_name.strip()
                        if s_name in skill_cache:
                            job.skills.append(skill_cache[s_name])
                except Exception:
                    pass
                    
            jobs_to_add.append(job)
            
        session.bulk_save_objects(jobs_to_add)
        session.commit()
        
        # Link relations for many-to-many using SQLAlchemy relationship flush
        # Note: bulk_save_objects doesn't populate M2M junction automatically in some SQLAlchemy versions,
        # so let's populate job_skills cleanly
        session.close()
        
        # Explicitly populate job_skills junction table for guaranteed integrity
        relink_session = SessionLocal()
        all_jobs = {j.job_id: j.id for j in relink_session.query(Job.id, Job.job_id).all()}
        all_skills = {s.name: s.id for s in relink_session.query(Skill.id, Skill.name).all()}
        
        junction_rows = []
        for _, row in df.iterrows():
            jid = all_jobs.get(str(row["job_id"]))
            if not jid:
                continue
            skills_raw = row.get("required_skills")
            if pd.notna(skills_raw):
                try:
                    s_list = json.loads(skills_raw)
                    for s_name in s_list:
                        sid = all_skills.get(s_name.strip())
                        if sid:
                            junction_rows.append({"job_id": jid, "skill_id": sid})
                except Exception:
                    pass
                    
        if junction_rows:
            from app.models.job import job_skills_table
            relink_session.execute(job_skills_table.insert(), junction_rows)
            relink_session.commit()
            logger.info(f"Linked {len(junction_rows)} job-skill relationships.")
            
        # 3. Store Dataset Metadata
        meta_file = settings.DATASET_METADATA_PATH
        meta_content = "{}"
        if meta_file.exists():
            with open(meta_file, "r", encoding="utf-8") as f:
                meta_content = f.read()
                
        meta_obj = DatasetMetadata(
            dataset_name="JobScope Curated Tech Market Dataset",
            source="Aggregated Industry Benchmark Data",
            record_count=len(df),
            is_synthetic_labeled=True,
            metadata_json=meta_content
        )
        relink_session.add(meta_obj)
        relink_session.commit()
        relink_session.close()
        
        logger.info("Database seeding completed successfully.")
    except Exception as e:
        session.rollback()
        logger.error(f"Error seeding database: {e}", exc_info=True)
        raise
    finally:
        session.close()

if __name__ == "__main__":
    init_and_seed_database()
