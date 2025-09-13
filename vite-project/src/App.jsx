import { Routes, Route } from "react-router-dom";
import { UserProvider } from "./UserContext";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import TaskManagement from "./Pages/TaskManagement";
import Signup from "./Pages/Signup";



function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/TaskManagement/:projectId" element={<TaskManagement />} />
      </Routes>
    </UserProvider>
  );
}

export default App;
