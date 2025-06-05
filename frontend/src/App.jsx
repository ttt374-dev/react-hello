import { Routes, Route } from 'react-router-dom';
import Home from './Home'
import Recorder from './Recorder';


function App(){
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/u/:title" element={<Home />}/>
      <Route path="/recording" element={<Recorder />} />      
    </Routes>
  )
}
export default App