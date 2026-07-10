import "../styles/WhyChoose.css";

function WhyChoose() {
  const stats = [
    {
      number: "500+",
      title: "Students Trained",
      text: "Children, teenagers and adults learning with confidence.",
    },
    {
      number: "1000+",
      title: "Artworks Completed",
      text: "Portraits, paintings, murals and commissioned masterpieces.",
    },
    {
      number: "20+",
      title: "Courses & Programmes",
      text: "Art, tuition, investment, digital skills and mindfulness.",
    },
    {
      number: "99%",
      title: "Parent Satisfaction",
      text: "Trusted by families for quality education and personal growth.",
    },
  ];

  const features = [
    "Professional & Friendly Instructors",
    "Physical & Online Classes",
    "Premium Learning Environment",
    "Creative & Skill-Based Education",
    "Affordable Fees",
    "Personalised Student Guidance",
  ];

  return (
    <section id="whychoose" className="whychoose">

      <div className="why-header">

        <span className="section-tag">
          TRUSTED BY OUR COMMUNITY
        </span>

        <h2>
          Inspiring Future Success
        </h2>

        <p>
          RJ Arts Academy has helped hundreds of students discover
          their talents through professional art education,
          academic tuition and practical life skill programmes.
        </p>

      </div>

      <div className="stats-grid">

        {stats.map((item, index) => (

          <div className="stat-card" key={index}>

            <h3>{item.number}</h3>

            <h4>{item.title}</h4>

            <p>{item.text}</p>

          </div>

        ))}

      </div>

      <div className="trust-box">

        <div className="rating">

          <h3>★★★★★</h3>

          <p>Rated Excellent by Students & Parents</p>

        </div>

        <div className="feature-list">

          {features.map((item, index) => (

            <div className="feature-item" key={index}>
              ✓ {item}
            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default WhyChoose;