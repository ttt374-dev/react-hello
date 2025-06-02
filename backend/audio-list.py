from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path
import re
import json

app = FastAPI()

DATA_DIR = Path("data")

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

@app.get("/api/list")
async def list_titles():
    if not DATA_DIR.exists():
        raise HTTPException(status_code=500, detail="Data directory not found")

    titles = [d.name for d in DATA_DIR.iterdir() if d.is_dir()]
    return titles

@app.get("/api/audio/{title}")
async def get_audio(title: str):
    if not valid_title(title):
        raise HTTPException(status_code=400, detail="Invalid title")

    audio_path = DATA_DIR / title / "audio.mp3"
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")

    return FileResponse(audio_path, media_type="audio/mpeg")

@app.get("/api/transcripts/{title}")
async def get_transcript(title: str):
    if not valid_title(title):
        raise HTTPException(status_code=400, detail="Invalid title")

    transcript_path = DATA_DIR / title / "transcript.json"
    if not transcript_path.exists():
        raise HTTPException(status_code=404, detail="Transcript file not found")

    try:
        with open(transcript_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON in transcript")

    return JSONResponse(content=data)
