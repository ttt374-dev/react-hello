from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from utils.models import Base
from pathlib import Path

# SQLite file
DATABASE_URL = "sqlite:///transcripts.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)

# Create tables
def init_db():
    db_file = Path("transcripts.db")
    if not db_file.exists():
        print("Database not found. Creating tables...")
        Base.metadata.create_all(bind=engine)
    else:
        # Optionally: check if table is missing and create
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        if "transcripts" not in tables:
            print("Missing 'transcripts' table. Creating...")
            Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()