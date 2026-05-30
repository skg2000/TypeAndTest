import { useNavigate } from "react-router-dom";
import "./CtaBanner.css";

function CtaBanner() {
  const navigate = useNavigate();
  return (
    <section className="cta-section">
      <div className="cta-inner">
        <span className="cta-tag">🚀 Free forever. No credit card needed.</span>
        <h2 className="cta-title">Ready to Type Faster?</h2>
        <p className="cta-sub">
          Join 12,000+ typists who are already improving. Create your free account and start your first race in under 60 seconds.
        </p>
        <div className="cta-buttons">
          <button className="cta-primary" onClick={() => navigate("/register")}>
            Create Free Account →
          </button>
          <button className="cta-secondary" onClick={() => navigate("/typing-test")}>
            Try Without Signing Up
          </button>
        </div>
      </div>
    </section>
  );
}

export default CtaBanner;
