import whisper
import json
import re
import torch

# Load Whisper model that supports word-level timestamps
model = whisper.load_model("small", device="cpu")  # Or "large"

# Transcribe the audio
result = model.transcribe("./audio.mp3", word_timestamps=True)

# Step 1: Extract word-level transcript
words = []
for segment in result["segments"]:
    for word in segment.get("words", []):
        words.append({
            "word": word["word"].strip(),
            "start": round(word["start"], 2),
            "end": round(word["end"], 2)
        })

# Save word-level transcript to words.json
with open("words.json", "w", encoding="utf-8") as f:
    json.dump(words, f, ensure_ascii=False, indent=2)

print("✅ Saved word-level transcript to words.json")

# Step 2: Group into sentences
sentences = []
current_sentence = ""
start_time = None

def is_end_of_sentence(word):
    return re.search(r'[.?!]$', word)

for i, word_info in enumerate(words):
    word_text = word_info["word"]
    if not word_text:
        continue

    if start_time is None:
        start_time = word_info["start"]

    current_sentence += word_text + " "

    if is_end_of_sentence(word_text) or i == len(words) - 1:
        end_time = word_info["end"]
        sentence = current_sentence.strip()
        sentences.append({
            "sentence": sentence,
            "start": round(start_time, 2),
            "end": round(end_time, 2)
        })
        # Reset for next
        current_sentence = ""
        start_time = None

# Save to sentences.json
with open("sentences.json", "w", encoding="utf-8") as f:
    json.dump(sentences, f, ensure_ascii=False, indent=2)

print("✅ Saved sentence-level transcript to sentences.json")

