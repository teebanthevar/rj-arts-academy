import { useNavigate } from "react-router-dom";
import { FaBell, FaBars } from "react-icons/fa";

import { useStudent } from "../../context/StudentContext";
import "./DashboardHeader.css";

function DashboardHeader({ toggleSidebar }) {
  const today = new Date();
  const { student } = useStudent();
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    alert("You have 3 new notifications!");
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={toggleSidebar}
          aria-label="Open navigation menu"
        >
          <FaBars />
        </button>

        <div className="header-date">
          <span className="header-date-label">Today</span>

          <p>
            {today.toLocaleDateString("en-MY", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="header-right">
        <button
          type="button"
          className="notification-btn"
          onClick={handleNotificationClick}
          aria-label="View notifications"
        >
          <FaBell />
          <span>3</span>
        </button>

        <button
          type="button"
          className="student-profile"
          onClick={() => navigate("/profile")}
        >
          <img
            src={
              student?.avatar_url ||
              "https://ui-avatars.com/api/?name=RJ+Student&background=0F3D2E&color=fff"
            }
            alt="Student profile"
          />

          <span className="student-profile-details">
            <strong>
              {student?.full_name || "Creative Student"}
            </strong>

            <small>
              {student?.student_id || "RJ Arts Academy"}
            </small>
          </span>
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;