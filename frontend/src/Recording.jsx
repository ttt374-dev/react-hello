import { useState, useEffect, useRef } from "react";
import { uploadAudioFile } from "./utils/uploadAudio";
import { startVolumeMonitor, stopVolumeMonitor } from "./utils/volumeMonitor";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import List from "./List"
import usePolling from './hooks/usePolling'
import useTranscriptionJob from "./hooks/useTranscriptionJob";
import VolumeMonitor from "./components/VolumeMonitor";
import JobStatus from "./components/JobStatus";

const MAX_RECORDING_MINUTES = 0.1

export default function Recording() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [volume, setVolume] = useState(0);
  const [recordingElapsed, setRecordingElapsed] = useState(0);
  const recordingTimerRef = useRef(null);

  //const [jobId, setJobId] = useState("");
  //const [transcriptId, setTranscriptId] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const {
    jobId,
    transcriptId,
    status,
    error,
    elapsed,
    startUpload,
  } = useTranscriptionJob();
  const alertShownRef = useRef(false);


  // Start recording automatically when component mounts
  { /*
  useEffect(() => {
    startRecording();

    // Cleanup on unmount: stop recording & volume monitoring if recording
    return () => {
      if (recording) {
        stopRecording();
      }
    };
  }, []); // empty deps = run once on mount
*/ }

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
        const filename = getFormattedFilename("webm")
        const file = new File([blob], filename, { type: "audio/webm" });
        startUpload(file);
      }      
    };

    startVolumeMonitor(stream, setVolume)
    mediaRecorderRef.current.start();
    setRecording(true);
    alertShownRef.current = false;

    setRecordingElapsed(0); // reset
    recordingTimerRef.current = setInterval(() => {
      setRecordingElapsed((prev) => {
        if (prev + 1 >= MAX_RECORDING_MINUTES * 60) {          
          stopRecording();  // auto-stop  
          if (!alertShownRef.current) {
            alertShownRef.current = true;        
            alert(`Recording stopped automatically at ${MAX_RECORDING_MINUTES} minutes max length`);
          }
          return prev;       // stop incrementing after max reached
        }
        return prev + 1
      }
      );
    }, 1000);

  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
    stopVolumeMonitor()
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

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
          <p>
            max recording minutes: { MAX_RECORDING_MINUTES} min
          </p>
          {recording && (
            <p>Recording time: {formatSeconds(recordingElapsed)}</p>
          )}
          
          {/* Volume Meter */}      
          {recording && (
            <VolumeMonitor volume={volume} />
          )}
          
          {/* Job status */}                
          <JobStatus status={status} jobId={jobId} transcriptId={transcriptId} elapsed={elapsed} error={error} />          
            
          {/* Playback */} 
          {audioURL && (
            <div style={{ marginTop: "1rem" }}>
              <audio src={audioURL} controls />
            </div>
          )}
        
        </div>
      </div>
    </div>
    
    
    
  );
}
function formatSeconds(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function getFormattedFilename(ext = "webm") {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `recording-${yyyy}-${mm}-${dd}-${hh}:${min}.${ext}`;
}
