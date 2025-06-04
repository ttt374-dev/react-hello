import sys
import requests

def delete_transcript(transcript_id):
    url = f"http://localhost:8000/api/delete/{transcript_id}"
    response = requests.delete(url)

    if response.status_code == 204:
        print(f"✅ Transcript {transcript_id} deleted successfully.")
    elif response.status_code == 404:
        print(f"❌ Transcript {transcript_id} not found.")
    else:
        print(f"⚠️ Failed to delete transcript {transcript_id}.")
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python delete_transcript.py <transcript_id>")
        sys.exit(1)

    transcript_id = sys.argv[1]
    delete_transcript(transcript_id)
