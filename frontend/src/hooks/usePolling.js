import { useState, useEffect } from "react";

export default function usePolling(jobId) {
  const [status, setStatus] = useState("pending");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0); 

  useEffect(() => {
    if (!jobId) return;

    let interval = null;
    let startTime = Date.now();

    const poll = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/job-status/${jobId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        setStatus(data.status);

        if (data.status === "finished") {
          setResult(data.result);
          clearInterval(interval);
        } else if (data.status === "failed") {
          setError(data.error || "Transcription failed");
          clearInterval(interval);
        }
      } catch (e) {
        setError(e.message);
        clearInterval(interval);
      }
    };

    poll();
    //interval = setInterval(poll, 3000);
    interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
      poll();
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId]);

  return { status, result, error, elapsed };
}

