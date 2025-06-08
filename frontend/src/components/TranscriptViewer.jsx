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

      // 最後にマッチしたインデックスを見つける
      let matchedIndex = -1;
      for (let i = 0; i < sentences.length; i++) {
        if (currentTime >= sentences[i].start && currentTime <= sentences[i].end) {
          matchedIndex = i;
          break;
        }
      }

      if (matchedIndex !== -1) {
        setActiveSentenceIndex(matchedIndex);
        setActiveWordIndex(
          sentences[matchedIndex].words.findIndex(
            (w) => currentTime >= w.start && currentTime <= w.end
          )
        );
      } else {
        // 次の文がまだ始まっていない場合、現在の文を維持（空白にしない）
        const nextIndex = sentences.findIndex(s => currentTime < s.start);
        if (nextIndex > 0) {
          setActiveSentenceIndex(nextIndex - 1);
        } else if (nextIndex === -1) {
          // すべて終わった場合は最後の文
          setActiveSentenceIndex(sentences.length - 1);
        }
        setActiveWordIndex(null); // word ハイライトだけ外す
      }
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

useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    const audio = audioRef.current;

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
    } else if (e.code === "Space") {
      e.preventDefault();
      if (audio) {
        if (audio.paused) {
          audio.play();
        } else {
          audio.pause();
        }
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