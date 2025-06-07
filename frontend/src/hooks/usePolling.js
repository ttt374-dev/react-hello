import { useState, useEffect } from "react";

function usePolling(jobId) {
  const [status, setStatus] = useState("pending");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    let interval = null;

    const poll = async () => {
      try {
        const res = await fetch(`/api/job_status/${jobId}`);
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
    interval = setInterval(poll, 3000);

    return () => clearInterval(interval);
  }, [jobId]);

  return { status, result, error };
}

