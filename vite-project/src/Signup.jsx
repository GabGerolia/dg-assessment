import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Signup() {
  const [reminder, setReminder] = useState("");
  const navigate = useNavigate();

  const handleSignupClick = async () => {
    const uname = document.querySelector(".user");
    const pword = document.querySelector(".pw");
    const confirmPword = document.querySelector(".confirmPw");

    const unameInput = uname.value.trim();
    const pwordInput = pword.value.trim();
    const confirmPwordInput = confirmPword.value.trim();

    if (unameInput === "") {
      setReminder("Username cannot be empty.");
      return;
    } else if (pwordInput === "" || confirmPwordInput === "") {
      setReminder("Password cannot be empty.");
      return;
    } else if (pwordInput !== confirmPwordInput) {
      setReminder("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/signup", {
        username: unameInput,
        password: pwordInput,
      });

      if (response.data.success) {
        setReminder("Signup successful! Redirecting...");
        setTimeout(() => navigate("/"), 1500); // redirect to login
      } else {
        setReminder(response.data.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setReminder("Server error. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-title"><b>SIGNUP</b></div>
      <div className="signup-reminder text-red-700">{reminder}</div>
      <div className="signup-input-container">
        <h6>Username</h6>
        <input className="user" type="text" required placeholder="Username" />
        <h6>Password</h6>
        <input className="pw" type="password" required placeholder="Password" /><br />
        <h6>Confirm Password</h6>
        <input className="confirmPw" type="password" required placeholder="Confirm Password" /><br />
        <button type="submit" className="bg-blue-100" onClick={handleSignupClick}>
          Sign up
        </button><br />
      </div>
    </div>
  );
}

export default Signup;
