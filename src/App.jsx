import './App.css'
import {Routes, Route} from "react-router-dom";
import Nav from './components/Nav';
import Home from "./components/Home"
import Create from './components/Create';


function App() {

  return (
    <div>
      <Nav />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
      </Routes>
    </div>
  )
}

export default App
