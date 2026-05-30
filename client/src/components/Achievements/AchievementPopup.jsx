import "./AchievementPopup.css";

function AchievementPopup({ achievements }) {
  if (!achievements || achievements.length === 0) return null;

  return (
    <div className="achievement-popup">
      {achievements.map((a) => (
        <div key={a._id} className="popup-card">
          🎉 <strong>{a.title}</strong>
          <p>{a.description}</p>
        </div>
      ))}
    </div>
  );
}

export default AchievementPopup;