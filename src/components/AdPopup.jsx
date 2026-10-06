import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import poster from "../assets/images/free-art-class-poster.jpg";
import "../styles/AdPopup.css";

const STORAGE_KEY = "rj-free-class-ad-closed";
const DELAY_MS = 1200; // how long after the page loads the pop-up appears

export default function AdPopup() {
  const [open, setOpen] = useState(false);

  // Show the pop-up shortly after the page loads (once per browser session)
  useEffect(() => {
    let closedBefore = false;
    try {
      closedBefore = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      /* storage not available, show anyway */
    }
    if (closedBefore) return;

    const timer = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  // Close with the Esc key and stop the page behind from scrolling
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  // Render straight into <body> so no parent section or navbar can cover the pop-up
  return createPortal(
    <div className="ad-backdrop" onClick={close}>
      <div
        className="ad-box"
        role="dialog"
        aria-modal="true"
        aria-label="Free art class for B40 students"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="ad-close" aria-label="Close" onClick={close}>
          &times;
        </button>

        <Link to="/apply" onClick={close}>
          <img
            className="ad-image"
            src={poster}
            alt="Free art class application for B40 students at RJ Arts Academy"
            width="1024"
            height="1536"
          />
        </Link>

        <Link to="/apply" className="ad-cta" onClick={close}>
          Apply Now
        </Link>
      </div>
    </div>,
    document.body
  );
}