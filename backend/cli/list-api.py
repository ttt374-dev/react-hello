import argparse
import requests, json

def list():
    url = f"http://localhost:8000/api/list"
    response = requests.get(url)
    if response.ok:        
        print(json.dumps(response.json(), indent=2))
    else:
        print("❌ failed:", response.status_code)
        print(response.text)

if __name__ == "__main__":
    list()