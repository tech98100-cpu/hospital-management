import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerPatient, setToken, setStoredUser } from "../api";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ mode, onClose, onSuccess, onSwitchMode }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "register") {
        const data = await registerPatient({ name, email, password });
        setToken(data.token);
        setStoredUser(data.user);
        onSuccess(data.user);
      } else {
        const user = await login(email, password);
        if (user.role === "patient") {
          onSuccess(user);
        } else {
          onClose();
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>{mode === "register" ? "Create your account" : "Welcome back"}</h3>
        <p className="modal-sub">
          {mode === "register" ? "Register to book and manage appointments." : "Log in to book appointments, or access your staff dashboard."}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <label className="field-label">Full name</label>
              <input className="field-input" value={name} onChange={e => setName(e.target.value)} required />
            </>
          )}
          <label className="field-label">Email</label>
          <input className="field-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />

          <label className="field-label">Password</label>
          <input className="field-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />

          {error && <div className="booking-error">{error}</div>}

          <button type="submit" className="btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 18 }}>
            {loading ? "Please wait…" : mode === "register" ? "Register" : "Log In"}
          </button>
        </form>

        <p className="modal-switch">
          {mode === "register" ? (
            <>Already have an account? <a onClick={() => onSwitchMode("login")}>Log in</a></>
          ) : (
            <>New here? <a onClick={() => onSwitchMode("register")}>Create an account</a></>
          )}
        </p>
      </div>
    </div>
  );
}
