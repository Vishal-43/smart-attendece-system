import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    JWT_SECRET = os.getenv("JWT_SECRET")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 15))
    REFRESH_TOKEN_EXPIRE_MINUTES = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", 10080))
    DATABASE_URL = os.getenv("DATABASE_URL")
    DEBUG = os.getenv("debug", "False").lower() == "true"
    
    QR_DEFAULT_TTL_MINUTES = int(os.getenv("QR_DEFAULT_TTL_MINUTES", 10))
    OTP_DEFAULT_TTL_MINUTES = int(os.getenv("OTP_DEFAULT_TTL_MINUTES", 5))
    OTP_LENGTH = int(os.getenv("OTP_LENGTH", 6))
    
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

    SMTP_HOST = os.getenv("SMTP_HOST", None)
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER = os.getenv("SMTP_USER", None)
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", None)
    SMTP_FROM_ADDRESS = os.getenv("SMTP_FROM_ADDRESS", "noreply@smartattendance.com")
    SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Smart Attendance")

    REDIS_HOST = os.getenv("REDIS_HOST", None)
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    REDIS_DB = int(os.getenv("REDIS_DB", 0))
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)


settings = Settings()
