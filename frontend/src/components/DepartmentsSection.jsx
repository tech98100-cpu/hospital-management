export default function DepartmentsSection({ departments, onSelect }) {
  return (
    <section className="departments-section" id="departments">
      <div className="section-header">
        <h2>Our Departments</h2>
        <span className="section-link">View all departments</span>
      </div>
      <div className="departments-grid">
        {departments.map(dep => (
          <button className="department-card" key={dep._id} onClick={() => onSelect(dep.name)}>
            <span className="department-icon">{dep.icon}</span>
            <span className="department-name">{dep.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
