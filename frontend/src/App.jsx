import { useEffect, useState, useRef } from "react";

export default function App() {
  const [sentences, setSentences] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const audioRef = useRef(null);
  const sentenceRefs = useRef([]);

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        if (audio.paused) audio.play();
        else audio.pause();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        if (activeIndex !== null && sentences[activeIndex]) {
          playAt(sentences[activeIndex].start);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sentences, activeIndex]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      {/* Top title */}
      <div
        style={{
          padding: "1rem",
          background: "#222",
          color: "#fff",
          fontSize: "1.25rem",
          fontWeight: "bold",
          flexShrink: 0,
        }}
      >
        🎧 Audio: <span style={{ color: "#0ff" }}>audio.mp3</span>
      </div>

      {/* Scrollable transcription */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          background: "#f4f4f4",
        }}
      >
        {sentences.length === 0 ? (
          <p>Loading transcript...</p>
        ) : (
          sentences.map((s, idx) => (
            <div
              key={idx}
              ref={(el) => (sentenceRefs.current[idx] = el)}
              onClick={() => playAt(s.start)}
              style={{
                marginBottom: "0.75rem",
                padding: "0.75rem",
                borderRadius: "6px",
                background: idx === activeIndex ? "#d1f1ff" : "#fff",
                fontWeight: idx === activeIndex ? "bold" : "normal",
                cursor: "pointer",
                transition: "background 0.3s",
                boxShadow:
                  idx === activeIndex
                    ? "0 0 0 2px #00cfff inset"
                    : "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              {s.sentence}
              <br />
              <small style={{ fontSize: "0.8rem", color: "#666" }}>
                {s.start.toFixed(2)}s - {s.end.toFixed(2)}s
              </small>
            </div>
          ))
        )}
      </div>

      {/* Audio controls fixed at bottom */}
      <div
        style={{
          padding: "1rem",
          borderTop: "1px solid #ccc",
          background: "#fff",
          flexShrink: 0,
        }}
      >
        <audio
          ref={audioRef}
          controls
          src="http://localhost:8000/files/audio.mp3"
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}
