import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_BY_ROLE = {
  admin: [
    { to: "/dashboard", label: "Overview", end: true },
    { to: "/dashboard/patients", label: "Patients" },
    { to: "/dashboard/queue", label: "Today's Appointments" },
    { to: "/dashboard/billing", label: "Billing" },
    { to: "/dashboard/beds", label: "Beds" },
    { to: "/dashboard/staff", label: "Staff Accounts" },
    { to: "/dashboard/audit-logs", label: "Audit Logs" },
    { to: "/dashboard/account", label: "My Account" },
  ],
  doctor: [
    { to: "/dashboard", label: "Overview", end: true },
    { to: "/dashboard/queue", label: "My Queue" },
    { to: "/dashboard/patients", label: "Patients" },
    { to: "/dashboard/account", label: "My Account" },
  ],
  nurse: [
    { to: "/dashboard", label: "Overview", end: true },
    { to: "/dashboard/queue", label: "Today's Appointments" },
    { to: "/dashboard/patients", label: "Patients" },
    { to: "/dashboard/beds", label: "Beds" },
    { to: "/dashboard/account", label: "My Account" },
  ],
  receptionist: [
    { to: "/dashboard", label: "Overview", end: true },
    { to: "/dashboard/queue", label: "Today's Appointments" },
    { to: "/dashboard/patients", label: "Patients" },
    { to: "/dashboard/billing", label: "Billing" },
    { to: "/dashboard/beds", label: "Beds" },
    { to: "/dashboard/account", label: "My Account" },
  ],
  patient: [
    { to: "/dashboard", label: "Overview", end: true },
    { to: "/dashboard/profile", label: "My Profile" },
    { to: "/dashboard/prescriptions", label: "Prescriptions" },
    { to: "/dashboard/lab-reports", label: "Lab Reports" },
    { to: "/dashboard/bills", label: "Billing" },
    { to: "/dashboard/account", label: "My Account" },
  ],
};

const ROLE_LABEL = {
  admin: "Administrator",
  doctor: "Doctor",
  nurse: "Nurse",
  receptionist: "Receptionist",
  patient: "Patient",
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const items = NAV_BY_ROLE[user.role] || [];

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <Link to="/" className="brand dash-brand">
          <span className="brand-icon">✚</span>
          <span className="brand-name">HealthCare<span className="brand-plus">+</span></span>
        </Link>
        <div className="dash-role-badge">{ROLE_LABEL[user.role] || user.role}</div>
        <nav className="dash-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => "dash-nav-link" + (isActive ? " active" : "")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="dash-sidebar-footer">
          <Link to="/" className="dash-nav-link">← Back to site</Link>
          <button className="btn-outline btn-block" onClick={logout} style={{ marginTop: 10 }}>Log out</button>
        </div>
      </aside>

      <main className="dash-main">
        <header className="dash-topbar">
          <div>
            <div className="dash-welcome">Welcome back, {user.name.split(" ")[0]}</div>
            <div className="dash-welcome-sub">{ROLE_LABEL[user.role] || user.role} dashboard</div>
          </div>
        </header>
        <div className="dash-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
