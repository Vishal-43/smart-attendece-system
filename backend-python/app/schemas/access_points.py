from datetime import datetime
from typing import Optional
from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class AccessPointBase(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    location_id: int
    name: str
    mac_address: str = Field(validation_alias=AliasChoices("mac_address", "mac"))
    ip_address: Optional[str] = Field(default=None, validation_alias=AliasChoices("ip_address", "ip"))
    is_active: bool = True


class AccessPointCreate(AccessPointBase):
    pass


class AccessPointUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    location_id: Optional[int] = None
    name: Optional[str] = None
    mac_address: Optional[str] = Field(default=None, validation_alias=AliasChoices("mac_address", "mac"))
    ip_address: Optional[str] = Field(default=None, validation_alias=AliasChoices("ip_address", "ip"))
    is_active: Optional[bool] = None


class AccessPointOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    id: int
    location_id: int
    name: str
    mac_address: str
    ip_address: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    location_name: Optional[str] = None
