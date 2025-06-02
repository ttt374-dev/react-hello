import { useEffect, useState, useRef } from "react";

export default function App() {
  const [sentences, setSentences] = useState([]);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(null);
  const [activeWordIndex, setActiveWordIndex] = useState(null);
  const audioRef = useRef(null);
  const sentenceRefs = useRef([]);

  useEffect(() => {
    fetch("http://localhost:8000/files/transcript.json")
      .then((res) => res.json())
      .then(setSentences)
      .catch((err) => console.error("Failed to load transcript:", err));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const current = audio.currentTime;
      const sentenceIndex = sentences.findIndex(
        (s) => current >= s.start && current <= s.end
      );

      setActiveSentenceIndex(sentenceIndex);

      if (sentenceIndex !== -1) {
        const words = sentences[sentenceIndex].words;
        const wordIndex = words.findIndex(
          (w) => current >= w.start && current <= w.end
        );
        setActiveWordIndex(wordIndex);
      } else {
        setActiveWordIndex(null);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, [sentences]);

  useEffect(() => {
    if (
      activeSentenceIndex !== null &&
      sentenceRefs.current[activeSentenceIndex]
    ) {
      sentenceRefs.current[activeSentenceIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeSentenceIndex]);

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
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      if (e.code === "Space") {
        e.preventDefault();
        audio.paused ? audio.play() : audio.pause();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        if (
          activeSentenceIndex !== null &&
          sentences[activeSentenceIndex]?.words?.[0]
        ) {
          playAt(sentences[activeSentenceIndex].words[0].start);
        }
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        if (activeSentenceIndex > 0) {
          playAt(sentences[activeSentenceIndex - 1].start);
        }
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        if (activeSentenceIndex < sentences.length - 1) {
          playAt(sentences[activeSentenceIndex + 1].start);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sentences, activeSentenceIndex]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      {/* Title */}
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

      {/* Transcript */}
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
                background:
                  idx === activeSentenceIndex ? "#d1f1ff" : "#fff",
                fontWeight:
                  idx === activeSentenceIndex ? "bold" : "normal",
                cursor: "pointer",
                transition: "background 0.3s",
                boxShadow:
                  idx === activeSentenceIndex
                    ? "0 0 0 2px #00cfff inset"
                    : "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ wordSpacing: "0.2em", lineHeight: "1.6" }}>
                {s.words.map((w, wIdx) => (
                  <span
                    key={wIdx}
                    onClick={(e) => {
                      e.stopPropagation();
                      playAt(w.start);
                    }}
                    style={{
                      cursor: "pointer",
                      padding: "0 2px",
                      background:
                        idx === activeSentenceIndex &&
                        wIdx === activeWordIndex
                          ? "#ffecb3"
                          : "transparent",
                      borderRadius: "3px",
                    }}
                  >
                    {w.word}
                    {wIdx < s.words.length - 1 ? " " : ""}
                  </span>
                ))}
              </div>
              <small style={{ fontSize: "0.8rem", color: "#666" }}>
                {s.start.toFixed(2)}s - {s.end.toFixed(2)}s
              </small>
            </div>
          ))
        )}
      </div>

      {/* Audio controls */}
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
