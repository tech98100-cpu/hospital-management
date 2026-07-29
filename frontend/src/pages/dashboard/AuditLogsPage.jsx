import { useEffect, useState } from "react";
import { getAuditLogs } from "../../api";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAuditLogs({ limit: 200 }).then(setLogs).catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Audit Logs</h2>
      <p style={{ color: "var(--text-dim)", marginTop: -8, marginBottom: 18 }}>
        A record of logins and sensitive actions taken across the system, for accountability and security review.
      </p>
      {error && <div className="dash-error">{error}</div>}
      <div className="dash-panel">
        {logs.length === 0 ? (
          <p className="dash-empty">No activity recorded yet.</p>
        ) : (
          <table className="dash-table">
            <thead><tr><th>When</th><th>User</th><th>Role</th><th>Action</th><th>Details</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id}>
                  <td>{new Date(l.createdAt).toLocaleString()}</td>
                  <td>{l.userName || "—"}</td>
                  <td><span className="pill pill-blue">{l.role || "—"}</span></td>
                  <td>{l.action}</td>
                  <td>{l.details || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
