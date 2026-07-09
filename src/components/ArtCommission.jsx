import "../styles/ArtCommission.css";

import commission1 from "../assets/images/commission/commission1.jpg";
import commission2 from "../assets/images/commission/commission2.jpg";
import commission3 from "../assets/images/commission/commission3.jpg";
import commission4 from "../assets/images/commission/commission4.jpg";
import commission5 from "../assets/images/commission/commission5.jpg";
import commission6 from "../assets/images/commission/commission6.jpg";

const services = [
  {
    title: "Canvas Painting",
    image: commission1,
    description:
      "Professional pencil, charcoal and coloured portrait drawings from your favourite photos.",
    price: "From RM80",
  },
  {
    title: "Canvas Painting",
    image: commission2,
    description:
      "Beautiful acrylic and oil paintings for homes, offices and personal collections.",
    price: "From RM120",
  },
  {
    title: "Portrait Drawing",
    image: commission3,
    description:
      "Custom paintings of Hindu, Buddhist and Christian religious artworks with premium finishing.",
    price: "Custom Quote",
  },
  {
    title: "Portrait Drawing",
    image: commission4,
    description:
      "Turn your beloved pet into a beautiful handmade portrait you'll treasure forever.",
    price: "From RM100",
  },
  {
    title: "Gifted Artwork",
    image: commission5,
    description:
      "Perfect personalised gifts for birthdays, anniversaries, weddings and special occasions.",
    price: "From RM90",
  },
  {
    title: "Mural Artwork",
    image: commission6,
    description:
      "Creative wall murals for schools, restaurants, cafés, offices and commercial spaces.",
    price: "Request Quote",
  },
];

function ArtCommission() {
  const phone = "60122451679";

  return (
    <section
      className="commission"
      id="commission"
      data-aos="fade-up"
    >
      <div className="commission-header">

        <h2>Commission Your Dream Artwork</h2>

        <p>
          Looking for a unique handmade artwork?
          We create custom paintings, portraits and wall murals
          tailored to your ideas and requirements.
        </p>

      </div>

      <div className="commission-grid">

        {services.map((service, index) => {

          const message = `Hi RJ Arts Academy!

I would like to order a custom artwork.

Artwork Type:
${service.title}

Preferred Size:

Medium:

Reference Photo:

Budget:

Deadline:

Thank you.`;

          return (

            <div className="commission-card" key={index}>

              <img
                src={service.image}
                alt={service.title}
                className="commission-image"
              />

              <div className="commission-content">

                <span className="price-tag">
                  {service.price}
                </span>

                <h3>{service.title}</h3>

                <p>{service.description}</p>

                <a
                  href={`https://wa.me/${phone}?text=${encodeURIComponent(
                    message
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="order-btn"
                >
                  Order via WhatsApp
                </a>

              </div>

            </div>

          );
        })}
      </div>

      <div className="commission-footer">

        <h3>
          Every Artwork is Handcrafted Just for You
        </h3>

        <p>
          Whether it's a family portrait, religious painting,
          mural or personalised gift,
          our artists carefully create every piece with passion,
          creativity and attention to detail.
        </p>

        <a
          href={`https://wa.me/${phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="commission-main-btn"
        >
          Start Your Custom Order
        </a>

      </div>

    </section>
  );
}

export default ArtCommission;  