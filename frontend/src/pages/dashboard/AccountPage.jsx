import { useState } from "react";
import { changePassword } from "../../api";
import { useAuth } from "../../context/AuthContext";

export default function AccountPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess("Password updated successfully.");
      setCurrentPassword(""); setNewPassword("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>My Account</h2>
      <div className="dash-panel" style={{ maxWidth: 420 }}>
        <div className="dash-panel-title">Details</div>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      <form onSubmit={handleSubmit} className="dash-panel" style={{ maxWidth: 420 }}>
        <div className="dash-panel-title">Change Password</div>
        {error && <div className="dash-error">{error}</div>}
        {success && <div className="dash-success">{success}</div>}
        <label className="field-label">Current password</label>
        <input className="field-input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        <label className="field-label" style={{ marginTop: 10 }}>New password</label>
        <input className="field-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
        <button type="submit" className="btn-primary" style={{ marginTop: 16 }}>Update Password</button>
      </form>
    </div>
  );
}
