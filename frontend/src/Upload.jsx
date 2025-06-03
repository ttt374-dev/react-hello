import { useEffect, useState } from "react";

export default function Upload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);

  const handleUpload = () => {
    const formData = new FormData();
    formData.append("audio", file);
    //formData.append("title", title);

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
        setJobId(data.job_id);
        pollJobStatus(data.job_id, (result) => {
          setStatus("done");
        }, (err) => {
          setStatus("error: " + err);
        });
        if (onUploaded) onUploaded(title);
      })
      .catch((err) => {
        alert("Error: " + err.message);
      });
  };

  function pollJobStatus(jobId, onSuccess, onError) {
  const interval = setInterval(() => {
    fetch(`http://localhost:8000/api/job_status?job_id=${jobId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Job status:", data.status);
        if (data.status === "finished") {
          clearInterval(interval);
          onSuccess(data.result);
        } else if (data.status === "failed") {
          clearInterval(interval);
          onError(data.error);
        }
      })
      .catch((err) => {
        clearInterval(interval);
        onError("Failed to check job status: " + err.message);
      });
    }, 3000); // poll every 3 seconds
  }

  return (
    <div style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <h3>Upload Audio</h3>      
      <input
        type="file"
        accept="audio/mp3"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}