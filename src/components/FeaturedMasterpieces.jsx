import "../styles/FeaturedMasterpieces.css";

import masterpiece1 from "../assets/images/masterpieces/masterpiece1.jpg";
import masterpiece2 from "../assets/images/masterpieces/masterpiece2.jpg";
import masterpiece3 from "../assets/images/masterpieces/masterpiece3.jpg";
import masterpiece4 from "../assets/images/masterpieces/masterpiece4.jpg";
import masterpiece5 from "../assets/images/masterpieces/masterpiece5.jpg";
import masterpiece6 from "../assets/images/masterpieces/masterpiece6.jpg";

const masterpieces = [
  {
    title: "Divine Murugan Painting",
    image: masterpiece1,
  },
  {
    title: "Family Portrait",
    image: masterpiece2,
  },
  {
    title: "Mother & Child",
    image: masterpiece3,
  },
  {
    title: "Wildlife Art",
    image: masterpiece4,
  },
  {
    title: "Landscape paintings",
    image: masterpiece5,
  },
  {
    title: "Traditional Art",
    image: masterpiece6,
  },
];

function FeaturedMasterpieces() {
  return (
    <section
      className="featured-masterpieces"
      data-aos="fade-up"
    >
      <div className="masterpiece-heading">

        <span className="heading-line"></span>

        <p className="premium-tag">
          PREMIUM COLLECTION
        </p>

        <h2>
          Featured
          <span> Masterpieces</span>
        </h2>

        <p className="heading-description">
          Every artwork is handcrafted with passion, precision and artistic
          excellence. Discover some of our finest commissioned creations.
        </p>

      </div>

      <div className="masterpiece-grid">
        {masterpieces.map((item, index) => (
          <div className="masterpiece-card" key={index}>
            <img src={item.image} alt={item.title} />

            <div className="masterpiece-overlay">
              <h3>{item.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedMasterpieces;