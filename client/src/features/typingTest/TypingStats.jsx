import "./TypingStats.css";

function TypingStats({ timeLeft, wpm, accuracy }) {
  return (
    <div className="typing-stats">
      <div className="stat-card">
        <span>Time</span>
        <strong>{timeLeft}s</strong>
      </div>

      <div className="stat-card">
        <span>WPM</span>
        <strong>{wpm}</strong>
      </div>

      <div className="stat-card">
        <span>Accuracy</span>
        <strong>{accuracy}%</strong>
      </div>
    </div>
  );
}

export default TypingStats;