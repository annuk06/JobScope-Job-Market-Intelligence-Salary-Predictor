"""SQLAlchemy model for Job Postings."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, Date, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

# Association table for normalized Many-to-Many relationship
job_skills_table = Table(
    "job_skills",
    Base.metadata,
    Column("job_id", Integer, ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
)

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    job_id = Column(String(50), unique=True, index=True, nullable=False)
    raw_title = Column(String(255), nullable=False)
    normalized_title = Column(String(100), index=True, nullable=False)
    company = Column(String(255), nullable=False)
    raw_location = Column(String(100), nullable=True)
    normalized_location = Column(String(100), index=True, nullable=False)
    is_remote = Column(Boolean, default=False)
    experience_years = Column(Float, default=0.0)
    experience_level = Column(String(50), nullable=False)
    employment_type = Column(String(50), default="Full-time")
    
    raw_salary_min = Column(Float, nullable=True)
    raw_salary_max = Column(Float, nullable=True)
    raw_currency = Column(String(10), nullable=True)
    raw_period = Column(String(20), nullable=True)
    
    annual_salary_min = Column(Float, nullable=True)
    annual_salary_max = Column(Float, nullable=True)
    annual_salary_avg = Column(Float, nullable=True)
    is_valid_salary = Column(Boolean, default=False, index=True)
    salary_quality_note = Column(String(255), nullable=True)
    standardized_currency = Column(String(10), default="INR")
    
    posting_date = Column(Date, index=True, nullable=True)
    source = Column(String(100), default="Job Board Feed")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to skills
    skills = relationship("Skill", secondary=job_skills_table, back_populates="jobs")
