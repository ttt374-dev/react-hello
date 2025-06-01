import { useState, useEffect } from 'react'
import { useRef } from 'react';
//import subtitlesParser from "subtitles-parser-vtt";
import subtitlesParser from "https://cdn.skypack.dev/subtitles-parser-vtt";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


function App() {
  const audioRef = useRef(null);
  const [cues, setCues] = useState([]);

  const timeStringToSeconds = (timeStr) => {
    const [hh, mm, ss] = timeStr.split(":");
    const [s, ms] = ss.split(".");
    return parseInt(hh) * 3600 + parseInt(mm) * 60 + parseInt(s) + (parseInt(ms) || 0) / 1000;
  };

  useEffect(() => {
    fetch("http://localhost:8000/files/transcript.vtt")
      .then((res) => res.text())
      .then((vttText) => {
        const parsed = subtitlesParser.fromVtt(vttText);
        const formatted = parsed.map((cue) => ({
          ...cue,
          startSeconds: timeStringToSeconds(cue.startTime),
        }));
        setCues(formatted);
      })
      .catch((err) => {
        console.error("Failed to load transcript:", err);
      });
  }, []);

  const handlePlay = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      audioRef.current.play();
    }
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h2>🎧 Audio + Subtitle Sync</h2>
      <audio
        ref={audioRef}
        controls
        src="http://localhost:8000/files/audio.mp3"
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      {cues.length === 0 && <p>Loading subtitles...</p>}

      <div>
        {cues.map((cue) => (
          <p
            key={cue.id}
            onClick={() => handlePlay(cue.startSeconds)}
            style={{
              cursor: "pointer",
              color: "blue",
              textDecoration: "underline",
              margin: "0.5rem 0",
            }}
          >
            {cue.text}
          </p>
        ))}
      </div>
    </div>
  );
}



//////////////////////////

function AppDatabase() {
  const [items, setItems] = useState([]);

  // Fetch all items
  const fetchItems = () => {
    fetch("http://127.0.0.1:8000/items")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => setItems(data))
      .catch(err => console.error("Fetch error:", err));
  };

  // Add new item
  const addItem = () => {
    const name = prompt("Enter new item name:");
    if (!name) return;

    fetch("http://localhost:8000/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    })
      .then(res => {
        if (!res.ok) throw new Error(`Failed to create item: ${res.status}`);
        return res.json();
      })
      .then(() => fetchItems())  // Refresh list
      .catch(err => console.error("Add error:", err));
  };

  // Load items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>SQLite Items</h1>
      <button onClick={addItem}>Add Item</button>
      <ul>
        {items.map(item => <li key={item.id}>{item.name}</li>)}
      </ul>
    </div>
  );
}
function AppRandom() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState("");

  // Fetch from /api/random (used on both load and click)
  const fetchRandomMessage = () => {
    fetch("http://127.0.0.1:8000/api/random")
      .then((res) => res.json())
      .then((data) => setMessage(data.message || JSON.stringify(data)))
      .catch((err) => setMessage("Error fetching data"));
  };

  // Fetch on first render
  useEffect(() => {
    fetchRandomMessage();
  }, []);

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => fetchRandomMessage()}>
          count is {count} GREAT !!!! WTF
        </button>
        <p> { message || "Loading..." }</p>
      </div>
    </>
  )
}

export default App
