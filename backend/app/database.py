import logging
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

logger = logging.getLogger("winter_arc_db")
logger.setLevel(logging.INFO)

Base = declarative_base()

def get_engine():
    db_url = settings.DATABASE_URL
    if db_url.startswith("mysql"):
        try:
            # First try connecting to MySQL
            engine = create_engine(db_url, pool_recycle=3600, pool_pre_ping=True)
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Successfully connected to MySQL database.")
            return engine
        except Exception as e:
            logger.warning(f"Could not connect to MySQL at {db_url}: {e}")
            # Try connecting to MySQL server root to create database if missing
            try:
                base_url = db_url.rsplit("/", 1)[0]
                db_name = db_url.rsplit("/", 1)[1].split("?")[0]
                temp_engine = create_engine(base_url)
                with temp_engine.connect() as conn:
                    conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
                    conn.commit()
                engine = create_engine(db_url, pool_recycle=3600, pool_pre_ping=True)
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                logger.info(f"Created and connected to MySQL database '{db_name}'.")
                return engine
            except Exception as ex2:
                logger.warning(f"MySQL initialization failed ({ex2}). Falling back to local SQLite database.")
                sqlite_url = "sqlite:///./winter_arc.db"
                return create_engine(sqlite_url, connect_args={"check_same_thread": False})
    else:
        return create_engine(db_url, connect_args={"check_same_thread": False} if "sqlite" in db_url else {})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
