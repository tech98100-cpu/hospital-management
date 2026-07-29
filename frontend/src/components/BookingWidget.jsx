import { useState, useEffect, useMemo } from "react";
import MiniCalendar from "./MiniCalendar";
import { getBookedSlots, bookAppointment } from "../api";

const TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

export default function BookingWidget({ departments, doctors, presetDoctor, patient, onRequireAuth, onBooked }) {
  const [department, setDepartment] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (presetDoctor) {
      setDepartment(presetDoctor.department);
      setDoctorId(presetDoctor._id);
    }
  }, [presetDoctor]);

  const filteredDoctors = useMemo(
    () => (department ? doctors.filter(d => d.department === department) : doctors),
    [doctors, department]
  );

  useEffect(() => {
    if (doctorId && date) {
      getBookedSlots(doctorId, date).then(setBookedSlots).catch(() => setBookedSlots([]));
    } else {
      setBookedSlots([]);
    }
  }, [doctorId, date]);

  function handleDepartmentChange(e) {
    const dep = e.target.value;
    setDepartment(dep);
    setDoctorId("");
    setTime("");
  }

  async function handleConfirm() {
    if (!department || !doctorId || !date || !time) {
      setError("Please fill in every field before confirming.");
      return;
    }
    if (!patient) {
      onRequireAuth();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const appointment = await bookAppointment({ doctorId, department, date, time });
      setSuccess(appointment);
      setTime("");
      onBooked?.();
    } catch (err) {
      setError(err.message || "Could not book that slot. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectedDoctor = doctors.find(d => d._id === doctorId);

  return (
    <section className="booking-section" id="booking">
      <div className="booking-card">
        <h3>Book an Appointment</h3>

        <label className="field-label">Select Department</label>
        <select className="field-select" value={department} onChange={handleDepartmentChange}>
          <option value="">Choose a department</option>
          {departments.map(dep => <option key={dep._id} value={dep.name}>{dep.name}</option>)}
        </select>

        <label className="field-label">Select Doctor</label>
        <select className="field-select" value={doctorId} onChange={e => setDoctorId(e.target.value)}>
          <option value="">Choose a doctor</option>
          {filteredDoctors.map(doc => (
            <option key={doc._id} value={doc._id}>{doc.name} — {doc.specialty}</option>
          ))}
        </select>

        <label className="field-label">Select Time</label>
        <div className="time-slots">
          {TIME_SLOTS.map(slot => {
            const taken = bookedSlots.includes(slot);
            return (
              <button
                type="button"
                key={slot}
                className={`time-slot ${time === slot ? "active" : ""} ${taken ? "taken" : ""}`}
                disabled={taken || !doctorId || !date}
                onClick={() => setTime(slot)}
              >
                {slot}
              </button>
            );
          })}
        </div>

        {error && <div className="booking-error">{error}</div>}

        {success ? (
          <div className="booking-success">
            ✓ Booked with {success.doctor?.name} on {success.date} at {success.time}.
          </div>
        ) : (
          <button className="btn-primary btn-block btn-lg" onClick={handleConfirm} disabled={loading}>
            {loading ? "Booking…" : patient ? "Confirm Appointment →" : "Log in to Book →"}
          </button>
        )}
      </div>

      <div className="calendar-card">
        <MiniCalendar selectedDate={date} onSelect={setDate} />
        {date && (
          <div className="calendar-footer">
            <div className="calendar-selected-date">{date}</div>
            {selectedDoctor && <div className="calendar-selected-doctor">with {selectedDoctor.name}</div>}
          </div>
        )}
      </div>
    </section>
  );
}
