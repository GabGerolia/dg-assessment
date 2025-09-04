import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-dark)] px-4">
      <div className="w-full max-w-md bg-[var(--bg)] text-[var(--text)] rounded-2xl shadow-lg p-8 border border-[var(--border)]">
        <h1 className="text-3xl font-bold text-center mb-6">SIGN UP</h1>

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

          {/* Confirm Password */}
          <div>
            <label className="block font-medium mb-1 text-[var(--text-muted)]">
              Confirm Password
            </label>
            <input
              className="confirmPw w-full border border-[var(--border)] rounded-lg px-4 py-2 bg-[var(--bg-light)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              type="password"
              required
              placeholder="Confirm your password"
            />
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            onClick={handleSignupClick}
            className="w-full bg-[var(--primary)] text-[var(--bg-dark)] font-semibold py-2 rounded-lg hover:opacity-90 transition"
          >
            Sign up
          </button>
        </div>

        {/* Login link */}
        <div className="mt-6 text-center">
          <span className="text-[var(--text-muted)]">Already have an account?</span>{" "}
          <Link
            to="/"
            className="text-[var(--secondary)] font-medium hover:underline"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
