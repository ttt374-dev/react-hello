import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function List({ selected }) {
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchTitles = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchTitles();
  }, []);

  const NavigateToRecording = ({  }) => {
    return (
      <button
        onClick={() => navigate(`/recording`)}
        style={{ marginBottom: "0.5rem", padding: "0.5rem 1rem", fontSize: "1rem" }}>
        🎤 New Recording
      </button>
    )
  }
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #ccc",
        background: "#fafafa",
      }}
    >
      {/* Top Fixed Section */}
      <div style={{ padding: "1rem", borderBottom: "1px solid #ddd", flexShrink: 0 }}>
        <button onClick={() => navigate("/")}>Home</button>
      </div>
      

      {/* Scrollable List */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {/* Title Heading */}
        <h2 style={{
          padding: "1rem",
          margin: 0,
          borderBottom: "1px solid #ddd",
          flexShrink: 0,
        }}>
          Transcripts
        </h2>
        
        {loading ? (
          <div style={{ padding: "1rem" }}>Loading...</div>
        ) : error ? (
          <div style={{ padding: "1rem", color: "red" }}>{error}</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {titles.length === 0 ? (
              <li
                style={{
                  padding: "0.75rem 1rem",
                  color: "#666",
                  fontStyle: "italic",
                  userSelect: "none",
                }}
              >
                No Data Found
              </li>
            ) : (
              titles.map((t) => (
                <li
                  key={t.id}
                  onClick={() => navigate(`/u/${t.id}`)}
                  style={{
                    padding: "0.75rem 1rem",
                    cursor: "pointer",
                    background: selected === t.id ? "#d1f1ff" : "transparent",
                    borderLeft: selected === t.id ? "4px solid #00cfff" : "4px solid transparent",
                    userSelect: "none",
                    transition: "background 0.2s",
                  }}
                >
                  {t.title}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
export default List;