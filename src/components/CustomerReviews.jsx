import "../styles/CustomerReviews.css";
import { FaStar } from "react-icons/fa";

// If you have real customer photos, uncomment these and replace the paths.
// import customer1 from "../assets/images/reviews/customer1.jpg";
// import customer2 from "../assets/images/reviews/customer2.jpg";
// import customer3 from "../assets/images/reviews/customer3.jpg";

const reviews = [
  {
    name: "Priya S.",
    artwork: "Family Portrait",
    image: "https://i.pravatar.cc/150?img=32",
    review:
      "The portrait exceeded our expectations. Every detail was beautifully captured. Highly recommended!",
  },
  {
    name: "Arun K.",
    artwork: "Temple Artwork",
    image: "https://i.pravatar.cc/150?img=12",
    review:
      "Professional service from start to finish. The artwork looks absolutely stunning in our prayer room.",
  },
  {
    name: "Sarah L.",
    artwork: "Pet Portrait",
    image: "https://i.pravatar.cc/150?img=45",
    review:
      "The painting brought tears to my eyes. It perfectly captured my beloved pet's personality.",
  },
];

function CustomerReviews() {
  return (
    <section
      id="customer-reviews"
      className="customer-reviews"
      data-aos="fade-up"
    >
      <div className="review-header">
        <span>CLIENT TESTIMONIALS</span>

        <h2>What Our Customers Say</h2>

        <p>
          We are honoured to create meaningful artworks that become lifelong
          memories for our customers.
        </p>
      </div>

      <div className="review-grid">
        {reviews.map((review, index) => (
          <div className="review-card" key={index}>
            <img
              src={review.image}
              alt={review.name}
              className="review-image"
            />

            <div className="stars">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
            </div>

            <p className="review-text">
              "{review.review}"
            </p>

            <h3>{review.name}</h3>

            <span className="artwork-type">
              {review.artwork}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CustomerReviews;