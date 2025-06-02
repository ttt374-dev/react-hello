import { useEffect, useState } from "react";
import Upload from './Upload'

export default function List({ onSelect, selected }) {
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/list")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch list");
        return res.json();
      })
      .then((data) => {
        setTitles(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: "1rem" }}>Loading...</div>;
  if (error) return <div style={{ padding: "1rem", color: "red" }}>{error}</div>;
  if (titles.length === 0) return <div style={{ padding: "1rem" }}>No data found.</div>;

  return (
    <div
      style={{
        width: "220px",
        borderRight: "1px solid #ccc",
        overflowY: "auto",
        height: "100vh",
        background: "#fafafa",
      }}
    >
        <Upload />
      <h2 style={{ padding: "1rem", margin: 0, borderBottom: "1px solid #ddd" }}>
        Available Transcripts
      </h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {titles.map((title) => (
          <li
            key={title}
            onClick={() => onSelect(title)}
            style={{
              padding: "0.75rem 1rem",
              cursor: "pointer",
              background: selected === title ? "#d1f1ff" : "transparent",
              borderLeft: selected === title ? "4px solid #00cfff" : "4px solid transparent",
              userSelect: "none",
              transition: "background 0.2s",
            }}
          >
            {title}
          </li>
        ))}
      </ul>
    </div>
  );
}
