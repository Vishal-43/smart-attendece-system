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


settings = Settings()
