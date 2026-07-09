import { useState } from "react";
import { FaBars, FaTimes, FaUserGraduate } from "react-icons/fa";
import logo from "../assets/images/logo.png";
import "../styles/Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">

      <div className="navbar-container">

        {/* Logo */}
        <a href="#" className="logo">
          <img src={logo} alt="RJ Arts Academy" />
          <div className="logo-text">
            <h2>RJ Arts Academy</h2>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className={menuOpen ? "nav-menu active" : "nav-menu"}>

          <a href="#" onClick={closeMenu}>Home</a>

          <a href="#about" onClick={closeMenu}>About</a>

          <a href="#courses" onClick={closeMenu}>Courses</a>

          <a href="#gallery" onClick={closeMenu}>Gallery</a>

          <a href="#events" onClick={closeMenu}>Events</a>

          <a href="#faq" onClick={closeMenu}>FAQ</a>

          <a href="#contact" onClick={closeMenu}>Contact</a>

          <a
            href="#portal"
            className="student-login-btn"
            onClick={closeMenu}
          >
            <FaUserGraduate />
            <span>Student Login</span>
          </a>

        </nav>

        {/* Mobile Menu Button */}
        <div
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

      </div>

    </header>
  );
}

export default Navbar;