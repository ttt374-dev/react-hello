import { Link } from 'react-router-dom';

export default function JobStatus({ status, jobId, transcriptId, elapsed, error }) {
  return (
    <div>
      {status === "started" && (
        <div>
          <div>{`job id: ${jobId}.`}</div>
          <div>{`transcript id: ${transcriptId}`}</div>
          <div>elapsed time: {elapsed} sec</div>
        </div>
      )}

      {status === "finished" && (
        <p>
          visit new entry:
          <Link to={`/u/${transcriptId}`}>{transcriptId}</Link>
        </p>
      )}

      <div>
        <p>Status: {status}</p>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}