import sounddevice as sd
import soundfile as sf
from pydub import AudioSegment
import uuid
import os

DURATION = 5  # seconds
SAMPLE_RATE = 44100
CHANNELS = 1
TEMP_WAV = "temp_recording.wav"
OUTPUT_MP3 = f"recording_{uuid.uuid4().hex[:8]}.mp3"

print("Recording... Speak into the mic.")
audio_data = sd.rec(int(DURATION * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=CHANNELS)
sd.wait()  # Wait for the recording to finish
print("Recording complete.")

# Save to WAV
sf.write(TEMP_WAV, audio_data, SAMPLE_RATE)

# Convert to MP3 using pydub (which uses ffmpeg)
sound = AudioSegment.from_wav(TEMP_WAV)
sound.export(OUTPUT_MP3, format="mp3")
print(f"Saved as {OUTPUT_MP3}")

# Clean up temp file
os.remove(TEMP_WAV)
