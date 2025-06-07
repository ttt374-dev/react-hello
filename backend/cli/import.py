import sys
import requests
import os

API_URL = "http://localhost:8000/api/upload"  # 必要に応じて変更

def import_audio_file(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    with open(file_path, 'rb') as f:
        files = {'audio': (os.path.basename(file_path), f, 'audio/webm')}
        print(f"Uploading {file_path}...")
        try:
            response = requests.post(API_URL, files=files)
            response.raise_for_status()
            print("✅ Upload successful!")
            print("📄 Response:")
            print(response.json())
        except requests.exceptions.RequestException as e:
            print("❌ Upload failed:")
            print(e)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python cli/import.py <audio-file>")
        sys.exit(1)

    audio_file = sys.argv[1]
    import_audio_file(audio_file)
