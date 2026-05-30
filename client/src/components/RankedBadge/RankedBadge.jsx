import { getRank, getProgressToNextRank } from "../../utils/rankSystem";
import "./RankedBadge.css";

function RankedBadge({ rating = 1200, showProgress = false, size = "md" }) {
  const rank = getRank(rating);
  const progress = getProgressToNextRank(rating);

  return (
    <div className={`ranked-badge ranked-badge--${size}`} style={{ "--rank-color": rank.color, "--rank-bg": rank.bg }}>
      <span className="rank-icon">{rank.icon}</span>
      <div className="rank-info">
        <span className="rank-name">{rank.name}</span>
        <span className="rank-rating">{rating}</span>
      </div>
      {showProgress && (
        <div className="rank-progress-bar">
          <div className="rank-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

export default RankedBadge;
