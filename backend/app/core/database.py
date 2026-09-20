import os
import shutil
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.app.core.config import settings, BASE_DIR, IS_VERCEL

# Seed SQLite database in /tmp if running in serverless environment
if IS_VERCEL and settings.DATABASE_URL.startswith("sqlite:////tmp/"):
    tmp_db_path = Path("/tmp/datasense.db")
    seed_db = BASE_DIR / "datasense.db"
    if seed_db.exists() and not tmp_db_path.exists():
        try:
            shutil.copy2(str(seed_db), str(tmp_db_path))
        except Exception:
            pass

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
