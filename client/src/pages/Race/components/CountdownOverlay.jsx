import { useEffect, useState } from "react";
import { playSound } from "../../../utils/typingSound";

function CountdownOverlay({ count }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 20);
    if (count > 0) playSound("countdownBeep");
    if (count === 0) playSound("go");
    return () => clearTimeout(t);
  }, [count]);

  const isGo = count === 0;

  return (
    <div className={`countdown-overlay ${isGo ? "countdown-go" : ""}`}>
      <div className={`countdown-number ${animate ? "pop" : ""} ${isGo ? "go-text" : ""}`}>
        {isGo ? "GO!" : count}
      </div>
    </div>
  );
}

export default CountdownOverlay;
