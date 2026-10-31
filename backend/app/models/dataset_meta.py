"""SQLAlchemy model for Dataset Metadata."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from app.core.database import Base

class DatasetMetadata(Base):
    __tablename__ = "dataset_metadata"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dataset_name = Column(String(150), nullable=False)
    source = Column(String(255), nullable=True)
    record_count = Column(Integer, nullable=False)
    is_synthetic_labeled = Column(Boolean, default=True)
    metadata_json = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
