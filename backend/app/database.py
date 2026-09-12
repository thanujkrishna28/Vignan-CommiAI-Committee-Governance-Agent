from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Create engine - handle channel_binding for Neon
DATABASE_URL = settings.DATABASE_URL
# Remove channel_binding param as psycopg2 doesn't support it directly
if "channel_binding=require" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("&channel_binding=require", "").replace("?channel_binding=require", "")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=20,
    pool_recycle=300,
    pool_timeout=30,
    connect_args={
        "connect_timeout": 10,
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    } if "sqlite" not in DATABASE_URL else {},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database - enable pgvector extension and create missing tables / columns."""
    try:
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            conn.execute(text("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS channel VARCHAR(50) DEFAULT 'IN_APP'"))
            conn.execute(text("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'UNREAD'"))
            conn.commit()
            logger.info("Database schema extensions and column migrations applied.")
    except Exception as e:
        logger.warning(f"Could not apply schema migrations: {e}")
    
    # Import models so they are registered with Base.metadata
    from app.models import models
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created / verified.")
