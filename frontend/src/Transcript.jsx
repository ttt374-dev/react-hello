import { useRef, useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { useTranscriptData } from "./hooks/useTranscriptData";
import TranscriptViewer from "./components/TranscriptViewer";
import List from "./List"
import Layout from "./Layout";



export default function Transcript() {
  const { transcriptId } = useParams()
  const { sentences, title, createdAt } = useTranscriptData(transcriptId);
  const audioRef = useRef();

  const [editTitle, setEditTitle] = useState(title);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    setEditTitle(title);
  }, [title]);

  //const handleTitleChange = (e) => setEditTitle(e.target.value);

  const handleTitleSave = () => {
    setStatus("saving...");
    fetch("http://localhost:8000/api/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: transcriptId, title: editTitle }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update");
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 1000);
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this transcript?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/delete/${encodeURIComponent(transcriptId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        window.location.href = "/";
      } else {
        const msg = await res.text();
        alert("Delete failed: " + msg);
      }
    } catch (err) {
      console.error(err);
      alert("Delete error occurred.");
    }
  };

  return (
    <Layout>
      {/* Header */}
      <TranscriptHeaderTitle
        title={editTitle}
        setTitle={setEditTitle}
        status={status}
        onSave={handleTitleSave}
        onDelete={handleDelete}
      />

      {/* Timestamp */}
      <div style={{
        fontSize: "0.9rem",
        color: "#aaa",
        margin: "0.25rem 1rem",
        flexShrink: 0,
      }}>
        created at: {new Date(createdAt).toLocaleString()}
      </div>

      {/* Scrollable Transcript */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "1rem",
        background: "#f4f4f4",
      }}>
        {(!sentences || sentences.length === 0) ? (
          <p>Loading transcript....</p>
        ) : (
          <TranscriptViewer sentences={sentences} audioRef={audioRef} />
        )}
      </div>

      {/* Footer (Audio Player) */}

      <TranscriptAudioPlayer audioRef={audioRef} transcriptId={transcriptId} />
    </Layout>
  );
}
// components/TranscriptHeaderTitle.js
function TranscriptHeaderTitle({
  title,
  setTitle,
  status,
  onSave,
  onDelete,
}) {
  const handleChange = (e) => setTitle(e.target.value);

  return (
    <div style={{
      padding: "1rem",
      background: "#222",
      color: "#fff",
      fontSize: "1.25rem",
      fontWeight: "bold",
      flexShrink: 0,
    }}>
      🎧 Audio:{" "}
      <input
        value={title || ""}
        onChange={handleChange}
        onBlur={onSave}
        style={{
          fontSize: "1.1rem",
          fontWeight: "bold",
          color: "#0ff",
          background: "transparent",
          border: "none",
          borderBottom: "1px solid #0ff",
          outline: "none",
          width: "60%",
        }}
      />
      <span style={{ marginLeft: "1rem", fontSize: "0.9rem", color: "#aaa" }}>
        {status}
      </span>
      <button
        onClick={onDelete}
        style={{
          backgroundColor: "#c00",
          color: "#fff",
          border: "none",
          padding: "0.5rem 1rem",
          cursor: "pointer",
          borderRadius: "4px",
          marginLeft: "1rem",
        }}
      >
        Delete
      </button>
    </div>
  );
}

// components/TranscriptAudioPlayer.js
function TranscriptAudioPlayer({ audioRef, transcriptId }) {
  return (
    <div style={{
      padding: "1rem",
      borderTop: "1px solid #ccc",
      background: "#fff",
      flexShrink: 0,
    }}>
      <audio
        ref={audioRef}
        controls
        src={`http://localhost:8000/api/audio/${encodeURIComponent(transcriptId)}`}
        style={{ width: "100%" }}
      />
    </div>
  );
}
