import { useState, useEffect } from "react";

export function getFormattedFilename(ext = "webm") {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `recording-${yyyy}-${mm}-${dd}-${hh}:${min}.${ext}`;
}

export async function uploadAudioBlob(blob, filename) {
  const formData = new FormData();
  const file = new File([blob], filename, { type: "audio/webm" });
  formData.append("audio", file);

  try {
    const res = await fetch("http://localhost:8000/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    alert("✅ Upload successful!");
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

export const pollTranscriptionStatus = (jobId) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/job_status/${jobId}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error: ${res.status} - ${text}`);
        }
        const data = await res.json();

        if (data.status === "finished" && data.result) {
          clearInterval(interval);
          resolve(data);
        } else if (data.status === "failed") {
          clearInterval(interval);
          reject(new Error(data.error || "Transcription failed"));
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, 3000);
  });
};

export function usePolling(jobId) {
  const [status, setStatus] = useState("pending");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0); // elapsed seconds

  useEffect(() => {
    if (!jobId) return;

    let intervalId;
    let startTime = Date.now();

    const poll = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/job_status/${jobId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        setStatus(data.status);

        if (data.status === "finished") {
          setResult(data.result);
          clearInterval(intervalId);
        } else if (data.status === "failed") {
          setError(data.error || "Transcription failed");
          clearInterval(intervalId);
        }
      } catch (e) {
        setError(e.message);
        clearInterval(intervalId);
      }
    };

    poll();

    intervalId = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
      poll();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [jobId]);

  return { status, result, error, elapsed };
}