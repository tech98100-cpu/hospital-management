const TESTIMONIALS = [
  { name: "Amina R.", role: "Patient", quote: "Booking an appointment took less than two minutes. No more waiting on hold with the front desk." },
  { name: "Usman T.", role: "Patient", quote: "I could see all my past appointments in one place. Simple, clean, and it just works." },
  { name: "Rabia K.", role: "Patient", quote: "The department listing made it easy to find the right specialist quickly." },
];

export default function Testimonials() {
  return (
    <section className="testimonials-section" id="testimonials">
      <div className="section-header">
        <h2>What Our Patients Say</h2>
      </div>
      <div className="testimonials-grid">
        {TESTIMONIALS.map(t => (
          <div className="testimonial-card" key={t.name}>
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-quote">"{t.quote}"</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">{t.name[0]}</div>
              <div>
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-role">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
