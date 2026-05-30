import { useState, useEffect, useRef, useCallback } from "react";
import "./EndlessSurvival.css";

const WORD_POOLS = {
  1: ["cat","dog","run","top","red","cup","hat","map","web","fox","box","pen"],
  2: ["apple","beach","clock","dance","eagle","flame","grape","river","storm","tiger"],
  3: ["absolute","boundary","calendar","platform","quantity","republic","shoulder"],
  4: ["accomplish","background","calculator","environment","frequently","government"],
  5: ["implementation","authentication","configuration","visualization","synchronization"],
};
const PUNCT = ["hello,","world!","ready?","go!","type:","fast;","done.","yes!","no?"];
const SYMBOLS = ["@user","#tag","$100","&more","*bold*","[list]","{code}","<tag/>"];

function getPool(wave) {
  if (wave >= 9) return [...WORD_POOLS[5], ...SYMBOLS];
  if (wave >= 7) return [...WORD_POOLS[4], ...PUNCT];
  if (wave >= 5) return [...WORD_POOLS[3], ...PUNCT];
  if (wave >= 3) return WORD_POOLS[2];
  return WORD_POOLS[1];
}
function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function uid() { return Math.random().toString(36).slice(2, 8); }

const BASE_SPEED = 0.4;
const ARENA_H = 500;

export default function EndlessSurvival({ onEnd }) {
  const [words,    setWords]    = useState([]);
  const [input,    setInput]    = useState("");
  const [score,    setScore]    = useState(0);
  const [wave,     setWave]     = useState(1);
  const [lives,    setLives]    = useState(5);
  const [combo,    setCombo]    = useState(0);
  const [time,     setTime]     = useState(0);
  const [phase,    setPhase]    = useState("idle");
  const [fx,       setFx]       = useState([]);
  const [best,     setBest]     = useState(() => +localStorage.getItem("survival_best") || 0);

  const wordsRef  = useRef([]);
  const scoreRef  = useRef(0);
  const waveRef   = useRef(1);
  const livesRef  = useRef(5);
  const comboRef  = useRef(0);
  const timeRef   = useRef(0);
  const phaseRef  = useRef("idle");
  const rafRef    = useRef(null);
  const timerRef  = useRef(null);
  const spawnRef  = useRef(0);
  const lastRef   = useRef(0);
  const arenaRef  = useRef(null);
  const inputRef  = useRef(null);

  const getW = () => arenaRef.current?.clientWidth || 700;
  const getH = () => arenaRef.current?.clientHeight || ARENA_H;

  const addFx = (msg, color, x, y) => {
    const id = uid();
    setFx(p => [...p, { id, msg, color, x, y }]);
    setTimeout(() => setFx(p => p.filter(f => f.id !== id)), 800);
  };

  const sync = () => setWords([...wordsRef.current]);

  const start = () => {
    wordsRef.current = [];
    scoreRef.current = 0; waveRef.current = 1; livesRef.current = 5;
    comboRef.current = 0; timeRef.current = 0; spawnRef.current = 0;
    phaseRef.current = "playing";
    setScore(0); setWave(1); setLives(5); setCombo(0); setTime(0);
    setPhase("playing"); setFx([]); setInput("");
    sync();
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    timerRef.current = setInterval(() => {
      timeRef.current++;
      setTime(t => t + 1);
      // Wave every 30 seconds
      if (timeRef.current % 30 === 0) {
        waveRef.current++;
        setWave(waveRef.current);
        addFx(`🌊 Wave ${waveRef.current}!`, "#a78bfa", getW() / 2, 60);
      }
    }, 1000);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const loop = useCallback((now) => {
    if (phaseRef.current !== "playing") return;
    const dt = now - lastRef.current;
    lastRef.current = now;

    const speed = BASE_SPEED + waveRef.current * 0.08;

    let missed = 0;
    wordsRef.current = wordsRef.current.map(w => {
      if (!w.active) return w;
      const ny = w.y + speed * (dt / 16);
      if (ny > getH()) { missed++; return { ...w, active: false }; }
      return { ...w, y: ny };
    }).filter(w => w.active);

    if (missed) {
      livesRef.current = Math.max(0, livesRef.current - missed);
      comboRef.current = 0;
      setLives(livesRef.current);
      setCombo(0);
      addFx(`-${missed} ❤️`, "#f87171", getW() / 2, getH() - 40);
      if (livesRef.current <= 0) { endGame(); return; }
    }

    spawnRef.current += dt;
    const interval = Math.max(600, 2000 - waveRef.current * 120);
    if (spawnRef.current > interval) {
      spawnRef.current = 0;
      const pool = getPool(waveRef.current);
      wordsRef.current.push({
        id: uid(), word: rnd(pool),
        x: 16 + Math.random() * (getW() - 140),
        y: -30, active: true
      });
    }

    sync();
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const endGame = () => {
    phaseRef.current = "dead";
    setPhase("dead");
    cancelAnimationFrame(rafRef.current);
    clearInterval(timerRef.current);
    const s = scoreRef.current;
    if (s > best) {
      setBest(s);
      localStorage.setItem("survival_best", s);
    }
  };

  useEffect(() => () => { cancelAnimationFrame(rafRef.current); clearInterval(timerRef.current); }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setInput(val);
    const match = wordsRef.current.find(w => w.active && w.word === val.trim());
    if (match) {
      wordsRef.current = wordsRef.current.filter(w => w.id !== match.id);
      comboRef.current++;
      const pts = 10 + comboRef.current * 2 + waveRef.current * 3;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setCombo(comboRef.current);
      addFx(`+${pts}${comboRef.current > 3 ? ` 🔥×${comboRef.current}` : ""}`, "#22c55e", match.x, match.y);
      setInput("");
      sync();
    }
  };

  const fmt = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  return (
    <div className="es-wrap">
      <div className="es-hud">
        <div className="es-hud-stat"><span style={{color:"#facc15"}}>{score}</span><span>Score</span></div>
        <div className="es-hud-stat"><span style={{color:"#f97316"}}>{"❤️".repeat(livesRef.current)}{"🖤".repeat(Math.max(0,5-livesRef.current))}</span><span>Lives</span></div>
        <div className="es-hud-stat"><span style={{color:"#a78bfa"}}>Wave {wave}</span><span>Current</span></div>
        <div className="es-hud-stat"><span style={{color:"#38bdf8"}}>{fmt(time)}</span><span>Time</span></div>
        <div className="es-hud-stat"><span style={{color:combo>3?"#f97316":"#22c55e"}}>×{combo}</span><span>Combo</span></div>
        <div className="es-hud-stat"><span style={{color:"#64748b"}}>{best}</span><span>Best</span></div>
      </div>

      <div className="es-arena" ref={arenaRef}>
        {words.map(w => (
          <div key={w.id} className={`es-word ${input && w.word.startsWith(input) ? "es-match" : ""}`} style={{left:w.x,top:w.y}}>
            <span style={{color:"#facc15"}}>{w.word.slice(0,input.length)}</span>
            <span>{w.word.slice(input.length)}</span>
          </div>
        ))}
        <div className="es-ground" />
        {fx.map(f => <div key={f.id} className="es-fx" style={{left:f.x,top:f.y,color:f.color}}>{f.msg}</div>)}

        {phase==="idle" && (
          <div className="es-overlay">
            <div className="es-ov-title">♾️ Endless Survival</div>
            <p className="es-ov-sub">Survive as long as possible. Words get faster, longer, then add punctuation and symbols.</p>
            {best > 0 && <div className="es-ov-best">🏆 Best Score: <strong>{best}</strong></div>}
            <button className="es-ov-btn" onClick={start}>▶ Survive!</button>
          </div>
        )}
        {phase==="dead" && (
          <div className="es-overlay">
            <div className="es-ov-title">💀 Survived {fmt(time)}</div>
            <div className="es-ov-stats">
              <div><b style={{color:"#facc15"}}>{score}</b><span>Score</span></div>
              <div><b style={{color:"#a78bfa"}}>Wave {wave}</b><span>Reached</span></div>
              <div><b style={{color:"#38bdf8"}}>{fmt(time)}</b><span>Time</span></div>
            </div>
            {score >= best && score > 0 && <div className="es-new-best">🎉 New Best Score!</div>}
            <div style={{display:"flex",gap:10}}>
              <button className="es-ov-btn" onClick={start}>🔄 Again</button>
              {onEnd && <button className="es-ov-btn es-sec" onClick={()=>onEnd({score,wave,time})}>← Back</button>}
            </div>
          </div>
        )}
      </div>

      {phase==="playing" && (
        <input ref={inputRef} className="es-input" value={input} onChange={handleInput}
          placeholder="Type to survive…" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} autoFocus />
      )}
    </div>
  );
}
