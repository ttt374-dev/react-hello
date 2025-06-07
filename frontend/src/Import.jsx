import { useState, useRef, } from "react";
import { uploadAudioFile } from "./utils/uploadAudio";
import { Link } from 'react-router-dom';
import List from "./List"
import usePolling from "./hooks/usePolling";

export default function Import() {
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState("")
  const [transcriptId, setTranscriptId] = useState("")

  const importAudioFile = async (event) => {
    setUploading(true)

    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("audio", file);
    uploadAudioFile(file)
    .then((data) => {
      console.log(`onstop: ${data.job_id}`)
      setJobId(data.job_id)
      setTranscriptId(data.transcript_id)
    })
    .catch((err) => {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
    })
    .finally(() => {
      setUploading(false);
    })
  }

  const fileInputRef = useRef();
  const { status, result, error, elapsed } = usePolling(jobId);

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
  
          { status === "started" && (
            <div>
              <div>  { `job id: '${jobId}'.`}</div>
              <div>  { `transcript id: '${transcriptId}'`}</div>
              <div> elasped time: {elapsed} sec</div>
            </div>)}
          
          {
            status === "finished" && ( <Link to={`/u/${transcriptId}`}>New Entry {transcriptId}</Link>)
          }
          <div>
            <p>Status: {status}</p>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {result && <div>Result: {JSON.stringify(result)}</div>}
          </div>
            
      </div>
		</div>
	)
}