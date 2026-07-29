import { useEffect, useState } from "react";
import { getMyBills } from "../../../api";

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyBills().then(setBills).catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Billing</h2>
      {error && <div className="dash-error">{error}</div>}
      <div className="dash-panel">
        {bills.length === 0 ? (
          <p className="dash-empty">No bills yet.</p>
        ) : (
          <table className="dash-table">
            <thead><tr><th>Description</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Due</th></tr></thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b._id}>
                  <td>{b.items.map((i) => i.description).join(", ")}</td>
                  <td>Rs {b.totalAmount.toLocaleString()}</td>
                  <td>Rs {b.paidAmount.toLocaleString()}</td>
                  <td>Rs {(b.totalAmount - b.paidAmount).toLocaleString()}</td>
                  <td><span className={`pill ${b.status === "paid" ? "pill-green" : b.status === "partial" ? "pill-amber" : "pill-rose"}`}>{b.status}</span></td>
                  <td>{b.dueDate || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
