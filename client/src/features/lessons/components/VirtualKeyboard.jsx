import { FINGER_MAP } from "../data/lessonsData";
import "../styles/lessons.css";

const ROWS = [
  ["1","2","3","4","5","6","7","8","9","0","-","="],
  ["q","w","e","r","t","y","u","i","o","p","[","]"],
  ["a","s","d","f","g","h","j","k","l",";","'"],
  ["z","x","c","v","b","n","m",",",".","/"],
  [" "],
];

const FINGER_COLORS = {
  pinky:  "#f87171",  // red
  ring:   "#fb923c",  // orange
  middle: "#facc15",  // yellow
  index:  "#4ade80",  // green
  thumb:  "#60a5fa",  // blue
};

export default function VirtualKeyboard({ currentChar, lastCorrect, lastWrong }) {
  const currentLower = currentChar?.toLowerCase();
  const info = currentLower ? FINGER_MAP[currentLower] : null;

  return (
    <div className="vk-wrap">
      {/* Finger hint */}
      {info && (
        <div className="vk-hint" style={{ color: FINGER_COLORS[info.finger] }}>
          Press <kbd>{currentChar === " " ? "Space" : currentChar?.toUpperCase()}</kbd> with your <strong>{info.label}</strong>
        </div>
      )}

      <div className="vk-board">
        {ROWS.map((row, ri) => (
          <div key={ri} className={`vk-row vk-row-${ri}`}>
            {row.map((key) => {
              const keyLower = key.toLowerCase();
              const fingerInfo = FINGER_MAP[keyLower];
              const isTarget  = keyLower === currentLower;
              const isCorrect = keyLower === lastCorrect?.toLowerCase();
              const isWrong   = keyLower === lastWrong?.toLowerCase();

              let className = "vk-key";
              if (key === " ") className += " vk-space";
              if (isTarget)    className += " vk-target";
              if (isCorrect)   className += " vk-correct";
              if (isWrong)     className += " vk-wrong";

              const style = fingerInfo && !isTarget && !isCorrect && !isWrong
                ? { "--fk-color": FINGER_COLORS[fingerInfo.finger] }
                : {};

              return (
                <div key={key} className={className} style={style}>
                  {key === " " ? "SPACE" : key.toUpperCase()}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="vk-legend">
        {Object.entries(FINGER_COLORS).map(([f, c]) => (
          <span key={f} className="vk-legend-item">
            <span className="vk-legend-dot" style={{ background: c }} />
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
