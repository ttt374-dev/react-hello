import whisper
import json
import sys, os
from segmenter import segment_words_into_sentences

def transcribe_title(title):
    folder = os.path.join("./data", title)
    audio_path = os.path.join(folder, "audio.mp3")
    output_json = os.path.join(folder, "transcripts.json")

    if not os.path.exists(audio_path):
        print(f"Error: audio file not found at {audio_path}")
        return

    print("Loading Whisper model on CPU...")
    model = whisper.load_model("medium", device="cpu")

    print(f"Transcribing {audio_path} ...")
    result = model.transcribe(audio_path, word_timestamps=True)

    print("Processing transcript and splitting into sentences...")
    words = []
    for segment in result['segments']:
        for w in segment['words']:
            words.append({
                "text": w['word'].strip(),
                "start": w['start'],
                "end": w['end']
            })

    sentences = segment_words_into_sentences(words)

    os.makedirs(folder, exist_ok=True)

    print(f"Writing output to {output_json} ...")
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(sentences, f, indent=2, ensure_ascii=False)

    print("Done.")

def main():
    if len(sys.argv) < 2:
        print("Usage: python transcribe.py <title>")
        sys.exit(1)

    title = sys.argv[1]
    transcribe_title(title)

if __name__ == "__main__":
    main()