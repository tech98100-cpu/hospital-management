import { useEffect, useState } from "react";
import { getMyPrescriptions } from "../../../api";

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyPrescriptions().then(setPrescriptions).catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Prescriptions</h2>
      {error && <div className="dash-error">{error}</div>}
      {prescriptions.length === 0 ? (
        <div className="dash-panel"><p className="dash-empty">No prescriptions yet.</p></div>
      ) : (
        prescriptions.map((p) => (
          <div className="dash-panel" key={p._id}>
            <div className="dash-panel-title">{p.date} — {p.doctor?.name} ({p.doctor?.specialty})</div>
            <table className="dash-table">
              <thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead>
              <tbody>
                {p.medicines.map((m, i) => (
                  <tr key={i}><td>{m.name}</td><td>{m.dosage || "—"}</td><td>{m.frequency || "—"}</td><td>{m.duration || "—"}</td></tr>
                ))}
              </tbody>
            </table>
            {p.notes && <p style={{ marginTop: 10, color: "var(--text-dim)", fontSize: 13.5 }}>{p.notes}</p>}
          </div>
        ))
      )}
    </div>
  );
}
