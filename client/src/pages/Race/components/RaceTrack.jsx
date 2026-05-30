import { useEffect, useRef, useState, useCallback } from "react";
import socket from "../../../socket/socket";
import RacePlayerCard from "./RacePlayerCard";
import SpectatorBadge from "./SpectatorBadge";
import { playSound, setMuted, isMuted } from "../../../utils/typingSound";

function RaceTrack({
  text,
  roomId,
  players,
  raceStarted,
  raceFinished,
  isSpectator,
  currentUserId,
  onLeave,
  onCopyLink,
}) {
  // Word-by-word state
  const [words, setWords] = useState([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [wordStatuses, setWordStatuses] = useState([]); // "correct" | "incorrect" | "pending"
  const [errorCount, setErrorCount] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [copied, setCopied] = useState(false);
  const [muted, setMutedState] = useState(false);

  const toggleMute = () => { const next = !muted; setMutedState(next); setMuted(next); };
  const inputRef = useRef(null);

  // Parse text into words when text changes
  useEffect(() => {
    if (text) {
      const w = text.split(" ");
      setWords(w);
      setWordStatuses(new Array(w.length).fill("pending"));
      setCurrentWordIdx(0);
      setCurrentInput("");
      setErrorCount(0);
      setTotalTyped(0);
    }
  }, [text]);

  // Auto-focus when race starts
  useEffect(() => {
    if (raceStarted && !isSpectator) {
      inputRef.current?.focus();
    }
  }, [raceStarted, isSpectator]);

  // Reset on rematch
  useEffect(() => {
    if (!raceStarted && !text) {
      setWords([]);
      setWordStatuses([]);
      setCurrentWordIdx(0);
      setCurrentInput("");
      setErrorCount(0);
      setTotalTyped(0);
    }
  }, [raceStarted, text]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!raceStarted || isSpectator || raceFinished || !text) return;

      // Space = commit current word
      if (e.key === " ") {
        e.preventDefault();
        if (currentInput.trim() === "") return;

        const isCorrect = currentInput === words[currentWordIdx];
        const newStatuses = [...wordStatuses];
        newStatuses[currentWordIdx] = isCorrect ? "correct" : "incorrect";

        const newErrors = errorCount + (isCorrect ? 0 : 1);
        const charsCommitted = totalTyped + currentInput.length;
        const nextIdx = currentWordIdx + 1;

        setWordStatuses(newStatuses);
        if (isCorrect) playSound("keypress"); else playSound("error");
        setCurrentWordIdx(nextIdx);
        setCurrentInput("");
        setErrorCount(newErrors);
        setTotalTyped(charsCommitted);

        // Count correct characters from correct words
        const correctChars = words
          .slice(0, nextIdx)
          .reduce((acc, w, i) => acc + (newStatuses[i] === "correct" ? w.length + 1 : 0), 0);

        const progress = (nextIdx / words.length) * 100;

        socket.emit("progress", {
          roomId,
          progress: Math.min(progress, 100),
          inputLength: charsCommitted,
          correctLength: correctChars,
          errorCount: newErrors,
        });

        // Last word
        if (nextIdx >= words.length) { playSound("finish");
          socket.emit("progress", {
            roomId,
            progress: 100,
            inputLength: charsCommitted,
            correctLength: correctChars,
            errorCount: newErrors,
          });
        }
        return;
      }

      // Backspace — only within current word, no crossing back
      if (e.key === "Backspace") {
        setCurrentInput((prev) => prev.slice(0, -1));
        return;
      }
    },
    [raceStarted, isSpectator, raceFinished, text, currentInput, words, currentWordIdx, wordStatuses, errorCount, totalTyped, roomId]
  );

  const handleInput = useCallback(
    (e) => {
      if (!raceStarted || isSpectator || raceFinished) return;
      const val = e.target.value;
      // Block space from input (handled in keyDown)
      if (val.includes(" ")) return;
      setCurrentInput(val);
    },
    [raceStarted, isSpectator, raceFinished]
  );

  const handleCopy = () => {
    onCopyLink?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render race text word by word
  const renderWords = () => {
    if (!words.length) return null;

    return words.map((word, wi) => {
      const isActive = wi === currentWordIdx;
      const status = wordStatuses[wi];

      let wordClass = "word-pending";
      if (status === "correct") wordClass = "word-correct";
      else if (status === "incorrect") wordClass = "word-incorrect";
      else if (isActive) wordClass = "word-active";

      return (
        <span key={wi} className={`race-word ${wordClass}`}>
          {isActive
            ? word.split("").map((ch, ci) => {
                let charClass = "char-pending";
                if (ci < currentInput.length) {
                  charClass = currentInput[ci] === ch ? "char-correct" : "char-incorrect";
                } else if (ci === currentInput.length) {
                  charClass = "char-cursor";
                }
                return (
                  <span key={ci} className={charClass}>
                    {ch}
                  </span>
                );
              })
            : word}
          {wi < words.length - 1 && " "}
        </span>
      );
    });
  };

  const myPlayer = players.find((p) => p.id === currentUserId);
  const accuracy =
    totalTyped > 0
      ? Math.round(((totalTyped - errorCount * 5) / totalTyped) * 100)
      : 100;

  return (
    <div className="race-track">
      <div className="race-track-header">
        <div className="room-id-badge">
          Room: <strong>{roomId}</strong>
        </div>
        {isSpectator && <SpectatorBadge />}
        <button className="share-btn" onClick={handleCopy} title="Copy invite link">
          {copied ? "✅ Copied!" : "🔗 Share"}
        </button>
        <button className="mute-btn" onClick={toggleMute} title="Toggle sound">
          {muted ? "🔇" : "🔊"}
        </button>
        <button className="mute-btn" onClick={toggleMute} title="Toggle sound">{muted ? "🔇" : "🔊"}</button>
        <button className="leave-btn" onClick={onLeave}>
          Leave
        </button>
      </div>

      {/* Live player progress bars */}
      <div className="players-list">
        {players.map((player) => (
          <RacePlayerCard
            key={player.id}
            player={player}
            isCurrentUser={player.id === currentUserId}
          />
        ))}
      </div>

      {/* Waiting message */}
      {!raceStarted && !raceFinished && (
        <div className="waiting-msg">
          {players.length < 2
            ? "⏳ Waiting for another player to join…"
            : "✅ Players ready! Race starting soon…"}
        </div>
      )}

      {/* Race text */}
      {text && (
        <div className="race-text" aria-label="Race text" onClick={() => inputRef.current?.focus()}>
          {renderWords()}
        </div>
      )}

      {/* Word input (hidden-style, focused for typing) */}
      {!isSpectator && (
        <div className="race-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={raceStarted ? "Type the highlighted word, Space to advance…" : "Race will start soon…"}
            disabled={!raceStarted || raceFinished}
            className={`word-input ${raceFinished ? "input-disabled" : ""}`}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
          {raceStarted && !raceFinished && myPlayer && (
            <div className="live-stats">
              <span>⚡ {myPlayer.wpm || 0} WPM</span>
              <span>🎯 {accuracy}%</span>
              <span>📊 {Math.round(myPlayer.progress || 0)}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RaceTrack;
