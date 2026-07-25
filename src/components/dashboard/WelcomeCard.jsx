import {
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";

import "./WelcomeCard.css";

function WelcomeCard() {
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";

  return (
    <section className="welcome-card">

      <div className="welcome-left">

        <span className="welcome-badge">
          ✨ RJ Arts Academy Portal
        </span>

        <h1>
          {greeting},
          <br />
          Creative Student 👋
        </h1>

        <p>
          Continue building your artistic journey,
          complete your lessons and showcase your
          masterpieces.
        </p>

        <button>
          Continue Learning
          <FaArrowRight />
        </button>

      </div>

      <div className="welcome-right">

        <div className="today-class">

          <h3>Today's Class</h3>

          <div>

            <FaCalendarAlt />

            Watercolour Landscape

          </div>

          <div>

            <FaClock />

            2:00 PM - 4:00 PM

          </div>

        </div>

      </div>

    </section>
  );
}

export default WelcomeCard;