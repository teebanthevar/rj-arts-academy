import React from "react";
import {
  FaHome,
  FaBookOpen,
  FaUsers,
  FaChartLine,
  FaMoneyBillWave,
  FaEnvelope,
  FaBullhorn,
  FaStar,
  FaGem,
  FaCog,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "../../styles/TutorSidebar.css";

function TutorSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();

  const closeSidebar = () => {
    if (setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/teachhub"); // Redirects to TeachHub public explore page upon logout
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="tutor-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`tutor-sidebar ${sidebarOpen ? "show" : ""}`}
      >
        <button
          className="close-sidebar"
          onClick={closeSidebar}
        >
          <FaTimes />
        </button>

        {/* Brand */}
        <div className="tutor-logo">
          <div className="logo-text" style={{ paddingLeft: "4px" }}>
            <h2>TeachHub</h2>
            <p>Professional Tutor Platform</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-navigation">

          <div className="nav-group">
            <span className="nav-group-title">
              MAIN
            </span>

            <NavLink to="/tutor-dashboard" onClick={closeSidebar}>
              <FaHome />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/tutor/my-courses" onClick={closeSidebar}>
              <FaBookOpen />
              <span>My Courses</span>
            </NavLink>

            <NavLink to="/tutor/students" onClick={closeSidebar}>
              <FaUsers />
              <span>Students</span>
            </NavLink>
          </div>

          <div className="nav-group">
            <span className="nav-group-title">
              BUSINESS
            </span>

            <NavLink to="/tutor/analytics" onClick={closeSidebar}>
              <FaChartLine />
              <span>Analytics</span>
            </NavLink>

            <NavLink to="/tutor/earnings" onClick={closeSidebar}>
              <FaMoneyBillWave />
              <span>Earnings</span>
            </NavLink>

            <NavLink to="/tutor/messages" onClick={closeSidebar}>
              <FaEnvelope />
              <span>Messages</span>
            </NavLink>

            <NavLink to="/tutor/ads" onClick={closeSidebar}>
              <FaBullhorn />
              <span>Advertisements</span>
            </NavLink>

            <NavLink to="/tutor/reviews" onClick={closeSidebar}>
              <FaStar />
              <span>Reviews</span>
            </NavLink>
          </div>

          <div className="nav-group">
            <span className="nav-group-title">
              ACCOUNT
            </span>

            <NavLink to="/tutor/subscription" onClick={closeSidebar}>
              <FaGem />
              <span>Subscription</span>
            </NavLink>

            <NavLink to="/tutor/settings" onClick={closeSidebar}>
              <FaCog />
              <span>Settings</span>
            </NavLink>
          </div>

        </nav>

        {/* Bottom Section */}
        <div className="sidebar-footer">

          <div className="premium-card">
            <FaGem className="premium-icon" />

            <div>
              <h4>Premium Tutor</h4>
              <p>Unlock advanced teaching tools</p>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>

        </div>

      </aside>
    </>
  );
}

export default TutorSidebar;