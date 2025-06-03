# new_transcript.py

import argparse
from datetime import datetime
import uuid, os, sys, shutil
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, DateTime
from models import Transcript, Base
from database import SessionLocal

engine = create_engine("sqlite:///transcripts.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base.metadata.create_all(bind=engine)

# --- CLI Logic ---

# 対象ディレクトリ
AUDIO_DIR = "data/audio"

def create_transcript(title: str, audio_path: str):
    if not os.path.exists(audio_path):
        print(f"Audio file not found: {audio_path}")
        sys.exit(1)

    os.makedirs(AUDIO_DIR, exist_ok=True)

    # UUID を生成
    transcript_id = str(uuid.uuid4())

    # 保存先パス
    ext = os.path.splitext(audio_path)[1]  # ".mp3"
    dest_audio_path = os.path.join(AUDIO_DIR, f"{transcript_id}{ext}")

    # ファイルをコピー
    shutil.copyfile(audio_path, dest_audio_path)

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


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python new_transcript.py \"Title Here\" path/to/audio.mp3")
        sys.exit(1)

    title_arg = sys.argv[1]
    audio_path_arg = sys.argv[2]
    create_transcript(title_arg, audio_path_arg)