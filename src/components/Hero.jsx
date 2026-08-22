import "../styles/Hero.css";
import heroBg from "../assets/images/hero-bg.jpg";

function Hero() {
  return (
    <section id="home" className="hero">
      <img className="hero-image" src={heroBg} alt="Students creating artwork at RJ Arts Academy" fetchPriority="high" decoding="async" width="1920" height="1080" />
      <div className="hero-content">

        <h1>
          Discover Your
          <span> Artistic Potential</span>
        </h1>

        <p>
          Join RJ Arts Academy and unlock your creativity through professional drawing, painting and colouring classes for all ages.
        </p>

        <div className="hero-buttons">

          <a href="#enrollment" className="primary-btn">
            Enroll Now
          </a>

          <a href="#gallery" className="secondary-btn">
            Explore Gallery
          </a>

        </div>

      </div>
    </section>
  );
}

export default Hero;