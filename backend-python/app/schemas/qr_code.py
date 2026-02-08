from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class QRCodeBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    timetable_id: int
    code: str
    expires_at: datetime


class QRCodeCreate(QRCodeBase):
    pass


class QRCodeOut(QRCodeBase):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    id: int
    created_at: Optional[datetime] = None
    used_count: int = 0
