import { useRef } from "react";
import emailjs from "@emailjs/browser";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt
} from "react-icons/fa";
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
        {/* LEFT SIDE: Contact Info */}
        <div className="contact-info">
          <h3>RJ Arts Academy</h3>

          <p>
            <FaMapMarkerAlt className="contact-icon" /> Classes available at various locations & online
          </p>

          <p>
            <FaPhoneAlt className="contact-icon" /> +60 12-245 1679
          </p>

          <p>
            <FaEnvelope className="contact-icon" /> rjartsacademy@gmail.com
          </p>

          <a
            href="https://wa.me/60122451679"
            target="_blank"
            rel="noreferrer"
            className="whatsapp-btn"
          >
            <FaWhatsapp /> Chat on WhatsApp
          </a>

          <a
            href="https://www.instagram.com/teeban_thevar?igsh=cGE2dnltcnJidWQx"
            target="_blank"
            rel="noreferrer"
            className="instagram-btn"
          >
            <FaInstagram /> Follow us on Instagram
          </a>
        </div>

        {/* RIGHT SIDE: Email Form */}
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
        </div>
      </div>
    </section>
  );
}

export default Contact;