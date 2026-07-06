import "../styles/WhyChoose.css";

const reasons = [
  {
    title: "Professional Guidance",
    description:
      "Learn from experienced instructors who guide students from beginner to advanced levels.",
    icon: "🎨",
  },
  {
    title: "Creative Learning",
    description:
      "Develop imagination, confidence and artistic skills through fun, engaging lessons.",
    icon: "💡",
  },
  {
    title: "Competitions & Exhibitions",
    description:
      "Students are encouraged to participate in competitions and showcase their talents.",
    icon: "🏆",
  },
  {
    title: "Flexible Classes",
    description:
      "Join our classes at various locations or learn conveniently through online sessions.",
    icon: "🌍",
  },
];

function WhyChoose() {
  return (
    <section className="why-choose" id="why-choose">
      <h2>Why Choose RJ Arts Academy?</h2>

      <p className="why-subtitle">
        Inspiring creativity, building confidence and nurturing artistic talent.
      </p>

      <div className="why-grid">
        {reasons.map((reason, index) => (
          <div className="why-card" key={index}>
            <div className="why-icon">{reason.icon}</div>

            <h3>{reason.title}</h3>

            <p>{reason.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WhyChoose;