import argparse
import requests

def upload_audio(file_path):
    url = f"http://localhost:8000/api/upload"
    with open(file_path, "rb") as f:
        files = {"audio": (file_path, f, "audio/mpeg")}
        response = requests.post(url, files=files)
    
    if response.ok:
        print("✅ Upload successful")
        print(response.json())
    else:
        print("❌ Upload failed:", response.status_code)
        print(response.text)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload audio file to server.")
    parser.add_argument("audio", help="Path to the .mp3 audio file")    

    args = parser.parse_args()
    upload_audio(args.audio)
