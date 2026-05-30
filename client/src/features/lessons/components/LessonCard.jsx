import "../styles/lessons.css";

const DIFF_COLOR = {
  Beginner:     "#22c55e",
  Intermediate: "#f59e0b",
  Advanced:     "#f97316",
  Expert:       "#ef4444",
};

function Stars({ count, max = 3 }) {
  return (
    <div className="lc-stars" aria-label={`${count} of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < count ? "lc-star filled" : "lc-star"}>★</span>
      ))}
    </div>
  );
}

export default function LessonCard({ lesson, progress, locked, onClick, phaseColor }) {
  const isCompleted = progress?.completed;
  const stars       = progress?.stars ?? 0;
  const bestWpm     = progress?.bestWpm ?? 0;
  const bestAcc     = progress?.bestAccuracy ?? 0;

  return (
    <div
      className={`lc-card${locked ? " lc-locked" : ""}${isCompleted ? " lc-done" : ""}`}
      onClick={!locked ? onClick : undefined}
      style={{ "--phase-color": phaseColor || "#8b5cf6" }}
    >
      {/* Phase color bar */}
      <div className="lc-color-bar" />

      {/* Lock overlay */}
      {locked && (
        <div className="lc-lock-overlay">
          <span className="lc-lock-icon">🔒</span>
          <span className="lc-lock-text">Complete previous lesson</span>
        </div>
      )}

      {/* Header */}
      <div className="lc-header">
        <span className="lc-num">#{lesson.id}</span>
        <span
          className="lc-diff"
          style={{ color: DIFF_COLOR[lesson.difficulty], borderColor: DIFF_COLOR[lesson.difficulty] }}
        >
          {lesson.difficulty}
        </span>
      </div>

      {/* Content */}
      <h3 className="lc-title">{lesson.title}</h3>
      <p className="lc-subtitle">{lesson.subtitle}</p>

      {/* Text preview */}
      <p className="lc-preview">"{lesson.text.slice(0, 36)}{lesson.text.length > 36 ? "…" : ""}"</p>

      {/* Stars */}
      <Stars count={stars} />

      {/* Stats row */}
      {isCompleted && (
        <div className="lc-stats">
          <span>⚡ {bestWpm} WPM</span>
          <span>🎯 {bestAcc}%</span>
        </div>
      )}

      {/* CTA */}
      <div className="lc-footer">
        {locked ? (
          <span className="lc-cta locked">Locked</span>
        ) : isCompleted ? (
          <span className="lc-cta retry">Retry →</span>
        ) : (
          <span className="lc-cta start">Start →</span>
        )}
      </div>
    </div>
  );
}
