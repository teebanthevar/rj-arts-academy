import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/MerdekaGallery.css";

function MerdekaPublicGallery() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("merdeka_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="merdeka-gallery-page">
      <Link to="/" className="merdeka-gallery-back">
        ← Back to RJ Arts Academy
      </Link>

      <section className="merdeka-gallery" data-aos="fade-up">
        <h2>Merdeka Colouring Competition Entries</h2>
        <p className="merdeka-gallery-subtitle">
          Celebrating the creativity of every participant. Theme: Merdeka ke-69.
        </p>

        {loading ? (
          <p className="merdeka-gallery-empty">Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p className="merdeka-gallery-empty">
            No submissions yet. Be the first to join the competition!
          </p>
        ) : (
          <div className="merdeka-gallery-grid">
            {submissions.map((item) => (
              <div
                className="merdeka-gallery-card"
                key={item.id}
                onClick={() => setPreviewImage(item.image_url)}
              >
                <img
                  src={item.image_url}
                  alt="Colouring competition entry"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://via.placeholder.com/300x220?text=Image+unavailable";
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {previewImage && (
          <div
            className="merdeka-preview-overlay"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="merdeka-preview-content"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage}
                alt="Colouring competition entry"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://via.placeholder.com/600x450?text=Image+unavailable";
                }}
              />

              <button
                className="merdeka-preview-close"
                onClick={() => setPreviewImage(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default MerdekaPublicGallery;