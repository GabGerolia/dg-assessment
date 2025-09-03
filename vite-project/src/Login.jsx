import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [reminder, setReminder] = useState("");
  const navigate = useNavigate(); // hook for navigation

  const handleLoginClick = async () => {
    const uname = document.querySelector(".user"); 
    const pword = document.querySelector(".pw");
    const unameInput = uname.value.trim();
    const pwordInput = pword.value.trim();

    if (unameInput === "") {
      setReminder("Username cannot be empty.");
      return;
    } else if (pwordInput === "") {
      setReminder("Password cannot be empty.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/login", {
        username: unameInput,
        password: pwordInput,
      });

      if (response.data.success) {
        setReminder("Login success!");
        navigate("/home"); // redirect to Home page
      } else {
        setReminder("Invalid username or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setReminder("Server error.");
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-title"><b>LOGIN</b></div>
        <div className="login-reminder text-red-700">{reminder}</div>
        <div className="login-input-container">
          <h6>Username</h6>
          <input className="user" type="text" required placeholder="Username" />
          <h6>Password</h6>
          <input className="pw" type="password" required placeholder="Password"/><br />
          <button type="submit" className="bg-blue-100" onClick={handleLoginClick}>
            Log in
          </button> <br />
          <a href="#">Forgot Password</a>
        </div>
        <div className="login-signup">
          <a href="#">Signup</a>
        </div>
      </div>
    </>
  );
}

export default Login;
