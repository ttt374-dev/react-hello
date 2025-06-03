import { Routes, Route, Link } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';

function App(){
  return (
    <Routes>
      <Route path="/" element= { <Home/>} />
      <Route path="/about" element={<About />} />      
    </Routes>
  )
}

function Home(){
  return (<div>
    <h2>Home</h2>
    <Link to="/about">About</Link>
    </div>)
}

function About(){
  return (<div>About</div>)
}

function AppOrig() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
