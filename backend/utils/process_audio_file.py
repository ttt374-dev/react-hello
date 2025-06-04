# utils/transcription.py

import os
import uuid
from datetime import datetime
from pathlib import Path
import re
import shutil
from utils.database import SessionLocal
from utils.models import Transcript
from rq import Queue
import redis
from utils.transcribe import transcribe
from config import AUDIO_DIR, TRANSCRIPTS_DIR
from config import clean_filename

# --- Setup Redis ---
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_conn = redis.from_url(redis_url)
q = Queue(connection=redis_conn, default_timeout=1800)


# --- Shared procedure ---
def process_audio_file(original_path: Path) -> dict:
    if not original_path.exists():
        raise FileNotFoundError(f"File not found: {original_path}")

    transcript_id = str(uuid.uuid4())
    title = clean_filename(original_path.name)
    dest_path = AUDIO_DIR / f"{transcript_id}.mp3"
    transcripts_path = TRANSCRIPTS_DIR / f"{transcript_id}.json"

    shutil.copy(original_path, dest_path)

    job = q.enqueue(transcribe, dest_path, transcripts_path)

    db = SessionLocal()
    transcript = Transcript(
        id=transcript_id,
        title=title,
        created_at=datetime.utcnow()
    )
    db.add(transcript)
    db.commit()
    db.close()

    return {
        "id": transcript_id,
        "title": title,
        "job_id": job.id
    }
