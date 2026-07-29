import { useState, useEffect } from "react";
import { getMyAppointments, cancelAppointment } from "../api";

export default function MyAppointmentsModal({ onClose }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    try {
      setAppointments(await getMyAppointments());
    } catch (err) {
      setError(err.message || "Could not load your appointments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCancel(id) {
    try {
      await cancelAppointment(id);
      await load();
    } catch (err) {
      setError(err.message || "Could not cancel that appointment.");
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-wide" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>My Appointments</h3>

        {error && <div className="booking-error">{error}</div>}

        {loading ? (
          <p className="section-empty">Loading…</p>
        ) : appointments.length === 0 ? (
          <p className="section-empty">You haven't booked any appointments yet.</p>
        ) : (
          <div className="appointments-list">
            {appointments.map(appt => (
              <div className={`appointment-row ${appt.status === "cancelled" ? "cancelled" : ""}`} key={appt._id}>
                <div>
                  <div className="appointment-doctor">{appt.doctor?.name || "Doctor"}</div>
                  <div className="appointment-meta">{appt.department} · {appt.date} at {appt.time}</div>
                </div>
                {appt.status === "confirmed" ? (
                  <button className="btn-outline" onClick={() => handleCancel(appt._id)}>Cancel</button>
                ) : (
                  <span className="appointment-status">Cancelled</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
