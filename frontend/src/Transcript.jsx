import { useRef, useState, useEffect } from "react";
import { useTranscriptData } from "./hooks/useTranscriptData";
import TranscriptViewer from "./components/TranscriptViewer";

export default function Transcript({ transcriptId }) {
  const { sentences, title } = useTranscriptData(transcriptId);
  const audioRef = useRef();

  const [editTitle, setEditTitle] = useState(title);
  const [status, setStatus] = useState("idle");

  // Update state when fetched title changes
  useEffect(() => {
    setEditTitle(title);
  }, [title]);

  const handleTitleChange = (e) => {
    setEditTitle(e.target.value);
  };

  const handleTitleSave = () => {
    setStatus("saving...");
    fetch("http://localhost:8000/api/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: transcriptId,
        title: editTitle,
      }),
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
        alert("Transcript deleted.");
        window.location.href = "/"; // navigate to home or list page
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ padding: "1rem", background: "#222", color: "#fff", fontSize: "1.25rem", fontWeight: "bold" }}>
        🎧 Audio:{" "}
        <input
          value={editTitle || ""}
          onChange={handleTitleChange}
          onBlur={handleTitleSave}
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
        <span style={{ marginLeft: "1rem", fontSize: "0.9rem", color: "#aaa" }}>{status}</span>
         <button
          onClick={handleDelete}
          style={{
            backgroundColor: "#c00",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            borderRadius: "4px"
          }}
        >
          Delete
        </button>
      </div>
      
      {(!sentences || sentences.length === 0) ? (
        <p style={{ width: "100%" }}>Loading transcript....</p>
      ) : (
        <TranscriptViewer sentences={sentences} audioRef={audioRef} />
      )}

      <div style={{ padding: "1rem", borderTop: "1px solid #ccc", background: "#fff" }}>
        <audio
          ref={audioRef}
          controls
          src={`http://localhost:8000/api/audio/${encodeURIComponent(transcriptId)}`}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}

