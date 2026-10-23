import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaChevronLeft, FaChevronRight, FaDownload, FaTimes, FaPalette, FaListOl, FaGift } from "react-icons/fa";
import "./DrawingTutorials.css";

// To add a new tutorial: drop the image in /public/tutorials and add an entry here.
const tutorials = [
  {
    id: "vegetables",
    title: "Vegetable Colouring",
    level: "Beginner",
    steps: 8,
    image: "/tutorials/vegetables.png",
    blurb: "Tomato, carrots and peppers. Learn light, shadow and layering.",
  },
  {
    id: "chilli",
    title: "Chilli Colouring",
    level: "Beginner",
    steps: 8,
    image: "/tutorials/chilli.png",
    blurb: "A glossy red chilli with a fresh green calyx, step by step.",
  },
  {
    id: "brinjal",
    title: "Brinjal Colouring",
    level: "Beginner",
    steps: 8,
    image: "/tutorials/brinjal.png",
    blurb: "Rich purples, soft highlights and a leafy calyx.",
  },
];

export default function DrawingTutorials() {
  const [activeIndex, setActiveIndex] = useState(null);
  const active = activeIndex !== null ? tutorials[activeIndex] : null;

  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(
    () => setActiveIndex((i) => (i === null ? i : (i - 1 + tutorials.length) % tutorials.length)),
    []
  );
  const next = useCallback(
    () => setActiveIndex((i) => (i === null ? i : (i + 1) % tutorials.length)),
    []
  );

  // Keyboard controls + lock page scroll while the viewer is open
  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [activeIndex, close, prev, next]);

  return (
    <main className="dt-page">
      {/* ================= HERO ================= */}
      <section className="dt-hero">
        <div className="dt-hero-glow" aria-hidden="true" />
        <div className="dt-hero-inner">
          <span className="dt-eyebrow">Learn &nbsp;·&nbsp; Create &nbsp;·&nbsp; Inspire</span>
          <h1>
            Step-by-Step <span>Drawing &amp; Colouring</span>
          </h1>
          <div className="dt-divider" aria-hidden="true">
            <i /><b /><i />
          </div>
          <p>
            Follow our guided tutorials and create something beautiful,
            one small step at a time.
          </p>

          <ul className="dt-stats">
            <li>
              <FaPalette />
              <strong>{tutorials.length}</strong>
              <span>Tutorials</span>
            </li>
            <li>
              <FaListOl />
              <strong>8</strong>
              <span>Easy Steps Each</span>
            </li>
            <li>
              <FaGift />
              <strong>Free</strong>
              <span>To Download</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ================= GRID ================= */}
      <section className="dt-section">
        <div className="dt-section-head">
          <h2>Choose a Tutorial</h2>
          <p>Pick a subject, grab your colour pencils and follow along.</p>
        </div>

        <div className="dt-grid">
          {tutorials.map((t, i) => (
            <article key={t.id} className="dt-card" style={{ animationDelay: `${i * 120}ms` }}>
              <button
                className="dt-thumb"
                onClick={() => setActiveIndex(i)}
                aria-label={`Open ${t.title} tutorial`}
              >
                <img src={t.image} alt={t.title} loading="lazy" />
                <span className="dt-badge">{t.steps} Steps</span>
                <span className="dt-overlay">
                  <span>View Tutorial</span>
                </span>
              </button>

              <div className="dt-body">
                <div className="dt-meta">
                  <span className="dt-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="dt-level">{t.level}</span>
                </div>
                <h3>{t.title}</h3>
                <p>{t.blurb}</p>
                <button className="dt-link" onClick={() => setActiveIndex(i)}>
                  Start Learning <FaArrowRight />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="dt-cta">
        <div className="dt-cta-inner">
          <h2>Want to learn with a real art teacher?</h2>
          <p>Join RJ Arts Academy for professional drawing, painting and colouring classes for all ages.</p>
          <div className="dt-cta-actions">
            <Link to="/apply" className="dt-btn dt-btn-gold">Apply for Free Art Class</Link>
            <Link to="/#contact" className="dt-btn dt-btn-ghost">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* ================= VIEWER ================= */}
      {active && (
        <div className="dt-modal" onClick={close} role="dialog" aria-modal="true" aria-label={active.title}>
          <div className="dt-modal-inner" onClick={(e) => e.stopPropagation()}>
            <header className="dt-modal-head">
              <div>
                <h3>{active.title}</h3>
                <span>{activeIndex + 1} / {tutorials.length}</span>
              </div>
              <div className="dt-modal-actions">
                <a className="dt-icon-btn" href={active.image} download aria-label="Download tutorial">
                  <FaDownload />
                </a>
                <button className="dt-icon-btn" onClick={close} aria-label="Close">
                  <FaTimes />
                </button>
              </div>
            </header>

            <div className="dt-modal-img">
              <img src={active.image} alt={active.title} />
            </div>
          </div>

          <button className="dt-nav dt-nav-prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous tutorial">
            <FaChevronLeft />
          </button>
          <button className="dt-nav dt-nav-next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next tutorial">
            <FaChevronRight />
          </button>
        </div>
      )}
    </main>
  );
}