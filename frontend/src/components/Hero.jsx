export default function Hero({ stats, onBookClick, onExploreClick }) {
  return (
    <section className="hero" id="hero">
      <div className="hero-blob blob-1"></div>
      <div className="hero-blob blob-2"></div>

      <div className="hero-left">
        <span className="hero-badge">✦ Smart Hospital Management System</span>
        <h1 className="hero-title">
          Your Health,<br /><span className="hero-title-accent">Our Priority.</span>
        </h1>
        <p className="hero-sub">
          A modern hospital platform that simplifies your healthcare experience
          with smart scheduling, digital records, and better patient care.
        </p>
        <div className="hero-ctas">
          <button className="btn-primary btn-lg" onClick={onBookClick}>Book Appointment →</button>
          <button className="btn-outline btn-lg" onClick={onExploreClick}>Explore Doctors</button>
        </div>
        <div className="hero-tags">
          <span>🔒 Secure & Private</span>
          <span>⚡ Real-time Booking</span>
          <span>🕐 24/7 Support</span>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-art">
          <div className="hero-art-circle"></div>
          <div className="hero-art-icon">✚</div>
        </div>

        <div className="float-card float-card-tl">
          <div className="float-card-label">Total Patients</div>
          <div className="float-card-value">{stats ? stats.patientCount.toLocaleString() : "—"}</div>
          <div className="float-card-trend">↗ growing daily</div>
        </div>

        <div className="float-card float-card-bl">
          <div className="float-card-label">Patient Satisfaction</div>
          <div className="float-card-value">98%</div>
          <div className="float-card-trend">✓ Excellent</div>
        </div>

        <div className="float-card float-card-tr">
          <div className="float-card-label">Appointments Today</div>
          <div className="float-card-value">{stats ? stats.appointmentsToday : "—"}</div>
        </div>
      </div>
    </section>
  );
}
