from datetime import datetime
import enum

from sqlalchemy import Column, DateTime, Enum, Float, Integer, String

from app.database.database import Base


class RoomType(enum.Enum):
    LAB = "lab"
    CLASSROOM = "classroom"
    AUDITORIUM = "auditorium"
    WORKSHOP = "workshop"
    PODIUM = "podium"


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    radius = Column(Integer, nullable=True)
    room_no = Column(String(20), nullable=True, unique=False)
    floor = Column(Integer, nullable=True)
    room_type = Column(Enum(RoomType), nullable=True)
    capacity = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


    
