import "./Achievements.css";

function AchievementsGrid({ data }) {
  return (
    <div className="achievements-grid">
      {data.map((a) => (
        <div key={a._id} className="achievement-card">
          <h3>{a.title}</h3>
          <p>{a.description}</p>
        </div>
      ))}
    </div>
  );
}

export default AchievementsGrid;