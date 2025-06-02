import { useEffect, useState, useRef } from "react";

export default function App() {
  const [sentences, setSentences] = useState([]);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(null);
  const [activeWordIndex, setActiveWordIndex] = useState(null);
  const audioRef = useRef(null);
  const sentenceRefs = useRef([]);

  // Fetch transcript.json
  useEffect(() => {
    fetch("http://localhost:8000/files/transcript.json")
      .then((res) => res.json())
      .then(setSentences)
      .catch((err) => console.error("Failed to load transcript:", err));
  }, []);

  // Update active sentence & word index on timeupdate
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function onTimeUpdate() {
      const currentTime = audio.currentTime;

      // Find active sentence
      let sentenceIdx = sentences.findIndex(
        (s) => currentTime >= s.start && currentTime <= s.end
      );

      if (sentenceIdx === -1) {
        setActiveSentenceIndex(null);
        setActiveWordIndex(null);
        return;
      }

      setActiveSentenceIndex(sentenceIdx);

      // Within active sentence find active word
      const sentence = sentences[sentenceIdx];
      let wordIdx = sentence.words.findIndex(
        (w) => currentTime >= w.start && currentTime <= w.end
      );
      setActiveWordIndex(wordIdx === -1 ? null : wordIdx);
    }

    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [sentences]);

  // Scroll active sentence into view
  useEffect(() => {
    if (
      activeSentenceIndex !== null &&
      sentenceRefs.current[activeSentenceIndex] &&
      sentenceRefs.current[activeSentenceIndex].scrollIntoView
    ) {
      sentenceRefs.current[activeSentenceIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeSentenceIndex]);

  // Play audio at given time
  const playAt = (time) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    audioRef.current.play();
  };

  // Keybindings
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onKeyDown = (e) => {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.isComposing
      )
        return;

      if (e.code === "Space") {
        e.preventDefault();
        if (audio.paused) audio.play();
        else audio.pause();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        // Replay current sentence from start
        if (activeSentenceIndex !== null) {
          playAt(sentences[activeSentenceIndex].start);
        }
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        // Prev sentence
        if (activeSentenceIndex !== null && activeSentenceIndex > 0) {
          playAt(sentences[activeSentenceIndex - 1].start);
        }
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        // Next sentence
        if (
          activeSentenceIndex !== null &&
          activeSentenceIndex < sentences.length - 1
        ) {
          playAt(sentences[activeSentenceIndex + 1].start);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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

      {/* Scrollable transcript */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          background: "#f4f4f4",
          lineHeight: 1.6,
          fontSize: "1rem",
          wordBreak: "break-word",
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        {sentences.length === 0 ? (
          <p>Loading transcript...</p>
        ) : (
          sentences.map((sentence, sIdx) => (
            <div
              key={sIdx}
              ref={(el) => (sentenceRefs.current[sIdx] = el)}
              style={{
                marginBottom: "1rem",
                padding: "0.5rem",
                borderRadius: 6,
                background: sIdx === activeSentenceIndex ? "#d1f1ff" : "#fff",
                boxShadow:
                  sIdx === activeSentenceIndex
                    ? "0 0 0 2px #00cfff inset"
                    : "0 1px 2px rgba(0,0,0,0.1)",
                cursor: "default",
                userSelect: "text",
              }}
            >
              {sentence.words.map((word, wIdx) => {
                const isActiveWord =
                  sIdx === activeSentenceIndex && wIdx === activeWordIndex;
                return (
                  <span
                    key={wIdx}
                    onClick={() => playAt(word.start)}
                    style={{
                      cursor: "pointer",
                      fontWeight: isActiveWord ? "bold" : "normal",
                      backgroundColor: isActiveWord ? "#00cfff33" : "transparent",
                      marginRight: 3,
                      userSelect: "none",
                      whiteSpace: "nowrap",
                    }}
                    title={`${word.word} (${word.start.toFixed(2)}s)`}
                  >
                    {word.word}
                  </span>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Audio controls fixed bottom */}
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
