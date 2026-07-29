import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { searchPatients } from "../../api";

export default function PatientsDirectory() {
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load(query) {
    setLoading(true);
    try {
      setPatients(await searchPatients(query));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(""); }, []);

  function handleSubmit(e) {
    e.preventDefault();
    load(q);
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Patients</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="dash-search"
          placeholder="Search by name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </form>

      {error && <div className="dash-error">{error}</div>}

      <div className="dash-panel">
        {loading ? (
          <p className="dash-empty">Loading…</p>
        ) : patients.length === 0 ? (
          <p className="dash-empty">No patients found.</p>
        ) : (
          <table className="dash-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Blood Group</th><th></th></tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.phone || "—"}</td>
                  <td>{p.bloodGroup || "—"}</td>
                  <td><Link to={`/dashboard/patients/${p._id}`} className="btn-outline" style={{ padding: "5px 12px", fontSize: 12.5 }}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
