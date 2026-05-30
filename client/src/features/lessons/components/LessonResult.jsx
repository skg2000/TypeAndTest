import { useEffect, useState } from "react";
import "../styles/lessons.css";

function Stars({ count }) {
  return (
    <div className="lr-stars">
      {[1, 2, 3].map(i => (
        <span
          key={i}
          className={`lr-star${i <= count ? " lr-star-filled" : ""}`}
          style={{ animationDelay: `${(i - 1) * 0.2}s` }}
        >★</span>
      ))}
    </div>
  );
}

export default function LessonResult({ result, lesson, onNext, onRetry }) {
  const { wpm, accuracy, stars, xpEarned, passed } = result;
  const [show, setShow] = useState(false);

  useEffect(() => { setTimeout(() => setShow(true), 50); }, []);

  const msgs = {
    3: ["Perfect! 🎉", "Flawless accuracy!", "You're a natural!"],
    2: ["Great job! 🚀", "Solid performance!", "Keep it up!"],
    1: ["Lesson cleared ✅", "Good effort!", "Practice makes perfect."],
    0: ["Not quite… 💪", "Keep practicing!", "You'll get it!"],
  };
  const [headline, tagline] = msgs[stars] || msgs[0];

  return (
    <div className={`lr-overlay${show ? " lr-visible" : ""}`}>
      <div className="lr-card">
        {/* Stars */}
        <Stars count={stars} />

        <h2 className="lr-headline">{headline}</h2>
        <p  className="lr-tagline">{tagline}</p>

        {/* Stats */}
        <div className="lr-stats">
          <div className="lr-stat">
            <span className="lr-stat-num">{wpm}</span>
            <span className="lr-stat-label">WPM</span>
          </div>
          <div className="lr-stat">
            <span className="lr-stat-num" style={{ color: accuracy >= 90 ? "#22c55e" : "#ef4444" }}>
              {accuracy}%
            </span>
            <span className="lr-stat-label">Accuracy</span>
          </div>
          {xpEarned > 0 && (
            <div className="lr-stat">
              <span className="lr-stat-num xp">+{xpEarned}</span>
              <span className="lr-stat-label">XP</span>
            </div>
          )}
        </div>

        {/* Requirement note */}
        {!passed && (
          <p className="lr-fail-note">
            Need 75%+ accuracy to unlock the next lesson. You got {accuracy}%.
          </p>
        )}

        {/* Actions */}
        <div className="lr-actions">
          <button className="lr-btn retry" onClick={onRetry}>↩ Retry</button>
          {passed && onNext && (
            <button className="lr-btn next" onClick={onNext}>Next Lesson →</button>
          )}
        </div>
      </div>
    </div>
  );
}
