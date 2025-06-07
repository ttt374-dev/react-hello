import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TranscriptPage from "./TranscriptPage";
import Layout from '../components/Layout';

export default function HomePage(){
  const navigate = useNavigate();
  const [latestTranscriptId, setLatestTranscriptId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestTranscript = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/list");
        const list = await res.json();

        if (list.length === 0) {
          setLatestTranscriptId(null);
          return;
        }

        const latest = list[0]; // assuming newest comes first
        console.log("latest id", latest.id)
        setLatestTranscriptId(latest.id);
      } catch (err) {
        console.error("Failed to load latest transcript", err);
        setLatestTranscriptId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestTranscript();
  }, []);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {!loading && !latestTranscriptId && <p>No transcript available.</p>}
      {latestTranscriptId && (
        <TranscriptPage transcriptId={latestTranscriptId} />
      )}
    </div>
    
  )
}


