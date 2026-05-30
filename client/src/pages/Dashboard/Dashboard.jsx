import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { getMyStats } from "../../api/resultApi";
import { AuthContext } from "../../context/AuthContext";
import RankedBadge from "../../components/RankedBadge/RankedBadge";
import "./Dashboard.css";

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="dash-card">
      <div className="dash-card-icon">{icon}</div>
      <div className="dash-card-val">{value}</div>
      <div className="dash-card-label">{label}</div>
      {sub && <div className="dash-card-sub">{sub}</div>}
    </div>
  );
}

function SkeletonCard() {
  return <div className="dash-card skel-card"><div className="skel skel-h" /><div className="skel skel-w" /></div>;
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyStats()
      .then(data => setStats(data))
      .catch(() => setStats({ totalTests: 0, bestWpm: 0, averageWpm: 0, averageAccuracy: 0, recentResults: [] }))
      .finally(() => setLoading(false));
  }, []);

  const winRate = user?.totalRaces > 0
    ? Math.round((user.racesWon / user.totalRaces) * 100) : 0;

  return (
    <div className="dashboard-page">
      {/* ── Header ── */}
      <div className="dash-hero">
        <div className="dash-hero-left">
          <h1>Welcome back, <span>{user?.name || "Typist"}</span> 👋</h1>
          <p className="dash-subtitle">Keep pushing your limits.</p>
          {user?.rating && (
            <div style={{ marginTop: 12 }}>
              <RankedBadge rating={user.rating} showProgress size="lg" />
            </div>
          )}
        </div>
        <div className="dash-streak">
          <div className="streak-fire">🔥</div>
          <div className="streak-num">{user?.currentStreak || 0}</div>
          <div className="streak-lbl">Day Streak</div>
          <div className="streak-best">Best: {user?.longestStreak || 0}</div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="dash-cards">
        {loading ? (
          [1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard icon="⚡" label="Best WPM" value={stats.bestWpm} sub="Personal record" />
            <StatCard icon="📊" label="Avg WPM" value={stats.averageWpm} sub="All tests" />
            <StatCard icon="🎯" label="Accuracy" value={`${stats.averageAccuracy}%`} sub="Average" />
            <StatCard icon="📝" label="Tests" value={stats.totalTests} sub="Completed" />
            <StatCard icon="🏁" label="Races" value={user?.totalRaces || 0} sub={`${winRate}% win rate`} />
            <StatCard icon="🏆" label="Rating" value={user?.rating || 1200} sub="Elo rating" />
          </>
        )}
      </div>

      {/* ── Quick actions ── */}
      <div className="dash-actions">
        <Link to="/typing-test" className="dash-action-btn primary">⌨️ Start Practice</Link>
        <Link to="/race" className="dash-action-btn secondary">🏎️ Race Now</Link>
        <Link to="/analytics" className="dash-action-btn secondary">📈 Analytics</Link>
        <Link to="/coach" className="dash-action-btn secondary">🔥 AI Coach</Link>
        <Link to={`/profile/${user?.name}`} className="dash-action-btn secondary">👤 Profile</Link>
        <Link to="/leaderboard" className="dash-action-btn secondary">🏆 Leaderboard</Link>
      </div>

      {/* ── Recent Results ── */}
      <div className="dash-recent">
        <div className="section-head">
          <h2>Recent Tests</h2>
          <Link to="/analytics" className="see-all">See all →</Link>
        </div>

        {loading ? (
          <div className="table-skeleton">
            {[1,2,3].map(i => <div key={i} className="skel skel-row" />)}
          </div>
        ) : stats.recentResults.length === 0 ? (
          <div className="dash-empty">
            <p>No tests yet.</p>
            <Link to="/typing-test" className="dash-action-btn primary" style={{ display: "inline-block", marginTop: 12 }}>Take your first test →</Link>
          </div>
        ) : (
          <div className="recent-table">
            <div className="table-head">
              <span>Date</span><span>WPM</span><span>Accuracy</span><span>Mode</span><span>Time</span>
            </div>
            {stats.recentResults.map(r => (
              <div className="table-row" key={r._id}>
                <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                <span className="wpm-hi">{r.wpm}</span>
                <span>{r.accuracy}%</span>
                <span><span className="mode-tag">{r.mode}</span></span>
                <span>{r.time}s</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
