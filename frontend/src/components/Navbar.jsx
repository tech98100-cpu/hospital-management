import { Link } from "react-router-dom";

export default function Navbar({ patient, onLoginClick, onRegisterClick, onMyAppointmentsClick, onLogout, onNavClick }) {
  const isPatient = patient && patient.role === "patient";

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <span className="brand-icon">✚</span>
          <span className="brand-name">HealthCare<span className="brand-plus">+</span></span>
        </div>

        <nav className="nav-links">
          <a onClick={() => onNavClick("hero")}>Home</a>
          <a onClick={() => onNavClick("doctors")}>Doctors</a>
          <a onClick={() => onNavClick("booking")}>Appointments</a>
          <a onClick={() => onNavClick("departments")}>Departments</a>
          <a onClick={() => onNavClick("testimonials")}>Reviews</a>
        </nav>

        <div className="navbar-actions">
          {patient ? (
            <>
              {isPatient && (
                <button className="btn-ghost" onClick={onMyAppointmentsClick}>My Appointments</button>
              )}
              <Link to="/dashboard" className="btn-ghost">{isPatient ? "My Records" : "Dashboard"}</Link>
              <span className="navbar-name">Hi, {patient.name.split(" ")[0]}</span>
              <button className="btn-outline" onClick={onLogout}>Log out</button>
            </>
          ) : (
            <>
              <button className="btn-outline" onClick={onLoginClick}>Login</button>
              <button className="btn-primary" onClick={onRegisterClick}>Register</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
