import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import "../styles/Gallery.css";

// =====================================================
// STATIC IMAGES (existing, bundled at build time)
// =====================================================
const imageModules = import.meta.glob(
  "../assets/images/gallery/*.{jpg,jpeg,png,webp,avif}",
  {
    eager: true,
    import: "default",
  }
);

const staticImages = Object.entries(imageModules)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, undefined, { numeric: true }))
  .map(([path], index) => ({
    id: `static-${index}`,
    src: imageModules[path],
    isStatic: true,
  }));

function Gallery() {
  const [dynamicImages, setDynamicImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setDynamicImages(
          data.map((row) => ({
            id: row.id,
            src: row.image_url,
            isStatic: false,
          }))
        );
      }
      setLoading(false);
    };

    fetchImages();
  }, []);

  // Static images first, then newly uploaded Supabase images after
  const images = [...staticImages, ...dynamicImages];

  const displayedImages = showAll ? images : images.slice(0, 6);

  return (
    <section id="gallery" className="gallery" data-aos="zoom-in">
      <h2>Our Gallery</h2>

      <p className="gallery-subtitle">
        Explore our student's creativity and academy moments.
      </p>

      {loading ? (
        <p>Loading gallery...</p>
      ) : (
        <>
          <div className="gallery-grid">
            {displayedImages.map((image) => (
              <div
                className="gallery-card"
                key={image.id}
                onClick={() => setSelectedImage(image.src)}
              >
                <img
                  src={image.src}
                  loading="lazy"
                  decoding="async"
                  alt="Gallery"
                />
              </div>
            ))}
          </div>

          {!showAll && images.length > 6 && (
            <button
              className="gallery-btn"
              onClick={() => setShowAll(true)}
            >
              View More
            </button>
          )}
        </>
      )}

      {selectedImage && (
        <div
          className="lightbox"
          onClick={() => setSelectedImage(null)}
        >
          <span className="close-btn">&times;</span>

          <img
            src={selectedImage}
            alt="Selected artwork"
            className="lightbox-image"
          />
        </div>
      )}
    </section>
  );
}

export default Gallery;