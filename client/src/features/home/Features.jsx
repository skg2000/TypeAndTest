import { useNavigate } from "react-router-dom";
import "./Features.css";

const FEATURES = [
  {
    icon: "⚡",
    title: "Real-time Races",
    desc: "Compete head-to-head with typists worldwide. See live progress bars and climb the ELO ladder.",
    route: "/race",
    color: "#38bdf8",
  },
  {
    icon: "📚",
    title: "Typing Lessons",
    desc: "30 structured lessons across 8 phases — from home row basics to expert-level speed drills with a live virtual keyboard.",
    route: "/lessons",
    color: "#8b5cf6",
  },
  {
    icon: "🎮",
    title: "Typing Games",
    desc: "Word Drop, Zombie Typer, Space Shooter — three addictive typing games to sharpen your speed.",
    route: "/games",
    color: "#f59e0b",
  },
  {
    icon: "🤖",
    title: "AI Typing Coach",
    desc: "Get a personalised improvement plan and custom practice text targeting your weak keys.",
    route: "/coach",
    color: "#22c55e",
  },
  {
    icon: "🌍",
    title: "Global Leaderboard",
    desc: "See where you rank among thousands. Filter by rank tier — Bronze to Diamond.",
    route: "/leaderboard",
    color: "#ec4899",
  },
  {
    icon: "⌨️",
    title: "Multiple Modes",
    desc: "Easy, Medium, Hard, Quotes, and Code typing — each tuned to sharpen different skills.",
    route: "/typing-test",
    color: "#06b6d4",
  },
];

function Features() {
  const navigate = useNavigate();
  return (
    <section className="features-section">
      <div className="features-header">
        <span className="features-eyebrow">Everything you need</span>
        <h2 className="features-title">Built for Serious Typists</h2>
        <p className="features-sub">
          From structured lessons to competitive racing — TypeMaster has every tool to push your speed further.
        </p>
      </div>

      <div className="feature-grid">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="feature-card"
            onClick={() => navigate(f.route)}
            style={{ "--fc": f.color }}
          >
            <div className="feature-icon-wrap">
              <span className="feature-icon">{f.icon}</span>
            </div>
            <h3 className="feature-card-title">{f.title}</h3>
            <p className="feature-card-desc">{f.desc}</p>
            <span className="feature-cta">Explore →</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;
