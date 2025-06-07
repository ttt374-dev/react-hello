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
  const file = new File([blob], filename, { type: "audio/webm" });
  return uploadAudioFile(file)  
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

{/* 

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

*/}