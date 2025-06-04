# list_transcripts.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, String, DateTime
from datetime import datetime
from utils.models import Transcript
from utils.database import init_db

# DB接続とセッション
engine = create_engine("sqlite:///transcripts.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()

def list_transcripts():
    transcripts = session.query(Transcript).all()
    if not transcripts:
        print("No transcripts found.")
        return
    print(f"{'ID':36} | {'Title':20} | {'Created At'}")
    print("-" * 80)
    for t in transcripts:
        print(f"{t.id:36} | {t.title:20} | {t.created_at.strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    init_db()
    list_transcripts()
