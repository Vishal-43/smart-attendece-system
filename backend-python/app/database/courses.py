from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.database.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, index=True)
    code = Column(String(10), unique=True, nullable=False, index=True)
    duration_years = Column(Integer, nullable=False)
    total_semesters = Column(Integer, nullable=False)
    college_code = Column(String(10), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)
    updated_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False
    )

    subjects = relationship("Subject", back_populates="course", lazy="selectin")
    branches = relationship("Branch", back_populates="course", lazy="selectin")
