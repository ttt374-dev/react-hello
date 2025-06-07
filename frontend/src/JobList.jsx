import { useEffect, useState } from "react";

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/job_status")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch job list");
        return res.json();
      })
      .then((data) => setJobs(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h3>📋 Job List</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <ul>
          {jobs.map((job) => (
            <li key={job.id} style={{ marginBottom: "0.5rem" }}>
              <strong>{job.status.toUpperCase()}</strong> — {job.id}
              <br />
              <small>
                Enqueued: {job.enqueued_at}
                <br />
                {job.started_at && `Started: ${job.started_at}`}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
