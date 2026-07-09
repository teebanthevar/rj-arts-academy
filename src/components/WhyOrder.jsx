import "../styles/WhyOrder.css";
import {
  FaPaintBrush,
  FaPalette,
  FaShippingFast,
  FaMedal,
  FaComments,
  FaHeart,
} from "react-icons/fa";

const reasons = [
  {
    icon: <FaPaintBrush />,
    title: "100% Handmade",
    text: "Every artwork is carefully handcrafted with attention to every detail.",
  },
  {
    icon: <FaPalette />,
    title: "Custom Designs",
    text: "Portraits, religious art, landscapes and personalised paintings made just for you.",
  },
  {
    icon: <FaShippingFast />,
    title: "Malaysia Delivery",
    text: "Secure packaging and reliable nationwide delivery for every artwork.",
  },
  {
    icon: <FaMedal />,
    title: "Premium Quality",
    text: "Professional materials that create beautiful artworks made to last.",
  },
  {
    icon: <FaComments />,
    title: "Direct Consultation",
    text: "Discuss your ideas directly with RJ Arts Academy through WhatsApp.",
  },
  {
    icon: <FaHeart />,
    title: "Customer Satisfaction",
    text: "We work closely with you until you're happy with the final masterpiece.",
  },
];

function WhyOrder() {
  return (
    <section className="why-order">
      <div className="why-order-title">
        <span>WHY CHOOSE US</span>

        <h2>Why Order Your Artwork From RJ Arts Academy?</h2>

        <p>
          Every commission is crafted with passion, creativity and professional
          quality to create artwork you'll treasure for years.
        </p>
      </div>

      <div className="why-order-grid">
        {reasons.map((item, index) => (
          <div className="why-order-card" key={index}>
            <div className="order-icon">
              {item.icon}
            </div>

            <h3>{item.title}</h3>

            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WhyOrder;