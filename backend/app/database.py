from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import DATABASE_URL

# SQLite configuration: check_same_thread=False for async FastAPI compatibility
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def run_migrations():
    """Ensures newly added columns exist in SQLite database without losing data."""
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            result = conn.execute(text("PRAGMA table_info(complaints)"))
            columns = [row[1] for row in result.fetchall()]
            if columns:  # Table exists
                new_cols = [
                    ("latitude", "FLOAT"),
                    ("longitude", "FLOAT"),
                    ("landmark", "VARCHAR(255)"),
                    ("city", "VARCHAR(100) DEFAULT 'Bengaluru'"),
                    ("district", "VARCHAR(100) DEFAULT 'Bengaluru Urban'"),
                    ("pincode", "VARCHAR(20)"),
                    ("nearest_police_station", "VARCHAR(255)"),
                    ("location_tracking_stage", "VARCHAR(50) DEFAULT 'GPS_TAGGED'"),
                ]
                for col_name, col_def in new_cols:
                    if col_name not in columns:
                        conn.execute(text(f"ALTER TABLE complaints ADD COLUMN {col_name} {col_def}"))
                conn.commit()
        except Exception:
            pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
