export default function DoctorsSection({ doctors, onBookNow }) {
  return (
    <section className="doctors-section" id="doctors">
      <div className="section-header">
        <h2>Our Top Doctors</h2>
        <span className="section-link">Verified specialists</span>
      </div>

      {doctors.length === 0 ? (
        <p className="section-empty">Loading doctors…</p>
      ) : (
        <div className="doctors-grid">
          {doctors.slice(0, 8).map(doc => (
            <div className="doctor-card" key={doc._id}>
              <div className="doctor-avatar">{doc.initials}</div>
              <div className="doctor-name">{doc.name}</div>
              <div className="doctor-specialty">{doc.specialty}</div>
              <div className="doctor-rating">★ {doc.rating.toFixed(1)} ({doc.reviewCount}) · {doc.experienceYears}+ yrs</div>
              <button className="btn-primary btn-block" onClick={() => onBookNow(doc)}>Book Now</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
