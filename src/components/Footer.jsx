import "../styles/Footer.css";
import logo from "../assets/images/logo.png";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* Logo & Academy */}
        <div className="footer-section">
          <img src={logo} alt="RJ Arts Academy" className="footer-logo" />

          <h3>RJ Arts Academy</h3>

          <p>
            Inspiring creativity and developing artistic talents through
            professional art education.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>

          <a href="#">Home</a>
          <a href="#about">About</a>
          <a href="#courses">Courses</a>
          <a href="#gallery">Gallery</a>
          <a href="#contact">Contact</a>
        </div>

        {/* Contact */}
        <div className="footer-section">

          <h3>Contact</h3>

          <p>📍 Lot 1205, Kampung Perhentian, 35800 Slim River, Perak</p>

          <p>📞 +60 12-245 1679</p>

          <p>📧 rjartsacademy@gmail.com</p>

        </div>

        {/* Social */}
        <div className="footer-section">

          <h3>Follow Us</h3>

          <a
            href="https://www.instagram.com/teeban_thevar?igsh=cGE2dnltcnJidWQx"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>

          <a
            href="https://wa.me/60122451679"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>

        </div>

      </div>

      <div className="footer-bottom">

        <p>
          © 2026 RJ Arts Academy. All Rights Reserved.
        </p>

        <button
          className="top-btn"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
        >
          ↑ Back to Top
        </button>

      </div>

    </footer>
  );
}

export default Footer;