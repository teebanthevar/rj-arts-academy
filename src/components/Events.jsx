import { useState } from "react";
import { 
  FaPaintBrush, 
  FaMedal, 
  FaUsers, 
  FaMapMarkerAlt,
  FaHourglassHalf,
  FaCheckCircle,
  FaCertificate,
  FaGlobe,
  FaShareAlt
} from "react-icons/fa";
import '../styles/Events.css';

function Events() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    country: "",
    state: "",
    city: "",
    agreedToTerms: false
  });
  const [shareCopied, setShareCopied] = useState(false);

  const events = [
    {
      id: "watercolour-workshop",
      title: "Watercolour Workshop",
      date: "20 August 2026",
      location: "RJ Arts Academy",
      icon: <FaPaintBrush />
    },
    {
      id: "merdeka-colouring-competition",
      title: "Colouring Competition",
      date: "Closing Date: 12 September 2026",
      location: "Online Competition",
      theme: "Theme: Merdeka ke-69",
      icon: <FaMedal />,
      premium: true,
      perks: [
        "Open for All",
        "All participants receive an E-Certificate",
        "Celebrate Merdeka through colours & creativity!"
      ]
    },
    {
      id: "annual-art-exhibition",
      title: "Annual Art Exhibition",
      date: "15 October 2026",
      location: "Ipoh, Perak",
      icon: <FaUsers />
    }
  ];

  function resetForm() {
    setFormData({
      name: "",
      email: "",
      phone: "",
      age: "",
      country: "",
      state: "",
      city: "",
      agreedToTerms: false
    });
  }

  function handleWhatsAppRegister(e) {
    e.preventDefault();
    if (!selectedEvent) return;

    if (selectedEvent.premium && !formData.agreedToTerms) {
      alert("Please agree to the Terms & Conditions before registering.");
      return;
    }

    const phoneNumber = "60122451679";

    let message = `Hello RJ Arts Academy! I would like to register for the upcoming event:\n\n*Event:* ${selectedEvent.title}\n*Date:* ${selectedEvent.date}\n\n*My Details:*\n*Name:* ${formData.name}\n*Email:* ${formData.email}\n*Phone:* ${formData.phone}`;

    if (selectedEvent.premium) {
      message += `\n*Age:* ${formData.age}\n*Country:* ${formData.country}\n*State:* ${formData.state}\n*City:* ${formData.city}`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");

    setSelectedEvent(null);
    resetForm();
  }

  async function handleShare(event, e) {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/#events?event=${event.id}`;
    const shareData = {
      title: event.title,
      text: `Join the ${event.title} at RJ Arts Academy — ${event.theme || ""} Register now!`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    } catch (err) {
      // user cancelled share or clipboard failed — no action needed
    }
  }

  return (
    <section id="events" className="events" data-aos="fade-left">
      <h2>Upcoming Events</h2>
      <p className="events-subtitle">
        Join our exciting workshops, competitions and exhibitions.
      </p>

      <div className="events-grid">
        {events.map((event, index) => (
          <div
            className={`event-card ${event.premium ? "event-card-premium" : "event-card-classic"}`}
            key={index}
          >
            {event.premium && (
              <div className="merdeka-ribbon">
                Merdeka Special
              </div>
            )}

            <div className="event-icon">
              {event.icon}
            </div>
            <h3>{event.title}</h3>

            {event.theme && (
              <p className="event-theme">
                {event.theme}
              </p>
            )}

            <p>
              <FaHourglassHalf className="event-info-icon" /> {event.date}
            </p>
            <p>
              {event.premium ? (
                <FaGlobe className="event-info-icon" />
              ) : (
                <FaMapMarkerAlt className="event-info-icon" />
              )}
              {" "}{event.location}
            </p>

            {event.perks && (
              <ul className="event-perks">
                {event.perks.map((perk, i) => (
                  <li key={i}>
                    {i === 1 ? (
                      <FaCertificate className="perk-icon" />
                    ) : (
                      <FaCheckCircle className="perk-icon" />
                    )}
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            )}

            <button onClick={() => setSelectedEvent(event)}>Register Now</button>

            {event.premium && (
              <button
                type="button"
                className="share-btn"
                onClick={(e) => handleShare(event, e)}
              >
                <FaShareAlt />
                {shareCopied ? "Link Copied!" : "Share this Event"}
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="modal-overlay">
          <div className="edit-profile-modal">
            <div className="modal-header">
              <h2>Register via WhatsApp</h2>
              <button onClick={() => { setSelectedEvent(null); resetForm(); }}>✕</button>
            </div>
            <form onSubmit={handleWhatsAppRegister}>
              <div className="modal-body">
                <div className="form-group full-width">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>

                {selectedEvent.premium && (
                  <>
                    <div className="form-group">
                      <label>Age</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="Enter your age"
                      />
                    </div>

                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        required
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="Enter your country"
                      />
                    </div>

                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="Enter your state"
                      />
                    </div>

                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Enter your city"
                      />
                    </div>

                    <div className="form-group full-width terms-group">
                      <label className="terms-label">
                        <input
                          type="checkbox"
                          checked={formData.agreedToTerms}
                          onChange={(e) =>
                            setFormData({ ...formData, agreedToTerms: e.target.checked })
                          }
                        />
                        <span>
                          I agree to the{" "}
                          <button
                            type="button"
                            className="terms-link"
                            onClick={() => setShowTerms(true)}
                          >
                            Terms &amp; Conditions
                          </button>{" "}
                          of the Merdeka Colouring Competition.
                        </span>
                      </label>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => { setSelectedEvent(null); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Send to WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTerms && (
        <div className="modal-overlay terms-modal-overlay" onClick={() => setShowTerms(false)}>
          <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Terms &amp; Conditions</h2>
              <button onClick={() => setShowTerms(false)}>✕</button>
            </div>
            <div className="terms-modal-body">
              <ul>
                <li>Open to all ages and nationalities.</li>
                <li>One entry per participant. Submissions must be original artwork.</li>
                <li>Entries must be submitted before the closing date: 12 September 2026.</li>
                <li>All participants will receive an E-Certificate upon submission.</li>
                <li>Winners will be selected based on creativity, effort and theme relevance ("Merdeka ke-69").</li>
                <li>RJ Arts Academy reserves the right to use submitted artwork for promotional purposes.</li>
                <li>Personal information collected will only be used for competition administration and certificate issuance.</li>
              </ul>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="save-btn"
                onClick={() => setShowTerms(false)}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Events;