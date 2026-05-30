const DIFFICULTIES = [
  { value: "easy", label: "Easy", desc: "Short simple words" },
  { value: "medium", label: "Medium", desc: "Everyday words" },
  { value: "hard", label: "Hard", desc: "Long complex words" },
  { value: "quotes", label: "Quotes", desc: "Famous quotes" },
  { value: "code", label: "Code", desc: "Code snippets" },
];

function RaceLobby({
  roomId,
  setRoomId,
  createRoom,
  joinRoom,
  quickMatch,
  joinAsSpectator,
  waitingForMatch,
  roomError,
  difficulty,
  setDifficulty,
}) {
  return (
    <div className="race-lobby">
      <h1 className="lobby-title">🏁 Typing Race</h1>
      <p className="lobby-subtitle">Compete in real-time against other typists</p>

      {/* Difficulty selector */}
      <div className="difficulty-section">
        <p className="difficulty-label">Choose difficulty</p>
        <div className="difficulty-pills">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              className={`difficulty-pill ${difficulty === d.value ? "active" : ""}`}
              onClick={() => setDifficulty(d.value)}
              title={d.desc}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="race-actions">
        <button className="btn-primary" onClick={quickMatch} disabled={waitingForMatch}>
          {waitingForMatch ? (
            <span className="waiting-spin">
              <span className="spin-icon">⟳</span> Finding opponent…
            </span>
          ) : (
            "⚡ Quick Match"
          )}
        </button>
        <button className="btn-secondary" onClick={createRoom}>
          ➕ Create Room
        </button>
      </div>

      <div className="divider">or join with a code</div>

      <div className="join-room-box">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && joinRoom()}
          maxLength={10}
        />
        <button className="btn-primary" onClick={() => joinRoom()}>
          Join
        </button>
        <button className="btn-ghost" onClick={joinAsSpectator}>
          👁 Spectate
        </button>
      </div>

      {roomError && <p className="room-error">⚠ {roomError}</p>}

      <p className="lobby-hint">
        Create a room and share the link with a friend — they'll join instantly.
      </p>
    </div>
  );
}

export default RaceLobby;
