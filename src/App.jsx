import './App.css'
import {Routes, Route} from "react-router-dom";
import Nav from './components/Nav';
import Home from "./components/Home"
import Create from './components/Create';
import EntriesByDate from './components/EntriesByDate';


function App() {

  return (
    <div>
      <Nav />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/entries/:date" element={<EntriesByDate />} />
      </Routes>
    </div>
  )
}

export default App
