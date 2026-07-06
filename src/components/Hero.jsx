import '../styles/Hero.css';
import heroBg from "../assets/images/hero-bg.jpg";

function Hero() {
  return (
    <section
      id="home"
      className="hero"
      data-aos="fade"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 61, 46, 0.75), rgba(15, 61, 46, 0.75)), url(${heroBg})`,
      }}
    >
      <div className="hero-content">
        <h1>Discover Your Artistic Potential</h1>

        <p>
          Join RJ Arts Academy and unlock your creativity through professional
          drawing, painting and colouring classes for all ages.
        </p>

        <div className="hero-buttons">
  <a href="#enrollment" className="primary-btn">
    Enroll Now
  </a>

  <a href="#gallery" className="secondary-btn">
    View Gallery
  </a>
</div>
      </div>
    </section>
  );
}

export default Hero;