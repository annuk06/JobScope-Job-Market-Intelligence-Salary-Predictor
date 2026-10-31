"""SQLAlchemy model for Technical Skills."""
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.job import job_skills_table

class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), default="General")
    
    jobs = relationship("Job", secondary=job_skills_table, back_populates="skills")
