import { useRef } from "react";
import emailjs from "@emailjs/browser";
import "../styles/Contact.css";

function Contact() {

  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm(
      "service_cues4p8",
      "template_v0ckw9g",
      form.current,
      "88nQeNyVn5Msd5Bu6"
    )
    .then(() => {
      alert("Message sent successfully!");
      form.current.reset();
    })
    .catch(() => {
      alert("Failed to send message.");
    });
  };

  return (
    <section id="contact" className="contact" data-aos="fade-up">

      <h2>Contact Us</h2>

      <div className="contact-container">

        {/* LEFT SIDE */}

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

        {/* RIGHT SIDE */}

        <div>

          <form
            ref={form}
            onSubmit={sendEmail}
            className="contact-form"
          >

            <input
              type="text"
              name="from_name"
              placeholder="Your Name"
              required
            />

            <input
              type="email"
              name="from_email"
              placeholder="Your Email"
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
            />

            <textarea
              name="message"
              placeholder="Your Message"
              rows="6"
              required
            ></textarea>

            <button type="submit">
              Send Message
            </button>

          </form>

          <div className="map-section">

            <h3>Find Us</h3>

            <iframe
              src="https://www.google.com/maps?q=Lot%201205,%20Kampung%20Perhentian,%2035800%20Slim%20River,%20Perak&output=embed"
              width="100%"
              height="350"
              style={{ border: 0 }}
              loading="lazy"
              title="RJ Arts Academy"
            ></iframe>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Contact;