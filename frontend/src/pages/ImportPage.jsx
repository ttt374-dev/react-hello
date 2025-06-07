import { useState, useRef, useEffect } from "react";
import { Link } from 'react-router-dom';
import List from "../components/List"
import useTranscriptionJob from "../hooks/useTranscriptionJob";
import TranscriptJobStatus from "../components/TranscriptJobStatus";
import Layout from "../components/Layout";
import formatSeconds from "../utils/formatSeconds";

export default function ImportPage() {  
  const fileInputRef = useRef();
  const [fileName, setFileName] = useState("");
  const [duration, setDuration] = useState(null);
  const audioRef = useRef(null);

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

  const importAudioFile = async (event) => {
    //setUploading(true)

    const file = event.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };

    const formData = new FormData();
    formData.append("audio", file);
    startUpload(file)
  }
  // 自動でファイル選択ダイアログを開く
  //useEffect(() => {
  //  if (fileInputRef.current) {
  //    fileInputRef.current.click();
  //  }
  //}, []);
  //const { status, result, error, elapsed } = usePolling(jobId);

	return (		
			<Layout title="Import">
        <div  style={{ padding: "1rem" }}>
          <input type="file" accept="audio/*" onChange={importAudioFile}
          disabled={uploading} style={{ display: 'none' }} ref={fileInputRef} />
          <button onClick={() => fileInputRef.current.click()}>
            Select File
          </button>
        </div>

        {fileName && (
          <div style={{ marginTop: "1rem" }}>
            <div><strong>File:</strong> {fileName}</div>
            {duration !== null && (
              <div><strong>Duration:</strong> { formatSeconds(duration)}</div>
            )}
          </div>
        )}
        {/* Job status */}                
        <TranscriptJobStatus status={status} jobId={jobId} transcriptId={transcriptId} elapsed={elapsed} error={error} />
            
      </Layout>
		
	)
}

