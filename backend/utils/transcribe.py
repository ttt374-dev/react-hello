import whisper
import json
import sys, os
from utils.segmenter import segment_words_into_sentences

def transcribe(input_audiofile, output_transcriptfile):
    if not os.path.exists(input_audiofile):
        print(f"Error: audio file not found at {input_audiofile}")
        return

    print("Loading Whisper model on CPU...")
    model = whisper.load_model("medium", device="cpu")

    print(f"Transcribing {input_audiofile} ...")
    result = model.transcribe(input_audiofile, word_timestamps=True)

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

    output_folder = os.path.dirname(output_transcriptfile)
    os.makedirs(output_folder, exist_ok=True)

    print(f"Writing output to {output_transcriptfile} ...")
    with open(output_transcriptfile, "w", encoding="utf-8") as f:
        json.dump(sentences, f, indent=2, ensure_ascii=False)

    print("Done.")

def main():
    if len(sys.argv) < 3:
        print("Usage: python transcribe.py <audio_file> <transcripts_file>")
        sys.exit(1)

    audio_file = sys.argv[1]
    transcripts_file = sys.argv[2]
    transcribe(audio_file, transcripts_file)

if __name__ == "__main__":
    main()