import { useParams } from 'react-router-dom';
import { useState } from "react";
import List from "./List";
import Transcript from "./Transcript";

function Home() {
  const [selectedTitle, setSelectedTitle] = useState(null);
  const { title } = useParams();

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left sidebar with list */}
      <List selected={title} onSelect={setSelectedTitle} />
      
      { title ? (
        <Transcript transcriptId={title} />
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

export default Home;