from pathlib import Path
import os, re

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

AUDIO_DIR = DATA_DIR / "audio"
TRANSCRIPTS_DIR = DATA_DIR / "transcripts"

# --- Clean title helper ---
def clean_filename(filename: str) -> str:
    #base = os.path.splitext(filename)[0]
    base = os.path.splitext(os.path.basename(filename))[0]
    return re.sub(r'[^a-zA-Z0-9_]+', '_', base)
