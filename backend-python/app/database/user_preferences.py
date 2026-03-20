from datetime import datetime, timezone
import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String

from app.database.database import Base


class ThemePreference(enum.Enum):
    LIGHT = "light"
    DARK = "dark"
    SYSTEM = "system"


class LanguagePreference(enum.Enum):
    EN = "en"
    HI = "hi"


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    theme = Column(Enum(ThemePreference), nullable=False, default=ThemePreference.SYSTEM)
    notification_email = Column(Boolean, nullable=False, default=True)
    language = Column(Enum(LanguagePreference), nullable=False, default=LanguagePreference.EN)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)
