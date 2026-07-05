import '../styles/About.css';

function About() {
  return (
    <section id="about" className="about" data-aos="fade-up">

      <h2>About RJ Arts Academy</h2>

      <p className="about-text">
        RJ Arts Academy is dedicated to inspiring creativity and developing
        artistic skills in students of all ages. Our mission is to provide a
        fun, supportive, and professional environment where every student can
        discover their artistic potential.
      </p>

      <div className="about-cards">

        <div className="card">
          <h3>🎨 Professional Training</h3>
          <p>Learn drawing, painting, colouring and creative techniques from experienced instructors.</p>
        </div>

        <div className="card">
          <h3>🏆 Competitions</h3>
          <p>Participate in exciting art competitions and showcase your creativity.</p>
        </div>

        <div className="card">
          <h3>🌟 Creativity</h3>
          <p>Build confidence, imagination and artistic expression through hands-on learning.</p>
        </div>

      </div>

    </section>
  );
}

export default About;