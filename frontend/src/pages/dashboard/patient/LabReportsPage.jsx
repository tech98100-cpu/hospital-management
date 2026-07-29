import { useEffect, useState } from "react";
import { getMyLabReports } from "../../../api";

export default function LabReportsPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyLabReports().then(setReports).catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Lab Reports</h2>
      {error && <div className="dash-error">{error}</div>}
      <div className="dash-panel">
        {reports.length === 0 ? (
          <p className="dash-empty">No lab reports yet.</p>
        ) : (
          <table className="dash-table">
            <thead><tr><th>Test</th><th>Ordered by</th><th>Date</th><th>Status</th><th>Result</th></tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id}>
                  <td>{r.testName}</td>
                  <td>{r.doctor?.name || "—"}</td>
                  <td>{r.date}</td>
                  <td><span className={`pill ${r.status === "completed" ? "pill-green" : "pill-amber"}`}>{r.status}</span></td>
                  <td>{r.resultSummary || "Pending"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
