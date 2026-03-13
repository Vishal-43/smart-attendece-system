from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.database.user_preferences import LanguagePreference, ThemePreference


class UserPreferencesUpdate(BaseModel):
    theme: Optional[ThemePreference] = None
    notification_email: Optional[bool] = None
    language: Optional[LanguagePreference] = None


class UserPreferencesOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")

    id: int
    user_id: int
    theme: ThemePreference
    notification_email: bool
    language: LanguagePreference
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
