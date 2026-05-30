function RacePlayerCard({ player, isCurrentUser }) {
  const accuracy = player.accuracy ?? 100;

  return (
    <div className={`race-player-card ${isCurrentUser ? "my-card" : ""}`}>
      <div className="player-header">
        <h3>
          {isCurrentUser ? "🧑 " : "👤 "}
          {player.name}
          {isCurrentUser && <span className="you-badge"> (You)</span>}
          {player.finished && (
            <span className="finished-badge">
              {player.position === 1 ? " 🥇" : player.position === 2 ? " 🥈" : " 🥉"}
            </span>
          )}
        </h3>
        <span className="progress-pct">{Math.round(player.progress)}%</span>
      </div>

      <div className="progress-bar-track">
        <div
          className={`progress-fill ${player.finished ? "fill-done" : ""}`}
          style={{ width: `${Math.max(player.progress, 2)}%` }}
        >
          <div className="car-cursor">🏎️</div>
        </div>
      </div>

      <div className="player-stats">
        <span>⚡ {player.wpm || 0} WPM</span>
        <span>🎯 {accuracy}% acc</span>
        {player.finished && <span className="finish-label">Finished!</span>}
      </div>
    </div>
  );
}

export default RacePlayerCard;
