import { useState } from "react";
import List from "./List";
import Transcript from "./Transcript";

export default function App() {
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
