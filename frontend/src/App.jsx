import { useEffect, useRef, useState } from "react";

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
      let sIdx = -1, wIdx = -1;

      for (let i = 0; i < sentences.length; i++) {
        const s = sentences[i];
        if (current >= s.start && current <= s.end) {
          sIdx = i;
          for (let j = 0; j < s.words.length; j++) {
            const w = s.words[j];
            if (current >= w.start && current <= w.end) {
              wIdx = j;
              break;
            }
          }
          break;
        }
      }

      setActiveSentenceIndex(sIdx);
      setActiveWordIndex(wIdx);
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
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        if (audio.paused) audio.play();
        else audio.pause();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        if (
          activeSentenceIndex !== null &&
          sentences[activeSentenceIndex] &&
          sentences[activeSentenceIndex].words.length > 0
        ) {
          const firstWord = sentences[activeSentenceIndex].words[0];
          playAt(firstWord.start);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sentences, activeSentenceIndex]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "sans-serif" }}>
      {/* Title */}
      <div style={{ padding: "1rem", background: "#222", color: "#fff", fontSize: "1.25rem", fontWeight: "bold" }}>
        🎧 Audio: <span style={{ color: "#0ff" }}>audio.mp3</span>
      </div>

      {/* Scrollable transcript */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem", background: "#f4f4f4" }}>
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
                background: idx === activeSentenceIndex ? "#d1f1ff" : "#fff",
                fontWeight: idx === activeSentenceIndex ? "bold" : "normal",
                cursor: "pointer",
                transition: "background 0.3s",
                boxShadow:
                  idx === activeSentenceIndex
                    ? "0 0 0 2px #00cfff inset"
                    : "0 1px 2px rgba(0,0,0,0.1)"
              }}
            >
              <div style={{ lineHeight: "1.7", whiteSpace: "normal" }}>
                {s.words
                  .map((w, widx) => (
                    <span
                      key={widx}
                      onClick={(e) => {
                        e.stopPropagation();
                        playAt(w.start);
                      }}
                      style={{
                        background:
                          idx === activeSentenceIndex && widx === activeWordIndex
                            ? "#00cfff"
                            : "transparent",
                        color:
                          idx === activeSentenceIndex && widx === activeWordIndex
                            ? "#fff"
                            : "#000",
                        borderRadius: "4px",
                        padding: "0.1rem 0.3rem",
                        cursor: "pointer",
                        transition: "background 0.2s"
                      }}
                    >
                      {w.word}
                    </span>
                  ))
                  .reduce((acc, el, i, arr) => {
                    acc.push(el);
                    if (i < arr.length - 1)
                      acc.push(
                        <span key={`space-${i}`} style={{ margin: "0 0.15rem" }}>
                          {" "}
                        </span>
                      );
                    return acc;
                  }, [])}
              </div>
              <small style={{ fontSize: "0.8rem", color: "#666" }}>
                {s.start.toFixed(2)}s - {s.end.toFixed(2)}s
              </small>
            </div>
          ))
        )}
      </div>

      {/* Audio controls */}
      <div style={{ padding: "1rem", borderTop: "1px solid #ccc", background: "#fff" }}>
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
