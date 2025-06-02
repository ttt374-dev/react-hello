import { useEffect, useState, useRef } from "react";

function App() {
  const [sentences, setSentences] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const audioRef = useRef(null);
  const sentenceRefs = useRef([]); // to store refs for each sentence

  useEffect(() => {
    fetch("http://localhost:8000/files/sentences.json")
      .then((res) => res.json())
      .then((data) => setSentences(data))
      .catch((err) => console.error("Failed to load sentences:", err));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const current = audio.currentTime;
      const index = sentences.findIndex(
        (s) => current >= s.start && current <= s.end
      );
      setActiveIndex(index);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, [sentences]);

  // Auto-scroll to active sentence
  useEffect(() => {
    if (
      activeIndex !== null &&
      sentenceRefs.current[activeIndex] &&
      sentenceRefs.current[activeIndex].scrollIntoView
    ) {
      sentenceRefs.current[activeIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex]);

  const playAt = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      audioRef.current.play();
    }
  };

  return (
    <div style={{ padding: "2rem", maxHeight: "80vh", overflowY: "auto" }}>
      <h1>🗣️ Transcript Player</h1>

      <audio
        ref={audioRef}
        controls
        src="http://localhost:8000/files/audio.mp3"
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      {sentences.length === 0 ? (
        <p>Loading transcript...</p>
      ) : (
        <div style={{ lineHeight: "1.8" }}>
          {sentences.map((s, idx) => (
            <div
              key={idx}
              ref={(el) => (sentenceRefs.current[idx] = el)}
              onClick={() => playAt(s.start)}
              style={{
                cursor: "pointer",
                padding: "0.5rem",
                borderBottom: "1px solid #ddd",
                background: idx === activeIndex ? "#e0f7fa" : "transparent",
                fontWeight: idx === activeIndex ? "bold" : "normal",
                transition: "background 0.2s",
              }}
            >
              {s.sentence}{" "}
              <span style={{ fontSize: "0.8rem", color: "#666" }}>
                ({s.start.toFixed(2)}s)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
