from datetime import datetime, timezone
import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String

from app.database.database import Base


class NotificationType(enum.Enum):
    INFO = "info"
    WARNING = "warning"
    SUCCESS = "success"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    message = Column(String(500), nullable=False)
    type = Column(Enum(NotificationType), nullable=False, default=NotificationType.INFO)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)
