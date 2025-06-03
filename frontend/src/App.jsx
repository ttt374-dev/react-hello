import { Routes, Route, Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useState } from "react";
import List from "./List";
import Transcript from "./Transcript";

function App(){
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/about" element={<About/>}/>      
      <Route path="/u/:title" element={<Home />} />
    </Routes>
  )
}

function Home() {
  const [selectedTitle, setSelectedTitle] = useState(null);
  const { title } = useParams();

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left sidebar with list */}
      <List selected={title} onSelect={setSelectedTitle} />
      
      { title ? (
        <Transcript title={title} />
      ): (<div>select title</div>)}

      {/* Right pane with transcript or placeholder */}
      { /*
      <div style={{ flex: 1 }}>
        {selectedTitle ? (
          //<Transcript title={selectedTitle} />
          
          <Transcript title={title} />
        ) : (
          <div style={{ padding: "2rem", fontSize: "1.2rem" }}>
            Please select a transcript on the left.
          </div>
        )}
      </div>
      */ }
    </div>
  );
}
function About(){
  return (<div>About</div>)
}

export default App;