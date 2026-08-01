// Maps each seeded doctor's name to their photo filename (doctor1.jpg … doctor8.jpg),
// so the right photo shows up no matter what order the API returns doctors in.
const DOCTOR_PHOTOS = {
  "Dr. Imran Qureshi": "doctor1.jpg",
  "Dr. Ayesha Malik": "doctor2.jpg",
  "Dr. Farhan Siddiqui": "doctor3.jpg",
  "Dr. Sana Raza": "doctor4.jpg",
  "Dr. Bilal Ahmed": "doctor5.jpg",
  "Dr. Hina Yousuf": "doctor6.jpg",
  "Dr. Omar Farooq": "doctor7.jpg",
  "Dr. Nadia Iqbal": "doctor8.jpg",
};

function DoctorAvatar({ doc }) {
  const photo = DOCTOR_PHOTOS[doc.name];
  if (!photo) {
    return <div className="doctor-avatar">{doc.initials}</div>;
  }
  return (
    <div className="doctor-avatar doctor-avatar-photo">
      <img
        src={`/doctors/${photo}`}
        alt={doc.name}
        onError={(e) => {
          e.target.style.display = "none";
          e.target.parentElement.textContent = doc.initials;
        }}
      />
    </div>
  );
}

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
              <DoctorAvatar doc={doc} />
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