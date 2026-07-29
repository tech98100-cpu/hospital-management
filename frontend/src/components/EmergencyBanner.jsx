export default function EmergencyBanner() {
  return (
    <section className="emergency-banner">
      <div>
        <h3>Medical Emergency?</h3>
        <p>Our emergency team is ready 24/7 to help you.</p>
      </div>
      <a href="tel:+15551234567" className="emergency-call">
        <span className="emergency-icon">📞</span>
        <span>
          <span className="emergency-label">Call Emergency</span>
          <span className="emergency-number">+1 (555) 123-4567</span>
        </span>
      </a>
    </section>
  );
}
