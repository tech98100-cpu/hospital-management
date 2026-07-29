import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getPatientById, getPatientHistory, addMedicalHistory,
  getPatientPrescriptions, createPrescription,
  getPatientLabReports, orderLabReport, updateLabReport,
  getPatientAppointments,
} from "../../api";

const TABS = ["History", "Prescriptions", "Lab Reports", "Appointments"];

export default function PatientDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState("History");
  const [error, setError] = useState(null);

  async function loadAll() {
    try {
      const [p, h, presc, labs, appts] = await Promise.all([
        getPatientById(id), getPatientHistory(id), getPatientPrescriptions(id),
        getPatientLabReports(id), getPatientAppointments(id),
      ]);
      setPatient(p); setHistory(h); setPrescriptions(presc); setLabReports(labs); setAppointments(appts);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { loadAll(); }, [id]);

  if (error) return <div className="dash-error">{error}</div>;
  if (!patient) return <p className="dash-empty">Loading…</p>;

  return (
    <div>
      <Link to="/dashboard/patients" className="dash-back-link">← Back to patients</Link>
      <h2 style={{ marginBottom: 4 }}>{patient.name}</h2>
      <p style={{ color: "var(--text-dim)", marginTop: 0 }}>{patient.email} · {patient.phone || "no phone on file"}</p>

      <div className="dash-panel">
        <div className="dash-panel-title">Profile</div>
        <div className="dash-form-row" style={{ marginBottom: 0 }}>
          <div><strong>DOB:</strong> {patient.dob || "—"}</div>
          <div><strong>Gender:</strong> {patient.gender || "—"}</div>
          <div><strong>Blood Group:</strong> {patient.bloodGroup || "—"}</div>
          <div><strong>Address:</strong> {patient.address || "—"}</div>
          <div><strong>Emergency Contact:</strong> {patient.emergencyContactName ? `${patient.emergencyContactName} (${patient.emergencyContactPhone})` : "—"}</div>
          <div><strong>Allergies:</strong> {patient.allergies?.join(", ") || "None recorded"}</div>
        </div>
      </div>

      <div className="dash-tabs">
        {TABS.map((t) => (
          <button key={t} className={`dash-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "History" && (
        <HistoryTab patientId={id} history={history} role={user.role} onAdded={loadAll} />
      )}
      {tab === "Prescriptions" && (
        <PrescriptionsTab patientId={id} prescriptions={prescriptions} role={user.role} onAdded={loadAll} />
      )}
      {tab === "Lab Reports" && (
        <LabReportsTab patientId={id} labReports={labReports} role={user.role} onAdded={loadAll} />
      )}
      {tab === "Appointments" && (
        <AppointmentsTab appointments={appointments} />
      )}
    </div>
  );
}

function HistoryTab({ patientId, history, role, onAdded }) {
  const [condition, setCondition] = useState("");
  const [diagnosedDate, setDiagnosedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState(null);
  const canAdd = ["doctor", "nurse", "admin"].includes(role);

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    try {
      await addMedicalHistory(patientId, { condition, diagnosedDate, notes, status });
      setCondition(""); setDiagnosedDate(""); setNotes("");
      onAdded();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="dash-panel">
      <div className="dash-panel-title">Medical History</div>
      {history.length === 0 ? (
        <p className="dash-empty">No medical history recorded yet.</p>
      ) : (
        <table className="dash-table">
          <thead><tr><th>Condition</th><th>Diagnosed</th><th>Status</th><th>Notes</th><th>By</th></tr></thead>
          <tbody>
            {history.map((h) => (
              <tr key={h._id}>
                <td>{h.condition}</td>
                <td>{h.diagnosedDate || "—"}</td>
                <td><span className={`pill ${h.status === "resolved" ? "pill-green" : h.status === "chronic" ? "pill-amber" : "pill-blue"}`}>{h.status}</span></td>
                <td>{h.notes || "—"}</td>
                <td>{h.recordedBy?.name || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {canAdd && (
        <form onSubmit={handleAdd} style={{ marginTop: 18, borderTop: "1px solid var(--border-soft)", paddingTop: 16 }}>
          <div className="dash-panel-title" style={{ fontSize: 14 }}>Add entry</div>
          {error && <div className="dash-error">{error}</div>}
          <div className="dash-form-row">
            <label>Condition
              <input value={condition} onChange={(e) => setCondition(e.target.value)} required />
            </label>
            <label>Diagnosed date
              <input type="date" value={diagnosedDate} onChange={(e) => setDiagnosedDate(e.target.value)} />
            </label>
            <label>Status
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="chronic">Chronic</option>
                <option value="resolved">Resolved</option>
              </select>
            </label>
          </div>
          <div className="dash-form-row">
            <label style={{ gridColumn: "1 / -1" }}>Notes
              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
          </div>
          <button type="submit" className="btn-primary">Add to history</button>
        </form>
      )}
    </div>
  );
}

function PrescriptionsTab({ patientId, prescriptions, role, onAdded }) {
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState(null);
  const canAdd = role === "doctor";

  function updateMed(i, field, value) {
    setMedicines((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  }
  function addMedRow() {
    setMedicines((prev) => [...prev, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const cleaned = medicines.filter((m) => m.name.trim());
      if (!cleaned.length) throw new Error("Add at least one medicine");
      await createPrescription({ patientId, medicines: cleaned, notes, date });
      setMedicines([{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
      setNotes("");
      onAdded();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="dash-panel">
      <div className="dash-panel-title">Prescriptions</div>
      {prescriptions.length === 0 ? (
        <p className="dash-empty">No prescriptions yet.</p>
      ) : (
        prescriptions.map((p) => (
          <div key={p._id} style={{ borderBottom: "1px solid var(--border-soft)", padding: "10px 0" }}>
            <div style={{ fontWeight: 700 }}>{p.date} — Dr. {p.doctor?.name?.replace("Dr. ", "") || "Unknown"}</div>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13.5, color: "var(--text-dim)" }}>
              {p.medicines.map((m, i) => (
                <li key={i}>{m.name} — {m.dosage} {m.frequency && `· ${m.frequency}`} {m.duration && `· ${m.duration}`}</li>
              ))}
            </ul>
            {p.notes && <p style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 4 }}>{p.notes}</p>}
          </div>
        ))
      )}

      {canAdd && (
        <form onSubmit={handleSubmit} style={{ marginTop: 18, borderTop: "1px solid var(--border-soft)", paddingTop: 16 }}>
          <div className="dash-panel-title" style={{ fontSize: 14 }}>New prescription</div>
          {error && <div className="dash-error">{error}</div>}
          {medicines.map((m, i) => (
            <div className="dash-form-row" key={i}>
              <label>Medicine <input value={m.name} onChange={(e) => updateMed(i, "name", e.target.value)} /></label>
              <label>Dosage <input value={m.dosage} onChange={(e) => updateMed(i, "dosage", e.target.value)} placeholder="e.g. 500mg" /></label>
              <label>Frequency <input value={m.frequency} onChange={(e) => updateMed(i, "frequency", e.target.value)} placeholder="e.g. twice daily" /></label>
              <label>Duration <input value={m.duration} onChange={(e) => updateMed(i, "duration", e.target.value)} placeholder="e.g. 5 days" /></label>
            </div>
          ))}
          <button type="button" className="btn-outline" onClick={addMedRow} style={{ marginBottom: 12 }}>+ Add another medicine</button>
          <div className="dash-form-row">
            <label>Date <input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
            <label style={{ gridColumn: "span 2" }}>Notes <input value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
          </div>
          <button type="submit" className="btn-primary">Save prescription</button>
        </form>
      )}
    </div>
  );
}

function LabReportsTab({ patientId, labReports, role, onAdded }) {
  const [testName, setTestName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState(null);
  const canOrder = ["doctor", "nurse"].includes(role);
  const canUpdate = ["doctor", "nurse", "admin"].includes(role);

  async function handleOrder(e) {
    e.preventDefault();
    setError(null);
    try {
      await orderLabReport({ patientId, testName, date });
      setTestName("");
      onAdded();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleComplete(reportId) {
    const resultSummary = window.prompt("Result summary:");
    if (resultSummary === null) return;
    try {
      await updateLabReport(reportId, { status: "completed", resultSummary });
      onAdded();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="dash-panel">
      <div className="dash-panel-title">Lab Reports</div>
      {error && <div className="dash-error">{error}</div>}
      {labReports.length === 0 ? (
        <p className="dash-empty">No lab tests ordered yet.</p>
      ) : (
        <table className="dash-table">
          <thead><tr><th>Test</th><th>Date</th><th>Status</th><th>Result</th>{canUpdate && <th></th>}</tr></thead>
          <tbody>
            {labReports.map((r) => (
              <tr key={r._id}>
                <td>{r.testName}</td>
                <td>{r.date}</td>
                <td><span className={`pill ${r.status === "completed" ? "pill-green" : "pill-amber"}`}>{r.status}</span></td>
                <td>{r.resultSummary || "—"}</td>
                {canUpdate && (
                  <td>
                    {r.status !== "completed" && (
                      <button className="btn-outline" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => handleComplete(r._id)}>Complete</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {canOrder && (
        <form onSubmit={handleOrder} style={{ marginTop: 18, borderTop: "1px solid var(--border-soft)", paddingTop: 16 }}>
          <div className="dash-panel-title" style={{ fontSize: 14 }}>Order a test</div>
          <div className="dash-form-row">
            <label>Test name <input value={testName} onChange={(e) => setTestName(e.target.value)} required /></label>
            <label>Date <input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          </div>
          <button type="submit" className="btn-primary">Order test</button>
        </form>
      )}
    </div>
  );
}

function AppointmentsTab({ appointments }) {
  return (
    <div className="dash-panel">
      <div className="dash-panel-title">Appointment History</div>
      {appointments.length === 0 ? (
        <p className="dash-empty">No appointments on record.</p>
      ) : (
        <table className="dash-table">
          <thead><tr><th>Date</th><th>Time</th><th>Doctor</th><th>Department</th><th>Status</th></tr></thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a._id}>
                <td>{a.date}</td><td>{a.time}</td>
                <td>{a.doctor?.name || "—"}</td><td>{a.department}</td>
                <td><span className={`pill ${a.status === "confirmed" ? "pill-blue" : a.status === "completed" ? "pill-green" : "pill-gray"}`}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
