import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaSearch,
  FaBars,
} from "react-icons/fa";

import { useStudent } from "../../context/StudentContext";

import "./DashboardHeader.css";

function DashboardHeader({ toggleSidebar }) {
  const today = new Date();
  const { student } = useStudent();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleNotificationClick = () => {
    alert("You have 3 new notifications!");
  };

  return (
    <header className="dashboard-header">
      <button
        className="mobile-menu-btn"
        onClick={toggleSidebar}
      >
        <FaBars />
      </button>

      <div>
        <p>
          {today.toLocaleDateString("en-MY", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="header-right">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search courses, certificates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        <button className="notification-btn" onClick={handleNotificationClick}>
          <FaBell />
          <span>3</span>
        </button>

        <div 
          className="student-profile" 
          onClick={() => navigate("/profile")} 
          style={{ cursor: "pointer" }}
        >
          <img
            src={
              student?.avatar_url ||
              "https://ui-avatars.com/api/?name=RJ+Student&background=0F3D2E&color=fff"
            }
            alt="Student"
          />

          <div>
            <h3>
              {student?.full_name || "Creative Student"}
            </h3>

            <small>
              {student?.student_id || "RJ Arts Academy"}
            </small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;