import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Login from "./Login";
import Home from "./Home";
import Signup from "./Signup";
import { UserProvider } from "./UserContext"; 
import TaskManagement from "./TaskManagement";

function App() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/TaskManagement") {
      document.body.classList.add("overflow-y-hidden");
    } else {
      document.body.classList.remove("overflow-y-hidden");
    }
  }, [location.pathname]);

  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/TaskManagement" element={<TaskManagement />} />
      </Routes>
    </UserProvider>
  );
}

export default App;
