import { useState, useEffect, useRef, useCallback } from "react";
import VirtualKeyboard from "./VirtualKeyboard";
import "../styles/lessons.css";

export default function LessonTypingBox({ lesson, onComplete }) {
  const text = lesson.text;

  const [input,      setInput]      = useState("");
  const [startTime,  setStartTime]  = useState(null);
  const [finished,   setFinished]   = useState(false);
  const [lastCorrect,setLastCorrect]= useState(null);
  const [lastWrong,  setLastWrong]  = useState(null);
  const [shakeIdx,   setShakeIdx]   = useState(null);

  const inputRef  = useRef(null);
  const displayRef= useRef(null);

  // Reset when lesson changes
  useEffect(() => {
    setInput(""); setStartTime(null); setFinished(false);
    setLastCorrect(null); setLastWrong(null); setShakeIdx(null);
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [lesson.id]);

  // Scroll caret into view
  useEffect(() => {
    const el = displayRef.current?.querySelector(".lt-caret");
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [input]);

  const handleKeyDown = useCallback((e) => {
    if (finished) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      setInput(p => p.slice(0, -1));
      return;
    }

    if (e.key.length !== 1) return;
    e.preventDefault();

    const idx     = input.length;
    const expected = text[idx];
    if (!expected) return;

    if (!startTime) setStartTime(Date.now());

    const typed = e.key;
    const correct = typed === expected;

    setLastCorrect(correct  ? expected : null);
    setLastWrong (!correct  ? expected : null);

    if (!correct) {
      setShakeIdx(idx);
      setTimeout(() => setShakeIdx(null), 350);
      setInput(p => p + typed);   // show the error, let user backspace
      return;
    }

    const newInput = input + typed;
    setInput(newInput);

    if (newInput.length === text.length) {
      const elapsedMin = (Date.now() - startTime) / 60000;
      const words      = text.trim().split(/\s+/).length;
      const wpm        = Math.round(words / Math.max(elapsedMin, 0.01));
      const correct_c  = newInput.split("").filter((c, i) => c === text[i]).length;
      const accuracy   = Math.round((correct_c / text.length) * 100);
      setFinished(true);
      onComplete({ wpm, accuracy });
    }
  }, [input, text, startTime, finished, onComplete]);

  // Stats
  const correctChars = input.split("").filter((c, i) => c === text[i]).length;
  const accuracy     = input.length ? Math.round((correctChars / input.length) * 100) : 100;
  const elapsedMin   = startTime ? (Date.now() - startTime) / 60000 : 0;
  const wpm          = startTime
    ? Math.round((correctChars / 5) / Math.max(elapsedMin, 0.01))
    : 0;
  const progress     = Math.round((input.length / text.length) * 100);

  const currentChar = text[input.length] || null;

  return (
    <div className="ltb-wrap" onClick={() => inputRef.current?.focus()}>
      {/* Hidden real input */}
      <input
        ref={inputRef}
        className="ltb-hidden-input"
        onKeyDown={handleKeyDown}
        readOnly
        autoFocus
      />

      {/* Stats bar */}
      <div className="ltb-stats">
        <div className="ltb-stat">
          <span className="ltb-stat-val">{wpm}</span>
          <span className="ltb-stat-label">WPM</span>
        </div>
        <div className="ltb-stat">
          <span className="ltb-stat-val" style={{ color: accuracy < 90 ? "#ef4444" : "#22c55e" }}>
            {accuracy}%
          </span>
          <span className="ltb-stat-label">Accuracy</span>
        </div>
        <div className="ltb-stat">
          <span className="ltb-stat-val">{progress}%</span>
          <span className="ltb-stat-label">Progress</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="ltb-progress-bar">
        <div className="ltb-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Text display */}
      <div className="ltb-display" ref={displayRef}>
        {text.split("").map((char, i) => {
          let cls = "lt-char";
          if (i < input.length) {
            cls += input[i] === char ? " lt-correct" : " lt-wrong";
            if (i === shakeIdx) cls += " lt-shake";
          } else if (i === input.length) {
            cls += " lt-caret";
          } else {
            cls += " lt-pending";
          }
          return (
            <span key={i} className={cls}>
              {char === " " ? "\u00A0" : char}
            </span>
          );
        })}
      </div>

      {/* Tip */}
      {lesson.tip && (
        <div className="ltb-tip">
          💡 {lesson.tip}
        </div>
      )}

      {/* Virtual Keyboard */}
      <VirtualKeyboard
        currentChar={currentChar}
        lastCorrect={lastCorrect}
        lastWrong={lastWrong}
      />
    </div>
  );
}
