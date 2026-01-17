from datetime import datetime
import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.database import Base

class UserRole(enum.Enum):
    
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"



class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True,autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name =Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, unique=True,nullable=True)
    role = Column(Enum(UserRole),default=UserRole.STUDENT, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

