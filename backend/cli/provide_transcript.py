# provide_transcript.py

import sys
from pathlib import Path
from utils.transcription import process_audio_file

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python provide_transcript.py <path_to_audio_file>")
        sys.exit(1)

    audio_path = Path(sys.argv[1])
    try:
        result = process_audio_file(audio_path)
        print(f"[SUCCESS] Uploaded and queued: ID={result['id']}, job_id={result['job_id']}")
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)
