import { useState, useRef, useEffect } from "react";
import "./StoryAdventure.css";

// ── Story tree ──────────────────────────────────────────────
const STORY = {
  id: "start",
  scene: "🏰",
  title: "The Typing Kingdom",
  text: "You are a young scribe who discovers a cursed spellbook. The only way to break curses is to TYPE the magic words perfectly.",
  choices: [
    {
      prompt: "explore",
      label: "Explore the castle",
      speed: false,
      next: "castle",
    },
    {
      prompt: "runaway",
      label: "Run away from the curse",
      speed: true,
      speedTarget: 25,
      next: "forest",
    },
  ],
};

const NODES = {
  start: STORY,

  castle: {
    id: "castle", scene: "🗡️", title: "The Dark Knight",
    text: "A Dark Knight blocks the hallway. He raises his sword. You must type a battle cry to challenge him!",
    choices: [
      { prompt: "charge",   label: "Charge at the knight", speed: false, next: "victory1" },
      { prompt: "negotiate",label: "Try to negotiate",     speed: false, next: "negotiate" },
    ],
  },

  forest: {
    id: "forest", scene: "🌲", title: "The Enchanted Forest",
    text: "You sprint into the dark forest. Glowing eyes watch from the shadows. A friendly fox appears and offers a deal.",
    choices: [
      { prompt: "follow fox",  label: "Follow the fox",       speed: false, next: "foxpath" },
      { prompt: "climb tree",  label: "Climb a tree to hide", speed: true, speedTarget: 30, next: "safe" },
    ],
  },

  victory1: {
    id: "victory1", scene: "⚔️", title: "Victory!",
    text: "Your battle cry echoes through the castle. The knight steps aside, impressed by your boldness. You find a golden key!",
    choices: [
      { prompt: "open vault", label: "Open the vault",         speed: false, next: "treasure" },
      { prompt: "keep going", label: "Continue deeper inside", speed: false, next: "dragon" },
    ],
  },

  negotiate: {
    id: "negotiate", scene: "🤝", title: "The Deal",
    text: "The knight agrees to let you pass — but only if you recite the ancient Code of Honor.",
    choices: [
      { prompt: "honor valor courage wisdom", label: "Recite the Code", speed: false, next: "victory1" },
    ],
  },

  foxpath: {
    id: "foxpath", scene: "🦊", title: "Fox's Shortcut",
    text: "The fox leads you to a secret village of forest wizards. They offer to teach you a powerful spell!",
    choices: [
      { prompt: "abracadabra", label: "Learn the spell",   speed: false, next: "wizard_win" },
      { prompt: "leave",       label: "Decline and leave", speed: false, next: "safe" },
    ],
  },

  safe: {
    id: "safe", scene: "🌅", title: "You Escaped!",
    text: "You make it to the edge of the kingdom, safe from the curse. The spellbook crumbles to dust.",
    choices: [
      { prompt: "restart", label: "Play Again", speed: false, next: "__restart__" },
    ],
  },

  dragon: {
    id: "dragon", scene: "🐉", title: "The Dragon!",
    text: "A massive dragon guards the inner sanctum. Its name is inscribed on the wall. Only calling its name will calm it.",
    choices: [
      { prompt: "ignitharax", label: "Call the dragon's name", speed: false, next: "dragon_win" },
      { prompt: "flee",       label: "Flee immediately",       speed: true, speedTarget: 35, next: "narrow_escape" },
    ],
  },

  treasure: {
    id: "treasure", scene: "💰", title: "The Vault",
    text: "The vault overflows with gold and ancient tomes. You've become the kingdom's greatest scribe!",
    choices: [
      { prompt: "restart", label: "🔄 Play Again", speed: false, next: "__restart__" },
    ],
  },

  wizard_win: {
    id: "wizard_win", scene: "🧙", title: "Master Wizard!",
    text: "The spell shatters the curse. The wizards crown you Keeper of Words. Your legend begins!",
    choices: [
      { prompt: "restart", label: "🔄 Play Again", speed: false, next: "__restart__" },
    ],
  },

  dragon_win: {
    id: "dragon_win", scene: "🏆", title: "Dragon Tamed!",
    text: "Ignitharax bows his head. You ride him over the kingdom — the greatest scribe who ever lived!",
    choices: [
      { prompt: "restart", label: "🔄 Play Again", speed: false, next: "__restart__" },
    ],
  },

  narrow_escape: {
    id: "narrow_escape", scene: "💨", title: "Narrow Escape",
    text: "You barely outrun the dragon's fire. Your cape is singed, but you're alive. A legend in the making.",
    choices: [
      { prompt: "restart", label: "🔄 Play Again", speed: false, next: "__restart__" },
    ],
  },
};

const ENDINGS = ["treasure","wizard_win","dragon_win","narrow_escape","safe"];

// ── Component ────────────────────────────────────────────────
export default function StoryAdventure({ onEnd }) {
  const [phase,       setPhase]       = useState("idle");
  const [nodeId,      setNodeId]      = useState("start");
  const [input,       setInput]       = useState("");
  const [activeChoice,setActiveChoice]= useState(null);
  const [speedActive, setSpeedActive] = useState(false);
  const [speedTimer,  setSpeedTimer]  = useState(0);
  const [speedFail,   setSpeedFail]   = useState(false);
  const [history,     setHistory]     = useState([]);
  const [wpm,         setWpm]         = useState(0);
  const [score,       setScore]       = useState(0);
  const [typeStart,   setTypeStart]   = useState(null);

  const timerRef  = useRef(null);
  const inputRef  = useRef(null);

  const node = NODES[nodeId];

  useEffect(() => {
    if (speedActive) {
      setSpeedTimer(3);
      const iv = setInterval(() => {
        setSpeedTimer(t => {
          if (t <= 1) {
            clearInterval(iv);
            setSpeedFail(true);
            setSpeedActive(false);
            // Failed speed challenge — reroute to safe ending
            setTimeout(() => navigate("safe"), 1000);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(iv);
    }
  }, [speedActive]);

  const navigate = (nextId) => {
    if (nextId === "__restart__") {
      startGame();
      return;
    }
    setHistory(h => [...h, nodeId]);
    setNodeId(nextId);
    setInput("");
    setActiveChoice(null);
    setSpeedActive(false);
    setSpeedFail(false);
    setTypeStart(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const startGame = () => {
    setPhase("playing");
    setNodeId("start");
    setInput("");
    setHistory([]);
    setScore(0);
    setWpm(0);
    setActiveChoice(null);
    setSpeedActive(false);
    setSpeedFail(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setInput(val);

    if (!typeStart && val.length === 1) setTypeStart(Date.now());

    // Match any choice prompt
    const matched = node.choices.find(c =>
      val.trim().toLowerCase() === c.prompt.toLowerCase()
    );

    if (matched) {
      const elapsed = typeStart ? (Date.now() - typeStart) / 60000 : 0;
      const chars = val.length;
      const w = elapsed > 0 ? Math.round(chars / 5 / elapsed) : 0;
      setWpm(w);
      setScore(s => s + 10 + Math.min(w, 50));

      if (matched.speed) {
        setActiveChoice(matched);
        setSpeedActive(true);
        setInput("");
      } else {
        navigate(matched.next);
      }
    }

    // Partial highlight
    const partial = node.choices.find(c =>
      c.prompt.toLowerCase().startsWith(val.trim().toLowerCase()) && val.length > 0
    );
    setActiveChoice(partial || null);
  };

  const isEnding = ENDINGS.includes(nodeId);

  return (
    <div className="sa-wrap">
      {phase === "idle" && (
        <div className="sa-idle">
          <div className="sa-idle-title">📖 Story Adventure</div>
          <p className="sa-idle-sub">
            Your choices shape the story — but you must TYPE them to make them happen.
            Speed challenges test your reaction. Multiple endings to discover!
          </p>
          <div className="sa-idle-tips">
            <span>⌨️ Type the choice word to select it</span>
            <span>⚡ Speed challenges require fast typing</span>
            <span>🔀 Multiple branching paths</span>
            <span>🏆 7 different endings</span>
          </div>
          <button className="sa-btn" onClick={startGame}>📖 Begin Story</button>
        </div>
      )}

      {phase === "playing" && node && (
        <div className="sa-game">
          {/* Breadcrumb */}
          <div className="sa-breadcrumb">
            {history.map((h, i) => (
              <span key={i} className="sa-crumb">
                {NODES[h]?.scene}
              </span>
            ))}
            <span className="sa-crumb sa-crumb-active">{node.scene}</span>
          </div>

          {/* Scene card */}
          <div className="sa-scene-card">
            <div className="sa-scene-emoji">{node.scene}</div>
            <h2 className="sa-scene-title">{node.title}</h2>
            <p className="sa-scene-text">{node.text}</p>
          </div>

          {/* Speed challenge banner */}
          {speedActive && (
            <div className="sa-speed-banner">
              ⚡ SPEED CHALLENGE! Type faster — {speedTimer}s remaining!
            </div>
          )}
          {speedFail && (
            <div className="sa-fail-banner">
              💨 Too slow! Taking the safe path…
            </div>
          )}

          {/* Choices */}
          <div className="sa-choices">
            {node.choices.map((c, i) => (
              <div
                key={i}
                className={`sa-choice ${activeChoice?.prompt === c.prompt ? "sa-choice-active" : ""} ${isEnding ? "sa-choice-ending" : ""}`}
              >
                <div className="sa-choice-label">
                  {c.speed && <span className="sa-speed-tag">⚡ Fast!</span>}
                  {c.label}
                </div>
                <div className="sa-choice-prompt">
                  <span className="sa-prompt-hint">type: </span>
                  <span className="sa-prompt-word">
                    <span style={{ color: "#facc15" }}>
                      {c.prompt.slice(0, input.length)}
                    </span>
                    <span>{c.prompt.slice(input.length)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="sa-input-row">
            <input
              ref={inputRef}
              className="sa-input"
              value={input}
              onChange={handleInput}
              placeholder="Type your choice…"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              autoFocus
            />
            <div className="sa-input-stats">
              <span style={{ color: "#facc15" }}>⚡ {wpm} WPM</span>
              <span style={{ color: "#a78bfa" }}>📍 {history.length + 1} scenes</span>
              <span style={{ color: "#22c55e" }}>★ {score}</span>
            </div>
          </div>

          {isEnding && onEnd && (
            <button className="sa-btn sa-sec" style={{ alignSelf: "center", marginTop: 8 }}
              onClick={() => onEnd({ score, scenes: history.length + 1, wpm })}>
              ← Back to Games
            </button>
          )}
        </div>
      )}
    </div>
  );
}
