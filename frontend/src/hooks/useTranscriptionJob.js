// useTranscriptionJob.js
import { useState } from "react";
//import { uploadAudioFile } from "./utils/recording";
import usePolling from "./usePolling"; // Your existing polling hook

export default function useTranscriptionJob() {
  const [jobId, setJobId] = useState("");
  const [transcriptId, setTranscriptId] = useState("");
  const [uploading, setUploading] = useState(false);

  const startUpload = async (file) => {
  setUploading(true);
  try {
      const data = await uploadAudioFile(file);
      setJobId(data.job_id);
      setTranscriptId(data.transcript_id);
  } catch (err) {
      console.error("Upload failed:", err);
      alert("❌ Upload failed: " + err.message);
  } finally {
      setUploading(false);
  }
  };

  const polling = usePolling(jobId);

  return {
    jobId,
    transcriptId,
    uploading,
    startUpload,
    ...polling,
  };
}

export async function uploadAudioFile(file) {
  const formData = new FormData();
  formData.append("audio", file);

  const res = await fetch("http://localhost:8000/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Upload failed");
  }

  return data;
}