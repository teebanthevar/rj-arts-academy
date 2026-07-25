import {
  FaHome,
  FaPalette,
  FaBook,
  FaCalendarAlt,
  FaCertificate,
  FaCreditCard,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";
import { useStudent } from "../context/StudentContext";

import "./DashboardSidebar.css";

function DashboardSidebar() {
  const { student } = useStudent();

  const menu = [
    {
      title: "Dashboard",
      icon: <FaHome />,
      path: "/student-dashboard",
    },
    {
      title: "My Portfolio",
      icon: <FaPalette />,
      path: "/my-portfolio",
    },
    {
      title: "Courses",
      icon: <FaBook />,
      path: "/my-courses",
    },
    {
      title: "Attendance",
      icon: <FaCalendarAlt />,
      path: "/attendance",
    },
    {
      title: "Certificates",
      icon: <FaCertificate />,
      path: "/certificates",
    },
    {
      title: "Payments",
      icon: <FaCreditCard />,
      path: "/payments",
    },
    {
      title: "Profile",
      icon: <FaUser />,
      path: "/profile",
    },
    {
      title: "Settings",
      icon: <FaCog />,
      path: "/settings",
    },
  ];

  return (
    <aside className="dashboard-sidebar">
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
          {menu.map((item) => (
            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
            >
              {item.icon}
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div>
        <div className="membership-card">
          <h3>
            {student?.membership 
              ? `${student.membership.charAt(0).toUpperCase() + student.membership.slice(1)} Member` 
              : "Member"}
          </h3>
          <p>RJ Arts Academy Student</p>
        </div>

        <button className="logout-btn" style={{ width: "100%", marginTop: "15px" }}>
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;