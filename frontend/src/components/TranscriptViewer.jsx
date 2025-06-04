import { useRef, useState, useEffect } from "react";

export default function TranscriptViewer({ sentences, audioRef }) {
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(null);
  const [activeWordIndex, setActiveWordIndex] = useState(null);
  const sentenceRefs = useRef([]);
  const wordRefs = useRef([]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      const currentTime = audio.currentTime;
      const sIdx = sentences.findIndex(
        (s) => currentTime >= s.start && currentTime <= s.end
      );
      setActiveSentenceIndex(sIdx);
      setActiveWordIndex(
        sIdx !== -1
          ? sentences[sIdx].words.findIndex(
              (w) => currentTime >= w.start && currentTime <= w.end
            )
          : null
      );
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
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

  // ✅ Keybinds: up/down/left
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = activeSentenceIndex !== null ? activeSentenceIndex + 1 : 0;
        if (next < sentences.length) {
          setActiveSentenceIndex(next);
          playAt(sentences[next].start);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = activeSentenceIndex !== null ? activeSentenceIndex - 1 : 0;
        if (prev >= 0) {
          setActiveSentenceIndex(prev);
          playAt(sentences[prev].start);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (activeSentenceIndex !== null) {
          playAt(sentences[activeSentenceIndex].start);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSentenceIndex, sentences]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "1rem",
        background: "#f4f4f4",
      }}
    >
      {sentences.map((s, sIdx) => (
        <div
          key={sIdx}
          ref={(el) => (sentenceRefs.current[sIdx] = el)}
          onClick={() => playAt(s.start)}
          style={{
            marginBottom: "0.75rem",
            padding: "0.75rem",
            borderRadius: "6px",
            background:
              sIdx === activeSentenceIndex ? "#d1f1ff" : "#fff",
            fontWeight:
              sIdx === activeSentenceIndex ? "bold" : "normal",
            boxShadow:
              sIdx === activeSentenceIndex
                ? "0 0 0 2px #00cfff inset"
                : "0 1px 2px rgba(0,0,0,0.1)",
            cursor: "pointer",
            wordWrap: "break-word",
            whiteSpace: "normal",
          }}
        >
          {s.words.map((w, wIdx) => (
            <span
              key={wIdx}
              ref={(el) => {
                if (!wordRefs.current[sIdx]) wordRefs.current[sIdx] = [];
                wordRefs.current[sIdx][wIdx] = el;
              }}
              onClick={(e) => {
                e.stopPropagation();
                playAt(w.start);
              }}
              style={{
                cursor: "pointer",
                paddingRight: "2px",
                backgroundColor:
                  sIdx === activeSentenceIndex &&
                  wIdx === activeWordIndex
                    ? "#80d8ff"
                    : "transparent",
                fontWeight:
                  sIdx === activeSentenceIndex &&
                  wIdx === activeWordIndex
                    ? "bold"
                    : "normal",
              }}
            >
              {w.word + " "}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
