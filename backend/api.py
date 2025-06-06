import os, re, json, uuid

from fastapi import FastAPI, HTTPException, File, UploadFile, BackgroundTasks, WebSocket, Form, APIRouter, Depends, status
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path 
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from utils.database import get_db, SessionLocal
from sqlalchemy import desc
from utils.models import Transcript
from pathlib import Path
from rq.job import Job
from pydantic import BaseModel
from uuid import UUID
from pydub import AudioSegment
import redis

from utils.process_audio_file import process_audio_file
from utils.database import init_db
from config import clean_filename
from config import AUDIO_DIR, TMP_DIR

# Connect to Redis (adjust host/port if needed)
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_conn = redis.from_url(redis_url)

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
# Helper: validate title param to avoid path traversal
def valid_title(title: str) -> bool:
    return re.fullmatch(r"[a-zA-Z0-9-_]+", title) is not None

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/api/list")
def list_transcripts(db: Session = Depends(get_db)):
    try:
        transcripts = db.query(Transcript).order_by(desc(Transcript.created_at)).all()
    except OperationalError:
        # Could not query because DB or table might not exist yet
        return []
    return [
        {
            "id": t.id,
            "title": t.title,
            "created_at": t.created_at.isoformat()
        }
        for t in transcripts
    ]

@app.get("/api/details/{id}")
def get_transcript_detail(id: UUID, db: Session = Depends(get_db)):
    transcript = db.query(Transcript).filter(Transcript.id == str(id)).first()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")

    return {
        "id": transcript.id,
        "title": transcript.title,
        "created_at": transcript.created_at,
    }

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


def convert_to_mp3(input_path: str, output_path: str) -> None:
    sound = AudioSegment.from_file(input_path)
    sound.export(output_path, format="mp3")

@app.post("/api/upload")
async def upload_audio(audio: UploadFile = File(...)):
    base, ext = os.path.splitext(audio.filename)

    input_path = AUDIO_DIR / audio.filename
    output_path = AUDIO_DIR / f"{base}.mp3"

    # Save uploaded file
    with open(input_path, "wb") as f:
        f.write(await audio.read())

    # Convert to MP3 if needed
    if ext != ".mp3":
        convert_to_mp3(input_path, output_path)
        os.remove(input_path)
        final_path = output_path
    else:
        final_path = input_path

    result = process_audio_file(final_path, clean_filename(audio.filename))
    return JSONResponse({"message": "Upload success. Transcription started.", "transcript_id": result["id"], "job_id": result["job_id"]})

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


class UpdateRequest(BaseModel):
    id: str
    title: str

@app.patch("/api/update")
def update_title(req: UpdateRequest, db: Session = Depends(get_db)):
    transcript = db.query(Transcript).filter_by(id=req.id).first()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")

    transcript.title = req.title
    db.commit()
    return {"message": "Title updated successfully"}


@app.delete("/api/delete/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transcript(id: UUID, db: Session = Depends(get_db)):
    transcript = db.query(Transcript).filter(Transcript.id == str(id)).first()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")

    # Delete files
    audio_path = DATA_DIR / "audio" / f"{transcript.id}.mp3"
    transcript_path = DATA_DIR / "transcripts" / f"{transcript.id}.json"

    if audio_path.exists():
        audio_path.unlink()
    if transcript_path.exists():
        transcript_path.unlink()

    # Delete DB record
    db.delete(transcript)
    db.commit()

    return  # 204 No Content