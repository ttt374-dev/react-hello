import { useState, useRef, useEffect } from "react";
import { getFormattedFilename, uploadAudioBlob } from "./utils/recording";
import { startVolumeMonitor, stopVolumeMonitor } from "./utils/volumeMonitor";

export default function Recorder() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [volume, setVolume] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

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

      uploadAudioBlob(blob, getFormattedFilename("webm"))
    };

    startVolumeMonitor(stream, setVolume)


    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
    stopVolumeMonitor()
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
        <VolumeMeter volume={volume} />
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
const VolumeMeter = ({ volume }) => {
  return (
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
  );
};