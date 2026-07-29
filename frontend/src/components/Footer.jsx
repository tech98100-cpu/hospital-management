export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="brand">
            <span className="brand-icon">✚</span>
            <span className="brand-name">HealthCare<span className="brand-plus">+</span></span>
          </div>
          <p className="footer-about">Modern hospital management, designed for better patient care and simplified operations.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <a href="#hero">Home</a>
          <a href="#doctors">Our Doctors</a>
          <a href="#departments">Departments</a>
        </div>
        <div>
          <h4>For Patients</h4>
          <a href="#booking">Book Appointment</a>
          <a href="#testimonials">Patient Reviews</a>
        </div>
        <div>
          <h4>Contact</h4>
          <p>123 Healthcare Blvd, Medical City</p>
          <p>+1 (555) 123-4567</p>
          <p>info@healthcareplus.com</p>
        </div>
      </div>
      <div className="footer-bottom">© 2026 HealthCare+. All rights reserved.</div>
    </footer>
  );
}
