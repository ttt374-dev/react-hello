import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import List from "./components/List";
import Transcript from "./Transcript";
import Layout
 from './Layout';
function Home(){
  const navigate = useNavigate();

  return (
      <Layout>
        <div style={{ margin: "3em"}}>
          <button style={{ margin: "1em"}} onClick={() => navigate("/recording")}>Recording</button>
          <button style={{ margin: "1em"}} onClick={() => navigate("/import")}>Import</button>
        </div>
      </Layout>
    
  )
}


export default Home;