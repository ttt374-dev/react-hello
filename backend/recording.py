import sounddevice as sd
import soundfile as sf
import os
import uuid
from datetime import datetime

# 設定
DURATION = 10  # 秒
SAMPLE_RATE = 44100
CHANNELS = 2
OUTPUT_WAV = f"recording_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}.wav"

# PulseAudio を明示的に指定（ALSA ではなく）
sd.default.device = ('pulse', 'pulse')

print(f"🔴 Recording from PulseAudio for {DURATION} seconds...")
audio = sd.rec(int(DURATION * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=CHANNELS)
sd.wait()  # 録音完了まで待機
print("✅ Recording complete.")

# WAVとして保存
sf.write(OUTPUT_WAV, audio, SAMPLE_RATE)
print(f"💾 Saved to {OUTPUT_WAV}")
