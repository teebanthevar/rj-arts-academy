import { useState } from "react";
import "../styles/Gallery.css";

import gallery1 from "../assets/images/gallery/gallery1.jpg";
import gallery2 from "../assets/images/gallery/gallery2.jpg";
import gallery3 from "../assets/images/gallery/gallery3.jpg";
import gallery4 from "../assets/images/gallery/gallery4.jpg";
import gallery5 from "../assets/images/gallery/gallery5.jpg";
import gallery6 from "../assets/images/gallery/gallery6.jpg";

function Gallery() {
  const images = [
    gallery1,
    gallery2,
    gallery3,
    gallery4,
    gallery5,
    gallery6,
  ];

  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <section id="gallery" className="gallery" data-aos="zoom-in">
      <h2>Our Gallery</h2>

      <p className="gallery-subtitle">
        Explore our student's creativity and academy moments.
      </p>

      <div className="gallery-grid">
        {images.map((image, index) => (
          <div
            className="gallery-card"
            key={index}
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image}
              alt={`Gallery ${index + 1}`}
            />
          </div>
        ))}
      </div>

      <button className="gallery-btn">
        View More
      </button>

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