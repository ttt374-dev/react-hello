import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/greet?name=ReactWTF")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
        .catch((err) => {
      console.error("Fetch error:", err);
      setMessage(`Error: ${err.message}`);
    });
  }, []);

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count} GREAT !!!! WTF
        </button>
        <p> { message || "Loading..." }</p>
      </div>
    </>
  )
}

export default App
