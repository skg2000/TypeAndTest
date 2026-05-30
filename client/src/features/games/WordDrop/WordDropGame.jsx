import { useState, useEffect, useRef, useCallback } from "react";
import { getWordPool, randomWord, randomId } from "../shared/gameWords";
import "./WordDrop.css";

// Arena dimensions read from DOM at runtime
const CANVAS_W = 600; // fallback; overridden by arenaRef
const CANVAS_H = 480;
const MAX_HP    = 3;
const BASE_FALL = 0.55;   // px per frame at level 1
const POWERUPS  = ["freeze","nuke","slow"];

function makePowerup(x) {
  return { id: randomId(), x, y: -30, type: POWERUPS[Math.floor(Math.random() * POWERUPS.length)], active: true };
}

function makeWord(pool, level, w) {
  const x = 24 + Math.random() * (w - 120);
  return { id: randomId(), word: randomWord(pool), x, y: -30, speed: BASE_FALL + level * 0.18, active: true, hit: false };
}

export default function WordDropGame({ difficulty = "medium", onEnd }) {
  const [words,      setWords]      = useState([]);
  const [powerups,   setPowerups]   = useState([]);
  const [input,      setInput]      = useState("");
  const [score,      setScore]      = useState(0);
  const [combo,      setCombo]      = useState(0);
  const [maxCombo,   setMaxCombo]   = useState(0);
  const [hp,         setHp]         = useState(MAX_HP);
  const [level,      setLevel]      = useState(1);
  const [phase,      setPhase]      = useState("idle"); // idle|playing|paused|dead
  const [fx,         setFx]         = useState([]);     // flash effects
  const [freeze,     setFreeze]     = useState(false);
  const [slow,       setSlow]       = useState(false);
  const [bossWave,   setBossWave]   = useState(false);
  const [hits,       setHits]       = useState(0);
  const [misses,     setMisses]     = useState(0);

  const rafRef       = useRef(null);
  const lastTime     = useRef(0);
  const wordsRef     = useRef([]);
  const powerupsRef  = useRef([]);
  const scoreRef     = useRef(0);
  const comboRef     = useRef(0);
  const hpRef        = useRef(MAX_HP);
  const levelRef     = useRef(1);
  const phaseRef     = useRef("idle");
  const freezeRef    = useRef(false);
  const slowRef      = useRef(false);
  const spawnTimer   = useRef(0);
  const puSpawnTimer = useRef(0);
  const inputRef     = useRef(null);
  const arenaRef     = useRef(null);
  const pool         = useRef(getWordPool(difficulty));

  const getW = () => arenaRef.current?.clientWidth  || CANVAS_W;
  const getH = () => arenaRef.current?.clientHeight || CANVAS_H;

  // Sync refs
  const sync = () => {
    setWords([...wordsRef.current]);
    setPowerups([...powerupsRef.current]);
  };

  const addFx = (msg, color = "#facc15", x = CANVAS_W / 2, y = CANVAS_H / 2) => {
    const id = randomId();
    setFx(prev => [...prev, { id, msg, color, x, y }]);
    setTimeout(() => setFx(prev => prev.filter(f => f.id !== id)), 900);
  };

  const startGame = () => {
    wordsRef.current     = [];
    powerupsRef.current  = [];
    scoreRef.current     = 0;
    comboRef.current     = 0;
    hpRef.current        = MAX_HP;
    levelRef.current     = 1;
    phaseRef.current     = "playing";
    freezeRef.current    = false;
    slowRef.current      = false;
    spawnTimer.current   = 0;
    puSpawnTimer.current = 0;
    setScore(0); setCombo(0); setMaxCombo(0);
    setHp(MAX_HP); setLevel(1); setPhase("playing");
    setFreeze(false); setSlow(false); setBossWave(false);
    setHits(0); setMisses(0); setFx([]);
    sync();
    lastTime.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const loop = useCallback((now) => {
    if (phaseRef.current !== "playing") return;
    const dt = now - lastTime.current;
    lastTime.current = now;

    const speedMult = freezeRef.current ? 0 : slowRef.current ? 0.4 : 1;

    // ── Move words ──
    let missed = 0;
    wordsRef.current = wordsRef.current.map(w => {
      if (!w.active) return w;
      const ny = w.y + w.speed * speedMult * (dt / 16);
      if (ny > getH()) { missed++; return { ...w, active: false }; }
      return { ...w, y: ny };
    }).filter(w => w.active || w.hit);

    // ── Move powerups ──
    powerupsRef.current = powerupsRef.current.map(p => {
      if (!p.active) return p;
      const ny = p.y + 1.2 * (dt / 16);
      if (ny > CANVAS_H) return { ...p, active: false };
      return { ...p, y: ny };
    }).filter(p => p.active);

    // ── Handle misses ──
    if (missed > 0) {
      hpRef.current = Math.max(0, hpRef.current - missed);
      comboRef.current = 0;
      setHp(hpRef.current);
      setCombo(0);
      setMisses(m => m + missed);
      addFx(`-${missed} HP`, "#f87171", getW() / 2, getH() - 60);
      if (hpRef.current <= 0) { endGame(); return; }
    }

    // ── Spawn words ──
    spawnTimer.current += dt;
    const spawnInterval = Math.max(900, 2200 - levelRef.current * 120);
    while (spawnTimer.current > spawnInterval) {
      spawnTimer.current -= spawnInterval;
      const w = makeWord(pool.current, levelRef.current);
      wordsRef.current.push(w);
      // Boss wave: spawn 3 at once every 10 levels
      if (levelRef.current % 10 === 0) {
        wordsRef.current.push(makeWord(pool.current, levelRef.current, getW()));
        wordsRef.current.push(makeWord(pool.current, levelRef.current, getW()));
        setBossWave(true);
        setTimeout(() => setBossWave(false), 3000);
      }
    }

    // ── Spawn powerups (every 20s) ──
    puSpawnTimer.current += dt;
    if (puSpawnTimer.current > 20000) {
      puSpawnTimer.current = 0;
      const x = 30 + Math.random() * (getW() - 80);
      powerupsRef.current.push(makePowerup(x));
    }

    // ── Level up every 10 correct words ──
    const newLevel = Math.floor(scoreRef.current / 10) + 1;
    if (newLevel !== levelRef.current) {
      levelRef.current = newLevel;
      setLevel(newLevel);
      pool.current = newLevel >= 5 ? getWordPool("hard") : newLevel >= 3 ? getWordPool("medium") : getWordPool("easy");
      addFx(`Level ${newLevel}! 🚀`, "#a78bfa", getW() / 2, 80);
    }

    sync();
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const endGame = () => {
    phaseRef.current = "dead";
    setPhase("dead");
    cancelAnimationFrame(rafRef.current);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // ── Handle input ──
  const handleInput = (e) => {
    const val = e.target.value;
    setInput(val);

    // Check word match
    const match = wordsRef.current.find(w => w.active && w.word === val.trim());
    if (match) {
      wordsRef.current = wordsRef.current.map(w =>
        w.id === match.id ? { ...w, active: false, hit: true } : w
      );
      comboRef.current++;
      const comboBonus = Math.min(comboRef.current, 10);
      const pts = 10 * comboBonus;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setCombo(comboRef.current);
      setMaxCombo(m => Math.max(m, comboRef.current));
      setHits(h => h + 1);
      addFx(`+${pts}${comboRef.current > 2 ? ` 🔥×${comboRef.current}` : ""}`, "#22c55e", match.x + 30, match.y);
      setInput("");
      sync();
    }

    // Check powerup match
    const pu = powerupsRef.current.find(p => p.active && p.type === val.trim());
    if (pu) {
      powerupsRef.current = powerupsRef.current.map(p => p.id === pu.id ? { ...p, active: false } : p);
      applyPowerup(pu.type, pu.x, pu.y);
      setInput("");
      sync();
    }
  };

  const applyPowerup = (type, x, y) => {
    if (type === "freeze") {
      freezeRef.current = true; setFreeze(true);
      addFx("❄️ FREEZE!", "#38bdf8", x, y);
      setTimeout(() => { freezeRef.current = false; setFreeze(false); }, 4000);
    } else if (type === "slow") {
      slowRef.current = true; setSlow(true);
      addFx("🐢 SLOW!", "#a78bfa", x, y);
      setTimeout(() => { slowRef.current = false; setSlow(false); }, 5000);
    } else if (type === "nuke") {
      wordsRef.current = [];
      scoreRef.current += 50;
      setScore(scoreRef.current);
      addFx("💥 NUKE! +50", "#f97316", x, y);
    }
  };

  const accuracy = (hits + misses) > 0 ? Math.round((hits / (hits + misses)) * 100) : 100;

  return (
    <div className="wdg-wrap">
      {/* HUD */}
      <div className="wdg-hud">
        <div className="hud-block">
          <span className="hud-val" style={{ color: "#facc15" }}>{score}</span>
          <span className="hud-lbl">Score</span>
        </div>
        <div className="hud-block">
          {"❤️".repeat(hp)}{"🖤".repeat(MAX_HP - hp)}
        </div>
        <div className="hud-block">
          <span className="hud-val" style={{ color: "#a78bfa" }}>Lv {level}</span>
          <span className="hud-lbl">{bossWave ? "⚠️ BOSS WAVE!" : `Next: ${10 - (score % 100) / 10 | 0}`}</span>
        </div>
        <div className="hud-block">
          <span className="hud-val" style={{ color: combo > 2 ? "#f97316" : "#22c55e" }}>×{combo}</span>
          <span className="hud-lbl">Combo</span>
        </div>
        {freeze && <div className="hud-powerup freeze-hud">❄️ FROZEN</div>}
        {slow   && <div className="hud-powerup slow-hud">🐢 SLOW</div>}
      </div>

      {/* Game arena */}
      <div className="wdg-arena" ref={arenaRef}>
        {/* Falling words */}
        {words.map(w => w.active && (
          <div key={w.id} className={`wdg-word ${input && w.word.startsWith(input) ? "wdg-word-match" : ""}`}
            style={{ left: w.x, top: w.y }}>
            <span style={{ color: "#facc15" }}>{w.word.slice(0, input.length)}</span>
            <span>{w.word.slice(input.length)}</span>
          </div>
        ))}

        {/* Powerup drops */}
        {powerups.map(p => p.active && (
          <div key={p.id} className={`wdg-powerup wdg-pu-${p.type}`} style={{ left: p.x, top: p.y }}>
            {p.type === "freeze" ? "❄️" : p.type === "slow" ? "🐢" : "💥"}
            <span>{p.type}</span>
          </div>
        ))}

        {/* Danger line */}
        <div className="wdg-danger-line" />

        {/* Flash FX */}
        {fx.map(f => (
          <div key={f.id} className="wdg-fx" style={{ left: f.x, top: f.y, color: f.color }}>
            {f.msg}
          </div>
        ))}

        {/* Overlays */}
        {phase === "idle" && (
          <div className="wdg-overlay">
            <div className="wdo-title">💀 Word Drop</div>
            <p className="wdo-sub">Type falling words before they hit the bottom.<br/>Collect powerups by typing their name!</p>
            <button className="wdo-btn" onClick={startGame}>▶ Start Game</button>
          </div>
        )}

        {phase === "dead" && (
          <div className="wdg-overlay">
            <div className="wdo-title">Game Over</div>
            <div className="wdo-stats">
              <div><span className="wds-val" style={{color:"#facc15"}}>{score}</span><span className="wds-lbl">Score</span></div>
              <div><span className="wds-val" style={{color:"#22c55e"}}>{hits}</span><span className="wds-lbl">Words</span></div>
              <div><span className="wds-val" style={{color:"#a78bfa"}}>×{maxCombo}</span><span className="wds-lbl">Best Combo</span></div>
              <div><span className="wds-val" style={{color:"#38bdf8"}}>{accuracy}%</span><span className="wds-lbl">Accuracy</span></div>
            </div>
            <div className="wdo-actions">
              <button className="wdo-btn" onClick={startGame}>🔄 Play Again</button>
              {onEnd && <button className="wdo-btn wdo-btn-sec" onClick={() => onEnd({ score, hits, accuracy, maxCombo, level })}>← Back</button>}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      {phase === "playing" && (
        <input
          ref={inputRef}
          className="wdg-input"
          value={input}
          onChange={handleInput}
          placeholder="Type the falling words…"
          autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
          autoFocus
        />
      )}
    </div>
  );
}
