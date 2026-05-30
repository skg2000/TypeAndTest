import { useState, useRef, useEffect } from "react";
import "./CodeTyping.css";

const CHALLENGES = [
  { lang:"JavaScript", icon:"🟨", code:`const greet = (name) => {\n  return \`Hello, \${name}!\`;\n};` },
  { lang:"Python",     icon:"🐍", code:`def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)` },
  { lang:"TypeScript", icon:"🟦", code:`interface User {\n  id: number;\n  name: string;\n  email: string;\n}` },
  { lang:"React JSX",  icon:"⚛️",  code:`function Button({ onClick, children }) {\n  return (\n    <button onClick={onClick}>\n      {children}\n    </button>\n  );\n}` },
  { lang:"Node.js",    icon:"🟩", code:`const express = require('express');\nconst app = express();\napp.get('/', (req, res) => {\n  res.send('Hello World!');\n});\napp.listen(3000);` },
  { lang:"SQL",        icon:"🗄️",  code:`SELECT users.name, COUNT(orders.id)\nFROM users\nLEFT JOIN orders ON users.id = orders.user_id\nGROUP BY users.name\nHAVING COUNT(orders.id) > 0;` },
  { lang:"CSS",        icon:"🎨", code:`.container {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1rem;\n  padding: 0 24px;\n}` },
  { lang:"Bash",       icon:"💻", code:`#!/bin/bash\nfor file in *.txt; do\n  echo "Processing $file"\n  wc -l "$file"\ndone` },
];

export default function CodeTyping({ onEnd }) {
  const [phase,     setPhase]     = useState("idle");
  const [idx,       setIdx]       = useState(0);
  const [input,     setInput]     = useState("");
  const [started,   setStarted]   = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [wpm,       setWpm]       = useState(0);
  const [accuracy,  setAccuracy]  = useState(100);
  const [errors,    setErrors]    = useState(0);
  const [scores,    setScores]    = useState([]);
  const [elapsed,   setElapsed]   = useState(0);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const challenge = CHALLENGES[idx];
  const text = challenge.code;

  useEffect(() => {
    if (started) {
      timerRef.current = setInterval(() => setElapsed(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started]);

  const startRound = (i = 0) => {
    setIdx(i); setInput(""); setStarted(false);
    setStartTime(null); setWpm(0); setAccuracy(100);
    setErrors(0); setElapsed(0); setPhase("typing");
    clearInterval(timerRef.current);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length > text.length) return;

    if (!started && val.length === 1) {
      setStarted(true);
      setStartTime(Date.now());
    }

    setInput(val);

    let errs = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== text[i]) errs++;
    }
    setErrors(errs);
    const acc = val.length > 0 ? Math.round(((val.length - errs) / val.length) * 100) : 100;
    setAccuracy(acc);

    if (startTime) {
      const elapsed = (Date.now() - startTime) / 60000;
      const correct = val.length - errs;
      setWpm(elapsed > 0 ? Math.max(0, Math.round(correct / 5 / elapsed)) : 0);
    }

    if (val.length >= text.length) {
      clearInterval(timerRef.current);
      const finalWpm = startTime ? Math.round((val.length - errs) / 5 / ((Date.now() - startTime) / 60000)) : 0;
      const finalAcc = val.length > 0 ? Math.round(((val.length - errs) / val.length) * 100) : 100;
      setScores(prev => [...prev, { lang: challenge.lang, wpm: finalWpm, accuracy: finalAcc, errors: errs, time: elapsed }]);
      setPhase("result");
    }
  };

  const renderCode = () => {
    return text.split("").map((ch, i) => {
      let cls = "ct-char-pending";
      if (i < input.length) cls = input[i] === ch ? "ct-char-correct" : "ct-char-incorrect";
      else if (i === input.length) cls = "ct-char-cursor";
      if (ch === "\n") return <span key={i} className={cls}>{ch === "\n" && i >= input.length ? "↵\n" : "\n"}</span>;
      return <span key={i} className={cls}>{ch}</span>;
    });
  };

  return (
    <div className="ct-wrap">
      {phase === "idle" && (
        <div className="ct-idle">
          <div className="ct-title">💻 Code Typing Challenge</div>
          <p className="ct-sub">Type real code snippets across 8 languages. Scored on speed AND syntax accuracy.</p>
          <div className="ct-lang-grid">
            {CHALLENGES.map((c,i) => (
              <button key={i} className="ct-lang-btn" onClick={() => startRound(i)}>
                {c.icon} {c.lang}
              </button>
            ))}
          </div>
          <button className="ct-btn" onClick={() => startRound(0)}>▶ Start with JavaScript</button>
        </div>
      )}

      {phase === "typing" && (
        <div className="ct-game">
          <div className="ct-header">
            <span className="ct-lang-badge">{challenge.icon} {challenge.lang}</span>
            <div className="ct-live-stats">
              <span style={{color:"#facc15"}}>⚡ {wpm} WPM</span>
              <span style={{color:"#22c55e"}}>🎯 {accuracy}%</span>
              <span style={{color:"#f87171"}}>❌ {errors}</span>
              <span style={{color:"#38bdf8"}}>⏱ {elapsed}s</span>
            </div>
          </div>

          <div className="ct-progress-bar">
            <div className="ct-progress-fill" style={{width:`${(input.length/text.length)*100}%`}} />
          </div>

          <div className="ct-code-display" onClick={() => inputRef.current?.focus()}>
            <pre className="ct-pre">{renderCode()}</pre>
          </div>

          <textarea
            ref={inputRef}
            className="ct-textarea"
            value={input}
            onChange={handleChange}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="Start typing the code above…"
          />
        </div>
      )}

      {phase === "result" && (
        <div className="ct-idle">
          <div className="ct-title" style={{color:"#22c55e"}}>✅ {challenge.lang} Complete!</div>
          <div className="ct-result-stats">
            <div><b style={{color:"#facc15"}}>{wpm}</b><span>WPM</span></div>
            <div><b style={{color:"#22c55e"}}>{accuracy}%</b><span>Accuracy</span></div>
            <div><b style={{color:"#f87171"}}>{errors}</b><span>Errors</span></div>
            <div><b style={{color:"#38bdf8"}}>{elapsed}s</b><span>Time</span></div>
          </div>

          {scores.length > 1 && (
            <div className="ct-score-list">
              {scores.map((s,i) => (
                <div key={i} className="ct-score-row">
                  <span>{CHALLENGES.find(c=>c.lang===s.lang)?.icon} {s.lang}</span>
                  <span style={{color:"#facc15"}}>{s.wpm} WPM</span>
                  <span style={{color:"#22c55e"}}>{s.accuracy}%</span>
                </div>
              ))}
            </div>
          )}

          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
            {idx + 1 < CHALLENGES.length && (
              <button className="ct-btn" onClick={() => startRound(idx+1)}>
                Next: {CHALLENGES[idx+1].icon} {CHALLENGES[idx+1].lang} →
              </button>
            )}
            <button className="ct-btn ct-sec" onClick={() => setPhase("idle")}>Choose Language</button>
            {onEnd && <button className="ct-btn ct-sec" onClick={()=>onEnd({scores})}>← Back</button>}
          </div>
        </div>
      )}
    </div>
  );
}
