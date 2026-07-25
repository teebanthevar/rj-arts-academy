import { useState } from "react";
import { 
  FaPaintBrush, 
  FaMedal, 
  FaUsers, 
  FaCalendarAlt, 
  FaMapMarkerAlt 
} from "react-icons/fa";
import '../styles/Events.css';

function Events() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  const events = [
    {
      title: "Watercolour Workshop",
      date: "20 August 2026",
      location: "RJ Arts Academy",
      icon: <FaPaintBrush />
    },
    {
      title: "Colouring Competition",
      date: "5 September 2026",
      location: "International Online Competition",
      icon: <FaMedal />
    },
    {
      title: "Annual Art Exhibition",
      date: "15 October 2026",
      location: "Ipoh, Perak",
      icon: <FaUsers />
    }
  ];

  function handleWhatsAppRegister(e) {
    e.preventDefault();
    if (!selectedEvent) return;

    // Replace with your actual WhatsApp phone number (with country code, e.g., 60123456789)
    const phoneNumber = "60123456789"; 

    const message = `Hello RJ Arts Academy! I would like to register for the upcoming event:\n\n*Event:* ${selectedEvent.title}\n*Date:* ${selectedEvent.date}\n\n*My Details:*\n*Name:* ${formData.name}\n*Email:* ${formData.email}\n*Phone:* ${formData.phone}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
    
    setSelectedEvent(null);
    setFormData({ name: "", email: "", phone: "" });
  }

  return (
    <section id="events" className="events" data-aos="fade-left">
      <h2>Upcoming Events</h2>
      <p className="events-subtitle">
        Join our exciting workshops, competitions and exhibitions.
      </p>

      <div className="events-grid">
        {events.map((event, index) => (
          <div className="event-card" key={index}>
            <div className="event-icon">
              {event.icon}
            </div>
            <h3>{event.title}</h3>
            <p>
              <FaCalendarAlt className="event-info-icon" /> {event.date}
            </p>
            <p>
              <FaMapMarkerAlt className="event-info-icon" /> {event.location}
            </p>
            <button onClick={() => setSelectedEvent(event)}>Register Now</button>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="modal-overlay">
          <div className="edit-profile-modal">
            <div className="modal-header">
              <h2>Register via WhatsApp</h2>
              <button onClick={() => setSelectedEvent(null)}>✕</button>
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
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setSelectedEvent(null)}>
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
    </section>
  );
}

export default Events;