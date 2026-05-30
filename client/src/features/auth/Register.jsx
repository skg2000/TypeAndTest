import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import "../../pages/Login/Login.css";
import "../../pages/Register/Register.css";

function Register() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"][strength];
  const strengthColor = ["", "#f87171", "#fb923c", "#22c55e"][strength];

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">⌨️</div>
          <span className="auth-logo-text">TypeMaster</span>
        </Link>

        {/* Heading */}
        <div className="auth-heading">
          <h1>Create account</h1>
          <p>Start your typing journey for free</p>
        </div>

        {/* Error */}
        {error && <div className="auth-error">⚠ {error}</div>}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Username</label>
            <input
              type="text"
              placeholder="Choose a username"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-field-row">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPass(v => !v)}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>

            {/* Password strength bar */}
            {password.length > 0 && (
              <div style={{ marginTop: 6 }}>
                <div style={{ height: 4, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    width: `${(strength / 3) * 100}%`,
                    height: "100%",
                    background: strengthColor,
                    borderRadius: 4,
                    transition: "width 0.3s, background 0.3s"
                  }} />
                </div>
                <span style={{ fontSize: "0.72rem", color: strengthColor, marginTop: 3, display: "block" }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          <div className="auth-field">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              style={{ borderColor: confirm && confirm !== password ? "#f87171" : "" }}
            />
            {confirm && confirm !== password && (
              <span style={{ fontSize: "0.78rem", color: "#f87171" }}>Passwords don't match</span>
            )}
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading && <span className="auth-spinner" />}
            {loading ? "Creating account…" : "Create Free Account"}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
