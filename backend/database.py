import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load backend/.env
load_dotenv(Path(__file__).parent / ".env")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://aegis:aegis@localhost:5432/aegisdb",
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()