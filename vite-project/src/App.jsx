import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
// import './App.css'
import Signup from "./Signup";
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/Signup" element={<Signup />} />
    </Routes>
  );
}

export default App;
