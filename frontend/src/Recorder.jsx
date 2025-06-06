import { useState, useRef, useEffect } from "react";
import { getFormattedFilename, uploadAudioBlob, pollTranscriptionStatus, usePolling } from "./utils/recording";
import { startVolumeMonitor, stopVolumeMonitor } from "./utils/volumeMonitor";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import List from "./List"

export default function Recorder() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [volume, setVolume] = useState(0);
  const [jobId, setJobId] = useState("");
  const [transcriptId, setTranscriptId] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const navigate = useNavigate();

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Start MediaRecorder
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunks.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);

      const confirmUpload = window.confirm("Do you want to upload the recording?");
      if (confirmUpload) {
        uploadAudioBlob(blob, getFormattedFilename("webm"))
        .then((data) => {
          console.log(`onstop: ${data.job_id}`)
          //navigate("/"); // Go to home page after upload finishes
          
          //const jobId = data.job_id;
          setJobId(data.job_id)
          setTranscriptId(data.transcript_id)
          //pollTranscriptionStatus(jobId); // Start polling
        })
        .catch((err) => {
          console.error("Upload failed:", err);
          alert("Upload failed. Please try again.");
        });
      }      
    };

    startVolumeMonitor(stream, setVolume)


    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
    stopVolumeMonitor()
  };
  const VolumeMeter = ({ volume }) => {
    return (
      <div style={{ marginTop: "1rem", height: "10px", background: "#ccc" }}>
        <div
          style={{
            height: "100%",
            width: `${Math.min(100, volume)}%`,
            background: "limegreen",
            transition: "width 0.1s",
          }}
        />
      </div>
    );
  };

  const { status, result, error, elapsed } = usePolling(jobId);

  return (    
    <div style={{ width: "100%", display: "flex", height: "100vh"}}>
      <div style={{ width: "20%"}}>
        <List/>
      </div>      
      <div style={{ width: "80%"}}>
        <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
          <h3>🎤 Recorder</h3>

          {recording ? (
            <button onClick={stopRecording}>Stop Recording</button>
          ) : (
            <button onClick={startRecording}>Start Recording</button>
          )}

          {/* Volume Meter */}      
          {recording && (
            <VolumeMeter volume={volume} />
          )}
          
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
    </div>
    
    
    
  );
}

{/* Playback 
      {audioURL && (
        <div style={{ marginTop: "1rem" }}>
          <audio src={audioURL} controls />
        </div>
      )}
        */}