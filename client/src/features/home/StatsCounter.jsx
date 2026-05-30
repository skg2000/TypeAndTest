import { useEffect, useRef, useState } from "react";
import "./StatsCounter.css";

function useCountUp(target, duration = 1800, started = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  return val;
}

const STATS = [
  { label: "Active Typists",    target: 12400, suffix: "+" },
  { label: "Races Completed",   target: 84000, suffix: "+" },
  { label: "Tests Taken",       target: 210000, suffix: "+" },
  { label: "Avg Rating",        target: 4.9,   suffix: " ★", decimals: 1 },
];

function StatItem({ label, target, suffix, decimals, started }) {
  const val = useCountUp(decimals ? target * 10 : target, 1800, started);
  const display = decimals
    ? (val / 10).toFixed(decimals)
    : val >= 1000
    ? (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + "k"
    : val;
  return (
    <div className="sc-item">
      <span className="sc-num">{display}{suffix}</span>
      <span className="sc-label">{label}</span>
    </div>
  );
}

function StatsCounter() {
  const ref     = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="stats-counter-section" ref={ref}>
      <div className="sc-inner">
        {STATS.map((s) => (
          <StatItem key={s.label} {...s} started={started} />
        ))}
      </div>
    </section>
  );
}

export default StatsCounter;
