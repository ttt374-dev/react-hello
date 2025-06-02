import { useEffect, useState, useRef } from "react";

// MAX_WORDS constant for splitting long sentences
const MAX_WORDS = 50;

// Utility to split long sentences by nearest comma
function splitLongSentences(sentences) {
  const result = [];

  for (const s of sentences) {
    const words = s.words || [];
    if (words.length <= MAX_WORDS) {
      result.push(s);
      continue;
    }

    let startIdx = 0;

    while (startIdx < words.length) {
      let endIdx = Math.min(startIdx + MAX_WORDS, words.length);

      // find nearest comma before endIdx to split
      for (let i = endIdx - 1; i > startIdx; i--) {
        const w = words[i].word || words[i].text;
        if (w === "," || w.endsWith(",")) {
          endIdx = i + 1; // split after this comma
          break;
        }
      }

      const chunkWords = words.slice(startIdx, endIdx);

      const chunkText = chunkWords.map((w) => w.word || w.text).join(" ");

      result.push({
        sentence: chunkText,
        start: chunkWords[0].start,
        end: chunkWords[chunkWords.length - 1].end,
        words: chunkWords,
      });

      startIdx = endIdx;
    }
  }
  return result;
}

export default function Transcript({ title }) {
  const [sentences, setSentences] = useState([]);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(null);
  const [activeWordIndex, setActiveWordIndex] = useState(null);
  const audioRef = useRef(null);
  const sentenceRefs = useRef([]);
  const wordRefs = useRef([]);

  // Derive audio and transcript URLs from title prop
  const audioSrc = `http://localhost:8000/api/audio/${encodeURIComponent(title)}`;
  const transcriptSrc = `http://localhost:8000/api/transcripts/${encodeURIComponent(title)}`;

  // Load transcript JSON and split long sentences
  useEffect(() => {
    if (!title) {
      setSentences([]);
      return;
    }
    fetch(transcriptSrc)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch transcript");
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("Transcript JSON is not an array", data);
          setSentences([]);
          return;
        }
        const split = splitLongSentences(data);
        setSentences(split);
      })
      .catch((err) => {
        console.error("Failed to load transcript:", err);
        setSentences([]);
      });
  }, [transcriptSrc, title]);

  // Handle audio time update for highlighting sentence and word
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function onTimeUpdate() {
      const currentTime = audio.currentTime;

      const sIndex = sentences.findIndex(
        (s) => currentTime >= s.start && currentTime <= s.end
      );
      setActiveSentenceIndex(sIndex);

      if (sIndex !== -1) {
        const words = sentences[sIndex].words || [];
        const wIndex = words.findIndex(
          (w) => currentTime >= w.start && currentTime <= w.end
        );
        setActiveWordIndex(wIndex);
      } else {
        setActiveWordIndex(null);
      }
    }

    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [sentences]);

  // Scroll active sentence into view smoothly
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
  useEffect(() => {
  function handleKeyDown(e) {
    if (!sentences.length) return;

    // Prevent default behavior for controlled keys
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", " "].includes(e.key)
    ) {
      e.preventDefault();
    }

    // Previous sentence
    if (e.key === "ArrowUp") {
      if (activeSentenceIndex > 0) {
        const prev = activeSentenceIndex - 1;
        setActiveSentenceIndex(prev);
        playAt(sentences[prev].start);
      }
    }

    // Next sentence
    if (e.key === "ArrowDown") {
      if (activeSentenceIndex < sentences.length - 1) {
        const next = activeSentenceIndex + 1;
        setActiveSentenceIndex(next);
        playAt(sentences[next].start);
      }
    }

    // Restart current sentence
    if (e.key === "ArrowLeft") {
      if (activeSentenceIndex !== null) {
        playAt(sentences[activeSentenceIndex].start);
      }
    }

    // Spacebar → Toggle play/pause
    if (e.key === " ") {
      const audio = audioRef.current;
      if (audio) {
        if (audio.paused) {
          audio.play();
        } else {
          audio.pause();
        }
      }
    }
  }

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [sentences, activeSentenceIndex]);


  const playAt = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      audioRef.current.play();
    }
  };

  const onSentenceClick = (start) => {
    playAt(start);
  };

  const onWordClick = (start) => {
    playAt(start);
  };

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
        🎧 Audio: <span style={{ color: "#0ff" }}>{title || "No title"}</span>
      </div>

      {/* Scrollable transcript */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          background: "#f4f4f4",
        }}
      >
        {!sentences || sentences.length === 0 ? (
          <p>Loading transcript...</p>
        ) : (
          sentences.map((s, sIdx) => (
            <div
              key={sIdx}
              ref={(el) => (sentenceRefs.current[sIdx] = el)}
              onClick={() => onSentenceClick(s.start)}
              style={{
                marginBottom: "0.75rem",
                padding: "0.75rem",
                borderRadius: "6px",
                background:
                  sIdx === activeSentenceIndex ? "#d1f1ff" : "#fff",
                fontWeight: sIdx === activeSentenceIndex ? "bold" : "normal",
                cursor: "pointer",
                transition: "background 0.3s",
                boxShadow:
                  sIdx === activeSentenceIndex
                    ? "0 0 0 2px #00cfff inset"
                    : "0 1px 2px rgba(0,0,0,0.1)",
                userSelect: "none",
                wordBreak: "break-word",
              }}
            >
              {s.words.map((w, wIdx) => {
                const isActiveWord =
                  sIdx === activeSentenceIndex && wIdx === activeWordIndex;
                return (
                  <span
                    key={wIdx}
                    ref={(el) => {
                      if (!wordRefs.current[sIdx]) wordRefs.current[sIdx] = [];
                      wordRefs.current[sIdx][wIdx] = el;
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onWordClick(w.start);
                    }}
                    style={{
                      cursor: "pointer",
                      paddingRight: "2px",
                      backgroundColor: isActiveWord ? "#80d8ff" : "transparent",
                      fontWeight: isActiveWord ? "bold" : "normal",
                      userSelect: "none",
                    }}
                  >
                    {w.word}
                  </span>
                );
              })}
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
          src={audioSrc}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}
