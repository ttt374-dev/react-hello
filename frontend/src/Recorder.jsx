import { useState, useRef } from "react";

export default function Recorder() {
const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunks.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);

      // 🔽 fetch で送信
      const formData = new FormData();
      const file = new File([blob], "recording.webm", { type: "audio/webm" });
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

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Mic Recorder + Upload</h3>
      {recording ? (
        <button onClick={stopRecording}>Stop Recording</button>
      ) : (
        <button onClick={startRecording}>Start Recording</button>
      )}
      {audioURL && (
        <div style={{ marginTop: "1rem" }}>
          <audio src={audioURL} controls />
        </div>
      )}
    </div>
  );
}
