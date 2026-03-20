from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()
URL = os.getenv("DATABASE_URL")

if not URL:
    raise RuntimeError("DATABASE_URL environment variable is required")

engine = create_engine(
    URL,
    echo=os.getenv("DEBUG", "False").lower() == "true",
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
