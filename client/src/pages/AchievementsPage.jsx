import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getMyAchievements } from "../api/resultApi";
import "./AchievementsPage.css";

const ALL_ACHIEVEMENTS = [
  { type: "FIRST_TEST",   title: "First Keystroke 🎯",   description: "Completed your first typing test" },
  { type: "WPM_30",       title: "Getting Started ⚡",    description: "Reached 30 WPM" },
  { type: "WPM_50",       title: "Speed Typer 🚀",        description: "Reached 50 WPM" },
  { type: "WPM_80",       title: "Typing Master 🔥",      description: "Reached 80 WPM" },
  { type: "WPM_100",      title: "Century Typist 💯",     description: "Reached 100 WPM" },
  { type: "WPM_120",      title: "Blazing Fast ⚡🔥",     description: "Reached 120 WPM" },
  { type: "ACC_90",       title: "Sharp Accuracy 🎯",     description: "Achieved 90%+ accuracy" },
  { type: "ACC_95",       title: "Precision Typer 🏹",    description: "Achieved 95%+ accuracy" },
  { type: "ACC_100",      title: "Perfect Accuracy ✨",   description: "Achieved 100% accuracy" },
  { type: "TEST_10",      title: "Consistent 🔁",         description: "Completed 10 tests" },
  { type: "TEST_50",      title: "Dedicated 💪",          description: "Completed 50 tests" },
  { type: "TEST_100",     title: "Centurion 🏅",          description: "Completed 100 tests" },
  { type: "CODE_TYPER",   title: "Code Monkey 🐒",        description: "Completed a code typing test" },
  { type: "QUOTE_LOVER",  title: "Quote Lover 📚",        description: "Completed a quotes test" },
  { type: "SPEED_ACC",    title: "Flawless Sprint ⚡✨",   description: "60+ WPM with 95%+ accuracy" },
];

function AchievementsPage() {
  const { user } = useContext(AuthContext);
  const [unlocked, setUnlocked] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getMyAchievements()
      .then(setUnlocked)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const unlockedTypes = new Set(unlocked.map(a => a.type));
  const total         = ALL_ACHIEVEMENTS.length;
  const done          = unlockedTypes.size;
  const pct           = Math.round((done / total) * 100);

  return (
    <div className="achievements-page">
      <div className="achievements-page-header">
        <span className="eyebrow">Your Progress</span>
        <h1>Achievements</h1>
        <p>Unlock badges by improving your speed, accuracy, and consistency.</p>
      </div>

      {/* Stats bar */}
      <div className="ach-stats-bar">
        <div className="ach-stat">
          <span className="ach-stat-val">{done}</span>
          <span className="ach-stat-label">Unlocked</span>
        </div>
        <div className="ach-stat">
          <span className="ach-stat-val">{total - done}</span>
          <span className="ach-stat-label">Remaining</span>
        </div>
        <div className="ach-stat">
          <span className="ach-stat-val">{pct}%</span>
          <span className="ach-stat-label">Complete</span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="achievements-grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="ach-skel" />
          ))}
        </div>
      ) : ALL_ACHIEVEMENTS.length === 0 ? (
        <div className="ach-empty">
          <div className="ach-empty-icon">🏆</div>
          <p>Complete typing tests to unlock achievements!</p>
        </div>
      ) : (
        <div className="achievements-grid">
          {ALL_ACHIEVEMENTS.map(ach => {
            const isUnlocked = unlockedTypes.has(ach.type);
            const doc        = unlocked.find(u => u.type === ach.type);
            return (
              <div key={ach.type} className={`achievement-card${isUnlocked ? "" : " locked"}`}>
                <span className="ach-icon">{ach.title.match(/[\u{1F300}-\u{1FFFF}]|[\u2600-\u27FF]/gu)?.[0] ?? "🏅"}</span>
                <div className="ach-card-title">{ach.title.replace(/[\u{1F300}-\u{1FFFF}]|[\u2600-\u27FF]/gu, "").trim()}</div>
                <div className="ach-card-desc">{ach.description}</div>
                {isUnlocked && doc?.createdAt
                  ? <div className="ach-date">🗓 {new Date(doc.createdAt).toLocaleDateString()}</div>
                  : <div className="ach-lock">🔒 Locked</div>
                }
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AchievementsPage;
