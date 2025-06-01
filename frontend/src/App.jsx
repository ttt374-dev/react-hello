import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
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
