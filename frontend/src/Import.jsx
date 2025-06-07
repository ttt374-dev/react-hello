import { useRef, useEffect } from "react";
import { Link } from 'react-router-dom';
import List from "./List"
import useTranscriptionJob from "./hooks/useTranscriptionJob";
import JobStatus from "./components/JobStatus";

export default function Import() {  
  const fileInputRef = useRef();
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
    const formData = new FormData();
    formData.append("audio", file);
    startUpload(file)
  }
  // 自動でファイル選択ダイアログを開く
  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  //const { status, result, error, elapsed } = usePolling(jobId);

	return (
		<div style={{ width: "100%", display: "flex", height: "100vh"}}>
			<div style={{ width: "20%"}}>
				<List/>
			</div>      
			<div style={{ width: "80%"}}>
        <div  style={{ padding: "1rem" }}>
          <input type="file" accept="audio/*" onChange={importAudioFile}
          disabled={uploading} style={{ display: 'none' }} ref={fileInputRef} />
          <button onClick={() => fileInputRef.current.click()}>
            Select File
          </button>
        </div>

        {/* Job status */}                
        <JobStatus status={status} jobId={jobId} transcriptId={transcriptId} elapsed={elapsed} error={error} />
            
      </div>
		</div>
	)
}

