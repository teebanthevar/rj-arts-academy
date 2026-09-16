import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/MerdekaGallery.css";

const AGE_CATEGORIES = [
  { key: "4-6", label: "4 – 6 Years" },
  { key: "7-12", label: "7 – 12 Years" },
  { key: "13-17", label: "13 – 17 Years" },
  { key: "18+", label: "18+ Years" },
];

const PLACEMENT_LABELS = ["1st Place", "2nd Place", "3rd Place"];

function MerdekaPublicGallery() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState(null);

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

  function getCategoryItems(catKey) {
    return submissions
      .filter((s) => s.age_category === catKey)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(0, 3);
  }

  return (
    <div className="merdeka-gallery-page">
      <Link to="/" className="merdeka-gallery-back">
        ← Back to RJ Arts Academy
      </Link>

      <section className="merdeka-gallery-hero" data-aos="fade-up">
        <span className="merdeka-gallery-eyebrow">Merdeka ke-69</span>
        <h2>Merdeka Colouring Competition Winners</h2>
        <p className="merdeka-gallery-subtitle">
          Celebrating the creativity and talent of our young and young-at-heart artists.
        </p>
      </section>

      <section className="merdeka-gallery">
        {loading ? (
          <p className="merdeka-gallery-empty">Loading submissions...</p>
        ) : (
          AGE_CATEGORIES.map((cat) => {
            const items = getCategoryItems(cat.key);

            return (
              <div className="merdeka-category-section" key={cat.key}>
                <h3 className="merdeka-category-title">{cat.label}</h3>

                {items.length === 0 ? (
                  <p className="merdeka-gallery-empty">
                    Winners coming soon for this category!
                  </p>
                ) : (
                  <div className="merdeka-gallery-grid">
                    {items.map((item, index) => (
                      <div
                        className="merdeka-gallery-card"
                        key={item.id}
                        onClick={() => setPreviewItem(item)}
                      >
                        <span className={`merdeka-badge badge-${index}`}>
                          {PLACEMENT_LABELS[index]}
                        </span>

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

                        {item.winner_name && (
                          <p className="merdeka-winner-name">
                            {item.winner_name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {previewItem && (
          <div
            className="merdeka-preview-overlay"
            onClick={() => setPreviewItem(null)}
          >
            <div
              className="merdeka-preview-content"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewItem.image_url}
                alt="Colouring competition entry"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://via.placeholder.com/600x450?text=Image+unavailable";
                }}
              />

              {previewItem.winner_name && (
                <p className="merdeka-preview-name">
                  {previewItem.winner_name}
                </p>
              )}

              <button
                className="merdeka-preview-close"
                onClick={() => setPreviewItem(null)}
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