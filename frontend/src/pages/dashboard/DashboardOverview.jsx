import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboardStats, getMyAppointments, getMyBills, getMyPrescriptions } from "../../api";

function StatCard({ icon, value, label }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

function StaffOverview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="dash-error">{error}</div>;
  if (!stats) return <p className="dash-empty">Loading analytics…</p>;

  return (
    <>
      <div className="stat-grid">
        <StatCard icon="🧑‍🤝‍🧑" value={stats.totalPatients} label="Total Patients" />
        <StatCard icon="📅" value={stats.todaysAppointments} label="Today's Appointments" />
        <StatCard icon="🛏️" value={`${stats.availableBeds} / ${stats.totalBeds}`} label="Available Beds" />
        <StatCard icon="💳" value={stats.pendingBills} label="Pending Bills" />
        <StatCard icon="🚨" value={stats.emergencyCasesToday} label="Emergency Cases Today" />
        <StatCard icon="🩺" value={stats.totalDoctors} label="Doctors on Staff" />
      </div>
      {stats.pendingBillsAmount > 0 && (
        <div className="dash-panel">
          <div className="dash-panel-title">Outstanding balance</div>
          <p style={{ margin: 0, color: "var(--text-dim)" }}>
            Rs {stats.pendingBillsAmount.toLocaleString()} across {stats.pendingBills} unpaid or partially paid bills.
          </p>
        </div>
      )}
    </>
  );
}

function PatientOverview() {
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    getMyAppointments().then(setAppointments).catch(() => {});
    getMyBills().then(setBills).catch(() => {});
    getMyPrescriptions().then(setPrescriptions).catch(() => {});
  }, []);

  const upcoming = appointments.filter((a) => a.status === "confirmed").length;
  const unpaid = bills.filter((b) => b.status !== "paid").length;

  return (
    <>
      <div className="stat-grid">
        <StatCard icon="📅" value={upcoming} label="Upcoming Appointments" />
        <StatCard icon="💊" value={prescriptions.length} label="Prescriptions" />
        <StatCard icon="💳" value={unpaid} label="Unpaid Bills" />
      </div>
      <div className="dash-panel">
        <div className="dash-panel-title">Quick links</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/dashboard/profile" className="btn-outline">My Profile</Link>
          <Link to="/dashboard/prescriptions" className="btn-outline">Prescriptions</Link>
          <Link to="/dashboard/lab-reports" className="btn-outline">Lab Reports</Link>
          <Link to="/dashboard/bills" className="btn-outline">Billing</Link>
        </div>
      </div>
    </>
  );
}

export default function DashboardOverview() {
  const { user } = useAuth();
  return user.role === "patient" ? <PatientOverview /> : <StaffOverview />;
}
