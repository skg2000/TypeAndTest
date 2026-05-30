import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">⌨️ TypeMaster</Link>
          <p>Improve your typing speed, accuracy, and compete with others in real-time races. Built for serious typists.</p>
          <div className="footer-social">
            <a href="#" title="Website">🌐</a>
            <a href="#" title="Twitter">🐦</a>
            <a href="#" title="GitHub">🐙</a>
            <a href="#" title="Discord">💬</a>
          </div>
        </div>

        {/* Practice */}
        <div className="footer-section">
          <h4>Practice</h4>
          <ul>
            <li><Link to="/typing-test">Typing Test</Link></li>
            <li><Link to="/lessons">Lessons</Link></li>
            <li><Link to="/coach">AI Coach</Link></li>
            <li><Link to="/games">Games</Link></li>
          </ul>
        </div>

        {/* Compete */}
        <div className="footer-section">
          <h4>Compete</h4>
          <ul>
            <li><Link to="/race">Live Race</Link></li>
            <li><Link to="/leaderboard">Leaderboard</Link></li>
            <li><Link to="/friends">Friends</Link></li>
            <li><Link to="/achievements">Achievements</Link></li>
          </ul>
        </div>

        {/* Account */}
        <div className="footer-section">
          <h4>Account</h4>
          <ul>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Sign Up</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/progress">Analytics</Link></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} TypeMaster. All rights reserved.</p>
        <div className="footer-bottom-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
}
