import { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import UserMenu from "../UserMenu/UserMenu";
import "./Navbar.css";

function Navbar({ theme, toggleTheme }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Keyboard shortcut: Alt+T → /typing-test, Alt+R → /race
  useEffect(() => {
    const handler = (e) => {
      if (!e.altKey) return;
      if (e.key === "t") window.location.href = "/typing-test";
      if (e.key === "r") window.location.href = "/race";
      if (e.key === "l") window.location.href = "/leaderboard";
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isActive = (path) => location.pathname === path ? "nav-link-active" : "";

  return (
    <nav className="navbar">
      <div className="navbar-container">

        <Link to="/" className="navbar-logo">
          ⌨️ TypeAndTest
        </Link>

        {/* Hamburger */}
        <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>

        <div className={`navbar-links ${menuOpen ? "nav-open" : ""}`}>
          <Link to="/" className={isActive("/")}>Home</Link>
          <Link to="/typing-test" className={isActive("/typing-test")}>
            Practice <kbd>Alt+T</kbd>
          </Link>
          <Link to="/race" className={isActive("/race")}>
            Race <kbd>Alt+R</kbd>
          </Link>
          <Link to="/lessons" className={isActive("/lessons")}>Lessons</Link>
          <Link to="/games" className={isActive("/games")}>Games</Link>
          <Link to="/leaderboard" className={isActive("/leaderboard")}>Leaderboard</Link>
          {user && <Link to="/analytics" className={isActive("/analytics")}>Analytics</Link>}
          {user && <Link to="/coach" className={isActive("/coach")}>AI Coach</Link>}
        </div>

        <div className="navbar-actions">
          <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {user ? (
            <UserMenu />
          ) : (
            <>
              <Link to="/login" className="nav-login">Login</Link>
              <Link to="/register" className="nav-signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
