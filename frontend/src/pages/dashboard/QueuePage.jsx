import { useEffect, useState, Fragment } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getQueue, updateConsultation } from "../../api";

export default function QueuePage() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [notes, setNotes] = useState("");
  const [vitals, setVitals] = useState({ bloodPressure: "", temperature: "", pulse: "", weight: "" });

  async function load() {
    try {
      setQueue(await getQueue(date));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, [date]);

  function startEdit(appt) {
    setEditingId(appt._id);
    setNotes(appt.consultationNotes || "");
    setVitals(appt.vitals || { bloodPressure: "", temperature: "", pulse: "", weight: "" });
  }

  async function saveConsult(id, markCompleted) {
    try {
      await updateConsultation(id, {
        consultationNotes: notes, vitals,
        status: markCompleted ? "completed" : undefined,
      });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const canConsult = ["doctor", "nurse"].includes(user.role);

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>{user.role === "doctor" ? "My Queue" : "Today's Appointments"}</h2>
      <div className="dash-form-row" style={{ maxWidth: 220 }}>
        <label>Date <input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
      </div>

      {error && <div className="dash-error">{error}</div>}

      <div className="dash-panel">
        {queue.length === 0 ? (
          <p className="dash-empty">No appointments for this date.</p>
        ) : (
          <table className="dash-table">
            <thead><tr><th>Time</th><th>Patient</th><th>Doctor</th><th>Dept</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {queue.map((a) => (
                <Fragment key={a._id}>
                  <tr>
                    <td>{a.time} {a.isEmergency && <span className="pill pill-rose" style={{ marginLeft: 6 }}>Emergency</span>}</td>
                    <td>{a.patient?.name ? <Link to={`/dashboard/patients/${a.patient._id}`}>{a.patient.name}</Link> : "—"}</td>
                    <td>{a.doctor?.name || "—"}</td>
                    <td>{a.department}</td>
                    <td><span className={`pill ${a.status === "completed" ? "pill-green" : "pill-blue"}`}>{a.status}</span></td>
                    <td>
                      {canConsult && a.status !== "completed" && (
                        <button className="btn-outline" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => startEdit(a)}>
                          {editingId === a._id ? "Editing…" : "Consult"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {editingId === a._id && (
                    <tr>
                      <td colSpan={6}>
                        <div style={{ background: "var(--border-soft)", borderRadius: 12, padding: 14, margin: "6px 0" }}>
                          <div className="dash-form-row">
                            <label>BP <input value={vitals.bloodPressure} onChange={(e) => setVitals(v => ({ ...v, bloodPressure: e.target.value }))} placeholder="120/80" /></label>
                            <label>Temp <input value={vitals.temperature} onChange={(e) => setVitals(v => ({ ...v, temperature: e.target.value }))} placeholder="98.6°F" /></label>
                            <label>Pulse <input value={vitals.pulse} onChange={(e) => setVitals(v => ({ ...v, pulse: e.target.value }))} placeholder="72 bpm" /></label>
                            <label>Weight <input value={vitals.weight} onChange={(e) => setVitals(v => ({ ...v, weight: e.target.value }))} placeholder="70kg" /></label>
                          </div>
                          <div className="dash-form-row">
                            <label style={{ gridColumn: "1 / -1" }}>Consultation notes
                              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                            </label>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn-primary" onClick={() => saveConsult(a._id, false)}>Save</button>
                            <button className="btn-primary" onClick={() => saveConsult(a._id, true)}>Save &amp; Mark Completed</button>
                            <button className="btn-outline" onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
