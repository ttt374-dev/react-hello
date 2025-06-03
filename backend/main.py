from fastapi import FastAPI, HTTPException, File, UploadFile, BackgroundTasks, WebSocket, Form, APIRouter, Depends
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, SessionLocal
from sqlalchemy import desc
from models import Transcript
from pathlib import Path
from rq import Queue
from rq.job import Job
from jobs import say_hello
from transcribe import transcribe_title
import os, re, json, subprocess
import redis
import uuid, os, sys, shutil
from datetime import datetime

DATA_DIR = Path("data")
app = FastAPI()
# Allow CORS for frontend during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust in prod    
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#redis_conn = redis.from_url("redis://127.0.0.1:6379")
#redis_conn = redis.from_url("redis://host.docker.internal:6379")
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_conn = redis.from_url(redis_url)
q = Queue(connection=redis_conn, default_timeout=1800)


# Helper: validate title param to avoid path traversal
def valid_title(title: str) -> bool:
    return re.fullmatch(r"[a-zA-Z0-9-_]+", title) is not None

@app.get("/api/list")
def list_transcripts(db: Session = Depends(get_db)):
    transcripts = db.query(Transcript).order_by(desc(Transcript.created_at)).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "created_at": t.created_at.isoformat()
        }
        for t in transcripts
    ]
@app.get("/api/audio/{id}")
async def get_audio(id: str):
    if not valid_title(id):
        raise HTTPException(status_code=400, detail="Invalid title")

    audio_path = DATA_DIR / "audio" / f"{id}.mp3"
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")

    return FileResponse(audio_path, media_type="audio/mpeg")

@app.get("/api/transcripts/{id}")
async def get_transcript(id: str):
    if not valid_title(id):
        raise HTTPException(status_code=400, detail="Invalid title")

    transcript_path = DATA_DIR / "transcripts" / f"{id}.json"
    if not transcript_path.exists():
        raise HTTPException(status_code=404, detail="Transcript file not found")

    try:
        with open(transcript_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON in transcript")

    return JSONResponse(content=data)

@app.post("/api/upload")
async def upload_audio(title: str = Form(...), audio: UploadFile = File(...), bg: BackgroundTasks = BackgroundTasks()):
    transcript_id = str(uuid.uuid4())
    path = f"data/audio/{transcript_id}.mp3"
    #os.makedirs(f"data/{title}", exist_ok=True)
    with open(path, "wb") as f:
        f.write(await audio.read())

    # Launch subprocess for transcription
    #subprocess.Popen(["python", "transcribe.py", str(title)])
    job = q.enqueue(transcribe_title, transcript_id)    
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
    return JSONResponse({"message": "Upload success. Transcription started.", "job_id": job.id})

@app.get("/api/job_status/{job_id}")
def get_job_status(job_id):
    try:
        job = Job.fetch(job_id, connection=redis_conn)
        return {
            "status": job.get_status(),
            "result": job.result,
            "error": str(job.exc_info) if job.is_failed else None,
        }
    except Exception as e:
        return {"error": str(e)}
