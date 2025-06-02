import whisper
import json
import re

def segment_words_into_sentences(words):
    sentences = []
    sentence_words = []
    sentence_start = None
    sentence_end = None

    for w in words:
        if sentence_start is None:
            sentence_start = w['start']

        sentence_words.append(w)
        sentence_end = w['end']

        # Sentence break on punctuation: ., !, ?
        if re.search(r"[.!?]$", w['text']):
            sentence_text = " ".join(word['text'] for word in sentence_words)
            sentence_text = re.sub(r"\s+([.!?])", r"\1", sentence_text)

            sentences.append({
                "sentence": sentence_text,
                "start": sentence_start,
                "end": sentence_end,
                "words": [
                    {"word": word['text'], "start": word['start'], "end": word['end']}
                    for word in sentence_words
                ],
            })

            sentence_words = []
            sentence_start = None
            sentence_end = None

    # Add leftover words as last sentence
    if sentence_words:
        sentence_text = " ".join(word['text'] for word in sentence_words)
        sentence_text = re.sub(r"\s+([.!?])", r"\1", sentence_text)
        sentences.append({
            "sentence": sentence_text,
            "start": sentence_start,
            "end": sentence_end,
            "words": [
                {"word": word['text'], "start": word['start'], "end": word['end']}
                for word in sentence_words
            ],
        })

    return sentences

def main():
    audio_path = "audio.mp3"
    output_json = "transcript.json"

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

    print(f"Writing output to {output_json} ...")
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(sentences, f, indent=2, ensure_ascii=False)

    print("Done.")

if __name__ == "__main__":
    main()
