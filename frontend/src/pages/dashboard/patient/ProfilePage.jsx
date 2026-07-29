import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "../../../api";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    getMyProfile().then(setProfile).catch((err) => setError(err.message));
  }, []);

  function update(field, value) {
    setProfile((p) => ({ ...p, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null); setSuccess(null);
    try {
      const saved = await updateMyProfile({
        phone: profile.phone, dob: profile.dob, gender: profile.gender, bloodGroup: profile.bloodGroup,
        address: profile.address, emergencyContactName: profile.emergencyContactName,
        emergencyContactPhone: profile.emergencyContactPhone,
        allergies: profile.allergies, chronicConditions: profile.chronicConditions,
      });
      setProfile(saved);
      setSuccess("Profile updated.");
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !profile) return <div className="dash-error">{error}</div>;
  if (!profile) return <p className="dash-empty">Loading…</p>;

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>My Profile</h2>
      <form onSubmit={handleSubmit} className="dash-panel" style={{ maxWidth: 640 }}>
        {error && <div className="dash-error">{error}</div>}
        {success && <div className="dash-success">{success}</div>}
        <div className="dash-form-row">
          <label>Full name <input value={profile.name} disabled /></label>
          <label>Email <input value={profile.email} disabled /></label>
          <label>Phone <input value={profile.phone || ""} onChange={(e) => update("phone", e.target.value)} /></label>
          <label>Date of birth <input type="date" value={profile.dob || ""} onChange={(e) => update("dob", e.target.value)} /></label>
        </div>
        <div className="dash-form-row">
          <label>Gender
            <select value={profile.gender || ""} onChange={(e) => update("gender", e.target.value)}>
              <option value="">—</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>Blood group <input value={profile.bloodGroup || ""} onChange={(e) => update("bloodGroup", e.target.value)} placeholder="e.g. O+" /></label>
        </div>
        <div className="dash-form-row">
          <label style={{ gridColumn: "1 / -1" }}>Address <input value={profile.address || ""} onChange={(e) => update("address", e.target.value)} /></label>
        </div>
        <div className="dash-form-row">
          <label>Emergency contact name <input value={profile.emergencyContactName || ""} onChange={(e) => update("emergencyContactName", e.target.value)} /></label>
          <label>Emergency contact phone <input value={profile.emergencyContactPhone || ""} onChange={(e) => update("emergencyContactPhone", e.target.value)} /></label>
        </div>
        <div className="dash-form-row">
          <label style={{ gridColumn: "1 / -1" }}>Allergies (comma separated)
            <input
              value={(profile.allergies || []).join(", ")}
              onChange={(e) => update("allergies", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            />
          </label>
        </div>
        <button type="submit" className="btn-primary">Save Changes</button>
      </form>
    </div>
  );
}
