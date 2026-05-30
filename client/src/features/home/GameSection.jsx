import { useState, lazy, Suspense } from "react";
import "./GameSection.css";

const WordDropGame  = lazy(() => import("../games/WordDrop/WordDropGame"));
const ZombieGame    = lazy(() => import("../games/ZombieTyper/ZombieGame"));
const SpaceGame     = lazy(() => import("../games/SpaceShooter/SpaceGame"));

const GAMES = [
  {
    id: "worddrop",
    icon: "💀",
    title: "Word Drop",
    tagline: "TypeRacer × Tetris",
    desc: "Type falling words before they hit the bottom. Combos, powerups, and boss waves.",
    color: "#facc15",
    difficulty: "Easy to hard",
    Component: WordDropGame,
  },
  {
    id: "zombie",
    icon: "🧟",
    title: "Zombie Typer",
    tagline: "The Typing of the Dead",
    desc: "Shoot zombies by typing their name. Waves get harder. Don't let them reach your base.",
    color: "#f87171",
    difficulty: "Medium",
    Component: ZombieGame,
  },
  {
    id: "space",
    icon: "👾",
    title: "Space Shooter",
    tagline: "ZType-style",
    desc: "Destroy alien ships by typing their word. Your ship auto-aims at the target.",
    color: "#38bdf8",
    difficulty: "Medium to hard",
    Component: SpaceGame,
  },
];

function GameCard({ game, onPlay }) {
  return (
    <div className="gs-card" style={{ "--gc": game.color }} onClick={() => onPlay(game.id)}>
      <div className="gs-card-icon">{game.icon}</div>
      <div className="gs-card-body">
        <div className="gs-card-tag">{game.tagline}</div>
        <h3 className="gs-card-title">{game.title}</h3>
        <p className="gs-card-desc">{game.desc}</p>
        <div className="gs-card-footer">
          <span className="gs-diff">⚡ {game.difficulty}</span>
          <span className="gs-play-btn">Play →</span>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80, color: "#64748b", fontSize: "1rem" }}>
      Loading game…
    </div>
  );
}

export default function GameSection() {
  const [activeGame, setActiveGame] = useState(null);
  const [lastScore, setLastScore]   = useState(null);

  const activeGDef = GAMES.find(g => g.id === activeGame);
  const ActiveComp = activeGDef?.Component;

  const handleEnd = (result) => {
    setLastScore({ ...result, game: activeGDef?.title });
    setActiveGame(null);
  };

  return (
    <section className="games-section">
      {/* Header */}
      <div className="gs-header">
        <span className="gs-eyebrow">🎮 Mini Games</span>
        <h2 className="gs-title">Typing Games Arena</h2>
        <p className="gs-sub">
          Level up while having fun — three fully playable typing games, right here on the page.
        </p>
      </div>

      {/* Last score badge */}
      {lastScore && !activeGame && (
        <div className="gs-last-score">
          🏆 Last game: <strong>{lastScore.game}</strong> — Score <strong style={{ color: "#facc15" }}>{lastScore.score}</strong>
          <button onClick={() => setLastScore(null)}>✕</button>
        </div>
      )}

      {/* Active game */}
      {activeGame && ActiveComp ? (
        <div className="gs-active-game">
          <div className="gs-active-header">
            <span className="gs-active-title">{activeGDef.icon} {activeGDef.title}</span>
            <button className="gs-back-btn" onClick={() => setActiveGame(null)}>✕ Exit</button>
          </div>
          <Suspense fallback={<LoadingSpinner />}>
            <ActiveComp onEnd={handleEnd} />
          </Suspense>
        </div>
      ) : (
        <div className="gs-grid">
          {GAMES.map(g => <GameCard key={g.id} game={g} onPlay={setActiveGame} />)}
        </div>
      )}

      {/* Footer hint */}
      {!activeGame && (
        <p className="gs-footer-hint">
          More games coming soon: Typing Dungeon RPG, Multiplayer Battle Arena, Code Challenge
        </p>
      )}
    </section>
  );
}
