import "../styles/AboutAcademy.css";

import {
  FaPalette,
  FaGraduationCap,
  FaLaptopCode,
  FaChartLine,
  FaBrain,
  FaHatWizard,
} from "react-icons/fa";

function AboutAcademy() {
  return (
    <section className="about-academy" id="about">

      <div className="about-header">

        <span className="about-tag">
          WHY RJ ARTS ACADEMY
        </span>

        <h2>
          One Academy.
          <br />
          <span>Unlimited Possibilities.</span>
        </h2>

        <p>
          RJ Arts Academy is more than an art school. We inspire creativity,
          academic excellence, digital innovation and personal growth through
          professional learning experiences for children, teenagers and adults.
        </p>

      </div>

      <div className="about-grid">

        <div className="academy-card">
          <div className="academy-icon">
            <FaPalette />
          </div>

          <h3>Fine Arts</h3>

          <p>
            Drawing, Painting, Sketching, Acrylic, Watercolour,
            Colouring, Portraits and Commission Artwork.
          </p>
        </div>

        <div className="academy-card">

          <div className="academy-icon">
            <FaGraduationCap />
          </div>

          <h3>Academic Tuition</h3>

          <p>
            Bahasa Melayu, English, Bahasa Tamil,
            Mathematics and Sejarah classes.
          </p>

        </div>

        <div className="academy-card">

          <div className="academy-icon">
            <FaLaptopCode />
          </div>

          <h3>Digital Skills</h3>

          <p>
            Canva Design, AI Video Creation,
            TikTok Content and Creative Editing.
          </p>

        </div>

        <div className="academy-card">

          <div className="academy-icon">
            <FaChartLine />
          </div>

          <h3>Investment Classes</h3>

          <p>
            Cryptocurrency, Stock Market,
            Forex Trading and Investment Education.
          </p>

        </div>

        <div className="academy-card">

          <div className="academy-icon">
            <FaBrain />
          </div>

          <h3>Mindful Programme</h3>

          <p>
            Meditation, Emotional Wellness,
            Autism Support and Stress Relief Sessions.
          </p>

        </div>

        <div className="academy-card">

          <div className="academy-icon">
            <FaHatWizard />
          </div>

          <h3>Magic & Mentalism</h3>

          <p>
            Stage Magic, Mentalism,
            Confidence Building and Public Speaking.
          </p>

        </div>

      </div>

      <div className="about-button">

        <a href="#courses">
          Explore All Programmes
        </a>

      </div>

    </section>
  );
}

export default AboutAcademy;