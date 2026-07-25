import { useEffect, useState } from "react";

import {
  FaUsers,
  FaPalette,
  FaMoneyBillWave,
  FaCertificate,
  FaCalendarCheck,
  FaBook,
  FaBell,
} from "react-icons/fa";

import { getDashboardStats } from "../lib/admin";
// Imported the new chart components
import StudentGrowthChart from "../components/admin/charts/StudentGrowthChart";
import RevenueChart from "../components/admin/charts/RevenueChart";

import "./AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    artworks: 0,
    revenue: 0,
    certificates: 0,
    attendance: 0,
    courses: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const data = await getDashboardStats();
    setStats(data);
  }

  const cards = [
    {
      icon: <FaUsers />,
      title: "Students",
      value: stats.students,
      color: "#0F3D2E",
    },
    {
      icon: <FaPalette />,
      title: "Artworks",
      value: stats.artworks,
      color: "#C8A96A",
    },
    {
      icon: <FaMoneyBillWave />,
      title: "Revenue",
      value: `RM ${stats.revenue}`,
      color: "#2E7D32",
    },
    {
      icon: <FaCertificate />,
      title: "Certificates",
      value: stats.certificates,
      color: "#D4AF37",
    },
    {
      icon: <FaCalendarCheck />,
      title: "Attendance",
      value: `${stats.attendance}%`,
      color: "#1565C0",
    },
    {
      icon: <FaBook />,
      title: "Courses",
      value: stats.courses,
      color: "#8E24AA",
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>👑 RJ Arts Academy Admin</h1>
          <p>Live Academy Statistics</p>
        </div>
        <button>
          <FaBell />
          Notifications
        </button>
      </div>

      <section className="admin-cards">
        {cards.map((card) => (
          <div className="admin-card" key={card.title}>
            <div
              className="admin-icon"
              style={{
                background: card.color,
              }}
            >
              {card.icon}
            </div>
            <h2>{card.value}</h2>
            <p>{card.title}</p>
          </div>
        ))}
      </section>

      {/* Analytics Grid Section */}
      <section className="analytics-grid">
        <StudentGrowthChart />
        <RevenueChart />
      </section>
    </div>
  );
}

export default AdminDashboard;