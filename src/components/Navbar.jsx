import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaUserGraduate, FaChevronDown } from "react-icons/fa";
import logo from "../assets/images/logo.png";
import "../styles/Navbar.css";

function scrollToHash(hash) {
  if (!hash) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(hash.slice(1));
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [eventsDropdownOpen, setEventsDropdownOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => {
    setMenuOpen(false);
    setEventsDropdownOpen(false);
  };

  // After going to the home page from another page, scroll to the section.
  // The home page loads lazily, so keep trying until the section exists.
  useEffect(() => {
    if (location.pathname !== "/") return;

    if (!location.hash) {
      window.scrollTo(0, 0);
      return;
    }

    let tries = 0;
    const timer = setInterval(() => {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        clearInterval(timer);
      } else if (++tries > 20) {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [location.pathname, location.hash]);

  // Handles clicks on links that point to a home page section
  const goTo = (hash) => (e) => {
    closeMenu();
    const alreadyThere =
      location.pathname === "/" && (location.hash === hash || (!hash && !location.hash));
    if (alreadyThere) {
      e.preventDefault();
      scrollToHash(hash);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="logo" onClick={goTo("")}>
          <img src={logo} alt="RJ Arts Academy" />
          <div className="logo-text">
            <h2>RJ Arts Academy</h2>
          </div>
        </Link>

        {/* Desktop & Mobile Navigation */}
        <nav className={menuOpen ? "nav-menu active" : "nav-menu"}>
          <Link to="/" onClick={goTo("")}>
            Home
          </Link>
          <Link to="/#about" onClick={goTo("#about")}>
            About
          </Link>
          <Link to="/#courses" onClick={goTo("#courses")}>
            Courses
          </Link>
          <Link to="/#gallery" onClick={goTo("#gallery")}>
            Gallery
          </Link>

          <div className="nav-dropdown">
            <button
              type="button"
              className="nav-dropdown-trigger"
              onClick={() => setEventsDropdownOpen((prev) => !prev)}
            >
              Events
              <FaChevronDown className="nav-dropdown-arrow" />
            </button>

            <div
              className={
                eventsDropdownOpen
                  ? "nav-dropdown-menu open"
                  : "nav-dropdown-menu"
              }
            >
              <Link to="/#events" onClick={goTo("#events")}>
                Upcoming Events
              </Link>
              <Link to="/merdeka-gallery" onClick={closeMenu}>
                Merdeka Gallery
              </Link>
            </div>
          </div>

          <Link to="/#faq" onClick={goTo("#faq")}>
            FAQ
          </Link>
          <Link to="/#contact" onClick={goTo("#contact")}>
            Contact
          </Link>

          <Link
            to="/student-login"
            className="student-login-btn"
            onClick={closeMenu}
          >
            <FaUserGraduate />
            <span>Student Login</span>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </header>
  );
}