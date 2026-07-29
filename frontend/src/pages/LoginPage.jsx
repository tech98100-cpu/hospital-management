import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      navigate(user.role === "patient" ? "/" : "/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(demoEmail) {
    setEmail(demoEmail);
    setPassword("Passw0rd!");
  }

  return (
    <div className="auth-page">
      <div className="auth-page-card">
        <Link to="/" className="brand" style={{ marginBottom: 18 }}>
          <span className="brand-icon">✚</span>
          <span className="brand-name">HealthCare<span className="brand-plus">+</span></span>
        </Link>
        <h3>Staff &amp; Patient Login</h3>
        <p className="modal-sub">Log in with your registered email and password.</p>

        <form onSubmit={handleSubmit}>
          <label className="field-label">Email</label>
          <input className="field-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />

          <label className="field-label">Password</label>
          <input className="field-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />

          {error && <div className="booking-error">{error}</div>}

          <button type="submit" className="btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 18 }}>
            {loading ? "Please wait…" : "Log In"}
          </button>
        </form>

        <div className="demo-credentials-box">
          <div className="demo-credentials-title">🔑 Demo Accounts (for reviewers)</div>
          <p className="demo-credentials-note">Click a role to auto-fill the login form.</p>
          <div className="demo-credentials-list">
            <button type="button" className="demo-credential-row" onClick={() => fillDemo("admin@healthcareplus.demo")}>
              <span className="pill pill-blue">Admin</span> admin@healthcareplus.demo
            </button>
            <button type="button" className="demo-credential-row" onClick={() => fillDemo("imran.qureshi@healthcareplus.demo")}>
              <span className="pill pill-blue">Doctor</span> imran.qureshi@healthcareplus.demo
            </button>
            <button type="button" className="demo-credential-row" onClick={() => fillDemo("aliya.baig@healthcareplus.demo")}>
              <span className="pill pill-blue">Nurse</span> aliya.baig@healthcareplus.demo
            </button>
            <button type="button" className="demo-credential-row" onClick={() => fillDemo("reception@healthcareplus.demo")}>
              <span className="pill pill-blue">Receptionist</span> reception@healthcareplus.demo
            </button>
          </div>
          <p className="demo-credentials-note">Password for all: <strong>Passw0rd!</strong></p>
        </div>

        <p className="modal-switch">
          New patient? <Link to="/">Register from the homepage</Link>
        </p>
      </div>
    </div>
  );
}
