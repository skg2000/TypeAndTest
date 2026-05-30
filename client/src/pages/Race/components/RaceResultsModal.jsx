const MEDALS = ["🥇", "🥈", "🥉"];

function RaceResultsModal({
  results,
  currentUserId,
  onRematch,
  onLeave,
  rematchVotes,
  myVoted,
  eloChange,
}) {
  const myRank = results.findIndex((p) => p.id === currentUserId) + 1;
  const myResult = results.find((p) => p.id === currentUserId);

  const rankMessage =
    myRank === 1 ? "🎉 You won!" : myRank === 2 ? "👍 2nd place!" : myRank === 3 ? "🥉 3rd place!" : `You finished #${myRank}`;

  return (
    <div className="race-results-overlay">
      <div className="race-results-modal">
        <h1 className="results-title">🏁 Race Finished!</h1>

        {myResult && (
          <div className="my-result-banner">
            <span>{rankMessage}</span>
            {eloChange !== null && (
              <span className={`elo-delta ${eloChange >= 0 ? "elo-gain" : "elo-loss"}`}>
                {eloChange >= 0 ? `+${eloChange}` : eloChange} Rating
              </span>
            )}
          </div>
        )}

        <div className="results-list">
          {results.map((player, index) => (
            <div
              key={player.id}
              className={`result-row ${player.id === currentUserId ? "result-row-me" : ""}`}
            >
              <span className="result-rank">{MEDALS[index] || `#${index + 1}`}</span>
              <span className="result-name">
                {player.name}
                {player.id === currentUserId && <span className="you-tag"> (You)</span>}
              </span>
              <span className="result-wpm">{player.finalWpm || player.wpm || 0} WPM</span>
              <span className="result-accuracy">
                {player.finalAccuracy ?? player.accuracy ?? 100}%
              </span>
              <span className="result-progress">{Math.round(player.progress)}%</span>
            </div>
          ))}
        </div>

        <div className="results-actions">
          <div className="rematch-section">
            <button
              className={`btn-primary ${myVoted ? "btn-voted" : ""}`}
              onClick={onRematch}
              disabled={myVoted}
            >
              {myVoted ? `⏳ Waiting… ${rematchVotes.votes}/${rematchVotes.total}` : "🔄 Rematch"}
            </button>
            {rematchVotes.total > 0 && !myVoted && (
              <span className="vote-hint">
                {rematchVotes.votes}/{rematchVotes.total} ready
              </span>
            )}
          </div>
          <button className="btn-ghost" onClick={onLeave}>
            🚪 Leave
          </button>
        </div>
      </div>
    </div>
  );
}

export default RaceResultsModal;
