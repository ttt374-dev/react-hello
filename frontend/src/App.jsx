import { Routes, Route } from 'react-router-dom';
import Home from './Home'
import Recording from './Recording';
import Import from './Import'
import Transcript from './Transcript';
import JobList from './JobList'

function App(){
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/u/:transcriptId" element={<Transcript />}/>
      <Route path="/recording" element={<Recording />} />      
      <Route path="/import" element={<Import />} />     
      <Route path="/jobList" element={<JobList />} /> 
    </Routes>
  )
}
export default App