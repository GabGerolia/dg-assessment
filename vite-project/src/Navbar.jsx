import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

function Navbar() {
  const { user, setUser } = useUser();
  const [theme, setTheme] = useState("dark");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    setUser(null); // clear context
    localStorage.removeItem("user"); // clear persistence
    navigate("/"); // go back to login
  };

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 bg-[var(--bg)] border-b border-[var(--border)] shadow">
      {/* Logo / Title */}
      <div
        className="text-2xl font-bold cursor-pointer"
        onClick={() => navigate("/home")}
      >
        Home
      </div>

      {/* Icons and Username */}
      <div className="flex items-center space-x-4">
        {/* Username */}
        {user && (
          <span className="text-[var(--secondary)] font-medium">
            {user.username}
          </span>
        )}

        {/* Dark/Light Mode */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-[var(--highlight)] transition"
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.05l-.71-.71M12 7a5 5 0 100 10 5 5 0 000-10z"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
              />
            </svg>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-[var(--danger)]/20 transition"
          aria-label="Log out"
        >
          <svg
            className="w-6 h-6 text-[var(--danger)]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
