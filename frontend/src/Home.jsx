import { useParams } from 'react-router-dom';
import List from "./List";
import Transcript from "./Transcript";

function HomeTest(){
  const { title } = useParams();
  return (
    <div style={{ width: "100%", display: "flex", height: "100vh"}}>
      <div style={{ width: "30%", backgroundColor: "lightgreen"}} selected={title}>asdfadf</div>
      
      <div style={{ width: "70%", backgroundColor: 'pink'}}>
        <Transcript transcriptId={title}/>          
      </div>
    </div>
  )
}


function Home2(){
  return (
    <div style="width: 100%; display: flex">
      <div style="width: 30%; background-color: lightblue; ">Left</div>
      <div style="flex: 1; background-color: lightyellow">Right</div>
    </div>
  )
}

function Home() {  
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