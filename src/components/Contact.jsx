import "../styles/Contact.css";

function Contact() {
  return (
    <section id="contact" className="contact">
      {/* Added the header back in here */}
      <h2>Contact Us</h2>
      
      <p className="contact-subtitle">
        We'd love to hear from you. Contact us anytime for art classes,
        workshops, exhibitions, or collaborations.
      </p>

      <div className="contact-container">
        {/* Left Side: Contact Info */}
        <div className="contact-info">
          <h3>RJ Arts Academy</h3>

          <p>📍 Lot 1205, Kampung Perhentian, 35800 Slim River, Perak</p>
          <p>📞 +60 12-245 1679</p>
          <p>📧 rjartsacademy@gmail.com</p>

          <a
            href="https://wa.me/60122451679"
            target="_blank"
            rel="noreferrer"
            className="whatsapp-btn"
          >
            Chat on WhatsApp
          </a>

          <a
            href="https://www.instagram.com/teeban_thevar?igsh=cGE2dnltcnJidWQx"
            target="_blank"
            rel="noreferrer"
            className="instagram-btn"
          >
            Follow us on Instagram
          </a>
        </div>

        {/* Right Side: Contact Form */}
        <form className="contact-form">
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Your Email" />
          <textarea rows="6" placeholder="Your Message"></textarea>
          <button type="submit">Send Message</button>
        </form>
      </div>
    </section>
  );
}

export default Contact;