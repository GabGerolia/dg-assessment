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

        // save user globally
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
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-dark)] px-4">
      <div className="w-full max-w-md bg-[var(--bg)] text-[var(--text)] rounded-2xl shadow-lg p-8 border border-[var(--border)]">
        <h1 className="text-3xl font-bold text-center mb-6">LOGIN</h1>

        {/* Reminder/Error message */}
        {reminder && (
          <div className="mb-4 text-center text-sm font-medium text-[var(--danger)]">
            {reminder}
          </div>
        )}

        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block font-medium mb-1 text-[var(--text-muted)]">
              Username
            </label>
            <input
              className="user w-full border border-[var(--border)] rounded-lg px-4 py-2 bg-[var(--bg-light)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              type="text"
              required
              placeholder="Enter your username"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-medium mb-1 text-[var(--text-muted)]">
              Password
            </label>
            <input
              className="pw w-full border border-[var(--border)] rounded-lg px-4 py-2 bg-[var(--bg-light)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              type="password"
              required
              placeholder="Enter your password"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            onClick={handleLoginClick}
            className="w-full bg-[var(--primary)] text-[var(--bg-dark)] font-semibold py-2 rounded-lg hover:opacity-90 transition"
          >
            Log in
          </button>

          {/* Forgot password */}
          {/* <div className="text-right">
            <a
              href="#"
              className="text-sm text-[var(--secondary)] hover:underline"
            >
              Forgot Password?
            </a>
          </div> */}
        </div>

        {/* Signup link */}
        <div className="mt-6 text-center">
          <span className="text-[var(--text-muted)]">Don’t have an account?</span>{" "}
          <Link
            to="/signup"
            className="text-[var(--secondary)] font-medium hover:underline"
          >
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
