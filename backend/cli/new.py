# new_transcript.py

from datetime import datetime
import uuid, os, sys, shutil
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, DateTime
from utils.models import Transcript, Base
from utils.database import SessionLocal
from config import clean_filename
from utils.transcribe import transcribe
from config import AUDIO_DIR, TRANSCRIPTS_DIR
# --- CLI Logic ---


def create_transcript(audio_path: str):
    if not os.path.exists(audio_path):
        print(f"Audio file not found: {audio_path}")
        sys.exit(1)

    os.makedirs(AUDIO_DIR, exist_ok=True)

    # UUID を生成
    transcript_id = str(uuid.uuid4())

    # 保存先パス
    ext = os.path.splitext(audio_path)[1]  # ".mp3"
    dest_audio_path = os.path.join(AUDIO_DIR, f"{transcript_id}{ext}")
    dest_transcripts_path = os.path.join(TRANSCRIPTS_DIR, f"{transcript_id}.json")

    # ファイルをコピー
    shutil.copyfile(audio_path, dest_audio_path)

    title = clean_filename(audio_path)
    # DB に登録
    db = SessionLocal()
    transcript = Transcript(
        id=transcript_id,
        title=title,
        created_at=datetime.utcnow()
    )
    db.add(transcript)
    db.commit()
    db.close()
    print(f"Transcript created: {transcript_id} ({title})")
    
    transcribe(dest_audio_path, dest_transcripts_path)    


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python new_transcript.py <audio_file>")
        sys.exit(1)

    audio_path_arg = sys.argv[1]
    create_transcript(audio_path_arg)