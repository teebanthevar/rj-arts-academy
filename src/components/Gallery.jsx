import { useState } from "react";
import "../styles/Gallery.css";

// Automatically import and sort all gallery images
const imageModules = import.meta.glob(
  "../assets/images/gallery/*.{jpg,jpeg,png,webp,avif}",
  {
    eager: true,
    import: "default",
  }
);

const images = Object.entries(imageModules)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, undefined, { numeric: true }))
  .map(([, image]) => image);

function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const displayedImages = showAll ? images : images.slice(0, 6);

  return (
    <section id="gallery" className="gallery" data-aos="zoom-in">
      <h2>Our Gallery</h2>

      <p className="gallery-subtitle">
        Explore our student's creativity and academy moments.
      </p>

      <div className="gallery-grid">
        {displayedImages.map((image, index) => (
          <div
            className="gallery-card"
            key={index}
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image}
              alt={`Gallery ${index + 1}`}
              loading="lazy"
              decoding="async"
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