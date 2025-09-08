// App.jsx
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import Signup from "./Signup";
import { UserProvider } from "./UserContext";
import TaskManagement from "./TaskManagement";
import CreateTasks from "./CreateTasks";

function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/try" element={<CreateTasks />} /> {/* for testing only */}
        {/* route now accepts a projectId param */}
        <Route path="/TaskManagement/:projectId" element={<TaskManagement />} />
      </Routes>
    </UserProvider>
  );
}

export default App;
