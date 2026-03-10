from datetime import datetime
from typing import Optional
from pydantic import AliasChoices, BaseModel, ConfigDict, Field
from app.database.locations import RoomType


class LocationBase(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    name: str
    latitude: float = Field(validation_alias=AliasChoices("latitude", "lat"))
    longitude: float = Field(validation_alias=AliasChoices("longitude", "lng"))
    radius: int = Field(validation_alias=AliasChoices("radius", "radius_meters"))
    room_no: Optional[str] = None
    floor: Optional[str] = None
    room_type: RoomType
    capacity: Optional[int] = None
    address: Optional[str] = None


class LocationCreate(LocationBase):
    pass


class LocationUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    name: Optional[str] = None
    latitude: Optional[float] = Field(default=None, validation_alias=AliasChoices("latitude", "lat"))
    longitude: Optional[float] = Field(default=None, validation_alias=AliasChoices("longitude", "lng"))
    radius: Optional[int] = Field(default=None, validation_alias=AliasChoices("radius", "radius_meters"))
    room_no: Optional[str] = None
    floor: Optional[str] = None
    room_type: Optional[RoomType] = None
    capacity: Optional[int] = None
    address: Optional[str] = None


class LocationOut(LocationBase):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
