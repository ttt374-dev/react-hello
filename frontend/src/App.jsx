import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'
import RecordingPage from './pages/RecordingPage';
import ImportPage from './pages/ImportPage'
import TranscriptPage from './pages/TranscriptPage';

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