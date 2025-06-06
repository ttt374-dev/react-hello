import { useParams } from 'react-router-dom';
import List from "./List";
import Transcript from "./Transcript";

function Home(){
  const { title } = useParams();
  return (
    <div style={{ width: "100%", display: "flex", height: "100vh"}}>
      <div style={{ width: "20%"}} selected={title}>
        <List selected={title} />
      </div>      
      <div style={{ width: "80%"}}>
        { title ? (
          <Transcript transcriptId={title} />
        ): (<div>select title</div>)}     
      </div>
    </div>
  )
}


function HomeOrig() {  
  const { title } = useParams();

  return (    
    <div style={{ width: "100%", display: "flex", height: "100vh" }}>
      <List selected={title}/>
      
      { title ? (
        <Transcript transcriptId={title} />
      ): (<div>select title</div>)}      
      
    </div>
  );
}

export default Home;