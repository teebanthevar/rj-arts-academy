import { NavLink } from "react-router-dom";

import {
  FaChartPie,
  FaUsers,
  FaPalette,
  FaBook,
  FaCalendarCheck,
  FaCertificate,
  FaMoneyBillWave,
  FaBell,
  FaBlog,
  FaCog,
} from "react-icons/fa";

import "../../styles/AdminSidebar.css";

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">

      <div className="admin-logo">

        <h2>RJ Arts</h2>

        <span>ADMIN</span>

      </div>

      <nav>

        <NavLink to="/admin">

          <FaChartPie />

          Dashboard

        </NavLink>

        <NavLink to="/admin/students">

          <FaUsers />

          Students

        </NavLink>

        <NavLink to="/admin/artworks">

          <FaPalette />

          Artworks

        </NavLink>

        <NavLink to="/admin/courses">

          <FaBook />

          Courses

        </NavLink>

        <NavLink to="/admin/attendance">

          <FaCalendarCheck />

          Attendance

        </NavLink>

        <NavLink to="/admin/certificates">

          <FaCertificate />

          Certificates

        </NavLink>

        <NavLink to="/admin/payments">

          <FaMoneyBillWave />

          Payments

        </NavLink>

        <NavLink to="/admin/subscriptions">

          <FaMoneyBillWave />

          Subscriptions

        </NavLink>

        <NavLink to="/admin/announcements">

          <FaBell />

          Announcements

        </NavLink>

        <NavLink to="/admin/blog">

          <FaBlog />

          Blog

        </NavLink>

        <NavLink to="/admin/settings">

          <FaCog />

          Settings

        </NavLink>

      </nav>

    </aside>
  );
}

export default AdminSidebar;