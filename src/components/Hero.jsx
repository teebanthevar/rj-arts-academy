import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Hero.css";
import heroBg from "../assets/images/hero-bg.jpg";
import AdPopup from "./AdPopup";

function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (e) => e.key === "Escape" && setMenuOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <section id="home" className="hero">
      <AdPopup />

      <img
        className="hero-image"
        src={heroBg}
        alt="Students creating artwork at RJ Arts Academy"
        fetchPriority="high"
        decoding="async"
        width="1920"
        height="1080"
      />
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

          <div
            className="register-wrap"
            ref={menuRef}
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setMenuOpen(true)}
              onFocus={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              Register New Events
            </button>

            {menuOpen && (
              <div className="register-menu" role="menu">
                <Link
                  to="/apply"
                  className="register-option"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  Apply for Free Art Class
                </Link>
                <Link
                  to="/spm-arts-workshop"
                  className="register-option"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  SPM Arts Workshop
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;