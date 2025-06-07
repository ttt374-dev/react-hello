import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import List from "./List";
import Transcript from "./Transcript";

function Home(){
  const navigate = useNavigate();

  return (
    <div style={{ width: "100%", display: "flex", height: "100vh"}}>
      <div style={{ width: "20%"}}>
        <List/>
      </div>      
      <div style={{ width: "80%"}}>
        <div style={{ margin: "3em"}}>
          <button style={{ margin: "1em"}} onClick={() => navigate("/recording")}>Recording</button>
          <button style={{ margin: "1em"}} onClick={() => navigate("/import")}>Import</button>
        </div>
      </div>
    </div>
  )
}


export default Home;