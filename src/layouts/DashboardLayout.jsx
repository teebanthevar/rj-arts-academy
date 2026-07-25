import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";

import {
  FaHome,
  FaPalette,
  FaBook,
  FaCalendarCheck,
  FaCertificate,
  FaCreditCard,
  FaUser,
  FaCog
} from "react-icons/fa";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import { useStudent } from "../context/StudentContext";

import "../styles/DashboardLayout.css";
import "../styles/DashboardSidebar.css";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { student } = useStudent();

  return (
    <div className="dashboard-wrapper">

      {/* ===========================
          SIDEBAR
      ============================ */}

      <aside className={`dashboard-sidebar ${sidebarOpen ? "show" : ""}`}>

        <div>

          <div className="sidebar-brand">

            <img
              src="/logo.png"
              alt="RJ Arts Academy"
            />

            <h2>RJ Arts</h2>

            <span>Student Portal</span>

          </div>

          <nav className="sidebar-nav">

            <NavLink
              to="/student-dashboard"
              onClick={() => setSidebarOpen(false)}
            >
              <FaHome />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/portfolio"
              onClick={() => setSidebarOpen(false)}
            >
              <FaPalette />
              <span>Portfolio</span>
            </NavLink>

            <NavLink
              to="/courses"
              onClick={() => setSidebarOpen(false)}
            >
              <FaBook />
              <span>Courses</span>
            </NavLink>

            <NavLink
              to="/attendance"
              onClick={() => setSidebarOpen(false)}
            >
              <FaCalendarCheck />
              <span>Attendance</span>
            </NavLink>

            <NavLink
              to="/certificates"
              onClick={() => setSidebarOpen(false)}
            >
              <FaCertificate />
              <span>Certificates</span>
            </NavLink>

            <NavLink
              to="/payments"
              onClick={() => setSidebarOpen(false)}
            >
              <FaCreditCard />
              <span>Payments</span>
            </NavLink>

            <NavLink
              to="/profile"
              onClick={() => setSidebarOpen(false)}
            >
              <FaUser />
              <span>Profile</span>
            </NavLink>

            <NavLink
              to="/settings"
              onClick={() => setSidebarOpen(false)}
            >
              <FaCog />
              <span>Settings</span>
            </NavLink>

          </nav>

        </div>

        <div className="membership-card">

          <h3>
            {student?.membership 
              ? `${student.membership.charAt(0).toUpperCase() + student.membership.slice(1)} Member` 
              : "Member"}
          </h3>

          <p>
            RJ Arts Academy Student
          </p>

        </div>

      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===========================
          MAIN
      ============================ */}

      <main className="dashboard-content">

        <DashboardHeader
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <div onClick={() => setSidebarOpen(false)}>
          <Outlet />
        </div>

      </main>

    </div>
  );
}

export default DashboardLayout;