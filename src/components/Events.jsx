import '../styles/Events.css';

function Events() {

  const events = [
    {
      title: "Watercolour Workshop",
      date: "20 August 2026",
      location: "RJ Arts Academy",
      icon: "🖌️"
    },
    {
      title: "Colouring Competition",
      date: "5 September 2026",
      location: "Sri Raja Madurai Veeran Temple",
      icon: "🎨"
    },
    {
      title: "Annual Art Exhibition",
      date: "15 October 2026",
      location: "Ipoh, Perak",
      icon: "🏆"
    }
  ];

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

            <p>📅 {event.date}</p>

            <p>📍 {event.location}</p>

            <button>Register Now</button>

          </div>

        ))}

      </div>

    </section>
  );
}

export default Events;