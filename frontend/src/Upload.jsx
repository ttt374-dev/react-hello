import { useEffect, useState } from "react";

export default function Upload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  const handleUpload = () => {
    if (!file || !title) {
      alert("Please select a file and enter a title.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("title", title);

    fetch("http://127.0.0.1:8000/api/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Upload failed.");
        }
        return res.json();
      })
      .then((data) => {
        alert("Upload started. Transcription is processing.")
        if (onUploaded) onUploaded(title);
      })
      .catch((err) => {
        alert("Error: " + err.message);
      });
  };

  return (
    <div style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <h3>Upload Audio</h3>
      <input
        type="text"
        placeholder="Enter title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="file"
        accept="audio/mp3"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}