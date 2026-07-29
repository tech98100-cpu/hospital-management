import { useEffect, useState } from "react";
import { listUsers, createStaff, updateUser, resetUserPassword } from "../../api";

const ROLES = ["admin", "doctor", "nurse", "receptionist"];

export default function StaffPage() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    try { setUsers(await listUsers(roleFilter)); } catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, [roleFilter]);

  async function handleToggleActive(u) {
    try {
      await updateUser(u.id, { isActive: !u.isActive });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReset(u) {
    try {
      const { tempPassword } = await resetUserPassword(u.id);
      setNotice(`New temporary password for ${u.email}: ${tempPassword}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Staff Accounts</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <select className="dash-search" style={{ marginBottom: 0, maxWidth: 200 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>{showForm ? "Close" : "+ New Staff Account"}</button>
      </div>

      {error && <div className="dash-error">{error}</div>}
      {notice && <div className="dash-success">{notice}</div>}
      {showForm && <NewStaffForm onCreated={(msg) => { setShowForm(false); setNotice(msg); load(); }} />}

      <div className="dash-panel">
        {users.length === 0 ? (
          <p className="dash-empty">No accounts found.</p>
        ) : (
          <table className="dash-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="pill pill-blue">{u.role}</span></td>
                  <td><span className={`pill ${u.isActive ? "pill-green" : "pill-gray"}`}>{u.isActive ? "active" : "deactivated"}</span></td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <button className="btn-outline" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => handleToggleActive(u)}>
                      {u.isActive ? "Deactivate" : "Reactivate"}
                    </button>
                    <button className="btn-outline" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => handleReset(u)}>Reset Password</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function NewStaffForm({ onCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("doctor");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const { user, tempPassword } = await createStaff({ name, email, role, phone, specialty, department });
      onCreated(`${user.name} created. Temporary password: ${tempPassword}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="dash-panel">
      <div className="dash-panel-title">New staff account</div>
      {error && <div className="dash-error">{error}</div>}
      <div className="dash-form-row">
        <label>Full name <input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>Email <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Phone <input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
        <label>Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
      </div>
      {role === "doctor" && (
        <div className="dash-form-row">
          <label>Specialty <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} required /></label>
          <label>Department <input value={department} onChange={(e) => setDepartment(e.target.value)} required /></label>
        </div>
      )}
      {role === "nurse" && (
        <div className="dash-form-row">
          <label>Department <input value={department} onChange={(e) => setDepartment(e.target.value)} /></label>
        </div>
      )}
      <button type="submit" className="btn-primary">Create Account</button>
    </form>
  );
}
