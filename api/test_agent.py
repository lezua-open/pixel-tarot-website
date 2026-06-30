import requests
import json

url = "http://127.0.0.1:8000/api/agent/reading/stream"
data = {
    "question": "test",
    "cards": [
        {
            "card_id": 0,
            "card_name": "愚者",
            "card_en": "THE FOOL",
            "reversed": False,
            "reading_text": ""
        }
    ]
}

try:
    response = requests.post(url, json=data, stream=True)
    print(f"Status: {response.status_code}")
    for line in response.iter_lines():
        if line:
            print(line.decode())
except Exception as e:
    print(f"Error: {e}")
