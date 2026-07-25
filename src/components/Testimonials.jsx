import "../styles/Testimonials.css";

function Testimonials() {
  const testimonials = [
    {
      name: "A Happy Parent",
      role: "Parent",
      review:
        "RJ Arts Academy has helped my child become more confident and creative. The teachers are patient, supportive, and truly passionate about art.",
      rating: "⭐⭐⭐⭐⭐",
    },
    {
      name: "A Young Artist",
      role: "Student",
      review:
        "Every class is exciting and fun. I've learned many new drawing and painting techniques that improved my skills.",
      rating: "⭐⭐⭐⭐⭐",
    },
    {
      name: "Satisfied Parent",
      role: "Parent",
      review:
        "The academy provides a wonderful learning environment. My child always looks forward to every art class.",
      rating: "⭐⭐⭐⭐⭐",
    },
  ];

  return (
    <section
      id="testimonials"
      className="testimonials"
      data-aos="fade-up"
    >
      <div className="testimonial-heading">

        <span className="heading-tag">
          ★ Student & Parent Reviews
        </span>

        <h2>
          What Our Students
          <br />
          & Parents Say
        </h2>

        <p className="testimonial-subtitle">
          Inspiring creativity, building confidence, and nurturing young
          artists through meaningful artistic experiences.
        </p>

      </div>

      <div className="testimonial-grid">
        {testimonials.map((item, index) => (
          <div className="testimonial-card" key={index}>

            <div className="card-top"></div>

            <div className="quote">❝</div>

            <div className="stars">{item.rating}</div>

            <p className="review">{item.review}</p>

            <div className="testimonial-footer">
              <h3>{item.name}</h3>
              <span>{item.role}</span>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;