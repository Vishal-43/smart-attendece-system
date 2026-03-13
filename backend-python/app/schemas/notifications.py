from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.database.notifications import NotificationType


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")

    id: int
    user_id: int
    title: str
    message: str
    type: NotificationType
    is_read: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class NotificationListOut(BaseModel):
    items: list[NotificationOut]
    total: int
    page: int
    limit: int


class MarkNotificationReadRequest(BaseModel):
    is_read: bool = Field(default=True)
