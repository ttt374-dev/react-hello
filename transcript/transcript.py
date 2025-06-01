import whisper

def format_timestamp(seconds: float) -> str:
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = seconds % 60
    return f"{hours:02}:{minutes:02}:{secs:06.3f}".replace('.', ',')

def whisper_to_vtt(segments, output_path="transcript.vtt"):
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for segment in segments:
            start = format_timestamp(segment['start'])
            end = format_timestamp(segment['end'])
            text = segment['text'].strip()
            f.write(f"{start} --> {end}\n{text}\n\n")

model = whisper.load_model("base")
result = model.transcribe("audio.mp3", task="transcribe", verbose=True)
whisper_to_vtt(result['segments'])  # creates transcript.vtt

