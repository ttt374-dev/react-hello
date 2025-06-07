import { useState, useRef } from "react";
import Recording from "./Recording";
import Import from "./Import";
import JobStatus from "./components/TranscriptJobStatus";
import useTranscriptionJob from "./hooks/useTranscriptionJob";

export default function AudioPage() {
  const [mode, setMode] = useState("recording"); // or "import"

  const {
    jobId,
    transcriptId,
    uploading,
    status,
    result,
    error,
    elapsed,
    startUpload,
  } = useTranscriptionJob();

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setMode("recording")} disabled={mode === "recording"}>
          Recording
        </button>
        <button onClick={() => setMode("import")} disabled={mode === "import"} style={{ marginLeft: 8 }}>
          Import
        </button>
      </div>

      <div style={{ minHeight: "400px" }}>
        {mode === "recording" ? (
          <Recording startUpload={startUpload} />
        ) : (
          <Import startUpload={startUpload} uploading={uploading} />
        )}
      </div>

      <div style={{ marginTop: "2rem" }}>
        <JobStatus status={status} jobId={jobId} transcriptId={transcriptId} elapsed={elapsed} error={error} />
      </div>
    </div>
  );
}
