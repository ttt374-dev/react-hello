import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
//import { sharedButtonStyle } from "./utils/sharedButtonStyle"

export const sharedButtonStyle = {
  padding: "0.5rem 1rem",
  fontSize: "1rem",
  border: "1px solid #ccc",
  borderRadius: "0.5rem",
  background: "#007bff",
  color: "#fff",
  cursor: "pointer",
  marginRight: "0.5rem",
};

export default function FileUploader() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage("Uploading...");

    const formData = new FormData();
    formData.append("audio", file);
    //formData.append("extension", file.name.split(".").pop()); // e.g., "webm"

    try {
      const res = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setMessage("Upload success: " + data.message);
      navigate(`/u/${data.transcript_id}`); // ⬅️ Go to the transcript page
    } catch (err) {
      setMessage("Upload error: " + err.message);
    } finally {
      setUploading(false);
    }
  };
  const fileInputRef = useRef();
  
  return (
    <div style={{ padding: "1rem" }}>
      <input type="file" accept="audio/*" onChange={handleFileChange}
        disabled={uploading} style={{ display: 'none' }} ref={fileInputRef} />
      <button onClick={() => fileInputRef.current.click()}>Import</button>


      { /*
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        disabled={uploading}
        //style={{ ...sharedButtonStyle }}
      /> */}
      { /* <div style={{ marginTop: "1rem" }}>{message}</div>*/}
    </div>
  );
}
