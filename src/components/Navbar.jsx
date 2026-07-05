import { useState } from "react";
import "../styles/Navbar.css";
import logo from "../assets/images/logo.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">

      <div className="logo">
        <img src={logo} alt="RJ Arts Academy Logo" />
        <h2>RJ Arts Academy</h2>
      </div>

      {/* Desktop Navigation */}
      <nav className={menuOpen ? "nav active" : "nav"}>
        <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
        <a href="#courses" onClick={() => setMenuOpen(false)}>Courses</a>
        <a href="#gallery" onClick={() => setMenuOpen(false)}>Gallery</a>
        <a href="#events" onClick={() => setMenuOpen(false)}>Events</a>
        <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
      </nav>

      {/* Hamburger Button */}
      <div
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </div>

    </header>
  );
}

export default Navbar;