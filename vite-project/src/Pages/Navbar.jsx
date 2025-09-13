import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import ConfirmDialog from "../Overlay/ConfirmDialog";
import { darkIcon, lightIcon } from "../constVars";

function Navbar() {
  const { user, setUser } = useUser();
  const [theme, setTheme] = useState(() => {
    // Load theme from localStorage if exists, else default "dark"
    return localStorage.getItem("theme") || "dark";
  });
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  // Apply theme on mount and whenever theme changes
  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme); 
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogoutConfirm = () => {
    setShowConfirm(true);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
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
          {theme === "dark" ? darkIcon : lightIcon}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogoutConfirm}
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

      {/* Confirm Log out */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Log out?"
        message="Are you sure you want to log out?"
        onConfirm={handleLogout}
        onCancel={() => setShowConfirm(false)}
      />
    </nav>
  );
}

export default Navbar;
