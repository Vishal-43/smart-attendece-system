from datetime import datetime
from typing import Optional
from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_validator
from app.database.locations import RoomType


class LocationBase(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    name: str
    latitude: Optional[float] = Field(default=None, validation_alias=AliasChoices("latitude", "lat"))
    longitude: Optional[float] = Field(default=None, validation_alias=AliasChoices("longitude", "lng"))
    radius: Optional[int] = Field(default=100, validation_alias=AliasChoices("radius", "radius_meters"))
    room_no: Optional[str] = None
    floor: Optional[str] = None
    room_type: Optional[str] = None
    capacity: Optional[int] = None
    address: Optional[str] = None

    @field_validator('room_type', mode='before')
    @classmethod
    def normalize_room_type(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            return v.lower()
        return v


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
    room_type: Optional[str] = None
    capacity: Optional[int] = None
    address: Optional[str] = None

    @field_validator('room_type', mode='before')
    @classmethod
    def normalize_room_type(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            return v.lower()
        return v


class LocationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    id: int
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius: Optional[int] = None
    room_no: Optional[str] = None
    floor: Optional[str] = None
    room_type: Optional[str] = None
    capacity: Optional[int] = None
    address: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
