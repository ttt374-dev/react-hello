import { useRef } from "react";
import { useTranscriptData } from "./hooks/useTranscriptData";
import TranscriptViewer from "./components/TranscriptViewer";

export default function Transcript({ transcriptId }) {
  const { sentences, title } = useTranscriptData(transcriptId);
  const audioRef = useRef();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ padding: "1rem", background: "#222", color: "#fff", fontSize: "1.25rem", fontWeight: "bold" }}>
        🎧 Audio: <span style={{ color: "#0ff" }}>{title || transcriptId}</span>
      </div>

      { !sentences || sentences.length === 0 ? (
        <p style={{ width: "100%" }}>Loading transcript....</p>
      ):<TranscriptViewer sentences={sentences} audioRef={audioRef} 
       />}

      <div style={{ padding: "1rem", borderTop: "1px solid #ccc", background: "#fff" }}>
        <audio ref={audioRef} controls src={`http://localhost:8000/api/audio/${encodeURIComponent(transcriptId)}`} style={{ width: "100%" }} />
      </div>
    </div>
  );
}
