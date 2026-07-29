import { useEffect, useState } from "react";
import { searchPatients, getBills, createBill, payBill } from "../../api";

export default function BillingPage() {
  const [bills, setBills] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    try {
      setBills(await getBills(statusFilter));
    } catch (err) {
      setError(err.message);
    }
  }
  useEffect(() => { load(); }, [statusFilter]);

  async function handlePay(id) {
    const amount = Number(window.prompt("Payment amount (Rs):"));
    if (!amount || amount <= 0) return;
    try {
      await payBill(id, amount);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Billing</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center" }}>
        <select className="dash-search" style={{ marginBottom: 0, maxWidth: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>{showForm ? "Close" : "+ New Bill"}</button>
      </div>

      {error && <div className="dash-error">{error}</div>}
      {showForm && <NewBillForm onCreated={() => { setShowForm(false); load(); }} />}

      <div className="dash-panel">
        {bills.length === 0 ? (
          <p className="dash-empty">No bills found.</p>
        ) : (
          <table className="dash-table">
            <thead><tr><th>Patient</th><th>Total</th><th>Paid</th><th>Status</th><th>Due</th><th></th></tr></thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b._id}>
                  <td>{b.patient?.name || "—"}</td>
                  <td>Rs {b.totalAmount.toLocaleString()}</td>
                  <td>Rs {b.paidAmount.toLocaleString()}</td>
                  <td><span className={`pill ${b.status === "paid" ? "pill-green" : b.status === "partial" ? "pill-amber" : "pill-rose"}`}>{b.status}</span></td>
                  <td>{b.dueDate || "—"}</td>
                  <td>{b.status !== "paid" && <button className="btn-outline" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => handlePay(b._id)}>Record Payment</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function NewBillForm({ onCreated }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [items, setItems] = useState([{ description: "", amount: "" }]);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    const value = e.target.value;
    setQ(value);
    if (value.length < 2) return setResults([]);
    try { setResults(await searchPatients(value)); } catch { /* ignore */ }
  }

  function updateItem(i, field, value) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      if (!patientId) throw new Error("Select a patient first");
      const cleaned = items.filter((i) => i.description && i.amount).map((i) => ({ description: i.description, amount: Number(i.amount) }));
      if (!cleaned.length) throw new Error("Add at least one line item");
      await createBill({ patientId, items: cleaned, dueDate });
      onCreated();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="dash-panel">
      <div className="dash-panel-title">New Bill</div>
      {error && <div className="dash-error">{error}</div>}

      {!patientId ? (
        <div style={{ position: "relative", marginBottom: 12 }}>
          <input className="dash-search" style={{ marginBottom: 0 }} placeholder="Search patient by name/email…" value={q} onChange={handleSearch} />
          {results.length > 0 && (
            <div style={{ border: "1px solid var(--border)", borderRadius: 10, marginTop: 4, background: "#fff" }}>
              {results.map((p) => (
                <div key={p._id} style={{ padding: "8px 12px", cursor: "pointer" }}
                  onClick={() => { setPatientId(p._id); setPatientName(p.name); setResults([]); setQ(""); }}>
                  {p.name} — {p.email}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p style={{ marginBottom: 12 }}>Billing: <strong>{patientName}</strong> <a onClick={() => setPatientId("")} style={{ color: "var(--blue)", cursor: "pointer" }}>(change)</a></p>
      )}

      {items.map((it, i) => (
        <div className="dash-form-row" key={i}>
          <label style={{ gridColumn: "span 2" }}>Description <input value={it.description} onChange={(e) => updateItem(i, "description", e.target.value)} /></label>
          <label>Amount (Rs) <input type="number" value={it.amount} onChange={(e) => updateItem(i, "amount", e.target.value)} /></label>
        </div>
      ))}
      <button type="button" className="btn-outline" style={{ marginBottom: 12 }} onClick={() => setItems((p) => [...p, { description: "", amount: "" }])}>+ Add line item</button>

      <div className="dash-form-row">
        <label>Due date <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></label>
      </div>

      <button type="submit" className="btn-primary">Create Bill</button>
    </form>
  );
}
