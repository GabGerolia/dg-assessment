import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useUser } from "./UserContext";  // <-- import

function Login() {
  const [reminder, setReminder] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUser();  // <-- get setter from context

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

        // 🔑 save user globally
        setUser(response.data.user);

        // redirect to home
        navigate("/home");
      } else {
        setReminder("Invalid username or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setReminder("Server error.");
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">LOGIN</h1>

        {/* Reminder/Error message */}
        {reminder && (
          <div className="mb-4 text-center text-sm font-medium text-red-600">
            {reminder}
          </div>
        )}

        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Username</label>
            <input
              className="user w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="text"
              required
              placeholder="Enter your username"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              className="pw w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="password"
              required
              placeholder="Enter your password"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            onClick={handleLoginClick}
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Log in
          </button>

          {/* Forgot password */}
          <div className="text-right">
            <a
              href="#"
              className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
            >
              Forgot Password?
            </a>
          </div>
        </div>

        {/* Signup link */}
        <div className="mt-6 text-center">
          <span className="text-gray-600">Don’t have an account?</span>{" "}
          <Link
            to="/signup"
            className="text-blue-500 font-medium hover:text-blue-600 hover:underline"
          >
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
