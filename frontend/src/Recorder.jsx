import { useState, useRef, useEffect } from "react";

export default function Recorder() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [volume, setVolume] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  const getFormattedFilename = (ext) => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `recording-${yyyy}-${mm}-${dd}-${hh}:${min}.${ext}`;
  };
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Start MediaRecorder
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunks.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);

      // Upload
      const formData = new FormData();
      const file = new File([blob], getFormattedFilename("webm"), { type: "audio/webm" });
      formData.append("audio", file);

      fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      })
        .then((res) => {
          if (!res.ok) throw new Error("Upload failed");
          return res.json();
        })
        .then((data) => {
          alert("Upload success: " + data.message);
        })
        .catch((err) => {
          alert("Upload error: " + err.message);
        });
    };

    // Setup volume monitoring
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
    sourceRef.current.connect(analyserRef.current);

    analyserRef.current.fftSize = 256;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVolume = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      setVolume(average);
      animationFrameRef.current = requestAnimationFrame(updateVolume);
    };

    updateVolume();

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);

    // Stop volume monitoring
    cancelAnimationFrame(animationFrameRef.current);
    sourceRef.current?.disconnect();
    analyserRef.current?.disconnect();
    audioContextRef.current?.close();
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h3>🎤 Recorder</h3>

      {recording ? (
        <button onClick={stopRecording}>Stop Recording</button>
      ) : (
        <button onClick={startRecording}>Start Recording</button>
      )}

      {/* Volume Meter */}
      {recording && (
        <div style={{ marginTop: "1rem", height: "10px", background: "#ccc" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, volume)}%`,
              background: "limegreen",
              transition: "width 0.1s",
            }}
          />
        </div>
      )}

      {/* Playback */}
      {audioURL && (
        <div style={{ marginTop: "1rem" }}>
          <audio src={audioURL} controls />
        </div>
      )}
    </div>
  );
}
