import { Routes, Route, Link } from 'react-router-dom';
import { useState } from "react";
import List from "./List";
import Transcript from "./Transcript";

function App(){
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/about" element={<About/>}/>
    </Routes>
  )
}

function Home() {
  const [selectedTitle, setSelectedTitle] = useState(null);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left sidebar with list */}
      <List selected={selectedTitle} onSelect={setSelectedTitle} />

      {/* Right pane with transcript or placeholder */}
      <div style={{ flex: 1 }}>
        {selectedTitle ? (
          <Transcript title={selectedTitle} />
        ) : (
          <div style={{ padding: "2rem", fontSize: "1.2rem" }}>
            Please select a transcript on the left.
          </div>
        )}
      </div>
    </div>
  );
}
function About(){
  return (<div>About</div>)
}

export default App;