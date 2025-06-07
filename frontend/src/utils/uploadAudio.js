import { useState, useEffect } from "react";
import usePolling from "../hooks/usePolling";

{/* 
export async function uploadAudioBlob(blob) {
  const filename = getFormattedFilename("webm")
  const file = new File([blob], filename, { type: "audio/webm" });
  return uploadAudioFile(file)  
}
*/}
export async function uploadAudioFile(file) {
  const formData = new FormData();
  //const file = new File([blob], filename, { type: "audio/webm" });
  formData.append("audio", file);

  try {
    const res = await fetch("http://localhost:8000/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();  // read the response body either way
    if (!res.ok) {
      console.log("upload error", data.detail)
      throw new Error(data.detail || "Upload failed");
    }

    //alert("✅ Upload successful!");
    //const data = await res.json(); // e.g., { message, job_id }
    console.log(`job id: ${data.job_id}`)
    console.log(`transcript id: ${data.transcript_id}`)
    return data;

  } catch (err) {
    console.error(err);
    alert("❌ Upload failed: " + err.message);
    return null;
  }
}
