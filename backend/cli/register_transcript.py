import os
import sys
import uuid
import shutil
import json
from datetime import datetime
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.utils.models import Base, Transcript
from backend.utils.transcribe import transcribe

# Constants
AUDIO_DIR = Path("data/audio")
TRANSCRIPT_DIR = Path("data/transcripts")
DB_PATH = "sqlite:///data/db.sqlite3"

def main():
    if len(sys.argv) != 2:
        print("Usage: python register_transcript.py foo.mp3")
        sys.exit(1)

    input_path = Path(sys.argv[1])
    if not input_path.exists():
        print(f"File not found: {input_path}")
        sys.exit(1)

    # Setup
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    TRANSCRIPT_DIR.mkdir(parents=True, exist_ok=True)

    transcript_id = str(uuid.uuid4())
    title = input_path.stem

    # Copy audio file
    audio_dest = AUDIO_DIR / f"{transcript_id}.mp3"
    shutil.copy(input_path, audio_dest)
    print(f"Copied audio to: {audio_dest}")

    # Insert into DB
    engine = create_engine(DB_PATH)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    new_transcript = Transcript(id=transcript_id, title=title, created_at=datetime.utcnow())
    session.add(new_transcript)
    session.commit()
    session.close()

    # Transcribe
    transcript_path = TRANSCRIPT_DIR / f"{transcript_id}.json"
    transcript_data = transcribe(input_path, transcript_path)    
    
    print(f"Saved transcript to: {transcript_path}")    
    print(f"Registered transcript: {transcript_id} ({title})")

if __name__ == "__main__":
    main()
