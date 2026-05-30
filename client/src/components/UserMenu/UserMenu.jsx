import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getRank } from "../../utils/rankSystem";
import "./UserMenu.css";

function UserMenu() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const go = (path) => { navigate(path); setOpen(false); };
  const rank = getRank(user?.rating || 1200);

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="avatar" onClick={() => setOpen(!open)} title="Account">
        {user?.avatar
          ? <img src={user.avatar} alt="avatar" className="avatar-img" />
          : <span className="avatar-initial">{user?.name?.[0]?.toUpperCase() || "?"}</span>
        }
        <span className="avatar-rank-dot" style={{ background: rank.color }} title={rank.name} />
      </button>

      {open && (
        <div className="dropdown">
          <div className="dropdown-header">
            <div className="dh-left">
              {user?.avatar
                ? <img src={user.avatar} alt="avatar" className="dh-avatar" />
                : <div className="dh-avatar-placeholder">{user?.name?.[0]?.toUpperCase()}</div>
              }
            </div>
            <div className="dh-right">
              <p className="user-name">{user?.name || "User"}</p>
              <span className="rank-chip" style={{ background: rank.bg, color: rank.color, border: `1px solid ${rank.color}` }}>
                {rank.icon} {rank.name} · {user?.rating || 1200}
              </span>
            </div>
          </div>

          <div className="dropdown-divider" />

          <button onClick={() => go(`/profile/${user?.name}`)}>👤 Profile</button>
          <button onClick={() => go("/dashboard")}>📊 Dashboard</button>
          <button onClick={() => go("/progress")}>📈 Progress</button>
          <button onClick={() => go("/friends")}>👥 Friends</button>
          <button onClick={() => go("/achievements")}>🏆 Achievements</button>

          <div className="dropdown-divider" />

          <button className="logout-btn" onClick={() => { logout(); navigate("/"); setOpen(false); }}>
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
