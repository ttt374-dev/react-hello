import { useParams } from 'react-router-dom';
import List from "./List";
import Transcript from "./Transcript";

function Home() {  
  const { title } = useParams();

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <List selected={title}/>
      
      { title ? (
        <Transcript transcriptId={title} />
      ): (<div>select title</div>)}      
      
    </div>
  );
}

export default Home;