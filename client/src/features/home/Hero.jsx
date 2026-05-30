import React from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-container">

        {/* LEFT */}
        <div className="hero-content">
          <p className="hero-badge">⚡ Practice instantly — no signup required</p>

          <h1>
            Master Your <span>Typing Speed</span> & Accuracy
          </h1>

          <p className="hero-description">
            Train with typing tests, compete in real-time races, unlock achievements,
            and level up your keyboard skills in one platform.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/typing-test")}
            >
              Start Practicing
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/register")}
            >
              Create Free Account
            </button>
          </div>

          <div className="hero-pills">
            <span>⌨️ Typing Tests</span>
            <span>🏁 Multiplayer Races</span>
            <span>🏆 Achievements</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="hero-preview">
          <div className="preview-card">
            <div className="preview-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>

            <div className="preview-body">
              <p className="preview-text">
                the quick brown fox jumps over the lazy dog
              </p>

              <div className="preview-stats">
                <div>
                  <h3>82</h3>
                  <p>WPM</p>
                </div>
                <div>
                  <h3>97%</h3>
                  <p>Accuracy</p>
                </div>
                <div>
                  <h3>30s</h3>
                  <p>Session</p>
                </div>
              </div>

              <button className="preview-btn">Live Practice Mode</button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;