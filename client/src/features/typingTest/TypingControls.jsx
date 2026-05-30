import "./TypingControls.css";

function TypingControls({
  mode,
  time,
  mute,
  setMute,
  onModeChange,
  onTimeChange,
  onRestart,
}) {
  return (
    <div className="typing-controls">
      {/* MODE BUTTONS */}
      <div className="control-group">
        <button
          className={mode === "easy" ? "active" : ""}
          onClick={() => onModeChange("easy")}
        >
          Easy
        </button>

        <button
          className={mode === "medium" ? "active" : ""}
          onClick={() => onModeChange("medium")}
        >
          Medium
        </button>

        <button
          className={mode === "hard" ? "active" : ""}
          onClick={() => onModeChange("hard")}
        >
          Hard
        </button>

        <button
          className={mode === "quotes" ? "active" : ""}
          onClick={() => onModeChange("quotes")}
        >
          Quotes
        </button>

        <button
          className={mode === "code" ? "active" : ""}
          onClick={() => onModeChange("code")}
        >
          Code
        </button>
      </div>

      {/* TIME BUTTONS */}
      <div className="control-group">
        <button
          className={time === 15 ? "active" : ""}
          onClick={() => onTimeChange(15)}
        >
          15s
        </button>

        <button
          className={time === 30 ? "active" : ""}
          onClick={() => onTimeChange(30)}
        >
          30s
        </button>

        <button
          className={time === 60 ? "active" : ""}
          onClick={() => onTimeChange(60)}
        >
          60s
        </button>
      </div>

      {/* ACTIONS */}
      <div className="control-group">
        <button onClick={() => setMute(!mute)}>
          {mute ? "🔇 Mute" : "🔊 Sound"}
        </button>

        <button onClick={() => onRestart()}>
          Restart
        </button>
      </div>
    </div>
  );
}

export default TypingControls;