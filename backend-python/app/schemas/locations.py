from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.database.locations import RoomType


class LocationBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    latitude: float
    longitude: float
    radius: int
    room_no: Optional[str] = None
    floor: Optional[str] = None
    room_type: RoomType
    capacity: Optional[int] = None


class LocationCreate(LocationBase):
    pass


class LocationUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius: Optional[int] = None
    room_no: Optional[str] = None
    floor: Optional[str] = None
    room_type: Optional[RoomType] = None
    capacity: Optional[int] = None


class LocationOut(LocationBase):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
