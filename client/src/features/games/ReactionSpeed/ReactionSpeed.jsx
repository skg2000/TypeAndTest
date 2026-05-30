import { useState, useEffect, useRef } from "react";
import "./ReactionSpeed.css";

const WORDS = ["fire","jump","now","type","fast","go","hit","run","flash","rush","quick","burst","rapid","swift","zoom","bolt","dash","slam","blaze","snap"];

function uid() { return Math.random().toString(36).slice(2,7); }

export default function ReactionSpeed({ onEnd }) {
  const [phase,      setPhase]      = useState("idle");
  const [word,       setWord]       = useState("");
  const [input,      setInput]      = useState("");
  const [showWord,   setShowWord]   = useState(false);
  const [round,      setRound]      = useState(0);
  const [results,    setResults]    = useState([]);
  const [flashTime,  setFlashTime]  = useState(null);
  const [streak,     setStreak]     = useState(0);
  const [best,       setBest]       = useState(() => +localStorage.getItem("reaction_best") || 9999);

  const startRef  = useRef(null);
  const timerRef  = useRef(null);
  const inputRef  = useRef(null);
  const ROUNDS = 10;

  const startGame = () => {
    setPhase("playing"); setRound(0); setResults([]);
    setStreak(0); setShowWord(false); setInput("");
    scheduleNext(0);
  };

  const scheduleNext = (r) => {
    const delay = 1200 + Math.random() * 2000;
    timerRef.current = setTimeout(() => {
      const w = WORDS[Math.floor(Math.random() * WORDS.length)];
      setWord(w); setShowWord(true); setInput("");
      startRef.current = Date.now();
      setFlashTime(null);
      // Auto-miss if not typed in 2.5s
      timerRef.current = setTimeout(() => {
        setShowWord(false);
        setResults(prev => {
          const next = [...prev, { word:w, ms:9999, hit:false }];
          if (r + 1 >= ROUNDS) finishGame(next);
          else scheduleNext(r + 1);
          return next;
        });
        setStreak(0);
        setRound(r + 1);
      }, 2500);
    }, delay);
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setInput(val);
    if (!showWord) return;
    if (val.trim() === word) {
      const ms = Date.now() - startRef.current;
      clearTimeout(timerRef.current);
      setShowWord(false);
      setFlashTime(ms);
      setStreak(s => s + 1);
      setBest(b => { const nb = Math.min(b, ms); localStorage.setItem("reaction_best", nb); return nb; });
      setResults(prev => {
        const next = [...prev, { word, ms, hit:true }];
        const r = prev.length;
        if (r + 1 >= ROUNDS) finishGame(next);
        else { setRound(r + 1); scheduleNext(r + 1); }
        return next;
      });
      setInput("");
    }
  };

  const finishGame = (res) => {
    setPhase("results");
    clearTimeout(timerRef.current);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const hits    = results.filter(r => r.hit);
  const avgMs   = hits.length ? Math.round(hits.reduce((s,r)=>s+r.ms,0)/hits.length) : 0;
  const accuracy = results.length ? Math.round((hits.length/results.length)*100) : 0;

  const msColor = (ms) => ms < 500 ? "#22c55e" : ms < 900 ? "#facc15" : ms < 1500 ? "#fb923c" : "#f87171";
  const msLabel = (ms) => ms < 500 ? "🔥 Blazing" : ms < 900 ? "⚡ Fast" : ms < 1500 ? "👍 OK" : ms === 9999 ? "❌ Miss" : "🐢 Slow";

  return (
    <div className="rs-wrap">
      {phase === "idle" && (
        <div className="rs-idle">
          <div className="rs-title">⚡ Reaction Speed</div>
          <p className="rs-sub">A word flashes on screen. Type it as fast as you can. {ROUNDS} rounds total.</p>
          {best < 9999 && <div className="rs-best-chip">🏆 Best: <strong>{best}ms</strong></div>}
          <button className="rs-btn" onClick={startGame}>▶ Start</button>
        </div>
      )}

      {phase === "playing" && (
        <div className="rs-game">
          <div className="rs-progress">
            <div className="rs-prog-fill" style={{width:`${(round/ROUNDS)*100}%`}} />
          </div>
          <div className="rs-round-lbl">Round {Math.min(round+1,ROUNDS)} / {ROUNDS}</div>

          <div className="rs-arena">
            {!showWord && !flashTime && (
              <div className="rs-wait">
                <div className="rs-wait-dots"><span/><span/><span/></div>
                <p>Get ready…</p>
              </div>
            )}
            {showWord && (
              <div className="rs-flash-word">
                <span style={{color:"#facc15"}}>{word.slice(0,input.length)}</span>
                <span>{word.slice(input.length)}</span>
              </div>
            )}
            {flashTime && !showWord && (
              <div className="rs-reaction-time" style={{color:msColor(flashTime)}}>
                {flashTime}ms — {msLabel(flashTime)}
              </div>
            )}
          </div>

          <input ref={inputRef} className="rs-input" value={input} onChange={handleInput}
            placeholder={showWord ? `Type "${word}"` : "Waiting for word…"}
            disabled={!showWord} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} autoFocus />

          <div className="rs-history">
            {results.slice(-5).map((r,i) => (
              <div key={i} className="rs-hist-chip" style={{color:msColor(r.ms)}}>
                {r.word} — {r.ms===9999?"Miss":`${r.ms}ms`}
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === "results" && (
        <div className="rs-idle">
          <div className="rs-title">Results</div>
          <div className="rs-result-grid">
            <div><b style={{color:"#facc15"}}>{avgMs}ms</b><span>Avg Reaction</span></div>
            <div><b style={{color:"#22c55e"}}>{accuracy}%</b><span>Hit Rate</span></div>
            <div><b style={{color:"#38bdf8"}}>{hits.length}/{ROUNDS}</b><span>Hits</span></div>
            <div><b style={{color:"#a78bfa"}}>{best}ms</b><span>Personal Best</span></div>
          </div>
          <div className="rs-detail">
            {results.map((r,i) => (
              <div key={i} className="rs-detail-row" style={{color:msColor(r.ms)}}>
                <span>#{i+1}</span><span>{r.word}</span><span>{r.ms===9999?"Miss":`${r.ms}ms`}</span><span>{msLabel(r.ms)}</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button className="rs-btn" onClick={startGame}>🔄 Play Again</button>
            {onEnd && <button className="rs-btn rs-sec" onClick={()=>onEnd({avgMs,accuracy,best})}>← Back</button>}
          </div>
        </div>
      )}
    </div>
  );
}
