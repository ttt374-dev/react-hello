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
      const data = await uploadAudioFile(file)
      setJobId(data.job_id);
      setTranscriptId(data.transcript_id);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
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
  //const file = new File([blob], filename, { type: "audio/webm" });
  formData.append("audio", file);

  try {
    const res = await fetch("http://localhost:8000/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    //alert("✅ Upload successful!");
    const data = await res.json(); // e.g., { message, job_id }
    console.log(`job id: ${data.job_id}`)
    console.log(`transcript id: ${data.transcript_id}`)
    return data;

  } catch (err) {
    console.error(err);
    alert("❌ Upload failed: " + err.message);
    return null;
  }
}