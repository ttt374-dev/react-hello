import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


function App() {
  const [files, setFiles] = useState([]);

  const fetchFiles = () => {
    fetch("http://127.0.0.1:8000/files")
      .then(res => res.json())
      .then(setFiles)
      .catch(err => console.error("Error fetching files:", err));
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    })
      .then(res => res.json())
      .then(() => fetchFiles())
      .catch(err => console.error("Upload error:", err));
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Audio Replay App</h1>
      <input type="file" accept="audio/*" onChange={handleUpload} />
      <ul>
        {files.map((file) => (
          <li key={file}>
            {file}
            <br />
            <audio controls src={`http://127.0.0.1:8000/uploads/${file}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}


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
