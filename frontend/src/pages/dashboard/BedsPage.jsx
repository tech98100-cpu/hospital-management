import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getBeds, addBed, updateBed } from "../../api";

export default function BedsPage() {
  const { user } = useAuth();
  const [beds, setBeds] = useState([]);
  const [error, setError] = useState(null);
  const [ward, setWard] = useState("");
  const [bedNumber, setBedNumber] = useState("");
  const [department, setDepartment] = useState("");

  async function load() {
    try { setBeds(await getBeds()); } catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    try {
      await addBed({ ward, bedNumber, department });
      setWard(""); setBedNumber(""); setDepartment("");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleStatus(bed) {
    const next = bed.status === "available" ? "occupied" : "available";
    try {
      await updateBed(bed._id, { status: next });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const grouped = beds.reduce((acc, b) => {
    (acc[b.ward] = acc[b.ward] || []).push(b);
    return acc;
  }, {});

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Beds</h2>
      {error && <div className="dash-error">{error}</div>}

      {Object.entries(grouped).map(([wardName, wardBeds]) => (
        <div className="dash-panel" key={wardName}>
          <div className="dash-panel-title">
            {wardName} — {wardBeds.filter((b) => b.status === "available").length} / {wardBeds.length} available
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {wardBeds.map((b) => (
              <button
                key={b._id}
                onClick={() => toggleStatus(b)}
                disabled={!["admin", "nurse", "receptionist"].includes(user.role)}
                className={`pill ${b.status === "available" ? "pill-green" : b.status === "occupied" ? "pill-rose" : "pill-gray"}`}
                style={{ border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 12.5 }}
                title={b.patient?.name ? `Occupied by ${b.patient.name}` : ""}
              >
                Bed {b.bedNumber} · {b.status}
              </button>
            ))}
          </div>
        </div>
      ))}

      {user.role === "admin" && (
        <form onSubmit={handleAdd} className="dash-panel">
          <div className="dash-panel-title">Add a bed</div>
          <div className="dash-form-row">
            <label>Ward <input value={ward} onChange={(e) => setWard(e.target.value)} required /></label>
            <label>Bed number <input value={bedNumber} onChange={(e) => setBedNumber(e.target.value)} required /></label>
            <label>Department <input value={department} onChange={(e) => setDepartment(e.target.value)} /></label>
          </div>
          <button type="submit" className="btn-primary">Add Bed</button>
        </form>
      )}
    </div>
  );
}
