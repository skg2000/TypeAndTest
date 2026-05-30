import { useState, useEffect, lazy, Suspense } from "react";
import "./GamesPage.css";

const WordDropGame    = lazy(() => import("../../features/games/WordDrop/WordDropGame"));
const EndlessSurvival = lazy(() => import("../../features/games/EndlessSurvival/EndlessSurvival"));
const ReactionSpeed   = lazy(() => import("../../features/games/ReactionSpeed/ReactionSpeed"));
const CodeTyping      = lazy(() => import("../../features/games/CodeTyping/CodeTyping"));
const StoryAdventure  = lazy(() => import("../../features/games/StoryAdventure/StoryAdventure"));

const GAMES = [
  { id:"worddrop",  icon:"💀", title:"Word Drop",        tagline:"TypeRacer × Tetris",       color:"#facc15", desc:"Words fall from the top. Type them before they hit the bottom.",                          tags:["Combo ×10","Powerups","Boss waves"],          Component:WordDropGame    },
  
  { id:"endless",   icon:"♾️", title:"Endless Survival", tagline:"How long can you last?",   color:"#22c55e", desc:"Infinite words, increasing speed. Survive waves of punctuation and symbols.",           tags:["Daily best","Wave scaling","Symbols"],        Component:EndlessSurvival },
 
 
  { id:"reaction",  icon:"⚡", title:"Reaction Speed",   tagline:"How fast are you?",        color:"#fbbf24", desc:"A word flashes. Type it instantly. Measures reaction time in milliseconds.",            tags:["10 rounds","ms precision","Personal best"],  Component:ReactionSpeed   },

  { id:"code",      icon:"💻", title:"Code Typing",      tagline:"For developers",           color:"#34d399", desc:"Type real code across 8 languages — JS, Python, TypeScript, SQL and more.",            tags:["8 languages","Syntax accuracy","WPM track"], Component:CodeTyping      },

  { id:"story",     icon:"📖", title:"Story Adventure",  tagline:"Your choices matter",      color:"#c084fc", desc:"A branching story where you must TYPE your choices. Speed challenges included.",        tags:["7 endings","Speed challenges","Branching"],  Component:StoryAdventure  },
];

function GameCard({ game, onPlay, bestScore }) {
  return (
    <div className="gp-card" style={{ "--gc": game.color }} onClick={() => onPlay(game.id)}>
      <div className="gp-card-top">
        <span className="gp-icon">{game.icon}</span>
        <div>
          <div className="gp-tag">{game.tagline}</div>
          <h3 className="gp-title">{game.title}</h3>
        </div>
      </div>
      <p className="gp-desc">{game.desc}</p>
      <div className="gp-tags">
        {game.tags.map(t => <span key={t} className="gp-feature-tag">{t}</span>)}
      </div>
      {bestScore !== undefined && (
        <div className="gp-best">🏆 Best: <strong>{bestScore}</strong> pts</div>
      )}
      <button className="gp-play-btn">▶ Play {game.title}</button>
    </div>
  );
}

/* ── Fullscreen game shell ── */
function GameShell({ game, onExit, onEnd }) {
  const Comp = game.Component;

  // Lock body scroll while game is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Escape key exits
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onExit(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onExit]);

  return (
    <div className="gp-fullscreen">
      {/* Top bar */}
      <div className="gp-fs-bar">
        <div className="gp-fs-title">
          <span className="gp-fs-icon">{game.icon}</span>
          {game.title}
        </div>
        <div className="gp-fs-controls">
          <span className="gp-fs-hint">Press Esc to exit</span>
          <button className="gp-fs-exit" onClick={onExit}>✕ Exit</button>
        </div>
      </div>

      {/* Game content */}
      <div className="gp-fs-content">
        <Suspense fallback={
          <div className="gp-fs-loading">
            <div className="gp-fs-spinner" />
            <span>Loading {game.title}…</span>
          </div>
        }>
          <Comp onEnd={onEnd} />
        </Suspense>
      </div>
    </div>
  );
}

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState(null);
  const [scores,     setScores]     = useState({});

  const activeDef = GAMES.find(g => g.id === activeGame);

  const handleEnd = (result) => {
    if (result?.score !== undefined) {
      setScores(prev => ({
        ...prev,
        [activeGame]: Math.max(result.score, prev[activeGame] ?? 0),
      }));
    }
    setActiveGame(null);
  };

  const handleExit = () => setActiveGame(null);

  return (
    <>
      {/* ── Fullscreen overlay when game active ── */}
      {activeGame && activeDef && (
        <GameShell
          game={activeDef}
          onExit={handleExit}
          onEnd={handleEnd}
        />
      )}

      {/* ── Game browser (always rendered, hidden behind overlay) ── */}
      <div className="gp-page">
        <div className="gp-header">
          <h1>🎮 Typing Games Arena</h1>
          <p className="gp-sub">9 fully playable typing games — from arcade action to RPG adventures.</p>
        </div>

        {Object.keys(scores).length > 0 && (
          <div className="gp-scores-row">
            {Object.entries(scores).map(([id, s]) => {
              const g = GAMES.find(x => x.id === id);
              return (
                <div key={id} className="gp-score-chip" style={{ "--gc": g?.color }}>
                  {g?.icon} {g?.title}: <strong>{s}</strong> pts
                </div>
              );
            })}
          </div>
        )}

        <div className="gp-grid">
          {GAMES.map(g => (
            <GameCard
              key={g.id}
              game={g}
              onPlay={setActiveGame}
              bestScore={scores[g.id]}
            />
          ))}
        </div>
      </div>
    </>
  );
}
