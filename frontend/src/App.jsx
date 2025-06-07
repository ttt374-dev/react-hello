import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage'
import RecordingPage from './RecordingPage';
import ImportPage from './ImportPage'
import TranscriptPage from './TranscriptPage';

function App(){
  return (
    <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/u/:transcriptId" element={<TranscriptPage />}/>
      <Route path="/recording" element={<RecordingPage />} />      
      <Route path="/import" element={<ImportPage />} />     
    </Routes>
  )
}
export default App