import "./DashboardHero.css";
import { useStudent } from "../../context/StudentContext";
import { useNavigate } from "react-router-dom";

import {
  FaArrowRight,
  FaAward,
  FaFire,
  FaCalendarAlt
} from "react-icons/fa";

function DashboardHero() {
  const { student } = useStudent();
  const navigate = useNavigate();
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";

  // Use dynamic attendance from student context, fallback to "100%"
  const attendancePercentage = student?.attendance_percentage || "100%";
  const rewardPoints = student?.reward_points || "1,560";
  const membership = student?.membership || "Gold";

  return (
    <section className="dashboard-hero">
      <div className="hero-content">
        <span className="hero-tag">
          RJ Arts Academy Premium Portal
        </span>

        <h1>
          {greeting},
          <br />
          {student?.full_name || "Creative Student"} 👋
        </h1>

        <p>
          Continue your creative journey today. Complete classes, collect certificates, upload artworks and unlock exciting rewards.
        </p>

        <div className="hero-buttons">
          <button 
            className="primary-btn" 
            onClick={() => navigate("/courses")}
          >
            Continue Learning
            <FaArrowRight />
          </button>

          <button 
            className="secondary-btn" 
            onClick={() => navigate("/portfolio")}
          >
            View Portfolio
          </button>
        </div>
      </div>

      <div className="hero-right">
        <div className="glass-card">
          <FaFire className="glass-icon"/>
          <h2>{rewardPoints}</h2>
          <span>Reward Points</span>
        </div>

        <div className="glass-card">
          <FaAward className="glass-icon"/>
          <h2>{membership}</h2>
          <span>Membership</span>
        </div>

        <div className="glass-card">
          <FaCalendarAlt className="glass-icon"/>
          <h2>{attendancePercentage}</h2>
          <span>Attendance</span>
        </div>
      </div>
    </section>
  );
}

export default DashboardHero;