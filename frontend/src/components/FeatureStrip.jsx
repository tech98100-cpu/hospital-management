const FEATURES = [
  { icon: "📅", title: "Appointment Scheduling", desc: "Easy booking with real-time availability" },
  { icon: "📋", title: "Digital Records", desc: "Secure patient history, always up to date" },
  { icon: "👥", title: "Patient Dashboard", desc: "Track your appointments in one place" },
  { icon: "🩺", title: "Specialist Network", desc: "Verified doctors across every department" },
];

export default function FeatureStrip({ stats }) {
  return (
    <section className="feature-strip">
      <div className="feature-cards">
        {FEATURES.map(f => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">👤</div>
          <div className="stat-value">{stats ? `${stats.doctorCount}+` : "—"}</div>
          <div className="stat-label">Doctors</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-teal">👥</div>
          <div className="stat-value">{stats ? `${stats.patientCount}+` : "—"}</div>
          <div className="stat-label">Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-amber">🕐</div>
          <div className="stat-value">24/7</div>
          <div className="stat-label">Emergency</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-rose">★</div>
          <div className="stat-value">98%</div>
          <div className="stat-label">Satisfaction</div>
        </div>
      </div>
    </section>
  );
}
