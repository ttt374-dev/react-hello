import { Link } from 'react-router-dom';


export default function TranscriptJobStatus({ status, jobId, transcriptId, elapsed, error }) {
  return (
    <div>
      <p>Status: {status}</p>
      { error && 
        <p style={{ color: "red" }}>{error}</p>
    }

      {(status === "started" || status === "queued") && (
        <div>
          <div>job id: {jobId}</div>
          <div>transcript id: {transcriptId}</div>          
        </div>
      )}
      
      { status === "started" && (
        <div>elapsed time: {elapsed} sec</div>
        
      )}

      {status === "finished" && (
        <p>
          visit new entry:
          <Link to={`/u/${transcriptId}`}>{transcriptId}</Link>
        </p>
      )}
    </div>
  );
}