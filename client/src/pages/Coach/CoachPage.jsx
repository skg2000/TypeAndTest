import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/api";
import "./CoachPage.css";

const WEAK_KEY_DRILLS = {
  q: "quack quart queen quite quick quota query quill",
  w: "write world watch water while where witch worth",
  e: "every event entry eight elite embed error exact",
  r: "right river reach range round ready rural rural",
  t: "there their tiger three thing track trail trend",
  y: "young years yield yours yeast yacht yearn youth",
  u: "under usual until urban ultra uncle upset urban",
  i: "inner image index input issue indie inner india",
  o: "often other order occur ocean offer olive outer",
  p: "point place power press print proud plain paste",
  a: "about again after ahead along angel apple avoid",
  s: "small space spell still stone study style sugar",
  d: "drive depot dance dense depth ditch draft drain",
  f: "first floor floor flame flash flesh float flood",
  g: "great group green guide guest guile grain grasp",
  h: "happy heavy heard heart heavy hedge hello hence",
  j: "judge jumpy jelly joint jewel jimmy jolly joust",
  k: "knife knock kneel known kings keeps knife knack",
  l: "light large later local level light loose lodge",
  z: "zebra zones zilch zonal zombi zonal zones zeros",
  x: "extra exact exert exile exist excel expel exact",
  c: "could count claim clear close coast crack craft",
  v: "value voice valid video vivid villa vital viral",
  b: "build below bread bring brave brush brisk blind",
  n: "never night north nurse noble niece novel nudge",
  m: "might month music major match marks modal miles",
};

const MODES = [
  { id: "speed", icon: "⚡", label: "Speed Boost", desc: "Short bursts to push WPM ceiling" },
  { id: "accuracy", icon: "🎯", label: "Accuracy Drill", desc: "Slow down, zero errors" },
  { id: "weak", icon: "🔑", label: "Weak Keys", desc: "Targeted drill on your worst keys" },
  { id: "numbers", icon: "🔢", label: "Numbers", desc: "Digits and special chars" },
  { id: "code", icon: "💻", label: "Code Mode", desc: "Programming syntax practice" },
  { id: "zen", icon: "🧘", label: "Zen Mode", desc: "No timer, no pressure" },
];

const CODE_TEXTS = [
  "const arr = [1, 2, 3].map(x => x * 2)",
  "function add(a, b) { return a + b; }",
  "if (score > 90) { grade = 'A'; } else { grade = 'B'; }",
  "for (let i = 0; i < 10; i++) { console.log(i); }",
  "async function getData() { const res = await fetch(url); return res.json(); }",
];

const NUMBER_TEXTS = [
  "1234 5678 9012 3456 7890 1234 5678 9012 3456 7890",
  "3.14 2.71 1.41 1.73 0.99 1.00 42.0 0.01 99.9 3.33",
  "2024 1999 2000 1776 1984 2048 1337 9999 1000 0001",
];

export default function CoachPage() {
  const { user } = useContext(AuthContext);
  const [mode, setMode] = useState("speed");
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [weakKeys, setWeakKeys] = useState([]);
  const [selectedWeak, setSelectedWeak] = useState("s");
  const [results, setResults] = useState([]);
  const [tip, setTip] = useState("");
  const inputRef = useState(null);

  // Load weak keys from recent results
  useEffect(() => {
    api.get("/results/me").then(({ data }) => {
      if (!data.length) return;
      const recent = data.slice(0, 20);
      const avgAcc = recent.reduce((s, r) => s + r.accuracy, 0) / recent.length;
      const avgWpm = recent.reduce((s, r) => s + r.wpm, 0) / recent.length;
      generateTip(avgWpm, avgAcc);
    }).catch(() => {});
  }, []);

  const generateTip = (avgWpm, avgAcc) => {
    if (avgAcc < 90) setTip("🎯 Your accuracy needs work. Try slowing down — accuracy beats speed.");
    else if (avgWpm < 40) setTip("⚡ You're building a foundation. Focus on rhythm, not rushing.");
    else if (avgWpm < 70) setTip("📈 Good progress! Practice common words and punctuation.");
    else if (avgWpm < 100) setTip("🔥 Strong typist! Work on capitalization and special characters.");
    else setTip("👑 Elite level. Focus on consistency and zero-error runs.");
  };

  const generateText = () => {
    if (mode === "code") return CODE_TEXTS[Math.floor(Math.random() * CODE_TEXTS.length)];
    if (mode === "numbers") return NUMBER_TEXTS[Math.floor(Math.random() * NUMBER_TEXTS.length)];
    if (mode === "weak") return WEAK_KEY_DRILLS[selectedWeak] || WEAK_KEY_DRILLS["s"];
    if (mode === "speed") {
      const words = ["the","be","to","of","and","in","that","have","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back"];
      return Array.from({ length: 30 }, () => words[Math.floor(Math.random() * words.length)]).join(" ");
    }
    if (mode === "accuracy") {
      const words = ["achieve","believe","receive","necessary","separate","occurrence","accommodate","embarrass","beginning","occasion","privilege","existence","immediately","occasionally","particularly","sufficient","temperature","approximately","significance","circumstances"];
      return Array.from({ length: 15 }, () => words[Math.floor(Math.random() * words.length)]).join(" ");
    }
    if (mode === "zen") {
      const quotes = ["The journey of a thousand miles begins with a single step","In the middle of difficulty lies opportunity","Success is not final failure is not fatal it is the courage to continue that counts","Do or do not there is no try","The only way to do great work is to love what you do"];
      return quotes[Math.floor(Math.random() * quotes.length)];
    }
    return "start typing to practice";
  };

  const startDrill = () => {
    const t = generateText();
    setText(t);
    setInput("");
    setStarted(false);
    setFinished(false);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setStartTime(null);
  };

  useEffect(() => { startDrill(); }, [mode, selectedWeak]);

  const handleChange = (e) => {
    const val = e.target.value;
    if (!started && val.length === 1) {
      setStarted(true);
      setStartTime(Date.now());
    }
    setInput(val);

    // Count errors
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
      setFinished(true);
      const result = { wpm, accuracy: acc, mode, date: new Date().toLocaleTimeString() };
      setResults(prev => [result, ...prev.slice(0, 9)]);
    }
  };

  // Render text with coloring
  const renderText = () => text.split("").map((ch, i) => {
    let cls = "char-pending";
    if (i < input.length) cls = input[i] === ch ? "char-correct" : "char-incorrect";
    else if (i === input.length) cls = "char-cursor";
    return <span key={i} className={cls}>{ch}</span>;
  });

  return (
    <div className="coach-page">
      <div className="coach-header">
        <h1>🔥 AI Typing Coach</h1>
        {tip && <div className="coach-tip">💡 {tip}</div>}
      </div>

      {/* Mode selector */}
      <div className="mode-grid">
        {MODES.map(m => (
          <button
            key={m.id}
            className={`mode-card ${mode === m.id ? "active" : ""}`}
            onClick={() => setMode(m.id)}
          >
            <span className="mode-icon">{m.icon}</span>
            <span className="mode-label">{m.label}</span>
            <span className="mode-desc">{m.desc}</span>
          </button>
        ))}
      </div>

      {/* Weak key selector */}
      {mode === "weak" && (
        <div className="weak-key-row">
          <span>Select key to drill:</span>
          {"qwertyuiopasdfghjklzxcvbnm".split("").map(k => (
            <button
              key={k}
              className={`key-btn ${selectedWeak === k ? "active" : ""}`}
              onClick={() => setSelectedWeak(k)}
            >
              {k}
            </button>
          ))}
        </div>
      )}

      {/* Practice area */}
      <div className="coach-box">
        {/* Live stats bar */}
        <div className="coach-stats">
          <div className="cs-stat"><span className="cs-val" style={{ color: "#facc15" }}>{wpm}</span><span className="cs-lbl">WPM</span></div>
          <div className="cs-stat"><span className="cs-val" style={{ color: "#22c55e" }}>{accuracy}%</span><span className="cs-lbl">Accuracy</span></div>
          <div className="cs-stat"><span className="cs-val" style={{ color: "#f87171" }}>{errors}</span><span className="cs-lbl">Errors</span></div>
          {mode !== "zen" && <div className="cs-stat mode-label-stat"><span className="cs-val">{mode.toUpperCase()}</span><span className="cs-lbl">Mode</span></div>}
        </div>

        {/* Text display */}
        <div className="coach-text">{renderText()}</div>

        {/* Input */}
        <textarea
          className={`coach-input ${finished ? "finished" : ""}`}
          value={input}
          onChange={handleChange}
          disabled={finished}
          placeholder={finished ? "✅ Done! Press 'New Drill' for another." : "Start typing…"}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />

        {/* Finish banner */}
        {finished && (
          <div className="finish-banner">
            <span>🏁 {wpm} WPM · {accuracy}% accuracy · {errors} errors</span>
            <button className="btn-next" onClick={startDrill}>Next Drill ↻</button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="coach-actions">
        <button className="btn-new" onClick={startDrill}>🔄 New Drill</button>
      </div>

      {/* Session history */}
      {results.length > 0 && (
        <div className="coach-history">
          <h3>Session Results</h3>
          <div className="history-grid">
            {results.map((r, i) => (
              <div key={i} className="h-card">
                <div className="h-wpm">{r.wpm} <span>WPM</span></div>
                <div className="h-acc">{r.accuracy}%</div>
                <div className="h-mode">{r.mode}</div>
              </div>
            ))}
          </div>
          {results.length >= 3 && (
            <div className="session-insight">
              📊 Session avg: <strong>{Math.round(results.reduce((s, r) => s + r.wpm, 0) / results.length)} WPM</strong> · {Math.round(results.reduce((s, r) => s + r.accuracy, 0) / results.length)}% accuracy
            </div>
          )}
        </div>
      )}
    </div>
  );
}
