from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from app.database.database import Base


class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    division_id = Column(Integer, ForeignKey("divisions.id"), nullable=False, index=True)
    name = Column(String(50), nullable=False, index=True)
    batch_number = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)
    academic_year = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)



    

