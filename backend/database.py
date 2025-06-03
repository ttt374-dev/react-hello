from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base

# SQLite file
DATABASE_URL = "sqlite:///transcripts.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)

# Create tables
def init_db():
    Base.metadata.create_all(bind=engine)
